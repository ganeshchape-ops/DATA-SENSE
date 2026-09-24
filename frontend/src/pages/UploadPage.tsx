import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2, AlertCircle,
  Database, ArrowUp, ArrowRight, ShieldCheck, Zap, FileText
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

export const UploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadAndProcessFile, loadSampleDataset } = useDataset();
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
      setError("Unable to analyze this file. Please upload a valid CSV, Excel, or JSON file.");
      return;
    }
    if (f.size === 0) {
      setError("The uploaded dataset is empty.");
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

    try {
      setStatusMessage("Reading and validating dataset structure...");
      setUploadProgress(20);
      await new Promise(r => setTimeout(r, 150));

      setStatusMessage("Detecting column topologies and mathematical distributions...");
      setUploadProgress(50);
      await new Promise(r => setTimeout(r, 150));

      setStatusMessage("Synthesizing empirical AI insights & correlations...");
      setUploadProgress(85);

      await uploadAndProcessFile(file);

      setUploadProgress(100);
      setStatusMessage("Analysis complete!");
      await new Promise(r => setTimeout(r, 200));

      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || "Unable to analyze this file. Please upload a valid CSV, Excel, or JSON file.");
    } finally {
      setLoading(false);
    }
  };

  const handleBenchmarkSample = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      setStatusMessage("Loading verified benchmark dataset...");
      setUploadProgress(60);
      await loadSampleDataset(key);
      setUploadProgress(100);
      navigate('/dashboard');
    } catch (err: any) {
      setError("Failed to load benchmark dataset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in-scale pb-16">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 mb-1">
            <UploadCloud className="w-4 h-4" /> Data Ingestion Pipeline
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Upload & Analyze Dataset
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic schema recognition, numerical profiling, outlier detection, and strict AI intelligence.
          </p>
        </div>

        <button
          onClick={() => handleBenchmarkSample('student')}
          disabled={loading}
          className="btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Load Student Demo</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Large Centered Drag-and-Drop Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden text-center">
        <form onSubmit={handleUpload} className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center relative ${
              dragActive
                ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                : file
                ? 'border-emerald-500 bg-emerald-50/40'
                : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleChange}
              className="hidden"
            />

            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 ${
              file ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
            }`}>
              {file ? <CheckCircle2 className="w-8 h-8" /> : <UploadCloud className="w-8 h-8 animate-bounce" />}
            </div>

            {file ? (
              <div className="space-y-1.5">
                <p className="text-base font-bold text-slate-900 font-sans">{file.name}</p>
                <p className="text-xs text-emerald-600 font-medium">
                  {(file.size / 1024).toFixed(1)} KB • File validated & ready to analyze
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Drop your dataset here
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">CSV</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">XLSX</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">XLS</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">JSON</span>
                </div>
                <div className="pt-2">
                  <span className="btn-secondary px-4 py-2 text-xs font-semibold inline-block">
                    Browse Files
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-2">
                  Supports up to 50MB • All processing runs with 100% data isolation
                </p>
              </div>
            )}
          </div>

          {file && (
            <div className="text-left space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Dataset Title
              </label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="Dataset Name"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {loading && (
            <div className="space-y-2 text-left">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>{statusMessage || "Analyzing dataset..."}</span>
                <span className="text-indigo-600 font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-3.5 btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{loading ? "Analyzing Dataset Intelligence..." : "Analyze Dataset"}</span>
          </button>
        </form>
      </div>

      {/* Verified Data Isolation Notice */}
      <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-900">Strict Data Isolation Guarantee</h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            Every metric, chart, outlier, correlation, and AI explanation is calculated exclusively from the currently uploaded file. When a new file is uploaded, all previous datasets, tables, and AI caches are instantly cleared.
          </p>
        </div>
      </div>
    </div>
  );
};
