import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI, getApiErrorMessage } from '../../utils/api.js';

export default function ResetPasswordForm() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await authAPI.resetPassword(token, password);
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to reset password'));
    }
  }

  return (
    <div className="auth-arena min-h-screen px-4 py-8">
      <div className="auth-orb auth-orb-left"></div>
      <div className="auth-orb auth-orb-right"></div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="auth-card mx-auto w-full max-w-3xl rounded-[32px] p-8 md:p-10">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Secure Reset</p>
        <p className="mt-3 text-2xl font-black text-white">BrainBuzz Quiz Arena</p>
        <h2 className="mt-4 text-4xl font-black text-white">Choose A New Password</h2>
        <p className="mt-4 text-base leading-7 text-slate-300">Set a fresh password for your account and head back into the arena with a clean login.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <span>Show password while typing</span>
            <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="h-4 w-4 accent-cyan-400" />
          </label>
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="auth-input w-full rounded-2xl px-4 py-4 text-white" required />
          <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="auth-input w-full rounded-2xl px-4 py-4 text-white" required />
          <p className="text-sm text-slate-300">Password must include uppercase, lowercase, number, symbol, and be at least 8 characters.</p>
          {message && <div className="text-sm text-emerald-300">{message}</div>}
          {error && <div className="text-sm text-rose-300">{error}</div>}
          <button type="submit" className="w-full rounded-2xl bg-cyan-400 py-4 font-bold text-slate-950 shadow-[0_16px_30px_rgba(34,211,238,0.22)] transition-transform hover:-translate-y-0.5">Update Password</button>
        </form>
        <p className="mt-6 text-sm text-slate-300"><Link to="/login" className="font-semibold text-cyan-300 underline decoration-cyan-300/60 underline-offset-4">Back to login</Link></p>
      </motion.div>
    </div>
  );
}
