import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Activity,
  ScrollText,
  Clock,
  History,
  Sliders,
  Radio,
  Database,
  Server,
  ShieldAlert,
} from 'lucide-react';

export type ScreenId =
  | 'command_center'
  | 'crew_twins'
  | 'domain_details'
  | 'event_ledger'
  | 'temporal_intelligence'
  | 'incident_reconstruction'
  | 'scenario_sandbox'
  | 'ground_comms'
  | 'data_sources'
  | 'system_status';

interface SidebarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  activeIncidentAlert?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  activeIncidentAlert = true,
}) => {
  const navItems = [
    {
      group: 'COMMAND & OVERVIEW',
      items: [
        { id: 'command_center' as ScreenId, label: 'Command Center', icon: LayoutDashboard },
        { id: 'crew_twins' as ScreenId, label: 'Crew Health Twins', icon: UserCheck },
        { id: 'domain_details' as ScreenId, label: 'Domain Telemetry', icon: Activity },
      ],
    },
    {
      group: 'INTELLIGENCE & RECONSTRUCTION',
      items: [
        { id: 'event_ledger' as ScreenId, label: 'Event Ledger', icon: ScrollText },
        { id: 'temporal_intelligence' as ScreenId, label: 'Temporal Engine', icon: Clock },
        {
          id: 'incident_reconstruction' as ScreenId,
          label: 'Incident Reconstruction',
          icon: History,
          badge: activeIncidentAlert ? 'ACTIVE' : undefined,
          highlight: true,
        },
        { id: 'scenario_sandbox' as ScreenId, label: 'Scenario Sandbox', icon: Sliders },
      ],
    },
    {
      group: 'MISSION OPERATIONS & PROVENANCE',
      items: [
        { id: 'ground_comms' as ScreenId, label: 'Ground Communication', icon: Radio },
        { id: 'data_sources' as ScreenId, label: 'Data Provenance', icon: Database },
        { id: 'system_status' as ScreenId, label: 'System & Offline', icon: Server },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-space-900 border-r border-space-700/80 flex flex-col shrink-0 select-none z-20">
      {/* Brand Identity */}
      <div className="p-4 border-b border-space-700/80 bg-space-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-panel text-white font-bold font-mono tracking-tighter text-sm">
            M9
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-white font-mono flex items-center gap-1.5">
              MOSAIC-9
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                v2.6
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight">TESSERA FLIGHT LAB</p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {navItems.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectScreen(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-700/60 shadow-panel'
                        : 'text-slate-300 hover:text-white hover:bg-space-800/80 border border-transparent'
                    } ${item.highlight && !isActive ? 'hover:border-rose-900/40' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? 'text-cyan-400'
                            : item.highlight
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-800/80 animate-pulse font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Aerospace Tagline & Status Footer */}
      <div className="p-3 border-t border-space-700/80 bg-space-950/70 text-[11px] font-mono space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span>MISSION ENGINE</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            AUTONOMOUS
          </span>
        </div>
        <div className="p-2 rounded bg-space-900 border border-space-800 text-[10px] text-slate-400 italic">
          "Every Signal Has a Story."
        </div>
      </div>
    </aside>
  );
};
