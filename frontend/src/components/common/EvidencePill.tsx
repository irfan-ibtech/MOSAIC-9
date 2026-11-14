import React from 'react';
import { EvidenceClassification } from '../../types';
import { Eye, Cpu, GitFork, Lightbulb, AlertCircle, CheckSquare, BookOpen, FlaskConical } from 'lucide-react';

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
      case 'DIRECT_OBSERVATION':
      case 'SYNTHETIC_OBSERVATION':
        return {
          label: 'SYNTHETIC OBSERVATION (MISSION RECORD)',
          bg: 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300',
          icon: Eye,
          desc: 'Simulated crew telemetry or operational log entry from the 100% synthetic ARES-IV mission dataset (not real astronaut flight measurements)',
        };
      case 'NASA_RESEARCH_CONTEXT':
        return {
          label: 'NASA RESEARCH CONTEXT',
          bg: 'bg-indigo-950/80 border-indigo-400/60 text-indigo-300',
          icon: BookOpen,
          desc: 'Published or curated NASA OSDR or NASA HRP spaceflight evidence relevant to the observed domain',
        };
      case 'DERIVED_INDICATOR':
        return {
          label: 'DERIVED INDICATOR',
          bg: 'bg-blue-950/70 border-blue-500/50 text-blue-300',
          icon: Cpu,
          desc: 'Computed biomarker calculated from multiple sensor records',
        };
      case 'TEMPORAL_ASSOCIATION':
      case 'DERIVED_TEMPORAL_ASSOCIATION':
        return {
          label: classification === 'DERIVED_TEMPORAL_ASSOCIATION' ? 'DERIVED TEMPORAL ASSOCIATION' : 'TEMPORAL ASSOCIATION',
          bg: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
          icon: GitFork,
          desc: 'Observed temporal proximity or lead-lag statistical relationship (not proved causation)',
        };
      case 'POSSIBLE_EXPLANATION':
      case 'EXPLORATORY_HYPOTHESIS':
        return {
          label: classification === 'EXPLORATORY_HYPOTHESIS' ? 'EXPLORATORY HYPOTHESIS' : 'POSSIBLE EXPLANATION',
          bg: 'bg-purple-950/70 border-purple-500/50 text-purple-300',
          icon: Lightbulb,
          desc: 'Candidate explanation supported by observed telemetry and published spaceflight evidence',
        };
      case 'MISSING_EVIDENCE':
        return {
          label: 'MISSING EVIDENCE',
          bg: 'bg-rose-950/70 border-dashed border-rose-500/60 text-rose-300',
          icon: AlertCircle,
          desc: 'Unmeasured physiological or environmental variable that limits certainty',
        };
      case 'SYNTHETIC_SIMULATION':
        return {
          label: 'SYNTHETIC SIMULATION',
          bg: 'bg-teal-950/70 border-teal-500/50 text-teal-300',
          icon: FlaskConical,
          desc: 'Scenario projection or synthetic dataset element (not clinical recommendation)',
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
