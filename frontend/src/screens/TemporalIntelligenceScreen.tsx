import React, { useState, useEffect } from 'react';
import { CrewMember } from '../types';
import { mosaicApi } from '../services/api';
import { TelemetryChart } from '../components/common/TelemetryChart';
import { DEFAULT_CREW_MEMBERS, DEFAULT_TEMPORAL_ANALYSIS, DEFAULT_TEMPORAL_ANALYSIS_BY_CREW } from '../data/initialData';
import {
  Clock,
  GitFork,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  Info,
  ShieldCheck,
  Zap,
  ChevronDown,
} from 'lucide-react';

interface TemporalIntelligenceScreenProps {
  selectedCrew: CrewMember | null;
  crewMembers?: CrewMember[];
  onSelectCrew?: (crew: CrewMember) => void;
}

export const TemporalIntelligenceScreen: React.FC<TemporalIntelligenceScreenProps> = ({
  selectedCrew,
  crewMembers,
  onSelectCrew,
}) => {
  const list = crewMembers && crewMembers.length > 0 ? crewMembers : DEFAULT_CREW_MEMBERS;
  const crew = selectedCrew || list[0] || DEFAULT_CREW_MEMBERS[0];

  const [temporalData, setTemporalData] = useState<any>(DEFAULT_TEMPORAL_ANALYSIS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (crew) {
      setLoading(true);
      mosaicApi
        .getTemporalAnalysis(crew.id)
        .then((res) => {
          setTemporalData(res);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [crew?.id]);

  // Anomaly sequence progression chart (Z-score composite across 5 days) dynamically tailored
  const getZScoreSeries = () => {
    if (crew?.callsign === 'CADUCEUS') {
      return {
        autonomic: [0.0, 0.1, 0.0, -0.1, 0.0],
        sleep: [0.1, 0.0, 0.1, 0.0, 0.1],
        cognitive: [0.0, 0.1, 0.0, 0.1, 0.0],
      };
    }
    if (crew?.callsign === 'VULCAN') {
      return {
        autonomic: [0.0, -0.4, -0.8, -1.2, -1.4],
        sleep: [-0.1, -0.8, -1.5, -1.3, -1.4],
        cognitive: [0.1, 0.4, 0.9, 1.2, 1.4],
      };
    }
    if (crew?.callsign === 'AURORA') {
      return {
        autonomic: [0.0, -0.2, 0.0, null, null],
        sleep: [0.0, 0.1, 0.0, null, null],
        cognitive: [0.0, 0.2, 0.1, null, null],
      };
    }
    // Default to Commander Alex Morgan
    return {
      autonomic: [0.0, -1.8, -2.9, -3.6, -4.1],
      sleep: [-0.2, -2.6, -3.1, -2.9, -3.4],
      cognitive: [0.0, 1.3, 2.6, 3.9, 4.2],
    };
  };

  const zData = getZScoreSeries();

  const getSignalDetails = () => {
    if (crew?.callsign === 'CADUCEUS') {
      return {
        title: 'Nominal Physiological Stability Across Mission Days 116–120',
        leadTime: 'NOMINAL (0 ANOMALIES)',
        leadColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
        description: 'Dr. Sarah Chen maintained complete countermeasure compliance, balanced rest cycles (7.8h avg), and stable resting cardiovascular metrics with zero precursor threshold exceedances.',
      };
    }
    if (crew?.callsign === 'VULCAN') {
      return {
        title: 'Day 116 18:00 — Coolant Loop Overtime Shift (10.5h Workload Surge)',
        leadTime: 'LEAD TIME: 49.2 HOURS BEFORE EPISODE',
        leadColor: 'bg-amber-950 text-amber-300 border-amber-800',
        description: 'Extended manual maintenance in confined Node 2 compartment caused minor sleep window delay and local CO2 elevation to 3.1 mmHg, initiating physical fatigue progression.',
      };
    }
    if (crew?.callsign === 'AURORA') {
      return {
        title: 'Day 119 18:00 — Transponder Telemetry Packet Dropout',
        leadTime: 'STATUS: UNVERIFIED PACKET LOSS',
        leadColor: 'bg-slate-800 text-slate-300 border-slate-700',
        description: 'Continuous biometric patch disconnected at Day 119 18:00. Precursor timeline unverified for Days 119-120; data completeness score penalized to 45%.',
      };
    }
    return {
      title: 'Day 117 06:30 — Acute Sleep Curtailment (-2.6σ Deviation)',
      leadTime: 'LEAD TIME: 75.2 HOURS BEFORE INCIDENT',
      leadColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      description: 'Following an unscheduled nocturnal ECLSS audio alarm drill at 02:45, Commander Alex Morgan’s recorded sleep duration was acutely curtailed from 8.0h baseline to 5.4h (z = -2.6). This was the earliest statistically significant departure across all tracked physiological and mission signals.',
    };
  };

  const signalDetails = getSignalDetails();

  const fallbackData = DEFAULT_TEMPORAL_ANALYSIS_BY_CREW[crew.id] || DEFAULT_TEMPORAL_ANALYSIS;
  const activeData = (temporalData && (temporalData.anomaly_sequence || temporalData.cross_domain_associations))
    ? temporalData
    : fallbackData;

  const anomalySequence = (activeData.anomaly_sequence && activeData.anomaly_sequence.length > 0)
    ? activeData.anomaly_sequence
    : fallbackData.anomaly_sequence;

  const crossAssociations = (activeData.cross_domain_associations && activeData.cross_domain_associations.length > 0)
    ? activeData.cross_domain_associations
    : fallbackData.cross_domain_associations;

  const anomalyChartOptions = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Day 116 (Baseline)', 'Day 117 (Onset)', 'Day 118 (Divergence)', 'Day 119 (Vulnerability)', 'Day 120 (Incident)'],
      axisLine: { lineStyle: { color: '#1e2c4c' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: 'Composite Z-Score (Sigma)',
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    series: [
      {
        name: 'Autonomic Z-Score',
        type: 'line',
        smooth: true,
        connectNulls: false,
        data: zData.autonomic,
        itemStyle: { color: '#f43f5e' },
        lineStyle: { width: 3 },
      },
      {
        name: 'Sleep Duration Z-Score',
        type: 'line',
        smooth: true,
        connectNulls: false,
        data: zData.sleep,
        itemStyle: { color: '#38bdf8' },
        lineStyle: { width: 2 },
      },
      {
        name: 'Cognitive Latency Z-Score',
        type: 'line',
        smooth: true,
        connectNulls: false,
        data: zData.cognitive,
        itemStyle: { color: '#eab308' },
        lineStyle: { width: 2, type: 'dashed' },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header & Astronaut Selector */}
      <div className="border-b border-space-700/60 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              MODULE D — TEMPORAL RELATIONSHIP INTELLIGENCE ENGINE
            </span>
            <span className="text-xs font-mono text-slate-400">
              CROSS-DOMAIN LEAD-LAG & SEQUENCE DISCOVERY
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
            <span>Multi-Domain Temporal Evolution & Precursor Detection</span>
            <span className="text-cyan-400 font-mono text-base">({crew.name})</span>
          </h1>
          <p className="text-xs text-slate-400">
            {crew.callsign === 'CADUCEUS'
              ? 'Multi-domain tracking showing complete baseline compliance, zero precursor threshold departures, and sustained autonomic stability.'
              : crew.callsign === 'VULCAN'
              ? 'Time-series analysis demonstrating how Day 118 coolant loop maintenance and localized CO2 elevation preceded acute cephalalgia.'
              : crew.callsign === 'AURORA'
              ? 'Time-series analysis reflecting nominal pre-dropout baseline followed by Day 119-120 RF packet loss and UNKNOWN telemetry.'
              : 'Deterministic time-series analysis reconstructing how preceding sleep debt, workload spikes, and autonomic suppression converged prior to the acute episode.'}
          </p>
        </div>

        {/* Astronaut Selector */}
        {onSelectCrew && (
          <div className="flex items-center gap-2">
            <div className="relative md:hidden flex items-center bg-space-900 border border-space-700 rounded-lg px-2.5 py-1.5 w-full">
              <select
                value={crew.id}
                onChange={(e) => {
                  const found = list.find((c) => c.id === Number(e.target.value));
                  if (found) onSelectCrew(found);
                }}
                className="appearance-none bg-transparent text-xs text-white font-mono focus:outline-none pr-6 cursor-pointer w-full"
              >
                {list.map((c) => (
                  <option key={c.id} value={c.id} className="bg-space-900 text-slate-100">
                    {c.name} ({c.callsign})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2 pointer-events-none" />
            </div>

            <div className="hidden md:flex items-center gap-2">
              {list.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCrew(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 border ${
                    crew.id === c.id
                      ? 'bg-cyan-950 border-cyan-600 text-cyan-300 shadow-panel font-semibold'
                      : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{c.avatar_initials}</span>
                  <span>{c.callsign}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scientific Principle Alert */}
      <div className="p-4 rounded-xl bg-space-900 border border-space-700 text-xs text-slate-300 font-mono space-y-1">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Info className="w-4 h-4 shrink-0" />
          <span>SCIENTIFIC PRINCIPLE: TEMPORAL PRECEDENCE IS NOT PROVED CAUSALITY</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          The engine computes deterministic mathematical lead-lag cross-correlations. While sleep curtailment on Day 117 clearly preceded the Day 118 exercise drop and Day 120 presyncope, MOSAIC-9 frames this as a verified chronological sequence and biological plausibility model, rather than an absolute causal certainty.
        </p>
      </div>

      {/* First Unusual Signal Card */}
      <div className="bg-space-850 border border-cyan-700/60 rounded-xl p-5 shadow-glow-cyan space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-300">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                FIRST UNUSUAL SIGNAL IDENTIFIED
              </div>
              <h3 className="text-sm font-bold text-white font-mono">
                {signalDetails.title}
              </h3>
            </div>
          </div>
          <span className={`text-xs font-mono px-2.5 py-1 rounded border ${signalDetails.leadColor}`}>
            {signalDetails.leadTime}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {signalDetails.description}
        </p>
      </div>

      {/* Chronological Sequence Progression Stepper */}
      <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold text-white uppercase font-mono">
            5-DAY MULTI-DOMAIN SEQUENCE — {crew.callsign}
          </h2>
          <span className="text-[10px] font-mono text-slate-400">
            {crew.callsign === 'CADUCEUS' ? '100% NOMINAL ADHERENCE (0 PRECURSOR ANOMALIES)' : 'CHRONOLOGICAL DOMAIN DIVERGENCE'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
          {anomalySequence.map((step: any, idx: number) => {
            const isIncident = step.state === 'ACUTE_INCIDENT' || step.state === 'OVERHAUL_CO2_STRAIN';
            const isVulnerability = step.state === 'COMPOSITE_VULNERABILITY' || step.state === 'TELEMETRY_DROPOUT' || step.state === 'TELEMETRY_UNKNOWN';
            const isOnset = step.state === 'FIRST_UNUSUAL_SIGNAL' || step.state === 'SHIFT_EXTENSION';
            const isDivergence = step.state === 'MULTI_DOMAIN_DIVERGENCE';

            const borderClass = isIncident
              ? 'bg-rose-950/40 border-rose-500 shadow-glow-rose'
              : isVulnerability
              ? 'bg-space-900 border-rose-800/80'
              : isDivergence
              ? 'bg-space-900 border-amber-700/80'
              : isOnset
              ? 'bg-space-900 border-cyan-700/80 shadow-panel'
              : 'bg-space-900 border-space-700';

            const tagColor = isIncident
              ? 'text-rose-300'
              : isVulnerability
              ? 'text-rose-400'
              : isDivergence
              ? 'text-amber-400'
              : isOnset
              ? 'text-cyan-400'
              : 'text-emerald-400';

            const dayNumber = step.mission_day || step.day || (116 + idx);
            const stateLabel = step.state ? step.state.replace(/_/g, ' ') : (step.status || 'NOMINAL');

            return (
              <div key={idx} className={`p-3.5 rounded-lg border space-y-1.5 ${borderClass}`}>
                <div className={`text-[10px] font-bold uppercase ${tagColor}`}>
                  DAY {dayNumber} — {stateLabel}
                </div>
                <div className="font-semibold text-white truncate">
                  {step.domain || (step.z_score_composite !== null && step.z_score_composite !== undefined ? `Z: ${typeof step.z_score_composite === 'number' ? step.z_score_composite.toFixed(2) : step.z_score_composite}σ` : 'Nominal State')}
                </div>
                <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {step.summary || step.notes || 'Signals within nominal baseline bounds.'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Domain Deviation Chart */}
      <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-3">
        <h2 className="text-sm font-bold text-white uppercase font-mono">
          STATISTICAL STANDARD DEVIATION TRAJECTORY (Z-SCORES)
        </h2>
        <p className="text-xs text-slate-400">
          Composite multi-domain departure demonstrating progressive systemic divergence from personal baseline.
        </p>
        <TelemetryChart options={anomalyChartOptions} height={250} />
      </div>

      {/* Lead-Lag Association Pairs */}
      <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold text-white uppercase font-mono">
            DISCOVERED CROSS-DOMAIN TEMPORAL ASSOCIATIONS ({crew.callsign})
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-900 border border-space-700 text-slate-400">
            EXPLORATORY LINEAR ASSOCIATIONS (n=5 DAYS, df=3)
          </span>
        </div>

        <div className="space-y-3">
          {crossAssociations.map((assoc: any, idx: number) => {
            const rVal = assoc.correlation_coefficient ?? assoc.pearson_r ?? 0;
            const isNominal = crew.callsign === 'CADUCEUS';
            const isDropout = crew.callsign === 'AURORA';

            const accentColor = isNominal
              ? 'text-emerald-300'
              : isDropout
              ? 'text-slate-300'
              : idx === 0
              ? 'text-cyan-300'
              : idx === 1
              ? 'text-amber-300'
              : 'text-rose-300';

            const pillBadge = isNominal
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
              : isDropout
              ? 'bg-slate-800 text-slate-300 border-slate-700'
              : idx === 0
              ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
              : idx === 1
              ? 'bg-amber-950 text-amber-400 border-amber-800'
              : 'bg-rose-950 text-rose-400 border-rose-800';

            const leadTime = assoc.lag_time_hours ?? assoc.lead_time_hours ?? 0;

            return (
              <div key={idx} className="p-4 rounded-xl bg-space-900 border border-space-700 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                  <span className={`text-xs font-bold flex items-center gap-2 ${accentColor}`}>
                    <GitFork className="w-4 h-4 shrink-0" />
                    <span>{assoc.pair}</span>
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700">
                      {leadTime > 0 ? `Lead Time: ${leadTime}h` : 'Synchronous / Nominal'}
                    </span>
                    <span className={`px-2 py-0.5 rounded border font-bold ${pillBadge}`}>
                      r = {rVal > 0 ? `+${rVal.toFixed(2)}` : rVal.toFixed(2)} (n=5, df=3)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {assoc.evidence}
                </p>
                {assoc.causality_qualification && (
                  <p className="text-[11px] text-slate-400 italic font-sans border-t border-space-800/80 pt-1.5 mt-1">
                    <span className="text-slate-500 font-mono not-italic uppercase text-[10px] mr-1">Causality Note:</span>
                    {assoc.causality_qualification}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Statistical & Scientific Integrity Notice */}
        <div className="p-3.5 rounded-lg bg-space-950 border border-space-800 text-[11px] text-slate-400 font-sans flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">Statistical & Methodological Limitations:</strong> Exploratory descriptive linear associations across discrete observation windows (<em>n=5 days, df=3</em>). Statistical correlation describes chronological co-variation and does NOT establish physiological causation. Calculated confidence scores represent heuristic empirical estimates based on data completeness and sensor provenance.
          </div>
        </div>
      </div>
    </div>
  );
};
