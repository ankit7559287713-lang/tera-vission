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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-200 mb-1">AI Strategist Ready</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please run a simulation in the Simulation Lab to provide context for the AI City Strategist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strategist Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                <Brain className="w-3.5 h-3.5" />
                Strategic Climate Intelligence
              </span>
              <span className="text-xs text-slate-400">
                Context: {simulation.cityName} ({simulation.targetYear})
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              AI City Strategist Briefing
            </h2>
          </div>

          {briefing && (
            <div className="text-right">
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded inline-block">
                {briefing.sourceAttribution}
              </span>
            </div>
          )}
        </div>

        {/* Executive Summary */}
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2" />
            <span>Synthesizing multi-system climate scenario outputs...</span>
          </div>
        ) : briefing ? (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed font-sans">
            <p className="text-sm font-medium text-slate-100">{briefing.executiveSummary}</p>
          </div>
        ) : null}
      </div>

      {/* 3-Phase Action Plan */}
      {briefing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {briefing.recommendedActionPlan.map((plan, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-emerald-400 font-mono">
                    Phase {idx + 1}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {plan.timeframe}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 mb-2">{plan.phase}</h4>

                <ul className="space-y-1.5 text-[11px] text-slate-300 mb-3">
                  {plan.actions.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                <strong className="text-slate-300">Expected Yield: </strong>
                {plan.expectedOutcome}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Critical Trade-offs & Monitoring Gaps */}
      {briefing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Critical Trade-offs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2.5">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Critical Trade-offs &amp; Systemic Risks
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {briefing.criticalTradeoffs.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Monitoring Gaps & Missing Evidence */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 mb-2.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Monitoring Gaps &amp; Data Uncertainties
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {briefing.monitoringGaps.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-cyan-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Interactive Query Box: "Ask the Strategist" */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          Interactive Query: Grounded Climate Advice
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Ask specific strategic questions about the active simulation, trade-offs, or priority ward allocations.
        </p>

        {/* Quick query chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            'Which wards should receive drainage investments first?',
            'What happens if we double green cover but ignore water stress?',
            'What are the key trade-offs between cool roofs and tree planting?',
            'How can we address the data gaps in groundwater monitoring?'
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => fetchBriefing(prompt)}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/80 transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask the AI City Strategist about this simulation..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !userQuery.trim()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
