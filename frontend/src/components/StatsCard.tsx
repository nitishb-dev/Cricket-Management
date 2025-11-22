import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    onClick?: () => void;
    gradient?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    className,
    onClick,
    gradient = 'from-secondary-500 to-secondary-600',
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                'relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg group cursor-pointer',
                className
            )}
        >
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                    {trend && (
                        <div className={cn(
                            'flex items-center mt-2 text-sm font-medium',
                            trend.isPositive ? 'text-primary-600' : 'text-accent-600'
                        )}>
                            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                            <span className="ml-1 text-gray-400">vs last month</span>
                        </div>
                    )}
                </div>
                <div className={cn(
                    'p-4 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br',
                    gradient
                )}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
};
