import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit, TrendingUp, DollarSign, Coins, Users, Zap,
  Activity, ArrowUpRight, ArrowDownRight, UploadCloud, Database,
  Wand2, Sparkles, MessageSquareCode, FileText, Globe, Calendar,
  ChevronRight, RefreshCw, BarChart3, PieChart as PieIcon, ShieldCheck
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { visApi, analyticsApi } from '../services/api';
import type { DashboardOverviewResponse, KPICardData } from '../types';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { activeDataset, datasets, profile, loadSampleDataset } = useDataset();
  const navigate = useNavigate();

  const [overviewData, setOverviewData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('All Time');

  useEffect(() => {
    loadOverview();
  }, [activeDataset?.id]);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const data = await visApi.getOverview(activeDataset?.id);
      setOverviewData(data);
    } catch (e) {
      console.error("Failed to load overview data:", e);
    } finally {
      setLoading(false);
    }
  };

  const getKPIIcon = (iconName: string) => {
    switch (iconName) {
      case 'DollarSign': return <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'Coins': return <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Users': return <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Brain': return <BrainCircuit className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      default: return <Activity className="w-5 h-5 text-slate-500" />;
    }
  };

  const DONUT_COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-6 pb-12 animate-in-scale">
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              AI Intelligence Center
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Active: {activeDataset ? activeDataset.name : "Enterprise Sales Model"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Executive Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time business performance, machine learning predictions, and predictive forecasting.
          </p>
        </div>

        {/* Date Filter & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All Time" className="bg-white dark:bg-slate-900">All Time</option>
              <option value="Last 30 Days" className="bg-white dark:bg-slate-900">Last 30 Days</option>
              <option value="Q1 2026" className="bg-white dark:bg-slate-900">Q1 2026</option>
              <option value="Year-to-Date" className="bg-white dark:bg-slate-900">Year-to-Date</option>
            </select>
          </div>

          <button
            onClick={() => loadSampleDataset('sales_data')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-all"
            title="Reload realistic 500+ record sample dataset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Demo Data</span>
          </button>

          <Link
            to="/upload"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Dataset</span>
          </Link>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {overviewData?.kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all hover:border-indigo-300 dark:hover:border-indigo-800 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {kpi.title}
              </span>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 transition-colors">
                {getKPIIcon(kpi.icon)}
              </div>
            </div>

            <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
              {kpi.value}
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />
                {kpi.change_pct}%
              </span>
              <span className="text-slate-400 truncate">
                {kpi.trend_description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts - Row 1: Sales Trend & Revenue vs Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Sales Trend (Line Chart) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Sales Trend & Order Momentum
              </h3>
              <p className="text-[11px] text-slate-400">Monthly gross sales volume with order indicators</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Line Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overviewData?.sales_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Sales']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Revenue vs Cost Analysis (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Revenue & Cost Structure
              </h3>
              <p className="text-[11px] text-slate-400">Monthly revenue compared against operational expenditures</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              Bar Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData?.revenue_analysis || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`]}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Cost" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Charts - Row 2: Profit Trend & Target vs Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart C: Profit Trend (Area Chart) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Net Profit Trajectory & Margin
              </h3>
              <p className="text-[11px] text-slate-400">Monthly profit accumulation with margin percentage</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              Area Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overviewData?.profit_trend || []}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Net Profit']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart D: Target vs Actual (Grouped Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Target vs. Actual Sales Performance
              </h3>
              <p className="text-[11px] text-slate-400">Quarterly and monthly quota achievement rates</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              Grouped Bar
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData?.target_vs_actual || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`]}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="actual" name="Actual Sales" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target Quota" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Charts - Row 3: Customer Donut & Product Horizontal Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart E: Customer Distribution (Donut Chart) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Customer Segments
              </h3>
              <p className="text-[11px] text-slate-400">Distribution across business tiers</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Donut
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overviewData?.customer_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {(overviewData?.customer_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [`${val} (${item.payload.percentage}%)`, item.payload.segment]}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {(overviewData?.customer_distribution || []).map((seg, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{seg.segment}</span>
                <span className="font-bold ml-auto">{seg.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart F: Top Product Performance (Horizontal Bar Chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Top Product Performance Leaderboard
              </h3>
              <p className="text-[11px] text-slate-400">Leading product categories and revenue generation</p>
            </div>
            <Link to="/visualization" className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              View All Charts →
            </Link>
          </div>

          <div className="space-y-3">
            {overviewData?.product_performance.map((prod, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">{prod.product}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-normal">{prod.share}% share</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{prod.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, prod.share * 2.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Charts - Row 4: Regional Performance (Geo/Map) & Monthly Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart G: Regional Performance (Map & Geo Visualization) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Regional & Geographical Sales Distribution
                </h3>
                <p className="text-[11px] text-slate-400">Territory performance and expansion growth</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              Geo Map
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {overviewData?.regional_performance.map((reg, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{reg.region}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                    +{reg.growth}%
                  </span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  ₹{reg.sales.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {reg.share}% of aggregate global sales
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart H: Monthly Growth Trajectory (Line Chart) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Compounded Monthly Growth Acceleration
              </h3>
              <p className="text-[11px] text-slate-400">MoM growth rate progression across fiscal year</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              MoM %
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overviewData?.monthly_growth || []}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Growth Rate']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="growth_rate" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#growthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Intelligence Launchpad */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-1">
            <BrainCircuit className="w-3.5 h-3.5" /> Conversational AI Assistant
          </div>
          <h3 className="text-lg font-bold">Have Questions About This Dataset?</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Ask natural language questions like <em>"Which region has highest profit?"</em>, <em>"Forecast next 90 days sales"</em>, or <em>"Detect transaction anomalies"</em> using AI Data Chat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/chat"
            className="px-5 py-2.5 rounded-2xl bg-white text-indigo-950 font-bold text-xs hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2 hover:scale-105"
          >
            <MessageSquareCode className="w-4 h-4 text-indigo-600" />
            <span>Launch AI Data Chat</span>
          </Link>
          <Link
            to="/reports"
            className="px-5 py-2.5 rounded-2xl bg-indigo-600/60 border border-indigo-400/40 text-white font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Executive PDF Report</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
