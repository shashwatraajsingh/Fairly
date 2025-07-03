import { Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Group from '../models/Group';
import User from '../models/User';
import Expense from '../models/Expense';
import { AuthRequest } from '../middlewares/auth';

// Get all groups for authenticated user
export const getGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    const groups = await Group.find({
      'members.user': userId,
      isActive: true
    })
    .populate('members.user', 'name email avatar')
    .populate('createdBy', 'name email')
    .sort({ updatedAt: -1 });

    res.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
};

// Get single group by ID
export const getGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).json({ error: 'Invalid group ID' });
      return;
    }

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId,
      isActive: true
    })
    .populate('members.user', 'name email avatar phone')
    .populate('createdBy', 'name email');

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    res.json({ group });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
};

// Create new group
export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, description, memberEmails } = req.body;
    const userId = req.userId!;

    // Create group
    const group = new Group({
      name,
      description,
      createdBy: userId,
      members: [{
        user: userId,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    await group.save();

    // Add members if provided
    if (memberEmails && memberEmails.length > 0) {
      const users = await User.find({ 
        email: { $in: memberEmails },
        _id: { $ne: userId } // Exclude creator
      });

      for (const user of users) {
        group.members.push({
          user: user._id,
          role: 'member',
          joinedAt: new Date()
        });
      }

      await group.save();
    }

    // Populate and return
    await group.populate('members.user', 'name email avatar');
    await group.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

// Update group
export const updateGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { groupId } = req.params;
    const { name, description } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).json({ error: 'Invalid group ID' });
      return;
    }

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId,
      isActive: true
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Check if user is admin
    const memberInfo = group.members.find(m => m.user.toString() === userId);
    if (!memberInfo || memberInfo.role !== 'admin') {
      res.status(403).json({ error: 'Only admins can update group details' });
      return;
    }

    // Update group
    group.name = name || group.name;
    group.description = description || group.description;
    await group.save();

    await group.populate('members.user', 'name email avatar');
    await group.populate('createdBy', 'name email');

    res.json({
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
};

// Add member to group
export const addMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { groupId } = req.params;
    const { email } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).json({ error: 'Invalid group ID' });
      return;
    }

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId,
      isActive: true
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Check if user is admin
    const memberInfo = group.members.find(m => m.user.toString() === userId);
    if (!memberInfo || memberInfo.role !== 'admin') {
      res.status(403).json({ error: 'Only admins can add members' });
      return;
    }

    // Find user to add
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      res.status(404).json({ error: 'User not found with this email' });
      return;
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some(m => m.user.toString() === userToAdd._id.toString());
    if (isAlreadyMember) {
      res.status(400).json({ error: 'User is already a member of this group' });
      return;
    }

    // Add member
    group.members.push({
      user: userToAdd._id,
      role: 'member',
      joinedAt: new Date()
    });

    await group.save();
    await group.populate('members.user', 'name email avatar');

    res.json({
      message: 'Member added successfully',
      group
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

// Remove member from group
export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      res.status(400).json({ error: 'Invalid group or member ID' });
      return;
    }

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId,
      isActive: true
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Check if user is admin or removing themselves
    const memberInfo = group.members.find(m => m.user.toString() === userId);
    const isAdmin = memberInfo && memberInfo.role === 'admin';
    const isRemovingSelf = userId === memberId;

    if (!isAdmin && !isRemovingSelf) {
      res.status(403).json({ error: 'You can only remove yourself or be an admin to remove others' });
      return;
    }

    // Don't allow removing the creator if they're the only admin
    const admins = group.members.filter(m => m.role === 'admin');
    const memberToRemove = group.members.find(m => m.user.toString() === memberId);
    
    if (memberToRemove?.role === 'admin' && admins.length === 1) {
      res.status(400).json({ error: 'Cannot remove the only admin. Transfer admin rights first.' });
      return;
    }

    // Remove member
    group.members = group.members.filter(m => m.user.toString() !== memberId);
    await group.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

// Leave group
export const leaveGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.userId!;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).json({ error: 'Invalid group ID' });
      return;
    }

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId,
      isActive: true
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Check if user has unsettled expenses
    const unsettledExpenses = await Expense.find({
      group: groupId,
      $or: [
        { paidBy: userId },
        { 'splitBetween.user': userId, 'splitBetween.isPaid': false }
      ],
      isSettled: false
    });

    if (unsettledExpenses.length > 0) {
      res.status(400).json({ 
        error: 'Cannot leave group with unsettled expenses. Please settle all expenses first.' 
      });
      return;
    }

    // Remove user from group
    group.members = group.members.filter(m => m.user.toString() !== userId);
    
    // If group becomes empty, deactivate it
    if (group.members.length === 0) {
      group.isActive = false;
    }

    await group.save();

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
};

// Delete group (admin only)
export const deleteGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).json({ error: 'Invalid group ID' });
      return;
    }

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId,
      isActive: true
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Check if user is admin
    const memberInfo = group.members.find(m => m.user.toString() === userId);
    if (!memberInfo || memberInfo.role !== 'admin') {
      res.status(403).json({ error: 'Only admins can delete groups' });
      return;
    }

    // Check if there are unsettled expenses
    const unsettledExpenses = await Expense.find({
      group: groupId,
      isSettled: false
    });

    if (unsettledExpenses.length > 0) {
      res.status(400).json({ 
        error: 'Cannot delete group with unsettled expenses. Please settle all expenses first.' 
      });
      return;
    }

    // Soft delete the group
    group.isActive = false;
    await group.save();

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
};
