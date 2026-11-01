import { Router } from "express";
import {
  getUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  deactivateUser,
  getMe,
  updateMe,
  changePassword,
} from "./users.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// ─── Profile routes — any authenticated user ─────────────────────────────────
// Must be declared BEFORE the admin authorize middleware
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMe);
router.patch("/me/password", authenticate, changePassword);

// ─── Admin-only routes ────────────────────────────────────────────────────────
// Each route explicitly carries authenticate + authorize so the /me routes above
// are never touched by the ADMIN restriction.
router.get("/", authenticate, authorize("SUPER_ADMIN", "ADMIN"), getUsers);
router.post("/", authenticate, authorize("SUPER_ADMIN", "ADMIN"), createUser);
router.put("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), updateUser);
router.post("/:id/reset-password", authenticate, authorize("SUPER_ADMIN", "ADMIN"), resetUserPassword);
router.delete("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), deleteUser);
router.patch("/:id/deactivate", authenticate, authorize("SUPER_ADMIN", "ADMIN"), deactivateUser);

export default router;
