import React from 'react';
import { Player, PlayerStats } from '../types/cricket';
import { Avatar } from './Avatar';
import { Button } from './Button';

interface PlayerCardProps {
    player: Player;
    stats?: PlayerStats;
    onEdit?: (player: Player) => void;
    onDelete?: (player: Player) => void;
    onResetPassword?: (player: Player) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
    player,
    stats,
    onEdit,
    onDelete,
    onResetPassword,
}) => {
    return (
        <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-500/20 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Avatar src={player.profilePictureUrl} alt={player.name} size="lg" className="ring-4 ring-gray-50 group-hover:ring-primary-500/10 transition-all" />
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{player.name}</h3>
                            <p className="text-sm text-gray-500">Joined {new Date(player.created_at).getFullYear()}</p>
                        </div>
                    </div>
                </div>

                {stats ? (
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="text-center p-2 bg-gray-50 rounded-xl group-hover:bg-primary-500/5 transition-colors">
                            <p className="text-xs text-gray-500 mb-1">Matches</p>
                            <p className="font-bold text-gray-900">{stats.totalMatches}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-xl group-hover:bg-primary-500/5 transition-colors">
                            <p className="text-xs text-gray-500 mb-1">Runs</p>
                            <p className="font-bold text-primary-600">{stats.totalRuns}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-xl group-hover:bg-primary-500/5 transition-colors">
                            <p className="text-xs text-gray-500 mb-1">Wickets</p>
                            <p className="font-bold text-accent-500">{stats.totalWickets}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-20 bg-gray-50 rounded-xl mb-6 text-gray-400 text-sm">
                        No stats available
                    </div>
                )}

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {onEdit && (
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(player)}>
                            Edit
                        </Button>
                    )}
                    {onResetPassword && (
                        <Button variant="ghost" size="sm" onClick={() => onResetPassword(player)} title="Reset Password">
                            <KeyIcon className="w-4 h-4" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button variant="ghost" size="sm" className="text-accent-500 hover:text-accent-600 hover:bg-accent-50" onClick={() => onDelete(player)} title="Delete Player">
                            <TrashIcon className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="7.5" cy="15.5" r="5.5" />
            <path d="m21 2-9.6 9.6" />
            <path d="m15.5 7.5 3 3L22 7l-3-3" />
        </svg>
    );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    );
}
