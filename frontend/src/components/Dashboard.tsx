import React, { useEffect, useState } from 'react'
import { Trophy, Users, History, TrendingUp, Play, Calendar } from 'lucide-react'
import { useCricket } from '../context/CricketContext'
import { PlayerStats } from '../types/cricket'
import dayjs from 'dayjs'

type ActiveView = 'dashboard' | 'players' | 'newMatch' | 'playMatch' | 'history' | 'stats'

interface DashboardProps {
  onNavigate: (view: ActiveView) => void
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { players, matches, loading } = useCricket()
  const [recentMatches, setRecentMatches] = useState(matches.slice(0, 3))
  const [topPlayers, setTopPlayers] = useState<PlayerStats[]>([])

  useEffect(() => {
    setRecentMatches(matches.slice(0, 3))
  }, [matches])

  const stats = [
    {
      title: 'Total Players',
      value: players.length,
      icon: Users,
      color: 'bg-blue-500',
      action: () => onNavigate('players')
    },
    {
      title: 'Matches Played',
      value: matches.length,
      icon: History,
      color: 'bg-green-500',
      action: () => onNavigate('history')
    },
    {
      title: 'Active Season',
      value: '2025',
      icon: Calendar,
      color: 'bg-orange-500',
      action: () => onNavigate('stats')
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Welcome to Cricket Manager
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track matches, manage players, and analyze cricket statistics
        </p>
        
        <button
          onClick={() => onNavigate('newMatch')}
          className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <Play size={24} />
          Start New Match
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              onClick={stat.action}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Matches */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="text-orange-500" />
            Recent Matches
          </h2>
          <button
            onClick={() => onNavigate('history')}
            className="text-green-600 font-medium hover:text-green-700 transition-colors"
          >
            View All
          </button>
        </div>

        {recentMatches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No matches played yet</p>
            <p className="text-sm mb-4">Start your first match to see results here</p>
            <button
              onClick={() => onNavigate('newMatch')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create First Match
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentMatches.map(match => (
              <div
                key={match.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-800">
                      {match.team_a_name} vs {match.team_b_name}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                      {match.overs} overs
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {dayjs(match.match_date).format('MMM DD, YYYY')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{match.team_a_name}:</span> {match.team_a_score}/{match.team_a_wickets} • 
                    <span className="font-medium ml-2">{match.team_b_name}:</span> {match.team_b_score}/{match.team_b_wickets}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{match.winner} Won</div>
                    <div className="text-sm text-gray-500">MoM: {match.man_of_match}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Manage Players</h3>
          <p className="mb-4 opacity-90">Add new players and view their profiles</p>
          <button
            onClick={() => onNavigate('players')}
            className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Manage Players
          </button>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
          <h3 className="text-xl font-bold mb-2">View Statistics</h3>
          <p className="mb-4 opacity-90">Analyze player performance and trends</p>
          <button
            onClick={() => onNavigate('stats')}
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            View Stats
          </button>
        </div>
      </div>
    </div>
  )
}