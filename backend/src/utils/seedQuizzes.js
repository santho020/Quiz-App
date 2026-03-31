import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import { connectDB } from '../config/database.js';
import { generateQuizWithAI } from './aiQuizGenerator.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizapp';

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

async function seedQuizzes() {
  await connectDB(MONGO_URI);

  await Quiz.deleteMany({});
  await Question.deleteMany({});
  console.log('Cleared existing quizzes and questions.\n');

  const quizDefinitions = [
    {
      title: 'General Science Basics',
      category: 'Subject',
      description: 'Test your knowledge of basic science concepts',
      topic: 'General Science Basics',
      difficulty: 'easy',
      questionCount: 5
    },
    {
      title: 'World History',
      category: 'History',
      description: 'Historical events and figures from around the world',
      topic: 'World History',
      difficulty: 'medium',
      questionCount: 5
    },
    {
      title: 'Sports Trivia',
      category: 'Sports',
      description: 'Popular sports questions from around the globe',
      topic: 'Sports Trivia',
      difficulty: 'medium',
      questionCount: 5
    },
    {
      title: 'Current Events 2024',
      category: 'Current Events',
      description: 'Recent news and notable events of 2024',
      topic: 'Current Events and News of 2024',
      difficulty: 'medium',
      questionCount: 5
    }
  ];

  let totalQuestions = 0;

  for (const def of quizDefinitions) {
    console.log(`Generating quiz: "${def.title}"`);

    const generated = await generateQuizWithAI({
      topic: def.topic,
      category: def.category,
      difficulty: def.difficulty,
      questionCount: def.questionCount,
      variationHint: `seed-${def.title}-${Date.now()}`
    });

    const quiz = await Quiz.create({
      title: generated.title || def.title,
      category: def.category,
      description: generated.description || def.description,
      questionCount: generated.questions.length
    });

    const questionsToInsert = generated.questions.map((question, idx) => {
      const shuffledQuestion = shuffleQuestionOptions(question);

      return {
        text: shuffledQuestion.text,
        options: shuffledQuestion.options,
        correctOptionIndex: shuffledQuestion.correctOptionIndex,
        explanation: shuffledQuestion.explanation || '',
        quizId: quiz._id,
        order: idx + 1
      };
    });

    await Question.insertMany(questionsToInsert);
    totalQuestions += questionsToInsert.length;

    console.log(`Saved ${questionsToInsert.length} questions for "${quiz.title}"`);

    // Keep local generation steady when running multiple quiz batches.
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1500));
  }

  console.log(`\nSeeding complete. Created ${quizDefinitions.length} quizzes and ${totalQuestions} questions.`);
  process.exit(0);
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  seedQuizzes().catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}
