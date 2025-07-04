import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, googleAuth, phoneAuth, getMe, logout } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { handleValidationErrors } from '../middlewares/validation';

const router = Router();

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty()
], register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], login);

router.post('/google', googleAuth);
router.post('/phone', phoneAuth);
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

export default router;
