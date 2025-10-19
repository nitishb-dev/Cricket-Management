import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type PlayerStatsResponse = {
  player: { id: string; name: string };
  totalRuns: number;
  totalWickets: number;
  totalMatches: number;
  totalWins: number;
  manOfMatchCount: number;
};

type MatchEntry = {
  id: string;
  match_id: string;
  team: string | null;
  runs: number;
  wickets: number;
  ones: number;
  twos: number;
  threes: number;
  fours: number;
  sixes: number;
  created_at?: string;
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

const formatDate = (d?: string | null) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString();
};

const isSameLocalDay = (a?: string | null, b?: Date) => {
  if (!a) return false;
  const ad = new Date(a);
  if (Number.isNaN(ad.getTime())) return false;
  const bd = b || new Date();
  return (
    ad.getFullYear() === bd.getFullYear() &&
    ad.getMonth() === bd.getMonth() &&
    ad.getDate() === bd.getDate()
  );
};

export const PlayerDashboard: React.FC = () => {
  const { role, userId, user, isAuthenticated } = useAuth();

  const [stats, setStats] = useState<PlayerStatsResponse | null>(null);
  const [history, setHistory] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data fetch effect — runs unconditionally
  useEffect(() => {
    if (role !== 'player' || !userId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, historyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/players/stats/${userId}`),
          fetch(`${API_BASE_URL}/players/${userId}/history`)
        ]);

        if (!statsRes.ok) {
          throw new Error('Failed to fetch player stats');
        }
        if (!historyRes.ok) {
          throw new Error('Failed to fetch player history');
        }

        const statsJson: PlayerStatsResponse = await statsRes.json();
        const historyJson: MatchEntry[] = await historyRes.json();

        if (!mounted) return;
        setStats(statsJson);
        // sort descending by match date / created_at
        const sorted = (historyJson || []).slice().sort((a, b) => {
          const aDate = new Date(a.matches?.match_date || a.created_at || 0).getTime();
          const bDate = new Date(b.matches?.match_date || b.created_at || 0).getTime();
          return bDate - aDate;
        });
        setHistory(sorted);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [userId, role]);

  // Memos run unconditionally
  const todayRuns = useMemo(() => {
    const today = new Date();
    return history.reduce((sum, entry) => {
      const matchDate = entry.matches?.match_date || entry.created_at;
      if (isSameLocalDay(matchDate, today)) {
        return sum + (entry.runs || 0);
      }
      return sum;
    }, 0);
  }, [history]);

  const runsPerMatch = useMemo(() => {
    if (!stats || !stats.totalMatches) return 0;
    return +(stats.totalRuns / Math.max(1, stats.totalMatches)).toFixed(2);
  }, [stats]);

  // Redirect if not an authenticated player. This is a fallback; PlayerProtectedRoute is the primary guard.
  if (!isAuthenticated || role !== 'player') {
    return <Navigate to="/" replace />;
  }

  // Loading / error UI — still render Navigation (player role)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading your dashboard...</div>
      </div>
    );
  }

  // Note: The error state UI could also be improved to be more consistent.
  if (error) {
    return (
      <div className="min-h-screen">
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-fit">
      <main className= "pb-20 pt-7">
        <div className="space-y-6">
            <div className="mb-6">
              <h1 className="text-4xl font-bold">Welcome back, {user}</h1>
              <p className="text-sm text-gray-600">Here's a quick summary of your recent performance.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="col-span-1 sm:col-span-1 lg:col-span-2 p-4 bg-white rounded shadow">
                <p className="text-sm text-gray-500">Today's Runs</p>
                <p className="text-3xl font-bold">{todayRuns}</p>
              </div>

              <div className="p-4 bg-white rounded shadow">
                <p className="text-sm text-gray-500">Total Runs</p>
                <p className="text-2xl font-bold">{stats?.totalRuns ?? '-'}</p>
              </div>

              <div className="p-4 bg-white rounded shadow">
                <p className="text-sm text-gray-500">Total Wickets</p>
                <p className="text-2xl font-bold">{stats?.totalWickets ?? '-'}</p>
              </div>

              <div className="p-4 bg-white rounded shadow">
                <p className="text-sm text-gray-500">Matches Played</p>
                <p className="text-2xl font-bold">{stats?.totalMatches ?? '-'}</p>
              </div>

              <div className="p-4 bg-white rounded shadow">
                <p className="text-sm text-gray-500">Man of the Match</p>
                <p className="text-2xl font-bold">{stats?.manOfMatchCount ?? 0}</p>
              </div>

              <div className="p-4 bg-white rounded shadow">
                <p className="text-sm text-gray-500">Runs / Match</p>
                <p className="text-2xl font-bold">{runsPerMatch}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded shadow p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Matches</h2>
                  <span className="text-sm text-gray-500">Showing latest {Math.min(10, history.length)}</span>
                </div>

                {history.length === 0 ? (
                  <div className="text-gray-500">No match history available yet.</div>
                ) : (
                  <div className="space-y-3">
                    {history.slice(0, 10).map((h) => {
                      const match = h.matches;
                      const result = match?.winner ? (match.winner === h.team ? 'Won' : 'Lost') : 'N/A';
                      const resultColor = result === 'Won' ? 'bg-green-100 text-green-800' : result === 'Lost' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
                      return (
                        <div key={h.id} className="p-3 border rounded flex items-center justify-between">
                          <div>
                            <div className="font-semibold">
                              {match?.team_a_name} vs {match?.team_b_name}
                            </div>
                            <div className="text-sm text-gray-500">{formatDate(match?.match_date || h.created_at)}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="mr-3">Team: <span className="font-medium">{h.team ?? '-'}</span></span>
                              <span>Runs: <span className="font-medium">{h.runs}</span></span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={`inline-flex items-center px-2 py-1 rounded ${resultColor} text-sm font-medium`}>
                              {result}
                            </div>
                            <div className="text-sm text-gray-500 mt-2">
                              {h.fours ?? 0}×4 · {h.sixes ?? 0}×6 · {h.wickets ?? 0} wkts
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded shadow p-4">
                <h3 className="text-lg font-semibold mb-3">Quick Summary</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    <span className="text-gray-500">Total Wins: </span>
                    <span className="font-medium">{stats?.totalWins ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Man of the Match: </span>
                    <span className="font-medium">{stats?.manOfMatchCount ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Matches: </span>
                    <span className="font-medium">{stats?.totalMatches ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Average Runs / Match: </span>
                    <span className="font-medium">{runsPerMatch}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => window.print()}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded"
                  >
                    Print Summary
                  </button>
                </div>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default PlayerDashboard;