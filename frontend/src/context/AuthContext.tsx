import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (user: string, pass: string) => boolean;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });

  const [user, setUser] = useState<string | null>(() => {
    return sessionStorage.getItem('authUser') || null;
  });

  const login = (userName: string, pass: string): boolean => {
    // Compare against environment-driven credentials
    if (userName === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setUser(userName);
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('authUser', userName);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('authUser');
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
    };

    window.addEventListener('storage', syncLogout);
    return () => {
      window.removeEventListener('storage', syncLogout);
    };
  }, []);

  const value = { isAuthenticated, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};