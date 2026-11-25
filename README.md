<h1 align="center">The Tech Shop</h1>

<p align="center">
  Cửa hàng thiết bị công nghệ — từ khám phá sản phẩm đến quản lý đơn hàng.
  <br />
  Xây dựng với React, Spring Boot và PostgreSQL.
</p>

<p align="center">
  <a href="https://github.com/conglam56/E-Commerce/actions/workflows/ci.yml"><img src="https://github.com/conglam56/E-Commerce/actions/workflows/ci.yml/badge.svg?branch=main" alt="Build and test" /></a>
  <img src="https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white" alt="Java 17" />
  <img src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
</p>

<p align="center">
  <a href="https://the-tech-shop-storefront.onrender.com/"><strong>Xem demo</strong></a>
  · <a href="https://the-tech-shop-storefront.onrender.com/swagger-ui/index.html">Tài liệu API</a>
  · <a href="#chạy-nhanh">Chạy nhanh</a>
  · <a href="https://github.com/conglam56/E-Commerce/actions">CI / Build</a>
</p>

![Giao diện trang chủ The Tech Shop](docs/screenshots/storefront.png)

The Tech Shop là dự án thương mại điện tử full-stack dành cho thiết bị và phụ kiện công nghệ. Khách hàng có thể tìm sản phẩm, quản lý giỏ hàng, đặt đơn và xem hồ sơ; quản trị viên quản lý danh mục, sản phẩm và tiến trình đơn hàng. Giá và tồn kho được kiểm tra ở backend khi đặt đơn.

