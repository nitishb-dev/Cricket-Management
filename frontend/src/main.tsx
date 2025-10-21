import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CricketProvider } from './context/CricketContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CricketProvider>
        <App />
      </CricketProvider>
    </AuthProvider>
  </React.StrictMode>
);
