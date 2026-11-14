# MOSAIC-9 — Final Known Limitations & Technical Boundaries

**Project:** MOSAIC-9 — Mission Health Event Reconstruction for Deep-Space Crews  
**Team:** TESSERA FLIGHT LAB  
**Competition:** NASA Space Apps Challenge 2026  
**Document Purpose:** Truthful, transparent disclosure of system boundaries, mathematical assumptions, and engineering limitations.

---

## 1. Synthetic Telemetry & Data Scope

1. **Synthetic Generation:**
   - In strict compliance with NASA Space Apps Challenge rules and medical privacy regulations, **100% of data within MOSAIC-9 is synthetic research telemetry**.
   - No classified astronaut biometrics or private protected health information (PHI) is accessed or simulated.
   - While parameter distributions are mathematically calibrated against published NASA Human Research Program (HRP) literature (e.g., bed rest studies, ISS cycle ergometer logs, PVT fatigue benchmarks), real-world human physiology exhibits stochastic biological variability beyond our deterministic distributions.

2. **Astronaut Identities:**
   - All crew members (Commander Alex Morgan, Dr. Sarah Chen, Marcus Vance, Elena Rostova) are fictional mission archetypes designed to demonstrate specific operational scenarios (`STABLE`, `WATCH`, `REVIEW_REQUIRED`, `UNKNOWN`).

3. **NASA OSDR & HRP Contextual Evidence Boundaries:**
   - While MOSAIC-9 integrates verified published metadata from NASA Open Science Data Repository (`OSD-575`, `OSD-635`, `OSD-571`) and NASA Human Research Program Evidence Reports, these studies serve strictly as **contextual scientific references** (`NASA_RESEARCH_CONTEXT`).
   - **`OSD-575` (`GLDS-566`):** Profiles pre-flight and post-flight venous blood serum metabolic and cytokine panels across $n=4$ SpaceX Inspiration4 civilian astronauts (`10.1038/s41586-024-07639-y`). It does **not** represent continuous beat-to-beat wearable in-flight telemetry.
   - **`OSD-635` (`GLDS-608`):** Profiles RNA-Seq transcriptomics of primary human aortic smooth muscle cells (HASMCs) cultured *in vitro* for 3 days aboard the ISS (`10.26030/dc7p-2947`). Cellular mechanotransduction findings *in vitro* do **not** equate to direct *in vivo* astronaut arterial blood pressure or baroreflex measurements.

---

## 2. Analytical Intelligence & Statistical Limits

1. **Pearson Correlation Sample Sizes:**
   - Cross-domain lead-lag relationships are computed across discrete multi-day operational windows ($n=5$ daily summary points, $df=3$).
   - While effective for demonstrating directional co-movement and temporal ordering in a mission operations context, correlations with small sample sizes ($n < 30$) carry elevated statistical variance and must not be interpreted as statistically powered epidemiological evidence.
   - The platform strictly enforces this boundary in UI tooltips: **Correlation does not establish causation.**

2. **Empirical Confidence Scores:**
   - Confidence scores are calculated using a heuristic multi-factor weighting scheme:
     $$\text{Confidence} = (C \times 0.40) + (Q \times 0.35) + (S \times 0.25) \times \text{StalenessPenalty} \times \text{BaselineFactor}$$
     Where $C$ is data completeness, $Q$ is sensor provenance quality, and $S$ is sample adequacy.
   - These scores are heuristic approximations engineered for mission triage. They are **not calibrated against a gold-standard clinical diagnostic validation cohort**.

3. **Countermeasure Trajectory Sandbox, Multi-Scenario Trade-Offs & Sensitivity Analysis:**
   - The Scenario Sandbox and Multi-Scenario Trade-Off Engine employ bounded linear and saturation recovery approximations based on aerospace physiology rules of thumb (e.g., $+1.0\text{h}$ sleep recovery yields $\sim 7.2\text{ ms}$ HRV restoration; $+1000\text{ mL}$ oral rehydration yields $\sim 14.5\text{ mmHg}$ systolic BP support).
   - Multi-objective trade-off scores (across 8 dimensions) and One-at-a-Time (OAT) parameter sensitivity rankings identify Pareto non-dominated operational options, but **never declare a single medically optimal prescription**.
   - Projections do not simulate full non-linear multi-scale hemodynamic finite-element models or individual pharmacokinetics, and are explicitly labeled `SIMULATED DATA`, `EXPLORATORY SCENARIO`, and `NOT A CLINICAL RECOMMENDATION`.

4. **No Automated Medical Diagnosis:**
   - MOSAIC-9 is an explainable intelligence and event-reconstruction platform, not an autonomous robotic medical officer.
   - It outputs structured chronological findings, evidence nodes, missing observations, and draft SBAR consultation briefs for human flight surgeons. It never issues diagnostic decrees or autonomously prescribes pharmaceuticals.

---

## 3. Storage, Security & Offline Infrastructure

1. **Storage Encryption Disclosure:**
   - Onboard database persistence utilizes local SQLite 3 with Write-Ahead Logging (WAL). It does **not** employ SQLCipher database-level encryption at rest.
   - Client-side offline buffering utilizes browser `localStorage` (`mosaic_offline_ledger_events`, `mosaic_offline_ground_comms`). Browser `localStorage` is standard plaintext web storage subject to per-origin browser quota limitations (typically 5 MB).
   - Exported diagnostic snapshots are plaintext structured JSON archives; they are **not encrypted**.

2. **Deep Space Network Simulation:**
   - The DSN link controller simulates orbital occultation (Loss of Signal), interplanetary one-way light delay (21.0 minutes to Mars), and high-gain ground windows through a deterministic software state machine. It does not interface with actual Deep Space Network radio frequency transponders.

3. **Authentication & Multi-Tenancy:**
   - To ensure frictionless review and demonstration during competition judging, the application does not mandate OAuth2/OIDC login gates. Access controls are simplified for mission role inspection.

4. **Hardware Environment:**
   - The platform is developed and verified for standard Linux/macOS server environments and modern web browsers. It has not been compiled for radiation-hardened flight avionics processors (e.g., BAE RAD750 or Vorago ARM Cortex).

---

## 4. Summary Table of Known Boundaries

| Dimension | Implemented Reality | Known Boundary / Limitation |
| :--- | :--- | :--- |
| **Telemetry** | 100% Synthetic research data | Does not represent real astronaut PHI. |
| **Statistics** | Pearson lead-lag cross-correlation ($n=5$) | Small sample operational window; co-movement only, not proof of causation. |
| **Confidence** | Multi-factor heuristic formula (0.0 – 1.0) | Heuristic score; not clinically calibrated against diagnostic trials. |
| **Projections** | 48-hour bounded physiological recovery approximation | Simplified physiological modeling; not a guaranteed clinical prognosis. |
| **Local Storage** | SQLite WAL + Browser `localStorage` | Plaintext local persistence; not encrypted at rest. |
| **Comms Link** | Software link simulator (LOS / 21m delay / High-Gain) | Simulated space communication state machine. |
