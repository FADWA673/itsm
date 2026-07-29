import { post } from "./api";
import type { AuthTokens, User } from "../types/auth.types";

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * POST /api/v1/auth/login
 */
export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  return post<LoginResponse>("/auth/login", { email, password });
}

/**
 * POST /api/v1/auth/logout
 */
export async function logoutApi(): Promise<void> {
  await post("/auth/logout");
}

/**
 * POST /api/v1/auth/refresh
 */
export async function refreshTokenApi(refreshToken: string): Promise<LoginResponse> {
  return post<LoginResponse>("/auth/refresh", { refreshToken });
}

/**
 * POST /api/v1/auth/forgot-password
 */
export async function forgotPasswordApi(email: string): Promise<void> {
  await post("/auth/forgot-password", { email });
}

/**
 * POST /api/v1/auth/reset-password
 */
export async function resetPasswordApi(token: string, password: string): Promise<void> {
  await post("/auth/reset-password", { token, password });
}

export type { LoginResponse, AuthTokens };
