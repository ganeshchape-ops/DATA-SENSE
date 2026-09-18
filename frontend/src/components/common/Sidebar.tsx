import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Upload, Sparkles, Filter, Database,
  BarChart3, Binary, Network, Brain, Cpu,
  TrendingUp, AlertTriangle, FileText, History, Settings
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const { activeDataset, profile } = useDataset();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Upload Dataset', path: '/dashboard/upload', icon: Upload },
    { label: 'Data Profiler', path: '/dashboard/profile', icon: Database },
    { label: 'Data Cleaning', path: '/dashboard/cleaning', icon: Filter },
    { label: 'Data Explorer', path: '/dashboard/explorer', icon: Binary },
    { label: 'Visualizations', path: '/dashboard/visualize', icon: BarChart3 },
    { label: 'Statistical Tests', path: '/dashboard/statistics', icon: Sparkles },
    { label: 'Correlation Matrix', path: '/dashboard/correlation', icon: Network },
    { label: 'AI Insights', path: '/dashboard/ai-insights', icon: Brain, badge: 'AI' },
    { label: 'ML Studio', path: '/dashboard/ml-studio', icon: Cpu, badge: 'AutoML' },
    { label: 'Forecasting', path: '/dashboard/forecasting', icon: TrendingUp },
    { label: 'Anomaly Detection', path: '/dashboard/anomaly', icon: AlertTriangle },
    { label: 'Reports & Export', path: '/dashboard/reports', icon: FileText },
    { label: 'Dataset History', path: '/dashboard/history', icon: History },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Navigation List */}
      <div className="overflow-y-auto py-4 px-3 space-y-1">
        {/* Active Dataset Status Widget */}
        {activeDataset && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/20 shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-indigo-300 font-semibold mb-1">
              <span className="uppercase tracking-wider">Active Dataset</span>
              {profile && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  {profile.data_quality_score}% Health
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-white truncate">{activeDataset.name}</p>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
              <span>{activeDataset.rows.toLocaleString()} Rows</span>
              <span>•</span>
              <span>{activeDataset.columns} Columns</span>
            </div>
          </div>
        )}

        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Analytics & Intelligence
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`
              }
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>AI DataSense v1.0</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>
    </aside>
  );
};
