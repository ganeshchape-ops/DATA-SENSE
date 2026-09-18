import React, { useState, useEffect } from 'react';
import {
  BarChart3, LineChart as LineIcon, PieChart as PieIcon,
  Sparkles, Download, Layers, Activity, RefreshCw, Sliders
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { visApi } from '../services/api';
import type { RecommendedChart } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  AreaChart, Area, PieChart, Pie, Cell, ScatterChart,
  Scatter, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

export const VisualizationPage: React.FC = () => {
  const { activeDataset, profile } = useDataset();

  const [recommendations, setRecommendations] = useState<RecommendedChart[]>([]);
  const [chartType, setChartType] = useState<string>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [aggregation, setAggregation] = useState<string>('sum');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(false);

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#06B6D4', '#E11D48'];

  useEffect(() => {
    if (activeDataset) {
      loadRecommendations();
      if (activeDataset.column_names.length > 0) {
        setXAxis(activeDataset.column_names[0]);
        if (activeDataset.column_names.length > 1) {
          setYAxis(activeDataset.column_names[1]);
        }
      }
    }
  }, [activeDataset?.id]);

  useEffect(() => {
    if (activeDataset && xAxis) {
      renderChartData(chartType, xAxis, yAxis, aggregation);
    }
  }, [activeDataset?.id, chartType, xAxis, yAxis, aggregation]);

  const loadRecommendations = async () => {
    if (!activeDataset) return;
    setRecLoading(true);
    try {
      const recs = await visApi.getRecommendations(activeDataset.id);
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setRecLoading(false);
    }
  };

  const renderChartData = async (type: string, x: string, y?: string, agg?: string) => {
    if (!activeDataset || !x) return;
    setLoading(true);
    try {
      const res = await visApi.queryChart(activeDataset.id, {
        chart_type: type,
        x_axis: x,
        y_axis: y || undefined,
        aggregation: agg || 'sum',
      });
      setChartData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendation = (rec: RecommendedChart) => {
    setChartType(rec.chart_type);
    setXAxis(rec.x_axis);
    if (rec.y_axis) setYAxis(rec.y_axis);
  };

  if (!activeDataset) {
    return <EmptyState title="No Dataset Selected" description="Please select a dataset to visualize charts and dynamic distributions." />;
  }

  const columns = activeDataset.column_names || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Interactive Visualization Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Auto-recommended charts and custom high-dimensional visualization builder for <span className="text-white font-semibold">{activeDataset.name}</span>
          </p>
        </div>
      </div>

      {/* Auto-Recommended Chart Gallery */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Auto-Recommended Charts for this Dataset
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((rec, i) => (
              <button
                key={i}
                onClick={() => applyRecommendation(rec)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  chartType === rec.chart_type && xAxis === rec.x_axis && (yAxis === rec.y_axis || !rec.y_axis)
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-indigo-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                    {rec.chart_type}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">{Math.round(rec.score * 100)}% Match</span>
                </div>
                <h3 className="text-xs font-bold text-white mb-1 truncate">{rec.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">{rec.reason}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Chart Builder Controls */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-indigo-400" />
          Chart Configuration Controls
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="pie">Pie / Doughnut Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="histogram">Histogram Distribution</option>
              <option value="boxplot">Box Plot (Quartile Spread)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">X-Axis Feature</label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {chartType !== 'histogram' && chartType !== 'pie' && (
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Y-Axis Feature</label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Count Frequency</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          )}

          {chartType !== 'scatter' && chartType !== 'histogram' && chartType !== 'boxplot' && yAxis && (
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Aggregation Function</label>
              <select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="sum">Sum (Total)</option>
                <option value="avg">Average (Mean)</option>
                <option value="median">Median (50th Percentile)</option>
                <option value="count">Count Frequency</option>
                <option value="min">Minimum Value</option>
                <option value="max">Maximum Value</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Rendering Container */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-white">
              {yAxis ? `${yAxis} (${aggregation.toUpperCase()}) by ${xAxis}` : `${xAxis} Distribution`}
            </h3>
            <p className="text-[11px] text-slate-400">Interactive live responsive Recharts visualization</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Querying & Rendering Chart..." />
        ) : chartData.length > 0 ? (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="value" stroke="#6366F1" fillOpacity={1} fill="url(#areaGrad)" />
                </AreaChart>
              ) : chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              ) : chartType === 'scatter' ? (
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="x" name={xAxis} stroke="#64748B" fontSize={11} />
                  <YAxis dataKey="y" name={yAxis} stroke="#64748B" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Scatter name="Data Points" data={chartData} fill="#8B5CF6" />
                </ScatterChart>
              ) : chartType === 'histogram' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="bin" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#EC4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">
            No chart data available for the chosen configuration. Select different X and Y axes.
          </div>
        )}
      </div>
    </div>
  );
};
