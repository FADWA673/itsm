import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from '../services/i18n.service';

export const LanguageSelector = () => {
  const { language, setLanguage, availableLanguages } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (langCode: string) => {
    setLanguage(langCode as any);
    handleClose();
    window.location.reload(); // Reload to apply language changes
  };

  const currentLanguage = availableLanguages.find(l => l.code === language);

  return (
    <Box>
      <Button
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        sx={{
          textTransform: 'none',
          color: '#6B7280',
          '&:hover': { bgcolor: '#F3F4F6' },
        }}
      >
        {currentLanguage?.flag} {currentLanguage?.name}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 200,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        }}
      >
        {availableLanguages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            selected={lang.code === language}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 20 }}>{lang.flag}</Typography>
              <Typography sx={{ fontSize: 14 }}>{lang.name}</Typography>
            </Box>
            {lang.code === language && (
              <CheckIcon sx={{ fontSize: 18, color: '#059669' }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
