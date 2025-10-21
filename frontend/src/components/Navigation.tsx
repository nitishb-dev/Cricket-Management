import React, { useState, useRef, useEffect } from 'react'
import { LayoutDashboard, Users, PlusSquare, History, BarChart3, LogOut, User } from 'lucide-react'
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
  logout: { icon: LogOut, label: 'Logout' }
}

interface NavigationProps {
  activeView: ActiveView;
  role?: 'admin' | 'player'
}

type ActiveView = 'dashboard' | 'players' | 'new-match' | 'play-match' | 'history' | 'stats' | 'profile'

const adminNavItems: ActiveView[] = ['dashboard', 'players', 'new-match', 'history', 'stats']
const playerNavItems: ActiveView[] = ['dashboard', 'history', 'stats']

export const Navigation: React.FC<NavigationProps> = ({ activeView, role = 'admin' }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuRef])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    // After logging out, redirect to the appropriate login page
    if (role === 'admin') {
      navigate('/admin-login');
    }
  }
  const handlePlayerLogout = () => {
    setMenuOpen(false);
    logout();
  }

  const navItems = (role === 'player' ? playerNavItems : adminNavItems).map(id => ({
    id,
    path: role === 'player' ? `/player/${id}` : `/app/${id}`,
    ...navConfig[id]
  }));

  const initials = user ? user.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : 'U'

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title on left */}
            <div className="flex items-center gap-2">
              <LayoutDashboard className="text-green-600" size={24} />
              <h1 className="text-lg font-bold text-gray-800">Cricket Manager</h1>
            </div>

            {/* Profile dropdown on right */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-10 h-10 rounded-full bg-gradient-primary text-white font-bold flex items-center justify-center"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                {initials}
              </button>

              {menuOpen && (role === 'admin' ? (
                // Admin Dropdown
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm text-gray-500">Signed in as Admin</p>
                    <p className="font-medium text-gray-900 truncate">{user}</p>
                  </div>
                  <button onClick={handleLogout} className="dropdown-item text-red-600 w-full flex items-center gap-2 px-4"><LogOut size={16} /> Logout</button>
                </div>
              ) : (
                // Player Dropdown
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm">Signed in as</p>
                    <p className="font-medium text-gray-900 truncate">{user}</p>
                  </div>
                  <button onClick={() => { navigate('/player/profile'); setMenuOpen(false); }} className="dropdown-item w-full flex items-center gap-2 px-4"><User size={16} /> Profile</button>                  
                  <button onClick={handlePlayerLogout} className="dropdown-item text-red-600 w-full flex items-center gap-2 px-4"><LogOut size={16} /> Logout</button>
                  <button onClick={handlePlayerLogout} className="dropdown-item text-red-600 w-full flex items-center gap-2 px-4"><LogOut size={16} /> Logout</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-gradient-to-r from-green-700 via-green-600 to-green-700 shadow-lg border-b-2 border-green-500">
        <div className="mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo left */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
                <LayoutDashboard className="relative text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Cricket Manager</h1>
              </div>
            </div>

            {/* Nav Items */}
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                {navItems.map(item => {
                  const { icon: Icon } = item
                  const isActive = activeView === item.id

                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      aria-label={item.label}
                      className={`group relative flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                        isActive
                          ? 'bg-white text-green-700 shadow-lg'
                          : 'text-green-100 hover:text-white hover:bg-green-600/50 backdrop-blur-sm'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'} />
                      <span className="hidden xl:block">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>

              {/* Profile dropdown */}
              <div className="relative profile-menu-wrapper">
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

                {menuOpen && (role === 'admin' ? (
                  // Admin Dropdown
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm text-gray-500">Signed in as Admin</p>
                      <p className="font-medium text-gray-900 truncate">{user}</p>
                    </div>
                    <button onClick={handleLogout} className="dropdown-item text-red-600 w-full flex items-center gap-2 px-4">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                ) : (
                  // Player Dropdown
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm">Signed in as</p>
                      <p className="font-medium text-gray-900 truncate">{user}</p>
                    </div>
                    <button onClick={() => { navigate('/player/profile'); setMenuOpen(false); }} className="dropdown-item w-full flex items-center gap-2 px-4"><User size={16} /> Profile</button>
                    <button onClick={handleLogout} className="dropdown-item text-red-600 w-full flex items-center gap-2 px-4"><LogOut size={16} /> Logout</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Tablet, Mobile — same pattern as desktop; the nav uses same `navItems` list so player/admin variant is applied */}
      {/* Mobile Bottom Tab Bar (fixed) - logout removed from bottom bar */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-green-600/60 backdrop-blur-sm border-t border-green-500"
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
              </NavLink>
            )
          })}
        </div>
      </div>
    </>
  )
}
