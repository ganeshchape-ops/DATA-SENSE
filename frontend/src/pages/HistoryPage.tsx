import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History, Database, Trash2, ArrowRight, Upload,
  Calendar, Layers, FileSpreadsheet, ShieldCheck
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { EmptyState } from '../components/common/EmptyState';

export const HistoryPage: React.FC = () => {
  const { datasets, activeDataset, selectDatasetById, deleteDataset } = useDataset();
  const navigate = useNavigate();

  if (datasets.length === 0) {
    return <EmptyState title="No Datasets in History" description="Upload a dataset or load a sample dataset to see your analytics history here." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Dataset History & Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your past uploaded and cleaned datasets ({datasets.length} Total)
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/upload')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
        >
          <Upload className="w-3.5 h-3.5" /> Upload Dataset
        </button>
      </div>

      {/* Dataset Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {datasets.map((d) => {
          const isActive = activeDataset?.id === d.id;
          return (
            <div
              key={d.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-950/40 to-slate-900 border-indigo-500/40 shadow-xl shadow-indigo-950/20 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white truncate max-w-[200px]">{d.name}</h3>
                      <span className="text-[10px] text-slate-400 uppercase">{d.file_type} format</span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      ACTIVE
                    </span>
                  ) : (
                    <button
                      onClick={() => selectDatasetById(d.id)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Make Active
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 my-3 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Rows</span>
                    <span className="font-bold text-white font-mono">{d.rows.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Cols</span>
                    <span className="font-bold text-white font-mono">{d.columns}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Size</span>
                    <span className="font-bold text-white font-mono">{Math.round(d.file_size / 1024)} KB</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-2 text-[11px] text-slate-500">
                <span>{new Date(d.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      selectDatasetById(d.id);
                      navigate('/dashboard/profile');
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Open Analysis <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteDataset(d.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete dataset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
