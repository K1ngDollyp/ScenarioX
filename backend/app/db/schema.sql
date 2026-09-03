-- ScenarioX Production PostgreSQL Database Schema
-- Includes UUID extension, 10 Core Tables, Foreign Keys, Indexes, Constraints, Soft Deletion, and RLS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS (Mirroring Supabase Auth users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 2. BUSINESS MODELS
CREATE TABLE IF NOT EXISTS business_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL DEFAULT 'restaurant',
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 3. MODEL VARIABLES
CREATE TABLE IF NOT EXISTS model_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES business_models(id) ON DELETE CASCADE,
    variable_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- revenue, expense, operation
    value NUMERIC(15, 4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    period VARCHAR(50) NOT NULL DEFAULT 'month',
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    description TEXT,
    source VARCHAR(50) NOT NULL DEFAULT 'user_input', -- user_input, ai_extracted, calculated, system_default
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_model_variable UNIQUE(model_id, variable_name)
);

-- 4. SCENARIOS
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES business_models(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 5. SCENARIO CHANGES
CREATE TABLE IF NOT EXISTS scenario_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    variable_name VARCHAR(100) NOT NULL,
    change_type VARCHAR(50) NOT NULL, -- absolute, percentage, multiplier
    change_value NUMERIC(15, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SIMULATIONS (Contains Immutable Input Snapshots)
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES business_models(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES scenarios(id) ON DELETE SET NULL,
    simulation_type VARCHAR(50) NOT NULL, -- deterministic, monte_carlo, forecast, optimization
    status VARCHAR(50) NOT NULL DEFAULT 'completed', -- pending, running, completed, failed
    iterations INT DEFAULT 1,
    random_seed INT,
    snapshot_data JSONB NOT NULL, -- Immutable record of all variables, scenario parameters & formula version
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SIMULATION RESULTS
CREATE TABLE IF NOT EXISTS simulation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(15, 4) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- percentiles, distributions, standard deviation, probabilities
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. FORECASTS
CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES business_models(id) ON DELETE CASCADE,
    metric VARCHAR(100) NOT NULL,
    period VARCHAR(50) NOT NULL,
    predicted_value NUMERIC(15, 4) NOT NULL,
    lower_bound NUMERIC(15, 4),
    upper_bound NUMERIC(15, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. OPTIMIZATION RUNS
CREATE TABLE IF NOT EXISTS optimization_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES business_models(id) ON DELETE CASCADE,
    objective VARCHAR(100) NOT NULL, -- maximize_profit, minimize_expenses
    constraints JSONB NOT NULL,
    bounds JSONB NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. AI INTERACTIONS
CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID REFERENCES business_models(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    response JSONB NOT NULL,
    operation VARCHAR(100) NOT NULL, -- parse_model, generate_scenarios, explain_results
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_business_models_user_id ON business_models(user_id);
CREATE INDEX IF NOT EXISTS idx_model_variables_model_id ON model_variables(model_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_model_id ON scenarios(model_id);
CREATE INDEX IF NOT EXISTS idx_scenario_changes_scenario_id ON scenario_changes(scenario_id);
CREATE INDEX IF NOT EXISTS idx_simulations_model_id ON simulations(model_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_simulation_id ON simulation_results(simulation_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_model_id ON forecasts(model_id);
CREATE INDEX IF NOT EXISTS idx_optimization_runs_model_id ON optimization_runs(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
