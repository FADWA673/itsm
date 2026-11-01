// ============================================================================
// AI Assistant Service - MOCK Implementation with LEARNING
// Service simulant un assistant IT intelligent qui APPREND
// ============================================================================

import type {
  AIMessage,
  AIAnalysis,
  AISolution,
  AIEscalation,
  AITicketDraft,
  AIContext,
} from '../types/aiChat.types';
import { aiService } from './ai.service';

// ============================================================================
// Learning & Memory System
// ============================================================================

interface LearningData {
  problemKeywords: Record<string, number>; // Fréquence des mots-clés
  successfulSolutions: Record<string, number>; // Taux de succès par solution
  commonProblems: Array<{ problem: string; count: number; solution: string }>; // Problèmes fréquents
  userPatterns: Record<string, string[]>; // Patterns de problèmes par utilisateur
  conversationHistory: Array<{
    problem: string;
    category: string;
    solution: string;
    success: boolean;
    timestamp: Date;
  }>;
}

// Système de mémoire persistant (localStorage)
class AIMemorySystem {
  private storageKey = 'itsm-ai-learning-data';
  private learningData: LearningData;

  constructor() {
    this.learningData = this.loadLearningData();
  }

  private loadLearningData(): LearningData {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Convertir les timestamps en objets Date
        if (data.conversationHistory) {
          data.conversationHistory = data.conversationHistory.map((h: any) => ({
            ...h,
            timestamp: new Date(h.timestamp),
          }));
        }
        return data;
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
    }

    return {
      problemKeywords: {},
      successfulSolutions: {},
      commonProblems: [],
      userPatterns: {},
      conversationHistory: [],
    };
  }

  private saveLearningData(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.learningData));
    } catch (error) {
      console.error('Error saving learning data:', error);
    }
  }

  /**
   * Apprendre d'une nouvelle conversation
   */
  learn(problem: string, category: string, solution: string, success: boolean): void {
    // Extraire et mémoriser les mots-clés
    const keywords = this.extractKeywords(problem);
    keywords.forEach((keyword) => {
      this.learningData.problemKeywords[keyword] =
        (this.learningData.problemKeywords[keyword] || 0) + 1;
    });

    // Mettre à jour le taux de succès de la solution
    const solutionKey = solution;
    if (success) {
      this.learningData.successfulSolutions[solutionKey] =
        (this.learningData.successfulSolutions[solutionKey] || 0) + 1;
    }

    // Ajouter aux problèmes fréquents
    const existingProblem = this.learningData.commonProblems.find(
      (p) => p.problem.toLowerCase() === problem.toLowerCase()
    );
    if (existingProblem) {
      existingProblem.count++;
      if (success) {
        existingProblem.solution = solution;
      }
    } else {
      this.learningData.commonProblems.push({
        problem,
        count: 1,
        solution,
      });
    }

    // Trier par fréquence
    this.learningData.commonProblems.sort((a, b) => b.count - a.count);

    // Garder seulement les 20 plus fréquents
    this.learningData.commonProblems = this.learningData.commonProblems.slice(0, 20);

    // Ajouter à l'historique
    this.learningData.conversationHistory.push({
      problem,
      category,
      solution,
      success,
      timestamp: new Date(),
    });

    // Garder seulement les 100 dernières conversations
    if (this.learningData.conversationHistory.length > 100) {
      this.learningData.conversationHistory = this.learningData.conversationHistory.slice(-100);
    }

    this.saveLearningData();
  }

  /**
   * Obtenir des suggestions basées sur l'apprentissage
   */
  getSuggestions(problem: string): string[] {
    const keywords = this.extractKeywords(problem);
    const suggestions: string[] = [];

    // Chercher dans les problèmes fréquents
    this.learningData.commonProblems.forEach((commonProblem) => {
      const commonKeywords = this.extractKeywords(commonProblem.problem);
      const matchCount = keywords.filter((k) => commonKeywords.includes(k)).length;

      if (matchCount >= 2 && commonProblem.count >= 2) {
        suggestions.push(
          `💡 ${commonProblem.count} autres utilisateurs ont eu ce problème. La solution "${commonProblem.solution}" a bien fonctionné.`
        );
      }
    });

    // Statistiques d'apprentissage
    const totalConversations = this.learningData.conversationHistory.length;
    if (totalConversations >= 5) {
      const recentSuccess = this.learningData.conversationHistory
        .slice(-10)
        .filter((h) => h.success).length;
      suggestions.push(
        `📊 J'ai résolu ${recentSuccess}/10 des derniers problèmes avec succès. Je m'améliore constamment!`
      );
    }

    return suggestions;
  }

  /**
   * Obtenir la meilleure solution basée sur l'apprentissage
   */
  getBestSolution(category: string): string | null {
    const categorySolutions = this.learningData.conversationHistory
      .filter((h) => h.category === category && h.success)
      .map((h) => h.solution);

    if (categorySolutions.length === 0) return null;

    // Compter les occurrences
    const solutionCounts: Record<string, number> = {};
    categorySolutions.forEach((sol) => {
      solutionCounts[sol] = (solutionCounts[sol] || 0) + 1;
    });

    // Retourner la plus fréquente
    return Object.keys(solutionCounts).reduce((a, b) =>
      solutionCounts[a] > solutionCounts[b] ? a : b
    );
  }

  /**
   * Obtenir les statistiques d'apprentissage
   */
  getStats() {
    return {
      totalConversations: this.learningData.conversationHistory.length,
      totalProblems: this.learningData.commonProblems.length,
      successRate:
        this.learningData.conversationHistory.length > 0
          ? (
              (this.learningData.conversationHistory.filter((h) => h.success).length /
                this.learningData.conversationHistory.length) *
              100
            ).toFixed(1)
          : '0',
      mostCommonProblem: this.learningData.commonProblems[0]?.problem || 'Aucun',
    };
  }

  private extractKeywords(text: string): string[] {
    const lowerText = text.toLowerCase();
    // Mots vides à ignorer
    const stopWords = [
      'le',
      'la',
      'les',
      'un',
      'une',
      'des',
      'mon',
      'ma',
      'mes',
      'de',
      'du',
      'et',
      'ou',
      'ne',
      'pas',
      'est',
      'ce',
      'que',
      'qui',
    ];
    const words = lowerText
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.includes(w));
    return [...new Set(words)]; // Unique
  }

  /**
   * Réinitialiser l'apprentissage (pour tests)
   */
  reset(): void {
    localStorage.removeItem(this.storageKey);
    this.learningData = this.loadLearningData();
  }
}

