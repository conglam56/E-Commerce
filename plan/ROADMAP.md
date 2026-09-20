# LỘ TRÌNH PHÁT TRIỂN E-COMMERCE MVP (CV & INTERVIEW SHOWCASE)

> **Mục tiêu dự án:** Xây dựng sản phẩm cá nhân chuẩn chỉ đưa vào CV ứng tuyển vị trí **Java Backend / Fullstack Developer**. Ưu tiên chất lượng code, kiến trúc sạch và hiểu sâu bản chất kỹ thuật thay vì số lượng tính năng.
> 
> **Quy mô & Mô hình:** Cửa hàng đồ công nghệ (E-Commerce B2C), 1 người phát triển (Solo Dev), kiến trúc Monorepo.
> 
> **Tech Stack:**
> - **Backend:** Java 17 (JDK runtime tương thích 17-21), Spring Boot 3.2.5 (Spring Security 6.2, Spring Data JPA / Hibernate 6.4, Bean Validation, MapStruct 1.5.5.Final, JJWT 0.11.5, Flyway 9.x).
> - **Frontend:** React (Vite), Tailwind CSS / Vanilla CSS, Axios, React Router.
> - **Database:** PostgreSQL 16 (chạy qua Docker `postgres:16-alpine`, port host `5434:5432`).
> - **DevOps & Testing:** Docker, Docker Compose (1 lệnh chạy toàn bộ), JUnit 5, Mockito, OpenAPI / Swagger UI (Springdoc 2.5.x).

---

## 🌟 ĐIỂM NHẤN KỸ THUẬT CỐT LÕI (TECHNICAL SPOTLIGHT)

* **Tính năng:** **Kiểm soát đồng thời & Chống bán vượt (Concurrency Control with Optimistic Locking `@Version`) kèm Integration Test đa luồng.**
* **Bài toán thực tế:** Cửa hàng bán đồ công nghệ (iPhone, Card đồ họa...) thường có số lượng tồn kho giới hạn, nhiều khách hàng cùng bấm đặt hàng tại 1 thời điểm.
* **Lý do chọn điểm nhấn này:**
  1. **Câu hỏi phỏng vấn kinh điển:** Mọi nhà tuyển dụng phỏng vấn vị trí Java Backend e-commerce đều hỏi: *"Nếu 100 request cùng checkout 1 sản phẩm còn tồn kho = 1, hệ thống của bạn xử lý ra sao để không bị âm kho (oversell)?"*.
  2. **Vừa sức nhưng cực kỳ hiệu quả:** Sử dụng cơ chế `@Version` của JPA kết hợp xử lý ngoại lệ `OptimisticLockException` ở Service Layer. Không cần thêm hạ tầng phức tạp (Redis Distributed Lock/Kafka) nhưng giải quyết triệt để data race ở tầng database.
  3. **Có thể chứng minh bằng kiểm thử tự động:** Có thể viết một bài test đa luồng (`ExecutorService` / `CompletableFuture`) mô phỏng 10 thread cùng checkout và chứng minh chỉ đúng 1 thread thành công, 9 thread thất bại và trả lỗi rõ ràng. Đây là bằng chứng thép trong CV/README và khi phỏng vấn.

---

## 🗺️ TỔNG QUAN CÁC GIAI ĐOẠN

| Giai đoạn | Tên giai đoạn | Mục tiêu chính | Trọng tâm phỏng vấn |
|---|---|---|---|
| **Giai đoạn 1** | **Auth & Security Core** | Hoàn thiện nhánh `feat/login&register`, bổ sung JWT Filter, phân quyền Role | Filter Chain, Stateless Session, BCrypt, JWT |
| **Giai đoạn 2** | **Giỏ hàng (Shopping Cart)** | Quản lý giỏ hàng gắn với User, đồng bộ DB, kiểm tra tồn kho | Quan hệ JPA (Cascade, OrphanRemoval), IDOR Security |
| **Giai đoạn 3** | **Đặt hàng & Chống bán vượt** | Checkout đơn hàng, trừ kho tức thì, Optimistic Locking chống oversell | `@Transactional`, Race Condition, Optimistic Lock, State Pattern |
| **Giai đoạn 4** | **Giao diện React (Storefront & Admin)** | Giao diện React cho cả người mua và trang quản trị gọn gàng | Axios Interceptor, Protected Route, State Management |
| **Giai đoạn 5** | **Showcase, Docker & Kiểm thử** | Swagger, Test đa luồng, Seed data mẫu, Docker 1 lệnh, README chuẩn CV | Multi-stage Docker, Integration Testing, Concurrency Test |

