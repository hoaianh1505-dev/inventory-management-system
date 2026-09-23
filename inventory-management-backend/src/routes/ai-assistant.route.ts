import { Router } from "express";
import {
  chatWithAi,
  getAiSuggestions,
} from "../controllers/ai-assistant.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

const router = Router();

router.use(authenticateJWT);

router.post(
  "/chat",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  chatWithAi
);

router.get(
  "/suggestions",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF),
  getAiSuggestions
);

export default router;
