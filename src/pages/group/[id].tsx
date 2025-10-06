import { type GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { useState } from "react";
import { authOptions } from "~/server/auth";
import { api } from "~/utils/api";
import Link from "next/link";
import AddExpenseModal from "~/components/AddExpenseModal";
import AddMemberModal from "~/components/AddMemberModal";
import SettleUpModal from "~/components/SettleUpModal";

export default function GroupDetail() {
  const router = useRouter();
  const groupId = router.query.id as string;
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"expenses" | "balances" | "settlements">("expenses");

  const { data: group, isLoading } = api.group.getById.useQuery(
    { id: groupId },
    { enabled: !!groupId }
  );

  const { data: balances } = api.balance.getByGroup.useQuery(
    { groupId },
    { enabled: !!groupId }
  );

  const { data: simplifiedDebts } = api.balance.getSimplifiedDebts.useQuery(
    { groupId },
    { enabled: !!groupId }
  );

  const { data: settlements } = api.balance.getSettlements.useQuery(
    { groupId },
    { enabled: !!groupId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-beige border-t-taupe"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-beige to-taupe-light rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❓</span>
          </div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">Group not found</h2>
          <Link href="/" className="text-taupe hover:text-taupe-dark font-medium">
            ← Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-charcoal/10 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-charcoal/70 hover:text-taupe transition-colors font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-beige to-taupe-light rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-charcoal">{group.name}</h1>
                  {group.description && (
                    <p className="text-sm text-charcoal/60">{group.description}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="btn-secondary text-sm px-4 py-2"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Add Member
                </span>
              </button>
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="btn-primary text-sm px-4 py-2"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Expense
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("expenses")}
              className={`py-3 px-6 font-semibold text-sm rounded-t-xl transition-all ${
                activeTab === "expenses"
                  ? "bg-taupe text-white shadow-lg"
                  : "text-charcoal/60 hover:text-charcoal hover:bg-white/50"
              }`}
            >
              <span className="flex items-center gap-2">
                💵 Expenses
              </span>
            </button>
            <button
              onClick={() => setActiveTab("balances")}
              className={`py-3 px-6 font-semibold text-sm rounded-t-xl transition-all ${
                activeTab === "balances"
                  ? "bg-taupe text-white shadow-lg"
                  : "text-charcoal/60 hover:text-charcoal hover:bg-white/50"
              }`}
            >
              <span className="flex items-center gap-2">
                ⚖️ Balances
              </span>
            </button>
            <button
              onClick={() => setActiveTab("settlements")}
              className={`py-3 px-6 font-semibold text-sm rounded-t-xl transition-all ${
                activeTab === "settlements"
                  ? "bg-taupe text-white shadow-lg"
                  : "text-charcoal/60 hover:text-charcoal hover:bg-white/50"
              }`}
            >
              <span className="flex items-center gap-2">
                ✅ Settlements
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "expenses" && (
          <div className="space-y-4">
            {group.expenses.length > 0 ? (
              group.expenses.map((expense) => (
                <div key={expense.id} className="card p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-beige to-taupe-light flex items-center justify-center shadow-md">
                          <span className="text-xl">💵</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-charcoal">{expense.description}</h3>
                          <p className="text-sm text-charcoal/60 mt-1">
                            Paid by <span className="font-medium text-taupe">{expense.createdBy.name}</span> • {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {expense.notes && (
                        <p className="text-sm text-charcoal/70 mt-3 ml-16 bg-cream/50 p-3 rounded-lg">{expense.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-taupe">${expense.amount.toFixed(2)}</p>
                      {expense.category && (
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-beige text-charcoal rounded-full mt-2">
                          {expense.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-beige to-taupe-light rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl">💸</span>
                </div>
                <h3 className="text-2xl font-bold text-charcoal mb-3">No expenses yet</h3>
                <p className="text-charcoal/60 mb-6">Start tracking by adding your first expense</p>
                <button onClick={() => setIsAddExpenseOpen(true)} className="btn-primary px-8 py-3 text-lg">
                  Add First Expense
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "balances" && (
          <div className="space-y-8">
            {/* Individual Balances */}
            <div>
              <h3 className="text-2xl font-bold text-charcoal mb-4 flex items-center gap-2">
                <span>⚖️</span> Individual Balances
              </h3>
              <div className="space-y-3">
                {balances && balances.length > 0 ? (
                  balances.map((balance) => (
                    <div key={balance.userId} className="card p-5 hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-taupe to-taupe-dark flex items-center justify-center text-white font-bold shadow-md">
                            {balance.userName[0]?.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-charcoal block">{balance.userName}</span>
                            {balance.amount === 0 ? (
                              <span className="text-xs font-semibold text-green-600 flex items-center gap-1 mt-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Settled
                              </span>
                            ) : balance.amount > 0 ? (
                              <span className="text-xs text-green-600 mt-1 block">Gets back</span>
                            ) : (
                              <span className="text-xs text-red-600 mt-1 block">Owes</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xl font-bold px-4 py-2 rounded-xl inline-block ${
                              balance.amount > 0
                                ? "bg-green-100 text-green-700"
                                : balance.amount < 0
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {balance.amount === 0 ? "✓ $0.00" : `${balance.amount > 0 ? "+" : ""}$${Math.abs(balance.amount).toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 card">
                    <span className="text-6xl mb-4 block">🎉</span>
                    <p className="text-xl font-bold text-charcoal">All settled up!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Simplified Debts */}
            {simplifiedDebts && simplifiedDebts.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-charcoal mb-4 flex items-center gap-2">
                  <span>⚡</span> Suggested Settlements
                </h3>
                <div className="space-y-3">
                  {simplifiedDebts.map((debt, index) => (
                    <div key={index} className="card p-6 hover:shadow-xl transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-charcoal">{debt.fromName}</span>
                            <svg className="w-5 h-5 text-taupe group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <span className="font-bold text-charcoal">{debt.toName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-2xl font-bold text-taupe">
                            ${debt.amount.toFixed(2)}
                          </p>
                          <button
                            onClick={() => setIsSettleUpOpen(true)}
                            className="btn-primary px-4 py-2 text-sm"
                          >
                            Settle up
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "settlements" && (
          <div className="space-y-4">
            {settlements && settlements.length > 0 ? (
              settlements.map((settlement) => (
                <div key={settlement.id} className="card p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md">
                        <span className="text-2xl">✅</span>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-charcoal">
                          {settlement.from.name} <span className="text-taupe">→</span> {settlement.to.name}
                        </p>
                        <p className="text-sm text-charcoal/60 mt-1">
                          {new Date(settlement.settledAt).toLocaleDateString()}
                        </p>
                        {settlement.notes && (
                          <p className="text-sm text-charcoal/70 mt-2 bg-cream/50 p-2 rounded-lg">{settlement.notes}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      ${settlement.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-beige to-taupe-light rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl">📝</span>
                </div>
                <h3 className="text-2xl font-bold text-charcoal mb-3">No settlements yet</h3>
                <p className="text-charcoal/60">Settlements will appear here once recorded</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        groupId={groupId}
        members={group.members}
      />
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        groupId={groupId}
      />
      <SettleUpModal
        isOpen={isSettleUpOpen}
        onClose={() => setIsSettleUpOpen(false)}
        groupId={groupId}
        members={group.members}
        simplifiedDebts={simplifiedDebts ?? []}
      />
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}
