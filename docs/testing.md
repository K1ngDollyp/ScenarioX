# ScenarioX Testing Suite Specification

---

## 1. Test Categories

1. **Deterministic Formulas & Baseline Math**: Verifies exact mathematical correctness against Section 13 numerical specifications.
2. **Monte Carlo & Seed Reproducibility**: Verifies distribution sampling, percentiles (P5-P95), and exact output match given identical random seeds.
3. **Sensitivity Analysis**: Verifies one-variable perturbation ranking.
4. **Historical Forecasting**: Verifies linear regression, MAE/RMSE calculation, and failure handling when historical data is insufficient.
5. **SciPy Optimization**: Verifies variable bounds, objective maximization/minimization, and constraint enforcement.
6. **API Auth & Ownership Security**: Verifies Supabase JWT validation and user data isolation.
7. **AI Schema & Isolation**: Verifies Pydantic v2 validation of AI responses and confirms complete backend functionality when `AI_API_KEY` is missing/disabled.

---

## 2. Command Execution

### Backend Tests
```bash
cd backend
pytest -v
```

### Frontend Type Check & Production Build
```bash
cd frontend
npm run typecheck
npm run build
```
