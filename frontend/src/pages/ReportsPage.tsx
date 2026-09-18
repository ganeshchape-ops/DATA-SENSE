import React, { useState } from 'react';
import {
  FileText, Download, CheckCircle2, AlertCircle, Sparkles,
  FileSpreadsheet, FileCode, Check, RefreshCw, Eye
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { reportsApi } from '../services/api';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ReportsPage: React.FC = () => {
  const { activeDataset, profile, isProfileLoading } = useDataset();

  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);

  if (!activeDataset) {
    return <EmptyState title="No Dataset Selected" description="Please select a dataset to generate downloadable executive analytics reports." />;
  }

  if (isProfileLoading || !profile) {
    return <LoadingSpinner message="Preparing Report Engine & Metadata..." />;
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDataset) return;
    setLoading(true);
    setError(null);
    setGeneratedReport(null);

    try {
      const res = await reportsApi.generate(activeDataset.id, {
        report_type: reportType,
        title: reportTitle.trim() || undefined,
        include_profiling: true,
        include_stats: true,
        include_correlations: true,
        include_ai_insights: true,
        include_ml_results: true,
      });
      setGeneratedReport(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Report generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const reportFormats = [
    {
      type: 'pdf' as const,
      title: 'Executive PDF Report',
      desc: 'Multi-page publication-grade PDF with cover page, KPI scorecards, statistical tables, AI findings, and recommendations.',
      icon: FileText,
      badge: 'RECOMMENDED'
    },
    {
      type: 'excel' as const,
      title: 'Multi-Sheet Excel Workbook',
      desc: 'Formatted .XLSX workbook with separate sheets for Executive Summary, Descriptive Stats, Correlation Matrix, and Raw Data Sample.',
      icon: FileSpreadsheet,
      badge: 'FORMATTED'
    },
    {
      type: 'csv' as const,
      title: 'Processed CSV Export',
      desc: 'Clean, formatted CSV ready for external business intelligence tools (PowerBI, Tableau, Looker).',
      icon: FileCode,
      badge: 'RAW DATA'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Automated Report Generator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Export publication-grade executive analytics reports in PDF, Excel, or CSV format with 1 click.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Generator Controls */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Format Selection Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              1. Select Report Document Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {reportFormats.map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = reportType === fmt.type;
                return (
                  <button
                    key={fmt.type}
                    type="button"
                    onClick={() => setReportType(fmt.type)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {fmt.badge}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white mb-1">{fmt.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-3">{fmt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Customization */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              2. Custom Report Title (Optional)
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder={`AI DataSense Analytics Report — ${activeDataset.name}`}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Included Sections Indicator */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Automated Sections Included in Report:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Data Quality Scorecard</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Descriptive Stats Table</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Correlation Matrix</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> AI Executive Synthesis</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <Download className="w-4 h-4" />
            {loading ? "Generating Report Document..." : `Generate & Download ${reportType.toUpperCase()} Report`}
          </button>
        </form>
      </div>

      {loading && (
        <LoadingSpinner message="Generating Document Layout & Tables..." subMessage="Compiling ReportLab PDF flowables and formatting Excel workbooks" />
      )}

      {/* Generated Report Success Download Banner */}
      {generatedReport && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{generatedReport.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {generatedReport.message} • Ready for immediate download.
              </p>
            </div>
          </div>

          <a
            href={reportsApi.downloadUrl(generatedReport.report_id)}
            download={generatedReport.filename}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105 shrink-0"
          >
            <Download className="w-4 h-4" />
            Download {generatedReport.report_type.toUpperCase()} File
          </a>
        </div>
      )}
    </div>
  );
};
