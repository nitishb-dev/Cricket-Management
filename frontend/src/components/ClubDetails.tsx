import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  Calendar, 
  BarChart3,
  User,
  Clock,
  Target,
  Award,
  TrendingUp,
  Activity
} from 'lucide-react';
import { superAdminGet } from '../utils/superAdminApi';

interface Player {
  id: string;
  name: string;
  username: string;
  created_at: string;
  stats: {
    matchesPlayed: number;
    runsScored: number;
    wicketsTaken: number;
    average: number;
  };
}

interface Match {
  id: string;
  team1: string;
  team2: string;
  date: string;
  status: string;
  winner: string | null;
  total_runs: number;
  total_wickets: number;
}

interface ClubData {
  id: string;
  name: string;
  created_at: string;
  admins: Array<{
    id: string;
    username: string;
    admin_name: string;
    created_at: string;
  }>;
  stats: {
    playerCount: number;
    matchCount: number;
    lastActivity: string | null;
    totalRuns: number;
    totalWickets: number;
    averageScore: number;
  };
}

export const ClubDetails: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'matches'>('overview');

  const token = localStorage.getItem('super_admin_token');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchClubDetails = async () => {
      if (!clubId) return;
      
      setLoading(true);
      setError(null);

      try {
        const [clubResponse, playersResponse, matchesResponse] = await Promise.all([
          superAdminGet(`/api/super-admin/clubs/${clubId}`),
          superAdminGet(`/api/super-admin/clubs/${clubId}/players`),
          superAdminGet(`/api/super-admin/clubs/${clubId}/matches`)
        ]);

        if (!clubResponse.ok) {
          throw new Error('Failed to fetch club details');
        }

        const clubData = await clubResponse.json();
        setClubData(clubData);

        if (playersResponse.ok) {
          const playersData = await playersResponse.json();
          setPlayers(playersData);
        }

        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          setMatches(matchesData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load club details');
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetails();
  }, [clubId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading club details...</p>
        </div>
      </div>
    );
  }

  if (error || !clubData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Trophy className="w-16 h-16 mx-auto mb-2" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Club Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested club could not be found.'}</p>
          <button
            onClick={() => navigate('/super-admin/dashboard')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/super-admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{clubData.name}</h1>
                <p className="text-gray-600">Club Details & Statistics</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Registered: {new Date(clubData.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Players</p>
                <p className="text-2xl font-bold text-gray-900">{clubData.stats.playerCount}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">{clubData.stats.matchCount}</p>
              </div>
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Runs</p>
                <p className="text-2xl font-bold text-gray-900">{clubData.stats.totalRuns || 0}</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Wickets</p>
                <p className="text-2xl font-bold text-gray-900">{clubData.stats.totalWickets || 0}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'players', label: 'Players', icon: Users },
                { id: 'matches', label: 'Matches', icon: Trophy }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Club Admin Info */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Administration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clubData.admins.map((admin) => (
                      <div key={admin.id} className="flex items-center gap-3 p-4 bg-white rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{admin.admin_name}</p>
                          <p className="text-sm text-gray-600">@{admin.username}</p>
                          <p className="text-xs text-gray-500">
                            Admin since {new Date(admin.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Last Activity</p>
                      <p className="text-sm text-gray-600">
                        {clubData.stats.lastActivity 
                          ? new Date(clubData.stats.lastActivity).toLocaleString()
                          : 'No recent activity'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'players' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Players ({players.length})</h3>
                </div>
                
                {players.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No players registered yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {players.map((player) => (
                      <div key={player.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{player.name}</p>
                            <p className="text-sm text-gray-600">@{player.username}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Matches:</span>
                            <span className="font-medium">{player.stats?.matchesPlayed || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Runs:</span>
                            <span className="font-medium">{player.stats?.runsScored || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Wickets:</span>
                            <span className="font-medium">{player.stats?.wicketsTaken || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Joined:</span>
                            <span className="font-medium">{new Date(player.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'matches' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Matches ({matches.length})</h3>
                </div>
                
                {matches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No matches played yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <div key={match.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Trophy className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {match.team1} vs {match.team2}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(match.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              match.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {match.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Winner:</span>
                            <p className="font-medium">{match.winner || 'TBD'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Runs:</span>
                            <p className="font-medium">{match.total_runs || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Wickets:</span>
                            <p className="font-medium">{match.total_wickets || 0}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};