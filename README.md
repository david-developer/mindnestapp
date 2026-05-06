# MindNest 🌱

> An AI-Enhanced Mental Wellbeing Companion App for University Students

MindNest is a progressive web application that combines mood tracking, journaling, AI-generated reflections, and peer support to help university students develop emotional self-awareness and access professional support when needed.

Built as a graduation thesis at **Üsküdar University**, this prototype explores how AI can responsibly augment student wellbeing without replacing human care.

---

## ✨ Features

### Core Wellbeing
- **Daily Mood Check-ins** — 6-point mood scale with tags and optional context notes
- **AI Reflections** — Contextual, supportive responses powered by GPT-OSS-120B
- **Journaling** — Mood-coded entries with writing prompts and AI reflect-on-entry
- **Insights Dashboard** — 30-day mood trends, top tags, day-of-week activity, mood distribution
- **Progress & Rewards** — Streak tracking and 8 unlockable badges

### Social & Support
- **Mood Circle** — Share moods with trusted friends; full sender/viewer privacy controls
- **Counselor Directory** — Browse 8 seeded mental health professionals with filters and contact requests
- **Smart AI Nudge** — Detects sustained low-mood patterns and suggests professional support
- **Crisis Resources** — Always-available Turkish and international support lines

### Safety-First AI
- **Three-layer crisis detection** — Keyword pre-filter, semantic AI classifier, output scan
- **Constrained system prompts** — AI never diagnoses, prescribes, or claims clinical authority
- **Graceful handoff** — AI redirects to human counselors when appropriate

### Progressive Web App
- Installable on mobile and desktop
- Works offline (cached static assets and recent API responses)
- Custom install prompt with one-week dismissal memory

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS v3
- Framer Motion (animations)
- Lucide React (icons)
- Recharts (data visualization)
- vite-plugin-pwa (installability)

**Backend**
- Node.js + Express
- PostgreSQL (Docker for development)
- JWT authentication + bcryptjs
- OpenAI SDK (via OpenRouter gateway)

**Infrastructure**
- Frontend deployed on Vercel
- Backend + database deployed on Railway
- Docker Compose for local PostgreSQL

---

## 📐 Architecture

```
┌─────────────────────────────────────────┐
│         React PWA (Vercel)              │
│  Vite + Tailwind + Framer Motion        │
└─────────────┬───────────────────────────┘
              │ HTTPS + JWT
              ▼
┌─────────────────────────────────────────┐
│       Express API (Railway)             │
│  Routes → Controllers → DB Pool         │
│  Auth Middleware · Crisis Detection     │
└─────────────┬───────────────────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
┌──────────────┐  ┌────────────────────┐
│  PostgreSQL  │  │  OpenRouter API    │
│  (Railway)   │  │  GPT-OSS-120B      │
│  9 tables    │  │  Two AI use cases  │
└──────────────┘  └────────────────────┘
```

**9 database tables**: users, mood_checkins, journal_entries, friendships, mood_shares, mood_share_hides, counselors, counselor_requests, nudge_dismissals

**30+ API endpoints** across 6 domains: auth, mood, journal, AI, circle, counselors

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- Docker Desktop
- Git
- An OpenRouter API key (free tier: openrouter.ai)

### Local Setup

**1. Clone the repo**
```bash
git clone https://github.com/david-developer/mindnestapp.git
cd mindnestapp
```

**2. Start PostgreSQL via Docker**
```bash
docker-compose up -d
```

**3. Backend setup**
```bash
cd backend
npm install
cp .env.example .env  # then edit .env with your values
npm run migrate       # creates tables
npm run seed:counselors  # seeds 8 sample counselors
npm run dev           # starts on port 5000
```

**4. Frontend setup**
```bash
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
npm run dev           # starts on port 5173
```

**5. Visit** `http://localhost:5173`

### Environment Variables

**Backend (`backend/.env`)**
```
DATABASE_URL=postgresql://engineerdavid:bigengineer@localhost:5432/mindnest
JWT_SECRET=your_long_random_secret_here
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openai/gpt-oss-120b:free
NODE_ENV=development
PORT=5000
```

**Frontend (`frontend/.env.local`)**
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🔐 AI Safety Architecture

MindNest takes AI safety seriously. The system uses **defense in depth**:

### Layer 1 — Keyword Pre-filter
Fast scan against ~15 explicit crisis phrases. Runs before any AI call. Catches obvious cases instantly.

### Layer 2 — Semantic Classifier
A focused AI call with a strict classifier prompt judges contextual distress. Catches subtle cases keywords miss (e.g., "I don't see the point anymore"). Returns binary JSON.

### Layer 3 — Output Filter
Scans the AI's own generated response for crisis language that may have leaked through.

### System Prompt Constraints
The AI is explicitly forbidden from diagnosing illness, recommending medication, claiming to be a therapist, or referencing crisis topics directly.

### Smart Counselor Nudge
Triggers when mood patterns indicate sustained distress (3 consecutive days ≤ 2, or 5 of 7 days ≤ 2, or recent severe drop). Rate-limited: 7-day silence after dismissal.

---

## 📊 Research Hypotheses

This prototype was designed to evaluate four hypotheses:

- **H1**: Academic stress is the dominant wellbeing challenge for university students
- **H2**: AI-generated reflections will be perceived as supportive and easy to understand
- **H3**: System usability score will exceed 68 (above industry average)
- **H4**: Reward systems (streaks, badges) increase engagement vs. control

The full evaluation pack (consent form, SUS, Likert items, interview prompts) is available in the project documentation.

---

## 🧪 Evaluation

User testing with 15-30 students using:
- System Usability Scale (SUS) — 10 standardized items
- Custom Likert questionnaire — 18 items across 4 constructs
- Semi-structured interview — 10 open-ended prompts

---

## 📚 Documentation

- `TECHNICAL_DOCUMENTATION.md` — full architecture, schema, API reference
- `DEFENSE_PRESENTATION.md` — graduation defense slide outline
- `ENGINEERING_PRINCIPLES.md` — software engineering practices applied

---

## ⚠️ Important Notice

**MindNest is a research prototype, not a clinical tool.** The AI is not a therapist, doctor, or counselor. It is designed to support reflection and direct users to appropriate professional resources when needed.

If you are in crisis, please contact:
- **112** — Emergency / Ambulance (Turkey)
- **183** — Social Support Line (Turkey)
- **741741** — Crisis Text Line (international, text HOME)

---

## 👤 Author

**David Enow Abunaw**
Software Engineering Graduation Project · Üsküdar University · 2026

---

## 📄 License

MIT License — see LICENSE file for details.

---

## 🙏 Acknowledgments

- Thesis supervisor and Üsküdar University Faculty of Engineering
- OpenRouter for free-tier access to GPT-OSS-120B
- The student volunteers who participated in evaluation
