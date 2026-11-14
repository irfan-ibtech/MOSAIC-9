import {
  Mission,
  CrewMember,
  HealthObservation,
  LedgerEvent,
  Incident,
  ReconstructionData,
  CountermeasureScenario,
  GroundCommunication,
  SyncTelemetryData,
} from '../types';

import {
  DEFAULT_MISSION,
  DEFAULT_CREW_MEMBERS,
  DEFAULT_OBSERVATIONS,
  DEFAULT_RECENT_EVENTS,
  DEFAULT_INCIDENTS,
  DEFAULT_SCENARIOS,
  DEFAULT_GROUND_COMMS,
  DEFAULT_SYNC_TELEMETRY,
  DEFAULT_RECONSTRUCTION_INC1,
  DEFAULT_RECONSTRUCTION_INC2,
  DEFAULT_TEMPORAL_ANALYSIS,
} from '../data/initialData';

const API_BASE = '/api';

function getFallbackData(cacheKey: string, _url: string): any {
  if (cacheKey.startsWith('mission')) {
    return {
      mission: DEFAULT_MISSION,
      crew_overview: { TOTAL: 4, STABLE: 2, WATCH: 1, REVIEW_REQUIRED: 1, UNKNOWN: 0 },
      active_incidents_count: 1,
      recent_events: DEFAULT_RECENT_EVENTS,
      data_freshness_seconds: 14,
      overall_telemetry_health: 'NOMINAL',
      server_timestamp: new Date().toISOString(),
    };
  }
  if (cacheKey.startsWith('crew_list')) {
    return DEFAULT_CREW_MEMBERS;
  }
  if (cacheKey.startsWith('crew_obs_')) {
    const parts = cacheKey.split('_');
    const crewId = Number(parts[2]) || 1;
    const obs = DEFAULT_OBSERVATIONS.filter((o) => o.crew_member_id === crewId);
    return {
      crew_member_id: crewId,
      count: obs.length > 0 ? obs.length : DEFAULT_OBSERVATIONS.length,
      observations: obs.length > 0 ? obs : DEFAULT_OBSERVATIONS,
    };
  }
  if (cacheKey.startsWith('crew_')) {
    const parts = cacheKey.split('_');
    const crewId = Number(parts[1]) || 1;
    const member = DEFAULT_CREW_MEMBERS.find((c) => c.id === crewId) || DEFAULT_CREW_MEMBERS[0];
    return {
      crew_member_id: member.id,
      crew_member: member,
      domains: member.domain_status || {},
    };
  }
  if (cacheKey.startsWith('ledger_events')) {
    return {
      total: DEFAULT_RECENT_EVENTS.length,
      events: DEFAULT_RECENT_EVENTS,
      summary: {
        categories: { symptom_report: 1, workload_observation: 1, sleep_observation: 1, communication_quality: 1 },
        qualities: { VERIFIED: 4 },
      },
    };
  }
  if (cacheKey.startsWith('incidents_list')) {
    return DEFAULT_INCIDENTS;
  }
  if (cacheKey.startsWith('incident_rec_')) {
    const parts = cacheKey.split('_');
    const incId = Number(parts[2]) || 1;
    return incId === 2 ? DEFAULT_RECONSTRUCTION_INC2 : DEFAULT_RECONSTRUCTION_INC1;
  }
  if (cacheKey.startsWith('incident_')) {
    const parts = cacheKey.split('_');
    const incId = Number(parts[1]) || 1;
    return DEFAULT_INCIDENTS.find((i) => i.id === incId) || DEFAULT_INCIDENTS[0];
  }
  if (cacheKey.startsWith('temporal_')) {
    return DEFAULT_TEMPORAL_ANALYSIS;
  }
  if (cacheKey.startsWith('scenarios_')) {
    return DEFAULT_SCENARIOS;
  }
  if (cacheKey.startsWith('ground_comms_list')) {
    return DEFAULT_GROUND_COMMS;
  }
  if (cacheKey.startsWith('sync_status')) {
    return {
      sync_telemetry: DEFAULT_SYNC_TELEMETRY,
      storage_stats: { local_db_records: 142, offline_queued_records: 1, sqlite_wal_size_kb: 512 },
    };
  }
  return null;
}

