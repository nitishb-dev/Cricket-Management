import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CricketProvider } from './context/CricketContext';
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
import { EditProfilePage } from './components/EditProfilePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PlayerProtectedRoute } from './components/PlayerProtectedRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CricketProvider>
          <Routes>
            <Route path="/" element={<LoginChoice />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/player-login" element={<PlayerLogin />} />
            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="players" element={<PlayerManagement />} />
                <Route path="new-match" element={<MatchSetup />} />
                <Route path="play-match" element={<MatchPlay />} />
                <Route path="history" element={<MatchHistory />} />
                <Route path="stats" element={<PlayerStats />} />
              </Route>
            </Route>
            <Route path="/player" element={<PlayerProtectedRoute />}>
              <Route element={<PlayerLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PlayerDashboard />} />
                <Route path="profile" element={<PlayerProfile />} />
                <Route path="edit-profile" element={<EditProfilePage />} />
                <Route path="history" element={<PlayerHistory />} />
                <Route path="stats" element={<PlayerStats />} />
              </Route>
            </Route>
            <Route path="*" element={<LoginChoice />} />
          </Routes>
        </CricketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
