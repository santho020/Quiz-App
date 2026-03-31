import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI, getApiErrorMessage } from '../../utils/api.js';

export default function RegisterForm({ onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);

    try {
      const resp = await authAPI.register(form);
      onAuth(resp.data);
      navigate('/');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    }
  }

  return (
    <div className="auth-arena min-h-screen px-4 py-8">
      <div className="auth-orb auth-orb-left"></div>
      <div className="auth-orb auth-orb-right"></div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="auth-card auth-card-wide mx-auto w-full max-w-5xl rounded-[32px] p-0">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="auth-side-panel p-8 md:p-10">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">New Player</p>
            <p className="mt-3 text-2xl font-black text-white">BrainBuzz Quiz Arena</p>
            <h2 className="mt-4 text-4xl font-black text-white">Create Your Account</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">Claim your username, attach your Gmail for recovery, and get your first arena run started.</p>

            <div className="mt-8 space-y-4">
              <div className="feature-panel">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Security</p>
                <p className="mt-2 text-lg font-semibold text-white">Gmail-backed password recovery</p>
              </div>
              <div className="feature-panel">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Progress</p>
                <p className="mt-2 text-lg font-semibold text-white">Scores and quizzes tracked to your profile</p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <form onSubmit={submit} className="space-y-4">
              <input value={form.username} onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))} placeholder="Username" className="auth-input w-full rounded-2xl px-4 py-4 text-white" required />
              <input type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="Gmail address" className="auth-input w-full rounded-2xl px-4 py-4 text-white" required />
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} placeholder="Password" className="auth-input w-full rounded-2xl px-4 py-4 pr-16 text-white" required />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-sm text-slate-300">Password must include uppercase, lowercase, number, symbol, and be at least 8 characters.</p>
              {error && <div className="text-sm text-rose-300">{error}</div>}
              <button type="submit" className="w-full rounded-2xl bg-cyan-400 py-4 font-bold text-slate-950 shadow-[0_16px_30px_rgba(34,211,238,0.22)] transition-transform hover:-translate-y-0.5">Register</button>
            </form>

            <p className="mt-6 text-sm text-slate-300">Already have an account? <Link to="/login" className="font-semibold text-cyan-300 underline decoration-cyan-300/60 underline-offset-4">Log in</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
