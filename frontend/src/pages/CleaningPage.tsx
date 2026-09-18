import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter, Sparkles, CheckCircle2, AlertCircle, ArrowRight,
  Trash2, RefreshCw, Eye, Save, Database
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
    return <EmptyState title="No Dataset Selected" description="Please select a dataset to perform automated data cleaning and outlier remediation." />;
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
        navigate('/dashboard/profile');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to execute dataset cleaning.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-400" />
            Data Cleaning & Transformation Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Resolve missing entries, drop duplicate rows, and treat extreme outliers with diff previews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            Preview Diff
          </button>
          <button
            onClick={handleApplyClean}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
          >
            <Save className="w-3.5 h-3.5" />
            Apply & Save Cleaned Dataset
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Missing Values Imputation */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              1. Missing Values Treatment
            </h2>
            <span className="text-[10px] text-slate-400">
              {missingColumns.length} Columns Impacted
            </span>
          </div>

          {missingColumns.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero missing values detected in this dataset.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {missingColumns.map((col) => (
                <div key={col.name} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-white">{col.name}</p>
                    <span className="text-[10px] text-amber-400">{col.count} missing records</span>
                  </div>
                  <select
                    value={missingStrategies[col.name] || "median"}
                    onChange={(e) => handleMissingChange(col.name, e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="median">Impute Median</option>
                    <option value="mean">Impute Mean</option>
                    <option value="mode">Impute Mode (Most Frequent)</option>
                    <option value="ffill">Forward Fill (Time Series)</option>
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
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              2. Duplicate Records Remediation
            </h2>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-white">Remove Exact Duplicates</p>
                <span className="text-[10px] text-slate-400">
                  {profile.duplicate_rows_count} exact duplicate rows identified ({profile.duplicate_rows_pct}%)
                </span>
              </div>
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Outlier Handler */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              3. Outlier Filtering & Capping
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Detection Method</label>
                  <select
                    value={outlierMethod}
                    onChange={(e: any) => setOutlierMethod(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="iqr">Interquartile Range (IQR 1.5x)</option>
                    <option value="zscore">Z-Score (Threshold 3.0σ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Remediation Action</label>
                  <select
                    value={outlierAction}
                    onChange={(e: any) => setOutlierAction(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="remove">Remove Outlier Rows</option>
                    <option value="cap">Cap Values to Boundary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Apply Outlier Filter on Features:</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {numericColumns.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => toggleOutlierCol(col)}
                      className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                        selectedOutlierCols.includes(col)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
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

      {/* Cleaned Dataset Name Input */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          New Cleaned Dataset Name
        </label>
        <input
          type="text"
          value={newDatasetName}
          onChange={(e) => setNewDatasetName(e.target.value)}
          placeholder={`${activeDataset.name} (Cleaned)`}
          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Before & After Preview Box */}
      {previewResult && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Transformation Diff Summary
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Row Count Diff</span>
              <p className="text-base font-bold text-white">
                {previewResult.original_rows} → <span className="text-emerald-400">{previewResult.cleaned_rows}</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Removed Duplicates</span>
              <p className="text-base font-bold text-amber-400">{previewResult.removed_duplicates}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Imputed Cells</span>
              <p className="text-base font-bold text-indigo-400">{previewResult.imputed_missing_cells}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Treated Outliers</span>
              <p className="text-base font-bold text-purple-400">{previewResult.treated_outliers}</p>
            </div>
          </div>

          {previewResult.preview_data && previewResult.preview_data.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950">
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                    {Object.keys(previewResult.preview_data[0]).map(col => (
                      <th key={col} className="p-2 font-semibold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {previewResult.preview_data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      {Object.values(row).map((val: any, j: number) => (
                        <td key={j} className="p-2 text-slate-300">{val !== null ? String(val) : '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
