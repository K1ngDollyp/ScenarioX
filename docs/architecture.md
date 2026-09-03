# ScenarioX Architecture Specification

**Formal Title:** ScenarioX: An AI-Powered Scenario Simulation and Decision Support Platform  
**Tagline:** Simulate Decisions. Understand Outcomes.  
**Core Engineering Principle:** The AI interprets. The mathematics calculates.

---

## 1. Executive Summary & Design System

ScenarioX is designed as a mathematical simulation platform with an AI reasoning and explanation layer. The system strictly separates natural language interpretation from numerical execution.

### Key Principles:
1. **Un-hallucinated Math**: The LLM is prohibited from calculating revenue, profit, probabilities, Monte Carlo statistics, or optimization output.
2. **AI Independence**: The mathematical engine works completely offline or without an AI API key.
3. **Data Ownership & RLS**: All models, scenarios, and simulations are isolated per user via Supabase Auth and PostgreSQL RLS.
4. **Immutable Snapshots**: Simulation runs store an exact snapshot of model variables, values, units, currencies, and scenario parameters.

---

## 2. System Layers

```text
       ┌─────────────────────────────────────────────────┐
       │             Frontend Layer                      │
       │ Next.js 15+ (App Router), TypeScript, Tailwind, │
       │ Supabase Auth SDK, Recharts visualizers         │
       └────────────────────────┬────────────────────────┘
                                │
                                ▼
       ┌─────────────────────────────────────────────────┐
       │             FastAPI REST API Layer              │
       │ Pydantic v2 validation, JWT Auth middleware,    │
       │ Resource ownership checking                     │
       └────────────────────────┬────────────────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
┌───────────────────────────┐               ┌───────────────────────────┐
│     AI Service Layer      │               │     Simulation Engine     │
│ Natural language parsing  │               │ Pure Python, NumPy, SciPy │
│ Missing input detection   │               │ Baseline & elasticity     │
│ Ambiguity handling        │               │ Monte Carlo engine        │
│ Result explanation        │               │ Sensitivity analysis      │
│ Pydantic schema validation│               │ SciPy Optimizer           │
└───────────────────────────┘               └─────────────┬─────────────┘
                                                          │
                                                          ▼
                                            ┌───────────────────────────┐
                                            │      Database Layer       │
                                            │ PostgreSQL + SQLAlchemy   │
                                            │ Row Level Security (RLS)  │
                                            └───────────────────────────┘
```

---

## 3. Technology Stack

- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.x Async, asyncpg, PostgreSQL, NumPy, SciPy, pandas, scikit-learn, pytest, httpx.
- **Frontend**: Next.js 15+, TypeScript, Tailwind CSS, Supabase Auth JS SDK, Lucide Icons, Recharts.
- **Database**: PostgreSQL with UUID primary keys and Supabase RLS.
