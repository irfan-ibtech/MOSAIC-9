import React, { useState, useEffect } from 'react';
import {
  CrewMember,
  CountermeasureScenario,
  MultiScenarioComparisonResult,
  SensitivityAnalysisResult,
} from '../types';
import { mosaicApi } from '../services/api';
import { TelemetryChart } from '../components/common/TelemetryChart';
import { EvidencePill } from '../components/common/EvidencePill';
import {
  DEFAULT_CREW_MEMBERS,
  DEFAULT_SCENARIOS,
  CREW_SIMULATION_DEFAULTS,
  DEFAULT_SCENARIO_COMPARISON,
  DEFAULT_SENSITIVITY_ANALYSIS,
} from '../data/initialData';
import {
  Sliders,
  Play,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
  ChevronDown,
  Scale,
  Activity,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
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

  // Phase 2: Multi-Scenario Trade-off Comparison & Sensitivity Analysis State
  const [comparisonResult, setComparisonResult] = useState<MultiScenarioComparisonResult>(
    DEFAULT_SCENARIO_COMPARISON
  );
  const [sensitivityResult, setSensitivityResult] = useState<SensitivityAnalysisResult>(
    DEFAULT_SENSITIVITY_ANALYSIS
  );
  const [perturbationPct, setPerturbationPct] = useState<number>(25);
  const [customSleepHrvCoeff, setCustomSleepHrvCoeff] = useState<number>(7.2);
  const [customHydrationBpCoeff, setCustomHydrationBpCoeff] = useState<number>(14.5);
  const [showDecisionReportModal, setShowDecisionReportModal] = useState<boolean>(false);

  // Sync state whenever the active astronaut changes
  useEffect(() => {
    const config = CREW_SIMULATION_DEFAULTS[crew.id] || CREW_SIMULATION_DEFAULTS[1];

    setScenarioName(config.alpha.name);
    setSleepDelta(config.alpha.sleepDelta);
    setWorkloadDelta(config.alpha.workloadDelta);
    setErgoWatts(config.alpha.ergoWatts);
    setHydrationMl(config.alpha.hydrationMl);
    setAmbientCo2(config.alpha.ambientCo2);

    mosaicApi.getScenarios(crew.id).then((resList) => {
      if (resList && resList.length > 0) {
        setScenarios(resList.filter((s) => s.crew_member_id === crew.id));
      } else {
        setScenarios(DEFAULT_SCENARIOS.filter((s) => s.crew_member_id === crew.id));
      }
    });

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

  // Fetch multi-scenario trade-offs and sensitivity analysis when crew or assumptions change
  useEffect(() => {
    const activeAssumptions = {
      sleep_hrv_coeff: customSleepHrvCoeff,
      hydration_bp_coeff: customHydrationBpCoeff,
    };

    mosaicApi
      .compareScenarios(crew.id, activeAssumptions)
      .then((res) => {
        if (res && Array.isArray(res.scenarios)) {
          setComparisonResult(res);
        }
      })
      .catch(() => {
        setComparisonResult(DEFAULT_SCENARIO_COMPARISON);
      });

    mosaicApi
      .analyzeScenarioSensitivity(crew.id, perturbationPct, activeAssumptions, {
        sleep_delta_hours: sleepDelta,
        workload_delta_pct: workloadDelta,
        cycle_ergometer_watts: ergoWatts,
        hydration_fluid_ml: hydrationMl,
        ambient_co2_target_mmhg: ambientCo2,
      })
      .then((res) => {
        if (res && Array.isArray(res.parameter_sensitivities)) {
          setSensitivityResult(res);
        }
      })
      .catch(() => {
        setSensitivityResult(DEFAULT_SENSITIVITY_ANALYSIS);
      });
  }, [crew.id, perturbationPct, customSleepHrvCoeff, customHydrationBpCoeff]);

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
      mosaicApi.getScenarios(crew.id).then((resList) => {
        if (resList && resList.length > 0) {
          setScenarios(resList.filter((s) => s.crew_member_id === crew.id));
        }
      });
    } catch {
      // Handled by api fallback
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

  const handleExportDecisionReport = () => {
    const reportPayload = {
      report_type: 'MOSAIC-9_MISSION_COUNTERMEASURE_DECISION_REPORT',
      generated_at: new Date().toISOString(),
      scientific_labels: ['SIMULATED DATA', 'EXPLORATORY SCENARIO', 'NOT A CLINICAL RECOMMENDATION'],
      crew_member: { id: crew.id, name: crew.name, callsign: crew.callsign, status: crew.status },
      active_scenario_inputs: {
        name: scenarioName,
        sleep_delta_hours: sleepDelta,
        workload_delta_pct: workloadDelta,
        cycle_ergometer_watts: ergoWatts,
        hydration_fluid_ml: hydrationMl,
        ambient_co2_target_mmhg: ambientCo2,
      },
      active_projections: activeSimulationResult?.scenario?.projections || {},
      multi_scenario_tradeoff_comparison: comparisonResult,
      parameter_sensitivity_analysis: sensitivityResult,
      limitations_and_governance:
        'Deterministic parametric aerospace simulation. Does not constitute an autonomous clinical prescription. Human Flight Surgeon and Mission Director review required.',
    };

    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MOSAIC9_Decision_Report_${crew.callsign}_Day120.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Trajectory Recovery Chart Data
  const currentHrv = activeSimulationResult?.baseline_comparison?.hrv?.current ?? crewConfig.currentHrv;
  const projHrv =
    activeSimulationResult?.scenario?.projections?.projected_hrv_rmssd ??
    activeSimulationResult?.baseline_comparison?.hrv?.projected ??
    crewConfig.baseHrv;
  const diffHrv = Math.round(((projHrv - currentHrv) / (currentHrv || 1)) * 100);

  const currentBp = activeSimulationResult?.baseline_comparison?.bp?.current ?? crewConfig.currentBp;
  const projBp =
    activeSimulationResult?.scenario?.projections?.projected_systolic_bp ??
    activeSimulationResult?.baseline_comparison?.bp?.projected ??
    crewConfig.baseBp;
  const baseBp = activeSimulationResult?.baseline_comparison?.bp?.baseline ?? crewConfig.baseBp;

  const currentHr = activeSimulationResult?.baseline_comparison?.hr?.current ?? crewConfig.currentHr;
  const projHr =
    activeSimulationResult?.scenario?.projections?.projected_resting_hr ??
    activeSimulationResult?.baseline_comparison?.hr?.projected ??
    crewConfig.baseHr;

  const currentPvt = activeSimulationResult?.baseline_comparison?.pvt?.current ?? crewConfig.currentPvt;
  const projPvt =
    activeSimulationResult?.scenario?.projections?.projected_pvt_latency_ms ??
    activeSimulationResult?.baseline_comparison?.pvt?.projected ??
    crewConfig.basePvt;
  const basePvt = activeSimulationResult?.baseline_comparison?.pvt?.baseline ?? crewConfig.basePvt;

  const timeToStability = activeSimulationResult?.scenario?.projections?.time_to_stability_hours ?? 24;
  const riskRecurrence = activeSimulationResult?.scenario?.projections?.risk_recurrence_pct ?? 12;

  const trajectoryData = activeSimulationResult?.scenario?.projections?.trajectory_hourly || [
    { hour: 0, hrv: currentHrv, hr: currentHr, bp: currentBp, pvt: currentPvt },
    {
      hour: 12,
      hrv: Math.round(currentHrv + (projHrv - currentHrv) * 0.35),
      hr: Math.round(currentHr + (projHr - currentHr) * 0.35),
      bp: Math.round(currentBp + (projBp - currentBp) * 0.45),
      pvt: Math.round(currentPvt + (projPvt - currentPvt) * 0.3),
    },
    {
      hour: 24,
      hrv: Math.round(currentHrv + (projHrv - currentHrv) * 0.7),
      hr: Math.round(currentHr + (projHr - currentHr) * 0.7),
      bp: Math.round(currentBp + (projBp - currentBp) * 0.8),
      pvt: Math.round(currentPvt + (projPvt - currentPvt) * 0.7),
    },
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

  // Pareto Multi-Scenario Trade-Off Chart Options
  const paretoChartOptions = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: [
        'Physiological Recovery Score (0-100)',
        'Operational Continuity Score (0-100)',
        'Exercise Preservation Score (0-100)',
      ],
      textStyle: { color: '#94a3b8' },
    },
    xAxis: {
      type: 'category',
      data: comparisonResult.scenarios.map((s) => s.scenario_id.replace('SC-', '')),
      axisLine: { lineStyle: { color: '#1e2c4c' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: '#64748b' },
    },
    series: [
      {
        name: 'Physiological Recovery Score (0-100)',
        type: 'bar',
        data: comparisonResult.scenarios.map((s) => s.dimensions.recovery_trajectory_score),
        itemStyle: { color: '#06b6d4' },
      },
      {
        name: 'Operational Continuity Score (0-100)',
        type: 'bar',
        data: comparisonResult.scenarios.map((s) => s.dimensions.operational_continuity_score),
        itemStyle: { color: '#10b981' },
      },
      {
        name: 'Exercise Preservation Score (0-100)',
        type: 'bar',
        data: comparisonResult.scenarios.map((s) => s.dimensions.exercise_preservation_score),
        itemStyle: { color: '#a855f7' },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-space-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              MODULE F — COUNTERMEASURE SCENARIO SANDBOX & TRADE-OFF ENGINE
            </span>
            <EvidencePill classification="SYNTHETIC_SIMULATION" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
            <span>Countermeasure Exploration, Multi-Objective Trade-Offs & Sensitivity Sandbox</span>
            <span className="text-cyan-400 font-mono text-base">({crew.name})</span>
          </h1>
          <p className="text-xs text-slate-400">
            Model hypothetical recovery trajectories across sleep extensions, workload shifts, and fluid loading protocols, and evaluate operational schedule trade-offs.
          </p>
        </div>

        {/* Crew, Preset Switchers & Decision Report Button */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
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
            <button
              onClick={() => setShowDecisionReportModal(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>DECISION REPORT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Strict Scientific Disclaimers */}
      <div className="p-4 rounded-xl bg-space-900 border border-space-700 text-xs text-slate-300 font-mono space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>SCIENTIFIC RESTRICTION: SIMULATION IS NOT A CLINICALLY VALIDATED PROGNOSTIC GUARANTEE</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-700 text-blue-300">
              SCENARIO INPUT
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300">
              SIMULATED OUTPUT
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-300">
              HUMAN REVIEW REQUIRED
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300">
              EXPLORATORY SCENARIO
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300">
              NOT A CLINICAL RECOMMENDATION
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          Projections represent simplified deterministic aerospace physiological approximations driven by assumed linear model elasticities. Never represent simulated outcomes as guaranteed clinical medical outcomes. Historical observations remain completely distinct from hypothetical simulated futures.
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
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 border border-blue-700 text-blue-300">
                SCENARIO INPUT
              </span>
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
                  {sleepDelta > 0 ? `+${sleepDelta}h` : `${sleepDelta}h`} (Total:{' '}
                  {((crew.baseline_profile?.sleep_target_hours || 8.0) + sleepDelta).toFixed(1)}h)
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
                Assumed linear model elasticity: each +1.0h sleep adds ~7.2ms HRV recovery.
              </div>
            </div>

            {/* Workload Delta */}
            <div className="space-y-1.5 p-3 rounded-lg bg-space-900 border border-space-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Flight Workload Delta:</span>
                <span
                  className={`font-bold ${
                    workloadDelta < 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
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
            <span>
              {isSimulating ? 'SIMULATING RECOVERY TRAJECTORY...' : 'EXECUTE SIMULATION MODEL'}
            </span>
          </button>
        </div>

        {/* Right 7 Cols: Simulated Results & Comparison */}
        <div className="lg:col-span-7 space-y-6">
          {/* Projected KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">PROJECTED HRV</div>
              <div className="text-lg font-bold text-cyan-300 mt-1">{projHrv} ms</div>
              <div className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>
                  Current: {currentHrv}ms ({diffHrv >= 0 ? `+${diffHrv}%` : `${diffHrv}%`})
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">PROJECTED BP</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">{projBp} mmHg</div>
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
              <div className="text-lg font-bold text-white mt-1">{projHr} bpm</div>
              <div
                className={`text-[9px] mt-0.5 ${
                  currentHr > 75 ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {currentHr > 75
                  ? `Tachycardia Resolved (from ${currentHr} bpm)`
                  : `Current: ${currentHr} bpm (Nominal)`}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">PVT REACTION TIME</div>
              <div className="text-lg font-bold text-amber-300 mt-1">{projPvt} ms</div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                Baseline: {basePvt} ms (Current: {currentPvt} ms)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">TIME TO STABILITY</div>
              <div className="text-lg font-bold text-cyan-400 mt-1">{timeToStability} Hours</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Projected Rest Window</div>
            </div>

            <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">
                EXPLORATORY RECURRENCE INDEX
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-1">{riskRecurrence}%</div>
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
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-900 text-cyan-400 border border-space-700">
                  SIMULATED OUTPUT
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                  HUMAN REVIEW REQUIRED
                </span>
              </div>
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
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {sc.description}
                    </div>
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

      {/* PHASE 2.1: MULTI-SCENARIO TRADE-OFF COMPARISON ENGINE (5 SCENARIOS × 8 DIMENSIONS) */}
      <div className="bg-space-850 border border-cyan-500/40 rounded-xl p-5 shadow-panel space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-space-700/60 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Scale className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono">
                MULTI-OBJECTIVE SCENARIO TRADE-OFF COMPARISON ENGINE (5 CONFIGURATIONS · 8 DIMENSIONS)
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-mono">
                {comparisonResult.pareto_frontier_ids.length} PARETO NON-DOMINATED OPTIONS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluates 5 candidate protocols across 8 operational/epistemic dimensions. Pareto dominance is computed across 3 primary maximized objectives (<strong className="text-cyan-300">1. Recovery Score</strong>, <strong className="text-emerald-300">Operational Continuity = 100% − Schedule Disruption</strong>, and <strong className="text-purple-300">4. Exercise Preservation</strong>); the remaining 5 dimensions provide operational and epistemic context for human Flight Surgeon &amp; Mission Director review.
            </p>
          </div>
        </div>

        {/* Pareto Trade-off Bar Chart */}
        <div className="bg-space-900 border border-space-800 rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between flex-wrap gap-2">
            <span>
              MULTI-OBJECTIVE PARETO FRONTIER: PHYSIOLOGICAL RECOVERY VS OPERATIONAL CONTINUITY VS EXERCISE PRESERVATION
            </span>
            <span className="text-cyan-400">SIMULATED DATA · NOT A CLINICAL RECOMMENDATION</span>
          </div>
          <TelemetryChart options={paretoChartOptions} height={220} />
        </div>

        {/* 8-Dimension Side-by-Side Comparison Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-space-700 text-slate-400 bg-space-900/90 text-[10px]">
                <th className="py-2.5 px-3">SCENARIO CONFIGURATION</th>
                <th className="py-2.5 px-2.5">PARETO STATUS</th>
                <th className="py-2.5 px-2.5">1. RECOVERY SCORE</th>
                <th className="py-2.5 px-2.5">2. SLEEP OPP.</th>
                <th className="py-2.5 px-2.5">3. WORKLOAD DIST.</th>
                <th className="py-2.5 px-2.5">4. EXERCISE PRES.</th>
                <th className="py-2.5 px-2.5">5. SCHED. DISRUPTION</th>
                <th className="py-2.5 px-2.5">6. ENV/CONSUMABLE</th>
                <th className="py-2.5 px-2.5">7. COMPLETENESS</th>
                <th className="py-2.5 px-2.5">8. UNCERTAINTY</th>
                <th className="py-2.5 px-2.5">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-800">
              {comparisonResult.scenarios.map((sc) => (
                <tr key={sc.scenario_id} className="hover:bg-space-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white font-sans text-xs">{sc.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Sleep {sc.inputs.sleep_delta_hours >= 0 ? `+${sc.inputs.sleep_delta_hours}h` : `${sc.inputs.sleep_delta_hours}h`} ·{' '}
                      Load {sc.inputs.workload_delta_pct}% · {sc.inputs.cycle_ergometer_watts}W ·{' '}
                      {sc.inputs.hydration_fluid_ml}mL
                    </div>
                  </td>
                  <td className="py-3 px-2.5">
                    {sc.is_pareto_non_dominated ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold">
                        PARETO FRONTIER
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-space-900 border border-space-700 text-slate-400 text-[10px]">
                        DOMINATED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2.5 font-bold text-cyan-300">
                    {sc.dimensions.recovery_trajectory_score}/100
                  </td>
                  <td className="py-3 px-2.5 text-slate-200">
                    {sc.dimensions.sleep_opportunity_score}/100
                  </td>
                  <td className="py-3 px-2.5 text-slate-200">
                    {sc.dimensions.workload_distribution_score}/100
                  </td>
                  <td className="py-3 px-2.5 text-purple-300">
                    {sc.dimensions.exercise_preservation_score}/100
                  </td>
                  <td className="py-3 px-2.5 text-amber-300">
                    {sc.dimensions.mission_schedule_disruption_pct}%
                  </td>
                  <td className="py-3 px-2.5 text-emerald-300">
                    {sc.dimensions.environmental_constraint_score}/100
                  </td>
                  <td className="py-3 px-2.5 text-slate-300">
                    {sc.dimensions.data_completeness_score}%
                  </td>
                  <td className="py-3 px-2.5 text-rose-300">
                    ±{sc.dimensions.uncertainty_band_pct}%
                  </td>
                  <td className="py-3 px-2.5">
                    <button
                      onClick={() => {
                        setScenarioName(sc.name);
                        setSleepDelta(sc.inputs.sleep_delta_hours);
                        setWorkloadDelta(sc.inputs.workload_delta_pct);
                        setErgoWatts(sc.inputs.cycle_ergometer_watts);
                        setHydrationMl(sc.inputs.hydration_fluid_ml);
                        setAmbientCo2(sc.inputs.ambient_co2_target_mmhg);
                      }}
                      className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[10px] font-bold"
                    >
                      LOAD INPUTS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PHASE 2.2: INTERACTIVE PARAMETER SENSITIVITY ANALYSIS PANEL */}
      <div className="bg-space-850 border border-purple-500/40 rounded-xl p-5 shadow-panel space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-space-700/60 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Activity className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono">
                PARAMETER SENSITIVITY & BIOLOGICAL ASSUMPTION ROBUSTNESS ANALYSIS
              </h3>
              <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300 text-[10px] font-mono">
                TOP DRIVER: {sensitivityResult.most_influential_parameter}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              One-at-a-Time (OAT) perturbation analysis testing how assumed linear model elasticities (not empirical biological constants) affect projected outcomes and scenario rankings.
            </p>
          </div>

          {/* Perturbation Range Controls */}
          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            <span className="text-slate-400 text-[11px]">PERTURBATION RANGE:</span>
            {[0, 10, 20, 25, 40].map((pct) => (
              <button
                key={pct}
                onClick={() => setPerturbationPct(pct)}
                className={`px-2.5 py-1 rounded border text-xs transition-all ${
                  perturbationPct === pct
                    ? 'bg-purple-950 border-purple-500 text-purple-200 font-bold'
                    : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
                }`}
              >
                ±{pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Assumption Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-space-900 border border-space-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">
                Assumed Sleep → HRV Gain Coefficient (Baseline: 7.2 ms/h):
              </span>
              <span className="text-purple-300 font-bold">{customSleepHrvCoeff} ms/h</span>
            </div>
            <input
              type="range"
              min="4.0"
              max="10.5"
              step="0.2"
              value={customSleepHrvCoeff}
              onChange={(e) => setCustomSleepHrvCoeff(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-space-900 border border-space-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">
                Assumed Fluid → Systolic BP Gain Coefficient (Baseline: 14.5 mmHg/L):
              </span>
              <span className="text-purple-300 font-bold">{customHydrationBpCoeff} mmHg/L</span>
            </div>
            <input
              type="range"
              min="8.0"
              max="21.0"
              step="0.5"
              value={customHydrationBpCoeff}
              onChange={(e) => setCustomHydrationBpCoeff(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Sensitivity Ranking Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-space-700 text-slate-400 bg-space-900/90 text-[10px]">
                <th className="py-2 px-3">RANK</th>
                <th className="py-2 px-3">MODEL ASSUMPTION PARAMETER</th>
                <th className="py-2 px-3">BASELINE ASSUMPTION</th>
                <th className="py-2 px-3">ADJUSTED ASSUMPTION</th>
                <th className="py-2 px-3">SENSITIVITY BOUND (±{sensitivityResult.perturbation_percentage}%)</th>
                <th className="py-2 px-3">OUTCOME RANGE (LOW → HIGH)</th>
                <th className="py-2 px-3">TOTAL SWING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-800">
              {sensitivityResult.parameter_sensitivities.map((param) => (
                <tr key={param.parameter_key} className="hover:bg-space-800/40">
                  <td className="py-2.5 px-3 font-bold text-purple-300">#{param.influence_rank}</td>
                  <td className="py-2.5 px-3 text-white font-sans font-medium">
                    {param.parameter_name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {param.baseline_assumption} {param.unit}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-300">
                    {param.adjusted_assumption} {param.unit}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    [{param.low_bound_assumption} .. {param.high_bound_assumption}]
                  </td>
                  <td className="py-2.5 px-3 text-emerald-300">
                    {param.outcome_at_low} → {param.outcome_at_high} {param.target_unit}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-300">
                    Δ {param.outcome_swing} {param.target_unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 rounded-lg bg-space-950 border border-space-800 text-xs font-sans text-slate-300 flex items-center justify-between flex-wrap gap-2">
          <div>
            <strong className="text-purple-300 font-mono">Scenario Ranking Stability:</strong>{' '}
            {sensitivityResult.ranking_stability_note}
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {sensitivityResult.scientific_label}
          </span>
        </div>
      </div>

      {/* PHASE 2.3: MISSION DECISION REPORT MODAL */}
      {showDecisionReportModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-space-900 border border-emerald-500/60 rounded-xl max-w-3xl w-full p-6 shadow-panel space-y-4 font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-space-700 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-bold">
                  MISSION COUNTERMEASURE DECISION REPORT
                </span>
                <EvidencePill classification="SYNTHETIC_SIMULATION" />
              </div>
              <button
                onClick={() => setShowDecisionReportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="p-3.5 rounded-lg bg-space-950 border border-space-800 space-y-1">
                <div className="font-mono text-cyan-400 font-bold uppercase">
                  1. Subject & Active Scenario Inputs
                </div>
                <p className="text-slate-200">
                  <strong>Astronaut:</strong> {crew.name} ({crew.callsign}) ·{' '}
                  <strong>Active Scenario:</strong> {scenarioName}
                </p>
                <p className="text-slate-300 font-mono text-[11px]">
                  Sleep Delta: {sleepDelta >= 0 ? `+${sleepDelta}h` : `${sleepDelta}h`} | Workload Delta:{' '}
                  {workloadDelta}% | Ergometer: {ergoWatts}W | Oral Fluid: {hydrationMl}mL | Cabin CO2 Target:{' '}
                  {ambientCo2} mmHg
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-space-950 border border-space-800 space-y-1">
                <div className="font-mono text-emerald-400 font-bold uppercase">
                  2. Projected 48-Hour Physiological Outcomes (Simulated)
                </div>
                <p className="text-slate-200 font-mono text-[11px]">
                  HRV RMSSD: {currentHrv}ms → {projHrv}ms | Systolic BP: {currentBp} → {projBp} mmHg | Resting HR:{' '}
                  {currentHr} → {projHr} bpm | PVT Latency: {currentPvt} → {projPvt} ms | Time to Stability:{' '}
                  {timeToStability}h
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-space-950 border border-space-800 space-y-1.5">
                <div className="font-mono text-amber-400 font-bold uppercase">
                  3. Multi-Objective Operational Trade-Off Summary
                </div>
                {comparisonResult.scenarios.map((sc) => (
                  <div
                    key={sc.scenario_id}
                    className="border-t border-space-800 pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                  >
                    <span className="text-white font-medium">
                      {sc.name}{' '}
                      {sc.is_pareto_non_dominated && (
                        <strong className="text-emerald-400 font-mono text-[10px]">
                          [PARETO FRONTIER]
                        </strong>
                      )}
                    </span>
                    <span className="font-mono text-[11px] text-slate-300">
                      Recovery: {sc.dimensions.recovery_trajectory_score}/100 · Disruption:{' '}
                      {sc.dimensions.mission_schedule_disruption_pct}% · Uncertainty: ±
                      {sc.dimensions.uncertainty_band_pct}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-lg bg-space-950 border border-space-800 space-y-1">
                <div className="font-mono text-purple-400 font-bold uppercase">
                  4. Model Assumptions, Sensitivity & Epistemic Uncertainty
                </div>
                <p className="text-slate-300">
                  Most influential assumption parameter: <strong>{sensitivityResult.most_influential_parameter}</strong>{' '}
                  (tested at ±{sensitivityResult.perturbation_percentage}% OAT perturbation).{' '}
                  {sensitivityResult.ranking_stability_note}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-700/60 space-y-1">
                <div className="font-mono text-rose-300 font-bold uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>5. Limitations & Suggested Human Flight Surgeon Review</span>
                </div>
                <p className="text-slate-200">
                  SIMULATED DATA — EXPLORATORY SCENARIO — NOT A CLINICAL RECOMMENDATION. Projections are generated by a deterministic linear-saturation model and do not account for idiosyncratic pharmacogenomics or unmeasured cerebral oximetry (NIRS). Submit selected trade-off package via SBAR Ground Brief for Flight Surgeon &amp; Mission Director concurrence.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-space-800">
              <button
                onClick={handleExportDecisionReport}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT DECISION REPORT (.JSON)</span>
              </button>
              <button
                onClick={() => setShowDecisionReportModal(false)}
                className="px-4 py-2 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 text-xs font-mono"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
