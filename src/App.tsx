/**
 * TETRA VISION
 * Explore Tomorrow. Shape a Resilient Planet.
 * Main Application Controller
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  City,
  CityArea,
  EnvironmentalLayerId,
  InterventionParameters,
  SavedScenario,
  SimulationResult,
  TargetYear
} from './types/earthsim.ts';
import { api } from './api/client.ts';
import { Header } from './components/Header.tsx';
import { YearTimeline } from './components/YearTimeline.tsx';
import { MapViewer } from './components/MapViewer.tsx';
import { SimulationControls } from './components/SimulationControls.tsx';
import { ScenarioComparison } from './components/ScenarioComparison.tsx';
import { InterventionLab } from './components/InterventionLab.tsx';
import { AIStrategist } from './components/AIStrategist.tsx';
import { EvidenceProvenance } from './components/EvidenceProvenance.tsx';
import { SavedScenarios } from './components/SavedScenariosModal.tsx';
import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  TreeDeciduous,
  Waves,
  Thermometer,
  Droplets,
  Wind,
  Info,
  Users,
  Compass
} from 'lucide-react';

const INITIAL_PARAMETERS: InterventionParameters = {
  urban_green_cover: 20,
  cool_roof: 40,
  water_consumption_reduction: 20,
  rainwater_harvesting: 50,
  drainage_improvement: 45,
  emissions_reduction: 25
};

export default function App() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [areas, setAreas] = useState<CityArea[]>([]);
  const [targetYear, setTargetYear] = useState<TargetYear>(2030);
  const [parameters, setParameters] = useState<InterventionParameters>(INITIAL_PARAMETERS);
  const [activeLayer, setActiveLayer] = useState<EnvironmentalLayerId>('extreme_heat');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'baseline' | 'intervention' | 'delta'>('intervention');

  const [activeTab, setActiveTab] = useState<
    'lab' | 'compare' | 'optimizer' | 'strategist' | 'evidence' | 'scenarios'
  >('lab');

  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<'connected' | 'checking' | 'error'>('checking');
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Request race-condition protection ref
  const activeRequestRef = useRef<number>(0);

  // 1. Initial Load: Check Health & Fetch Cities
  useEffect(() => {
    const initApp = async () => {
      try {
        const health = await api.getHealth();
        if (health.status === 'healthy') {
          setServerStatus('connected');
        }

        const cityList = await api.getCities();
        setCities(cityList);

        if (cityList.length > 0) {
          const defaultCity = cityList.find((c) => c.id === 'bengaluru') || cityList[0];
          setSelectedCity(defaultCity);
          await loadCityData(defaultCity.id, targetYear, INITIAL_PARAMETERS);
        }
      } catch (err: any) {
        console.error('Failed initializing TETRA VISION platform:', err);
        setServerStatus('error');
        setErrorMessage('Failed connecting to TETRA VISION simulation services. Please refresh.');
      }
    };

    initApp();
  }, []);

  // 2. Load City Data & Run Simulation (with race condition protection for rapid timeline scrubbing)
  const loadCityData = async (
    cityId: string,
    year: TargetYear,
    params: InterventionParameters
  ) => {
    const currentReqId = ++activeRequestRef.current;
    setIsSimulating(true);
    setErrorMessage(null);

    try {
      const [areaData, simResult] = await Promise.all([
        api.getCityAreas(cityId),
        api.runSimulation({
          cityId,
          targetYear: year,
          interventions: params
        })
      ]);

      if (simResult.targetYear !== year || simResult.populationProjection?.targetYear !== year) {
        throw new Error(`Simulation returned year ${simResult.targetYear} for requested year ${year}. Please retry.`);
      }
      if (currentReqId === activeRequestRef.current) {
        setAreas(areaData.areas);
        setSimulation(simResult);
      }
    } catch (err: any) {
      if (currentReqId === activeRequestRef.current) {
        console.error('Error loading simulation data:', err);
        setErrorMessage(err.message || 'Error executing simulation run.');
      }
    } finally {
      if (currentReqId === activeRequestRef.current) {
        setIsSimulating(false);
      }
    }
  };

  // Switch City
  const handleSelectCity = (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    if (city) {
      setSelectedCity(city);
      setSelectedAreaId(null);
      loadCityData(city.id, targetYear, parameters);
    }
  };

  // Switch Year (from Timeline)
  const handleSelectYear = (year: TargetYear) => {
    setTargetYear(year);
    if (selectedCity) {
      loadCityData(selectedCity.id, year, parameters);
    }
  };

  // Run Manual Simulation
  const handleRunSimulation = async () => {
    if (!selectedCity) return;
    const currentReqId = ++activeRequestRef.current;
    setIsSimulating(true);
    setErrorMessage(null);
    try {
      const result = await api.runSimulation({
        cityId: selectedCity.id,
        targetYear,
        interventions: parameters
      });
      if (result.targetYear !== targetYear || result.populationProjection?.targetYear !== targetYear) {
        throw new Error(`Simulation returned year ${result.targetYear} for requested year ${targetYear}. Please retry.`);
      }
      if (currentReqId === activeRequestRef.current) {
        setSimulation(result);
      }
    } catch (err: any) {
      if (currentReqId === activeRequestRef.current) {
        console.error('Simulation failed:', err);
        setErrorMessage(err.message || 'Simulation execution failed.');
      }
    } finally {
      if (currentReqId === activeRequestRef.current) {
        setIsSimulating(false);
      }
    }
  };

  // Apply Portfolio from Optimizer
  const handleApplyOptimizerPortfolio = (newParams: InterventionParameters) => {
    setParameters(newParams);
    setActiveTab('lab');
    if (selectedCity) {
      loadCityData(selectedCity.id, targetYear, newParams);
    }
  };

  // Load Saved Scenario
  const handleLoadScenario = (scen: SavedScenario) => {
    const city = cities.find((c) => c.id === scen.cityId);
    if (city) {
      setSelectedCity(city);
    }
    setTargetYear(scen.targetYear);
    setParameters(scen.interventions);
    setActiveTab('lab');
    loadCityData(scen.cityId, scen.targetYear, scen.interventions);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F1] text-[#26332C] flex flex-col font-sans selection:bg-[#245B43] selection:text-white">
      {/* Navigation Header */}
      <Header
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        serverStatus={serverStatus}
      />

      {/* Error notification banner if any */}
      {errorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* TAB 1: Simulation Lab & Environmental Map */}
        {activeTab === 'lab' && selectedCity && (
          <div className="space-y-5">
            {/* 1. Concise Product Mission & Context Header */}
            <div className="bg-white border border-[#DDE4DA] rounded-xl p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#245B43] bg-[#E7EEE5] border border-[#DDE4DA] px-2 py-0.5 rounded">
                      Urban Climate Simulation Lab
                    </span>
                    <span className="text-xs text-[#66736A] font-medium">
                      Official Census 2011 Baseline &amp; CMIP6 SSP2-4.5 Multi-Model Calibration
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-[#183D30] tracking-tight">
                    Simulate Environmental Futures for {selectedCity.name}
                  </h1>
                  <p className="text-xs text-[#66736A] max-w-3xl leading-relaxed">
                    Explore how urban heat, flood exposure, groundwater overdraft, and air pollution evolve through 2040.
                    Test targeted interventions—such as cool roofs, urban forest buffers, and rainwater recharge—to evaluate resilience outcomes before implementing municipal capital works.
                  </p>
                </div>

                {simulation && (
                  <div className="flex items-center gap-4 bg-[#F6F7F1] border border-[#DDE4DA] px-4 py-2.5 rounded-xl text-xs font-mono">
                    <div className="text-right">
                      <div className="text-[10px] text-[#66736A] uppercase font-medium">Baseline Score</div>
                      <div className="text-base font-bold text-amber-700">
                        {simulation.overallResilienceScore.baseline}
                        <span className="text-[10px] text-[#66736A] font-normal">/100</span>
                      </div>
                    </div>
                    <div className="text-[#477F78] font-bold">→</div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#245B43] uppercase font-bold">With Actions</div>
                      <div className="text-base font-bold text-[#245B43]">
                        {simulation.overallResilienceScore.intervention}
                        <span className="text-[10px] text-[#66736A] font-normal">/100</span>
                      </div>
                    </div>
                    <div className="border-l border-[#DDE4DA] pl-3 text-right">
                      <div className="text-[10px] text-[#66736A] uppercase font-medium">Net Relief</div>
                      <div className="text-base font-bold text-emerald-800">
                        +{simulation.overallResilienceScore.gain} pts
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Scrollable Year Timeline (Every year from 2025 to 2040 inclusive) */}
            <YearTimeline
              selectedYear={targetYear}
              onSelectYear={handleSelectYear}
              isSimulating={isSimulating}
            />

            {/* 3. Official Population Projection KPI Panel */}
            {simulation && simulation.populationProjection && (
              <div className="bg-white border border-[#DDE4DA] rounded-xl p-4 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-5 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#E7EEE5] border border-[#DDE4DA] flex items-center justify-center text-[#245B43]">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#183D30] uppercase tracking-wide">
                          Official Population Projection Dynamics
                        </span>
                        <div className="text-[11px] text-[#66736A]">
                          Anchor: Census 2011 ({simulation.populationProjection.baselinePopulation.toLocaleString()} heads)
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#66736A] leading-relaxed">
                      Calibrated with MoHFW National Commission on Population Technical Group cohort projection rate (+{simulation.populationProjection.growthRatePercent}% p.a.).
                    </p>
                  </div>

                  <div className="md:col-span-7 grid grid-cols-3 gap-3 bg-[#F6F7F1] p-3 rounded-xl border border-[#DDE4DA] text-center">
                    <div>
                      <div className="text-[10px] text-[#66736A] uppercase font-medium">Census 2011 Baseline</div>
                      <div className="text-sm font-mono font-bold text-[#183D30]">
                        {(simulation.populationProjection.baselinePopulation / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-[10px] text-[#66736A]">Official enumeration</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-[#245B43] uppercase font-bold">
                        {simulation.targetYear} Horizon Projection
                      </div>
                      <div className="text-base font-mono font-bold text-[#245B43]">
                        {(simulation.populationProjection.projectedPopulation / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-[10px] text-[#245B43] font-medium">
                        {simulation.populationProjection.projectedPopulation.toLocaleString()} persons
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-[#66736A] uppercase font-medium">Net Growth from 2011</div>
                      <div className="text-sm font-mono font-bold text-emerald-800">
                        +{simulation.populationProjection.percentageChange}%
                      </div>
                      <div className="text-[10px] text-[#66736A]">
                        +{(simulation.populationProjection.absoluteChange / 1000000).toFixed(2)}M added
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Main Interactive Workspace: Map + Intervention Parameter Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Map (7 cols) */}
              <div className="lg:col-span-7 h-[580px]">
                <MapViewer
                  city={selectedCity}
                  areas={areas}
                  activeLayer={activeLayer}
                  onChangeLayer={setActiveLayer}
                  simulation={simulation}
                  selectedAreaId={selectedAreaId}
                  onSelectArea={setSelectedAreaId}
                  viewMode={viewMode}
                  onChangeViewMode={setViewMode}
                />
              </div>

              {/* Simulation Controls (5 cols) */}
              <div className="lg:col-span-5 h-[580px] flex flex-col">
                <SimulationControls
                  parameters={parameters}
                  onChangeParameters={setParameters}
                  onRunSimulation={handleRunSimulation}
                  isLoading={isSimulating}
                  simulation={simulation}
                  targetYear={targetYear}
                  onOpenSaveModal={() => setShowSaveDialog(true)}
                />
              </div>
            </div>

            {/* 5. Quick Environmental Indicator Metrics Strip */}
            {simulation && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                {simulation.deltas.map((delta) => {
                  const isGood = delta.improved;
                  return (
                    <div
                      key={delta.layer}
                      className="bg-white border border-[#DDE4DA] rounded-xl p-3.5 shadow-2xs space-y-1"
                    >
                      <div className="text-[11px] font-semibold text-[#183D30] capitalize">
                        {delta.layer.replace('_', ' ')}
                      </div>
                      <div className="flex items-baseline justify-between text-xs font-mono">
                        <span className="text-[#66736A]">{delta.baseline}</span>
                        <span className="text-[#477F78]">→</span>
                        <span className="text-[#183D30] font-bold">{delta.intervention}</span>
                        <span
                          className={`font-semibold text-xs ${
                            isGood ? 'text-emerald-800' : 'text-[#66736A]'
                          }`}
                        >
                          {delta.absoluteChange > 0 ? '+' : ''}{delta.absoluteChange}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#66736A]">
                        {delta.unit} · {delta.relativeChangePercent > 0 ? `+${delta.relativeChangePercent}%` : `${delta.relativeChangePercent}%`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Futures Comparison */}
        {activeTab === 'compare' && (
          <ScenarioComparison simulation={simulation} areas={areas} />
        )}

        {/* TAB 3: Intervention Optimizer & Budget */}
        {activeTab === 'optimizer' && selectedCity && (
          <InterventionLab
            cityId={selectedCity.id}
            cityName={selectedCity.name}
            onApplyPortfolio={handleApplyOptimizerPortfolio}
          />
        )}

        {/* TAB 4: AI City Strategist */}
        {activeTab === 'strategist' && (
          <AIStrategist simulation={simulation} />
        )}

        {/* TAB 5: Scientific Evidence & Data */}
        {activeTab === 'evidence' && <EvidenceProvenance />}

        {/* TAB 6: Saved Scenarios */}
        {activeTab === 'scenarios' && (
          <SavedScenarios
            currentSimulation={simulation}
            onLoadScenario={handleLoadScenario}
            showSaveDialog={showSaveDialog}
            onCloseSaveDialog={() => setShowSaveDialog(false)}
          />
        )}
      </main>

      {/* Save Scenario Modal Dialog */}
      {showSaveDialog && activeTab !== 'scenarios' && (
        <SavedScenarios
          currentSimulation={simulation}
          onLoadScenario={handleLoadScenario}
          showSaveDialog={showSaveDialog}
          onCloseSaveDialog={() => setShowSaveDialog(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#DDE4DA] bg-white py-5 px-4 sm:px-6 text-xs text-[#66736A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#183D30]">TETRA VISION</span>
            <span className="text-[#DDE4DA]">·</span>
            <span className="text-[#66736A]">Explore Tomorrow. Shape a Resilient Planet.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#66736A] flex-wrap justify-center">
            <span>Model v3.2-deterministic</span>
            <span>·</span>
            <span>Census of India 2011 Cohorts</span>
            <span>·</span>
            <span>IMD Gridded Surface Climatology</span>
            <span>·</span>
            <span>CPCB CAAQMS</span>
            <span>·</span>
            <span>CGWB NAQUIM</span>
            <span>·</span>
            <span>ISRO Bhuvan LULC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
