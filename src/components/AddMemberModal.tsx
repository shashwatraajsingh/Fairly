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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 animate-slide-up">
        <h2 className="text-2xl font-semibold mb-4">Add Member</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="member@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The user must already have an account
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={addMember.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={addMember.isLoading}
            >
              {addMember.isLoading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
