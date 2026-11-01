/**
 * Groq AI Provider
 * Implémentation avec Groq (gratuit et rapide!)
 * https://groq.com/
 */

import Groq from 'groq-sdk';
import type {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  TicketAnalysisResult,
  TechnicianSuggestion,
} from './AIProvider.interface';

export class GroqAIProvider implements AIProvider {
  public name = 'Groq';
  private client: Groq;
  private model: string;

  constructor(apiKey: string, model: string = 'gemma2-9b-it') {
    this.client = new Groq({ apiKey });
    this.model = model;
  }

  /**
   * Test la connexion à Groq
   */
  async test(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });
      return !!response.choices[0]?.message?.content;
    } catch (error) {
      console.error('[GroqAI] Test failed:', error);
      return false;
    }
  }

  /**
   * Génère une completion de chat
   */
  async createChatCompletion(options: AICompletionOptions): Promise<AICompletionResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || this.model,
        messages: options.messages as any,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1500,
      });

      return {
        content: response.choices[0]?.message?.content || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
      };
    } catch (error) {
      console.error('[GroqAI] Chat completion failed:', error);
      throw new Error('Failed to generate AI completion');
    }
  }

  /**
   * Analyse un texte libre pour créer un ticket
   */
  async analyzeTicketText(
    text: string,
    userContext?: { location?: string; department?: string; language?: string }
  ): Promise<TicketAnalysisResult> {
    const prompt = `Tu es un assistant IA pour un système ITSM.
Analyse le texte suivant et extrais les informations pour créer un ticket de support IT.

TEXTE: "${text}"

${userContext?.location ? `LOCALISATION: ${userContext.location}` : ''}
${userContext?.department ? `DÉPARTEMENT: ${userContext.department}` : ''}

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas d'explication):
{
  "category": "Hardware|Software|Network|Access & Security|Telephony|Printer|Email|Other",
  "priority": "CRITICAL|HIGH|MEDIUM|LOW",
  "description": "Description claire et structurée du problème",
  "detectedLanguage": "fr|en|ar|darija",
  "suggestedTitle": "Titre court du ticket",
  "confidence": 0.0-1.0
}

Règles de priorité:
- CRITICAL: Système complet down, production bloquée, sécurité compromise
- HIGH: Fonctionnalité majeure non disponible, plusieurs utilisateurs impactés
- MEDIUM: Problème gênant mais workaround possible
- LOW: Demande d'amélioration, problème mineur

Détection langue:
- "darija": arabe dialectal marocain (ma khdamch, ma kaytch3ach, etc.)
- "ar": arabe standard
- "fr": français
- "en": anglais`;

    try {
      const response = await this.createChatCompletion({
        messages: [
          { role: 'system', content: 'Tu es un expert en analyse de tickets IT. Tu réponds UNIQUEMENT en JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3, // Plus bas = plus déterministe
        maxTokens: 500,
      });

      // Extraire JSON de la réponse
      const content = response.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const result = JSON.parse(jsonMatch[0]);

      // Validation
      if (!result.category || !result.priority || !result.description) {
        throw new Error('Invalid AI response structure');
      }

      return result as TicketAnalysisResult;
    } catch (error) {
      console.error('[GroqAI] Ticket analysis failed:', error);
      
      // Fallback: analyse basique
      return {
        category: 'Other',
        priority: 'MEDIUM',
        description: text,
        detectedLanguage: this.detectLanguageSimple(text),
        suggestedTitle: text.substring(0, 50),
        confidence: 0.3,
      };
    }
  }

  /**
   * Suggère un technicien pour un ticket
   */
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

    const prompt = `Tu es un assistant IA pour assigner des tickets IT.

TICKET:
Catégorie: ${ticketInfo.category}
Priorité: ${ticketInfo.priority}
Description: ${ticketInfo.description}

TECHNICIENS DISPONIBLES:
${availableTechnicians.map((t, i) => `${i + 1}. ${t.name} - Expertise: ${t.expertise.join(', ')} - Charge actuelle: ${t.currentLoad} tickets`).join('\n')}

Choisis le meilleur technicien en fonction de:
1. Son expertise (prioritaire)
2. Sa charge de travail actuelle
3. La priorité du ticket

Réponds UNIQUEMENT avec un objet JSON valide:
{
  "technicianId": "id_du_technicien",
  "technicianName": "nom",
  "confidence": 0.0-1.0,
  "reason": "Courte explication"
}`;

    try {
      const response = await this.createChatCompletion({
        messages: [
          { role: 'system', content: 'Tu es un expert en assignation de tickets IT. Tu réponds UNIQUEMENT en JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        maxTokens: 200,
      });

      const content = response.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const result = JSON.parse(jsonMatch[0]);
      return result as TechnicianSuggestion;
    } catch (error) {
      console.error('[GroqAI] Technician suggestion failed:', error);
      return null;
    }
  }

  /**
   * Recherche intelligente dans la base de connaissances
   */
  async searchKnowledgeBase(
    query: string,
    articles: Array<{ id: string; title: string; content: string; category: string }>
  ): Promise<Array<{ articleId: string; relevanceScore: number; reason: string }>> {
    if (articles.length === 0) {
      return [];
    }

    const prompt = `Tu es un assistant IA pour rechercher dans une base de connaissances IT.

REQUÊTE: "${query}"

ARTICLES DISPONIBLES:
${articles.slice(0, 10).map((a, i) => `${i + 1}. [${a.category}] ${a.title}\n${a.content.substring(0, 200)}...`).join('\n\n')}

Identifie les articles pertinents et note-les de 0.0 à 1.0.

Réponds UNIQUEMENT avec un array JSON valide:
[
  {
    "articleId": "id_article",
    "relevanceScore": 0.0-1.0,
    "reason": "Courte explication"
  }
]

Retourne seulement les articles avec score > 0.5, maximum 3 résultats.`;

    try {
      const response = await this.createChatCompletion({
        messages: [
          { role: 'system', content: 'Tu es un expert en recherche documentaire IT. Tu réponds UNIQUEMENT en JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        maxTokens: 500,
      });

      const content = response.content.trim();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return [];
      }

      const results = JSON.parse(jsonMatch[0]);
      return results.filter((r: any) => r.relevanceScore > 0.5).slice(0, 3);
    } catch (error) {
      console.error('[GroqAI] KB search failed:', error);
      return [];
    }
  }

  /**
   * Assistant conversationnel
   */
  async chat(messages: AIMessage[]): Promise<string> {
    try {
      const response = await this.createChatCompletion({
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant IA pour un système ITSM (gestion de support IT).
Tu aides les employés avec leurs problèmes informatiques.
Réponds de façon claire, concise et professionnelle.
Si tu ne connais pas la réponse, dis-le honnêtement et suggère de créer un ticket.`,
          },
          ...messages,
        ],
        temperature: 0.7,
        maxTokens: 500,
      });

      return response.content;
    } catch (error) {
      console.error('[GroqAI] Chat failed:', error);
      return "Désolé, je rencontre une difficulté technique. Veuillez créer un ticket pour obtenir de l'aide.";
    }
  }

  /**
   * Détection simple de langue (fallback)
   */
  private detectLanguageSimple(text: string): 'fr' | 'en' | 'ar' | 'darija' | 'unknown' {
    const lowerText = text.toLowerCase();

    // Darija (dialecte marocain)
    if (/ma\s+(khdamch|kaytch3ach|kaybanch|kaymchich)|walo|bezaf|daba|ghir/.test(lowerText)) {
      return 'darija';
    }

    // Arabe (caractères arabes)
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'ar';
    }

    // Français
    if (/(le|la|les|un|une|des|je|tu|il|elle|nous|vous|ils|elles|ne|pas|plus|sur|avec|dans|mon|ma|mes)/.test(lowerText)) {
      return 'fr';
    }

    // Anglais
    if (/(the|a|an|is|are|was|were|have|has|do|does|my|your|his|her|our|their|not|can|cannot|will|would)/.test(lowerText)) {
      return 'en';
    }

    return 'unknown';
  }
}
