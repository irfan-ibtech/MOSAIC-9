<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Mission;
use App\Models\CrewMember;
use App\Models\LedgerEvent;
use App\Models\Incident;
use App\Models\GroundCommunication;

class MosaicApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\MosaicSeeder::class);
    }
    public function test_mission_endpoint_returns_operational_data(): void
    {
        $response = $this->getJson('/api/mission');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'mission' => ['name', 'code', 'current_day', 'status'],
                'crew_overview' => ['total', 'stable', 'watch', 'review_required', 'unknown'],
                'active_incidents_count',
                'data_freshness_seconds',
            ]);
    }

    public function test_crew_list_and_detail_endpoints(): void
    {
        $response = $this->getJson('/api/crew');
        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(4, count($response->json()));

        $alex = CrewMember::where('name', 'like', '%Alex Morgan%')->first();
        $this->assertNotNull($alex);

        $detailResponse = $this->getJson("/api/crew/{$alex->id}");
        $detailResponse->assertStatus(200)
            ->assertJsonPath('crew_member.status', 'REVIEW_REQUIRED')
            ->assertJsonStructure(['crew_member', 'domains']);
    }

    public function test_ledger_filtering_by_crew_and_search(): void
    {
        $alex = CrewMember::where('name', 'like', '%Alex Morgan%')->first();
        $response = $this->getJson("/api/ledger?crew_member_id={$alex->id}&category=sleep_observation");
        $response->assertStatus(200)
            ->assertJsonStructure(['total', 'events', 'summary']);

        $searchResponse = $this->getJson('/api/ledger?search=dizziness');
        $searchResponse->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, $searchResponse->json('total'));
    }

    public function test_incident_reconstruction_contains_evidence_taxonomy(): void
    {
        $incident = Incident::first();
        $this->assertNotNull($incident);

        $response = $this->getJson("/api/incidents/{$incident->id}/reconstruct?horizon_hours=72");
        $response->assertStatus(200)
            ->assertJsonStructure([
                'incident',
                'horizon_hours',
                'evidence_nodes',
                'missing_evidence',
                'hypotheses',
                'recommended_reviews',
            ]);

        $evidence = $response->json('evidence_nodes');
        $this->assertNotEmpty($evidence);

        // Verify that scientific taxonomy classifications exist
        $classifications = array_column($evidence, 'classification');
        $this->assertContains('OBSERVED_FACT', $classifications);
    }

    public function test_countermeasure_scenario_simulation(): void
    {
        $alex = CrewMember::where('name', 'like', '%Alex Morgan%')->first();
        $payload = [
            'crew_member_id' => $alex->id,
            'name' => 'Test Scenario Rest and Hydration',
            'sleep_delta_hours' => 2.0,
            'workload_delta_pct' => -25.0,
            'cycle_ergometer_watts' => 150.0,
            'hydration_fluid_ml' => 1000.0,
            'ambient_co2_target_mmhg' => 2.5,
        ];

        $response = $this->postJson('/api/scenarios/simulate', $payload);
        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'scenario' => ['id', 'name', 'projections'],
                'baseline_comparison',
            ]);
    }

    public function test_ground_communication_queueing_for_offline_operations(): void
    {
        $alex = CrewMember::where('name', 'like', '%Alex Morgan%')->first();
        $payload = [
            'crew_member_id' => $alex->id,
            'title' => 'Test Ground Communication Packet',
            'clinical_summary' => 'Summary of test clinical situation',
            'sbar_situation' => 'SBAR situation details',
            'sbar_background' => 'SBAR background details',
            'sbar_assessment' => 'SBAR assessment details',
            'sbar_recommendation' => 'SBAR recommendation details',
            'review_priority' => 'PRIORITY',
        ];

        $response = $this->postJson('/api/ground-comms', $payload);
        $response->assertStatus(201)
            ->assertJsonPath('communication.sync_status', 'QUEUED_LOCAL');
    }

    public function test_marcus_vance_ground_communication_and_incident_link(): void
    {
        $marcus = CrewMember::where('name', 'like', '%Marcus Vance%')->first();
        $this->assertNotNull($marcus);

        $comms = GroundCommunication::where('crew_member_id', $marcus->id)->first();
        $this->assertNotNull($comms);
        $this->assertEquals('GND-COM-ARES4-118-002', $comms->packet_id);
        $this->assertEquals('QUEUED_LOCAL', $comms->sync_status);

        $transmitResp = $this->postJson("/api/ground-comms/{$comms->id}/transmit");
        $transmitResp->assertStatus(200)
            ->assertJsonPath('communication.sync_status', 'TRANSMITTING');
    }

    public function test_temporal_relationship_analysis(): void
    {
        $alex = CrewMember::where('name', 'like', '%Alex Morgan%')->first();
        $response = $this->postJson('/api/intelligence/temporal-analysis', [
            'crew_member_id' => $alex->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'engine',
                'crew_member',
                'first_unusual_signal',
                'cross_domain_associations',
                'anomaly_sequence',
                'confidence_evaluation',
            ]);
    }

    public function test_second_incident_marcus_vance_reconstruction(): void
    {
        $incident = Incident::where('incident_code', 'INC-ARES4-118-002')->first();
        $this->assertNotNull($incident);

        // Test all four lookback horizons: 6h, 24h, 72h, 168h
        $horizons = [6, 24, 72, 168];
        $prevCount = 0;

        foreach ($horizons as $h) {
            $response = $this->getJson("/api/incidents/{$incident->id}/reconstruct?horizon_hours={$h}");
            $response->assertStatus(200)
                ->assertJsonPath('incident.incident_code', 'INC-ARES4-118-002')
                ->assertJsonPath('horizon_hours', $h)
                ->assertJsonStructure([
                    'incident',
                    'horizon_hours',
                    'evidence_nodes',
                    'missing_evidence',
                    'hypotheses',
                    'recommended_reviews',
                ]);

            $nodes = $response->json('evidence_nodes');
            $this->assertGreaterThanOrEqual($prevCount, count($nodes), "Horizon {$h}h should have at least as many nodes as previous horizon");
            $prevCount = count($nodes);
        }

        // Verify that Marcus Vance has incident-specific hypotheses distinct from Alex Morgan
        $resp = $this->getJson("/api/incidents/{$incident->id}/reconstruct?horizon_hours=24");
        $hypotheses = $resp->json('hypotheses');
        $this->assertNotEmpty($hypotheses);
        $hypIds = array_column($hypotheses, 'hypothesis_id');
        $this->assertContains('HYP-MV-01', $hypIds);
    }

    public function test_sarah_chen_nominal_observations_and_baseline(): void
    {
        $sarah = CrewMember::where('name', 'like', '%Sarah Chen%')->first();
        $this->assertNotNull($sarah);
        $this->assertEquals('STABLE', $sarah->status);

        $obsResponse = $this->getJson("/api/crew/{$sarah->id}/observations");
        $obsResponse->assertStatus(200);
        $observations = $obsResponse->json('observations');
        $this->assertGreaterThanOrEqual(20, count($observations));
    }

    public function test_elena_rostova_missing_data_behavior(): void
    {
        $elena = CrewMember::where('name', 'like', '%Elena Rostova%')->first();
        $this->assertNotNull($elena);
        $this->assertEquals('UNKNOWN', $elena->status);

        $obsResponse = $this->getJson("/api/crew/{$elena->id}/observations");
        $obsResponse->assertStatus(200);
        $observations = $obsResponse->json('observations');
        
        // Days 116, 117, 118 are present
        $missionDays = array_unique(array_column($observations, 'mission_day'));
        $this->assertContains(116, $missionDays);
        $this->assertContains(117, $missionDays);
        $this->assertContains(118, $missionDays);
        // Days 119 and 120 are missing by design (sensor dropout)
        $this->assertNotContains(119, $missionDays);
        $this->assertNotContains(120, $missionDays);
    }

    public function test_sync_telemetry_status_and_toggle_link(): void
    {
        $statusResponse = $this->getJson('/api/sync/status');
        $statusResponse->assertStatus(200)
            ->assertJsonStructure(['sync_telemetry', 'storage_stats']);

        $toggleResponse = $this->postJson('/api/sync/toggle-link', ['state' => 'LOSS_OF_SIGNAL']);
        $toggleResponse->assertStatus(200)
            ->assertJsonPath('sync_telemetry.earth_link_state', 'LOSS_OF_SIGNAL');
    }

    public function test_crew_specific_scenarios_and_simulations(): void
    {
        $elena = CrewMember::where('name', 'like', '%Elena Rostova%')->first();
        $this->assertNotNull($elena);

        // Elena has astronaut-tailored scenarios
        $response = $this->getJson("/api/scenarios?crew_member_id={$elena->id}");
        $response->assertStatus(200);
        $scenarios = $response->json();
        $this->assertCount(2, $scenarios);
        $names = array_column($scenarios, 'name');
        $this->assertStringContainsString('Biosensor Re-Calibration', $names[0] . ' ' . $names[1]);

        // Elena simulation uses Elena's current state (HRV: 53ms, BP: 115mmHg), not Alex Morgan's collapsed state (27ms / 88mmHg)
        $simResponse = $this->postJson('/api/scenarios/simulate', [
            'crew_member_id' => $elena->id,
            'name' => 'Elena Custom Recovery',
            'sleep_delta_hours' => 1.0,
            'workload_delta_pct' => -10,
            'cycle_ergometer_watts' => 155,
            'hydration_fluid_ml' => 750,
        ]);

        $simResponse->assertStatus(201);
        $comparison = $simResponse->json('baseline_comparison');
        $this->assertEquals(53.0, $comparison['hrv']['current']);
        $this->assertEquals(115.0, $comparison['bp']['current']);
        $this->assertGreaterThan(50.0, $comparison['hrv']['projected']);
    }
}
