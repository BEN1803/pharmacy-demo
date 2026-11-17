"""
Generates the MediFlow SaaS Backend Roadmap PDF.

Run:
    python generate_backend_roadmap.py

Output:
    MediFlow_SaaS_Backend_Roadmap.pdf
"""

from fpdf import FPDF

# ---------------------------------------------------------------------------
# Design tokens
# ---------------------------------------------------------------------------

PAGE_W = 210
PAGE_H = 297
L = 16
R = 16
USABLE = PAGE_W - L - R  # 178 mm

NAVY = (15, 23, 42)
NAVY_2 = (30, 41, 59)
INK = (30, 41, 59)
INK_SOFT = (51, 65, 85)
MUTED = (100, 116, 139)
BORDER = (226, 232, 240)
WHITE = (255, 255, 255)

VIOLET = (109, 40, 217)
VIOLET_2 = (139, 92, 246)
VIOLET_TINT = (245, 243, 255)

TEAL = (13, 148, 136)
TEAL_TINT = (240, 253, 250)

GREEN = (5, 150, 105)
GREEN_TINT = (236, 253, 245)

AMBER = (217, 119, 6)
AMBER_TINT = (255, 251, 235)

RED = (220, 38, 38)
RED_TINT = (254, 242, 242)

BLUE = (37, 99, 235)
BLUE_TINT = (239, 246, 255)

SLATE_TINT = (248, 250, 252)

DOC_TITLE = "MediFlow SaaS Backend Roadmap"
DOC_VERSION = "1.0"
DOC_DATE = "November 2026"


# ---------------------------------------------------------------------------
# PDF class and reusable layout helpers
# ---------------------------------------------------------------------------


class RoadmapPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_margins(L, 20, R)
        self.set_auto_page_break(auto=True, margin=18)
        self.alias_nb_pages()
        self.current_section = ""
        self.set_title(DOC_TITLE)
        self.set_author("MediFlow Product & Engineering")
        self.set_subject("Java Spring Boot + PostgreSQL backend roadmap for a pharmacy SaaS")
        self.set_keywords(
            "MediFlow, pharmacy, SaaS, Spring Boot, PostgreSQL, Redis, subscriptions, payments, roadmap"
        )
        self.set_creator("MediFlow")

    # -- page frame ---------------------------------------------------------

    def header(self):
        if self.page_no() == 1:
            return
        self.set_y(8)
        self.set_font("Helvetica", "", 7.3)
        self.set_text_color(*MUTED)
        self.cell(120, 4, "MediFlow  |  SaaS Backend Roadmap", align="L")
        self.cell(58, 4, "v" + DOC_VERSION + "  |  " + DOC_DATE, align="R")
        self.set_draw_color(*BORDER)
        self.set_line_width(0.2)
        self.line(L, 13, PAGE_W - R, 13)
        self.set_y(18)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-12)
        self.set_font("Helvetica", "", 7.2)
        self.set_text_color(*MUTED)
        self.cell(110, 4, "Confidential  |  Planning document  |  v" + DOC_VERSION, align="L")
        self.cell(68, 4, "Page " + str(self.page_no()) + " of {nb}", align="R")

    # -- low-level helpers --------------------------------------------------

    def ensure(self, height):
        """Start a new page if fewer than *height* mm remain."""
        if self.get_y() + height > self.page_break_trigger:
            self.add_page()

    def set_body_font(self, size=9.2, style=""):
        self.set_font("Helvetica", style, size)
        self.set_text_color(*INK)

    def body(self, text, size=9.2, line_h=4.7, color=INK, bold=False, italic=False, space=2.2):
        style = "B" if bold else ("I" if italic else "")
        self.set_font("Helvetica", style, size)
        self.set_text_color(*color)
        self.set_x(L)
        self.multi_cell(USABLE, line_h, text, new_x="LMARGIN", new_y="NEXT", align="L")
        self.ln(space)

    def small(self, text, color=MUTED, size=8, space=1.5):
        self.set_font("Helvetica", "", size)
        self.set_text_color(*color)
        self.set_x(L)
        self.multi_cell(USABLE, 4.1, text, new_x="LMARGIN", new_y="NEXT", align="L")
        self.ln(space)

    def bullet(self, text, level=0, size=9.0, color=INK_SOFT, space=0.9):
        indent = 4.5 + level * 4.0
        width = USABLE - indent
        self.set_font("Helvetica", "", size)
        self.set_text_color(*color)
        lines = self.multi_cell(width, 4.6, text, dry_run=True, output="LINES", align="L")
        self.ensure(len(lines) * 4.6 + 1.5)
        y = self.get_y()
        self.set_fill_color(*VIOLET_2)
        self.rect(L + indent - 3.2, y + 1.75, 1.15, 1.15, style="F")
        self.set_xy(L + indent, y)
        self.multi_cell(width, 4.6, text, new_x="LMARGIN", new_y="NEXT", align="L")
        self.ln(space)

    def bullet_list(self, items, level=0, size=9.0):
        for item in items:
            self.bullet(item, level=level, size=size)

    def numbered(self, number, text, size=9.0, color=INK_SOFT):
        indent = 7.0
        width = USABLE - indent
        self.set_font("Helvetica", "", size)
        self.set_text_color(*color)
        lines = self.multi_cell(width, 4.6, text, dry_run=True, output="LINES", align="L")
        self.ensure(len(lines) * 4.6 + 1.5)
        y = self.get_y()
        self.set_font("Helvetica", "B", size)
        self.set_text_color(*VIOLET)
        self.set_xy(L, y)
        self.cell(6.5, 4.6, str(number) + ".", align="R")
        self.set_font("Helvetica", "", size)
        self.set_text_color(*color)
        self.set_xy(L + indent, y)
        self.multi_cell(width, 4.6, text, new_x="LMARGIN", new_y="NEXT", align="L")
        self.ln(1.0)

    # -- headings ----------------------------------------------------------

    def h1(self, number, title):
        self.ensure(38)
        self.start_section(str(number) + ". " + title, 0)
        self.current_section = str(number) + ". " + title
        self.set_fill_color(*VIOLET)
        y = self.get_y()
        self.rect(L, y + 1.2, 2.8, 8.4, style="F")
        self.set_font("Helvetica", "B", 15.5)
        self.set_text_color(*NAVY)
        self.set_xy(L + 6, y)
        self.cell(USABLE - 6, 11, str(number) + ". " + title)
        self.ln(13)
        self.set_draw_color(*BORDER)
        self.set_line_width(0.35)
        self.line(L, self.get_y(), PAGE_W - R, self.get_y())
        self.ln(4)

    def h2(self, title):
        self.ensure(24)
        self.start_section(title, 1)
        self.set_font("Helvetica", "B", 10.8)
        self.set_text_color(*VIOLET)
        self.set_x(L)
        self.multi_cell(USABLE, 5.3, title, new_x="LMARGIN", new_y="NEXT", align="L")
        self.ln(2.2)

    def h3(self, title):
        self.ensure(18)
        self.set_font("Helvetica", "B", 9.4)
        self.set_text_color(*NAVY)
        self.set_x(L)
        self.multi_cell(USABLE, 4.6, title, new_x="LMARGIN", new_y="NEXT", align="L")
        self.ln(1.8)

    # -- callout -----------------------------------------------------------

    def callout(self, title, text, tone="violet"):
        palette = {
            "violet": (VIOLET_TINT, VIOLET),
            "teal": (TEAL_TINT, TEAL),
            "green": (GREEN_TINT, GREEN),
            "amber": (AMBER_TINT, AMBER),
            "red": (RED_TINT, RED),
            "blue": (BLUE_TINT, BLUE),
            "slate": (SLATE_TINT, MUTED),
        }
        fill, accent = palette.get(tone, palette["violet"])
        inner_w = USABLE - 11
        self.set_font("Helvetica", "", 8.6)
        lines = self.multi_cell(inner_w, 4.2, text, dry_run=True, output="LINES", align="L")
        height = 7.0 + len(lines) * 4.2 + 2.0
        self.ensure(height + 4)
        x = L
        y = self.get_y()
        self.set_fill_color(*fill)
        self.rect(x, y, USABLE, height, style="F", round_corners=True, corner_radius=2)
        self.set_fill_color(*accent)
        self.rect(x, y, 2.0, height, style="F")
        self.set_font("Helvetica", "B", 8.8)
        self.set_text_color(*accent)
        self.set_xy(x + 5.5, y + 3.0)
        self.cell(inner_w, 4.2, title)
        self.set_font("Helvetica", "", 8.6)
        self.set_text_color(*INK_SOFT)
        self.set_xy(x + 5.5, y + 8.2)
        self.multi_cell(inner_w, 4.2, text, new_x="LMARGIN", new_y="NEXT", align="L")
        self.set_y(y + height + 4.0)

    # -- tables ------------------------------------------------------------

    def table(
        self,
        headers,
        rows,
        widths,
        aligns=None,
        font_size=7.5,
        header_size=7.4,
        line_h=3.55,
        pad=1.2,
        min_row_h=6.0,
        header_fill=NAVY,
        zebra=True,
    ):
        if aligns is None:
            aligns = ["L"] * len(headers)
        total = sum(widths)
        if abs(total - USABLE) > 0.6:
            widths = [w * USABLE / total for w in widths]

        def draw_header():
            y = self.get_y()
            self.set_fill_color(*header_fill)
            self.set_draw_color(*header_fill)
            self.set_text_color(*WHITE)
            self.set_font("Helvetica", "B", header_size)
            x = L
            for w, label, align in zip(widths, headers, aligns):
                self.rect(x, y, w, 6.8, style="DF")
                self.set_xy(x + pad, y + 1.55)
                self.cell(w - 2 * pad, 3.8, str(label), align=align)
                x += w
            self.set_y(y + 6.8)

        self.ensure(15)
        draw_header()

        for idx, row in enumerate(rows):
            line_sets = []
            for w, value in zip(widths, row):
                self.set_font("Helvetica", "", font_size)
                lines = self.multi_cell(
                    w - 2 * pad, line_h, str(value), dry_run=True, output="LINES"
                ) or [""]
                line_sets.append(lines)
            row_h = max(min_row_h, max(len(x) for x in line_sets) * line_h + 1.7)

            if self.get_y() + row_h > self.page_break_trigger - 1:
                self.add_page()
                draw_header()

            y = self.get_y()
            if zebra and idx % 2 == 1:
                self.set_fill_color(248, 250, 252)
            else:
                self.set_fill_color(255, 255, 255)
            self.set_draw_color(*BORDER)
            x = L
            for w, lines, align in zip(widths, line_sets, aligns):
                self.rect(x, y, w, row_h, style="DF")
                self.set_text_color(*INK)
                self.set_font("Helvetica", "", font_size)
                ty = y + 1.15
                for line in lines:
                    self.set_xy(x + pad, ty)
                    self.cell(w - 2 * pad, line_h, line, align=align)
                    ty += line_h
                x += w
            self.set_y(y + row_h)

        self.ln(3.2)

    def code_block(self, code, title=None, size=7.0, line_h=3.45):
        lines = code.replace("\t", "  ").split("\n")
        usable_h = self.page_break_trigger - self.t_margin - 10
        per_page = max(8, int(usable_h / line_h))
        chunks = [lines[i : i + per_page] for i in range(0, len(lines), per_page)]
        for ci, chunk in enumerate(chunks):
            height = len(chunk) * line_h + 4.5 + (5.0 if title and ci == 0 else 0)
            self.ensure(height + 3)
            x, y = L, self.get_y()
            self.set_fill_color(248, 250, 252)
            self.set_draw_color(*BORDER)
            self.rect(x, y, USABLE, height, style="DF", round_corners=True, corner_radius=1.8)
            yy = y + 2.0
            if title and ci == 0:
                self.set_font("Helvetica", "B", 7.0)
                self.set_text_color(*MUTED)
                self.set_xy(x + 3, yy)
                self.cell(USABLE - 6, 3.6, title.upper())
                yy += 4.6
            self.set_font("Courier", "", size)
            self.set_text_color(*INK)
            for line in chunk:
                self.set_xy(x + 3, yy)
                self.cell(USABLE - 6, line_h, line)
                yy += line_h
            self.set_y(y + height + 3.0)

    def divider(self, space_before=2.0, space_after=3.0):
        self.ln(space_before)
        self.set_draw_color(*BORDER)
        self.set_line_width(0.25)
        self.line(L, self.get_y(), PAGE_W - R, self.get_y())
        self.ln(space_after)

    # -- cover -------------------------------------------------------------

    def cover_page(self):
        self.add_page()
        self.set_auto_page_break(False)
        self.set_fill_color(8, 11, 26)
        self.rect(0, 0, PAGE_W, PAGE_H, style="F")

        # decorative geometry
        self.set_fill_color(17, 24, 48)
        self.ellipse(132, -62, 132, 132, style="F")
        self.set_fill_color(14, 20, 42)
        self.ellipse(-48, 196, 120, 120, style="F")
        self.set_fill_color(109, 40, 217)
        self.rect(16, 22, 3.2, 116, style="F")

        self.set_text_color(167, 139, 250)
        self.set_font("Helvetica", "B", 8.5)
        self.set_xy(25, 24)
        self.cell(150, 5, "PRODUCT & ENGINEERING ROADMAP")

        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 40)
        self.set_xy(24, 42)
        self.cell(160, 18, "MediFlow")

        self.set_font("Helvetica", "B", 24)
        self.set_text_color(196, 181, 253)
        self.set_xy(25, 65)
        self.cell(160, 12, "SaaS Backend")

        self.set_text_color(*WHITE)
        self.set_xy(25, 79)
        self.cell(160, 12, "Roadmap & Architecture")

        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(203, 213, 225)
        self.set_xy(25, 98)
        self.multi_cell(
            150,
            5.4,
            "A production blueprint for a multi-tenant pharmacy retail and wholesale platform: "
            "subscriptions, payments, inventory, marketplace, analytics and platform administration.",
            align="L",
        )

        self.set_draw_color(71, 85, 105)
        self.set_line_width(0.3)
        self.line(25, 128, 185, 128)

        self.set_font("Helvetica", "B", 8.2)
        self.set_text_color(167, 139, 250)
        self.set_xy(25, 134)
        self.cell(50, 4, "TECHNOLOGY")
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "", 8.2)
        self.set_xy(25, 140)
        self.cell(
            160,
            4,
            "Java 21 LTS  |  Spring Boot 3.5  |  PostgreSQL 16  |  Redis 7  |  Flyway  |  Docker",
        )

        # plan cards
        cards = [
            ("RETAIL BASIC", "30,000", "1 pharmacy", "1 employee", "No marketplace"),
            ("RETAIL PRO", "45,000", "2 pharmacies", "3 staff each", "Analytics + market"),
            ("RETAIL SCALE", "60,000", "Unlimited", "Unlimited", "All features"),
        ]
        x_positions = [18, 78, 138]
        for (label, price, a, b, c), x in zip(cards, x_positions):
            self.set_fill_color(15, 22, 43)
            self.set_draw_color(51, 65, 85)
            self.rect(x, 164, 54, 62, style="DF", round_corners=True, corner_radius=2.5)
            self.set_fill_color(139, 92, 246)
            self.rect(x, 164, 54, 1.4, style="F")
            self.set_font("Helvetica", "B", 7.0)
            self.set_text_color(167, 139, 250)
            self.set_xy(x + 4, 170)
            self.cell(46, 4, label)
            self.set_font("Helvetica", "B", 14)
            self.set_text_color(*WHITE)
            self.set_xy(x + 4, 177)
            self.cell(46, 7, price)
            self.set_font("Helvetica", "", 6.5)
            self.set_text_color(148, 163, 184)
            self.set_xy(x + 4, 184)
            self.cell(46, 3.5, "TZS per month")
            self.set_draw_color(51, 65, 85)
            self.line(x + 4, 192, x + 50, 192)
            self.set_font("Helvetica", "", 6.8)
            self.set_text_color(203, 213, 225)
            for i, line in enumerate([a, b, c]):
                self.set_xy(x + 4, 197 + i * 6.5)
                self.cell(46, 4, "-  " + line)

        self.set_font("Helvetica", "", 7.5)
        self.set_text_color(148, 163, 184)
        self.set_xy(16, 282)
        self.cell(90, 4, "Version " + DOC_VERSION + "  |  " + DOC_DATE)
        self.set_xy(100, 282)
        self.cell(94, 4, "Confidential  |  Prepared for MediFlow", align="R")
        self.set_auto_page_break(True, margin=18)

    # -- front matter -------------------------------------------------------

    def document_control(self):
        self.add_page()
        self.current_section = "Document control"

        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*NAVY)
        self.set_xy(L, 24)
        self.cell(USABLE, 10, "Document control")

        self.set_font("Helvetica", "", 9.0)
        self.set_text_color(*INK_SOFT)
        self.set_xy(L, 37)
        self.multi_cell(
            USABLE,
            4.7,
            "This roadmap converts the existing MediFlow Next.js demo into a production SaaS backend. "
            "It is written to be executed: each phase has deliverables, exit criteria and a clear "
            "mapping back to the demo screens.",
            align="L",
        )

        self.ln(3)
        self.table(
            ["Field", "Value"],
            [
                ["Document", "MediFlow SaaS Backend Roadmap & Architecture"],
                ["Version / status", DOC_VERSION + "  |  Approved for planning"],
                ["Date", DOC_DATE],
                ["Owner", "MediFlow Product & Engineering"],
                ["Audience", "Founders, backend engineers, frontend engineers, DevOps, QA"],
                ["Backend stack", "Java 21, Spring Boot 3.5.x, PostgreSQL 16, Redis 7, Flyway"],
                ["Frontend", "Existing Next.js 16 / React 19 demo, migrated from localStorage to REST"],
                ["Classification", "Confidential - internal and investor use"],
            ],
            widths=[38, 140],
            font_size=8.2,
        )

        self.h3("How to use this document")
        self.bullet_list(
            [
                "Sections 1-4 define the product: actors, plans, entitlements and commercial rules.",
                "Sections 5-17 define the engineering: architecture, database, APIs, security, caching, payments, jobs, observability, testing and delivery.",
                "Section 18 is the file and package structure to create on day one.",
                "Sections 19-23 are the execution plan, risks, launch checklist, new feature backlog and appendices.",
            ],
            size=8.8,
        )

        self.h3("Scope")
        self.body(
            "In scope: retail pharmacy operations, wholesale distribution, marketplace, subscription billing, "
            "third-party payments, employee management, analytics, notifications, super-admin operations, "
            "security, audit and deployment. Out of scope for v1: native mobile apps, telemedicine, "
            "full accounting ledger, and custom ERP connectors (all are designed for, but not built).",
            size=8.8,
        )

        self.callout(
            "Eight decisions that shape the backend",
            "1) Start as a modular monolith, not microservices.  2) Shared PostgreSQL schema with tenant_id plus row-level security.  "
            "3) Two tenant types: RETAIL and WHOLESALE, one global identity.  4) Plans are data, not code: plan + price + feature + limit tables.  "
            "5) Subscription changes are prorated and audited.  6) Payments are provider-agnostic ports and adapters, with Snippe as adapter one.  "
            "7) Stock is an immutable movement ledger; batches are consumed FEFO.  8) Every write that can be retried carries an idempotency key.",
            tone="violet",
        )

        self.set_font("Helvetica", "B", 8.6)
        self.set_text_color(*NAVY)
        self.set_x(L)
        self.cell(USABLE, 5, "Estimated delivery")
        self.ln(6)
        self.table(
            ["Scenario", "Team", "Duration", "Chargeable MVP"],
            [
                ["Recommended", "2 backend, 1 frontend, 0.5 QA, 0.5 DevOps", "24 weeks", "Week 11 (retail)"],
                ["Lean", "1 backend, 1 frontend, part-time QA", "32-36 weeks", "Week 16 (retail)"],
                ["Solo founder-developer", "1 full-stack", "40-44 weeks", "Week 20 (retail)"],
            ],
            widths=[38, 78, 30, 32],
            font_size=7.8,
        )

        self.small(
            "Estimates assume the demo is the design reference, a managed PostgreSQL/Redis environment, "
            "and no custom enterprise integrations in v1. Re-estimate after the discovery sprint.",
        )

    def contents(self):
        self.add_page()
        self.insert_toc_placeholder(render_toc, pages=3)


# ---------------------------------------------------------------------------
# Table of contents renderer
# ---------------------------------------------------------------------------


def render_toc(pdf, outline):
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(*NAVY)
    pdf.set_xy(L, 26)
    pdf.cell(USABLE, 10, "Contents")
    pdf.set_draw_color(*VIOLET)
    pdf.set_line_width(0.8)
    pdf.line(L, 38, L + 22, 38)

    pdf.set_font("Helvetica", "", 8.4)
    pdf.set_text_color(*MUTED)
    pdf.set_xy(L, 42)
    pdf.cell(USABLE, 4, "Sections, engineering decisions and delivery phases")

    y = 52
    for sec in outline:
        if sec.level > 1:
            continue
        indent = 0 if sec.level == 0 else 7
        name = sec.name
        size = 9.0 if sec.level == 0 else 8.2
        pdf.set_font("Helvetica", "B" if sec.level == 0 else "", size)
        max_name = USABLE - indent - 14
        while pdf.get_string_width(name) > max_name and len(name) > 4:
            name = name[:-2] + "..."

        if y > 272:
            pdf.add_page()
            y = 22

        pdf.set_text_color(*(NAVY if sec.level == 0 else INK_SOFT))
        pdf.set_xy(L + indent, y)
        pdf.cell(max_name, 5.0, name)

        dots_x = L + indent + max_name
        dots_w = USABLE - indent - max_name - 10
        pdf.set_font("Helvetica", "", 7.0)
        pdf.set_text_color(*BORDER)
        dot_count = max(0, int(dots_w / pdf.get_string_width(".")))
        pdf.set_xy(dots_x, y + 0.6)
        pdf.cell(dots_w, 4, "." * dot_count)

        pdf.set_font("Helvetica", "B" if sec.level == 0 else "", 8.2)
        pdf.set_text_color(*(NAVY if sec.level == 0 else MUTED))
        pdf.set_xy(PAGE_W - R - 10, y)
        pdf.cell(10, 5.0, str(sec.page_number), align="R")

        y += 5.0


# ---------------------------------------------------------------------------
# Section 1 - Executive summary
# ---------------------------------------------------------------------------


def section_1(pdf):
    pdf.h1(1, "Executive summary")

    pdf.body(
        "MediFlow is a multi-tenant SaaS for pharmacy retail and wholesale operations in Tanzania. "
        "The existing Next.js demo already demonstrates the workflows that matter: batch-level inventory, "
        "point-of-sale with FEFO stock deduction, purchase orders and goods receiving, a supplier "
        "marketplace, employee records, order fulfilment, analytics and settings. What it does not yet have "
        "is the system behind those screens: authentication, tenant isolation, durable data, billing, "
        "payments, audit and platform administration.",
    )
    pdf.body(
        "This roadmap defines that system. The backend is a Java 21 / Spring Boot 3.5 modular monolith backed "
        "by PostgreSQL 16 and Redis 7. It is deliberately not a microservice fleet on day one. Each business "
        "capability is a package with a clean boundary, so billing, marketplace or analytics can be extracted "
        "later when load or team size justifies it.",
    )

    pdf.h2("1.1 Product goals")
    pdf.table(
        ["Goal", "What success looks like"],
        [
            [
                "Demo parity",
                "Every demo screen reads and writes real data through versioned REST APIs, with no localStorage in production.",
            ],
            [
                "SaaS monetisation",
                "Retail and wholesale plans enforce limits and features at the API, not only in the UI.",
            ],
            [
                "Tenant safety",
                "A user can never read or mutate another tenant's data, even with a guessed identifier.",
            ],
            [
                "Payment flexibility",
                "Snippe can be used first, then another provider can be added without changing billing logic.",
            ],
            [
                "Operational confidence",
                "Every critical action is audited; every payment and stock movement is traceable and idempotent.",
            ],
            [
                "Scale-ready",
                "Stateless API instances, read replicas, Redis caching and a path to partitioning the largest ledgers.",
            ],
        ],
        widths=[35, 143],
        font_size=8.0,
    )

    pdf.h2("1.2 What ships in v1")
    pdf.bullet_list(
        [
            "Retail workspace: pharmacies, employees, inventory, batches, POS, sales history, returns, customers, orders, suppliers, purchase orders, goods receiving, marketplace purchasing, analytics and settings.",
            "Wholesale workspace: warehouse inventory, product listings, price lists, marketplace orders, fulfilment, customers, invoices and receivables.",
            "Platform control plane: tenant provisioning, plan catalogue, subscriptions, invoices, payments, dunning, refunds, reconciliation, supplier verification, feature flags, platform metrics and audited impersonation.",
            "Shared services: identity, invitations, RBAC, audit, notifications, file storage, imports/exports, scheduled reports and observability.",
        ],
        size=8.9,
    )

    pdf.h2("1.3 Non-negotiable engineering principles")
    pdf.table(
        ["Principle", "Practical rule"],
        [
            ["Tenant-safe by default", "Every business row carries tenant_id. TenantContext is set from the JWT. Repositories are scoped. RLS is enabled as a second line of defence. Cross-tenant access returns 404."],
            ["API-first", "The Next.js app, a future mobile app and Enterprise API clients consume the same versioned REST API and OpenAPI contract."],
            ["Money is integer", "Store amount in the smallest currency unit as BIGINT. TZS has exponent 0, so TZS 30,000 is stored as 30000."],
            ["Ledger, not mutation", "Stock changes are append-only movements. Batch quantities are a projection that can be rebuilt and reconciled."],
            ["Idempotent by design", "Sales, payments, marketplace orders and webhooks accept an idempotency key and return the original result on retry."],
            ["Least privilege", "Roles map to granular authorities. The frontend hides controls, but the backend is the source of truth."],
            ["Observable", "Every request has a correlation ID; every critical flow has metrics, traces and an alert."],
        ],
        widths=[38, 140],
        font_size=7.8,
    )

    pdf.h2("1.4 Delivery shape")
    pdf.body(
        "The plan is 24 weeks with two backend engineers, one frontend engineer and part-time QA/DevOps. "
        "The first chargeable retail MVP is available at week 11. Wholesale and marketplace are ready for "
        "pilot at week 16. Production hardening and launch complete at week 24. A solo developer should "
        "expect 40-44 weeks; the phase order and exit criteria remain the same.",
    )

    pdf.callout(
        "The one-sentence architecture",
        "A stateless Spring Boot API behind a managed PostgreSQL database, with Redis for cache, rate limits, locks and sessions, "
        "a provider-agnostic payment layer, and a modular package structure that can be split into services only when measurement demands it.",
        tone="teal",
    )


# ---------------------------------------------------------------------------
# Section 2 - Demo audit
# ---------------------------------------------------------------------------


def section_2(pdf):
    pdf.h1(2, "Current demo audit and backend mapping")

    pdf.body(
        "The demo is a client-side prototype. Screens render from static data or from localStorage, and a few "
        "workflows already implement real domain rules in the browser. The backend must preserve those rules, "
        "move them to a trusted tier, and add the SaaS control plane that the demo does not attempt.",
    )

    pdf.h2("2.1 What exists today")
    pdf.table(
        ["Demo area", "Current implementation", "What the backend must provide", "Phase"],
        [
            ["Dashboard", "Static KPIs, charts, stock alerts and recent transactions.", "Aggregated dashboard endpoint, date-range filters, cached summaries, tenant scoping.", "8"],
            ["Inventory", "Medicine list with batches, expiry, low-stock and stock value; add/edit medicine.", "Product master, per-pharmacy inventory item, batch records, stock ledger, reorder rules, valuation.", "3"],
            ["Medicine details", "Batch table, stock status, expiry status, edit medicine.", "Batch APIs, stock adjustment with reason, movement history, expiry alerts.", "3"],
            ["Sales (POS)", "Cart, search, category filter, discount, payment method, FEFO deduction, completed sale.", "Transactional checkout, line pricing, discounts, tax, payment capture, receipt, idempotency.", "4"],
            ["Sales history", "Search, payment filter, date filter, CSV export, printable receipt.", "Paginated sales query, receipt PDF, export job, return/void rules.", "4"],
            ["Orders", "Customer orders, channels, payment labels, status transitions, delivery address.", "Order intake, status history, fulfilment, customer records, notifications.", "4"],
            ["Marketplace", "Supplier product cards, MOQ, cart, purchase request submission.", "Listings, price tiers, supplier verification, marketplace orders split by supplier, RFQ.", "6"],
            ["Suppliers", "Supplier directory CRUD with contact, location, products and active status.", "Supplier master, licence tracking, performance, marketplace supplier profile.", "5"],
            ["Purchases", "Draft, ordered, partially received and received purchase orders; receive stock into batches.", "Purchase order lifecycle, approvals, goods receipts, batch creation, supplier returns.", "5"],
            ["Employees", "Profiles, job roles, shifts, status, sales and performance.", "Memberships, employee profiles, seat limits, shifts, attendance, performance facts.", "7"],
            ["Analytics", "KPI cards, monthly performance, category mix, payment mix, hourly sales, top products, insights.", "Daily facts, materialised views, range queries, export, plan gating.", "8"],
            ["Settings", "Pharmacy profile, notification toggles, preferences, data export and reset.", "Tenant and pharmacy settings, preference storage, export job, retention controls.", "7"],
            ["Global UI", "Theme, sidebar, topbar, notifications and profile menu.", "Session, tenant switch, notification inbox, unread count, user preferences.", "1"],
        ],
        widths=[23, 57, 86, 12],
        font_size=7.0,
        header_size=7.0,
        line_h=3.3,
        pad=1.0,
    )

    pdf.h2("2.2 What is missing")
    pdf.bullet_list(
        [
            "No identity provider, login, password reset, email verification, MFA or session management.",
            "No tenant model, no server-side authorisation and no protection against cross-tenant access.",
            "No durable database, no concurrency control, no transactions and no recovery from a browser reset.",
            "No plans, subscriptions, entitlements, invoices, payments, webhooks, dunning or refunds.",
            "No wholesale workspace, even though the marketplace implies suppliers and wholesale orders.",
            "No super-admin console for tenant, subscription, payment, supplier and platform monitoring.",
            "No audit trail, no file storage, no notifications, no scheduled jobs and no observability.",
            "No regulatory controls for licence expiry, controlled medicines, prescription records or data subject requests.",
        ],
        size=8.9,
    )

    pdf.h2("2.3 Migration principle")
    pdf.callout(
        "Replace the storage, keep the experience",
        "Do not rewrite the UI first. Introduce an API client and React Query, move one vertical slice at a time "
        "(auth -> inventory -> sales -> purchasing -> marketplace -> analytics), and keep the demo screens as the "
        "acceptance tests. The frontend should never talk to PostgreSQL or contain business rules that the backend "
        "must enforce.",
        tone="amber",
    )


# ---------------------------------------------------------------------------
# Section 3 - Actors and domain model
# ---------------------------------------------------------------------------


def section_3(pdf):
    pdf.h1(3, "Actors, tenancy and access model")

    pdf.h2("3.1 Three tenancy shapes")
    pdf.body(
        "The platform has one identity system and two customer tenant types. A tenant is a billing and data-isolation "
        "boundary. A user is a global identity. A membership connects a user to a tenant with a role. This allows one "
        "person to own a retail chain and a wholesale business without duplicating accounts.",
    )
    pdf.table(
        ["Tenant type", "Represents", "Owns", "Created by"],
        [
            ["PLATFORM", "MediFlow operations", "Plan catalogue, all tenant metadata, platform audit, provider configuration.", "Seed / super admin"],
            ["RETAIL", "A pharmacy business or chain", "1..N pharmacies, inventory, sales, employees, purchase orders, marketplace buying, analytics.", "Self-service signup or super admin"],
            ["WHOLESALE", "A supplier or distributor", "1..N warehouses, listings, price lists, wholesale orders, invoices, receivables.", "Application + supplier verification"],
        ],
        widths=[25, 42, 88, 23],
        font_size=7.7,
    )
    pdf.small(
        "A retail tenant cannot be converted into a wholesale tenant. If a business needs both, it creates a second tenant. "
        "The same user can be a member of both and switch the active tenant without logging out.",
    )

    pdf.h2("3.2 Actors and responsibilities")
    pdf.table(
        ["Actor", "Scope", "Typical permissions", "Plan notes"],
        [
            ["Platform Super Admin", "Whole platform", "Tenant lifecycle, subscriptions, payments, refunds, supplier verification, feature flags, impersonation, platform metrics, audit.", "Platform staff only; MFA mandatory."],
            ["Platform Finance / Support", "Whole platform, read-mostly", "View invoices and payments, reconcile, respond to tickets, no destructive tenant actions unless elevated.", "Optional split role; recommended at scale."],
            ["Retail Owner", "Retail tenant", "Billing, pharmacies, employees, all retail features, exports.", "Owner seat is free and does not count toward employee limits."],
            ["Retail Manager", "Assigned pharmacies", "Operations, inventory, sales, purchasing, reports; no billing or tenant deletion.", "One per pharmacy or chain."],
            ["Pharmacist", "Assigned pharmacy", "Dispense, prescriptions, sales, returns, stock view, expiry checks.", "Job role inside employee membership."],
            ["Cashier", "Assigned pharmacy", "POS sales, receipts, customer lookup; no inventory cost or purchasing view.", "Job role with narrow authorities."],
            ["Inventory Officer", "Assigned pharmacy", "Receiving, adjustments, transfers, stock counts, expiry write-offs.", "Sensitive actions audited."],
            ["Wholesale Owner", "Wholesale tenant", "Billing, warehouses, listings, price lists, orders, staff, analytics, API keys.", "Supplier verification required before listings go live."],
            ["Wholesale Manager", "Assigned warehouses", "Listings, order acceptance, fulfilment, invoices, customers, price lists.", "No billing changes."],
            ["Wholesale Staff", "Assigned warehouses", "Pick, pack, dispatch, stock view.", "No pricing or credit controls."],
        ],
        widths=[30, 34, 84, 30],
        font_size=7.2,
        header_size=7.2,
        line_h=3.3,
    )

    pdf.h2("3.3 Authorisation model")
    pdf.body(
        "Authorisation is permission-based, not role-string-based. A role is a named bundle of authorities such as "
        "inventory:read, inventory:write, sales:write, billing:manage and marketplace:buy. The JWT carries the active "
        "membership and a permissions version; the server resolves the effective permission set and caches it per "
        "membership. Revoking a permission increments the version, which invalidates cached decisions immediately.",
    )
    pdf.code_block(
        """// Authorities are fine-grained and stable. Roles can change without code changes.
inventory:read       inventory:write      inventory:adjust
sales:read           sales:write          sales:refund
procurement:read     procurement:write    procurement:approve
marketplace:buy      marketplace:sell     marketplace:verify
analytics:view       analytics:export
employees:read       employees:write      employees:invite
billing:read         billing:manage       billing:refund
tenant:manage        tenant:impersonate   platform:admin

// Examples
@PreAuthorize("hasAuthority('sales:write')")
@RequiresFeature(Feature.MARKETPLACE_BUY)
@RequiresWithinLimit(LimitKey.PHARMACIES)
@Audited(action = "SALE_COMPLETED", entity = "sale")""",
        title="Permission vocabulary",
    )

    pdf.h2("3.4 Tenant context and request identity")
    pdf.bullet_list(
        [
            "Login returns an access token bound to one active membership: sub, tenant_id, membership_id, role, permissions_version.",
            "POST /auth/switch-tenant validates membership and issues a new access/refresh pair. The old pair is revoked.",
            "A TenantContextFilter loads the tenant, checks status (ACTIVE, SUSPENDED, READ_ONLY) and places TenantContext in the request scope.",
            "Service methods call TenantGuard.require(pharmacyId) or requireWarehouse(warehouseId); the guard checks ownership and returns 404 on mismatch.",
            "Repositories use a tenant-scoped specification or Hibernate @TenantId. PostgreSQL RLS is the final backstop.",
            "Super-admin requests use a separate filter chain and platform authorities, never a tenant JWT with a wildcard.",
        ],
        size=8.8,
    )

    pdf.h2("3.5 Domain boundaries")
    pdf.table(
        ["Module", "Aggregates / responsibility", "Depends on"],
        [
            ["identity", "User, credential, refresh token, MFA, password reset, session.", "common"],
            ["tenant", "Tenant, membership, invitation, tenant settings.", "identity"],
            ["plan", "Plan, plan price, feature, limit, entitlement resolution.", "tenant"],
            ["subscription", "Subscription, trial, plan change, cancellation, dunning, add-ons.", "plan, billing"],
            ["billing", "Invoice, invoice line, payment, refund, ledger, webhook event, reconciliation.", "subscription, payment"],
            ["payment", "Provider-agnostic gateway port, adapters, webhook normalisation.", "billing"],
            ["pharmacy", "Pharmacy, operating hours, licence, pharmacy settings.", "tenant"],
            ["catalog", "Global product master, category, manufacturer, barcode, unit.", "common"],
            ["inventory", "Inventory item, batch, stock movement, transfer, stock count, reorder rule.", "catalog, pharmacy"],
            ["sales", "Sale, sale item, payment, customer, return, prescription, receipt.", "inventory, workforce"],
            ["procurement", "Supplier, purchase order, approval, goods receipt, supplier return.", "inventory, catalog"],
            ["marketplace", "Listing, price tier, marketplace order, sub-order, RFQ, review, commission.", "catalog, procurement, wholesale"],
            ["wholesale", "Warehouse, wholesale inventory, price list, sales order, invoice, receivable.", "catalog, tenant"],
            ["workforce", "Employee profile, job role, shift, attendance, performance snapshot.", "tenant, pharmacy"],
            ["analytics", "Daily facts, materialised views, dashboard queries, reports, exports.", "sales, inventory, workforce, marketplace"],
            ["notification", "In-app, email, SMS and WhatsApp messages; preferences; templates.", "tenant, identity"],
            ["storage", "File metadata, upload policy, virus scan, signed URLs.", "tenant"],
            ["admin", "Platform overview, tenant lifecycle, impersonation, feature flags, verification.", "all, read-only where possible"],
        ],
        widths=[27, 112, 39],
        font_size=7.3,
        header_size=7.2,
        line_h=3.35,
    )


# ---------------------------------------------------------------------------
# Section 4 - Plans and entitlements
# ---------------------------------------------------------------------------


def section_4(pdf):
    pdf.h1(4, "SaaS plans, limits and entitlements")

    pdf.body(
        "Pricing is per tenant, per month, in Tanzanian shillings. The plan defines a set of features and a set of "
        "limits. Limits are intentionally expressed in business units (pharmacies, employees, listings, warehouses), "
        "not in infrastructure units (CPU, rows, requests), so they are easy to explain and enforce. The owner seat "
        "is always free; employee seats are counted separately.",
    )

    pdf.h2("4.1 Retail plans")
    pdf.table(
        ["Capability", "Basic - TZS 30,000", "Professional - TZS 45,000", "Enterprise - TZS 60,000"],
        [
            ["Pharmacies", "1", "2", "Unlimited"],
            ["Employee seats", "1 (owner excluded)", "3 per pharmacy (6 total)", "Unlimited"],
            ["POS, sales and receipts", "Yes", "Yes", "Yes"],
            ["Inventory, batches, expiry alerts", "Yes", "Yes", "Yes"],
            ["Basic dashboard", "Yes", "Yes", "Yes"],
            ["Analytics module", "No", "Yes", "Yes + advanced"],
            ["Supplier directory", "No", "Yes", "Yes"],
            ["Purchase orders", "No - manual adjustments", "Yes", "Yes"],
            ["Marketplace buying", "No", "Yes", "Yes"],
            ["Stock transfers", "No", "Yes", "Yes"],
            ["Multi-pharmacy consolidation", "No", "Yes", "Yes"],
            ["Custom roles and permissions", "No", "No", "Yes"],
            ["API access and webhooks", "No", "No", "Yes"],
            ["Data export", "CSV", "CSV + PDF", "All formats"],
            ["Audit retention", "30 days", "12 months", "36 months"],
            ["Storage", "1 GB", "10 GB", "50 GB"],
            ["Support", "Email, 48h", "Priority email, 24h", "Priority + onboarding"],
        ],
        widths=[50, 41, 44, 43],
        font_size=7.2,
        header_size=7.0,
        line_h=3.35,
        pad=1.1,
    )
    pdf.small(
        "TZS is the ISO code for Tanzanian shillings. Prices exclude VAT where VAT applies. "
        "Enterprise 'unlimited' is still governed by fair-use and storage limits; see section 4.7.",
    )

    pdf.h2("4.2 Suggested wholesale plans")
    pdf.body(
        "Wholesale has different economics: fewer tenants, higher order values, more integration and support work. "
        "The proposal below limits warehouses, listings and staff, not order volume, because throttling orders would "
        "punish the supplier for succeeding. A marketplace commission aligns platform revenue with GMV.",
    )
    pdf.table(
        ["Capability", "Starter - TZS 50,000", "Growth - TZS 90,000", "Enterprise - TZS 160,000"],
        [
            ["Warehouses", "1", "3", "Unlimited"],
            ["Staff seats", "5", "20", "Unlimited"],
            ["Active listings", "250", "2,000", "Unlimited"],
            ["Storefront and order management", "Yes", "Yes", "Yes"],
            ["Bulk CSV / Excel import", "No", "Yes", "Yes"],
            ["Price lists and customer pricing", "No", "Yes", "Yes"],
            ["Credit terms and receivables", "No", "Yes", "Yes"],
            ["Analytics", "Basic", "Full", "Full + custom reports"],
            ["Promoted listings", "No", "5 per month", "Unlimited"],
            ["API access", "No", "Read-only", "Full REST + webhooks"],
            ["EDI / ERP integration", "No", "No", "Yes"],
            ["Marketplace commission", "3.0% of GMV", "2.5% of GMV", "1.5% or negotiated"],
            ["Support", "Email, 48h", "Priority, 24h", "Dedicated + 99.9% SLA"],
            ["Onboarding", "Self-serve", "Guided", "White-glove"],
        ],
        widths=[50, 41, 44, 43],
        font_size=7.2,
        header_size=7.0,
        line_h=3.35,
        pad=1.1,
    )
    pdf.callout(
        "Treat wholesale pricing as a hypothesis, not a fact",
        "Interview 5-10 suppliers before launch. The limits above are deliberately generous at the entry point and "
        "tighten support and integration costs at the top. Keep commission separate from subscription in invoices so "
        "the supplier can see exactly what they pay for. If a supplier refuses commission, offer a higher flat plan "
        "instead of removing the marketplace fee for everyone.",
        tone="amber",
    )

    pdf.h2("4.3 How plans are modelled")
    pdf.body(
        "Plans are rows, not conditional code. A plan has a code, an audience (RETAIL or WHOLESALE), a version and a "
        "price. Features and limits are child rows. This means the super admin can add a feature, change a price or "
        "introduce a promotional plan without a deployment, while existing subscriptions keep the price they signed up for.",
    )
    pdf.table(
        ["Table", "Purpose", "Key rule"],
        [
            ["plans", "Catalogue of plans and audience.", "code unique per audience; never delete, archive instead."],
            ["plan_prices", "Price history in TZS per billing interval.", "new price row; subscriptions reference a price id."],
            ["plan_features", "Feature switches and configuration.", "feature_key + enabled + JSON config."],
            ["plan_limits", "Numeric limits and units.", "limit_value NULL means unlimited; unit explains the number."],
            ["subscriptions", "A tenant's current plan and period.", "one active subscription per tenant."],
            ["subscription_events", "Audit of starts, changes, cancellations and dunning.", "append-only."],
            ["subscription_addons", "Extra pharmacies, seats, warehouses or storage.", "billed on the same invoice."],
        ],
        widths=[32, 74, 72],
        font_size=7.4,
        line_h=3.4,
    )

    pdf.h2("4.4 Upgrade, downgrade and cancellation")
    pdf.bullet_list(
        [
            "Upgrade: effective immediately. The customer pays the prorated difference for the remaining days and receives the new limits immediately. The current period end date does not change.",
            "Downgrade: effective at the end of the paid period by default. The customer keeps the current plan until then. An immediate downgrade is possible only after a preview confirms that current usage fits the target plan.",
            "Cancellation: effective at period end by default. The customer keeps access until the paid period expires, then enters a 90-day read-only export window. Immediate cancellation is allowed, with access revoked at once and no refund unless the cooling-off policy applies.",
            "Audience is immutable: a retail tenant cannot switch to a wholesale plan. Create a second tenant and link the same user identity.",
            "Plan changes are limited to 3 per rolling 30 days to prevent proration abuse. The limit is configurable and audited.",
            "Trials are once per tenant, 14 days, with Professional features and hard caps. A trial cannot be restarted by deleting and recreating a tenant with the same owner email and phone.",
        ],
        size=8.7,
    )

    pdf.h3("Proration example")
    pdf.table(
        ["Step", "Calculation", "Amount"],
        [
            ["Current plan", "Professional, TZS 45,000 per 30-day period", "45,000"],
            ["Day of change", "Day 10 of 30; 20 days remain", "20 / 30"],
            ["Unused credit", "45,000 x 20 / 30", "30,000"],
            ["New plan charge", "Enterprise, 60,000 x 20 / 30", "40,000"],
            ["Amount due now", "40,000 - 30,000", "10,000"],
            ["Next renewal", "Full Enterprise price", "60,000"],
        ],
        widths=[38, 96, 44],
        font_size=8.0,
        aligns=["L", "L", "R"],
    )
    pdf.small(
        "Use calendar-day proration with period start inclusive and period end exclusive. Calculate in integer "
        "minor units with BigDecimal HALF_UP, store every component on the invoice, and recalculate tax after proration. "
        "If the credit exceeds the charge, apply an account credit - do not send a cash refund automatically.",
    )

    pdf.h2("4.5 Subscription lifecycle and access states")
    pdf.table(
        ["Status", "Access", "Entered when", "Exits to"],
        [
            ["TRIALING", "Professional features with caps", "Tenant completes onboarding; 14-day trial.", "ACTIVE on payment; CANCELED on expiry."],
            ["ACTIVE", "Full plan", "Payment succeeded or subscription started.", "PAST_DUE on renewal failure; CANCELED at period end."],
            ["PAST_DUE", "Full plan + persistent banner", "Renewal charge failed.", "ACTIVE on payment; GRACE after 3 days."],
            ["GRACE", "Full plan + warnings", "3 days after failure; retries continue.", "ACTIVE on payment; READ_ONLY after 7 days."],
            ["READ_ONLY", "Read and export only", "Grace expired.", "ACTIVE on payment; SUSPENDED after 14 days."],
            ["SUSPENDED", "Login and billing only", "Read-only expired or abuse.", "ACTIVE on payment or admin action; CANCELED after 30 days."],
            ["CANCELED", "Export window, 90 days", "Customer cancels or dunning exhausts.", "Data purge unless legal hold."],
        ],
        widths=[23, 45, 60, 50],
        font_size=7.2,
        line_h=3.35,
    )
    pdf.callout(
        "Keep status and access separate",
        "A subscription can be PAST_DUE while still allowing full access during the grace window. Store status, "
        "grace_until and cancel_at_period_end; derive access as FULL, READ_ONLY or BLOCKED in one service. Do not spread "
        "date comparisons across controllers.",
        tone="blue",
    )

    pdf.h2("4.6 Enforcement architecture")
    pdf.body(
        "Entitlements are resolved once per request from a cached snapshot and enforced at the service boundary. "
        "The UI calls the same entitlement endpoint to hide or disable controls, but the API never trusts the UI. "
        "Every denial returns a machine-readable code and an upgrade URL.",
    )
    pdf.code_block(
        """@RequiresFeature(Feature.MARKETPLACE_BUY)
@PostMapping("/marketplace/orders")
public MarketplaceOrderResponse place(@Valid @RequestBody PlaceOrderRequest request) {
    return marketplaceOrderService.place(currentTenant(), request);
}

@RequiresWithinLimit(LimitKey.PHARMACIES)
@PostMapping("/pharmacies")
public PharmacyResponse create(@Valid @RequestBody CreatePharmacyRequest request) {
    return pharmacyService.create(currentTenant(), request);
}

// Entitlement snapshot (cached 15 minutes, invalidated on subscription change)
record PlanEntitlements(
    UUID tenantId, UUID planId, String planCode,
    Set<Feature> features, Map<LimitKey, Integer> limits, long version) {}""",
        title="Declarative enforcement",
    )
    pdf.bullet_list(
        [
            "Features: boolean checks (analytics, marketplace, supplier directory, API access, custom roles).",
            "Limits: numeric checks (pharmacies, employee seats, listings, warehouses, storage). NULL means unlimited.",
            "Usage providers: each limit knows how to count (active pharmacies, active employees plus pending invitations, active listings, stored bytes).",
            "Race safety: a limit-affecting write takes a PostgreSQL advisory lock on the tenant and limit key, then counts and inserts in the same transaction. Unique constraints remain the final guard.",
            "Over-limit after downgrade: never delete tenant data. The downgrade preview asks the owner which resources stay active; the rest become read-only until the next upgrade or until they are deactivated.",
            "Storage: a daily job recalculates usage; uploads check the cached counter and the job reconciles drift.",
            "Audit: every plan change, override, limit exception and cancellation writes a subscription_event and an audit_log.",
        ],
        size=8.7,
    )

    pdf.h2("4.7 Add-ons and fair use")
    pdf.table(
        ["Add-on", "Suggested price", "Availability", "Notes"],
        [
            ["Extra pharmacy", "TZS 15,000 / month", "Professional, Enterprise", "Basic must upgrade first."],
            ["Extra employee seat", "TZS 3,000 / month", "Professional, Enterprise", "Per active seat; owner free."],
            ["Extra warehouse", "TZS 25,000 / month", "Wholesale Growth, Enterprise", "Includes one price list."],
            ["Extra 1,000 listings", "TZS 10,000 / month", "Wholesale Growth, Enterprise", "Active listings only."],
            ["SMS bundle", "At cost + 20%", "All paid plans", "Prepaid, expires in 90 days."],
            ["Annual billing", "2 months free", "All paid plans", "18% effective discount, improves cash flow."],
            ["Priority onboarding", "TZS 100,000 one-off", "Enterprise", "Data import, training, go-live review."],
        ],
        widths=[42, 39, 45, 52],
        font_size=7.5,
    )
    pdf.small(
        "Fair use: 'unlimited' plans may not be resold as a bureau service, used to store unrelated data, or used to "
        "send unsolicited bulk messages. Enforce with storage quotas, rate limits and a documented acceptable-use policy.",
    )


