import React, { useState } from 'react';
import { CrewMember } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { TelemetryChart } from '../components/common/TelemetryChart';
import { Heart, Dumbbell, Moon, Radiation, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HealthDomainScreenProps {
  selectedCrew: CrewMember | null;
}

export const HealthDomainScreen: React.FC<HealthDomainScreenProps> = ({ selectedCrew }) => {
  const [activeTab, setActiveTab] = useState<'cardio' | 'musc' | 'neuro' | 'rad'>('cardio');

  if (!selectedCrew) return null;

  // Domain Chart Configurations dynamically driven by selected crew member
  const getDomainData = () => {
    if (selectedCrew.callsign === 'CADUCEUS') {
      // Dr. Sarah Chen
      return {
        cardio: {
          sbp: [112, 112, 113, 112, 112],
          dbp: [72, 72, 72, 73, 72],
          hr: [56, 56, 57, 56, 57],
        },
        musc: {
          workload: [170, 172, 170, 170, 171],
          target: 170,
        },
        neuro: {
          pvt: [208, 209, 210, 208, 212],
          fatigue: [1.0, 1.5, 1.0, 1.5, 1.0],
        },
        rad: {
          dosimeter: [48.5, 49.0, 49.2, 48.8, 49.1],
          co2: [2.7, 2.8, 2.9, 2.8, 2.8],
        },
      };
    }

    if (selectedCrew.callsign === 'VULCAN') {
      // Marcus Vance
      return {
        cardio: {
          sbp: [122, 122, 124, 125, 124],
          dbp: [78, 78, 80, 80, 79],
          hr: [64, 65, 66, 67, 68],
        },
        musc: {
          workload: [175, 170, 160, 150, 165],
          target: 175,
        },
        neuro: {
          pvt: [222, 228, 235, 245, 250],
          fatigue: [2.5, 3.0, 4.0, 5.0, 5.5],
        },
        rad: {
          dosimeter: [52.0, 54.0, 56.5, 55.0, 54.2],
          co2: [2.7, 2.9, 3.5, 3.2, 3.1],
        },
      };
    }

    if (selectedCrew.callsign === 'AURORA') {
      // Elena Rostova (Demonstrates missing data handling on Days 119-120)
      return {
        cardio: {
          sbp: [116, 116, 115, null, null],
          dbp: [74, 74, 73, null, null],
          hr: [62, 62, 63, null, null],
        },
        musc: {
          workload: [165, 165, 160, null, null],
          target: 165,
        },
        neuro: {
          pvt: [218, 220, 219, null, null],
          fatigue: [2.0, 2.5, 2.5, null, null],
        },
        rad: {
          dosimeter: [49.5, 50.0, 50.2, 50.1, 50.4],
          co2: [2.7, 2.9, 3.5, 3.2, 3.1],
        },
      };
    }

    // Default to Commander Alex Morgan
    return {
      cardio: {
        sbp: [117, 114, 110, 104, 88],
        dbp: [76, 74, 72, 68, 56],
        hr: [61, 66, 71, 74, 118],
      },
      musc: {
        workload: [186, 174, 145, 0, 0],
        target: 185,
      },
      neuro: {
        pvt: [215, 242, 275, 310, 320],
        fatigue: [2.0, 3.5, 5.0, 7.0, 8.5],
      },
      rad: {
        dosimeter: [51.2, 52.8, 54.0, 55.4, 52.4],
        co2: [2.7, 2.9, 3.5, 3.2, 3.1],
      },
    };
  };

  const domainData = getDomainData();

  const cardioChartOptions = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Systolic BP (mmHg)', 'Diastolic BP (mmHg)', 'Heart Rate (bpm)'], textStyle: { color: '#94a3b8' } },
    xAxis: {
      type: 'category',
      data: ['Day 116', 'Day 117', 'Day 118', 'Day 119', 'Day 120'],
      axisLine: { lineStyle: { color: '#1e2c4c' } },
      axisLabel: { color: '#64748b' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: '#64748b' },
    },
    series: [
      { name: 'Systolic BP (mmHg)', type: 'line', connectNulls: false, data: domainData.cardio.sbp, itemStyle: { color: '#f43f5e' } },
      { name: 'Diastolic BP (mmHg)', type: 'line', connectNulls: false, data: domainData.cardio.dbp, itemStyle: { color: '#fb7185' } },
      { name: 'Heart Rate (bpm)', type: 'line', connectNulls: false, data: domainData.cardio.hr, itemStyle: { color: '#38bdf8' } },
    ],
  };

  const muscChartOptions = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Ergometer Workload (W)', `Target Protocol (${domainData.musc.target}W)`], textStyle: { color: '#94a3b8' } },
    xAxis: {
      type: 'category',
      data: ['Day 116', 'Day 117', 'Day 118', 'Day 119', 'Day 120'],
      axisLine: { lineStyle: { color: '#1e2c4c' } },
      axisLabel: { color: '#64748b' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: '#64748b' },
    },
    series: [
      {
        name: 'Ergometer Workload (W)',
        type: 'bar',
        barWidth: '40%',
        data: domainData.musc.workload,
        itemStyle: {
          color: (p: any) => (p.value === null ? '#475569' : p.value === 0 ? '#ef4444' : p.value < 160 ? '#f59e0b' : '#10b981'),
        },
      },
      {
        name: `Target Protocol (${domainData.musc.target}W)`,
        type: 'line',
        data: Array(5).fill(domainData.musc.target),
        itemStyle: { color: '#06b6d4' },
        lineStyle: { type: 'dashed' },
      },
    ],
  };

  const neuroChartOptions = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['PVT Reaction Latency (ms)', 'Fatigue Score (1-10)'], textStyle: { color: '#94a3b8' } },
    xAxis: {
      type: 'category',
      data: ['Day 116', 'Day 117', 'Day 118', 'Day 119', 'Day 120'],
      axisLine: { lineStyle: { color: '#1e2c4c' } },
      axisLabel: { color: '#64748b' },
    },
    yAxis: [
      { type: 'value', name: 'Latency (ms)', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#64748b' } },
      { type: 'value', name: 'Score', max: 10, axisLabel: { color: '#64748b' } },
    ],
    series: [
      { name: 'PVT Reaction Latency (ms)', type: 'line', connectNulls: false, data: domainData.neuro.pvt, itemStyle: { color: '#f59e0b' } },
      { name: 'Fatigue Score (1-10)', type: 'bar', yAxisIndex: 1, barWidth: '30%', data: domainData.neuro.fatigue, itemStyle: { color: '#ec4899' } },
    ],
  };

  const radChartOptions = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Dosimeter Rate (µSv/h)', 'Cabin CO2 (mmHg)'], textStyle: { color: '#94a3b8' } },
    xAxis: {
      type: 'category',
      data: ['Day 116', 'Day 117', 'Day 118', 'Day 119', 'Day 120'],
      axisLine: { lineStyle: { color: '#1e2c4c' } },
      axisLabel: { color: '#64748b' },
    },
    yAxis: [
      { type: 'value', name: 'µSv/h', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#64748b' } },
      { type: 'value', name: 'mmHg', min: 1.5, max: 4.5, axisLabel: { color: '#64748b' } },
    ],
    series: [
      { name: 'Dosimeter Rate (µSv/h)', type: 'line', data: domainData.rad.dosimeter, itemStyle: { color: '#a855f7' } },
      { name: 'Cabin CO2 (mmHg)', type: 'line', yAxisIndex: 1, data: domainData.rad.co2, itemStyle: { color: '#10b981' } },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-space-700/60 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              MODULE C — DOMAIN TELEMETRY
            </span>
            <span className="text-xs font-mono text-slate-400">DEEP DIVE MULTI-MODAL METRICS</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Physiological & Environmental Domains</span>
            <span className="text-cyan-400 font-mono text-base">({selectedCrew.name})</span>
          </h1>
          <p className="text-xs text-slate-400">
            Compare individual domain performance, countermeasure compliance, and environmental stress context.
          </p>
        </div>

        {/* Domain Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-space-900 border border-space-700 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('cardio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'cardio' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold shadow-panel' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Cardiovascular</span>
          </button>

          <button
            onClick={() => setActiveTab('musc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'musc' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold shadow-panel' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
            <span>Musculoskeletal</span>
          </button>

          <button
            onClick={() => setActiveTab('neuro')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'neuro' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold shadow-panel' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-rose-400" />
            <span>Sleep & Cognitive</span>
          </button>

          <button
            onClick={() => setActiveTab('rad')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'rad' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold shadow-panel' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radiation className="w-3.5 h-3.5 text-purple-400" />
            <span>Radiation / Habitat</span>
          </button>
        </div>
      </div>

      {/* Active Domain Panel Content */}
      {activeTab === 'cardio' && (
        <div className="space-y-6">
          <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Cardiovascular & Hemodynamic Response — {selectedCrew.name}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedCrew.domain_status?.cardiovascular?.summary || 'Nominal hemodynamic observations.'}
                </p>
              </div>
              <StatusBadge status={selectedCrew.domain_status?.cardiovascular?.status || 'UNKNOWN'} size="sm" />
            </div>

            <TelemetryChart options={cardioChartOptions} height={260} />

            <div className="p-3 rounded-lg bg-space-900 border border-space-700 text-xs text-slate-300 font-mono">
              <span className="text-cyan-400 font-semibold">SCIENTIFIC RESTRICTION:</span> Microgravity cephalad fluid redistribution decreases lower-limb vascular tone and reduces effective circulating plasma volume. Orthostatic intolerance is common post-transit, but acute collapse requires evaluating multi-day predisposing sleep debt and hydration status.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'musc' && (
        <div className="space-y-6">
          <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-amber-400" />
                  <span>Exercise Countermeasure Adherence & Power Output — {selectedCrew.name}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedCrew.domain_status?.musculoskeletal?.summary || 'Standard exercise countermeasure logs.'}
                </p>
              </div>
              <StatusBadge status={selectedCrew.domain_status?.musculoskeletal?.status || 'UNKNOWN'} size="sm" />
            </div>

            <TelemetryChart options={muscChartOptions} height={260} />

            <div className="p-3 rounded-lg bg-space-900 border border-space-700 text-xs text-slate-300 font-mono">
              <span className="text-amber-400 font-semibold">SCIENTIFIC RESTRICTION:</span> Exercise compliance is NOT a direct measurement of bone mineral density or skeletal muscle atrophy. It measures mechanical work performed on prescribed countermeasure hardware.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'neuro' && (
        <div className="space-y-6">
          <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Moon className="w-4 h-4 text-rose-400" />
                  <span>Sleep & Psychomotor Vigilance State — {selectedCrew.name}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedCrew.domain_status?.neuro_cognitive_sleep?.summary || 'Sleep and neurobehavioral vigilance monitoring.'}
                </p>
              </div>
              <StatusBadge status={selectedCrew.domain_status?.neuro_cognitive_sleep?.status || 'UNKNOWN'} size="sm" />
            </div>

            <TelemetryChart options={neuroChartOptions} height={260} />

            <div className="p-3 rounded-lg bg-space-900 border border-space-700 text-xs text-slate-300 font-mono">
              <span className="text-rose-400 font-semibold">SCIENTIFIC RESTRICTION:</span> Subjective fatigue is a clinical symptom, not a medical diagnosis. PVT latency measures neurobehavioral alertness degradation secondary to sleep loss, not permanent neurological injury.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rad' && (
        <div className="space-y-6">
          <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Radiation className="w-4 h-4 text-purple-400" />
                  <span>Habitation Environment & Radiation Dosimetry — {selectedCrew.name}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedCrew.domain_status?.radiation_environment?.summary || 'Ambient radiation dosimeter and cabin atmospheric sensors.'}
                </p>
              </div>
              <StatusBadge status={selectedCrew.domain_status?.radiation_environment?.status || 'UNKNOWN'} size="sm" />
            </div>

            <TelemetryChart options={radChartOptions} height={260} />

            <div className="p-3 rounded-lg bg-space-900 border border-space-700 text-xs text-slate-300 font-mono">
              <span className="text-purple-400 font-semibold">SCIENTIFIC RESTRICTION:</span> External solar telemetry (e.g., NASA DONKI space weather alerts) describes orbital environmental flux, NOT an astronaut's tissue-absorbed radiation dose. Dosimeter values here represent calibrated synthetic instrument telemetry.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
