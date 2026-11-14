# MOSAIC-9 — FINAL JUDGE DEMONSTRATION GUIDE

**Presentation Format:** 3–5 Minute Live Hackathon Walkthrough  
**Project:** MOSAIC-9 — Mission Health Event Reconstruction for Deep-Space Crews  
**Tagline:** Every Signal Has a Story.  
**Target Audience:** NASA Space Apps Challenge Judges, Aerospace Medicine Specialists, Software Evaluators  
**Live URL:** `http://localhost:5173` (or production host)

---

## 1. Demonstration Strategy & Timing Breakdown

```text
================================================================================================
MOSAIC-9 DEMO TIMELINE (Total: 4 Minutes 30 Seconds)
================================================================================================
Time Window   Phase                    Key Action / Screen                     Core Takeaway
------------------------------------------------------------------------------------------------
0:00 - 0:45   1. The Deep-Space Hook   Module A: Command Center                21-min delay; signals diverge silently
0:45 - 1:45   2. Incident Narrative    Module E: Incident Reconstruction       72h precursor chain; BP 88/56 mmHg
1:45 - 2:30   3. Evidence Graph        Module J: Mission Evidence Graph        NASA OSDR & HRP integration
2:30 - 3:15   4. Crew Data Isolation   Module B & D: Crew Twin & Temporal      Sarah Chen (0 anomalies); Elena (dropout)
3:15 - 3:55   5. Scenario Trade-offs   Module F: Scenario Sandbox & Pareto     Mathematical trade-offs, not guesses
3:55 - 4:30   6. Offline SBAR & Close  Module H: Ground Comms & DSN Link       Autonomous queueing during occultation
================================================================================================
```

---

## 2. Phase-by-Phase Walkthrough Script

### Phase 1: The Deep-Space Hook (0:00 – 0:45)
- **Starting Screen:** **Module A — Command Center** (`/` or click `COMMAND CENTER` in header navigation).
- **Presenter Script:**
  > *"Judges, imagine a crew on Day 120 of transit to Mars. Earth is millions of kilometers away. Communication latency is 21 minutes one-way, and when the planet slips behind Mars, there is total loss of signal. If an astronaut collapses, Earth flight surgeons cannot help in real time.*  
  > *Catastrophic health events rarely happen out of nowhere. Long before Commander Alex Morgan suffered acute presyncope in the airlock node, subtle physiological signals were diverging across multiple days. MOSAIC-9 was built to reconstruct that story."*
- **Click Action:** Point to the top telemetry banner showing **Mission Elapsed Time: Day 120**, **One-Way Light Time: 21.0 Minutes**, and the active **Alert: Incident INC-ARES4-120-001 (Commander Alex Morgan)**.
- **Mandatory Disclosure Point #1:** State clearly: *"All crew telemetry in this demonstration represents synthetic spaceflight data calibrated to NASA Human Research Program parameters."*

---

### Phase 2: The Incident Narrative & Chronological Replay (0:45 – 1:45)
- **Screen:** Navigate to **Module E — Incident Reconstruction** (`/reconstruction`).
- **Presenter Script:**
  > *"Here is Incident INC-ARES4-120-001. At 09:42 MET, Commander Morgan stood up in the airlock node and experienced acute visual tunneling and postural instability. Blood pressure collapsed to 88/56 mmHg, with a compensatory heart rate spike to 118 bpm.*  
  > *Traditional systems treat this as an isolated event. MOSAIC-9 traces the preceding 72-hour timeline.*  
  > *Three days prior, a false alarm disrupted his sleep to 5.4 hours. The next day, an extended 10.5-hour cargo task competed with exercise, forcing him to abort his cycle ergometer session early at 145W. By Day 119, exhaustion caused him to skip his workout entirely. His parasympathetic HRV RMSSD plummeted from 58ms to 27ms. When he stood up on Day 120, his microgravity-adapted baroreflex decoupled, causing immediate presyncope."*
- **Click Action:** Interact with the **Chronological Replay Horizons**:
  - Click `72h Lookback` to reveal the entire multi-day multi-domain precursor sequence.
  - Step through the timeline cards highlighting sleep curtailment, skipped countermeasures, and vagal tone collapse.

---

### Phase 3: The Mission Evidence Graph (1:45 – 2:30)
- **Screen:** Navigate to **Module J — Evidence Graph** (`/evidence-graph`).
- **Presenter Script:**
  > *"How do we ground this clinical reconstruction in aerospace science without making unsubstantiated claims? We created the Mission Evidence Graph.*  
  > *Every event is classified using our 6-tier epistemic taxonomy. Green nodes are direct onboard telemetry. Blue nodes connect directly to real NASA Open Science Data Repository studies—such as OSD-575, which examined serum multi-omics from four civilian astronauts on SpaceX Inspiration4, and OSD-635, which investigated human aortic smooth muscle cells cultured on the ISS.*  
  > *Notice that we explicitly label missing evidence in red, such as the absence of continuous arterial tonometry, which transparently penalizes our confidence score from 98% to 88%."*
- **Click Action:** Click on node `NASA-OSD-575` on the graph canvas to inspect its metadata panel (Dataset DOI: `10.26030/mc5d-p710`, sample timepoints `L-92` through `R+82`).
- **Mandatory Disclosure Point #2:** State: *"NASA OSDR studies provide contextual literature grounding; they do not represent continuous real-time in-flight astronaut biometric telemetry."*

