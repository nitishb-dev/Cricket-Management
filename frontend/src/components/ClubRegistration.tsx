import React, { useState } from 'react';
import { Trophy, User, Building, Key, Copy, Download, Check } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { useToast } from '../store/toastStore';

interface ClubRegistrationProps {
  onSuccess: (credentials: { username: string; password: string }) => void;
  onBackToLogin: () => void;
}

interface RegistrationResult {
  clubId: string;
  clubName: string;
  username: string;
  password: string;
  adminName: string;
}

export const ClubRegistration: React.FC<ClubRegistrationProps> = ({
  onSuccess,
  onBackToLogin
}) => {
  const { toast, error: toastError } = useToast();
  const [clubName, setClubName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/register-club`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubName: clubName.trim(),
          adminName: adminName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setRegistrationResult(data);
      setShowCredentialsModal(true);
      toast('Club registered successfully!', 'success');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!registrationResult) return;
    const text = `Club: ${registrationResult.clubName}\nUsername: ${registrationResult.username}\nPassword: ${registrationResult.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast('Credentials copied to clipboard', 'success');
  };

  const handleDownloadCredentials = () => {
    if (!registrationResult) return;
    const text = `Club Registration Details\n\nClub Name: ${registrationResult.clubName}\nAdmin Name: ${registrationResult.adminName}\nUsername: ${registrationResult.username}\nPassword: ${registrationResult.password}\n\nPlease keep these credentials safe.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${registrationResult.clubName.replace(/\s+/g, '_')}_credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Credentials downloaded', 'success');
  };

  const handleProceed = () => {
    if (registrationResult) {
      onSuccess({
        username: registrationResult.username,
        password: registrationResult.password,
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-50 rounded-2xl">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Register Your Club
          </h1>
          <p className="text-gray-600">
            Create your club account to start managing matches
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Club Name"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="Enter your cricket club name"
            leftIcon={<Building className="w-5 h-5" />}
            required
            disabled={loading}
          />

          <Input
            label="Admin Name"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="Enter admin full name"
            leftIcon={<User className="w-5 h-5" />}
            helperText="This will be used to generate your username"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
            disabled={!clubName.trim() || !adminName.trim()}
          >
            Register Club
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-sm font-medium text-primary hover:text-primary-700"
          >
            Already have an account? Login here
          </button>
        </div>
      </div>

      <Modal
        isOpen={showCredentialsModal}
        onClose={() => { }} // Prevent closing without action
        title="Registration Successful!"
      >
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800">
              Your club has been registered. Please save these credentials immediately.
              <strong> They will not be shown again.</strong>
            </p>
          </div>

          {registrationResult && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Username</span>
                <span className="font-mono font-medium text-gray-900">{registrationResult.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Password</span>
                <span className="font-mono font-medium text-gray-900">{registrationResult.password}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyCredentials}
              leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownloadCredentials}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>
          </div>

          <Button
            className="w-full"
            onClick={handleProceed}
            rightIcon={<Key className="w-4 h-4" />}
          >
            Proceed to Login
          </Button>
        </div>
      </Modal>
    </div>
  );
};