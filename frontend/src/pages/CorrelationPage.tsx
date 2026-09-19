import React, { useState, useEffect } from 'react';
import {
  Network, TrendingUp, TrendingDown, AlertTriangle,
  Sparkles, Layers, Info
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { analyticsApi } from '../services/api';
import type { CorrelationResponse } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const CorrelationPage: React.FC = () => {
  const { activeDataset } = useDataset();
  const [method, setMethod] = useState<'pearson' | 'spearman'>('pearson');
  const [corrData, setCorrData] = useState<CorrelationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeDataset) {
      loadCorrelation(method);
    }
  }, [activeDataset?.id, method]);

  const loadCorrelation = async (m: string) => {
    if (!activeDataset) return;
    setLoading(true);
    try {
      const res = await analyticsApi.getCorrelation(activeDataset.id, m);
      setCorrData(res);
    } catch (err) {
      console.error("Failed to calculate correlation:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeDataset) {
    return <EmptyState title="No Dataset Yet" description="Upload your first dataset to start discovering intelligence." />;
  }

  const getHeatmapColor = (val: number) => {
    if (val === 1.0) return 'bg-purple-600 text-white font-bold';
    if (val >= 0.7) return 'bg-purple-500/70 text-white font-semibold';
    if (val >= 0.4) return 'bg-purple-500/40 text-purple-100';
    if (val > 0.1) return 'bg-purple-500/15 text-slate-300';
    if (val >= -0.1) return 'bg-white/[0.02] text-slate-500';
    if (val >= -0.4) return 'bg-rose-500/20 text-rose-300';
    if (val >= -0.7) return 'bg-rose-500/50 text-white font-semibold';
    return 'bg-rose-600 text-white font-bold';
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-16 animate-in-scale">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
            <Network className="w-3.5 h-3.5" /> Inter-Variable Dependencies
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Correlation Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Detect linear and monotonic relationships between numeric variables in <strong className="text-white">{activeDataset.name}</strong>
          </p>
        </div>

        {/* Method Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#07090E] rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setMethod('pearson')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              method === 'pearson'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pearson (Linear)
          </button>
          <button
            onClick={() => setMethod('spearman')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              method === 'spearman'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Spearman (Rank)
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating Matrix Correlations..." />
      ) : corrData && corrData.columns.length > 1 ? (
        <div className="space-y-6">
          {corrData.high_multicollinearity_alerts.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Multicollinearity Warning (|r| ≥ 0.85)</span>
              </div>
              {corrData.high_multicollinearity_alerts.map((alert, i) => (
                <p key={i} className="text-slate-300 ml-6">• {alert.warning}</p>
              ))}
            </div>
          )}

          {/* Heatmap Matrix */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                {method === 'pearson' ? 'Pearson Correlation Heatmap' : 'Spearman Rank Correlation Heatmap'}
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">-1.00 (Inverse) to +1.00 (Aligned)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2.5 text-left text-[11px] font-semibold text-slate-400">Feature</th>
                    {corrData.columns.map((c) => (
                      <th key={c} className="p-2.5 text-[10px] font-semibold text-slate-300 truncate max-w-[90px]" title={c}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {corrData.columns.map((rowName, rIdx) => (
                    <tr key={rowName}>
                      <td className="p-2.5 text-left text-xs font-bold text-white truncate max-w-[120px]" title={rowName}>
                        {rowName}
                      </td>
                      {corrData.matrix[rIdx].map((val, cIdx) => (
                        <td key={cIdx} className="p-1">
                          <div
                            className={`p-2 rounded-xl text-xs font-mono transition-transform hover:scale-110 cursor-pointer ${getHeatmapColor(val)}`}
                            title={`${rowName} vs ${corrData.columns[cIdx]}: ${val.toFixed(3)}`}
                          >
                            {val.toFixed(2)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Positive & Negative Relationships */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                Strongest Positive Correlated Drivers
              </div>

              {corrData.top_positive_pairs.length === 0 ? (
                <p className="text-xs text-slate-500">No strong positive relationships detected (r &gt; 0.30).</p>
              ) : (
                <div className="space-y-2">
                  {corrData.top_positive_pairs.map((p, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[#07090E] border border-white/[0.06] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{p.var1} <span className="text-purple-400">&</span> {p.var2}</p>
                        <span className="text-[10px] text-slate-400">{p.strength} Positive Correlation</span>
                      </div>
                      <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/25">
                        +{p.correlation.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
                <TrendingDown className="w-4 h-4" />
                Strongest Inverse Correlated Drivers
              </div>

              {corrData.top_negative_pairs.length === 0 ? (
                <p className="text-xs text-slate-500">No strong inverse relationships detected (r &lt; -0.30).</p>
              ) : (
                <div className="space-y-2">
                  {corrData.top_negative_pairs.map((p, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[#07090E] border border-white/[0.06] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{p.var1} <span className="text-rose-400">&</span> {p.var2}</p>
                        <span className="text-[10px] text-slate-400">{p.strength} Inverse Correlation</span>
                      </div>
                      <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/25">
                        {p.correlation.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 rounded-3xl glass-card">
          Dataset requires at least 2 continuous numeric attributes to compute a correlation matrix.
        </div>
      )}
    </div>
  );
};
