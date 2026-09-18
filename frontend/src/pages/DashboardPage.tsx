import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database, Layers, BarChart3, Brain, Cpu, TrendingUp,
  AlertTriangle, FileText, Plus, ArrowRight, ShieldCheck,
  CheckCircle2, Sparkles, Filter, Trash2, Activity,
  Sliders, ArrowUpRight, ArrowDownRight, Eye, RefreshCw,
  Search, Zap, HardDrive, Compass
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import { analyticsApi, aiApi, mlApi } from '../services/api';

export const DashboardPage: React.FC = () => {
  const {
    activeDataset, profile, datasets, isProfileLoading,
    selectDatasetById, deleteDataset, loadSampleDataset
  } = useDataset();
  const navigate = useNavigate();

  const [activeChartTab, setActiveChartTab] = useState<'metrics' | 'missing' | 'spread'>('metrics');
  const [quickInsights, setQuickInsights] = useState<string[]>([]);
  const [topCorrelations, setTopCorrelations] = useState<any[]>([]);
  const [isLoadingExtras, setIsLoadingExtras] = useState(false);
  const [searchTableQuery, setSearchTableQuery] = useState('');

  useEffect(() => {
    if (activeDataset) {
      loadDashboardExtras(activeDataset.id);
    }
  }, [activeDataset?.id]);

  const loadDashboardExtras = async (datasetId: number) => {
    setIsLoadingExtras(true);
    try {
      // Load correlation preview
      const corr = await analyticsApi.getCorrelation(datasetId);
      if (corr && corr.top_positive_pairs) {
        setTopCorrelations([...corr.top_positive_pairs.slice(0, 3), ...(corr.top_negative_pairs || []).slice(0, 2)]);
      }
      // Load quick AI insights preview
      const ai = await aiApi.getInsights(datasetId);
      if (ai && ai.key_findings) {
        setQuickInsights(ai.key_findings.slice(0, 3).map(f => f.summary));
      }
    } catch (e) {
      // Fallback silently if not yet computed
    } finally {
      setIsLoadingExtras(false);
    }
  };

  if (!activeDataset && datasets.length === 0) {
    return (
      <EmptyState
        title="Welcome to AI DataSense"
        description="To begin exploring, upload your CSV or Excel dataset or launch one of our 5 preloaded sample datasets below."
        actionText="Upload Dataset"
        actionLink="/dashboard/upload"
      />
    );
  }

  if (isProfileLoading) {
    return <LoadingSpinner message="Synthesizing dataset profile, statistical moments & metrics..." />;
  }

  const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6'];

  // Distribution chart data
  const colTypeData = profile ? [
    { name: 'Numeric', value: profile.numeric_columns_count, color: '#6366F1' },
    { name: 'Categorical', value: profile.categorical_columns_count, color: '#10B981' },
    { name: 'Datetime', value: profile.datetime_columns_count, color: '#F59E0B' },
  ].filter(d => d.value > 0) : [];

  // Missing values preview data
  const missingData = profile ? Object.entries(profile.missing_per_column)
    .filter(([_, cnt]) => cnt > 0)
    .map(([col, cnt]) => ({ name: col, missing: cnt }))
    .slice(0, 6) : [];

  // Numeric spread preview data
  const numericSpreadData = profile?.numeric_stats ? profile.numeric_stats.slice(0, 6).map(s => ({
    name: s.name.length > 12 ? s.name.substring(0, 10) + '..' : s.name,
    mean: s.mean || 0,
    median: s.median || 0,
    std: s.std || 0,
  })) : [];

  const sampleShortcuts = [
    { key: "ecommerce", label: "E-Commerce", icon: "🛒" },
    { key: "churn", label: "Customer Churn", icon: "👥" },
    { key: "housing", label: "Real Estate", icon: "🏠" },
    { key: "heart", label: "Heart Health", icon: "❤️" },
    { key: "traffic", label: "Web Traffic", icon: "📈" },
  ];

  const quickLaunchpads = [
    { title: "Data Profiler", desc: "Detailed column schema, quartiles & health", icon: Database, link: "/dashboard/profile", color: "from-blue-600 to-cyan-600", tag: "Analytics" },
    { title: "Cleaning Lab", desc: "Impute missing values, drop duplicates & outliers", icon: Filter, link: "/dashboard/cleaning", color: "from-emerald-600 to-teal-600", tag: "Data Ops" },
    { title: "Smart Visuals", desc: "Auto-recommended interactive multi-axis charts", icon: BarChart3, link: "/dashboard/visualize", color: "from-amber-600 to-orange-600", tag: "BI Studio" },
    { title: "AI Insights", desc: "Executive synthesis, risk alerts & SWOT matrix", icon: Brain, link: "/dashboard/ai-insights", color: "from-indigo-600 to-purple-600", tag: "AI Engine" },
    { title: "AutoML Studio", desc: "Train regression/classifiers & live simulator", icon: Cpu, link: "/dashboard/ml-studio", color: "from-rose-600 to-pink-600", tag: "AutoML" },
    { title: "Forecasting", desc: "Project future time-series trends with CI bounds", icon: TrendingUp, link: "/dashboard/forecasting", color: "from-violet-600 to-indigo-600", tag: "Projections" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Command Center Header */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Live Analytics Feed
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Engine Ready
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Format: <span className="uppercase text-slate-200 font-semibold">{activeDataset?.file_type}</span>
              </span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight">
              {activeDataset?.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Synthesized <span className="font-semibold text-white">{activeDataset?.rows.toLocaleString()} records</span> across{' '}
              <span className="font-semibold text-white">{activeDataset?.columns} feature dimensions</span>. Health Score:{' '}
              <span className="font-bold text-emerald-400">{profile?.data_quality_score}%</span>.
            </p>

            {/* Quick 1-Click Sample Switchers */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Switch Dataset:</span>
              {sampleShortcuts.map((s) => (
                <button
                  key={s.key}
                  onClick={() => loadSampleDataset(s.key)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/60 hover:border-indigo-500/40 text-slate-300 hover:text-white text-[11px] font-medium transition-all flex items-center gap-1.5"
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/dashboard/ai-insights"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02]"
            >
              <Brain className="w-4 h-4" />
              Generate AI Insights
            </Link>
            <Link
              to="/dashboard/ml-studio"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all hover:scale-[1.02]"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              AutoML Studio
            </Link>
            <Link
              to="/dashboard/reports"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all hover:scale-[1.02]"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              Export PDF
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Key KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Volume"
          value={activeDataset?.rows.toLocaleString() || "0"}
          subtitle="Processed rows"
          icon={Layers}
          color="indigo"
          trend="+100% Ingested"
          trendType="positive"
        />
        <StatCard
          title="Features"
          value={activeDataset?.columns || "0"}
          subtitle={`${profile?.numeric_columns_count || 0} Num • ${profile?.categorical_columns_count || 0} Cat`}
          icon={Database}
          color="blue"
          trend="Schema mapped"
          trendType="neutral"
        />
        <StatCard
          title="Health Score"
          value={profile ? `${profile.data_quality_score}%` : "-"}
          subtitle="Integrity rating"
          icon={ShieldCheck}
          color="emerald"
          trend={(profile?.data_quality_score || 0) >= 90 ? "Excellent" : "Needs cleaning"}
          trendType={(profile?.data_quality_score || 0) >= 90 ? "positive" : "negative"}
        />
        <StatCard
          title="Missing Cells"
          value={profile?.total_missing_cells.toLocaleString() || "0"}
          subtitle={`${profile?.missing_cells_pct || 0}% missing`}
          icon={AlertTriangle}
          color="amber"
          trend={profile?.total_missing_cells === 0 ? "Zero Missing" : "Imputation needed"}
          trendType={profile?.total_missing_cells === 0 ? "positive" : "negative"}
        />
        <StatCard
          title="Duplicate Rows"
          value={profile?.duplicate_rows_count || "0"}
          subtitle={`${profile?.duplicate_rows_pct || 0}% redundancy`}
          icon={Filter}
          color="rose"
          trend={profile?.duplicate_rows_count === 0 ? "Clean Index" : "Deduplicate"}
          trendType={profile?.duplicate_rows_count === 0 ? "positive" : "neutral"}
        />
        <StatCard
          title="Memory Footprint"
          value={profile ? `${profile.memory_usage_kb.toFixed(1)} KB` : "0 KB"}
          subtitle="Optimized in RAM"
          icon={HardDrive}
          color="purple"
          trend="In-Memory Cache"
          trendType="neutral"
        />
      </div>

      {/* Main Visuals & Analytics Studio Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Multi-Metric Chart Studio */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Dataset Statistical Dynamics
                </h3>
                <p className="text-[11px] text-slate-400">
                  Exploratory analysis of numerical distributions and missingness profiles
                </p>
              </div>

              {/* Chart Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setActiveChartTab('metrics')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeChartTab === 'metrics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Feature Spread
                </button>
                <button
                  onClick={() => setActiveChartTab('missing')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeChartTab === 'missing' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Missing Density
                </button>
              </div>
            </div>

            {/* Dynamic Charts */}
            <div className="h-64 mt-2">
              {activeChartTab === 'metrics' && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={numericSpreadData}>
                    <defs>
                      <linearGradient id="colorMean" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="mean" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorMean)" name="Mean Value" />
                    <Area type="monotone" dataKey="median" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorMedian)" name="Median" />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {activeChartTab === 'missing' && (
                missingData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={missingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }} />
                      <Bar dataKey="missing" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Missing Cells Count" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                    <h4 className="text-xs font-bold text-white">Flawless Data Integrity</h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      Zero missing values detected across all columns. Your dataset is clean and ready for AutoML.
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Aggregated across {profile?.numeric_columns_count} numerical features</span>
            <Link to="/dashboard/visualize" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              Open Full Visualization Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Schema Composition & Donut Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Data Type Breakdown
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                {profile?.columns} Dimensions
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Categorical vs. Numeric feature split
            </p>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={colTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {colTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Visual breakdown list */}
            <div className="space-y-2 mt-2">
              {colTypeData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium">{item.name} Columns</span>
                  </div>
                  <span className="font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/dashboard/profile"
            className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold text-center border border-slate-700 transition-colors block"
          >
            Inspect Full Schema & Stats
          </Link>
        </div>
      </div>

      {/* 3 Modules Row: AI Highlights, Correlation Top Pairs, AutoML Leaderboard Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: AI Strategic Insights Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-900/90 border border-indigo-500/20 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  AI Strategic Synthesis
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Automated
              </span>
            </div>

            <div className="space-y-2.5 mt-3">
              {quickInsights.length > 0 ? (
                quickInsights.map((text, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{text}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 text-center">
                  Click below to generate comprehensive AI executive summary, trends & SWOT analysis.
                </div>
              )}
            </div>
          </div>

          <Link
            to="/dashboard/ai-insights"
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all"
          >
            <span>Read Full AI SWOT & Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 2: Correlation Matrix Top Synergy */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/30 to-slate-900/90 border border-purple-500/20 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Feature Correlation Synergy
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Pearson r
              </span>
            </div>

            <div className="space-y-2 mt-3">
              {topCorrelations.length > 0 ? (
                topCorrelations.map((pair, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[140px]">
                      {pair.col1} ↔ {pair.col2}
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      pair.correlation > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {pair.correlation > 0 ? `+${pair.correlation}` : pair.correlation}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 text-center">
                  Analyzing numerical feature pairs...
                </div>
              )}
            </div>
          </div>

          <Link
            to="/dashboard/correlation"
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-purple-200 text-xs font-bold border border-purple-500/30 transition-all"
          >
            <span>Open Correlation Heatmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 3: AutoML & Predictive Intelligence */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/30 to-slate-900/90 border border-rose-500/20 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  AutoML & Inference Hub
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Multi-Model
              </span>
            </div>

            <div className="space-y-2 mt-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span>Supported Tasks</span>
                  <span className="text-emerald-400 font-bold">Auto-Detected</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">Regression</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-semibold">Classification</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold">K-Means Clustering</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-slate-300 text-[11px] leading-relaxed">
                Train multiple algorithms (Linear/Logistic, Decision Trees, Random Forests, Gradient Boosting) with 1-click live inference simulator.
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/ml-studio"
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-all"
          >
            <span>Launch AutoML Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Launchpad Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Analytics & Data Science Modules
          </h2>
          <span className="text-[11px] text-slate-500">6 Enterprise Engines</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {quickLaunchpads.map((lp, idx) => {
            const Icon = lp.icon;
            return (
              <Link
                key={idx}
                to={lp.link}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-850 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${lp.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {lp.title}
                      </h3>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {lp.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{lp.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Loaded Datasets Management Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Your Loaded Datasets ({datasets.length})
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Switch active dataset or manage stored files</p>
          </div>
          <Link
            to="/dashboard/upload"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Upload New Dataset
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-3 font-semibold">Dataset Name</th>
                <th className="pb-3 font-semibold">Rows</th>
                <th className="pb-3 font-semibold">Columns</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Uploaded</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {datasets.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 font-semibold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/15 text-indigo-400 flex items-center justify-center shrink-0">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate max-w-[220px]">{d.name}</span>
                    {activeDataset?.id === d.id && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-slate-300 font-medium">{d.rows.toLocaleString()}</td>
                  <td className="py-3.5 text-slate-300 font-medium">{d.columns}</td>
                  <td className="py-3.5 text-slate-400 uppercase font-mono">{d.file_type}</td>
                  <td className="py-3.5 text-slate-400">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="py-3.5 text-right space-x-2">
                    {activeDataset?.id !== d.id && (
                      <button
                        onClick={() => selectDatasetById(d.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[11px] font-semibold transition-colors"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => deleteDataset(d.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete dataset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
