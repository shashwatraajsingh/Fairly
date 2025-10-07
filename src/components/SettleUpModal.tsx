import { useState } from "react";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import type { SimplifiedDebt } from "~/server/utils/debtSimplification";

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  members: Member[];
  simplifiedDebts: SimplifiedDebt[];
}

export default function SettleUpModal({
  isOpen,
  onClose,
  groupId,
  members,
  simplifiedDebts,
}: SettleUpModalProps) {
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const utils = api.useUtils();
  const recordSettlement = api.balance.recordSettlement.useMutation({
    onSuccess: () => {
      toast.success("Settlement recorded successfully!");
      void utils.group.getById.invalidate({ id: groupId });
      void utils.balance.getByGroup.invalidate({ groupId });
      void utils.balance.getSimplifiedDebts.invalidate({ groupId });
      void utils.balance.getSettlements.invalidate({ groupId });
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record settlement");
    },
  });

  const handleClose = () => {
    setFromId("");
    setToId("");
    setAmount("");
    setNotes("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromId || !toId || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (fromId === toId) {
      toast.error("Cannot settle with yourself");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    recordSettlement.mutate({
      groupId,
      fromId,
      toId,
      amount: amountNum,
      notes: notes || undefined,
    });
  };

  const handleQuickSettle = (debt: SimplifiedDebt) => {
    setFromId(debt.fromId);
    setToId(debt.toId);
    setAmount(debt.amount.toFixed(2));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 my-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-charcoal">Settle up</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={recordSettlement.isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {simplifiedDebts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-charcoal mb-3">
              Suggested payments
            </h3>
            <div className="space-y-2">
              {simplifiedDebts.map((debt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleQuickSettle(debt)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-teal hover:bg-teal-50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-charcoal">
                        {debt.fromName} → {debt.toName}
                      </span>
                    </div>
                    <span className="font-semibold text-teal">
                      ${debt.amount.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 text-xs">or enter manually</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="from" className="block text-sm font-medium text-charcoal mb-1.5">
                From
              </label>
              <select
                id="from"
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
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
              <label htmlFor="to" className="block text-sm font-medium text-charcoal mb-1.5">
                To
              </label>
              <select
                id="to"
                value={toId}
                onChange={(e) => setToId(e.target.value)}
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
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-charcoal mb-1.5">
              Amount ($)
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
            <label htmlFor="notes" className="block text-sm font-medium text-charcoal mb-1.5">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
              placeholder="Payment method, reference, etc."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-charcoal rounded-lg hover:bg-gray-50 font-medium transition-colors"
              disabled={recordSettlement.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={recordSettlement.isLoading}
            >
              {recordSettlement.isLoading ? "Recording..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
