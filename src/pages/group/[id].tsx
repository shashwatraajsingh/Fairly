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
import toast from "react-hot-toast";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Group not found</h2>
          <Link href="/" className="text-primary-600 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                {group.description && (
                  <p className="text-sm text-gray-600">{group.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="btn-secondary text-sm"
              >
                + Add Member
              </button>
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="btn-primary text-sm"
              >
                + Add Expense
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("expenses")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "expenses"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab("balances")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "balances"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Balances
            </button>
            <button
              onClick={() => setActiveTab("settlements")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "settlements"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
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
                <div key={expense.id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-lg">💰</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{expense.description}</h3>
                          <p className="text-sm text-gray-600">
                            Paid by {expense.createdBy.name} on{" "}
                            {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {expense.notes && (
                        <p className="text-sm text-gray-600 mt-2 ml-13">{expense.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${expense.amount.toFixed(2)}</p>
                      {expense.category && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mt-1">
                          {expense.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No expenses yet</p>
                <button onClick={() => setIsAddExpenseOpen(true)} className="btn-primary">
                  Add First Expense
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "balances" && (
          <div className="space-y-6">
            {/* Individual Balances */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Individual Balances</h3>
              <div className="space-y-2">
                {balances && balances.length > 0 ? (
                  balances.map((balance) => (
                    <div key={balance.userId} className="card p-4 flex items-center justify-between">
                      <span className="font-medium">{balance.userName}</span>
                      <span
                        className={`font-semibold ${
                          balance.amount > 0
                            ? "text-green-600"
                            : balance.amount < 0
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {balance.amount > 0 ? "+" : ""}${Math.abs(balance.amount).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">All settled up! 🎉</p>
                )}
              </div>
            </div>

            {/* Simplified Debts */}
            {simplifiedDebts && simplifiedDebts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Suggested Settlements</h3>
                <div className="space-y-2">
                  {simplifiedDebts.map((debt, index) => (
                    <div key={index} className="card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {debt.fromName} → {debt.toName}
                          </p>
                          <p className="text-sm text-gray-600">Simplified payment</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary-600">
                            ${debt.amount.toFixed(2)}
                          </p>
                          <button
                            onClick={() => setIsSettleUpOpen(true)}
                            className="text-sm text-primary-600 hover:underline"
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
                <div key={settlement.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {settlement.from.name} paid {settlement.to.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(settlement.settledAt).toLocaleDateString()}
                      </p>
                      {settlement.notes && (
                        <p className="text-sm text-gray-600 mt-1">{settlement.notes}</p>
                      )}
                    </div>
                    <p className="text-lg font-semibold text-green-600">
                      ${settlement.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No settlements yet</p>
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
