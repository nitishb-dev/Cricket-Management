import React, { useState, useEffect } from 'react'
import { History, Trophy, Calendar, Search, Filter, RotateCcw } from 'lucide-react'
import { useCricket } from '../context/CricketContext'
import { Match, MatchPlayerStats } from '../types/cricket'
import { MatchData } from '../types/cricket'
import dayjs from 'dayjs'

interface MatchHistoryProps {
  onRematch: (matchData: MatchData) => void
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ onRematch }) => {
  const { matches, players, getMatchPlayerStats, loading } = useCricket()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [matchStats, setMatchStats] = useState<MatchPlayerStats[]>([])
  const [filterTeam, setFilterTeam] = useState('')

  const uniqueTeams = Array.from(new Set([
    ...matches.map(m => m.team_a_name),
    ...matches.map(m => m.team_b_name)
  ])).sort()

  const filteredMatches = matches.filter(match => {
    const matchesSearch = 
      match.team_a_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.team_b_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.winner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.man_of_match.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTeamFilter = !filterTeam || 
      match.team_a_name === filterTeam || 
      match.team_b_name === filterTeam

    return matchesSearch && matchesTeamFilter
  })

  const loadMatchStats = async (match: Match) => {
    const stats = await getMatchPlayerStats(match.id)
    setMatchStats(stats)
    setSelectedMatch(match)
  }

  const handleRematch = (match: Match) => {
    const teamAPlayers = matchStats
      .filter(stat => stat.team === match.team_a_name)
      .map(stat => {
        const player = players.find(p => p.id === stat.player_id)
        return player ? { player, runs: 0, wickets: 0 } : null
      })
      .filter(Boolean)

    const teamBPlayers = matchStats
      .filter(stat => stat.team === match.team_b_name)
      .map(stat => {
        const player = players.find(p => p.id === stat.player_id)
        return player ? { player, runs: 0, wickets: 0 } : null
      })
      .filter(Boolean)

    if (teamAPlayers.length > 0 && teamBPlayers.length > 0) {
      const rematchData: MatchData = {
        teamA: {
          name: match.team_a_name,
          players: teamAPlayers as any[]
        },
        teamB: {
          name: match.team_b_name,
          players: teamBPlayers as any[]
        },
        overs: match.overs,
        tossWinner: '',
        tossDecision: 'bat',
        currentInning: 1,
        isCompleted: false
      }
      
      onRematch(rematchData)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <History className="text-green-600" />
          Match History
        </h1>
        <div className="text-sm text-gray-600">
          {matches.length} matches played
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search matches..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Teams</option>
              {uniqueTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400" size={16} />
            <span className="text-sm text-gray-600">
              {filteredMatches.length} matches found
            </span>
          </div>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <History size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No Matches Found</h2>
          <p className="text-gray-500">
            {matches.length === 0 
              ? "No matches have been played yet. Start your first match to see history here."
              : "No matches match your current filters. Try adjusting your search criteria."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Match List */}
          <div className="space-y-4">
            {filteredMatches.map(match => (
              <div
                key={match.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => loadMatchStats(match)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="text-orange-500" size={20} />
                      <span className="font-semibold text-gray-800">
                        {match.team_a_name} vs {match.team_b_name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {dayjs(match.match_date).format('MMM DD, YYYY')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-lg text-gray-800">
                        {match.team_a_score}/{match.team_a_wickets}
                      </div>
                      <div className="text-sm text-gray-600">{match.team_a_name}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-lg text-gray-800">
                        {match.team_b_score}/{match.team_b_wickets}
                      </div>
                      <div className="text-sm text-gray-600">{match.team_b_name}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-green-600">
                        Winner: {match.winner}
                      </div>
                      <div className="text-sm text-gray-600">
                        Man of the Match: {match.man_of_match}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRematch(match)
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw size={14} />
                      Rematch
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{match.overs} overs</span>
                      <span>
                        Toss: {match.toss_winner} ({match.toss_decision === 'bat' ? 'batted' : 'bowled'} first)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Match Details */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selectedMatch ? (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Match Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {selectedMatch.team_a_name} Players
                    </h3>
                    <div className="space-y-2">
                      {matchStats
                        .filter(stat => stat.team === selectedMatch.team_a_name)
                        .map(stat => {
                          const player = players.find(p => p.id === stat.player_id)
                          return player ? (
                            <div key={stat.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="font-medium">{player.name}</span>
                              <span className="text-sm text-gray-600">
                                {stat.runs} runs, {stat.wickets} wickets
                              </span>
                            </div>
                          ) : null
                        })}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {selectedMatch.team_b_name} Players
                    </h3>
                    <div className="space-y-2">
                      {matchStats
                        .filter(stat => stat.team === selectedMatch.team_b_name)
                        .map(stat => {
                          const player = players.find(p => p.id === stat.player_id)
                          return player ? (
                            <div key={stat.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="font-medium">{player.name}</span>
                              <span className="text-sm text-gray-600">
                                {stat.runs} runs, {stat.wickets} wickets
                              </span>
                            </div>
                          ) : null
                        })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleRematch(selectedMatch)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Start Rematch
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <History size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  Click on a match to view detailed statistics
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}