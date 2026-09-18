import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain, Sparkles, Database, BarChart3, Cpu, TrendingUp,
  FileText, ShieldCheck, ArrowRight, CheckCircle2, Zap,
  Layers, LineChart, PieChart, Activity, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataset } from '../context/DatasetContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const { loadSampleDataset } = useDataset();
  const navigate = useNavigate();

  const handleQuickDemo = async () => {
    await demoLogin();
    await loadSampleDataset('ecommerce');
    navigate('/dashboard');
  };

  const features = [
    {
      icon: Brain,
      title: "AI Dataset Intelligence",
      description: "Generates natural language dataset summaries, key findings, hidden patterns, growth trends, and strategic SWOT recommendations automatically.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Database,
      title: "Automated Data Profiling",
      description: "Instant data health scoring, type inference, missing value mapping, duplicate detection, and high-precision descriptive statistics (IQR, skewness, kurtosis).",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Layers,
      title: "Interactive Data Cleaning",
      description: "Perform mean/median/mode imputation, IQR & Z-score outlier treatment, and duplicate removal with real-time before & after transformation diff previews.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: BarChart3,
      title: "Smart Visualizations",
      description: "Auto-recommends optimal charts tailored to your data types. Build Bar, Line, Area, Scatter, Pie, Box Plot, and Histogram charts with instant aggregation.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Cpu,
      title: "AutoML & Live Prediction",
      description: "Automatically detects problem topology and trains Decision Trees, Random Forests, and Gradient Boosting models with an interactive real-time prediction simulator.",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Time-Series Forecasting",
      description: "Chronological trend decomposition and future projection for 7 to 180 days ahead with 95% expanding confidence bounds and growth rate calculations.",
      color: "from-violet-500 to-indigo-500"
    },
    {
      icon: Activity,
      title: "Anomaly Detection",
      description: "Multivariate Isolation Forest & Z-Score anomaly detectors pinpoint outlier records and explain specific feature contributors for risk mitigation.",
      color: "from-red-500 to-rose-500"
    },
    {
      icon: FileText,
      title: "Executive PDF & Excel Reports",
      description: "1-Click download of publication-grade multi-page executive PDF reports and multi-tab formatted Excel workbooks with rich statistical charts.",
      color: "from-sky-500 to-blue-500"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Upload Your Dataset",
      desc: "Drag & drop CSV or Excel files, or pick from 5 curated industry sample datasets."
    },
    {
      step: "02",
      title: "Automated Profiling",
      desc: "AI DataSense parses columns, calculates quality score, and detects data anomalies."
    },
    {
      step: "03",
      title: "Clean & Explore",
      desc: "Impute missing values, remove duplicates, filter multi-condition expressions."
    },
    {
      step: "04",
      title: "AutoML & Forecast",
      desc: "Train top machine learning algorithms and project future trends with 1 click."
    },
    {
      step: "05",
      title: "Executive Reports",
      desc: "Download comprehensive PDF summaries and formatted multi-sheet Excel workbooks."
    }
  ];

  const techStack = [
    "Python 3.14", "FastAPI", "Pandas", "Scikit-Learn", "SciPy", "ReportLab", "OpenPyXL",
    "React 19", "TypeScript", "Vite", "Tailwind CSS", "Recharts", "SQLAlchemy", "PostgreSQL / SQLite"
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>AI-Powered Automated Data Intelligence & Prediction</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Turn Your Data Into <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Intelligent Decisions
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your Excel or CSV dataset and let AI automatically clean, profile, visualize, predict, forecast, and generate executive reports in seconds with zero technical friction.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleQuickDemo}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all hover:scale-105 shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Explore Live Demo (1-Click)
                </button>
              </>
            )}
          </div>

          {/* Key Value Props */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Real Machine Learning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Automatic Problem Type Detection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multi-Format PDF & Excel Reports</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive UI Preview Card */}
        <div className="max-w-5xl mx-auto mt-14 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/80 p-4 sm:p-6 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              <span className="text-xs font-mono text-slate-400 ml-2">AI DataSense — E-Commerce Executive Overview</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Engine Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Records</span>
              <p className="text-lg font-bold text-white">500 Rows</p>
              <span className="text-[10px] text-emerald-400">15 Features</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Data Health</span>
              <p className="text-lg font-bold text-emerald-400">96.8 / 100</p>
              <span className="text-[10px] text-slate-400">High Reliability</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Best ML Model</span>
              <p className="text-lg font-bold text-indigo-400">Random Forest</p>
              <span className="text-[10px] text-indigo-300">R² = 0.942</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Forecast Horizon</span>
              <p className="text-lg font-bold text-purple-400">+18.4% Growth</p>
              <span className="text-[10px] text-purple-300">30 Days Projection</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-3">
            <Brain className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-0.5">AI Executive Insight:</p>
              <p className="text-slate-300 leading-relaxed">
                "Significant positive correlation exists between Discount and Sales volume, while Customer Satisfaction acts as the primary driver for long-term profit retention. Recommended strategy: prioritize high-margin technology segments."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Enterprise Capabilities</span>
            <h2 className="text-3xl font-extrabold text-white mt-1 mb-3">
              Everything You Need for End-to-End Analytics
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Built with industry-standard machine learning and statistical algorithms to deliver deep intelligence automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/30 group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Workflow</span>
            <h2 className="text-3xl font-extrabold text-white mt-1 mb-3">
              How AI DataSense Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              From raw tabular data to actionable business decisions in 5 streamlined steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {steps.map((st, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-black text-indigo-500/80">{st.step}</span>
                  <h4 className="text-xs font-bold text-white mt-2 mb-1">{st.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Badges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/60 text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Industry-Standard Technology Stack
          </h3>
          <div className="flex flex-wrap justify-center gap-2.5">
            {techStack.map((tech, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:border-indigo-500/50 hover:text-white transition-all"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-gradient-to-b from-slate-950 to-indigo-950/40 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to Unlock Deep Intelligence from Your Data?
          </h2>
          <p className="text-sm text-slate-300 mb-8 max-w-xl mx-auto">
            Experience the power of automated statistical analysis, machine learning prediction, and executive reporting now.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Get Started Free
            </Link>
            <button
              onClick={handleQuickDemo}
              className="px-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-700 transition-all hover:scale-105"
            >
              Launch Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 AI DataSense. Advanced AI + Data Analytics + Machine Learning Platform.</p>
      </footer>
    </div>
  );
};
