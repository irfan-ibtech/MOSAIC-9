import React, { useState, useEffect } from 'react';
import { GroundCommunication, CrewMember } from '../types';
import { mosaicApi } from '../services/api';
import { DEFAULT_CREW_MEMBERS, DEFAULT_GROUND_COMMS, ASTRONAUT_SBAR_TEMPLATES } from '../data/initialData';
import {
  Radio,
  Send,
  Save,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
  FileText,
  ShieldCheck,
  ChevronDown,
  Download,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

interface GroundCommunicationScreenProps {
  crewMembers: CrewMember[];
  selectedCrew?: CrewMember | null;
  earthLinkState?: 'LOSS_OF_SIGNAL' | 'DEGRADED_COMM' | 'HIGH_GAIN_ESTABLISHED';
  onToggleCommLink?: (state: 'LOSS_OF_SIGNAL' | 'DEGRADED_COMM' | 'HIGH_GAIN_ESTABLISHED') => void;
}

export const GroundCommunicationScreen: React.FC<GroundCommunicationScreenProps> = ({
  crewMembers,
  selectedCrew,
  earthLinkState = 'LOSS_OF_SIGNAL',
  onToggleCommLink,
}) => {
  const displayCrew = crewMembers && crewMembers.length > 0 ? crewMembers : DEFAULT_CREW_MEMBERS;
  const initialCrewId = selectedCrew?.id || 1;
  const initialTemplate = ASTRONAUT_SBAR_TEMPLATES[initialCrewId] || ASTRONAUT_SBAR_TEMPLATES[1];

  const [comms, setComms] = useState<GroundCommunication[]>(DEFAULT_GROUND_COMMS);
  const [, setLoading] = useState(false);

  // Form State for new Ground Brief (SBAR format)
  const [selectedCrewId, setSelectedCrewId] = useState<number>(initialCrewId);
  const [title, setTitle] = useState(initialTemplate.title);
  const [situation, setSituation] = useState(initialTemplate.situation);
  const [background, setBackground] = useState(initialTemplate.background);
  const [assessment, setAssessment] = useState(initialTemplate.assessment);
  const [recommendation, setRecommendation] = useState(initialTemplate.recommendation);
  const [questions, setQuestions] = useState(initialTemplate.questions);
  const [dataLimitations, setDataLimitations] = useState(initialTemplate.dataLimitations);
  const [priority, setPriority] = useState<'ROUTINE' | 'PRIORITY' | 'URGENT'>(initialTemplate.priority);
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

  const handleApplyTemplate = (crewId: number) => {
    const t = ASTRONAUT_SBAR_TEMPLATES[crewId] || ASTRONAUT_SBAR_TEMPLATES[1];
    setSelectedCrewId(crewId);
    setTitle(t.title);
    setSituation(t.situation);
    setBackground(t.background);
    setAssessment(t.assessment);
    setRecommendation(t.recommendation);
    setQuestions(t.questions);
    setDataLimitations(t.dataLimitations);
    setPriority(t.priority);
  };

  // Sync when selectedCrew prop changes
  useEffect(() => {
    if (selectedCrew) {
      handleApplyTemplate(selectedCrew.id);
    }
  }, [selectedCrew?.id]);

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
      const statusNote =
        earthLinkState === 'HIGH_GAIN_ESTABLISHED'
          ? 'Ground communication brief saved and ready for ground sync transmission.'
          : 'Ground communication brief successfully queued in onboard storage (QUEUED_LOCAL).';
      setSuccessBanner(statusNote);
      fetchComms();
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      alert('Failed to save ground communication');
    } finally {
      setIsSaving(false);
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await mosaicApi.triggerSync();
      setSuccessBanner(res.message || 'Ground synchronization completed: all queued packets delivered to Earth flight surgeon console.');
      fetchComms();
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Ground sync failed: Deep Space Network link is currently in LOSS OF SIGNAL.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTransmit = async (id: number) => {
    if (earthLinkState === 'LOSS_OF_SIGNAL') {
      alert(
        'Transmission Blocked: Deep Space Network link is currently in LOSS OF SIGNAL (Mars occultation). Packet remains safely buffered in local onboard SQLite (QUEUED_LOCAL). Toggle High Gain link to transmit.'
      );
      return;
    }
    try {
      const res = await mosaicApi.transmitGroundCommunication(id);
      setSuccessBanner(res.message || 'Transmission initiated via active DSN link.');
      fetchComms();
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      alert('Transmission error');
    }
  };

  const getLinkBanner = () => {
    switch (earthLinkState) {
      case 'HIGH_GAIN_ESTABLISHED':
        return {
          icon: <Wifi className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
          title: 'DEEP SPACE NETWORK LINK: HIGH GAIN PASS ACTIVE',
          badge: 'HIGH GAIN ESTABLISHED',
          badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          borderColor: 'border-emerald-500/50 bg-emerald-950/20 shadow-glow-cyan',
          description:
            'Scheduled High-Gain directional antenna pass established. Outgoing SBAR consultation packets transmit to Earth ground flight surgeon console with 21.0-minute one-way light delay.',
        };
      case 'DEGRADED_COMM':
        return {
          icon: <Radio className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />,
          title: 'DEEP SPACE NETWORK LINK: DEGRADED COMM (BURST MODE)',
          badge: 'LOW BANDWIDTH (21m)',
          badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
          borderColor: 'border-amber-500/50 bg-amber-950/20',
          description:
            'Low-gain antenna active with 21.0-minute one-way light delay. High-bandwidth streaming is throttled; SBAR text packets queued for compressed burst transmission.',
        };
      case 'LOSS_OF_SIGNAL':
      default:
        return {
          icon: <WifiOff className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />,
          title: 'DEEP SPACE NETWORK LINK: LOSS OF SIGNAL (OCCULTATION)',
          badge: 'OFFLINE RESILIENT',
          badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
          borderColor: 'border-rose-500/50 bg-rose-950/20 shadow-glow-rose',
          description:
            'Earth is currently occluded behind Mars. Prepared briefs are automatically queued in local onboard SQLite storage and browser buffer. When High Gain link resumes, queued packets will synchronize with the simulated Earth ground operations terminal.',
        };
    }
  };

  const linkBanner = getLinkBanner();
  const queuedCount = comms.filter((p) => p.sync_status === 'QUEUED_LOCAL').length;

  const handleExportSBAR = () => {
    const sbarPayload = {
      system: 'MOSAIC-9 Ground Communication Subsystem',
      mission: 'ARES-IV Mars Transit',
      met: '2894:15:22',
      crew_member_id: selectedCrewId,
      priority,
      packet: {
        title,
        situation,
        background,
        assessment,
        recommendation,
        questions_for_flight_surgeon: questions,
        unmeasured_data_limitations: dataLimitations,
      },
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(sbarPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sbar_brief_crew${selectedCrewId}_day120.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-space-700/60 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
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

        {/* Quick Export Button */}
        <button
          onClick={handleExportSBAR}
          className="px-3.5 py-2 rounded-lg bg-space-850 hover:bg-space-800 text-cyan-300 border border-cyan-800 text-xs font-mono flex items-center gap-1.5 transition-all self-start md:self-auto shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>EXPORT SBAR PACKET</span>
        </button>
      </div>

      {/* Dynamic DSN Link Status Callout */}
      <div className={`p-4 rounded-xl bg-space-850 border shadow-panel flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs ${linkBanner.borderColor}`}>
        <div className="flex items-start gap-3">
          {linkBanner.icon}
          <div>
            <div className="font-bold text-white flex items-center gap-2 flex-wrap">
              <span>{linkBanner.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border ${linkBanner.badgeColor}`}>
                {linkBanner.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans mt-0.5 leading-relaxed max-w-2xl">
              {linkBanner.description}
            </p>

            {/* In-Screen Link State Switcher */}
            {onToggleCommLink && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">SIMULATE LINK:</span>
                <button
                  type="button"
                  onClick={() => onToggleCommLink('LOSS_OF_SIGNAL')}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                    earthLinkState === 'LOSS_OF_SIGNAL'
                      ? 'bg-rose-950 border-rose-600 text-rose-300 font-bold'
                      : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
                  }`}
                >
                  LOSS OF SIGNAL
                </button>
                <button
                  type="button"
                  onClick={() => onToggleCommLink('DEGRADED_COMM')}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                    earthLinkState === 'DEGRADED_COMM'
                      ? 'bg-amber-950 border-amber-600 text-amber-300 font-bold'
                      : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
                  }`}
                >
                  DEGRADED COMM
                </button>
                <button
                  type="button"
                  onClick={() => onToggleCommLink('HIGH_GAIN_ESTABLISHED')}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                    earthLinkState === 'HIGH_GAIN_ESTABLISHED'
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold'
                      : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
                  }`}
                >
                  HIGH GAIN PASS
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:items-end justify-between gap-2 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase">ONE-WAY LIGHT TIME</span>
            <div className={`text-base font-bold ${earthLinkState === 'HIGH_GAIN_ESTABLISHED' ? 'text-emerald-300' : 'text-amber-300'}`}>
              21.0 MINUTES
            </div>
          </div>

          {earthLinkState === 'HIGH_GAIN_ESTABLISHED' && queuedCount > 0 && (
            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-panel transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'SYNCING...' : `SYNC ${queuedCount} QUEUED BRIEF${queuedCount > 1 ? 'S' : ''}`}</span>
            </button>
          )}
        </div>
      </div>

      {successBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Quick Astronaut Template Selection Bar */}
      <div className="bg-space-850 border border-space-700 rounded-xl p-3.5 shadow-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold uppercase text-[10px] text-slate-400">LOAD SBAR TEMPLATE:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
          {displayCrew.map((c) => (
            <button
              key={c.id}
              onClick={() => handleApplyTemplate(c.id)}
              className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${
                selectedCrewId === c.id
                  ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                  : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
              }`}
            >
              {c.name.split(' ')[0]} ({c.callsign})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Builder on Left, Queue Stream on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: SBAR Builder Form */}
        <div className="lg:col-span-7 bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>STRUCTURED SBAR BRIEF BUILDER</span>
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase">PRIORITY:</label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className={`appearance-none bg-space-900 border text-xs font-mono pl-2 pr-6 py-1 rounded cursor-pointer ${
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
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-1.5 top-1.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveDraft} className="space-y-4 text-xs font-mono">
            {/* Astronaut Selector */}
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">
                ASTRONAUT SUBJECT
              </label>
              <div className="relative">
                <select
                  value={selectedCrewId}
                  onChange={(e) => handleApplyTemplate(Number(e.target.value))}
                  className="w-full appearance-none bg-space-900 border border-space-700 hover:border-cyan-500/60 rounded-lg pl-3 pr-8 py-2 text-white font-sans text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {displayCrew.map((c) => (
                    <option key={c.id} value={c.id} className="bg-space-900 text-slate-100">
                      {c.name} ({c.callsign}) — {c.role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

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

            {/* SBAR Section: Situation */}
            <div>
              <label className="block text-rose-400 font-bold uppercase text-[10px] mb-1">
                1. SITUATION (Acute Event or Query)
              </label>
              <textarea
                required
                rows={2}
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            {/* SBAR Section: Background */}
            <div>
              <label className="block text-cyan-400 font-bold uppercase text-[10px] mb-1">
                2. BACKGROUND (Precursor Telemetry & Timeline)
              </label>
              <textarea
                required
                rows={2}
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            {/* SBAR Section: Assessment */}
            <div>
              <label className="block text-amber-400 font-bold uppercase text-[10px] mb-1">
                3. ASSESSMENT (Autonomic & Physiological Rationale)
              </label>
              <textarea
                required
                rows={2}
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            {/* SBAR Section: Recommendation */}
            <div>
              <label className="block text-emerald-400 font-bold uppercase text-[10px] mb-1">
                4. RECOMMENDATION (Countermeasure & Workload Protocol)
              </label>
              <textarea
                required
                rows={2}
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            {/* Questions for Ground Flight Surgeon */}
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">
                EXPLICIT QUESTIONS FOR FLIGHT SURGEON
              </label>
              <input
                type="text"
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Data Limitations Disclosure */}
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>UNMEASURED DATA & SCIENTIFIC UNCERTAINTIES</span>
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>ONBOARD PACKET TRANSMISSION QUEUE</span>
              </h3>
              {earthLinkState === 'HIGH_GAIN_ESTABLISHED' && queuedCount > 0 && (
                <button
                  onClick={handleTriggerSync}
                  disabled={isSyncing}
                  className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900 text-[10px] font-mono flex items-center gap-1 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>FLUSH QUEUE</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {earthLinkState === 'HIGH_GAIN_ESTABLISHED'
                ? 'High Gain link active: Packets synchronize directly with Earth operations receiver.'
                : 'Honest status: Packets marked QUEUED_LOCAL remain safely in local SQLite until link establishment.'}
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
                        className={`px-2 py-1 rounded border flex items-center gap-1 font-mono transition-colors ${
                          earthLinkState === 'HIGH_GAIN_ESTABLISHED'
                            ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-700'
                            : 'bg-space-800 hover:bg-space-700 text-cyan-400 border-space-700'
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        <span>{earthLinkState === 'HIGH_GAIN_ESTABLISHED' ? 'TRANSMIT VIA HIGH GAIN' : 'BUFFER TRANSMIT'}</span>
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
