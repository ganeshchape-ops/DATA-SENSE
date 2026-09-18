import React, { useState } from 'react';
import {
  Settings, Key, User as UserIcon, Shield, Save,
  CheckCircle2, Sparkles, Database, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataset } from '../context/DatasetContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { datasets } = useDataset();

  const [aiKey, setAiKey] = useState<string>(localStorage.getItem('datasense_ai_key') || '');
  const [saved, setSaved] = useState(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiKey.trim()) {
      localStorage.setItem('datasense_ai_key', aiKey.trim());
    } else {
      localStorage.removeItem('datasense_ai_key');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          System Settings & AI Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage user account preferences and optional custom LLM provider credentials.
        </p>
      </div>

      {/* User Profile Overview */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <UserIcon className="w-4 h-4 text-indigo-400" />
          Active Account Profile
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Full Name</span>
            <p className="font-bold text-white mt-0.5">{user?.name || "Demo Analyst"}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Email Address</span>
            <p className="font-bold text-white mt-0.5">{user?.email || "demo@datasense.ai"}</p>
          </div>
        </div>
      </div>

      {/* AI Key Configuration */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Key className="w-4 h-4" />
            AI Intelligence Provider (Optional)
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
            Built-in AI Analyst Enabled
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          AI DataSense includes a built-in statistical heuristic intelligence analyst by default. If you wish to augment summaries with your own OpenAI, Google Gemini, or Claude API key, configure it below:
        </p>

        <form onSubmit={handleSaveKey} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Custom LLM API Key (Header: X-AI-Key)
            </label>
            <input
              type="password"
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
              placeholder="sk-... or AIzaSy..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" /> Save Configuration
            </button>
            {saved && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings Saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Storage & Library Summary */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Database className="w-4 h-4 text-indigo-400" />
          Workspace Storage Health
        </div>
        <p className="text-xs text-slate-400">
          You currently have <span className="text-white font-semibold">{datasets.length}</span> stored datasets and active statistical models in your workspace database.
        </p>
      </div>
    </div>
  );
};
