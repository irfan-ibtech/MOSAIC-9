import React, { useState, useEffect } from 'react';
import { ScreenId, Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { CommandCenterScreen } from './screens/CommandCenterScreen';
import { CrewHealthTwinScreen } from './screens/CrewHealthTwinScreen';
import { HealthDomainScreen } from './screens/HealthDomainScreen';
import { EventLedgerScreen } from './screens/EventLedgerScreen';
import { TemporalIntelligenceScreen } from './screens/TemporalIntelligenceScreen';
import { IncidentReconstructionScreen } from './screens/IncidentReconstructionScreen';
import { ScenarioSandboxScreen } from './screens/ScenarioSandboxScreen';
import { GroundCommunicationScreen } from './screens/GroundCommunicationScreen';
import { DataSourcesScreen } from './screens/DataSourcesScreen';
import { SystemStatusScreen } from './screens/SystemStatusScreen';

import { Mission, CrewMember, LedgerEvent } from './types';
import { mosaicApi } from './services/api';
import {
  DEFAULT_MISSION,
  DEFAULT_CREW_MEMBERS,
  DEFAULT_RECENT_EVENTS,
} from './data/initialData';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('command_center');
  const [mission, setMission] = useState<Mission | null>(DEFAULT_MISSION);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>(DEFAULT_CREW_MEMBERS);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(DEFAULT_CREW_MEMBERS[0]);
  const [recentEvents, setRecentEvents] = useState<LedgerEvent[]>(DEFAULT_RECENT_EVENTS);
  const [earthLinkState, setEarthLinkState] = useState<'LOSS_OF_SIGNAL' | 'DEGRADED_COMM' | 'HIGH_GAIN_ESTABLISHED'>('LOSS_OF_SIGNAL');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const loadInitialData = async () => {
    try {
      const [missionRes, crewRes, syncRes] = await Promise.all([
        mosaicApi.getMission(),
        mosaicApi.getCrewList(),
        mosaicApi.getSyncStatus(),
      ]);

      if (missionRes) {
        setMission(missionRes.mission);
        setRecentEvents(missionRes.recent_events || []);
      }

      if (syncRes && syncRes.sync_telemetry) {
        setEarthLinkState(syncRes.sync_telemetry.earth_link_state);
      }

      if (crewRes && crewRes.length > 0) {
        setCrewMembers(crewRes);
        // Default to Commander Alex Morgan (focal astronaut)
        const currentSelectedId = selectedCrew?.id;
        const matching = crewRes.find((c) => c.id === currentSelectedId);
        const alex = matching || crewRes.find((c) => c.name.includes('Alex Morgan')) || crewRes[0];
        setSelectedCrew(alex);
      }
    } catch (err) {
      console.error('Initial data load error (resilient fallback active):', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleToggleCommLink = async (newState: 'LOSS_OF_SIGNAL' | 'DEGRADED_COMM' | 'HIGH_GAIN_ESTABLISHED') => {
    setEarthLinkState(newState);
    try {
      await mosaicApi.toggleCommLink(newState);
    } catch (err) {
      console.warn('Comm link toggle optimistic update active');
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadInitialData();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-space-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Persistent / Responsive Left Navigation Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        activeIncidentAlert={true}
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Mission Operations Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Mission Telemetry Bar */}
        <TopHeader
          mission={mission}
          crewMembers={crewMembers}
          selectedCrew={selectedCrew}
          onSelectCrew={setSelectedCrew}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          earthLinkState={earthLinkState}
          onToggleCommLink={handleToggleCommLink}
        />

        {/* Scrollable Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-tactical-grid">
          <div className="max-w-7xl mx-auto">
            {currentScreen === 'command_center' && (
              <CommandCenterScreen
                mission={mission}
                crewMembers={crewMembers}
                recentEvents={recentEvents}
                selectedCrew={selectedCrew}
                onSelectCrew={setSelectedCrew}
                onNavigate={setCurrentScreen}
              />
            )}

            {currentScreen === 'crew_twins' && (
              <CrewHealthTwinScreen
                selectedCrew={selectedCrew}
                crewMembers={crewMembers}
                onSelectCrew={setSelectedCrew}
              />
            )}

            {currentScreen === 'domain_details' && (
              <HealthDomainScreen
                selectedCrew={selectedCrew}
                crewMembers={crewMembers}
                onSelectCrew={setSelectedCrew}
              />
            )}

            {currentScreen === 'event_ledger' && (
              <EventLedgerScreen crewMembers={crewMembers} />
            )}

            {currentScreen === 'temporal_intelligence' && (
              <TemporalIntelligenceScreen
                selectedCrew={selectedCrew}
                crewMembers={crewMembers}
                onSelectCrew={setSelectedCrew}
              />
            )}

            {currentScreen === 'incident_reconstruction' && (
              <IncidentReconstructionScreen
                onNavigate={setCurrentScreen}
                selectedCrew={selectedCrew}
                onSelectCrew={setSelectedCrew}
                crewMembers={crewMembers}
              />
            )}

            {currentScreen === 'scenario_sandbox' && (
              <ScenarioSandboxScreen
                selectedCrew={selectedCrew}
                crewMembers={crewMembers}
                onSelectCrew={setSelectedCrew}
              />
            )}

            {currentScreen === 'ground_comms' && (
              <GroundCommunicationScreen
                crewMembers={crewMembers}
                selectedCrew={selectedCrew}
                earthLinkState={earthLinkState}
                onToggleCommLink={handleToggleCommLink}
              />
            )}

            {currentScreen === 'data_sources' && (
              <DataSourcesScreen />
            )}

            {currentScreen === 'system_status' && (
              <SystemStatusScreen
                earthLinkState={earthLinkState}
                onToggleCommLink={handleToggleCommLink}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
