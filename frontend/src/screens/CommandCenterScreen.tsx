import React from 'react';
import { Mission, CrewMember, LedgerEvent, HealthStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { TelemetryChart } from '../components/common/TelemetryChart';
import { ScreenId } from '../components/layout/Sidebar';
import {
  Heart,
  Dumbbell,
  Moon,
  Radiation,
  AlertTriangle,
  Flame,
  Gauge,
  WifiOff,
  History,
  ArrowRight,
  TrendingUp,
  Database,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface CommandCenterScreenProps {
  mission: Mission | null;
  crewMembers: CrewMember[];
  recentEvents: LedgerEvent[];
  selectedCrew: CrewMember | null;
  onSelectCrew: (crew: CrewMember) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const CommandCenterScreen: React.FC<CommandCenterScreenProps> = ({
  mission,
  crewMembers,
  recentEvents,
  selectedCrew,
  onSelectCrew,
  onNavigate,
}) => {
  // Dynamically compute chart telemetry based on currently selected crew member
  const getCrewTelemetryData = () => {
    if (!selectedCrew) {
      return {
        hr: [61, 66, 71, 74, 78],
        hrv: [58, 46, 38, 32, 27],
        pvt: [43, 48, 55, 62, 65],
        labels: ['Day 116', 'Day 117 (Drill)', 'Day 118 (Workload)', 'Day 119 (Fatigue)', 'Day 120 (Incident)'],
      };
    }

    if (selectedCrew.callsign === 'CADUCEUS') {
      // Dr. Sarah Chen: Stable baseline
      return {
        hr: [56, 56, 57, 56, 57],
        hrv: [64, 65, 64, 63, 64],
        pvt: [41, 41, 42, 41, 42],
        labels: ['Day 116', 'Day 117', 'Day 118', 'Day 119', 'Day 120'],
      };
    }

    if (selectedCrew.callsign === 'VULCAN') {
      // Marcus Vance: High workload watch
      return {
        hr: [64, 65, 66, 67, 68],
        hrv: [52, 50, 48, 45, 43],
        pvt: [44, 46, 49, 52, 53],
        labels: ['Day 116', 'Day 117', 'Day 118 (Overtime)', 'Day 119', 'Day 120'],
      };
    }

    if (selectedCrew.callsign === 'AURORA') {
      // Elena Rostova: Demonstrates missing data handling
      return {
        hr: [62, 62, 63, null, null],
        hrv: [55, 54, 55, null, null],
        pvt: [43, 44, 44, null, null],
        labels: ['Day 116', 'Day 117', 'Day 118', 'Day 119 (Sensor Loss)', 'Day 120 (Offline)'],
      };
    }

    // Default to Commander Alex Morgan
    return {
      hr: [61, 66, 71, 74, 78],
      hrv: [58, 46, 38, 32, 27],
      pvt: [43, 48, 55, 62, 65],
      labels: ['Day 116', 'Day 117 (Drill)', 'Day 118 (Workload)', 'Day 119 (Fatigue)', 'Day 120 (Incident)'],
    };
  };

  const currentTelemetry = getCrewTelemetryData();

  const previewChartOptions = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['Resting HR (bpm)', 'HRV RMSSD (ms)', 'PVT Latency (ms / 5)'],
      textStyle: { color: '#94a3b8', fontSize: 11 },
      top: 0,
    },
    xAxis: {
      type: 'category',
      data: currentTelemetry.labels,
      axisLine: { lineStyle: { color: '#1e2c4c' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    series: [
      {
        name: 'Resting HR (bpm)',
        type: 'line',
        smooth: true,
        connectNulls: false,
        data: currentTelemetry.hr,
        itemStyle: { color: '#f43f5e' },
        lineStyle: { width: 2 },
      },
      {
        name: 'HRV RMSSD (ms)',
        type: 'line',
        smooth: true,
        connectNulls: false,
        data: currentTelemetry.hrv,
        itemStyle: { color: '#06b6d4' },
        lineStyle: { width: 2 },
      },
      {
        name: 'PVT Latency (ms / 5)',
        type: 'line',
        smooth: true,
        connectNulls: false,
        data: currentTelemetry.pvt,
        itemStyle: { color: '#eab308' },
        lineStyle: { width: 2, type: 'dashed' },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-space-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              MODULE A — MISSION COMMAND
            </span>
            <span className="text-xs font-mono text-slate-400">
              ORBITAL TRACK: MARS TRANSIT CORRIDOR
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Deep-Space Crew Health & Event Operations Center
          </h1>
          <p className="text-xs text-slate-400">
            Real-time multi-domain health intelligence, temporal event monitoring, and clinical decision support.
          </p>
        </div>

        {/* Global Mission Status Pill */}
        <div className="flex items-center gap-2">
          <div className="bg-space-900 border border-space-700 rounded-lg p-2.5 text-right font-mono">
            <div className="text-[10px] text-slate-400 uppercase">INTELLIGENCE ENGINE</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              ONBOARD DETERMINISTIC ACTIVE
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Crew Status Banner */}
      {selectedCrew?.status === 'REVIEW_REQUIRED' && (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-4 shadow-glow-rose flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-rose-900/60 border border-rose-600/80 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wide">
                  ACTIVE INCIDENT: INC-ARES4-120-001
                </span>
                <StatusBadge status="REVIEW_REQUIRED" size="sm" />
                <span className="text-[11px] font-mono text-slate-400">Recorded Day 120, 09:42 MET</span>
              </div>
              <h3 className="text-sm font-semibold text-white mt-0.5">
                {selectedCrew.name} — Acute Transient Orthostatic Presyncope Episode
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                Post-egress blood pressure collapse (88/56 mmHg) and compensatory tachycardia (118 bpm) following 72-hour cumulative sleep debt (9.8h deficit) and omitted aerobic countermeasure.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('incident_reconstruction')}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-semibold rounded-lg shadow-panel flex items-center gap-2 shrink-0 transition-all font-mono"
          >
            <span>RECONSTRUCT INCIDENT TIMELINE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedCrew?.status === 'UNKNOWN' && (
        <div className="bg-slate-900/80 border border-slate-600/70 rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase">
                  DATA INCOMPLETENESS WARNING: {selectedCrew.name}
                </span>
                <StatusBadge status="UNKNOWN" size="sm" />
              </div>
              <p className="text-xs text-slate-300 font-sans mt-1">
                Biometric patch telemetry offline since Day 119 18:00. Under MOSAIC-9 scientific integrity rules, unmeasured states are strictly classified as UNKNOWN rather than assumed healthy. Confidence penalized to 41%.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('event_ledger')}
            className="px-3.5 py-2 bg-space-800 hover:bg-space-700 border border-space-600 text-slate-200 text-xs rounded-lg shrink-0"
          >
            INSPECT SENSOR AUDIT LOGS
          </button>
        </div>
      )}

      {selectedCrew?.status === 'STABLE' && (
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                  CREW MEMBER HEALTH NOMINAL: {selectedCrew.name}
                </span>
                <StatusBadge status="STABLE" size="sm" />
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                All cardiovascular, neurocognitive, and countermeasure metrics are operating within 1-sigma personal baseline tolerance.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedCrew?.status === 'WATCH' && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                  MONITORING WATCH: {selectedCrew.name}
                </span>
                <StatusBadge status="WATCH" size="sm" />
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedCrew.status_explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Grid: Cabin Telemetry & Crew Roster */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="bg-space-850 border border-space-700/80 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 uppercase flex items-center justify-between">
            <span>MISSION ELAPSED</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white mt-1">DAY 120</div>
          <div className="text-[10px] text-slate-400 mt-0.5">MET 2894h 15m 22s</div>
        </div>

        <div className="bg-space-850 border border-space-700/80 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 uppercase flex items-center justify-between">
            <span>EARTH COMM DELAY</span>
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-300 mt-1">21.0 MIN</div>
          <div className="text-[10px] text-slate-400 mt-0.5">One-Way Light Time Delay</div>
        </div>

        <div className="bg-space-850 border border-space-700/80 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 uppercase flex items-center justify-between">
            <span>CABIN PRESSURE</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-1">101.1 kPa</div>
          <div className="text-[10px] text-slate-400 mt-0.5">O2: 20.9% | CO2: 3.2 mmHg</div>
        </div>

        <div className="bg-space-850 border border-space-700/80 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 uppercase flex items-center justify-between">
            <span>AMBIENT RADIATION</span>
            <Radiation className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-purple-300 mt-1">52.4 µSv/h</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Transit Shield Nominal</div>
        </div>
      </div>

      {/* Crew Health Matrix */}
      <div className="bg-space-850 border border-space-700/80 rounded-xl p-5 shadow-panel">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              CREW COMPLEMENT HEALTH STATUS
            </h2>
            <p className="text-xs text-slate-400">
              Click any astronaut to inspect individual twin baseline and historical telemetry.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Total Complement: 4 Astronauts
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {crewMembers.map((member) => {
            const isSelected = selectedCrew?.id === member.id;
            return (
              <div
                key={member.id}
                onClick={() => onSelectCrew(member)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-space-800 border-cyan-500/80 shadow-glow-cyan'
                    : 'bg-space-900/90 border-space-700/70 hover:border-space-600 hover:bg-space-800/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-space-800 border border-space-700 flex items-center justify-center font-mono font-bold text-cyan-300 text-xs">
                      {member.avatar_initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[120px]">
                        {member.name}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400">{member.callsign}</p>
                    </div>
                  </div>
                  <StatusBadge status={member.status} size="sm" showIcon={false} />
                </div>

                <div className="mt-3 text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {member.status_explanation}
                </div>

                {/* Completeness & Confidence Telemetry Bar */}
                <div className="mt-4 pt-3 border-t border-space-700/60 space-y-1.5 font-mono text-[10px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Completeness:</span>
                    <span className="text-slate-200">{Math.round(member.overall_data_completeness * 100)}%</span>
                  </div>
                  <div className="w-full bg-space-950 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full ${
                        member.overall_data_completeness > 0.8
                          ? 'bg-cyan-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${member.overall_data_completeness * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 pt-1">
                    <span>Confidence:</span>
                    <span className={member.overall_confidence_score > 0.8 ? 'text-emerald-400' : 'text-amber-400'}>
                      {(member.overall_confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Grid: Multi-Day Lead-Lag Telemetry Chart & Dynamic Domain Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Temporal Multi-Day Trend */}
        <div className="lg:col-span-2 bg-space-850 border border-space-700/80 rounded-xl p-5 shadow-panel space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                <span>TEMPORAL SIGNAL DEVIATION — DAYS 116 TO 120</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {selectedCrew?.name || 'ALEX MORGAN'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Observes multi-signal interactions across sleep duration, heart rate variability, and cognitive vigilance.
              </p>
            </div>
            <button
              onClick={() => onNavigate('temporal_intelligence')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>TEMPORAL ENGINE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <TelemetryChart options={previewChartOptions} height={250} />
        </div>

        {/* Right 1 Col: Dynamic 4 Domain Status Matrix */}
        <div className="bg-space-850 border border-space-700/80 rounded-xl p-5 shadow-panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase font-mono">
              PHYSIOLOGICAL DOMAIN MATRIX
            </h2>
            <span className="text-[10px] font-mono text-cyan-400">{selectedCrew?.callsign}</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-space-900 border border-space-700 flex items-start gap-3">
              <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Cardiovascular</span>
                  <StatusBadge status={selectedCrew?.domain_status?.cardiovascular?.status || 'UNKNOWN'} size="sm" showIcon={false} />
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  {selectedCrew?.domain_status?.cardiovascular?.summary || 'No telemetry recorded.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-space-900 border border-space-700 flex items-start gap-3">
              <Dumbbell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Musculoskeletal</span>
                  <StatusBadge status={selectedCrew?.domain_status?.musculoskeletal?.status || 'UNKNOWN'} size="sm" showIcon={false} />
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  {selectedCrew?.domain_status?.musculoskeletal?.summary || 'No telemetry recorded.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-space-900 border border-space-700 flex items-start gap-3">
              <Moon className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Sleep & Cognitive</span>
                  <StatusBadge status={selectedCrew?.domain_status?.neuro_cognitive_sleep?.status || 'UNKNOWN'} size="sm" showIcon={false} />
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  {selectedCrew?.domain_status?.neuro_cognitive_sleep?.summary || 'No telemetry recorded.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-space-900 border border-space-700 flex items-start gap-3">
              <Radiation className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Radiation & Habitat</span>
                  <StatusBadge status={selectedCrew?.domain_status?.radiation_environment?.status || 'UNKNOWN'} size="sm" showIcon={false} />
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  {selectedCrew?.domain_status?.radiation_environment?.summary || 'No telemetry recorded.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ledger Events Stream Preview */}
      <div className="bg-space-850 border border-space-700/80 rounded-xl p-5 shadow-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase font-mono">
              RECENT HEALTH & MISSION LEDGER STREAM
            </h2>
            <p className="text-xs text-slate-400">
              Chronologically ordered observations, symptoms, and environment alerts.
            </p>
          </div>
          <button
            onClick={() => onNavigate('event_ledger')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>FULL LEDGER</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-space-700 text-slate-400">
                <th className="py-2.5 px-3">UID</th>
                <th className="py-2.5 px-3">DAY / MET</th>
                <th className="py-2.5 px-3">CATEGORY</th>
                <th className="py-2.5 px-3">TITLE & DESCRIPTION</th>
                <th className="py-2.5 px-3">SEVERITY</th>
                <th className="py-2.5 px-3">QUALITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-800">
              {recentEvents.slice(0, 5).map((evt) => (
                <tr key={evt.id} className="hover:bg-space-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-cyan-400">{evt.event_uid}</td>
                  <td className="py-2.5 px-3 text-slate-300">Day {evt.mission_day}</td>
                  <td className="py-2.5 px-3 text-slate-300 uppercase">{evt.event_category.replace('_', ' ')}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-200">
                    <span className="font-semibold">{evt.title}</span> — {evt.description}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : evt.severity === 'HIGH' || evt.severity === 'MODERATE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-space-900 text-slate-300 border border-space-700'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">{evt.data_quality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
