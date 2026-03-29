"""
Report Template Engine — The Studio v5
Renders structured JSON report data into branded HTML matching the design spec.
Output: standalone HTML pages (A4 portrait + landscape board) exportable as .doc via Office XML.
"""
import html as _html
from datetime import datetime

# ══════════════════════════════════════════════════════════════
# PATHWAY MAPPING
# ══════════════════════════════════════════════════════════════

PATHWAY_MAP = {
    'untangle': 'pathway-untangle',
    'spark': 'pathway-spark',
    'test': 'pathway-test',
    'build': 'pathway-build',
}

MODE_DISPLAY = {
    'untangle': 'The Untangle',
    'spark': 'The Spark',
    'test': 'The Test',
    'build': 'The Build',
}

EXERCISE_DISPLAY = {
    'five-whys': 'Five Whys', 'hmw': 'How Might We', 'jtbd': 'Jobs to Be Done',
    'scamper': 'SCAMPER', 'crazy-8s': 'Crazy 8s', 'mash-up': 'Mash Up',
    'analogical': 'Mash Up', 'pre-mortem': 'Pre-Mortem',
    'devils-advocate': "Devil's Advocate", 'rapid-experiment': 'Rapid Experiment',
    'customer-discovery': 'Customer Discovery', 'empathy-map': 'Empathy Map',
    'socratic': 'Socratic Questioning', 'iceberg': 'The Iceberg',
    'lean-canvas': 'Lean Canvas', 'effectuation': 'Effectuation',
    'flywheel': 'Flywheel', 'reality-check': 'Reality Check',
    'theory-of-change': 'Theory of Change', 'constraint-flip': 'Constraint Flip',
    'trade-off': 'The Trade-Off',
}

EXERCISE_PATHWAY = {
    'five-whys': 'untangle', 'jtbd': 'untangle', 'empathy-map': 'untangle',
    'socratic': 'untangle', 'iceberg': 'untangle',
    'hmw': 'spark', 'scamper': 'spark', 'crazy-8s': 'spark',
    'mash-up': 'spark', 'analogical': 'spark', 'constraint-flip': 'spark',
    'pre-mortem': 'test', 'devils-advocate': 'test', 'customer-discovery': 'test',
    'reality-check': 'test', 'trade-off': 'test',
    'lean-canvas': 'build', 'effectuation': 'build', 'rapid-experiment': 'build',
    'flywheel': 'build', 'theory-of-change': 'build',
}

# ══════════════════════════════════════════════════════════════
# PATHWAY ICONS (SVG, 24×24 viewBox, stroke-only)
# ══════════════════════════════════════════════════════════════

PATHWAY_ICONS = {
    'untangle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    'spark': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>',
    'test': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    'build': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
}

# ══════════════════════════════════════════════════════════════
# REPORT CSS (from master template v5)
# ══════════════════════════════════════════════════════════════

