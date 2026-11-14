import React, { useState, useEffect } from 'react';
import { GroundCommunication, CrewMember, Incident } from '../types';
import { mosaicApi } from '../services/api';
import {
  Radio,
  Send,
  Save,
  CheckCircle2,
  Clock,
  WifiOff,
  AlertCircle,
  FileText,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

interface GroundCommunicationScreenProps {
  crewMembers: CrewMember[];
}

export const GroundCommunicationScreen: React.FC<GroundCommunicationScreenProps> = ({ crewMembers }) => {
  const [comms, setComms] = useState<GroundCommunication[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for new Ground Brief (SBAR format)
  const [title, setTitle] = useState('Clinical & Operational Incident Brief: Commander Alex Morgan Presyncope');
  const [selectedCrewId, setSelectedCrewId] = useState<number>(1);
  const [situation, setSituation] = useState(
    'Commander Alex Morgan suffered an acute transient orthostatic presyncope episode on Day 120 at 09:42 MET upon standing in the Airlock Node. Blood pressure dropped to 88/56 mmHg with compensatory tachycardia of 118 bpm.'
  );
  const [background, setBackground] = useState(
    'Over the preceding 72 hours, cumulative sleep debt reached 9.8 hours following night-time drill alarms and high EVA stowage workload. Day 119 cycle ergometer aerobic countermeasure was skipped completely.'
  );
  const [assessment, setAssessment] = useState(
    'Multi-factorial autonomic decompensation: microgravity cephalad fluid redistribution exacerbated by acute-on-chronic sleep restriction, missed cardiovascular countermeasure conditioning, and rapid postural change.'
  );
  const [recommendation, setRecommendation] = useState(
    'Request ground flight surgeon concurrence on Scenario Alpha: 36-hour light duty restriction, mandatory 8.5h sleep window, 1200 mL oral electrolyte hydration loading, and graded cycle ergometer resumption at 140W.'
  );
  const [questions, setQuestions] = useState(
    '1. Does Ground Flight Surgeon advise delaying ARED resistance exercise until Day 122? 2. Should midodrine be considered if orthostatic stability is not regained within 48h?'
  );
  const [dataLimitations, setDataLimitations] = useState(
    'No continuous beat-to-beat arterial tonometry or NIRS cerebral oximetry was recorded during the acute episode.'
  );
  const [priority, setPriority] = useState<'ROUTINE' | 'PRIORITY' | 'URGENT'>('PRIORITY');
  const [isSaving, setIsSaving] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchComms = () => {
    setLoading(true);
    mosaicApi.getGroundCommunications().then((list) => {
      setComms(list || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchComms();
  }, []);

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await mosaicApi.saveGroundCommunication({
        crew_member_id: selectedCrewId,
        title,
        clinical_summary: `${situation} ${assessment}`,
        sbar_situation: situation,
        sbar_background: background,
        sbar_assessment: assessment,
        sbar_recommendation: recommendation,
        evidence_ledger_ids: ['EVT-117-0630-SLP', 'EVT-118-1015-EXE', 'EVT-119-0630-SLP', 'EVT-119-1000-EXE', 'EVT-120-0942-INC'],
        data_limitations: dataLimitations,
        questions_for_ground: questions,
        review_priority: priority,
      });
      setSuccessBanner('Ground communication brief successfully queued in onboard storage (QUEUED_LOCAL).');
      fetchComms();
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      alert('Failed to save ground communication');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTransmit = async (id: number) => {
    try {
      const res = await mosaicApi.transmitGroundCommunication(id);
      alert(res.message || 'Transmission initiated');
      fetchComms();
    } catch (err) {
      alert('Transmission error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-space-700/60 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
            MODULE H — MISSION GROUND COMMUNICATION
          </span>
          <span className="text-xs font-mono text-slate-400">
            SBAR CLINICAL & OPERATIONAL BRIEF WORKSPACE
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Ground Flight Surgeon Communication Workspace
        </h1>
        <p className="text-xs text-slate-400">
          Prepare standardized SBAR consultation packets with linked telemetry evidence, explicit uncertainties, and offline resilient queueing.
        </p>
      </div>

      {/* Offline Status / Mars Latency Callout */}
      <div className="p-4 rounded-xl bg-space-850 border border-amber-500/50 shadow-panel flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>DEEP SPACE NETWORK LINK: LOSS OF SIGNAL (OCCULTATION)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                OFFLINE RESILIENT
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans mt-0.5">
              Earth is currently occluded behind Mars. Prepared briefs are automatically queued in local encrypted SQLite storage. When High Gain link resumes, queued packets will synchronize with Houston Mission Control.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 uppercase">ONE-WAY LIGHT TIME</span>
          <div className="text-base font-bold text-amber-300">21.0 MINUTES</div>
        </div>
      </div>

      {successBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Main Grid: Builder Form on Left, Queued Packets on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: SBAR Editor Form */}
        <div className="lg:col-span-7 bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>STRUCTURED SBAR BRIEF BUILDER</span>
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase">PRIORITY:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className={`bg-space-900 border text-xs font-mono px-2 py-1 rounded ${
                  priority === 'URGENT'
                    ? 'border-rose-500 text-rose-300'
                    : priority === 'PRIORITY'
                    ? 'border-amber-500 text-amber-300'
                    : 'border-space-700 text-slate-300'
                }`}
              >
                <option value="ROUTINE">ROUTINE</option>
                <option value="PRIORITY">PRIORITY</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSaveDraft} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">
                Brief Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* S - Situation */}
            <div>
              <label className="block text-cyan-400 font-bold uppercase text-[10px] mb-1">
                [S] SITUATION — ACUTE INCIDENT STATEMENT
              </label>
              <textarea
                required
                rows={2}
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* B - Background */}
            <div>
              <label className="block text-cyan-400 font-bold uppercase text-[10px] mb-1">
                [B] BACKGROUND — PRECEDING MISSION & SLEEP CONTEXT
              </label>
              <textarea
                required
                rows={2}
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* A - Assessment */}
            <div>
              <label className="block text-cyan-400 font-bold uppercase text-[10px] mb-1">
                [A] ASSESSMENT — MULTI-DOMAIN RECONSTRUCTION HYPOTHESIS
              </label>
              <textarea
                required
                rows={2}
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* R - Recommendation */}
            <div>
              <label className="block text-cyan-400 font-bold uppercase text-[10px] mb-1">
                [R] RECOMMENDATION — REQUESTED COUNTERMEASURE ACTIONS
              </label>
              <textarea
                required
                rows={2}
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Questions for Ground */}
            <div>
              <label className="block text-amber-400 font-bold uppercase text-[10px] mb-1">
                SPECIFIC QUESTIONS FOR GROUND FLIGHT SURGEONS
              </label>
              <textarea
                rows={2}
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Data Limitations */}
            <div>
              <label className="block text-rose-400 font-bold uppercase text-[10px] mb-1">
                DATA LIMITATIONS & UNCERTAINTIES
              </label>
              <input
                type="text"
                value={dataLimitations}
                onChange={(e) => setDataLimitations(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-semibold text-xs flex items-center gap-2 shadow-panel transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'SAVING TO LOCAL QUEUE...' : 'QUEUE GROUND PACKET LOCALLY'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Cols: Queued & Historical Ground Packets */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-3">
            <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>ONBOARD PACKET TRANSMISSION QUEUE</span>
            </h3>
            <p className="text-xs text-slate-400">
              Honest status: Packets marked QUEUED_LOCAL remain safely in local SQLite until link establishment.
            </p>

            <div className="space-y-3 pt-2">
              {comms.map((pkt) => (
                <div
                  key={pkt.id}
                  className="p-4 rounded-xl bg-space-900 border border-space-700/80 space-y-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{pkt.packet_id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pkt.sync_status === 'DELIVERED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : pkt.sync_status === 'TRANSMITTING'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {pkt.sync_status}
                    </span>
                  </div>

                  <h4 className="font-bold text-white font-sans text-xs">{pkt.title}</h4>
                  <p className="text-[11px] text-slate-300 font-sans line-clamp-2">
                    {pkt.sbar_situation}
                  </p>

                  <div className="pt-2 border-t border-space-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Priority: <strong className="text-rose-400">{pkt.review_priority}</strong></span>
                    {pkt.sync_status === 'QUEUED_LOCAL' && (
                      <button
                        onClick={() => handleTransmit(pkt.id)}
                        className="px-2 py-1 rounded bg-space-800 hover:bg-space-700 text-cyan-400 border border-space-700 flex items-center gap-1 font-mono"
                      >
                        <Send className="w-3 h-3" />
                        <span>BUFFER TRANSMIT</span>
                      </button>
                    )}
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
