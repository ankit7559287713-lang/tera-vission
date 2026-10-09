/**
 * TETRA VISION: Complete Automated Test Suite
 *
 * Verifies all 14 mandatory quality criteria:
 * 1. All years from 2025 through 2040 are accepted.
 * 2. Years below 2025 and above 2040 are rejected.
 * 3. Every supported year produces a valid simulation.
 * 4. Population projections change correctly when the year changes.
 * 5. Population calculations use the documented baseline and growth assumption.
 * 6. Invalid population/input data is handled safely.
 * 7. Environmental values are finite and remain within valid score ranges (0-100).
 * 8. Intervention and baseline scenarios behave consistently.
 * 9. Zero interventions do not create artificial benefits (intervention == baseline).
 * 10. Area and citywide aggregations are consistent.
 * 11. Government data metadata is preserved and accurately classified.
 * 12. Missing or unavailable source data triggers documented fallback.
 * 13. API validation and error responses work correctly.
 * 14. Existing saved scenarios, optimizer, comparison, and strategist functionality works.
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
import { DATA_PROVENANCE_RECORDS } from '../src/server/data/provenance.ts';

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
  console.log('\n🧪 Running TETRA VISION Platform Automated Test Suite\n');

  const defaultInterventions = {
    urban_green_cover: 20,
    cool_roof: 40,
    water_consumption_reduction: 20,
    rainwater_harvesting: 50,
    drainage_improvement: 40,
    emissions_reduction: 25
  };

  // Test 1: All individual years from 2025 through 2040 accepted
  console.log('Test Group 1: Year Support Range (2025–2040)');
  let allSupported = true;
  for (let yr = 2025; yr <= 2040; yr++) {
    try {
      const validated = validateSimulationInputs({
        cityId: 'bengaluru',
        targetYear: yr as any,
        interventions: defaultInterventions
      });
      if (validated.targetYear !== yr) allSupported = false;
    } catch {
      allSupported = false;
    }
  }
  assert(allSupported, 'Criterion 1: All individual years from 2025 through 2040 pass validation');

  // Test 2: Years below 2025 and above 2040 are rejected
  console.log('\nTest Group 2: Rejection of Out-of-Range Years');
  let rejectedBelow = false;
  let rejectedAbove = false;
  try {
    validateSimulationInputs({
      cityId: 'bengaluru',
      targetYear: 2024 as any,
      interventions: defaultInterventions
    });
  } catch (e) {
    if (e instanceof SimulationValidationError) rejectedBelow = true;
  }

  try {
    validateSimulationInputs({
      cityId: 'bengaluru',
      targetYear: 2041 as any,
      interventions: defaultInterventions
    });
  } catch (e) {
    if (e instanceof SimulationValidationError) rejectedAbove = true;
  }
  assert(rejectedBelow, 'Criterion 2a: Year below 2025 (2024) rejected with SimulationValidationError');
  assert(rejectedAbove, 'Criterion 2b: Year above 2040 (2041) rejected with SimulationValidationError');

  // Test 3: Every supported year produces a valid simulation
  console.log('\nTest Group 3: Valid Simulation for Every Year');
  let allSimulationsValid = true;
  for (let yr = 2025; yr <= 2040; yr++) {
    const sim = executeSimulation({
      cityId: 'bengaluru',
      targetYear: yr as any,
      interventions: defaultInterventions
    });
    if (!sim || !sim.id || !sim.populationProjection || !sim.baselineCitywide) {
      allSimulationsValid = false;
    }
  }
  assert(allSimulationsValid, 'Criterion 3: Every year 2025..2040 produces a complete, valid simulation');

  // Test 4: Population projections change correctly when the year changes
  console.log('\nTest Group 4: Population Projection Progression');
  const sim2025 = executeSimulation({
    cityId: 'bengaluru',
    targetYear: 2025,
    interventions: defaultInterventions
  });
  const sim2030 = executeSimulation({
    cityId: 'bengaluru',
    targetYear: 2030,
    interventions: defaultInterventions
  });
  const sim2040 = executeSimulation({
    cityId: 'bengaluru',
    targetYear: 2040,
    interventions: defaultInterventions
  });

  assert(
    sim2030.populationProjection.projectedPopulation > sim2025.populationProjection.projectedPopulation,
    'Criterion 4a: Population in 2030 is strictly greater than 2025 under positive growth rate'
  );
  assert(
    sim2040.populationProjection.projectedPopulation > sim2030.populationProjection.projectedPopulation,
    'Criterion 4b: Population in 2040 is strictly greater than 2030 under positive growth rate'
  );

  // Test 5: Population calculations use documented baseline and growth formula: P(t) = P(2011) * (1+r)^(t-2011)
  console.log('\nTest Group 5: Official Population Mathematics Verification');
  const city = CITIES.find((c) => c.id === 'bengaluru')!;
  const expectedPop2035 = Math.round(city.baselinePopulation2011 * Math.pow(1 + city.annualGrowthRate, 2035 - 2011));
  const sim2035 = executeSimulation({
    cityId: 'bengaluru',
    targetYear: 2035,
    interventions: defaultInterventions
  });
  assert(
    sim2035.populationProjection.projectedPopulation === expectedPop2035,
    'Criterion 5: Population matches exact formula P(2011) * (1 + r)^(2035-2011)'
  );
  assert(
    sim2035.populationProjection.baselineReferenceYear === 2011,
    'Criterion 5b: Baseline reference year explicitly documented as 2011 (Census of India)'
  );

  // Test 6: Invalid population / simulation inputs handled safely
  console.log('\nTest Group 6: Input Error Handling & Bounds Clamping');
  let invalidCityHandled = false;
  try {
    validateSimulationInputs({
      cityId: 'non_existent_city',
      targetYear: 2030,
      interventions: defaultInterventions
    });
  } catch (e) {
    if (e instanceof SimulationValidationError) invalidCityHandled = true;
  }
  assert(invalidCityHandled, 'Criterion 6: Unknown city ID rejected safely');

  // Test 7: Environmental values are finite and remain within valid 0-100 score ranges
  console.log('\nTest Group 7: Finite & Bounded Environmental Indicators');
  let allFiniteAndBounded = true;
  for (const layer of ENVIRONMENTAL_LAYERS) {
    const valBase = sim2035.baselineCitywide[layer.id];
    const valInt = sim2035.interventionCitywide[layer.id];
    if (typeof valBase !== 'number' || isNaN(valBase) || valBase < 0 || valBase > 100) {
      allFiniteAndBounded = false;
    }
    if (typeof valInt !== 'number' || isNaN(valInt) || valInt < 0 || valInt > 100) {
      allFiniteAndBounded = false;
    }
  }
  assert(allFiniteAndBounded, 'Criterion 7: All baseline and intervention values are finite in [0, 100]');

  // Test 8: Intervention and baseline scenarios behave consistently
  console.log('\nTest Group 8: Consistent Baseline vs Intervention Shifts');
  assert(
    sim2035.interventionCitywide.extreme_heat < sim2035.baselineCitywide.extreme_heat,
    'Criterion 8a: Cool roofs and green cover reduce heat index compared to baseline'
  );
  assert(
    sim2035.interventionCitywide.green_cover > sim2035.baselineCitywide.green_cover,
    'Criterion 8b: Green cover intervention increases canopy cover over baseline'
  );

  // Test 9: Zero interventions do not create artificial benefits
  console.log('\nTest Group 9: Strict Invariant - Zero Interventions Produce Zero Benefits');
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
  assert(
    zeroRun.interventionCitywide.extreme_heat === zeroRun.baselineCitywide.extreme_heat &&
    zeroRun.interventionCitywide.flood_exposure === zeroRun.baselineCitywide.flood_exposure &&
    zeroRun.interventionCitywide.water_stress === zeroRun.baselineCitywide.water_stress &&
    zeroRun.interventionCitywide.green_cover === zeroRun.baselineCitywide.green_cover &&
    zeroRun.interventionCitywide.air_pollution === zeroRun.baselineCitywide.air_pollution,
    'Criterion 9a: Under 0% interventions, intervention scenario strictly equals baseline scenario'
  );
  assert(
    zeroRun.overallResilienceScore.gain === 0,
    'Criterion 9b: Under 0% interventions, resilience gain is strictly 0'
  );
  assert(
    zeroRun.deltas.every((d) => d.absoluteChange === 0),
    'Criterion 9c: Under 0% interventions, all indicator deltas are strictly 0'
  );

  // Test 10: Area and citywide aggregations are consistent
  console.log('\nTest Group 10: Mathematical Aggregation Consistency');
  const areas = sim2035.areaResults;
  const meanAreaHeat = Math.round((areas.reduce((acc, a) => acc + a.baseline.extreme_heat, 0) / areas.length) * 10) / 10;
  assert(
    Math.abs(meanAreaHeat - sim2035.baselineCitywide.extreme_heat) <= 0.2,
    'Criterion 10: Citywide baseline is mathematically consistent with area average'
  );

  // Test 11: Government data metadata is preserved and accurately classified
  console.log('\nTest Group 11: Official Government Data Provenance & Classifications');
  assert(DATA_PROVENANCE_RECORDS.length >= 7, 'Criterion 11a: At least 7 official datasets documented');
  assert(
    DATA_PROVENANCE_RECORDS.some((d) => d.sourceOrganization.includes('Office of the Registrar General') || d.id.includes('census')),
    'Criterion 11b: Census of India population dataset included'
  );
  assert(
    DATA_PROVENANCE_RECORDS.some((d) => d.classification === 'OfficialHistorical'),
    'Criterion 11c: OfficialHistorical classification supported and populated'
  );
  assert(
    DATA_PROVENANCE_RECORDS.some((d) => d.classification === 'SatelliteDerived'),
    'Criterion 11d: SatelliteDerived classification supported and populated'
  );

  // Test 12: Missing or unavailable source data triggers documented fallback
  console.log('\nTest Group 12: Ingestion Fallback Behavior');
  const { fetchLiveCityObservation } = await import('../src/server/services/ingestion.ts');
  const fallbackObs = await fetchLiveCityObservation('unknown_city');
  assert(Boolean(fallbackObs), 'Criterion 12: Unavailable city triggers graceful fallback observation stream');

  // Test 13: API validation & Parameter Bounds
  console.log('\nTest Group 13: Parameter Bounds & Clamping Validation');
  let outOfBoundsError = false;
  try {
    validateSimulationInputs({
      cityId: 'bengaluru',
      targetYear: 2030,
      interventions: {
        ...defaultInterventions,
        urban_green_cover: 99 // Max is 40
      }
    });
  } catch (e) {
    if (e instanceof SimulationValidationError) outOfBoundsError = true;
  }
  assert(outOfBoundsError, 'Criterion 13: Parameter out-of-bounds rejected with ValidationError');

  // Test 14: Existing saved scenarios, optimizer, comparison, and strategist functionality
  console.log('\nTest Group 14: Platform Ecosystem Integrity');
  // Optimizer
  const opt = optimizeInterventionPortfolio({
    cityId: 'bengaluru',
    budgetMillions: 30,
    targetPriority: 'balanced'
  });
  assert(opt.totalCostMillions <= 30, 'Criterion 14a: Optimizer respects budget constraint');
  assert(opt.projectedResilienceGain > 0, 'Criterion 14b: Optimizer yields positive resilience gain');

  // AI Strategist
  const briefing = generateDeterministicBriefing(sim2035);
  assert(briefing.recommendedActionPlan.length === 3, 'Criterion 14c: Strategist action plan has 3 phases');

  // Saved scenarios storage
  const saved = storage.saveScenario({
    title: 'Resilience Test Future',
    description: 'Automated verification run',
    cityId: 'bengaluru',
    cityName: 'Bengaluru',
    targetYear: 2035,
    interventions: defaultInterventions,
    resilienceScore: 78,
    resilienceGain: 25,
    tags: ['Automated']
  });
  assert(Boolean(saved.id), 'Criterion 14d: Scenario saved to persistent storage');
  const retrieved = storage.getScenarioById(saved.id);
  assert(retrieved?.title === 'Resilience Test Future', 'Criterion 14e: Scenario retrieved successfully');
  storage.deleteScenario(saved.id);

  console.log(`\n===========================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log(`===========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test runner failure:', e);
  process.exit(1);
});
