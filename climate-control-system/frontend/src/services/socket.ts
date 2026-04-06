import { io, Socket } from "socket.io-client";
import { Device, SensorReading } from "../types";

type ServerEvents = {
  "sensor:update": (reading: SensorReading) => void;
  "device:update": (device: Device) => void;
  connect_error: (error: Error) => void;
};

let socket: Socket<ServerEvents> | null = null;

export function getSocket(): Socket<ServerEvents> {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000", {
    transports: ["websocket", "polling"],
    autoConnect: true,
    auth: {
      token: localStorage.getItem("accessToken")
    }
  });

  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
