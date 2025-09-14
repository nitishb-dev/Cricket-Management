import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cricket_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const initDatabase = async () => {
  try {
    // Players table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS players (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Matches table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id VARCHAR(36) PRIMARY KEY,
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
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Match player stats table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS match_player_stats (
        id VARCHAR(36) PRIMARY KEY,
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
      )
    `);

    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ DB Init Error:", err);
    process.exit(1);
  }
};

export { pool, initDatabase };
