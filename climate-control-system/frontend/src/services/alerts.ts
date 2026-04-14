import { api } from "./api";

export interface StoredAlert {
  id: number;
  device_id: number;
  type: "warning" | "error";
  message: string;
  payload_json: string | null;
  created_at: string;
  created_at_unix: number;
}

export async function fetchAlerts(limit = 100) {
  const response = await api.get("/alerts", {
    params: { limit }
  });

  return (response.data?.data ?? []) as StoredAlert[];
}
