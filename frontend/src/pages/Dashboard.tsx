import React, { useState, useEffect } from 'react';
import { Plus, Users, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BalanceSummary from '../components/dashboard/BalanceSummary';
import GroupCard from '../components/groups/GroupCard';
import CreateGroup from '../components/groups/CreateGroup';
import type { Group } from '../types/group';
import type { Balance } from '../types/expense';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API calls
        setTimeout(() => {
          setGroups([
            {
              id: '1',
              name: 'Weekend Trip',
              description: 'Delhi trip expenses',
              members: [
                { userId: '1', name: 'Shashwat Singh', email: 'Shashwat@example.com', joinedAt: new Date(), role: 'admin' },
                { userId: '2', name: 'Abhyuday Pratap Singh', email: 'abhyuday@example.com', joinedAt: new Date(), role: 'member' }
              ],
              createdBy: '1',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]);

          setBalances([
            {
              userId: '2',
              userName: 'Shashwat Singh',
              youOwe: 500,
              owesYou: 300,
              netBalance: -200
            }
          ]);

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCreateGroup = async (groupData: any) => {
    try {
      // API call to create group
      console.log('Creating group:', groupData);
      // Refresh groups after creation
    } catch (error) {
      console.error('Failed to create group:', error);
      throw error;
    }
  };

  const totalOwed = balances.reduce((sum, balance) => sum + Math.max(0, -balance.netBalance), 0);
  const totalToReceive = balances.reduce((sum, balance) => sum + Math.max(0, balance.netBalance), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your shared expenses and settle up with friends
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Groups</p>
              <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Receipt className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">₹{(totalOwed + totalToReceive).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <button
            onClick={() => setShowCreateGroup(true)}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Group
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Balance Summary */}
        <div>
          <BalanceSummary 
            balances={balances}
            totalOwed={totalOwed}
            totalToReceive={totalToReceive}
          />
        </div>

        {/* Recent Groups */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Groups</h2>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No groups yet</p>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Create your first group
                </button>
              </div>
            ) : (
              groups.slice(0, 3).map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  balance={balances.find(b => b.userId === group.id)?.netBalance || 0}
                  onClick={() => console.log('Navigate to group:', group.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroup
          onClose={() => setShowCreateGroup(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}
    </div>
  );
};

export default Dashboard;
