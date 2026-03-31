import { AnimatePresence, motion } from 'framer-motion';
import useTimer from '../../hooks/useTimer.js';

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  answerState,
  locked,
  onTickWarning,
  onAnswer,
  onTimeUp
}) {
  const { seconds } = useTimer(30, onTimeUp, question._id, locked);
  const timePercentage = (seconds / 30) * 100;
  const timerColor = seconds <= 5 ? 'from-rose-500 to-orange-500' : 'from-cyan-400 to-lime-400';
  const urgent = seconds <= 5 && !answerState;
  const feedbackLabel = answerState?.status === 'correct'
    ? 'Correct!'
    : answerState?.status === 'wrong'
      ? 'Wrong answer'
      : answerState?.status === 'timeout'
        ? 'Time up'
        : '';

  function getAnswerClass(idx) {
    if (!answerState) {
      return 'border-cyan-300/25 bg-slate-950/50 hover:border-emerald-400 hover:bg-emerald-400/10';
    }

    if (answerState.correctOptionIndex === idx) {
      return 'border-emerald-400/70 bg-emerald-400/15 text-emerald-100 shadow-[0_0_28px_rgba(74,222,128,0.14)]';
    }

    if (answerState.selectedOptionIndex === idx && answerState.status === 'wrong') {
      return 'border-rose-400/70 bg-rose-400/15 text-rose-100 shadow-[0_0_28px_rgba(251,113,133,0.16)]';
    }

    if (answerState.status === 'timeout') {
      return 'border-slate-700 bg-slate-900/45 opacity-70';
    }

    return 'border-slate-700 bg-slate-900/45 opacity-70';
  }

  if (urgent) {
    onTickWarning?.(seconds);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -18, scale: 0.98 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className={`question-stage rounded-[30px] p-6 md:p-8 ${urgent ? 'question-stage-urgent' : ''}`}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Arena Question</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Question {questionNumber} of {totalQuestions}</h3>
        </div>
        <div className={`timer-panel ${urgent ? 'timer-panel-urgent' : ''}`}>
          <div className={`timer-ring bg-gradient-to-r ${timerColor}`} style={{ width: `${timePercentage}%` }}></div>
          <span className={`relative text-2xl font-black ${seconds <= 5 ? 'text-rose-300' : 'text-cyan-200'}`}>{seconds}s</span>
        </div>
      </div>

      <h2 className="mb-6 text-2xl font-black text-white md:text-3xl">{question.text}</h2>

      {feedbackLabel && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] ${
          answerState.status === 'correct'
            ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
            : answerState.status === 'wrong'
              ? 'border-rose-400/40 bg-rose-400/10 text-rose-100'
              : 'border-amber-300/40 bg-amber-300/10 text-amber-100'
        }`}>
          {feedbackLabel}
        </motion.div>
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {question.options.map((option, idx) => (
            <motion.button
              key={`${question._id}-${idx}`}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, delay: idx * 0.04 }}
              whileHover={locked ? undefined : { scale: 1.02 }}
              onClick={() => onAnswer(idx)}
              disabled={locked}
              className={`quiz-answer w-full rounded-[22px] border p-4 text-left font-semibold text-white transition-all ${locked ? 'cursor-default' : 'hover:-translate-y-0.5'} ${getAnswerClass(idx)}`}
            >
              <span className={`mr-3 inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                answerState?.correctOptionIndex === idx
                  ? 'border-emerald-400/70 bg-emerald-400/15 text-emerald-200'
                  : answerState?.selectedOptionIndex === idx && answerState?.status === 'wrong'
                    ? 'border-rose-400/70 bg-rose-400/15 text-rose-200'
                    : 'border-cyan-300/60 bg-cyan-300/10 text-cyan-200'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="align-middle">{option}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
