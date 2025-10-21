import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Target, GitCommit, Trophy, Award, User, History, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { usePlayerApi } from '../context/usePlayerApi';

interface PlayerDashboardStats {
  player: { id: string; name: string };
  totalRuns: number;
  totalWickets: number;
  totalMatches: number;
  totalWins: number;
  manOfMatchCount: number;
};

type MatchHistoryEntry = {
  id: string;
  match_id: string;
  team: string | null;
  runs: number;
  wickets: number;
  matches?: {
    id: string;
    team_a_name: string;
    team_b_name: string;
    team_a_score?: number;
    team_b_score?: number;
    winner?: string;
    match_date?: string;
  };
};

const StatHighlight: React.FC<{ label: string; value: string | number; icon: React.ReactNode; gradient: string }> = ({ label, value, icon, gradient }) => (
  <div className={`p-4 rounded-xl text-center text-white ${gradient} shadow-lg`}>
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-sm opacity-80 mt-1 flex items-center justify-center gap-2">{icon}{label}</div>
  </div>
);

const PlayerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { apiFetch, userId } = usePlayerApi();
  const [stats, setStats] = useState<PlayerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, historyData] = await Promise.all([
        apiFetch<PlayerDashboardStats>(`/player/detailed-stats`),
        apiFetch<MatchHistoryEntry[]>(`/player/history?limit=5`)
      ]);

      setStats(statsData ?? null);
      setHistory(historyData ?? []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiFetch, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 mt-8">
        <h2 className="text-xl font-bold">Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  const chartData = history
    .slice()
    .reverse()
    .map((h) => ({
      name: h.matches?.match_date ? dayjs(h.matches.match_date).format('MMM DD') : 'N/A',
      runs: h.runs,
    }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={40} className="text-gray-400" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user}!</h1>
            <p className="text-lg text-gray-600">Here's your performance snapshot.</p>
          </div>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Career Stats */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Career Highlights</h3>
        {stats ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatHighlight label="Matches" value={stats.totalMatches} icon={<BarChart3 size={16} />} gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
            <StatHighlight label="Runs" value={stats.totalRuns} icon={<Target size={16} />} gradient="bg-gradient-to-br from-orange-500 to-red-500" />
            <StatHighlight label="Wickets" value={stats.totalWickets} icon={<GitCommit size={16} />} gradient="bg-gradient-to-br from-red-500 to-pink-500" />
            <StatHighlight label="Wins" value={stats.totalWins} icon={<Trophy size={16} />} gradient="bg-gradient-to-br from-green-500 to-green-600" />
            <StatHighlight label="Man of Match" value={stats.manOfMatchCount} icon={<Award size={16} />} gradient="bg-gradient-to-br from-purple-500 to-indigo-600" />
          </div>
        ) : (
          <p className="text-gray-500">No career stats available yet.</p>
        )}
      </div>

      {/* Recent Matches */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Form</h3>
        {history.length > 0 ? (
          <div className="space-y-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '0.75rem',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                  <Bar dataKey="runs" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {history.map(h => {
                const match = h.matches;
                if (!match) return null;
                const result = match.winner ? (match.winner === h.team ? 'Won' : 'Lost') : 'N/A';
                const resultColor = result === 'Won' ? 'border-green-500 bg-green-50' : result === 'Lost' ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50';

                return (
                  <div key={h.id} className={`p-4 border-l-4 rounded-r-lg ${resultColor} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                    <div>
                      <div className="font-semibold text-gray-800">{match.team_a_name} vs {match.team_b_name}</div>
                      <div className="text-sm text-gray-500">
                        {match.match_date ? dayjs(match.match_date).format('MMM DD, YYYY') : 'Date not available'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-center">
                      <div>
                        <div className="font-bold text-lg">{h.runs}</div>
                        <div className="text-xs text-gray-500">Runs</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{h.wickets}</div>
                        <div className="text-xs text-gray-500">Wickets</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${result === 'Won' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{result}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <History size={32} className="mx-auto mb-2" />
            <p>You haven't played any matches yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDashboard;