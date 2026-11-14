import React from 'react';
import { Database, ShieldCheck, ExternalLink, Info, CheckCircle2, Cpu } from 'lucide-react';

export const DataSourcesScreen: React.FC = () => {
  const dictionary = [
    {
      metric: 'heart_rate_resting',
      name: 'Resting Heart Rate',
      unit: 'bpm',
      range: '50 – 70 bpm',
      domain: 'Cardiovascular',
      source: 'Bio-Telemetry Patch Unit #1',
      description: 'Basal resting sinus rhythm recorded during quiescent pre-awakening period.',
    },
    {
      metric: 'hrv_rmssd',
      name: 'Heart Rate Variability (RMSSD)',
      unit: 'ms',
      range: '45 – 75 ms',
      domain: 'Cardiovascular',
      source: 'Bio-Telemetry Patch Unit #1',
      description: 'Root mean square of successive RR interval differences; index of parasympathetic vagal tone.',
    },
    {
      metric: 'systolic_bp / diastolic_bp',
      name: 'Arterial Blood Pressure',
      unit: 'mmHg',
      range: '110-125 / 70-80 mmHg',
      domain: 'Cardiovascular',
      source: 'Digital Sphygmomanometer',
      description: 'Systemic brachial arterial pressure. Monitors microgravity orthostatic deconditioning.',
    },
    {
      metric: 'sleep_duration_hours',
      name: 'Sleep Duration',
      unit: 'hours',
      range: '7.5 – 8.5 hours',
      domain: 'Sleep & Cognitive',
      source: 'Smart Bunk Bio-Acoustic Array',
      description: 'Continuous non-invasive ballistocardiographic sleep stage classification.',
    },
    {
      metric: 'cognitive_pvt_latency_ms',
      name: 'Psychomotor Vigilance Latency',
      unit: 'ms',
      range: '200 – 230 ms',
      domain: 'Sleep & Cognitive',
      source: 'Flight Deck PVT Console',
      description: 'Median visual reaction time; validated biomarker of neurobehavioral sleep debt.',
    },
    {
      metric: 'exercise_power_watts',
      name: 'Cycle Ergometer Workload',
      unit: 'W',
      range: '160 – 200 W',
      domain: 'Musculoskeletal',
      source: 'Cycle Ergometer Tessera-M',
      description: 'Aerobic exercise countermeasure power output for cardiovascular conditioning.',
    },
    {
      metric: 'cabin_co2_mmhg',
      name: 'Ambient Cabin Carbon Dioxide',
      unit: 'mmHg',
      range: '1.5 – 3.0 mmHg',
      domain: 'Environmental',
      source: 'ECLSS Main Sensor Array',
      description: 'Habitation atmosphere partial pressure. Chronic elevated CO2 exacerbates cephalad headaches.',
    },
    {
      metric: 'radiation_dosimeter_usv',
      name: 'Personal Ambient Radiation Rate',
      unit: 'µSv/h',
      range: '40 – 60 µSv/h',
      domain: 'Radiation & Habitat',
      source: 'Crew Personal Silicon Dosimeter',
      description: 'Galactic cosmic radiation background inside transit hull shielding.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-space-700/60 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
            PROVENANCE & METHODOLOGY
          </span>
          <span className="text-xs font-mono text-slate-400">SCIENTIFIC DATA DICTIONARY</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Data Provenance, NASA Research Context & Data Dictionary
        </h1>
        <p className="text-xs text-slate-400">
          Transparent catalog of sensor instrumentation, scientific research foundations, and synthetic dataset disclosure.
        </p>
      </div>

      {/* Synthetic Data & Ethical Disclosure Banner */}
      <div className="p-4 rounded-xl bg-space-850 border border-cyan-500/50 shadow-glow-cyan space-y-2 font-mono text-xs">
        <div className="flex items-center gap-2 font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>SYNTHETIC TELEMETRY & ETHICAL RESEARCH DISCLOSURE</span>
        </div>
        <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
          In strict compliance with NASA Space Apps Challenge ethical standards and astronaut privacy policies, <strong>MOSAIC-9 uses 100% synthetic research telemetry</strong>. No classified, restricted, or private medical telemetry is accessed or fabricated. All numerical distributions are mathematically calibrated to peer-reviewed NASA Human Research Program (HRP) published baselines.
        </p>
      </div>

      {/* NASA Context Mapping Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2">
          <div className="text-[10px] text-cyan-400 uppercase font-bold">NASA HRP ROADMAP</div>
          <h3 className="font-bold text-white font-sans text-sm">Human Research Program</h3>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            Aligns with NASA HRP risks: Risk of Orthostatic Intolerance (Cardiovascular), Risk of Performance Decrements from Sleep Loss (Neurobehavioral), and In-Flight Countermeasure Compliance.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2">
          <div className="text-[10px] text-purple-400 uppercase font-bold">NASA OSDR</div>
          <h3 className="font-bold text-white font-sans text-sm">Open Science Data Repository</h3>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            Incorporates phenotypic biomarker normalization techniques derived from NASA GeneLab and OSDR open-access spaceflight multi-omics studies.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2">
          <div className="text-[10px] text-amber-400 uppercase font-bold">NASA DONKI CONTEXT</div>
          <h3 className="font-bold text-white font-sans text-sm">Space Weather Database</h3>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            Distinguishes external solar energetic particle flux from direct personal absorbed tissue dose, adhering strictly to space radiation biophysics principles.
          </p>
        </div>
      </div>

      {/* Complete Data Dictionary Table */}
      <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase font-mono">
            MISSION TELEMETRY DATA DICTIONARY
          </h3>
          <p className="text-xs text-slate-400">
            Standardized nomenclature, measurement units, expected physiological ranges, and sensor provenance.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-space-700 text-slate-400 bg-space-900/80">
                <th className="py-2.5 px-3">METRIC IDENTIFIER</th>
                <th className="py-2.5 px-3">DISPLAY NAME</th>
                <th className="py-2.5 px-3">UNIT</th>
                <th className="py-2.5 px-3">EXPECTED BASELINE RANGE</th>
                <th className="py-2.5 px-3">DOMAIN</th>
                <th className="py-2.5 px-3">PRIMARY SENSOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-800">
              {dictionary.map((item, idx) => (
                <tr key={idx} className="hover:bg-space-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-cyan-400 font-semibold">{item.metric}</td>
                  <td className="py-2.5 px-3 text-white font-sans font-medium">{item.name}</td>
                  <td className="py-2.5 px-3 text-slate-300">{item.unit}</td>
                  <td className="py-2.5 px-3 text-emerald-400">{item.range}</td>
                  <td className="py-2.5 px-3 text-slate-300 uppercase text-[10px]">{item.domain}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">{item.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
