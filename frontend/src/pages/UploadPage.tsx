import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2, AlertCircle,
  Database, ShoppingCart, Users, Home, HeartPulse, LineChart,
  BarChart3, Zap, ArrowRight, ShieldCheck, FileCode
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

  const samples = [
    {
      key: "sales_data",
      title: "Enterprise Sales & Profit Engine",
      desc: "550+ Multi-variable records • Sales, Cost, Profit, Discount, Ratings, Geography",
      icon: LineChart,
      badge: "Recommended Demo",
      color: "from-indigo-600 to-violet-600"
    },
    {
      key: "ecommerce",
      title: "E-Commerce Customer Experience",
      desc: "500 Orders • Sales, Margins, Discounts, Customer Age, Sub-Categories",
      icon: ShoppingCart,
      color: "from-blue-600 to-indigo-600"
    },
    {
      key: "churn",
      title: "Customer Retention & Churn Risk",
      desc: "450 Subscribers • Monthly Charges, Tenure, Contract Types, Churn Targets",
      icon: Users,
      color: "from-purple-600 to-pink-600"
    },
    {
      key: "housing",
      title: "Real Estate Valuation Regression",
      desc: "400 Properties • Square Footage, Bedrooms, Bathrooms, Parking, Price",
      icon: Home,
      color: "from-emerald-600 to-teal-600"
    },
    {
      key: "heart",
      title: "Clinical Heart Disease Classifier",
      desc: "350 Clinical Patients • Resting BP, Cholesterol, Max HR, Angina Risk",
      icon: HeartPulse,
      color: "from-rose-600 to-red-600"
    },
    {
      key: "traffic",
      title: "Daily Web Traffic & Revenue Forecast",
      desc: "180 Days Chronological • Daily Visitors, Pageviews, Conversion, Revenue",
      icon: Zap,
      color: "from-amber-600 to-orange-600"
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in-scale">
      {/* Header with Demo CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
              <UploadCloud className="w-3.5 h-3.5" /> Data Ingestion Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Upload Dataset or Launch Demo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Support for CSV, XLSX, XLS, and JSON formats up to 50MB with instant schema validation and profiling.
          </p>
        </div>

        {/* Demo Mode Button */}
        <button
          onClick={() => handleLoadSample('sales_data')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 hover:scale-105 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Explore Demo Analytics (550+ Records)</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <form onSubmit={handleUpload} className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]'
                : file
                ? 'border-emerald-500/80 bg-emerald-50/30 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleChange}
              className="hidden"
            />

            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
              file ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            }`}>
              {file ? <CheckCircle2 className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-900 dark:text-white">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • File validated & ready to analyze</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Drag & Drop your dataset here, or <span className="text-indigo-600 dark:text-indigo-400 underline">Browse Files</span>
                </p>
                <p className="text-xs text-slate-400">
                  Supported extensions: <strong className="text-slate-600 dark:text-slate-300">.CSV, .XLSX, .XLS, .JSON</strong> (Max 50MB)
                </p>
              </div>
            )}
          </div>

          {file && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dataset Title / Name
              </label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="E.g. Q1 Global Revenue & Sales"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Ingesting, profiling & computing health scores...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <UploadCloud className="w-4 h-4" />
            {loading ? "Processing Dataset..." : "Upload & Analyze Dataset"}
          </button>
        </form>
      </div>

      {/* Built-in Preloaded Datasets Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            1-Click Preloaded Enterprise Datasets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instant-load realistic datasets to evaluate data cleaning, AutoML models, forecasting, and anomaly detection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {samples.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => handleLoadSample(s.key)}
                disabled={loading}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${s.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {s.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:underline">
                  Load & Analyze <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
