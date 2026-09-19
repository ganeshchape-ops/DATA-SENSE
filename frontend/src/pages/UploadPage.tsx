import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2, AlertCircle,
  Database, ShoppingCart, Users, Home, HeartPulse, LineChart,
  BarChart3, Zap, ArrowRight, ShieldCheck, FileCode, GraduationCap,
  Landmark, Briefcase, ArrowUp
} from 'lucide-react';
import { datasetApi, analyticsApi } from '../services/api';
import { useDataset } from '../context/DatasetContext';

export const UploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { refreshDatasets, setActiveDataset, loadSampleDataset } = useDataset();
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    setError(null);
    const validExtensions = ['.csv', '.xlsx', '.xls', '.json'];
    const hasValidExt = validExtensions.some(ext => f.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError("Unsupported file format. Please upload a .CSV, .XLSX, .XLS, or .JSON file.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB limit.");
      return;
    }
    setFile(f);
    if (!datasetName) {
      setDatasetName(f.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a dataset file to upload.");
      return;
    }
    setLoading(true);
    setError(null);
    setUploadProgress(25);

    const formData = new FormData();
    formData.append('file', file);
    if (datasetName.trim()) {
      formData.append('dataset_name', datasetName.trim());
    }

    try {
      setUploadProgress(65);
      const created = await datasetApi.upload(formData);
      setUploadProgress(100);
      await refreshDatasets();
      setActiveDataset(created);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to upload and profile dataset.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const created = await loadSampleDataset(key);
      setActiveDataset(created);
      navigate('/dashboard');
    } catch (err: any) {
      setError("Failed to generate sample dataset.");
    } finally {
      setLoading(false);
    }
  };

  const benchmarkSamples = [
    {
      key: "student",
      title: "Student Academic Performance",
      domainBadge: "Education",
      desc: "500 Students • Dynamic Subject Detection, Pass/Fail Rates, Grade Bands, Attendance Analysis",
      icon: GraduationCap,
      badge: "Benchmark #1",
      color: "from-purple-600 to-indigo-600"
    },
    {
      key: "ecommerce_sales",
      title: "E-Commerce Commercial Sales",
      domainBadge: "E-Commerce",
      desc: "500 Transactions • Revenue, Margin, Profit, Discounts, Customer Ratings, Returns",
      icon: ShoppingCart,
      badge: "Benchmark #2",
      color: "from-emerald-600 to-teal-600"
    },
    {
      key: "employee_data",
      title: "HR Workforce & Salary Analytics",
      domainBadge: "HR",
      desc: "400 Employees • Department Headcount, Compensation Tiers, Tenure, Attrition Rate",
      icon: Briefcase,
      badge: "Benchmark #3",
      color: "from-purple-600 to-pink-600"
    },
    {
      key: "banking_data",
      title: "Banking & Credit Risk Portfolio",
      domainBadge: "Banking",
      desc: "450 Accounts • Credit Scores, Account Balances, Loan Default Probability, Delinquency",
      icon: Landmark,
      badge: "Benchmark #4",
      color: "from-amber-600 to-orange-600"
    },
    {
      key: "generic_data",
      title: "Universal Tabular Telemetry",
      domainBadge: "Generic",
      desc: "350 Sensor Readings • Temperatures, Pressures, Vibrations, System Efficiency (Zero hardcoding)",
      icon: Zap,
      badge: "Benchmark #5",
      color: "from-slate-600 to-slate-800"
    },
    {
      key: "heart",
      title: "Patient Cohort Demographics",
      domainBadge: "Healthcare",
      desc: "350 Demographic Records • Resting BP, Cholesterol, Max HR, Demographic distributions",
      icon: HeartPulse,
      badge: "Clinical",
      color: "from-rose-600 to-red-600"
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in-scale pb-16">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
            <UploadCloud className="w-3.5 h-3.5" /> Data Ingestion Pipeline
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Ingest Any Dataset
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic schema recognition, multi-domain inference, and dynamic statistical profiling.
          </p>
        </div>

        <button
          onClick={() => handleLoadSample('student')}
          disabled={loading}
          className="btn-ai-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Academic Demo</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Large Centered Drag-and-Drop Card */}
      <div className="glass-card-glow p-8 sm:p-12 rounded-3xl relative overflow-hidden text-center">
        <form onSubmit={handleUpload} className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center relative ${
              dragActive
                ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
                : file
                ? 'border-emerald-500/60 bg-emerald-500/5'
                : 'border-white/[0.1] hover:border-purple-500/50 hover:bg-white/[0.02]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleChange}
              className="hidden"
            />

            {/* Glowing Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
              file ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/15 text-purple-400 border border-purple-500/25 shadow-lg shadow-purple-500/15'
            }`}>
              {file ? <CheckCircle2 className="w-8 h-8" /> : <ArrowUp className="w-8 h-8 animate-bounce" />}
            </div>

            {file ? (
              <div className="space-y-1.5">
                <p className="text-base font-bold text-white font-sans">{file.name}</p>
                <p className="text-xs text-emerald-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • File validated & ready to analyze
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Drop your dataset here
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  CSV, XLSX, XLS
                </p>
                <p className="text-xs text-slate-500">or</p>
                <div className="pt-1">
                  <span className="btn-ai-secondary px-4 py-2 text-xs font-semibold inline-block">
                    [ Browse Files ]
                  </span>
                </div>
                <p className="text-xs text-purple-300 font-medium pt-3 max-w-sm mx-auto">
                  AI will automatically understand your dataset structure.
                </p>
              </div>
            )}
          </div>

          {file && (
            <div className="text-left space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Dataset Title / Name
              </label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="E.g. Student Academic Records 2026"
                className="w-full px-4 py-2.5 bg-[#07090E] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {loading && (
            <div className="space-y-2 text-left">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Understanding dataset & computing domain models...</span>
                <span className="text-purple-400 font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-3.5 btn-ai-primary disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{loading ? "Analyzing Dataset Intelligence..." : "Analyze Dataset →"}</span>
          </button>
        </form>
      </div>

      {/* Preloaded Benchmark Datasets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 1-Click Benchmark Datasets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Test dynamic domain intelligence across education, retail, HR, banking, healthcare and telemetry.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benchmarkSamples.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => handleLoadSample(s.key)}
                disabled={loading}
                className="glass-card p-5 rounded-2xl text-left flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/[0.04] text-purple-300 border border-purple-500/20">
                      {s.domainBadge}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-purple-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Load Dataset</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
