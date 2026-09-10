import { Router } from "express";
import {
  login,
  logout,
  getMe,
  changePassword,
  refresh,
} from "../controllers/auth.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { authRateLimiter } from "../config/security.config";

const router = Router();

router.post("/login", authRateLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", authenticateJWT, logout);
router.get("/me", authenticateJWT, getMe);
router.patch("/change-password", authenticateJWT, changePassword);

export default router;
