import React, { useState, useRef, useEffect } from 'react'
import { Home, Users, Plus, History, BarChart3, Trophy, LogOut, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type ActiveView = 'dashboard' | 'players' | 'new-match' | 'play-match' | 'history' | 'stats'

interface NavigationProps {
  activeView: ActiveView
  role?: 'admin' | 'player'
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, role = 'admin' }) => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  // Admin nav goes to /app/* routes
  const adminNav = [
    { id: 'dashboard' as ActiveView, path: '/app/dashboard', label: 'Dashboard', icon: Home },
    { id: 'players' as ActiveView, path: '/app/players', label: 'Players', icon: Users },
    { id: 'new-match' as ActiveView, path: '/app/new-match', label: 'New Match', icon: Plus },
    { id: 'history' as ActiveView, path: '/app/history', label: 'History', icon: History },
    { id: 'stats' as ActiveView, path: '/app/stats', label: 'Statistics', icon: BarChart3 },
  ];

  // Player nav points to /player/* routes and only exposes read-only pages
  const playerNav = [
    { id: 'dashboard' as ActiveView, path: '/player/dashboard', label: 'Dashboard', icon: Home },
    { id: 'history' as ActiveView, path: '/player/history', label: 'History', icon: History },
    { id: 'stats' as ActiveView, path: '/player/stats', label: 'Statistics', icon: BarChart3 },
  ];

  const navItems = role === 'player' ? playerNav : adminNav;

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return
      const wrappers = document.querySelectorAll<HTMLElement>('.profile-menu-wrapper')
      for (const w of Array.from(wrappers)) {
        if (w.contains(e.target as Node)) {
          return
        }
      }
      setMenuOpen(false)
    }

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  const initials = user ? user.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : 'A'

  const goToSettings = () => {
    setMenuOpen(false)
    navigate('/settings')
  }

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-gradient-to-r from-green-700 via-green-600 to-green-700 shadow-2xl border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo left */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
                <Trophy className="relative text-white" size={40} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Cricket Manager</h1>
                <p className="text-green-100 text-sm">Manage your cricket league</p>
              </div>
            </div>

            {/* Nav Items */}
            <div className="flex items-center space-x-4">
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
                      {isActive && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-700 rounded-full"></div>}
                    </Link>
                  )
                })}
              </div>

              {/* Profile dropdown */}
              <div className="relative profile-menu-wrapper" ref={menuRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
                  className="flex items-center gap-3 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  <div className="w-9 h-9 rounded-full bg-white text-green-700 font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="hidden md:inline text-white font-medium">{user ?? 'User'}</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={goToSettings}
                      className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Tablet, Mobile — same pattern as desktop; the nav uses same `navItems` list so player/admin variant is applied */}
      <nav className="hidden md:block lg:hidden bg-gradient-primary shadow-xl">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            {/* Compact Logo */}
            <div className="flex items-center gap-3">
              <Trophy className="text-white" size={24} />
              <h1 className="text-lg font-bold text-white">Cricket Manager</h1>
            </div>

            {/* Compact Nav */}
            <div className="flex items-center gap-3">
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
                        isActive ? 'bg-white text-green-700 shadow-md' : 'text-green-100 hover:text-white hover:bg-green-600/50'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm hidden sm:inline">{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Profile (tablet) */}
              <div className="relative profile-menu-wrapper" ref={menuRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-white text-green-700 font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="hidden sm:inline text-white font-medium">{user ?? 'Admin'}</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={goToSettings}
                      className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header: logo left and profile on right (always visible) */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-green-500 bg-gradient-primary z-40">
          <div className="flex items-center gap-3">
            <Trophy className="text-white" size={20} />
            <h1 className="text-sm font-bold text-white">Cricket Manager</h1>
          </div>

          {/* Profile button (mobile) */}
          <div className="relative profile-menu-wrapper" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
              className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-white text-green-700 font-bold flex items-center justify-center">
                {initials}
              </div>
              <span className="hidden sm:inline text-white font-medium">{user ?? 'Admin'}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-2 top-full mt-2 w-44 bg-white rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={goToSettings}
                  className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Settings size={16} />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar (fixed) - logout removed from bottom bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-green-600/60 backdrop-blur-sm border-t border-green-500"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
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
                  isActive ? 'text-white bg-green-700/50' : 'text-green-100 hover:text-white active:bg-green-700/30'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20' : ''}`}>
                  <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
                </div>
                <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
                {isActive && <div className="w-1 h-1 bg-white rounded-full mt-1"></div>}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
