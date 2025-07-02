import React, { useState } from 'react';
import { Calendar, User, CheckCircle, Clock, MoreVertical } from 'lucide-react';
import type { Expense } from '../../types/expense';
import  type { GroupMember } from '../../types/group';

interface ExpenseCardProps {
  expense: Expense;
  groupMembers: GroupMember[];
  onSettle: (expenseId: string, userId: string) => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, groupMembers, onSettle }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getPaidByName = () => {
    const member = groupMembers.find(m => m.userId === expense.paidBy);
    return member?.name || 'Unknown';
  };

  const getMemberName = (userId: string) => {
    const member = groupMembers.find(m => m.userId === userId);
    return member?.name || 'Unknown';
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      food: 'bg-orange-100 text-orange-800',
      transport: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      accommodation: 'bg-green-100 text-green-800',
      utilities: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const totalPaid = expense.splitBetween.filter(split => split.isPaid).length;
  const totalSplits = expense.splitBetween.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-medium text-gray-900">{expense.description}</h4>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>Paid by {getPaidByName()}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(expense.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                ₹{expense.amount.toFixed(2)}
              </span>
              {expense.category && (
                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(expense.category)}`}>
                  {expense.category}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {expense.isSettled ? (
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Settled
                </span>
              ) : (
                <span className="flex items-center text-orange-600 text-sm font-medium">
                  <Clock className="w-4 h-4 mr-1" />
                  {totalPaid}/{totalSplits} paid
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Split Details */}
      <div className="border-t border-gray-100 pt-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-2"
        >
          {showDetails ? 'Hide' : 'Show'} split details
        </button>

        {showDetails && (
          <div className="space-y-2">
            {expense.splitBetween.map((split) => (
              <div key={split.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-indigo-600 font-medium text-xs">
                      {getMemberName(split.userId).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {getMemberName(split.userId)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    ₹{split.amount.toFixed(2)}
                  </span>
                  
                  {split.isPaid ? (
                    <span className="flex items-center text-green-600 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Paid
                    </span>
                  ) : split.userId !== expense.paidBy ? (
                    <button
                      onClick={() => onSettle(expense.id, split.userId)}
                      className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Mark Paid
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">Payer</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseCard;
