import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// For production security, it's better to initialize with the public anon key.
// This ensures that your server-side API calls respect Row-Level Security (RLS) by default.
// Use the service_role key only for specific operations that need to bypass RLS.
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and anon key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// The supabase client is not a connection pool in the same way 'pg.Pool' is.
// Exporting it as 'supabase' is clearer. You can update other files to import 'supabase'
// instead of 'pool' for better code clarity.
export { supabase as pool };
