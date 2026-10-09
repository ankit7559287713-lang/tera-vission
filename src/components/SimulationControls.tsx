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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Header & Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Intervention Parameter Lab
            </h3>
            <p className="text-xs text-slate-400">
              Adjust policy &amp; engineering parameters for target year{' '}
              <span className="text-emerald-400 font-semibold">{targetYear}</span>
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
            <button
              onClick={() => applyPreset('sponge')}
              className="px-2 py-0.5 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded transition-colors"
            >
              Sponge City
            </button>
            <button
              onClick={() => applyPreset('cool')}
              className="px-2 py-0.5 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded transition-colors"
            >
              Cool Roofs
            </button>
            <button
              onClick={() => applyPreset('air')}
              className="px-2 py-0.5 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 rounded transition-colors"
            >
              Clean Sky
            </button>
            <button
              onClick={() => applyPreset('aggressive')}
              className="px-2 py-0.5 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded transition-colors"
            >
              Max Resilience
            </button>
            <button
              onClick={() => applyPreset('baseline')}
              title="Reset to 0 (Do Nothing)"
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6 Parameter Sliders */}
        <div className="space-y-4">
          {/* 1. Urban Green Cover */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <TreeDeciduous className="w-4 h-4 text-emerald-400" />
                Urban Green Cover Expansion
              </span>
              <span className="font-mono text-emerald-400 font-bold">
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
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (BAU loss)</span>
              <span>20% (Standard target)</span>
              <span>40% (Maximum afforestation)</span>
            </div>
          </div>

          {/* 2. Cool Roof */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                High-Albedo Cool Roof Retrofit
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {parameters.cool_roof}% roofs
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="2"
              value={parameters.cool_roof}
              onChange={(e) => updateParam('cool_roof', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Existing dark bitumen)</span>
              <span>40% (Commercial/Gov)</span>
              <span>80% (Citywide mandate)</span>
            </div>
          </div>

          {/* 3. Water Consumption Reduction */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Water Demand Reduction &amp; Metering
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                -{parameters.water_consumption_reduction}% demand
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={parameters.water_consumption_reduction}
              onChange={(e) => updateParam('water_consumption_reduction', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Overdraft continues)</span>
              <span>25% (Leakage reduction)</span>
              <span>50% (Industrial dual piping)</span>
            </div>
          </div>

          {/* 4. Rainwater Harvesting */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-sky-400" />
                Rainwater Harvesting &amp; Recharge Shafts
              </span>
              <span className="font-mono text-sky-400 font-bold">
                {parameters.rainwater_harvesting}% compliance
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={parameters.rainwater_harvesting}
              onChange={(e) => updateParam('rainwater_harvesting', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Runoff discarded)</span>
              <span>50% (New builds only)</span>
              <span>100% (Universal catchment)</span>
            </div>
          </div>

          {/* 5. Drainage Canal Upgrade */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                Stormwater Canals &amp; Retention Basins
              </span>
              <span className="font-mono text-indigo-400 font-bold">
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
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Current silted drains)</span>
              <span>50% (Primary rajakaluves)</span>
              <span>100% (Full ecological network)</span>
            </div>
          </div>

          {/* 6. Emissions Reduction */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-rose-400" />
                Emissions &amp; Transit Electrification
              </span>
              <span className="font-mono text-rose-400 font-bold">
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
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Fossil fleet growth)</span>
              <span>35% (EV buses &amp; metro)</span>
              <span>70% (Full clean corridor)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-5 mt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onRunSimulation}
          disabled={isLoading}
          className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
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
          className="w-full sm:w-auto py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          title="Save this simulation scenario"
        >
          <BookmarkPlus className="w-4 h-4 text-emerald-400" />
          <span>Save Future</span>
        </button>
      </div>
    </div>
  );
};
