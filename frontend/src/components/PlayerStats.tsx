import React, { useState, useEffect, useCallback } from 'react'
import { BarChart3, Trophy, Target, Award, TrendingUp, User, RefreshCw, Shield, Zap, GitCommit, GitMerge } from 'lucide-react'
import { useCricket } from '../context/CricketContext'
import { useAuth } from '../context/AuthContext'
import { usePlayerApi } from '../context/usePlayerApi'
import { PlayerStats as CricketPlayerStats } from '../types/cricket'
import { StatCard } from './StatCard'

interface DetailedPlayerStats {
  player: { id: string; name: string };
  totalMatches: number;
  totalRuns: number;
  totalWickets: number;
  totalWins: number;
  manOfMatchCount: number;
  battingAverage: string;
  bowlingAverage: string;
  winPercentage: string;
  boundaries: {
    ones: number;
    twos: number;
    threes: number;
    fours: number;
    sixes: number;
  };
  recentMatches: any[];
}

export const PlayerStats: React.FC = () => {
  const { getAllPlayerStats, loading } = useCricket()
  const { role, userId } = useAuth()
  const { apiFetch } = usePlayerApi()

  // State for admin view (all players)
  const [playerStats, setPlayerStats] = useState<CricketPlayerStats[]>([])
  const [sortBy, setSortBy] = useState<'runs' | 'wickets' | 'matches' | 'wins' | 'mom'>('runs')
  const [loadingStats, setLoadingStats] = useState(false)

  // State for player view (single player)
  const [myStats, setMyStats] = useState<DetailedPlayerStats | null>(null);
  const [myStatsLoading, setMyStatsLoading] = useState(true);
  const [myStatsError, setMyStatsError] = useState<string | null>(null);

  // Admin: Load all player stats
  const loadStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const stats = await getAllPlayerStats()
      setPlayerStats(Array.isArray(stats) ? stats : [])
    } catch (err) {
      console.error("Error fetching stats:", err)
      setPlayerStats([])
    } finally {
      setLoadingStats(false)
    }
  }, [getAllPlayerStats])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  // Player: Load detailed stats for the logged-in user
  useEffect(() => {
    if (role !== 'player' || !userId) return;

    const fetchMyStats = async () => {
      setMyStatsLoading(true);
      setMyStatsError(null);
      try {
        // Use the centralized apiFetch hook which correctly builds the URL
        const data = await apiFetch<DetailedPlayerStats>(`/player/detailed-stats`);
        setMyStats(data);
      } catch (err) {
        setMyStatsError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setMyStatsLoading(false);
      }
    };

    fetchMyStats();
  }, [role, userId, apiFetch]);

  // Admin: Memoized top performers
  const getTopPerformers = (key: keyof Omit<CricketPlayerStats, 'player'>) => {
    if (playerStats.length === 0) return []
    const maxValue = Math.max(...playerStats.map(p => (p[key] ?? 0)))
    return playerStats.filter(p => (p[key] ?? 0) === maxValue)
  }

  const topPerformers = {
    runs: getTopPerformers('totalRuns'),
    wickets: getTopPerformers('totalWickets'),
    matches: getTopPerformers('totalMatches'),
    mom: getTopPerformers('manOfMatchCount')
  }

  // Player View
  if (role === 'player') {
    if (myStatsLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      );
    }

    if (myStatsError || !myStats) {
      return (
        <div className="min-h-screen">
          <div className="p-8 text-center text-red-600 mt-8">
            <h2 className="text-xl font-bold">Error Loading Stats</h2>
            <p>{myStatsError || 'Could not find your statistics.'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={48} className="text-gray-400" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-800">{myStats.player.name}</h1>
            <p className="text-lg text-gray-600">Your Career Statistics</p>
          </div>
        </div>

        {/* General Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Matches Played" value={myStats.totalMatches} icon={<BarChart3 />} />
          <StatCard label="Matches Won" value={myStats.totalWins} icon={<Trophy />} />
          <StatCard label="Man of the Match" value={myStats.manOfMatchCount} icon={<Award />} />
        </div>

        {/* Batting Stats */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Batting Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Runs" value={myStats.totalRuns} icon={<Target />} />
            <StatCard label="Average" value={myStats.battingAverage} icon={<TrendingUp />} />
            <StatCard label="Fours" value={myStats.boundaries.fours} icon={<GitMerge />} />
            <StatCard label="Sixes" value={myStats.boundaries.sixes} icon={<Zap />} />
          </div>
        </div>

        {/* Bowling Stats */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Bowling Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Wickets" value={myStats.totalWickets} icon={<GitCommit />} />
            <StatCard label="Bowling Average" value={myStats.bowlingAverage} icon={<Shield />} />
            <StatCard label="Win Percentage" value={myStats.winPercentage} icon={<TrendingUp />} />
            <StatCard label="Best Figures" value="N/A" icon={<Shield />} />
          </div>
        </div>

        {/* Boundary Stats */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Boundary Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Ones" value={myStats.boundaries.ones} icon={<Target />} />
            <StatCard label="Twos" value={myStats.boundaries.twos} icon={<Target />} />
            <StatCard label="Threes" value={myStats.boundaries.threes} icon={<Target />} />
            <StatCard label="Fours" value={myStats.boundaries.fours} icon={<GitMerge />} />
            <StatCard label="Sixes" value={myStats.boundaries.sixes} icon={<Zap />} />
          </div>
        </div>
      </div>
    );
  }

  // Admin View (existing code)
  if (loading || loadingStats) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading player statistics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main>
        <div className="w-full overflow-x-hidden space-y-8">
            {/* Header */}
            <div className="card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-primary rounded-2xl">
                    <BarChart3 className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Player Statistics</h1>
                    <p className="text-gray-600">Comprehensive performance analytics</p>
                  </div>
                </div>
                <button
                  onClick={loadStats}
                  className="btn-primary flex items-center gap-2"
                >
                  <RefreshCw size={16} className={loadingStats ? 'animate-spin' : ''} />
                  Refresh Stats
                </button>
              </div>
            </div>

          {playerStats.length === 0 ? (
            <div className="card p-8 sm:p-12 text-center">
              <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-600 mb-2">No Statistics Available</h2>
              <p className="text-gray-500">Play some matches to generate player statistics</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {([
                  { title: 'Top Run Scorer', key: 'totalRuns', data: topPerformers.runs, gradient: 'bg-gradient-secondary', icon: Target },
                  { title: 'Top Wicket Taker', key: 'totalWickets', data: topPerformers.wickets, gradient: 'bg-gradient-primary', icon: TrendingUp },
                  { title: 'Most Matches', key: 'totalMatches', data: topPerformers.matches, gradient: 'bg-gradient-accent', icon: Trophy },
                  { title: 'Most MoM Awards', key: 'manOfMatchCount', data: topPerformers.mom, gradient: 'bg-gradient-to-r from-purple-500 to-purple-600', icon: Award }
                ] as const).map(({ title, key, data, gradient, icon: Icon }, idx) => {
                  const value = data[0]?.[key] ?? 0
                  const names = data.map(p => p.player.name).join(', ')
                  return (
                    <div key={idx} className={`${gradient} rounded-2xl shadow-lg p-6 text-white card-hover`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm font-medium">{title}</p>
                          <p className="text-2xl font-bold">{value}</p>
                          <p className="text-white/80 text-sm truncate">{names}</p>
                        </div>
                        <Icon className="text-white/80" size={32} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="card p-4 sm:p-6">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-gray-700 font-medium">Sort by:</span>
                  {([
                    { key: 'runs', label: 'Total Runs' },
                    { key: 'wickets', label: 'Total Wickets' },
                    { key: 'matches', label: 'Matches Played' },
                    { key: 'wins', label: 'Wins' },
                    { key: 'mom', label: 'Man of Match' }
                  ] as const).map(option => (
                    <button
                      key={option.key}
                      onClick={() => setSortBy(option.key)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                        sortBy === option.key 
                          ? 'bg-gradient-primary text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Rank', 'Player', 'Matches', 'Runs', 'Wickets', 'Wins', 'MoM', 'Avg Runs'].map((h, i) => (
                          <th key={i} className={`px-6 py-4 text-sm font-semibold text-gray-600 ${h === 'Player' ? 'text-left' : 'text-center'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {playerStats.sort((a, b) => {
                        switch (sortBy) {
                          case 'matches': return b.totalMatches - a.totalMatches
                          case 'runs': return b.totalRuns - a.totalRuns
                          case 'wickets': return b.totalWickets - a.totalWickets
                          case 'wins': return b.totalWins - a.totalWins
                          case 'mom': return b.manOfMatchCount - a.manOfMatchCount
                          default: return 0
                        }
                      }).map((s, idx) => (
                        <tr key={s.player.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-center font-bold text-gray-500">#{idx + 1}</td>
                          <td className="px-6 py-4 text-left flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="text-green-600" size={20} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{s.player.name}</div>
                              <div className="text-sm text-gray-500">Joined {new Date(s.player.created_at).toLocaleDateString()}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">{s.totalMatches}</td>
                          <td className="px-6 py-4 text-center text-blue-600 font-semibold">{s.totalRuns}</td>
                          <td className="px-6 py-4 text-center text-red-600 font-semibold">{s.totalWickets}</td>
                          <td className="px-6 py-4 text-center text-green-600 font-semibold">{s.totalWins}</td>
                          <td className="px-6 py-4 text-center flex items-center justify-center gap-1">
                            <Trophy className="text-yellow-500" size={16} />
                            <span className="text-yellow-600 font-semibold">{s.manOfMatchCount}</span>
                          </td>
                          <td className="px-6 py-4 text-center">{(s.totalMatches > 0 ? (s.totalRuns / s.totalMatches).toFixed(1) : '0.0')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
