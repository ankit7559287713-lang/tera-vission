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
  Compass,
  Download
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

  const handleDownloadReport = () => {
    if (!simulation) return;
    const reportData = {
      title: `TETRA VISION Executive Climate Intelligence Report - ${simulation.cityName} (${simulation.targetYear})`,
      timestamp: new Date().toISOString(),
      modelVersion: simulation.modelVersion,
      city: simulation.cityName,
      targetHorizon: simulation.targetYear,
      populationProjection: simulation.populationProjection,
      overallResilience: {
        baselineBAU: simulation.overallResilienceScore.baseline,
        withInterventions: simulation.overallResilienceScore.intervention,
        gain: simulation.overallResilienceScore.gain
      },
      appliedInterventions: simulation.interventions,
      layerShifts: simulation.deltas,
      priorityWards: simulation.mostAffectedAreas,
      assumptions: simulation.assumptions,
      uncertainties: simulation.uncertainties,
      dataProvenance: simulation.provenanceSummary
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tetravision_${simulation.cityId}_${simulation.targetYear}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!simulation) {
    return (
      <div className="bg-white border border-[#DDE4DA] rounded-xl p-8 text-center text-[#66736A] shadow-xs">
        <SlidersHorizontal className="w-12 h-12 text-[#477F78] mx-auto mb-3" />
        <h3 className="text-base font-semibold text-[#183D30] mb-1">No Simulation Results Available</h3>
        <p className="text-xs text-[#66736A] max-w-md mx-auto">
          Configure your intervention parameters in the Simulation Lab and click "Run Simulation" to generate a comprehensive futures comparison.
        </p>
      </div>
    );
  }

  const { baselineCitywide, interventionCitywide, deltas, overallResilienceScore } = simulation;

  return (
    <div className="space-y-6">
      {/* Top Banner: Composite Resilience Gauge & Summary */}
      <div className="bg-white border border-[#DDE4DA] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[#245B43] bg-[#E7EEE5] border border-[#DDE4DA] px-2 py-0.5 rounded">
                Futures Comparison · {simulation.cityName}
              </span>
              <span className="text-xs text-[#66736A]">
                Target Horizon: <strong className="text-[#183D30] font-mono">{simulation.targetYear}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#183D30] tracking-tight">
              “What happens if we do nothing vs act today?”
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
              <p className="text-xs text-[#66736A] max-w-2xl">
                Evaluating the divergent climate trajectories between business-as-usual (BAU) inertia and your modeled intervention portfolio.
              </p>
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F7F1] hover:bg-[#E7EEE5] text-[#183D30] border border-[#DDE4DA] rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
                title="Download complete structured intelligence report as JSON"
              >
                <Download className="w-3.5 h-3.5 text-[#245B43]" />
                <span>Export JSON Intelligence Report</span>
              </button>
            </div>
          </div>

          {/* Resilience Metric Cards */}
          <div className="flex items-center gap-4 bg-[#F6F7F1] border border-[#DDE4DA] p-4 rounded-xl">
            <div className="text-center">
              <div className="text-[10px] text-[#66736A] uppercase font-medium">Baseline (BAU)</div>
              <div className="text-2xl font-mono font-bold text-amber-700">
                {overallResilienceScore.baseline}
                <span className="text-xs text-[#66736A] font-normal">/100</span>
              </div>
              <div className="text-[10px] text-[#66736A]">Unmitigated Risk</div>
            </div>

            <div className="text-[#477F78] text-xl font-bold">→</div>

            <div className="text-center">
              <div className="text-[10px] text-[#245B43] uppercase font-bold">With Interventions</div>
              <div className="text-2xl font-mono font-bold text-[#245B43]">
                {overallResilienceScore.intervention}
                <span className="text-xs text-[#66736A] font-normal">/100</span>
              </div>
              <div className="text-[10px] text-[#245B43] font-medium">Resilience Horizon</div>
            </div>

            <div className="border-l border-[#DDE4DA] pl-4 text-center">
              <div className="text-[10px] text-[#66736A] uppercase font-medium">Net Improvement</div>
              <div className="text-2xl font-mono font-bold text-emerald-700">
                +{overallResilienceScore.gain} pts
              </div>
              <div className="text-[10px] text-emerald-800 font-semibold">Resilience Gain</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Comparison Matrix: 5 Environmental Risk Layers */}
      <div className="bg-white border border-[#DDE4DA] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-[#F6F7F1] border-b border-[#DDE4DA] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#183D30] uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#245B43]" />
            Side-by-Side Multi-Risk Shift Matrix ({simulation.targetYear})
          </h3>
          <span className="text-xs text-[#66736A]">
            CMIP6 SSP2-4.5 Calibrated Trajectories
          </span>
        </div>

        <div className="divide-y divide-[#DDE4DA]">
          {deltas.map((delta) => {
            const layerMeta = ENVIRONMENTAL_LAYERS.find((l) => l.id === delta.layer);
            const isGood = delta.improved;

            return (
              <div key={delta.layer} className="p-4 sm:p-5 hover:bg-[#FBFBF9] transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Layer Meta Info (4 cols) */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#183D30]">
                        {layerMeta?.name || delta.layer}
                      </span>
                      <span className="text-[10px] font-mono text-[#66736A] bg-[#E7EEE5] px-1.5 py-0.5 rounded">
                        {delta.unit}
                      </span>
                    </div>
                    <p className="text-xs text-[#66736A] leading-relaxed">
                      {layerMeta?.scaleDescription}
                    </p>
                  </div>

                  {/* Quantitative Comparison Strip (5 cols) */}
                  <div className="md:col-span-5 grid grid-cols-3 gap-2 text-center bg-[#F6F7F1] p-3 rounded-xl border border-[#DDE4DA]">
                    <div>
                      <div className="text-[10px] text-[#66736A] uppercase font-medium">Baseline (BAU)</div>
                      <div className="text-lg font-mono font-bold text-[#26332C]">
                        {delta.baseline}
                      </div>
                      <div className="text-[10px] text-[#66736A]">Do Nothing</div>
                    </div>

                    <div className="flex items-center justify-center text-[#477F78] font-bold">
                      →
                    </div>

                    <div>
                      <div className="text-[10px] text-[#245B43] uppercase font-semibold">Intervention</div>
                      <div className="text-lg font-mono font-bold text-[#183D30]">
                        {delta.intervention}
                      </div>
                      <div className="text-[10px] text-[#245B43]">With Action</div>
                    </div>
                  </div>

                  {/* Delta & Direction Indicator (3 cols) */}
                  <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1">
                    <div
                      className={`flex items-center gap-1 text-sm font-bold font-mono px-2.5 py-1 rounded-lg ${
                        isGood
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-[#F6F7F1] text-[#66736A] border border-[#DDE4DA]'
                      }`}
                    >
                      {isGood ? <TrendingDown className="w-4 h-4 text-emerald-700" /> : <TrendingUp className="w-4 h-4 text-slate-500" />}
                      <span>
                        {delta.absoluteChange > 0 ? '+' : ''}{delta.absoluteChange} {delta.unit}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#66736A]">
                      {delta.relativeChangePercent > 0 ? `+${delta.relativeChangePercent}%` : `${delta.relativeChangePercent}%`} relative shift
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Wards Benefiting Most */}
      <div className="bg-white border border-[#DDE4DA] rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#183D30] uppercase tracking-wide mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#245B43]" />
          Wards with Greatest Marginal Resilience Gain
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {simulation.mostAffectedAreas.map((area, idx) => (
            <div
              key={area.areaId}
              className="bg-[#F6F7F1] border border-[#DDE4DA] rounded-xl p-3.5 space-y-2 hover:border-[#477F78] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#245B43] bg-[#E7EEE5] px-1.5 py-0.5 rounded">
                  Priority Rank #{idx + 1}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                  +{area.resilienceGain} pts gain
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#183D30]">{area.areaName}</h4>
              <p className="text-xs text-[#66736A]">{area.priorityReason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formula Transparency & Physical Governing Laws */}
      <div className="bg-white border border-[#DDE4DA] rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => setShowFormulas(!showFormulas)}
          className="w-full p-4 bg-[#F6F7F1] hover:bg-[#E7EEE5] text-left flex items-center justify-between text-xs font-bold text-[#183D30] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#245B43]" />
            Methodological Transparency: Mathematical Equations &amp; Climate Calibration
          </span>
          {showFormulas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFormulas && (
          <div className="p-5 space-y-4 border-t border-[#DDE4DA] text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {simulation.formulaExplanations.map((item) => (
                <div
                  key={item.layer}
                  className="bg-[#F6F7F1] border border-[#DDE4DA] p-3.5 rounded-xl space-y-2"
                >
                  <div className="font-bold text-[#183D30] capitalize">
                    {item.layer.replace('_', ' ')} Governing Equation
                  </div>
                  <div className="font-mono text-[11px] bg-white p-2 rounded border border-[#DDE4DA] text-[#245B43]">
                    {item.formula}
                  </div>
                  <div className="text-[11px] text-[#66736A]">
                    <strong>Evaluated Shift:</strong> {item.modeledOutput}
                  </div>
                  <ul className="text-[10px] text-[#66736A] list-disc list-inside space-y-0.5">
                    {item.primaryDrivers.map((driver, dIdx) => (
                      <li key={dIdx}>{driver}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Assumptions & Limitations Disclosures */}
            <div className="bg-[#E7EEE5]/60 border border-[#DDE4DA] p-4 rounded-xl text-xs space-y-2">
              <div className="font-bold text-[#183D30]">Scientific Assumptions &amp; Model Boundaries</div>
              <ul className="list-disc list-inside text-[#66736A] space-y-1 text-[11px]">
                {simulation.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
              <div className="pt-2 text-[10px] text-[#66736A]">
                <strong>Calibration datasets:</strong> {simulation.provenanceSummary}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
