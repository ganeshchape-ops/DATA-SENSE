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
    return <EmptyState title="No Dataset Yet" description="Upload your first dataset to start discovering intelligence." />;
  }

  if (isProfileLoading || !profile) {
    return <LoadingSpinner message="Inspecting Numeric Feature Dimensions..." />;
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-16 animate-in-scale">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Outlier & Risk Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Anomaly Detection
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify multidimensional outliers using Isolation Forest algorithms and statistical Z-Score tests.
          </p>
        </div>

        {/* Algorithm Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#07090E] rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setMethod('isolation_forest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              method === 'isolation_forest'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Isolation Forest (ML)
          </button>
          <button
            onClick={() => setMethod('zscore')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              method === 'zscore'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Z-Score (Statistical)
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
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
              color="purple"
            />
            <StatCard
              title="Detected Anomalies"
              value={anomalyResult.anomaly_count}
              subtitle={`${anomalyResult.anomaly_percentage}% of total records`}
              icon={AlertTriangle}
              color="rose"
            />
            <StatCard
              title="Detection Model"
              value={method === 'isolation_forest' ? 'Isolation Forest' : 'Z-Score Detector'}
              subtitle="Multivariate Engine"
              icon={ShieldAlert}
              color="indigo"
            />
          </div>

          {/* AI Anomaly Summary Card */}
          <div className="glass-card-glow p-6 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>✦ AI Anomaly Diagnostic Summary</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {anomalyResult.ai_summary}
            </p>
          </div>

          {/* 2D PCA Anomaly Map & Reasons Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 2D PCA Scatter Visualization */}
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  2D PCA Anomaly Scatter Map
                </h3>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Normal
                  </span>
                  <span className="flex items-center gap-1 text-rose-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Outlier
                  </span>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="x" stroke="#64748B" fontSize={10} name="PCA 1" />
                    <YAxis dataKey="y" stroke="#64748B" fontSize={10} name="PCA 2" />
                    <Tooltip contentStyle={{ backgroundColor: '#0D111A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                    <Scatter data={anomalyResult.pca_scatter}>
                      {anomalyResult.pca_scatter.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.is_anomaly ? '#F43F5E' : '#8B5CF6'}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Root-Cause Reasons Breakdown */}
            <div className="glass-card p-6 rounded-3xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="border-b border-white/[0.06] pb-3 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Primary Anomaly Driver Breakdown
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Features exhibiting highest deviation from baseline distributions
                  </p>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {anomalyResult.top_reasons.map((reason, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-[#07090E] border border-white/[0.06] text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Flagged Anomaly Records Table */}
          {anomalyResult.anomalous_records.length > 0 && (
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Flagged Anomalous Records
                </h3>
                <span className="text-[10px] text-slate-400">Ranked by Outlier Score</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A0D15]">
                    <tr className="border-b border-white/[0.08] text-[11px] text-slate-400">
                      <th className="p-3.5">Row</th>
                      <th className="p-3.5">Anomaly Score</th>
                      <th className="p-3.5">Primary Driver</th>
                      <th className="p-3.5">Sample Values</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
                    {anomalyResult.anomalous_records.map((rec) => (
                      <tr key={rec.row_index} className="hover:bg-white/[0.03]">
                        <td className="p-3.5 font-bold text-white">#{rec.row_index}</td>
                        <td className="p-3.5 text-rose-400 font-bold">{rec.anomaly_score.toFixed(3)}</td>
                        <td className="p-3.5 text-purple-300 font-sans font-semibold">{rec.primary_driver}</td>
                        <td className="p-3.5 text-slate-400 truncate max-w-xs">
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
