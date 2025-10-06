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
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
      <div className="card max-w-lg w-full p-8 my-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-taupe to-taupe-dark rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-charcoal">Record Settlement</h2>
        </div>

        {simplifiedDebts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-charcoal mb-3 flex items-center gap-2">
              <span className="text-lg">⚡</span>
              Quick Settle
            </h3>
            <div className="space-y-2">
              {simplifiedDebts.map((debt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleQuickSettle(debt)}
                  className="w-full text-left p-4 border-2 border-charcoal/10 rounded-xl hover:border-taupe hover:bg-taupe/5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-charcoal">
                        {debt.fromName}
                      </span>
                      <svg className="w-4 h-4 text-taupe group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="text-sm font-medium text-charcoal">
                        {debt.toName}
                      </span>
                    </div>
                    <span className="font-bold text-lg text-taupe">
                      ${debt.amount.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-charcoal/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-charcoal/60 font-medium">or enter manually</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="from" className="block text-sm font-semibold text-charcoal mb-2">
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
                    {member.user.name ?? member.user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="to" className="block text-sm font-semibold text-charcoal mb-2">
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
                    {member.user.name ?? member.user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
            <label htmlFor="notes" className="block text-sm font-semibold text-charcoal mb-2">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input resize-none"
              placeholder="Payment method, reference, etc."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1 py-3"
              disabled={recordSettlement.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 py-3"
              disabled={recordSettlement.isLoading}
            >
              {recordSettlement.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Recording...
                </span>
              ) : "Record Settlement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
