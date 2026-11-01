import { apiClient } from "./api";

export interface Rating {
  id: string;
  ticketId: string;
  rating: number;
  comment: string | null;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface RatingStatistics {
  totalRatings: number;
  averageRating: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  percentages: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface TechnicianStatistics {
  technicianId: string;
  technicianName: string;
  totalTickets: number;
  averageRating: number;
}

/**
 * Créer une note de satisfaction pour un ticket
 */
export const createRatingApi = async (ticketId: string, rating: number, comment?: string): Promise<Rating> => {
  const response = await apiClient.post(`/tickets/${ticketId}/rate`, {
    rating,
    comment: comment || undefined,
  });
  return response.data.data;
};

/**
 * Récupérer la note d'un ticket
 */
export const getRatingApi = async (ticketId: string): Promise<Rating | null> => {
  try {
    const response = await apiClient.get(`/tickets/${ticketId}/rating`);
    return response.data.data;
  } catch (error) {
    return null;
  }
};

/**
 * Récupérer les statistiques globales de satisfaction
 */
export const getStatisticsApi = async (): Promise<RatingStatistics> => {
  const response = await apiClient.get("/ratings/statistics");
  return response.data.data;
};

/**
 * Récupérer les statistiques par technicien
 */
export const getTechnicianStatisticsApi = async (): Promise<TechnicianStatistics[]> => {
  const response = await apiClient.get("/ratings/statistics/technicians");
  return response.data.data;
};
