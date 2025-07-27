// export interface Player {
//   id: string | number         // ✅ Allow number too, for type-safe comparison
//   name: string
//   created_at: string
// }

// // Match entity stored in DB
// export interface Match {
//   id: string
//   team_a_name: string
//   team_b_name: string
//   overs: number
//   toss_winner: string
//   toss_decision: string
//   team_a_score: number
//   team_a_wickets: number
//   team_b_score: number
//   team_b_wickets: number
//   winner: string
//   man_of_match: string
//   match_date: string
//   created_at: string
// }

// // Player performance per match
// export interface MatchPlayerStats {
//   id: string
//   match_id: string
//   player_id: string
//   team: string
//   runs: number
//   wickets: number
//   created_at: string
// }

// // Aggregated player stats across matches
// export interface PlayerStats {
//   player: Player
//   totalMatches: number
//   totalRuns: number
//   totalWickets: number
//   totalWins: number
//   manOfMatchCount: number
// }

// // Used within a live match
// export interface TeamPlayer {
//   player: Player
//   runs: number
//   wickets: number
// }

// // One side (Team A / Team B) in a live match
// export interface MatchTeam {
//   name: string
//   players: TeamPlayer[]
// }

// // In-progress match structure for live scoring
// export interface MatchData {
//   id?: string                    // optional if not saved yet
//   teamA: MatchTeam
//   teamB: MatchTeam
//   overs: number
//   tossWinner: string
//   tossDecision: 'bat' | 'bowl'
//   currentInning: 1 | 2
//   isCompleted: boolean
// }

// ✅ Player in the system
export interface Player {
  id: string | number         // ✅ Allow number too, for type-safe comparison
  name: string
  created_at: string
}

// ✅ Match entity stored in DB
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
}

// ✅ Player performance per match
export interface MatchPlayerStats {
  id: string
  match_id: string
  player_id: string
  team: string
  runs: number
  wickets: number
  ones: number
  twos: number
  threes: number
  fours: number
  sixes: number
  created_at: string
}

// ✅ Aggregated player stats across matches
export interface PlayerStats {
  player: Player
  totalMatches: number
  totalRuns: number
  totalWickets: number
  totalWins: number
  manOfMatchCount: number
  ones: number
  twos: number
  threes: number
  fours: number
  sixes: number
}

// ✅ Used within a live match (in MatchPlay.tsx)
export interface TeamPlayer {
  player: Player
  runs: number
  wickets: number
  ones?: number
  twos?: number
  threes?: number
  fours?: number
  sixes?: number
}

// ✅ One side (Team A / Team B) in a live match
export interface MatchTeam {
  name: string
  players: TeamPlayer[]
}

// ✅ In-progress match structure for live scoring
export interface MatchData {
  id?: string
  teamA: MatchTeam
  teamB: MatchTeam
  overs: number
  tossWinner: string
  tossDecision: 'bat' | 'bowl'
  currentInning: 1 | 2
  isCompleted: boolean
  winner?: string
  manOfMatch?: string
  matchDate?: string
}
