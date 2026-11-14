import React, { useState, useEffect } from 'react';
import { CrewMember, HealthObservation } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { TelemetryChart } from '../components/common/TelemetryChart';
import { mosaicApi } from '../services/api';
import {
  Heart,
  Dumbbell,
  Moon,
  Radiation,
  ShieldAlert,
  Info,
  TrendingDown,
  TrendingUp,
  Activity,
  CheckCircle2,
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
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  useEffect(() => {
    if (selectedCrew) {
      setLoading(true);
      mosaicApi
        .getCrewObservations(selectedCrew.id)
        .then((res) => {
          setObservations(res.observations || []);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [selectedCrew]);

  if (!selectedCrew) return null;

  // Compute multi-day sleep duration chart
  const sleepObs = observations.filter((o) => o.metric_name === 'sleep_duration_hours');
  const sleepChartDays = sleepObs.map((o) => `Day ${o.mission_day}`);
  const sleepChartValues = sleepObs.map((o) => o.value);
  const sleepBaseline = selectedCrew.baseline_profile['sleep_target_hours'] || 8.0;

  const sleepChartOptions = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: sleepChartDays.length > 0 ? sleepChartDays : ['Day 116', 'Day 117', 'Day 118', 'Day 119', 'Day 120'],
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
        data: sleepChartValues.length > 0 ? sleepChartValues : [7.8, 5.4, 4.9, 5.1, 4.6],
        itemStyle: {
          color: (params: any) => (params.value < 6.0 ? '#f43f5e' : '#06b6d4'),
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
  const hrvChartValues = hrvObs.map((o) => o.value);
  const hrvBaseline = selectedCrew.baseline_profile['hrv_rmssd'] || 58.0;

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
        data: hrvChartValues.length > 0 ? hrvChartValues : [58, 46, 38, 32, 27],
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
      {/* Header & Astronaut Selector Tabs */}
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
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{selectedCrew.name}</span>
            <span className="text-sm font-mono text-cyan-400">({selectedCrew.callsign})</span>
            <StatusBadge status={selectedCrew.status} size="sm" />
          </h1>
          <p className="text-xs text-slate-400">{selectedCrew.role}</p>
        </div>

        {/* Astronaut Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {crewMembers.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCrew(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 border ${
                selectedCrew.id === c.id
                  ? 'bg-cyan-950 border-cyan-600 text-cyan-300 shadow-panel font-semibold'
                  : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
              }`}
            >
              <span>{c.avatar_initials}</span>
              <span className="hidden sm:inline">{c.callsign}</span>
            </button>
          ))}
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

      {/* Baseline Metric Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 font-mono">
        <div className="bg-space-850 border border-space-700 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase">Resting HR</div>
          <div className="text-base font-bold text-white mt-1">
            {selectedCrew.baseline_profile['resting_heart_rate'] || 60} <span className="text-xs font-normal text-slate-400">bpm</span>
          </div>
          <div className="text-[9px] text-emerald-400 mt-0.5">Personal Baseline</div>
        </div>

        <div className="bg-space-850 border border-space-700 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase">HRV RMSSD</div>
          <div className="text-base font-bold text-white mt-1">
            {selectedCrew.baseline_profile['hrv_rmssd'] || 58} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[9px] text-emerald-400 mt-0.5">Autonomic Tone</div>
        </div>

        <div className="bg-space-850 border border-space-700 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase">Target Sleep</div>
          <div className="text-base font-bold text-white mt-1">
            {selectedCrew.baseline_profile['sleep_target_hours'] || 8.0} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <div className="text-[9px] text-cyan-400 mt-0.5">Daily Allocation</div>
        </div>

        <div className="bg-space-850 border border-space-700 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase">Cycle Target</div>
          <div className="text-base font-bold text-white mt-1">
            {selectedCrew.baseline_profile['exercise_target_watts'] || 185} <span className="text-xs font-normal text-slate-400">W</span>
          </div>
          <div className="text-[9px] text-purple-400 mt-0.5">Prescribed Dose</div>
        </div>

        <div className="bg-space-850 border border-space-700 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase">PVT Latency</div>
          <div className="text-base font-bold text-white mt-1">
            {selectedCrew.baseline_profile['pvt_reaction_time_ms'] || 215} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[9px] text-cyan-400 mt-0.5">Cognitive Baseline</div>
        </div>

        <div className="bg-space-850 border border-space-700 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase">Cumulative Dose</div>
          <div className="text-base font-bold text-white mt-1">
            {selectedCrew.baseline_profile['cumulative_radiation_msv'] || 140} <span className="text-xs font-normal text-slate-400">mSv</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">Career Limit &lt; 600</div>
        </div>
      </div>

      {/* Two Main Telemetry Charts: Sleep Duration & Autonomic Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-space-850 border border-space-700/80 rounded-xl p-5 shadow-panel space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Sleep Duration vs 8.0h Target Baseline</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Notice consecutive sub-6h sleep deprivation on Days 117, 118, 119, and 120.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              9.8h DEFICIT
            </span>
          </div>
          <TelemetryChart options={sleepChartOptions} height={230} />
        </div>

        <div className="bg-space-850 border border-space-700/80 rounded-xl p-5 shadow-panel space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>HRV RMSSD Autonomic Tone Collapse</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Parasympathetic vagal tone plummeted from 58ms baseline to 27ms (z = -4.1).
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              SYMPATHETIC OVERDRIVE
            </span>
          </div>
          <TelemetryChart options={hrvChartOptions} height={230} />
        </div>
      </div>

      {/* Four Detailed Health Domains Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase font-mono">
          INDIVIDUAL DOMAIN EVALUATIONS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Cardiovascular */}
          <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white">Cardiovascular & Autonomic State</span>
              </div>
              <StatusBadge status={selectedCrew.domain_status?.cardiovascular?.status || 'UNKNOWN'} size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedCrew.domain_status?.cardiovascular?.summary || 'No telemetry recorded.'}
            </p>
            <div className="pt-2 border-t border-space-700/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Resting HR: {selectedCrew.baseline_profile?.resting_heart_rate} bpm</span>
              <span>HRV RMSSD: {selectedCrew.baseline_profile?.hrv_rmssd} ms</span>
            </div>
          </div>

          {/* Card 2: Musculoskeletal */}
          <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Musculoskeletal & Countermeasures</span>
              </div>
              <StatusBadge status={selectedCrew.domain_status?.musculoskeletal?.status || 'UNKNOWN'} size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedCrew.domain_status?.musculoskeletal?.summary || 'No telemetry recorded.'}
            </p>
            <div className="pt-2 border-t border-space-700/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Ergometer Target: {selectedCrew.baseline_profile?.exercise_target_watts} W</span>
              <span>VO2 Max: {selectedCrew.baseline_profile?.vo2_max_est} mL/kg</span>
            </div>
          </div>

          {/* Card 3: Neurocognitive & Sleep */}
          <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white">Sleep, Fatigue & Neurocognitive State</span>
              </div>
              <StatusBadge status={selectedCrew.domain_status?.neuro_cognitive_sleep?.status || 'UNKNOWN'} size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedCrew.domain_status?.neuro_cognitive_sleep?.summary || 'No telemetry recorded.'}
            </p>
            <div className="pt-2 border-t border-space-700/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Target Sleep: {selectedCrew.baseline_profile?.sleep_target_hours} hrs</span>
              <span>PVT Latency: {selectedCrew.baseline_profile?.pvt_reaction_time_ms} ms</span>
            </div>
          </div>

          {/* Card 4: Radiation & Environment */}
          <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radiation className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Radiation & Habitation Context</span>
              </div>
              <StatusBadge status={selectedCrew.domain_status?.radiation_environment?.status || 'UNKNOWN'} size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedCrew.domain_status?.radiation_environment?.summary || 'No telemetry recorded.'}
            </p>
            <div className="pt-2 border-t border-space-700/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Cumulative: {selectedCrew.baseline_profile?.cumulative_radiation_msv} mSv</span>
              <span>Dosimeter: Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
