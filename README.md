# ScenarioX: An AI-Powered Scenario Simulation and Decision Support Platform

> **Simulate Decisions. Understand Outcomes.**  
> **Core Engineering Principle:** The AI interprets. The mathematics calculates.

**ScenarioX** is a production-grade SaaS application designed to allow small business owners, managers, and decision-makers to test decisions numerically before taking action. Built with a strict architectural boundary between natural language AI interpretation and deterministic/statistical mathematical computation, ScenarioX ensures that financial simulation results are accurate, reproducible, un-hallucinated, and fully traceable.

---

## 🌟 Key Capabilities

1. **Deterministic Financial Simulation**: Model revenue, inventory, salaries, rent, utilities, marketing, and profit margins. Calculate demand elasticity impacts on pricing decisions.
2. **Monte Carlo Risk Analysis**: Run 1,000 to 10,000 statistical iterations with triangular, normal, uniform, and fixed distributions to compute mean, median, standard deviation, percentiles (P5, P10, P25, P50, P75, P90, P95), and probability of profit/loss/targets.
3. **Sensitivity Analysis**: Identify the top variables driving profit changes via systematic perturbation ranking.
4. **Historical Data Ingestion & Forecasting**: Ingest time-series CSV or manual entries to forecast customers, revenue, expenses, and profit with trend confidence intervals.
5. **SciPy Optimization Engine**: Solve for maximum profit or minimum expenses under user-defined decision bounds and constraints.
6. **Structured AI Interface**: Convert natural language business descriptions into validated business model variables and receive plain-language explanations of backend-calculated simulation results.
7. **Immutable Simulation Snapshots**: Historical simulation runs store their exact numerical context and random seeds, ensuring full reproducibility regardless of future model edits.

---

## 🏗️ Architecture Overview

```text
User Input (Natural Language or Manual UI)
  │
  ▼
AI Interpretation Layer (Extracts variables, missing fields, ambiguity) OR Direct Manual Entry
  │
  ▼
Pydantic v2 Validation & Auth / Ownership Check (Supabase Auth → FastAPI Dependency)
  │
  ▼
Deterministic Simulation Engine (Pure Python / NumPy / SciPy Core - Independent of AI)
  │
  ├──► Deterministic Simulation Execution
  ├──► Monte Carlo Statistical Engine (Triangular, Normal, Uniform, Fixed with JSON distribution configs)
  ├──► Sensitivity Analysis Ranking (One-variable-at-a-time perturbations)
  ├──► Forecasting Engine (CSV/Manual historical ingestion + Linear Regression)
  └──► SciPy Optimization Engine (Maximize Profit / Minimize Cost under explicit bounds & constraints)
  │
  ▼
Structured Numerical Results (P5, P10, P25, P50, P75, P90, P95, mean, std, profit/loss probabilities)
  │
  ├──► Optional AI Explanation Layer (Explains backend numerical output ONLY; validated by Pydantic v2)
  └──► Frontend Visualizations & Decision Support Dashboard (Next.js 15+)
```

---

## 🚀 Quick Start

### Requirements
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL database (or Supabase PostgreSQL project)

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
pytest
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Security & Privacy
- **Supabase Auth**: JWT verification middleware with strict resource ownership enforcement.
- **PostgreSQL Row Level Security (RLS)**: Protects user data at the database level.
- **Prompt Injection Defense**: All natural-language inputs are treated as untrusted, and AI responses undergo strict Pydantic v2 validation.
- **AI Isolation**: The simulation engine operates independently without requiring an active AI API key.

---

## 📜 Documentation

Detailed architecture, database, API, simulation, and testing docs are available in the [`docs/`](file:///c:/Users/USER/Desktop/ScenerioX/docs) directory:
- [docs/architecture.md](file:///c:/Users/USER/Desktop/ScenerioX/docs/architecture.md)
- [docs/database.md](file:///c:/Users/USER/Desktop/ScenerioX/docs/database.md)
- [docs/simulation-engine.md](file:///c:/Users/USER/Desktop/ScenerioX/docs/simulation-engine.md)
- [docs/ai.md](file:///c:/Users/USER/Desktop/ScenerioX/docs/ai.md)
- [docs/api.md](file:///c:/Users/USER/Desktop/ScenerioX/docs/api.md)
- [docs/deployment.md](file:///c:/Users/USER/Desktop/ScenerioX/docs/deployment.md)
- [docs/testing.md](file:///c:/Users/USER/Desktop/ScenerioX/docs/testing.md)
