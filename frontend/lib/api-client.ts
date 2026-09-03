const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('scenariox_auth_token') || 'dev-token-00000000-0000-0000-0000-000000000001' : 'dev-token-00000000-0000-0000-0000-000000000001';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.detail?.error?.message || errorData?.detail || `HTTP Error ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  // Business Models
  getModels: () => fetchAPI<any[]>('/models'),
  getModel: (id: string) => fetchAPI<any>(`/models/${id}`),
  createModel: (data: any) => fetchAPI<any>('/models', { method: 'POST', body: JSON.stringify(data) }),
  updateModel: (id: string, data: any) => fetchAPI<any>(`/models/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteModel: (id: string) => fetchAPI<void>(`/models/${id}`, { method: 'DELETE' }),

  // Scenarios
  getScenarios: (modelId: string) => fetchAPI<any[]>(`/models/${modelId}/scenarios`),
  getScenario: (id: string) => fetchAPI<any>(`/scenarios/${id}`),
  createScenario: (modelId: string, data: any) => fetchAPI<any>(`/models/${modelId}/scenarios`, { method: 'POST', body: JSON.stringify(data) }),
  
  // Simulations
  simulateScenario: (scenarioId: string, elasticity = -0.4) => fetchAPI<any>(`/scenarios/${scenarioId}/simulate`, { method: 'POST', body: JSON.stringify({ elasticity }) }),
  getSimulation: (id: string) => fetchAPI<any>(`/simulations/${id}`),
  getSimulations: (modelId: string) => fetchAPI<any[]>(`/models/${modelId}/simulations`),

  // Analytics
  runMonteCarlo: (modelId: string, payload: any) => fetchAPI<any>(`/models/${modelId}/monte-carlo`, { method: 'POST', body: JSON.stringify(payload) }),
  runSensitivity: (modelId: string, payload: any = {}) => fetchAPI<any[]>(`/models/${modelId}/sensitivity`, { method: 'POST', body: JSON.stringify(payload) }),
  runForecast: (modelId: string, payload: any) => fetchAPI<any>(`/models/${modelId}/forecast`, { method: 'POST', body: JSON.stringify(payload) }),
  runOptimization: (modelId: string, payload: any) => fetchAPI<any>(`/models/${modelId}/optimize`, { method: 'POST', body: JSON.stringify(payload) }),

  // AI
  parseModel: (description: string) => fetchAPI<any>('/ai/parse-model', { method: 'POST', body: JSON.stringify({ description }) }),
  generateScenarios: (modelId: string) => fetchAPI<any>('/ai/generate-scenarios', { method: 'POST', body: JSON.stringify({ model_id: modelId }) }),
  explainResults: (simulationResult: any) => fetchAPI<any>('/ai/explain-results', { method: 'POST', body: JSON.stringify({ simulation_result: simulationResult }) }),
};
