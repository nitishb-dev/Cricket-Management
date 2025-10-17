import React, { useState } from 'react';
import { LogIn, Trophy, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Type-safe helper to detect Promise-like values without using `any`
  function isPromise<T = unknown>(value: unknown): value is Promise<T> {
    return !!value && typeof (value as { then?: unknown }).then === 'function';
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setIsLoading(true);

    try {
      // treat login result as unknown (it could be boolean or Promise<boolean>)
      const result = login(username, password) as unknown;

      let success = false;

      if (isPromise<boolean>(result)) {
        // login returned a Promise<boolean>
        success = await result;
      } else {
        // login returned a boolean synchronously (or something truthy/falsey)
        success = Boolean(result);
      }

      if (!success) {
        setError('Invalid username or password.');
        setIsLoading(false);
        return;
      }

      // Brief delay so spinner is visible and navigation isn't jarring
      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard');
      }, 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-primary rounded-full p-4 mb-4">
            <Trophy className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Cricket Manager</h1>
          <p className="text-gray-600">Admin Login</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6" aria-busy={isLoading}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field mt-1"
                required
                disabled={isLoading}
                aria-disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  required
                  disabled={isLoading}
                  aria-disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} /> Login
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};