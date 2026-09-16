import { Router } from "express";
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseLocations,
  getWarehouseLocationById,
  createWarehouseLocation,
  updateWarehouseLocation,
  deleteWarehouseLocation,
} from "../controllers/warehouse.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

const router = Router();

router.use(authenticateJWT);

// Warehouse Routes
router.get("/", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF), getWarehouses);
router.get("/locations", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF), getWarehouseLocations);
router.get("/locations/:id", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF), getWarehouseLocationById);
router.get("/:id", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF), getWarehouseById);

router.post("/", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), createWarehouse);
router.put("/:id", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), updateWarehouse);
router.delete("/:id", authorizeRoles(UserRole.ADMIN), deleteWarehouse);

// Warehouse Location Routes
router.post("/locations", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), createWarehouseLocation);
router.put("/locations/:id", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), updateWarehouseLocation);
router.delete("/locations/:id", authorizeRoles(UserRole.ADMIN), deleteWarehouseLocation);

export default router;
