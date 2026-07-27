import { createTheme } from "@mui/material/styles";

/**
 * Thème MUI global de la plateforme ITSM.
 * Toutes les customisations visuelles sont centralisées ici.
 */
export const theme = createTheme({
  // ─── Palette ───────────────────────────────────────────────────────────────
  palette: {
    mode: "light",
    primary: {
      main: "#aa3bff",
      light: "#c47fff",
      dark: "#7b00d4",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#ed6c02",
    },
    success: {
      main: "#2e7d32",
    },
    info: {
      main: "#0288d1",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#08060d",
      secondary: "#6b6375",
    },
    divider: "#e5e4e7",
  },

  // ─── Typography ────────────────────────────────────────────────────────────
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"].join(","),
    h1: { fontSize: "2.5rem", fontWeight: 600, letterSpacing: "-0.02em" },
    h2: { fontSize: "2rem", fontWeight: 600, letterSpacing: "-0.01em" },
    h3: { fontSize: "1.75rem", fontWeight: 600 },
    h4: { fontSize: "1.5rem", fontWeight: 500 },
    h5: { fontSize: "1.25rem", fontWeight: 500 },
    h6: { fontSize: "1rem", fontWeight: 500 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.5 },
    button: { textTransform: "none", fontWeight: 500 },
  },

  // ─── Shape ─────────────────────────────────────────────────────────────────
  shape: {
    borderRadius: 8,
  },

  // ─── Composants overrides ──────────────────────────────────────────────────
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 20px",
          fontWeight: 500,
        },
        contained: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});
