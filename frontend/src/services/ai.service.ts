import { apiClient } from "./api";

// ============================================================================
// Types
// ============================================================================

export interface KBSuggestion {
  articleId: string;
  title: string;
  slug: string;
  excerpt: string;
  relevanceScore: number;
  categoryName: string;
}

export interface SuggestSolutionsResponse {
  suggestions: KBSuggestion[];
  aiAnalysis: string;
  canResolveWithoutTicket: boolean;
}

export interface AnalyzeTicketResponse {
  suggestedPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  suggestedCategory: string;
  enrichedDescription: string;
  keywords: string[];
  estimatedResolutionTime: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ============================================================================
// AI Service
// ============================================================================

class AIService {
  /**
   * Get AI-powered KB article suggestions
   */
  async suggestSolutions(problem: string, category?: string): Promise<SuggestSolutionsResponse> {
    const response = await apiClient.post("/ai/suggest-solutions", {
      problem,
      category,
    });
    return response.data.data;
  }

  /**
   * Analyze ticket and get AI suggestions
   */
  async analyzeTicket(
    title: string,
    description: string,
    category?: string
  ): Promise<AnalyzeTicketResponse> {
    const response = await apiClient.post("/ai/analyze-ticket", {
      title,
      description,
      category,
    });
    return response.data.data;
  }

  /**
   * Chat with AI assistant
   */
  async chat(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    const response = await apiClient.post("/ai/chat", {
      message,
      conversationHistory,
    });
    return response.data.data.response;
  }

  /**
   * Analyze free text to suggest ticket fields
   */
  async analyzeTicketText(text: string): Promise<{
    suggestedTitle: string;
    description: string;
    category: string;
    priority: string;
    language: string;
  }> {
    // Utiliser l'endpoint /ai/analyze-ticket qui fonctionne déjà
    // On extrait un titre du texte (premiers 100 caractères)
    const title = text.substring(0, 100).trim();
    
    const response = await apiClient.post("/ai/analyze-ticket", {
      title,
      description: text,
    });
    
    const data = response.data.data;
    
    // Adapter le format de réponse
    return {
      suggestedTitle: title,
      description: text,
      category: data.suggestedCategory || 'General',
      priority: data.suggestedPriority || 'MEDIUM',
      language: 'fr',
    };
  }
}

export const aiService = new AIService();
