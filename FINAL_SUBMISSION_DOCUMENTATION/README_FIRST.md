# MOSAIC-9 — MISSION HEALTH EVENT RECONSTRUCTION FOR DEEP-SPACE CREWS

> **"Every Signal Has a Story."**  
> **Global Competition Phase v2.7 — Final Verified Submission**  
> **Competition:** NASA Space Apps Challenge 2026  
> **Challenge:** Create Health Monitoring Software for Astronauts on Space Missions  
> **Team:** TESSERA FLIGHT LAB  
> **Repository:** [https://github.com/irfan-ibtech/MOSAIC-9](https://github.com/irfan-ibtech/MOSAIC-9)  
> **Submission Date:** November 15, 2026 (Mission Elapsed Time Day 120, ARES-IV Mars Transit)

---

## 1. Executive Summary & Problem Context

During long-duration deep-space transit (such as a 9-month crewed transit to Mars), human spaceflight crews operate beyond the safety umbrella of real-time Earth telemedicine. At typical Earth–Mars orbital configurations, one-way light time (OWLT) communication latency ranges from **4.3 to 21.0+ minutes**, punctuated by planetary occultations and solar conjunctions that create total **Loss of Signal (LOS)** blackouts lasting hours or days.

In this operational environment, catastrophic clinical decompensation rarely occurs without warning. Instead, subtle, multi-system physiological and behavioral signals diverge across multiple days:
- Mild nocturnal sleep curtailment following audio alarms ($5.4\text{h}$ vs. $8.0\text{h}$ baseline)
- Unscheduled operational workload task extensions ($10.5\text{h}$ cargo handling)
- Progressive autonomic tone suppression (HRV RMSSD declining from $58\text{ ms}$ to $27\text{ ms}$)
- Exercise countermeasure truncation ($145\text{W}$) and subsequent complete workout omission ($0\text{W}$)
- Microgravity cephalad fluid redistribution and transient baroreflex attenuation

When an astronaut stands upright during rapid transit in an airlock node after 72 hours of cumulative deficit, acute orthostatic presyncope or syncope can occur. Conventional telemetry systems either alert too late (when arterial blood pressure has already collapsed to $88/56\text{ mmHg}$) or swamp crew flight surgeons with disconnected alarms.

**MOSAIC-9** solves this challenge by serving as an **onboard, offline-resilient, explainable mission health intelligence platform**. Rather than treating anomalies as isolated threshold breaches, MOSAIC-9 fuses multi-day cross-domain physiological telemetry, environmental logs, countermeasure history, and NASA spaceflight biomedical research (NASA OSDR and Human Research Program evidence) to reconstruct the preceding causal chain, visualize the evidence graph, and compute multi-objective countermeasure trade-offs.

---

## 2. Distinctive Capabilities

| Capability | What MOSAIC-9 Delivers | Scientific & Engineering Rigor |
| :--- | :--- | :--- |
| **6-Tier Epistemic Evidence Taxonomy** | Classifies every piece of data: Direct Telemetry, NASA Research Context, Derived Association, Exploratory Hypothesis, Missing Evidence, or Synthetic Simulation. | Eliminates false scientific overclaims; judges and flight surgeons always know what is empirical vs. simulated. |
| **Interactive Mission Evidence Graph** | Cytoscape/ECharts-driven directed bipartite graph connecting acute incident events to precursor observations, biological domains, hypotheses, and NASA OSDR studies. | Grounded in NASA OSDR datasets (`OSD-575`, `OSD-571`, `OSD-635`) and NASA Human Research Roadmap (HRR) risk portfolios. |
| **Chronological Event Replay** | Interactive 4-horizon timeline scrubber ($6\text{h}, 24\text{h}, 72\text{h}, 168\text{h}$) showing multi-day divergence across autonomic, sleep, cognitive, and musculoskeletal domains. | Reconstructs the exact chronological precursor chain leading up to acute decompensation. |
| **Multi-Objective Pareto Trade-Off Sandbox** | Evaluates 5 countermeasure recovery protocols across 8 operational/epistemic dimensions with mathematical Pareto non-dominated frontier visualization. | Evaluates physiological recovery vs. operational schedule continuity vs. exercise strain. Strictly labeled: *Simulated Data — Not a Clinical Prescription*. |
| **100% Cross-Crew Data Isolation** | Full operational partitioning across all 4 crew members: Commander Alex Morgan (Incident 1), Lead Engineer Marcus Vance (Incident 2), Dr. Sarah Chen (Nominal), and Elena Rostova (Sensor Dropout). | Zero cross-contamination. Selecting Dr. Sarah Chen displays zero anomalies; Elena Rostova correctly reflects sensor loss (`UNKNOWN` status, confidence penalized to $0.41$). |
| **Offline-Resilient SBAR Workspace** | Structured Situation-Background-Assessment-Recommendation briefing workspace with local buffer queueing during DSN occultation. | Autonomous onboard operation during communication blackout, with automatic ground synchronization when telemetry resumes. |

---

## 3. Technology Stack & Verified Architecture

- **Frontend Application:** React 18, TypeScript 5.5, Vite 5.4, Tailwind CSS, Lucide React icons, Apache ECharts (`echarts-for-react`).
- **Onboard API & Bridge:** Laravel 11 (PHP 8.2+), SQLite 3 with Write-Ahead Logging (WAL) mode, RESTful API architecture.
- **Intelligence Service:** Python 3.12, FastAPI, Uvicorn, NumPy, SciPy (multivariate signal processing and Pearson cross-correlation).
- **Automated Verification:** 53 unique automated tests (15 Pytest + 21 PHPUnit + 17 Vitest), 100% passing.

---

## 4. Quick Start: How to Run MOSAIC-9

### Prerequisites
- Node.js 18+ and `npm`
- PHP 8.2+ with `pdo_sqlite` extension
- Python 3.10+ with `venv`

### Single-Command Launch (Recommended)
From the repository root:
```bash
./scripts/run-all.sh
```
This script launches all three required services:
1. Python FastAPI Intelligence Service on `http://127.0.0.1:8100`
2. Laravel API Backend on `http://127.0.0.1:8000`
3. Vite React Frontend on `http://127.0.0.1:5173`

Open your browser to: **`http://127.0.0.1:5173`**

### Running the Full Automated Test Suite
```bash
./scripts/run-tests.sh
```
Or run each component independently:
```bash
# 1. Python Intelligence Tests (15 tests)
cd intelligence && source venv/bin/activate && pytest

# 2. Laravel Backend Tests (21 tests)
cd backend && php artisan test

# 3. Frontend Component & Logic Tests (17 tests)
cd frontend && npm run test
```

---

## 5. Main Application Modules

| Module | Navigation Item | Key Operations & Verification Checks |
| :---: | :--- | :--- |
| **Module A** | **Command Center** | Fleet operational status, active incidents, telemetry stream freshness, environmental parameters, and Deep Space Network link toggle. |
| **Module B** | **Crew Health Twin** | Dual baseline profile ($\mu_{\text{base}}$) vs. Day 120 current observation ($x_{\text{curr}}$) across all 4 crew members. Verify Sarah Chen shows nominal stability; Elena Rostova shows telemetry dropout. |
| **Module C** | **Domain Telemetry** | Multi-domain physiological streams (cardiovascular, sleep, musculoskeletal, environmental, cognitive PVT). |
| **Module D** | **Temporal Intelligence** | Cross-domain temporal correlations ($r = -0.89$, $r = -0.38$, $r = +0.93$) across Days 116–120. Notice explicit $n=4\text{–}5, df=2\text{–}3$ descriptive badges and causality disclaimers. |
| **Module E** | **Incident Reconstruction** | Reconstructs `INC-ARES4-120-001` (Alex Morgan Presyncope, BP `88/56 mmHg`) and `INC-ARES4-118-002` (Marcus Vance $\text{CO}_2$ Strain). Interactive 4-horizon replay scrubber. |
| **Module F** | **Scenario Sandbox** | 5-scenario trade-off matrix with Pareto frontier visualization. Explores recovery score vs. schedule disruption vs. exercise preservation. |
| **Module G** | **NASA Evidence Explorer** | Explores real NASA OSDR studies (`OSD-575`, `OSD-571`, `OSD-635`) and HRP risk portfolios (`HRP-CV-OI`, `HRP-SLEEP-CIRC`, `HRP-AERO-MUSC`, `HRP-ENV-CO2`). |
| **Module H** | **Ground Comms (SBAR)** | Structured clinical communication brief with simulated Earth DSN link latency and offline resilient transmission queue. |
| **Module I** | **Event Ledger** | Chronological mission event stream with SHA-256 tamper-evident verification. |
| **Module J** | **Evidence Graph** | Interactive bipartite evidence graph linking mission events to NASA research context and missing clinical evidence. |

---

## 6. Recommended 3-Minute Demo Flow for Judges

1. **Start at Command Center (Module A):** Introduce the ARES-IV Mars Transit scenario (Day 120). Point out the active incident alert on Commander Alex Morgan and the DSN occultation indicator.
2. **Examine Alex Morgan's Incident in Reconstruction (Module E):** Load `INC-ARES4-120-001`. Walk through the 72-hour pre-incident precursor chain. Demonstrate the chronological replay slider shifting across $6\text{h}$, $24\text{h}$, and $72\text{h}$ lookback windows.
3. **Inspect the Mission Evidence Graph (Module J):** Show how the acute presyncope event is linked to precursor sleep restriction, skipped ergometer workouts, and contextual NASA research (`NASA-OSD-575` serum proteomics and `NASA-HRP-CV-OI` orthostatic intolerance risk portfolio).
4. **Demonstrate Cross-Crew Data Isolation (Module B & D):** Switch the selected crew member to **Dr. Sarah Chen**. Show that her temporal analysis displays strictly 0 anomalies and baseline stability. Then switch to **Elena Rostova** to show how sensor dropout produces an `UNKNOWN` status and penalizes heuristic confidence to $41\%$.
5. **Evaluate Countermeasure Trade-Offs (Module F):** Open the Multi-Objective Scenario Sandbox. Compare Scenario Alpha against the other 4 candidate protocols. Explain the mathematical Pareto frontier (Recovery Score vs. Schedule Disruption vs. Exercise Strain).
6. **Ground Communication & SBAR Queue (Module H):** Show the generated clinical SBAR packet. Toggle the simulated DSN link to Loss of Signal (LOS) to demonstrate offline queueing in local browser/SQLite storage.

---

## 7. Important Scientific & Technical Boundaries

To preserve absolute scientific honesty and avoid hackathon overclaiming, MOSAIC-9 operates within strict declared boundaries:
1. **Synthetic Data:** The mission telemetry, astronaut roster, and acute incidents are synthetic scenarios calibrated to NASA Human Research Program flight data.
2. **Exploratory Small-Sample Correlations:** Displayed associations ($n = 4\text{–}5\text{ days}, df = 2\text{–}3$) are descriptive exploratory co-variations, not inferential statistical proofs. Statistical correlation does NOT establish mechanistic causality.
3. **Simulated Predictions:** Countermeasure projections are deterministic linear model approximations, NOT clinically validated prognostic guarantees or autonomous medical prescriptions.
4. **Contextual NASA Studies:** NASA OSDR datasets (`OSD-575`, `OSD-571`, `OSD-635`) provide contextual scientific literature; they do not represent continuous real-time in-flight astronaut biometric telemetry.
5. **No Standalone Cold-Boot PWA:** Offline operation requires the local server processes to be running; cold-booting in a disconnected browser without local server execution is not supported.

---

## 8. Final Submission Documentation Sitemap

All final competition deliverables are organized in this folder:

| Document | Purpose & Contents |
| :--- | :--- |
| **[`README_FIRST.md`](./README_FIRST.md)** | This document. Project overview, quick start, demo flow, and core capabilities. |
| **[`FINAL_PROJECT_REPORT.md`](./FINAL_PROJECT_REPORT.md)** | Comprehensive 360-degree technical and product report covering all 10 modules, data models, and verification. |
| **[`FINAL_DEMO_GUIDE.md`](./FINAL_DEMO_GUIDE.md)** | Step-by-step judge demonstration guide with exact speaking points and click path. |
| **[`FINAL_TECHNICAL_ARCHITECTURE.md`](./FINAL_TECHNICAL_ARCHITECTURE.md)** | In-depth engineering specifications: frontend, backend, Python engine, data flow, ports, and fallbacks. |
| **[`FINAL_EVIDENCE_AND_RESEARCH_SOURCES.md`](./FINAL_EVIDENCE_AND_RESEARCH_SOURCES.md)** | Full NASA OSDR and HRP evidence catalog with dataset DOIs, accessions, modalities, and explicit boundaries. |
| **[`FINAL_VALIDATION_AND_TEST_RESULTS.md`](./FINAL_VALIDATION_AND_TEST_RESULTS.md)** | Verifiable record of all 53 automated tests, build metrics, database backups, and smoke test outputs. |
| **[`FINAL_KNOWN_LIMITATIONS.md`](./FINAL_KNOWN_LIMITATIONS.md)** | Transparent, adversarial accounting of scientific, clinical, and software limitations. |
| **[`FINAL_SUBMISSION_CHECKLIST.md`](./FINAL_SUBMISSION_CHECKLIST.md)** | Actionable pre-submission verification checklist. |
