import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import QuizResult from '../models/QuizResult.js';
import { isMailConfigured, sendPasswordResetEmail } from '../utils/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isStrongPassword(password) {
  return PASSWORD_RULE.test(password);
}

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, Gmail, and password are required' });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const usernameRegex = new RegExp(`^${escapeRegex(normalizedUsername)}$`, 'i');

    const existing = await User.findOne({
      $or: [{ username: usernameRegex }, { email: normalizedEmail }]
    });
    if (existing?.username && existing.username.toLowerCase() === normalizedUsername.toLowerCase()) {
      return res.status(409).json({ message: 'Username has already been taken. Please choose a new username.' });
    }
    if (existing?.email === normalizedEmail) {
      return res.status(409).json({ message: 'Gmail already exists' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Enter a valid Gmail address' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.'
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ username: normalizedUsername, email: normalizedEmail, password: hashed });
    await user.save();

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    return res.status(201).json({
      user: { id: user._id, username: user.username, email: user.email, score: user.score },
      token
    });
  } catch (error) {
    console.error('Register error', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
}

export async function login(req, res) {
  try {
    const { identifier, username, password } = req.body;
    const lookup = (identifier || username || '').trim();
    if (!lookup || !password) {
      return res.status(400).json({ message: 'Username or Gmail and password are required' });
    }

    const usernameRegex = new RegExp(`^${escapeRegex(lookup)}$`, 'i');
    const user = await User.findOne({
      $or: [
        { username: usernameRegex },
        { email: lookup.toLowerCase() }
      ]
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    return res.json({
      user: { id: user._id, username: user.username, email: user.email, score: user.score },
      token
    });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}

export async function forgotPassword(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Gmail is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If that Gmail exists, a reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendBaseUrl.replace(/\/$/, '')}/reset-password/${rawToken}`;
    await sendPasswordResetEmail(user.email, user.username, resetUrl);

    if (!isMailConfigured()) {
      return res.json({
        message: 'Email is not configured on this local project yet. Use the reset link below.',
        resetUrl
      });
    }

    return res.json({ message: 'If that Gmail exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error', error);
    return res.status(500).json({ message: 'Server error during password reset request' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.'
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: 'Password updated successfully. You can log in now.' });
  } catch (error) {
    console.error('Reset password error', error);
    return res.status(500).json({ message: 'Server error during password reset' });
  }
}

export async function getProfile(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { _id, username, email, score, quizzesCompleted, createdAt } = req.user;
    const recentResults = await QuizResult.find({ userId: _id })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('quizId', 'title category');

    const stats = recentResults.reduce((acc, result) => {
      acc.totalCorrect += result.correctCount || 0;
      acc.totalWrong += result.wrongCount || 0;
      acc.totalTime += result.timeTaken || 0;
      return acc;
    }, { totalCorrect: 0, totalWrong: 0, totalTime: 0 });

    const averageScore = recentResults.length
      ? Math.round(recentResults.reduce((sum, result) => sum + (result.totalScore || 0), 0) / recentResults.length)
      : 0;
    const totalAnswered = recentResults.reduce((sum, result) => sum + (result.correctCount || 0) + (result.wrongCount || 0), 0);
    const averageAnswerTime = totalAnswered > 0
      ? Number((stats.totalTime / totalAnswered).toFixed(1))
      : 0;

    return res.json({
      user: {
        id: _id,
        username,
        email,
        score,
        quizzesCompleted,
        createdAt
      },
      stats: {
        averageScore,
        averageAnswerTime
      },
      recentResults: recentResults.map((result) => ({
        id: result._id,
        quizTitle: result.quizId?.title || 'AI Quiz',
        category: result.quizId?.category || 'Mixed',
        totalScore: result.totalScore || 0,
        correctCount: result.correctCount || 0,
        wrongCount: result.wrongCount || 0,
        timeTaken: result.timeTaken || 0,
        completedAt: result.completedAt
      }))
    });
  } catch (error) {
    console.error('Get profile error', error);
    return res.status(500).json({ message: 'Unable to load profile' });
  }
}
