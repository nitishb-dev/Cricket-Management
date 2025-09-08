import React, { useState } from "react";
import { CricketProvider } from "./context/CricketContext";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { PlayerManagement } from "./components/PlayerManagement";
import { MatchSetup } from "./components/MatchSetup";
import { MatchPlay } from "./components/MatchPlay";
import { MatchHistory } from "./components/MatchHistory";
import { PlayerStats } from "./components/PlayerStats";
import { MatchData } from "./types/cricket";

// Extend MatchData for live play
export interface CurrentMatch extends MatchData {
  teamAScore: number;
  teamBScore: number;
  teamAWickets: number;
  teamBWickets: number;
  currentOver: number;
  currentBall: number;
  battingTeam: "A" | "B";
}

type ActiveView = "dashboard" | "players" | "newMatch" | "playMatch" | "history" | "stats";

function App() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [currentMatch, setCurrentMatch] = useState<CurrentMatch | null>(null);
  const [rematchData, setRematchData] = useState<MatchData | null>(null);

  const handleStartMatch = (matchData: MatchData) => {
    const battingTeam =
      matchData.tossDecision === "bat"
        ? matchData.tossWinner === matchData.teamA.name
          ? "A"
          : "B"
        : matchData.tossWinner === matchData.teamA.name
        ? "B"
        : "A";

    const newMatch: CurrentMatch = {
      ...matchData,
      teamAScore: 0,
      teamBScore: 0,
      teamAWickets: 0,
      teamBWickets: 0,
      currentOver: 0,
      currentBall: 0,
      battingTeam,
    };

    setCurrentMatch(newMatch);
    setActiveView("playMatch");
    setRematchData(null);
  };

  const handleMatchComplete = () => {
    setCurrentMatch(null);
    setActiveView("history");
  };

  const handleRematch = (matchData: MatchData) => {
    setRematchData(matchData);
    setActiveView("newMatch");
  };

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveView} />;

      case "players":
        return <PlayerManagement />;

      case "newMatch":
        return (
          <MatchSetup
            onStartMatch={handleStartMatch}
            onCancel={() => {
              setActiveView("dashboard");
              setRematchData(null);
            }}
            rematchData={rematchData || undefined}
          />
        );

      case "playMatch":
        return currentMatch ? (
          <MatchPlay
            matchData={currentMatch}
            onMatchComplete={handleMatchComplete}
            onCancel={() => {
              setCurrentMatch(null);
              setActiveView("dashboard");
            }}
          />
        ) : (
          <Dashboard onNavigate={setActiveView} />
        );

      case "history":
        return <MatchHistory onRematch={handleRematch} />;

      case "stats":
        return <PlayerStats />;

      default:
        return <Dashboard onNavigate={setActiveView} />;
    }
  };

  return (
    <CricketProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation activeView={activeView} onNavigate={setActiveView} />
        <main className="py-6">{renderActiveView()}</main>
      </div>
    </CricketProvider>
  );
}

export default App;
