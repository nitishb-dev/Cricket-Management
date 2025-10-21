/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react'
import { useAuth } from './AuthContext';
import {
  Player,
  Match,
  PlayerStats,
  MatchPlayerStats,
  SaveMatchPayload,
  SaveMatchResponse,
} from '../types/cricket'
 
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
  // We need auth context to decide when to fetch data
  const { isAuthenticated, token } = useAuth();
  // We can't use the usePlayerApi hook here as it creates a dependency loop with AuthContext
  // Re-implementing apiFetch locally is the safest approach for this context.

  const refreshData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [players, matches] = await Promise.all([
        apiFetch<Player[]>('/players', { token }),
        apiFetch<Match[]>('/matches', { token })
      ])
      setPlayers(players);
      setMatches(matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [token]);

  // ---- Player operations ----
  const addPlayer = useCallback(async (payload: string | AddPlayerPayload): Promise<AddPlayerResponse | null> => {
    const body: AddPlayerPayload = typeof payload === 'string' ? { name: payload } : payload;

    try {
      const data = await apiFetch<AddPlayerResponse>('/players', {
        method: 'POST', token,
        body: JSON.stringify(body)
      });

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
  }, [token]);

  const updatePlayer = useCallback(async (id: string, name: string): Promise<Player | null> => {
    try {
      const updatedPlayer = await apiFetch<Player>(`/players/${id}`, {
        method: 'PUT', token,
        body: JSON.stringify({ name })
      });

      // After a successful update, refresh all data to ensure consistency,
      // especially for derived data like usernames and man_of_match references.
      await refreshData();
      return updatedPlayer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update player')
      return null
    }
  }, [token, refreshData]);

  const deletePlayer = useCallback(async (id: string): Promise<void> => {
    try {
      await apiFetch(`/players/${id}`, { method: 'DELETE', token });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete player')
    }
  }, [token, refreshData]);

  const resetPlayerPassword = useCallback(async (id: string): Promise<AddPlayerResponse | null> => {
    try {
      return await apiFetch<AddPlayerResponse>(`/players/${id}/reset-password`, { token,
        method: 'POST',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      return null;
    }
  }, [token]);

  // ---- Match operations ----
  const saveMatch = async (
    matchData: SaveMatchPayload
  ): Promise<SaveMatchResponse | null> => {
    try {
      const data = await apiFetch<SaveMatchResponse>('/matches', {
        method: 'POST', token,
        body: JSON.stringify(matchData)
      });
      await refreshData()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save match')
      return null
    }
  }

  const deleteMatch = useCallback(async (matchId: string): Promise<void> => {
    try {
      await apiFetch(`/matches/${matchId}`, { method: 'DELETE', token });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete match')
    }
  }, [token, refreshData]);

  const getMatchPlayerStats = useCallback(async (
    matchId: string
  ): Promise<MatchPlayerStats[]> => {
    try {
      return await apiFetch<MatchPlayerStats[]>(`/matches/${matchId}/stats`, { token });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch player stats')
      return []
    }
  }, [token]);

  const getPlayerStats = useCallback(async (
    playerId: string
  ): Promise<PlayerStats | null> => {
    try {
      return await apiFetch<PlayerStats>(`/players/stats/${playerId}`, { token });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch player stats');
      return null;
    }
  }, [token]);

  const getAllPlayerStats = useCallback(async (): Promise<PlayerStats[]> => {
    try {
      return await apiFetch<PlayerStats[]>('/players/stats/all', { token });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all player stats')
      return []
    }
  }, [token]);

  useEffect(() => {
    // Only fetch data if a user is authenticated (admin or player)
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, refreshData]);

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

// A stable, standalone fetch function that doesn't depend on component scope.
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit & { token?: string | null }
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const headers = new Headers(fetchOptions.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...fetchOptions,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `API Error: ${response.status}` }));
    throw new Error(errorData.error || 'An unknown API error occurred');
  }
  return response.json();
}