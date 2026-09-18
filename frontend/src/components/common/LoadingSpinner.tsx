import React from 'react';
import { Brain, Sparkles, Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Processing Analytics...",
  subMessage = "AI DataSense is analyzing your dataset topology",
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative flex items-center justify-center mb-4">
        {/* Pulsing ring */}
        <div className="absolute w-16 h-16 rounded-full bg-indigo-500/20 animate-ping"></div>
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
          <Brain className="w-7 h-7 text-white animate-pulse" />
        </div>
      </div>
      <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
        {message}
        <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
      </h3>
      {subMessage && (
        <p className="text-xs text-slate-400 mt-1 max-w-sm">{subMessage}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-16 flex items-center justify-center">
      {content}
    </div>
  );
};
