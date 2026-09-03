export interface ModelVariable {
  id?: string;
  variable_name: string;
  display_name: string;
  category: 'revenue' | 'expense' | 'operation';
  value: number;
  unit: string;
  period: string;
  currency: string;
  description?: string;
  source?: 'user_input' | 'ai_extracted' | 'calculated' | 'system_default';
}

export interface BusinessModel {
  id: string;
  user_id: string;
  name: string;
  business_type: string;
  currency: string;
  description?: string;
  created_at: string;
  updated_at: string;
  variables: ModelVariable[];
}

export interface ScenarioChange {
  id?: string;
  variable_name: string;
  change_type: 'absolute' | 'percentage' | 'multiplier';
  change_value: number;
}

export interface Scenario {
  id: string;
  model_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  changes: ScenarioChange[];
}

export interface SimulationResultItem {
  metric_name: string;
  metric_value: number;
  metadata?: Record<string, any>;
}

export interface SimulationResponse {
  id: string;
  model_id: string;
  scenario_id?: string;
  simulation_type: 'deterministic' | 'monte_carlo' | 'forecast' | 'optimization';
  status: string;
  iterations: number;
  random_seed?: number;
  snapshot_data: Record<string, any>;
  started_at: string;
  completed_at: string;
  created_at: string;
  results: SimulationResultItem[];
}

export interface MonteCarloHistogramBin {
  bin_start: number;
  bin_end: number;
  count: number;
}

export interface MonteCarloResponse {
  iterations: number;
  random_seed?: number;
  metrics: {
    mean: number;
    median: number;
    std_dev: number;
    min: number;
    max: number;
    percentiles: {
      p5: number;
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
      p95: number;
    };
    probabilities: {
      probability_of_profit: number;
      probability_of_loss: number;
      probability_of_target: number;
    };
  };
  histogram: MonteCarloHistogramBin[];
}

export interface SensitivityItem {
  rank: number;
  variable_name: string;
  display_name: string;
  baseline_value: number;
  profit_at_plus_10: number;
  profit_at_minus_10: number;
  profit_swing: number;
  percentage_impact: number;
}

export interface ForecastPrediction {
  period: string;
  predicted_value: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ForecastResponse {
  id: string;
  model_id: string;
  metric: string;
  horizon: number;
  mae?: number;
  rmse?: number;
  predictions: ForecastPrediction[];
  created_at: string;
}

export interface OptimizationResponse {
  id: string;
  model_id: string;
  objective: string;
  success: boolean;
  optimal_variables: Record<string, number>;
  expected_revenue: number;
  expected_expenses: number;
  expected_profit: number;
  message: string;
  created_at: string;
}

export interface AIParseModelResponse {
  business_type: string;
  extracted_variables: ModelVariable[];
  missing_variables: string[];
  assumptions: string[];
  ambiguities: string[];
}

export interface AIExplainResultsResponse {
  summary: string;
  what_happened: string;
  why_it_happened: string;
  main_risks: string;
  most_sensitive_variable: string;
  practical_takeaway: string;
}
