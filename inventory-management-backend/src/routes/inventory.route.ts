import { Router } from "express";
import {
  getInventory,
  getLowStock,
  getInventoryByProduct,
} from "../controllers/inventory.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

const router = Router();

router.use(authenticateJWT);

router.get(
  "/",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  getInventory
);

router.get(
  "/low-stock",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  getLowStock
);

router.get(
  "/product/:productId",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  getInventoryByProduct
);

export default router;
