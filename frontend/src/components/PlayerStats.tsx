import React, { useState, useEffect, useCallback } from 'react'
import { BarChart3, Trophy, Target, Award, TrendingUp, User, RefreshCw } from 'lucide-react'
import { useCricket } from '../context/CricketContext'
import { useAuth } from '../context/AuthContext'
import { PlayerStats as CricketPlayerStats } from '../types/cricket'
import { Navigation } from './Navigation'

// const colorMap = {
//   yellow: { from: 'from-yellow-400', to: 'to-yellow-500', text: 'text-yellow-100' },
//   red: { from: 'from-red-400', to: 'to-red-500', text: 'text-red-100' },
//   green: { from: 'from-green-400', to: 'to-green-500', text: 'text-green-100' },
//   purple: { from: 'from-purple-400', to: 'to-purple-500', text: 'text-purple-100' }
// } as const

export const PlayerStats: React.FC = () => {
  const { getAllPlayerStats, loading } = useCricket()
  const { role } = useAuth()
  const [playerStats, setPlayerStats] = useState<CricketPlayerStats[]>([])
  const [sortBy, setSortBy] = useState<'runs' | 'wickets' | 'matches' | 'wins' | 'mom'>('runs')
  const [loadingStats, setLoadingStats] = useState(false)

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

  if (loading || loadingStats) {
    return (
      <>
        <Navigation activeView="stats" role={role || 'admin'} />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading player statistics...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {role === 'player' && <Navigation activeView="stats" role="player" />}
      <main className={role === 'player' ? "pb-0" : ""}>
        <div className="page-container w-full overflow-x-hidden pt-7">
          <div className="content-container space-y-8">
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
        </div>
      </main>
    </div>
  )
}
