import React, { useState, useEffect } from 'react';
import {
  City,
  CityArea,
  EnvironmentalLayerId,
  SimulationResult
} from '../types/earthsim.ts';
import { ENVIRONMENTAL_LAYERS } from '../server/data/cities.ts';
import { api } from '../api/client.ts';
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
  Droplets,
  Flame,
  Download,
  Radio,
  RefreshCw,
  X
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
  const [highlightHotspots, setHighlightHotspots] = useState<boolean>(false);
  const [liveObs, setLiveObs] = useState<any>(null);
  const [syncingLive, setSyncingLive] = useState<boolean>(false);

  useEffect(() => {
    api.getLiveObservation(city.id).then(setLiveObs).catch(console.warn);
  }, [city.id]);

  const handleSyncLive = async () => {
    setSyncingLive(true);
    try {
      const res = await api.ingestLiveStream(city.id);
      setLiveObs(res.observation);
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setSyncingLive(false);
    }
  };

  const handleExportGeoJson = () => {
    const link = document.createElement('a');
    link.href = `/api/cities/${city.id}/export-geojson`;
    link.setAttribute('download', `${city.id}-environmental-features.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        const delta = areaSim.deltas[activeLayer];
        if (activeLayer === 'green_cover') {
          if (delta > 15) return '#15803D'; // Green-700
          if (delta > 5) return '#22C55E'; // Green-500
          if (delta > 0) return '#86EFAC'; // Green-300
          return '#94A3B8';
        } else {
          const reduction = -delta;
          if (reduction > 20) return '#15803D';
          if (reduction > 10) return '#22C55E';
          if (reduction > 3) return '#86EFAC';
          if (reduction > 0) return '#A7F3D0';
          return '#94A3B8';
        }
      }
    }

    // Standard absolute risk color palette (0-100)
    if (activeLayer === 'green_cover') {
      if (val >= 40) return '#15803D';
      if (val >= 28) return '#22C55E';
      if (val >= 18) return '#86EFAC';
      if (val >= 10) return '#FDE047';
      return '#FB923C';
    }

    // Risk layers (higher is worse)
    if (val >= 85) return '#991B1B'; // Dark Red
    if (val >= 70) return '#DC2626'; // Red
    if (val >= 55) return '#EA580C'; // Orange
    if (val >= 40) return '#F59E0B'; // Amber
    if (val >= 25) return '#0284C7'; // Blue
    return '#0284C7';
  };

  return (
    <div className="bg-white border border-[#DDE4DA] rounded-xl overflow-hidden flex flex-col h-full shadow-xs">
      {/* Map Header & Controls */}
      <div className="p-3 sm:p-4 border-b border-[#DDE4DA] bg-[#F6F7F1] flex flex-wrap items-center justify-between gap-3">
        {/* Layer Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-[#66736A] font-medium mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#245B43]" /> Layer:
          </span>
          {ENVIRONMENTAL_LAYERS.map((layer) => {
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => onChangeLayer(layer.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#245B43] text-white shadow-2xs'
                    : 'bg-white text-[#26332C] border border-[#DDE4DA] hover:bg-[#E7EEE5]'
                }`}
              >
                {layer.name}
              </button>
            );
          })}
        </div>

        {/* View Mode Segmented Switcher & Tools */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#E7EEE5] p-0.5 rounded-lg border border-[#DDE4DA] text-xs">
            <button
              onClick={() => onChangeViewMode('baseline')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'baseline'
                  ? 'bg-white text-[#183D30] shadow-2xs font-semibold'
                  : 'text-[#66736A] hover:text-[#26332C]'
              }`}
              title="View Business As Usual (Do Nothing) projection"
            >
              Baseline BAU
            </button>
            <button
              onClick={() => onChangeViewMode('intervention')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'intervention'
                  ? 'bg-white text-[#183D30] shadow-2xs font-semibold'
                  : 'text-[#66736A] hover:text-[#26332C]'
              }`}
              title="View scenario with simulated interventions applied"
            >
              Modeled Actions
            </button>
            <button
              onClick={() => onChangeViewMode('delta')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'delta'
                  ? 'bg-white text-[#183D30] shadow-2xs font-semibold'
                  : 'text-[#66736A] hover:text-[#26332C]'
              }`}
              title="View net change (Intervention - Baseline)"
            >
              Net Relief (Δ)
            </button>
          </div>

          {/* Hotspots Toggle */}
          <button
            onClick={() => setHighlightHotspots(!highlightHotspots)}
            className={`px-2 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
              highlightHotspots
                ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
                : 'bg-white text-[#66736A] border-[#DDE4DA] hover:text-[#26332C]'
            }`}
            title="Highlight top vulnerability hotspot zones"
          >
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span className="hidden sm:inline">Critical Hotspots</span>
          </button>

          {/* Export GeoJSON */}
          <button
            onClick={handleExportGeoJson}
            className="p-1.5 bg-white hover:bg-[#F6F7F1] text-[#66736A] hover:text-[#26332C] border border-[#DDE4DA] rounded-lg transition-colors cursor-pointer"
            title="Export City Boundaries as GeoJSON FeatureCollection"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Observation Banner */}
      {liveObs && (
        <div className="bg-[#E7EEE5]/70 border-b border-[#DDE4DA] px-3.5 py-1.5 text-xs text-[#26332C] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-x-auto text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-[#245B43]">
              <Radio className="w-3 h-3 text-[#245B43] animate-pulse" />
              Live Observational Stream ({liveObs.cityName}):
            </span>
            <span>
              Temp: <strong className="text-[#183D30]">{liveObs.weather?.temperatureC}°C</strong>
            </span>
            <span>
              Humidity: <strong className="text-[#183D30]">{liveObs.weather?.relativeHumidityPercent}%</strong>
            </span>
            <span>
              PM2.5: <strong className="text-[#183D30]">{liveObs.airQuality?.pm25} µg/m³</strong> ({liveObs.airQuality?.aqiCategory})
            </span>
          </div>

          <button
            onClick={handleSyncLive}
            disabled={syncingLive}
            className="text-[10px] text-[#66736A] hover:text-[#245B43] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${syncingLive ? 'animate-spin' : ''}`} />
            <span>Sync Station Feeds</span>
          </button>
        </div>
      )}

      {/* Main Map Canvas and Inspector Split */}
      <div className="relative flex-1 min-h-[380px] bg-[#FBFBF9] flex flex-col md:flex-row">
        {/* SVG Geospatial Canvas */}
        <div className="relative flex-1 h-full min-h-[340px] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          {/* Subtle Grid Backdrop */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <svg
            viewBox={city.svgViewBox || '0 0 600 500'}
            className="w-full h-full max-h-[500px] object-contain transition-all duration-300 select-none"
          >
            {/* Compass Rose */}
            <g transform="translate(540, 40)" className="opacity-60">
              <circle r="16" fill="#FFFFFF" stroke="#DDE4DA" strokeWidth="1.5" />
              <path d="M 0,-12 L 3,-2 L 0,0 L -3,-2 Z" fill="#DC2626" />
              <path d="M 0,12 L 3,2 L 0,0 L -3,2 Z" fill="#64748B" />
              <text x="0" y="-14" textAnchor="middle" fontSize="9" fill="#183D30" fontWeight="bold">N</text>
            </g>

            {/* City Ward Boundaries */}
            {areas.map((area) => {
              const isSelected = selectedAreaId === area.id;
              const isHovered = hoveredAreaId === area.id;
              const isHotspot = area.vulnerabilityRank <= 3 || (area.baselineIndicators.extreme_heat >= 75 && area.baselineIndicators.flood_exposure >= 70);
              const fillColor = highlightHotspots && isHotspot ? '#991B1B' : getAreaFillColor(area);

              // Calculate centroid label coordinates
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
                    fillOpacity={isSelected ? 0.95 : isHovered ? 0.90 : 0.82}
                    stroke={isSelected ? '#183D30' : highlightHotspots && isHotspot ? '#DC2626' : isHovered ? '#183D30' : '#FFFFFF'}
                    strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
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
                    fill="#183D30"
                    fontSize="11"
                    fontWeight="700"
                    className="pointer-events-none"
                    style={{
                      paintOrder: 'stroke',
                      stroke: '#FFFFFF',
                      strokeWidth: '3px',
                      strokeLinejoin: 'round'
                    }}
                  >
                    {area.name.split(' ')[0]}
                  </text>
                  <text
                    x={avgX}
                    y={avgY + 10}
                    textAnchor="middle"
                    fill="#26332C"
                    fontSize="9.5"
                    fontWeight="600"
                    className="pointer-events-none"
                    style={{
                      paintOrder: 'stroke',
                      stroke: '#FFFFFF',
                      strokeWidth: '2.5px',
                      strokeLinejoin: 'round'
                    }}
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
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-[#DDE4DA] rounded-lg p-2.5 text-xs text-[#26332C] shadow-xs">
            <div className="font-semibold text-[#183D30] mb-1 flex items-center justify-between gap-2">
              <span>{currentLayerMeta.name}</span>
              <span className="text-[10px] text-[#66736A]">({currentLayerMeta.unit})</span>
            </div>
            {viewMode === 'delta' ? (
              <div className="flex items-center gap-1 text-[11px]">
                <span className="w-3 h-3 rounded-xs bg-emerald-700 inline-block" />
                <span>High Relief</span>
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block ml-1" />
                <span>Moderate</span>
                <span className="w-3 h-3 rounded-xs bg-slate-400 inline-block ml-1" />
                <span>No Change</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-[#66736A]">Low Risk</span>
                <div className="flex h-2.5 w-24 rounded overflow-hidden">
                  <div className="flex-1 bg-sky-600" />
                  <div className="flex-1 bg-amber-500" />
                  <div className="flex-1 bg-orange-600" />
                  <div className="flex-1 bg-red-700" />
                </div>
                <span className="text-[#66736A]">High Risk</span>
              </div>
            )}
          </div>
        </div>

        {/* Selected Ward Inspection Drawer / Sidebar */}
        {selectedArea && (
          <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-[#DDE4DA] p-4 flex flex-col justify-between overflow-y-auto max-h-[500px]">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#245B43] bg-[#E7EEE5] px-1.5 py-0.5 rounded">
                    {selectedArea.zone}
                  </span>
                  <h3 className="text-base font-bold text-[#183D30] mt-1">{selectedArea.name}</h3>
                  <p className="text-xs text-[#66736A]">Ward ID: {selectedArea.id}</p>
                </div>
                <button
                  onClick={() => onSelectArea(null)}
                  className="text-[#66736A] hover:text-[#26332C] p-1 cursor-pointer"
                  title="Close ward inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Ward Population & Area Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-[#F6F7F1] p-2.5 rounded-lg border border-[#DDE4DA] text-xs">
                <div>
                  <div className="text-[10px] text-[#66736A] flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#245B43]" /> Projected Pop
                  </div>
                  <div className="font-bold text-[#183D30] text-sm">
                    {selectedAreaSim?.population?.projectedPopulation?.toLocaleString() || selectedArea.populationEstimate.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-[#66736A]">
                    {selectedAreaSim?.population ? `${simulation?.targetYear} Projection` : 'Census baseline'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#66736A] flex items-center gap-1">
                    <Building className="w-3 h-3 text-[#245B43]" /> Ward Area
                  </div>
                  <div className="font-bold text-[#183D30] text-sm">{selectedArea.areaKm2} km²</div>
                  <div className="text-[9px] text-[#66736A]">
                    {selectedAreaSim?.population ? `${selectedAreaSim.population.densityPerKm2.toLocaleString()}/km²` : 'Urban density'}
                  </div>
                </div>
              </div>

              {/* Active Layer Risk Comparison */}
              {selectedAreaSim && (
                <div className="space-y-2 border-t border-[#DDE4DA] pt-3">
                  <div className="text-xs font-semibold text-[#183D30] flex items-center justify-between">
                    <span>{currentLayerMeta.name}</span>
                    <span className="text-[10px] text-[#66736A]">Scale 0–100</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#F6F7F1] p-2 rounded-lg border border-[#DDE4DA]">
                      <div className="text-[10px] text-[#66736A]">Baseline (BAU)</div>
                      <div className="text-base font-bold text-[#EA580C]">
                        {selectedAreaSim.baseline[activeLayer]}
                      </div>
                    </div>
                    <div className="bg-[#E7EEE5] p-2 rounded-lg border border-[#DDE4DA]">
                      <div className="text-[10px] text-[#245B43] font-medium">With Interventions</div>
                      <div className="text-base font-bold text-[#245B43]">
                        {selectedAreaSim.intervention[activeLayer]}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-[#66736A]">Net Change (Δ):</span>
                    <span
                      className={`font-bold font-mono ${
                        selectedAreaSim.deltas[activeLayer] < 0 && activeLayer !== 'green_cover'
                          ? 'text-emerald-700'
                          : selectedAreaSim.deltas[activeLayer] > 0 && activeLayer === 'green_cover'
                          ? 'text-emerald-700'
                          : 'text-[#66736A]'
                      }`}
                    >
                      {selectedAreaSim.deltas[activeLayer] > 0 ? '+' : ''}
                      {selectedAreaSim.deltas[activeLayer]} pts
                    </span>
                  </div>
                </div>
              )}

              {/* Physical Environmental Characteristics */}
              <div className="space-y-1.5 border-t border-[#DDE4DA] pt-3 text-xs">
                <div className="text-[11px] font-semibold text-[#183D30] mb-1">
                  Physical Vulnerability Profile:
                </div>

                <div className="flex items-center justify-between text-[#66736A]">
                  <span className="flex items-center gap-1.5">
                    <TreeDeciduous className="w-3.5 h-3.5 text-emerald-600" /> Tree Canopy Cover
                  </span>
                  <span className="font-mono font-medium text-[#183D30]">
                    {selectedArea.characteristics.canopyCoverPercent}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#66736A]">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" /> Impervious Surface
                  </span>
                  <span className="font-mono font-medium text-[#183D30]">
                    {selectedArea.characteristics.imperviousSurfacePercent}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#66736A]">
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-600" /> Storm Drainage Capacity
                  </span>
                  <span className="font-mono font-medium text-[#183D30]">
                    {selectedArea.characteristics.floodDrainageCapacityPercent}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#66736A]">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-600" /> Groundwater Depth
                  </span>
                  <span className="font-mono font-medium text-[#183D30]">
                    {selectedArea.characteristics.groundwaterDepthMeters} mbgl
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DDE4DA] mt-3">
              <div className="text-[10px] text-[#66736A] italic">
                Source: ISRO Bhuvan LULC, CGWB NAQUIM &amp; Census 2011 baseline.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
