import { apiClient } from "./api";

// ============================================================================
// Types
// ============================================================================

export interface KBCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
  articleCount?: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface KBArticle {
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
  publishedAt: string | null;
  rejectedReason: string | null;
  authorId: string;
  authorName: string;
  reviewedById: string | null;
  reviewedByName: string | null;
  categoryId: string;
  categoryName: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  // Optional for compatibility
  author?: { firstName: string; lastName: string };
  reviewedBy?: { firstName: string; lastName: string } | null;
  category?: { id: string; name: string };
  viewCount?: number;
  helpfulCount?: number;
  notHelpfulCount?: number;
  _count?: { articles?: number };
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt?: string;
  categoryId: string;
  tags?: string;
}

export interface UpdateArticleData {
  title?: string;
  content?: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string;
}

// ============================================================================
// Service
// ============================================================================

export const knowledgeBaseService = {
  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORIES
  // ──────────────────────────────────────────────────────────────────────────

  async getAllCategories(): Promise<KBCategory[]> {
    const response = await apiClient.get("/kb/categories");
    return response.data.data;
  },

  async getCategoryById(id: string): Promise<KBCategory> {
    const response = await apiClient.get(`/kb/categories/${id}`);
    return response.data.data;
  },

  async createCategory(data: CreateCategoryData): Promise<KBCategory> {
    const response = await apiClient.post("/kb/categories", data);
    return response.data.data;
  },

  async updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<KBCategory> {
    const response = await apiClient.put(`/kb/categories/${id}`, data);
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/kb/categories/${id}`);
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ARTICLES
  // ──────────────────────────────────────────────────────────────────────────

  // Publics (tous les utilisateurs)
  async getPublishedArticles(): Promise<KBArticle[]> {
    const response = await apiClient.get("/kb/articles");
    return response.data.data;
  },

  async getArticleById(id: string): Promise<KBArticle> {
    const response = await apiClient.get(`/kb/articles/${id}`);
    return response.data.data;
  },

  async getArticleBySlug(slug: string): Promise<KBArticle> {
    const response = await apiClient.get(`/kb/articles/slug/${slug}`);
    return response.data.data;
  },

  async searchArticles(query: string): Promise<KBArticle[]> {
    const response = await apiClient.get(`/kb/articles/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  async voteArticle(id: string, helpful: boolean): Promise<KBArticle> {
    const response = await apiClient.post(`/kb/articles/${id}/vote`, { helpful });
    return response.data.data;
  },

  // Auteur (Technician/Admin)
  async getMyArticles(): Promise<KBArticle[]> {
    const response = await apiClient.get("/kb/articles/my");
    return response.data.data;
  },

  async createArticle(data: CreateArticleData): Promise<KBArticle> {
    const response = await apiClient.post("/kb/articles", data);
    return response.data.data;
  },

  async updateArticle(id: string, data: UpdateArticleData): Promise<KBArticle> {
    const response = await apiClient.put(`/kb/articles/${id}`, data);
    return response.data.data;
  },

  async submitForReview(id: string): Promise<KBArticle> {
    const response = await apiClient.post(`/kb/articles/${id}/submit`);
    return response.data.data;
  },

  async deleteArticle(id: string): Promise<void> {
    await apiClient.delete(`/kb/articles/${id}`);
  },

  // Admin (Review)
  async getPendingArticles(): Promise<KBArticle[]> {
    const response = await apiClient.get("/kb/articles/pending");
    return response.data.data;
  },

  async getAllArticles(): Promise<KBArticle[]> {
    const response = await apiClient.get("/kb/articles/all");
    return response.data.data;
  },

  async reviewArticle(id: string, action: "approve" | "reject", rejectedReason?: string): Promise<KBArticle> {
    const response = await apiClient.post(`/kb/articles/${id}/review`, {
      action,
      rejectedReason,
    });
    return response.data.data;
  },
};
