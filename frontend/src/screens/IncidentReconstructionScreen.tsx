import React, { useState, useEffect } from 'react';
import { Incident, ReconstructionData, EvidenceNode, CrewMember } from '../types';
import { ScreenId } from '../components/layout/Sidebar';
import { mosaicApi } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { EvidencePill } from '../components/common/EvidencePill';
import {
  DEFAULT_INCIDENTS,
  DEFAULT_CREW_MEMBERS,
  DEFAULT_RECONSTRUCTION_INC1,
  DEFAULT_RECONSTRUCTION_INC2,
} from '../data/initialData';
import {
  History,
  AlertTriangle,
  Clock,
  Eye,
  HelpCircle,
  CheckSquare,
  ArrowRight,
  ShieldAlert,
  Radio,
  Sliders,
  Database,
  X,
  ChevronDown,
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

  // Determine initial incident from selected crew member if matched
  const initialIncident =
    displayIncidents.find((i) => i.crew_member_id === selectedCrew?.id) || displayIncidents[0];

  const [selectedIncidentId, setSelectedIncidentId] = useState<number>(initialIncident.id);
  const [horizonHours, setHorizonHours] = useState<number>(72);
  const [reconstruction, setReconstruction] = useState<ReconstructionData | null>(
    initialIncident.id === 2 ? DEFAULT_RECONSTRUCTION_INC2 : DEFAULT_RECONSTRUCTION_INC1
  );
  const [loading, setLoading] = useState(false);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<EvidenceNode | null>(null);

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
      mosaicApi
        .reconstructIncident(selectedIncidentId, horizonHours)
        .then((data) => {
          setReconstruction(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [selectedIncidentId, horizonHours]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-space-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
              MODULE E — SIGNATURE RECONSTRUCTION WORKSPACE
            </span>
            <span className="text-xs font-mono text-slate-400">EXPLAINABLE CLINICAL INTELLIGENCE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Health Incident Multi-Domain Timeline Reconstruction
          </h1>
          <p className="text-xs text-slate-400">
            Traces the chronological precursor chain, verifies supporting sensor facts, isolates missing data, and builds explainable hypotheses.
          </p>
        </div>

        {/* Quick Action to Sandbox or Ground Brief */}
        <div className="flex items-center gap-2">
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
      <div className="bg-space-850 border border-space-700 rounded-xl p-4 shadow-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  const list: CrewMember[] = crewMembers && crewMembers.length > 0 ? crewMembers : DEFAULT_CREW_MEMBERS;
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

      {reconstruction && (
        <div className="space-y-6">
          {/* Target Incident Focal Banner */}
          <div className="p-5 rounded-xl bg-space-850 border border-rose-500/60 shadow-glow-rose space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-space-700/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  {reconstruction.incident.incident_code}
                </span>
                <span className="text-xs text-slate-300 font-sans font-semibold">
                  {reconstruction.incident.crew_member?.name} ({reconstruction.incident.crew_member?.callsign})
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <StatusBadge status={reconstruction.incident.severity as any} size="sm" />
                <span className="text-slate-400">
                  Day {reconstruction.incident.mission_day} {reconstruction.incident.incident_timestamp ? reconstruction.incident.incident_timestamp.slice(11, 16) : '00:00'} MET
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

            {/* Scientific Disclaimers & Traceability Notice */}
            <div className="p-3 rounded-lg bg-space-950 border border-space-800 text-[11px] text-slate-400 font-sans flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Traceable Scientific Integrity:</strong> Every node below is classified as either an Observed Fact, a Derived Indicator, or a Temporal Association. Click any node to inspect sensor telemetry provenance and calibration timestamps.
              </div>
            </div>
          </div>

          {/* Reconstructed Chronological Event Sequence */}
          <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  PRECURSOR EVENT TIMELINE (LOOKBACK: -{horizonHours} HOURS)
                </h3>
                <p className="text-xs text-slate-400">
                  Chronologically ordered telemetry and operational events leading up to the acute episode.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {reconstruction.evidence_nodes.length} Preceding Nodes
              </span>
            </div>

            {/* Stepper Timeline List */}
            <div className="relative pl-6 border-l-2 border-space-700 space-y-6 my-4">
              {reconstruction.evidence_nodes.map((node, idx) => (
                <div
                  key={node.event_id || idx}
                  onClick={() => setActiveEvidenceModal(node)}
                  className="relative group cursor-pointer"
                >
                  {/* Timeline bullet dot */}
                  <div
                    className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-transform group-hover:scale-125 ${
                      node.classification === 'OBSERVED_FACT'
                        ? 'bg-cyan-500 border-space-950 shadow-glow-cyan'
                        : node.classification === 'DERIVED_INDICATOR'
                        ? 'bg-blue-500 border-space-950'
                        : node.classification === 'TEMPORAL_ASSOCIATION'
                        ? 'bg-amber-500 border-space-950'
                        : 'bg-rose-500 border-space-950 shadow-glow-rose'
                    }`}
                  ></div>

                  <div className="p-4 rounded-xl bg-space-900 border border-space-700/80 hover:border-cyan-500/80 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <EvidencePill classification={node.classification} />
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

                    <p className="text-xs text-slate-300 font-sans">
                      {node.reasoning}
                    </p>

                    <div className="pt-2 border-t border-space-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Value: <strong className="text-slate-200">{node.value !== null ? `${node.value} ${node.unit || ''}` : 'N/A'}</strong></span>
                      <span className="text-cyan-400 group-hover:underline flex items-center gap-1">
                        <span>Inspect Records</span>
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>
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
                    <strong className="text-rose-400">Impact on Confidence:</strong> {item.impact_on_confidence}
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
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 font-mono">{hyp.hypothesis_id}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
                      {hyp.plausibility}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white font-sans">{hyp.title}</h4>

                  <div className="space-y-1.5 font-sans">
                    <span className="text-[10px] uppercase font-mono text-slate-400">Supporting Facts:</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                      {hyp.supporting_facts.map((fact, fIdx) => (
                        <li key={fIdx}>{fact}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-space-800 text-[11px] font-sans text-slate-400">
                    <strong className="text-amber-400">Scientific Boundary:</strong> {hyp.scientific_boundary}
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
        </div>
      )}

      {/* Evidence Node Inspection Modal */}
      {activeEvidenceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-space-900 border border-space-700 rounded-xl max-w-lg w-full p-6 shadow-panel space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-space-700 pb-3">
              <EvidencePill classification={activeEvidenceModal.classification} />
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
              <div><strong className="text-slate-400">Telemetry UID:</strong> {activeEvidenceModal.event_uid}</div>
              <div><strong className="text-slate-400">Timestamp:</strong> {activeEvidenceModal.timestamp}</div>
              <div><strong className="text-slate-400">Hours Before Incident:</strong> -{activeEvidenceModal.relative_hours}h</div>
              <div><strong className="text-slate-400">Recorded Value:</strong> {activeEvidenceModal.value !== null ? `${activeEvidenceModal.value} ${activeEvidenceModal.unit || ''}` : 'N/A'}</div>
              <div><strong className="text-slate-400">Data Quality Flag:</strong> <span className="text-emerald-400">{activeEvidenceModal.data_quality}</span></div>
              <div><strong className="text-slate-400">Confidence Score:</strong> {(activeEvidenceModal.confidence * 100).toFixed(0)}%</div>
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
