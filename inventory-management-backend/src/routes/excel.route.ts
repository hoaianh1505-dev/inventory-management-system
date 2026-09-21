import { Router } from "express";
import multer from "multer";
import {
  exportProducts,
  exportInventory,
  exportStockTransactions,
  downloadProductTemplate,
  importProducts,
} from "../controllers/excel.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

// Cấu hình Multer nhận file lưu vào bộ nhớ tạm (Memory Buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file 10MB
});

const router = Router();

router.use(authenticateJWT);

// Tải file mẫu Excel
router.get(
  "/template/products",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  downloadProductTemplate
);

// Xuất các báo cáo Excel
router.get(
  "/export/products",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  exportProducts
);

router.get(
  "/export/inventory",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  exportInventory
);

router.get(
  "/export/stock-transactions",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  exportStockTransactions
);

// Nhập hàng loạt sản phẩm từ file Excel
router.post(
  "/import/products",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  upload.single("file"),
  importProducts
);

export default router;
