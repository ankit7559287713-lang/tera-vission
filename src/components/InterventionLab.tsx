import React, { useState, useEffect } from 'react';
import {
  EnvironmentalLayerId,
  InterventionOptimizationResult,
  InterventionParameters
} from '../types/earthsim.ts';
import { api } from '../api/client.ts';
import {
  DollarSign,
  TrendingUp,
  Cpu,
  CheckCircle,
  ArrowRight,
  Info,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

interface InterventionLabProps {
  cityId: string;
  cityName: string;
  onApplyPortfolio: (params: InterventionParameters) => void;
}

export const InterventionLab: React.FC<InterventionLabProps> = ({
  cityId,
  cityName,
  onApplyPortfolio
}) => {
  const [budget, setBudget] = useState<number>(35);
  const [priority, setPriority] = useState<'balanced' | EnvironmentalLayerId>('balanced');
  const [result, setResult] = useState<InterventionOptimizationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);

  const runOptimization = async (b: number, p: 'balanced' | EnvironmentalLayerId) => {
    setLoading(true);
    setApplied(false);
    try {
      const data = await api.evaluateInterventions({
        cityId,
        budgetMillions: b,
        targetPriority: p
      });
      setResult(data);
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runOptimization(budget, priority);
  }, [cityId, budget, priority]);

  const handleApply = () => {
    if (result) {
      onApplyPortfolio(result.synthesizedScenario);
      setApplied(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Optimization Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              Budget-Constrained Intervention Optimizer
            </h2>
            <p className="text-xs text-slate-400">
              Evaluates cost-effectiveness ratios (Impact per $1M) using an explainable knapsack ranking algorithm for {cityName}.
            </p>
          </div>

          {result && (
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Resilience Gain</div>
                <div className="text-lg font-mono font-bold text-emerald-400">
                  +{result.projectedResilienceGain} pts
                </div>
              </div>
              <div className="border-l border-slate-800 pl-3 text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Budget Used</div>
                <div className="text-lg font-mono font-bold text-cyan-400">
                  ${result.totalCostMillions}M <span className="text-xs text-slate-500 font-normal">/ ${budget}M</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sliders and Priorities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          {/* Budget Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Municipal Capital Budget
              </span>
              <span className="font-mono text-emerald-400 text-sm font-bold">${budget} Million USD</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>$5M (Pilot Scale)</span>
              <span>$50M (Citywide Capital Works)</span>
              <span>$100M (Aggressive Transformation)</span>
            </div>
          </div>

          {/* Priority Objective */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" /> Target Strategic Priority
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'balanced', label: 'Balanced' },
                { id: 'extreme_heat', label: 'Cool Heat' },
                { id: 'flood_exposure', label: 'Flood Shield' },
                { id: 'water_stress', label: 'Water Security' },
                { id: 'green_cover', label: 'Green Canopy' },
                { id: 'air_pollution', label: 'Clean Air' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPriority(opt.id as any)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${
                    priority === opt.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ranked Interventions Portfolio */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Recommended Intervention Portfolio</h3>
              <p className="text-xs text-slate-400">{result.optimizationRationale}</p>
            </div>

            <button
              onClick={handleApply}
              disabled={applied}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                applied
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              {applied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Portfolio Applied to Simulation</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Apply Portfolio to Simulation Lab</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </>
              )}
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {result.rankedInterventions.map((item) => (
              <div
                key={item.interventionId}
                className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-emerald-400 flex-shrink-0">
                    #{item.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-100 text-sm">{item.name}</span>
                      <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                        {item.costEffectivenessRatio}x ROI ratio
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.justification}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-auto text-xs font-mono">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">Recommended</div>
                    <div className="font-bold text-white text-sm">
                      {item.recommendedValue}
                      {item.name.includes('%') ? '' : '%'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">Allocated Cost</div>
                    <div className="font-bold text-emerald-400 text-sm">
                      ${item.estimatedCostMillions}M
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rationale and Methodology Note */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Optimization Methodology &amp; Limitations
            </div>
            <p>
              Algorithm ranks interventions by marginal benefit ratio (Score / Cost ratio) subject to the user's budget ceiling.
              Unit costs are derived from benchmark municipal climate adaptation project tenders in Indian metropolitan zones (2024-2025).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
