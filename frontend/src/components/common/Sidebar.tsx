import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UploadCloud, Database, Wand2, BarChart3,
  PieChart, Cpu, Sparkles, FileText, Settings,
  LogOut, ChevronRight, HelpCircle, Network, Code, ShieldCheck
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: any;
  badge?: string;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const { activeDataset, profile } = useDataset();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navSections: NavSection[] = [
    {
      heading: "Overview",
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      heading: "Data",
      items: [
        { label: 'Upload Dataset', path: '/upload', icon: UploadCloud },
        { label: 'Data Preview', path: '/explorer', icon: Database },
        { label: 'Data Quality & Profiler', path: '/profiler', icon: ShieldCheck },
        { label: 'Data Cleaning', path: '/cleaning', icon: Wand2 },
      ]
    },
    {
      heading: "Analyze",
      items: [
        { label: 'Analytics & Statistics', path: '/statistics', icon: BarChart3 },
        { label: 'Visualization', path: '/visualization', icon: PieChart },
        { label: 'Correlation', path: '/correlation', icon: Network },
      ]
    },
    {
      heading: "AI",
      items: [
        { label: 'AI Insights', path: '/insights', icon: Sparkles, badge: 'AI' },
        { label: 'ML Studio', path: '/ml', icon: Cpu, badge: 'AutoML' },
      ]
    },
    {
      heading: "Output",
      items: [
        { label: 'Reports', path: '/reports', icon: FileText },
      ]
    },
    {
      heading: "Settings",
      items: [
        { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'Help & Docs', path: '/settings', icon: HelpCircle },
      ]
    }
  ];

  return (
    <aside
      className={`fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 border-r border-slate-200/90 bg-white flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Mobile Branding Bar */}
      {mobileOpen && (
        <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <Logo size="sm" />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {/* Active Dataset Status Widget */}
        {activeDataset && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-[9px] font-bold text-indigo-600 mb-1">
              <span className="uppercase tracking-wider">ACTIVE DATASET</span>
              {profile && (
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  {profile.data_quality_score}% Score
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-800 truncate">{activeDataset.name}</p>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-medium">
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
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              {section.heading}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path + item.label}
                    to={item.path}
                    end={item.path === '/dashboard'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-indigo-50/80 text-indigo-700 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Developer Credit & Logout */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 space-y-2">
        {/* Developer Attribution */}
        <div className="px-3 py-1.5 rounded-lg bg-indigo-50/60 border border-indigo-100/80 text-[10px] text-indigo-900 flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">Developed by <strong>Ganesh Chape</strong></span>
        </div>

        {/* Logout Action */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
