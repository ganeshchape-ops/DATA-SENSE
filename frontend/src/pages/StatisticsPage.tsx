import React, { useState } from 'react';
import {
  Sparkles, Activity, CheckCircle2, AlertCircle, Play,
  HelpCircle, BookOpen, Layers, ArrowRight
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
    return <EmptyState title="No Dataset Selected" description="Select a dataset to perform statistical testing and inferential hypothesis experiments." />;
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Statistical Analysis & Hypothesis Testing Lab
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform rigorous scientific hypothesis validation (T-Tests, ANOVA, Chi-Square, Normality) with automated plain-English interpretations.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hypothesis Testing Workbench */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Hypothesis Experiment Configuration
          </h2>
          <span className="text-[10px] text-slate-400">Significance Level: α = 0.05 (95% Confidence)</span>
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
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="t_test">Two-Sample Independent T-Test</option>
                <option value="anova">One-Way ANOVA (Multi-group Mean Variance)</option>
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
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Numeric Column...</option>
                    {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Grouping Feature (2 Categories)</label>
                  <select
                    value={groupCol}
                    onChange={(e) => setGroupCol(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Category / Binary Column...</option>
                    {catCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}

            {testType === 'anova' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Numeric Continuous Variable</label>
                  <select
                    value={colA}
                    onChange={(e) => setColA(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
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
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Categorical Column...</option>
                    {catCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}

            {testType === 'chi_square' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Categorical Variable</label>
                  <select
                    value={colA}
                    onChange={(e) => setColA(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select First Factor...</option>
                    {catCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Second Categorical Variable</label>
                  <select
                    value={colB}
                    onChange={(e) => setColB(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Second Factor...</option>
                    {catCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}

            {testType === 'normality' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Numeric Feature to Validate</label>
                <select
                  value={colA}
                  onChange={(e) => setColA(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
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
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 hover:scale-[1.01]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {loading ? "Computing Statistics..." : "Run Scientific Hypothesis Test"}
          </button>
        </form>
      </div>

      {/* Test Results Presentation Card */}
      {testResult && (
        <div className={`p-6 rounded-2xl border transition-all duration-300 shadow-2xl ${
          testResult.is_significant
            ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/40'
            : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 border-slate-700'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400">Statistical Test Result</span>
              <h3 className="text-base font-bold text-white mt-0.5">{testResult.test_name}</h3>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              testResult.is_significant
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {testResult.is_significant ? 'Statistically Significant' : 'Not Significant'}
            </span>
          </div>

          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Test Statistic</span>
              <p className="text-lg font-bold text-white font-mono">{testResult.statistic.toFixed(4)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">P-Value</span>
              <p className={`text-lg font-bold font-mono ${testResult.is_significant ? 'text-emerald-400' : 'text-slate-300'}`}>
                {testResult.p_value < 0.0001 ? '< 0.0001' : testResult.p_value.toFixed(4)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Alpha Threshold</span>
              <p className="text-lg font-bold text-slate-300 font-mono">0.05</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Null Hypothesis (H₀)</span>
              <p className="text-xs font-bold text-white mt-1">
                {testResult.is_significant ? 'Rejected (p < α)' : 'Failed to Reject (p ≥ α)'}
              </p>
            </div>
          </div>

          {/* Plain English Explanation */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
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