# ---------------------------------------------------------------------------
# Section 5 - Architecture
# ---------------------------------------------------------------------------


def draw_architecture(pdf):
    pdf.ensure(125)
    x0, y0 = L, pdf.get_y()
    w, h = USABLE, 116

    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(*BORDER)
    pdf.rect(x0, y0, w, h, style="DF", round_corners=True, corner_radius=2)

    def box(x, y, bw, bh, title, sub="", fill=WHITE, border=BORDER, color=NAVY):
        pdf.set_fill_color(*fill)
        pdf.set_draw_color(*border)
        pdf.rect(x, y, bw, bh, style="DF", round_corners=True, corner_radius=1.5)
        pdf.set_font("Helvetica", "B", 7.0)
        pdf.set_text_color(*color)
        pdf.set_xy(x + 2, y + 3.0)
        pdf.cell(bw - 4, 3.4, title, align="C")
        if sub:
            pdf.set_font("Helvetica", "", 6.0)
            pdf.set_text_color(*MUTED)
            pdf.set_xy(x + 2, y + 7.4)
            pdf.cell(bw - 4, 3.0, sub, align="C")

    def v_arrow(x, y1, y2):
        pdf.set_draw_color(*MUTED)
        pdf.set_line_width(0.35)
        pdf.line(x, y1, x, y2 - 1.6)
        pdf.line(x, y2, x - 1.1, y2 - 1.8)
        pdf.line(x, y2, x + 1.1, y2 - 1.8)

    # Clients and edge
    box(x0 + 42, y0 + 6, 94, 12, "Next.js web apps", "retail  |  wholesale  |  super admin", fill=(245, 243, 255), border=VIOLET_2, color=VIOLET)
    v_arrow(x0 + 89, y0 + 18, y0 + 24)
    box(x0 + 42, y0 + 25, 94, 11, "Cloudflare: TLS 1.3, WAF, DDoS, rate limiting", fill=WHITE)
    v_arrow(x0 + 89, y0 + 36, y0 + 42)

    # API
    box(x0 + 14, y0 + 43, 108, 15, "Spring Boot 3.5 API  -  2+ stateless instances", "REST v1  |  security filters  |  scheduled jobs  |  webhooks", fill=(239, 246, 255), border=BLUE, color=NAVY)

    # Integrations
    box(x0 + 130, y0 + 43, 34, 15, "External services", "payments, SMS, email, e-TIMS", fill=AMBER_TINT, border=AMBER, color=AMBER)
    pdf.set_draw_color(*MUTED)
    pdf.set_line_width(0.35)
    pdf.line(x0 + 122, y0 + 50.5, x0 + 130, y0 + 50.5)
    pdf.line(x0 + 127, y0 + 50.5, x0 + 128.4, y0 + 49.4)
    pdf.line(x0 + 127, y0 + 50.5, x0 + 128.4, y0 + 51.6)

    # Data layer
    y_data = y0 + 72
    box(x0 + 8, y_data, 56, 20, "PostgreSQL 16", "primary + read replica  |  PITR", fill=(240, 253, 250), border=TEAL, color=TEAL)
    box(x0 + 69, y_data, 44, 20, "Redis 7", "cache, locks, rate limits, sessions", fill=(255, 251, 235), border=AMBER, color=AMBER)
    box(x0 + 118, y_data, 52, 20, "S3-compatible storage", "receipts, imports, exports, attachments", fill=(245, 243, 255), border=VIOLET_2, color=VIOLET)

    # API to data arrows
    pdf.set_draw_color(*MUTED)
    for x in [x0 + 36, x0 + 91, x0 + 144]:
        pdf.line(x, y0 + 58, x, y0 + 68)
        pdf.line(x, y0 + 68, x - 1.1, y0 + 66.2)
        pdf.line(x, y0 + 68, x + 1.1, y0 + 66.2)

    # side labels
    pdf.set_font("Helvetica", "", 6.2)
    pdf.set_text_color(*MUTED)
    pdf.set_xy(x0 + 8, y0 + 97)
    pdf.cell(100, 3.5, "All traffic is tenant-scoped. Analytics reads can use the replica. Files never live in the database.")
    pdf.set_xy(x0 + 8, y0 + 102)
    pdf.cell(120, 3.5, "Payment webhooks terminate at a public, signature-verified endpoint and are processed asynchronously.")

    pdf.set_y(y0 + h + 4)


def section_5(pdf):
    pdf.h1(5, "System architecture")

    pdf.h2("5.1 Principles")
    pdf.bullet_list(
        [
            "Modular monolith first. One deployable, one database, clear package boundaries. Microservices are an optimisation, not a starting point.",
            "Stateless API. No sticky sessions; JWT + Redis; any instance can serve any request.",
            "Database as the source of truth. Redis is disposable. Object storage holds bytes, not business state.",
            "Transactions where money and stock meet. Inventory, sales, purchasing and billing are ACID inside PostgreSQL.",
            "Events for everything else. Notifications, analytics, webhooks and marketplace fan-out use an outbox and retries.",
            "Boring technology. PostgreSQL, Redis, Spring, Flyway, Docker. Every extra component must earn its operational cost.",
        ],
        size=8.8,
    )

    pdf.h2("5.2 Runtime topology")
    draw_architecture(pdf)

    pdf.h2("5.3 Module map and dependency direction")
    pdf.body(
        "The code is organised by feature, not by technical layer. Each module exposes an application service and keeps "
        "its entities, repositories and adapters private. Cross-module calls go through the other module's public service "
        "or a domain event, never through its repository. This is what makes later extraction possible.",
    )
    pdf.table(
        ["Layer", "Contains", "May depend on"],
        [
            ["api", "Controllers, request/response DTOs, validation, OpenAPI annotations.", "application, common"],
            ["application", "Use cases, transaction boundaries, orchestration, authorization checks.", "domain, infrastructure"],
            ["domain", "Entities, value objects, domain rules, repository interfaces, domain events.", "common only"],
            ["infrastructure", "JPA repositories, gateway adapters, storage, messaging, external HTTP clients.", "domain, config"],
            ["config", "Security, Redis, cache, Jackson, OpenAPI, async, scheduling, payment registry.", "common"],
            ["common", "Base entities, money, errors, pagination, audit, tenancy, idempotency, utilities.", "nothing"],
        ],
        widths=[30, 97, 51],
        font_size=7.6,
    )

    pdf.h2("5.4 Request lifecycle")
    for i, step in enumerate(
        [
            "CorrelationIdFilter assigns X-Correlation-Id and puts it in MDC.",
            "RateLimitFilter checks IP, route and tenant buckets in Redis.",
            "JwtAuthenticationFilter validates signature, issuer, audience and expiry, then builds Authentication.",
            "TenantContextFilter loads the membership, checks tenant status and sets TenantContext.",
            "Authorization rules run: authorities, feature flags and tenant ownership.",
            "Controller validates the DTO and maps it to an application command.",
            "Application service opens a transaction, sets app.tenant_id for RLS, executes domain logic.",
            "Repositories read/write PostgreSQL; Redis serves cached entitlements and reference data.",
            "Domain events are written to the outbox in the same transaction.",
            "Response is serialised with a stable envelope and correlation ID.",
            "After commit, the outbox relay publishes events for notifications, analytics and webhooks.",
            "Metrics, traces and access logs are emitted; sensitive fields are redacted.",
        ],
        start=1,
    ):
        pdf.numbered(i, step, size=8.6)

    pdf.h2("5.5 Multi-tenancy")
    pdf.body(
        "Use a shared database and shared schema with a tenant_id discriminator. It is the simplest model to operate, "
        "the cheapest at early scale, and it supports cross-tenant platform reporting. Isolation is enforced in three "
        "layers so a single missed WHERE clause does not become a breach.",
    )
    pdf.table(
        ["Layer", "Mechanism", "Failure behaviour"],
        [
            ["Identity", "JWT carries tenant_id and membership_id; server validates membership is active.", "401 or 403 before any query."],
            ["Application", "TenantContext + tenant-scoped repositories + TenantGuard ownership checks.", "404 for cross-tenant resource IDs, never 403."],
            ["Database", "Hibernate @TenantId plus PostgreSQL RLS using app.tenant_id.", "Query returns zero rows if context is missing or wrong."],
            ["Tests", "Isolation suite replays every endpoint with another tenant's IDs.", "Build fails on any leak."],
        ],
        widths=[26, 104, 48],
        font_size=7.6,
    )
    pdf.bullet_list(
        [
            "Every business table has tenant_id UUID NOT NULL as the first column of its primary access index.",
            "Unique business keys are composite: (tenant_id, barcode), (tenant_id, invoice_number), (tenant_id, sku).",
            "Platform-global reference data (product master, categories, manufacturers, units) has no tenant_id and is read-only to tenants.",
            "The application database role is not the table owner and is not SUPERUSER, so RLS cannot be bypassed.",
            "A missing tenant context is an error, not a wildcard. Platform jobs iterate tenants explicitly.",
            "Super-admin access to tenant business data is only through audited impersonation, never a global query in the admin UI.",
        ],
        size=8.7,
    )

    pdf.h2("5.6 Transactions, consistency and idempotency")
    pdf.table(
        ["Flow", "Consistency model", "Implementation"],
        [
            ["POS checkout", "Strong, ACID", "One transaction: lock batches FEFO, insert sale/items/payments, insert stock movements, insert outbox event."],
            ["Goods receiving", "Strong, ACID", "One transaction per receipt: update PO received quantities, create batches, insert movements."],
            ["Stock transfer", "Strong per side", "Two transactions with a TRANSFER_IN_TRANSIT state; receive at destination creates the second movement."],
            ["Subscription change", "Strong + provider call", "Persist intent, call provider with idempotency key, update subscription and invoice; webhook confirms."],
            ["Marketplace order", "Saga", "Parent order + one sub-order per supplier; each sub-order is committed independently; parent status is derived."],
            ["Analytics", "Eventual", "Daily facts refreshed on a schedule; dashboards label data freshness."],
            ["Notifications", "Eventual", "Outbox -> channel adapter -> delivery log; retries with backoff and dead-letter."],
        ],
        widths=[33, 35, 110],
        font_size=7.3,
        line_h=3.35,
    )
    pdf.code_block(
        """-- Idempotency is stored, not inferred
CREATE TABLE idempotency_keys (
  tenant_id uuid NOT NULL,
  idempotency_key varchar(128) NOT NULL,
  endpoint varchar(160) NOT NULL,
  request_hash char(64) NOT NULL,
  response_status int,
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, idempotency_key, endpoint)
);

-- Same key + same body  -> return stored response
-- Same key + different body -> 409 IDEMPOTENCY_CONFLICT""",
        title="Idempotency contract",
    )

    pdf.h2("5.7 Asynchronous work")
    pdf.body(
        "All asynchronous work is triggered by a transactional outbox or a scheduled job, never by a fire-and-forget "
        "thread inside a request. The outbox relay runs in every instance but uses a Redis lock so only one instance "
        "claims a batch. Failed events are retried with exponential backoff and then parked in a dead-letter table that "
        "the super admin can inspect and replay.",
    )

    pdf.h2("5.8 Scaling path")
    pdf.table(
        ["Signal", "Action", "Why"],
        [
            ["API CPU > 70% sustained or p95 > 500 ms", "Add API instances behind the load balancer.", "Stateless by design."],
            ["DB connections > 80%", "Add PgBouncer, then a read replica for analytics and exports.", "Protect OLTP connection budget."],
            ["Analytics slows checkout", "Move dashboard queries to the replica; refresh materialised views off-peak.", "Separate read and write pressure."],
            ["Stock movements > 5M rows/month", "Monthly range partitions on stock_movements and audit_logs.", "Keep indexes small and vacuum manageable."],
            ["Notification volume grows", "Extract the notification worker and queue.", "Independent scaling and failure isolation."],
            ["Marketplace GMV grows", "Extract marketplace and settlement with its own database.", "Different consistency and release cadence."],
            ["Billing becomes complex", "Keep it in the monolith longer; extract only with a dedicated team.", "Money flows benefit from strong local transactions."],
        ],
        widths=[45, 85, 48],
        font_size=7.4,
    )

    pdf.h2("5.9 Failure modes and graceful degradation")
    pdf.table(
        ["Dependency down", "Impact", "Behaviour"],
        [
            ["Redis", "Cache, rate limit, locks", "Read through to PostgreSQL; rate limiting falls back to a conservative in-memory bucket; locks use DB advisory locks. Login rate limits fail closed."],
            ["Payment provider", "New checkouts and renewals", "Queue checkout intent, show retry, never activate a plan without a verified payment or explicit admin override."],
            ["SMS / WhatsApp", "OTP and notifications", "Retry with backoff; show in-app fallback; never block a sale on an SMS."],
            ["Object storage", "Uploads and receipt PDFs", "Queue upload; generate receipt on demand when storage returns; sales continue."],
            ["Read replica", "Analytics and exports", "Serve cached last snapshot; route reads to primary if lag exceeds threshold."],
            ["Outbox relay", "Notifications, analytics", "Business writes continue; events accumulate and drain when the relay recovers."],
        ],
        widths=[33, 38, 107],
        font_size=7.4,
        line_h=3.35,
    )


# ---------------------------------------------------------------------------
# Section 6 - Technology stack
# ---------------------------------------------------------------------------


def section_6(pdf):
    pdf.h1(6, "Technology stack")

    pdf.body(
        "The stack is intentionally conservative. Every component has a clear operational owner and a fallback. "
        "Versions below are the target; pin them in the build and upgrade deliberately, not automatically.",
    )
    pdf.table(
        ["Layer", "Choice", "Why this choice", "Notes"],
        [
            ["Language", "Java 21 LTS", "Records, sealed types, pattern matching, virtual threads if needed.", "Move to Java 25 LTS after the first production release."],
            ["Framework", "Spring Boot 3.5.x", "Mature security, data, validation, actuator and testing.", "Evaluate Boot 4 after release; do not block v1."],
            ["Web", "Spring MVC + Jackson", "Simple blocking model is easier to reason about for transactional CRUD.", "Use virtual threads only after measuring."],
            ["Security", "Spring Security 6 + Nimbus JOSE", "Filter chain, method security, JWT/JWK support.", "No custom crypto."],
            ["Persistence", "Spring Data JPA + Hibernate 6", "Productive CRUD, @TenantId, optimistic locking.", "Use JdbcTemplate for analytics and bulk reads."],
            ["Migrations", "Flyway", "Versioned, repeatable, testable SQL.", "Run as a separate job in production."],
            ["Database", "PostgreSQL 16", "ACID, RLS, JSONB, partial indexes, materialised views, PITR.", "PostgreSQL 17 is acceptable if managed."],
            ["Cache / locks", "Redis 7 + Lettuce, Caffeine L1", "Entitlements, rate limits, idempotency, locks, sessions.", "Redis is never the source of truth."],
            ["Mapping", "MapStruct", "Compile-time DTO mapping, no reflection surprises.", "Keep entities out of controllers."],
            ["Validation", "Jakarta Validation", "Declarative request validation.", "Custom validators for phone, currency, tax IDs."],
            ["API docs", "springdoc-openapi", "OpenAPI 3.1 from code; client generation.", "Swagger UI disabled in production."],
            ["Rate limiting", "Bucket4j + Redis", "Token buckets per IP, user, tenant and route.", "Plan-specific quotas."],
            ["Scheduling", "Spring Scheduling + ShedLock", "Simple jobs with a distributed lock.", "Move to a queue when jobs exceed minutes."],
            ["IDs / money", "uuid-creator (UUIDv7), BigDecimal", "Time-ordered UUIDs; exact money arithmetic.", "Store money as BIGINT minor units."],
            ["PDF / Excel", "OpenPDF or iText, Apache POI", "Receipts, invoices, exports.", "Generate asynchronously for large exports."],
            ["Files", "AWS SDK v2 S3", "Works with S3, R2, Wasabi, MinIO.", "Private buckets, signed URLs only."],
            ["Email", "Spring Mail + Thymeleaf", "Templates close to the code.", "Use a transactional provider in production."],
            ["SMS / WhatsApp", "HTTP adapters", "Provider-agnostic, like payments.", "Log delivery IDs and status."],
            ["Testing", "JUnit 5, AssertJ, Mockito, Testcontainers, REST Assured, ArchUnit, k6", "Unit, integration, contract, architecture and load.", "Testcontainers uses real PostgreSQL and Redis."],
            ["Observability", "Micrometer, OpenTelemetry, Prometheus, Grafana, Loki, Sentry", "Metrics, traces, logs and exceptions.", "Correlation ID everywhere."],
            ["Build", "Maven + Spotless", "Reproducible builds and formatting.", "Enforce in CI."],
            ["Containers", "Docker + Compose", "Identical local and production runtime.", "Multi-stage, non-root, distroless JRE."],
            ["CI/CD", "GitHub Actions", "Build, test, scan, image, deploy.", "Manual approval for production."],
            ["Deployment", "Fly.io, Render, AWS ECS or a managed VPS", "Choose by region latency and managed Postgres support.", "Cape Town or eu-west for Tanzania latency."],
        ],
        widths=[25, 43, 70, 40],
        font_size=6.9,
        header_size=7.0,
        line_h=3.25,
        pad=1.0,
    )
    pdf.callout(
        "Version policy",
        "Pin every dependency. Upgrade in a dedicated PR with the full test suite and a staging smoke test. "
        "Do not adopt a new major Spring Boot, Java or PostgreSQL version in the same sprint as a billing change. "
        "Keep the last two minor versions of the framework supported; security patches are the exception and ship immediately.",
        tone="blue",
    )


