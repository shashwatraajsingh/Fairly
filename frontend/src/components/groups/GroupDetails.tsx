import React, { useState, useEffect } from 'react';
import { X, Plus, Users, Receipt, Settings, CheckCircle } from 'lucide-react';
import type { Group } from '../../types/group';

import type { Expense } from '../../types/expense';
import ExpenseForm from '../expenses/ExpenseForm';
import ExpenseCard from '../expenses/ExpenseCard';

interface GroupDetailsProps {
  group: Group;
  onClose: () => void;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({ group, onClose }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'settings'>('expenses');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGroupExpenses();
  }, [group.id]);

  const fetchGroupExpenses = async () => {
    try {
      // Mock data - replace with actual API call
      setTimeout(() => {
        const mockExpenses: Expense[] = [
          {
            id: '1',
            groupId: group.id,
            description: 'Hotel booking',
            amount: 6000,
            paidBy: '1',
            splitBetween: [
              { userId: '1', amount: 2000, isPaid: true },
              { userId: '2', amount: 2000, isPaid: false },
              { userId: '3', amount: 2000, isPaid: false }
            ],
            category: 'accommodation',
            date: new Date('2024-12-15'),
            isSettled: false,
            createdAt: new Date('2024-12-15'),
            updatedAt: new Date('2024-12-15')
          },
          {
            id: '2',
            groupId: group.id,
            description: 'Dinner at beach restaurant',
            amount: 1500,
            paidBy: '2',
            splitBetween: [
              { userId: '1', amount: 500, isPaid: true },
              { userId: '2', amount: 500, isPaid: true },
              { userId: '3', amount: 500, isPaid: false }
            ],
            category: 'food',
            date: new Date('2024-12-16'),
            isSettled: false,
            createdAt: new Date('2024-12-16'),
            updatedAt: new Date('2024-12-16')
          }
        ];
        setExpenses(mockExpenses);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setIsLoading(false);
    }
  };

  const handleAddExpense = async (expenseData: any) => {
    try {
      // API call to add expense
      console.log('Adding expense:', expenseData);
      await fetchGroupExpenses(); // Refresh expenses
    } catch (error) {
      console.error('Failed to add expense:', error);
      throw error;
    }
  };

  const handleSettleExpense = async (expenseId: string, userId: string) => {
    try {
      // API call to settle expense
      console.log('Settling expense:', expenseId, 'for user:', userId);
      await fetchGroupExpenses(); // Refresh expenses
    } catch (error) {
      console.error('Failed to settle expense:', error);
    }
  };

  const calculateMemberBalances = () => {
    const balances: { [userId: string]: { owes: number; owed: number; name: string } } = {};
    
    // Initialize balances for all members
    group.members.forEach(member => {
      balances[member.userId] = { owes: 0, owed: 0, name: member.name };
    });

    // Calculate balances from expenses
    expenses.forEach(expense => {
      expense.splitBetween.forEach(split => {
        if (!split.isPaid && split.userId !== expense.paidBy) {
          balances[split.userId].owes += split.amount;
          balances[expense.paidBy].owed += split.amount;
        }
      });
    });

    return balances;
  };

  const memberBalances = calculateMemberBalances();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white min-h-[90vh]">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
            {group.description && (
              <p className="text-gray-600 mt-1">{group.description}</p>
            )}
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              <span>{group.members.length} members</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'expenses'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Receipt className="w-4 h-4 inline mr-2" />
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('balances')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'balances'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Balances
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'expenses' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Group Expenses</h3>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h4>
                  <p className="text-gray-600 mb-4">Add your first expense to get started</p>
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      groupMembers={group.members}
                      onSettle={handleSettleExpense}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'balances' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Member Balances</h3>
              <div className="space-y-4">
                {Object.entries(memberBalances).map(([userId, balance]) => (
                  <div key={userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-indigo-600 font-medium text-sm">
                          {balance.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{balance.name}</span>
                    </div>
                    
                    <div className="text-right">
                      {balance.owes === 0 && balance.owed === 0 ? (
                        <span className="text-green-600 font-medium flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Settled
                        </span>
                      ) : (
                        <div className="space-y-1">
                          {balance.owes > 0 && (
                            <div className="text-red-600 text-sm">
                              Owes: ₹{balance.owes.toFixed(2)}
                            </div>
                          )}
                          {balance.owed > 0 && (
                            <div className="text-green-600 text-sm">
                              Owed: ₹{balance.owed.toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Group Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Members</h4>
                  <div className="space-y-2">
                    {group.members.map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-indigo-600 font-medium text-xs">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{member.name}</span>
                            <p className="text-sm text-gray-600">{member.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.role === 'admin' 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button className="text-red-600 hover:text-red-800 font-medium">
                    Leave Group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Expense Modal */}
        {showAddExpense && (
          <ExpenseForm
            groupId={group.id}
            members={group.members}
            onClose={() => setShowAddExpense(false)}
            onAddExpense={handleAddExpense}
          />
        )}
      </div>
    </div>
  );
};

export default GroupDetails;
