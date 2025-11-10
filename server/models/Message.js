// server/models/Message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
  userId: { type: String, required: true }, 
  username: { type: String }, // display name (copied at send-time)
  text: { type: String, required: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now, index: true },
});

export default mongoose.model("Message", MessageSchema);
