import { randomBytes, randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

test.use({ trace: 'off' });

async function linkFromMailbox(request, email, path) {
  let link;
  await expect.poll(async () => {
    const response = await request.get(process.env.E2E_MAILBOX);
    const messages = await response.json();
    const message = messages.find(item => item.to.includes(email) && item.text.includes(path + '#'));
    link = message?.text.split('\n').find(line => line.startsWith('http'));
    return Boolean(link);
  }).toBe(true);
  expect(new URL(link).origin).toBe(process.env.E2E_BASE_URL);
  return link;
}

async function signIn(page, email, password) {
  await page.getByLabel('Địa chỉ Email', { exact: true }).fill(email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
}

test('customer verifies email and recovers account from the delivered links', async ({ page, request }) => {
  const email = randomUUID() + '@example.invalid';
  const password = randomBytes(18).toString('hex');
  const newPassword = randomBytes(18).toString('hex');
  const registration = await request.post('/api/auth/register', {
    data: { fullName: 'Recovery Customer', email, password, confirmPassword: password },
  });
  expect(registration.ok()).toBe(true);
  const headers = { Authorization: 'Bearer ' + (await registration.json()).data.token };
  const status = await request.get('/api/auth/email-status', { headers });
  expect((await status.json()).data).toEqual({ verified: false, mailAvailable: true });

  await page.goto(await linkFromMailbox(request, email, '/verify-email'));
  await expect(page).toHaveURL(/\/login$/);
  await signIn(page, email, password);
  await page.getByRole('button', { name: 'Xác minh email', exact: true }).click();
  await expect(page.getByText('Đã xác minh email.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Về hồ sơ' }).click();
  await expect(page.getByText('Email đã xác minh', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();

  for (const address of [randomUUID() + '@example.invalid', email]) {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Quên mật khẩu?' }).click();
    await page.getByLabel('Email tài khoản').fill(address);
    await page.getByRole('button', { name: 'Gửi liên kết' }).click();
    await expect(page.getByText('Nếu địa chỉ này đã được xác minh, bạn sẽ nhận được thư đặt lại mật khẩu.')).toBeVisible();
  }

  const link = await linkFromMailbox(request, email, '/reset-password');
  await page.goto(link);
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill(newPassword);
  await page.getByLabel('Xác nhận mật khẩu mới', { exact: true }).fill(newPassword);
  await page.getByRole('button', { name: 'Đặt lại mật khẩu' }).click();
  await expect(page.getByText('Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.')).toBeVisible();
  expect((await request.get('/api/cart', { headers })).status()).toBe(401);

  await page.goto('/login');
  await signIn(page, email, password);
  await expect(page.getByRole('alert')).toBeVisible();
  await signIn(page, email, newPassword);
  await expect(page.getByRole('button', { name: 'Đăng xuất', exact: true })).toBeVisible();
});
