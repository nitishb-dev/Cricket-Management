import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { supabase } from "../db.js";
import { authenticateToken } from "./auth.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all players for the authenticated admin's club
router.get("/", async (req, res, next) => {
  try {
    const { clubId } = req.user;
    
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("club_id", clubId)
      .order("name");
      
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Generate random password for players
const generatePlayerPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Create player for the authenticated admin's club
router.post("/", async (req, res, next) => {
  const { name } = req.body;
  const { clubId } = req.user;
  
  if (!name) {
    return res.status(400).json({ error: "Player name required" });
  }

  try {
    const id = uuidv4();
    
    // Generate username and password for player
    const username = name.toLowerCase().replace(/\s+/g, '.');
    const password = generatePlayerPassword();
    const passwordHash = await bcrypt.hash(password, 10);
    
    const { data: player, error } = await supabase
      .from("players")
      .insert({ 
        id, 
        name, 
        club_id: clubId,
        username,
        password_hash: passwordHash
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      player,
      generatedPassword: password // Return password only during creation
    });
  } catch (err) {
    // Handle unique constraint violation (player name already exists in club)
    if (err.code === "23505") {
      return res.status(409).json({ error: "Player already exists in your club" });
    }
    next(err);
  }
});

// Update player (only if belongs to admin's club)
router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { name: newName } = req.body;
  const { clubId } = req.user;
  
  if (!newName) {
    return res.status(400).json({ error: "Player name required" });
  }

  try {
    // First, verify player belongs to admin's club and get current name
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("name")
      .eq("id", id)
      .eq("club_id", clubId)
      .single();

    if (playerError || !player) {
      return res.status(404).json({ error: "Player not found in your club" });
    }
    
    const oldName = player.name;

    // Update the player's name
    const { data: updatedPlayer, error: updateError } = await supabase
      .from("players")
      .update({ name: newName })
      .eq("id", id)
      .eq("club_id", clubId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update man_of_match references in matches for this club
    if (oldName !== newName) {
      const { error: manOfMatchError } = await supabase
        .from("matches")
        .update({ man_of_match: newName })
        .eq("man_of_match", oldName)
        .eq("club_id", clubId);

      if (manOfMatchError) {
        console.error("Failed to update man_of_match references:", manOfMatchError);
      }
    }

    res.json(updatedPlayer);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ 
        error: "A player with this name already exists in your club" 
      });
    }
    next(err);
  }
});

