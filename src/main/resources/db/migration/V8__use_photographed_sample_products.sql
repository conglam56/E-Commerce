-- Retire the illustrated demo items while keeping their IDs for existing carts and orders.
UPDATE product
SET status = 'DELETED', quantity = 0, version = version + 1
WHERE status <> 'DELETED' AND (name, image_url) IN (
    ('Điện thoại Nova 5G 128 GB', '/catalog/nova-5g.svg'),
    ('Điện thoại Nova Plus 256 GB', '/catalog/nova-plus.svg'),
    ('Laptop Atlas 14', '/catalog/atlas-14.svg'),
    ('Laptop Atlas 16', '/catalog/atlas-16.svg'),
    ('Máy tính bảng Slate 11', '/catalog/slate-11.svg'),
    ('Máy tính bảng Slate Mini 8', '/catalog/slate-mini.svg'),
    ('Tai nghe chụp tai Studio H1', '/catalog/studio-h1.svg'),
    ('Tai nghe không dây Pocket B2', '/catalog/pocket-b2.svg'),
    ('Màn hình View 24', '/catalog/view-24.svg'),
    ('Màn hình View 27', '/catalog/view-27.svg'),
    ('Bàn phím cơ Type 75', '/catalog/type-75.svg'),
    ('Chuột không dây Point M2', '/catalog/point-m2.svg')
);

INSERT INTO product (id, name, quantity, description, image_url, category_id, price, status)
SELECT gen_random_uuid(), sample.name, sample.quantity, sample.description,
       '/catalog/photos/' || sample.photo || '.webp', category.id, sample.price, 'ACTIVE'
FROM (VALUES
    ('dien-thoai', 'Google Pixel 7', 24, 'Điện thoại Google Pixel dùng Android, có camera góc rộng và siêu rộng.', 'google-pixel-7', 5490000),
    ('dien-thoai', 'iPhone 13', 15, 'Điện thoại Apple với màn hình Super Retina XDR và camera kép.', 'iphone-13', 8490000),
    ('laptop', 'MacBook Air M2', 18, 'Laptop Apple dòng Air dùng chip M2, tiện mang theo khi đi làm hoặc đi học.', 'macbook-air-m2', 17990000),
    ('laptop', 'MacBook Air M1', 8, 'Laptop Apple dòng Air dùng chip M1, phù hợp với tác vụ văn phòng.', 'macbook-air-m1', 12990000),
    ('may-tinh-bang', 'iPad Air 5', 21, 'Máy tính bảng iPad Air thế hệ 5 dùng chip M1.', 'ipad-air-5', 9790000),
    ('may-tinh-bang', 'iPad mini 6', 12, 'Máy tính bảng iPad mini thế hệ 6, gọn để đọc và ghi chú.', 'ipad-mini-6', 8990000),
    ('tai-nghe', 'Sony WH-1000XM3', 16, 'Tai nghe chụp tai Bluetooth có chống ồn chủ động.', 'sony-wh-1000xm3', 2990000),
    ('tai-nghe', 'AirPods Pro 2', 26, 'Tai nghe nhét tai Apple thế hệ 2 kèm hộp sạc.', 'airpods-pro-2', 4490000),
    ('man-hinh', 'Dell UltraSharp U3415W', 13, 'Màn hình cong dòng UltraSharp với tỉ lệ siêu rộng.', 'dell-u3415w', 6790000),
    ('man-hinh', 'EIZO ColorEdge CG277', 6, 'Màn hình ColorEdge 27 inch dành cho công việc cần kiểm soát màu sắc.', 'eizo-cg277', 14990000),
    ('ban-phim-chuot', 'Keychron K8', 19, 'Bàn phím cơ bố cục tenkeyless, kết nối Bluetooth hoặc có dây.', 'keychron-k8', 1590000),
    ('ban-phim-chuot', 'Logitech MX Master 3S', 35, 'Chuột không dây công thái học với nút bấm êm và hai bánh cuộn.', 'logitech-mx-master-3s', 2190000)
) AS sample(category_slug, name, quantity, description, photo, price)
JOIN category ON category.slug = sample.category_slug
ON CONFLICT (name) DO NOTHING;

-- Only replace the original image references from V3.
UPDATE product
SET image_url = '/catalog/photos/' || sample.photo || '.webp', version = version + 1
FROM (VALUES
    ('iPhone 15 Pro Max', 'iphone-15.jpg', 'iphone-15-pro-max'),
    ('Samsung Galaxy S24 Ultra', 's24-ultra.jpg', 'galaxy-s24-ultra'),
    ('Xiaomi 14 Pro', 'xiaomi-14.jpg', 'xiaomi-14-pro'),
    ('iPhone 14', 'iphone-14.jpg', 'iphone-14'),
    ('MacBook Pro 14 M3', 'macbook-m3.jpg', 'macbook-pro-14-m3'),
    ('Asus ROG Strix', 'asus-rog.jpg', 'asus-rog-strix-g15'),
    ('Galaxy Tab S9', 'tab-s9.jpg', 'galaxy-tab-s9')
) AS sample(name, old_image, photo)
WHERE product.name = sample.name AND product.image_url = sample.old_image;
