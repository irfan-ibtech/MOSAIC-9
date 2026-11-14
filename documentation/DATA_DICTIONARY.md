# MOSAIC-9 — Scientific Data Dictionary

This document specifies all telemetry parameters, units, expected personal baseline corridors, acquisition sensors, and scientific boundaries utilized across the MOSAIC-9 platform.

---

## 1. Physiological Telemetry Parameters

### 1.1 Cardiovascular & Autonomic Domain
| Metric Identifier | Display Name | Unit | Nominal Baseline Range | Sensor Hardware | Provenance & Calibration |
|---|---|---|---|---|---|
| `heart_rate_resting` | Resting Heart Rate | bpm | 50.0 – 68.0 | Bio-Telemetry Patch Unit #1 | Continuous ECG sampling at 250 Hz; basal pre-awakening quiescent window. |
| `hrv_rmssd` | Heart Rate Variability (RMSSD) | ms | 45.0 – 75.0 | Bio-Telemetry Patch Unit #1 | Root mean square of successive difference of normal RR intervals; parasympathetic autonomic index. |
| `systolic_bp` | Systolic Blood Pressure | mmHg | 110.0 – 125.0 | Digital Sphygmomanometer | Automated brachial cuff measurement during morning medical check-in. |
| `diastolic_bp` | Diastolic Blood Pressure | mmHg | 70.0 – 80.0 | Digital Sphygmomanometer | Automated brachial cuff measurement during morning medical check-in. |
| `heart_rate_transient_peak` | Postural Peak HR | bpm | 60.0 – 85.0 | Bio-Telemetry Patch Unit #1 | Peak heart rate recorded during vertical postural transition. |
| `spo2` | Blood Oxygen Saturation | % | 97.0 – 99.5 | Continuous Pulse Oximeter | Dual-wavelength photoplethysmography sensor. |

### 1.2 Musculoskeletal & Countermeasure Domain
| Metric Identifier | Display Name | Unit | Nominal Baseline Range | Sensor Hardware | Provenance & Calibration |
|---|---|---|---|---|---|
| `exercise_power_watts` | Ergometer Mechanical Workload | W | 160.0 – 200.0 | Cycle Ergometer Tessera-M | Optical torque transducer and cadence sensor; calibrated pre-flight. |
| `exercise_duration_min` | Aerobic Exercise Duration | min | 30.0 – 45.0 | Cycle Ergometer Tessera-M | Active time within target heart rate zone. |
| `ared_load_kg` | Resistance Training Volume | kg | 120.0 – 180.0 | Advanced Resistive Exercise Device (ARED) | Piston vacuum cylinder resistance countermeasure. |

> **Scientific Boundary:** Exercise compliance measures mechanical work performed on countermeasure hardware. It is NOT a direct measurement of bone mineral density or muscle fiber cross-sectional area.

### 1.3 Sleep, Fatigue & Neurocognitive Domain
| Metric Identifier | Display Name | Unit | Nominal Baseline Range | Sensor Hardware | Provenance & Calibration |
|---|---|---|---|---|---|
| `sleep_duration_hours` | Total Sleep Time (TST) | hours | 7.5 – 8.5 | Smart Bunk Bio-Acoustic Array | Piezoelectric mattress ballistocardiography and acoustic micro-awakening detection. |
| `rem_sleep_percent` | REM Sleep Fraction | % | 20.0 – 25.0 | Smart Bunk Bio-Acoustic Array | Algorithmic sleep stage architecture classification. |
| `deep_sleep_percent` | Slow Wave Sleep Fraction | % | 18.0 – 24.0 | Smart Bunk Bio-Acoustic Array | Delta wave power surrogate from heart rate decel and respiration. |
| `cognitive_pvt_latency_ms` | Psychomotor Vigilance Latency | ms | 200.0 – 230.0 | Flight Deck PVT Console | 10-minute standardized visual reaction time test. Validated fatigue biomarker. |
| `fatigue_subjective_score` | Self-Reported Fatigue Index | scale 1-10 | 1.0 – 3.0 | Crew Daily Check-In Terminal | Standardized Samn-Perelli 7-point or visual analogue 10-point fatigue scale. |

> **Scientific Boundary:** Subjective fatigue is a clinical symptom, not an autonomous medical diagnosis. PVT latency measures transient attentional lapses secondary to sleep loss, not permanent neurological impairment.

### 1.4 Radiation & Habitation Environmental Domain
| Metric Identifier | Display Name | Unit | Nominal Baseline Range | Sensor Hardware | Provenance & Calibration |
|---|---|---|---|---|---|
| `radiation_dosimeter_usv` | Personal Ambient Dose Rate | µSv/h | 40.0 – 60.0 | Crew Personal Silicon Dosimeter | Active semiconductor micro-dosimeter worn on crew jumpsuit. |
| `cabin_co2_mmhg` | Ambient Carbon Dioxide | mmHg | 1.5 – 3.0 | ECLSS Main Sensor Array | Dual-wavelength infrared absorption gas analyzer. |
| `cabin_pressure_kpa` | Cabin Atmospheric Pressure | kPa | 100.5 – 102.0 | Station Barometric Transducer | Triple-redundant capacitive pressure transducer. |
| `cabin_o2_percent` | Cabin Oxygen Fraction | % | 20.5 – 21.5 | ECLSS Main Sensor Array | Paramagnetic oxygen sensor. |

> **Scientific Boundary:** External space-weather notifications (such as NASA DONKI solar energetic particle alerts) describe space environment flux, NOT direct absorbed tissue dose.

---

## 2. Event Ledger Severity Classifications

- `INFO`: Normal operational event, automated sensor calibration, or nominal vitals acquisition.
- `LOW`: Mild departure (&lt; 2σ) without operational or clinical impact.
- `MODERATE`: Notable deviation (2σ – 3σ), abbreviated countermeasure, or elevated workload task.
- `HIGH`: Severe multi-domain deviation (&gt; 3σ), missed countermeasure, or acute neurocognitive degradation.
- `CRITICAL`: Acute health incident requiring immediate flight medical officer review and duty suspension.
