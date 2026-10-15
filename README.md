# 🛒 Kanza Store - E-Commerce Web Application

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Java-17%20%2F%2021-orange.svg" alt="Java Version">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
</p>

**Kanza Store** là một ứng dụng thương mại điện tử (E-Commerce) toàn diện, được xây dựng bằng **Spring Boot** (Backend) kết hợp với giao diện hiện đại, cung cấp đầy đủ các tính năng mua sắm trực tuyến từ quản lý sản phẩm, giỏ hàng, thanh toán đơn hàng đến hệ thống xác thực người dùng bảo mật.

---

## ✨ Tính năng chính

### 👤 Khách hàng & Người dùng
* **Xác thực & Bảo mật:** Đăng ký, đăng nhập an toàn sử dụng **JWT (JSON Web Token)**, hỗ trợ tính năng quên mật khẩu và đổi mật khẩu.
* **Quản lý sản phẩm:** Xem danh sách sản phẩm, lọc theo danh mục, thương hiệu, kích cỡ (size), tìm kiếm và xem chi tiết sản phẩm.
* **Giỏ hàng & Wishlist (Yêu thích):** Thêm/sửa/xóa sản phẩm khỏi giỏ hàng, đồng bộ giỏ hàng và danh sách yêu thích.
* **Đặt hàng & Thanh toán:** Tạo đơn hàng mới, theo dõi trạng thái đơn hàng.
* **Đánh giá & Bình luận:** Gửi đánh giá và bình luận sản phẩm sau khi mua hàng.
* **Bản tin (Newsletter):** Đăng ký nhận thông tin khuyến mãi qua email.

### 🛠️ Quản trị viên (Admin)
* **Quản lý sản phẩm & Tồn kho:** Thêm, sửa, xóa sản phẩm, quản lý số lượng tồn kho theo kích cỡ (Size Stock).
* **Quản lý đơn hàng:** Xem danh sách đơn hàng toàn hệ thống, cập nhật trạng thái đơn hàng (Đang xử lý, Đang giao, Đã hoàn thành, Hủy...).
* **Quản lý danh mục & Thương hiệu:** Thêm và quản lý các danh mục trang chủ, banner quảng cáo, slide trang chủ.

---

## 🗂️ Cấu trúc dự án

```text
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── kanza/
│   │           └── store/
│   │               ├── auth/          # Xác thực (JWT, Login, Register, Password Reset)
│   │               ├── brand/         # Quản lý thương hiệu
│   │               ├── cart/          # Giỏ hàng
│   │               ├── config/        # Cấu hình bảo mật (SecurityConfig, WebConfig)
│   │               ├── exception/     # Xử lý ngoại lệ toàn cục (GlobalExceptionHandler)
│   │               ├── home/          # Banner, Slide, Danh mục trang chủ
│   │               ├── mail/          # Gửi email hệ thống
│   │               ├── newsletter/    # Đăng ký nhận bản tin
│   │               ├── order/         # Quản lý đơn hàng (User & Admin)
│   │               ├── product/       # Quản lý sản phẩm, biến thể, tồn kho
│   │               ├── review/        # Đánh giá sản phẩm
│   │               ├── upload/        # Xử lý tải lên tệp tin/hình ảnh
│   │               ├── wishlist/      # Danh sách sản phẩm yêu thích
│   │               └── StoreApplication.java # Lớp khởi chạy Spring Boot
│   └── resources/
│       ├── data/                      # Dữ liệu mẫu khởi tạo (SQL cho brands, products)
│       ├── static/                    # Tài nguyên tĩnh (Hình ảnh banner, logo, sản phẩm...)
│       └── application.properties     # Cấu hình kết nối cơ sở dữ liệu và ứng dụng