---

## CHI TIẾT TỪNG GIAI ĐOẠN

---

### GIAI ĐOẠN 1: Auth & Security Core (Hoàn thiện nhánh `feat/login&register`)

#### 1. Mục tiêu
Hoàn thiện toàn bộ luồng đăng ký, đăng nhập bằng JWT; sửa lỗi chặn API sản phẩm hiện tại; thiết lập phân quyền rõ ràng giữa `CUSTOMER` và `ADMIN`.

#### 2. Các bước thực hiện
1. **Tạo `JwtAuthenticationFilter`:** Bắt Bearer Token từ header `Authorization`, xác thực token qua `JwtService`, load UserDetails và nạp vào `SecurityContextHolder`.
2. **Cập nhật `SecurityConfig`:**
   - Đưa `JwtAuthenticationFilter` vào trước `UsernamePasswordAuthenticationFilter`.
   - Mở quyền công khai (`permitAll()`): `GET /api/products/**`, `GET /api/categories/**`, `/api/auth/**`.
   - Phân quyền Admin (`hasRole('ADMIN')`): `POST`, `PUT`, `DELETE` cho `/api/products/**` và `/api/categories/**`.
   - Các API còn lại yêu cầu đăng nhập (`authenticated()`).
3. **Chuẩn hóa Error Handling:** Bắt lỗi `BadCredentialsException`, `AccessDeniedException` trong `GlobalExceptionHandler` trả về format `ApiResponse` thống nhất (mã 401, 403).
4. **Merge nhánh:** Test luồng đăng nhập/đăng ký thành công, merge nhánh `feat/login&register` vào `main`.

#### 3. Tiêu chí kiểm tra "Xong" (Definition of Done)
- [ ] Khách vãng lai gọi `GET /api/products` nhận HTTP 200 (không bị 403).
- [ ] Gọi `POST /api/auth/register` tạo user mới thành công, mật khẩu trong DB được băm BCrypt.
- [ ] Gọi `POST /api/auth/login` nhận về JWT token hợp lệ.
- [ ] Dùng token role `CUSTOMER` gọi `POST /api/products` bị trả HTTP 403 Forbidden.
- [ ] Dùng token role `ADMIN` gọi `POST /api/products` tạo sản phẩm thành công (HTTP 200/201).

#### 4. Rủi ro & Phòng tránh
- **Rủi ro:** Role trong database là `CUSTOMER`, nhưng Spring Security kiểm tra `hasRole('CUSTOMER')` lại yêu cầu tiền tố `ROLE_CUSTOMER`.
- **Phòng tránh:** Đảm bảo `User.getAuthorities()` trả về `new SimpleGrantedAuthority("ROLE_" + this.role)`.

#### 5. Phần bảo mật cần chú ý
- Không lưu secret key JWT trực tiếp ở git commit production; dùng biến môi trường `${JWT_SECRET}` với giá trị mặc định cho local.
- Set thời gian sống token hợp lý (ví dụ: 1 ngày trong giai đoạn dev).
- Cấu hình CORS chuẩn cho phép domain frontend (Vite: `http://localhost:5173`).

#### 6. 💬 Điều tôi cần hiểu để giải thích khi phỏng vấn
- **Spring Security Filter Chain:** Request đi qua những filter nào trước khi tới Controller? Tại sao cần `OncePerRequestFilter`?
- **Stateless Session:** Tại sao dùng JWT thì cấu hình `SessionCreationPolicy.STATELESS`? Ưu/nhược điểm so với Session-Cookie truyền thống?
- **Cơ chế BCrypt:** Salt là gì? Tại sao cùng 1 mật khẩu mã hóa ra 2 chuỗi hash khác nhau nhưng vẫn so sánh được?

