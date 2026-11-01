/**
 * Mock AI Provider
 * Provider de test qui simule l'IA sans faire d'appels API
 * Utile pour développement et tests
 */

import type {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  TicketAnalysisResult,
  TechnicianSuggestion,
} from './AIProvider.interface';

export class MockAIProvider implements AIProvider {
  public name = 'Mock (Test)';

  async test(): Promise<boolean> {
    return true;
  }

  async createChatCompletion(options: AICompletionOptions): Promise<AICompletionResponse> {
    return {
      content: 'Ceci est une réponse de test du Mock AI Provider.',
      usage: {
        promptTokens: 10,
        completionTokens: 15,
        totalTokens: 25,
      },
      model: 'mock-model',
    };
  }

  async analyzeTicketText(
    text: string,
    userContext?: { location?: string; department?: string; language?: string }
  ): Promise<TicketAnalysisResult> {
    // Analyse basique pour tests
    const lowerText = text.toLowerCase();

    let category = 'Other';
    if (lowerText.includes('pc') || lowerText.includes('ordinateur') || lowerText.includes('computer')) {
      category = 'Hardware';
    } else if (lowerText.includes('wifi') || lowerText.includes('réseau') || lowerText.includes('network') || lowerText.includes('internet')) {
      category = 'Network';
    } else if (lowerText.includes('imprimante') || lowerText.includes('printer')) {
      category = 'Printer';
    } else if (lowerText.includes('logiciel') || lowerText.includes('software') || lowerText.includes('application')) {
      category = 'Software';
    } else if (lowerText.includes('email') || lowerText.includes('mail') || lowerText.includes('outlook')) {
      category = 'Email';
    }

    let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (lowerText.includes('urgent') || lowerText.includes('critique') || lowerText.includes('bloqué') || lowerText.includes('blocked')) {
      priority = 'CRITICAL';
    } else if (lowerText.includes('important') || lowerText.includes('rapidement') || lowerText.includes('quickly')) {
      priority = 'HIGH';
    } else if (lowerText.includes('quand possible') || lowerText.includes('when possible')) {
      priority = 'LOW';
    }

    let detectedLanguage: 'fr' | 'en' | 'ar' | 'darija' | 'unknown' = 'unknown';
    if (/ma\s+khdamch|kaybanch/.test(lowerText)) {
      detectedLanguage = 'darija';
    } else if (/[\u0600-\u06FF]/.test(text)) {
      detectedLanguage = 'ar';
    } else if (/(le|la|les|un|une|mon|ma|mes|ne|pas)/.test(lowerText)) {
      detectedLanguage = 'fr';
    } else if (/(the|a|an|my|not|cannot)/.test(lowerText)) {
      detectedLanguage = 'en';
    }

    return {
      category,
      priority,
      description: text,
      detectedLanguage,
      suggestedTitle: text.substring(0, 50),
      confidence: 0.7,
    };
  }

  async suggestTechnician(
    ticketInfo: { category: string; priority: string; description: string },
    availableTechnicians: Array<{
      id: string;
      name: string;
      expertise: string[];
      currentLoad: number;
    }>
  ): Promise<TechnicianSuggestion | null> {
    if (availableTechnicians.length === 0) {
      return null;
    }

    // Choisir le technicien avec le moins de charge
    const best = availableTechnicians.reduce((prev, curr) =>
      prev.currentLoad < curr.currentLoad ? prev : curr
    );

    return {
      technicianId: best.id,
      technicianName: best.name,
      confidence: 0.65,
      reason: `Moins de charge actuelle (${best.currentLoad} tickets)`,
    };
  }

  async searchKnowledgeBase(
    query: string,
    articles: Array<{ id: string; title: string; content: string; category: string }>
  ): Promise<Array<{ articleId: string; relevanceScore: number; reason: string }>> {
    // Recherche simple par mots-clés
    const queryWords = query.toLowerCase().split(/\s+/);

    const results = articles
      .map((article) => {
        const titleLower = article.title.toLowerCase();
        const contentLower = article.content.toLowerCase();

        let score = 0;
        queryWords.forEach((word) => {
          if (titleLower.includes(word)) score += 0.3;
          if (contentLower.includes(word)) score += 0.1;
        });

        return {
          articleId: article.id,
          relevanceScore: Math.min(score, 1.0),
          reason: `Mots-clés trouvés dans le titre/contenu`,
        };
      })
      .filter((r) => r.relevanceScore > 0.5)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);

    return results;
  }

  async chat(messages: AIMessage[]): Promise<string> {
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || '';

    // Réponses de test selon les mots-clés
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('vpn')) {
      return "Pour vous connecter au VPN, utilisez le client Cisco AnyConnect avec vos identifiants habituels. Si le problème persiste, créez un ticket.";
    }

    if (lowerMessage.includes('wifi') || lowerMessage.includes('réseau')) {
      return "Pour les problèmes WiFi, vérifiez d'abord que vous êtes connecté au bon réseau. Si le problème persiste, redémarrez votre ordinateur et réessayez.";
    }

    if (lowerMessage.includes('imprimante') || lowerMessage.includes('printer')) {
      return "Pour les problèmes d'imprimante, vérifiez d'abord qu'elle est allumée et connectée au réseau. Essayez de l'enlever et la rajouter dans Windows.";
    }

    return "Je suis un assistant de test (Mock AI). Pour obtenir une vraie assistance, configurez GROQ_API_KEY dans votre fichier .env ou créez un ticket.";
  }
}
