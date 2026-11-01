/**
 * AI Provider Factory
 * Crée le bon provider selon la configuration (.env)
 */

import config from '../../config';
import type { AIProvider } from './AIProvider.interface';
import { GroqAIProvider } from './GroqAIProvider';
import { MockAIProvider } from './MockAIProvider';

let providerInstance: AIProvider | null = null;

/**
 * Récupère l'instance du provider IA configuré
 * Singleton pattern pour éviter de recréer à chaque appel
 */
export function getAIProvider(): AIProvider {
  if (providerInstance) {
    return providerInstance;
  }

  const provider = process.env.AI_PROVIDER || 'groq';

  switch (provider.toLowerCase()) {
    case 'groq':
      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey || groqApiKey === 'your_groq_api_key_here') {
        console.warn('[AI] GROQ_API_KEY not configured, using Mock provider');
        providerInstance = new MockAIProvider();
        return providerInstance;
      }
      
      const groqModel = process.env.GROQ_MODEL || 'gemma2-9b-it';
      providerInstance = new GroqAIProvider(groqApiKey, groqModel);
      console.log(`[AI] Using Groq provider with model: ${groqModel}`);
      break;

    case 'openai':
      // TODO: Implémenter OpenAIProvider si besoin plus tard
      console.warn('[AI] OpenAI provider not yet implemented, using Mock');
      providerInstance = new MockAIProvider();
      break;

    case 'mock':
    default:
      console.log('[AI] Using Mock provider (for testing)');
      providerInstance = new MockAIProvider();
      break;
  }

  return providerInstance;
}

/**
 * Réinitialise le provider (utile pour les tests)
 */
export function resetAIProvider(): void {
  providerInstance = null;
}

/**
 * Test rapide de la connexion IA
 */
export async function testAIConnection(): Promise<{ success: boolean; provider: string; error?: string }> {
  try {
    const provider = getAIProvider();
    const isConnected = await provider.test();
    
    return {
      success: isConnected,
      provider: provider.name,
    };
  } catch (error: any) {
    return {
      success: false,
      provider: 'unknown',
      error: error.message,
    };
  }
}
