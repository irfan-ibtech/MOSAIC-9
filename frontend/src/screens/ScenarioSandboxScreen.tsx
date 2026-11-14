import React, { useState, useEffect } from 'react';
import { CrewMember, CountermeasureScenario } from '../types';
import { mosaicApi } from '../services/api';
import { TelemetryChart } from '../components/common/TelemetryChart';
import { DEFAULT_CREW_MEMBERS, DEFAULT_SCENARIOS, CREW_SIMULATION_DEFAULTS } from '../data/initialData';
import {
  Sliders,
  Play,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';

interface ScenarioSandboxScreenProps {
  selectedCrew: CrewMember | null;
  crewMembers?: CrewMember[];
  onSelectCrew?: (crew: CrewMember) => void;
}

export const ScenarioSandboxScreen: React.FC<ScenarioSandboxScreenProps> = ({
  selectedCrew,
  crewMembers,
  onSelectCrew,
}) => {
  const list = crewMembers && crewMembers.length > 0 ? crewMembers : DEFAULT_CREW_MEMBERS;
  const crew = selectedCrew || list[0] || DEFAULT_CREW_MEMBERS[0];

  const crewConfig = CREW_SIMULATION_DEFAULTS[crew.id] || CREW_SIMULATION_DEFAULTS[1];

  const [scenarios, setScenarios] = useState<CountermeasureScenario[]>(() =>
    DEFAULT_SCENARIOS.filter((s) => s.crew_member_id === crew.id)
  );

  const [scenarioName, setScenarioName] = useState(crewConfig.alpha.name);
  const [sleepDelta, setSleepDelta] = useState<number>(crewConfig.alpha.sleepDelta);
  const [workloadDelta, setWorkloadDelta] = useState<number>(crewConfig.alpha.workloadDelta);
  const [ergoWatts, setErgoWatts] = useState<number>(crewConfig.alpha.ergoWatts);
  const [hydrationMl, setHydrationMl] = useState<number>(crewConfig.alpha.hydrationMl);
  const [ambientCo2, setAmbientCo2] = useState<number>(crewConfig.alpha.ambientCo2);

  const [activeSimulationResult, setActiveSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sync state whenever the active astronaut changes
  useEffect(() => {
    const config = CREW_SIMULATION_DEFAULTS[crew.id] || CREW_SIMULATION_DEFAULTS[1];

    setScenarioName(config.alpha.name);
    setSleepDelta(config.alpha.sleepDelta);
    setWorkloadDelta(config.alpha.workloadDelta);
    setErgoWatts(config.alpha.ergoWatts);
    setHydrationMl(config.alpha.hydrationMl);
    setAmbientCo2(config.alpha.ambientCo2);

    // Fetch astronaut-specific scenarios from backend or local fallback
    mosaicApi.getScenarios(crew.id).then((resList) => {
      if (resList && resList.length > 0) {
        setScenarios(resList.filter((s) => s.crew_member_id === crew.id));
      } else {
        setScenarios(DEFAULT_SCENARIOS.filter((s) => s.crew_member_id === crew.id));
      }
    });

    // Run baseline simulation for this astronaut's Alpha preset
    mosaicApi
      .simulateScenario({
        crew_member_id: crew.id,
        name: config.alpha.name,
        sleep_delta_hours: config.alpha.sleepDelta,
        workload_delta_pct: config.alpha.workloadDelta,
        cycle_ergometer_watts: config.alpha.ergoWatts,
        hydration_fluid_ml: config.alpha.hydrationMl,
        ambient_co2_target_mmhg: config.alpha.ambientCo2,
      })
      .then((sim) => {
        setActiveSimulationResult(sim);
      })
      .catch(() => {
        // Safe fallback matching crew config
        setActiveSimulationResult({
          scenario: {
            id: Date.now(),
            crew_member_id: crew.id,
            incident_id: null,
            name: config.alpha.name,
            description: 'Astronaut-specific recovery baseline simulation.',
            inputs: config.alpha,
            projections: {
              projected_hrv_rmssd: config.baseHrv,
              projected_resting_hr: config.baseHr,
              projected_systolic_bp: config.baseBp,
              projected_pvt_latency_ms: config.basePvt,
              projected_fatigue_index: 2.0,
              time_to_stability_hours: 24,
              risk_recurrence_pct: 10,
              trajectory_hourly: [
                { hour: 0, hrv: config.currentHrv, hr: config.currentHr, bp: config.currentBp, pvt: config.currentPvt },
                { hour: 12, hrv: Math.round(config.currentHrv + (config.baseHrv - config.currentHrv) * 0.4), hr: Math.round(config.currentHr + (config.baseHr - config.currentHr) * 0.4), bp: Math.round(config.currentBp + (config.baseBp - config.currentBp) * 0.4), pvt: Math.round(config.currentPvt + (config.basePvt - config.currentPvt) * 0.4) },
                { hour: 24, hrv: Math.round(config.currentHrv + (config.baseHrv - config.currentHrv) * 0.8), hr: Math.round(config.currentHr + (config.baseHr - config.currentHr) * 0.8), bp: Math.round(config.currentBp + (config.baseBp - config.currentBp) * 0.8), pvt: Math.round(config.currentPvt + (config.basePvt - config.currentPvt) * 0.8) },
                { hour: 48, hrv: config.baseHrv, hr: config.baseHr, bp: config.baseBp, pvt: config.basePvt },
              ],
            },
            is_active: true,
          },
          baseline_comparison: {
            hrv: { current: config.currentHrv, projected: config.baseHrv, baseline: config.baseHrv, unit: 'ms' },
            hr: { current: config.currentHr, projected: config.baseHr, baseline: config.baseHr, unit: 'bpm' },
            bp: { current: config.currentBp, projected: config.baseBp, baseline: config.baseBp, unit: 'mmHg' },
            pvt: { current: config.currentPvt, projected: config.basePvt, baseline: config.basePvt, unit: 'ms' },
          },
        });
      });
  }, [crew.id]);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await mosaicApi.simulateScenario({
        crew_member_id: crew.id,
        name: scenarioName,
        sleep_delta_hours: sleepDelta,
        workload_delta_pct: workloadDelta,
        cycle_ergometer_watts: ergoWatts,
        hydration_fluid_ml: hydrationMl,
        ambient_co2_target_mmhg: ambientCo2,
      });
      setActiveSimulationResult(res);
      // Reload list
      mosaicApi.getScenarios(crew.id).then((resList) => {
        if (resList && resList.length > 0) {
          setScenarios(resList.filter((s) => s.crew_member_id === crew.id));
        }
      });
    } catch (err) {
      alert('Simulation error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setSleepDelta(0.0);
    setWorkloadDelta(0);
    setErgoWatts(crew.baseline_profile?.exercise_target_watts || 175);
    setHydrationMl(500);
    setAmbientCo2(2.5);
    setScenarioName(`Neutral Schedule (Baseline Nominal Maintenance)`);
  };

  const handleLoadPreset = (preset: 'alpha' | 'bravo') => {
    const config = CREW_SIMULATION_DEFAULTS[crew.id] || CREW_SIMULATION_DEFAULTS[1];
    const target = preset === 'alpha' ? config.alpha : config.bravo;

    setScenarioName(target.name);
    setSleepDelta(target.sleepDelta);
    setWorkloadDelta(target.workloadDelta);
    setErgoWatts(target.ergoWatts);
    setHydrationMl(target.hydrationMl);
    setAmbientCo2(target.ambientCo2);
  };

  // Trajectory Recovery Chart Data
  const currentHrv = activeSimulationResult?.baseline_comparison?.hrv?.current ?? crewConfig.currentHrv;
  const projHrv = activeSimulationResult?.scenario?.projections?.projected_hrv_rmssd ?? activeSimulationResult?.baseline_comparison?.hrv?.projected ?? crewConfig.baseHrv;
  const baseHrv = activeSimulationResult?.baseline_comparison?.hrv?.baseline ?? crewConfig.baseHrv;
  const diffHrv = Math.round(((projHrv - currentHrv) / (currentHrv || 1)) * 100);

  const currentBp = activeSimulationResult?.baseline_comparison?.bp?.current ?? crewConfig.currentBp;
  const projBp = activeSimulationResult?.scenario?.projections?.projected_systolic_bp ?? activeSimulationResult?.baseline_comparison?.bp?.projected ?? crewConfig.baseBp;
  const baseBp = activeSimulationResult?.baseline_comparison?.bp?.baseline ?? crewConfig.baseBp;

  const currentHr = activeSimulationResult?.baseline_comparison?.hr?.current ?? crewConfig.currentHr;
  const projHr = activeSimulationResult?.scenario?.projections?.projected_resting_hr ?? activeSimulationResult?.baseline_comparison?.hr?.projected ?? crewConfig.baseHr;
  const baseHr = activeSimulationResult?.baseline_comparison?.hr?.baseline ?? crewConfig.baseHr;

  const currentPvt = activeSimulationResult?.baseline_comparison?.pvt?.current ?? crewConfig.currentPvt;
  const projPvt = activeSimulationResult?.scenario?.projections?.projected_pvt_latency_ms ?? activeSimulationResult?.baseline_comparison?.pvt?.projected ?? crewConfig.basePvt;
  const basePvt = activeSimulationResult?.baseline_comparison?.pvt?.baseline ?? crewConfig.basePvt;

  const timeToStability = activeSimulationResult?.scenario?.projections?.time_to_stability_hours ?? 24;
  const riskRecurrence = activeSimulationResult?.scenario?.projections?.risk_recurrence_pct ?? 12;

  const trajectoryData = activeSimulationResult?.scenario?.projections?.trajectory_hourly || [
    { hour: 0, hrv: currentHrv, hr: currentHr, bp: currentBp, pvt: currentPvt },
    { hour: 12, hrv: Math.round(currentHrv + (projHrv - currentHrv) * 0.35), hr: Math.round(currentHr + (projHr - currentHr) * 0.35), bp: Math.round(currentBp + (projBp - currentBp) * 0.45), pvt: Math.round(currentPvt + (projPvt - currentPvt) * 0.3) },
    { hour: 24, hrv: Math.round(currentHrv + (projHrv - currentHrv) * 0.70), hr: Math.round(currentHr + (projHr - currentHr) * 0.70), bp: Math.round(currentBp + (projBp - currentBp) * 0.80), pvt: Math.round(currentPvt + (projPvt - currentPvt) * 0.7) },
    { hour: 48, hrv: projHrv, hr: projHr, bp: projBp, pvt: projPvt },
  ];

  const trajectoryChartOptions = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['Simulated HRV (ms)', 'Simulated Systolic BP (mmHg)', 'Simulated HR (bpm)'],
      textStyle: { color: '#94a3b8' },
    },
    xAxis: {
      type: 'category',
      data: trajectoryData.map((d: any) => `T+${d.hour}h`),
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
        name: 'Simulated HRV (ms)',
        type: 'line',
        smooth: true,
        data: trajectoryData.map((d: any) => d.hrv),
        itemStyle: { color: '#06b6d4' },
      },
      {
        name: 'Simulated Systolic BP (mmHg)',
        type: 'line',
        smooth: true,
        data: trajectoryData.map((d: any) => d.bp),
        itemStyle: { color: '#10b981' },
      },
      {
        name: 'Simulated HR (bpm)',
        type: 'line',
        smooth: true,
        data: trajectoryData.map((d: any) => d.hr),
        itemStyle: { color: '#f43f5e' },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-space-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              MODULE F — COUNTERMEASURE SCENARIO SANDBOX
            </span>
            <span className="text-xs font-mono text-slate-400">HYPOTHETICAL PHYSIOLOGICAL SIMULATION</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
            <span>Countermeasure Exploration & Trajectory Sandbox</span>
            <span className="text-cyan-400 font-mono text-base">({crew.name})</span>
          </h1>
          <p className="text-xs text-slate-400">
            Model hypothetical recovery trajectories across sleep extensions, workload shifts, and fluid loading protocols.
          </p>
        </div>

        {/* Crew & Preset Switchers */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          {onSelectCrew && list.length > 0 && (
            <div className="flex items-center bg-space-900 border border-space-700 rounded-lg px-2.5 py-1">
              <span className="text-[11px] text-slate-400 font-mono mr-2">CREW:</span>
              <div className="relative inline-flex items-center">
                <select
                  value={crew.id}
                  onChange={(e) => {
                    const found = list.find((c) => c.id === Number(e.target.value));
                    if (found) onSelectCrew(found);
                  }}
                  className="appearance-none bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer pr-6"
                >
                  {list.map((c) => (
                    <option key={c.id} value={c.id} className="bg-space-900 text-slate-100">
                      {c.name} ({c.callsign})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-1 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleLoadPreset('alpha')}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                scenarioName.includes('Alpha')
                  ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                  : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
              }`}
            >
              LOAD ALPHA
            </button>
            <button
              onClick={() => handleLoadPreset('bravo')}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                scenarioName.includes('Bravo')
                  ? 'bg-purple-950 border-purple-600 text-purple-300 font-bold'
                  : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
              }`}
            >
              LOAD BRAVO
            </button>
          </div>
        </div>
      </div>

      {/* Strict Scientific Disclaimers */}
      <div className="p-4 rounded-xl bg-space-900 border border-space-700 text-xs text-slate-300 font-mono space-y-1">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>SCIENTIFIC RESTRICTION: SIMULATION IS NOT A CLINICALLY VALIDATED PROGNOSTIC GUARANTEE</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          Projections represent simplified deterministic aerospace physiological approximations. Never represent simulated outcomes as guaranteed clinical medical outcomes. Historical observations remain completely distinct from hypothetical simulated futures.
        </p>
      </div>

      {/* Main Grid: Control Sliders on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Sliders & Controls */}
        <div className="lg:col-span-5 bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>SIMULATION INPUT PARAMETERS</span>
            </h2>
            <button
              onClick={handleReset}
              className="text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RESET</span>
            </button>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Scenario Name */}
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">
                Scenario Identifier
              </label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Sleep Delta */}
            <div className="space-y-1.5 p-3 rounded-lg bg-space-900 border border-space-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Sleep Schedule Delta:</span>
                <span className="font-bold text-cyan-400">
                  {sleepDelta > 0 ? `+${sleepDelta}h` : `${sleepDelta}h`} (Total: {((crew.baseline_profile?.sleep_target_hours || 8.0) + sleepDelta).toFixed(1)}h)
                </span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="4.0"
                step="0.5"
                value={sleepDelta}
                onChange={(e) => setSleepDelta(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500 font-sans">
                Each +1.0h sleep accelerates parasympathetic tone recovery by ~6.8ms HRV.
              </div>
            </div>

            {/* Workload Delta */}
            <div className="space-y-1.5 p-3 rounded-lg bg-space-900 border border-space-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Flight Workload Delta:</span>
                <span className={`font-bold ${workloadDelta < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {workloadDelta > 0 ? `+${workloadDelta}%` : `${workloadDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-60"
                max="40"
                step="5"
                value={workloadDelta}
                onChange={(e) => setWorkloadDelta(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500 font-sans">
                Negative delta re-allocates timeline hours away from physical maintenance tasks.
              </div>
            </div>

            {/* Ergometer Watts */}
            <div className="space-y-1.5 p-3 rounded-lg bg-space-900 border border-space-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Cycle Ergometer Power:</span>
                <span className="font-bold text-cyan-400">{ergoWatts} Watts</span>
              </div>
              <input
                type="range"
                min="0"
                max="240"
                step="10"
                value={ergoWatts}
                onChange={(e) => setErgoWatts(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500 font-sans">
                Target protocol is {crew.baseline_profile?.exercise_target_watts || 185}W. Graded resumption avoids acute baroreflex strain.
              </div>
            </div>

            {/* Electrolyte Fluid Loading */}
            <div className="space-y-1.5 p-3 rounded-lg bg-space-900 border border-space-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Electrolyte Fluid Loading:</span>
                <span className="font-bold text-emerald-400">{hydrationMl} mL</span>
              </div>
              <input
                type="range"
                min="0"
                max="2500"
                step="100"
                value={hydrationMl}
                onChange={(e) => setHydrationMl(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500 font-sans">
                Oral rehydration salts support circulating plasma volume against orthostatic drops.
              </div>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-panel transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isSimulating ? 'SIMULATING RECOVERY TRAJECTORY...' : 'EXECUTE SIMULATION MODEL'}</span>
          </button>
        </div>

        {/* Right 7 Cols: Simulated Results & Comparison */}
        <div className="lg:col-span-7 space-y-6">
          {/* Projected KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">PROJECTED HRV</div>
              <div className="text-lg font-bold text-cyan-300 mt-1">
                {projHrv} ms
              </div>
              <div className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>
                  Current: {currentHrv}ms ({diffHrv >= 0 ? `+${diffHrv}%` : `${diffHrv}%`})
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">PROJECTED BP</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {projBp} mmHg
              </div>
              <div className="text-[9px] text-slate-300 flex items-center gap-1 mt-0.5">
                <span>
                  {currentBp < baseBp - 5
                    ? `Stabilized vs ${currentBp} mmHg (Hypotension Resolved)`
                    : currentBp > baseBp + 5
                    ? `Reduced vs ${currentBp} mmHg (Hypertension Normalized)`
                    : `Nominal Homeostasis (Current: ${currentBp} mmHg)`}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">RESTING HR</div>
              <div className="text-lg font-bold text-white mt-1">
                {projHr} bpm
              </div>
              <div className={`text-[9px] mt-0.5 ${currentHr > 75 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {currentHr > 75 ? `Tachycardia Resolved (from ${currentHr} bpm)` : `Current: ${currentHr} bpm (Nominal)`}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">PVT REACTION TIME</div>
              <div className="text-lg font-bold text-amber-300 mt-1">
                {projPvt} ms
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                Baseline: {basePvt} ms (Current: {currentPvt} ms)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">TIME TO STABILITY</div>
              <div className="text-lg font-bold text-cyan-400 mt-1">
                {timeToStability} Hours
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                Projected Rest Window
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">EXPLORATORY RECURRENCE INDEX</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {riskRecurrence}%
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                Hypothetical index (not clinical diagnosis)
              </div>
            </div>
          </div>

          {/* 48-Hour Recovery Trajectory Chart */}
          <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase font-mono">
                  48-HOUR PROJECTED PHYSIOLOGICAL TRAJECTORY
                </h3>
                <p className="text-[11px] text-slate-400">
                  Hypothetical autonomic, blood pressure, and heart rate stabilization under selected inputs.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-900 text-cyan-400 border border-space-700">
                SIMULATED DATA
              </span>
            </div>

            <TelemetryChart options={trajectoryChartOptions} height={240} />
          </div>

          {/* Saved Scenarios Comparison List */}
          <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase font-mono">
                SAVED EXPLORATORY SCENARIOS FOR {crew.name.toUpperCase()}
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {scenarios.length} {scenarios.length === 1 ? 'scenario' : 'scenarios'} registered
              </span>
            </div>

            <div className="space-y-2">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="p-3 rounded-lg bg-space-900 border border-space-700/80 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="font-bold text-white font-sans">{sc.name}</div>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">{sc.description}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-cyan-400 font-bold">
                      {sc.projections?.time_to_stability_hours}h to stability
                    </span>
                    <div className="text-[10px] text-emerald-400">
                      {sc.projections?.risk_recurrence_pct}% exploratory recurrence index
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
