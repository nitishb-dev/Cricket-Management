import React, { useEffect, useState, useCallback } from 'react';
import { User, Calendar, Shield, Hash } from 'lucide-react';
import { usePlayerApi } from '../context/usePlayerApi';


interface PlayerProfileData {
  player: {
    id: string;
    name: string;
    username: string;
    created_at: string;
  };
  career: {
    teams: string[];
    firstMatchDate: string | null;
  };
}

const formatDate = (d?: string | null) => {
  if (!d) return 'N/A';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const InfoCard: React.FC<{ title: string; value: string | React.ReactNode; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
  <div className="bg-gray-50 p-4 rounded-xl border">
    <div className="text-sm text-gray-500 flex items-center gap-2"><Icon size={14} /> {title}</div>
    <div className="font-semibold text-gray-800 mt-1">{value}</div>
  </div>
);

export const PlayerProfile: React.FC = () => {
  const { apiFetch, userId } = usePlayerApi();
  const [profile, setProfile] = useState<PlayerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<PlayerProfileData>(`/players/${userId}/profile`);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiFetch, userId]);

  useEffect(() => {
    if (userId) fetchProfile();
    else setLoading(false);
  }, [fetchProfile, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen">
        <div className="p-8 text-center text-red-600 mt-8">
          <h2 className="text-xl font-bold">Error Loading Profile</h2>
          <p>{error || 'Could not find profile data.'}</p>
        </div>
      </div>
    );
  }

  const { player, career } = profile;

  return (
    <div className="space-y-8">
      {/* Player Header */}
      <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
          <User size={64} className="text-gray-400" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold text-gray-800">{player.name}</h1>
          <p className="text-lg text-gray-600">Player Profile</p>
        </div>
      </div>

      {/* Account Information */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard title="Username" value={player.username} icon={Hash} />
          <InfoCard title="Player Since" value={formatDate(player.created_at)} icon={Calendar} />
          <InfoCard title="Teams Played For" value={career.teams.length > 0 ? career.teams.join(', ') : 'No teams yet'} icon={Shield} />
          <InfoCard title="First Match" value={formatDate(career.firstMatchDate)} icon={Calendar} />
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;