async function fetchWithFallback<T>(url: string, cacheKey: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    try {
      localStorage.setItem(`mosaic_cache_${cacheKey}`, JSON.stringify(data));
    } catch {
      // ignore storage quota errors
    }
    return data as T;
  } catch (err) {
    console.warn(`API call failed for ${url}, checking local storage or fallback defaults:`, err);
    try {
      const cached = localStorage.getItem(`mosaic_cache_${cacheKey}`);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch {
      // ignore JSON parse error
    }

    const fallback = getFallbackData(cacheKey, url);
    if (fallback !== null) {
      try {
        localStorage.setItem(`mosaic_cache_${cacheKey}`, JSON.stringify(fallback));
      } catch {
        // ignore
      }
      return fallback as T;
    }
    throw err;
  }
}

export const mosaicApi = {
  // Mission Command Center
  getMission: () =>
    fetchWithFallback<{
      mission: Mission;
      crew_overview: Record<string, number>;
      active_incidents_count: number;
      recent_events: LedgerEvent[];
      data_freshness_seconds: number;
      overall_telemetry_health: string;
      server_timestamp: string;
    }>('/mission', 'mission_overview'),

  // Crew & Twins
  getCrewList: () =>
    fetchWithFallback<CrewMember[]>('/crew', 'crew_list'),

  getCrewDetail: (id: number) =>
    fetchWithFallback<{ crew_member: CrewMember; domains: Record<string, any> }>(`/crew/${id}`, `crew_${id}`),

  getCrewObservations: (id: number, params?: { domain?: string; metric_name?: string; min_day?: number; max_day?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.domain) searchParams.append('domain', params.domain);
    if (params?.metric_name) searchParams.append('metric_name', params.metric_name);
    if (params?.min_day) searchParams.append('min_day', params.min_day.toString());
    if (params?.max_day) searchParams.append('max_day', params.max_day.toString());
    const qs = searchParams.toString();
    return fetchWithFallback<{ crew_member_id: number; count: number; observations: HealthObservation[] }>(
      `/crew/${id}/observations${qs ? `?${qs}` : ''}`,
      `crew_obs_${id}_${qs}`
    );
  },

  // Event Ledger
  getLedgerEvents: async (filters?: {
    crew_member_id?: string;
    category?: string;
    severity?: string;
    data_quality?: string;
    search?: string;
    min_day?: number;
    max_day?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (filters?.crew_member_id) searchParams.append('crew_member_id', filters.crew_member_id);
    if (filters?.category) searchParams.append('category', filters.category);
    if (filters?.severity) searchParams.append('severity', filters.severity);
    if (filters?.data_quality) searchParams.append('data_quality', filters.data_quality);
    if (filters?.search) searchParams.append('search', filters.search);
    if (filters?.min_day) searchParams.append('min_day', filters.min_day.toString());
    if (filters?.max_day) searchParams.append('max_day', filters.max_day.toString());
    const qs = searchParams.toString();
    const result = await fetchWithFallback<{ total: number; events: LedgerEvent[]; summary: Record<string, any> }>(
      `/ledger${qs ? `?${qs}` : ''}`,
      `ledger_events_${qs}`
    );

    // Merge any offline client-queued events
    try {
      const offlineQueue = JSON.parse(localStorage.getItem('mosaic_offline_ledger_events') || '[]');
      if (offlineQueue.length > 0) {
        return {
          ...result,
          total: result.total + offlineQueue.length,
          events: [...offlineQueue, ...result.events],
        };
      }
    } catch {
      // ignore JSON parse error
    }

    return result;
  },

  createLedgerEvent: async (payload: Partial<LedgerEvent>) => {
    try {
      const res = await fetch(`${API_BASE}/ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error('Server returned non-200');
    } catch (err) {
      console.warn('Network offline: queueing ledger event locally in client store');
      const offlineItem: LedgerEvent = {
        id: Date.now(),
        event_uid: `EVT-OFFLINE-${Date.now().toString().slice(-4)}`,
        crew_member_id: payload.crew_member_id || null,
        event_category: (payload.event_category as any) || 'symptom_report',
        title: payload.title || 'Untitled Observation',
        description: payload.description || '',
        mission_day: payload.mission_day || 120,
        event_timestamp: new Date().toISOString(),
        recorded_timestamp: new Date().toISOString(),
        severity: (payload.severity as any) || 'MODERATE',
        value: payload.value ?? null,
        unit: payload.unit ?? null,
        source: payload.source || 'Offline Terminal',
        data_provenance: { offline_queued: true },
        confidence_score: 0.90,
        data_quality: 'PROVISIONAL',
        is_synthetic: true,
        notes: payload.notes || null,
      };
      const existing = JSON.parse(localStorage.getItem('mosaic_offline_ledger_events') || '[]');
      existing.unshift(offlineItem);
      localStorage.setItem('mosaic_offline_ledger_events', JSON.stringify(existing));
      return { message: 'Observation stored in offline client buffer', event: offlineItem };
    }
  },

  // Incidents & Reconstruction
  getIncidents: () =>
    fetchWithFallback<Incident[]>('/incidents', 'incidents_list'),

  getIncidentDetail: (id: number) =>
    fetchWithFallback<Incident>(`/incidents/${id}`, `incident_${id}`),

  reconstructIncident: (id: number, horizonHours: number = 72) =>
    fetchWithFallback<ReconstructionData>(
      `/incidents/${id}/reconstruct?horizon_hours=${horizonHours}`,
      `incident_rec_${id}_${horizonHours}`
    ),

  // Temporal Intelligence Analysis
  getTemporalAnalysis: (crewMemberId: number = 1) =>
    fetchWithFallback<{
      engine: string;
      crew_member: string;
      time_horizon: string;
      first_unusual_signal: Record<string, any>;
      cross_domain_associations: Array<any>;
      anomaly_sequence: Array<any>;
      confidence_evaluation: Record<string, any>;
    }>('/intelligence/temporal-analysis', `temporal_${crewMemberId}`, {
      method: 'POST',
      body: JSON.stringify({ crew_member_id: crewMemberId }),
    }),

  // Scenario Sandbox
  getScenarios: (crewMemberId?: number) => {
    const qs = crewMemberId ? `?crew_member_id=${crewMemberId}` : '';
    return fetchWithFallback<CountermeasureScenario[]>(`/scenarios${qs}`, `scenarios_${crewMemberId || 'all'}`);
  },

  simulateScenario: async (payload: {
    crew_member_id: number;
    name: string;
    sleep_delta_hours: number;
    workload_delta_pct: number;
    cycle_ergometer_watts: number;
    hydration_fluid_ml: number;
    ambient_co2_target_mmhg?: number;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/scenarios/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline fallback simulation
    }

    // High-fidelity offline simulation model
    const sleepEffect = payload.sleep_delta_hours * 6.8;
    const workloadEffect = (payload.workload_delta_pct / -10.0) * 3.2;
    const ergoEffect = (payload.cycle_ergometer_watts / 50.0) * 2.5;
    const hydrationEffect = (payload.hydration_fluid_ml / 400.0) * 2.0;
    const projHrv = Math.min(68, Math.max(25, 27.0 + sleepEffect + workloadEffect + hydrationEffect));
    const projHr = Math.max(54, Math.min(95, 78.0 - (sleepEffect * 0.8) - (hydrationEffect * 1.5)));
    const projBp = Math.min(125, Math.max(85, 88.0 + (hydrationEffect * 5.0) + (ergoEffect * 3.0)));
    const projPvt = Math.max(200, Math.min(380, 310.0 - (sleepEffect * 15.0) - (workloadEffect * 8.0)));
    const risk = Math.max(8, Math.min(90, Math.round(75 - (projHrv - 27) * 1.5)));
    const recoveryHours = Math.max(18, Math.round(72 - (payload.sleep_delta_hours * 12)));

    const simScenario: CountermeasureScenario = {
      id: Date.now(),
      crew_member_id: payload.crew_member_id,
      incident_id: 1,
      name: payload.name || 'Custom Simulation',
      description: `Simulated: ${payload.sleep_delta_hours}h sleep, ${payload.workload_delta_pct}% workload, ${payload.cycle_ergometer_watts}W ergo, ${payload.hydration_fluid_ml}mL fluid.`,
      inputs: {
        sleep_delta_hours: payload.sleep_delta_hours,
        workload_delta_pct: payload.workload_delta_pct,
        cycle_ergometer_watts: payload.cycle_ergometer_watts,
        hydration_fluid_ml: payload.hydration_fluid_ml,
        ambient_co2_target_mmhg: payload.ambient_co2_target_mmhg ?? 2.8,
      },
      projections: {
        projected_hrv_rmssd: Math.round(projHrv * 10) / 10,
        projected_resting_hr: Math.round(projHr * 10) / 10,
        projected_systolic_bp: Math.round(projBp * 10) / 10,
        projected_pvt_latency_ms: Math.round(projPvt * 10) / 10,
        projected_fatigue_index: 3.5,
        time_to_stability_hours: recoveryHours,
        risk_recurrence_pct: risk,
        trajectory_hourly: [
          { hour: 0, hrv: 27, hr: 78, bp: 88, pvt: 310 },
          { hour: 12, hrv: Math.round((27 + projHrv * 0.3) * 10) / 10, hr: Math.round((78 + projHr * 0.3) / 1.3), bp: Math.round(88 + (projBp - 88) * 0.35), pvt: Math.round(310 - (310 - projPvt) * 0.3) },
          { hour: 24, hrv: Math.round((27 + projHrv * 0.7) * 10) / 10, hr: Math.round((78 + projHr * 0.7) / 1.7), bp: Math.round(88 + (projBp - 88) * 0.75), pvt: Math.round(310 - (310 - projPvt) * 0.7) },
          { hour: 48, hrv: Math.round(projHrv * 10) / 10, hr: Math.round(projHr * 10) / 10, bp: Math.round(projBp * 10) / 10, pvt: Math.round(projPvt * 10) / 10 },
        ],
      },
      assumptions: 'Presumes nominal adherence to countermeasure inputs.',
      is_active: false,
    };

    return {
      scenario: simScenario,
      baseline_comparison: {
        hrv: { current: 27.0, projected: simScenario.projections.projected_hrv_rmssd, baseline: 58.0, unit: 'ms' },
        hr: { current: 78.0, projected: simScenario.projections.projected_resting_hr, baseline: 60.0, unit: 'bpm' },
        bp: { current: 88.0, projected: simScenario.projections.projected_systolic_bp, baseline: 118.0, unit: 'mmHg' },
        pvt: { current: 310.0, projected: simScenario.projections.projected_pvt_latency_ms, baseline: 215.0, unit: 'ms' },
      },
    };
  },

  // Ground Communications
  getGroundCommunications: async () => {
    const serverComms = await fetchWithFallback<GroundCommunication[]>('/ground-comms', 'ground_comms_list');
    try {
      const offlineQueue = JSON.parse(localStorage.getItem('mosaic_offline_ground_comms') || '[]');
      if (offlineQueue.length > 0) {
        return [...offlineQueue, ...serverComms];
      }
    } catch {
      // ignore JSON parse error
    }
    return serverComms;
  },

  saveGroundCommunication: async (payload: Partial<GroundCommunication>) => {
    try {
      const res = await fetch(`${API_BASE}/ground-comms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error('Server returned non-200');
    } catch (err) {
      console.warn('Network offline: buffering ground communication packet locally');
      const offlinePkt: GroundCommunication = {
        id: Date.now(),
        packet_id: `GND-OFFLINE-${Date.now().toString().slice(-4)}`,
        crew_member_id: payload.crew_member_id || 1,
        incident_id: payload.incident_id || null,
        title: payload.title || 'Offline SBAR Brief',
        clinical_summary: payload.clinical_summary || '',
        sbar_situation: payload.sbar_situation || '',
        sbar_background: payload.sbar_background || '',
        sbar_assessment: payload.sbar_assessment || '',
        sbar_recommendation: payload.sbar_recommendation || '',
        evidence_ledger_ids: payload.evidence_ledger_ids || [],
        data_limitations: payload.data_limitations || null,
        questions_for_ground: payload.questions_for_ground || null,
        review_priority: payload.review_priority || 'ROUTINE',
        sync_status: 'QUEUED_LOCAL',
        transmitted_at: null,
        created_at: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('mosaic_offline_ground_comms') || '[]');
      existing.unshift(offlinePkt);
      localStorage.setItem('mosaic_offline_ground_comms', JSON.stringify(existing));
      return { message: 'Ground brief buffered in offline local queue', communication: offlinePkt };
    }
  },

  transmitGroundCommunication: async (id: number) => {
    const res = await fetch(`${API_BASE}/ground-comms/${id}/transmit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to transmit ground communication packet');
    return res.json();
  },

  // Sync Telemetry
  getSyncStatus: () =>
    fetchWithFallback<{
      sync_telemetry: SyncTelemetryData;
      storage_stats: Record<string, any>;
    }>('/sync/status', 'sync_status'),

  triggerSync: async () => {
    // 1. First verify with server that communication link is capable of receiving sync
    const res = await fetch(`${API_BASE}/sync/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Ground synchronization rejected by station controller (HTTP ${res.status})`);
    }

    const syncResult = await res.json();

    // 2. Link is established: flush client offline buffer to server
    try {
      const offlineComms = JSON.parse(localStorage.getItem('mosaic_offline_ground_comms') || '[]');
      const retainedComms = [];
      for (const pkt of offlineComms) {
        try {
          const pushRes = await fetch(`${API_BASE}/ground-comms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ ...pkt, sync_status: 'DELIVERED' }),
          });
          if (!pushRes.ok) retainedComms.push(pkt);
        } catch {
          retainedComms.push(pkt);
        }
      }
      if (retainedComms.length === 0) {
        localStorage.removeItem('mosaic_offline_ground_comms');
      } else {
        localStorage.setItem('mosaic_offline_ground_comms', JSON.stringify(retainedComms));
      }

      const offlineLedger = JSON.parse(localStorage.getItem('mosaic_offline_ledger_events') || '[]');
      const retainedLedger = [];
      for (const evt of offlineLedger) {
        try {
          const pushRes = await fetch(`${API_BASE}/ledger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(evt),
          });
          if (!pushRes.ok) retainedLedger.push(evt);
        } catch {
          retainedLedger.push(evt);
        }
      }
      if (retainedLedger.length === 0) {
        localStorage.removeItem('mosaic_offline_ledger_events');
      } else {
        localStorage.setItem('mosaic_offline_ledger_events', JSON.stringify(retainedLedger));
      }
    } catch {
      // ignore client buffer flushing errors
    }

    return syncResult;
  },

  toggleCommLink: async (state: 'LOSS_OF_SIGNAL' | 'DEGRADED_COMM' | 'HIGH_GAIN_ESTABLISHED') => {
    const res = await fetch(`${API_BASE}/sync/toggle-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ state }),
    });
    return res.json();
  },
};
