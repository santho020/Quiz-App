import express from 'express';
import {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { authGuard } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', authGuard, getProfile);

export default router;
