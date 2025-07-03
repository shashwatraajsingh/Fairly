import { Router } from 'express';
import { body } from 'express-validator';
import {
  getGroupExpenses, getExpense, createExpense, updateExpense,
  settleExpense, deleteExpense, getUserExpenses
} from '../controllers/expenseController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.get('/user', authenticateToken, getUserExpenses);
router.get('/group/:groupId', authenticateToken, getGroupExpenses);
router.get('/:expenseId', authenticateToken, getExpense);

router.post('/', authenticateToken, [
  body('groupId').notEmpty(),
  body('description').notEmpty(),
  body('amount').isNumeric(),
  body('splitBetween').isArray({ min: 1 })
], createExpense);

router.put('/:expenseId', authenticateToken, updateExpense);
router.post('/:expenseId/settle', authenticateToken, settleExpense);
router.delete('/:expenseId', authenticateToken, deleteExpense);

export default router;
