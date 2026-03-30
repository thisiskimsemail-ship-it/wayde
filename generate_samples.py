#!/usr/bin/env python3
"""Generate sample HTML reports for all 20 tools."""
import os
from report_template import render_report_html

OUTDIR = 'sample-reports'
os.makedirs(OUTDIR, exist_ok=True)

def base(headline, subtitle, opening, challenge, evidence_detail, key_moments, reframe, questions, actions, board_summary, evidence_heading='What emerged'):
    return {
        'headline': headline,
        'subtitle': subtitle,
        'insights': [
            {'label': 'Insight 1', 'number': '3x', 'description': 'Key finding from the session'},
            {'label': 'Insight 2', 'number': '47%', 'description': 'Supporting metric discovered'},
            {'label': 'Insight 3', 'number': '12', 'description': 'Actions identified for next steps'}
        ],
        'opening': opening,
        'challenge': challenge,
        'evidence': {'what_emerged': evidence_detail[0], 'detail': evidence_detail[1]},
        'evidence_heading': evidence_heading,
        'key_moments': key_moments,
        'reframe': reframe,
        'questions': questions,
        'actions': actions,
        'board_summary': board_summary,
        'go_further': {
            'heading': 'Go Further with Wade Institute',
            'body': 'This is exactly the kind of challenge the Wade Institute helps solve.',
            'cta_text': 'Explore Programs',
            'cta_url': 'https://www.wadeinstitute.org.au'
        }
    }

