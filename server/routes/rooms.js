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

  try {
    // === VALIDATION CHECKS ===

    // 1. Room name required and valid
    if (!name || typeof name !== "string" || name.trim().length < 3 || name.trim().length > 24) {
      return res
        .status(400)
        .json({ error: "Room name must be 3 to 24 characters long." });
    }

    // 2. isPrivate must be boolean
    if (typeof isPrivate !== "boolean") {
      return res
        .status(400)
        .json({ error: "`isPrivate` must be a boolean value." });
    }

    // 3. Access code validation (for private rooms only)
    if (isPrivate) {
      if (!accessCode || typeof accessCode !== "string") {
        return res
          .status(400)
          .json({ error: "Private rooms must include an access code." });
      }

      if (accessCode.trim().length < 4 && accessCode.trim() > 8) {
        return res
          .status(400)
          .json({ error: "Access code must be 4 to 8 characters long." });
      }
    }

    // 4. Check for duplicate room names 
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ error: "Room name already exists." });
    }

    // === ROOM CREATION ===
    const room = await Room.create({
      name: name.trim(),
      creator: req.user.id,
      isPrivate,
      accessCode: isPrivate ? accessCode.trim() : undefined,
    });

    const populatedRoom = await room.populate("creator", "displayName email");
    const safeRoom = populatedRoom.toObject();
    delete safeRoom.accessCode;

    // Notify clients about new room
    io.emit("room-created", safeRoom);

    res.status(201).json(safeRoom);
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Server error creating room." });
  }
});

router.post("/verify-access", authMiddleware, async (req, res) => {
  try {
    const { roomId, accessCode } = req.body;
    console.log(roomId, accessCode)
    // === Validation ===
    if (!roomId || !accessCode) {
      return res.status(400).json({ 
        success: false, 
        message: "Room ID and access code are required." 
      });
    }

    // === Find room ===
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: "Room not found." 
      });
    }

    // === Check if private ===
    if (!room.isPrivate) {
      return res.status(400).json({ 
        success: false, 
        message: "This room is public and doesn't require an access code." 
      });
    }

    // === Compare access code ===  room.accessCode === accessCode.trim()
    if (await room.compareAccessCode(accessCode) ) {
      return res.status(200).json({ 
        success: true, 
        message: "Access granted." 
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid access code." 
      });
    }

  } catch (err) {
    console.error("Error verifying access code:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error verifying access code." 
    });
  }
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
    const rooms = await Room.find().populate("creator", "displayName email");
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

// router.post("/", authMiddleware, async (req, res) => {
//   const io = getIo();
//   const { name, isPrivate, accessCode } = req.body;
//   const room = await Room.create({
//     name,
//     creator: req.user.id,
//     isPrivate,
//     accessCode: isPrivate ? accessCode : undefined
//   });
//   const populatedRoom = await room.populate("creator", "displayName email");
//   const safeRoom = populatedRoom.toObject();
//   delete safeRoom.accessCode;
//   io.emit("room-created", safeRoom);
//   res.json(room);
  
// });