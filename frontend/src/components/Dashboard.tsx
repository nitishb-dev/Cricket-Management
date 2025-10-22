import React, { useEffect, useState } from 'react'
import { Trophy, Users, History, Calendar, Play, Target, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCricket } from '../context/CricketContext'
import dayjs from 'dayjs'
import { PlayerStats } from '../types/cricket'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { players, matches, loading, getAllPlayerStats } = useCricket()
  const [recentMatches, setRecentMatches] = useState(matches.slice(0, 3))
  const [topStats, setTopStats] = useState<{
    topScorer: PlayerStats | null
    topWicketTaker: PlayerStats | null
  }>({
    topScorer: null,
    topWicketTaker: null
  })

  useEffect(() => {
    setRecentMatches(matches.slice(0, 3))
  }, [matches])

  useEffect(() => {
    const fetchTopPlayers = async () => {
      const stats = await getAllPlayerStats()
      if (stats && stats.length > 0) {
        const scorer = [...stats].sort((a, b) => b.totalRuns - a.totalRuns)[0]
        const wicketTaker = [...stats].sort((a, b) => b.totalWickets - a.totalWickets)[0]
        setTopStats({
          topScorer: scorer.totalRuns > 0 ? scorer : null,
          topWicketTaker: wicketTaker.totalWickets > 0 ? wicketTaker : null
        })
      }
    }

    if (matches.length > 0) {
      fetchTopPlayers()
    }
  }, [matches, getAllPlayerStats])

  const stats = [
    {
      title: 'Total Players',
      value: players.length,
      icon: Users,
      gradient: 'from-green-500 to-green-600',
      action: () => navigate('/players')
    },
    {
      title: 'Matches Played',
      value: matches.length,
      icon: History,
      gradient: 'from-orange-500 to-orange-600',
      action: () => navigate('/history')
    },
    {
      title: 'Active Season',
      value: '2025',
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      action: () => navigate('/stats')
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="space-y-6">
        <div className="relative overflow-hidden bg-gradient-primary rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

          <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center text-white">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
                <Trophy className="relative text-orange-300" size={56} />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
              Welcome to Cricket Manager
            </h1>
            <p className="text-sm sm:text-lg text-green-100 mb-6 max-w-xl mx-auto">
              Your ultimate cricket management platform. Track matches, analyze performance, and build winning teams.
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => navigate('/app/new-match')}
                className="btn-secondary group flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                <Play size={20} className="group-hover:rotate-12 transition-transform" />
                Start New Match
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon

            return (
              <div
                key={index}
                onClick={stat.action}
                className="stats-card group p-4 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                    <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-orange-400 rounded-full"></div>
                  </div>
                  <div className={`bg-gradient-to-r ${stat.gradient} p-3 sm:p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={22} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Matches */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl">
                <Trophy className="text-white" size={20} />
              </div>
              Recent Matches
            </h2>
            <button
              onClick={() => navigate('/history')}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              View All
              <History size={16} />
            </button>
          </div>

          {recentMatches.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="relative mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-20"></div>
                <History size={56} className="relative mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No matches played yet</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                Start your cricket journey by creating your first match. Track scores, manage teams, and build your cricket legacy.
              </p>
              <button
                onClick={() => navigate('/app/new-match')}
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Play size={18} />
                Create First Match
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="group relative bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-bold text-gray-800">
                        {match.team_a_name} vs {match.team_b_name}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {match.overs} overs
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      {dayjs(match.match_date).format('MMM DD, YYYY')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <span className="font-semibold text-gray-700">{match.team_a_name}</span>
                        <span className="text-lg font-bold text-blue-600">{match.team_a_score}/{match.team_a_wickets}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <span className="font-semibold text-gray-700">{match.team_b_name}</span>
                        <span className="text-lg font-bold text-purple-600">{match.team_b_score}/{match.team_b_wickets}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-2">
                      <div className="text-center lg:text-right">
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-md">
                          <Trophy size={14} />
                          {match.winner}
                        </div>
                      </div>
                      <div className="text-center lg:text-right">
                        <span className="text-sm text-gray-600">Man of the Match: </span>
                        <span className="font-semibold text-orange-600">{match.man_of_match}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {topStats.topScorer ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Target size={20} />
                  </div>
                  <h3 className="text-lg font-bold">Top Run Scorer</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold mb-1">{topStats.topScorer.player.name}</p>
                <p className="text-lg sm:text-xl opacity-90 flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  {topStats.topScorer.totalRuns} Runs
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 text-center border-2 border-dashed border-gray-300">
              <Target size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No run scorer data yet</p>
              <p className="text-sm text-gray-500 mt-2">Play matches to see top performers</p>
            </div>
          )}

          {topStats.topWicketTaker ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="text-lg font-bold">Top Wicket Taker</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold mb-1">{topStats.topWicketTaker.player.name}</p>
                <p className="text-lg sm:text-xl opacity-90 flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  {topStats.topWicketTaker.totalWickets} Wickets
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 text-center border-2 border-dashed border-gray-300">
              <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No wicket taker data yet</p>
              <p className="text-sm text-gray-500 mt-2">Play matches to see top performers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
