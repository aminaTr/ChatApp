import { log } from "../../utils/logger.js";

/**
 * Handles WebRTC signaling events using userId instead of socket.id.
 * @param {Server} io - Socket.IO server instance
 * @param {Socket} socket - The connected socket
 * @param {Map<string, Socket>} userSockets - Map of userId -> socket
 */
export function registerSignalingHandlers(io, socket, userSockets) {
  const { userId } = socket;

  // --- Offer ---
  socket.on("send-offer", ({ targetId, offer }) => {
    const targetSocket = userSockets.get(targetId);
    if (!targetSocket) {
      log(`❌ Offer target ${targetId} not connected.`);
      return;
    }

    log(`📡 Offer from user ${userId} → ${targetId}`);
    targetSocket.emit("receive-offer", {
      from: userId,
      offer
    });
  });

  // --- Answer ---
  socket.on("send-answer", ({ targetId, answer }) => {
    const targetSocket = userSockets.get(targetId);
    if (!targetSocket) {
      log(`❌ Answer target ${targetId} not connected.`);
      return;
    }

    log(`📡 Answer from user ${userId} → ${targetId}`);
    targetSocket.emit("receive-answer", {
      from: userId,
      answer
    });
  });

  // --- ICE Candidate ---
  socket.on("ice-candidate", ({ targetId, candidate }) => {
    const targetSocket = userSockets.get(targetId);
    if (!targetSocket) {
      log(`❌ ICE target ${targetId} not connected.`);
      return;
    }

    targetSocket.emit("ice-candidate", {
      from: userId,
      candidate
    });
  });
}
