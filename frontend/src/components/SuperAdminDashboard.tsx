import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Building, 
  BarChart3, 
  Trash2, 
  Eye, 
  Search,
  RefreshCw,
  AlertTriangle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { superAdminGet, superAdminDelete } from '../utils/superAdminApi';

interface Club {
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
  };
}

interface PlatformStats {
  totalClubs: number;
  totalPlayers: number;
  totalMatches: number;
  recentClubs: Array<{
    id: string;
    name: string;
    created_at: string;
  }>;
  monthlyRegistrations: Record<string, number>;
}

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('super_admin_token');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [clubsResponse, statsResponse] = await Promise.all([
        superAdminGet('/api/super-admin/clubs'),
        superAdminGet('/api/super-admin/stats')
      ]);

      if (!clubsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [clubsData, statsData] = await Promise.all([
        clubsResponse.json(),
        statsResponse.json()
      ]);

      setClubs(clubsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClub = async (clubId: string, clubName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${clubName}"? This will permanently delete all players, matches, and data associated with this club. This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await superAdminDelete(`/api/super-admin/clubs/${clubId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete club');
      }

      // Refresh data
      await fetchData();
      alert(`Club "${clubName}" has been successfully deleted.`);
    } catch (err) {
      alert(`Error deleting club: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.admins.some(admin => 
      admin.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading platform data...</p>
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
                <p className="text-gray-600">Manage all cricket clubs and platform statistics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/super-admin/settings')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Shield size={16} />
                Settings
              </button>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Platform Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Clubs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClubs}</p>
                </div>
                <Building className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Players</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPlayers}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Matches</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMatches}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clubs.filter(club => {
                      const today = new Date().toISOString().split('T')[0];
                      return club.stats.lastActivity?.startsWith(today);
                    }).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Clubs List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Registered Clubs</h2>
              <span className="text-sm text-gray-500">{filteredClubs.length} clubs</span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search clubs, admins, or usernames..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="divide-y">
            {filteredClubs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? 'No clubs found matching your search.' : 'No clubs registered yet.'}
              </div>
            ) : (
              filteredClubs.map((club) => (
                <div key={club.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{club.name}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Admin:</strong> {club.admins[0]?.admin_name || 'No admin'}
                          <br />
                          <strong>Username:</strong> {club.admins[0]?.username || 'N/A'}
                        </div>
                        <div>
                          <strong>Players:</strong> {club.stats.playerCount}
                          <br />
                          <strong>Matches:</strong> {club.stats.matchCount}
                        </div>
                        <div>
                          <strong>Registered:</strong> {new Date(club.created_at).toLocaleDateString()}
                          <br />
                          <strong>Last Activity:</strong> {
                            club.stats.lastActivity 
                              ? new Date(club.stats.lastActivity).toLocaleDateString()
                              : 'No activity'
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/club/${club.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Club Details"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {club.id !== '00000000-0000-0000-0000-000000000001' && (
                        <button
                          onClick={() => handleDeleteClub(club.id, club.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Club"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};