import React, { useState } from 'react';
import {
  SimulationResult,
  CityArea
} from '../types/earthsim.ts';
import { ENVIRONMENTAL_LAYERS } from '../server/data/cities.ts';
import {
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

interface ScenarioComparisonProps {
  simulation: SimulationResult | null;
  areas: CityArea[];
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  simulation,
  areas
}) => {
  const [showFormulas, setShowFormulas] = useState(false);

  if (!simulation) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <SlidersHorizontal className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-200 mb-1">No Simulation Results Available</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Configure your intervention parameters in the Simulation Lab and click "Run Simulation" to generate a comprehensive futures comparison.
        </p>
      </div>
    );
  }

  const { baselineCitywide, interventionCitywide, deltas, overallResilienceScore } = simulation;

  return (
    <div className="space-y-6">
      {/* Top Banner: Composite Resilience Gauge & Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                Futures Comparison · {simulation.cityName}
              </span>
              <span className="text-xs text-slate-400">
                Target Horizon: <strong className="text-white font-mono">{simulation.targetYear}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              “What happens if we do nothing vs act today?”
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Evaluating the divergent climate trajectories between business-as-usual (BAU) inertia and your modeled intervention portfolio.
            </p>
          </div>

          {/* Resilience Score Gauge Comparison */}
          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
            <div className="text-center">
              <div className="text-[11px] text-slate-400 font-medium uppercase mb-0.5">Do Nothing (BAU)</div>
              <div className="text-2xl font-mono font-bold text-amber-400">
                {overallResilienceScore.baseline}
                <span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
            </div>

            <div className="text-slate-600 text-lg">→</div>

            <div className="text-center">
              <div className="text-[11px] text-emerald-400 font-medium uppercase mb-0.5">With Interventions</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                {overallResilienceScore.intervention}
                <span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
            </div>

            <div className="pl-3 border-l border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 font-medium uppercase mb-0.5">Net Resilience Gain</div>
              <div className="text-2xl font-mono font-bold text-cyan-400 flex items-center justify-center gap-0.5">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                +{overallResilienceScore.gain}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Indicator Delta Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {deltas.map((delta) => {
          const meta = ENVIRONMENTAL_LAYERS.find((l) => l.id === delta.layer);
          const isGreen = delta.layer === 'green_cover';
          const isImprovement = delta.improved;

          return (
            <div
              key={delta.layer}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>{meta?.name || delta.layer}</span>
                  {isImprovement ? (
                    <span className="text-emerald-400 text-[11px] font-mono flex items-center">
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                      Relief
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Neutral</span>
                  )}
                </div>

                <div className="my-2 flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500">Baseline BAU</div>
                    <div className="text-sm font-mono font-bold text-slate-300">{delta.baseline}</div>
                  </div>
                  <span className="text-slate-600 text-xs">→</span>
                  <div className="text-right">
                    <div className="text-[10px] text-emerald-400">Modeled</div>
                    <div className="text-base font-mono font-bold text-white">{delta.intervention}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Absolute Shift:</span>
                <span
                  className={`font-mono font-bold ${
                    isImprovement ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {delta.absoluteChange > 0 ? '+' : ''}
                  {delta.absoluteChange} {meta?.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Area-by-Area Impact Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Geographic Ward-by-Ward Impact Matrix</h3>
            <p className="text-xs text-slate-400">
              Evaluated across all {simulation.areaResults.length} zones for {simulation.cityName}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
            Ranked by Vulnerability
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Ward / Neighborhood</th>
                <th className="py-2.5 px-3">Vuln. Rank</th>
                <th className="py-2.5 px-3">Heat (Base → Mod)</th>
                <th className="py-2.5 px-3">Flood (Base → Mod)</th>
                <th className="py-2.5 px-3">Water Stress</th>
                <th className="py-2.5 px-3">Canopy Cover</th>
                <th className="py-2.5 px-3">Primary Benefit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {simulation.areaResults.map((ar) => (
                <tr key={ar.areaId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-sans font-semibold text-white">
                    {ar.areaName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                      #{ar.vulnerabilityRank}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-400">{ar.baseline.extreme_heat}</span>
                    <span className="text-slate-600 mx-1">→</span>
                    <span className="text-emerald-400 font-bold">{ar.intervention.extreme_heat}</span>
                    <span className="text-[10px] text-emerald-500/80 ml-1">
                      ({ar.deltas.extreme_heat})
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-400">{ar.baseline.flood_exposure}</span>
                    <span className="text-slate-600 mx-1">→</span>
                    <span className="text-emerald-400 font-bold">{ar.intervention.flood_exposure}</span>
                    <span className="text-[10px] text-emerald-500/80 ml-1">
                      ({ar.deltas.flood_exposure})
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-400">{ar.baseline.water_stress}</span>
                    <span className="text-slate-600 mx-1">→</span>
                    <span className="text-emerald-400 font-bold">{ar.intervention.water_stress}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-400">{ar.baseline.green_cover}%</span>
                    <span className="text-slate-600 mx-1">→</span>
                    <span className="text-emerald-300 font-bold">{ar.intervention.green_cover}%</span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className="text-[11px] font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                      {ar.topBenefitLayer.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transparent Formulas & Assumptions Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowFormulas(!showFormulas)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Explainable Simulation Formulas &amp; Physical Assumptions ({simulation.modelVersion})</span>
          </div>
          {showFormulas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFormulas && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-4 text-xs">
            {/* Formulas List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {simulation.formulaExplanations.map((item) => (
                <div
                  key={item.layer}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1.5"
                >
                  <div className="font-bold text-slate-200 text-xs flex items-center justify-between">
                    <span>{item.layer.toUpperCase().replace('_', ' ')}</span>
                    <span className="font-mono text-[11px] text-emerald-400">{item.modeledOutput}</span>
                  </div>
                  <div className="font-mono text-[11px] text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto">
                    {item.formula}
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    {item.primaryDrivers.map((d, i) => (
                      <div key={i}>• {d}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Assumptions & Uncertainties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <h4 className="font-bold text-slate-300 mb-1 text-xs">Model Assumptions</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  {simulation.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-amber-300 mb-1 text-xs">Uncertainties &amp; Limitations</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  {simulation.uncertainties.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                  {simulation.limitations.map((l, i) => (
                    <li key={i} className="text-slate-500 italic">{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
