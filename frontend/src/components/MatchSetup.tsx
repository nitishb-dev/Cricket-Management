import React, { useState } from 'react'
import { Play, Settings, Users, ArrowLeft } from 'lucide-react'
import { useCricket } from '../context/CricketContext'
import { PlayerManagement } from './PlayerManagement'
import { Player, MatchData, MatchTeam } from '../types/cricket'

interface MatchSetupProps {
  onStartMatch: (matchData: MatchData) => void
  onCancel: () => void
  rematchData?: {
    teamA: MatchTeam
    teamB: MatchTeam
    overs: number
  }
}

export const MatchSetup: React.FC<MatchSetupProps> = ({ onStartMatch, onCancel, rematchData }) => {
  const { players } = useCricket()
  const [step, setStep] = useState<'config' | 'teamA' | 'teamB' | 'toss'>('config')
  
  // Match configuration
  const [overs, setOvers] = useState(rematchData?.overs || 20)
  const [teamAName, setTeamAName] = useState(rematchData?.teamA.name || 'Team A')
  const [teamBName, setTeamBName] = useState(rematchData?.teamB.name || 'Team B')
  
  // Team selection
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>(
    rematchData?.teamA.players.map(p => p.player) || []
  )
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>(
    rematchData?.teamB.players.map(p => p.player) || []
  )
  
  // Toss
  const [tossWinner, setTossWinner] = useState('')
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat')

  const handleStartMatch = () => {
    const matchData: MatchData = {
      teamA: {
        name: teamAName,
        players: teamAPlayers.map(player => ({ player, runs: 0, wickets: 0 }))
      },
      teamB: {
        name: teamBName,
        players: teamBPlayers.map(player => ({ player, runs: 0, wickets: 0 }))
      },
      overs,
      tossWinner,
      tossDecision,
      currentInning: 1,
      isCompleted: false
    }
    
    onStartMatch(matchData)
  }

  const renderStep = () => {
    switch (step) {
      case 'config':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="text-green-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Match Configuration</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Overs
                </label>
                <select
                  value={overs}
                  onChange={(e) => setOvers(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={5}>5 Overs</option>
                  <option value={10}>10 Overs</option>
                  <option value={15}>15 Overs</option>
                  <option value={20}>20 Overs (T20)</option>
                  <option value={30}>30 Overs</option>
                  <option value={50}>50 Overs (ODI)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team A Name
                  </label>
                  <input
                    type="text"
                    value={teamAName}
                    onChange={(e) => setTeamAName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter team name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team B Name
                  </label>
                  <input
                    type="text"
                    value={teamBName}
                    onChange={(e) => setTeamBName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter team name"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep('teamA')}
                disabled={!teamAName.trim() || !teamBName.trim()}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Next: Select {teamAName} Players
              </button>
            </div>
          </div>
        )

      case 'teamA':
        return (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setStep('config')}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Select {teamAName} Players</h2>
            </div>
            
            <PlayerManagement
              title={`Select Players for ${teamAName}`}
              selectedPlayers={teamAPlayers}
              onPlayerSelect={(player) => setTeamAPlayers([...teamAPlayers, player])}
              onPlayerDeselect={(player) => setTeamAPlayers(teamAPlayers.filter(p => p.id !== player.id))}
              maxSelections={11}
            />
            
            <div className="mt-6">
              <button
                onClick={() => setStep('teamB')}
                disabled={teamAPlayers.length === 0}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Next: Select {teamBName} Players
              </button>
            </div>
          </div>
        )

      case 'teamB':
        return (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setStep('teamA')}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Select {teamBName} Players</h2>
            </div>
            
            <PlayerManagement
              title={`Select Players for ${teamBName}`}
              selectedPlayers={teamBPlayers}
              onPlayerSelect={(player) => {
                if (!teamAPlayers.find(p => p.id === player.id)) {
                  setTeamBPlayers([...teamBPlayers, player])
                }
              }}
              onPlayerDeselect={(player) => setTeamBPlayers(teamBPlayers.filter(p => p.id !== player.id))}
              maxSelections={11}
            />
            
            <div className="mt-6">
              <button
                onClick={() => setStep('toss')}
                disabled={teamBPlayers.length === 0}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Next: Toss Details
              </button>
            </div>
          </div>
        )

      case 'toss':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setStep('teamB')}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Toss Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Toss Winner
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTossWinner(teamAName)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      tossWinner === teamAName
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {teamAName}
                  </button>
                  <button
                    onClick={() => setTossWinner(teamBName)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      tossWinner === teamBName
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {teamBName}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Toss Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTossDecision('bat')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      tossDecision === 'bat'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Bat First
                  </button>
                  <button
                    onClick={() => setTossDecision('bowl')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      tossDecision === 'bowl'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Bowl First
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Match Summary</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Format:</strong> {overs} overs per side</p>
                  <p><strong>Teams:</strong> {teamAName} ({teamAPlayers.length} players) vs {teamBName} ({teamBPlayers.length} players)</p>
                  <p><strong>Toss:</strong> {tossWinner} won and chose to {tossDecision === 'bat' ? 'bat first' : 'bowl first'}</p>
                </div>
              </div>

              <button
                onClick={handleStartMatch}
                disabled={!tossWinner}
                className="w-full px-6 py-3 bg-green-600 text-white text-lg rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Start Match
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {rematchData ? 'Rematch Setup' : 'New Match Setup'}
        </h1>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>

      {renderStep()}
    </div>
  )
}