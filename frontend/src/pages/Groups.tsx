import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
// import GroupCard from '../components/groups/GroupCard';
import GroupCard from '../components/groups/GroupCard.tsx'
import CreateGroup from '../components/groups/CreateGroup';
import GroupDetails from '../components/groups/GroupDetails.tsx';
import type { Group } from '../types/group';
import type { Balance } from '../types/expense';

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [balances, setBalances] = useState<{ [groupId: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const filtered = groups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGroups(filtered);
  }, [groups, searchTerm]);

  const fetchGroups = async () => {
    try {
      // Mock data - replace with actual API call
      setTimeout(() => {
        const mockGroups: Group[] = [
          {
            id: '1',
            name: 'Weekend Trip to Delhi',
            description: 'CP vacation expenses',
            members: [
              { userId: '1', name: 'You', email: 'you@example.com', joinedAt: new Date(), role: 'admin' },
              { userId: '2', name: 'Anubhav Singh', email: 'anubhav@example.com', joinedAt: new Date(), role: 'member' },
              { userId: '3', name: 'Abhyuday Pratap Singh', email: 'abhyuday@example.com', joinedAt: new Date(), role: 'member' }
            ],
            createdBy: '1',
            createdAt: new Date('2024-12-01'),
            updatedAt: new Date()
          },
          {
            id: '2',
            name: 'Office Lunch',
            description: 'Daily lunch expenses with colleagues',
            members: [
              { userId: '1', name: 'You', email: 'you@example.com', joinedAt: new Date(), role: 'admin' },
              { userId: '4', name: 'Anubhav', email: 'anubhav@example.com', joinedAt: new Date(), role: 'member' },
              { userId: '5', name: 'Abhyuday', email: 'abhyuday@example.com', joinedAt: new Date(), role: 'member' }
            ],
            createdBy: '1',
            createdAt: new Date('2024-11-15'),
            updatedAt: new Date()
          },
          {
            id: '3',
            name: 'Apartment Utilities',
            description: 'Monthly utility bills',
            members: [
              { userId: '1', name: 'You', email: 'you@example.com', joinedAt: new Date(), role: 'member' },
              { userId: '6', name: 'abhishek', email: 'abhishek@example.com', joinedAt: new Date(), role: 'admin' },
              { userId: '7', name: 'anubhav', email: 'anubhav@example.com', joinedAt: new Date(), role: 'member' }
            ],
            createdBy: '6',
            createdAt: new Date('2024-10-01'),
            updatedAt: new Date()
          }
        ];

        const mockBalances = {
          '1': -250.50,
          '2': 120.00,
          '3': 0
        };

        setGroups(mockGroups);
        setBalances(mockBalances);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (groupData: any) => {
    try {
      // API call to create group
      console.log('Creating group:', groupData);
      await fetchGroups(); // Refresh groups
    } catch (error) {
      console.error('Failed to create group:', error);
      throw error;
    }
  };

  const handleGroupClick = (group: Group) => {
    setSelectedGroup(group);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Groups</h1>
          <p className="text-gray-600 mt-2">
            Manage your expense groups and track shared costs
          </p>
        </div>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Group
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5 mr-2" />
          Filter
        </button>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No groups found' : 'No groups yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Create your first group to start tracking shared expenses'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateGroup(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Group
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              balance={balances[group.id] || 0}
              onClick={() => handleGroupClick(group)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateGroup && (
        <CreateGroup
          onClose={() => setShowCreateGroup(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}

      {selectedGroup && (
        <GroupDetails
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
};

export default Groups;
