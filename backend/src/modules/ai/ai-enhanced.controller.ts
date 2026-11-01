/**
 * AI Enhanced Controller
 * Endpoints pour les fonctionnalités IA avancées
 */

import type { Request, Response } from 'express';
import { getAIProvider, testAIConnection } from '../../services/ai/AIProviderFactory';
import { ApiError } from '../../utils/ApiError';
import { prisma } from '../../config/database';

/**
 * GET /api/v1/ai/test
 * Test la connexion au provider IA
 */
export async function testAI(req: Request, res: Response) {
  try {
    const result = await testAIConnection();

    res.json({
      success: result.success,
      provider: result.provider,
      message: result.success
        ? `✅ ${result.provider} provider is connected and working`
        : `❌ ${result.provider} provider connection failed`,
      error: result.error,
    });
  } catch (error: any) {
    console.error('[AI] Test error:', error);
    res.status(500).json({
      success: false,
      message: 'AI test failed',
      error: error.message,
    });
  }
}

/**
 * POST /api/v1/ai/analyze-ticket-text
 * Analyse un texte libre pour créer un ticket
 * Body: { text: string, location?: string, department?: string }
 */
export async function analyzeTicketText(req: Request, res: Response) {
  try {
    const { text, location, department } = req.body;

    if (!text || text.trim().length === 0) {
      throw new ApiError(400, 'Text is required');
    }

    if (text.length > 5000) {
      throw new ApiError(400, 'Text is too long (max 5000 characters)');
    }

    const provider = getAIProvider();
    const analysis = await provider.analyzeTicketText(text, { location, department });

    res.json({
      success: true,
      data: analysis,
      provider: provider.name,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('[AI] Analyze ticket text error:', error);
      res.status(500).json({ error: 'Failed to analyze ticket text' });
    }
  }
}

/**
 * POST /api/v1/ai/suggest-technician
 * Suggère un technicien pour un ticket
 * Body: { category: string, priority: string, description: string }
 */
export async function suggestTechnician(req: Request, res: Response) {
  try {
    const { category, priority, description } = req.body;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new ApiError(401, 'Organization ID not found');
    }

    if (!category || !priority || !description) {
      throw new ApiError(400, 'Category, priority, and description are required');
    }

    // Récupérer les techniciens disponibles
    const technicians = await prisma.user.findMany({
      where: {
        organizationId,
        role: 'TECHNICIAN',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        _count: {
          select: {
            assignedTickets: {
              where: {
                status: {
                  notIn: ['RESOLVED', 'CLOSED'],
                },
              },
            },
          },
        },
      },
    });

    const availableTechnicians = technicians.map((tech) => ({
      id: tech.id,
      name: `${tech.firstName} ${tech.lastName}`,
      expertise: [category], // TODO: Ajouter expertise au modèle User
      currentLoad: tech._count.assignedTickets,
    }));

    const provider = getAIProvider();
    const suggestion = await provider.suggestTechnician(
      { category, priority, description },
      availableTechnicians
    );

    res.json({
      success: true,
      data: suggestion,
      provider: provider.name,
      availableTechnicians: availableTechnicians.length,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('[AI] Suggest technician error:', error);
      res.status(500).json({ error: 'Failed to suggest technician' });
    }
  }
}

/**
 * POST /api/v1/ai/search-kb
 * Recherche intelligente dans la base de connaissances
 * Body: { query: string }
 */
export async function searchKB(req: Request, res: Response) {
  try {
    const { query } = req.body;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new ApiError(401, 'Organization ID not found');
    }

    if (!query || query.trim().length === 0) {
      throw new ApiError(400, 'Query is required');
    }

    // Récupérer les articles publiés
    const articles = await prisma.kBArticle.findMany({
      where: {
        organizationId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
      },
      take: 20, // Limiter pour ne pas surcharger l'IA
    });

    const provider = getAIProvider();
    const results = await provider.searchKnowledgeBase(query, articles);

    // Récupérer les articles complets pour les résultats
    const articleDetails = await prisma.kBArticle.findMany({
      where: {
        id: {
          in: results.map((r) => r.articleId),
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        views: true,
        createdAt: true,
      },
    });

    // Combiner les résultats avec les détails
    const enrichedResults = results.map((r) => ({
      ...r,
      article: articleDetails.find((a) => a.id === r.articleId),
    }));

    res.json({
      success: true,
      data: enrichedResults,
      provider: provider.name,
      totalArticles: articles.length,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('[AI] Search KB error:', error);
      res.status(500).json({ error: 'Failed to search knowledge base' });
    }
  }
}

/**
 * POST /api/v1/ai/chat
 * Assistant conversationnel IA
 * Body: { messages: Array<{role, content}> }
 */
export async function chat(req: Request, res: Response) {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new ApiError(400, 'Messages array is required');
    }

    // Validation des messages
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        throw new ApiError(400, 'Each message must have role and content');
      }
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        throw new ApiError(400, 'Invalid message role');
      }
    }

    const provider = getAIProvider();
    const response = await provider.chat(messages);

    res.json({
      success: true,
      data: {
        role: 'assistant',
        content: response,
      },
      provider: provider.name,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('[AI] Chat error:', error);
      res.status(500).json({ error: 'Failed to generate chat response' });
    }
  }
}
