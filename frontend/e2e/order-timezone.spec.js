import { randomBytes, randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

test.use({ timezoneId: 'America/Los_Angeles' });

async function data(response) {
  expect(response.ok()).toBe(true);
  return (await response.json()).data;
}

async function login(page, account) {
  await page.goto('/login');
  await page.getByLabel('Địa chỉ Email', { exact: true }).fill(account.email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Đăng xuất', exact: true })).toBeVisible();
  await expect(page).toHaveURL(new URL('/', process.env.E2E_BASE_URL).href);
}

test('order creation and history display the same Vietnam time in a different browser timezone', async ({ page, request }) => {
  const admin = { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD };
  const adminToken = (await data(await request.post('/api/auth/login', { data: admin }))).token;
  const password = randomBytes(18).toString('hex');
  const customer = { fullName: 'Timezone Customer', email: randomUUID() + '@example.invalid', password, confirmPassword: password };
  const customerToken = (await data(await request.post('/api/auth/register', { data: customer }))).token;
  const authorization = { Authorization: 'Bearer ' + customerToken };
  const { content: products } = await data(await request.get('/api/products'));
  const product = products.find(item => item.quantity > 0);
  expect(product).toBeTruthy();
  await data(await request.post('/api/cart/items', { headers: authorization, data: { productId: product.id, quantity: 1 } }));
  const order = await data(await request.post('/api/orders/checkout', { headers: authorization, data: {
    receiverName: 'Timezone Customer', phoneNumber: '0912345678', shippingAddress: 'Test timezone address', paymentMethod: 'COD',
  } }));
  expect(order.createdAt).toMatch(/(?:Z|[+-]\d{2}:\d{2})$/);
  expect(order.updatedAt).toMatch(/(?:Z|[+-]\d{2}:\d{2})$/);
  const history = await data(await request.get('/api/admin/orders/' + order.id + '/history', {
    headers: { Authorization: 'Bearer ' + adminToken },
  }));
  expect(history.totalElements).toBe(1);
  expect(Math.abs(Date.parse(order.createdAt) - Date.parse(history.content[0].changedAt))).toBeLessThan(5000);
  const expected = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(order.createdAt));
  const label = 'Đơn ' + order.id.slice(0, 8).toUpperCase();

  await login(page, admin);
  await page.goto('/admin/orders');
  const adminOrder = page.getByRole('article', { name: label, exact: true });
  await expect(adminOrder.getByText(expected, { exact: true })).toBeVisible();
  await adminOrder.getByText('Lịch sử trạng thái', { exact: true }).click();
  await expect(adminOrder.locator('time')).toHaveText(expected);

  await login(page, customer);
  await page.goto('/orders');
  await expect(page.getByRole('article', { name: label, exact: true }).getByText(expected, { exact: true })).toBeVisible();
});
