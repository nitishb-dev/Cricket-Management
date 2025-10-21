import React, { useEffect, useState, useCallback } from 'react';
import { History, Trophy } from 'lucide-react';
import dayjs from 'dayjs';
import { usePlayerApi } from '../context/usePlayerApi';


type MatchEntry = {
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
    team_a_wickets?: number;
    team_b_wickets?: number;
  };
};

const PlayerHistory: React.FC = () => {
  const { apiFetch, userId } = usePlayerApi();
  const [history, setHistory] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<MatchEntry[]>(`/players/${userId}/history`);
      setHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [apiFetch, userId]);

  useEffect(() => {
    if (userId) fetchHistory();
    else setLoading(false);
  }, [fetchHistory, userId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-primary rounded-2xl">
            <History className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Match History</h1>
            <p className="text-gray-600">Review your past matches and performance</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-red-600">
          <h2 className="text-xl font-bold">Error Loading History</h2>
          <p>{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center">
          <History size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-600 mb-2">No Match History</h2>
          <p className="text-gray-500">Your played matches will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(h => {
            const match = h.matches;
            if (!match) return null;
            const result = match.winner ? (match.winner === h.team ? 'Won' : 'Lost') : 'N/A';
            const resultColor = result === 'Won' ? 'border-green-500 bg-green-50' : result === 'Lost' ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50';

            return (
              <div key={h.id} className={`card p-5 border-l-4 ${resultColor}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Match Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Trophy size={14} />
                      <span>{match.team_a_name} vs {match.team_b_name}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {dayjs(match.match_date).format('MMM DD, YYYY')}
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex gap-4 text-center">
                    <div className="font-bold text-lg">{match.team_a_score}/{match.team_a_wickets} <span className="text-sm font-normal text-gray-600">({match.team_a_name})</span></div>
                    <div className="font-bold text-lg">{match.team_b_score}/{match.team_b_wickets} <span className="text-sm font-normal text-gray-600">({match.team_b_name})</span></div>
                  </div>

                  {/* Player Performance */}
                  <div className="flex gap-4 text-center bg-white p-2 rounded-lg border">
                    <div><div className="font-bold">{h.runs}</div><div className="text-xs text-gray-500">Runs</div></div>
                    <div><div className="font-bold">{h.wickets}</div><div className="text-xs text-gray-500">Wickets</div></div>
                  </div>

                  {/* Result */}
                  <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${result === 'Won' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{result}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlayerHistory;