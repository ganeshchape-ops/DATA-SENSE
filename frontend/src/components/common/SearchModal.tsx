import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, UploadCloud, Database, Sparkles, Wand2,
  BarChart3, Cpu, Activity, AlertTriangle, MessageSquareCode,
  FileText, History, Settings, X, ArrowRight
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { datasets } = useDataset();

  const navigationItems = [
    { title: 'Dashboard', desc: 'KPI metrics, domain intelligence and dynamic charts', path: '/dashboard', icon: LayoutDashboard, category: 'Overview' },
    { title: 'Upload Dataset', desc: 'Drag-and-drop CSV, Excel or JSON files', path: '/upload', icon: UploadCloud, category: 'Data' },
    { title: 'Data Explorer', desc: 'Spreadsheet tabular view and filter engine', path: '/explorer', icon: Database, category: 'Data' },
    { title: 'Data Cleaning', desc: 'Missing value imputation & outlier capping', path: '/cleaning', icon: Wand2, category: 'Data' },
    { title: 'Analytics & Statistics', desc: 'Hypothesis testing, ANOVA & moments', path: '/statistics', icon: BarChart3, category: 'Analytics' },
    { title: 'ML Studio', desc: 'Train classification & regression models with live simulation', path: '/ml', icon: Cpu, category: 'Intelligence' },
    { title: 'Time-Series Forecasting', desc: 'Predictive horizon projections with confidence bands', path: '/forecasting', icon: Activity, category: 'Intelligence' },
    { title: 'Anomaly Detection', desc: 'Isolation Forest & outlier risk identification', path: '/anomaly', icon: AlertTriangle, category: 'Intelligence' },
    { title: 'AI Insights', desc: 'Strategic SWOT analysis & executive summaries', path: '/insights', icon: Sparkles, category: 'Intelligence' },
    { title: 'AI Data Chat', desc: 'Ask natural language questions on your dataset', path: '/chat', icon: MessageSquareCode, category: 'Assistant' },
    { title: 'Executive Reports', desc: 'Download publication-grade PDF & Excel reports', path: '/reports', icon: FileText, category: 'Reports' },
    { title: 'Activity Logs', desc: 'History of previous model runs and uploads', path: '/history', icon: History, category: 'System' },
    { title: 'Settings', desc: 'Preferences, security and profile controls', path: '/settings', icon: Settings, category: 'System' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNav = navigationItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDatasets = datasets.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in-scale">
      <div className="relative w-full max-w-2xl glass-dropdown rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-white/[0.08] gap-3">
          <Search className="w-5 h-5 text-purple-400" />
          <input
            type="text"
            placeholder="Search analytics, datasets, models, reports... (⌘K / Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-4">
          {/* Datasets Section */}
          {filteredDatasets.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase text-purple-400 tracking-wider px-3 mb-1.5">
                Datasets ({filteredDatasets.length})
              </div>
              <div className="space-y-1">
                {filteredDatasets.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleSelect('/explorer')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left hover:bg-purple-600/15 group transition-colors border border-transparent hover:border-purple-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300">
                          {d.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {d.rows.toLocaleString()} rows • {d.columns} cols • {d.file_type.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Section */}
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-3 mb-1.5">
              Capabilities & Workspaces
            </div>
            <div className="space-y-1">
              {filteredNav.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left hover:bg-white/[0.04] group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/[0.04] text-slate-300 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#07090E]/80 border-t border-white/[0.08] text-[11px] text-slate-400 flex items-center justify-between">
          <span>Click to open • Esc to close</span>
          <span className="font-mono text-purple-400">✦ AI DataSense</span>
        </div>
      </div>
    </div>
  );
};
