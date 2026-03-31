import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI, getApiErrorMessage } from '../../utils/api.js';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');

    try {
      const response = await authAPI.forgotPassword(email);
      setMessage(response.data.message);
      setResetUrl(response.data.resetUrl || '');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to send reset email'));
    }
  }

  return (
    <div className="auth-arena min-h-screen px-4 py-8">
      <div className="auth-orb auth-orb-left"></div>
      <div className="auth-orb auth-orb-right"></div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="auth-card mx-auto w-full max-w-3xl rounded-[32px] p-8 md:p-10">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Password Recovery</p>
        <p className="mt-3 text-2xl font-black text-white">BrainBuzz Quiz Arena</p>
        <h2 className="mt-4 text-4xl font-black text-white">Reset With Gmail</h2>
        <p className="mt-4 text-base leading-7 text-slate-300">Enter the Gmail you used during registration and we will send you a secure reset link for your account.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Gmail address" className="auth-input w-full rounded-2xl px-4 py-4 text-white" required />
          {message && <div className="text-sm text-emerald-300">{message}</div>}
          {resetUrl && (
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/8 p-4 text-sm text-cyan-100">
              <p className="font-semibold text-cyan-300">Local reset link</p>
              <a href={resetUrl} className="mt-2 block break-all text-cyan-200 underline decoration-cyan-300/60 underline-offset-4">
                {resetUrl}
              </a>
            </div>
          )}
          {error && <div className="text-sm text-rose-300">{error}</div>}
          <button type="submit" className="w-full rounded-2xl bg-cyan-400 py-4 font-bold text-slate-950 shadow-[0_16px_30px_rgba(34,211,238,0.22)] transition-transform hover:-translate-y-0.5">Send Reset Link</button>
        </form>
        <p className="mt-6 text-sm text-slate-300">Remembered it? <Link to="/login" className="font-semibold text-cyan-300 underline decoration-cyan-300/60 underline-offset-4">Back to login</Link></p>
      </motion.div>
    </div>
  );
}