---

### GIAI ĐOẠN 2: Giỏ hàng (Shopping Cart Module)

#### 1. Mục tiêu
Xây dựng module giỏ hàng lưu trữ trên database gắn với từng tài khoản người dùng đã đăng nhập; hỗ trợ thêm sản phẩm, cập nhật số lượng, xóa sản phẩm và tính tổng tiền tự động.

#### 2. Các bước thực hiện
1. **Flyway Migration `V5__create_cart_tables.sql`:**
   - Bảng `cart`: `id UUID PK`, `user_id UUID UNIQUE FK (users.id)`, `created_at`, `updated_at`.
   - Bảng `cart_item`: `id UUID PK`, `cart_id UUID FK`, `product_id UUID FK`, `quantity INT NOT NULL`, `UNIQUE(cart_id, product_id)`.
2. **Tạo Entities & Mappers:**
   - `Cart` có quan hệ `@OneToOne` với `User`, `@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)` với `CartItem`.
   - `CartItem` có quan hệ `@ManyToOne` với `Product`.
3. **Xây dựng Service Layer (`CartService`):**
   - Lấy giỏ hàng của user hiện tại: Tự động tạo Cart nếu user chưa có.
   - Thêm vào giỏ: Nếu sản phẩm đã có thì cộng dồn `quantity`; kiểm tra `quantity <= product.quantity` (báo lỗi nếu vượt tồn kho).
   - Sửa số lượng item: Nếu số lượng <= 0 thì tự động xóa khỏi giỏ.
   - Xóa item hoặc xóa sạch giỏ hàng (`clearCart`).
4. **Viết Controller `CartController` (`/api/cart`):**
   - `GET /api/cart`: Xem giỏ hàng hiện tại (kèm thông tin chi tiết sản phẩm, đơn giá, tổng tiền giỏ hàng).
   - `POST /api/cart/items`: Thêm sản phẩm vào giỏ (`productId`, `quantity`).
   - `PUT /api/cart/items/{itemId}`: Sửa số lượng.
   - `DELETE /api/cart/items/{itemId}`: Xóa item.

#### 3. Tiêu chí kiểm tra "Xong" (Definition of Done)
- [ ] User A đăng nhập, thêm 2 sản phẩm vào giỏ -> `GET /api/cart` hiển thị đúng 2 sản phẩm kèm tổng tiền chính xác.
- [ ] User B đăng nhập -> giỏ hàng của User B hoàn toàn trống, không thấy dữ liệu của User A.
- [ ] Cố tình thêm sản phẩm với số lượng vượt quá tồn kho hiện có -> API trả về lỗi 400 Bad Request kèm thông báo rõ ràng.
- [ ] Cập nhật số lượng item về 0 -> item tự động bị xóa khỏi giỏ.

#### 4. Rủi ro & Phòng tránh
- **Lỗi N+1 Query:** Khi lấy `Cart` kèm danh sách `CartItem` và thông tin `Product`.
- **Phòng tránh:** Dùng `JOIN FETCH` hoặc `@EntityGraph(attributePaths = {"items", "items.product"})` trong Repository.

#### 5. Phần bảo mật cần chú ý
- **Lỗi IDOR (Insecure Direct Object Reference):** Không truyền `userId` hay `cartId` qua request param/body từ client. Luôn lấy danh tính `currentUser` trực tiếp từ `SecurityContextHolder` trong Service.

#### 6. 💬 Điều tôi cần hiểu để giải thích khi phỏng vấn
- **Thiết kế Giỏ hàng: Client (LocalStorage) vs Server (DB/Redis):** Tại sao chọn lưu DB cho đồ công nghệ? (Đồng bộ đa thiết bị, kiểm soát tồn kho realtime, theo dõi tỷ lệ bỏ rơi giỏ hàng).
- **CascadeType và orphanRemoval trong JPA:** Khi xóa 1 phần tử khỏi `cart.getItems().remove(item)`, tại sao `orphanRemoval = true` lại xóa dòng đó trong DB?
- **Tại sao tính tổng tiền ở backend mà không nhận từ frontend?** Nguyên tắc bảo mật cốt lõi: Không bao giờ tin tưởng client.

