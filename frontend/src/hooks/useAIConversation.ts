// ============================================================================
// useAIConversation Hook
// Gestion de l'état de la conversation avec l'assistant IA
// ============================================================================

import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  AIMessage,
  AIConversation,
  AIContext,
  AISolutionAttempt,
  AIAnalysis,
} from '../types/aiChat.types';
import { aiAssistantService } from '../services/aiAssistant.service';
import { useAuthStore } from '../store';

export const useAIConversation = () => {
  const { user } = useAuthStore();
  const [conversation, setConversation] = useState<AIConversation>(() => ({
    id: uuidv4(),
    userId: user?.id || 'anonymous',
    messages: [],
    context: {
      questionsAsked: [],
      answersReceived: [],
      solutionsAttempted: [],
      knowledgeBaseArticlesShown: [],
    },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const [isTyping, setIsTyping] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);

  /**
   * Ajouter un message à la conversation
   */
  const addMessage = useCallback((message: Omit<AIMessage, 'id' | 'timestamp'>) => {
    const newMessage: AIMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      updatedAt: new Date(),
    }));

    return newMessage;
  }, []);

  /**
   * Mettre à jour le contexte
   */
  const updateContext = useCallback((updates: Partial<AIContext>) => {
    setConversation((prev) => ({
      ...prev,
      context: {
        ...prev.context,
        ...updates,
      },
      updatedAt: new Date(),
    }));
  }, []);

  /**
   * Ajouter une solution essayée
   */
  const addSolutionAttempt = useCallback((attempt: AISolutionAttempt) => {
    setConversation((prev) => ({
      ...prev,
      context: {
        ...prev.context,
        solutionsAttempted: [...prev.context.solutionsAttempted, attempt],
      },
      updatedAt: new Date(),
    }));
  }, []);

  /**
   * Envoyer un message utilisateur et obtenir une réponse IA
   */
  const sendMessage = useCallback(
    async (content: string) => {
      // Ajouter le message utilisateur
      addMessage({
        role: 'user',
        content,
      });

      // Simuler la réflexion de l'IA
      setIsTyping(true);

      try {
        // Analyser le message
        const analysis = await aiAssistantService.analyzeMessage(
          content,
          conversation.context
        );
        setCurrentAnalysis(analysis);

        // Mettre à jour le contexte si nécessaire
        if (!conversation.context.problemDescription) {
          updateContext({
            problemDescription: content,
            category: analysis.category,
            priority: analysis.priority,
            language: 'fr', // TODO: Détecter la langue
          });
        }

        // Générer la réponse
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simuler délai
        const response = await aiAssistantService.generateResponse(
          content,
          conversation.context,
          analysis
        );

        // Ajouter la réponse de l'IA
        addMessage({
          role: 'assistant',
          content: response,
          metadata: {
            intent: analysis.intent,
            category: analysis.category,
            priority: analysis.priority,
            confidence: analysis.confidence,
          },
        });

        return { analysis, response };
      } catch (error) {
        console.error('Error sending message:', error);
        addMessage({
          role: 'assistant',
          content:
            "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre question?",
        });
        return null;
      } finally {
        setIsTyping(false);
      }
    },
    [conversation.context, addMessage, updateContext]
  );

  /**
   * Réinitialiser la conversation
   */
  const resetConversation = useCallback(() => {
    setConversation({
      id: uuidv4(),
      userId: user?.id || 'anonymous',
      messages: [],
      context: {
        questionsAsked: [],
        answersReceived: [],
        solutionsAttempted: [],
        knowledgeBaseArticlesShown: [],
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setCurrentAnalysis(null);
  }, [user]);

  /**
   * Marquer la conversation comme résolue
   */
  const markAsResolved = useCallback(() => {
    setConversation((prev) => ({
      ...prev,
      status: 'resolved',
      updatedAt: new Date(),
    }));
  }, []);

  /**
   * Marquer la conversation comme escaladée
   */
  const markAsEscalated = useCallback(() => {
    setConversation((prev) => ({
      ...prev,
      status: 'escalated',
      updatedAt: new Date(),
    }));
  }, []);

  return {
    conversation,
    isTyping,
    currentAnalysis,
    sendMessage,
    addMessage,
    updateContext,
    addSolutionAttempt,
    resetConversation,
    markAsResolved,
    markAsEscalated,
    setConversation, // NOUVEAU - pour charger conversation historique
  };
};