# ---------------------------------------------------------------------------
# Section 7 - Database design
# ---------------------------------------------------------------------------


def section_7(pdf):
    pdf.h1(7, "PostgreSQL database design")

    pdf.h2("7.1 Conventions")
    pdf.table(
        ["Concern", "Rule", "Why"],
        [
            ["Primary keys", "UUIDv7 generated by the application.", "Time-ordered, non-guessable, safe in URLs."],
            ["Timestamps", "timestamptz, stored in UTC, displayed in Africa/Dar_es_Salaam.", "No daylight-saving ambiguity."],
            ["Money", "BIGINT amount_minor + CHAR(3) currency. TZS exponent is 0.", "No floating point; exact sums and comparisons."],
            ["Tenant key", "tenant_id UUID NOT NULL on every business table.", "Isolation and index prefix."],
            ["Soft delete", "deleted_at timestamptz; partial unique indexes exclude deleted rows.", "Recoverable deletes without losing history."],
            ["Enums", "VARCHAR + CHECK constraint, mapped to Java enums.", "Additive changes without ALTER TYPE locks."],
            ["JSON", "JSONB only for flexible metadata, never for core relational fields.", "Queryable but not a schema escape hatch."],
            ["Naming", "snake_case tables and columns; plural table names; FK <table>_id.", "Predictable mappings and reviews."],
            ["Search", "tsvector + GIN for product text; pg_trgm for partial matches.", "Fast search without an external engine."],
            ["Audit", "Append-only tables with created_at and actor; no updates.", "Tamper evidence and traceability."],
        ],
        widths=[28, 96, 54],
        font_size=7.4,
    )

    pdf.h2("7.2 Schema map")
    pdf.table(
        ["Group", "Tables", "Purpose"],
        [
            ["identity", "users, user_profiles, refresh_tokens, password_reset_tokens, mfa_secrets, mfa_recovery_codes, login_attempts", "Global identity, credentials, sessions, MFA."],
            ["tenancy", "tenants, tenant_settings, memberships, invitations", "Tenant lifecycle, roles, seat invitations."],
            ["plans", "plans, plan_prices, plan_features, plan_limits", "Catalogue and entitlement definitions."],
            ["subscription", "subscriptions, subscription_addons, subscription_events, coupons, credits", "Tenant plan state and billing history."],
            ["billing", "invoices, invoice_lines, payments, payment_events, refunds, ledger_entries", "Invoices, provider payments, refunds, money ledger."],
            ["pharmacy", "pharmacies, pharmacy_settings, pharmacy_licenses, operating_hours", "Retail locations and compliance data."],
            ["catalog", "products, product_categories, manufacturers, product_barcodes, units_of_measure, tax_rates", "Platform product master and reference data."],
            ["inventory", "inventory_items, batches, stock_movements, stock_transfers, stock_transfer_items, stock_counts, stock_count_items, reorder_rules", "Per-pharmacy stock, batches, ledger, transfers, counts."],
            ["sales", "customers, sales, sale_items, sale_payments, sales_returns, sales_return_items, receipts, prescriptions, prescription_items", "POS, returns, customers, prescriptions."],
            ["procurement", "suppliers, purchase_orders, purchase_order_items, goods_receipts, goods_receipt_items, supplier_returns", "Supplier directory and purchasing."],
            ["marketplace", "wholesale_profiles, listings, listing_price_tiers, marketplace_orders, marketplace_order_items, marketplace_sub_orders, rfqs, quotes, reviews, commissions", "Retail-to-wholesale marketplace."],
            ["wholesale", "warehouses, wholesale_inventory_items, wholesale_batches, wholesale_customers, price_lists, price_list_items, sales_orders, sales_order_items, delivery_notes, wholesale_invoices, credit_notes, receivables", "Wholesale operations and receivables."],
            ["workforce", "employee_profiles, shifts, shift_assignments, attendance, performance_snapshots", "Employees, shifts, attendance, performance."],
            ["analytics", "daily_sales_facts, daily_product_facts, daily_payment_facts, inventory_snapshots, report_schedules", "Pre-aggregated reporting data."],
            ["notifications", "notifications, notification_preferences, notification_templates, message_log", "In-app, email, SMS and WhatsApp delivery."],
            ["system", "audit_logs, outbox_events, idempotency_keys, webhook_events, feature_flags, files, support_tickets, job_locks", "Cross-cutting operational state."],
        ],
        widths=[26, 103, 49],
        font_size=6.9,
        header_size=7.0,
        line_h=3.3,
        pad=1.0,
    )

    pdf.h2("7.3 Core tables")
    pdf.table(
        ["Table", "Key columns", "Constraints and notes"],
        [
            ["tenants", "id, type, name, slug, status, country, currency, timezone, owner_user_id, trial_ends_at", "slug unique; type in RETAIL, WHOLESALE; status ACTIVE, SUSPENDED, CANCELED."],
            ["users", "id, email citext, phone, password_hash, status, email_verified_at, mfa_enabled, failed_attempts, locked_until, last_login_at", "email unique; no tenant_id (global identity)."],
            ["memberships", "id, tenant_id, user_id, role, status, permissions_version, permissions_override jsonb", "unique(tenant_id, user_id); one active membership per tenant."],
            ["invitations", "id, tenant_id, email, role, token_hash, expires_at, accepted_at, invited_by", "token stored hashed; single use; expiry 7 days."],
            ["subscriptions", "id, tenant_id, plan_price_id, status, current_period_start, current_period_end, trial_end, grace_until, cancel_at_period_end, canceled_at", "partial unique index: one non-canceled subscription per tenant."],
            ["plan_prices", "id, plan_id, currency, amount_minor, interval, effective_from, effective_to", "price history; subscriptions reference the price id."],
            ["plan_limits", "id, plan_id, limit_key, limit_value, unit", "NULL limit_value means unlimited."],
            ["invoices", "id, tenant_id, subscription_id, number, status, subtotal_minor, discount_minor, tax_minor, total_minor, currency, due_at, paid_at, pdf_file_id", "unique(tenant_id, number); status DRAFT, OPEN, PAID, VOID, UNCOLLECTIBLE."],
            ["payments", "id, tenant_id, invoice_id, provider, provider_ref, idempotency_key, amount_minor, currency, status, method, paid_at, failure_code", "unique(provider, provider_ref); amount and currency must match invoice."],
            ["payment_events", "id, provider, provider_event_id, type, payload jsonb, signature_valid, processed_at", "unique(provider, provider_event_id) for replay protection."],
            ["pharmacies", "id, tenant_id, name, code, region, address, phone, license_no, license_expiry, status", "unique(tenant_id, code); licence expiry alert job."],
            ["products", "id, name, generic_name, strength, dosage_form, category_id, manufacturer_id, barcode, sku, unit_id, prescription_required, controlled_schedule, status", "global master; barcode unique where not null."],
            ["inventory_items", "id, tenant_id, pharmacy_id, product_id, sku, barcode, selling_price_minor, purchase_price_minor, reorder_level, reorder_qty, is_active", "unique(pharmacy_id, product_id); unique(tenant_id, barcode)."],
            ["batches", "id, tenant_id, inventory_item_id, batch_number, expiry_date, quantity_on_hand, unit_cost_minor, received_at, supplier_id, status", "unique(inventory_item_id, batch_number, expiry_date); quantity_on_hand >= 0."],
            ["stock_movements", "id, tenant_id, pharmacy_id, inventory_item_id, batch_id, movement_type, quantity_delta, unit_cost_minor, reference_type, reference_id, reason, created_by, created_at", "append-only; no UPDATE or DELETE; monthly partitions later."],
            ["sales", "id, tenant_id, pharmacy_id, number, customer_id, cashier_id, status, subtotal_minor, discount_minor, tax_minor, total_minor, payment_status, client_ref, completed_at, voided_at", "unique(tenant_id, number); unique(tenant_id, client_ref)."],
            ["sale_items", "id, sale_id, inventory_item_id, batch_id, product_name_snapshot, quantity, unit_price_minor, unit_cost_minor, discount_minor, line_total_minor", "snapshot names and prices; batch_id nullable for services."],
            ["purchase_orders", "id, tenant_id, pharmacy_id, supplier_id, number, status, order_date, expected_date, subtotal_minor, tax_minor, total_minor, approved_by", "status DRAFT, ORDERED, PARTIALLY_RECEIVED, RECEIVED, CANCELED."],
            ["goods_receipts", "id, tenant_id, purchase_order_id, number, received_at, received_by, status", "creates batches and stock movements."],
            ["suppliers", "id, tenant_id, name, contact_person, phone, email, address, license_no, license_expiry, status, wholesale_tenant_id", "tenant-owned supplier; wholesale_tenant_id links to a marketplace seller."],
            ["listings", "id, wholesale_tenant_id, product_id, title, unit_price_minor, currency, moq, available_units, lead_time_days, region, status, promoted_until", "status DRAFT, ACTIVE, PAUSED, ARCHIVED; verification required."],
            ["marketplace_orders", "id, retail_tenant_id, pharmacy_id, number, status, total_minor, commission_minor, placed_by", "parent order; one sub-order per supplier."],
            ["marketplace_sub_orders", "id, marketplace_order_id, wholesale_tenant_id, status, subtotal_minor, commission_minor", "supplier-specific fulfilment and settlement."],
            ["warehouses", "id, tenant_id, name, address, region, status", "wholesale tenant locations."],
            ["wholesale_invoices", "id, tenant_id, customer_id, number, status, total_minor, paid_minor, due_at", "receivables; aging report from due_at."],
            ["employee_profiles", "id, tenant_id, pharmacy_id, user_id, job_title, license_no, license_expiry, employment_status, hired_at", "retail only; one profile per user per pharmacy."],
            ["audit_logs", "id, tenant_id, actor_user_id, action, entity_type, entity_id, before jsonb, after jsonb, ip, user_agent, correlation_id, hash_prev, hash", "append-only; hash chain; no business secrets in payload."],
            ["outbox_events", "id, aggregate_type, aggregate_id, event_type, payload jsonb, status, attempts, available_at, created_at", "relay claims with SKIP LOCKED."],
        ],
        widths=[29, 98, 51],
        font_size=6.5,
        header_size=6.8,
        line_h=3.05,
        pad=0.9,
        min_row_h=5.2,
    )
    pdf.small(
        "This is the core set, not every column. Keep DDL in Flyway; keep the canonical diagram in docs/architecture. "
        "Every FK gets an index. Every unique business key includes tenant_id unless it is platform-global.",
    )

    pdf.h2("7.4 Relationships that matter")
    pdf.bullet_list(
        [
            "A tenant has many memberships, pharmacies (retail) or warehouses (wholesale), and exactly one active subscription.",
            "A product is global; a pharmacy sells it through an inventory_item. Stock lives in batches under that item.",
            "A sale belongs to one pharmacy and one cashier; each sale item points to the batch consumed. Returns reference the original sale item.",
            "A purchase order belongs to one pharmacy and one supplier; a goods receipt creates batches and stock movements.",
            "A marketplace order belongs to a retail tenant; it fans out into sub-orders, one per wholesale tenant, each with its own status.",
            "A wholesale invoice belongs to a wholesale tenant and a wholesale customer; receivables age from the due date.",
            "A subscription produces invoices; an invoice produces payments; a payment produces ledger entries and may produce refunds.",
            "An audit log may reference any entity by type and id; it never relies on a hard FK that would block deletion.",
        ],
        size=8.7,
    )

    pdf.h2("7.5 Tenant isolation in the database")
    pdf.code_block(
        """-- The application role is not the owner and not SUPERUSER.
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items FORCE ROW LEVEL SECURITY;

CREATE POLICY inventory_tenant_isolation ON inventory_items
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- At the start of every tenant transaction:
SET LOCAL app.tenant_id = '0192f0c4-...';

-- If the setting is missing, current_setting(..., true) returns NULL and the
-- policy matches no rows. That is intentional: no context means no data.""",
        title="Row-level security pattern",
    )
    pdf.small(
        "Apply the same policy to every tenant table. Use a migration role for DDL and a separate runtime role with only "
        "DML privileges. Test RLS with a connection that is not the table owner; otherwise PostgreSQL silently bypasses it.",
    )

    pdf.h2("7.6 Stock ledger and FEFO")
    pdf.body(
        "Stock is the most dangerous part of a pharmacy system: mistakes mean overselling, expired medicine or a "
        "regulator finding. Model it as an append-only ledger and treat batch quantity as a cached projection.",
    )
    pdf.table(
        ["Movement type", "Direction", "Created by"],
        [
            ["SALE", "Out", "POS checkout"],
            ["SALE_RETURN", "In", "Return acceptance, only if batch is valid"],
            ["PURCHASE_RECEIPT", "In", "Goods receipt"],
            ["PURCHASE_RETURN", "Out", "Supplier return"],
            ["ADJUSTMENT_IN / ADJUSTMENT_OUT", "In / Out", "Authorised stock adjustment with reason"],
            ["TRANSFER_OUT / TRANSFER_IN", "Out / In", "Inter-pharmacy transfer"],
            ["EXPIRY_WRITE_OFF", "Out", "Expiry job or authorised write-off"],
            ["DAMAGE", "Out", "Authorised write-off"],
            ["STOCK_COUNT_GAIN / LOSS", "In / Out", "Stock count reconciliation"],
        ],
        widths=[55, 30, 93],
        font_size=7.4,
    )
    pdf.code_block(
        """-- FEFO allocation: first expiry, first out. Lock the rows you will consume.
SELECT id, batch_number, expiry_date, quantity_on_hand, unit_cost_minor
FROM batches
WHERE tenant_id = :tenantId
  AND inventory_item_id = :itemId
  AND quantity_on_hand > 0
ORDER BY expiry_date ASC, received_at ASC
FOR UPDATE;

-- The service allocates across rows, inserts one SALE movement per batch,
-- decrements quantity_on_hand, and commits. The CHECK constraint prevents negative stock.""",
        title="FEFO allocation query",
    )
    pdf.bullet_list(
        [
            "Never edit a batch quantity directly from the UI. Every change is a movement with a reference and an actor.",
            "Corrections are compensating movements, not updates. The ledger is the audit trail.",
            "Expired batches are blocked from FEFO allocation; write them off explicitly with a reason and an approver.",
            "Returns restock only when the batch is known, unexpired and traceable; otherwise create a write-off.",
            "Stock valuation uses unit_cost_minor, never selling price. Report both cost value and retail value.",
            "A nightly reconciliation compares sum(movements) with batch quantities and alerts on drift.",
        ],
        size=8.6,
    )

    pdf.h2("7.7 Indexes, constraints and performance")
    pdf.table(
        ["Object", "Index / constraint", "Reason"],
        [
            ["All tenant tables", "(tenant_id, created_at DESC)", "Default list queries and RLS predicate."],
            ["stock_movements", "(tenant_id, pharmacy_id, created_at DESC), BRIN(created_at)", "Ledger screens and range reports."],
            ["batches", "(tenant_id, inventory_item_id, expiry_date) WHERE quantity_on_hand > 0", "FEFO and expiry alerts."],
            ["sales", "(tenant_id, pharmacy_id, completed_at DESC), unique(tenant_id, number)", "History, receipts and duplicate protection."],
            ["products", "GIN(to_tsvector(name, generic_name)), GIN(name gin_trgm_ops)", "Search by name and partial match."],
            ["subscriptions", "unique(tenant_id) WHERE status NOT IN ('CANCELED')", "One active subscription."],
            ["invoices", "unique(tenant_id, number), (tenant_id, status, due_at)", "Numbering and dunning."],
            ["audit_logs", "(tenant_id, created_at DESC), BRIN(created_at)", "Investigation and retention."],
            ["outbox_events", "(status, available_at) WHERE status = 'PENDING'", "Efficient relay claim."],
        ],
        widths=[31, 88, 59],
        font_size=7.2,
        line_h=3.3,
    )

    pdf.h2("7.8 Migrations and seed data")
    pdf.code_block(
        """src/main/resources/db/migration/
  V1__extensions.sql               pgcrypto, citext, pg_trgm
  V2__identity.sql                 users, tokens, MFA
  V3__tenancy.sql                  tenants, memberships, invitations
  V4__plans_billing.sql            plans, prices, subscriptions, invoices, payments
  V5__catalog.sql                  products, categories, manufacturers, units
  V6__pharmacy_inventory.sql       pharmacies, inventory items, batches, movements
  V7__sales.sql                    customers, sales, returns, prescriptions, receipts
  V8__procurement.sql              suppliers, purchase orders, goods receipts
  V9__marketplace.sql              listings, orders, sub-orders, RFQs, reviews
  V10__wholesale.sql               warehouses, price lists, wholesale invoices
  V11__workforce.sql               employee profiles, shifts, attendance
  V12__notifications_audit.sql     notifications, audit, outbox, idempotency
  V13__analytics.sql               facts, views, report schedules
  V14__rls_policies.sql            enable RLS and create tenant policies
  V15__indexes.sql                 performance indexes and constraints

src/main/resources/db/seed/
  R__seed_plans.sql                plans, prices, features, limits
  R__seed_reference.sql            categories, units, manufacturers
  R__seed_platform_admin.sql       one super admin, forced password change""",
        title="Migration layout",
    )
    pdf.bullet_list(
        [
            "Forward-only migrations. Never edit an applied migration; add a new one.",
            "Expand/contract for zero-downtime changes: add nullable column -> backfill -> dual-write -> switch reads -> drop later.",
            "Run Flyway as a separate deployment step with a backup and a lock; the application validates the schema on startup.",
            "Seed plans and feature keys idempotently; prices change by inserting a new plan_price row.",
            "Test migrations against a restored production snapshot before every release that touches a large table.",
        ],
        size=8.7,
    )

    pdf.h2("7.9 Retention, partitioning and analytics")
    pdf.table(
        ["Data", "Default retention", "Strategy"],
        [
            ["Sales, sale items, payments", "7 years (confirm with counsel)", "Keep hot for 24 months; archive older partitions to S3 Parquet."],
            ["Prescriptions and controlled register", "Per pharmacy regulation", "Immutable, access-logged, no hard delete during legal hold."],
            ["Stock movements", "7 years", "Monthly partitions after 5M rows; archive closed partitions."],
            ["Audit logs", "36 months for Enterprise; 12 months default", "Hash chain; monthly partition; WORM export."],
            ["Payment events", "7 years", "Provider webhook payloads retained for reconciliation."],
            ["PII (users, customers)", "While account active + 90 days", "Export/delete workflow; legal hold overrides."],
            ["Analytics facts", "36 months", "Recomputable from source tables; safe to rebuild."],
        ],
        widths=[45, 55, 78],
        font_size=7.3,
    )
    pdf.body(
        "Analytics should not scan the OLTP tables on every dashboard request. Build daily fact tables from sales, "
        "purchases and stock movements, then expose indexed materialised views for the dashboard, category mix, payment "
        "mix, hourly sales and top products. Refresh concurrently every 15 minutes on the read replica; the API returns "
        "a dataFreshness timestamp so the UI can be honest about staleness.",
    )


# ---------------------------------------------------------------------------
# Section 8 - API design
# ---------------------------------------------------------------------------


