// routes/rooms.js
import express from "express";
import Room from "../models/Room.js";
import authMiddleware from "../middleware/auth.js";
import { getIo } from "../core/ioInstance.js";

const router = express.Router();

// Create room
router.post("/", authMiddleware, async (req, res) => {
  const io = getIo();
  const { name, isPrivate, accessCode } = req.body;
  const room = await Room.create({
    name,
    creator: req.user.id,
    isPrivate,
    accessCode: isPrivate ? accessCode : undefined
  });
  const populatedRoom = await room.populate("creator", "displayName email");
  const safeRoom = populatedRoom.toObject();
  delete safeRoom.accessCode;
  io.emit("room-created", safeRoom);
  res.json(room);
  
});

// Make room live
router.post("/:id/live", authMiddleware, async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ error: "Room not found" });
  if (!room.creator.equals(req.user.id))
    return res.status(403).json({ error: "Not authorized" });

  room.status = "live";
  await room.save();

  const io = getIo();
  console.log('server',room)
  // for (const userId of room.lobby) {
  //   io.sockets.sockets.forEach(socket => {
  //     // compare string IDs (important!)
  //     if (String(socket.userId) === String(userId)) {
  //       socket.emit("room-live", { roomId: room._id }); // notify the user
  //     }
  //   });
  // }
  // Notify participants already in lobby
  for (const userId of room.lobby) {
    const sockets = Array.from(io.sockets.sockets.values()).filter(
      (s) =>  String(s.userId) === String(userId));
    sockets.forEach((s) => {
      console.log('notified to ',s.userId)
      s.emit("room-live", { roomId: room._id });
    });
  }

  // Clear lobby
  room.lobby = [];
  await room.save();

  res.json(room);
});

// --- Get all rooms ---
router.get("/", authMiddleware, async (req, res) => {
  try {
    // optionally filter only live rooms: { status: "live" }
    const rooms = await Room.find().populate("creator", "displayName email");
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
