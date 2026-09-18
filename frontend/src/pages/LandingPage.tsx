import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit, Sparkles, Database, BarChart3, Cpu, TrendingUp,
  FileText, ShieldCheck, ArrowRight, CheckCircle2, Zap,
  Layers, MessageSquareCode, Activity, Lock, Users, Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataset } from '../context/DatasetContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const { loadSampleDataset } = useDataset();
  const navigate = useNavigate();

  const handleQuickDemo = async () => {
    await demoLogin();
    await loadSampleDataset('sales_data');
    navigate('/dashboard');
  };

  const features = [
    {
      icon: BrainCircuit,
      title: "AI Dataset Intelligence & SWOT",
      description: "Automated executive summaries, key driver discovery, risk alerts, and strategic SWOT analysis generated in seconds.",
      color: "from-indigo-600 to-violet-600"
    },
    {
      icon: MessageSquareCode,
      title: "Conversational AI Data Chat",
      description: "Ask natural language questions on your dataset like 'Which product has highest profit?' and get verified numerical answers.",
      color: "from-cyan-600 to-blue-600"
    },
    {
      icon: Cpu,
      title: "AutoML Studio & Live Simulator",
      description: "Train Regression, Decision Tree, and Random Forest models with real-time interactive parameter inference sliders.",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: TrendingUp,
      title: "Predictive Time-Series Forecasting",
      description: "Forecast multi-horizon trends (7 to 90 days, 6-12 months) with 95% expanding confidence bounds and seasonality modeling.",
      color: "from-emerald-600 to-teal-600"
    },
    {
      icon: Activity,
      title: "Multi-Model Anomaly Detection",
      description: "Isolation Forest and Z-Score outlier engines calculate record risk scores and plot 2D PCA distribution scatters.",
      color: "from-rose-600 to-red-600"
    },
    {
      icon: FileText,
      title: "Executive PDF & Multi-Sheet Excel",
      description: "One-click generation of publication-ready ReportLab executive PDF reports and formatted OpenPyXL workbooks.",
      color: "from-amber-600 to-orange-600"
    }
  ];

  const workflowSteps = [
    { step: "01", title: "Upload / Load", desc: "Drag & drop CSV/Excel/JSON or pick from 5 enterprise sample datasets." },
    { step: "02", title: "Profile & Clean", desc: "Instant health scoring (0-100%), missing value imputation & outlier capping." },
    { step: "03", title: "Explore & Test", desc: "Spreadsheet tabular filters, hypothesis tests (T-test, ANOVA) & correlation matrix." },
    { step: "04", title: "AutoML & Forecast", desc: "Train top ML algorithms and project future trends with interactive simulator." },
    { step: "05", title: "Chat & Export", desc: "Query data via ChatGPT-style assistant and download publication-ready reports." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden select-none">
      {/* Navigation Header */}
      <header className="h-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg text-white tracking-tight flex items-center gap-2">
              AI Insight
              <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                SaaS Enterprise
              </span>
            </span>
            <span className="text-[10px] text-slate-400">AI-Native Predictive Analytics Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <button
                onClick={handleQuickDemo}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5 hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Instant Demo</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        {/* Glow Spheres */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/20 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI-Native Enterprise Intelligence & Predictive Analytics Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Turn Tabular Data into{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Automated AI Decisions
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload any CSV, XLSX, or JSON dataset to automatically execute data cleaning, statistical hypothesis testing, AutoML prediction leaderboards, forecasting, anomaly detection, and AI Data Chat queries.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleQuickDemo}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5 hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Live Demo Dashboard</span>
            </button>

            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-extrabold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Social Proof / Capability Metrics */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xl font-black text-white">550+</div>
              <div className="text-[11px] text-slate-400">Records Live Sample</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xl font-black text-emerald-400">92.4%</div>
              <div className="text-[11px] text-slate-400">Prediction Accuracy</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xl font-black text-cyan-400">12</div>
              <div className="text-[11px] text-slate-400">Core AI Engines</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xl font-black text-purple-400">1-Click</div>
              <div className="text-[11px] text-slate-400">PDF & Excel Reports</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
            Complete Enterprise Stack
          </h2>
          <h3 className="text-3xl font-black text-white tracking-tight">
            Everything Required for End-to-End Decision Intelligence
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white mb-5 shadow-lg shadow-indigo-500/20`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                    {f.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5-Step Workflow */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
            Seamless Application Journey
          </h2>
          <h3 className="text-3xl font-black text-white tracking-tight">
            From Raw Ingestion to Executive Action
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {workflowSteps.map((s, idx) => (
            <div key={idx} className="p-5 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-2">
              <span className="text-2xl font-black text-indigo-500/40">{s.step}</span>
              <h4 className="text-sm font-bold text-white">{s.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 lg:px-12 max-w-5xl mx-auto text-center border-t border-slate-900">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-indigo-900 via-violet-950 to-slate-900 border border-indigo-500/30 shadow-2xl space-y-6">
          <h3 className="text-2xl sm:text-4xl font-black text-white">
            Experience AI Insight in Action
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Test the live AutoML simulator, examine interactive correlation heatmaps, forecast time-series trends, and query the dataset with natural language.
          </p>
          <button
            onClick={handleQuickDemo}
            className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-indigo-950 font-black text-sm shadow-xl transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Open Demo Analytics Center</span>
          </button>
        </div>
      </section>
    </div>
  );
};
