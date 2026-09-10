import { Router } from "express";
import authRouter from "./auth.route";

const router = Router();
const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);

router.use("/api/v1", apiV1Router);

export default router;
