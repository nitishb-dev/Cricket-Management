import React, { useState } from "react"
import { Play, Settings, ArrowLeft } from "lucide-react"
import { useOutletContext, useLocation } from "react-router-dom"
import { useCricket } from "../context/CricketContext"
import { PlayerManagement } from "./PlayerManagement"
import { Player, MatchData, RematchData } from "../types/cricket"

interface MatchSetupContext {
  onStartMatch: (matchData: MatchData) => void
  onCancelSetup: () => void
}

export const MatchSetup: React.FC = () => {
  const { onStartMatch, onCancelSetup } = useOutletContext<MatchSetupContext>()
  const location = useLocation()
  const rematchData: RematchData | null = location.state as RematchData | null

  useCricket()
  const [step, setStep] = useState<"config" | "teamA" | "teamB" | "toss">("config")
  const [overs, setOvers] = useState<number>(rematchData?.overs || 20)
  const [teamAName, setTeamAName] = useState<string>(
    rematchData?.teamA?.name || "Team A"
  )
  const [teamBName, setTeamBName] = useState<string>(
    rematchData?.teamB?.name || "Team B"
  )
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>(
    rematchData?.teamA?.players?.map((p) => p.player) || []
  )
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>(
    rematchData?.teamB?.players?.map((p) => p.player) || []
  )
  const [tossWinner, setTossWinner] = useState<string>("")
  const [tossDecision, setTossDecision] = useState<"bat" | "bowl">("bat")

  const handleStartMatch = () => {
    if (!tossWinner) return

    const matchData: MatchData = {
      teamA: {
        name: teamAName,
        players: teamAPlayers.map((player) => ({
          player,
          runs: 0,
          wickets: 0,
          ones: 0,
          twos: 0,
          threes: 0,
          fours: 0,
          sixes: 0,
        })),
      },
      teamB: {
        name: teamBName,
        players: teamBPlayers.map((player) => ({
          player,
          runs: 0,
          wickets: 0,
          ones: 0,
          twos: 0,
          threes: 0,
          fours: 0,
          sixes: 0,
        })),
      },
      overs,
      tossWinner,
      tossDecision,
      currentInning: 1,
      isCompleted: false,
    }
    onStartMatch(matchData)
  }

  const renderStep = () => {
    switch (step) {
      case "config":
        return (
          <div className="card p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Settings className="text-primary-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">
                Match Configuration
              </h2>
            </div>

            {/* Overs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Overs
              </label>
              <select
                value={overs}
                onChange={(e) => setOvers(Number(e.target.value))}
                className="input-field"
              >
                {[5, 10, 15, 20, 30, 50].map((val) => (
                  <option key={val} value={val}>
                    {val} Overs
                    {val === 20 ? " (T20)" : val === 50 ? " (ODI)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team A Name
                </label>
                <input
                  type="text"
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className="input-field"
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
                  className="input-field"
                  placeholder="Enter team name"
                />
              </div>
            </div>

            <button
              onClick={() => setStep("teamA")}
              disabled={!teamAName.trim() || !teamBName.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Select {teamAName} Players
            </button>
          </div>
        )

      case "teamA":
      case "teamB": {
        const teamName = step === "teamA" ? teamAName : teamBName
        const selectedPlayers = step === "teamA" ? teamAPlayers : teamBPlayers
        const setPlayers = step === "teamA" ? setTeamAPlayers : setTeamBPlayers
        const onBack = () => setStep(step === "teamA" ? "config" : "teamA")
        const onNext = () => setStep(step === "teamA" ? "teamB" : "toss")

        return (
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                Select {teamName} Players
              </h2>
            </div>

            <PlayerManagement
              title={`Select Players for ${teamName}`}
              selectedPlayers={selectedPlayers}
              onPlayerSelect={(player) => {
                if (
                  step === "teamB" &&
                  teamAPlayers.find((p) => p.id === player.id)
                )
                  return
                setPlayers([...selectedPlayers, player])
              }}
              onPlayerDeselect={(player) => {
                setPlayers(selectedPlayers.filter((p) => p.id !== player.id))
              }}
              maxSelections={11}
              disabledPlayers={step === "teamB" ? teamAPlayers : []}
            />

            <div className="mt-6">
              <button
                onClick={onNext}
                disabled={selectedPlayers.length === 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === "teamA"
                  ? `Next: Select ${teamBName} Players`
                  : "Next: Toss Details"}
              </button>
            </div>
          </div>
        )
      }

      case "toss":
        return (
          <div className="card p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep("teamB")}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Toss Details</h2>
            </div>

            {/* Toss Winner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Toss Winner
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[teamAName, teamBName].map((team) => (
                  <button
                    key={team}
                    onClick={() => setTossWinner(team)}
                    className={`p-3 rounded-xl border-2 transition-all ${tossWinner === team
                        ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold"
                        : "border-gray-300 hover:border-primary-400"
                      }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            {/* Toss Decision */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Toss Decision
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["bat", "bowl"].map((choice) => (
                  <button
                    key={choice}
                    onClick={() => setTossDecision(choice as "bat" | "bowl")}
                    className={`p-3 rounded-xl border-2 transition-all ${tossDecision === choice
                        ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold"
                        : "border-gray-300 hover:border-primary-400"
                      }`}
                  >
                    {choice === "bat" ? "Bat First" : "Bowl First"}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-2">Match Summary</h3>
              <div className="text-sm text-slate-700 space-y-1">
                <p>
                  <strong>Format:</strong> {overs} overs
                </p>
                <p>
                  <strong>Teams:</strong> {teamAName} ({teamAPlayers.length}) vs{" "}
                  {teamBName} ({teamBPlayers.length})
                </p>
                {tossWinner && (
                  <p>
                    <strong>Toss:</strong> {tossWinner} won the toss and chose
                    to {tossDecision}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleStartMatch}
              disabled={!tossWinner}
              className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Start Match
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="space-y-8">
        <div className="card p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-2xl">
                <Settings className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {rematchData ? "Rematch Setup" : "New Match Setup"}
                </h1>
                <p className="text-gray-600">Configure your cricket match</p>
              </div>
            </div>
            <button
              onClick={onCancelSetup}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </div>
        {renderStep()}
      </div>
    </div>
  )
}
