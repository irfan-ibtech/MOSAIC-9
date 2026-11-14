# MOSAIC-9 — Scientific Research Context & Sources

MOSAIC-9 is built upon established aerospace medicine literature, NASA Human Research Program (HRP) published evidence books, and open science data frameworks.

---

## 1. Key NASA Research Frameworks

### 1.1 NASA Human Research Program (HRP) Evidence Books
1. **Risk of Orthostatic Intolerance during and following Spaceflight**
   - *Key Finding:* Cephalad fluid shifts in microgravity cause rapid hypovolemia (10–15% plasma volume reduction within 48–72 hours). Upon upright postural change, inadequate baroreceptor vasoconstriction and lower-limb blood pooling lead to acute blood pressure drops and presyncope.
   - *MOSAIC-9 Implementation:* Governs the Day 120 presyncope reconstruction for Commander Alex Morgan, linking missed cycle ergometer exercise and fluid status to the orthostatic event.

2. **Risk of Performance Decrements and Disorders Related to Sleep Loss and Workload**
   - *Key Finding:* Cumulative sleep restriction (&lt; 6.0 hours per night) causes progressive neurobehavioral degradation, increased attentional lapses (&gt; 500 ms) on the Psychomotor Vigilance Task (PVT), and autonomic vagal tone suppression.
   - *MOSAIC-9 Implementation:* Governs the lead-lag relationship where nocturnal alarm interruptions on Day 117 initiated progressive autonomic and cognitive decline.

3. **Risk of Adverse Health Effects from In-Flight Countermeasure Non-Compliance**
   - *Key Finding:* Daily high-intensity aerobic exercise (cycle ergometer or treadmill) and resistive training are essential to maintain vascular compliance, cardiac mass, and stroke volume during transit.
   - *MOSAIC-9 Implementation:* Models the impact of abbreviated (Day 118) and omitted (Day 119) cycle ergometer sessions on orthostatic vulnerability.

---

## 2. NASA Open Science Data & Space Weather Integrations

### 2.1 NASA Open Science Data Repository (OSDR)
- **API Endpoints Integrated:**
  - `https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{OSD-ID}/`
  - `https://osdr.nasa.gov/osdr/data/osd/files/{OSD_NUMBER}`
- **Verified OSDR Studies Integrated in the Mission Evidence Graph & Evidence Library:**
  1. **`OSD-575` (`GLDS-566`): *SpaceX Inspiration4 Blood Serum Metabolic Panel and Cytokine Profiling Study***
     - *Organism / Cohort:* *Homo sapiens* (4 civilian astronauts on the 3-day SpaceX Inspiration4 orbital mission at 590 km altitude).
     - *Assay Types:* Comprehensive Metabolic Panel (CMP — Quest Diagnostics) and Multiplex Cytokine/Chemokine Profiling (Eve Technologies HD71 / Alamar NULISAseq) across pre-flight (L-92, L-44, L-3) and post-flight (R+1, R+45, R+82) venous serum samples.
     - *Publication & DOI:* *Nature* 632, 1145–1154 (2024), DOI `10.1038/s41586-024-07639-y` (Space Omics and Medical Atlas — SOMA).
     - *Explicit Scientific Boundary:* **Human pre/post-flight venous serum biomarkers — NOT continuous wearable in-flight hemodynamic telemetry.**
  2. **`OSD-635` (`GLDS-608`): *Spaceflight effects on human vascular smooth muscle cell phenotype and function***
     - *Organism / System:* *Homo sapiens* (Primary Human Aortic Smooth Muscle Cells — HASMCs cultured in microgravity aboard the ISS for 3 days vs 1g ground controls).
     - *Assay Types:* RNA Sequencing (RNA-Seq transcriptomics) and contractile/signaling pathway enrichment analysis (>4,400 differentially expressed genes including downregulation of contractile marker $\alpha\text{-SMA}$ and modulation of STAT3, NF$\kappa$B, PI3K/AKT, HIF-1$\alpha$, and endothelin signaling).
     - *Reference:* NASA OSDR Dataset `OSD-635` / `GLDS-608` (DOI `10.26030/dc7p-2947`).
     - *Explicit Scientific Boundary:* **In vitro cellular transcriptomics — NOT direct in vivo astronaut blood pressure or baroreflex monitoring.**
  3. **`OSD-571` (`GLDS-562`): *SpaceX Inspiration4 Blood Plasma Proteomics, Metabolomics, and Extracellular Vesicle Profiling***
     - *Organism / Cohort:* *Homo sapiens* (4 civilian astronauts, SpaceX Inspiration4), DOI `10.1038/s41586-024-07639-y`.
     - *Explicit Scientific Boundary:* Pre/post-flight venous plasma multi-omics context, not real-time crew wearable telemetry.

### 2.2 NASA DONKI (Database Of Notifications, Knowledge, and Information)
- **Role in MOSAIC-9:** Provides space weather event contexts (e.g., Coronal Mass Ejections, Solar Energetic Particle events).
- **Critical Distinction:** MOSAIC-9 explicitly differentiates DONKI external space weather alerts from an astronaut's tissue-absorbed radiation dose measured by internal silicon micro-dosimeters.

---

## 3. Scientific Integrity & Ethical Standards

1. **No Access to Private Astronaut Health Telemetry:** All astronaut identities, missions, and physiological measurements in MOSAIC-9 are 100% fictional models created for competition demonstration.
2. **Transparent Synthetic Tagging:** Every data record, chart, and report is explicitly labeled `SYNTHETIC RESEARCH TELEMETRY`.
3. **No Autonomous Clinical Diagnosis:** The system provides event reconstruction, timeline alignment, and explainable evidence. It assists human flight surgeons rather than replacing medical judgment.
4. **Deterministic Analytical Math:** The core temporal relationships, anomaly detection, and simulation projections are computed using deterministic Python algorithms and validated statistical models, not probabilistic LLM text generation.
