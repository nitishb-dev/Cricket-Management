import React, { useState, useEffect } from 'react'
import { Trophy, Target, AlertCircle, Save, X, Trash2 } from 'lucide-react'
import { useCricket } from '../context/CricketContext'
import { MatchData } from '../types/cricket'
import dayjs from 'dayjs'

interface MatchPlayProps {
  matchData: MatchData
  onMatchComplete: () => void
  onCancel: () => void
}

export const MatchPlay: React.FC<MatchPlayProps> = ({ matchData, onMatchComplete, onCancel }) => {
  const { saveMatch, deleteMatch } = useCricket()
  const [currentMatch, setCurrentMatch] = useState<MatchData>(matchData)
  const [saving, setSaving] = useState(false)
  const [isMatchCompleted, setIsMatchCompleted] = useState(false)
  const [firstInningTotal, setFirstInningTotal] = useState(0)

  const isFirstInning = currentMatch.currentInning === 1

  const tossWinnerKey = currentMatch.tossWinner === currentMatch.teamA.name ? 'teamA' : 'teamB'
  const tossLoserKey = tossWinnerKey === 'teamA' ? 'teamB' : 'teamA'

  const getTeamKey = (team: 'batting' | 'bowling') => {
    if (team === 'batting') {
      return currentMatch.currentInning === 1
        ? currentMatch.tossDecision === 'bat' ? tossWinnerKey : tossLoserKey
        : currentMatch.tossDecision === 'bat' ? tossLoserKey : tossWinnerKey
    } else {
      return currentMatch.currentInning === 1
        ? currentMatch.tossDecision === 'bat' ? tossLoserKey : tossWinnerKey
        : currentMatch.tossDecision === 'bat' ? tossWinnerKey : tossLoserKey
    }
  }

  const battingTeamKey = getTeamKey('batting')
  const bowlingTeamKey = getTeamKey('bowling')
  const battingTeam = currentMatch[battingTeamKey]
  const bowlingTeam = currentMatch[bowlingTeamKey]

  const updatePlayerStats = (
    team: 'batting' | 'bowling',
    playerId: string | number,
    runs: number,
    wickets: number
  ) => {
    if (isMatchCompleted) return
    const key = team === 'batting' ? battingTeamKey : bowlingTeamKey

    setCurrentMatch(prev => {
      const updatedPlayers = prev[key].players.map(player => {
        if (player.player.id == playerId) {
          return {
            ...player,
            runs: team === 'batting' ? runs : player.runs,
            wickets: team === 'bowling' ? wickets : player.wickets
          }
        }
        return player
      })

      return {
        ...prev,
        [key]: {
          ...prev[key],
          players: updatedPlayers
        }
      }
    })
  }

  const incrementRuns = (playerId: string | number, run: number) => {
    const player = battingTeam.players.find(p => p.player.id === playerId)
    if (!player) return
    updatePlayerStats('batting', playerId, player.runs + run, player.wickets)
  }

  const incrementWickets = (playerId: string | number) => {
    const player = bowlingTeam.players.find(p => p.player.id === playerId)
    if (!player) return
    updatePlayerStats('bowling', playerId, player.runs, player.wickets + 1)
  }

  const teamScore = (teamKey: 'teamA' | 'teamB') =>
    currentMatch[teamKey].players.reduce((sum, p) => sum + p.runs, 0)

  const teamWickets = (teamKey: 'teamA' | 'teamB') =>
    teamKey === battingTeamKey
      ? currentMatch[bowlingTeamKey].players.reduce((sum, p) => sum + p.wickets, 0)
      : currentMatch[teamKey].players.reduce((sum, p) => sum + p.wickets, 0)

  const currentScore = teamScore(battingTeamKey)
  const currentWickets = teamWickets(battingTeamKey)
  const target = currentMatch.currentInning === 2 ? firstInningTotal + 1 : 0

  const completeInning = () => {
    const score = teamScore(battingTeamKey)
    const anyRuns = battingTeam.players.some(p => p.runs > 0)
    if (!anyRuns) {
      alert("Cannot complete inning. No runs have been recorded.")
      return
    }
    setFirstInningTotal(score)
    setCurrentMatch(prev => ({ ...prev, currentInning: 2 }))
  }

  const completeMatch = async () => {
    setIsMatchCompleted(true)

    const teamAScore = teamScore('teamA')
    const teamBScore = teamScore('teamB')
    let winner = ''
    if (teamAScore > teamBScore) winner = currentMatch.teamA.name
    else if (teamBScore > teamAScore) winner = currentMatch.teamB.name
    else winner = 'Tie'

    const allPlayers = [...currentMatch.teamA.players, ...currentMatch.teamB.players]
    const manOfMatch = allPlayers.reduce((best, current) => {
      const currentScore = current.runs + current.wickets
      const bestScore = best.runs + best.wickets
      return currentScore > bestScore ? current : best
    })

    const matchToSave = {
      ...currentMatch,
      isCompleted: true,
      winner,
      manOfMatch: manOfMatch.player.name,
      matchDate: dayjs().format('YYYY-MM-DD')
    }

    setSaving(true)
    const savedMatch = await saveMatch(matchToSave)
    setSaving(false)

    if (savedMatch) onMatchComplete()
    else alert('Failed to save match.')
  }

  useEffect(() => {
    if (currentMatch.currentInning === 2 && currentScore >= target && !isMatchCompleted) {
      completeMatch()
    }
  }, [currentScore, target])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {currentMatch.teamA.name} vs {currentMatch.teamB.name}
        </h1>
        <p className="text-gray-600 text-sm">Inning {currentMatch.currentInning}</p>
        {currentMatch.currentInning === 2 && (
          <div className="mt-2 text-lg font-semibold text-orange-600">
            Target: {target} runs
          </div>
        )}
        <div className="text-4xl font-bold mt-2 text-blue-700">
          {currentScore}/{currentWickets}
        </div>
      </div>

      {/* Batting Inputs */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{battingTeam.name} Batting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {battingTeam.players.map(player => (
            <div key={player.player.id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">{player.player.name}</h3>
              <label className="block text-sm mb-1">Runs Scored</label>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 6].map(r => (
                  <button
                    key={r}
                    onClick={() => incrementRuns(player.player.id, r)}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded"
                    disabled={isMatchCompleted}
                  >
                    +{r}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={0}
                disabled={isMatchCompleted}
                value={player.runs}
                onChange={(e) =>
                  updatePlayerStats('batting', player.player.id, parseInt(e.target.value) || 0, player.wickets)
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bowling Inputs */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{bowlingTeam.name} Bowling</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bowlingTeam.players.map(player => (
            <div key={player.player.id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">{player.player.name}</h3>
              <label className="block text-sm mb-1">Wickets Taken</label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => incrementWickets(player.player.id)}
                  className="px-2 py-1 bg-red-100 text-red-700 rounded"
                  disabled={isMatchCompleted}
                >
                  +Wicket
                </button>
              </div>
              <input
                type="number"
                min={0}
                disabled={isMatchCompleted}
                value={player.wickets}
                onChange={(e) =>
                  updatePlayerStats('bowling', player.player.id, player.runs, parseInt(e.target.value) || 0)
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Summary between Innings */}
      {currentMatch.currentInning === 2 && (
        <div className="text-center mt-4 bg-gray-100 p-4 rounded-lg">
          <p className="text-gray-600">
            <strong>{battingTeam.name}</strong> needs <strong>{target}</strong> runs to win.
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="text-center">
        {currentMatch.currentInning === 1 ? (
          <button
            onClick={completeInning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 mx-auto"
          >
            <Target size={20} /> Complete First Inning
          </button>
        ) : (
          <button
            onClick={completeMatch}
            disabled={saving || isMatchCompleted}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 mx-auto"
          >
            <Save size={20} /> {saving ? 'Saving Match...' : 'Complete Match'}
          </button>
        )}
      </div>
    </div>
  )
}


