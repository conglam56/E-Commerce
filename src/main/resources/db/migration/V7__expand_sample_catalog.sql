INSERT INTO category (id, name, slug, status) VALUES
    (gen_random_uuid(), 'Tai nghe', 'tai-nghe', 'ACTIVE'),
    (gen_random_uuid(), 'Màn hình', 'man-hinh', 'ACTIVE'),
    (gen_random_uuid(), 'Bàn phím & chuột', 'ban-phim-chuot', 'ACTIVE')
ON CONFLICT DO NOTHING;

INSERT INTO product (id, name, quantity, description, image_url, category_id, price, status)
SELECT gen_random_uuid(), sample.name, sample.quantity, sample.description,
       '/catalog/' || sample.image, category.id, sample.price, 'ACTIVE'
FROM (VALUES
    ('dien-thoai', 'Điện thoại Nova 5G 128 GB', 24,
        'Màn hình 6,5 inch, bộ nhớ 128 GB và hai SIM cho nhu cầu hằng ngày.', 'nova-5g.svg', 5490000),
    ('dien-thoai', 'Điện thoại Nova Plus 256 GB', 15,
        'Màn hình 6,7 inch, bộ nhớ 256 GB và cổng sạc USB-C.', 'nova-plus.svg', 8490000),
    ('laptop', 'Laptop Atlas 14', 18,
        'Màn hình 14 inch, RAM 16 GB và SSD 512 GB. Gọn để mang đi học hoặc đi làm.', 'atlas-14.svg', 14990000),
    ('laptop', 'Laptop Atlas 16', 8,
        'Màn hình 16 inch, RAM 16 GB, SSD 1 TB và bàn phím số riêng.', 'atlas-16.svg', 19990000),
    ('may-tinh-bang', 'Máy tính bảng Slate 11', 21,
        'Màn hình 11 inch, bộ nhớ 128 GB, phù hợp để đọc tài liệu và xem phim.', 'slate-11.svg', 6790000),
    ('may-tinh-bang', 'Máy tính bảng Slate Mini 8', 12,
        'Màn hình 8 inch, bộ nhớ 64 GB. Kích thước vừa tay để đọc sách và ghi chú.', 'slate-mini.svg', 3990000),
    ('tai-nghe', 'Tai nghe chụp tai Studio H1', 16,
        'Tai nghe Bluetooth với đệm tai mềm, chống ồn chủ động và sạc USB-C.', 'studio-h1.svg', 1890000),
    ('tai-nghe', 'Tai nghe không dây Pocket B2', 26,
        'Tai nghe nhét tai Bluetooth kèm hộp sạc nhỏ gọn và ba cỡ nút tai.', 'pocket-b2.svg', 890000),
    ('man-hinh', 'Màn hình View 24', 13,
        'Tấm nền IPS 24 inch, độ phân giải Full HD, có cổng HDMI và DisplayPort.', 'view-24.svg', 2690000),
    ('man-hinh', 'Màn hình View 27', 6,
        'Tấm nền IPS 27 inch, độ phân giải QHD và chân đế chỉnh được độ cao.', 'view-27.svg', 4490000),
    ('ban-phim-chuot', 'Bàn phím cơ Type 75', 19,
        'Bố cục 75% có hàng phím chức năng, kết nối USB-C và núm chỉnh âm lượng.', 'type-75.svg', 1190000),
    ('ban-phim-chuot', 'Chuột không dây Point M2', 35,
        'Chuột không dây cỡ nhỏ, có nút bấm êm và kết nối qua Bluetooth hoặc đầu thu USB.', 'point-m2.svg', 490000)
) AS sample(category_slug, name, quantity, description, image, price)
JOIN category ON category.slug = sample.category_slug
ON CONFLICT (name) DO NOTHING;
