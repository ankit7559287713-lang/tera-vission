import React, { useState } from 'react';
import {
  City,
  CityArea,
  EnvironmentalLayerId,
  SimulationResult
} from '../types/earthsim.ts';
import { ENVIRONMENTAL_LAYERS } from '../server/data/cities.ts';
import {
  Layers,
  Info,
  Maximize2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Users,
  Building,
  TreeDeciduous,
  Droplets
} from 'lucide-react';

interface MapViewerProps {
  city: City;
  areas: CityArea[];
  activeLayer: EnvironmentalLayerId;
  onChangeLayer: (layer: EnvironmentalLayerId) => void;
  simulation: SimulationResult | null;
  selectedAreaId: string | null;
  onSelectArea: (areaId: string | null) => void;
  viewMode: 'baseline' | 'intervention' | 'delta';
  onChangeViewMode: (mode: 'baseline' | 'intervention' | 'delta') => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  city,
  areas,
  activeLayer,
  onChangeLayer,
  simulation,
  selectedAreaId,
  onSelectArea,
  viewMode,
  onChangeViewMode
}) => {
  const [hoveredAreaId, setHoveredAreaId] = useState<string | null>(null);

  const currentLayerMeta = ENVIRONMENTAL_LAYERS.find((l) => l.id === activeLayer) || ENVIRONMENTAL_LAYERS[0];
  const selectedArea = areas.find((a) => a.id === selectedAreaId);
  const selectedAreaSim = simulation?.areaResults.find((ar) => ar.areaId === selectedAreaId);

  // Computes color for an area given layer and viewMode
  const getAreaFillColor = (area: CityArea) => {
    const areaSim = simulation?.areaResults.find((ar) => ar.areaId === area.id);

    let val = area.baselineIndicators[activeLayer];
    if (areaSim) {
      if (viewMode === 'baseline') {
        val = areaSim.baseline[activeLayer];
      } else if (viewMode === 'intervention') {
        val = areaSim.intervention[activeLayer];
      } else if (viewMode === 'delta') {
        // Delta: positive improvement = green/cyan; worsening = red
        const delta = areaSim.deltas[activeLayer];
        if (activeLayer === 'green_cover') {
          // Green cover increasing is good
          if (delta > 15) return '#059669'; // Emerald-600
          if (delta > 5) return '#10b981'; // Emerald-500
          if (delta > 0) return '#34d399'; // Emerald-400
          return '#64748b';
        } else {
          // For risk layers, negative delta is improvement
          const reduction = -delta;
          if (reduction > 25) return '#059669'; // Emerald-600 (massive reduction)
          if (reduction > 15) return '#10b981'; // Emerald-500
          if (reduction > 5) return '#34d399'; // Emerald-400
          if (reduction > 0) return '#6ee7b7'; // Emerald-300
          return '#64748b'; // No change
        }
      }
    }

    // Standard absolute risk color palette (0-100)
    if (activeLayer === 'green_cover') {
      // High is good (green), Low is bad (yellow/orange)
      if (val >= 45) return '#15803d'; // Green-700
      if (val >= 30) return '#22c55e'; // Green-500
      if (val >= 20) return '#86efac'; // Green-300
      if (val >= 10) return '#fde047'; // Yellow-300
      return '#f97316'; // Orange-500
    }

    // Higher is higher risk
    if (val >= 85) return '#b91c1c'; // Red-700
    if (val >= 70) return '#ea580c'; // Orange-600
    if (val >= 55) return '#eab308'; // Yellow-500
    if (val >= 40) return '#38bdf8'; // Sky-400
    return '#0284c7'; // Sky-600
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Map Header & Controls */}
      <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        {/* Layer Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Layer:
          </span>
          {ENVIRONMENTAL_LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => onChangeLayer(layer.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeLayer === layer.id
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {layer.name}
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80">
          <button
            onClick={() => onChangeViewMode('baseline')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'baseline'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Baseline (BAU)
          </button>
          <button
            onClick={() => onChangeViewMode('intervention')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'intervention'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            With Interventions
          </button>
          <button
            onClick={() => onChangeViewMode('delta')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'delta'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Net Gain (Δ)
          </button>
        </div>
      </div>

      {/* Main Map Canvas and Inspector Split */}
      <div className="relative flex-1 min-h-[380px] bg-slate-950 flex flex-col md:flex-row">
        {/* SVG Geospatial Canvas */}
        <div className="relative flex-1 h-full min-h-[340px] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          {/* Subtle Grid Backdrop */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <svg
            viewBox={city.svgViewBox || '0 0 600 500'}
            className="w-full h-full max-h-[500px] object-contain transition-all duration-300 drop-shadow-md select-none"
          >
            {/* Compass Rose */}
            <g transform="translate(540, 40)" className="opacity-40">
              <circle r="16" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <path d="M 0,-12 L 3,-2 L 0,0 L -3,-2 Z" fill="#ef4444" />
              <path d="M 0,12 L 3,2 L 0,0 L -3,2 Z" fill="#94a3b8" />
              <text x="0" y="-14" textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="bold">N</text>
            </g>

            {/* City Ward Boundaries */}
            {areas.map((area) => {
              const isSelected = selectedAreaId === area.id;
              const isHovered = hoveredAreaId === area.id;
              const fillColor = getAreaFillColor(area);

              // Calculate centroid label coordinates (simple parse from polygon)
              const coords = area.svgPolygon
                .replace(/[MLZ]/g, '')
                .trim()
                .split(/\s+/)
                .map((pair) => pair.split(',').map(Number));

              const avgX = coords.reduce((acc, c) => acc + (c[0] || 0), 0) / (coords.length || 1);
              const avgY = coords.reduce((acc, c) => acc + (c[1] || 0), 0) / (coords.length || 1);

              return (
                <g key={area.id}>
                  <path
                    d={area.svgPolygon}
                    fill={fillColor}
                    fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.65}
                    stroke={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : '#334155'}
                    strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                    className="cursor-pointer transition-all duration-150"
                    onClick={() => onSelectArea(isSelected ? null : area.id)}
                    onMouseEnter={() => setHoveredAreaId(area.id)}
                    onMouseLeave={() => setHoveredAreaId(null)}
                  />

                  {/* Ward Label */}
                  <text
                    x={avgX}
                    y={avgY - 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="600"
                    className="pointer-events-none drop-shadow"
                  >
                    {area.name.split(' ')[0]}
                  </text>
                  <text
                    x={avgX}
                    y={avgY + 10}
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontSize="9.5"
                    className="pointer-events-none opacity-85"
                  >
                    {viewMode === 'delta'
                      ? simulation?.areaResults.find((ar) => ar.areaId === area.id)
                        ? `Δ ${simulation.areaResults.find((ar) => ar.areaId === area.id)!.deltas[activeLayer] > 0 ? '+' : ''}${simulation.areaResults.find((ar) => ar.areaId === area.id)!.deltas[activeLayer]}`
                        : ''
                      : `${area.baselineIndicators[activeLayer]} pts`}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 shadow-md">
            <div className="font-semibold text-slate-200 mb-1 flex items-center justify-between gap-2">
              <span>{currentLayerMeta.name}</span>
              <span className="text-[10px] text-slate-400">({currentLayerMeta.unit})</span>
            </div>
            {viewMode === 'delta' ? (
              <div className="flex items-center gap-1 text-[11px]">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                <span>Major Gain</span>
                <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block ml-1" />
                <span>Moderate Gain</span>
                <span className="w-3 h-3 rounded-sm bg-slate-500 inline-block ml-1" />
                <span>Neutral</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Low Risk</span>
                <div className="flex h-2.5 w-24 rounded overflow-hidden">
                  <div className="flex-1 bg-sky-600" />
                  <div className="flex-1 bg-yellow-500" />
                  <div className="flex-1 bg-orange-600" />
                  <div className="flex-1 bg-red-700" />
                </div>
                <span className="text-slate-400">Extreme</span>
              </div>
            )}
          </div>
        </div>

        {/* Selected Area Inspector Drawer */}
        {selectedArea ? (
          <div className="w-full md:w-80 bg-slate-900/95 border-t md:border-t-0 md:border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto max-h-[500px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  Ward #{selectedArea.vulnerabilityRank} Vulnerability
                </span>
                <button
                  onClick={() => onSelectArea(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Close
                </button>
              </div>

              <h4 className="text-base font-bold text-white mb-0.5">{selectedArea.name}</h4>
              <p className="text-xs text-slate-400 mb-4">{selectedArea.zone} · {city.name}</p>

              {/* Area Traits */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2">
                  <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <Users className="w-3 h-3 text-slate-400" /> Pop.
                  </div>
                  <div className="font-semibold text-slate-100">
                    {(selectedArea.populationEstimate / 1000).toFixed(0)}k est.
                  </div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2">
                  <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <Building className="w-3 h-3 text-slate-400" /> Impervious
                  </div>
                  <div className="font-semibold text-slate-100">
                    {selectedArea.characteristics.imperviousSurfacePercent}%
                  </div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2">
                  <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <TreeDeciduous className="w-3 h-3 text-emerald-400" /> Canopy
                  </div>
                  <div className="font-semibold text-emerald-300">
                    {selectedArea.characteristics.canopyCoverPercent}% cover
                  </div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2">
                  <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <Droplets className="w-3 h-3 text-cyan-400" /> Drainage
                  </div>
                  <div className="font-semibold text-cyan-300">
                    {selectedArea.characteristics.floodDrainageCapacityPercent}% capacity
                  </div>
                </div>
              </div>

              {/* Ward Level Indicators: Baseline vs Intervention */}
              <div className="space-y-2 mb-4">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Environmental Indicators
                </div>

                {ENVIRONMENTAL_LAYERS.map((layer) => {
                  const baseVal = selectedAreaSim?.baseline[layer.id] ?? selectedArea.baselineIndicators[layer.id];
                  const intVal = selectedAreaSim?.intervention[layer.id] ?? baseVal;
                  const delta = intVal - baseVal;
                  const isGood = layer.id === 'green_cover' ? delta > 0 : delta < 0;

                  return (
                    <div
                      key={layer.id}
                      className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-2 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-medium text-slate-200">{layer.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Baseline: <span className="text-slate-300 font-mono">{baseVal}</span> → Modeled:{' '}
                          <span className="text-slate-100 font-mono font-bold">{intVal}</span>
                        </div>
                      </div>

                      {delta !== 0 && (
                        <div
                          className={`font-mono font-semibold flex items-center gap-0.5 text-xs ${
                            isGood ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {delta > 0 ? '+' : ''}{delta}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scientific Provenance note */}
            <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Calibrated via Landsat-8 TIRS &amp; Sentinel-2 MSI data.</span>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex w-72 bg-slate-900/60 border-l border-slate-800 p-4 flex-col justify-center items-center text-center text-slate-400 text-xs">
            <Info className="w-8 h-8 text-slate-600 mb-2" />
            <p className="font-medium text-slate-300 mb-1">Select Any Ward to Inspect</p>
            <p className="text-[11px] text-slate-500">
              Click on any geographic zone on the map to inspect micro-climate indicators, population density, and localized modeled interventions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
