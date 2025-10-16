import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CricketProvider>
        <Routes>
          <Route path="/admin-login" element={<AdminLogin />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="players" element={<PlayerManagement />} />
              <Route path="new-match" element={<MatchSetup />} />
              <Route path="play-match" element={<MatchPlay />} />
              <Route path="history" element={<MatchHistory />} />
              <Route path="stats" element={<PlayerStats />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CricketProvider>
    </AuthProvider>
  );
};

export default App;