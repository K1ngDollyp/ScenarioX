# ScenarioX REST API Documentation

Base URL: `/api/v1`

All protected endpoints require the HTTP header:
`Authorization: Bearer <SUPABASE_JWT_TOKEN>`

---

## Endpoint Index

### Business Models
- `POST /models` — Create business model manually or from confirmed AI extraction.
- `GET /models` — List authenticated user's business models.
- `GET /models/{model_id}` — Get business model details & variables.
- `PATCH /models/{model_id}` — Update business model parameters.
- `DELETE /models/{model_id}` — Delete business model.

### AI Endpoint Suite
- `POST /ai/parse-model` — Extract variables, missing fields, and assumptions from natural language.
- `POST /ai/generate-scenarios` — Suggest scenario modifications for a given model.
- `POST /ai/explain-results` — Generate natural-language explanation for simulation results.

### Scenarios
- `POST /models/{model_id}/scenarios` — Create scenario.
- `GET /models/{model_id}/scenarios` — List model scenarios.
- `GET /scenarios/{scenario_id}` — Get scenario details.
- `PATCH /scenarios/{scenario_id}` — Update scenario changes.
- `DELETE /scenarios/{scenario_id}` — Delete scenario.

### Simulations & Analytics
- `POST /scenarios/{scenario_id}/simulate` — Run deterministic simulation.
- `POST /models/{model_id}/monte-carlo` — Run Monte Carlo simulation.
- `POST /models/{model_id}/sensitivity` — Run sensitivity perturbation analysis.
- `POST /models/{model_id}/forecast` — Run time-series forecast (from uploaded CSV or manual history).
- `POST /models/{model_id}/optimize` — Run SciPy optimization under constraints and bounds.
- `GET /simulations/{simulation_id}` — Get simulation snapshot and results.
