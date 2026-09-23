import { Router } from "express";
import authRouter from "./auth.route";
import userRouter from "./user.route";
import categoryRouter from "./category.route";
import unitRouter from "./unit.route";
import supplierRouter from "./supplier.route";
import productRouter from "./product.route";
import warehouseRouter from "./warehouse.route";
import stockTransactionRouter from "./stock-transaction.route";
import inventoryRouter from "./inventory.route";
import dashboardRouter from "./dashboard.route";
import excelRouter from "./excel.route";
import auditLogRouter from "./audit-log.route";
import aiAssistantRouter from "./ai-assistant.route";
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
apiV1Router.use("/warehouses", warehouseRouter);
apiV1Router.use("/stock-transactions", stockTransactionRouter);
apiV1Router.use("/inventory", inventoryRouter);
apiV1Router.use("/dashboard", dashboardRouter);
apiV1Router.use("/excel", excelRouter);
apiV1Router.use("/audit-logs", auditLogRouter);
apiV1Router.use("/ai", aiAssistantRouter);
apiV1Router.get("/roles", authenticateJWT, authorizeRoles(UserRole.ADMIN), getRoles);

router.use("/api/v1", apiV1Router);

export default router;
