import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'cricket_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS players (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        team_a_name VARCHAR(255) NOT NULL,
        team_b_name VARCHAR(255) NOT NULL,
        overs INT NOT NULL,
        toss_winner VARCHAR(255),
        toss_decision VARCHAR(10),
        team_a_score INT DEFAULT 0,
        team_a_wickets INT DEFAULT 0,
        team_b_score INT DEFAULT 0,
        team_b_wickets INT DEFAULT 0,
        winner VARCHAR(255),
        man_of_match VARCHAR(255),
        match_date DATE DEFAULT (CURRENT_DATE),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`)

    const [columns] = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'match_player_stats' AND TABLE_SCHEMA = DATABASE()
    `)

    const columnNames = columns.map(col => col.COLUMN_NAME)
    const missingColumns = ['ones', 'twos', 'threes', 'fours', 'sixes'].filter(col => !columnNames.includes(col))

    for (const col of missingColumns) {
      await pool.query(`ALTER TABLE match_player_stats ADD COLUMN ${col} INT DEFAULT 0`)
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS match_player_stats (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        match_id VARCHAR(36),
        player_id VARCHAR(36),
        team VARCHAR(255),
        runs INT DEFAULT 0,
        wickets INT DEFAULT 0,
        ones INT DEFAULT 0,
        twos INT DEFAULT 0,
        threes INT DEFAULT 0,
        fours INT DEFAULT 0,
        sixes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      )`)

    console.log('✅ Database initialized')
  } catch (err) {
    console.error('❌ DB Init Error:', err)
  }
}

app.get('/api/players', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM players ORDER BY name')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/players', async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Player name required' })

  try {
    await pool.query('INSERT INTO players (name) VALUES (?)', [name])
    const [player] = await pool.query(
      'SELECT * FROM players WHERE name = ? ORDER BY created_at DESC LIMIT 1',
      [name]
    )
    res.status(201).json(player[0])
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Player already exists' })
    } else {
      res.status(500).json({ error: err.message })
    }
  }
})

app.get('/api/players/stats/all', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.created_at,
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
      WHERE m.id IS NOT NULL
      GROUP BY p.id
      ORDER BY totalRuns DESC
    `)

    const stats = rows.map(row => ({
      player: {
        id: row.id,
        name: row.name,
        created_at: row.created_at
      },
      totalMatches: Number(row.totalMatches || 0),
      totalRuns: Number(row.totalRuns || 0),
      totalWickets: Number(row.totalWickets || 0),
      ones: Number(row.ones || 0),
      twos: Number(row.twos || 0),
      threes: Number(row.threes || 0),
      fours: Number(row.fours || 0),
      sixes: Number(row.sixes || 0),
      totalWins: Number(row.totalWins || 0),
      manOfMatchCount: Number(row.manOfMatchCount || 0)
    }))

    res.json(stats)
  } catch (err) {
    console.error("Stats error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Get all matches
app.get('/api/matches', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM matches ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get match player stats by match ID
app.get('/api/matches/:id/stats', async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await pool.query(`
      SELECT mps.*, p.name AS player_name
      FROM match_player_stats mps
      JOIN players p ON mps.player_id = p.id
      WHERE mps.match_id = ?
    `, [id])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete a match by ID
app.delete('/api/matches/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query('DELETE FROM matches WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Match not found' })
    }
    res.json({ message: 'Match deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


app.post('/api/matches', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const { teamA, teamB, overs, tossWinner, tossDecision, winner, manOfMatch, matchDate } = req.body

    const teamAScore = teamA.players.reduce((sum, p) => sum + p.runs, 0)
    const teamAWickets = teamA.players.reduce((sum, p) => sum + p.wickets, 0)
    const teamBScore = teamB.players.reduce((sum, p) => sum + p.runs, 0)
    const teamBWickets = teamB.players.reduce((sum, p) => sum + p.wickets, 0)

    await connection.beginTransaction()

    const [matchResult] = await connection.query(`
      INSERT INTO matches (
        team_a_name, team_b_name, overs, toss_winner, toss_decision,
        team_a_score, team_a_wickets, team_b_score, team_b_wickets,
        winner, man_of_match, match_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        teamA.name, teamB.name, overs, tossWinner, tossDecision,
        teamAScore, teamAWickets, teamBScore, teamBWickets,
        winner, manOfMatch, matchDate
      ])

    const [matchRows] = await connection.query(
      'SELECT * FROM matches WHERE team_a_name = ? AND team_b_name = ? ORDER BY created_at DESC LIMIT 1',
      [teamA.name, teamB.name]
    )
    const match = matchRows[0]

    for (const p of teamA.players) {
      await connection.query(
        'INSERT INTO match_player_stats (match_id, player_id, team, runs, wickets, ones, twos, threes, fours, sixes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [match.id, p.player.id, teamA.name, p.runs, p.wickets, p.ones || 0, p.twos || 0, p.threes || 0, p.fours || 0, p.sixes || 0]
      )
    }

    for (const p of teamB.players) {
      await connection.query(
        'INSERT INTO match_player_stats (match_id, player_id, team, runs, wickets, ones, twos, threes, fours, sixes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [match.id, p.player.id, teamB.name, p.runs, p.wickets, p.ones || 0, p.twos || 0, p.threes || 0, p.fours || 0, p.sixes || 0]
      )
    }

    await connection.commit()
    res.status(201).json(match)
  } catch (err) {
    await connection.rollback()
    res.status(500).json({ error: err.message })
  } finally {
    connection.release()
  }
})

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  })
})