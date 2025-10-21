import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../db.js";

const router = Router();

// Verify Token (middleware for player protected routes)
export const authenticatePlayerToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Ensure this is a player token
    if (decoded.role !== 'player') {
      return res.status(403).json({ error: 'Player access required' });
    }
    
    req.user = decoded;
    next();
  });
};

// Player Login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: "Username and password are required" 
      });
    }

    // Get player with club info
    const { data: player, error } = await supabase
      .from("players")
      .select(`
        id,
        name,
        username,
        password_hash,
        club_id,
        clubs (
          id,
          name
        )
      `)
      .eq("username", username)
      .single();

    if (error || !player) {
      return res.status(401).json({ 
        error: "Invalid username or password" 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, player.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: "Invalid username or password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        playerId: player.id,
        clubId: player.club_id,
        username: player.username,
        role: 'player'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: player.id,
        name: player.name,
        username: player.username,
        clubId: player.club_id,
        clubName: player.clubs.name
      }
    });

  } catch (err) {
    next(err);
  }
});

// Get player profile (same as /me but with different endpoint name for consistency)
router.get("/profile", authenticatePlayerToken, async (req, res, next) => {
  try {
    const { playerId, clubId } = req.user;

    // Get player basic info
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select(`
        id,
        name,
        username,
        club_id,
        created_at,
        date_of_birth,
        country,
        clubs (
          id,
          name
        )
      `)
      .eq("id", playerId)
      .single();

    if (playerError || !player) {
      return res.status(404).json({ error: "Player not found" });
    }

    // Get player's match statistics for additional profile info
    const { data: stats, error: statsError } = await supabase
      .from("match_player_stats")
      .select(`
        match_id,
        team,
        matches!inner(match_date)
      `)
      .eq("player_id", playerId)
      .eq("club_id", clubId)
      .eq("matches.club_id", clubId)
      .order("matches(match_date)", { ascending: true });

    // Calculate additional profile data
    const totalMatches = stats ? [...new Set(stats.map(s => s.match_id))].length : 0;
    const firstMatchDate = stats && stats.length > 0 ? stats[0].matches.match_date : null;
    const teamsPlayedFor = stats ? [...new Set(stats.map(s => s.team))].filter(Boolean) : [];

    res.json({
      id: player.id,
      name: player.name,
      username: player.username,
      clubId: player.club_id,
      clubName: player.clubs.name,
      joinedAt: player.created_at,
      dateOfBirth: player.date_of_birth,
      country: player.country,
      totalMatches,
      firstMatchDate,
      teamsPlayedFor
    });

  } catch (err) {
    next(err);
  }
});

// Get current player info
router.get("/me", authenticatePlayerToken, async (req, res, next) => {
  try {
    const { data: player, error } = await supabase
      .from("players")
      .select(`
        id,
        name,
        username,
        club_id,
        clubs (
          id,
          name
        )
      `)
      .eq("id", req.user.playerId)
      .single();

    if (error || !player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json({
      id: player.id,
      name: player.name,
      username: player.username,
      clubId: player.club_id,
      clubName: player.clubs.name
    });

  } catch (err) {
    next(err);
  }
});

// Get player's own match history
router.get("/history", authenticatePlayerToken, async (req, res, next) => {
  const { playerId, clubId } = req.user;
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
  
  try {
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
      .eq("player_id", playerId)
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

// Get player's own detailed statistics
router.get("/detailed-stats", authenticatePlayerToken, async (req, res, next) => {
  const { playerId, clubId } = req.user;
  
  try {
    // Get player info
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id, name")
      .eq("id", playerId)
      .single();

    if (playerError || !player) {
      return res.status(404).json({ error: "Player not found" });
    }

    // Get detailed stats
    const { data: stats, error: statsError } = await supabase
      .from("match_player_stats")
      .select(`
        *,
        matches!inner(winner, man_of_match, match_date)
      `)
      .eq("player_id", playerId)
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

// Update player's own profile (DOB and Country)
router.put("/profile", authenticatePlayerToken, async (req, res, next) => {
  try {
    const { playerId, clubId } = req.user;
    const { dateOfBirth, country } = req.body;

    // Validate date of birth if provided
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        return res.status(400).json({ error: "Invalid date of birth format" });
      }
      
      // Check if date is not in the future
      if (dob > new Date()) {
        return res.status(400).json({ error: "Date of birth cannot be in the future" });
      }
      
      // Check if date is reasonable (not too old)
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 100);
      if (dob < minDate) {
        return res.status(400).json({ error: "Date of birth seems too old" });
      }
    }

    // Validate country if provided
    if (country && country.trim().length < 2) {
      return res.status(400).json({ error: "Country name must be at least 2 characters" });
    }

    // Update player profile
    const updateData = {};
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth || null;
    if (country !== undefined) updateData.country = country?.trim() || null;

    const { data: updatedPlayer, error } = await supabase
      .from("players")
      .update(updateData)
      .eq("id", playerId)
      .eq("club_id", clubId)
      .select(`
        id,
        name,
        username,
        club_id,
        created_at,
        date_of_birth,
        country,
        clubs (
          id,
          name
        )
      `)
      .single();

    if (error) throw error;

    // Get updated statistics for complete profile
    const { data: stats } = await supabase
      .from("match_player_stats")
      .select(`
        match_id,
        team,
        matches!inner(match_date)
      `)
      .eq("player_id", playerId)
      .eq("club_id", clubId)
      .eq("matches.club_id", clubId)
      .order("matches(match_date)", { ascending: true });

    const totalMatches = stats ? [...new Set(stats.map(s => s.match_id))].length : 0;
    const firstMatchDate = stats && stats.length > 0 ? stats[0].matches.match_date : null;
    const teamsPlayedFor = stats ? [...new Set(stats.map(s => s.team))].filter(Boolean) : [];

    res.json({
      id: updatedPlayer.id,
      name: updatedPlayer.name,
      username: updatedPlayer.username,
      clubId: updatedPlayer.club_id,
      clubName: updatedPlayer.clubs.name,
      joinedAt: updatedPlayer.created_at,
      dateOfBirth: updatedPlayer.date_of_birth,
      country: updatedPlayer.country,
      totalMatches,
      firstMatchDate,
      teamsPlayedFor
    });

  } catch (err) {
    next(err);
  }
});

export default router;