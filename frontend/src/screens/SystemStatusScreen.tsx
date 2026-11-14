import React, { useState, useEffect } from 'react';
import { SyncTelemetryData } from '../types';
import { mosaicApi } from '../services/api';
import {
  Server,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Download,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface SystemStatusScreenProps {
  earthLinkState?: 'LOSS_OF_SIGNAL' | 'DEGRADED_COMM' | 'HIGH_GAIN_ESTABLISHED';
  onToggleCommLink?: (state: 'LOSS_OF_SIGNAL' | 'DEGRADED_COMM' | 'HIGH_GAIN_ESTABLISHED') => void;
}

export const SystemStatusScreen: React.FC<SystemStatusScreenProps> = ({
  earthLinkState,
  onToggleCommLink,
}) => {
  const [syncData, setSyncData] = useState<SyncTelemetryData | null>(null);
  const [storageStats, setStorageStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchStatus = () => {
    setLoading(true);
    mosaicApi.getSyncStatus().then((res) => {
      setSyncData(res.sync_telemetry);
      setStorageStats(res.storage_stats || {});
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (earthLinkState && syncData && syncData.earth_link_state !== earthLinkState) {
      setSyncData((prev) => (prev ? { ...prev, earth_link_state: earthLinkState } : null));
    }
  }, [earthLinkState]);

  const handleToggleLink = async (state: 'LOSS_OF_SIGNAL' | 'DEGRADED_COMM' | 'HIGH_GAIN_ESTABLISHED') => {
    try {
      if (onToggleCommLink) {
        onToggleCommLink(state);
      }
      const res = await mosaicApi.toggleCommLink(state);
      setStatusMessage(res.message);
      fetchStatus();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      alert('Failed to toggle communication link');
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await mosaicApi.triggerSync();
      setStatusMessage(res.message || 'Sync completed');
      fetchStatus();
    } catch (err: any) {
      setStatusMessage('Sync failed: Link is currently in LOSS_OF_SIGNAL. Onboard local persistence active.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleExportDiagnostics = () => {
    const diagnosticPayload = {
      system: 'MOSAIC-9 Onboard Health Engine',
      mission: 'ARES-IV Mars Transit',
      met: '2894:15:22',
      sync_telemetry: syncData,
      storage_stats: storageStats,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(diagnosticPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mosaic9_diagnostics_day120.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-space-700/60 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
            MODULE G — OFFLINE MISSION OPERATIONS
          </span>
          <span className="text-xs font-mono text-slate-400">
            LOCAL STORAGE INTEGRITY & COMMUNICATIONS CONTROLLER
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          System Telemetry, Offline Persistence & Ground Link Manager
        </h1>
        <p className="text-xs text-slate-400">
          Monitor onboard database resilience, toggle simulated DSN communication link states, and review synchronization telemetry.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-600 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
          <Info className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Earth Link Simulator Controls */}
      <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>EARTH DEEP SPACE NETWORK LINK SIMULATOR</span>
            </h2>
            <p className="text-xs text-slate-400">
              Simulate operational conditions: orbital occultation (LOS), degraded link, or high-gain pass.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => handleToggleLink('LOSS_OF_SIGNAL')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                syncData?.earth_link_state === 'LOSS_OF_SIGNAL'
                  ? 'bg-rose-950 text-rose-300 border-rose-600 font-bold shadow-panel'
                  : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
              }`}
            >
              LOSS OF SIGNAL
            </button>

            <button
              onClick={() => handleToggleLink('DEGRADED_COMM')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                syncData?.earth_link_state === 'DEGRADED_COMM'
                  ? 'bg-amber-950 text-amber-300 border-amber-600 font-bold shadow-panel'
                  : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
              }`}
            >
              DEGRADED (21m DELAY)
            </button>

            <button
              onClick={() => handleToggleLink('HIGH_GAIN_ESTABLISHED')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                syncData?.earth_link_state === 'HIGH_GAIN_ESTABLISHED'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600 font-bold shadow-panel'
                  : 'bg-space-900 border-space-700 text-slate-400 hover:text-white'
              }`}
            >
              HIGH GAIN PASS
            </button>
          </div>
        </div>

        {/* Sync Trigger Action */}
        <div className="pt-3 border-t border-space-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="text-slate-300">
            Link State: <strong className={syncData?.earth_link_state === 'HIGH_GAIN_ESTABLISHED' ? 'text-emerald-400' : 'text-rose-400'}>{syncData?.earth_link_state}</strong>
            <span className="text-slate-500 ml-2">(Latency: {syncData?.round_trip_latency_sec}s round-trip)</span>
          </div>

          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-2 shadow-panel transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'ATTEMPTING SYNC...' : 'TRIGGER GROUND SYNC'}</span>
          </button>
        </div>
      </div>

      {/* Storage & Local Persistence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2">
          <div className="text-[10px] text-slate-400 uppercase">LOCAL DATABASE INTEGRITY</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">100.0%</div>
          <p className="text-[11px] text-slate-300 font-sans">
            SQLite write-ahead logging (WAL) active. Zero journal corruption detected.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2">
          <div className="text-[10px] text-slate-400 uppercase">OFFLINE QUEUE LENGTH</div>
          <div className="text-xl font-bold text-amber-300 mt-1">
            {syncData?.queued_items_count ?? 14} Items
          </div>
          <p className="text-[11px] text-slate-300 font-sans">
            Unsent clinical notes, ground briefs, and telemetry packets buffered locally.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-space-850 border border-space-700 space-y-2">
          <div className="text-[10px] text-slate-400 uppercase">LAST CONTACT WITH EARTH</div>
          <div className="text-xl font-bold text-cyan-300 mt-1">18 Hours Ago</div>
          <p className="text-[11px] text-slate-300 font-sans">
            Last successful telemetry exchange at Day 119 20:58 MET before LOS.
          </p>
        </div>
      </div>

      {/* Local Diagnostic Export Panel */}
      <div className="bg-space-850 border border-space-700 rounded-xl p-5 shadow-panel space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase">
              LOCAL TELEMETRY ARCHIVE & DIAGNOSTIC EXPORT
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Export complete onboard state, queued communication briefs, and temporal analyses as a structured JSON telemetry archive.
            </p>
          </div>

          <button
            onClick={handleExportDiagnostics}
            className="px-4 py-2 rounded-lg bg-space-800 hover:bg-space-700 text-cyan-300 border border-space-700 flex items-center gap-2 text-xs transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT DIAGNOSTIC SNAPSHOT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
