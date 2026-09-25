import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";
import {
  sendIndividualMail,
  broadcastMail,
  testMailConnection,
} from "../controllers/mail.controller";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles(UserRole.ADMIN, UserRole.MANAGER));

router.post("/send-individual", sendIndividualMail);
router.post("/broadcast", broadcastMail);
router.get("/status", testMailConnection);

export default router;
