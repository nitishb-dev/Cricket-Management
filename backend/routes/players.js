import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../db.js";

const router = Router();

// Get all players
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM players ORDER BY name");
    res.json(rows);
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
    await pool.query("INSERT INTO players (id, name) VALUES (?, ?)", [
      id,
      name,
    ]);
    const [[player]] = await pool.query(
      "SELECT * FROM players WHERE id = ? LIMIT 1",
      [id]
    );
    res.status(201).json(player);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
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

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // First, get the current name of the player to check for existence and for updating matches
    const [[player]] = await connection.query(
      "SELECT name FROM players WHERE id = ?",
      [id]
    );

    if (!player) {
      await connection.rollback(); // No need to rollback if nothing happened, but good practice
      return res.status(404).json({ error: "Player not found" });
    }
    const oldName = player.name;

    // Update the player's name in the 'players' table
    await connection.query("UPDATE players SET name = ? WHERE id = ?", [
      newName,
      id,
    ]);

    // If the name has changed, update all occurrences in the 'matches' table
    if (oldName !== newName) {
      await connection.query(
        "UPDATE matches SET man_of_match = ? WHERE man_of_match = ?",
        [newName, oldName]
      );
    }

    await connection.commit();

    // Fetch the fully updated player object to send back
    const [[updatedPlayer]] = await connection.query(
      "SELECT * FROM players WHERE id = ?",
      [id]
    );
    res.json(updatedPlayer);
  } catch (err) {
    await connection.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "A player with this name already exists" });
    }
    next(err);
  } finally {
    connection.release();
  }
});

// Delete player
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM players WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
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
    const [rows] = await pool.query(`
      SELECT
        p.id, p.name, p.created_at,
        COUNT(DISTINCT mps.match_id) AS totalMatches,
        COALESCE(SUM(mps.runs), 0) AS totalRuns,
        COALESCE(SUM(mps.wickets), 0) AS totalWickets,
        COALESCE(SUM(mps.ones), 0) AS ones,
        COALESCE(SUM(mps.twos), 0) AS twos,
        COALESCE(SUM(mps.threes), 0) AS threes,
        COALESCE(SUM(mps.fours), 0) AS fours,
        COALESCE(SUM(mps.sixes), 0) AS sixes,
        COALESCE(SUM(CASE WHEN m.winner = mps.team THEN 1 ELSE 0 END), 0) AS totalWins,
        COALESCE(SUM(CASE WHEN m.man_of_match = p.name THEN 1 ELSE 0 END), 0) AS manOfMatchCount
      FROM players p
      LEFT JOIN match_player_stats mps ON p.id = mps.player_id
      LEFT JOIN matches m ON m.id = mps.match_id
      GROUP BY p.id
      ORDER BY totalRuns DESC
    `);

    const stats = rows.map((row) => ({
      player: { id: row.id, name: row.name, created_at: row.created_at },
      totalMatches: Number(row.totalMatches || 0),
      totalRuns: Number(row.totalRuns || 0),
      totalWickets: Number(row.totalWickets || 0),
      ones: Number(row.ones || 0),
      twos: Number(row.twos || 0),
      threes: Number(row.threes || 0),
      fours: Number(row.fours || 0),
      sixes: Number(row.sixes || 0),
      totalWins: Number(row.totalWins || 0),
      manOfMatchCount: Number(row.manOfMatchCount || 0),
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
    const [rows] = await pool.query(
      `
      SELECT
        p.id, p.name,
        COALESCE(SUM(mps.runs), 0) AS totalRuns,
        COALESCE(SUM(mps.wickets), 0) AS totalWickets,
        COUNT(DISTINCT mps.match_id) AS totalMatches,
        COALESCE(SUM(CASE WHEN m.winner = mps.team THEN 1 ELSE 0 END), 0) AS totalWins,
        COALESCE(SUM(CASE WHEN m.man_of_match = p.name THEN 1 ELSE 0 END), 0) AS manOfMatchCount
      FROM players p
      LEFT JOIN match_player_stats mps ON p.id = mps.player_id
      LEFT JOIN matches m ON m.id = mps.match_id
      WHERE p.id = ?
      GROUP BY p.id
      LIMIT 1;
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }

    const {
      totalRuns,
      totalWickets,
      totalMatches,
      totalWins,
      manOfMatchCount,
      name,
    } = rows[0];
    res.json({
      player: { id, name },
      totalRuns: Number(totalRuns),
      totalWickets: Number(totalWickets),
      totalMatches: Number(totalMatches),
      totalWins: Number(totalWins),
      manOfMatchCount: Number(manOfMatchCount),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
