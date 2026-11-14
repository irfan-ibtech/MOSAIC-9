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
| **Module E** | Incident Reconstruction | **Signature Feature**: Interactive timeline reconstruction (-6h to -7d), evidence taxonomy tagging, missing data isolation, competing hypotheses. | `IncidentReconstructionScreen.tsx`, `reconstruction.py`, `IncidentController.php` |
| **Module F** | Scenario Sandbox | Hypothetical countermeasure exploration (sleep delta, workload delta, ergometer watts, hydration volume) with 48h recovery curves. | `ScenarioSandboxScreen.tsx`, `simulation.py`, `ScenarioController.php` |
| **Module G** | Offline Mission Operations | Local SQLite persistence, PWA caching, DSN link simulator (LOS / 21m delay), unsynced item queue. | `SystemStatusScreen.tsx`, `sw.js`, `SyncController.php` |
| **Module H** | Ground Communication | Standardized SBAR mission briefs with linked ledger evidence and explicit questions for ground flight surgeons. | `GroundCommunicationScreen.tsx`, `GroundCommunicationController.php` |

---

## 4. Scientific Evidence Taxonomy

Every node in the reconstruction timeline is classified according to the MOSAIC-9 scientific taxonomy:

1. **`OBSERVED_FACT`**: Direct, unmanipulated telemetry from verified sensors or logged crew symptom check-ins.
2. **`DERIVED_INDICATOR`**: Computed index calculated algorithmically from multiple primary raw inputs (e.g. ballistocardiographic sleep stage classification).
3. **`TEMPORAL_ASSOCIATION`**: Observed chronological proximity where event A preceded event B, without claiming confirmed medical causation.
4. **`POSSIBLE_EXPLANATION`**: Medically plausible physiological hypothesis under onboard evaluation.
5. **`MISSING_EVIDENCE`**: Unacquired or degraded telemetry streams explicitly highlighted with diagnostic confidence penalty.
6. **`RECOMMENDED_REVIEW`**: Actionable investigation steps for crew medical officers and ground flight surgeons.
