/* eslint-disable react-refresh/only-export-components */
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
  SaveMatchPayload,
  SaveMatchResponse,
} from '../types/cricket'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

if (!import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL is not set in .env file. Defaulting to http://localhost:5000");
}

interface AddPlayerPayload {
  name: string;
  username?: string;
  password?: string;
}

interface AddPlayerResponse {
  player: Player;
  generatedPassword?: string;
}

interface CricketContextType {
  players: Player[]
  matches: Match[]
  loading: boolean
  error: string | null

  // Player operations
  // Accept either a string (name) for backwards compatibility, or an object with username/password
  addPlayer: (payload: string | AddPlayerPayload) => Promise<AddPlayerResponse | null>
  updatePlayer: (id: string, name: string) => Promise<Player | null>
  deletePlayer: (id: string) => Promise<void>
  getPlayerStats: (playerId: string) => Promise<PlayerStats | null>
  getAllPlayerStats: () => Promise<PlayerStats[]>

  // Match operations
  saveMatch: (matchData: SaveMatchPayload) => Promise<SaveMatchResponse | null>
  getMatchPlayerStats: (matchId: string) => Promise<MatchPlayerStats[]>
  deleteMatch: (matchId: string) => Promise<void>
  resetPlayerPassword: (id: string) => Promise<AddPlayerResponse | null>

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
        fetch(`${API_BASE_URL}/api/players`),
        fetch(`${API_BASE_URL}/api/matches`)
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
  const addPlayer = async (payload: string | AddPlayerPayload): Promise<AddPlayerResponse | null> => {
    const body: AddPlayerPayload = typeof payload === 'string' ? { name: payload } : payload;

    try {
      const response = await fetch(`${API_BASE_URL}/api/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Failed to create player');
      }

      const data: AddPlayerResponse = await response.json();
      const createdPlayer: Player = data.player;

      // defensive check
      if (!createdPlayer || !createdPlayer.name) {
        throw new Error('Invalid player data from server');
      }

      // update local state
      setPlayers(prev => [...prev, createdPlayer]);

      // Return the full response which may include the generated password
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create player');
      return null;
    }
  }

  const updatePlayer = async (id: string, name: string): Promise<Player | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update player')
      }

      const updatedPlayer: Player = await response.json()

      // After a successful update, refresh all data to ensure consistency,
      // especially for derived data like usernames and man_of_match references.
      await refreshData();
      return updatedPlayer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update player')
      return null
    }
  }

  const deletePlayer = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete player')
      await refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete player')
    }
  }

  const resetPlayerPassword = async (id: string): Promise<AddPlayerResponse | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players/${id}/reset-password`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Failed to reset password');
      }

      const data: AddPlayerResponse = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      return null;
    }
  };

  // ---- Match operations ----
  const saveMatch = async (
    matchData: SaveMatchPayload
  ): Promise<SaveMatchResponse | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches`, {
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
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/stats`)
      if (!response.ok) throw new Error('Failed to fetch player stats')
      const data: MatchPlayerStats[] = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch player stats')
      return []
    }
  }

  const getPlayerStats = async (
    playerId: string
  ): Promise<PlayerStats | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players/stats/${playerId}`);

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
      const response = await fetch(`${API_BASE_URL}/api/players/stats/all`)
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
    resetPlayerPassword,
    refreshData
  }

  return (
    <CricketContext.Provider value={value}>
      {children}
    </CricketContext.Provider>
  )
}