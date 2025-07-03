import { Router } from 'express';
import { body } from 'express-validator';
import {
  getGroups, getGroup, createGroup, updateGroup,
  addMember, removeMember, leaveGroup, deleteGroup
} from '../controllers/groupController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, getGroups);
router.get('/:groupId', authenticateToken, getGroup);

router.post('/', authenticateToken, [
  body('name').notEmpty()
], createGroup);

router.put('/:groupId', authenticateToken, updateGroup);

router.post('/:groupId/members', authenticateToken, [
  body('email').isEmail()
], addMember);

router.delete('/:groupId/members/:memberId', authenticateToken, removeMember);
router.post('/:groupId/leave', authenticateToken, leaveGroup);
router.delete('/:groupId', authenticateToken, deleteGroup);

export default router;
