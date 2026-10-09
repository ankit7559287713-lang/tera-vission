import React from 'react';
import {
  InterventionParameters,
  SimulationResult,
  TargetYear
} from '../types/earthsim.ts';
import {
  Play,
  RotateCcw,
  Sparkles,
  BookmarkPlus,
  ShieldAlert,
  TreeDeciduous,
  Sun,
  Droplets,
  CloudRain,
  GitBranch,
  Wind
} from 'lucide-react';

interface SimulationControlsProps {
  parameters: InterventionParameters;
  onChangeParameters: (params: InterventionParameters) => void;
  onRunSimulation: () => void;
  isLoading: boolean;
  simulation: SimulationResult | null;
  targetYear: TargetYear;
  onOpenSaveModal: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  parameters,
  onChangeParameters,
  onRunSimulation,
  isLoading,
  simulation,
  targetYear,
  onOpenSaveModal
}) => {
  const updateParam = (key: keyof InterventionParameters, value: number) => {
    onChangeParameters({
      ...parameters,
      [key]: value
    });
  };

  // Presets
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'sponge':
        onChangeParameters({
          urban_green_cover: 22,
          cool_roof: 30,
          water_consumption_reduction: 25,
          rainwater_harvesting: 75,
          drainage_improvement: 70,
          emissions_reduction: 20
        });
        break;
      case 'cool':
        onChangeParameters({
          urban_green_cover: 35,
          cool_roof: 70,
          water_consumption_reduction: 15,
          rainwater_harvesting: 40,
          drainage_improvement: 30,
          emissions_reduction: 30
        });
        break;
      case 'air':
        onChangeParameters({
          urban_green_cover: 25,
          cool_roof: 40,
          water_consumption_reduction: 15,
          rainwater_harvesting: 35,
          drainage_improvement: 25,
          emissions_reduction: 65
        });
        break;
      case 'aggressive':
        onChangeParameters({
          urban_green_cover: 35,
          cool_roof: 65,
          water_consumption_reduction: 35,
          rainwater_harvesting: 80,
          drainage_improvement: 65,
          emissions_reduction: 55
        });
        break;
      case 'baseline':
        onChangeParameters({
          urban_green_cover: 0,
          cool_roof: 0,
          water_consumption_reduction: 0,
          rainwater_harvesting: 0,
          drainage_improvement: 0,
          emissions_reduction: 0
        });
        break;
    }
  };

  return (
    <div className="bg-white border border-[#DDE4DA] rounded-xl p-4 sm:p-5 flex flex-col justify-between h-full shadow-xs">
      {/* Header & Presets */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#DDE4DA]">
          <div>
            <h2 className="text-sm font-bold text-[#183D30] uppercase tracking-wide flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#245B43]" />
              Intervention Parameters
            </h2>
            <p className="text-xs text-[#66736A] mt-0.5">
              Simulate policy &amp; infrastructure interventions for horizon {targetYear}
            </p>
          </div>

          <button
            onClick={() => applyPreset('baseline')}
            className="text-xs text-[#66736A] hover:text-[#183D30] flex items-center gap-1 font-medium transition-colors cursor-pointer"
            title="Reset all interventions to 0% (Do Nothing / BAU)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to BAU (0%)</span>
          </button>
        </div>

        {/* Policy Presets Bar */}
        <div className="pt-3 pb-2">
          <div className="text-[11px] font-semibold text-[#66736A] mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#245B43]" /> Rapid Policy Portfolios:
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => applyPreset('sponge')}
              className="text-xs px-2.5 py-1 bg-[#F6F7F1] hover:bg-[#E7EEE5] border border-[#DDE4DA] rounded-lg text-[#183D30] font-medium transition-colors cursor-pointer"
            >
              🌧️ Sponge City
            </button>
            <button
              onClick={() => applyPreset('cool')}
              className="text-xs px-2.5 py-1 bg-[#F6F7F1] hover:bg-[#E7EEE5] border border-[#DDE4DA] rounded-lg text-[#183D30] font-medium transition-colors cursor-pointer"
            >
              🌿 Cool Corridors
            </button>
            <button
              onClick={() => applyPreset('air')}
              className="text-xs px-2.5 py-1 bg-[#F6F7F1] hover:bg-[#E7EEE5] border border-[#DDE4DA] rounded-lg text-[#183D30] font-medium transition-colors cursor-pointer"
            >
              ⚡ Clean Air &amp; EV
            </button>
            <button
              onClick={() => applyPreset('aggressive')}
              className="text-xs px-2.5 py-1 bg-[#E7EEE5] hover:bg-[#DDE4DA] border border-[#DDE4DA] rounded-lg text-[#245B43] font-semibold transition-colors cursor-pointer"
            >
              🛡️ Maximum Resilience
            </button>
          </div>
        </div>

        {/* Sliders Container (Scrollable if compact) */}
        <div className="space-y-4 pt-3 overflow-y-auto max-h-[340px] pr-1">
          {/* 1. Urban Green Cover */}
          <div className="space-y-1 bg-[#F6F7F1] p-2.5 rounded-lg border border-[#DDE4DA]">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#183D30] flex items-center gap-1.5">
                <TreeDeciduous className="w-3.5 h-3.5 text-emerald-700" />
                Urban Green Cover Expansion
              </label>
              <span className="font-mono text-[#245B43] font-bold">
                +{parameters.urban_green_cover}% canopy
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={parameters.urban_green_cover}
              onChange={(e) => updateParam('urban_green_cover', Number(e.target.value))}
              className="w-full h-1.5 bg-[#DDE4DA] rounded-lg appearance-none cursor-pointer accent-[#245B43]"
            />
            <div className="flex justify-between text-[10px] text-[#66736A]">
              <span>0% (No afforestation)</span>
              <span>20% (Urban greening)</span>
              <span>40% (Max density)</span>
            </div>
          </div>

          {/* 2. Cool Roof Adoption */}
          <div className="space-y-1 bg-[#F6F7F1] p-2.5 rounded-lg border border-[#DDE4DA]">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#183D30] flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                High-Albedo Cool Roofs (SRI ≥ 78)
              </label>
              <span className="font-mono text-amber-700 font-bold">
                {parameters.cool_roof}% adoption
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={parameters.cool_roof}
              onChange={(e) => updateParam('cool_roof', Number(e.target.value))}
              className="w-full h-1.5 bg-[#DDE4DA] rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-[#66736A]">
              <span>0% (Standard dark slabs)</span>
              <span>40% (Commercial/Govt)</span>
              <span>80% (Mandatory municipal code)</span>
            </div>
          </div>

          {/* 3. Water Consumption Reduction */}
          <div className="space-y-1 bg-[#F6F7F1] p-2.5 rounded-lg border border-[#DDE4DA]">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#183D30] flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-700" />
                Water Demand Reduction &amp; NRW Cut
              </label>
              <span className="font-mono text-sky-800 font-bold">
                -{parameters.water_consumption_reduction}% demand
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={parameters.water_consumption_reduction}
              onChange={(e) => updateParam('water_consumption_reduction', Number(e.target.value))}
              className="w-full h-1.5 bg-[#DDE4DA] rounded-lg appearance-none cursor-pointer accent-sky-700"
            />
            <div className="flex justify-between text-[10px] text-[#66736A]">
              <span>0% (Baseline consumption)</span>
              <span>25% (Dual-flush &amp; smart meters)</span>
              <span>50% (Industrial greywater reuse)</span>
            </div>
          </div>

          {/* 4. Rainwater Harvesting (RWH) */}
          <div className="space-y-1 bg-[#F6F7F1] p-2.5 rounded-lg border border-[#DDE4DA]">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#183D30] flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-700" />
                Rooftop Rainwater Harvesting &amp; Recharge
              </label>
              <span className="font-mono text-blue-800 font-bold">
                {parameters.rainwater_harvesting}% coverage
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={parameters.rainwater_harvesting}
              onChange={(e) => updateParam('rainwater_harvesting', Number(e.target.value))}
              className="w-full h-1.5 bg-[#DDE4DA] rounded-lg appearance-none cursor-pointer accent-blue-700"
            />
            <div className="flex justify-between text-[10px] text-[#66736A]">
              <span>0% (Low enforcement)</span>
              <span>50% (New builds only)</span>
              <span>100% (Universal ward compliance)</span>
            </div>
          </div>

          {/* 5. Drainage Improvement */}
          <div className="space-y-1 bg-[#F6F7F1] p-2.5 rounded-lg border border-[#DDE4DA]">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#183D30] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-700" />
                Storm Drainage Desilting &amp; Detention
              </label>
              <span className="font-mono text-indigo-800 font-bold">
                +{parameters.drainage_improvement}% capacity
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={parameters.drainage_improvement}
              onChange={(e) => updateParam('drainage_improvement', Number(e.target.value))}
              className="w-full h-1.5 bg-[#DDE4DA] rounded-lg appearance-none cursor-pointer accent-indigo-700"
            />
            <div className="flex justify-between text-[10px] text-[#66736A]">
              <span>0% (Annual siltation backlog)</span>
              <span>50% (Primary canal clearing)</span>
              <span>100% (Comprehensive retention system)</span>
            </div>
          </div>

          {/* 6. Emissions Reduction */}
          <div className="space-y-1 bg-[#F6F7F1] p-2.5 rounded-lg border border-[#DDE4DA]">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#183D30] flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-rose-700" />
                Transport &amp; Point-Source Emissions Cut
              </label>
              <span className="font-mono text-rose-700 font-bold">
                -{parameters.emissions_reduction}% emissions
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={parameters.emissions_reduction}
              onChange={(e) => updateParam('emissions_reduction', Number(e.target.value))}
              className="w-full h-1.5 bg-[#DDE4DA] rounded-lg appearance-none cursor-pointer accent-rose-700"
            />
            <div className="flex justify-between text-[10px] text-[#66736A]">
              <span>0% (Fossil fleet growth)</span>
              <span>35% (EV buses &amp; metro expansion)</span>
              <span>70% (Zero-emission freight zones)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-3 border-t border-[#DDE4DA] flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onRunSimulation}
          disabled={isLoading}
          className="w-full sm:flex-1 py-2.5 px-4 bg-[#245B43] hover:bg-[#183D30] disabled:bg-[#477F78] text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          <span>{isLoading ? 'Running Physics Model...' : 'Run Simulation'}</span>
        </button>

        <button
          onClick={onOpenSaveModal}
          disabled={!simulation}
          className="w-full sm:w-auto py-2.5 px-3.5 bg-white hover:bg-[#F6F7F1] disabled:opacity-50 text-[#183D30] border border-[#DDE4DA] font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          title="Save this simulation scenario"
        >
          <BookmarkPlus className="w-4 h-4 text-[#245B43]" />
          <span>Save Future</span>
        </button>
      </div>
    </div>
  );
};
