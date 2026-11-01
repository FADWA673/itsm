import { apiClient } from "./api";

export interface Asset {
  id: string;
  serialNumber: string;
  type: string;
  brand: string;
  model: string;
  status: string;
  location: string;
  purchaseDate: string;
  warrantyExpiry: string | null;
  notes: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  ticketCount?: number;
}

export interface AssetHistory {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  notes: string | null;
  performedBy: string;
  createdAt: string;
}

export interface CreateAssetData {
  serialNumber: string;
  type: string;
  brand: string;
  model: string;
  location: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  notes?: string;
}

export interface UpdateAssetData {
  type?: string;
  brand?: string;
  model?: string;
  status?: string;
  location?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  notes?: string;
}

export const assetsService = {
  // Récupérer tous les actifs
  async getAll(): Promise<Asset[]> {
    const response = await apiClient.get("/assets");
    return response.data.data;
  },

  // Récupérer un actif par ID
  async getById(id: string): Promise<Asset> {
    const response = await apiClient.get(`/assets/${id}`);
    return response.data.data;
  },

  // Créer un nouvel actif
  async create(data: CreateAssetData): Promise<Asset> {
    const response = await apiClient.post("/assets", data);
    return response.data.data;
  },

  // Mettre à jour un actif
  async update(id: string, data: UpdateAssetData): Promise<Asset> {
    const response = await apiClient.put(`/assets/${id}`, data);
    return response.data.data;
  },

  // Assigner un actif à un utilisateur
  async assign(id: string, userId: string): Promise<Asset> {
    const response = await apiClient.post(`/assets/${id}/assign`, { userId });
    return response.data.data;
  },

  // Désassigner un actif
  async unassign(id: string): Promise<Asset> {
    const response = await apiClient.post(`/assets/${id}/unassign`);
    return response.data.data;
  },

  // Retirer un actif
  async retire(id: string, notes?: string): Promise<Asset> {
    const response = await apiClient.post(`/assets/${id}/retire`, { notes });
    return response.data.data;
  },

  // Récupérer l'historique d'un actif
  async getHistory(id: string): Promise<AssetHistory[]> {
    const response = await apiClient.get(`/assets/${id}/history`);
    return response.data.data;
  },

  // Supprimer un actif
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/assets/${id}`);
  },

  // Récupérer les statistiques
  async getStats(): Promise<any> {
    const response = await apiClient.get("/assets/stats");
    return response.data.data;
  },
};
