export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: ExpenseSplit[];
  category?: string;
  date: Date;
  isSettled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  isPaid: boolean;
}

export interface Balance {
  userId: string;
  userName: string;
  youOwe: number;
  owesYou: number;
  netBalance: number;
}
