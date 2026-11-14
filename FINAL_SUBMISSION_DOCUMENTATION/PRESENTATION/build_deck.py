#!/usr/bin/env python3
"""
MOSAIC-9 — NASA Space Apps Challenge 2026 Presentation Generator
Builds both MOSAIC-9_NASA_SPACE_APPS_2026_FINAL.pptx and MOSAIC-9_NASA_SPACE_APPS_2026_FINAL.pdf
with 100% synchronized layouts, cinematic deep-space aerospace styling, and exactly 7 slides.
"""

import os
import sys
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

from reportlab.pdfgen import canvas
import pymupdf

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(BASE_DIR, 'screenshots')
PPTX_PATH = os.path.join(BASE_DIR, 'MOSAIC-9_NASA_SPACE_APPS_2026_FINAL.pptx')
PDF_PATH = os.path.join(BASE_DIR, 'MOSAIC-9_NASA_SPACE_APPS_2026_FINAL.pdf')
TITLE_BG_PATH = os.path.join(BASE_DIR, 'title_background.png')

# 16:9 Widescreen dimensions
WIDTH_IN = 13.333
HEIGHT_IN = 7.5
WIDTH_PT = WIDTH_IN * 72.0   # 960 points
HEIGHT_PT = HEIGHT_IN * 72.0 # 540 points

# Aerospace Color Palette (RGB tuples 0-255)
C_VOID       = (5, 8, 16)       # Deepest void
C_PANEL_DARK = (13, 20, 36)     # Card background
C_PANEL_ALT  = (18, 27, 48)     # Elevated card
C_PANEL_HIGHLIGHT = (23, 34, 60)
C_CYAN       = (6, 182, 212)    # Primary accent (#06B6D4)
C_SKY        = (56, 189, 248)   # Bright highlight (#38BDF8)
C_ICE        = (224, 242, 254)  # Ice blue text
C_WHITE      = (255, 255, 255)  # Pure white
C_SLATE      = (148, 163, 184)  # Muted secondary text
C_SLATE_DARK = (45, 58, 80)     # Subtle borders
C_AMBER      = (245, 158, 11)   # Warning / Tagline
C_ROSE       = (244, 63, 94)    # Alert
C_EMERALD    = (16, 185, 129)   # Verified / nominal
C_PURPLE     = (168, 85, 247)   # Derived indicator

def to_rgb(c_tuple):
    return RGBColor(*c_tuple)

def to_rl_color(c_tuple):
    return (c_tuple[0]/255.0, c_tuple[1]/255.0, c_tuple[2]/255.0)

