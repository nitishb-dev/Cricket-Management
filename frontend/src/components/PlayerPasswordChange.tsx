import React, { useState } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Key,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayerApi } from '../context/usePlayerApi';

interface PlayerPasswordChangeProps {
  isFirstTime?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PlayerPasswordChange: React.FC<PlayerPasswordChangeProps> = ({ 
  isFirstTime = false, 
  onSuccess,
  onCancel 
}) => {
  const { user } = useAuth();
  const { apiFetch } = usePlayerApi();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (!/[A-Za-z]/.test(password)) {
      errors.push('Password must contain at least one letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!isFirstTime && !currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      return;
    }

    if (!isFirstTime && currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      const requestBody: any = { newPassword };
      if (!isFirstTime) {
        requestBody.currentPassword = currentPassword;
      }

      await apiFetch('/player/change-password', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isFirstTime ? 'min-h-screen bg-gray-50 flex items-center justify-center p-4' : ''}`}>
      <div className={`${isFirstTime ? 'card max-w-md w-full p-8' : 'space-y-6'}`}>
        {isFirstTime && (
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Set Your Password
            </h1>
            <p className="text-gray-600">
              Welcome {user}! Please set a secure password for your account.
            </p>
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
              <p className="text-sm text-orange-800">
                <strong>First Time Login:</strong> You must set a new password to continue.
              </p>
            </div>
          </div>
        )}

        {!isFirstTime && (
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle size={16} />
              <span className="font-medium">Password changed successfully!</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              {isFirstTime ? 'Redirecting to your dashboard...' : 'You can now use your new password.'}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password (only if not first time) */}
          {!isFirstTime && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Enter your current password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFirstTime ? 'New Password' : 'New Password'}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field pr-12"
                placeholder="Enter your new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Password must be at least 6 characters with letters and numbers.
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pr-12"
                placeholder="Confirm your new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
              <div className="space-y-1 text-xs">
                {[
                  { test: newPassword.length >= 6, text: 'At least 6 characters' },
                  { test: /[A-Za-z]/.test(newPassword), text: 'Contains letters' },
                  { test: /[0-9]/.test(newPassword), text: 'Contains numbers' }
                ].map((req, index) => (
                  <div key={index} className={`flex items-center gap-2 ${req.test ? 'text-blue-600' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${req.test ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    {req.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className={`flex gap-4 pt-4 ${isFirstTime ? '' : 'border-t'}`}>
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || (!isFirstTime && !currentPassword)}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {isFirstTime ? 'Setting Password...' : 'Changing Password...'}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isFirstTime ? 'Set Password' : 'Change Password'}
                </>
              )}
            </button>
            
            {!isFirstTime && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {isFirstTime && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-2">🔒 Security Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use a password you don't use anywhere else</li>
              <li>• Include both letters and numbers</li>
              <li>• Keep your password private and secure</li>
              <li>• You can change it anytime from your profile</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};