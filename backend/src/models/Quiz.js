import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Subject', 'Current Events', 'History', 'Sports', 'Mixed'],
    default: 'Mixed'
  },
  description: { type: String, default: '' },
  questionCount: { type: Number, default: 20 },
  isCustom: { type: Boolean, default: false },
  creatorId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Quiz', quizSchema);
