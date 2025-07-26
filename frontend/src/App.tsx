import React, { useState } from 'react'
import { CricketProvider } from './context/CricketContext'
import { Navigation } from './components/Navigation'
import { Dashboard } from './components/Dashboard'
import { PlayerManagement } from './components/PlayerManagement'
import { MatchSetup } from './components/MatchSetup'
import { MatchPlay } from './components/MatchPlay'
import { MatchHistory } from './components/MatchHistory'
import { PlayerStats } from './components/PlayerStats'
import { MatchData } from './types/cricket'

type ActiveView = 'dashboard' | 'players' | 'newMatch' | 'playMatch' | 'history' | 'stats'

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [currentMatch, setCurrentMatch] = useState<MatchData | null>(null)

  const handleStartMatch = (matchData: MatchData) => {
    setCurrentMatch(matchData)
    setActiveView('playMatch')
  }

  const handleMatchComplete = () => {
    setCurrentMatch(null)
    setActiveView('history')
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveView} />
      case 'players':
        return <PlayerManagement />
      case 'newMatch':
        return <MatchSetup onStartMatch={handleStartMatch} onCancel={() => setActiveView('dashboard')} />
      case 'playMatch':
        return currentMatch ? (
          <MatchPlay 
            matchData={currentMatch} 
            onMatchComplete={handleMatchComplete}
            onCancel={() => setActiveView('dashboard')}
          />
        ) : null
      case 'history':
        return <MatchHistory onRematch={handleStartMatch} />
      case 'stats':
        return <PlayerStats />
      default:
        return <Dashboard onNavigate={setActiveView} />
    }
  }

  return (
    <CricketProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navigation activeView={activeView} onNavigate={setActiveView} />
        <main className="container mx-auto px-4 py-6">
          {renderActiveView()}
        </main>
      </div>
    </CricketProvider>
  )
}

export default App