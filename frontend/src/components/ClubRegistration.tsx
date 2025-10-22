import React, { useState } from 'react';
import { Trophy, User, Building, Key, AlertCircle, CheckCircle } from 'lucide-react';

interface ClubRegistrationProps {
  onSuccess: (credentials: { username: string; password: string }) => void;
  onBackToLogin: () => void;
}

interface RegistrationResult {
  clubId: string;
  clubName: string;
  username: string;
  password: string;
  adminName: string;
}

export const ClubRegistration: React.FC<ClubRegistrationProps> = ({ 
  onSuccess, 
  onBackToLogin 
}) => {
  const [clubName, setClubName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/register-club`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubName: clubName.trim(),
          adminName: adminName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setRegistrationResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToLogin = () => {
    if (registrationResult) {
      onSuccess({
        username: registrationResult.username,
        password: registrationResult.password,
      });
    }
  };

  if (registrationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Club Registered Successfully!
          </h2>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-green-800 mb-4">Your Login Credentials:</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-green-700">Club Name:</label>
                <p className="font-mono bg-white p-2 rounded border text-gray-800">
                  {registrationResult.clubName}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-green-700">Username:</label>
                <p className="font-mono bg-white p-2 rounded border text-gray-800">
                  {registrationResult.username}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-green-700">Password:</label>
                <p className="font-mono bg-white p-2 rounded border text-gray-800">
                  {registrationResult.password}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-orange-800">
              <strong>Important:</strong> Please save these credentials securely. 
              The password will not be shown again.
            </p>
          </div>
          
          <button
            onClick={handleProceedToLogin}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Key size={20} />
            Proceed to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-2xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Register Your Cricket Club
          </h1>
          <p className="text-gray-600">
            Create your club account to start managing cricket matches
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline w-4 h-4 mr-1" />
              Club Name
            </label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="input-field"
              placeholder="Enter your cricket club name"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Admin Name
            </label>
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="input-field"
              placeholder="Enter admin full name"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be used to generate your username
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !clubName.trim() || !adminName.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Registering Club...
              </div>
            ) : (
              'Register Club'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Already have an account? Login here
          </button>
        </div>
      </div>
    </div>
  );
};