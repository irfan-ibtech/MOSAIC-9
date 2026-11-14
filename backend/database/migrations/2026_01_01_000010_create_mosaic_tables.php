<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('missions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->integer('current_day')->default(120);
            $table->integer('elapsed_hours')->default(2880);
            $table->dateTime('launch_timestamp')->nullable();
            $table->string('status')->default('ACTIVE');
            $table->integer('communication_latency_seconds')->default(1260); // 21 minutes Mars delay
            $table->string('earth_comm_status')->default('OFFLINE'); // OFFLINE, DEGRADED, CONNECTED
            $table->float('radiation_ambient_usv_per_h')->default(48.5);
            $table->float('cabin_pressure_kpa')->default(101.3);
            $table->float('cabin_o2_percent')->default(21.0);
            $table->float('cabin_co2_mmhg')->default(2.8);
            $table->timestamps();
        });

        Schema::create('crew_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mission_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('callsign');
            $table->string('role');
            $table->string('status')->default('STABLE'); // STABLE, WATCH, REVIEW_REQUIRED, UNKNOWN
            $table->text('status_explanation')->nullable();
            $table->string('avatar_initials', 4);
            $table->json('baseline_profile')->nullable();
            $table->json('domain_status')->nullable(); // card, musc, neuro, rad
            $table->float('overall_data_completeness')->default(0.95);
            $table->float('overall_confidence_score')->default(0.92);
            $table->timestamps();
        });

        Schema::create('health_observations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crew_member_id')->constrained()->cascadeOnDelete();
            $table->integer('mission_day');
            $table->dateTime('timestamp');
            $table->string('domain'); // cardiovascular, musculoskeletal, neuro_cognitive_sleep, radiation_environment
            $table->string('metric_name');
            $table->float('value');
            $table->string('unit')->nullable();
            $table->float('baseline_reference')->nullable();
            $table->float('deviation_zscore')->nullable();
            $table->boolean('is_synthetic')->default(true);
            $table->float('confidence_score')->default(1.0);
            $table->string('data_source');
            $table->string('quality_flag')->default('VERIFIED');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['crew_member_id', 'mission_day']);
            $table->index(['crew_member_id', 'metric_name']);
        });

        Schema::create('ledger_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_uid')->unique();
            $table->foreignId('crew_member_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_category'); // health_observation, symptom_report, sleep_observation, exercise_record, workload_observation, environmental_event, mission_event, communication_quality
            $table->string('title');
            $table->text('description');
            $table->integer('mission_day');
            $table->dateTime('event_timestamp');
            $table->dateTime('recorded_timestamp');
            $table->string('severity')->default('INFO'); // INFO, LOW, MODERATE, HIGH, CRITICAL
            $table->float('value')->nullable();
            $table->string('unit')->nullable();
            $table->string('source');
            $table->json('data_provenance')->nullable();
            $table->float('confidence_score')->default(1.0);
            $table->string('data_quality')->default('VERIFIED'); // VERIFIED, PROVISIONAL, DEGRADED, STALE, UNRELIABLE
            $table->boolean('is_synthetic')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['crew_member_id', 'mission_day']);
            $table->index('event_category');
            $table->index('severity');
        });

        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->string('incident_code')->unique();
            $table->foreignId('crew_member_id')->constrained()->cascadeOnDelete();
            $table->string('incident_type');
            $table->string('title');
            $table->text('description');
            $table->integer('mission_day');
            $table->dateTime('incident_timestamp');
            $table->string('severity')->default('REVIEW_REQUIRED');
            $table->string('status')->default('OPEN'); // OPEN, INVESTIGATING, RESOLVED, TRANSFERRED_TO_GROUND
            $table->json('reconstruction_summary')->nullable();
            $table->integer('supporting_evidence_count')->default(0);
            $table->integer('missing_evidence_count')->default(0);
            $table->timestamps();
        });

        Schema::create('countermeasure_scenarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crew_member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('incident_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('inputs'); // sleep_delta_hours, workload_delta_pct, cycle_ergometer_watts, hydration_ml, rest_hours
            $table->json('projections'); // projected trends & metrics
            $table->text('assumptions')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        Schema::create('ground_communications', function (Blueprint $table) {
            $table->id();
            $table->string('packet_id')->unique();
            $table->foreignId('crew_member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('incident_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('clinical_summary');
            $table->text('sbar_situation');
            $table->text('sbar_background');
            $table->text('sbar_assessment');
            $table->text('sbar_recommendation');
            $table->json('evidence_ledger_ids')->nullable();
            $table->text('data_limitations')->nullable();
            $table->text('questions_for_ground')->nullable();
            $table->string('review_priority')->default('ROUTINE'); // ROUTINE, PRIORITY, URGENT
            $table->string('sync_status')->default('QUEUED_LOCAL'); // QUEUED_LOCAL, TRANSMITTING, DELIVERED, ACKNOWLEDGED
            $table->dateTime('transmitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('sync_telemetry', function (Blueprint $table) {
            $table->id();
            $table->dateTime('last_successful_sync_at')->nullable();
            $table->integer('queued_items_count')->default(0);
            $table->string('earth_link_state')->default('LOSS_OF_SIGNAL'); // LOSS_OF_SIGNAL, DEGRADED_COMM, HIGH_GAIN_ESTABLISHED
            $table->integer('round_trip_latency_sec')->default(2520);
            $table->float('local_db_integrity_pct')->default(100.0);
            $table->boolean('offline_mode_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_telemetry');
        Schema::dropIfExists('ground_communications');
        Schema::dropIfExists('countermeasure_scenarios');
        Schema::dropIfExists('incidents');
        Schema::dropIfExists('ledger_events');
        Schema::dropIfExists('health_observations');
        Schema::dropIfExists('crew_members');
        Schema::dropIfExists('missions');
    }
};
