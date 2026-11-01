/**
 * AI Provider Interface
 * Interface abstraite pour permettre le changement de fournisseur IA
 * (OpenAI, Groq, Ollama, Azure OpenAI, etc.)
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  messages: AIMessage[];
}

export interface AICompletionResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

export interface TicketAnalysisResult {
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  detectedLanguage: 'fr' | 'en' | 'ar' | 'darija' | 'unknown';
  suggestedTitle?: string;
  confidence: number;
}

export interface TechnicianSuggestion {
  technicianId: string;
  technicianName: string;
  confidence: number;
  reason: string;
}

/**
 * Interface principale pour tous les providers IA
 */
export interface AIProvider {
  /**
   * Nom du provider (OpenAI, Groq, Ollama, etc.)
   */
  name: string;

  /**
   * Vérifie si le provider est correctement configuré et accessible
   */
  test(): Promise<boolean>;

  /**
   * Génère une completion de chat
   */
  createChatCompletion(options: AICompletionOptions): Promise<AICompletionResponse>;

  /**
   * Analyse un texte libre pour extraire les informations d'un ticket
   */
  analyzeTicketText(text: string, userContext?: {
    location?: string;
    department?: string;
    language?: string;
  }): Promise<TicketAnalysisResult>;

  /**
   * Suggère un technicien pour un ticket
   */
  suggestTechnician(ticketInfo: {
    category: string;
    priority: string;
    description: string;
  }, availableTechnicians: Array<{
    id: string;
    name: string;
    expertise: string[];
    currentLoad: number;
  }>): Promise<TechnicianSuggestion | null>;

  /**
   * Recherche intelligente dans la base de connaissances
   */
  searchKnowledgeBase(query: string, articles: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
  }>): Promise<Array<{
    articleId: string;
    relevanceScore: number;
    reason: string;
  }>>;

  /**
   * Assistant conversationnel
   */
  chat(messages: AIMessage[]): Promise<string>;
}
