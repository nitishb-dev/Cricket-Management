import React, { useState, useEffect, useMemo } from "react"
import {
  Play,
  Settings,
  ArrowLeft,
  Users,
  Search,
  GripVertical,
} from "lucide-react"
import { useCricket } from "../context/CricketContext"
import { Player, MatchData, MatchTeam } from "../types/cricket"
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"

type PlayerColumnId = "available" | "teamA" | "teamB"

interface PlayerColumns {
  available: Player[]
  teamA: Player[]
  teamB: Player[]
}

// --- Draggable Player Card Component ---
const PlayerCard = ({
  player,
  isOverlay = false,
}: {
  player: Player
  isOverlay?: boolean
}) => (
  <div
    className={`flex items-center justify-between p-2.5 rounded-lg border-2 ${
      isOverlay
        ? "bg-white shadow-2xl border-emerald-500"
        : "bg-white border-slate-200"
    }`}
  >
    <span className="font-medium text-sm text-slate-800">{player.name}</span>
    <GripVertical className="text-slate-400 cursor-grab" size={16} />
  </div>
)

const DraggablePlayer = ({ player }: { player: Player }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: player.id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100,
      }
    : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <PlayerCard player={player} />
    </div>
  )
}

// --- Droppable Column Component ---
const PlayerColumn = ({
  id,
  title,
  players,
  playerCount,
}: {
  id: PlayerColumnId
  title: string
  players: Player[]
  playerCount: number
}) => {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-slate-50 rounded-xl p-4 transition-colors ${
        isOver ? "bg-emerald-100" : ""
      }`}
    >
      <h3 className="font-bold text-slate-800 mb-2 flex justify-between items-center">
        <span>{title}</span>
        <span className="text-sm font-normal bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
          {playerCount}
        </span>
      </h3>
      <div className="space-y-2 overflow-y-auto flex-grow min-h-[200px] p-1">
        {players.length > 0 ? (
          players.map((player) => (
            <DraggablePlayer key={player.id} player={player} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Drop players here
          </div>
        )}
      </div>
    </div>
  )
}

interface MatchSetupProps {
  onStartMatch: (matchData: MatchData) => void
  onCancel: () => void
  rematchData?: {
    teamA: MatchTeam
    teamB: MatchTeam
    overs: number
  }
}

export const MatchSetup: React.FC<MatchSetupProps> = ({
  onStartMatch,
  onCancel,
  rematchData,
}) => {
  const { players: allPlayers } = useCricket()
  const [step, setStep] = useState<"setup" | "toss">("setup")
  const [overs, setOvers] = useState<number>(rematchData?.overs || 20)
  const [teamAName, setTeamAName] = useState<string>(
    rematchData?.teamA?.name || "Team A"
  )
  const [teamBName, setTeamBName] = useState<string>(
    rematchData?.teamB?.name || "Team B"
  )

  const [playerColumns, setPlayerColumns] = useState<PlayerColumns>({
    available: [],
    teamA: [],
    teamB: [],
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)

  const [tossWinner, setTossWinner] = useState<string>("")
  const [tossDecision, setTossDecision] = useState<"bat" | "bowl">("bat")

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    if (rematchData) {
      const teamAPlayers = rematchData.teamA.players.map((p) => p.player)
      const teamBPlayers = rematchData.teamB.players.map((p) => p.player)
      const assignedPlayerIds = new Set([
        ...teamAPlayers.map((p) => p.id),
        ...teamBPlayers.map((p) => p.id),
      ])
      const available = allPlayers.filter((p) => !assignedPlayerIds.has(p.id))
      setPlayerColumns({
        available,
        teamA: teamAPlayers,
        teamB: teamBPlayers,
      })
    } else {
      setPlayerColumns({
        available: [...allPlayers],
        teamA: [],
        teamB: [],
      })
    }
  }, [allPlayers, rematchData])

  const filteredAvailablePlayers = useMemo(
    () =>
      playerColumns.available.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [playerColumns.available, searchTerm]
  )

  const activePlayer = useMemo(
    () => allPlayers.find((p) => p.id === activeId),
    [activeId, allPlayers]
  )

  const handleStartMatch = () => {
    if (!tossWinner) return

    const matchData: MatchData = {
      teamA: {
        name: teamAName,
        players: playerColumns.teamA.map((player) => ({
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
        players: playerColumns.teamB.map((player) => ({
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

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (!["available", "teamA", "teamB"].includes(overId)) return
    const destColumn = overId as PlayerColumnId

    const findSourceColumn = (id: string): PlayerColumnId | null => {
      if (playerColumns.available.some((p) => p.id === id)) return "available"
      if (playerColumns.teamA.some((p) => p.id === id)) return "teamA"
      if (playerColumns.teamB.some((p) => p.id === id)) return "teamB"
      return null
    }

    const sourceColumn = findSourceColumn(activeId)

    if (!sourceColumn || sourceColumn === destColumn) return

    setPlayerColumns((prev) => {
      const sourceItems = [...prev[sourceColumn]]
      const destItems = [...prev[destColumn]]

      const activeIndex = sourceItems.findIndex((p) => p.id === activeId)
      const [movedItem] = sourceItems.splice(activeIndex, 1)

      destItems.push(movedItem)

      return {
        ...prev,
        [sourceColumn]: sourceItems,
        [destColumn]: destItems,
      }
    })
  }

  const renderStep = () => {
    switch (step) {
      case "setup":
        return (
          <DndContext
            sensors={sensors}
            onDragStart={({ active }) => setActiveId(active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-6">
              {/* --- Configuration --- */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Settings className="text-emerald-600" size={24} />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {[2, 4, 5, 10, 15, 20, 50].map((val) => (
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter team name"
                    />
                  </div>
                </div>
              </div>

              {/* --- Player Selection --- */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="text-emerald-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Select Players
                  </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Available Players (with droppable) */}
                  <div className="flex flex-col bg-slate-50 rounded-xl p-4">
                    <h3 className="font-bold text-slate-800 mb-2 flex justify-between items-center">
                      <span>Available Players</span>
                      <span className="text-sm font-normal bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        {filteredAvailablePlayers.length}
                      </span>
                    </h3>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <PlayerColumn
                      id="available"
                      title="Available"
                      players={filteredAvailablePlayers}
                      playerCount={filteredAvailablePlayers.length}
                    />
                  </div>

                  {/* Team A */}
                  <PlayerColumn
                    id="teamA"
                    title={teamAName}
                    players={playerColumns.teamA}
                    playerCount={playerColumns.teamA.length}
                  />

                  {/* Team B */}
                  <PlayerColumn
                    id="teamB"
                    title={teamBName}
                    players={playerColumns.teamB}
                    playerCount={playerColumns.teamB.length}
                  />
                </div>
              </div>

              {/* --- Proceed Button --- */}
              <button
                onClick={() => setStep("toss")}
                disabled={
                  playerColumns.teamA.length === 0 ||
                  playerColumns.teamB.length === 0
                }
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg 
                           hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed 
                           transition-colors font-medium"
              >
                Proceed to Toss
              </button>
              <DragOverlay>
                {activePlayer ? (
                  <PlayerCard player={activePlayer} isOverlay />
                ) : null}
              </DragOverlay>
            </div>
          </DndContext>
        )

      case "toss":
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep("setup")}
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
                    className={`p-3 rounded-lg border-2 transition-all ${
                      tossWinner === team
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
                        : "border-slate-300 hover:border-slate-400"
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
                    className={`p-3 rounded-lg border-2 transition-all ${
                      tossDecision === choice
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {choice === "bat" ? "Bat First" : "Bowl First"}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-2">
                Match Summary
              </h3>
              <div className="text-sm text-slate-700 space-y-1">
                <p>
                  <strong>Format:</strong> {overs} overs
                </p>
                <p>
                  <strong>Teams:</strong> {teamAName} ({playerColumns.teamA.length}) vs{" "}
                  {teamBName} ({playerColumns.teamB.length})
                </p>
                {tossWinner && (
                  <p>
                    <strong>Toss:</strong> {tossWinner} won the toss and chose to{" "}
                    {tossDecision}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleStartMatch}
              disabled={!tossWinner}
              className="w-full px-6 py-3 bg-emerald-600 text-white text-lg rounded-lg 
                         hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-colors font-semibold flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {rematchData ? "Rematch Setup" : "New Match Setup"}
          </h1>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
        {renderStep()}
      </div>
    </div>
  )
}
