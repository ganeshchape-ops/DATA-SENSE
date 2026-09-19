import React, { useState } from 'react';
import {
  Sparkles, Activity, CheckCircle2, AlertCircle, Play,
  HelpCircle, BookOpen, Layers, ArrowRight, Sigma
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { analyticsApi } from '../services/api';
import type { HypothesisTestResponse } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const StatisticsPage: React.FC = () => {
  const { activeDataset, profile, isProfileLoading } = useDataset();

  const [testType, setTestType] = useState<string>('t_test');
  const [colA, setColA] = useState<string>('');
  const [colB, setColB] = useState<string>('');
  const [groupCol, setGroupCol] = useState<string>('');

  const [testResult, setTestResult] = useState<HypothesisTestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!activeDataset) {
    return <EmptyState title="No Dataset Yet" description="Upload your first dataset to start discovering intelligence." />;
  }

  if (isProfileLoading || !profile) {
    return <LoadingSpinner message="Loading Dataset Statistical Topology..." />;
  }

  const numericCols = profile.numeric_stats.map(ns => ns.name);
  const catCols = profile.categorical_stats.map(cs => cs.name);

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colA) {
      setError("Please select the primary variable for the hypothesis test.");
      return;
    }
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const res = await analyticsApi.runHypothesisTest(activeDataset.id, {
        test_type: testType,
        col_a: colA,
        col_b: colB || undefined,
        group_col: groupCol || undefined,
      });
      setTestResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Hypothesis test execution failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto pb-16 animate-in-scale">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
            <Sigma className="w-3.5 h-3.5" /> Inferential Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Statistical Analysis Lab
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Execute scientific hypothesis testing (T-Test, ANOVA, Chi-Square, Normality) with automated interpretations.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hypothesis Testing Workbench */}
      <div className="glass-card p-6 rounded-3xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Hypothesis Experiment Setup
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">Significance: α = 0.05</span>
        </div>

        <form onSubmit={handleRunTest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Statistical Test</label>
              <select
                value={testType}
                onChange={(e) => {
                  setTestType(e.target.value);
                  setColA('');
                  setColB('');
                  setGroupCol('');
                  setTestResult(null);
                }}
                className="w-full px-3 py-2 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="t_test">Two-Sample Independent T-Test</option>
                <option value="anova">One-Way ANOVA (Group Mean Variance)</option>
                <option value="chi_square">Chi-Square Test of Independence</option>
                <option value="normality">Shapiro-Wilk Normality Test</option>
              </select>
            </div>

            {testType === 't_test' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Numeric Metric</label>
                  <select
                    value={colA}
                    onChange={(e) => setColA(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Numeric Variable...</option>
                    {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Grouping Factor (2 Categories)</label>
                  <select
                    value={groupCol}
                    onChange={(e) => setGroupCol(e.target.value)}
                    className="w-full px-3 py-2 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Group Variable...</option>
                    {catCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}

            {testType === 'anova' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Numeric Variable</label>
                  <select
                    value={colA}
                    onChange={(e) => setColA(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Continuous Column...</option>
                    {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categorical Grouping Factor</label>
                  <select
                    value={groupCol}
                    onChange={(e) => setGroupCol(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Category Factor...</option>
                    {catCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}

            {testType === 'chi_square' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Factor</label>
                  <select
                    value={colA}
                    onChange={(e) => setColA(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Factor A...</option>
                    {catCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Second Factor</label>
                  <select
                    value={colB}
                    onChange={(e) => setColB(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Factor B...</option>
                    {catCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}

            {testType === 'normality' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Feature to Validate</label>
                <select
                  value={colA}
                  onChange={(e) => setColA(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Feature...</option>
                  {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-ai-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? "Computing Statistics..." : "Run Scientific Hypothesis Test"}</span>
          </button>
        </form>
      </div>

      {/* Test Results Presentation Card */}
      {testResult && (
        <div className={`glass-card p-6 rounded-3xl space-y-5 border ${
          testResult.is_significant ? 'border-purple-500/40 shadow-lg shadow-purple-500/10' : 'border-white/[0.08]'
        }`}>
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400">Statistical Test Result</span>
              <h3 className="text-base font-bold text-white mt-0.5">{testResult.test_name}</h3>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              testResult.is_significant
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-white/[0.04] text-slate-300 border-white/[0.08]'
            }`}>
              {testResult.is_significant ? 'Statistically Significant' : 'Not Significant'}
            </span>
          </div>

          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#07090E] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Test Statistic</span>
              <p className="text-lg font-bold text-white font-mono mt-0.5">{testResult.statistic.toFixed(4)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#07090E] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">P-Value</span>
              <p className={`text-lg font-bold font-mono mt-0.5 ${testResult.is_significant ? 'text-emerald-400' : 'text-slate-300'}`}>
                {testResult.p_value < 0.0001 ? '< 0.0001' : testResult.p_value.toFixed(4)}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#07090E] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Alpha Threshold</span>
              <p className="text-lg font-bold text-slate-300 font-mono mt-0.5">0.05</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#07090E] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Null Hypothesis</span>
              <p className="text-xs font-bold text-white mt-1">
                {testResult.is_significant ? 'Rejected (p < α)' : 'Failed to Reject'}
              </p>
            </div>
          </div>

          {/* Plain English Translation */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-1">Plain-English Translation:</p>
              <p className="text-slate-300 leading-relaxed">{testResult.interpretation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
