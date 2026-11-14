<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrewMember;
use App\Models\HealthObservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrewController extends Controller
{
    public function index(): JsonResponse
    {
        $crew = CrewMember::withCount(['incidents', 'healthObservations', 'ledgerEvents'])->get();
        return response()->json($crew);
    }

    public function show(int $id): JsonResponse
    {
        $member = CrewMember::with(['incidents', 'scenarios', 'groundCommunications'])->find($id);

        if (!$member) {
            return response()->json(['error' => 'Crew member not found'], 404);
        }

        // Domain detailed summary
        $domains = [
            'cardiovascular' => [
                'name' => 'Cardiovascular & Autonomic Regulation',
                'status' => $member->domain_status['cardiovascular']['status'] ?? 'UNKNOWN',
                'summary' => $member->domain_status['cardiovascular']['summary'] ?? 'No data',
                'completeness' => $member->overall_data_completeness,
                'confidence' => $member->overall_confidence_score,
                'key_metrics' => [
                    'resting_hr' => ['baseline' => $member->baseline_profile['resting_heart_rate'] ?? 60, 'unit' => 'bpm'],
                    'hrv_rmssd' => ['baseline' => $member->baseline_profile['hrv_rmssd'] ?? 58, 'unit' => 'ms'],
                    'systolic_bp' => ['baseline' => $member->baseline_profile['systolic_bp'] ?? 118, 'unit' => 'mmHg'],
                ],
            ],
            'musculoskeletal' => [
                'name' => 'Musculoskeletal & Countermeasure Compliance',
                'status' => $member->domain_status['musculoskeletal']['status'] ?? 'UNKNOWN',
                'summary' => $member->domain_status['musculoskeletal']['summary'] ?? 'No data',
                'completeness' => $member->overall_data_completeness,
                'confidence' => $member->overall_confidence_score,
                'key_metrics' => [
                    'cycle_target' => ['baseline' => $member->baseline_profile['exercise_target_watts'] ?? 185, 'unit' => 'W'],
                    'vo2_max_est' => ['baseline' => $member->baseline_profile['vo2_max_est'] ?? 50.0, 'unit' => 'mL/kg/min'],
                ],
            ],
            'neuro_cognitive_sleep' => [
                'name' => 'Sleep, Fatigue & Neurocognitive State',
                'status' => $member->domain_status['neuro_cognitive_sleep']['status'] ?? 'UNKNOWN',
                'summary' => $member->domain_status['neuro_cognitive_sleep']['summary'] ?? 'No data',
                'completeness' => $member->overall_data_completeness,
                'confidence' => $member->overall_confidence_score,
                'key_metrics' => [
                    'sleep_target' => ['baseline' => $member->baseline_profile['sleep_target_hours'] ?? 8.0, 'unit' => 'hours'],
                    'pvt_reaction' => ['baseline' => $member->baseline_profile['pvt_reaction_time_ms'] ?? 215, 'unit' => 'ms'],
                ],
            ],
            'radiation_environment' => [
                'name' => 'Radiation Exposure & Habitation Environment',
                'status' => $member->domain_status['radiation_environment']['status'] ?? 'UNKNOWN',
                'summary' => $member->domain_status['radiation_environment']['summary'] ?? 'No data',
                'completeness' => $member->overall_data_completeness,
                'confidence' => $member->overall_confidence_score,
                'key_metrics' => [
                    'cumulative_dose' => ['baseline' => $member->baseline_profile['cumulative_radiation_msv'] ?? 140, 'unit' => 'mSv'],
                ],
            ],
        ];

        return response()->json([
            'crew_member' => $member,
            'domains' => $domains,
        ]);
    }

    public function observations(int $id, Request $request): JsonResponse
    {
        $query = HealthObservation::where('crew_member_id', $id);

        if ($request->has('domain')) {
            $query->where('domain', $request->query('domain'));
        }

        if ($request->has('metric_name')) {
            $query->where('metric_name', $request->query('metric_name'));
        }

        if ($request->has('min_day')) {
            $query->where('mission_day', '>=', (int) $request->query('min_day'));
        }

        if ($request->has('max_day')) {
            $query->where('mission_day', '<=', (int) $request->query('max_day'));
        }

        $observations = $query->orderBy('timestamp', 'asc')->get();

        return response()->json([
            'crew_member_id' => $id,
            'count' => $observations->count(),
            'observations' => $observations,
        ]);
    }
}
