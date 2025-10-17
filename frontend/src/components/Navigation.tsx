import React from 'react'
import { Home, Users, Plus, History, BarChart3, Trophy, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type ActiveView = 'dashboard' | 'players' | 'new-match' | 'play-match' | 'history' | 'stats'

interface NavigationProps {
  activeView: ActiveView
}

export const Navigation: React.FC<NavigationProps> = ({ activeView }) => {
  const { logout } = useAuth()
  const navItems = [
    { id: 'dashboard' as ActiveView, path: '/dashboard', label: 'Dashboard', icon: Home },
    { id: 'players' as ActiveView, path: '/players', label: 'Players', icon: Users },
    { id: 'new-match' as ActiveView, path: '/new-match', label: 'New Match', icon: Plus },
    { id: 'history' as ActiveView, path: '/history', label: 'History', icon: History },
    { id: 'stats' as ActiveView, path: '/stats', label: 'Statistics', icon: BarChart3 },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-gradient-to-r from-green-700 via-green-600 to-green-700 shadow-2xl border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
                <Trophy className="relative text-white" size={40} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Cricket Manager
                </h1>
                <p className="text-green-100 text-sm">Manage your cricket league</p>
              </div>
            </div>

            {/* Nav Items */}
            <div className="flex space-x-2">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = activeView === item.id

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    aria-label={item.label}
                    className={`group relative flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-white text-green-700 shadow-lg'
                        : 'text-green-100 hover:text-white hover:bg-green-600/50 backdrop-blur-sm'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'} />
                    <span className="hidden xl:block">{item.label}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-700 rounded-full"></div>
                    )}
                  </Link>
                )
              })}
              <button
                onClick={logout}
                aria-label="Logout"
                className="group relative flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-orange-100 hover:text-white hover:bg-orange-600/50 backdrop-blur-sm"
              >
                <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="hidden xl:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tablet Navigation */}
      <nav className="hidden md:block lg:hidden bg-gradient-primary shadow-xl">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            {/* Compact Logo */}
            <div className="flex items-center gap-3">
              <Trophy className="text-white" size={24} />
              <h1 className="text-lg font-bold text-white">Cricket Manager</h1>
            </div>

            {/* Compact Nav */}
            <div className="flex space-x-1">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = activeView === item.id

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    aria-label={item.label}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-green-700 shadow-md'
                        : 'text-green-100 hover:text-white hover:bg-green-600/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm hidden sm:inline">{item.label}</span>
                  </Link>
                )
              })}
              <button
                onClick={logout}
                aria-label="Logout"
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-orange-100 hover:text-white hover:bg-orange-600/50"
              >
                <LogOut size={18} />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header (still in flow) - logo left, logout right so logout is always visible on small screens */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-green-500 bg-gradient-primary">
          <div className="flex items-center gap-3">
            <Trophy className="text-white" size={20} />
            <h1 className="text-sm font-bold text-white">Cricket Manager</h1>
          </div>

          {/* Visible logout button for small screens */}
          <button
            onClick={logout}
            aria-label="Logout"
            className="flex items-center gap-2 text-orange-100 hover:text-white hover:bg-orange-600/30 px-3 py-2 rounded-lg transition"
          >
            <LogOut size={18} />
            <span className="sr-only">Logout</span>
            {/* if you want visible label on slightly larger small screens, use:
          <span className="hidden sm:inline text-sm text-white">Logout</span>
         but sr-only keeps DOM accessible without taking space */}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar (fixed) - logout removed from bottom bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-green-600/60 backdrop-blur-sm border-t border-green-500"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }} /* support iOS safe area */
      >
        <div className="flex">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <Link
                key={item.id}
                to={item.path}
                aria-label={item.label}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2 transition-all duration-300 ${
                  isActive
                    ? 'text-white bg-green-700/50'
                    : 'text-green-100 hover:text-white active:bg-green-700/30'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20' : ''}`}>
                  <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
                </div>
                <span className="text-xs font-medium truncate w-full text-center">
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-white rounded-full mt-1"></div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