def section_8(pdf):
    pdf.h1(8, "API design")

    pdf.h2("8.1 Conventions")
    pdf.table(
        ["Concern", "Decision"],
        [
            ["Base path", "/api/v1. Breaking changes go to /api/v2 with a sunset window."],
            ["Format", "JSON UTF-8, camelCase fields, UUID strings, ISO-8601 timestamps with offset."],
            ["Money", "amountMinor (integer) + currency (ISO 4217). TZS has exponent 0, so TZS 30,000 = 30000."],
            ["Dates", "Store UTC; accept and return ISO-8601; format in the tenant timezone on the client."],
            ["Envelope", "Success: { data, meta }. Errors: { error: { code, message, details, correlationId } }."],
            ["Pagination", "Cursor-based: ?limit=50&cursor=...; response meta.nextCursor and meta.hasMore. Admin lists may use page/size."],
            ["Filtering", "Explicit whitelisted query parameters; no raw column names or JPA sort injection."],
            ["Sorting", "?sort=createdAt,desc with an allowlist per endpoint."],
            ["Idempotency", "Idempotency-Key required on sales, payments, marketplace orders and subscription changes."],
            ["Concurrency", "Optimistic locking with version; If-Match supported on mutable resource updates."],
            ["Rate limits", "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After on 429."],
            ["Correlation", "X-Correlation-Id accepted or generated; echoed in every response and log."],
            ["Docs", "OpenAPI 3.1 at /v3/api-docs; Swagger UI only in dev and staging."],
        ],
        widths=[31, 147],
        font_size=7.4,
    )
    pdf.code_block(
        """{
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "Your plan allows 2 pharmacies. Upgrade to add another.",
    "details": [{ "field": "limitKey", "value": "PHARMACIES", "limit": 2, "current": 2 }],
    "correlationId": "01J8Z3K4...",
    "upgradeUrl": "/settings/billing/plans"
  }
}""",
        title="Error envelope",
    )
    pdf.small(
        "Use 401 for missing/invalid authentication, 403 for missing permission or feature, 404 for cross-tenant or "
        "missing resources, 409 for conflicts and idempotency mismatches, 422 for validation, 429 for rate limits, "
        "and 402 only when a payment action is genuinely required.",
    )

    pdf.h2("8.2 Authentication and session endpoints")
    pdf.table(
        ["Method", "Path", "Purpose", "Access"],
        [
            ["POST", "/auth/register", "Create a user and a RETAIL or WHOLESALE tenant; start trial.", "Public"],
            ["POST", "/auth/login", "Email/phone + password; returns tokens or a step-up challenge.", "Public"],
            ["POST", "/auth/refresh", "Rotate refresh token; detect reuse.", "Refresh token"],
            ["POST", "/auth/logout", "Revoke the current session.", "Authenticated"],
            ["POST", "/auth/forgot-password", "Send a single-use reset link.", "Public"],
            ["POST", "/auth/reset-password", "Consume the reset token and set a new password.", "Public"],
            ["POST", "/auth/verify-email", "Verify an email token.", "Public"],
            ["POST", "/auth/resend-verification", "Re-send verification with rate limit.", "Public"],
            ["POST", "/auth/mfa/enable", "Generate a TOTP secret and recovery codes.", "Authenticated + step-up"],
            ["POST", "/auth/mfa/verify", "Confirm TOTP and activate MFA.", "Authenticated"],
            ["POST", "/auth/mfa/disable", "Disable MFA after password + TOTP.", "Authenticated + step-up"],
            ["GET", "/auth/me", "Current user, memberships and active tenant.", "Authenticated"],
            ["POST", "/auth/switch-tenant", "Re-issue tokens for another membership.", "Authenticated"],
            ["GET", "/auth/sessions", "List active sessions and devices.", "Authenticated"],
            ["DELETE", "/auth/sessions/{id}", "Revoke one session.", "Authenticated"],
            ["POST", "/auth/accept-invitation", "Set a password and join a tenant.", "Invitation token"],
        ],
        widths=[18, 64, 68, 28],
        font_size=7.2,
        line_h=3.3,
    )

    pdf.h2("8.3 Tenant, pharmacy and workforce endpoints")
    pdf.table(
        ["Method", "Path", "Purpose", "Permission / plan"],
        [
            ["GET", "/tenants/current", "Tenant profile and status.", "tenant:read"],
            ["PATCH", "/tenants/current", "Update name, address, branding.", "tenant:manage"],
            ["GET", "/tenants/current/entitlements", "Resolved features and limits for the UI.", "Authenticated"],
            ["GET", "/tenants/current/usage", "Current counts vs limits.", "billing:read"],
            ["GET", "/tenants/current/members", "Members and roles.", "employees:read"],
            ["POST", "/invitations", "Invite an employee or manager.", "employees:invite / seat limit"],
            ["DELETE", "/members/{id}", "Deactivate a membership.", "employees:write"],
            ["GET", "/pharmacies", "List pharmacies in the tenant.", "tenant:read"],
            ["POST", "/pharmacies", "Create a pharmacy.", "tenant:manage / pharmacies limit"],
            ["GET", "/pharmacies/{id}", "Pharmacy detail.", "tenant:read + ownership"],
            ["PATCH", "/pharmacies/{id}", "Update pharmacy or licence data.", "tenant:manage"],
            ["GET", "/pharmacies/{id}/settings", "Operating hours, receipts, thresholds.", "tenant:read"],
            ["PATCH", "/pharmacies/{id}/settings", "Update settings.", "tenant:manage"],
            ["GET", "/employees", "Employee profiles with filters.", "employees:read"],
            ["POST", "/employees", "Create a profile for an existing member.", "employees:write / seat limit"],
            ["PATCH", "/employees/{id}", "Update job title, licence, shift.", "employees:write"],
            ["POST", "/employees/{id}/deactivate", "Deactivate and release a seat.", "employees:write"],
            ["GET", "/employees/{id}/performance", "Sales and performance facts.", "analytics:view (Pro+)"],
            ["GET/POST", "/shifts", "List or create shift templates.", "employees:write"],
            ["POST", "/attendance/check-in", "Clock in.", "Authenticated employee"],
            ["POST", "/attendance/check-out", "Clock out.", "Authenticated employee"],
        ],
        widths=[18, 62, 62, 36],
        font_size=7.0,
        line_h=3.25,
    )

    pdf.h2("8.4 Plans, subscriptions, billing and payments")
    pdf.table(
        ["Method", "Path", "Purpose", "Permission / plan"],
        [
            ["GET", "/plans", "Public plan catalogue for an audience.", "Public"],
            ["GET", "/subscriptions/current", "Current plan, period, usage and renewal.", "billing:read"],
            ["POST", "/subscriptions/checkout", "Start a paid subscription or trial-to-paid.", "billing:manage"],
            ["POST", "/subscriptions/change/preview", "Proration and over-limit blockers.", "billing:manage"],
            ["POST", "/subscriptions/change", "Confirm upgrade or scheduled downgrade.", "billing:manage"],
            ["POST", "/subscriptions/cancel", "Cancel at period end or immediately.", "billing:manage"],
            ["POST", "/subscriptions/resume", "Undo a scheduled cancellation.", "billing:manage"],
            ["GET", "/subscriptions/history", "Plan and status events.", "billing:read"],
            ["GET", "/invoices", "Invoice list with status and period.", "billing:read"],
            ["GET", "/invoices/{id}", "Invoice detail and lines.", "billing:read"],
            ["GET", "/invoices/{id}/pdf", "Signed download of the invoice PDF.", "billing:read"],
            ["POST", "/payments/initialize", "Create a provider checkout session.", "billing:manage"],
            ["GET", "/payments/{id}", "Payment status, verified with the provider.", "billing:read"],
            ["GET", "/payments/methods", "Saved or available methods.", "billing:read"],
            ["POST", "/payments/{id}/refund", "Refund or credit a payment.", "billing:refund (super admin)"],
            ["POST", "/webhooks/payments/{provider}", "Provider callback; signature verified.", "Public + signature"],
        ],
        widths=[18, 59, 66, 35],
        font_size=7.0,
        line_h=3.25,
    )

    pdf.h2("8.5 Catalog and inventory")
    pdf.table(
        ["Method", "Path", "Purpose", "Permission / plan"],
        [
            ["GET", "/products", "Search the platform product master.", "inventory:read"],
            ["POST", "/products", "Create a tenant-owned product when no master exists.", "inventory:write"],
            ["GET", "/products/{id}", "Product detail and barcodes.", "inventory:read"],
            ["GET", "/products/search", "Search by name, generic name or barcode.", "inventory:read"],
            ["GET", "/product-categories", "Category list.", "inventory:read"],
            ["GET", "/inventory/items", "Pharmacy inventory with stock and status.", "inventory:read"],
            ["POST", "/inventory/items", "Add a product to a pharmacy.", "inventory:write"],
            ["GET", "/inventory/items/{id}", "Item detail with batches.", "inventory:read"],
            ["PATCH", "/inventory/items/{id}", "Update price, reorder level, status.", "inventory:write"],
            ["GET", "/inventory/items/{id}/batches", "Batches with expiry and quantity.", "inventory:read"],
            ["POST", "/inventory/items/{id}/adjustments", "Adjust stock with a reason.", "inventory:adjust"],
            ["GET", "/inventory/movements", "Ledger query by item, batch, type, date.", "inventory:read"],
            ["GET", "/inventory/alerts", "Low stock and expiring batches.", "inventory:read"],
            ["POST", "/inventory/transfers", "Transfer between pharmacies.", "inventory:write (Pro+)"],
            ["POST", "/inventory/transfers/{id}/receive", "Receive a transfer.", "inventory:write (Pro+)"],
            ["POST", "/inventory/stock-counts", "Start a stock count.", "inventory:adjust"],
            ["GET", "/inventory/valuation", "Cost and retail value by pharmacy.", "inventory:read"],
        ],
        widths=[18, 63, 61, 36],
        font_size=7.0,
        line_h=3.25,
    )

    pdf.h2("8.6 Sales, customers, orders and prescriptions")
    pdf.table(
        ["Method", "Path", "Purpose", "Permission / plan"],
        [
            ["POST", "/sales", "Complete a sale; idempotent; FEFO deduction.", "sales:write"],
            ["GET", "/sales", "Paginated sales history.", "sales:read"],
            ["GET", "/sales/{id}", "Sale, lines, payments and receipt link.", "sales:read"],
            ["POST", "/sales/{id}/void", "Void before end of day with reason.", "sales:refund"],
            ["POST", "/sales/{id}/returns", "Return or exchange items.", "sales:refund"],
            ["GET", "/sales/{id}/receipt", "Receipt PDF or signed URL.", "sales:read"],
            ["GET", "/sales/export", "CSV/Excel export (async for large ranges).", "analytics:export"],
            ["GET/POST", "/customers", "Customer search and creation.", "sales:read / sales:write"],
            ["GET/PATCH", "/customers/{id}", "Profile, credit limit, loyalty.", "sales:read / sales:write"],
            ["GET", "/orders", "Online, phone and WhatsApp orders.", "sales:read"],
            ["POST", "/orders", "Create an order from a channel.", "sales:write"],
            ["POST", "/orders/{id}/status", "Advance or cancel an order.", "sales:write"],
            ["GET/POST", "/prescriptions", "Prescription capture and items.", "sales:write + pharmacist"],
            ["POST", "/prescriptions/{id}/dispense", "Dispense against a prescription.", "sales:write + pharmacist"],
        ],
        widths=[18, 59, 65, 36],
        font_size=7.0,
        line_h=3.25,
    )

    pdf.h2("8.7 Procurement and suppliers")
    pdf.table(
        ["Method", "Path", "Purpose", "Permission / plan"],
        [
            ["GET/POST", "/suppliers", "Supplier directory.", "procurement:read / write (Pro+)"],
            ["GET/PATCH", "/suppliers/{id}", "Supplier detail and licence.", "procurement:read / write"],
            ["GET", "/suppliers/{id}/performance", "Spend, lead time, returns.", "analytics:view (Pro+)"],
            ["GET/POST", "/purchase-orders", "List or create a purchase order.", "procurement:read / write (Pro+)"],
            ["GET/PATCH", "/purchase-orders/{id}", "Detail or edit a draft.", "procurement:write (Pro+)"],
            ["POST", "/purchase-orders/{id}/submit", "Submit for approval.", "procurement:write"],
            ["POST", "/purchase-orders/{id}/approve", "Approve (maker-checker).", "procurement:approve"],
            ["POST", "/purchase-orders/{id}/cancel", "Cancel with reason.", "procurement:write"],
            ["POST", "/purchase-orders/{id}/receipts", "Receive stock into batches.", "procurement:write"],
            ["GET", "/purchase-orders/{id}/receipts", "Receipt history.", "procurement:read"],
            ["POST", "/supplier-returns", "Return goods to a supplier.", "procurement:write"],
        ],
        widths=[18, 64, 60, 36],
        font_size=7.0,
        line_h=3.25,
    )

    pdf.h2("8.8 Marketplace and wholesale")
    pdf.table(
        ["Method", "Path", "Purpose", "Permission / plan"],
        [
            ["GET", "/marketplace/products", "Browse verified supplier listings.", "marketplace:buy (Pro+)"],
            ["GET", "/marketplace/products/{id}", "Listing detail, tiers, lead time.", "marketplace:buy (Pro+)"],
            ["GET", "/marketplace/suppliers", "Verified supplier directory.", "marketplace:buy (Pro+)"],
            ["POST", "/marketplace/orders", "Place a cart order; splits by supplier.", "marketplace:buy (Pro+)"],
            ["GET", "/marketplace/orders", "Retail marketplace orders.", "marketplace:buy (Pro+)"],
            ["GET", "/marketplace/orders/{id}", "Order and sub-order status.", "marketplace:buy (Pro+)"],
            ["POST", "/marketplace/rfqs", "Request a quote for a bulk need.", "marketplace:buy (Pro+)"],
            ["POST", "/marketplace/rfqs/{id}/quotes", "Supplier quote.", "marketplace:sell"],
            ["POST", "/marketplace/reviews", "Rate a delivered order.", "marketplace:buy"],
            ["GET/POST", "/wholesale/warehouses", "Warehouse list and creation.", "marketplace:sell / limit"],
            ["GET/POST", "/wholesale/listings", "Product listings.", "marketplace:sell / listing limit"],
            ["POST", "/wholesale/listings/import", "Bulk CSV / Excel import.", "marketplace:sell (Growth+)"],
            ["GET/PATCH", "/wholesale/listings/{id}", "Edit price, stock, status.", "marketplace:sell"],
            ["GET", "/wholesale/orders", "Incoming marketplace and direct orders.", "marketplace:sell"],
            ["POST", "/wholesale/orders/{id}/accept", "Accept and reserve stock.", "marketplace:sell"],
            ["POST", "/wholesale/orders/{id}/dispatch", "Mark dispatched with tracking.", "marketplace:sell"],
            ["GET/POST", "/wholesale/customers", "Wholesale customer accounts.", "marketplace:sell"],
            ["GET/POST", "/wholesale/price-lists", "Price lists and tiers.", "marketplace:sell (Growth+)"],
            ["GET/POST", "/wholesale/invoices", "Wholesale invoices.", "marketplace:sell"],
            ["GET", "/wholesale/receivables", "Aging and outstanding balances.", "marketplace:sell (Growth+)"],
        ],
        widths=[18, 65, 58, 37],
        font_size=6.9,
        line_h=3.2,
    )

    pdf.h2("8.9 Analytics, notifications and administration")
    pdf.table(
        ["Method", "Path", "Purpose", "Permission / plan"],
        [
            ["GET", "/analytics/dashboard", "KPI cards and trend series.", "analytics:view (Pro+)"],
            ["GET", "/analytics/sales", "Revenue, profit, category, payment, hour.", "analytics:view (Pro+)"],
            ["GET", "/analytics/inventory", "Valuation, stock turns, expiry risk.", "analytics:view (Pro+)"],
            ["GET", "/analytics/workforce", "Employee sales and performance.", "analytics:view (Pro+)"],
            ["GET", "/analytics/marketplace", "Spend, suppliers, lead times.", "analytics:view (Pro+)"],
            ["GET", "/analytics/export", "Async report export.", "analytics:export"],
            ["GET/POST", "/reports/schedules", "Scheduled email reports.", "analytics:view"],
            ["GET", "/notifications", "In-app inbox.", "Authenticated"],
            ["PATCH", "/notifications/{id}/read", "Mark read.", "Authenticated"],
            ["GET/PATCH", "/notification-preferences", "Channel and event preferences.", "Authenticated"],
            ["POST", "/files", "Request a signed upload.", "Authenticated + quota"],
            ["GET", "/files/{id}/download", "Short-lived signed download.", "Owner or permission"],
            ["GET", "/admin/tenants", "Tenant list with usage and status.", "platform:admin"],
            ["GET", "/admin/tenants/{id}", "Tenant 360: plan, invoices, usage.", "platform:admin"],
            ["POST", "/admin/tenants/{id}/suspend", "Suspend a tenant with reason.", "platform:admin + MFA"],
            ["POST", "/admin/subscriptions/{id}/override", "Complimentary plan or extension.", "platform:admin + MFA"],
            ["GET", "/admin/payments", "All payments and failures.", "platform:admin"],
            ["POST", "/admin/payments/{id}/reconcile", "Re-check with the provider.", "platform:admin"],
            ["GET", "/admin/audit-logs", "Cross-tenant audit search.", "platform:admin"],
            ["GET", "/admin/metrics", "MRR, ARR, churn, GMV, active tenants.", "platform:admin"],
            ["POST", "/admin/impersonation/{tenantId}", "Short-lived, audited support token.", "platform:admin + step-up"],
            ["GET/PATCH", "/admin/feature-flags", "Rollout control.", "platform:admin"],
            ["POST", "/admin/suppliers/{id}/verify", "Approve a wholesale seller.", "platform:admin"],
        ],
        widths=[18, 70, 55, 35],
        font_size=6.9,
        line_h=3.2,
    )

    pdf.h2("8.10 Idempotency, pagination and rate limits")
    pdf.code_block(
        """POST /api/v1/sales
Idempotency-Key: 5f0c2a9e-8f1f-4f4e-9a9f-2f0c7b3d1a44
Content-Type: application/json

{
  "pharmacyId": "0192f0c4-...",
  "clientRef": "POS-2026-11-14-000123",
  "customerId": null,
  "items": [{ "inventoryItemId": "...", "quantity": 2, "unitPriceMinor": 250 }],
  "discountMinor": 0,
  "payment": { "method": "CASH", "amountMinor": 500 }
}

// Retry with the same key and body returns the original 201 response.
// Retry with the same key and a different body returns 409 IDEMPOTENCY_CONFLICT.""",
        title="Idempotent sale request",
    )
    pdf.table(
        ["Plan / route", "Sustained limit", "Burst"],
        [
            ["Login", "5 requests / minute / IP and 10 / hour / account", "Burst 10"],
            ["Password reset", "3 requests / hour / email", "Burst 3"],
            ["Retail Basic", "60 requests / minute / tenant", "Burst 30"],
            ["Retail Professional", "300 requests / minute / tenant", "Burst 90"],
            ["Retail Enterprise", "1,000 requests / minute / tenant", "Burst 200"],
            ["Wholesale Starter / Growth / Enterprise", "120 / 600 / 2,000 requests / minute", "Proportional"],
            ["Exports and reports", "5 concurrent / tenant", "Queue the rest"],
            ["Payment webhooks", "1,000 / minute / provider", "IP allowlist + signature"],
        ],
        widths=[58, 78, 42],
        font_size=7.4,
    )


# ---------------------------------------------------------------------------
# Section 9 - Security
# ---------------------------------------------------------------------------


def section_9(pdf):
    pdf.h1(9, "Authentication, authorization and security")

    pdf.h2("9.1 Threat model summary")
    pdf.table(
        ["Threat", "Example", "Primary controls"],
        [
            ["Spoofing", "Stolen password or forged token.", "MFA, short-lived JWT, refresh rotation, device sessions, anomaly alerts."],
            ["Tampering", "Changing a price, quantity or plan in the request.", "Server-side pricing, DTO validation, optimistic locking, audit trail."],
            ["Repudiation", "Denying a refund, adjustment or plan change.", "Signed audit log with actor, before/after and correlation ID."],
            ["Information disclosure", "Guessing another tenant's pharmacy ID.", "Tenant-scoped queries, RLS, 404 responses, no sequential IDs."],
            ["Denial of service", "Credential stuffing or export flood.", "Rate limits, WAF, async exports, per-tenant quotas."],
            ["Elevation of privilege", "Employee calling an owner endpoint.", "Permission checks on every service, step-up for sensitive actions."],
            ["Supply chain", "Compromised dependency or image.", "Pinned versions, Dependabot, Trivy, signed images, SBOM."],
        ],
        widths=[30, 57, 91],
        font_size=7.3,
        line_h=3.35,
    )

    pdf.h2("9.2 Token and session architecture")
    pdf.body(
        "Use short-lived signed access tokens and rotating opaque refresh tokens. The access token is a JWT signed "
        "with RS256 or EdDSA and published through JWKS so future services can verify it without sharing a secret. "
        "The refresh token is random, stored hashed, rotated on every use, and bound to a session family. Reuse of a "
        "rotated token revokes the entire family and raises a security event.",
    )
    pdf.code_block(
        """{
  "iss": "https://api.mediflow.co.tz",
  "aud": "mediflow-web",
  "sub": "0192f0c4-...",
  "sid": "0192f0d1-...",
  "tenant_id": "0192f0e2-...",
  "membership_id": "0192f0f3-...",
  "role": "RETAIL_OWNER",
  "perms_v": 7,
  "jti": "0192f104-...",
  "iat": 1763200000,
  "exp": 1763200900
}""",
        title="Access token claims",
    )
    pdf.bullet_list(
        [
            "Access token lifetime: 15 minutes. Refresh lifetime: 30 days, sliding with rotation. Absolute cap: 90 days.",
            "Never put email, phone, name or other PII in the JWT; it is readable by the client and often logged.",
            "Validate issuer, audience, signature algorithm, expiry and not-before. Reject alg=none and unexpected keys.",
            "Revocation: session id denylist in Redis until token expiry, plus permissions_version for role changes.",
            "BFF mode (recommended for the Next.js app): tokens live in HttpOnly, Secure, SameSite=Lax cookies and never reach browser JavaScript.",
            "Mobile and API clients use OAuth2 PKCE or bearer access tokens with secure storage; Enterprise API keys are hashed and scoped.",
            "Step-up authentication is required for billing changes, refunds, API key creation, data export and impersonation.",
        ],
        size=8.8,
    )

    pdf.h2("9.3 Authorization and tenant isolation")
    pdf.bullet_list(
        [
            "Authorities are checked at the service layer with @PreAuthorize; controllers are not trusted.",
            "Tenant ownership is checked separately with TenantGuard.requirePharmacy(id), requireWarehouse(id) or requireSale(id).",
            "Cross-tenant IDs return 404, not 403, to avoid revealing existence.",
            "Roles are resolved from membership + role bundle + overrides on every request; cached with permissions_version.",
            "Super admin uses platform authorities and a separate filter chain. Impersonation issues a short-lived token with act and an audit banner.",
            "Row-level security is enabled on tenant tables and the runtime DB role cannot bypass it.",
            "A dedicated isolation test suite attempts every endpoint with another tenant's identifiers on every build.",
        ],
        size=8.8,
    )

    pdf.h2("9.4 Account and password security")
    pdf.table(
        ["Control", "Implementation"],
        [
            ["Password hashing", "Argon2id (m=19456, t=2, p=1) or BCrypt cost 12 if Argon2 is unavailable."],
            ["Password policy", "Minimum 12 characters; block breached passwords via k-anonymity lookup; no forced rotation."],
            ["Reset tokens", "32-byte random, hashed at rest, single use, 30-minute expiry, invalidated on password change."],
            ["Login protection", "Per-IP and per-account rate limits; exponential delay; temporary lock after 5 failures."],
            ["MFA", "TOTP RFC 6238, 6 digits, 30-second window, 10 hashed recovery codes. Mandatory for owners and super admins."],
            ["Email verification", "Required before inviting employees or creating a pharmacy; resend is rate limited."],
            ["Session management", "List sessions with device, IP and last seen; revoke one or all; new-device email alert."],
            ["Enumeration", "Generic responses and constant-time comparisons for login and password reset."],
            ["API keys", "Hashed, prefixed (mf_live_...), scoped, expiring, rotatable, last-used timestamp."],
        ],
        widths=[37, 141],
        font_size=7.4,
    )

    pdf.h2("9.5 Transport and browser security")
    pdf.bullet_list(
        [
            "TLS 1.2+ (1.3 preferred) everywhere; HSTS max-age 1 year, includeSubDomains, preload.",
            "CSP default-src 'self'; frame-ancestors 'none'; object-src 'none'; connect-src limited to the API and provider domains.",
            "X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy locked down.",
            "CORS: explicit origins per environment, credentials only for the BFF; never wildcard with credentials.",
            "CSRF: double-submit token for cookie-authenticated state changes; SameSite=Lax or Strict; API bearer clients are exempt.",
            "No Server or X-Powered-By headers; error pages never include stack traces.",
            "Admin console on a separate hostname, optional IP allowlist, mandatory MFA and shorter session lifetime.",
        ],
        size=8.8,
    )

    pdf.h2("9.6 Input, files and integrations")
    pdf.bullet_list(
        [
            "Validate every DTO with Jakarta Validation; enforce size, enum, range and cross-field rules.",
            "Use parameterised queries or JPA; never concatenate SQL. Native queries live in repositories with named parameters.",
            "File uploads: 10 MB limit, MIME allowlist, magic-byte sniffing, ClamAV scan, strip metadata, random object key, private bucket.",
            "Never accept a user-supplied URL for server-side fetch. Webhook callbacks and provider base URLs are configured, not user-controlled.",
            "Escape output in emails and PDFs; use templating that auto-escapes. Do not render user HTML.",
            "Outbound HTTP clients have connect/read timeouts, retries with jitter, circuit breakers and a bounded connection pool.",
        ],
        size=8.8,
    )

    pdf.h2("9.7 Audit logging")
    pdf.table(
        ["Element", "Detail"],
        [
            ["Required events", "Login, logout, failed login, password reset, MFA change, invitation, role change, plan change, payment, refund, stock adjustment, sale void, price change, export, impersonation, supplier verification."],
            ["Fields", "tenant_id, actor_user_id, action, entity_type, entity_id, before/after (redacted), IP, user agent, correlation_id, created_at, hash_prev, hash."],
            ["Integrity", "Each row hashes the previous row hash plus its canonical payload. A daily anchor is written to immutable storage."],
            ["Access", "Tenant owners see their own audit log; platform admins see all; no update or delete endpoints."],
            ["Retention", "30 days Basic, 12 months Professional, 36 months Enterprise; export before purge."],
        ],
        widths=[31, 147],
        font_size=7.3,
        line_h=3.4,
    )

    pdf.h2("9.8 Secrets, keys and supply chain")
    pdf.bullet_list(
        [
            "No secrets in Git, Docker images, logs or frontend bundles. Use environment variables injected by the platform secret manager.",
            "Separate credentials per environment. Production database credentials are not available to developers.",
            "JWT signing keys rotate quarterly with a kid header and a JWKS overlap window. Encrypt data-encryption keys with a KMS key.",
            "Dependabot or Renovate for patches; OWASP dependency check and Trivy in CI; images signed and scanned before deploy.",
            "SAST (CodeQL or Semgrep) and secret scanning (gitleaks) on every pull request.",
            "Least-privilege cloud roles; object storage private by default; no public buckets.",
        ],
        size=8.8,
    )

    pdf.h2("9.9 Regulatory and privacy considerations")
    pdf.body(
        "This is engineering guidance, not legal advice. Confirm the final position with Tanzanian counsel before launch.",
    )
    pdf.table(
        ["Area", "Engineering implication"],
        [
            ["Personal Data Protection Act 2022 (Tanzania)", "Lawful basis, purpose limitation, consent where required, data subject access/export/delete, breach notification, processor agreements, retention schedule."],
            ["TMDA licensing", "Store pharmacy and supplier licence numbers and expiry; block or warn on expired licences; retain verification evidence."],
            ["Controlled medicines", "Separate register, prescriber and patient capture, immutable audit, restricted roles, export for inspection."],
            ["Prescriptions", "Retain per pharmacy regulation, access-logged, not editable after dispense; corrections are amendments."],
            ["VAT / e-TIMS", "Store tax rate and invoice lines; support fiscal receipt integration where required. Confirm the current VAT rate and e-TIMS scope with a tax adviser."],
            ["Payment card data", "Use hosted checkout or redirect; never store PAN, CVV or full card data. Target PCI DSS SAQ A."],
            ["Law enforcement requests", "Documented process, legal review, minimum disclosure, audit."],
        ],
        widths=[47, 131],
        font_size=7.3,
        line_h=3.4,
    )

    pdf.h2("9.10 Security release checklist")
    pdf.bullet_list(
        [
            "Tenant isolation suite green; no endpoint accepts a tenant_id from the request body.",
            "Authorization matrix tested for every role and every route.",
            "Dependency, container and secret scans clean or formally accepted.",
            "OWASP ZAP baseline and a focused penetration test before public launch.",
            "Backups encrypted and a restore has been performed in the last 30 days.",
            "Incident response runbook, security contact and breach notification template exist.",
            "Admin MFA enforced; default super-admin password rotated; demo accounts removed.",
            "Rate limits, lockouts and alerting verified under load.",
        ],
        size=8.7,
    )


