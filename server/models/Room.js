// models/Room.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";


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

// Hash access code before saving
roomSchema.pre("save", async function(next) {
  if (!this.isModified("accessCode")) return next();
  const salt = await bcrypt.genSalt(10);
  this.accessCode = await bcrypt.hash(this.accessCode, salt);
  next();
});

// Compare access code
roomSchema.methods.compareAccessCode = async function(accessCode) {
  return await bcrypt.compare(accessCode, this.accessCode);
};


export default mongoose.model("Room", roomSchema);
