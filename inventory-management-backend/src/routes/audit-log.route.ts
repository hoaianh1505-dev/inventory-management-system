import { Router } from "express";
import { getAuditLogs } from "../controllers/audit-log.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

const router = Router();

router.use(authenticateJWT);

router.get(
  "/",
  authorizeRoles(UserRole.ADMIN),
  getAuditLogs
);

export default router;
