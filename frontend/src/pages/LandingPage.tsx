import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Database, BarChart3, Cpu, TrendingUp,
  FileText, ArrowRight, CheckCircle2, Zap,
  Layers, MessageSquareCode, Activity, Play, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataset } from '../context/DatasetContext';
import { Logo } from '../components/common/Logo';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const { loadSampleDataset } = useDataset();
  const navigate = useNavigate();

  const handleQuickDemo = async () => {
    try {
      await demoLogin();
      await loadSampleDataset('student');
    } catch (err) {
      console.warn("Direct navigation to dashboard:", err);
    }
    navigate('/dashboard');
  };

  const capabilities = [
    {
      icon: Sparkles,
      title: "Universal Domain Intelligence",
      description: "Auto-detects Student, E-Commerce, HR, Banking, Finance, Healthcare, and Marketing datasets with adaptive metrics and charts.",
      tag: "8 Domains"
    },
    {
      icon: Cpu,
      title: "AutoML Studio & Live Simulator",
      description: "Train Regression & Classification algorithms with automated leaderboard ranking, feature weights, and real-time parameter simulation.",
      tag: "AutoML"
    },
    {
      icon: TrendingUp,
      title: "Time-Series Forecasting",
      description: "Project future trajectories with expanding 95% confidence intervals, seasonal decomposition, and trend momentum.",
      tag: "Predictive"
    },
    {
      icon: Activity,
      title: "Multi-Engine Outlier Detection",
      description: "Isolation Forest and Z-Score engines identify high-risk anomalies, compute record anomaly scores, and map 2D PCA distributions.",
      tag: "Anomalies"
    },
    {
      icon: MessageSquareCode,
      title: "Conversational AI Data Chat",
      description: "Ask natural language questions on your dataset and receive mathematically verified computations and interactive tables.",
      tag: "Natural Language"
    },
    {
      icon: FileText,
      title: "Domain-Adaptive Reports",
      description: "Export multi-page ReportLab executive PDFs and OpenPyXL Excel workbooks dynamically structured for your dataset domain.",
      tag: "PDF / Excel"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden select-none relative">
      {/* Minimal Premium Navbar */}
      <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 lg:px-16 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="group">
          <Logo size="lg" />
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="btn-ai-primary px-5 py-2 text-xs font-bold flex items-center gap-2"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <button
                onClick={handleQuickDemo}
                className="btn-ai-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Platform</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>✦ AI-Powered Data Intelligence</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Turn Any Dataset Into{' '}
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              Upload your data and explore insights, patterns and intelligence through a modern AI-powered workspace.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5">
              <button
                onClick={handleQuickDemo}
                className="w-full sm:w-auto px-7 py-3.5 btn-ai-primary text-xs font-extrabold flex items-center justify-center gap-2"
              >
                <span>Analyze Dataset →</span>
              </button>

              <button
                onClick={handleQuickDemo}
                className="w-full sm:w-auto px-7 py-3.5 btn-ai-secondary text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Explore Platform</span>
              </button>
            </div>

            {/* Mini Trust Badges */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-white/[0.06]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" /> 8 Dynamic Domains
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" /> Real-time AutoML
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" /> 1-Click Executive Reports
              </span>
            </div>
          </div>

          {/* Right Hero: Abstract AI Agent & Visualization Card */}
          <div className="lg:col-span-5 relative">
            {/* Glowing Backdrop Ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl blur-xl opacity-30 animate-pulse pointer-events-none" />

            <div className="relative glass-card p-6 space-y-5 rounded-3xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    ✦ AI Data Agent
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Live Engine</span>
              </div>

              {/* Dynamic Timeline Steps */}
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span className="text-slate-200">Dataset uploaded & validated</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span className="text-slate-200">Domain detected: <strong className="text-purple-300">Academic & Student</strong></span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span className="text-slate-200">Dynamic column topologies mapped</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] animate-pulse">◉</span>
                  <span className="text-purple-200 font-semibold">Generating intelligence & insights...</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] opacity-50">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">○</span>
                  <span className="text-slate-400">Preparing executive PDF & Excel</span>
                </div>
              </div>

              {/* Mini Sample Preview KPI */}
              <div className="p-3.5 rounded-2xl bg-[#07090E]/80 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Data Health Score</span>
                  <p className="text-lg font-black text-white font-mono">94.8%</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Automated Models</span>
                  <p className="text-lg font-black text-purple-400 font-mono">4 Benchmarks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
            ✦ Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            An Intelligent AI Agent for Every Dataset
          </h2>
          <p className="text-xs text-slate-400">
            From raw spreadsheet ingestion to automated ML prediction and board-ready reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                      {cap.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 lg:px-16 max-w-5xl mx-auto text-center border-t border-white/[0.06]">
        <div className="glass-card-glow p-10 sm:p-12 space-y-6 relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> AI DataSense Workspace
          </div>
          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Unlock Dataset Intelligence?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Experience automatic domain detection, AutoML model simulation, forecasting, and natural language analytics.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleQuickDemo}
              className="btn-ai-primary px-8 py-3.5 text-xs font-bold flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Live Intelligence Workspace</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
