import { Router } from "express";
import {
  getFullDashboard,
  getDashboardStats,
  getStockMovementChart,
  getTopExportedProducts,
  getRecentTransactions,
} from "../controllers/dashboard.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

const router = Router();

router.use(authenticateJWT);

router.get(
  "/",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  getFullDashboard
);

router.get(
  "/stats",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  getDashboardStats
);

router.get(
  "/stock-movement",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  getStockMovementChart
);

router.get(
  "/top-products",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  getTopExportedProducts
);

router.get(
  "/recent-transactions",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  getRecentTransactions
);

export default router;
