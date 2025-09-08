// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode
// } from 'react'
// import {
//   Player,
//   Match,
//   PlayerStats,
//   MatchPlayerStats,
//   MatchData,
// } from '../types/cricket'

// const API_BASE_URL = 'http://localhost:5000'

// /** The payload your backend expects when saving a match */
// export type SaveMatchPayload = Omit<MatchData, 'currentInning' | 'id'> & {
//   /** winner team name */
//   winner: string
//   /** Man of the Match player name */
//   manOfMatch: string
//   /** YYYY-MM-DD */
//   matchDate: string
// }

// /** What the backend actually returns on POST /api/matches */
// type SaveMatchResponse = { id: string }

// interface CricketContextType {
//   players: Player[]
//   matches: Match[]
//   loading: boolean
//   error: string | null

//   // Player operations
//   addPlayer: (name: string) => Promise<Player | null>
//   getPlayerStats: (playerId: string) => Promise<PlayerStats | null>
//   getAllPlayerStats: () => Promise<PlayerStats[]>

//   // Match operations
//   saveMatch: (matchData: SaveMatchPayload) => Promise<SaveMatchResponse | null>
//   getMatchPlayerStats: (matchId: string) => Promise<MatchPlayerStats[]>
//   deleteMatch: (matchId: string) => Promise<void>

//   // Data refresh
//   refreshData: () => Promise<void>
// }

// const CricketContext = createContext<CricketContextType | undefined>(undefined)

// export const useCricket = () => {
//   const context = useContext(CricketContext)
//   if (!context) {
//     throw new Error('useCricket must be used within a CricketProvider')
//   }
//   return context
// }

// interface CricketProviderProps {
//   children: ReactNode
// }

// export const CricketProvider: React.FC<CricketProviderProps> = ({ children }) => {
//   const [players, setPlayers] = useState<Player[]>([])
//   const [matches, setMatches] = useState<Match[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const refreshData = async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const playersResponse = await fetch(`${API_BASE_URL}/players`)
//       if (!playersResponse.ok) throw new Error('Failed to fetch players')
//       const playersData: Player[] = await playersResponse.json()
//       setPlayers(playersData)

//       const matchesResponse = await fetch(`${API_BASE_URL}/matches`)
//       if (!matchesResponse.ok) throw new Error('Failed to fetch matches')
//       const matchesData: Match[] = await matchesResponse.json()
//       setMatches(matchesData)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const addPlayer = async (name: string): Promise<Player | null> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/players`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ name })
//       })
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || 'Failed to add player')
//       }
//       const data: Player = await response.json()
//       await refreshData()
//       return data
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to add player')
//       return null
//     }
//   }

//   const saveMatch = async (
//     matchData: SaveMatchPayload
//   ): Promise<SaveMatchResponse | null> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/matches`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(matchData)
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || 'Failed to save match')
//       }

//       const data: SaveMatchResponse = await response.json()
//       await refreshData()
//       return data
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to save match')
//       return null
//     }
//   }

//   const deleteMatch = async (matchId: string): Promise<void> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
//         method: 'DELETE'
//       })
//       if (!response.ok) throw new Error('Failed to delete match')
//       await refreshData()
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to delete match')
//     }
//   }

//   const getMatchPlayerStats = async (
//     matchId: string
//   ): Promise<MatchPlayerStats[]> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/matches/${matchId}/stats`)
//       if (!response.ok) throw new Error('Failed to fetch player stats')
//       const data: MatchPlayerStats[] = await response.json()
//       return data
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to fetch player stats')
//       return []
//     }
//   }

//   const getPlayerStats = async (
//     playerId: string
//   ): Promise<PlayerStats | null> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/players/${playerId}/stats`)
//       if (!response.ok) throw new Error('Failed to fetch player stats')
//       const data: PlayerStats = await response.json()
//       return data
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to fetch player stats')
//       return null
//     }
//   }

//   const getAllPlayerStats = async (): Promise<PlayerStats[]> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/players/stats/all`)
//       if (!response.ok) throw new Error('Failed to fetch all player stats')
//       const data: PlayerStats[] = await response.json()
//       return data
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to fetch all player stats')
//       return []
//     }
//   }

//   useEffect(() => {
//     refreshData()
//   }, [])

//   const value: CricketContextType = {
//     players,
//     matches,
//     loading,
//     error,
//     addPlayer,
//     getPlayerStats,
//     getAllPlayerStats,
//     saveMatch,
//     getMatchPlayerStats,
//     deleteMatch,
//     refreshData
//   }

//   return (
//     <CricketContext.Provider value={value}>
//       {children}
//     </CricketContext.Provider>
//   )
// }

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player, Match, PlayerStats, MatchTeam } from '../types/cricket';

const API_BASE_URL = 'http://localhost:5000';

// Payload type for saving a match
export interface SaveMatchPayload {
  teamA: MatchTeam;
  teamB: MatchTeam;
  overs: number;
  tossWinner: string;
  tossDecision: string;
  winner: string;
  manOfMatch: string;
  matchDate: string;
}

// Context type
interface CricketContextType {
  players: Player[];
  matches: Match[];
  stats: PlayerStats[];
  loading: boolean;
  error: string | null;
  refreshPlayers: () => void;
  refreshMatches: () => void;
  refreshStats: () => void;
  saveMatch: (payload: SaveMatchPayload) => Promise<void>;
}

// Create context
const CricketContext = createContext<CricketContextType | undefined>(undefined);

// Provider component
export const CricketProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/players`);
      if (!response.ok) throw new Error('Failed to fetch players.');
      const data: Player[] = await response.json();
      setPlayers(data);
    } catch (err: unknown) {
      console.error('Error fetching players:', err);
      setError(err instanceof Error ? err.message : 'Could not load players.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches`);
      if (!response.ok) throw new Error('Failed to fetch matches.');
      const data: Match[] = await response.json();
      setMatches(data);
    } catch (err: unknown) {
      console.error('Error fetching matches:', err);
      setError(err instanceof Error ? err.message : 'Could not load matches.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/players/stats/all`);
      if (!response.ok) throw new Error('Failed to fetch stats.');
      const data: PlayerStats[] = await response.json();
      setStats(data);
    } catch (err: unknown) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Could not load stats.');
    } finally {
      setLoading(false);
    }
  };

  const saveMatch = async (payload: SaveMatchPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save match.');
      }
      console.log('Match saved successfully!');
      fetchMatches();
      fetchStats();
    } catch (err: unknown) {
      console.error('Error saving match:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    fetchMatches();
    fetchStats();
  }, []);

  return (
    <CricketContext.Provider
      value={{
        players,
        matches,
        stats,
        loading,
        error,
        refreshPlayers: fetchPlayers,
        refreshMatches: fetchMatches,
        refreshStats: fetchStats,
        saveMatch,
      }}
    >
      {children}
    </CricketContext.Provider>
  );
};

// Custom hook
export const useCricket = () => {
  const context = useContext(CricketContext);
  if (!context) throw new Error('useCricket must be used within a CricketProvider');
  return context;
};
