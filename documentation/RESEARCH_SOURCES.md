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
- **Role in MOSAIC-9:** Provides reference statistical normalization distributions for astronaut phenotypic biomarkers across multi-day spaceflight missions (e.g. GeneLab, Ames Life Sciences Portal).
- **Application:** Used to calibrate the personal baseline calculation engine (MAD, median, and Z-score boundaries).

### 2.2 NASA DONKI (Database Of Notifications, Knowledge, and Information)
- **Role in MOSAIC-9:** Provides space weather event contexts (e.g., Coronal Mass Ejections, Solar Energetic Particle events).
- **Critical Distinction:** MOSAIC-9 explicitly differentiates DONKI external space weather alerts from an astronaut's tissue-absorbed radiation dose measured by internal silicon micro-dosimeters.

---

## 3. Scientific Integrity & Ethical Standards

1. **No Access to Private Astronaut Health Telemetry:** All astronaut identities, missions, and physiological measurements in MOSAIC-9 are 100% fictional models created for competition demonstration.
2. **Transparent Synthetic Tagging:** Every data record, chart, and report is explicitly labeled `SYNTHETIC RESEARCH TELEMETRY`.
3. **No Autonomous Clinical Diagnosis:** The system provides event reconstruction, timeline alignment, and explainable evidence. It assists human flight surgeons rather than replacing medical judgment.
4. **Deterministic Analytical Math:** The core temporal relationships, anomaly detection, and simulation projections are computed using deterministic Python algorithms and validated statistical models, not probabilistic LLM text generation.
