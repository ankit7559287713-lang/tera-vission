/**
 * EARTHSIM: Persistence Layer
 *
 * Provides persistent storage for saved scenarios and simulation run history.
 * Uses atomic JSON storage with initial high-fidelity seed scenarios.
 */
import fs from 'fs';
import path from 'path';
import { SavedScenario, SimulationResult } from '../../types/earthsim.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SCENARIOS_FILE = path.join(DATA_DIR, 'scenarios.json');
const RUNS_FILE = path.join(DATA_DIR, 'simulation_runs.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_SEEDED_SCENARIOS: SavedScenario[] = [
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

export class StorageService {
  private scenarios: SavedScenario[] = [];
  private runLogs: Array<{ id: string; cityId: string; timestamp: string; resilienceGain: number }> = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (fs.existsSync(SCENARIOS_FILE)) {
        const raw = fs.readFileSync(SCENARIOS_FILE, 'utf-8');
        this.scenarios = JSON.parse(raw);
      } else {
        this.scenarios = [...DEFAULT_SEEDED_SCENARIOS];
        this.persistScenarios();
      }
    } catch (e) {
      console.warn('Failed reading scenarios.json, resetting to seed defaults', e);
      this.scenarios = [...DEFAULT_SEEDED_SCENARIOS];
      this.persistScenarios();
    }

    try {
      if (fs.existsSync(RUNS_FILE)) {
        const raw = fs.readFileSync(RUNS_FILE, 'utf-8');
        this.runLogs = JSON.parse(raw);
      } else {
        this.runLogs = [];
        this.persistRuns();
      }
    } catch (e) {
      this.runLogs = [];
    }
  }

  private persistScenarios() {
    try {
      fs.writeFileSync(SCENARIOS_FILE, JSON.stringify(this.scenarios, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting scenarios:', err);
    }
  }

  private persistRuns() {
    try {
      fs.writeFileSync(RUNS_FILE, JSON.stringify(this.runLogs, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting runs:', err);
    }
  }

  public getScenarios(cityId?: string): SavedScenario[] {
    if (cityId) {
      return this.scenarios.filter((s) => s.cityId === cityId);
    }
    return [...this.scenarios];
  }

  public getScenarioById(id: string): SavedScenario | undefined {
    return this.scenarios.find((s) => s.id === id);
  }

  public saveScenario(scenario: Omit<SavedScenario, 'id' | 'createdAt'>): SavedScenario {
    const newScenario: SavedScenario = {
      ...scenario,
      id: `scen_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.scenarios.unshift(newScenario);
    this.persistScenarios();
    return newScenario;
  }

  public deleteScenario(id: string): boolean {
    const initialLen = this.scenarios.length;
    this.scenarios = this.scenarios.filter((s) => s.id !== id);
    if (this.scenarios.length !== initialLen) {
      this.persistScenarios();
      return true;
    }
    return false;
  }

  public recordSimulationRun(sim: SimulationResult): void {
    this.runLogs.unshift({
      id: sim.id,
      cityId: sim.cityId,
      timestamp: sim.timestamp,
      resilienceGain: sim.overallResilienceScore.gain
    });
    if (this.runLogs.length > 50) {
      this.runLogs = this.runLogs.slice(0, 50);
    }
    this.persistRuns();
  }

  public getSimulationHistory() {
    return [...this.runLogs];
  }
}

export const storage = new StorageService();
