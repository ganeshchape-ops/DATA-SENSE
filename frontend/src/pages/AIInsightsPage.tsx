import React, { useState, useEffect } from 'react';
import {
  Sparkles, TrendingUp, AlertTriangle, CheckCircle2,
  Lightbulb, ShieldCheck, Target, RefreshCw, Zap, ArrowRight,
  BrainCircuit, Shield
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
    return <EmptyState title="No Dataset Yet" description="Upload your first dataset to start discovering intelligence." />;
  }

  if (loading || !insights) {
    return <LoadingSpinner message="Generating AI Dataset Intelligence..." subMessage="Synthesizing executive summary, trends, anomalies, and SWOT recommendations" />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 animate-in-scale">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Synthesis Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Insights
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Intelligence discovered from your data • <strong className="text-slate-200">{activeDataset.name}</strong>
          </p>
        </div>

        <button
          onClick={loadInsights}
          className="btn-ai-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
          <span>Regenerate Insights</span>
        </button>
      </div>

      {/* Executive Summary Dominant Card */}
      <div className="glass-card-glow p-6 sm:p-8 rounded-3xl space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Sparkles className="w-4 h-4" />
            <span>✦ Executive Dataset Synthesis</span>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> High Statistical Confidence
          </span>
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans font-normal">
          {insights.executive_summary}
        </p>

        <div className="pt-3 border-t border-white/[0.08] text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>{insights.data_health_evaluation}</span>
          <span className="text-purple-300 font-mono text-[11px]">Domain: {activeDataset.domain || 'Universal'}</span>
        </div>
      </div>

      {/* Large Insight Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            ✦ Discovered Patterns & Relationships
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {insights.key_findings.map((kf, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                      ✦ Pattern Detected
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    Confidence: High
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2">{kf.title}</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">{kf.summary}</p>

                <div className="space-y-2 p-3 rounded-2xl bg-[#07090E]/60 border border-white/[0.06]">
                  {kf.bullet_points.map((bp, j) => (
                    <p key={j} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{bp}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trends & Anomaly Risks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identified Trends */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/[0.06] pb-3">
            <TrendingUp className="w-4 h-4" />
            <span>Identified Trends & Momentum</span>
          </div>

          <div className="space-y-3">
            {insights.identified_trends.map((tr, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#07090E]/60 border border-white/[0.06] space-y-2">
                <h4 className="text-xs font-bold text-white">{tr.title}</h4>
                <p className="text-xs text-slate-400">{tr.summary}</p>
                {tr.bullet_points.map((bp, j) => (
                  <p key={j} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span> {bp}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies & Data Integrity Risks */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-white/[0.06] pb-3">
            <AlertTriangle className="w-4 h-4" />
            <span>Anomalies & Integrity Risks</span>
          </div>

          <div className="space-y-3">
            {insights.anomalies_and_risks.map((ar, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#07090E]/60 border border-white/[0.06] space-y-2">
                <h4 className="text-xs font-bold text-white">{ar.title}</h4>
                <p className="text-xs text-slate-400">{ar.summary}</p>
                {ar.bullet_points.map((bp, j) => (
                  <p key={j} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                    <span className="text-amber-400">⚠</span> {bp}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic SWOT Analysis */}
      {insights.swot_analysis && (
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-white/[0.06] pb-3">
            <Target className="w-4 h-4" />
            <span>Strategic SWOT Synthesis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Strengths (S)</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {insights.swot_analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Weaknesses (W)</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {insights.swot_analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">-</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Opportunities (O)</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {insights.swot_analysis.opportunities.map((o, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400 font-bold">★</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Threats & Risks (T)</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
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

      {/* Actionable Strategic Recommendations */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-purple-400" /> Actionable Recommendations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {insights.strategic_recommendations.map((rec, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl border border-purple-500/20">
              <h3 className="text-xs font-bold text-white mb-2">{rec.title}</h3>
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
