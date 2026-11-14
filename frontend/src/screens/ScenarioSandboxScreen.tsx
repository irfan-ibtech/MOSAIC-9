import React, { useState, useEffect } from 'react';
import { CrewMember, CountermeasureScenario } from '../types';
import { mosaicApi } from '../services/api';
import { TelemetryChart } from '../components/common/TelemetryChart';
import {
  Sliders,
  Play,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ScenarioSandboxScreenProps {
  selectedCrew: CrewMember | null;
}

export const ScenarioSandboxScreen: React.FC<ScenarioSandboxScreenProps> = ({ selectedCrew }) => {
  const [scenarios, setScenarios] = useState<CountermeasureScenario[]>([]);
  const [scenarioName, setScenarioName] = useState('Custom Rest & Fluid Protocol');
  const [sleepDelta, setSleepDelta] = useState<number>(2.0);
  const [workloadDelta, setWorkloadDelta] = useState<number>(-30);
  const [ergoWatts, setErgoWatts] = useState<number>(140);
  const [hydrationMl, setHydrationMl] = useState<number>(1200);
  const [ambientCo2, setAmbientCo2] = useState<number>(2.2);

  const [activeSimulationResult, setActiveSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    mosaicApi.getScenarios().then((list) => {
      setScenarios(list || []);
      if (list && list.length > 0) {
        // Load default Scenario Alpha
        const alpha = list[0];
        setActiveSimulationResult({
          scenario: alpha,
          baseline_comparison: {
            hrv: { current: 27.0, projected: alpha.projections.projected_hrv_rmssd, baseline: 58.0, unit: 'ms' },
            hr: { current: 78.0, projected: alpha.projections.projected_resting_hr, baseline: 60.0, unit: 'bpm' },
            bp: { current: 88.0, projected: alpha.projections.projected_systolic_bp, baseline: 118.0, unit: 'mmHg' },
            pvt: { current: 310.0, projected: alpha.projections.projected_pvt_latency_ms, baseline: 215.0, unit: 'ms' },
          },
        });
      }
    });
  }, []);

  const handleRunSimulation = async () => {
    if (!selectedCrew) return;
    setIsSimulating(true);
    try {
      const res = await mosaicApi.simulateScenario({
        crew_member_id: selectedCrew.id,
        name: scenarioName,
        sleep_delta_hours: sleepDelta,
        workload_delta_pct: workloadDelta,
        cycle_ergometer_watts: ergoWatts,
        hydration_fluid_ml: hydrationMl,
        ambient_co2_target_mmhg: ambientCo2,
      });
      setActiveSimulationResult(res);
      // Reload list
      mosaicApi.getScenarios().then((list) => setScenarios(list || []));
    } catch (err) {
      alert('Simulation error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setSleepDelta(0.0);
    setWorkloadDelta(0);
    setErgoWatts(185);
    setHydrationMl(0);
    setAmbientCo2(2.8);
    setScenarioName('Neutral Schedule (No Countermeasures)');
  };

  const handleLoadPreset = (preset: 'alpha' | 'bravo') => {
    if (preset === 'alpha') {
      setScenarioName('Scenario Alpha: Sleep Restoration & Fluid Loading');
      setSleepDelta(2.5);
      setWorkloadDelta(-35);
      setErgoWatts(140);
      setHydrationMl(1200);
      setAmbientCo2(2.0);
    } else {
      setScenarioName('Scenario Bravo: Workload Maintenance with Sleep Aid');
      setSleepDelta(1.5);
      setWorkloadDelta(-10);
      setErgoWatts(160);
      setHydrationMl(800);
      setAmbientCo2(2.8);
    }
  };

  // Trajectory Recovery Chart
  const trajectoryData = activeSimulationResult?.scenario?.projections?.trajectory_hourly || [
    { hour: 0, hrv: 27, hr: 78, bp: 88, pvt: 310 },
    { hour: 12, hrv: 35, hr: 73, bp: 98, pvt: 285 },
    { hour: 24, hrv: 44, hr: 68, bp: 108, pvt: 255 },
    { hour: 48, hrv: 52, hr: 63, bp: 114, pvt: 228 },
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
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Countermeasure Exploration & Trajectory Sandbox
          </h1>
          <p className="text-xs text-slate-400">
            Model hypothetical recovery trajectories across sleep extensions, workload shifts, and fluid loading protocols.
          </p>
        </div>

        {/* Preset scenario loaders */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLoadPreset('alpha')}
            className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-mono transition-all"
          >
            LOAD ALPHA (RESTORATION)
          </button>
          <button
            onClick={() => handleLoadPreset('bravo')}
            className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-300 text-xs font-mono transition-all"
          >
            LOAD BRAVO (MAINTENANCE)
          </button>
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
                  {sleepDelta > 0 ? `+${sleepDelta}h` : `${sleepDelta}h`} (Total: {(8.0 + sleepDelta).toFixed(1)}h)
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
                Each +1.0h sleep accelerates parasympathetic tone recovery by ~7.2ms HRV.
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
                max="20"
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
                <span className="font-bold text-purple-400">{ergoWatts} Watts</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={ergoWatts}
                onChange={(e) => setErgoWatts(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500 font-sans">
                Target protocol is 185W. Graded resumption at 140W avoids acute baroreflex strain.
              </div>
            </div>

            {/* Hydration Volume */}
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
          {activeSimulationResult && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
                <div className="text-[10px] text-slate-400 uppercase">PROJECTED HRV</div>
                <div className="text-lg font-bold text-cyan-300 mt-1">
                  {activeSimulationResult.scenario?.projections?.projected_hrv_rmssd || 52} ms
                </div>
                <div className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>Current: 27ms (+92%)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
                <div className="text-[10px] text-slate-400 uppercase">PROJECTED BP</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {activeSimulationResult.scenario?.projections?.projected_systolic_bp || 114} mmHg
                </div>
                <div className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>Stabilized vs 88 mmHg</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
                <div className="text-[10px] text-slate-400 uppercase">RESTING HR</div>
                <div className="text-lg font-bold text-white mt-1">
                  {activeSimulationResult.scenario?.projections?.projected_resting_hr || 63} bpm
                </div>
                <div className="text-[9px] text-emerald-400 mt-0.5">
                  Tachycardia Resolved
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
                <div className="text-[10px] text-slate-400 uppercase">PVT REACTION TIME</div>
                <div className="text-lg font-bold text-amber-300 mt-1">
                  {activeSimulationResult.scenario?.projections?.projected_pvt_latency_ms || 228} ms
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  Baseline: 215 ms
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
                <div className="text-[10px] text-slate-400 uppercase">TIME TO STABILITY</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">
                  {activeSimulationResult.scenario?.projections?.time_to_stability_hours || 36} Hours
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  Projected Rest Window
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-space-850 border border-space-700">
                <div className="text-[10px] text-slate-400 uppercase">RECURRENCE RISK</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {activeSimulationResult.scenario?.projections?.risk_recurrence_pct || 14}%
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  Reduced from 65%
                </div>
              </div>
            </div>
          )}

          {/* 48-Hour Recovery Trajectory Chart */}
          <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase font-mono">
                  48-HOUR PROJECTED PHYSIOLOGICAL TRAJECTORY
                </h3>
                <p className="text-[11px] text-slate-400">
                  Hypothetical autonomic and blood pressure stabilization under selected inputs.
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
            <h3 className="text-xs font-bold text-white uppercase font-mono">
              SAVED EXPLORATORY SCENARIOS
            </h3>

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
                      {sc.projections?.risk_recurrence_pct}% recurrence risk
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
