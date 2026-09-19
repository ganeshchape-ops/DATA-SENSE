import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter, Sparkles, CheckCircle2, AlertCircle, ArrowRight,
  Trash2, RefreshCw, Eye, Save, Database, Wand2
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { analyticsApi } from '../services/api';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const CleaningPage: React.FC = () => {
  const { activeDataset, profile, isProfileLoading, refreshDatasets, setActiveDataset } = useDataset();
  const navigate = useNavigate();

  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [missingStrategies, setMissingStrategies] = useState<Record<string, string>>({});
  const [outlierMethod, setOutlierMethod] = useState<'iqr' | 'zscore'>('iqr');
  const [outlierAction, setOutlierAction] = useState<'remove' | 'cap'>('remove');
  const [selectedOutlierCols, setSelectedOutlierCols] = useState<string[]>([]);
  const [newDatasetName, setNewDatasetName] = useState('');

  const [previewResult, setPreviewResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!activeDataset) {
    return <EmptyState title="No Dataset Yet" description="Upload your first dataset to start discovering intelligence." />;
  }

  if (isProfileLoading || !profile) {
    return <LoadingSpinner message="Loading Dataset Schema for Cleaning..." />;
  }

  const missingColumns = Object.entries(profile.missing_per_column)
    .filter(([_, cnt]) => cnt > 0)
    .map(([col, cnt]) => ({ name: col, count: cnt }));

  const numericColumns = profile.numeric_stats.map(ns => ns.name);

  const handleMissingChange = (col: string, strat: string) => {
    setMissingStrategies(prev => ({ ...prev, [col]: strat }));
  };

  const toggleOutlierCol = (col: string) => {
    if (selectedOutlierCols.includes(col)) {
      setSelectedOutlierCols(selectedOutlierCols.filter(c => c !== col));
    } else {
      setSelectedOutlierCols([...selectedOutlierCols, col]);
    }
  };

  const buildCleanPayload = (previewOnly: boolean) => {
    const missingActions = Object.entries(missingStrategies).map(([col, strategy]) => ({
      column: col,
      strategy: strategy
    }));

    const outlierActions = selectedOutlierCols.map(col => ({
      column: col,
      method: outlierMethod,
      threshold: outlierMethod === 'iqr' ? 1.5 : 3.0,
      action: outlierAction
    }));

    return {
      missing_value_actions: missingActions,
      remove_duplicates: removeDuplicates,
      outlier_actions: outlierActions,
      new_dataset_name: newDatasetName.trim() || `${activeDataset.name} (Cleaned)`,
      preview_only: previewOnly
    };
  };

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload = buildCleanPayload(true);
      const res = await analyticsApi.clean(activeDataset.id, payload);
      setPreviewResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Preview generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClean = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload = buildCleanPayload(false);
      const res = await analyticsApi.clean(activeDataset.id, payload);
      setSuccessMsg(res.message);
      await refreshDatasets();
      if (res.new_dataset_id) {
        navigate('/profiler');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to execute dataset cleaning.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-16 animate-in-scale">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
            <Wand2 className="w-3.5 h-3.5" /> Data Hygiene & Quality
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Data Cleaning Lab
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Resolve missing entries, drop duplicate rows, and treat outliers with real-time diff preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="btn-ai-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>Preview Diff</span>
          </button>
          <button
            onClick={handleApplyClean}
            disabled={loading}
            className="btn-ai-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply & Save</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Missing Values Imputation */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              1. Missing Values Treatment
            </h2>
            <span className="text-[10px] text-slate-400">
              {missingColumns.length} Impacted
            </span>
          </div>

          {missingColumns.length === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero missing values detected across dataset fields.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {missingColumns.map((col) => (
                <div key={col.name} className="p-3.5 rounded-2xl bg-[#07090E] border border-white/[0.06] flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">{col.name}</p>
                    <span className="text-[10px] text-amber-400">{col.count} missing records</span>
                  </div>
                  <select
                    value={missingStrategies[col.name] || "median"}
                    onChange={(e) => handleMissingChange(col.name, e.target.value)}
                    className="px-3 py-1.5 bg-[#0D111A] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="median">Impute Median</option>
                    <option value="mean">Impute Mean</option>
                    <option value="mode">Impute Mode</option>
                    <option value="ffill">Forward Fill</option>
                    <option value="bfill">Backward Fill</option>
                    <option value="drop_rows">Drop Missing Rows</option>
                    <option value="drop_column">Drop Entire Column</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Duplicate Removal & Outliers */}
        <div className="space-y-6">
          {/* Duplicate Handler */}
          <div className="glass-card p-6 rounded-3xl space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              2. Duplicate Records
            </h2>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#07090E] border border-white/[0.06]">
              <div>
                <p className="text-xs font-bold text-white">Remove Exact Duplicates</p>
                <span className="text-[10px] text-slate-400">
                  {profile.duplicate_rows_count} duplicate rows ({profile.duplicate_rows_pct}%)
                </span>
              </div>
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded bg-[#07090E] border-white/20 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Outlier Handler */}
          <div className="glass-card p-6 rounded-3xl space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              3. Outlier Remediation
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Method</label>
                  <select
                    value={outlierMethod}
                    onChange={(e: any) => setOutlierMethod(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white"
                  >
                    <option value="iqr">IQR (1.5x)</option>
                    <option value="zscore">Z-Score (3.0σ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Action</label>
                  <select
                    value={outlierAction}
                    onChange={(e: any) => setOutlierAction(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white"
                  >
                    <option value="remove">Remove Rows</option>
                    <option value="cap">Cap to Boundary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Features:</label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-[#07090E] border border-white/[0.06]">
                  {numericColumns.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => toggleOutlierCol(col)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                        selectedOutlierCols.includes(col)
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Name */}
      <div className="glass-card p-6 rounded-3xl space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Cleaned Dataset Title
        </label>
        <input
          type="text"
          value={newDatasetName}
          onChange={(e) => setNewDatasetName(e.target.value)}
          placeholder={`${activeDataset.name} (Cleaned)`}
          className="w-full px-4 py-2.5 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Diff Preview */}
      {previewResult && (
        <div className="glass-card-glow p-6 rounded-3xl space-y-4">
          <div className="border-b border-white/[0.08] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Transformation Diff Summary
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#07090E] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Row Count</span>
              <p className="text-base font-bold text-white font-mono mt-0.5">
                {previewResult.original_rows} → <span className="text-emerald-400">{previewResult.cleaned_rows}</span>
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#07090E] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Duplicates Dropped</span>
              <p className="text-base font-bold text-amber-400 font-mono mt-0.5">{previewResult.removed_duplicates}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#07090E] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Imputed Cells</span>
              <p className="text-base font-bold text-purple-400 font-mono mt-0.5">{previewResult.imputed_missing_cells}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#07090E] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Treated Outliers</span>
              <p className="text-base font-bold text-purple-300 font-mono mt-0.5">{previewResult.treated_outliers}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
