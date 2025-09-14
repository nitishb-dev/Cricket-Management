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
  MatchPlayerStats,
  SaveMatchPayload, // <-- Import these two types
  SaveMatchResponse, // <-- from your cricket.ts file
} from '../types/cricket'

const API_BASE_URL = 'http://localhost:5000/api'

interface CricketContextType {
  players: Player[]
  matches: Match[]
  loading: boolean
  error: string | null

  // Player operations
  addPlayer: (name: string) => Promise<Player | null>
  updatePlayer: (id: string, name: string) => Promise<Player | null>
  deletePlayer: (id: string) => Promise<void>
  getPlayerStats: (playerId: string) => Promise<PlayerStats | null>
  getAllPlayerStats: () => Promise<PlayerStats[]>

  // Match operations
  saveMatch: (matchData: SaveMatchPayload) => Promise<SaveMatchResponse | null>
  getMatchPlayerStats: (matchId: string) => Promise<MatchPlayerStats[]>
  deleteMatch: (matchId: string) => Promise<void>

  // Data refresh
  refreshData: () => Promise<void>
}

const CricketContext = createContext<CricketContextType | undefined>(undefined)

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
      const [playersResponse, matchesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/players`),
        fetch(`${API_BASE_URL}/matches`)
      ]);

      if (!playersResponse.ok) throw new Error('Failed to fetch players');
      if (!matchesResponse.ok) throw new Error('Failed to fetch matches');

      const playersData: Player[] = await playersResponse.json();
      const matchesData: Match[] = await matchesResponse.json();

      setPlayers(playersData);
      setMatches(matchesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // ---- Player operations ----
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
      const data: Player = await response.json()
      await refreshData()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add player')
      return null
    }
  }

  const updatePlayer = async (id: string, name: string): Promise<Player | null> => {
    // Find the player's old name from the current state before sending the update.
    // This is crucial for finding and replacing the name in the matches list.
    const oldPlayer = players.find(p => p.id === id)

    try {
      const response = await fetch(`${API_BASE_URL}/players/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update player')
      }

      const updatedPlayer: Player = await response.json()

      // 1. Update the players list with the new player data.
      setPlayers(prevPlayers =>
        prevPlayers.map(p => (p.id === id ? updatedPlayer : p))
      )

      // 2. If the old player was found, iterate through the matches and patch the man_of_match field.
      if (oldPlayer) {
        setMatches(prevMatches =>
          prevMatches.map(m => {
            return m.man_of_match === oldPlayer.name
              ? { ...m, man_of_match: updatedPlayer.name }
              : m
          })
        )
      }

      return updatedPlayer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update player')
      return null
    }
  }

  const deletePlayer = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete player')
      await refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete player')
    }
  }

  // ---- Match operations ----
  const saveMatch = async (
    matchData: SaveMatchPayload
  ): Promise<SaveMatchResponse | null> => {
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

      const data: SaveMatchResponse = await response.json()
      await refreshData()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save match')
      return null
    }
  }

  const deleteMatch = async (matchId: string): Promise<void> => {
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

  const getMatchPlayerStats = async (
    matchId: string
  ): Promise<MatchPlayerStats[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/stats`)
      if (!response.ok) throw new Error('Failed to fetch player stats')
      const data: MatchPlayerStats[] = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch player stats')
      return []
    }
  }

  // const getPlayerStats = async (
  //   playerId: string
  // ): Promise<PlayerStats | null> => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/players/stats/${playerId}`)
  //     if (!response.ok) throw new Error('Failed to fetch player stats')
  //     const data: PlayerStats = await response.json()
  //     return data
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to fetch player stats')
  //     return null
  //   }
  // }
  const getPlayerStats = async (
  playerId: string
): Promise<PlayerStats | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/players/stats/${playerId}`);
    
    // Explicitly check for a 404 response
    if (response.status === 404) {
      setError(`Player with ID ${playerId} not found.`);
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch player stats');
    }
    const data: PlayerStats = await response.json();
    return data;
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch player stats');
    return null;
  }
};

  const getAllPlayerStats = async (): Promise<PlayerStats[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/players/stats/all`)
      if (!response.ok) throw new Error('Failed to fetch all player stats')
      const data: PlayerStats[] = await response.json()
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
    updatePlayer,
    deletePlayer,
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