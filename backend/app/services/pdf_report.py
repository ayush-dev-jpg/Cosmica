# app/services/pdf_report.py
# PDF report generation for Vedic astrology readings

from fpdf import FPDF
from datetime import datetime
from app.services.prediction import fetch_your_knowledge, build_kundli_description
from app.api.dasha import calculate_dashas, find_current_dasha
from app.core.config import settings
import httpx
import re


def sanitize(text: str) -> str:
    """Replace Unicode chars that Helvetica can't render with ASCII equivalents."""
    replacements = {
        '\u2501': '-', '\u2500': '-', '\u2503': '|',  # box drawing
        '\u2550': '=', '\u2551': '|',
        '\u2022': '-', '\u2023': '-', '\u2043': '-',  # bullets
        '\u25cf': '-', '\u25cb': 'o', '\u25aa': '-',
        '\u2713': 'v', '\u2714': 'v', '\u2717': 'x',  # checkmarks
        '\u2018': "'", '\u2019': "'", '\u201c': '"', '\u201d': '"',  # smart quotes
        '\u2013': '-', '\u2014': '--', '\u2026': '...',  # dashes, ellipsis
        '\u2192': '->', '\u2190': '<-',  # arrows
        '\u25b6': '>', '\u25c0': '<',
        '\u2605': '*', '\u2606': '*', '\u2b50': '*',  # stars
        '\u00a0': ' ',  # non-breaking space
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # Strip any remaining non-Latin1 chars (except common accented letters)
    result = []
    for ch in text:
        try:
            ch.encode('latin-1')
            result.append(ch)
        except UnicodeEncodeError:
            result.append(' ')
    return ''.join(result)

# ── Report configurations ────────────────────────────────────

REPORT_CONFIGS = {
    "career": {
        "title": "Career & Professional Life Report",
        "subtitle": "Vedic insights into your professional path and financial destiny",
        "key_houses": [2, 6, 10, 11],
        "key_planets": ["Sun", "Saturn", "Mercury", "Jupiter"],
        "sections": "Career Strengths, Current Professional Phase, Suitable Industries & Fields, Timing for Career Moves, Financial Outlook, Professional Guidance",
    },
    "marriage": {
        "title": "Marriage & Relationship Report",
        "subtitle": "Vedic insights into love, partnership, and family life",
        "key_houses": [2, 5, 7, 8],
        "key_planets": ["Venus", "Jupiter", "Moon", "Mars"],
        "sections": "Relationship Nature & Personality, Partner Qualities, Timing for Marriage, Compatibility Factors, Family & Children, Relationship Guidance",
    },
    "health": {
        "title": "Health & Wellness Report",
        "subtitle": "Vedic insights into vitality, wellness, and longevity",
        "key_houses": [1, 6, 8, 12],
        "key_planets": ["Sun", "Moon", "Mars", "Saturn"],
        "sections": "Constitutional Strength, Vulnerable Areas, Mental Wellness, Favorable Healing Periods, Preventive Guidance, Lifestyle Recommendations",
    },
    "general": {
        "title": "Complete Life Overview Report",
        "subtitle": "A comprehensive Vedic reading of your life journey",
        "key_houses": list(range(1, 13)),
        "key_planets": ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"],
        "sections": "Personality & Self, Family & Education, Career & Wealth, Relationships & Marriage, Health & Longevity, Spirituality & Dharma, Key Life Periods",
    },
}

# ── Colors ────────────────────────────────────────────────────

PURPLE = (168, 85, 247)
DARK_BG = (15, 12, 26)
GOLD = (245, 158, 11)
WHITE = (255, 255, 255)
LIGHT_GRAY = (245, 245, 250)
DARK_TEXT = (30, 30, 40)
MEDIUM_TEXT = (100, 100, 120)
HIGHLIGHT_BG = (240, 230, 255)

# ── PDF class ─────────────────────────────────────────────────

class CosmicaPDFReport(FPDF):
    def __init__(self, report_type="general"):
        super().__init__()
        self.report_type = report_type
        self.config = REPORT_CONFIGS.get(report_type, REPORT_CONFIGS["general"])
        self.set_auto_page_break(auto=True, margin=25)

    def cell(self, w=None, h=None, text='', **kwargs):
        if 'txt' in kwargs:
            kwargs['txt'] = sanitize(str(kwargs['txt']))
        return super().cell(w, h, sanitize(str(text)) if text else text, **kwargs)

    def multi_cell(self, w=None, h=None, text='', **kwargs):
        if 'txt' in kwargs:
            kwargs['txt'] = sanitize(str(kwargs['txt']))
        return super().multi_cell(w, h, sanitize(str(text)) if text else text, **kwargs)

    def header(self):
        # Purple header banner
        self.set_fill_color(*DARK_BG)
        self.rect(0, 0, 210, 32, 'F')
        self.set_fill_color(*PURPLE)
        self.rect(0, 32, 210, 2, 'F')

        # Title
        self.set_font('Helvetica', 'B', 20)
        self.set_text_color(*WHITE)
        self.set_xy(10, 6)
        self.cell(0, 10, 'COSMICA', align='L')

        # Subtitle
        self.set_font('Helvetica', '', 9)
        self.set_text_color(200, 200, 210)
        self.set_xy(10, 17)
        self.cell(0, 8, self.config["title"], align='L')

        # Date
        self.set_font('Helvetica', '', 8)
        self.set_xy(10, 24)
        self.cell(0, 6, f'Generated: {datetime.now().strftime("%d %B %Y")}', align='L')

        self.ln(38)

    def footer(self):
        self.set_y(-20)
        self.set_font('Helvetica', 'I', 7)
        self.set_text_color(*MEDIUM_TEXT)
        self.cell(0, 8, f'Page {self.page_no()}/{{nb}}', align='C')
        self.ln(4)
        self.cell(0, 6, 'Generated by Cosmica - Vedic Astrology Platform', align='C')

    def section_title(self, title):
        if self.get_y() > 260:
            self.add_page()
        self.ln(4)
        self.set_fill_color(*PURPLE)
        self.rect(10, self.get_y(), 3, 8, 'F')
        self.set_font('Helvetica', 'B', 13)
        self.set_text_color(*DARK_TEXT)
        self.set_x(16)
        self.cell(0, 8, title)
        self.ln(10)

    def add_birth_details(self, person_name, birth_details):
        self.section_title("Birth Details")

        self.set_fill_color(*LIGHT_GRAY)
        y_start = self.get_y()
        self.rect(10, y_start, 190, 28, 'F')

        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(*DARK_TEXT)
        self.set_xy(14, y_start + 3)
        self.cell(90, 7, f'Name: {person_name}')
        self.set_xy(110, y_start + 3)
        self.set_font('Helvetica', '', 10)
        self.cell(90, 7, f'Date: {birth_details.get("date", "N/A")}')

        self.set_xy(14, y_start + 12)
        self.cell(90, 7, f'Time: {birth_details.get("time", "N/A")}')
        self.set_xy(110, y_start + 12)
        city = birth_details.get("city", "")
        country = birth_details.get("country", "")
        self.cell(90, 7, f'Place: {city}, {country}')

        self.set_y(y_start + 32)

    def add_chart_summary(self, kundli):
        self.section_title("Cosmic Summary")

        nakshatra = kundli.get("nakshatra", {})
        rows = [
            ("Nakshatra (Birth Star)", f'{nakshatra.get("name", "N/A")} - Pada {nakshatra.get("pada", "N/A")}'),
            ("Nakshatra Ruler", nakshatra.get("ruler", "N/A")),
            ("Ruling Deity", nakshatra.get("deity", "N/A")),
            ("Moon Rashi", kundli.get("moon_rashi", "N/A")),
            ("Sun Rashi", kundli.get("sun_rashi", "N/A")),
            ("Lagna (Ascendant)", f'{kundli.get("lagna", {}).get("name", "N/A")} ({kundli.get("lagna", {}).get("english", "")})'),
        ]

        for i, (label, value) in enumerate(rows):
            if i % 2 == 0:
                self.set_fill_color(*LIGHT_GRAY)
            else:
                self.set_fill_color(*WHITE)
            self.set_font('Helvetica', 'B', 9)
            self.set_text_color(*DARK_TEXT)
            self.set_x(10)
            self.cell(60, 8, f'  {label}', fill=True)
            self.set_font('Helvetica', '', 9)
            self.set_text_color(80, 80, 100)
            self.cell(130, 8, f'  {value}', fill=True)
            self.ln()

        self.ln(4)

    def add_planetary_table(self, kundli):
        self.section_title("Planetary Positions")

        key_planets = self.config["key_planets"]
        planets = kundli.get("planetary_positions", {})
        house_positions = kundli.get("house_positions", {})

        # Table header
        self.set_fill_color(*DARK_BG)
        self.set_text_color(*WHITE)
        self.set_font('Helvetica', 'B', 9)
        self.set_x(10)
        self.cell(35, 8, '  Planet', fill=True)
        self.cell(35, 8, '  Rashi', fill=True)
        self.cell(30, 8, '  Degree', fill=True)
        self.cell(25, 8, '  House', fill=True)
        self.cell(25, 8, '  Nakshatra', fill=True)
        self.cell(20, 8, '  Retro', fill=True)
        self.ln()

        # Table rows
        for planet, data in planets.items():
            is_key = planet in key_planets
            if is_key:
                self.set_fill_color(*HIGHLIGHT_BG)
            else:
                self.set_fill_color(*WHITE)

            self.set_text_color(*DARK_TEXT)
            self.set_font('Helvetica', 'B' if is_key else '', 9)
            self.set_x(10)
            marker = " *" if is_key else "  "
            self.cell(35, 7, f'{marker}{planet}', fill=True)
            self.set_font('Helvetica', '', 9)
            self.cell(35, 7, f'  {data.get("rashi", "N/A")}', fill=True)
            deg = data.get("degree_in_rashi", 0)
            self.cell(30, 7, f'  {deg:.1f}', fill=True)
            house = house_positions.get(planet, "N/A")
            self.cell(25, 7, f'  {house}', fill=True)
            nak = data.get("nakshatra", "N/A")
            self.cell(25, 7, f'  {nak[:8]}' if isinstance(nak, str) and len(nak) > 8 else f'  {nak}', fill=True)
            retro = "Yes" if data.get("retrograde") else "No"
            self.cell(20, 7, f'  {retro}', fill=True)
            self.ln()

        self.set_font('Helvetica', 'I', 7)
        self.set_text_color(*MEDIUM_TEXT)
        self.set_x(10)
        self.cell(0, 6, f'* Highlighted planets are especially significant for your {self.report_type} reading')
        self.ln(8)

    def add_reading(self, reading_text):
        self.section_title("Your Vedic Reading")

        self.set_font('Helvetica', '', 10)
        self.set_text_color(*DARK_TEXT)

        # Parse basic markdown from AI output
        lines = reading_text.split('\n')
        for line in lines:
            stripped = line.strip()
            if not stripped:
                self.ln(3)
                continue

            # Headers (## or **Header**)
            if stripped.startswith('## '):
                if self.get_y() > 260:
                    self.add_page()
                self.ln(2)
                self.set_font('Helvetica', 'B', 11)
                self.set_text_color(*PURPLE)
                clean = stripped.lstrip('# ').strip()
                self.set_x(10)
                self.multi_cell(190, 7, clean)
                self.set_text_color(*DARK_TEXT)
                self.set_font('Helvetica', '', 10)
                self.ln(1)
            elif stripped.startswith('### '):
                self.ln(1)
                self.set_font('Helvetica', 'B', 10)
                clean = stripped.lstrip('# ').strip()
                self.set_x(10)
                self.multi_cell(190, 6, clean)
                self.set_font('Helvetica', '', 10)
            elif stripped.startswith('---'):
                self.ln(2)
                self.set_draw_color(*PURPLE)
                self.line(10, self.get_y(), 200, self.get_y())
                self.ln(4)
            elif stripped.startswith('- ') or stripped.startswith('* '):
                text = stripped[2:].strip()
                text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
                self.set_x(14)
                self.set_font('Helvetica', '', 9)
                self.cell(4, 6, '-')
                self.multi_cell(182, 6, f' {text}')
            else:
                # Regular paragraph — strip bold markers
                clean = re.sub(r'\*\*(.*?)\*\*', r'\1', stripped)
                self.set_x(10)
                self.multi_cell(190, 6, clean)

    def add_dasha_summary(self, dashas, current_maha, current_antar):
        self.section_title("Current Dasha Period")

        if current_maha:
            self.set_fill_color(*LIGHT_GRAY)
            y = self.get_y()
            self.rect(10, y, 190, 24, 'F')

            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(*DARK_TEXT)
            self.set_xy(14, y + 2)
            planet = current_maha.get("planet", "N/A")
            self.cell(0, 7, f'Mahadasha: {planet} ({current_maha.get("start", "")} to {current_maha.get("end", "")})')

            desc = current_maha.get("description", {})
            if desc:
                self.set_font('Helvetica', '', 9)
                self.set_text_color(*MEDIUM_TEXT)
                self.set_xy(14, y + 10)
                self.cell(0, 6, f'Theme: {desc.get("theme", "")}')
                self.set_xy(14, y + 16)
                self.cell(0, 6, f'Guidance: {desc.get("advice", "")[:90]}')

            self.set_y(y + 28)

        if current_antar:
            self.set_font('Helvetica', '', 9)
            self.set_text_color(*DARK_TEXT)
            self.set_x(10)
            self.cell(0, 7, f'Current Antardasha: {current_antar.get("planet", "N/A")} ({current_antar.get("start", "")} to {current_antar.get("end", "")})')
            self.ln(6)

        # Upcoming dashas (next 3)
        if dashas:
            today_str = datetime.now().strftime('%Y-%m-%d')
            upcoming = [d for d in dashas if d.get("start", "") > today_str][:3]
            if upcoming:
                self.set_font('Helvetica', 'B', 9)
                self.set_x(10)
                self.cell(0, 7, 'Upcoming Major Periods:')
                self.ln()
                for d in upcoming:
                    self.set_font('Helvetica', '', 9)
                    self.set_text_color(*MEDIUM_TEXT)
                    self.set_x(14)
                    self.cell(0, 6, "- " + d["planet"] + ": " + d["start"] + " to " + d["end"] + " (" + str(d.get("duration_years", 0)) + " years)")
                    self.ln()

    def add_disclaimer(self):
        self.ln(8)
        self.set_draw_color(*PURPLE)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)
        self.set_font('Helvetica', 'I', 7)
        self.set_text_color(*MEDIUM_TEXT)
        self.set_x(10)
        self.multi_cell(190, 4,
            'Disclaimer: This report is generated using Vedic astrological principles and AI interpretation. '
            'It is intended for educational and entertainment purposes only. For important life decisions, '
            'please consult a qualified Vedic astrologer and relevant professionals.'
        )


