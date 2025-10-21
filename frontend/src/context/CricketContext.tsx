/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react'
import {
  Player,
  Match,
  PlayerStats,
  MatchPlayerStats,
  SaveMatchPayload,
  SaveMatchResponse,
} from '../types/cricket'
import { usePlayerApi } from './usePlayerApi';

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
  // Use the centralized API hook
  const { apiFetch } = usePlayerApi();

  const refreshData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [players, matches] = await Promise.all([
        apiFetch<Player[]>('/players'),
        apiFetch<Match[]>('/matches'),
      ]);
      setPlayers(players);
      setMatches(matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [apiFetch]);

  // ---- Player operations ----
  const addPlayer = async (payload: string | AddPlayerPayload): Promise<AddPlayerResponse | null> => {
    const body: AddPlayerPayload = typeof payload === 'string' ? { name: payload } : payload;

    try {
      const data = await apiFetch<AddPlayerResponse>('/players', {
        method: 'POST',
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
  }

  const updatePlayer = async (id: string, name: string): Promise<Player | null> => {
    try {
      const updatedPlayer = await apiFetch<Player>(`/players/${id}`, {
        method: 'PUT',
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
  }

  const deletePlayer = async (id: string): Promise<void> => {
    try {
      await apiFetch(`/players/${id}`, { method: 'DELETE' });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete player')
    }
  }

  const resetPlayerPassword = async (id: string): Promise<AddPlayerResponse | null> => {
    try {
      return await apiFetch<AddPlayerResponse>(`/players/${id}/reset-password`, {
        method: 'POST',
      });
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
      const data = await apiFetch<SaveMatchResponse>('/matches', {
        method: 'POST',
        body: JSON.stringify(matchData)
      });
      await refreshData()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save match')
      return null
    }
  }

  const deleteMatch = async (matchId: string): Promise<void> => {
    try {
      await apiFetch(`/matches/${matchId}`, { method: 'DELETE' });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete match')
    }
  }

  const getMatchPlayerStats = async (
    matchId: string
  ): Promise<MatchPlayerStats[]> => {
    try {
      return await apiFetch<MatchPlayerStats[]>(`/matches/${matchId}/stats`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch player stats')
      return []
    }
  }

  const getPlayerStats = async (
    playerId: string
  ): Promise<PlayerStats | null> => {
    try {
      return await apiFetch<PlayerStats>(`/players/stats/${playerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch player stats');
      return null;
    }
  };

  const getAllPlayerStats = useCallback(async (): Promise<PlayerStats[]> => {
    try {
      return await apiFetch<PlayerStats[]>('/players/stats/all');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all player stats')
      return []
    }
  }, [apiFetch, setError]);

  useEffect(() => {
    refreshData()
  }, [refreshData])

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