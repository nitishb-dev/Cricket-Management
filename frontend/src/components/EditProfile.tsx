import React, { useState, useEffect } from 'react';
import { User, Calendar, Globe, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
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

interface EditProfileProps {
  onBack: () => void;
  onSave: (updatedProfile: PlayerProfileData) => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ onBack, onSave }) => {
  const { apiFetch } = usePlayerApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [profile, setProfile] = useState<PlayerProfileData | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [country, setCountry] = useState('');

  // Load current profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiFetch<PlayerProfileData>('/player/profile');
        setProfile(data);
        setDateOfBirth(data.dateOfBirth || '');
        setCountry(data.country || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [apiFetch]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData = {
        dateOfBirth: dateOfBirth || null,
        country: country.trim() || null,
      };

      const updatedProfile = await apiFetch<PlayerProfileData>('/player/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      setProfile(updatedProfile);
      setSuccess(true);
      
      // Call parent callback with updated profile
      onSave(updatedProfile);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen">
        <div className="p-8 text-center text-red-600 mt-8">
          <h2 className="text-xl font-bold">Error Loading Profile</h2>
          <p>{error || 'Could not load profile data.'}</p>
          <button onClick={onBack} className="mt-4 btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
            <p className="text-gray-600">Update your personal information</p>
          </div>
        </div>

        {/* Player Info (Read-only) */}
        <div className="bg-gray-50 p-4 rounded-xl mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={32} className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{profile.name}</h2>
              <p className="text-gray-600">@{profile.username}</p>
              <p className="text-sm text-gray-500">{profile.clubName}</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 mb-6">
            <CheckCircle size={16} />
            <span className="text-sm">Profile updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="input-field"
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">
              Your date of birth helps calculate your age and career statistics
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline w-4 h-4 mr-1" />
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input-field"
              placeholder="Enter your country"
              maxLength={50}
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">
              The country you represent or are from
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onBack}
              disabled={saving}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};