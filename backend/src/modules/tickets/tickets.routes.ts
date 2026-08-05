import { Router } from "express";
import { createTicket, getMyTickets, getAllTickets, getTicketById, updateTicketStatus, assignTicket } from "./tickets.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.post("/", createTicket);
router.get("/my", getMyTickets);
router.get("/", authorize("SUPER_ADMIN", "ADMIN", "MANAGER", "DEPT_MANAGER", "TECHNICIAN"), getAllTickets);
router.get("/:id", getTicketById);
router.patch("/:id/status", updateTicketStatus);
router.patch("/:id/assign", authorize("SUPER_ADMIN", "ADMIN", "MANAGER", "TECHNICIAN"), assignTicket);

export default router;
