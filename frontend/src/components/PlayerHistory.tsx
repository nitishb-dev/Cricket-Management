import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Navigation } from './Navigation';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

const PlayerHistory: React.FC = () => {
  const { role, userId, user } = useAuth();
  const [history, setHistory] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'player' || !userId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/players/${userId}/history`);
        if (!res.ok) throw new Error('Failed to fetch history');
        const json: MatchEntry[] = await res.json();
        if (!mounted) return;
        setHistory(json || []);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => { mounted = false; };
  }, [role, userId]);

  if (role !== 'player' || !userId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeView="history" role="player" />
      <main className="pb-0">
        <div className="page-container pt-7">
          <div className="content-container">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">Match History — {user}</h1>
              <p className="text-sm text-gray-600">Your last matches and performance</p>
            </div>

            {loading ? (
              <div className="p-6">Loading...</div>
            ) : error ? (
              <div className="p-6 text-red-600">Error: {error}</div>
            ) : history.length === 0 ? (
              <div className="p-6 text-gray-600">No match history available yet.</div>
            ) : (
              <div className="space-y-3">
                {history.map(h => {
                  const match = h.matches;
                  const result = match?.winner ? (match.winner === h.team ? 'Won' : 'Lost') : 'N/A';
                  const resultColor = result === 'Won' ? 'bg-green-100 text-green-800' : result === 'Lost' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
                  return (
                    <div key={h.id} className="p-3 border rounded flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{match?.team_a_name} vs {match?.team_b_name}</div>
                        <div className="text-sm text-gray-500">{formatDate(match?.match_date || h.created_at)}</div>
                        <div className="text-sm text-gray-600 mt-1">Team: <span className="font-medium">{h.team ?? '-'}</span> · Runs: <span className="font-medium">{h.runs}</span></div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded ${resultColor} text-sm font-medium`}>{result}</div>
                        <div className="text-sm text-gray-500 mt-2">{h.fours ?? 0}×4 · {h.sixes ?? 0}×6 · {h.wickets ?? 0} wkts</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlayerHistory;