import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, UploadCloud, Database, Sparkles, Wand2,
  BarChart3, BrainCircuit, Activity, AlertTriangle, MessageSquareCode,
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
    { title: 'Dashboard Overview', desc: 'KPI metrics, revenue & sales charts', path: '/dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { title: 'Upload Dataset', desc: 'Drag-and-drop CSV, Excel or JSON files', path: '/upload', icon: UploadCloud, category: 'Data' },
    { title: 'Data Preview Explorer', desc: 'Spreadsheet tabular view and filter engine', path: '/explorer', icon: Database, category: 'Data' },
    { title: 'Data Cleaning & Quality', desc: 'Missing value imputation & outlier removal', path: '/cleaning', icon: Wand2, category: 'Data' },
    { title: 'Statistical Analysis', desc: 'Hypothesis testing, ANOVA & moments', path: '/statistics', icon: BarChart3, category: 'Analytics' },
    { title: 'AutoML Studio', desc: 'Train classification & regression models', path: '/ml', icon: BrainCircuit, category: 'Intelligence' },
    { title: 'Time-Series Forecasting', desc: '7 to 90 day seasonal trend projections', path: '/forecasting', icon: Activity, category: 'Intelligence' },
    { title: 'Anomaly Detection', desc: 'Isolation Forest & outlier risk detection', path: '/anomaly', icon: AlertTriangle, category: 'Intelligence' },
    { title: 'AI Strategic Insights', desc: 'SWOT analysis & executive summaries', path: '/insights', icon: Sparkles, category: 'Intelligence' },
    { title: 'AI Data Chat', desc: 'Ask natural language questions on your data', path: '/chat', icon: MessageSquareCode, category: 'AI Assistant' },
    { title: 'Executive Reports', desc: 'Download PDF & multi-sheet Excel reports', path: '/reports', icon: FileText, category: 'Reports' },
    { title: 'Analysis History', desc: 'Log of previous model runs and datasets', path: '/history', icon: History, category: 'Management' },
    { title: 'Settings & Security', desc: 'Notification preferences & profile details', path: '/settings', icon: Settings, category: 'System' },
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in-scale">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search analytics, datasets, models, reports... (Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4">
          {/* Datasets Section */}
          {filteredDatasets.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider px-3 mb-1">
                Datasets ({filteredDatasets.length})
              </div>
              <div className="space-y-1">
                {filteredDatasets.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleSelect('/explorer')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/40 group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {d.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {d.rows.toLocaleString()} rows • {d.columns} cols • {d.file_type.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Section */}
          <div>
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider px-3 mb-1">
              Modules & Capabilities
            </div>
            <div className="space-y-1">
              {filteredNav.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/60 group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Navigate with click • Esc to close</span>
          <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
            AI Insight Command Menu
          </span>
        </div>
      </div>
    </div>
  );
};