---

### Phase 4: Strict Cross-Crew Data Isolation (2:30 – 3:15)
- **Screen:** Navigate to **Module B — Crew Health Twin** (`/crew`) and **Module D — Temporal Intelligence** (`/temporal`).
- **Presenter Script:**
  > *"A critical test of an aerospace system is data isolation: does one astronaut's emergency bleed into another's records?*  
  > *Watch what happens when we switch our crew selector from Commander Alex Morgan to Dr. Sarah Chen.*  
  > *Dr. Chen exhibits 100% countermeasure adherence. Her temporal analysis shows exactly ZERO anomalies, nominal physiological stability, and an overall confidence score of 99%.*  
  > *Now look at Elena Rostova: on Day 119, her biometric sensor patch disconnected. MOSAIC-9 does NOT invent a medical diagnosis; it labels her status as UNKNOWN and penalizes heuristic confidence to 41%, truthfully reflecting a telemetry blackout."*
- **Click Action:** Switch between crew members in the header dropdown. On Module D, show Alex's exploratory linear associations ($r = -0.89, r = -0.38, r = +0.93$) with explicit $n=4\text{–}5, df=2\text{–}3$ badges.
- **Mandatory Disclosure Point #3:** State: *"Correlation does not equal causation. Small operational samples (n=4–5 days) describe observed co-variation rather than inferential clinical proofs."*

---

### Phase 5: Countermeasure Scenario Sandbox & Pareto Trade-Offs (3:15 – 3:55)
- **Screen:** Navigate to **Module F — Scenario Sandbox** (`/sandbox`).
- **Presenter Script:**
  > *"Once an incident occurs, what should the crew do? MOSAIC-9 provides a Countermeasure Scenario Sandbox.*  
  > *We evaluate 5 candidate recovery protocols across 8 dimensions. But rather than picking an arbitrary winner, MOSAIC-9 computes a mathematical Pareto frontier across three primary maximized objectives: Recovery Score, Schedule Continuity, and Exercise Preservation.*  
  > *Scenario Alpha achieves an 88% recovery score through a 2.5-hour sleep extension, 35% workload reduction, and 1200 mL oral fluid loading—but it defers non-critical flight tasks. Baseline schedule causes zero disruption but offers poor recovery. Graded exercise taper is strictly dominated.*  
  > *We provide the objective trade-offs; human flight surgeons make the clinical decision."*
- **Click Action:** Toggle between **Scenario Alpha** and **Scenario Bravo**. Point to the Pareto non-dominated badge and bar chart.
- **Mandatory Disclosure Point #4:** Point to the permanent banner: *"Simulated Data — Exploratory Scenario — Not a Clinical Prescription."*

---

### Phase 6: Offline Resilient SBAR Communication & Close (3:55 – 4:30)
- **Screen:** Navigate to **Module H — Ground Comms** (`/comms`).
- **Presenter Script:**
  > *"Finally, when Earth is occluded, how does the crew report?*  
  > *In Module H, the Crew Medical Officer prepares a standardized SBAR consultation packet.*  
  > *Notice our Deep Space Network status indicator. If we toggle the link to 'Loss of Signal', the application seamlessly switches to offline mode. The prepared packet is safely queued in local browser and SQLite storage with 'QUEUED_LOCAL' status.*  
  > *When the planetary occultation ends and high-gain resumes, the queued packets synchronize with Earth ground operations.*  
  > *Every signal has a story. MOSAIC-9 ensures deep-space crews can understand that story, protect their health, and complete their mission."*
- **Click Action:** Click the **DSN Link Switcher** to toggle between **LOS (Occultation)** and **High-Gain Link Active**. Show the queued packet badge.

---

## 3. Potential Judge Questions & Strongest Answers

| Expected Judge Question | Recommended Concise Technical Response |
| :--- | :--- |
| **"Is this system clinically validated?"** | *"No. MOSAIC-9 is an explainable decision-support software prototype designed for competition and research exploration. All simulation projections represent deterministic aerospace physiological approximations, not clinical prognostic guarantees."* |
| **"Where did the NASA OSDR data come from?"** | *"We integrated official NASA OSDR metadata from OSD-575 (LSDS-8, Inspiration4 serum), OSD-571 (GLDS-563, plasma profiling), and OSD-635 (GLDS-608, ISS aortic smooth muscle cells). We explicitly note that these provide contextual biomedical literature, not continuous real-time in-flight telemetry."* |
| **"Why is the sample size $n=4\text{–}5$ in temporal associations?"** | *"Because telemetry represents discrete daily operational shift aggregations over a 5-day acute mission window (Days 116–120). We intentionally removed inferential $p$-values and overclaiming language, labeling them as descriptive exploratory linear associations ($n=4\text{–}5, df=2\text{–}3$)."* |
| **"How does the offline mode work if the spacecraft computer loses connection?"** | *"The frontend uses localStorage and compiled in-memory fallback datasets (`initialData.ts`). If the Python analytics service is unreachable, Laravel's backend executes native PHP deterministic calculations with identical Pareto rankings and crew data isolation."* |
