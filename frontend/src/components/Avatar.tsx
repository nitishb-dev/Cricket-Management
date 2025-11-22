import React from 'react';
import { cn } from '../utils/cn';
import { getInitials } from '../utils/formatters';

interface AvatarProps {
    src?: string | null;
    alt: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', className }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-base',
        xl: 'w-24 h-24 text-xl',
    };

    return (
        <div
            className={cn(
                'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-600',
                sizeClasses[size],
                className
            )}
        >
            {src ? (
                <img src={src} alt={alt} className="w-full h-full object-cover" />
            ) : (
                <span className="font-medium">{getInitials(alt)}</span>
            )}
        </div>
    );
};
