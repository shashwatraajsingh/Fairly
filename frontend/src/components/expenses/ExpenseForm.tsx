import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, DollarSign, Users } from 'lucide-react';
import type { GroupMember } from '../../types/group';

interface ExpenseFormData {
  description: string;
  amount: number;
  category: string;
}

interface ExpenseFormProps {
  groupId: string;
  members: GroupMember[];
  onClose: () => void;
  onAddExpense: (expenseData: any) => Promise<void>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  groupId, 
  members, 
  onClose, 
  onAddExpense 
}) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    members.map(m => m.userId)
  );
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ExpenseFormData>();
  const watchAmount = watch('amount');

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const updateCustomSplit = (userId: string, amount: number) => {
    setCustomSplits(prev => ({
      ...prev,
      [userId]: amount
    }));
  };

  const getTotalCustomSplit = () => {
    return Object.values(customSplits).reduce((sum, amount) => sum + (amount || 0), 0);
  };

  const onSubmit = async (data: ExpenseFormData) => {
    setIsLoading(true);
    try {
      let splitBetween;
      
      if (splitType === 'equal') {
        const splitAmount = data.amount / selectedMembers.length;
        splitBetween = selectedMembers.map(userId => ({
          userId,
          amount: splitAmount,
          isPaid: false
        }));
      } else {
        splitBetween = selectedMembers.map(userId => ({
          userId,
          amount: customSplits[userId] || 0,
          isPaid: false
        }));
      }

      await onAddExpense({
        ...data,
        groupId,
        splitBetween,
        date: new Date(),
        isSettled: false
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to add expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Expense</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              {...register('description', { required: 'Description is required' })}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="What was this expense for?"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount (₹)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                type="number"
                step="0.01"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              {...register('category')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select category</option>
              <option value="food">Food & Dining</option>
              <option value="transport">Transportation</option>
              <option value="entertainment">Entertainment</option>
              <option value="shopping">Shopping</option>
              <option value="utilities">Utilities</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split between
            </label>
            
            <div className="flex space-x-4 mb-3">
              <button
                type="button"
                onClick={() => setSplitType('equal')}
                className={`px-3 py-1 rounded-md text-sm ${
                  splitType === 'equal'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Split Equally
              </button>
              <button
                type="button"
                onClick={() => setSplitType('custom')}
                className={`px-3 py-1 rounded-md text-sm ${
                  splitType === 'custom'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Custom Split
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {members.map(member => (
                <div key={member.userId} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.userId)}
                      onChange={() => toggleMember(member.userId)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{member.name}</span>
                  </div>
                  
                  {splitType === 'equal' && selectedMembers.includes(member.userId) && (
                    <span className="text-sm text-gray-500">
                      ₹{watchAmount ? (watchAmount / selectedMembers.length).toFixed(2) : '0.00'}
                    </span>
                  )}
                  
                  {splitType === 'custom' && selectedMembers.includes(member.userId) && (
                    <input
                      type="number"
                      step="0.01"
                      value={customSplits[member.userId] || ''}
                      onChange={(e) => updateCustomSplit(member.userId, parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  )}
                </div>
              ))}
            </div>

            {splitType === 'custom' && watchAmount && (
              <div className="mt-2 text-sm">
                <span className={`${
                  getTotalCustomSplit() === watchAmount ? 'text-green-600' : 'text-red-600'
                }`}>
                  Total: ₹{getTotalCustomSplit().toFixed(2)} / ₹{watchAmount}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedMembers.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
