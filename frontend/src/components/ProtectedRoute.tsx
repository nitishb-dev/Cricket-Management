import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // Only allow authenticated admins to access the admin area (/app/*)
  if (!isAuthenticated || role !== 'admin') {
    // send non-admin (including players) back to the login choice
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
};