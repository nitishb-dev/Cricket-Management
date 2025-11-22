import React, { useState, useRef, useEffect } from 'react'
import { LayoutDashboard, Users, PlusSquare, History, BarChart3, LogOut, User, Settings } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navConfig = {
  dashboard: { icon: LayoutDashboard, label: 'Dashboard' },
  players: { icon: Users, label: 'Players' },
  'new-match': { icon: PlusSquare, label: 'New Match' },
  'play-match': { icon: PlusSquare, label: 'Play Match' },
  history: { icon: History, label: 'History' },
  stats: { icon: BarChart3, label: 'Statistics' },
  profile: { icon: User, label: 'Profile' },
  settings: { icon: Settings, label: 'Settings' },
  logout: { icon: LogOut, label: 'Logout' }
}

interface NavigationProps {
  activeView: ActiveView
  role?: 'admin' | 'player'
}

type ActiveView = 'dashboard' | 'players' | 'new-match' | 'play-match' | 'history' | 'stats' | 'profile' | 'settings'

const adminNavItems: ActiveView[] = ['dashboard', 'players', 'new-match', 'history', 'stats']
const playerNavItems: ActiveView[] = ['dashboard', 'history', 'stats']

export const Navigation: React.FC<NavigationProps> = ({ activeView, role = 'admin' }) => {
  const { user, logout, clubName } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  // Separate refs for mobile and desktop dropdowns
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const desktopMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (mobileMenuRef.current && mobileMenuRef.current.contains(event.target as Node)) ||
        (desktopMenuRef.current && desktopMenuRef.current.contains(event.target as Node))
      ) {
        return
      }
      setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    console.log('Logging out...')
    setMenuOpen(false)
    logout()
    if (role === 'admin') navigate('/admin-login')
  }

  const navItems = (role === 'player' ? playerNavItems : adminNavItems).map(id => ({
    id,
    path: role === 'player' ? `/player/${id}` : `/app/${id}`,
    ...navConfig[id]
  }))

  const initials = user ? user.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : 'U'

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <LayoutDashboard className={role === 'player' ? 'text-secondary-600' : 'text-primary-600'} size={24} />
              <div>
                <h1 className="text-lg font-bold text-gray-800">Cricket Manager</h1>
                {clubName && <p className="text-xs text-gray-500">{clubName}</p>}
              </div>
            </div>

            {/* Mobile Profile Dropdown */}
            <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className={`w-10 h-10 rounded-full text-white font-bold flex items-center justify-center ${
                  role === 'player' ? 'bg-gradient-accent' : 'bg-gradient-primary'
                }`}
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-[9999] ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm text-gray-500">
                      Signed in as {role === 'admin' ? 'Admin' : 'Player'}
                    </p>
                    <p className="font-medium text-gray-900 truncate">{user}</p>
                  </div>

                  {role === 'player' && (
                    <>
                      <button
                        onClick={() => {
                          navigate('/player/profile')
                          setMenuOpen(false)
                        }}
                        className="dropdown-item w-full flex items-center gap-2 px-4"
                      >
                        <User size={16} /> View Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/player/edit-profile')
                          setMenuOpen(false)
                        }}
                        className="dropdown-item w-full flex items-center gap-2 px-4"
                      >
                        <User size={16} /> Edit Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/player/settings')
                          setMenuOpen(false)
                        }}
                        className="dropdown-item w-full flex items-center gap-2 px-4"
                      >
                        <Settings size={16} /> Settings
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="dropdown-item text-red-600 w-full flex items-center gap-2 px-4"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className={`hidden lg:block shadow-lg border-b-2 ${
        role === 'player' 
          ? 'bg-gradient-to-r from-secondary-700 via-secondary-600 to-secondary-700 border-secondary-500' 
          : 'bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 border-primary-500'
      }`}>
        <div className="mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
                <LayoutDashboard className="relative text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Cricket Manager</h1>
                {clubName && <p className={`text-sm ${role === 'player' ? 'text-secondary-100' : 'text-primary-100'}`}>{clubName}</p>}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                {navItems.map(item => {
                  const { icon: Icon } = item
                  const isActive = activeView === item.id
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={`group relative flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${isActive
                          ? role === 'player'
                            ? 'bg-white text-secondary-700 shadow-lg'
                            : 'bg-white text-primary-700 shadow-lg'
                          : role === 'player'
                            ? 'text-secondary-100 hover:text-white hover:bg-secondary-600/50'
                            : 'text-primary-100 hover:text-white hover:bg-primary-600/50'
                        }`}
                    >
                      <Icon
                        size={18}
                        className={isActive ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'}
                      />
                      <span className="hidden xl:block">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>

              {/* Desktop Profile Dropdown */}
              <div className="relative profile-menu-wrapper" ref={desktopMenuRef}>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setMenuOpen(v => !v)
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                >
                  <div className={`w-9 h-9 rounded-full bg-white font-bold flex items-center justify-center ${
                    role === 'player' ? 'text-secondary-700' : 'text-primary-700'
                  }`}>
                    {initials}
                  </div>
                  <span className="hidden md:inline text-white font-medium">{user ?? 'User'}</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-[9999]">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm text-gray-500">Signed in as {role}</p>
                      <p className="font-medium text-gray-900 truncate">{user}</p>
                    </div>

                    {role === 'player' && (
                      <>
                        <button
                          onClick={() => {
                            navigate('/player/profile')
                            setMenuOpen(false)
                          }}
                          className="dropdown-item w-full flex items-center gap-2 px-4"
                        >
                          <User size={16} /> View Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate('/player/edit-profile')
                            setMenuOpen(false)
                          }}
                          className="dropdown-item w-full flex items-center gap-2 px-4"
                        >
                          <User size={16} /> Edit Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate('/player/settings')
                            setMenuOpen(false)
                          }}
                          className="dropdown-item w-full flex items-center gap-2 px-4"
                        >
                          <Settings size={16} /> Settings
                        </button>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="dropdown-item text-red-600 w-full flex items-center gap-2 px-4"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 backdrop-blur-sm border-t ${
          role === 'player'
            ? 'bg-secondary-600/60 border-secondary-500'
            : 'bg-primary-600/60 border-primary-500'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        <div className="flex">
          {navItems.map(item => {
            const { icon: Icon } = item
            const isActive = activeView === item.id
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2 transition-all duration-300 ${
                  isActive 
                    ? role === 'player'
                      ? 'text-white bg-secondary-700/50'
                      : 'text-white bg-primary-700/50'
                    : role === 'player'
                      ? 'text-secondary-100 hover:text-white'
                      : 'text-primary-100 hover:text-white'
                  }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20' : ''}`}>
                  <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
                </div>
                <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
                {isActive && <div className="w-1 h-1 bg-white rounded-full mt-1"></div>}
              </NavLink>
            )
          })}
        </div>
      </div>
    </>
  )
}
