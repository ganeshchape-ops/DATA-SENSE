import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: 'purple' | 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'neutral',
  color = 'purple'
}) => {
  const colorMap = {
    purple: {
      iconBg: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
    },
    indigo: {
      iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25',
    },
    emerald: {
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    },
    amber: {
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    },
    blue: {
      iconBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
    },
    rose: {
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
    },
  };

  const scheme = colorMap[color] || colorMap.purple;

  return (
    <div className="p-5 rounded-2xl glass-card relative group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-wide">{title}</span>
        <div className={`w-8 h-8 rounded-xl ${scheme.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1.5 font-sans">
        {value}
      </div>

      <div className="flex items-center justify-between text-xs">
        {trend && (
          <span className={`font-bold flex items-center gap-0.5 ${
            trendType === 'positive' ? 'text-emerald-400' : trendType === 'negative' ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {trend}
          </span>
        )}
        {subtitle && <span className="text-slate-400 truncate text-[11px]">{subtitle}</span>}
      </div>
    </div>
  );
};
