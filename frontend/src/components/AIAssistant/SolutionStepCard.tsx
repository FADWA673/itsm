import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Help from '@mui/icons-material/Help';
import type { AISolutionStep } from '../../types/aiChat.types';

interface SolutionStepCardProps {
  step: AISolutionStep;
  isActive?: boolean;
  isCompleted?: boolean;
}

export const SolutionStepCard = ({
  step,
  isActive = false,
  isCompleted = false,
}: SolutionStepCardProps) => {
  const getIcon = () => {
    if (isCompleted) return <CheckCircle fontSize="small" color="success" />;
    if (isActive) return <PlayArrow fontSize="small" color="primary" />;
    return <Help fontSize="small" color="disabled" />;
  };

  const getStepTypeLabel = () => {
    switch (step.type) {
      case 'action':
        return 'Action';
      case 'check':
        return 'Vérification';
      case 'question':
        return 'Question';
      default:
        return 'Étape';
    }
  };

  return (
    <Card
      sx={{
        mb: 1,
        border: isActive ? '2px solid' : '1px solid',
        borderColor: isActive ? 'primary.main' : 'grey.300',
        bgcolor: isCompleted ? 'success.light' : isActive ? 'primary.light' : 'white',
        opacity: isActive || isCompleted ? 1 : 0.7,
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
          <Box sx={{ mt: 0.5 }}>{getIcon()}</Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip label={`Étape ${step.order}`} size="small" sx={{ height: 20 }} />
              <Chip
                label={getStepTypeLabel()}
                size="small"
                variant="outlined"
                sx={{ height: 20 }}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: isActive ? 600 : 400, mb: 1 }}>
              {step.instruction}
            </Typography>
            {step.expectedResult && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                ✓ Résultat attendu: {step.expectedResult}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
