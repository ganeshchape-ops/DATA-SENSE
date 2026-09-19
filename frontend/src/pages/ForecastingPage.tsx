import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, Play, Sparkles, Activity,
  Layers, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { forecastApi } from '../services/api';
import type { ForecastResponse } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis,
  YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

export const ForecastingPage: React.FC = () => {
  const { activeDataset, profile, isProfileLoading } = useDataset();

  const [dateCol, setDateCol] = useState<string>('');
  const [targetCol, setTargetCol] = useState<string>('');
  const [periods, setPeriods] = useState<number>(30);
  const [frequency, setFrequency] = useState<string>('D');

  const [forecastResult, setForecastResult] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeDataset && profile) {
      const dateCols = Object.entries(profile.column_types)
        .filter(([_, t]) => t === 'datetime')
        .map(([c]) => c);

      if (dateCols.length > 0) {
        setDateCol(dateCols[0]);
      } else {
        setDateCol(activeDataset.column_names[0]);
      }

      if (profile.numeric_stats.length > 0) {
        setTargetCol(profile.numeric_stats[0].name);
      }
    }
  }, [activeDataset?.id, profile]);

  const handleGenerateForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDataset || !dateCol || !targetCol) return;
    setLoading(true);
    setError(null);

    try {
      const res = await forecastApi.generate(activeDataset.id, {
        date_col: dateCol,
        target_col: targetCol,
        forecast_periods: periods,
        frequency: frequency
      });
      setForecastResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Time-series forecasting failed. Please ensure the selected date column contains valid timestamp records.");
    } finally {
      setLoading(false);
    }
  };

  if (!activeDataset) {
    return <EmptyState title="No Dataset Yet" description="Upload your first dataset to start discovering intelligence." />;
  }

  if (isProfileLoading || !profile) {
    return <LoadingSpinner message="Checking Time Series Column Attributes..." />;
  }

  const numericCols = profile.numeric_stats.map(ns => ns.name);

  const combinedChartData = forecastResult
    ? [
        ...forecastResult.historical.map(h => ({
          date: h.date,
          actual: h.actual,
          trend: h.trend,
          forecast: null,
          upper: null,
          lower: null
        })),
        ...forecastResult.forecast.map(f => ({
          date: f.date,
          actual: null,
          trend: null,
          forecast: f.forecast,
          upper: f.upper_bound,
          lower: f.lower_bound
        }))
      ]
    : [];

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-16 animate-in-scale">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> Predictive Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Forecasting Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Detect temporal momentum, seasonality, and project forward trends with 95% expanding confidence bounds.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Forecasting Control Panel */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <form onSubmit={handleGenerateForecast} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Timestamp Variable</label>
              <select
                value={dateCol}
                onChange={(e) => setDateCol(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {activeDataset.column_names.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Numeric Metric</label>
              <select
                value={targetCol}
                onChange={(e) => setTargetCol(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {numericCols.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Forecast Horizon</label>
              <select
                value={periods}
                onChange={(e) => setPeriods(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value={7}>7 Periods (1 Week)</option>
                <option value={14}>14 Periods (2 Weeks)</option>
                <option value={30}>30 Periods (1 Month)</option>
                <option value={90}>90 Periods (Quarterly)</option>
                <option value={180}>180 Periods (Half-Year)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !dateCol || !targetCol}
                className="w-full py-2.5 px-4 btn-ai-primary disabled:opacity-40 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? "Modeling..." : "Generate Forecast"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading && (
        <LoadingSpinner message="Calculating Trend Decomposition & Seasonality..." subMessage="Fitting Holt-Winters & expanding confidence bounds" />
      )}

      {/* Forecast Chart & Callouts */}
      {forecastResult && (
        <div className="space-y-6">
          <div className="glass-card-glow p-6 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400">Projected Trajectory</span>
                <h3 className="text-base font-bold text-white mt-0.5">{forecastResult.trend_summary}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-[#07090E] border border-white/[0.08] text-xs">
                  <span className="text-slate-400">Growth Rate: </span>
                  <span className={`font-bold font-mono ${forecastResult.metrics.projected_growth_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {forecastResult.metrics.projected_growth_pct > 0 ? '+' : ''}{forecastResult.metrics.projected_growth_pct}%
                  </span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-[#07090E] border border-white/[0.08] text-xs">
                  <span className="text-slate-400">RMSE: </span>
                  <span className="font-bold text-white font-mono">{forecastResult.metrics.rmse.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Historical Observations vs {periods}-Day Forward Projection
                </h3>
                <p className="text-[11px] text-slate-400">Includes 95% expanding confidence bounds</p>
              </div>
            </div>

            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedChartData}>
                  <defs>
                    <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0D111A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="actual" name="Historical Actual" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="trend" name="Underlying Trend" stroke="#64748B" strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="forecast" name="Projected Forecast" stroke="#EC4899" strokeWidth={3} dot={{ r: 4 }} />
                  <Area type="monotone" dataKey="upper" name="Upper 95% Bound" stroke="#A855F7" fill="url(#forecastArea)" strokeDasharray="2 2" />
                  <Area type="monotone" dataKey="lower" name="Lower 95% Bound" stroke="#A855F7" fill="url(#forecastArea)" strokeDasharray="2 2" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Automated Time-Series Insights
            </h3>
            <div className="space-y-2">
              {forecastResult.ai_insights.map((insight, i) => (
                <p key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
