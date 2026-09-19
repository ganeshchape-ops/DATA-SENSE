import React, { useState, useEffect } from 'react';
import {
  Cpu, Sparkles, CheckCircle2, Play, Trophy, Activity,
  Sliders, ArrowRight, Layers, BarChart3, AlertCircle, RefreshCw,
  Zap, BrainCircuit
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { mlApi } from '../services/api';
import type { MLTrainResponse, MLPredictResponse, ClusteringResponse, MLModelResult } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';

export const MLStudioPage: React.FC = () => {
  const { activeDataset, profile, isProfileLoading } = useDataset();

  const [activeTab, setActiveTab] = useState<'supervised' | 'clustering'>('supervised');
  const [taskType, setTaskType] = useState<'regression' | 'classification'>('regression');
  const [targetCol, setTargetCol] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Supervised Model State
  const [trainResult, setTrainResult] = useState<MLTrainResponse | null>(null);
  const [selectedModelName, setSelectedModelName] = useState<string>('');
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainError, setTrainError] = useState<string | null>(null);

  // Live Prediction Simulator State
  const [simulatorInputs, setSimulatorInputs] = useState<Record<string, any>>({});
  const [predictResult, setPredictResult] = useState<MLPredictResponse | null>(null);
  const [predictLoading, setPredictLoading] = useState(false);

  // Clustering State
  const [nClusters, setNClusters] = useState<number>(3);
  const [clusterResult, setClusterResult] = useState<ClusteringResponse | null>(null);
  const [clusterLoading, setClusterLoading] = useState(false);

  useEffect(() => {
    if (activeDataset) {
      detectTask();
    }
  }, [activeDataset?.id]);

  const detectTask = async () => {
    if (!activeDataset) return;
    try {
      const detected = await mlApi.detectTask(activeDataset.id);
      if (detected.suggested_task === 'classification') {
        setTaskType('classification');
      } else {
        setTaskType('regression');
      }
      if (detected.target_column_candidates.length > 0) {
        setTargetCol(detected.target_column_candidates[0].column);
      }
      const candFeatures = detected.feature_candidates.filter((c: string) => c !== targetCol);
      setSelectedFeatures(candFeatures.slice(0, 8));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDataset || !targetCol || selectedFeatures.length === 0) return;
    setTrainingLoading(true);
    setTrainError(null);
    setTrainResult(null);
    setPredictResult(null);

    try {
      const res = await mlApi.train(activeDataset.id, {
        task_type: taskType,
        target_col: targetCol,
        feature_cols: selectedFeatures,
        test_size: 0.2
      });
      setTrainResult(res);
      setSelectedModelName(res.best_model_name);

      const initInputs: Record<string, any> = {};
      selectedFeatures.forEach(feat => {
        const numStat = profile?.numeric_stats.find(ns => ns.name === feat);
        if (numStat && numStat.mean !== null) {
          initInputs[feat] = Math.round(numStat.mean * 100) / 100;
        } else {
          initInputs[feat] = 0;
        }
      });
      setSimulatorInputs(initInputs);
    } catch (err: any) {
      setTrainError(err?.response?.data?.detail || "ML model training failed.");
    } finally {
      setTrainingLoading(false);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDataset || !selectedModelName) return;
    setPredictLoading(true);
    try {
      const res = await mlApi.predict({
        dataset_id: activeDataset.id,
        model_name: selectedModelName,
        features: simulatorInputs
      });
      setPredictResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setPredictLoading(false);
    }
  };

  const handleRunClustering = async () => {
    if (!activeDataset || selectedFeatures.length === 0) return;
    setClusterLoading(true);
    try {
      const res = await mlApi.clustering(activeDataset.id, {
        feature_cols: selectedFeatures,
        n_clusters: nClusters
      });
      setClusterResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setClusterLoading(false);
    }
  };

  if (!activeDataset) {
    return <EmptyState title="No Dataset Yet" description="Upload your first dataset to start discovering intelligence." />;
  }

  if (isProfileLoading || !profile) {
    return <LoadingSpinner message="Initializing ML Studio & Model Architecture..." />;
  }

  const numericFeatures = profile.numeric_stats.map(ns => ns.name);
  const activeModel = trainResult?.trained_models.find(m => m.model_name === selectedModelName);

  const featImpData = activeModel?.feature_importances
    ? Object.entries(activeModel.feature_importances).map(([name, imp]) => ({
        name,
        importance: Math.round(imp * 1000) / 10
      }))
    : [];

  const CLUSTER_COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#6366F1'];

  return (
    <div className="space-y-8 pb-16 animate-in-scale max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
            <Cpu className="w-3.5 h-3.5" /> Automated Machine Learning
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ML Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Train, evaluate, benchmark, and simulate predictive models in real time.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#07090E] rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('supervised')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'supervised'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Supervised Models
          </button>
          <button
            onClick={() => setActiveTab('clustering')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'clustering'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            K-Means Clustering
          </button>
        </div>
      </div>

      {activeTab === 'supervised' ? (
        <div className="space-y-7">
          {/* Large Central Configuration Card */}
          <div className="glass-card-glow p-8 rounded-3xl space-y-6 relative overflow-hidden">
            <div className="border-b border-white/[0.08] pb-4">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Machine Learning Studio Configuration
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Define target parameters and train 4 algorithms simultaneously</p>
            </div>

            <form onSubmit={handleTrain} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Target Variable</label>
                  <select
                    value={targetCol}
                    onChange={(e) => setTargetCol(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-[#07090E] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Target Variable...</option>
                    {activeDataset.column_names.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Problem Type</label>
                  <select
                    value={taskType}
                    onChange={(e: any) => {
                      setTaskType(e.target.value);
                      setTrainResult(null);
                    }}
                    className="w-full px-4 py-2.5 bg-[#07090E] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="regression">Regression (Continuous Output)</option>
                    <option value="classification">Classification (Categories / Discrete)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={trainingLoading || !targetCol || selectedFeatures.length === 0}
                    className="w-full py-3 btn-ai-primary text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{trainingLoading ? "Training Models..." : "Run Analysis →"}</span>
                  </button>
                </div>
              </div>

              {/* Feature Pills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Features ({selectedFeatures.length} selected)
                  </label>
                  <span className="text-[11px] text-purple-400">Click to toggle variables</span>
                </div>

                <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-[#07090E]/80 border border-white/[0.06] max-h-32 overflow-y-auto">
                  {activeDataset.column_names.filter(c => c !== targetCol).map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => {
                        if (selectedFeatures.includes(col)) {
                          setSelectedFeatures(selectedFeatures.filter(f => f !== col));
                        } else {
                          setSelectedFeatures([...selectedFeatures, col]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedFeatures.includes(col)
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {trainError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{trainError}</span>
            </div>
          )}

          {trainingLoading && (
            <LoadingSpinner message="Training Regression & Classification Algorithms..." subMessage="Fitting Linear Models, Decision Trees, Random Forests, and Gradient Boosting" />
          )}

          {/* Model Benchmark Leaderboard */}
          {trainResult && (
            <div className="space-y-7">
              <div className="glass-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      AutoML Model Benchmark Leaderboard
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{trainResult.recommendation}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    Best: {trainResult.best_model_name}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="pb-3 font-semibold">Model Architecture</th>
                        {taskType === 'regression' ? (
                          <>
                            <th className="pb-3 font-semibold">R² Score</th>
                            <th className="pb-3 font-semibold">RMSE</th>
                            <th className="pb-3 font-semibold">MAE</th>
                            <th className="pb-3 font-semibold">Train Score</th>
                          </>
                        ) : (
                          <>
                            <th className="pb-3 font-semibold">Accuracy</th>
                            <th className="pb-3 font-semibold">F1-Score</th>
                            <th className="pb-3 font-semibold">Precision</th>
                            <th className="pb-3 font-semibold">Recall</th>
                          </>
                        )}
                        <th className="pb-3 font-semibold text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] font-mono">
                      {trainResult.trained_models.map((m) => (
                        <tr
                          key={m.model_name}
                          className={`hover:bg-white/[0.03] transition-colors ${
                            selectedModelName === m.model_name ? 'bg-purple-600/15' : ''
                          }`}
                        >
                          <td className="py-3.5 font-sans font-semibold text-white flex items-center gap-2">
                            <span>{m.model_name}</span>
                            {m.is_best && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                TOP RANK
                              </span>
                            )}
                          </td>
                          {taskType === 'regression' ? (
                            <>
                              <td className="py-3.5 text-purple-300 font-bold">{m.metrics.r2_score?.toFixed(3) ?? '-'}</td>
                              <td className="py-3.5 text-slate-300">{m.metrics.rmse?.toFixed(2) ?? '-'}</td>
                              <td className="py-3.5 text-slate-300">{m.metrics.mae?.toFixed(2) ?? '-'}</td>
                              <td className="py-3.5 text-slate-400">{m.metrics.train_score?.toFixed(3) ?? '-'}</td>
                            </>
                          ) : (
                            <>
                              <td className="py-3.5 text-purple-300 font-bold">{m.metrics.accuracy ? `${(m.metrics.accuracy * 100).toFixed(1)}%` : '-'}</td>
                              <td className="py-3.5 text-slate-300">{m.metrics.f1_score?.toFixed(3) ?? '-'}</td>
                              <td className="py-3.5 text-slate-300">{m.metrics.precision?.toFixed(3) ?? '-'}</td>
                              <td className="py-3.5 text-slate-300">{m.metrics.recall?.toFixed(3) ?? '-'}</td>
                            </>
                          )}
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => setSelectedModelName(m.model_name)}
                              className={`px-3 py-1 rounded-xl text-xs font-sans font-semibold transition-colors ${
                                selectedModelName === m.model_name
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white/[0.04] text-slate-300 hover:text-white'
                              }`}
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Feature Importance & Diagnostics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-3xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
                    Feature Importances ({selectedModelName})
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-4">Relative predictive weight per input attribute</p>

                  {featImpData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={featImpData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis type="number" stroke="#64748B" fontSize={10} unit="%" />
                          <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={100} />
                          <Tooltip contentStyle={{ backgroundColor: '#0D111A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                          <Bar dataKey="importance" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">
                      Feature importances computed during ensemble training.
                    </div>
                  )}
                </div>

                <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
                      Model Diagnostics & AI Explanation
                    </h3>
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">{activeModel?.ai_explanation}</p>

                    {activeModel?.confusion_matrix && (
                      <div className="p-4 rounded-2xl bg-[#07090E] border border-white/[0.06] mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Confusion Matrix:</span>
                        <div className="mt-2 font-mono text-xs text-purple-300 space-y-1">
                          {activeModel.confusion_matrix.map((row, i) => (
                            <div key={i} className="flex gap-4">
                              {row.map((val, j) => (
                                <span key={j} className="w-12 text-center py-1 bg-white/[0.04] rounded-lg">{val}</span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200">
                    <p className="font-bold mb-0.5">Production Ready:</p>
                    <p className="text-[11px] text-slate-300">Model loaded in memory. Test live parameter scenarios in the simulator below.</p>
                  </div>
                </div>
              </div>

              {/* Real-time Interactive Prediction Simulator */}
              <div className="glass-card-glow p-6 sm:p-8 rounded-3xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Live Prediction Simulator ({selectedModelName})</h3>
                      <p className="text-[11px] text-slate-400">Adjust features to compute instant predictions</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePredict} className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedFeatures.map((feat) => (
                      <div key={feat}>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1 truncate" title={feat}>
                          {feat}
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={simulatorInputs[feat] ?? ''}
                          onChange={(e) => setSimulatorInputs({ ...simulatorInputs, [feat]: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={predictLoading}
                    className="btn-ai-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{predictLoading ? "Simulating..." : "Generate Live Prediction"}</span>
                  </button>
                </form>

                {/* Prediction Output Box */}
                {predictResult && (
                  <div className="p-5 rounded-2xl bg-[#07090E] border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-400">Predicted Target:</span>
                      <p className="text-3xl font-black text-white font-mono mt-0.5">
                        {String(predictResult.prediction)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{predictResult.ai_explanation}</p>
                    </div>

                    {predictResult.confidence_level && (
                      <div className="px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-right">
                        <span className="text-[10px] text-purple-300 font-semibold uppercase">Confidence:</span>
                        <p className="text-sm font-bold text-white">{predictResult.confidence_level}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* K-Means Clustering Section */
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Unsupervised K-Means Clustering Studio
                </h2>
                <p className="text-xs text-slate-400">Discover hidden cohort segments using unsupervised PCA clustering</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Clusters (k):</span>
                  <select
                    value={nClusters}
                    onChange={(e) => setNClusters(Number(e.target.value))}
                    className="px-3 py-1.5 bg-[#07090E] border border-white/[0.08] rounded-xl text-xs text-white"
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map(k => (
                      <option key={k} value={k}>k = {k}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRunClustering}
                  disabled={clusterLoading}
                  className="btn-ai-primary px-4 py-2 text-xs font-bold flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{clusterLoading ? "Fitting Clusters..." : "Run Clustering"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Numerical Variables:
              </label>
              <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-[#07090E]/60 border border-white/[0.06] max-h-28 overflow-y-auto">
                {numericFeatures.map(col => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => {
                      if (selectedFeatures.includes(col)) {
                        setSelectedFeatures(selectedFeatures.filter(f => f !== col));
                      } else {
                        setSelectedFeatures([...selectedFeatures, col]);
                      }
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      selectedFeatures.includes(col)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {clusterResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-3xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
                    2D PCA Cluster Projection Map
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-3">Dimensionality reduction visualizing cohort boundaries</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="x" stroke="#64748B" fontSize={10} name="PCA 1" />
                        <YAxis dataKey="y" stroke="#64748B" fontSize={10} name="PCA 2" />
                        <Tooltip contentStyle={{ backgroundColor: '#0D111A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                        <Scatter data={clusterResult.pca_coordinates}>
                          {clusterResult.pca_coordinates.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CLUSTER_COLORS[entry.cluster % CLUSTER_COLORS.length]} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {clusterResult.elbow_data && (
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
                      Elbow Curve (Inertia Analysis)
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-3">Inertia decrease across cluster quantities</p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={clusterResult.elbow_data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="k" stroke="#64748B" fontSize={10} unit=" clusters" />
                          <YAxis stroke="#64748B" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#0D111A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                          <Line type="monotone" dataKey="inertia" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Cluster Profiles Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {clusterResult.clusters.map((c, i) => (
                  <div key={c.cluster_id} className="glass-card p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: CLUSTER_COLORS[i % CLUSTER_COLORS.length] }}
                        ></span>
                        {c.cluster_name}
                      </h4>
                      <span className="text-[10px] text-purple-400">{c.percentage}%</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">{c.ai_description}</p>
                    <div className="space-y-1 text-[11px] font-mono border-t border-white/[0.06] pt-2 text-slate-400">
                      {Object.entries(c.feature_means).slice(0, 3).map(([f, m]) => (
                        <div key={f} className="flex justify-between">
                          <span className="truncate max-w-[120px]">{f}:</span>
                          <span className="text-white font-bold">{m.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
