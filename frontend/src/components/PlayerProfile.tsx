import React, { useEffect, useState, useCallback } from 'react';
import { User, Calendar, Shield, Hash, Globe, Cake } from 'lucide-react';
import { usePlayerApi } from '../context/usePlayerApi';


interface PlayerProfileData {
  id: string;
  name: string;
  username: string;
  clubId: string;
  clubName: string;
  joinedAt: string;
  dateOfBirth: string | null;
  country: string | null;
  totalMatches: number;
  firstMatchDate: string | null;
  teamsPlayedFor: string[];
}

const formatDate = (d?: string | null) => {
  if (!d) return 'N/A';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const calculateAge = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
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
      const data = await apiFetch<PlayerProfileData>(`/player/profile`);
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

  return (
    <div className="space-y-8">
      {/* Player Header */}
      <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
          <User size={64} className="text-gray-400" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold text-gray-800">{profile.name}</h1>
          <p className="text-lg text-gray-600">Player Profile</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard title="Username" value={profile.username} icon={User} />
          <InfoCard title="Club" value={profile.clubName} icon={Shield} />
          <InfoCard 
            title="Date of Birth" 
            value={
              profile.dateOfBirth 
                ? `${formatDate(profile.dateOfBirth)} (Age: ${calculateAge(profile.dateOfBirth)})` 
                : 'Not set'
            } 
            icon={Cake} 
          />
          <InfoCard title="Country" value={profile.country || 'Not set'} icon={Globe} />
        </div>
      </div>

      {/* Account Information */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard title="Player ID" value={profile.id.slice(0, 8) + '...'} icon={Hash} />
          <InfoCard title="Member Since" value={formatDate(profile.joinedAt)} icon={Calendar} />
        </div>
      </div>

      {/* Career Statistics */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Career Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard 
            title="Total Matches" 
            value={profile.totalMatches} 
            icon={Calendar} 
          />
          <InfoCard 
            title="First Match" 
            value={formatDate(profile.firstMatchDate)} 
            icon={Calendar} 
          />
          <InfoCard 
            title="Teams Played For" 
            value={profile.teamsPlayedFor.length > 0 ? profile.teamsPlayedFor.join(', ') : 'No teams yet'} 
            icon={Shield} 
          />
          <InfoCard 
            title="Career Status" 
            value={profile.totalMatches > 0 ? 'Active Player' : 'New Player'} 
            icon={User} 
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;