"""
MOSAIC-9 Temporal Relationship Intelligence Engine
Analyzes time-series signals across Sleep, Musculoskeletal, Cardiovascular, and Workload domains.
Discovers lead-lag relationships, event sequences, and anomalies without black-box LLM hallucinations.
"""

from typing import List, Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd
from scipy import stats


def detect_first_unusual_signal(series: List[Dict[str, Any]], z_threshold: float = 2.0) -> Optional[Dict[str, Any]]:
    """
    Identifies the earliest timestamp where a biomarker departed beyond personal baseline z_threshold.
    """
    sorted_events = sorted(series, key=lambda x: x.get("timestamp", ""))
    for item in sorted_events:
        z = abs(item.get("z_score", 0.0))
        if z >= z_threshold:
            return {
                "timestamp": item.get("timestamp"),
                "metric": item.get("metric_name"),
                "domain": item.get("domain"),
                "value": item.get("value"),
                "z_score": item.get("z_score"),
                "explanation": f"First deviation detected: {item.get('metric_name')} departed by {z:.1f} standard deviations.",
            }
    return None


def calculate_lead_lag_cross_correlation(lead_series: List[float], lag_series: List[float], max_lags: int = 3) -> Dict[str, Any]:
    """
    Computes cross-correlation across different lag intervals (e.g., 24h, 48h windows).
    """
    if len(lead_series) < 3 or len(lag_series) < 3:
        return {"best_lag": 0, "max_correlation": 0.0, "p_value": 1.0}

    s1 = np.array(lead_series)
    s2 = np.array(lag_series)

    correlations = []
    # Test lags from 0 to max_lags
    for lag in range(max_lags + 1):
        if lag == 0:
            sub1, sub2 = s1, s2
        else:
            sub1, sub2 = s1[:-lag], s2[lag:]
        
        if len(sub1) >= 3 and np.std(sub1) > 0 and np.std(sub2) > 0:
            r, p = stats.pearsonr(sub1, sub2)
            correlations.append({"lag": lag, "r": float(r), "p_value": float(p)})

    if not correlations:
        return {"best_lag": 0, "max_correlation": 0.0, "p_value": 1.0}

    # Pick the lag with largest absolute correlation
    best = max(correlations, key=lambda x: abs(x["r"]))
    return {
        "best_lag": best["lag"],
        "max_correlation": round(best["r"], 3),
        "p_value": round(best["p_value"], 4),
    }


def build_temporal_storyline(observations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Constructs a deterministic chronological narrative from multi-domain observations.
    """
    df = pd.DataFrame(observations)
    if df.empty:
        return []

    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp")

    storyline = []
    for day, group in df.groupby("mission_day"):
        day_events = []
        for _, row in group.iterrows():
            day_events.append({
                "metric": row["metric_name"],
                "value": row["value"],
                "z_score": row.get("deviation_zscore", 0.0),
                "domain": row["domain"],
            })
        storyline.append({
            "mission_day": int(day),
            "event_count": len(day_events),
            "events": day_events,
        })
    return storyline
