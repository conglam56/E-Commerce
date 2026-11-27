import { randomBytes, randomUUID, createHmac } from 'node:crypto';
import { test, expect } from '@playwright/test';

const headers = token => ({ Authorization: 'Bearer ' + token });

async function data(response) {
  expect(response.ok()).toBe(true);
  return (await response.json()).data;
}

async function setup(request) {
  const admin = { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD };
  const adminToken = (await data(await request.post('/api/auth/login', { data: admin }))).token;
  const password = randomBytes(18).toString('hex');
  const customer = { fullName: 'Operations Customer', email: randomUUID() + '@example.invalid', password, confirmPassword: password };
  const customerToken = (await data(await request.post('/api/auth/register', { data: customer }))).token;
  const { content: categories } = await data(await request.get('/api/categories'));
  const product = await data(await request.post('/api/products', { headers: headers(adminToken), data: {
    name: 'Operations Product ' + randomUUID(), price: 100000, quantity: 6, categoryId: categories[0].id,
    description: 'Disposable operations test product', imageUrl: '/catalog/photo-unavailable.svg',
  } }));
  return { admin, adminToken, customer, customerToken, product };
}

async function order(request, fixture, method = 'COD') {
  const authorization = headers(fixture.customerToken);
  await data(await request.post('/api/cart/items', { headers: authorization, data: { productId: fixture.product.id, quantity: 1 } }));
  return data(await request.post('/api/orders/checkout', { headers: authorization, data: {
    receiverName: 'Operations Customer', phoneNumber: '0912345678',
    shippingAddress: 'Test delivery address', paymentMethod: method,
  } }));
}

async function login(page, account) {
  await page.goto('/login');
  await page.getByLabel('Địa chỉ Email', { exact: true }).fill(account.email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Đăng xuất', exact: true })).toBeVisible();
}

test('admin sees delivered revenue, low stock, history and a usable mobile dashboard', async ({ page, request }) => {
  const fixture = await setup(request);
  const authorization = headers(fixture.adminToken);
  const baseline = await data(await request.get('/api/admin/operations', { headers: authorization }));
  const delivered = await order(request, fixture);
  const pending = await order(request, fixture);
  const cancelled = await order(request, fixture);
  for (const status of ['CONFIRMED', 'SHIPPED', 'DELIVERED', 'DELIVERED']) {
    await data(await request.put('/api/admin/orders/' + delivered.id + '/status', { headers: authorization, data: { status } }));
  }
  await data(await request.put('/api/orders/' + cancelled.id + '/cancel', { headers: headers(fixture.customerToken) }));
  const report = await data(await request.get('/api/admin/operations', { headers: authorization }));
  expect(report.deliveredRevenue).toBe(baseline.deliveredRevenue + delivered.totalAmount);
  expect(report.deliveredOrders).toBe(baseline.deliveredOrders + 1);
  expect(report.lowStockProducts).toBe(baseline.lowStockProducts + 1);
  const history = await data(await request.get('/api/admin/orders/' + delivered.id + '/history', { headers: authorization }));
  expect(history.totalElements).toBe(4);
  expect(history.content.map(item => item.toStatus)).toEqual(['DELIVERED', 'SHIPPED', 'CONFIRMED', 'PENDING']);
  const cancelledHistory = await data(await request.get('/api/admin/orders/' + cancelled.id + '/history', { headers: authorization }));
  expect(cancelledHistory.content.map(item => item.toStatus)).toEqual(['CANCELLED', 'PENDING']);

  await login(page, fixture.admin);
  await page.getByRole('link', { name: 'Tổng quan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tổng quan cửa hàng', exact: true })).toBeVisible();
  const revenue = page.locator('dl > div').filter({ has: page.getByText('Doanh thu đơn đã giao', { exact: true }) });
  await expect(revenue).toContainText(new Intl.NumberFormat('vi-VN').format(report.deliveredRevenue) + ' ₫');
  const stockRow = page.getByRole('row').filter({ hasText: fixture.product.name });
  await expect(stockRow.getByRole('cell').last()).toHaveText('4');
  await page.setViewportSize({ width: 360, height: 780 });
  await expect(page.getByRole('heading', { name: 'Tổng quan cửa hàng', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 720 });

  await page.getByRole('navigation', { name: 'Điều hướng chính', exact: true })
    .getByRole('link', { name: 'Quản lý đơn hàng', exact: true }).click();
  const article = page.getByRole('article', { name: 'Đơn ' + delivered.id.slice(0, 8).toUpperCase(), exact: true });
  await article.getByText('Lịch sử trạng thái', { exact: true }).click();
  await expect(article).toContainText('Đang giao hàng → Đã giao hàng');
  await expect(article).toContainText('Tạo đơn → Chờ xác nhận');
  expect((await data(await request.get('/api/orders/' + pending.id, { headers: headers(fixture.customerToken) }))).status).toBe('PENDING');
});

test('admin operations and history enforce server permissions and validate pagination', async ({ page, request }) => {
  const fixture = await setup(request);
  const created = await order(request, fixture);
  const paths = ['/api/admin/operations', '/api/admin/operations/low-stock', '/api/admin/orders/' + created.id + '/history'];
  for (const path of paths) {
    expect((await request.get(path)).status()).toBe(401);
    expect((await request.get(path, { headers: headers(fixture.customerToken) })).status()).toBe(403);
  }
  for (const query of ['page=-1', 'size=0', 'size=101']) {
    expect((await request.get('/api/admin/operations/low-stock?' + query, { headers: headers(fixture.adminToken) })).status()).toBe(400);
  }
  expect((await request.get('/api/admin/orders/' + randomUUID() + '/history', { headers: headers(fixture.adminToken) })).status()).toBe(404);
  await login(page, fixture.customer);
  await expect(page.getByRole('link', { name: 'Tổng quan', exact: true })).toHaveCount(0);
  await page.goto('/admin');
  await expect(page).toHaveURL(new URL('/', process.env.E2E_BASE_URL).href);
});

test('VNPay system confirmation is captured once in order history', async ({ request }) => {
  const fixture = await setup(request);
  const created = await order(request, fixture, 'VNPAY');
  const url = new URL(await data(await request.post('/api/payments/vnpay/' + created.id, { headers: headers(fixture.customerToken) })));
  const query = new URLSearchParams({
    vnp_TmnCode: 'E2ETEST1', vnp_TxnRef: created.id.replaceAll('-', ''), vnp_Amount: '10000000',
    vnp_ResponseCode: '00', vnp_TransactionStatus: '00',
    vnp_TransactionNo: Date.now().toString(), vnp_PayDate: url.searchParams.get('vnp_CreateDate'),
  });
  query.sort();
  query.set('vnp_SecureHash', createHmac('sha512', process.env.E2E_VNPAY_SECRET).update(query.toString()).digest('hex'));
  expect((await (await request.get('/api/payments/vnpay/ipn?' + query)).json()).RspCode).toBe('00');
  expect((await (await request.get('/api/payments/vnpay/ipn?' + query)).json()).RspCode).toBe('02');
  const history = await data(await request.get('/api/admin/orders/' + created.id + '/history', { headers: headers(fixture.adminToken) }));
  expect(history.totalElements).toBe(2);
  expect(history.content[0].fromStatus).toBe('PENDING');
  expect(history.content[0].toStatus).toBe('CONFIRMED');
});
