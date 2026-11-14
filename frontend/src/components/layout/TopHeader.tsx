import React from 'react';
import { CrewMember, Mission } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Users, Clock, ShieldCheck, WifiOff, RefreshCw, Menu, ChevronDown } from 'lucide-react';
import { DEFAULT_CREW_MEMBERS } from '../../data/initialData';

interface TopHeaderProps {
  mission: Mission | null;
  crewMembers: CrewMember[];
  selectedCrew: CrewMember | null;
  onSelectCrew: (crew: CrewMember) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onToggleMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  mission,
  crewMembers,
  selectedCrew,
  onSelectCrew,
  onRefresh,
  isRefreshing = false,
  onToggleMobileMenu,
}) => {
  const displayCrew = crewMembers && crewMembers.length > 0 ? crewMembers : DEFAULT_CREW_MEMBERS;
  const currentCrew = selectedCrew || displayCrew[0];

  return (
    <header className="h-14 bg-space-900 border-b border-space-700/80 px-3 sm:px-4 flex items-center justify-between select-none z-10 shrink-0">
      {/* Left: Hamburger & Mission Telemetry */}
      <div className="flex items-center gap-2 sm:gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 border border-space-700/80 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 shadow-glow-cyan shrink-0"></span>
          <span className="font-mono text-xs font-semibold text-white tracking-wider">
            {mission ? mission.code : 'ARES-IV'}
          </span>
          <span className="text-slate-600 hidden xs:inline">|</span>
          <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-cyan-300 font-semibold">DAY {mission ? mission.current_day : 120}</span>
            <span className="text-slate-400 hidden md:inline">MET 2894:15:22</span>
          </span>
        </div>

        {/* Synthetic telemetry disclosure */}
        <div className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-space-800 border border-space-700 text-[10px] font-mono text-slate-400">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>SYNTHETIC NASA HRP TELEMETRY MODEL</span>
        </div>
      </div>

      {/* Right: Crew Member Selector & Link Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Crew Switcher */}
        <div className="relative flex items-center bg-space-950/90 border border-space-700 hover:border-cyan-500/60 rounded-lg px-2 sm:px-2.5 py-1 transition-all">
          <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0 mr-1 sm:mr-1.5" />
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline mr-1">CREW:</span>
          <select
            value={currentCrew.id}
            onChange={(e) => {
              const found = displayCrew.find((c) => c.id === Number(e.target.value));
              if (found) onSelectCrew(found);
            }}
            className="appearance-none bg-transparent text-xs text-slate-100 font-medium focus:outline-none cursor-pointer pr-5 max-w-[120px] sm:max-w-none"
          >
            {displayCrew.map((c) => (
              <option key={c.id} value={c.id} className="bg-space-900 text-slate-100 py-1">
                {c.name} ({c.callsign})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-1.5 sm:right-2 pointer-events-none" />
        </div>

        {/* Crew Status Badge */}
        <div className="hidden sm:inline-flex">
          <StatusBadge status={currentCrew.status} size="sm" showIcon={false} />
        </div>

        {/* Earth Communication Link Status */}
        <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-space-950/80 border border-space-700 font-mono text-xs">
          <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-[9px] text-slate-400 leading-tight">EARTH DSN LINK</span>
            <span className="text-[10px] text-rose-300 font-semibold leading-tight">
              LOSS OF SIGNAL (21m LATENCY)
            </span>
          </div>
          <span className="md:hidden text-[10px] text-rose-300 font-semibold">LOS (21m)</span>
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
