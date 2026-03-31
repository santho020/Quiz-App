import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginForm from './components/auth/LoginForm.jsx';
import RegisterForm from './components/auth/RegisterForm.jsx';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm.jsx';
import ResetPasswordForm from './components/auth/ResetPasswordForm.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LandingPage from './pages/LandingPage.jsx';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('quizapp_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  function handleAuth(data) {
    setUser(data.user);
    localStorage.setItem('quizapp_user', JSON.stringify(data.user));
    localStorage.setItem('quizapp_token', data.token);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('quizapp_user');
    localStorage.removeItem('quizapp_token');
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <Routes>
          <Route path="/" element={user ? <Dashboard user={user} logout={logout} /> : <LandingPage />} />
          <Route path="/login" element={<LoginForm onAuth={handleAuth} />} />
          <Route path="/register" element={<RegisterForm onAuth={handleAuth} />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
