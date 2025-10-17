import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

const router = Router();
const SALT_ROUNDS = 10;

// Get all players
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("name");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * Create player
 * - Accepts: { name, username?, password? }
 * - If username not provided -> use name as username
 * - If password not provided -> server generates a secure random token and returns it in response (one-time)
 * - Stored in DB: password_hash only (never store plaintext)
 */
router.post("/", async (req, res, next) => {
  // Only allow admin (your existing admin protection) to call this endpoint
  const { name, username, password } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Player name required" });
  }

  try {
    // Choose username: provided || name
    const usernameToUse = username ?? name;

    // Generate random password if not provided
    const rawPassword =
      password && String(password).length > 0
        ? String(password)
        : crypto.randomBytes(6).toString("hex"); // 12 hex chars

    // Hash password
    const password_hash = await bcrypt.hash(rawPassword, SALT_ROUNDS);

    const id = uuidv4();

    const { data: player, error } = await supabase
      .from("players")
      .insert({
        id,
        name,
        username: usernameToUse,
        password_hash,
      })
      .select()
      .single();

    if (error) throw error;

    // Return created player and the raw password ONLY when the server generated it (or always if you prefer)
    // If admin passed a password, they already know it; we only include it for generated passwords
    const includePasswordInResponse = !password;

    const responsePayload = {
      player,
      ...(includePasswordInResponse ? { generatedPassword: rawPassword } : {}),
    };

    res.status(201).json(responsePayload);
  } catch (err) {
    // Supabase/postgres unique violation commonly gives code '23505'
    // If duplicate name/username occurs, return 409
    const errCode = err?.code ?? err?.status ?? null;
    if (errCode === "23505" || errCode === 23505) {
      return res
        .status(409)
        .json({ error: "Player name/username already exists" });
    }
    next(err);
  }
});

// Update player
router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { name: newName } = req.body;
  if (!newName) {
    return res.status(400).json({ error: "Player name required" });
  }

  try {
    // First, get the current name of the player to check for existence and for updating matches
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("name")
      .eq("id", id)
      .single();

    if (playerError || !player) {
      return res.status(404).json({ error: "Player not found" });
    }
    const oldName = player.name;

    // Update the player's name in the 'players' table
    const { data: updatedPlayer, error: updateError } = await supabase
      .from("players")
      .update({ name: newName })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // If the name has changed, update all occurrences in the 'matches' table
    if (oldName !== newName) {
      const { error: manOfMatchError } = await supabase
        .from("matches")
        .update({ man_of_match: newName })
        .eq("man_of_match", oldName);

      if (manOfMatchError) {
        console.error(
          "Failed to update man_of_match references:",
          manOfMatchError
        );
      }
    }

    res.json(updatedPlayer);
  } catch (err) {
    const errCode = err?.code ?? err?.status ?? null;
    if (errCode === "23505" || errCode === 23505) {
      return res
        .status(409)
        .json({ error: "A player with this name already exists" });
    }
    next(err);
  }
});

/**
 * Reset a player's password (admin-only)
 * POST /api/players/:id/reset-password
 *
 * Generates a secure random password, stores only the bcrypt hash, and returns
 * the plaintext password in the response once so the admin can copy/send it.
 *
 * NOTE: This endpoint should be protected in a production app.
 */
router.post("/:id/reset-password", async (req, res, next) => {
  const { id } = req.params;
  try {
    // Generate a secure random password (12 hex chars)
    const newPlain = crypto.randomBytes(6).toString("hex");
    const newHash = await bcrypt.hash(newPlain, SALT_ROUNDS);

    const { data: updated, error } = await supabase
      .from("players")
      .update({ password_hash: newHash })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!updated) return res.status(404).json({ error: "Player not found" });

    // Return the generated plaintext once (admin should copy/send it)
    return res.json({ player: updated, generatedPassword: newPlain });
  } catch (err) {
    next(err);
  }
});

// Delete player
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const { error, count } = await supabase
      .from("players")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) throw error;

    if (count === 0) {
      return res.status(404).json({ error: "Player not found" });
    }
    res.status(200).json({ message: "Player deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// Get all player stats
router.get("/stats/all", async (req, res, next) => {
  try {
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select(
        "id, name, created_at, match_player_stats(*, matches(winner, man_of_match))"
      );

    if (playersError) throw playersError;

    const stats = players.map((row) => ({
      player: { id: row.id, name: row.name, created_at: row.created_at },
      totalMatches: [...new Set(row.match_player_stats.map((s) => s.match_id))]
        .length,
      totalRuns: row.match_player_stats.reduce((sum, s) => sum + s.runs, 0),
      totalWickets: row.match_player_stats.reduce(
        (sum, s) => sum + s.wickets,
        0
      ),
      ones: row.match_player_stats.reduce((sum, s) => sum + s.ones, 0),
      twos: row.match_player_stats.reduce((sum, s) => sum + s.twos, 0),
      threes: row.match_player_stats.reduce((sum, s) => sum + s.threes, 0),
      fours: row.match_player_stats.reduce((sum, s) => sum + s.fours, 0),
      sixes: row.match_player_stats.reduce((sum, s) => sum + s.sixes, 0),
      totalWins: row.match_player_stats.filter(
        (s) => s.matches && s.matches.winner === s.team
      ).length,
      manOfMatchCount: row.match_player_stats.filter(
        (s) => s.matches && s.matches.man_of_match === row.name
      ).length,
    }));

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// GET route for a single player's stats by ID
router.get("/stats/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data: player, error } = await supabase
      .from("players")
      .select("id, name, match_player_stats(*, matches(winner, man_of_match))")
      .eq("id", id)
      .single();

    if (error || !player) {
      return res.status(404).json({ error: "Player not found" });
    }

    const stats = {
      totalRuns: player.match_player_stats.reduce((sum, s) => sum + s.runs, 0),
      totalWickets: player.match_player_stats.reduce(
        (sum, s) => sum + s.wickets,
        0
      ),
      totalMatches: [
        ...new Set(player.match_player_stats.map((s) => s.match_id)),
      ].length,
      totalWins: player.match_player_stats.filter(
        (s) => s.matches && s.matches.winner === s.team
      ).length,
      manOfMatchCount: player.match_player_stats.filter(
        (s) => s.matches && s.matches.man_of_match === player.name
      ).length,
    };

    res.json({
      player: { id: player.id, name: player.name },
      totalRuns: stats.totalRuns,
      totalWickets: stats.totalWickets,
      totalMatches: stats.totalMatches,
      totalWins: stats.totalWins,
      manOfMatchCount: stats.manOfMatchCount,
    });
  } catch (err) {
    next(err);
  }
});

// Get player match history
router.get("/:id/history", async (req, res, next) => {
  const { id } = req.params;
  try {
    // Fetch match_player_stats rows for the player and include match metadata using Supabase relationship
    const { data, error } = await supabase
      .from("match_player_stats")
      .select("*, matches(*)")
      .eq("player_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Respond with the raw rows containing both stat and match info
    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

export default router;