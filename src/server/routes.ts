/**
 * EARTHSIM: Complete REST API Router
 *
 * Implements all specified endpoints with validation, structured schemas,
 * meaningful HTTP status codes, and error responses.
 */
import { Router, Request, Response } from 'express';
import { CITIES, CITY_AREAS, ENVIRONMENTAL_LAYERS } from './data/cities.ts';
import { DATA_PROVENANCE_RECORDS } from './data/provenance.ts';
import {
  executeSimulation,
  validateSimulationInputs,
  SimulationValidationError
} from './services/simulation.ts';
import {
  AVAILABLE_INTERVENTIONS,
  optimizeInterventionPortfolio
} from './services/optimizer.ts';
import {
  generateAIStrategistBriefing,
  generateDeterministicBriefing
} from './services/strategist.ts';
import { storage } from './services/db.ts';
import { EnvironmentalLayerId, TargetYear } from '../types/earthsim.ts';

export const apiRouter = Router();

// In-memory simulation cache for recent simulations
const simulationCache = new Map<string, any>();

// ==========================================
// 1. Health and Configuration
// ==========================================

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'EARTHSIM City Futures Lab API',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    features: {
      simulationEngine: 'deterministic-v2.4',
      aiStrategist: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' ? 'gemini-3.8-flash' : 'rule-based-fallback',
      persistence: 'file-backed-json'
    }
  });
});

apiRouter.get('/config', (_req: Request, res: Response) => {
  res.json({
    appName: 'EARTHSIM — City Futures Lab',
    tagline: 'What happens to our city if we do nothing — and how much can we change its future if we act today?',
    supportedYears: [2025, 2030, 2035, 2040],
    defaultCity: 'bengaluru',
    defaultYear: 2035,
    layers: ENVIRONMENTAL_LAYERS,
    interventionBounds: {
      urban_green_cover: { min: 0, max: 40, unit: '% canopy increase' },
      cool_roof: { min: 0, max: 80, unit: '% roof adoption' },
      water_consumption_reduction: { min: 0, max: 50, unit: '% demand reduction' },
      rainwater_harvesting: { min: 0, max: 100, unit: '% property compliance' },
      drainage_improvement: { min: 0, max: 100, unit: '% canal capacity boost' },
      emissions_reduction: { min: 0, max: 70, unit: '% emissions cut' }
    },
    awsReadiness: {
      targetArchitecture: 'AWS App Runner / ECS Fargate + Amazon CloudFront',
      storageEngine: 'Amazon RDS (PostgreSQL/PostGIS ready) or EFS',
      security: 'TLS 1.3, strict CORS, non-root container'
    }
  });
});

// ==========================================
// 2. Cities and Geography
// ==========================================

apiRouter.get('/cities', (_req: Request, res: Response) => {
  res.json({
    count: CITIES.length,
    cities: CITIES
  });
});

