# 📦 Inventory Management System (IMS) - Backend API

Hệ thống Backend RESTful API Quản lý Tồn kho chuyên nghiệp, được xây dựng bằng **Node.js**, **Express**, **TypeScript**, **TypeORM** và **Zod**.

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Framework:** [Express.js](https://expressjs.com/)
* **ORM:** [TypeORM](https://typeorm.io/) (PostgreSQL / MySQL)
* **Validation:** [Zod](https://zod.dev/)
* **Authentication:** JWT (JSON Web Token) & HttpOnly Cookie
* **Security:** Helmet, CORS, Express-Rate-Limit, BcryptJS
* **Architecture:** Layered Architecture (`Route` ➔ `Controller` ➔ `Service` ➔ `Entity`)

---

## 🌟 Các Tính Năng & Module Đã Triển Khai

| STT | Module | Mô Tả Chức Năng | Status |
| :---: | :--- | :--- | :---: |
| 1 | **Auth** | Đăng nhập, Đăng xuất, Cấp lại Access Token, Đổi mật khẩu, Tự cập nhật Profile & Avatar | ✅ Done |
| 2 | **Users** | Quản lý người dùng, Phân quyền (`ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`), Khóa/Mở tài khoản | ✅ Done |
| 3 | **Categories** | Quản lý danh mục sản phẩm | ✅ Done |
| 4 | **Units** | Quản lý đơn vị tính (Cái, Hộp, Thùng, Kg...) | ✅ Done |
| 5 | **Suppliers** | Quản lý nhà cung cấp hàng hóa | ✅ Done |
| 6 | **Products** | Quản lý sản phẩm, mã SKU, Barcode, Giá nhập, Giá bán, Ngưỡng tồn tối thiểu | ✅ Done |
| 7 | **Warehouses** | Quản lý Nhà kho & Vị trí kho chi tiết (Kệ, Hàng) | ✅ Done |
| 8 | **Stock Transactions** | Nhập kho, Xuất kho, Chuyển kho giữa các vị trí/nhà kho (Sử dụng DB Transaction) | ✅ Done |
| 9 | **Inventory** | Tra cứu số lượng tồn kho thực tế, Cảnh báo tồn kho thấp (`low-stock`), Tồn kho theo từng sản phẩm | ✅ Done |
| 10 | **Dashboard** | Thống kê tổng quan, Biểu đồ nhập xuất & Báo cáo doanh số | ✅ Done |
| 11 | **Export / Import** | Xuất báo cáo ra file Excel (.xlsx) & Nhập dữ liệu hàng loạt | ✅ Done |
| 12 | **Audit Logs** | Nhật ký vết lịch sử thao tác hệ thống | ✅ Done |
| 13 | **AI Assistant** | Trợ lý AI tư vấn và tra cứu dữ liệu tồn kho bằng Google Gemini | ✅ Done |

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

```text
src/
├── config/             # Cấu hình Database, Security, Rate Limiter
├── constants/          # Định nghĩa Enum (UserRole, TransactionType...)
├── controllers/        # Tầng Controller (Xử lý req/res, validate Zod)
├── entities/           # Tầng Entity (Định nghĩa bảng CSDL bằng TypeORM)
├── middlewares/        # Middlewares (Auth, Error Handler trung tâm, Rate Limit)
├── routes/             # Tầng Routes (Định tuyến API & phân quyền)
├── services/           # Tầng Service (Xử lý nghiệp vụ & truy vấn CSDL)
├── types/              # Khai báo TypeScript types mở rộng (.d.ts)
├── utils/              # Các hàm tiện ích (JWT, Bcrypt, AppError)
├── validations/        # Zod Schemas kiểm tra dữ liệu đầu vào
└── server.ts           # File khởi chạy server ứng dụng
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Ứng Dụng (Getting Started)

### 1. Yêu cầu hệ thống
* Node.js >= 18.x
* Database PostgreSQL hoặc MySQL

### 2. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 3. Cấu hình môi trường (`.env`)
Tạo file `.env` tại thư mục gốc của backend với các biến:
```env
PORT=5000
NODE_ENV=development

# Database Config
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=inventory_db

# JWT Config
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 4. Khởi chạy ở môi trường Development
```bash
npm run dev
```

### 5. Kiểm tra biên dịch Production Build
```bash
npm run build
```

---

## 🛡️ Điểm Nổi Bật Về Kiến Trúc & Bảo Mật

* **Consistent Response Format:** Mọi API đều trả về chuẩn JSON format `{ success: true, data: ..., meta: ... }`.
* **Centralized Error Handling:** Xử lý lỗi tập trung qua `error.middleware.ts`, tự động phân loại lỗi Zod, lỗi Auth, lỗi Server.
* **Database Transactions:** Đảm bảo tính toàn vẹn dữ liệu (ACID) khi Nhập/Xuất/Chuyển kho.
* **Strict Validation:** Dữ liệu đầu vào luôn được lọc sạch qua Zod Schemas trước khi đi vào tầng Service.
