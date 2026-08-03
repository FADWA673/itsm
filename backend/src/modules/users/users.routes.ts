import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser, deactivateUser } from "./users.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.use(authorize("SUPER_ADMIN", "ADMIN"));

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/deactivate", deactivateUser);

export default router;
