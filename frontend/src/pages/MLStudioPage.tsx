import React, { useState, useEffect } from 'react';
import {
  Cpu, Sparkles, CheckCircle2, Play, Trophy, Activity,
  Sliders, ArrowRight, Layers, BarChart3, AlertCircle, RefreshCw
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
      // Features except target
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

      // Initialize simulator inputs with average values from profile
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
    return <EmptyState title="No Dataset Selected" description="Please select a dataset to train Machine Learning models." />;
  }

  if (isProfileLoading || !profile) {
    return <LoadingSpinner message="Initializing ML Studio..." />;
  }

  const numericFeatures = profile.numeric_stats.map(ns => ns.name);
  const activeModel = trainResult?.trained_models.find(m => m.model_name === selectedModelName);

  // Prepare feature importance bar chart data
  const featImpData = activeModel?.feature_importances
    ? Object.entries(activeModel.feature_importances).map(([name, imp]) => ({
        name,
        importance: Math.round(imp * 1000) / 10
      }))
    : [];

  const CLUSTER_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            AutoML Studio & Live Prediction Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated regression, classification, clustering, model benchmarking, and real-time prediction simulator.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('supervised')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'supervised'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Supervised Models (Reg / Clf)
          </button>
          <button
            onClick={() => setActiveTab('clustering')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'clustering'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            K-Means Clustering
          </button>
        </div>
      </div>

      {activeTab === 'supervised' ? (
        <div className="space-y-6">
          {/* Training Configuration Box */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <form onSubmit={handleTrain} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Problem Type</label>
                  <select
                    value={taskType}
                    onChange={(e: any) => {
                      setTaskType(e.target.value);
                      setTrainResult(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="regression">Regression (Continuous Target)</option>
                    <option value="classification">Classification (Categorical / Binary)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Variable (Y)</label>
                  <select
                    value={targetCol}
                    onChange={(e) => setTargetCol(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Target...</option>
                    {activeDataset.column_names.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={trainingLoading || !targetCol || selectedFeatures.length === 0}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {trainingLoading ? "Training 4 Models..." : "Train & Benchmark Models"}
                  </button>
                </div>
              </div>

              {/* Feature Checkboxes */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">
                  Select Features for Training ({selectedFeatures.length} selected):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
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
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        selectedFeatures.includes(col)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
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
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{trainError}</span>
            </div>
          )}

          {trainingLoading && (
            <LoadingSpinner message="Training Regression & Classification Algorithms..." subMessage="Fitting Linear Models, Decision Trees, Random Forests, and Gradient Boosting" />
          )}

          {/* Model Benchmark Leaderboard */}
          {trainResult && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      AutoML Model Benchmark Leaderboard
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">{trainResult.recommendation}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Best: {trainResult.best_model_name}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                        <th className="pb-2.5 font-semibold">Model Architecture</th>
                        {taskType === 'regression' ? (
                          <>
                            <th className="pb-2.5 font-semibold">R² Score</th>
                            <th className="pb-2.5 font-semibold">RMSE</th>
                            <th className="pb-2.5 font-semibold">MAE</th>
                            <th className="pb-2.5 font-semibold">Train Score</th>
                          </>
                        ) : (
                          <>
                            <th className="pb-2.5 font-semibold">Accuracy</th>
                            <th className="pb-2.5 font-semibold">F1-Score</th>
                            <th className="pb-2.5 font-semibold">Precision</th>
                            <th className="pb-2.5 font-semibold">Recall</th>
                          </>
                        )}
                        <th className="pb-2.5 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {trainResult.trained_models.map((m) => (
                        <tr
                          key={m.model_name}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            selectedModelName === m.model_name ? 'bg-indigo-600/10' : ''
                          }`}
                        >
                          <td className="py-3 font-sans font-semibold text-white flex items-center gap-2">
                            <span>{m.model_name}</span>
                            {m.is_best && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                TOP RATED
                              </span>
                            )}
                          </td>
                          {taskType === 'regression' ? (
                            <>
                              <td className="py-3 text-indigo-300 font-bold">{m.metrics.r2_score?.toFixed(3) ?? '-'}</td>
                              <td className="py-3 text-slate-300">{m.metrics.rmse?.toFixed(2) ?? '-'}</td>
                              <td className="py-3 text-slate-300">{m.metrics.mae?.toFixed(2) ?? '-'}</td>
                              <td className="py-3 text-slate-400">{m.metrics.train_score?.toFixed(3) ?? '-'}</td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 text-indigo-300 font-bold">{m.metrics.accuracy ? `${(m.metrics.accuracy * 100).toFixed(1)}%` : '-'}</td>
                              <td className="py-3 text-slate-300">{m.metrics.f1_score?.toFixed(3) ?? '-'}</td>
                              <td className="py-3 text-slate-300">{m.metrics.precision?.toFixed(3) ?? '-'}</td>
                              <td className="py-3 text-slate-300">{m.metrics.recall?.toFixed(3) ?? '-'}</td>
                            </>
                          )}
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setSelectedModelName(m.model_name)}
                              className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold transition-colors ${
                                selectedModelName === m.model_name
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-800 text-slate-300 hover:text-white'
                              }`}
                            >
                              Inspect
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
                {/* Feature Importance Chart */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Feature Importances ({selectedModelName})
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-4">Relative predictive weight per input attribute</p>

                  {featImpData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={featImpData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis type="number" stroke="#64748B" fontSize={10} unit="%" />
                          <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={100} />
                          <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                          <Bar dataKey="importance" fill="#6366F1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">
                      Feature importances computed during tree ensemble training.
                    </div>
                  )}
                </div>

                {/* Model AI Explanation & Actual vs Predicted Preview */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Model Evaluation & Diagnostics
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-3">{activeModel?.ai_explanation}</p>

                    {activeModel?.confusion_matrix && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Confusion Matrix:</span>
                        <div className="mt-2 font-mono text-xs text-indigo-300 space-y-1">
                          {activeModel.confusion_matrix.map((row, i) => (
                            <div key={i} className="flex gap-4">
                              {row.map((val, j) => (
                                <span key={j} className="w-12 text-center py-1 bg-slate-900 rounded">{val}</span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200">
                    <p className="font-semibold mb-0.5">Production Ready:</p>
                    <p className="text-[11px] text-slate-300">Model has been loaded into memory. Test real-time live scenarios in the simulator below.</p>
                  </div>
                </div>
              </div>

              {/* Real-time Interactive Prediction Simulator */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Live Prediction Simulator ({selectedModelName})</h3>
                      <p className="text-[11px] text-slate-400">Adjust feature values to calculate real-time AI predictions</p>
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
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={predictLoading}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 hover:scale-[1.01]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {predictLoading ? "Simulating..." : "Generate Live Prediction"}
                  </button>
                </form>

                {/* Prediction Output Box */}
                {predictResult && (
                  <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400">Predicted Output Value:</span>
                      <p className="text-2xl font-black text-white font-mono mt-0.5">
                        {String(predictResult.prediction)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{predictResult.ai_explanation}</p>
                    </div>

                    {predictResult.confidence_level && (
                      <div className="px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-right">
                        <span className="text-[10px] text-indigo-300 font-semibold uppercase">Confidence:</span>
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
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Unsupervised K-Means Clustering Studio
                </h2>
                <p className="text-[11px] text-slate-400">Discover hidden customer or entity cohorts using unsupervised learning</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Number of Clusters (k):</span>
                  <select
                    value={nClusters}
                    onChange={(e) => setNClusters(Number(e.target.value))}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map(k => (
                      <option key={k} value={k}>k = {k}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRunClustering}
                  disabled={clusterLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {clusterLoading ? "Fitting Clusters..." : "Run Clustering"}
                </button>
              </div>
            </div>

            {/* Feature Selection for Clustering */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                Select Numerical Variables for Clustering:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
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
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      selectedFeatures.includes(col)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
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
              {/* Elbow & PCA Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2D PCA Cluster Scatter Map */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    2D PCA Cluster Projection Map
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-3">Dimensionality reduction visualizing cohort boundaries</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="x" stroke="#64748B" fontSize={10} name="PCA 1" />
                        <YAxis dataKey="y" stroke="#64748B" fontSize={10} name="PCA 2" />
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                        <Scatter data={clusterResult.pca_coordinates}>
                          {clusterResult.pca_coordinates.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CLUSTER_COLORS[entry.cluster % CLUSTER_COLORS.length]} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Elbow Curve */}
                {clusterResult.elbow_data && (
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Elbow Method (Optimal k Inertia Curve)
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-3">Inertia decrease across cluster quantities</p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={clusterResult.elbow_data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis dataKey="k" stroke="#64748B" fontSize={10} unit=" clusters" />
                          <YAxis stroke="#64748B" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                          <Line type="monotone" dataKey="inertia" stroke="#EC4899" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Cluster Profiles Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {clusterResult.clusters.map((c, i) => (
                  <div key={c.cluster_id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CLUSTER_COLORS[i % CLUSTER_COLORS.length] }}
                        ></span>
                        {c.cluster_name}
                      </h4>
                      <span className="text-[10px] text-slate-400">{c.percentage}% ({c.size} rows)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mb-3">{c.ai_description}</p>
                    <div className="space-y-1 text-[10px] font-mono border-t border-slate-800 pt-2 text-slate-400">
                      {Object.entries(c.feature_means).slice(0, 4).map(([f, m]) => (
                        <div key={f} className="flex justify-between">
                          <span className="truncate max-w-[120px]">{f}:</span>
                          <span className="text-slate-200 font-bold">{m.toLocaleString()}</span>
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
