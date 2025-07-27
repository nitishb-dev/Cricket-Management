// import React, { useState } from 'react'
// import { User, Plus, Search, AlertCircle } from 'lucide-react'
// import { useCricket } from '../context/CricketContext'
// import { Player } from '../types/cricket'

// interface PlayerManagementProps {
//   selectedPlayers?: Player[]
//   onPlayerSelect?: (player: Player) => void
//   onPlayerDeselect?: (player: Player) => void
//   maxSelections?: number
//   title?: string
//   disabledPlayers?: Player[]  // ✅ NEW PROP
// }

// export const PlayerManagement: React.FC<PlayerManagementProps> = ({
//   selectedPlayers = [],
//   onPlayerSelect,
//   onPlayerDeselect,
//   maxSelections,
//   title = "Player Management",
//   disabledPlayers = []        // ✅ DEFAULT
// }) => {
//   const { players, addPlayer, loading } = useCricket()
//   const [newPlayerName, setNewPlayerName] = useState('')
//   const [searchTerm, setSearchTerm] = useState('')
//   const [isAddingPlayer, setIsAddingPlayer] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const handleAddPlayer = async (e: React.FormEvent) => {
//     e.preventDefault()
//     const trimmedName = newPlayerName.trim()

//     if (!trimmedName) return

//     const exists = players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())
//     if (exists) {
//       setError('Player already exists')
//       return
//     }

//     setIsAddingPlayer(true)
//     setError(null)

//     const player = await addPlayer(trimmedName)
//     if (player) {
//       setNewPlayerName('')
//     }

//     setIsAddingPlayer(false)
//   }

//   const filteredPlayers = players.filter(player =>
//     player.name.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   const isPlayerSelected = (player: Player) =>
//     selectedPlayers.some(p => p.id === player.id)

//   const isPlayerDisabled = (player: Player) =>
//     disabledPlayers.some(p => p.id === player.id)

//   const canSelectMore = !maxSelections || selectedPlayers.length < maxSelections

//   return (
//     <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
//       <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
//         <User className="text-green-600" />
//         {title}
//       </h2>

//       {/* Add New Player */}
//       <form onSubmit={handleAddPlayer} className="mb-6">
//         <div className="flex flex-col sm:flex-row gap-3">
//           <input
//             type="text"
//             value={newPlayerName}
//             onChange={(e) => {
//               setNewPlayerName(e.target.value)
//               if (error) setError(null)
//             }}
//             placeholder="Enter player name"
//             className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           />
//           <button
//             type="submit"
//             disabled={!newPlayerName.trim() || isAddingPlayer}
//             className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
//           >
//             <Plus size={16} />
//             {isAddingPlayer ? 'Adding...' : 'Add Player'}
//           </button>
//         </div>
//         {error && (
//           <div className="mt-2 flex items-center text-sm text-red-600 gap-1">
//             <AlertCircle size={16} />
//             {error}
//           </div>
//         )}
//       </form>

//       {/* Search Players */}
//       <div className="mb-6">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Search players..."
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           />
//         </div>
//       </div>

//       {/* Player Count Info */}
//       {maxSelections && (
//         <div className="mb-4 text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
//           <span>Selected: {selectedPlayers.length}/{maxSelections} players</span>
//           <span className="text-gray-500">Total Available Players: {players.length}</span>
//         </div>
//       )}

//       {/* Players List */}
//       {/* Player Count Summary */}
// <div className="mt-4 text-sm text-gray-600 text-center">
//   Showing {filteredPlayers.length} of {players.length} total players
//   {selectedPlayers.length > 0 && (
//     <> — {selectedPlayers.length} selected</>
//   )}
// </div>

//       <div className="space-y-2 max-h-[400px] overflow-y-auto">
//         {loading ? (
//           <div className="text-center py-4 text-gray-500">Loading players...</div>
//         ) : filteredPlayers.length === 0 ? (
//           <div className="text-center py-4 text-gray-500">
//             {searchTerm ? 'No players found matching your search' : 'No players added yet'}
//           </div>
//         ) : (
//           filteredPlayers.map(player => {
//             const selected = isPlayerSelected(player)
//             const disabled = isPlayerDisabled(player)

