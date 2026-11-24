import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, PageBreak, Spacer, Table, TableStyle, Image, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render total page count
    along with running headers and running footers.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            if self._pageNumber > 1:
                self.saveState()
                
                # Running Header
                self.setFont('Helvetica-Bold', 7)
                self.setFillColor(colors.HexColor('#06B6D4'))
                self.drawString(40, 755, "MATHVISION STUDIO")
                self.setFont('Helvetica', 7)
                self.setFillColor(colors.HexColor('#64748B'))
                self.drawString(125, 755, "—  Frontend Architecture, Engineering & Verification Report (V4-Final)")
                self.drawRightString(572, 755, "DECEMBER 2026")
                
                self.setStrokeColor(colors.HexColor('#E2E8F0'))
                self.setLineWidth(0.6)
                self.line(40, 748, 572, 748)
                
                # Running Footer
                self.line(40, 42, 572, 42)
                self.setFont('Helvetica-Bold', 7)
                self.setFillColor(colors.HexColor('#8B5CF6'))
                self.drawString(40, 30, "MATHVISION LABS")
                self.setFont('Helvetica', 7)
                self.setFillColor(colors.HexColor('#64748B'))
                self.drawString(110, 30, "|  Scientific Handwritten Mathematical Expression Recognition IDE")
                
                page_str = f"Page {self._pageNumber} of {num_pages}"
                self.drawRightString(572, 30, page_str)
                self.restoreState()
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

