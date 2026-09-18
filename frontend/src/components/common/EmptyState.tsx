import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Upload, Sparkles } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Dataset Selected",
  description = "Upload your CSV or Excel dataset or load a sample dataset with 1 click to unlock automated data profiling, machine learning, forecasting, and AI insights.",
  actionText = "Upload Dataset",
  actionLink = "/dashboard/upload"
}) => {
  const { loadSampleDataset, isLoading } = useDataset();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl max-w-xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
        <Database className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to={actionLink}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
        >
          <Upload className="w-4 h-4" />
          {actionText}
        </Link>

        <button
          onClick={() => loadSampleDataset('ecommerce')}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          {isLoading ? "Loading..." : "Try E-Commerce Sample"}
        </button>
      </div>
    </div>
  );
};
