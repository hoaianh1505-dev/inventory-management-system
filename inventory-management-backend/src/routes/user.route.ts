import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  resetPassword,
  deleteUser,
  getRoles,
} from "../controllers/user.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

const router = Router();

// Protect all user routes: Requires Login + Admin Role
router.use(authenticateJWT, authorizeRoles(UserRole.ADMIN));

router.get("/roles", getRoles);
router.get("/", getUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.patch("/:id/reset-password", resetPassword);
router.delete("/:id", deleteUser);

export default router;
