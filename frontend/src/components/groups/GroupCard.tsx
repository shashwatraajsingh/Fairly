import React from 'react';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import type { Group } from '../../types/group';

interface GroupCardProps {
  group: Group;
  balance?: number;
  onClick: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, balance = 0, onClick }) => {
  const formatBalance = (amount: number) => {
    if (amount === 0) return 'Settled up';
    if (amount > 0) return `You are owed ₹${Math.abs(amount).toFixed(2)}`;
    return `You owe ₹${Math.abs(amount).toFixed(2)}`;
  };

  const getBalanceColor = (amount: number) => {
    if (amount === 0) return 'text-green-600';
    if (amount > 0) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {group.name}
          </h3>
          {group.description && (
            <p className="text-sm text-gray-600 mb-2">{group.description}</p>
          )}
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Users className="w-4 h-4 mr-1" />
          <span>{group.members.length} members</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{new Date(group.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className={`text-sm font-medium ${getBalanceColor(balance)}`}>
          {formatBalance(balance)}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
