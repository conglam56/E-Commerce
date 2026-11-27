import { spawn } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { createServer } from 'node:net';
import { once } from 'node:events';

const require = createRequire(import.meta.url);
const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectDir = resolve(frontendDir, '..');
const projectName = `ecommerce-e2e-${randomUUID().slice(0, 8)}`;
const controller = new AbortController();
const environment = {
  ...process.env,
  E2E_DB_PASSWORD: randomBytes(24).toString('hex'),
  E2E_JWT_SECRET: randomBytes(48).toString('base64'),
  E2E_VNPAY_SECRET: randomBytes(32).toString('hex'),
  E2E_ADMIN_EMAIL: `${projectName}@example.invalid`,
  E2E_ADMIN_PASSWORD: randomBytes(24).toString('hex'),
};
const composeArgs = ['compose', '--project-name', projectName, '--file', 'compose.e2e.yml'];

process.once('SIGINT', () => controller.abort());
process.once('SIGTERM', () => controller.abort());

function run(command, args, { capture = false, cleanup = false } = {}) {
  return new Promise((resolveCommand, reject) => {
    const child = spawn(command, args, {
      cwd: command === process.execPath ? frontendDir : projectDir,
      env: environment,
      windowsHide: true,
      signal: cleanup ? undefined : controller.signal,
      stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    });
    let output = '';
    if (capture) child.stdout.on('data', (chunk) => { output += chunk; });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) resolveCommand(output.trim());
      else reject(new Error(`${command} ${args.join(' ')} failed (${signal || code}).`));
    });
  });
}

async function publishedPort(service, port) {
  const address = await run('docker', [...composeArgs, 'port', service, String(port)], { capture: true });
  const published = Number(address.split(':').at(-1));
  if (!Number.isInteger(published) || published < 1) throw new Error(`Invalid ${service} port: ${address}`);
  return published;
}

async function waitForApplication(baseURL) {
  let lastFailure = 'Application did not respond';
  for (let attempt = 0; attempt < 120; attempt++) {
    controller.signal.throwIfAborted();
    try {
      const response = await fetch(`${baseURL}/api/products`, { signal: AbortSignal.timeout(3000) });
      if (response.ok && (await response.json()).code === 200) return;
      lastFailure = `HTTP ${response.status}`;
    } catch (error) {
      lastFailure = error.message;
    }
    await delay(1000, undefined, { signal: controller.signal });
  }
  throw new Error(`Application did not become ready: ${lastFailure}`);
}

async function createAdmin(baseURL, databasePort) {
  const response = await fetch(`${baseURL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'E2E Admin',
      email: environment.E2E_ADMIN_EMAIL,
      password: environment.E2E_ADMIN_PASSWORD,
      confirmPassword: environment.E2E_ADMIN_PASSWORD,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok || (await response.json()).code !== 200) throw new Error('Could not register E2E admin.');

  const database = new pg.Client({
    host: '127.0.0.1', port: databasePort, database: 'ecommerce_e2e',
    user: 'e2e', password: environment.E2E_DB_PASSWORD,
    connectionTimeoutMillis: 10_000,
  });
  await database.connect();
  try {
    const result = await database.query('UPDATE users SET role = $1 WHERE email = $2',
      ['ADMIN', environment.E2E_ADMIN_EMAIL]);
    if (result.rowCount !== 1) throw new Error('E2E admin promotion must update exactly one account.');
  } finally {
    await database.end();
  }
}

async function main() {
  const portProbe = createServer().listen(0, '127.0.0.1');
  await once(portProbe, 'listening');
  environment.E2E_APP_PORT = String(portProbe.address().port);
  await new Promise(resolve => portProbe.close(resolve));
  let failed = true;
  try {
    console.log(`Starting isolated stack ${projectName}...`);
    await run('docker', [...composeArgs, 'up', '--detach', '--build']);
    const appPort = await publishedPort('app', 8080);
    const databasePort = await publishedPort('postgres', 5432);
    environment.E2E_BASE_URL = `http://127.0.0.1:${appPort}`;
    environment.E2E_MAILBOX = `http://127.0.0.1:${await publishedPort('mailbox', 8025)}`;
    await waitForApplication(environment.E2E_BASE_URL);
    await createAdmin(environment.E2E_BASE_URL, databasePort);
    await run(process.execPath, [require.resolve('@playwright/test/cli'), 'test', ...process.argv.slice(2)]);
    failed = false;
  } finally {
    try {
      if (failed) await run('docker', [...composeArgs, 'logs', '--no-color', '--tail', '100'], { cleanup: true });
    } finally {
      await run('docker', [...composeArgs, 'down'], { cleanup: true });
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
