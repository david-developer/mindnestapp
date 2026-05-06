# MindNest — Technical Documentation

**Version:** 1.0 (Prototype)  
**Last Updated:** May 2026  
**Author:** David Enow Abunaw

This document provides a comprehensive technical reference for the MindNest application. It is intended for developers who want to understand the architecture, contribute to the codebase, or extend the system.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Database Schema](#2-database-schema)
3. [API Reference](#3-api-reference)
4. [AI Safety Architecture](#4-ai-safety-architecture)
5. [Authentication Flow](#5-authentication-flow)
6. [Frontend Architecture](#6-frontend-architecture)
7. [State Management Patterns](#7-state-management-patterns)
8. [Progressive Web App](#8-progressive-web-app)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Development Workflow](#10-development-workflow)
11. [Known Limitations](#11-known-limitations)

---

## 1. System Architecture

### High-Level Overview

MindNest follows a **classic three-tier architecture** with a clear separation between presentation, business logic, and data layers. The system is designed as a monorepo with two independently deployable applications.

```
┌──────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│  React + Vite (PWA) — deployed on Vercel                │
│  Components · Pages · Hooks · Context                    │
└─────────────────────┬────────────────────────────────────┘
                      │ HTTPS · JSON · JWT Bearer
                      ▼
┌──────────────────────────────────────────────────────────┐
│                BUSINESS LOGIC LAYER                      │
│  Express.js + Node.js — deployed on Railway             │
│  Routes · Controllers · Middleware · Utils              │
└─────────────────────┬────────────────────────────────────┘
                      │
       ┌──────────────┴──────────────┐
       ▼                             ▼
┌──────────────────┐         ┌──────────────────┐
│   DATA LAYER     │         │  EXTERNAL AI     │
│  PostgreSQL      │         │  OpenRouter API  │
│  9 tables        │         │  GPT-OSS-120B    │
│  (Railway)       │         │                  │
└──────────────────┘         └──────────────────┘
```

### Repository Structure

```
mindnestapp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # PostgreSQL pool with SSL conditional
│   │   ├── controllers/                 # Business logic per domain
│   │   │   ├── authController.js
│   │   │   ├── moodController.js
│   │   │   ├── journalController.js
│   │   │   ├── aiController.js
│   │   │   ├── circleController.js
│   │   │   └── counselorController.js
│   │   ├── routes/                      # Express routers
│   │   ├── middleware/
│   │   │   └── authMiddleware.js        # JWT verification
│   │   ├── utils/
│   │   │   ├── crisisDetection.js       # Layer 1 keyword filter
│   │   │   └── aiPrompts.js             # System + classifier prompts
│   │   ├── db/
│   │   │   ├── migrate.js               # Idempotent table creation
│   │   │   └── seedCounselors.js        # Sample counselor data
│   │   └── index.js                     # Express entry point
│   ├── .env                             # Local secrets (gitignored)
│   └── package.json
│
├── frontend/
│   ├── public/                          # Static assets
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   ├── icon-512-maskable.png
│   │   ├── apple-touch-icon.png
│   │   └── favicon.ico
│   ├── src/
│   │   ├── pages/                       # Route components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Journal.jsx
│   │   │   ├── Insights.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Circle.jsx
│   │   │   └── Counselors.jsx
│   │   ├── components/
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── InstallPrompt.jsx
│   │   │   └── dashboard/               # Dashboard-specific
│   │   │       ├── Header.jsx
│   │   │       ├── BottomNav.jsx
│   │   │       ├── MoodCheckIn.jsx
│   │   │       ├── WeeklySparkline.jsx
│   │   │       ├── ProgressRewards.jsx
│   │   │       ├── ResourcesHelp.jsx
│   │   │       ├── AIReflection.jsx
│   │   │       ├── CrisisCard.jsx
│   │   │       └── CounselorNudge.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Global auth state
│   │   ├── api/
│   │   │   └── axios.js                 # Configured axios instance
│   │   ├── index.css                    # Tailwind directives
│   │   ├── custom.css                   # Slider styles + reduced motion
│   │   └── main.jsx
│   ├── vite.config.js                   # Vite + PWA configuration
│   ├── .env.local                       # VITE_API_URL (gitignored)
│   └── package.json
│
├── docker-compose.yml                   # Local PostgreSQL
└── README.md
```

### Design Principles

- **Separation of concerns**: Routes route, controllers orchestrate, utilities encapsulate logic
- **Stateless backend**: All session state in JWT; backend can scale horizontally
- **Idempotent migrations**: All `CREATE TABLE` statements use `IF NOT EXISTS` so deploys are safe to re-run
- **Defense in depth for AI**: Three independent safety layers, each catching different threat types
- **Progressive enhancement**: Web app works without JavaScript for landing pages; PWA features layer on top

---

## 2. Database Schema

### Entity-Relationship Overview

```
users ──┬── mood_checkins (1:N)
        ├── journal_entries (1:N)
        ├── friendships (M:N self-referencing)
        ├── mood_shares (1:N)
        ├── mood_share_hides (M:N to mood_shares)
        ├── counselor_requests (M:N to counselors)
        └── nudge_dismissals (1:N)

counselors ── counselor_requests (1:N)
```

### Table Definitions

#### `users`
Primary user account table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing user ID |
| name | VARCHAR(100) | NOT NULL | Display name |
| email | VARCHAR(150) | UNIQUE NOT NULL | Login identifier |
| password | TEXT | NOT NULL | bcrypt hash with salt rounds = 10 |
| date_of_birth | DATE | NULL | Optional, for future age-based features |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |

#### `mood_checkins`
Core mood tracking events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | |
| user_id | INTEGER | REFERENCES users(id) ON DELETE CASCADE | Owner |
| mood_value | INTEGER | NOT NULL, CHECK (BETWEEN 1 AND 6) | 6-point discrete scale |
| tags | TEXT[] | NULL | Free-form tags (e.g., 'exam', 'tired') |
| note | TEXT | NULL | Free-text context for AI |
| created_at | TIMESTAMP | DEFAULT NOW() | Check-in time |

**Mood scale interpretation:**
- 1 = Struggling
- 2 = Low
- 3 = Okay
- 4 = Good
- 5 = Happy
- 6 = Amazing

#### `journal_entries`
Long-form personal entries with optional mood association.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | |
| user_id | INTEGER | REFERENCES users(id) ON DELETE CASCADE | Owner |
| title | TEXT | NULL | Optional entry title |
| content | TEXT | NOT NULL | Entry body |
| checkin_id | INTEGER | REFERENCES mood_checkins(id) ON DELETE SET NULL | Optional link |
| mood_value | INTEGER | CHECK (BETWEEN 1 AND 6) | Mood at time of writing |
| created_at | TIMESTAMP | DEFAULT NOW() | |

#### `friendships`
Bidirectional friend relationships with state machine.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | |
| requester_id | INTEGER | REFERENCES users(id) ON DELETE CASCADE | Sender of request |
| addressee_id | INTEGER | REFERENCES users(id) ON DELETE CASCADE | Recipient |
| status | VARCHAR(20) | NOT NULL DEFAULT 'pending', CHECK ('pending', 'accepted', 'rejected') | State |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | Updated on accept/reject |
| UNIQUE | (requester_id, addressee_id) | Prevents duplicate requests | |

**State transitions:** `pending → accepted` or `pending → rejected`. No reverse transitions.

#### `mood_shares`
Snapshot of a mood shared with the user's circle. Intentionally NOT a foreign key to `mood_checkins` — see "Architectural Decisions" section.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | |
| user_id | INTEGER | REFERENCES users(id) ON DELETE CASCADE | Sharer |
| mood_value | INTEGER | NOT NULL, CHECK (BETWEEN 1 AND 6) | Snapshot at share time |
| message | TEXT | NULL | Optional context message |
| created_at | TIMESTAMP | DEFAULT NOW() | |

#### `mood_share_hides`
Per-viewer soft hide of friend's shares.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | |
| user_id | INTEGER | REFERENCES users(id) ON DELETE CASCADE | The viewer |
| share_id | INTEGER | REFERENCES mood_shares(id) ON DELETE CASCADE | The hidden share |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| UNIQUE | (user_id, share_id) | Prevents duplicate hides | |

#### `counselors`
Static directory of mental health professionals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | |
| name | VARCHAR(150) | NOT NULL | Full name with title |
| title | VARCHAR(150) | NULL | Professional title |
| specializations | TEXT[] | NULL | e.g., ['anxiety', 'exam stress'] |
| languages | TEXT[] | NULL | e.g., ['Turkish', 'English'] |
| bio | TEXT | NULL | Short biography |
| email | VARCHAR(150) | NULL | Contact email |
| phone | VARCHAR(50) | NULL | Contact phone |
| location | VARCHAR(150) | NULL | City and country |
| accepting_new | BOOLEAN | DEFAULT TRUE | Accepting new clients |
| avatar_color | VARCHAR(20) | DEFAULT '#3AA76D' | UI accent color |
| created_at | TIMESTAMP | DEFAULT NOW() | |

#### `counselor_requests`
Student-initiated contact requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | |
| user_id | INTEGER | REFERENCES users(id) ON DELETE CASCADE | Student |
| counselor_id | INTEGER | REFERENCES counselors(id) ON DELETE CASCADE | Target counselor |
| message | TEXT | NULL | Optional request message |
| status | VARCHAR(20) | NOT NULL DEFAULT 'pending', CHECK ('pending', 'contacted', 'closed') | |
| created_at | TIMESTAMP | DEFAULT NOW() | |

#### `nudge_dismissals`
Rate-limit table for the AI counselor nudge.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | |
| user_id | INTEGER | REFERENCES users(id) ON DELETE CASCADE | Who dismissed |
| created_at | TIMESTAMP | DEFAULT NOW() | When |

### Architectural Decisions

**Why mood shares are snapshots, not foreign keys to mood_checkins:**

If we referenced the original check-in via FK, deleting your private check-in would also delete what your friends already saw. By storing the value at share time, the user's private data and what was intentionally shared decouple over time. This respects user agency and prevents retroactive removal of social context.

**Why the 6-point discrete mood scale:**

A continuous 0-100 slider invites false precision ("I feel 67% today"). The 6-point scale matches how people actually describe their moods linguistically (Struggling, Low, Okay, Good, Happy, Amazing) and is matched by a database `CHECK` constraint to prevent invalid values.

**Why `IF NOT EXISTS` everywhere:**

Migrations run on every deploy via Railway's Pre-Deploy Command. Idempotency means safe re-runs without errors when tables already exist.

---

## 3. API Reference

### Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://mindnestapp-production-2fd6.up.railway.app/api`

### Authentication

All protected endpoints require a JWT in the `Authorization` header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Endpoints

#### Auth Domain (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | No | Create user, returns JWT |
| POST | `/login` | No | Authenticate, returns JWT |
| GET | `/me` | Yes | Get current user info |
| GET | `/profile` | Yes | Get user info + aggregate stats |

**Signup request:**
```json
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secure_password",
  "date_of_birth": "2002-05-15"
}
```

**Signup response (201):**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

#### Mood Domain (`/api/mood`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/checkin` | Yes | Save new mood check-in |
| GET | `/checkins` | Yes | All user's check-ins |
| GET | `/weekly` | Yes | Last 7 days with daily averages |
| GET | `/streak` | Yes | Current streak + total count |
| GET | `/insights` | Yes | Aggregated analytics bundle |
| GET | `/nudge` | Yes | Whether to show counselor nudge |
| POST | `/nudge/dismiss` | Yes | Dismiss nudge (rate-limit 7 days) |

**Insights response shape:**
```json
{
  "monthly": [{ "day": "...", "avg_mood": 3.5, "checkin_count": 2 }],
  "topTags": [{ "tag": "exam", "count": 12 }],
  "activity": [{ "day_of_week": 1, "count": 5, "avg_mood": 3.2 }],
  "stats": { "total_checkins": 24, "overall_avg": 3.7 }
}
```

#### Journal Domain (`/api/journal`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/entry` | Yes | Create entry |
| GET | `/entries` | Yes | All entries (newest first) |
| DELETE | `/entry/:id` | Yes | Delete entry (only owner) |

#### AI Domain (`/api/ai`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reflect` | Yes | Generate reflection from mood + tags + note |
| POST | `/reflect-journal` | Yes | Deep reflection on full journal entry |

**Reflect request:**
```json
{
  "mood_value": 2,
  "tags": ["exam", "tired"],
  "note": "Had a tough exam today, can't shake the disappointment"
}
```

**Reflect response (safe):**
```json
{
  "isCrisis": false,
  "reflection": "Hearing how hard this exam felt..."
}
```

**Reflect response (crisis detected):**
```json
{
  "isCrisis": true,
  "reflection": null
}
```

#### Circle Domain (`/api/circle`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search?email=` | Yes | Search users by email substring |
| POST | `/request` | Yes | Send friend request |
| PUT | `/request/:id` | Yes | Accept/reject (body: { action }) |
| GET | `/friends` | Yes | All accepted friends |
| GET | `/requests` | Yes | Pending requests addressed to me |
| POST | `/share` | Yes | Share a mood snapshot |
| GET | `/feed` | Yes | Friends' shares (last 7 days) |
| GET | `/my-shares` | Yes | My own shares |
| DELETE | `/share/:id` | Yes | Hard-delete my share |
| POST | `/feed/hide/:id` | Yes | Soft-hide a friend's share from my feed |

#### Counselors Domain (`/api/counselors`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | List counselors with optional filters (specialization, language, accepting_only) |
| GET | `/:id` | Yes | Single counselor details |
| POST | `/request` | Yes | Send contact request |
| GET | `/my-requests` | Yes | My contact requests with counselor info joined |

---

## 4. AI Safety Architecture

### Three-Layer Crisis Detection

```
User Input
    │
    ▼
┌─────────────────────────────┐
│  Layer 1: Keyword Filter    │  Fast, no AI cost
│  ~15 explicit phrases       │  Catches obvious cases
└──────────┬──────────────────┘
           │ pass
           ▼
┌─────────────────────────────┐
│  Layer 2: Semantic AI       │  ~30 tokens, low temp 0.1
│  Classifier prompt          │  Catches subtle distress
│  Returns binary JSON        │  Fail-safe: defaults to safe
└──────────┬──────────────────┘
           │ pass
           ▼
┌─────────────────────────────┐
│  Reflection Generation       │
│  Main system prompt          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Layer 3: Output Filter     │  Same keyword scan as L1
│  Catches AI leakage         │  on the AI's response
└──────────┬──────────────────┘
           │
           ▼
       User sees
    Reflection or
     Crisis Card
```

### Layer 1 — Keyword Pre-filter

**Location:** `backend/src/utils/crisisDetection.js`

A static list of unambiguous crisis phrases (suicide, self-harm, kill myself, etc.). Implemented as case-insensitive substring matching for speed. **Never calls the AI** — runs in microseconds.

```js
const containsCrisisLanguage = (text) => {
  if (!text) return false
  const lowered = text.toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lowered.includes(keyword))
}
```

**Trade-off:** Will miss euphemisms and contextual distress. Acceptable because Layer 2 handles those.

### Layer 2 — Semantic AI Classifier

**Location:** `backend/src/utils/aiPrompts.js` (`CLASSIFIER_PROMPT`)

A separate, focused AI call that judges contextual distress. The prompt is engineered to:
- Have a single binary task (no reflection generation, no advice)
- Return JSON only (parseable, deterministic)
- Run at low temperature (0.1) for consistency
- Distinguish normal sadness from crisis-level content

**Failure mode handling:** If the AI errors or returns unparseable output, the system **defaults to safe** (treats input as non-crisis). This matches the principle that we'd rather miss a borderline case than block a stressed student from any support.

### Layer 3 — Output Filter

After the AI generates a reflection, the same Layer 1 keyword scan runs on **the AI's output**. This catches the rare case where the model echoes crisis language despite the system prompt forbidding it.

### System Prompt Constraints

The main reflection prompt explicitly forbids:
- Diagnosing mental illness
- Recommending medication or dosages
- Claiming to be a therapist, doctor, or counselor
- Referencing suicide, self-harm, or crisis topics directly

And requires:
- Warmth and validation
- 1-2 gentle coping suggestions
- Brief format (under 80-100 words depending on context)
- Direct second-person address ("you")

### Smart Counselor Nudge

A separate behavioral safety mechanism that detects sustained low-mood patterns and suggests professional support.

**Trigger paths (any one fires):**
1. Three consecutive days at mood ≤ 2
2. Five of the last 7 days at mood ≤ 2
3. Today is 1 (Struggling) AND previous day was ≤ 2

**Rate-limit:** After dismissal, 7-day silence before re-evaluating.

**Implementation:** Pure SQL aggregation in `getNudgeStatus` controller. No AI involved — deterministic and fast.

---

## 5. Authentication Flow

### Sign Up Sequence

```
Frontend                Backend                Database
   │                       │                      │
   │  POST /signup         │                      │
   ├──────────────────────>│                      │
   │  { email, password }  │                      │
   │                       │                      │
   │                       │ bcrypt.hash(pw, 10)  │
   │                       │                      │
   │                       │ INSERT users         │
   │                       ├─────────────────────>│
   │                       │                      │
   │                       │ jwt.sign({userId})   │
   │                       │                      │
   │  { token, user }      │                      │
   │<──────────────────────┤                      │
   │                       │                      │
   │ localStorage.setItem  │                      │
   │   ('token', token)    │                      │
```

### Authenticated Request Flow

```
Frontend                Backend
   │                       │
   │ axios interceptor     │
   │ adds Bearer token     │
   │                       │
   │  GET /api/...         │
   ├──────────────────────>│
   │  Auth: Bearer ...     │
   │                       │
   │                       │ protect middleware
   │                       │ jwt.verify(token)
   │                       │ req.user = { userId }
   │                       │
   │                       │ controller logic
   │                       │
   │  { data }             │
   │<──────────────────────┤
```

### Token Storage

**Current (prototype):** `localStorage.setItem('token', jwt)`

**Trade-off accepted:** Simpler implementation. Vulnerable to XSS if any third-party script is compromised.

**Production recommendation:** httpOnly cookies with CSRF tokens. Mentioned in known limitations.

---

## 6. Frontend Architecture

### Routing Structure

```jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />

  <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
  <Route path="/journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
  <Route path="/insights" element={<PrivateRoute><Insights /></PrivateRoute>} />
  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
  <Route path="/circle" element={<PrivateRoute><Circle /></PrivateRoute>} />
  <Route path="/counselors" element={<PrivateRoute><Counselors /></PrivateRoute>} />
</Routes>
```

`PrivateRoute` is a guard component that checks `AuthContext` for a valid token. If absent, redirects to `/login`.

### Component Hierarchy (Dashboard)

```
Dashboard
├── Header                  (greeting, streak, navigation icons)
├── InstallPrompt           (PWA install banner, dismissible)
├── MoodCheckIn             (hero card — slider, tags, note, share toggle)
│     └─ triggers AI flow
├── CrisisCard              (conditional, when isCrisis: true)
├── AIReflection            (conditional, with typewriter + actions)
├── CounselorNudge          (conditional, mood pattern trigger)
├── WeeklySparkline         (recharts area chart)
├── ProgressRewards         (streak ring + 8 badges)
├── ResourcesHelp           (static crisis lines)
└── BottomNav               (5 tab navigation)
```

### Design System

**Color palette:**
- Background: `#FBFBFD`
- Primary green: `#3AA76D`
- Sky: `#88C0F7`
- Gold: `#F5A623`
- Crisis red: `#ef4444`
- Muted text: `#253244`

**Mood-to-color mapping (1-6):**
- 1 → `#ef4444` (red)
- 2 → `#f97316` (orange)
- 3 → `#eab308` (yellow)
- 4 → `#84cc16` (lime)
- 5 → `#22c55e` (green)
- 6 → `#3AA76D` (deep green)

**Spacing & shape:**
- Rounded corners 12-18px
- Soft shadows with subtle backdrop blur
- Bottom-sheet modals (slide up from bottom)
- Gradient accents (linear-gradient(135deg, #3AA76D, #88C0F7))

---

## 7. State Management Patterns

### Why No Redux

For a prototype this size, Redux is overkill. We use:
- **`useState` and `useEffect`** for component-local state
- **React Context** (`AuthContext`) for global auth state
- **Prop drilling** for short chains (max 2 levels)
- **`refreshKey` counter** for cross-component data refresh

### The `refreshKey` Pattern

When `MoodCheckIn` submits, multiple components need to refetch their data:
- `Header` (streak count)
- `WeeklySparkline` (mood data)
- `ProgressRewards` (streak + badges)
- `CounselorNudge` (re-evaluate triggers)

**Pattern:**

```jsx
// Parent component
const [refreshKey, setRefreshKey] = useState(0)

const triggerRefresh = () => setRefreshKey(prev => prev + 1)

// Pass triggerRefresh down to MoodCheckIn
// Pass refreshKey down to all data-dependent components

// In each consumer:
useEffect(() => {
  fetchData()
}, [refreshKey])  // re-runs when key changes
```

This avoids both prop drilling of state and over-engineered global state.

### Optimistic Updates

For actions where the user expects instant feedback (delete, hide), we update local state immediately and let the API call complete in the background:

```jsx
const handleHide = async (shareId) => {
  // Optimistic — remove from UI instantly
  setFeed(prev => prev.filter(f => f.id !== shareId))
  // Then fire API call
  try {
    await API.post(`/circle/feed/hide/${shareId}`)
  } catch (err) {
    // Could rollback here if needed
  }
}
```

---

## 8. Progressive Web App

### Configuration

**Plugin:** `vite-plugin-pwa`

**Manifest:**
- Name: MindNest
- Short name: MindNest
- Display mode: standalone (no browser UI when installed)
- Theme color: #3AA76D
- Icons: 192px, 512px, 512px maskable
- Orientation: portrait

### Service Worker Strategies

**Static assets (CacheFirst):**
- Images, fonts, icons
- 30-day expiration
- Up to 60 entries cached

**API responses (NetworkFirst):**
- Try network first (5-second timeout)
- Fall back to cache when offline
- 1-day expiration
- Up to 50 entries cached

### Install Prompt

A custom React component (`InstallPrompt.jsx`) listens for the browser's `beforeinstallprompt` event and presents a styled banner instead of relying on the browser's subtle install icon.

State management:
- `localStorage` flag remembers dismissal across sessions
- Hides if app is already installed (`display-mode: standalone` media query)
- Banner appears 3 seconds after first dashboard load to avoid bombarding new users

---

## 9. Deployment Architecture

### Frontend → Vercel

- **Build:** Vite produces optimized static files in `dist/`
- **Hosting:** Edge CDN with global distribution
- **HTTPS:** Automatic via Let's Encrypt
- **Auto-deploy:** On every push to `main` branch
- **Environment variables:** `VITE_API_URL` baked in at build time

### Backend → Railway

- **Build:** `npm install` runs in `/backend` subdirectory
- **Pre-deploy command:** `npm run migrate` (idempotent table creation)
- **Start command:** `npm start` (which runs `node src/index.js`)
- **Port:** Railway sets `PORT=8080` via env var
- **Auto-deploy:** On every push to `main` branch
- **Environment variables:** Set via Railway dashboard
  - `OPENROUTER_API_KEY`
  - `OPENROUTER_MODEL`
  - `JWT_SECRET`
  - `NODE_ENV=production`
  - `DATABASE_URL` (auto-injected by Railway PostgreSQL service)

### Database → Railway PostgreSQL

- Provisioned as a separate service in the same Railway project
- Connection string available as `DATABASE_URL`
- SSL required (handled via `ssl: { rejectUnauthorized: false }` in `db.js`)

### CORS Configuration

The backend explicitly allows the Vercel domain:

```js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mindnest-omega.vercel.app',
  ],
  credentials: true,
}))
```

---

## 10. Development Workflow

### Local Setup Reference

See README.md for full setup instructions.

### Making Changes

```bash
# 1. Create feature branch (optional for solo)
git checkout -b feature/whatever

# 2. Make changes locally
# 3. Test locally with both servers running

# 4. Commit
git add .
git commit -m "feat: description"

# 5. Push
git push origin main  # or feature branch

# 6. Vercel + Railway auto-deploy
```

### Migration Workflow

When adding a new database table or column:

1. Add `ALTER TABLE` or `CREATE TABLE IF NOT EXISTS` to `backend/src/db/migrate.js`
2. Run `npm run migrate` locally to test
3. Commit and push
4. Railway runs migrations automatically on deploy via Pre-Deploy Command

### Adding an Endpoint

1. Add controller function in appropriate `*Controller.js`
2. Add route in matching `routes/*.js`
3. Test with Thunder Client locally
4. Update API reference in this document

---

## 11. Known Limitations

### Security & Privacy

- **Token storage in localStorage** — vulnerable to XSS. Production should use httpOnly cookies + CSRF tokens.
- **No rate limiting** — production should rate-limit auth endpoints (signup/login/reset) and AI endpoints.
- **No input sanitization beyond parameterized queries** — Postgres prevents SQL injection but stored content is rendered as-is. XSS in user-generated content is possible if React's default escaping is bypassed.

### AI

- **Crisis detection is keyword + classifier hybrid, not full ML** — false negatives possible for novel framings.
- **AI latency 2-5 seconds** on free tier OpenRouter — affects UX for impatient users.
- **No conversation memory** — each AI call is stateless. Future work: per-user context window.

### Operational

- **No automated tests** — manual testing only. Production code should have unit/integration tests.
- **No CI/CD pipeline** — relies on Vercel/Railway auto-deploy on push.
- **No monitoring or error tracking** — production should add Sentry or equivalent.
- **No logging strategy** — only `console.log` for development.

### Functional Scope

- **No counselor portal** — counselors receive contact requests via email/phone outside the app. Designed for prototype evaluation.
- **No notification system** — daily reminders, friend share alerts, streak milestones are planned but not implemented.
- **iOS PWA install** — Safari requires manual "Add to Home Screen" instruction; no programmatic install prompt.
- **Streak calculation uses server time** — not normalized for user's timezone.

### Data

- **No data export** — users cannot download their journal/mood data.
- **No data deletion** — account deletion is supported via DB cascade but no UI flow.
- **No backup strategy** — relies on Railway's managed Postgres backups.

---

## Appendix A: Environment Variables Reference

### Backend
| Name | Required | Description |
|------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs (long random string) |
| `OPENROUTER_API_KEY` | Yes | API key from openrouter.ai |
| `OPENROUTER_MODEL` | No | Defaults to `openai/gpt-oss-120b:free` |
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Defaults to 5000; Railway sets to 8080 |

### Frontend
| Name | Required | Description |
|------|----------|-------------|
| `VITE_API_URL` | Yes | Full base URL of the backend API |

---

## Appendix B: Common Issues

### "Cannot find module 'pg'"
Run `npm install` in the `backend/` directory.

### "ECONNREFUSED 127.0.0.1:5432"
PostgreSQL container isn't running. Start it: `docker-compose up -d`

### "relation 'users' does not exist"
Migrations haven't run. Execute: `npm run migrate` from backend directory.

### CORS errors on production
Verify the production frontend URL is included in the backend's CORS origins array.

### Vite build picks up wrong API URL
Vite bakes env vars at build time. After changing `VITE_API_URL`, rebuild: `npm run build`.

---

End of Technical Documentation.
