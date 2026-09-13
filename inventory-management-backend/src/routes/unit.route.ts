import { Router } from "express";
import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from "../controllers/unit.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

const router = Router();

router.use(authenticateJWT);

router.get("/", getUnits);
router.post("/", authorizeRoles(UserRole.ADMIN), createUnit);
router.patch("/:id", authorizeRoles(UserRole.ADMIN), updateUnit);
router.delete("/:id", authorizeRoles(UserRole.ADMIN), deleteUnit);

export default router;
