import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatBubbleOutlined from '@mui/icons-material/ChatBubbleOutlined';
import { conversationHistoryService } from '../../services/conversationHistory.service';
import type { AIConversation } from '../../types/aiChat.types';

interface ConversationHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectConversation: (conversation: AIConversation) => void;
}

export const ConversationHistoryDialog = ({
  open,
  onClose,
  onSelectConversation,
}: ConversationHistoryDialogProps) => {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = () => {
    const allSummaries = conversationHistoryService.getConversationSummaries();
    setSummaries(allSummaries);
    
    const statistics = conversationHistoryService.getStats();
    setStats(statistics);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      loadData();
    } else {
      const results = conversationHistoryService.searchConversations(query);
      setSummaries(results);
    }
  };

  const handleSelect = (id: string) => {
    const conversation = conversationHistoryService.getConversation(id);
    if (conversation) {
      onSelectConversation(conversation);
      onClose();
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      conversationHistoryService.deleteConversation(id);
      loadData();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon sx={{ color: '#2563EB' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            💬 Conversation History
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Stats */}
        {stats && (
          <Box sx={{ p: 2, bgcolor: '#EFF6FF', borderBottom: '1px solid #E5E7EB' }}>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#2563EB' }}>
                  {stats.totalConversations}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                  Total
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>
                  {stats.resolvedConversations}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                  Resolved
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#7C3AED' }}>
                  {stats.averageMessagesPerConversation}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                  Avg. Messages
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Search */}
        <Box sx={{ p: 2, borderBottom: '1px solid #E5E7EB' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Conversation List */}
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {summaries.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <ChatBubbleOutlined sx={{ fontSize: 48, color: '#9CA3AF', mb: 2 }} />
              <Typography sx={{ color: '#9CA3AF' }}>
                {searchQuery ? 'No conversations found' : 'No conversation history yet'}
              </Typography>
            </Box>
          ) : (
            summaries.map((summary) => (
              <ListItem
                key={summary.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) => handleDelete(summary.id, e)}
                    sx={{ color: '#DC2626' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemButton onClick={() => handleSelect(summary.id)}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#111827',
                            flex: 1,
                          }}
                        >
                          {summary.firstMessage}
                        </Typography>
                        {summary.resolved && (
                          <CheckCircleIcon sx={{ fontSize: 18, color: '#059669' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                          {new Date(summary.date).toLocaleDateString('fr-FR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                        <Chip
                          label={`${summary.messageCount} messages`}
                          size="small"
                          sx={{ fontSize: 10, height: 20 }}
                        />
                        {summary.category && (
                          <Chip
                            label={summary.category}
                            size="small"
                            sx={{
                              fontSize: 10,
                              height: 20,
                              bgcolor: '#EFF6FF',
                              color: '#2563EB',
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Close
        </Button>
        {summaries.length > 0 && (
          <Button
            onClick={() => {
              if (confirm('Delete all conversation history?')) {
                conversationHistoryService.clearHistory();
                loadData();
              }
            }}
            color="error"
            sx={{ textTransform: 'none' }}
          >
            Clear All
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
