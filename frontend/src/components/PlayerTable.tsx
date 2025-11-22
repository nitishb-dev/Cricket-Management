import React, { useState, useMemo } from 'react';
import { Player, PlayerStats } from '../types/cricket';
import { PlayerCard } from './PlayerCard';
import { Search, LayoutGrid, List as ListIcon, Edit, Trash2, Key } from 'lucide-react';
import { Input } from './Input';
import { Avatar } from './Avatar';
import { cn } from '../utils/cn';

interface PlayerTableProps {
    players: Player[];
    stats: Record<string, PlayerStats>;
    onEdit: (player: Player) => void;
    onDelete: (player: Player) => void;
    onResetPassword: (player: Player) => void;
}

export const PlayerTable: React.FC<PlayerTableProps> = ({
    players,
    stats,
    onEdit,
    onDelete,
    onResetPassword,
}) => {
    const [view, setView] = useState<'grid' | 'list'>('list');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'name' | 'runs' | 'wickets'>('name');

    const filteredPlayers = useMemo(() => {
        return players
            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => {
                if (sort === 'name') return a.name.localeCompare(b.name);
                const statsA = stats[a.id];
                const statsB = stats[b.id];
                if (!statsA || !statsB) return 0;
                if (sort === 'runs') return statsB.totalRuns - statsA.totalRuns;
                if (sort === 'wickets') return statsB.totalWickets - statsA.totalWickets;
                return 0;
            });
    }, [players, search, sort, stats]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-full sm:w-72">
                    <Input
                        placeholder="Search players..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        leftIcon={<Search className="w-4 h-4" />}
                        className="bg-gray-50 border-transparent focus:bg-white"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as any)}
                        className="px-4 py-2.5 bg-gray-50 border-transparent rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:outline-none cursor-pointer"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="runs">Sort by Runs</option>
                        <option value="wickets">Sort by Wickets</option>
                    </select>

                    <div className="flex bg-gray-50 p-1 rounded-xl">
                        <button
                            onClick={() => setView('list')}
                            className={cn(
                                'p-2 rounded-lg transition-all',
                                view === 'list' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView('grid')}
                            className={cn(
                                'p-2 rounded-lg transition-all',
                                view === 'grid' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlayers.map((player) => (
                        <PlayerCard
                            key={player.id}
                            player={player}
                            stats={stats[player.id]}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onResetPassword={onResetPassword}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Player</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Matches</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Runs</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Wickets</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPlayers.map((player) => {
                                    const playerStats = stats[player.id];
                                    return (
                                        <tr key={player.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={player.profilePictureUrl} alt={player.name} size="sm" />
                                                    <span className="font-medium text-gray-900">{player.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-600">
                                                {playerStats?.totalMatches || 0}
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm font-medium text-primary-600">
                                                {playerStats?.totalRuns || 0}
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm font-medium text-accent-500">
                                                {playerStats?.totalWickets || 0}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => onResetPassword(player)}
                                                        className="p-2 text-gray-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
                                                        title="Reset Password"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onEdit(player)}
                                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(player)}
                                                        className="p-2 text-gray-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
