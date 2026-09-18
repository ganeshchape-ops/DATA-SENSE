import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, Cpu, ShieldCheck, Activity } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  const stages = [
    { text: "Loading AI Engine...", icon: Cpu },
    { text: "Preparing Predictive Analytics...", icon: Activity },
    { text: "Connecting Secure Enterprise Services...", icon: ShieldCheck },
    { text: "Initializing AI Insight Dashboard...", icon: Sparkles },
  ];

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStageIndex(prev => {
        if (prev < stages.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 90);

    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  const CurrentIcon = stages[stageIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none">
      {/* Dynamic Background Data Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="particle-node bg-indigo-500/20"
            style={{
              width: `${Math.random() * 8 + 3}px`,
              height: `${Math.random() * 8 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${Math.random() * 5 + 4}s`
            }}
          />
        ))}
      </div>

      {/* Center Neural Glow Container */}
      <div className="relative flex flex-col items-center max-w-md w-full px-6 text-center z-10 animate-in-scale">
        {/* Glowing Neural Logo */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur-2xl opacity-40 animate-pulse" />
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-2xl border border-indigo-400/30 animate-neural-pulse">
            <BrainCircuit className="w-13 h-13 text-cyan-300" />
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1 bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
          AI Insight
        </h1>
        <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-8">
          Enterprise Intelligence Platform
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2 mb-4 p-0.5 border border-slate-700/60 overflow-hidden backdrop-blur-sm">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-150 ease-out shadow-sm shadow-indigo-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic Status Text */}
        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium h-6">
          <CurrentIcon className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>{stages[stageIndex].text}</span>
        </div>
      </div>

      {/* Footer System Version */}
      <div className="absolute bottom-6 text-xs text-slate-500 tracking-wider font-mono">
        v2.0.0 • AI-Native Analytics Engine
      </div>
    </div>
  );
};
