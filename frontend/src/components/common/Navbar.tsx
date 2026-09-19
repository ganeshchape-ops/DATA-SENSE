import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles, Database, ChevronDown, User as UserIcon,
  LogOut, Plus, Search, Bell, Shield, Settings as SettingsIcon,
  Menu, Activity, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDataset } from '../../context/DatasetContext';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationsCount = 3,
  onToggleSidebar,
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { datasets, activeDataset, setActiveDataset } = useDataset();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [datasetDropdownOpen, setDatasetDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const centerNavLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Datasets', path: '/upload' },
    { label: 'Data Explorer', path: '/explorer' },
    { label: 'Analytics', path: '/statistics' },
    { label: 'AI Insights', path: '/insights' },
    { label: 'ML Studio', path: '/ml' },
    { label: 'Reports', path: '/reports' },
  ];

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs transition-colors">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-3 lg:gap-6">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/dashboard" className="group">
          <Logo size="md" />
        </Link>

        {/* Dataset Switcher in Header */}
        {isAuthenticated && (
          <div className="relative hidden md:block">
            <button
              onClick={() => setDatasetDropdownOpen(!datasetDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span className="max-w-[150px] truncate">
                {activeDataset ? activeDataset.name : "Select Dataset"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {datasetDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in-scale"
                onMouseLeave={() => setDatasetDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center border-b border-slate-100 mb-1">
                  <span>Datasets ({datasets.length})</span>
                  <Link
                    to="/upload"
                    onClick={() => setDatasetDropdownOpen(false)}
                    className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5 text-[10px]"
                  >
                    <Plus className="w-3 h-3" /> Upload
                  </Link>
                </div>

                <div className="max-h-56 overflow-y-auto">
                  {datasets.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-slate-400">
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
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          activeDataset?.id === d.id ? 'bg-indigo-50/70 text-indigo-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate font-semibold">{d.name}</p>
                          <span className="text-[10px] text-slate-400">{d.rows.toLocaleString()} rows • {d.columns} cols</span>
                        </div>
                        {activeDataset?.id === d.id && (
                          <Check className="w-4 h-4 text-indigo-600" />
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

      {/* Center Navigation Links */}
      <nav className="hidden xl:flex items-center gap-1">
        {centerNavLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/dashboard'}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'text-indigo-700 bg-indigo-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Right: Global Search, Notifications, User Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 text-xs text-slate-500 hover:text-slate-900 transition-all shadow-xs"
          title="Search Platform (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline text-[11px] font-medium">Search...</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9px] text-slate-500">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Bell */}
        {isAuthenticated && onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            )}
          </button>
        )}

        {/* User Profile Menu */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-full bg-slate-50 border border-slate-200 hover:border-indigo-400 transition-all shadow-xs"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {user?.name ? user.name[0].toUpperCase() : 'G'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                {user?.name || 'Ganesh'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in-scale"
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Ganesh Chape'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'ganeshchape@gmail.com'}</p>
                  <span className="mt-1 inline-block px-2 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                    {user?.role || 'Lead Analyst'}
                  </span>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  My Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                  Settings & Preferences
                </Link>

                <Link
                  to="/admin"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Admin Panel (Developer)
                </Link>

                <Link
                  to="/history"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  Activity History
                </Link>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 btn-primary text-xs font-bold"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
