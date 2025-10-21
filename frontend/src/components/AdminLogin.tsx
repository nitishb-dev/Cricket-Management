import React, { useState, useEffect } from 'react';
import { Trophy, User, Lock, AlertCircle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClubRegistration } from './ClubRegistration';
import { ForgotPassword } from './ForgotPassword';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [initialCredentials, setInitialCredentials] = useState<{ username: string; password: string } | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when initial credentials are provided
  useEffect(() => {
    if (initialCredentials) {
      setUsername(initialCredentials.username);
      setPassword(initialCredentials.password);
    }
  }, [initialCredentials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('cricket_admin_token', data.token);
      localStorage.setItem('cricket_admin_data', JSON.stringify(data.admin));

      // Update auth context state
      checkAuthStatus();

      // Navigate to admin dashboard
      navigate('/app/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loginForm = (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-2xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Cricket Club Admin
          </h1>
          <p className="text-gray-600">
            Sign in to manage your cricket club
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline w-4 h-4 mr-1" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Signing In...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <div>
            <p className="text-gray-600 mb-2">Don't have a club account?</p>
            <button
              onClick={() => setShowRegistration(true)}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Register Your Cricket Club
            </button>
          </div>
          
          <div>
            <p className="text-gray-600 mb-2">Forgot your password?</p>
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (showRegistration) {
    return (
      <ClubRegistration
        onSuccess={(credentials) => {
          setInitialCredentials(credentials);
          setShowRegistration(false);
        }}
        onBackToLogin={() => setShowRegistration(false)}
      />
    );
  }

  if (showForgotPassword) {
    return (
      <ForgotPassword
        onSuccess={(credentials) => {
          setInitialCredentials(credentials);
          setShowForgotPassword(false);
        }}
        onBackToLogin={() => setShowForgotPassword(false)}
      />
    );
  }

  return loginForm;
};