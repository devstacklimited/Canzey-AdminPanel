import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-100',
      text: 'text-primary-600',
      hover: 'hover:bg-primary-50'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      hover: 'hover:bg-green-50'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      hover: 'hover:bg-purple-50'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      hover: 'hover:bg-red-50'
    }
  };

  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg ${colors.hover}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`${colors.bg} p-3 rounded-lg transition-all duration-300`}>
          <Icon className={colors.text} size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
