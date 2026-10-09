import React from 'react';
import {
  Globe,
  Sliders,
  Columns,
  Cpu,
  Brain,
  Database,
  Bookmark,
  CheckCircle2,
  CloudSun,
  Server
} from 'lucide-react';
import { City, TargetYear } from '../types/earthsim.ts';

interface HeaderProps {
  cities: City[];
  selectedCity: City | null;
  onSelectCity: (cityId: string) => void;
  targetYear: TargetYear;
  onSelectYear: (year: TargetYear) => void;
  activeTab: 'lab' | 'compare' | 'optimizer' | 'strategist' | 'evidence' | 'scenarios';
  onSelectTab: (tab: 'lab' | 'compare' | 'optimizer' | 'strategist' | 'evidence' | 'scenarios') => void;
  onOpenAwsModal: () => void;
  serverStatus: 'connected' | 'checking' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  targetYear,
  onSelectYear,
  activeTab,
  onSelectTab,
  onOpenAwsModal,
  serverStatus
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white font-mono">EARTHSIM</span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                City Futures Lab
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              We Make Devs × AWS Bharat Builds Tour · Environmental Hacks
            </p>
          </div>
        </div>

        {/* Global Controls: City & Year Selection */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* City Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1">
            <span className="text-xs text-slate-400 font-medium">City:</span>
            <select
              value={selectedCity?.id || 'bengaluru'}
              onChange={(e) => onSelectCity(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-100 focus:outline-none cursor-pointer"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} ({c.country})
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5">
            {([2025, 2030, 2035, 2040] as TargetYear[]).map((yr) => (
              <button
                key={yr}
                onClick={() => onSelectYear(yr)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  targetYear === yr
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {yr === 2025 ? 'Present' : yr}
              </button>
            ))}
          </div>

          {/* AWS Architecture Info Button */}
          <button
            onClick={onOpenAwsModal}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors"
            title="View AWS Hackathon Cloud Architecture"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden md:inline">AWS Architecture</span>
          </button>

          {/* Live API Status indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 px-2 py-1">
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === 'connected'
                  ? 'bg-emerald-400'
                  : serverStatus === 'checking'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-red-400'
              }`}
            />
            <span className="hidden lg:inline font-mono text-[11px]">
              {serverStatus === 'connected' ? 'API Online' : 'Connecting'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="border-t border-slate-800 bg-slate-950/60 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => onSelectTab('lab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'lab'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulation Lab</span>
          </button>

          <button
            onClick={() => onSelectTab('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'compare'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Futures Comparison</span>
          </button>

          <button
            onClick={() => onSelectTab('optimizer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'optimizer'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Intervention Optimizer</span>
          </button>

          <button
            onClick={() => onSelectTab('strategist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'strategist'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>AI City Strategist</span>
          </button>

          <button
            onClick={() => onSelectTab('evidence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'evidence'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data &amp; Evidence</span>
          </button>

          <button
            onClick={() => onSelectTab('scenarios')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'scenarios'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Scenarios</span>
          </button>
        </div>
      </div>
    </header>
  );
};
