import React, { useState, useEffect } from 'react';
import {
  Brain, Sparkles, TrendingUp, AlertTriangle, CheckCircle2,
  Lightbulb, ShieldCheck, Target, RefreshCw, Zap
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { aiApi } from '../services/api';
import type { AIInsightsResponse } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AIInsightsPage: React.FC = () => {
  const { activeDataset } = useDataset();
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeDataset) {
      loadInsights();
    }
  }, [activeDataset?.id]);

  const loadInsights = async () => {
    if (!activeDataset) return;
    setLoading(true);
    try {
      const res = await aiApi.getInsights(activeDataset.id);
      setInsights(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeDataset) {
    return <EmptyState title="No Dataset Selected" description="Please select a dataset to generate deep AI business insights." />;
  }

  if (loading || !insights) {
    return <LoadingSpinner message="Generating AI Dataset Intelligence..." subMessage="Synthesizing executive summary, trends, anomalies, and SWOT recommendations" />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              AI Insights & Strategic Intelligence
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Automated
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Data-driven strategic synthesis generated for <span className="text-white font-semibold">{activeDataset.name}</span>
          </p>
        </div>

        <button
          onClick={loadInsights}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Regenerate Insights
        </button>
      </div>

      {/* Executive Summary Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
          <Zap className="w-4 h-4" />
          Executive Dataset Synthesis
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          {insights.executive_summary}
        </p>
        <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>{insights.data_health_evaluation}</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Statistical Power
          </span>
        </div>
      </div>

      {/* Key Analytical Findings */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          1. Key Distribution & Cardinality Insights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {insights.key_findings.map((kf, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white">{kf.title}</h3>
                  {kf.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {kf.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{kf.summary}</p>
                <div className="space-y-1.5">
                  {kf.bullet_points.map((bp, j) => (
                    <p key={j} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{bp}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trends & Anomalies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identified Trends */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            2. Identified Trends & Temporal Momentum
          </div>

          <div className="space-y-3">
            {insights.identified_trends.map((tr, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-white">{tr.title}</h4>
                <p className="text-xs text-slate-400">{tr.summary}</p>
                {tr.bullet_points.map((bp, j) => (
                  <p key={j} className="text-[11px] text-slate-300">✓ {bp}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies & Integrity Risks */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            3. Anomalies & Data Integrity Risks
          </div>

          <div className="space-y-3">
            {insights.anomalies_and_risks.map((ar, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-white">{ar.title}</h4>
                <p className="text-xs text-slate-400">{ar.summary}</p>
                {ar.bullet_points.map((bp, j) => (
                  <p key={j} className="text-[11px] text-slate-300">⚠ {bp}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic SWOT Analysis */}
      {insights.swot_analysis && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4">
            <Target className="w-4 h-4" />
            4. Strategic SWOT Synthesis
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Strengths (S)</h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {insights.swot_analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Weaknesses (W)</h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {insights.swot_analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">-</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Opportunities (O)</h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {insights.swot_analysis.opportunities.map((o, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400 font-bold">★</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Threats & Risks (T)</h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {insights.swot_analysis.threats.map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">!</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Recommendations Cards */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          5. Actionable Strategic Recommendations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {insights.strategic_recommendations.map((rec, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white">{rec.title}</h3>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">{rec.summary}</p>
              <div className="space-y-1.5">
                {rec.bullet_points.map((bp, j) => (
                  <p key={j} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{bp}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
