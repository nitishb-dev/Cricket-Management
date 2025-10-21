import React, { useState } from 'react';
import { Trophy, User, Building, Key, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  onSuccess: (credentials: { username: string; password: string }) => void;
}

interface ResetResult {
  username: string;
  newPassword: string;
  adminName: string;
  clubName: string;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ 
  onBackToLogin,
  onSuccess 
}) => {
  const [clubName, setClubName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
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
        throw new Error(data.error || 'Password reset failed');
      }

      setResetResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToLogin = () => {
    if (resetResult) {
      onSuccess({
        username: resetResult.username,
        password: resetResult.newPassword,
      });
    }
  };

  if (resetResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Password Reset Successfully!
          </h2>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-green-800 mb-4">Your New Login Credentials:</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-green-700">Club Name:</label>
                <p className="font-mono bg-white p-2 rounded border text-gray-800">
                  {resetResult.clubName}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-green-700">Username:</label>
                <p className="font-mono bg-white p-2 rounded border text-gray-800">
                  {resetResult.username}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-green-700">New Password:</label>
                <p className="font-mono bg-white p-2 rounded border text-gray-800">
                  {resetResult.newPassword}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-orange-800">
              <strong>Important:</strong> Please save these credentials securely. 
              Your old password has been replaced with this new one.
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
            Reset Admin Password
          </h1>
          <p className="text-gray-600">
            Enter your club details to reset your admin password
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
              placeholder="Enter your exact club name"
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
              Enter the exact name used during club registration
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
                Resetting Password...
              </div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};