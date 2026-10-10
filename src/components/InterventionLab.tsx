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
  const [paretoFrontier, setParetoFrontier] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);

  const runOptimization = async (b: number, p: 'balanced' | EnvironmentalLayerId) => {
    setLoading(true);
    setApplied(false);
    try {
      const [optData, frontierData] = await Promise.all([
        api.evaluateInterventions({
          cityId,
          budgetMillions: b,
          targetPriority: p
        }),
        api.getParetoFrontier(cityId, p).catch(() => null)
      ]);
      setResult(optData);
      if (frontierData) setParetoFrontier(frontierData);
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
      <div className="bg-white border border-[#DDE4DA] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#183D30] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#245B43]" />
              Budget-Constrained Intervention Optimizer
            </h2>
            <p className="text-xs text-[#66736A] mt-0.5">
              Evaluates marginal cost-effectiveness ratios (Impact per $1M / ₹8.3 Cr) using an explainable knapsack ranking algorithm for {cityName}.
            </p>
          </div>

          {result && (
            <div className="flex items-center gap-3 bg-[#F6F7F1] border border-[#DDE4DA] px-4 py-2 rounded-xl">
              <div className="text-right">
                <div className="text-[10px] text-[#66736A] uppercase font-mono">Resilience Gain</div>
                <div className="text-lg font-mono font-bold text-emerald-800">
                  +{result.projectedResilienceGain} pts
                </div>
              </div>
              <div className="border-l border-[#DDE4DA] pl-3 text-right">
                <div className="text-[10px] text-[#66736A] uppercase font-mono">Budget Allocated</div>
                <div className="text-lg font-mono font-bold text-[#183D30]">
                  ${result.totalCostMillions}M <span className="text-xs text-[#66736A] font-normal">/ ${budget}M</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sliders and Target Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F6F7F1] p-4 rounded-xl border border-[#DDE4DA]">
          {/* Budget Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-[#183D30] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#245B43]" /> Municipal Capital Budget Ceiling:
              </label>
              <span className="font-mono text-base font-bold text-[#245B43]">
                ${budget} Million USD
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-[#DDE4DA] rounded-lg appearance-none cursor-pointer accent-[#245B43]"
            />
            <div className="flex justify-between text-[10px] text-[#66736A]">
              <span>$5M (Pilot Scale)</span>
              <span>$50M (Major Municipal Scheme)</span>
              <span>$100M (Comprehensive Transformation)</span>
            </div>
          </div>

          {/* Goal Priority Selector */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-[#183D30] block">
              Strategic Climate Resilience Priority:
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { id: 'balanced', label: 'Balanced (All Risks)' },
                { id: 'extreme_heat', label: 'Cooling & Heat' },
                { id: 'flood_exposure', label: 'Flood & Runoff' },
                { id: 'water_stress', label: 'Aquifer Recharge' },
                { id: 'green_cover', label: 'Biodiversity & Green' },
                { id: 'air_pollution', label: 'Clean Air / PM2.5' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPriority(p.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg border font-medium text-xs transition-all cursor-pointer ${
                    priority === p.id
                      ? 'bg-[#245B43] text-white border-[#183D30] shadow-xs'
                      : 'bg-white text-[#26332C] border-[#DDE4DA] hover:bg-[#E7EEE5]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ranked Intervention Portfolio */}
            {loading && !result ? (
        <div className="bg-white border border-[#DDE4DA] rounded-xl p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#245B43] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-bold text-[#183D30]">Evaluating Budget Optimization Model</div>
          <div className="text-xs text-[#66736A]">Calculating marginal cost-effectiveness ratios and Pareto efficiency curve for {cityName}...</div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#183D30] uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#245B43]" />
              Ranked Cost-Effective Portfolio ({(result?.rankedInterventions || []).length} Options Evaluated)
            </h3>

            {result && (
              <button
                onClick={handleApply}
                disabled={applied || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                  applied
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#245B43] hover:bg-[#183D30] text-white'
                }`}
              >
                {applied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Applied to Active Simulation</span>
                  </>
                ) : (
                  <>
                    <span>Apply Portfolio to Simulation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {(result?.rankedInterventions || []).length === 0 ? (
            <div className="bg-white border border-[#DDE4DA] rounded-xl p-8 text-center text-xs text-[#66736A]">
              {loading ? 'Computing optimal intervention ranking...' : 'No intervention rankings available for this budget configuration. Try adjusting the budget or priority.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(result?.rankedInterventions || []).map((item) => (
                <div
                  key={item.interventionId}
                  className="bg-white border border-[#DDE4DA] rounded-xl p-4 space-y-3 hover:border-[#477F78] transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#245B43] bg-[#E7EEE5] px-1.5 py-0.5 rounded">
                        Rank #{item.rank || 1} · Priority
                      </span>
                      <h4 className="text-sm font-bold text-[#183D30] mt-1">{item.name}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#66736A]">Recommended</div>
                      <div className="text-sm font-bold font-mono text-[#245B43]">
                        {item.recommendedValue ?? 0}%
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#66736A] leading-relaxed">
                    {item.justification}
                  </p>

                  <div className="pt-2 border-t border-[#DDE4DA] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#66736A] block">Capex Outlay:</span>
                      <span className="font-mono font-bold text-[#183D30]">
                        ${item.estimatedCostMillions ?? 0}M
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#66736A] block">Impact / $1M:</span>
                      <span className="font-mono font-bold text-emerald-800">
                        {item.costEffectivenessRatio ?? 0} pts/$M
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pareto Frontier Insights */}
          {paretoFrontier && (
            <div className="bg-white border border-[#DDE4DA] rounded-xl p-5 shadow-xs">
              <h4 className="text-xs font-bold text-[#183D30] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#245B43]" />
                Marginal Returns Curve (Pareto Capital Frontier)
              </h4>
              <p className="text-xs text-[#66736A] mb-4">
                Demonstrates how overall city resilience scales as public investment expands from $10M to $100M:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {(paretoFrontier.frontierPoints || paretoFrontier.frontierSteps || []).map((step: any) => (
                  <div
                    key={step.budgetMillions}
                    className="bg-[#F6F7F1] border border-[#DDE4DA] rounded-lg p-3"
                  >
                    <div className="text-xs text-[#66736A]">${step.budgetMillions}M Budget</div>
                    <div className="text-base font-mono font-bold text-[#183D30] mt-0.5">
                      +{step.projectedResilienceGain} pts
                    </div>
                    <div className="text-[10px] text-[#245B43] mt-1 font-medium">
                      Efficiency: {step.costEffectiveness ?? step.marginalEfficiency ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
