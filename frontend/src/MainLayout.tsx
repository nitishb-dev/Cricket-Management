import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { MatchData } from './types/cricket';

type ActiveView = 'dashboard' | 'players' | 'new-match' | 'play-match' | 'history' | 'stats';

const MainLayout: React.FC = () => {
  const [currentMatch, setCurrentMatch] = useState<MatchData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active view from the URL path
  const getActiveView = () => {
    const path = location.pathname.substring(1); // remove leading '/'
    const validViews: ActiveView[] = ['dashboard', 'players', 'new-match', 'play-match', 'history', 'stats'];
    if (validViews.includes(path as ActiveView)) {
      return path as ActiveView;
    }
    return 'dashboard';
  };

  const handleStartMatch = (matchData: MatchData) => {
    setCurrentMatch(matchData);
    navigate('/play-match');
  };

  const handleMatchComplete = () => {
    setCurrentMatch(null);
    navigate('/history');
  };

  const handleCancelMatch = () => {
    setCurrentMatch(null);
    navigate('/dashboard');
  };

  const handleRematch = (matchData: MatchData) => {
    navigate('/new-match', { state: { teamA: matchData.teamA, teamB: matchData.teamB, overs: matchData.overs } });
  };

  const handleCancelSetup = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation activeView={getActiveView() as ActiveView} />
      <main>
        <Outlet context={{ 
          onStartMatch: handleStartMatch,
          onMatchComplete: handleMatchComplete,
          onCancelMatch: handleCancelMatch,
          onRematch: handleRematch,
          onCancelSetup: handleCancelSetup,
          currentMatch,
        }} />
      </main>
    </div>
  );
};

export default MainLayout;