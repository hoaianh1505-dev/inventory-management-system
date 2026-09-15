import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  deleteImage,
  setPrimaryImage,
} from "../controllers/product.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { UserRole } from "../constants";

const router = Router();

router.use(authenticateJWT);

router.get("/", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF), getProducts);
router.get("/:id", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF), getProductById);

router.post("/", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), createProduct);
router.put("/:id", authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), updateProduct);
router.delete("/:id", authorizeRoles(UserRole.ADMIN), deleteProduct);

router.post(
  "/:id/images",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  upload.array("images", 5),
  uploadImages
);
router.delete(
  "/:id/images/:imageId",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  deleteImage
);
router.patch(
  "/:id/images/:imageId/primary",
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  setPrimaryImage
);

export default router;
