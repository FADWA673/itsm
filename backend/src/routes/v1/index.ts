import { Router } from "express";
import healthRouter from "./health.routes";

const router = Router();

/**
 * API v1 routes
 * Tous les futurs modules seront montés ici.
 *
 * Exemple futur :
 *   import authRouter from "./auth.routes";
 *   router.use("/auth", authRouter);
 *
 *   import ticketRouter from "./ticket.routes";
 *   router.use("/tickets", ticketRouter);
 */
router.use("/health", healthRouter);

export default router;
