import { useState, useRef, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { useNavigate } from "react-router-dom";
import { aiService, type KBSuggestion } from "../services/ai.service";
import { PATHS } from "../routes/paths";

interface AIAssistantDialogProps {
  open: boolean;
  onClose: () => void;
  initialProblem?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function AIAssistantDialog({ open, onClose, initialProblem }: AIAssistantDialogProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<KBSuggestion[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [canResolveWithoutTicket, setCanResolveWithoutTicket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with problem
  useEffect(() => {
    if (open && initialProblem && messages.length === 0) {
      handleInitialProblem(initialProblem);
    }
  }, [open, initialProblem]);

  const handleInitialProblem = async (problem: string) => {
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: problem,
      timestamp: new Date(),
    };
    setMessages([userMessage]);
    setLoading(true);

    try {
      // Get AI suggestions
      const result = await aiService.suggestSolutions(problem);
      setSuggestions(result.suggestions);
      setAiAnalysis(result.aiAnalysis);
      setCanResolveWithoutTicket(result.canResolveWithoutTicket);

      // Add AI response
      const aiMessage: Message = {
        role: "assistant",
        content: result.aiAnalysis,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI suggestions:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again or create a ticket for assistance.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await aiService.chat(input, conversationHistory);

      const aiMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to chat with AI:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = () => {
    onClose();
    navigate(PATHS.EMPLOYEE_CREATE_TICKET);
  };

  const handleViewArticle = (slug: string) => {
    onClose();
    navigate(`/employee/kb/${slug}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SmartToyIcon sx={{ color: "#2563EB" }} />
          <Typography variant="h6">🤖 AI Assistant</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ height: 500 }}>
        {/* KB Suggestions */}
        {suggestions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "#059669" }}>
              📚 Suggested Articles ({suggestions.length})
            </Typography>
            {suggestions.map((suggestion) => (
              <Card
                key={suggestion.articleId}
                sx={{
                  mb: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#F9FAFB" },
                  border: "1px solid #E5E7EB",
                }}
                onClick={() => handleViewArticle(suggestion.slug)}
              >
                <CardContent sx={{ py: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {suggestion.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        {suggestion.excerpt}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={suggestion.categoryName}
                          size="small"
                          sx={{ height: 20, fontSize: 10 }}
                        />
                      </Box>
                    </Box>
                    <Chip
                      label={`${suggestion.relevanceScore}% match`}
                      size="small"
                      color={suggestion.relevanceScore >= 80 ? "success" : "default"}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Chat Messages */}
        <Box>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                gap: 1,
                mb: 2,
                justifyContent: message.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {message.role === "assistant" && (
                <SmartToyIcon sx={{ color: "#2563EB", fontSize: 24 }} />
              )}
              <Box
                sx={{
                  maxWidth: "70%",
                  bgcolor: message.role === "user" ? "#2563EB" : "#F3F4F6",
                  color: message.role === "user" ? "white" : "#374151",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {message.content}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: 10 }}>
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
              {message.role === "user" && (
                <PersonIcon sx={{ color: "#6B7280", fontSize: 24 }} />
              )}
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
              <SmartToyIcon sx={{ color: "#2563EB", fontSize: 24 }} />
              <CircularProgress size={20} />
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Thinking...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, flexDirection: "column", alignItems: "stretch" }}>
        {/* Input */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            sx={{ minWidth: 100 }}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between", width: "100%" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            {suggestions.length > 0 && (
              <>
                <Button
                  size="small"
                  startIcon={<ThumbUpIcon />}
                  sx={{ textTransform: "none" }}
                  onClick={onClose}
                >
                  Problem Solved
                </Button>
                <Button
                  size="small"
                  startIcon={<ThumbDownIcon />}
                  sx={{ textTransform: "none" }}
                  onClick={handleCreateTicket}
                >
                  Didn't Help
                </Button>
              </>
            )}
          </Box>
          <Button
            variant="outlined"
            startIcon={<ConfirmationNumberIcon />}
            onClick={handleCreateTicket}
            sx={{ textTransform: "none" }}
          >
            Create Ticket Instead
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default AIAssistantDialog;
