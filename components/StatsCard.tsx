
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, trend, icon }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-hover hover:border-blue-100 duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-blue-50 text-blue-900 rounded-xl">
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-100 text-green-700' : 
          trend === 'down' ? 'bg-red-100 text-red-700' : 
          'bg-gray-100 text-gray-700'
        }`}>
          {change}
        </span>
      </div>
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold mt-1 text-blue-900">{value}</p>
    </div>
  );
};

export default StatsCard;
