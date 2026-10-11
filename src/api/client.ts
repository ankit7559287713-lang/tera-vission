/**
 * TETRA VISION: Centralized API Client
 *
 * Typesafe communication with TETRA VISION backend endpoints with
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

// Normalize and sanitize API Base URL so invalid env strings (e.g. "temp") or missing values never break calls
const rawEnvUrl = typeof import.meta.env.VITE_API_URL === "string" ? import.meta.env.VITE_API_URL.trim() : "";
const BASE_URL = (rawEnvUrl && rawEnvUrl.startsWith("/") && rawEnvUrl !== "/index.html") || (rawEnvUrl && rawEnvUrl.startsWith("http"))
  ? rawEnvUrl.replace(/\/+$/, "")
  : "/api";

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

        const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      let errorBody: any = null;
      if (contentType.includes("application/json")) {
        try {
          errorBody = await response.json();
        } catch {
          errorBody = { message: response.statusText };
        }
      } else {
        const text = await response.text();
        errorBody = { message: `HTTP ${response.status}: Server returned non-JSON response (${contentType || "unknown content type"})`, bodyPreview: text.slice(0, 150) };
      }
      throw new ApiError(
        errorBody?.message || `HTTP error ${response.status}`,
        response.status,
        errorBody
      );
    }

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new ApiError(
        `Expected JSON from ${endpoint} but received ${contentType || "non-JSON"}. Body snippet: ${text.slice(0, 80)}`,
        response.status
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
    request<{ cityId: string; priorities: any[] }>(`/recommendations/priorities?cityId=${cityId}`),

  // Live Ingestion & Advanced Geospatial
  getLiveObservation: (cityId: string) =>
    request<any>(`/environmental-data/live?cityId=${encodeURIComponent(cityId)}`),

  ingestLiveStream: (cityId: string) =>
    request<{ success: boolean; message: string; observation: any }>('/environmental-data/ingest', {
      method: 'POST',
      body: JSON.stringify({ cityId })
    }),

  getCompoundHotspots: (cityId: string) =>
    request<{
      cityId: string;
      totalAreasEvaluated: number;
      compoundHotspotCount: number;
      hotspots: any[];
    }>(`/cities/${encodeURIComponent(cityId)}/hotspots`),

  getParetoFrontier: (cityId: string, priority: string = 'balanced') =>
    request<{
      cityId: string;
      priority: string;
      frontierPoints: Array<{
        budgetMillions: number;
        expenditureMillions: number;
        projectedResilienceGain: number;
        costEffectiveness: number;
      }>;
      diminishingReturnsThresholdMillions: number;
      recommendation: string;
    }>(`/optimizer/pareto-frontier?cityId=${encodeURIComponent(cityId)}&priority=${encodeURIComponent(priority)}`)
};
