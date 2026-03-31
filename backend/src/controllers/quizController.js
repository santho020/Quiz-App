import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';
import { generateQuizWithAI } from '../utils/aiQuizGenerator.js';
import { extractTextFromFiles } from '../utils/documentTextExtractor.js';

function shuffleQuestionOptions(question) {
  const optionsWithIndex = question.options.map((option, index) => ({
    option,
    index
  }));

  for (let i = optionsWithIndex.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [optionsWithIndex[i], optionsWithIndex[randomIndex]] = [optionsWithIndex[randomIndex], optionsWithIndex[i]];
  }

  return {
    ...question,
    options: optionsWithIndex.map((entry) => entry.option),
    correctOptionIndex: optionsWithIndex.findIndex((entry) => entry.index === question.correctOptionIndex)
  };
}

async function saveGeneratedQuiz({ generated, category, creatorId }) {
  const quiz = await Quiz.create({
    title: generated.title,
    category,
    description: generated.description,
    questionCount: generated.questions.length,
    isCustom: true,
    creatorId
  });

  const questions = generated.questions.map((question, idx) => {
    const shuffledQuestion = shuffleQuestionOptions(question);

    return {
    quizId: quiz._id,
    text: shuffledQuestion.text,
    options: shuffledQuestion.options,
    correctOptionIndex: shuffledQuestion.correctOptionIndex,
    explanation: shuffledQuestion.explanation || '',
    order: idx + 1
    };
  });

  await Question.insertMany(questions);

  return {
    _id: quiz._id,
    title: quiz.title,
    category: quiz.category,
    description: quiz.description,
    questionCount: quiz.questionCount,
    isCustom: quiz.isCustom
  };
}

async function getRecentQuestionHistory({ userId, category }) {
  const quizQuery = { creatorId: userId, isCustom: true };
  if (category && category !== 'Mixed') {
    quizQuery.category = category;
  }

  const recentQuizzes = await Quiz.find(quizQuery)
    .select('_id')
    .sort({ createdAt: -1 })
    .limit(20);

  if (recentQuizzes.length === 0) return [];

  const quizIds = recentQuizzes.map((quiz) => quiz._id);
  const recentQuestions = await Question.find({ quizId: { $in: quizIds } })
    .select('text')
    .limit(200);

  return recentQuestions.map((question) => question.text).filter(Boolean);
}

// Get all quizzes
export async function getQuizzes(req, res) {
  try {
    const quizzes = await Quiz.find()
      .select('_id title category description questionCount isCustom createdAt')
      .sort({ isCustom: -1, createdAt: -1 });
    return res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get quiz with questions
export async function getQuiz(req, res) {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const questions = await Question.find({ quizId }).select('_id text options correctOptionIndex explanation order').sort({ order: 1 });
    return res.json({ quiz, questions });
  } catch (error) {
    console.error('Get quiz error', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Submit quiz answers
export async function submitQuiz(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { quizId, answers, timeTaken } = req.body;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Fetch all questions
    const questions = await Question.find({ quizId });
    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const resultAnswers = [];

    // Grade answers
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = questions.find(q => q._id.toString() === answer.questionId);

      if (!question) continue;

      const isCorrect = answer.selectedOptionIndex === question.correctOptionIndex;
      const points = isCorrect ? 10 : -5;

      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      totalScore += points;
      resultAnswers.push({
        questionId: question._id,
        selectedOptionIndex: answer.selectedOptionIndex,
        isCorrect,
        points
      });
    }

    // Ensure score doesn't go negative
    totalScore = Math.max(totalScore, 0);

    // Save quiz result
    const result = new QuizResult({
      userId,
      quizId,
      answers: resultAnswers,
      totalScore,
      correctCount,
      wrongCount,
      timeTaken: timeTaken || 0
    });
    await result.save();

    // Update user score
    const user = await User.findById(userId);
    user.score = (user.score || 0) + totalScore;
    user.quizzesCompleted = (user.quizzesCompleted || 0) + 1;
    await user.save();

    return res.json({
      result: {
        totalScore,
        correctCount,
        wrongCount,
        timeTaken
      }
    });
  } catch (error) {
    console.error('Submit quiz error', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get leaderboard (top 50 players)
export async function getLeaderboard(req, res) {
  try {
    const leaderboard = await User.find()
      .select('_id username score quizzesCompleted')
      .sort({ score: -1 })
      .limit(50);

    // Add rank
    const withRank = leaderboard.map((user, idx) => ({
      rank: idx + 1,
      id: user._id,
      username: user.username,
      score: user.score,
      quizzesCompleted: user.quizzesCompleted
    }));

    return res.json(withRank);
  } catch (error) {
    console.error('Get leaderboard error', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get user rank and position
export async function getUserRank(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const userId = req.user._id;
    const user = await User.findById(userId).select('username score quizzesCompleted');
    
    const rank = await User.countDocuments({ score: { $gt: user.score } });

    return res.json({
      rank: rank + 1,
      username: user.username,
      score: user.score,
      quizzesCompleted: user.quizzesCompleted
    });
  } catch (error) {
    console.error('Get user rank error', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function generateAIQuiz(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const {
      topic,
      category = 'Mixed',
      difficulty = 'medium',
      questionCount = 10,
      variationHint = ''
    } = req.body;

    if (!topic?.trim()) {
      return res.status(400).json({ message: 'Topic is required to generate a quiz' });
    }

    const safeCount = Math.min(Math.max(Number(questionCount) || 10, 5), 20);
    const excludeQuestionTexts = await getRecentQuestionHistory({
      userId: req.user._id,
      category
    });
    const generated = await generateQuizWithAI({
      topic: topic.trim(),
      category,
      difficulty,
      questionCount: safeCount,
      excludeQuestionTexts,
      variationHint
    });

    const quiz = await saveGeneratedQuiz({
      generated,
      category,
      creatorId: req.user._id
    });

    return res.status(201).json({ quiz });
  } catch (error) {
    console.error('Generate AI quiz error', error);
    return res.status(500).json({
      message: error.message || 'Unable to generate AI quiz right now'
    });
  }
}

export async function generateAIQuizFromFiles(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const {
      topic = '',
      category = 'Mixed',
      difficulty = 'medium',
      questionCount = 10,
      variationHint = ''
    } = req.body;

    const safeCount = Math.min(Math.max(Number(questionCount) || 10, 5), 20);
    const files = Array.isArray(req.files) ? req.files : [];
    const sourceMaterial = await extractTextFromFiles(files);

    if (!sourceMaterial) {
      return res.status(400).json({ message: 'Add at least one supported file with readable text' });
    }

    const excludeQuestionTexts = await getRecentQuestionHistory({
      userId: req.user._id,
      category
    });
    const generated = await generateQuizWithAI({
      topic: topic.trim(),
      category,
      difficulty,
      questionCount: safeCount,
      excludeQuestionTexts,
      sourceMaterial,
      variationHint
    });

    const quiz = await saveGeneratedQuiz({
      generated,
      category,
      creatorId: req.user._id
    });

    return res.status(201).json({ quiz });
  } catch (error) {
    console.error('Generate AI quiz error', error);
    return res.status(500).json({
      message: error.message || 'Unable to generate AI quiz right now'
    });
  }
}
