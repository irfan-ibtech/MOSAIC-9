<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\LedgerEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class NasaEvidenceController extends Controller
{
    public static function getTaxonomyV2(): array
    {
        return [
            'DIRECT_OBSERVATION' => [
                'code' => 'DIRECT_OBSERVATION',
                'alias_code' => 'SYNTHETIC_OBSERVATION',
                'legacy_code' => 'OBSERVED_FACT',
                'label' => 'Synthetic Observation (Mission Record)',
                'is_synthetic' => true,
                'description' => 'Synthetic mission telemetry record, symptom report, mission event, or cabin sensor reading from the onboard dataset.',
                'source_attribution' => 'Synthetic Onboard Mission Telemetry / Crew Health Log (100% Synthetic Mission Dataset)',
                'applicability_level' => 'SYNTHETIC_MISSION_RECORD',
                'limitations' => '100% synthetic mission scenario record generated for competition evaluation; does not represent real human astronaut sensor measurements.',
            ],
            'SYNTHETIC_OBSERVATION' => [
                'code' => 'SYNTHETIC_OBSERVATION',
                'alias_code' => 'DIRECT_OBSERVATION',
                'legacy_code' => 'OBSERVED_FACT',
                'label' => 'Synthetic Observation (Mission Record)',
                'is_synthetic' => true,
                'description' => 'Synthetic mission telemetry record, symptom report, mission event, or cabin sensor reading from the onboard dataset.',
                'source_attribution' => 'Synthetic Onboard Mission Telemetry / Crew Health Log (100% Synthetic Mission Dataset)',
                'applicability_level' => 'SYNTHETIC_MISSION_RECORD',
                'limitations' => '100% synthetic mission scenario record generated for competition evaluation; does not represent real human astronaut sensor measurements.',
            ],
            'NASA_RESEARCH_CONTEXT' => [
                'code' => 'NASA_RESEARCH_CONTEXT',
                'legacy_code' => 'NASA_RESEARCH_CONTEXT',
                'label' => 'NASA Research Context',
                'is_synthetic' => false,
                'description' => 'Published or curated NASA OSDR or NASA HRP spaceflight evidence relevant to the observed domain.',
                'source_attribution' => 'NASA Open Science Data Repository (OSDR) / NASA Human Research Program (HRP)',
                'applicability_level' => 'PUBLISHED_AEROSPACE_EVIDENCE',
                'limitations' => 'Contextual reference from prior spaceflight cohorts or cellular studies; does not directly measure the current synthetic crew persona.',
            ],
            'DERIVED_TEMPORAL_ASSOCIATION' => [
                'code' => 'DERIVED_TEMPORAL_ASSOCIATION',
                'legacy_code' => 'TEMPORAL_ASSOCIATION',
                'label' => 'Derived Temporal Association',
                'is_synthetic' => true,
                'description' => 'Calculated baseline deviation, chronological anomaly sequence, or lead-lag statistical relationship.',
                'source_attribution' => 'MOSAIC-9 Deterministic Temporal Engine (Computed on Synthetic Telemetry)',
                'applicability_level' => 'STATISTICAL_CO_MOVEMENT',
                'limitations' => 'Computed over finite lookback window (n=5 daily epochs); temporal association never establishes mechanistic causation.',
            ],
            'EXPLORATORY_HYPOTHESIS' => [
                'code' => 'EXPLORATORY_HYPOTHESIS',
                'legacy_code' => 'POSSIBLE_EXPLANATION',
                'label' => 'Exploratory Hypothesis',
                'is_synthetic' => true,
                'description' => 'Candidate explanation supported by chronological synthetic telemetry and published spaceflight evidence.',
                'source_attribution' => 'MOSAIC-9 Explainable Reasoning Engine + NASA HRP Evidence Mapping',
                'applicability_level' => 'NON_DIAGNOSTIC_PLAUSIBILITY',
                'limitations' => 'Heuristic qualitative ranking (not a calibrated clinical diagnostic probability); requires flight surgeon differential evaluation.',
            ],
            'MISSING_EVIDENCE' => [
                'code' => 'MISSING_EVIDENCE',
                'legacy_code' => 'MISSING_EVIDENCE',
                'label' => 'Missing Evidence',
                'is_synthetic' => true,
                'description' => 'Unmeasured physiological or environmental variable that limits certainty.',
                'source_attribution' => 'MOSAIC-9 Epistemic Gap Detector',
                'applicability_level' => 'EPISTEMIC_CONSTRAINT',
                'limitations' => 'Sensor modality absent or unacquired during event window; prevents confirmation of downstream physiological mechanism.',
            ],
            'SYNTHETIC_SIMULATION' => [
                'code' => 'SYNTHETIC_SIMULATION',
                'legacy_code' => 'SYNTHETIC_SIMULATION',
                'label' => 'Synthetic Simulation',
                'is_synthetic' => true,
                'description' => 'Scenario projection generated by deterministic parametric models.',
                'source_attribution' => 'MOSAIC-9 Countermeasure Sandbox Engine',
                'applicability_level' => 'HYPOTHETICAL_PROJECTION',
                'limitations' => 'Deterministic parametric approximation; simulation inputs are exploratory parameters, not medical prescriptions or clinical predictions.',
            ],
        ];
    }

    public static function getCuratedStudies(): array
    {
        return [
            [
                'study_id' => 'OSD-575',
                'identifier_type' => 'OFFICIAL_NASA_OSDR_ACCESSION',
                'accession' => 'OSD-575 / LSDS-8',
                'title' => 'SpaceX Inspiration4 Blood Serum Metabolic Panel and Immune/Cardiac Cytokine Arrays',
                'source_organization' => 'NASA Open Science Data Repository (OSDR / ALSDA)',
                'source_type' => 'NASA_OSDR',
                'study_type' => 'Human Spaceflight Cohort — Pre/Post-Flight Venous Blood Serum Profiling',
                'study_category' => 'HUMAN_COHORT_BIOMARKERS',
                'organism' => 'Homo sapiens (4 civilian astronauts, SpaceX Inspiration4 3-day LEO mission, 590 km)',
                'population_type' => 'Homo sapiens (Human Spaceflight Crew)',
                'sample_timepoints' => ['L-92', 'L-44', 'L-3', 'R+1', 'R+45', 'R+82'],
                'domains' => ['cardiovascular', 'neuro_cognitive_sleep', 'musculoskeletal'],
                'assay_types' => [
                    'Comprehensive Metabolic Panel (CMP)',
                    'Multiplex Immune and Cardiac Cytokine Arrays',
                ],
                'doi' => '10.26030/mc5d-p710',
                'associated_publication_doi' => '10.1038/s41586-024-07639-y',
                'publication' => 'NASA OSDR Dataset OSD-575 / LSDS-8 (Dataset DOI: 10.26030/mc5d-p710); associated with Space Omics and Medical Atlas (SOMA), Nature 632, 1145–1154 (2024)',
                'osdr_url' => 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-575',
                'api_metadata_url' => 'https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-575/',
                'api_files_url' => 'https://osdr.nasa.gov/osdr/data/osd/files/575',
                'retrieval_status' => 'LOCALLY_CURATED_OSDR_RECORD',
                'summary' => 'Profiles venous blood serum comprehensive metabolic panels and multiplex immune/cardiac cytokine arrays across pre-flight (L-92, L-44, L-3) and post-flight (R+1, R+45, R+82) timepoints in four SpaceX Inspiration4 crew members.',
                'relevance_to_mosaic' => 'Provides empirical human spaceflight context linking short-duration orbital stress, fluid-electrolyte shifts, and post-flight metabolic/cytokine recovery.',
                'applicability_note' => 'HUMAN PRE/POST-FLIGHT SERUM BIOMARKERS (LSDS-8) — NOT CONTINUOUS WEARABLE TELEMETRY',
                'limitations' => 'Samples were collected via venous blood draw pre-flight (L-92, L-44, L-3) and post-landing (R+1, R+45, R+82) across n=4 private astronauts on a 3-day LEO mission. Does not provide continuous beat-to-beat in-flight hemodynamic telemetry.',
                'files_manifest' => [
                    ['file_name' => 'ISA_OSD-575_metadata.zip', 'category' => 'Study Investigation/Assay Metadata (ISA-Tab)', 'size_kb' => 142],
                    ['file_name' => 'LSDS-8_Comprehensive_Metabolic_Panel_CMP.csv', 'category' => 'Comprehensive Metabolic Panel Tabular Data', 'size_kb' => 38],
                    ['file_name' => 'LSDS-8_Immune_Cardiac_Cytokine_Arrays.csv', 'category' => 'Multiplex Immune/Cardiac Cytokine Data', 'size_kb' => 94],
                ],
            ],
            [
                'study_id' => 'OSD-635',
                'identifier_type' => 'OFFICIAL_NASA_OSDR_ACCESSION',
                'accession' => 'OSD-635 / GLDS-608',
                'title' => 'Spaceflight effects on human vascular smooth muscle cell phenotype and function',
                'source_organization' => 'NASA Open Science Data Repository (OSDR / GeneLab)',
                'source_type' => 'NASA_OSDR',
                'study_type' => 'Cellular / In Vitro Spaceflight Transcriptomics (RNA-Seq on ISS)',
                'study_category' => 'CELLULAR_IN_VITRO',
                'organism' => 'Homo sapiens (Primary Human Aortic Smooth Muscle Cells — HASMCs cultured in microgravity on ISS)',
                'population_type' => 'Homo sapiens (In Vitro Primary Vascular Smooth Muscle Cells)',
                'domains' => ['cardiovascular'],
                'assay_types' => [
                    'RNA Sequencing (RNA-Seq Transcriptomics)',
                    'Vascular Smooth Muscle Phenotype & Signaling Pathway Analysis',
                ],
                'doi' => '10.26030/8n5a-q187',
                'publication' => 'NASA OSDR Dataset OSD-635 / GLDS-608 (Dataset DOI: 10.26030/8n5a-q187)',
                'osdr_url' => 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-635',
                'api_metadata_url' => 'https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-635/',
                'api_files_url' => 'https://osdr.nasa.gov/osdr/data/osd/files/635',
                'retrieval_status' => 'LOCALLY_CURATED_OSDR_RECORD',
                'summary' => 'Investigates primary human aortic smooth muscle cells (HASMCs) cultured in microgravity aboard the ISS for 3 days versus ground controls using RNA-sequencing to characterize spaceflight-induced changes in vascular smooth muscle phenotype and signaling.',
                'relevance_to_mosaic' => 'Provides cellular-level research context for vascular smooth muscle adaptation under microgravity unloading relevant to cardiovascular deconditioning hypotheses.',
                'applicability_note' => 'IN VITRO CELLULAR TRANSCRIPTOMICS (GLDS-608) — NOT IN VIVO ASTRONAUT HEMODYNAMIC MONITORING',
                'limitations' => 'Conducted in isolated primary human vascular smooth muscle cell cultures over 3 days aboard the ISS. Findings represent cellular mechanotransduction pathways in vitro and cannot be extrapolated as direct in vivo astronaut blood pressure measurements.',
                'files_manifest' => [
                    ['file_name' => 'GLDS-608_rna_seq_Normalized_Counts.csv', 'category' => 'RNA-Seq Normalized Expression Matrix', 'size_kb' => 4120],
                    ['file_name' => 'GLDS-608_differential_expression.csv', 'category' => 'Differential Expression Analysis (Flight vs Ground)', 'size_kb' => 2890],
                    ['file_name' => 'OSD-635_ISA_metadata.zip', 'category' => 'ISA-Tab Study Metadata', 'size_kb' => 118],
                ],
            ],
            [
                'study_id' => 'OSD-571',
                'identifier_type' => 'OFFICIAL_NASA_OSDR_ACCESSION',
                'accession' => 'OSD-571 / GLDS-563',
                'title' => 'SpaceX Inspiration4 Plasma Profiling: Proteomics, EVPs, Metabolomics, cfDNA Sequencing and cfRNA Sequencing Study',
                'source_organization' => 'NASA Open Science Data Repository (OSDR / GeneLab)',
                'source_type' => 'NASA_OSDR',
                'study_type' => 'Human Spaceflight Cohort — Multi-Omics Plasma Profiling',
                'study_category' => 'HUMAN_COHORT_BIOMARKERS',
                'organism' => 'Homo sapiens (4 civilian astronauts, SpaceX Inspiration4)',
                'population_type' => 'Homo sapiens (Human Spaceflight Crew)',
                'sample_timepoints' => ['L-92', 'L-44', 'L-3', 'R+1', 'R+45', 'R+82'],
                'domains' => ['cardiovascular', 'musculoskeletal'],
                'assay_types' => [
                    'Plasma Proteomics & Extracellular Vesicles/Particles (EVPs)',
                    'Untargeted Plasma Metabolomics',
                    'Cell-Free DNA (cfDNA) & Cell-Free RNA (cfRNA) Sequencing',
                ],
                'doi' => '10.26030/h3p5-tc29',
                'associated_publication_doi' => '10.1038/s41586-024-07639-y',
                'publication' => 'NASA OSDR Dataset OSD-571 / GLDS-563 (Dataset DOI: 10.26030/h3p5-tc29); associated with SOMA, Nature 632, 1145–1154 (2024)',
                'osdr_url' => 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-571',
                'api_metadata_url' => 'https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-571/',
                'api_files_url' => 'https://osdr.nasa.gov/osdr/data/osd/files/571',
                'retrieval_status' => 'LOCALLY_CURATED_OSDR_RECORD',
                'summary' => 'Multi-omic profiling of blood plasma (proteomics, extracellular vesicles and particles, metabolomics, cfDNA, and cfRNA sequencing) across pre- and post-flight timepoints in four SpaceX Inspiration4 crew members.',
                'relevance_to_mosaic' => 'Supports contextual biological plausibility for systemic vascular and metabolic remodeling following orbital flight stress.',
                'applicability_note' => 'HUMAN PRE/POST-FLIGHT PLASMA OMICS (GLDS-563) — NOT REAL-TIME TELEMETRY',
                'limitations' => 'Pre- and post-flight venous plasma sampling across n=4 astronauts; does not measure real-time in-flight autonomic fluctuations.',
                'files_manifest' => [
                    ['file_name' => 'GLDS-563_Plasma_Proteomics_Matrix.csv', 'category' => 'Plasma Proteomics & EVP Matrix', 'size_kb' => 1850],
                    ['file_name' => 'GLDS-563_cfDNA_cfRNA_Sequencing_Metadata.zip', 'category' => 'Cell-Free Nucleic Acid & Metabolomics Metadata', 'size_kb' => 640],
                ],
            ],
            [
                'study_id' => 'HRP-CV-OI',
                'identifier_type' => 'INTERNAL_APP_REFERENCE_ID',
                'accession' => 'INTERNAL-REF: HRP-CV-OI (NASA HRR Risk i=179)',
                'title' => 'Risk of Cardiovascular Adaptations Contributing to Adverse Mission Performance and Health Outcomes',
                'source_organization' => 'NASA Human Research Program (HRP) — Human Research Roadmap',
                'source_type' => 'NASA_HRP',
                'study_type' => 'NASA Human System Risk Board Evidence Synthesis',
                'study_category' => 'EVIDENCE_SYNTHESIS',
                'organism' => 'Homo sapiens (Career Spaceflight Astronaut Cohorts)',
                'population_type' => 'Homo sapiens (Human Spaceflight Crew)',
                'domains' => ['cardiovascular'],
                'assay_types' => ['Tilt-Table & Stand Orthostatic Tests', 'Arterial Pressure & Fluid Shift Assessment', 'Autonomic Baroreflex Evaluation'],
                'doi' => 'NASA-HRR-RISK-179 (Internal Ref: HRP-CV-OI)',
                'publication' => 'NASA Human Research Roadmap — Risk of Cardiovascular Adaptations Contributing to Adverse Mission Performance and Health Outcomes (risk.aspx?i=179)',
                'osdr_url' => 'https://humanresearchroadmap.nasa.gov/Risks/risk.aspx?i=179',
                'api_metadata_url' => 'https://humanresearchroadmap.nasa.gov/Risks/risk.aspx?i=179',
                'api_files_url' => 'https://humanresearchroadmap.nasa.gov/evidence/',
                'retrieval_status' => 'LOCALLY_CURATED_HRP_SUMMARY',
                'summary' => 'Documents spaceflight-induced cephalad fluid redistribution, plasma volume reduction, cardiac and vascular remodeling, and baroreflex attenuation that increase orthostatic intolerance risk during gravitational transitions or operational exertion.',
                'relevance_to_mosaic' => 'Contextualizes the autonomic and fluid-redistribution hypotheses evaluated during Commander Alex Morgan\'s Day 120 presyncope reconstruction.',
                'applicability_note' => 'INTERNAL APP ID (HRP-CV-OI) MAPPED TO OFFICIAL NASA HRR RISK i=179 — CONTEXTUAL REFERENCE',
                'limitations' => 'HRP-CV-OI is an internal MOSAIC-9 reference ID mapped to NASA HRR Risk i=179. Population-level risk synthesis does not establish single-subject diagnostic certainty.',
                'files_manifest' => [],
            ],
            [
                'study_id' => 'HRP-SLEEP-CIRC',
                'identifier_type' => 'INTERNAL_APP_REFERENCE_ID',
                'accession' => 'INTERNAL-REF: HRP-SLEEP-CIRC (NASA HRR Risk i=100)',
                'title' => 'Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload',
                'source_organization' => 'NASA Human Research Program (HRP) — Human Research Roadmap',
                'source_type' => 'NASA_HRP',
                'study_type' => 'NASA Human System Risk Board Evidence Synthesis',
                'study_category' => 'EVIDENCE_SYNTHESIS',
                'organism' => 'Homo sapiens (ISS, Shuttle, and Spaceflight Analog Crews)',
                'population_type' => 'Homo sapiens (Human Spaceflight Crew)',
                'domains' => ['neuro_cognitive_sleep', 'cardiovascular'],
                'assay_types' => ['Wrist Actigraphy', 'Psychomotor Vigilance Task (PVT)', 'Autonomic & Circadian Phase Assessments'],
                'doi' => 'NASA-HRR-RISK-100 (Internal Ref: HRP-SLEEP-CIRC)',
                'publication' => 'NASA Human Research Roadmap — Sleep Loss, Circadian Desynchronization, and Work Overload (risk.aspx?i=100)',
                'osdr_url' => 'https://humanresearchroadmap.nasa.gov/Risks/risk.aspx?i=100',
                'api_metadata_url' => 'https://humanresearchroadmap.nasa.gov/Risks/risk.aspx?i=100',
                'api_files_url' => 'https://humanresearchroadmap.nasa.gov/evidence/',
                'retrieval_status' => 'LOCALLY_CURATED_HRP_SUMMARY',
                'summary' => 'Synthesizes spaceflight behavioral health evidence demonstrating that sleep curtailment, circadian misalignment, and work overload degrade cognitive vigilance (PVT reaction latency) and alter autonomic regulation.',
                'relevance_to_mosaic' => 'Provides published aerospace context for multi-day sleep restriction and workload extension preceding cognitive slowing and autonomic strain.',
                'applicability_note' => 'INTERNAL APP ID (HRP-SLEEP-CIRC) MAPPED TO OFFICIAL NASA HRR RISK i=100 — CONTEXTUAL REFERENCE',
                'limitations' => 'HRP-SLEEP-CIRC is an internal MOSAIC-9 reference ID mapped to NASA HRR Risk i=100. Cohort-level behavioral risk relationships do not prove single-factor causation.',
                'files_manifest' => [],
            ],
            [
                'study_id' => 'HRP-AERO-MUSC',
                'identifier_type' => 'INTERNAL_APP_REFERENCE_ID',
                'accession' => 'INTERNAL-REF: HRP-AERO-MUSC (NASA HRR Muscle & Aerobic Risk Portfolio)',
                'title' => 'Risk of Impaired Performance Due to Reduced Muscle Mass, Strength, and Cardiorespiratory Endurance',
                'source_organization' => 'NASA Human Research Program (HRP) — Human Research Roadmap',
                'source_type' => 'NASA_HRP',
                'study_type' => 'NASA Human System Risk Board Evidence Synthesis',
                'study_category' => 'EVIDENCE_SYNTHESIS',
                'organism' => 'Homo sapiens (Long-Duration Spaceflight Astronaut Cohorts)',
                'population_type' => 'Homo sapiens (Human Spaceflight Crew)',
                'domains' => ['musculoskeletal', 'cardiovascular'],
                'assay_types' => ['Cycle Ergometer & Treadmill VO2peak Protocols', 'ARED Resistive Exercise Tracking', 'Cardiorespiratory Conditioning Assessments'],
                'doi' => 'NASA-HRR-AERO-MUSC (Internal Ref: HRP-AERO-MUSC)',
                'publication' => 'NASA Human Research Roadmap Evidence Catalogue — Muscle Mass, Strength, and Cardiorespiratory Endurance Portfolio',
                'osdr_url' => 'https://humanresearchroadmap.nasa.gov/evidence/',
                'api_metadata_url' => 'https://humanresearchroadmap.nasa.gov/evidence/',
                'api_files_url' => 'https://humanresearchroadmap.nasa.gov/evidence/',
                'retrieval_status' => 'LOCALLY_CURATED_HRP_SUMMARY',
                'summary' => 'Summarizes evidence on skeletal unloading and cardiorespiratory deconditioning in microgravity, and evaluates aerobic cycle ergometer and resistive exercise protocols used to preserve functional capacity.',
                'relevance_to_mosaic' => 'Contextualizes the role of abbreviated or omitted cycle ergometer sessions on Days 118–119 as a potential contributing factor in deconditioning.',
                'applicability_note' => 'INTERNAL APP ID (HRP-AERO-MUSC) MAPPED TO NASA HRR EVIDENCE CATALOGUE — CONTEXTUAL REFERENCE',
                'limitations' => 'HRP-AERO-MUSC is an internal MOSAIC-9 reference ID. Long-duration deconditioning evidence cannot isolate the acute effect of a single missed workout without controlled clinical testing.',
                'files_manifest' => [],
            ],
            [
                'study_id' => 'HRP-ENV-CO2',
                'identifier_type' => 'INTERNAL_APP_REFERENCE_ID',
                'accession' => 'INTERNAL-REF: HRP-ENV-CO2 (NASA HRR Crewed Vehicle CO2 Risk)',
                'title' => 'Risk of Nominal Acute and Chronic Ambient Carbon Dioxide Exposure in Crewed Vehicles Leading to In-Mission Health Effects or Performance Decrements (CO2 Risk)',
                'source_organization' => 'NASA Human Research Program (HRP) — Human Research Roadmap',
                'source_type' => 'NASA_HRP',
                'study_type' => 'Spacecraft Environmental Health Risk Synthesis',
                'study_category' => 'EVIDENCE_SYNTHESIS',
                'organism' => 'Homo sapiens (Crewed Spacecraft & Enclosed Habitat Cohorts)',
                'population_type' => 'Homo sapiens (Human Spaceflight Crew)',
                'domains' => ['environmental', 'neuro_cognitive_sleep', 'cardiovascular'],
                'assay_types' => ['Spacecraft Cabin Ambient ppCO2 Monitoring', 'Spaceflight Headache & Symptom Logs', 'Ventilation & Localized Microclimate Tracking'],
                'doi' => 'NASA-HRR-CO2-RISK (Internal Ref: HRP-ENV-CO2)',
                'publication' => 'NASA Human Research Roadmap — Risk of Nominal Acute and Chronic Ambient Carbon Dioxide Exposure in Crewed Vehicles (CO2 Risk)',
                'osdr_url' => 'https://humanresearchroadmap.nasa.gov/evidence/',
                'api_metadata_url' => 'https://humanresearchroadmap.nasa.gov/evidence/',
                'api_files_url' => 'https://humanresearchroadmap.nasa.gov/evidence/',
                'retrieval_status' => 'LOCALLY_CURATED_HRP_SUMMARY',
                'summary' => 'Evaluates how enclosed spacecraft ambient carbon dioxide levels and localized ventilation pockets interact with cephalad fluid shifts, headache incidence, and operational performance.',
                'relevance_to_mosaic' => 'Contextualizes Lead Flight Engineer Marcus Vance\'s Day 118 19:15 MET incident (INC-ARES4-118-002) during a 12-hour Node 2 coolant loop maintenance shift where synthetic localized cabin CO2 was modeled at 3.5 mmHg.',
                'applicability_note' => 'INTERNAL APP ID (HRP-ENV-CO2) — NO UNIVERSAL DETERMINISTIC CO2 HEADACHE THRESHOLD ESTABLISHED',
                'limitations' => 'HRP-ENV-CO2 is an internal MOSAIC-9 reference ID. NASA HRR notes wide inter-individual variability and localized air-pocket effects; the 3.5 mmHg value in MOSAIC-9 is a synthetic scenario parameter, not an established universal clinical threshold.',
                'files_manifest' => [],
            ],
            [
                'study_id' => 'DONKI-HELIO-2026',
                'identifier_type' => 'INTERNAL_APP_REFERENCE_ID',
                'accession' => 'INTERNAL-REF: DONKI-HELIO-2026 (NASA CCMC DONKI)',
                'title' => 'NASA CCMC DONKI Space Weather & Solar Energetic Particle (SEP) Context Feed',
                'source_organization' => 'NASA Community Coordinated Modeling Center (CCMC / DONKI)',
                'source_type' => 'NASA_DONKI',
                'study_type' => 'Heliophysics & Space Radiation Environmental Context',
                'study_category' => 'ENVIRONMENTAL_CONTEXT',
                'organism' => 'Spacecraft Ambient Heliophysics Environment (Not Biological)',
                'population_type' => 'Spacecraft Hull & Ambient Radiation Context',
                'domains' => ['environmental'],
                'assay_types' => ['Solar Flare / SEP Flux Telemetry', 'Ambient Hull Dosimetry Context'],
                'doi' => 'NASA-DONKI-API-V1 (Internal Ref: DONKI-HELIO-2026)',
                'publication' => 'NASA CCMC Space Weather Database Of Notifications, Knowledge, Information (DONKI)',
                'osdr_url' => 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
                'api_metadata_url' => 'https://api.nasa.gov/DONKI/SEP',
                'api_files_url' => 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
                'retrieval_status' => 'LOCALLY_CURATED_CONTEXT',
                'summary' => 'Provides ambient deep-space solar particle event and geomagnetic/heliophysical activity notifications.',
                'relevance_to_mosaic' => 'Provides ambient environmental context for spacecraft radiation monitoring during deep-space transit.',
                'applicability_note' => 'AMBIENT SPACE WEATHER CONTEXT — NOT PERSONAL ASTRONAUT ORGAN DOSE',
                'limitations' => 'External space weather flux and hull area dosimetry never equate to personal astronaut biological organ dose equivalent without tissue-equivalent phantom and badge verification.',
                'files_manifest' => [],
            ],
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $studies = self::getCuratedStudies();

        if ($request->filled('domain') && $request->query('domain') !== 'ALL') {
            $domain = strtolower($request->query('domain'));
            $studies = array_values(array_filter($studies, function ($s) use ($domain) {
                return in_array($domain, $s['domains'], true);
            }));
        }

        if ($request->filled('source_type') && $request->query('source_type') !== 'ALL') {
            $sourceType = strtoupper($request->query('source_type'));
            $studies = array_values(array_filter($studies, function ($s) use ($sourceType) {
                return $s['source_type'] === $sourceType;
            }));
        }

        if ($request->filled('study_category') && $request->query('study_category') !== 'ALL') {
            $cat = strtoupper($request->query('study_category'));
            $studies = array_values(array_filter($studies, function ($s) use ($cat) {
                return $s['study_category'] === $cat;
            }));
        }

        if ($request->filled('search')) {
            $q = strtolower(trim($request->query('search')));
            $studies = array_values(array_filter($studies, function ($s) use ($q) {
                return str_contains(strtolower($s['study_id']), $q)
                    || str_contains(strtolower($s['accession']), $q)
                    || str_contains(strtolower($s['title']), $q)
                    || str_contains(strtolower($s['summary']), $q)
                    || str_contains(strtolower($s['organism']), $q)
                    || str_contains(strtolower($s['doi']), $q);
            }));
        }

        return response()->json([
            'total_studies' => count($studies),
            'studies' => $studies,
            'taxonomy_v2' => self::getTaxonomyV2(),
            'scientific_disclaimer' => 'NASA OSDR and HRP records provide contextual published spaceflight evidence. OSD-575 (LSDS-8, DOI: 10.26030/mc5d-p710) reflects pre/post-flight venous serum biomarkers across 4 Inspiration4 crew members; OSD-635 (GLDS-608, DOI: 10.26030/8n5a-q187) reflects in vitro human vascular smooth muscle cell RNA-Seq aboard the ISS. Neither constitutes continuous real-time astronaut telemetry.',
        ]);
    }

    public function show(string $studyId): JsonResponse
    {
        $normalized = strtoupper(trim($studyId));
        foreach (self::getCuratedStudies() as $study) {
            if (strtoupper($study['study_id']) === $normalized) {
                return response()->json([
                    'status' => 'VERIFIED',
                    'study' => $study,
                    'taxonomy_classification' => self::getTaxonomyV2()['NASA_RESEARCH_CONTEXT'],
                ]);
            }
        }

        return response()->json([
            'status' => 'UNAVAILABLE_OR_INVALID_STUDY',
            'error' => "Requested study '{$studyId}' is not in the verified NASA OSDR/HRP onboard registry or is unreachable.",
            'fallback_action' => 'Returning safe empty evidence state; no unverified or fabricated external study metadata was injected.',
        ], 404);
    }

    public function osdrLookup(Request $request): JsonResponse
    {
        $studyId = strtoupper(trim((string) $request->input('study_id', 'OSD-575')));

        // Locate curated baseline record if available
        $curatedMatch = null;
        foreach (self::getCuratedStudies() as $study) {
            if (strtoupper($study['study_id']) === $studyId) {
                $curatedMatch = $study;
                break;
            }
        }

        // Validate format OSD-<number>
        if (!preg_match('/^OSD-(\d+)$/', $studyId, $matches)) {
            if ($curatedMatch) {
                return response()->json([
                    'study_id' => $studyId,
                    'retrieval_mode' => 'OFFLINE_CURATED_REGISTRY',
                    'provenance_mode' => 'LOCALLY_CURATED_SUMMARY',
                    'cache_hit' => false,
                    'study' => $curatedMatch,
                ]);
            }

            return response()->json([
                'status' => 'UNAVAILABLE_OR_INVALID_STUDY',
                'error' => "Invalid NASA OSDR accession format '{$studyId}'. Expected format: OSD-<number> (e.g., OSD-575, OSD-635, OSD-571).",
                'retrieval_mode' => 'SAFE_REJECTED',
            ], 422);
        }

        $osdNumber = $matches[1];
        $cacheKey = "mosaic9_osdr_study_v27_{$studyId}";

        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            $cached['cache_hit'] = true;
            return response()->json($cached);
        }

        // Attempt live NASA OSDR API query with strict 3-second timeout and graceful fallback
        try {
            $response = Http::timeout(3)
                ->acceptJson()
                ->get("https://osdr.nasa.gov/osdr/data/osd/files/{$osdNumber}");

            if ($response->successful() && is_array($response->json())) {
                $remoteJson = $response->json();
                $remoteFiles = $remoteJson['studies']["OSD-{$osdNumber}"]['study_files']
                    ?? $remoteJson['studies'][$studyId]['study_files']
                    ?? [];
                $remoteFileCount = is_array($remoteFiles) ? count($remoteFiles) : 0;

                $studyData = $curatedMatch ?? [
                    'study_id' => $studyId,
                    'identifier_type' => 'OFFICIAL_NASA_OSDR_ACCESSION',
                    'accession' => $studyId,
                    'title' => "NASA OSDR Dataset {$studyId}",
                    'source_organization' => 'NASA Open Science Data Repository (OSDR)',
                    'source_type' => 'NASA_OSDR',
                ];
                $studyData['retrieval_status'] = 'LIVE_NASA_OSDR_VERIFIED';
                $studyData['live_remote_file_count'] = $remoteFileCount;

                $payload = [
                    'study_id' => $studyId,
                    'retrieval_mode' => 'LIVE_NASA_OSDR_API',
                    'provenance_mode' => 'LIVE_FETCHED_AND_CURATED',
                    'cache_hit' => false,
                    'live_remote_file_count' => $remoteFileCount,
                    'study' => $studyData,
                    'osdr_remote_status' => 'CONNECTED',
                ];
                Cache::put($cacheKey, $payload, now()->addHours(24));
                return response()->json($payload);
            }
        } catch (\Throwable $e) {
            // Expected in offline deep-space mode or sandboxed network environment
        }

        if ($curatedMatch) {
            $curatedCopy = $curatedMatch;
            $curatedCopy['retrieval_status'] = 'CACHED_ONBOARD_FALLBACK';
            $fallbackPayload = [
                'study_id' => $studyId,
                'retrieval_mode' => 'CACHED_VERIFIED_FALLBACK',
                'provenance_mode' => 'LOCALLY_CURATED_ONBOARD_FALLBACK',
                'cache_hit' => false,
                'study' => $curatedCopy,
                'offline_resilience_note' => 'Live NASA OSDR endpoint unreachable (offline deep-space mode or network sandbox); served locally curated onboard OSDR record.',
            ];
            Cache::put($cacheKey, $fallbackPayload, now()->addHours(6));
            return response()->json($fallbackPayload);
        }

        return response()->json([
            'status' => 'UNAVAILABLE_OR_INVALID_STUDY',
            'study_id' => $studyId,
            'retrieval_mode' => 'OFFLINE_UNAVAILABLE',
            'error' => "NASA OSDR endpoint unreachable in offline mode and '{$studyId}' is not cached in onboard mission storage.",
        ], 503);
    }

    public static function buildEvidenceGraphForIncident(Incident $incident, array $evidenceNodes, array $hypotheses, array $missingEvidence): array
    {
        $taxonomy = self::getTaxonomyV2();
        $isMarcus = $incident->incident_code === 'INC-ARES4-118-002';

        $nodes = [];
        $edges = [];

        // 1. Central Incident Anchor Node
        $incNodeId = 'NODE-' . $incident->incident_code;
        $nodes[] = [
            'id' => $incNodeId,
            'label' => $incident->title,
            'category' => 'DIRECT_OBSERVATION',
            'is_synthetic' => true,
            'node_type' => 'INCIDENT_ANCHOR',
            'source_attribution' => 'Synthetic Onboard Clinical Event Ledger (100% Synthetic Mission Dataset)',
            'confidence_or_applicability' => 0.99,
            'provenance' => "Immutable Synthetic Incident Record {$incident->incident_code}",
            'limitations' => '100% synthetic clinical event record; requires multi-domain precursor synthesis to evaluate contributing factors.',
        ];

        // 2. Four Core Health Domain Nodes
        $domains = [
            ['id' => 'DOM-CV', 'label' => 'Cardiovascular & Autonomic', 'key' => 'cardiovascular'],
            ['id' => 'DOM-SLEEP', 'label' => 'Neuro-Cognitive & Sleep', 'key' => 'neuro_cognitive_sleep'],
            ['id' => 'DOM-MUSC', 'label' => 'Musculoskeletal & Exercise', 'key' => 'musculoskeletal'],
            ['id' => 'DOM-ENV', 'label' => 'Spacecraft Environment', 'key' => 'environmental'],
        ];
        $domainMap = [];
        foreach ($domains as $dom) {
            $domainMap[$dom['key']] = $dom['id'];
            $nodes[] = [
                'id' => $dom['id'],
                'label' => $dom['label'],
                'category' => 'DERIVED_TEMPORAL_ASSOCIATION',
                'is_synthetic' => true,
                'node_type' => 'HEALTH_DOMAIN',
                'domain_key' => $dom['key'],
                'source_attribution' => 'MOSAIC-9 Multi-Domain Health Twin (Synthetic Dataset)',
                'confidence_or_applicability' => 0.95,
                'provenance' => "Aggregated telemetry domain: {$dom['key']}",
                'limitations' => 'Domain-level composite index aggregates synthetic wearable and cabin sensor channels.',
            ];
            $edges[] = [
                'source' => $dom['id'],
                'target' => $incNodeId,
                'relationship' => 'CONTRIBUTES_DOMAIN_CONTEXT',
                'evidence_tier' => 'DERIVED_TEMPORAL_ASSOCIATION',
                'explanation' => "{$dom['label']} precursor signals converged chronologically prior to {$incident->incident_code}.",
            ];
        }

        // 3. Telemetry & Precursor Nodes from reconstructed events
        foreach (array_slice($evidenceNodes, 0, 10) as $idx => $ev) {
            $evId = $ev['event_uid'] ?? ('EVT-NODE-' . ($idx + 1));
            $cat = $ev['category'] ?? '';
            $targetDom = 'DOM-CV';
            if (in_array($cat, ['sleep_observation', 'workload_observation'], true)) {
                $targetDom = 'DOM-SLEEP';
            } elseif ($cat === 'exercise_record') {
                $targetDom = 'DOM-MUSC';
            } elseif ($cat === 'environmental_event') {
                $targetDom = 'DOM-ENV';
            }

            $tier = in_array($ev['classification'] ?? '', ['DERIVED_INDICATOR', 'TEMPORAL_ASSOCIATION'], true)
                ? 'DERIVED_TEMPORAL_ASSOCIATION'
                : 'DIRECT_OBSERVATION';

            $nodes[] = [
                'id' => $evId,
                'label' => $ev['title'] ?? "Event {$evId}",
                'category' => $tier,
                'is_synthetic' => true,
                'node_type' => 'TELEMETRY_OBSERVATION',
                'source_attribution' => $taxonomy[$tier]['source_attribution'],
                'confidence_or_applicability' => $ev['confidence'] ?? 0.95,
                'provenance' => "Synthetic Ledger Event {$evId} ({$ev['timestamp']})",
                'limitations' => $taxonomy[$tier]['limitations'],
                'value' => $ev['value'] ?? null,
                'unit' => $ev['unit'] ?? null,
            ];
            $edges[] = [
                'source' => $evId,
                'target' => $targetDom,
                'relationship' => 'OBSERVED_IN_DOMAIN',
                'evidence_tier' => $tier,
                'explanation' => $ev['reasoning'] ?? "Synthetic precursor signal in {$targetDom}.",
            ];
        }

        // 4. NASA Research Context Nodes (OSDR + HRP)
        foreach (self::getCuratedStudies() as $study) {
            if ($isMarcus && !in_array('environmental', $study['domains'], true) && !in_array('neuro_cognitive_sleep', $study['domains'], true) && $study['study_id'] !== 'OSD-575') {
                continue;
            }
            $sNodeId = 'NASA-' . $study['study_id'];
            $nodes[] = [
                'id' => $sNodeId,
                'label' => $study['study_id'] . ': ' . mb_substr($study['title'], 0, 46) . '...',
                'full_title' => $study['title'],
                'category' => 'NASA_RESEARCH_CONTEXT',
                'is_synthetic' => false,
                'node_type' => $study['source_type'],
                'study_id' => $study['study_id'],
                'doi' => $study['doi'],
                'organism' => $study['organism'],
                'study_type' => $study['study_type'],
                'osdr_url' => $study['osdr_url'],
                'source_attribution' => $study['source_organization'],
                'confidence_or_applicability' => 0.92,
                'provenance' => "{$study['accession']} ({$study['publication']})",
                'limitations' => $study['limitations'],
                'applicability_note' => $study['applicability_note'],
            ];

            foreach ($study['domains'] as $domKey) {
                if (isset($domainMap[$domKey])) {
                    $edges[] = [
                        'source' => $sNodeId,
                        'target' => $domainMap[$domKey],
                        'relationship' => 'PROVIDES_NASA_EVIDENCE_CONTEXT',
                        'evidence_tier' => 'NASA_RESEARCH_CONTEXT',
                        'explanation' => $study['relevance_to_mosaic'],
                    ];
                }
            }
        }

        // 5. Exploratory Hypothesis Nodes
        foreach ($hypotheses as $idx => $hyp) {
            $hId = $hyp['hypothesis_id'] ?? ('HYP-NODE-' . ($idx + 1));
            $nodes[] = [
                'id' => $hId,
                'label' => $hyp['title'],
                'category' => 'EXPLORATORY_HYPOTHESIS',
                'is_synthetic' => true,
                'node_type' => 'HYPOTHESIS',
                'source_attribution' => $taxonomy['EXPLORATORY_HYPOTHESIS']['source_attribution'],
                'confidence_or_applicability' => 0.85,
                'provenance' => "Heuristic Hypothesis {$hId} ({$hyp['plausibility']})",
                'limitations' => $hyp['scientific_boundary'] ?? $taxonomy['EXPLORATORY_HYPOTHESIS']['limitations'],
            ];
            $edges[] = [
                'source' => $incNodeId,
                'target' => $hId,
                'relationship' => 'EVALUATED_BY_HYPOTHESIS',
                'evidence_tier' => 'EXPLORATORY_HYPOTHESIS',
                'explanation' => 'Candidate non-diagnostic physiological explanation requiring flight surgeon evaluation.',
            ];
        }

        // 6. Missing Evidence Nodes
        foreach ($missingEvidence as $idx => $miss) {
            $mId = 'MISS-' . ($idx + 1);
            $nodes[] = [
                'id' => $mId,
                'label' => $miss['title'],
                'category' => 'MISSING_EVIDENCE',
                'is_synthetic' => true,
                'node_type' => 'EPISTEMIC_GAP',
                'source_attribution' => $taxonomy['MISSING_EVIDENCE']['source_attribution'],
                'confidence_or_applicability' => 0.0,
                'provenance' => 'Unacquired sensor modality / epistemic constraint',
                'limitations' => $miss['impact_on_confidence'] ?? $taxonomy['MISSING_EVIDENCE']['limitations'],
            ];
            $edges[] = [
                'source' => $mId,
                'target' => $incNodeId,
                'relationship' => 'CONSTRAINS_CERTAINTY_OF',
                'evidence_tier' => 'MISSING_EVIDENCE',
                'explanation' => $miss['impact_on_confidence'] ?? 'Unmeasured physiological variable penalizes reconstruction confidence.',
            ];
        }

        return [
            'incident_code' => $incident->incident_code,
            'total_nodes' => count($nodes),
            'total_edges' => count($edges),
            'taxonomy_definitions' => $taxonomy,
            'nodes' => $nodes,
            'edges' => $edges,
            'scientific_disclaimer' => 'The Mission Evidence Graph visualizes chronological co-occurrence of synthetic mission telemetry and contextual NASA literature links. OSD-575 (LSDS-8, DOI: 10.26030/mc5d-p710) represents pre/post-flight human venous serum biomarkers and OSD-635 (GLDS-608, DOI: 10.26030/8n5a-q187) represents in vitro vascular smooth muscle cell transcriptomics; neither constitutes continuous in-flight wearable telemetry.',
        ];
    }

    public function evidenceGraph(int $id, Request $request): JsonResponse
    {
        $incident = Incident::with('crewMember')->find($id);
        if (!$incident) {
            return response()->json(['error' => 'Incident not found'], 404);
        }

        // Delegate through IncidentController->reconstruct to ensure identical horizon nodes & hypotheses
        $incidentController = new IncidentController();
        $reconstructData = $incidentController->reconstruct($id, $request)->getData(true);

        return response()->json($reconstructData['evidence_graph']);
    }
}
