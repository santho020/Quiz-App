# BrainBuzz Quiz Arena

BrainBuzz Quiz Arena is a full-stack quiz platform with a dark game-style UI, timed play, AI-generated questions, leaderboard tracking, profile stats, and Gmail-based password recovery.

## What It Does

- Mission Selection with 4 quiz types:
  - General Study
  - Current Affairs
  - Sports
  - Mixed Quiz
- AI-powered custom quiz generation from uploaded files
- Timed gameplay with per-question countdown
- Quiz review with correct and wrong answer highlighting
- Player profile with score and answer-time statistics
- Global leaderboard
- Register, login, forgot password, and reset password flow
- Dockerized backend, frontend, and MongoDB

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, bcrypt
- Mail: Nodemailer with Gmail SMTP
- AI: Ollama locally for quiz generation
- DevOps: Docker, Docker Compose, GitHub Actions

## Project Structure

```text
quiz-app/
  backend/
    src/
      app.js
      server.js
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
    test/
    Dockerfile
    .env
  frontend/
    src/
      App.jsx
      main.jsx
      components/
      hooks/
      pages/
      utils/
    test/
  tests/
    e2e/
  docker-compose.yml
  .github/workflows/ci-cd.yml
```

## Features

### Authentication

- Register with unique username and Gmail
- Login using username or Gmail
- Password visibility toggle on login and register
- Forgot password email reset flow
- Reset password page with visible password option

### Quiz Modules

- Mission Selection: play the 4 main quiz categories
- Customize: upload files and generate a quiz from extracted content
- Leaderboard: view top player scores
- Profile: view username, email, score, quizzes completed, average score, and average answer time

### Gameplay

- AI-generated questions
- Option order is shuffled so the correct answer is not always in the same position
- Questions do not repeat in the same session easily because generation uses variation and history checks
- Timer ends the quiz when the final answer is selected
- Final review shows correct answers in green and wrong answers in red

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- Docker Desktop
- MongoDB if you want to run outside Docker
- Ollama installed locally if you want AI generation

### Run With Docker

From the repo root:

```bash
docker compose -f docker-compose.yml up --build -d
```

This starts:

- Frontend on `http://localhost:5173`
- Backend on `http://localhost:5000`
- MongoDB on `mongodb://localhost:27017`

To stop everything:

```bash
docker compose -f docker-compose.yml down
```

### Run Without Docker

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Set these in `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/quizapp
JWT_SECRET=your_secret
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_gmail_app_password
MAIL_FROM=yourgmail@gmail.com
```

If you are using Docker, the backend container connects to the Docker Mongo service automatically.

## Testing

### Unit Tests

Run from the repo root:

```bash
npm run test:backend
npm run test:frontend
```

### Selenium E2E

Install Python dependencies:

```bash
python -m pip install -r tests/e2e/requirements.txt
```

Run the smoke test:

```bash
npm run test:e2e
```

The Selenium test expects the Docker stack to be running locally.

## GitHub CI/CD

The workflow in [`.github/workflows/ci-cd.yml`](/c:/Users/ADMIN/Pictures/Quiz-app/.github/workflows/ci-cd.yml) is designed to run this pipeline:

1. Backend unit tests
2. Frontend unit tests and build
3. Docker image build
4. Selenium E2E smoke test
5. Deploy stage placeholder for your Docker host

To make deployment real, replace the placeholder deploy step with your actual target, such as:

- SSH into a Docker VPS and run `docker compose up -d`
- Push images to Docker Hub or GHCR and pull them on the server

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`
- `GET /api/auth/profile`

### Quiz

- `GET /api/quiz/list`
- `GET /api/quiz/:quizId`
- `POST /api/quiz/generate`
- `POST /api/quiz/generate-from-files`
- `POST /api/quiz/submit`
- `GET /api/quiz/leaderboard`
- `GET /api/quiz/user-rank`

## Notes

- The old local MongoDB users were migrated into Docker MongoDB so existing accounts continue to work.
- The app uses Gmail SMTP for password reset emails, so make sure the Gmail app password is valid.
- Ollama runs locally and is used for AI quiz generation without a paid API.

## Contributing

1. Create a branch
2. Make your changes
3. Run tests
4. Commit and push
5. Open a pull request

