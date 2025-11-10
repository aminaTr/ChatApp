import cors from "cors";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import { PORT, MONGO_URI } from "../config/env.js";
import { corsOptions } from "../config/cors.js";
import { registerSocketEvents } from "./socketManager.js";
import { log } from "../utils/logger.js";
import { setIo } from "./ioInstance.js";

import authRoutes from "../routes/auth.js";
import roomRoutes from "../routes/rooms.js";

export async function createServer() {
  const app = express();
  const server = http.createServer(app);

  // ✅ Apply CORS for Express
  app.use(cors(corsOptions));   
  app.use(express.json());

  // ✅ Register REST routes
  app.use("/api", authRoutes);
  app.use("/api/rooms", roomRoutes);

  // --- Connect MongoDB ---
  mongoose.connect(MONGO_URI, { autoIndex: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
      console.error("MongoDB connect error", err);
      process.exit(1);
    });

  // --- Setup Socket.io ---
  setIo(server).then((io) => {
  io.on("connection", (socket) => registerSocketEvents(io, socket));
});

  server.listen(PORT, () => log(`Signaling server running on port ${PORT}`));
}
