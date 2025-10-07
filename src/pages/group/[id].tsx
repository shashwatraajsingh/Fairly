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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-teal"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-2">Group not found</h2>
          <Link href="/" className="text-teal hover:text-teal-dark font-medium">
            ← Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-teal hover:text-teal-dark font-medium">
                ← Groups
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-charcoal">{group.name}</h1>
                {group.description && (
                  <p className="text-sm text-gray-500">{group.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="text-sm text-gray-600 hover:text-charcoal font-medium"
              >
                Add member
              </button>
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="bg-teal hover:bg-teal-dark text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Add expense
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("expenses")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "expenses"
                  ? "border-teal text-teal"
                  : "border-transparent text-gray-600 hover:text-charcoal"
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab("balances")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "balances"
                  ? "border-teal text-teal"
                  : "border-transparent text-gray-600 hover:text-charcoal"
              }`}
            >
              Balances
            </button>
            <button
              onClick={() => setActiveTab("settlements")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "settlements"
                  ? "border-teal text-teal"
                  : "border-transparent text-gray-600 hover:text-charcoal"
              }`}
            >
              Settlements
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
                <div key={expense.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-teal hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-charcoal">{expense.description}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {expense.createdBy.name} paid • {new Date(expense.date).toLocaleDateString()}
                          </p>
                          {expense.category && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded mt-1">
                              {expense.category}
                            </span>
                          )}
                        </div>
                      </div>
                      {expense.notes && (
                        <p className="text-sm text-gray-600 mt-3 ml-13">{expense.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-charcoal">${expense.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-charcoal mb-2">No expenses yet</h3>
                <p className="text-gray-500 mb-4">Add an expense to get started</p>
                <button onClick={() => setIsAddExpenseOpen(true)} className="bg-teal hover:bg-teal-dark text-white font-medium px-6 py-2 rounded-lg transition-colors">
                  Add expense
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "balances" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-charcoal mb-4">Balances</h3>
              <div className="space-y-2">
                {balances && balances.length > 0 ? (
                  balances.map((balance) => (
                    <div key={balance.userId} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal flex items-center justify-center text-white font-semibold text-sm">
                            {balance.userName[0]?.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-charcoal">{balance.userName}</span>
                            {balance.amount === 0 ? (
                              <span className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                settled up
                              </span>
                            ) : balance.amount > 0 ? (
                              <span className="text-xs text-green-600 mt-0.5 block">gets back</span>
                            ) : (
                              <span className="text-xs text-orange-600 mt-0.5 block">owes</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-base font-semibold ${
                              balance.amount > 0
                                ? "text-green-600"
                                : balance.amount < 0
                                ? "text-orange-600"
                                : "text-gray-600"
                            }`}
                          >
                            {balance.amount === 0 ? "$0.00" : `${balance.amount > 0 ? "+" : ""}$${Math.abs(balance.amount).toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500">All settled up!</p>
                  </div>
                )}
              </div>
            </div>

            {simplifiedDebts && simplifiedDebts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-4">Suggested payments</h3>
                <div className="space-y-2">
                  {simplifiedDebts.map((debt, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-charcoal">
                            {debt.fromName} → {debt.toName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">Suggested settlement</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-base font-semibold text-orange-600">
                            ${debt.amount.toFixed(2)}
                          </p>
                          <button
                            onClick={() => setIsSettleUpOpen(true)}
                            className="bg-teal hover:bg-teal-dark text-white font-medium px-3 py-1.5 rounded-lg transition-colors text-sm"
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
          <div className="space-y-2">
            {settlements && settlements.length > 0 ? (
              settlements.map((settlement) => (
                <div key={settlement.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-charcoal">
                        {settlement.from.name} → {settlement.to.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(settlement.settledAt).toLocaleDateString()}
                      </p>
                      {settlement.notes && (
                        <p className="text-sm text-gray-600 mt-1">{settlement.notes}</p>
                      )}
                    </div>
                    <p className="text-base font-semibold text-green-600">
                      ${settlement.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-charcoal mb-2">No settlements yet</h3>
                <p className="text-gray-500">Settlements will appear here once recorded</p>
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
