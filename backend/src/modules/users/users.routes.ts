import { Router } from "express";
import { getUsers, createUser, deactivateUser } from "./users.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// Toutes les routes users nécessitent d'être authentifié + rôle admin
router.use(authenticate);
router.use(authorize("SUPER_ADMIN", "ADMIN"));

router.get("/", getUsers);
router.post("/", createUser);
router.patch("/:id/deactivate", deactivateUser);

export default router;
