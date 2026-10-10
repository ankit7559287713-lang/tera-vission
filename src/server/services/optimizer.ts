/**
 * EARTHSIM: Intervention Optimization & Budget Allocation Engine
 *
 * Implements a transparent, explainable knapsack / marginal cost-effectiveness
 * ranking algorithm to identify optimal climate resilience portfolios within budget constraints.
 */
import {
  EnvironmentalLayerId,
  EvaluatedInterventionRank,
  InterventionOption,
  InterventionOptimizationResult,
  InterventionParameters
} from '../../types/earthsim.ts';

export const AVAILABLE_INTERVENTIONS: InterventionOption[] = [
  {
    id: 'cool_roof',
    name: 'High-Albedo Cool Roof Retrofit',
    category: 'Urban Infrastructure',
    description: 'Application of high-reflectance (SRI ≥ 78) solar coatings on flat building slabs to reflect solar radiation and lower surface thermal absorption.',
    implementationCostPerUnit: 0.25, // $0.25M per 1% citywide coverage
    unitLabel: '% building roof adoption',
    maxFeasibleValue: 70,
    targetRiskLayers: ['extreme_heat'],
    coBenefits: ['Reduces indoor air temperature by 2–4°C', 'Lowers peak grid AC electricity load by 15%'],
    operationalTimeframeMonths: 12,
    evidenceConfidence: 'High'
  },
  {
    id: 'rainwater_harvesting',
    name: 'Mandatory RWH & Aquifer Injection Wells',
    category: 'Water Resource',
    description: 'Retrofitting decentralized rooftop catchment systems with deep-bore recharge filter shafts into deep aquifer strata.',
    implementationCostPerUnit: 0.35, // $0.35M per 1% citywide adoption
    unitLabel: '% property compliance',
    maxFeasibleValue: 80,
    targetRiskLayers: ['water_stress', 'flood_exposure'],
    coBenefits: ['Detains peak stormwater before entering main storm drains', 'Replenishes groundwater water tables'],
    operationalTimeframeMonths: 18,
    evidenceConfidence: 'High'
  },
  {
    id: 'urban_green_cover',
    name: 'Miyawaki Forests & Street Tree Canopies',
    category: 'Nature-Based',
    description: 'Dense native multi-tiered afforestation, bioswales, lake buffer bio-shields, and continuous street canopy shading.',
    implementationCostPerUnit: 0.65, // $0.65M per 1% citywide canopy gain
    unitLabel: '% canopy expansion',
    maxFeasibleValue: 35,
    targetRiskLayers: ['extreme_heat', 'flood_exposure', 'air_pollution'],
    coBenefits: ['Particulate PM2.5 filtering', 'Urban biodiversity restoration', 'Stormwater infiltration'],
    operationalTimeframeMonths: 36,
    evidenceConfidence: 'High'
  },
  {
    id: 'drainage_improvement',
    name: 'Ecological Stormwater Canals & Retention Ponds',
    category: 'Urban Infrastructure',
    description: 'Desilting and widening primary stormwater drains (rajakaluves/nullahs), permeable retention basins, and wetland reconnection.',
    implementationCostPerUnit: 0.75, // $0.75M per 1% capacity enhancement
    unitLabel: '% canal discharge capacity',
    maxFeasibleValue: 75,
    targetRiskLayers: ['flood_exposure'],
    coBenefits: ['Prevents recurring monsoon inundation at traffic bottlenecks', 'Protects informal low-lying settlements'],
    operationalTimeframeMonths: 24,
    evidenceConfidence: 'Moderate'
  },
  {
    id: 'water_consumption_reduction',
    name: 'Smart Metering & Industrial Greywater Recycling',
    category: 'Water Resource',
    description: 'District metered areas (DMAs) to eliminate non-revenue leaks, low-flow plumbing mandates, and dual-piping for treated wastewater reuse.',
    implementationCostPerUnit: 0.50, // $0.50M per 1% reduction
    unitLabel: '% demand reduction',
    maxFeasibleValue: 40,
    targetRiskLayers: ['water_stress'],
    coBenefits: ['Reduces municipal freshwater pumping energy', 'Extends reservoir storage buffer through dry spells'],
    operationalTimeframeMonths: 18,
    evidenceConfidence: 'Moderate'
  },
  {
    id: 'emissions_reduction',
    name: 'Low-Emission Transit & Industrial Scrubbing',
    category: 'Air Quality',
    description: 'Fleet electrification of public transit/logistics, construction dust containment barriers, and stack scrubbing enforcement.',
    implementationCostPerUnit: 0.90, // $0.90M per 1% emissions abatement
    unitLabel: '% emissions reduction',
    maxFeasibleValue: 50,
    targetRiskLayers: ['air_pollution'],
    coBenefits: ['Lowers incidence of childhood respiratory illness', 'Reduces black carbon atmospheric warming'],
    operationalTimeframeMonths: 30,
    evidenceConfidence: 'Moderate'
  }
];

export interface OptimizeInterventionsInput {
  cityId: string;
  budgetMillions: number;
  targetPriority: 'balanced' | EnvironmentalLayerId;
}

