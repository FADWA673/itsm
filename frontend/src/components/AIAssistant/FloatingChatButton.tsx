import { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { aiService } from '../../services/ai.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const FloatingChatButton = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await aiService.chat(input, conversationHistory);

      const aiMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages([...messages, userMessage, aiMessage]);
    } catch (error) {
      console.error('Failed to chat with AI:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      };
      setMessages([...messages, userMessage, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
        onClick={() => setOpen(true)}
      >
        <ChatIcon />
      </Fab>

      {/* Dialog Chat */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { height: '80vh', maxHeight: '600px' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <SmartToyIcon />
            <Typography variant="h6">Assistant IA</Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {messages.length === 0 ? (
              <Box textAlign="center" py={4}>
                <SmartToyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Bonjour! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui?
                </Typography>
              </Box>
            ) : (
              messages.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    mb: 2,
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32
                    }}
                  >
                    {msg.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                  </Avatar>
                  
                  <Paper
                    sx={{
                      p: 1.5,
                      maxWidth: '70%',
                      bgcolor: msg.role === 'user' ? 'primary.light' : 'grey.100'
                    }}
                  >
                    <Typography variant="body2">{msg.content}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Paper>
                </Box>
              ))
            )}
            
            {loading && (
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  <SmartToyIcon />
                </Avatar>
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Tapez votre message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!input.trim() || loading}
                    color="primary"
                  >
                    <SendIcon />
                  </IconButton>
                )
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
