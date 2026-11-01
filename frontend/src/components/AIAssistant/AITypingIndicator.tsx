import { Box, Avatar } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { keyframes } from '@mui/system';

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

export const AITypingIndicator = () => {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
      <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
        <SmartToyIcon fontSize="small" />
      </Avatar>
      <Box
        sx={{
          bgcolor: 'grey.100',
          borderRadius: 2,
          px: 2,
          py: 1,
          display: 'flex',
          gap: 0.5,
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: 'grey.500',
            animation: `${bounce} 1.4s infinite ease-in-out`,
            animationDelay: '0s',
          }}
        />
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: 'grey.500',
            animation: `${bounce} 1.4s infinite ease-in-out`,
            animationDelay: '0.2s',
          }}
        />
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: 'grey.500',
            animation: `${bounce} 1.4s infinite ease-in-out`,
            animationDelay: '0.4s',
          }}
        />
      </Box>
    </Box>
  );
};