export function optimizeInterventionPortfolio(
  input: OptimizeInterventionsInput
): InterventionOptimizationResult {
  const requestedBudget = Number(input.budgetMillions);
  if (!Number.isFinite(requestedBudget) || requestedBudget < 5 || requestedBudget > 200) {
    throw new Error('Budget must be a finite number between $5M and $200M.');
  }
  const budget = Math.round(requestedBudget * 10) / 10;
  const priority = input.targetPriority || 'balanced';

  // Calculate effectiveness weights based on selected priority
  const evaluated: EvaluatedInterventionRank[] = AVAILABLE_INTERVENTIONS.map((item) => {
    let priorityMultiplier = 1.0;
    if (priority === 'balanced') {
      priorityMultiplier = item.targetRiskLayers.length * 0.7 + 0.5; // Multi-benefit actions rewarded
    } else if (item.targetRiskLayers.includes(priority)) {
      priorityMultiplier = 2.4; // Direct targeted match
    } else {
      priorityMultiplier = 0.35; // Secondary benefit only
    }

    // Impact score normalized (0-100) per 10% adoption
    const baseImpactPerUnit =
      item.id === 'cool_roof' ? 1.4 :
      item.id === 'rainwater_harvesting' ? 1.6 :
      item.id === 'urban_green_cover' ? 1.9 :
      item.id === 'drainage_improvement' ? 1.5 :
      item.id === 'water_consumption_reduction' ? 1.3 :
      1.2;

    const weightedImpact = baseImpactPerUnit * priorityMultiplier;
    const costPerPercent = item.implementationCostPerUnit;
    const costEffectivenessRatio = Math.round((weightedImpact / costPerPercent) * 10) / 10;

    return {
      interventionId: item.id,
      name: item.name,
      recommendedValue: 0,
      estimatedCostMillions: 0,
      impactScore: Math.round(weightedImpact * 10),
      costEffectivenessRatio,
      rank: 1,
      justification: ''
    };
  });

  // Sort descending by cost-effectiveness ratio (Greedy Knapsack heuristic)
  evaluated.sort((a, b) => b.costEffectivenessRatio - a.costEffectivenessRatio);

  let remainingBudget = budget;
  const synthesizedScenario: InterventionParameters = {
    urban_green_cover: 0,
    cool_roof: 0,
    water_consumption_reduction: 0,
    rainwater_harvesting: 0,
    drainage_improvement: 0,
    emissions_reduction: 0
  };

  // Allocate budget incrementally down the ranked list
  evaluated.forEach((item, index) => {
    item.rank = index + 1;
    const option = AVAILABLE_INTERVENTIONS.find((o) => o.id === item.interventionId)!;

    // Determine target allocation slice (e.g. 35% of total budget or up to maxFeasible)
    const maxExpenditureForOption = option.maxFeasibleValue * option.implementationCostPerUnit;
    const maxAllocatable = Math.min(
      maxExpenditureForOption,
      remainingBudget * (index === 0 ? 0.45 : index === 1 ? 0.35 : 0.25)
    );

    // If it's high priority, allow taking whatever is left if budget permits
    const allocatedCost = Math.min(remainingBudget, maxAllocatable);
    const affordableUnits = Math.floor((allocatedCost + 1e-9) / option.implementationCostPerUnit);
    const recommendedValue = Math.min(option.maxFeasibleValue, affordableUnits);
    const finalCost = Math.round(recommendedValue * option.implementationCostPerUnit * 100) / 100;

    item.recommendedValue = recommendedValue;
    item.estimatedCostMillions = finalCost;
    remainingBudget = Math.max(0, Math.round((remainingBudget - finalCost) * 100) / 100);

    synthesizedScenario[item.interventionId] = recommendedValue;

    item.justification = `Provides ${item.costEffectivenessRatio}x impact-to-cost return. Recommended deployment at ${recommendedValue}${option.unitLabel.includes('%') ? '%' : ''} for $${finalCost}M.`;
  });

  // Calculate projected composite resilience gain
  const totalCost = Math.round((budget - remainingBudget) * 100) / 100;
  const projectedResilienceGain = Math.min(
    42,
    Math.round(
      synthesizedScenario.cool_roof * 0.18 +
      synthesizedScenario.rainwater_harvesting * 0.22 +
      synthesizedScenario.urban_green_cover * 0.32 +
      synthesizedScenario.drainage_improvement * 0.20 +
      synthesizedScenario.water_consumption_reduction * 0.16 +
      synthesizedScenario.emissions_reduction * 0.14
    )
  );

  return {
    cityId: input.cityId,
    budgetMillions: budget,
    targetPriority: priority,
    totalCostMillions: totalCost,
    remainingBudgetMillions: remainingBudget,
    rankedInterventions: evaluated,
    synthesizedScenario,
    projectedResilienceGain,
    optimizationRationale:
      priority === 'balanced'
        ? `Optimized for maximum multi-system co-benefits across heat, flood, water, and air under the $${budget}M cap.`
        : `Targeted knapsack allocation heavily weighting ${priority.replace('_', ' ')} mitigation return on investment.`,
    limitations: [
      'Unit capital costs represent median municipal pilot tender benchmarks in Indian metro regions (2024-2025).',
      'Does not model inflationary labor fluctuations or multi-year phased financing tranches.',
      'Actual procurement may require state and municipal legislative sanction.'
    ]
  };
}
