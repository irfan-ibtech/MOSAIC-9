"""
MOSAIC-9 Intelligence Engine Automated Unit Tests
Tests: Baseline stats, Z-score bounds, Confidence penalties, Lead-lag correlation, Incident reconstruction, Simulation,
NASA Evidence Fusion, Mission Evidence Graph, Multi-Scenario Trade-off Evaluation, and Sensitivity Analysis.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app.baseline import (
    calculate_baseline_summary,
    compute_z_score,
    evaluate_confidence,
    evaluate_comprehensive_confidence,
)
from app.temporal import detect_first_unusual_signal, calculate_lead_lag_cross_correlation
from app.reconstruction import (
    reconstruct_incident_timeline,
    build_mission_evidence_graph,
    TAXONOMY,
    EVIDENCE_TAXONOMY_V2,
    NASA_EVIDENCE_REGISTRY,
)
from app.simulation import (
    simulate_countermeasure_trajectory,
    evaluate_multi_scenario_tradeoffs,
    analyze_parameter_sensitivity,
)


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


def test_nasa_evidence_registry_and_taxonomy_v2():
    # Verify all 6 required evidence classifications exist
    required_tiers = [
        "DIRECT_OBSERVATION",
        "NASA_RESEARCH_CONTEXT",
        "DERIVED_TEMPORAL_ASSOCIATION",
        "EXPLORATORY_HYPOTHESIS",
        "MISSING_EVIDENCE",
        "SYNTHETIC_SIMULATION",
    ]
    for tier in required_tiers:
        assert tier in EVIDENCE_TAXONOMY_V2
        assert "source_attribution" in EVIDENCE_TAXONOMY_V2[tier]
        assert "limitations" in EVIDENCE_TAXONOMY_V2[tier]

    # Verify OSD-575, OSD-571, and OSD-635 are present with accurate OSDR dataset DOIs, accessions, and limitations
    study_ids = {s["study_id"]: s for s in NASA_EVIDENCE_REGISTRY}
    assert "OSD-575" in study_ids
    assert "OSD-571" in study_ids
    assert "OSD-635" in study_ids
    assert "LSDS-8" in study_ids["OSD-575"]["accession"]
    assert study_ids["OSD-575"]["doi"] == "10.26030/mc5d-p710"
    assert study_ids["OSD-575"]["sample_timepoints"] == ["L-92", "L-44", "L-3", "R+1", "R+45", "R+82"]
    assert "GLDS-563" in study_ids["OSD-571"]["accession"]
    assert study_ids["OSD-571"]["doi"] == "10.26030/h3p5-tc29"
    assert "GLDS-608" in study_ids["OSD-635"]["accession"]
    assert study_ids["OSD-635"]["doi"] == "10.26030/8n5a-q187"
    assert study_ids["HRP-CV-OI"]["identifier_type"] == "INTERNAL_APP_REFERENCE_ID"
    assert "Inspiration4" in study_ids["OSD-575"]["title"]
    assert "NOT CONTINUOUS" in study_ids["OSD-575"]["applicability_note"]
    assert "smooth muscle" in study_ids["OSD-635"]["title"].lower()
    assert "IN VITRO" in study_ids["OSD-635"]["applicability_note"]


def test_build_mission_evidence_graph_alex_and_marcus():
    graph_alex = build_mission_evidence_graph("INC-ARES4-120-001")
    assert graph_alex["incident_code"] == "INC-ARES4-120-001"
    assert graph_alex["total_nodes"] >= 14
    assert graph_alex["total_edges"] >= 14
    node_ids_alex = {n["id"] for n in graph_alex["nodes"]}
    assert "NASA-OSD-575" in node_ids_alex
    assert "NASA-OSD-635" in node_ids_alex

    graph_marcus = build_mission_evidence_graph("INC-ARES4-118-002")
    assert graph_marcus["incident_code"] == "INC-ARES4-118-002"
    assert any("CO2" in n["label"] for n in graph_marcus["nodes"])


def test_multi_scenario_tradeoffs_and_pareto_frontier():
    baseline = {"hrv_rmssd": 58.0, "resting_heart_rate": 60.0, "systolic_bp": 118.0, "pvt_reaction_time_ms": 215.0}
    current = {"hrv_rmssd": 27.0, "resting_heart_rate": 78.0, "systolic_bp": 88.0, "pvt_reaction_time_ms": 310.0}
    result = evaluate_multi_scenario_tradeoffs(baseline, current)
    assert result["scenario_count"] == 5
    assert len(result["pareto_frontier_ids"]) >= 1
    assert "SIMULATED DATA" in result["scientific_labels"]
    assert "NOT A CLINICAL RECOMMENDATION" in result["scientific_labels"]

    # Check all 8 evaluation dimensions on each scenario
    required_dims = [
        "estimated_recovery_trajectory",
        "sleep_opportunity",
        "workload_distribution",
        "exercise_schedule_preservation",
        "mission_schedule_disruption",
        "environmental_constraints",
        "data_completeness",
        "uncertainty",
    ]
    for sc in result["scenarios"]:
        for dim in required_dims:
            assert dim in sc["evaluation_dimensions"]


def test_sensitivity_analysis_and_boundary_conditions():
    baseline = {"hrv_rmssd": 58.0, "resting_heart_rate": 60.0, "systolic_bp": 118.0, "pvt_reaction_time_ms": 215.0}
    current = {"hrv_rmssd": 27.0, "resting_heart_rate": 78.0, "systolic_bp": 88.0, "pvt_reaction_time_ms": 310.0}
    inputs = {
        "sleep_delta_hours": 2.5,
        "workload_delta_pct": -35.0,
        "cycle_ergometer_watts": 140.0,
        "hydration_fluid_ml": 1200.0,
    }
    sens = analyze_parameter_sensitivity(baseline, current, inputs, perturbation_pct=0.25)
    assert sens["perturbation_percentage"] == 25.0
    assert len(sens["parameter_sensitivities"]) == 5
    assert sens["most_influential_parameter"] != "NONE"

    # Zero-variance perturbation test (0% perturbation must produce 0.0 swing)
    sens_zero = analyze_parameter_sensitivity(baseline, current, inputs, perturbation_pct=0.0)
    assert sens_zero["perturbation_percentage"] == 0.0
    for p in sens_zero["parameter_sensitivities"]:
        assert p["outcome_swing"] == 0.0

    # Boundary condition test: extreme zero / negative inputs
    extreme_sim = simulate_countermeasure_trajectory(
        baseline,
        current,
        {"sleep_delta_hours": 0.0, "workload_delta_pct": 0.0, "cycle_ergometer_watts": 0.0, "hydration_fluid_ml": 0.0},
    )
    assert extreme_sim["projections"]["projected_hrv_rmssd"] >= current["hrv_rmssd"]
    assert 5 <= extreme_sim["projections"]["risk_recurrence_pct"] <= 95


def test_fastapi_new_evidence_and_simulation_endpoints():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    reg_res = client.get("/evidence/registry")
    assert reg_res.status_code == 200
    assert reg_res.json()["total_studies"] >= 6

    graph_res = client.post("/reconstruct/evidence-graph", json={"incident_code": "INC-ARES4-120-001"})
    assert graph_res.status_code == 200
    assert graph_res.json()["total_nodes"] >= 14

    tradeoff_res = client.post(
        "/simulate/tradeoffs",
        json={
            "baseline": {"hrv_rmssd": 58.0, "resting_heart_rate": 60.0, "systolic_bp": 118.0, "pvt_reaction_time_ms": 215.0},
            "current_degraded": {"hrv_rmssd": 27.0, "resting_heart_rate": 78.0, "systolic_bp": 88.0, "pvt_reaction_time_ms": 310.0},
        },
    )
    assert tradeoff_res.status_code == 200
    assert tradeoff_res.json()["scenario_count"] == 5

    sens_res = client.post(
        "/simulate/sensitivity",
        json={
            "baseline": {"hrv_rmssd": 58.0, "resting_heart_rate": 60.0, "systolic_bp": 118.0, "pvt_reaction_time_ms": 215.0},
            "current_degraded": {"hrv_rmssd": 27.0, "resting_heart_rate": 78.0, "systolic_bp": 88.0, "pvt_reaction_time_ms": 310.0},
            "inputs": {"sleep_delta_hours": 2.5, "workload_delta_pct": -35.0, "cycle_ergometer_watts": 140.0, "hydration_fluid_ml": 1200.0},
            "perturbation_pct": 0.20,
        },
    )
    assert sens_res.status_code == 200
    assert "most_influential_parameter" in sens_res.json()
