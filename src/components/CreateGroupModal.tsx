import { useState } from "react";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const utils = api.useUtils();
  const createGroup = api.group.create.useMutation({
    onSuccess: (data) => {
      toast.success("Group created successfully!");
      void utils.group.getAll.invalidate();
      onClose();
      setName("");
      setDescription("");
      void router.push(`/group/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create group");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    createGroup.mutate({ name, description });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-charcoal">Create a group</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={createGroup.isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-1.5">
              Group name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              placeholder="e.g., Weekend Trip"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-charcoal mb-1.5">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
              placeholder="What's this group for?"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-charcoal rounded-lg hover:bg-gray-50 font-medium transition-colors"
              disabled={createGroup.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={createGroup.isLoading}
            >
              {createGroup.isLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
