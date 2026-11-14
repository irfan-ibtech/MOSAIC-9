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

const API_BASE = '/api';

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
    console.warn(`API call failed for ${url}, attempting offline local cache fallback:`, err);
    const cached = localStorage.getItem(`mosaic_cache_${cacheKey}`);
    if (cached) {
      return JSON.parse(cached) as T;
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
    const res = await fetch(`${API_BASE}/scenarios/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Simulation failed');
    return res.json();
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