// Instance globale du système d'apprentissage
const aiMemory = new AIMemorySystem();

// ============================================================================
// Mock Knowledge Base
// ============================================================================

const mockKnowledgeBase: Record<string, AISolution> = {
  wifi_issue: {
    id: 'wifi_issue',
    title: 'Problème de connexion Wi-Fi',
    category: 'Network',
    priority: 1,
    estimatedTime: '5-10 minutes',
    successRate: 85,
    source: 'kb',
    steps: [
      {
        id: 'step1',
        order: 1,
        instruction: 'Vérifiez que le Wi-Fi est activé sur votre ordinateur',
        type: 'check',
        expectedResult: 'L\'icône Wi-Fi doit apparaître dans la barre des tâches',
      },
      {
        id: 'step2',
        order: 2,
        instruction: 'Désactivez puis réactivez le Wi-Fi',
        type: 'action',
        expectedResult: 'La connexion devrait se rétablir',
      },
      {
        id: 'step3',
        order: 3,
        instruction: 'Redémarrez votre ordinateur',
        type: 'action',
        expectedResult: 'Le Wi-Fi devrait fonctionner après redémarrage',
      },
    ],
  },
  pc_not_starting: {
    id: 'pc_not_starting',
    title: 'Ordinateur ne démarre pas',
    category: 'Hardware',
    priority: 1,
    estimatedTime: '10-15 minutes',
    successRate: 70,
    source: 'kb',
    steps: [
      {
        id: 'step1',
        order: 1,
        instruction: 'Vérifiez que l\'ordinateur est bien branché à une prise électrique',
        type: 'check',
        expectedResult: 'Le câble d\'alimentation doit être correctement connecté',
      },
      {
        id: 'step2',
        order: 2,
        instruction: 'Appuyez longuement sur le bouton Power (10 secondes)',
        type: 'action',
        expectedResult: 'L\'ordinateur devrait redémarrer',
      },
      {
        id: 'step3',
        order: 3,
        instruction: 'Vérifiez les voyants lumineux de l\'ordinateur',
        type: 'check',
        expectedResult: 'Au moins un voyant devrait s\'allumer',
      },
    ],
  },
  vpn_connection: {
    id: 'vpn_connection',
    title: 'Connexion VPN impossible',
    category: 'Network',
    priority: 2,
    estimatedTime: '5-10 minutes',
    successRate: 80,
    source: 'kb',
    steps: [
      {
        id: 'step1',
        order: 1,
        instruction: 'Vérifiez que vous êtes connecté à Internet',
        type: 'check',
        expectedResult: 'Vous devez avoir une connexion Internet active',
      },
      {
        id: 'step2',
        order: 2,
        instruction: 'Vérifiez vos identifiants VPN',
        type: 'check',
        expectedResult: 'Nom d\'utilisateur et mot de passe corrects',
      },
      {
        id: 'step3',
        order: 3,
        instruction: 'Redémarrez le client VPN',
        type: 'action',
        expectedResult: 'Le VPN devrait se reconnecter',
      },
    ],
  },
  password_reset: {
    id: 'password_reset',
    title: 'Réinitialisation du mot de passe',
    category: 'Access',
    priority: 2,
    estimatedTime: '2-5 minutes',
    successRate: 95,
    source: 'kb',
    steps: [
      {
        id: 'step1',
        order: 1,
        instruction: 'Utilisez le lien "Mot de passe oublié" sur la page de connexion',
        type: 'action',
        expectedResult: 'Vous recevrez un email de réinitialisation',
      },
      {
        id: 'step2',
        order: 2,
        instruction: 'Cliquez sur le lien dans l\'email reçu',
        type: 'action',
        expectedResult: 'Une page de réinitialisation s\'ouvrira',
      },
      {
        id: 'step3',
        order: 3,
        instruction: 'Créez un nouveau mot de passe sécurisé',
        type: 'action',
        expectedResult: 'Votre mot de passe sera mis à jour',
      },
    ],
  },
  // NOUVELLES SOLUTIONS
  slow_computer: {
    id: 'slow_computer',
    title: 'Ordinateur lent',
    category: 'Hardware',
    priority: 3,
    estimatedTime: '10-15 minutes',
    successRate: 75,
    source: 'kb',
    steps: [
      {
        id: 'step1',
        order: 1,
        instruction: 'Fermez les applications non utilisées',
        type: 'action',
        expectedResult: 'La vitesse devrait s\'améliorer',
      },
      {
        id: 'step2',
        order: 2,
        instruction: 'Redémarrez votre ordinateur',
        type: 'action',
        expectedResult: 'Les performances devraient être meilleures',
      },
      {
        id: 'step3',
        order: 3,
        instruction: 'Vérifiez l\'espace disque disponible (min. 10 Go)',
        type: 'check',
        expectedResult: 'Si espace insuffisant, libérez de l\'espace',
      },
    ],
  },
  printer_not_working: {
    id: 'printer_not_working',
    title: 'Imprimante ne fonctionne pas',
    category: 'Hardware',
    priority: 3,
    estimatedTime: '5-10 minutes',
    successRate: 80,
    source: 'kb',
    steps: [
      {
        id: 'step1',
        order: 1,
        instruction: 'Vérifiez que l\'imprimante est allumée et connectée',
        type: 'check',
        expectedResult: 'Voyants verts allumés sur l\'imprimante',
      },
      {
        id: 'step2',
        order: 2,
        instruction: 'Vérifiez le câble USB ou la connexion Wi-Fi',
        type: 'check',
        expectedResult: 'Connexion stable',
      },
      {
        id: 'step3',
        order: 3,
        instruction: 'Redémarrez l\'imprimante et l\'ordinateur',
        type: 'action',
        expectedResult: 'L\'imprimante devrait être détectée',
      },
    ],
  },
  email_not_sending: {
    id: 'email_not_sending',
    title: 'Impossible d\'envoyer des emails',
    category: 'Software',
    priority: 2,
    estimatedTime: '5-10 minutes',
    successRate: 85,
    source: 'kb',
    steps: [
      {
        id: 'step1',
        order: 1,
        instruction: 'Vérifiez votre connexion Internet',
        type: 'check',
        expectedResult: 'Internet fonctionne',
      },
      {
        id: 'step2',
        order: 2,
        instruction: 'Vérifiez la taille des pièces jointes (max. 25 Mo)',
        type: 'check',
        expectedResult: 'Fichiers pas trop volumineux',
      },
      {
        id: 'step3',
        order: 3,
        instruction: 'Redémarrez votre client email (Outlook, etc.)',
        type: 'action',
        expectedResult: 'Les emails devraient s\'envoyer',
      },
    ],
  },
  software_crash: {
    id: 'software_crash',
    title: 'Application qui plante',
    category: 'Software',
    priority: 2,
    estimatedTime: '5-10 minutes',
    successRate: 70,
    source: 'kb',
    steps: [
      {
        id: 'step1',
        order: 1,
        instruction: 'Fermez complètement l\'application (Ctrl+Alt+Suppr)',
        type: 'action',
        expectedResult: 'Application fermée',
      },
      {
        id: 'step2',
        order: 2,
        instruction: 'Redémarrez l\'application',
        type: 'action',
        expectedResult: 'Application redémarre normalement',
      },
      {
        id: 'step3',
        order: 3,
        instruction: 'Si le problème persiste, redémarrez l\'ordinateur',
        type: 'action',
        expectedResult: 'Application stable après redémarrage',
      },
    ],
  },
};

