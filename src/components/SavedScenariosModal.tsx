import React, { useState, useEffect } from 'react';
import {
  SavedScenario,
  SimulationResult,
  InterventionParameters,
  TargetYear
} from '../types/earthsim.ts';
import { api } from '../api/client.ts';
import {
  Bookmark,
  Trash2,
  FolderOpen,
  Plus,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface SavedScenariosProps {
  currentSimulation: SimulationResult | null;
  onLoadScenario: (scenario: SavedScenario) => void;
  showSaveDialog: boolean;
  onCloseSaveDialog: () => void;
}

export const SavedScenarios: React.FC<SavedScenariosProps> = ({
  currentSimulation,
  onLoadScenario,
  showSaveDialog,
  onCloseSaveDialog
}) => {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('Urban Resilience, Custom');

  const loadScenarios = async () => {
    setLoading(true);
    try {
      const data = await api.getSavedScenarios();
      setScenarios(data);
    } catch (err) {
      console.error('Error fetching scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  const handleSaveCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSimulation || !newTitle.trim()) return;

    try {
      const tagsArray = newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const saved = await api.saveScenario({
        title: newTitle.trim(),
        description: newDesc.trim() || 'Custom city futures scenario',
        cityId: currentSimulation.cityId,
        cityName: currentSimulation.cityName,
        targetYear: currentSimulation.targetYear,
        interventions: currentSimulation.interventions,
        resilienceScore: currentSimulation.overallResilienceScore.intervention,
        resilienceGain: currentSimulation.overallResilienceScore.gain,
        tags: tagsArray
      });

      setScenarios((prev) => [saved, ...prev]);
      setNewTitle('');
      setNewDesc('');
      onCloseSaveDialog();
    } catch (err) {
      console.error('Error saving scenario:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved scenario?')) return;
    try {
      await api.deleteScenario(id);
      setScenarios((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting scenario:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Scenario Modal Dialog */}
      {showSaveDialog && currentSimulation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-400" />
                Save Active Simulation Future
              </h3>
              <button
                onClick={onCloseSaveDialog}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCurrent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Scenario Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Comprehensive Sponge & Canopy Blitz 2035"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 p-2.5 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Summary of core policy interventions and expected yields..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 p-2.5 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Flood, Cool Roofs, High Priority"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 p-2.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 space-y-0.5">
                <div>City: <span className="text-white">{currentSimulation.cityName}</span></div>
                <div>Target Horizon: <span className="text-white">{currentSimulation.targetYear}</span></div>
                <div>Resilience Score: <span className="text-emerald-400 font-bold">{currentSimulation.overallResilienceScore.intervention}/100 (+{currentSimulation.overallResilienceScore.gain} pts)</span></div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCloseSaveDialog}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md"
                >
                  Confirm &amp; Persist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Catalog Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-400" />
            Persisted Climate Scenarios Catalog
          </h2>
          <p className="text-xs text-slate-400">
            Compare alternative futures saved across multiple municipal planning sessions.
          </p>
        </div>

        <button
          onClick={loadScenarios}
          className="text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
        >
          Refresh Catalog
        </button>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scen) => (
          <div
            key={scen.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:border-slate-700 transition-all space-y-4"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white font-mono">{scen.cityName}</span>
                <span className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 px-2 py-0.5 rounded text-[11px] font-mono font-semibold">
                  {scen.targetYear} Horizon
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 mb-1">{scen.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{scen.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {scen.tags?.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Resilience Score Badge */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Resilience Score:</span>
                <span className="font-bold text-emerald-400">
                  {scen.resilienceScore}/100 (+{scen.resilienceGain} pts)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onLoadScenario(scen)}
                className="flex-1 py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Load into Lab</span>
              </button>

              <button
                onClick={() => handleDelete(scen.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Delete saved scenario"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
