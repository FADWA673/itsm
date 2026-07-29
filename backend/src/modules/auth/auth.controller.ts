import { Request, Response } from "express";
import { authService } from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../types/api.types";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ success: false, message: "Email and password are required" });
    return;
  }

  const result = await authService.login(email, password, req.ip);

  const response: ApiResponse = {
    success: true,
    message: "Login successful",
    data: result,
  };
  res.status(200).json(response);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };

  if (!refreshToken) {
    res.status(400).json({ success: false, message: "Refresh token is required" });
    return;
  }

  const result = await authService.refresh(refreshToken);

  res.status(200).json({ success: true, message: "Token refreshed", data: result });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // JWT est stateless — le logout se fait côté client (supprimer le token)
  // En production : implémenter une blacklist de tokens (Redis)
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    message: "If this email exists, a reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };

  if (!token || !password) {
    res.status(400).json({ success: false, message: "Token and password are required" });
    return;
  }

  await authService.resetPassword(token, password);

  res.status(200).json({ success: true, message: "Password reset successfully" });
});
