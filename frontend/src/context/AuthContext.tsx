/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  role: 'admin' | 'player' | null;
  token?: string | null;
  userId?: string | null; // <-- added
  login: (user: string, pass: string) => boolean;
  loginPlayer?: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Read admin credentials from Vite environment variables.
 * Vite prefixes public env vars with VITE_. Use .env.local to set them in development.
 * Fallback values are provided so the app still works if env vars are not set.
 */
const ADMIN_USERNAME = (import.meta.env.VITE_ADMIN_USERNAME as string) ?? 'admin';
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) ?? 'password';
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) ?? '';

function sanitizeUsername(raw: string) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/\.+/g, '.');
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true'
      || !!sessionStorage.getItem('playerToken');
  });

  const [user, setUser] = useState<string | null>(() => {
    return sessionStorage.getItem('authUser') || null;
  });

  // restore role safely (only allow 'admin' | 'player')
  const [role, setRole] = useState<'admin' | 'player' | null>(() => {
    const r = sessionStorage.getItem('authRole');
    return r === 'admin' || r === 'player' ? (r as 'admin' | 'player') : null;
  });

  const [userId, setUserId] = useState<string | null>(() => {
    return sessionStorage.getItem('authUserId') || null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('playerToken') || null;
  });

  const navigate = useNavigate()

  const login = (userName: string, pass: string): boolean => {
    // Compare against environment-driven credentials
    if (userName === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setUser(userName);
      setRole('admin');
      setToken(null);
      setUserId(null);
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('authUser', userName);
      sessionStorage.setItem('authRole', 'admin');
      sessionStorage.removeItem('playerToken');
      sessionStorage.removeItem('authUserId');
      return true;
    }
    return false;
  };

  const logout = useCallback((): void => {
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
    setToken(null);
    setUserId(null);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('authUser');
    sessionStorage.removeItem('authRole');
    sessionStorage.removeItem('playerToken');
    sessionStorage.removeItem('authUserId');
    navigate('/admin-login');
  }, [navigate]);

  const loginPlayer = async (username: string, pass: string): Promise<boolean> => {
    if (!API_BASE_URL) {
      console.warn('API_BASE_URL not configured; player login unavailable');
      return false;
    }

    const normalizedUsername = sanitizeUsername(username);

    try {
      const res = await fetch(`${API_BASE_URL}/api/player/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: normalizedUsername, password: pass })
      });

      if (!res.ok) {
        console.warn(`[auth] player login failed: status=${res.status}`);
        return false;
      }

      const data = await res.json();

      // expected: { token, user: { id, name, username } }
      sessionStorage.setItem('playerToken', data.token);
      sessionStorage.setItem('authUser', data.user.name);
      sessionStorage.setItem('authRole', 'player');
      sessionStorage.setItem('authUserId', data.user.id);
      setIsAuthenticated(true);
      setUser(data.user.name);
      setRole('player');
      setUserId(data.user.id);
      setToken(data.token);
      return true;
    } catch (err) {
      console.error('player login error', err);
      return false;
    }
  };

  // Sync logout across tabs (keeps state consistent)
  useEffect(() => {
    const syncLogout = (event: StorageEvent) => {
      if (event.key === 'isAuthenticated' && event.newValue === null) {
        logout();
      }
      if (event.key === 'authUser' && event.newValue === null) {
        setUser(null);
      }
      if (event.key === 'authRole' && event.newValue === null) {
        setRole(null);
      }
      if (event.key === 'playerToken' && event.newValue === null) {
        setToken(null);
      }
      if (event.key === 'authUserId' && event.newValue === null) {
        setUserId(null);
      }
    };

    window.addEventListener('storage', syncLogout);
    return () => {
      window.removeEventListener('storage', syncLogout);
    };
  }, [logout]);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    role,
    token,
    userId,
    login,
    loginPlayer,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};