REPORT_CSS = r"""
  @font-face { font-family: 'GT Walsheim'; src: local('GT Walsheim Pro Light'), local('GT-Walsheim-Pro-Light'), local('GTWalsheimPro-Light'); font-weight: 300; }
  @font-face { font-family: 'GT Walsheim'; src: local('GT Walsheim Pro Regular'), local('GT-Walsheim-Pro-Regular'), local('GTWalsheimPro-Regular'); font-weight: 400; }
  @font-face { font-family: 'GT Walsheim'; src: local('GT Walsheim Pro Medium'), local('GT-Walsheim-Pro-Medium'), local('GTWalsheimPro-Medium'); font-weight: 500; }
  @font-face { font-family: 'GT Walsheim'; src: local('GT Walsheim Pro Bold'), local('GT-Walsheim-Pro-Bold'), local('GTWalsheimPro-Bold'); font-weight: 700; }

  :root {
    --navy: #1E194F; --orange: #F15A22; --teal: #27BDBE; --pink: #ED3694; --yellow: #E4E517;
    --grey-1: #F6F5F5; --grey-2: #E7E6E5; --grey-3: #A8A4A5; --grey-4: #49474D;
    --font: 'GT Walsheim', Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --page-x: 48px;
  }

  body.pathway-untangle { --accent: #27BDBE; --accent-light: #E8F8F8; --accent-on-dark: #27BDBE; --accent-text: #27BDBE; }
  body.pathway-spark    { --accent: #F15A22; --accent-light: #FDF0EB; --accent-on-dark: #F15A22; --accent-text: #F15A22; }
  body.pathway-test     { --accent: #ED3694; --accent-light: #FDE8F3; --accent-on-dark: #ED3694; --accent-text: #ED3694; }
  body.pathway-build    { --accent: #E4E517; --accent-light: #FAFBE8; --accent-on-dark: #E4E517; --accent-text: #1E194F; }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 0; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { break-after: page; box-shadow: none; margin: 0 auto; }
    .no-break { break-inside: avoid; }
  }

  body { font-family: var(--font); font-weight: 300; font-size: 13.5px; line-height: 1.65; color: var(--grey-4); background: white; -webkit-font-smoothing: antialiased; }
  .page { width: 210mm; min-height: 297mm; background: white; margin: 0 auto; position: relative; overflow: hidden; }
  .page-body { padding: 28px var(--page-x) 60px; }

  .hdr { background: var(--navy); padding: 14px var(--page-x); display: flex; align-items: center; justify-content: space-between; }
  .hdr-left { display: flex; align-items: center; gap: 14px; }
  .hdr-logo { font-weight: 700; font-size: 13px; color: var(--orange); line-height: 1.15; text-transform: uppercase; letter-spacing: 0.5px; }
  .hdr-pipe { width: 1px; height: 18px; background: rgba(255,255,255,0.15); }
  .hdr-studio { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.6); letter-spacing: 0.2px; }
  .hdr-right { font-size: 10px; font-weight: 400; color: rgba(255,255,255,0.4); letter-spacing: 0.4px; text-transform: uppercase; display: flex; gap: 14px; align-items: center; }
  .hdr-pathway { display: flex; align-items: center; gap: 6px; color: var(--accent-on-dark); font-weight: 500; }
  .hdr-pathway svg { width: 16px; height: 16px; }

  .ftr { position: absolute; bottom: 0; left: 0; right: 0; padding: 14px var(--page-x); display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; font-weight: 300; color: var(--grey-3); border-top: 1px solid var(--grey-2); }
  .ftr-page { font-weight: 500; color: var(--grey-3); }

  .hero { padding: 36px var(--page-x) 28px; }
  .hero-top { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .hero-icon { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--accent-text); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .hero-icon svg { width: 20px; height: 20px; color: var(--accent-text); }
  .hero-badge { display: inline-block; padding: 4px 14px; border-radius: 100px; font-size: 10.5px; font-weight: 500; letter-spacing: 0.3px; text-transform: uppercase; background: var(--accent-light); color: var(--accent-text); }
  .hero h1 { font-size: 28px; font-weight: 400; line-height: 1.25; color: var(--navy); margin-bottom: 12px; max-width: 520px; }
  .hero-sub { font-size: 14.5px; font-weight: 300; line-height: 1.6; color: var(--grey-4); max-width: 520px; }

  .insights { display: flex; margin: 0 var(--page-x); border-top: 3px solid var(--accent); border-bottom: 1px solid var(--grey-2); }
  .ins { flex: 1; padding: 18px 20px 16px; }
  .ins:not(:last-child) { border-right: 1px solid var(--grey-2); }
  .ins-label { font-size: 9.5px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: var(--grey-3); margin-bottom: 5px; }
  .ins-big { font-size: 30px; font-weight: 700; color: var(--navy); line-height: 1; margin-bottom: 3px; }
  .ins-text { font-size: 12px; font-weight: 300; color: var(--grey-4); line-height: 1.4; }

  .sh { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--grey-2); }
  .sh-bar { width: 3px; height: 18px; border-radius: 2px; flex-shrink: 0; background: var(--accent); }
  .sh h2 { font-size: 17px; font-weight: 400; color: var(--navy); flex: 1; }
  .sh-num { font-size: 9.5px; font-weight: 500; color: var(--grey-3); text-transform: uppercase; letter-spacing: 0.5px; }
  .sec { margin-bottom: 28px; }
  p { margin-bottom: 10px; }
  p:last-child { margin-bottom: 0; }
  strong { color: var(--navy); font-weight: 500; }

  blockquote { border-left: 3px solid var(--accent); padding: 10px 16px; margin: 10px 0; background: var(--accent-light); border-radius: 0 4px 4px 0; font-size: 13px; font-weight: 300; font-style: italic; color: var(--navy); line-height: 1.55; }
  blockquote strong { font-weight: 500; font-style: normal; color: var(--grey-4); font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 2px; }

  .fl li { list-style: none; padding: 7px 0; border-bottom: 1px solid var(--grey-1); font-size: 13px; display: flex; align-items: baseline; gap: 8px; }
  .fl li:last-child { border-bottom: none; }
  .fl .dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); flex-shrink: 0; margin-top: 6px; }

  .rd { background: var(--grey-1); border-radius: 6px; padding: 12px 14px; margin-bottom: 7px; display: flex; gap: 12px; align-items: start; }
  .rd-n { font-size: 18px; font-weight: 700; color: var(--grey-3); min-width: 32px; text-align: center; padding-top: 1px; }
  .rd-body { flex: 1; }
  .rd-vs { font-size: 12.5px; color: var(--grey-4); margin-bottom: 3px; line-height: 1.45; }
  .rd-tag { display: inline-block; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.2px; background: var(--accent-light); color: var(--accent-text); margin-bottom: 3px; }
  .rd-q { font-size: 12px; font-weight: 300; color: var(--grey-4); font-style: italic; line-height: 1.45; }

  .vs { margin-bottom: 14px; }
  .tier { border-radius: 6px; overflow: hidden; margin-bottom: 7px; }
  .tier-hd { padding: 7px 14px; display: flex; justify-content: space-between; align-items: center; }
  .tier-hd h4 { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px; color: white; }
  .tier-hd span { font-size: 10px; font-weight: 300; color: rgba(255,255,255,0.7); }
  .tier--must .tier-hd { background: var(--navy); }
  .tier--strong .tier-hd { background: var(--grey-4); }
  .tier--exp .tier-hd { background: var(--grey-2); }
  .tier--exp .tier-hd h4 { color: var(--grey-4); }
  .tier--exp .tier-hd span { color: var(--grey-3); }
  .tier-body { background: var(--grey-1); }
  .tier-row { display: flex; justify-content: space-between; padding: 6px 14px; font-size: 12.5px; font-weight: 300; border-bottom: 1px solid var(--grey-2); }
  .tier-row:last-child { border-bottom: none; }
  .tier-row .wc { font-weight: 500; font-size: 11px; color: var(--grey-3); }

  .co { display: flex; border-radius: 6px; overflow: hidden; margin-bottom: 14px; }
  .co-bar { width: 3px; flex-shrink: 0; background: var(--accent); }
  .co-body { padding: 14px 16px; flex: 1; font-size: 13px; font-weight: 300; line-height: 1.6; background: var(--accent-light); color: var(--navy); }

  .qgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .qc { background: var(--grey-1); border-radius: 6px; padding: 14px 16px; border-left: 3px solid var(--accent); }
  .qc-tag { font-size: 9px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent-text); margin-bottom: 4px; }
  .qc p { font-size: 13px; font-weight: 300; font-style: italic; color: var(--navy); line-height: 1.5; margin: 0; }

  .steps { list-style: none; counter-reset: s; }
  .steps li { counter-increment: s; display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--grey-2); font-size: 13px; font-weight: 300; line-height: 1.55; }
  .steps li:last-child { border-bottom: none; }
  .steps li::before { content: counter(s); display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: var(--navy); color: white; font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }

  .reframe { background: var(--grey-1); border-radius: 8px; padding: 24px 28px; margin-bottom: 20px; border-left: 4px solid var(--navy); }
  .reframe h3 { font-size: 15px; font-weight: 400; color: var(--navy); margin-bottom: 8px; }
  .reframe p { font-size: 14px; font-weight: 300; line-height: 1.65; color: var(--grey-4); }

  .cta { background: var(--navy); border-radius: 8px; padding: 24px 28px; margin-bottom: 14px; }
  .cta h2 { font-size: 17px; font-weight: 400; color: white; margin-bottom: 6px; }
  .cta > p { color: rgba(255,255,255,0.5); font-size: 12.5px; font-weight: 300; margin-bottom: 14px; }
  .cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .cta-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 14px; }
  .cta-card h4 { font-size: 11px; font-weight: 500; color: var(--accent-on-dark); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px; }
  .cta-card p { font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.5); margin: 0; line-height: 1.45; }

  .wb { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 14px; }
  .wb thead th { background: var(--navy); color: white; padding: 7px 12px; text-align: left; font-weight: 500; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; }
  .wb td { padding: 7px 12px; border-bottom: 1px solid var(--grey-2); vertical-align: top; font-weight: 300; }
  .wb tr:nth-child(even) { background: var(--grey-1); }
  .tl { display: inline-block; padding: 2px 8px; border-radius: 100px; font-size: 9.5px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.2px; }
  .tl--must { background: #EEEDF4; color: var(--navy); }
  .tl--strong { background: var(--grey-2); color: var(--grey-4); }
  .tl--exp { background: var(--accent-light); color: var(--accent-text); }
  .tl--cut { background: #F5E6E6; color: #8B3A3A; }

  .div { height: 1px; background: var(--grey-2); margin: 20px 0; border: none; }

  .page--landscape { width: 297mm; min-height: 210mm; }
"""


