import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "../config/env";
import { setSocketServer } from "../services/realtime.service";
import { logger } from "../utils/logger";

export function createSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.SOCKET_CORS_ORIGIN,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    logger("info", "Socket client connected", { socketId: socket.id });

    socket.on("disconnect", () => {
      logger("info", "Socket client disconnected", { socketId: socket.id });
    });
  });

  setSocketServer(io);
  return io;
}
