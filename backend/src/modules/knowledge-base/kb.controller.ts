import { Request, Response } from "express";
import { knowledgeBaseService } from "./kb.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateArticleRequest,
  UpdateArticleRequest,
  ReviewArticleRequest,
} from "./kb.types";

// ============================================================================
// CATEGORIES
// ============================================================================

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const body = req.body as CreateCategoryRequest;
  if (!body.name) throw new ApiError(400, "Category name is required");

  const category = await knowledgeBaseService.createCategory(body, req.user.organizationId);
  res.status(201).json({ success: true, message: "Category created", data: category });
});

export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const categories = await knowledgeBaseService.getAllCategories(req.user.organizationId);
  res.json({ success: true, message: "Categories retrieved", data: categories });
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const category = await knowledgeBaseService.getCategoryById(id);
  res.json({ success: true, message: "Category retrieved", data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const body = req.body as UpdateCategoryRequest;

  const category = await knowledgeBaseService.updateCategory(id, body);
  res.json({ success: true, message: "Category updated", data: category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  await knowledgeBaseService.deleteCategory(id);
  res.json({ success: true, message: "Category deleted" });
});

// ============================================================================
// ARTICLES
// ============================================================================

export const createArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const body = req.body as CreateArticleRequest;
  if (!body.title || !body.content || !body.categoryId) {
    throw new ApiError(400, "Title, content, and categoryId are required");
  }

  const article = await knowledgeBaseService.createArticle(body, req.user.id, req.user.organizationId);
  res.status(201).json({ success: true, message: "Article created", data: article });
});

export const getPublishedArticles = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const articles = await knowledgeBaseService.getPublishedArticles(req.user.organizationId);
  res.json({ success: true, message: "Published articles retrieved", data: articles });
});

export const getMyArticles = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const articles = await knowledgeBaseService.getMyArticles(req.user.id);
  res.json({ success: true, message: "My articles retrieved", data: articles });
});

export const getPendingArticles = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const articles = await knowledgeBaseService.getPendingArticles(req.user.organizationId);
  res.json({ success: true, message: "Pending articles retrieved", data: articles });
});

export const getArticleById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const article = await knowledgeBaseService.getArticleById(id);
  res.json({ success: true, message: "Article retrieved", data: article });
});

export const getArticleBySlug = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const slug = req.params["slug"] as string;
  const article = await knowledgeBaseService.getArticleBySlug(slug, req.user.organizationId);
  res.json({ success: true, message: "Article retrieved", data: article });
});

export const updateArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const id = req.params["id"] as string;
  const body = req.body as UpdateArticleRequest;

  const article = await knowledgeBaseService.updateArticle(id, body, req.user.id);
  res.json({ success: true, message: "Article updated", data: article });
});

export const submitForReview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const id = req.params["id"] as string;
  const article = await knowledgeBaseService.submitForReview(id, req.user.id);
  res.json({ success: true, message: "Article submitted for review", data: article });
});

export const reviewArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const id = req.params["id"] as string;
  const body = req.body as ReviewArticleRequest;

  if (!body.action || !["approve", "reject"].includes(body.action)) {
    throw new ApiError(400, "Action must be 'approve' or 'reject'");
  }

  if (body.action === "reject" && !body.rejectedReason) {
    throw new ApiError(400, "Rejection reason is required");
  }

  const article = await knowledgeBaseService.reviewArticle(id, body, req.user.id);
  res.json({ success: true, message: "Article reviewed", data: article });
});

export const voteHelpful = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const { helpful } = req.body as { helpful: boolean };

  if (typeof helpful !== "boolean") {
    throw new ApiError(400, "helpful must be a boolean");
  }

  const article = await knowledgeBaseService.voteHelpful(id, helpful);
  res.json({ success: true, message: "Vote recorded", data: article });
});

export const deleteArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const id = req.params["id"] as string;
  await knowledgeBaseService.deleteArticle(id, req.user.id);
  res.json({ success: true, message: "Article deleted" });
});

export const searchArticles = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const query = req.query["q"] as string;
  if (!query) throw new ApiError(400, "Search query is required");

  const articles = await knowledgeBaseService.searchArticles(query, req.user.organizationId);
  res.json({ success: true, message: "Search results", data: articles });
});