# ══════════════════════════════════════════════════════════════
# HELPER: escape HTML
# ══════════════════════════════════════════════════════════════

def _e(text):
    """Escape HTML entities."""
    if not text:
        return ''
    return _html.escape(str(text))


def _paragraphs(text):
    """Convert text with newlines into <p> tags. Supports **bold** inline."""
    if not text:
        return ''
    import re
    parts = []
    for para in str(text).split('\n\n'):
        para = para.strip()
        if not para:
            continue
        # Escape HTML first
        para = _e(para)
        # Convert **bold** to <strong>
        para = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', para)
        parts.append(f'<p>{para}</p>')
    return '\n'.join(parts)


# ══════════════════════════════════════════════════════════════
# COMPONENT RENDERERS
# ══════════════════════════════════════════════════════════════

def _render_header(pathway, exercise, date_str, include_date=True):
    icon = PATHWAY_ICONS.get(pathway, '')
    mode_name = MODE_DISPLAY.get(pathway, pathway)
    tool_name = EXERCISE_DISPLAY.get(exercise, exercise)
    date_part = f'<span>{_e(date_str)}</span>' if include_date else ''
    return f'''<div class="hdr">
    <div class="hdr-left">
      <div class="hdr-logo">Wade<br>Institute</div>
      <div class="hdr-pipe"></div>
      <div class="hdr-studio">The Studio</div>
    </div>
    <div class="hdr-right">
      <span class="hdr-pathway">{icon} {_e(mode_name)}</span>
      <span>{_e(tool_name)}</span>
      {date_part}
    </div>
  </div>'''


