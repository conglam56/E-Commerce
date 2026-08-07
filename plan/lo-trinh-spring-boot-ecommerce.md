# Lộ Trình Học Spring Boot Qua Dự Án: E-Commerce Backend (Production-Level)

> Cách học: mỗi giai đoạn = học lý thuyết tối thiểu cần thiết → áp dụng ngay vào dự án e-commerce → có 1 milestone rõ ràng để commit lên GitHub.
> Thời gian tham khảo: 4-5 tháng nếu học đều 2-3 giờ/ngày.

---

## Tổng quan dự án sẽ xây dựng

**Tên gợi ý:** `commerce-api`

**Domain chính:** Product, Category, Inventory, Cart, Order, Payment, User, Review

**Điểm nhấn kỹ thuật (khác biệt so với e-commerce clone thông thường):**
- Xử lý tồn kho chống oversell khi có concurrent request (optimistic/pessimistic lock)
- Order có state machine rõ ràng, validate chuyển trạng thái
- Tích hợp payment gateway thật (Stripe test mode hoặc VNPay/Momo sandbox)
- Kiến trúc event-driven cho các tác vụ sau khi thanh toán (trừ kho, gửi email, tạo invoice)
- Test race condition bằng Testcontainers
- Dashboard thống kê doanh thu, sản phẩm bán chạy
- Đóng gói Docker, có CI/CD

---

## GIAI ĐOẠN 0: Chuẩn bị & Setup (3-5 ngày)

### Lý thuyết cần nắm
- Java 17+, Maven/Gradle
- Git flow cơ bản: branch, commit message chuẩn (`feat:`, `fix:`, `docs:`)
- Spring Boot là gì, auto-configuration, starter

