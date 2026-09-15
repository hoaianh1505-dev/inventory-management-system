import { Router } from "express";
import authRouter from "./auth.route";
import userRouter from "./user.route";
import categoryRouter from "./category.route";
import unitRouter from "./unit.route";
import supplierRouter from "./supplier.route";
import productRouter from "./product.route";
import { getRoles } from "../controllers/user.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

const router = Router();
const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);
apiV1Router.use("/users", userRouter);
apiV1Router.use("/categories", categoryRouter);
apiV1Router.use("/units", unitRouter);
apiV1Router.use("/suppliers", supplierRouter);
apiV1Router.use("/products", productRouter);
apiV1Router.get("/roles", authenticateJWT, authorizeRoles(UserRole.ADMIN), getRoles);

router.use("/api/v1", apiV1Router);

export default router;