---

### GIAI ĐOẠN 3: Đặt hàng, Trừ kho & Chống bán vượt (Order & Concurrency Control)

#### 1. Mục tiêu
Thực hiện checkout từ giỏ hàng thành đơn hàng; trừ tồn kho tức thì; áp dụng cơ chế **Optimistic Locking (`@Version`)** để đảm bảo tuyệt đối không bị bán âm kho khi nhiều người cùng mua; hỗ trợ hình thức thanh toán COD và Chuyển khoản ngân hàng (VietQR).

#### 2. Các bước thực hiện
1. **Flyway Migration `V6__create_order_tables_and_optimistic_lock.sql`:**
   - Thêm cột `version INT NOT NULL DEFAULT 0` vào bảng `product`.
   - Bảng `orders`: `id UUID PK`, `user_id UUID FK`, `total_amount DECIMAL(12,2)`, `status VARCHAR(50)`, `payment_method VARCHAR(50)` (COD / BANK_TRANSFER), `shipping_address TEXT`, `phone_number VARCHAR(20)`, `receiver_name VARCHAR(100)`, `created_at TIMESTAMP`.
   - Bảng `order_item`: `id UUID PK`, `order_id UUID FK`, `product_id UUID FK`, `quantity INT`, `price DECIMAL(12,2)`.
2. **Cập nhật Entity `Product`:** Thêm trường `@Version private Integer version;`.
3. **Xây dựng State Machine đơn giản cho đơn hàng:**
   - Enum `OrderStatus`: `PENDING` (Chờ xử lý) -> `CONFIRMED` (Đã xác nhận) -> `SHIPPED` (Đang giao) -> `DELIVERED` (Thành công) / `CANCELLED` (Đã hủy).
   - Viết logic kiểm tra hợp lệ khi chuyển trạng thái (ví dụ: `DELIVERED` không thể quay lại `PENDING`; đơn bị `CANCELLED` thì hoàn lại tồn kho cho sản phẩm).
4. **Xây dựng `OrderService.checkout()` với `@Transactional`:**
   - Bước 1: Lấy giỏ hàng của user, kiểm tra giỏ không rỗng.
   - Bước 2: Duyệt từng item, kiểm tra tồn kho `product.getQuantity() >= item.getQuantity()`.
   - Bước 3: Trừ tồn kho: `product.setQuantity(product.getQuantity() - item.getQuantity())`.
   - Bước 4: Tạo `Order` và `OrderItem` (lưu giá tại thời điểm mua `item.getPrice()`).
   - Bước 5: Xóa sạch giỏ hàng.
   - Bước 6: Trả về thông tin đơn hàng kèm thông tin chuyển khoản nếu chọn `BANK_TRANSFER`.
5. **Xử lý ngoại lệ Concurrency:**
   - Đón bắt `ObjectOptimisticLockingFailureException` (hoặc `OptimisticLockException`) trong Service/GlobalExceptionHandler -> trả về mã lỗi 409 Conflict hoặc 400 kèm message: *"Sản phẩm [Tên sản phẩm] đang có người mua trước, vui lòng thử lại!"*.
6. **API Quản trị đơn hàng (Admin):**
   - `GET /api/admin/orders`: Xem tất cả đơn hàng (phân trang, lọc theo status).
   - `PUT /api/admin/orders/{id}/status`: Cập nhật trạng thái đơn hàng.

#### 3. Tiêu chí kiểm tra "Xong" (Definition of Done)
- [ ] Checkout thành công: Giỏ hàng bị làm trống, đơn hàng mới được tạo ở trạng thái `PENDING`, tồn kho của sản phẩm trong DB giảm tương ứng.
- [ ] Chọn phương thức `BANK_TRANSFER`: API trả về mã đơn hàng, số tiền và nội dung chuyển khoản để hiển thị mã QR.
- [ ] Hủy đơn hàng (`CANCELLED`): Tồn kho sản phẩm tự động được cộng trả lại.
- [ ] Đổi trạng thái trái quy tắc (VD: `DELIVERED` -> `PENDING`): Bị chặn và báo lỗi nghiệp vụ.