// ============================================================================
// AI Assistant Service
// ============================================================================

class AIAssistantService {
  /**
   * Analyser un message utilisateur et déterminer l'intention
   * AVEC APPRENTISSAGE et DÉTECTION AVANCÉE
   */
  async analyzeMessage(message: string, context: AIContext): Promise<AIAnalysis> {
    const lowerMessage = message.toLowerCase();

    // Détection de l'intention
    let intent = 'unknown';
    let category = 'General';
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
    let confidence = 0.7;

    // NOUVEAU: Détection d'émotion et urgence
    const emotionKeywords = {
      frustration: ['encore', 'toujours', 'rien', 'jamais', 'impossible'],
      urgence: ['urgent', 'vite', 'immédiat', 'bloqué', 'critique', 'important'],
      calme: ['essayer', 'possible', 'aider', 'svp', 's\'il vous plaît'],
    };

    let detectedEmotion: string | undefined;
    
    if (emotionKeywords.frustration.some(k => lowerMessage.includes(k))) {
      detectedEmotion = 'frustration';
      priority = 'HIGH'; // Augmenter priorité si frustré
    }
    if (emotionKeywords.urgence.some(k => lowerMessage.includes(k))) {
      detectedEmotion = 'urgence';
      priority = 'URGENT';
    }

    // AMÉLIORATION: Vérifier si l'IA a déjà appris ce type de problème
    const learnedSolution = aiMemory.getBestSolution(category);
    if (learnedSolution) {
      confidence += 0.1;
    }

    // Wi-Fi / Network issues - AMÉLIORÉ avec plus de patterns
    if (
      lowerMessage.includes('wifi') ||
      lowerMessage.includes('wi-fi') ||
      lowerMessage.includes('réseau') ||
      lowerMessage.includes('internet') ||
      lowerMessage.includes('connexion') ||
      lowerMessage.includes('connect') ||
      lowerMessage.includes('en ligne') ||
      lowerMessage.includes('network')
    ) {
      intent = 'network_issue';
      category = 'Network';
      priority = detectedEmotion === 'urgence' ? 'URGENT' : 'MEDIUM';
      confidence = 0.9;
    }

    // Hardware issues - AMÉLIORÉ
    if (
      lowerMessage.includes('ordinateur') ||
      lowerMessage.includes('pc') ||
      lowerMessage.includes('laptop') ||
      lowerMessage.includes('démarre') ||
      lowerMessage.includes('allume') ||
      lowerMessage.includes('écran') ||
      lowerMessage.includes('noir') ||
      lowerMessage.includes('freeze') ||
      lowerMessage.includes('lent') ||
      lowerMessage.includes('boot')
    ) {
      intent = 'hardware_issue';
      category = 'Hardware';
      priority = 'HIGH';
      confidence = 0.85;
    }

    // VPN issues - AMÉLIORÉ
    if (lowerMessage.includes('vpn') || lowerMessage.includes('v.p.n')) {
      intent = 'vpn_issue';
      category = 'Network';
      priority = 'MEDIUM';
      confidence = 0.95;
    }

    // Password issues - AMÉLIORÉ
    if (
      lowerMessage.includes('mot de passe') ||
      lowerMessage.includes('password') ||
      lowerMessage.includes('mdp') ||
      lowerMessage.includes('oublié') ||
      lowerMessage.includes('forgot') ||
      lowerMessage.includes('connexion') ||
      lowerMessage.includes('login') ||
      lowerMessage.includes('accès')
    ) {
      intent = 'password_issue';
      category = 'Access';
      priority = 'MEDIUM';
      confidence = 0.9;
    }

    // NOUVEAU: Software issues
    if (
      lowerMessage.includes('logiciel') ||
      lowerMessage.includes('application') ||
      lowerMessage.includes('app') ||
      lowerMessage.includes('programme') ||
      lowerMessage.includes('software') ||
      lowerMessage.includes('crash') ||
      lowerMessage.includes('plante')
    ) {
      intent = 'software_issue';
      category = 'Software';
      priority = 'MEDIUM';
      confidence = 0.8;
    }

    // NOUVEAU: Printer issues
    if (
      lowerMessage.includes('imprimante') ||
      lowerMessage.includes('imprimer') ||
      lowerMessage.includes('printer') ||
      lowerMessage.includes('print') ||
      lowerMessage.includes('impression')
    ) {
      intent = 'printer_issue';
      category = 'Hardware';
      priority = 'LOW';
      confidence = 0.85;
    }

    // NOUVEAU: Email issues
    if (
      lowerMessage.includes('email') ||
      lowerMessage.includes('mail') ||
      lowerMessage.includes('outlook') ||
      lowerMessage.includes('message') ||
      lowerMessage.includes('envoi') ||
      lowerMessage.includes('réception')
    ) {
      intent = 'email_issue';
      category = 'Software';
      priority = 'MEDIUM';
      confidence = 0.85;
    }

    // Urgence keywords - override priority
    if (
      lowerMessage.includes('urgent') ||
      lowerMessage.includes('critique') ||
      lowerMessage.includes('bloqué') ||
      lowerMessage.includes('immédiat')
    ) {
      priority = 'URGENT';
    }

    // NOUVEAU: Générer questions contextuelles intelligentes
    const suggestedQuestions = this.generateContextualQuestions(intent, context);

    // NOUVEAU: Ajouter des suggestions basées sur l'apprentissage
    const learningSuggestions = aiMemory.getSuggestions(message);

    return {
      intent,
      category,
      priority,
      confidence,
      suggestedQuestions,
      relatedKBArticles: this.findRelatedSolutions(intent),
      learningSuggestions,
    };
  }

