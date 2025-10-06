import { useState } from "react";
import { api } from "~/utils/api";
import toast from "react-hot-toast";

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  members: Member[];
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  groupId,
  members,
}: AddExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const utils = api.useUtils();
  const createExpense = api.expense.create.useMutation({
    onSuccess: () => {
      toast.success("Expense added successfully!");
      void utils.group.getById.invalidate({ id: groupId });
      void utils.balance.getByGroup.invalidate({ groupId });
      void utils.balance.getSimplifiedDebts.invalidate({ groupId });
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add expense");
    },
  });

  const handleClose = () => {
    setDescription("");
    setAmount("");
    setPaidById("");
    setSplitType("equal");
    setCategory("");
    setNotes("");
    setSelectedMembers([]);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !amount || !paidById) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const membersToSplit = selectedMembers.length > 0 ? selectedMembers : members.map(m => m.userId);
    
    if (membersToSplit.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    // Calculate equal splits
    const splitAmount = amountNum / membersToSplit.length;
    const splits = membersToSplit.map((userId) => ({
      userId,
      amount: splitAmount,
    }));

    createExpense.mutate({
      groupId,
      description,
      amount: amountNum,
      paidById,
      splitType,
      splits,
      category: category || undefined,
      notes: notes || undefined,
    });
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
      <div className="card max-w-lg w-full p-8 my-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-beige to-taupe-light rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">💵</span>
          </div>
          <h2 className="text-2xl font-bold text-charcoal">Add Expense</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-charcoal mb-2">
              Description *
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="e.g., Dinner at restaurant, Movie tickets"
              maxLength={200}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-charcoal mb-2">
                Amount ($) *
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-charcoal mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                <option value="">Select</option>
                <option value="Food">🍔 Food</option>
                <option value="Transport">🚗 Transport</option>
                <option value="Accommodation">🏠 Accommodation</option>
                <option value="Entertainment">🎬 Entertainment</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Other">📌 Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="paidBy" className="block text-sm font-semibold text-charcoal mb-2">
              Paid by *
            </label>
            <select
              id="paidBy"
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
              className="input"
              required
            >
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.name ?? member.user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">
              Split between
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border-2 border-charcoal/10 rounded-xl p-4 bg-cream/50">
              <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white/50 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={selectedMembers.length === 0}
                  onChange={() => setSelectedMembers([])}
                  className="w-4 h-4 rounded border-2 border-taupe text-taupe focus:ring-taupe focus:ring-offset-0"
                />
                <span className="text-sm font-medium text-charcoal">All members (equal split)</span>
              </label>
              {members.map((member) => (
                <label key={member.userId} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white/50 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.userId) || selectedMembers.length === 0}
                    onChange={() => toggleMember(member.userId)}
                    className="w-4 h-4 rounded border-2 border-taupe text-taupe focus:ring-taupe focus:ring-offset-0"
                    disabled={selectedMembers.length === 0}
                  />
                  <span className="text-sm text-charcoal">{member.user.name ?? member.user.email}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-charcoal mb-2">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input resize-none"
              placeholder="Any additional details..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1 py-3"
              disabled={createExpense.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 py-3"
              disabled={createExpense.isLoading}
            >
              {createExpense.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </span>
              ) : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
