import React, { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { MatchData } from './types/cricket';

type ActiveView = 'dashboard' | 'players' | 'new-match' | 'play-match' | 'history' | 'stats';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentMatch, setCurrentMatch] = useState<MatchData | null>(() => {
    // Restore match from location state on refresh
    return location.state?.currentMatch || null;
  });

  // Derive active view from the URL path
  const activeView = useMemo(() => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    const validViews: ActiveView[] = ['dashboard', 'players', 'new-match', 'play-match', 'history', 'stats'];
    if (validViews.includes(path as ActiveView)) {
      return path as ActiveView;
    }
    return 'dashboard'; // Fallback for /app/
  }, [location.pathname]);

  const handleStartMatch = (matchData: MatchData) => {
    setCurrentMatch(matchData);
    // Persist match data in location state for resilience to page reloads
    navigate('/app/play-match', { state: { currentMatch: matchData } });
  };

  const handleMatchComplete = () => {
    setCurrentMatch(null);
    navigate('/app/history');
  };

  const handleRematch = (matchData: MatchData) => {
    navigate('/app/new-match', { state: { teamA: matchData.teamA, teamB: matchData.teamB, overs: matchData.overs } });
  };

  const handleCancelSetup = () => {
    navigate('/dashboard');
  };

  // If we are on the /play-match route but have no match data, redirect to dashboard
  if (location.pathname === '/app/play-match' && !currentMatch) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeView={activeView} />
      {/* Add bottom padding for mobile nav. Top padding is handled by the sticky header. */}
      <main className="py-4 pb-24 px-2 sm:px-4 lg:px-6">
        <div>
          <Outlet context={{ 
            onStartMatch: handleStartMatch,
            onMatchComplete: handleMatchComplete,
            // onCancelMatch is now the same as onCancelSetup
            onCancelMatch: handleCancelSetup,
            onRematch: handleRematch,
            onCancelSetup: handleCancelSetup,
            // Pass the current match data through context
            currentMatch,
          }} />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;