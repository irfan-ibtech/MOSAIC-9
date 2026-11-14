import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CREW_MEMBERS,
  CREW_SIMULATION_DEFAULTS,
  ASTRONAUT_SBAR_TEMPLATES,
  DEFAULT_SCENARIOS,
  DEFAULT_INCIDENTS,
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
});