  /**
   * NOUVEAU: Générer des questions contextuelles intelligentes
   */
  private generateContextualQuestions(intent: string, context: AIContext): string[] {
    const questionsMap: Record<string, string[]> = {
      network_issue: [
        "🔍 L'icône Wi-Fi est-elle visible dans votre barre des tâches?",
        "⏰ Depuis combien de temps ce problème dure-t-il?",
        "📱 D'autres appareils arrivent-ils à se connecter au même réseau?",
        "🔄 Avez-vous essayé de redémarrer votre ordinateur?",
      ],
      hardware_issue: [
        "💡 Voyez-vous des voyants lumineux s'allumer sur l'ordinateur?",
        "🔊 Entendez-vous un bruit de ventilateur ou un signal sonore?",
        "🔌 L'ordinateur est-il bien branché à une prise électrique?",
        "📅 Depuis quand exactement l'ordinateur ne démarre plus?",
      ],
      vpn_issue: [
        "🌐 Êtes-vous connecté à Internet (sans VPN)?",
        "❌ Quel message d'erreur exactement s'affiche?",
        "🔑 Avez-vous récemment changé votre mot de passe?",
        "🏢 Êtes-vous sur le réseau de l'entreprise ou à distance?",
      ],
      password_issue: [
        "📧 Avez-vous accès à votre email professionnel?",
        "🆔 De quel compte exactement avez-vous oublié le mot de passe?",
        "🕐 Quand avez-vous changé votre mot de passe pour la dernière fois?",
      ],
      software_issue: [
        "💻 Quel logiciel exactement pose problème?",
        "❌ Y a-t-il un message d'erreur spécifique?",
        "📅 Le problème survient-il depuis une mise à jour récente?",
        "🔄 Avez-vous essayé de redémarrer l'application?",
      ],
      printer_issue: [
        "🖨️ L'imprimante est-elle allumée et connectée?",
        "📄 Voyez-vous des voyants d'erreur sur l'imprimante?",
        "💻 L'imprimante apparaît-elle dans vos périphériques?",
      ],
      email_issue: [
        "📬 Pouvez-vous recevoir des emails mais pas en envoyer (ou l'inverse)?",
        "🏢 Utilisez-vous Outlook, Gmail, ou un autre client?",
        "⏰ Depuis quand le problème d'email existe-t-il?",
      ],
    };

    // Si déjà des questions posées, ajuster
    const alreadyAsked = context.questionsAsked.length;
    const questions = questionsMap[intent] || [
      "🔍 Pouvez-vous me décrire le problème plus en détail?",
      "⏰ Depuis quand ce problème se produit-il?",
      "🔄 Avez-vous déjà essayé quelque chose pour le résoudre?",
    ];

    // Ne retourner que les questions pas encore posées
    return questions.slice(alreadyAsked, alreadyAsked + 2);
  }

