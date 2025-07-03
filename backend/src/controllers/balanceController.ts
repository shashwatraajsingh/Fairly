import { Response } from 'express';
import mongoose from 'mongoose';
import Expense from '../models/Expense';
import Group from '../models/Group';
import { AuthRequest } from '../middlewares/auth';

interface UserBalance {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  youOwe: number;
  owesYou: number;
  netBalance: number;
}

interface GroupBalance {
  groupId: string;
  groupName: string;
  balance: number;
  members: UserBalance[];
}

// Calculate balances for a specific group
export const getGroupBalances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).json({ error: 'Invalid group ID' });
      return;
    }

    // Check if user is member of the group
    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId,
      isActive: true
    }).populate('members.user', 'name email avatar');

    if (!group) {
      res.status(404).json({ error: 'Group not found or access denied' });
      return;
    }

    // Get all expenses for this group
    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email avatar');

    // Calculate balances
    const balances = calculateGroupBalances(expenses, group.members);

    res.json({
      groupId,
      groupName: group.name,
      balances
    });
  } catch (error) {
    console.error('Get group balances error:', error);
    res.status(500).json({ error: 'Failed to calculate group balances' });
  }
};

// Calculate overall balances for user across all groups
export const getUserBalances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get all groups user is member of
    const groups = await Group.find({
      'members.user': userId,
      isActive: true
    }).populate('members.user', 'name email avatar');

    const groupBalances: GroupBalance[] = [];
    let totalYouOwe = 0;
    let totalOwesYou = 0;

    for (const group of groups) {
      // Get expenses for this group
      const expenses = await Expense.find({ group: group._id })
        .populate('paidBy', 'name email avatar')
        .populate('splitBetween.user', 'name email avatar');

      // Calculate balances for this group
      const balances = calculateGroupBalances(expenses, group.members);
      
      // Find current user's balance in this group
      const userBalance = balances.find(b => b.userId === userId);
      const groupBalance = userBalance ? userBalance.netBalance : 0;

      groupBalances.push({
        groupId: group._id,
        groupName: group.name,
        balance: groupBalance,
        members: balances
      });

      // Add to totals
      if (groupBalance < 0) {
        totalYouOwe += Math.abs(groupBalance);
      } else {
        totalOwesYou += groupBalance;
      }
    }

    res.json({
      summary: {
        totalYouOwe,
        totalOwesYou,
        netBalance: totalOwesYou - totalYouOwe
      },
      groups: groupBalances
    });
  } catch (error) {
    console.error('Get user balances error:', error);
    res.status(500).json({ error: 'Failed to calculate user balances' });
  }
};

// Get balance between two users
export const getUserPairBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { otherUserId } = req.params;
    const userId = req.userId!;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    if (userId === otherUserId) {
      res.status(400).json({ error: 'Cannot calculate balance with yourself' });
      return;
    }

    // Find common groups
    const commonGroups = await Group.find({
      'members.user': { $all: [userId, otherUserId] },
      isActive: true
    });

    let netBalance = 0;
    const groupDetails = [];

    for (const group of commonGroups) {
      // Get expenses where both users are involved
      const expenses = await Expense.find({
        group: group._id,
        $or: [
          { paidBy: userId, 'splitBetween.user': otherUserId },
          { paidBy: otherUserId, 'splitBetween.user': userId }
        ]
      });

      let groupBalance = 0;

      for (const expense of expenses) {
        if (expense.paidBy.toString() === userId) {
          // Current user paid, other user owes
          const split = expense.splitBetween.find(s => s.user.toString() === otherUserId);
          if (split && !split.isPaid) {
            groupBalance += split.amount;
          }
        } else {
          // Other user paid, current user owes
          const split = expense.splitBetween.find(s => s.user.toString() === userId);
          if (split && !split.isPaid) {
            groupBalance -= split.amount;
          }
        }
      }

      groupDetails.push({
        groupId: group._id,
        groupName: group.name,
        balance: groupBalance
      });

      netBalance += groupBalance;
    }

    res.json({
      otherUserId,
      netBalance, // Positive means other user owes you, negative means you owe other user
      groups: groupDetails
    });
  } catch (error) {
    console.error('Get user pair balance error:', error);
    res.status(500).json({ error: 'Failed to calculate balance between users' });
  }
};

// Helper function to calculate balances for a group
function calculateGroupBalances(expenses: any[], members: any[]): UserBalance[] {
  const balances: { [userId: string]: UserBalance } = {};

  // Initialize balances for all members
  members.forEach(member => {
    const user = member.user || member;
    balances[user._id] = {
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userAvatar: user.avatar,
      youOwe: 0,
      owesYou: 0,
      netBalance: 0
    };
  });

  // Calculate balances from expenses
  expenses.forEach(expense => {
    const payerId = expense.paidBy._id || expense.paidBy;

    expense.splitBetween.forEach((split: any) => {
      const splitUserId = split.user._id || split.user;

      if (!split.isPaid && splitUserId !== payerId.toString()) {
        // This person owes money to the payer
        if (balances[splitUserId]) {
          balances[splitUserId].youOwe += split.amount;
        }
        if (balances[payerId]) {
          balances[payerId].owesYou += split.amount;
        }
      }
    });
  });

  // Calculate net balances
  Object.values(balances).forEach(balance => {
    balance.netBalance = balance.owesYou - balance.youOwe;
  });

  return Object.values(balances);
}

// Get settlement suggestions (simplified debt resolution)
export const getSettlementSuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).json({ error: 'Invalid group ID' });
      return;
    }

    // Check if user is member of the group
    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId,
      isActive: true
    }).populate('members.user', 'name email avatar');

    if (!group) {
      res.status(404).json({ error: 'Group not found or access denied' });
      return;
    }

    // Get all expenses for this group
    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email avatar');

    // Calculate balances
    const balances = calculateGroupBalances(expenses, group.members);

    // Generate settlement suggestions using simplified algorithm
    const suggestions = generateSettlementSuggestions(balances);

    res.json({
      groupId,
      groupName: group.name,
      suggestions
    });
  } catch (error) {
    console.error('Get settlement suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate settlement suggestions' });
  }
};

// Helper function to generate settlement suggestions
function generateSettlementSuggestions(balances: UserBalance[]) {
  const suggestions = [];
  
  // Separate debtors and creditors
  const debtors = balances.filter(b => b.netBalance < 0).sort((a, b) => a.netBalance - b.netBalance);
  const creditors = balances.filter(b => b.netBalance > 0).sort((a, b) => b.netBalance - a.netBalance);

  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const debtAmount = Math.abs(debtor.netBalance);
    const creditAmount = creditor.netBalance;
    
    const settlementAmount = Math.min(debtAmount, creditAmount);

    suggestions.push({
      from: {
        userId: debtor.userId,
        name: debtor.userName
      },
      to: {
        userId: creditor.userId,
        name: creditor.userName
      },
      amount: settlementAmount
    });

    // Update balances
    debtor.netBalance += settlementAmount;
    creditor.netBalance -= settlementAmount;

    // Move to next debtor/creditor if current one is settled
    if (Math.abs(debtor.netBalance) < 0.01) i++;
    if (Math.abs(creditor.netBalance) < 0.01) j++;
  }

  return suggestions;
}
