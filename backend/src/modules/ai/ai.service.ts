import OpenAI from "openai";
import { prisma } from "../../config/database";
import config from "../../config";

// ============================================================================
// Types
// ============================================================================

export interface SuggestSolutionsRequest {
  problem: string;
  category?: string;
}

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

export interface AnalyzeTicketRequest {
  title: string;
  description: string;
  category?: string;
}

export interface AnalyzeTicketResponse {
  suggestedPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  suggestedCategory: string;
  enrichedDescription: string;
  keywords: string[];
  estimatedResolutionTime: string;
}

// ============================================================================
// AI Service (supports both OpenAI and Groq)
// ============================================================================

export class AIService {
  private client: OpenAI | null = null;
  private model: string;
  private useMock: boolean = false;

  constructor() {
    const provider = process.env.AI_PROVIDER || "groq";
    
    if (provider === "mock") {
      // Use Mock provider (for testing)
      this.useMock = true;
      this.model = "mock";
      console.log("✅ [AI] Using MOCK provider for testing");
    } else if (provider === "groq") {
      // Use Groq (FREE!)
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("GROQ_API_KEY is not configured. Get your free key at https://console.groq.com");
      }
      this.client = new OpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
      this.model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
    } else {
      // Use OpenAI (PAID)
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured");
      }
      this.client = new OpenAI({ apiKey });
      this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    }
  }

  /**
   * Suggest KB articles based on user's problem description
   */
  async suggestSolutions(
    data: SuggestSolutionsRequest,
    organizationId: string
  ): Promise<SuggestSolutionsResponse> {
    // 1. Get published KB articles
    const articles = await prisma.kBArticle.findMany({
      where: {
        organizationId,
        status: "PUBLISHED",
      },
      include: {
        category: true,
      },
      take: 20, // Limit for performance
    });

    if (articles.length === 0) {
      return {
        suggestions: [],
        aiAnalysis: "No knowledge base articles available yet. I recommend creating a ticket for assistance.",
        canResolveWithoutTicket: false,
      };
    }

    // 2. Build context for AI
    const kbContext = articles
      .map(
        (a) =>
          `[ID: ${a.id}] Title: ${a.title}\nCategory: ${a.category.name}\nExcerpt: ${a.excerpt}\nTags: ${a.tags}`
      )
      .join("\n\n");

    // 3. Ask AI to find relevant articles
    const prompt = `You are an IT support assistant. A user has the following problem:

"${data.problem}"

Here are the available knowledge base articles:

${kbContext}

Your task:
1. Identify the 3 most relevant articles that could help solve this problem
2. Rate their relevance (0-100)
3. Provide a brief analysis explaining why these articles are relevant
4. Determine if the problem can likely be resolved without creating a ticket

Respond ONLY with valid JSON in this exact format:
{
  "articleIds": ["id1", "id2", "id3"],
  "relevanceScores": [95, 80, 65],
  "analysis": "Brief explanation of why these articles are relevant",
  "canResolveWithoutTicket": true
}`;

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // Lower for more consistent results
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    // 4. Build suggestions
    const suggestions: KBSuggestion[] = [];
    for (let i = 0; i < aiResponse.articleIds?.length || 0; i++) {
      const articleId = aiResponse.articleIds[i];
      const article = articles.find((a) => a.id === articleId);
      if (article) {
        suggestions.push({
          articleId: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || "",
          relevanceScore: aiResponse.relevanceScores?.[i] || 50,
          categoryName: article.category.name,
        });
      }
    }

    return {
      suggestions,
      aiAnalysis: aiResponse.analysis || "I found some articles that might help.",
      canResolveWithoutTicket: aiResponse.canResolveWithoutTicket || false,
    };
  }

  /**
   * Analyze ticket and suggest priority, category, enrichment
   */
  async analyzeTicket(
    data: AnalyzeTicketRequest
  ): Promise<AnalyzeTicketResponse> {
    // Mock response for testing
    if (this.useMock) {
      return {
        suggestedPriority: "HIGH",
        suggestedCategory: "Hardware",
        enrichedDescription: data.description,
        keywords: ["computer", "startup", "hardware"],
        estimatedResolutionTime: "2-4 hours",
      };
    }

    const prompt = `You are an IT support ticket analyzer. Analyze this ticket:

Title: ${data.title}
Description: ${data.description}
${data.category ? `Suggested Category: ${data.category}` : ""}

Your task:
1. Suggest priority (LOW, MEDIUM, HIGH, URGENT) based on urgency and business impact
2. Suggest the most appropriate category
3. Enrich the description with technical details if needed
4. Extract keywords for better searchability
5. Estimate resolution time

Respond ONLY with valid JSON in this exact format:
{
  "suggestedPriority": "MEDIUM",
  "suggestedCategory": "Network",
  "enrichedDescription": "Enhanced description with technical context",
  "keywords": ["keyword1", "keyword2"],
  "estimatedResolutionTime": "2-4 hours"
}`;

    const completion = await this.client!.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    return {
      suggestedPriority: aiResponse.suggestedPriority || "MEDIUM",
      suggestedCategory: aiResponse.suggestedCategory || data.category || "General",
      enrichedDescription: aiResponse.enrichedDescription || data.description,
      keywords: aiResponse.keywords || [],
      estimatedResolutionTime: aiResponse.estimatedResolutionTime || "Unknown",
    };
  }

  /**
   * Chat with AI for interactive problem solving
   */
  async chat(message: string, conversationHistory: Array<{ role: string; content: string }> = []): Promise<string> {
    // Mock response for testing
    if (this.useMock) {
      const responses = [
        "Je comprends votre problème. Essayez de redémarrer votre ordinateur et vérifiez les connexions.",
        "Pour résoudre ce problème, je vous recommande de vérifier les paramètres réseau.",
        "Avez-vous essayé de mettre à jour vos pilotes? C'est souvent la solution.",
        "Si le problème persiste, je vous conseille de créer un ticket pour qu'un technicien puisse vous aider.",
      ];
      // Retourner une réponse aléatoire
      return responses[Math.floor(Math.random() * responses.length)];
    }

    const messages: any[] = [
      {
        role: "system",
        content: `You are a helpful IT support assistant. Help users troubleshoot their technical problems. 
Be concise, friendly, and provide step-by-step solutions when possible. 
If you can't solve the problem, recommend creating a support ticket.`,
      },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    const completion = await this.client!.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0].message.content || "I'm sorry, I couldn't process that.";
  }
}

export const aiService = new AIService();
