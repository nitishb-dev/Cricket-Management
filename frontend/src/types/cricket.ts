// src/types/cricket.ts

export interface Player {
  id: string // Change to string
  name: string
  created_at: string
}

export interface Match {
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
  is_completed: boolean // Add this line
}

export interface MatchPlayerStats {
  id: string
  match_id: string
  player_id: string
  team: string
  runs: number
  wickets: number
  ones: number // Add this
  twos: number // Add this
  threes: number // Add this
  fours: number // Add this
  sixes: number // Add this
  created_at: string
}

export interface PlayerStats {
  player: Player
  totalMatches: number
  totalRuns: number
  totalWickets: number
  ones: number // Add this
  twos: number // Add this
  threes: number // Add this
  fours: number // Add this
  sixes: number // Add this
  totalWins: number
  manOfMatchCount: number
}

export interface TeamPlayer {
  player: Player
  runs: number
  wickets: number
}

export interface MatchTeam {
  name: string
  players: TeamPlayer[]
}

export interface MatchData {
  id?: string
  teamA: MatchTeam
  teamB: MatchTeam
  overs: number
  tossWinner: string
  tossDecision: "bat" | "bowl"
  currentInning: 1 | 2
  isCompleted: boolean

  // New optional fields to track inning stats
  inning1Stats?: InningStats
  inning2Stats?: InningStats
}

export interface InningStats {
  runs: number
  wickets: number
  balls: number
  overs: number
  ballsThisOver: number
  dismissedBatsmen?: (string | number)[] // track out batsmen for persistence
}
