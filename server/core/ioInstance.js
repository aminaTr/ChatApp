// socket/ioInstance.js
import { corsOptions } from "../config/cors.js";

let io;

export async function setIo (server) {
  const { Server } = await import("socket.io");
  io = new Server(server, {
    cors: corsOptions
  });
  return io;
}

export function getIo() {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
}
