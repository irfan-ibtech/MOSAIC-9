"""
MOSAIC-9 Scientific Intelligence Engine: Baseline & Statistical Deviations
Implements deterministic, explainable calculations for astronaut physiological parameters.
Strictly abides by NASA HRP ethical guidelines: never presents synthetic data as verified clinical diagnosis.
"""

from typing import List, Dict, Any, Optional
import numpy as np


def calculate_baseline_summary(values: List[float]) -> Dict[str, float]:
    """
    Computes robust personal baseline indicators: median, median absolute deviation (MAD),
    mean, standard deviation, and interquartile range (IQR).
    """
    if not values:
        return {"mean": 0.0, "std": 0.0, "median": 0.0, "mad": 0.0, "iqr": 0.0}

    arr = np.array(values, dtype=float)
    median = float(np.median(arr))
    mad = float(np.median(np.abs(arr - median)))
    mean = float(np.mean(arr))
    std = float(np.std(arr, ddof=1)) if len(arr) > 1 else 0.0
    q75, q25 = np.percentile(arr, [75, 25])
    iqr = float(q75 - q25)

    return {
        "mean": round(mean, 2),
        "std": round(std, 2),
        "median": round(median, 2),
        "mad": round(mad, 2),
        "iqr": round(iqr, 2),
    }


def compute_z_score(value: float, baseline_mean: float, baseline_std: float) -> float:
    """
    Calculates statistical standard deviation score relative to personal baseline.
    Avoids division by zero using minimum variance floor.
    """
    if baseline_std <= 0.0001:
        return 0.0
    return round((value - baseline_mean) / baseline_std, 2)


def evaluate_confidence(data_completeness: float, provenance_score: float, sample_count: int, max_expected_samples: int) -> float:
    """
    Evaluates empirical confidence score between 0.0 and 1.0.
    Heavily penalizes missing or unverified data points.
    """
    if max_expected_samples <= 0:
        return 0.0

    sample_ratio = min(1.0, sample_count / max_expected_samples)
    confidence = (data_completeness * 0.45) + (provenance_score * 0.35) + (sample_ratio * 0.20)
    return round(float(np.clip(confidence, 0.0, 1.0)), 3)


def evaluate_comprehensive_confidence(
    data_completeness: float,
    provenance_score: float,
    sample_count: int,
    max_expected_samples: int,
    is_stale: bool = False,
    baseline_sample_count: int = 14,
    min_required_baseline: int = 10,
) -> Dict[str, Any]:
    """
    Evaluates multi-factor scientific confidence score:
    - Penalizes missing measurements (completeness factor)
    - Penalizes poor data quality (provenance score)
    - Penalizes insufficient observations (sample count ratio)
    - Penalizes stale measurements (freshness flag)
    - Penalizes incomplete baseline profiles (baseline count ratio)
    """
    if max_expected_samples <= 0:
        return {"confidence_score": 0.0, "penalties": ["Zero expected samples"]}

    penalties = []
    sample_ratio = min(1.0, max(0.0, sample_count / max_expected_samples))
    completeness = min(1.0, max(0.0, data_completeness))
    quality = min(1.0, max(0.0, provenance_score))

    if completeness < 0.8:
        penalties.append(f"Missing measurement penalty ({int((1 - completeness) * 100)}% unacquired)")
    if quality < 0.8:
        penalties.append("Degraded sensor quality penalty")
    if sample_ratio < 0.7:
        penalties.append("Insufficient observation count penalty")

    base_confidence = (completeness * 0.40) + (quality * 0.35) + (sample_ratio * 0.25)

    stale_multiplier = 0.80 if is_stale else 1.0
    if is_stale:
        penalties.append("Stale measurement penalty (timestamp > 6h without packet refresh)")

    baseline_ratio = min(1.0, max(0.2, baseline_sample_count / min_required_baseline))
    if baseline_sample_count < min_required_baseline:
        penalties.append(f"Incomplete baseline profile ({baseline_sample_count}/{min_required_baseline} days established)")

    final_score = base_confidence * stale_multiplier * (0.8 + 0.2 * baseline_ratio)
    clipped = round(float(np.clip(final_score, 0.0, 1.0)), 3)

    return {
        "confidence_score": clipped,
        "completeness_factor": round(completeness, 3),
        "quality_factor": round(quality, 3),
        "sample_adequacy": round(sample_ratio, 3),
        "is_stale": is_stale,
        "baseline_adequacy": round(baseline_ratio, 3),
        "penalties": penalties,
    }
