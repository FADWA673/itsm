import { Router } from "express";
import {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  assignAsset,
  unassignAsset,
  retireAsset,
  getAssetHistory,
  deleteAsset,
  getAssetStats,
} from "./assets.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

// Routes publiques (tous les utilisateurs authentifiés)
router.get("/", getAllAssets);
router.get("/stats", getAssetStats);
router.get("/:id", getAssetById);
router.get("/:id/history", getAssetHistory);

// Routes protégées (Admin, Super Admin, Technician)
router.post("/", authorize("SUPER_ADMIN", "ADMIN", "MANAGER"), createAsset);
router.put("/:id", authorize("SUPER_ADMIN", "ADMIN", "MANAGER", "TECHNICIAN"), updateAsset);
router.post("/:id/assign", authorize("SUPER_ADMIN", "ADMIN", "MANAGER"), assignAsset);
router.post("/:id/unassign", authorize("SUPER_ADMIN", "ADMIN", "MANAGER"), unassignAsset);
router.post("/:id/retire", authorize("SUPER_ADMIN", "ADMIN", "MANAGER"), retireAsset);
router.delete("/:id", authorize("SUPER_ADMIN", "ADMIN"), deleteAsset);

export default router;
