import { Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Expense from '../models/Expense';
import Group from '../models/Group';
// import { AuthRequest } from '../middleware/auth';
import { AuthRequest } from '../middlewares/auth';

// Get expenses for a group
export const getGroupExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;
    const { page = 1, limit = 20, category, dateFrom, dateTo } = req.query;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).json({ error: 'Invalid group ID' });
      return;
    }

    // Check if user is member of the group
    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId,
      isActive: true
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found or access denied' });
      return;
    }

    // Build query
    const query: any = { group: groupId };
    
    if (category) {
      query.category = category;
    }
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom as string);
      if (dateTo) query.date.$lte = new Date(dateTo as string);
    }

    const expenses = await Expense.find(query)
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email avatar')
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get group expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// Get single expense
export const getExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { expenseId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      res.status(400).json({ error: 'Invalid expense ID' });
      return;
    }

    const expense = await Expense.findById(expenseId)
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email avatar')
      .populate('group', 'name members');

    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // Check if user is member of the group
    const group = expense.group as any;
    const isMember = group.members.some((m: any) => m.user.toString() === userId);
    
    if (!isMember) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
};

// Create new expense
export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      groupId,
      description,
      amount,
      category,
      splitBetween,
      date,
      receipt
    } = req.body;
    const userId = req.userId!;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).json({ error: 'Invalid group ID' });
      return;
    }

    // Check if user is member of the group
    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId,
      isActive: true
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found or access denied' });
      return;
    }

    // Validate split amounts
    const totalSplit = splitBetween.reduce((sum: number, split: any) => sum + split.amount, 0);
    if (Math.abs(totalSplit - amount) > 0.01) { // Allow for small rounding differences
      res.status(400).json({ error: 'Split amounts do not match total expense amount' });
      return;
    }

    // Validate that all split users are group members
    const groupMemberIds = group.members.map(m => m.user.toString());
    const splitUserIds = splitBetween.map((split: any) => split.user);
    const invalidUsers = splitUserIds.filter((id: string) => !groupMemberIds.includes(id));
    
    if (invalidUsers.length > 0) {
      res.status(400).json({ error: 'Some users in the split are not group members' });
      return;
    }

    // Create expense
    const expense = new Expense({
      group: groupId,
      description,
      amount,
      category: category || 'other',
      paidBy: userId,
      splitBetween: splitBetween.map((split: any) => ({
        user: split.user,
        amount: split.amount,
        isPaid: split.user === userId // Payer is automatically marked as paid
      })),
      date: date ? new Date(date) : new Date(),
      receipt
    });

    await expense.save();

    // Populate and return
    await expense.populate('paidBy', 'name email avatar');
    await expense.populate('splitBetween.user', 'name email avatar');

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

// Update expense
export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { expenseId } = req.params;
    const { description, amount, category, date, receipt } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      res.status(400).json({ error: 'Invalid expense ID' });
      return;
    }

    const expense = await Expense.findById(expenseId).populate('group');
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // Check if user is the one who paid for the expense
    if (expense.paidBy.toString() !== userId) {
      res.status(403).json({ error: 'Only the person who paid can edit this expense' });
      return;
    }

    // Check if expense has any settlements
    const hasSettlements = expense.splitBetween.some(split => split.isPaid && split.user.toString() !== userId);
    if (hasSettlements) {
      res.status(400).json({ error: 'Cannot edit expense that has been partially settled' });
      return;
    }

    // Update expense
    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date ? new Date(date) : expense.date;
    expense.receipt = receipt || expense.receipt;

    await expense.save();

    await expense.populate('paidBy', 'name email avatar');
    await expense.populate('splitBetween.user', 'name email avatar');

    res.json({
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

// Settle expense (mark as paid)
export const settleExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { expenseId } = req.params;
    const { userId: settleUserId } = req.body;
    const currentUserId = req.userId!;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      res.status(400).json({ error: 'Invalid expense ID' });
      return;
    }

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // Only the person who paid can mark others as settled
    if (expense.paidBy.toString() !== currentUserId) {
      res.status(403).json({ error: 'Only the person who paid can mark settlements' });
      return;
    }

    // Find the split for the user to settle
    const splitIndex = expense.splitBetween.findIndex(
      split => split.user.toString() === settleUserId
    );

    if (splitIndex === -1) {
      res.status(404).json({ error: 'User not found in expense split' });
      return;
    }

    if (expense.splitBetween[splitIndex].isPaid) {
      res.status(400).json({ error: 'User has already settled this expense' });
      return;
    }

    // Mark as paid
    expense.splitBetween[splitIndex].isPaid = true;
    expense.splitBetween[splitIndex].paidAt = new Date();

    // Check if all splits are settled
    const allSettled = expense.splitBetween.every(split => split.isPaid);
    if (allSettled) {
      expense.isSettled = true;
      expense.settledAt = new Date();
    }

    await expense.save();

    await expense.populate('paidBy', 'name email avatar');
    await expense.populate('splitBetween.user', 'name email avatar');

    res.json({
      message: 'Expense settlement updated successfully',
      expense
    });
  } catch (error) {
    console.error('Settle expense error:', error);
    res.status(500).json({ error: 'Failed to settle expense' });
  }
};

// Delete expense
export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { expenseId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      res.status(400).json({ error: 'Invalid expense ID' });
      return;
    }

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // Only the person who paid can delete the expense
    if (expense.paidBy.toString() !== userId) {
      res.status(403).json({ error: 'Only the person who paid can delete this expense' });
      return;
    }

    // Check if expense has any settlements
    const hasSettlements = expense.splitBetween.some(split => split.isPaid && split.user.toString() !== userId);
    if (hasSettlements) {
      res.status(400).json({ error: 'Cannot delete expense that has been partially settled' });
      return;
    }

    await Expense.findByIdAndDelete(expenseId);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

// Get user's expenses across all groups
export const getUserExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, type = 'all' } = req.query;

    let query: any = {};

    switch (type) {
      case 'paid':
        query.paidBy = userId;
        break;
      case 'owe':
        query = {
          'splitBetween.user': userId,
          'splitBetween.isPaid': false,
          paidBy: { $ne: userId }
        };
        break;
      case 'owed':
        query = {
          paidBy: userId,
          'splitBetween.isPaid': false
        };
        break;
      default:
        query = {
          $or: [
            { paidBy: userId },
            { 'splitBetween.user': userId }
          ]
        };
    }

    const expenses = await Expense.find(query)
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email avatar')
      .populate('group', 'name')
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get user expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch user expenses' });
  }
};
