import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useThemeStore, useAuthStore } from "../../store";

interface HeaderProps {
  onMenuToggle: () => void;
  drawerWidth: number;
}

/**
 * Barre de navigation supérieure.
 * Contient : bouton menu mobile, titre, toggle dark mode, avatar utilisateur.
 */
function Header({ onMenuToggle, drawerWidth }: HeaderProps) {
  const { mode, toggleMode } = useThemeStore();
  const { user } = useAuthStore();

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "?";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        {/* Bouton menu — visible uniquement sur mobile */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Titre */}
        <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
          ITSM Platform
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          {/* Toggle dark / light mode */}
          <Tooltip title={mode === "dark" ? "Mode clair" : "Mode sombre"}>
            <IconButton onClick={toggleMode} color="inherit">
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* Avatar utilisateur */}
          <Tooltip title={user ? `${user.firstName} ${user.lastName}` : ""}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: "primary.main",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              {initials}
            </Avatar>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
