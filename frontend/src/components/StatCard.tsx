import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'green' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, variant = 'green' }) => {
  const colorClasses = variant === 'blue' 
    ? 'bg-blue-100 text-blue-600' 
    : 'bg-green-100 text-green-600';
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
      <div className={`p-3 ${colorClasses} rounded-lg`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};