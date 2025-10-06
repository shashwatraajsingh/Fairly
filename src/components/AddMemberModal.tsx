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
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card max-w-md w-full p-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-teal to-teal-dark rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">➕</span>
          </div>
          <h2 className="text-2xl font-bold text-charcoal">Add Member</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-charcoal mb-2">
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
            <p className="text-xs text-charcoal/60 mt-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              The user must already have an account
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-3"
              disabled={addMember.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 py-3"
              disabled={addMember.isLoading}
            >
              {addMember.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </span>
              ) : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
