# 🛒 Kanza Store - Fullstack E-Commerce Platform

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Java-17%20%2F%2021-orange.svg" alt="Java Version">
  <img src="https://img.shields.io/badge/Frontend-React%20%2F%20Vue%20%2F%20HTML5-blue.svg" alt="Frontend">
  <img src="https://img.shields.io/badge/Security-JWT-red.svg" alt="JWT Security">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</p>

> **Kanza Store** là một nền tảng thương mại điện tử (E-Commerce) hiện đại, tích hợp đầy đủ tính năng mua sắm trực tuyến, quản lý sản phẩm, đơn hàng, người dùng và hệ thống quản trị (Admin Dashboard). Dự án được xây dựng với kiến trúc mô-đun hóa kết hợp giữa **Spring Boot RESTful API** ở Backend và giao diện **Frontend** tối ưu trải nghiệm người dùng.

---

## ✨ Tính năng nổi bật

### 🛍️ Khách hàng (Client Portal)
* **Xác thực & Bảo mật (Auth):** Đăng ký, đăng nhập an toàn với **JWT (JSON Web Token)**, xác thực qua Email, lấy lại mật khẩu quên.
* **Khám phá sản phẩm (Catalog & Search):** Xem danh sách sản phẩm, bộ lọc đa tiêu chí (danh mục, thương hiệu, mức giá, kích cỡ/size), tìm kiếm từ khóa và chi tiết sản phẩm.
* **Giỏ hàng & Đơn hàng (Cart & Checkout):** Quản lý giỏ hàng realtime, áp dụng mã giảm giá, đặt hàng và theo dõi lịch sử/trạng thái đơn hàng.
* **Yêu thích & Đánh giá (Wishlist & Reviews):** Lưu sản phẩm yêu thích, gửi nhận xét và chấm điểm sao sản phẩm đã mua.
* **Bản tin & Khuyến mãi (Newsletter):** Đăng ký email nhận ưu đãi hàng tuần.

### 🛠️ Quản trị viên (Admin Dashboard)
* **Quản lý sản phẩm & Kho hàng (Inventory):** CRUD sản phẩm, phân loại danh mục, thương hiệu, quản lý tồn kho theo biến thể (Size/Color Stock).
* **Quản lý đơn hàng (Order Management):** Duyệt đơn, cập nhật trạng thái vận chuyển (Đang xử lý, Đang giao, Đã giao, Hủy đơn).
* **Quản lý Nội dung & Giao diện (CMS):** Cấu hình Banner, Slide trang chủ, danh mục nổi bật và chương trình khuyến mãi.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Backend
* **Language & Framework:** Java 17/21, Spring Boot 3.x
* **Security:** Spring Security, JWT (JSON Web Token)
* **Database & ORM:** MySQL, Spring Data JPA / Hibernate
* **Utilities:** Lombok, Spring Mail, Maven

### Frontend
* **UI Framework/Library:** React.js / Vue.js (hoặc HTML5/CSS3, JavaScript, Bootstrap/Tailwind CSS)
* **State Management & API:** Axios / Redux Toolkit / React Query
* **Icons & Fonts:** FontAwesome / React Icons, Google Fonts

---

## 🗂️ Cấu trúc dự án (Project Architecture)

```text
kanza-store/
├── backend/                       # Backend Spring Boot Project
│   ├── src/main/java/com/kanza/store/
│   │   ├── auth/                  # Lớp xác thực (Login, Register, JWT, Password)
│   │   ├── brand/                 # Quản lý thương hiệu
│   │   ├── cart/                  # Quản lý giỏ hàng
│   │   ├── config/                # Cấu hình hệ thống (SecurityConfig, WebConfig)
│   │   ├── exception/             # Xử lý ngoại lệ tập trung (GlobalExceptionHandler)
│   │   ├── home/                  # Banner, Slide trang chủ
│   │   ├── mail/                  # Dịch vụ gửi email thông báo
│   │   ├── newsletter/            # Đăng ký nhận tin tức
│   │   ├── order/                 # Quản lý đơn hàng
│   │   ├── product/               # Quản lý sản phẩm, tồn kho (Size/Stock)
│   │   ├── review/                # Đánh giá & Bình luận
│   │   ├── upload/                # Tải lên hình ảnh / tệp tin
│   │   ├── wishlist/              # Sản phẩm yêu thích
│   │   └── StoreApplication.java  # File khởi chạy chính của Spring Boot
│   └── src/main/resources/
│       ├── application.properties # Cấu hình ứng dụng & kết nối Database
│       ├── data/                  # Script SQL dữ liệu mẫu
│       └── static/                # Tệp tĩnh (ảnh sản phẩm, banner...)
│
└── frontend/                      # Frontend Application
    ├── public/                    # Tài nguyên công khai (Favicon, Index.html)
    ├── src/
    │   ├── assets/                # Hình ảnh, icon, styles
    │   ├── components/            # Các thành phần giao diện tái sử dụng (Header, Footer, Card...)
    │   ├── pages/                 # Các trang chính (Home, Shop, Cart, Checkout, Admin...)
    │   ├── services/              # Kết nối & gọi RESTful API từ Backend
    │   └── context/               # Quản lý trạng thái ứng dụng (AuthContext, CartContext)
    └── package.json               # Các gói phụ thuộc Frontend
