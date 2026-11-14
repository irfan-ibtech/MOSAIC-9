# MOSAIC-9 — Competition Demonstration Walkthrough

Follow this step-by-step evaluation guide to verify the complete MOSAIC-9 workflow from Mission Day 116 baseline through the Day 120 acute presyncope incident, countermeasure scenario simulation, and offline operations.

---

## Complete 14-Step Demonstration Script

### Step 1: Open the Mission Command Center (Module A)
- **Action:** Launch the application (`./scripts/start-all.sh` or visit `http://127.0.0.1:5173`).
- **Observation:** Notice the Mission Day indicator (`DAY 120 | MET 2894:15:22`), Earth DSN link status (`LOSS OF SIGNAL (21m LATENCY)`), cabin environmental gas parameters (CO2: 3.2 mmHg, Pressure: 101.1 kPa), and the Autonomous Intelligence Engine indicator.
- **Verification:** An active incident alert banner is displayed at the top: `ACTIVE INCIDENT: INC-ARES4-120-001 (Commander Alex Morgan — Acute Presyncope)`.

### Step 2: Inspect Crew Health Matrix & Variants
- **Action:** Review the 4 crew member cards:
  1. **Commander Alex Morgan:** Status `REVIEW_REQUIRED` (Acute orthostatic dizziness episode).
  2. **Dr. Sarah Chen:** Status `STABLE` (All vitals within 1-sigma baseline).
  3. **Marcus Vance:** Status `WATCH` (Elevated workload, mild sleep disruption).
  4. **Elena Rostova:** Status `UNKNOWN` (**Demonstrates missing data handling**: biometric patch telemetry offline; confidence penalized to 41%, NOT marked as healthy or sick).
- **Verification:** Clicking any astronaut updates the active profile across the application.

### Step 3: Inspect Personal Health Twin (Module C)
- **Action:** Navigate to **Crew Health Twins** in the sidebar.
- **Observation:** Notice the individualized resting baseline values (Resting HR: 60 bpm, HRV RMSSD: 58 ms, Sleep Target: 8.0h).
- **Verification:** Multi-day telemetry charts display sleep duration collapsing from 7.8h (Day 116) down to 4.6h (Day 120), while HRV RMSSD collapses from 58ms to 27ms. Notice the clear `SYNTHETIC RESEARCH TELEMETRY` ethical disclosure.

### Step 4: Examine Health Domain Telemetry Details
- **Action:** Navigate to **Domain Telemetry**.
- **Observation:** Toggle through the 4 tabs: *Cardiovascular*, *Musculoskeletal*, *Sleep & Cognitive*, and *Radiation / Habitat*.
- **Verification:** Each domain features specific telemetry charts, baseline deviation explanations, and clear scientific boundary alerts (e.g. "Exercise compliance is not a direct measurement of bone density").

### Step 5: Explore the Mission Event Ledger (Module B)
- **Action:** Navigate to **Event Ledger**.
- **Action:** Type `dizziness` or `sleep` in the search box; or filter by Category `Sleep Observation` or Severity `CRITICAL`.
- **Verification:** The list instantly filters to matching records. Click any row (e.g., `EVT-120-0942-INC`) to open the Event Inspection Drawer and inspect sensor provenance, calibration status, and SHA-256 integrity hash.
- **Action:** Click **Log Crew Observation** to open the modal and commit a test observation to the ledger.

### Step 6: Analyze Multi-Domain Temporal Progression (Module D)
- **Action:** Navigate to **Temporal Engine**.
- **Observation:** Notice the **First Unusual Signal** card: identified at `Day 117 06:30` (Sleep dropped to 5.4h following ECLSS audio alarm drill, -2.6σ departure, 75.2 hours before the acute incident).
- **Verification:** Review the 5-day sequence stepper (Day 116 Nominal -> Day 117 Onset -> Day 118 Divergence -> Day 119 Vulnerability -> Day 120 Incident).
- **Verification:** Examine the 3 discovered cross-domain lead-lag association pairs with correlation coefficients and p-values.

