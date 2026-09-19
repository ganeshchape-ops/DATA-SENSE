import React from 'react';
import { Sparkles, Brain, CheckCircle2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
  steps?: string[];
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Understanding your dataset...",
  subMessage,
  fullScreen = false,
  steps = [
    "Profiling data topology",
    "Discovering patterns & correlations",
    "Preparing predictive insights",
    "Building visualizations"
  ]
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto glass-card relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-center justify-center mb-5">
        <div className="absolute w-20 h-20 rounded-full bg-purple-500/20 animate-ping"></div>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-xl shadow-purple-500/30">
          <Sparkles className="w-7 h-7 text-white animate-ai-pulse" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
        <span>✦ AI DataSense</span>
      </div>

      <h3 className="text-base font-bold text-white tracking-tight mb-2">
        {message}
      </h3>

      {subMessage && (
        <p className="text-xs text-slate-400 mb-4">{subMessage}</p>
      )}

      {/* Futuristic Step Progress List */}
      <div className="w-full mt-3 pt-3 border-t border-white/[0.06] text-left space-y-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-xs">
            {idx === 0 ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 shrink-0" />
            ) : idx === 1 ? (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
            )}
            <span className={idx < 2 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#07090E]/85 backdrop-blur-xl flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {content}
    </div>
  );
};
