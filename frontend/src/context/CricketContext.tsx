import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react'
import {
  Player,
  Match,
  PlayerStats,
  MatchPlayerStats
} from '../types/cricket'
import { API_BASE_URL } from '../config'

interface CricketContextType {
  players: Player[]
  matches: Match[]
  loading: boolean
  error: string | null

  // Player operations
  addPlayer: (name: string) => Promise<Player | null>
  getPlayerStats: (playerId: string) => Promise<PlayerStats | null>
  getAllPlayerStats: () => Promise<PlayerStats[]>

  // Match operations
  saveMatch: (matchData: any) => Promise<Match | null>
  getMatchPlayerStats: (matchId: string) => Promise<MatchPlayerStats[]>
  deleteMatch: (matchId: number) => Promise<void>

  // Data refresh
  refreshData: () => Promise<void>
}

const CricketContext = createContext<CricketContextType | undefined>(
  undefined
)

export const useCricket = () => {
  const context = useContext(CricketContext)
  if (!context) {
    throw new Error('useCricket must be used within a CricketProvider')
  }
  return context
}

interface CricketProviderProps {
  children: ReactNode
}

export const CricketProvider: React.FC<CricketProviderProps> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshData = async () => {
    setLoading(true)
    setError(null)

    try {
      const playersResponse = await fetch(`${API_BASE_URL}/players`)
      if (!playersResponse.ok) throw new Error('Failed to fetch players')
      const playersData = await playersResponse.json()
      setPlayers(playersData)

      const matchesResponse = await fetch(`${API_BASE_URL}/matches`)
      if (!matchesResponse.ok) throw new Error('Failed to fetch matches')
      const matchesData = await matchesResponse.json()
      setMatches(matchesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addPlayer = async (name: string): Promise<Player | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add player')
      }

      const data = await response.json()
      await refreshData()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add player')
      return null
    }
  }

  const saveMatch = async (matchData: any): Promise<Match | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save match')
      }

      const data = await response.json()
      await refreshData()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save match')
      return null
    }
  }

  const deleteMatch = async (matchId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete match')
      await refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete match')
    }
  }

  const getMatchPlayerStats = async (matchId: string): Promise<MatchPlayerStats[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/stats`)
      if (!response.ok) throw new Error('Failed to fetch player stats')
      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch player stats')
      return []
    }
  }

  const getPlayerStats = async (playerId: string): Promise<PlayerStats | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${playerId}/stats`)
      if (!response.ok) throw new Error('Failed to fetch player stats')
      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch player stats')
      return null
    }
  }

  const getAllPlayerStats = async (): Promise<PlayerStats[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/stats/all`)
      if (!response.ok) throw new Error('Failed to fetch all player stats')
      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all player stats')
      return []
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  const value: CricketContextType = {
    players,
    matches,
    loading,
    error,
    addPlayer,
    getPlayerStats,
    getAllPlayerStats,
    saveMatch,
    getMatchPlayerStats,
    deleteMatch,
    refreshData
  }

  return (
    <CricketContext.Provider value={value}>
      {children}
    </CricketContext.Provider>
  )
}