  /**
   * Trouver des solutions pertinentes
   */
  findRelatedSolutions(intent: string): string[] {
    const solutionMap: Record<string, string[]> = {
      network_issue: ['wifi_issue', 'vpn_connection'],
      hardware_issue: ['pc_not_starting', 'slow_computer', 'printer_not_working'],
      vpn_issue: ['vpn_connection'],
      password_issue: ['password_reset'],
      software_issue: ['software_crash', 'slow_computer'],
      printer_issue: ['printer_not_working'],
      email_issue: ['email_not_sending'],
    };

    return solutionMap[intent] || [];
  }

  /**
   * Récupérer une solution par ID
   */
  async getSolution(solutionId: string): Promise<AISolution | null> {
    return mockKnowledgeBase[solutionId] || null;
  }

  /**
   * Générer une réponse conversationnelle
   * AVEC APPRENTISSAGE
   */
  async generateResponse(
    message: string,
    context: AIContext,
    analysis: AIAnalysis
  ): Promise<string> {
    // Première interaction
    if (context.questionsAsked.length === 0) {
      let response = this.generateInitialResponse(analysis);

      // NOUVEAU: Ajouter les insights d'apprentissage
      if (analysis.learningSuggestions && analysis.learningSuggestions.length > 0) {
        response += '\n\n' + analysis.learningSuggestions.join('\n');
      }

      // Afficher les stats d'apprentissage
      const stats = aiMemory.getStats();
      if (parseInt(stats.totalConversations) >= 5) {
        response += `\n\n🧠 *J'ai appris de ${stats.totalConversations} conversations (${stats.successRate}% de succès)*`;
      }

      return response;
    }

    // Réponses contextuelles
    return this.generateContextualResponse(message, context, analysis);
  }

