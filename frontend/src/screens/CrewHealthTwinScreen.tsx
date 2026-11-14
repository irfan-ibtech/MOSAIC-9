import React, { useState, useEffect } from 'react';
import { CrewMember, HealthObservation } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { TelemetryChart } from '../components/common/TelemetryChart';
import { mosaicApi } from '../services/api';
import { DEFAULT_CREW_MEMBERS } from '../data/initialData';
import {
  Heart,
  Dumbbell,
  Moon,
  Radiation,
  Info,
  ChevronDown,
} from 'lucide-react';

interface CrewHealthTwinScreenProps {
  selectedCrew: CrewMember | null;
  crewMembers: CrewMember[];
  onSelectCrew: (crew: CrewMember) => void;
}

export const CrewHealthTwinScreen: React.FC<CrewHealthTwinScreenProps> = ({
  selectedCrew,
  crewMembers,
  onSelectCrew,
}) => {
  const [observations, setObservations] = useState<HealthObservation[]>([]);
  const [, setLoading] = useState(false);

  // Safe crew resolution - never return null!
  const list = crewMembers && crewMembers.length > 0 ? crewMembers : DEFAULT_CREW_MEMBERS;
  const crew = selectedCrew || list[0] || DEFAULT_CREW_MEMBERS[0];

  useEffect(() => {
    if (crew) {
      setLoading(true);
      mosaicApi
        .getCrewObservations(crew.id)
        .then((res) => {
          setObservations(res.observations || []);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [crew?.id]);

  // Safe baseline profile resolution
  const baseline = crew.baseline_profile || {};
  const restingHrBaseline = baseline.resting_heart_rate ?? 60;
  const hrvBaseline = baseline.hrv_rmssd ?? 58;
  const sleepBaseline = baseline.sleep_target_hours ?? 8.0;
  const exerciseBaseline = baseline.exercise_target_watts ?? 185;
  const pvtBaseline = baseline.pvt_reaction_time_ms ?? 215;
  const radBaseline = baseline.cumulative_radiation_msv ?? 140;

  // Multi-day sleep duration chart
  const sleepObs = observations.filter((o) => o.metric_name === 'sleep_duration_hours');
  const sleepChartDays = sleepObs.length > 0
    ? sleepObs.map((o) => `Day ${o.mission_day}`)
    : ['Day 116', 'Day 117', 'Day 118', 'Day 119', 'Day 120'];

  const getAstronautSleepDefaults = () => {
    if (crew.callsign === 'CADUCEUS') return [7.8, 7.6, 7.8, 7.7, 7.9];
    if (crew.callsign === 'VULCAN') return [7.5, 7.1, 6.0, 6.2, 6.5];
    if (crew.callsign === 'AURORA') return [8.0, 7.9, 7.8, null, null];
    return [7.8, 5.4, 4.9, 5.1, 4.6];
  };

  const sleepChartValues = sleepObs.length > 0
    ? sleepObs.map((o) => o.value)
    : getAstronautSleepDefaults();

  const getSleepAnnotation = () => {
    if (crew.callsign === 'CADUCEUS') {
      return { badge: 'STABLE ADHERENCE', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800', note: 'Consistent sleep duration meeting 7.8h target without fragmentation.' };
    }
    if (crew.callsign === 'VULCAN') {
      return { badge: '1.5h WORKLOAD DEBT', badgeColor: 'bg-amber-950 text-amber-300 border-amber-800', note: 'Reduced sleep duration on Day 118 (6.0h) due to 12h coolant maintenance.' };
    }
    if (crew.callsign === 'AURORA') {
      return { badge: 'DATA PACKET LOSS', badgeColor: 'bg-slate-800 text-slate-300 border-slate-700', note: 'Smart bunk transponder dropped packets on Days 119-120. Completeness penalized.' };
    }
    return { badge: '8.6h 72h / 12.0h 4d DEBT', badgeColor: 'bg-rose-950 text-rose-300 border-rose-800', note: 'Pre-incident 72-hour sleep debt reached 8.6h (Day 117 5.4h, Day 118 4.9h, Day 119 5.1h vs 8.0h target); 4-day cumulative reached 12.0h.' };
  };

  const getHrvAnnotation = () => {
    if (crew.callsign === 'CADUCEUS') {
      return { badge: 'HOMEOSTATIC BALANCE', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800', note: 'Vagal parasympathetic tone stable at 64ms across all five mission days.' };
    }
    if (crew.callsign === 'VULCAN') {
      return { badge: 'SYMPATHETIC STRAIN', badgeColor: 'bg-amber-950 text-amber-300 border-amber-800', note: 'Gradual vagal withdrawal from 52ms down to 43ms (z = -1.4) under high task load.' };
    }
    if (crew.callsign === 'AURORA') {
      return { badge: 'TELEMETRY UNVERIFIED', badgeColor: 'bg-slate-800 text-slate-300 border-slate-700', note: 'Days 116-118 nominal (55ms); Days 119-120 unverified due to patch disconnect.' };
    }
    return { badge: 'MARKED HRV SUPPRESSION', badgeColor: 'bg-rose-950 text-rose-300 border-rose-800', note: 'Parasympathetic vagal tone proxy (HRV RMSSD) decreased from 58ms baseline to 27ms (z = -4.1), indicating substantial autonomic deviation.' };
  };

  const sleepAnnot = getSleepAnnotation();
  const hrvAnnot = getHrvAnnotation();

  const getCurrentProfile = () => {
    if (crew.callsign === 'CADUCEUS') {
      return {
        hr: { val: '57 bpm', status: 'text-emerald-400', note: 'Nominal (+1 bpm)' },
        hrv: { val: '62 ms', status: 'text-emerald-400', note: 'Stable (-2 ms)' },
        sleep: { val: '7.6 hrs', status: 'text-emerald-400', note: '7.8h 5d avg' },
        exercise: { val: '185 W', status: 'text-emerald-400', note: '100% dose' },
        pvt: { val: '212 ms', status: 'text-emerald-400', note: 'Nominal speed' },
        rad: { val: '138 mSv', status: 'text-slate-400', note: 'Career safe' },
      };
    }
    if (crew.callsign === 'VULCAN') {
      return {
        hr: { val: '66 bpm', status: 'text-amber-400', note: 'Mild elevation' },
        hrv: { val: '43 ms', status: 'text-amber-400', note: 'Vagal strain (z = -1.4)' },
        sleep: { val: '6.5 hrs', status: 'text-amber-400', note: 'Day 118: 6.0h / 5d: 6.1h' },
        exercise: { val: '165 W', status: 'text-amber-400', note: 'Abbreviated' },
        pvt: { val: '250 ms', status: 'text-amber-400', note: 'Moderate fatigue' },
        rad: { val: '142 mSv', status: 'text-slate-400', note: 'Career safe' },
      };
    }
    if (crew.callsign === 'AURORA') {
      return {
        hr: { val: 'UNKNOWN', status: 'text-slate-400', note: 'Dropout Days 119-120' },
        hrv: { val: 'UNKNOWN', status: 'text-slate-400', note: 'Dropout Days 119-120' },
        sleep: { val: 'UNKNOWN', status: 'text-slate-400', note: 'Smart bunk unverified' },
        exercise: { val: '165 W', status: 'text-slate-400', note: 'Manual log only' },
        pvt: { val: 'UNKNOWN', status: 'text-slate-400', note: 'Missing telemetry' },
        rad: { val: '140 mSv', status: 'text-slate-400', note: 'Career safe' },
      };
    }
    // Alex Morgan
    return {
      hr: { val: '78 bpm (118 peak)', status: 'text-rose-400', note: 'Acute tachycardia' },
      hrv: { val: '27 ms', status: 'text-rose-400', note: 'Autonomic nadir (z = -4.1)' },
      sleep: { val: '4.6 hrs', status: 'text-rose-400', note: '8.6h 72h / 12.0h 4d debt' },
      exercise: { val: '0 W', status: 'text-rose-400', note: 'Day 119 omitted' },
      pvt: { val: '310 ms', status: 'text-rose-400', note: '+44% latency spike' },
      rad: { val: '140 mSv', status: 'text-slate-400', note: 'Career safe' },
    };
  };

  const curr = getCurrentProfile();

  const sleepChartOptions = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: sleepChartDays,
      axisLine: { lineStyle: { color: '#1e2c4c' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 4,
      max: 9,
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    series: [
      {
        name: 'Sleep Duration (hrs)',
        type: 'bar',
        barWidth: '40%',
        data: sleepChartValues,
        itemStyle: {
          color: (params: any) => (params.value === null ? '#475569' : params.value < 6.0 ? '#f43f5e' : '#06b6d4'),
          borderRadius: [4, 4, 0, 0],
        },
        markLine: {
          data: [{ yAxis: sleepBaseline, name: `Target Baseline (${sleepBaseline}h)` }],
          lineStyle: { color: '#10b981', type: 'dashed' },
          label: { formatter: `Target: ${sleepBaseline}h`, color: '#10b981', fontSize: 10 },
        },
      },
    ],
  };

  // Autonomic Balance Chart (HRV RMSSD)
  const hrvObs = observations.filter((o) => o.metric_name === 'hrv_rmssd');
  const getAstronautHrvDefaults = () => {
    if (crew.callsign === 'CADUCEUS') return [64, 65, 64, 63, 64];
    if (crew.callsign === 'VULCAN') return [52, 50, 48, 45, 43];
    if (crew.callsign === 'AURORA') return [55, 54, 55, null, null];
    return [58, 46, 38, 32, 27];
  };

  const hrvChartValues = hrvObs.length > 0
    ? hrvObs.map((o) => o.value)
    : getAstronautHrvDefaults();

  const hrvChartOptions = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Day 116', 'Day 117', 'Day 118', 'Day 119', 'Day 120'],
      axisLine: { lineStyle: { color: '#1e2c4c' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 20,
      max: 70,
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    series: [
      {
        name: 'HRV RMSSD (ms)',
        type: 'line',
        smooth: true,
        connectNulls: false,
        data: hrvChartValues,
        itemStyle: { color: '#38bdf8' },
        areaStyle: {
          color: 'rgba(56, 189, 248, 0.1)',
        },
        markLine: {
          data: [{ yAxis: hrvBaseline, name: `Baseline (${hrvBaseline} ms)` }],
          lineStyle: { color: '#10b981', type: 'dashed' },
          label: { formatter: `Baseline: ${hrvBaseline}ms`, color: '#10b981', fontSize: 10 },
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header & Astronaut Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-space-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              MODULE C — CREW HEALTH TWIN
            </span>
            <span className="text-xs font-mono text-slate-400">
              INDIVIDUALIZED PHYSIOLOGICAL BASELINE TRACKING
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
            <span>{crew.name}</span>
            <span className="text-sm font-mono text-cyan-400">({crew.callsign})</span>
            <StatusBadge status={crew.status} size="sm" />
          </h1>
          <p className="text-xs text-slate-400">{crew.role}</p>
        </div>

        {/* Astronaut Selector: Dropdown for Mobile / Pills for Desktop */}
        <div className="flex items-center gap-2">
          {/* Mobile / Tablet Dropdown */}
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
            <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Desktop Pill Tabs */}
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
      </div>

      {/* Mandatory Scientific Integrity Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-space-900/90 border border-space-700/80 text-xs text-slate-300 flex items-start gap-3 font-mono">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-100 flex items-center gap-2">
            <span>SCIENTIFIC PRINCIPLES & BOUNDARIES</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-space-800 text-slate-400 border border-space-700">
              SYNTHETIC DATASET
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Exercise compliance is not a direct measurement of bone density. Subjective fatigue is not an autonomous medical diagnosis. External space weather telemetry does not establish internal absorbed radiation dose. All models compare observations against personal resting baselines without claiming absolute clinical diagnosis.
          </p>
        </div>
      </div>

      {/* Baseline Metric Matrix - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="bg-space-850 border border-space-700 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Resting HR</div>
          <div className="text-[11px] text-slate-300">
            <span className="text-slate-400 text-[10px]">μ_base: </span>
            <strong className="text-white">{restingHrBaseline}</strong> bpm
          </div>
          <div className="text-xs font-bold pt-0.5 border-t border-space-800">
            <span className="text-slate-400 text-[10px]">x_curr: </span>
            <span className={curr.hr.status}>{curr.hr.val}</span>
          </div>
          <div className="text-[9px] text-slate-400 truncate">{curr.hr.note}</div>
        </div>

        <div className="bg-space-850 border border-space-700 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">HRV RMSSD</div>
          <div className="text-[11px] text-slate-300">
            <span className="text-slate-400 text-[10px]">μ_base: </span>
            <strong className="text-white">{hrvBaseline}</strong> ms
          </div>
          <div className="text-xs font-bold pt-0.5 border-t border-space-800">
            <span className="text-slate-400 text-[10px]">x_curr: </span>
            <span className={curr.hrv.status}>{curr.hrv.val}</span>
          </div>
          <div className="text-[9px] text-slate-400 truncate">{curr.hrv.note}</div>
        </div>

        <div className="bg-space-850 border border-space-700 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Sleep Allocation</div>
          <div className="text-[11px] text-slate-300">
            <span className="text-slate-400 text-[10px]">μ_base: </span>
            <strong className="text-white">{sleepBaseline}</strong> hrs
          </div>
          <div className="text-xs font-bold pt-0.5 border-t border-space-800">
            <span className="text-slate-400 text-[10px]">x_curr: </span>
            <span className={curr.sleep.status}>{curr.sleep.val}</span>
          </div>
          <div className="text-[9px] text-slate-400 truncate">{curr.sleep.note}</div>
        </div>

        <div className="bg-space-850 border border-space-700 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Cycle Ergometer</div>
          <div className="text-[11px] text-slate-300">
            <span className="text-slate-400 text-[10px]">μ_base: </span>
            <strong className="text-white">{exerciseBaseline}</strong> W
          </div>
          <div className="text-xs font-bold pt-0.5 border-t border-space-800">
            <span className="text-slate-400 text-[10px]">x_curr: </span>
            <span className={curr.exercise.status}>{curr.exercise.val}</span>
          </div>
          <div className="text-[9px] text-slate-400 truncate">{curr.exercise.note}</div>
        </div>

        <div className="bg-space-850 border border-space-700 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">PVT Latency</div>
          <div className="text-[11px] text-slate-300">
            <span className="text-slate-400 text-[10px]">μ_base: </span>
            <strong className="text-white">{pvtBaseline}</strong> ms
          </div>
          <div className="text-xs font-bold pt-0.5 border-t border-space-800">
            <span className="text-slate-400 text-[10px]">x_curr: </span>
            <span className={curr.pvt.status}>{curr.pvt.val}</span>
          </div>
          <div className="text-[9px] text-slate-400 truncate">{curr.pvt.note}</div>
        </div>

        <div className="bg-space-850 border border-space-700 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Radiation Dose</div>
          <div className="text-[11px] text-slate-300">
            <span className="text-slate-400 text-[10px]">μ_base: </span>
            <strong className="text-white">{radBaseline}</strong> mSv
          </div>
          <div className="text-xs font-bold pt-0.5 border-t border-space-800">
            <span className="text-slate-400 text-[10px]">x_curr: </span>
            <span className={curr.rad.status}>{curr.rad.val}</span>
          </div>
          <div className="text-[9px] text-slate-400 truncate">{curr.rad.note}</div>
        </div>
      </div>

      {/* Two Main Telemetry Charts: Sleep Duration & Autonomic Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-space-850 border border-space-700/80 rounded-xl p-5 shadow-panel space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Sleep Duration vs {sleepBaseline}h Target</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {sleepAnnot.note}
              </p>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${sleepAnnot.badgeColor}`}>
              {sleepAnnot.badge}
            </span>
          </div>
          <TelemetryChart options={sleepChartOptions} height={230} />
        </div>

        <div className="bg-space-850 border border-space-700/80 rounded-xl p-5 shadow-panel space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>HRV RMSSD Autonomic Tone Tracking</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {hrvAnnot.note}
              </p>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${hrvAnnot.badgeColor}`}>
              {hrvAnnot.badge}
            </span>
          </div>
          <TelemetryChart options={hrvChartOptions} height={230} />
        </div>
      </div>

      {/* Four Detailed Health Domains Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase font-mono">
          INDIVIDUAL DOMAIN EVALUATIONS — {crew.callsign}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Cardiovascular */}
          <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white">Cardiovascular & Autonomic State</span>
              </div>
              <StatusBadge status={crew.domain_status?.cardiovascular?.status || 'UNKNOWN'} size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {crew.domain_status?.cardiovascular?.summary || 'No telemetry recorded.'}
            </p>
            <div className="pt-2 border-t border-space-700/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Resting HR: {restingHrBaseline} bpm</span>
              <span>HRV RMSSD: {hrvBaseline} ms</span>
            </div>
          </div>

          {/* Card 2: Musculoskeletal */}
          <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Musculoskeletal & Countermeasures</span>
              </div>
              <StatusBadge status={crew.domain_status?.musculoskeletal?.status || 'UNKNOWN'} size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {crew.domain_status?.musculoskeletal?.summary || 'No telemetry recorded.'}
            </p>
            <div className="pt-2 border-t border-space-700/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Ergometer Target: {exerciseBaseline} W</span>
              <span>VO2 Max: {baseline.vo2_max_est ?? 50.0} mL/kg</span>
            </div>
          </div>

          {/* Card 3: Neurocognitive & Sleep */}
          <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white">Sleep, Fatigue & Neurocognitive State</span>
              </div>
              <StatusBadge status={crew.domain_status?.neuro_cognitive_sleep?.status || 'UNKNOWN'} size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {crew.domain_status?.neuro_cognitive_sleep?.summary || 'No telemetry recorded.'}
            </p>
            <div className="pt-2 border-t border-space-700/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Target Sleep: {sleepBaseline} hrs</span>
              <span>PVT Latency: {pvtBaseline} ms</span>
            </div>
          </div>

          {/* Card 4: Radiation & Environment */}
          <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radiation className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Radiation & Habitation Context</span>
              </div>
              <StatusBadge status={crew.domain_status?.radiation_environment?.status || 'UNKNOWN'} size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {crew.domain_status?.radiation_environment?.summary || 'No telemetry recorded.'}
            </p>
            <div className="pt-2 border-t border-space-700/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Cumulative: {radBaseline} mSv</span>
              <span>Dosimeter: Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};