<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SyncTelemetry;
use App\Models\GroundCommunication;
use App\Models\Mission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    public function status(): JsonResponse
    {
        $sync = SyncTelemetry::first();
        if (!$sync) {
            $sync = SyncTelemetry::create([
                'last_successful_sync_at' => now()->subHours(18),
                'queued_items_count' => GroundCommunication::where('sync_status', 'QUEUED_LOCAL')->count(),
                'earth_link_state' => 'LOSS_OF_SIGNAL',
                'round_trip_latency_sec' => 2520,
                'local_db_integrity_pct' => 100.0,
                'offline_mode_active' => true,
            ]);
        }

        $queuedCount = GroundCommunication::where('sync_status', 'QUEUED_LOCAL')->count();
        $sync->update(['queued_items_count' => $queuedCount]);

        return response()->json([
            'sync_telemetry' => $sync,
            'storage_stats' => [
                'local_sqlite_status' => 'HEALTHY',
                'pwa_cache_state' => 'ACTIVE',
                'uncommitted_queue_length' => $queuedCount,
                'last_contact_minutes_ago' => $sync->last_successful_sync_at ? now()->diffInMinutes($sync->last_successful_sync_at) : 1080,
            ],
        ]);
    }

    public function triggerSync(Request $request): JsonResponse
    {
        $sync = SyncTelemetry::firstOrFail();

        if ($sync->earth_link_state === 'LOSS_OF_SIGNAL') {
            return response()->json([
                'success' => false,
                'message' => 'Synchronization failed: Deep Space Network link is currently in LOSS_OF_SIGNAL due to planetary occultation.',
                'retry_after_minutes' => 740,
                'sync_telemetry' => $sync,
            ], 503);
        }

        // If link established, flush queued items
        GroundCommunication::where('sync_status', 'QUEUED_LOCAL')
            ->update([
                'sync_status' => 'DELIVERED',
                'transmitted_at' => now(),
            ]);

        $sync->update([
            'last_successful_sync_at' => now(),
            'queued_items_count' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ground synchronization completed successfully. Telemetry and communications delivered to Houston Flight Operations.',
            'sync_telemetry' => $sync,
        ]);
    }

    public function toggleLink(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'state' => 'required|in:LOSS_OF_SIGNAL,DEGRADED_COMM,HIGH_GAIN_ESTABLISHED',
        ]);

        $sync = SyncTelemetry::firstOrFail();
        $sync->update([
            'earth_link_state' => $validated['state'],
            'offline_mode_active' => ($validated['state'] !== 'HIGH_GAIN_ESTABLISHED'),
        ]);

        $mission = Mission::first();
        if ($mission) {
            $missionStatus = match($validated['state']) {
                'HIGH_GAIN_ESTABLISHED' => 'CONNECTED',
                'DEGRADED_COMM' => 'DEGRADED',
                default => 'OFFLINE',
            };
            $mission->update(['earth_comm_status' => $missionStatus]);
        }

        return response()->json([
            'message' => "Earth communication link state set to {$validated['state']}",
            'sync_telemetry' => $sync,
        ]);
    }
}
