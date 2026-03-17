# WAiDE — CLAUDE.md

Project operating guide for Claude Code. Auto-loaded every session.

---

## What this project is

**WAiDE** is a Flask + Anthropic Claude API coaching tool built for Wade Institute of Entrepreneurship. It guides users (founders, investors, educators, corporate innovators) through structured innovation frameworks, generates a personalised report at the end, and captures leads via an email form.

Production URL: deployed on **Railway** — auto-deploys on every push to `origin/main`.
Remote: `https://github.com/thisiskimsemail-ship-it/wayde.git`
Push via PAT: stored in local session — do not commit

---

## Git workflow

All edits happen in the worktree:
```
/Users/khowells/wade-manifesto/.claude/worktrees/gallant-dubinsky/
```
Branch: `claude/gallant-dubinsky`

**After editing:**
1. Copy changed files to main repo: `cp <worktree>/file /Users/khowells/wade-manifesto/file`
2. `cd /Users/khowells/wade-manifesto`
3. `git add <files> && git commit -m "..."`
4. `git push https://<PAT>@github.com/thisiskimsemail-ship-it/wayde.git main`

Railway picks up the push and deploys in ~90 seconds.

---

## Key files

| File | Purpose |
|---|---|
| `server.py` | Flask backend — all routes, system prompts, WADE_KNOWLEDGE_BLOCK, email, lead capture |
| `index.html` | All UI — welcome cards, chat, report, lead form. Cache-bust script tag at `?v=57` |
| `app.js` | Frontend logic — `EXERCISE_LABELS`, `MODE_LABELS`, chat state, report trigger |
| `styles.css` | All styling — GT Walsheim font, stage colours, dark/light theme, responsive layout |
| `fonts/` | GT-Walsheim-Regular.woff/.ttf/.otf |
| `leads.json` | Lead capture storage (local file — lost on Railway redeploy; Google Sheets export pending) |

**Cache-busting rule:** Increment `?v=N` on the `app.js` script tag in `index.html` every time `app.js` changes.

---

## Brand

### Naming — critical
- The tool is always **WAiDE** — W, lowercase a, capital i, D, E. Never "Wayde", "WADE", "Wade"
- The organisation is **Wade Institute of Entrepreneurship** on first reference, **Wade Institute** after that
- Never "The Wade Institute" or "Wade" alone

### Colours (official hex)
| Stage / Name | Hex |
|---|---|
| Orange (Clarify) | `#F15A22` |
| Deep navy (background) | `#1E194F` |
| Pink (Ideate) | `#ED3694` |
| Teal (Validate) | `#27BDBE` |
| Yellow (Develop) | `#E4E517` |
| Light grey 1 | `#F6F5F5` |
| Light grey 2 | `#E7E6E5` |
| Mid grey | `#A8A4A5` |
| Dark grey | `#49474D` |

Note: `--orange` in CSS uses `#ef5a21` (close, not exact). Official is `#F15A22`.

---

## Stage structure

| Display name | Internal `data-mode` | Colour | Tools |
|---|---|---|---|
| Clarify | `reframe` | orange | Five Whys, Jobs to Be Done, Empathy Map |
| Ideate | `ideate` | pink | How Might We, SCAMPER, Crazy 8s |
| Validate | `debate` | teal | Pre-Mortem, Devil's Advocate, Rapid Experiment |
| Develop | `framework` | yellow | Lean Canvas, Effectuation, Analogical Thinking |

CSS class names (`card-reframe`, `card-ideate`, `card-debate`, `card-framework`) are stable internal names — display names are separate in `app.js`.

### System prompt keys (`server.py → SYSTEM_PROMPTS`)
`reframe:five-whys`, `reframe:jtbd`, `reframe:empathy-map`
`ideate:hmw`, `ideate:scamper`, `ideate:crazy-8s`
`debate:pre-mortem`, `debate:devils-advocate`, `debate:rapid-experiment`
`framework:lean-canvas`, `framework:effectuation`, `framework:analogical`

Key format: `{mode}:{exercise}` — must match `data-mode` + `data-exercise` on the button in `index.html`.

---

## Architecture

### Backend routes (`server.py`)
| Route | Method | Purpose |
|---|---|---|
| `/` | GET | Serve `index.html` |
| `/api/chat` | POST | Streaming chat — takes `messages`, `mode`, `exercise` |
| `/api/swap-tools` | POST | Tool routing — suggests next framework |
| `/api/report` | POST | Generate end-of-session report |
| `/api/linkedin` | POST | Generate structured LinkedIn post |
| `/api/share` | POST | Create shareable report link |
| `/r/<report_id>` | GET | View shared report |
| `/api/lead` | POST | Capture lead, send Resend emails, save to leads.json |

### WADE_KNOWLEDGE_BLOCK
Built by `build_wade_knowledge_block()` — compiled from:
- `WADE_PROGRAMS` — 9 programs with prospectus data, matching signals
- `WADE_PEOPLE` — 25 people with cluster, match_roles, match_challenges, match_when
- `WADE_COMMUNITY_ARTICLES` — 47 articles (match_when signals incomplete — pending)

Injected into the report system prompt to power intelligent program + people matching.

### Audience cluster inference
Four clusters inferred silently from conversation (never asked explicitly):
`INVESTOR` / `FOUNDER` / `CORPORATE INNOVATOR` / `EDUCATOR`

Report tone adapts per cluster — two-step in `REPORT_PROMPT`: identify cluster → apply lens.

---

## Email (Resend)

- API key: stored in Railway env as `RESEND_API_KEY` — do not commit
- Sender: always `enquiries@wadeinstitute.org.au` — **never** `wayde@wadeinstitute.org.au`
- BCC on every email: `442435393@bcc.ap1.hubspot.com` (HubSpot logging)
- Implementation: `_resend_send_email()` in `server.py` — uses `urllib.request`, no extra deps
- Domain verification pending in Resend dashboard for `enquiries@wadeinstitute.org.au`

---

## Known pending work

| Item | Priority | Notes |
|---|---|---|
| Google Sheets export for leads | High | `leads.json` is lost on Railway redeploy |
| Resend domain verification | High | `enquiries@` must be verified in Resend dashboard |
| Article `match_when` signals | Medium | 47 articles need signals added to `WADE_COMMUNITY_ARTICLES` |
| Logo SVG source | Low | PNG only — SVG needed for wink/smile animation |
| In-conversation program timing | Low | Mention programs during chat, not just report |

---

## Preview server

Local preview server ID: `45dc10f7-60a1-4c85-90e8-168323f329de` (port 3000, MCP tool)

Use `mcp__Claude_Preview__preview_start` to start, `preview_screenshot` to review, `preview_eval` for debugging only — never use eval to implement permanent changes.
