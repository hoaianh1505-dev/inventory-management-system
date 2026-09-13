import { Router } from "express";
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplier.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

const router = Router();

router.use(authenticateJWT);

router.get("/", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), getSuppliers);
router.get("/:id", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), getSupplierById);
router.post("/", authorizeRoles(UserRole.ADMIN), createSupplier);
router.patch("/:id", authorizeRoles(UserRole.ADMIN), updateSupplier);
router.delete("/:id", authorizeRoles(UserRole.ADMIN), deleteSupplier);

export default router;
