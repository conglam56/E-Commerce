-- Insert Categories
INSERT INTO category (id, name, slug, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Điện thoại', 'dien-thoai', 'ACTIVE'),
('22222222-2222-2222-2222-222222222222', 'Laptop', 'laptop', 'ACTIVE'),
('33333333-3333-3333-3333-333333333333', 'Máy tính bảng', 'may-tinh-bang', 'ACTIVE');

-- Insert Products for Điện thoại
INSERT INTO product (id, name, quantity, description, image_url, category_id, price, status) VALUES
(gen_random_uuid(), 'iPhone 15 Pro Max', 100, 'Apple iPhone 15 Pro Max 256GB', 'iphone-15.jpg', '11111111-1111-1111-1111-111111111111', 30000000, 'ACTIVE'),
(gen_random_uuid(), 'Samsung Galaxy S24 Ultra', 50, 'Samsung Galaxy S24 Ultra 256GB AI', 's24-ultra.jpg', '11111111-1111-1111-1111-111111111111', 28000000, 'ACTIVE'),
(gen_random_uuid(), 'Xiaomi 14 Pro', 120, 'Xiaomi 14 Pro Leica', 'xiaomi-14.jpg', '11111111-1111-1111-1111-111111111111', 20000000, 'ACTIVE'),
(gen_random_uuid(), 'Oppo Find X7', 40, 'Oppo Find X7 Hasselblad', 'oppo-find.jpg', '11111111-1111-1111-1111-111111111111', 19000000, 'ACTIVE'),
(gen_random_uuid(), 'iPhone 14', 80, 'Apple iPhone 14 128GB', 'iphone-14.jpg', '11111111-1111-1111-1111-111111111111', 18000000, 'ACTIVE');

-- Insert Products for Laptop
INSERT INTO product (id, name, quantity, description, image_url, category_id, price, status) VALUES
(gen_random_uuid(), 'MacBook Pro 14 M3', 30, 'Apple MacBook Pro 14 inch M3 Pro', 'macbook-m3.jpg', '22222222-2222-2222-2222-222222222222', 45000000, 'ACTIVE'),
(gen_random_uuid(), 'ThinkPad X1 Carbon', 20, 'Lenovo ThinkPad X1 Carbon Gen 11', 'thinkpad-x1.jpg', '22222222-2222-2222-2222-222222222222', 40000000, 'ACTIVE'),
(gen_random_uuid(), 'Dell XPS 13', 25, 'Dell XPS 13 Plus 2024', 'dell-xps.jpg', '22222222-2222-2222-2222-222222222222', 38000000, 'ACTIVE'),
(gen_random_uuid(), 'Asus ROG Strix', 15, 'Asus ROG Strix G15 Gaming', 'asus-rog.jpg', '22222222-2222-2222-2222-222222222222', 35000000, 'ACTIVE');

-- Insert Products for Máy tính bảng
INSERT INTO product (id, name, quantity, description, image_url, category_id, price, status) VALUES
(gen_random_uuid(), 'iPad Pro 11 M2', 60, 'Apple iPad Pro 11 inch M2', 'ipad-pro.jpg', '33333333-3333-3333-3333-333333333333', 22000000, 'ACTIVE'),
(gen_random_uuid(), 'Galaxy Tab S9', 40, 'Samsung Galaxy Tab S9 5G', 'tab-s9.jpg', '33333333-3333-3333-3333-333333333333', 18000000, 'ACTIVE');
