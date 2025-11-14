import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI= process.env.MONGO_URI || "mongodb://localhost:27017/audiochat";
export const JWT_SECRET= process.env.JWT_SECRET
export const VITE_URL=(process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");