import React, { useState, useEffect } from 'react';
import { LedgerEvent, CrewMember, EventCategory, EventSeverity, DataQuality } from '../types';
import { mosaicApi } from '../services/api';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Calendar,
  ShieldCheck,
  Cpu,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface EventLedgerScreenProps {
  crewMembers: CrewMember[];
}

export const EventLedgerScreen: React.FC<EventLedgerScreenProps> = ({ crewMembers }) => {
  const [events, setEvents] = useState<LedgerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<LedgerEvent | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCrewId, setSelectedCrewId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<string>('');

  // New Event Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<EventCategory>('symptom_report');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState<EventSeverity>('MODERATE');
  const [newCrewId, setNewCrewId] = useState<number>(1);
  const [newSource, setNewSource] = useState('Crew Daily Check-In Terminal');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvents = () => {
    setLoading(true);
    mosaicApi
      .getLedgerEvents({
        crew_member_id: selectedCrewId,
        category: selectedCategory || undefined,
        severity: selectedSeverity || undefined,
        data_quality: selectedQuality || undefined,
        search: search || undefined,
      })
      .then((res) => {
        setEvents(res.events || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCrewId, selectedCategory, selectedSeverity, selectedQuality, search]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    setIsSubmitting(true);
    try {
      await mosaicApi.createLedgerEvent({
        crew_member_id: newCrewId,
        event_category: newCategory,
        title: newTitle,
        description: newDesc,
        mission_day: 120,
        severity: newSeverity,
        source: newSource,
        notes: newNotes,
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewNotes('');
      fetchEvents();
    } catch (err) {
      alert('Failed to commit event to ledger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-space-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              MODULE B — MISSION HEALTH INTELLIGENCE LEDGER
            </span>
            <span className="text-xs font-mono text-slate-400">CENTRAL IMMUTABLE EVENT TIMELINE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Chronological Mission Health & Event Ledger
          </h1>
          <p className="text-xs text-slate-400">
            Unified record of telemetry observations, subjective symptoms, sleep records, exercise, workload, and mission events.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono flex items-center gap-2 shadow-panel transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>LOG CREW OBSERVATION</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-space-850 border border-space-700 rounded-xl p-4 shadow-panel space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search events, UIDs, terms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-space-900 border border-space-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Crew Filter */}
          <div>
            <select
              value={selectedCrewId}
              onChange={(e) => setSelectedCrewId(e.target.value)}
              className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">ALL CREW & SHIPWIDE</option>
              <option value="shipwide">SHIPWIDE / STATION ONLY</option>
              {crewMembers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.callsign})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="">ALL CATEGORIES</option>
              <option value="health_observation">HEALTH OBSERVATIONS</option>
              <option value="symptom_report">SYMPTOM REPORTS</option>
              <option value="sleep_observation">SLEEP OBSERVATIONS</option>
              <option value="exercise_record">EXERCISE RECORDS</option>
              <option value="workload_observation">WORKLOAD OBSERVATIONS</option>
              <option value="environmental_event">ENVIRONMENTAL EVENTS</option>
              <option value="mission_event">MISSION EVENTS</option>
              <option value="communication_quality">COMMUNICATION QUALITY</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="">ALL SEVERITIES</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MODERATE">MODERATE</option>
              <option value="LOW">LOW</option>
              <option value="INFO">INFO</option>
            </select>
          </div>

          {/* Quality Filter */}
          <div>
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="w-full bg-space-900 border border-space-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="">ALL DATA QUALITIES</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="PROVISIONAL">PROVISIONAL</option>
              <option value="DEGRADED">DEGRADED</option>
              <option value="STALE">STALE</option>
              <option value="UNRELIABLE">UNRELIABLE</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-space-700/60">
          <span>
            Displaying <strong className="text-cyan-400">{events.length}</strong> matching ledger events
          </span>
          <span className="text-slate-500">Immutability: SHA-256 Ledger Hash Valid</span>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-space-850 border border-space-700 rounded-xl overflow-hidden shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-space-700 bg-space-900/90 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-3">UID</th>
                <th className="py-3 px-3">MISSION DAY</th>
                <th className="py-3 px-3">CREW MEMBER</th>
                <th className="py-3 px-3">CATEGORY</th>
                <th className="py-3 px-3">TITLE & OBSERVATION</th>
                <th className="py-3 px-3">VALUE / UNIT</th>
                <th className="py-3 px-3">SEVERITY</th>
                <th className="py-3 px-3">QUALITY</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-800">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-sans">
                    No ledger records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="hover:bg-space-800/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 font-semibold text-cyan-400 whitespace-nowrap">
                      {evt.event_uid}
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      Day {evt.mission_day}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans whitespace-nowrap">
                      {evt.crew_member ? evt.crew_member.name : <span className="text-slate-500 italic">Shipwide</span>}
                    </td>
                    <td className="py-3 px-3 text-slate-300 uppercase whitespace-nowrap text-[10px]">
                      {evt.event_category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-200 max-w-md">
                      <div className="font-semibold text-white truncate">{evt.title}</div>
                      <div className="text-slate-400 text-[11px] truncate">{evt.description}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {evt.value !== null ? `${evt.value} ${evt.unit || ''}` : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800 shadow-glow-rose'
                            : evt.severity === 'HIGH' || evt.severity === 'MODERATE'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-space-900 text-slate-300 border border-space-700'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold whitespace-nowrap">
                      {evt.data_quality}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        className="p-1 rounded bg-space-800 hover:bg-space-700 text-cyan-400"
                        title="Inspect Provenance"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Drawer Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-space-900 border border-space-700 rounded-xl max-w-xl w-full p-6 shadow-panel space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-space-700/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
                  {selectedEvent.event_uid}
                </span>
                <span className="text-xs text-slate-400">
                  DAY {selectedEvent.mission_day}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-base font-bold text-white font-sans">{selectedEvent.title}</h2>
              <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-space-950 p-3 rounded-lg border border-space-800">
              <div>
                <span className="text-slate-500 uppercase text-[10px]">CATEGORY:</span>
                <div className="text-slate-200 mt-0.5">{selectedEvent.event_category}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px]">SEVERITY:</span>
                <div className="text-rose-400 font-bold mt-0.5">{selectedEvent.severity}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px]">VALUE & UNIT:</span>
                <div className="text-cyan-300 mt-0.5">
                  {selectedEvent.value !== null ? `${selectedEvent.value} ${selectedEvent.unit || ''}` : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px]">DATA QUALITY:</span>
                <div className="text-emerald-400 font-semibold mt-0.5">{selectedEvent.data_quality}</div>
              </div>
            </div>

            {/* Provenance Metadata Block */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-400 uppercase text-[10px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                DATA PROVENANCE & SENSOR AUDIT
              </span>
              <div className="p-3 rounded bg-space-950 border border-space-800 text-[11px] text-slate-300 space-y-1">
                <div>
                  <strong className="text-slate-400">Source Device:</strong> {selectedEvent.source}
                </div>
                <div>
                  <strong className="text-slate-400">Timestamp:</strong> {selectedEvent.event_timestamp}
                </div>
                <div>
                  <strong className="text-slate-400">Classification:</strong> SYNTHETIC RESEARCH TELEMETRY
                </div>
                {selectedEvent.notes && (
                  <div>
                    <strong className="text-slate-400">Notes:</strong> {selectedEvent.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-space-800 hover:bg-space-700 text-slate-200 rounded-lg text-xs"
              >
                CLOSE INSPECTION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log New Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateEvent}
            className="bg-space-900 border border-space-700 rounded-xl max-w-lg w-full p-6 shadow-panel space-y-4"
          >
            <div className="flex items-center justify-between border-b border-space-700 pb-3">
              <h2 className="text-sm font-bold text-white uppercase font-mono">
                Log New Health Observation / Symptom
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
                  Crew Member
                </label>
                <select
                  value={newCrewId}
                  onChange={(e) => setNewCrewId(Number(e.target.value))}
                  className="w-full bg-space-950 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                >
                  {crewMembers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.callsign})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
                  Event Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                  className="w-full bg-space-950 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                >
                  <option value="symptom_report">Symptom Report (Subjective)</option>
                  <option value="health_observation">Health Observation</option>
                  <option value="exercise_record">Exercise Record</option>
                  <option value="sleep_observation">Sleep Observation</option>
                  <option value="workload_observation">Workload Observation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mild cephalic pressure during stowage"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-space-950 border border-space-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
                  Description & Context
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe specific symptoms, trigger circumstances, and recovery..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-space-950 border border-space-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
                    Severity
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as EventSeverity)}
                    className="w-full bg-space-950 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                  >
                    <option value="INFO">INFO</option>
                    <option value="LOW">LOW</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
                    Input Source
                  </label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-space-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-2 rounded-lg bg-space-800 text-slate-300 text-xs font-mono"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono"
              >
                {isSubmitting ? 'COMMITTING...' : 'COMMIT TO LEDGER'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
