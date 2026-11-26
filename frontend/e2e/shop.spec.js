import { randomBytes, randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

const admin = { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD };
let adminToken;

const authorization = (token) => ({ Authorization: `Bearer ${token}` });
const shipping = {
  receiverName: 'E2E Customer', phoneNumber: '0912345678',
  shippingAddress: 'Test address, not a delivery address', paymentMethod: 'COD',
};

async function apiData(response) {
  expect(response.ok(), `Expected a successful API response, received HTTP ${response.status()}`).toBe(true);
  const body = await response.json();
  expect(body.code).toBe(200);
  return body.data;
}

function customerDetails() {
  const password = randomBytes(18).toString('hex');
  return { fullName: 'E2E Customer', email: `${randomUUID()}@example.invalid`, password, confirmPassword: password };
}

async function createCustomer(request) {
  const customer = customerDetails();
  const { token } = await apiData(await request.post('/api/auth/register', { data: customer }));
  return { ...customer, token };
}

async function createProduct(request) {
  const { content: categories } = await apiData(await request.get('/api/categories'));
  expect(categories.length).toBeGreaterThan(0);
  return apiData(await request.post('/api/products', {
    headers: authorization(adminToken),
    data: {
      name: `E2E Product ${randomUUID()}`, price: 125000, quantity: 5,
      description: 'Product created only for this test', imageUrl: '/catalog/photo-unavailable.svg',
      categoryId: categories[0].id,
    },
  }));
}

async function createOrder(request) {
  const customer = await createCustomer(request);
  const product = await createProduct(request);
  const headers = authorization(customer.token);
  await apiData(await request.post('/api/cart/items', { headers, data: { productId: product.id, quantity: 1 } }));
  const order = await apiData(await request.post('/api/orders/checkout', { headers, data: shipping }));
  return { customer, product, order };
}

async function login(page, account) {
  await page.goto('/login');
  await page.getByLabel('Địa chỉ Email', { exact: true }).fill(account.email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Đăng xuất', exact: true })).toBeVisible();
}

test.beforeAll(async ({ request }) => {
  adminToken = (await apiData(await request.post('/api/auth/login', { data: admin }))).token;
});

test('customer registers, signs in, updates cart, places COD order and cancels it', async ({ page, request }) => {
  const customer = customerDetails();
  const product = await createProduct(request);
  await page.goto('/register');
  await page.getByLabel('Họ và tên', { exact: true }).fill(customer.fullName);
  await page.getByLabel('Địa chỉ Email', { exact: true }).fill(customer.email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(customer.password);
  await page.getByLabel('Xác nhận mật khẩu', { exact: true }).fill(customer.confirmPassword);
  await page.getByRole('button', { name: 'Đăng ký ngay', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Đăng xuất', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await login(page, customer);
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  const headers = authorization(token);

  await page.goto(`/products/${product.id}`);
  await expect(page.getByRole('heading', { name: product.name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Thêm vào giỏ hàng', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Đã thêm 1 sản phẩm vào giỏ hàng.');
  await page.getByRole('link', { name: 'Xem giỏ hàng', exact: true }).click();
  const quantity = page.getByRole('spinbutton', { name: `Số lượng ${product.name}`, exact: true });
  await quantity.fill('2');
  const update = page.waitForResponse((response) => response.request().method() === 'PUT'
    && new URL(response.url()).pathname.startsWith('/api/cart/items/'));
  await quantity.press('Tab');
  await apiData(await update);
  expect((await apiData(await request.get('/api/cart', { headers }))).items[0].quantity).toBe(2);
  await page.getByRole('button', { name: 'Tiến hành đặt hàng', exact: true }).click();
  await page.getByLabel('Họ và tên người nhận', { exact: true }).fill(shipping.receiverName);
  await page.getByLabel('Số điện thoại', { exact: true }).fill(shipping.phoneNumber);
  await page.getByLabel('Địa chỉ giao hàng', { exact: true }).fill(shipping.shippingAddress);
  await page.getByRole('radio', { name: /Thanh toán khi nhận hàng/ }).check();
  const checkout = page.waitForResponse((response) => response.request().method() === 'POST'
    && new URL(response.url()).pathname === '/api/orders/checkout');
  await page.getByRole('button', { name: 'Xác nhận đặt hàng', exact: true }).click();
  const order = await apiData(await checkout);
  await expect(page.getByRole('heading', { name: 'Đã nhận đơn hàng', exact: true })).toBeVisible();
  expect(order.totalAmount).toBe(product.price * 2);
  expect(order.paymentMethod).toBe('COD');
  expect((await apiData(await request.get('/api/cart', { headers }))).items).toEqual([]);
  expect((await apiData(await request.get(`/api/products/${product.id}`))).quantity).toBe(3);

  await page.getByRole('link', { name: 'Xem đơn hàng của tôi', exact: true }).click();
  const article = page.getByRole('article', { name: `Đơn ${order.id.slice(0, 8).toUpperCase()}`, exact: true });
  await expect(article).toContainText('Chờ xác nhận');
  await expect(article).toContainText(product.name);
  await article.getByRole('button', { name: 'Hủy đơn', exact: true }).click();
  await article.getByRole('button', { name: 'Xác nhận hủy đơn', exact: true }).click();
  await expect(article).toContainText('Đã hủy');
  await page.reload();
  await expect(article).toContainText('Đã hủy');
  expect((await apiData(await request.get(`/api/orders/${order.id}`, { headers }))).status).toBe('CANCELLED');
  expect((await apiData(await request.get(`/api/products/${product.id}`))).quantity).toBe(5);
});

test('guest is redirected from protected pages and API rejects unauthenticated access', async ({ page, request }) => {
  for (const path of ['/profile', '/cart', '/checkout', '/orders', '/admin/products', '/admin/orders']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Đăng nhập', exact: true })).toBeVisible();
  }
  for (const path of ['/api/cart', '/api/orders/my-orders', '/api/admin/orders']) {
    expect((await request.get(path)).status()).toBe(401);
  }
});

test('customer cannot enter administration or bypass API authorization', async ({ page, request }) => {
  const { customer, product, order } = await createOrder(request);
  await login(page, customer);
  await expect(page.getByRole('link', { name: 'Quản lý đơn hàng', exact: true })).toHaveCount(0);
  for (const path of ['/admin/products', '/admin/orders']) {
    await page.goto(path);
    await expect(page).toHaveURL(new URL('/', process.env.E2E_BASE_URL).href);
  }
  const headers = authorization(customer.token);
  expect((await request.get('/api/admin/orders', { headers })).status()).toBe(403);
  expect((await request.put(`/api/admin/orders/${order.id}/status`, {
    headers, data: { status: 'CONFIRMED' },
  })).status()).toBe(403);
  expect((await request.post('/api/products', {
    headers, data: { name: `Forbidden ${randomUUID()}`, price: 1, quantity: 1, categoryId: product.category.id },
  })).status()).toBe(403);
  expect((await apiData(await request.get(`/api/orders/${order.id}`, { headers }))).status).toBe('PENDING');
});

test('admin can open administration and persist an order status update', async ({ page, request }) => {
  const { customer, order } = await createOrder(request);
  await login(page, admin);
  await page.getByRole('link', { name: 'Quản lý sản phẩm', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Quản trị Sản phẩm & Tồn kho', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Quản lý đơn hàng', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Quản lý đơn hàng', exact: true })).toBeVisible();
  const shortId = order.id.slice(0, 8).toUpperCase();
  const article = page.getByRole('article', { name: `Đơn ${shortId}`, exact: true });
  await expect(article).toContainText('Chờ xác nhận');
  const update = page.waitForResponse((response) => response.request().method() === 'PUT'
    && new URL(response.url()).pathname === `/api/admin/orders/${order.id}/status`);
  await article.getByLabel(`Cập nhật đơn ${shortId}`, { exact: true }).selectOption('CONFIRMED');
  expect((await apiData(await update)).status).toBe('CONFIRMED');
  await expect(article.getByRole('combobox')).toHaveValue('CONFIRMED');
  await page.reload();
  await expect(article.getByRole('combobox')).toHaveValue('CONFIRMED');
  const stored = await apiData(await request.get(`/api/orders/${order.id}`, { headers: authorization(customer.token) }));
  expect(stored.status).toBe('CONFIRMED');
});

test('another customer cannot read or cancel someone else\'s order', async ({ page, request }) => {
  const { customer: owner, product, order } = await createOrder(request);
  const otherCustomer = await createCustomer(request);
  await login(page, otherCustomer);
  await page.getByRole('navigation', { name: 'Điều hướng chính', exact: true })
    .getByRole('link', { name: 'Đơn hàng', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bạn chưa có đơn hàng nào', exact: true })).toBeVisible();
  const headers = authorization(otherCustomer.token);
  expect((await request.get(`/api/orders/${order.id}`, { headers })).status()).toBe(403);
  expect((await request.put(`/api/orders/${order.id}/cancel`, { headers })).status()).toBe(403);
  expect(await apiData(await request.get('/api/orders/my-orders', { headers }))).toEqual([]);
  expect((await apiData(await request.get(`/api/orders/${order.id}`, {
    headers: authorization(owner.token),
  }))).status).toBe('PENDING');
  expect((await apiData(await request.get(`/api/products/${product.id}`))).quantity).toBe(4);
});