def _render_footer(page_num, total_pages, is_last=False):
    left = 'Generated by The Studio · Wade Institute of Entrepreneurship'
    if is_last:
        left += ' · wadeinstitute.org.au'
    return f'''<div class="ftr">
    <span>{left}</span>
    <span class="ftr-page">{page_num} / {total_pages}</span>
  </div>'''


def _render_hero(headline, subtitle, exercise, pathway):
    icon = PATHWAY_ICONS.get(pathway, '')
    tool_name = EXERCISE_DISPLAY.get(exercise, exercise)
    return f'''<div class="hero">
    <div class="hero-top">
      <div class="hero-icon">{icon}</div>
      <div class="hero-badge">{_e(tool_name)}</div>
    </div>
    <h1>{_e(headline)}</h1>
    <p class="hero-sub">{_e(subtitle)}</p>
  </div>'''


def _render_insights(insights):
    if not insights or len(insights) == 0:
        return ''
    cols = ''
    for ins in insights[:3]:
        cols += f'''<div class="ins">
      <div class="ins-label">{_e(ins.get("label", ""))}</div>
      <div class="ins-big">{_e(ins.get("number", ""))}</div>
      <div class="ins-text">{_e(ins.get("description", ""))}</div>
    </div>'''
    return f'<div class="insights">{cols}</div>'


