/**
 * Debt Simplification Algorithm
 * 
 * This algorithm simplifies debts between multiple people by minimizing
 * the number of transactions needed to settle all debts.
 * 
 * Algorithm: Greedy approach using min-max heap
 * Time Complexity: O(n^2) where n is the number of people
 * 
 * Example:
 * A owes B $10, B owes C $10 -> Simplified: A owes C $10
 */

export interface Balance {
  userId: string;
  userName: string;
  amount: number; // positive = owed to them, negative = they owe
}

export interface SimplifiedDebt {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

/**
 * Simplifies debts using a greedy algorithm
 * @param balances Array of user balances
 * @returns Array of simplified debt transactions
 */
export function simplifyDebts(balances: Balance[]): SimplifiedDebt[] {
  // Filter out zero balances
  const nonZeroBalances = balances.filter(b => Math.abs(b.amount) > 0.01);
  
  if (nonZeroBalances.length === 0) {
    return [];
  }

  // Create a copy to work with
  const workingBalances = nonZeroBalances.map(b => ({ ...b }));
  const transactions: SimplifiedDebt[] = [];

  while (workingBalances.length > 1) {
    // Sort by amount (descending)
    workingBalances.sort((a, b) => b.amount - a.amount);

    // Get the person who is owed the most (creditor)
    const creditor = workingBalances[0]!;
    
    // Get the person who owes the most (debtor)
    const debtor = workingBalances[workingBalances.length - 1]!;

    // If both are essentially zero, we're done
    if (Math.abs(creditor.amount) < 0.01 && Math.abs(debtor.amount) < 0.01) {
      break;
    }

    // Calculate settlement amount (minimum of what's owed and what's due)
    const settlementAmount = Math.min(
      Math.abs(creditor.amount),
      Math.abs(debtor.amount)
    );

    // Create transaction
    transactions.push({
      fromId: debtor.userId,
      fromName: debtor.userName,
      toId: creditor.userId,
      toName: creditor.userName,
      amount: settlementAmount,
    });

    // Update balances
    creditor.amount -= settlementAmount;
    debtor.amount += settlementAmount;

    // Remove settled balances
    if (Math.abs(creditor.amount) < 0.01) {
      workingBalances.shift();
    }
    if (Math.abs(debtor.amount) < 0.01) {
      workingBalances.pop();
    }
  }

  return transactions;
}

/**
 * Calculates net balances for all users in a group
 * @param expenses Array of expense splits
 * @returns Map of userId to net balance
 */
export function calculateBalances(
  expenses: Array<{
    paidById: string;
    owedById: string;
    amount: number;
    settled: boolean;
  }>
): Map<string, number> {
  const balances = new Map<string, number>();

  for (const expense of expenses) {
    if (expense.settled) continue;

    // Person who paid gets positive balance
    const paidByBalance = balances.get(expense.paidById) ?? 0;
    balances.set(expense.paidById, paidByBalance + expense.amount);

    // Person who owes gets negative balance
    const owedByBalance = balances.get(expense.owedById) ?? 0;
    balances.set(expense.owedById, owedByBalance - expense.amount);
  }

  return balances;
}

/**
 * Calculates what each person owes or is owed in a group
 * @param groupId The group ID
 * @param expenseSplits Array of expense splits with user info
 * @returns Array of balances with user details
 */
export function calculateGroupBalances(
  expenseSplits: Array<{
    paidById: string;
    paidBy: { id: string; name: string | null };
    owedById: string;
    owedBy: { id: string; name: string | null };
    amount: number;
    settled: boolean;
  }>
): Balance[] {
  const balanceMap = new Map<string, Balance>();

  for (const split of expenseSplits) {
    if (split.settled) continue;

    // Initialize balances if not exists
    if (!balanceMap.has(split.paidById)) {
      balanceMap.set(split.paidById, {
        userId: split.paidById,
        userName: split.paidBy.name ?? "Unknown",
        amount: 0,
      });
    }
    if (!balanceMap.has(split.owedById)) {
      balanceMap.set(split.owedById, {
        userId: split.owedById,
        userName: split.owedBy.name ?? "Unknown",
        amount: 0,
      });
    }

    // Update balances
    const paidByBalance = balanceMap.get(split.paidById)!;
    paidByBalance.amount += split.amount;

    const owedByBalance = balanceMap.get(split.owedById)!;
    owedByBalance.amount -= split.amount;
  }

  return Array.from(balanceMap.values());
}
