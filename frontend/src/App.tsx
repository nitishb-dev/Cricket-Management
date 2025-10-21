import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
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
import PlayerDashboard from './components/PlayerDashboard'; // Keep this import
import PlayerHistory from './components/PlayerHistory';
import PlayerLayout from './PlayerLayout';
import PlayerProfile from './components/PlayerProfile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CricketProvider } from './context/CricketContext';
import { PlayerProtectedRoute } from './components/PlayerProtectedRoute';

// This new component will wrap our protected routes and provide the necessary context.
const ProtectedLayout: React.FC = () => (
  <AuthProvider>
    <CricketProvider>
      <Outlet />
    </CricketProvider>
  </AuthProvider>
);

const router = createBrowserRouter([
  // Public login choice and auth routes
  {
    path: '/',
    element: <LoginChoice />,
  },
  {
    path: '/admin-login',
    element: <AdminLogin />,
  },
  {
    path: '/player-login',
    element: <PlayerLogin />,
  },

  // New protected admin area sits under /app/*
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: '/app',
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />, // MainLayout now becomes a direct child
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: 'dashboard', element: <Dashboard /> },
              { path: 'players', element: <PlayerManagement /> },
              { path: 'new-match', element: <MatchSetup /> },
              { path: 'play-match', element: <MatchPlay /> },
              { path: 'history', element: <MatchHistory /> },
              { path: 'stats', element: <PlayerStats /> },
            ]
          },
        ],
      },
      {
        path: '/player',
        element: <PlayerProtectedRoute />,
        children: [
          {
            element: <PlayerLayout />, // PlayerLayout now becomes a direct child
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: 'dashboard', element: <PlayerDashboard /> },
              { path: 'profile', element: <PlayerProfile /> },
              { path: 'history', element: <PlayerHistory /> },
              { path: 'stats', element: <PlayerStats /> },
            ]
          },
        ],
      },
    ],
  },

  // Backwards-compatible redirects from legacy routes -> new /app/* routes
  { path: '/dashboard', element: <Navigate to="/app/dashboard" replace /> },
  { path: '/players', element: <Navigate to="/app/players" replace /> },
  { path: '/new-match', element: <Navigate to="/app/new-match" replace /> },
  { path: '/play-match', element: <Navigate to="/app/play-match" replace /> },
  { path: '/history', element: <Navigate to="/app/history" replace /> },
  { path: '/stats', element: <Navigate to="/app/stats" replace /> },

  // Fallback
  { path: '*', element: <Navigate to="/" replace /> },
]);

const App: React.FC = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;