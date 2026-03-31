import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selectedOptionIndex: Number,
      isCorrect: Boolean,
      points: Number
    }
  ],
  totalScore: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },  // in seconds
  completedAt: { type: Date, default: Date.now }
});

export default mongoose.model('QuizResult', quizResultSchema);
