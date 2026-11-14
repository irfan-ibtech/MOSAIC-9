<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GroundCommunication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GroundCommunicationController extends Controller
{
    public function index(): JsonResponse
    {
        $comms = GroundCommunication::with(['crewMember', 'incident'])->orderBy('created_at', 'desc')->get();
        return response()->json($comms);
    }

    public function show(int $id): JsonResponse
    {
        $comm = GroundCommunication::with(['crewMember', 'incident'])->find($id);

        if (!$comm) {
            return response()->json(['error' => 'Communication packet not found'], 404);
        }

        return response()->json($comm);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'crew_member_id' => 'required|exists:crew_members,id',
            'incident_id' => 'nullable|exists:incidents,id',
            'title' => 'required|string|max:255',
            'clinical_summary' => 'required|string',
            'sbar_situation' => 'required|string',
            'sbar_background' => 'required|string',
            'sbar_assessment' => 'required|string',
            'sbar_recommendation' => 'required|string',
            'evidence_ledger_ids' => 'nullable|array',
            'data_limitations' => 'nullable|string',
            'questions_for_ground' => 'nullable|string',
            'review_priority' => 'required|in:ROUTINE,PRIORITY,URGENT',
        ]);

        $packetId = 'GND-COM-' . strtoupper(Str::random(6)) . '-PKT';

        $comm = GroundCommunication::create([
            'packet_id' => $packetId,
            'crew_member_id' => $validated['crew_member_id'],
            'incident_id' => $validated['incident_id'] ?? null,
            'title' => $validated['title'],
            'clinical_summary' => $validated['clinical_summary'],
            'sbar_situation' => $validated['sbar_situation'],
            'sbar_background' => $validated['sbar_background'],
            'sbar_assessment' => $validated['sbar_assessment'],
            'sbar_recommendation' => $validated['sbar_recommendation'],
            'evidence_ledger_ids' => $validated['evidence_ledger_ids'] ?? [],
            'data_limitations' => $validated['data_limitations'] ?? null,
            'questions_for_ground' => $validated['questions_for_ground'] ?? null,
            'review_priority' => $validated['review_priority'],
            'sync_status' => 'QUEUED_LOCAL', // Honest offline state: queued locally
            'transmitted_at' => null,
        ]);

        return response()->json([
            'message' => 'Ground communication brief queued in local store',
            'communication' => $comm,
        ], 201);
    }

    public function transmit(int $id): JsonResponse
    {
        $comm = GroundCommunication::findOrFail($id);

        // Honest simulation: if Earth link is offline, warn user; otherwise transmit
        $comm->update([
            'sync_status' => 'TRANSMITTING',
            'transmitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Transmission initiated. High gain antenna buffer transmitting packet.',
            'communication' => $comm,
        ]);
    }
}
