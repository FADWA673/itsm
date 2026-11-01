// ============================================================================
// Knowledge Base Types
// ============================================================================

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  excerpt?: string;
  categoryId: string;
  tags?: string;
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string;
}

export interface ReviewArticleRequest {
  action: "approve" | "reject";
  rejectedReason?: string;
}

export interface CategoryResponse {
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

export interface ArticleResponse {
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
}
