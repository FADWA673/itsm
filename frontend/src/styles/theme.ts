import { createTheme, type PaletteMode } from "@mui/material/styles";

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Toutes les valeurs de design centralisées ici.
// Modifier ces tokens suffit pour rebrander toute l'application.

export const tokens = {
  colors: {
    primary: {
      main: "#aa3bff",
      light: "#c47fff",
      dark: "#7b00d4",
    },
    secondary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    success: "#2e7d32",
    warning: "#ed6c02",
    error: "#d32f2f",
    info: "#0288d1",
  },
  light: {
    background: "#f5f5f5",
    paper: "#ffffff",
    textPrimary: "#08060d",
    textSecondary: "#6b6375",
    divider: "#e5e4e7",
  },
  dark: {
    background: "#16171d",
    paper: "#1f2028",
    textPrimary: "#f3f4f6",
    textSecondary: "#9ca3af",
    divider: "#2e303a",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"].join(","),
  },
} as const;

// ─── Fonction de création du thème ───────────────────────────────────────────
/**
 * Retourne le thème MUI pour le mode donné.
 * Appelée dans main.tsx avec le mode lu depuis useThemeStore.
 *
 * @param mode - "light" | "dark"
 */
export function getTheme(mode: PaletteMode) {
  const isDark = mode === "dark";
  const surface = isDark ? tokens.dark : tokens.light;

  return createTheme({
    // ─── Mode ────────────────────────────────────────────────────────────────
    palette: {
      mode,
      primary: tokens.colors.primary,
      secondary: tokens.colors.secondary,
      error: { main: tokens.colors.error },
      warning: { main: tokens.colors.warning },
      success: { main: tokens.colors.success },
      info: { main: tokens.colors.info },
      background: {
        default: surface.background,
        paper: surface.paper,
      },
      text: {
        primary: surface.textPrimary,
        secondary: surface.textSecondary,
      },
      divider: surface.divider,
    },

    // ─── Typography ──────────────────────────────────────────────────────────
    typography: {
      fontFamily: tokens.typography.fontFamily,
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

    // ─── Shape ───────────────────────────────────────────────────────────────
    shape: {
      borderRadius: tokens.shape.borderRadius,
    },

    // ─── Composants overrides ─────────────────────────────────────────────────
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, padding: "8px 20px", fontWeight: 500 },
          contained: {
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? "0 1px 3px rgba(0,0,0,0.4)"
              : "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
            borderRadius: 12,
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: "outlined", size: "small" },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 6 } },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? "0 1px 3px rgba(0,0,0,0.4)"
              : "0 1px 3px rgba(0,0,0,0.1)",
            backgroundColor: surface.paper,
            color: surface.textPrimary,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: surface.paper,
            borderRight: `1px solid ${surface.divider}`,
          },
        },
      },
    },
  });
}

// Export du thème light par défaut (pour les cas sans store)
export const theme = getTheme("light");
