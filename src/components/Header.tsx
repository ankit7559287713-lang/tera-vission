import React from 'react';
import {
  Compass,
  Sliders,
  Columns,
  Cpu,
  Brain,
  Database,
  Bookmark,
  MapPin,
  Leaf
} from 'lucide-react';
import { City, TargetYear } from '../types/earthsim.ts';

interface HeaderProps {
  cities: City[];
  selectedCity: City | null;
  onSelectCity: (cityId: string) => void;
  activeTab: 'lab' | 'compare' | 'optimizer' | 'strategist' | 'evidence' | 'scenarios';
  onSelectTab: (tab: 'lab' | 'compare' | 'optimizer' | 'strategist' | 'evidence' | 'scenarios') => void;
  serverStatus: 'connected' | 'checking' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  activeTab,
  onSelectTab,
  serverStatus
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#DDE4DA] text-[#26332C] shadow-xs">
      {/* Top Brand & City Control Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* TETRA VISION Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E7EEE5] border border-[#DDE4DA] flex items-center justify-center text-[#245B43] shadow-xs">
            <Compass className="w-5 h-5 text-[#245B43]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-xl tracking-tight text-[#183D30] font-sans">
                TETRA VISION
              </span>
              <span className="text-[11px] font-semibold text-[#245B43] bg-[#E7EEE5] border border-[#DDE4DA] px-2 py-0.5 rounded-full tracking-wide">
                Environmental Intelligence
              </span>
            </div>
            <p className="text-xs text-[#66736A] font-medium">
              Explore Tomorrow. Shape a Resilient Planet.
            </p>
          </div>
        </div>

        {/* Global Controls: City Selector & Service Status */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* City Selector */}
          <div className="flex items-center gap-2 bg-[#F6F7F1] border border-[#DDE4DA] hover:border-[#477F78] rounded-xl px-3 py-1.5 transition-colors shadow-2xs">
            <MapPin className="w-4 h-4 text-[#245B43]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-[#66736A] font-medium uppercase tracking-wider">
                Metropolitan Region
              </span>
              <select
                value={selectedCity?.id || 'bengaluru'}
                onChange={(e) => onSelectCity(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#183D30] focus:outline-none cursor-pointer pr-4"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white text-[#26332C]">
                    {c.name}, {c.country} ({c.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Engine Status indicator */}
          <div className="flex items-center gap-2 text-xs text-[#66736A] bg-[#F6F7F1] border border-[#DDE4DA] px-2.5 py-1.5 rounded-xl font-mono text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === 'connected'
                  ? 'bg-emerald-600 ring-2 ring-emerald-500/20'
                  : serverStatus === 'checking'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <span className="hidden sm:inline font-medium">
              {serverStatus === 'connected' ? 'Simulation Engine Online' : 'Connecting Engine'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="border-t border-[#DDE4DA] bg-[#F6F7F1] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-none">
          <button
            onClick={() => onSelectTab('lab')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'lab'
                ? 'bg-[#245B43] text-white shadow-xs'
                : 'text-[#66736A] hover:text-[#26332C] hover:bg-white/80'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate &amp; Explore Map</span>
          </button>

          <button
            onClick={() => onSelectTab('compare')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-[#245B43] text-white shadow-xs'
                : 'text-[#66736A] hover:text-[#26332C] hover:bg-white/80'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Futures Comparison</span>
          </button>

          <button
            onClick={() => onSelectTab('optimizer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'optimizer'
                ? 'bg-[#245B43] text-white shadow-xs'
                : 'text-[#66736A] hover:text-[#26332C] hover:bg-white/80'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Intervention Lab &amp; Budget</span>
          </button>

          <button
            onClick={() => onSelectTab('strategist')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'strategist'
                ? 'bg-[#245B43] text-white shadow-xs'
                : 'text-[#66736A] hover:text-[#26332C] hover:bg-white/80'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>AI City Strategist</span>
          </button>

          <button
            onClick={() => onSelectTab('evidence')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'evidence'
                ? 'bg-[#245B43] text-white shadow-xs'
                : 'text-[#66736A] hover:text-[#26332C] hover:bg-white/80'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Scientific Evidence &amp; Data</span>
          </button>

          <button
            onClick={() => onSelectTab('scenarios')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'scenarios'
                ? 'bg-[#245B43] text-white shadow-xs'
                : 'text-[#66736A] hover:text-[#26332C] hover:bg-white/80'
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
