import { io, Socket } from "socket.io-client";
import { Device, SensorReading, SocketAlertEvent } from "../types";

type ServerEvents = {
  "sensor:update": (reading: SensorReading) => void;
  "device:update": (device: Device) => void;
  alert: (alert: SocketAlertEvent) => void;
  connect_error: (error: Error) => void;
};

let socket: Socket<ServerEvents> | null = null;
let currentToken = localStorage.getItem("accessToken");

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

function notifyUnauthorizedSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authUser");
  window.dispatchEvent(new CustomEvent("auth:unauthorized"));
}

export function getSocket(): Socket<ServerEvents> {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    autoConnect: false,
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 7000,
    auth: {
      token: currentToken
    }
  });

  socket.on("connect_error", (error) => {
    console.error("[socket] connect_error", error.message);
    if (error.message.toLowerCase().includes("invalid socket token")) {
      notifyUnauthorizedSession();
      socket?.disconnect();
    }
  });

  socket.io.on("reconnect", (attempt) => {
    console.info("[socket] reconnected", { attempt });
  });

  return socket;
}

export function setSocketAuthToken(token: string | null) {
  currentToken = token;
  const client = getSocket();
  client.auth = { token };
}

export function connectSocket() {
  const client = getSocket();
  if (!client.connected) {
    client.connect();
  }
}

export function disconnectSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
