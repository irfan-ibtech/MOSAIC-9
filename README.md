# MOSAIC-9 — Mission Health Event Reconstruction for Deep-Space Crews

> **Every Signal Has a Story.**  
> *NASA Space Apps Challenge 2026 — Challenge: Create Health Monitoring Software for Astronauts on Space Missions.*  
> **Team:** TESSERA FLIGHT LAB

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build & Tests](https://img.shields.io/badge/Tests-50%20Passed%20(100%25)-emerald.svg)](scripts/run-tests.sh)
[![Architecture](https://img.shields.io/badge/Architecture-React%2018%20|%20Laravel%2012%20|%20FastAPI-06b6d4.svg)](documentation/ARCHITECTURE.md)
[![Ethical Standards](https://img.shields.io/badge/Telemetry-100%25%20Synthetic%20+%20NASA%20OSDR%2FHRP%20Context-purple.svg)](documentation/RESEARCH_SOURCES.md)

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
| **Module E** | **Incident Reconstruction & Evidence Graph** | **Signature Feature of MOSAIC-9** | Interactive timeline reconstruction (-6h to -7d), chronological Mission Event Replay, interactive Mission Evidence Graph linking NASA OSDR/HRP studies, 6-tier taxonomy tagging, missing data isolation, competing hypotheses. |
| **Module F** | **Scenario Sandbox & Trade-Off Engine** | Multi-objective simulation & sensitivity | Interactive sliders, 48h recovery curves, 5-scenario side-by-side comparison across 8 dimensions + Pareto frontier, OAT parameter sensitivity analysis, Mission Decision Report exporter. |
| **Module G** | **Offline Mission Operations** | Local storage resilience & DSN simulator | SQLite local persistence, PWA service worker caching, simulated DSN loss-of-signal toggle, diagnostic snapshot export. |
| **Module H** | **Mission Ground Communication** | Structured clinical consultation brief | SBAR format (Situation, Background, Assessment, Recommendation), linked ledger IDs, offline queueing (`QUEUED_LOCAL`). |
| **Module I** | **NASA Evidence Library** | OSDR & HRP Spaceflight Research Hub | Searchable catalog of NASA OSDR (`OSD-575`, `OSD-635`, `OSD-571`), NASA HRP Evidence Reports, NASA CCMC DONKI context, live/cached OSDR REST API connector, and 8-parameter telemetry dictionary. |

---

## 3. 6-Tier Scientific Evidence Taxonomy

Every piece of evidence in MOSAIC-9 is strictly classified to maintain complete scientific integrity:

- **`SYNTHETIC_OBSERVATION` / `DIRECT_OBSERVATION` (`OBSERVED_FACT`)** *(Cyan)*: Simulated crew telemetry, symptom report, mission event, or environmental measurement from the 100% synthetic ARES-IV mission dataset (`Synthetic Observation (Mission Record)` — not real astronaut flight telemetry).
- **`NASA_RESEARCH_CONTEXT`** *(Indigo)*: Published or curated NASA OSDR (`OSD-575 / LSDS-8`, `OSD-571 / GLDS-563`, `OSD-635 / GLDS-608`) or NASA HRP spaceflight evidence relevant to the observed domain.
- **`DERIVED_TEMPORAL_ASSOCIATION` (`DERIVED_INDICATOR` / `TEMPORAL_ASSOCIATION`)** *(Amber/Blue)*: Calculated baseline deviation, anomaly sequence, or lead-lag statistical relationship over finite lookback windows ($n=5$).
- **`EXPLORATORY_HYPOTHESIS` (`POSSIBLE_EXPLANATION`)** *(Purple)*: Candidate non-diagnostic explanation supported by observed telemetry and published spaceflight evidence.
- **`MISSING_EVIDENCE`** *(Rose Dashed)*: Unmeasured physiological or environmental variable that limits certainty and penalizes heuristic confidence.
- **`SYNTHETIC_SIMULATION`** *(Teal)*: Scenario projection, multi-objective trade-off score, or parameter sensitivity curve (`SCENARIO INPUT | SIMULATED OUTPUT | HUMAN REVIEW REQUIRED | NOT A CLINICAL RECOMMENDATION`).

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

MOSAIC-9 includes end-to-end automated testing across all layers (**50 / 50 tests passing**):
```bash
./scripts/run-tests.sh
```
This executes:
1. **Python Intelligence Tests (Pytest):** **15/15 passed** — tests baseline calculations, confidence penalties on missing data, lead-lag correlation, incident reconstruction, NASA OSDR/HRP evidence registry, Mission Evidence Graph, 5-scenario trade-off evaluation & Pareto frontier, OAT parameter sensitivity analysis, boundary conditions, and FastAPI endpoints.
2. **Laravel Backend Tests (PHPUnit):** **19/19 passed (189 assertions)** — tests mission overview, crew twins, ledger filtering, both incident reconstructions across all 4 horizons, NASA Evidence Library (`OSD-575`, `OSD-635`), graceful fallback on invalid/unavailable external OSDR study IDs, Mission Evidence Graph API, Multi-Scenario Trade-Off comparison, Sensitivity Analysis API, and offline ground communications queueing.
3. **Frontend Tests (Vitest):** **16/16 passed** — tests status logic, 6-tier evidence taxonomy, crew-specific simulation profiles, `OSD-575` & `OSD-635` attribution boundaries, Mission Evidence Graph, 5-scenario trade-offs, sensitivity ranking, and chronological replay consistency.

---

## 7. The Demonstration Scenarios (Alex Morgan & Marcus Vance)

MOSAIC-9 includes two coherent multi-day incident scenarios calibrated to NASA HRP baseline models:

### Incident 1: Commander Alex Morgan (`INC-ARES4-120-001` — Day 120 Orthostatic Presyncope)
- **Mission Day 116 (Baseline):** Sleep duration 7.8h, Resting HR 61 bpm, HRV RMSSD 58 ms, planned cycle ergometer session completed at 186W.
- **Mission Day 117 (Onset):** ECLSS audio alarm drill at 02:45 curtails sleep to 5.4h (-2.6σ deviation). **Identified by MOSAIC-9 as the First Unusual Signal.**
- **Mission Day 118 (Divergence):** Workload surge (10.5h); cycle ergometer session aborted after 28 min at 145W (-3.3σ deviation); cabin CO2 rises to 3.5 mmHg.
- **Mission Day 119 (Vulnerability):** Fatigue self-reported at 7/10; PVT reaction latency spikes to 310 ms (+44%); cycle ergometer omitted; autonomic vagal tone suppressed (HRV 32 ms).
- **Mission Day 120 (Acute Incident):** Acute orthostatic dizziness at 09:42 MET upon vertical egress in airlock; blood pressure drops to 88/56 mmHg with compensatory tachycardia of 118 bpm.

### Incident 2: Lead Flight Engineer Marcus Vance (`INC-ARES4-118-002` — Day 118 Hypercapnic Cephalalgia)
- **Mission Days 116–118:** Extended 12-hour manual coolant loop overhaul in confined Node 2 with localized cabin $\text{CO}_2$ pocket reaching 3.5 mmHg and sleep curtailment (6.0h vs 7.5h baseline), culminating in bilateral temporal headache and ocular fatigue.

### Crew Condition Variants
1. **Commander Alex Morgan (`REVIEW_REQUIRED`):** Focal acute presyncope episode with 72h multi-domain reconstruction.
2. **Dr. Sarah Chen (`STABLE`):** 100% countermeasure adherence, normal autonomic sinus rhythm.
3. **Marcus Vance (`WATCH`):** High maintenance workload, localized $\text{CO}_2$ exposure, and mild sleep restriction.
4. **Elena Rostova (`UNKNOWN`):** Biometric patch telemetry offline on Days 119–120. **Demonstrates that missing data reduces confidence (41%) rather than assuming false normality.**

---

## 8. Scientific Integrity & NASA Research Context

- **NASA Open Science Data Repository (OSDR):** Integrates verified study metadata and file manifests from:
  - **`OSD-575` (`LSDS-8`)**: *SpaceX Inspiration4 Blood Serum Metabolic Panel and Immune/Cardiac Cytokine Arrays* (Dataset DOI: `10.26030/mc5d-p710`; associated SOMA publication DOI: `10.1038/s41586-024-07639-y`, 4 astronauts across timepoints `L-92, L-44, L-3, R+1, R+45, R+82`).
  - **`OSD-571` (`GLDS-563`)**: *SpaceX Inspiration4 Plasma Profiling: Proteomics, EVPs, Metabolomics, cfDNA Sequencing and cfRNA Sequencing Study* (Dataset DOI: `10.26030/h3p5-tc29`; distinct from `OSD-570 / GLDS-562`).
  - **`OSD-635` (`GLDS-608`)**: *Spaceflight effects on human vascular smooth muscle cell phenotype and function* (Dataset DOI: `10.26030/8n5a-q187`).
  - Explicitly distinguishes `OSD-575` and `OSD-571` (pre/post-flight human venous serum/plasma biomarkers across 4 astronauts) and `OSD-635` (*in vitro* vascular smooth muscle cell RNA-Seq on the ISS) from continuous wearable astronaut telemetry.
- **NASA Human Research Program (HRP):** Maps internal application reference IDs (`HRP-CV-OI`, `HRP-SLEEP-CIRC`, `HRP-AERO-MUSC`, `HRP-ENV-CO2`) to official NASA Human Research Roadmap (HRR) Risk records:
  - *Risk of Cardiovascular Adaptations Contributing to Adverse Mission Performance and Health Outcomes* (`https://humanresearchroadmap.nasa.gov/Risks/risk.aspx?i=179`)
  - *Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload* (`https://humanresearchroadmap.nasa.gov/Risks/risk.aspx?i=100`)
  - *Risk of Impaired Performance Due to Reduced Muscle Mass, Strength, and Cardiorespiratory Endurance* (`https://humanresearchroadmap.nasa.gov/evidence/`)
  - *Risk of Nominal Acute and Chronic Ambient Carbon Dioxide Exposure in Crewed Vehicles Leading to In-Mission Health Effects or Performance Decrements (CO2 Risk)* (`https://humanresearchroadmap.nasa.gov/evidence/`)
- **NASA DONKI Context:** Distinguishes external space weather radiation alerts from an astronaut's tissue-absorbed internal dose.
- **100% Synthetic Crew Telemetry:** All astronaut names, mission telemetry streams, and incidents are synthetic models. No private medical records are accessed.

---

## 9. AI Usage Disclosure & Open-Source License

- **AI Usage:** An AI assistant was used for codebase scaffolding and documentation drafting. All core analytical algorithms, baseline statistics, lead-lag correlations, and countermeasure simulations are deterministic Python and PHP code.
- **License:** Open source under the [MIT License](LICENSE).
