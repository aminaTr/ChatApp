// models/Room.js
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPrivate: { type: Boolean, default: false },
  accessCode: { type: String }, // required if private
  status: { type: String, enum: ["inactive", "live"], default: "inactive" },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lobby: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Room", roomSchema);
