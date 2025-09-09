import React, { useState, useEffect } from 'react'
import { Trophy, Target, Clock, Save, AlertCircle } from 'lucide-react'
import { useCricket, SaveMatchPayload } from '../context/CricketContext'
import { MatchData, TeamPlayer } from '../types/cricket'

interface MatchPlayProps {
  matchData: MatchData
  onMatchComplete: () => void
  onCancel: () => void
}

type BallOutcome = 'dot' | '1' | '2' | '3' | '4' | '6' | 'wide' | 'noball' | 'wicket'

interface BallEvent {
  runs: number
  isWicket: boolean
  isExtra: boolean
  extraType?: 'wide' | 'noball'
  batsmanName?: string
  bowlerName?: string
}

interface InningStats {
  runs: number
  wickets: number
  balls: number
  overs: number
  ballsThisOver: number
}

export const MatchPlay: React.FC<MatchPlayProps> = ({
  matchData: initialMatchData,
  onMatchComplete,
  onCancel
}) => {
  const { saveMatch } = useCricket()

  // Match state
  const [matchData, setMatchData] = useState<MatchData>(initialMatchData)
  const [currentInning, setCurrentInning] = useState<1 | 2>(1)
  const [isMatchComplete, setIsMatchComplete] = useState(false)
  const [winner, setWinner] = useState<string>('')
  const [manOfMatch, setManOfMatch] = useState<string>('')
  const [dismissedBatsmen, setDismissedBatsmen] = useState<Set<string | number>>(new Set())
  const [currentOverBowler, setCurrentOverBowler] = useState<string | number | null>(null)
  const [previousOverBowler, setPreviousOverBowler] = useState<string | number | null>(null)

  // Inning stats
  const [inning1Stats, setInning1Stats] = useState<InningStats>({
    runs: 0, wickets: 0, balls: 0, overs: 0, ballsThisOver: 0
  })
  const [inning2Stats, setInning2Stats] = useState<InningStats>({
    runs: 0, wickets: 0, balls: 0, overs: 0, ballsThisOver: 0
  })

  // UI state
  const [selectedBatsman, setSelectedBatsman] = useState<TeamPlayer | null>(null)
  const [selectedBowler, setSelectedBowler] = useState<TeamPlayer | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentBattingTeam = getCurrentBattingTeam()
  const currentBowlingTeam = getCurrentBowlingTeam()
  const currentStats = currentInning === 1 ? inning1Stats : inning2Stats
  const setCurrentStats = currentInning === 1 ? setInning1Stats : setInning2Stats

  function getCurrentBattingTeam() {
    const { teamA, teamB, tossWinner, tossDecision } = matchData

    if (currentInning === 1) {
      return (tossWinner === teamA.name && tossDecision === 'bat') ||
             (tossWinner === teamB.name && tossDecision === 'bowl')
             ? teamA : teamB
    } else {
      const firstInningBattingTeam = (tossWinner === teamA.name && tossDecision === 'bat') ||
                                     (tossWinner === teamB.name && tossDecision === 'bowl')
                                     ? teamA : teamB
      return firstInningBattingTeam === teamA ? teamB : teamA
    }
  }

  function getCurrentBowlingTeam() {
    const { teamA, teamB } = matchData
    return currentBattingTeam === teamA ? teamB : teamA
  }

  const handleBall = (outcome: BallOutcome) => {
    if (isMatchComplete) return

    const ballEvent: BallEvent = {
      runs: 0,
      isWicket: false,
      isExtra: false,
      batsmanName: selectedBatsman?.player.name,
      bowlerName: selectedBowler?.player.name
    }

    switch (outcome) {
      case 'dot':
        ballEvent.runs = 0
        break
      case '1':
        ballEvent.runs = 1
        break
      case '2':
        ballEvent.runs = 2
        break
      case '3':
        ballEvent.runs = 3
        break
      case '4':
        ballEvent.runs = 4
        break
      case '6':
        ballEvent.runs = 6
        break
      case 'wide':
        ballEvent.runs = 1
        ballEvent.isExtra = true
        ballEvent.extraType = 'wide'
        break
      case 'noball':
        ballEvent.runs = 1
        ballEvent.isExtra = true
        ballEvent.extraType = 'noball'
        break
      case 'wicket':
        ballEvent.isWicket = true
        ballEvent.runs = 0
        break
    }

    // Create a new temporary state object to avoid race conditions
    const newStats = { ...currentStats };
    const newMatchData = { ...matchData };

    // Update inning-level stats first
    newStats.runs += ballEvent.runs;
    if (ballEvent.isWicket) {
      newStats.wickets += 1;
    }
    if (!ballEvent.isExtra) {
      newStats.balls += 1;
      newStats.ballsThisOver += 1;
    }

    // Now, update the player-level stats inside the matchData object
    const battingTeamKey = currentBattingTeam === newMatchData.teamA ? 'teamA' : 'teamB';
    const bowlingTeamKey = currentBowlingTeam === newMatchData.teamA ? 'teamA' : 'teamB';

    if (selectedBatsman) {
      newMatchData[battingTeamKey] = {
        ...newMatchData[battingTeamKey],
        players: newMatchData[battingTeamKey].players.map(p =>
          p.player.id === selectedBatsman.player.id ? { ...p, runs: p.runs + ballEvent.runs } : p
        )
      };
    }

    if (selectedBowler && ballEvent.isWicket) {
      newMatchData[bowlingTeamKey] = {
        ...newMatchData[bowlingTeamKey],
        players: newMatchData[bowlingTeamKey].players.map(p =>
          p.player.id === selectedBowler.player.id ? { ...p, wickets: p.wickets + 1 } : p
        )
      };
    }

    // Handle end of over logic
    if (!ballEvent.isExtra && newStats.ballsThisOver === 6) {
      newStats.overs += 1;
      newStats.ballsThisOver = 0;
      setPreviousOverBowler(currentOverBowler);
      setCurrentOverBowler(null);
      setSelectedBowler(null);
    } else {
      if (!currentOverBowler && selectedBowler) {
        setCurrentOverBowler(selectedBowler.player.id);
      }
    }

    // Update dismissed batsmen and reset batsman selection
    if (ballEvent.isWicket) {
      setDismissedBatsmen(prev => new Set(prev).add(selectedBatsman!.player.id));
      setSelectedBatsman(null); // Force user to re-select
    }

    // Set all new states at once to ensure synchronization
    setCurrentStats(newStats);
    setMatchData(newMatchData);

    checkInningComplete(newStats);
  };

  useEffect(() => {
    setDismissedBatsmen(new Set())
    setSelectedBatsman(null)
    setSelectedBowler(null)
    setCurrentOverBowler(null)
    setPreviousOverBowler(null)
  }, [currentInning])

  const getAvailableBatsmen = () => {
    return currentBattingTeam.players.filter(player =>
      !dismissedBatsmen.has(player.player.id)
    )
  }

  const getAvailableBowlers = () => {
    if (currentStats.ballsThisOver === 0 && previousOverBowler) {
      return currentBowlingTeam.players.filter(player =>
        player.player.id !== previousOverBowler
      )
    } else if (currentOverBowler) {
      return currentBowlingTeam.players.filter(player =>
        player.player.id === currentOverBowler
      )
    } else {
      return currentBowlingTeam.players
    }
  }

  const canChangeBowler = () => {
    return currentStats.ballsThisOver === 0
  }


//TRYING-------------------------------------------------------------

const checkInningComplete = (stats: InningStats) => {
  const currentBattingTeamPlayersCount = currentBattingTeam.players.length;

  const isAllOut = stats.wickets >= currentBattingTeamPlayersCount;
  const isOversComplete = stats.overs >= matchData.overs;
  const isTargetChased = currentInning === 2 && stats.runs > (inning1Stats?.runs || 0);

  const isInningComplete = isAllOut || isOversComplete || isTargetChased;

  if (isInningComplete) {
    if (currentInning === 1) {
      setCurrentInning(2);
      setSelectedBatsman(null);
      setSelectedBowler(null);
      setDismissedBatsmen(new Set());
      setCurrentOverBowler(null);
      setPreviousOverBowler(null);
    } else {
      // 🚀 Pass the latest stats directly
      completeMatch(stats, inning1Stats);
    }
  }
};

const completeMatch = (secondInningStats: InningStats, firstInningStats: InningStats) => {
  const firstInningScore = firstInningStats.runs;
  const secondInningScore = secondInningStats.runs;

  console.log("=== MATCH COMPLETION DEBUG ===");
  console.log("First inning score:", firstInningScore);
  console.log("Second inning score:", secondInningScore);

  const teamThatBattedFirst =
    matchData.tossDecision === "bat"
      ? matchData.tossWinner === matchData.teamA.name
        ? matchData.teamA
        : matchData.teamB
      : matchData.tossWinner === matchData.teamA.name
      ? matchData.teamB
      : matchData.teamA;

  const teamThatChased =
    teamThatBattedFirst.name === matchData.teamA.name ? matchData.teamB : matchData.teamA;

  let matchWinner = "";

  if (secondInningScore > firstInningScore) {
    const totalPlayers = teamThatChased.players.length;
    const wicketsLeft = totalPlayers - secondInningStats.wickets;
    matchWinner = `${teamThatChased.name} won the match by ${wicketsLeft} wickets`;
  } else if (firstInningScore > secondInningScore) {
    const runDifference = firstInningScore - secondInningScore;
    matchWinner = `${teamThatBattedFirst.name} won the match by ${runDifference} runs`;
  } else {
    matchWinner = "Match Tied";
  }

  console.log("Final winner:", matchWinner);

  setWinner(matchWinner);
  setIsMatchComplete(true);
  // Simple Man of the Match logic
  let bestPerformanceScore = -1;
  let manOfMatchPlayerName = "";
  const allPlayers = [...matchData.teamA.players, ...matchData.teamB.players];

  allPlayers.forEach((player) => {
    const playerScore = player.runs + player.wickets * 15;
    if (playerScore > bestPerformanceScore) {
      bestPerformanceScore = playerScore;
      manOfMatchPlayerName = player.player.name;
    }
  });

  setManOfMatch(manOfMatchPlayerName);
};

  const handleSaveMatch = async () => {
    if (isSaving) return

    setIsSaving(true)
    setError(null)

    try {
      const saveData: SaveMatchPayload = {
        teamA: matchData.teamA,
        teamB: matchData.teamB,
        overs: matchData.overs,
        tossWinner: matchData.tossWinner,
        tossDecision: matchData.tossDecision,
        winner,
        manOfMatch,
        matchDate: new Date().toISOString().split('T')[0],
        isCompleted: true
      }

      const result = await saveMatch(saveData)

      if (result) {
        onMatchComplete()
      } else {
        setError('Failed to save match')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save match')
    } finally {
      setIsSaving(false)
    }
  }

  const getRequiredRunRate = () => {
    if (currentInning === 2 && !isMatchComplete) {
      const target = inning1Stats.runs + 1
      const remaining = target - inning2Stats.runs
      // const ballsLeft = (matchData.overs - inning2Stats.overs) * 6 - inning2Stats.ballsThisOver
      const ballsLeft = Math.max(0, (matchData.overs * 6) - (inning2Stats.overs * 6 + inning2Stats.ballsThisOver));
      return ballsLeft > 0 ? (remaining * 6 / ballsLeft).toFixed(2) : '0.00'
    }
    return '0.00'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="text-green-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {matchData.teamA.name} vs {matchData.teamB.name}
                </h1>
                <p className="text-gray-600">
                  {matchData.overs} overs • {currentInning === 1 ? '1st' : '2nd'} Inning
                  {currentInning === 2 && (
                    <span className="ml-2 text-blue-600">
                      (Teams switched - {getCurrentBattingTeam().name} chasing {inning1Stats.runs + 1})
                    </span>
                  )}
                  {isMatchComplete && <span className="ml-2 text-green-600 font-semibold">Match Complete</span>}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Exit Match
            </button>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Batting Team */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="text-blue-600" />
              {currentBattingTeam.name} - Batting
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-800">
                  {currentStats.runs}/{currentStats.wickets}
                  {getAvailableBatsmen().length === 0 && (
                    <span className="ml-2 text-red-600 text-lg font-semibold">ALL OUT</span>
                  )}
                </span>
                <span className="text-lg text-gray-600">
                  ({currentStats.overs}.{currentStats.ballsThisOver} ov)
                </span>
              </div>
              {currentInning === 2 && (
                <div className="text-sm text-gray-600">
                  <p><strong>Target:</strong> {inning1Stats.runs + 1} runs</p>
                  <p><strong>Required:</strong> {Math.max(0, inning1Stats.runs + 1 - currentStats.runs)} runs</p>
                  <p><strong>RRR:</strong> {getRequiredRunRate()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Previous/Bowling Team */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="text-red-600" />
              {currentInning === 1
                ? `${getCurrentBowlingTeam().name} - Bowling`
                : `${getCurrentBowlingTeam().name} - ${inning1Stats.runs}/${inning1Stats.wickets}`
              }
            </h2>
            {currentInning === 2 && (
              <div className="space-y-1">
                <div className="text-lg text-gray-600">
                  ({inning1Stats.overs}.{inning1Stats.ballsThisOver} overs)
                </div>
                {inning1Stats.wickets >= matchData.teamA.players.length - 1 && (
                  <div className="text-sm text-red-600 font-semibold">
                    ALL OUT
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {!isMatchComplete && (
          <>
            {/* Player Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Batsman Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Select Batsman ({getAvailableBatsmen().length} available)
                </h3>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {currentBattingTeam.players.map(player => {
                    const isDismissed = dismissedBatsmen.has(player.player.id)
                    const isSelected = selectedBatsman?.player.id === player.player.id

                    return (
                      <button
                        key={player.player.id}
                        onClick={() => !isDismissed ? setSelectedBatsman(player) : null}
                        disabled={isDismissed}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isDismissed
                            ? 'border-red-300 bg-red-50 text-red-400 cursor-not-allowed'
                            : isSelected
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className={`font-medium ${isDismissed ? 'line-through' : ''}`}>
                              {player.player.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {player.runs} runs
                              {isDismissed && <span className="ml-2 text-red-500 font-semibold">OUT</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                {getAvailableBatsmen().length === 0 && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    All batsmen are out!
                  </p>
                )}
              </div>

              {/* Bowler Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Select Bowler ({getAvailableBowlers().length} available)
                </h3>
                {!canChangeBowler() && currentOverBowler && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Same bowler must complete the over
                    </p>
                  </div>
                )}
                {canChangeBowler() && previousOverBowler && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Previous over bowler cannot bowl consecutive overs
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {currentBowlingTeam.players.map(player => {
                    const isAvailable = getAvailableBowlers().some(p => p.player.id === player.player.id)
                    const isSelected = selectedBowler?.player.id === player.player.id
                    const isPreviousBowler = player.player.id === previousOverBowler
                    const isCurrentBowler = player.player.id === currentOverBowler

                    return (
                      <button
                        key={player.player.id}
                        onClick={() => isAvailable ? setSelectedBowler(player) : null}
                        disabled={!isAvailable}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          !isAvailable
                            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isSelected
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{player.player.name}</div>
                            <div className="text-sm text-gray-600">
                              {player.wickets} wickets
                              {isPreviousBowler && canChangeBowler() && (
                                <span className="ml-2 text-orange-600 text-xs">Previous over</span>
                              )}
                              {isCurrentBowler && !canChangeBowler() && (
                                <span className="ml-2 text-blue-600 text-xs">Current over</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                {getAvailableBowlers().length === 0 && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    No available bowlers!
                  </p>
                )}
              </div>
            </div>

            {/* Ball Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Ball Outcome</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
                {[
                  { outcome: 'dot' as BallOutcome, label: '0', color: 'gray' },
                  { outcome: '1' as BallOutcome, label: '1', color: 'blue' },
                  { outcome: '2' as BallOutcome, label: '2', color: 'blue' },
                  { outcome: '3' as BallOutcome, label: '3', color: 'blue' },
                  { outcome: '4' as BallOutcome, label: '4', color: 'green' },
                  { outcome: '6' as BallOutcome, label: '6', color: 'purple' },
                  { outcome: 'wide' as BallOutcome, label: 'WD', color: 'yellow' },
                  { outcome: 'noball' as BallOutcome, label: 'NB', color: 'orange' },
                  { outcome: 'wicket' as BallOutcome, label: 'OUT', color: 'red' }
                ].map(({ outcome, label, color }) => (
                  <button
                    key={outcome}
                    onClick={() => handleBall(outcome)}
                    disabled={!selectedBatsman || !selectedBowler}
                    className={`p-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      color === 'gray' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' :
                      color === 'blue' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                      color === 'green' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      color === 'purple' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                      color === 'yellow' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                      color === 'orange' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                      'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {(!selectedBatsman || !selectedBowler) && (
  <p className="text-sm text-gray-500 mt-3">
    Please select both a batsman and a bowler to record the ball outcome.
  </p>
)}
            </div>
          </>
        )}

        {/* --- Match Complete Display --- */}
        {isMatchComplete && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-6">
              <Trophy className="mx-auto mb-4 text-yellow-500" size={48} />
              <h2 className="text-2xl font-bold text-gray-800">Match Complete!</h2>
              <p className="text-lg text-green-600 font-semibold">
                {winner === 'Match Tied' ? 'Match Tied' : `${winner} Won`}
              </p>
              <div className="mt-4">
                <h3 className="text-xl font-bold text-yellow-500">
                  Man of the Match:
                </h3>
                <p className="text-2xl font-semibold text-gray-800">
                  {manOfMatch}
                </p>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveMatch}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Match
                  </>
                )}
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Exit Without Saving
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}