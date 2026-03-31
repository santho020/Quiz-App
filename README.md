# Neon Quiz Arena 🎮

A modern, gaming-style competitive quiz web application with real-time scoring, leaderboards, and timer-based challenges.

## Features

✅ **Authentication**
- Register & Login with bcrypt-hashed passwords
- JWT token-based sessions

✅ **Quiz System**
- 4 predefined quizzes (Science, History, Sports, Current Events)
- 20 questions per quiz with 4 options each
- 20-second countdown timer per question
- Auto-advance to next question when time runs out

✅ **Scoring System**
- Correct answer: +10 points
- Wrong answer: -5 points
- Scores persist in database

✅ **Leaderboard**
- Top 50 global players ranked by score
- Real-time score updates
- Current user highlighted

✅ **UI/UX**
- Dark gaming theme with neon accents
- Smooth transitions (Framer Motion)
- Fully responsive design
- Glowing effects and animations

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **DevOps**: Docker + Docker Compose

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Docker)
- npm

### Installation

1. **Clone the repo** (if using git):
```bash
git clone <repo-url>
cd quiz-app
```

2. **Install dependencies**:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Set up environment variables**:
```bash
# backend/.env
cp .env.example .env
# Edit .env and update MONGO_URI if needed
```

4. **Seed the database**:
```bash
cd backend
npm run seed
```

### Running Locally

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

3. **Open browser**: `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (requires token)

### Quiz
- `GET /api/quiz/list` - Get all quizzes
- `GET /api/quiz/:quizId` - Get quiz with questions
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/leaderboard` - Get top 50 players
- `GET /api/quiz/user-rank` - Get current user's rank

## Database Schema

**Users**
- username (unique)
- password (hashed)
- score
- quizzesCompleted

**Quizzes**
- title
- category (Subject, History, Sports, Current Events, Mixed)
- questionCount
- isCustom

**Questions**
- quizId (reference to Quiz)
- text
- options (array of 4)
- correctOptionIndex
- order

**QuizResults**
- userId (reference to User)
- quizId (reference to Quiz)
- answers (array with selectedOptionIndex, isCorrect, points)
- totalScore
- correctCount
- wrongCount
- timeTaken

## Docker Deployment

```bash
cd docker
docker-compose up -d
```

This will start:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173`
- MongoDB on `mongodb://localhost:27017`

## File Structure

```
quiz-app/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth middleware
│   │   ├── config/           # Database config
│   │   ├── utils/            # Helpers & seeders
│   │   ├── app.js            # Express setup
│   │   └── server.js         # Server entry
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page-level components
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # API helpers
│   │   ├── contexts/         # React contexts
│   │   ├── styles/           # Global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
└── docker/
    └── docker-compose.yml
```

## Testing

1. Register: Username + Password
2. Select a quiz from the list
3. Answer questions (timer ticks down)
4. View your score and stats
5. Check global leaderboard

## Next Steps

- [ ] Custom quiz generation from PDF/DOCX
- [ ] Achievements & badges
- [ ] Social features (challenge friends)
- [ ] Quiz history & analytics
- [ ] Mobile app
- [ ] WebSocket for real-time multiplayer

## Contributing

1. Create a branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push: `git push origin feature/your-feature`
4. Open a Pull Request

## License

MIT

---

**Happy Quizzing!** 🎉