def _render_section_heading(title, right_label=None):
    right = f'<span class="sh-num">{_e(right_label)}</span>' if right_label else ''
    return f'''<div class="sh">
      <div class="sh-bar"></div>
      <h2>{_e(title)}</h2>
      {right}
    </div>'''


def _render_blockquotes(moments):
    if not moments:
        return ''
    html_parts = []
    for m in moments:
        label = m.get('label', '')
        quote = m.get('quote', '')
        html_parts.append(f'''<blockquote>
      <strong>{_e(label)}</strong>
      {_e(quote)}
    </blockquote>''')
    return '\n'.join(html_parts)


def _render_questions(questions):
    if not questions:
        return ''
    cards = ''
    for q in questions[:4]:
        cards += f'''<div class="qc">
        <div class="qc-tag">{_e(q.get("tag", ""))}</div>
        <p>{_e(q.get("question", ""))}</p>
      </div>'''
    return f'<div class="qgrid">{cards}</div>'


def _render_actions(actions):
    if not actions:
        return ''
    items = ''
    for a in actions:
        items += f'<li><strong>{_e(a.get("bold", ""))}</strong> {_e(a.get("description", ""))}</li>\n'
    return f'<ol class="steps">{items}</ol>'


def _render_reframe(reframe):
    if not reframe:
        return ''
    heading = reframe.get('heading', 'The reframe')
    body = reframe.get('body', '')
    return f'''<div class="reframe">
      <h3>{_e(heading)}</h3>
      {_paragraphs(body)}
    </div>'''


def _render_cta(go_further):
    if not go_further:
        go_further = {}
    text = go_further.get('text', 'This report was generated by The Studio, a product of the Wade Institute of Entrepreneurship.')
    cards = go_further.get('cards', [
        {'heading': 'Recommended reading', 'body': 'Explore more tools in The Studio to pressure-test your assumptions, validate demand, and build with confidence.'},
        {'heading': 'Wade programs', 'body': "Wade's flagship program takes you beyond the tools. Build your venture with a cohort of founders, expert mentors, and structured support."},
    ])
    cards_html = ''
    for c in cards[:4]:
        cards_html += f'''<div class="cta-card">
        <h4>{_e(c.get("heading", ""))}</h4>
        <p>{_e(c.get("body", ""))}</p>
      </div>'''
    return f'''<div class="cta">
      <h2>Go further with Wade</h2>
      <p>{_e(text)}</p>
      <div class="cta-grid">{cards_html}</div>
    </div>'''


def _render_callout(bold_text, body_text):
    return f'''<div class="co">
      <div class="co-bar"></div>
      <div class="co-body"><strong>{_e(bold_text)}</strong> {_e(body_text)}</div>
    </div>'''


