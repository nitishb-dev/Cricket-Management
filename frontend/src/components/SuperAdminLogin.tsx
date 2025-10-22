import React, { useState } from 'react';
import { Shield, User, Lock, AlertCircle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SuperAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const accessKey = localStorage.getItem('super_admin_access_key');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessKey) {
        headers['X-Super-Admin-Key'] = accessKey;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/super-admin/auth/login`, {
        method: 'POST',
        headers,
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
      localStorage.setItem('super_admin_token', data.token);
      localStorage.setItem('super_admin_data', JSON.stringify(data.superAdmin));

      // Navigate to super admin dashboard
      navigate('/super-admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Platform Administrator
          </h1>
          <p className="text-gray-600">
            Super Admin Access - Manage All Clubs
          </p>
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-sm text-orange-800">
              <strong>⚠️ Restricted Access:</strong> This area is for platform owners only.
            </p>
          </div>
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
              placeholder="Enter super admin username"
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
              placeholder="Enter super admin password"
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
            className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Authenticating...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Access Platform
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-700 font-medium"
          >
            ← Back to Public Site
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-semibold text-gray-800 mb-2">Default Credentials:</h3>
          <p className="text-sm text-gray-600 mb-1">Username: <code className="bg-gray-200 px-1 rounded">superadmin</code></p>
          <p className="text-sm text-gray-600 mb-2">Password: <code className="bg-gray-200 px-1 rounded">SuperAdmin@123</code></p>
          <p className="text-xs text-orange-600">
            ⚠️ Change these credentials immediately after first login!
          </p>
        </div>
      </div>
    </div>
  );
};