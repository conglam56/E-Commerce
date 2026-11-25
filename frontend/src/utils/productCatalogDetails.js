import officialProductPhotos from './officialProductPhotos';
import { resolveProductImage } from './format';

const CATALOG_BY_NAME = {
  'iphone 15 pro max': {
    tagline: 'Khung viền Titan Cấp 5 siêu nhẹ, chip A17 Pro 3nm và ống kính tiềm vọng zoom quang 5x.',
    quickSpecs: ['Chip A17 Pro', 'OLED 6.7" 120Hz', 'Titan Cấp 5', 'Zoom quang 5x'],
    gallery: [
      {
        url: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-15-pro-max.png',
        caption: 'Các phiên bản màu Titan tự nhiên, Xanh, Trắng và Đen',
      },
      {
        url: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/111828-iphone-15-pro-max-portimage-1.png',
        caption: 'Màn hình Super Retina XDR và nút Tác Vụ (Action Button)',
      },
      {
        url: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/111828-iphone-15-pro-max-portimage-2.png',
        caption: 'Cổng USB-C tốc độ truyền dữ liệu chuẩn USB 3 (10Gb/s)',
      },
    ],
    highlights: [
      'Khung Titan chuẩn hàng không vũ trụ bền chắc, giảm đáng kể trọng lượng khi cầm dài giờ.',
      'Hệ thống 3 camera Pro 48MP hỗ trợ chụp ảnh độ phân giải siêu cao và quay ProRes 4K 60fps.',
      'Nút Tác Vụ tùy biến mở nhanh máy ảnh, ghi âm, dịch thuật hoặc phím tắt cá nhân.',
      'Cổng USB-C hỗ trợ truyền file trực tiếp sang ổ cứng SSD rời tốc độ đến 10Gb/s.',
    ],
    overview: [
      'iPhone 15 Pro Max kết hợp vật liệu Titan Cấp 5 hoàn thiện phay xước tinh tế cùng viền màn hình mỏng nhất từng có trên dòng iPhone 6,7 inch. Mặt kính Ceramic Shield phía trước giúp tăng khả năng chịu va đập trong quá trình di chuyển hằng ngày.',
      'Bên trong là vi xử lý A17 Pro tiến trình 3nm với GPU 6 nhân hỗ trợ dò tia bằng phần cứng, vận hành mượt từ dựng video 4K trên thiết bị đến các tựa game đồ họa cao mà vẫn giữ thời lượng pin xem video liên tục tới 29 giờ.',
    ],
    specs: [
      { label: 'Màn hình', value: '6.7 inch Super Retina XDR OLED, ProMotion 120Hz, tối đa 2.000 nits' },
      { label: 'Vi xử lý', value: 'Apple A17 Pro (tiến trình 3nm, 6 nhân CPU, 6 nhân GPU, 16 nhân Neural Engine)' },
      { label: 'Bộ nhớ lưu trữ', value: '256 GB NVMe' },
      { label: 'Hệ thống camera', value: 'Chính 48MP OIS + Góc siêu rộng 12MP + Tele tiềm vọng 12MP (zoom quang 5x)' },
      { label: 'Pin & Sạc', value: 'Xem video đến 29 giờ, sạc nhanh USB-C PD và sạc từ tính MagSafe 15W' },
      { label: 'Kết nối', value: '5G, Wi-Fi 6E, Bluetooth 5.3, NFC, USB-C 3.2 Gen 2 (10Gb/s)' },
      { label: 'Kháng nước & Bụi', value: 'Chuẩn IP68 (sâu tối đa 6 mét trong 30 phút)' },
      { label: 'Chất liệu & Trọng lượng', value: 'Khung Titan Cấp 5, mặt lưng kính nhám · 221 g' },
    ],
  },

  'samsung galaxy s24 ultra': {
    tagline: 'Khung Titan phẳng cứng cáp, bút S Pen tích hợp sẵn và bộ công cụ Galaxy AI tiếng Việt.',
    quickSpecs: ['Snapdragon 8 Gen 3', 'Dynamic AMOLED 6.8"', 'Bút S Pen tích hợp', 'Camera 200MP'],
    gallery: [
      {
        url: 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-sm-s928-0.jpg',
        caption: 'Thiết kế khung viền Titan phẳng cùng bút cảm ứng S Pen đồng màu',
      },
      {
        url: 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-sm-s928-2.jpg',
        caption: 'Các tùy chọn màu sắc dòng Galaxy S24 Ultra',
      },
      {
        url: 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-sm-s928-3.jpg',
        caption: 'Cụm 4 ống kính sau 200MP với hệ thống lấy nét laser',
      },
    ],
    highlights: [
      'Kính cường lực Corning Gorilla Armor giảm tới 75% ánh sáng phản chiếu ngoài trời nắng gắt.',
      'Bút S Pen nằm gọn trong thân máy, độ trễ cực thấp để ký tài liệu và phác thảo tức thì.',
      'Galaxy AI hỗ trợ khoanh tròn tìm kiếm, tóm tắt ghi chú cuộc họp và phiên dịch trực tiếp tiếng Việt.',
      'Hệ thống Quad Tele với cảm biến 200MP và ống kính tele kép 3x + 5x sắc nét ở mọi tiêu cự.',
    ],
    overview: [
      'Galaxy S24 Ultra chuyển sang màn hình phẳng hoàn toàn 6,8 inch QHD+ giúp thao tác viết vẽ bằng S Pen sát mép viền chính xác hơn hẳn thiết kế cong trước đây. Lớp phủ chống chói Gorilla Armor giữ độ tương phản sâu ngay cả dưới đèn văn phòng mạnh.',
      'Vi xử lý Snapdragon 8 Gen 3 for Galaxy đi kèm buồng hơi tản nhiệt lớn hơn 1,9 lần, duy trì hiệu năng ổn định khi xử lý đa nhiệm chia đôi màn hình, xuất ảnh RAW hoặc kết nối Samsung DeX ra màn hình rời.',
    ],
    specs: [
      { label: 'Màn hình', value: '6.8 inch Dynamic LTPO AMOLED 2X, QHD+ (3120 × 1440), 1–120Hz, 2.600 nits' },
      { label: 'Vi xử lý', value: 'Snapdragon 8 Gen 3 for Galaxy (8 nhân, tối ưu NPU cho AI)' },
      { label: 'RAM & Bộ nhớ', value: '12 GB RAM · 256 GB UFS 4.0' },
      { label: 'Camera sau', value: '200MP OIS + Tele 50MP (5x) + Tele 10MP (3x) + Siêu rộng 12MP' },
      { label: 'Bút cảm ứng', value: 'S Pen tích hợp trong thân máy (Bluetooth LE, chuẩn IP68)' },
      { label: 'Pin & Sạc', value: '5.000 mAh, sạc nhanh có dây 45W, sạc không dây 15W' },
      { label: 'Kết nối', value: '5G, Wi-Fi 7, Bluetooth 5.3, Ultra Wideband (UWB), Samsung DeX' },
      { label: 'Chất liệu & Trọng lượng', value: 'Khung Armor Titanium, kính Gorilla Armor · 232 g' },
    ],
  },

  'xiaomi 14 pro': {
    tagline: 'Hệ thống ống kính Leica Summilux khẩu độ biến thiên vô cấp và sạc siêu tốc 120W.',
    quickSpecs: ['Snapdragon 8 Gen 3', 'Ống kính Leica', 'LTPO OLED 2K 120Hz', 'Sạc nhanh 120W'],
    gallery: [
      {
        url: 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-pro-1.jpg',
        caption: 'Thiết kế viền kim loại vát phẳng và cụm ống kính Leica đồng tâm',
      },
      {
        url: 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-pro-2.jpg',
        caption: 'Màn hình cong nhẹ bốn cạnh All Around Liquid Display',
      },
      {
        url: 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-pro-3.jpg',
        caption: 'Ba tùy chọn hoàn thiện mặt lưng Đen, Trắng và Xanh ngọc',
      },
    ],
    highlights: [
      'Cảm biến Light Fusion 900 kết hợp khẩu độ biến thiên f/1.42 – f/4.0 tự động điều tiết ánh sáng và tia sao.',
      'Ống kính Leica 75mm Floating Telephoto lấy nét cận cảnh từ khoảng cách chỉ 10 cm.',
      'Màn hình AMOLED độ phân giải 2K sắc nét với kính bảo vệ Xiaomi Dragon Crystal bền bỉ.',
      'Công nghệ sạc HyperCharge 120W nạp đầy viên pin 4.880 mAh chỉ trong khoảng 18 phút.',
    ],
    overview: [
      'Xiaomi 14 Pro được chế tác cho người dùng yêu thích nhiếp ảnh di động với hai cấu hình màu đặc trưng Leica Authentic và Leica Vibrant. Cơ cấu lá khẩu vật lý cho phép kiểm soát độ sâu trường ảnh tự nhiên mà không phụ thuộc hoàn toàn vào xóa phông phần mềm.',
      'Màn hình 6,73 inch 12-bit màu hiển thị tới 68 tỷ sắc thái cùng tần số quét thích ứng 1–120Hz, kết hợp hệ thống loa kép Dolby Atmos mang lại trải nghiệm xem phim và chỉnh ảnh chuẩn xác.',
    ],
    specs: [
      { label: 'Màn hình', value: '6.73 inch LTPO AMOLED 2K (3200 × 1440), 120Hz, Dolby Vision, 3.000 nits' },
      { label: 'Vi xử lý', value: 'Qualcomm Snapdragon 8 Gen 3 (tiến trình 4nm)' },
      { label: 'RAM & Bộ nhớ', value: '12 GB LPDDR5X · 256 GB UFS 4.0' },
      { label: 'Hệ thống camera Leica', value: '50MP (f/1.42–f/4.0 OIS) + Tele nổi 50MP (3.2x) + Siêu rộng 50MP' },
      { label: 'Pin & Sạc', value: '4.880 mAh · Sạc có dây 120W, sạc không dây 50W' },
      { label: 'Kết nối', value: '5G, Wi-Fi 7, Bluetooth 5.4, hồng ngoại IR, USB-C 3.2 Gen 2' },
      { label: 'Kháng nước & Bụi', value: 'Chuẩn IP68' },
      { label: 'Trọng lượng', value: '223 g' },
    ],
  },

  'oppo find x7': {
    tagline: 'Cụm camera đồng tâm tinh chỉnh màu sắc bởi Hasselblad cùng màn hình ProXDR 4.500 nits.',
    quickSpecs: ['Dimensity 9300', 'Camera Hasselblad', 'AMOLED 1.5K 120Hz', 'Sạc SuperVOOC 100W'],
    gallery: [
      {
        url: 'https://www.oppo.com/content/dam/oppo/common/mkt/v2-2/find-x7-series-cn/listpage/find-x7-427_600-blue.png',
        caption: 'Thiết kế Cosmos Ring đặc trưng trên Oppo Find X7',
      },
      {
        url: 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-x7-1.jpg',
        caption: 'Phối màu da thực vật kết hợp mặt kính kim loại hai tông màu',
      },
      {
        url: 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-x7-2.jpg',
        caption: 'Các phiên bản màu sắc dòng Oppo Find X7',
      },
    ],
    highlights: [
      'Chế độ chân dung Hasselblad Portrait tái tạo bokeh xoáy tự nhiên theo tiêu cự ống kính cổ điển.',
      'Vi xử lý Dimensity 9300 cấu trúc toàn nhân lớn xử lý mượt các tác vụ dựng clip và đa nhiệm.',
      'Viên pin lớn 5.000 mAh đi kèm sạc nhanh SuperVOOC 100W nạp đầy trong chưa đầy 30 phút.',
      'Cần gạt vật lý 3 nấc bên cạnh máy giúp chuyển nhanh sang chế độ riêng tư khi họp hành.',
    ],
    overview: [
      'Oppo Find X7 gây ấn tượng nhờ mặt lưng chia hai mảng chất liệu tinh xảo lấy cảm hứng từ thân máy ảnh chuyên nghiệp, mang lại độ bám tay chắc chắn và hạn chế bám dấu vân tay.',
      'Màn hình AMOLED 6,78 inch hỗ trợ hiển thị ảnh ProXDR giữ trọn vùng sáng chói lẫn chi tiết vùng tối, rất phù hợp để xem lại ảnh chụp ngay ngoài trời.',
    ],
    specs: [
      { label: 'Màn hình', value: '6.78 inch LTPO AMOLED (2780 × 1264), 1–120Hz, Dolby Vision, 4.500 nits' },
      { label: 'Vi xử lý', value: 'MediaTek Dimensity 9300 (tiến trình 4nm)' },
      { label: 'RAM & Bộ nhớ', value: '12 GB LPDDR5X · 256 GB UFS 4.0' },
      { label: 'Camera Hasselblad', value: 'Chính 50MP OIS + Tele tiềm vọng 64MP (3x) + Siêu rộng 50MP' },
      { label: 'Pin & Sạc', value: '5.000 mAh · Sạc nhanh SuperVOOC 100W' },
      { label: 'Kết nối', value: '5G, Wi-Fi 7, Bluetooth 5.4, NFC, cổng hồng ngoại' },
      { label: 'Trọng lượng', value: '202 g' },
    ],
  },

  'iphone 14': {
    tagline: 'Thiết kế nhôm bền bỉ, màn hình OLED rực rỡ và tính năng an toàn Phát Hiện Va Chạm.',
    quickSpecs: ['Chip A15 Bionic (5 nhân GPU)', 'OLED 6.1"', 'Chế độ Hành Động', 'Kháng nước IP68'],
    gallery: [
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111850_iphone-14_1.png',
        caption: 'Bảng màu trẻ trung của dòng iPhone 14 vỏ nhôm hàng không',
      },
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111850_iphone14-14plus.png',
        caption: 'Thiết kế mặt kính phẳng Ceramic Shield cùng cụm camera chéo',
      },
    ],
    highlights: [
      'Photonic Engine cải thiện rõ rệt độ chi tiết và màu sắc khi chụp thiếu sáng trên cả camera trước và sau.',
      'Chế độ Hành Động (Action Mode) chống rung mượt mà khi quay video vừa đi bộ vừa cầm tay.',
      'Camera trước TrueDepth có tự động lấy nét (Autofocus) giúp gọi video và chụp nhóm sắc nét hơn.',
      'Cấu trúc tản nhiệt trong được thiết kế lại giúp máy mát và ổn định hơn khi dùng 5G dài giờ.',
    ],
    overview: [
      'iPhone 14 là lựa chọn cân bằng cho nhu cầu sử dụng lâu dài hằng ngày: kích thước 6,1 inch gọn gàng dễ thao tác một tay, trọng lượng nhẹ chỉ 172 g nhưng vẫn có thời lượng pin trọn một ngày làm việc.',
      'Phiên bản chip A15 Bionic với GPU 5 nhân (tương đương dòng 13 Pro) đảm bảo tốc độ phản hồi mượt mà trên các bản cập nhật iOS mới nhất trong nhiều năm tới.',
    ],
    specs: [
      { label: 'Màn hình', value: '6.1 inch Super Retina XDR OLED (2532 × 1170), HDR10, Dolby Vision' },
      { label: 'Vi xử lý', value: 'Apple A15 Bionic (6 nhân CPU, 5 nhân GPU, 16 nhân Neural Engine)' },
      { label: 'Bộ nhớ lưu trữ', value: '128 GB' },
      { label: 'Camera', value: 'Kép 12MP (Chính f/1.5 chống rung dịch chuyển cảm biến + Siêu rộng 120°)' },
      { label: 'Pin & Sạc', value: 'Xem video đến 20 giờ · Sạc nhanh 20W & sạc không dây MagSafe 15W' },
      { label: 'Kết nối', value: '5G, Wi-Fi 6, Bluetooth 5.3, NFC, cổng Lightning' },
      { label: 'Kháng nước & Trọng lượng', value: 'IP68 · Khung nhôm & kính Ceramic Shield · 172 g' },
    ],
  },

  'iphone 13': {
    tagline: 'Màn hình Super Retina XDR sắc nét, camera kép chống rung cảm biến và mức giá dễ tiếp cận.',
    quickSpecs: ['Chip A15 Bionic', 'Super Retina XDR 6.1"', 'Quay Điện Ảnh', 'IP68 bền bỉ'],
    gallery: [
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111872_iphone13-colors-480.png',
        caption: 'Các tùy chọn màu sắc chính hãng dòng iPhone 13',
      },
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111872_sp847-connector.png',
        caption: 'Bố cục phím bấm vật lý và cụm loa dưới cạnh máy',
      },
    ],
    highlights: [
      'Công nghệ chống rung dịch chuyển cảm biến (Sensor-shift OIS) kế thừa từ dòng Pro Max.',
      'Chế độ Điện Ảnh (Cinematic Mode) tự động chuyển điểm lấy nét mượt giữa các chủ thể.',
      'Màn hình OLED đạt độ sáng tiêu chuẩn 800 nits, hiển thị rõ ràng dưới ánh nắng ngoài trời.',
      'Chip A15 Bionic tiết kiệm điện năng, đáp ứng mượt mọi ứng dụng ngân hàng, học tập và giải trí.',
    ],
    overview: [
      'iPhone 13 giữ vững sức hút nhờ độ hoàn thiện cao cấp với mặt kính Ceramic Shield, khung nhôm vuông vức vừa tay và hệ sinh thái phụ kiện MagSafe phong phú.',
      'Với mức giá hợp lý, đây là chiếc điện thoại iOS ổn định, camera chụp nhanh tự nhiên và thời lượng pin thực tế bền bỉ cho sinh viên cũng như nhân viên văn phòng.',
    ],
    specs: [
      { label: 'Màn hình', value: '6.1 inch Super Retina XDR OLED (2532 × 1170), True Tone, P3 Wide Color' },
      { label: 'Vi xử lý', value: 'Apple A15 Bionic (tiến trình 5nm, 6 nhân CPU, 4 nhân GPU)' },
      { label: 'Bộ nhớ lưu trữ', value: '128 GB' },
      { label: 'Camera', value: 'Chính 12MP Sensor-shift OIS + Góc siêu rộng 12MP · Trước 12MP TrueDepth' },
      { label: 'Pin & Sạc', value: 'Xem video đến 19 giờ · Hỗ trợ sạc nhanh 20W & MagSafe 15W' },
      { label: 'Kết nối', value: '5G, Wi-Fi 6, Bluetooth 5.0, hai SIM (nano-SIM và eSIM)' },
      { label: 'Kháng nước & Trọng lượng', value: 'Chuẩn IP68 · 174 g' },
    ],
  },

  'google pixel 7': {
    tagline: 'Trải nghiệm Android nguyên bản mượt mà cùng thuật toán nhiếp ảnh điện toán đặc trưng từ Google.',
    quickSpecs: ['Google Tensor G2', 'OLED 6.3" 90Hz', 'Camera 50MP HDR+', 'Android thuần mượt'],
    gallery: [
      {
        url: 'https://fdn2.gsmarena.com/vv/pics/google/google-pixel7-1.jpg',
        caption: 'Thiết kế dải camera nhôm mờ nguyên khối đặc trưng của Google Pixel 7',
      },
      {
        url: 'https://fdn2.gsmarena.com/vv/pics/google/google-pixel7-2.jpg',
        caption: 'Ba phiên bản màu Obsidian, Snow và Lemongrass',
      },
    ],
    highlights: [
      'Cảm biến chính 50MP kết hợp thuật toán Real Tone và Night Sight chụp thiếu sáng giàu chi tiết.',
      'Tính năng Photo Unblur và Magic Eraser làm nét ảnh rung tay và xóa vật thể thừa chỉ với một chạm.',
      'Giao diện Android thuần Google nhẹ nhàng, không ứng dụng rác, nhận cập nhật bảo mật sớm.',
      'Dải Camera Bar bằng nhôm tái chế giúp máy nằm cân bằng trên mặt bàn không bị cập kênh.',
    ],
    overview: [
      'Google Pixel 7 tập trung vào trải nghiệm thông minh thực chất: từ khả năng lọc tiếng ồn cuộc gọi Clear Calling cho đến xử lý ảnh HDR+ tức thì ngay khi bấm cò.',
      'Kích thước màn hình 6,3 inch FHD+ 90Hz vừa vặn trong lòng bàn tay, bảo vệ bởi kính cường lực Gorilla Glass Victus ở cả mặt trước lẫn mặt sau cùng chuẩn kháng nước IP68.',
    ],
    specs: [
      { label: 'Màn hình', value: '6.3 inch AMOLED FHD+ (2400 × 1080), tần số quét 90Hz, HDR10+, 1.400 nits' },
      { label: 'Vi xử lý', value: 'Google Tensor G2 kèm chip bảo mật chuyên dụng Titan M2' },
      { label: 'RAM & Bộ nhớ', value: '8 GB LPDDR5 · 128 GB UFS 3.1' },
      { label: 'Camera', value: 'Chính 50MP OIS (cảm biến 1/1.31") + Siêu rộng 12MP · Trước 10.8MP quay 4K' },
      { label: 'Pin & Sạc', value: '4.355 mAh · Sạc nhanh USB-C PD 3.0 & sạc không dây chuẩn Qi' },
      { label: 'Kết nối', value: '5G, Wi-Fi 6E, Bluetooth 5.2, NFC, eSIM + nano-SIM' },
      { label: 'Kháng nước & Trọng lượng', value: 'Chuẩn IP68 · Kính Gorilla Glass Victus · 197 g' },
    ],
  },

  'macbook pro 14 m3': {
    tagline: 'Màn hình Liquid Retina XDR chuẩn tham chiếu, đầy đủ cổng kết nối chuyên nghiệp và pin tới 18 giờ.',
    quickSpecs: ['Chip Apple M3 Pro', 'Liquid Retina XDR 14.2"', 'ProMotion 120Hz', 'HDMI & Khe thẻ SDXC'],
    gallery: [
      {
        url: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/macbook-pro-14-inch-m3-pro-or-m3.png',
        caption: 'Vỏ nhôm nguyên khối với phiên bản Đen Không Gian và Bạc',
      },
      {
        url: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/117736-117737-macbook-pro-portimage-1-en.png',
        caption: 'Cạnh trái: MagSafe 3, hai cổng Thunderbolt 4 và giắc tai nghe trở kháng cao',
      },
      {
        url: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/117736-117737-macbook-pro-portimage-2-en.png',
        caption: 'Cạnh phải: cổng HDMI, cổng Thunderbolt 4 và khe đọc thẻ nhớ SDXC',
      },
    ],
    highlights: [
      'Tấm nền Mini-LED Liquid Retina XDR đạt độ sáng duy trì 1.000 nits và đỉnh 1.600 nits cho nội dung HDR.',
      'Kiến trúc GPU thế hệ mới với Dynamic Caching tăng tốc biên tập video, dựng hình 3D và biên dịch mã nguồn lớn.',
      'Tích hợp sẵn cổng HDMI, khe thẻ nhớ SDXC và 3 cổng Thunderbolt 4 — làm việc không cần mang hub chuyển đổi.',
      'Hệ thống 6 loa có loa trầm khử lực cùng 3 micro chuẩn phòng thu cho các buổi họp trực tuyến rõ tiếng.',
    ],
    overview: [
      'MacBook Pro 14 inch M3 Pro được thiết kế cho lập trình viên, nhà thiết kế và người sáng tạo nội dung cần hiệu năng máy trạm trong thân máy 1,61 kg. Hiệu suất ổn định ngay cả khi chạy bằng pin giúp bạn giữ nguyên tốc độ làm việc ở quán cà phê hay trên chuyến bay.',
      'Lớp hoàn thiện anod hóa mới hạn chế bám vân tay hiệu quả, đi kèm bàn phím Magic Keyboard có hàng phím chức năng chiều cao đầy đủ và cảm biến vân tay Touch ID nhạy bén.',
    ],
    specs: [
      { label: 'Màn hình', value: '14.2 inch Liquid Retina XDR (3024 × 1964), Mini-LED, ProMotion 120Hz' },
      { label: 'Vi xử lý', value: 'Apple M3 Pro (tiến trình 3nm, phần cứng tăng tốc Ray Tracing & ProRes)' },
      { label: 'Bộ nhớ & Lưu trữ', value: '18 GB Unified Memory · 512 GB SSD tốc độ cao' },
      { label: 'Cổng kết nối', value: 'MagSafe 3, 3× Thunderbolt 4 (USB-C), HDMI, khe thẻ SDXC, tai nghe 3.5mm' },
      { label: 'Âm thanh & Camera', value: 'Hệ thống 6 loa Spatial Audio · Camera FaceTime HD 1080p' },
      { label: 'Pin & Sạc', value: 'Lên đến 18 giờ xem video · Đi kèm củ sạc USB-C 70W' },
      { label: 'Kết nối không dây', value: 'Wi-Fi 6E (802.11ax) · Bluetooth 5.3' },
      { label: 'Kích thước & Trọng lượng', value: 'Dày 1.55 cm · Nặng 1.61 kg' },
    ],
  },

  'thinkpad x1 carbon': {
    tagline: 'Biểu tượng laptop doanh nhân sợi carbon siêu nhẹ 1.12 kg, bàn phím trứ danh và độ bền chuẩn quân đội.',
    quickSpecs: ['Intel Core i7 Gen 13', 'Vỏ sợi Carbon 1.12 kg', 'Màn hình 14" 16:10', 'Chuẩn bền MIL-STD-810H'],
    gallery: [
      {
        url: 'https://p1-ofp.static.pub/ShareResource/na/products/thinkpad/560x450/lenovo-thinkpad-x1-carbon-gen-11-2023.png?height=584&width=584',
        caption: 'Thiết kế khung sợi carbon đen mờ cùng nút điều hướng TrackPoint đỏ đặc trưng',
      },
    ],
    highlights: [
      'Nắp lưng dệt sợi carbon hàng không kết hợp khung hợp kim magie cho trọng lượng chỉ 1,12 kg.',
      'Bàn phím ThinkPad hành trình phím sâu, độ nảy êm tay hàng đầu cho người gõ văn bản và lập trình nhiều giờ.',
      'Vượt qua 12 tiêu chuẩn kiểm định quân đội MIL-STD-810H về nhiệt độ, độ ẩm, rung lắc và bụi bẩn.',
      'Đầy đủ cả cổng USB-A truyền thống, HDMI 2.1 và 2 cổng Thunderbolt 4 trên thân máy siêu mỏng.',
    ],
    overview: [
      'ThinkPad X1 Carbon Gen 11 hướng tới doanh nhân và kỹ sư thường xuyên di chuyển cần một cỗ máy tin cậy tuyệt đối. Màn hình tỉ lệ 16:10 chống chói giúp hiển thị nhiều dòng bảng tính và tài liệu hơn mà không gây mỏi mắt.',
      'Tính năng bảo mật phần cứng gồm cảm biến vân tay tích hợp nút nguồn, cần gạt che webcam vật lý Privacy Shutter và hệ thống tản nhiệt quạt kép thoát gió êm ái.',
    ],
    specs: [
      { label: 'Màn hình', value: '14 inch IPS WUXGA (1920 × 1200) tỉ lệ 16:10, chống chói, 400 nits, 100% sRGB' },
      { label: 'Vi xử lý', value: 'Intel Core i7 thế hệ 13 (chứng nhận nền tảng Intel Evo)' },
      { label: 'RAM & Lưu trữ', value: '16 GB LPDDR5 · 512 GB SSD PCIe Gen 4 NVMe' },
      { label: 'Cổng kết nối', value: '2× Thunderbolt 4, 2× USB-A 3.2 Gen 1, HDMI 2.1, giắc âm thanh 3.5mm' },
      { label: 'Bàn phím & Điều hướng', value: 'Đèn nền trắng, chống tràn nhẹ · TrackPoint + bàn di chuột mặt kính' },
      { label: 'Bảo mật', value: 'Cảm biến vân tay nút nguồn, Camera FHD IR + cần gạt che vật lý, dTPM 2.0' },
      { label: 'Pin & Sạc', value: '57 Wh · Sạc nhanh Rapid Charge USB-C 65W (80% trong 60 phút)' },
      { label: 'Trọng lượng', value: '1.12 kg' },
    ],
  },

  'dell xps 13': {
    tagline: 'Khung nhôm CNC tối giản tuyệt đối với bàn phím tràn cạnh và dãy phím cảm ứng điện dung.',
    quickSpecs: ['Nhôm CNC & Kính Gorilla', 'Màn hình InfinityEdge 13.4"', 'Touchpad tàng hình', 'Siêu gọn 1.23 kg'],
    gallery: [
      {
        url: '/catalog/official/dell-xps-13-plus.webp',
        caption: 'Thiết kế phẳng liền mạch với chiếu nghỉ tay bằng kính và bàn phím tràn lề',
      },
    ],
    highlights: [
      'Thiết kế nội thất đột phá: bàn di chuột phản hồi xúc giác (Haptic ForcePad) ẩn liền mạch dưới mặt kính.',
      'Màn hình InfinityEdge viền mỏng cả 4 cạnh, tối đa hóa diện tích hiển thị 13,4 inch trong khung máy 12 inch.',
      'Khung máy gia công CNC từ nhôm nguyên khối sắc sảo, cứng cáp ở mọi góc cầm.',
      'Hệ thống 4 loa tổng công suất 8W tái tạo âm trường rộng và giọng thoại trong trẻo.',
    ],
    overview: [
      'Dell XPS 13 Plus (9320) là tuyên ngôn thiết kế hiện đại dành cho người dùng yêu sự tinh gọn: không một chi tiết thừa trên chiếu nghỉ tay, các phím lớn phẳng có hành trình 1 mm êm và chính xác.',
      'Hai cổng Thunderbolt 4 đặt đối xứng hai bên cho phép cắm sạc hoặc xuất màn hình 4K từ bất kỳ phía nào thuận tiện nhất trên bàn làm việc.',
    ],
    specs: [
      { label: 'Màn hình', value: '13.4 inch FHD+ (1920 × 1200) InfinityEdge chống phản chiếu, độ sáng 500 nits' },
      { label: 'Vi xử lý', value: 'Intel Core i7 dòng P hiệu năng cao (12 nhân / 16 luồng)' },
      { label: 'RAM & Lưu trữ', value: '16 GB LPDDR5 Dual Channel · 512 GB SSD PCIe Gen 4' },
      { label: 'Bàn di chuột', value: 'Seamless Glass Haptic ForcePad phản hồi lực rung chính xác' },
      { label: 'Cổng kết nối', value: '2× Thunderbolt 4 (USB4 Type-C hỗ trợ DisplayPort & Power Delivery)' },
      { label: 'Pin & Sạc', value: '55 Wh · Công nghệ ExpressCharge kèm củ sạc USB-C 60W' },
      { label: 'Kết nối không dây', value: 'Intel Killer Wi-Fi 6E · Bluetooth 5.2' },
      { label: 'Kích thước & Trọng lượng', value: 'Dày 1.53 cm · Nặng 1.23 kg' },
    ],
  },

  'asus rog strix': {
    tagline: 'Cỗ máy gaming và đồ họa thực thụ với keo tản nhiệt kim loại lỏng cùng màn hình tần số quét cao.',
    quickSpecs: ['Ryzen / RTX hiệu năng cao', 'Màn hình 15.6" tần số quét cao', 'Keo kim loại lỏng', 'Bàn phím RGB 4 vùng'],
    gallery: [
      {
        url: 'https://dlcdnwebimgs.asus.com/files/media/6C1CAB30-D5C6-4D6E-90DC-B6A088360E12/V2/img/design-product.png',
        caption: 'Nắp lưng kim loại cắt chéo thể thao và dải đèn Aura Sync bao quanh đáy máy',
      },
      {
        url: 'https://dlcdnwebimgs.asus.com/gain/F99E072F-5962-42B1-9A5E-C1B86C1AD49E/w1000/h732',
        caption: 'Góc nhìn bố cục bàn phím gaming chuyên biệt và hệ thống khe thoát nhiệt',
      },
    ],
    highlights: [
      'Keo tản nhiệt kim loại lỏng trên CPU kết hợp quạt Arc Flow 84 cánh giữ xung nhịp cao bền bỉ.',
      'Màn hình IPS chống chói tần số quét cao cùng Adaptive-Sync triệt tiêu hiện tượng xé hình khi chơi game.',
      'Phần lớn cổng cắm (LAN RJ45, HDMI, USB-C, nguồn) được bố trí gọn ra mặt sau để không vướng tay cầm chuột.',
      'Hai khe cắm RAM và hai khe SSD M.2 NVMe dễ dàng nâng cấp dung lượng về lâu dài.',
    ],
    overview: [
      'Asus ROG Strix G15 được sinh ra cho cả game thủ eSports lẫn sinh viên ngành kỹ thuật, kiến trúc, dựng phim cần GPU rời mạnh mẽ và hệ thống làm mát đáng tin cậy.',
      'Bàn phím lấy cảm hứng từ bàn phím cơ máy bàn với cụm phím nóng âm lượng/mic tách riêng, công nghệ Overstroke nhận lệnh sớm và độ bền 20 triệu lần nhấn.',
    ],
    specs: [
      { label: 'Màn hình', value: '15.6 inch IPS chống chói, tần số quét 144Hz–300Hz, Adaptive-Sync' },
      { label: 'Vi xử lý & Đồ họa', value: 'AMD Ryzen dòng H hiệu năng cao · Card đồ họa rời chuyên dụng' },
      { label: 'RAM & Lưu trữ', value: '16 GB DDR5 (hỗ trợ nâng cấp) · 512 GB SSD PCIe 4.0 NVMe' },
      { label: 'Hệ thống tản nhiệt', value: 'ROG Intelligent Cooling, keo kim loại lỏng Thermal Grizzly, 4 hốc thoát gió' },
      { label: 'Cổng kết nối', value: 'USB-C (DisplayPort & PD), 3× USB-A 3.2, HDMI 2.0b, LAN RJ45, 3.5mm' },
      { label: 'Âm thanh', value: 'Loa kép Smart Amp hỗ trợ Dolby Atmos, chống ồn AI hai chiều' },
      { label: 'Pin & Kết nối', value: 'Pin dung lượng lớn hỗ trợ sạc nhanh USB-C 100W · Wi-Fi 6' },
      { label: 'Trọng lượng', value: '2.10 kg' },
    ],
  },

  'macbook air m2': {
    tagline: 'Thiết kế mỏng đều 1.13 cm không quạt tản nhiệt, màn hình Liquid Retina 13.6 inch và sạc MagSafe 3.',
    quickSpecs: ['Chip Apple M2', 'Liquid Retina 13.6"', 'Không quạt êm tuyệt đối', 'Nặng chỉ 1.24 kg'],
    gallery: [
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111867_SP869-2022-macbook-air-m2-colors.png',
        caption: 'Bốn phiên bản màu Đêm Xanh Thẫm, Ánh Sao, Xám Không Gian và Bạc',
      },
      {
        url: 'https://www.apple.com/newsroom/images/product/mac/standard/Apple-WWDC22-MacBook-Air-hero-220606_big.jpg',
        caption: 'Màn hình Liquid Retina 13.6 inch viền mỏng tích hợp camera 1080p',
      },
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111867_sp869-portimage-1.png',
        caption: 'Cổng sạc từ tính MagSafe 3 và hai cổng Thunderbolt / USB 4',
      },
    ],
    highlights: [
      'Vỏ nhôm nguyên khối phẳng hiện đại dày chỉ 1,13 cm và nhẹ 1,24 kg — bỏ vừa mọi túi xách gọn nhẹ.',
      'Vận hành tĩnh lặng tuyệt đối 0 dB nhờ kiến trúc tản nhiệt thụ động không quạt của chip Apple M2.',
      'Cổng sạc từ tính MagSafe 3 tự nhả khi vướng dây và giải phóng trọn vẹn 2 cổng Thunderbolt cho thiết bị ngoại vi.',
      'Thời lượng pin lên tới 18 giờ đáp ứng trọn một ngày đi làm hoặc lên giảng đường không cần mang sạc.',
    ],
    overview: [
      'MacBook Air M2 là chiếc laptop di động tiêu chuẩn vàng cho công việc văn phòng, lập trình web, chỉnh sửa ảnh Lightroom và biên tập video ngắn. Màn hình 13,6 inch sáng 500 nits hỗ trợ dải màu rộng P3 cho hình ảnh trong trẻo, sắc nét.',
      'Hệ thống 4 loa tích hợp ẩn giữa bản lề cùng webcam FaceTime HD 1080p mang lại chất lượng âm thanh và hình ảnh vượt xa kích thước mỏng mảnh của thân máy.',
    ],
    specs: [
      { label: 'Màn hình', value: '13.6 inch Liquid Retina IPS (2560 × 1664), 500 nits, dải màu P3, True Tone' },
      { label: 'Vi xử lý', value: 'Apple M2 (8 nhân CPU, 8 nhân GPU, 16 nhân Neural Engine)' },
      { label: 'Bộ nhớ & Lưu trữ', value: '8 GB Unified Memory · 256 GB SSD' },
      { label: 'Cổng kết nối', value: 'Sạc từ tính MagSafe 3, 2× Thunderbolt / USB 4, giắc tai nghe 3.5mm' },
      { label: 'Camera & Âm thanh', value: 'Camera FaceTime HD 1080p · Hệ thống 4 loa Spatial Audio, 3 micro' },
      { label: 'Bàn phím', value: 'Magic Keyboard có đèn nền và cảm biến vân tay Touch ID' },
      { label: 'Pin', value: 'Lên đến 18 giờ xem phim / 15 giờ duyệt web không dây' },
      { label: 'Kích thước & Trọng lượng', value: 'Dày 1.13 cm · Nặng 1.24 kg' },
    ],
  },

  'macbook air m1': {
    tagline: 'Thiết kế vát mỏng kinh điển, hiệu năng ổn định vượt tầm giá và thời lượng pin bền bỉ cả ngày.',
    quickSpecs: ['Chip Apple M1', 'Retina 13.3" sắc nét', 'Không quạt ồn', 'Pin tới 18 giờ'],
    gallery: [
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111883_macbookair.png',
        caption: 'Ba tùy chọn màu Vàng, Bạc và Xám Không Gian vỏ nhôm vát mỏng',
      },
      {
        url: 'https://www.apple.com/newsroom/images/product/mac/standard/Apple_new-macbookair-wallpaper-screen_11102020_big.jpg',
        caption: 'Màn hình Retina 13.3 inch độ phân giải cao 2560 × 1600',
      },
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111883_sp825-portimage-1-en.png',
        caption: 'Hai cổng Thunderbolt / USB 4 tốc độ cao bên cạnh trái',
      },
    ],
    highlights: [
      'Kiểu dáng vát mỏng phía trước nâng đỡ cổ tay cực kỳ thoải mái khi gõ phím liên tục nhiều giờ.',
      'Màn hình Retina 2560 × 1600 với dải màu P3 hiển thị văn bản mịn màng không thấy điểm ảnh.',
      'Mở nắp máy là sáng màn hình tức thì như điện thoại, vận hành mát mẻ không tiếng ồn quạt.',
      'Tỷ lệ hiệu năng trên giá thành xuất sắc nhất cho sinh viên và nhân viên văn phòng.',
    ],
    overview: [
      'Dù đã khẳng định tên tuổi qua nhiều năm, MacBook Air M1 vẫn xử lý trơn tru hàng chục tab trình duyệt, bộ ứng dụng Office, thiết kế Canva/Figma và lập trình hằng ngày với mức tiêu thụ điện cực thấp.',
      'Khung nhôm tái chế nguyên khối cứng cáp, bàn di chuột Force Touch rộng rãi và cảm biến Touch ID giúp chiếc máy giữ được trải nghiệm cao cấp vượt xa các mẫu laptop vỏ nhựa cùng tầm giá.',
    ],
    specs: [
      { label: 'Màn hình', value: '13.3 inch Retina IPS (2560 × 1600), dải màu rộng P3, công nghệ True Tone' },
      { label: 'Vi xử lý', value: 'Apple M1 (8 nhân CPU, 7 nhân GPU, 16 nhân Neural Engine)' },
      { label: 'Bộ nhớ & Lưu trữ', value: '8 GB Unified Memory · 256 GB SSD' },
      { label: 'Cổng kết nối', value: '2× Thunderbolt / USB 4 (hỗ trợ sạc, DisplayPort, tốc độ tới 40Gb/s), 3.5mm' },
      { label: 'Bàn phím & Bảo mật', value: 'Magic Keyboard cơ chế cắt kéo có đèn nền · Cảm biến vân tay Touch ID' },
      { label: 'Kết nối không dây', value: 'Wi-Fi 6 (802.11ax) · Bluetooth 5.0' },
      { label: 'Pin', value: 'Lên đến 15 giờ lướt web / 18 giờ xem video' },
      { label: 'Trọng lượng', value: '1.29 kg' },
    ],
  },

  'ipad pro 11 m2': {
    tagline: 'Sức mạnh chip M2 kết hợp màn hình ProMotion 120Hz siêu mượt và cổng Thunderbolt 4 tốc độ cao.',
    quickSpecs: ['Chip Apple M2', 'Liquid Retina 11" 120Hz', 'Face ID & 4 loa', 'Cổng Thunderbolt / USB 4'],
    gallery: [
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111841_ipad-pro-4gen-mainimage.png',
        caption: 'Thiết kế siêu mỏng 5.9 mm với hai màu Xám Không Gian và Bạc',
      },
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111841_ipad-pro-11inch-4gen-portimage.png',
        caption: 'Hệ thống 4 loa đối xứng, cảm biến LiDAR và cổng Thunderbolt / USB 4',
      },
    ],
    highlights: [
      'Công nghệ ProMotion 120Hz cho nét bút Apple Pencil bám sát ngòi gần như không có độ trễ.',
      'Tính năng lướt bút Apple Pencil Hover nhận diện vị trí ngòi bút từ khoảng cách 12 mm trên màn hình.',
      'Cổng Thunderbolt / USB 4 băng thông 40Gb/s kết nối trực tiếp màn hình rời 6K và ổ SSD chuyên dụng.',
      'Mở khóa khuôn mặt Face ID hoạt động mượt ở cả chiều dọc lẫn chiều ngang cùng hệ thống 4 loa vòm.',
    ],
    overview: [
      'iPad Pro 11 inch M2 xóa nhòa ranh giới giữa máy tính bảng gọn nhẹ 466 g và một thiết bị sáng tạo chuyên nghiệp: chỉnh màu video ProRes trong DaVinci Resolve, vẽ minh họa Procreate nhiều lớp hay làm việc đa nhiệm Stage Manager trên màn hình rời.',
      'Cảm biến LiDAR phía sau hỗ trợ đo đạc không gian 3D và ứng dụng thực tế tăng cường (AR) chính xác cho kiến trúc sư và nhà thiết kế nội thất.',
    ],
    specs: [
      { label: 'Màn hình', value: '11 inch Liquid Retina IPS (2388 × 1668), ProMotion 120Hz, P3, 600 nits' },
      { label: 'Vi xử lý', value: 'Apple M2 (8 nhân CPU, 10 nhân GPU, băng thông bộ nhớ 100GB/s)' },
      { label: 'RAM & Lưu trữ', value: '8 GB RAM · 128 GB' },
      { label: 'Camera & Cảm biến', value: 'Sau: 12MP + Siêu rộng 10MP + LiDAR · Trước: 12MP Center Stage + Face ID' },
      { label: 'Âm thanh', value: 'Hệ thống 4 loa stereo tự điều chỉnh theo chiều cầm · 5 micro phòng thu' },
      { label: 'Cổng & Phụ kiện', value: 'Thunderbolt / USB 4 · Hỗ trợ Apple Pencil 2 & Magic Keyboard' },
      { label: 'Kết nối không dây', value: 'Wi-Fi 6E · Bluetooth 5.3' },
      { label: 'Độ mỏng & Trọng lượng', value: 'Dày 5.9 mm · Nặng 466 g' },
    ],
  },

  'galaxy tab s9': {
    tagline: 'Máy tính bảng màn hình AMOLED 120Hz kháng nước IP68 hiếm hoi, tặng kèm sẵn bút cảm ứng S Pen.',
    quickSpecs: ['Dynamic AMOLED 2X 11"', 'Kèm sẵn bút S Pen', 'Snapdragon 8 Gen 2', 'Kháng nước IP68'],
    gallery: [
      {
        url: 'https://api.samsungmobilepress.com/api/v1/file/B78A8E4608C81F1184DAAD4967B36BAF571D5E6B1457A5AF57EB8765F1F98CE62FBA6FCBD18B4403C692E564B37BFAEE1D9838356B65E7D6F3599D7E55B194C630F267557E16A64FCE58C71FAE2A4001843D648178BA2EBB47B2804A2469C8FF65DDEDE95A03DF10A94060CE9C4A23EDD7CBD7BA6DD8FB67F48395A7FAFF11D3',
        caption: 'Thân máy Armor Aluminum mỏng nhẹ đi kèm bút cảm ứng S Pen đồng bộ',
      },
    ],
    highlights: [
      'Tấm nền Dynamic AMOLED 2X 120Hz cho màu đen sâu tuyệt đối khi xem phim và đọc tài liệu ban đêm.',
      'Đi kèm sẵn bút S Pen trong hộp (sạc từ tính hai chiều sau lưng máy), không tốn thêm chi phí mua rời.',
      'Cả thân máy tính bảng lẫn bút S Pen đều đạt chuẩn kháng nước và bụi IP68 bền bỉ.',
      'Chế độ Samsung DeX biến giao diện máy tính bảng thành cửa sổ đa nhiệm giống máy tính để bàn.',
    ],
    overview: [
      'Samsung Galaxy Tab S9 5G là thiết bị làm việc và giải trí toàn diện ngay khi mở hộp: khung nhôm Armor Aluminum mỏng chỉ 5,9 mm, hệ thống 4 loa tinh chỉnh bởi AKG và khe cắm thẻ nhớ microSD mở rộng tới 1 TB.',
      'Kết nối 5G tích hợp sẵn cho phép bạn duyệt tài liệu đám mây, họp trực tuyến và làm việc từ xa ở bất cứ đâu mà không cần phụ thuộc mạng Wi-Fi công cộng.',
    ],
    specs: [
      { label: 'Màn hình', value: '11 inch Dynamic AMOLED 2X (2560 × 1600), tần số quét 60–120Hz, HDR10+' },
      { label: 'Vi xử lý', value: 'Snapdragon 8 Gen 2 for Galaxy (tiến trình 4nm)' },
      { label: 'RAM & Lưu trữ', value: '8 GB RAM · 128 GB (có khe thẻ nhớ microSD mở rộng tới 1 TB)' },
      { label: 'Bút đi kèm', value: 'S Pen chuẩn IP68 đi sẵn trong hộp, hít nam châm sạc hai chiều' },
      { label: 'Âm thanh & Bảo mật', value: '4 loa AKG hỗ trợ Dolby Atmos · Cảm biến vân tay dưới màn hình' },
      { label: 'Pin & Sạc', value: '8.400 mAh · Hỗ trợ sạc nhanh USB-C 45W' },
      { label: 'Kết nối', value: '5G, Wi-Fi 6E, Bluetooth 5.3, USB-C 3.2 (hỗ trợ xuất hình DeX)' },
      { label: 'Độ mỏng & Trọng lượng', value: 'Dày 5.9 mm · Kháng nước IP68 · Nặng 500 g' },
    ],
  },

  'ipad air 5': {
    tagline: 'Chip Apple M1 mạnh mẽ trong thiết kế màn hình tràn viền 10.9 inch thanh lịch và đa sắc màu.',
    quickSpecs: ['Chip Apple M1', 'Liquid Retina 10.9"', 'Camera trước Center Stage', 'USB-C tốc độ 10Gb/s'],
    gallery: [
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111887_sp866-ipad-air-5gen.png',
        caption: 'Năm tùy chọn màu sắc vỏ nhôm của iPad Air thế hệ 5',
      },
      {
        url: 'https://www.apple.com/newsroom/images/product/ipad/standard/Apple-iPad-Air-hero-color-lineup-220308_big.jpg',
        caption: 'Thiết kế viền mỏng đều bốn cạnh cùng cảm biến vân tay Touch ID trên nút nguồn',
      },
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111887_sp866-portimage2.png',
        caption: 'Cấu trúc loa stereo ngang, cổng USB-C và Smart Connector gắn bàn phím',
      },
    ],
    highlights: [
      'Trang bị chip máy tính Apple M1 với 8 GB RAM — hỗ trợ cả tính năng đa nhiệm cửa sổ Stage Manager.',
      'Màn hình Liquid Retina 10,9 inch ép kính liền mạch (Full Lamination) kèm lớp phủ chống lóa cao cấp.',
      'Camera trước 12MP góc siêu rộng tự động căn khung hình Center Stage khi gọi video học tập, họp nhóm.',
      'Tương thích trọn bộ hệ sinh thái Apple Pencil thế hệ 2 và bàn phím Magic Keyboard có bàn di chuột.',
    ],
    overview: [
      'iPad Air 5 mang sức mạnh dòng chip M1 xuống phân khúc tầm trung, đáp ứng dư dả từ việc ghi chú bài giảng Goodnotes, đọc giáo trình PDF hàng trăm trang cho tới dựng video 4K trên LumaFusion.',
      'Cổng USB-C nâng băng thông lên 10Gb/s (gấp đôi thế hệ trước) giúp chép ảnh từ máy ảnh kỹ thuật số hay ổ cứng di động chỉ trong chớp mắt.',
    ],
    specs: [
      { label: 'Màn hình', value: '10.9 inch Liquid Retina IPS (2360 × 1640), 500 nits, P3 Wide Color, chống lóa' },
      { label: 'Vi xử lý', value: 'Apple M1 (8 nhân CPU, 8 nhân GPU, 16 nhân Neural Engine)' },
      { label: 'RAM & Lưu trữ', value: '8 GB RAM · 64 GB' },
      { label: 'Camera', value: 'Sau 12MP quay 4K 60fps · Trước 12MP Ultra Wide hỗ trợ Center Stage' },
      { label: 'Bảo mật & Âm thanh', value: 'Touch ID tích hợp trên nút nguồn · Loa stereo ở chế độ xoay ngang' },
      { label: 'Cổng & Phụ kiện', value: 'USB-C 3.1 Gen 2 (10Gb/s) · Hỗ trợ Apple Pencil 2 & Magic Keyboard' },
      { label: 'Pin', value: 'Lên đến 10 giờ lướt web hoặc xem video liên tục' },
      { label: 'Độ mỏng & Trọng lượng', value: 'Dày 6.1 mm · Nặng 461 g' },
    ],
  },

  'ipad mini 6': {
    tagline: 'Sổ tay kỹ thuật số 8.3 inch nằm gọn một bàn tay, nhẹ chỉ 293 g và hỗ trợ bút Apple Pencil 2.',
    quickSpecs: ['Màn hình 8.3" gọn nhẹ', 'Chip A15 Bionic', 'Hỗ trợ Apple Pencil 2', 'Siêu nhẹ 293 g'],
    gallery: [
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111886_sp850-ipad-mini-6gen-480.png',
        caption: 'Bốn tông màu trang nhã với viền màn hình mỏng đều hiện đại',
      },
      {
        url: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111886_sp850-pimage.png',
        caption: 'Nút nguồn Touch ID, cụm nút âm lượng đặt cạnh trên để nhường chỗ hít bút từ tính',
      },
    ],
    highlights: [
      'Trọng lượng siêu nhẹ 293 g — cầm đọc sách điện tử, tài liệu chuyên ngành hàng giờ không mỏi cổ tay.',
      'Mật độ điểm ảnh cao nhất dòng iPad (326 ppi) giúp chữ viết nhỏ hiển thị sắc sảo như in trên giấy.',
      'Cạnh bên tích hợp nam châm hít giữ và sạc không dây cho bút cảm ứng Apple Pencil thế hệ 2.',
      'Loa kép stereo ngang và chip A15 Bionic biến máy thành thiết bị giải trí di động cực kỳ linh hoạt.',
    ],
    overview: [
      'iPad mini 6 loại bỏ nút Home truyền thống để mở rộng màn hình lên 8,3 inch trong thân máy nhỏ như một cuốn sổ tay A6, dễ dàng nhét vào túi áo khoác hoặc túi đeo chéo nhỏ.',
      'Đây là thiết bị được giới bác sĩ, phi công, kỹ sư công trình và người mê đọc sách ưa chuộng nhờ sự cơ động tuyệt đối đi kèm cổng USB-C đa năng.',
    ],
    specs: [
      { label: 'Màn hình', value: '8.3 inch Liquid Retina IPS (2266 × 1488, 326 ppi), 500 nits, P3, chống lóa' },
      { label: 'Vi xử lý', value: 'Apple A15 Bionic (6 nhân CPU, 5 nhân GPU, 16 nhân Neural Engine)' },
      { label: 'Bộ nhớ lưu trữ', value: '64 GB' },
      { label: 'Camera', value: 'Sau 12MP có đèn Flash True Tone · Trước 12MP Ultra Wide Center Stage' },
      { label: 'Bảo mật & Âm thanh', value: 'Touch ID trên nút nguồn đỉnh máy · Loa stereo khi đặt ngang' },
      { label: 'Cổng & Phụ kiện', value: 'USB-C (5Gb/s) · Tương thích Apple Pencil thế hệ 2' },
      { label: 'Kết nối không dây', value: 'Wi-Fi 6 · Bluetooth 5.0' },
      { label: 'Kích thước & Trọng lượng', value: '195.4 × 134.8 × 6.3 mm · Nặng 293 g' },
    ],
  },

  'eizo coloredge cg277': {
    tagline: 'Màn hình đồ họa tham chiếu 27 inch tích hợp sẵn cảm biến tự cân chỉnh màu sắc phần cứng.',
    quickSpecs: ['27" QHD IPS 99% Adobe RGB', 'Cảm biến cân màu tích hợp', '10-bit màu (LUT 16-bit)', 'Kèm tấm chắn sáng'],
    gallery: [
      {
        url: 'https://webcube-general.s3.amazonaws.com/eizo/media/contentassets/2014/10/27/product_photo_01_15.png',
        caption: 'Màn hình EIZO ColorEdge CG277 lắp tấm chắn sáng chống phản xạ chuyên dụng',
      },
      {
        url: 'https://webcube-general.s3.amazonaws.com/eizo/media/contentassets/2014/10/27/product_photo_02_15.png',
        caption: 'Chân đế công thái học xoay dọc 90° và điều chỉnh độ cao linh hoạt',
      },
      {
        url: 'https://webcube-general.s3.amazonaws.com/eizo/media/contentassets/2014/10/27/product_photo_03_11.png',
        caption: 'Góc nhìn thiết kế viền máy và cơ cấu ngàm lắp mũ chắn sáng từ tính',
      },
      {
        url: 'https://webcube-general.s3.amazonaws.com/eizo/media/contentassets/2014/10/27/product_photo_04_6.png',
        caption: 'Hệ thống thoát nhiệt và cổng kết nối phía sau thân màn hình',
      },
    ],
    highlights: [
      'Cảm biến hiệu chuẩn màu sắc ẩn trong viền dưới tự động bật lên cân chỉnh theo lịch mà không cần thiết bị đo rời.',
      'Bao phủ 99% không gian màu Adobe RGB và 93% DCI-P3, hiển thị 1,07 tỷ màu thông qua bảng tra 3D-LUT 16-bit.',
      'Mạch cân bằng Digital Uniformity Equalizer (DUE) đảm bảo độ sáng và nhiệt độ màu đồng đều trên toàn bộ mặt phẳng 27 inch.',
      'Đi kèm sẵn bộ mũ chắn sáng (Shading Hood) lót nhung tiêu âm quang học cho công việc in ấn và hậu kỳ phim.',
    ],
    overview: [
      'EIZO ColorEdge CG277 thuộc dòng màn hình tham chiếu phòng lab cao cấp từ Nhật Bản, được sử dụng tại các xưởng in chế bản, studio nhiếp ảnh thương mại và hậu kỳ điện ảnh.',
      'Khác với màn hình thông thường phải chờ 30 phút để ổn định độ sáng, EIZO CG277 đạt độ chuẩn xác màu sắc chỉ sau 7 phút khởi động nhờ cảm biến bù nhiệt độ bên trong.',
    ],
    specs: [
      { label: 'Kích thước & Tấm nền', value: '27 inch IPS chống chói · Độ phân giải QHD (2560 × 1440)' },
      { label: 'Không gian màu', value: '99% Adobe RGB · Hiển thị 10-bit (1.07 tỷ màu) · 3D-LUT 16-bit' },
      { label: 'Hiệu chuẩn phần cứng', value: 'Cảm biến cân màu tích hợp sẵn · Tương thích phần mềm ColorNavigator' },
      { label: 'Cổng kết nối hình ảnh', value: 'DisplayPort (hỗ trợ 10-bit), HDMI (Deep Color), DVI-D + Hub 2× USB' },
      { label: 'Chân đế công thái học', value: 'Nâng hạ 151.5 mm, nghiêng 25°, xoay ngang 344°, xoay dọc 90°' },
      { label: 'Phụ kiện chuyên dụng', value: 'Đi kèm mũ chắn sáng Shading Hood chính hãng EIZO' },
      { label: 'Trọng lượng', value: '12.8 kg (cả chân đế)' },
    ],
  },

  'dell ultrasharp u3415w': {
    tagline: 'Màn hình cong siêu rộng 34 inch tỉ lệ 21:9 mở rộng không gian đa nhiệm thay thế hai màn hình ghép.',
    quickSpecs: ['34" Cong WQHD (3440×1440)', 'Tỉ lệ 21:9 IPS', 'Cân màu sRGB Delta E < 3', 'Tích hợp KVM & Loa 18W'],
    gallery: [
      {
        url: '/catalog/official/dell-u3415w.webp',
        caption: 'Màn hình cong Dell UltraSharp 34 inch tỉ lệ điện ảnh 21:9',
      },
    ],
    highlights: [
      'Không gian ngang 3440 × 1440 cho phép mở song song 3 cửa sổ làm việc hoặc dòng timeline dựng phim dài liền mạch.',
      'Độ cong nhẹ nhàng đưa hai rìa trái phải về cùng khoảng cách nhìn của mắt, giảm hẳn thao tác quay cổ.',
      'Được hiệu chuẩn màu sẵn từ nhà máy đạt 99% sRGB với sai lệch màu Delta E < 3.',
      'Tính năng Picture-by-Picture và bộ chia USB KVM cho phép dùng chung 1 bộ phím chuột điều khiển 2 máy tính.',
    ],
    overview: [
      'Dell UltraSharp U3415W là giải pháp bàn làm việc gọn gàng thay cho 2 màn hình rời bị chia cắt bởi viền giữa. Tấm nền IPS 10-bit (8-bit + FRC) giữ màu sắc đồng nhất từ mọi góc nhìn.',
      'Hệ thống loa kép tích hợp công suất lớn 18W (2 × 9W) bên dưới cạnh đáy đáp ứng tốt nhu cầu họp trực tuyến và giải trí mà không tốn thêm diện tích đặt loa bàn.',
    ],
    specs: [
      { label: 'Kích thước & Độ phân giải', value: '34 inch IPS Cong · WQHD (3440 × 1440) tỉ lệ 21:9 ở 60Hz' },
      { label: 'Độ chuẩn màu', value: '99% sRGB cân chỉnh tại nhà máy (Delta E < 3) · 1.07 tỷ màu' },
      { label: 'Cổng hình ảnh', value: 'HDMI 2.0, DisplayPort 1.2, Mini DisplayPort 1.2, DisplayPort Out (MST)' },
      { label: 'Hub USB & KVM', value: '2 cổng USB 3.0 upstream (KVM 2 máy) + 4 cổng USB 3.0 downstream' },
      { label: 'Âm thanh tích hợp', value: 'Hệ thống loa kép tổng công suất 18W + cổng Audio Line-out' },
      { label: 'Chân đế & Ngàm treo', value: 'Nâng hạ độ cao 115 mm, xoay trái/phải, nghiêng · Ngàm VESA 100×100mm' },
      { label: 'Trọng lượng', value: '11.25 kg (kèm chân đế)' },
    ],
  },

  'airpods pro 2': {
    tagline: 'Chip H2 nâng gấp đôi hiệu quả khử tiếng ồn chủ động cùng chế độ Âm Thanh Thích Ứng thông minh.',
    quickSpecs: ['Chip Apple H2', 'Chống ồn ANC gấp 2x', 'Vuốt chỉnh âm lượng', 'Pin 30 giờ kèm hộp sạc'],
    gallery: [
      {
        url: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/airpods-pro-2.png',
        caption: 'Tai nghe AirPods Pro thế hệ 2 cùng hộp sạc tích hợp loa tìm kiếm và móc dây đeo',
      },
      {
        url: 'https://www.apple.com/newsroom/images/product/airpods/standard/Apple-AirPods-Pro-2nd-gen-hero-220907_big.jpg.large.jpg',
        caption: 'Thiết kế công thái học đi kèm 4 kích cỡ đệm tai silicon mềm mại (XS, S, M, L)',
      },
    ],
    highlights: [
      'Khử tiếng ồn chủ động gấp 2 lần thế hệ đầu, lọc êm tiếng động cơ xe buýt, máy bay và điều hòa văn phòng.',
      'Chế độ Xuyên Âm Thích Ứng tự động giảm cường độ các âm thanh chói tai đột ngột như còi xe hay tiếng khoan.',
      'Cảm ứng chạm trên thân tai nghe cho phép vuốt nhẹ lên/xuống để tăng giảm âm lượng trực tiếp.',
      'Hộp sạc kháng mồ hôi/bụi tích hợp loa phát âm báo định vị chính xác trong ứng dụng Tìm (Find My).',
    ],
    overview: [
      'AirPods Pro 2 sử dụng củ loa độ méo thấp kết hợp bộ khuếch đại dải động cao thiết kế riêng, mang lại dải trầm sâu gọn và giọng hát tách bạch ở cả mức âm lượng nhỏ.',
      'Tính năng Nhận Biết Cuộc Hội Thoại tự hạ nhạc và làm rõ tiếng người đối diện ngay khi bạn bắt đầu cất lời nói chuyện mà không cần tháo tai nghe.',
    ],
    specs: [
      { label: 'Vi xử lý âm thanh', value: 'Chip tai nghe Apple H2 · Chip định vị U1 trong hộp sạc' },
      { label: 'Công nghệ âm thanh', value: 'Chống ồn chủ động ANC, Âm Thanh Thích Ứng, Xuyên Âm, Spatial Audio' },
      { label: 'Điều khiển trên tai', value: 'Nhấn để phát/nhận cuộc gọi, nhấn giữ đổi chế độ, vuốt chỉnh âm lượng' },
      { label: 'Thời lượng pin', value: 'Tới 6 giờ nghe liên tục (bật ANC) · Tới 30 giờ khi dùng kèm hộp sạc' },
      { label: 'Chuẩn kháng bụi & Nước', value: 'Kháng mồ hôi, bụi và tia nước cho cả tai nghe lẫn hộp sạc' },
      { label: 'Sạc năng lượng', value: 'Sạc có dây, sạc không dây từ tính MagSafe / chuẩn Qi / sạc Apple Watch' },
      { label: 'Phụ kiện trong hộp', value: '4 bộ nút tai silicon (XS, S, M, L) và cáp sạc chính hãng' },
    ],
  },

  'sony wh-1000xm3': {
    tagline: 'Tai nghe chụp tai chống ồn trứ danh với bộ xử lý QN1, đệm tai cực êm và pin bền bỉ 30 giờ.',
    quickSpecs: ['Bộ xử lý chống ồn QN1', 'Chuẩn Hi-Res Audio LDAC', 'Pin 30 giờ + Sạc nhanh', 'Đệm tai Urethane êm ái'],
    gallery: [
      {
        url: 'https://www.sony.jp/products/picture/WH-1000XM3.jpg',
        caption: 'Hai phiên bản màu Đen viền đồng và Bạc Platinum với thiết kế gập gọn du lịch',
      },
    ],
    highlights: [
      'Bộ xử lý HD Noise Cancelling QN1 chuyên biệt lọc sạch cả tạp âm trầm lẫn tiếng nói chuyện xung quanh.',
      'Màng loa 40 mm phủ tinh thể lỏng (LCP) hỗ trợ codec LDAC truyền tải nhạc không dây chuẩn Hi-Res 990 kbps.',
      'Áp bàn tay phải lên củ tai (Quick Attention) để nghe thông báo bên ngoài tức thì mà không cần dừng nhạc.',
      'Sạc nhanh qua cổng USB-C: chỉ 10 phút cắm sạc cho thêm tới 5 giờ nghe nhạc liên tục.',
    ],
    overview: [
      'Sony WH-1000XM3 nổi tiếng nhờ trọng lượng nhẹ chỉ 255 g cùng lớp mút đệm tai Urethane phân tán áp lực đồng đều, đeo làm việc xuyên suốt buổi chiều hoặc trên chuyến bay dài mà không gây nóng bức vành tai.',
      'Cơ cấu bản lề gập phẳng thông minh đi kèm hộp đựng cứng cáp, cáp âm thanh 3.5 mm để nghe có dây ngay cả khi hết pin.',
    ],
    specs: [
      { label: 'Củ loa & Dải tần', value: 'Dynamic 40 mm màng LCP · Tần số đáp ứng 4 Hz – 40.000 Hz' },
      { label: 'Chống ồn', value: 'Bộ xử lý HD QN1 · Tối ưu áp suất khí quyển khi đi máy bay' },
      { label: 'Chuẩn Bluetooth & Codec', value: 'Bluetooth + NFC một chạm · Hỗ trợ SBC, AAC, aptX, aptX HD, LDAC' },
      { label: 'Điều khiển', value: 'Mặt cảm ứng vuốt/chạm trên chụp tai phải + Chế độ Quick Attention' },
      { label: 'Thời lượng pin', value: 'Tối đa 30 giờ (bật ANC) · Sạc qua USB-C (10 phút = 5 giờ nghe)' },
      { label: 'Nghe có dây', value: 'Giắc 3.5 mm mạ vàng đi kèm trong hộp bảo vệ' },
      { label: 'Trọng lượng', value: '255 g' },
    ],
  },

  'logitech mx master 3s': {
    tagline: 'Chuột công thái học chuẩn mực cho dân sáng tạo với nút bấm yên tĩnh Quiet Clicks và cuộn từ trường MagSpeed.',
    quickSpecs: ['Cảm biến 8.000 DPI trên kính', 'Nút bấm êm giảm 90% ồn', 'Cuộn từ trường MagSpeed', 'Kết nối 3 thiết bị'],
    gallery: [
      {
        url: 'https://www.logitech.com/content/dam/logitech/en/products/mice/mx-master-3s/2025-update/mx-master-3s-bluetooth-edition-left-front-view-graphite-new-8.png',
        caption: 'Thiết kế ôm sát lòng bàn tay phải với hai con lăn kim loại gia công cơ khí',
      },
      {
        url: 'https://resource.logitech.com/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png',
        caption: 'Góc nhìn từ trên xuống: con lăn dọc MagSpeed và con lăn ngang dành cho ngón cái',
      },
      {
        url: 'https://resource.logitech.com/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-3-4-view-graphite.png',
        caption: 'Bề mặt vân nhám chống trượt cùng bệ đỡ ngón cái tích hợp nút cử chỉ (Gesture)',
      },
      {
        url: 'https://resource.logitech.com/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-back-view-graphite.png',
        caption: 'Độ nghiêng công thái học nâng đỡ cổ tay tự nhiên khi làm việc dài giờ',
      },
    ],
    highlights: [
      'Công tắc Quiet Clicks giảm 90% tiếng click chuột nhưng vẫn giữ trọn cảm giác khấc phản hồi rõ ràng.',
      'Bánh xe thép điện từ MagSpeed lướt 1.000 dòng mã hoặc bảng tính Excel mỗi giây hoàn toàn êm ái.',
      'Cảm biến quang học Darkfield nâng lên 8.000 DPI hoạt động mượt ngay cả trên mặt bàn kính trong suốt.',
      'Con lăn ngang ở ngón cái cực tiện lợi để trượt ngang bảng dữ liệu hoặc timeline Premiere / Figma.',
    ],
    overview: [
      'Logitech MX Master 3S được xem là mảnh ghép nâng tầm năng suất trên mọi bàn làm việc hiện đại. Phần mềm Logi Options+ cho phép gán phím tắt riêng biệt cho từng ứng dụng như VS Code, Photoshop, Chrome hay Excel.',
      'Chuột lưu sẵn 3 thiết bị (Mac, Windows, iPad) chuyển đổi bằng một nút bấm dưới đáy, pin dùng tới 70 ngày cho mỗi lần sạc đầy qua cổng USB-C.',
    ],
    specs: [
      { label: 'Cảm biến', value: 'Darkfield độ chính xác cao · 200 – 8.000 DPI (chỉnh bước 50 DPI), chạy trên kính ≥ 4mm' },
      { label: 'Hệ thống nút & Cuộn', value: '7 nút (Quiet Clicks êm ái) · Bánh cuộn điện từ MagSpeed + Bánh cuộn ngang' },
      { label: 'Kết nối không dây', value: 'Bluetooth Low Energy & đầu thu USB Logi Bolt · Chuyển nhanh 3 máy' },
      { label: 'Phần mềm tùy biến', value: 'Logi Options+ hỗ trợ cấu hình riêng theo từng phần mềm và Logitech Flow' },
      { label: 'Pin & Sạc', value: 'Pin sạc Li-Po 500 mAh dùng tới 70 ngày · Sạc nhanh USB-C (1 phút = 3 giờ)' },
      { label: 'Tương thích', value: 'macOS, Windows, Linux, iPadOS, ChromeOS' },
      { label: 'Kích thước & Trọng lượng', value: '124.9 × 84.3 × 51 mm · Nặng 141 g' },
    ],
  },

  'keychron k8': {
    tagline: 'Bàn phím cơ không dây bố cục Tenkeyless 87 phím tương thích hoàn hảo cả macOS lẫn Windows.',
    quickSpecs: ['Layout TKL 87 phím', 'Bluetooth 5.1 (3 máy) & USB-C', 'Tương thích Mac / Win', 'Pin lớn 4.000 mAh'],
    gallery: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0059/0630/1017/products/Keychron-K8-tenkeyless-wireless-mechanical-keyboard-for-Mac-Windows-iOS-RGB-white-backlight-with-Gateron-switch-red.jpg',
        caption: 'Bố cục Tenkeyless 87 phím gọn gàng với tông màu xám hai sắc độ cổ điển',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0059/0630/1017/products/K8-C1-J1-Keychron-K8-tenkeyless-wireless-mechanical-keyboard-for-Mac-Windows-iOS-RGB-white-backlight-aluminum-frame-with-Hot-swappable-Gateron-switch-red.jpg',
        caption: 'Chi tiết switch cơ học Gateron độ bền 50 triệu lần nhấn và độ nghiêng chân đế',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0059/0630/1017/products/Keychron-K8-tenkeyless-wireless-mechanical-keyboard-for-Mac-Windows-iOS-RGB-white-backlight-with-Gateron-switch-brown.jpg',
        caption: 'Đi kèm bộ keycap Command/Option cho macOS và Windows/Alt để thay thế linh hoạt',
      },
    ],
    highlights: [
      'Bố cục TKL 87 phím giữ trọn cụm phím điều hướng và F1–F12 nhưng lược bỏ cụm phím số để rộng chỗ di chuột.',
      'Công tắc gạt cạnh bên chuyển tức thì giữa chế độ Mac/iOS và Windows/Android đúng chuẩn hàng phím media.',
      'Kết nối không dây Bluetooth 5.1 ổn định tới 3 thiết bị cùng lúc hoặc cắm dây USB Type-C độ trễ thấp.',
      'Viên pin dung lượng cao 4.000 mAh nằm trong nhóm bền bỉ nhất phân khúc bàn phím cơ không dây.',
    ],
    overview: [
      'Keychron K8 là chiếc bàn phím cơ nhập môn và làm việc văn phòng cực kỳ thực dụng: không cần cài phần mềm phức tạp, mở hộp là kết nối ngay với MacBook, PC Windows và iPad chỉ qua tổ hợp Fn + 1/2/3.',
      'Chân đế phía dưới hỗ trợ 2 nấc nâng góc nghiêng (6° và 9°) kết hợp keycap cong ôm đầu ngón tay giúp gõ code và soạn thảo văn bản êm ái suốt cả ngày.',
    ],
    specs: [
      { label: 'Bố cục phím', value: 'Tenkeyless (TKL - 80%) gồm 87 phím tiêu chuẩn ANSI' },
      { label: 'Switch cơ học', value: 'Gateron Mechanical Switch · Độ bền 50 triệu lần nhấn' },
      { label: 'Kết nối', value: 'Bluetooth 5.1 (ghép nối 3 thiết bị) hoặc có dây qua cổng USB Type-C' },
      { label: 'Hệ điều hành hỗ trợ', value: 'macOS, Windows, Linux, iOS, Android (có cần gạt chuyển hệ riêng)' },
      { label: 'Dung lượng pin', value: '4.000 mAh Li-Polymer sạc lại qua cáp USB-C' },
      { label: 'Tính năng gõ', value: 'N-Key Rollover (NKRO ở chế độ dây) chống xung đột phím tuyệt đối' },
      { label: 'Phụ kiện đi kèm', value: 'Cáp USB-A to USB-C bọc dù, dụng cụ nhổ keycap, bộ keycap Mac & Windows' },
      { label: 'Kích thước & Trọng lượng', value: '355 × 123 mm · Nặng khoảng 740 g' },
    ],
  },
};

