import { motion } from 'framer-motion';

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default function Results({ result, onRetry }) {
  const totalAnswered = result.correctCount + result.wrongCount;
  const scorePercentage = totalAnswered > 0 ? (result.correctCount / totalAnswered) * 100 : 0;
  const accuracyTone = scorePercentage >= 70 ? 'text-lime-300' : scorePercentage >= 50 ? 'text-amber-300' : 'text-rose-300';
  const wrongReviewItems = (result.reviewItems || []).filter((item) => !item.isCorrect);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="results-shell rounded-[34px] p-6 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-cyan-300">Round Complete</p>
            <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">Quiz Complete!</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Your run is locked in. Review the round summary, check your accuracy, and jump into the next challenge when you are ready.</p>
          </div>

          <div className="results-score-card rounded-[28px] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Points Earned</p>
            <div className={`mt-4 text-6xl font-black ${accuracyTone}`}>{result.totalScore}</div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-900/70">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-lime-300 to-yellow-300" style={{ width: `${Math.max(scorePercentage, 8)}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="results-stat-card rounded-[26px] p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/75">Correct</p>
            <p className="mt-3 text-4xl font-black text-lime-300">{result.correctCount}</p>
          </div>
          <div className="results-stat-card rounded-[26px] p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/75">Wrong</p>
            <p className="mt-3 text-4xl font-black text-rose-300">{result.wrongCount}</p>
          </div>
          <div className="results-stat-card rounded-[26px] p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/75">Accuracy</p>
            <p className={`mt-3 text-4xl font-black ${accuracyTone}`}>{scorePercentage.toFixed(0)}%</p>
          </div>
          <div className="results-stat-card rounded-[26px] p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/75">Time Taken</p>
            <p className="mt-3 text-4xl font-black text-cyan-100">{formatTime(result.timeTaken)}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <button onClick={onRetry} className="rounded-2xl bg-emerald-400 px-8 py-4 font-bold text-slate-950 shadow-[0_18px_40px_rgba(74,222,128,0.22)] transition-transform hover:-translate-y-0.5">
          Try Another Quiz
        </button>
        <button onClick={() => window.location.href = '/'} className="rounded-2xl border border-white/14 bg-white/6 px-8 py-4 font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10">
          Back to Dashboard
        </button>
      </div>

      <div className="mt-8 rounded-[28px] border border-white/10 bg-slate-950/35 p-5 md:p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Answer Review</p>
        <h3 className="mt-3 text-2xl font-black text-white">Wrong Answers</h3>

        {wrongReviewItems.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">
            All answers were correct in this round.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {wrongReviewItems.map((item, index) => (
              <div key={`${item.questionId}-${index}`} className="rounded-[24px] border border-white/8 bg-slate-900/55 p-5">
                <p className="text-lg font-bold text-white">{item.questionText}</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-rose-400/35 bg-rose-400/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-200">Wrong Answer</p>
                    <p className="mt-2 text-base font-semibold text-rose-100">{item.selectedAnswer}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/35 bg-emerald-400/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Correct Answer</p>
                    <p className="mt-2 text-base font-semibold text-emerald-100">{item.correctAnswer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
