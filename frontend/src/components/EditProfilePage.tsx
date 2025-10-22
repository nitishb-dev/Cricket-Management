import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EditProfile } from './EditProfile';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/player/profile');
  };

  const handleSave = () => {
    // Optionally navigate back to profile after successful save
    // navigate('/player/profile');
  };

  return (
    <EditProfile 
      onBack={handleBack} 
      onSave={handleSave}
    />
  );
};