function buildCategoryFallback(product) {
  const categoryName = product?.category?.name || 'Thiết bị công nghệ';
  const primaryUrl =
    officialProductPhotos.get(product?.imageUrl) || resolveProductImage(product?.imageUrl);

  return {
    tagline: product?.description || `${categoryName} chính hãng phân phối tại The Tech Shop.`,
    quickSpecs: [categoryName, 'Chính hãng 100%', 'Bảo hành tiêu chuẩn'],
    gallery: [{ url: primaryUrl, caption: product?.name || categoryName }],
    highlights: [
      'Sản phẩm mới nguyên hộp, đầy đủ phụ kiện tiêu chuẩn theo công bố của nhà sản xuất.',
      'Tồn kho và giá bán hiển thị minh bạch theo thời gian thực trên hệ thống cửa hàng.',
      'Kiểm tra ngoại quan và xác nhận thông tin giao nhận rõ ràng trước khi hoàn tất đặt hàng.',
    ],
    overview: product?.description ? [product.description] : [],
    specs: [
      { label: 'Tên sản phẩm', value: product?.name || '—' },
      { label: 'Danh mục', value: categoryName },
      { label: 'Tình trạng', value: 'Mới 100%, nguyên niêm phong' },
      { label: 'Chính sách bảo hành', value: '12 tháng theo tiêu chuẩn nhà sản xuất' },
    ],
  };
}

export function getProductCatalogDetail(product) {
  if (!product) return null;
  const key = (product.name || '').trim().toLocaleLowerCase('vi');
  const detail = CATALOG_BY_NAME[key];
  if (!detail) {
    return buildCategoryFallback(product);
  }

  const primaryUrl =
    officialProductPhotos.get(product.imageUrl) || resolveProductImage(product.imageUrl);
  const gallery = detail.gallery?.length
    ? detail.gallery
    : [{ url: primaryUrl, caption: product.name }];

  return {
    ...detail,
    gallery,
  };
}
