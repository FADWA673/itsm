import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createArticle,
  getPublishedArticles,
  getMyArticles,
  getPendingArticles,
  getArticleById,
  getArticleBySlug,
  updateArticle,
  submitForReview,
  reviewArticle,
  voteHelpful,
  deleteArticle,
  searchArticles,
} from "./kb.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

// ──────────────────────────────────────────────────────────────────────────
// CATEGORIES (Admin only)
// ──────────────────────────────────────────────────────────────────────────

router.post("/categories", authorize("SUPER_ADMIN", "ADMIN"), createCategory);
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.put("/categories/:id", authorize("SUPER_ADMIN", "ADMIN"), updateCategory);
router.delete("/categories/:id", authorize("SUPER_ADMIN", "ADMIN"), deleteCategory);

// ──────────────────────────────────────────────────────────────────────────
// ARTICLES
// ──────────────────────────────────────────────────────────────────────────

// Public (published articles)
router.get("/articles", getPublishedArticles);
router.get("/articles/search", searchArticles);
router.get("/articles/slug/:slug", getArticleBySlug);
router.post("/articles/:id/vote", voteHelpful);

// Author (Technician/Admin)
router.post("/articles", authorize("SUPER_ADMIN", "ADMIN", "TECHNICIAN"), createArticle);
router.get("/articles/my", getMyArticles);
router.put("/articles/:id", authorize("SUPER_ADMIN", "ADMIN", "TECHNICIAN"), updateArticle);
router.post("/articles/:id/submit", authorize("SUPER_ADMIN", "ADMIN", "TECHNICIAN"), submitForReview);
router.delete("/articles/:id", authorize("SUPER_ADMIN", "ADMIN", "TECHNICIAN"), deleteArticle);

// Admin (Review)
router.get("/articles/pending", authorize("SUPER_ADMIN", "ADMIN"), getPendingArticles);
router.post("/articles/:id/review", authorize("SUPER_ADMIN", "ADMIN"), reviewArticle);

// Detail
router.get("/articles/:id", getArticleById);

export default router;
