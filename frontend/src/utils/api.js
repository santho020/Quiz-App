import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
});

export function getApiErrorMessage(error, fallbackMessage) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === 'ERR_NETWORK') {
    return 'Cannot reach the backend server. Start the backend on port 5000 and try again.';
  }

  return fallbackMessage;
}

export function setAuthToken(token) {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
}

export const quizAPI = {
  getQuiz: (quizId) => API.get(`/quiz/${quizId}`),
  generateQuiz: (payload) => API.post('/quiz/generate', payload),
  generateQuizFromFiles: (formData) => API.post('/quiz/generate-from-files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  submitQuiz: (quizId, answers, timeTaken) =>
    API.post('/quiz/submit', { quizId, answers, timeTaken }),
  getLeaderboard: () => API.get('/quiz/leaderboard'),
  getUserRank: () => API.get('/quiz/user-rank')
};

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (credentials) => API.post('/auth/register', credentials),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
  getProfile: () => API.get('/auth/profile')
};
