/**
 * EARTHSIM: City Futures Lab
 * Main Application Component
 */
import React, { useState, useEffect } from 'react';
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
import { MapViewer } from './components/MapViewer.tsx';
import { SimulationControls } from './components/SimulationControls.tsx';
import { ScenarioComparison } from './components/ScenarioComparison.tsx';
import { InterventionLab } from './components/InterventionLab.tsx';
import { AIStrategist } from './components/AIStrategist.tsx';
import { EvidenceProvenance } from './components/EvidenceProvenance.tsx';
import { SavedScenarios } from './components/SavedScenariosModal.tsx';
import { AWSArchitectureModal } from './components/AWSArchitectureModal.tsx';
import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  TreeDeciduous,
  Waves
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
  const [targetYear, setTargetYear] = useState<TargetYear>(2035);
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
  const [showAwsModal, setShowAwsModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        console.error('Failed initializing application:', err);
        setServerStatus('error');
        setErrorMessage('Failed connecting to EARTHSIM backend services. Please refresh.');
      }
    };

    initApp();
  }, []);

  // 2. Load City Data & Run Simulation
  const loadCityData = async (
    cityId: string,
    year: TargetYear,
    params: InterventionParameters
  ) => {
    setIsSimulating(true);
    setErrorMessage(null);
    try {
      const areaData = await api.getCityAreas(cityId);
      setAreas(areaData.areas);

      // Run initial simulation
      const simResult = await api.runSimulation({
        cityId,
        targetYear: year,
        interventions: params
      });
      setSimulation(simResult);
    } catch (err: any) {
      console.error('Error loading city data:', err);
      setErrorMessage(err.message || 'Error executing simulation.');
    } finally {
      setIsSimulating(false);
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

  // Switch Year
  const handleSelectYear = (year: TargetYear) => {
    setTargetYear(year);
    if (selectedCity) {
      loadCityData(selectedCity.id, year, parameters);
    }
  };

  // Run Manual Simulation
  const handleRunSimulation = async () => {
    if (!selectedCity) return;
    setIsSimulating(true);
    setErrorMessage(null);
    try {
      const result = await api.runSimulation({
        cityId: selectedCity.id,
        targetYear,
        interventions: parameters
      });
      setSimulation(result);
    } catch (err: any) {
      console.error('Simulation failed:', err);
      setErrorMessage(err.message || 'Simulation execution failed.');
    } finally {
      setIsSimulating(false);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        targetYear={targetYear}
        onSelectYear={handleSelectYear}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAwsModal={() => setShowAwsModal(true)}
        serverStatus={serverStatus}
      />

      {/* Error banner if any */}
      {errorMessage && (
        <div className="bg-rose-950/80 border-b border-rose-800 text-rose-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* TAB 1: Simulation Lab (Map + Parameter Controls) */}
        {activeTab === 'lab' && selectedCity && (
          <div className="space-y-6">
            {/* Quick Context Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-white">{selectedCity.name}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">{selectedCity.region}</span>
              </div>

              {simulation && (
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">Baseline BAU: </span>
                    <strong className="text-amber-400">{simulation.overallResilienceScore.baseline}/100</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">With Interventions: </span>
                    <strong className="text-emerald-400 font-bold">{simulation.overallResilienceScore.intervention}/100</strong>
                  </div>
                  <div className="text-cyan-400 font-bold">
                    (+{simulation.overallResilienceScore.gain} pts Gain)
                  </div>
                </div>
              )}
            </div>

            {/* Main Interactive Grid: Map + Sliders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map (7 cols on desktop) */}
              <div className="lg:col-span-7 h-[560px]">
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

              {/* Simulation Controls (5 cols on desktop) */}
              <div className="lg:col-span-5 h-[560px] flex flex-col">
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
          </div>
        )}

        {/* TAB 2: Futures Comparison */}
        {activeTab === 'compare' && (
          <ScenarioComparison simulation={simulation} areas={areas} />
        )}

        {/* TAB 3: Intervention Optimizer */}
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

        {/* TAB 5: Data & Evidence */}
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

      {/* Save Scenario Modal (if opened from SimulationControls) */}
      {showSaveDialog && activeTab !== 'scenarios' && (
        <SavedScenarios
          currentSimulation={simulation}
          onLoadScenario={handleLoadScenario}
          showSaveDialog={showSaveDialog}
          onCloseSaveDialog={() => setShowSaveDialog(false)}
        />
      )}

      {/* AWS Architecture & Hackathon Info Modal */}
      <AWSArchitectureModal
        isOpen={showAwsModal}
        onClose={() => setShowAwsModal(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">EARTHSIM: City Futures Lab</span>
            <span>·</span>
            <span>We Make Devs × AWS Bharat Builds Tour</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>Model v2.4-deterministic</span>
            <span>·</span>
            <span>CMIP6 SSP2-4.5</span>
            <span>·</span>
            <span>Copernicus &amp; Landsat-8</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
