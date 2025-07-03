import { Router } from 'express';
import {
  getGroupBalances, getUserBalances, getUserPairBalance, getSettlementSuggestions
} from '../controllers/balanceController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.get('/user', authenticateToken, getUserBalances);
router.get('/group/:groupId', authenticateToken, getGroupBalances);
router.get('/group/:groupId/suggestions', authenticateToken, getSettlementSuggestions);
router.get('/with/:otherUserId', authenticateToken, getUserPairBalance);

export default router;
