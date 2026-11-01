import { useState, useRef, useEffect } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Avatar,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HistoryIcon from '@mui/icons-material/History';
import { useAIConversation } from '../../hooks/useAIConversation';
import { AITypingIndicator } from './AITypingIndicator';
import { QuickActionButtons } from './QuickActionButtons';
import { SolutionStepCard } from './SolutionStepCard';
import { LearningProgressBadge } from './LearningProgressBadge';
import { ConversationHistoryDialog } from './ConversationHistoryDialog';
import { aiAssistantService } from '../../services/aiAssistant.service';
import { conversationHistoryService } from '../../services/conversationHistory.service';
import type { AISolution, AIConversation } from '../../types/aiChat.types';

export const AdvancedAIChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [currentSolution, setCurrentSolution] = useState<AISolution | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showEscalation, setShowEscalation] = useState(false);
  const [learningStats, setLearningStats] = useState<any>(null);
  const [historyOpen, setHistoryOpen] = useState(false); // NOUVEAU
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useAIConversation();

  // NOUVEAU: Charger les stats d'apprentissage à l'ouverture
  useEffect(() => {
    if (open) {
      const stats = aiAssistantService.getLearningStats();
      setLearningStats(stats);
    }
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, isTyping]);

  // Message d'accueil initial
  useEffect(() => {
    if (open && conversation.messages.length === 0) {
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content:
            "Bonjour! 👋 Je suis votre assistant IT.\n\nDécrivez-moi votre problème et je vais essayer de vous aider à le résoudre.",
        });
      }, 500);
    }
  }, [open, conversation.messages.length, addMessage]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userInput = input;
    setInput('');

    const result = await sendMessage(userInput);

    // Si c'est le premier message, chercher des solutions
    if (result && conversation.messages.length === 1) {
      await loadSolutionsIfNeeded(result.analysis.intent);
    }
  };

  const loadSolutionsIfNeeded = async (intent: string) => {
    const solutionIds = aiAssistantService.findRelatedSolutions(intent);
    if (solutionIds.length > 0) {
      const solution = await aiAssistantService.getSolution(solutionIds[0]);
      if (solution) {
        setCurrentSolution(solution);
        setCurrentStepIndex(0);

        // Proposer la solution
        setTimeout(() => {
          addMessage({
            role: 'assistant',
            content: `J'ai trouvé une solution qui pourrait vous aider: **${solution.title}**\n\nCette procédure prend environ ${solution.estimatedTime} et a un taux de réussite de ${solution.successRate}%.\n\nVoulez-vous que je vous guide étape par étape?`,
          });
        }, 1000);
      }
    }
  };

  const handleQuickAction = async (value: string) => {
    // Ajouter la réponse comme message utilisateur
    addMessage({
      role: 'user',
      content: value,
    });

    // Traiter la réponse
    if (value === 'Oui' || value === 'Yes') {
      if (currentSolution && currentStepIndex < currentSolution.steps.length) {
        showCurrentStep();
      }
    } else if (value === 'Non' || value === 'No') {
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: "D'accord. Essayons une autre approche ou je peux transmettre le problème à un technicien.",
        });
        setShowEscalation(true);
      }, 800);
    } else if (value === 'Étape suivante') {
      nextStep();
    } else if (value === 'Ça fonctionne!') {
      handleSolutionSuccess();
    } else if (value === 'Ça ne fonctionne pas') {
      handleSolutionFailed();
    } else if (value === 'Contacter un technicien') {
      handleEscalation();
    }
  };

  const showCurrentStep = () => {
    if (!currentSolution) return;

    const step = currentSolution.steps[currentStepIndex];
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: `**Étape ${step.order}/${currentSolution.steps.length}**: ${step.instruction}\n\n${
          step.expectedResult ? `✓ Résultat attendu: ${step.expectedResult}` : ''
        }`,
      });
    }, 800);
  };

  const nextStep = () => {
    if (!currentSolution) return;

    if (currentStepIndex < currentSolution.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      showCurrentStep();
    } else {
      // Dernière étape terminée
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: "Vous avez terminé toutes les étapes. Est-ce que votre problème est résolu maintenant?",
        });
      }, 800);
    }
  };

  const handleSolutionSuccess = () => {
    if (currentSolution) {
      addSolutionAttempt({
        solutionId: currentSolution.id,
        solutionTitle: currentSolution.title,
        attemptedAt: new Date(),
        result: 'success',
      });

      // NOUVEAU: Enregistrer le succès pour l'apprentissage
      aiAssistantService.recordSolutionResult(
        conversation.context.problemDescription || '',
        conversation.context.category || 'General',
        currentSolution.title,
        true // succès!
      );
    }

    markAsResolved();

    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: "Excellent! 🎉 Je suis content d'avoir pu vous aider.\n\n💡 *J'ai appris de cette interaction et je serai encore meilleur la prochaine fois!*\n\nN'hésitez pas à me contacter si vous avez d'autres problèmes!",
      });
    }, 800);

    setCurrentSolution(null);
    setShowEscalation(false);
  };

  const handleSolutionFailed = () => {
    if (currentSolution) {
      addSolutionAttempt({
        solutionId: currentSolution.id,
        solutionTitle: currentSolution.title,
        attemptedAt: new Date(),
        result: 'failed',
      });

      // NOUVEAU: Enregistrer l'échec pour l'apprentissage
      aiAssistantService.recordSolutionResult(
        conversation.context.problemDescription || '',
        conversation.context.category || 'General',
        currentSolution.title,
        false // échec
      );
    }

    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: "Je comprends. Cette solution n'a pas fonctionné.\n\n🧠 *J'ai noté cet échec pour m'améliorer.*\n\nJe recommande de transmettre votre problème à un technicien qui pourra vous aider directement.",
      });
      setShowEscalation(true);
    }, 800);

    setCurrentSolution(null);
  };

  const handleEscalation = async () => {
    markAsEscalated();

    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: `✅ **Ticket créé automatiquement**\n\nVotre problème a été transmis au support IT.\n\n📋 **Résumé**:\n- Catégorie: ${conversation.context.category || 'IT Support'}\n- Priorité: ${conversation.context.priority || 'MEDIUM'}\n- Solutions essayées: ${conversation.context.solutionsAttempted.length}\n\nUn technicien va prendre en charge votre ticket très bientôt.`,
      });
      setShowEscalation(false);
    }, 1000);
  };

  const handleReset = () => {
    resetConversation();
    setCurrentSolution(null);
    setCurrentStepIndex(0);
    setShowEscalation(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
        onClick={() => setOpen(true)}
      >
        <ChatIcon />
      </Fab>

      {/* Chat Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { height: '85vh', maxHeight: '700px' },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <SmartToyIcon />
            <Box>
              <Typography variant="h6" sx={{ fontSize: 16 }}>
                🤖 Assistant IT {learningStats && parseInt(learningStats.totalConversations) >= 5 && '🧠'}
              </Typography>
              {conversation.status === 'active' && (
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {learningStats && parseInt(learningStats.totalConversations) >= 5
                    ? `En ligne • ${learningStats.successRate}% de succès • ${learningStats.totalConversations} conversations`
                    : 'En ligne'}
                </Typography>
              )}
            </Box>
          </Box>
          <Box>
            <IconButton onClick={() => setHistoryOpen(true)} size="small" sx={{ color: 'white', mr: 1 }} title="Historique">
              <HistoryIcon />
            </IconButton>
            <IconButton onClick={handleReset} size="small" sx={{ color: 'white', mr: 1 }} title="Nouvelle conversation">
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={() => {
              // Sauvegarder conversation avant de fermer
              conversationHistoryService.saveConversation(conversation);
              setOpen(false);
            }} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Context Info */}
        {conversation.context.category && (
          <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={conversation.context.category} size="small" color="primary" />
              {conversation.context.priority && (
                <Chip label={`Priorité: ${conversation.context.priority}`} size="small" />
              )}
              {conversation.context.solutionsAttempted.length > 0 && (
                <Chip
                  label={`${conversation.context.solutionsAttempted.length} solution(s) essayée(s)`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* NOUVEAU: Learning Progress Badge */}
        {learningStats && parseInt(learningStats.totalConversations) >= 5 && (
          <Box sx={{ px: 2, pt: 2, pb: 0 }}>
            <LearningProgressBadge stats={learningStats} />
          </Box>
        )}

        {/* Messages */}
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {conversation.messages.map((msg, idx) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  gap: 1,
                  mb: 2,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                    width: 32,
                    height: 32,
                  }}
                >
                  {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                </Avatar>

                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: '75%',
                    bgcolor: msg.role === 'user' ? 'primary.light' : 'grey.100',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {msg.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {msg.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>

                  {/* Quick Actions après certains messages */}
                  {msg.role === 'assistant' && idx === conversation.messages.length - 1 && !isTyping && (
                    <>
                      {msg.content.includes('étape par étape') && (
                        <QuickActionButtons
                          actions={[
                            { label: 'Oui', value: 'Oui', icon: 'yes' },
                            { label: 'Non', value: 'Non', icon: 'no' },
                          ]}
                          onSelect={handleQuickAction}
                        />
                      )}
                      {msg.content.includes('Étape') && currentSolution && (
                        <QuickActionButtons
                          actions={[
                            { label: 'Étape suivante', value: 'Étape suivante' },
                          ]}
                          onSelect={handleQuickAction}
                        />
                      )}
                      {msg.content.includes('résolu maintenant') && (
                        <QuickActionButtons
                          actions={[
                            { label: 'Ça fonctionne!', value: 'Ça fonctionne!', icon: 'yes' },
                            { label: 'Ça ne fonctionne pas', value: 'Ça ne fonctionne pas', icon: 'no' },
                          ]}
                          onSelect={handleQuickAction}
                        />
                      )}
                      {showEscalation && (
                        <QuickActionButtons
                          actions={[
                            { label: '👨‍💻 Contacter un technicien', value: 'Contacter un technicien' },
                          ]}
                          onSelect={handleQuickAction}
                        />
                      )}
                    </>
                  )}
                </Paper>
              </Box>
            ))}

            {isTyping && <AITypingIndicator />}

            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input */}
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Décrivez votre problème..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping || conversation.status !== 'active'}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping || conversation.status !== 'active'}
                    color="primary"
                  >
                    <SendIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Conversation History Dialog */}
      <ConversationHistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectConversation={(conv: AIConversation) => {
          setConversation(conv);
          setHistoryOpen(false);
        }}
      />
    </>
  );
};
