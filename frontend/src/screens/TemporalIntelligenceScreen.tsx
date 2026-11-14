import React, { useState, useEffect } from 'react';
import { CrewMember } from '../types';
import { mosaicApi } from '../services/api';
import { TelemetryChart } from '../components/common/TelemetryChart';
import { DEFAULT_CREW_MEMBERS, DEFAULT_TEMPORAL_ANALYSIS } from '../data/initialData';
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
            Deterministic time-series analysis reconstructing how preceding sleep debt, workload spikes, and autonomic suppression converged prior to the acute episode.
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
        <h2 className="text-sm font-bold text-white uppercase font-mono">
          5-DAY MULTI-DOMAIN ANOMALY SEQUENCE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-space-900 border border-space-700 space-y-1.5">
            <div className="text-[10px] text-emerald-400 font-bold uppercase">DAY 116 — BASELINE</div>
            <div className="font-semibold text-white">Nominal State</div>
            <div className="text-[11px] text-slate-400 font-sans">
              HR 61 bpm, HRV 58ms, Sleep 7.8h. All domains within 1-sigma baseline.
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-space-900 border border-cyan-700/80 space-y-1.5 shadow-panel">
            <div className="text-[10px] text-cyan-400 font-bold uppercase">DAY 117 — ONSET</div>
            <div className="font-semibold text-white">Sleep Curtailment</div>
            <div className="text-[11px] text-slate-400 font-sans">
              Night alarm interruption. Sleep 5.4h (-2.6σ). First abnormal indicator.
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-space-900 border border-amber-700/80 space-y-1.5">
            <div className="text-[10px] text-amber-400 font-bold uppercase">DAY 118 — DIVERGENCE</div>
            <div className="font-semibold text-white">Workload & Ergo Drop</div>
            <div className="text-[11px] text-slate-400 font-sans">
              Workload surge (10.5h); cycle ergometer aborted at 145W (-3.3σ).
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-space-900 border border-rose-800/80 space-y-1.5">
            <div className="text-[10px] text-rose-400 font-bold uppercase">DAY 119 — VULNERABILITY</div>
            <div className="font-semibold text-white">Fatigue & PVT Spike</div>
            <div className="text-[11px] text-slate-400 font-sans">
              Fatigue 7/10; PVT latency 310ms (+44%); exercise omitted completely.
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500 space-y-1.5 shadow-glow-rose">
            <div className="text-[10px] text-rose-300 font-bold uppercase">DAY 120 — INCIDENT</div>
            <div className="font-semibold text-white">Presyncopal Episode</div>
            <div className="text-[11px] text-slate-200 font-sans">
              Post-egress dizziness: BP drops to 88/56 mmHg, transient HR 118 bpm.
            </div>
          </div>
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
        <h2 className="text-sm font-bold text-white uppercase font-mono">
          DISCOVERED CROSS-DOMAIN TEMPORAL ASSOCIATIONS
        </h2>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-space-900 border border-space-700 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                <GitFork className="w-4 h-4 text-cyan-400" />
                Sleep Curtailment ➔ Autonomic Tone Suppression (HRV RMSSD Drop)
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700">
                  Lead Time: 24h
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                  r = -0.89 (p &lt; 0.005)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Sleep reduction below 6.0 hours induced progressive vagal withdrawal and sympathetic overdrive, manifesting in lower HRV RMSSD within 18–24 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-900 border border-space-700 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <GitFork className="w-4 h-4 text-amber-400" />
                Workload Task Extension ➔ Countermeasure Omission
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700">
                  Lead Time: 12h
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                  r = -0.82 (p = 0.012)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Physical troubleshooting on station equipment bays directly displaced allocated daily cycle ergometer windows, predisposing vascular deconditioning.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-900 border border-space-700 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-2">
                <GitFork className="w-4 h-4 text-rose-400" />
                Cumulative 72h Sleep Debt ➔ Neurocognitive Vigilance Lapses
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700">
                  Lead Time: 48h
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                  r = +0.93 (p &lt; 0.001)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Cumulative sleep debt exceeding 9 hours correlated with a 44% increase in psychomotor vigilance response latency and attentional lapses on flight deck consoles.
            </p>
          </div>
        </div>

        {/* Statistical & Scientific Integrity Notice */}
        <div className="p-3.5 rounded-lg bg-space-950 border border-space-800 text-[11px] text-slate-400 font-sans flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">Statistical & Methodological Limitations:</strong> Pearson correlation coefficients (<em>r</em>) reflect linear co-movement across discrete observation windows (<em>n=5, df=3</em>). Statistical correlation does not establish physiological causality. Calculated confidence scores represent heuristic empirical estimates based on data completeness and sensor provenance.
          </div>
        </div>
      </div>
    </div>
  );
};