# ---------------------------------------------------------------------------
# Section 10 - Caching and performance
# ---------------------------------------------------------------------------


def section_10(pdf):
    pdf.h1(10, "Caching and performance")

    pdf.body(
        "Caching is a correctness risk disguised as a performance feature. Cache only data that is safe to be stale, "
        "always include the tenant in the key, and always have a database path when Redis is unavailable. Never cache "
        "money movements, stock quantities or authorization decisions without an invalidation strategy.",
    )

    pdf.h2("10.1 Two-level cache")
    pdf.table(
        ["Layer", "Technology", "Scope", "Typical TTL"],
        [
            ["L1", "Caffeine in-process", "Plans, feature definitions, reference data.", "30-60 seconds"],
            ["L2", "Redis", "Entitlements, catalog pages, analytics snapshots, sessions, idempotency.", "1 minute - 24 hours"],
            ["HTTP", "ETag / Cache-Control", "Public plan catalogue and immutable assets.", "5 minutes, revalidate"],
            ["Database", "Materialised views", "Dashboard aggregates and reports.", "15 minutes"],
        ],
        widths=[18, 42, 80, 38],
        font_size=7.5,
    )

    pdf.h2("10.2 Cache key catalogue")
    pdf.table(
        ["Key pattern", "TTL", "Invalidated by"],
        [
            ["ent:v1:{tenantId}", "15 min", "Plan change, cancellation, admin override, permission change."],
            ["plan:v1:{planId}", "1 hour", "Plan or price edit (rare; publish new version)."],
            ["catalog:v1:{tenantId}:{hash(filters)}", "10 min", "Product or price update in that tenant."],
            ["analytics:v1:{tenantId}:{pharmacyId}:{range}", "5 min", "Scheduled refresh or manual refresh."],
            ["session:v1:{sessionId}", "Until expiry", "Logout, revoke, password change."],
            ["denylist:jti:{jti}", "Until token expiry", "Logout or forced revocation."],
            ["idem:v1:{tenantId}:{key}", "24 hours", "Expiry only."],
            ["rl:v1:{scope}:{id}", "Window", "Counter increment."],
            ["lock:job:{name}", "30-120 sec", "Job completion or timeout."],
            ["public:plans:v1:{audience}", "5 min", "Plan catalogue publish."],
        ],
        widths=[67, 27, 84],
        font_size=7.4,
    )
    pdf.small(
        "Hash the full filter set into catalog and analytics keys. Never build a key from raw user input without "
        "normalising and length-limiting it. Prefix keys with a version so a schema change can invalidate everything "
        "by bumping the version.",
    )

    pdf.h2("10.3 Invalidation and stampede control")
    pdf.bullet_list(
        [
            "Invalidate after commit, not inside the transaction: use @TransactionalEventListener(phase = AFTER_COMMIT).",
            "Publish invalidation events on Redis pub/sub so every instance clears its L1 cache.",
            "Use @Cacheable(sync = true) plus a short Redis lock for expensive keys to prevent a stampede.",
            "Add jitter (0-20%) to TTLs so keys do not expire together.",
            "Cache negative lookups briefly (30 seconds) to protect against probing, but never cache authorisation denials for long.",
            "On Redis failure: log, fall back to the database, and keep login rate limits fail-closed.",
            "Never cache PII, prescription details, payment payloads or raw tokens.",
        ],
        size=8.8,
    )

    pdf.h2("10.4 Analytics performance")
    pdf.table(
        ["Query", "Source", "Target"],
        [
            ["Dashboard KPIs", "mv_daily_sales + mv_inventory_valuation", "< 150 ms cached, < 600 ms cold"],
            ["Revenue trend", "daily_sales_facts indexed by (tenant_id, date)", "< 300 ms"],
            ["Category mix", "daily_product_facts", "< 300 ms"],
            ["Payment mix", "daily_payment_facts", "< 200 ms"],
            ["Top products", "daily_product_facts ranked", "< 300 ms"],
            ["Employee performance", "daily_sales_facts by cashier", "< 400 ms"],
            ["Inventory valuation", "inventory_snapshots or live aggregate", "< 500 ms"],
            ["Export", "Async job -> S3 signed URL", "Queued, email when ready"],
        ],
        widths=[38, 86, 54],
        font_size=7.4,
    )
    pdf.code_block(
        """CREATE MATERIALIZED VIEW mv_daily_sales AS
SELECT tenant_id, pharmacy_id, date_trunc('day', completed_at) AS day,
       count(*) AS sales_count,
       sum(total_minor) AS revenue_minor,
       sum(cost_minor) AS cost_minor,
       sum(total_minor - cost_minor) AS gross_profit_minor
FROM sales
WHERE status = 'COMPLETED' AND deleted_at IS NULL
GROUP BY tenant_id, pharmacy_id, day;

CREATE UNIQUE INDEX ON mv_daily_sales (tenant_id, pharmacy_id, day);
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales;  (scheduled, on replica)""",
        title="Pre-aggregation pattern",
    )

    pdf.h2("10.5 Hot-path budgets")
    pdf.table(
        ["Operation", "p95 target", "Notes"],
        [
            ["Login", "300 ms", "Argon2 cost is deliberate; do not optimise it away."],
            ["Product search", "200 ms", "Trigram index; limit result size."],
            ["POS checkout", "400 ms", "Row locks on batches; keep the transaction short."],
            ["Sales history page", "250 ms", "Cursor pagination; composite index."],
            ["Dashboard (cached)", "200 ms", "Serve the last snapshot with freshness timestamp."],
            ["Dashboard (cold)", "800 ms", "Materialised views; acceptable on first load."],
            ["Payment webhook ack", "2 s", "Verify, persist, enqueue; process asynchronously."],
            ["Report export", "Async", "Never hold an HTTP request for a large export."],
        ],
        widths=[45, 30, 103],
        font_size=7.4,
    )


# ---------------------------------------------------------------------------
# Section 11 - Payments
# ---------------------------------------------------------------------------


def section_11(pdf):
    pdf.h1(11, "Payments and third-party gateways")

    pdf.body(
        "Payments are the highest-risk integration in the product. The design goal is not 'support Snippe'; it is "
        "'support any provider without rewriting billing'. Billing owns invoices, money and state. The provider "
        "adapter owns transport, signatures and status translation. No controller ever calls a provider SDK directly.",
    )

    pdf.h2("11.1 Ports and adapters")
    pdf.code_block(
        """public interface PaymentGateway {
    PaymentProvider provider();
    CheckoutSession initialize(CheckoutRequest request);
    PaymentVerification verify(String providerReference);
    RefundResult refund(RefundRequest request);
    WebhookEvent parseWebhook(byte[] rawBody, Map<String, String> headers);
}

public record CheckoutRequest(
    UUID tenantId, UUID invoiceId, long amountMinor, String currency,
    PaymentMethod method, String customerName, String customerPhone,
    String description, String callbackUrl, String idempotencyKey,
    Map<String, String> metadata) {}

public record CheckoutSession(
    PaymentProvider provider, String providerRef, PaymentStatus status,
    String redirectUrl, String instructions, Instant expiresAt) {}

public record WebhookEvent(
    PaymentProvider provider, String eventId, String type, String providerRef,
    long amountMinor, String currency, PaymentStatus status,
    Instant occurredAt, String rawPayload, boolean signatureValid) {}""",
        title="Provider-agnostic payment port",
    )
    pdf.body(
        "The registry maps a provider enum to its implementation. Adding a provider means adding one adapter, one "
        "properties class, one signature verifier and one test fixture set. It does not mean touching subscription, "
        "invoice or entitlement code.",
    )
    pdf.code_block(
        """@Component
public class PaymentGatewayRegistry {
    private final Map<PaymentProvider, PaymentGateway> gateways;

    public PaymentGatewayRegistry(List<PaymentGateway> implementations) {
        this.gateways = implementations.stream()
            .collect(Collectors.toUnmodifiableMap(PaymentGateway::provider, Function.identity()));
    }

    public PaymentGateway get(PaymentProvider provider) {
        PaymentGateway gateway = gateways.get(provider);
        if (gateway == null) throw new AppException(ErrorCode.PROVIDER_NOT_CONFIGURED);
        return gateway;
    }
}""",
        title="Gateway registry",
    )

    pdf.h2("11.2 Configuration")
    pdf.code_block(
        """mediflow:
  payments:
    default-provider: snippe
    callback-base-url: ${APP_BASE_URL}/settings/billing/callback
    providers:
      snippe:
        enabled: ${SNIPPE_ENABLED:false}
        base-url: ${SNIPPE_BASE_URL:https://api.snippe.example}
        api-key: ${SNIPPE_API_KEY:}
        webhook-secret: ${SNIPPE_WEBHOOK_SECRET:}
        timeout: 15s
      manual-bank:
        enabled: true
        instructions: "Bank: ... Account: ... Reference: invoice number"
      stripe:
        enabled: ${STRIPE_ENABLED:false}
        secret-key: ${STRIPE_SECRET_KEY:}
        webhook-secret: ${STRIPE_WEBHOOK_SECRET:}""",
        title="Provider configuration (application.yml)",
    )
    pdf.small(
        "Never commit real secrets. The YAML references environment variables; production values come from the platform "
        "secret manager. A missing or disabled provider returns 503 PROVIDER_NOT_CONFIGURED, not a crash.",
    )

    pdf.h2("11.3 Snippe adapter checklist")
    pdf.bullet_list(
        [
            "Map the plan invoice to a provider collection/checkout request: amount in TZS, currency, customer name and phone, invoice number as the reference, and a callback URL.",
            "Send an idempotency key derived from invoice id + attempt so a retry does not create a second charge.",
            "Store the provider reference and the raw initialisation response; never store the API key in logs.",
            "Translate provider statuses into the internal enum: INITIATED, PENDING, PAID, FAILED, EXPIRED, REFUNDED, DISPUTED.",
            "Verify the webhook signature over the raw body with the shared secret and a timestamp tolerance; use constant-time comparison.",
            "Persist the raw event before processing, unique on (provider, event_id). Return 200 quickly and process asynchronously.",
            "Independently verify the transaction with the provider API before activating a plan. A webhook alone is not proof of settlement.",
            "Support refunds if the provider exposes them; otherwise record a manual refund and an account credit.",
            "Add a reconciliation endpoint or settlement report for the daily job.",
            "Test against the sandbox with real mobile-money flows for M-Pesa, Tigo Pesa, Airtel Money and bank/card where supported.",
        ],
        size=8.7,
    )
    pdf.callout(
        "Provider-specific details change; the port does not",
        "Snippe, Selcom, Flutterwave, DPO, Stripe and mobile-network aggregators differ in payloads, signatures, "
        "settlement timing and refund support. Keep those differences inside the adapter and its mapper. The billing "
        "engine should only see a verified amount, currency, status and reference.",
        tone="amber",
    )

    pdf.h2("11.4 Checkout sequence")
    for i, step in enumerate(
        [
            "The owner chooses a plan and confirms the prorated amount.",
            "Billing creates an OPEN invoice with lines and a payment row in INITIATED state, in one transaction.",
            "The payment service calls the selected gateway with an idempotency key and the invoice reference.",
            "The gateway returns a checkout URL or instructions; the API returns it to the client and stores the provider reference.",
            "The customer pays on the provider page or completes the mobile-money prompt.",
            "The provider redirects the browser back. This is a UX hint only; the backend does not trust it.",
            "The provider sends a signed webhook. The endpoint verifies, persists and acknowledges within two seconds.",
            "The async handler verifies the transaction, marks the payment PAID, the invoice PAID and writes ledger entries.",
            "The subscription is activated or renewed; entitlements are invalidated; a receipt is emailed.",
            "The subscription event and audit log are written. The customer sees the new limits immediately.",
            "A reconciliation job re-checks any payment still pending after 10 minutes and alerts on mismatches.",
        ],
        start=1,
    ):
        pdf.numbered(i, step, size=8.6)

    pdf.h2("11.5 Webhook processing")
    pdf.code_block(
        """@PostMapping(path = "/webhooks/payments/{provider}", consumes = MediaType.ALL_VALUE)
public ResponseEntity<Void> handle(
        @PathVariable String provider,
        @RequestBody byte[] rawBody,
        @RequestHeader Map<String, String> headers) {

    PaymentGateway gateway = registry.get(PaymentProvider.from(provider));
    WebhookEvent event = gateway.parseWebhook(rawBody, headers); // verifies signature
    webhookIngest.ingest(event); // unique(provider, event_id), stores raw payload, enqueues
    return ResponseEntity.ok().build();
}

@Transactional
public void ingest(WebhookEvent event) {
    if (webhookRepository.existsByProviderAndProviderEventId(
            event.provider(), event.eventId())) return;
    webhookRepository.save(WebhookEventEntity.from(event));
    outbox.publish(new PaymentWebhookReceived(event));
}""",
        title="Webhook endpoint",
    )
    pdf.bullet_list(
        [
            "Read the raw body as bytes. Parsing and re-serialising JSON breaks signatures.",
            "Return 2xx only after the event is durably stored. A 5xx triggers provider retries, which is desirable for transient failures.",
            "Deduplicate on (provider, provider_event_id) and make the handler idempotent on the payment reference.",
            "Reject events whose amount, currency or reference do not match the invoice. Alert and do not activate.",
            "Keep a dead-letter view for signature failures, unknown references and amount mismatches; the super admin can inspect and replay.",
            "Never log the full payload if it contains customer data; log the event id, type, reference and status.",
        ],
        size=8.7,
    )

    pdf.h2("11.6 Invoices, tax, receipts and refunds")
    pdf.table(
        ["Concern", "Rule"],
        [
            ["Invoice numbering", "Human-readable (INV-2026-000123), unique per tenant, generated in a transaction from a sequence. Gaps are acceptable; duplicates are not."],
            ["Invoice lines", "Plan subscription, add-ons, proration credit, proration charge, tax. Store description, quantity, unit amount and tax rate snapshot."],
            ["Tax", "Store tax_rate and tax_amount on each line. Confirm the current VAT treatment with a Tanzanian tax adviser; do not hard-code a rate in the domain."],
            ["Currency", "TZS for all plans. If a provider requires a different currency, convert at the provider rate and store both amounts and the rate."],
            ["Receipts", "Generate a PDF after payment, store it privately and email a link. Receipts are immutable; corrections are credit notes."],
            ["Refunds", "Refund to the original method where supported; otherwise issue an account credit. Require a reason, approver and audit log."],
            ["Chargebacks", "Mark the payment DISPUTED, freeze the subscription only after investigation, and retain evidence (invoice, usage, terms acceptance)."],
            ["Reconciliation", "Daily: provider settlement total vs payments marked PAID. Investigate every difference; never silently adjust the ledger."],
            ["Revenue recognition", "For annual prepayment, recognise monthly revenue in reporting; keep deferred revenue separate from cash collected."],
        ],
        widths=[32, 146],
        font_size=7.3,
        line_h=3.4,
    )

    pdf.h2("11.7 PCI and payment security")
    pdf.bullet_list(
        [
            "Use hosted checkout or redirect. Never let card data touch the MediFlow frontend or backend; target PCI DSS SAQ A.",
            "Do not store PAN, CVV, full track data or provider API secrets in the database.",
            "Verify webhook signatures, enforce timestamp tolerance, and allowlist provider IPs where published.",
            "Use HTTPS only; no payment link over email without a signed, expiring token.",
            "Restrict provider dashboard access to finance roles with MFA.",
            "Test refunds, partial payments, duplicate webhooks, late webhooks and amount tampering before launch.",
        ],
        size=8.8,
    )


# ---------------------------------------------------------------------------
# Section 12 - Subscription and billing engine
# ---------------------------------------------------------------------------


