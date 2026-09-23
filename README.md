# 📦 Inventory Management System (IMS)

Hệ thống Quản lý Tồn kho Toàn diện (Full-stack Inventory Management System) thiết kế theo kiến trúc hiện đại, bảo mật và hiệu năng cao.

---

## 📂 Cấu Trúc Repository

```text
inventory-management-system/
├── inventory-management-backend/   # RESTful API Backend (Node.js, Express, TypeScript, TypeORM)
└── inventory-management-frontend/  # Web Application Frontend (React, TypeScript - Sắp ra mắt)
```

---

## 🚀 1. Backend API (`inventory-management-backend`)

Backend được xây dựng theo chuẩn **Layered Architecture** (`Route` ➔ `Controller` ➔ `Service` ➔ `Entity`), đảm bảo tính bảo mật, dễ bảo trì và mở rộng.

### Công Nghệ Sử Dụng
* **Language:** TypeScript
* **Framework:** Express.js
* **Database & ORM:** TypeORM (PostgreSQL / MySQL)
* **Validation & Security:** Zod, JWT (HttpOnly Cookie), BcryptJS, Helmet, CORS, Rate Limit

### Danh Sách Module Backend Đã Triển Khai (13/13 Modules - Hoàn Thành 100%)
* [x] **Auth:** Đăng nhập, Đăng xuất, Refresh Token Cookie, Đổi mật khẩu, Profile & Avatar.
* [x] **Users:** Quản lý tài khoản & Phân quyền (`ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`).
* [x] **Categories:** Quản lý danh mục sản phẩm.
* [x] **Units:** Quản lý đơn vị tính (Cái, Hộp, Thùng...).
* [x] **Suppliers:** Quản lý nhà cung cấp.
* [x] **Products:** Quản lý sản phẩm, SKU, Barcode, Giá nhập, Giá bán, Ngưỡng tồn tối thiểu.
* [x] **Warehouses:** Quản lý Nhà kho & Vị trí kho chi tiết (Kệ, Hàng).
* [x] **Stock Transactions:** Giao dịch Nhập kho, Xuất kho, Chuyển kho (Sử dụng Database Transaction).
* [x] **Inventory:** Tra cứu tồn kho thực tế, Cảnh báo tồn kho thấp (`low-stock`), Chi tiết sản phẩm.
* [x] **Dashboard:** Thống kê tổng quan & Biểu đồ nhập xuất.
* [x] **Export/Import Excel:** Xuất báo cáo ra file Excel (.xlsx) & Nhập dữ liệu hàng loạt.
* [x] **Audit Logs:** Nhật ký vết thao tác hệ thống.
* [x] **AI Assistant:** Trợ lý AI tư vấn và tra cứu dữ liệu tồn kho bằng Google Gemini.

---

## 💻 2. Khởi Chạy Nhanh Backend (Quick Start)

```bash
# 1. Di chuyển vào thư mục backend
cd inventory-management-backend

# 2. Cài đặt phụ thuộc
npm install

# 3. Chạy môi trường Dev
npm run dev

# 4. Kiểm tra build
npm run build
```

Chi tiết hướng dẫn cấu hình `.env` xem tại [README Backend](file:///g:/@HKDN/inventory-management-system/inventory-management-backend/README.md).
