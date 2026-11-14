# MOSAIC-9 — System Architecture

**Project:** MOSAIC-9 — Mission Health Event Reconstruction for Deep-Space Crews  
**Team:** TESSERA FLIGHT LAB  
**Competition:** NASA Space Apps Challenge 2026  
**Tagline:** *Every Signal Has a Story.*

---

## 1. Architectural Philosophy

Deep-space exploration missions (e.g. transit to Mars) operate under severe communication constraints: one-way light speed delays between 4 and 24 minutes, recurring planetary occultations with multi-day loss of signal (LOS), and strict autonomy requirements. Astronauts cannot rely on real-time consultation with Mission Control flight surgeons on Earth.

MOSAIC-9 solves this by implementing an explainable, deterministic onboard health intelligence and event-reconstruction platform that follows the workflow:

```
COLLECT ➔ VALIDATE ➔ CONTEXTUALIZE ➔ ANALYZE ➔ RECONSTRUCT ➔ EXPLAIN ➔ REVIEW
```

### Core Tenet
**Correlation is not causation. Synthetic telemetry is not clinical diagnosis.**  
MOSAIC-9 never uses an LLM to hallucinate diagnoses, invent thresholds, or extrapolate unmeasured vital signs. All temporal associations and baseline deviations are computed using transparent statistical and aerospace physiological models.

---

## 2. Monorepo Structural Blueprint

```
MOSAIC-9/
├── frontend/                  # React 18 / TypeScript / Vite / Tailwind CSS / ECharts
│   ├── public/                # PWA Service Worker (sw.js) & offline assets
│   ├── src/
│   │   ├── components/        # Status badges, evidence pills, ECharts telemetry wrappers, sidebar, header
│   │   ├── screens/           # 10 dedicated full-fidelity mission screens
│   │   ├── services/          # Resilient API client with transparent offline cache fallback
│   │   ├── types/             # Complete type-safe data model interfaces
│   │   └── __tests__/         # Component and logic vitest suite
│   ├── index.html
│   ├── tailwind.config.js     # Aerospace deep-space dark design system
│   └── vite.config.ts
├── backend/                   # Laravel 12 API Control Plane (PHP 8.4+)
│   ├── app/
│   │   ├── Http/Controllers/Api/ # REST API Controllers for Mission, Crew, Ledger, Incidents, Scenarios, Comms, Sync
│   │   └── Models/            # Eloquent ORM Models with type casting and relationships
│   ├── database/
│   │   ├── migrations/        # Relational schema migrations
│   │   └── seeders/           # Detailed scenario dataset (Days 116-120)
│   ├── routes/api.php         # 22 REST API endpoints
│   └── tests/Feature/         # Feature test suite (MosaicApiTest)
├── intelligence/              # Python 3.12 Deterministic Intelligence Service
│   ├── app/
│   │   ├── main.py            # FastAPI service (Port 8100)
│   │   ├── baseline.py        # Robust personal baseline stats (MAD, median, IQR, Z-scores)
│   │   ├── temporal.py        # Multi-domain lead-lag cross-correlation & change-point detection
│   │   ├── reconstruction.py  # Backward causal chain builder & taxonomy classifier
│   │   └── simulation.py      # Countermeasure recovery modeling
│   ├── tests/                 # Pytest automated test suite
│   └── requirements.txt
├── datasets/                  # Documented synthetic telemetry schemas and scenarios
├── documentation/             # Complete engineering specifications and guides
├── scripts/                   # Automated runners (start-all.sh, run-tests.sh)
└── README.md                  # Master competition delivery documentation
```

---

## 3. Module Mapping

