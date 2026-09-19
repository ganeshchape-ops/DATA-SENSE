import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, ShieldCheck, Activity } from 'lucide-react';
import { LogoIcon } from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  const stages = [
    { text: "Loading AI DataSense Engine...", icon: Cpu },
    { text: "Initializing Domain Intelligence...", icon: Activity },
    { text: "Connecting Predictive Analytics...", icon: ShieldCheck },
    { text: "Preparing Intelligence Workspace...", icon: Sparkles },
  ];

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStageIndex(prev => {
        if (prev < stages.length - 1) return prev + 1;
        return prev;
      });
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 6;
      });
    }, 70);

    const timer = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  const CurrentIcon = stages[stageIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden select-none">
      {/* Ambient background glow orbs */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Center Neural Glow Container */}
      <div className="relative flex flex-col items-center max-w-md w-full px-6 text-center z-10 animate-in-scale">
        {/* Glowing Logo */}
        <div className="relative mb-6">
          <LogoIcon size="xl" className="scale-125" />
        </div>

        {/* Brand Title */}
        <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-black tracking-tight mb-1">
          <span className="text-[#F97316]">DATA</span>
          <span className="text-white">SENSE</span>
        </div>
        <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-6">
          From Data to Intelligence.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-4 overflow-hidden border border-white/[0.08]">
          <div
            className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-400 h-full rounded-full transition-all duration-150 ease-out shadow-sm shadow-purple-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic Status Text */}
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium h-6">
          <CurrentIcon className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          <span>{stages[stageIndex].text}</span>
        </div>
      </div>

      {/* Footer System Version */}
      <div className="absolute bottom-6 text-[11px] text-slate-500 tracking-wider font-mono">
        v2.4.0 • Universal AI Intelligence Platform
      </div>
    </div>
  );
};
