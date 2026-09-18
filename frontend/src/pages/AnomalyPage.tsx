import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, AlertCircle, ShieldAlert, Play, CheckCircle2,
  Activity, Layers, Sparkles, Filter, Info
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { anomalyApi } from '../services/api';
import type { AnomalyResponse } from '../types';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis,
  YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';

export const AnomalyPage: React.FC = () => {
  const { activeDataset, profile, isProfileLoading } = useDataset();

  const [method, setMethod] = useState<'isolation_forest' | 'zscore'>('isolation_forest');
  const [contamination, setContamination] = useState<number>(0.05);
  const [anomalyResult, setAnomalyResult] = useState<AnomalyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeDataset) {
      handleDetect();
    }
  }, [activeDataset?.id, method]);

  const handleDetect = async () => {
    if (!activeDataset) return;
    setLoading(true);
    setError(null);

    try {
      const res = await anomalyApi.detect(activeDataset.id, {
        method: method,
        contamination: contamination
      });
      setAnomalyResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Anomaly detection execution failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!activeDataset) {
    return <EmptyState title="No Dataset Selected" description="Please select a dataset to detect multidimensional statistical anomalies." />;
  }

  if (isProfileLoading || !profile) {
    return <LoadingSpinner message="Inspecting Numeric Feature Dimensions..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Multivariate Anomaly & Outlier Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Detect subtle multivariate patterns and isolated extreme observations using Isolation Forests and Z-Score statistics.
          </p>
        </div>

        {/* Algorithm Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setMethod('isolation_forest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              method === 'isolation_forest'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Isolation Forest (ML)
          </button>
          <button
            onClick={() => setMethod('zscore')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              method === 'zscore'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Z-Score (Statistical)
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <LoadingSpinner message="Detecting Multivariate Outlier Clusters..." subMessage="Computing anomaly scores and fitting multidimensional decision trees" />
      )}

      {anomalyResult && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Observations"
              value={anomalyResult.total_records.toLocaleString()}
              subtitle="Analyzed sample size"
              icon={Layers}
              color="indigo"
            />
            <StatCard
              title="Detected Anomalies"
              value={anomalyResult.anomaly_count}
              subtitle={`${anomalyResult.anomaly_percentage}% of total records`}
              icon={AlertTriangle}
              color="rose"
            />
            <StatCard
              title="Detection Algorithm"
              value={method === 'isolation_forest' ? 'Isolation Forest' : 'Z-Score Detector'}
              subtitle="Multivariate Ensemble"
              icon={ShieldAlert}
              color="purple"
            />
          </div>

          {/* AI Anomaly Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 border border-rose-500/20 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Anomaly Diagnostic Summary
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {anomalyResult.ai_summary}
            </p>
          </div>

          {/* 2D PCA Anomaly Map & Reasons Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 2D PCA Scatter Visualization */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  2D PCA Anomaly Scatter Map
                </h3>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Normal
                  </span>
                  <span className="flex items-center gap-1 text-rose-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Outlier
                  </span>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="x" stroke="#64748B" fontSize={10} name="PCA 1" />
                    <YAxis dataKey="y" stroke="#64748B" fontSize={10} name="PCA 2" />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    <Scatter data={anomalyResult.pca_scatter}>
                      {anomalyResult.pca_scatter.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.is_anomaly ? '#F43F5E' : '#6366F1'}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Root-Cause Reasons Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Primary Anomaly Driver Breakdown
              </h3>
              <p className="text-[11px] text-slate-400 mb-2">
                Features showing highest statistical deviations from baseline distribution
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {anomalyResult.top_reasons.map((reason, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Flagged Anomaly Records Table */}
          {anomalyResult.anomalous_records.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Flagged Anomalous Records (Top Outliers)
                </h3>
                <span className="text-[10px] text-slate-400">Sorted by Anomaly Confidence Score</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950">
                    <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                      <th className="p-3">Row Index</th>
                      <th className="p-3">Anomaly Score</th>
                      <th className="p-3">Primary Driver</th>
                      <th className="p-3">Sample Values</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {anomalyResult.anomalous_records.map((rec) => (
                      <tr key={rec.row_index} className="hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-white">#{rec.row_index}</td>
                        <td className="p-3 text-rose-400 font-bold">{rec.anomaly_score.toFixed(3)}</td>
                        <td className="p-3 text-indigo-300 font-sans font-semibold">{rec.primary_driver}</td>
                        <td className="p-3 text-slate-400 truncate max-w-xs">
                          {Object.entries(rec.data).slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
