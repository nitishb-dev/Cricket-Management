import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ArrowLeft, 
  User, 
  Shield,
  Key,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlayerApi } from '../context/usePlayerApi';
import { PlayerPasswordChange } from './PlayerPasswordChange';
import { SuccessToast } from './SuccessToast';

interface PlayerData {
  id: string;
  name: string;
  username: string;
  clubId: string;
  clubName: string;
}

export const PlayerSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { apiFetch } = usePlayerApi();
  const [activeTab, setActiveTab] = useState<'account' | 'password' | 'privacy'>('account');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Load player data on component mount
  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const data = await apiFetch<PlayerData>('/player/me');
        setPlayerData(data);
      } catch (error) {
        console.error('Failed to load player data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, [apiFetch]);

  const handlePasswordChangeSuccess = () => {
    setShowPasswordChange(false);
    setShowSuccessMessage(true);
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 2000);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Toast */}
      {showSuccessMessage && (
        <SuccessToast
          message="Password Changed Successfully!"
          description="Your password has been updated and is now active."
          onClose={() => setShowSuccessMessage(false)}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/player/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account preferences</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'account'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User size={20} />
                Account Info
              </button>
              
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'password'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Key size={20} />
                Password & Security
              </button>
              
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'privacy'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield size={20} />
                Privacy
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeTab === 'account' && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={playerData?.name || user || ''}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Contact your club admin to change your name
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={playerData?.username || 'Loading...'}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Username cannot be changed
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Club Name
                        </label>
                        <input
                          type="text"
                          value={playerData?.clubName || 'Loading...'}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Player ID
                        </label>
                        <input
                          type="text"
                          value={playerData?.id ? `${playerData.id.slice(0, 8)}...` : 'Loading...'}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-blue-900">Account Management</h3>
                          <p className="text-sm text-blue-700 mt-1">
                            To update your personal information like name or profile details, 
                            please visit your <button 
                              onClick={() => navigate('/player/profile')}
                              className="underline hover:no-underline"
                            >
                              Profile Page
                            </button> or contact your club administrator.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'password' && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Password & Security</h2>
                
                {!showPasswordChange ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">Password</h3>
                        <p className="text-sm text-gray-600">
                          Keep your account secure with a strong password
                        </p>
                      </div>
                      <button
                        onClick={() => setShowPasswordChange(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <h3 className="font-medium text-blue-900 mb-2">🔒 Security Tips</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Use a strong, unique password</li>
                        <li>• Don't share your password with anyone</li>
                        <li>• Change your password regularly</li>
                        <li>• Always logout when finished</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <button
                        onClick={() => setShowPasswordChange(false)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <ArrowLeft size={16} />
                        Back to Security Settings
                      </button>
                    </div>
                    
                    <PlayerPasswordChange
                      isFirstTime={false}
                      onSuccess={handlePasswordChangeSuccess}
                      onCancel={() => setShowPasswordChange(false)}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Profile Visibility</h3>
                      <p className="text-sm text-gray-600">
                        Your profile is visible to club members and administrators
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Club Members Only
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Match Statistics</h3>
                      <p className="text-sm text-gray-600">
                        Your match performance and statistics
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Club Members Only
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <h3 className="font-medium text-gray-900 mb-2">Data Privacy</h3>
                    <p className="text-sm text-gray-600">
                      Your personal information and match data is only accessible to members 
                      of your cricket club and club administrators. We do not share your 
                      information with other clubs or external parties.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};