# MOSAIC-9 — NASA Space Apps Challenge 2026 Presentation Speaker Notes

> **Presentation Title:** MOSAIC-9 — Mission Health Event Reconstruction for Deep-Space Crews  
> **Team:** TESSERA FLIGHT LAB  
> **Tagline:** *"Every Signal Has a Story."*  
> **Target Duration:** 4 to 5 Minutes (Timed Delivery)  
> **Deck:** Exactly 7 Slides (16:9 Widescreen)

---

## Slide 1 — Title Slide (0:00 – 0:35)

### Visual Elements
- Cinematic deep-space mission scene, starfield, Earth crescent, and Mars transit orbital vector.
- Clean typography: **MOSAIC-9**, *"Every Signal Has a Story."*, Team: **TESSERA FLIGHT LAB**.

### Spoken Script
> *"Good morning, NASA Space Apps evaluators and judges. We are Team Tessera Flight Lab, and this is MOSAIC-9: Mission Health Event Reconstruction for Deep-Space Crews.*
> 
> *When astronauts travel to Mars, they will face communication delays of up to 22 minutes each way. If a crew member experiences an acute cardiovascular or cognitive event during transit, terrestrial flight surgeons cannot intervene in real time.*
> 
> *Our project addresses this mission-critical vulnerability: moving beyond isolated biometric alerts to give deep-space crews autonomous, explainable incident reconstruction and countermeasure decision support. Because in deep space, 'Every Signal Has a Story.' Let's examine why."*

### Key Emphases
- State the 22-minute light-time delay early to establish the operational urgency.
- Establish the team name (Tessera Flight Lab) and mission prototype status.

---

## Slide 2 — The Problem: A Health Event Is More Than a Single Measurement (0:35 – 1:20)

### Visual Elements
- Contrast between the **Conventional Point Alert** (`Systolic BP 88 mmHg, HR 118 bpm`) and the **Multi-Day Interacting Precursor Cascade** (Sleep $\rightarrow$ Workload $\rightarrow$ Exercise $\rightarrow$ Physiological Observations $\rightarrow$ Review).

### Spoken Script
> *"Consider how spaceflight health monitoring works today. A telemetry threshold is breached, and a red alert flashes: Systolic Blood Pressure 88 mmHg, Heart Rate 118 bpm. But a single measurement tells you what happened, never how the situation developed.*
> 
> *In microgravity, acute decompensation rarely occurs out of nowhere. It unfolds across a multi-day cascade of interacting operational and physiological factors:*
> 
> *First, nocturnal false alarms interrupt restorative sleep. Second, emergency maintenance extends daily duty shifts to 10.5 hours. Third, extreme fatigue forces the astronaut to abbreviate and eventually skip daily cycle ergometer conditioning. Fourth, autonomic vagal reserves collapse—evident in heart rate variability dropping from 42 to 18 milliseconds—unmasking microgravity-induced hypovolemia. Finally, on Day 120, during simulated gravity onset, the crew member experiences presyncope.*
> 
> *Isolated vital signs leave flight surgeons blind to event genesis. Mission teams need chronology, provenance, and context."*

### Key Emphases
- Emphasize that the 5-stage cascade represents observed covariance across shifts, not a deterministic biological certainty in every individual.

---

## Slide 3 — Our Solution: From Isolated Signals to Explainable Intelligence (1:20 – 2:05)

### Visual Elements
- 5-stage workflow ribbon: `OBSERVE → CONNECT → RECONSTRUCT → EXPLORE → REVIEW`.
- 3 live application screenshots: **Mission Command Center**, **Crew Health Twin**, and **Event Ledger & Temporal Engine**.
- Edge microservices architecture banner (React 18, Laravel 11, Python FastAPI, SQLite WAL).

