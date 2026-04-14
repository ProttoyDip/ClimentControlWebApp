import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { SensorReading } from "../types";

interface LandingTelemetryState {
  temperature: number | null;
  humidity: number | null;
  updatedAt: string | null;
  live: boolean;
}

function normalizeReading(reading: SensorReading): LandingTelemetryState {
  return {
    temperature: Number(reading.temperature),
    humidity: Number(reading.humidity),
    updatedAt: reading.recorded_at,
    live: true
  };
}

const fallbackState: LandingTelemetryState = {
  temperature: null,
  humidity: null,
  updatedAt: null,
  live: false
};

export function useLandingTelemetry() {
  const [state, setState] = useState<LandingTelemetryState>(fallbackState);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await api.get("/sensors/latest?limit=1");
        const reading = (response.data?.data?.[0] ?? null) as SensorReading | null;
        if (cancelled) return;

        if (!reading) {
          setState(fallbackState);
          return;
        }

        setState(normalizeReading(reading));
      } catch {
        if (cancelled) return;
        setState(fallbackState);
      }
    };

    void load();
    const interval = setInterval(load, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return state;
}