import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AdminLogin } from './components/AdminLogin';
import MainLayout from './MainLayout';
import { Dashboard } from './components/Dashboard';
import { PlayerManagement } from './components/PlayerManagement';
import { MatchSetup } from './components/MatchSetup';
import { MatchPlay } from './components/MatchPlay';
import { MatchHistory } from './components/MatchHistory';
import { PlayerStats } from './components/PlayerStats';
import { PlayerLogin } from './components/PlayerLogin';
import LoginChoice from './components/LoginChoice';
import PlayerDashboard from './components/PlayerDashboard';
import PlayerHistory from './components/PlayerHistory';
import PlayerLayout from './PlayerLayout';
import PlayerProfile from './components/PlayerProfile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PlayerProtectedRoute } from './components/PlayerProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const router = createBrowserRouter([
  { path: '/', element: <LoginChoice /> },
  { path: '/admin-login', element: <AdminLogin /> },
  { path: '/player-login', element: <PlayerLogin /> },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <AuthProvider>
            <MainLayout />
          </AuthProvider>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'players', element: <PlayerManagement /> },
          { path: 'new-match', element: <MatchSetup /> },
          { path: 'play-match', element: <MatchPlay /> },
          { path: 'history', element: <MatchHistory /> },
          { path: 'stats', element: <PlayerStats /> },
        ],
      },
    ],
  },
  {
    path: '/player',
    element: <PlayerProtectedRoute />,
    children: [
      {
        element: (
          <AuthProvider>
            <PlayerLayout />
          </AuthProvider>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <PlayerDashboard /> },
          { path: 'profile', element: <PlayerProfile /> },
          { path: 'history', element: <PlayerHistory /> },
          { path: 'stats', element: <PlayerStats /> },
        ],
      },
    ],
  },
  { path: '*', element: <LoginChoice /> },
]);

const App: React.FC = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;