def _render_value_stack(tiers):
    if not tiers:
        return ''
    html_parts = []
    for tier in tiers:
        tier_class = tier.get('tier_class', 'must')
        name = tier.get('name', '')
        range_text = tier.get('range', '')
        rows = ''
        for item in tier.get('items', []):
            rows += f'''<div class="tier-row">
            <span>{_e(item.get("name", ""))}</span>
            <span class="wc">{_e(item.get("wins", ""))}</span>
          </div>'''
        html_parts.append(f'''<div class="tier tier--{_e(tier_class)}">
        <div class="tier-hd"><h4>{_e(name)}</h4><span>{_e(range_text)}</span></div>
        <div class="tier-body">{rows}</div>
      </div>''')
    return f'<div class="vs">{"".join(html_parts)}</div>'


def _render_feature_list(items):
    if not items:
        return ''
    lis = ''
    for item in items:
        if isinstance(item, dict):
            bold = item.get('bold', '')
            desc = item.get('description', '')
            lis += f'<li><span class="dot"></span><strong>{_e(bold)}</strong> — {_e(desc)}</li>'
        else:
            lis += f'<li><span class="dot"></span>{_e(str(item))}</li>'
    return f'<ul class="fl">{lis}</ul>'


def _render_round_cards(rounds):
    if not rounds:
        return ''
    html_parts = []
    for i, r in enumerate(rounds, 1):
        tag = r.get('tag', '')
        matchup = r.get('matchup', '')
        quote = r.get('quote', '')
        tag_html = f'<div class="rd-tag">{_e(tag)}</div>' if tag else ''
        quote_html = f'<div class="rd-q">{_e(quote)}</div>' if quote else ''
        html_parts.append(f'''<div class="rd">
        <div class="rd-n">{i}</div>
        <div class="rd-body">
          <div class="rd-vs">{_e(matchup)}</div>
          {tag_html}
          {quote_html}
        </div>
      </div>''')
    return '\n'.join(html_parts)


def _render_workshop_table(board_summary):
    """Render a portrait-page workshop board summary table."""
    if not board_summary:
        return ''
    headers = board_summary.get('headers', [])
    rows = board_summary.get('rows', [])
    if not headers or not rows:
        return ''
    th = ''.join(f'<th>{_e(h)}</th>' for h in headers)
    trs = ''
    for row in rows:
        tds = ''
        for cell in row:
            if isinstance(cell, dict) and 'tier' in cell:
                tier_cls = cell.get('tier', 'must')
                label = cell.get('label', '')
                tds += f'<td><span class="tl tl--{_e(tier_cls)}">{_e(label)}</span></td>'
            else:
                # Support **bold** in cell text
                import re
                cell_text = _e(str(cell))
                cell_text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', cell_text)
                tds += f'<td>{cell_text}</td>'
        trs += f'<tr>{tds}</tr>\n'
    return f'''<table class="wb">
      <thead><tr>{th}</tr></thead>
      <tbody>{trs}</tbody>
    </table>'''


def _render_evidence_components(components):
    """Render tool-specific structured components in the evidence section."""
    if not components:
        return ''
    html_parts = []
    for comp in components:
        ctype = comp.get('type', '')
        if ctype == 'value_stack':
            html_parts.append(_render_value_stack(comp.get('tiers', [])))
        elif ctype == 'callout':
            html_parts.append(_render_callout(comp.get('bold', ''), comp.get('text', '')))
        elif ctype == 'feature_list':
            html_parts.append(_render_feature_list(comp.get('items', [])))
        elif ctype == 'round_cards':
            html_parts.append(_render_round_cards(comp.get('rounds', [])))
        elif ctype == 'workshop_table':
            html_parts.append(_render_workshop_table(comp))
        elif ctype == 'canvas_grid':
            html_parts.append(_render_canvas_grid(comp.get('blocks', [])))
        elif ctype == 'why_chain':
            html_parts.append(_render_why_chain(comp.get('whys', [])))
        elif ctype == 'experiment_cards':
            html_parts.append(_render_experiment_cards(comp.get('cards', [])))
        elif ctype == 'paragraph':
            html_parts.append(_paragraphs(comp.get('text', '')))
    return '\n'.join(html_parts)


