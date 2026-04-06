import { Server as HttpServer } from "node:http";
import jwt from "jsonwebtoken";
import { Server as SocketIOServer } from "socket.io";
import { env } from "../config/env";
import { setSocketServer } from "../services/realtime.service";
import { logger } from "../utils/logger";

export function createSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.SOCKET_CORS_ORIGIN.split(",").map((origin) => origin.trim()),
      methods: ["GET", "POST"]
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next();
    }

    try {
      jwt.verify(token, env.JWT_ACCESS_SECRET);
      return next();
    } catch {
      return next(new Error("Invalid socket token"));
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