# ==============================================================================
# PRESENTATION GENERATOR ENGINE
# ==============================================================================
def generate_all():
    print("Initializing MOSAIC-9 7-Slide Presentation Generator...")
    
    # --------------------------------------------------------------------------
    # PPTX Presentation Setup
    # --------------------------------------------------------------------------
    prs = pptx.Presentation()
    prs.slide_width = Inches(WIDTH_IN)
    prs.slide_height = Inches(HEIGHT_IN)
    blank_layout = prs.slide_layouts[6]
    
    # --------------------------------------------------------------------------
    # ReportLab PDF Setup
    # --------------------------------------------------------------------------
    pdf = canvas.Canvas(PDF_PATH, pagesize=(WIDTH_PT, HEIGHT_PT))
    
    # Common helper closures
    def pptx_bg(slide, bg_image=None):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(WIDTH_IN), Inches(HEIGHT_IN))
        bg.fill.solid()
        bg.fill.fore_color.rgb = to_rgb(C_VOID)
        bg.line.fill.background()
        if bg_image and os.path.exists(bg_image):
            slide.shapes.add_picture(bg_image, 0, 0, Inches(WIDTH_IN), Inches(HEIGHT_IN))

    def pdf_bg(bg_image=None):
        pdf.setFillColorRGB(*to_rl_color(C_VOID))
        pdf.rect(0, 0, WIDTH_PT, HEIGHT_PT, fill=1, stroke=0)
        if bg_image and os.path.exists(bg_image):
            pdf.drawImage(bg_image, 0, 0, WIDTH_PT, HEIGHT_PT)

    def draw_header(slide, badge, headline, subtitle):
        # PPTX Badge
        tx_b = slide.shapes.add_textbox(Inches(0.6), Inches(0.35), Inches(12.13), Inches(0.3))
        tf_b = tx_b.text_frame
        tf_b.margin_left = tf_b.margin_right = tf_b.margin_top = tf_b.margin_bottom = 0
        p_b = tf_b.paragraphs[0]
        p_b.text = badge.upper()
        p_b.font.name = 'Arial'
        p_b.font.size = Pt(9.5)
        p_b.font.bold = True
        p_b.font.color.rgb = to_rgb(C_CYAN)

        # PPTX Headline
        tx_h = slide.shapes.add_textbox(Inches(0.6), Inches(0.62), Inches(12.13), Inches(0.55))
        tf_h = tx_h.text_frame
        tf_h.margin_left = tf_h.margin_right = tf_h.margin_top = tf_h.margin_bottom = 0
        p_h = tf_h.paragraphs[0]
        p_h.text = headline
        p_h.font.name = 'Arial'
        p_h.font.size = Pt(21.0)
        p_h.font.bold = True
        p_h.font.color.rgb = to_rgb(C_WHITE)

        # PPTX Subtitle
        tx_s = slide.shapes.add_textbox(Inches(0.6), Inches(1.18), Inches(12.13), Inches(0.35))
        tf_s = tx_s.text_frame
        tf_s.margin_left = tf_s.margin_right = tf_s.margin_top = tf_s.margin_bottom = 0
        p_s = tf_s.paragraphs[0]
        p_s.text = subtitle
        p_s.font.name = 'Arial'
        p_s.font.size = Pt(11.0)
        p_s.font.italic = True
        p_s.font.color.rgb = to_rgb(C_SLATE)

        # PDF Header
        pdf.setFillColorRGB(*to_rl_color(C_CYAN))
        pdf.setFont("Helvetica-Bold", 9.5)
        pdf.drawString(0.6 * 72.0, HEIGHT_PT - (0.50 * 72.0), badge.upper())

        pdf.setFillColorRGB(*to_rl_color(C_WHITE))
        pdf.setFont("Helvetica-Bold", 21.0)
        pdf.drawString(0.6 * 72.0, HEIGHT_PT - (0.85 * 72.0), headline)

        pdf.setFillColorRGB(*to_rl_color(C_SLATE))
        pdf.setFont("Helvetica-Oblique", 11.0)
        pdf.drawString(0.6 * 72.0, HEIGHT_PT - (1.15 * 72.0), subtitle)

    def draw_footer(slide, num):
        # PPTX Footer
        tx = slide.shapes.add_textbox(Inches(0.6), Inches(7.08), Inches(12.13), Inches(0.3))
        tf = tx.text_frame
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = f"MOSAIC-9  •  TESSERA FLIGHT LAB  •  NASA SPACE APPS CHALLENGE 2026          \"Every Signal Has a Story.\"          SLIDE {num:02d} / 07"
        p.font.name = 'Arial'
        p.font.size = Pt(8.5)
        p.font.color.rgb = to_rgb((90, 105, 128))

        # PDF Footer
        pdf.setFillColorRGB(90/255.0, 105/255.0, 128/255.0)
        pdf.setFont("Helvetica", 8.5)
        pdf.drawString(0.6 * 72.0, HEIGHT_PT - (7.25 * 72.0), f"MOSAIC-9  •  TESSERA FLIGHT LAB  •  NASA SPACE APPS CHALLENGE 2026          \"Every Signal Has a Story.\"          SLIDE {num:02d} / 07")

    def draw_card(slide, left, top, width, height, fill_color=C_PANEL_DARK, border_color=C_SLATE_DARK, border_width=1.0):
        # PPTX Card
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        shape.fill.solid()
        shape.fill.fore_color.rgb = to_rgb(fill_color)
        if border_color:
            shape.line.color.rgb = to_rgb(border_color)
            shape.line.width = Pt(border_width)
        else:
            shape.line.fill.background()

        # PDF Card
        x = left * 72.0
        w = width * 72.0
        h = height * 72.0
        y = HEIGHT_PT - (top * 72.0) - h

        pdf.setFillColorRGB(*to_rl_color(fill_color))
        if border_color:
            pdf.setStrokeColorRGB(*to_rl_color(border_color))
            pdf.setLineWidth(border_width)
            pdf.roundRect(x, y, w, h, 4, fill=1, stroke=1)
        else:
            pdf.roundRect(x, y, w, h, 4, fill=1, stroke=0)

    def draw_img(slide, img_path, left, top, width, height, border_color=C_CYAN):
        if os.path.exists(img_path):
            # PPTX Frame & Image
            if border_color:
                frame = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(left - 0.02), Inches(top - 0.02), Inches(width + 0.04), Inches(height + 0.04))
                frame.fill.solid()
                frame.fill.fore_color.rgb = to_rgb(C_VOID)
                frame.line.color.rgb = to_rgb(border_color)
                frame.line.width = Pt(1.5)
            slide.shapes.add_picture(img_path, Inches(left), Inches(top), Inches(width), Inches(height))

            # PDF Frame & Image
            x = left * 72.0
            w = width * 72.0
            h = height * 72.0
            y = HEIGHT_PT - (top * 72.0) - h

            if border_color:
                pdf.setStrokeColorRGB(*to_rl_color(border_color))
                pdf.setLineWidth(1.5)
                pdf.rect(x - 2, y - 2, w + 4, h + 4, fill=0, stroke=1)
            pdf.drawImage(img_path, x, y, w, h)

    def draw_textbox(slide, left, top, width, height, paragraphs):
        """
        paragraphs is a list of tuples: (text, font_size, font_color, bold, italic, space_after)
        """
        # PPTX
        tx = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
        tf = tx.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.04)

        for i, (text, size, color, bold, italic, space_after) in enumerate(paragraphs):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            p.text = text
            p.font.name = 'Arial'
            p.font.size = Pt(size)
            p.font.color.rgb = to_rgb(color)
            p.font.bold = bold
            p.font.italic = italic
            if space_after > 0:
                p.space_after = Pt(space_after)

        # PDF
        curr_y = top * 72.0
        for text, size, color, bold, italic, space_after in paragraphs:
            fn = "Helvetica-Bold" if bold and not italic else ("Helvetica-Oblique" if italic and not bold else ("Helvetica-BoldOblique" if bold and italic else "Helvetica"))
            pdf.setFont(fn, size)
            pdf.setFillColorRGB(*to_rl_color(color))
            # Draw line
            pdf.drawString((left + 0.04) * 72.0, HEIGHT_PT - curr_y - size, text)
            curr_y += size * 1.25 + space_after

    # ==========================================================================
    # SLIDE 1 — TITLE SLIDE
    # ==========================================================================
    print("Building Slide 1: Title...")
    s1 = prs.slides.add_slide(blank_layout)
    pptx_bg(s1, TITLE_BG_PATH)
    pdf_bg(TITLE_BG_PATH)

    # Top Brand Pill
    draw_card(s1, 0.8, 0.8, 4.5, 0.45, fill_color=(10, 18, 36), border_color=C_CYAN, border_width=1.2)
    draw_textbox(s1, 0.95, 0.88, 4.2, 0.35, [
        ("TESSERA FLIGHT LAB  //  MISSION SYSTEMS DIVISION", 9.5, C_CYAN, True, False, 0)
    ])

    # Big Title
    draw_textbox(s1, 0.8, 1.55, 10.5, 2.5, [
        ("MOSAIC-9", 60.0, C_WHITE, True, False, 4),
        ("Mission Health Event Reconstruction for Deep-Space Crews", 21.0, C_ICE, False, False, 14),
        ("\"Every Signal Has a Story.\"", 18.0, C_AMBER, True, True, 0),
    ])

    # Cyan Accent Glow Bar
    draw_card(s1, 0.8, 3.8, 6.0, 0.04, fill_color=C_CYAN, border_color=C_SKY, border_width=1.0)

    # Context Card (Bottom Left)
    draw_card(s1, 0.8, 4.2, 5.6, 2.4, fill_color=(12, 19, 35), border_color=C_SLATE_DARK, border_width=1.0)
    draw_textbox(s1, 1.05, 4.4, 5.1, 2.0, [
        ("NASA SPACE APPS CHALLENGE 2026", 11.0, C_CYAN, True, False, 6),
        ("An autonomous, explainable mission-health intelligence platform engineered for long-duration deep-space transit under extreme communications latency (up to 22-minute light-time delay).", 9.5, C_SLATE, False, False, 10),
        ("ARCHITECTURE HIGHLIGHTS", 9.5, C_WHITE, True, False, 4),
        ("• React 18 & Apache ECharts UI  •  Laravel 11 Onboard Ledger  •  Python SciPy Core", 8.5, C_ICE, False, False, 3),
        ("• 53 Automated Verification Tests  •  Dual-Engine Deterministic Onboard Fallback", 8.5, C_EMERALD, True, False, 0),
    ])

    # Metadata Card (Bottom Right)
    draw_card(s1, 6.7, 4.2, 5.8, 2.4, fill_color=(12, 19, 35), border_color=C_SLATE_DARK, border_width=1.0)
    draw_textbox(s1, 6.95, 4.4, 5.3, 2.0, [
        ("MISSION PROFILE & SYSTEM VERIFICATION", 11.0, C_AMBER, True, False, 6),
        ("Team: TESSERA FLIGHT LAB  •  Mission Target: ARES-IV Mars Transit (Sol 120)", 9.5, C_WHITE, True, False, 5),
        ("Public Repository: https://github.com/irfan-ibtech/MOSAIC-9", 9.0, C_SKY, False, False, 8),
        ("CORE SCIENTIFIC PRINCIPLE", 9.5, C_WHITE, True, False, 4),
        ("MOSAIC-9 provides explainable decision support for human flight surgeons and crew medical officers by reconstructing the complete precursor story behind acute health incidents.", 8.5, C_SLATE, False, False, 0),
    ])

    draw_footer(s1, 1)
    pdf.showPage()

    # ==========================================================================
    # SLIDE 2 — THE PROBLEM
    # ==========================================================================
    print("Building Slide 2: The Problem...")
    s2 = prs.slides.add_slide(blank_layout)
    pptx_bg(s2)
    pdf_bg()

    draw_header(s2, 
        "OPERATIONAL VULNERABILITY  //  22-MINUTE LIGHT-TIME COMMS LAG",
        "A Health Event Is More Than a Single Measurement.",
        "During deep-space transit, sleep, workload, and exercise interact over time. Isolated vital-sign alerts leave crews blind to event genesis."
    )

    # Left Column: Conventional Monitoring Failure Mode
    draw_card(s2, 0.6, 1.6, 4.6, 5.15, fill_color=C_PANEL_DARK, border_color=C_ROSE, border_width=1.5)
    draw_textbox(s2, 0.85, 1.8, 4.1, 4.75, [
        ("CONVENTIONAL MONITORING: THE POINT-ALERT TRAP", 11.0, C_ROSE, True, False, 8),
        ("ISOLATED TELEMETRY WARNING (DAY 120, 08:30 MET):", 9.5, C_WHITE, True, False, 4),
        ("ALERT: Systolic BP 88 mmHg  •  HR 118 bpm", 12.0, C_ROSE, True, False, 10),
        ("WHY ISOLATED INDICATORS FAIL IN DEEP SPACE:", 10.0, C_AMBER, True, False, 6),
        ("1. Zero Temporal Depth", 9.5, C_WHITE, True, False, 2),
        ("An acute reading reveals cardiovascular collapse but hides whether it stems from acute shock, chronic deconditioning, or dehydration.", 8.5, C_SLATE, False, False, 8),
        ("2. Disconnected Operational Context", 9.5, C_WHITE, True, False, 2),
        ("Vital-sign monitors ignore preceding false alarms, maintenance shifts, and skipped exercise sessions.", 8.5, C_SLATE, False, False, 8),
        ("3. Communications Blackout Paralysis", 9.5, C_WHITE, True, False, 2),
        ("With a 22-minute light-time delay to Earth, terrestrial flight surgeons receive alarms too late to triage interactively.", 8.5, C_SLATE, False, False, 8),
        ("4. Reactive vs. Causal Interventions", 9.5, C_WHITE, True, False, 2),
        ("Treating the point measurement risks acute pharmacological misdirection without restoring underlying physiological reserves.", 8.5, C_SLATE, False, False, 0),
    ])

    # Right Column: The Interacting Precursor Sequence
    draw_card(s2, 5.4, 1.6, 7.33, 5.15, fill_color=C_PANEL_DARK, border_color=C_CYAN, border_width=1.2)
    draw_textbox(s2, 5.65, 1.8, 6.83, 4.75, [
        ("OPERATIONAL REALITY: THE MULTI-DAY INTERACTING PRECURSOR CASCADE", 11.0, C_CYAN, True, False, 8),
        ("Health events in microgravity unfold across interconnected operational and biological domains:", 9.0, C_SLATE, False, False, 10),

        ("STEP 1: SLEEP DISRUPTION (Sol 116–117)", 10.0, C_WHITE, True, False, 2),
        ("• Unscheduled nocturnal false alarms (02:14 MET) interrupt delta-wave recovery; sleep drops to 5.0h / 4.5h.", 8.5, C_ICE, False, False, 6),

        ("STEP 2: WORKLOAD ACCUMULATION (Sol 116–118)", 10.0, C_WHITE, True, False, 2),
        ("• Emergency coolant-loop overhaul extends duty shifts from 8.0h to 10.5h, elevating neuro-cognitive fatigue.", 8.5, C_ICE, False, False, 6),

        ("STEP 3: EXERCISE CHANGES (Sol 118–119)", 10.0, C_WHITE, True, False, 2),
        ("• Operational exhaustion leads to 50% cycle ergometer cut (Day 118) and complete cancellation (Day 119, 0 W).", 8.5, C_ICE, False, False, 6),

        ("STEP 4: PHYSIOLOGICAL OBSERVATIONS (Sol 117–120)", 10.0, C_WHITE, True, False, 2),
        ("• Autonomic vagal tone suppression (HRV RMSSD drops 42 -> 18 ms) unmasks progressive vascular hypovolemia.", 8.5, C_ICE, False, False, 6),

        ("STEP 5: MISSION-HEALTH REVIEW (Sol 120, 08:30 MET)", 10.0, C_WHITE, True, False, 2),
        ("• Presyncope on simulated gravity ingress (88/56 mmHg) requires explainable, chronological event reconstruction.", 8.5, C_ICE, False, False, 10),

        ("EPISTEMIC BOUNDARY & SCIENTIFIC INTEGRITY DISCLOSURE", 9.0, C_AMBER, True, False, 2),
        ("This sequence reflects observed operational covariance across mission duty shifts. MOSAIC-9 explicitly discloses that correlation does not establish deterministic causation in every clinical setting.", 8.0, C_SLATE, False, True, 0),
    ])

    draw_footer(s2, 2)
    pdf.showPage()

    # ==========================================================================
    # SLIDE 3 — OUR SOLUTION
    # ==========================================================================
    print("Building Slide 3: Our Solution...")
    s3 = prs.slides.add_slide(blank_layout)
    pptx_bg(s3)
    pdf_bg()

    draw_header(s3,
        "PLATFORM ARCHITECTURE  //  AUTONOMOUS MULTI-TIER INTELLIGENCE",
        "From Isolated Signals to Explainable Mission Intelligence.",
        "MOSAIC-9 connects multi-channel telemetry, an immutable mission ledger, and NASA research into an interactive edge cockpit."
    )

    # Workflow Ribbon across top
    draw_card(s3, 0.6, 1.55, 12.13, 0.55, fill_color=C_PANEL_HIGHLIGHT, border_color=C_CYAN, border_width=1.0)
    draw_textbox(s3, 0.75, 1.62, 11.83, 0.4, [
        ("CORE FLIGHT WORKFLOW:   [1. OBSERVE] Continuous Biosensors  ->  [2. CONNECT] Temporal Lag Analytics  ->  [3. RECONSTRUCT] Bipartite Evidence Graph  ->  [4. EXPLORE] Pareto Countermeasures  ->  [5. REVIEW] Human Medical Officer Command", 9.2, C_ICE, True, False, 0)
    ])

    # 3 Screenshot Columns
    col_w = 3.91
    img_h = 2.40

    # Column 1: Command Center
    draw_card(s3, 0.6, 2.25, col_w, 4.65, fill_color=C_PANEL_DARK, border_color=C_SLATE_DARK, border_width=1.0)
    draw_img(s3, os.path.join(SCREENSHOTS_DIR, '01_command_center.png'), 0.75, 2.40, col_w - 0.3, img_h, border_color=C_CYAN)
    draw_textbox(s3, 0.75, 4.95, col_w - 0.3, 1.8, [
        ("MODULE A: MISSION COMMAND CENTER", 10.0, C_CYAN, True, False, 3),
        ("• Live streaming multi-sensor telemetry (HR, BP, SpO2, Core Temp, Cortisol).", 8.5, C_WHITE, False, False, 2),
        ("• Sol 120 mission clock & active flight operational milestones.", 8.5, C_SLATE, False, False, 2),
        ("• Real-time DSN communication link state & light-time delay tracking.", 8.5, C_SLATE, False, False, 0),
    ])

    # Column 2: Crew Health Twin
    draw_card(s3, 4.71, 2.25, col_w, 4.65, fill_color=C_PANEL_DARK, border_color=C_SLATE_DARK, border_width=1.0)
    draw_img(s3, os.path.join(SCREENSHOTS_DIR, '02_crew_twins.png'), 4.86, 2.40, col_w - 0.3, img_h, border_color=C_SKY)
    draw_textbox(s3, 4.86, 4.95, col_w - 0.3, 1.8, [
        ("MODULE B: CREW HEALTH TWIN", 10.0, C_SKY, True, False, 3),
        ("• Individual crew baseline tracking across 4 synthetic astronaut profiles.", 8.5, C_WHITE, False, False, 2),
        ("• Circadian stability scoring & multi-domain autonomic reserve status.", 8.5, C_SLATE, False, False, 2),
        ("• Strict cross-module cohort isolation (switching crew resets data state).", 8.5, C_EMERALD, True, False, 0),
    ])

    # Column 3: Event Ledger & Temporal Engine
    draw_card(s3, 8.82, 2.25, col_w, 4.65, fill_color=C_PANEL_DARK, border_color=C_SLATE_DARK, border_width=1.0)
    draw_img(s3, os.path.join(SCREENSHOTS_DIR, '05_temporal_intelligence.png'), 8.97, 2.40, col_w - 0.3, img_h, border_color=C_PURPLE)
    draw_textbox(s3, 8.97, 4.95, col_w - 0.3, 1.8, [
        ("MODULES D & E: TEMPORAL ENGINE", 10.0, C_PURPLE, True, False, 3),
        ("• Immutable flight event ledger capturing operational and acoustic logs.", 8.5, C_WHITE, False, False, 2),
        ("• Empirical lead-lag cross-correlation (-1d to +2d time shifts).", 8.5, C_SLATE, False, False, 2),
        ("• Reconciled Pearson correlation: r = -0.38, n = 4, df = 2.", 8.5, C_AMBER, True, False, 0),
    ])

    draw_footer(s3, 3)
    pdf.showPage()

    # ==========================================================================
    # SLIDE 4 — OUR DISTINCTIVE CONTRIBUTION
    # ==========================================================================
    print("Building Slide 4: Distinctive Contribution...")
    s4 = prs.slides.add_slide(blank_layout)
    pptx_bg(s4)
    pdf_bg()

    draw_header(s4,
        "CORE INNOVATION  //  GRAPH-BASED INCIDENT RECONSTRUCTION",
        "Reconstruct the Story Behind the Event.",
        "Demonstrating Incident INC-ARES4-120-001 (Commander Alex Morgan) — Fictional crew profile, synthetic demonstration telemetry."
    )

    # Metrics Banner
    draw_card(s4, 0.6, 1.55, 12.13, 0.60, fill_color=C_PANEL_HIGHLIGHT, border_color=C_ROSE, border_width=1.2)
    draw_textbox(s4, 0.8, 1.62, 11.73, 0.45, [
        ("ACUTE INCIDENT TELEMETRY:   Blood Pressure: 88/56 mmHg  •  Heart Rate: 118 bpm (Compensatory Tachycardia)  •  Sol 120, 08:30 MET  •  Algorithmic Evidence Alignment: 94%", 10.0, C_WHITE, True, False, 0)
    ])

    # Left Column: Chronological Precursor Reconstruction
    draw_card(s4, 0.6, 2.30, 4.8, 4.60, fill_color=C_PANEL_DARK, border_color=C_SLATE_DARK, border_width=1.0)
    draw_textbox(s4, 0.8, 2.45, 4.4, 4.30, [
        ("CHRONOLOGICAL EVIDENCE REPLAY", 11.0, C_CYAN, True, False, 6),
        ("Step-by-step precursor trajectory leading to presyncope:", 9.0, C_SLATE, False, False, 8),

        ("• Sol 116 (T-96h): Operational Workload Extension", 9.5, C_WHITE, True, False, 2),
        ("  Duty shift extended to 10.5h during avionics overhaul; fatigue index rises.", 8.0, C_ICE, False, False, 6),

        ("• Sol 117 (T-72h): Nocturnal Alarm & Circadian Strain", 9.5, C_WHITE, True, False, 2),
        ("  False alarm at 02:14 MET disrupts deep sleep; total rest drops to 5.0h.", 8.0, C_ICE, False, False, 6),

        ("• Sol 118 (T-48h): Autonomic Drop & Ergometer Cut", 9.5, C_WHITE, True, False, 2),
        ("  HRV RMSSD drops 42 -> 31 ms; cycle workout abbreviated by 50% (145 W).", 8.0, C_ICE, False, False, 6),

        ("• Sol 119 (T-24h): Countermeasure Non-Compliance", 9.5, C_WHITE, True, False, 2),
        ("  Ergometer workout cancelled (0 W); fluid intake -400 mL; HRV collapses to 18 ms.", 8.0, C_ICE, False, False, 6),

        ("• Sol 120 (08:30 MET): Centrifuge Ingress Presyncope", 9.5, C_ROSE, True, False, 2),
        ("  Orthostatic collapse (88/56 mmHg, 118 bpm) during simulated gravity onset.", 8.0, C_ICE, False, False, 8),

        ("EPISTEMIC BOUNDARY NOTICE", 8.5, C_AMBER, True, False, 2),
        ("Fictional demonstration profile. MOSAIC-9 identifies multi-signal alignment; it does not claim clinical diagnostic proof or establish medical causation.", 7.5, C_SLATE, False, True, 0),
    ])

    # Right Column: Mission Evidence Graph & 6 Tiers
    draw_card(s4, 5.6, 2.30, 7.13, 4.60, fill_color=C_PANEL_DARK, border_color=C_CYAN, border_width=1.2)
    # Evidence Graph Screenshot
    draw_img(s4, os.path.join(SCREENSHOTS_DIR, '06_incident_reconstruction.png'), 5.8, 2.45, 6.73, 2.45, border_color=C_CYAN)
    
    # 6-Tier Taxonomy Panel below image
    draw_textbox(s4, 5.8, 5.05, 6.73, 1.70, [
        ("SIX-TIER EPISTEMIC EVIDENCE TAXONOMY (27 NODES, 33 EDGES)", 10.0, C_CYAN, True, False, 4),
        ("• Tier 1: Direct Observation (HR, BP, SpO2, HRV)  •  Tier 2: Mission Ledger Event (Shift extension, workout omission)", 8.0, C_WHITE, False, False, 2),
        ("• Tier 3: Derived Analytic Indicator (Cross-correlations, PVT)  •  Tier 4: NASA HRP Risk Portfolio (HRP-CV-OI, HRP-SLEEP-CIRC)", 8.0, C_ICE, False, False, 2),
        ("• Tier 5: NASA OSDR Molecular Studies (OSD-575 Inspiration4 serum, OSD-635 ISS HASMCs)", 8.0, C_SKY, False, False, 2),
        ("• Tier 6: Simulated Countermeasure Scenarios (Hypothetical deterministic recovery trajectories Alpha-Delta)", 8.0, C_AMBER, False, False, 0),
    ])

    draw_footer(s4, 4)
    pdf.showPage()

    # ==========================================================================
    # SLIDE 5 — EXPLORE OPERATIONAL TRADE-OFFS
    # ==========================================================================
    print("Building Slide 5: Countermeasure Sandbox & Trade-offs...")
    s5 = prs.slides.add_slide(blank_layout)
    pptx_bg(s5)
    pdf_bg()

    draw_header(s5,
        "DECISION SUPPORT  //  COUNTERMEASURE SCENARIO SANDBOX",
        "Explore Options. Preserve Human Judgment.",
        "Evaluate candidate recovery protocols across multi-objective trade-offs while respecting individual crew context and missing data."
    )

    # Left Column: 5-Scenario Comparison & Pareto Optimization
    draw_card(s5, 0.6, 1.6, 6.5, 5.15, fill_color=C_PANEL_DARK, border_color=C_CYAN, border_width=1.2)
    draw_img(s5, os.path.join(SCREENSHOTS_DIR, '07b_scenario_pareto.png'), 0.8, 1.75, 6.1, 2.30, border_color=C_CYAN)
    draw_textbox(s5, 0.8, 4.20, 6.1, 2.45, [
        ("FIVE-SCENARIO PARETO OPTIMIZATION MATRIX", 10.5, C_CYAN, True, False, 4),
        ("Evaluates candidate protocols across 3 primary maximized objectives:", 8.5, C_SLATE, False, False, 5),
        ("1. Recovery Trajectory  •  2. Operational Continuity  •  3. Exercise Preservation", 8.5, C_ICE, True, False, 6),
        ("• Scenario Alpha (Sleep + Fluid): 84.5% Recovery  |  Pareto Frontier (Max Stability)", 8.5, C_EMERALD, True, False, 2),
        ("• Scenario Bravo (Volume Resuscitation): 78.2% Recovery  |  Pareto Frontier (Duty Focus)", 8.5, C_WHITE, False, False, 2),
        ("• Scenario Charlie (Workload Redistribution): 70.2% Recovery  |  Pareto Frontier (Balanced)", 8.5, C_WHITE, False, False, 2),
        ("• Scenario Delta (Pharmacological & Compression): 62.8% Recovery  |  Pareto Frontier", 8.5, C_WHITE, False, False, 2),
        ("• Scenario Baseline (Unmodified Status Quo): 41.0% Recovery  |  Strictly Dominated", 8.5, C_ROSE, True, False, 0),
    ])

    # Right Column: Epistemic Safeguards & Crew Context
    draw_card(s5, 7.3, 1.6, 5.43, 5.15, fill_color=C_PANEL_DARK, border_color=C_SLATE_DARK, border_width=1.0)
    draw_textbox(s5, 7.55, 1.8, 4.93, 4.75, [
        ("EPISTEMIC SAFEGUARDS & CREW CONTEXT", 11.0, C_AMBER, True, False, 8),

        ("ELENA ROSTOVA: VISIBLE MISSING DATA", 10.0, C_WHITE, True, False, 2),
        ("• In Module C/D, a 24-hour biosensor dropout is explicitly displayed as MISSING/UNKNOWN data.", 8.5, C_ICE, False, False, 2),
        ("• Algorithmic confidence attenuates to 41% rather than hallucinating nominal biometrics.", 8.5, C_SLATE, False, False, 8),

        ("ONE-AT-A-TIME (OAT) SENSITIVITY ENGINE", 10.0, C_WHITE, True, False, 2),
        ("• Evaluates parameter perturbations (±10% to ±20% variations in sleep delta or fluid loading).", 8.5, C_ICE, False, False, 2),
        ("• Confirms solution robustness against microgravity fluid shift model uncertainty.", 8.5, C_SLATE, False, False, 8),

        ("HUMAN FLIGHT SURGEON AUTHORITY PANEL", 10.0, C_ROSE, True, False, 2),
        ("• Projections represent simplified deterministic approximations for schedule trade-offs.", 8.5, C_ICE, False, False, 2),
        ("• NOT guaranteed clinical prognostications or medical prescriptions.", 8.5, C_WHITE, True, False, 2),
        ("• Final countermeasure prescription remains exclusively with the human Flight Surgeon.", 8.5, C_EMERALD, True, False, 0),
    ])

    draw_footer(s5, 5)
    pdf.showPage()

    # ==========================================================================
    # SLIDE 6 — NASA RESEARCH AND SCIENTIFIC INTEGRITY
    # ==========================================================================
    print("Building Slide 6: NASA Research & Scientific Integrity...")
    s6 = prs.slides.add_slide(blank_layout)
    pptx_bg(s6)
    pdf_bg()

    draw_header(s6,
        "SCIENTIFIC RIGOR  //  OPEN SCIENCE DATA & HRP RISK MAPPINGS",
        "Grounded in Research. Honest About Uncertainty.",
        "Grounding deep-space event analysis in peer-reviewed NASA open science while maintaining strict epistemic boundaries."
    )

    col3_w = 3.91
    # Column 1: NASA OSDR Studies
    draw_card(s6, 0.6, 1.6, col3_w, 5.15, fill_color=C_PANEL_DARK, border_color=C_CYAN, border_width=1.0)
    draw_textbox(s6, 0.8, 1.8, col3_w - 0.4, 4.75, [
        ("NASA OPEN SCIENCE DATA REPOSITORY", 10.5, C_CYAN, True, False, 6),
        ("Verified studies integrated in Evidence Graph:", 8.5, C_SLATE, False, False, 8),

        ("• OSD-575 / LSDS-8 (SpaceX Inspiration4)", 9.5, C_WHITE, True, False, 2),
        ("  Dataset DOI: 10.26030/mc5d-p710", 8.0, C_SKY, False, False, 1),
        ("  Nature SOMA DOI: 10.1038/s41586-024-07639-y", 8.0, C_SLATE, False, False, 1),
        ("  Cohort: 4 civilian astronauts (L-92 to R+82)", 8.0, C_ICE, False, False, 1),
        ("  Assays: Blood serum CMP & cytokine arrays.", 8.0, C_ICE, False, False, 2),
        ("  DISCLOSURE: Discrete pre/post-flight serum; NOT continuous in-flight telemetry.", 7.5, C_AMBER, False, True, 8),

        ("• OSD-571 / GLDS-563 (Inspiration4 Plasma)", 9.5, C_WHITE, True, False, 2),
        ("  Dataset DOI: 10.26030/h3p5-tc29", 8.0, C_SKY, False, False, 1),
        ("  Plasma proteomics, metabolomics, cfDNA/RNA.", 8.0, C_ICE, False, False, 8),

        ("• OSD-635 / GLDS-608 (ISS Aortic Cells)", 9.5, C_WHITE, True, False, 2),
        ("  Dataset DOI: 10.26030/8n5a-q187", 8.0, C_SKY, False, False, 1),
        ("  In vitro human vascular smooth muscle culture.", 8.0, C_ICE, False, False, 2),
        ("  DISCLOSURE: In vitro RNA-seq; NOT live astronaut blood pressure.", 7.5, C_AMBER, False, True, 0),
    ])

    # Column 2: NASA HRP Risk Portfolios
    draw_card(s6, 4.71, 1.6, col3_w, 5.15, fill_color=C_PANEL_DARK, border_color=C_SKY, border_width=1.0)
    draw_textbox(s6, 4.91, 1.8, col3_w - 0.4, 4.75, [
        ("NASA HUMAN RESEARCH PROGRAM (HRP)", 10.5, C_SKY, True, False, 6),
        ("Evidence mapped to official NASA HRR records:", 8.5, C_SLATE, False, False, 8),

        ("• HRP-CV-OI: Cardiovascular Risk", 9.5, C_WHITE, True, False, 2),
        ("  Official NASA HRR Risk i=179", 8.0, C_CYAN, True, False, 1),
        ("  Documents microgravity hypovolemia, baroreflex blunting, and orthostatic presyncope.", 8.0, C_ICE, False, False, 8),

        ("• HRP-SLEEP-CIRC: Sleep & Workload", 9.5, C_WHITE, True, False, 2),
        ("  Official NASA HRR Risk i=100", 8.0, C_CYAN, True, False, 1),
        ("  Documents circadian desynchronization, PVT cognitive slowing, and autonomic strain.", 8.0, C_ICE, False, False, 8),

        ("• HRP-AERO-MUSC: Aerobic Conditioning", 9.5, C_WHITE, True, False, 2),
        ("  Vascular compliance & cycle ergometer benefits.", 8.0, C_ICE, False, False, 8),

        ("• HRP-ENV-CO2: Spacecraft CO2 Exposure", 9.5, C_WHITE, True, False, 2),
        ("  Marcus Vance incident (Day 118, 19:15 MET): 3.5 mmHg localized CO2, 6.0h sleep.", 8.0, C_ICE, False, False, 2),
        ("  DISCLOSURE: Synthetic scenario parameter, not a universal deterministic headache threshold.", 7.5, C_AMBER, False, True, 0),
    ])

    # Column 3: Prominent Scientific Integrity Panel
    draw_card(s6, 8.82, 1.6, col3_w, 5.15, fill_color=C_PANEL_DARK, border_color=C_AMBER, border_width=1.5)
    draw_textbox(s6, 9.02, 1.8, col3_w - 0.4, 4.75, [
        ("SCIENTIFIC INTEGRITY PANEL", 11.0, C_AMBER, True, False, 8),

        ("SYNTHETIC DEMONSTRATION DATA", 9.0, C_WHITE, True, False, 1),
        ("ARES-IV records are synthetic scenarios grounded in peer-reviewed aerospace medicine.", 8.0, C_SLATE, False, False, 6),

        ("EXPLORATORY CORRELATIONS", 9.0, C_WHITE, True, False, 1),
        ("Workload extension <-> ergometer non-compliance evaluated at exact empirical coefficient:", 8.0, C_SLATE, False, False, 2),
        ("r = -0.38,  n = 4,  df = 2", 11.0, C_CYAN, True, False, 2),
        ("Small-sample duty window; exploratory association, NOT proof of causal etiology.", 8.0, C_AMBER, False, True, 6),

        ("HEURISTIC CONFIDENCE", 9.0, C_WHITE, True, False, 1),
        ("0-100% scores reflect multi-sensor evidence alignment, NOT clinical probability.", 8.0, C_SLATE, False, False, 6),

        ("SCENARIO SIMULATIONS", 9.0, C_WHITE, True, False, 1),
        ("Model-based operational trade-offs, NOT clinical medical prescriptions.", 8.0, C_SLATE, False, False, 6),

        ("NO CLINICAL / FLIGHT CERTIFICATION", 9.0, C_ROSE, True, False, 1),
        ("Prototype decision support software; not FDA approved or DO-178C flight qualified.", 8.0, C_SLATE, False, False, 0),
    ])

    draw_footer(s6, 6)
    pdf.showPage()

    # ==========================================================================
    # SLIDE 7 — THE MISSION AHEAD
    # ==========================================================================
    print("Building Slide 7: The Mission Ahead...")
    s7 = prs.slides.add_slide(blank_layout)
    pptx_bg(s7)
    pdf_bg()

    draw_header(s7,
        "FUTURE HORIZONS  //  LUNAR & MARTIAN HUMAN EXPLORATION",
        "Every Signal Has a Story.",
        "Empowering human exploration beyond low Earth orbit through interpretable, traceable, and explainable mission-health intelligence."
    )

    # 5 Pillars in 5 Horizontal Cards
    card_w = 2.30
    gap = 0.157
    start_x = 0.6
    pillars = [
        ("1. EXPLAINABLE RECONSTRUCTION", "Transforms isolated vital-sign alarms into coherent, step-by-step chronological event genesis.", C_CYAN),
        ("2. EVIDENCE TRACEABILITY", "Enforces 6-tier epistemic provenance linking biosensors to published NASA scientific studies.", C_SKY),
        ("3. VISIBLE UNCERTAINTY", "Honest disclosure of sensor dropouts, small-sample bounds (df=2), and observational limits.", C_AMBER),
        ("4. SCENARIO EXPLORATION", "Multi-objective Pareto optimization providing actionable schedule alternatives during comms lag.", C_EMERALD),
        ("5. HUMAN-CENTERED SUPPORT", "Designed to augment and advise, preserving Flight Surgeon and Crew Medical Officer command.", C_PURPLE),
    ]

    for i, (p_title, p_desc, p_color) in enumerate(pillars):
        px = start_x + i * (card_w + gap)
        draw_card(s7, px, 1.6, card_w, 2.7, fill_color=C_PANEL_DARK, border_color=p_color, border_width=1.0)
        draw_textbox(s7, px + 0.12, 1.75, card_w - 0.24, 2.4, [
            (p_title, 9.5, p_color, True, False, 6),
            (p_desc, 8.5, C_ICE, False, False, 0),
        ])

    # Middle Banner: Technical Rigor & Verification Proof
    draw_card(s7, 0.6, 4.45, 12.13, 1.25, fill_color=C_PANEL_HIGHLIGHT, border_color=C_CYAN, border_width=1.0)
    draw_textbox(s7, 0.85, 4.58, 11.63, 1.0, [
        ("TECHNICAL RIGOR & VERIFICATION PROOF (100% PASS RATE ACROSS 53 TESTS)", 10.5, C_CYAN, True, False, 4),
        ("• Software Stack: React 18, TypeScript, Tailwind, ECharts  •  Laravel 11, SQLite WAL  •  Python FastAPI, SciPy, NumPy", 8.5, C_WHITE, False, False, 2),
        ("• Automated Testing: 15 Pytest (Scientific) + 21 PHPUnit (API & Parity) + 17 Vitest (Frontend UI) = 53 Passing in 1.67s", 8.5, C_EMERALD, True, False, 2),
        ("• Dual-Engine Parity: 100% identical outputs between Python & PHP engines across all 5 countermeasure scenarios", 8.5, C_ICE, False, False, 0),
    ])

    # Bottom Callout & Closing Statement
    draw_card(s7, 0.6, 5.85, 12.13, 1.05, fill_color=C_PANEL_DARK, border_color=C_AMBER, border_width=1.2)
    draw_textbox(s7, 0.85, 5.95, 11.63, 0.85, [
        ("TESSERA FLIGHT LAB  •  MOSAIC-9  •  NASA SPACE APPS CHALLENGE 2026", 9.5, C_AMBER, True, False, 3),
        ("Public Codebase & Evaluation Package: https://github.com/irfan-ibtech/MOSAIC-9", 8.5, C_SKY, False, False, 4),
        ("\"Because in deep space, understanding how an event unfolds can matter as much as knowing that it happened.\"", 10.5, C_WHITE, True, True, 0),
    ])

    draw_footer(s7, 7)
    pdf.showPage()

    # --------------------------------------------------------------------------
    # Save PPTX and PDF
    # --------------------------------------------------------------------------
    prs.save(PPTX_PATH)
    pdf.save()
    print(f"Presentation successfully saved:\n  PPTX: {PPTX_PATH}\n  PDF:  {PDF_PATH}")

    # --------------------------------------------------------------------------
    # Verify and Render Slides with PyMuPDF
    # --------------------------------------------------------------------------
    doc = pymupdf.open(PDF_PATH)
    page_count = len(doc)
    print(f"PDF Page Count: {page_count} pages (Expected: 7)")
    assert page_count == 7, f"Error: PDF page count is {page_count}, expected exactly 7!"

    renders_dir = os.path.join(BASE_DIR, 'slide_renders')
    os.makedirs(renders_dir, exist_ok=True)

    for i in range(page_count):
        page = doc[i]
        pix = page.get_pixmap(dpi=150)
        render_path = os.path.join(renders_dir, f"slide_{i+1:02d}.png")
        pix.save(render_path)
        print(f"Rendered slide {i+1} -> {render_path} ({pix.width}x{pix.height})")

    doc.close()
    print("All slides rendered and verified successfully!")

if __name__ == '__main__':
    generate_all()