TOOLS = {
    'five-whys': ('untangle', base(
        'Your retention problem is actually an activation problem',
        'Five layers of questioning revealed the real blocker.',
        'You came in worried about 40% monthly churn. But as we dug deeper, a different picture emerged.',
        'Monthly churn of 40% is killing Series A metrics.',
        ('Each why peeled back another layer.', [
            {'label': 'Why #1', 'text': 'Users churn within 14 days — never reach the aha moment'},
            {'label': 'Why #2', 'text': 'Onboarding completion rate is only 23%'},
            {'label': 'Why #3', 'text': 'The 7-step flow asks for too much upfront'},
            {'label': 'Why #4', 'text': 'It was designed by engineers for technical users'},
            {'label': 'Why #5', 'text': 'No user research on actual customer segment (SMB owners)'}
        ]),
        [{'moment': 'Shift from retention to activation framing', 'why_it_matters': 'Changed the solution space entirely'},
         {'moment': '7-step flow had zero user research', 'why_it_matters': 'Systemic gap in product process'},
         {'moment': '23% completion tied to Series A timeline', 'why_it_matters': 'Made it urgent, not nice-to-have'}],
        {'before': 'We have a retention problem', 'after': 'We have an activation problem — users never complete onboarding', 'so_what': 'Invest in a 3-step onboarding flow validated with SMB owner interviews.'},
        [{'tag': 'UX', 'question': 'What does a good first experience look like for an SMB owner?'},
         {'tag': 'Metric', 'question': 'Can onboarding completion go from 23% to 60% in 4 weeks?'},
         {'tag': 'Strategy', 'question': 'What if the aha moment happened before signup?'}],
        [{'action': 'Run 10 interviews with churned SMB users', 'timeframe': '7 days', 'owner': 'Product lead'},
         {'action': 'Prototype a 3-step onboarding flow', 'timeframe': '2 weeks', 'owner': 'Design'},
         {'action': 'Set up activation rate tracking', 'timeframe': '3 days', 'owner': 'Analytics'}],
        {
            'problem': 'Monthly churn rate of 40% killing Series A metrics',
            'chain': ['Users churn within 14 days', 'Onboarding completion rate is only 23%', 'The 7-step flow asks too much upfront', 'Designed by engineers for technical users', 'No user research on SMB owners'],
            'root_cause': 'No user research led to a signup flow creating friction instead of value.',
            'countermeasure': 'Run 10 user interviews and prototype a 3-step onboarding flow.',
            'reframed_problem': 'Retention problem is actually an activation problem.',
            'verification': 'Track onboarding completion and Day-14 activation over 4 weeks.',
            'scorecard': [
                {'dimension': 'Customer Understanding', 'finding': 'Zero user research pre-launch', 'rating': 'HIGH'},
                {'dimension': 'Onboarding Design', 'finding': '7 steps too many for SMBs', 'rating': 'HIGH'},
                {'dimension': 'Metric Clarity', 'finding': 'Tracking churn not activation', 'rating': 'MEDIUM'},
                {'dimension': 'Product-Market Fit', 'finding': 'Core value exists but unreachable', 'rating': 'MEDIUM'}
            ],
            'verdict': 'Fix onboarding and churn solves itself.'
        }
    )),
    'jtbd': ('untangle', base(
        'Your customers are hiring you to feel in control, not to track data',
        'Jobs to Be Done revealed the emotional core behind feature requests.',
        'You assumed users wanted more analytics dashboards. The real job is about confidence and control during uncertainty.',
        'Feature requests keep coming but NPS is flat at 32.',
        ('The JTBD framework exposed the gap between what users ask for and what they actually need.', [
            {'label': 'Functional job', 'text': 'Track business metrics in one place'},
            {'label': 'Emotional job', 'text': 'Feel confident sharing numbers with the board'},
            {'label': 'Social job', 'text': 'Look like a data-driven founder to investors'},
            {'label': 'Key insight', 'text': 'The dashboard is a confidence tool, not an analytics tool'}
        ]),
        [{'moment': 'When push/pull forces revealed anxiety about board meetings', 'why_it_matters': 'Reframed the entire value proposition'},
         {'moment': 'Habit force was stronger than expected', 'why_it_matters': 'Switching cost is emotional, not functional'}],
        {'before': 'Users want more dashboards and features', 'after': 'Users want to feel confident and in control when facing stakeholders', 'so_what': 'Build for confidence, not complexity.'},
        [{'tag': 'Product', 'question': 'What would a confidence-first dashboard look like?'},
         {'tag': 'UX', 'question': 'How can the first screen answer: am I on track?'},
         {'tag': 'Growth', 'question': 'Can you position around board-readiness not analytics?'}],
        [{'action': 'Interview 5 users about their last board meeting prep', 'timeframe': '1 week', 'owner': 'Product'},
         {'action': 'Prototype a board-ready summary view', 'timeframe': '2 weeks', 'owner': 'Design'},
         {'action': 'A/B test confidence framing vs feature framing in onboarding', 'timeframe': '3 weeks', 'owner': 'Growth'}],
        {
            'customer': 'Early-stage founder (Seed to Series A) managing 3-8 stakeholders',
            'job_story': 'When I have a board meeting in 48 hours, I want to pull together a clear picture of my metrics so I can walk in feeling prepared and credible.',
            'push': {'text': 'Spreadsheet chaos before every board meeting', 'detail': 'Takes 6+ hours to compile metrics from 4 different tools'},
            'pull': {'text': 'One place that makes me look data-driven', 'detail': 'Board-ready summary in under 10 minutes'},
            'anxiety': {'text': 'What if the numbers look bad and I cannot explain them?', 'detail': 'Fear of losing investor confidence'},
            'habit': {'text': 'Manual spreadsheet feels like I know every number intimately', 'detail': 'Switching means trusting a tool with the most important meeting of the quarter'},
            'switching_timeline': [
                {'stage': 'First thought', 'time': 'After a stressful board meeting'},
                {'stage': 'Active search', 'time': '2-3 weeks before next board meeting'},
                {'stage': 'Decision', 'time': 'After a free trial covers one board cycle'}
            ],
            'gap_analysis': 'The product solves the functional job well but ignores the emotional job entirely. No board-readiness features exist.'
        }
    )),
    'empathy-map': ('untangle', base(
        'Your users say they want speed but they actually need reassurance',
        'The empathy map revealed a gap between stated and actual needs.',
        'Speed was the top feature request, but the empathy map told a different story about what users truly need.',
        'Users rate speed as #1 priority but satisfaction with fast features is still low.',
        ('Mapping what users say, think, do, and feel exposed a contradiction.', [
            {'label': 'Says', 'text': 'I need this to be faster'},
            {'label': 'Thinks', 'text': 'I hope I am not making a mistake'},
            {'label': 'Does', 'text': 'Checks the same screen 3-4 times before committing'},
            {'label': 'Feels', 'text': 'Anxious about irreversible decisions'}
        ]),
        [{'moment': 'The says vs does contradiction', 'why_it_matters': 'Users ask for speed but their behaviour shows they want undo/safety'},
         {'moment': 'Anxiety about irreversible actions', 'why_it_matters': 'Explains why fast features do not move NPS'}],
        {'before': 'Users want speed above all else', 'after': 'Users want confidence that they can undo mistakes', 'so_what': 'Add confirmation steps and undo — not more speed.'},
        [{'tag': 'UX', 'question': 'What if every destructive action had a 10-second undo?'},
         {'tag': 'Product', 'question': 'Can you add a preview mode for high-stakes actions?'},
         {'tag': 'Research', 'question': 'What are the top 3 actions users check multiple times?'}],
        [{'action': 'Add undo to the top 5 destructive actions', 'timeframe': '2 weeks', 'owner': 'Engineering'},
         {'action': 'User-test a preview/confirm flow', 'timeframe': '1 week', 'owner': 'UX Research'},
         {'action': 'Track re-check behaviour in analytics', 'timeframe': '3 days', 'owner': 'Data'}],
        {
            'person': 'Sarah, 34, Operations Manager at a Series B SaaS company',
            'says': 'I just need this to be faster. Every click feels like it wastes my time.',
            'thinks': 'What if I accidentally delete something important? Can I get it back?',
            'does': 'Checks the confirmation screen 3-4 times. Takes screenshots before making changes.',
            'feels': 'Anxious about irreversible actions. Relieved when she sees an undo option.',
            'contradiction': 'Says she wants speed, but her behaviour shows she prioritises safety and reversibility.',
            'insight': 'Speed is a proxy for control. Users want to move fast only when they trust they can recover from mistakes.'
        }
    )),
    'socratic': ('untangle', base(
        'Three of your five core beliefs about your market are untested assumptions',
        'Socratic questioning exposed foundational assumptions hiding in plain sight.',
        'You were confident about your market thesis. Rigorous questioning revealed that confidence was built on sand.',
        'Go-to-market strategy is based on beliefs that have never been validated.',
        ('Systematic questioning of each belief revealed gaps.', [
            {'label': 'Belief tested', 'text': 'SMBs will pay $99/mo for this — EXPOSED as assumption'},
            {'label': 'Belief tested', 'text': 'Word of mouth is our main channel — CONFIRMED with data'},
            {'label': 'Belief tested', 'text': 'Enterprise is too hard for us right now — EXPOSED, no evidence'},
            {'label': 'Belief tested', 'text': 'Users churn because of missing features — EXPOSED, no exit survey data'}
        ]),
        [{'moment': 'Pricing belief had zero validation', 'why_it_matters': 'Entire revenue model rests on an untested number'},
         {'moment': 'Enterprise dismissal was gut feel', 'why_it_matters': 'May be leaving the biggest segment on the table'}],
        {'before': 'Our market strategy is solid and validated', 'after': '3 of 5 core beliefs are untested assumptions that could sink us', 'so_what': 'Run validation sprints on pricing and enterprise before scaling.'},
        [{'tag': 'Pricing', 'question': 'What would users actually pay if you tested 3 price points?'},
         {'tag': 'Segment', 'question': 'What if enterprise is actually your best-fit customer?'},
         {'tag': 'Churn', 'question': 'What do exit surveys actually say about why users leave?'}],
        [{'action': 'Run a Van Westendorp pricing study with 30 users', 'timeframe': '2 weeks', 'owner': 'Product'},
         {'action': 'Interview 5 enterprise prospects', 'timeframe': '1 week', 'owner': 'Sales'},
         {'action': 'Implement exit surveys on cancellation flow', 'timeframe': '3 days', 'owner': 'Engineering'}],
        {
            'beliefs': [
                {'belief': 'SMBs will pay $99/mo', 'exposed_by': 'No pricing research conducted', 'status': 'exposed', 'evidence': 'Zero willingness-to-pay studies done'},
                {'belief': 'Word of mouth is primary channel', 'exposed_by': 'Confirmed by attribution data', 'status': 'confirmed', 'evidence': '62% of signups cite referral'},
                {'belief': 'Enterprise is too complex for us', 'exposed_by': 'No enterprise conversations held', 'status': 'exposed', 'evidence': 'Assumption, not data'},
                {'belief': 'Churn is feature-driven', 'exposed_by': 'No exit surveys exist', 'status': 'exposed', 'evidence': 'No data on actual churn reasons'},
                {'belief': 'Product-market fit is strong', 'exposed_by': 'Based on 3 of 5 untested beliefs', 'status': 'assumed', 'evidence': 'NPS is 32, below benchmark'}
            ],
            'score': '2 of 5 confirmed',
            'critical_assumption': 'Pricing at $99/mo has never been tested — entire revenue model depends on it.',
            'test': 'Run Van Westendorp pricing study with 30 current users within 2 weeks.'
        }
    )),
    'iceberg': ('untangle', base(
        'Your sales problem is a culture problem wearing a pipeline costume',
        'The iceberg model revealed structural and mental model drivers beneath the surface.',
        'Declining sales looked like a pipeline problem. Going deeper revealed something structural.',
        'Sales pipeline down 30% quarter-over-quarter despite increased marketing spend.',
        ('Each iceberg layer revealed deeper causes.', [
            {'label': 'Event', 'text': 'Pipeline down 30% this quarter'},
            {'label': 'Pattern', 'text': 'Pipeline dips every time a senior rep leaves'},
            {'label': 'Structure', 'text': 'No knowledge transfer process, all relationships are personal'},
            {'label': 'Mental model', 'text': 'Sales is seen as individual heroism, not a team system'}
        ]),
        [{'moment': 'The pattern of rep departure and pipeline drops', 'why_it_matters': 'This is not a one-off — it is systemic'},
         {'moment': 'Mental model of sales as heroism', 'why_it_matters': 'Culture prevents building shared systems'}],
        {'before': 'We need to hire more reps to fill the pipeline', 'after': 'We need to build a system that retains knowledge when reps leave', 'so_what': 'Invest in CRM discipline and team-based selling before hiring.'},
        [{'tag': 'Process', 'question': 'What if every deal had two reps assigned from day one?'},
         {'tag': 'Culture', 'question': 'How do you reward team wins, not just individual heroism?'},
         {'tag': 'System', 'question': 'What knowledge transfer happens when a rep leaves today?'}],
        [{'action': 'Implement mandatory CRM logging for all deal stages', 'timeframe': '1 week', 'owner': 'Sales Ops'},
         {'action': 'Pilot buddy system — two reps per deal', 'timeframe': '1 month', 'owner': 'Sales Lead'},
         {'action': 'Exit interview all departing reps about their pipeline', 'timeframe': 'Ongoing', 'owner': 'HR'}],
        {
            'event': 'Sales pipeline down 30% quarter-over-quarter despite increased marketing spend.',
            'patterns': 'Pipeline dips every time a senior rep leaves. Recovery takes 2-3 months. Marketing qualified leads are up but sales accepted leads are flat.',
            'structures': 'No knowledge transfer process. All customer relationships are personal. CRM is used for reporting, not as a working tool. Compensation rewards individual deals, not team outcomes.',
            'mental_models': 'Sales is seen as individual heroism. Top performers are lone wolves. Sharing pipeline is seen as weakness. The belief that great salespeople do not need systems.',
            'leverage_point': 'Shift from individual hero culture to team-based selling system with shared CRM practices and paired deal ownership.'
        }
    )),
    'hmw': ('spark', base(
        'The best How Might We reframes your problem as a design opportunity',
        'HMW questioning turned constraints into creative springboards.',
        'You had a well-defined problem but no creative angle. HMW reframing opened up the solution space.',
        'Customer onboarding takes 3 weeks — competitors do it in 3 days.',
        ('Reframing the problem as HMW questions opened unexpected directions.', [
            {'label': 'HMW #1', 'text': 'How might we make waiting feel productive?'},
            {'label': 'HMW #2', 'text': 'How might we let users get value before onboarding completes?'},
            {'label': 'HMW #3', 'text': 'How might we turn onboarding into a competitive advantage?'},
            {'label': 'Selected', 'text': 'HMW #2 was chosen — highest impact, most feasible'}
        ]),
        [{'moment': 'Flipping from reduce time to deliver value early', 'why_it_matters': 'Removed the constraint entirely'},
         {'moment': 'Onboarding as competitive advantage', 'why_it_matters': 'Turned a weakness into a potential moat'}],
        {'before': 'We need to reduce onboarding time from 3 weeks to 3 days', 'after': 'We need to deliver value before onboarding completes', 'so_what': 'Build a day-one value experience that works with incomplete setup.'},
        [{'tag': 'Product', 'question': 'What is the single most valuable thing a user can do on day one?'},
         {'tag': 'Design', 'question': 'Can onboarding be a guided first project, not a setup wizard?'},
         {'tag': 'Strategy', 'question': 'What if incomplete onboarding is actually the normal state?'}],
        [{'action': 'Identify the day-one value action', 'timeframe': '3 days', 'owner': 'Product'},
         {'action': 'Prototype guided first project onboarding', 'timeframe': '2 weeks', 'owner': 'Design'},
         {'action': 'Measure time-to-first-value vs time-to-complete-setup', 'timeframe': '1 week', 'owner': 'Analytics'}],
        {
            'problem': 'Customer onboarding takes 3 weeks — competitors do it in 3 days.',
            'hmw_statements': [
                {'statement': 'How might we make waiting feel productive?', 'selected': False, 'solutions': ['Progress dashboard', 'Daily tips email', 'Onboarding checklist game']},
                {'statement': 'How might we let users get value before onboarding completes?', 'selected': True, 'solutions': ['Day-one demo project', 'Sandbox environment', 'Pre-configured templates']},
                {'statement': 'How might we turn onboarding into a competitive advantage?', 'selected': False, 'solutions': ['White-glove concierge', 'Community onboarding cohorts', 'Onboarding-as-learning']},
                {'statement': 'How might we eliminate onboarding entirely?', 'selected': False, 'solutions': ['Import from competitor', 'AI auto-setup', 'Zero-config defaults']},
                {'statement': 'How might we make onboarding a team activity?', 'selected': False, 'solutions': ['Shared setup workspace', 'Role-based onboarding paths', 'Invite flow during setup']}
            ]
        }
    )),
    'scamper': ('spark', base(
        'Reversing your pricing model unlocks a segment you have been ignoring',
        'SCAMPER lenses revealed non-obvious innovation angles.',
        'You felt stuck iterating on the same product. SCAMPER forced lateral thinking across seven lenses.',
        'Product growth has plateaued — same features, same market, same pricing.',
        ('Each SCAMPER lens produced a distinct angle.', [
            {'label': 'Substitute', 'text': 'Replace monthly subscription with usage-based pricing'},
            {'label': 'Reverse', 'text': 'Let customers set their own price tier'},
            {'label': 'Combine', 'text': 'Bundle with a complementary tool for a joint offering'},
            {'label': 'Eliminate', 'text': 'Remove the free tier entirely — free users never convert'}
        ]),
        [{'moment': 'Reverse lens: customer-set pricing', 'why_it_matters': 'Opened a segment priced out of the current model'},
         {'moment': 'Eliminate lens: kill free tier', 'why_it_matters': 'Counter-intuitive but data supports it'}],
        {'before': 'We need more features to grow', 'after': 'We need a different pricing model to unlock a new segment', 'so_what': 'Test usage-based pricing with the SMB segment.'},
        [{'tag': 'Pricing', 'question': 'What if price scaled with value delivered, not seats?'},
         {'tag': 'Segment', 'question': 'Which segment is priced out of your current model?'},
         {'tag': 'Experiment', 'question': 'Can you A/B test removing the free tier?'}],
        [{'action': 'Design usage-based pricing model', 'timeframe': '1 week', 'owner': 'Product'},
         {'action': 'Interview 10 users who downgraded or churned on price', 'timeframe': '2 weeks', 'owner': 'CS'},
         {'action': 'Model revenue impact of killing free tier', 'timeframe': '3 days', 'owner': 'Finance'}],
        {
            'subject': 'SaaS pricing and packaging for a project management tool',
            'lenses': [
                {'letter': 'S', 'name': 'Substitute', 'idea': 'Replace monthly subscription with usage-based pricing tied to projects completed'},
                {'letter': 'C', 'name': 'Combine', 'idea': 'Bundle with a time-tracking tool to offer a complete project suite'},
                {'letter': 'A', 'name': 'Adapt', 'idea': 'Adapt Spotify model — personal free, team paid'},
                {'letter': 'M', 'name': 'Modify', 'idea': 'Magnify the collaboration features, shrink the project management features'},
                {'letter': 'P', 'name': 'Put to other use', 'idea': 'Position as a client-facing project portal, not internal tool'},
                {'letter': 'E', 'name': 'Eliminate', 'idea': 'Remove free tier — free users have 2% conversion rate'},
                {'letter': 'R', 'name': 'Reverse', 'idea': 'Let customers choose their own price within a range'}
            ]
        }
    )),
    'crazy-8s': ('spark', base(
        'Your sixth idea was the breakthrough — the first five were just warm-up',
        'Rapid ideation produced 8 ideas in 8 minutes — quantity led to quality.',
        'You were stuck on one approach. Crazy 8s forced volume, and the breakthrough came late in the sprint.',
        'Team keeps iterating on the same solution instead of exploring alternatives.',
        ('Rapid sketching produced unexpected combinations.', [
            {'label': 'Ideas 1-3', 'text': 'Predictable iterations on existing approach'},
            {'label': 'Ideas 4-5', 'text': 'Started combining elements in new ways'},
            {'label': 'Idea 6', 'text': 'The breakthrough — an inversion of the core assumption'},
            {'label': 'Ideas 7-8', 'text': 'Built on the breakthrough with practical variations'}
        ]),
        [{'moment': 'Idea 6 inverted the core assumption', 'why_it_matters': 'Best ideas came after the obvious ones were exhausted'},
         {'moment': 'Pattern between ideas 4-8', 'why_it_matters': 'Creative combinations only happen after volume'}],
        {'before': 'We have one good solution and need to refine it', 'after': 'We had 8 alternatives — the best one inverted our core assumption', 'so_what': 'Always generate volume before converging.'},
        [{'tag': 'Process', 'question': 'What if you ran Crazy 8s before every sprint planning?'},
         {'tag': 'Product', 'question': 'Can idea 6 and idea 3 be combined?'},
         {'tag': 'Culture', 'question': 'How do you create safety for wild ideas in your team?'}],
        [{'action': 'Prototype the top-picked idea (idea 6)', 'timeframe': '1 week', 'owner': 'Design'},
         {'action': 'Share all 8 ideas with the wider team for voting', 'timeframe': '2 days', 'owner': 'Product'},
         {'action': 'Schedule monthly Crazy 8s sessions', 'timeframe': 'Recurring', 'owner': 'Team Lead'}],
        {
            'ideas': [
                {'number': 1, 'text': 'Dashboard with real-time metrics and alerts', 'top_pick': False},
                {'number': 2, 'text': 'Weekly email digest with key changes highlighted', 'top_pick': False},
                {'number': 3, 'text': 'Mobile-first notification system with smart grouping', 'top_pick': False},
                {'number': 4, 'text': 'AI assistant that explains metric changes in plain English', 'top_pick': False},
                {'number': 5, 'text': 'Collaborative annotation layer on top of existing charts', 'top_pick': False},
                {'number': 6, 'text': 'Reverse dashboard — shows what NOT to worry about, highlights only anomalies', 'top_pick': True},
                {'number': 7, 'text': 'Anomaly-only feed with one-tap drill-down', 'top_pick': False},
                {'number': 8, 'text': 'Exception-based reporting — silence is good news', 'top_pick': False}
            ],
            'pattern': 'Ideas 1-5 were additive (more information). The breakthrough in idea 6 was subtractive (less noise). The best insights came from inverting the assumption that users want MORE data.'
        }
    )),
    'mash-up': ('spark', base(
        'Your onboarding problem has already been solved — by IKEA',
        'Cross-domain thinking revealed proven patterns from unexpected sources.',
        'Looking at onboarding through the lens of other industries revealed solutions hiding in plain sight.',
        'Complex product requires extensive training — users give up before getting value.',
        ('Analogies from outside your industry offered fresh solutions.', [
            {'label': 'IKEA analogy', 'text': 'Self-assembly instructions — visual, step-by-step, no reading required'},
            {'label': 'Gaming analogy', 'text': 'Tutorial levels that teach by doing, not explaining'},
            {'label': 'Application', 'text': 'Build an interactive first-project that teaches all features'}
        ]),
        [{'moment': 'IKEA instruction manual as onboarding model', 'why_it_matters': 'Visual, wordless, progressive — exactly what SaaS onboarding lacks'},
         {'moment': 'Gaming tutorial level concept', 'why_it_matters': 'Learning by doing has 3x better retention than reading docs'}],
        {'before': 'We need better documentation and training videos', 'after': 'We need a guided first-project that teaches by doing, like a game tutorial', 'so_what': 'Replace the help centre with an interactive first project.'},
        [{'tag': 'UX', 'question': 'What would your IKEA instruction manual look like?'},
         {'tag': 'Product', 'question': 'Can you build a 15-minute guided first project?'},
         {'tag': 'Metric', 'question': 'What is completion rate for learn-by-doing vs documentation?'}],
        [{'action': 'Map the guided first project flow', 'timeframe': '1 week', 'owner': 'UX'},
         {'action': 'Prototype 3 tutorial-style onboarding screens', 'timeframe': '2 weeks', 'owner': 'Design'},
         {'action': 'Benchmark gaming onboarding patterns', 'timeframe': '3 days', 'owner': 'Research'}],
        {
            'original_challenge': 'Users abandon onboarding because it requires too much reading and configuration.',
            'abstracted_challenge': 'How do you teach someone to use a complex system without overwhelming them?',
            'analogies': [
                {'domain': 'Furniture (IKEA)', 'analogy': 'Visual-only assembly instructions guide users step by step without any text', 'application': 'Replace text-heavy onboarding with visual step-by-step guides'},
                {'domain': 'Gaming', 'analogy': 'Tutorial levels teach mechanics through play, not documentation', 'application': 'Build a guided first project that teaches features by using them'},
                {'domain': 'Cooking (HelloFresh)', 'analogy': 'Pre-measured ingredients reduce setup so you focus on the cooking', 'application': 'Pre-configure defaults so users start doing, not setting up'}
            ]
        }
    )),
    'constraint-flip': ('spark', base(
        'Your biggest constraint is actually your unfair advantage',
        'Flipping the constraint revealed a hidden opportunity.',
        'Small team size felt like a limitation. Flipping it revealed it as a competitive moat.',
        'Team of 5 competing against companies with 50+ engineers.',
        ('Inverting the constraint changed the strategic frame.', [
            {'label': 'Constraint', 'text': 'Too small to build everything competitors have'},
            {'label': 'Flip', 'text': 'Small enough to ship in hours, not months'},
            {'label': 'Opportunity', 'text': 'Speed and customer intimacy as competitive weapons'}
        ]),
        [{'moment': 'Realising speed is the advantage of being small', 'why_it_matters': 'Stopped trying to compete on features and started competing on responsiveness'},
         {'moment': 'Customer intimacy at scale of 5', 'why_it_matters': 'Every customer can talk to the founder — that is a moat'}],
        {'before': 'We are too small to compete', 'after': 'We are small enough to be fast, personal, and responsive', 'so_what': 'Lean into speed and customer relationships as your differentiator.'},
        [{'tag': 'Strategy', 'question': 'What can you ship this week that a 50-person team cannot?'},
         {'tag': 'Product', 'question': 'How do you make customer intimacy a product feature?'},
         {'tag': 'Culture', 'question': 'What if fast shipping was your brand identity?'}],
        [{'action': 'Commit to 24-hour response time on all feature requests', 'timeframe': 'This week', 'owner': 'Founder'},
         {'action': 'Ship one customer-requested feature per week publicly', 'timeframe': 'Ongoing', 'owner': 'Engineering'},
         {'action': 'Launch a changelog showing shipping velocity', 'timeframe': '1 week', 'owner': 'Marketing'}],
        {
            'constraint': 'Team of 5 engineers competing against companies with 50+ engineers.',
            'flip': {
                'forces': 'Cannot build feature parity with large competitors',
                'signals': 'Customers mention speed of response as top differentiator in reviews',
                'enables': 'Ship in hours not months; every customer talks to a founder; zero bureaucracy'
            },
            'ideas': [
                {'text': 'Public changelog showing daily shipping velocity'},
                {'text': '24-hour feature request turnaround guarantee'},
                {'text': 'Direct Slack channel with the engineering team for every customer'},
                {'text': 'Customer co-design sessions — build features live with users'}
            ],
            'moat_idea': 'Make shipping speed and customer intimacy the core brand — competitors with 50 engineers cannot match your responsiveness.'
        }
    )),
    'pre-mortem': ('test', base(
        'Your launch will fail because of onboarding, not product',
        'Pre-mortem thinking identified the kill shot before it fires.',
        'The team was excited about launching. The pre-mortem revealed blind spots everyone was avoiding.',
        'Launching in 6 weeks with high confidence — but no failure scenario planning.',
        ('Imagining failure revealed overlooked risks.', [
            {'label': 'Risk #1', 'text': 'Onboarding complexity — users will not complete setup'},
            {'label': 'Risk #2', 'text': 'No migration path from competitor tools'},
            {'label': 'Risk #3', 'text': 'Support team not trained on new features'},
            {'label': 'Biggest risk', 'text': 'Onboarding — 70% of launches fail here'}
        ]),
        [{'moment': 'Onboarding identified as the most likely failure mode', 'why_it_matters': 'Team was focused on features, not the first 5 minutes'},
         {'moment': 'Support readiness gap', 'why_it_matters': 'Bad support during launch week compounds every other problem'}],
        {'before': 'We are ready to launch in 6 weeks', 'after': 'We are ready to launch if we solve onboarding and support readiness first', 'so_what': 'Delay feature polish, prioritise onboarding flow and support training.'},
        [{'tag': 'Launch', 'question': 'What does day-one success look like for a new user?'},
         {'tag': 'Risk', 'question': 'Which risk, if it materialises, kills the launch entirely?'},
         {'tag': 'Support', 'question': 'Can support handle 10x current volume in launch week?'}],
        [{'action': 'User-test onboarding with 5 non-technical users', 'timeframe': '1 week', 'owner': 'UX'},
         {'action': 'Build migration import tool for top 2 competitors', 'timeframe': '3 weeks', 'owner': 'Engineering'},
         {'action': 'Run support team through launch simulation', 'timeframe': '2 weeks', 'owner': 'CS Lead'}],
        {
            'idea': 'Launching a new product version in 6 weeks targeting SMB segment.',
            'risks': [
                {'category': 'Onboarding', 'scenario': 'Users abandon setup because it requires 12 configuration steps', 'likelihood': 'HIGH'},
                {'category': 'Migration', 'scenario': 'No import path from competitor — users will not manually re-enter data', 'likelihood': 'HIGH'},
                {'category': 'Support', 'scenario': 'Support team overwhelmed in launch week, response times spike to 48 hours', 'likelihood': 'MEDIUM'},
                {'category': 'Positioning', 'scenario': 'Marketing message does not resonate — launch lands flat', 'likelihood': 'LOW'},
                {'category': 'Technical', 'scenario': 'Infrastructure cannot handle 5x normal traffic on launch day', 'likelihood': 'LOW'}
            ],
            'biggest_risk': 'Onboarding complexity — if users cannot complete setup in the first session, nothing else matters.'
        }
    )),
    'devils-advocate': ('test', base(
        'Your strongest objection is the one you have been avoiding',
        'Adversarial testing revealed the argument you cannot yet win.',
        'Your pitch felt bulletproof. The Devil\'s Advocate process found three holes.',
        'Preparing for investor pitch — need to anticipate and counter objections.',
        ('Each adversary perspective exposed a different weakness.', [
            {'label': 'Investor view', 'text': 'Unit economics do not work below 500 users'},
            {'label': 'Customer view', 'text': 'Switching cost is too high for the perceived benefit'},
            {'label': 'Competitor view', 'text': 'Incumbent can copy your differentiator in 3 months'},
            {'label': 'Key gap', 'text': 'No defence against the unit economics objection'}
        ]),
        [{'moment': 'Unit economics objection had no counter-argument', 'why_it_matters': 'This is the question that will sink the raise'},
         {'moment': 'Switching cost vs perceived benefit gap', 'why_it_matters': 'Even interested users may not move'}],
        {'before': 'Our pitch is ready for investors', 'after': 'Our pitch has a fatal gap on unit economics that we must close first', 'so_what': 'Model unit economics for 3 scenarios before the pitch.'},
        [{'tag': 'Finance', 'question': 'At what scale do unit economics actually work?'},
         {'tag': 'Product', 'question': 'How do you reduce switching cost to near zero?'},
         {'tag': 'Strategy', 'question': 'What is your moat if the incumbent copies you?'}],
        [{'action': 'Build unit economics model for 100, 500, and 2000 user scenarios', 'timeframe': '3 days', 'owner': 'Finance'},
         {'action': 'Design a zero-friction migration tool', 'timeframe': '2 weeks', 'owner': 'Engineering'},
         {'action': 'Document 3 defensible moats beyond features', 'timeframe': '1 week', 'owner': 'Founder'}],
        {
            'objections': [
                {'adversary': 'Skeptical Investor', 'objection': 'Your unit economics do not work below 500 users — you are burning cash to acquire users who cost more to serve than they pay.', 'defence': 'We reach positive unit economics at 300 users with the new pricing tier.', 'rating': 'RED'},
                {'adversary': 'Reluctant Customer', 'objection': 'Switching from our current tool takes 2 weeks of setup — not worth the marginal improvement.', 'defence': 'Our auto-import reduces migration to under 1 hour.', 'rating': 'AMBER'},
                {'adversary': 'Incumbent Competitor', 'objection': 'We can build your core feature in one quarter with our existing team.', 'defence': 'Our advantage is in the workflow, not any single feature — it compounds over time.', 'rating': 'AMBER'},
                {'adversary': 'Internal Engineer', 'objection': 'The current architecture will not scale past 10K concurrent users.', 'defence': 'Migration to new architecture is planned for Q3.', 'rating': 'GREEN'}
            ],
            'scorecard': [
                {'dimension': 'Market Timing', 'rating': 'GREEN', 'finding': 'Market is ready — 3 signals confirm demand'},
                {'dimension': 'Unit Economics', 'rating': 'RED', 'finding': 'Not profitable below 500 users'},
                {'dimension': 'Defensibility', 'rating': 'AMBER', 'finding': 'Workflow moat exists but not yet proven'},
                {'dimension': 'Team Readiness', 'rating': 'GREEN', 'finding': 'Team has shipped similar products before'}
            ],
            'overall_rating': 'AMBER — Strong concept with a critical unit economics gap to close before raising.',
            'danger_zone': 'Unit economics objection has no credible counter-argument yet. This will be the first question from any serious investor.'
        }
    )),
    'cold-open': ('test', base(
        'Your customers are telling you the answer — you are just not listening to the right signal',
        'Customer discovery surfaced patterns hiding in interview noise.',
        'You had plenty of customer conversations but no clear signal. Structured discovery changed that.',
        'Conducted 30 customer interviews but drew conflicting conclusions.',
        ('Pattern-matching across interviews revealed consistent signals.', [
            {'label': 'Signal', 'text': '8 of 10 users mentioned billing confusion unprompted'},
            {'label': 'Signal', 'text': 'Power users and churned users had the same onboarding experience'},
            {'label': 'Signal', 'text': 'Users who stayed past day 30 all completed one specific action'},
            {'label': 'Insight', 'text': 'The activation event is creating a shared workspace — not completing setup'}
        ]),
        [{'moment': 'Billing confusion surfaced in 80% of interviews', 'why_it_matters': 'Not a feature problem — a trust problem'},
         {'moment': 'Shared workspace as activation event', 'why_it_matters': 'Changes what you optimise for in onboarding'}],
        {'before': 'We do not know why some users stay and others leave', 'after': 'Users who create a shared workspace in week 1 retain at 3x the rate', 'so_what': 'Make shared workspace creation the north star of onboarding.'},
        [{'tag': 'Product', 'question': 'Can you prompt shared workspace creation in the first session?'},
         {'tag': 'Pricing', 'question': 'Is billing confusion causing churn you are attributing to product?'},
         {'tag': 'Metric', 'question': 'What is the correlation between day-7 shared workspace and month-3 retention?'}],
        [{'action': 'Add shared workspace prompt to onboarding flow', 'timeframe': '1 week', 'owner': 'Product'},
         {'action': 'Simplify billing page and add FAQ section', 'timeframe': '2 weeks', 'owner': 'Design'},
         {'action': 'Track shared workspace creation as leading retention indicator', 'timeframe': '3 days', 'owner': 'Analytics'}],
        {
            'persona': 'Operations Manager at a 20-50 person company, managing 3-5 tools, reports to COO',
            'scorecard': [
                {'dimension': 'Problem Severity', 'rating': 'HIGH'},
                {'dimension': 'Willingness to Pay', 'rating': 'MEDIUM'},
                {'dimension': 'Frequency of Need', 'rating': 'HIGH'},
                {'dimension': 'Alternative Satisfaction', 'rating': 'LOW'},
                {'dimension': 'Switching Readiness', 'rating': 'MEDIUM'}
            ],
            'signals': [
                {'signal': 'Mentioned billing confusion unprompted', 'type': 'pain', 'caught': True},
                {'signal': 'Asked about team features within 2 minutes', 'type': 'pull', 'caught': True},
                {'signal': 'Compared to spreadsheets, not competitors', 'type': 'context', 'caught': True},
                {'signal': 'Said "good enough" about current solution', 'type': 'risk', 'caught': False},
                {'signal': 'Asked about API before seeing the product', 'type': 'power_user', 'caught': True}
            ]
        }
    )),
    'reality-check': ('test', base(
        'Two of your four risks are already in the red zone',
        'Reality Check scored your venture across four risk dimensions.',
        'You felt ready to scale. A structured reality check revealed two critical gaps.',
        'Planning to double team size and raise Series A in Q3.',
        ('Four-risk scoring revealed the real state of readiness.', [
            {'label': 'Desirability', 'text': 'GREEN — strong user demand signals'},
            {'label': 'Viability', 'text': 'RED — unit economics not proven'},
            {'label': 'Feasibility', 'text': 'AMBER — architecture needs rework for scale'},
            {'label': 'Adaptability', 'text': 'RED — no pivot capacity if core thesis fails'}
        ]),
        [{'moment': 'Viability scored RED — unit economics unproven', 'why_it_matters': 'Cannot raise on demand alone — need to show a path to profit'},
         {'moment': 'Adaptability scored RED — no Plan B', 'why_it_matters': 'Single-thesis bet with no fallback is high risk'}],
        {'before': 'We are ready to scale and raise Series A', 'after': 'We need to prove unit economics and build pivot capacity before scaling', 'so_what': 'Fix viability before hiring, build optionality before raising.'},
        [{'tag': 'Finance', 'question': 'At what point do unit economics turn positive?'},
         {'tag': 'Strategy', 'question': 'What is your Plan B if the core thesis fails?'},
         {'tag': 'Risk', 'question': 'Can you reduce the two RED scores to AMBER in 90 days?'}],
        [{'action': 'Model unit economics at 3 price points', 'timeframe': '1 week', 'owner': 'Finance'},
         {'action': 'Document 2 alternative thesis pivots', 'timeframe': '2 weeks', 'owner': 'Founder'},
         {'action': 'Set 90-day milestones for each risk dimension', 'timeframe': '3 days', 'owner': 'COO'}],
        {
            'scorecard': [
                {'dimension': 'Desirability', 'finding': 'Strong user demand — 200 waitlist signups, 40% weekly active rate', 'rating': 'GREEN'},
                {'dimension': 'Viability', 'finding': 'Unit economics unproven — CAC/LTV ratio unknown, pricing not tested', 'rating': 'RED'},
                {'dimension': 'Feasibility', 'finding': 'Core product works but architecture will not scale past 5K users', 'rating': 'AMBER'},
                {'dimension': 'Adaptability', 'finding': 'Single thesis, no pivot plan, team skills concentrated in one domain', 'rating': 'RED'}
            ],
            'overall_rating': 'AMBER — Strong demand but critical gaps in viability and adaptability must close before scaling.',
            'biggest_risk': 'Viability — raising on demand alone without proven unit economics sets up a Series A trap.',
            'suggested_test': {
                'what': 'Run a 4-week pricing experiment with 3 tiers',
                'how': 'A/B test pricing on new signups, track conversion and 30-day retention per tier',
                'who': 'Next 200 signups split evenly across tiers',
                'timeline': '4 weeks to results, 1 week to set up'
            }
        }
    )),
    'trade-off': ('test', base(
        'Your users will pay 40% more if you bundle the right three features',
        'Trade-off analysis revealed the features worth paying for.',
        'You had 12 features on the roadmap and no way to prioritise. Trade-off analysis sorted signal from noise.',
        'Roadmap has 12 features but budget for 4 — which ones move the needle?',
        ('Forcing trade-off choices revealed true priorities.', [
            {'label': 'Must-have', 'text': 'Real-time collaboration, API access, SSO'},
            {'label': 'Nice-to-have', 'text': 'Custom dashboards, mobile app'},
            {'label': 'Not worth it', 'text': 'Gantt charts, resource planning, time tracking'},
            {'label': 'Surprise', 'text': 'API access valued 3x more than expected'}
        ]),
        [{'moment': 'API access valued more than mobile app', 'why_it_matters': 'Technical users are the power segment — build for them first'},
         {'moment': 'Three features users would pay 40% more for', 'why_it_matters': 'Clear roadmap priority with revenue backing'}],
        {'before': '12 features, no prioritisation framework', 'after': '3 must-haves that users will pay 40% more for', 'so_what': 'Ship collaboration, API, and SSO — drop the rest from v1.'},
        [{'tag': 'Product', 'question': 'Can you ship all 3 must-haves in one release?'},
         {'tag': 'Pricing', 'question': 'What pricing tier makes sense for the API + SSO bundle?'},
         {'tag': 'Research', 'question': 'Do enterprise buyers rank the same 3 features?'}],
        [{'action': 'Build real-time collaboration MVP', 'timeframe': '4 weeks', 'owner': 'Engineering'},
         {'action': 'Design API documentation and developer portal', 'timeframe': '2 weeks', 'owner': 'DevRel'},
         {'action': 'Price test the premium bundle with 50 users', 'timeframe': '3 weeks', 'owner': 'Product'}],
        {
            'setup': [
                {'category': 'Collaboration', 'levels': ['Basic comments', 'Real-time editing', 'Video + editing'], 'price_range': '$0-40/mo'},
                {'category': 'Integrations', 'levels': ['Manual export', 'API access', 'Full ecosystem'], 'price_range': '$0-60/mo'},
                {'category': 'Security', 'levels': ['Email/password', 'SSO', 'SSO + audit log'], 'price_range': '$0-30/mo'}
            ],
            'rounds': [
                {'number': 1, 'packages': ['Basic + Manual + Email', 'Realtime + API + SSO', 'Video + Full + Audit'], 'chosen': 'Realtime + API + SSO'},
                {'number': 2, 'packages': ['Realtime + Manual + SSO', 'Basic + API + Audit', 'Video + API + Email'], 'chosen': 'Realtime + Manual + SSO'},
                {'number': 3, 'packages': ['Realtime + API + Email', 'Basic + Full + SSO', 'Video + Manual + Audit'], 'chosen': 'Realtime + API + Email'}
            ],
            'value_stack': [
                {'tier': 'Must-have', 'items': [{'name': 'Real-time collaboration', 'wins': 3}, {'name': 'API access', 'wins': 2}, {'name': 'SSO', 'wins': 2}]},
                {'tier': 'Nice-to-have', 'items': [{'name': 'Audit log', 'wins': 1}, {'name': 'Full ecosystem', 'wins': 1}]},
                {'tier': 'Not worth it', 'items': [{'name': 'Video editing', 'wins': 0}, {'name': 'Manual export', 'wins': 0}]}
            ]
        }
    )),
    'rapid-experiment': ('test', base(
        'You can validate your riskiest assumption in 5 days for $200',
        'Rapid experiment design turned uncertainty into a testable hypothesis.',
        'You had strong opinions about what would work. We designed an experiment to test the riskiest one.',
        'Betting the roadmap on an assumption that free-to-paid conversion will be 5%.',
        ('Designing the experiment revealed how cheaply you can test.', [
            {'label': 'Riskiest assumption', 'text': 'Free users will convert at 5% when shown the paywall'},
            {'label': 'Experiment', 'text': '100 free users, soft paywall, 5-day test, $200 ad spend'},
            {'label': 'Pass criteria', 'text': '5+ conversions out of 100 (5% or higher)'},
            {'label': 'Fail criteria', 'text': 'Fewer than 3 conversions — rethink pricing entirely'}
        ]),
        [{'moment': 'Riskiest assumption identified', 'why_it_matters': 'The whole roadmap depends on this single number'},
         {'moment': 'Experiment costs $200 and 5 days', 'why_it_matters': 'No excuse not to test before building'}],
        {'before': 'We believe free-to-paid conversion will be 5%', 'after': 'We will know in 5 days for $200 whether this assumption holds', 'so_what': 'Run the experiment before committing to the roadmap.'},
        [{'tag': 'Experiment', 'question': 'What is the minimum sample size for statistical significance?'},
         {'tag': 'Pricing', 'question': 'What if conversion is 2% — does the model still work?'},
         {'tag': 'Process', 'question': 'Can you build experiment-first into every roadmap decision?'}],
        [{'action': 'Set up soft paywall experiment with 100 users', 'timeframe': '2 days', 'owner': 'Product'},
         {'action': 'Run $200 ad campaign to drive free signups', 'timeframe': '5 days', 'owner': 'Marketing'},
         {'action': 'Analyse results and update roadmap assumptions', 'timeframe': '1 day post-experiment', 'owner': 'Founder'}],
        {
            'assumptions': [
                {'assumption': 'Free users convert at 5% on soft paywall', 'confidence': 'LOW', 'consequence': 'HIGH', 'quadrant': 'TEST NOW'},
                {'assumption': 'Users share the tool with at least 2 colleagues', 'confidence': 'MEDIUM', 'consequence': 'MEDIUM', 'quadrant': 'MONITOR'},
                {'assumption': 'Enterprise will pay 10x SMB pricing', 'confidence': 'LOW', 'consequence': 'MEDIUM', 'quadrant': 'WATCH'},
                {'assumption': 'Organic search will be the primary channel', 'confidence': 'HIGH', 'consequence': 'LOW', 'quadrant': 'PARK'}
            ],
            'riskiest': 'Free users convert at 5% on soft paywall — entire revenue model depends on it.',
            'experiment': {
                'hypothesis': 'If we show a soft paywall to 100 free users after 7 days of usage, at least 5 will convert to paid.',
                'method': 'A/B test: 100 free users (50 see paywall, 50 control). Track conversion over 5 days.',
                'sample': '100 free users who have been active for 7+ days',
                'metric': 'Conversion rate (paid signups / paywall impressions)',
                'timeline': '5 days',
                'pass_criteria': '5% or higher conversion rate (5+ conversions out of 100)',
                'fail_criteria': 'Below 3% conversion — rethink the pricing model entirely'
            }
        }
    )),
    'lean-canvas': ('build', base(
        'Your canvas has three untested blocks that could collapse the whole model',
        'Lean Canvas mapping revealed where assumptions are hiding as facts.',
        'Filling the canvas forced clarity. Three blocks had zero evidence behind them.',
        'Need to articulate the business model clearly for investor conversations.',
        ('Each canvas block was stress-tested for evidence.', [
            {'label': 'Strong', 'text': 'Problem and customer segments well-validated'},
            {'label': 'Weak', 'text': 'Revenue model based on competitor benchmarks, not own data'},
            {'label': 'Missing', 'text': 'Unfair advantage block was empty — no defensibility'},
            {'label': 'Risk', 'text': 'Key metrics not defined — cannot measure progress'}
        ]),
        [{'moment': 'Unfair advantage block was empty', 'why_it_matters': 'No moat means no long-term defensibility'},
         {'moment': 'Revenue model was borrowed from competitors', 'why_it_matters': 'Different product may need different pricing'}],
        {'before': 'We have a solid business model', 'after': 'We have a solid problem-solution fit but an unvalidated business model', 'so_what': 'Validate revenue model and build unfair advantage before scaling.'},
        [{'tag': 'Model', 'question': 'What is your unfair advantage — and can you build one?'},
         {'tag': 'Pricing', 'question': 'Have you tested your pricing with actual willingness-to-pay data?'},
         {'tag': 'Metrics', 'question': 'What are the 3 metrics that prove this model works?'}],
        [{'action': 'Run willingness-to-pay study with 30 users', 'timeframe': '2 weeks', 'owner': 'Product'},
         {'action': 'Define unfair advantage hypothesis and test it', 'timeframe': '1 month', 'owner': 'Founder'},
         {'action': 'Set up key metric dashboards', 'timeframe': '1 week', 'owner': 'Analytics'}],
        {
            'blocks': {
                'problem': 'Operations managers spend 6+ hours per week manually compiling reports from 4-5 different tools.',
                'solution': 'Unified dashboard that auto-pulls data from existing tools and generates board-ready reports.',
                'uvp': 'Board-ready reports in 10 minutes, not 6 hours.',
                'unfair_advantage': {'text': 'TBD — need to develop a data moat or network effect.', 'hypothesis': 'UNTESTED'},
                'segments': 'Series A-B SaaS companies with 20-100 employees.',
                'early_adopters': 'Operations managers at SaaS companies who report to a board quarterly.',
                'metrics': {'text': 'Key metrics not yet defined.', 'hypothesis': 'UNTESTED'},
                'channels': 'Content marketing (SEO) + founder-led sales for first 50 customers.',
                'costs': 'Engineering team ($40K/mo), infrastructure ($2K/mo), marketing ($5K/mo).',
                'revenue': {'text': '$99/mo per workspace, targeting 500 workspaces by month 18.', 'hypothesis': 'UNTESTED'},
                'alternatives': 'Manual spreadsheets, Notion dashboards, hiring a data analyst.'
            }
        }
    )),
    'effectuation': ('build', base(
        'You already have everything you need to start — you just cannot see it yet',
        'Effectuation revealed the means at hand to take the first step today.',
        'You were waiting for funding to start. Effectuation showed you can begin with what you already have.',
        'Great idea but waiting for investment before taking any action.',
        ('Mapping who you are, what you know, and who you know revealed options.', [
            {'label': 'Who you are', 'text': '15 years in fintech, deep domain expertise'},
            {'label': 'What you know', 'text': 'Compliance frameworks, API integrations, SMB sales'},
            {'label': 'Who you know', 'text': '3 potential design partners, 2 advisors, 1 pilot customer'},
            {'label': 'First move', 'text': 'Build a prototype with the pilot customer this month'}
        ]),
        [{'moment': 'Pilot customer already waiting', 'why_it_matters': 'You do not need funding to start — you need a prototype'},
         {'moment': '3 design partners identified', 'why_it_matters': 'Co-creation reduces risk and increases signal'}],
        {'before': 'I need $500K before I can start', 'after': 'I can start today with my existing network and expertise', 'so_what': 'Build with the pilot customer, then raise on traction.'},
        [{'tag': 'Action', 'question': 'What can you build this week with zero funding?'},
         {'tag': 'Network', 'question': 'Which of your 3 design partners would commit to a pilot?'},
         {'tag': 'Strategy', 'question': 'What affordable loss are you willing to accept for 90 days?'}],
        [{'action': 'Call the pilot customer and propose a 30-day co-build', 'timeframe': 'Today', 'owner': 'Founder'},
         {'action': 'Set affordable loss budget for 90 days', 'timeframe': '3 days', 'owner': 'Founder'},
         {'action': 'Recruit 2 design partners from your network', 'timeframe': '1 week', 'owner': 'Founder'}],
        {
            'who_you_are': '15 years in fintech — built and sold a payments startup, deep compliance expertise, trusted in the Melbourne fintech community.',
            'what_you_know': 'PCI compliance frameworks, banking API integrations, SMB sales cycles, regulatory landscape across APAC.',
            'who_you_know': 'Sarah (ex-CTO, can build MVP), James (runs a 200-person fintech, potential design partner), Wei (compliance consultant, warm intro to 3 banks).',
            'allies': [
                {'name': 'Sarah — ex-CTO', 'contributes': 'Technical co-founder potential, can build MVP in 6 weeks'},
                {'name': 'James — fintech CEO', 'contributes': 'First design partner and pilot customer, warm intro to 10 prospects'},
                {'name': 'Wei — compliance consultant', 'contributes': 'Regulatory guidance and bank introductions'}
            ],
            'first_move': 'Call James today to propose a 30-day co-build pilot. Use Sarah to build the prototype. Set a 90-day affordable loss of $15K personal runway.'
        }
    )),
    'flywheel': ('build', base(
        'Your flywheel has a broken spoke — content drives signups but signups do not drive content',
        'Flywheel mapping revealed where momentum breaks down.',
        'Growth felt stuck despite doing all the right things. Mapping the flywheel showed a missing connection.',
        'Doing content marketing, community building, and product development but growth is linear, not exponential.',
        ('The flywheel revealed missing feedback loops.', [
            {'label': 'Working', 'text': 'Content drives signups (strong connection)'},
            {'label': 'Working', 'text': 'Product drives retention (moderate connection)'},
            {'label': 'Broken', 'text': 'Users do not generate content — flywheel stalls'},
            {'label': 'Fix', 'text': 'Enable user-generated templates that become content'}
        ]),
        [{'moment': 'The missing user-to-content loop', 'why_it_matters': 'Without this, growth stays linear — you are the bottleneck'},
         {'moment': 'User-generated templates as content', 'why_it_matters': 'Users create the content that attracts more users — exponential loop'}],
        {'before': 'We need to create more content to grow', 'after': 'We need users to create content that attracts more users', 'so_what': 'Build a template marketplace where user creations become growth content.'},
        [{'tag': 'Product', 'question': 'What would a user-generated template marketplace look like?'},
         {'tag': 'Growth', 'question': 'Can you make sharing templates as easy as sharing a link?'},
         {'tag': 'Metric', 'question': 'How many templates per user would make the flywheel self-sustaining?'}],
        [{'action': 'Build public template sharing feature', 'timeframe': '3 weeks', 'owner': 'Engineering'},
         {'action': 'Seed marketplace with 50 templates from power users', 'timeframe': '2 weeks', 'owner': 'Community'},
         {'action': 'Track template-to-signup conversion rate', 'timeframe': '1 week', 'owner': 'Analytics'}],
        {
            'components': [
                {'name': 'Content Creation', 'description': 'Blog posts, tutorials, and guides that drive organic traffic'},
                {'name': 'User Signups', 'description': 'Free signups from content and referrals'},
                {'name': 'Product Usage', 'description': 'Users create projects and templates'},
                {'name': 'User-Generated Templates', 'description': 'Users share templates publicly — becomes content'},
                {'name': 'Community Growth', 'description': 'Active users attract and help new users'}
            ],
            'connections': [
                {'from_to': 'Content → Signups', 'strength': 'strong', 'mechanism': 'SEO drives 60% of signups'},
                {'from_to': 'Signups → Usage', 'strength': 'moderate', 'mechanism': 'Onboarding converts 40% to active'},
                {'from_to': 'Usage → Templates', 'strength': 'weak', 'mechanism': 'Only 5% of users share templates'},
                {'from_to': 'Templates → Content', 'strength': 'broken', 'mechanism': 'No public template gallery exists yet'},
                {'from_to': 'Community → Signups', 'strength': 'moderate', 'mechanism': 'Word of mouth and referrals'}
            ],
            'bottleneck': 'Usage → Templates connection is broken. Users create but do not share. Need a public template gallery and one-click sharing to close the loop.'
        }
    )),
    'theory-of-change': ('build', base(
        'Your theory of change has a missing precondition that invalidates the whole chain',
        'Working backwards from impact revealed a gap in the logic chain.',
        'Your impact thesis looked compelling. Mapping it backwards revealed a missing step.',
        'Social enterprise needs to articulate theory of change for grant application.',
        ('Backwards mapping revealed logical gaps.', [
            {'label': 'Outcome', 'text': 'Reduce youth unemployment by 15% in target region'},
            {'label': 'Missing link', 'text': 'Assumes employers will hire graduates — no employer partnerships exist'},
            {'label': 'Precondition gap', 'text': 'Training alone does not guarantee employment'},
            {'label': 'Fix', 'text': 'Build employer partnerships before scaling training'}
        ]),
        [{'moment': 'The employer partnership gap', 'why_it_matters': 'Training without hiring partners is activity without impact'},
         {'moment': 'Backwards mapping showed the gap immediately', 'why_it_matters': 'Forward planning hid this — it looked like a later problem'}],
        {'before': 'Train youth and they will get jobs', 'after': 'Train youth for specific employer needs and connect them directly', 'so_what': 'Build employer partnerships first, then design training around their needs.'},
        [{'tag': 'Impact', 'question': 'Which 5 employers would commit to hiring graduates?'},
         {'tag': 'Design', 'question': 'Can you co-design the curriculum with hiring partners?'},
         {'tag': 'Metric', 'question': 'What is the employment rate 6 months after training?'}],
        [{'action': 'Approach 10 employers for hiring partnerships', 'timeframe': '1 month', 'owner': 'Partnerships'},
         {'action': 'Redesign curriculum based on employer input', 'timeframe': '6 weeks', 'owner': 'Education Lead'},
         {'action': 'Set up 6-month post-training employment tracking', 'timeframe': '2 weeks', 'owner': 'Impact Team'}],
        {
            'outcome': 'Reduce youth unemployment by 15% in the Western Melbourne region within 3 years.',
            'activities': [
                {'activity': 'Deliver 12-week vocational training program', 'precondition': 'Curriculum designed around employer needs', 'sphere': 'Within Control'},
                {'activity': 'Build employer hiring partnerships', 'precondition': 'Employers see value in structured pipeline', 'sphere': 'Within Influence'},
                {'activity': 'Provide 6-month post-placement mentoring', 'precondition': 'Mentors recruited and trained', 'sphere': 'Within Control'},
                {'activity': 'Advocate for policy support for youth employment', 'precondition': 'Data from program demonstrates impact', 'sphere': 'Outside Control'}
            ],
            'preconditions': [
                {'precondition': 'Employers commit to hiring 50+ graduates per year', 'sphere': 'Within Influence'},
                {'precondition': 'Youth participants complete the 12-week program', 'sphere': 'Within Control'},
                {'precondition': 'Local government provides venue and partial funding', 'sphere': 'Within Influence'},
                {'precondition': 'Economic conditions support entry-level hiring', 'sphere': 'Outside Control'}
            ]
        }
    )),
    'wardley': ('build', base(
        'You are building a product in a space that is about to commoditise',
        'Wardley Mapping revealed the evolution stage of every component in your value chain.',
        'Your competitive advantage sits on a component that is moving from custom to commodity.',
        'Investing heavily in a feature that competitors are about to get for free.',
        ('Mapping component evolution revealed strategic positioning.', [
            {'label': 'User need', 'text': 'Real-time data synchronisation across devices'},
            {'label': 'Your bet', 'text': 'Custom-built sync engine (Product stage)'},
            {'label': 'Market reality', 'text': 'Sync is moving to Commodity — 3 open-source options emerging'},
            {'label': 'Strategic shift', 'text': 'Stop building sync, start building on top of commodity sync'}
        ]),
        [{'moment': 'Sync engine is moving to commodity', 'why_it_matters': 'Your 18-month investment is about to be available for free'},
         {'moment': 'Value is shifting up the chain', 'why_it_matters': 'The real moat is in the intelligence layer, not the plumbing'}],
        {'before': 'Our sync engine is our competitive advantage', 'after': 'Sync is commoditising — our advantage must be in the intelligence layer above it', 'so_what': 'Migrate to open-source sync and redirect engineering to the AI layer.'},
        [{'tag': 'Strategy', 'question': 'What happens when sync is free and commoditised?'},
         {'tag': 'Product', 'question': 'What intelligence layer can you build on top of commodity sync?'},
         {'tag': 'Engineering', 'question': 'Can you migrate to open-source sync in 90 days?'}],
        [{'action': 'Evaluate top 3 open-source sync solutions', 'timeframe': '1 week', 'owner': 'Engineering'},
         {'action': 'Define intelligence layer product vision', 'timeframe': '2 weeks', 'owner': 'Product'},
         {'action': 'Begin migration plan from custom to commodity sync', 'timeframe': '1 month', 'owner': 'CTO'}],
        {
            'user_need': 'Real-time data synchronisation and intelligent insights across all devices.',
            'components': [
                {'name': 'User Interface', 'evolution': 'Custom', 'visibility': 'HIGH', 'dependencies': ['Intelligence Layer', 'Sync Engine']},
                {'name': 'Intelligence Layer', 'evolution': 'Genesis', 'visibility': 'HIGH', 'dependencies': ['Sync Engine', 'Data Store']},
                {'name': 'Sync Engine', 'evolution': 'Product', 'visibility': 'MEDIUM', 'dependencies': ['Data Store', 'Network Protocol']},
                {'name': 'Data Store', 'evolution': 'Commodity', 'visibility': 'LOW', 'dependencies': ['Cloud Infrastructure']},
                {'name': 'Cloud Infrastructure', 'evolution': 'Commodity', 'visibility': 'LOW', 'dependencies': []},
                {'name': 'Network Protocol', 'evolution': 'Commodity', 'visibility': 'LOW', 'dependencies': ['Cloud Infrastructure']}
            ],
            'movements': [
                {'component': 'Sync Engine', 'direction': 'Product → Commodity', 'rationale': '3 open-source alternatives gaining traction, 2 cloud providers adding native sync'},
                {'component': 'Intelligence Layer', 'direction': 'Genesis → Custom', 'rationale': 'Early movers building AI-powered insights, no commodity solution yet'},
                {'component': 'User Interface', 'direction': 'Custom → Product', 'rationale': 'Design patterns converging, component libraries available'}
            ]
        }
    )),
}

count = 0
for exercise, (pathway, report_json) in TOOLS.items():
    try:
        html = render_report_html(report_json, pathway, exercise)
        outpath = os.path.join(OUTDIR, f'{exercise}.html')
        with open(outpath, 'w') as f:
            f.write(html)
        count += 1
        print(f'  OK  {exercise} ({len(html):,} bytes)')
    except Exception as e:
        print(f'  FAIL  {exercise}: {e}')

print(f'\nGenerated {count}/20 reports in {OUTDIR}/')
