import { Router } from "express";
import { getStatistics, getTechnicianStatistics } from "./ratings.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

// Routes des statistiques (Admin/Manager seulement)
router.get("/statistics", authorize("SUPER_ADMIN", "ADMIN", "MANAGER"), getStatistics);
router.get("/statistics/technicians", authorize("SUPER_ADMIN", "ADMIN", "MANAGER"), getTechnicianStatistics);

export default router;
