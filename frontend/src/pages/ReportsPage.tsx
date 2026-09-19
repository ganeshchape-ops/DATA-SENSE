import React, { useState } from 'react';
import {
  FileText, Download, CheckCircle2, AlertCircle, Sparkles,
  FileSpreadsheet, FileCode, Check, RefreshCw, Eye, ArrowRight
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
    return <EmptyState title="No Dataset Yet" description="Upload your first dataset to start discovering intelligence." />;
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

  const reportCards = [
    {
      type: 'pdf' as const,
      title: 'AI Analytics Report',
      desc: 'Comprehensive multi-page publication-grade PDF with cover page, KPI scorecards, statistical tables, AI findings, and recommendations.',
      btnLabel: 'Generate PDF',
      icon: FileText,
      badge: 'RECOMMENDED'
    },
    {
      type: 'pdf' as const,
      isSummary: true,
      title: 'Executive Summary',
      desc: 'Business-focused 1-page condensed executive brief with key driver analysis, strategic risks, and top decisions.',
      btnLabel: 'Generate Summary',
      icon: Sparkles,
      badge: 'EXECUTIVE'
    },
    {
      type: 'excel' as const,
      title: 'Excel Analysis',
      desc: 'Detailed multi-sheet OpenPyXL workbook with formatted tables for Executive Summary, Descriptive Stats, Correlations, and Data.',
      btnLabel: 'Export Excel',
      icon: FileSpreadsheet,
      badge: 'MULTI-SHEET'
    },
  ];

  const effectiveDomain = activeDataset.domain_override || activeDataset.domain || 'generic';
  const domainLabels: Record<string, string> = {
    student: 'Academic & Student Performance',
    ecommerce: 'E-Commerce & Commercial Sales',
    hr: 'HR Workforce & Talent Analytics',
    banking: 'Banking & Credit Risk Portfolio',
    finance: 'Financial Operations & P&L',
    healthcare: 'Patient Cohort Demographics',
    marketing: 'Marketing Campaign & Conversion',
    generic: 'Universal Tabular Analytics'
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 animate-in-scale">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
            <FileText className="w-3.5 h-3.5" /> Publication Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Executive Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Export board-ready intelligence in PDF and Excel formats adapted to <strong className="text-white">{domainLabels[effectiveDomain] || effectiveDomain}</strong>.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25 shrink-0">
          {domainLabels[effectiveDomain] || `${effectiveDomain.toUpperCase()} DOMAIN`}
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3 Premium Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reportCards.map((rc, idx) => {
          const Icon = rc.icon;
          const isSelected = reportType === rc.type;
          return (
            <div
              key={idx}
              onClick={() => setReportType(rc.type)}
              className={`p-6 rounded-3xl cursor-pointer flex flex-col justify-between transition-all duration-300 group ${
                isSelected
                  ? 'glass-card-glow border-purple-500/50 scale-[1.02]'
                  : 'glass-card hover:border-purple-500/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isSelected ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white/[0.04] text-purple-400 border border-white/[0.06]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
                  }`}>
                    {rc.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2">{rc.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{rc.desc}</p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReportType(rc.type);
                  handleGenerate(e);
                }}
                disabled={loading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'btn-ai-primary'
                    : 'btn-ai-secondary'
                }`}
              >
                <span>[ {rc.btnLabel} ]</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Title & Customization Box */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Custom Report Title (Optional)
          </label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder={`${domainLabels[effectiveDomain] || 'AI DataSense'} Executive Report — ${activeDataset.name}`}
            className="w-full px-4 py-2.5 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="p-4 rounded-2xl bg-[#07090E]/60 border border-white/[0.06] flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="font-bold text-purple-400 uppercase text-[10px]">Sections Included:</span>
          <span className="flex items-center gap-1 text-slate-300"><Check className="w-3.5 h-3.5 text-emerald-400" /> Data Quality Health</span>
          <span className="flex items-center gap-1 text-slate-300"><Check className="w-3.5 h-3.5 text-emerald-400" /> Statistical Profiling</span>
          <span className="flex items-center gap-1 text-slate-300"><Check className="w-3.5 h-3.5 text-emerald-400" /> Correlation Matrix</span>
          <span className="flex items-center gap-1 text-purple-300 font-semibold"><Check className="w-3.5 h-3.5 text-purple-400" /> Domain Breakdown</span>
        </div>
      </div>

      {loading && (
        <LoadingSpinner message="Generating Document Layout & Tables..." subMessage="Compiling ReportLab PDF flowables and formatting Excel workbooks" />
      )}

      {/* Generated Report Banner */}
      {generatedReport && (
        <div className="glass-card-glow p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
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
            className="btn-ai-primary px-6 py-3 text-xs font-bold flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download {generatedReport.report_type.toUpperCase()} File</span>
          </a>
        </div>
      )}
    </div>
  );
};