  /**
   * Enregistrer le résultat d'une solution (pour l'apprentissage)
   */
  recordSolutionResult(
    problem: string,
    category: string,
    solutionTitle: string,
    success: boolean
  ): void {
    aiMemory.learn(problem, category, solutionTitle, success);
  }

  /**
   * Obtenir les statistiques d'apprentissage
   */
  getLearningStats() {
    return aiMemory.getStats();
  }

  /**
   * Réinitialiser l'apprentissage (admin uniquement)
   */
  resetLearning(): void {
    aiMemory.reset();
  }

  private generateInitialResponse(analysis: AIAnalysis): string {
    // Réponses plus conversationnelles et empathiques, style ChatGPT
    const responses: Record<string, string> = {
      network_issue:
        "Je comprends parfaitement votre frustration avec ce problème de connexion réseau. 🛠️ Ces soucis de connectivité peuvent vraiment ralentir votre travail.\n\nPour vous aider au mieux, j'ai quelques questions rapides:\n\n• Est-ce que l'icône Wi-Fi apparaît dans votre barre des tâches?\n• Depuis combien de temps ce problème se produit-il?\n• D'autres appareils arrivent-ils à se connecter au même réseau?\n\nCes informations m'aideront à identifier la cause exacte et vous proposer la meilleure solution.",
      
      hardware_issue:
        "Oh non, un ordinateur qui ne démarre pas, c'est vraiment embêtant! 💻 Je vais faire de mon mieux pour vous aider à le faire redémarrer.\n\nAvant de commencer, laissez-moi vous poser quelques questions de diagnostic:\n\n• Quand vous appuyez sur le bouton Power, voyez-vous des voyants lumineux s'allumer?\n• Entendez-vous un bruit de ventilateur ou un signal sonore?\n• L'ordinateur était-il bien branché sur secteur?\n\nSelon vos réponses, je pourrai vous guider étape par étape vers la solution la plus adaptée.",
      
      vpn_issue:
        "Je vais vous aider à résoudre ce problème de VPN. 🔐 Je sais que l'accès au réseau de l'entreprise est crucial pour votre travail.\n\nQuelques vérifications rapides pour commencer:\n\n• Êtes-vous actuellement connecté à Internet (sans le VPN)?\n• Quel message d'erreur exactement voyez-vous?\n• Avez-vous récemment changé votre mot de passe?\n\nCes détails m'aideront à cibler le problème plus précisément.",
      
      password_issue:
        "Pas de panique pour le mot de passe oublié, ça arrive à tout le monde! 🔑 Je vais vous guider pour retrouver l'accès à votre compte.\n\nJ'ai deux solutions à vous proposer:\n\n**1. Réinitialisation automatique par email** (2-3 minutes)\n   ✅ Rapide et sécurisé\n   ✅ Vous recevez un lien immédiatement\n\n**2. Contact avec le support IT** (si email inaccessible)\n   ⏱️ Peut prendre 10-15 minutes\n   🔐 Vérification d'identité nécessaire\n\nQuelle option préférez-vous?",
    };

    const defaultResponse = this.generateContextualFallback(analysis);
    return responses[analysis.intent] || defaultResponse;
  }

