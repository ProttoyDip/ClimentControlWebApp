import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (socket) {
    return socket;
  }

  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000", {
    transports: ["websocket", "polling"]
  });

  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
