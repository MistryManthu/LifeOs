# HumanOS 🧠

> A persistent life intelligence system powered by a Guardian Agent.
> Not a chatbot. Not a task manager. A system that understands who you are, what you want, and what's actually holding you back.

---

## Vision

Most tools manage tasks. HumanOS manages the human.

It remembers your goals, tracks your behavior, detects the gap between who you say you are and who your actions show you to be — and helps you close that gap.

---

## Architecture

```
React Frontend (Vite + Tailwind)
        │
        ▼
Express API (Node.js)
        │
        ▼
Guardian Pipeline
   ├── Memory Retrieval
   ├── Blueprint Context
   ├── Pattern Context
   ├── Guardian Reasoning (Claude / OpenAI)
   └── Memory Update (async)
        │
        ▼
PostgreSQL (via Prisma)
```

---

## Core Entities

| Entity | Purpose |
|---|---|
| `HumanBlueprint` | Who you are — identity, values, psychology, goals, constraints |
| `Memory` | Typed, persistent memory graph (facts → patterns → reflections) |
| `Pattern` | Detected behavior patterns + value gap tracking |
| `DailyLog` | Morning check-in + evening review |
| `WeeklyReview` | AI-generated weekly analysis |
| `AgentInsight` | Guardian's reasoning output — stored for transparency |
| `LifeEvent` | Major life moments that shape the person |

---

## Guardian Pipeline

Every interaction flows through:
```
User Action → Load Context → Guardian Reasons → Response → Memory Update
```

The Guardian never responds without first loading:
- Blueprint (who they are)
- Active memories (what it knows)
- Patterns (what it has detected)
- Recent logs (current state)

---

## AI Providers

Switch between Claude and OpenAI with one env variable:
```
AI_PROVIDER=claude   # uses Anthropic Claude Sonnet
AI_PROVIDER=openai   # uses GPT-4o
```

---

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **AI**: Claude (Anthropic) / GPT-4o (OpenAI) — switchable
- **Auth**: JWT
- **Hosting**: Vercel (frontend) + Railway (backend)

---

## Getting Started

```bash
# Clone
git clone https://github.com/MistryManthu/LifeOs
cd LifeOs

# Backend
cd server
cp ../.env.example .env   # fill in your values
npm install
npm run db:generate
npm run db:migrate
npm run dev

# Frontend
cd ../client
npm install
npm run dev
```

---

## Sprint Roadmap

| Sprint | Focus |
|---|---|
| Sprint 0 | Foundation (current) — schema, Guardian pipeline, routes |
| Sprint 1 | Onboarding — Human Blueprint flow |
| Sprint 2 | Daily Engine — morning + evening check-ins |
| Sprint 3 | Weekly Review + Bottleneck Detection |
| Sprint 4 | Memory Viewer — user sees what Guardian knows |
| Sprint 5 | Pattern Detection + Value Gap alerts |
| Sprint 6 | Life Score + Domain Dashboard |
| Sprint 7 | Coach Chat + Guardian conversation |

---

## HumanOS Constitution

1. HumanOS serves the user — not advertisers, not employers
2. User owns their data — export, delete, correct at any time
3. No hidden profiling — every conclusion is explainable
4. HumanOS advises, user decides — always
5. Never shame — observations, not judgments
6. Direction over daily success — failing today ≠ failing overall
7. The goal is stronger humans, not dependent users

---

*Built by Manthu — a software engineer, son, gym person, and aspiring founder juggling it all.*
*This system was built for people like him.*
