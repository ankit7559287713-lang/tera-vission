import React, { useState, useEffect } from 'react';
import { DataProvenanceRecord } from '../types/earthsim.ts';
import { api } from '../api/client.ts';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Info,
  Calendar,
  Layers,
  Search
} from 'lucide-react';

export const EvidenceProvenance: React.FC = () => {
  const [datasets, setDatasets] = useState<DataProvenanceRecord[]>([]);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    api.getEnvironmentalData().then(setDatasets).catch(console.error);
  }, []);

  const filtered = datasets.filter((d) => {
    const matchesClass = filterClass === 'all' || d.classification === filterClass;
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.sourceOrganization.toLowerCase().includes(search.toLowerCase()) ||
      d.processingNotes.toLowerCase().includes(search.toLowerCase());
    return matchesClass && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                Data Provenance &amp; Scientific Evidence
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Evidence Tracking &amp; Methodological Transparency
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl mt-1">
              Every metric in EARTHSIM is grounded in official environmental observing systems, satellite remote sensing, or peer-reviewed CMIP6 climate projections.
            </p>
          </div>

          {/* Classification Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['all', 'Observed', 'Projected', 'Modeled'].map((cls) => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  filterClass === cls
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cls === 'all' ? 'All Sources' : cls}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search datasets by satellite sensor, organization, or measurement unit..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-200 text-xs pl-9 pr-3 py-2 rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Dataset Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((record) => (
          <div
            key={record.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                    record.classification === 'Observed'
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                      : record.classification === 'Projected'
                      ? 'bg-sky-950/60 text-sky-400 border-sky-800/60'
                      : 'bg-purple-950/60 text-purple-400 border-purple-800/60'
                  }`}
                >
                  {record.classification} Data
                </span>

                <a
                  href={record.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <span>Source Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <h3 className="text-sm font-bold text-slate-100 mb-1">{record.name}</h3>
              <p className="text-xs text-slate-400 font-medium mb-3">{record.sourceOrganization}</p>

              {/* Metadata specs */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                <div>
                  <span className="text-slate-500 block">Resolution</span>
                  <span className="text-slate-300 font-sans">{record.geographicResolution}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Time Horizon</span>
                  <span className="text-slate-300 font-sans">{record.observationPeriod}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-800/60">
                  <span className="text-slate-500 block">Measurement Units</span>
                  <span className="text-emerald-300 font-sans">{record.measurementUnits}</span>
                </div>
              </div>

              {/* Processing and Transformation notes */}
              <div className="text-xs text-slate-300 space-y-1">
                <strong className="text-slate-400 text-[11px]">Processing &amp; Normalization:</strong>
                <p className="text-[11px] text-slate-400 leading-relaxed">{record.processingNotes}</p>
              </div>
            </div>

            {/* Uncertainty Estimate */}
            <div className="pt-3 border-t border-slate-800 text-[11px] text-amber-400/90 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Uncertainty: </strong>
                {record.uncertaintyEstimate}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Model Transparency & Separation of Concepts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Rigorous Separation of Scientific Concepts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="font-bold text-emerald-400 mb-1">1. Observed Ground Truth</div>
            <p className="text-slate-400 text-[11px]">
              Direct empirical data measured by Landsat-8/9 sensors, Copernicus Sentinel-2, CPCB automated ambient monitors, and CGWB piezometer wells.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="font-bold text-sky-400 mb-1">2. Published Climate Projections</div>
            <p className="text-slate-400 text-[11px]">
              Peer-reviewed CMIP6 SSP2-4.5 ensemble simulations from WCRP/NASA predicting multi-decadal temperature shifts and extreme precipitation intensities.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="font-bold text-purple-400 mb-1">3. Illustrative Scenario Simulations</div>
            <p className="text-slate-400 text-[11px]">
              Deterministic forward-modeling equations that calculate the comparative delta of interventions. Clearly disclosed as decision-support models rather than uncalibrated weather forecasts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
