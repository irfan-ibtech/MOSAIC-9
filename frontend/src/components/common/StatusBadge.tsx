import React from 'react';
import { HealthStatus } from '../../types';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: HealthStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  explanation?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  explanation,
  className = '',
}) => {
  const getStyles = () => {
    switch (status) {
      case 'STABLE':
        return {
          bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
          label: 'STABLE',
        };
      case 'WATCH':
        return {
          bg: 'bg-amber-950/60 border-amber-500/40 text-amber-400',
          dot: 'bg-amber-400',
          icon: AlertTriangle,
          label: 'WATCH',
        };
      case 'REVIEW_REQUIRED':
        return {
          bg: 'bg-rose-950/60 border-rose-500/50 text-rose-300 shadow-glow-rose',
          dot: 'bg-rose-400 animate-pulse',
          icon: AlertOctagon,
          label: 'REVIEW REQUIRED',
        };
      case 'UNKNOWN':
      default:
        return {
          bg: 'bg-slate-900 border-slate-700 text-slate-400',
          dot: 'bg-slate-400',
          icon: HelpCircle,
          label: 'UNKNOWN',
        };
    }
  };

  const style = getStyles();
  const Icon = style.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border font-mono tracking-wider transition-all select-none ${style.bg} ${sizeClasses[size]} ${className}`}
      title={explanation || `Status: ${style.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{style.label}</span>
    </div>
  );
};
