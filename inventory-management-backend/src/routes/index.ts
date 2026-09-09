import { Router } from "express";

const router = Router();

const apiV1Router = Router();

router.use("/api/v1", apiV1Router);

export default router;