//             return (
//               <div
//                 key={player.id}
//                 className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
//                   selected
//                     ? 'border-green-500 bg-green-50 cursor-pointer'
//                     : disabled
//                     ? 'border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed'
//                     : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
//                 }`}
//                 onClick={() => {
//                   if (disabled) return
//                   if (selected && onPlayerDeselect) {
//                     onPlayerDeselect(player)
//                   } else if (!selected && onPlayerSelect && canSelectMore) {
//                     onPlayerSelect(player)
//                   }
//                 }}
//               >
//                 <span className="font-medium">{player.name}</span>
//                 <div className="flex items-center gap-2">
//                   {selected && (
//                     <span className="text-green-600 font-medium text-sm">Selected</span>
//                   )}
//                   <div
//                     className={`w-4 h-4 rounded-full border-2 ${
//                       selected ? 'bg-green-500 border-green-500' : 'border-gray-300'
//                     }`}
//                   />
//                 </div>
//               </div>
//             )
//           })
//         )}
//       </div>
//       {/* Player Count Summary */}
// <div className="mt-4 text-sm text-gray-600 text-center">
//   Showing {filteredPlayers.length} of {players.length} total players
//   {selectedPlayers.length > 0 && (
//     <> — {selectedPlayers.length} selected</>
//   )}
// </div>
//     </div>
//   )
// }


import React, { useState } from 'react'
import { User, Plus, Search, AlertCircle } from 'lucide-react'
import { useCricket } from '../context/CricketContext'
import { Player } from '../types/cricket'

interface PlayerManagementProps {
  selectedPlayers?: Player[]
  onPlayerSelect?: (player: Player) => void
  onPlayerDeselect?: (player: Player) => void
  maxSelections?: number
  title?: string
  disabledPlayers?: Player[]  // ✅ NEW PROP
}

export const PlayerManagement: React.FC<PlayerManagementProps> = ({
  selectedPlayers = [],
  onPlayerSelect,
  onPlayerDeselect,
  maxSelections,
  title = "Player Management",
  disabledPlayers = []        // ✅ DEFAULT
}) => {
  const { players, addPlayer, loading } = useCricket()
  const [newPlayerName, setNewPlayerName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isPlayerSelected = (player: Player) =>
    selectedPlayers.some(p => p.id === player.id)

  const isPlayerDisabled = (player: Player) =>
    disabledPlayers.some(p => p.id === player.id)

  const canSelectMore = !maxSelections || selectedPlayers.length < maxSelections

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <User className="text-green-600" />
        {title}
      </h2>

      {/* Add New Player */}
      <form onSubmit={handleAddPlayer} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => {
              setNewPlayerName(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Enter player name"
            className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newPlayerName.trim() || isAddingPlayer}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} />
            {isAddingPlayer ? 'Adding...' : 'Add Player'}
          </button>
        </div>
        {error && (
          <div className="mt-2 flex items-center text-sm text-red-600 gap-1">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </form>

      {/* Search Players */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search players..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Player Count Info */}
      {maxSelections && (
        <div className="mb-4 text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <span>Selected: {selectedPlayers.length}/{maxSelections} players</span>
          <span className="text-gray-500">Total Available Players: {players.length}</span>
        </div>
      )}

      {/* Players List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading players...</div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {searchTerm ? 'No players found matching your search' : 'No players added yet'}
          </div>
        ) : (
          filteredPlayers.map(player => {
            const selected = isPlayerSelected(player)
            const disabled = isPlayerDisabled(player)

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  selected
                    ? 'border-green-500 bg-green-50 cursor-pointer'
                    : disabled
                    ? 'border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
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
                <span className="font-medium">{player.name}</span>
                <div className="flex items-center gap-2">
                  {selected && (
                    <span className="text-green-600 font-medium text-sm">Selected</span>
                  )}
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      selected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ✅ Player Count Summary */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing {filteredPlayers.length} of {players.length} total players
        {selectedPlayers.length > 0 && (
          <> — {selectedPlayers.length} selected</>
        )}
      </div>
    </div>
  )
}
