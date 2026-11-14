import React from 'react';
import { EvidenceClassification } from '../../types';
import { Eye, Cpu, GitFork, Lightbulb, AlertCircle, CheckSquare } from 'lucide-react';

interface EvidencePillProps {
  classification: EvidenceClassification;
  showIcon?: boolean;
  className?: string;
}

export const EvidencePill: React.FC<EvidencePillProps> = ({
  classification,
  showIcon = true,
  className = '',
}) => {
  const getMeta = () => {
    switch (classification) {
      case 'OBSERVED_FACT':
        return {
          label: 'OBSERVED FACT',
          bg: 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300',
          icon: Eye,
          desc: 'Direct primary sensor telemetry or verified crew log',
        };
      case 'DERIVED_INDICATOR':
        return {
          label: 'DERIVED INDICATOR',
          bg: 'bg-blue-950/70 border-blue-500/50 text-blue-300',
          icon: Cpu,
          desc: 'Computed biomarker calculated from multiple sensor records',
        };
      case 'TEMPORAL_ASSOCIATION':
        return {
          label: 'TEMPORAL ASSOCIATION',
          bg: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
          icon: GitFork,
          desc: 'Observed temporal proximity (preceding event without proved causation)',
        };
      case 'POSSIBLE_EXPLANATION':
        return {
          label: 'POSSIBLE EXPLANATION',
          bg: 'bg-purple-950/70 border-purple-500/50 text-purple-300',
          icon: Lightbulb,
          desc: 'Hypothesized physiological mechanism under medical review',
        };
      case 'MISSING_EVIDENCE':
        return {
          label: 'MISSING EVIDENCE',
          bg: 'bg-rose-950/70 border-dashed border-rose-500/60 text-rose-300',
          icon: AlertCircle,
          desc: 'Data gap: observation unacquired or sensor telemetry offline',
        };
      case 'RECOMMENDED_REVIEW':
        return {
          label: 'RECOMMENDED REVIEW',
          bg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300',
          icon: CheckSquare,
          desc: 'Operational or clinical investigation step for flight surgeon',
        };
      default:
        return {
          label: classification,
          bg: 'bg-slate-900 border-slate-700 text-slate-300',
          icon: Eye,
          desc: '',
        };
    }
  };

  const meta = getMeta();
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider border select-none ${meta.bg} ${className}`}
      title={meta.desc}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{meta.label}</span>
    </span>
  );
};