# ── AI prompt builder ─────────────────────────────────────────

def build_report_prompt(kundli: dict, report_type: str, your_knowledge: str) -> tuple:
    config = REPORT_CONFIGS.get(report_type, REPORT_CONFIGS["general"])

    system_prompt = f"""You are Cosmica, a master Vedic astrologer creating a detailed {config['title']}.
You have been given the astrologer's OWN personal knowledge (marked with >).
This is the most important content - include ALL of it first.
Then enrich with classical Vedic wisdom.
Be specific, warm, personal, and thorough. Never be generic.
Structure your response with clear section headers using ## format."""

    user_prompt = f"""Generate a detailed {config['title']} for this person.

{build_kundli_description(kundli)}

{'=' * 50}
ASTROLOGER'S PERSONAL KNOWLEDGE - INCLUDE ALL OF THIS FIRST:
{'=' * 50}
{your_knowledge if your_knowledge else "No personal knowledge entered yet for this chart combination."}

Instructions:
- Start with the astrologer's personal knowledge if available
- Then enrich with classical Vedic wisdom
- Give specific, actionable guidance
- Focus on houses {', '.join(str(h) for h in config['key_houses'])} and planets {', '.join(config['key_planets'])}
- Structure with these sections: {config['sections']}
- Write 800-1200 words in warm, flowing language
- Use ## for section headers"""

    return system_prompt, user_prompt


