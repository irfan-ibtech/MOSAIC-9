# MOSAIC-9 — Scientific Research Context & Sources

MOSAIC-9 is built upon established aerospace medicine literature, NASA Human Research Program (HRP) published evidence books, and open science data frameworks.

---

## 1. Key NASA Research Frameworks

### 1.1 NASA Human Research Program (HRP) Official Risk Records
*Note: Identifiers `HRP-CV-OI`, `HRP-SLEEP-CIRC`, `HRP-AERO-MUSC`, and `HRP-ENV-CO2` are internal MOSAIC-9 application reference keys mapped to the official NASA Human Research Roadmap (HRR) records below (`https://humanresearchroadmap.nasa.gov/evidence/`).*

1. **Risk of Cardiovascular Adaptations Contributing to Adverse Mission Performance and Health Outcomes** (`https://humanresearchroadmap.nasa.gov/Risks/risk.aspx?i=179` — Internal App ID: `HRP-CV-OI`)
   - *Key Finding:* Cephalad fluid shifts in microgravity cause rapid hypovolemia (10–15% plasma volume reduction within 48–72 hours). Upon gravitational or postural transitions, attenuated baroreceptor sensitivity and diminished vascular smooth muscle responsiveness contribute to orthostatic intolerance and presyncope.
   - *MOSAIC-9 Implementation:* Contextualizes the Day 120 presyncope reconstruction for Commander Alex Morgan (`INC-ARES4-120-001`), linking missed cycle ergometer exercise and fluid status to the orthostatic event.

2. **Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload** (`https://humanresearchroadmap.nasa.gov/Risks/risk.aspx?i=100` — Internal App ID: `HRP-SLEEP-CIRC`)
   - *Key Finding:* Cumulative sleep restriction (&lt; 6.0 hours per night) and operational schedule compression are associated with neurobehavioral degradation, increased reaction latency on the Psychomotor Vigilance Task (PVT), and autonomic vagal tone suppression.
   - *MOSAIC-9 Implementation:* Contextualizes the lead-lag temporal sequence where nocturnal alarm interruptions on Day 117 preceded progressive autonomic and cognitive decline.

3. **Risk of Impaired Performance Due to Reduced Muscle Mass, Strength, and Cardiorespiratory Endurance** (`https://humanresearchroadmap.nasa.gov/evidence/` — Internal App ID: `HRP-AERO-MUSC`)
   - *Key Finding:* Regular aerobic exercise (cycle ergometer or treadmill) and resistive training support vascular compliance, stroke volume, and plasma volume maintenance during transit.
   - *MOSAIC-9 Implementation:* Contextualizes the impact of abbreviated (Day 118) and omitted (Day 119) cycle ergometer sessions on orthostatic vulnerability.

4. **Risk of Nominal Acute and Chronic Ambient Carbon Dioxide Exposure in Crewed Vehicles Leading to In-Mission Health Effects or Performance Decrements (CO2 Risk)** (`https://humanresearchroadmap.nasa.gov/evidence/` — Internal App ID: `HRP-ENV-CO2`)
   - *Key Finding:* Spacecraft hypercapnia literature documents an increased probability of headache reporting, cerebral vasodilation, and fatigue as ambient $\text{ppCO}_2$ rises across 2.5–5.0 mmHg, while emphasizing substantial inter-individual sensitivity variation and the absence of a single universal deterministic headache threshold.
   - *MOSAIC-9 Implementation:* Contextualizes Lead Flight Engineer Marcus Vance's Day 118 (`19:15 MET`) incident (`INC-ARES4-118-002`) during a 12-hour Node 2 coolant loop maintenance shift where localized $\text{CO}_2$ reached `3.5 mmHg` (a synthetic scenario parameter).

---

## 2. NASA Open Science Data & Space Weather Integrations

### 2.1 NASA Open Science Data Repository (OSDR)
- **API Endpoints Integrated:**
  - `https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{OSD-ID}/`
  - `https://osdr.nasa.gov/osdr/data/osd/files/{OSD_NUMBER}`
