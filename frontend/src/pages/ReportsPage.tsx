import React, { useState } from 'react';
import {
  FileText, Download, CheckCircle2, AlertCircle, Sparkles,
  FileSpreadsheet, FileCode, Check, RefreshCw, Eye, ArrowRight,
  Database, Printer
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { Link } from 'react-router-dom';

export const ReportsPage: React.FC = () => {
  const {
    activeDataset,
    profile,
    insights,
    correlations,
    filteredRows,
    rawRows,
    exportFilteredDataCSV,
    exportFilteredDataJSON
  } = useDataset();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportMarkdown = () => {
    if (!activeDataset || !insights || !profile) return;
    let md = `# AI DataSense — Analysis Report\n\n`;
    md += `**Dataset Name:** ${activeDataset.name}\n`;
    md += `**Total Records:** ${profile.rows.toLocaleString()}\n`;
    md += `**Total Columns:** ${profile.columns}\n`;
    md += `**Data Health Score:** ${profile.data_quality_score}%\n`;
    md += `**Domain:** ${activeDataset.domain?.toUpperCase() || 'UNIVERSAL'}\n\n`;
    md += `## 1. Executive Summary\n\n${insights.executive_summary}\n\n`;

    md += `## 2. Statistical Metrics\n\n`;
    md += `| Column | Mean | Std Dev | Min | Median | Max | Missing |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    profile.numeric_stats.forEach(ns => {
      md += `| ${ns.name} | ${ns.mean ?? '-'} | ${ns.std ?? '-'} | ${ns.min ?? '-'} | ${ns.median ?? '-'} | ${ns.max ?? '-'} | ${ns.missing} (${ns.missing_pct}%) |\n`;
    });
    md += `\n`;

    if (insights.key_findings && insights.key_findings.length > 0) {
      md += `## 3. Important Findings\n\n`;
      insights.key_findings.forEach(kf => {
        md += `### ${kf.title}\n${kf.summary}\n\n`;
        kf.bullet_points.forEach(bp => {
          md += `- ${bp}\n`;
        });
        md += `\n`;
      });
    }

    if (insights.swot_analysis) {
      md += `## 4. Empirical SWOT Analysis\n\n`;
      md += `### Strengths\n` + insights.swot_analysis.strengths.map(s => `- ${s}`).join('\n') + `\n\n`;
      md += `### Weaknesses\n` + insights.swot_analysis.weaknesses.map(w => `- ${w}`).join('\n') + `\n\n`;
      md += `### Opportunities\n` + insights.swot_analysis.opportunities.map(o => `- ${o}`).join('\n') + `\n\n`;
      md += `### Threats\n` + insights.swot_analysis.threats.map(t => `- ${t}`).join('\n') + `\n\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${activeDataset.name}_intelligence_report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Markdown Report exported successfully!');
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (!activeDataset || !profile || !insights) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-xs max-w-xl mx-auto my-12 space-y-4 animate-in-scale">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <FileText className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Dataset Uploaded</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Upload any dataset to generate board-ready executive reports, CSV files, JSON dossiers, and Markdown briefings.
        </p>
        <div className="pt-2">
          <Link to="/upload" className="btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2">
            Upload Dataset
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in-scale">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs animate-in-scale">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 mb-1">
            <FileText className="w-4 h-4" /> Publication & Export Center
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Export Dataset Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Export comprehensive analysis, filtered records, and verified AI intelligence for <strong className="text-slate-800">{activeDataset.name}</strong>.
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <Printer className="w-4 h-4 text-indigo-600" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* 4 Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Markdown Report */}
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Markdown Intelligence Dossier</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete markdown documentation containing executive summary, verified statistical tables, and SWOT matrix.
            </p>
          </div>
          <button
            onClick={handleExportMarkdown}
            className="w-full py-2.5 btn-primary text-xs font-bold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Markdown (.MD)
          </button>
        </div>

        {/* Card 2: Filtered CSV */}
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Filtered Dataset (CSV)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export {filteredRows.length.toLocaleString()} active rows with all active filters and search constraints applied.
            </p>
          </div>
          <button
            onClick={() => {
              exportFilteredDataCSV();
              showToast('CSV exported successfully!');
            }}
            className="w-full py-2.5 btn-secondary text-xs font-bold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Filtered CSV (.CSV)
          </button>
        </div>

        {/* Card 3: JSON Analysis */}
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Structured Analysis JSON</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Raw JSON export of records, descriptive statistical objects, and AI correlation matrices.
            </p>
          </div>
          <button
            onClick={() => {
              exportFilteredDataJSON();
              showToast('JSON exported successfully!');
            }}
            className="w-full py-2.5 btn-secondary text-xs font-bold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Full JSON (.JSON)
          </button>
        </div>

        {/* Card 4: Print / Browser PDF */}
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Printable Executive Report</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Formatted print-optimized view of current dashboards, key findings, and statistical tables.
            </p>
          </div>
          <button
            onClick={handlePrintReport}
            className="w-full py-2.5 btn-secondary text-xs font-bold flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Embedded Executive Report Preview */}
      <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Executive Preview</span>
            <h2 className="text-xl font-bold text-slate-900">{activeDataset.name} Intelligence Brief</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">{new Date().toLocaleDateString()}</span>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-medium">
            {insights.executive_summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Records</span>
              <p className="text-base font-bold text-slate-900 font-mono">{profile.rows.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Columns</span>
              <p className="text-base font-bold text-slate-900 font-mono">{profile.columns}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Data Quality</span>
              <p className="text-base font-bold text-emerald-600 font-mono">{profile.data_quality_score}%</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Missing Cells</span>
              <p className="text-base font-bold text-amber-600 font-mono">{profile.total_missing_cells}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