apiRouter.get('/cities/:city_id/areas', (req: Request, res: Response) => {
  const cityId = req.params.city_id.toLowerCase();
  const areas = CITY_AREAS[cityId];
  if (!areas) {
    return res.status(404).json({
      error: 'CityNotFound',
      message: `City '${cityId}' not found. Available cities: ${CITIES.map((c) => c.id).join(', ')}`
    });
  }

  // Convert areas to GeoJSON FeatureCollection for standard GIS interoperability
  const geojson = {
    type: 'FeatureCollection',
    cityId,
    features: areas.map((area) => ({
      type: 'Feature',
      id: area.id,
      geometry: {
        type: 'Point',
        coordinates: [area.center[1], area.center[0]] // [lng, lat]
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

  res.json({
    cityId,
    count: areas.length,
    areas,
    geojson
  });
});

apiRouter.get('/cities/:city_id/layers/:layer', (req: Request, res: Response) => {
  const cityId = req.params.city_id.toLowerCase();
  const layerId = req.params.layer as EnvironmentalLayerId;
  const layerMeta = ENVIRONMENTAL_LAYERS.find((l) => l.id === layerId);

  if (!layerMeta) {
    return res.status(400).json({
      error: 'InvalidLayer',
      message: `Layer '${layerId}' is not supported. Supported layers: ${ENVIRONMENTAL_LAYERS.map((l) => l.id).join(', ')}`
    });
  }

  const areas = CITY_AREAS[cityId];
  if (!areas) {
    return res.status(404).json({
      error: 'CityNotFound',
      message: `City '${cityId}' not found.`
    });
  }

  const layerData = areas.map((area) => ({
    areaId: area.id,
    areaName: area.name,
    center: area.center,
    value: area.baselineIndicators[layerId],
    unit: layerMeta.unit,
    vulnerabilityRank: area.vulnerabilityRank
  }));

  res.json({
    cityId,
    layer: layerMeta,
    areas: layerData
  });
});

// ==========================================
// 3. Environmental Data and Provenance
// ==========================================

apiRouter.get('/environmental-data', (_req: Request, res: Response) => {
  res.json({
    datasetCount: DATA_PROVENANCE_RECORDS.length,
    datasets: DATA_PROVENANCE_RECORDS
  });
});

apiRouter.get('/environmental-data/sources', (_req: Request, res: Response) => {
  res.json({
    sources: DATA_PROVENANCE_RECORDS.map((d) => ({
      id: d.id,
      name: d.name,
      organization: d.sourceOrganization,
      url: d.sourceUrl,
      classification: d.classification,
      observationPeriod: d.observationPeriod
    }))
  });
});

apiRouter.get('/environmental-data/:feature_id', (req: Request, res: Response) => {
  const featureId = req.params.feature_id;
  // Look across all city areas for this area/feature
  for (const [cityId, areas] of Object.entries(CITY_AREAS)) {
    const area = areas.find((a) => a.id === featureId);
    if (area) {
      const city = CITIES.find((c) => c.id === cityId);
      return res.json({
        featureId,
        city: { id: city?.id, name: city?.name },
        area,
        provenanceSources: DATA_PROVENANCE_RECORDS.map((p) => p.name),
        dataClassification: 'Demonstration & Semi-Empirical Regional Observed'
      });
    }
  }

  res.status(404).json({
    error: 'FeatureNotFound',
    message: `Geographic feature with ID '${featureId}' not found.`
  });
});

// ==========================================
// 4. Simulation Engine
// ==========================================

apiRouter.post('/simulations/run', (req: Request, res: Response) => {
  try {
    const input = req.body;
    const result = executeSimulation({
      cityId: input.cityId || 'bengaluru',
      targetYear: Number(input.targetYear) as TargetYear,
      interventions: input.interventions
    });

    simulationCache.set(result.id, result);
    storage.recordSimulationRun(result);

    res.status(200).json(result);
  } catch (err: any) {
    if (err instanceof SimulationValidationError) {
      return res.status(400).json({ error: 'ValidationError', message: err.message });
    }
    console.error('Simulation error:', err);
    res.status(500).json({ error: 'SimulationError', message: err.message || 'Internal simulation error' });
  }
});

apiRouter.post('/simulations/compare', (req: Request, res: Response) => {
  try {
    const { cityId = 'bengaluru', targetYear = 2035, baselineInterventions, scenarioInterventions } = req.body;

    // Zero intervention baseline
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

    res.json({
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
    });
  } catch (err: any) {
    res.status(400).json({ error: 'ComparisonError', message: err.message });
  }
});

apiRouter.get('/simulations/:simulation_id', (req: Request, res: Response) => {
  const id = req.params.simulation_id;
  const cached = simulationCache.get(id);
  if (!cached) {
    return res.status(404).json({
      error: 'SimulationNotFound',
      message: `Simulation '${id}' not found in active session cache.`
    });
  }
  res.json(cached);
});

// ==========================================
// 5. Scenarios (Persistence)
// ==========================================

apiRouter.get('/scenarios', (req: Request, res: Response) => {
  const cityId = req.query.cityId as string | undefined;
  const scenarios = storage.getScenarios(cityId);
  res.json({
    count: scenarios.length,
    scenarios
  });
});

apiRouter.get('/scenarios/:scenario_id', (req: Request, res: Response) => {
  const scenario = storage.getScenarioById(req.params.scenario_id);
  if (!scenario) {
    return res.status(404).json({
      error: 'ScenarioNotFound',
      message: `Scenario '${req.params.scenario_id}' not found.`
    });
  }
  res.json(scenario);
});

apiRouter.post('/scenarios', (req: Request, res: Response) => {
  try {
    const { title, description, cityId, cityName, targetYear, interventions, resilienceScore, resilienceGain, tags } = req.body;
    if (!title || !cityId || !targetYear || !interventions) {
      return res.status(400).json({
        error: 'MissingFields',
        message: 'Scenario title, cityId, targetYear, and interventions are required.'
      });
    }

    const saved = storage.saveScenario({
      title,
      description: description || 'User-customized city future simulation scenario',
      cityId,
      cityName: cityName || CITIES.find((c) => c.id === cityId)?.name || cityId,
      targetYear: Number(targetYear) as TargetYear,
      interventions,
      resilienceScore: Number(resilienceScore) || 50,
      resilienceGain: Number(resilienceGain) || 10,
      tags: tags || ['Custom Scenario']
    });

    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'PersistenceError', message: err.message });
  }
});

apiRouter.delete('/scenarios/:scenario_id', (req: Request, res: Response) => {
  const deleted = storage.deleteScenario(req.params.scenario_id);
  if (!deleted) {
    return res.status(404).json({
      error: 'ScenarioNotFound',
      message: `Scenario '${req.params.scenario_id}' could not be found to delete.`
    });
  }
  res.json({ success: true, message: 'Scenario deleted successfully' });
});

// ==========================================
// 6. Interventions & Optimization
// ==========================================

apiRouter.get('/interventions', (_req: Request, res: Response) => {
  res.json({
    count: AVAILABLE_INTERVENTIONS.length,
    interventions: AVAILABLE_INTERVENTIONS
  });
});

apiRouter.post('/interventions/evaluate', (req: Request, res: Response) => {
  try {
    const { cityId = 'bengaluru', budgetMillions = 30, targetPriority = 'balanced' } = req.body;
    const result = optimizeInterventionPortfolio({
      cityId,
      budgetMillions: Number(budgetMillions),
      targetPriority
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: 'EvaluationError', message: err.message });
  }
});

// ==========================================
// 7. AI Strategist & Recommendations
// ==========================================

apiRouter.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const { simulation, userPrompt, focusAreaId } = req.body;
    if (!simulation) {
      return res.status(400).json({
        error: 'MissingSimulation',
        message: 'Must provide an active simulation result to synthesize recommendations.'
      });
    }

    const briefing = await generateAIStrategistBriefing({
      simulation,
      userPrompt,
      focusAreaId
    });

    res.json(briefing);
  } catch (err: any) {
    console.error('Recommendations error:', err);
    // Graceful fallback
    const fallback = generateDeterministicBriefing(req.body.simulation, req.body.userPrompt);
    res.json(fallback);
  }
});

apiRouter.get('/recommendations/priorities', (req: Request, res: Response) => {
  const cityId = (req.query.cityId as string) || 'bengaluru';
  const areas = CITY_AREAS[cityId] || CITY_AREAS.bengaluru;

  // Rank areas by vulnerability
  const ranked = [...areas].sort((a, b) => a.vulnerabilityRank - b.vulnerabilityRank);

  res.json({
    cityId,
    priorities: ranked.map((area) => ({
      rank: area.vulnerabilityRank,
      areaId: area.id,
      areaName: area.name,
      zone: area.zone,
      primaryHazard:
        area.baselineIndicators.flood_exposure > 85 ? 'Severe Monsoon Inundation' :
        area.baselineIndicators.extreme_heat > 85 ? 'Acute Urban Heat Sink' :
        area.baselineIndicators.water_stress > 85 ? 'Critical Groundwater Depletion' :
        'Compound Environmental Vulnerability',
      recommendedUrgentAction:
        area.characteristics.imperviousSurfacePercent > 80
          ? 'Deploy cool roofs and permeable pavement retrofits to alleviate surface heat and runoff.'
          : 'Rehabilitate drainage contours and expand vegetative retention bioswales.'
    }))
  });
});