- **Verified OSDR Studies Integrated in the Mission Evidence Graph & Evidence Library:**
  1. **`OSD-575` (`LSDS-8`): *SpaceX Inspiration4 Blood Serum Metabolic Panel and Immune/Cardiac Cytokine Arrays***
     - *Study URL:* `https://osdr.nasa.gov/bio/repo/data/studies/OSD-575`
     - *Repository Identifier:* **`LSDS-8`** (not `GLDS-566`).
     - *Dataset DOI:* **`10.26030/mc5d-p710`** (distinct from the associated broad SOMA *Nature* publication DOI `10.1038/s41586-024-07639-y`).
     - *Organism / Cohort:* *Homo sapiens* (4 civilian astronauts on the 3-day SpaceX Inspiration4 orbital mission at 590 km altitude).
     - *Sample Timepoints:* **`L-92, L-44, L-3, R+1, R+45, R+82`**.
     - *Assay Types:* Comprehensive Metabolic Panel (CMP — Quest Diagnostics) and Multiplex Immune & Cardiac Cytokine/Chemokine Arrays (Eve Technologies).
     - *Explicit Scientific Boundary:* **Human pre/post-flight venous serum biomarkers — NOT continuous wearable in-flight hemodynamic telemetry.**
  2. **`OSD-571` (`GLDS-563`): *SpaceX Inspiration4 Plasma Profiling: Proteomics, EVPs, Metabolomics, cfDNA Sequencing and cfRNA Sequencing Study***
     - *Study URL:* `https://osdr.nasa.gov/bio/repo/data/studies/OSD-571`
     - *Repository Identifier:* **`GLDS-563`** (`GLDS-562` belongs to `OSD-570`, not `OSD-571`).
     - *Dataset DOI:* **`10.26030/h3p5-tc29`** (associated SOMA publication DOI: `10.1038/s41586-024-07639-y`).
     - *Organism / Cohort:* *Homo sapiens* (4 civilian astronauts, SpaceX Inspiration4 across `L-92, L-44, L-3, R+1, R+45, R+82`).
     - *Assay Types:* LC-MS/MS Plasma Proteomics, Extracellular Vesicle Profiling (EVPs), Untargeted Plasma Metabolomics, and Cell-Free DNA/RNA (`cfDNA` / `cfRNA`) Sequencing.
     - *Explicit Scientific Boundary:* **Pre/post-flight venous plasma multi-omics context — NOT real-time crew wearable telemetry.**
  3. **`OSD-635` (`GLDS-608`): *Spaceflight effects on human vascular smooth muscle cell phenotype and function***
     - *Study URL:* `https://osdr.nasa.gov/bio/repo/data/studies/OSD-635`
     - *Repository Identifier:* **`GLDS-608`**.
     - *Dataset DOI:* **`10.26030/8n5a-q187`**.
     - *Organism / System:* *Homo sapiens* (Primary Human Aortic Smooth Muscle Cells — HASMCs cultured in microgravity aboard the ISS for 3 days vs 1g ground controls).
     - *Assay Types:* RNA Sequencing (RNA-Seq transcriptomics) and contractile/signaling pathway enrichment analysis (>4,400 differentially expressed genes including downregulation of contractile marker $\alpha\text{-SMA}$ and modulation of STAT3, NF$\kappa$B, PI3K/AKT, HIF-1$\alpha$, and endothelin signaling).
     - *Explicit Scientific Boundary:* **In vitro cellular transcriptomics — NOT direct in vivo astronaut blood pressure or baroreflex monitoring.**

### 2.2 NASA DONKI (Database Of Notifications, Knowledge, and Information)
- **Role in MOSAIC-9:** Provides space weather event contexts (e.g., Coronal Mass Ejections, Solar Energetic Particle events).
- **Critical Distinction:** MOSAIC-9 explicitly differentiates DONKI external space weather alerts from an astronaut's tissue-absorbed radiation dose measured by internal silicon micro-dosimeters.

---

## 3. Scientific Integrity & Ethical Standards

1. **No Access to Private Astronaut Health Telemetry:** All astronaut identities, missions, and physiological measurements in MOSAIC-9 are 100% fictional models created for competition demonstration.
2. **Transparent Synthetic Tagging:** Every data record, chart, and report is explicitly labeled `SYNTHETIC RESEARCH TELEMETRY`.
3. **No Autonomous Clinical Diagnosis:** The system provides event reconstruction, timeline alignment, and explainable evidence. It assists human flight surgeons rather than replacing medical judgment.
4. **Deterministic Analytical Math:** The core temporal relationships, anomaly detection, and simulation projections are computed using deterministic Python algorithms and validated statistical models, not probabilistic LLM text generation.
