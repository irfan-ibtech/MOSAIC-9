import React, { useState, useEffect } from 'react';
import {
  Incident,
  ReconstructionData,
  EvidenceNode,
  CrewMember,
  EvidenceGraphNode,
  EvidenceClassification,
} from '../types';
import { mosaicApi } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { EvidencePill } from '../components/common/EvidencePill';
import {
  DEFAULT_INCIDENTS,
  DEFAULT_CREW_MEMBERS,
  DEFAULT_RECONSTRUCTION_INC1,
  DEFAULT_RECONSTRUCTION_INC2,
  DEFAULT_EVIDENCE_GRAPH_INC1,
  DEFAULT_EVIDENCE_GRAPH_INC2,
  DEFAULT_NASA_STUDIES,
} from '../data/initialData';
import {
  Clock,
  Eye,
  HelpCircle,
  CheckSquare,
  ShieldAlert,
  Radio,
  Sliders,
  X,
  ChevronDown,
  Network,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  BookOpen,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface IncidentReconstructionScreenProps {
  onNavigate: (screen: any) => void;
  selectedCrew?: CrewMember | null;
  onSelectCrew?: (crew: CrewMember) => void;
  crewMembers?: CrewMember[];
}

export const IncidentReconstructionScreen: React.FC<IncidentReconstructionScreenProps> = ({
  onNavigate,
  selectedCrew,
  onSelectCrew,
  crewMembers,
}) => {
  const [incidents, setIncidents] = useState<Incident[]>(DEFAULT_INCIDENTS);
  const displayIncidents = incidents && incidents.length > 0 ? incidents : DEFAULT_INCIDENTS;

  const initialIncident =
    displayIncidents.find((i) => i.crew_member_id === selectedCrew?.id) || displayIncidents[0];

  const [selectedIncidentId, setSelectedIncidentId] = useState<number>(initialIncident.id);
  const [horizonHours, setHorizonHours] = useState<number>(72);
  const [reconstruction, setReconstruction] = useState<ReconstructionData | null>(
    initialIncident.id === 2 ? DEFAULT_RECONSTRUCTION_INC2 : DEFAULT_RECONSTRUCTION_INC1
  );
  const [, setLoading] = useState(false);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<EvidenceNode | null>(null);

  // Phase 1.4: Mission Evidence Graph state
  const [activeViewTab, setActiveViewTab] = useState<'TIMELINE_AND_GRAPH' | 'GRAPH_FOCUS'>('TIMELINE_AND_GRAPH');
  const [graphFilterTier, setGraphFilterTier] = useState<string>('ALL');
  const [selectedGraphNode, setSelectedGraphNode] = useState<EvidenceGraphNode | null>(null);

  // Phase 3: Interactive Mission Event Replay state
  const [isReplayPlaying, setIsReplayPlaying] = useState<boolean>(false);
  const [replayIndex, setReplayIndex] = useState<number | null>(null);

  useEffect(() => {
    mosaicApi.getIncidents().then((list) => {
      if (list && list.length > 0) {
        setIncidents(list);
        const matching = list.find((i) => i.crew_member_id === selectedCrew?.id);
        if (matching) {
          setSelectedIncidentId(matching.id);
        }
      }
    });
  }, [selectedCrew?.id]);

  useEffect(() => {
    if (selectedIncidentId) {
      setLoading(true);
      setIsReplayPlaying(false);
      setReplayIndex(null);
      mosaicApi
        .reconstructIncident(selectedIncidentId, horizonHours)
        .then((data) => {
          setReconstruction(data);
          const fallbackGraph =
            selectedIncidentId === 2 ? DEFAULT_EVIDENCE_GRAPH_INC2 : DEFAULT_EVIDENCE_GRAPH_INC1;
          const graph = data.evidence_graph || fallbackGraph;
          if (graph.nodes.length > 0) {
            setSelectedGraphNode(
              graph.nodes.find((n) => n.id.startsWith('NASA-OSD-575')) || graph.nodes[0]
            );
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [selectedIncidentId, horizonHours]);

  // Replay timer effect
  const evidenceNodes = reconstruction?.evidence_nodes || [];
  useEffect(() => {
    if (!isReplayPlaying || evidenceNodes.length === 0) return;
    const timer = setInterval(() => {
      setReplayIndex((prev) => {
        const current = prev === null ? 0 : prev;
        if (current >= evidenceNodes.length - 1) {
          setIsReplayPlaying(false);
          return evidenceNodes.length - 1;
        }
        return current + 1;
      });
    }, 1400);
    return () => clearInterval(timer);
  }, [isReplayPlaying, evidenceNodes.length]);

  const activeGraph =
    reconstruction?.evidence_graph ||
    (selectedIncidentId === 2 ? DEFAULT_EVIDENCE_GRAPH_INC2 : DEFAULT_EVIDENCE_GRAPH_INC1);

  const filteredGraphNodes =
    graphFilterTier === 'ALL'
      ? activeGraph.nodes
      : activeGraph.nodes.filter((n) => n.category === graphFilterTier);

  const nasaContextStudies =
    reconstruction?.nasa_research_context && reconstruction.nasa_research_context.length > 0
      ? reconstruction.nasa_research_context
      : DEFAULT_NASA_STUDIES;

  // Replay active node & cumulative state up to replayIndex
  const currentReplayIdx =
    replayIndex !== null ? Math.min(replayIndex, Math.max(0, evidenceNodes.length - 1)) : null;
  const activeReplayNode = currentReplayIdx !== null ? evidenceNodes[currentReplayIdx] : null;
  const replayVisibleNodes =
    currentReplayIdx !== null ? evidenceNodes.slice(0, currentReplayIdx + 1) : evidenceNodes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-space-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
              MODULE E — SIGNATURE RECONSTRUCTION & NASA EVIDENCE GRAPH
            </span>
            <span className="text-xs font-mono text-slate-400">EXPLAINABLE CLINICAL INTELLIGENCE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Health Incident Multi-Domain Timeline Reconstruction
          </h1>
          <p className="text-xs text-slate-400">
            Traces the chronological precursor chain, fuses NASA OSDR/HRP spaceflight evidence, isolates missing data, and builds explainable hypotheses.
          </p>
        </div>

        {/* Quick Action to Sandbox, Evidence Library, or Ground Brief */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('data_sources')}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/70 text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>NASA EVIDENCE LIBRARY</span>
          </button>

          <button
            onClick={() => onNavigate('scenario_sandbox')}
            className="px-3 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-cyan-300 border border-cyan-800 text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>TEST COUNTERMEASURE</span>
          </button>

          <button
            onClick={() => onNavigate('ground_comms')}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-panel transition-all"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>DRAFT GROUND BRIEF</span>
          </button>
        </div>
      </div>

      {/* Incident Selector & Horizon Control Bar */}
      <div className="bg-space-850 border border-space-700 rounded-xl p-4 shadow-panel flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-mono text-slate-400 uppercase shrink-0">SELECT INCIDENT:</span>
          <div className="relative">
            <select
              value={selectedIncidentId}
              onChange={(e) => {
                const incId = Number(e.target.value);
                setSelectedIncidentId(incId);
                const targetInc = displayIncidents.find((i) => i.id === incId);
                if (targetInc && onSelectCrew) {
                  const list: CrewMember[] =
                    crewMembers && crewMembers.length > 0 ? crewMembers : DEFAULT_CREW_MEMBERS;
                  const foundMember = list.find((c: CrewMember) => c.id === targetInc.crew_member_id);
                  if (foundMember) onSelectCrew(foundMember);
                }
              }}
              className="appearance-none bg-space-900 border border-space-700 hover:border-cyan-500/60 text-xs text-white rounded-lg pl-3 pr-8 py-2 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {displayIncidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.incident_code} — {inc.title} (Day {inc.mission_day})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-space-900 p-1 rounded-lg border border-space-700 text-xs font-mono">
            <button
              onClick={() => setActiveViewTab('TIMELINE_AND_GRAPH')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 ${
                activeViewTab === 'TIMELINE_AND_GRAPH'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/60 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>FULL RECONSTRUCTION</span>
            </button>
            <button
              onClick={() => setActiveViewTab('GRAPH_FOCUS')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 ${
                activeViewTab === 'GRAPH_FOCUS'
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/60 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>MISSION EVIDENCE GRAPH</span>
            </button>
          </div>

          {/* Horizon Range Switcher */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400 uppercase text-[11px] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              HORIZON:
            </span>
            {[
              { label: '6h', hours: 6 },
              { label: '24h', hours: 24 },
              { label: '72h', hours: 72 },
              { label: '7d', hours: 168 },
            ].map((item) => (
              <button
                key={item.hours}
                onClick={() => setHorizonHours(item.hours)}
                className={`px-3 py-1 rounded-lg border transition-all text-xs ${
                  horizonHours === item.hours
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold shadow-panel'
                    : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {reconstruction && (
        <div className="space-y-6">
          {/* Target Incident Focal Banner */}
          <div className="p-5 rounded-xl bg-space-850 border border-rose-500/60 shadow-glow-rose space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-space-700/60 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  {reconstruction.incident.incident_code}
                </span>
                <span className="text-xs text-slate-300 font-sans font-semibold">
                  {reconstruction.incident.crew_member?.name} ({reconstruction.incident.crew_member?.callsign})
                </span>
                <EvidencePill classification="DIRECT_OBSERVATION" />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <StatusBadge status={reconstruction.incident.severity as any} size="sm" />
                <span className="text-slate-400">
                  Day {reconstruction.incident.mission_day}{' '}
                  {reconstruction.incident.incident_timestamp
                    ? reconstruction.incident.incident_timestamp.slice(11, 16)
                    : '00:00'}{' '}
                  MET
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-white font-sans">
                {reconstruction.incident.title}
              </h2>
              <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                {reconstruction.incident.description}
              </p>
            </div>

            {/* Scientific Disclaimers & 6-Tier Taxonomy Legend */}
            <div className="p-3 rounded-lg bg-space-950 border border-space-800 text-[11px] text-slate-400 font-sans space-y-2">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">6-Tier Evidence Classification & Provenance:</strong>{' '}
                  MOSAIC-9 strictly distinguishes <strong className="text-cyan-300">Direct Observations</strong>,{' '}
                  <strong className="text-indigo-300">NASA Research Context (OSDR/HRP)</strong>,{' '}
                  <strong className="text-amber-300">Derived Temporal Associations</strong>,{' '}
                  <strong className="text-purple-300">Exploratory Hypotheses</strong>,{' '}
                  <strong className="text-rose-300">Missing Evidence</strong>, and{' '}
                  <strong className="text-teal-300">Synthetic Simulations</strong>. Temporal association never implies proved clinical causation.
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <EvidencePill classification="DIRECT_OBSERVATION" />
                <EvidencePill classification="NASA_RESEARCH_CONTEXT" />
                <EvidencePill classification="DERIVED_TEMPORAL_ASSOCIATION" />
                <EvidencePill classification="EXPLORATORY_HYPOTHESIS" />
                <EvidencePill classification="MISSING_EVIDENCE" />
                <EvidencePill classification="SYNTHETIC_SIMULATION" />
              </div>
            </div>
          </div>

          {/* PHASE 1.4: INTERACTIVE MISSION EVIDENCE GRAPH */}
          <div className="bg-space-850 border border-indigo-500/40 rounded-xl p-5 shadow-panel space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-space-700/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono">
                    MISSION EVIDENCE GRAPH ({activeGraph.incident_code})
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950/90 border border-indigo-700 text-indigo-300">
                    {activeGraph.nodes.length} NODES · {activeGraph.edges.length} EVIDENCE LINKS
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interactive evidence topology linking mission telemetry, health domains, published NASA OSDR/HRP studies (OSD-575, OSD-635), hypotheses, and missing measurements.
                </p>
              </div>

              {/* Graph Tier Filter */}
              <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px]">
                {[
                  { key: 'ALL', label: 'ALL TIERS' },
                  { key: 'DIRECT_OBSERVATION', label: 'DIRECT OBS' },
                  { key: 'NASA_RESEARCH_CONTEXT', label: 'NASA OSDR/HRP' },
                  { key: 'DERIVED_TEMPORAL_ASSOCIATION', label: 'TEMPORAL/DOMAINS' },
                  { key: 'EXPLORATORY_HYPOTHESIS', label: 'HYPOTHESES' },
                  { key: 'MISSING_EVIDENCE', label: 'MISSING DATA' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setGraphFilterTier(f.key)}
                    className={`px-2.5 py-1 rounded border transition-all ${
                      graphFilterTier === f.key
                        ? 'bg-indigo-950 text-indigo-200 border-indigo-500 font-bold'
                        : 'bg-space-900 text-slate-400 border-space-700 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Multi-Layer Graph + Inspector Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left 7 Cols: Interactive Evidence Graph Layers */}
              <div className="lg:col-span-7 bg-space-900 border border-space-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>CLICK ANY GRAPH NODE TO INSPECT PROVENANCE, ATTRIBUTION & LIMITATIONS</span>
                  <span className="text-indigo-400">{filteredGraphNodes.length} Visible Nodes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {filteredGraphNodes.map((gNode) => {
                    const isSelected = selectedGraphNode?.id === gNode.id;
                    const connectedEdges = activeGraph.edges.filter(
                      (e) => e.source === gNode.id || e.target === gNode.id
                    );
                    return (
                      <div
                        key={gNode.id}
                        onClick={() => setSelectedGraphNode(gNode)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-400 shadow-panel'
                            : 'bg-space-950/80 border-space-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <EvidencePill
                            classification={gNode.category as EvidenceClassification}
                            showIcon={false}
                            className="text-[9px] px-1.5 py-0.5"
                          />
                          <span className="text-[10px] font-mono text-slate-400">
                            {connectedEdges.length} links
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white font-sans line-clamp-2">
                          {gNode.full_title || gNode.label}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span className="truncate max-w-[180px]">{gNode.source_attribution}</span>
                          {gNode.confidence_or_applicability > 0 ? (
                            <span className="text-cyan-400">
                              {(gNode.confidence_or_applicability * 100).toFixed(0)}% align
                            </span>
                          ) : (
                            <span className="text-rose-400">UNACQUIRED</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 5 Cols: Selected Graph Node Provenance & Limitations Inspector */}
              <div className="lg:col-span-5 bg-space-900 border border-indigo-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 font-mono">
                {selectedGraphNode ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-space-800 pb-2.5">
                      <EvidencePill classification={selectedGraphNode.category as EvidenceClassification} />
                      <span className="text-[11px] text-slate-400">{selectedGraphNode.id}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white font-sans">
                        {selectedGraphNode.full_title || selectedGraphNode.label}
                      </h4>
                      {selectedGraphNode.applicability_note && (
                        <div className="mt-1.5 px-2.5 py-1 rounded bg-amber-950/70 border border-amber-600/50 text-amber-300 text-[10px] font-mono font-bold">
                          {selectedGraphNode.applicability_note}
                        </div>
                      )}
                    </div>

                    <div className="bg-space-950 p-3 rounded-lg border border-space-800 space-y-1.5 text-xs font-sans">
                      <div>
                        <strong className="text-slate-400 font-mono text-[11px]">Source Attribution:</strong>{' '}
                        <span className="text-slate-200">{selectedGraphNode.source_attribution}</span>
                      </div>
                      <div>
                        <strong className="text-slate-400 font-mono text-[11px]">Provenance Record:</strong>{' '}
                        <span className="text-cyan-300">{selectedGraphNode.provenance}</span>
                      </div>
                      {selectedGraphNode.organism && (
                        <div>
                          <strong className="text-slate-400 font-mono text-[11px]">Organism / Cohort:</strong>{' '}
                          <span className="text-slate-200">{selectedGraphNode.organism}</span>
                        </div>
                      )}
                      {selectedGraphNode.study_type && (
                        <div>
                          <strong className="text-slate-400 font-mono text-[11px]">Study / Node Type:</strong>{' '}
                          <span className="text-slate-200">{selectedGraphNode.study_type}</span>
                        </div>
                      )}
                      {selectedGraphNode.doi && (
                        <div>
                          <strong className="text-slate-400 font-mono text-[11px]">DOI / Reference ID:</strong>{' '}
                          <span className="text-indigo-300 font-mono">{selectedGraphNode.doi}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/50 text-xs font-sans">
                      <strong className="text-rose-300 font-mono text-[11px] uppercase block mb-1">
                        Scientific Boundary & Limitations:
                      </strong>
                      <p className="text-slate-300 leading-relaxed">{selectedGraphNode.limitations}</p>
                    </div>

                    {/* Connected Relationships */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase text-slate-400">
                        Connected Graph Relationships:
                      </span>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {activeGraph.edges
                          .filter(
                            (e) => e.source === selectedGraphNode.id || e.target === selectedGraphNode.id
                          )
                          .map((edge, eIdx) => (
                            <div
                              key={eIdx}
                              className="p-2 rounded bg-space-950 border border-space-800 text-[11px] font-sans text-slate-300"
                            >
                              <span className="font-mono text-indigo-400 font-semibold">
                                {edge.source} → {edge.target}
                              </span>
                              : {edge.explanation}
                            </div>
                          ))}
                      </div>
                    </div>

                    {selectedGraphNode.osdr_url && (
                      <div className="pt-1 flex items-center justify-between">
                        <a
                          href={selectedGraphNode.osdr_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-300 hover:text-indigo-200 underline flex items-center gap-1"
                        >
                          <span>Open Official NASA Repository</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => onNavigate('data_sources')}
                          className="text-xs text-cyan-400 hover:underline"
                        >
                          Inspect in Evidence Library →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Select a node in the Mission Evidence Graph to inspect provenance.</div>
                )}

                <div className="pt-2 border-t border-space-800 text-[10px] text-slate-400 font-sans">
                  {activeGraph.scientific_disclaimer}
                </div>
              </div>
            </div>
          </div>

          {activeViewTab === 'TIMELINE_AND_GRAPH' && (
            <>
              {/* PHASE 3: INTERACTIVE MISSION EVENT REPLAY & PRECURSOR TIMELINE */}
              <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                      <span>PRECURSOR EVENT TIMELINE & CHRONOLOGICAL REPLAY (LOOKBACK: -{horizonHours} HOURS)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Step chronologically through actual stored event timestamps to inspect how telemetry, sleep/workload indicators, environmental events, and evidence evolved.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">
                    {reconstruction.evidence_nodes.length} Preceding Nodes
                  </span>
                </div>

                {/* Interactive Replay Control Bar */}
                <div className="p-3.5 rounded-xl bg-space-900 border border-cyan-500/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold">
                        MISSION EVENT REPLAY
                      </span>
                      <button
                        onClick={() => {
                          if (replayIndex === null || replayIndex >= evidenceNodes.length - 1) {
                            setReplayIndex(0);
                          }
                          setIsReplayPlaying((p) => !p);
                        }}
                        className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                      >
                        {isReplayPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>PAUSE REPLAY</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>{replayIndex !== null ? 'RESUME REPLAY' : 'START REPLAY'}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setIsReplayPlaying(false);
                          setReplayIndex((prev) => (prev === null ? 0 : Math.max(0, prev - 1)));
                        }}
                        disabled={evidenceNodes.length === 0}
                        className="px-2.5 py-1 rounded-lg bg-space-850 hover:bg-space-800 text-slate-200 border border-space-700 text-xs font-mono flex items-center gap-1"
                        title="Previous Stored Event"
                      >
                        <SkipBack className="w-3.5 h-3.5" />
                        <span>PREV</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsReplayPlaying(false);
                          setReplayIndex((prev) =>
                            prev === null ? 0 : Math.min(evidenceNodes.length - 1, prev + 1)
                          );
                        }}
                        disabled={evidenceNodes.length === 0}
                        className="px-2.5 py-1 rounded-lg bg-space-850 hover:bg-space-800 text-slate-200 border border-space-700 text-xs font-mono flex items-center gap-1"
                        title="Next Stored Event"
                      >
                        <span>NEXT</span>
                        <SkipForward className="w-3.5 h-3.5" />
                      </button>

                      {replayIndex !== null && (
                        <button
                          onClick={() => {
                            setIsReplayPlaying(false);
                            setReplayIndex(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-space-850 hover:bg-space-800 text-amber-300 border border-amber-700/60 text-xs font-mono flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>SHOW ALL ({evidenceNodes.length})</span>
                        </button>
                      )}
                    </div>

                    <div className="text-xs font-mono text-slate-300">
                      {currentReplayIdx !== null ? (
                        <span>
                          REPLAY STEP:{' '}
                          <strong className="text-cyan-400">
                            {currentReplayIdx + 1} / {evidenceNodes.length}
                          </strong>{' '}
                          ({activeReplayNode?.relative_hours}h before incident)
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          Showing complete -{horizonHours}h window ({evidenceNodes.length} stored events)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scrubber Slider */}
                  {evidenceNodes.length > 1 && (
                    <div className="space-y-1">
                      <input
                        type="range"
                        min={0}
                        max={evidenceNodes.length - 1}
                        value={currentReplayIdx !== null ? currentReplayIdx : evidenceNodes.length - 1}
                        onChange={(e) => {
                          setIsReplayPlaying(false);
                          setReplayIndex(Number(e.target.value));
                        }}
                        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-space-800 rounded-lg"
                      />
                    </div>
                  )}

                  {/* Active Replay State Snapshot Banner */}
                  {activeReplayNode && (
                    <div className="p-3 rounded-lg bg-space-950 border border-cyan-500/50 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">
                          Active Replay Timestamp
                        </span>
                        <strong className="text-cyan-300">{activeReplayNode.timestamp}</strong>
                        <span className="block text-[11px] text-slate-300 font-sans mt-0.5">
                          {activeReplayNode.title}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">
                          Observed Value & Classification
                        </span>
                        <strong className="text-white">
                          {activeReplayNode.value !== null
                            ? `${activeReplayNode.value} ${activeReplayNode.unit || ''}`
                            : 'Logged Operational Event'}
                        </strong>
                        <div className="mt-1">
                          <EvidencePill classification={activeReplayNode.classification} />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">
                          Cumulative Precursors & Epistemic State
                        </span>
                        <span className="text-slate-200 block">
                          {replayVisibleNodes.length} precursor events observed so far
                        </span>
                        <span className="text-rose-400 text-[11px] block">
                          {reconstruction.missing_evidence.length} unmeasured channels limit certainty
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stepper Timeline List */}
                <div className="relative pl-6 border-l-2 border-space-700 space-y-6 my-4">
                  {replayVisibleNodes.map((node, idx) => {
                    const isReplayCurrent = currentReplayIdx === idx;
                    return (
                      <div
                        key={node.event_id || idx}
                        onClick={() => setActiveEvidenceModal(node)}
                        className="relative group cursor-pointer"
                      >
                        {/* Timeline bullet dot */}
                        <div
                          className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-transform group-hover:scale-125 ${
                            isReplayCurrent
                              ? 'bg-cyan-300 border-white scale-125 shadow-glow-cyan'
                              : node.classification === 'OBSERVED_FACT'
                              ? 'bg-cyan-500 border-space-950 shadow-glow-cyan'
                              : node.classification === 'DERIVED_INDICATOR'
                              ? 'bg-blue-500 border-space-950'
                              : node.classification === 'TEMPORAL_ASSOCIATION'
                              ? 'bg-amber-500 border-space-950'
                              : 'bg-rose-500 border-space-950 shadow-glow-rose'
                          }`}
                        ></div>

                        <div
                          className={`p-4 rounded-xl bg-space-900 border transition-all space-y-2 ${
                            isReplayCurrent
                              ? 'border-cyan-400 shadow-panel'
                              : 'border-space-700/80 hover:border-cyan-500/80'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <EvidencePill classification={node.classification} />
                              {node.taxonomy_v2 && (
                                <EvidencePill classification={node.taxonomy_v2} showIcon={false} />
                              )}
                              <span className="font-mono text-xs font-bold text-white">
                                {node.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                              <span>{node.relative_hours}h before</span>
                              <span>|</span>
                              <span className="text-cyan-400">{node.timestamp.slice(11, 16)} MET</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 font-sans">{node.reasoning}</p>

                          <div className="pt-2 border-t border-space-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span>
                              Value:{' '}
                              <strong className="text-slate-200">
                                {node.value !== null ? `${node.value} ${node.unit || ''}` : 'N/A'}
                              </strong>
                            </span>
                            <span className="text-cyan-400 group-hover:underline flex items-center gap-1">
                              <span>Inspect Records</span>
                              <Eye className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Linked NASA OSDR & HRP Research Evidence Context */}
              <div className="bg-space-850 border border-indigo-500/40 rounded-xl p-5 shadow-panel space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-300">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase font-mono">
                        LINKED NASA OSDR & HRP SPACEFLIGHT RESEARCH CONTEXT
                      </h3>
                      <p className="text-xs text-slate-400">
                        Published NASA Open Science Data Repository (OSD-575, OSD-635) and NASA HRP Evidence Books contextualizing the observed domains.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('data_sources')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 text-xs font-mono shrink-0"
                  >
                    OPEN FULL EVIDENCE LIBRARY →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nasaContextStudies.slice(0, 4).map((study) => (
                    <div
                      key={study.study_id}
                      className="p-4 rounded-xl bg-space-900 border border-space-700 space-y-2 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-300 font-bold">
                            {study.study_id}
                          </span>
                          <EvidencePill classification="NASA_RESEARCH_CONTEXT" showIcon={false} />
                        </div>
                        <span className="text-[10px] text-slate-400">{study.source_type}</span>
                      </div>

                      <h4 className="text-xs font-bold text-white font-sans">{study.title}</h4>
                      <div className="px-2 py-1 rounded bg-amber-950/60 border border-amber-700/50 text-amber-300 text-[10px] font-mono">
                        {study.applicability_note}
                      </div>
                      <p className="text-slate-300 font-sans text-xs">{study.relevance_to_mosaic}</p>
                      <div className="pt-2 border-t border-space-800 text-[11px] font-sans text-slate-400">
                        <strong className="text-rose-300">Scientific Limitation:</strong> {study.limitations}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Evidence Panel (Crucial Feature!) */}
              <div className="bg-space-850 border border-rose-500/40 rounded-xl p-5 shadow-panel space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-300">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase font-mono">
                      MISSING EVIDENCE & DATA LIMITATIONS
                    </h3>
                    <p className="text-xs text-slate-400">
                      Unacquired or offline telemetry streams that reduce diagnostic confidence.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reconstruction.missing_evidence.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-space-900 border border-dashed border-rose-500/50 space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <EvidencePill classification="MISSING_EVIDENCE" />
                        <span className="font-bold text-white font-sans">{item.title}</span>
                      </div>
                      <p className="text-slate-300 font-sans text-xs">{item.description}</p>
                      <div className="pt-2 border-t border-space-800 text-[11px] text-slate-400">
                        <strong className="text-rose-400">Impact on Confidence:</strong>{' '}
                        {item.impact_on_confidence}
                      </div>
                      <div className="text-[11px] text-cyan-400">
                        <strong>Suggested Action:</strong> {item.suggested_investigation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competing Explanatory Hypotheses */}
              <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  COMPETING PHYSIOLOGICAL HYPOTHESES UNDER REVIEW
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {reconstruction.hypotheses.map((hyp) => (
                    <div
                      key={hyp.hypothesis_id}
                      className="p-4 rounded-xl bg-space-900 border border-space-700 space-y-3 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-300 font-mono">
                            {hyp.hypothesis_id}
                          </span>
                          <EvidencePill classification="EXPLORATORY_HYPOTHESIS" showIcon={false} />
                        </div>
                        <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
                          {hyp.plausibility}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white font-sans">{hyp.title}</h4>

                      <div className="space-y-1.5 font-sans">
                        <span className="text-[10px] uppercase font-mono text-slate-400">
                          Supporting Facts:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                          {hyp.supporting_facts.map((fact, fIdx) => (
                            <li key={fIdx}>{fact}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-space-800 text-[11px] font-sans text-slate-400">
                        <strong className="text-amber-400">Scientific Boundary:</strong>{' '}
                        {hyp.scientific_boundary}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommended Reviews */}
              <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-3 font-mono">
                <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>RECOMMENDED ONBOARD & GROUND CLINICAL REVIEWS</span>
                </h3>

                <div className="space-y-2 font-sans text-xs">
                  {reconstruction.recommended_reviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-space-900 border border-space-700 flex items-start gap-2.5 text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center text-[10px] shrink-0 font-mono font-bold">
                        {idx + 1}
                      </span>
                      <span>{rev}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Evidence Node Inspection Modal */}
      {activeEvidenceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-space-900 border border-space-700 rounded-xl max-w-lg w-full p-6 shadow-panel space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-space-700 pb-3">
              <div className="flex items-center gap-2">
                <EvidencePill classification={activeEvidenceModal.classification} />
                {activeEvidenceModal.taxonomy_v2 && (
                  <EvidencePill classification={activeEvidenceModal.taxonomy_v2} showIcon={false} />
                )}
              </div>
              <button
                onClick={() => setActiveEvidenceModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-white font-sans">{activeEvidenceModal.title}</h3>
              <p className="text-xs text-slate-300 font-sans mt-1">
                {activeEvidenceModal.reasoning}
              </p>
            </div>

            <div className="bg-space-950 p-3 rounded-lg border border-space-800 space-y-1.5 text-xs">
              <div>
                <strong className="text-slate-400">Telemetry UID:</strong>{' '}
                {activeEvidenceModal.event_uid}
              </div>
              <div>
                <strong className="text-slate-400">Timestamp:</strong>{' '}
                {activeEvidenceModal.timestamp}
              </div>
              <div>
                <strong className="text-slate-400">Hours Before Incident:</strong> -
                {activeEvidenceModal.relative_hours}h
              </div>
              <div>
                <strong className="text-slate-400">Recorded Value:</strong>{' '}
                {activeEvidenceModal.value !== null
                  ? `${activeEvidenceModal.value} ${activeEvidenceModal.unit || ''}`
                  : 'N/A'}
              </div>
              {activeEvidenceModal.source_attribution && (
                <div>
                  <strong className="text-slate-400">Source Attribution:</strong>{' '}
                  {activeEvidenceModal.source_attribution}
                </div>
              )}
              {activeEvidenceModal.limitations && (
                <div>
                  <strong className="text-slate-400">Scientific Limitation:</strong>{' '}
                  <span className="text-amber-300">{activeEvidenceModal.limitations}</span>
                </div>
              )}
              <div>
                <strong className="text-slate-400">Data Quality Flag:</strong>{' '}
                <span className="text-emerald-400">{activeEvidenceModal.data_quality}</span>
              </div>
              <div>
                <strong className="text-slate-400">Confidence Score:</strong>{' '}
                {(activeEvidenceModal.confidence * 100).toFixed(0)}%
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveEvidenceModal(null)}
                className="px-4 py-2 bg-space-800 hover:bg-space-700 text-slate-200 text-xs rounded-lg font-mono"
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