| Module | Name | Purpose | Primary Components |
|---|---|---|---|
| **Module A** | Mission Command Center | Real-time mission overview, telemetry ticker, crew complement matrix, cabin gas metrics, active incident alert. | `CommandCenterScreen.tsx`, `MissionController.php` |
| **Module B** | Mission Health Ledger | Central immutable chronological event stream, provenance metadata, filtering, manual crew observation logging. | `EventLedgerScreen.tsx`, `LedgerController.php` |
| **Module C** | Personal Crew Health Twin | Individual baseline vs recent observations vs Z-score departures across 4 physiological domains. | `CrewHealthTwinScreen.tsx`, `CrewController.php` |
| **Module D** | Temporal Intelligence Engine | Discovers earliest unusual signals, cross-domain lead-lag correlations, and multi-day divergence progression. | `TemporalIntelligenceScreen.tsx`, `temporal.py`, `IntelligenceBridgeController.php` |
| **Module E** | Incident Reconstruction & Mission Evidence Graph | **Signature Feature**: Interactive timeline reconstruction (-6h to -7d), chronological Mission Event Replay, 6-tier evidence taxonomy tagging, interactive Mission Evidence Graph linking NASA OSDR/HRP studies, missing data isolation, competing hypotheses. | `IncidentReconstructionScreen.tsx`, `reconstruction.py`, `IncidentController.php`, `NasaEvidenceController.php` |
| **Module F** | Scenario Sandbox & Trade-Off Engine | Hypothetical countermeasure exploration, 5-scenario side-by-side comparison across 8 multi-objective dimensions, Pareto non-dominated frontier, OAT parameter sensitivity analysis, and Mission Decision Report exporter. | `ScenarioSandboxScreen.tsx`, `simulation.py`, `ScenarioController.php` |
| **Module G** | Offline Mission Operations | Local SQLite persistence, PWA caching, DSN link simulator (LOS / 21m delay), unsynced item queue. | `SystemStatusScreen.tsx`, `sw.js`, `SyncController.php` |
| **Module H** | Ground Communication | Standardized SBAR mission briefs with linked ledger evidence and explicit questions for ground flight surgeons. | `GroundCommunicationScreen.tsx`, `GroundCommunicationController.php` |
| **Module I** | NASA Evidence Library | Searchable catalog of NASA OSDR (`OSD-575`, `OSD-635`, `OSD-571`), NASA HRP Evidence Reports, NASA CCMC DONKI context, live/cached OSDR API lookup connector, and 8-parameter telemetry data dictionary. | `DataSourcesScreen.tsx`, `NasaEvidenceController.php` |

---

## 4. Scientific Evidence Taxonomy (Legacy + V2 6-Tier Framework)

Every node in the reconstruction timeline and Mission Evidence Graph is classified according to the MOSAIC-9 scientific taxonomy:

### V2 6-Tier Evidence Classification Taxonomy
1. **`DIRECT_OBSERVATION`** (`OBSERVED_FACT`): Recorded telemetry, symptom report, mission event, or environmental measurement from the synthetic mission dataset.
2. **`NASA_RESEARCH_CONTEXT`**: Published or curated NASA OSDR (`OSD-575`, `OSD-635`, `OSD-571`) or NASA HRP spaceflight evidence relevant to the observed physiological domain.
3. **`DERIVED_TEMPORAL_ASSOCIATION`** (`DERIVED_INDICATOR` / `TEMPORAL_ASSOCIATION`): Calculated baseline deviation, anomaly sequence, or lead-lag statistical relationship over finite lookback windows ($n=5$ daily epochs).
4. **`EXPLORATORY_HYPOTHESIS`** (`POSSIBLE_EXPLANATION`): Candidate non-diagnostic physiological explanation supported by observed telemetry and published spaceflight evidence.
5. **`MISSING_EVIDENCE`**: Unmeasured physiological or environmental variable (e.g., continuous NIRS cerebral oximetry or beat-to-beat arterial tonometry) that limits certainty and penalizes heuristic confidence.
6. **`SYNTHETIC_SIMULATION`**: Scenario projection, multi-objective trade-off score, or parameter sensitivity curve generated by deterministic physiological models (`SIMULATED DATA — NOT A CLINICAL RECOMMENDATION`).
