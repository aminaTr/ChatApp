// socket/ioInstance.js
import { VITE_URL } from "../config/env.js";

let io;

export async function setIo (server) {
  const { Server } = await import("socket.io");
   io = new Server(server, {
    cors: {
      origin: [VITE_URL], 
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  return io;
}

export function getIo() {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
}
