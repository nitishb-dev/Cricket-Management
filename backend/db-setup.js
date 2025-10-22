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
  -- ========================================
  -- MULTI-TENANT CRICKET MANAGEMENT SCHEMA
  -- ========================================

  -- 1. CLUBS TABLE (Multi-tenancy root)
  CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 2. ADMINS TABLE (Club administrators)
  CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    admin_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 3. Add club_id to existing players table (if not exists)
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='club_id') THEN
      ALTER TABLE players ADD COLUMN club_id UUID REFERENCES clubs(id) ON DELETE CASCADE;
    END IF;
  END $$;

  -- 4. Add club_id to existing matches table (if not exists)
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='club_id') THEN
      ALTER TABLE matches ADD COLUMN club_id UUID REFERENCES clubs(id) ON DELETE CASCADE;
    END IF;
  END $$;

  -- 5. Add club_id to existing match_player_stats table (if not exists)
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_player_stats' AND column_name='club_id') THEN
      ALTER TABLE match_player_stats ADD COLUMN club_id UUID REFERENCES clubs(id) ON DELETE CASCADE;
    END IF;
  END $$;

  -- 6. Update players table structure for multi-tenancy
  DO $$ 
  BEGIN
    -- Remove old unique constraint on name (now should be unique per club)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='players_name_key') THEN
      ALTER TABLE players DROP CONSTRAINT players_name_key;
    END IF;
    
    -- Add unique constraint for name per club
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='players_name_club_id_key') THEN
      ALTER TABLE players ADD CONSTRAINT players_name_club_id_key UNIQUE(name, club_id);
    END IF;
  END $$;

  -- 7. Add username/password columns to players for player login (if not exists)
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='username') THEN
      ALTER TABLE players ADD COLUMN username TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='password_hash') THEN
      ALTER TABLE players ADD COLUMN password_hash TEXT;
    END IF;
    
    -- Add unique constraint for username per club
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='players_username_club_id_key') THEN
      ALTER TABLE players ADD CONSTRAINT players_username_club_id_key UNIQUE(username, club_id);
    END IF;
    
    -- Add profile fields for players (DOB, Country, and Profile Picture)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='date_of_birth') THEN
      ALTER TABLE players ADD COLUMN date_of_birth DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='country') THEN
      ALTER TABLE players ADD COLUMN country TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='profile_picture_url') THEN
      ALTER TABLE players ADD COLUMN profile_picture_url TEXT;
    END IF;
  END $$;

  -- 8. Remove old man_of_match_player_id column (not needed)
  DO $$ 
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='man_of_match_player_id') THEN
      ALTER TABLE matches DROP COLUMN man_of_match_player_id;
    END IF;
  END $$;

  -- ========================================
  -- INDEXES for Performance
  -- ========================================

  CREATE INDEX IF NOT EXISTS idx_players_club_id ON players(club_id);
  CREATE INDEX IF NOT EXISTS idx_matches_club_id ON matches(club_id);
  CREATE INDEX IF NOT EXISTS idx_match_player_stats_club_id ON match_player_stats(club_id);
  CREATE INDEX IF NOT EXISTS idx_admins_club_id ON admins(club_id);
  CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
  CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);

  -- ========================================
  -- SAMPLE DATA (Optional - for testing)
  -- ========================================

  -- Insert a default club for existing data migration
  INSERT INTO clubs (id, name) 
  VALUES ('00000000-0000-0000-0000-000000000001', 'Default Cricket Club')
  ON CONFLICT (name) DO NOTHING;

  -- Update existing players to belong to default club (if they don't have club_id)
  UPDATE players 
  SET club_id = '00000000-0000-0000-0000-000000000001' 
  WHERE club_id IS NULL;

  -- Update existing matches to belong to default club (if they don't have club_id)
  UPDATE matches 
  SET club_id = '00000000-0000-0000-0000-000000000001' 
  WHERE club_id IS NULL;

  -- Update existing match_player_stats to belong to default club (if they don't have club_id)
  UPDATE match_player_stats 
  SET club_id = '00000000-0000-0000-0000-000000000001' 
  WHERE club_id IS NULL;

  -- Create default admin for Default Cricket Club (password: admin123)
  INSERT INTO admins (id, club_id, username, admin_name, password_hash)
  VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'Default Admin',
    '$2b$10$V/dgoymgB8cFEvWXx2Q6j.KJNYnBSKAuB5/6y6AD6ZVvnlmbeBGjW'
  )
  ON CONFLICT (username) DO NOTHING;
`;

export const initializeDatabase = async () => {
  let client;
  try {
    if (!process.env.SUPABASE_DB_URL) {
      console.warn(
        "⚠️ SUPABASE_DB_URL is not set. Set it in backend/.env or export it in the shell."
      );
      return;
    }

    console.log(
      "Using SUPABASE_DB_URL:",
      process.env.SUPABASE_DB_URL.split("?")[0]
    );

    // Get a client from the pool
    client = await pool.connect();

    // Execute the schema SQL
    await client.query(SCHEMA_SQL);
    console.log("✅ Multi-tenant database tables initialized successfully.");
    console.log("🏏 Your existing data has been migrated to 'Default Cricket Club'");
    console.log("🔐 You can now register new clubs using the /api/auth/register-club endpoint");
  } catch (err) {
    console.error("❌ Error initializing database tables:", err);
    // Don't exit the process, just log the error and continue
    console.log("⚠️ Continuing without database initialization...");
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
  }
};

/**
 * Run the initializer when this script is executed directly.
 * For ESM modules it's fine to call the function at top-level.
 */
initializeDatabase();
