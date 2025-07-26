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

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cricket_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Database initialization
const initDatabase = async () => {
  try {
    // Create players table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS players (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create matches table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        team_a_name VARCHAR(255) NOT NULL,
        team_b_name VARCHAR(255) NOT NULL,
        overs INTEGER NOT NULL,
        toss_winner VARCHAR(255) NOT NULL,
        toss_decision VARCHAR(10) NOT NULL,
        team_a_score INTEGER DEFAULT 0,
        team_a_wickets INTEGER DEFAULT 0,
        team_b_score INTEGER DEFAULT 0,
        team_b_wickets INTEGER DEFAULT 0,
        winner VARCHAR(255),
        man_of_match VARCHAR(255),
        match_date DATE DEFAULT (CURRENT_DATE),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create match_player_stats table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS match_player_stats (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        match_id VARCHAR(36),
        player_id VARCHAR(36),
        team VARCHAR(255) NOT NULL,
        runs INTEGER DEFAULT 0,
        wickets INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      )
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

// Routes

// Get all players
app.get('/api/players', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM players ORDER BY name')
    console.log('Fetched players:', rows) // Debug log
    res.json(rows)
  } catch (error) {
    console.error('Error fetching players:', error)
    res.status(500).json({ error: error.message })
  }
})

// Add new player
app.post('/api/players', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) {
      return res.status(400).json({ error: 'Player name is required' })
    }

    // Insert player and get the generated UUID
    const [result] = await pool.query(
      'INSERT INTO players (name) VALUES (?)',
      [name]
    )
    
    // Get the newly created player by name (since UUID might not be available in insertId)
    const [newPlayer] = await pool.query(
      'SELECT * FROM players WHERE name = ? ORDER BY created_at DESC LIMIT 1',
      [name]
    )
    
    console.log('Created player:', newPlayer[0]) // Debug log
    res.status(201).json(newPlayer[0])
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') { // Unique violation
      res.status(400).json({ error: 'Player with this name already exists' })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

// Get all matches
app.get('/api/matches', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM matches ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get match by ID
app.get('/api/matches/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query('SELECT * FROM matches WHERE id = ?', [id])
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' })
    }
    
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Save match
app.post('/api/matches', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    console.log('Received match data:', req.body)
    
    await connection.beginTransaction()
    
    const {
      teamA,
      teamB,
      overs,
      tossWinner,
      tossDecision,
      winner,
      manOfMatch,
      matchDate
    } = req.body

    // Calculate scores and wickets from player data
    const teamAScore = teamA.players.reduce((sum, p) => sum + p.runs, 0)
    const teamAWickets = teamA.players.reduce((sum, p) => sum + p.wickets, 0)
    const teamBScore = teamB.players.reduce((sum, p) => sum + p.runs, 0)
    const teamBWickets = teamB.players.reduce((sum, p) => sum + p.wickets, 0)

    console.log('Calculated scores:', { teamAScore, teamAWickets, teamBScore, teamBWickets })

    // Insert match
    const [matchResult] = await connection.query(
      `INSERT INTO matches (
        team_a_name, team_b_name, overs, toss_winner, toss_decision,
        team_a_score, team_a_wickets, team_b_score, team_b_wickets,
        winner, man_of_match, match_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        teamA.name, teamB.name, overs, tossWinner, tossDecision,
        teamAScore, teamAWickets, teamBScore, teamBWickets,
        winner, manOfMatch, matchDate
      ]
    )

    // Since we're using UUIDs, we need to get the match by the most recent one with these team names
    const [matchRows] = await connection.query(
      'SELECT * FROM matches WHERE team_a_name = ? AND team_b_name = ? ORDER BY created_at DESC LIMIT 1',
      [teamA.name, teamB.name]
    )
    const match = matchRows[0]

    // Insert player stats for team A
    for (const player of teamA.players) {
      await connection.query(
        'INSERT INTO match_player_stats (match_id, player_id, team, runs, wickets) VALUES (?, ?, ?, ?, ?)',
        [match.id, player.player.id, teamA.name, player.runs, player.wickets]
      )
    }

    // Insert player stats for team B
    for (const player of teamB.players) {
      await connection.query(
        'INSERT INTO match_player_stats (match_id, player_id, team, runs, wickets) VALUES (?, ?, ?, ?, ?)',
        [match.id, player.player.id, teamB.name, player.runs, player.wickets]
      )
    }

    await connection.commit()
    console.log('Match saved successfully:', match)
    res.status(201).json(match)
  } catch (error) {
    await connection.rollback()
    console.error('Error saving match:', error)
    res.status(500).json({ error: error.message })
  } finally {
    connection.release()
  }
})

// Get match player stats
app.get('/api/matches/:id/stats', async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query(
      `SELECT mps.*, p.name as player_name 
       FROM match_player_stats mps 
       JOIN players p ON mps.player_id = p.id 
       WHERE mps.match_id = ?`,
      [id]
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get player statistics
app.get('/api/players/:id/stats', async (req, res) => {
  try {
    const { id } = req.params
    
    // Get player info
    const [playerRows] = await pool.query('SELECT * FROM players WHERE id = ?', [id])
    if (playerRows.length === 0) {
      return res.status(404).json({ error: 'Player not found' })
    }
    
    const player = playerRows[0]

    // Get player stats
    const [statsRows] = await pool.query(
      `SELECT mps.*, m.winner, m.man_of_match 
       FROM match_player_stats mps 
       JOIN matches m ON mps.match_id = m.id 
       WHERE mps.player_id = ?`,
      [id]
    )

    const stats = statsRows
    const totalMatches = new Set(stats.map(s => s.match_id)).size
    const totalRuns = stats.reduce((sum, s) => sum + parseInt(s.runs), 0)
    const totalWickets = stats.reduce((sum, s) => sum + parseInt(s.wickets), 0)
    const totalWins = stats.filter(s => s.winner === s.team).length
    const manOfMatchCount = stats.filter(s => s.man_of_match === player.name).length

    res.json({
      player,
      totalMatches,
      totalRuns,
      totalWickets,
      totalWins,
      manOfMatchCount
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all player statistics
app.get('/api/players/stats/all', async (req, res) => {
  try {
    const [playersRows] = await pool.query('SELECT * FROM players ORDER BY name')
    const players = playersRows

    const statsPromises = players.map(async (player) => {
      const [statsRows] = await pool.query(
        `SELECT mps.*, m.winner, m.man_of_match 
         FROM match_player_stats mps 
         JOIN matches m ON mps.match_id = m.id 
         WHERE mps.player_id = ?`,
        [player.id]
      )

      const stats = statsRows
      const totalMatches = new Set(stats.map(s => s.match_id)).size
      const totalRuns = stats.reduce((sum, s) => sum + parseInt(s.runs), 0)
      const totalWickets = stats.reduce((sum, s) => sum + parseInt(s.wickets), 0)
      const totalWins = stats.filter(s => s.winner === s.team).length
      const manOfMatchCount = stats.filter(s => s.man_of_match === player.name).length

      return {
        player,
        totalMatches,
        totalRuns,
        totalWickets,
        totalWins,
        manOfMatchCount
      }
    })

    const allStats = await Promise.all(statsPromises)
    res.json(allStats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(error => {
  console.error('Failed to start server:', error)
}) 