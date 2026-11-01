import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../store";
import type { ApiResponse } from "../types/api.types";

// ─── Configuration de base ────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

/**
 * Instance Axios principale de l'application.
 * Toutes les requêtes vers le backend passent par cette instance.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Intercepteur de requête ──────────────────────────────────────────────────
// Injecte le token JWT dans chaque requête automatiquement
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Intercepteur de réponse ──────────────────────────────────────────────────
// Gestion centralisée des erreurs HTTP
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 — token expiré → logout automatique
    // TODO (ITSM-004) : implémenter le refresh token avant logout
    if (error.response?.status === 401 && !originalRequest._retry) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Normaliser l'erreur en format ApiError
    const apiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "Une erreur est survenue",
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error,
    };

    return Promise.reject(apiError);
  }
);

// ─── Helpers typés ────────────────────────────────────────────────────────────
/**
 * GET typé — retourne directement les données de la réponse.
 *
 * Exemple :
 *   const tickets = await get<Ticket[]>("/tickets")
 */
export async function get<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, { params });
  return response.data.data as T;
}

/**
 * POST typé.
 *
 * Exemple :
 *   const ticket = await post<Ticket>("/tickets", { title: "..." })
 */
export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, data);
  return response.data.data as T;
}

/**
 * PUT typé.
 */
export async function put<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, data);
  return response.data.data as T;
}

/**
 * PATCH typé.
 */
export async function patch<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.patch<ApiResponse<T>>(url, data);
  return response.data.data as T;
}

/**
 * DELETE typé.
 */
export async function del<T>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url);
  return response.data.data as T;
}

// Export par défaut pour compatibilité
export default apiClient;
