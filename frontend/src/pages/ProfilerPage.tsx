import React from 'react';
import {
  Database, ShieldCheck, AlertTriangle, Layers, Binary,
  PieChart as PieIcon, BarChart2, Info, CheckCircle2, TrendingUp
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { Link } from 'react-router-dom';

export const ProfilerPage: React.FC = () => {
  const { activeDataset, profile, rawRows } = useDataset();

  if (!activeDataset || !profile) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-xs max-w-xl mx-auto my-12 space-y-4 animate-in-scale">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Database className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Dataset Uploaded</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Upload any dataset to inspect full descriptive statistics, data quality metrics, skewness, kurtosis, and quartiles.
        </p>
        <div className="pt-2">
          <Link to="/upload" className="btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2">
            Upload Dataset
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in-scale">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4" /> Data Quality & Profiling Engine
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Statistical Profiler & Quality Audit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated parametric and non-parametric verification for <strong className="text-slate-800">{activeDataset.name}</strong>
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
          <span className="text-slate-500">File Size:</span>
          <span className="font-bold text-slate-900">{profile.memory_usage_kb} KB</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Records</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{profile.rows.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Rows in dataset</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Columns</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{profile.columns}</p>
          <span className="text-[10px] text-slate-500">Attributes mapped</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quality Score</span>
          <p className="text-xl font-black text-emerald-600 font-mono mt-1">{profile.data_quality_score}%</p>
          <span className="text-[10px] text-slate-500">Integrity Index</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Missing Cells</span>
          <p className="text-xl font-black text-amber-600 font-mono mt-1">{profile.total_missing_cells}</p>
          <span className="text-[10px] text-slate-500">{profile.missing_cells_pct}% missingness</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duplicates</span>
          <p className="text-xl font-black text-rose-600 font-mono mt-1">{profile.duplicate_rows_count}</p>
          <span className="text-[10px] text-slate-500">{profile.duplicate_rows_pct}% redundant</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Types</span>
          <p className="text-xl font-black text-indigo-600 font-mono mt-1">{profile.numeric_columns_count}N / {profile.categorical_columns_count}C</p>
          <span className="text-[10px] text-slate-500">Numeric vs Cat</span>
        </div>
      </div>

      {/* Numerical Attributes Statistical Matrix */}
      {profile.numeric_stats && profile.numeric_stats.length > 0 && (
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Numerical Features Descriptive Statistics
              </h2>
              <p className="text-xs text-slate-500">
                Calculated parametric and non-parametric summary metrics (Means, Quartiles, IQR, Skewness, Kurtosis)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              {profile.numeric_stats.length} Numeric Columns
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-3 font-bold">Column</th>
                  <th className="p-3 font-bold">Mean</th>
                  <th className="p-3 font-bold">Std Dev</th>
                  <th className="p-3 font-bold">Min</th>
                  <th className="p-3 font-bold">Q1 (25%)</th>
                  <th className="p-3 font-bold">Median (Q2)</th>
                  <th className="p-3 font-bold">Q3 (75%)</th>
                  <th className="p-3 font-bold">Max</th>
                  <th className="p-3 font-bold">IQR</th>
                  <th className="p-3 font-bold">Skewness</th>
                  <th className="p-3 font-bold">Missing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {profile.numeric_stats.map((ns) => (
                  <tr key={ns.name} className="hover:bg-slate-50">
                    <td className="p-3 font-sans font-bold text-slate-900">{ns.name}</td>
                    <td className="p-3 text-slate-800">{ns.mean !== null ? ns.mean.toLocaleString() : '-'}</td>
                    <td className="p-3 text-slate-600">{ns.std !== null ? ns.std.toLocaleString() : '-'}</td>
                    <td className="p-3 text-slate-600">{ns.min !== null ? ns.min.toLocaleString() : '-'}</td>
                    <td className="p-3 text-slate-500">{ns.q25 !== null ? ns.q25.toLocaleString() : '-'}</td>
                    <td className="p-3 text-indigo-600 font-bold">{ns.median !== null ? ns.median.toLocaleString() : '-'}</td>
                    <td className="p-3 text-slate-500">{ns.q75 !== null ? ns.q75.toLocaleString() : '-'}</td>
                    <td className="p-3 text-slate-600">{ns.max !== null ? ns.max.toLocaleString() : '-'}</td>
                    <td className="p-3 text-slate-500">{ns.iqr !== null ? ns.iqr.toLocaleString() : '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        ns.skewness && Math.abs(ns.skewness) > 1.0
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ns.skewness !== null ? ns.skewness.toFixed(2) : '-'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={ns.missing > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}>
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

      {/* Categorical Dimensions Breakdown */}
      {profile.categorical_stats && profile.categorical_stats.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Categorical Cardinality & Distributions
            </h2>
            <p className="text-xs text-slate-500">
              Discrete value occurrences and relative proportions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.categorical_stats.map((cs) => (
              <div key={cs.name} className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{cs.name}</h3>
                    <span className="text-[11px] text-slate-500">{cs.unique_count} Distinct Categories</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {cs.dtype}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {cs.top_categories.slice(0, 5).map((cat, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-700 font-medium truncate max-w-[150px]">{cat.category || "(Empty)"}</span>
                        <span className="text-slate-500 font-mono">{cat.count} ({cat.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${Math.min(100, cat.percentage)}%` }}
                        />
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
