import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileSpreadsheet, Sparkles, CheckCircle2, AlertCircle,
  Database, ShoppingCart, Users, Home, HeartPulse, LineChart
} from 'lucide-react';
import { datasetApi } from '../services/api';
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
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const hasValidExt = validExtensions.some(ext => f.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.");
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
      setError("Please select a file to upload.");
      return;
    }
    setLoading(true);
    setError(null);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', file);
    if (datasetName.trim()) {
      formData.append('dataset_name', datasetName.trim());
    }

    try {
      setUploadProgress(60);
      const created = await datasetApi.upload(formData);
      setUploadProgress(100);
      await refreshDatasets();
      setActiveDataset(created);
      navigate('/dashboard/profile');
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to upload and parse dataset.");
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
      navigate('/dashboard/profile');
    } catch (err: any) {
      setError("Failed to generate sample dataset.");
    } finally {
      setLoading(false);
    }
  };

  const samples = [
    {
      key: "ecommerce",
      title: "E-Commerce Sales & Margin",
      desc: "500 Orders • Sales, Profit, Discounts, Customer Age, Sub-Category",
      icon: ShoppingCart,
      color: "from-blue-600 to-indigo-600"
    },
    {
      key: "churn",
      title: "Customer Churn Prediction",
      desc: "450 Customers • Monthly Charges, Tenure, Contract Type, Churn Status",
      icon: Users,
      color: "from-purple-600 to-pink-600"
    },
    {
      key: "housing",
      title: "Housing Price Valuation",
      desc: "400 Properties • Area SqFt, Bedrooms, Bathrooms, Parking, Price",
      icon: Home,
      color: "from-emerald-600 to-teal-600"
    },
    {
      key: "heart",
      title: "Heart Disease Risk Assessment",
      desc: "350 Patients • Age, Resting BP, Cholesterol, Max HR, Target Risk",
      icon: HeartPulse,
      color: "from-rose-600 to-red-600"
    },
    {
      key: "traffic",
      title: "Daily Web Traffic & Revenue Forecast",
      desc: "180 Days • Chronological Visitors, Pageviews, Conversion, Revenue",
      icon: LineChart,
      color: "from-amber-600 to-orange-600"
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Upload or Load Dataset</h1>
        <p className="text-xs text-slate-400 mt-1">
          Import your CSV or Excel dataset, or select one of our curated sample datasets for instant demonstration.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
        <form onSubmit={handleUpload} className="space-y-5">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                : file
                ? 'border-emerald-500/60 bg-emerald-500/5'
                : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleChange}
              className="hidden"
            />

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
              file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-600/20 text-indigo-400'
            }`}>
              {file ? <CheckCircle2 className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
            </div>

            {file ? (
              <div>
                <p className="text-sm font-bold text-white mb-0.5">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-white mb-1">
                  Drag & Drop CSV or Excel file here, or <span className="text-indigo-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-500">
                  Supports .CSV, .XLSX, .XLS (Up to 50MB)
                </p>
              </div>
            )}
          </div>

          {file && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dataset Display Name</label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="E.g. Q3 Sales & Performance"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          )}

          {loading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Uploading & Profiling Dataset...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <Upload className="w-4 h-4" />
            {loading ? "Processing..." : "Upload & Analyze Dataset"}
          </button>
        </form>
      </div>

      {/* Preloaded Sample Datasets Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              1-Click Industry Sample Datasets
            </h2>
            <p className="text-xs text-slate-400">
              No dataset file on hand? Instant-load any sample to test the entire platform.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {samples.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => handleLoadSample(s.key)}
                disabled={loading}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${s.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