> **Demo online:** [the-tech-shop-storefront.onrender.com](https://the-tech-shop-storefront.onrender.com/). Đăng ký tài khoản để dùng thử. Demo chạy trên Render Free nên lần truy cập đầu sau một thời gian không hoạt động có thể cần chờ khởi động.

## Mục lục

- [Tính năng](#tính-năng)
- [Giao diện](#giao-diện)
- [Công nghệ và kiến trúc](#công-nghệ-và-kiến-trúc)
- [Chạy nhanh](#chạy-nhanh)
- [Phát triển cục bộ](#phát-triển-cục-bộ)
- [Cấu hình](#cấu-hình)
- [Tài khoản và phân quyền](#tài-khoản-và-phân-quyền)
- [Kiểm tra và đóng gói](#kiểm-tra-và-đóng-gói)
- [Triển khai](#triển-khai)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Phạm vi demo](#phạm-vi-demo)

## Tính năng

| Khu vực | Chức năng |
| --- | --- |
| **Cửa hàng** | Sản phẩm nổi bật, tìm kiếm, lọc danh mục, sắp xếp giá và phân trang phía server |
| **Chi tiết sản phẩm** | Thư viện ảnh, mô tả, thông số tham khảo, giá và tồn kho; nhập số lượng trực tiếp hoặc dùng nút tăng/giảm |
| **Tài khoản** | Đăng ký, đăng nhập bằng JWT, avatar chữ cái và hồ sơ cá nhân |
| **Mật khẩu** | Kiểm tra ngay khi nhập ở đăng ký và đổi mật khẩu; tối thiểu 6 ký tự, xác nhận mật khẩu và kiểm tra mật khẩu hiện tại ở server |
| **Giỏ hàng** | Thêm, cập nhật số lượng, xóa sản phẩm và tính tổng tiền ở backend |
| **Đơn hàng** | Đặt hàng COD, xem lịch sử và chi tiết đơn, hủy đơn đủ điều kiện |
| **Quản trị** | Quản lý sản phẩm, danh mục và cập nhật trạng thái đơn hàng; kiểm tra quyền ADMIN tại API |
| **Toàn vẹn dữ liệu** | Transaction khi đặt/hủy đơn, lưu giá tại thời điểm đặt, trừ/hoàn tồn kho và optimistic locking để phát hiện xung đột |

Luồng đơn hàng: `PENDING → CONFIRMED → SHIPPED → DELIVERED`. Khách hàng có thể hủy đơn `PENDING`; quản trị viên có thể hủy đơn `PENDING` hoặc `CONFIRMED`. Hủy thành công sẽ hoàn lại tồn kho.

## Giao diện

Giao diện sử dụng logo khối mở mới, cùng hệ thống nút bấm và biểu mẫu thống nhất. Trang chủ có thanh tìm kiếm nhanh, sản phẩm nổi bật, danh mục và lưới sản phẩm. Trang chi tiết hỗ trợ nhiều góc nhìn sản phẩm. Giao diện thích ứng với màn hình máy tính và điện thoại, có trạng thái tải, lỗi và dữ liệu trống; hộp thoại quản lý sản phẩm hỗ trợ thao tác bằng bàn phím.

Các ảnh bên dưới và ảnh trang chủ phía trên được chụp từ giao diện hiện tại với dữ liệu minh họa; thông tin tài khoản và đơn hàng trong ảnh không phải dữ liệu khách hàng thật.

| Đặt hàng | Quản lý đơn hàng |
| --- | --- |
| ![Giỏ hàng và thông tin đặt hàng](docs/screenshots/checkout.png) | ![Trang quản trị đơn hàng](docs/screenshots/admin-orders.png) |

[Xem giao diện đặt hàng trên điện thoại](docs/screenshots/checkout-mobile.png)

## Công nghệ và kiến trúc

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 18, React Router, Vite 6, Tailwind CSS 4, Axios, Lucide |
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT, BCrypt |
| Dữ liệu | PostgreSQL 16, Spring Data JPA, Flyway, MapStruct |
| Kiểm thử | JUnit 5, Mockito |
| CI / Triển khai | GitHub Actions, Docker multi-stage, Render |

```mermaid
flowchart LR
    Client[React] -->|REST API + JWT| API[Spring Boot]
    API --> Security[Spring Security]
    API --> Service[Transactional services]
    Service --> JPA[Spring Data JPA]
    JPA --> DB[(PostgreSQL)]
    Flyway[Flyway migrations] --> DB
```

Trong môi trường phát triển, Vite chuyển tiếp `/api` đến Spring Boot. Trên Render, React được build vào ứng dụng Spring Boot để giao diện và API dùng chung tên miền.

## Chạy nhanh

**Yêu cầu:** Git và Docker Desktop có Docker Compose.

```sh
git clone https://github.com/conglam56/E-Commerce.git
cd E-Commerce
```

Sao chép cấu hình mẫu bằng PowerShell:

```powershell
Copy-Item .env.example .env
```

Điền `DB_PASSWORD` và `JWT_SECRET` trong `.env`. Dùng lệnh dưới đây để tạo khóa JWT ngẫu nhiên, rồi sao chép kết quả vào `JWT_SECRET`:

```powershell
$jwtBytes = New-Object byte[] 48
$jwtRng = [Security.Cryptography.RandomNumberGenerator]::Create()
$jwtRng.GetBytes($jwtBytes)
[Convert]::ToBase64String($jwtBytes)
$jwtRng.Dispose()
```

Khởi động toàn bộ ứng dụng:

```sh
docker compose up -d --build
docker compose ps
```

Mở **[localhost:3000](http://localhost:3000)**. Flyway tự khởi tạo schema và catalog mẫu khi backend kết nối database mới.

| Dịch vụ | Địa chỉ |
| --- | --- |
| Giao diện Docker | [localhost:3000](http://localhost:3000) |
| REST API | [localhost:8080/api](http://localhost:8080/api) |
| Swagger UI | [localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) |
| PostgreSQL | `localhost:5434`, database `e-commerce` |

## Phát triển cục bộ

**Yêu cầu:** JDK 17+, Maven 3.9+, Node.js 22+ và PostgreSQL. Chuẩn bị `.env` như phần [Chạy nhanh](#chạy-nhanh).

Chạy PostgreSQL bằng Docker, sau đó khởi động backend từ thư mục gốc:

```sh
docker compose up -d postgres
mvn spring-boot:run
```

Mở terminal khác để chạy frontend:

```sh
cd frontend
npm ci
npm run dev
```

Truy cập **[localhost:5173](http://localhost:5173)**. Vite mặc định proxy `/api` đến `http://localhost:8080`.

Nếu đang chạy toàn bộ stack bằng Docker, dừng hai dịch vụ ứng dụng trước khi chạy Maven và Vite để tránh trùng cổng:

```sh
docker compose stop frontend backend
```

## Cấu hình

Spring Boot đọc `.env` khi được chạy từ thư mục gốc. Biến môi trường của tiến trình có thể ghi đè các giá trị trong tệp. `.env` được Git bỏ qua; chỉ commit tệp mẫu [.env.example](.env.example).

| Biến | Mục đích | Giá trị / lưu ý |
| --- | --- | --- |
| `DB_URL` | JDBC URL PostgreSQL | Cục bộ: `jdbc:postgresql://localhost:5434/e-commerce` |
| `DB_USERNAME` | Người dùng database | Tệp mẫu dùng `postgres` |
| `DB_PASSWORD` | Mật khẩu database | Tự thiết lập trong môi trường chạy |
| `JWT_SECRET` | Khóa ký JWT dạng Base64 | Ít nhất 32 byte ngẫu nhiên trước khi mã hóa |
| `JWT_EXPIRATION` | Thời hạn JWT, mili giây | `3600000` tương đương 1 giờ |
| `VITE_API_BASE_URL` | Địa chỉ API khi build frontend | Mặc định `/api`; đặt khi dùng API ở host khác |
| `DEMO_ADMIN_EMAIL` | Email tài khoản demo cần cấp quyền ADMIN khi backend khởi động | Tùy chọn; tài khoản phải đã đăng ký và đang hoạt động |

## Tài khoản và phân quyền

Tài khoản đăng ký qua giao diện có quyền **CUSTOMER**. Chọn avatar trên thanh điều hướng để xem họ tên, email, vai trò và đổi mật khẩu.

Demo online có tài khoản quản trị được cấu hình riêng; thông tin truy cập được cung cấp trực tiếp cho người dùng thử quản trị.

<details>
<summary><strong>Tạo quản trị viên trên máy</strong></summary>

Đăng ký một tài khoản qua giao diện, rồi mở PostgreSQL cục bộ:

```sh
docker compose exec postgres psql -U postgres -d e-commerce
```

Thay email bên dưới bằng tài khoản vừa đăng ký. Dùng username database đã cấu hình nếu khác `postgres`.

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-demo-admin@example.com';
```

Đăng xuất rồi đăng nhập lại để nhận quyền mới. Khi triển khai demo, có thể dùng biến môi trường `DEMO_ADMIN_EMAIL` thay cho thao tác SQL; mật khẩu hiện có được giữ nguyên.

</details>

## Kiểm tra và đóng gói

| Mục tiêu | Lệnh | Thư mục |
| --- | --- | --- |
| Chạy test backend | `mvn test` | Gốc repository |
| Kiểm tra và đóng gói backend | `mvn verify` | Gốc repository |
| Cài dependency frontend | `npm ci` | `frontend` |
| Build frontend | `npm run build` | `frontend` |

Test backend dùng JUnit và Mockito, không cần database cho `mvn test`. Các test kiểm tra xác thực, điều kiện đăng ký, cấp quyền admin demo, giỏ hàng, quy trình đặt/hủy đơn và xung đột tồn kho.

[GitHub Actions](.github/workflows/ci.yml) chạy `mvn verify` và build frontend cho mỗi push hoặc pull request.

Sau `mvn verify`, chạy backend đã đóng gói với cấu hình database trong `.env`:

```sh
java -jar target/ecommerce-0.0.1-SNAPSHOT.jar
```

## Triển khai

**Demo:** [the-tech-shop-storefront.onrender.com](https://the-tech-shop-storefront.onrender.com/)

[render.yaml](render.yaml) khai báo một Web Service và một PostgreSQL riêng. [Dockerfile.render](Dockerfile.render) build React, đưa tài nguyên frontend vào Spring Boot, chạy `mvn verify` và tạo image chạy ứng dụng.

Web Service và Blueprint của demo theo dõi nhánh **`main`**, với **Auto-Deploy: On Commit**. Push hoặc merge vào `main` sẽ kích hoạt Render build và kiểm tra sức khỏe trước khi cập nhật ứng dụng tại cùng URL.

Để triển khai trên tài khoản Render khác:

1. Tạo Blueprint từ repository này, chọn nhánh `main` và tệp `render.yaml`.
2. Render tạo PostgreSQL, liên kết thông tin kết nối và sinh khóa JWT từ Blueprint.
3. Sau khi deploy thành công, đăng ký tài khoản qua giao diện.
4. Nếu cần quản trị demo, thêm `DEMO_ADMIN_EMAIL` trong Environment của Web Service và deploy lại.

Xem [giới hạn Render Free](https://render.com/docs/free) trước khi dùng dịch vụ và database miễn phí lâu dài.

## Cấu trúc dự án

```text
E-Commerce/
├── frontend/
│   ├── public/catalog/            # Ảnh catalog và thông tin nguồn ảnh
│   └── src/
│       ├── components/            # Navbar, avatar, ảnh sản phẩm, form dùng chung
│       ├── context/               # Trạng thái xác thực và giỏ hàng
│       ├── pages/                 # Cửa hàng, hồ sơ, đơn hàng, quản trị
│       └── utils/                 # Định dạng và nội dung catalog
├── src/main/java/com/javaweb/ecommerce/
│   ├── controller/                # REST endpoints
│   ├── service/                   # Nghiệp vụ và transaction
│   ├── repository/                # Truy cập dữ liệu qua JPA
│   └── security/                  # Spring Security và JWT
├── src/main/resources/db/migration/ # Schema và dữ liệu mẫu Flyway
├── src/test/                      # Test backend
├── docs/screenshots/              # Ảnh giao diện
├── .github/workflows/ci.yml        # Kiểm tra tự động
├── docker-compose.yml             # Stack phát triển cục bộ
└── render.yaml                    # Hạ tầng demo trên Render
```

## Phạm vi demo

COD là luồng đặt hàng chính; chuyển khoản chỉ mô phỏng lựa chọn thanh toán. Cổng thanh toán, vận chuyển và email thực tế chưa được tích hợp. Dùng thông tin giao hàng minh họa khi thử đặt đơn trên demo công khai.

Ảnh và thông số catalog phục vụ minh họa sản phẩm. Ảnh có nguồn từ CDN và có ảnh dự phòng khi không tải được; xem [thông tin nguồn ảnh](frontend/public/catalog/photo-credits.html).