  /**
   * Générer une réponse contextuelle intelligente quand intent inconnu
   */
  private generateContextualFallback(analysis: AIAnalysis): string {
    // Détecter l'émotion/urgence
    const isUrgent = analysis.priority === 'HIGH' || analysis.priority === 'URGENT';
    const urgencyPrefix = isUrgent 
      ? "Je vois que c'est urgent et je vais faire de mon mieux pour vous aider rapidement! ⚡\n\n"
      : "";

    return `${urgencyPrefix}J'ai bien reçu votre message concernant ce problème ${analysis.category ? `de ${analysis.category}` : ''}.

Pour vous proposer la solution la plus adaptée, j'aurais besoin de quelques informations supplémentaires:

• Depuis quand ce problème se produit-il?
• Est-ce la première fois que ça arrive?
• Avez-vous fait des modifications récentes (mise à jour, installation)?
• Y a-t-il un message d'erreur spécifique?

Plus vous me donnez de détails, mieux je pourrai vous aider! 💪`;
  }

  private generateContextualResponse(
    message: string,
    context: AIContext,
    analysis: AIAnalysis
  ): string {
    const lowerMessage = message.toLowerCase();

    // Détection d'émotion/urgence dans le message
    const isUrgent = lowerMessage.includes('urgent') || 
                     lowerMessage.includes('vite') || 
                     lowerMessage.includes('important') ||
                     lowerMessage.includes('bloqué');
    
    const isFrustrated = lowerMessage.includes('encore') ||
                         lowerMessage.includes('toujours') ||
                         lowerMessage.includes('rien') ||
                         lowerMessage.includes('marche pas');

    // Réponses empathiques selon l'émotion
    if (isFrustrated) {
      return "Je comprends votre frustration, et je vais faire tout mon possible pour résoudre ce problème rapidement. 💪\n\nEssayons une approche différente pour trouver la solution.";
    }

    if (isUrgent) {
      return "Je vois que c'est urgent! ⚡ Je vais prioriser votre demande et vous proposer la solution la plus rapide.\n\nPassons directement aux étapes de résolution.";
    }

    // Réponses positives - Style ChatGPT encourageant
    if (lowerMessage.includes('oui') || lowerMessage.includes('yes') || lowerMessage.includes('ok')) {
      const encouragements = [
        "Parfait! 👍 Je vais vous guider étape par étape. On y va!",
        "Super! 🎯 Commençons tout de suite avec la première étape.",
        "Excellent! ✨ Je suis là pour vous accompagner dans chaque étape.",
        "Très bien! 💪 Allons-y ensemble, ça va bien se passer.",
      ];
      return encouragements[Math.floor(Math.random() * encouragements.length)];
    }

    // Réponses négatives - Proposer des alternatives
    if (lowerMessage.includes('non') || lowerMessage.includes('no')) {
      return "D'accord, pas de problème! 🤔\n\nVoici d'autres options possibles:\n\n**Option A:** Essayer une solution alternative\n**Option B:** Vous mettre en relation avec un technicien\n**Option C:** Me donner plus de détails pour affiner le diagnostic\n\nQue préférez-vous?";
    }

    // Questions sur le statut - Réponse informative
    if (lowerMessage.includes('comment') || lowerMessage.includes('pourquoi') || lowerMessage.includes('quoi')) {
      return "Excellente question! 🤓\n\nLaissez-moi vous expliquer:\n\nCe type de problème survient généralement pour 3 raisons principales:\n1. Configuration réseau modifiée\n2. Mise à jour système récente\n3. Conflit avec un autre logiciel\n\nSelon votre situation, je peux vous proposer la solution la plus adaptée. Dites-moi laquelle de ces situations correspond le mieux?";
    }

    // Demande d'aide générale - ChatGPT style
    if (lowerMessage.includes('aide') || lowerMessage.includes('help') || lowerMessage.includes('aidez-moi')) {
      return "Je suis là pour vous aider! 🤝\n\nPour vous accompagner au mieux, j'ai besoin de comprendre un peu mieux votre situation:\n\n• Qu'avez-vous déjà essayé?\n• Y a-t-il un message d'erreur?\n• Quand le problème a-t-il commencé?\n\nPlus j'en sais, plus je peux être précis dans mes recommandations!";
    }

    // Remerciements - Réponse chaleureuse
    if (lowerMessage.includes('merci') || lowerMessage.includes('thanks')) {
      return "Avec plaisir! 😊 C'est mon rôle de vous aider.\n\nAvez-vous besoin d'autre chose? Je suis là si vous avez d'autres questions!";
    }

    // Demande de plus de solutions
    if (lowerMessage.includes('autre') || lowerMessage.includes('plus') || lowerMessage.includes('différent')) {
      return "Bien sûr! Je vais vous proposer des alternatives. 🔄\n\nBasé sur votre problème, voici d'autres approches possibles:\n\n**Solution Alternative 1:** Approche manuelle (plus de contrôle)\n**Solution Alternative 2:** Réinitialisation rapide (plus simple)\n**Solution Alternative 3:** Diagnostic approfondi (si problème complexe)\n\nQuelle approche vous semble la plus appropriée?";
    }

    // Réponse par défaut contextuelle et intelligente
    return this.generateSmartDefaultResponse(context, analysis);
  }

