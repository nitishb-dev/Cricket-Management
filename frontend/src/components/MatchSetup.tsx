import React, { useState } from 'react'
import { Play, Settings, ArrowLeft } from 'lucide-react'
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
  const [overs, setOvers] = useState(rematchData?.overs || 20)
  const [teamAName, setTeamAName] = useState(rematchData?.teamA.name || 'Team A')
  const [teamBName, setTeamBName] = useState(rematchData?.teamB.name || 'Team B')
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>(rematchData?.teamA.players.map(p => p.player) || [])
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>(rematchData?.teamB.players.map(p => p.player) || [])
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
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="text-green-600" size={24} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Match Configuration</h2>
            </div>

            <div className="space-y-6">
              {/* Overs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Overs</label>
                <select
                  value={overs}
                  onChange={(e) => setOvers(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {[5, 10, 15, 20, 30, 50].map(val => (
                    <option key={val} value={val}>{val} Overs{val === 20 ? ' (T20)' : val === 50 ? ' (ODI)' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Team Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team A Name</label>
                  <input
                    type="text"
                    value={teamAName}
                    onChange={(e) => setTeamAName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team B Name</label>
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
      case 'teamB': {
        const teamName = step === 'teamA' ? teamAName : teamBName
        const selectedPlayers = step === 'teamA' ? teamAPlayers : teamBPlayers
        const setPlayers = step === 'teamA' ? setTeamAPlayers : setTeamBPlayers
        const onBack = () => setStep(step === 'teamA' ? 'config' : 'teamA')
        const onNext = () => setStep(step === 'teamA' ? 'teamB' : 'toss')

        return (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={onBack} className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Select {teamName} Players</h2>
            </div>

            {/* <PlayerManagement
              title={`Select Players for ${teamName}`}
              selectedPlayers={selectedPlayers}
              onPlayerSelect={(player) => {
                if (step === 'teamB' && teamAPlayers.find(p => p.id === player.id)) return
                setPlayers([...selectedPlayers, player])
              }}
              onPlayerDeselect={(player) => {
                setPlayers(selectedPlayers.filter(p => p.id !== player.id))
              }}
              maxSelections={11}
            /> */}

<PlayerManagement
  title={`Select Players for ${teamName}`}
  selectedPlayers={selectedPlayers}
  onPlayerSelect={(player) => {
    if (step === 'teamB' && teamAPlayers.find(p => p.id === player.id)) return
    setPlayers([...selectedPlayers, player])
  }}
  onPlayerDeselect={(player) => {
    setPlayers(selectedPlayers.filter(p => p.id !== player.id))
  }}
  maxSelections={11}
  disabledPlayers={step === 'teamB' ? teamAPlayers : []} // ✅ Disable already selected players in Team A
/>


            <div className="mt-6">
              <button
                onClick={onNext}
                disabled={selectedPlayers.length === 0}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {step === 'teamA' ? `Next: Select ${teamBName} Players` : 'Next: Toss Details'}
              </button>
            </div>
          </div>
        )
      }

      case 'toss':
        return (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setStep('teamB')} className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Toss Details</h2>
            </div>

            <div className="space-y-6">
              {/* Toss Winner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Toss Winner</label>
                <div className="grid grid-cols-2 gap-3">
                  {[teamAName, teamBName].map(team => (
                    <button
                      key={team}
                      onClick={() => setTossWinner(team)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        tossWinner === team
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toss Decision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Toss Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  {['bat', 'bowl'].map(choice => (
                    <button
                      key={choice}
                      onClick={() => setTossDecision(choice as 'bat' | 'bowl')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        tossDecision === choice
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {choice === 'bat' ? 'Bat First' : 'Bowl First'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Match Summary</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Format:</strong> {overs} overs</p>
                  <p><strong>Teams:</strong> {teamAName} ({teamAPlayers.length}) vs {teamBName} ({teamBPlayers.length})</p>
                  <p><strong>Toss:</strong> {tossWinner} won the toss and chose to {tossDecision}</p>
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
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