# ── Main PDF generation function ──────────────────────────────

async def generate_pdf_report(kundli_doc: dict, report_type: str) -> bytes:
    kundli = kundli_doc["kundli"]
    person_name = kundli_doc.get("person_name", "Unknown")
    birth_details = kundli_doc.get("birth_details", {})
    config = REPORT_CONFIGS.get(report_type, REPORT_CONFIGS["general"])

    # 1. Fetch personal knowledge
    your_knowledge = await fetch_your_knowledge(kundli)

    # 2. Generate AI reading
    reading_text = await _generate_reading(kundli, report_type, your_knowledge)

    # 3. Calculate dashas if we have moon data
    dashas = []
    current_maha = None
    current_antar = None
    moon_data = kundli.get("planetary_positions", {}).get("Moon", {})
    moon_long = moon_data.get("longitude") or moon_data.get("abs_longitude")
    if moon_long is not None and birth_details.get("date"):
        try:
            bd = datetime.strptime(birth_details["date"], "%Y-%m-%d")
            dashas = calculate_dashas(moon_long, bd)
            current_maha, current_antar = find_current_dasha(dashas, datetime.now())
        except Exception:
            pass

    # 4. Build PDF
    pdf = CosmicaPDFReport(report_type)
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.add_birth_details(person_name, birth_details)
    pdf.add_chart_summary(kundli)
    pdf.add_planetary_table(kundli)
    pdf.add_reading(reading_text)
    if dashas:
        pdf.add_dasha_summary(dashas, current_maha, current_antar)
    pdf.add_disclaimer()

    return pdf.output()


