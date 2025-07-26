import React, { useState, useEffect } from 'react'
import { BarChart3, Trophy, Target, Award, TrendingUp, User } from 'lucide-react'
import { useCricket } from '../context/CricketContext'
import { PlayerStats as CricketPlayerStats } from '../types/cricket'

export const PlayerStats: React.FC = () => {
  const { getAllPlayerStats, loading } = useCricket()
  const [playerStats, setPlayerStats] = useState<CricketPlayerStats[]>([])
  const [sortBy, setSortBy] = useState<'matches' | 'runs' | 'wickets' | 'wins' | 'mom'>('runs')
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoadingStats(true)
    const stats = await getAllPlayerStats()
    setPlayerStats(stats)
    setLoadingStats(false)
  }

  const sortedStats = [...playerStats].sort((a, b) => {
    switch (sortBy) {
      case 'matches':
        return b.totalMatches - a.totalMatches
      case 'runs':
        return b.totalRuns - a.totalRuns
      case 'wickets':
        return b.totalWickets - a.totalWickets
      case 'wins':
        return b.totalWins - a.totalWins
      case 'mom':
        return b.manOfMatchCount - a.manOfMatchCount
      default:
        return 0
    }
  })

  const getPlayerRank = (stats: CricketPlayerStats, category: keyof Omit<CricketPlayerStats, 'player'>) => {
    const sorted = [...playerStats].sort((a, b) => (b[category] as number) - (a[category] as number))
    return sorted.findIndex(p => p.player.id === stats.player.id) + 1
  }

  const topPerformers = {
    runs: playerStats.sort((a, b) => b.totalRuns - a.totalRuns)[0],
    wickets: playerStats.sort((a, b) => b.totalWickets - a.totalWickets)[0],
    matches: playerStats.sort((a, b) => b.totalMatches - a.totalMatches)[0],
    mom: playerStats.sort((a, b) => b.manOfMatchCount - a.manOfMatchCount)[0]
  }

  if (loading || loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading player statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-green-600" />
          Player Statistics
        </h1>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Refresh Stats
        </button>
      </div>

      {playerStats.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No Statistics Available</h2>
          <p className="text-gray-500">
            Play some matches to generate player statistics
          </p>
        </div>
      ) : (
        <>
          {/* Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Top Run Scorer</p>
                  <p className="text-2xl font-bold">{topPerformers.runs?.totalRuns || 0}</p>
                  <p className="text-yellow-100 text-sm">{topPerformers.runs?.player.name || 'N/A'}</p>
                </div>
                <Target className="text-yellow-100" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Top Wicket Taker</p>
                  <p className="text-2xl font-bold">{topPerformers.wickets?.totalWickets || 0}</p>
                  <p className="text-red-100 text-sm">{topPerformers.wickets?.player.name || 'N/A'}</p>
                </div>
                <TrendingUp className="text-red-100" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Most Matches</p>
                  <p className="text-2xl font-bold">{topPerformers.matches?.totalMatches || 0}</p>
                  <p className="text-green-100 text-sm">{topPerformers.matches?.player.name || 'N/A'}</p>
                </div>
                <Trophy className="text-green-100" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Most MoM Awards</p>
                  <p className="text-2xl font-bold">{topPerformers.mom?.manOfMatchCount || 0}</p>
                  <p className="text-purple-100 text-sm">{topPerformers.mom?.player.name || 'N/A'}</p>
                </div>
                <Award className="text-purple-100" size={32} />
              </div>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-wrap gap-2">
              <span className="text-gray-700 font-medium">Sort by:</span>
              {[
                { key: 'runs', label: 'Total Runs' },
                { key: 'wickets', label: 'Total Wickets' },
                { key: 'matches', label: 'Matches Played' },
                { key: 'wins', label: 'Wins' },
                { key: 'mom', label: 'Man of Match' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setSortBy(option.key as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sortBy === option.key
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Player Statistics Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Player</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Matches</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Runs</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Wickets</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Wins</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">MoM</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Avg Runs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedStats.map((stats, index) => (
                    <tr key={stats.player.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="text-green-600" size={20} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{stats.player.name}</div>
                            <div className="text-sm text-gray-500">
                              Joined {new Date(stats.player.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-gray-800">{stats.totalMatches}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-blue-600">{stats.totalRuns}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-red-600">{stats.totalWickets}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-green-600">{stats.totalWins}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Trophy className="text-yellow-500" size={16} />
                          <span className="text-lg font-semibold text-yellow-600">{stats.manOfMatchCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {stats.totalMatches > 0 ? (stats.totalRuns / stats.totalMatches).toFixed(1) : '0.0'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}