#### 4. Rủi ro & Phòng tránh
- **Rủi ro:** Khi đơn hàng thất bại ở bước cuối nhưng tồn kho đã bị trừ trong DB.
- **Phòng tránh:** Đặt toàn bộ method trong `@Transactional(rollbackFor = Exception.class)` để Spring tự động rollback toàn bộ nếu có bất kỳ lỗi nào xảy ra.

#### 5. Phần bảo mật cần chú ý
- **Bảo vệ giá:** Giá tiền lưu vào `order_item` phải lấy trực tiếp từ bảng `product` trong DB tại thời điểm checkout, tuyệt đối không lấy giá từ frontend truyền lên.
- **Phân quyền:** Khách hàng chỉ xem được đơn hàng của chính mình (`/api/orders/my-orders`). Chỉ admin mới có quyền xem toàn bộ đơn và đổi trạng thái.

#### 6. 💬 Điều tôi cần hiểu để giải thích khi phỏng vấn
- **Optimistic Locking vs Pessimistic Locking:**
  - Optimistic Lock: Dùng trường `version`. Không khóa DB, phù hợp với hệ thống đọc nhiều hơn ghi, độ trễ thấp. Khi có xung đột ném ngoại lệ để client thử lại.
  - Pessimistic Lock: Dùng `SELECT ... FOR UPDATE`. Khóa cứng dòng dữ liệu, tránh xung đột nhưng dễ nghẽn cổ chai (bottleneck) và deadlock nếu giữ lock lâu.
- **Tính trọn vẹn của Transaction (ACID):** `@Transactional` hoạt động dưới nền như thế nào (AOP Proxy)? Trường hợp nào `@Transactional` không bắt được rollback (VD: gọi nội bộ method trong cùng class, nuốt exception bằng try-catch)?

---

### GIAI ĐOẠN 4: Frontend React (Storefront Khách & Admin Portal)

#### 1. Mục tiêu
Xây dựng giao diện web React (Vite) hoàn chỉnh cho cả khách mua hàng và trang quản trị gọn gàng cho admin; kết nối API trơn tru với xử lý token tập trung.

#### 2. Các bước thực hiện
1. **Khởi tạo dự án Frontend trong thư mục `frontend/`:**
   - Dùng Vite + React (`npm create vite@latest frontend -- --template react`).
   - Cài đặt `react-router-dom`, `axios`, `lucide-react` (icons).
2. **Xây dựng tầng API Client (`api/axiosClient.js`):**
   - Cấu hình `baseURL: 'http://localhost:8080/api'`.
   - **Request Interceptor:** Tự động lấy token từ `localStorage` gắn vào header `Authorization: Bearer <token>`.
   - **Response Interceptor:** Bắt lỗi 401/403 để điều hướng về trang đăng nhập hoặc xóa token hết hạn.
3. **Xây dựng Storefront (Giao diện người mua):**
   - *Trang chủ & Danh sách sản phẩm:* Grid sản phẩm, bộ lọc theo danh mục, thanh tìm kiếm, phân trang.
   - *Trang chi tiết sản phẩm:* Xem hình ảnh, mô tả, giá, số lượng tồn kho còn lại, nút "Thêm vào giỏ hàng".
   - *Trang Giỏ hàng:* Bảng danh sách item, tăng/giảm số lượng, xóa item, tổng tiền.
   - *Trang Thanh toán (Checkout):* Nhập địa chỉ nhận hàng, SĐT, chọn phương thức (COD hoặc Chuyển khoản hiển thị VietQR tĩnh).
   - *Trang Đơn hàng của tôi:* Xem lịch sử và trạng thái đơn hàng.
4. **Xây dựng Admin Portal (Giao diện quản trị viên):**
   - *Trang Quản lý sản phẩm:* Bảng danh sách sản phẩm, modal thêm mới / chỉnh sửa thông tin / cập nhật tồn kho, nút xóa.
   - *Trang Quản lý đơn hàng:* Xem danh sách đơn, xem chi tiết người mua, dropdown cập nhật trạng thái đơn (`PENDING` -> `CONFIRMED` -> `SHIPPED`...).
