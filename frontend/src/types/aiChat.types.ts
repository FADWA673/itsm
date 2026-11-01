// ============================================================================
// AI Chat Types - ITSM Platform
// Types pour le chat IA intelligent
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    category?: string;
    priority?: string;
    confidence?: number;
  };
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: AIMessage[];
  context: AIContext;
  status: 'active' | 'resolved' | 'escalated';
  createdAt: Date;
  updatedAt: Date;
}

export interface AIContext {
  problemDescription?: string;
  category?: string;
  subcategory?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  impact?: string;
  location?: string;
  department?: string;
  equipment?: string;
  language?: 'fr' | 'en' | 'ar' | 'darija';
  questionsAsked: string[];
  answersReceived: string[];
  solutionsAttempted: AISolutionAttempt[];
  knowledgeBaseArticlesShown: string[];
}

export interface AIAnalysis {
  intent: string;
  category: string;
  subcategory?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  confidence: number;
  suggestedQuestions?: string[];
  relatedKBArticles?: string[];
  learningSuggestions?: string[]; // NOUVEAU: Suggestions basées sur l'apprentissage
}

export interface AISolution {
  id: string;
  title: string;
  steps: AISolutionStep[];
  category: string;
  priority: number;
  estimatedTime?: string;
  successRate?: number;
  source: 'kb' | 'ai' | 'technician';
  sourceId?: string;
}

export interface AISolutionStep {
  id: string;
  order: number;
  instruction: string;
  type: 'action' | 'check' | 'question';
  expectedResult?: string;
  troubleshooting?: string;
}

export interface AISolutionAttempt {
  solutionId: string;
  solutionTitle: string;
  attemptedAt: Date;
  result: 'success' | 'failed' | 'partial' | 'skipped';
  userFeedback?: string;
  notes?: string;
}

export interface AIEscalation {
  conversationId: string;
  reason: string;
  summary: string;
  recommendedCategory: string;
  recommendedPriority: string;
  suggestedTechnician?: string;
  ticketDraft: AITicketDraft;
}

export interface AITicketDraft {
  subject: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  impact: string;
  conversationSummary: string;
  solutionsAttempted: string[];
  diagnosis: string;
  metadata: {
    conversationId: string;
    language: string;
    totalMessages: number;
    solutionsCount: number;
  };
}

export interface AIFeedback {
  conversationId: string;
  messageId: string;
  type: 'helpful' | 'not_helpful' | 'resolved' | 'not_resolved';
  rating?: number;
  comment?: string;
  timestamp: Date;
}

export interface AIQuickAction {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface AITypingIndicator {
  isTyping: boolean;
  message?: string;
}
