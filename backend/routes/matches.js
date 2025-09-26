import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../db.js";

const router = Router();

// Get all matches
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Get a single match by ID
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data: match, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .single();
    if (error && error.code === "PGRST116") {
      return res.status(404).json({ error: "Match not found" });
    }
    res.json(match);
  } catch (err) {
    next(err);
  }
});

// Get match stats by match ID
router.get("/:id/stats", async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id")
      .eq("id", id)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const { data, error } = await supabase
      .from("match_player_stats")
      .select("*, players(name)")
      .eq("match_id", id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Save a match
router.post("/", async (req, res, next) => {
  try {
    const {
      teamA,
      teamB,
      overs,
      tossWinner,
      tossDecision,
      winner,
      manOfMatch,
      matchDate,
      isCompleted,
    } = req.body;

    if (!teamA || !teamB || !overs) {
      return res.status(400).json({ error: "Missing required match data" });
    }

    const matchId = uuidv4();

    const teamAScore = teamA.players.reduce((sum, p) => sum + (p.runs || 0), 0);
    const teamAWickets = teamA.players.reduce(
      (sum, p) => sum + (p.wickets || 0),
      0
    );
    const teamBScore = teamB.players.reduce((sum, p) => sum + (p.runs || 0), 0);
    const teamBWickets = teamB.players.reduce(
      (sum, p) => sum + (p.wickets || 0),
      0
    );

    const { error: matchError } = await supabase.from("matches").insert({
      id: matchId,
      team_a_name: teamA.name,
      team_b_name: teamB.name,
      overs,
      toss_winner: tossWinner,
      toss_decision: tossDecision,
      team_a_score: teamAScore,
      team_a_wickets: teamAWickets,
      team_b_score: teamBScore,
      team_b_wickets: teamBWickets,
      winner,
      man_of_match: manOfMatch,
      match_date: matchDate,
      is_completed: isCompleted,
    });

    if (matchError) throw matchError;

    const playerStats = [...teamA.players, ...teamB.players].map((p) => {
      const teamName = teamA.players.some((ap) => ap.player.id === p.player.id)
        ? teamA.name
        : teamB.name;
      return {
        id: uuidv4(),
        match_id: matchId,
        player_id: p.player.id,
        team: teamName,
        runs: p.runs || 0,
        wickets: p.wickets || 0,
        ones: p.ones || 0,
        twos: p.twos || 0,
        threes: p.threes || 0,
        fours: p.fours || 0,
        sixes: p.sixes || 0,
      };
    });

    const { error: statsError } = await supabase
      .from("match_player_stats")
      .insert(playerStats);

    if (statsError) throw statsError;

    res.status(201).json({ id: matchId });
  } catch (err) {
    next(err);
  }
});

// Delete match
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    // Check if the match exists
    const { data: match, error: findError } = await supabase
      .from("matches")
      .select("id")
      .eq("id", id)
      .single();

    if (findError || !match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Explicitly delete associated player stats first to be robust.
    // This handles cases where ON DELETE CASCADE might not be active on the DB.
    const { error: statsError } = await supabase
      .from("match_player_stats")
      .delete()
      .eq("match_id", id);

    if (statsError) throw statsError;

    const { error: matchError } = await supabase
      .from("matches")
      .delete()
      .eq("id", id);

    if (matchError) throw matchError;

    res.status(200).json({ message: "Match deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
