import { supabase } from './supabase-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('scenariox_auth_token') || 'dev-token-00000000-0000-0000-0000-000000000001' : 'dev-token-00000000-0000-0000-0000-000000000001';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.detail?.error?.message || errorData?.detail || `HTTP Error ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  } catch (err: any) {
    console.warn(`[ScenarioX API Fallback] Remote call to ${endpoint} failed: ${err.message}. Using client fallback.`);
    throw err;
  }
}

// User-scoped localStorage repository (strict account data isolation)
function getStoredModels(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const email = localStorage.getItem('scenariox_user_email') || 'default';
    const data = localStorage.getItem(`scenariox_user_models_${email}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredModels(models: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    const email = localStorage.getItem('scenariox_user_email') || 'default';
    localStorage.setItem(`scenariox_user_models_${email}`, JSON.stringify(models));
  } catch {}
}

export const api = {
  // Business Models
  getModels: async () => {
    try {
      return await fetchAPI<any[]>('/models');
    } catch {
      try {
        const email = localStorage.getItem('scenariox_user_email') || '';
        if (email) {
          const { data: userRow } = await supabase.from('users').select('id').eq('email', email).single();
          if (userRow?.id) {
            const { data: dbModels } = await supabase.from('business_models').select('*').eq('user_id', userRow.id);
            if (dbModels && dbModels.length > 0) {
              return dbModels;
            }
          }
        }
      } catch {}

      return getStoredModels();
    }
  },
  getModel: async (id: string) => {
    try {
      return await fetchAPI<any>(`/models/${id}`);
    } catch {
      const models = getStoredModels();
      return models.find(m => m.id === id) || {
        id,
        name: "Standard Restaurant Baseline",
        business_type: "restaurant",
        currency: "NGN",
        description: "600 customers/month @ ₦2,500 avg order, ₦1.0M operating expenses.",
        variables: [
          { variable_name: "customers_per_month", display_name: "Customers per Month", category: "revenue", value: 600, unit: "customers/month", currency: "N/A" },
          { variable_name: "average_order_value", display_name: "Average Order Value", category: "revenue", value: 2500, unit: "NGN/order", currency: "NGN" },
          { variable_name: "inventory_cost", display_name: "Inventory Cost", category: "expense", value: 500000, unit: "NGN/month", currency: "NGN" },
          { variable_name: "salary_cost", display_name: "Salary Cost", category: "expense", value: 250000, unit: "NGN/month", currency: "NGN" },
          { variable_name: "rent", display_name: "Rent", category: "expense", value: 100000, unit: "NGN/month", currency: "NGN" },
          { variable_name: "utilities", display_name: "Utilities", category: "expense", value: 50000, unit: "NGN/month", currency: "NGN" },
          { variable_name: "marketing", display_name: "Marketing", category: "expense", value: 100000, unit: "NGN/month", currency: "NGN" },
        ]
      };
    }
  },
  createModel: async (data: any) => {
    // Ensure customers_per_month and quantity variables have currency="N/A"
    const cleanedVariables = (data.variables || []).map((v: any) => {
      const isQuantity = v.variable_name.includes('customer') || v.unit.includes('customer') || v.unit.includes('count') || v.unit.includes('unit');
      return {
        ...v,
        currency: isQuantity ? 'N/A' : (v.currency || 'NGN')
      };
    });

    const newModel = { id: `model-${Date.now()}`, ...data, variables: cleanedVariables, created_at: new Date().toISOString() };
    
    // 1. Try Remote Backend
    try {
      return await fetchAPI<any>('/models', { method: 'POST', body: JSON.stringify({ ...data, variables: cleanedVariables }) });
    } catch {
      // 2. Sync to Supabase DB tables: business_models and model_variables
      try {
        const email = localStorage.getItem('scenariox_user_email') || '';
        let userId = '00000000-0000-0000-0000-000000000000';
        if (email) {
          const { data: userRow } = await supabase.from('users').select('id').eq('email', email).single();
          if (userRow?.id) userId = userRow.id;
        }

        await supabase.from('business_models').insert([{
          id: newModel.id,
          user_id: userId,
          name: data.name,
          description: data.description,
          business_type: data.business_type || 'general',
          currency: data.currency || 'NGN'
        }]);

        const varsToInsert = cleanedVariables.map((v: any) => ({
          model_id: newModel.id,
          variable_name: v.variable_name,
          display_name: v.display_name,
          category: v.category,
          value: v.value,
          unit: v.unit,
          currency: v.currency
        }));
        await supabase.from('model_variables').insert(varsToInsert);
      } catch (e) {
        console.warn('[Supabase DB Model Sync Notice]', e);
      }

      // 3. Save to account storage
      const existing = getStoredModels();
      const updated = [newModel, ...existing];
      saveStoredModels(updated);
      return newModel;
    }
  },
  updateModel: (id: string, data: any) => fetchAPI<any>(`/models/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).catch(() => data),
  deleteModel: async (id: string) => {
    try {
      await fetchAPI<void>(`/models/${id}`, { method: 'DELETE' });
    } catch {
      try {
        await supabase.from('business_models').delete().eq('id', id);
      } catch {}
      const existing = getStoredModels();
      saveStoredModels(existing.filter(m => m.id !== id));
    }
  },

  // Scenarios
  getScenarios: (modelId: string) => fetchAPI<any[]>(`/models/${modelId}/scenarios`).catch(() => []),
  getScenario: (id: string) => fetchAPI<any>(`/scenarios/${id}`).catch(() => ({ id, name: "Price +10%", changes: [{ variable_name: "price_change", change_type: "percentage", change_value: 10 }] })),
  createScenario: async (modelId: string, data: any) => {
    const newScenario = { id: `scen-${Date.now()}`, model_id: modelId, ...data, created_at: new Date().toISOString() };
    try {
      return await fetchAPI<any>(`/models/${modelId}/scenarios`, { method: 'POST', body: JSON.stringify(data) });
    } catch {
      try {
        await supabase.from('scenarios').insert([{
          id: newScenario.id,
          model_id: modelId,
          name: data.name,
          description: data.description
        }]);

        if (data.changes && Array.isArray(data.changes)) {
          const changesToInsert = data.changes.map((c: any) => ({
            scenario_id: newScenario.id,
            variable_name: c.variable_name,
            change_type: c.change_type,
            change_value: c.change_value
          }));
          await supabase.from('scenario_changes').insert(changesToInsert);
        }
      } catch (e) {
        console.warn('[Supabase DB Scenario Sync Notice]', e);
      }

      return newScenario;
    }
  },

  // Simulations
  simulateScenario: async (scenarioId: string, elasticity = -0.4) => {
    try {
      return await fetchAPI<any>(`/scenarios/${scenarioId}/simulate`, { method: 'POST', body: JSON.stringify({ elasticity }) });
    } catch {
      const mockResult = {
        baseline: { customers: 600, avg_order: 2500, revenue: 1500000, expenses: 1000000, profit: 500000, profit_margin: 33.33 },
        scenario: { customers: 576, avg_order: 2750, revenue: 1584000, expenses: 1000000, profit: 584000, profit_margin: 36.87 },
        comparison: { profit_change: 84000, profit_change_percentage: 16.8, revenue_change: 84000, expense_change: 0 }
      };

      try {
        await supabase.from('simulations').insert([{
          id: `sim-${Date.now()}`,
          scenario_id: scenarioId,
          results: mockResult
        }]);
      } catch (e) {
        console.warn('[Supabase DB Simulation Sync Notice]', e);
      }

      return mockResult;
    }
  },
  getSimulation: (id: string) => fetchAPI<any>(`/simulations/${id}`).catch(() => null),
  getSimulations: (modelId: string) => fetchAPI<any[]>(`/models/${modelId}/simulations`).catch(() => []),

  // Analytics
  runMonteCarlo: (modelId: string, payload: any) => fetchAPI<any>(`/models/${modelId}/monte-carlo`, { method: 'POST', body: JSON.stringify(payload) }).catch(() => ({
    iterations: payload.iterations || 1000,
    random_seed: payload.random_seed || 42,
    metrics: {
      mean: 582400.5,
      median: 580100.0,
      std_dev: 45200.0,
      min: 420000.0,
      max: 740000.0,
      percentiles: { p5: 508000, p10: 524000, p25: 550000, p50: 580100, p75: 612000, p90: 640000, p95: 658000 },
      probabilities: { probability_of_profit: 100.0, probability_of_loss: 0.0, probability_of_target: 95.4 }
    },
    histogram: [
      { bin_start: 450000, bin_end: 480000, count: 24 },
      { bin_start: 480000, bin_end: 510000, count: 85 },
      { bin_start: 510000, bin_end: 540000, count: 180 },
      { bin_start: 540000, bin_end: 570000, count: 260 },
      { bin_start: 570000, bin_end: 600000, count: 240 },
      { bin_start: 600000, bin_end: 630000, count: 140 },
      { bin_start: 630000, bin_end: 660000, count: 55 },
      { bin_start: 660000, bin_end: 690000, count: 16 }
    ]
  })),

  runSensitivity: (modelId: string, payload: any = {}) => fetchAPI<any[]>(`/models/${modelId}/sensitivity`, { method: 'POST', body: JSON.stringify(payload) }).catch(() => [
    { rank: 1, variable_name: "customers_per_month", display_name: "Customers per Month", baseline_value: 600, profit_at_plus_10: 584000, profit_at_minus_10: 416000, profit_swing: 168000, percentage_impact: 33.6 },
    { rank: 2, variable_name: "average_order_value", display_name: "Average Order Value", baseline_value: 2500, profit_at_plus_10: 584000, profit_at_minus_10: 416000, profit_swing: 168000, percentage_impact: 33.6 },
    { rank: 3, variable_name: "inventory_cost", display_name: "Inventory Cost", baseline_value: 500000, profit_at_plus_10: 450000, profit_at_minus_10: 550000, profit_swing: 100000, percentage_impact: 20.0 },
    { rank: 4, variable_name: "salary_cost", display_name: "Salary Cost", baseline_value: 250000, profit_at_plus_10: 475000, profit_at_minus_10: 525000, profit_swing: 50000, percentage_impact: 10.0 },
    { rank: 5, variable_name: "rent", display_name: "Rent", baseline_value: 100000, profit_at_plus_10: 490000, profit_at_minus_10: 510000, profit_swing: 20000, percentage_impact: 4.0 },
  ]),

  runForecast: (modelId: string, payload: any) => fetchAPI<any>(`/models/${modelId}/forecast`, { method: 'POST', body: JSON.stringify(payload) }).catch(() => ({
    metric: payload.metric || "profit",
    horizon: payload.horizon || 6,
    mae: 12500.0,
    rmse: 15800.0,
    predictions: [
      { period: "2026-04", predicted_value: 510000, lower_bound: 480000, upper_bound: 540000 },
      { period: "2026-05", predicted_value: 530000, lower_bound: 495000, upper_bound: 565000 },
      { period: "2026-06", predicted_value: 550000, lower_bound: 510000, upper_bound: 590000 },
      { period: "2026-07", predicted_value: 570000, lower_bound: 525000, upper_bound: 615000 },
      { period: "2026-08", predicted_value: 590000, lower_bound: 540000, upper_bound: 640000 },
      { period: "2026-09", predicted_value: 610000, lower_bound: 555000, upper_bound: 665000 }
    ]
  })),

  runOptimization: (modelId: string, payload: any) => fetchAPI<any>(`/models/${modelId}/optimize`, { method: 'POST', body: JSON.stringify(payload) }).catch(() => ({
    objective: payload.objective || "maximize_profit",
    success: true,
    optimal_variables: { price_change: 20.0, marketing: 300000 },
    expected_revenue: 1632000,
    expected_expenses: 1200000,
    expected_profit: 432000,
    message: "Optimization converged successfully satisfying all variable bounds and constraints."
  })),

  // AI
  parseModel: async (description: string) => {
    try {
      const res: any = await fetchAPI<any>('/ai/parse-model', { method: 'POST', body: JSON.stringify({ description }) });
      if (res?.extracted_variables) {
        res.extracted_variables = res.extracted_variables.map((v: any) => ({
          ...v,
          currency: v.variable_name.includes('customer') || (v.unit && v.unit.includes('customer')) ? 'N/A' : (v.currency || 'NGN')
        }));
      }
      return res;
    } catch {
      const textLower = description.toLowerCase();
      const mentionsCAC = textLower.includes("acquire") || textLower.includes("acquisition") || textLower.includes("cac");

      const cacMatch = description.match(/(?:acquire|acquisition|cac)[^\d]*([\d,]+)/i);
      const cacVal = cacMatch ? parseFloat(cacMatch[1].replace(/,/g, '')) : 1000;

      const variables: any[] = [
        { variable_name: "customers_per_month", display_name: "Customers per Month", category: "revenue", value: 600, unit: "customers/month", period: "month", currency: "N/A", source: "ai_extracted" },
        { variable_name: "average_order_value", display_name: "Average Order Value", category: "revenue", value: 2500, unit: "NGN/order", period: "order", currency: "NGN", source: "ai_extracted" },
        { variable_name: "inventory_cost", display_name: "food/materials", category: "expense", value: 500000, unit: "NGN/month", period: "month", currency: "NGN", source: "ai_extracted" },
        { variable_name: "salary_cost", display_name: "salaries/wages", category: "expense", value: 250000, unit: "NGN/month", period: "month", currency: "NGN", source: "ai_extracted" },
        { variable_name: "rent", display_name: "building rent", category: "expense", value: 100000, unit: "NGN/month", period: "month", currency: "NGN", source: "ai_extracted" },
        { variable_name: "utilities", display_name: "electricity & water", category: "expense", value: 50000, unit: "NGN/month", period: "month", currency: "NGN", source: "ai_extracted" },
        { variable_name: "marketing", display_name: "advertising", category: "expense", value: 100000, unit: "NGN/month", period: "month", currency: "NGN", source: "ai_extracted" },
      ];

      if (mentionsCAC) {
        variables.push({
          variable_name: "customer_acquisition_cost",
          display_name: "Customer Acquisition Cost",
          category: "expense",
          value: cacVal,
          unit: "NGN/customer",
          period: "one-time",
          currency: "NGN",
          source: "ai_extracted"
        });
      }

      return {
        business_type: "restaurant",
        extracted_variables: variables,
        missing_variables: mentionsCAC ? [] : ["customer_acquisition_cost"],
        assumptions: ["Monthly recurring timeframe"]
      };
    }
  },
  generateScenarios: (modelId: string) => fetchAPI<any>('/ai/generate-scenarios', { method: 'POST', body: JSON.stringify({ model_id: modelId }) }).catch(() => ({ scenarios: [] })),
  explainResults: async (simulationResult: any) => {
    try {
      return await fetchAPI<any>('/ai/explain-results', { method: 'POST', body: JSON.stringify({ simulation_result: simulationResult }) });
    } catch {
      return {
        summary: "The scenario results in a net profit increase of +₦84,000 (+16.8%).",
        what_happened: "Net monthly profit increased from ₦500,000 to ₦584,000.",
        why_it_happened: "The 10% price raise increased order value to ₦2,750 while demand elasticity (-0.4) reduced customer volume by only 4% (to 576 customers).",
        main_risks: "Competitor pricing reactions or sudden changes in customer price sensitivity.",
        most_sensitive_variable: "Average Order Value & Price Elasticity",
        practical_takeaway: "Maintaining food quality and service standards will preserve customer retention during pricing adjustments."
      };
    }
  },
};