### Step 7: Launch Incident Reconstruction Workspace (Module E — Signature Feature)
- **Action:** Navigate to **Incident Reconstruction**.
- **Action:** Adjust the lookback horizon switcher between `6h`, `24h`, `72h`, and `7d`.
- **Observation:** Notice the chronological sequence of preceding events categorized with color-coded scientific taxonomy badges:
  - `OBSERVED FACT` (Cyan/Emerald)
  - `DERIVED INDICATOR` (Blue)
  - `TEMPORAL ASSOCIATION` (Amber)
  - `MISSING EVIDENCE` (Rose dashed)
- **Verification:** Click any preceding node to inspect the exact sensor telemetry record and relative lookback timestamp.

### Step 8: Inspect Missing Evidence & Uncertainty Analysis
- **Action:** Scroll to the **Missing Evidence & Data Limitations** panel.
- **Verification:** Notice two explicit gaps identified:
  1. *Continuous Cerebral Oximetry (NIRS)*: Explaining how absence of forehead optical sensors prevents direct measurement of brain tissue ischemia.
  2. *Direct Intravascular Fluid Volume Telemetry*: Explaining why hypovolemia is inferred from oral hydration logs rather than direct blood volume telemetry.
- **Impact:** Explains why diagnostic confidence was reduced from 98% to 88%.

### Step 9: Compare Competing Hypotheses & Clinical Recommendations
- **Action:** Review the **Competing Physiological Hypotheses Under Review**:
  - *Hypothesis 1 (High Plausibility 0.88):* Deconditioning-Exacerbated Baroreflex Decompensation.
  - *Hypothesis 2 (Moderate Plausibility 0.62):* Mild CO2 Induced Cephalic Vasodilation.
- **Verification:** Review the 4 recommended onboard and ground review actions.

### Step 10: Simulate Countermeasure Scenarios (Module F)
- **Action:** Navigate to **Scenario Sandbox** (or click "Test Countermeasure" from reconstruction).
- **Action:** Click **Load Alpha (Restoration)**.
- **Observation:** Sleep schedule delta sets to `+2.5h`, Workload delta to `-35%`, Ergometer power to `140W`, and Oral hydration to `1200 mL`.
- **Action:** Adjust sliders manually (e.g., increase hydration or reduce workload) and click **Execute Simulation Model**.
- **Verification:** The 48-hour recovery trajectory chart and KPI cards immediately recalculate:
  - Projected HRV RMSSD: 52 ms (stabilized)
  - Projected Systolic BP: 114 mmHg (resolved orthostatic collapse)
  - Time to Stability: 36 Hours
  - Recurrence Risk: 14% (down from 65%)

### Step 11: Draft Ground Communication SBAR Packet (Module H)
- **Action:** Navigate to **Ground Communication**.
- **Observation:** Notice the structured SBAR builder pre-populated with clinical context, linked ledger IDs (`EVT-117-0630-SLP`, `EVT-120-0942-INC`), explicit questions for ground flight surgeons, and data limitations.
- **Action:** Click **Queue Ground Packet Locally**.
- **Verification:** Notice the packet is successfully added to the onboard storage queue with status `QUEUED_LOCAL`. It is **NOT** falsely marked as transmitted while link is offline!

### Step 12: Verify Offline Operations & DSN Link Simulator (Module G)
- **Action:** Navigate to **System & Offline**.
- **Observation:** Notice the Local Database Integrity (100.0% WAL healthy) and Offline Queue Length (14+ items).
- **Action:** Click **Trigger Ground Sync** while link is in `LOSS OF SIGNAL`.
- **Verification:** System displays an honest operational notification: *Sync failed: Link is currently in LOSS_OF_SIGNAL. Onboard local persistence active.*
- **Action:** Toggle link state to `HIGH GAIN PASS` and click **Trigger Ground Sync**.
- **Verification:** System flushes the queued packet and reports: *Ground synchronization completed successfully.*

### Step 13: Export Diagnostic Snapshot
- **Action:** Click **Export Diagnostic Snapshot** on the System Status screen.
- **Verification:** Browser downloads an encrypted JSON snapshot containing complete mission state, telemetry records, and queue metadata for offline flight surgeon analysis.

### Step 14: Inspect Research Provenance & Data Dictionary
- **Action:** Navigate to **Data Provenance**.
- **Verification:** Review the complete 8-parameter scientific data dictionary, expected baseline ranges, primary sensor hardware, and NASA HRP/OSDR/DONKI research mappings.
