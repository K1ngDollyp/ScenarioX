# ScenarioX Deployment Guide

---

## 1. Production Architecture

- **Frontend**: Vercel (Next.js 15+ App Router)
- **Backend API**: Render / Railway / AWS ECS (FastAPI + Uvicorn)
- **Database**: Supabase PostgreSQL (with RLS policies enabled)
- **Auth**: Supabase Auth

---

## 2. Environment Variables Matrix

### Backend (`.env`)
```text
DATABASE_URL=postgresql+asyncpg://<user>:<pass>@<host>:5432/<db>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_JWT_SECRET=<supabase-jwt-secret>
AI_PROVIDER=gemini
AI_API_KEY=<key>
PORT=8000
ENVIRONMENT=production
```

### Frontend (`.env.production`)
```text
NEXT_PUBLIC_API_URL=https://api.scenariox.com/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```
