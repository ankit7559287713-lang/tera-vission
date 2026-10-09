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
      await api.saveScenario({
        title: newTitle.trim(),
        description: newDesc.trim() || `Simulated policy portfolio for ${currentSimulation.cityName} (${currentSimulation.targetYear})`,
        cityId: currentSimulation.cityId,
        cityName: currentSimulation.cityName,
        targetYear: currentSimulation.targetYear,
        interventions: currentSimulation.interventions,
        resilienceScore: currentSimulation.overallResilienceScore.intervention,
        resilienceGain: currentSimulation.overallResilienceScore.gain,
        tags: newTags.split(',').map((t) => t.trim()).filter(Boolean)
      });

      setNewTitle('');
      setNewDesc('');
      onCloseSaveDialog();
      await loadScenarios();
    } catch (err) {
      console.error('Failed saving scenario:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteScenario(id);
      setScenarios((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed deleting scenario:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Modal Dialog Overlay */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DDE4DA] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE4DA]">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#245B43]" />
                <h3 className="font-bold text-base text-[#183D30]">
                  Save Future Scenario
                </h3>
              </div>
              <button
                onClick={onCloseSaveDialog}
                className="text-[#66736A] hover:text-[#26332C] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCurrent} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#183D30] font-semibold mb-1">
                  Scenario Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Koramangala 2035 Sponge City Plan"
                  className="w-full bg-[#F6F7F1] border border-[#DDE4DA] focus:border-[#245B43] rounded-lg p-2.5 text-[#26332C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#183D30] font-semibold mb-1">
                  Policy Summary / Notes
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Key assumptions, capital outlays, and ward priorities..."
                  className="w-full bg-[#F6F7F1] border border-[#DDE4DA] focus:border-[#245B43] rounded-lg p-2.5 text-[#26332C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#183D30] font-semibold mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-[#F6F7F1] border border-[#DDE4DA] focus:border-[#245B43] rounded-lg p-2.5 text-[#26332C] focus:outline-none"
                />
              </div>

              {currentSimulation && (
                <div className="bg-[#E7EEE5] p-3 rounded-lg border border-[#DDE4DA] space-y-1 text-[#26332C]">
                  <div><strong>City:</strong> {currentSimulation.cityName} ({currentSimulation.targetYear})</div>
                  <div><strong>Resilience Gain:</strong> +{currentSimulation.overallResilienceScore.gain} pts</div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseSaveDialog}
                  className="px-4 py-2 bg-white hover:bg-[#F6F7F1] border border-[#DDE4DA] text-[#66736A] rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#245B43] hover:bg-[#183D30] text-white rounded-lg font-semibold cursor-pointer"
                >
                  Save Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Scenarios List View */}
      <div className="bg-white border border-[#DDE4DA] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#183D30] flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#245B43]" />
              Saved Scenarios &amp; City Futures Catalog
            </h2>
            <p className="text-xs text-[#66736A] mt-0.5">
              Load, review, or compare previously tested intervention packages.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-[#245B43] bg-[#E7EEE5] border border-[#DDE4DA] px-2.5 py-1 rounded-lg">
            {scenarios.length} Scenarios Stored
          </span>
        </div>

        {scenarios.length === 0 ? (
          <div className="p-8 text-center text-[#66736A] bg-[#F6F7F1] rounded-xl border border-[#DDE4DA]">
            <FolderOpen className="w-10 h-10 text-[#477F78] mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-[#183D30]">No Saved Scenarios</h4>
            <p className="text-xs text-[#66736A] max-w-sm mx-auto mt-1">
              Configure parameters in the Simulation Lab and click "Save Future" to preserve scenarios.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scen) => (
              <div
                key={scen.id}
                className="bg-white border border-[#DDE4DA] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#477F78] transition-all shadow-xs space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#245B43] bg-[#E7EEE5] px-2 py-0.5 rounded">
                      {scen.cityName} · {scen.targetYear}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                      +{scen.resilienceGain} pts
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#183D30]">{scen.title}</h3>
                  <p className="text-xs text-[#66736A] leading-relaxed line-clamp-2">
                    {scen.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {scen.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-[#F6F7F1] text-[#66736A] border border-[#DDE4DA] px-1.5 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DDE4DA] flex items-center justify-between">
                  <span className="text-[10px] text-[#66736A]">
                    Score: <strong className="text-[#183D30]">{scen.resilienceScore}/100</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLoadScenario(scen)}
                      className="px-3 py-1.5 bg-[#245B43] hover:bg-[#183D30] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Load Future
                    </button>
                    <button
                      onClick={() => handleDelete(scen.id)}
                      className="p-1.5 text-[#66736A] hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete scenario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
