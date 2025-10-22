import React from 'react';
import { User } from 'lucide-react';

interface PlayerAvatarProps {
  profilePictureUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20 sm:w-24 sm:h-24',
  '2xl': 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32'
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ 
  profilePictureUrl, 
  name, 
  size = 'md',
  className = '' 
}) => {
  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];

  if (profilePictureUrl) {
    return (
      <div className={`${sizeClass} ${className} rounded-full overflow-hidden bg-gray-200 flex-shrink-0`}>
        <img
          src={profilePictureUrl}
          alt={`${name}'s profile`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default avatar if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                  <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              `;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} ${className} bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0`}>
      <User size={iconSize} className="text-gray-400" />
    </div>
  );
};