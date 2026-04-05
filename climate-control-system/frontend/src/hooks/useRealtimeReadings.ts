import { useEffect } from "react";
import { getSocket } from "../services/socket";
import { SensorReading } from "../types";

export function useRealtimeReadings(onReading: (reading: SensorReading) => void) {
  useEffect(() => {
    const socket = getSocket();
    socket.on("sensor:update", onReading);

    return () => {
      socket.off("sensor:update", onReading);
    };
  }, [onReading]);
}
