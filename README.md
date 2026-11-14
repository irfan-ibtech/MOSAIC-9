# MOSAIC-9 — Mission Health Event Reconstruction for Deep-Space Crews

> **Every Signal Has a Story.**  
> *NASA Space Apps Challenge 2026 — Challenge: Create Health Monitoring Software for Astronauts on Space Missions.*  
> **Team:** TESSERA FLIGHT LAB

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build & Tests](https://img.shields.io/badge/Tests-35%20Passed%20(100%25)-emerald.svg)](scripts/run-tests.sh)
[![Architecture](https://img.shields.io/badge/Architecture-React%2018%20|%20Laravel%2012%20|%20FastAPI-06b6d4.svg)](documentation/ARCHITECTURE.md)
[![Ethical Standards](https://img.shields.io/badge/Telemetry-100%25%20Synthetic%20HRP%20Model-purple.svg)](documentation/DATA_DICTIONARY.md)

---

## 1. Executive Summary & Problem Solved

During long-duration deep-space transit (e.g. Earth–Mars missions), crews operate beyond real-time ground support due to **light-speed latency (4–24 minutes one-way)** and **orbital communication occultations (multi-day loss of signal)**. 

A conventional telemetry dashboard displays isolated sensor warnings, but critically fails to answer:
- **What changed before a health incident?**
- **When did the first unusual precursor signal appear?**
- **Which physiological and environmental indicators changed together?**
- **Which data points are missing, stale, or degraded?**
- **Which relationships are observed facts, and which are only hypotheses?**
- **How can the platform remain fully functional when Earth communication is unavailable?**

**MOSAIC-9** is an explainable, deterministic onboard mission health intelligence and event-reconstruction system. It traces changing health indicators over time, reconstructs multi-day precursor chains, and provides actionable clinical intelligence to astronauts and ground flight surgeons.

### Core Workflow
```
COLLECT ➔ VALIDATE ➔ CONTEXTUALIZE ➔ ANALYZE ➔ RECONSTRUCT ➔ EXPLAIN ➔ REVIEW
```

---

## 2. Core Product Modules (Modules A – H)

| Module | Identifier | Description | Key Features |
|---|---|---|---|
| **Module A** | **Mission Command Center** | Real-time mission overview & crew status | Day 120 MET clock, active incident alert, crew matrix, cabin gas metrics (CO2 3.2 mmHg), DSN link latency. |
| **Module B** | **Mission Health Intelligence Ledger** | Central immutable chronological event stream | Filter by crew, category, day range, severity, and quality; provenance metadata inspector; manual crew observation logging. |
| **Module C** | **Personal Crew Health Twin** | Evolving individual baseline tracking | Individual resting baselines vs recent observations vs Z-score departures across 4 physiological domains. |
| **Module D** | **Temporal Relationship Intelligence** | Multi-domain lead-lag analytical engine | Earliest signal detection (Day 117 06:30 sleep drop), 5-day sequence progression, lead-lag cross-correlations ($r = -0.89$). |
| **Module E** | **Incident Reconstruction Workspace** | **Signature Feature of MOSAIC-9** | Interactive timeline reconstruction (-6h to -7d), evidence taxonomy tagging, missing data isolation, competing hypotheses. |
| **Module F** | **Countermeasure Scenario Sandbox** | Hypothetical physiological simulation | Interactive sliders for sleep delta, workload delta, ergometer watts, hydration volume; 48h recovery curves. |
| **Module G** | **Offline Mission Operations** | Local storage resilience & DSN simulator | SQLite local persistence, PWA service worker caching, simulated DSN loss-of-signal toggle, diagnostic snapshot export. |
| **Module H** | **Mission Ground Communication** | Structured clinical consultation brief | SBAR format (Situation, Background, Assessment, Recommendation), linked ledger IDs, offline queueing (`QUEUED_LOCAL`). |

---

## 3. Scientific Evidence Taxonomy

Every piece of evidence in MOSAIC-9 is strictly classified to maintain complete scientific integrity:

- **`OBSERVED FACT`** *(Cyan/Emerald)*: Primary sensor observation or verified crew check-in.
- **`DERIVED INDICATOR`** *(Blue)*: Algorithmic calculation from raw multi-sensor telemetry (e.g. ballistocardiographic sleep stage classification).
- **`TEMPORAL ASSOCIATION`** *(Amber)*: Chronological proximity where event A preceded event B, without claiming confirmed clinical causation.
- **`POSSIBLE EXPLANATION`** *(Purple)*: Medically plausible physiological hypothesis under onboard evaluation.
- **`MISSING EVIDENCE`** *(Rose Dashed)*: Unacquired or degraded telemetry streams explicitly highlighted with diagnostic confidence penalty.
- **`RECOMMENDED REVIEW`** *(Emerald)*: Actionable investigation steps for crew medical officers and ground flight surgeons.

---

## 4. Technical Architecture & Monorepo Structure

```
MOSAIC-9/
├── frontend/                  # React 18 / TypeScript / Vite / Tailwind CSS / Apache ECharts
│   ├── public/                # PWA Service Worker (sw.js)
│   ├── src/
│   │   ├── components/        # Reusable aerospace UI components & chart wrappers
│   │   ├── screens/           # 10 full-fidelity mission screens
│   │   ├── services/          # Resilient API client with transparent offline cache fallback
│   │   └── types/             # Type-safe TypeScript interfaces
├── backend/                   # Laravel 12 API Control Plane (PHP 8.4+)
│   ├── app/
│   │   ├── Http/Controllers/Api/ # Mission, Crew, Ledger, Incidents, Scenarios, Comms, Sync
│   │   └── Models/            # Eloquent ORM Models with type casting & relationships
│   ├── database/
│   │   ├── migrations/        # Relational schema migrations
│   │   └── seeders/           # Complete Day 116–120 scenario dataset
│   └── routes/api.php         # 22 REST API endpoints
├── intelligence/              # Python 3.12 Deterministic Intelligence Service
│   ├── app/
│   │   ├── main.py            # FastAPI service (Port 8100)
│   │   ├── baseline.py        # MAD, median, IQR, Z-scores, confidence evaluation
│   │   ├── temporal.py        # Lead-lag cross-correlation & change-point detection
│   │   ├── reconstruction.py  # Causal chain builder & scientific taxonomy classifier
│   │   └── simulation.py      # Countermeasure trajectory mathematical modeling
│   └── tests/                 # Pytest automated test suite
├── datasets/                  # Synthetic schemas and demonstration JSON models
├── documentation/             # Architecture, Data Dictionary, Research Sources, Walkthrough
├── scripts/                   # Automated start & test runner scripts
└── README.md
```

---

## 5. Quickstart & Installation Guide

### Prerequisites
- Node.js (v20+) & npm
- PHP (8.2+) with `pdo_sqlite` enabled
- Composer
- Python (3.11+)

### 1-Step Complete Start
```bash
./scripts/start-all.sh
```
This single script starts:
- Python FastAPI Intelligence Microservice on `http://127.0.0.1:8100`
- Laravel Backend API on `http://127.0.0.1:8000`
- React Frontend Application on `http://127.0.0.1:5173`

Open your browser at **`http://127.0.0.1:5173`**.

---

## 6. Automated Verification & Test Suite

MOSAIC-9 includes end-to-end automated testing across all layers:
```bash
./scripts/run-tests.sh
```
This executes:
1. **Python Intelligence Tests (Pytest):** 7/7 passed — tests baseline calculations, confidence penalties on missing data, lead-lag correlation, and scenario simulations.
2. **Laravel Backend Tests (PHPUnit):** 7/7 passed (55 assertions) — tests mission overview, crew twins, ledger filtering, incident reconstruction taxonomy, and ground communications queueing.
3. **Frontend Tests (Vitest):** 3/3 passed — tests status logic and scientific taxonomy boundaries.

---

## 7. The Demonstration Scenario (Commander Alex Morgan)

MOSAIC-9 includes a coherent multi-day scenario calibrated to NASA HRP baseline models:

- **Mission Day 116 (Baseline):** Sleep duration 7.8h, Resting HR 61 bpm, HRV RMSSD 58 ms, planned cycle ergometer session completed at 186W.
- **Mission Day 117 (Onset):** ECLSS audio alarm drill at 02:45 curtails sleep to 5.4h (-2.6σ deviation). **Identified by MOSAIC-9 as the First Unusual Signal.**
- **Mission Day 118 (Divergence):** Workload surge (10.5h); cycle ergometer session aborted after 28 min at 145W (-3.3σ deviation); cabin CO2 rises to 3.5 mmHg.
- **Mission Day 119 (Vulnerability):** Fatigue self-reported at 7/10; PVT reaction latency spikes to 310 ms (+44%); cycle ergometer omitted; autonomic vagal tone severely suppressed (HRV 32 ms).
- **Mission Day 120 (Acute Incident):** Acute orthostatic dizziness at 09:42 MET upon vertical egress in airlock; blood pressure collapses to 88/56 mmHg with compensatory tachycardia of 118 bpm.

### Crew Condition Variants
1. **Commander Alex Morgan (`REVIEW_REQUIRED`):** Focal acute presyncope episode with 72h multi-domain reconstruction.
2. **Dr. Sarah Chen (`STABLE`):** 100% countermeasure adherence, normal autonomic sinus rhythm.
3. **Marcus Vance (`WATCH`):** High maintenance workload and mild sleep restriction.
4. **Elena Rostova (`UNKNOWN`):** Biometric patch telemetry offline. **Demonstrates that missing data reduces confidence (41%) rather than assuming false normality.**

---

## 8. Scientific Integrity & NASA Research Context

- **NASA Human Research Program (HRP):** Directly addresses the *Risk of Orthostatic Intolerance*, *Risk of Performance Decrements from Sleep Loss*, and *In-Flight Countermeasure Adherence*.
- **NASA Open Science Data Repository (OSDR):** Incorporates biomarker normalization conventions from GeneLab spaceflight datasets.
- **NASA DONKI Context:** Distinguishes external space weather radiation alerts from an astronaut's tissue-absorbed internal dose.
- **100% Synthetic Telemetry:** All astronaut names, telemetry streams, and incidents are synthetic models. No private medical records are accessed.

---

## 9. AI Usage Disclosure & Open-Source License

- **AI Usage:** An AI assistant was used for codebase scaffolding and documentation drafting. All core analytical algorithms, baseline statistics, lead-lag correlations, and countermeasure simulations are deterministic Python and PHP code.
- **License:** Open source under the [MIT License](LICENSE).
