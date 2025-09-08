import React from 'react'
import { Home, Users, Plus, History, BarChart3, Trophy } from 'lucide-react'

type ActiveView = 'dashboard' | 'players' | 'newMatch' | 'playMatch' | 'history' | 'stats'

interface NavigationProps {
  activeView: ActiveView
  onNavigate: (view: ActiveView) => void
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: Home },
    { id: 'players' as ActiveView, label: 'Players', icon: Users },
    { id: 'newMatch' as ActiveView, label: 'New Match', icon: Plus },
    { id: 'history' as ActiveView, label: 'History', icon: History },
    { id: 'stats' as ActiveView, label: 'Statistics', icon: BarChart3 },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white shadow-lg border-b-4 border-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Trophy className="text-green-600" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">Cricket Manager</h1>
            </div>

            {/* Nav Items */}
            <div className="flex space-x-2">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = activeView === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    aria-label={item.label}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-green-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white shadow-md border-b-4 border-green-600">
        {/* Logo */}
        <div className="flex items-center justify-center py-3">
          <Trophy className="text-green-600 mr-2" size={24} />
          <h1 className="text-lg font-bold text-gray-800">Cricket Manager</h1>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex overflow-x-auto no-scrollbar px-2">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-label={item.label}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-3 min-w-[80px] flex-shrink-0 transition-all duration-200 text-sm ${
                  isActive
                    ? 'text-green-600 bg-green-50 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <Icon size={20} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
