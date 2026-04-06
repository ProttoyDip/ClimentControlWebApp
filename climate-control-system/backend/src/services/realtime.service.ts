import { Server as SocketIOServer } from "socket.io";
import { Device } from "../models/device.model";
import { SensorData } from "../models/sensorData.model";

let io: SocketIOServer | null = null;

export function setSocketServer(socketServer: SocketIOServer) {
  io = socketServer;
}

export function emitSensorUpdate(reading: Partial<SensorData>) {
  if (!io) return;
  io.emit("sensor:update", reading);
}

export function emitDeviceStatus(device: Partial<Device>) {
  if (!io) return;
  io.emit("device:update", device);
}

export function emitAlert(event: {
  type: "warning" | "error";
  title: string;
  message: string;
  deviceId: number;
  payload?: Record<string, unknown>;
}) {
  if (!io) return;
  io.emit("alert", {
    ...event,
    timestamp: new Date().toISOString()
  });
}