// Delete player (only if belongs to admin's club)
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { clubId } = req.user;
  
  try {
    const { error, count } = await supabase
      .from("players")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("club_id", clubId);

    if (error) throw error;

    if (count === 0) {
      return res.status(404).json({ error: "Player not found in your club" });
    }
    
    res.status(200).json({ message: "Player deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// Get all player stats for the authenticated admin's club
router.get("/stats/all", async (req, res, next) => {
  try {
    const { clubId } = req.user;
    
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select(`
        id, 
        name, 
        created_at, 
        match_player_stats!inner(
          *, 
          matches!inner(winner, man_of_match)
        )
      `)
      .eq("club_id", clubId)
      .eq("match_player_stats.club_id", clubId)
      .eq("match_player_stats.matches.club_id", clubId);

    if (playersError) throw playersError;

    const stats = players.map((row) => ({
      player: { id: row.id, name: row.name, created_at: row.created_at },
      totalMatches: [...new Set(row.match_player_stats.map((s) => s.match_id))].length,
      totalRuns: row.match_player_stats.reduce((sum, s) => sum + s.runs, 0),
      totalWickets: row.match_player_stats.reduce((sum, s) => sum + s.wickets, 0),
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

// Get single player stats (only if belongs to admin's club)
router.get("/stats/:id", async (req, res, next) => {
  const { id } = req.params;
  const { clubId } = req.user;
  
  try {
    const { data: player, error } = await supabase
      .from("players")
      .select(`
        id, 
        name, 
        match_player_stats!inner(
          *, 
          matches!inner(winner, man_of_match)
        )
      `)
      .eq("id", id)
      .eq("club_id", clubId)
      .eq("match_player_stats.club_id", clubId)
      .eq("match_player_stats.matches.club_id", clubId)
      .single();

    if (error || !player) {
      return res.status(404).json({ error: "Player not found in your club" });
    }

    const stats = {
      totalRuns: player.match_player_stats.reduce((sum, s) => sum + s.runs, 0),
      totalWickets: player.match_player_stats.reduce((sum, s) => sum + s.wickets, 0),
      totalMatches: [...new Set(player.match_player_stats.map((s) => s.match_id))].length,
      totalWins: player.match_player_stats.filter(
        (s) => s.matches && s.matches.winner === s.team
      ).length,
      manOfMatchCount: player.match_player_stats.filter(
        (s) => s.matches && s.matches.man_of_match === player.name
      ).length,
    };

    res.json({
      player: { id: player.id, name: player.name },
      ...stats
    });
  } catch (err) {
    next(err);
  }
});

// Get player match history (only if belongs to admin's club)
router.get("/:id/history", async (req, res, next) => {
  const { id } = req.params;
  const { clubId } = req.user;
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
  
  try {
    // First, verify player belongs to admin's club
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id")
      .eq("id", id)
      .eq("club_id", clubId)
      .single();

    if (playerError || !player) {
      return res.status(404).json({ error: "Player not found in your club" });
    }

    // Get player's match history
    let query = supabase
      .from("match_player_stats")
      .select(`
        *,
        matches!inner(
          id,
          team_a_name,
          team_b_name,
          team_a_score,
          team_a_wickets,
          team_b_score,
          team_b_wickets,
          winner,
          man_of_match,
          match_date,
          overs
        )
      `)
      .eq("player_id", id)
      .eq("club_id", clubId)
      .eq("matches.club_id", clubId)
      .order("matches(match_date)", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Get player detailed statistics (only if belongs to admin's club)
router.get("/:id/detailed-stats", async (req, res, next) => {
  const { id } = req.params;
  const { clubId } = req.user;
  
  try {
    // First, verify player belongs to admin's club
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id, name")
      .eq("id", id)
      .eq("club_id", clubId)
      .single();

    if (playerError || !player) {
      return res.status(404).json({ error: "Player not found in your club" });
    }

    // Get detailed stats
    const { data: stats, error: statsError } = await supabase
      .from("match_player_stats")
      .select(`
        *,
        matches!inner(winner, man_of_match, match_date)
      `)
      .eq("player_id", id)
      .eq("club_id", clubId)
      .eq("matches.club_id", clubId);

    if (statsError) throw statsError;

    // Calculate detailed statistics
    const totalMatches = [...new Set(stats.map(s => s.match_id))].length;
    const totalRuns = stats.reduce((sum, s) => sum + s.runs, 0);
    const totalWickets = stats.reduce((sum, s) => sum + s.wickets, 0);
    const totalWins = stats.filter(s => s.matches && s.matches.winner === s.team).length;
    const manOfMatchCount = stats.filter(s => s.matches && s.matches.man_of_match === player.name).length;
    
    // Calculate averages and other metrics
    const battingAverage = totalMatches > 0 ? (totalRuns / totalMatches).toFixed(2) : "0.00";
    const bowlingAverage = totalWickets > 0 ? (totalRuns / totalWickets).toFixed(2) : "N/A";
    const winPercentage = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) : "0.0";

    // Boundary statistics
    const boundaries = {
      ones: stats.reduce((sum, s) => sum + s.ones, 0),
      twos: stats.reduce((sum, s) => sum + s.twos, 0),
      threes: stats.reduce((sum, s) => sum + s.threes, 0),
      fours: stats.reduce((sum, s) => sum + s.fours, 0),
      sixes: stats.reduce((sum, s) => sum + s.sixes, 0)
    };

    res.json({
      player: { id: player.id, name: player.name },
      totalMatches,
      totalRuns,
      totalWickets,
      totalWins,
      manOfMatchCount,
      battingAverage,
      bowlingAverage,
      winPercentage: `${winPercentage}%`,
      boundaries,
      recentMatches: stats.slice(0, 5) // Last 5 matches
    });
  } catch (err) {
    next(err);
  }
});

// Reset player password (only if belongs to admin's club)
router.post("/:id/reset-password", async (req, res, next) => {
  const { id } = req.params;
  const { clubId } = req.user;
  
  try {
    // First, verify player belongs to admin's club
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("name, username")
      .eq("id", id)
      .eq("club_id", clubId)
      .single();

    if (playerError || !player) {
      return res.status(404).json({ error: "Player not found in your club" });
    }

    // Generate new password
    const newPassword = generatePlayerPassword();
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const { data: updatedPlayer, error: updateError } = await supabase
      .from("players")
      .update({ password_hash: passwordHash })
      .eq("id", id)
      .eq("club_id", clubId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      player: updatedPlayer,
      generatedPassword: newPassword
    });
  } catch (err) {
    next(err);
  }
});

export default router;