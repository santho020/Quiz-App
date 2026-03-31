import express from 'express';
import multer from 'multer';
import {
  getQuizzes,
  getQuiz,
  submitQuiz,
  getLeaderboard,
  getUserRank,
  generateAIQuiz,
  generateAIQuizFromFiles
} from '../controllers/quizController.js';
import { authGuard } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 20
  }
});

router.get('/list', getQuizzes);
router.get('/leaderboard', getLeaderboard);
router.post('/generate', authGuard, generateAIQuiz);
router.post('/generate-from-files', authGuard, upload.array('documents', 20), generateAIQuizFromFiles);
router.get('/user-rank', authGuard, getUserRank);
router.post('/submit', authGuard, submitQuiz);
router.get('/:quizId', getQuiz);

export default router;
