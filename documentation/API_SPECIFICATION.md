# MOSAIC-9 — REST API Specification

The MOSAIC-9 backend control plane exposes 22 documented REST endpoints under the `/api` prefix, returning standardized JSON payloads.

---

## 1. Mission Overview & Global Controls

### `GET /api/mission`
Returns current mission elapsed time, cabin environmental parameters, earth communication latency, and crew complement health overview.
- **Response 200 OK:**
  ```json
  {
    "mission": {
      "name": "ARES-IV Deep Space Mars Transit",
      "code": "ARES-IV",
      "current_day": 120,
      "elapsed_hours": 2894,
      "status": "ACTIVE",
      "communication_latency_seconds": 1260,
      "earth_comm_status": "OFFLINE",
      "radiation_ambient_usv_per_h": 52.4,
      "cabin_pressure_kpa": 101.1,
      "cabin_co2_mmhg": 3.2
    },
    "crew_overview": { "total": 4, "stable": 1, "watch": 1, "review_required": 1, "unknown": 1 },
    "active_incidents_count": 1,
    "data_freshness_seconds": 45
  }
  ```

### `POST /api/mission/status`
Updates mission operational parameters.

---

## 2. Crew Members & Health Twins

### `GET /api/crew`
Returns list of all crew members with callsign, role, current health status, data completeness, and confidence scores.

### `GET /api/crew/{id}`
Returns individual crew member details, baseline resting profiles, and domain summaries.

### `GET /api/crew/{id}/observations`
Returns chronological time-series observations.
- **Query Parameters:**
  - `domain`: Filter by domain (`cardiovascular`, `musculoskeletal`, `neuro_cognitive_sleep`, `radiation_environment`).
  - `metric_name`: Filter by specific biomarker (e.g., `heart_rate_resting`, `hrv_rmssd`).
  - `min_day`, `max_day`: Filter by mission day range.

---

## 3. Mission Health Intelligence Ledger

### `GET /api/ledger`
Returns chronological event records.
- **Query Parameters:**
  - `crew_member_id`: Crew member ID, `shipwide`, or `all`.
  - `category`: Event category.
  - `severity`: `INFO`, `LOW`, `MODERATE`, `HIGH`, `CRITICAL`.
  - `data_quality`: `VERIFIED`, `PROVISIONAL`, `DEGRADED`, `STALE`, `UNRELIABLE`.
  - `search`: Free text query matching title, description, or UID.

### `POST /api/ledger`
Appends a new observation or symptom report into the immutable ledger.

---

## 4. Health Incidents & Signature Reconstruction

### `GET /api/incidents`
Lists all mission health incidents.

### `GET /api/incidents/{id}/reconstruct`
**Signature Feature:** Reconstructs preceding timeline with classified evidence nodes, missing evidence identification, and competing hypotheses.
- **Query Parameters:**
  - `horizon_hours`: Lookback horizon window (`6`, `24`, `72`, `168`).
- **Response Structure:**
  ```json
  {
    "incident": { "incident_code": "INC-ARES4-120-001", "mission_day": 120 },
    "horizon_hours": 72,
    "evidence_nodes": [
      {
        "event_uid": "EVT-117-0630-SLP",
        "title": "Sleep Curtailment Recorded",
        "relative_hours": 75.2,
        "classification": "DERIVED_INDICATOR",
        "value": 5.4,
        "unit": "hours",
        "confidence": 0.98
      }
    ],
    "missing_evidence": [
      {
        "title": "Continuous Cerebral Oximetry (NIRS)",
        "impact_on_confidence": "Precludes optical confirmation of cerebral ischemia."
      }
    ],
    "hypotheses": [
      {
        "hypothesis_id": "HYP-01",
        "title": "Deconditioning-Exacerbated Baroreflex Decompensation",
        "plausibility": "HIGH (0.88)"
      }
    ]
  }
  ```

---

## 5. Temporal Relationship Engine

### `POST /api/intelligence/temporal-analysis`
Computes lead-lag cross-correlations, identifies the earliest unusual signal, and maps the 5-day multi-domain divergence sequence.

---

## 6. Countermeasure Scenario Sandbox

### `GET /api/scenarios`
Retrieves saved countermeasure exploration scenarios.

### `POST /api/scenarios/simulate`
Executes mathematical countermeasure simulation.
- **Request Body:**
  ```json
  {
    "crew_member_id": 1,
    "name": "Scenario Alpha: Sleep Restoration & Fluid Loading",
    "sleep_delta_hours": 2.5,
    "workload_delta_pct": -35.0,
    "cycle_ergometer_watts": 140.0,
    "hydration_fluid_ml": 1200.0,
    "ambient_co2_target_mmhg": 2.0
  }
  ```

---

## 7. Ground Communication & Sync Telemetry

### `GET /api/ground-comms`
Retrieves all SBAR ground communication packets.

### `POST /api/ground-comms`
Queues a new SBAR brief in local onboard storage (`QUEUED_LOCAL`).

### `POST /api/ground-comms/{id}/transmit`
Initiates buffered transmission over high-gain antenna.

### `GET /api/sync/status`
Returns synchronization telemetry, link state, and local SQLite integrity.

### `POST /api/sync/trigger`
Attempts ground synchronization (fails gracefully during LOS; flushes queue during HIGH_GAIN_PASS).

### `POST /api/sync/toggle-link`
Simulates switching between `LOSS_OF_SIGNAL`, `DEGRADED_COMM`, and `HIGH_GAIN_ESTABLISHED`.
