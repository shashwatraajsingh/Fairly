import { useState, useEffect } from 'react';
import { Group } from '../types/group';
import { groupsApi } from '../services/api';

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await groupsApi.getAll();
      setGroups(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch groups');
      console.error('Error fetching groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (groupData: any) => {
    try {
      const response = await groupsApi.create(groupData);
      setGroups(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to create group');
      throw err;
    }
  };

  const updateGroup = async (id: string, groupData: any) => {
    try {
      const response = await groupsApi.update(id, groupData);
      setGroups(prev => prev.map(group => 
        group.id === id ? response.data : group
      ));
      return response.data;
    } catch (err) {
      setError('Failed to update group');
      throw err;
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      await groupsApi.delete(id);
      setGroups(prev => prev.filter(group => group.id !== id));
    } catch (err) {
      setError('Failed to delete group');
      throw err;
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    isLoading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup
  };
};
