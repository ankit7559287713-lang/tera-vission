/**
 * EARTHSIM: City Futures Lab
 * Core Type Definitions
 */

export type TargetYear = 2025 | 2030 | 2035 | 2040;

export type EnvironmentalLayerId =
  | 'extreme_heat'
  | 'flood_exposure'
  | 'water_stress'
  | 'green_cover'
  | 'air_pollution';

export interface EnvironmentalLayerMeta {
  id: EnvironmentalLayerId;
  name: string;
  unit: string;
  scaleDescription: string;
  lowerIsBetter: boolean;
  colorScale: string[]; // Tailwind or hex colors
  icon: string;
}

export interface CityArea {
  id: string;
  cityId: string;
  name: string;
  zone: string;
  populationEstimate: number;
  areaKm2: number;
  center: [number, number]; // [lat, lng]
  svgPolygon: string; // SVG path or polygon points for crisp map rendering
  baselineIndicators: Record<EnvironmentalLayerId, number>; // 0-100 normalized score
  vulnerabilityRank: number; // 1 = highest risk
  characteristics: {
    canopyCoverPercent: number;
    imperviousSurfacePercent: number;
    floodDrainageCapacityPercent: number;
    groundwaterDepthMeters: number;
    pm25AnnualAvg: number;
  };
}

export interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  center: [number, number]; // [lat, lng]
  zoomLevel: number;
  description: string;
  currentYear: number;
  climateContext: string;
  areaCount: number;
  primaryRisks: EnvironmentalLayerId[];
  svgViewBox: string;
}

export interface InterventionParameters {
  urban_green_cover: number; // % increase (0 - 40%)
  cool_roof: number; // % adoption (0 - 80%)
  water_consumption_reduction: number; // % reduction (0 - 50%)
  rainwater_harvesting: number; // % adoption (0 - 100%)
  drainage_improvement: number; // % capacity increase (0 - 100%)
  emissions_reduction: number; // % emissions cut (0 - 70%)
}

export interface EnvironmentalIndicators {
  extreme_heat: number; // 0 - 100
  flood_exposure: number; // 0 - 100
  water_stress: number; // 0 - 100
  green_cover: number; // 0 - 100 (higher is better)
  air_pollution: number; // 0 - 100
}

export interface IndicatorDelta {
  layer: EnvironmentalLayerId;
  baseline: number;
  intervention: number;
  absoluteChange: number; // intervention - baseline
  relativeChangePercent: number; // % improvement or worsening
  improved: boolean;
  unit: string;
}

export interface AreaSimulationResult {
  areaId: string;
  areaName: string;
  baseline: EnvironmentalIndicators;
  intervention: EnvironmentalIndicators;
  deltas: Record<EnvironmentalLayerId, number>;
  vulnerabilityRank: number;
  topBenefitLayer: EnvironmentalLayerId;
}

export interface SimulationFormulaExplanation {
  layer: EnvironmentalLayerId;
  formula: string;
  appliedInputs: Record<string, number>;
  modeledOutput: string;
  primaryDrivers: string[];
}

export interface SimulationResult {
  id: string;
  cityId: string;
  cityName: string;
  targetYear: TargetYear;
  interventions: InterventionParameters;
  timestamp: string;
  baselineCitywide: EnvironmentalIndicators;
  interventionCitywide: EnvironmentalIndicators;
  deltas: IndicatorDelta[];
  overallResilienceScore: {
    baseline: number; // 0-100 composite
    intervention: number;
    gain: number;
  };
  areaResults: AreaSimulationResult[];
  mostAffectedAreas: {
    areaId: string;
    areaName: string;
    resilienceGain: number;
    priorityReason: string;
  }[];
  formulaExplanations: SimulationFormulaExplanation[];
  assumptions: string[];
  uncertainties: string[];
  limitations: string[];
  modelVersion: string;
  provenanceSummary: string;
}

export interface SavedScenario {
  id: string;
  title: string;
  description: string;
  cityId: string;
  cityName: string;
  targetYear: TargetYear;
  interventions: InterventionParameters;
  resilienceScore: number;
  resilienceGain: number;
  createdAt: string;
  tags: string[];
}

export interface InterventionOption {
  id: keyof InterventionParameters;
  name: string;
  category: 'Nature-Based' | 'Urban Infrastructure' | 'Water Resource' | 'Air Quality';
  description: string;
  implementationCostPerUnit: number; // in Millions USD / ₹ Cr per % unit
  unitLabel: string;
  maxFeasibleValue: number;
  targetRiskLayers: EnvironmentalLayerId[];
  coBenefits: string[];
  operationalTimeframeMonths: number;
  evidenceConfidence: 'High' | 'Moderate' | 'Emerging';
}

export interface EvaluatedInterventionRank {
  interventionId: keyof InterventionParameters;
  name: string;
  recommendedValue: number;
  estimatedCostMillions: number;
  impactScore: number; // 0-100
  costEffectivenessRatio: number; // Impact per $ Million
  rank: number;
  justification: string;
}

export interface InterventionOptimizationResult {
  cityId: string;
  budgetMillions: number;
  targetPriority: 'balanced' | EnvironmentalLayerId;
  totalCostMillions: number;
  remainingBudgetMillions: number;
  rankedInterventions: EvaluatedInterventionRank[];
  synthesizedScenario: InterventionParameters;
  projectedResilienceGain: number;
  optimizationRationale: string;
  limitations: string[];
}

export interface AIStrategistBriefing {
  executiveSummary: string;
  keyVulnerabilities: string[];
  recommendedActionPlan: {
    phase: string;
    timeframe: string;
    actions: string[];
    expectedOutcome: string;
  }[];
  criticalTradeoffs: string[];
  monitoringGaps: string[];
  confidenceAssessment: string;
  sourceAttribution: string;
}

export interface DataProvenanceRecord {
  id: string;
  name: string;
  sourceOrganization: string;
  sourceUrl: string;
  observationPeriod: string;
  geographicResolution: string;
  updateTimestamp: string;
  measurementUnits: string;
  classification: 'Observed' | 'Projected' | 'Modeled' | 'Illustrative';
  uncertaintyEstimate: string;
  processingNotes: string;
  relevantLayers: EnvironmentalLayerId[];
}