### Spoken Script
> *"To solve this, we built MOSAIC-9—a fully functioning, edge-deployable mission intelligence platform.*
> 
> *MOSAIC-9 follows a strict five-stage operational workflow:*
> 
> *1. OBSERVE: Streaming continuous multi-channel telemetry across four astronaut health twins.*
> *2. CONNECT: Vectorized temporal analytics in Python that compute empirical lead-lag cross-correlations across duty shifts.*
> *3. RECONSTRUCT: Directed bipartite graph intelligence linking acute events to precursor timelines and NASA research.*
> *4. EXPLORE: A multi-objective Pareto countermeasure sandbox that models prospective recovery trajectories.*
> *5. REVIEW: Clear, auditable decision support that preserves human flight surgeon authority.*
> 
> *This is not a concept mockup. It is a live polyglot platform: React 18 on the flight console, Laravel 11 managing an immutable SQLite ledger, and Python FastAPI executing vectorized analytics—backed by 53 automated verification tests."*

### Key Emphases
- Direct attention to the genuine screenshots from the running software.
- Point out the deterministic fallback architecture: 100% mathematical parity in PHP if the Python microservice disconnects.

---

## Slide 4 — Our Distinctive Contribution: Reconstruct the Story (2:05 – 2:55)

### Visual Elements
- Canonical metrics banner: `BP 88/56 mmHg`, `HR 118 bpm`, `Sol 120, 08:30 MET`, `94% Confidence`.
- Chronological timeline replay on the left; **Interactive Mission Evidence Graph** (27 nodes, 33 edges) on the right.
- Six Epistemic Tiers breakdown. Fictional demonstration profile disclaimer.

### Spoken Script
> *"Here is our core innovation: Reconstructing the story behind the event.*
> 
> *Shown here is our synthetic demonstration incident, INC-ARES4-120-001, for Commander Alex Morgan. On Sol 120 at 08:30 MET, Morgan experiences presyncope with blood pressure dropping to 88/56 and heart rate spiking to 118.*
> 
> *Instead of an isolated emergency alert, MOSAIC-9 reconstructs the preceding 96 hours: from the Sol 116 shift extension, to the Sol 117 alarm disruption, to the Sol 118 abbreviated workout, to the Sol 119 workout cancellation.*
> 
> *On the right is our Mission Evidence Graph, comprising 27 nodes and 33 directed edges. Most importantly, MOSAIC-9 enforces a strict Six-Tier Epistemic Taxonomy: distinguishing direct onboard sensor telemetry from mission ledger logs, derived statistical indicators, published NASA research context, and hypothetical simulated countermeasures.*
> 
> *We explicitly disclose: this is a synthetic demonstration scenario. The system detects heuristic evidence alignment, not clinical diagnostic certainty."*

### Key Emphases
- Emphasize the canonical numbers: `88/56 mmHg` and `118 bpm`.
- Emphasize that the 6-tier taxonomy prevents conflating external literature or simulations with direct telemetry.

---

## Slide 5 — Explore Operational Trade-Offs: Preserve Human Judgment (2:55 – 3:40)

### Visual Elements
- Real screenshot of the **Pareto Trade-Off Engine** (`07b_scenario_pareto.png`).
- 5 evaluated scenario protocols (Alpha 84.5%, Bravo 78.2%, Charlie 70.2%, Delta 62.8%, Baseline 41.0%).
- Three primary maximized objectives. Elena Rostova missing data card.

### Spoken Script
> *"Once an event is reconstructed, the crew needs options. Module F provides the Countermeasure Scenario Sandbox.*
> 
> *MOSAIC-9 models five candidate recovery protocols across three explicit Pareto objectives: maximizing Recovery Trajectory, maximizing Operational Duty Continuity, and preserving Physical Conditioning.*
> 
> *Scenario Alpha—combining 2.5 hours of sleep extension with 1.2 liters of isotonic fluid loading—achieves an 84.5% recovery score on the non-dominated Pareto frontier. Scenario Baseline—continuing unmodified flight duties—yields just 41% and is strictly dominated.*
> 
> *Notice our epistemic safeguards: For Science Specialist Elena Rostova, a 24-hour sensor gap is represented explicitly as missing/unknown information, reducing algorithmic confidence to 41%, rather than hallucinating nominal health.*
> 
> *Crucially, these outputs are deterministic model comparisons for schedule planning, not medical prescriptions. The final operational decision remains strictly with the human Flight Surgeon."*

### Key Emphases
- State the 3 Pareto objectives clearly: Recovery Trajectory, Operational Continuity, Exercise Preservation.
- Emphasize Elena Rostova's visible missing data to demonstrate algorithmic integrity.