### Việc cần làm cho dự án
1. Tạo project qua Spring Initializr với dependencies: `Spring Web`, `Spring Data JPA`, `Validation`, `PostgreSQL Driver`, `Lombok`.
2. Thiết lập cấu trúc package chuẩn: `controller`, `service`, `repository`, `entity`, `dto`, `exception`, `config`.
3. Khởi tạo Git repo, viết README sườn (sẽ hoàn thiện dần), commit đầu tiên `feat: initial project setup`.
4. Vẽ sơ đồ ERD nháp cho các bảng: `User`, `Product`, `Category`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Review`.

**Milestone:** Project chạy được, connect DB thành công, README có mô tả sơ bộ dự án.

---

## GIAI ĐOẠN 1: REST API cơ bản cho Product & Category (1-2 tuần)

### Lý thuyết cần nắm
- `@RestController`, `@RequestMapping`, HTTP method, status code
- DTO pattern (Request DTO / Response DTO, không trả Entity trực tiếp)
- `@Valid`, Bean Validation (`@NotBlank`, `@Min`, `@Positive`)
- `@ControllerAdvice` + `@ExceptionHandler` xử lý lỗi tập trung
- `ResponseEntity`

### Việc cần làm cho dự án
1. Entity `Category` (id, name, slug) và `Product` (id, name, description, price, quantity, categoryId).
2. Xây CRUD API đầy đủ cho `Product` và `Category`, dùng DTO riêng cho request/response.
3. Validate: `price` phải dương, `quantity` không âm, `name` không rỗng.
4. Global Exception Handler: xử lý `ProductNotFoundException`, `ValidationException`, lỗi 500 chung — trả về format lỗi thống nhất (code, message, timestamp).
5. Thêm phân trang + tìm kiếm cho `GET /api/products` (lọc theo category, khoảng giá, tên).
6. Viết Postman collection hoặc file `.http` test toàn bộ API.

**Milestone:** CRUD Product/Category hoàn chỉnh, validate và error handling nhất quán.

---

## GIAI ĐOẠN 2: Database quan hệ & Category → Product (1-2 tuần)

### Lý thuyết cần nắm
- `@OneToMany`, `@ManyToOne`, Lazy vs Eager loading
- N+1 query problem và cách phát hiện/khắc phục (`JOIN FETCH`, `@EntityGraph`)
- Flyway để quản lý migration

### Việc cần làm cho dự án
1. Thiết lập quan hệ `Category (1) - (N) Product` bằng `@ManyToOne`/`@OneToMany`.
2. Viết Flyway migration cho toàn bộ schema hiện tại (`V1__init_schema.sql`, `V2__add_category.sql`...).
3. Viết custom query: sản phẩm theo category kèm join fetch để tránh N+1.
4. Bật hiển thị SQL log (`show-sql`), kiểm tra số lượng query khi gọi `GET /api/products` — phát hiện và fix N+1 nếu có.

**Milestone:** Schema có migration version hóa, không còn N+1 query khi load danh sách sản phẩm.

---

## GIAI ĐOẠN 3: Authentication & Authorization (2-3 tuần)

### Lý thuyết cần nắm
- Spring Security filter chain
- Mã hóa mật khẩu `BCryptPasswordEncoder`
- JWT: cấu trúc, sinh/verify token, refresh token
- `@PreAuthorize`, phân quyền theo Role (`CUSTOMER`, `ADMIN`)
- CORS configuration

### Việc cần làm cho dự án
1. Entity `User` (id, email, password, role).
2. API `POST /api/auth/register`, `POST /api/auth/login` — sinh JWT + refresh token.
3. Filter xác thực JWT cho các API cần đăng nhập.
4. Phân quyền: `ADMIN` mới được tạo/sửa/xóa Product & Category; `CUSTOMER` chỉ xem và mua hàng.
5. API `POST /api/auth/refresh` để cấp lại access token từ refresh token.
6. Viết test: đăng ký → login → gọi API cần quyền ADMIN bằng token CUSTOMER → phải trả 403.

**Milestone:** Luồng auth đầy đủ, phân quyền hoạt động đúng, có refresh token.

---

## GIAI ĐOẠN 4: Cart — Trạng thái & Đồng bộ (1-2 tuần)

### Lý thuyết cần nắm
- Thiết kế Cart gắn với User (không dùng session để dễ đồng bộ đa thiết bị)
- `@Transactional` và ranh giới transaction
- Xử lý cập nhật số lượng, xóa item, tính tổng tiền

### Việc cần làm cho dự án
1. Entity `Cart` (thuộc về 1 User) và `CartItem` (Cart - Product - quantity).
2. API: thêm sản phẩm vào giỏ, cập nhật số lượng, xóa item, xem giỏ hàng, tính tổng tiền.
3. Xử lý case: sản phẩm trong giỏ bị hết hàng hoặc bị xóa khỏi hệ thống → trả cảnh báo khi checkout.
4. Cơ chế "cart hết hạn" đơn giản: đánh dấu `updatedAt`, viết scheduled job dọn cart cũ (chuẩn bị cho Giai đoạn 8).

**Milestone:** Giỏ hàng hoạt động đầy đủ, tính đúng tổng tiền, xử lý được case sản phẩm không còn hợp lệ.

---

## GIAI ĐOẠN 5: Order & State Machine — Phần trọng tâm của dự án (2-3 tuần)

### Lý thuyết cần nắm
- Thiết kế State Machine đơn giản trong Spring (enum + validate transition, không cần thư viện phức tạp)
- `@Transactional` với `isolation` và `propagation`
- **Optimistic Locking** (`@Version`) và **Pessimistic Locking** (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) — chống oversell
- Race condition là gì, tại sao xảy ra khi nhiều request cùng đặt 1 sản phẩm còn ít tồn kho

### Việc cần làm cho dự án
1. Entity `Order` (status: `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`) và `OrderItem`.
2. Định nghĩa bảng chuyển trạng thái hợp lệ (VD: `PENDING → PAID`, `PAID → SHIPPED`, không cho `DELIVERED → PENDING`), validate trong Service khi update status.
3. API `POST /api/orders` (checkout từ Cart): trừ tồn kho, tạo Order + OrderItem, xóa Cart.
4. **Thêm `@Version` vào Product để optimistic lock** — khi 2 request cùng checkout 1 sản phẩm còn 1 số lượng, 1 request phải fail với `OptimisticLockException` và trả lỗi rõ ràng ("Sản phẩm vừa hết hàng").
5. Viết test mô phỏng 2 thread cùng đặt hàng 1 sản phẩm còn số lượng = 1 (dùng `ExecutorService` hoặc Testcontainers) — xác nhận chỉ 1 đơn thành công.
6. API `GET /api/orders`, `GET /api/orders/{id}`, `PUT /api/orders/{id}/status` (chỉ ADMIN).

**Milestone:** Order có state machine rõ ràng, chống oversell đã được test bằng concurrent request thật.

---

## GIAI ĐOẠN 6: Thanh toán — Payment Gateway thật (2-3 tuần)

### Lý thuyết cần nắm
- Luồng thanh toán online: tạo payment intent → redirect/checkout → webhook xác nhận
- Verify chữ ký webhook (tránh giả mạo request)
- **Idempotency**: tránh xử lý trùng khi webhook gọi lại nhiều lần
- Sandbox/test mode của Stripe hoặc VNPay/Momo

### Việc cần làm cho dự án
1. Chọn 1 cổng thanh toán: Stripe (test mode, dễ tích hợp, tài liệu tốt) hoặc VNPay/Momo sandbox (nếu hướng thị trường VN).
2. Entity `Payment` (orderId, amount, status, transactionId, gateway).
3. API `POST /api/orders/{id}/payment` — tạo payment intent/checkout session, trả link/thông tin thanh toán cho client.
4. API webhook `POST /api/webhooks/payment` — nhận callback từ gateway, **verify chữ ký**, cập nhật `Payment.status` và `Order.status → PAID`.
5. Xử lý idempotency: nếu webhook gọi lại nhiều lần cho cùng 1 transaction, không xử lý trùng (check trạng thái trước khi update).
6. Test bằng Stripe CLI (hoặc tool tương đương) gửi webhook giả lập tới local.

**Milestone:** Thanh toán thật hoạt động end-to-end (sandbox), webhook được verify và idempotent.

---

## GIAI ĐOẠN 7: Kiến trúc Event-Driven sau thanh toán (1-2 tuần)

### Lý thuyết cần nắm
- Spring Application Events (`ApplicationEventPublisher`, `@EventListener`, `@TransactionalEventListener`)
- Khi nào dùng Spring Events nội bộ, khi nào cần message queue thật (Kafka/RabbitMQ) — giới thiệu khái niệm, không bắt buộc làm ở bước này
- `@Async` để xử lý event không chặn luồng chính

### Việc cần làm cho dự án
1. Khi `Order.status → PAID`, publish event `OrderPaidEvent`.
2. Viết các Listener riêng biệt, chạy `@Async`:
   - Trừ tồn kho chính thức (nếu chưa trừ ở bước checkout)
   - Gửi email xác nhận đơn hàng (Spring Mail, có thể dùng Mailtrap để test)
   - Tạo invoice/PDF đơn giản (tùy chọn nâng cao)
3. Đảm bảo listener chỉ chạy sau khi transaction chính commit thành công (`@TransactionalEventListener(phase = AFTER_COMMIT)`).
4. (Nâng cao, tùy chọn) Thay Spring Events bằng RabbitMQ để mô phỏng kiến trúc thật hơn, viết Producer/Consumer riêng.

**Milestone:** Luồng sau thanh toán tách rời khỏi luồng chính, chạy async, không làm chậm response cho client.

---

## GIAI ĐOẠN 8: Testing toàn diện (2 tuần)

### Lý thuyết cần nắm
- Unit test (JUnit 5 + Mockito) cho Service layer
- Integration test với `@SpringBootTest` + `MockMvc`
- **Testcontainers**: chạy test với PostgreSQL thật trong container, không dùng H2 giả lập
- Test concurrency/race condition

### Việc cần làm cho dự án
1. Unit test cho `OrderService`, `PaymentService`, `CartService` — mock Repository.
2. Integration test bằng Testcontainers cho luồng checkout đầy đủ: tạo user → thêm cart → checkout → verify tồn kho giảm đúng.
3. Test race condition ở Order (đã làm sơ bộ ở Giai đoạn 5, giờ viết chính thức và đưa vào CI).
4. Test webhook idempotency: gọi webhook 2 lần cùng transactionId, verify Order chỉ update 1 lần.
5. Chạy Jacoco, đặt mục tiêu coverage >70% cho Service layer.

**Milestone:** Bộ test đầy đủ chạy được trong CI, bao gồm cả test concurrency.

---

## GIAI ĐOẠN 9: Dashboard & Báo cáo (1 tuần)

### Lý thuyết cần nắm
- JPQL/Native query aggregate (`SUM`, `GROUP BY`, `COUNT`)
- Projection trong Spring Data JPA (trả DTO trực tiếp từ query thay vì Entity)

### Việc cần làm cho dự án
1. API `GET /api/admin/dashboard/revenue?from=...&to=...` — doanh thu theo ngày/tháng.
2. API `GET /api/admin/dashboard/top-products` — sản phẩm bán chạy nhất.
3. API `GET /api/admin/dashboard/order-stats` — số đơn theo từng trạng thái.
4. Dùng Query DTO Projection để tối ưu, tránh load toàn bộ Entity không cần thiết.

**Milestone:** Có bộ API dashboard phục vụ trang quản trị (nếu sau này làm frontend).

---

## GIAI ĐOẠN 10: Đóng gói & Triển khai (1-2 tuần)

### Lý thuyết cần nắm
- Docker, Dockerfile multi-stage build cho Spring Boot
- Docker Compose (app + PostgreSQL + Redis nếu có cache)
- GitHub Actions cơ bản: build, test, tạo image
- Logging chuẩn (Logback), tách log theo môi trường (dev/prod)

### Việc cần làm cho dự án
1. Viết `Dockerfile` multi-stage (build bằng Maven, run bằng JRE nhẹ).
2. Viết `docker-compose.yml`: app + PostgreSQL + (tùy chọn) Redis cache cho `GET /api/products`.
3. GitHub Actions: pipeline tự động chạy test (bao gồm Testcontainers) mỗi khi push, build Docker image khi merge vào `main`.
4. Deploy thử lên Render/Railway, lấy URL public.
5. Hoàn thiện README: kiến trúc hệ thống (vẽ sơ đồ), cách chạy local bằng 1 lệnh `docker-compose up`, link demo, mô tả cách xử lý oversell/race condition — đây là phần recruiter sẽ đọc kỹ nhất.

**Milestone:** Dự án chạy được bằng 1 lệnh Docker Compose, có CI, có bản deploy public, README đầy đủ như một case study kỹ thuật.

---

## Checklist README cuối cùng (bám theo tiêu chuẩn recruiter 2026)

- [ ] Mô tả dự án 2-3 câu + link demo trực tiếp
- [ ] Sơ đồ kiến trúc (layered architecture, luồng checkout/payment)
- [ ] Hướng dẫn chạy local: `docker-compose up` — không quá 1-2 lệnh
- [ ] CI badge (GitHub Actions)
- [ ] Mục riêng: "Cách xử lý concurrency/oversell" — kèm giải thích ngắn về optimistic lock
- [ ] Mục riêng: "Kiến trúc event-driven sau thanh toán"
- [ ] Số liệu: test coverage %, số lượng test case, response time trung bình (nếu đo được)
- [ ] Mục "What I'd do next" — 2-3 ý tưởng mở rộng (VD: chuyển sang Kafka, thêm search bằng Elasticsearch)
- [ ] Commit history sạch, theo semantic convention, có dùng Pull Request dù là project cá nhân

---

## Lộ trình rút gọn theo tuần (tổng hợp)

| Tuần | Nội dung |
|---|---|
| 1 | Setup + REST API Product/Category |
| 2 | Quan hệ DB, Flyway, khắc phục N+1 |
| 3-4 | Authentication & Authorization (JWT) |
| 5 | Cart |
| 6-7 | Order + State Machine + Optimistic Locking + test race condition |
| 8-9 | Payment gateway thật + webhook + idempotency |
| 10 | Event-driven sau thanh toán |
| 11-12 | Testing toàn diện với Testcontainers |
| 13 | Dashboard |
| 14-15 | Docker, CI/CD, deploy, hoàn thiện README |

---

## Lời khuyên khi triển khai
- Đừng làm Giai đoạn 6 (Payment) trước khi Giai đoạn 5 (Order state machine) thật sự vững — payment phụ thuộc trực tiếp vào state của Order.
- Phần **race condition ở Giai đoạn 5** là điểm nhấn kỹ thuật quan trọng nhất của dự án — đầu tư thời gian viết test rõ ràng, vì đây là thứ khiến dự án của bạn khác biệt với hàng trăm e-commerce clone khác.
- Commit theo từng milestone, đừng dồn cục — điều này giúp Git history của bạn "kể chuyện" được quá trình phát triển, đúng thứ recruiter muốn thấy.
