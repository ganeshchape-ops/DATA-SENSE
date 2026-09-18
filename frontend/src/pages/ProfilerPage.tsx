import React from 'react';
import {
  Database, ShieldCheck, AlertTriangle, Layers, Binary,
  PieChart as PieIcon, BarChart2, Info, ArrowUpRight
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProfilerPage: React.FC = () => {
  const { activeDataset, profile, isProfileLoading } = useDataset();

  if (!activeDataset) {
    return <EmptyState title="No Dataset Selected" description="Please upload or select a dataset to inspect its automated statistical profile." />;
  }

  if (isProfileLoading || !profile) {
    return <LoadingSpinner message="Generating Deep Dataset Profile..." subMessage="Calculating quartiles, IQR, skewness, kurtosis, and cardinality" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Automated Data Profiler
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive structural and distributional assessment for <span className="text-white font-semibold">{profile.dataset_name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Memory Footprint: </span>
            <span className="font-bold text-white">{profile.memory_usage_kb} KB</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Records"
          value={profile.rows.toLocaleString()}
          subtitle="Observations"
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Total Columns"
          value={profile.columns}
          subtitle="Dimensional features"
          icon={Database}
          color="blue"
        />
        <StatCard
          title="Health Score"
          value={`${profile.data_quality_score}%`}
          subtitle="Data Integrity"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Missing Cells"
          value={profile.total_missing_cells}
          subtitle={`${profile.missing_cells_pct}% missingness`}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Duplicates"
          value={profile.duplicate_rows_count}
          subtitle={`${profile.duplicate_rows_pct}% duplicate`}
          icon={Binary}
          color="rose"
        />
        <StatCard
          title="Numeric / Cat"
          value={`${profile.numeric_columns_count} / ${profile.categorical_columns_count}`}
          subtitle={`${profile.datetime_columns_count} datetime`}
          icon={PieIcon}
          color="purple"
        />
      </div>

      {/* Numerical Attributes Statistical Matrix */}
      {profile.numeric_stats && profile.numeric_stats.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Numerical Features Descriptive Statistics
              </h2>
              <p className="text-[11px] text-slate-400">
                Parametric & Non-Parametric summary metrics including Quartiles, IQR, Skewness, and Kurtosis
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {profile.numeric_stats.length} Numeric Features
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pb-2.5 font-semibold">Column</th>
                  <th className="pb-2.5 font-semibold">Mean</th>
                  <th className="pb-2.5 font-semibold">Std Dev</th>
                  <th className="pb-2.5 font-semibold">Min</th>
                  <th className="pb-2.5 font-semibold">25% (Q1)</th>
                  <th className="pb-2.5 font-semibold">Median (Q2)</th>
                  <th className="pb-2.5 font-semibold">75% (Q3)</th>
                  <th className="pb-2.5 font-semibold">Max</th>
                  <th className="pb-2.5 font-semibold">IQR</th>
                  <th className="pb-2.5 font-semibold">Skewness</th>
                  <th className="pb-2.5 font-semibold">Missing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {profile.numeric_stats.map((ns) => (
                  <tr key={ns.name} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 font-sans font-semibold text-white">{ns.name}</td>
                    <td className="py-2.5 text-slate-300">{ns.mean !== null ? ns.mean.toLocaleString() : '-'}</td>
                    <td className="py-2.5 text-slate-300">{ns.std !== null ? ns.std.toLocaleString() : '-'}</td>
                    <td className="py-2.5 text-slate-300">{ns.min !== null ? ns.min.toLocaleString() : '-'}</td>
                    <td className="py-2.5 text-slate-400">{ns.q25 !== null ? ns.q25.toLocaleString() : '-'}</td>
                    <td className="py-2.5 text-indigo-300 font-bold">{ns.median !== null ? ns.median.toLocaleString() : '-'}</td>
                    <td className="py-2.5 text-slate-400">{ns.q75 !== null ? ns.q75.toLocaleString() : '-'}</td>
                    <td className="py-2.5 text-slate-300">{ns.max !== null ? ns.max.toLocaleString() : '-'}</td>
                    <td className="py-2.5 text-slate-400">{ns.iqr !== null ? ns.iqr.toLocaleString() : '-'}</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        ns.skewness && Math.abs(ns.skewness) > 1.0
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {ns.skewness !== null ? ns.skewness.toFixed(2) : '-'}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-[11px] ${ns.missing > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                        {ns.missing} ({ns.missing_pct}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categorical & Cardinality Breakdown */}
      {profile.categorical_stats && profile.categorical_stats.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Categorical & Discrete Dimensions
              </h2>
              <p className="text-[11px] text-slate-400">
                Cardinality and category concentration distribution
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.categorical_stats.map((cs) => (
              <div key={cs.name} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white truncate">{cs.name}</h3>
                    <span className="text-[10px] text-slate-400">{cs.unique_count} Unique Categories</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    {cs.dtype}
                  </span>
                </div>

                <div className="space-y-2">
                  {cs.top_categories.slice(0, 5).map((cat, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-300 truncate max-w-[150px]">{cat.category || "Empty"}</span>
                        <span className="text-slate-400 font-mono">{cat.count} ({cat.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, cat.percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
