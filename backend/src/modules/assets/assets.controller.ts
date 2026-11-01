import { Request, Response } from "express";
import { assetsService } from "./assets.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import type { CreateAssetRequest, UpdateAssetRequest, AssignAssetRequest } from "./assets.types";

export const createAsset = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const body = req.body as CreateAssetRequest;

  if (!body.serialNumber || !body.type || !body.brand || !body.model || !body.location || !body.purchaseDate) {
    throw new ApiError(400, "serialNumber, type, brand, model, location, and purchaseDate are required");
  }

  const asset = await assetsService.create(body, req.user.id, req.user.organizationId);
  res.status(201).json({ success: true, message: "Asset created successfully", data: asset });
});

export const getAllAssets = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const assets = await assetsService.findByOrganization(req.user.organizationId);
  res.json({ success: true, message: "Assets retrieved", data: assets });
});

export const getAssetById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const asset = await assetsService.findById(id);
  res.json({ success: true, message: "Asset retrieved", data: asset });
});

export const updateAsset = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const id = req.params["id"] as string;
  const body = req.body as UpdateAssetRequest;

  const asset = await assetsService.update(id, body, req.user.id);
  res.json({ success: true, message: "Asset updated successfully", data: asset });
});

export const assignAsset = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const id = req.params["id"] as string;
  const body = req.body as AssignAssetRequest;

  if (!body.userId) {
    throw new ApiError(400, "userId is required");
  }

  const asset = await assetsService.assign(id, body, req.user.id);
  res.json({ success: true, message: "Asset assigned successfully", data: asset });
});

export const unassignAsset = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const id = req.params["id"] as string;
  const asset = await assetsService.unassign(id, req.user.id);
  res.json({ success: true, message: "Asset unassigned successfully", data: asset });
});

export const retireAsset = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const id = req.params["id"] as string;
  const { notes } = req.body as { notes?: string };

  const asset = await assetsService.retire(id, req.user.id, notes);
  res.json({ success: true, message: "Asset retired successfully", data: asset });
});

export const getAssetHistory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const history = await assetsService.getHistory(id);
  res.json({ success: true, message: "Asset history retrieved", data: history });
});

export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  await assetsService.delete(id);
  res.json({ success: true, message: "Asset deleted successfully" });
});

export const getAssetStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const stats = await assetsService.getStats(req.user.organizationId);
  res.json({ success: true, message: "Asset stats retrieved", data: stats });
});