async def _generate_reading(kundli: dict, report_type: str, your_knowledge: str) -> str:
    """Generate AI reading or fall back to rule-based."""
    try:
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
            system_prompt, user_prompt = build_report_prompt(kundli, report_type, your_knowledge)
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "temperature": 0.7,
                        "max_tokens": 2500,
                    },
                    timeout=60.0,
                )
                data = response.json()
                return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"PDF report AI error: {e}")

    # Fallback
    return _rule_based_reading(kundli, report_type, your_knowledge)


def _rule_based_reading(kundli: dict, report_type: str, your_knowledge: str) -> str:
    config = REPORT_CONFIGS.get(report_type, REPORT_CONFIGS["general"])
    nakshatra = kundli.get("nakshatra", {}).get("name", "Unknown")
    moon_rashi = kundli.get("moon_rashi", "Unknown")
    lagna = kundli.get("lagna", {}).get("name", "Unknown")

    text = f"""## {config['title']}

Your birth chart reveals a unique cosmic blueprint with {nakshatra} as your birth star,
{moon_rashi} as your Moon sign, and {lagna} as your ascendant (Lagna).

## Key Influences

The planets most relevant to this reading are: {', '.join(config['key_planets'])}.
Houses {', '.join(str(h) for h in config['key_houses'])} play a significant role in shaping
the themes of this report.

## Chart Analysis

With {lagna} Lagna, your overall approach to life is shaped by this ascendant's qualities.
Your Nakshatra {nakshatra} adds depth to your personality and karmic path.
"""

    if your_knowledge:
        text += f"""
## Astrologer's Personal Insights

{your_knowledge}
"""

    text += """
---

Note: Add your OpenAI API key for a full AI-powered detailed reading with personalized sections.
"""
    return text
