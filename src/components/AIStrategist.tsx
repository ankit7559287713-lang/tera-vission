import React, { useState, useEffect } from 'react';
import {
  SimulationResult,
  AIStrategistBriefing
} from '../types/earthsim.ts';
import { api } from '../api/client.ts';
import {
  Brain,
  Send,
  Sparkles,
  AlertOctagon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AIStrategistProps {
  simulation: SimulationResult | null;
}

export const AIStrategist: React.FC<AIStrategistProps> = ({ simulation }) => {
  const [briefing, setBriefing] = useState<AIStrategistBriefing | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>('');
  const [queryHistory, setQueryHistory] = useState<Array<{ q: string; a: AIStrategistBriefing }>>([]);

  const fetchBriefing = async (customPrompt?: string) => {
    if (!simulation) return;
    setLoading(true);
    try {
      const data = await api.getRecommendations({
        simulation,
        userPrompt: customPrompt
      });
      setBriefing(data);
      if (customPrompt) {
        setQueryHistory((prev) => [{ q: customPrompt, a: data }, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      console.error('AI Strategist briefing error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (simulation) {
      fetchBriefing();
    }
  }, [simulation?.id]);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || loading) return;
    fetchBriefing(userQuery.trim());
    setUserQuery('');
  };

  if (!simulation) {
    return (
      <div className="bg-white border border-[#DDE4DA] rounded-xl p-8 text-center text-[#66736A] shadow-xs">
        <Brain className="w-12 h-12 text-[#477F78] mx-auto mb-3" />
        <h3 className="text-base font-semibold text-[#183D30] mb-1">No Simulation Active</h3>
        <p className="text-xs text-[#66736A] max-w-md mx-auto">
          Run a simulation in the lab first so the strategist can evaluate specific risk outcomes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strategist Banner */}
      <div className="bg-white border border-[#DDE4DA] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-[#245B43] bg-[#E7EEE5] border border-[#DDE4DA] px-2 py-0.5 rounded flex items-center gap-1">
                <Brain className="w-3.5 h-3.5" />
                Adaptive Climate Intelligence
              </span>
              <span className="text-xs text-[#66736A]">
                {simulation.cityName} · Horizon {simulation.targetYear}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#183D30]">
              Strategic Climate Decision Briefing
            </h2>
          </div>

          {/* Engine Mode Callout: AI vs Deterministic Rule-Based */}
          <div className="flex items-center gap-2 bg-[#F6F7F1] border border-[#DDE4DA] px-3 py-1.5 rounded-lg text-xs">
            <Sparkles className="w-4 h-4 text-[#245B43]" />
            <div className="text-[11px]">
              <span className="text-[#66736A] block">Engine Mode:</span>
              <span className="font-semibold text-[#183D30]">
                {briefing?.sourceAttribution.includes('Gemini')
                  ? 'Gemini 2.5 Flash Grounded'
                  : 'Deterministic Rule-Based Intelligence'}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {briefing ? (
          <div className="bg-[#F6F7F1] border border-[#DDE4DA] rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#183D30] uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#245B43]" />
              Executive Policy Synthesis
            </h3>
            <p className="text-xs sm:text-sm text-[#26332C] leading-relaxed whitespace-pre-line">
              {briefing.executiveSummary}
            </p>
          </div>
        ) : (
          <div className="h-28 flex items-center justify-center text-xs text-[#66736A]">
            <div className="w-4 h-4 border-2 border-[#245B43] border-t-transparent rounded-full animate-spin mr-2" />
            Synthesizing strategic recommendations...
          </div>
        )}
      </div>

      {briefing && (
        <>
          {/* Key Vulnerabilities & Phased Action Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Phased Action Plan (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#DDE4DA] rounded-xl p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-[#183D30] uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#245B43]" />
                Phased Implementation Roadmap
              </h3>

              <div className="space-y-3">
                {briefing.recommendedActionPlan.map((phase, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F6F7F1] border border-[#DDE4DA] rounded-xl p-4 space-y-2 hover:border-[#477F78] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#183D30]">
                        Phase {idx + 1}: {phase.phase}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-[#245B43] bg-[#E7EEE5] px-2 py-0.5 rounded">
                        {phase.timeframe}
                      </span>
                    </div>

                    <ul className="text-xs text-[#26332C] space-y-1 list-disc list-inside">
                      {phase.actions.map((act, aIdx) => (
                        <li key={aIdx} className="leading-relaxed">
                          {act}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2 border-t border-[#DDE4DA] text-[11px] text-[#66736A]">
                      <strong className="text-[#183D30]">Expected Milestone:</strong> {phase.expectedOutcome}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vulnerabilities & Tradeoffs (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Critical Vulnerabilities */}
              <div className="bg-white border border-[#DDE4DA] rounded-xl p-5 space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-[#183D30] uppercase tracking-wide flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  Immediate High-Risk Bottlenecks
                </h3>
                <ul className="space-y-2">
                  {briefing.keyVulnerabilities.map((vuln, vIdx) => (
                    <li
                      key={vIdx}
                      className="text-xs text-[#26332C] bg-[#F6F7F1] p-2.5 rounded-lg border border-[#DDE4DA] flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span>{vuln}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trade-offs & Governance Gaps */}
              <div className="bg-white border border-[#DDE4DA] rounded-xl p-5 space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-[#183D30] uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#245B43]" />
                  Trade-Offs &amp; Evidence Gaps
                </h3>
                <div className="space-y-2 text-xs">
                  {briefing.criticalTradeoffs.map((to, tIdx) => (
                    <div
                      key={tIdx}
                      className="bg-[#E7EEE5]/70 p-2.5 rounded-lg border border-[#DDE4DA] text-[#26332C]"
                    >
                      <strong>Capital Trade-Off:</strong> {to}
                    </div>
                  ))}
                  {briefing.monitoringGaps.map((gap, gIdx) => (
                    <div
                      key={gIdx}
                      className="bg-[#F6F7F1] p-2.5 rounded-lg border border-[#DDE4DA] text-[#66736A] text-[11px]"
                    >
                      <strong>Data Monitoring Gap:</strong> {gap}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Advisory Prompt Input */}
          <div className="bg-white border border-[#DDE4DA] rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#183D30] uppercase tracking-wide mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#245B43]" />
              Inquire Deeper on City Resilience Scenarios
            </h3>
            <form onSubmit={handleAsk} className="flex gap-2">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Ask specific questions: 'How does groundwater overdraft impact peripheral tech corridors by 2035?'"
                className="flex-1 bg-[#F6F7F1] border border-[#DDE4DA] focus:border-[#245B43] rounded-lg px-3.5 py-2 text-xs text-[#26332C] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !userQuery.trim()}
                className="px-4 py-2 bg-[#245B43] hover:bg-[#183D30] disabled:bg-[#DDE4DA] disabled:text-[#66736A] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
