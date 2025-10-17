import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PlayerProtectedRoute: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // Only allow authenticated players to access the player area (/player/*)
  if (!isAuthenticated || role !== 'player') {
    return <Navigate to="/player-login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
