import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../db.js";

const router = Router();

// Get all matches
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM matches ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Get a single match by ID
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const [[match]] = await pool.query("SELECT * FROM matches WHERE id = ?", [
      id,
    ]);
    if (!match) {
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
    const [[match]] = await pool.query("SELECT id FROM matches WHERE id = ?", [
      id,
    ]);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const [rows] = await pool.query(
      `
      SELECT mps.*, p.name AS player_name
      FROM match_player_stats mps
      JOIN players p ON mps.player_id = p.id
      WHERE mps.match_id = ?
    `,
      [id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Save a match
router.post("/", async (req, res, next) => {
  const connection = await pool.getConnection();
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

    await connection.beginTransaction();

    await connection.query(
      `
      INSERT INTO matches (
        id, team_a_name, team_b_name, overs, toss_winner, toss_decision,
        team_a_score, team_a_wickets, team_b_score, team_b_wickets,
        winner, man_of_match, match_date, is_completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        matchId,
        teamA.name,
        teamB.name,
        overs,
        tossWinner,
        tossDecision,
        teamAScore,
        teamAWickets,
        teamBScore,
        teamBWickets,
        winner,
        manOfMatch,
        matchDate,
        isCompleted,
      ]
    );

    const playerStatPromises = [...teamA.players, ...teamB.players].map((p) => {
      const teamName = teamA.players.some((ap) => ap.player.id === p.player.id)
        ? teamA.name
        : teamB.name;
      return connection.query(
        `INSERT INTO match_player_stats 
          (id, match_id, player_id, team, runs, wickets, ones, twos, threes, fours, sixes) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          matchId,
          p.player.id,
          teamName,
          p.runs || 0,
          p.wickets || 0,
          p.ones || 0,
          p.twos || 0,
          p.threes || 0,
          p.fours || 0,
          p.sixes || 0,
        ]
      );
    });

    await Promise.all(playerStatPromises);

    await connection.commit();
    res.status(201).json({ id: matchId });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// Delete match
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if the match exists to ensure we can return a proper 404.
    const [[match]] = await connection.query(
      "SELECT id FROM matches WHERE id = ?",
      [id]
    );

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Explicitly delete associated player stats first to be robust.
    // This handles cases where ON DELETE CASCADE might not be active on the DB.
    await connection.query(
      "DELETE FROM match_player_stats WHERE match_id = ?",
      [id]
    );
    await connection.query("DELETE FROM matches WHERE id = ?", [id]);

    await connection.commit();
    res.status(200).json({ message: "Match deleted successfully" });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

export default router;
