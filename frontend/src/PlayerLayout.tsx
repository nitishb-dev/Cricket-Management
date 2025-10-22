import React, { useMemo } from 'react';
import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { Navigation } from './components/Navigation';

type ActiveView = 'dashboard' | 'history' | 'stats' | 'profile' | 'settings';

const PlayerLayout: React.FC = () => {
  const location = useLocation();

  // Derive active view from the URL path for the player section
  const activeView = useMemo(() => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    const validViews: ActiveView[] = ['dashboard', 'history', 'stats', 'profile', 'settings'];
    if (validViews.includes(path as ActiveView)) {
      return path as ActiveView;
    }
    return 'dashboard'; // Fallback for /player/
  }, [location.pathname]);

  const context = useOutletContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeView={activeView} role="player" />
      {/* Add bottom padding for mobile nav. Top padding is handled by the sticky header. */}
      <main className="py-4 pb-24 px-2 sm:px-4 lg:px-6">
        <div>
          <Outlet context={context} />
        </div>
      </main>
    </div>
  );
};

export default PlayerLayout;