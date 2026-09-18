import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Sparkles, Globe, Share2, Code2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                AI Insight
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              AI-Native Enterprise Intelligence & Predictive Analytics Platform. Transform raw datasets into executive insights, AutoML predictions, and strategic decisions in seconds.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                aria-label="GitHub"
              >
                <Code2 className="w-3.5 h-3.5" /> GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                aria-label="LinkedIn"
              >
                <Share2 className="w-3.5 h-3.5" /> LinkedIn
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                aria-label="X Twitter"
              >
                <Globe className="w-3.5 h-3.5" /> X (Twitter)
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-1.5">
              <li><Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard Overview</Link></li>
              <li><Link to="/statistics" className="hover:text-indigo-600 transition-colors">Statistical Analytics</Link></li>
              <li><Link to="/ml" className="hover:text-indigo-600 transition-colors">AutoML Predictions</Link></li>
              <li><Link to="/chat" className="hover:text-indigo-600 transition-colors">AI Data Chat</Link></li>
              <li><Link to="/reports" className="hover:text-indigo-600 transition-colors">Executive Reports</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-1.5">
              <li><a href="/docs" className="hover:text-indigo-600 transition-colors">API Documentation</a></li>
              <li><Link to="/upload" className="hover:text-indigo-600 transition-colors">Sample Datasets</Link></li>
              <li><a href="#help" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
              <li><a href="#faqs" className="hover:text-indigo-600 transition-colors">Platform FAQs</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-1.5">
              <li><a href="#about" className="hover:text-indigo-600 transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-indigo-600 transition-colors">Contact Support</a></li>
              <li><a href="#privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <p>© 2026 AI Insight. All Rights Reserved.</p>
          <p className="flex items-center gap-1 text-slate-500">
            Built with <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> AI + Machine Learning + React 19
          </p>
        </div>
      </div>
    </footer>
  );
};
