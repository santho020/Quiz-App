import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { quizAPI } from '../../utils/api.js';

export default function Leaderboard({ currentUserId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizAPI.getLeaderboard()
      .then((res) => setLeaderboard(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Loading leaderboard...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="leaderboard-card rounded-[30px] p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Hall Of Fame</p>
          <h2 className="mt-2 text-3xl font-black text-white">Global Leaderboard</h2>
        </div>
        <div className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-100">Live</div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {leaderboard.map((entry, idx) => {
          const isCurrentUser = entry.id === currentUserId;
          const topRankLabel = idx < 3 ? String(idx + 1) : '';

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center justify-between rounded-[22px] p-4 transition-all ${
                isCurrentUser
                  ? 'border border-cyan-300/60 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 shadow-[0_0_26px_rgba(34,211,238,0.2)]'
                  : 'border border-white/6 bg-slate-900/55'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-lg font-black text-cyan-200">{topRankLabel || entry.rank}</span>
                <div>
                  <p className={`font-semibold ${isCurrentUser ? 'text-cyan-300' : 'text-white'}`}>
                    {entry.username}
                    {isCurrentUser && ' (You)'}
                  </p>
                  <p className="text-xs text-gray-400">{entry.quizzesCompleted} quizzes</p>
                </div>
              </div>
              <span className="text-xl font-bold text-green-400">{entry.score}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
