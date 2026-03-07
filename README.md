# BetterMe MVP 🏃

> Your Life Balance Dashboard — track personal goals across Daily, Weekly, and Monthly horizons.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + Tailwind CSS + Framer Motion |
| State | Zustand (persisted) |
| Backend/DB | Supabase (Auth, Postgres, RLS) |
| Icons | Lucide React |
| Platform | Mobile-first PWA |

## Getting Started

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Enable **Google** and **Magic Link** auth providers in Authentication → Providers
4. Copy your project URL and anon key

### 2. Environment Variables

```bash
cp .env.example .env.local
# Fill in your Supabase URL and anon key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── dashboard/   # ProgressRing
│   ├── goals/       # GoalCard, ReflectModal
│   ├── ui/          # BottomNav, FAB, Toast
│   └── wizard/      # HorizonWizard (3-step goal creation)
├── lib/
│   ├── constants.js # Categories, templates, frequencies
│   └── supabase.js  # Supabase client
├── pages/
│   ├── Auth.jsx      # Google + Magic Link login
│   ├── Home.jsx      # Pulse Dashboard
│   ├── History.jsx   # Heatmap + Journal
│   ├── Onboarding.jsx
│   └── Settings.jsx
├── store/
│   └── useStore.js   # Zustand store
└── App.jsx
supabase/
└── schema.sql        # Full DB schema with RLS
```

## Features (MVP)

- ✅ Google Sign-In + Magic Link (no passwords)
- ✅ Onboarding — workday setup + morning reminder
- ✅ Horizon Wizard — 3-step goal creation with smart templates
- ✅ Pulse Dashboard — Today's Stack + Progress Rails
- ✅ Quick Complete — one-tap with animation
- ✅ Reflect Loop — optional micro-journal after completion
- ✅ Streak counter + Milestone toasts
- ✅ History — Heatmap + searchable Journal
- ✅ Goal management — edit, archive, delete
- ✅ Settings — workdays + reminder time
- ✅ 6 life categories (Digital Zen Coming Soon)

## Agent Workflow

```
PM (PRD.md) ✅ → Designer (DESIGN.md) ✅ → Developer ← here → QA → PM Sign-off
```
