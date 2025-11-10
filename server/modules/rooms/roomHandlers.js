// server/modules/rooms/roomHandlers.js
import Room from "../../models/Room.js";
import { log } from "../../utils/logger.js";
import Message from "../../models/Message.js";
import DOMPurify from "isomorphic-dompurify"; // sanitize messages to prevent injection
import User from "../../models/User.js";


/**
 * Handles room join/leave/chat logic based on userId
 */
export function registerRoomHandlers(io, socket) {
  const { userId } = socket;

    // --- Join a room ---
socket.on("join-room", async ({ roomId }, callback) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return callback({ status: "error", message: "Room not found" });

    // Already in same room?
    if (socket.currentRoom === roomId) {
      return callback({ status: "error", message: "Already in this room" });
    }

    // Already in another room?
    if (socket.currentRoom) {
      return callback({
        status: "error",
        message: `Leave your current room before joining another.`,
      });
    }
    if (room.status === "inactive" && room.creator.toString() === userId) {
      
      return callback({ status: "error", message: "You are the creator. Make the room live to join." });
    }

    // --- Lobby Logic ---
    if (room.status === "inactive" && userId !== room.creator.toString()) {
      if (!room.lobby.includes(userId)) {
        room.lobby.push(userId);
        await room.save();

      }
        socket.userId = userId;
        socket.roomId = room._id;
      
      log(`🕓 ${userId} entered lobby for room ${roomId}`);
      return socket.emit("lobby", { message: "Waiting in lobby for room to go live..." });
    }

    // --- Join Active Room ---
    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
      await room.save();
    }

    socket.join(roomId);
    socket.currentRoom = roomId;

    const otherParticipants = room.participants.filter(id => id.toString() !== userId);

    // Notify other users in the room
    socket.emit("existing-participants", otherParticipants);
    socket.to(roomId).emit("user-joined", { userId });
    callback({ status: "joined", participants: otherParticipants });

    log(`✅ ${userId} joined room ${roomId}`);

    // --- Fetch chat messages after this user joined ---
    const messages = await Message.find({
      roomId,
    }).sort({ createdAt: 1 });

    socket.emit("messages", messages.map(msg => ({
      _id: msg._id,
      roomId: msg.roomId,
      userId: msg.userId,
      username: msg.username,
      message: msg.text,
      createdAt: msg.createdAt,
    })));
  } catch (err) {
    console.error(err);
    callback({ status: "error", message: "Failed to join room" });
  }
});

  // --- Leave room ---
  socket.on("leave-room", async (callback) => {
    try {
      const roomId = socket.currentRoom;
      if (!roomId) return callback({ status: "error", message: "Not in any room" });

      const room = await Room.findById(roomId);
      if (!room) return callback({ status: "error", message: "Room not found" });

      // Remove participant
      room.participants = room.participants.filter(id => id.toString() !== userId);
      await room.save();

      // Leave socket.io room
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", { userId });

      socket.currentRoom = null;

      log(`🚪 ${userId} left room ${roomId}`);
      callback({ status: "left", roomId });
    } catch (err) {
      console.error(err);
      callback({ status: "error", message: "Failed to leave room" });
    }
  });

// --- Chat messages in room ---
socket.on("send-message", async ({ roomId, message }) => {
  if (!roomId || !message?.trim()) return;
  const user = await User.findById(userId); 
  const username = user?.displayName;
  if (!username) return;
  try {
    // sanitize message
    const cleanMessage = DOMPurify.sanitize(message);

    // save to DB
    const savedMessage = await Message.create({
      roomId,
      userId,       
      username,     
      text: cleanMessage,
    });

    // emit to everyone in the room
    io.to(roomId).emit("receive-message", {
      _id: savedMessage._id,
      roomId: savedMessage.roomId,
      userId: savedMessage.userId,
      username: savedMessage.username,
      message: savedMessage.text,
      createdAt: savedMessage.createdAt,
    });

    log(`💬 ${userId} → room ${roomId}: ${cleanMessage}`);
  } catch (err) {
    console.error("Failed to send message:", err);
    socket.emit("error-message", { error: "Failed to send message" });
  }
});


  // --- Chat messages in room ---
  // socket.on("send-message", ({ roomId, message }) => {
  //   if (!roomId || !message?.trim()) return;
  //   io.to(roomId).emit("receive-message", {
  //     userId,
  //     message,
  //     timestamp: Date.now(),
  //   });

  //   log(`💬 ${userId} → room ${roomId}: ${message}`);
  // });
}
