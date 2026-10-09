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
  Search,
  CheckCircle2
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

  const getClassificationBadgeStyle = (cls: string) => {
    switch (cls) {
      case 'Observed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'OfficialHistorical':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'SatelliteDerived':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'Projected':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Modeled':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      default:
        return 'bg-[#F6F7F1] text-[#66736A] border-[#DDE4DA]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#DDE4DA] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-[#245B43] bg-[#E7EEE5] border border-[#DDE4DA] px-2 py-0.5 rounded flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                Data Provenance &amp; Official Evidence Registry
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#183D30]">
              Evidence Tracking, Government Datasets &amp; Methodological Transparency
            </h2>
            <p className="text-xs text-[#66736A] max-w-3xl mt-1">
              Every metric in TETRA VISION is grounded in official Indian statutory observing systems (Census of India, IMD, CPCB, CGWB, CWC, ISRO Bhuvan), Copernicus satellite remote sensing, or peer-reviewed CMIP6 regional climate trajectories.
            </p>
          </div>

          {/* Classification Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F6F7F1] p-1 rounded-lg border border-[#DDE4DA] flex-wrap">
            {['all', 'Observed', 'OfficialHistorical', 'SatelliteDerived', 'Projected', 'Modeled'].map((cls) => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  filterClass === cls
                    ? 'bg-[#245B43] text-white shadow-2xs'
                    : 'text-[#66736A] hover:text-[#183D30]'
                }`}
              >
                {cls === 'all' ? 'All Datasets' : cls}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative pt-2">
          <Search className="w-4 h-4 text-[#66736A] absolute left-3 top-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search datasets, organizations (IMD, CPCB, CGWB, ISRO, Census, ESA), or parameters..."
            className="w-full bg-[#F6F7F1] border border-[#DDE4DA] focus:border-[#245B43] rounded-lg pl-9 pr-4 py-2 text-xs text-[#26332C] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Dataset Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((record) => (
          <div
            key={record.id}
            className="bg-white border border-[#DDE4DA] rounded-xl p-4 sm:p-5 space-y-3 hover:border-[#477F78] transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getClassificationBadgeStyle(
                    record.classification
                  )}`}
                >
                  {record.classification}
                </span>

                <a
                  href={record.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#245B43] hover:text-[#183D30] flex items-center gap-1 font-semibold transition-colors"
                  title="Visit official dataset documentation"
                >
                  <span>Official Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <h3 className="text-sm font-bold text-[#183D30] leading-snug">
                {record.name}
              </h3>

              <div className="text-xs font-medium text-[#477F78]">
                {record.sourceOrganization}
              </div>

              <p className="text-xs text-[#66736A] leading-relaxed">
                {record.processingNotes}
              </p>
            </div>

            <div className="pt-3 border-t border-[#DDE4DA] space-y-1.5 text-[11px] text-[#66736A]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#245B43]" /> Observation Series:
                </span>
                <span className="font-mono text-[#183D30]">{record.observationPeriod}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Spatial Resolution:</span>
                <span className="font-mono text-[#183D30]">{record.geographicResolution}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Uncertainty Margin:</span>
                <span className="font-mono text-amber-800">{record.uncertaintyEstimate}</span>
              </div>

              {record.limitations && (
                <div className="pt-1 text-[10px] text-[#66736A] bg-[#F6F7F1] p-1.5 rounded border border-[#DDE4DA]">
                  <strong>Scope Limitation:</strong> {record.limitations}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