---

## Slide 6 — NASA Research and Scientific Integrity (3:40 – 4:25)

### Visual Elements
- 3 structured columns: NASA OSDR Study Inventory, NASA HRP Risk Portfolios, and Prominent Scientific Integrity Panel.
- Reconciled empirical correlation callout: **`r = -0.38, n = 4, df = 2`**.

### Spoken Script
> *"A decision support tool is only as trustworthy as its scientific grounding and its honesty about uncertainty.*
> 
> *MOSAIC-9 integrates official studies from the NASA Open Science Data Repository: including OSD-575 and OSD-571 from the SpaceX Inspiration4 cohort, and OSD-635 on vascular smooth muscle cells cultured aboard the ISS.*
> 
> *We explicitly maintain strict scientific boundaries: OSD-575 represents discrete pre- and post-flight venous serum assays, NOT continuous in-flight telemetry. OSD-635 represents in vitro cell culture, NOT live astronaut blood pressure.*
> 
> *We map clinical risks to official NASA Human Research Program portfolios: HRP-CV-OI for cardiovascular deconditioning and HRP-SLEEP-CIRC for sleep loss.*
> 
> *And look at our Scientific Integrity Panel: When evaluating the relationship between workload extension and skipped workouts, we report the exact empirical correlation: r = -0.38 across n = 4 observations, with degrees of freedom equal to 2. We disclose it as an exploratory association over a small duty window—never as a causal certainty."*

### Key Emphases
- Emphasize the exact DOIs and accessions (`LSDS-8`, `GLDS-563`, `GLDS-608`).
- Emphasize the corrected correlation: $r = -0.38$, $n = 4$, $df = 2$.

---

## Slide 7 — The Mission Ahead: Every Signal Has a Story (4:25 – 5:00)

### Visual Elements
- Five Architectural Pillars (Explainable Reconstruction, Evidence Traceability, Visible Uncertainty, Scenario Exploration, Human-Centered Support).
- Technical Rigor & Verification Snapshot (Tech stack, 53 automated tests passing 100%, dual-engine parity).
- Team **TESSERA FLIGHT LAB**, public repository link, and closing quote.

### Spoken Script
> *"Looking ahead to Artemis lunar bases and crewed missions to Mars, autonomous medical intelligence must be explainable, traceable, and humble.*
> 
> *MOSAIC-9 establishes five foundational pillars for deep-space health operations: transforming raw alarms into chronological narratives, tracing evidence to peer-reviewed NASA science, visualizing uncertainty, evaluating operational trade-offs, and keeping human physicians at the center of command.*
> 
> *Our complete platform—including all 53 automated tests and full documentation—is open source on GitHub.*
> 
> *We thank the NASA Space Apps Challenge judges for their review. We leave you with our core conviction:*
> 
> *'Because in deep space, understanding how an event unfolds can matter as much as knowing that it happened.'*
> 
> *Thank you. We are ready for your questions."*

---

## Judge Q&A Defense Sheet

### Q1: "Is this clinically validated on real astronauts?"
**Answer:** *"No. We explicitly disclose that MOSAIC-9 is an exploratory aerospace software prototype. All ARES-IV crew records and telemetry streams are synthetically generated around published spaceflight literature. NASA OSDR studies (OSD-575, OSD-635) provide contextual reference literature, not live astronaut telemetry. The system is designed for operational schedule decision support, not clinical prescription."*

### Q2: "How does the system handle communication loss to Earth?"
**Answer:** *"MOSAIC-9 runs completely locally at the habitat edge. If the Python intelligence service experiences an interruption, our Laravel backend features a deterministic parity engine that computes identical recovery scores (84.5% for Alpha, 70.2% for Charlie) to four decimal places. The crew can continue incident reconstruction and scenario exploration completely offline."*

### Q3: "Why is the correlation r = -0.38 significant if n = 4?"
**Answer:** *"We explicitly report that with n = 4 and df = 2, this is an exploratory empirical association over the 4-day pre-incident operational window (Days 116–119), with p = 0.62. We do NOT claim statistical significance or clinical causation. We display the degrees of freedom openly on screen so flight surgeons see the statistical limits of small-sample deep-space observations."*
