import { Box, Button } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import Help from '@mui/icons-material/Help';

interface QuickActionButtonsProps {
  actions: Array<{ label: string; value: string; icon?: 'yes' | 'no' | 'help' }>;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export const QuickActionButtons = ({
  actions,
  onSelect,
  disabled = false,
}: QuickActionButtonsProps) => {
  const getIcon = (iconType?: string) => {
    switch (iconType) {
      case 'yes':
        return <CheckCircle fontSize="small" />;
      case 'no':
        return <Cancel fontSize="small" />;
      case 'help':
        return <Help fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
      {actions.map((action) => (
        <Button
          key={action.value}
          variant="outlined"
          size="small"
          startIcon={getIcon(action.icon)}
          onClick={() => onSelect(action.value)}
          disabled={disabled}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            fontSize: 13,
            px: 2,
            py: 0.5,
          }}
        >
          {action.label}
        </Button>
      ))}
    </Box>
  );
};
