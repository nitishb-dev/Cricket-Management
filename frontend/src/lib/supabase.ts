import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          team_a_name: string
          team_b_name: string
          overs: number
          toss_winner: string
          toss_decision: string
          team_a_score: number
          team_a_wickets: number
          team_b_score: number
          team_b_wickets: number
          winner: string
          man_of_match: string
          match_date: string
          created_at: string
        }
        Insert: {
          id?: string
          team_a_name: string
          team_b_name: string
          overs: number
          toss_winner: string
          toss_decision: string
          team_a_score: number
          team_a_wickets: number
          team_b_score: number
          team_b_wickets: number
          winner: string
          man_of_match: string
          match_date: string
          created_at?: string
        }
        Update: {
          id?: string
          team_a_name?: string
          team_b_name?: string
          overs?: number
          toss_winner?: string
          toss_decision?: string
          team_a_score?: number
          team_a_wickets?: number
          team_b_score?: number
          team_b_wickets?: number
          winner?: string
          man_of_match?: string
          match_date?: string
          created_at?: string
        }
      }
      match_player_stats: {
        Row: {
          id: string
          match_id: string
          player_id: string
          team: string
          runs: number
          wickets: number
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          player_id: string
          team: string
          runs: number
          wickets: number
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          player_id?: string
          team?: string
          runs?: number
          wickets?: number
          created_at?: string
        }
      }
    }
  }
}