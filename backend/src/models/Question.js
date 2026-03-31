import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],  // Array of 4 options
  correctOptionIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, default: '' },
  order: { type: Number, required: true }
});

export default mongoose.model('Question', questionSchema);
