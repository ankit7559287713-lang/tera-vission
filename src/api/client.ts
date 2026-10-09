/**
 * EARTHSIM: Centralized API Client
 *
 * Typesafe communication with EARTHSIM backend endpoints with
 * timeout management, error wrapping, and resilient offline fallbacks.
 */
import {
  City,
  CityArea,
  DataProvenanceRecord,
  EnvironmentalLayerId,
  InterventionOption,
  InterventionOptimizationResult,
  InterventionParameters,
  SavedScenario,
  SimulationResult,
  TargetYear,
  AIStrategistBriefing
} from '../types/earthsim.ts';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: response.statusText };
      }
      throw new ApiError(
        errorBody?.message || `HTTP error ${response.status}`,
        response.status,
        errorBody
      );
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out after 18 seconds', 408);
    }
    throw error;
  }
}

export const api = {
  // Health & Config
  getHealth: () => request<{ status: string; version: string }>('/health'),
  getConfig: () => request<any>('/config'),

  // Cities & Geography
  getCities: async (): Promise<City[]> => {
    const res = await request<{ count: number; cities: City[] }>('/cities');
    return res.cities;
  },

  getCityAreas: async (cityId: string): Promise<{ areas: CityArea[]; geojson: any }> => {
    return request<{ cityId: string; count: number; areas: CityArea[]; geojson: any }>(
      `/cities/${cityId}/areas`
    );
  },

  getCityLayer: (cityId: string, layer: EnvironmentalLayerId) =>
    request<any>(`/cities/${cityId}/layers/${layer}`),

  // Environmental Data
  getEnvironmentalData: async (): Promise<DataProvenanceRecord[]> => {
    const res = await request<{ datasetCount: number; datasets: DataProvenanceRecord[] }>(
      '/environmental-data'
    );
    return res.datasets;
  },

  getFeatureDetails: (featureId: string) =>
    request<any>(`/environmental-data/${encodeURIComponent(featureId)}`),

  // Simulations
  runSimulation: (input: {
    cityId: string;
    targetYear: TargetYear;
    interventions: InterventionParameters;
  }): Promise<SimulationResult> => {
    return request<SimulationResult>('/simulations/run', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  compareSimulations: (input: {
    cityId: string;
    targetYear: TargetYear;
    baselineInterventions?: InterventionParameters;
    scenarioInterventions: InterventionParameters;
  }) => {
    return request<any>('/simulations/compare', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  getSimulationById: (id: string): Promise<SimulationResult> =>
    request<SimulationResult>(`/simulations/${id}`),

  // Scenarios
  getSavedScenarios: async (cityId?: string): Promise<SavedScenario[]> => {
    const query = cityId ? `?cityId=${encodeURIComponent(cityId)}` : '';
    const res = await request<{ count: number; scenarios: SavedScenario[] }>(`/scenarios${query}`);
    return res.scenarios;
  },

  saveScenario: (scenario: {
    title: string;
    description: string;
    cityId: string;
    cityName: string;
    targetYear: TargetYear;
    interventions: InterventionParameters;
    resilienceScore: number;
    resilienceGain: number;
    tags?: string[];
  }): Promise<SavedScenario> => {
    return request<SavedScenario>('/scenarios', {
      method: 'POST',
      body: JSON.stringify(scenario)
    });
  },

  deleteScenario: (id: string): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/scenarios/${id}`, {
      method: 'DELETE'
    });
  },

  // Interventions & Optimizer
  getAvailableInterventions: async (): Promise<InterventionOption[]> => {
    const res = await request<{ count: number; interventions: InterventionOption[] }>(
      '/interventions'
    );
    return res.interventions;
  },

  evaluateInterventions: (input: {
    cityId: string;
    budgetMillions: number;
    targetPriority: 'balanced' | EnvironmentalLayerId;
  }): Promise<InterventionOptimizationResult> => {
    return request<InterventionOptimizationResult>('/interventions/evaluate', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  // Recommendations & AI Strategist
  getRecommendations: (input: {
    simulation: SimulationResult;
    userPrompt?: string;
    focusAreaId?: string;
  }): Promise<AIStrategistBriefing> => {
    return request<AIStrategistBriefing>('/recommendations', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  getPriorities: (cityId: string) =>
    request<{ cityId: string; priorities: any[] }>(`/recommendations/priorities?cityId=${cityId}`)
};
