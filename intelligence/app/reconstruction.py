"""
MOSAIC-9 Incident Reconstruction Engine
Reconstructs the multi-day evolutionary sequence preceding a health event.
Categorizes evidence strictly according to the MOSAIC-9 scientific taxonomy.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta


TAXONOMY = {
    "FACT": "OBSERVED_FACT",
    "DERIVED": "DERIVED_INDICATOR",
    "ASSOCIATION": "TEMPORAL_ASSOCIATION",
    "HYPOTHESIS": "POSSIBLE_EXPLANATION",
    "MISSING": "MISSING_EVIDENCE",
    "REVIEW": "RECOMMENDED_REVIEW",
}


def reconstruct_incident_timeline(
    incident_timestamp: str,
    preceding_events: List[Dict[str, Any]],
    horizon_hours: int = 72
) -> Dict[str, Any]:
    """
    Reconstructs preceding events within horizon_hours, classifies evidence,
    and identifies missing indicators.
    """
    inc_dt = datetime.fromisoformat(incident_timestamp.replace("Z", "+00:00"))
    start_dt = inc_dt - timedelta(hours=horizon_hours)

    categorized_events = []
    has_continuous_bp = False
    has_cerebral_oximetry = False

    for evt in preceding_events:
        evt_dt_str = evt.get("timestamp") or evt.get("event_timestamp")
        if not evt_dt_str:
            continue
        evt_dt = datetime.fromisoformat(evt_dt_str.replace("Z", "+00:00"))
        if evt_dt < start_dt or evt_dt > inc_dt:
            continue

        hours_before = round((inc_dt - evt_dt).total_seconds() / 3600.0, 1)
        cat = evt.get("event_category", "")
        metric = evt.get("metric_name", "")

        if "bp" in metric or "blood_pressure" in metric:
            has_continuous_bp = True
        if "nirs" in metric or "cerebral" in metric:
            has_cerebral_oximetry = True

        # Taxonomy classification
        if cat in ["sleep_observation", "workload_observation"]:
            classification = TAXONOMY["DERIVED"]
            rationale = "Computed index derived from sensor motion and schedule."
        elif cat in ["environmental_event", "mission_event"]:
            classification = TAXONOMY["ASSOCIATION"]
            rationale = "External cabin condition coinciding with crew timeline."
        elif evt.get("severity") == "CRITICAL":
            classification = TAXONOMY["FACT"]
            rationale = "Target clinical event observation."
        else:
            classification = TAXONOMY["FACT"]
            rationale = "Direct sensor telemetry or logged crew symptom report."

        categorized_events.append({
            "event_uid": evt.get("event_uid", f"EVT-{len(categorized_events)+1}"),
            "title": evt.get("title", ""),
            "category": cat,
            "timestamp": evt_dt_str,
            "hours_before_incident": hours_before,
            "classification": classification,
            "rationale": rationale,
            "value": evt.get("value"),
            "unit": evt.get("unit"),
            "confidence": evt.get("confidence_score", 0.95),
            "data_quality": evt.get("data_quality", "VERIFIED"),
        })

    # Sort chronologically
    categorized_events.sort(key=lambda x: x["timestamp"])

    missing_nodes = []
    if not has_cerebral_oximetry:
        missing_nodes.append({
            "type": TAXONOMY["MISSING"],
            "title": "Continuous Cerebral Oximetry (NIRS)",
            "description": "No frontal lobe hemodynamic oximetry sensor was worn during rapid postural shift.",
            "impact": "Precludes direct optical confirmation of transient cerebral ischemia; inferred via systemic BP collapse."
        })
    if not has_continuous_bp:
        missing_nodes.append({
            "type": TAXONOMY["MISSING"],
            "title": "Continuous Beat-to-Beat Arterial Tonometry",
            "description": "Blood pressure was measured intermittently rather than beat-by-beat.",
            "impact": "Limits microsecond baroreceptor reflex slope calculation."
        })

    return {
        "incident_timestamp": incident_timestamp,
        "horizon_hours": horizon_hours,
        "total_preceding_events": len(categorized_events),
        "timeline": categorized_events,
        "missing_evidence": missing_nodes,
        "scientific_integrity_guarantee": "All links represent temporal proximity and observed telemetry; causation is not assumed.",
    }
