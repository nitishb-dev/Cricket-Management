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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    username TEXT,
    password_hash TEXT
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
    man_of_match_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
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

  ALTER TABLE players
    ADD COLUMN IF NOT EXISTS username TEXT,
    ADD COLUMN IF NOT EXISTS password_hash TEXT;

  -- add unique index on username (separate statement to avoid issues)
  CREATE UNIQUE INDEX IF NOT EXISTS players_username_idx ON players(username);
`;

export const initializeDatabase = async () => {
  try {
    if (!process.env.SUPABASE_DB_URL) {
      console.warn(
        "⚠️ SUPABASE_DB_URL is not set. Set it in backend/.env or export it in the shell."
      );
    } else {
      console.log(
        "Using SUPABASE_DB_URL:",
        process.env.SUPABASE_DB_URL.split("?")[0]
      );
    }

    // Execute the schema SQL on the pool directly.
    await pool.query(SCHEMA_SQL);
    console.log("✅ Database tables initialized successfully.");
    await pool.end();
  } catch (err) {
    console.error("❌ Error initializing database tables:", err);
    // Exit the process with an error code if the database can't be initialized.
    process.exit(1);
  }
};

/**
 * Run the initializer when this script is executed directly.
 * For ESM modules it's fine to call the function at top-level.
 */
initializeDatabase();
