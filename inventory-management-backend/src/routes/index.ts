import { Router } from "express";
import authRouter from "./auth.route";
import userRouter from "./user.route";
import { getRoles } from "../controllers/user.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { UserRole } from "../constants";

const router = Router();
const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);
apiV1Router.use("/users", userRouter);
apiV1Router.get("/roles", authenticateJWT, authorizeRoles(UserRole.ADMIN), getRoles);

router.use("/api/v1", apiV1Router);

export default router;
