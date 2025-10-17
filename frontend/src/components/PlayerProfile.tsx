import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Navigation } from './Navigation';
import { User, Calendar, MapPin, Award, Shield, BarChart2, Hash } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

const InfoCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
  <div>
    <div className="text-sm text-gray-500 flex items-center gap-2"><Icon size={14} /> {title}</div>
    <div className="font-semibold text-gray-800">{value}</div>
  </div>
);

const DebutCard: React.FC<{ format: string; date: string | null; venue: string }> = ({ format, date, venue }) => (
  <div className="bg-gray-50 p-4 rounded-lg border">
    <h4 className="font-bold text-gray-800 uppercase">{format}</h4>
    <p className="text-sm text-gray-600"><strong>Debut:</strong> vs Opponent, {formatDate(date)}</p>
    <p className="text-sm text-gray-600"><strong>Last Played:</strong> vs Opponent, {formatDate(date)}</p>
    <p className="text-xs text-gray-500 mt-1">{venue}</p>
  </div>
);


export const PlayerProfile: React.FC = () => {
  const { role, userId, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<PlayerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'player' || !userId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/players/${userId}/profile`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch profile');
        }
        const data: PlayerProfileData = await res.json();
        if (mounted) {
          setProfile(data);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, [userId, role]);

  if (!isAuthenticated || role !== 'player') {
    return <Navigate to="/player-login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeView="profile" role="player" />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeView="profile" role="player" />
        <div className="p-8 text-center text-red-600">
          <h2 className="text-xl font-bold">Error Loading Profile</h2>
          <p>{error || 'Could not find profile data.'}</p>
        </div>
      </div>
    );
  }

  const { player, career } = profile;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeView="profile" role="player" />
      <main className="pb-20">
        <div className="page-container pt-7">
          <div className="content-container max-w-4xl mx-auto">
            {/* Player Header */}
            <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={64} className="text-gray-400" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-4xl font-bold text-gray-800">{player.name}</h1>
                <p className="text-lg text-gray-600">India</p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="card mt-6 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">PERSONAL INFORMATION</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                <InfoCard title="Born" value={`${formatDate('1994-12-14')} (30 years)`} icon={Calendar} />
                <InfoCard title="Birth Place" value="Kanpur, Uttar Pradesh" icon={MapPin} />
                <InfoCard title="Nickname" value={player.name.split(' ')[0]} icon={Hash} />
                <InfoCard title="Role" value="Bowler" icon={Award} />
                <InfoCard title="Batting Style" value="Left Handed Bat" icon={BarChart2} />
                <InfoCard title="Bowling Style" value="Left-arm wrist-spin" icon={BarChart2} />
              </div>
            </div>

            {/* Career Information */}
            <div className="card mt-6 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">CAREER INFORMATION</h3>
              <div>
                <InfoCard title="Teams" value={career.teams.length > 0 ? career.teams.join(', ') : 'No teams yet'} icon={Shield} />
              </div>
            </div>

            {/* Debut Information */}
            <div className="card mt-6 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">CAREER DEBUT</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DebutCard format="T20" date={career.firstMatchDate} venue="Sabina Park" />
                <DebutCard format="Test" date={career.firstMatchDate} venue="Himachal Pradesh Cricket Association Stadium" />
                <DebutCard format="ODI" date={career.firstMatchDate} venue="Queen's Park Oval" />
                <DebutCard format="IPL" date={career.firstMatchDate} venue="Eden Gardens" />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default PlayerProfile;