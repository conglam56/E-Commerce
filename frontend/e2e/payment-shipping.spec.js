import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

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
}

const headers = token => ({ Authorization: 'Bearer ' + token });

function signed(parameters) {
  const query = new URLSearchParams(parameters);
  query.sort();
  query.set('vnp_SecureHash', createHmac('sha512', process.env.E2E_VNPAY_SECRET).update(query.toString()).digest('hex'));
  return query;
}

test('VNPay callback confirms payment once and admin shipment is visible to its customer', async ({ page, request, browser }) => {
  const admin = { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD };
  const adminToken = (await data(await request.post('/api/auth/login', { data: admin }))).token;
  const { content: categories } = await data(await request.get('/api/categories'));
  const product = await data(await request.post('/api/products', { headers: headers(adminToken), data: {
    name: 'Payment Product ' + randomUUID(), price: 100000, quantity: 3, categoryId: categories[0].id,
    description: 'Disposable sandbox test product', imageUrl: '/catalog/photo-unavailable.svg',
  } }));
  const password = randomBytes(18).toString('hex');
  const customer = { fullName: 'Payment Customer', email: randomUUID() + '@example.invalid', password, confirmPassword: password };
  const token = (await data(await request.post('/api/auth/register', { data: customer }))).token;
  await data(await request.post('/api/cart/items', { headers: headers(token), data: { productId: product.id, quantity: 1 } }));
  await login(page, customer);
  await page.goto('/checkout');
  await page.getByLabel('Họ và tên người nhận', { exact: true }).fill('Payment Customer');
  await page.getByLabel('Số điện thoại', { exact: true }).fill('0912345678');
  await page.getByLabel('Địa chỉ giao hàng', { exact: true }).fill('Sandbox delivery address');
  await page.getByRole('radio', { name: /VNPay Sandbox/ }).check();
  const checkout = page.waitForResponse(response => response.request().method() === 'POST'
    && new URL(response.url()).pathname === '/api/orders/checkout');
  await page.getByRole('button', { name: 'Xác nhận đặt hàng', exact: true }).click();
  const order = await data(await checkout);
  await expect(page.getByRole('button', { name: 'Thanh toán VNPay Sandbox' })).toBeVisible();

  const link = new URL(await data(await request.post('/api/payments/vnpay/' + order.id, { headers: headers(token) })));
  expect(link.origin).toBe('https://sandbox.vnpayment.vn');
  const generatedSignature = link.searchParams.get('vnp_SecureHash');
  link.searchParams.delete('vnp_SecureHash');
  expect(generatedSignature).toBe(createHmac('sha512', process.env.E2E_VNPAY_SECRET).update(link.searchParams.toString()).digest('hex'));
  expect(link.searchParams.get('vnp_Amount')).toBe('10000000');
  expect(link.searchParams.get('vnp_ReturnUrl')).toBe(process.env.E2E_BASE_URL + '/orders');

  await page.goto('/orders?vnp_ResponseCode=00');
  const customerOrder = page.getByRole('article', { name: 'Đơn ' + order.id.slice(0, 8).toUpperCase(), exact: true });
  await expect(customerOrder.getByText('Chờ thanh toán', { exact: true })).toBeVisible();
  const shipment = { carrier: 'Sandbox Carrier', trackingNumber: 'TEST-12345' };
  expect((await request.put('/api/admin/orders/' + order.id + '/shipment', { headers: headers(token), data: shipment })).status()).toBe(403);

  const notification = {
    vnp_TmnCode: 'E2ETEST1', vnp_TxnRef: order.id.replaceAll('-', ''), vnp_Amount: '10000000',
    vnp_ResponseCode: '00', vnp_TransactionStatus: '00', vnp_TransactionNo: Date.now().toString(),
    vnp_PayDate: link.searchParams.get('vnp_CreateDate'),
  };
  const ipn = '/api/payments/vnpay/ipn?';
  expect((await (await request.get(ipn + new URLSearchParams(notification))).json()).RspCode).toBe('97');
  expect((await (await request.get(ipn + signed({ ...notification, vnp_Amount: '1' }))).json()).RspCode).toBe('04');
  const responses = await Promise.all([request.get(ipn + signed(notification)), request.get(ipn + signed(notification))]);
  const codes = await Promise.all(responses.map(async response => (await response.json()).RspCode));
  expect(codes.sort()).toEqual(['00', '02']);
  expect((await data(await request.get('/api/products/' + product.id))).quantity).toBe(2);
  await page.getByRole('button', { name: 'Làm mới', exact: true }).click();
  await expect(customerOrder.getByText('Đã thanh toán', { exact: true })).toBeVisible();
  await expect(customerOrder.getByRole('button', { name: 'Hủy đơn', exact: true })).toHaveCount(0);

  const adminContext = await browser.newContext();
  try {
    const adminPage = await adminContext.newPage();
    await login(adminPage, admin);
    await adminPage.goto('/admin/orders');
    const adminOrder = adminPage.getByRole('article', { name: 'Đơn ' + order.id.slice(0, 8).toUpperCase(), exact: true });
    await adminOrder.getByLabel('Hãng vận chuyển', { exact: true }).fill(shipment.carrier);
    await adminOrder.getByLabel('Mã vận đơn', { exact: true }).fill(shipment.trackingNumber);
    await adminOrder.getByRole('button', { name: 'Lưu vận đơn' }).click();
    await expect(adminPage.getByRole('status')).toContainText('Đã lưu vận đơn.');
    await adminOrder.getByRole('combobox').selectOption('SHIPPED');
    await expect(adminOrder).toContainText('Đang giao hàng');
  } finally {
    await adminContext.close();
  }
  await page.getByRole('button', { name: 'Làm mới', exact: true }).click();
  await expect(customerOrder).toContainText('Vận đơn Sandbox Carrier · TEST-12345');
  await expect(customerOrder).toContainText('Đang giao hàng');
});
