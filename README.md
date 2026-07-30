# 🌿 Care Nest — AI Mental Health Triage & Support System

<div align="center">

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq_AI-LLaMA_3.3_70B-F55036?style=for-the-badge)](https://groq.com/)

**Empathetic. Intelligent. Made for India.**

> Care Nest is a full-stack AI-powered mental health companion designed for Indian users — combining real-time distress triage, empathetic AI conversation, mood analytics, guided journaling, and verified crisis resources into one compassionate platform.

[![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-FF9933?style=for-the-badge)](https://github.com/chakratharie-06)
[![Mental Health](https://img.shields.io/badge/For-Mental%20Health%20💚-4CAF50?style=for-the-badge)](https://github.com/chakratharie-06)

</div>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🤖 AI Engine](#-ai-engine)
- [🚨 Crisis & Safety System](#-crisis--safety-system)
- [🗃️ Database Schema](#️-database-schema)
- [🎨 Age-Adaptive Theming](#-age-adaptive-theming)
- [🌍 Indian Mental Health Resources](#-indian-mental-health-resources)
- [🔐 Security & Privacy](#-security--privacy)
- [📊 Analytics & Insights](#-analytics--insights)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [⚠️ Disclaimer](#️-disclaimer)

---

## 🌟 Overview

Care Nest bridges the massive gap in mental health accessibility across India by providing a **free, stigma-free, AI-powered first point of contact** for people in emotional distress. The platform doesn't replace therapists — it acts as a compassionate 24/7 companion that:

- 🧠 **Triages distress severity** in real-time (GREEN / YELLOW / RED)
- 💬 **Holds empathetic AI conversations** powered by LLaMA 3.3 70B / DeepSeek V3
- 📓 **Guides reflective journaling** with mood-aware prompts
- 📊 **Visualizes mental wellness trends** with interactive analytics
- 🆘 **Escalates to verified crisis helplines** instantly when needed
- 🎮 **Provides relaxation mini-games** for immediate stress relief

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🤖 AI Chat Support
- Multi-turn empathetic conversations
- Real-time distress severity scoring (0–100)
- Confidence-weighted triage output
- Culturally aware responses for Indian users
- Automatic fallback across 6 AI model chain

</td>
<td width="50%">

### 🚨 Crisis Triage Engine
- 3-level rubric: **LOW / MEDIUM / HIGH**
- 100+ keyword indicators per distress level
- Instant helpline surfacing (Kiran, iCall, Sneha)
- Structured JSON audit trail per message
- Safety escalation protocol with zero latency

</td>
</tr>
<tr>
<td width="50%">

### 📓 Smart Journal
- Rich-text guided journaling
- Mood-tagged entries
- Sentiment-aware prompts
- Daily reflection streaks
- Private entries per user

</td>
<td width="50%">

### 📊 Wellness Analytics
- Mood trend charts (Recharts)
- Distress heatmaps over time
- Session time tracking
- Assessment score history
- Personalised weekly summaries

</td>
</tr>
<tr>
<td width="50%">

### 🎮 Relaxation Zone
- **Bubble Pop** — mindful popping game
- **Lotus Pond** — calming water ripple
- **Zen Rake** — digital sand garden
- **Star Map** — breathing visualiser
- **Color Ripple** — sensory play
- **Memory Game** — cognitive distraction

</td>
<td width="50%">

### 🧪 Mental Health Assessment
- Standardised self-assessment questionnaire
- Scored results with interpretive feedback
- Historical tracking over sessions
- Recommended next steps per score band
- Admin dashboard for aggregate analytics

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CARE NEST SYSTEM                          │
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────────────────────┐ │
│  │  REACT FRONTEND  │         │        FLASK BACKEND            │ │
│  │  (Vite + React)  │◄───────►│  (Python + SQLAlchemy)          │ │
│  │                  │ REST API │                                 │ │
│  │  ┌────────────┐  │         │  ┌──────────────────────────┐  │ │
│  │  │ Chat Page  │  │         │  │   EnhancedTriageEngine   │  │ │
│  │  │ Mood Track │  │         │  │   LOW / MEDIUM / HIGH    │  │ │
│  │  │ Journal    │  │         │  └──────────┬───────────────┘  │ │
│  │  │ Analytics  │  │         │             │                  │ │
│  │  │ Relax Zone │  │         │  ┌──────────▼───────────────┐  │ │
│  │  │ Assessment │  │         │  │   AI Engine (OpenRouter)  │  │ │
│  │  │ Resources  │  │         │  │   Primary: DeepSeek V3   │  │ │
│  │  │ Admin Dash │  │         │  │   Fallback: LLaMA 3.3    │  │ │
│  │  └────────────┘  │         │  └──────────┬───────────────┘  │ │
│  │                  │         │             │                  │ │
│  │  Age-Adaptive   │         │  ┌──────────▼───────────────┐  │ │
│  │  Theming System │         │  │   SQLite / PostgreSQL    │  │ │
│  └─────────────────┘         │  │   Users, Conversations   │  │ │
│                              │  │   Moods, Journals        │  │ │
│                              │  │   Assessments, TimeLogs  │  │ │
│                              │  └──────────────────────────┘  │ │
│                              └─────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.2 | Core UI framework |
| **Vite** | 5.0 | Build tool & dev server |
| **React Router** | 6.30 | Client-side routing |
| **Framer Motion** | 10.16 | Page transitions & animations |
| **Recharts** | 3.6 | Mood & analytics charts |
| **TailwindCSS** | 3.3 | Utility-first styling |
| **Lucide React** | 0.294 | Icon library |
| **Axios** | 1.13 | HTTP client |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.10+ | Server runtime |
| **Flask** | 2.x | REST API framework |
| **Flask-SQLAlchemy** | — | ORM & database management |
| **Flask-CORS** | — | Cross-origin request handling |
| **PyJWT** | — | JWT authentication tokens |
| **Gunicorn** | — | Production WSGI server |
| **psycopg2** | — | PostgreSQL adapter |

### AI & Intelligence

| Service | Model | Role |
|---|---|---|
| **OpenRouter** | DeepSeek V3 (primary) | Main chat AI |
| **OpenRouter** | LLaMA 3.3 70B (fallback) | Backup AI |
| **Groq** | LLaMA 3.3 70B Versatile | High-speed inference |
| **Custom Engine** | EnhancedTriageEngine | Distress classification |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/chakratharie-06/AI-mental-health-triage-and-support-system.git
cd "AI mental health triage system"
```

### 2. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and fill in your API keys

# Initialize the database
python -c "from app import app, db; app.app_context().__enter__(); db.create_all()"

# Run the development server
python app.py
```

> Backend runs at **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

> Frontend runs at **http://localhost:5173**

### 4. Environment Variables

```env
# backend/.env
OPENROUTER_API_KEY=your_openrouter_api_key   # AI chat engine
GROQ_API_KEY=your_groq_api_key               # High-speed inference
SECRET_KEY=your_long_random_secret           # JWT signing key
DATABASE_URL=postgresql://...                # Production DB (optional)
```

> ⚠️ **Never commit your `.env` file.** It is in `.gitignore` by default.

---

## 📁 Project Structure

```
AI mental health triage system/
│
├── backend/
│   ├── app.py                  # Main Flask app — all REST API routes (1169 lines)
│   ├── models.py               # SQLAlchemy models (User, Conversation, Mood, Journal...)
│   ├── triage_engine.py        # EnhancedTriageEngine — distress classification
│   ├── openrouter_engine.py    # AI engine with 6-model fallback chain
│   ├── resources.py            # Verified Indian mental health resources database
│   ├── auth.py                 # JWT token generation & verification middleware
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment variable template
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.jsx       # Hero landing page
│       │   ├── ChatPage.jsx          # Main AI chat interface
│       │   ├── DashboardPage.jsx     # User dashboard
│       │   ├── MoodTrackingPage.jsx  # Mood logging & tracking
│       │   ├── JournalPage.jsx       # Guided journaling
│       │   ├── RelaxPage.jsx         # Relaxation mini-games
│       │   ├── AnalyticsPage.jsx     # Wellness analytics & charts
│       │   ├── AssessmentPage.jsx    # Mental health self-assessment
│       │   ├── ResourcesPage.jsx     # Crisis helplines & resources
│       │   ├── ProfilePage.jsx       # User profile management
│       │   ├── AdminDashboard.jsx    # Admin analytics panel
│       │   └── AgeSelection.jsx      # Age-based theme onboarding
│       │
│       ├── components/
│       │   ├── BubblePop.jsx         # Bubble pop mini-game
│       │   ├── LotusPond.jsx         # Lotus pond relaxation
│       │   ├── ZenRake.jsx           # Zen garden sand rake
│       │   ├── StarMap.jsx           # Breathing star visualiser
│       │   ├── ColorRipple.jsx       # Color ripple sensory tool
│       │   ├── MemoryGame.jsx        # Cognitive memory game
│       │   ├── DistressChart.jsx     # Real-time distress chart
│       │   └── Navbar.jsx            # Navigation component
│       │
│       ├── context/
│       │   └── AuthContext.jsx       # Global authentication state
│       │
│       └── App.jsx                   # Routes + age-adaptive theme manager
│
├── relaxation-zone.html        # Standalone relaxation page (no login required)
├── test_chatbot.py             # Backend integration tests
└── pytest.ini                  # Test configuration
```

---

## 🤖 AI Engine

### Multi-Model Fallback Chain

Care Nest implements a **resilient AI pipeline** that automatically falls back across models if a primary model fails (rate limit, outage, or error):

```
1. DeepSeek V3  (deepseek/deepseek-chat-v3-0324:free)      ← Primary
2. DeepSeek R1  (deepseek/deepseek-r1-0528:free)           ← Fallback 1
3. LLaMA 3.3 70B (meta-llama/llama-3.3-70b-instruct:free)  ← Fallback 2
4. Gemma 3 27B  (google/gemma-3-27b-it:free)               ← Fallback 3
5. Gemma 3 12B  (google/gemma-3-12b-it:free)               ← Fallback 4
6. Gemma 3 4B   (google/gemma-3-4b-it:free)                ← Fallback 5
```

### AI Safety Design

The AI operates under **strict behavioral constraints** baked into the system prompt:

| Constraint | Description |
|---|---|
| 🚫 No Feature Cross-Leakage | Bot only knows about chat — never references other app pages |
| 🔒 No Hidden Memory | Responses based only on the current conversation history |
| 📦 Structured Format | Acknowledge → Follow-up question → Actionable suggestion |
| 🚨 Crisis Priority | RED severity always surfaces helpline numbers in the first sentence |
| 🌏 Cultural Awareness | Responses tuned for Indian cultural context and norms |

---

## 🚨 Crisis & Safety System

### 3-Level Distress Triage

The `EnhancedTriageEngine` classifies every message using weighted keyword + pattern matching:

```
GREEN  (0–30)   General wellbeing, mild stress
                → Empathetic chat, coping tips

YELLOW (31–69)  Moderate distress, anxiety, persistent sadness
                → Validation, breathing exercises, helpline mention

RED    (70–100) Suicidal ideation, self-harm, acute crisis
                → IMMEDIATE helpline numbers, urge professional help
```

### Integrated Indian Helplines

| Helpline | Number | Availability |
|---|---|---|
| 🏛️ **Tele MANAS** (Government) | `14416` | 24/7 |
| 💚 **Kiran Helpline** | `1800-599-0019` | 24/7 Free |
| 🌸 **Sneha Foundation** | `044-24640050` | 24/7 |
| 📞 **iCall (TISS)** | `9152987821` | Mon–Sat 10am–8pm |
| 🆘 **Vandrevala Foundation** | `1860-266-2345` | 24/7 |
| 🚑 **Emergency Services** | `112` | 24/7 |

---

## 🗃️ Database Schema

```
Users
  id, name, email, age_group, password_hash, is_verified, reset_token, created_at
    │
    ├──► Conversations → Messages
    │      id, user_id, created_at        id, conv_id, role, text, triage_status, distress_level
    │
    ├──► MoodEntries
    │      id, user_id, mood, intensity(1-10), secondary_metric_label, note, created_at
    │
    ├──► JournalEntries
    │      id, user_id, title, content, mood_tag, created_at
    │
    ├──► AssessmentResults
    │      id, user_id, score, answers (JSON), created_at
    │
    └──► TimeLogs
           id, user_id, minutes, created_at
```

Supports both **SQLite** (local dev) and **PostgreSQL** (production) via the `DATABASE_URL` environment variable.

---

## 🎨 Age-Adaptive Theming

Care Nest automatically applies a **different visual theme** based on the user's age group:

| Age Group | Theme Class | Personality |
|---|---|---|
| **18–25** | `theme-student` | Vibrant, energetic, youth-oriented colours |
| **25–45** | `theme-professional` | Clean, minimal, productivity-focused aesthetic |
| **45+** | `theme-senior` | High contrast, larger text, calm palette |
| Not set | `theme-default` | Balanced, welcoming default |

The `ThemeManager` component in `App.jsx` handles this reactively — the theme updates instantly when the user profile changes.

---

## 🌍 Indian Mental Health Resources

The platform maintains a **curated, verified database** of Indian mental health resources:

| Region | Resources Included |
|---|---|
| 🇮🇳 **National** | Tele MANAS, Vandrevala Foundation, iCall (TISS) |
| 🏙️ **Delhi** | Sanjivini Society, AIIMS Psychiatry, Vimhans Classics |
| 🌆 **Maharashtra** | Mumbaikars for MH, KEM Hospital, Connecting NGO (Pune) |
| 🌳 **Karnataka** | NIMHANS Bengaluru, Parivarthan Counseling |
| 🌊 **Tamil Nadu** | Sneha Suicide Prevention, SCARF Chennai |
| 🐯 **West Bengal** | Lifeline Foundation, Antara Kolkata |

All resources include: type (Crisis / NGO / Hospital / Counseling), contact numbers, descriptions, and `verified: true` flag.

---

## 🔐 Security & Privacy

- 🔑 **JWT Authentication** — Stateless token-based auth, signed with `SECRET_KEY`
- 🔒 **Password Hashing** — Werkzeug `generate_password_hash` (bcrypt)
- ✉️ **Email Verification** — New accounts require email confirmation before login
- 🔄 **Password Reset** — Time-limited secure reset tokens via email
- 🛡️ **CORS Hardening** — Configured to only allow `/api/*` routes from any origin
- 🧹 **No Persistent AI Memory** — AI has zero memory across sessions (privacy by design)
- 📦 **Environment Isolation** — All secrets in `.env`, never in source code

---

## 📊 Analytics & Insights

The **Analytics Page** provides users with visual insights into their mental wellness journey:

- 📈 **Mood Trend Line Chart** — Daily mood intensity over time
- 🌡️ **Distress Heatmap** — Weekly distress level patterns
- ⏱️ **Time-on-Platform Tracker** — Session minutes logged per day
- 🧪 **Assessment Score History** — Mental health score progression
- 😊 **Mood Distribution** — Breakdown of emotional states logged

All charts are powered by **Recharts** with smooth animations and responsive layouts.

---

## 🧪 Testing

```bash
# Run backend integration tests
cd backend
python -m pytest ../test_chatbot.py -v

# Test Groq AI integration
python test_groq.py

# Test triage engine
python test_triage.py
```

Test coverage includes:
- ✅ API endpoint integration tests
- ✅ Triage engine keyword classification
- ✅ AI engine response validation
- ✅ Auth flow (register → verify → login → reset)

---

## 🚀 Deployment

### Backend — Render / Railway

1. Set `DATABASE_URL` to a PostgreSQL connection string
2. Set `OPENROUTER_API_KEY`, `GROQ_API_KEY`, `SECRET_KEY` as environment variables
3. Start command: `gunicorn app:app`

### Frontend — Vercel

1. Set `VITE_API_URL` to your deployed backend URL
2. Build command: `npm run build`
3. Output directory: `dist`

---

## ⚠️ Disclaimer

> **Care Nest is an AI-powered emotional support tool — not a substitute for professional mental health care.**
>
> If you or someone you know is in crisis, please contact emergency services (**112**) or a verified helpline immediately.
>
> AI responses are generated by large language models and may not always be accurate. Always consult a licensed mental health professional for diagnosis and treatment.

---

<div align="center">

**Built with 💙 for mental health accessibility across India**

*Because no one should face their darkest moments alone.*

</div>
