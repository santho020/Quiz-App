import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { quizAPI, setAuthToken } from '../../utils/api.js';
import QuestionCard from './QuestionCard.jsx';

const ANSWER_REVEAL_DELAY_MS = 900;

export default function QuizGame({ quizId, onComplete }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const [locked, setLocked] = useState(false);
  const [answerState, setAnswerState] = useState(null);

  const current = questions[currentQuestion];

  useEffect(() => {
    const token = localStorage.getItem('quizapp_token');
    if (token) setAuthToken(token);

    quizAPI.getQuiz(quizId)
      .then(res => {
        setQuiz(res.data.quiz);
        setQuestions(res.data.questions);
        setStartTime(Date.now());
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [quizId]);

  function moveToNextQuestion(nextAnswers) {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((value) => value + 1);
      setAnswerState(null);
      setLocked(false);
      return;
    }

    submitQuiz(nextAnswers);
  }

  function buildReviewItems(finalAnswers) {
    return questions.map((question, index) => {
      const answer = finalAnswers[index];
      const selectedOptionIndex = answer?.selectedOptionIndex ?? -1;
      const correctOptionIndex = question.correctOptionIndex;
      const isCorrect = selectedOptionIndex === correctOptionIndex;

      return {
        questionId: question._id,
        questionText: question.text,
        options: question.options,
        selectedOptionIndex,
        correctOptionIndex,
        selectedAnswer: selectedOptionIndex >= 0 ? question.options[selectedOptionIndex] : 'No answer selected',
        correctAnswer: question.options[correctOptionIndex],
        isCorrect
      };
    });
  }

  function handleAnswer(optionIndex) {
    if (!current || locked) return;

    const correctOptionIndex = current.correctOptionIndex;
    const isTimeout = optionIndex === -1;
    const isCorrect = optionIndex === correctOptionIndex;

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: current._id,
      selectedOptionIndex: optionIndex
    };
    setAnswers(newAnswers);
    setLocked(true);
    setAnswerState({
      selectedOptionIndex: optionIndex,
      correctOptionIndex,
      status: isTimeout ? 'timeout' : isCorrect ? 'correct' : 'wrong'
    });

    if (currentQuestion === questions.length - 1) {
      submitQuiz(newAnswers);
      return;
    }

    window.setTimeout(() => {
      moveToNextQuestion(newAnswers);
    }, ANSWER_REVEAL_DELAY_MS);
  }

  async function submitQuiz(finalAnswers) {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const reviewItems = buildReviewItems(finalAnswers);
    try {
      const res = await quizAPI.submitQuiz(quizId, finalAnswers, timeTaken);
      onComplete({
        ...res.data.result,
        totalQuestions: questions.length,
        reviewItems
      });
    } catch (err) {
      console.error('Submit error:', err);
    }
  }

  if (loading) return <div className="text-center py-8">Loading quiz...</div>;
  if (!quiz || questions.length === 0) return <div className="text-center py-8">Quiz not found</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Progress Bar */}
      <div className="card-neon rounded-lg p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold">{quiz.title}</span>
          <span className="text-sm text-cyan-300">{currentQuestion + 1}/{questions.length}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <QuestionCard
          key={current?._id}
          question={current}
          questionNumber={currentQuestion + 1}
          totalQuestions={questions.length}
          answerState={answerState}
          locked={locked}
          onAnswer={handleAnswer}
          onTimeUp={() => handleAnswer(-1)}
        />
      </AnimatePresence>
    </motion.div>
  );
}
