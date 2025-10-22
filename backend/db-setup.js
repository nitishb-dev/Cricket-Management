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

  -- 2. SUPER ADMINS TABLE (Platform owners)
  CREATE TABLE IF NOT EXISTS super_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 3. ADMINS TABLE (Club administrators)
  CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    admin_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 4. Add club_id to existing players table (if not exists)
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='club_id') THEN
      ALTER TABLE players ADD COLUMN club_id UUID REFERENCES clubs(id) ON DELETE CASCADE;
    END IF;
  END $$;

  -- 5. Add club_id to existing matches table (if not exists)
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
    
    -- Add password management fields for players
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='must_change_password') THEN
      ALTER TABLE players ADD COLUMN must_change_password BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='last_password_change') THEN
      ALTER TABLE players ADD COLUMN last_password_change TIMESTAMPTZ DEFAULT NOW();
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
  CREATE INDEX IF NOT EXISTS idx_super_admins_username ON super_admins(username);
  CREATE INDEX IF NOT EXISTS idx_super_admins_email ON super_admins(email);

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

  -- ========================================
  -- SUPER ADMIN INITIALIZATION
  -- ========================================
  
  -- Create initial super admin (YOU - the platform owner)
  -- Default credentials: superadmin / SuperAdmin@123
  -- CHANGE THESE IMMEDIATELY AFTER FIRST LOGIN!
  INSERT INTO super_admins (id, username, email, full_name, password_hash)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    'superadmin',
    'admin@cricketmanager.com',
    'Platform Administrator',
    '$2b$12$pZdUOxsb6Q75KmL7gOQ72eumqdfgwzM/ocHbIpuRbUDpRf.N6oKRa'
  )
  ON CONFLICT (username) DO NOTHING;
`;

// Flag to prevent multiple simultaneous initializations
let isInitializing = false;
let initializationComplete = false;

export const initializeDatabase = async () => {
  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    console.log("⏳ Database initialization already in progress...");
    return;
  }

  if (initializationComplete) {
    console.log("✅ Database already initialized, skipping...");
    return;
  }

  let client;
  try {
    if (!process.env.SUPABASE_DB_URL) {
      console.warn(
        "⚠️ SUPABASE_DB_URL is not set. Set it in backend/.env or export it in the shell."
      );
      return;
    }

    isInitializing = true;

    console.log(
      "Using SUPABASE_DB_URL:",
      process.env.SUPABASE_DB_URL.split("?")[0]
    );

    // Get a client from the pool
    client = await pool.connect();

    // Check if tables already exist to avoid unnecessary operations
    const { rows } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('clubs', 'admins', 'super_admins')
    `);

    if (rows.length >= 3) {
      console.log("✅ Multi-tenant database tables already exist, skipping initialization.");
      initializationComplete = true;
      return;
    }

    // Execute the schema SQL
    await client.query(SCHEMA_SQL);
    console.log("✅ Multi-tenant database tables initialized successfully.");
    console.log("🏏 Your existing data has been migrated to 'Default Cricket Club'");
    console.log("🔐 You can now register new clubs using the /api/auth/register-club endpoint");

    initializationComplete = true;
  } catch (err) {
    console.error("❌ Error initializing database tables:", err);

    // Check if it's a deadlock or tables already exist
    if (err.code === '40P01') {
      console.log("⚠️ Database deadlock detected - tables may already exist, continuing...");
      initializationComplete = true; // Assume tables exist
    } else if (err.message && err.message.includes('already exists')) {
      console.log("✅ Database tables already exist");
      initializationComplete = true;
    } else {
      console.log("⚠️ Continuing without database initialization...");
    }
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
    isInitializing = false;
  }
};

/**
 * Run the initializer when this script is executed directly.
 * For ESM modules it's fine to call the function at top-level.
 */
initializeDatabase();
