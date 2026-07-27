import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthTokens, Permission } from "../types/auth.types";

interface AuthState {
  // ─── État ────────────────────────────────────────────────────────────────
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // ─── Actions ─────────────────────────────────────────────────────────────
  /**
   * Appelé après un login réussi.
   * Stocke l'utilisateur et les tokens.
   */
  login: (user: User, tokens: AuthTokens) => void;

  /**
   * Appelé après un logout.
   * Efface toutes les données d'authentification.
   */
  logout: () => void;

  /**
   * Met à jour les informations de l'utilisateur connecté.
   */
  setUser: (user: User) => void;

  /**
   * Met à jour les tokens après un refresh.
   */
  setTokens: (tokens: AuthTokens) => void;

  /**
   * Vérifie si l'utilisateur a une permission donnée.
   */
  hasPermission: (permission: Permission) => boolean;

  /**
   * Vérifie si l'utilisateur a un rôle donné.
   */
  hasRole: (role: string) => boolean;
}

/**
 * Store Zustand pour l'authentification.
 * Le token est persisté dans localStorage pour maintenir la session.
 *
 * Usage :
 *   const { user, isAuthenticated, login, logout } = useAuthStore()
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, tokens) =>
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      setUser: (user) => set({ user }),

      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions.includes(permission);
      },

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        return user.role === role;
      },
    }),
    {
      name: "itsm-auth",
      // Ne persister que les tokens, pas les données sensibles complètes
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