def _render_canvas_grid(blocks):
    """Render a Lean Canvas style grid."""
    if not blocks:
        return ''
    rows = ''
    for block in blocks:
        rows += f'''<tr>
        <td><strong>{_e(block.get("label", ""))}</strong></td>
        <td>{_e(block.get("content", ""))}</td>
      </tr>'''
    return f'''<table class="wb">
      <thead><tr><th>Block</th><th>Content</th></tr></thead>
      <tbody>{rows}</tbody>
    </table>'''


def _render_why_chain(whys):
    """Render Five Whys as a numbered chain."""
    if not whys:
        return ''
    items = ''
    for w in whys:
        num = w.get('number', '')
        question = w.get('question', '')
        answer = w.get('answer', '')
        items += f'''<div class="rd">
        <div class="rd-n">{_e(str(num))}</div>
        <div class="rd-body">
          <div class="rd-vs"><strong>{_e(question)}</strong></div>
          <div class="rd-q">{_e(answer)}</div>
        </div>
      </div>'''
    return items


def _render_experiment_cards(cards):
    """Render Rapid Experiment design cards."""
    if not cards:
        return ''
    items = ''
    for c in cards:
        items += f'''<div class="rd" style="align-items:start">
        <div class="rd-body">
          <div class="rd-tag">{_e(c.get("label", ""))}</div>
          <div class="rd-vs">{_e(c.get("content", ""))}</div>
        </div>
      </div>'''
    return items


# ══════════════════════════════════════════════════════════════
# MAIN RENDERER
# ══════════════════════════════════════════════════════════════

