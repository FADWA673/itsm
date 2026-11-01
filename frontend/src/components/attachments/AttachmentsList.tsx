import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { attachmentsService } from '../../services/attachments.service';
import type { Attachment } from '../../services/attachments.service';
import { useAuthStore } from '../../store';

interface AttachmentsListProps {
  ticketId: string;
  refreshTrigger?: number;
  allowDelete?: boolean;
}

function AttachmentsList({ ticketId, refreshTrigger = 0, allowDelete = false }: AttachmentsListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useAuthStore();

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const data = await attachmentsService.getByTicketId(ticketId);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [ticketId, refreshTrigger]);

  const handleDownload = (attachment: Attachment) => {
    const url = attachmentsService.getDownloadUrl(attachment.id);
    window.open(url, '_blank');
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;

    try {
      setDeleting(attachmentId);
      await attachmentsService.delete(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete attachment');
    } finally {
      setDeleting(null);
    }
  };

  const canDelete = (attachment: Attachment): boolean => {
    if (!allowDelete) return false;
    const isOwner = attachment.uploadedById === user?.id;
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
    return isOwner || isAdmin;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (attachments.length === 0) {
    return (
      <Typography sx={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', py: 3 }}>
        No attachments yet
      </Typography>
    );
  }

  return (
    <List sx={{ py: 0 }}>
      {attachments.map((attachment) => (
        <ListItem
          key={attachment.id}
          sx={{
            bgcolor: '#F9FAFB',
            borderRadius: 2,
            mb: 1,
            border: '1px solid #E5E7EB',
            '&:hover': { bgcolor: '#F3F4F6' },
          }}
          secondaryAction={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Download">
                <IconButton
                  size="small"
                  onClick={() => handleDownload(attachment)}
                  sx={{ color: '#2563EB' }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {canDelete(attachment) && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(attachment.id)}
                    disabled={deleting === attachment.id}
                    sx={{ color: '#EF4444' }}
                  >
                    {deleting === attachment.id ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DeleteIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          }
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Box sx={{ fontSize: 24 }}>{attachmentsService.getFileIcon(attachment.mimeType)}</Box>
          </ListItemIcon>

          <ListItemText
            primary={
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#1F2937' }}>
                {attachment.originalName}
              </Typography>
            }
            secondary={
              <Typography component="div" sx={{ fontSize: 12, color: '#6B7280', mt: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <span>{attachmentsService.formatFileSize(attachment.size)}</span>
                  <span style={{ color: '#9CA3AF' }}>•</span>
                  <span>by {attachment.uploadedBy.firstName} {attachment.uploadedBy.lastName}</span>
                  <span style={{ color: '#9CA3AF' }}>•</span>
                  <span>{new Date(attachment.createdAt).toLocaleDateString()}</span>
                </Box>
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}

export default AttachmentsList;
