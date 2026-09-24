import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit, Lock, Mail, ArrowRight, Sparkles, AlertCircle,
  Eye, EyeOff, ShieldCheck, CheckCircle2, TrendingUp, Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataset } from '../context/DatasetContext';
import { Logo, LogoIcon } from '../components/common/Logo';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login, demoLogin } = useAuth();
  const { loadSampleDataset } = useDataset();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email/mobile number or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin();
      try {
        await loadSampleDataset('student');
      } catch (e) {
        console.warn("Using built-in student dataset:", e);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.warn("Direct demo access:", err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 transition-colors">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        {/* Left Side: Brand Story & Analytics Features */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden">
          {/* Background Data Glow Particles */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <LogoIcon size="lg" />
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">AI DataSense</h1>
                <p className="text-[11px] text-indigo-300 font-medium">Enterprise Analytics Engine</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold leading-tight mb-3 bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              AI-Native Intelligence & Predictive Analytics Platform
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Ingest datasets, run automated profiling and cleaning, execute AutoML model training, forecast trends, detect anomalies, and query your data in natural language.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="relative z-10 space-y-3 my-8">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-white">AutoML & Live Prediction Simulator</div>
                <div className="text-slate-400 text-[11px]">Leaderboards, accuracy metrics, and real-time sliders.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-white">AI Data Chat & Strategic SWOT Insights</div>
                <div className="text-slate-400 text-[11px]">Ask questions about your data in plain English.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-white">Secure OTP & Multi-Format Reports</div>
                <div className="text-slate-400 text-[11px]">Download Executive PDF and Excel workbooks.</div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="relative z-10 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Enterprise-grade secure session management
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <Logo size="sm" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your email or registered mobile number to continue.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="analyst@enterprise.ai or +18005550199"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
              />
              <label htmlFor="remember" className="ml-2 text-xs text-slate-600 dark:text-slate-400">
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {loading ? "Authenticating..." : "Sign In to AI Insight"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Or Fast Exploration
            </span>
          </div>

          {/* 1-Click Demo Login */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleDemo}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80 border border-indigo-200 dark:border-slate-700 text-indigo-900 dark:text-slate-100 text-xs font-bold transition-all flex items-center justify-center gap-2 hover:scale-[1.01] hover:border-indigo-400"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Explore Demo Account (1-Click Instant Access)</span>
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
              Create Free Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
