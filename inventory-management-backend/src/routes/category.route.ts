import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

const router = Router();

// Protect all category routes with JWT authentication
router.use(authenticateJWT);

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), createCategory);
router.patch("/:id", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), updateCategory);
router.delete("/:id", authorizeRoles(UserRole.ADMIN), deleteCategory);

export default router;
