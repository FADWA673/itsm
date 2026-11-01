import { Router } from "express";
import { createTicket, getMyTickets, getAllTickets, getTicketById, updateTicketStatus, assignTicket, cancelTicket, reopenTicket, confirmResolution, getUnassignedTickets, claimTicket, deleteTicket, startWork, putOnHold, resumeTicket, resolveTicket, getTicketHistory } from "./tickets.controller";
import { getComments, addComment } from "./comments.controller";
import { createRating, getRating, getStatistics, getTechnicianStatistics } from "./ratings.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.post("/", createTicket);
router.get("/my", getMyTickets);
router.get("/queue", authorize("SUPER_ADMIN", "ADMIN", "MANAGER", "TECHNICIAN"), getUnassignedTickets);
router.get("/", authorize("SUPER_ADMIN", "ADMIN", "MANAGER", "DEPT_MANAGER", "TECHNICIAN"), getAllTickets);
router.get("/:id", getTicketById);
router.patch("/:id/status", updateTicketStatus);
router.patch("/:id/assign", authorize("SUPER_ADMIN", "ADMIN", "MANAGER", "TECHNICIAN"), assignTicket);

// Actions avancées
router.post("/:id/cancel", cancelTicket);
router.post("/:id/reopen", authorize("SUPER_ADMIN", "ADMIN", "TECHNICIAN"), reopenTicket);
router.post("/:id/confirm", confirmResolution);
router.post("/:id/claim", authorize("SUPER_ADMIN", "ADMIN", "TECHNICIAN"), claimTicket);
router.post("/:id/start", authorize("SUPER_ADMIN", "ADMIN", "TECHNICIAN"), startWork);
router.post("/:id/hold", authorize("SUPER_ADMIN", "ADMIN", "TECHNICIAN"), putOnHold);
router.post("/:id/resume", resumeTicket);
router.post("/:id/resolve", authorize("SUPER_ADMIN", "ADMIN", "TECHNICIAN"), resolveTicket);
router.delete("/:id", authorize("SUPER_ADMIN", "ADMIN"), deleteTicket);

// History
router.get("/:id/history", getTicketHistory);

// Comments
router.get("/:id/comments", getComments);
router.post("/:id/comments", addComment);

// Ratings
router.post("/:id/rate", createRating);
router.get("/:id/rating", getRating);

export default router;
