# MOSAIC-9 — Final Known Limitations & Epistemic Boundaries

> **System Designation:** MOSAIC-9 Operational Limitations & Scientific Disclosures  
> **Evaluation Date:** November 15, 2026  
> **Ethical & Scientific Commitment:** Uncompromising Transparency on Engineering Scope, Statistical Power, and Clinical Boundaries

---

## 1. Primary Operational & Regulatory Disclaimers

> [!CAUTION]
> **PROTOTYPE DECISION SUPPORT SOFTWARE — NOT A CLINICALLY CERTIFIED MEDICAL DEVICE**  
> MOSAIC-9 is an exploratory aerospace software prototype developed for the NASA International Space Apps Challenge. It is designed to demonstrate operational concepts for deep-space mission health incident reconstruction, multi-sensor data synchronization, and countermeasure trade-off optimization.  
> 
> **It is NOT flight-certified software (DO-178C / NASA-STD-8719.13). It is NOT a clinical diagnostic device approved by the FDA, ESA, or NASA Office of the Chief Health and Medical Officer (OCHMO). It must NEVER be used to direct real-world patient care, modify clinical prescription protocols, or replace the clinical judgment of a qualified terrestrial Flight Surgeon or Crew Medical Officer.**

---

## 2. Comprehensive Inventory of Known Limitations

### 2.1 Synthetic Mission & Clinical Data
- **Synthetic Nature of ARES-IV:** All telemetry streams, physiological observations, incident timelines, mission logs, and astronaut medical records for the synthetic *ARES-IV Transit to Mars* mission are synthetically generated.
- **Scientific Grounding:** The synthetic waveforms, vital sign perturbations, and symptom timelines were designed around real aerospace medical literature, microgravity bed-rest studies, and published NASA Human Research Program (HRP) evidence books. However, they do not reflect real human clinical incidents from active astronauts.
- **NASA OSDR Data Boundary:** Real data from the NASA Open Science Data Repository (`OSD-575`, `OSD-571`, `OSD-635`) are integrated as external reference literature and molecular context. They are **not** real-time in-flight biosensor telemetry from the synthetic crew members.

### 2.2 Small Operational Sample Sizes ($n=4\text{ to }5, df=2\text{ to }3$)
- **Operational Reality:** In deep-space operational medicine, clinical incidents occur in single individuals over short temporal observation windows (e.g., 3 to 5 operational duty shifts preceding an acute event).
- **Statistical Statistical Vulnerability:** 
  - The empirical Pearson correlation between Workload Task Extension and Countermeasure Non-Compliance ($r = -0.38$) was computed across the 4-day pre-incident operational window (Days 116–119).
  - With $n = 4$ observations, the degrees of freedom are $df = n - 2 = 2$.
  - While this accurately captures the empirical trajectory of Commander Alex Morgan's shift extension and workout abandonment, small sample sizes inherently have wide 95% confidence intervals and are vulnerable to outliers.
  - **MOSAIC-9 explicitly discloses sample sizes ($n$), degrees of freedom ($df$), and p-values on all analytic screens.**

### 2.3 Statistical Correlation vs. Clinical Causation
- **Correlation $\neq$ Etiology:** Calculated temporal associations (such as sleep debt and autonomic vagal tone suppression) reflect observational covariance within the time-series window.
- **Multifactorial Etiology:** Real deep-space physiological decompensation is multifactorial, driven by simultaneous microgravity cephalad fluid shifts, radiation exposure, nutritional status, vestibular conflict, and individual genetic predispositions. Correlation scores should be interpreted as operational alert indicators, not definitive causal proofs.

### 2.4 Heuristic Confidence Scoring vs. Diagnostic Certainty
- **Algorithmic Nature:** The 0–100% "Confidence Scores" presented in the Incident Reconstruction and Temporal Intelligence engines are heuristic algorithmic estimations.
- **Underlying Formulation:** Scores are derived from sensor signal-to-noise ratio (SNR), temporal proximity, sampling frequency, and corroborating multi-channel indicators.
- **Limitation:** A 94% algorithmic confidence score indicates strong multi-sensor corroboration within the mathematical model; it does **not** indicate a 94% clinical probability of diagnosis in a patient.

### 2.5 Deterministic Linear Approximation in Countermeasure Simulations
- **Simulation Modeling Assumptions:** The Countermeasure Scenario Sandbox uses deterministic linear and piece-wise linear elasticities:
  $$\Delta \text{Safety} = \alpha \cdot \Delta \text{Sleep} + \beta \cdot \Delta \text{Fluid} + \gamma \cdot \Delta \text{Exercise}$$
- **Physiological Reality:** Human physiological systems are non-linear, homeostatically regulated, and subject to ceiling effects, receptor desensitization, and inter-individual biological variation.
- **Operational Utility:** The simulation sandbox is valuable for rapid, directional operational trade-off exploration (e.g., comparing sleep priority vs schedule maintenance); it does **not** provide guaranteed prognostic medical outcomes.

### 2.6 Offline Cache & Browser Storage Security
- **Storage Technology:** Client-side offline capability relies on browser `IndexedDB` and `localStorage`.
- **Security Limitation:** Data stored within standard browser storage is unencrypted at rest by default. In an enterprise flight deployment, local storage would require hardware-level AES-256 encryption or secure enclave binding.
- **Cache Persistence:** Local caches can be wiped if a user explicitly clears browser site data or invokes private browsing modes.

### 2.7 Service Worker & Cold-Boot Standalone Scope
- **Current Operational Profile:** MOSAIC-9 is designed as a local multi-tier architecture (React frontend + Laravel API + Python microservice).
- **PWA Scope:** While the frontend incorporates robust client-side caching and graceful network failure handlers, initial application bootstrapping requires active local daemon services. It is not currently packaged as a standalone, zero-backend progressive web app (PWA) capable of cold-boot initialization without local server processes.

---

## 3. Epistemic Integrity Commitments

To ensure absolute scientific honesty during evaluation, MOSAIC-9 adheres to three inviolable rules:
1. **Never conflate synthetic scenarios with real human clinical outcomes.**
2. **Never claim clinical diagnostic authority or flight certification.**
3. **Always display sample sizes, statistical degrees of freedom, and model boundaries openly.**
