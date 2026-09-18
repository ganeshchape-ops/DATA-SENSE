import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UploadCloud, Database, Wand2, BarChart3,
  PieChart, BrainCircuit, Activity, AlertTriangle, Sparkles,
  MessageSquareCode, FileText, History, Settings, ShieldCheck,
  HelpCircle, User as UserIcon, LogOut, ChevronRight
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const { activeDataset, profile } = useDataset();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navSections = [
    {
      heading: "Main",
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Data Upload', path: '/upload', icon: UploadCloud },
        { label: 'Data Preview', path: '/explorer', icon: Database },
        { label: 'Data Cleaning', path: '/cleaning', icon: Wand2 },
      ]
    },
    {
      heading: "Analytics & ML",
      items: [
        { label: 'Analytics & Stats', path: '/statistics', icon: BarChart3 },
        { label: 'Visualizations', path: '/visualization', icon: PieChart },
        { label: 'Predictions (ML)', path: '/ml', icon: BrainCircuit, badge: 'AutoML' },
        { label: 'Forecasting', path: '/forecasting', icon: Activity },
        { label: 'Anomaly Detection', path: '/anomaly', icon: AlertTriangle },
      ]
    },
    {
      heading: "AI & Intelligence",
      items: [
        { label: 'AI Insights', path: '/insights', icon: Sparkles, badge: 'AI' },
        { label: 'AI Data Chat', path: '/chat', icon: MessageSquareCode, badge: 'Chat' },
        { label: 'Reports & Export', path: '/reports', icon: FileText },
        { label: 'History', path: '/history', icon: History },
      ]
    },
    {
      heading: "Management",
      items: [
        { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'Admin Dashboard', path: '/admin', icon: ShieldCheck },
      ]
    }
  ];

  return (
    <aside
      className={`fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Navigation Links Scroll Container */}
      <div className="overflow-y-auto py-3 px-3 space-y-4">
        {/* Active Dataset Status Widget */}
        {activeDataset && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 dark:text-indigo-400 mb-1">
              <span className="uppercase tracking-wider">Active Dataset</span>
              {profile && (
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                  {profile.data_quality_score}% Quality
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{activeDataset.name}</p>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <span>{activeDataset.rows.toLocaleString()} Rows</span>
              <span>•</span>
              <span>{activeDataset.columns} Cols</span>
              <span>•</span>
              <span className="uppercase">{activeDataset.file_type}</span>
            </div>
          </div>
        )}

        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-1.5">
              {section.heading}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/dashboard'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                          : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/80'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 group-[.active]:bg-white/20 group-[.active]:text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Profile / Quick Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-1">
        <NavLink
          to="/profile"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center gap-2 truncate">
            <UserIcon className="w-4 h-4 text-slate-400" />
            <span className="truncate">{user?.name || 'User Profile'}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </NavLink>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
