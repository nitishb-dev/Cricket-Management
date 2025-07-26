export interface Player {
  id: string
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
}

export interface MatchPlayerStats {
  id: string
  match_id: string
  player_id: string
  team: string
  runs: number
  wickets: number
  created_at: string
}

export interface PlayerStats {
  player: Player
  totalMatches: number
  totalRuns: number
  totalWickets: number
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
  teamA: MatchTeam
  teamB: MatchTeam
  overs: number
  tossWinner: string
  tossDecision: 'bat' | 'bowl'
  currentInning: 1 | 2
  isCompleted: boolean
}