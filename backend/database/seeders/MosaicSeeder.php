<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Mission;
use App\Models\CrewMember;
use App\Models\HealthObservation;
use App\Models\LedgerEvent;
use App\Models\Incident;
use App\Models\CountermeasureScenario;
use App\Models\GroundCommunication;
use App\Models\SyncTelemetry;
use Carbon\Carbon;

class MosaicSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Mission Creation
        $baseDate = Carbon::create(2026, 7, 18, 0, 0, 0, 'UTC'); // Mission start
        $currentMissionDate = $baseDate->copy()->addDays(120)->addHours(14); // Day 120, 14:00

        $mission = Mission::create([
            'name' => 'ARES-IV Deep Space Mars Transit',
            'code' => 'ARES-IV',
            'current_day' => 120,
            'elapsed_hours' => 2894,
            'launch_timestamp' => $baseDate,
            'status' => 'ACTIVE',
            'communication_latency_seconds' => 1260, // 21 minutes
            'earth_comm_status' => 'OFFLINE',
            'radiation_ambient_usv_per_h' => 52.4,
            'cabin_pressure_kpa' => 101.1,
            'cabin_o2_percent' => 20.9,
            'cabin_co2_mmhg' => 3.2,
        ]);

        // 2. Crew Members
        // Crew 1: Commander Alex Morgan (The focal demonstration profile)
        $alex = CrewMember::create([
            'mission_id' => $mission->id,
            'name' => 'Commander Alex Morgan',
            'callsign' => 'ARES-LEAD',
            'role' => 'Mission Commander & Pilot',
            'status' => 'REVIEW_REQUIRED',
            'status_explanation' => 'Acute orthostatic dizziness episode recorded on Day 120 following cumulative 72-hour sleep debt, curtailed cycle ergometer countermeasure, and high EVA prep workload.',
            'avatar_initials' => 'AM',
            'baseline_profile' => [
                'resting_heart_rate' => 60,
                'hrv_rmssd' => 58,
                'systolic_bp' => 118,
                'diastolic_bp' => 76,
                'spo2' => 98.2,
                'sleep_target_hours' => 8.0,
                'deep_sleep_pct' => 22,
                'rem_sleep_pct' => 24,
                'vo2_max_est' => 52.4,
                'exercise_target_watts' => 185,
                'pvt_reaction_time_ms' => 215,
                'cumulative_radiation_msv' => 142.5,
            ],
            'domain_status' => [
                'cardiovascular' => ['status' => 'WATCH', 'summary' => 'Transient orthostatic hypotension (88/58 mmHg) & compensatory tachycardia (118 bpm) post-egress.'],
                'musculoskeletal' => ['status' => 'WATCH', 'summary' => 'Exercise target missed on Day 118 (145W achieved vs 185W protocol). Muscle fatigue noted.'],
                'neuro_cognitive_sleep' => ['status' => 'REVIEW_REQUIRED', 'summary' => 'Severe acute sleep debt (3 consecutive nights < 5.5h) with PVT latency increase to 310ms.'],
                'radiation_environment' => ['status' => 'STABLE', 'summary' => 'Personal dosimeter within acceptable transit corridor (54 uSv/h). No acute solar particle events.'],
            ],
            'overall_data_completeness' => 0.98,
            'overall_confidence_score' => 0.94,
        ]);

        // Crew 2: Dr. Sarah Chen (Stable profile)
        $sarah = CrewMember::create([
            'mission_id' => $mission->id,
            'name' => 'Dr. Sarah Chen',
            'callsign' => 'CADUCEUS',
            'role' => 'Crew Medical Officer / Astrobiologist',
            'status' => 'STABLE',
            'status_explanation' => 'All physiological biomarkers within 1-sigma personal baseline tolerance. Excellent countermeasure adherence.',
            'avatar_initials' => 'SC',
            'baseline_profile' => [
                'resting_heart_rate' => 56,
                'hrv_rmssd' => 64,
                'systolic_bp' => 112,
                'diastolic_bp' => 72,
                'spo2' => 98.8,
                'sleep_target_hours' => 7.8,
                'deep_sleep_pct' => 24,
                'rem_sleep_pct' => 25,
                'vo2_max_est' => 49.0,
                'exercise_target_watts' => 170,
                'pvt_reaction_time_ms' => 208,
                'cumulative_radiation_msv' => 138.1,
            ],
            'domain_status' => [
                'cardiovascular' => ['status' => 'STABLE', 'summary' => 'Resting HR 57 bpm, HRV 62 ms. Normal sinus rhythm.'],
                'musculoskeletal' => ['status' => 'STABLE', 'summary' => 'Resistance and ARED countermeasure adherence 100%.'],
                'neuro_cognitive_sleep' => ['status' => 'STABLE', 'summary' => 'Sleep duration 7.6 hrs average. PVT vigilance reaction time 212 ms.'],
                'radiation_environment' => ['status' => 'STABLE', 'summary' => 'Personal dosimeter at 49 uSv/h. Nominal deep space background.'],
            ],
            'overall_data_completeness' => 0.99,
            'overall_confidence_score' => 0.98,
        ]);

        // Crew 3: Eng. Marcus Vance (Watch condition)
        $marcus = CrewMember::create([
            'mission_id' => $mission->id,
            'name' => 'Marcus Vance',
            'callsign' => 'VULCAN',
            'role' => 'Lead Flight Engineer / Systems Specialist',
            'status' => 'WATCH',
            'status_explanation' => 'Elevated maintenance workload on reactor coolant loop; slight sleep disruption and elevated ambient cabin CO2 exposure.',
            'avatar_initials' => 'MV',
            'baseline_profile' => [
                'resting_heart_rate' => 64,
                'hrv_rmssd' => 52,
                'systolic_bp' => 122,
                'diastolic_bp' => 78,
                'spo2' => 97.9,
                'sleep_target_hours' => 7.5,
                'deep_sleep_pct' => 20,
                'rem_sleep_pct' => 21,
                'vo2_max_est' => 46.5,
                'exercise_target_watts' => 175,
                'pvt_reaction_time_ms' => 222,
                'cumulative_radiation_msv' => 149.2,
            ],
            'domain_status' => [
                'cardiovascular' => ['status' => 'STABLE', 'summary' => 'Resting HR 66 bpm. BP 124/80 mmHg.'],
                'musculoskeletal' => ['status' => 'STABLE', 'summary' => 'Completed scheduled ARED session.'],
                'neuro_cognitive_sleep' => ['status' => 'WATCH', 'summary' => 'Sleep duration reduced to 6.1 hrs due to maintenance night shifts.'],
                'radiation_environment' => ['status' => 'WATCH', 'summary' => 'Worked near transit shield sector B during solar telemetry alert.'],
            ],
            'overall_data_completeness' => 0.92,
            'overall_confidence_score' => 0.89,
        ]);

        // Crew 4: Specialist Elena Rostova (Demonstrates UNKNOWN / Incomplete telemetry condition)
        $elena = CrewMember::create([
            'mission_id' => $mission->id,
            'name' => 'Elena Rostova',
            'callsign' => 'AURORA',
            'role' => 'Geology Payload Specialist',
            'status' => 'UNKNOWN',
            'status_explanation' => 'Biometric patch telemetry packet loss from Day 119 18:00 to Day 120 12:00. Status cannot be verified as STABLE without observations. Confidence penalized.',
            'avatar_initials' => 'ER',
            'baseline_profile' => [
                'resting_heart_rate' => 62,
                'hrv_rmssd' => 55,
                'systolic_bp' => 116,
                'diastolic_bp' => 74,
                'spo2' => 98.4,
                'sleep_target_hours' => 8.0,
                'deep_sleep_pct' => 23,
                'rem_sleep_pct' => 23,
                'vo2_max_est' => 48.0,
                'exercise_target_watts' => 165,
                'pvt_reaction_time_ms' => 218,
                'cumulative_radiation_msv' => 139.8,
            ],
            'domain_status' => [
                'cardiovascular' => ['status' => 'UNKNOWN', 'summary' => 'Continuous telemetry offline. Last verified HR 63 bpm at Day 119 17:40.'],
                'musculoskeletal' => ['status' => 'STABLE', 'summary' => 'Exercise logged manually on cycle ergometer.'],
                'neuro_cognitive_sleep' => ['status' => 'UNKNOWN', 'summary' => 'Sleep sensor offline; subjective sleep report pending.'],
                'radiation_environment' => ['status' => 'STABLE', 'summary' => 'Passive dosimeter nominal.'],
            ],
            'overall_data_completeness' => 0.44, // Demonstrates missing data handling
            'overall_confidence_score' => 0.41,
        ]);

        // 3. Observations for Commander Alex Morgan across Days 114 to 120 (rich time-series)
        $metrics = [
            // Day 114 (Baseline)
            ['day' => 114, 'hour' => 7, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'sleep_duration_hours', 'val' => 7.9, 'unit' => 'hours', 'base' => 8.0, 'z' => -0.1, 'source' => 'smart_bunk_sensor'],
            ['day' => 114, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'heart_rate_resting', 'val' => 59.0, 'unit' => 'bpm', 'base' => 60.0, 'z' => -0.2, 'source' => 'continuous_ecg_patch'],
            ['day' => 114, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'hrv_rmssd', 'val' => 59.5, 'unit' => 'ms', 'base' => 58.0, 'z' => 0.2, 'source' => 'continuous_ecg_patch'],
            ['day' => 114, 'hour' => 11, 'domain' => 'musculoskeletal', 'metric' => 'exercise_power_watts', 'val' => 188.0, 'unit' => 'W', 'base' => 185.0, 'z' => 0.3, 'source' => 'cycle_ergometer_tessera'],
            ['day' => 114, 'hour' => 14, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'cognitive_pvt_latency_ms', 'val' => 212.0, 'unit' => 'ms', 'base' => 215.0, 'z' => -0.2, 'source' => 'flight_deck_pvt_console'],
            ['day' => 114, 'hour' => 18, 'domain' => 'radiation_environment', 'metric' => 'radiation_dosimeter_usv', 'val' => 51.2, 'unit' => 'uSv/h', 'base' => 50.0, 'z' => 0.2, 'source' => 'crew_personal_dosimeter'],

            // Day 115 (Baseline)
            ['day' => 115, 'hour' => 7, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'sleep_duration_hours', 'val' => 8.1, 'unit' => 'hours', 'base' => 8.0, 'z' => 0.1, 'source' => 'smart_bunk_sensor'],
            ['day' => 115, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'heart_rate_resting', 'val' => 60.5, 'unit' => 'bpm', 'base' => 60.0, 'z' => 0.1, 'source' => 'continuous_ecg_patch'],
            ['day' => 115, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'hrv_rmssd', 'val' => 57.0, 'unit' => 'ms', 'base' => 58.0, 'z' => -0.1, 'source' => 'continuous_ecg_patch'],
            ['day' => 115, 'hour' => 11, 'domain' => 'musculoskeletal', 'metric' => 'exercise_power_watts', 'val' => 185.0, 'unit' => 'W', 'base' => 185.0, 'z' => 0.0, 'source' => 'cycle_ergometer_tessera'],
            ['day' => 115, 'hour' => 14, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'cognitive_pvt_latency_ms', 'val' => 216.0, 'unit' => 'ms', 'base' => 215.0, 'z' => 0.1, 'source' => 'flight_deck_pvt_console'],

            // Day 116 (Normal Personal Baseline)
            ['day' => 116, 'hour' => 7, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'sleep_duration_hours', 'val' => 7.8, 'unit' => 'hours', 'base' => 8.0, 'z' => -0.2, 'source' => 'smart_bunk_sensor'],
            ['day' => 116, 'hour' => 7, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'rem_sleep_percent', 'val' => 23.5, 'unit' => '%', 'base' => 24.0, 'z' => -0.1, 'source' => 'smart_bunk_sensor'],
            ['day' => 116, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'heart_rate_resting', 'val' => 61.0, 'unit' => 'bpm', 'base' => 60.0, 'z' => 0.2, 'source' => 'continuous_ecg_patch'],
            ['day' => 116, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'hrv_rmssd', 'val' => 58.0, 'unit' => 'ms', 'base' => 58.0, 'z' => 0.0, 'source' => 'continuous_ecg_patch'],
            ['day' => 116, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'systolic_bp', 'val' => 117.0, 'unit' => 'mmHg', 'base' => 118.0, 'z' => -0.1, 'source' => 'digital_sphygmomanometer'],
            ['day' => 116, 'hour' => 10, 'domain' => 'musculoskeletal', 'metric' => 'exercise_power_watts', 'val' => 186.0, 'unit' => 'W', 'base' => 185.0, 'z' => 0.1, 'source' => 'cycle_ergometer_tessera'],
            ['day' => 116, 'hour' => 14, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'cognitive_pvt_latency_ms', 'val' => 215.0, 'unit' => 'ms', 'base' => 215.0, 'z' => 0.0, 'source' => 'flight_deck_pvt_console'],
            ['day' => 116, 'hour' => 20, 'domain' => 'radiation_environment', 'metric' => 'radiation_dosimeter_usv', 'val' => 52.8, 'unit' => 'uSv/h', 'base' => 50.0, 'z' => 0.4, 'source' => 'crew_personal_dosimeter'],

            // Day 117 (Onset: Sleep Curtailment & Drill Interruption)
            ['day' => 117, 'hour' => 6, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'sleep_duration_hours', 'val' => 5.4, 'unit' => 'hours', 'base' => 8.0, 'z' => -2.6, 'source' => 'smart_bunk_sensor'],
            ['day' => 117, 'hour' => 6, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'rem_sleep_percent', 'val' => 14.2, 'unit' => '%', 'base' => 24.0, 'z' => -2.1, 'source' => 'smart_bunk_sensor'],
            ['day' => 117, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'heart_rate_resting', 'val' => 66.0, 'unit' => 'bpm', 'base' => 60.0, 'z' => 1.2, 'source' => 'continuous_ecg_patch'],
            ['day' => 117, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'hrv_rmssd', 'val' => 46.0, 'unit' => 'ms', 'base' => 58.0, 'z' => -1.8, 'source' => 'continuous_ecg_patch'],
            ['day' => 117, 'hour' => 11, 'domain' => 'musculoskeletal', 'metric' => 'exercise_power_watts', 'val' => 174.0, 'unit' => 'W', 'base' => 185.0, 'z' => -0.9, 'source' => 'cycle_ergometer_tessera'],
            ['day' => 117, 'hour' => 15, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'cognitive_pvt_latency_ms', 'val' => 242.0, 'unit' => 'ms', 'base' => 215.0, 'z' => 1.3, 'source' => 'flight_deck_pvt_console'],

            // Day 118 (Workload Surge & Countermeasure Degradation)
            ['day' => 118, 'hour' => 6, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'sleep_duration_hours', 'val' => 4.9, 'unit' => 'hours', 'base' => 8.0, 'z' => -3.1, 'source' => 'smart_bunk_sensor'],
            ['day' => 118, 'hour' => 6, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'rem_sleep_percent', 'val' => 12.8, 'unit' => '%', 'base' => 24.0, 'z' => -2.4, 'source' => 'smart_bunk_sensor'],
            ['day' => 118, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'heart_rate_resting', 'val' => 71.0, 'unit' => 'bpm', 'base' => 60.0, 'z' => 2.1, 'source' => 'continuous_ecg_patch'],
            ['day' => 118, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'hrv_rmssd', 'val' => 38.0, 'unit' => 'ms', 'base' => 58.0, 'z' => -2.9, 'source' => 'continuous_ecg_patch'],
            ['day' => 118, 'hour' => 10, 'domain' => 'musculoskeletal', 'metric' => 'exercise_power_watts', 'val' => 145.0, 'unit' => 'W', 'base' => 185.0, 'z' => -3.3, 'source' => 'cycle_ergometer_tessera'],
            ['day' => 118, 'hour' => 10, 'domain' => 'musculoskeletal', 'metric' => 'exercise_duration_min', 'val' => 28.0, 'unit' => 'min', 'base' => 45.0, 'z' => -2.8, 'source' => 'cycle_ergometer_tessera'],
            ['day' => 118, 'hour' => 14, 'domain' => 'radiation_environment', 'metric' => 'cabin_co2_exposure', 'val' => 3.5, 'unit' => 'mmHg', 'base' => 2.5, 'z' => 1.8, 'source' => 'cabin_gas_analyzer'],
            ['day' => 118, 'hour' => 16, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'cognitive_pvt_latency_ms', 'val' => 275.0, 'unit' => 'ms', 'base' => 215.0, 'z' => 2.6, 'source' => 'flight_deck_pvt_console'],

            // Day 119 (Fatigue & Sub-clinical Orthostatic Vulnerability)
            ['day' => 119, 'hour' => 6, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'sleep_duration_hours', 'val' => 5.1, 'unit' => 'hours', 'base' => 8.0, 'z' => -2.9, 'source' => 'smart_bunk_sensor'],
            ['day' => 119, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'heart_rate_resting', 'val' => 74.0, 'unit' => 'bpm', 'base' => 60.0, 'z' => 2.6, 'source' => 'continuous_ecg_patch'],
            ['day' => 119, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'hrv_rmssd', 'val' => 32.0, 'unit' => 'ms', 'base' => 58.0, 'z' => -3.6, 'source' => 'continuous_ecg_patch'],
            ['day' => 119, 'hour' => 8, 'domain' => 'cardiovascular', 'metric' => 'systolic_bp', 'val' => 104.0, 'unit' => 'mmHg', 'base' => 118.0, 'z' => -1.9, 'source' => 'digital_sphygmomanometer'],
            ['day' => 119, 'hour' => 10, 'domain' => 'musculoskeletal', 'metric' => 'exercise_power_watts', 'val' => 0.0, 'unit' => 'W', 'base' => 185.0, 'z' => -4.5, 'source' => 'cycle_ergometer_tessera'], // Missed session!
            ['day' => 119, 'hour' => 14, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'fatigue_subjective_score', 'val' => 7.0, 'unit' => 'scale_1_to_10', 'base' => 2.0, 'z' => 3.2, 'source' => 'crew_daily_checkin'],
            ['day' => 119, 'hour' => 15, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'cognitive_pvt_latency_ms', 'val' => 310.0, 'unit' => 'ms', 'base' => 215.0, 'z' => 3.9, 'source' => 'flight_deck_pvt_console'],
            ['day' => 119, 'hour' => 21, 'domain' => 'radiation_environment', 'metric' => 'radiation_dosimeter_usv', 'val' => 55.4, 'unit' => 'uSv/h', 'base' => 50.0, 'z' => 0.8, 'source' => 'crew_personal_dosimeter'],

            // Day 120 (Incident Day: Acute Episode at 09:42)
            ['day' => 120, 'hour' => 6, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'sleep_duration_hours', 'val' => 4.6, 'unit' => 'hours', 'base' => 8.0, 'z' => -3.4, 'source' => 'smart_bunk_sensor'],
            ['day' => 120, 'hour' => 7, 'domain' => 'cardiovascular', 'metric' => 'heart_rate_resting', 'val' => 78.0, 'unit' => 'bpm', 'base' => 60.0, 'z' => 3.3, 'source' => 'continuous_ecg_patch'],
            ['day' => 120, 'hour' => 7, 'domain' => 'cardiovascular', 'metric' => 'hrv_rmssd', 'val' => 27.0, 'unit' => 'ms', 'base' => 58.0, 'z' => -4.1, 'source' => 'continuous_ecg_patch'],
            ['day' => 120, 'hour' => 9, 'domain' => 'cardiovascular', 'metric' => 'systolic_bp', 'val' => 88.0, 'unit' => 'mmHg', 'base' => 118.0, 'z' => -3.8, 'source' => 'continuous_ecg_patch'],
            ['day' => 120, 'hour' => 9, 'domain' => 'cardiovascular', 'metric' => 'diastolic_bp', 'val' => 56.0, 'unit' => 'mmHg', 'base' => 76.0, 'z' => -2.9, 'source' => 'continuous_ecg_patch'],
            ['day' => 120, 'hour' => 9, 'domain' => 'cardiovascular', 'metric' => 'heart_rate_transient_peak', 'val' => 118.0, 'unit' => 'bpm', 'base' => 60.0, 'z' => 4.8, 'source' => 'continuous_ecg_patch'],
            ['day' => 120, 'hour' => 10, 'domain' => 'neuro_cognitive_sleep', 'metric' => 'fatigue_subjective_score', 'val' => 8.5, 'unit' => 'scale_1_to_10', 'base' => 2.0, 'z' => 4.2, 'source' => 'post_incident_log'],
            ['day' => 120, 'hour' => 11, 'domain' => 'cardiovascular', 'metric' => 'spo2', 'val' => 97.4, 'unit' => '%', 'base' => 98.2, 'z' => -0.9, 'source' => 'continuous_pulse_oximeter'],
        ];

        foreach ($metrics as $m) {
            $obsDate = $baseDate->copy()->addDays($m['day'])->addHours($m['hour']);
            HealthObservation::create([
                'crew_member_id' => $alex->id,
                'mission_day' => $m['day'],
                'timestamp' => $obsDate,
                'domain' => $m['domain'],
                'metric_name' => $m['metric'],
                'value' => $m['val'],
                'unit' => $m['unit'],
                'baseline_reference' => $m['base'],
                'deviation_zscore' => $m['z'],
                'is_synthetic' => true,
                'confidence_score' => 0.98,
                'data_source' => $m['source'],
                'quality_flag' => 'VERIFIED',
                'notes' => 'Synthetic research telemetry calibrated to NASA HRP baseline models.',
            ]);
        }

        // Seed multi-day observations for Dr. Sarah Chen (Stable profile across Days 116-120)
        for ($d = 116; $d <= 120; $d++) {
            $sarahDate = $baseDate->copy()->addDays($d)->addHours(8);
            HealthObservation::create([
                'crew_member_id' => $sarah->id,
                'mission_day' => $d,
                'timestamp' => $sarahDate->copy()->subHours(1),
                'domain' => 'neuro_cognitive_sleep',
                'metric_name' => 'sleep_duration_hours',
                'value' => 7.8,
                'unit' => 'hours',
                'baseline_reference' => 7.8,
                'deviation_zscore' => 0.0,
                'is_synthetic' => true,
                'confidence_score' => 0.99,
                'data_source' => 'smart_bunk_sensor',
                'quality_flag' => 'VERIFIED',
            ]);
            HealthObservation::create([
                'crew_member_id' => $sarah->id,
                'mission_day' => $d,
                'timestamp' => $sarahDate,
                'domain' => 'cardiovascular',
                'metric_name' => 'heart_rate_resting',
                'value' => 56.5,
                'unit' => 'bpm',
                'baseline_reference' => 56.0,
                'deviation_zscore' => 0.1,
                'is_synthetic' => true,
                'confidence_score' => 0.99,
                'data_source' => 'continuous_ecg_patch',
                'quality_flag' => 'VERIFIED',
            ]);
            HealthObservation::create([
                'crew_member_id' => $sarah->id,
                'mission_day' => $d,
                'timestamp' => $sarahDate,
                'domain' => 'cardiovascular',
                'metric_name' => 'hrv_rmssd',
                'value' => 64.0,
                'unit' => 'ms',
                'baseline_reference' => 64.0,
                'deviation_zscore' => 0.0,
                'is_synthetic' => true,
                'confidence_score' => 0.99,
                'data_source' => 'continuous_ecg_patch',
                'quality_flag' => 'VERIFIED',
            ]);
            HealthObservation::create([
                'crew_member_id' => $sarah->id,
                'mission_day' => $d,
                'timestamp' => $sarahDate->copy()->addHours(3),
                'domain' => 'musculoskeletal',
                'metric_name' => 'exercise_power_watts',
                'value' => 171.0,
                'unit' => 'W',
                'baseline_reference' => 170.0,
                'deviation_zscore' => 0.1,
                'is_synthetic' => true,
                'confidence_score' => 0.99,
                'data_source' => 'cycle_ergometer_tessera',
                'quality_flag' => 'VERIFIED',
            ]);
        }

        // Seed multi-day observations for Marcus Vance (Watch profile across Days 116-120)
        $marcusTrends = [
            116 => ['sleep' => 7.4, 'hr' => 64.0, 'hrv' => 52.0, 'watts' => 175.0, 'z' => 0.0],
            117 => ['sleep' => 6.8, 'hr' => 65.0, 'hrv' => 50.0, 'watts' => 170.0, 'z' => -0.8],
            118 => ['sleep' => 6.0, 'hr' => 66.0, 'hrv' => 47.0, 'watts' => 160.0, 'z' => -1.4],
            119 => ['sleep' => 6.2, 'hr' => 67.0, 'hrv' => 44.0, 'watts' => 150.0, 'z' => -1.6],
            120 => ['sleep' => 6.1, 'hr' => 68.0, 'hrv' => 43.0, 'watts' => 165.0, 'z' => -1.5],
        ];
        foreach ($marcusTrends as $day => $data) {
            $mvDate = $baseDate->copy()->addDays($day)->addHours(8);
            HealthObservation::create([
                'crew_member_id' => $marcus->id,
                'mission_day' => $day,
                'timestamp' => $mvDate->copy()->subHours(1),
                'domain' => 'neuro_cognitive_sleep',
                'metric_name' => 'sleep_duration_hours',
                'value' => $data['sleep'],
                'unit' => 'hours',
                'baseline_reference' => 7.5,
                'deviation_zscore' => $data['z'],
                'is_synthetic' => true,
                'confidence_score' => 0.91,
                'data_source' => 'smart_bunk_sensor',
                'quality_flag' => 'VERIFIED',
            ]);
            HealthObservation::create([
                'crew_member_id' => $marcus->id,
                'mission_day' => $day,
                'timestamp' => $mvDate,
                'domain' => 'cardiovascular',
                'metric_name' => 'heart_rate_resting',
                'value' => $data['hr'],
                'unit' => 'bpm',
                'baseline_reference' => 64.0,
                'deviation_zscore' => ($data['hr'] - 64.0) / 2.0,
                'is_synthetic' => true,
                'confidence_score' => 0.91,
                'data_source' => 'continuous_ecg_patch',
                'quality_flag' => 'VERIFIED',
            ]);
            HealthObservation::create([
                'crew_member_id' => $marcus->id,
                'mission_day' => $day,
                'timestamp' => $mvDate,
                'domain' => 'cardiovascular',
                'metric_name' => 'hrv_rmssd',
                'value' => $data['hrv'],
                'unit' => 'ms',
                'baseline_reference' => 52.0,
                'deviation_zscore' => ($data['hrv'] - 52.0) / 4.0,
                'is_synthetic' => true,
                'confidence_score' => 0.91,
                'data_source' => 'continuous_ecg_patch',
                'quality_flag' => 'VERIFIED',
            ]);
            HealthObservation::create([
                'crew_member_id' => $marcus->id,
                'mission_day' => $day,
                'timestamp' => $mvDate->copy()->addHours(3),
                'domain' => 'musculoskeletal',
                'metric_name' => 'exercise_power_watts',
                'value' => $data['watts'],
                'unit' => 'W',
                'baseline_reference' => 175.0,
                'deviation_zscore' => ($data['watts'] - 175.0) / 10.0,
                'is_synthetic' => true,
                'confidence_score' => 0.91,
                'data_source' => 'cycle_ergometer_tessera',
                'quality_flag' => 'VERIFIED',
            ]);
        }

        // Seed observations for Elena Rostova (Days 116-118 ONLY — Demonstrating Sensor Loss on Days 119-120)
        for ($d = 116; $d <= 118; $d++) {
            $elenaDate = $baseDate->copy()->addDays($d)->addHours(8);
            HealthObservation::create([
                'crew_member_id' => $elena->id,
                'mission_day' => $d,
                'timestamp' => $elenaDate->copy()->subHours(1),
                'domain' => 'neuro_cognitive_sleep',
                'metric_name' => 'sleep_duration_hours',
                'value' => 8.0,
                'unit' => 'hours',
                'baseline_reference' => 8.0,
                'deviation_zscore' => 0.0,
                'is_synthetic' => true,
                'confidence_score' => 0.94,
                'data_source' => 'smart_bunk_sensor',
                'quality_flag' => 'VERIFIED',
            ]);
            HealthObservation::create([
                'crew_member_id' => $elena->id,
                'mission_day' => $d,
                'timestamp' => $elenaDate,
                'domain' => 'cardiovascular',
                'metric_name' => 'heart_rate_resting',
                'value' => 62.0,
                'unit' => 'bpm',
                'baseline_reference' => 62.0,
                'deviation_zscore' => 0.0,
                'is_synthetic' => true,
                'confidence_score' => 0.94,
                'data_source' => 'continuous_ecg_patch',
                'quality_flag' => 'VERIFIED',
            ]);
            HealthObservation::create([
                'crew_member_id' => $elena->id,
                'mission_day' => $d,
                'timestamp' => $elenaDate,
                'domain' => 'cardiovascular',
                'metric_name' => 'hrv_rmssd',
                'value' => 55.0,
                'unit' => 'ms',
                'baseline_reference' => 55.0,
                'deviation_zscore' => 0.0,
                'is_synthetic' => true,
                'confidence_score' => 0.94,
                'data_source' => 'continuous_ecg_patch',
                'quality_flag' => 'VERIFIED',
            ]);
        }

        // 4. Mission Health Intelligence Ledger Events (Module B)
        $events = [
            // Day 116 Events
            [
                'uid' => 'EVT-116-0810-MED',
                'crew_id' => $alex->id,
                'cat' => 'health_observation',
                'title' => 'Nominal Morning Vitals Acquired',
                'desc' => 'HR 61 bpm, BP 117/76 mmHg, SpO2 98.2%. Autonomic balance within normal range (HRV RMSSD 58ms).',
                'day' => 116,
                'hour' => 8,
                'minute' => 10,
                'sev' => 'INFO',
                'val' => 61.0,
                'unit' => 'bpm',
                'src' => 'Bio-Telemetry Patch Unit #1',
                'quality' => 'VERIFIED',
                'notes' => 'Calibration check passed. Good signal-to-noise ratio.',
            ],
            [
                'uid' => 'EVT-116-1030-EXE',
                'crew_id' => $alex->id,
                'cat' => 'exercise_record',
                'title' => 'Scheduled Cycle Ergometer Protocol Completed',
                'desc' => 'Target 185W for 45 min completed at 186W average. Heart rate recovery nominal within 90 seconds.',
                'day' => 116,
                'hour' => 10,
                'minute' => 30,
                'sev' => 'INFO',
                'val' => 186.0,
                'unit' => 'W',
                'src' => 'Cycle Ergometer Tessera-M',
                'quality' => 'VERIFIED',
                'notes' => 'Musculoskeletal countermeasure protocol adhered to without deviations.',
            ],
            [
                'uid' => 'EVT-116-1900-ENV',
                'crew_id' => null, // Shipwide
                'cat' => 'environmental_event',
                'title' => 'Cabin Environmental Parameters Stable',
                'desc' => 'Habitation module cabin pressure 101.2 kPa, O2 21.0%, CO2 2.7 mmHg. Temperature 21.4 C.',
                'day' => 116,
                'hour' => 19,
                'minute' => 0,
                'sev' => 'INFO',
                'val' => 2.7,
                'unit' => 'mmHg',
                'src' => 'ECLSS Main Sensor Array',
                'quality' => 'VERIFIED',
                'notes' => 'All environmental scrubbers operating in nominal dual-bed cycle.',
            ],

            // Day 117 Events
            [
                'uid' => 'EVT-117-0245-MIS',
                'crew_id' => null,
                'cat' => 'mission_event',
                'title' => 'ECLSS Secondary Fan Audio Alarm Drill',
                'desc' => 'Unscheduled false alarm triggered in Crew Quarters Alpha due to transient pressure transducer fluctuation. Crew awakened.',
                'day' => 117,
                'hour' => 2,
                'minute' => 45,
                'sev' => 'MODERATE',
                'val' => null,
                'unit' => null,
                'src' => 'Station Mission Automation Controller',
                'quality' => 'VERIFIED',
                'notes' => 'Alarm cleared in 22 minutes. Sleep architecture interrupted.',
            ],
            [
                'uid' => 'EVT-117-0630-SLP',
                'crew_id' => $alex->id,
                'cat' => 'sleep_observation',
                'title' => 'Sleep Curtailment Recorded',
                'desc' => 'Total recorded sleep 5.4 hours (target 8.0h). REM sleep fraction reduced to 14.2%. 4 awakenings logged.',
                'day' => 117,
                'hour' => 6,
                'minute' => 30,
                'sev' => 'LOW',
                'val' => 5.4,
                'unit' => 'hours',
                'src' => 'Smart Bunk Bio-Acoustic Array',
                'quality' => 'VERIFIED',
                'notes' => 'Sleep debt of 2.6 hours accumulated for Day 117.',
            ],
            [
                'uid' => 'EVT-117-1430-WRK',
                'crew_id' => $alex->id,
                'cat' => 'workload_observation',
                'title' => 'Cargo Relocation & Docking Prep Task Extended',
                'desc' => 'Commander allocated 2.5 additional timeline hours to troubleshoot robotic arm hatch latches.',
                'day' => 117,
                'hour' => 14,
                'minute' => 30,
                'sev' => 'LOW',
                'val' => 10.5,
                'unit' => 'hours',
                'src' => 'Flight Timeline Log',
                'quality' => 'VERIFIED',
                'notes' => 'Physical exertion moderate-high during pressurized glove operations.',
            ],

            // Day 118 Events
            [
                'uid' => 'EVT-118-0615-SLP',
                'crew_id' => $alex->id,
                'cat' => 'sleep_observation',
                'title' => 'Second Consecutive Sleep Curtailment',
                'desc' => 'Total sleep 4.9 hours. Autonomic resting tone shows sympathetically dominant elevation (Resting HR 71 bpm).',
                'day' => 118,
                'hour' => 6,
                'minute' => 15,
                'sev' => 'MODERATE',
                'val' => 4.9,
                'unit' => 'hours',
                'src' => 'Smart Bunk Bio-Acoustic Array',
                'quality' => 'VERIFIED',
                'notes' => 'Cumulative 48-hour sleep debt reaches 5.7 hours.',
            ],
            [
                'uid' => 'EVT-118-1015-EXE',
                'crew_id' => $alex->id,
                'cat' => 'exercise_record',
                'title' => 'Cycle Ergometer Session Abbreviated',
                'desc' => 'Alex achieved only 145W against prescribed 185W target; aborted after 28 min citing quadriceps heaviness.',
                'day' => 118,
                'hour' => 10,
                'minute' => 15,
                'sev' => 'MODERATE',
                'val' => 145.0,
                'unit' => 'W',
                'src' => 'Cycle Ergometer Tessera-M',
                'quality' => 'VERIFIED',
                'notes' => 'Aerobic and cardiovascular countermeasure dose deficient by 42%.',
            ],
            [
                'uid' => 'EVT-118-1630-ENV',
                'crew_id' => null,
                'cat' => 'environmental_event',
                'title' => 'Cabin CO2 Level Elevated During Cargo Transfer',
                'desc' => 'Local CO2 concentration rose to 3.5 mmHg in Module B during heavy physical movement of stowage bags.',
                'day' => 118,
                'hour' => 16,
                'minute' => 30,
                'sev' => 'LOW',
                'val' => 3.5,
                'unit' => 'mmHg',
                'src' => 'ECLSS Node 2 Gas Sensor',
                'quality' => 'VERIFIED',
                'notes' => 'Well-known factor predisposing microgravity cephalad fluid shift headache and mild lightheadedness.',
            ],
            // Marcus Vance Incident Chain (INC-ARES4-118-002)
            [
                'uid' => 'EVT-117-1800-WRK',
                'crew_id' => $marcus->id,
                'cat' => 'workload_observation',
                'title' => 'Coolant Loop Pump Filter Maintenance Initiated',
                'desc' => 'Flight Engineer commenced unscheduled maintenance on primary cooling loop. Task duration extended into rest window.',
                'day' => 117,
                'hour' => 18,
                'minute' => 0,
                'sev' => 'LOW',
                'val' => 8.5,
                'unit' => 'hours',
                'src' => 'Maintenance Duty Scheduler',
                'quality' => 'VERIFIED',
                'notes' => 'Precursor shift extension; delayed sleep cycle onset.',
            ],
            [
                'uid' => 'EVT-118-0545-SLP',
                'crew_id' => $marcus->id,
                'cat' => 'sleep_observation',
                'title' => 'Shift-Delayed Sleep Period Curtailed',
                'desc' => 'Recorded sleep duration 6.0 hours (baseline 7.5h) following overtime maintenance work.',
                'day' => 118,
                'hour' => 5,
                'minute' => 45,
                'sev' => 'LOW',
                'val' => 6.0,
                'unit' => 'hours',
                'src' => 'Smart Bunk Bio-Acoustic Array',
                'quality' => 'VERIFIED',
                'notes' => 'Moderate 1.5h sleep debt; morning alertness slightly reduced.',
            ],
            [
                'uid' => 'EVT-118-0830-WRK',
                'crew_id' => $marcus->id,
                'cat' => 'workload_observation',
                'title' => 'Overtime Shift: Secondary Coolant Valve Overhaul',
                'desc' => 'Continuous manual physical labor in confined Node 2 bay. Total scheduled shift extended to 12.0 hours.',
                'day' => 118,
                'hour' => 8,
                'minute' => 30,
                'sev' => 'MODERATE',
                'val' => 12.0,
                'unit' => 'hours',
                'src' => 'Flight Timeline Log',
                'quality' => 'VERIFIED',
                'notes' => 'High postural tension and manual torque requirements.',
            ],
            [
                'uid' => 'EVT-118-1915-INC',
                'crew_id' => $marcus->id,
                'cat' => 'symptom_report',
                'title' => 'CRITICAL INCIDENT: Acute Cephalic Tension & Workload Strain',
                'desc' => 'Marcus reported severe bilateral temporal throbbing headache, ocular fatigue, and mild disequilibrium during 12-hour continuous maintenance.',
                'day' => 118,
                'hour' => 19,
                'minute' => 15,
                'sev' => 'CRITICAL',
                'val' => 8.0,
                'unit' => 'score',
                'src' => 'Crew Daily Check-In Terminal',
                'quality' => 'VERIFIED',
                'notes' => 'Incident INC-ARES4-118-002 target event.',
            ],
            [
                'uid' => 'EVT-118-2030-MED',
                'crew_id' => $marcus->id,
                'cat' => 'health_observation',
                'title' => 'Post-Incident Rest & Symptom De-escalation',
                'desc' => 'Duty relief enforced. 2 hours of rest in Crew Quarters Alpha with oral hydration resulted in headache resolution.',
                'day' => 118,
                'hour' => 20,
                'minute' => 30,
                'sev' => 'MODERATE',
                'val' => 124.0,
                'unit' => 'mmHg',
                'src' => 'Bio-Telemetry Patch Unit #3',
                'quality' => 'VERIFIED',
                'notes' => 'Full recovery confirmed; rest period mandatory.',
            ],

            // Day 119 Events
            [
                'uid' => 'EVT-119-0630-SLP',
                'crew_id' => $alex->id,
                'cat' => 'sleep_observation',
                'title' => 'Third Sleep Restriction Night (5.1h)',
                'desc' => 'Resting HRV RMSSD dropped to 32 ms (baseline 58 ms, z = -3.6). Significant vagal withdrawal detected.',
                'day' => 119,
                'hour' => 6,
                'minute' => 30,
                'sev' => 'MODERATE',
                'val' => 5.1,
                'unit' => 'hours',
                'src' => 'Smart Bunk Bio-Acoustic Array',
                'quality' => 'VERIFIED',
                'notes' => 'Autonomic recovery index severely suppressed.',
            ],
            [
                'uid' => 'EVT-119-1000-EXE',
                'crew_id' => $alex->id,
                'cat' => 'exercise_record',
                'title' => 'Daily Cardiovascular Countermeasure Omitted',
                'desc' => 'Alex skipped scheduled 45-min cycle ergometer workout due to pressing avionics firmware update duties.',
                'day' => 119,
                'hour' => 10,
                'minute' => 0,
                'sev' => 'HIGH',
                'val' => 0.0,
                'unit' => 'W',
                'src' => 'Crew Self-Schedule Log',
                'quality' => 'VERIFIED',
                'notes' => 'Zero aerobic countermeasure stimuli received over 24-hour window.',
            ],
            [
                'uid' => 'EVT-119-1415-SYM',
                'crew_id' => $alex->id,
                'cat' => 'symptom_report',
                'title' => 'Subjective Fatigue & Heavy Eyelids Reported',
                'desc' => 'Self-reported fatigue score 7/10 during daily medical check-in. Mental fog and difficulty focusing noted.',
                'day' => 119,
                'hour' => 14,
                'minute' => 15,
                'sev' => 'MODERATE',
                'val' => 7.0,
                'unit' => 'score',
                'src' => 'Crew Health Portal Check-in',
                'quality' => 'VERIFIED',
                'notes' => 'Corroborated by concurrent PVT vigilance decline.',
            ],
            [
                'uid' => 'EVT-119-1520-MED',
                'crew_id' => $alex->id,
                'cat' => 'health_observation',
                'title' => 'Psychomotor Vigilance Latency Spike',
                'desc' => 'PVT median response time degraded to 310 ms (baseline 215 ms, +44%). 3 attentional lapses (>500ms) recorded.',
                'day' => 119,
                'hour' => 15,
                'minute' => 20,
                'sev' => 'HIGH',
                'val' => 310.0,
                'unit' => 'ms',
                'src' => 'Flight Deck PVT Console',
                'quality' => 'VERIFIED',
                'notes' => 'Confirms objective neurobehavioral impairment secondary to sleep restriction.',
            ],
            [
                'uid' => 'EVT-119-2100-COM',
                'crew_id' => null,
                'cat' => 'communication_quality',
                'title' => 'Earth Deep Space Network Loss of Signal (LOS)',
                'desc' => 'Orbital planetary occultation begins. Communications with Mission Control Houston offline for 36 hours.',
                'day' => 119,
                'hour' => 21,
                'minute' => 0,
                'sev' => 'INFO',
                'val' => 36.0,
                'unit' => 'hours',
                'src' => 'High Gain Antenna Comm Subsystem',
                'quality' => 'VERIFIED',
                'notes' => 'Autonomous onboard operations protocol active.',
            ],

            // Day 120 Events (Incident day)
            [
                'uid' => 'EVT-120-0610-SLP',
                'crew_id' => $alex->id,
                'cat' => 'sleep_observation',
                'title' => 'Sleep Fragmentation & Deficit (4.6h)',
                'desc' => 'Resting HR upon waking 78 bpm. Cumulative 4-day sleep deficit totals 9.8 hours.',
                'day' => 120,
                'hour' => 6,
                'minute' => 10,
                'sev' => 'HIGH',
                'val' => 4.6,
                'unit' => 'hours',
                'src' => 'Smart Bunk Bio-Acoustic Array',
                'quality' => 'VERIFIED',
                'notes' => 'High autonomic stress state prior to morning mission schedule.',
            ],
            [
                'uid' => 'EVT-120-0830-WRK',
                'crew_id' => $alex->id,
                'cat' => 'workload_observation',
                'title' => 'Bimodal Rapid Transit in Equipment Bay 3',
                'desc' => 'Alex conducted rapid positional changes (head-down translation to vertical orientation) while inspecting emergency valves.',
                'day' => 120,
                'hour' => 8,
                'minute' => 30,
                'sev' => 'MODERATE',
                'val' => null,
                'unit' => null,
                'src' => 'Internal Inertial Motion Tracker',
                'quality' => 'VERIFIED',
                'notes' => 'Baroreflex challenged by rapid directional changes in microgravity.',
            ],
            [
                'uid' => 'EVT-120-0942-INC',
                'crew_id' => $alex->id,
                'cat' => 'symptom_report',
                'title' => 'CRITICAL INCIDENT: Acute Orthostatic Dizziness Episode',
                'desc' => 'Commander reported sudden vertigo, visual gray-out, and severe unsteadiness upon standing upright in Airlock Node. Heart rate spiked to 118 bpm, systolic BP dropped to 88 mmHg.',
                'day' => 120,
                'hour' => 9,
                'minute' => 42,
                'sev' => 'CRITICAL',
                'val' => 88.0,
                'unit' => 'mmHg',
                'src' => 'Continuous Bio-Patch Telemetry & Audio Alert',
                'quality' => 'VERIFIED',
                'notes' => 'Crew Medical Officer responded immediately. Commander placed in horizontal restraint.',
            ],
            [
                'uid' => 'EVT-120-1015-MED',
                'crew_id' => $alex->id,
                'cat' => 'health_observation',
                'title' => 'Post-Episode Stabilization & Saline Rehydration',
                'desc' => 'Oral rehydration salt solution (1000 mL) administered. BP stabilized to 106/68 mmHg, HR 82 bpm.',
                'day' => 120,
                'hour' => 10,
                'minute' => 15,
                'sev' => 'MODERATE',
                'val' => 106.0,
                'unit' => 'mmHg',
                'src' => 'Dr. Chen Clinical Sphygmomanometer',
                'quality' => 'VERIFIED',
                'notes' => 'Symptoms attenuating. Active duties suspended pending reconstruction and medical review.',
            ],
            [
                'uid' => 'EVT-119-1800-SEN',
                'crew_id' => $elena->id,
                'cat' => 'communication_quality',
                'title' => 'Biometric RF Telemetry Packet Loss',
                'desc' => 'Wearable patch transponder lost lock with cabin node 3. Telemetry offline. Status set to UNKNOWN.',
                'day' => 119,
                'hour' => 18,
                'minute' => 0,
                'sev' => 'MODERATE',
                'val' => null,
                'unit' => null,
                'src' => 'Cabin RF Node 3',
                'quality' => 'UNRELIABLE',
                'notes' => 'Diagnostic confidence penalized to 41%. Demonstrates missing data handling.',
            ],
        ];

        foreach ($events as $evt) {
            $evtDate = $baseDate->copy()->addDays($evt['day'])->addHours($evt['hour'])->addMinutes($evt['minute']);
            LedgerEvent::create([
                'event_uid' => $evt['uid'],
                'crew_member_id' => $evt['crew_id'],
                'event_category' => $evt['cat'],
                'title' => $evt['title'],
                'description' => $evt['desc'],
                'mission_day' => $evt['day'],
                'event_timestamp' => $evtDate,
                'recorded_timestamp' => $evtDate->copy()->addSeconds(rand(5, 45)),
                'severity' => $evt['sev'],
                'value' => $evt['val'],
                'unit' => $evt['unit'],
                'source' => $evt['src'],
                'data_provenance' => [
                    'sensor_model' => $evt['src'],
                    'calibration_status' => 'NOMINAL',
                    'transmission_protocol' => 'MIL-STD-1553B / BLE-SPACE',
                    'packet_integrity' => '100%',
                ],
                'confidence_score' => 0.96,
                'data_quality' => $evt['quality'],
                'is_synthetic' => true,
                'notes' => $evt['notes'],
            ]);
        }

        // 5. Incidents (Module E)
        $incidentTime = $baseDate->copy()->addDays(120)->addHours(9)->addMinutes(42);
        $incident = Incident::create([
            'incident_code' => 'INC-ARES4-120-001',
            'crew_member_id' => $alex->id,
            'incident_type' => 'orthostatic_dizziness',
            'title' => 'Acute Transient Orthostatic Dizziness and Presyncope Episode',
            'description' => 'Commander Alex Morgan experienced acute transient dizziness, visual tunneling, and postural instability at Day 120 09:42 UTC upon egress from the equipment deck. Correlated with 72-hour sleep debt, missed aerobic countermeasures, and transient baroreflex decoupling.',
            'mission_day' => 120,
            'incident_timestamp' => $incidentTime,
            'severity' => 'REVIEW_REQUIRED',
            'status' => 'INVESTIGATING',
            'reconstruction_summary' => [
                'primary_factors' => [
                    'Cumulative sleep curtailment (9.8 hours total deficit over Days 117-120)',
                    'Omission of daily cycle ergometer countermeasure on Day 119',
                    'Sympathetic autonomic strain (HRV RMSSD drop from 58ms to 27ms)',
                    'Mild elevated ambient CO2 exposure during equipment rearrangement (3.5 mmHg)',
                ],
                'preceding_chain' => [
                    ['time_offset' => '-72h', 'stage' => 'Onset', 'event' => 'Nighttime false alarm drill curtailed sleep to 5.4h.'],
                    ['time_offset' => '-48h', 'stage' => 'Progression', 'event' => 'Heavy workload; cycle ergometer abbreviated to 145W.'],
                    ['time_offset' => '-24h', 'stage' => 'Vulnerability', 'event' => 'Fatigue score 7/10, PVT degradation (310ms), exercise omitted.'],
                    ['time_offset' => '-0h', 'stage' => 'Trigger', 'event' => 'Rapid vertical postural translation during valve inspection causing transient cerebral hypoperfusion.'],
                ],
                'missing_data_notes' => [
                    'Direct continuous intravascular fluid volume measurement unavailable (surrogate: daily body mass & hydration logs).',
                    'Cerebral tissue oxygenation NIRS sensor was not worn during valve inspection.',
                ],
            ],
            'supporting_evidence_count' => 8,
            'missing_evidence_count' => 2,
        ]);

        $marcusIncidentTime = $baseDate->copy()->addDays(118)->addHours(19)->addMinutes(15);
        $incidentMarcus = Incident::create([
            'incident_code' => 'INC-ARES4-118-002',
            'crew_member_id' => $marcus->id,
            'incident_type' => 'workload_exhaustion_co2',
            'title' => 'Acute Workload Strain & Cephalic Tension Episode',
            'description' => 'Lead Flight Engineer Marcus Vance reported severe bilateral temporal throbbing headache, ocular fatigue, and mild disequilibrium during 12-hour continuous coolant loop maintenance under elevated cabin CO2 (3.5 mmHg).',
            'mission_day' => 118,
            'incident_timestamp' => $marcusIncidentTime,
            'severity' => 'WATCH',
            'status' => 'RESOLVED',
            'reconstruction_summary' => [
                'primary_factors' => [
                    'Extended physical maintenance shift (12.0 hours scheduled duty)',
                    'Elevated localized cabin CO2 in Node 2 (3.5 mmHg)',
                    'Mild sleep duration reduction (6.0h vs 7.5h baseline)',
                ],
                'preceding_chain' => [
                    ['time_offset' => '-24h', 'stage' => 'Shift Overtime', 'event' => 'Coolant loop maintenance extended by 3.5 hours.'],
                    ['time_offset' => '-6h', 'stage' => 'Environmental Exposure', 'event' => 'Cabin CO2 rose to 3.5 mmHg in Module B.'],
                    ['time_offset' => '-0h', 'stage' => 'Acute Cephalic Strain', 'event' => 'Reported temporal headache; resolved following 2h rest.'],
                ],
                'missing_data_notes' => [
                    'Continuous cerebral near-infrared spectroscopy was offline.',
                ],
            ],
            'supporting_evidence_count' => 5,
            'missing_evidence_count' => 1,
        ]);

        // 6. Countermeasure Scenarios (Module F)
        // Alex Morgan Scenarios
        CountermeasureScenario::create([
            'crew_member_id' => $alex->id,
            'incident_id' => $incident->id,
            'name' => 'Scenario Alpha: Sleep Restoration & Graded Aerobic Reconditioning',
            'description' => 'Restores sleep duration to 8.5 hours (+2.5h delta) for 48 hours, reduces non-critical flight workload by 35%, and initiates 2x 20-min low-intensity cycle ergometer sessions with oral fluid loading (1200 mL).',
            'inputs' => [
                'sleep_delta_hours' => 2.5,
                'workload_delta_pct' => -35,
                'cycle_ergometer_watts' => 140,
                'hydration_fluid_ml' => 1200,
                'ambient_co2_target_mmhg' => 2.0,
            ],
            'projections' => [
                'projected_hrv_rmssd' => 52.0,
                'projected_resting_hr' => 63.0,
                'projected_systolic_bp' => 114.0,
                'projected_pvt_latency_ms' => 228.0,
                'projected_fatigue_index' => 3.0,
                'time_to_stability_hours' => 36,
                'risk_recurrence_pct' => 14,
            ],
            'assumptions' => 'Assumes normal baroreflex re-adaptation following fluid loading and adequate sleep architecture without sleep apneas. Strictly synthetic mathematical simulation model.',
            'is_active' => true,
        ]);

        CountermeasureScenario::create([
            'crew_member_id' => $alex->id,
            'incident_id' => $incident->id,
            'name' => 'Scenario Bravo: Workload Maintenance with Pharmacological Sleep Aid',
            'description' => 'Maintains standard flight duties (-10% workload adjustment only) with zolpidem tartrate 5mg for sleep induction and aggressive compression garment use.',
            'inputs' => [
                'sleep_delta_hours' => 1.5,
                'workload_delta_pct' => -10,
                'cycle_ergometer_watts' => 160,
                'hydration_fluid_ml' => 800,
                'ambient_co2_target_mmhg' => 2.8,
            ],
            'projections' => [
                'projected_hrv_rmssd' => 41.0,
                'projected_resting_hr' => 68.0,
                'projected_systolic_bp' => 108.0,
                'projected_pvt_latency_ms' => 260.0,
                'projected_fatigue_index' => 5.2,
                'time_to_stability_hours' => 72,
                'risk_recurrence_pct' => 38,
            ],
            'assumptions' => 'Pharmacological sleep aids may introduce residual morning cognitive grogginess or affect rapid awakening readiness.',
            'is_active' => false,
        ]);

        // Dr. Sarah Chen Scenarios (CMO nominal homeostatic maintenance)
        CountermeasureScenario::create([
            'crew_member_id' => $sarah->id,
            'incident_id' => null,
            'name' => 'Scenario Alpha: Expanded Medical Duty & Circadian Stability',
            'description' => 'Covers Commander Morgan clinical checkouts (+15% workload) with circadian sleep buffer (+0.5h) and maintenance fluid intake (600 mL).',
            'inputs' => [
                'sleep_delta_hours' => 0.5,
                'workload_delta_pct' => 15,
                'cycle_ergometer_watts' => 175,
                'hydration_fluid_ml' => 600,
                'ambient_co2_target_mmhg' => 2.2,
            ],
            'projections' => [
                'projected_hrv_rmssd' => 61.0,
                'projected_resting_hr' => 58.0,
                'projected_systolic_bp' => 113.0,
                'projected_pvt_latency_ms' => 210.0,
                'projected_fatigue_index' => 2.2,
                'time_to_stability_hours' => 18,
                'risk_recurrence_pct' => 6,
            ],
            'assumptions' => 'Demonstrates stable physiological adaptation under elevated clinical triage responsibility.',
            'is_active' => true,
        ]);

        CountermeasureScenario::create([
            'crew_member_id' => $sarah->id,
            'incident_id' => null,
            'name' => 'Scenario Bravo: High-Intensity Aerobic VO2-Max Preservation',
            'description' => 'Targeted 195W ergometer training block with 1000 mL hydration loading to preserve peak cardiovascular reserve for Mars orbital insertion.',
            'inputs' => [
                'sleep_delta_hours' => 1.0,
                'workload_delta_pct' => 0,
                'cycle_ergometer_watts' => 195,
                'hydration_fluid_ml' => 1000,
                'ambient_co2_target_mmhg' => 2.0,
            ],
            'projections' => [
                'projected_hrv_rmssd' => 66.0,
                'projected_resting_hr' => 55.0,
                'projected_systolic_bp' => 112.0,
                'projected_pvt_latency_ms' => 205.0,
                'projected_fatigue_index' => 1.8,
                'time_to_stability_hours' => 12,
                'risk_recurrence_pct' => 4,
            ],
            'assumptions' => 'Peak aerobic countermeasure profile maintains vagal tone and plasma volume.',
            'is_active' => false,
        ]);

        // Marcus Vance Scenarios (ECLSS & Maintenance Overhaul Recovery)
        CountermeasureScenario::create([
            'crew_member_id' => $marcus->id,
            'incident_id' => $incidentMarcus->id,
            'name' => 'Scenario Alpha: ECLSS Scrubbing & Workload Relief',
            'description' => 'Cabin CO2 active scrubbing to <1.8 mmHg, 30% reduction in manual overhaul shift, and +2.0h sleep restoration.',
            'inputs' => [
                'sleep_delta_hours' => 2.0,
                'workload_delta_pct' => -30,
                'cycle_ergometer_watts' => 150,
                'hydration_fluid_ml' => 800,
                'ambient_co2_target_mmhg' => 1.8,
            ],
            'projections' => [
                'projected_hrv_rmssd' => 50.0,
                'projected_resting_hr' => 64.0,
                'projected_systolic_bp' => 121.0,
                'projected_pvt_latency_ms' => 226.0,
                'projected_fatigue_index' => 2.8,
                'time_to_stability_hours' => 24,
                'risk_recurrence_pct' => 12,
            ],
            'assumptions' => 'Rapid clearance of hypercapnic vasodilation upon local ventilation increase and shift limitation.',
            'is_active' => true,
        ]);

        CountermeasureScenario::create([
            'crew_member_id' => $marcus->id,
            'incident_id' => $incidentMarcus->id,
            'name' => 'Scenario Bravo: Split-Shift Rotation with Ergo Aerobics',
            'description' => 'Split 6h maintenance shifts with interleaved cycle ergometer sessions to stimulate pulmonary gas exchange.',
            'inputs' => [
                'sleep_delta_hours' => 1.0,
                'workload_delta_pct' => -15,
                'cycle_ergometer_watts' => 165,
                'hydration_fluid_ml' => 600,
                'ambient_co2_target_mmhg' => 2.2,
            ],
            'projections' => [
                'projected_hrv_rmssd' => 47.0,
                'projected_resting_hr' => 66.0,
                'projected_systolic_bp' => 123.0,
                'projected_pvt_latency_ms' => 238.0,
                'projected_fatigue_index' => 3.9,
                'time_to_stability_hours' => 42,
                'risk_recurrence_pct' => 26,
            ],
            'assumptions' => 'Split-shift avoids prolonged sustained exertion in confined node compartments.',
            'is_active' => false,
        ]);

        // Elena Rostova Scenarios (Sensor Re-calibration & Science Duty)
        CountermeasureScenario::create([
            'crew_member_id' => $elena->id,
            'incident_id' => null,
            'name' => 'Scenario Alpha: Biosensor Re-Calibration & Hydration Protocol',
            'description' => 'Patch electrode re-coupling window with nominal geology payload analysis, +1.0h sleep, and 750 mL oral hydration.',
            'inputs' => [
                'sleep_delta_hours' => 1.0,
                'workload_delta_pct' => -10,
                'cycle_ergometer_watts' => 155,
                'hydration_fluid_ml' => 750,
                'ambient_co2_target_mmhg' => 2.1,
            ],
            'projections' => [
                'projected_hrv_rmssd' => 56.0,
                'projected_resting_hr' => 61.0,
                'projected_systolic_bp' => 116.0,
                'projected_pvt_latency_ms' => 216.0,
                'projected_fatigue_index' => 2.2,
                'time_to_stability_hours' => 16,
                'risk_recurrence_pct' => 8,
            ],
            'assumptions' => 'Restores telemetry confidence score from UNKNOWN to STABLE upon sensor re-acquisition.',
            'is_active' => true,
        ]);

        CountermeasureScenario::create([
            'crew_member_id' => $elena->id,
            'incident_id' => null,
            'name' => 'Scenario Bravo: Core Sample Glovebox High-Workload Shift',
            'description' => 'Simulate prolonged glovebox rock sample analysis with +20% workload and countermeasure hydration.',
            'inputs' => [
                'sleep_delta_hours' => 0.0,
                'workload_delta_pct' => 20,
                'cycle_ergometer_watts' => 170,
                'hydration_fluid_ml' => 900,
                'ambient_co2_target_mmhg' => 2.5,
            ],
            'projections' => [
                'projected_hrv_rmssd' => 51.0,
                'projected_resting_hr' => 65.0,
                'projected_systolic_bp' => 117.0,
                'projected_pvt_latency_ms' => 229.0,
                'projected_fatigue_index' => 3.6,
                'time_to_stability_hours' => 28,
                'risk_recurrence_pct' => 18,
            ],
            'assumptions' => 'Evaluates astronaut cognitive reserve under intensive glovebox science operations.',
            'is_active' => false,
        ]);

        // 7. Ground Communications Drafts (Module H)
        GroundCommunication::create([
            'packet_id' => 'GND-COM-ARES4-120-001',
            'crew_member_id' => $alex->id,
            'incident_id' => $incident->id,
            'title' => 'Clinical & Operational Incident Brief: Commander Alex Morgan Day 120 Presyncope',
            'clinical_summary' => 'On Mission Day 120 at 09:42 MET, Commander Morgan experienced a transient orthostatic presyncope episode during rapid positional transfer in Airlock Node. Multi-day timeline analysis reconstructs a 9.8-hour cumulative sleep deficit, an omitted cycle ergometer countermeasure session, and elevated sympathetic drive as converging predisposing factors.',
            'sbar_situation' => 'Commander Alex Morgan (42yo female) suffered a transient near-syncopal episode with documented blood pressure drop to 88/56 mmHg and reflex tachycardia of 118 bpm. Patient is currently conscious, oriented x4, and resting in crew quarters.',
            'sbar_background' => 'Baseline resting HR 60 bpm, BP 118/76 mmHg. Over the past 72 hours, night-time emergency drills and heavy cargo stowage tasks resulted in sleep curtailment (5.4h, 4.9h, 5.1h vs 8.0h baseline). Day 119 aerobic countermeasure was missed.',
            'sbar_assessment' => 'Probable multi-factorial neuro-vascular and autonomic decompensation: orthostatic hypotension secondary to microgravity cephalad fluid redistribution, exacerbated by acute-on-chronic sleep deprivation and skipped cardiovascular countermeasure.',
            'sbar_recommendation' => 'Request ground flight surgeon concurrence on Scenario Alpha: 36-hour light duty schedule, mandatory 8.5h sleep window, 1200 mL oral electrolyte loading, and resumption of graded cycle ergometer exercise at 140W under telemetry supervision.',
            'evidence_ledger_ids' => [
                'EVT-117-0630-SLP',
                'EVT-118-0615-SLP',
                'EVT-118-1015-EXE',
                'EVT-119-0630-SLP',
                'EVT-119-1000-EXE',
                'EVT-119-1520-MED',
                'EVT-120-0942-INC'
            ],
            'data_limitations' => 'No continuous transcranial Doppler or NIRS cerebral oximetry was recorded during the acute event. Intravascular volume estimated from hydration logs rather than direct measurement.',
            'questions_for_ground' => '1. Does Flight Surgeon concur with resuming ARED resistance exercise at Day 121 or delay until Day 122? 2. Should midodrine or fludrocortisone be considered if orthostatic stability is not regained within 48h?',
            'review_priority' => 'PRIORITY',
            'sync_status' => 'QUEUED_LOCAL',
            'transmitted_at' => null,
        ]);

        // 8. Sync Telemetry (Module G)
        SyncTelemetry::create([
            'last_successful_sync_at' => $baseDate->copy()->addDays(119)->addHours(20)->addMinutes(58),
            'queued_items_count' => 14,
            'earth_link_state' => 'LOSS_OF_SIGNAL',
            'round_trip_latency_sec' => 2520, // 42 min round trip
            'local_db_integrity_pct' => 100.0,
            'offline_mode_active' => true,
        ]);
    }
}
