import { useState } from "react";
import { api } from "~/utils/api";
import toast from "react-hot-toast";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export default function AddMemberModal({ isOpen, onClose, groupId }: AddMemberModalProps) {
  const [email, setEmail] = useState("");

  const utils = api.useUtils();
  const addMember = api.group.addMember.useMutation({
    onSuccess: () => {
      toast.success("Member added successfully!");
      void utils.group.getById.invalidate({ id: groupId });
      setEmail("");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add member");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email");
      return;
    }
    addMember.mutate({ groupId, email });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-charcoal">Add member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={addMember.isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              placeholder="member@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5">
              The user must already have an account
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-charcoal rounded-lg hover:bg-gray-50 font-medium transition-colors"
              disabled={addMember.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={addMember.isLoading}
            >
              {addMember.isLoading ? "Adding..." : "Add member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
