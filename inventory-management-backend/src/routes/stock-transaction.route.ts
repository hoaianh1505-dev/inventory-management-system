import { Router } from "express";
import {
  importStock,
  exportStock,
  transferStock,
  adjustStock,
  getTransactions,
  getTransactionById,
} from "../controllers/stock-transaction.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

const router = Router();

router.use(authenticateJWT);

router.get("/", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), getTransactions);
router.get("/:id", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), getTransactionById);

router.post(
  "/import",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  importStock
);

router.post(
  "/export",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  exportStock
);

router.post(
  "/transfer",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  transferStock
);

router.post(
  "/adjustment",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  adjustStock
);

export default router;
