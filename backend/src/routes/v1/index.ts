import { Router } from "express";
import healthRouter from "./health.routes";
import authRouter from "../../modules/auth/auth.routes";
import usersRouter from "../../modules/users/users.routes";
import ticketsRouter from "../../modules/tickets/tickets.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/tickets", ticketsRouter);

export default router;
