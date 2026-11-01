import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { attachmentsService } from '../../services/attachments.service';

interface FileUploadProps {
  ticketId: string;
  onUploadComplete?: () => void;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

function FileUpload({ ticketId, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validation taille
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 25 MB limit (${attachmentsService.formatFileSize(file.size)})`);
      return;
    }

    try {
      setUploading(true);
      await attachmentsService.upload(ticketId, file);
      onUploadComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <Box>
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        sx={{
          border: `2px dashed ${dragActive ? '#2563EB' : '#D1D5DB'}`,
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: dragActive ? '#EFF6FF' : '#F9FAFB',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: '#2563EB',
            bgcolor: '#EFF6FF',
          },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />

        <CloudUploadIcon sx={{ fontSize: 48, color: '#9CA3AF', mb: 2 }} />

        <Typography sx={{ fontSize: 14, color: '#374151', mb: 1 }}>
          <strong>Click to upload</strong> or drag and drop
        </Typography>

        <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
          Images, PDF, Word, Excel (max 25 MB)
        </Typography>
      </Box>

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          <Typography sx={{ fontSize: 12, color: '#6B7280', mt: 1, textAlign: 'center' }}>
            Uploading...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

export default FileUpload;
