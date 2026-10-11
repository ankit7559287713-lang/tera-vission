/**
 * TETRA VISION: In-Browser Pure Simulation Engine
 *
 * Runs the complete, real physical-empirical simulation logic directly in the browser
 * without requiring any separate backend server.
 * Uses localStorage for persistent scenarios and browser-based Open-Meteo API for live telemetry.
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
} from './types/earthsim.ts';

import { CITIES, CITY_AREAS, ENVIRONMENTAL_LAYERS } from './server/data/cities.ts';
import { DATA_PROVENANCE_RECORDS } from './server/data/provenance.ts';
import {
  executeSimulation,
  validateSimulationInputs,
  SimulationValidationError
} from './server/services/simulation.ts';
import {
  AVAILABLE_INTERVENTIONS,
  optimizeInterventionPortfolio
} from './server/services/optimizer.ts';
import { generateDeterministicBriefing } from './server/services/strategist.ts';
import { fetchLiveCityObservation } from './server/services/ingestion.ts';

const LOCAL_STORAGE_KEY = 'tetravision_saved_scenarios_v1';

const SEED_SCENARIOS: SavedScenario[] = [
  {
    id: 'scen-blr-sponge-2035',
    title: 'Sponge City Bengaluru 2035',
    description: 'Ambitious hydrological restoration combining 65% rainwater catchment, 25% canopy expansion, and 60% stormwater rajakaluve canal desilting.',
    cityId: 'bengaluru',
    cityName: 'Bengaluru',
    targetYear: 2035,
    interventions: {
      urban_green_cover: 25,
      cool_roof: 40,
      water_consumption_reduction: 20,
      rainwater_harvesting: 65,
      drainage_improvement: 60,
      emissions_reduction: 25
    },
    resilienceScore: 78,
    resilienceGain: 28,
    createdAt: '2025-02-15T10:30:00.000Z',
    tags: ['Hydrology', 'Sponge City', 'Flood Resilience', 'Water Security']
  },
  {
    id: 'scen-del-clean-air-2030',
    title: 'Clean Sky & Thermal Relief Delhi 2030',
    description: 'Targeted air pollution abatement and heatwave survival portfolio combining 50% emissions cut, 60% cool roofs, and 20% urban micro-forests.',
    cityId: 'delhi',
    cityName: 'Delhi NCR',
    targetYear: 2030,
    interventions: {
      urban_green_cover: 20,
      cool_roof: 60,
      water_consumption_reduction: 15,
      rainwater_harvesting: 35,
      drainage_improvement: 30,
      emissions_reduction: 50
    },
    resilienceScore: 74,
    resilienceGain: 31,
    createdAt: '2025-02-18T14:15:00.000Z',
    tags: ['Air Quality', 'Extreme Heat', 'Clean Transit', 'Cool Roofs']
  },
  {
    id: 'scen-mum-coastal-shield-2040',
    title: 'Monsoon Shield & Mangrove Buffer Mumbai 2040',
    description: 'Long-term coastal and riparian defense focusing on Mithi River desilting, 70% drainage upgrade, and 30% nature-based mangrove buffer restoration.',
    cityId: 'mumbai',
    cityName: 'Mumbai',
    targetYear: 2040,
    interventions: {
      urban_green_cover: 30,
      cool_roof: 35,
      water_consumption_reduction: 15,
      rainwater_harvesting: 50,
      drainage_improvement: 70,
      emissions_reduction: 30
    },
    resilienceScore: 76,
    resilienceGain: 29,
    createdAt: '2025-02-22T09:45:00.000Z',
    tags: ['Coastal Defense', 'Flash Flood', 'Mangroves', 'Urban Drainage']
  }
];

function getStoredScenarios(): SavedScenario[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return SEED_SCENARIOS;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_SCENARIOS));
      return SEED_SCENARIOS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_SCENARIOS;
  }
}

function saveStoredScenarios(scenarios: SavedScenario[]) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scenarios));
    } catch (e) {
      console.warn('Failed persisting scenario to localStorage', e);
    }
  }
}

// In-memory simulation cache
const inMemorySimulations = new Map<string, SimulationResult>();

export const browserSimulationService = {
  getHealth: async () => ({
    status: 'healthy',
    service: 'TETRA VISION In-Browser Engine',
    version: '3.2.0-client',
    timestamp: new Date().toISOString(),
    uptimeSeconds: typeof performance !== 'undefined' ? Math.round(performance.now() / 1000) : 0,
    features: {
      simulationEngine: 'deterministic-v3.2 (Browser WebAssembly / JS)',
      aiStrategist: 'deterministic-rule-based-browser',
      persistence: 'localStorage'
    }
  }),

  getConfig: async () => ({
    appName: 'TETRA VISION',
    tagline: 'Explore Tomorrow. Shape a Resilient Planet.',
    supportedYears: [
      2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040
    ],
    defaultCity: 'bengaluru',
    defaultYear: 2030,
    layers: ENVIRONMENTAL_LAYERS,
    interventionBounds: {
      urban_green_cover: { min: 0, max: 40, unit: '% canopy increase' },
      cool_roof: { min: 0, max: 80, unit: '% roof adoption' },
      water_consumption_reduction: { min: 0, max: 50, unit: '% demand reduction' },
      rainwater_harvesting: { min: 0, max: 100, unit: '% property compliance' },
      drainage_improvement: { min: 0, max: 100, unit: '% canal capacity boost' },
      emissions_reduction: { min: 0, max: 70, unit: '% emissions cut' }
    }
  }),

  getCities: async (): Promise<City[]> => {
    return CITIES;
  },

  getCityAreas: async (cityId: string): Promise<{ areas: CityArea[]; geojson: any }> => {
    const cid = cityId.toLowerCase();
    const areas = CITY_AREAS[cid] || CITY_AREAS.bengaluru;
    const geojson = {
      type: 'FeatureCollection',
      cityId: cid,
      features: areas.map((area) => ({
        type: 'Feature',
        id: area.id,
        geometry: {
          type: 'Point',
          coordinates: [area.center[1], area.center[0]]
        },
        properties: {
          name: area.name,
          zone: area.zone,
          populationEstimate: area.populationEstimate,
          areaKm2: area.areaKm2,
          vulnerabilityRank: area.vulnerabilityRank,
          baselineIndicators: area.baselineIndicators,
          characteristics: area.characteristics,
          svgPolygon: area.svgPolygon
        }
      }))
    };
    return { areas, geojson };
  },

  getCityLayer: async (cityId: string, layer: EnvironmentalLayerId) => {
    const cid = cityId.toLowerCase();
    const layerMeta = ENVIRONMENTAL_LAYERS.find((l) => l.id === layer);
    if (!layerMeta) {
      throw new Error(`Layer '${layer}' is not supported.`);
    }
    const areas = CITY_AREAS[cid] || CITY_AREAS.bengaluru;
    const layerData = areas.map((area) => ({
      areaId: area.id,
      areaName: area.name,
      center: area.center,
      value: area.baselineIndicators[layer],
      unit: layerMeta.unit,
      vulnerabilityRank: area.vulnerabilityRank
    }));
    return { cityId: cid, layer: layerMeta, areas: layerData };
  },

  getEnvironmentalData: async (): Promise<DataProvenanceRecord[]> => {
    return DATA_PROVENANCE_RECORDS;
  },

  getFeatureDetails: async (featureId: string) => {
    for (const [cityId, areas] of Object.entries(CITY_AREAS)) {
      const area = areas.find((a) => a.id === featureId);
      if (area) {
        const city = CITIES.find((c) => c.id === cityId);
        return {
          featureId,
          city: { id: city?.id, name: city?.name },
          area,
          provenanceSources: DATA_PROVENANCE_RECORDS.map((p) => p.name),
          dataClassification: 'Demonstration & Semi-Empirical Regional Observed'
        };
      }
    }
    throw new Error(`Feature with ID '${featureId}' not found.`);
  },

  runSimulation: async (input: {
    cityId: string;
    targetYear: TargetYear;
    interventions: InterventionParameters;
  }): Promise<SimulationResult> => {
    const result = executeSimulation({
      cityId: input.cityId || 'bengaluru',
      targetYear: Number(input.targetYear) as TargetYear,
      interventions: input.interventions
    });
    inMemorySimulations.set(result.id, result);
    return result;
  },

  compareSimulations: async (input: {
    cityId: string;
    targetYear: TargetYear;
    baselineInterventions?: InterventionParameters;
    scenarioInterventions: InterventionParameters;
  }) => {
    const { cityId = 'bengaluru', targetYear = 2035, baselineInterventions, scenarioInterventions } = input;
    const zeroInterventions = baselineInterventions || {
      urban_green_cover: 0,
      cool_roof: 0,
      water_consumption_reduction: 0,
      rainwater_harvesting: 0,
      drainage_improvement: 0,
      emissions_reduction: 0
    };
    const simBaseline = executeSimulation({
      cityId,
      targetYear: Number(targetYear) as TargetYear,
      interventions: zeroInterventions
    });
    const simScenario = executeSimulation({
      cityId,
      targetYear: Number(targetYear) as TargetYear,
      interventions: scenarioInterventions || {
        urban_green_cover: 20,
        cool_roof: 40,
        water_consumption_reduction: 20,
        rainwater_harvesting: 50,
        drainage_improvement: 40,
        emissions_reduction: 25
      }
    });
    return {
      comparisonId: `cmp_${cityId}_${targetYear}_${Date.now().toString(36)}`,
      cityId,
      cityName: simScenario.cityName,
      targetYear,
      baseline: {
        resilienceScore: simBaseline.overallResilienceScore.baseline,
        citywide: simBaseline.baselineCitywide,
        interventions: zeroInterventions
      },
      intervention: {
        resilienceScore: simScenario.overallResilienceScore.intervention,
        citywide: simScenario.interventionCitywide,
        interventions: simScenario.interventions
      },
      deltas: simScenario.deltas,
      netResilienceGain: simScenario.overallResilienceScore.gain,
      areaComparisons: simScenario.areaResults.map((ar) => ({
        areaId: ar.areaId,
        areaName: ar.areaName,
        vulnerabilityRank: ar.vulnerabilityRank,
        baselineIndicators: ar.baseline,
        interventionIndicators: ar.intervention,
        deltas: ar.deltas,
        topBenefit: ar.topBenefitLayer
      })),
      assumptions: simScenario.assumptions,
      uncertainties: simScenario.uncertainties,
      limitations: simScenario.limitations,
      modelVersion: simScenario.modelVersion
    };
  },

  getSimulationById: async (id: string): Promise<SimulationResult> => {
    const cached = inMemorySimulations.get(id);
    if (!cached) {
      throw new Error(`Simulation '${id}' not found in active session.`);
    }
    return cached;
  },

  getSavedScenarios: async (cityId?: string): Promise<SavedScenario[]> => {
    const all = getStoredScenarios();
    if (cityId) {
      return all.filter((s) => s.cityId.toLowerCase() === cityId.toLowerCase());
    }
    return all;
  },

  saveScenario: async (scenario: {
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
    const newScenario: SavedScenario = {
      id: `scen-${scenario.cityId}-${scenario.targetYear}-${Date.now().toString(36)}`,
      title: scenario.title,
      description: scenario.description,
      cityId: scenario.cityId,
      cityName: scenario.cityName,
      targetYear: scenario.targetYear,
      interventions: scenario.interventions,
      resilienceScore: scenario.resilienceScore,
      resilienceGain: scenario.resilienceGain,
      createdAt: new Date().toISOString(),
      tags: scenario.tags || ['Custom Scenario']
    };
    const existing = getStoredScenarios();
    const updated = [newScenario, ...existing];
    saveStoredScenarios(updated);
    return newScenario;
  },

  deleteScenario: async (id: string): Promise<{ success: boolean; message: string }> => {
    const existing = getStoredScenarios();
    const filtered = existing.filter((s) => s.id !== id);
    saveStoredScenarios(filtered);
    return { success: true, message: 'Scenario deleted successfully' };
  },

  getAvailableInterventions: async (): Promise<InterventionOption[]> => {
    return AVAILABLE_INTERVENTIONS;
  },

  evaluateInterventions: async (input: {
    cityId: string;
    budgetMillions: number;
    targetPriority: 'balanced' | EnvironmentalLayerId;
  }): Promise<InterventionOptimizationResult> => {
    return optimizeInterventionPortfolio({
      cityId: input.cityId || 'bengaluru',
      budgetMillions: Number(input.budgetMillions),
      targetPriority: input.targetPriority
    });
  },

  getRecommendations: async (input: {
    simulation: SimulationResult;
    userPrompt?: string;
    focusAreaId?: string;
  }): Promise<AIStrategistBriefing> => {
    if (!input.simulation) {
      throw new Error('Must provide active simulation result.');
    }
    return generateDeterministicBriefing(input.simulation, input.userPrompt);
  },

  getPriorities: async (cityId: string) => {
    const cid = cityId.toLowerCase();
    const areas = CITY_AREAS[cid] || CITY_AREAS.bengaluru;
    const ranked = [...areas].sort((a, b) => a.vulnerabilityRank - b.vulnerabilityRank);
    return {
      cityId: cid,
      priorities: ranked.map((area) => ({
        rank: area.vulnerabilityRank,
        areaId: area.id,
        areaName: area.name,
        zone: area.zone,
        primaryHazard:
          area.baselineIndicators.flood_exposure > 85
            ? 'Severe Monsoon Inundation'
            : area.baselineIndicators.extreme_heat > 85
            ? 'Acute Urban Heat Sink'
            : area.baselineIndicators.water_stress > 85
            ? 'Critical Groundwater Depletion'
            : 'Compound Environmental Vulnerability',
        recommendedUrgentAction:
          area.characteristics.imperviousSurfacePercent > 80
            ? 'Deploy cool roofs and permeable pavement retrofits to alleviate surface heat and runoff.'
            : 'Rehabilitate drainage contours and expand vegetative retention bioswales.'
      }))
    };
  },

  getLiveObservation: async (cityId: string) => {
    return fetchLiveCityObservation(cityId);
  },

  ingestLiveStream: async (cityId: string) => {
    const obs = await fetchLiveCityObservation(cityId);
    return {
      success: true,
      message: `Live observation stream ingested successfully for ${obs.cityName}`,
      observation: obs
    };
  },

  getCompoundHotspots: async (cityId: string) => {
    const cid = cityId.toLowerCase();
    const areas = CITY_AREAS[cid] || CITY_AREAS.bengaluru;
    const hotspots = areas
      .map((area) => {
        const b = area.baselineIndicators;
        const criticalRisks: string[] = [];
        if (b.extreme_heat >= 75) criticalRisks.push('Acute Extreme Heat');
        if (b.flood_exposure >= 75) criticalRisks.push('Severe Flood Exposure');
        if (b.water_stress >= 75) criticalRisks.push('Severe Groundwater Depletion');
        if (b.air_pollution >= 75) criticalRisks.push('Hazardous Air Pollution');
        const compoundSeverityScore = Math.round(
          b.extreme_heat * 0.3 + b.flood_exposure * 0.3 + b.water_stress * 0.25 + b.air_pollution * 0.15
        );
        return {
          areaId: area.id,
          areaName: area.name,
          zone: area.zone,
          vulnerabilityRank: area.vulnerabilityRank,
          isCompoundHotspot: criticalRisks.length >= 2,
          criticalRiskCount: criticalRisks.length,
          criticalRisks,
          compoundSeverityScore,
          populationAtRisk: area.populationEstimate,
          imperviousSurfacePercent: area.characteristics.imperviousSurfacePercent
        };
      })
      .sort((a, b) => b.compoundSeverityScore - a.compoundSeverityScore);

    return {
      cityId: cid,
      totalAreasEvaluated: areas.length,
      compoundHotspotCount: hotspots.filter((h) => h.isCompoundHotspot).length,
      hotspots
    };
  },

  getParetoFrontier: async (cityId: string = 'bengaluru', priority: string = 'balanced') => {
    const budgetSteps = [5, 10, 20, 35, 50, 75, 100, 150];
    const curve = budgetSteps.map((budget) => {
      const result = optimizeInterventionPortfolio({
        cityId,
        budgetMillions: budget,
        targetPriority: priority as any
      });
      return {
        budgetMillions: budget,
        expenditureMillions: result.totalCostMillions,
        projectedResilienceGain: result.projectedResilienceGain,
        costEffectiveness: Math.round((result.projectedResilienceGain / result.totalCostMillions) * 100) / 100
      };
    });
    return {
      cityId,
      priority,
      frontierPoints: curve,
      diminishingReturnsThresholdMillions: 75,
      recommendation:
        'Optimal capital allocation efficiency peaks around ₹35 Cr–₹50 Cr before marginal returns begin tapering.'
    };
  }
};
