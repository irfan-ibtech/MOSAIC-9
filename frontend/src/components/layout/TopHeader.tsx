import React, { useState, useRef, useEffect } from 'react';
import { CrewMember, Mission } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Users, Clock, ShieldCheck, Wifi, WifiOff, RefreshCw, Menu, ChevronDown, Radio } from 'lucide-react';
import { DEFAULT_CREW_MEMBERS } from '../../data/initialData';

interface TopHeaderProps {
  mission: Mission | null;
  crewMembers: CrewMember[];
  selectedCrew: CrewMember | null;
  onSelectCrew: (crew: CrewMember) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onToggleMobileMenu?: () => void;
  earthLinkState?: 'LOSS_OF_SIGNAL' | 'DEGRADED_COMM' | 'HIGH_GAIN_ESTABLISHED';
  onToggleCommLink?: (state: 'LOSS_OF_SIGNAL' | 'DEGRADED_COMM' | 'HIGH_GAIN_ESTABLISHED') => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  mission,
  crewMembers,
  selectedCrew,
  onSelectCrew,
  onRefresh,
  isRefreshing = false,
  onToggleMobileMenu,
  earthLinkState = 'LOSS_OF_SIGNAL',
  onToggleCommLink,
}) => {
  const displayCrew = crewMembers && crewMembers.length > 0 ? crewMembers : DEFAULT_CREW_MEMBERS;
  const currentCrew = selectedCrew || displayCrew[0];

  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLinkDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLinkState = (state: 'LOSS_OF_SIGNAL' | 'DEGRADED_COMM' | 'HIGH_GAIN_ESTABLISHED') => {
    if (onToggleCommLink) {
      onToggleCommLink(state);
    }
    setIsLinkDropdownOpen(false);
  };

  const getLinkDetails = () => {
    switch (earthLinkState) {
      case 'HIGH_GAIN_ESTABLISHED':
        return {
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
          title: 'HIGH GAIN LINK',
          sub: 'ONLINE (21m LATENCY)',
          short: 'ONLINE',
          border: 'border-emerald-600/70 bg-emerald-950/40 text-emerald-300',
        };
      case 'DEGRADED_COMM':
        return {
          icon: <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />,
          title: 'DEGRADED COMM',
          sub: 'LOW BANDWIDTH (21m)',
          short: 'DEGRADED',
          border: 'border-amber-600/70 bg-amber-950/40 text-amber-300',
        };
      case 'LOSS_OF_SIGNAL':
      default:
        return {
          icon: <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />,
          title: 'LOSS OF SIGNAL',
          sub: 'MARS OCCULTATION (21m)',
          short: 'LOS (21m)',
          border: 'border-rose-600/70 bg-rose-950/40 text-rose-300',
        };
    }
  };

  const linkInfo = getLinkDetails();

  return (
    <header className="h-14 bg-space-900 border-b border-space-700/80 px-3 sm:px-4 flex items-center justify-between select-none z-20 shrink-0">
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

        {/* Earth Communication Link Status (Interactive Switcher) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsLinkDropdownOpen(!isLinkDropdownOpen)}
            title="Click to toggle Earth DSN link state (LOS ↔ Degraded ↔ High Gain)"
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border font-mono text-xs transition-all hover:scale-[1.02] cursor-pointer ${linkInfo.border}`}
          >
            {linkInfo.icon}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[9px] text-slate-400 leading-tight">EARTH DSN LINK</span>
              <span className="text-[10px] font-semibold leading-tight flex items-center gap-1">
                <span>{linkInfo.title}</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </span>
            </div>
            <span className="md:hidden text-[10px] font-semibold flex items-center gap-0.5">
              <span>{linkInfo.short}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </span>
          </button>

          {/* Interactive DSN Link State Menu */}
          {isLinkDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-space-900 border border-space-700 shadow-2xl p-2 z-50 font-mono text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[10px] text-slate-400 uppercase tracking-wider border-b border-space-800 mb-1">
                Simulate Deep Space Network
              </div>

              <button
                onClick={() => handleSelectLinkState('LOSS_OF_SIGNAL')}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-start gap-2.5 transition-colors mb-1 ${
                  earthLinkState === 'LOSS_OF_SIGNAL'
                    ? 'bg-rose-950/70 border border-rose-700/60 text-rose-200'
                    : 'hover:bg-space-800 text-slate-300'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-[11px] text-rose-300">LOSS OF SIGNAL (LOS)</div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    Planetary occultation. 100% onboard autonomous operations.
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectLinkState('DEGRADED_COMM')}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-start gap-2.5 transition-colors mb-1 ${
                  earthLinkState === 'DEGRADED_COMM'
                    ? 'bg-amber-950/70 border border-amber-700/60 text-amber-200'
                    : 'hover:bg-space-800 text-slate-300'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-[11px] text-amber-300">DEGRADED COMM</div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    21-minute light delay. Low-bandwidth telemetry bursts only.
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectLinkState('HIGH_GAIN_ESTABLISHED')}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-start gap-2.5 transition-colors ${
                  earthLinkState === 'HIGH_GAIN_ESTABLISHED'
                    ? 'bg-emerald-950/70 border border-emerald-700/60 text-emerald-200'
                    : 'hover:bg-space-800 text-slate-300'
                }`}
              >
                <Wifi className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-[11px] text-emerald-300">HIGH GAIN PASS (ONLINE)</div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    Scheduled DSN contact. Bi-directional telemetry sync active.
                  </div>
                </div>
              </button>
            </div>
          )}
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
