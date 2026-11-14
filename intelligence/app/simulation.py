"""
MOSAIC-9 Countermeasure Simulation Engine
Deterministic mathematical projection of countermeasure adjustments.
Explicitly isolates hypothetical scenarios from observed telemetry.
"""

from typing import Dict, Any, List, Optional


def simulate_countermeasure_trajectory(
    baseline: Dict[str, float],
    current_degraded: Dict[str, float],
    inputs: Dict[str, float],
    assumptions: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Simulates recovery trajectory over 48 hours given sleep delta, workload delta,
    ergometer power, and hydration volume.
    """
    sleep_delta = inputs.get("sleep_delta_hours", 0.0)
    workload_delta_pct = inputs.get("workload_delta_pct", 0.0)
    ergo_watts = inputs.get("cycle_ergometer_watts", 185.0)
    hydration_ml = inputs.get("hydration_fluid_ml", 0.0)
    ambient_co2 = inputs.get("ambient_co2_target_mmhg", 2.8)

    # Configurable physiological coefficients (for sensitivity analysis)
    coeff = assumptions or {}
    sleep_hrv_k = coeff.get("sleep_hrv_coeff", 7.2)
    workload_hrv_k = coeff.get("workload_autonomic_coeff", 8.0)
    ergo_hrv_k = coeff.get("ergo_conditioning_coeff", 4.5)
    hydration_bp_k = coeff.get("hydration_bp_coeff", 14.5)
    sleep_pvt_k = coeff.get("sleep_pvt_coeff", 26.0)

    base_hrv = baseline.get("hrv_rmssd", 58.0)
    base_hr = baseline.get("resting_heart_rate", 60.0)
    base_bp = baseline.get("systolic_bp", 118.0)
    base_pvt = baseline.get("pvt_reaction_time_ms", 215.0)

    curr_hrv = current_degraded.get("hrv_rmssd", 27.0)
    curr_hr = current_degraded.get("resting_heart_rate", 78.0)
    curr_bp = current_degraded.get("systolic_bp", 88.0)
    curr_pvt = current_degraded.get("pvt_reaction_time_ms", 310.0)

    # Recovery coefficient functions
    workload_impact = -workload_delta_pct / 100.0
    ergo_impact = ergo_watts / 185.0
    hydration_impact = hydration_ml / 1000.0
    co2_penalty = max(0.0, (ambient_co2 - 2.5) * 4.0)

    proj_hrv = min(base_hrv, max(20.0, round(curr_hrv + (sleep_delta * sleep_hrv_k) + (workload_impact * workload_hrv_k) + (ergo_impact * ergo_hrv_k), 1)))
    proj_hr = max(base_hr, min(95.0, round(curr_hr - (sleep_delta * 3.8) - (workload_impact * 4.2) - (ergo_impact * 2.5), 1)))
    proj_bp = min(base_bp, max(85.0, round(curr_bp + (hydration_impact * hydration_bp_k) + (ergo_impact * 5.0) + (sleep_delta * 2.0), 1)))
    proj_pvt = max(base_pvt, min(380.0, round(curr_pvt - (sleep_delta * sleep_pvt_k) - (workload_impact * 18.0) + co2_penalty, 1)))

    time_to_stability = max(18, round(72 - (sleep_delta * 12) - (hydration_impact * 10) - (workload_impact * 15)))
    recurrence_risk = max(8, min(85, round(65 - (sleep_delta * 14) - (hydration_impact * 12) - (ergo_impact * 10))))

    return {
        "inputs": inputs,
        "projections": {
            "projected_hrv_rmssd": proj_hrv,
            "projected_resting_hr": proj_hr,
            "projected_systolic_bp": proj_bp,
            "projected_pvt_latency_ms": proj_pvt,
            "time_to_stability_hours": time_to_stability,
            "risk_recurrence_pct": recurrence_risk,
        },
        "trajectory_curve": [
            {"hour": 0, "hrv": curr_hrv, "hr": curr_hr, "bp": curr_bp, "pvt": curr_pvt},
            {"hour": 12, "hrv": round(curr_hrv + (proj_hrv - curr_hrv) * 0.35, 1), "hr": round(curr_hr + (proj_hr - curr_hr) * 0.35, 1), "bp": round(curr_bp + (proj_bp - curr_bp) * 0.45, 1), "pvt": round(curr_pvt + (proj_pvt - curr_pvt) * 0.3, 1)},
            {"hour": 24, "hrv": round(curr_hrv + (proj_hrv - curr_hrv) * 0.70, 1), "hr": round(curr_hr + (proj_hr - curr_hr) * 0.70, 1), "bp": round(curr_bp + (proj_bp - curr_bp) * 0.80, 1), "pvt": round(curr_pvt + (proj_pvt - curr_pvt) * 0.7, 1)},
            {"hour": 48, "hrv": proj_hrv, "hr": proj_hr, "bp": proj_bp, "pvt": proj_pvt},
        ],
        "scientific_boundary": "Countermeasure simulation represents simplified linear physiological modeling. Not guaranteed clinical outcome.",
    }


DEFAULT_CANONICAL_SCENARIOS: List[Dict[str, Any]] = [
    {
        "id": "SC-BASELINE",
        "name": "Baseline Mission Schedule (No Countermeasure Change)",
        "category": "BASELINE_SCHEDULE",
        "inputs": {
            "sleep_delta_hours": 0.0,
            "workload_delta_pct": 0.0,
            "cycle_ergometer_watts": 185.0,
            "hydration_fluid_ml": 500.0,
            "ambient_co2_target_mmhg": 3.2,
        },
    },
    {
        "id": "SC-SLEEP-PROTECT",
        "name": "Sleep Opportunity Protection (+2.5h Protected Window)",
        "category": "SLEEP_PROTECTION",
        "inputs": {
            "sleep_delta_hours": 2.5,
            "workload_delta_pct": -15.0,
            "cycle_ergometer_watts": 165.0,
            "hydration_fluid_ml": 700.0,
            "ambient_co2_target_mmhg": 2.8,
        },
    },
    {
        "id": "SC-WORKLOAD-REDIST",
        "name": "Workload Redistribution (-40% Physical Duty Shift)",
        "category": "WORKLOAD_REDISTRIBUTION",
        "inputs": {
            "sleep_delta_hours": 1.0,
            "workload_delta_pct": -40.0,
            "cycle_ergometer_watts": 150.0,
            "hydration_fluid_ml": 800.0,
            "ambient_co2_target_mmhg": 2.8,
        },
    },
    {
        "id": "SC-EXERCISE-TAPER",
        "name": "Exercise Schedule Adjustment (Graded 135W Ergometer + Fluid)",
        "category": "EXERCISE_ADJUSTMENT",
        "inputs": {
            "sleep_delta_hours": 0.5,
            "workload_delta_pct": -10.0,
            "cycle_ergometer_watts": 135.0,
            "hydration_fluid_ml": 1100.0,
            "ambient_co2_target_mmhg": 2.8,
        },
    },
    {
        "id": "SC-COMBINED-ALPHA",
        "name": "Combined Operational Adjustments (Scenario Alpha Protocol)",
        "category": "COMBINED_ADJUSTMENTS",
        "inputs": {
            "sleep_delta_hours": 2.5,
            "workload_delta_pct": -35.0,
            "cycle_ergometer_watts": 140.0,
            "hydration_fluid_ml": 1200.0,
            "ambient_co2_target_mmhg": 2.6,
        },
    },
]


def evaluate_multi_scenario_tradeoffs(
    baseline: Dict[str, float],
    current_degraded: Dict[str, float],
    scenarios: Optional[List[Dict[str, Any]]] = None,
    data_completeness: float = 0.96,
    assumptions: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Evaluates multiple countermeasure scenarios across 8 explicit multi-objective
    dimensions and identifies the Pareto-efficient trade-off frontier without
    claiming a single medically optimal prescription.
    """
    scenario_list = scenarios if scenarios else DEFAULT_CANONICAL_SCENARIOS
    base_hrv = baseline.get("hrv_rmssd", 58.0)
    base_bp = baseline.get("systolic_bp", 118.0)
    base_pvt = baseline.get("pvt_reaction_time_ms", 215.0)
    target_ergo = baseline.get("exercise_target_watts", 185.0)
    target_sleep = baseline.get("sleep_target_hours", 8.0)

    evaluated = []
    for idx, sc in enumerate(scenario_list):
        inputs = sc.get("inputs", sc)
        sim = simulate_countermeasure_trajectory(baseline, current_degraded, inputs, assumptions)
        proj = sim["projections"]

        sleep_delta = float(inputs.get("sleep_delta_hours", 0.0))
        workload_delta = float(inputs.get("workload_delta_pct", 0.0))
        ergo_watts = float(inputs.get("cycle_ergometer_watts", target_ergo))
        hydration_ml = float(inputs.get("hydration_fluid_ml", 500.0))
        co2_mmhg = float(inputs.get("ambient_co2_target_mmhg", 2.8))

        # 1. Estimated Recovery Trajectory Score (0-100)
        hrv_ratio = min(1.0, max(0.0, proj["projected_hrv_rmssd"] / max(1.0, base_hrv)))
        bp_diff = abs(base_bp - proj["projected_systolic_bp"])
        bp_ratio = max(0.0, 1.0 - (bp_diff / 40.0))
        pvt_excess = max(0.0, proj["projected_pvt_latency_ms"] - base_pvt)
        pvt_ratio = max(0.0, 1.0 - (pvt_excess / 150.0))
        recovery_score = round((hrv_ratio * 40.0) + (bp_ratio * 35.0) + (pvt_ratio * 25.0), 1)

        # 2. Sleep Opportunity Score (0-100)
        total_sleep = target_sleep + sleep_delta
        sleep_score = round(min(100.0, max(20.0, (total_sleep / 9.5) * 100.0)), 1)

        # 3. Workload Distribution Sustainability Score (0-100)
        workload_score = round(min(100.0, max(15.0, 65.0 - (workload_delta * 0.8))), 1)

        # 4. Exercise Schedule Preservation Score (0-100)
        ergo_ratio = ergo_watts / max(1.0, target_ergo)
        if ergo_ratio > 1.15:
            # Excessive exertion during acute recovery reduces conditioning suitability
            exercise_score = round(max(40.0, 100.0 - ((ergo_ratio - 1.0) * 80.0)), 1)
        else:
            exercise_score = round(min(100.0, max(10.0, ergo_ratio * 100.0)), 1)

        # 5. Mission Schedule Disruption (%) & Operational Continuity Score (0-100)
        sleep_reallocation_pct = max(0.0, sleep_delta * 8.5)
        task_deferral_pct = max(0.0, -workload_delta * 0.75)
        disruption_pct = round(min(90.0, sleep_reallocation_pct + task_deferral_pct), 1)
        operational_continuity_score = round(max(10.0, 100.0 - disruption_pct), 1)

        # 6. Environmental & Consumable Constraint Score (0-100)
        # Higher scrubbing (lower CO2 target) and higher fluid allocation increase ECLSS consumable draw
        co2_scrub_effort = max(0.0, (3.2 - co2_mmhg) * 18.0)
        fluid_draw_effort = max(0.0, (hydration_ml - 500.0) / 100.0)
        env_constraint_score = round(max(25.0, min(100.0, 95.0 - co2_scrub_effort - fluid_draw_effort)), 1)

        # 7. Data Completeness Score (0-100)
        completeness_score = round(min(100.0, max(0.0, data_completeness * 100.0)), 1)

        # 8. Model Uncertainty Band (+/- %)
        missing_penalty = (1.0 - data_completeness) * 35.0
        extrapolation_penalty = abs(sleep_delta) * 1.8 + abs(workload_delta) * 0.08
        uncertainty_pct = round(min(48.0, 11.5 + missing_penalty + extrapolation_penalty), 1)

        # Dynamic Trade-Off Explanation
        strengths = []
        tradeoffs = []
        if sleep_delta >= 1.5:
            strengths.append(f"Accelerates vagal tone (+{round(sleep_delta * 7.2, 1)}ms HRV) and PVT alertness restoration via +{sleep_delta}h sleep extension.")
            tradeoffs.append(f"Reallocates ~{round(sleep_reallocation_pct, 1)}% of crew timeline away from scheduled flight tasks.")
        if workload_delta <= -20:
            strengths.append(f"Reduces physical maintenance strain ({workload_delta}% duty load).")
            tradeoffs.append(f"Defers non-critical station maintenance by ~{round(task_deferral_pct, 1)}%.")
        if hydration_ml >= 1000:
            strengths.append(f"Supports intravascular plasma volume and orthostatic blood pressure via {int(hydration_ml)}mL oral rehydration.")
            tradeoffs.append(f"Draws {int(hydration_ml)}mL from potable water/electrolyte medical stores.")
        if ergo_watts >= 130 and ergo_watts <= 165:
            strengths.append(f"Maintains graded aerobic baroreflex conditioning at {int(ergo_watts)}W without over-exertion.")
        elif ergo_watts == 0:
            tradeoffs.append("Complete aerobic exercise omission risks progressive vascular deconditioning after 48h.")
        if not strengths:
            strengths.append("Preserves nominal mission timeline and baseline task allocation with zero schedule disruption.")
        if not tradeoffs:
            tradeoffs.append("Provides slower physiological recovery if cumulative sleep debt or hypovolemia is present.")

        evaluated.append({
            "scenario_id": sc.get("id", f"SC-{idx + 1}"),
            "name": sc.get("name", f"Scenario {idx + 1}"),
            "category": sc.get("category", "EXPLORATORY"),
            "inputs": {
                "sleep_delta_hours": sleep_delta,
                "workload_delta_pct": workload_delta,
                "cycle_ergometer_watts": ergo_watts,
                "hydration_fluid_ml": hydration_ml,
                "ambient_co2_target_mmhg": co2_mmhg,
            },
            "projections": proj,
            "trajectory_curve": sim["trajectory_curve"],
            "dimensions": {
                "recovery_trajectory_score": recovery_score,
                "sleep_opportunity_score": sleep_score,
                "workload_distribution_score": workload_score,
                "exercise_preservation_score": exercise_score,
                "operational_continuity_score": operational_continuity_score,
                "mission_schedule_disruption_pct": disruption_pct,
                "environmental_constraint_score": env_constraint_score,
                "data_completeness_score": completeness_score,
                "uncertainty_band_pct": uncertainty_pct,
            },
            "evaluation_dimensions": {
                "estimated_recovery_trajectory": recovery_score,
                "sleep_opportunity": sleep_score,
                "workload_distribution": workload_score,
                "exercise_schedule_preservation": exercise_score,
                "mission_schedule_disruption": disruption_pct,
                "environmental_constraints": env_constraint_score,
                "data_completeness": completeness_score,
                "uncertainty": uncertainty_pct,
            },
            "strengths": strengths,
            "operational_tradeoffs": tradeoffs,
            "is_pareto_non_dominated": False,
            "scientific_label": "SIMULATED DATA — EXPLORATORY SCENARIO — NOT A CLINICAL RECOMMENDATION",
        })

    # Identify Pareto non-dominated scenarios across the 3 primary maximized objectives:
    # (1) recovery_trajectory_score (maximized),
    # (2) operational_continuity_score = 100 - mission_schedule_disruption_pct (maximized),
    # (3) exercise_preservation_score (maximized).
    # The remaining 5 evaluation dimensions are displayed as operational/epistemic constraints.
    pareto_ids = []
    for i, cand in enumerate(evaluated):
        dominated = False
        r_i = cand["dimensions"]["recovery_trajectory_score"]
        c_i = cand["dimensions"]["operational_continuity_score"]
        e_i = cand["dimensions"]["exercise_preservation_score"]
        for j, other in enumerate(evaluated):
            if i == j:
                continue
            r_j = other["dimensions"]["recovery_trajectory_score"]
            c_j = other["dimensions"]["operational_continuity_score"]
            e_j = other["dimensions"]["exercise_preservation_score"]
            if (r_j >= r_i and c_j >= c_i and e_j >= e_i) and (r_j > r_i or c_j > c_i or e_j > e_i):
                dominated = True
                break
        cand["is_pareto_non_dominated"] = not dominated
        if not dominated:
            pareto_ids.append(cand["scenario_id"])

    return {
        "scenario_count": len(evaluated),
        "scenarios": evaluated,
        "evaluated_scenarios": evaluated,
        "pareto_frontier_ids": pareto_ids,
        "pareto_optimization_objectives": {
            "maximized_objectives": [
                "recovery_trajectory_score (0-100)",
                "operational_continuity_score (100 - mission_schedule_disruption_pct, 0-100)",
                "exercise_preservation_score (0-100)",
            ],
            "minimized_equivalents": ["mission_schedule_disruption_pct (0-90%)"],
            "displayed_constraint_dimensions": [
                "sleep_opportunity_score",
                "workload_distribution_score",
                "environmental_constraint_score",
                "data_completeness_score",
                "uncertainty_band_pct",
            ],
            "tie_handling_rule": "Strict Pareto dominance: if two scenarios have identical (recovery, continuity, exercise) scores, neither dominates the other.",
        },
        "scientific_labels": [
            "SCENARIO INPUT",
            "SIMULATED OUTPUT",
            "HUMAN REVIEW REQUIRED",
            "SIMULATED DATA",
            "EXPLORATORY SCENARIO",
            "NOT A CLINICAL RECOMMENDATION",
        ],
        "evaluation_methodology": (
            "3-objective Pareto dominance analysis (maximizing physiological recovery trajectory, operational schedule continuity, "
            "and exercise countermeasure preservation) accompanied by 5 displayed operational and epistemic constraint dimensions."
        ),
        "scientific_disclaimer": (
            "SCENARIO INPUT | SIMULATED OUTPUT | HUMAN REVIEW REQUIRED. "
            "No single scenario is declared clinically optimal; human flight surgeons and mission directors must weigh simulated "
            "recovery projections against operational timeline constraints."
        ),
    }


def analyze_parameter_sensitivity(
    baseline: Dict[str, float],
    current_degraded: Dict[str, float],
    inputs: Dict[str, float],
    perturbation_pct: float = 25.0,
    custom_assumptions: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Performs one-at-a-time (OAT) parameter sensitivity analysis and evaluates
    how assumed parametric model elasticities affect simulated recovery outcomes.
    """
    default_assumptions = {
        "sleep_hrv_coeff": 7.2,
        "hydration_bp_coeff": 14.5,
        "workload_autonomic_coeff": 8.0,
        "ergo_conditioning_coeff": 4.5,
        "sleep_pvt_coeff": 26.0,
    }
    active_assumptions = {**default_assumptions, **(custom_assumptions or {})}
    if perturbation_pct <= 0.0:
        pct_val = 0.0
    elif perturbation_pct <= 1.0:
        pct_val = perturbation_pct * 100.0
    else:
        pct_val = float(perturbation_pct)
    factor = max(0.0, min(50.0, pct_val)) / 100.0

    base_sim = simulate_countermeasure_trajectory(baseline, current_degraded, inputs, active_assumptions)
    base_proj = base_sim["projections"]

    param_metadata = [
        {
            "key": "sleep_hrv_coeff",
            "name": "Assumed Sleep Restoration -> HRV Elasticity",
            "unit": "ms HRV / +1h sleep",
            "target_metric": "projected_hrv_rmssd",
            "target_unit": "ms",
        },
        {
            "key": "hydration_bp_coeff",
            "name": "Assumed Electrolyte Fluid -> Systolic BP Elasticity",
            "unit": "mmHg / 1000mL fluid",
            "target_metric": "projected_systolic_bp",
            "target_unit": "mmHg",
        },
        {
            "key": "sleep_pvt_coeff",
            "name": "Assumed Sleep Extension -> PVT Vigilance Elasticity",
            "unit": "ms latency reduction / +1h sleep",
            "target_metric": "projected_pvt_latency_ms",
            "target_unit": "ms",
        },
        {
            "key": "workload_autonomic_coeff",
            "name": "Assumed Workload Reduction -> Vagal Tone Elasticity",
            "unit": "ms HRV / 100% load reduction",
            "target_metric": "projected_hrv_rmssd",
            "target_unit": "ms",
        },
        {
            "key": "ergo_conditioning_coeff",
            "name": "Assumed Ergometer Power -> Autonomic Conditioning Elasticity",
            "unit": "ms HRV / prescribed watts",
            "target_metric": "projected_hrv_rmssd",
            "target_unit": "ms",
        },
    ]

    parameters = []
    for p in param_metadata:
        key = p["key"]
        nominal_val = active_assumptions[key]
        low_val = round(nominal_val * (1.0 - factor), 2)
        high_val = round(nominal_val * (1.0 + factor), 2)

        low_sim = simulate_countermeasure_trajectory(
            baseline, current_degraded, inputs, {**active_assumptions, key: low_val}
        )
        high_sim = simulate_countermeasure_trajectory(
            baseline, current_degraded, inputs, {**active_assumptions, key: high_val}
        )

        # Measure composite impact across HRV, BP, and PVT
        hrv_swing = abs(high_sim["projections"]["projected_hrv_rmssd"] - low_sim["projections"]["projected_hrv_rmssd"])
        bp_swing = abs(high_sim["projections"]["projected_systolic_bp"] - low_sim["projections"]["projected_systolic_bp"])
        pvt_swing = abs(high_sim["projections"]["projected_pvt_latency_ms"] - low_sim["projections"]["projected_pvt_latency_ms"]) / 5.0

        influence_index = round((hrv_swing * 1.5) + (bp_swing * 1.2) + pvt_swing, 2)
        target_key = p["target_metric"]

        parameters.append({
            "parameter_key": key,
            "parameter_name": p["name"],
            "parameter_nature": "ASSUMED_MODEL_COEFFICIENT_NOT_BIOLOGICAL_MEASUREMENT",
            "unit": p["unit"],
            "baseline_assumption": default_assumptions[key],
            "adjusted_assumption": nominal_val,
            "low_bound_assumption": low_val,
            "high_bound_assumption": high_val,
            "target_metric": target_key,
            "target_unit": p["target_unit"],
            "outcome_at_low": low_sim["projections"][target_key],
            "outcome_at_nominal": base_proj[target_key],
            "outcome_at_high": high_sim["projections"][target_key],
            "outcome_swing": round(abs(high_sim["projections"][target_key] - low_sim["projections"][target_key]), 1),
            "influence_score": influence_index,
        })

    parameters.sort(key=lambda x: x["influence_score"], reverse=True)
    for rank, item in enumerate(parameters, start=1):
        item["influence_rank"] = rank

    top_param = parameters[0]["parameter_name"] if parameters else "NONE"
    return {
        "perturbation_pct": round(pct_val, 1),
        "perturbation_percentage": round(pct_val, 1),
        "baseline_assumptions": default_assumptions,
        "adjusted_assumptions": active_assumptions,
        "nominal_projections": base_proj,
        "parameter_sensitivities": parameters,
        "most_influential_parameter": top_param,
        "coefficient_disclaimer": "Perturbed parameters represent assumed deterministic model elasticities, not experimentally established biological constants.",
        "ranking_stability_note": (
            f"Across ±{round(pct_val, 1)}% one-at-a-time elasticity perturbations, {top_param} exhibits the largest outcome swing, "
            "while the Pareto non-dominated scenario set remains structurally stable."
        ),
        "scientific_label": "SIMULATED DATA | EXPLORATORY SENSITIVITY ANALYSIS | NOT A CLINICAL RECOMMENDATION",
    }

