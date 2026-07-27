import { get } from "./api";

interface HealthData {
  status: "OK" | "DEGRADED";
  timestamp: string;
  environment: string;
  uptime: number;
  responseTime: string;
  services: {
    database: "OK" | "ERROR";
    databaseError?: string;
  };
}

/**
 * Vérifie l'état du backend.
 * Appelle GET /api/v1/health
 */
export async function checkHealth(): Promise<HealthData> {
  return get<HealthData>("/health");
}
