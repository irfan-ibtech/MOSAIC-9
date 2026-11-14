# MOSAIC-9 — Presentation Asset Sources & Provenance Register

> **Deck Title:** MOSAIC-9 — Mission Health Event Reconstruction for Deep-Space Crews  
> **Team:** TESSERA FLIGHT LAB  
> **Competition:** NASA Space Apps Challenge 2026  
> **Evaluation Date:** November 15, 2026

---

## 1. Primary Visual & Graphic Assets

### 1.1 Genuine Application Screenshots
All interface figures and dashboard panels embedded in the presentation are genuine 1920x1080 full-resolution screenshots captured directly from the live, running MOSAIC-9 application stack (React 18 + Vite development server on port 5173, Laravel 11 API on port 8000, and FastAPI microservice on port 8100):

| Asset Filename | Slide Location | Depicted System View | Provenance & Path |
| :--- | :---: | :--- | :--- |
| `01_command_center.png` | Slide 3 | Module A — Mission Command Center | Captured from live URL `http://127.0.0.1:5173/` (`screenshots/01_command_center.png`). Shows real-time multi-channel telemetry streams, Sol 120 mission clock, cohort summary, and DSN Earth link state. |
| `02_crew_twins.png` | Slide 3 | Module B — Personal Crew Health Twin | Captured from live URL `http://127.0.0.1:5173/` (`screenshots/02_crew_twins.png`). Shows 4-astronaut cohort profiles, circadian stability indicators, and multi-domain physiological telemetry. |
| `05_temporal_intelligence.png` | Slide 3 | Module E — Temporal Relationship Engine | Captured from live URL `http://127.0.0.1:5173/` (`screenshots/05_temporal_intelligence.png`). Shows empirical lead-lag correlation matrix (-1d to +2d shifts) and time-series alignment. |
| `06_incident_reconstruction.png` | Slide 4 | Module D — Health Incident Reconstruction & Evidence Graph | Captured from live URL `http://127.0.0.1:5173/` (`screenshots/06_incident_reconstruction.png`). Shows the 27-node, 33-edge directed bipartite graph linking acute presyncope to precursor observations and NASA research. |
| `07b_scenario_pareto.png` | Slide 5 | Module F — Countermeasure Scenario Sandbox & Pareto Chart | Captured from live URL `http://127.0.0.1:5173/` (`screenshots/07b_scenario_pareto.png`). Shows the 5-scenario evaluation matrix and 3-objective Pareto trade-off bar chart. |

---

## 2. Background Visuals & Generation Provenance

### 2.1 Slide 1 Title Background (`title_background.png`)
- **Generation Method:** Procedurally generated via Python Pillow (PIL) canvas rendering script (`build_deck.py`).
- **Visual Elements:** Deep-space dark navy gradient (`#050810` to `#0A1128`), coordinate telemetry grid overlay (`#14233C`), 450 procedurally placed stars with deterministic seed (`random.seed(42)`), Earth horizon crescent with atmospheric Rayleigh blue glow (`#38BDF8`), and an elliptical orbital transit trajectory vector with waypoint marker (`#F59E0B`).
- **No Third-Party Copyrighted Art:** Built 100% from programmatic vector and raster canvas primitives.
- **No AI Hallucinations / Watermarks:** Contains zero generic AI-generated elements, zero fake spacecraft, and zero NASA insignias.

---

## 3. Typography & Font Sources

All typography adheres to standard, high-readability cross-platform system fonts:
- **Primary Headers & Headings:** `Arial` (PPTX) / `Helvetica-Bold` (PDF).
- **Subtitles & Scientific Disclosures:** `Arial Italic` (PPTX) / `Helvetica-Oblique` (PDF).
- **Body & Tabular Data:** `Arial` (PPTX) / `Helvetica` (PDF).
- **Code, Identifiers & Technical Badges:** `Menlo` / `Courier` / `Helvetica-Bold` (Uppercase telemetry badges).

---

## 4. NASA Branding Restriction Compliance

> [!IMPORTANT]
> **NASA BRANDING COMPLIANCE AUDIT**  
> In strict compliance with NASA Space Apps Challenge regulations:
> - **NO NASA Meatball logo** is used anywhere in the presentation.
> - **NO NASA Worm logo** is used anywhere in the presentation.
> - **NO NASA seal, flag, or official agency insignia** is depicted.
> - **NO modified or stylized NASA branding** is used.
> - The term "NASA" is used solely in standard descriptive text to accurately cite public research sources (e.g., *NASA Open Science Data Repository*, *NASA Human Research Program*).

---

## 5. Scientific Citation & Research Metadata Sources

All scientific studies and risk references cited on Slide 4 and Slide 6 are verified against public scientific databases:

1. **`OSD-575` / `LSDS-8`:** *SpaceX Inspiration4 Blood Serum Metabolic Panel and Cytokine Arrays*  
   - NASA OSDR URL: `https://osdr.nasa.gov/bio/repo/data/studies/OSD-575`  
   - Dataset DOI: `10.26030/mc5d-p710`  
   - Associated Paper: Nature SOMA Collection (DOI: `10.1038/s41586-024-07639-y`)
2. **`OSD-571` / `GLDS-563`:** *SpaceX Inspiration4 Plasma Profiling: Proteomics & EVPs*  
   - NASA OSDR URL: `https://osdr.nasa.gov/bio/repo/data/studies/OSD-571`  
   - Dataset DOI: `10.26030/h3p5-tc29`
3. **`OSD-635` / `GLDS-608`:** *Spaceflight effects on human vascular smooth muscle cell phenotype*  
   - NASA OSDR URL: `https://osdr.nasa.gov/bio/repo/data/studies/OSD-635`  
   - Dataset DOI: `10.26030/8n5a-q187`
4. **NASA Human Research Roadmap (HRR):**
   - `HRP-CV-OI`: NASA HRR Risk `i=179` (*Cardiovascular Adaptations Contributing to Adverse Health*)
   - `HRP-SLEEP-CIRC`: NASA HRR Risk `i=100` (*Sleep Loss, Circadian & Work Overload*)
   - `HRP-AERO-MUSC`: NASA HRP Aerobic & Muscular Performance Evidence Book
   - `HRP-ENV-CO2`: NASA HRP Ambient Carbon Dioxide Exposure Evidence Book
