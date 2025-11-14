import { VITE_URL } from "./env.js"
export const corsOptions = {
  origin: VITE_URL, // Vite app URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