def section_12(pdf):
    pdf.h1(12, "Subscription and billing engine")

    pdf.h2("12.1 End-to-end flow")
    pdf.code_block(
        """Plan catalogue -> Subscription -> Invoice -> Payment -> Entitlements
       |                |             |          |
       |                |             |          +-> receipt, ledger, notification
       |                |             +-> dunning, grace, cancellation
       |                +-> trial, renewal, plan change, add-ons
       +-> features, limits, prices (versioned)""",
        title="Billing data flow",
    )

    pdf.h2("12.2 Plan change algorithm")
    pdf.code_block(
        """@Transactional
public ChangePreview previewChange(UUID tenantId, UUID targetPlanPriceId) {
    Subscription sub = subscriptionRepo.findActiveForUpdate(tenantId); // SELECT ... FOR UPDATE
    PlanPrice target = planPriceRepo.get(targetPlanPriceId);
    PlanPrice current = sub.getPlanPrice();

    require(target.getPlan().getAudience() == sub.getPlan().getAudience());

    int totalDays = daysBetween(sub.getPeriodStart(), sub.getPeriodEnd());
    int remainingDays = daysBetween(Instant.now(), sub.getPeriodEnd());
    long credit = prorate(current.getAmountMinor(), remainingDays, totalDays);
    long charge = prorate(target.getAmountMinor(), remainingDays, totalDays);
    long net = charge - credit;

    List<LimitBlocker> blockers = usageService.blockersFor(target.getPlan(), tenantId);

    return new ChangePreview(current, target, credit, charge, net,
        sub.getPeriodEnd(), blockers, blockers.isEmpty());
}

long prorate(long amountMinor, int remainingDays, int totalDays) {
    return BigDecimal.valueOf(amountMinor)
        .multiply(BigDecimal.valueOf(remainingDays))
        .divide(BigDecimal.valueOf(totalDays), 0, RoundingMode.HALF_UP)
        .longValueExact();
}""",
        title="Proration and change preview",
    )
    pdf.bullet_list(
        [
            "Upgrade applies immediately: update plan_price_id, keep period end, invoice the net amount if positive, apply a credit if negative.",
            "Downgrade schedules: store scheduled_plan_price_id and effective_at = current_period_end; apply in the renewal job.",
            "Immediate downgrade: allowed only if blockers are empty or the owner has chosen which resources stay active.",
            "Every change writes a subscription_event with actor, reason, amounts and the previous/next plan.",
            "The entitlement cache key is invalidated after commit; the next request resolves the new plan.",
        ],
        size=8.7,
    )

    pdf.h2("12.3 Downgrade over-limit policy")
    pdf.table(
        ["Resource", "If current usage exceeds target", "Owner experience"],
        [
            ["Pharmacies", "All remain in the database; excess pharmacies become read-only.", "Choose which pharmacies stay active in the downgrade preview."],
            ["Employee seats", "Excess memberships stay but cannot perform write actions.", "Deactivate or reassign within 30 days."],
            ["Listings", "Excess listings are paused, not deleted.", "Bulk pause screen with filters."],
            ["Warehouses", "Excess warehouses become read-only.", "Choose active warehouses."],
            ["Storage", "Uploads blocked above the new quota; existing files remain.", "Export or delete files; show usage breakdown."],
        ],
        widths=[35, 88, 55],
        font_size=7.3,
    )
    pdf.small(
        "Deleting tenant data on downgrade is unacceptable. Read-only is reversible and preserves the audit trail. "
        "The UI must explain why a button is disabled and link to the upgrade or cleanup screen.",
    )

    pdf.h2("12.4 Invoicing and dunning")
    pdf.table(
        ["Day", "Event", "Access"],
        [
            ["-3", "Renewal invoice generated and emailed.", "Active"],
            ["0", "Charge attempted; failure moves subscription to PAST_DUE.", "Full + banner"],
            ["1, 3, 5, 7", "Automatic retries with the same idempotency key.", "Full or grace"],
            ["10", "Grace ends; subscription becomes READ_ONLY.", "Read/export only"],
            ["24", "Read-only period ends; subscription SUSPENDED.", "Login + billing only"],
            ["54", "Dunning exhausted; subscription CANCELED.", "Export window"],
            ["+90", "Data purge after cancellation, unless legal hold.", "No access"],
        ],
        widths=[22, 100, 56],
        font_size=7.4,
    )
    pdf.body(
        "The exact intervals are configuration, not code. Store them in plan or billing settings so the business can "
        "change them without a deployment. Always communicate the next action and the exact date to the customer.",
    )

    pdf.h2("12.5 Seat and usage counting rules")
    pdf.table(
        ["Limit", "Counts", "Does not count"],
        [
            ["Pharmacies", "Active pharmacies in the tenant.", "Archived or soft-deleted pharmacies."],
            ["Employee seats", "Active employee profiles per pharmacy + pending invitations.", "Owner membership; deactivated employees."],
            ["Warehouses", "Active warehouses.", "Archived warehouses."],
            ["Listings", "ACTIVE listings only.", "Drafts, paused or archived listings."],
            ["Storage", "Bytes in the private bucket attributed to the tenant.", "Provider-side temporary uploads older than 24 hours."],
        ],
        widths=[35, 86, 57],
        font_size=7.4,
    )
    pdf.body(
        "Count at the moment of the write and reconcile daily. For seats and pharmacies, take a tenant-scoped advisory "
        "lock before counting so two concurrent invitations cannot both take the last seat. Pending invitations count "
        "until accepted or expired, otherwise a tenant can over-invite and then accept everyone.",
    )

    pdf.h2("12.6 Platform metrics")
    pdf.table(
        ["Metric", "Definition", "Use"],
        [
            ["MRR", "Sum of active monthly-normalised subscription value, excluding tax.", "Revenue trend."],
            ["ARR", "MRR x 12.", "Board reporting."],
            ["Net revenue retention", "Cohort revenue this month / same cohort last month, including expansion and churn.", "Product-market fit."],
            ["Logo churn", "Canceled tenants / tenants at start of period.", "Retention."],
            ["Trial conversion", "Trials converted to paid / trials ended.", "Onboarding quality."],
            ["ARPU", "MRR / active paying tenants.", "Pricing."],
            ["GMV", "Marketplace order value settled.", "Marketplace health."],
            ["Payment success rate", "PAID payments / attempted payments.", "Provider and UX health."],
            ["Dunning recovery", "Recovered past-due tenants / past-due tenants.", "Billing operations."],
        ],
        widths=[38, 96, 44],
        font_size=7.3,
    )
    pdf.callout(
        "Never calculate billing state from the UI",
        "The frontend can show a countdown, but only the backend decides whether a feature is available. A customer with "
        "an expired card must not be able to keep writing data because the browser cached an old entitlement response.",
        tone="red",
    )


# ---------------------------------------------------------------------------
# Section 13 - Storage, notifications and integrations
# ---------------------------------------------------------------------------


def section_13(pdf):
    pdf.h1(13, "Files, notifications and integrations")

    pdf.h2("13.1 File storage")
    pdf.table(
        ["Concern", "Decision"],
        [
            ["Provider", "S3-compatible object storage (AWS S3, Cloudflare R2, Wasabi or MinIO locally)."],
            ["Buckets", "private (receipts, invoices, imports, attachments), quarantine (pre-scan uploads), public (optional logos only)."],
            ["Upload flow", "Client requests a signed PUT URL; uploads directly; API confirms and scans; object moves to private."],
            ["Validation", "10 MB default, MIME allowlist, magic-byte check, image dimensions, PDF page limit, ClamAV scan."],
            ["Naming", "Random object key; original filename stored as metadata only; never trust or execute the filename."],
            ["Access", "Signed GET URLs valid for 5-15 minutes; authorisation checked before signing."],
            ["Quotas", "Per-plan storage bytes; reconcile daily; block uploads above quota."],
            ["Retention", "Receipts and invoices retained with the financial record; imports deleted after 30 days."],
        ],
        widths=[31, 147],
        font_size=7.4,
    )

    pdf.h2("13.2 Notification events")
    pdf.table(
        ["Event", "Channels", "Recipient", "Notes"],
        [
            ["Email verification", "Email", "New user", "Required before inviting staff."],
            ["Invitation", "Email + in-app", "Invitee", "Expires in 7 days; resend rate limited."],
            ["Password reset", "Email", "User", "Single use, 30 minutes."],
            ["New device login", "Email", "User", "Security alert with session revoke link."],
            ["Trial ending", "Email + in-app", "Owner", "7, 3 and 1 day before."],
            ["Payment receipt", "Email", "Owner", "PDF attachment or signed link."],
            ["Renewal failed", "Email + in-app", "Owner", "Retry schedule and update-payment link."],
            ["Subscription changed", "Email", "Owner", "Proration and effective date."],
            ["Subscription canceled", "Email", "Owner", "Export window and data retention notice."],
            ["Low stock / expiry", "In-app + email digest", "Inventory role", "Daily digest; configurable threshold."],
            ["New online order", "In-app + SMS/WhatsApp", "Pharmacy staff", "Opt-in; never block order creation."],
            ["Marketplace order", "In-app + email", "Wholesale staff", "Accept/dispatch reminders."],
            ["Weekly report", "Email", "Owner", "Plan-gated; scheduled PDF/CSV."],
            ["Security event", "Email", "Owner + platform", "Impersonation, mass export, repeated failures."],
        ],
        widths=[38, 42, 35, 63],
        font_size=7.2,
        line_h=3.3,
    )
    pdf.bullet_list(
        [
            "Transactional messages (verification, reset, receipt) cannot be disabled. Marketing preferences are separate.",
            "Store templates in the repository with versioned HTML and text alternatives; render with auto-escaping.",
            "Every send writes a message_log row with provider id, status, attempts and error. Retry transient failures.",
            "Respect quiet hours for non-critical SMS; queue until the next business window.",
            "SMS and WhatsApp cost money: enforce per-plan bundles and rate limits, and show remaining balance to the owner.",
        ],
        size=8.7,
    )

    pdf.h2("13.3 Integration adapters")
    pdf.table(
        ["Integration", "Purpose", "Priority", "Design"],
        [
            ["Snippe / mobile money", "Subscription payments.", "P0", "PaymentGateway adapter."],
            ["Email provider", "Transactional email.", "P0", "SmtpSender or API sender behind EmailPort."],
            ["SMS provider", "OTP, order alerts, receipts.", "P1", "SmsPort adapter with delivery log."],
            ["WhatsApp Business", "Order and receipt messages.", "P1", "WhatsAppPort adapter."],
            ["e-TIMS", "Fiscal receipts where required.", "P2", "TaxReceiptPort; queue failures."],
            ["Insurance / NHIF", "Claim submission and status.", "P2", "ClaimPort; separate claim aggregate."],
            ["Accounting export", "QuickBooks/Xero CSV.", "P2", "Export job, no live sync in v1."],
            ["Public API / webhooks", "Enterprise integrations.", "P2", "API keys, scopes, signed outbound webhooks."],
        ],
        widths=[40, 54, 14, 70],
        font_size=7.3,
    )

    pdf.h2("13.4 Feature flags")
    pdf.body(
        "Use feature flags for incomplete modules, beta features and emergency kill switches. Flags are evaluated server-side "
        "and may be global, per tenant or per plan. Never use a flag to hide a security control. Log every flag evaluation "
        "for a sensitive feature so support can reproduce what the customer saw.",
    )


# ---------------------------------------------------------------------------
# Section 14 - Background jobs
# ---------------------------------------------------------------------------


def section_14(pdf):
    pdf.h1(14, "Background jobs and schedules")

    pdf.body(
        "Jobs are part of the product. Each one needs an owner, an idempotency key, a lock, a metric and a runbook. "
        "Use ShedLock so only one instance runs a given job, and design every job to be safe to re-run.",
    )
    pdf.table(
        ["Job", "Cadence", "Purpose", "Idempotency / safety"],
        [
            ["outbox-relay", "Every 1-2 s", "Publish pending domain events.", "SKIP LOCKED; event id unique."],
            ["invoice-generator", "Daily 00:10", "Create renewal invoices 3 days ahead.", "Unique(subscription, period)."],
            ["renewal-charger", "Daily 01:00", "Charge open invoices via provider.", "Idempotency key per invoice attempt."],
            ["dunning", "Daily 02:00", "Retry, grace, read-only and suspension transitions.", "State machine guard."],
            ["payment-reconciler", "Every 15 min", "Re-check pending payments and settlements.", "Provider reference unique."],
            ["trial-expiry", "Hourly", "End trials and notify.", "Trial end timestamp."],
            ["analytics-refresh", "Every 15 min", "Refresh materialised views on replica.", "Concurrent refresh; freshness timestamp."],
            ["low-stock-digest", "Daily 07:00", "Alert on reorder levels.", "Per tenant per day."],
            ["expiry-alert", "Daily 07:15", "90/60/30-day expiry alerts and write-off candidates.", "Per batch per threshold."],
            ["scheduled-reports", "Per schedule", "Email weekly/monthly reports.", "Report run id."],
            ["storage-usage", "Daily 03:00", "Recalculate bytes per tenant and enforce quota.", "Recompute from object metadata."],
            ["session-cleanup", "Daily 04:00", "Delete expired refresh tokens and idempotency keys.", "Expiry index."],
            ["audit-archive", "Monthly", "Anchor audit hash and archive partitions.", "Manifest + checksum."],
            ["marketplace-reminder", "Daily 08:00", "Nudge unfulfilled sub-orders.", "Per sub-order per day."],
            ["webhook-retry", "Backoff", "Retry failed outbound webhooks.", "Event id + attempt."],
        ],
        widths=[35, 28, 66, 49],
        font_size=7.1,
        line_h=3.25,
    )
    pdf.small(
        "Job failures must alert. A silent invoice job means revenue loss; a silent expiry job means regulatory risk. "
        "Expose last-success and lag per job on the admin dashboard.",
    )


# ---------------------------------------------------------------------------
# Section 15 - Observability
# ---------------------------------------------------------------------------


def section_15(pdf):
    pdf.h1(15, "Observability and operations")

    pdf.body(
        "You cannot operate a billing system from console logs. Every request, job, payment and stock movement must be "
        "traceable from a correlation ID to a metric and a log line. Build this in phase 1; retrofitting observability "
        "during an incident is expensive.",
    )

    pdf.h2("15.1 Logs, metrics and traces")
    pdf.table(
        ["Signal", "Implementation", "Rules"],
        [
            ["Logs", "Logback JSON encoder, one line per event, MDC context.", "Include correlationId, tenantId, userId (hashed), route, status, duration. Never log tokens, passwords, card data or full PII."],
            ["Metrics", "Micrometer + Prometheus registry.", "HTTP latency, error rate, JVM, HikariCP, Redis, cache hit ratio, job lag, payment success, subscription counts."],
            ["Traces", "OpenTelemetry auto-instrumentation.", "HTTP, JDBC, Redis and outbound HTTP spans; W3C traceparent propagation; 100% of errors sampled."],
            ["Business events", "Structured audit + outbox.", "Plan changes, payments, refunds, stock adjustments, impersonation, exports."],
            ["Health", "/actuator/health/liveness and /readiness.", "Liveness has no external dependency; readiness checks DB and Redis. Details are protected."],
        ],
        widths=[25, 64, 89],
        font_size=7.2,
        line_h=3.35,
    )

    pdf.h2("15.2 Key metrics")
    pdf.table(
        ["Metric", "Type", "Why it matters"],
        [
            ["http_server_requests_seconds", "Histogram", "Latency and error rate by route and status."],
            ["hikaricp_connections_active / pending", "Gauge", "Connection pool saturation before it becomes an outage."],
            ["lettuce_command_latency", "Timer", "Redis health; cache is on the hot path."],
            ["cache_gets_total{result}", "Counter", "Hit ratio; a low ratio means wasted Redis cost."],
            ["job_last_success_timestamp", "Gauge", "Silent job failure detection."],
            ["outbox_pending_events", "Gauge", "Event backlog; a growing number means relay trouble."],
            ["payments_total{provider,status}", "Counter", "Provider health and conversion."],
            ["webhook_processing_seconds", "Histogram", "Provider callback latency and lag."],
            ["subscriptions_by_status", "Gauge", "Trial, active, past due, churn."],
            ["sales_total_minor{tenant}", "Counter", "Business volume without querying OLTP."],
            ["marketplace_gmv_minor", "Gauge", "Marketplace health."],
            ["login_failures_total", "Counter", "Credential stuffing and lockout spikes."],
        ],
        widths=[62, 25, 91],
        font_size=7.3,
    )

    pdf.h2("15.3 Alerts")
    pdf.table(
        ["Condition", "Severity", "Action"],
        [
            ["5xx rate > 1% for 5 minutes", "P1", "Page on-call; roll back if a release correlates."],
            ["p95 latency > 800 ms for 10 minutes", "P2", "Check DB pool, slow queries, Redis and provider timeouts."],
            ["DB connections > 80% for 5 minutes", "P1", "Scale, add PgBouncer, kill long queries."],
            ["Redis unavailable", "P1", "Failover; verify rate limits and sessions."],
            ["Payment success rate < 90% for 15 minutes", "P1", "Check provider status; switch to fallback provider if configured."],
            ["Webhook lag > 5 minutes", "P1", "Check endpoint health, queue and provider retries."],
            ["Outbox pending > 1,000 or oldest > 10 minutes", "P2", "Restart relay, inspect dead letters."],
            ["Job not successful in 2x its cadence", "P2", "Run manually, check ShedLock and logs."],
            ["Backup failed or restore test overdue", "P1", "Fix before the next release."],
            ["Certificate expires in < 14 days", "P2", "Renew and verify chain."],
            ["Login failure spike by IP or account", "P2", "Block IP, notify security, review lockouts."],
        ],
        widths=[78, 18, 82],
        font_size=7.3,
    )

    pdf.h2("15.4 SLOs and runbooks")
    pdf.table(
        ["Service level", "Target", "Measurement"],
        [
            ["API availability", "99.9% monthly", "Successful non-5xx responses / total (excluding maintenance)."],
            ["Core read latency", "p95 < 300 ms", "Inventory list, sales history, dashboard cached."],
            ["Checkout latency", "p95 < 400 ms", "POST /sales server time."],
            ["Webhook acknowledgement", "p95 < 2 s", "Request duration at the provider endpoint."],
            ["Analytics freshness", "< 20 minutes", "now - dataFreshness for the dashboard."],
            ["Recovery point objective", "15 minutes", "PostgreSQL PITR window."],
            ["Recovery time objective", "2 hours", "Restore drill measured end to end."],
        ],
        widths=[45, 35, 98],
        font_size=7.4,
    )
    pdf.bullet_list(
        [
            "Runbooks: payment provider outage, webhook backlog, database failover, Redis loss, tenant suspension, data export request, security incident, rollback.",
            "Every alert links to a runbook and an owner. Alerts without an action are noise and should be deleted.",
            "Incident process: declare severity, assign commander, communicate status, preserve evidence, write a blameless postmortem within 5 days.",
            "Status page for customers; separate internal channel for platform incidents.",
        ],
        size=8.7,
    )


# ---------------------------------------------------------------------------
# Section 16 - Testing
# ---------------------------------------------------------------------------


def section_16(pdf):
    pdf.h1(16, "Testing strategy")

    pdf.body(
        "The test suite is the safety net for money and stock. Optimise for fast feedback on domain rules and realistic "
        "integration tests for transactions, tenancy and payments. Coverage is a signal, not a goal; a 90% suite that "
        "misses cross-tenant access is worthless.",
    )

    pdf.h2("16.1 Test pyramid")
    pdf.table(
        ["Level", "Tools", "Scope", "Target"],
        [
            ["Unit", "JUnit 5, AssertJ, Mockito", "Domain rules, pricing, proration, FEFO allocation, limit checks.", "Fast; 70% line coverage overall, 85% in billing/inventory/security."],
            ["Integration", "Testcontainers PostgreSQL + Redis, Flyway", "Repositories, transactions, RLS, outbox, webhook ingest.", "Every critical flow; real schema, no H2."],
            ["Contract", "REST Assured, OpenAPI schema validation", "Request/response shape, status codes, error codes.", "Every endpoint; run in CI."],
            ["End-to-end", "Playwright against a seeded API", "Login, invite, sell, receive stock, subscribe, cancel.", "Happy paths plus one failure per flow."],
            ["Security", "OWASP ZAP, authz matrix, gitleaks, Trivy", "Auth bypass, tenant leak, injection, dependency risk.", "Every release."],
            ["Performance", "k6", "Login, catalog, POS checkout, dashboard, webhook burst.", "Before launch and after major queries."],
            ["Chaos", "Toxiproxy or provider stubs", "Redis loss, provider timeout, duplicate webhooks, replica lag.", "Before launch."],
        ],
        widths=[25, 55, 62, 36],
        font_size=7.2,
        line_h=3.35,
    )

    pdf.h2("16.2 Mandatory test suites")
    pdf.bullet_list(
        [
            "Tenant isolation: seed tenants A and B; for every endpoint, authenticate A and request B's IDs; expect 404 and no side effects. Also assert list endpoints never return B rows.",
            "Authorization matrix: every role against every route; expected allow/deny. Generate the matrix from the permission model, not hand-written guesses.",
            "Billing: trial-to-paid, upgrade, downgrade at period end, immediate downgrade with blockers, cancellation, resume, failed renewal, grace, read-only, suspension.",
            "Proration: leap-day, month-end, 28/30/31-day periods, zero remaining days, credit larger than charge, rounding.",
            "Inventory: FEFO order, insufficient stock, expired batch, concurrent sales of the last unit, return to a valid/invalid batch, transfer in transit.",
            "Payments: valid webhook, invalid signature, duplicate event, late event, amount mismatch, unknown invoice, refund, chargeback, provider timeout.",
            "Limits: concurrent invitations for the last seat, concurrent pharmacy creation, downgrade over-limit, storage quota.",
            "Migrations: apply all migrations to an empty database and to a restored snapshot; verify constraints and indexes.",
        ],
        size=8.7,
    )

    pdf.h2("16.3 Test data and environments")
    pdf.table(
        ["Need", "Approach"],
        [
            ["Realistic catalog", "Seed 200+ products with categories, units, barcodes and manufacturers."],
            ["Multi-tenant fixtures", "Two retail tenants, one wholesale tenant, overlapping emails and product names."],
            ["Time control", "Inject Clock; freeze time for billing and expiry tests; never sleep in tests."],
            ["Provider stubs", "WireMock fixtures for Snippe and other adapters; one sandbox smoke test per release."],
            ["Large data", "Generate 100k sales and 500k movements for query-plan and pagination tests."],
            ["PII", "Never copy production PII into staging; anonymise emails, phones and names."],
        ],
        widths=[38, 140],
        font_size=7.4,
    )

    pdf.h2("16.4 Definition of done")
    pdf.bullet_list(
        [
            "Code reviewed and merged through a pull request with green CI.",
            "Unit and integration tests cover the new behaviour and the failure paths.",
            "Flyway migration is reversible in practice (expand/contract), with a backup plan.",
            "OpenAPI updated; error codes documented; frontend contract confirmed.",
            "Authorization and tenant isolation tests pass for the new route.",
            "Audit event, metric and alert exist for any sensitive operation.",
            "Runbook updated for any new job, provider or operational dependency.",
            "Feature flag and rollback path documented for risky changes.",
        ],
        size=8.7,
    )


# ---------------------------------------------------------------------------
# Section 17 - DevOps
# ---------------------------------------------------------------------------


def section_17(pdf):
    pdf.h1(17, "DevOps, deployment and disaster recovery")

    pdf.h2("17.1 Environments")
    pdf.table(
        ["Environment", "Purpose", "Data", "Payments", "Access"],
        [
            ["local", "Developer inner loop.", "Docker Postgres + Redis; seed data.", "Sandbox or fake gateway.", "Developer machine."],
            ["dev", "Continuous deployment from main.", "Reset weekly; synthetic data.", "Sandbox.", "Engineering."],
            ["staging", "Production-like UAT and load tests.", "Anonymised snapshot; reset monthly.", "Sandbox.", "Engineering + QA + product."],
            ["production", "Customers and revenue.", "Live; PITR; restricted access.", "Live providers.", "Break-glass only, MFA, audited."],
        ],
        widths=[24, 58, 45, 26, 25],
        font_size=7.2,
        line_h=3.3,
    )

    pdf.h2("17.2 CI/CD pipeline")
    pdf.code_block(
        """Pull request
  1. checkout + setup Java 21 + Maven cache
  2. spotless:check, compile, architecture tests
  3. unit tests
  4. integration tests (Testcontainers PostgreSQL + Redis)
  5. SAST, dependency check, secret scan
  6. OpenAPI diff and API contract tests
  7. build jar + docker image + Trivy scan

Merge to main
  8. push image to GHCR with immutable tag + SBOM
  9. deploy to dev, run smoke tests
 10. deploy to staging, run migrations + E2E + k6 smoke

Release
 11. manual approval with checklist
 12. backup + migration job
 13. rolling deploy (or blue/green) to production
 14. post-deploy smoke, error-rate watch, rollback if needed""",
        title="Pipeline stages",
    )

    pdf.h2("17.3 Container and local stack")
    pdf.code_block(
        """FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -q -DskipTests dependency:go-offline
COPY src src
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
RUN useradd -r -u 1001 mediflow
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
USER 1001
EXPOSE 8080
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75","-jar","/app/app.jar"]

# compose.yml services:
#   postgres:16  redis:7  mailpit  minio  api
#   healthchecks on postgres/redis; api waits for healthy""",
        title="Dockerfile and local stack",
    )

    pdf.h2("17.4 Infrastructure shape")
    pdf.bullet_list(
        [
            "Cloudflare in front for TLS, WAF, DDoS and basic rate limiting; origin restricted to the load balancer.",
            "Two or more stateless API instances across availability zones behind a managed load balancer.",
            "Managed PostgreSQL with automated backups, point-in-time recovery and a read replica for analytics.",
            "Managed Redis with persistence appropriate to cache/session use; no business data only in Redis.",
            "Private S3-compatible bucket with lifecycle rules and versioning for receipts and imports.",
            "Observability: hosted Prometheus/Grafana or a managed APM; Sentry for exceptions; log retention 30-90 days.",
            "Choose a region with acceptable latency to Tanzania (Cape Town or eu-west) and test real mobile-network latency.",
        ],
        size=8.7,
    )

    pdf.h2("17.5 Migrations and releases")
    pdf.bullet_list(
        [
            "Expand/contract only. Add columns nullable, backfill in batches, dual-write, switch reads, drop later.",
            "Run Flyway as a separate job before the new image; the app validates but does not migrate in production.",
            "Take a backup or verify PITR before a migration that rewrites a large table.",
            "Use feature flags for behaviour changes so the image can roll back without a schema rollback.",
            "Rollback plan: previous image + forward-compatible schema + feature flag off. Never rely on a destructive down migration.",
            "Release during low-traffic hours for the first three months; publish a maintenance notice for migrations > 30 seconds.",
        ],
        size=8.7,
    )

    pdf.h2("17.6 Backup and disaster recovery")
    pdf.table(
        ["Asset", "Backup", "Frequency", "Restore target"],
        [
            ["PostgreSQL", "PITR + daily snapshot", "Continuous + daily", "RPO 15 min, RTO 2 h"],
            ["Object storage", "Versioning + cross-region copy", "Continuous", "RPO 1 h"],
            ["Redis", "No authoritative data", "N/A", "Rebuild cache; sessions re-login"],
            ["Secrets", "Secret manager versioning + sealed offline copy", "On change", "RTO 1 h"],
            ["Infrastructure", "Terraform or documented runbook", "On change", "RTO 4 h"],
            ["Audit anchor", "Immutable storage", "Daily", "Retained 7 years"],
        ],
        widths=[31, 70, 38, 39],
        font_size=7.3,
    )
    pdf.callout(
        "A backup you have not restored is a hope",
        "Run a restore drill every month: restore the latest snapshot into an isolated environment, run the migration "
        "validation and a smoke test, record the time, then delete the environment. Put the result in the ops log.",
        tone="red",
    )

    pdf.h2("17.7 Indicative running cost")
    pdf.table(
        ["Item", "Pilot (monthly)", "Growth (monthly)", "Notes"],
        [
            ["API hosting", "USD 30-80", "USD 150-400", "2 instances, autoscaling."],
            ["Managed PostgreSQL", "USD 20-60", "USD 150-500", "PITR, replica, storage."],
            ["Managed Redis", "USD 10-30", "USD 50-150", "Cache and rate limits."],
            ["Object storage", "USD 5-20", "USD 30-100", "Receipts and exports."],
            ["Email / SMS", "USD 0-30", "USD 100-500", "SMS is usage-based; bundle and charge."],
            ["Observability", "USD 0-30", "USD 100-300", "Start with open-source + hosted free tier."],
            ["Domain / TLS / CDN", "USD 5-20", "USD 50-200", "Cloudflare."],
            ["Total infrastructure", "USD 70-270", "USD 630-2,150", "Excludes payment provider fees and staff."],
        ],
        widths=[40, 35, 35, 68],
        font_size=7.3,
    )
    pdf.small(
        "Payment provider fees are separate and usually a percentage of GMV or a flat mobile-money fee. "
        "Model them into plan margins before setting wholesale commission.",
    )


# ---------------------------------------------------------------------------
# Section 18 - File structure
# ---------------------------------------------------------------------------


def section_18(pdf):
    pdf.h1(18, "Backend file and package structure")

    pdf.body(
        "Create this structure on day one. It is package-by-feature, with a small shared kernel. Every module owns its "
        "controllers, application services, domain model, repositories and adapters. Cross-module access goes through "
        "the public application service or a domain event.",
    )

    pdf.code_block(
        """mediflow-api/
+-- .github/workflows/            ci.yml, deploy-staging.yml, deploy-prod.yml
+-- .mvn/wrapper/                 Maven wrapper
+-- docs/                        architecture.md, adr/, api/, runbooks/, security/
+-- src/main/java/com/mediflow/
|   +-- MediFlowApplication.java
|   +-- common/
|   |   +-- api/                 ApiResponse, ApiError, PageResponse, CursorPage
|   |   +-- error/               AppException, ErrorCode, GlobalExceptionHandler
|   |   +-- audit/               Audited, AuditAspect, AuditLogService
|   |   +-- domain/              BaseEntity, TenantEntity, Money, PhoneNumber
|   |   +-- event/               DomainEvent, OutboxPublisher, OutboxRelay
|   |   +-- idempotency/         Idempotent, IdempotencyService, IdempotencyFilter
|   |   +-- security/            CurrentUser, SecurityUtils, Permissions
|   |   +-- tenancy/             TenantContext, TenantFilter, TenantGuard
|   |   +-- validation/          ValidPhone, ValidCurrency, ValidDateRange
|   |   +-- util/                Hashing, ClockProvider, CsvWriter
|   +-- config/
|   |   +-- SecurityConfig.java          JwtProperties.java
|   |   +-- CorsConfig.java              CacheConfig.java
|   |   +-- RedisConfig.java             JacksonConfig.java
|   |   +-- OpenApiConfig.java           AsyncConfig.java
|   |   +-- SchedulingConfig.java        WebConfig.java
|   |   +-- StorageConfig.java           PaymentConfig.java
|   +-- identity/
|   |   +-- api/                 AuthController, UserController, MfaController
|   |   +-- application/         AuthService, TokenService, MfaService, PasswordResetService
|   |   +-- domain/              User, RefreshToken, PasswordResetToken, MfaSecret
|   |   +-- infrastructure/      UserRepository, RefreshTokenRepository, JwtTokenProvider
|   |   +-- dto/                 LoginRequest, TokenResponse, RegisterRequest, UserResponse
|   +-- tenant/
|   |   +-- api/                 TenantController, MembershipController, InvitationController
|   |   +-- application/         TenantService, MembershipService, InvitationService, UsageService
|   |   +-- domain/              Tenant, Membership, Invitation, TenantType, MembershipRole
|   |   +-- infrastructure/      TenantRepository, MembershipRepository, InvitationRepository
|   +-- plan/
|   |   +-- api/                 PlanController, AdminPlanController
|   |   +-- application/         PlanCatalogService, EntitlementService, LimitService
|   |   +-- domain/              Plan, PlanPrice, PlanFeature, PlanLimit, Feature, LimitKey
|   |   +-- infrastructure/      PlanRepository, PlanPriceRepository, EntitlementCache
|   +-- subscription/
|   |   +-- api/                 SubscriptionController, AdminSubscriptionController
|   |   +-- application/         SubscriptionService, ProrationService, DunningService
|   |   +-- domain/              Subscription, SubscriptionStatus, SubscriptionEvent, AddOn
|   |   +-- infrastructure/      SubscriptionRepository, SubscriptionEventRepository
|   +-- billing/
|   |   +-- api/                 InvoiceController, PaymentController, WebhookController
|   |   +-- application/         InvoiceService, PaymentService, RefundService, ReconciliationJob
|   |   +-- domain/              Invoice, InvoiceLine, Payment, PaymentEvent, Refund, LedgerEntry
|   |   +-- infrastructure/      InvoiceRepository, PaymentRepository, WebhookRepository
|   +-- payment/
|   |   +-- PaymentGateway.java          PaymentGatewayRegistry.java
|   |   +-- model/                       CheckoutRequest, CheckoutSession, WebhookEvent
|   |   +-- provider/snippe/             SnippeGateway, SnippeProperties, SnippeSignatureVerifier
|   |   +-- provider/manual/             ManualBankTransferGateway
|   |   +-- provider/sandbox/            SandboxGateway
|   +-- pharmacy/
|   |   +-- api/                 PharmacyController, PharmacySettingsController
|   |   +-- application/         PharmacyService, PharmacyOnboardingService
|   |   +-- domain/              Pharmacy, PharmacySettings, PharmacyLicence, OperatingHours
|   |   +-- infrastructure/      PharmacyRepository, PharmacySettingsRepository
|   +-- catalog/
|   |   +-- api/                 ProductController, CategoryController, ManufacturerController
|   |   +-- application/         ProductService, ProductSearchService, ProductImportService
|   |   +-- domain/              Product, ProductCategory, Manufacturer, ProductBarcode, UnitOfMeasure
|   |   +-- infrastructure/      ProductRepository, ProductSearchRepository
|   +-- inventory/
|   |   +-- api/                 InventoryController, BatchController, StockMovementController
|   |   |                        StockTransferController, StockCountController
|   |   +-- application/         InventoryService, BatchService, StockLedgerService
|   |   |                        FefoAllocator, StockTransferService, ExpiryService
|   |   +-- domain/              InventoryItem, Batch, StockMovement, StockMovementType
|   |   |                        StockTransfer, StockCount, ReorderRule
|   |   +-- infrastructure/      InventoryItemRepository, BatchRepository, StockMovementRepository
|   +-- sales/
|   |   +-- api/                 SaleController, CustomerController, ReturnController, ReceiptController
|   |   +-- application/         SaleService, CheckoutService, ReturnService, PricingService
|   |   |                        DiscountService, ReceiptService, PrescriptionService
|   |   +-- domain/              Sale, SaleItem, SalePayment, Customer, SalesReturn, Receipt, Prescription
|   |   +-- infrastructure/      SaleRepository, CustomerRepository, ReturnRepository
|   +-- procurement/
|   |   +-- api/                 SupplierController, PurchaseOrderController, GoodsReceiptController
|   |   +-- application/         SupplierService, PurchaseOrderService, GoodsReceiptService
|   |   |                        ReplenishmentService, SupplierReturnService
|   |   +-- domain/              Supplier, PurchaseOrder, PurchaseOrderItem, GoodsReceipt, SupplierReturn
|   |   +-- infrastructure/      SupplierRepository, PurchaseOrderRepository, GoodsReceiptRepository
|   +-- marketplace/
|   |   +-- api/                 MarketplaceController, ListingController, MarketplaceOrderController
|   |   |                        RfqController, ReviewController
|   |   +-- application/         MarketplaceCatalogService, MarketplaceOrderService
|   |   |                        RfqService, CommissionService, SupplierVerificationService
|   |   +-- domain/              Listing, PriceTier, MarketplaceOrder, MarketplaceSubOrder
|   |   |                        Rfq, Quote, Review, Commission
|   |   +-- infrastructure/      ListingRepository, MarketplaceOrderRepository
|   +-- wholesale/
|   |   +-- api/                 WarehouseController, WholesaleOrderController
|   |   |                        WholesaleInvoiceController, PriceListController
|   |   +-- application/         WarehouseService, WholesaleOrderService, PriceListService
|   |   |                        ReceivablesService, WholesaleAnalyticsService
|   |   +-- domain/              Warehouse, WholesaleCustomer, PriceList, SalesOrder
|   |   |                        WholesaleInvoice, CreditNote, DeliveryNote
|   |   +-- infrastructure/      WarehouseRepository, WholesaleOrderRepository
|   +-- workforce/
|   |   +-- api/                 EmployeeController, ShiftController, AttendanceController
|   |   +-- application/         EmployeeService, SeatLimitService, ShiftService
|   |   |                        AttendanceService, EmployeePerformanceService
|   |   +-- domain/              EmployeeProfile, JobRole, Shift, Attendance, PerformanceSnapshot
|   |   +-- infrastructure/      EmployeeRepository, ShiftRepository, AttendanceRepository
|   +-- analytics/
|   |   +-- api/                 AnalyticsController, ReportController, ExportController
|   |   +-- application/         DashboardQueryService, SalesAnalyticsService
|   |   |                        InventoryAnalyticsService, WorkforceAnalyticsService
|   |   |                        ReportExportService, AggregateRefreshJob
|   |   +-- domain/              DailySalesFact, DailyProductFact, AnalyticsSnapshot
|   |   +-- infrastructure/      AnalyticsJdbcRepository, MaterializedViewRefresher
|   +-- notification/
|   |   +-- api/                 NotificationController, PreferenceController
|   |   +-- application/         NotificationService, EmailSender, SmsSender, WhatsAppSender
|   |   +-- domain/              Notification, NotificationPreference, NotificationTemplate
|   |   +-- infrastructure/      NotificationRepository, MailAdapter, SmsAdapter
|   +-- storage/
|   |   +-- api/                 FileController
|   |   +-- application/         FileService, UploadPolicy, AntivirusScanner
|   |   +-- domain/              StoredFile, FileStatus
|   |   +-- infrastructure/      S3Storage, LocalStorage
|   +-- admin/
|   |   +-- api/                 SuperAdminController, TenantAdminController
|   |   |                        ImpersonationController, PlatformMetricsController
|   |   +-- application/         PlatformOverviewService, TenantProvisioningService
|   |   |                        ImpersonationService, FeatureFlagService, SupportService
|   |   +-- domain/              FeatureFlag, SupportTicket, PlatformMetric
|   |   +-- infrastructure/      FeatureFlagRepository, PlatformMetricRepository
|   +-- integration/
|       +-- tax/                 TaxReceiptPort, EtimsAdapter
|       +-- insurance/           ClaimPort
|       +-- sms/                 SmsPort
+-- src/main/resources/
|   +-- application.yml
|   +-- application-dev.yml      application-staging.yml      application-prod.yml
|   +-- db/migration/            V1__extensions.sql ... V15__indexes.sql
|   +-- db/seed/                 R__seed_plans.sql, R__seed_reference.sql
|   +-- templates/email/         welcome.html, invitation.html, receipt.html
|   +-- templates/sms/           otp.txt, order-ready.txt
|   +-- logback-spring.xml
|   +-- messages/messages.properties
+-- src/test/java/com/mediflow/
|   +-- architecture/            ModuleBoundaryTest
|   +-- identity/                AuthFlowIT, TokenRotationTest
|   +-- tenancy/                 TenantIsolationIT, MembershipAccessTest
|   +-- plan/                    EntitlementResolutionTest, LimitEnforcementTest
|   +-- subscription/            ProrationTest, DowngradePlanTest, DunningTest
|   +-- billing/                 InvoiceGenerationTest, PaymentWebhookIT
|   +-- inventory/               FefoAllocationTest, StockConcurrencyIT
|   +-- sales/                   CheckoutIT, ReturnFlowTest
|   +-- procurement/             GoodsReceiptIT
|   +-- marketplace/             OrderSplitTest, CommissionTest
|   +-- wholesale/               PriceListTest, ReceivablesTest
|   +-- analytics/               DashboardQueryIT
|   +-- admin/                   ImpersonationAuditIT
|   +-- testdata/                TenantFixtures, ProductFixtures, PaymentFixtures
+-- src/test/resources/
|   +-- application-test.yml
|   +-- fixtures/payments/       snippe-paid.json, snippe-failed.json, snippe-invalid-signature.json
+-- pom.xml
+-- Dockerfile
+-- compose.yml
+-- .env.example
+-- Makefile
+-- README.md""",
        title="Repository tree",
        size=6.5,
        line_h=3.15,
    )

    pdf.h2("18.1 Module responsibilities")
    pdf.table(
        ["Package", "Public entry point", "Owns"],
        [
            ["identity", "AuthService", "Users, credentials, tokens, MFA, sessions."],
            ["tenant", "TenantService, MembershipService", "Tenants, memberships, invitations, usage counts."],
            ["plan", "EntitlementService", "Plans, prices, features, limits, resolution and cache."],
            ["subscription", "SubscriptionService, ProrationService", "Trial, renewal, change, cancellation, dunning."],
            ["billing", "InvoiceService, PaymentService", "Invoices, payments, refunds, ledger, reconciliation."],
            ["payment", "PaymentGatewayRegistry", "Provider adapters, signature verification, status mapping."],
            ["pharmacy", "PharmacyService", "Locations, settings, licences, operating hours."],
            ["catalog", "ProductService", "Global product master and search."],
            ["inventory", "InventoryService, StockLedgerService", "Items, batches, movements, transfers, counts, valuation."],
            ["sales", "SaleService, CheckoutService", "POS, returns, customers, prescriptions, receipts."],
            ["procurement", "PurchaseOrderService", "Suppliers, purchase orders, goods receipts, returns."],
            ["marketplace", "MarketplaceOrderService", "Listings, orders, sub-orders, RFQs, reviews, commission."],
            ["wholesale", "WholesaleOrderService", "Warehouses, price lists, invoices, receivables."],
            ["workforce", "EmployeeService", "Profiles, seats, shifts, attendance, performance."],
            ["analytics", "DashboardQueryService", "Facts, materialised views, reports, exports."],
            ["notification", "NotificationService", "In-app, email, SMS, WhatsApp, preferences, delivery log."],
            ["storage", "FileService", "Signed uploads/downloads, scanning, quotas."],
            ["admin", "PlatformOverviewService", "Tenant 360, overrides, verification, flags, impersonation."],
            ["integration", "Ports", "Tax, insurance and SMS adapters."],
        ],
        widths=[27, 63, 88],
        font_size=7.2,
        line_h=3.3,
    )

    pdf.h2("18.2 Environment variables")
    pdf.table(
        ["Variable", "Purpose", "Example / note"],
        [
            ["DB_URL", "JDBC URL for PostgreSQL.", "jdbc:postgresql://host:5432/mediflow"],
            ["DB_USER / DB_PASSWORD", "Runtime database role (RLS enforced).", "Never the migration role."],
            ["REDIS_URL", "Redis connection.", "rediss://... for TLS."],
            ["JWT_ISSUER / JWT_AUDIENCE", "Token validation.", "https://api.mediflow.co.tz / mediflow-web"],
            ["JWT_PRIVATE_KEY / JWT_PUBLIC_KEY", "RS256 or EdDSA signing.", "PEM in secret manager; rotate with kid."],
            ["JWT_ACCESS_TTL / REFRESH_TTL", "Session lifetimes.", "15m / 30d."],
            ["MFA_ENCRYPTION_KEY", "Encrypt TOTP secrets at rest.", "32-byte base64; KMS-managed."],
            ["APP_BASE_URL", "Links in emails and callbacks.", "https://app.mediflow.co.tz"],
            ["CORS_ORIGINS", "Allowed browser origins.", "Exact list, comma separated."],
            ["PAYMENT_DEFAULT_PROVIDER", "Default gateway.", "snippe"],
            ["SNIPPE_API_KEY / SNIPPE_WEBHOOK_SECRET", "Snippe credentials.", "From secret manager only."],
            ["SMTP_HOST / SMTP_USER / SMTP_PASSWORD", "Transactional email.", "Use a provider with delivery webhooks."],
            ["SMS_API_KEY / SMS_SENDER_ID", "SMS provider.", "Beem, Africa's Talking or Twilio."],
            ["S3_ENDPOINT / S3_BUCKET / S3_ACCESS_KEY / S3_SECRET_KEY", "Object storage.", "Private bucket; no public ACL."],
            ["SENTRY_DSN", "Exception tracking.", "Optional in local."],
            ["OTEL_EXPORTER_OTLP_ENDPOINT", "Traces and metrics.", "Collector endpoint."],
        ],
        widths=[57, 56, 65],
        font_size=7.0,
        line_h=3.25,
    )

    pdf.h2("18.3 Naming conventions")
    pdf.bullet_list(
        [
            "Packages: lowercase, feature first (inventory, sales), then api/application/domain/infrastructure.",
            "Classes: *Controller, *Service, *Repository, *Mapper, *Properties, *Job; entities are nouns without a suffix.",
            "DTOs: records in dto/ with Request/Response suffixes; never expose entities.",
            "Tables: plural snake_case; columns snake_case; FKs <entity>_id; indexes ix_<table>_<columns>.",
            "Migrations: V<number>__<snake_case>.sql; repeatable seeds R__<name>.sql.",
            "API paths: plural nouns, kebab-case only for compound words, actions as sub-resources (/cancel, /approve).",
            "Errors: stable machine codes in SCREAMING_SNAKE_CASE; never change a published code.",
            "Tests: *Test for unit, *IT for integration, *E2ETest for end-to-end.",
        ],
        size=8.7,
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    pdf = RoadmapPDF()
    pdf.cover_page()
    pdf.document_control()
    pdf.contents()

    section_1(pdf)
    section_2(pdf)
    section_3(pdf)
    section_4(pdf)
    section_5(pdf)
    section_6(pdf)
    section_7(pdf)
    section_8(pdf)
    section_9(pdf)
    section_10(pdf)
    section_11(pdf)
    section_12(pdf)
    section_13(pdf)
    section_14(pdf)
    section_15(pdf)
    section_16(pdf)
    section_17(pdf)
    section_18(pdf)

    output = "MediFlow_SaaS_Backend_Roadmap.pdf"
    pdf.output(output)
    print("Generated:", output)


if __name__ == "__main__":
    main()
