/**
 * Routes Categories — Endpoints API pour les catégories de tickets
 */

import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import * as categoriesController from "./categories.controller";

const router = Router();

// Toutes les routes nécessitent authentification
router.use(authenticate);

// ─── Routes accessibles à tous les utilisateurs authentifiés ─────────────────

// GET /api/v1/ticket-categories
router.get("/", categoriesController.getAllCategories);

// GET /api/v1/ticket-categories/root
router.get("/root", categoriesController.getRootCategories);

// GET /api/v1/ticket-categories/:id
router.get("/:id", categoriesController.getCategoryById);

// GET /api/v1/ticket-categories/:id/subcategories
router.get("/:id/subcategories", categoriesController.getSubcategories);

// ─── Routes Admin/Manager seulement ──────────────────────────────────────────

// POST /api/v1/ticket-categories
router.post(
  "/",
  authorize(["ADMIN", "MANAGER"]),
  categoriesController.createCategory
);

// PUT /api/v1/ticket-categories/:id
router.put(
  "/:id",
  authorize(["ADMIN", "MANAGER"]),
  categoriesController.updateCategory
);

// DELETE /api/v1/ticket-categories/:id
router.delete(
  "/:id",
  authorize(["ADMIN", "MANAGER"]),
  categoriesController.deleteCategory
);

export default router;
