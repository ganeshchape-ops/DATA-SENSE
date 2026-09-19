import React from 'react';
import { Link } from 'react-router-dom';
import { Code } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/90 bg-white text-slate-500 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-6">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-2.5">
            <Logo size="md" />
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              From Data to Intelligence. Production-grade AI data analytics platform with dynamic dataset understanding, AutoML, and automated reporting.
            </p>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Data
            </h4>
            <ul className="space-y-1 text-slate-500">
              <li><Link to="/upload" className="hover:text-indigo-600 transition-colors">Datasets</Link></li>
              <li><Link to="/explorer" className="hover:text-indigo-600 transition-colors">Data Explorer</Link></li>
              <li><Link to="/cleaning" className="hover:text-indigo-600 transition-colors">Data Cleaning</Link></li>
            </ul>
          </div>

          {/* Analyze & AI */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Analyze & AI
            </h4>
            <ul className="space-y-1 text-slate-500">
              <li><Link to="/statistics" className="hover:text-indigo-600 transition-colors">Analytics & Statistics</Link></li>
              <li><Link to="/visualization" className="hover:text-indigo-600 transition-colors">Visualization</Link></li>
              <li><Link to="/correlation" className="hover:text-indigo-600 transition-colors">Correlation</Link></li>
              <li><Link to="/insights" className="hover:text-indigo-600 transition-colors">AI Insights</Link></li>
              <li><Link to="/ml" className="hover:text-indigo-600 transition-colors">ML Studio</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Output & System
            </h4>
            <ul className="space-y-1 text-slate-500">
              <li><Link to="/reports" className="hover:text-indigo-600 transition-colors">Reports</Link></li>
              <li><Link to="/settings" className="hover:text-indigo-600 transition-colors">Settings</Link></li>
              <li><Link to="/admin" className="hover:text-indigo-600 transition-colors">Admin Panel</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© 2026 AI DataSense. All rights reserved.</p>
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <Code className="w-3.5 h-3.5 text-indigo-600" />
            <span>Developed by <strong>Ganesh Chape</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