  /**
   * Générer une réponse par défaut intelligente basée sur le contexte
   */
  private generateSmartDefaultResponse(context: AIContext, analysis: AIAnalysis): string {
    // Adapter selon le nombre de questions déjà posées
    const questionCount = context.questionsAsked.length;
    
    if (questionCount === 0) {
      return "Je vois. 🤔 Pour avancer efficacement, laissez-moi vous poser une question de diagnostic...";
    } else if (questionCount < 3) {
      return "D'accord, je comprends mieux maintenant. 💡\n\nUne dernière précision pour être sûr de la solution optimale...";
    } else {
      return "Merci pour toutes ces informations! 📋\n\nJ'ai maintenant une vision claire de votre situation. Laissez-moi vous proposer la meilleure solution.";
    }
  }

  /**
   * Créer un brouillon de ticket depuis la conversation
   */
  async createTicketDraft(
    conversationId: string,
    context: AIContext,
    messages: AIMessage[]
  ): Promise<AITicketDraft> {
    const subject = context.problemDescription || 'Problème IT signalé via assistant IA';
    const category = context.category || 'General';
    const priority = context.priority || 'MEDIUM';

    // Générer le résumé de conversation
    const conversationSummary = messages
      .map((m) => `[${m.role.toUpperCase()}] ${m.content}`)
      .join('\n');

    // Générer le diagnostic
    const solutionsAttempted = context.solutionsAttempted.map(
      (s) => `${s.solutionTitle} → ${s.result}`
    );

    const diagnosis = `Problème analysé par l'assistant IA.
Catégorie détectée: ${category}
Priorité: ${priority}

Solutions essayées:
${solutionsAttempted.join('\n') || 'Aucune solution essayée'}

L'assistant IA n'a pas pu résoudre le problème automatiquement.
Escalade vers le support technique recommandée.`;

    return {
      subject,
      description: context.problemDescription || subject,
      category,
      priority,
      impact: context.impact || 'INDIVIDUAL',
      conversationSummary,
      solutionsAttempted: context.solutionsAttempted.map((s) => s.solutionTitle),
      diagnosis,
      metadata: {
        conversationId,
        language: context.language || 'fr',
        totalMessages: messages.length,
        solutionsCount: context.solutionsAttempted.length,
      },
    };
  }

  /**
   * Créer une escalade
   */
  async createEscalation(
    conversationId: string,
    context: AIContext,
    messages: AIMessage[]
  ): Promise<AIEscalation> {
    const ticketDraft = await this.createTicketDraft(conversationId, context, messages);

    return {
      conversationId,
      reason: 'Solutions automatiques épuisées sans résolution',
      summary: `L'utilisateur a signalé un problème de type ${context.category || 'IT'}.
L'assistant IA a proposé ${context.solutionsAttempted.length} solution(s) mais le problème persiste.`,
      recommendedCategory: context.category || 'General',
      recommendedPriority: context.priority || 'MEDIUM',
      ticketDraft,
    };
  }
}

export const aiAssistantService = new AIAssistantService();
