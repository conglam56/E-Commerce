import { defineConfig, devices } from '@playwright/test';

if (!process.env.E2E_BASE_URL) {
  throw new Error('Run npm run test:e2e to start the isolated application first.');
}

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  timeout: 60_000,
  globalTimeout: 300_000,
  expect: { timeout: 10_000 },
  workers: 1,
  forbidOnly: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
