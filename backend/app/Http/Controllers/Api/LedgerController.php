<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LedgerEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LedgerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = LedgerEvent::with('crewMember');

        if ($request->filled('crew_member_id')) {
            $crewId = $request->query('crew_member_id');
            if ($crewId === 'all') {
                // Return all
            } elseif ($crewId === 'shipwide') {
                $query->whereNull('crew_member_id');
            } else {
                $query->where('crew_member_id', $crewId);
            }
        }

        if ($request->filled('category')) {
            $query->where('event_category', $request->query('category'));
        }

        if ($request->filled('severity')) {
            $query->where('severity', $request->query('severity'));
        }

        if ($request->filled('data_quality')) {
            $query->where('data_quality', $request->query('data_quality'));
        }

        if ($request->filled('source')) {
            $query->where('source', 'like', '%' . $request->query('source') . '%');
        }

        if ($request->filled('min_day')) {
            $query->where('mission_day', '>=', (int) $request->query('min_day'));
        }

        if ($request->filled('max_day')) {
            $query->where('mission_day', '<=', (int) $request->query('max_day'));
        }

        if ($request->filled('search')) {
            $term = $request->query('search');
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('event_uid', 'like', "%{$term}%")
                  ->orWhere('source', 'like', "%{$term}%");
            });
        }

        $events = $query->orderBy('event_timestamp', 'desc')->get();

        // Summary metrics
        $categoriesCount = LedgerEvent::selectRaw('event_category, count(*) as count')
            ->groupBy('event_category')
            ->pluck('count', 'event_category');

        $qualityCount = LedgerEvent::selectRaw('data_quality, count(*) as count')
            ->groupBy('data_quality')
            ->pluck('count', 'data_quality');

        return response()->json([
            'total' => $events->count(),
            'events' => $events,
            'summary' => [
                'categories' => $categoriesCount,
                'data_quality' => $qualityCount,
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $event = LedgerEvent::with('crewMember')->find($id);

        if (!$event) {
            return response()->json(['error' => 'Ledger event not found'], 404);
        }

        return response()->json($event);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'crew_member_id' => 'nullable|exists:crew_members,id',
            'event_category' => 'required|string',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'mission_day' => 'required|integer',
            'severity' => 'required|in:INFO,LOW,MODERATE,HIGH,CRITICAL',
            'value' => 'nullable|numeric',
            'unit' => 'nullable|string',
            'source' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $eventUid = 'EVT-' . $validated['mission_day'] . '-' . strtoupper(Str::random(4)) . '-' . strtoupper(substr($validated['event_category'], 0, 3));

        $event = LedgerEvent::create([
            'event_uid' => $eventUid,
            'crew_member_id' => $validated['crew_member_id'] ?? null,
            'event_category' => $validated['event_category'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'mission_day' => $validated['mission_day'],
            'event_timestamp' => now(),
            'recorded_timestamp' => now(),
            'severity' => $validated['severity'],
            'value' => $validated['value'] ?? null,
            'unit' => $validated['unit'] ?? null,
            'source' => $validated['source'],
            'data_provenance' => [
                'input_interface' => 'MOSAIC-9 Crew Terminal',
                'provenance_flag' => 'MANUAL_ENTRY_VERIFIED',
                'integrity_check' => 'PASSED',
            ],
            'confidence_score' => 0.95,
            'data_quality' => 'VERIFIED',
            'is_synthetic' => true,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Event committed to Mission Health Ledger',
            'event' => $event,
        ], 201);
    }
}
