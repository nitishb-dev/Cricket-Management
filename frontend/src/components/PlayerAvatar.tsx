import React from 'react';
import { Avatar } from './Avatar';

interface PlayerAvatarProps {
  profilePictureUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  profilePictureUrl,
  name,
  size = 'md',
  className = ''
}) => {
  // Map sizes to Avatar sizes
  const avatarSizeMap: Record<string, 'sm' | 'md' | 'lg' | 'xl'> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    '2xl': 'xl' // Fallback for 2xl
  };

  return (
    <Avatar
      src={profilePictureUrl || undefined}
      alt={name}
      size={avatarSizeMap[size] || 'md'}
      className={className}
    />
  );
};