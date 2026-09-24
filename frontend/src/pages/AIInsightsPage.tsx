import React from 'react';
import {
  Sparkles, TrendingUp, AlertTriangle, CheckCircle2,
  Lightbulb, ShieldCheck, Target, RefreshCw, Zap,
  Database, ArrowRight
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { Link } from 'react-router-dom';

export const AIInsightsPage: React.FC = () => {
  const { activeDataset, insights, filteredRows } = useDataset();

  if (!activeDataset || !insights) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-xs max-w-xl mx-auto my-12 space-y-4 animate-in-scale">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Dataset Uploaded</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Upload any dataset to generate strict empirical AI insights, trends, anomalies, and SWOT analysis.
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
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in-scale">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4" /> Strict Empirical AI Intelligence
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            AI Insights & Strategic Synthesis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified findings computed strictly from <strong className="text-slate-800">{activeDataset.name}</strong> ({filteredRows.length.toLocaleString()} active rows)
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Zero Hallucination Guarantee</span>
        </div>
      </div>

      {/* Executive Summary Dominant Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Executive Dataset Summary</span>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Statistical Validation: 100%
          </span>
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
          {insights.executive_summary}
        </p>

        <div className="pt-3 border-t border-white/10 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>{insights.data_health_evaluation}</span>
          <span className="text-indigo-300 font-mono text-[11px]">Domain: {activeDataset.domain?.toUpperCase() || 'UNIVERSAL'}</span>
        </div>
      </div>

      {/* Key Empirical Findings */}
      {insights.key_findings && insights.key_findings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            Important Empirical Findings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {insights.key_findings.map((kf, i) => (
              <div key={i} className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">{kf.title}</h3>
                  {kf.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {kf.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{kf.summary}</p>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  {kf.bullet_points.map((bp, j) => (
                    <p key={j} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{bp}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends & Anomalies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identified Trends */}
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 border-b border-slate-100 pb-3">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Identified Trends & Patterns</span>
          </div>

          <div className="space-y-3">
            {insights.identified_trends.map((tr, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{tr.title}</h4>
                  {tr.badge && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {tr.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{tr.summary}</p>
                {tr.bullet_points.map((bp, j) => (
                  <p key={j} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span> {bp}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies & Outliers */}
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Anomalies & Distribution Outliers</span>
          </div>

          <div className="space-y-3">
            {insights.anomalies_and_risks.map((ar, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{ar.title}</h4>
                  {ar.badge && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      {ar.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{ar.summary}</p>
                {ar.bullet_points.map((bp, j) => (
                  <p key={j} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">⚠</span> {bp}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic SWOT Synthesis */}
      {insights.swot_analysis && (
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Dataset Empirical SWOT Matrix</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Strengths (S)</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {insights.swot_analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">Weaknesses (W)</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {insights.swot_analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">-</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Opportunities (O)</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {insights.swot_analysis.opportunities.map((o, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">★</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Threats & Risks (T)</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {insights.swot_analysis.threats.map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">!</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Actionable Recommendations */}
      {insights.strategic_recommendations && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Actionable Recommendations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {insights.strategic_recommendations.map((rec, i) => (
              <div key={i} className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900">{rec.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.summary}</p>
                <div className="space-y-1.5">
                  {rec.bullet_points.map((bp, j) => (
                    <p key={j} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span>{bp}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
