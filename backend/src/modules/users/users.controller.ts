import { Request, Response } from "express";
import { usersService } from "./users.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import type { CreateUserRequest, ChangePasswordRequest, UpdateProfileRequest } from "./users.types";

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const users = await usersService.findAll(req.user.organizationId);
  res.json({ success: true, message: "Users retrieved", data: users });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const body = req.body as CreateUserRequest;

  if (!body.email || !body.password || !body.firstName || !body.lastName || !body.role) {
    throw new ApiError(400, "email, password, firstName, lastName and role are required");
  }

  const user = await usersService.create(body, req.user.organizationId);
  res.status(201).json({ success: true, message: "User created successfully", data: user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const user = await usersService.update(id, req.body as Partial<{ firstName: string; lastName: string; role: string; status: string }>);
  res.json({ success: true, message: "User updated", data: user });
});

export const resetUserPassword = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const { password } = req.body as { password: string };
  if (!password || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }
  await usersService.resetPassword(id, password);
  res.json({ success: true, message: "Password reset successfully" });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  await usersService.delete(id);
  res.json({ success: true, message: "User deleted" });
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const user = await usersService.deactivate(id);
  res.json({ success: true, message: "User deactivated", data: user });
});

// ─── Profile (self-service) ────────────────────────────────────────────────────

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const profile = await usersService.getMe(req.user.id);
  res.json({ success: true, message: "Profile retrieved", data: profile });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const body = req.body as UpdateProfileRequest;
  const profile = await usersService.updateMe(req.user.id, body);
  res.json({ success: true, message: "Profile updated successfully", data: profile });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const { currentPassword, newPassword } = req.body as ChangePasswordRequest;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "currentPassword and newPassword are required");
  }

  await usersService.changePassword(req.user.id, currentPassword, newPassword);
  res.json({ success: true, message: "Password changed successfully" });
});
