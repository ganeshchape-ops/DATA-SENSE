import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: 'indigo' | 'emerald' | 'purple' | 'amber' | 'blue' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'neutral',
  color = 'indigo'
}) => {
  const colorMap = {
    indigo: {
      bg: 'from-indigo-600/20 to-indigo-900/10',
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-600/20 text-indigo-400',
      glow: 'shadow-indigo-500/10'
    },
    emerald: {
      bg: 'from-emerald-600/20 to-emerald-900/10',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-600/20 text-emerald-400',
      glow: 'shadow-emerald-500/10'
    },
    purple: {
      bg: 'from-purple-600/20 to-purple-900/10',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-600/20 text-purple-400',
      glow: 'shadow-purple-500/10'
    },
    amber: {
      bg: 'from-amber-600/20 to-amber-900/10',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-600/20 text-amber-400',
      glow: 'shadow-amber-500/10'
    },
    blue: {
      bg: 'from-blue-600/20 to-blue-900/10',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-600/20 text-blue-400',
      glow: 'shadow-blue-500/10'
    },
    rose: {
      bg: 'from-rose-600/20 to-rose-900/10',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-600/20 text-rose-400',
      glow: 'shadow-rose-500/10'
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${scheme.bg} bg-slate-900/80 border ${scheme.border} shadow-lg ${scheme.glow} transition-all duration-200 hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`w-8 h-8 rounded-lg ${scheme.iconBg} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {trend && (
          <span className={`text-[11px] font-semibold ${
            trendType === 'positive' ? 'text-emerald-400' : trendType === 'negative' ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] text-slate-400 mt-1 truncate">{subtitle}</p>}
    </div>
  );
};
