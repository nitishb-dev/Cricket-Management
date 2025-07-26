import React, { useState, useEffect } from 'react'
import { Trophy, Target, Users, AlertCircle, Save, X } from 'lucide-react'
import { useCricket } from '../context/CricketContext'
import { MatchData, TeamPlayer } from '../types/cricket'
import dayjs from 'dayjs'

interface MatchPlayProps {
  matchData: MatchData
  onMatchComplete: () => void
  onCancel: () => void
}

export const MatchPlay: React.FC<MatchPlayProps> = ({ matchData, onMatchComplete, onCancel }) => {
  const { saveMatch } = useCricket()
  const [currentMatch, setCurrentMatch] = useState<MatchData>(matchData)
  const [saving, setSaving] = useState(false)

  const battingTeam = currentMatch.currentInning === 1 ? currentMatch.teamA : currentMatch.teamB
  const bowlingTeam = currentMatch.currentInning === 1 ? currentMatch.teamB : currentMatch.teamA
  
  const firstInningScore = currentMatch.teamA.players.reduce((sum, p) => sum + p.runs, 0)
  const target = currentMatch.currentInning === 2 ? firstInningScore + 1 : 0
  const currentScore = battingTeam.players.reduce((sum, p) => sum + p.runs, 0)
  const currentWickets = battingTeam.players.reduce((sum, p) => sum + p.wickets, 0)

  const updatePlayerStats = (playerId: string, runs: number, wickets: number) => {
    setCurrentMatch(prev => {
      const isTeamA = prev.currentInning === 1
      const teamKey = isTeamA ? 'teamA' : 'teamB'
      const currentTeam = isTeamA ? prev.teamA : prev.teamB
      
      return {
        ...prev,
        [teamKey]: {
          ...currentTeam,
          players: currentTeam.players.map(p =>
            p.player.id === playerId ? { ...p, runs, wickets } : p
          )
        }
      }
    })
  }

  const completeInning = () => {
    if (currentMatch.currentInning === 1) {
      setCurrentMatch(prev => ({ ...prev, currentInning: 2 }))
    } else {
      completeMatch()
    }
  }

  const completeMatch = async () => {
    try {
      console.log('Completing match with data:', currentMatch)
      
      const teamAScore = currentMatch.teamA.players.reduce((sum, p) => sum + p.runs, 0)
      const teamBScore = currentMatch.teamB.players.reduce((sum, p) => sum + p.runs, 0)
      
      console.log('Scores - Team A:', teamAScore, 'Team B:', teamBScore)
      
      let winner = ''
      if (teamAScore > teamBScore) {
        winner = currentMatch.teamA.name
      } else if (teamBScore > teamAScore) {
        winner = currentMatch.teamB.name
      } else {
        winner = 'Tie'
      }

      // Determine Man of the Match (highest runs + wickets combined)
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

      console.log('Saving match:', matchToSave)

      setSaving(true)
      const savedMatch = await saveMatch(matchToSave)
      setSaving(false)

      console.log('Save result:', savedMatch)

      if (savedMatch) {
        onMatchComplete()
      } else {
        console.error('Failed to save match')
        alert('Failed to save match. Please try again.')
      }
    } catch (error) {
      console.error('Error completing match:', error)
      setSaving(false)
      alert('Error completing match. Please try again.')
    }
  }

  const isInningComplete = () => {
    const maxOvers = currentMatch.overs * 6 // 6 balls per over
    const ballsFaced = battingTeam.players.reduce((sum, p) => sum + p.runs + p.wickets, 0)
    const allOut = currentWickets >= battingTeam.players.length - 1
    
    if (currentMatch.currentInning === 2) {
      return allOut || ballsFaced >= maxOvers || currentScore >= target
    }
    
    return allOut || ballsFaced >= maxOvers
  }

  const shouldAutoComplete = () => {
    if (currentMatch.currentInning === 2 && currentScore >= target) {
      return true
    }
    return false
  }

  useEffect(() => {
    if (shouldAutoComplete()) {
      setTimeout(() => completeMatch(), 1000)
    }
  }, [currentScore, target])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Match Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {currentMatch.teamA.name} vs {currentMatch.teamB.name}
          </h1>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{currentMatch.overs}</div>
            <div className="text-sm text-green-700">Overs per side</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              Inning {currentMatch.currentInning}
            </div>
            <div className="text-sm text-blue-700">
              {battingTeam.name} batting
            </div>
          </div>
          
          {currentMatch.currentInning === 2 && (
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{target}</div>
              <div className="text-sm text-orange-700">Target to win</div>
            </div>
          )}
        </div>

        {/* Toss Information */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
          <span className="text-sm text-gray-600">
            Toss: <strong>{currentMatch.tossWinner}</strong> won and chose to{' '}
            <strong>{currentMatch.tossDecision === 'bat' ? 'bat first' : 'bowl first'}</strong>
          </span>
        </div>
      </div>

      {/* Current Score */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-800 mb-2">
            {currentScore}/{currentWickets}
          </div>
          <div className="text-xl text-gray-600">
            {battingTeam.name} - Inning {currentMatch.currentInning}
          </div>
          
          {currentMatch.currentInning === 2 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-800">
                Need {Math.max(0, target - currentScore)} runs to win
              </div>
              {currentScore >= target && (
                <div className="text-green-600 font-bold mt-2">
                  🎉 {battingTeam.name} Won!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Player Statistics Input */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Users className="text-green-600" />
          {battingTeam.name} Players
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {battingTeam.players.map((player) => (
            <div key={player.player.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">{player.player.name}</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Runs Scored
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={player.runs}
                    onChange={(e) => updatePlayerStats(
                      player.player.id,
                      Math.max(0, parseInt(e.target.value) || 0),
                      player.wickets
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wickets Taken
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={player.wickets}
                    onChange={(e) => updatePlayerStats(
                      player.player.id,
                      player.runs,
                      Math.max(0, parseInt(e.target.value) || 0)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Controls */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentMatch.currentInning === 1 ? (
            <button
              onClick={completeInning}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Target size={20} />
              Complete First Inning
            </button>
          ) : (
            <>
              <button
                onClick={completeMatch}
                disabled={saving}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Saving Match...' : 'Complete Match'}
              </button>
              <button
                onClick={() => console.log('Current match state:', currentMatch)}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Debug State
              </button>
            </>
          )}
        </div>

        {isInningComplete() && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle size={20} />
              <span className="font-medium">
                Inning {currentMatch.currentInning} appears to be complete. You can now proceed to the next stage.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* First Inning Summary (when in second inning) */}
      {currentMatch.currentInning === 2 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">First Inning Summary</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold">
              {currentMatch.teamA.name}: {firstInningScore}/{currentMatch.teamA.players.reduce((sum, p) => sum + p.wickets, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Target for {currentMatch.teamB.name}: {target} runs
            </div>
          </div>
        </div>
      )}
    </div>
  )
}