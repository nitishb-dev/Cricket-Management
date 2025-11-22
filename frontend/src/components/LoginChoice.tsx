import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Trophy, TrendingUp, Users, BarChart3 } from 'lucide-react';

const LoginChoice: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their respective dashboards
  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') {
        navigate('/app/dashboard', { replace: true });
      } else if (role === 'player') {
        navigate('/player/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 bg-primary-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-accent-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[600px] h-80 sm:h-[600px] bg-secondary-100/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-primary p-3 sm:p-4 md:p-6 rounded-full shadow-2xl">
                <Trophy className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 tracking-tight px-2">
            Cricket <span className="text-gradient">Manager</span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Your complete cricket club management solution
          </p>
        </div>

        {/* Login Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          {/* Admin Login Card */}
          <div
            onClick={() => navigate('/admin-login')}
            className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary-200 transform hover:-translate-y-2"
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative p-4 sm:p-6 md:p-8">
              {/* Icon */}
              <div className="mb-4 sm:mb-6 inline-flex">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500/20 rounded-xl sm:rounded-2xl blur-lg sm:blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-gradient-primary p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-500">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-primary-600 transition-colors">
                Admin Portal
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Manage your cricket club, players, matches, and track comprehensive statistics
              </p>

              {/* Features */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary-500 rounded-full flex-shrink-0"></div>
                  <span>Full club management access</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary-500 rounded-full flex-shrink-0"></div>
                  <span>Player & match administration</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary-500 rounded-full flex-shrink-0"></div>
                  <span>Advanced analytics & reports</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                <span className="text-sm sm:text-base text-primary-600 font-semibold group-hover:text-primary-700">
                  Sign in as Admin
                </span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-600 transition-all duration-300 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Player Login Card */}
          <div
            onClick={() => navigate('/player-login')}
            className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border-2 border-transparent hover:border-secondary-200 transform hover:-translate-y-2"
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/5 to-secondary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative p-4 sm:p-6 md:p-8">
              {/* Icon */}
              <div className="mb-4 sm:mb-6 inline-flex">
                <div className="relative">
                  <div className="absolute inset-0 bg-secondary-500/20 rounded-xl sm:rounded-2xl blur-lg sm:blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-gradient-to-br from-secondary-500 to-secondary-700 p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-500">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-secondary-600 transition-colors">
                Player Portal
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Access your personal stats, match history, and track your cricket performance
              </p>

              {/* Features */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-secondary-500 rounded-full flex-shrink-0"></div>
                  <span>View personal statistics</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-secondary-500 rounded-full flex-shrink-0"></div>
                  <span>Match history & performance</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-secondary-500 rounded-full flex-shrink-0"></div>
                  <span>Profile management</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                <span className="text-sm sm:text-base text-secondary-600 font-semibold group-hover:text-secondary-700">
                  Sign in as Player
                </span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary-100 rounded-full flex items-center justify-center group-hover:bg-secondary-600 transition-all duration-300 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600 group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-white/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="bg-primary-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1">Team Management</h3>
                <p className="text-xs sm:text-sm text-gray-600">Organize players and track team performance</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="bg-accent-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1">Live Scoring</h3>
                <p className="text-xs sm:text-sm text-gray-600">Real-time match scoring and updates</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="bg-secondary-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1">Analytics</h3>
                <p className="text-xs sm:text-sm text-gray-600">Detailed insights and performance metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginChoice;