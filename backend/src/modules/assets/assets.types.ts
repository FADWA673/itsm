export interface CreateAssetRequest {
  serialNumber: string;
  type: string;
  brand: string;
  model: string;
  location: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  notes?: string;
}

export interface UpdateAssetRequest {
  type?: string;
  brand?: string;
  model?: string;
  status?: string;
  location?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  notes?: string;
}

export interface AssignAssetRequest {
  userId: string;
}

export interface AssetResponse {
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

export interface AssetHistoryResponse {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  notes: string | null;
  performedBy: string;
  createdAt: string;
}
