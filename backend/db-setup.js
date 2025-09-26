import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY,
    team_a_name TEXT NOT NULL,
    team_b_name TEXT NOT NULL,
    overs INT NOT NULL,
    toss_winner TEXT,
    toss_decision VARCHAR(10),
    team_a_score INT DEFAULT 0,
    team_a_wickets INT DEFAULT 0,
    team_b_score INT DEFAULT 0,
    team_b_wickets INT DEFAULT 0,
    winner TEXT,
    man_of_match TEXT,
    match_date DATE DEFAULT CURRENT_DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS match_player_stats (
    id UUID PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    team TEXT,
    runs INT DEFAULT 0,
    wickets INT DEFAULT 0,
    ones INT DEFAULT 0,
    twos INT DEFAULT 0,
    threes INT DEFAULT 0,
    fours INT DEFAULT 0,
    sixes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

export const initializeDatabase = async () => {
  try {
    // Execute the schema SQL on the pool directly.
    // The pool will manage the client connection for this query.
    await pool.query(SCHEMA_SQL);
    console.log("✅ Database tables initialized successfully.");
  } catch (err) {
    console.error("❌ Error initializing database tables:", err);
    // Exit the process with an error code if the database can't be initialized.
    process.exit(1);
  }
};
