import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../db.js";

const router = Router();

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

// Create player
router.post("/", async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Player name required" });
  }

  try {
    const id = uuidv4();
    const { data: player, error } = await supabase
      .from("players")
      .insert({ id, name })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(player);
  } catch (err) {
    // 23505 is the code for unique violation in PostgreSQL
    if (err.code === "23505") {
      return res.status(409).json({ error: "Player already exists" });
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
        // If this fails, we should ideally roll back the player name change.
        // For simplicity here, we'll just log it. In a real app, a transaction would be better.
        console.error(
          "Failed to update man_of_match references:",
          manOfMatchError
        );
      }
    }

    res.json(updatedPlayer);
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ error: "A player with this name already exists" });
    }
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
    // This complex query is best handled by a PostgreSQL function (RPC).
    // For now, we will fetch players and their stats separately and aggregate.
    // This is less efficient but avoids a complex RPC setup for this migration.

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

export default router;