def render_report_html(report_json, mode, exercise, board_cards=None):
    """
    Render a complete branded HTML report from structured JSON.

    Args:
        report_json: dict with keys: headline, subtitle, insights, opening, challenge,
                     evidence, key_moments, reframe, questions, actions, board_summary, go_further
        mode: pathway key (untangle, spark, test, build)
        exercise: exercise key (five-whys, lean-canvas, trade-off, etc.)
        board_cards: optional list of board cards from session

    Returns:
        Complete standalone HTML string.
    """
    pathway = mode or EXERCISE_PATHWAY.get(exercise, 'untangle')
    pathway_class = PATHWAY_MAP.get(pathway, 'pathway-untangle')
    date_str = datetime.now().strftime('%B %Y')

    rj = report_json or {}
    headline = rj.get('headline', f'{EXERCISE_DISPLAY.get(exercise, exercise)} Report')
    subtitle = rj.get('subtitle', '')
    insights = rj.get('insights', [])
    opening = rj.get('opening', '')
    challenge = rj.get('challenge', '')
    evidence = rj.get('evidence', {})
    key_moments = rj.get('key_moments', [])
    reframe_data = rj.get('reframe', {})
    questions = rj.get('questions', [])
    actions = rj.get('actions', [])
    board_summary = rj.get('board_summary', None)
    go_further = rj.get('go_further', None)

    # Determine evidence heading variant
    evidence_heading = rj.get('evidence_heading', 'What emerged')

    # Build pages
    pages = []

    # ── PAGE 1: Synopsis (Hero + Insights + Opening + Challenge) ──
    page1_body = f'''<div class="sec">{_paragraphs(opening)}</div>
    <div class="sec">
      {_render_section_heading("The challenge")}
      {_paragraphs(challenge)}
    </div>'''

    pages.append(f'''<div class="page">
  {_render_header(pathway, exercise, date_str)}
  {_render_hero(headline, subtitle, exercise, pathway)}
  {_render_insights(insights)}
  <div class="page-body">{page1_body}</div>
  {{footer_1}}
</div>''')

    # ── PAGE 2: Evidence + Key Moments ──
    evidence_html = _paragraphs(evidence.get('text', ''))
    evidence_html += _render_evidence_components(evidence.get('components', []))

    moments_html = ''
    if key_moments:
        moments_html = f'''<hr class="div">
    <div class="sec">
      {_render_section_heading("Key moments")}
      <p>These were the statements that shifted the conversation:</p>
      {_render_blockquotes(key_moments)}
    </div>'''

    pages.append(f'''<div class="page">
  {_render_header(pathway, exercise, date_str, include_date=False)}
  <div class="page-body">
    <div class="sec">
      {_render_section_heading(evidence_heading)}
      {evidence_html}
    </div>
    {moments_html}
  </div>
  {{footer_2}}
</div>''')

    # ── PAGE 3: Reframe + Questions + Actions ──
    page3_parts = []

    if reframe_data:
        page3_parts.append(f'<div class="sec">{_render_reframe(reframe_data)}</div>')

    if questions:
        page3_parts.append(f'''<div class="sec">
      {_render_section_heading("Questions worth sitting with")}
      {_render_questions(questions)}
    </div>''')

    if actions:
        page3_parts.append(f'''<hr class="div">
    <div class="sec">
      {_render_section_heading("What to do next")}
      {_render_actions(actions)}
    </div>''')

    pages.append(f'''<div class="page">
  {_render_header(pathway, exercise, date_str, include_date=False)}
  <div class="page-body">
    {''.join(page3_parts)}
  </div>
  {{footer_3}}
</div>''')

    # ── PAGE 4: Workshop Board + Go Further ──
    board_html = ''
    if board_summary:
        board_html = f'''<div class="sec">
      {_render_section_heading("Workshop board", "Summary")}
      {_render_workshop_table(board_summary)}
    </div>
    <hr class="div">'''

    pages.append(f'''<div class="page">
  {_render_header(pathway, exercise, date_str, include_date=False)}
  <div class="page-body">
    {board_html}
    {_render_cta(go_further)}
  </div>
  {{footer_4}}
</div>''')

    total_pages = len(pages)
    # Fill in footers
    for i in range(total_pages):
        is_last = (i == total_pages - 1)
        footer = _render_footer(i + 1, total_pages, is_last=is_last)
        pages[i] = pages[i].replace(f'{{footer_{i + 1}}}', footer)

    body = '\n\n'.join(pages)

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{_e(headline)} — The Studio Report</title>
<style>{REPORT_CSS}</style>
</head>
<body class="{pathway_class}">
{body}
</body>
</html>'''


# ══════════════════════════════════════════════════════════════
# .DOC EXPORT WRAPPER
# ══════════════════════════════════════════════════════════════

def wrap_html_for_doc(html_content):
    """
    Wrap rendered HTML in Microsoft Office XML namespaces for .doc export.
    Word opens the HTML and renders the CSS-driven layout.
    """
    # Replace the <html> tag with Office-namespaced version
    doc_html = html_content.replace(
        '<html lang="en">',
        '<html xmlns:o="urn:schemas-microsoft-com:office:office" '
        'xmlns:w="urn:schemas-microsoft-com:office:word" lang="en">'
    )
    # Inject Word-specific page setup after <head>
    word_setup = '''
<xml>
  <o:DocumentProperties>
    <o:Pages>4</o:Pages>
  </o:DocumentProperties>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
  </w:WordDocument>
</xml>
<style>
  @page { size: 210mm 297mm; margin: 0; }
  @page landscape-page { size: 297mm 210mm; margin: 0; }
  .page--landscape { page: landscape-page; }
</style>'''
    doc_html = doc_html.replace('</head>', f'{word_setup}\n</head>')
    return doc_html
