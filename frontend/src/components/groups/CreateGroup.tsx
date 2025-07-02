import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, Mail } from 'lucide-react';
import type { Group } from '../../types/group';

interface CreateGroupFormData {
  name: string;
  description: string;
}

interface CreateGroupProps {
  onClose: () => void;
  onCreateGroup: (groupData: any) => Promise<void>;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onClose, onCreateGroup }) => {
  const [members, setMembers] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateGroupFormData>();

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const removeMemberField = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, value: string) => {
    const updatedMembers = [...members];
    updatedMembers[index] = value;
    setMembers(updatedMembers);
  };

  const onSubmit = async (data: CreateGroupFormData) => {
    setIsLoading(true);
    try {
      const validMembers = members.filter(email => email.trim() !== '');
      await onCreateGroup({
        ...data,
        memberEmails: validMembers
      });
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Group</h3>
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
              Group Name
            </label>
            <input
              {...register('name', { required: 'Group name is required' })}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter group name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="What's this group for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite Members
            </label>
            {members.map((member, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={member}
                  onChange={(e) => updateMember(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter email address"
                />
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMemberField(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addMemberField}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add another member
            </button>
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
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
