// routes/auth.js
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post("/register", async (req, res) => {
  try {
    const { displayName, email, password } = req.body;
    if (!displayName || !displayName.trim()) {
      return res.status(400).json({ error: "Display name is required" });
    }
    const trimmedDisplayName = displayName.trim()
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(displayName)) {
      return res
        .status(400)
        .json({ error: "Display name should not contain numbers or special characters" });
    }

    if (trimmedDisplayName.length > 12 ){
      return res.status(400).json({ error: "Display name must be less than or equal to 12 characters" });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (email.length > 20 ){
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (!password || !isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
      });
    }
    if (password.length > 13 ){
      return res.status(400).json({ error: "Invalid password" });
    }

    const user = await User.create({ displayName:trimmedDisplayName, email, password });
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ user, token });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "No user account with this email." });
    if (!(await user.comparePassword(password)))
      return res.status(400).json({ error: "Invalid password." });
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ user, token });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isStrongPassword = (password) => {
  // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

export const getUser = async (userId) => {
  if (!userId) return null; // optional check

  try {
    const user = await User.findById(userId).select("displayName");
    return user ? user.displayName : null;
  } catch (err) {
    console.error("Error fetching user:", err);
    return null;
  }
};


export default router;
