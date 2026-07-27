import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaletteMode } from "@mui/material/styles";

interface ThemeState {
  mode: PaletteMode;
  toggleMode: () => void;
  setMode: (mode: PaletteMode) => void;
}

/**
 * Store Zustand pour la gestion du thème light/dark.
 * Le choix est persisté dans localStorage — l'utilisateur retrouve son
 * préférence après un rechargement de page.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "light",

      toggleMode: () =>
        set((state) => ({
          mode: state.mode === "light" ? "dark" : "light",
        })),

      setMode: (mode: PaletteMode) => set({ mode }),
    }),
    {
      name: "itsm-theme", // clé localStorage
    }
  )
);
