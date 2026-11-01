import { Box, Typography, LinearProgress, Tooltip, Chip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface LearningProgressBadgeProps {
  stats: {
    totalConversations: string;
    successRate: string;
    totalProblems: string;
    mostCommonProblem: string;
  };
}

export const LearningProgressBadge = ({ stats }: LearningProgressBadgeProps) => {
  const conversationCount = parseInt(stats.totalConversations);
  const successRate = parseFloat(stats.successRate);

  // Niveau d'apprentissage basé sur le nombre de conversations
  let level = 'Débutant';
  let levelColor: 'default' | 'primary' | 'secondary' | 'success' | 'warning' = 'default';
  let progress = 0;

  if (conversationCount >= 50) {
    level = 'Expert';
    levelColor = 'success';
    progress = 100;
  } else if (conversationCount >= 20) {
    level = 'Avancé';
    levelColor = 'secondary';
    progress = 75;
  } else if (conversationCount >= 10) {
    level = 'Intermédiaire';
    levelColor = 'primary';
    progress = 50;
  } else if (conversationCount >= 5) {
    level = 'Apprenti';
    levelColor = 'warning';
    progress = 25;
  }

  if (conversationCount < 5) {
    return null; // Masquer jusqu'à 5 conversations
  }

  return (
    <Box
      sx={{
        p: 1.5,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        mb: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon fontSize="small" color={levelColor} />
          <Typography variant="body2" fontWeight="bold">
            Niveau d'apprentissage
          </Typography>
        </Box>
        <Chip
          label={level}
          size="small"
          color={levelColor}
          icon={<TrendingUpIcon />}
        />
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 1, height: 6, borderRadius: 3 }}
        color={levelColor}
      />

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Tooltip title="Nombre total de conversations">
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            💬 {stats.totalConversations} conversations
          </Typography>
        </Tooltip>

        <Tooltip title="Taux de réussite des solutions proposées">
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            ✅ {stats.successRate}% succès
          </Typography>
        </Tooltip>

        <Tooltip title="Nombre de problèmes différents rencontrés">
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            🔍 {stats.totalProblems} problèmes
          </Typography>
        </Tooltip>
      </Box>

      {stats.mostCommonProblem !== 'Aucun' && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          📊 Problème le plus fréquent: <strong>{stats.mostCommonProblem}</strong>
        </Typography>
      )}
    </Box>
  );
};
