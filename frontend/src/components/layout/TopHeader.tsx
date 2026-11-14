import React from 'react';
import { CrewMember, Mission } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Radio, Users, Clock, ShieldCheck, WifiOff, RefreshCw } from 'lucide-react';

interface TopHeaderProps {
  mission: Mission | null;
  crewMembers: CrewMember[];
  selectedCrew: CrewMember | null;
  onSelectCrew: (crew: CrewMember) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  mission,
  crewMembers,
  selectedCrew,
  onSelectCrew,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header className="h-14 bg-space-900 border-b border-space-700/80 px-4 flex items-center justify-between select-none z-10 shrink-0">
      {/* Left: Mission & MET Telemetry */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 shadow-glow-cyan"></span>
          <span className="font-mono text-xs font-semibold text-white tracking-wider">
            {mission ? mission.code : 'ARES-IV'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300 font-semibold">DAY {mission ? mission.current_day : 120}</span>
            <span className="text-slate-400">MET 2894:15:22</span>
          </span>
        </div>

        {/* Synthetic telemetry disclosure */}
        <div className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-space-800 border border-space-700 text-[10px] font-mono text-slate-400">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>SYNTHETIC NASA HRP TELEMETRY MODEL</span>
        </div>
      </div>

      {/* Right: Crew Member Selector & Link Status */}
      <div className="flex items-center gap-3">
        {/* Crew Switcher */}
        <div className="flex items-center gap-1.5 bg-space-950/80 border border-space-700 px-2 py-1 rounded-lg">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">CREW:</span>
          <select
            value={selectedCrew ? selectedCrew.id : ''}
            onChange={(e) => {
              const found = crewMembers.find((c) => c.id === Number(e.target.value));
              if (found) onSelectCrew(found);
            }}
            className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
          >
            {crewMembers.map((c) => (
              <option key={c.id} value={c.id} className="bg-space-900 text-slate-200">
                {c.name} ({c.callsign}) — {c.status}
              </option>
            ))}
          </select>

          {selectedCrew && (
            <StatusBadge status={selectedCrew.status} size="sm" showIcon={false} />
          )}
        </div>

        {/* Earth Communication Link Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-space-950/80 border border-space-700 font-mono text-xs">
          <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-slate-400 leading-tight">EARTH DSN LINK</span>
            <span className="text-[10px] text-rose-300 font-semibold leading-tight">
              LOSS OF SIGNAL (21m LATENCY)
            </span>
          </div>
        </div>

        {/* Manual Refresh / Pulse */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh onboard telemetry"
            className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-slate-400 hover:text-cyan-300 border border-space-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
};
