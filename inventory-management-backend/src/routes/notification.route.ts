import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";
import {
  broadcastNotification,
  sendTestAlert,
  getSocketStatus,
} from "../controllers/notification.controller";

const router = Router();

router.use(authenticateJWT);

router.post(
  "/broadcast",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  broadcastNotification
);

router.post("/test-alert", sendTestAlert);

router.get("/status", getSocketStatus);

export default router;
