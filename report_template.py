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
    'cold-open': 'Cold Open', 'empathy-map': 'Empathy Map',
    'socratic': 'Socratic Questioning', 'iceberg': 'The Iceberg',
    'lean-canvas': 'Lean Canvas', 'effectuation': 'Effectuation',
    'flywheel': 'Flywheel', 'reality-check': 'Reality Check',
    'theory-of-change': 'Theory of Change', 'constraint-flip': 'Constraint Flip',
    'trade-off': 'The Trade-Off', 'wardley': 'Wardley Mapping',
}

EXERCISE_PATHWAY = {
    'five-whys': 'untangle', 'jtbd': 'untangle', 'empathy-map': 'untangle',
    'socratic': 'untangle', 'iceberg': 'untangle',
    'hmw': 'spark', 'scamper': 'spark', 'crazy-8s': 'spark',
    'mash-up': 'spark', 'analogical': 'spark', 'constraint-flip': 'spark',
    'pre-mortem': 'test', 'devils-advocate': 'test', 'cold-open': 'test',
    'trade-off': 'test', 'rapid-experiment': 'test',
    'lean-canvas': 'build', 'effectuation': 'build', 'wardley': 'build',
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

  .ctx { border-left: 3px solid var(--navy); background: var(--grey-1); border-radius: 0 6px 6px 0; padding: 14px 18px; margin-bottom: 20px; }
  .ctx-label { font-size: 9px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.6px; color: var(--grey-3); margin-bottom: 6px; }
  .ctx-body { font-size: 13px; font-weight: 300; line-height: 1.6; color: var(--navy); }

  .page--landscape { width: 297mm; min-height: 210mm; }

  /* ── Canvas board styles (landscape page) ── */
  .canvas { background: white; overflow: hidden; position: relative; color: var(--grey-4); height: 100%; display: flex; flex-direction: column; }
  .canvas * { font-family: var(--font); }
  .c-headline { font-size: 22px; font-weight: 700; color: var(--navy); padding: 16px 20px 12px; line-height: 1.25; }
  .c-strip { display: flex; align-items: center; justify-content: space-between; padding: 8px 20px; }
  .c-strip-left { display: flex; align-items: center; gap: 16px; flex: 1; }
  .c-strip .c-tool { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
  .c-strip .c-dur { font-size: 9px; color: rgba(255,255,255,0.5); }
  .c-strip .c-source { font-size: 8px; color: rgba(255,255,255,0.4); font-style: italic; }
  .c-strip-right { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
  .c-cell { padding: 14px 18px; overflow: hidden; }
  .c-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .c-text { font-size: 12px; color: var(--grey-4); line-height: 1.5; }
  .c-text b { color: var(--navy); }
  .c-text.sm { font-size: 10px; }
  .ct { width: 100%; border-collapse: collapse; font-size: 12px; }
  .ct th { padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; background: var(--navy); color: white; }
  .ct td { padding: 8px 12px; border-bottom: 1px solid var(--grey-2); vertical-align: top; }
  .ct tr:last-child td { border-bottom: none; }
  .tag { display: inline-block; padding: 2px 10px; border-radius: 3px; font-size: 10px; font-weight: 600; }
  .tag-green { background: #E0F7F7; color: #1a8a8a; }
  .tag-amber { background: #FFF8E1; color: #F57F17; }
  .tag-red { background: #FFEBEE; color: #C62828; }
  .tag-navy { background: #EEEDF4; color: var(--navy); }
  .tag-teal { background: #E0F7F7; color: #1a8a8a; }
  .v-tier { padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 4px; }
  .v-must { background: #E0F7F7; color: #1a8a8a; border-left: 4px solid #27BDBE; }
  .v-nice { background: #FFF8E1; color: #F57F17; border-left: 4px solid #F57F17; }
  .v-exp { background: #FFEBEE; color: #C62828; border-left: 4px solid #C62828; }
  .rounds { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
  .rnd { background: var(--grey-1); border: 1px solid var(--grey-2); border-radius: 4px; padding: 6px; text-align: center; font-size: 9px; }
  .rnd .rn { font-weight: 700; font-size: 11px; color: var(--navy); }
  .rnd.picked { border-color: var(--accent); background: white; }
  .exp-card { background: var(--grey-1); border-radius: 6px; padding: 14px 16px; }
  .exp-row { display: flex; gap: 8px; margin-bottom: 5px; font-size: 12px; }
  .exp-lbl { font-weight: 700; color: var(--navy); min-width: 80px; font-size: 10px; flex-shrink: 0; }
  .sc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
  .sc-dim { font-size: 12px; font-weight: 600; color: var(--navy); width: 110px; flex-shrink: 0; }
  .risk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .risk-cell { padding: 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-align: center; }
  .risk-cell .rsub { font-size: 9px; font-weight: 400; margin-top: 3px; }
  .callout-strip { padding: 10px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; text-align: center; margin-top: 8px; }
  .chain-node { display: flex; align-items: center; gap: 14px; margin-bottom: 3px; }
  .chain-circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
  .chain-text { flex: 1; padding: 8px 16px; font-size: 12px; color: var(--grey-4); line-height: 1.45; }
  .chain-arrow { text-align: center; color: var(--grey-3); font-size: 16px; line-height: 1; margin: 2px 0; }
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


def _render_context_block(challenge):
    """Render the Session Context block — user's starting point in their own words."""
    if not challenge:
        return ''
    return f'''<div class="ctx">
      <div class="ctx-label">What you brought</div>
      <div class="ctx-body">{_e(challenge)}</div>
    </div>'''


def _render_actions_short(actions):
    """Short action list for exec summary — bold title only, no descriptions."""
    if not actions:
        return ''
    items = ''
    for a in actions[:3]:
        items += f'<li><div class="dot"></div><span><strong>{_e(a.get("bold", ""))}</strong></span></li>\n'
    return f'<ul class="fl">{items}</ul>'


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
        elif ctype == 'wardley_grid':
            html_parts.append(_render_wardley_grid(comp.get('components', [])))
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


def _render_wardley_grid(components):
    """Render Wardley Map components as a table with evolution stages."""
    if not components:
        return ''
    rows = ''
    # Evolution stage order for visual grouping
    stage_styles = {
        'Genesis': 'background:#fff0f0',
        'Custom': 'background:#fff8e0',
        'Product': 'background:#e8f5e9',
        'Commodity': 'background:#e3f2fd',
    }
    for comp in components:
        name = _e(comp.get('name', ''))
        evolution = comp.get('evolution', 'Custom')
        visibility = comp.get('visibility', 'Medium')
        style = stage_styles.get(evolution, '')
        rows += f'''<tr>
        <td><strong>{name}</strong></td>
        <td style="{style}">{_e(evolution)}</td>
        <td>{_e(visibility)}</td>
      </tr>'''
    return f'''<table class="wb">
      <thead><tr><th>Component</th><th>Evolution</th><th>Visibility</th></tr></thead>
      <tbody>{rows}</tbody>
    </table>'''


# ══════════════════════════════════════════════════════════════
# LANDSCAPE CANVAS BOARD RENDERERS (one per tool)
# ══════════════════════════════════════════════════════════════

# Shared helpers for canvas boards

CANVAS_SOURCES = {
    'five-whys': 'Sakichi Toyoda · Toyota Production System · Taiichi Ohno',
    'jtbd': 'Christensen · Klement (Four Forces) · Ulwick · Moesta (Switch)',
    'empathy-map': 'Dave Gray · XPLANE (2008) · 6-segment canonical layout',
    'socratic': 'Richard Paul · 6 Types of Socratic Questions · Foundation for Critical Thinking',
    'iceberg': 'Donella Meadows · Thinking in Systems · Peter Senge · The Waters Foundation',
    'hmw': 'Min Basadur · P&G (1970s) · IDEO · Google Design Sprints',
    'scamper': 'Bob Eberle (1971) · Alex Osborn\'s brainstorming checklist (1953)',
    'crazy-8s': 'Jake Knapp · Google Ventures Design Sprint',
    'mash-up': 'Gentner, Structure-Mapping (1983) · Gordon, Synectics (1961)',
    'constraint-flip': 'd.school · Cooperrider (Appreciative Inquiry) · Goldratt (Theory of Constraints)',
    'pre-mortem': 'Gary Klein · Performing a Project Premortem (HBR, 2007)',
    'devils-advocate': 'Janis (1972) · Nemeth · Phase 2: IDEO four-risk lens',
    'cold-open': 'TV cold opens · Lakoff, Framing (2004) · Heath Brothers, Made to Stick (2007)',
    'trade-off': 'Green & Rao, Conjoint Analysis (1971) · Choice-based conjoint',
    'rapid-experiment': 'Ries · Bland & Osterwalder · Ash Maurya',
    'lean-canvas': 'Ash Maurya · Running Lean (2012) · Adapted from Osterwalder BMC',
    'effectuation': 'Saras Sarasvathy · Darden School (2001) · 5 Principles',
    'flywheel': 'Jim Collins · Good to Great (2001) · Turning the Flywheel (2019)',
    'theory-of-change': 'Carol Weiss (1995) · Aspen Institute · ActKnowledge',
    'wardley': 'Simon Wardley (2005+) · CC-BY-SA',
    'reality-check': 'Janis (1972) · Nemeth · Phase 2: IDEO four-risk lens',
    'analogical': 'Gentner, Structure-Mapping (1983) · Gordon, Synectics (1961)',
}

PATHWAY_COLOURS = {
    'untangle': '#27BDBE', 'spark': '#F15A22',
    'test': '#ED3694', 'build': '#E4E517',
}

PATHWAY_GRADIENTS = {
    'untangle': 'linear-gradient(135deg, #27BDBE, #1a8a8a)',
    'spark': 'linear-gradient(135deg, #F15A22, #c44a1a)',
    'test': 'linear-gradient(135deg, #ED3694, #c42d7a)',
    'build': 'linear-gradient(135deg, #E4E517, #b8b812)',
}


def _canvas_strip(title, exercise, pathway, duration=None):
    """Render the coloured accent strip below the navy header."""
    gradient = PATHWAY_GRADIENTS.get(pathway, PATHWAY_GRADIENTS['untangle'])
    accent = PATHWAY_COLOURS.get(pathway, '#27BDBE')
    source = _e(CANVAS_SOURCES.get(exercise, ''))
    dur_html = f'<span class="c-dur">{_e(duration)}</span>' if duration else ''
    src_html = f'<span class="c-source">{source}</span>' if source else ''
    return f'''<div class="c-strip" style="background:{gradient}; color:white;">
      <div class="c-strip-left">
        <span class="c-tool" style="color:white;">{_e(title)}</span>
      </div>
      <div class="c-strip-right">
        {src_html}
        {dur_html}
      </div>
    </div>'''


def _tag_html(value, colour=None):
    """Render a coloured tag chip."""
    if not value:
        return ''
    tag_map = {
        'HIGH': 'tag-green', 'STRONG': 'tag-green', 'GREEN': 'tag-green', 'VERIFIED': 'tag-green',
        'MEDIUM': 'tag-amber', 'DEVELOPING': 'tag-amber', 'AMBER': 'tag-amber', 'ASSUMED': 'tag-amber',
        'LOW': 'tag-red', 'WEAK': 'tag-red', 'RED': 'tag-red', 'INHERITED': 'tag-red', 'EXPOSED': 'tag-red',
        'DEFENDED': 'tag-green', 'DEFLECTED': 'tag-amber',
    }
    cls = colour or tag_map.get(str(value).upper(), 'tag-navy')
    return f'<span class="tag {cls}">{_e(value)}</span>'


def _callout(text, bg='#EEEDF4', colour='var(--navy)', border=None):
    """Render a callout strip at the bottom of a canvas section."""
    border_css = f'border-left:3px solid {border};' if border else ''
    return f'<div class="callout-strip" style="background:{bg};color:{colour};{border_css}">{_e(text)}</div>'


# ── 1. FIVE WHYS ──

def _render_board_five_whys(board, pathway):
    """Five Whys: root cause chain + reframed problem + opportunity scorecard."""
    chain = board.get('chain', [])
    problem = board.get('problem', '')
    root_cause = board.get('root_cause', '')
    countermeasure = board.get('countermeasure', '')
    reframed = board.get('reframed_problem', '')
    verification = board.get('verification', '')
    scorecard = board.get('scorecard', [])  # [{dimension, finding, rating}]
    verdict = board.get('verdict', '')
    accent = PATHWAY_COLOURS.get(pathway, '#27BDBE')

    # Left: the chain
    chain_html = ''
    if problem:
        chain_html += f'''<div class="chain-node">
          <div class="chain-circle" style="background:{accent};color:white;">P</div>
          <div class="chain-text" style="background:var(--grey-1);border-left:3px solid {accent};border-radius:4px;padding:8px 14px;">
            <div style="font-size:10px;font-weight:600;color:var(--navy);">Original Problem</div>
            <div style="font-size:9px;color:var(--grey-4);">{_e(problem)}</div>
          </div>
        </div>
        <div class="chain-arrow">&#x2193;</div>'''

    for i, w in enumerate(chain, 1):
        q = w if isinstance(w, str) else w.get('answer', w.get('question', ''))
        chain_html += f'''<div class="chain-node">
          <div class="chain-circle" style="background:var(--grey-1);color:var(--grey-4);">{i}</div>
          <div class="chain-text">{_e(q)}</div>
        </div>
        <div class="chain-arrow">&#x2193;</div>'''

    if root_cause:
        chain_html += f'''<div class="chain-node">
          <div class="chain-circle" style="background:var(--navy);color:white;">R</div>
          <div class="chain-text" style="background:#EEEDF4;border-left:3px solid var(--navy);border-radius:4px;padding:8px 14px;">
            <div style="font-size:10px;font-weight:700;color:var(--navy);">Root Cause</div>
            <div style="font-size:9px;color:var(--grey-4);">{_e(root_cause)}</div>
          </div>
        </div>
        <div class="chain-arrow">&#x2193;</div>'''

    if countermeasure:
        chain_html += f'''<div class="chain-node">
          <div class="chain-circle" style="background:#1a8a8a;color:white;">C</div>
          <div class="chain-text" style="background:#E0F7F7;border-left:3px solid #1a8a8a;border-radius:4px;padding:8px 14px;">
            <div style="font-size:10px;font-weight:700;color:#1a8a8a;">Countermeasure</div>
            <div style="font-size:9px;color:var(--grey-4);">{_e(countermeasure)}</div>
          </div>
        </div>'''

    # Right: reframe + verification + scorecard
    right_parts = ''
    if reframed:
        right_parts += f'''<div class="c-cell" style="background:white;">
          <div class="c-label" style="color:{accent};">Reframed Problem</div>
          <div class="c-text" style="font-size:11px;font-style:italic;color:var(--navy);padding:8px 0;">"{_e(reframed)}"</div>
        </div>'''
    if verification:
        right_parts += f'''<div class="c-cell" style="background:white;">
          <div class="c-label" style="color:#1a8a8a;">Verification</div>
          <div class="c-text">{_e(verification)}</div>
        </div>'''
    if scorecard:
        sc_rows = ''
        for s in scorecard:
            sc_rows += f'<tr><td style="font-weight:600;width:70px;">{_e(s.get("dimension", ""))}</td><td>{_e(s.get("finding", ""))}</td><td>{_tag_html(s.get("rating", ""))}</td></tr>'
        verdict_html = f'<div style="margin-top:6px;padding:6px 10px;background:var(--navy);color:white;border-radius:3px;font-size:9px;font-weight:600;text-align:center;">{_e(verdict)}</div>' if verdict else ''
        right_parts += f'''<div class="c-cell" style="background:white;">
          <div class="c-label" style="color:var(--navy);">Opportunity Scorecard</div>
          <table class="ct">{sc_rows}</table>
          {verdict_html}
        </div>'''

    return f'''<div style="display:grid;grid-template-columns:2fr 1fr;flex:1;">
      <div style="padding:16px 20px;display:flex;flex-direction:column;justify-content:flex-start;gap:2px;">
        <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--grey-3);margin-bottom:6px;">The Problem → Root Cause → Countermeasure</div>
        {chain_html}
      </div>
      <div style="background:var(--grey-1);display:flex;flex-direction:column;gap:1px;justify-content:flex-start;">
        {right_parts}
      </div>
    </div>'''


# ── 2. JOBS TO BE DONE ──

def _render_board_jtbd(board, pathway):
    """JTBD: Job story + Four Forces (Push/Pull/Anxiety/Habit) + Switching Timeline + Gap."""
    customer = board.get('customer', '')
    job_story = board.get('job_story', '')
    push = board.get('push', {})
    pull = board.get('pull', {})
    anxiety = board.get('anxiety', {})
    habit = board.get('habit', {})
    timeline = board.get('switching_timeline', [])
    gap = board.get('gap_analysis', '')
    accent = PATHWAY_COLOURS.get(pathway, '#27BDBE')

    # Job story row
    tl_html = ''
    if timeline:
        steps = ''
        for i, step in enumerate(timeline):
            label = step.get('stage', '')
            time = step.get('time', '')
            is_last = (i == len(timeline) - 1)
            bg = f'{accent}' if is_last else 'var(--grey-1)'
            color = 'white' if is_last else 'inherit'
            steps += f'''{'<span style="color:var(--grey-3);font-size:10px;">→</span>' if i > 0 else ''}
            <div style="background:{bg};color:{color};padding:4px 8px;border-radius:3px;font-size:8px;text-align:center;flex:1;"><b>{_e(label)}</b><br>{_e(time)}</div>'''
        tl_html = f'''<div style="flex:1;">
          <div class="c-label" style="color:{accent};">Switching Timeline</div>
          <div style="display:flex;align-items:center;gap:4px;margin-top:4px;">{steps}</div>
        </div>'''

    gap_html = f'''<div style="flex:0.8;">
        <div class="c-label" style="color:var(--navy);">Gap Analysis</div>
        <div class="c-text">{_e(gap)}</div>
      </div>''' if gap else ''

    def _force_cell(label, icon_colour, text, detail=''):
        detail_html = f'<div class="c-text sm" style="color:var(--grey-3);margin-top:4px;">{_e(detail)}</div>' if detail else ''
        t = text if isinstance(text, str) else text.get('text', '')
        d = detail if detail else (text.get('detail', '') if isinstance(text, dict) else '')
        if d:
            detail_html = f'<div class="c-text sm" style="color:var(--grey-3);margin-top:4px;">{_e(d)}</div>'
        return f'''<div style="background:white;" class="c-cell">
          <div class="c-label" style="color:{icon_colour};">{_e(label)}</div>
          <div class="c-text">{_e(t)}</div>
          {detail_html}
        </div>'''

    push_text = push if isinstance(push, str) else push.get('text', '')
    push_detail = '' if isinstance(push, str) else push.get('detail', '')
    pull_text = pull if isinstance(pull, str) else pull.get('text', '')
    pull_detail = '' if isinstance(pull, str) else pull.get('detail', '')
    anx_text = anxiety if isinstance(anxiety, str) else anxiety.get('text', '')
    anx_detail = '' if isinstance(anxiety, str) else anxiety.get('detail', '')
    hab_text = habit if isinstance(habit, str) else habit.get('text', '')
    hab_detail = '' if isinstance(habit, str) else habit.get('detail', '')

    return f'''<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr auto;flex:1;gap:1px;background:var(--grey-2);">
      <div style="grid-column:1/3;background:white;padding:10px 20px;">
        <div class="c-label" style="color:{accent};">The Customer</div>
        <div style="font-size:9px;color:var(--grey-4);margin-bottom:6px;">{_e(customer)}</div>
        <div style="background:var(--grey-1);padding:10px 16px;border-left:3px solid {accent};border-radius:3px;">
          <div style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px;">Job Story</div>
          <div style="font-size:11px;font-style:italic;color:var(--navy);">{_e(job_story)}</div>
        </div>
      </div>
      {_force_cell('Push — Frustrations with status quo', '#C62828', push_text, push_detail)}
      {_force_cell('Pull — Attraction to new solution', '#1a8a8a', pull_text, pull_detail)}
      {_force_cell('Anxiety — Fears about switching', '#F57F17', anx_text, anx_detail)}
      {_force_cell('Habit — Inertia keeping them stuck', 'var(--navy)', hab_text, hab_detail)}
      <div style="grid-column:1/3;background:white;padding:10px 20px;display:flex;gap:20px;">
        {tl_html}{gap_html}
      </div>
    </div>'''


# ── 3. EMPATHY MAP ──

def _render_board_empathy_map(board, pathway):
    """Empathy Map: person + 2×2 quadrant grid (Says/Thinks/Does/Feels) + contradiction + insight."""
    person = board.get('person', '')
    says = board.get('says', '')
    thinks = board.get('thinks', '')
    does = board.get('does', '')
    feels = board.get('feels', '')
    contradiction = board.get('contradiction', '')
    insight = board.get('insight', '')
    accent = PATHWAY_COLOURS.get(pathway, '#27BDBE')

    def _seg(label, colour, text):
        return f'''<div style="background:white;" class="c-cell">
          <div class="c-label" style="color:{colour};">{_e(label)}</div>
          <div class="c-text">{_e(text)}</div>
        </div>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr;grid-template-rows:auto 1fr 1fr auto;gap:1px;background:var(--grey-2);">
      <div style="background:white;padding:10px 20px;">
        <div class="c-label" style="color:{accent};">The Person</div>
        <div style="font-size:11px;color:var(--navy);font-weight:600;">{_e(person)}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;">
        {_seg('Says', accent, says)}
        {_seg('Thinks', 'var(--navy)', thinks)}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;">
        {_seg('Does', '#F15A22', does)}
        {_seg('Feels', '#ED3694', feels)}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;">
        <div style="background:var(--navy);padding:10px 20px;">
          <div class="c-label" style="color:rgba(255,255,255,0.6);">Contradiction</div>
          <div class="c-text" style="color:rgba(255,255,255,0.8);">{_e(contradiction)}</div>
        </div>
        <div style="background:white;padding:10px 20px;">
          <div class="c-label" style="color:{accent};">Insight</div>
          <div style="font-size:11px;font-weight:600;color:var(--navy);">{_e(insight)}</div>
        </div>
      </div>
    </div>'''


# ── 4. SOCRATIC QUESTIONING ──

def _render_board_socratic(board, pathway):
    """Socratic Questioning: belief table + score + critical assumption."""
    beliefs = board.get('beliefs', [])  # [{belief, exposed_by, status, evidence}]
    score = board.get('score', '')
    critical = board.get('critical_assumption', '')
    test = board.get('test', '')
    accent = PATHWAY_COLOURS.get(pathway, '#27BDBE')

    rows = ''
    for b in beliefs:
        status = b.get('status', 'Assumed')
        rows += f'''<tr>
          <td>{_e(b.get('belief', ''))}</td>
          <td>{_e(b.get('exposed_by', ''))}</td>
          <td>{_tag_html(status)}</td>
          <td class="c-text sm">{_e(b.get('evidence', ''))}</td>
        </tr>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr;grid-template-rows:1fr auto auto;gap:1px;background:var(--grey-2);">
      <div style="background:white;padding:10px 14px;overflow:auto;">
        <table class="ct">
          <tr><th>Belief</th><th>Exposed By</th><th>Status</th><th>Evidence</th></tr>
          {rows}
        </table>
      </div>
      <div style="background:white;padding:10px 20px;display:flex;gap:20px;align-items:center;">
        <div class="c-label" style="color:var(--grey-3);margin:0;">Score</div>
        <div style="font-size:11px;font-weight:600;color:var(--navy);">{_e(score)}</div>
      </div>
      <div style="background:white;padding:10px 20px;display:flex;gap:20px;">
        <div style="flex:1;background:#EEEDF4;padding:8px 14px;border-left:3px solid var(--navy);border-radius:3px;">
          <div style="font-size:8px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:0.3px;">Critical Assumption</div>
          <div style="font-size:11px;font-weight:600;color:var(--navy);">{_e(critical)}</div>
        </div>
        <div style="flex:1;background:#E0F7F7;padding:8px 14px;border-left:3px solid #1a8a8a;border-radius:3px;">
          <div style="font-size:8px;font-weight:700;color:#1a8a8a;text-transform:uppercase;letter-spacing:0.3px;">The Test</div>
          <div style="font-size:9px;color:var(--grey-4);">{_e(test)}</div>
        </div>
      </div>
    </div>'''


# ── 5. THE ICEBERG ──

def _render_board_iceberg(board, pathway):
    """Iceberg: four-level descending structure + leverage point."""
    event = board.get('event', '')
    patterns = board.get('patterns', '')
    structures = board.get('structures', '')
    mental_models = board.get('mental_models', '')
    leverage = board.get('leverage_point', '')
    accent = PATHWAY_COLOURS.get(pathway, '#27BDBE')

    levels = [
        ('The Event', event, '100%', accent, 'white'),
        ('Patterns', patterns, '85%', '#4a9a9b', 'white'),
        ('Structures', structures, '70%', 'var(--navy)', 'white'),
        ('Mental Models', mental_models, '55%', '#0D0B1A', 'white'),
    ]
    level_html = ''
    for label, text, width, bg, color in levels:
        if text:
            level_html += f'''<div style="width:{width};margin:0 auto;background:{bg};color:{color};padding:12px 20px;border-radius:6px;margin-bottom:4px;">
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;opacity:0.7;margin-bottom:2px;">{_e(label)}</div>
              <div style="font-size:10px;line-height:1.45;">{_e(text)}</div>
            </div>'''

    leverage_html = ''
    if leverage:
        leverage_html = f'''<div style="background:#EEEDF4;padding:10px 20px;border-left:3px solid var(--navy);border-radius:4px;margin:8px 20px;">
          <div style="font-size:8px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:0.3px;">Leverage Point</div>
          <div style="font-size:11px;font-weight:600;color:var(--navy);">{_e(leverage)}</div>
        </div>'''

    return f'''<div style="flex:1;padding:20px;display:flex;flex-direction:column;justify-content:flex-start;">
      <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--grey-3);margin-bottom:12px;text-align:center;">Surface → Deep Structure</div>
      {level_html}
      {leverage_html}
    </div>'''


# ── 6. HOW MIGHT WE ──

def _render_board_hmw(board, pathway):
    """HMW: original problem + HMW statements + solutions explored."""
    problem = board.get('problem', '')
    hmws = board.get('hmw_statements', [])  # [{statement, selected, solutions}]
    accent = PATHWAY_COLOURS.get(pathway, '#F15A22')

    hmw_html = ''
    for h in hmws:
        stmt = h if isinstance(h, str) else h.get('statement', '')
        selected = False if isinstance(h, str) else h.get('selected', False)
        solutions = [] if isinstance(h, str) else h.get('solutions', [])
        bold = 'font-weight:600;color:var(--navy);' if selected else ''
        sol_html = ''
        if solutions:
            sol_items = ''.join(f'<div style="font-size:8px;color:var(--grey-4);padding:3px 0;border-bottom:1px solid var(--grey-2);">• {_e(s)}</div>' for s in solutions)
            sol_html = f'<div style="margin-top:4px;padding-left:12px;">{sol_items}</div>'
        hmw_html += f'''<div style="padding:6px 0;border-bottom:1px solid var(--grey-2);">
          <div style="font-size:10px;{bold}">{_e(stmt)}</div>
          {sol_html}
        </div>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr;grid-template-rows:auto 1fr;gap:1px;background:var(--grey-2);">
      <div style="background:white;padding:12px 20px;">
        <div class="c-label" style="color:{accent};">Original Problem</div>
        <div style="font-size:11px;color:var(--navy);font-weight:600;">{_e(problem)}</div>
      </div>
      <div style="background:white;padding:12px 20px;overflow:auto;">
        <div class="c-label" style="color:{accent};">HMW Statements &amp; Solutions</div>
        {hmw_html}
      </div>
    </div>'''


# ── 7. SCAMPER ──

def _render_board_scamper(board, pathway):
    """SCAMPER: 7-lens table with ideas per lens."""
    subject = board.get('subject', '')
    lenses = board.get('lenses', [])  # [{letter, name, idea}]
    accent = PATHWAY_COLOURS.get(pathway, '#F15A22')

    rows = ''
    for l in lenses:
        letter = l.get('letter', '')
        name = l.get('name', '')
        idea = l.get('idea', '')
        rows += f'<tr><td style="font-weight:700;color:{accent};width:20px;text-align:center;">{_e(letter)}</td><td style="font-weight:600;color:var(--navy);width:120px;">{_e(name)}</td><td>{_e(idea)}</td></tr>'

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr;grid-template-rows:auto 1fr;gap:1px;background:var(--grey-2);">
      <div style="background:white;padding:12px 20px;">
        <div class="c-label" style="color:{accent};">The Subject</div>
        <div style="font-size:11px;color:var(--navy);font-weight:600;">{_e(subject)}</div>
      </div>
      <div style="background:white;padding:12px 14px;overflow:auto;">
        <table class="ct">
          <tr><th></th><th>Lens</th><th>Idea</th></tr>
          {rows}
        </table>
      </div>
    </div>'''


# ── 8. CRAZY 8S ──

def _render_board_crazy_8s(board, pathway):
    """Crazy 8s: numbered idea grid with top picks bolded + pattern callout."""
    ideas = board.get('ideas', [])  # [{number, text, top_pick}]
    pattern = board.get('pattern', '')
    accent = PATHWAY_COLOURS.get(pathway, '#F15A22')

    cards = ''
    for idea in ideas:
        num = idea.get('number', '') if isinstance(idea, dict) else ''
        text = idea.get('text', idea) if isinstance(idea, dict) else idea
        top = idea.get('top_pick', False) if isinstance(idea, dict) else False
        border = f'border:2px solid {accent};' if top else 'border:1px solid var(--grey-2);'
        bold = 'font-weight:600;color:var(--navy);' if top else ''
        star = ' ★' if top else ''
        cards += f'''<div style="background:var(--grey-1);{border}border-radius:4px;padding:10px;text-align:center;">
          <div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:4px;">{_e(str(num))}</div>
          <div style="font-size:9px;{bold}">{_e(text)}{star}</div>
        </div>'''

    pattern_html = _callout(pattern, bg=f'{accent}20', colour=accent) if pattern else ''

    return f'''<div style="flex:1;padding:16px 20px;display:flex;flex-direction:column;">
      <div class="c-label" style="color:{accent};margin-bottom:8px;">Your Ideas</div>
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:6px;flex:1;">
        {cards}
      </div>
      {pattern_html}
    </div>'''


# ── 9. MASH UP ──

def _render_board_mash_up(board, pathway):
    """Mash Up: abstracted challenge + analogies explored."""
    original = board.get('original_challenge', '')
    abstracted = board.get('abstracted_challenge', '')
    analogies = board.get('analogies', [])  # [{domain, analogy, application}]
    accent = PATHWAY_COLOURS.get(pathway, '#F15A22')

    rows = ''
    for a in analogies:
        rows += f'<tr><td style="font-weight:600;color:var(--navy);">{_e(a.get("domain", ""))}</td><td>{_e(a.get("analogy", ""))}</td><td>{_e(a.get("application", ""))}</td></tr>'

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr;grid-template-rows:auto 1fr;gap:1px;background:var(--grey-2);">
      <div style="background:white;padding:12px 20px;">
        <div class="c-label" style="color:{accent};">The Challenge</div>
        <div style="font-size:9px;color:var(--grey-4);margin-bottom:4px;">{_e(original)}</div>
        <div style="background:var(--grey-1);padding:8px 14px;border-left:3px solid {accent};border-radius:3px;">
          <div style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;letter-spacing:0.3px;">Abstracted</div>
          <div style="font-size:11px;font-weight:600;color:var(--navy);">{_e(abstracted)}</div>
        </div>
      </div>
      <div style="background:white;padding:12px 14px;overflow:auto;">
        <div class="c-label" style="color:{accent};margin-bottom:6px;">Analogies Explored</div>
        <table class="ct">
          <tr><th>Domain</th><th>Analogy</th><th>Application</th></tr>
          {rows}
        </table>
      </div>
    </div>'''


# ── 10. CONSTRAINT FLIP ──

def _render_board_constraint_flip(board, pathway):
    """Constraint Flip: constraint + flip dimensions + ideas + moat."""
    constraint = board.get('constraint', '')
    forces = board.get('flip', '')  # or {forces, signals, enables}
    ideas = board.get('ideas', [])
    moat = board.get('moat_idea', '')
    accent = PATHWAY_COLOURS.get(pathway, '#F15A22')

    # Flip section
    flip_html = ''
    if isinstance(forces, dict):
        for key, label in [('forces', 'What it forces'), ('signals', 'What it signals'), ('enables', 'What it enables')]:
            v = forces.get(key, '')
            if v:
                flip_html += f'<div style="padding:6px 0;border-bottom:1px solid var(--grey-2);"><span style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;">{label}:</span> <span style="font-size:9px;">{_e(v)}</span></div>'
    elif forces:
        flip_html = f'<div class="c-text">{_e(forces)}</div>'

    ideas_html = ''
    for idea in ideas:
        t = idea if isinstance(idea, str) else idea.get('text', '')
        ideas_html += f'<div style="padding:4px 0;border-bottom:1px solid var(--grey-2);font-size:9px;">• {_e(t)}</div>'

    moat_html = ''
    if moat:
        moat_html = f'''<div style="background:var(--navy);padding:10px 16px;border-radius:4px;margin-top:8px;">
          <div style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;letter-spacing:0.3px;">The Moat Idea</div>
          <div style="font-size:11px;font-weight:600;color:white;">{_e(moat)}</div>
        </div>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr auto;gap:1px;background:var(--grey-2);">
      <div style="grid-column:1/3;background:white;padding:12px 20px;">
        <div class="c-label" style="color:{accent};">The Constraint</div>
        <div style="font-size:11px;font-weight:600;color:var(--navy);">{_e(constraint)}</div>
      </div>
      <div style="background:white;padding:12px 14px;">
        <div class="c-label" style="color:{accent};">The Flip</div>
        {flip_html}
      </div>
      <div style="background:white;padding:12px 14px;">
        <div class="c-label" style="color:{accent};">Constraint-Driven Ideas</div>
        {ideas_html}
      </div>
      <div style="grid-column:1/3;background:white;padding:8px 20px;">
        {moat_html}
      </div>
    </div>'''


# ── 11. PRE-MORTEM ──

def _render_board_pre_mortem(board, pathway):
    """Pre-Mortem: idea + categorised risks + biggest risk callout."""
    idea = board.get('idea', '')
    risks = board.get('risks', [])  # [{category, scenario, likelihood}]
    biggest = board.get('biggest_risk', '')
    accent = PATHWAY_COLOURS.get(pathway, '#ED3694')

    rows = ''
    for r in risks:
        rows += f'<tr><td style="font-weight:600;">{_e(r.get("category", ""))}</td><td>{_e(r.get("scenario", ""))}</td><td>{_tag_html(r.get("likelihood", ""))}</td></tr>'

    biggest_html = ''
    if biggest:
        biggest_html = f'''<div style="background:var(--navy);padding:10px 20px;border-radius:4px;">
          <div style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;letter-spacing:0.3px;">Biggest Risk</div>
          <div style="font-size:11px;font-weight:600;color:white;">{_e(biggest)}</div>
        </div>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr;grid-template-rows:auto 1fr auto;gap:1px;background:var(--grey-2);">
      <div style="background:white;padding:12px 20px;">
        <div class="c-label" style="color:{accent};">The Idea Being Tested</div>
        <div style="font-size:11px;font-weight:600;color:var(--navy);">{_e(idea)}</div>
      </div>
      <div style="background:white;padding:12px 14px;overflow:auto;">
        <div class="c-label" style="color:{accent};margin-bottom:4px;">Failure Scenarios</div>
        <table class="ct">
          <tr><th>Category</th><th>Scenario</th><th>Likelihood</th></tr>
          {rows}
        </table>
      </div>
      <div style="background:white;padding:8px 14px;">{biggest_html}</div>
    </div>'''


# ── 12. DEVIL'S ADVOCATE ──

def _render_board_devils_advocate(board, pathway):
    """Devil's Advocate: Phase 1 objection log + Phase 2 four-risk scorecard + callouts."""
    objections = board.get('objections', [])  # [{adversary, objection, defence, rating}]
    scorecard = board.get('scorecard', [])  # [{dimension, rating, finding}]
    overall = board.get('overall_rating', '')
    danger = board.get('danger_zone', '')
    accent = PATHWAY_COLOURS.get(pathway, '#ED3694')

    # Phase 1: Objection Log
    obj_rows = ''
    for i, o in enumerate(objections, 1):
        obj_rows += f'<tr><td style="font-weight:700;text-align:center;">{i}</td><td style="font-weight:600;">{_e(o.get("adversary", ""))}</td><td>{_e(o.get("objection", ""))}</td><td>{_e(o.get("defence", ""))}</td><td>{_tag_html(o.get("rating", ""))}</td></tr>'

    # Phase 2: Scorecard
    sc_html = ''
    for s in scorecard:
        dim = s.get('dimension', '')
        rating = s.get('rating', '')
        finding = s.get('finding', '')
        sc_html += f'''<div class="sc-row">
          <div class="sc-dim">{_e(dim)}</div>
          {_tag_html(rating)}
          <div class="c-text" style="flex:1;margin-left:6px;">{_e(finding)}</div>
        </div>'''

    overall_html = ''
    if overall:
        colour_map = {'GREEN': '#E0F7F7', 'AMBER': '#FFF8E1', 'RED': '#FFEBEE'}
        text_map = {'GREEN': '#1a8a8a', 'AMBER': '#F57F17', 'RED': '#C62828'}
        bg = colour_map.get(overall.upper(), '#EEEDF4')
        tc = text_map.get(overall.upper(), 'var(--navy)')
        overall_html = f'<div style="padding:6px 10px;background:{bg};color:{tc};border-radius:3px;font-size:10px;font-weight:700;text-align:center;margin-top:6px;">Overall: {_e(overall)}</div>'

    danger_html = ''
    if danger:
        danger_html = f'''<div style="background:var(--navy);padding:8px 14px;border-radius:4px;">
          <div style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;">Danger Zone</div>
          <div style="font-size:10px;font-weight:600;color:white;">{_e(danger)}</div>
        </div>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1.3fr 0.7fr;grid-template-rows:1fr auto;gap:1px;background:var(--grey-2);">
      <div style="background:white;padding:10px 14px;overflow:auto;">
        <div class="c-label" style="color:{accent};">Phase 1 — Adversary Attack: Objection Log</div>
        <table class="ct">
          <tr><th>#</th><th>Adversary</th><th>Objection</th><th>Defence</th><th>Rating</th></tr>
          {obj_rows}
        </table>
      </div>
      <div style="background:white;padding:10px 14px;">
        <div class="c-label" style="color:{accent};">Phase 2 — Reality Check: Scorecard</div>
        {sc_html}
        {overall_html}
      </div>
      <div style="grid-column:1/3;background:white;padding:8px 14px;">
        {danger_html}
      </div>
    </div>'''


# ── 13. COLD OPEN ──

def _render_board_cold_open(board, pathway):
    """Cold Open: persona + scorecard + signals table."""
    persona = board.get('persona', '')
    scorecard = board.get('scorecard', [])  # [{dimension, rating}]
    signals = board.get('signals', [])  # [{signal, type, caught}]
    accent = PATHWAY_COLOURS.get(pathway, '#ED3694')

    sc_rows = ''
    for s in scorecard:
        sc_rows += f'<tr><td style="font-weight:600;">{_e(s.get("dimension", ""))}</td><td>{_tag_html(s.get("rating", ""))}</td></tr>'

    sig_rows = ''
    for s in signals:
        caught = s.get('caught', False)
        icon = '✓' if caught else '✗'
        colour = '#1a8a8a' if caught else '#C62828'
        sig_rows += f'<tr><td>{_e(s.get("signal", ""))}</td><td>{_e(s.get("type", ""))}</td><td style="color:{colour};font-weight:700;text-align:center;">{icon}</td></tr>'

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr;gap:1px;background:var(--grey-2);">
      <div style="grid-column:1/3;background:white;padding:10px 20px;">
        <div class="c-label" style="color:{accent};">Customer Persona</div>
        <div class="c-text">{_e(persona)}</div>
      </div>
      <div style="background:white;padding:10px 14px;">
        <div class="c-label" style="color:{accent};margin-bottom:4px;">Interview Technique Scorecard</div>
        <table class="ct">
          <tr><th>Dimension</th><th>Rating</th></tr>
          {sc_rows}
        </table>
      </div>
      <div style="background:white;padding:10px 14px;">
        <div class="c-label" style="color:{accent};margin-bottom:4px;">Signals Planted vs Caught</div>
        <table class="ct">
          <tr><th>Signal</th><th>Type</th><th>Caught</th></tr>
          {sig_rows}
        </table>
      </div>
    </div>'''


# ── 14. REALITY CHECK ──

def _render_board_reality_check(board, pathway):
    """Reality Check: four-risk scorecard + overall rating + biggest risk + suggested test."""
    scorecard = board.get('scorecard', [])  # [{dimension, finding, rating}]
    overall = board.get('overall_rating', '')
    biggest_risk = board.get('biggest_risk', '')
    suggested_test = board.get('suggested_test', {})
    accent = PATHWAY_COLOURS.get(pathway, '#ED3694')

    # Scorecard grid — 2×2 risk cards
    colour_map = {'GREEN': ('#E0F7F7', '#1a8a8a'), 'AMBER': ('#FFF8E1', '#F57F17'), 'RED': ('#FFEBEE', '#C62828')}
    risk_labels = {'Value': 'Will customers want this?', 'Usability': 'Can they figure it out?', 'Feasibility': 'Can the team build it?', 'Viability': 'Does the business work?'}
    cards_html = ''
    for s in scorecard[:4]:
        dim = s.get('dimension', '')
        rating = s.get('rating', '').upper()
        finding = s.get('finding', '')
        bg, tc = colour_map.get(rating, ('#EEEDF4', 'var(--navy)'))
        sub = risk_labels.get(dim, '')
        cards_html += f'''<div class="risk-cell" style="background:{bg};color:{tc};">
          <div style="font-size:11px;font-weight:700;">{_e(dim)}</div>
          <div class="rsub">{_e(sub)}</div>
          <div style="font-size:14px;font-weight:700;margin:4px 0;">{_e(rating)}</div>
          <div style="font-size:8px;font-weight:400;color:var(--grey-4);">{_e(finding)}</div>
        </div>'''

    # Overall rating
    overall_html = ''
    if overall:
        bg, tc = colour_map.get(overall.upper(), ('#EEEDF4', 'var(--navy)'))
        overall_html = f'<div class="callout-strip" style="background:{bg};color:{tc};">Overall: {_e(overall)} — Weakest link rule</div>'

    # Biggest risk callout
    risk_html = ''
    if biggest_risk:
        risk_html = f'''<div style="background:var(--navy);padding:8px 14px;border-radius:4px;margin-top:6px;">
          <div style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;">Biggest Risk</div>
          <div style="font-size:10px;font-weight:600;color:white;">{_e(biggest_risk)}</div>
        </div>'''

    # Suggested test
    test_html = ''
    if suggested_test:
        test_rows = ''
        for key in ('what', 'how', 'who', 'timeline'):
            val = suggested_test.get(key, '')
            if val:
                test_rows += f'<div class="exp-row"><div class="exp-lbl">{_e(key.title())}</div><div class="c-text">{_e(val)}</div></div>'
        if test_rows:
            test_html = f'''<div class="exp-card" style="margin-top:6px;">
              <div style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;margin-bottom:4px;">Suggested Test</div>
              {test_rows}
            </div>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr auto;gap:1px;background:var(--grey-2);">
      <div style="background:white;padding:10px 14px;">
        <div class="c-label" style="color:{accent};">Four-Risk Scorecard</div>
        <div class="risk-grid">{cards_html}</div>
        {overall_html}
      </div>
      <div style="background:white;padding:10px 14px;">
        {risk_html}
        {test_html}
      </div>
    </div>'''


# ── 15. THE TRADE-OFF ──

def _render_board_trade_off(board, pathway):
    """Trade-Off: 3-col value stack (must/nice/expendable) + full-width surprise + MVO + optimised offer."""
    tiers = board.get('value_stack', [])  # [{tier, items}]  tier=must/nice/expendable
    utilities = board.get('utilities', [])  # [{category, level_1, level_2, level_3, importance}]
    mvo = board.get('mvo', {})  # {features: [...], price: "$X"}
    optimised = board.get('optimised', {})  # {features: [...], price: "$X"}
    surprise = board.get('surprise', '')  # string narrative
    accent = PATHWAY_COLOURS.get(pathway, '#ED3694')

    # Value stack — 3 columns
    tier_config = {
        'must': {'bg': 'var(--navy)', 'color': 'white', 'label': 'Must-Have'},
        'nice': {'bg': 'var(--grey-4)', 'color': 'white', 'label': 'Nice-to-Have'},
        'expendable': {'bg': 'var(--grey-2)', 'color': 'var(--grey-4)', 'label': 'Expendable'}
    }
    cols_html = ''
    for t in tiers:
        tier_name = t.get('tier', 'must')
        items = t.get('items', [])
        cfg = tier_config.get(tier_name, tier_config['must'])
        item_rows = ''
        for item in items:
            name = item if isinstance(item, str) else item.get('name', '')
            wins = '' if isinstance(item, str) else item.get('wins', '')
            importance = '' if isinstance(item, str) else item.get('importance', '')
            meta_parts = []
            if wins:
                meta_parts.append(_e(wins))
            if importance:
                meta_parts.append(_e(importance))
            meta_html = f'<div style="font-size:7px;color:var(--grey-3);margin-top:2px;">{" · ".join(meta_parts)}</div>' if meta_parts else ''
            item_rows += f'''<div style="padding:5px 10px;font-size:8px;border-bottom:1px solid var(--grey-2);">
              {_e(name)}{meta_html}
            </div>'''
        opacity = '0.6' if tier_name == 'expendable' else '1'
        cols_html += f'''<div style="opacity:{opacity};">
          <div style="background:{cfg['bg']};color:{cfg['color']};padding:5px 10px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;border-radius:4px 4px 0 0;">{_e(cfg['label'])}</div>
          <div style="background:var(--grey-1);border-radius:0 0 4px 4px;">{item_rows}</div>
        </div>'''

    # Surprise — full width
    surprise_text = surprise if isinstance(surprise, str) else ''
    surprise_html = ''
    if surprise_text:
        surprise_html = f'''<div style="grid-column:1/-1;background:var(--grey-1);border-left:3px solid #F15A22;padding:8px 12px;border-radius:4px;">
          <div style="font-size:8px;font-weight:700;color:#F15A22;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:3px;">The Surprise</div>
          <div style="font-size:8px;color:var(--grey-4);line-height:1.4;">{_e(surprise_text)}</div>
        </div>'''

    # MVO — full width
    mvo_html = ''
    if mvo:
        mvo_features = mvo.get('features', [])
        mvo_price = mvo.get('price', '')
        mvo_list = ' · '.join(_e(f) for f in mvo_features)
        mvo_html = f'''<div style="grid-column:1/-1;background:var(--grey-1);border-left:3px solid {accent};padding:8px 12px;border-radius:4px;">
          <div style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;letter-spacing:0.3px;margin-bottom:3px;">Minimum Viable Offer · {_e(mvo_price)}</div>
          <div style="font-size:8px;color:var(--grey-4);line-height:1.4;">{mvo_list}</div>
        </div>'''

    # Optimised Offer — full width
    opt_html = ''
    if optimised:
        opt_features = optimised.get('features', [])
        opt_price = optimised.get('price', '')
        opt_list = ' · '.join(_e(f) for f in opt_features)
        opt_html = f'''<div style="grid-column:1/-1;background:var(--grey-1);border-left:3px solid #27BDBE;padding:8px 12px;border-radius:4px;">
          <div style="font-size:8px;font-weight:700;color:#27BDBE;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:3px;">Optimised Offer · {_e(opt_price)}</div>
          <div style="font-size:8px;color:var(--grey-4);line-height:1.4;">{opt_list}</div>
        </div>'''

    # Utility table — full width (if data present)
    util_html = ''
    if utilities:
        util_rows = ''
        for u in utilities:
            cat = u.get('category', '')
            l1 = u.get('level_1', '')
            l2 = u.get('level_2', '')
            l3 = u.get('level_3', '')
            imp = u.get('importance', '')
            util_rows += f'''<tr>
              <td style="padding:3px 6px;font-size:7px;border-bottom:1px solid var(--grey-2);">{_e(cat)}</td>
              <td style="padding:3px 6px;font-size:7px;text-align:center;border-bottom:1px solid var(--grey-2);">{_e(str(l1))}</td>
              <td style="padding:3px 6px;font-size:7px;text-align:center;border-bottom:1px solid var(--grey-2);">{_e(str(l2))}</td>
              <td style="padding:3px 6px;font-size:7px;text-align:center;border-bottom:1px solid var(--grey-2);">{_e(str(l3))}</td>
              <td style="padding:3px 6px;font-size:7px;text-align:center;font-weight:700;border-bottom:1px solid var(--grey-2);">{_e(str(imp)) + '%' if imp else ''}</td>
            </tr>'''
        util_html = f'''<div style="grid-column:1/-1;background:var(--grey-1);padding:8px 12px;border-radius:4px;">
          <div style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;letter-spacing:0.3px;margin-bottom:4px;">Conjoint Utilities</div>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <th style="padding:3px 6px;font-size:7px;text-align:left;border-bottom:2px solid var(--grey-3);">Category</th>
              <th style="padding:3px 6px;font-size:7px;text-align:center;border-bottom:2px solid var(--grey-3);">Level 1</th>
              <th style="padding:3px 6px;font-size:7px;text-align:center;border-bottom:2px solid var(--grey-3);">Level 2</th>
              <th style="padding:3px 6px;font-size:7px;text-align:center;border-bottom:2px solid var(--grey-3);">Level 3</th>
              <th style="padding:3px 6px;font-size:7px;text-align:center;border-bottom:2px solid var(--grey-3);">Importance</th>
            </tr>
            {util_rows}
          </table>
        </div>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:12px 14px;background:white;">
      {cols_html}
      {surprise_html}
      {mvo_html}
      {opt_html}
      {util_html}
    </div>'''


# ── 15. RAPID EXPERIMENT ──

def _render_board_rapid_experiment(board, pathway):
    """Rapid Experiment: assumption map (2x2) + experiment card."""
    assumptions = board.get('assumptions', [])  # [{assumption, confidence, consequence, quadrant}]
    riskiest = board.get('riskiest', '')
    experiment = board.get('experiment', {})  # {hypothesis, method, sample, metric, timeline, pass_criteria, fail_criteria}
    accent = PATHWAY_COLOURS.get(pathway, '#ED3694')

    # Assumption map as 2x2
    quadrants = {'TEST NOW': [], 'MONITOR': [], 'WATCH': [], 'PARK': []}
    for a in assumptions:
        q = a.get('quadrant', 'TEST NOW').upper()
        if q in quadrants:
            quadrants[q].append(a.get('assumption', ''))
    q_colours = {'TEST NOW': '#FFEBEE', 'MONITOR': '#FFF8E1', 'WATCH': '#E0F7F7', 'PARK': '#EEEDF4'}
    q_text = {'TEST NOW': '#C62828', 'MONITOR': '#F57F17', 'WATCH': '#1a8a8a', 'PARK': 'var(--navy)'}
    map_html = ''
    for qname in ['TEST NOW', 'MONITOR', 'WATCH', 'PARK']:
        items = quadrants[qname]
        items_html = ''.join(f'<div style="font-size:8px;padding:2px 0;border-bottom:1px solid rgba(0,0,0,0.05);">• {_e(i)}</div>' for i in items)
        map_html += f'''<div style="background:{q_colours[qname]};padding:8px;border-radius:3px;">
          <div style="font-size:8px;font-weight:700;color:{q_text[qname]};text-transform:uppercase;margin-bottom:3px;">{qname}</div>
          {items_html}
        </div>'''

    # Experiment card
    exp = experiment
    exp_html = ''
    for key, label in [('hypothesis', 'Hypothesis'), ('method', 'Method'), ('sample', 'Sample'), ('metric', 'Success Metric'), ('timeline', 'Timeline')]:
        v = exp.get(key, '')
        if v:
            exp_html += f'<div class="exp-row"><div class="exp-lbl">{label}</div><div>{_e(v)}</div></div>'

    pass_c = exp.get('pass_criteria', '')
    fail_c = exp.get('fail_criteria', '')
    criteria_html = ''
    if pass_c or fail_c:
        criteria_html = f'''<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px;">
          <div style="background:#E0F7F7;padding:6px 8px;border-radius:3px;"><div style="font-size:8px;font-weight:700;color:#1a8a8a;">PASS</div><div style="font-size:8px;">{_e(pass_c)}</div></div>
          <div style="background:#FFEBEE;padding:6px 8px;border-radius:3px;"><div style="font-size:8px;font-weight:700;color:#C62828;">FAIL</div><div style="font-size:8px;">{_e(fail_c)}</div></div>
        </div>'''

    riskiest_html = ''
    if riskiest:
        riskiest_html = f'''<div style="background:var(--navy);padding:6px 10px;border-radius:3px;margin-top:6px;">
          <div style="font-size:8px;font-weight:700;color:{accent};">RISKIEST ASSUMPTION</div>
          <div style="font-size:10px;font-weight:600;color:white;">{_e(riskiest)}</div>
        </div>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--grey-2);">
      <div style="background:white;padding:12px 14px;">
        <div class="c-label" style="color:{accent};margin-bottom:6px;">Assumption Map</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;">{map_html}</div>
        {riskiest_html}
      </div>
      <div style="background:white;padding:12px 14px;">
        <div class="c-label" style="color:{accent};margin-bottom:6px;">Experiment Card</div>
        <div class="exp-card">{exp_html}{criteria_html}</div>
      </div>
    </div>'''


# ── 16. LEAN CANVAS ──

def _render_board_lean_canvas(board, pathway):
    """Lean Canvas: 9-block grid matching the canonical layout."""
    blocks = board.get('blocks', {})
    accent = PATHWAY_COLOURS.get(pathway, '#E4E517')

    def _block(label, key, style=''):
        text = blocks.get(key, '')
        hyp = ' <span style="font-size:7px;color:var(--grey-3);font-style:italic;">(hypothesis)</span>' if isinstance(text, dict) and text.get('hypothesis') else ''
        content = text if isinstance(text, str) else text.get('text', '') if isinstance(text, dict) else ''
        return f'''<div style="background:white;padding:8px 12px;{style}">
          <div class="c-label" style="color:{accent};">{_e(label)}</div>
          <div class="c-text">{_e(content)}{hyp}</div>
        </div>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr 0.5fr 1fr 0.5fr 1fr;grid-template-rows:1.2fr 0.8fr 0.5fr;gap:1px;background:var(--grey-2);">
      <div style="grid-row:1/3;background:white;padding:8px 12px;">
        <div class="c-label" style="color:{accent};">Problem</div>
        <div class="c-text">{_e(blocks.get('problem', ''))}</div>
        <div style="margin-top:8px;border-top:1px solid var(--grey-2);padding-top:6px;">
          <div class="c-label" style="color:var(--grey-3);">Existing Alternatives</div>
          <div class="c-text sm">{_e(blocks.get('alternatives', ''))}</div>
        </div>
      </div>
      {_block('Solution', 'solution')}
      <div style="grid-row:1/3;background:white;padding:8px 12px;">
        <div class="c-label" style="color:{accent};">Unique Value Proposition</div>
        <div class="c-text" style="font-size:10px;font-weight:600;color:var(--navy);">{_e(blocks.get('uvp', ''))}</div>
      </div>
      {_block('Unfair Advantage', 'unfair_advantage')}
      <div style="grid-row:1/3;background:white;padding:8px 12px;">
        <div class="c-label" style="color:{accent};">Customer Segments</div>
        <div class="c-text">{_e(blocks.get('segments', ''))}</div>
        <div style="margin-top:8px;border-top:1px solid var(--grey-2);padding-top:6px;">
          <div class="c-label" style="color:var(--grey-3);">Early Adopters</div>
          <div class="c-text sm">{_e(blocks.get('early_adopters', ''))}</div>
        </div>
      </div>
      {_block('Key Metrics', 'metrics')}
      {_block('Channels', 'channels')}
      <div style="grid-column:1/3;background:white;padding:8px 12px;">
        <div class="c-label" style="color:{accent};">Cost Structure</div>
        <div class="c-text">{_e(blocks.get('costs', ''))}</div>
      </div>
      <div style="grid-column:3/6;background:white;padding:8px 12px;">
        <div class="c-label" style="color:{accent};">Revenue Streams</div>
        <div class="c-text">{_e(blocks.get('revenue', ''))}</div>
      </div>
    </div>'''


# ── 17. EFFECTUATION ──

def _render_board_effectuation(board, pathway):
    """Effectuation: means + allies + first move."""
    who = board.get('who_you_are', '')
    what = board.get('what_you_know', '')
    who_know = board.get('who_you_know', '')
    allies = board.get('allies', [])  # [{name, contributes}]
    first_move = board.get('first_move', '')
    accent = PATHWAY_COLOURS.get(pathway, '#E4E517')

    allies_html = ''
    for a in allies:
        allies_html += f'<div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid var(--grey-2);font-size:9px;"><span style="font-weight:600;color:var(--navy);min-width:80px;">{_e(a.get("name", ""))}</span><span>{_e(a.get("contributes", ""))}</span></div>'

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr auto;gap:1px;background:var(--grey-2);">
      <div style="background:white;padding:10px 14px;">
        <div class="c-label" style="color:{accent};">Who You Are</div>
        <div class="c-text">{_e(who)}</div>
      </div>
      <div style="background:white;padding:10px 14px;">
        <div class="c-label" style="color:{accent};">What You Know</div>
        <div class="c-text">{_e(what)}</div>
      </div>
      <div style="background:white;padding:10px 14px;">
        <div class="c-label" style="color:{accent};">Who You Know</div>
        <div class="c-text">{_e(who_know)}</div>
      </div>
      <div style="grid-column:1/3;background:white;padding:10px 14px;">
        <div class="c-label" style="color:{accent};">Crazy Quilt — Your Allies</div>
        {allies_html}
      </div>
      <div style="background:white;padding:10px 14px;">
        <div style="background:var(--navy);padding:10px 14px;border-radius:4px;height:100%;display:flex;flex-direction:column;justify-content:center;">
          <div style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;letter-spacing:0.3px;">First Move — 48 Hours</div>
          <div style="font-size:11px;font-weight:600;color:white;margin-top:4px;">{_e(first_move)}</div>
        </div>
      </div>
    </div>'''


# ── 18. FLYWHEEL ──

def _render_board_flywheel(board, pathway):
    """Flywheel: loop components + connection table + bottleneck."""
    components = board.get('components', [])  # [{name, description}]
    connections = board.get('connections', [])  # [{from_to, strength, mechanism}]
    bottleneck = board.get('bottleneck', '')
    accent = PATHWAY_COLOURS.get(pathway, '#E4E517')

    # Loop as numbered sequence
    loop_html = ''
    for i, c in enumerate(components):
        name = c if isinstance(c, str) else c.get('name', '')
        desc = '' if isinstance(c, str) else c.get('description', '')
        desc_html = f'<div style="font-size:8px;color:var(--grey-4);">{_e(desc)}</div>' if desc else ''
        arrow = f'<div style="text-align:center;color:{accent};font-size:16px;margin:2px 0;">↓</div>' if i < len(components) - 1 else f'<div style="text-align:center;color:{accent};font-size:10px;margin:2px 0;">↻ back to 1</div>'
        loop_html += f'''<div style="display:flex;align-items:center;gap:8px;">
          <div style="width:24px;height:24px;border-radius:50%;background:{accent};color:var(--navy);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;">{i+1}</div>
          <div><div style="font-size:10px;font-weight:600;color:var(--navy);">{_e(name)}</div>{desc_html}</div>
        </div>{arrow}'''

    # Connection table
    conn_rows = ''
    for c in connections:
        conn_rows += f'<tr><td style="font-weight:600;">{_e(c.get("from_to", ""))}</td><td>{_tag_html(c.get("strength", ""))}</td><td class="c-text sm">{_e(c.get("mechanism", ""))}</td></tr>'

    bottleneck_html = ''
    if bottleneck:
        bottleneck_html = f'''<div style="background:var(--navy);padding:8px 14px;border-radius:4px;">
          <div style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;">The Bottleneck</div>
          <div style="font-size:10px;font-weight:600;color:white;">{_e(bottleneck)}</div>
        </div>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr auto;gap:1px;background:var(--grey-2);">
      <div style="background:white;padding:12px 14px;">
        <div class="c-label" style="color:{accent};margin-bottom:8px;">The Flywheel</div>
        {loop_html}
      </div>
      <div style="background:white;padding:12px 14px;overflow:auto;">
        <div class="c-label" style="color:{accent};margin-bottom:4px;">Connection Strength</div>
        <table class="ct">
          <tr><th>Connection</th><th>Strength</th><th>Mechanism</th></tr>
          {conn_rows}
        </table>
      </div>
      <div style="grid-column:1/3;background:white;padding:8px 14px;">{bottleneck_html}</div>
    </div>'''


# ── 19. THEORY OF CHANGE ──

def _render_board_theory_of_change(board, pathway):
    """Theory of Change: causal chain flow + sphere classification."""
    outcome = board.get('outcome', '')
    activities = board.get('activities', [])  # [{activity, precondition, sphere}]
    preconditions = board.get('preconditions', [])  # [{precondition, sphere}]
    accent = PATHWAY_COLOURS.get(pathway, '#E4E517')
    sphere_colours = {'Within Control': '#E0F7F7', 'Within Influence': '#FFF8E1', 'Outside Control': '#FFEBEE'}
    sphere_text = {'Within Control': '#1a8a8a', 'Within Influence': '#F57F17', 'Outside Control': '#C62828'}

    # Activities → Preconditions flow
    act_html = ''
    for a in activities:
        act = a if isinstance(a, str) else a.get('activity', '')
        pre = '' if isinstance(a, str) else a.get('precondition', '')
        act_html += f'''<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--grey-2);font-size:9px;">
          <span style="font-weight:600;color:var(--navy);min-width:120px;">{_e(act)}</span>
          <span style="color:var(--grey-3);">→</span>
          <span>{_e(pre)}</span>
        </div>'''

    # Preconditions with sphere classification
    pre_html = ''
    for p in preconditions:
        name = p if isinstance(p, str) else p.get('precondition', '')
        sphere = '' if isinstance(p, str) else p.get('sphere', 'Within Control')
        bg = sphere_colours.get(sphere, '#EEEDF4')
        tc = sphere_text.get(sphere, 'var(--navy)')
        pre_html += f'''<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--grey-2);font-size:9px;">
          <span style="flex:1;">{_e(name)}</span>
          <span class="tag" style="background:{bg};color:{tc};">{_e(sphere)}</span>
        </div>'''

    outcome_html = ''
    if outcome:
        outcome_html = f'''<div style="background:var(--navy);padding:10px 16px;border-radius:4px;">
          <div style="font-size:8px;font-weight:700;color:{accent};text-transform:uppercase;">The Outcome</div>
          <div style="font-size:11px;font-weight:600;color:white;">{_e(outcome)}</div>
        </div>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr auto;gap:1px;background:var(--grey-2);">
      <div style="background:white;padding:12px 14px;">
        <div class="c-label" style="color:{accent};margin-bottom:4px;">Activities → Preconditions</div>
        {act_html}
      </div>
      <div style="background:white;padding:12px 14px;">
        <div class="c-label" style="color:{accent};margin-bottom:4px;">Preconditions — Sphere Classification</div>
        {pre_html}
      </div>
      <div style="grid-column:1/3;background:white;padding:8px 14px;">{outcome_html}</div>
    </div>'''


# ── 20. WARDLEY MAPPING ──

def _render_board_wardley(board, pathway):
    """Wardley Map: two-axis component grid with evolution stages."""
    user_need = board.get('user_need', '')
    components = board.get('components', [])  # [{name, evolution, visibility, dependencies}]
    movements = board.get('movements', [])  # [{component, direction, rationale}]
    accent = PATHWAY_COLOURS.get(pathway, '#E4E517')

    evolution_bg = {'Genesis': '#fff0f0', 'Custom': '#fff8e0', 'Product': '#e8f5e9', 'Commodity': '#e3f2fd'}
    evolution_colour = {'Genesis': '#C62828', 'Custom': '#F57F17', 'Product': '#1a8a8a', 'Commodity': '#1565C0'}

    # Component table
    comp_rows = ''
    for c in components:
        evo = c.get('evolution', 'Custom')
        bg = evolution_bg.get(evo, 'white')
        ec = evolution_colour.get(evo, 'var(--navy)')
        deps = ', '.join(c.get('dependencies', [])) if c.get('dependencies') else ''
        comp_rows += f'''<tr>
          <td style="font-weight:600;color:var(--navy);">{_e(c.get('name', ''))}</td>
          <td style="background:{bg};"><span style="color:{ec};font-weight:600;">{_e(evo)}</span></td>
          <td>{_e(c.get('visibility', ''))}</td>
          <td class="c-text sm">{_e(deps)}</td>
        </tr>'''

    # Movements
    mov_html = ''
    for m in movements:
        mov_html += f'''<div style="padding:4px 0;border-bottom:1px solid var(--grey-2);font-size:9px;">
          <span style="font-weight:600;color:var(--navy);">{_e(m.get('component', ''))}</span>
          <span style="color:var(--grey-3);">→</span>
          <span>{_e(m.get('direction', ''))}</span>
          <span class="c-text sm" style="color:var(--grey-3);margin-left:4px;">{_e(m.get('rationale', ''))}</span>
        </div>'''

    return f'''<div style="flex:1;display:grid;grid-template-columns:1.5fr 0.5fr;grid-template-rows:auto 1fr;gap:1px;background:var(--grey-2);">
      <div style="grid-column:1/3;background:white;padding:10px 20px;">
        <div class="c-label" style="color:{accent};">User Need</div>
        <div style="font-size:11px;font-weight:600;color:var(--navy);">{_e(user_need)}</div>
      </div>
      <div style="background:white;padding:10px 14px;overflow:auto;">
        <div class="c-label" style="color:{accent};margin-bottom:4px;">Component Map</div>
        <table class="ct">
          <tr><th>Component</th><th>Evolution</th><th>Visibility</th><th>Dependencies</th></tr>
          {comp_rows}
        </table>
      </div>
      <div style="background:white;padding:10px 14px;">
        <div class="c-label" style="color:{accent};margin-bottom:4px;">Movements</div>
        {mov_html}
      </div>
    </div>'''


# ══════════════════════════════════════════════════════════════
# CANVAS BOARD DISPATCHER
# ══════════════════════════════════════════════════════════════

BOARD_RENDERERS = {
    'five-whys': _render_board_five_whys,
    'jtbd': _render_board_jtbd,
    'empathy-map': _render_board_empathy_map,
    'socratic': _render_board_socratic,
    'iceberg': _render_board_iceberg,
    'hmw': _render_board_hmw,
    'scamper': _render_board_scamper,
    'crazy-8s': _render_board_crazy_8s,
    'mash-up': _render_board_mash_up,
    'analogical': _render_board_mash_up,
    'constraint-flip': _render_board_constraint_flip,
    'pre-mortem': _render_board_pre_mortem,
    'devils-advocate': _render_board_devils_advocate,
    'reality-check': _render_board_reality_check,
    'cold-open': _render_board_cold_open,
    'trade-off': _render_board_trade_off,
    'rapid-experiment': _render_board_rapid_experiment,
    'lean-canvas': _render_board_lean_canvas,
    'effectuation': _render_board_effectuation,
    'flywheel': _render_board_flywheel,
    'theory-of-change': _render_board_theory_of_change,
    'wardley': _render_board_wardley,
}

CANVAS_DURATIONS = {
    'five-whys': '15 min', 'jtbd': '20 min', 'empathy-map': '15 min',
    'socratic': '20 min', 'iceberg': '20 min',
    'hmw': '20 min', 'scamper': '15 min', 'crazy-8s': '15 min',
    'mash-up': '20 min', 'constraint-flip': '20 min',
    'pre-mortem': '20 min', 'devils-advocate': '30 min', 'cold-open': '20 min',
    'trade-off': '25 min', 'rapid-experiment': '15 min',
    'lean-canvas': '25 min', 'effectuation': '20 min', 'flywheel': '25 min',
    'theory-of-change': '25 min', 'wardley': '25 min',
}


def render_board_canvas(board_data, exercise, pathway, headline=None):
    """
    Render a tool-specific landscape canvas board page.

    Args:
        board_data: dict with tool-specific board fields
        exercise: exercise key (five-whys, lean-canvas, etc.)
        pathway: pathway key (untangle, spark, test, build)
        headline: report headline to display below the header

    Returns:
        HTML string for the landscape board page content (inside .canvas div)
    """
    renderer = BOARD_RENDERERS.get(exercise)
    if not renderer or not board_data:
        return ''

    inner = renderer(board_data, pathway)
    headline_html = ''
    if headline:
        headline_html = f'<div class="c-headline">{_e(headline)}</div>'

    return f'''<div class="canvas">
      {headline_html}
      {inner}
    </div>'''


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

    # ── PAGE 1: Context + Executive Summary ──
    # Session Context block: user's starting point in their own words (challenge field)
    # Executive Summary: headline finding + insights + opening synthesis + top 3 actions (short)
    actions_short_html = _render_actions_short(actions)
    actions_short_section = f'''<hr class="div">
    <div class="sec">
      {_render_section_heading("Top actions")}
      {actions_short_html}
    </div>''' if actions_short_html else ''

    page1_body = f'''{_render_context_block(challenge)}
    <div class="sec">
      {_render_section_heading("Executive summary")}
      {_paragraphs(opening)}
      {actions_short_section}
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

    # ── PAGE 4: Go Further (portrait) ──
    pages.append(f'''<div class="page">
  {_render_header(pathway, exercise, date_str, include_date=False)}
  <div class="page-body">
    {_render_cta(go_further)}
  </div>
  {{footer_4}}
</div>''')

    # ── PAGE 5: Workshop Board Canvas (landscape) ──
    canvas_html = render_board_canvas(board_summary, exercise, pathway, headline=headline)
    if canvas_html:
        source = CANVAS_SOURCES.get(exercise, '')
        source_left = f'Framework: {_e(source)} · {_e(date_str)}' if source else f'Generated by The Studio · Wade Institute of Entrepreneurship · {_e(date_str)}'
        pages.append(f'''<div class="page page--landscape">
  {_render_header(pathway, exercise, date_str, include_date=False)}
  <div style="padding:0 var(--page-x);flex:1;overflow:hidden;">
    {canvas_html}
  </div>
  <div class="ftr">
    <span>{source_left}</span>
    <span class="ftr-page">%%CANVAS_PN%% / %%CANVAS_TP%%</span>
  </div>
</div>''')

    total_pages = len(pages)
    # Fill in footers
    for i in range(total_pages):
        is_last = (i == total_pages - 1)
        footer = _render_footer(i + 1, total_pages, is_last=is_last)
        pages[i] = pages[i].replace(f'{{footer_{i + 1}}}', footer)
        # Canvas page has its own footer with page number placeholders
        pages[i] = pages[i].replace('%%CANVAS_PN%%', str(i + 1)).replace('%%CANVAS_TP%%', str(total_pages))

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
    # Count actual pages in the HTML
    page_count = html_content.count('class="page"') + html_content.count('class="page ')

    # Replace the <html> tag with Office-namespaced version
    doc_html = html_content.replace(
        '<html lang="en">',
        '<html xmlns:o="urn:schemas-microsoft-com:office:office" '
        'xmlns:w="urn:schemas-microsoft-com:office:word" lang="en">'
    )
    # Inject Word-specific page setup after <head>
    word_setup = f'''
<xml>
  <o:DocumentProperties>
    <o:Pages>{page_count}</o:Pages>
  </o:DocumentProperties>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
  </w:WordDocument>
</xml>
<style>
  @page {{ size: 210mm 297mm; margin: 0; }}
  @page landscape-page {{ size: 297mm 210mm; margin: 0; }}
  .page--landscape {{ page: landscape-page; }}
</style>'''
    doc_html = doc_html.replace('</head>', f'{word_setup}\n</head>')
    return doc_html
