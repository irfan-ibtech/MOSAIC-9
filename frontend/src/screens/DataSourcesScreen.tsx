import React, { useState, useEffect } from 'react';
import { NasaStudyRecord } from '../types';
import { mosaicApi } from '../services/api';
import { DEFAULT_NASA_STUDIES } from '../data/initialData';
import { EvidencePill } from '../components/common/EvidencePill';
import {
  ShieldCheck,
  ExternalLink,
  Search,
  BookOpen,
  FileText,
  Filter,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const DataSourcesScreen: React.FC = () => {
  const [studies, setStudies] = useState<NasaStudyRecord[]>(DEFAULT_NASA_STUDIES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeStudyModal, setActiveStudyModal] = useState<NasaStudyRecord | null>(null);

  // OSDR Live / Cached Lookup Tester
  const [lookupInput, setLookupInput] = useState<string>('OSD-575');
  const [lookupStatus, setLookupStatus] = useState<{
    loading: boolean;
    mode?: string;
    message?: string;
    studyId?: string;
    isError?: boolean;
  }>({ loading: false });

  useEffect(() => {
    mosaicApi
      .getEvidenceStudies({
        domain: selectedDomain,
        source_type: selectedSource,
        study_category: selectedCategory,
        search: searchQuery,
      })
      .then((res) => {
        if (res && Array.isArray(res.studies)) {
          setStudies(res.studies);
        }
      })
      .catch(() => {
        // Fallback client-side filter
        let filtered = [...DEFAULT_NASA_STUDIES];
        if (selectedDomain !== 'ALL') {
          filtered = filtered.filter((s) => s.domains.includes(selectedDomain));
        }
        if (selectedSource !== 'ALL') {
          filtered = filtered.filter((s) => s.source_type === selectedSource);
        }
        if (selectedCategory !== 'ALL') {
          filtered = filtered.filter((s) => s.study_category === selectedCategory);
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (s) =>
              s.study_id.toLowerCase().includes(q) ||
              s.title.toLowerCase().includes(q) ||
              s.summary.toLowerCase().includes(q) ||
              s.organism.toLowerCase().includes(q)
          );
        }
        setStudies(filtered);
      });
  }, [selectedDomain, selectedSource, selectedCategory, searchQuery]);

  const handleOsdrLookup = async (targetId?: string) => {
    const idToQuery = (targetId || lookupInput).trim().toUpperCase();
    setLookupInput(idToQuery);
    setLookupStatus({ loading: true });
    const res = await mosaicApi.lookupOsdrStudy(idToQuery);
    if (res.status === 'UNAVAILABLE_OR_INVALID_STUDY') {
      setLookupStatus({
        loading: false,
        mode: res.retrieval_mode || 'SAFE_REJECTED',
        studyId: idToQuery,
        message: res.error || `Study ${idToQuery} is unavailable or invalid; no unverified data injected.`,
        isError: true,
      });
    } else {
      setLookupStatus({
        loading: false,
        mode: res.retrieval_mode || 'CACHED_VERIFIED_FALLBACK',
        studyId: res.study_id || idToQuery,
        message:
          res.offline_resilience_note ||
          `Verified study metadata retrieved (${res.retrieval_mode}).`,
        isError: false,
      });
      if (res.study) {
        setActiveStudyModal(res.study);
      }
    }
  };

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
      name: 'Ambient Hull Area Radiation Rate',
      unit: 'µSv/h',
      range: '40 – 60 µSv/h',
      domain: 'Radiation & Habitat',
      source: 'Spacecraft Ambient Silicon Dosimeter',
      description: 'Galactic cosmic radiation background inside transit hull shielding (ambient context, not personal organ dose).',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-space-700/60 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-300 font-bold">
              MODULE I — NASA EVIDENCE LIBRARY & DATA PROVENANCE
            </span>
            <span className="text-xs font-mono text-slate-400">OSDR · HRP · DONKI · DATA DICTIONARY</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            NASA Spaceflight Evidence Library, OSDR Integration & Data Dictionary
          </h1>
          <p className="text-xs text-slate-400">
            Searchable repository of verified NASA Open Science Data Repository (OSDR) datasets, NASA Human Research Program (HRP) evidence syntheses, and onboard sensor provenance.
          </p>
        </div>
      </div>

      {/* Synthetic Data & Ethical Disclosure Banner */}
      <div className="p-4 rounded-xl bg-space-850 border border-cyan-500/50 shadow-glow-cyan space-y-2 font-mono text-xs">
        <div className="flex items-center gap-2 font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>SYNTHETIC TELEMETRY & NASA EVIDENCE PROVENANCE DISCLOSURE</span>
        </div>
        <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
          In strict compliance with NASA Space Apps Challenge ethical standards and astronaut privacy policies,{' '}
          <strong>MOSAIC-9 uses 100% synthetic crew mission telemetry</strong> while integrating{' '}
          <strong>real published NASA OSDR and NASA HRP scientific evidence metadata</strong> as contextual research references.{' '}
          Specifically, <strong>OSD-575 (LSDS-8, Dataset DOI: 10.26030/mc5d-p710)</strong> represents pre/post-flight human venous serum biomarkers (SpaceX Inspiration4, n=4 across L-92, L-44, L-3, R+1, R+45, R+82),{' '}
          <strong>OSD-571 (GLDS-563, Dataset DOI: 10.26030/h3p5-tc29)</strong> represents human plasma multi-omics profiling, and{' '}
          <strong>OSD-635 (GLDS-608, Dataset DOI: 10.26030/8n5a-q187)</strong> represents <em>in vitro</em> primary human aortic smooth muscle cell transcriptomics cultured 3 days on the ISS—none is presented as continuous wearable astronaut telemetry. Internal keys (<code className="text-indigo-300">HRP-CV-OI</code>, <code className="text-indigo-300">HRP-SLEEP-CIRC</code>, <code className="text-indigo-300">HRP-AERO-MUSC</code>, <code className="text-indigo-300">HRP-ENV-CO2</code>) are internal application reference IDs mapped to official NASA Human Research Roadmap (HRR) Risk records (<code className="text-cyan-300">risk.aspx?i=179</code>, <code className="text-cyan-300">risk.aspx?i=100</code>).
        </p>
      </div>

      {/* NASA OSDR Live / Cached Endpoint Lookup Bar */}
      <div className="bg-space-850 border border-indigo-500/40 rounded-xl p-4 shadow-panel space-y-3 font-mono text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>NASA OSDR REST API & ONBOARD CACHE VERIFICATION CONNECTOR</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Queries <code className="text-cyan-300">https://osdr.nasa.gov/osdr/data/osd/files/&#123;id&#125;</code> &amp;{' '}
              <code className="text-cyan-300">https://visualization.osdr.nasa.gov/biodata/api/v2/</code> with a 3s timeout and verified offline cache fallback.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="e.g. OSD-575 or OSD-635"
              className="bg-space-900 border border-space-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 w-40"
            />
            <button
              onClick={() => handleOsdrLookup()}
              disabled={lookupStatus.loading}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${lookupStatus.loading ? 'animate-spin' : ''}`} />
              <span>VERIFY OSDR STUDY</span>
            </button>
            <button
              onClick={() => handleOsdrLookup('OSD-575')}
              className="px-2.5 py-1.5 rounded-lg bg-space-900 hover:bg-space-800 border border-space-700 text-cyan-300 text-xs"
            >
              OSD-575 (LSDS-8)
            </button>
            <button
              onClick={() => handleOsdrLookup('OSD-571')}
              className="px-2.5 py-1.5 rounded-lg bg-space-900 hover:bg-space-800 border border-space-700 text-cyan-300 text-xs"
            >
              OSD-571 (GLDS-563)
            </button>
            <button
              onClick={() => handleOsdrLookup('OSD-635')}
              className="px-2.5 py-1.5 rounded-lg bg-space-900 hover:bg-space-800 border border-space-700 text-cyan-300 text-xs"
            >
              OSD-635 (GLDS-608)
            </button>
          </div>
        </div>

        {lookupStatus.message && (
          <div
            className={`p-3 rounded-lg border flex items-center justify-between gap-2 text-xs ${
              lookupStatus.isError
                ? 'bg-rose-950/50 border-rose-700 text-rose-200'
                : 'bg-emerald-950/40 border-emerald-700/70 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {lookupStatus.isError ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>
                <strong>[{lookupStatus.mode}]</strong> {lookupStatus.message}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PHASE 1.5: EVIDENCE LIBRARY SEARCH & FILTER BAR */}
      <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-space-700/60 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase font-mono">
              NASA EVIDENCE LIBRARY ({studies.length} VERIFIED RECORDS)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full lg:w-auto font-mono text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search OSD-575, smooth muscle, CO2..."
                className="w-full bg-space-900 border border-space-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Domain Filter */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-space-900 border border-space-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Health Domains</option>
              <option value="cardiovascular">Cardiovascular & Autonomic</option>
              <option value="neuro_cognitive_sleep">Neuro-Cognitive & Sleep</option>
              <option value="musculoskeletal">Musculoskeletal & Exercise</option>
              <option value="environmental">Environmental & Radiation</option>
            </select>

            {/* Source Organization Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-space-900 border border-space-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All NASA Sources</option>
              <option value="NASA_OSDR">NASA OSDR (Open Science Data Repo)</option>
              <option value="NASA_HRP">NASA HRP (Human Research Program)</option>
              <option value="NASA_DONKI">NASA CCMC DONKI (Space Weather)</option>
            </select>

            {/* Study Category / Population Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-space-900 border border-space-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Study / Population Types</option>
              <option value="HUMAN_COHORT_BIOMARKERS">Human Spaceflight Cohort Biomarkers</option>
              <option value="CELLULAR_IN_VITRO">In Vitro Cellular Transcriptomics</option>
              <option value="EVIDENCE_SYNTHESIS">NASA HRP Risk Evidence Synthesis</option>
              <option value="ENVIRONMENTAL_CONTEXT">Heliophysics Environmental Context</option>
            </select>
          </div>
        </div>

        {/* Evidence Library Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {studies.map((study) => (
            <div
              key={study.study_id}
              onClick={() => setActiveStudyModal(study)}
              className="p-4 rounded-xl bg-space-900 border border-space-700/90 hover:border-indigo-400/80 transition-all cursor-pointer flex flex-col justify-between space-y-3 font-mono text-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-indigo-950 border border-indigo-600 text-indigo-200 font-bold">
                      {study.study_id}
                    </span>
                    <EvidencePill classification="NASA_RESEARCH_CONTEXT" showIcon={false} />
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px]">
                    {study.retrieval_status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white font-sans leading-snug">
                  {study.title}
                </h3>

                <div className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-700/50 text-amber-300 text-[10px] font-bold">
                  {study.applicability_note}
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {study.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] font-sans text-slate-400">
                  <div>
                    <strong className="text-slate-300 font-mono">Source:</strong>{' '}
                    {study.source_organization}
                  </div>
                  <div>
                    <strong className="text-slate-300 font-mono">Organism:</strong>{' '}
                    {study.population_type}
                  </div>
                  <div>
                    <strong className="text-slate-300 font-mono">Study Type:</strong>{' '}
                    {study.study_type}
                  </div>
                  <div>
                    <strong className="text-slate-300 font-mono">DOI / Ref:</strong>{' '}
                    <span className="text-indigo-300 font-mono">{study.doi}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-space-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {study.domains.map((dom) => (
                    <span
                      key={dom}
                      className="px-2 py-0.5 rounded bg-space-950 border border-space-700 text-cyan-300 text-[10px] uppercase"
                    >
                      {dom}
                    </span>
                  ))}
                </div>
                <span className="text-indigo-300 hover:underline flex items-center gap-1 shrink-0">
                  <span>Inspect Metadata & Limitations</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Data Dictionary Table */}
      <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase font-mono">
            MISSION TELEMETRY DATA DICTIONARY (SYNTHETIC CREW SENSOR CHANNELS)
          </h3>
          <p className="text-xs text-slate-400">
            Standardized nomenclature, measurement units, expected physiological ranges, and onboard sensor provenance.
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

      {/* Study Deep-Dive Modal */}
      {activeStudyModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-space-900 border border-indigo-500/60 rounded-xl max-w-2xl w-full p-6 shadow-panel space-y-4 font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-space-700 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-indigo-950 border border-indigo-600 text-indigo-200 font-bold text-xs">
                  {activeStudyModal.study_id} ({activeStudyModal.accession})
                </span>
                <EvidencePill classification="NASA_RESEARCH_CONTEXT" />
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px]">
                  {activeStudyModal.retrieval_status}
                </span>
              </div>
              <button
                onClick={() => setActiveStudyModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-white font-sans">{activeStudyModal.title}</h3>
              <div className="mt-2 px-3 py-1.5 rounded bg-amber-950/70 border border-amber-600/60 text-amber-300 text-xs font-mono font-bold">
                {activeStudyModal.applicability_note}
              </div>
            </div>

            <div className="bg-space-950 p-4 rounded-lg border border-space-800 space-y-2 text-xs font-sans">
              <div>
                <strong className="text-slate-400 font-mono">Source Organization:</strong>{' '}
                <span className="text-white">{activeStudyModal.source_organization}</span>
              </div>
              <div>
                <strong className="text-slate-400 font-mono">Organism / Population:</strong>{' '}
                <span className="text-white">{activeStudyModal.organism}</span>
              </div>
              <div>
                <strong className="text-slate-400 font-mono">Study Design & Assays:</strong>{' '}
                <span className="text-slate-200">
                  {activeStudyModal.study_type} — {activeStudyModal.assay_types.join('; ')}
                </span>
              </div>
              <div>
                <strong className="text-slate-400 font-mono">Publication & DOI:</strong>{' '}
                <span className="text-indigo-300">
                  {activeStudyModal.publication} (DOI: {activeStudyModal.doi})
                </span>
              </div>
              <div>
                <strong className="text-slate-400 font-mono">Summary:</strong>{' '}
                <span className="text-slate-300">{activeStudyModal.summary}</span>
              </div>
              <div>
                <strong className="text-slate-400 font-mono">Relevance to MOSAIC-9:</strong>{' '}
                <span className="text-cyan-300">{activeStudyModal.relevance_to_mosaic}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-700/60 text-xs font-sans">
              <strong className="text-rose-300 font-mono uppercase block mb-1">
                Explicit Scientific Limitations & Applicability Boundary:
              </strong>
              <p className="text-slate-200 leading-relaxed">{activeStudyModal.limitations}</p>
            </div>

            {activeStudyModal.files_manifest && activeStudyModal.files_manifest.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>OSDR Study Repository File Manifest:</span>
                </span>
                <div className="space-y-1.5">
                  {activeStudyModal.files_manifest.map((f, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-space-950 border border-space-800 flex items-center justify-between text-xs"
                    >
                      <span className="text-cyan-300 font-mono">{f.file_name}</span>
                      <span className="text-slate-400 font-sans text-[11px]">{f.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-space-800 text-xs">
              <a
                href={activeStudyModal.osdr_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-indigo-200 underline flex items-center gap-1.5"
              >
                <span>Open Official NASA Source ({activeStudyModal.osdr_url})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setActiveStudyModal(null)}
                className="px-4 py-1.5 bg-space-800 hover:bg-space-700 text-white rounded-lg"
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
