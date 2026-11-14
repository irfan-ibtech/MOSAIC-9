export type HealthStatus = 'STABLE' | 'WATCH' | 'REVIEW_REQUIRED' | 'UNKNOWN';

export type EvidenceClassification =
  | 'OBSERVED_FACT'
  | 'DERIVED_INDICATOR'
  | 'TEMPORAL_ASSOCIATION'
  | 'POSSIBLE_EXPLANATION'
  | 'MISSING_EVIDENCE'
  | 'RECOMMENDED_REVIEW'
  | 'DIRECT_OBSERVATION'
  | 'NASA_RESEARCH_CONTEXT'
  | 'DERIVED_TEMPORAL_ASSOCIATION'
  | 'EXPLORATORY_HYPOTHESIS'
  | 'SYNTHETIC_SIMULATION';

export interface NasaStudyRecord {
  study_id: string;
  accession: string;
  title: string;
  source_organization: string;
  source_type: 'NASA_OSDR' | 'NASA_HRP' | 'NASA_DONKI';
  study_type: string;
  study_category: string;
  organism: string;
  population_type: string;
  domains: string[];
  assay_types: string[];
  doi: string;
  publication: string;
  osdr_url: string;
  api_metadata_url: string;
  api_files_url: string;
  retrieval_status: 'LIVE_NASA_OSDR_API' | 'CACHED_VERIFIED' | 'CURATED_REFERENCE';
  summary: string;
  relevance_to_mosaic: string;
  applicability_note: string;
  limitations: string;
  files_manifest: Array<{
    file_name: string;
    category: string;
    size_kb?: number;
  }>;
}

export interface EvidenceGraphNode {
  id: string;
  label: string;
  full_title?: string;
  category: EvidenceClassification;
  node_type: string;
  domain_key?: string;
  study_id?: string;
  doi?: string;
  organism?: string;
  study_type?: string;
  osdr_url?: string;
  source_attribution: string;
  confidence_or_applicability: number;
  provenance: string;
  limitations: string;
  applicability_note?: string;
  value?: number | null;
  unit?: string | null;
}

export interface EvidenceGraphEdge {
  source: string;
  target: string;
  relationship: string;
  evidence_tier: EvidenceClassification;
  explanation: string;
}

export interface MissionEvidenceGraph {
  incident_code: string;
  total_nodes: number;
  total_edges: number;
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
  scientific_disclaimer: string;
}

export type EventCategory =
  | 'health_observation'
  | 'symptom_report'
  | 'sleep_observation'
  | 'exercise_record'
  | 'workload_observation'
  | 'environmental_event'
  | 'mission_event'
  | 'communication_quality';

export type EventSeverity = 'INFO' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type DataQuality = 'VERIFIED' | 'PROVISIONAL' | 'DEGRADED' | 'STALE' | 'UNRELIABLE';

export interface Mission {
  id: number;
  name: string;
  code: string;
  current_day: number;
  elapsed_hours: number;
  launch_timestamp: string;
  status: string;
  communication_latency_seconds: number;
  earth_comm_status: 'OFFLINE' | 'DEGRADED' | 'CONNECTED';
  radiation_ambient_usv_per_h: number;
  cabin_pressure_kpa: number;
  cabin_o2_percent: number;
  cabin_co2_mmhg: number;
}

export interface CrewMember {
  id: number;
  mission_id: number;
  name: string;
  callsign: string;
  role: string;
  status: HealthStatus;
  status_explanation: string;
  avatar_initials: string;
  baseline_profile: Record<string, number>;
  domain_status: {
    cardiovascular: { status: HealthStatus; summary: string };
    musculoskeletal: { status: HealthStatus; summary: string };
    neuro_cognitive_sleep: { status: HealthStatus; summary: string };
    radiation_environment: { status: HealthStatus; summary: string };
  };
  overall_data_completeness: number;
  overall_confidence_score: number;
  incidents_count?: number;
  health_observations_count?: number;
  ledger_events_count?: number;
}

export interface HealthObservation {
  id: number;
  crew_member_id: number;
  mission_day: number;
  timestamp: string;
  domain: string;
  metric_name: string;
  value: number;
  unit: string | null;
  baseline_reference: number | null;
  deviation_zscore: number | null;
  is_synthetic: boolean;
  confidence_score: number;
  data_source: string;
  quality_flag: string;
  notes: string | null;
}

export interface LedgerEvent {
  id: number;
  event_uid: string;
  crew_member_id: number | null;
  crew_member?: CrewMember;
  event_category: EventCategory;
  title: string;
  description: string;
  mission_day: number;
  event_timestamp: string;
  recorded_timestamp: string;
  severity: EventSeverity;
  value: number | null;
  unit: string | null;
  source: string;
  data_provenance: Record<string, any>;
  confidence_score: number;
  data_quality: DataQuality;
  is_synthetic: boolean;
  notes: string | null;
}

export interface Incident {
  id: number;
  incident_code: string;
  crew_member_id: number;
  crew_member?: CrewMember;
  incident_type: string;
  title: string;
  description: string;
  mission_day: number;
  incident_timestamp: string;
  severity: HealthStatus;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'TRANSFERRED_TO_GROUND';
  reconstruction_summary: {
    primary_factors: string[];
    preceding_chain: Array<{ time_offset: string; stage: string; event: string }>;
    missing_data_notes: string[];
  };
  supporting_evidence_count: number;
  missing_evidence_count: number;
}

export interface EvidenceNode {
  event_id: number;
  event_uid: string;
  title: string;
  category: EventCategory;
  timestamp: string;
  relative_hours: number;
  value: number | null;
  unit: string | null;
  classification: EvidenceClassification;
  taxonomy_v2?: EvidenceClassification;
  source_attribution?: string;
  applicability_level?: string;
  limitations?: string;
  reasoning: string;
  confidence: number;
  data_quality: string;
}

