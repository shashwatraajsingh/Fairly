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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 my-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-charcoal">Add an expense</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={createExpense.isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-charcoal mb-1.5">
              Description *
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              placeholder="e.g., Dinner at restaurant"
              maxLength={200}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-charcoal mb-1.5">
                Amount ($) *
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-charcoal mb-1.5">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              >
                <option value="">Select category</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="paidBy" className="block text-sm font-medium text-charcoal mb-1.5">
              Paid by *
            </label>
            <select
              id="paidBy"
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
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
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Split between
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMembers.length === 0}
                  onChange={() => setSelectedMembers([])}
                  className="w-4 h-4 rounded border-gray-300 text-teal focus:ring-teal"
                />
                <span className="text-sm text-charcoal">All members (equal split)</span>
              </label>
              {members.map((member) => (
                <label key={member.userId} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.userId) || selectedMembers.length === 0}
                    onChange={() => toggleMember(member.userId)}
                    className="w-4 h-4 rounded border-gray-300 text-teal focus:ring-teal"
                    disabled={selectedMembers.length === 0}
                  />
                  <span className="text-sm text-charcoal">{member.user.name ?? member.user.email}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-charcoal mb-1.5">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
              placeholder="Any additional details..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-charcoal rounded-lg hover:bg-gray-50 font-medium transition-colors"
              disabled={createExpense.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={createExpense.isLoading}
            >
              {createExpense.isLoading ? "Adding..." : "Add expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