5. **Thiết lập Protected Routes:**
   - Chặn người chưa đăng nhập truy cập vào `/cart`, `/checkout`, `/orders`.
   - Chặn người dùng role `CUSTOMER` truy cập vào các route `/admin/**`.

#### 3. Tiêu chí kiểm tra "Xong" (Definition of Done)
- [ ] Luồng mua hàng thông suốt trên trình duyệt: Đăng nhập -> Chọn sản phẩm -> Thêm vào giỏ -> Điền địa chỉ -> Đặt hàng COD/QR -> Xem lại trong lịch sử đơn.
- [ ] Luồng Admin thông suốt: Đăng nhập tài khoản admin -> Thêm sản phẩm mới -> Cập nhật trạng thái đơn hàng vừa đặt.
- [ ] Đăng xuất: Xóa token, chuyển hướng về trang chủ và giao diện quay về trạng thái chưa đăng nhập.

#### 4. Rủi ro & Phòng tránh
- **Lỗi CORS:** Frontend gọi API bị block do khác port (`5173` vs `8080`).
- **Phòng tránh:** Cấu hình chuẩn `CorsConfigurationSource` trong `SecurityConfig.java` cho phép origin `http://localhost:5173` với đầy đủ HTTP Methods và Headers.

#### 5. Phần bảo mật cần chú ý
- Phân tách giao diện: Ẩn menu Admin đối với user thường; tuy nhiên vẫn hiểu rằng bảo mật client-side chỉ mang tính trải nghiệm, bảo mật thực sự nằm ở `hasRole('ADMIN')` trên backend.

#### 6. 💬 Điều tôi cần hiểu để giải thích khi phỏng vấn
- **Cơ chế hoạt động của Axios Interceptor:** Interceptor can thiệp vào vòng đời của request/response như thế nào? Cách tự động xử lý khi access token hết hạn.
- **Client-side Routing vs Server-side Routing:** React Router hoạt động theo cơ chế SPA (Single Page Application) ra sao?

---

### GIAI ĐOẠN 5: Hoàn thiện Showcase, Đóng gói Docker & Kiểm thử (Sẵn sàng đưa vào CV)

#### 1. Mục tiêu
Đưa dự án lên chuẩn "Showcase chuyên nghiệp": Có tài liệu API tự động (Swagger), dữ liệu mẫu trực quan, bộ test tự động chứng minh điểm nhấn kỹ thuật, đóng gói 1 lệnh chạy bằng Docker Compose và file README chất lượng cao.

#### 2. Các bước thực hiện
1. **Tích hợp Swagger / OpenAPI 3:**
   - Thêm dependency `springdoc-openapi-starter-webmvc-ui` vào `pom.xml`.
   - Cấu hình Swagger hỗ trợ nhập Bearer Token để test trực tiếp trên UI (`http://localhost:8080/swagger-ui.html`).
2. **Bộ dữ liệu mẫu (Seed Data) trực quan:**
   - Tạo Flyway migration `V7__seed_full_demo_data.sql`:
     - Tạo sẵn 1 tài khoản Admin (`admin@ecommerce.com / Admin@123`).
     - Tạo sẵn 1 tài khoản Customer (`customer@ecommerce.com / Customer@123`).
     - Tạo danh mục công nghệ thực tế: Điện thoại, Laptop, Bàn phím cơ, Tai nghe.
     - Tạo 10-15 sản phẩm công nghệ có ảnh thực tế (URL ảnh chất lượng cao từ Unsplash hoặc link CDN), mô tả chi tiết, tồn kho thực tế.
3. **Kiểm thử tự động & BÀI TEST RACE CONDITION (Điểm sáng của dự án):**
   - *Unit Tests:* Viết test cho `AuthService` và `OrderService` (dùng Mockito mock Repository).
   - *Concurrency Integration Test:*
     - Viết file test `OrderConcurrencyTest.java`.
     - Tạo 1 sản phẩm có số lượng tồn kho = 1.
     - Dùng `ExecutorService` kích hoạt **10 thread đồng thời** cùng gọi hàm checkout sản phẩm này.
     - Sử dụng `CountDownLatch` để các thread cùng xuất phát tại 1 thời điểm chính xác.
     - `assert` kết quả: Đúng 1 thread đặt hàng thành công, 9 thread còn lại bị văng ngoại lệ `OptimisticLockException` và số lượng tồn kho cuối cùng trong DB bằng 0 (không bao giờ bị âm).
