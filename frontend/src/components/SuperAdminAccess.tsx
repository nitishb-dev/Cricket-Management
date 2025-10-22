import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';

interface SuperAdminAccessProps {
  onAccessGranted: () => void;
}

export const SuperAdminAccess: React.FC<SuperAdminAccessProps> = ({ onAccessGranted }) => {
  const [secretKey, setSecretKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const storedKey = localStorage.getItem('super_admin_access_key');
    if (storedKey) {
      setSecretKey(storedKey);
      // Auto-verify stored key
      verifyAccess(storedKey);
    }
  }, []);

  const verifyAccess = async (key: string) => {
    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/super-admin/verify-access`, {
        headers: {
          'X-Super-Admin-Key': key
        }
      });

      if (response.ok) {
        localStorage.setItem('super_admin_access_key', key);
        onAccessGranted();
      } else if (response.status === 404) {
        setError('Access denied. Invalid credentials or insufficient permissions.');
        localStorage.removeItem('super_admin_access_key');
      } else {
        setError('Unable to verify access. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      setError('Please enter the access key');
      return;
    }
    verifyAccess(secretKey);
  };

  const handleClearAccess = () => {
    localStorage.removeItem('super_admin_access_key');
    localStorage.removeItem('super_admin_token');
    setSecretKey('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Super Admin Access</h1>
            <p className="text-gray-600">
              This area is restricted to authorized personnel only
            </p>
          </div>

          {/* Access Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                  placeholder="Enter your access key"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !secretKey.trim()}
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Verifying Access...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Verify Access
                </div>
              )}
            </button>
          </form>

          {/* Clear Access */}
          {localStorage.getItem('super_admin_access_key') && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleClearAccess}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear stored access credentials
              </button>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Security Notice:</p>
                <p>This system implements multiple security layers including IP whitelisting, domain verification, and access key validation. All access attempts are logged and monitored.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};