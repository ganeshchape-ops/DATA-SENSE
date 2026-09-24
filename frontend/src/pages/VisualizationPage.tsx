import React, { useState, useMemo } from 'react';
import {
  BarChart3, LineChart as LineIcon, PieChart as PieIcon,
  Sparkles, Download, Layers, Activity, Sliders, Database,
  TrendingUp, Grid, CheckCircle2
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  AreaChart, Area, PieChart, Pie, Cell, ScatterChart,
  Scatter, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

export const VisualizationPage: React.FC = () => {
  const { activeDataset, filteredRows, rawRows, profile, correlations } = useDataset();

  const [chartType, setChartType] = useState<string>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [aggregation, setAggregation] = useState<string>('sum');

  const COLORS = ['#6366F1', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#64748B'];

  const columns = activeDataset?.column_names || [];
  const numColumns = profile?.numeric_stats.map(s => s.name) || [];
  const catColumns = profile?.categorical_stats.map(s => s.name) || [];

  // Default selection
  React.useEffect(() => {
    if (columns.length > 0 && !xAxis) {
      if (catColumns.length > 0) setXAxis(catColumns[0]);
      else setXAxis(columns[0]);

      if (numColumns.length > 0) setYAxis(numColumns[0]);
    }
  }, [columns.length, catColumns.length, numColumns.length]);

  // Dynamic Chart Data Calculation purely from current filtered rows
  const computedChartData = useMemo(() => {
    if (!filteredRows.length || !xAxis) return [];

    // 1. Histogram
    if (chartType === 'histogram') {
      const vals = filteredRows.map(r => Number(r[xAxis])).filter(v => !isNaN(v));
      if (!vals.length) return [];
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const binCount = Math.min(8, Math.max(4, Math.floor(Math.sqrt(vals.length))));
      const binWidth = (max - min) / binCount || 1;
      const bins: { name: string; count: number }[] = [];

      for (let i = 0; i < binCount; i++) {
        const start = min + i * binWidth;
        const end = start + binWidth;
        const count = vals.filter(v => (i === binCount - 1 ? v >= start && v <= end : v >= start && v < end)).length;
        bins.push({
          name: `${Math.round(start * 10) / 10} - ${Math.round(end * 10) / 10}`,
          count
        });
      }
      return bins;
    }

    // 2. Scatter Plot
    if (chartType === 'scatter') {
      if (!yAxis) return [];
      return filteredRows.slice(0, 100).map((r, i) => ({
        x: Number(r[xAxis]) || 0,
        y: Number(r[yAxis]) || 0,
        name: `Observation #${i + 1}`
      }));
    }

    // 3. Box Plot (Five-number summary)
    if (chartType === 'boxplot') {
      const numColsToPlot = numColumns.slice(0, 6);
      return numColsToPlot.map(col => {
        const vals = filteredRows.map(r => Number(r[col])).filter(v => !isNaN(v)).sort((a, b) => a - b);
        if (!vals.length) return { name: col, min: 0, q1: 0, median: 0, q3: 0, max: 0 };
        const min = vals[0];
        const max = vals[vals.length - 1];
        const q1 = vals[Math.floor(vals.length * 0.25)];
        const median = vals[Math.floor(vals.length * 0.5)];
        const q3 = vals[Math.floor(vals.length * 0.75)];
        return {
          name: col,
          min: Math.round(min * 10) / 10,
          q1: Math.round(q1 * 10) / 10,
          median: Math.round(median * 10) / 10,
          q3: Math.round(q3 * 10) / 10,
          max: Math.round(max * 10) / 10
        };
      });
    }

    // 4. Aggregated Groupings (Bar, Line, Area, Pie)
    const groups: Record<string, number[]> = {};
    filteredRows.forEach(r => {
      const key = String(r[xAxis] !== null && r[xAxis] !== undefined ? r[xAxis] : '(Missing)');
      if (!groups[key]) groups[key] = [];
      if (yAxis) {
        const val = Number(r[yAxis]);
        if (!isNaN(val)) groups[key].push(val);
      } else {
        groups[key].push(1);
      }
    });

    const entries = Object.entries(groups).map(([cat, vals]) => {
      let result = 0;
      if (!yAxis || aggregation === 'count') {
        result = vals.length;
      } else if (aggregation === 'sum') {
        result = vals.reduce((a, b) => a + b, 0);
      } else if (aggregation === 'avg') {
        result = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      } else if (aggregation === 'min') {
        result = vals.length ? Math.min(...vals) : 0;
      } else if (aggregation === 'max') {
        result = vals.length ? Math.max(...vals) : 0;
      } else if (aggregation === 'median') {
        const sorted = [...vals].sort((a, b) => a - b);
        result = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
      }
      return {
        name: cat,
        value: Math.round(result * 100) / 100
      };
    });

    return entries.slice(0, 20);
  }, [filteredRows, chartType, xAxis, yAxis, aggregation, numColumns]);

  if (!activeDataset) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-xs max-w-xl mx-auto my-12 space-y-4 animate-in-scale">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <BarChart3 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Dataset Uploaded</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Upload a dataset to generate dynamic visualizations, custom aggregations, and correlation matrices.
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
            <BarChart3 className="w-4 h-4" /> Dynamic Visual Intelligence Studio
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Visualizations & Distribution Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Plotting verified observations for <strong className="text-slate-800">{activeDataset.name}</strong> • ({filteredRows.length.toLocaleString()} active rows)
          </p>
        </div>
      </div>

      {/* Interactive Custom Chart Builder */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-indigo-600" />
          Interactive Chart Builder
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Trend Chart</option>
              <option value="area">Area Chart</option>
              <option value="pie">Pie / Donut Chart</option>
              <option value="histogram">Histogram (Distribution)</option>
              <option value="scatter">Scatter Plot</option>
              <option value="boxplot">Box Plot (Quartiles Summary)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {chartType === 'boxplot' ? 'Attributes (Auto-Mapped)' : 'X-Axis / Category'}
            </label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              disabled={chartType === 'boxplot'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {chartType !== 'histogram' && chartType !== 'pie' && chartType !== 'boxplot' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Y-Axis Metric</label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Frequency Count</option>
                {numColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          )}

          {chartType !== 'scatter' && chartType !== 'histogram' && chartType !== 'boxplot' && yAxis && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Aggregation</label>
              <select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="sum">Sum (Total)</option>
                <option value="avg">Average (Mean)</option>
                <option value="median">Median (50th %)</option>
                <option value="min">Minimum</option>
                <option value="max">Maximum</option>
                <option value="count">Count Records</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {chartType === 'boxplot'
              ? 'Five-Number Summary (Box Plot Quartiles)'
              : yAxis
              ? `${yAxis} (${aggregation.toUpperCase()}) by ${xAxis}`
              : `${xAxis} Frequency Distribution`}
          </h3>
          <p className="text-[11px] text-slate-500">Rendered dynamically from active dataset slice</p>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={computedChartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={computedChartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#6366F1" fill="#EEF2FF" />
              </AreaChart>
            ) : chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={computedChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {computedChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : chartType === 'scatter' ? (
              <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="x" name={xAxis} stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="y" name={yAxis} stroke="#94A3B8" fontSize={11} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Observations" data={computedChartData} fill="#6366F1" />
              </ScatterChart>
            ) : chartType === 'boxplot' ? (
              <BarChart data={computedChartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="q1" fill="#93C5FD" name="Q1 (25th %)" />
                <Bar dataKey="median" fill="#6366F1" name="Median (50th %)" />
                <Bar dataKey="q3" fill="#4F46E5" name="Q3 (75th %)" />
              </BarChart>
            ) : (
              <BarChart data={computedChartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Bar dataKey={chartType === 'histogram' ? 'count' : 'value'} fill="#6366F1" radius={[6, 6, 0, 0]}>
                  {computedChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Correlation Heatmap Matrix */}
      {correlations && correlations.columns.length >= 2 && (
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pearson Correlation Matrix (Heatmap)
            </h3>
            <p className="text-xs text-slate-500">
              Calculated pairwise linear covariance coefficients across continuous attributes
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-3 text-left font-bold">Feature</th>
                  {correlations.columns.map(c => (
                    <th key={c} className="p-3 font-bold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {correlations.columns.map((rowCol, i) => (
                  <tr key={rowCol} className="hover:bg-slate-50">
                    <td className="p-3 text-left font-sans font-bold text-slate-900 bg-slate-50">{rowCol}</td>
                    {correlations.columns.map((colCol, j) => {
                      const val = correlations.matrix[i]?.[j] ?? 0;
                      let bgClass = 'bg-slate-50 text-slate-700';
                      if (i === j) bgClass = 'bg-indigo-100 text-indigo-900 font-bold';
                      else if (val >= 0.7) bgClass = 'bg-emerald-100 text-emerald-900 font-bold';
                      else if (val >= 0.3) bgClass = 'bg-emerald-50 text-emerald-800';
                      else if (val <= -0.7) bgClass = 'bg-rose-100 text-rose-900 font-bold';
                      else if (val <= -0.3) bgClass = 'bg-rose-50 text-rose-800';

                      return (
                        <td key={colCol} className={`p-3 ${bgClass}`}>
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
