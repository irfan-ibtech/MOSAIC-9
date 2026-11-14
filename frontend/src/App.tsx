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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('command_center');
  const [mission, setMission] = useState<Mission | null>(null);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [recentEvents, setRecentEvents] = useState<LedgerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadInitialData = async () => {
    try {
      const [missionRes, crewRes] = await Promise.all([
        mosaicApi.getMission(),
        mosaicApi.getCrewList(),
      ]);

      if (missionRes) {
        setMission(missionRes.mission);
        setRecentEvents(missionRes.recent_events || []);
      }

      if (crewRes && crewRes.length > 0) {
        setCrewMembers(crewRes);
        // Default to Commander Alex Morgan (focal astronaut)
        const alex = crewRes.find((c) => c.name.includes('Alex Morgan')) || crewRes[0];
        setSelectedCrew(alex);
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadInitialData();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-space-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Persistent Left Navigation Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        activeIncidentAlert={true}
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
              <HealthDomainScreen selectedCrew={selectedCrew} />
            )}

            {currentScreen === 'event_ledger' && (
              <EventLedgerScreen crewMembers={crewMembers} />
            )}

            {currentScreen === 'temporal_intelligence' && (
              <TemporalIntelligenceScreen selectedCrew={selectedCrew} />
            )}

            {currentScreen === 'incident_reconstruction' && (
              <IncidentReconstructionScreen onNavigate={setCurrentScreen} />
            )}

            {currentScreen === 'scenario_sandbox' && (
              <ScenarioSandboxScreen selectedCrew={selectedCrew} />
            )}

            {currentScreen === 'ground_comms' && (
              <GroundCommunicationScreen crewMembers={crewMembers} />
            )}

            {currentScreen === 'data_sources' && (
              <DataSourcesScreen />
            )}

            {currentScreen === 'system_status' && (
              <SystemStatusScreen />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
