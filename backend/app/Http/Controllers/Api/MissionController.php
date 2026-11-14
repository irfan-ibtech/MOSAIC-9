<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\CrewMember;
use App\Models\Incident;
use App\Models\LedgerEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MissionController extends Controller
{
    public function show(): JsonResponse
    {
        $mission = Mission::with('crewMembers')->first();

        if (!$mission) {
            return response()->json(['error' => 'Mission not initialized'], 404);
        }

        $activeIncidentsCount = Incident::where('status', '!=', 'RESOLVED')->count();
        $recentEvents = LedgerEvent::latest('event_timestamp')->take(5)->get();

        // Calculate crew health overview
        $crewOverview = [
            'total' => $mission->crewMembers->count(),
            'stable' => $mission->crewMembers->where('status', 'STABLE')->count(),
            'watch' => $mission->crewMembers->where('status', 'WATCH')->count(),
            'review_required' => $mission->crewMembers->where('status', 'REVIEW_REQUIRED')->count(),
            'unknown' => $mission->crewMembers->where('status', 'UNKNOWN')->count(),
        ];

        return response()->json([
            'mission' => $mission,
            'crew_overview' => $crewOverview,
            'active_incidents_count' => $activeIncidentsCount,
            'recent_events' => $recentEvents,
            'data_freshness_seconds' => 45,
            'overall_telemetry_health' => 'DEGRADED_COMM_LINK',
            'server_timestamp' => now()->toIso8601String(),
        ]);
    }

    public function updateStatus(Request $request): JsonResponse
    {
        $mission = Mission::firstOrFail();
        $validated = $request->validate([
            'earth_comm_status' => 'sometimes|in:OFFLINE,DEGRADED,CONNECTED',
            'cabin_pressure_kpa' => 'sometimes|numeric',
            'cabin_co2_mmhg' => 'sometimes|numeric',
        ]);

        $mission->update($validated);

        return response()->json(['message' => 'Mission status updated', 'mission' => $mission]);
    }
}
