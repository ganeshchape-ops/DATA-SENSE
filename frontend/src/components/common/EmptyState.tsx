import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, UploadCloud, Database } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Dataset Yet",
  description = "Upload your first dataset to start discovering intelligence.",
  actionText = "Upload Dataset",
  actionLink = "/upload"
}) => {
  const { loadSampleDataset, isLoading } = useDataset();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl glass-card max-w-lg mx-auto my-12 relative overflow-hidden group">
      {/* Background glow orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center mb-5 text-purple-400 shadow-lg shadow-purple-500/10 group-hover:scale-110 transition-transform duration-300">
        <Sparkles className="w-8 h-8 animate-ai-pulse" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
        <Link
          to={actionLink}
          className="btn-ai-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{actionText}</span>
        </Link>

        <button
          onClick={() => loadSampleDataset('student')}
          disabled={isLoading}
          className="btn-ai-secondary px-4 py-2.5 text-xs font-semibold flex items-center gap-2"
        >
          <Database className="w-3.5 h-3.5 text-purple-400" />
          <span>{isLoading ? "Loading..." : "Load Demo Dataset"}</span>
        </button>
      </div>
    </div>
  );
};
