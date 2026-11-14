<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\LedgerEvent;
use App\Models\HealthObservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    public function index(): JsonResponse
    {
        $incidents = Incident::with('crewMember')->orderBy('incident_timestamp', 'desc')->get();
        return response()->json($incidents);
    }

    public function show(int $id): JsonResponse
    {
        $incident = Incident::with(['crewMember', 'scenarios', 'groundCommunications'])->find($id);

        if (!$incident) {
            return response()->json(['error' => 'Incident record not found'], 404);
        }

        return response()->json($incident);
    }

    public function reconstruct(int $id, Request $request): JsonResponse
    {
        $incident = Incident::with('crewMember')->find($id);

        if (!$incident) {
            return response()->json(['error' => 'Incident not found'], 404);
        }

        // Horizon window in hours (default 72h, options: 6, 24, 72, 168)
        $horizonHours = (int) $request->query('horizon_hours', 72);
        $incidentTime = $incident->incident_timestamp;
        $startTime = $incidentTime->copy()->subHours($horizonHours);

        // Fetch preceding ledger events for this crew member & shipwide within the window
        $events = LedgerEvent::where(function ($query) use ($incident) {
                $query->where('crew_member_id', $incident->crew_member_id)
                      ->orWhereNull('crew_member_id');
            })
            ->where('event_timestamp', '>=', $startTime)
            ->where('event_timestamp', '<=', $incidentTime)
            ->orderBy('event_timestamp', 'asc')
            ->get();

        // Categorize evidence according to MOSAIC-9 scientific taxonomy:
        // OBSERVED FACT, DERIVED INDICATOR, TEMPORAL ASSOCIATION, POSSIBLE EXPLANATION, MISSING EVIDENCE, RECOMMENDED REVIEW
        $evidenceNodes = [];

        $taxonomyV2 = NasaEvidenceController::getTaxonomyV2();

        foreach ($events as $event) {
            $classification = 'OBSERVED_FACT';
            $taxonomyTier = 'DIRECT_OBSERVATION';
            $reasoning = 'Direct primary sensor record.';

            if (in_array($event->event_category, ['sleep_observation', 'workload_observation'])) {
                $classification = 'DERIVED_INDICATOR';
                $taxonomyTier = 'DERIVED_TEMPORAL_ASSOCIATION';
                $reasoning = 'Algorithmic calculation from raw bunk micro-movement & task scheduler.';
            } elseif ($event->event_category === 'symptom_report' && $event->severity !== 'CRITICAL') {
                $classification = 'OBSERVED_FACT';
                $taxonomyTier = 'DIRECT_OBSERVATION';
                $reasoning = 'Self-reported subjective symptom logged by crew member.';
            } elseif ($event->severity === 'CRITICAL') {
                $classification = 'OBSERVED_FACT';
                $taxonomyTier = 'DIRECT_OBSERVATION';
                $reasoning = 'Target acute incident event.';
            } elseif ($event->event_category === 'environmental_event') {
                $classification = 'TEMPORAL_ASSOCIATION';
                $taxonomyTier = 'DERIVED_TEMPORAL_ASSOCIATION';
                $reasoning = 'Ambient environmental factor coinciding with crew timeline.';
            }

            $evidenceNodes[] = [
                'event_id' => $event->id,
                'event_uid' => $event->event_uid,
                'title' => $event->title,
                'category' => $event->event_category,
                'timestamp' => $event->event_timestamp->toIso8601String(),
                'relative_hours' => round($event->event_timestamp->diffInMinutes($incidentTime, false) / 60, 1),
                'value' => $event->value,
                'unit' => $event->unit,
                'classification' => $classification,
                'taxonomy_v2' => $taxonomyTier,
                'source_attribution' => $taxonomyV2[$taxonomyTier]['source_attribution'],
                'applicability_level' => $taxonomyV2[$taxonomyTier]['applicability_level'],
                'limitations' => $taxonomyV2[$taxonomyTier]['limitations'],
                'reasoning' => $reasoning,
                'confidence' => $event->confidence_score,
                'data_quality' => $event->data_quality,
            ];
        }

        // Add explicit Missing Evidence nodes (Crucial MOSAIC-9 scientific principle!)
        if ($incident->incident_code === 'INC-ARES4-118-002') {
            $missingEvidence = [
                [
                    'node_type' => 'MISSING_EVIDENCE',
                    'title' => 'Continuous Cerebral Near-Infrared Spectroscopy (NIRS)',
                    'description' => 'Cerebral tissue oxygenation sensor was not worn during the 12-hour coolant loop overhaul.',
                    'impact_on_confidence' => 'Precludes optical confirmation of localized cerebral vasodilation vs simple tension headache. Confidence score: 89%.',
                    'suggested_investigation' => 'Deploy portable NIRS sensor during subsequent high-workload repairs.',
                ],
                [
                    'node_type' => 'MISSING_EVIDENCE',
                    'title' => 'Localized Micro-Dosimetry in Coolant Bay',
                    'description' => 'Personal dosimeter was logged as transit corridor average rather than localized near shield sector B.',
                    'impact_on_confidence' => 'Unconfirmed whether secondary scatter contributed to ocular fatigue.',
                    'suggested_investigation' => 'Inspect passive thermoluminescent dosimeter badge mounted on coolant rack.',
                ],
            ];

            $hypotheses = [
                [
                    'hypothesis_id' => 'HYP-MV-01',
                    'type' => 'POSSIBLE_EXPLANATION',
                    'title' => 'Hypercapnic and Ergonomic Cephalic Strain',
                    'plausibility' => 'HIGH (Heuristic Ranking: 0.85)',
                    'supporting_facts' => [
                        '12-hour continuous manual maintenance shift in confined Node 2.',
                        'Cabin CO2 elevated locally to 3.5 mmHg during maintenance.',
                        'Mild sleep duration reduction (6.0h vs 7.5h baseline).',
                    ],
                    'counter_evidence' => 'Systemic blood pressure was normal (124/80 mmHg).',
                    'scientific_boundary' => 'Association between elevated CO2 and cephalic headache is documented in microgravity literature, but definitive mechanistic proof requires biochemical or invasive intracranial monitoring.',
                ],
                [
                    'hypothesis_id' => 'HYP-MV-02',
                    'type' => 'POSSIBLE_EXPLANATION',
                    'title' => 'Autonomic Circadian Disruption from Shift Extension',
                    'plausibility' => 'MODERATE (Heuristic Ranking: 0.60)',
                    'supporting_facts' => [
                        'Overtime shift delayed sleep window into the next mission day.',
                    ],
                    'counter_evidence' => 'Resting HR of 66 bpm was within acceptable bounds.',
                    'scientific_boundary' => 'Circadian misalignment exacerbates physical fatigue but does not fully account for acute temporal cephalalgia alone.',
                ],
            ];

            $recommendedReviews = [
                'Immediate: Mandatory 8-hour uninterrupted rest cycle in Crew Quarters with cabin CO2 scrubbed to < 2.0 mmHg.',
                'Operational: Enforce strict 8-hour daily cap on pressurized manual maintenance tasks.',
                'Medical: Re-evaluate neurological symptoms (visual acuity and pupillary reflex) at Day 119 morning checkout.',
                'Environmental: Verify ECLSS Node 2 air circulation duct velocity to prevent local pocket stagnation.',
            ];
        } else {
            $missingEvidence = [
                [
                    'node_type' => 'MISSING_EVIDENCE',
                    'title' => 'Intravascular Fluid Volume Direct Telemetry',
                    'description' => 'Direct continuous hematocrit / plasma volume measurement was not acquired prior to the event. Hypovolemia inferred from indirect hydration logs.',
                    'impact_on_confidence' => 'Reduces certainty of primary hypovolemic vs neurogenic origin from 98% to 88%.',
                    'suggested_investigation' => 'Perform ultrasound assessment of inferior vena cava collapsibility index.',
                ],
                [
                    'node_type' => 'MISSING_EVIDENCE',
                    'title' => 'Cerebral Tissue Oxygenation (NIRS)',
                    'description' => 'Forehead near-infrared spectroscopy patch was not active during equipment bay transit.',
                    'impact_on_confidence' => 'Cerebral perfusion drop during transition confirmed via symptoms and blood pressure collapse, but microvascular brain tissue oxygenation is inferred.',
                    'suggested_investigation' => 'Review transcranial Doppler flow velocity if orthostatic challenge is repeated.',
                ],
            ];

            $hypotheses = [
                [
                    'hypothesis_id' => 'HYP-01',
                    'type' => 'POSSIBLE_EXPLANATION',
                    'title' => 'Deconditioning-Exacerbated Baroreflex Decompensation',
                    'plausibility' => 'HIGH (Heuristic Ranking: 0.88)',
                    'supporting_facts' => [
                        '72-hour sleep debt of 9.8 hours coincided with a drop in HRV RMSSD from 58ms to 27ms, indicating altered autonomic tone.',
                        'Missed cycle ergometer session on Day 119 eliminated expected daily cardiovascular baroreceptor conditioning.',
                        'Rapid vertical translation in microgravity challenged fluid redistribution.',
                    ],
                    'counter_evidence' => 'No prior orthostatic intolerance during initial mission weeks.',
                    'scientific_boundary' => 'Observed temporal sequence demonstrates strong association, but definitive physiological causality cannot be established without invasive hemodynamic monitoring.',
                ],
                [
                    'hypothesis_id' => 'HYP-02',
                    'type' => 'POSSIBLE_EXPLANATION',
                    'title' => 'Mild CO2 Induced Cephalic Vasodilation',
                    'plausibility' => 'MODERATE (Heuristic Ranking: 0.62)',
                    'supporting_facts' => [
                        'Cabin CO2 elevated to 3.5 mmHg during cargo movements in Module B.',
                    ],
                    'counter_evidence' => 'CO2 concentration remained below acute toxicity threshold (< 5.0 mmHg).',
                    'scientific_boundary' => 'Elevated CO2 is a known sensitizer in microgravity but unlikely to be the sole trigger.',
                ],
            ];

            $recommendedReviews = [
                'Immediate: Enforce 24-48h light-duty operational restriction on Commander Alex Morgan.',
                'Countermeasure: Initiate Oral Rehydration Salts protocol (1200 mL saline equivalent) prior to upright tasks.',
                'Diagnostic: Measure orthostatic vital signs (lying vs stand test) with continuous arterial tonometry when safe.',
                'Ground Review: Transmit structured SBAR packet GND-COM-ARES4-120-001 once Earth link is re-established.',
            ];
        }

        $evidenceGraph = NasaEvidenceController::buildEvidenceGraphForIncident(
            $incident,
            $evidenceNodes,
            $hypotheses,
            $missingEvidence
        );

        return response()->json([
            'incident' => $incident,
            'horizon_hours' => $horizonHours,
            'timeline_window' => [
                'start' => $startTime->toIso8601String(),
                'incident' => $incidentTime->toIso8601String(),
            ],
            'evidence_nodes' => $evidenceNodes,
            'missing_evidence' => $missingEvidence,
            'hypotheses' => $hypotheses,
            'recommended_reviews' => $recommendedReviews,
            'evidence_taxonomy_v2' => $taxonomyV2,
            'nasa_research_context' => NasaEvidenceController::getCuratedStudies(),
            'evidence_graph' => $evidenceGraph,
            'scientific_disclaimer' => 'MOSAIC-9 outputs are experimental temporal reconstructions designed for mission intelligence. They do not constitute formal diagnostic medical determinations.',
        ]);
    }
}
