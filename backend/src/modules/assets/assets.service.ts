import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import type {
  CreateAssetRequest,
  UpdateAssetRequest,
  AssignAssetRequest,
  AssetResponse,
  AssetHistoryResponse,
} from "./assets.types";

function formatAsset(asset: {
  id: string;
  serialNumber: string;
  type: string;
  brand: string;
  model: string;
  status: string;
  location: string;
  purchaseDate: Date;
  warrantyExpiry: Date | null;
  notes: string | null;
  assignedToId: string | null;
  assignedTo: { firstName: string; lastName: string } | null;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { tickets: number };
}): AssetResponse {
  return {
    id: asset.id,
    serialNumber: asset.serialNumber,
    type: asset.type,
    brand: asset.brand,
    model: asset.model,
    status: asset.status,
    location: asset.location,
    purchaseDate: asset.purchaseDate.toISOString(),
    warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.toISOString() : null,
    notes: asset.notes,
    assignedToId: asset.assignedToId,
    assignedToName: asset.assignedTo
      ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`
      : null,
    organizationId: asset.organizationId,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
    ticketCount: asset._count?.tickets,
  };
}

function formatHistory(history: {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  notes: string | null;
  createdAt: Date;
  performedBy: { firstName: string; lastName: string };
}): AssetHistoryResponse {
  return {
    id: history.id,
    action: history.action,
    oldValue: history.oldValue,
    newValue: history.newValue,
    notes: history.notes,
    performedBy: `${history.performedBy.firstName} ${history.performedBy.lastName}`,
    createdAt: history.createdAt.toISOString(),
  };
}

export class AssetsService {
  /**
   * Créer un nouvel actif
   */
  async create(data: CreateAssetRequest, userId: string, organizationId: string): Promise<AssetResponse> {
    // Vérifier que le serial number n'existe pas déjà
    const existing = await prisma.asset.findUnique({
      where: { serialNumber: data.serialNumber },
    });

    if (existing) {
      throw new ApiError(400, "An asset with this serial number already exists");
    }

    const asset = await prisma.asset.create({
      data: {
        serialNumber: data.serialNumber,
        type: data.type as any,
        brand: data.brand,
        model: data.model,
        location: data.location,
        purchaseDate: new Date(data.purchaseDate),
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
        notes: data.notes,
        status: "AVAILABLE",
        organizationId,
      },
      include: { assignedTo: true },
    });

    // Créer l'historique
    await prisma.assetHistory.create({
      data: {
        assetId: asset.id,
        action: "CREATED",
        newValue: asset.status,
        notes: "Asset created",
        performedById: userId,
      },
    });

    return formatAsset(asset);
  }

  /**
   * Récupérer tous les actifs d'une organisation
   */
  async findByOrganization(organizationId: string): Promise<AssetResponse[]> {
    const assets = await prisma.asset.findMany({
      where: { organizationId },
      include: {
        assignedTo: true,
        _count: { select: { tickets: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return assets.map(formatAsset);
  }

  /**
   * Récupérer un actif par ID
   */
  async findById(id: string): Promise<AssetResponse> {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        _count: { select: { tickets: true } },
      },
    });

    if (!asset) {
      throw new ApiError(404, "Asset not found");
    }

    return formatAsset(asset);
  }

  /**
   * Mettre à jour un actif
   */
  async update(id: string, data: UpdateAssetRequest, userId: string): Promise<AssetResponse> {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Asset not found");
    }

    const updateData: any = {};
    const historyActions: Array<{ action: string; oldValue: string | null; newValue: string | null }> = [];

    // Tracker les changements pour l'historique
    if (data.status && data.status !== existing.status) {
      updateData.status = data.status;
      historyActions.push({
        action: "STATUS_CHANGED",
        oldValue: existing.status,
        newValue: data.status,
      });
    }

    if (data.location && data.location !== existing.location) {
      updateData.location = data.location;
      historyActions.push({
        action: "LOCATION_CHANGED",
        oldValue: existing.location,
        newValue: data.location,
      });
    }

    if (data.type) updateData.type = data.type;
    if (data.brand) updateData.brand = data.brand;
    if (data.model) updateData.model = data.model;
    if (data.purchaseDate) updateData.purchaseDate = new Date(data.purchaseDate);
    if (data.warrantyExpiry) updateData.warrantyExpiry = new Date(data.warrantyExpiry);
    if (data.notes !== undefined) updateData.notes = data.notes;

    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
      include: { assignedTo: true, _count: { select: { tickets: true } } },
    });

    // Créer les entrées d'historique
    for (const historyAction of historyActions) {
      await prisma.assetHistory.create({
        data: {
          assetId: id,
          action: historyAction.action,
          oldValue: historyAction.oldValue,
          newValue: historyAction.newValue,
          performedById: userId,
        },
      });
    }

    return formatAsset(asset);
  }

  /**
   * Assigner un actif à un utilisateur
   */
  async assign(id: string, data: AssignAssetRequest, performedById: string): Promise<AssetResponse> {
    const asset = await prisma.asset.findUnique({ where: { id }, include: { assignedTo: true } });
    if (!asset) {
      throw new ApiError(404, "Asset not found");
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const oldAssignedTo = asset.assignedTo
      ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`
      : null;

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        assignedToId: data.userId,
        status: "ACTIVE",
      },
      include: { assignedTo: true, _count: { select: { tickets: true } } },
    });

    // Créer l'historique
    await prisma.assetHistory.create({
      data: {
        assetId: id,
        action: "ASSIGNED",
        oldValue: oldAssignedTo,
        newValue: `${user.firstName} ${user.lastName}`,
        notes: `Asset assigned to ${user.firstName} ${user.lastName}`,
        performedById,
      },
    });

    return formatAsset(updatedAsset);
  }

  /**
   * Désassigner un actif (libérer)
   */
  async unassign(id: string, performedById: string): Promise<AssetResponse> {
    const asset = await prisma.asset.findUnique({ where: { id }, include: { assignedTo: true } });
    if (!asset) {
      throw new ApiError(404, "Asset not found");
    }

    const oldAssignedTo = asset.assignedTo
      ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`
      : null;

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        assignedToId: null,
        status: "AVAILABLE",
      },
      include: { assignedTo: true, _count: { select: { tickets: true } } },
    });

    // Créer l'historique
    await prisma.assetHistory.create({
      data: {
        assetId: id,
        action: "UNASSIGNED",
        oldValue: oldAssignedTo,
        newValue: null,
        notes: "Asset unassigned and marked as available",
        performedById,
      },
    });

    return formatAsset(updatedAsset);
  }

  /**
   * Retirer un actif (marquer comme RETIRED)
   */
  async retire(id: string, performedById: string, notes?: string): Promise<AssetResponse> {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new ApiError(404, "Asset not found");
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: { status: "RETIRED", assignedToId: null },
      include: { assignedTo: true, _count: { select: { tickets: true } } },
    });

    // Créer l'historique
    await prisma.assetHistory.create({
      data: {
        assetId: id,
        action: "RETIRED",
        oldValue: asset.status,
        newValue: "RETIRED",
        notes: notes || "Asset retired from active use",
        performedById,
      },
    });

    return formatAsset(updatedAsset);
  }

  /**
   * Récupérer l'historique d'un actif
   */
  async getHistory(assetId: string): Promise<AssetHistoryResponse[]> {
    const history = await prisma.assetHistory.findMany({
      where: { assetId },
      include: { performedBy: true },
      orderBy: { createdAt: "desc" },
    });

    return history.map(formatHistory);
  }

  /**
   * Supprimer un actif (soft delete ou hard delete selon besoin)
   */
  async delete(id: string): Promise<void> {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new ApiError(404, "Asset not found");
    }

    // Hard delete (tu peux changer en soft delete avec un champ deletedAt)
    await prisma.asset.delete({ where: { id } });
  }

  /**
   * Obtenir des statistiques sur les actifs
   */
  async getStats(organizationId: string) {
    const totalAssets = await prisma.asset.count({ where: { organizationId } });

    const byStatus = await prisma.asset.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: true,
    });

    const byType = await prisma.asset.groupBy({
      by: ["type"],
      where: { organizationId },
      _count: true,
    });

    return {
      totalAssets,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byType: byType.map((t) => ({ type: t.type, count: t._count })),
    };
  }
}

export const assetsService = new AssetsService();