4. **Đóng gói Docker Compose toàn diện (1 lệnh chạy):**
   - Viết `backend/Dockerfile` (multi-stage: stage 1 dùng Maven package, stage 2 dùng Eclipse Temurin JRE nhẹ).
   - Viết `frontend/Dockerfile` (multi-stage: stage 1 build Vite, stage 2 dùng Nginx alpine serve static file và reverse proxy).
   - Cập nhật `docker-compose.yml` gồm 3 services:
     - `postgres`: Cơ sở dữ liệu.
     - `backend`: Phụ thuộc vào postgres, tự động chạy migration khi khởi động.
     - `frontend`: Phụ thuộc vào backend, expose port 80/3000.
   - Kiểm tra: Chạy `docker-compose up --build` trên máy mới là cả hệ thống hoạt động ngay.
5. **Viết README chuẩn CV (Portfolio Showcase):**
   - Ảnh chụp màn hình giao diện Storefront & Admin Portal.
   - Sơ đồ kiến trúc ngắn gọn (Frontend <-> Spring Boot API <-> PostgreSQL).
   - Hướng dẫn chạy nhanh đúng 1 lệnh: `docker-compose up -d`.
   - Tài khoản đăng nhập demo (Admin & Customer).
   - **Mục kỹ thuật nổi bật:** *"Giải quyết bài toán Concurrency & Chống oversell bằng JPA Optimistic Locking"* kèm phân tích và lệnh chạy test case kiểm chứng.

#### 3. Tiêu chí kiểm tra "Xong" (Definition of Done)
- [ ] Truy cập `/swagger-ui.html` hiển thị đầy đủ danh sách endpoint, có nút Authorize test được token.
- [ ] Chạy lệnh `mvn test`: Toàn bộ unit test và bài test race condition đa luồng đều pass 100%.
- [ ] Xóa toàn bộ container/volume cũ, gõ `docker-compose up -d`: Cả 3 service bật lên thành công, vào trình duyệt thấy sẵn dữ liệu sản phẩm, đăng nhập được ngay bằng tài khoản demo.
- [ ] File `README.md` rõ ràng, bố cục chuyên nghiệp, sẵn sàng đính kèm link vào CV.

#### 4. Rủi ro & Phòng tránh
- **Rủi ro:** Khi chạy `docker-compose up`, backend khởi động nhanh hơn PostgreSQL dẫn tới crash vì kết nối DB thất bại.
- **Phòng tránh:** Dùng `depends_on` với `condition: service_healthy` để backend chỉ khởi động khi PostgreSQL đã sẵn sàng nhận kết nối.

#### 5. Phần bảo mật cần chú ý
- File `docker-compose.yml` và mã nguồn không để lộ thông tin nhạy cảm thật; dùng file `.env.example` mẫu.

#### 6. 💬 Điều tôi cần hiểu để giải thích khi phỏng vấn
- **Cách thiết kế bài test Concurrency:** `CountDownLatch` là gì? Tại sao dùng `CountDownLatch` mới giả lập được chính xác khoảnh khắc nhiều request ập vào cùng 1 microsecond?
- **Multi-stage build trong Docker:** Tại sao phải tách stage build và stage runtime? Lợi ích về dung lượng image và bảo mật?

---

## 🎯 KẾ HOẠCH BẮT ĐẦU NGAY (ACTION PLAN)

Sau khi bạn duyệt lộ trình này, chúng ta sẽ bắt đầu thực hiện theo thứ tự:
1. **Bước tiếp theo ngay lập tức:** Bắt tay vào **Giai đoạn 1** -> Triển khai `JwtAuthenticationFilter`, cấu hình lại `SecurityConfig` và mở quyền API xem sản phẩm cho khách vãng lai.
2. **Quy tắc làm việc:** Làm dứt điểm từng giai đoạn, chạy test kiểm tra xong giai đoạn đó mới chuyển sang giai đoạn tiếp theo.
