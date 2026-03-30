#!/usr/bin/env python3
"""Generate a single high-quality showcase report for the homepage sample link."""
import os
from report_template import render_report_html

OUTDIR = 'sample-reports'
os.makedirs(OUTDIR, exist_ok=True)

# ── Trade-Off showcase report ──
# Rich narrative based on a realistic project management SaaS scenario

report_json = {
    'headline': "Your customers don't want everything you're building",
    'subtitle': 'Six rounds of forced trade-offs revealed only three of seven features survive contact with reality — and your favourite feature wasn\'t one of them.',
    'insights': [
        {'label': 'Features tested', 'number': '7', 'description': 'Seven planned features entered. Three survived.'},
        {'label': 'The surprise', 'number': '5/6', 'description': 'Real-time collaboration — the centrepiece of the pitch deck — lost five of six rounds.'},
        {'label': 'The winner', 'number': '6/6', 'description': 'Automated reporting won every round. The feature nearly cut for feeling "boring".'}
    ],
    'opening': 'You came in with seven features planned for launch. A full-featured project management tool for mid-size agencies. "We need all of them," you said. Six rounds of forced trade-offs later, the picture looks very different. Three features dominate. Three are expendable. And the one you were most excited about — real-time collaboration, the centrepiece of the pitch deck, the most technically complex thing you\'ve built — lost five of six rounds.',
    'challenge': 'Building a project management SaaS for mid-size agencies (15–80 people). Seven features in the launch roadmap, limited runway, and a team convinced everything is equally important. The real question: if you can only ship three features at launch, which three?',
    'evidence': {
        'text': 'Each round forced a choice between competing feature bundles, stripping away comfort and forcing harder decisions. Here\'s what survived.',
        'components': [
            {
                'type': 'feature_list',
                'items': [
                    {'bold': 'Automated weekly reporting', 'description': 'Client-facing status updates generated from task data'},
                    {'bold': 'One-click integrations', 'description': 'Slack, Google Drive, Xero without setup friction'},
                    {'bold': 'Real-time collaboration', 'description': 'Live cursors, comments, co-editing inside the tool'},
                    {'bold': 'Custom workflows', 'description': 'Drag-and-drop pipeline builder per client'},
                    {'bold': 'Time tracking', 'description': 'Built-in timer linked to tasks and invoicing'},
                    {'bold': 'AI task suggestions', 'description': 'Auto-generates next steps based on project patterns'},
                    {'bold': 'White-label client portal', 'description': 'Branded view for external stakeholders'}
                ]
            },
            {
                'type': 'value_stack',
                'tiers': [
                    {
                        'tier_class': 'must',
                        'name': 'Must-haves',
                        'range': 'Won 5–6 rounds',
                        'items': [
                            {'name': 'Automated weekly reporting', 'wins': '6/6'},
                            {'name': 'One-click integrations', 'wins': '5/6'}
                        ]
                    },
                    {
                        'tier_class': 'strong',
                        'name': 'Strong performers',
                        'range': 'Won 3–4 rounds',
                        'items': [
                            {'name': 'Time tracking', 'wins': '4/6'},
                            {'name': 'White-label client portal', 'wins': '3/6'}
                        ]
                    },
                    {
                        'tier_class': 'cut',
                        'name': 'Expendable',
                        'range': 'Won 0–2 rounds',
                        'items': [
                            {'name': 'Custom workflows', 'wins': '2/6'},
                            {'name': 'AI task suggestions', 'wins': '1/6'},
                            {'name': 'Real-time collaboration', 'wins': '1/6'}
                        ]
                    }
                ]
            },
            {
                'type': 'callout',
                'bold': 'The surprise.',
                'text': 'Real-time collaboration — the feature you were most excited about, the centrepiece of your pitch deck, and the most technically complex thing you\'ve built — lost five of six rounds. Meanwhile, automated reporting — a feature you nearly cut for feeling "boring" — won every single round.'
            }
        ]
    },
    'evidence_heading': 'The six rounds',
    'key_moments': [
        {'moment': '"I keep choosing reporting over collaboration — I think our customers don\'t care about what we care about."', 'why_it_matters': 'The first sign that builder excitement and buyer need had diverged.'},
        {'moment': '"Automated reporting saves an agency owner 45 minutes every Monday. Collaboration saves us a cool demo."', 'why_it_matters': 'Reframed the entire value proposition from novelty to utility.'},
        {'moment': '"If I\'m honest, we built collaboration because it was fun to build. Not because anyone asked for it."', 'why_it_matters': 'The admission that changed the launch plan.'}
    ],
    'reframe': {
        'before': 'We need to ship all seven features to compete with Monday.com and Asana.',
        'after': 'We need to ship three features that save an agency owner 45 minutes every week — and charge less than the tools that try to do everything.',
        'so_what': 'The minimum viable offer is simpler and cheaper than planned — but that\'s a faster path to revenue and a clearer positioning story. Lead with utility, not novelty. The features that lost aren\'t dead ideas — they\'re roadmap items for after you have 50 paying customers.'
    },
    'questions': [
        {'tag': 'Product', 'question': 'Is the reporting engine genuinely best-in-class, or an afterthought that now needs real investment?'},
        {'tag': 'Positioning', 'question': 'What does the pricing page look like leading with "Automated client reports in 30 seconds" instead of "All-in-one project management"?'},
        {'tag': 'Honesty', 'question': 'Which expendable features are you still emotionally attached to — and why?'},
        {'tag': 'Competition', 'question': 'If a competitor launched with just reporting + integrations tomorrow, how would you respond?'}
    ],
    'actions': [
        {'action': 'Rebuild launch scope around the three must-haves: reporting, integrations, time tracking. Cut everything else from v1.', 'timeframe': 'This week', 'owner': 'Founder + CTO'},
        {'action': 'Run 5 customer interviews showing two pricing tiers — core bundle at $39/mo vs. full suite at $69/mo.', 'timeframe': '2 weeks', 'owner': 'Founder'},
        {'action': 'Rewrite positioning: lead with the boring feature. "Automated client reports in 30 seconds" is the headline, not "All-in-one project management".', 'timeframe': '2 weeks', 'owner': 'Marketing'},
        {'action': 'Shelf the collaboration engine. Don\'t delete the code — remove it from product and marketing until 50 paying customers ask for it.', 'timeframe': 'This week', 'owner': 'CTO'}
    ],
    'board_summary': {
        'rounds': [
            {'number': 1, 'packages': ['Reporting + Integrations', 'Collaboration + Custom Workflows'], 'chosen': 'Reporting + Integrations'},
            {'number': 2, 'packages': ['Time Tracking + Portal', 'AI Suggestions + Collaboration'], 'chosen': 'Time Tracking + Portal'},
            {'number': 3, 'packages': ['Reporting + Time Tracking', 'Collaboration + AI'], 'chosen': 'Reporting + Time Tracking'},
            {'number': 4, 'packages': ['Integrations + Portal', 'Workflows + Collaboration'], 'chosen': 'Integrations + Portal'},
            {'number': 5, 'packages': ['Reporting + AI', 'Integrations + Workflows'], 'chosen': 'Reporting + Integrations'},
            {'number': 6, 'packages': ['All must-haves', 'All expendables'], 'chosen': 'Must-haves'}
        ],
        'value_stack': [
            {
                'tier': 'must',
                'items': [
                    {'name': 'Automated weekly reporting', 'wins': '6/6'},
                    {'name': 'One-click integrations', 'wins': '5/6'}
                ]
            },
            {
                'tier': 'nice',
                'items': [
                    {'name': 'Time tracking', 'wins': '4/6'},
                    {'name': 'White-label client portal', 'wins': '3/6'}
                ]
            },
            {
                'tier': 'expendable',
                'items': [
                    {'name': 'Custom workflows', 'wins': '2/6'},
                    {'name': 'AI task suggestions', 'wins': '1/6'},
                    {'name': 'Real-time collaboration', 'wins': '1/6'}
                ]
            }
        ]
    },
    'go_further': {
        'text': 'This pattern — building for the demo instead of the buyer — is one of the most common reasons startups overbuild and underprice. The Trade-Off exercise surfaced it in 25 minutes. Imagine what a full program does.',
        'cards': [
            {'heading': 'Recommended reading', 'body': 'Explore more tools in The Studio to pressure-test your assumptions, validate demand, and build with confidence.'},
            {'heading': 'Wade programs', 'body': 'Wade\'s flagship program takes you beyond the tools. Build your venture with a cohort of founders, expert mentors, and structured support.'},
            {'heading': 'From the Wade community', 'body': '"I cut my roadmap in half after a single Trade-Off session. We launched three months earlier and doubled our conversion rate." — James Nguyen, MoE \'24'}
        ]
    }
}

html = render_report_html(report_json, 'test', 'trade-off')

# Write as the homepage showcase
with open(os.path.join(OUTDIR, 'showcase.html'), 'w') as f:
    f.write(html)

# Also update the trade-off sample
with open(os.path.join(OUTDIR, 'trade-off.html'), 'w') as f:
    f.write(html)

print(f'  OK  showcase.html ({len(html):,} bytes)')
print(f'  OK  trade-off.html ({len(html):,} bytes)')
