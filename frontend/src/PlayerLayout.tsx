import React, { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';

// Define the possible active views for a player
type ActiveView = 'dashboard' | 'profile' | 'history' | 'stats';

const PlayerLayout: React.FC = () => {
  const location = useLocation();

  // Derive active view from the URL path, similar to MainLayout
  const activeView = useMemo(() => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    const validViews: ActiveView[] = ['dashboard', 'profile', 'history', 'stats'];
    if (validViews.includes(path as ActiveView)) {
      return path as ActiveView;
    }
    return 'dashboard'; // Fallback for /player/
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeView={activeView} role="player" />
      <main className="pt-4 pb-20 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">{<Outlet />}</div>
      </main>
    </div>
  );
};

export default PlayerLayout;