export interface MissingEvidenceNode {
  node_type: string;
  title: string;
  description: string;
  impact_on_confidence: string;
  suggested_investigation: string;
}

export interface Hypothesis {
  hypothesis_id: string;
  type: string;
  title: string;
  plausibility: string;
  supporting_facts: string[];
  counter_evidence: string;
  scientific_boundary: string;
}

export interface ReconstructionData {
  incident: Incident;
  horizon_hours: number;
  timeline_window: {
    start: string;
    incident: string;
  };
  evidence_nodes: EvidenceNode[];
  missing_evidence: MissingEvidenceNode[];
  hypotheses: Hypothesis[];
  recommended_reviews: string[];
  nasa_research_context?: NasaStudyRecord[];
  evidence_graph?: MissionEvidenceGraph;
  scientific_disclaimer: string;
  metrics?: {
    total_precursor_events: number;
    first_detected_anomaly_hours_prior: number;
    heuristic_confidence_score: number;
    penalty_breakdown: Record<string, number>;
  };
}

export interface CountermeasureScenario {
  id: number;
  crew_member_id: number;
  crew_member?: CrewMember;
  incident_id: number | null;
  name: string;
  description: string;
  inputs: {
    sleep_delta_hours: number;
    workload_delta_pct: number;
    cycle_ergometer_watts: number;
    hydration_fluid_ml: number;
    ambient_co2_target_mmhg: number;
  };
  projections: {
    projected_hrv_rmssd: number;
    projected_resting_hr: number;
    projected_systolic_bp: number;
    projected_pvt_latency_ms: number;
    projected_fatigue_index: number;
    time_to_stability_hours: number;
    risk_recurrence_pct: number;
    trajectory_hourly?: Array<{
      hour: number;
      hrv: number;
      hr: number;
      bp: number;
      pvt: number;
    }>;
  };
  assumptions: string;
  is_active: boolean;
}

export interface GroundCommunication {
  id: number;
  packet_id: string;
  crew_member_id: number;
  crew_member?: CrewMember;
  incident_id: number | null;
  title: string;
  clinical_summary: string;
  sbar_situation: string;
  sbar_background: string;
  sbar_assessment: string;
  sbar_recommendation: string;
  evidence_ledger_ids: string[];
  data_limitations: string | null;
  questions_for_ground: string | null;
  review_priority: 'ROUTINE' | 'PRIORITY' | 'URGENT';
  sync_status: 'QUEUED_LOCAL' | 'TRANSMITTING' | 'DELIVERED' | 'ACKNOWLEDGED';
  transmitted_at: string | null;
  created_at: string;
}

export interface SyncTelemetryData {
  id: number;
  last_successful_sync_at: string | null;
  queued_items_count: number;
  earth_link_state: 'LOSS_OF_SIGNAL' | 'DEGRADED_COMM' | 'HIGH_GAIN_ESTABLISHED';
  round_trip_latency_sec: number;
  local_db_integrity_pct: number;
  offline_mode_active: boolean;
}

export interface EvaluatedScenarioTradeoff {
  scenario_id: string;
  name: string;
  category: string;
  inputs: {
    sleep_delta_hours: number;
    workload_delta_pct: number;
    cycle_ergometer_watts: number;
    hydration_fluid_ml: number;
    ambient_co2_target_mmhg: number;
  };
  projections: {
    projected_hrv_rmssd: number;
    projected_resting_hr: number;
    projected_systolic_bp: number;
    projected_pvt_latency_ms: number;
    time_to_stability_hours: number;
    risk_recurrence_pct: number;
  };
  dimensions: {
    recovery_trajectory_score: number;
    sleep_opportunity_score: number;
    workload_distribution_score: number;
    exercise_preservation_score: number;
    operational_continuity_score: number;
    mission_schedule_disruption_pct: number;
    environmental_constraint_score: number;
    data_completeness_score: number;
    uncertainty_band_pct: number;
  };
  evaluation_dimensions?: {
    estimated_recovery_trajectory: number;
    sleep_opportunity: number;
    workload_distribution: number;
    exercise_schedule_preservation: number;
    mission_schedule_disruption: number;
    environmental_constraints: number;
    data_completeness: number;
    uncertainty: number;
  };
  strengths: string[];
  operational_tradeoffs: string[];
  is_pareto_non_dominated: boolean;
  scientific_label: string;
}

export interface MultiScenarioComparisonResult {
  crew_member_id: number;
  crew_member_name: string;
  scenario_count: number;
  scenarios: EvaluatedScenarioTradeoff[];
  pareto_frontier_ids: string[];
  scientific_labels: string[];
  evaluation_methodology: string;
  scientific_disclaimer: string;
}

export interface SensitivityParameterItem {
  parameter_key: string;
  parameter_name: string;
  unit: string;
  baseline_assumption: number;
  adjusted_assumption: number;
  low_bound_assumption: number;
  high_bound_assumption: number;
  target_metric: string;
  target_unit: string;
  outcome_at_low: number;
  outcome_at_nominal: number;
  outcome_at_high: number;
  outcome_swing: number;
  influence_score: number;
  influence_rank: number;
}

export interface SensitivityAnalysisResult {
  crew_member_id: number;
  crew_member_name: string;
  perturbation_pct: number;
  perturbation_percentage: number;
  baseline_assumptions: Record<string, number>;
  adjusted_assumptions: Record<string, number>;
  nominal_projections: Record<string, number>;
  parameter_sensitivities: SensitivityParameterItem[];
  most_influential_parameter: string;
  ranking_stability_note: string;
  scientific_label: string;
}
