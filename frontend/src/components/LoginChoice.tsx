import React from 'react';
import { useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginChoice: React.FC = () => {
  // Hooks must be called unconditionally
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome to Cricket Manager</h1>
        <p className="text-sm text-gray-600 mb-6">Choose your login type to continue</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => navigate('/admin-login')}
            className="btn-primary py-3 px-6 rounded-lg flex items-center justify-center gap-2"
            aria-label="Admin login"
          >
            <span className="font-medium">Admin Login</span>
          </button>

          <button
            onClick={() => navigate('/player-login')}
            className="border border-gray-200 py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
            aria-label="Player login"
          >
            <span className="font-medium">Player Login</span>
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Admins can manage players & matches. Players can view their own stats and match history.
        </p>

        <hr className="my-6" />

        <div className="text-xs text-gray-600 space-y-2">
          <div>
            Authenticated:{' '}
            <span className="font-medium">{isAuthenticated ? 'yes' : 'no'}</span>
            {role ? <span> — role: <strong>{role}</strong></span> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginChoice;