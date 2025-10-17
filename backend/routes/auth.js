import express from "express";
import { supabase } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRY = "8h";

// Player login (POST /api/player/login)
router.post("/player/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  try {
    // normalize username for lookup
    const normalized = String(username).trim().toLowerCase();

    // Query Supabase for the player by username (case-sensitive exact match)
    const { data: player, error } = await supabase
      .from("players")
      .select("id, name, username, password_hash")
      .eq("username", normalized)
      .single();

    if (error || !player) {
      // Keep error message generic
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!player.password_hash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, player.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { sub: player.id, role: "player", name: player.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.json({
      token,
      user: { id: player.id, name: player.name, username: player.username },
    });
  } catch (err) {
    console.error("player login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
