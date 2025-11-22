import React, { useState } from 'react'
import { History, Trophy, Calendar, Search, Filter, RotateCcw, Trash2 } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { useCricket } from '../context/CricketContext'
import { Match, MatchPlayerStats, MatchData, TeamPlayer } from '../types/cricket'
import dayjs from 'dayjs'

interface MatchHistoryContext {
  onRematch: (matchData: MatchData) => void
}

export const MatchHistory: React.FC = () => {
  const { onRematch } = useOutletContext<MatchHistoryContext>()
  const { matches, players, getMatchPlayerStats, loading, deleteMatch } = useCricket()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [matchStats, setMatchStats] = useState<MatchPlayerStats[]>([])
  const [filterTeam, setFilterTeam] = useState('')

  const uniqueTeams = Array.from(
    new Set([
      ...matches.map(m => m.team_a_name),
      ...matches.map(m => m.team_b_name)
    ])
  ).sort()

  const filteredMatches = matches.filter(match => {
    const matchesSearch =
      match.team_a_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.team_b_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.winner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.man_of_match.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTeamFilter =
      !filterTeam || match.team_a_name === filterTeam || match.team_b_name === filterTeam

    return matchesSearch && matchesTeamFilter
  })

  const loadMatchStats = async (match: Match) => {
    const stats = await getMatchPlayerStats(match.id)
    setMatchStats(stats)
    setSelectedMatch(match)
  }

  const handleRematch = async (match: Match) => {
    const stats = await getMatchPlayerStats(match.id)

    const playerMap = new Map(players.map(p => [p.id, p]));
    const teamAPlayers: TeamPlayer[] = [];
    const teamBPlayers: TeamPlayer[] = [];

    stats.forEach(stat => {
      const player = playerMap.get(stat.player_id);
      if (!player) return;
      const teamPlayer: TeamPlayer = {
        player,
        runs: 0,
        wickets: 0,
        ones: 0,
        twos: 0,
        threes: 0,
        fours: 0,
        sixes: 0
      };
      if (stat.team === match.team_a_name) teamAPlayers.push(teamPlayer);
      else if (stat.team === match.team_b_name) teamBPlayers.push(teamPlayer);
    });

    if (teamAPlayers.length > 0 && teamBPlayers.length > 0) {
      const tossWinner = window.prompt('Who won the toss? (Enter team name exactly)', match.team_a_name)
      if (!tossWinner || (tossWinner !== match.team_a_name && tossWinner !== match.team_b_name)) {
        alert('Invalid toss winner name. Rematch cancelled.')
        return
      }

      const tossDecision = window.prompt('What did the toss winner choose? (Enter "bat" or "bowl")', 'bat')
      if (!['bat', 'bowl'].includes(tossDecision || '')) {
        alert('Invalid toss decision. Rematch cancelled.')
        return
      }

      const rematchData: MatchData = {
        teamA: { name: match.team_a_name, players: teamAPlayers },
        teamB: { name: match.team_b_name, players: teamBPlayers },
        overs: match.overs,
        tossWinner,
        tossDecision: tossDecision as 'bat' | 'bowl',
        currentInning: 1,
        isCompleted: false
      }

      onRematch(rematchData)
    }
  }

  const handleDelete = async (e: React.MouseEvent, matchId: string) => {
    e.stopPropagation()
    const confirmDelete = window.confirm('Are you sure you want to delete this match?')
    if (!confirmDelete) return
    try {
      await deleteMatch(matchId)
      setSelectedMatch(null)
      setMatchStats([])
    } catch {
      alert('Failed to delete match.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="space-y-8">
        {/* Header */}
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-2xl">
                <History className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Match History</h1>
                <p className="text-gray-600">Review past matches and performance</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-secondary rounded-xl text-white font-semibold">
              {matches.length} matches played
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search matches..."
                className="input-field pl-10"
              />
            </div>

            {/* Team Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="input-field pl-10 appearance-none"
              >
                <option value="">All Teams</option>
                {uniqueTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            {/* Matches Found */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="text-gray-400" size={16} />
              {filteredMatches.length} matches found
            </div>
          </div>
        </div>

        {/* Matches + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Matches List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredMatches.map(match => (
              <div
                key={match.id}
                className="card p-0 transition-shadow duration-300 hover:shadow-xl cursor-pointer"
                onClick={() => loadMatchStats(match)}
              >
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="text-orange-500" size={20} />
                      <span className="font-semibold text-gray-800 text-sm sm:text-base">
                        {match.team_a_name} vs {match.team_b_name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {dayjs(match.match_date).format('MMM DD, YYYY')}
                    </span>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
                      <div className="font-bold text-lg text-gray-800">
                        {match.team_a_score}/{match.team_a_wickets}
                      </div>
                      <div className="text-sm text-gray-600">{match.team_a_name}</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="font-bold text-lg text-gray-800">
                        {match.team_b_score}/{match.team_b_wickets}
                      </div>
                      <div className="text-sm text-gray-600">{match.team_b_name}</div>
                    </div>
                  </div>

                  {/* Result + Actions */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <div className="font-semibold text-green-600">
                        Winner: {match.winner}
                      </div>
                      <div className="text-sm text-gray-600">
                        Man of the Match: {match.man_of_match}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          await handleRematch(match)
                        }}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 transition-colors flex items-center gap-1 shadow-md hover:shadow-lg"
                      >
                        <RotateCcw size={14} /> Rematch
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, match.id)}
                        className="px-3 py-1 bg-orange-600 text-white text-sm rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-1 shadow-md hover:shadow-lg"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Match Meta */}
                  <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600 flex flex-col sm:flex-row sm:justify-between">
                    <span>{match.overs} overs</span>
                    <span>
                      Toss: {match.toss_winner} ({match.toss_decision === 'bat' ? 'batted' : 'bowled'} first)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selectedMatch ? (
              <div className="card p-4 sm:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                  Match Details
                </h2>
                <div className="space-y-6">
                  {[selectedMatch.team_a_name, selectedMatch.team_b_name].map(team => {
                    const teamStats = matchStats
                      .filter(stat => stat.team === team)
                      .reduce((unique, stat) => {
                        const exists = unique.find(u => u.player_id === stat.player_id)
                        if (!exists) unique.push(stat)
                        return unique
                      }, [] as MatchPlayerStats[])

                    return (
                      <div key={team} className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">{team} Players</h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {teamStats.map(stat => {
                            const player = players.find(p => p.id === stat.player_id)
                            if (!player) return null
                            return (
                              <li key={stat.id} className="flex justify-between border-b py-1">
                                <span className="font-medium">{player.name}</span>
                                <span>{stat.runs} runs, {stat.wickets} wickets</span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <History size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  Click on a match to view detailed statistics
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
