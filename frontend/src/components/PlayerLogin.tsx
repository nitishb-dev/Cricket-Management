import React, { useState } from 'react';
import { LogIn, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PlayerLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { loginPlayer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the 'from' location if it was passed in state, otherwise default to the player dashboard
  const from = location.state?.from?.pathname || '/player/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }

    if (!loginPlayer) {
      setError('Login service unavailable.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginPlayer(username.trim(), password);
      if (!result.success) {
        setError('Invalid username or password.');
        setIsLoading(false);
        return;
      }

      // Check if password change is required
      if (result.mustChangePassword) {
        setIsLoading(false);
        navigate('/player/change-password', { replace: true });
        return;
      }

      // Small delay so spinner is visible and navigation isn't jarring
      setTimeout(() => {
        setIsLoading(false);
        navigate(from, { replace: true });
      }, 300);
    } catch (err) {
      setIsLoading(false);
      console.error('Player login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 px-2 sm:px-4 lg:px-6 relative">
      <button
        onClick={() => navigate('/admin/login')}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 p-2 text-gray-600 hover:text-primary-600 hover:bg-white rounded-full transition-all duration-200 flex items-center gap-2 group"
      >
        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium hidden sm:inline">Admin</span>
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-primary rounded-full p-4 mb-4">
            <User className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Cricket Manager</h1>
          <p className="text-gray-600">Player Login</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6" aria-busy={isLoading}>
            <div>
              <label htmlFor="player-username" className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                id="player-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                required
                disabled={isLoading}
                aria-disabled={isLoading}
                autoComplete="username"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="player-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="player-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  required
                  disabled={isLoading}
                  aria-disabled={isLoading}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-primary-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} /> Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};