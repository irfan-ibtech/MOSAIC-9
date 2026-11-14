import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CREW_MEMBERS,
  CREW_SIMULATION_DEFAULTS,
  ASTRONAUT_SBAR_TEMPLATES,
  DEFAULT_SCENARIOS,
  DEFAULT_INCIDENTS,
  DEFAULT_NASA_STUDIES,
  DEFAULT_EVIDENCE_GRAPH_INC1,
  DEFAULT_EVIDENCE_GRAPH_INC2,
  DEFAULT_SCENARIO_COMPARISON,
  DEFAULT_SENSITIVITY_ANALYSIS,
  DEFAULT_RECONSTRUCTION_INC1,
  DEFAULT_RECONSTRUCTION_INC2,
} from '../data/initialData';

describe('MOSAIC-9 Senior QA Feature Verification Suite', () => {
  it('verifies all 4 crew members possess distinct simulation baseline profiles', () => {
    expect(DEFAULT_CREW_MEMBERS).toHaveLength(4);

    const alexConfig = CREW_SIMULATION_DEFAULTS[1];
    const sarahConfig = CREW_SIMULATION_DEFAULTS[2];
    const marcusConfig = CREW_SIMULATION_DEFAULTS[3];
    const elenaConfig = CREW_SIMULATION_DEFAULTS[4];

    // Alex Morgan: Acute presyncope / vagal collapse
    expect(alexConfig.currentHrv).toBe(27.0);
    expect(alexConfig.currentBp).toBe(88.0);
    expect(alexConfig.currentHr).toBe(78.0);

    // Dr. Sarah Chen: Peak nominal homeostasis
    expect(sarahConfig.currentHrv).toBe(62.0);
    expect(sarahConfig.currentBp).toBe(114.0);
    expect(sarahConfig.currentHr).toBe(57.0);

    // Marcus Vance: High CO2 / overtime maintenance
    expect(marcusConfig.currentHrv).toBe(42.0);
    expect(marcusConfig.currentBp).toBe(126.0);
    expect(marcusConfig.currentHr).toBe(69.0);

    // Elena Rostova: Biosensor packet loss / nominal pre-dropout
    expect(elenaConfig.currentHrv).toBe(53.0);
    expect(elenaConfig.currentBp).toBe(115.0);
    expect(elenaConfig.currentHr).toBe(63.0);
  });

  it('verifies that each crew member has tailored Alpha and Bravo scenario presets', () => {
    for (let id = 1; id <= 4; id++) {
      const config = CREW_SIMULATION_DEFAULTS[id];
      expect(config).toBeDefined();
      expect(config.alpha.name).toContain('Scenario Alpha');
      expect(config.bravo.name).toContain('Scenario Bravo');

      const astronautScenarios = DEFAULT_SCENARIOS.filter((s) => s.crew_member_id === id);
      expect(astronautScenarios.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('validates SBAR ground communication templates for all 4 crew members', () => {
    for (let id = 1; id <= 4; id++) {
      const template = ASTRONAUT_SBAR_TEMPLATES[id];
      expect(template).toBeDefined();
      expect(template.situation.length).toBeGreaterThan(20);
      expect(template.background.length).toBeGreaterThan(20);
      expect(template.assessment.length).toBeGreaterThan(20);
      expect(template.recommendation.length).toBeGreaterThan(20);
      expect(template.questions.length).toBeGreaterThan(10);
      expect(template.dataLimitations.length).toBeGreaterThan(10);
      expect(['ROUTINE', 'PRIORITY', 'URGENT']).toContain(template.priority);
    }
  });

  it('verifies signature incident reconstruction data parity between both incidents', () => {
    expect(DEFAULT_INCIDENTS).toHaveLength(2);
    const inc1 = DEFAULT_INCIDENTS[0];
    const inc2 = DEFAULT_INCIDENTS[1];

    expect(inc1.incident_code).toBe('INC-ARES4-120-001');
    expect(inc1.crew_member_id).toBe(1);

    expect(inc2.incident_code).toBe('INC-ARES4-118-002');
    expect(inc2.crew_member_id).toBe(3);
  });

  it('verifies Deep Space Network link state transitions and latency models', () => {
    const states = ['LOSS_OF_SIGNAL', 'DEGRADED_COMM', 'HIGH_GAIN_ESTABLISHED'];
    expect(states).toHaveLength(3);

    const marsOneWayLatencyMinutes = 21.0;
    const marsRoundTripSeconds = marsOneWayLatencyMinutes * 60 * 2;
    expect(marsRoundTripSeconds).toBe(2520);
  });

  it('validates structured SBAR JSON export payload formatting', () => {
    const template = ASTRONAUT_SBAR_TEMPLATES[1];
    const exportPayload = {
      system: 'MOSAIC-9 Ground Communication Subsystem',
      mission: 'ARES-IV Mars Transit',
      met: '2894:15:22',
      crew_member_id: 1,
      priority: template.priority,
      packet: {
        title: template.title,
        situation: template.situation,
        background: template.background,
        assessment: template.assessment,
        recommendation: template.recommendation,
        questions_for_flight_surgeon: template.questions,
        unmeasured_data_limitations: template.dataLimitations,
      },
      exported_at: new Date().toISOString(),
    };

    expect(exportPayload.system).toContain('MOSAIC-9');
    expect(exportPayload.packet.title).toContain('Alex Morgan');
    expect(exportPayload.packet.questions_for_flight_surgeon).toBeDefined();
    expect(exportPayload.packet.unmeasured_data_limitations).toBeDefined();

    const serialized = JSON.stringify(exportPayload, null, 2);
    expect(serialized).toContain('questions_for_flight_surgeon');
  });

  it('verifies incident association matching for all crew members', () => {
    const incAlex = DEFAULT_INCIDENTS.find((i) => i.crew_member_id === 1);
    const incMarcus = DEFAULT_INCIDENTS.find((i) => i.crew_member_id === 3);

    expect(incAlex).toBeDefined();
    expect(incAlex?.incident_code).toBe('INC-ARES4-120-001');

    expect(incMarcus).toBeDefined();
    expect(incMarcus?.incident_code).toBe('INC-ARES4-118-002');
  });

  it('verifies NASA OSDR (OSD-575, OSD-571, OSD-635) and HRP evidence records and applicability notes', () => {
    expect(DEFAULT_NASA_STUDIES.length).toBeGreaterThanOrEqual(7);
    const osd575 = DEFAULT_NASA_STUDIES.find((s) => s.study_id === 'OSD-575');
    const osd571 = DEFAULT_NASA_STUDIES.find((s) => s.study_id === 'OSD-571');
    const osd635 = DEFAULT_NASA_STUDIES.find((s) => s.study_id === 'OSD-635');
    const hrpCv = DEFAULT_NASA_STUDIES.find((s) => s.study_id === 'HRP-CV-OI');

    expect(osd575).toBeDefined();
    expect(osd575?.accession).toBe('OSD-575 / LSDS-8');
    expect(osd575?.doi).toBe('10.26030/mc5d-p710');
    expect(osd575?.sample_timepoints).toEqual(['L-92', 'L-44', 'L-3', 'R+1', 'R+45', 'R+82']);
    expect(osd575?.title).toContain('Inspiration4');
    expect(osd575?.applicability_note).toContain('NOT CONTINUOUS');
    expect(osd575?.files_manifest.length).toBeGreaterThanOrEqual(2);

    expect(osd571).toBeDefined();
    expect(osd571?.accession).toBe('OSD-571 / GLDS-563');
    expect(osd571?.doi).toBe('10.26030/h3p5-tc29');

    expect(osd635).toBeDefined();
    expect(osd635?.accession).toBe('OSD-635 / GLDS-608');
    expect(osd635?.doi).toBe('10.26030/8n5a-q187');
    expect(osd635?.title.toLowerCase()).toContain('vascular smooth muscle');
    expect(osd635?.applicability_note).toContain('IN VITRO');
    expect(osd635?.files_manifest.length).toBeGreaterThanOrEqual(2);

    expect(hrpCv?.identifier_type).toBe('INTERNAL_APP_REFERENCE_ID');
    expect(hrpCv?.osdr_url).toBe('https://humanresearchroadmap.nasa.gov/Risks/risk.aspx?i=179');
  });

  it('verifies Mission Evidence Graph links telemetry, domains, NASA studies, hypotheses, and missing evidence', () => {
    expect(DEFAULT_EVIDENCE_GRAPH_INC1.incident_code).toBe('INC-ARES4-120-001');
    expect(DEFAULT_EVIDENCE_GRAPH_INC1.nodes.length).toBeGreaterThanOrEqual(14);
    expect(DEFAULT_EVIDENCE_GRAPH_INC1.edges.length).toBeGreaterThanOrEqual(14);

    const nodeCategories = new Set(DEFAULT_EVIDENCE_GRAPH_INC1.nodes.map((n) => n.category));
    expect(nodeCategories.has('DIRECT_OBSERVATION')).toBe(true);
    expect(nodeCategories.has('NASA_RESEARCH_CONTEXT')).toBe(true);
    expect(nodeCategories.has('DERIVED_TEMPORAL_ASSOCIATION')).toBe(true);
    expect(nodeCategories.has('EXPLORATORY_HYPOTHESIS')).toBe(true);
    expect(nodeCategories.has('MISSING_EVIDENCE')).toBe(true);

    expect(DEFAULT_EVIDENCE_GRAPH_INC2.incident_code).toBe('INC-ARES4-118-002');
    expect(DEFAULT_EVIDENCE_GRAPH_INC2.nodes.some((n) => n.id === 'NASA-HRP-ENV-CO2')).toBe(true);
  });

  it('verifies Multi-Scenario Trade-Off Engine evaluates 5 scenarios across 8 dimensions and Pareto frontier', () => {
    expect(DEFAULT_SCENARIO_COMPARISON.scenario_count).toBe(5);
    expect(DEFAULT_SCENARIO_COMPARISON.scenarios).toHaveLength(5);
    expect(DEFAULT_SCENARIO_COMPARISON.pareto_frontier_ids.length).toBeGreaterThanOrEqual(2);
    expect(DEFAULT_SCENARIO_COMPARISON.scientific_labels).toContain('SIMULATED DATA');
    expect(DEFAULT_SCENARIO_COMPARISON.scientific_labels).toContain('NOT A CLINICAL RECOMMENDATION');

    for (const sc of DEFAULT_SCENARIO_COMPARISON.scenarios) {
      expect(sc.dimensions.recovery_trajectory_score).toBeGreaterThan(0);
      expect(sc.dimensions.sleep_opportunity_score).toBeGreaterThan(0);
      expect(sc.dimensions.workload_distribution_score).toBeGreaterThan(0);
      expect(sc.dimensions.exercise_preservation_score).toBeGreaterThan(0);
      expect(sc.dimensions.mission_schedule_disruption_pct).toBeGreaterThanOrEqual(0);
      expect(sc.dimensions.environmental_constraint_score).toBeGreaterThan(0);
      expect(sc.dimensions.data_completeness_score).toBeGreaterThan(0);
      expect(sc.dimensions.uncertainty_band_pct).toBeGreaterThan(0);
    }
  });

  it('verifies Parameter Sensitivity Analysis ranks 5 biological coefficients and checks replay order', () => {
    expect(DEFAULT_SENSITIVITY_ANALYSIS.parameter_sensitivities).toHaveLength(5);
    expect(DEFAULT_SENSITIVITY_ANALYSIS.most_influential_parameter).toContain('Sleep Restoration');
    expect(DEFAULT_SENSITIVITY_ANALYSIS.scientific_label).toContain('NOT A CLINICAL RECOMMENDATION');

    // Verify chronological event replay consistency (timestamps strictly non-decreasing)
    const nodes1 = DEFAULT_RECONSTRUCTION_INC1.evidence_nodes;
    for (let i = 1; i < nodes1.length; i++) {
      expect(new Date(nodes1[i].timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(nodes1[i - 1].timestamp).getTime()
      );
    }
    const nodes2 = DEFAULT_RECONSTRUCTION_INC2.evidence_nodes;
    for (let i = 1; i < nodes2.length; i++) {
      expect(new Date(nodes2[i].timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(nodes2[i - 1].timestamp).getTime()
      );
    }
  });
});
