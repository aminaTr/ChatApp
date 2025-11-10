import { registerRoomHandlers } from "../modules/rooms/roomHandlers.js";
import { registerSignalingHandlers } from "../modules/signaling/signalingHandlers.js";
import { log } from "../utils/logger.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

// Store active user connections
// userSockets: Map<userId, socket>
const userSockets = new Map();

export function registerSocketEvents(io, socket) {
  const token = socket.handshake.auth?.token;

  // Reject sockets without token
  if (!token) {
    log(`❌ No token provided. Disconnecting socket ${socket.id}`);
    return socket.disconnect();
  }

  let userId;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    userId = payload.id;
    socket.userId = userId;
    log(`✅ Authenticated user ${userId}`);
  } catch (err) {
    log(`❌ Invalid token for socket ${socket.id}`);
    return socket.disconnect();
  }

  // --- Handle duplicate connections (only one socket per user) ---
  const existing = userSockets.get(userId);
  if (existing) {
    log(`⚠️ Duplicate login detected for user ${userId}. Disconnecting old socket.`);
    existing.emit("force-disconnect", { reason: "Duplicate connection" });
    existing.disconnect(true);
  }

  // Register new socket
  userSockets.set(userId, socket);
  log(`🟢 User ${userId} connected.`);

  // Handle disconnect
  socket.on("disconnect", () => {
    const current = userSockets.get(userId);
    if (current === socket) {
      userSockets.delete(userId);
      log(`🔴 User ${userId} disconnected.`);
    }
  });

  // --- Register feature-specific handlers ---
  registerRoomHandlers(io, socket, userSockets);
  registerSignalingHandlers(io, socket, userSockets);
}
