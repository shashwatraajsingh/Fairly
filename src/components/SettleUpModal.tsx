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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 my-8 animate-slide-up">
        <h2 className="text-2xl font-semibold mb-4">Record Settlement</h2>

        {simplifiedDebts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Settle</h3>
            <div className="space-y-2">
              {simplifiedDebts.map((debt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleQuickSettle(debt)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {debt.fromName} → {debt.toName}
                    </span>
                    <span className="font-semibold text-primary-600">
                      ${debt.amount.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or enter manually</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
              From (who paid) *
            </label>
            <select
              id="from"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="input"
              required
            >
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.name || member.user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
              To (who received) *
            </label>
            <select
              id="to"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="input"
              required
            >
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.name || member.user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
              placeholder="Payment method, reference, etc."
              rows={2}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
              disabled={recordSettlement.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={recordSettlement.isLoading}
            >
              {recordSettlement.isLoading ? "Recording..." : "Record Settlement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
