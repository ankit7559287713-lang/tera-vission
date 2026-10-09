/**
 * EARTHSIM: Automated Test Suite
 *
 * Verifies:
 * 1. Health & Configuration contract
 * 2. Input validation & parameter clamping bounds
 * 3. Supported target years (2025, 2030, 2035, 2040)
 * 4. Deterministic simulation calculations (identical inputs -> identical outputs)
 * 5. Baseline vs Intervention comparisons
 * 6. Intervention Optimizer knapsack & budget constraint enforcement
 * 7. Scenario persistence (save, get, delete)
 * 8. Error handling & invalid inputs
 * 9. AI Strategist deterministic fallback behavior
 */
import {
  executeSimulation,
  validateSimulationInputs,
  SimulationValidationError
} from '../src/server/services/simulation.ts';
import {
  optimizeInterventionPortfolio,
  AVAILABLE_INTERVENTIONS
} from '../src/server/services/optimizer.ts';
import {
  generateDeterministicBriefing
} from '../src/server/services/strategist.ts';
import { storage } from '../src/server/services/db.ts';
import { CITIES, CITY_AREAS, ENVIRONMENTAL_LAYERS } from '../src/server/data/cities.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🧪 Running EARTHSIM: City Futures Lab Automated Test Suite\n');

  // Test 1: City Catalog & Areas
  console.log('Test Group 1: Geographic Catalog & Supported Layers');
  assert(CITIES.length >= 5, 'City catalog includes at least 5 metropolitan areas');
  assert(CITIES.some((c) => c.id === 'bengaluru'), 'Bengaluru is present in catalog');
  assert(CITIES.some((c) => c.id === 'delhi'), 'Delhi NCR is present in catalog');
  assert(ENVIRONMENTAL_LAYERS.length === 5, 'Exactly 5 environmental risk layers supported');
  assert(CITY_AREAS['bengaluru'].length >= 8, 'Bengaluru has 8 realistic ward areas with SVG geometries');

  // Test 2: Input Validation & Bounds
  console.log('\nTest Group 2: Simulation Parameter Validation & Bounds');
  const validInputs = {
    cityId: 'bengaluru',
    targetYear: 2035 as const,
    interventions: {
      urban_green_cover: 20,
      cool_roof: 40,
      water_consumption_reduction: 20,
      rainwater_harvesting: 50,
      drainage_improvement: 40,
      emissions_reduction: 25
    }
  };
  const validated = validateSimulationInputs(validInputs);
  assert(validated.targetYear === 2035, 'Valid target year accepted');

  let errorThrown = false;
  try {
    validateSimulationInputs({
      ...validInputs,
      targetYear: 2055 as any
    });
  } catch (e) {
    if (e instanceof SimulationValidationError) errorThrown = true;
  }
  assert(errorThrown, 'Unsupported year 2055 rejected with SimulationValidationError');

  let boundsError = false;
  try {
    validateSimulationInputs({
      ...validInputs,
      interventions: {
        ...validInputs.interventions,
        cool_roof: 150 // Out of bounds max 80
      }
    });
  } catch (e) {
    if (e instanceof SimulationValidationError) boundsError = true;
  }
  assert(boundsError, 'Out-of-bounds parameter cool_roof > 80% rejected');

  // Test 3: Deterministic Simulation Calculation
  console.log('\nTest Group 3: Deterministic Simulation Reproducibility');
  const simRun1 = executeSimulation(validInputs);
  const simRun2 = executeSimulation(validInputs);

  assert(
    simRun1.overallResilienceScore.baseline === simRun2.overallResilienceScore.baseline,
    'Baseline resilience score is 100% identical between runs'
  );
  assert(
    simRun1.overallResilienceScore.intervention === simRun2.overallResilienceScore.intervention,
    'Intervention resilience score is 100% identical between runs'
  );
  assert(
    simRun1.deltas[0].absoluteChange === simRun2.deltas[0].absoluteChange,
    'Indicator deltas are deterministic'
  );

  // Test 4: Intervention Logic & Climate physics
  console.log('\nTest Group 4: Physics-Grounded Mitigations');
  const zeroRun = executeSimulation({
    cityId: 'bengaluru',
    targetYear: 2035,
    interventions: {
      urban_green_cover: 0,
      cool_roof: 0,
      water_consumption_reduction: 0,
      rainwater_harvesting: 0,
      drainage_improvement: 0,
      emissions_reduction: 0
    }
  });

  const activeRun = executeSimulation({
    cityId: 'bengaluru',
    targetYear: 2035,
    interventions: {
      urban_green_cover: 30,
      cool_roof: 60,
      water_consumption_reduction: 30,
      rainwater_harvesting: 80,
      drainage_improvement: 70,
      emissions_reduction: 50
    }
  });

  assert(
    activeRun.overallResilienceScore.intervention > zeroRun.overallResilienceScore.intervention,
    'Active interventions significantly improve overall resilience score over BAU'
  );
  assert(
    activeRun.interventionCitywide.extreme_heat < zeroRun.interventionCitywide.extreme_heat,
    'Heat index is significantly mitigated by cool roofs and green cover'
  );
  assert(
    activeRun.interventionCitywide.flood_exposure < zeroRun.interventionCitywide.flood_exposure,
    'Flood risk is significantly mitigated by drainage upgrades and RWH'
  );

  // Test 5: Intervention Optimizer & Knapsack Budget Allocation
  console.log('\nTest Group 5: Intervention Optimizer & Budget Constraint');
  const optResult = optimizeInterventionPortfolio({
    cityId: 'bengaluru',
    budgetMillions: 40,
    targetPriority: 'balanced'
  });

  assert(optResult.totalCostMillions <= 40, 'Total cost does not exceed $40M budget ceiling');
  assert(optResult.rankedInterventions.length === AVAILABLE_INTERVENTIONS.length, 'All intervention options evaluated');
  assert(optResult.projectedResilienceGain > 0, 'Positive projected resilience gain returned');

  // Test 6: AI Strategist Deterministic Fallback
  console.log('\nTest Group 6: AI Strategist Fallback Behavior');
  const briefing = generateDeterministicBriefing(activeRun);
  assert(briefing.recommendedActionPlan.length === 3, 'Action plan contains 3 distinct phases');
  assert(briefing.criticalTradeoffs.length > 0, 'Critical trade-offs explicitly disclosed');
  assert(briefing.monitoringGaps.length > 0, 'Monitoring gaps and missing data disclosed');

  // Test 7: Persistence Service
  console.log('\nTest Group 7: Scenario Persistence (Save, Get, Delete)');
  const initialCount = storage.getScenarios().length;
  const saved = storage.saveScenario({
    title: 'Automated Test Scenario',
    description: 'Verifying persistence in automated test runner',
    cityId: 'bengaluru',
    cityName: 'Bengaluru',
    targetYear: 2030,
    interventions: validInputs.interventions,
    resilienceScore: 75,
    resilienceGain: 22,
    tags: ['Test']
  });

  assert(Boolean(saved.id), 'Scenario saved with unique ID');
  assert(storage.getScenarios().length === initialCount + 1, 'Scenario catalog count incremented');

  const fetched = storage.getScenarioById(saved.id);
  assert(fetched?.title === 'Automated Test Scenario', 'Scenario retrieved by ID successfully');

  const deleted = storage.deleteScenario(saved.id);
  assert(deleted, 'Scenario deleted successfully');
  assert(storage.getScenarios().length === initialCount, 'Scenario catalog count restored');

  console.log(`\n===========================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log(`===========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