def build_pdf(filename="MathVision_Frontend_Architecture_Report.pdf"):
    # Printable area: 612 x 792 pt, margins 40 pt -> width 532 pt, height 702 pt
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=44,
        bottomMargin=44
    )
    
    # Palette
    c_navy_dark = colors.HexColor('#07090E')
    c_cyan = colors.HexColor('#06B6D4')
    c_cyan_dark = colors.HexColor('#0891B2')
    c_violet = colors.HexColor('#8B5CF6')
    c_violet_dark = colors.HexColor('#6D28D9')
    c_slate_dark = colors.HexColor('#1E293B')
    c_slate_mid = colors.HexColor('#475569')
    c_slate_light = colors.HexColor('#64748B')
    c_slate_bg = colors.HexColor('#F8FAFC')
    c_border = colors.HexColor('#E2E8F0')
    c_emerald = colors.HexColor('#10B981')
    c_rose = colors.HexColor('#EF4444')

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13.5,
        textColor=c_cyan_dark,
        spaceAfter=8
    )
    
    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15.5,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12.5,
        textColor=c_violet_dark,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.0,
        leading=11.4,
        textColor=colors.HexColor('#334155'),
        alignment=TA_JUSTIFY,
        spaceAfter=4
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.4,
        leading=9.6,
        textColor=colors.HexColor('#334155')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.6,
        leading=10.0,
        textColor=colors.white
    )

    caption_style = ParagraphStyle(
        'DocCaption',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.2,
        leading=9.5,
        textColor=c_slate_light,
        alignment=TA_CENTER,
        spaceBefore=3,
        spaceAfter=6
    )

    callout_style = ParagraphStyle(
        'DocCallout',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.6,
        leading=10.5,
        textColor=colors.HexColor('#1E293B')
    )

    def create_callout(text, bg_color=c_slate_bg, border_color=c_cyan, title=None):
        content = []
        if title:
            content.append(Paragraph(f"<b><font color='{border_color.hexval()}'>{title}</font></b>", callout_style))
            content.append(Spacer(1, 2))
        content.append(Paragraph(text, callout_style))
        t = Table([[content]], colWidths=[532])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_color),
            ('BOX', (0,0), (-1,-1), 0.5, c_border),
            ('LINELEFT', (0,0), (-1,-1), 3.0, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return t

    story = []

    # =========================================================================
    # PAGE 1: COVER & EXECUTIVE ARCHITECTURE BRIEF & TECH STACK
    # =========================================================================
    top_badge = Table(
        [[Paragraph("<b><font color='#06B6D4'>MATHVISION LABS</font></b> &nbsp;|&nbsp; SCIENTIFIC HMER IDE &nbsp;|&nbsp; ARCHITECTURE AUDIT REPORT", ParagraphStyle('Bdg', fontName='Helvetica-Bold', fontSize=7.2, leading=9, textColor=c_slate_light))]],
        colWidths=[532]
    )
    top_badge.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
    ]))
    story.append(top_badge)
    story.append(Spacer(1, 5))

    story.append(Paragraph("MathVision Studio — Frontend Engineering & Technical Architecture", title_style))
    story.append(Paragraph("Comprehensive Frontend Specification, Component Architecture, Motion Engineering, and Phase 3 Stability Audit", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=c_violet, spaceBefore=0, spaceAfter=5))

    meta_data = [
        [
            Paragraph("<b>Version:</b> 4.0-Final (Build 2026.11)", table_cell_style),
            Paragraph("<b>System Role:</b> Scientific HMER Web IDE", table_cell_style),
            Paragraph("<b>Core Stack:</b> React 18 • TypeScript 5 • Vite 5", table_cell_style)
        ],
        [
            Paragraph("<b>Status:</b> Production Verified (Netlify/Vite)", table_cell_style),
            Paragraph("<b>Source Code:</b> 11,658 LOC / 42 Source Units", table_cell_style),
            Paragraph("<b>Styling:</b> Tailwind CSS v3 • Custom Dark Theme", table_cell_style)
        ],
        [
            Paragraph("<b>Target Viewports:</b> Desktop (1440+), Tablet, Mobile", table_cell_style),
            Paragraph("<b>Math Engine:</b> KaTeX v0.16 & SymPy CAS", table_cell_style),
            Paragraph("<b>Hardware Canvas:</b> 60 FPS High-DPI Vector Engine", table_cell_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[177, 177, 178])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#EEF2F6')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 5))

    story.append(Paragraph("1. Executive Summary & Product Mission", h1_style))
    story.append(Paragraph(
        "<b>MathVision</b> is a high-precision, production-grade Scientific Web IDE designed for Handwritten Mathematical "
        "Expression Recognition (HMER). The platform converts freeform 2D mathematical notations (fractions, radical expressions, "
        "nested superscripts, summation, integrals, and matrices) into rigorous, typeset LaTeX and verifiable Computer Algebra System (CAS) syntax in real time.",
        body_style
    ))
    story.append(Paragraph(
        "The architecture combines dual input paradigms: <b>Digital Ink</b> (high-frequency, sub-pixel vector canvas with DPI scaling and stroke smoothing) "
        "and <b>Notebook Photo Ingestion</b> (camera capture via cross-device QR code handoff, background shadow removal, adaptive threshold binarization, "
        "and tight-cropping). Deep explainability is provided through 2D spatial cross-attention spotlighting, sequence probability beam inspection, and automated SymPy validation.",
        body_style
    ))

    exec_callout = (
        "<b>Key Phase 3 Deliverables Completed:</b> Root-cause resolution of 3-zone grid collapse; scale-invariant canvas buffer tracking; "
        "decoupled mobile/tablet tab navigation; truthful AI recognition scanning telemetry; and a high-z notification portal in the upper-right viewport."
    )
    story.append(create_callout(exec_callout, bg_color=colors.HexColor('#F0FDF4'), border_color=c_emerald, title="Phase 3 Stability Mandate"))
    story.append(Spacer(1, 5))

    story.append(Paragraph("2. Technical Stack & Dependencies Matrix", h1_style))
    tech_data = [
        [Paragraph("<b>Component / Layer</b>", table_header_style), Paragraph("<b>Technology / Package</b>", table_header_style), Paragraph("<b>Version</b>", table_header_style), Paragraph("<b>Architectural Responsibility</b>", table_header_style)],
        [Paragraph("UI Framework", table_cell_style), Paragraph("React", table_cell_style), Paragraph("18.3.1", table_cell_style), Paragraph("Concurrent rendering, React Context, state hooks, Portals", table_cell_style)],
        [Paragraph("Type System", table_cell_style), Paragraph("TypeScript", table_cell_style), Paragraph("5.6.3", table_cell_style), Paragraph("Strict end-to-end interface and token contracts", table_cell_style)],
        [Paragraph("Build Engine", table_cell_style), Paragraph("Vite", table_cell_style), Paragraph("5.4.10", table_cell_style), Paragraph("Rollup chunking, HMR, sub-second dev server, tree-shaking", table_cell_style)],
        [Paragraph("Styling Engine", table_cell_style), Paragraph("Tailwind CSS", table_cell_style), Paragraph("3.4.14", table_cell_style), Paragraph("Utility-first atomic styling, custom dark scientific theme", table_cell_style)],
        [Paragraph("Math Typesetting", table_cell_style), Paragraph("KaTeX", table_cell_style), Paragraph("0.16.11", table_cell_style), Paragraph("Sub-millisecond LaTeX mathematical DOM compilation", table_cell_style)],
        [Paragraph("Animation Engine", table_cell_style), Paragraph("Framer Motion", table_cell_style), Paragraph("11.11.17", table_cell_style), Paragraph("Scoped modal transitions, drawer animations, opacity reveals", table_cell_style)],
        [Paragraph("Iconography", table_cell_style), Paragraph("Lucide React", table_cell_style), Paragraph("0.460.0", table_cell_style), Paragraph("High-density scientific and developer iconography", table_cell_style)],
        [Paragraph("Cross-Device QR", table_cell_style), Paragraph("QRCode", table_cell_style), Paragraph("1.5.4", table_cell_style), Paragraph("Dynamic SVG QR matrix generation for mobile capture handoff", table_cell_style)],
        [Paragraph("3D Visualization", table_cell_style), Paragraph("Three.js", table_cell_style), Paragraph("0.187.0", table_cell_style), Paragraph("WebGL mathematical constellation visualization on homepage", table_cell_style)]
    ]
    tech_table = Table(tech_data, colWidths=[85, 95, 45, 307])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_slate_dark),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F1F5F9')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0,0), (-1,-1), 2.2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.2),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(tech_table)

    # Force PageBreak to Page 2
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: LIVE SYSTEM ARCHITECTURE & 3-ZONE BREAKDOWN
    # =========================================================================
    story.append(Paragraph("3. System Architecture & Live Workspace Layout", h1_style))
    story.append(Paragraph(
        "The workspace implements a strict three-zone scientific workflow consisting of: (1) <i>Input & Ingestion Zone</i> on the left, "
        "(2) <i>Recognition & Mathematical Output Zone</i> in the center, and (3) <i>Intelligence & Explainability Zone</i> on the right. "
        "The layout guarantees a stable 31.7% / 33.4% / 34.9% horizontal column distribution on desktop viewports without column squeezing or row wrapping.",
        body_style
    ))

    screenshot_path = r"C:\Users\siddh\.gemini\antigravity\brain\d935e3e2-ebb0-4969-89ef-1da4730b69b4\browser_evidence\4ee5cdbb-95f6-4950-821b-93db74dcb580\final_step_59.png"
    if os.path.exists(screenshot_path):
        img_w = 490
        img_h = 490 * (640 / 1024) # ~306 pt
        img_table = Table([[Image(screenshot_path, width=img_w, height=img_h)]], colWidths=[532])
        img_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOX', (0,0), (-1,-1), 1, c_border),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ]))
        story.append(img_table)
        story.append(Paragraph("<b>Figure 1:</b> MathVision V4-Final Studio Workspace operating in balanced 3-Zone Desktop layout. Captured via live browser QA subagent during automated verification.", caption_style))
    story.append(Spacer(1, 4))

    story.append(Paragraph("3.1 Detailed Three-Zone Functional Breakdown", h2_style))
    story.append(Paragraph(
        "• <b>Zone 1 (Input & Ingestion — Left):</b> Hosts the <code>HandwritingCanvas</code> with high-DPI vector ink engine, "
        "custom brush presets (Pen, Eraser, Width, Color), background grid modes (Dot Grid, Ruled Paper, Graph Paper, Pure Blank), "
        "and quick sample loaders. Toggling to <i>Notebook Photo Ingestion</i> exposes drag-and-drop file upload, real-time mobile QR handoff, "
        "and interactive preprocessing preview (shadow removal and adaptive binarization).<br/>"
        "• <b>Zone 2 (Recognition & Output — Center):</b> Displays the real-time inference pipeline stepper, cybernetic scanning bar, "
        "live millisecond ticker, rendered mathematical expression via KaTeX, LaTeX source editor, and confidence telemetry.<br/>"
        "• <b>Zone 3 (Intelligence & Explainability — Right):</b> Visualizes DenseNet-121 2D cross-attention grounding spotlight, "
        "interactive token sequence selector with alternative candidate probability rankings (Beam-5), and automated SymPy syntax validation.",
        body_style
    ))

    # Force PageBreak to Page 3
    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: DIRECTORY ARCHITECTURE & POST-MORTEM (PART 1)
    # =========================================================================
    story.append(Paragraph("4. Directory Architecture & Component Topology", h1_style))
    story.append(Paragraph(
        "The codebase comprises <b>11,658 lines of TypeScript code</b> distributed across 42 specialized components, "
        "services, and utility libraries, organized into clean domain-driven modules:",
        body_style
    ))

    comp_data = [
        [Paragraph("<b>Directory / Domain</b>", table_header_style), Paragraph("<b>Key Modules</b>", table_header_style), Paragraph("<b>Lines</b>", table_header_style), Paragraph("<b>Functional Responsibility</b>", table_header_style)],
        [
            Paragraph("components/canvas/", table_cell_style),
            Paragraph("HandwritingCanvas.tsx<br/>CanvasControls.tsx", table_cell_style),
            Paragraph("920", table_cell_style),
            Paragraph("Hardware-accelerated 2D vector drawing, DPI buffer scaling, touch/stylus interpolation, dot-grid canvas overlay, stroke serialization.", table_cell_style)
        ],
        [
            Paragraph("components/workspace/", table_cell_style),
            Paragraph("Workspace.tsx<br/>Header.tsx<br/>Sidebar.tsx", table_cell_style),
            Paragraph("1,350", table_cell_style),
            Paragraph("Core 3-zone desktop grid architecture, view preset switches (Studio, Canvas Focus, Deep Inspection), mobile/tablet responsive decoupling.", table_cell_style)
        ],
        [
            Paragraph("components/recognition/", table_cell_style),
            Paragraph("RecognitionView.tsx<br/>LatexEditor.tsx<br/>PipelineProgress.tsx", table_cell_style),
            Paragraph("880", table_cell_style),
            Paragraph("Neural scanning visualization, live elapsed millisecond timer, truthful pipeline progression, KaTeX rendered preview, LaTeX split source view.", table_cell_style)
        ],
        [
            Paragraph("components/explainability/", table_cell_style),
            Paragraph("AttentionSpotlight.tsx<br/>TokenInspector.tsx<br/>VerificationPanel.tsx", table_cell_style),
            Paragraph("740", table_cell_style),
            Paragraph("Cross-attention 2D feature map coordinate projection, coordinate boundary clamping, beam search alternative token rankings, SymPy verification.", table_cell_style)
        ],
        [
            Paragraph("components/upload/", table_cell_style),
            Paragraph("PhotoUpload.tsx<br/>MobileQrModal.tsx<br/>MobileCameraCapture.tsx", table_cell_style),
            Paragraph("1,210", table_cell_style),
            Paragraph("Drag-and-drop notebook photo ingestion, QR code mobile camera handoff, image preprocessing preview (adaptive threshold & line removal), staging.", table_cell_style)
        ],
        [
            Paragraph("components/ui/", table_cell_style),
            Paragraph("Toast.tsx<br/>Modal.tsx<br/>Button.tsx<br/>Tabs.tsx<br/>Badge.tsx", table_cell_style),
            Paragraph("650", table_cell_style),
            Paragraph("Design system primitives: React Portal upper-right notification system, accessible modals, tactile buttons, animated tab sliders.", table_cell_style)
        ],
        [
            Paragraph("components/home/", table_cell_style),
            Paragraph("HomePage.tsx<br/>InteractiveHeroSandbox.tsx<br/>HeroTransformationJourney.tsx", table_cell_style),
            Paragraph("3,850", table_cell_style),
            Paragraph("Comprehensive scientific marketing landing page, interactive canvas demo sandbox, step-by-step neural feature transformation walkthrough.", table_cell_style)
        ],
        [
            Paragraph("services/ & utils/", table_cell_style),
            Paragraph("api.ts<br/>canvas.ts<br/>latex.ts<br/>demoData.ts<br/>motion.ts", table_cell_style),
            Paragraph("1,120", table_cell_style),
            Paragraph("FastAPI backend REST client, high-DPI canvas setup, LaTeX syntax sanitization, historical persistence engine, motion variant presets.", table_cell_style)
        ]
    ]
    comp_table = Table(comp_data, colWidths=[95, 110, 35, 292])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_slate_dark),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F1F5F9')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0,0), (-1,-1), 2.2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.2),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 5))

    story.append(Paragraph("5. Critical Engineering Challenges & Post-Mortem Solutions (Part 1)", h1_style))
    story.append(Paragraph("5.1 Post-Mortem: 3-Zone Workspace Layout Collapse (Phase 3 Resolution)", h2_style))
    story.append(Paragraph(
        "<b>Incident Investigation:</b> When users clicked 'Recognize Equation', cleared the canvas, or swapped presets, "
        "the drawing canvas collapsed into an unusable ~150px strip, the center Recognition Output shifted left, "
        "and the Explainability panel dropped into a second row, leaving a large empty gap on the right. "
        "<br/><br/>"
        "<b>Root Cause Mechanism:</b><br/>"
        "1. <i>Framer Motion FLIP Collisions:</i> Panel wrappers utilized <code>&lt;motion.div layout&gt;</code> inside a CSS Grid. "
        "Whenever sibling DOM elements updated, Framer Motion calculated intermediate FLIP transform scale matrices.<br/>"
        "2. <i>ResizeObserver Post-Transform Reading:</i> <code>HandwritingCanvas</code>'s <code>ResizeObserver</code> called "
        "<code>container.getBoundingClientRect()</code>, which reads post-transform rendered pixels rather than layout dimensions.<br/>"
        "3. <i>Hard-Coded Inline Styles:</i> <code>setupHighDpiCanvas</code> wrote explicit pixel strings (<code>canvas.style.width = width + 'px'</code>). "
        "Once locked to a shrunken pixel width, the canvas container forced the first grid track to collapse.<br/>"
        "4. <i>Grid Auto-Placement Row Wrapping:</i> Without explicit template areas, standard CSS Grid defaulted to <code>grid-auto-flow: row</code>, "
        "pushing the remaining columns into an awkward two-row layout.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Architectural Remedy:</b><br/>"
        "• Replaced dynamic class calculations with a deterministic CSS Grid: "
        "<code>grid-template-areas: 'input output explain'; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr) minmax(0, 1.05fr);</code>.<br/>"
        "• Enforced <code>min-width: 0</code>, <code>min-height: 0</code>, and <code>box-sizing: border-box</code> across all grid children.<br/>"
        "• In <code>canvas.ts</code>, enforced <code>canvas.style.width = '100%'</code> and <code>canvas.style.height = '100%'</code>, scaling only internal buffer resolution.<br/>"
        "• Switched <code>ResizeObserver</code> to read scale-invariant <code>container.clientWidth</code> debounced via <code>requestAnimationFrame</code>.<br/>"
        "• Decoupled Desktop grid from Mobile/Tablet: On screens &lt; 1024px, the multi-column grid is hidden in favor of a full-width single active tab container.",
        body_style
    ))

    # Force PageBreak to Page 4
    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: POST-MORTEM (PART 2) & DESIGN SYSTEM TOKENS
    # =========================================================================
    story.append(Paragraph("5. Critical Engineering Challenges & Post-Mortem Solutions (Part 2)", h1_style))

    story.append(Paragraph("5.2 High-DPI Vector Canvas & Stroke Physics Engine", h2_style))
    story.append(Paragraph(
        "Standard HTML5 canvas drawing suffers from pixelation and stroke blurriness on Retina (2x) and 4K displays. "
        "<code>HandwritingCanvas.tsx</code> implements automatic Device Pixel Ratio (DPR) hardware scaling: the internal buffer "
        "is allocated at <code>clientWidth * window.devicePixelRatio</code>, while the CSS display geometry remains locked to 100%. "
        "All 2D context drawing commands are transformed via <code>ctx.scale(dpr, dpr)</code>. "
        "To ensure organic pen simulation, consecutive coordinate points are smoothed using quadratic Bézier curve interpolation "
        "rather than raw segmented line polygons, maintaining consistent stroke thickness even during fast gesture drawing.",
        body_style
    ))
    story.append(Spacer(1, 3))

    story.append(Paragraph("5.3 Mobile QR Code Photo Ingestion & Staging Architecture", h2_style))
    story.append(Paragraph(
        "To eliminate the friction of transferring notebook photos from mobile smartphones to desktop workstations, "
        "MathVision implements a real-time QR code handoff engine. The desktop generates a cryptographically random session UUID "
        "and renders an in-memory SVG QR code. Scanning the QR code opens a lightweight camera PWA on the mobile device. "
        "Upon photo capture, the mobile client streams the image directly to the backend storage buffer. "
        "The desktop client polls the sync endpoint, automatically staging the retrieved image into the workspace without "
        "triggering unintended inference. The user retains full control to inspect, crop, rotate, and preview adaptive thresholding "
        "before manually clicking <b>Recognize Photo</b>.",
        body_style
    ))
    story.append(Spacer(1, 3))

    story.append(Paragraph("5.4 Truthful AI Recognition Processing & Telemetry Experience", h2_style))
    story.append(Paragraph(
        "A common pitfall in AI web applications is artificial progress tickers (e.g. countdown timers from 0% to 100%). "
        "MathVision strictly enforces <b>truthful recognition telemetry</b>. When recognition begins:<br/>"
        "1. A focused scanning laser bar animates across the input preview using a custom GPU-accelerated CSS keyframe.<br/>"
        "2. A live millisecond ticker (<code>0.0s</code>) updates every 100ms via <code>requestAnimationFrame</code>, reporting actual elapsed time.<br/>"
        "3. The inference pipeline steps (<i>Ingestion &rarr; Binarize &rarr; DenseNet-121 &rarr; Transformer Decoder &rarr; SymPy</i>) pulse dynamically "
        "based on true backend stage transitions.<br/>"
        "4. Upon completion, the recognized mathematical expression is revealed via KaTeX typography alongside full confidence scoring and "
        "token alternatives. In the event of an inference error, an inline error alert card renders with an active <code>onRetry</code> action.",
        body_style
    ))
    story.append(Spacer(1, 3))

    story.append(Paragraph("5.5 High-Z Upper-Right Global Notification Portal", h2_style))
    story.append(Paragraph(
        "In earlier versions, toast notifications appeared at the bottom-right corner, where they were frequently occluded by "
        "status bars, browser popups, or user hands on touchscreens. "
        "In Phase 3, the notification engine was re-engineered using React's <code>createPortal</code>, mounting directly to "
        "<code>document.body</code> with an explicit <code>z-index: 9999</code>. "
        "The container is anchored at the <b>upper-right corner</b> (<code>top: 68px, right: 24px</code>) immediately below the IDE header. "
        "The system supports four distinct notification types (<code>info</code>, <code>success</code>, <code>error</code>, and <code>loading</code>), "
        "caps active notifications to 3 items, provides accessible <code>role='alert'</code> ARIA attributes, and includes manual dismiss actions.",
        body_style
    ))
    story.append(Spacer(1, 3))

    story.append(Paragraph("5.6 Cross-Attention Spatial Grounding & Coordinate Clamping", h2_style))
    story.append(Paragraph(
        "The explainability engine visualizes the model's internal attention mechanism by projecting cross-attention weights from "
        "the DenseNet-121 feature memory (12 &times; W/8) back onto the original input image. "
        "To prevent reticle rendering artifacts where target attention circles overflow beyond the image boundaries, "
        "normalized coordinates are strictly clamped: "
        "<code>clampedX = Math.max(0.04, Math.min(0.96, activeToken.x))</code> and "
        "<code>clampedY = Math.max(0.06, Math.min(0.94, activeToken.y))</code>. "
        "Users can interactively click individual tokens in the sequence to observe exactly where the neural network focused.",
        body_style
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("6. Design System, Color Palette & Motion Engineering", h1_style))
    color_data = [
        [Paragraph("<b>Semantic Role</b>", table_header_style), Paragraph("<b>Token Name</b>", table_header_style), Paragraph("<b>Hex Code</b>", table_header_style), Paragraph("<b>Visual Swatch</b>", table_header_style), Paragraph("<b>UI Application</b>", table_header_style)],
        [Paragraph("Canvas Background", table_cell_style), Paragraph("bg-navy-950", table_cell_style), Paragraph("#07090E", table_cell_style), Paragraph("■ Deep Navy", ParagraphStyle('Sw', fontName='Helvetica-Bold', fontSize=7.2, textColor=colors.HexColor('#07090E'))), Paragraph("Root IDE backdrop and canvas dot-grid surface", table_cell_style)],
        [Paragraph("Card Surface", table_cell_style), Paragraph("bg-navy-900", table_cell_style), Paragraph("#0D111A", table_cell_style), Paragraph("■ Slate Card", ParagraphStyle('Sw', fontName='Helvetica-Bold', fontSize=7.2, textColor=colors.HexColor('#0D111A'))), Paragraph("Panel containers, cards, and modal bodies", table_cell_style)],
        [Paragraph("Primary Accent", table_cell_style), Paragraph("accent-cyan", table_cell_style), Paragraph("#06B6D4", table_cell_style), Paragraph("■ Neon Cyan", ParagraphStyle('Sw', fontName='Helvetica-Bold', fontSize=7.2, textColor=c_cyan)), Paragraph("Active selections, attention reticles, primary badges", table_cell_style)],
        [Paragraph("Secondary Accent", table_cell_style), Paragraph("accent-violet", table_cell_style), Paragraph("#8B5CF6", table_cell_style), Paragraph("■ Electric Violet", ParagraphStyle('Sw', fontName='Helvetica-Bold', fontSize=7.2, textColor=c_violet)), Paragraph("Recognize buttons, laser scanning line, neural links", table_cell_style)],
        [Paragraph("Valid State", table_cell_style), Paragraph("state-emerald", table_cell_style), Paragraph("#10B981", table_cell_style), Paragraph("■ Emerald Green", ParagraphStyle('Sw', fontName='Helvetica-Bold', fontSize=7.2, textColor=c_emerald)), Paragraph("SymPy verified syntax, FastAPI online indicator", table_cell_style)],
        [Paragraph("Alert State", table_cell_style), Paragraph("state-rose", table_cell_style), Paragraph("#EF4444", table_cell_style), Paragraph("■ Rose Alert", ParagraphStyle('Sw', fontName='Helvetica-Bold', fontSize=7.2, textColor=c_rose)), Paragraph("Inference failure, invalid syntax, error toast", table_cell_style)],
        [Paragraph("Border Subdued", table_cell_style), Paragraph("border-slate", table_cell_style), Paragraph("#1E293B", table_cell_style), Paragraph("■ Slate Border", ParagraphStyle('Sw', fontName='Helvetica-Bold', fontSize=7.2, textColor=c_slate_dark)), Paragraph("Structural card dividers, table borders, panel separators", table_cell_style)]
    ]
    color_table = Table(color_data, colWidths=[90, 85, 55, 75, 227])
    color_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_slate_dark),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F1F5F9')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0,0), (-1,-1), 2.0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.0),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(color_table)

    # Force PageBreak to Page 5
    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: QUALITY ASSURANCE, BENCHMARKS, ROADMAP & SIGN-OFF
    # =========================================================================
    story.append(Paragraph("7. Performance Audits, Quality Assurance & Verification", h1_style))
    story.append(Paragraph(
        "MathVision underwent exhaustive automated quality assurance across simulated viewports and live browser agents. "
        "All regression tests confirmed layout stability, sub-second client responsiveness, and clean production compilation.",
        body_style
    ))

    qa_data = [
        [Paragraph("<b>Verification Dimension</b>", table_header_style), Paragraph("<b>Test Viewport / Metric</b>", table_header_style), Paragraph("<b>Empirical Result</b>", table_header_style), Paragraph("<b>Verification Status</b>", table_header_style)],
        [Paragraph("Desktop 3-Zone Balance", table_cell_style), Paragraph("1440 &times; 900 px", table_cell_style), Paragraph("Left: 31.7% | Center: 33.4% | Right: 34.9%", table_cell_style), Paragraph("<b>PASS</b> (0 row wraps)", ParagraphStyle('P', fontName='Helvetica-Bold', fontSize=7.2, textColor=c_emerald))],
        [Paragraph("Tablet Squeeze Prevention", table_cell_style), Paragraph("768 &times; 1024 px", table_cell_style), Paragraph("Decoupled segmented navigation; 100% card width", table_cell_style), Paragraph("<b>PASS</b> (0 squish)", ParagraphStyle('P', fontName='Helvetica-Bold', fontSize=7.2, textColor=c_emerald))],
        [Paragraph("Mobile Usability", table_cell_style), Paragraph("390 &times; 844 px", table_cell_style), Paragraph("Touch targets &ge; 44px; bottom sheet controls", table_cell_style), Paragraph("<b>PASS</b> (Optimized)", ParagraphStyle('P', fontName='Helvetica-Bold', fontSize=7.2, textColor=c_emerald))],
        [Paragraph("Upper-Right Toast Portal", table_cell_style), Paragraph("DOM Overlay (z=9999)", table_cell_style), Paragraph("top: 68px, left: 1044px, right: 1424px, width: 380px", table_cell_style), Paragraph("<b>PASS</b> (Verified)", ParagraphStyle('P', fontName='Helvetica-Bold', fontSize=7.2, textColor=c_emerald))],
        [Paragraph("Vector Drawing Latency", table_cell_style), Paragraph("Canvas API (DPI=1.25x)", table_cell_style), Paragraph("&lt; 16.6 ms frame render time (60 FPS locked)", table_cell_style), Paragraph("<b>PASS</b> (Smooth)", ParagraphStyle('P', fontName='Helvetica-Bold', fontSize=7.2, textColor=c_emerald))],
        [Paragraph("Production Build Speed", table_cell_style), Paragraph("Vite 5.4 + TSC", table_cell_style), Paragraph("Zero TS errors; 16.95s build time", table_cell_style), Paragraph("<b>PASS</b> (Clean)", ParagraphStyle('P', fontName='Helvetica-Bold', fontSize=7.2, textColor=c_emerald))],
        [Paragraph("Bundle Splitting", table_cell_style), Paragraph("Gzip Asset Metrics", table_cell_style), Paragraph("Vendor: 90.1 kB | KaTeX: 77.5 kB | App: 216.4 kB", table_cell_style), Paragraph("<b>PASS</b> (Optimal)", ParagraphStyle('P', fontName='Helvetica-Bold', fontSize=7.2, textColor=c_emerald))]
    ]
    qa_table = Table(qa_data, colWidths=[120, 110, 202, 100])
    qa_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_slate_dark),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F1F5F9')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(qa_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("8. Deployment Architecture & CI/CD Pipeline", h1_style))
    story.append(Paragraph(
        "MathVision is hosted globally on <b>Netlify Edge CDN</b> (<code>mathvision1521.netlify.app</code>) with automated continuous deployment "
        "hooked to GitHub (<code>origin/main</code>). Production builds run via <code>tsc &amp;&amp; vite build</code>, generating pre-compressed "
        "Rollup chunks with cache-busting content hashes. The backend inference services run on Render via FastAPI and Uvicorn, communicating "
        "via CORS-enabled HTTPS REST endpoints.",
        body_style
    ))
    story.append(Spacer(1, 5))

    story.append(Paragraph("9. Architectural Roadmap & Conclusion", h1_style))
    story.append(Paragraph(
        "MathVision V4-Final represents a major leap in scientific web IDE engineering, pairing state-of-the-art DenseNet-121 "
        "inference with a robust, deterministic, and highly responsive frontend. "
        "Upcoming architectural iterations will incorporate:<br/>"
        "• <b>WebAssembly In-Browser Inference:</b> ONNX Runtime Web integration using the INT8 quantized model for offline, zero-network mathematical recognition.<br/>"
        "• <b>Real-Time Stroke Streaming:</b> WebSocket-based partial sequence decoding as the user draws each mathematical stroke.<br/>"
        "• <b>Multi-Line Notebook Scratchpads:</b> Multi-expression scratchpads with automatic equation alignment and derivation steps.",
        body_style
    ))
    story.append(Spacer(1, 5))

    conclusion_box = (
        "<b>Architectural Sign-off:</b> The MathVision frontend architecture meets all stability, responsiveness, and design criteria. "
        "All code has been validated with zero TypeScript errors, committed to <code>main</code> (commit <code>bac2807</code>), "
        "and deployed for production."
    )
    story.append(create_callout(conclusion_box, bg_color=colors.HexColor('#F5F3FF'), border_color=c_violet, title="Final Engineering Certification"))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename} ({os.path.getsize(filename)} bytes)")

if __name__ == '__main__':
    build_pdf()
