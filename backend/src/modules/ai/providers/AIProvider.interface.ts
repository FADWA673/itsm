/**
 * Interface abstraite pour les providers IA
 * Permet de changer facilement de provider (OpenAI, Ollama, Azure, etc.)
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TicketClassification {
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  subject: string;
  description: string;
  suggestedTechnician?: string;
  confidence: number; // 0 à 1
}

export interface LanguageDetection {
  language: 'fr' | 'en' | 'ar' | 'darija';
  confidence: number;
}

export interface KBSearchResult {
  articleId: string;
  title: string;
  relevanceScore: number;
  excerpt: string;
}

/**
 * Interface que tous les providers IA doivent implémenter
 */
export interface IAIProvider {
  /**
   * Nom du provider (OpenAI, Ollama, etc.)
   */
  name: string;

  /**
   * Détecte la langue d'un texte
   */
  detectLanguage(text: string): Promise<LanguageDetection>;

  /**
   * Classifie un message libre en ticket structuré
   */
  classifyTicket(message: string, language?: string): Promise<TicketClassification>;

  /**
   * Suggère un technicien basé sur le ticket et les techniciens disponibles
   */
  suggestTechnician(
    ticketDescription: string,
    category: string,
    technicians: Array<{ id: string; name: string; expertise?: string }>
  ): Promise<{ technicianId: string; reason: string; confidence: number }>;

  /**
   * Recherche intelligente dans la base de connaissances
   */
  searchKnowledgeBase(
    query: string,
    articles: Array<{ id: string; title: string; content: string; category: string }>
  ): Promise<KBSearchResult[]>;

  /**
   * Assistant conversationnel - répond aux questions
   */
  chat(messages: AIMessage[]): Promise<string>;

  /**
   * Génère un rapport à partir de données
   */
  generateReport(data: any, reportType: string): Promise<string>;
}
