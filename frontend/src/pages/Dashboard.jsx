import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authAPI, quizAPI, setAuthToken } from '../utils/api.js';
import QuizList from '../components/quiz/QuizList.jsx';
import QuizGame from '../components/quiz/QuizGame.jsx';
import QuizResults from '../components/quiz/QuizResults.jsx';
import Leaderboard from '../components/leaderboard/Leaderboard.jsx';
import AIQuizGenerator from '../components/quiz/AIQuizGenerator.jsx';

const modules = [
  { id: 'missions', label: 'Mission Selection' },
  { id: 'customize', label: 'Customize' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'profile', label: 'Profile' }
];

export default function Dashboard({ user, logout }) {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'results'
  const [activeModule, setActiveModule] = useState('missions');
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [result, setResult] = useState(null);
  const [generatingMissionId, setGeneratingMissionId] = useState('');
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('quizapp_token');
    if (token) setAuthToken(token);
  }, []);

  useEffect(() => {
    if (!user) return;

    authAPI.getProfile()
      .then((response) => setProfileData(response.data))
      .catch((error) => console.error('Profile load failed:', error));
  }, [user, result]);

  async function handleSelectQuiz(mission) {
    setGeneratingMissionId(mission.id);

    try {
      const response = await quizAPI.generateQuiz({
        topic: mission.topic,
        category: mission.category,
        difficulty: mission.difficulty,
        questionCount: mission.questionCount,
        variationHint: `${mission.id}-${Date.now()}`
      });

      setSelectedQuizId(response.data.quiz._id);
      setGameState('playing');
    } catch (error) {
      console.error('Mission generation failed:', error);
    } finally {
      setGeneratingMissionId('');
    }
  }

  function handleQuizComplete(result) {
    setResult(result);
    setGameState('results');
  }

  function handleRetry() {
    setGameState('menu');
    setSelectedQuizId(null);
    setResult(null);
  }

  function handleGeneratedQuiz(quiz) {
    setSelectedQuizId(quiz._id);
    setGameState('playing');
  }

  function renderMenuModule() {
    if (activeModule === 'customize') {
      return <AIQuizGenerator onGenerated={handleGeneratedQuiz} />;
    }

    if (activeModule === 'leaderboard') {
      return <Leaderboard currentUserId={user.id} />;
    }

    if (activeModule === 'profile') {
      const recentResults = profileData?.recentResults || [];
      const stats = profileData?.stats;
      const profileUser = profileData?.user || user;

      return (
        <div className="leaderboard-card rounded-[30px] p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Profile</p>
              <h2 className="mt-2 text-3xl font-black text-white">Player Profile</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-100">Live Account</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="feature-panel">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Username</p>
              <p className="mt-2 text-2xl font-black text-white">{profileUser.username}</p>
            </div>
            <div className="feature-panel">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Current Score</p>
              <p className="mt-2 text-2xl font-black text-lime-300">{profileUser.score}</p>
            </div>
            <div className="feature-panel">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Email</p>
              <p className="mt-2 text-lg font-semibold text-white">{profileUser.email || 'Not available'}</p>
            </div>
            <div className="feature-panel">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Quizzes Completed</p>
              <p className="mt-2 text-2xl font-black text-white">{profileUser.quizzesCompleted || 0}</p>
            </div>
            <div className="feature-panel">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Average Recent Score</p>
              <p className="mt-2 text-2xl font-black text-cyan-200">{stats?.averageScore || 0}</p>
            </div>
            <div className="feature-panel">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Average Answer Time</p>
              <p className="mt-2 text-2xl font-black text-cyan-200">{stats?.averageAnswerTime || 0}s</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Recent Quiz History</p>
            <div className="mt-4 space-y-3">
              {recentResults.length === 0 && (
                <div className="feature-panel">
                  <p className="text-sm text-slate-300">No recent quiz history yet. Start a mission to build your profile stats.</p>
                </div>
              )}

              {recentResults.map((entry) => (
                <div key={entry.id} className="feature-panel flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-white">{entry.quizTitle}</p>
                    <p className="mt-1 text-sm text-slate-300">{entry.category} • {new Date(entry.completedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-200">
                    <span>Score: <strong>{entry.totalScore}</strong></span>
                    <span>Correct: <strong>{entry.correctCount}</strong></span>
                    <span>Wrong: <strong>{entry.wrongCount}</strong></span>
                    <span>Time: <strong>{entry.timeTaken}s</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return <QuizList onSelectQuiz={handleSelectQuiz} generatingMissionId={generatingMissionId} />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="arena-shell min-h-screen px-4 py-6 md:px-8">
      <div className="arena-pattern"></div>
      <div className="arena-overlay arena-overlay-left"></div>
      <div className="arena-overlay arena-overlay-right"></div>
      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <div className="arena-hero rounded-[34px] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-cyan-300">Player Hub</p>
              <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">Welcome, {user.username}</h1>
              <p className="mt-4 text-base text-slate-200">Current Score: <span className="font-black text-lime-300">{user.score}</span></p>
            </div>
            <button onClick={logout} className="rounded-2xl bg-rose-500 px-6 py-4 font-bold text-white shadow-[0_18px_40px_rgba(244,63,94,0.25)] transition-transform hover:-translate-y-0.5">
              Logout
            </button>
          </div>
        </div>

        {gameState === 'menu' && (
          <div className="leaderboard-card rounded-[28px] p-3 md:p-4">
            <div className="flex flex-wrap gap-3">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                    activeModule === module.id
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_16px_30px_rgba(34,211,238,0.22)]'
                      : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {module.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'menu' && (
          <div className="grid grid-cols-1 gap-6">
            {renderMenuModule()}
          </div>
        )}

      {gameState === 'playing' && (
        <QuizGame quizId={selectedQuizId} onComplete={handleQuizComplete} />
      )}

      {gameState === 'results' && (
        <QuizResults result={result} onRetry={handleRetry} />
      )}
      </div>
    </motion.div>
  );
}
