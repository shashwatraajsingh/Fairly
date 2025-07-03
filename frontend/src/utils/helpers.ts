import { Expense, Balance } from '../types/expense';
import { GroupMember } from '../types/group';

export const calculateBalances = (expenses: Expense[], members: GroupMember[]): Balance[] => {
  const balances: { [userId: string]: Balance } = {};

  // Initialize balances for all members
  members.forEach(member => {
    balances[member.userId] = {
      userId: member.userId,
      userName: member.name,
      youOwe: 0,
      owesYou: 0,
      netBalance: 0
    };
  });

  // Calculate balances from expenses
  expenses.forEach(expense => {
    expense.splitBetween.forEach(split => {
      if (!split.isPaid && split.userId !== expense.paidBy) {
        // This person owes money to the payer
        balances[split.userId].youOwe += split.amount;
        balances[expense.paidBy].owesYou += split.amount;
      }
    });
  });

  // Calculate net balances
  Object.values(balances).forEach(balance => {
    balance.netBalance = balance.owesYou - balance.youOwe;
  });

  return Object.values(balances);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const generateInviteLink = (groupId: string): string => {
  return `${window.location.origin}/invite/${groupId}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};
