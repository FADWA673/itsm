import { Request, Response } from "express";
import { usersService } from "./users.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import type { CreateUserRequest } from "./users.types";

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

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const user = await usersService.deactivate(id);
  res.json({ success: true, message: "User deactivated", data: user });
});
