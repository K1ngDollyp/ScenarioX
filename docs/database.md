# ScenarioX Database Specification

ScenarioX uses PostgreSQL (with Supabase PostgreSQL support) as its persistence layer.

---

## 1. PostgreSQL Schema (`backend/app/db/schema.sql`)

The database consists of 10 primary tables:

1. **`users`**: User account mirror from Supabase Auth (`id`, `email`, `created_at`, `updated_at`).
2. **`business_models`**: Business models created by users (`id`, `user_id`, `name`, `business_type`, `currency`, `description`, `created_at`, `updated_at`).
3. **`model_variables`**: Business model parameters (`id`, `model_id`, `variable_name`, `display_name`, `category`, `value`, `unit`, `period`, `currency`, `description`, `source`, `created_at`, `updated_at`).
4. **`scenarios`**: Scenario variations of a business model (`id`, `model_id`, `name`, `description`, `created_at`, `updated_at`).
5. **`scenario_changes`**: Variable delta modifications (`id`, `scenario_id`, `variable_name`, `change_type`, `change_value`, `created_at`).
6. **`simulations`**: Immutable simulation snapshot metadata (`id`, `model_id`, `scenario_id`, `simulation_type`, `status`, `iterations`, `random_seed`, `snapshot_data`, `started_at`, `completed_at`, `created_at`).
7. **`simulation_results`**: Calculated output values (`id`, `simulation_id`, `metric_name`, `metric_value`, `metadata`, `created_at`).
8. **`forecasts`**: Historical regression forecasts (`id`, `model_id`, `metric`, `period`, `predicted_value`, `lower_bound`, `upper_bound`, `created_at`).
9. **`optimization_runs`**: Optimization runs and constraints (`id`, `model_id`, `objective`, `constraints`, `bounds`, `result`, `created_at`).
10. **`ai_interactions`**: AI prompt/response log for audit (`id`, `user_id`, `model_id`, `prompt`, `response`, `operation`, `created_at`).

---

## 2. Row Level Security (RLS)

All tables feature PostgreSQL Row Level Security policies:
```sql
ALTER TABLE business_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_models_user_policy ON business_models
    FOR ALL USING (auth.uid() = user_id);
```

---

## 3. Snapshot Reproducibility

The `simulations.snapshot_data` JSONB column stores the complete immutable input state (variables, elasticity, scenario changes, random seed, model version). This guarantees that historical simulation results can be reproduced at any point in the future.
