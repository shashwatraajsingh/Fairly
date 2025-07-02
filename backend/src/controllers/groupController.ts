import { Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Group from '../models/Group';
import User from '../models/User';
import Expense from '../models/Expense';
import { AuthRequest } from '../middleware/auth';

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
export const updateGroup = async (req: AuthRequest,
