"""
MOSAIC-9 Intelligence Engine Automated Unit Tests
Tests: Baseline stats, Z-score bounds, Confidence penalties, Lead-lag correlation, Incident reconstruction, Simulation.
"""

import pytest
from app.baseline import (
    calculate_baseline_summary,
    compute_z_score,
    evaluate_confidence,
    evaluate_comprehensive_confidence,
)
from app.temporal import detect_first_unusual_signal, calculate_lead_lag_cross_correlation
from app.reconstruction import reconstruct_incident_timeline, TAXONOMY
from app.simulation import simulate_countermeasure_trajectory


def test_baseline_summary():
    data = [60.0, 62.0, 58.0, 61.0, 59.0]
    res = calculate_baseline_summary(data)
    assert res["mean"] == 60.0
    assert res["median"] == 60.0
    assert res["mad"] >= 0.0
    assert res["std"] > 0.0


def test_z_score_calculation():
    # Normal value
    z_norm = compute_z_score(60.0, 60.0, 2.0)
    assert z_norm == 0.0

    # Elevated heart rate (70 bpm when base is 60 +/- 2)
    z_high = compute_z_score(70.0, 60.0, 2.0)
    assert z_high == 5.0

    # Zero standard deviation guard
    z_zero_std = compute_z_score(65.0, 60.0, 0.0)
    assert z_zero_std == 0.0


def test_confidence_evaluation_penalizes_missing_data():
    # Perfect data
    conf_perfect = evaluate_confidence(1.0, 1.0, 100, 100)
    assert conf_perfect == 1.0

    # Elena Rostova scenario: 44% completeness and missing sensor packets
    conf_degraded = evaluate_confidence(0.44, 0.40, 40, 100)
    assert conf_degraded < 0.50
    assert conf_degraded > 0.30


def test_first_unusual_signal_detection():
    series = [
        {"timestamp": "2026-07-20T08:00:00", "metric_name": "hr", "value": 61, "z_score": 0.2, "domain": "cardio"},
        {"timestamp": "2026-07-21T06:00:00", "metric_name": "sleep_duration", "value": 5.4, "z_score": -2.6, "domain": "neuro"},
        {"timestamp": "2026-07-22T08:00:00", "metric_name": "hrv", "value": 38, "z_score": -2.9, "domain": "cardio"},
    ]
    sig = detect_first_unusual_signal(series, z_threshold=2.0)
    assert sig is not None
    assert sig["metric"] == "sleep_duration"
    assert sig["z_score"] == -2.6


def test_lead_lag_cross_correlation():
    # Sleep reduction (negative trend) followed by HRV drop (negative trend)
    lead = [8.0, 7.8, 5.4, 4.9, 5.1]
    lag = [58.0, 58.0, 46.0, 38.0, 32.0]
    res = calculate_lead_lag_cross_correlation(lead, lag, max_lags=2)
    assert res["max_correlation"] > 0.7  # Positively correlated (both drop)


def test_reconstruct_incident_timeline_and_missing_evidence():
    events = [
        {
            "event_uid": "EVT-1",
            "title": "Sleep curtailment",
            "event_category": "sleep_observation",
            "timestamp": "2026-07-22T06:00:00Z",
            "value": 5.4,
            "unit": "hours",
        },
        {
            "event_uid": "EVT-2",
            "title": "Cycle ergometer abbreviated",
            "event_category": "exercise_record",
            "timestamp": "2026-07-22T10:00:00Z",
            "value": 145.0,
            "unit": "W",
        },
        {
            "event_uid": "EVT-3",
            "title": "Incident: dizziness",
            "event_category": "symptom_report",
            "timestamp": "2026-07-22T12:00:00Z",
            "severity": "CRITICAL",
            "value": 88.0,
            "unit": "mmHg",
        }
    ]
    rec = reconstruct_incident_timeline("2026-07-22T12:00:00Z", events, horizon_hours=24)
    assert rec["total_preceding_events"] == 3
    # Check that missing continuous NIRS oximetry is highlighted
    assert len(rec["missing_evidence"]) >= 1
    assert any(m["type"] == TAXONOMY["MISSING"] for m in rec["missing_evidence"])


def test_simulate_countermeasure():
    baseline = {"hrv_rmssd": 58.0, "resting_heart_rate": 60.0, "systolic_bp": 118.0, "pvt_reaction_time_ms": 215.0}
    current = {"hrv_rmssd": 27.0, "resting_heart_rate": 78.0, "systolic_bp": 88.0, "pvt_reaction_time_ms": 310.0}
    inputs = {
        "sleep_delta_hours": 2.5,
        "workload_delta_pct": -35.0,
        "cycle_ergometer_watts": 140.0,
        "hydration_fluid_ml": 1200.0,
    }
    sim = simulate_countermeasure_trajectory(baseline, current, inputs)
    assert sim["projections"]["projected_hrv_rmssd"] > current["hrv_rmssd"]
    assert sim["projections"]["projected_resting_hr"] < current["resting_heart_rate"]
    assert sim["projections"]["projected_systolic_bp"] > current["systolic_bp"]
    assert sim["projections"]["projected_pvt_latency_ms"] < current["pvt_reaction_time_ms"]


def test_empty_and_edge_case_baseline():
    empty_res = calculate_baseline_summary([])
    assert empty_res["mean"] == 0.0
    assert empty_res["std"] == 0.0

    single_val = calculate_baseline_summary([72.0])
    assert single_val["mean"] == 72.0
    assert single_val["std"] == 0.0


def test_comprehensive_confidence_penalties():
    # 1. Full data, fresh, complete baseline
    nominal = evaluate_comprehensive_confidence(
        data_completeness=1.0,
        provenance_score=1.0,
        sample_count=100,
        max_expected_samples=100,
        is_stale=False,
        baseline_sample_count=14,
        min_required_baseline=10,
    )
    assert nominal["confidence_score"] == 1.0
    assert len(nominal["penalties"]) == 0

    # 2. Stale measurement penalty
    stale = evaluate_comprehensive_confidence(
        data_completeness=1.0,
        provenance_score=1.0,
        sample_count=100,
        max_expected_samples=100,
        is_stale=True,
    )
    assert stale["confidence_score"] <= 0.85
    assert any("Stale" in p for p in stale["penalties"])

    # 3. Missing measurements penalty
    missing = evaluate_comprehensive_confidence(
        data_completeness=0.45,
        provenance_score=0.90,
        sample_count=45,
        max_expected_samples=100,
    )
    assert missing["confidence_score"] < 0.65
    assert any("Missing" in p for p in missing["penalties"])

    # 4. Incomplete baseline penalty
    incomplete_base = evaluate_comprehensive_confidence(
        data_completeness=1.0,
        provenance_score=1.0,
        sample_count=100,
        max_expected_samples=100,
        baseline_sample_count=4,
        min_required_baseline=10,
    )
    assert incomplete_base["confidence_score"] < 0.95
    assert any("baseline" in p.lower() for p in incomplete_base["penalties"])


def test_fastapi_temporal_endpoint():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    response = client.post("/analyze/temporal-relationships", json={"crew_member_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert data["engine"] == "PYTHON_FASTAPI_INTELLIGENCE_SERVICE"
    assert "first_unusual_signal" in data
    assert len(data["cross_domain_associations"]) >= 3
    assert len(data["anomaly_sequence"]) == 5
