import React, { useState } from 'react'
import { User, Plus, Search, AlertCircle, Trash2, Edit, Save, XCircle } from 'lucide-react'
import { useCricket } from '../context/CricketContext'
import { Player } from '../types/cricket'

interface PlayerManagementProps {
  selectedPlayers?: Player[]
  onPlayerSelect?: (player: Player) => void
  onPlayerDeselect?: (player: Player) => void
  maxSelections?: number
  title?: string
  disabledPlayers?: Player[]
}

export const PlayerManagement: React.FC<PlayerManagementProps> = ({
  selectedPlayers = [],
  onPlayerSelect,
  onPlayerDeselect,
  maxSelections,
  title = "Player Management",
  disabledPlayers = []
}) => {
  // ✅ also bring deletePlayer and updatePlayer from context
  const { players, addPlayer, deletePlayer, updatePlayer, loading } = useCricket()

  const [newPlayerName, setNewPlayerName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State for inline editing
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const [editedName, setEditedName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)


  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = newPlayerName.trim()

    if (!trimmedName) return

    const exists = players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())
    if (exists) {
      setError('Player already exists')
      return
    }

    setIsAddingPlayer(true)
    setError(null)

    const player = await addPlayer(trimmedName)
    if (player) {
      setNewPlayerName('')
    }

    setIsAddingPlayer(false)
  }

  const handleUpdatePlayer = async (player: Player) => {
    const trimmedName = editedName.trim()
    if (!trimmedName || isUpdating || trimmedName === player.name) {
      setEditingPlayerId(null)
      return
    }

    if (players.some(p => p.id !== player.id && p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Player with this name already exists')
      return
    }

    setIsUpdating(true)
    setError(null)
    // Assumes updatePlayer is implemented in your context to call the API
    // and update the global state on success.
    const success = await updatePlayer(player.id, trimmedName)
    if (success) {
      setEditingPlayerId(null)
      setEditedName('')
    } else {
      setError('Failed to update player name.')
    }
    setIsUpdating(false)
  }

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isPlayerSelected = (player: Player) =>
    selectedPlayers.some(p => p.id === player.id)

  const isPlayerDisabled = (player: Player) =>
    disabledPlayers.some(p => p.id === player.id)

  const canSelectMore = !maxSelections || selectedPlayers.length < maxSelections

  return (
    <div className="page-container w-full overflow-x-hidden">
      <div className="content-container">
        <div className="card overflow-hidden">
          {/* Header Section */}
          <div className="section-header">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <User className="text-white w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>
                <p className="text-green-100 text-sm sm:text-base">Manage your cricket team roster</p>
              </div>
            </div>

            {/* Add Player Form */}
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => {
                      setNewPlayerName(e.target.value)
                      if (error) setError(null)
                    }}
                    placeholder="Enter player name"
                    className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-xl 
                               focus:ring-4 focus:ring-white/30 focus:bg-white text-gray-800 placeholder-gray-500
                               text-sm sm:text-base shadow-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newPlayerName.trim() || isAddingPlayer}
                  className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Plus size={18} />
                  {isAddingPlayer ? 'Adding...' : 'Add Player'}
                </button>
              </div>
              {error && (
                <div className="flex items-center text-sm text-red-200 gap-2 bg-red-500/20 p-3 rounded-xl backdrop-blur-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8">
            {/* Search */}
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search players..."
                  className="input-field pl-12"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-primary rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Players</p>
                    <p className="text-2xl font-bold">{players.length}</p>
                  </div>
                  <User className="w-8 h-8 text-green-200" />
                </div>
              </div>

              {maxSelections && (
                <div className="bg-gradient-secondary rounded-2xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Selected</p>
                      <p className="text-2xl font-bold">{selectedPlayers.length}/{maxSelections}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">
                      <span className="text-sm font-bold">{selectedPlayers.length}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-accent rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Showing</p>
                    <p className="text-2xl font-bold">{filteredPlayers.length}</p>
                  </div>
                  <Search className="w-8 h-8 text-blue-200" />
                </div>
              </div>
            </div>

            {/* Player List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading players...</p>
                </div>
              ) : filteredPlayers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {searchTerm ? 'No players found' : 'No players added yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'Add your first player to get started'}
                  </p>
                </div>
              ) : (
                filteredPlayers.map((player, index) => {
                  const selected = isPlayerSelected(player)
                  const disabled = isPlayerDisabled(player)
                  const isEditing = editingPlayerId === player.id

                  if (isEditing) {
                    return (
                      <div key={player.id} className="group bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-400 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdatePlayer(player)
                              if (e.key === 'Escape') setEditingPlayerId(null)
                            }}
                            autoFocus
                            className="font-semibold text-lg bg-transparent focus:outline-none flex-1 text-gray-800"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleUpdatePlayer(player)}
                              disabled={isUpdating}
                              className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-50 shadow-md"
                            >
                              {isUpdating ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              ) : (
                                <Save size={18} />
                              )}
                            </button>
                            <button
                              onClick={() => setEditingPlayerId(null)}
                              className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition shadow-md"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={player.id}
                      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-xl
                        ${selected
                          ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                          : disabled
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-lg'
                        }`}
                      onClick={() => {
                        if (disabled) return
                        if (selected && onPlayerDeselect) {
                          onPlayerDeselect(player)
                        } else if (!selected && onPlayerSelect && canSelectMore) {
                          onPlayerSelect(player)
                        }
                      }}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-orange-500 rounded-full -translate-y-16 translate-x-16"></div>
                      </div>

                      <div className="relative p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg
                              ${selected
                                ? 'bg-green-500 text-white'
                                : disabled
                                  ? 'bg-gray-300 text-gray-500'
                                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                              }`}>
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className={`font-semibold text-lg ${disabled ? 'line-through' : ''}`}>
                                {player.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Player #{index + 1}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {selected && (
                              <div className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                                Selected
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingPlayerId(player.id)
                                setEditedName(player.name)
                                setError(null)
                              }}
                              className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors opacity-0 group-hover:opacity-100"
                              aria-label={`Edit ${player.name}`}
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm(`Delete ${player.name}? This action cannot be undone and will remove the player from all match histories.`)) {
                                  deletePlayer(player.id)
                                }
                              }}
                              className="p-2 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors opacity-0 group-hover:opacity-100"
                              aria-label={`Delete ${player.name}`}
                            >
                              <Trash2 size={16} />
                            </button>

                            <div
                              className={`w-6 h-6 rounded-full border-3 transition-all duration-200
                                ${selected
                                  ? 'bg-green-500 border-green-500 shadow-lg'
                                  : 'border-gray-300 group-hover:border-green-400'
                                }
                              `}
                            >
                              {selected && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
