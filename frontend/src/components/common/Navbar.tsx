import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain, Database, ChevronDown, User as UserIcon,
  LogOut, Sparkles, Plus, HardDrive, Cpu, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDataset } from '../../context/DatasetContext';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { datasets, activeDataset, setActiveDataset } = useDataset();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [datasetDropdownOpen, setDatasetDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Logo */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white tracking-tight leading-tight flex items-center gap-1.5">
              AI DataSense
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-slate-400">Intelligence & ML Platform</span>
          </div>
        </Link>

        {/* Dataset Switcher in Navbar */}
        {isAuthenticated && (
          <div className="relative">
            <button
              onClick={() => setDatasetDropdownOpen(!datasetDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 hover:border-indigo-500/50 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[150px] truncate">
                {activeDataset ? activeDataset.name : "No Dataset Selected"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {datasetDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setDatasetDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center border-b border-slate-800 mb-1">
                  <span>Your Datasets ({datasets.length})</span>
                  <Link
                    to="/dashboard/upload"
                    onClick={() => setDatasetDropdownOpen(false)}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 text-[11px]"
                  >
                    <Plus className="w-3 h-3" /> New
                  </Link>
                </div>

                <div className="max-h-56 overflow-y-auto">
                  {datasets.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-slate-500">
                      No datasets loaded yet.
                    </div>
                  ) : (
                    datasets.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setActiveDataset(d);
                          setDatasetDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                          activeDataset?.id === d.id ? 'bg-indigo-600/15 text-indigo-300 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate">{d.name}</p>
                          <span className="text-[10px] text-slate-500">{d.rows.toLocaleString()} rows • {d.columns} cols</span>
                        </div>
                        {activeDataset?.id === d.id && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard/upload"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload Data
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-medium text-slate-200 hidden md:inline max-w-[120px] truncate">
                  {user?.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl py-2 z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/dashboard/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    Account Settings
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
