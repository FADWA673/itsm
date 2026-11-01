import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { notify } from "../../utils/notify";
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateArticleRequest,
  UpdateArticleRequest,
  ReviewArticleRequest,
  CategoryResponse,
  ArticleResponse,
} from "./kb.types";

// ============================================================================
// Helpers
// ============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCategory(category: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { articles: number };
}): CategoryResponse {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    displayOrder: category.displayOrder,
    articleCount: category._count?.articles,
    organizationId: category.organizationId,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

function formatArticle(article: {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: string;
  views: number;
  helpful: number;
  notHelpful: number;
  tags: string | null;
  publishedAt: Date | null;
  rejectedReason: string | null;
  authorId: string;
  author: { firstName: string; lastName: string };
  reviewedById: string | null;
  reviewedBy: { firstName: string; lastName: string } | null;
  categoryId: string;
  category: { name: string };
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}): ArticleResponse {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt,
    status: article.status,
    views: article.views,
    helpful: article.helpful,
    notHelpful: article.notHelpful,
    tags: article.tags,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    rejectedReason: article.rejectedReason,
    authorId: article.authorId,
    authorName: `${article.author.firstName} ${article.author.lastName}`,
    reviewedById: article.reviewedById,
    reviewedByName: article.reviewedBy
      ? `${article.reviewedBy.firstName} ${article.reviewedBy.lastName}`
      : null,
    categoryId: article.categoryId,
    categoryName: article.category.name,
    organizationId: article.organizationId,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

// ============================================================================
// Service
// ============================================================================

export class KnowledgeBaseService {
  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORIES
  // ──────────────────────────────────────────────────────────────────────────

  async createCategory(
    data: CreateCategoryRequest,
    organizationId: string
  ): Promise<CategoryResponse> {
    const slug = slugify(data.name);

    // Vérifier unicité du slug
    const existing = await prisma.kBCategory.findFirst({
      where: { slug, organizationId },
    });

    if (existing) {
      throw new ApiError(400, "A category with this name already exists");
    }

    const category = await prisma.kBCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon,
        displayOrder: data.displayOrder ?? 0,
        organizationId,
      },
    });

    return formatCategory(category);
  }

  async getAllCategories(organizationId: string): Promise<CategoryResponse[]> {
    const categories = await prisma.kBCategory.findMany({
      where: { organizationId },
      include: { _count: { select: { articles: true } } },
      orderBy: { displayOrder: "asc" },
    });

    return categories.map(formatCategory);
  }

  async getCategoryById(id: string): Promise<CategoryResponse> {
    const category = await prisma.kBCategory.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });

    if (!category) throw new ApiError(404, "Category not found");
    return formatCategory(category);
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> {
    const existing = await prisma.kBCategory.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Category not found");

    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = slugify(data.name);
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

    const category = await prisma.kBCategory.update({
      where: { id },
      data: updateData,
      include: { _count: { select: { articles: true } } },
    });

    return formatCategory(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await prisma.kBCategory.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });

    if (!category) throw new ApiError(404, "Category not found");

    if (category._count.articles > 0) {
      throw new ApiError(400, "Cannot delete category with articles. Please move or delete articles first.");
    }

    await prisma.kBCategory.delete({ where: { id } });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ARTICLES
  // ──────────────────────────────────────────────────────────────────────────

  async createArticle(
    data: CreateArticleRequest,
    authorId: string,
    organizationId: string
  ): Promise<ArticleResponse> {
    // Vérifier que la catégorie existe
    const category = await prisma.kBCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) throw new ApiError(404, "Category not found");

    const slug = slugify(data.title);

    const article = await prisma.kBArticle.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        tags: data.tags,
        status: "DRAFT",
        authorId,
        categoryId: data.categoryId,
        organizationId,
      },
      include: {
        author: true,
        reviewedBy: true,
        category: true,
      },
    });

    return formatArticle(article);
  }

  async getPublishedArticles(organizationId: string): Promise<ArticleResponse[]> {
    const articles = await prisma.kBArticle.findMany({
      where: { organizationId, status: "PUBLISHED" },
      include: {
        author: true,
        reviewedBy: true,
        category: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    return articles.map(formatArticle);
  }

  async getMyArticles(authorId: string): Promise<ArticleResponse[]> {
    const articles = await prisma.kBArticle.findMany({
      where: { authorId },
      include: {
        author: true,
        reviewedBy: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return articles.map(formatArticle);
  }

  async getPendingArticles(organizationId: string): Promise<ArticleResponse[]> {
    const articles = await prisma.kBArticle.findMany({
      where: { organizationId, status: "PENDING_REVIEW" },
      include: {
        author: true,
        reviewedBy: true,
        category: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return articles.map(formatArticle);
  }

  async getArticleById(id: string): Promise<ArticleResponse> {
    const article = await prisma.kBArticle.findUnique({
      where: { id },
      include: {
        author: true,
        reviewedBy: true,
        category: true,
      },
    });

    if (!article) throw new ApiError(404, "Article not found");
    return formatArticle(article);
  }

  async getArticleBySlug(slug: string, organizationId: string): Promise<ArticleResponse> {
    const article = await prisma.kBArticle.findFirst({
      where: { slug, organizationId, status: "PUBLISHED" },
      include: {
        author: true,
        reviewedBy: true,
        category: true,
      },
    });

    if (!article) throw new ApiError(404, "Article not found");

    // Incrémenter les vues
    await prisma.kBArticle.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    return formatArticle({ ...article, views: article.views + 1 });
  }

  async updateArticle(id: string, data: UpdateArticleRequest, userId: string): Promise<ArticleResponse> {
    const existing = await prisma.kBArticle.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Article not found");

    // Vérifier que l'utilisateur est l'auteur ou admin
    if (existing.authorId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN") {
        throw new ApiError(403, "You can only edit your own articles");
      }
    }

    const updateData: any = {};
    if (data.title) {
      updateData.title = data.title;
      updateData.slug = slugify(data.title);
    }
    if (data.content) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.categoryId) updateData.categoryId = data.categoryId;
    if (data.tags !== undefined) updateData.tags = data.tags;

    const article = await prisma.kBArticle.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
        reviewedBy: true,
        category: true,
      },
    });

    return formatArticle(article);
  }

  async submitForReview(id: string, authorId: string): Promise<ArticleResponse> {
    const article = await prisma.kBArticle.findUnique({ where: { id } });
    if (!article) throw new ApiError(404, "Article not found");

    if (article.authorId !== authorId) {
      throw new ApiError(403, "You can only submit your own articles");
    }

    if (article.status !== "DRAFT" && article.status !== "REJECTED") {
      throw new ApiError(400, "Only draft or rejected articles can be submitted");
    }

    const updated = await prisma.kBArticle.update({
      where: { id },
      data: { status: "PENDING_REVIEW", rejectedReason: null },
      include: {
        author: true,
        reviewedBy: true,
        category: true,
      },
    });

    // Notifier les admins
    const admins = await prisma.user.findMany({
      where: {
        organizationId: article.organizationId,
        role: { in: ["SUPER_ADMIN", "ADMIN"] },
      },
    });

    for (const admin of admins) {
      await notify(
        admin.id,
        "SYSTEM_INFO",
        "New KB article pending review",
        `Article "${updated.title}" by ${updated.author.firstName} ${updated.author.lastName} is awaiting approval.`,
        null
      );
    }

    return formatArticle(updated);
  }

  async reviewArticle(
    id: string,
    data: ReviewArticleRequest,
    reviewerId: string
  ): Promise<ArticleResponse> {
    const article = await prisma.kBArticle.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!article) throw new ApiError(404, "Article not found");

    if (article.status !== "PENDING_REVIEW") {
      throw new ApiError(400, "Only pending articles can be reviewed");
    }

    const updateData: any = {
      reviewedById: reviewerId,
    };

    if (data.action === "approve") {
      updateData.status = "PUBLISHED";
      updateData.publishedAt = new Date();
      updateData.rejectedReason = null;
    } else {
      updateData.status = "REJECTED";
      updateData.rejectedReason = data.rejectedReason || "No reason provided";
    }

    const updated = await prisma.kBArticle.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
        reviewedBy: true,
        category: true,
      },
    });

    // Notifier l'auteur
    await notify(
      article.authorId,
      data.action === "approve" ? "SYSTEM_INFO" : "SYSTEM_WARNING",
      data.action === "approve" ? "Article published" : "Article rejected",
      data.action === "approve"
        ? `Your article "${updated.title}" has been approved and published!`
        : `Your article "${updated.title}" was rejected. Reason: ${data.rejectedReason || "No reason provided"}`,
      null
    );

    return formatArticle(updated);
  }

  async voteHelpful(id: string, helpful: boolean): Promise<ArticleResponse> {
    const article = await prisma.kBArticle.findUnique({ where: { id } });
    if (!article) throw new ApiError(404, "Article not found");

    const updated = await prisma.kBArticle.update({
      where: { id },
      data: helpful ? { helpful: { increment: 1 } } : { notHelpful: { increment: 1 } },
      include: {
        author: true,
        reviewedBy: true,
        category: true,
      },
    });

    return formatArticle(updated);
  }

  async deleteArticle(id: string, userId: string): Promise<void> {
    const article = await prisma.kBArticle.findUnique({ where: { id } });
    if (!article) throw new ApiError(404, "Article not found");

    // Vérifier que l'utilisateur est l'auteur ou admin
    if (article.authorId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN") {
        throw new ApiError(403, "You can only delete your own articles");
      }
    }

    await prisma.kBArticle.delete({ where: { id } });
  }

  async searchArticles(query: string, organizationId: string): Promise<ArticleResponse[]> {
    const articles = await prisma.kBArticle.findMany({
      where: {
        organizationId,
        status: "PUBLISHED",
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { tags: { contains: query } },
        ],
      },
      include: {
        author: true,
        reviewedBy: true,
        category: true,
      },
      orderBy: { views: "desc" },
      take: 20,
    });

    return articles.map(formatArticle);
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
