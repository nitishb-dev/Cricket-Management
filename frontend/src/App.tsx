import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CricketProvider } from './context/CricketContext';
import { AdminLogin } from './components/AdminLogin';
import MainLayout from './MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import { PlayerManagement } from './components/PlayerManagement';
import { MatchSetup } from './components/MatchSetup';
import { MatchPlay } from './components/MatchPlay';
import { MatchHistory } from './components/MatchHistory';
import { PlayerStats } from './components/PlayerStats';

const router = createBrowserRouter([
  {
    path: '/admin-login',
    element: <AdminLogin />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
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
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CricketProvider>
        <RouterProvider router={router} />
      </CricketProvider>
    </AuthProvider>
  );
};

export default App;