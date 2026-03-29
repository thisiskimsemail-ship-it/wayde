// === THEME TOGGLE ===
(function() {
    const saved = localStorage.getItem('studio_theme') || 'dark';
    if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;
        const icon = btn.querySelector('.theme-icon');
        icon.textContent = (localStorage.getItem('studio_theme') || 'dark') === 'light' ? '☾' : '☀';
        btn.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('studio_theme', next);
            icon.textContent = next === 'light' ? '☾' : '☀';
        });
    });
})();

// === LOGO → HOME ===
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', () => {
            if (typeof forceCloseSession === 'function') forceCloseSession();
        });
    }
});

// === VOICE INPUT ===
document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('micBtn');
    const inputField = document.getElementById('inputField');
    if (!micBtn || !inputField) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { micBtn.classList.add('unsupported'); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-AU';

    let isRecording = false;
    let baseText = '';

    micBtn.addEventListener('click', () => {
        if (isRecording) {
            recognition.stop();
        } else {
            baseText = inputField.value;
            recognition.start();
        }
    });

    recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        micBtn.setAttribute('aria-label', 'Stop recording');
    };

    recognition.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        inputField.value = baseText + (baseText && !baseText.endsWith(' ') ? ' ' : '') + transcript;
        inputField.dispatchEvent(new Event('input'));
    };

    recognition.onend = () => {
        isRecording = false;
        micBtn.classList.remove('recording');
        micBtn.setAttribute('aria-label', 'Voice input');
        inputField.focus();
    };

    recognition.onerror = (e) => {
        if (e.error !== 'aborted') console.warn('Speech recognition error:', e.error);
        isRecording = false;
        micBtn.classList.remove('recording');
        micBtn.setAttribute('aria-label', 'Voice input');
        if (e.error === 'not-allowed') {
            showMicHint('Microphone access blocked — allow it in your browser settings.');
        } else if (e.error === 'no-speech') {
            showMicHint('No speech detected. Try again.');
        } else if (e.error === 'network') {
            showMicHint('Network error — voice input requires an internet connection.');
        }
    };

    function showMicHint(msg) {
        let hint = document.getElementById('micHint');
        if (!hint) {
            hint = document.createElement('div');
            hint.id = 'micHint';
            hint.className = 'mic-hint';
            micBtn.parentElement.appendChild(hint);
        }
        hint.textContent = msg;
        hint.classList.add('visible');
        clearTimeout(hint._t);
        hint._t = setTimeout(() => hint.classList.remove('visible'), 4000);
    }
});

// === SCROLL-REVEAL FOOTER ===
// Hidden by default. Only reveal after user has scrolled down past the CTA.
document.addEventListener('DOMContentLoaded', () => {
    const footer = document.getElementById('wadeCta');
    const cta = document.getElementById('enterStudioBtn');
    if (!footer || !cta) return;
    let revealed = false;
    const checkScroll = () => {
        if (revealed) return;
        const ctaRect = cta.getBoundingClientRect();
        // Only reveal if user has scrolled AND the CTA is above the viewport
        if (window.scrollY > 100 && ctaRect.bottom < 0) {
            revealed = true;
            footer.classList.add('visible');
            window.removeEventListener('scroll', checkScroll);
        }
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
});

// === LOGO SWAP PER STAGE ===
const STAGE_LOGOS = {
    untangle: 'logo-teal.png',
    spark: 'logo-orange.png',
    test: 'logo-pink.png',
    build: 'logo-yellow.png',
    routing: 'logo-orange.png'
};
function updateStageLogo(mode) {
    const logo = document.querySelector('.logo');
    if (!logo) return;
    const src = STAGE_LOGOS[mode] || 'logo.png';
    if (!logo.src.endsWith(src)) logo.src = src;
}

// === BREADCRUMB DROPDOWN ===
const STAGE_TOOLS = {
    untangle: ['five-whys', 'empathy-map', 'jtbd', 'socratic', 'iceberg'],
    spark: ['crazy-8s', 'hmw', 'scamper', 'mash-up', 'constraint-flip'],
    test: ['pre-mortem', 'devils-advocate', 'customer-discovery', 'reality-check', 'trade-off'],
    build: ['lean-canvas', 'effectuation', 'rapid-experiment', 'flywheel', 'theory-of-change']
};

function updateBreadcrumbDropdown(currentMode, currentExercise) {
    const inner = document.getElementById('breadcrumbDropdownInner');
    if (!inner) return;
    inner.innerHTML = '';
    const STAGE_ORDER_ALL = ['untangle', 'spark', 'test', 'build'];
    STAGE_ORDER_ALL.forEach(stage => {
        const section = document.createElement('div');
        section.className = 'breadcrumb-dropdown-section';
        section.textContent = (MODE_LABELS[stage] || stage).toUpperCase();
        inner.appendChild(section);
        (STAGE_TOOLS[stage] || []).forEach(tool => {
            const btn = document.createElement('button');
            btn.className = 'breadcrumb-dropdown-item';
            if (tool === currentExercise) btn.classList.add('active');
            const time = EXERCISE_TIMES[tool];
            btn.innerHTML = `${EXERCISE_LABELS[tool] || tool}${time ? `<span class="dropdown-time">${time}</span>` : ''}`;
            btn.addEventListener('click', () => {
                document.getElementById('breadcrumbDropdown').classList.add('hidden');
                document.getElementById('breadcrumbTool').classList.remove('open');
                startExercise(stage, tool);
            });
            inner.appendChild(btn);
        });
    });
}

// Toggle dropdown on breadcrumb tool click
document.addEventListener('DOMContentLoaded', () => {
    const toolBtn = document.getElementById('breadcrumbTool');
    const dropdown = document.getElementById('breadcrumbDropdown');
    if (!toolBtn || !dropdown) return;
    toolBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !dropdown.classList.contains('hidden');
        dropdown.classList.toggle('hidden');
        toolBtn.classList.toggle('open');
    });
    // Close on outside click
    document.addEventListener('click', () => {
        dropdown.classList.add('hidden');
        toolBtn.classList.remove('open');
    });
});

// === TOOLBOX TOGGLE (mobile only) ===
document.addEventListener('DOMContentLoaded', () => {
    const heading = document.getElementById('cardsHeading');
    const cards = document.querySelector('.welcome-cards');
    if (!heading || !cards) return;
    function isMobile() { return window.innerWidth <= 640; }
    if (isMobile()) cards.classList.add('cards-collapsed');
    heading.addEventListener('click', () => {
        if (!isMobile()) return;
        cards.classList.toggle('cards-collapsed');
    });
    window.addEventListener('resize', () => {
        if (!isMobile()) cards.classList.remove('cards-collapsed');
    });
});

// === ANALYTICS ===
function trackEvent(event, meta = {}) {
    const deviceId = localStorage.getItem('studio_device_id') || '';
    fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, device_id: deviceId, mode: state?.mode || '', exercise: state?.exercise || '', meta })
    }).catch(() => {}); // Fire and forget
}

// === EXERCISE LABELS ===
const EXERCISE_LABELS = {
    'five-whys': 'Five Whys',
    'hmw': 'How Might We',
    'jtbd': 'Jobs to Be Done',
    'scamper': 'SCAMPER',
    'crazy-8s': 'Crazy 8s',
    'mash-up': 'Mash Up',
    'analogical': 'Mash Up',
    'pre-mortem': 'Pre-Mortem',
    'devils-advocate': "Devil's Advocate",
    'rapid-experiment': 'Rapid Experiment',
    'empathy-map': 'Empathy Map',
    'lean-canvas': 'Lean Canvas',
    'effectuation': 'Effectuation',
    'flywheel': 'Flywheel',
    'socratic': 'Socratic Questioning',
    'customer-discovery': 'Customer Discovery',
    'reality-check': 'Reality Check',
    'theory-of-change': 'Theory of Change',
    'trade-off': 'The Trade-Off',
    'iceberg': 'The Iceberg',
    'constraint-flip': 'Constraint Flip'
};

const MODE_LABELS = {
    untangle: 'The Untangle',
    spark: 'The Spark',
    test: 'The Test',
    build: 'The Build'
};

// Reverse map: exercise key → mode (used for routing suggestions)
const EXERCISE_MODE = {
    'five-whys':        'untangle',
    'jtbd':             'untangle',
    'empathy-map':      'untangle',
    'hmw':              'spark',
    'scamper':          'spark',
    'crazy-8s':         'spark',
    'pre-mortem':       'test',
    'devils-advocate':  'test',
    'mash-up':          'spark',
    'analogical':       'spark',
    'lean-canvas':      'build',
    'effectuation':     'build',
    'rapid-experiment': 'build',
    'flywheel': 'build',
    'socratic': 'untangle',
    'customer-discovery': 'test',
    'reality-check': 'test',
    'theory-of-change': 'build',
    'trade-off': 'test',
    'iceberg': 'untangle',
    'constraint-flip': 'spark'
};

// Map hyphenated tool-detail page slugs to internal exercise keys
const TOOL_SLUG_MAP = {
    'analogical-thinking': 'mash-up',
    'mash-up': 'mash-up',
    'jobs-to-be-done': 'jtbd',
    'how-might-we': 'hmw',
    'socratic-questioning': 'socratic'
};

// Exercise descriptions (mirror of HTML card text)
const EXERCISE_DESCS = {
    'five-whys':        'Uncover the root cause behind a problem.',
    'jtbd':             'Understand what your customer is really trying to achieve.',
    'empathy-map':      'Step into your user\'s world to reveal hidden insights.',
    'hmw':              'Turn problems into opportunity-framing questions.',
    'scamper':          'Stretch an idea by substituting, combining, adapting and more.',
    'crazy-8s':         'Rapidly sketch eight ideas in eight minutes to unlock creativity.',
    'pre-mortem':       'Imagine the project failed. What went wrong?',
    'devils-advocate':  'Face five named adversaries who attack your idea from different risk angles.',
    'rapid-experiment': 'Design a quick test to learn before you build.',
    'lean-canvas':      'Outline your venture model on a single page.',
    'effectuation':     'Build using the resources and relationships you already have.',
    'mash-up':          'Smash ideas from different industries together and see what comes out.',
    'analogical':       'Smash ideas from different industries together and see what comes out.',
    'flywheel':         'Map the reinforcing loop that drives your growth and find the bottleneck.',
    'socratic':         'Test whether your problem is built on facts or assumptions.',
    'customer-discovery':         'Practise a customer interview — Pete plays the customer.',
    'reality-check':     'Pressure-test your idea against all four product risks.',
    'theory-of-change':  'Map the causal chain from what you do to the change you create.',
    'trade-off':         'Force trade-offs to reveal what customers actually value.',
    'iceberg':           'See the system beneath the surface problem.',
    'constraint-flip':   'Turn your biggest limitation into your deepest advantage.'
};

// Placeholder text shown in the input field per exercise
const EXERCISE_HINTS = {
    'five-whys':        'Type, chat, or upload — e.g. "Our team keeps missing deadlines and no one knows why"',
    'jtbd':             'Type, chat, or upload — e.g. "I\'m redesigning our onboarding process for new staff"',
    'empathy-map':      'Type, chat, or upload — e.g. "My stakeholder keeps resisting the change we\'re proposing"',
    'hmw':              'Type, chat, or upload — e.g. "People aren\'t adopting the new process we rolled out"',
    'scamper':          'Type, chat, or upload — e.g. "I want to reinvent how we run quarterly planning"',
    'crazy-8s':         'Type, chat, or upload — e.g. "I need fresh ideas for improving team collaboration"',
    'pre-mortem':       'Type, chat, or upload — e.g. "We\'re about to roll out a new programme organisation-wide"',
    'devils-advocate':  'Type, chat, or upload — e.g. "We\'re proposing a major shift in how we deliver services"',
    'rapid-experiment': 'Type, chat, or upload — e.g. "I think clients would value a monthly insight briefing"',
    'lean-canvas':      'Type, chat, or upload — e.g. "I\'m developing a new service offering within our division"',
    'effectuation':     'Type, chat, or upload — e.g. "I have deep expertise in policy and a strong network"',
    'mash-up':          'Type, chat, or upload — e.g. "How might we reduce handoff delays like F1 pit stops?"',
    'analogical':       'Type, chat, or upload — e.g. "How might we reduce handoff delays like F1 pit stops?"',
    'customer-discovery':        'Type, chat, or upload — e.g. "I need to explain what we do to investors"',
    'iceberg':          'Type, chat, or upload — e.g. "We keep losing our best people and nothing fixes it"',
    'constraint-flip':  'Type, chat, or upload — e.g. "We have no marketing budget and competitors spend millions"',
    'trade-off':        'Type, chat, or upload — e.g. "We have seven features and every stakeholder says theirs is essential"',
    'theory-of-change': 'Type, chat, or upload — e.g. "I can\'t explain how our work leads to the impact we promise"',
    'reality-check':    'Type, chat, or upload — e.g. "I keep saying we have product-market fit but the numbers are thin"',
    'socratic':         'Type, chat, or upload — e.g. "Everyone says the board will never approve this"',
    'flywheel':         'Type, chat, or upload — e.g. "Our users love it but growth has stalled"'
};

// Exercise arc descriptions for activity brief cards
const EXERCISE_ARCS = {
    'five-whys':        'We\'ll name your challenge, then dig through five layers of "why?" to find the root cause underneath.',
    'jtbd':             'We\'ll map out what your customer is really trying to get done, then narrow to the job that matters most.',
    'empathy-map':      'We\'ll build a picture of what your user thinks, feels, says, and does — then find the gaps between them.',
    'hmw':              'We\'ll reframe your problem as opportunity questions, then pick the one with the most creative potential.',
    'scamper':          'We\'ll run your idea through seven creative lenses, then pull out the strongest twist.',
    'crazy-8s':         'We\'ll rapidly generate eight different ideas, then zero in on the one worth developing.',
    'pre-mortem':       'We\'ll imagine your project has failed spectacularly, then work backwards to find what you can prevent now.',
    'devils-advocate':  'Pete will become one of five adversaries — a churned customer, confused user, tired engineer, sceptical investor, or fast follower — and attack your idea. You defend it.',
    'rapid-experiment': 'We\'ll design a quick, cheap test to validate your riskiest assumption before you build.',
    'lean-canvas':      'We\'ll map your venture model on one page, then pressure-test the weakest blocks.',
    'effectuation':     'We\'ll start with what you have — skills, network, resources — then find where they point.',
    'mash-up':          'We\'ll smash ideas from completely different industries together, see what collides, and remix the best into something new.',
    'analogical':       'We\'ll smash ideas from completely different industries together, see what collides, and remix the best into something new.',
    'iceberg':          'We\'ll go four levels deep — from what happened, to the pattern, to the structure, to the belief holding it all in place.',
    'constraint-flip':  'Pete will help you see your biggest constraint as your deepest competitive advantage. Ideas that only work because of the limitation.',
    'trade-off':        'Pete will force you to choose between your own features. The ones that survive every round are your core value.',
    'theory-of-change': 'We\'ll work backwards from the change you want to create, mapping every condition that has to be true, and find where the chain depends on things you can\'t control.',
    'reality-check':    'Pete will pressure-test your idea across four risk dimensions — value, usability, feasibility, and viability — and score each one.',
    'customer-discovery':        'Pete will become your target customer and you\'ll practise a discovery interview. He\'ll respond like a real person — evasive, polite, distracted. Then he\'ll coach you on your technique.',
    'socratic':         'We\'ll examine every belief behind your problem — separating facts from assumptions — and find the one thing to test first.',
    'flywheel':         'We\'ll map the 3-5 things that reinforce each other in your business, test each connection, and find the bottleneck holding you back.'
};



// Contextual program + article recommendations by pathway
const SESSION_RECOMMENDATIONS = {
    untangle: {
        program: { name: 'Think Like an Entrepreneur', url: 'https://wadeinstitute.org.au/programs/entrepreneurs/think-like-an-entrepreneur/', desc: 'Build the mindset to lead change inside organisations.' },
        article: { name: 'Start with a problem you really want to solve', url: 'https://wadeinstitute.org.au/entrepreneurship-starts-with-a-problem-you-really-want-to-solve/', desc: 'Why problem definition is the first entrepreneurial skill.' }
    },
    spark: {
        program: { name: 'Growth Engine', url: 'https://wadeinstitute.org.au/programs/entrepreneurs/growth-engine/', desc: 'A three-day intensive for founders scaling from 30 to 100+ people.' },
        article: { name: 'Thrill of a big idea', url: 'https://wadeinstitute.org.au/thrill-of-a-big-idea/', desc: 'What happens when ideation meets execution.' }
    },
    test: {
        program: { name: 'VC Catalyst', url: 'https://wadeinstitute.org.au/programs/investors/vc-catalyst/', desc: 'Build the skills and judgement to invest in early-stage ventures.' },
        article: { name: 'Making mistakes and staying humble', url: 'https://wadeinstitute.org.au/making-mistakes-and-staying-humble-lessons-from-leigh-jasper/', desc: 'Lessons from the co-founder of Aconex on resilience and humility.' }
    },
    build: {
        program: { name: 'Growth Engine', url: 'https://wadeinstitute.org.au/programs/entrepreneurs/growth-engine/', desc: 'Stress-test your growth model with peers facing similar challenges.' },
        article: { name: '5 steps to turn your idea into a business', url: 'https://wadeinstitute.org.au/5-steps-to-turn-your-idea-into-a-business/', desc: 'From idea to business model — the practical path.' }
    }
};


// Tool-to-Program mapping for Go Deeper (Steps 8, 10, and report)
const TOOL_PROGRAM_MAP = {
    'five-whys': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Root cause analysis is one of the foundational practices in Wade\'s Master of Entrepreneurship — a 10-month program that builds the skills to identify and solve the problems that matter.',
        segment: 'founder'
    },
    'empathy-map': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Understanding your user is the starting point of Wade\'s design-led approach to entrepreneurship. The Master of Entrepreneurship goes deeper into user research, validation, and customer development.',
        segment: 'founder'
    },
    'jtbd': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Jobs to Be Done is a core framework in Wade\'s entrepreneurship curriculum. The Master of Entrepreneurship teaches you to build businesses around the jobs customers are actually hiring for.',
        segment: 'founder'
    },
    'socratic': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Testing your assumptions before you build is what Wade\'s Master of Entrepreneurship is built around — 10 months of rigorous, mentor-led entrepreneurial thinking.',
        segment: 'founder'
    },
    'iceberg': {
        program: 'Executive Education',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/think-like-an-entrepreneur/',
        bridge: 'Systems thinking is at the heart of Wade\'s approach to innovation leadership. Wade\'s executive programs help leaders see the structures and mental models driving organisational challenges.',
        segment: 'corporate'
    },
    'crazy-8s': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Rapid ideation is just the beginning. Wade\'s Master of Entrepreneurship takes you from ideas to validated business models in 10 months.',
        segment: 'founder'
    },
    'hmw': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Reframing problems is a design thinking practice Wade teaches across all its programs. The Master of Entrepreneurship applies it to real ventures, with real stakes.',
        segment: 'founder'
    },
    'scamper': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Creative frameworks like SCAMPER are part of Wade\'s innovation toolkit. The Master of Entrepreneurship teaches 20 frameworks and helps you apply them to your own venture.',
        segment: 'founder'
    },
    'mash-up': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Cross-domain thinking is one of the most powerful innovation skills. Wade\'s Master of Entrepreneurship builds this muscle over 10 months of structured practice.',
        segment: 'founder'
    },
    'analogical': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Cross-domain thinking is one of the most powerful innovation skills. Wade\'s Master of Entrepreneurship builds this muscle over 10 months of structured practice.',
        segment: 'founder'
    },
    'constraint-flip': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Turning constraints into advantages is a skill Wade\'s founders practise throughout the Master of Entrepreneurship — because every early-stage venture has more constraints than resources.',
        segment: 'founder'
    },
    'pre-mortem': {
        program: 'Executive Education',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/think-like-an-entrepreneur/',
        bridge: 'Stress-testing before you commit is a practice Wade brings to its executive programs. Wade works with corporate innovation teams to build the discipline of testing ideas before scaling them.',
        segment: 'corporate'
    },
    'devils-advocate': {
        program: 'Executive Education',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/think-like-an-entrepreneur/',
        bridge: 'Rigorous thinking under pressure is what Wade\'s executive programs are designed to develop. If your team needs to make better decisions, Wade can help.',
        segment: 'corporate'
    },
    'customer-discovery': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Getting your message right is critical for founders. Wade\'s Master of Entrepreneurship includes pitch development, investor communication, and customer messaging as core curriculum.',
        segment: 'founder'
    },
    'reality-check': {
        program: 'Executive Education',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/think-like-an-entrepreneur/',
        bridge: 'Confronting the gap between narrative and evidence is what Wade helps leaders do — in executive programs designed for innovation teams inside organisations.',
        segment: 'corporate'
    },
    'trade-off': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Understanding what customers actually value is the foundation of product-market fit. Wade\'s Master of Entrepreneurship teaches founders to test value propositions rigorously before they build.',
        segment: 'founder'
    },
    'lean-canvas': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'The Lean Canvas is the starting point for business model design in Wade\'s Master of Entrepreneurship — where you build, test, and refine a real venture over 10 months.',
        segment: 'founder'
    },
    'effectuation': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Starting with what you have is the effectuation principle Wade teaches every cohort. The Master of Entrepreneurship helps you turn your resources into a venture.',
        segment: 'founder'
    },
    'rapid-experiment': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Designing experiments for your riskiest assumptions is a core practice in Wade\'s Master of Entrepreneurship. The program teaches you to test before you build.',
        segment: 'founder'
    },
    'flywheel': {
        program: 'Growth Engine',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/growth-engine/',
        bridge: 'Mapping your growth engine is essential for ventures ready to scale. Wade\'s Growth Engine program helps founders identify and unlock the flywheel that drives sustainable growth.',
        segment: 'founder'
    },
    'theory-of-change': {
        program: 'Master of Entrepreneurship',
        programUrl: 'https://wadeinstitute.org.au/programs/entrepreneurs/master-of-entrepreneurship/',
        bridge: 'Reverse-engineering impact is what Wade teaches social entrepreneurs and impact founders. The Master of Entrepreneurship includes a dedicated impact track for ventures creating systemic change.',
        segment: 'founder'
    }
};
const TOOL_PROGRAM_FALLBACK = {
    program: 'Wade Institute Programs',
    programUrl: 'https://wadeinstitute.org.au/programs/',
    bridge: 'This session is powered by Wade Institute\'s innovation methodology. Wade offers programs for founders, innovation leaders, and teams who want to go deeper.',
    segment: 'founder'
};

// Starter prompts removed — users type, chat, or upload directly

// Expected exchange counts per exercise (for progress indicator)
const EXERCISE_EXCHANGES = {
    'five-whys': 7, 'jtbd': 10, 'empathy-map': 10,
    'hmw': 8, 'scamper': 10, 'crazy-8s': 8,
    'pre-mortem': 10, 'devils-advocate': 10, 'rapid-experiment': 8,
    'lean-canvas': 12, 'effectuation': 8, 'mash-up': 8, 'analogical': 8, 'flywheel': 10, 'socratic': 8, 'customer-discovery': 8, 'reality-check': 8, 'theory-of-change': 10, 'trade-off': 10, 'iceberg': 8, 'constraint-flip': 8
};

// Human-readable time estimates per exercise
const EXERCISE_TIMES = {
    'five-whys':      '15 min',
    'jtbd':           '20 min',
    'empathy-map':    '20 min',
    'hmw':            '20 min',
    'scamper':        '20 min',
    'crazy-8s':       '15 min',
    'pre-mortem':     '20 min',
    'devils-advocate':'25 min',
    'rapid-experiment':'15 min',
    'lean-canvas':    '20 min',
    'effectuation':   '20 min',
    'mash-up':        '20 min',
    'analogical':     '20 min',
    'flywheel':       '25 min',
    'socratic':       '20 min',
    'customer-discovery':      '20 min',
    'reality-check':  '20 min',
    'theory-of-change':'25 min',
    'trade-off':      '25 min',
    'iceberg':        '20 min',
    'constraint-flip':'20 min'
};

// Stage order for progress strip
const STAGE_ORDER = ['untangle', 'spark', 'test', 'build'];

// Next recommended category after each mode
const NEXT_STAGE = {
    untangle: { mode: 'spark',  exercise: 'crazy-8s' },
    spark:    { mode: 'test',   exercise: 'pre-mortem' },
    test:     { mode: 'build',  exercise: 'lean-canvas' },
    build:    null
};

// Default exercise when navigating to a category via the progress dots
const STAGE_DEFAULT = {
    untangle: 'five-whys',
    spark:    'hmw',
    test:     'pre-mortem',
    build:    'lean-canvas'
};

// All exercises grouped by category
const TOOLS_BY_MODE = {
    untangle: ['five-whys', 'empathy-map', 'jtbd', 'socratic', 'iceberg'],
    spark:    ['crazy-8s', 'hmw', 'scamper', 'mash-up', 'constraint-flip'],
    test:     ['pre-mortem', 'devils-advocate', 'customer-discovery', 'reality-check', 'trade-off'],
    build:    ['lean-canvas', 'effectuation', 'rapid-experiment', 'flywheel', 'theory-of-change']
};

// Category prompts — used by homepage cards and ?category= URL param
const CATEGORY_PROMPTS = {
    untangle: "I have a problem I need to get to the bottom of. I'm not sure what's really going on — help me untangle it.",
    spark: "I have the beginning of an idea and I want to explore it. Help me push it in directions I haven't tried.",
    test: "I have a proposal I think is ready — but I want to stress-test it before I commit.",
    build: "I know what I want to create. Help me turn it into a concrete plan I can act on."
};

// === STATE ===
const state = {
    mode: null,
    exercise: null,
    messages: [],
    streaming: false,
    exchangeCount: 0,
    reportGenerated: false,
    reportText: '',
    projectContext: [],  // accumulated context from previous stages
    routing: false,      // true when in tool-suggestion mode (no exercise selected)
    rating: null,        // thumbs up/down from wrap card
    pushHarder: false,   // more Socratic facilitation mode
    preReportAsked: false, // true after pre-report handoff question has been shown
    parkingLot: [],       // { text, fromExercise, timestamp }
    currentPhase: null,   // 'diverge' | 'converge'
    sessionStartTime: null, // Date.now() when exercise starts
    board: { cards: [], visible: false },  // workshop board state
    boardMode: 'default',  // 'default' | 'lean-canvas'
    pitch: { customer: null, problem: null, solution: null, benefit: null, differentiator: null },  // elevator pitch components
    tradeOffRound: 0,  // counts BUNDLE tags rendered for trade-off progress
    wrapped: false,  // true when [WRAP] signal received — hides Help/Challenge buttons
    userEmail: localStorage.getItem('wade_user_email') || '',  // persisted for memory
    deviceId: localStorage.getItem('wade_device_id') || ''  // anonymous identity for memory
};

// Generate device ID on first visit (anonymous — no email needed)
if (!state.deviceId) {
    state.deviceId = 'dev_' + crypto.randomUUID();
    localStorage.setItem('wade_device_id', state.deviceId);
}

// === DOM ===
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const chatArea = $('#chatArea');
const messagesEl = $('#messages');
const welcome = $('#welcome');
const inputForm = $('#inputForm');
const inputField = $('#inputField');
const sendBtn = $('#sendBtn');
const uploadBtn = $('#uploadBtn');
const fileInput = $('#fileInput');
const modeLabel = $('#modeLabel');
const toolLearnLink = $('#toolLearnLink');

// Map exercise keys to tool detail page filenames (where they differ)
const TOOL_DETAIL_SLUG = {
    'jtbd': 'jobs-to-be-done',
    'hmw': 'how-might-we',
    'mash-up': 'analogical-thinking',
    'analogical': 'analogical-thinking',
    'socratic': 'socratic-questioning',
    'customer-discovery': 'customer-discovery',
    'reality-check': 'reality-check',
    'theory-of-change': 'theory-of-change',
    'trade-off': 'trade-off',
    'iceberg': 'iceberg',
    'constraint-flip': 'constraint-flip'
};
function toolDetailUrl(exercise) {
    const slug = TOOL_DETAIL_SLUG[exercise] || exercise;
    return `tool-detail-${slug}.html`;
}
const sessionBar = $('#sessionBar');
const sessionMode = $('#sessionMode');
const sessionExercise = $('#sessionExercise');
const sessionClose = $('#sessionClose');
const stageProgress = $('#stageProgress');
const toolPickerBtn = $('#toolPickerBtn');
const toolPickerMenu = $('#toolPickerMenu');
const reportCta = $('#reportCta');
const reportCtaBtn = $('#reportCtaBtn');
const reportCard = $('#reportCard');
const reportContent = $('#reportContent');
const leadModal = $('#leadModal');
const leadForm = $('#leadForm');
const leadSubmit = $('#leadSubmit');
const wadeCta = $('#wadeCta');
const reportUnlock = $('#reportUnlock');
const unlockForm = $('#unlockForm');
const routingBack = $('#routingBack');
const routingBackBtn = $('#routingBackBtn');
const inputArea = document.querySelector('.input-area');

// Move input box into welcome (between tagline and cards) or back to body (session)
function moveInputToWelcome() {
    // Input stays in footer on welcome — Enter Studio button handles entry
    // Only move input into welcome if there's no Enter Studio button (legacy fallback)
    const enterBtn = document.getElementById('enterStudioBtn');
    if (enterBtn) return;
    const resumeBanner = welcome.querySelector('#resumeBanner');
    const anchor = resumeBanner || welcome.querySelector('.welcome-cards');
    if (anchor && inputArea && inputArea.parentElement !== welcome) {
        welcome.insertBefore(inputArea, anchor);
    }
}

function moveInputToSession() {
    if (inputArea && inputArea.parentElement !== document.body) {
        document.body.appendChild(inputArea);
    }
}

// Render "Challenge me" + "Help me" buttons after each AI response
function renderSessionActions() {
    if (!state.mode || state.routing || state.reportGenerated || state.wrapped) return;
    document.querySelector('.chat-action-btns')?.remove();

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'chat-action-btns';

    const challengeBtn = document.createElement('button');
    challengeBtn.className = 'chat-action-btn challenge-btn' + (state.pushHarder ? ' active' : '');
    challengeBtn.textContent = state.pushHarder ? 'Challenge mode on' : 'Challenge me';
    challengeBtn.addEventListener('click', () => {
        state.pushHarder = !state.pushHarder;
        challengeBtn.classList.toggle('active', state.pushHarder);
        challengeBtn.textContent = state.pushHarder ? 'Challenge mode on' : 'Challenge me';
    });

    const helpBtn = document.createElement('button');
    helpBtn.className = 'chat-action-btn help-btn';
    helpBtn.textContent = 'Help me';
    helpBtn.addEventListener('click', () => {
        if (state.streaming) return;
        const helpMsg = "I'm feeling a bit stuck. Can you give me a nudge — maybe a tip, a prompt, or an example to help me move forward?";
        actionsDiv.remove();
        appendMessage('user', helpMsg);
        state.messages.push({ role: 'user', content: helpMsg });
        streamResponse();
    });

    actionsDiv.appendChild(helpBtn);
    actionsDiv.appendChild(challengeBtn);
    messagesEl.appendChild(actionsDiv);
    scrollToBottom();

    // Tone toggle nudge — first session only
    if (!localStorage.getItem('studio_tone_toggle_seen')) {
        localStorage.setItem('studio_tone_toggle_seen', '1');
        const tip = document.createElement('div');
        tip.className = 'feature-hint';
        tip.innerHTML = '<span class="feature-hint-text">Want Pete to push back harder? Switch to "Challenge me" for a tougher conversation.</span><button class="feature-hint-dismiss">Got it</button>';
        tip.style.cssText = 'position:relative;margin:0.4rem 0;display:inline-block;';
        actionsDiv.after(tip);
        const dismiss = () => tip.remove();
        tip.querySelector('.feature-hint-dismiss').addEventListener('click', dismiss);
        setTimeout(dismiss, 6000);
    }
}

// === STAGE PROGRESS ===

function updateStageProgress(mode) {
    stageProgress.dataset.mode = mode;
    document.body.dataset.mode = mode;
    updateStageLogo(mode);
    const idx = STAGE_ORDER.indexOf(mode);
    $$('.stage-step').forEach((step, i) => {
        step.classList.toggle('active', i === idx);
        step.classList.toggle('done', i < idx);
        step.classList.add('clickable'); // all stages open a picker
        step.onclick = null;
        step.title = '';
        // Remove any previous tool label
        step.querySelector('.stage-tool')?.remove();
        if (i === idx) {
            // Show current tool name under the active stage
            const toolEl = document.createElement('span');
            toolEl.className = 'stage-tool';
            toolEl.textContent = EXERCISE_LABELS[state.exercise] || state.exercise;
            step.appendChild(toolEl);
        }
    });
}

// Gate: require report before switching tools (if user has had enough exchanges)
function requireReportBeforeSwitch(callback) {
    if (state.exchangeCount >= 3 && !state.reportGenerated && !state.routing) {
        // Show confirmation modal
        const overlay = document.createElement('div');
        overlay.className = 'report-gate-overlay';
        overlay.innerHTML = `
            <div class="report-gate-modal" data-mode="${state.mode}">
                <h3>Generate your report first?</h3>
                <p>You've been working through ${EXERCISE_LABELS[state.exercise] || state.exercise}. Grab your session summary before moving on — you won't be able to come back to it.</p>
                <div class="report-gate-actions">
                    <button class="report-gate-btn report-gate-generate">Get my report first</button>
                    <button class="report-gate-btn report-gate-skip">Skip and switch</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('.report-gate-generate').addEventListener('click', () => {
            overlay.remove();
            // Trigger report generation — user can switch after
            generateReport();
        });
        overlay.querySelector('.report-gate-skip').addEventListener('click', () => {
            overlay.remove();
            callback();
        });
        return true; // blocked
    }
    return false; // not blocked
}

// Navigate to a stage — carries report context if available, picks a specific exercise if provided
function navigateToStage(targetMode, specificExercise = null) {
    if (state.streaming) return;
    const targetExercise = specificExercise || STAGE_DEFAULT[targetMode];
    if (requireReportBeforeSwitch(() => navigateToStage(targetMode, specificExercise))) return;
    if (state.reportText) {
        state.projectContext.push({
            stage: MODE_LABELS[state.mode] || state.mode,
            exercise: EXERCISE_LABELS[state.exercise] || state.exercise,
            report: state.reportText
        });
        const bridgeMsg = `I've completed ${EXERCISE_LABELS[state.exercise] || state.exercise} (${MODE_LABELS[state.mode] || state.mode} stage). Let's move to ${EXERCISE_LABELS[targetExercise] || targetExercise}, building directly on what I discovered.`;
        startExercise(targetMode, targetExercise, bridgeMsg);
    } else {
        swapToTool(targetMode, targetExercise, null);
    }
}

// === TOOL PICKER ===

function setPickerEnabled(enabled) {
    toolPickerBtn.disabled = !enabled;
    stageProgress.classList.toggle('tool-enabled', enabled);
}

let pickerCloseTimer = null;

// Build and show the tool picker anchored to a stage step
function openStagePickerForStep(stepEl) {
    if (state.streaming) return;
    clearTimeout(pickerCloseTimer);

    const targetMode = stepEl.dataset.stage;
    const tools = TOOLS_BY_MODE[targetMode] || [];

    toolPickerMenu.innerHTML =
        tools.map(t => {
            const isCurrent = t === state.exercise && targetMode === state.mode;
            const time = EXERCISE_TIMES[t];
            return `<button class="tool-picker-item${isCurrent ? ' tool-picker-current' : ''}" data-exercise="${t}" data-mode="${targetMode}">${EXERCISE_LABELS[t] || t}${time ? `<span class="picker-time">${time}</span>` : ''}</button>`;
        }).join('') +
        `<div class="picker-divider"></div>
         <button class="tool-picker-item tool-picker-help" data-mode="${targetMode}">Help me choose →</button>`;

    toolPickerMenu.querySelectorAll('.tool-picker-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toolPickerMenu.classList.add('hidden');
            if (btn.classList.contains('tool-picker-help')) {
                helpMeChooseForStage(btn.dataset.mode);
                return;
            }
            const exercise = btn.dataset.exercise;
            const mode = btn.dataset.mode;
            if (mode === state.mode && exercise === state.exercise) return; // already here
            if (mode === state.mode) {
                swapToTool(mode, exercise, null);
            } else {
                navigateToStage(mode, exercise);
            }
        });
    });

    // Anchor menu to this step and show
    stepEl.appendChild(toolPickerMenu);
    toolPickerMenu.classList.remove('hidden');
}

// Ask WAiDE to recommend a tool for the given stage
function helpMeChooseForStage(mode) {
    const stageName = MODE_LABELS[mode] || mode;
    const toolNames = (TOOLS_BY_MODE[mode] || []).map(t => EXERCISE_LABELS[t] || t).join(', ');
    const msg = `I'm at the ${stageName} stage but not sure which tool to use. The options are ${toolNames}. Based on what we've been working on, which would you recommend and why?`;
    toolPickerMenu.classList.add('hidden');
    appendMessage('user', msg);
    state.messages.push({ role: 'user', content: msg });
    streamResponse();
}

// Hover: show picker when entering a stage step
$$('.stage-step').forEach(step => {
    step.addEventListener('mouseenter', () => {
        if (sessionBar.classList.contains('hidden')) return;
        openStagePickerForStep(step);
    });
    step.addEventListener('mouseleave', (e) => {
        if (!toolPickerMenu.contains(e.relatedTarget)) {
            pickerCloseTimer = setTimeout(() => toolPickerMenu.classList.add('hidden'), 120);
        }
    });
});

// Keep picker open when hovering over the menu itself
toolPickerMenu.addEventListener('mouseenter', () => clearTimeout(pickerCloseTimer));
toolPickerMenu.addEventListener('mouseleave', () => {
    pickerCloseTimer = setTimeout(() => toolPickerMenu.classList.add('hidden'), 120);
});

// Click: also works for touch devices
stageProgress.addEventListener('click', (e) => {
    const clickedStep = e.target.closest('.stage-step');
    if (!clickedStep || toolPickerMenu.contains(e.target)) return;
    e.stopPropagation();
    openStagePickerForStep(clickedStep);
});

// Close picker when clicking anywhere outside it
document.addEventListener('click', () => {
    toolPickerMenu.classList.add('hidden');
});

// === CARD NAVIGATION ===

$$('.card-exercise-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        const exercise = btn.dataset.exercise;
        startExercise(mode, exercise);
    });
});


// Starter prompts removed — users type, chat, or upload directly

function startExercise(mode, exercise, startMsg = null) {
    trackEvent('tool_start', { tool: exercise });
    // If transitioning from routing, use the user's own description as the exercise kickoff
    // so WAiDE can respond in context without asking them to repeat themselves
    let autoStartMsg = startMsg;
    if (!autoStartMsg && state.routing && state.messages.length > 0) {
        // Filter out quick-fire button labels — only keep the user's actual problem description
        const quickFireLabels = new Set([
            'idea jam', 'problem solve',
            'napkin sketch', 'blueprint',
            'just me', 'other people',
            'quick and scrappy', 'polished and tight',
            '5-10 minutes', '15-20 minutes'
        ]);
        autoStartMsg = state.messages
            .filter(m => m.role === 'user' && !m.content.startsWith('[SYSTEM]'))
            .map(m => m.content)
            .filter(text => !quickFireLabels.has(text.trim().toLowerCase()))
            .join('\n\n');
    }

    // Carry previous conversation into projectContext so Pete has full history
    if (state.messages.length > 0 && state.mode) {
        const prevExercise = EXERCISE_LABELS[state.exercise] || state.exercise || 'session';
        const prevStage = MODE_LABELS[state.mode] || state.mode || '';
        // Summarise previous messages into context
        const prevMessages = state.messages
            .filter(m => !m.content.startsWith('[SYSTEM]'))
            .map(m => `${m.role === 'user' ? 'User' : 'Pete'}: ${m.content}`)
            .join('\n');
        if (prevMessages) {
            state.projectContext.push({
                stage: prevStage,
                exercise: prevExercise,
                conversation: prevMessages,
                report: state.reportText || ''
            });
        }
    }

    state.mode = mode;
    state.exercise = exercise;
    state.messages = [];
    state.exchangeCount = 0; state.tradeOffRound = 0;
    state.reportGenerated = false;
    state.reportText = '';
    state.routing = false;
    state.rating = null;
    state.preReportAsked = false;
    state.currentPhase = null;
    state.wrapped = false;
    state.sessionStartTime = Date.now();

    // Hide welcome, move input to session, show session bar
    welcome.classList.add('hidden');
    if (wadeCta) wadeCta.style.display = 'none';
    document.body.classList.add('in-session');
    moveInputToSession();
    if (inputArea) inputArea.style.display = '';
    sessionBar.classList.remove('hidden');
    sessionBar.dataset.mode = mode;
    document.body.dataset.mode = mode;
    updateStageLogo(mode);

    // Update session bar text
    sessionMode.textContent = MODE_LABELS[mode] || mode;
    sessionExercise.textContent = EXERCISE_LABELS[exercise] || exercise;

    // Update breadcrumb: STAGE → Tool
    const breadcrumbStage = document.getElementById('breadcrumbStage');
    const breadcrumbTool = document.getElementById('breadcrumbTool');
    if (breadcrumbStage) breadcrumbStage.textContent = (MODE_LABELS[mode] || mode).toUpperCase();
    if (breadcrumbTool) breadcrumbTool.innerHTML = `${EXERCISE_LABELS[exercise] || exercise} <svg class="breadcrumb-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>`;
    updateBreadcrumbDropdown(mode, exercise);

    // Update footer label + learn more link
    modeLabel.innerHTML = `${EXERCISE_LABELS[exercise] || exercise} ·`;
    if (toolLearnLink) { toolLearnLink.href = toolDetailUrl(exercise); toolLearnLink.classList.remove('hidden'); }

    // Update stage progress strip
    updateStageProgress(mode);

    // Reset tool picker (re-enabled after first exchange)
    setPickerEnabled(false);
    toolPickerMenu.classList.add('hidden');

    // Clear messages and hide/reset report elements
    messagesEl.innerHTML = '';
    reportCard.classList.add('hidden');
    reportCard.classList.remove('report-preview');
    reportUnlock.classList.add('hidden');
    leadModal.classList.add('hidden');
    document.getElementById('reportSynopsis')?.classList.add('hidden');
    document.getElementById('reportFormatChoice')?.classList.add('hidden');
    document.querySelectorAll('.report-actions').forEach(bar => bar.classList.add('hidden'));
    $('#reportLinkedInBtn')?.classList.add('hidden');
    routingBack.classList.add('hidden');

    // Switch board layout based on exercise — custom boards for structured tools
    const customLayouts = ['lean-canvas', 'elevator-pitch', 'pre-mortem', 'effectuation', 'flywheel', 'customer-discovery', 'iceberg', 'constraint-flip', 'socratic', 'reality-check', 'theory-of-change', 'trade-off', 'five-whys', 'empathy-map', 'jtbd', 'crazy-8s', 'hmw', 'scamper', 'devils-advocate', 'rapid-experiment', 'mash-up', 'analogical'];
    if (customLayouts.includes(exercise)) {
        switchBoardLayout(exercise);
    } else {
        switchBoardLayout('default');
    }
    // If coming from elevator pitch into lean canvas, carry components
    if (exercise === 'lean-canvas' && Object.values(state.pitch).some(v => v)) {
        pitchToCanvas();
    }

    // Show/hide pitch preview
    const pitchPreview = document.getElementById('pitchPreview');
    if (exercise === 'elevator-pitch') {
        state.pitch = { customer: null, problem: null, solution: null, benefit: null, differentiator: null };
        if (pitchPreview) pitchPreview.classList.remove('hidden');
    } else {
        if (pitchPreview) pitchPreview.classList.add('hidden');
    }

    // Show report CTA immediately but disabled — enables after first exchange
    reportCta.classList.remove('hidden');
    reportCtaBtn.disabled = true;
    reportCtaBtn.textContent = 'Workshop your thinking to build your report';

    // Always show activity brief card — even when transitioning from routing
    const desc = EXERCISE_DESCS[exercise];
    const arc = EXERCISE_ARCS[exercise];
    const expectedExchanges = EXERCISE_EXCHANGES[exercise] || 8;
    if (desc) {
        const introDiv = document.createElement('div');
        introDiv.className = 'activity-brief';
        introDiv.dataset.mode = mode;
        const briefTime = EXERCISE_TIMES[exercise] || `~${Math.round(expectedExchanges * 2)} min`;
        introDiv.innerHTML = `<div class="activity-brief-header"><span class="activity-brief-stage">${MODE_LABELS[mode] || mode}</span><span class="activity-brief-time">${briefTime}</span></div><h3 class="activity-brief-name"><a class="intro-label-link" href="toolbox.html#${exercise}" target="_blank" rel="noopener">${EXERCISE_LABELS[exercise] || exercise}</a></h3><p class="activity-brief-desc">${desc}</p>${arc ? `<p class="activity-brief-arc">${arc}</p>` : ''}<a class="activity-brief-learn" href="tool-detail-${exercise}.html" target="_blank" rel="noopener">Learn more about this tool →</a>`;
        messagesEl.appendChild(introDiv);
    }
    inputField.placeholder = EXERCISE_HINTS[exercise] || 'Describe your challenge or idea...';

    if (autoStartMsg) {
        // Use the user's actual description as the first message so WAiDE skips
        // "what are you working on?" and responds directly in context
        appendMessage('user', autoStartMsg);
        state.messages = [{ role: 'user', content: autoStartMsg }];
        streamResponse();
    } else {
        // Auto-kickoff: send a synthetic first message so WAiDE opens the conversation
        state.messages = [{ role: 'user', content: 'Please start the session.' }];
        streamResponse();
    }
}

// === BACK TO MENU ===

function forceCloseSession() {
    state.mode = null;
    state.exercise = null;
    state.messages = [];
    state.exchangeCount = 0; state.tradeOffRound = 0;
    state.reportGenerated = false;
    state.reportText = '';
    delete document.body.dataset.mode;
    inSession = false;
    // Reset logo to default orange wordmark
    const logo = document.querySelector('.logo');
    if (logo) logo.src = 'logo.png';
    welcome.classList.remove('hidden');
    moveInputToWelcome();
    sessionBar.classList.add('hidden');
    messagesEl.innerHTML = '';
    inputField.value = '';
    inputField.disabled = false;
    inputField.placeholder = 'Type, chat, or upload your challenge...';
    sendBtn.disabled = true;
    modeLabel.textContent = 'The Studio · ';
    if (toolLearnLink) toolLearnLink.classList.add('hidden');
    // Clear all report UI
    document.getElementById('reportSynopsis')?.classList.add('hidden');
    document.getElementById('reportFormatChoice')?.classList.add('hidden');
    reportCard.classList.add('hidden');
    reportUnlock.classList.add('hidden');
    state.rating = null;
    state.parkingLot = [];
    state.board = { cards: [], visible: false };
    updateParkingLot();
    renderBoard();
    // Close board pane
    const layout = document.getElementById('workshopLayout');
    const boardPane = document.getElementById('boardPane');
    const boardToggleBtn = document.getElementById('boardToggle');
    if (layout) layout.classList.remove('board-active');
    if (boardPane) boardPane.classList.add('hidden');
    if (boardToggleBtn) boardToggleBtn.classList.remove('active');
    const parkingPanel = $('#parkingLotPanel');
    if (parkingPanel) parkingPanel.classList.add('hidden');
    setPickerEnabled(false);
    toolPickerMenu.classList.add('hidden');
    reportCta.classList.add('hidden');
    reportCard.classList.add('hidden');
    reportCard.classList.remove('report-preview');
    reportUnlock.classList.add('hidden');
    leadModal.classList.add('hidden');

    document.querySelectorAll('.report-actions').forEach(bar => bar.classList.add('hidden'));
    $('#reportLinkedInBtn')?.classList.add('hidden');
    routingBack.classList.add('hidden');
    state.projectContext = [];
    state.routing = false;
    state.pushHarder = false;
    $('.session-actions')?.remove();
    $('#nextExercisePanel')?.remove();
    // Hide pitch preview card
    const pitchPreview = document.getElementById('pitchPreview');
    if (pitchPreview) pitchPreview.classList.add('hidden');
    // Clean up post-session screens
    if (typeof cleanupPostSessionScreens === 'function') cleanupPostSessionScreens();
    document.querySelector('.download-progress')?.remove();
    document.getElementById('postSessionScreen')?.remove();
    // Hide input bar on welcome
    if (inputArea) inputArea.style.display = 'none';
    document.body.classList.remove('in-session', 'board-open', 'session-complete');
    clearSession();
}

sessionClose.addEventListener('click', () => {
    // Show save modal with option to save or discard
    const overlay = document.getElementById('saveModalOverlay');
    if (overlay && state.messages.length > 2) {
        // Temporarily override the modal to add a "Leave without saving" option
        const statusEl = document.getElementById('saveModalStatus');
        if (statusEl) {
            statusEl.innerHTML = '<a href="#" id="discardSessionLink" style="color: var(--text-muted); font-size: 0.75rem; text-decoration: underline;">Leave without saving</a>';
            statusEl.classList.remove('hidden');
        }
        overlay.classList.remove('hidden');
        const emailInput = document.getElementById('saveModalEmail');
        if (emailInput) emailInput.focus();
        // Wire up discard link
        const discardLink = document.getElementById('discardSessionLink');
        if (discardLink) {
            discardLink.addEventListener('click', (e) => {
                e.preventDefault();
                overlay.classList.add('hidden');
                if (statusEl) statusEl.classList.add('hidden');
                doCloseSession();
            });
        }
        return;
    }

    doCloseSession();
});

function doCloseSession() {
    state.mode = null;
    state.exercise = null;
    state.messages = [];
    state.exchangeCount = 0; state.tradeOffRound = 0;
    state.reportGenerated = false;
    state.reportText = '';
    delete document.body.dataset.mode;

    // Close and reset the board
    const boardPane = document.getElementById('boardPane');
    if (boardPane) boardPane.classList.add('hidden');
    state.board = { cards: [], visible: false };
    const workshopLayout = document.getElementById('workshopLayout');
    if (workshopLayout) workshopLayout.classList.remove('board-active', 'board-lean-canvas');
    document.body.classList.remove('board-open');

    // Hide synopsis, lead form, format choice, post-session screens
    document.getElementById('reportSynopsis')?.classList.add('hidden');
    document.getElementById('reportUnlock')?.classList.add('hidden');
    document.getElementById('reportFormatChoice')?.classList.add('hidden');
    document.getElementById('postSessionLoading')?.classList.add('hidden');
    document.getElementById('postSessionReveal')?.classList.add('hidden');
    document.getElementById('postSessionNext')?.classList.add('hidden');
    document.getElementById('postSessionScreen')?.remove();
    document.getElementById('postDownloadPanel')?.remove();
    // Restore chat pane visibility
    const chatPaneEl = document.getElementById('chatPane');
    if (chatPaneEl) chatPaneEl.style.display = '';

    // Show welcome, move input back, hide session bar
    welcome.classList.remove('hidden');
    moveInputToWelcome();
    sessionBar.classList.add('hidden');

    // Clear messages, input, report elements, and project context
    messagesEl.innerHTML = '';
    inputField.value = ''; sendBtn.disabled = true;
    inputField.placeholder = 'Type, chat, or upload your challenge...';
    modeLabel.textContent = 'The Studio · ';
    if (toolLearnLink) toolLearnLink.classList.add('hidden');
    state.rating = null;
    state.pushHarder = false;
    setPickerEnabled(false);
    toolPickerMenu.classList.add('hidden');
    reportCta.classList.add('hidden');
    reportCard.classList.add('hidden');
    reportCard.classList.remove('report-preview');
    reportUnlock.classList.add('hidden');
    leadModal.classList.add('hidden');

    document.querySelectorAll('.report-actions').forEach(bar => bar.classList.add('hidden'));
    $('#reportLinkedInBtn')?.classList.add('hidden');
    routingBack.classList.add('hidden');
    state.projectContext = [];
    state.routing = false;
    document.body.classList.remove('in-session', 'board-open', 'session-complete');
    clearSession();
}

// === SWAP TOOLS ===

function swapToTool(mode, exercise, swapEl) {
    if (requireReportBeforeSwitch(() => swapToTool(mode, exercise, swapEl))) return;
    // Preserve conversation history
    const previousMessages = [...state.messages];

    // Update state (keep projectContext and routing as-is)
    state.mode = mode;
    state.exercise = exercise;
    state.exchangeCount = 0; state.tradeOffRound = 0;
    state.reportGenerated = false;
    state.reportText = '';

    // Update session bar labels and colour
    sessionBar.dataset.mode = mode;
    sessionMode.textContent = MODE_LABELS[mode] || mode;
    sessionExercise.textContent = EXERCISE_LABELS[exercise] || exercise;
    modeLabel.innerHTML = `<a class="mode-label-link" href="toolbox.html#${exercise}" target="_blank" rel="noopener">${EXERCISE_LABELS[exercise] || exercise}</a> ·`;
    if (toolLearnLink) { toolLearnLink.href = toolDetailUrl(exercise); toolLearnLink.classList.remove('hidden'); }
    updateStageProgress(mode);

    // Reset tool picker
    setPickerEnabled(false);
    toolPickerMenu.classList.add('hidden');

    // Reset report elements
    reportCard.classList.add('hidden');
    reportCard.classList.remove('report-preview');
    reportUnlock.classList.add('hidden');

    reportCta.classList.remove('hidden');
    reportCtaBtn.disabled = true;
    reportCtaBtn.textContent = 'Workshop your thinking to build your report';

    // Remove swap suggestion card from chat
    if (swapEl) swapEl.remove();

    const exerciseName = EXERCISE_LABELS[exercise] || exercise;

    // Update the sticky exercise intro card at the top
    const exerciseDesc = EXERCISE_DESCS[exercise] || '';
    const introHTML = `<div class="msg-intro-label"><a class="intro-label-link" href="toolbox.html#${exercise}" target="_blank" rel="noopener">${exerciseName}</a></div>${exerciseDesc}`;
    const stickyIntro = messagesEl.querySelector('.msg-intro');
    if (stickyIntro) {
        stickyIntro.dataset.mode = mode;
        stickyIntro.innerHTML = introHTML;
    }

    // Insert a section break in the chat to signal the new exercise
    const breakEl = document.createElement('div');
    breakEl.className = 'msg-intro-break';
    breakEl.dataset.mode = mode;
    breakEl.innerHTML = introHTML;
    messagesEl.appendChild(breakEl);

    // Carry all prior messages across, add a bridging message with switch marker
    state.messages = [
        ...previousMessages,
        { role: 'user', content: `Let's switch to ${exerciseName}. Pick up from what we've covered and start this exercise.`, _switchPoint: true }
    ];

    // Stream WAiDE's response with the new tool's system prompt
    streamResponse();
}

// === ROUTING (no tool selected) ===

function enterStudio() {
    // Enter the studio — facilitator speaks first with welcome + icebreaker
    trackEvent('session_start');
    state.mode = 'routing';
    state.exercise = 'suggest';
    state.routing = true;
    state.messages = [];
    state.exchangeCount = 0; state.tradeOffRound = 0;
    state.reportGenerated = false;
    state.reportText = '';

    welcome.classList.add('hidden');
    // Hide Wade CTA footer during session
    if (wadeCta) wadeCta.style.display = 'none';
    document.body.classList.add('in-session');
    document.body.dataset.mode = 'routing';
    updateStageLogo('routing');
    // Hide input until Pete's first message arrives
    if (inputArea) inputArea.style.display = 'none';
    moveInputToSession();
    modeLabel.textContent = 'The Studio · ';
    if (toolLearnLink) toolLearnLink.classList.add('hidden');
    inputField.placeholder = 'Type, chat, or upload...';

    // Send a silent kickoff — never shown to user
    state.messages.push({ role: 'user', content: '[SYSTEM] User has just entered The Studio. Welcome them as Pete and run an icebreaker. Do not reference this message.' });

    inputField.value = ''; sendBtn.disabled = true;
    inputField.style.height = 'auto';

    streamResponse().then(() => {
        // Show input after Pete's first message arrives
        if (inputArea) inputArea.style.display = '';
        // Prompt pills removed — user types directly
    });
}

// Wire up Enter Studio buttons + hide input on welcome
document.addEventListener('DOMContentLoaded', () => {
    trackEvent('page_view', { page: location.pathname });
    const enterBtn = document.getElementById('enterStudioBtn');
    if (enterBtn) {
        enterBtn.addEventListener('click', enterStudio);
        // Hide the input bar on the welcome page — it appears when you enter the studio
        if (inputArea) inputArea.style.display = 'none';
        // Always hide report elements on welcome page — prevents stale state from showing
        document.getElementById('reportSynopsis')?.classList.add('hidden');
        document.getElementById('reportUnlock')?.classList.add('hidden');
        document.getElementById('reportFormatChoice')?.classList.add('hidden');
        document.getElementById('reportCard')?.classList.add('hidden');
    }
    // Bind all secondary CTA buttons (e.g. bottom CTA on landing page)
    document.querySelectorAll('.enter-studio-trigger').forEach(btn => {
        if (btn !== enterBtn) btn.addEventListener('click', enterStudio);
    });

    // Clickable category cards on homepage — start session with category context
    document.querySelectorAll('.lp-process-card[data-category]').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't intercept clicks on tool pill links
            if (e.target.closest('.lp-tool-pill')) return;
            const cat = card.dataset.category;
            if (cat && CATEGORY_PROMPTS[cat]) {
                startRouting(CATEGORY_PROMPTS[cat]);
                document.body.classList.add('in-session');
                document.body.dataset.mode = 'routing';
                updateStageLogo('routing');
            }
        });
    });
});

function startRouting(text) {
    state.mode = 'routing';
    state.exercise = 'suggest';
    state.routing = true;
    state.messages = [];
    state.exchangeCount = 0; state.tradeOffRound = 0;
    state.reportGenerated = false;
    state.reportText = '';

    // Clear any lingering report UI from previous session
    document.getElementById('reportSynopsis')?.classList.add('hidden');
    document.getElementById('reportFormatChoice')?.classList.add('hidden');
    reportCard.classList.add('hidden');
    reportUnlock.classList.add('hidden');
    messagesEl.innerHTML = '';

    welcome.classList.add('hidden');
    moveInputToSession();
    routingBack.classList.remove('hidden');
    modeLabel.textContent = 'The Studio · ';
    if (toolLearnLink) toolLearnLink.classList.add('hidden');

    state.messages.push({ role: 'user', content: text });
    appendMessage('user', text);

    inputField.value = ''; sendBtn.disabled = true;
    inputField.style.height = 'auto';

    streamResponse();
}

routingBackBtn.addEventListener('click', () => {
    state.mode = null;
    state.exercise = null;
    state.messages = [];
    state.exchangeCount = 0; state.tradeOffRound = 0;
    state.reportGenerated = false;
    state.reportText = '';
    state.routing = false;

    welcome.classList.remove('hidden');
    moveInputToWelcome();
    messagesEl.innerHTML = '';
    inputField.value = ''; sendBtn.disabled = true;
    inputField.placeholder = 'Type, chat, or upload your challenge...';
    modeLabel.textContent = 'The Studio · ';
    if (toolLearnLink) toolLearnLink.classList.add('hidden');
    routingBack.classList.add('hidden');
    chatArea.scrollTop = 0;
});

// === FILE UPLOAD ===

let pendingUploads = []; // { filename, type, content, data, media_type }

if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
        const files = Array.from(fileInput.files);
        if (!files.length) return;

        uploadBtn.classList.add('has-file');

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!res.ok) { console.error('Upload failed:', res.status); continue; }
                const result = await res.json();
                if (result.error) { console.error('Upload error:', result.error); continue; }
                pendingUploads.push(result);
            } catch (err) {
                console.error('Upload error:', err);
            }
        }

        // Show preview strip
        updateFilePreview();
        fileInput.value = ''; // Reset so same file can be re-selected
        sendBtn.disabled = false; // Enable send even with no text
    });
}

function updateFilePreview() {
    let strip = document.querySelector('.file-preview-strip');
    if (!strip) {
        strip = document.createElement('div');
        strip.className = 'file-preview-strip';
        inputForm.insertBefore(strip, inputForm.firstChild);
    }
    strip.innerHTML = '';

    if (pendingUploads.length === 0) {
        strip.remove();
        if (uploadBtn) uploadBtn.classList.remove('has-file');
        return;
    }

    for (let i = 0; i < pendingUploads.length; i++) {
        const u = pendingUploads[i];
        const chip = document.createElement('div');
        chip.className = 'file-preview-chip';

        if (u.type === 'image') {
            chip.innerHTML = `<img src="data:${u.media_type};base64,${u.data.slice(0, 100)}..." alt="">`;
            // Use a tiny thumbnail
            const img = document.createElement('img');
            img.src = `data:${u.media_type};base64,${u.data}`;
            chip.innerHTML = '';
            chip.appendChild(img);
        }

        const name = document.createElement('span');
        name.className = 'file-preview-name';
        name.textContent = u.filename;
        chip.appendChild(name);

        const remove = document.createElement('button');
        remove.className = 'file-preview-remove';
        remove.textContent = '✕';
        remove.dataset.idx = i;
        remove.addEventListener('click', (e) => {
            pendingUploads.splice(parseInt(e.target.dataset.idx), 1);
            updateFilePreview();
        });
        chip.appendChild(remove);

        strip.appendChild(chip);
    }
}

// === SEND MESSAGE ===

inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputField.value.trim();
    if ((!text && !pendingUploads.length) || state.streaming) return;
    if (!state.exercise) {
        if (state.routing) {
            sendMessage(text);
        } else {
            startRouting(text);
        }
    } else {
        sendMessage(text);
    }
});

// Auto-resize textarea
inputField.addEventListener('input', () => {
    inputField.style.height = 'auto';
    inputField.style.height = Math.min(inputField.scrollHeight, 200) + 'px';
    sendBtn.disabled = !inputField.value.trim() && !pendingUploads.length;
});

// Initial state — button disabled until user types or uploads
sendBtn.disabled = true;

// Enter to send, Shift+Enter for newline
inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        inputForm.dispatchEvent(new Event('submit'));
    }
});

async function sendMessage(text) {
    // Handle file uploads — build message content
    const uploads = [...pendingUploads];
    pendingUploads = [];
    updateFilePreview();

    // Build display text for user message
    let displayText = text || '';
    const fileNames = uploads.map(u => u.filename);
    if (fileNames.length) {
        const fileLabel = fileNames.map(f => `📎 ${f}`).join('\n');
        displayText = displayText ? `${fileLabel}\n\n${displayText}` : fileLabel;
    }

    // Build API message content — Claude API supports multi-part content
    let messageContent;
    if (uploads.length > 0) {
        const contentParts = [];

        // Add images as vision blocks, text files as text blocks
        for (const u of uploads) {
            if (u.type === 'image') {
                contentParts.push({
                    type: 'image',
                    source: {
                        type: 'base64',
                        media_type: u.media_type,
                        data: u.data
                    }
                });
            } else if (u.type === 'text') {
                contentParts.push({
                    type: 'text',
                    text: `[Uploaded file: ${u.filename}]\n\n${u.content}`
                });
            }
        }

        // Add user's text message
        if (text) {
            contentParts.push({ type: 'text', text: text });
        } else if (contentParts.every(p => p.type === 'image')) {
            // Images need at least one text block
            contentParts.push({ type: 'text', text: 'Here\'s what I uploaded — what do you see?' });
        }

        messageContent = contentParts;
    } else {
        messageContent = text;
    }

    // Add to conversation state
    state.messages.push({ role: 'user', content: messageContent });
    appendMessage('user', displayText);

    inputField.value = ''; sendBtn.disabled = true;
    inputField.style.height = 'auto';

    // Stream response
    await streamResponse();
}

function appendMessage(role, content) {
    const div = document.createElement('div');
    div.className = `msg msg-${role}`;
    if (role === 'agent') {
        div.innerHTML = renderMarkdown(content);
    } else {
        div.textContent = content;
    }
    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
}

function scrollToBottom() {
    // Use rAF to ensure DOM has rendered before scrolling
    requestAnimationFrame(() => {
        const chatPane = document.getElementById('chatPane');
        // Always scroll chatPane — it's the scrollable container for messages
        if (chatPane) chatPane.scrollTop = chatPane.scrollHeight;
        // Also scroll chatArea as fallback
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    });
}

// === SHOW REPORT CTA ===

function maybeShowReportCta() {
    if (state.exchangeCount >= 3 && !state.reportGenerated) {
        reportCtaBtn.disabled = false;
        reportCtaBtn.textContent = 'Access your Studio Session report →';
        // Enable within-stage tool picker after first real exchange
        setPickerEnabled(true);
    }
    // Refresh stage bar so tool label reflects current exercise
    updateStageProgress(state.mode);
}

// === SESSION PERSISTENCE ===

function saveSession() {
    if (!state.mode || state.mode === 'routing') return;
    localStorage.setItem('studio_session', JSON.stringify({
        mode: state.mode,
        exercise: state.exercise,
        messages: state.messages,
        exchangeCount: state.exchangeCount,
        reportGenerated: state.reportGenerated,
        reportText: state.reportText,
        projectContext: state.projectContext,
        parkingLot: state.parkingLot,
        board: state.board,
        savedAt: Date.now()
    }));
}

function clearSession() {
    localStorage.removeItem('studio_session');
}

function restoreSession(session) {
    Object.assign(state, {
        mode: session.mode,
        exercise: session.exercise,
        messages: session.messages,
        exchangeCount: session.exchangeCount,
        reportGenerated: session.reportGenerated,
        reportText: session.reportText,
        projectContext: session.projectContext || [],
        parkingLot: session.parkingLot || [],
        board: session.board || { cards: [], visible: false },
        routing: false,
        rating: null,
        resumed: true,
        resumedExchangeCount: session.exchangeCount || 0
    });
    // Migrate old parking lot items to board if board has no parking cards
    if (state.parkingLot.length > 0 && !state.board.cards.some(c => c.zone === 'parking')) {
        state.parkingLot.forEach(item => {
            state.board.cards.push({
                id: 'c_' + item.timestamp + '_' + Math.random().toString(36).slice(2, 6),
                text: item.text,
                zone: 'parking',
                stage: state.mode || 'untangle',
                source: item.fromExercise || 'session',
                timestamp: item.timestamp
            });
        });
    }
    updateParkingLot();
    renderBoard();

    welcome.classList.add('hidden');
    moveInputToSession();
    sessionBar.classList.remove('hidden');
    sessionBar.dataset.mode = state.mode;
    sessionMode.textContent = MODE_LABELS[state.mode] || state.mode;
    sessionExercise.textContent = EXERCISE_LABELS[state.exercise] || state.exercise;
    modeLabel.innerHTML = `<a class="mode-label-link" href="toolbox.html#${state.exercise}" target="_blank" rel="noopener">${EXERCISE_LABELS[state.exercise] || state.exercise}</a> ·`;
    if (toolLearnLink) { toolLearnLink.href = toolDetailUrl(state.exercise); toolLearnLink.classList.remove('hidden'); }
    reportCta.classList.remove('hidden');
    updateStageProgress(state.mode);
    // Restore tool picker state
    setPickerEnabled(state.exchangeCount >= 1);

    // Re-render messages — synthetic swap messages become section breaks, not bubbles
    messagesEl.innerHTML = '';
    // Add sticky intro for the current exercise at the top
    const restoreDesc = EXERCISE_DESCS[state.exercise] || '';
    const restoreIntro = document.createElement('div');
    restoreIntro.className = 'msg-intro';
    restoreIntro.dataset.mode = state.mode;
    restoreIntro.innerHTML = `<div class="msg-intro-label"><a class="intro-label-link" href="toolbox.html#${state.exercise}" target="_blank" rel="noopener">${EXERCISE_LABELS[state.exercise] || state.exercise}</a></div>${restoreDesc}`;
    messagesEl.appendChild(restoreIntro);

    const SWAP_PREFIX = "Let's switch to ";
    state.messages.forEach(m => {
        if (m.role === 'user' && m.content.startsWith(SWAP_PREFIX)) {
            // Synthetic swap message — render as inline section break
            const swappedName = m.content.slice(SWAP_PREFIX.length).split('.')[0];
            const exerciseKey = Object.entries(EXERCISE_LABELS).find(([, v]) => v === swappedName)?.[0];
            const swapMode = exerciseKey?.split(':')?.[0];
            const desc = exerciseKey ? (EXERCISE_DESCS[exerciseKey] || '') : '';
            const breakEl = document.createElement('div');
            breakEl.className = 'msg-intro-break';
            if (swapMode) breakEl.dataset.mode = swapMode;
            breakEl.innerHTML = `<div class="msg-intro-label"><a class="intro-label-link" href="toolbox.html#${exerciseKey}" target="_blank" rel="noopener">${swappedName}</a></div>${desc}`;
            messagesEl.appendChild(breakEl);
        } else if (m.role === 'user' && (m.content === 'Please start the session.' || m.content.startsWith('[SYSTEM]'))) {
            // Skip synthetic kickoff — facilitator's opening response is enough
        } else {
            appendMessage(m.role === 'user' ? 'user' : 'agent', m.content);
        }
    });

    if (state.reportGenerated && state.reportText) {
        // Report was already generated and delivered (download + email)
        // Don't re-show synopsis or format choice on session restore
        // User can start a new session instead
    } else {
        maybeShowReportCta();
    }
    scrollToBottom();
}

// === WRAP UP PROMPT ===

function renderWrapPrompt() {
    const wrapDiv = document.createElement('div');
    wrapDiv.className = 'wrap-prompt';

    const next = NEXT_STAGE[state.mode];

    let actionsHtml = '';
    if (next) {
        const nextModeName = MODE_LABELS[next.mode] || next.mode;
        const nextExName = EXERCISE_LABELS[next.exercise] || next.exercise;
        actionsHtml += `<button class="wrap-btn wrap-btn-continue">Continue to ${nextModeName} — ${nextExName} →</button>`;
    }
    actionsHtml += '<button class="wrap-btn wrap-btn-report">Access your Studio Session report →</button>';

    wrapDiv.innerHTML = `
        <p class="wrap-prompt-text">Nice work. Your report is being generated now.</p>
        <div class="wrap-rating">
            <span class="wrap-rating-label">How did the session go?</span>
            <button class="wrap-rate-btn" data-rating="up" title="Helpful">👍</button>
            <button class="wrap-rate-btn" data-rating="down" title="Not helpful">👎</button>
        </div>
        <div class="wrap-prompt-actions">${actionsHtml}</div>
    `;

    // Wire up rating buttons
    wrapDiv.querySelectorAll('.wrap-rate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.rating = btn.dataset.rating;
            wrapDiv.querySelectorAll('.wrap-rate-btn').forEach(b =>
                b.classList.toggle('selected', b === btn));
        });
    });

    const continueWrapBtn = wrapDiv.querySelector('.wrap-btn-continue');
    const reportWrapBtn = wrapDiv.querySelector('.wrap-btn-report');

    if (continueWrapBtn) {
        continueWrapBtn.addEventListener('click', () => {
            const n = NEXT_STAGE[state.mode];
            if (!n) return;
            wrapDiv.remove();
            navigateToStage(n.mode);
        });
    }

    if (reportWrapBtn) {
        reportWrapBtn.addEventListener('click', () => {
            wrapDiv.remove();
            reportCtaBtn.click();
        });
    }

    messagesEl.appendChild(wrapDiv);
    scrollToBottom();
}

// === STREAMING ===

async function streamResponse() {
    state.streaming = true;
    sendBtn.disabled = true;

    // Remove session-actions while a response is being generated
    $('.session-actions')?.remove();

    // Add typing indicator
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    scrollToBottom();

    let fullText = '';
    let agentDiv = null;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: state.mode,
                exercise: state.exercise,
                messages: state.messages,
                project_context: state.projectContext,
                push_harder: state.pushHarder,
                user_email: state.userEmail,
                device_id: state.deviceId,
                resumed: state.resumed || false,
                resumed_exchange_count: state.resumedExchangeCount || 0
            })
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // keep incomplete line

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const data = line.slice(6);

                if (data === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(data);

                    if (parsed.error) {
                        typing.remove();
                        appendMessage('agent', 'Something went wrong: ' + parsed.error);
                        state.streaming = false;
                        sendBtn.disabled = false;
                        return;
                    }

                    if (parsed.text) {
                        // Remove typing on first text
                        if (!agentDiv) {
                            typing.remove();
                            agentDiv = document.createElement('div');
                            agentDiv.className = 'msg msg-agent';
                            messagesEl.appendChild(agentDiv);
                        }
                        fullText += parsed.text;
                        agentDiv.innerHTML = renderMarkdown(fullText);
                        scrollToBottom();
                    }
                } catch (e) {
                    // Skip malformed JSON
                }
            }
        }
    } catch (err) {
        typing.remove();
        appendMessage('agent', 'Connection error. Make sure the server is running.');
    }

    // Parse and render [OPTIONS: A | B] chips
    if (fullText && agentDiv) {
        let optMatch = fullText.match(/\[OPTIONS:\s*([^\]]+)\]/);

        // Conversation-first: no forced quickfire buttons.
        // Pete uses [OPTIONS] tags inline only when he wants to offer specific choices.

        if (optMatch) {
            fullText = fullText.replace(/\n?\[OPTIONS:\s*[^\]]+\]/, '').trim();
            agentDiv.innerHTML = renderMarkdown(fullText);
            const opts = optMatch[1].split('|').map(s => s.trim()).filter(Boolean);
            const chipRow = document.createElement('div');
            chipRow.className = 'option-chips';
            opts.forEach(label => {
                const btn = document.createElement('button');
                btn.className = 'option-chip';
                btn.textContent = label;
                btn.addEventListener('click', () => {
                    chipRow.remove();
                    sendMessage(label);
                });
                chipRow.appendChild(btn);
            });
            agentDiv.after(chipRow);
            scrollToBottom();
        }
    }

    // Clear resumed flag after first response so subsequent messages are normal
    if (state.resumed) {
        state.resumed = false;
        state.resumedExchangeCount = 0;
    }

    // Save assistant response
    if (fullText) {
        // In routing mode: parse and strip [SUGGEST: key1, key2] tag
        let suggestedKeys = [];
        let wrapSignaled = false;

        if (state.routing) {
            const suggestMatch = fullText.match(/\[SUGGEST:\s*([^\]]+)\]/);
            if (suggestMatch) {
                suggestedKeys = suggestMatch[1].split(',').map(s => s.trim()).filter(k => EXERCISE_MODE[k]);
                fullText = fullText.replace(/\n?\[SUGGEST:\s*[^\]]+\]/, '').trim();
                if (agentDiv) agentDiv.innerHTML = renderMarkdown(fullText);
                // Auto-start the first suggested tool if Pete is already facilitating
                // (user accepted via conversation, not via pill click)
                if (suggestedKeys.length > 0 && state.exchangeCount >= 2) {
                    const autoKey = suggestedKeys[0];
                    const autoMode = EXERCISE_MODE[autoKey];
                    if (autoMode && autoKey) {
                        // Transition to exercise mode without resetting conversation
                        state.mode = autoMode;
                        state.exercise = autoKey;
                        state.routing = false;
                        document.body.dataset.mode = autoMode;
                        document.body.classList.add('in-session');
                        updateStageLogo(autoMode);
                        // Show session bar
                        const sessionBar = document.getElementById('sessionBar');
                        if (sessionBar) sessionBar.classList.remove('hidden');
                        const breadcrumbStage = document.getElementById('breadcrumbStage');
                        const breadcrumbTool = document.getElementById('breadcrumbTool');
                        if (breadcrumbStage) breadcrumbStage.textContent = (MODE_LABELS[autoMode] || autoMode).toUpperCase();
                        if (breadcrumbTool) breadcrumbTool.innerHTML = (EXERCISE_LABELS[autoKey] || autoKey) + ' <svg class="breadcrumb-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>';
                        // Switch board layout
                        const customLayouts = ['lean-canvas', 'elevator-pitch', 'pre-mortem', 'effectuation', 'flywheel', 'customer-discovery', 'iceberg', 'constraint-flip', 'socratic', 'reality-check', 'theory-of-change', 'trade-off', 'five-whys', 'empathy-map', 'jtbd', 'crazy-8s', 'hmw', 'scamper', 'devils-advocate', 'rapid-experiment', 'mash-up', 'analogical'];
                        if (customLayouts.includes(autoKey)) {
                            switchBoardLayout(autoKey);
                        } else {
                            switchBoardLayout('default');
                        }
                        // Update input placeholder
                        if (EXERCISE_HINTS[autoKey]) {
                            inputField.placeholder = EXERCISE_HINTS[autoKey];
                        }
                        // Update progress
                        state.exchangeCount = 1;
                        updateProgressIndicator();
                        updateStageProgress(autoMode);
                        updateBreadcrumbDropdown();
                        // Hide report CTA during exercise
                        reportCta.classList.add('hidden');
                        document.getElementById('starterPrompts')?.remove();
                        saveSession();
                        suggestedKeys = []; // Don't render buttons — already started
                    }
                }
            }
        } else {
            // Check for [WRAP] signal — natural end of exercise
            if (fullText.includes('[WRAP]')) {
                wrapSignaled = true;
                fullText = fullText.replace(/\n?\[WRAP\]/, '').trim();
                if (agentDiv) agentDiv.innerHTML = renderMarkdown(fullText);
            }
            // Check for [END_SESSION] signal — community values crossed twice
            if (fullText.includes('[END_SESSION]')) {
                fullText = fullText.replace(/\n?\[END_SESSION\]/, '').trim();
                if (agentDiv) agentDiv.innerHTML = renderMarkdown(fullText);
                state.messages.push({ role: 'assistant', content: fullText });
                state.streaming = false;
                sendBtn.disabled = true;
                inputField.disabled = true;
                inputField.placeholder = 'This session has ended.';
                saveSession();
                setTimeout(() => forceCloseSession(), 4000);
                return;
            }
        }

        // Parse [PARK: description] tags — parking lot items + board cards
        const parkMatches = fullText.match(/\[PARK:\s*([^\]]+)\]/g);
        if (parkMatches) {
            parkMatches.forEach(tag => {
                const desc = tag.match(/\[PARK:\s*([^\]]+)\]/)[1].trim();
                state.parkingLot.push({
                    text: desc,
                    fromExercise: EXERCISE_LABELS[state.exercise] || state.exercise || 'session',
                    timestamp: Date.now()
                });
                // Also add to board parking zone
                addBoardCard(desc, 'parking', state.mode, EXERCISE_LABELS[state.exercise] || state.exercise || 'session');
            });
            fullText = fullText.replace(/\n?\[PARK:\s*[^\]]+\]/g, '').trim();
            if (agentDiv) agentDiv.innerHTML = renderMarkdown(fullText);
            updateParkingLot();
        }

        // Parse [INSIGHT:], [IDEA:], [ACTION:] tags — workshop board cards
        const boardTagMap = { INSIGHT: 'insights', IDEA: 'ideas', ACTION: 'actions' };
        Object.entries(boardTagMap).forEach(([tag, defaultZone]) => {
            const regex = new RegExp(`\\[${tag}:\\s*([^\\]]+)\\]`, 'g');
            const matches = fullText.match(regex);
            if (matches) {
                matches.forEach(m => {
                    const desc = m.match(new RegExp(`\\[${tag}:\\s*([^\\]]+)\\]`))[1].trim();
                    // Check if the default zone exists on the current board; if not, use first available zone
                    let zone = defaultZone;
                    const layout = BOARD_LAYOUTS[state.boardMode || state.exercise];
                    if (layout && layout.zones) {
                        const zoneExists = layout.zones.some(z => z.id === defaultZone);
                        if (!zoneExists) {
                            // Route to first zone of matching type
                            if (tag === 'ACTION') {
                                zone = layout.zones.find(z => z.id === 'actions' || z.id.includes('action'))?.id || layout.zones[layout.zones.length - 1].id;
                            } else {
                                zone = layout.zones[0].id; // First zone as fallback for insights/ideas
                            }
                        }
                    }
                    addBoardCard(desc, zone, state.mode, EXERCISE_LABELS[state.exercise] || state.exercise || 'session');
                });
                fullText = fullText.replace(new RegExp(`\\n?\\[${tag}:\\s*[^\\]]+\\]`, 'g'), '').trim();
                if (agentDiv) agentDiv.innerHTML = renderMarkdown(fullText);
            }
        });

        // Parse [CANVAS:block: text] tags — Lean Canvas board cards
        const canvasRegex = /\[CANVAS:([a-z_-]+):\s*([^\]]+)\]/g;
        const canvasMatches = fullText.matchAll(canvasRegex);
        for (const cm of canvasMatches) {
            const blockKey = cm[1].trim().toLowerCase();
            const blockText = cm[2].trim();
            const zone = CANVAS_TAG_MAP[blockKey];
            if (zone) {
                addBoardCard(blockText, zone, state.mode, EXERCISE_LABELS[state.exercise] || 'Lean Canvas');
                // Peek: briefly show the board when first card is added, then auto-close
                if (!state.board.visible && !state.board.peeked) {
                    state.board.peeked = true;
                    toggleBoard();
                    setTimeout(() => { if (state.board.visible) toggleBoard(); }, 3000);
                }
            }
        }
        fullText = fullText.replace(/\n?\[CANVAS:[a-z_-]+:\s*[^\]]+\]/g, '').trim();

        // Parse [FLYWHEEL:component-N: text] and [FLYWHEEL:bottleneck: text] tags
        const fwRegex = /\[FLYWHEEL:([a-z0-9_-]+):\s*([^\]]+)\]/g;
        const fwMatches = fullText.matchAll(fwRegex);
        for (const fm of fwMatches) {
            const fwKey = fm[1].trim().toLowerCase();
            const fwText = fm[2].trim();
            // Connection tags (A -> B | strength | mechanism) go to insights
            if (fwKey === 'connection') {
                addBoardCard(fwText, 'insights', state.mode, 'Flywheel');
            } else {
                const zone = FLYWHEEL_TAG_MAP[fwKey];
                if (zone) {
                    // Replace existing card in this zone (flywheel components update, not stack)
                    const existing = state.board.cards.find(c => c.zone === zone);
                    if (existing) removeBoardCard(existing.id);
                    addBoardCard(fwText, zone, state.mode, 'Flywheel');
                }
            }
        }
        fullText = fullText.replace(/\n?\[FLYWHEEL:[a-z0-9_-]+:\s*[^\]]+\]/g, '').trim();

        // Parse [PITCH:component: text] tags — Elevator Pitch components
        const pitchRegex = /\[PITCH:([a-z_-]+):\s*([^\]]+)\]/g;
        const pitchMatches = fullText.matchAll(pitchRegex);
        for (const pm of pitchMatches) {
            const component = pm[1].trim().toLowerCase();
            const text = pm[2].trim();
            if (['customer', 'problem', 'solution', 'benefit', 'differentiator'].includes(component)) {
                state.pitch[component] = text;
                updatePitchPreview();
                // Add/update card on the pitch board
                const zone = 'pitch-' + component;
                // Remove existing card for this zone (replace, don't stack)
                const existing = state.board.cards.find(c => c.zone === zone);
                if (existing) removeBoardCard(existing.id);
                addBoardCard(text, zone, state.mode, 'Elevator Pitch');
            }
        }
        fullText = fullText.replace(/\n?\[PITCH:[a-z_-]+:\s*[^\]]+\]/g, '').trim();

        // Parse [RISK:category: text] tags — Pre-Mortem board
        const riskRegex = /\[RISK:([a-z_-]+):\s*([^\]]+)\]/g;
        for (const rm of fullText.matchAll(riskRegex)) {
            const zone = RISK_TAG_MAP[rm[1].trim().toLowerCase()];
            if (zone) addBoardCard(rm[2].trim(), zone, state.mode, 'Pre-Mortem');
        }
        fullText = fullText.replace(/\n?\[RISK:[a-z_-]+:\s*[^\]]+\]/g, '').trim();

        // Parse [EFF:principle: text] tags — Effectuation board
        const effRegex = /\[EFF:([a-z_-]+):\s*([^\]]+)\]/g;
        for (const em of fullText.matchAll(effRegex)) {
            const zone = EFF_TAG_MAP[em[1].trim().toLowerCase()];
            if (zone) addBoardCard(em[2].trim(), zone, state.mode, 'Effectuation');
        }
        fullText = fullText.replace(/\n?\[EFF:[a-z_-]+:\s*[^\]]+\]/g, '').trim();

        // Parse [BOARD:open] and [BOARD:close] signals
        if (fullText.includes('[BOARD:open]')) {
            if (!state.board.visible) toggleBoard();
            fullText = fullText.replace(/\n?\[BOARD:open\]/g, '').trim();
        }
        if (fullText.includes('[BOARD:close]')) {
            if (state.board.visible) toggleBoard();
            fullText = fullText.replace(/\n?\[BOARD:close\]/g, '').trim();
        }


        // Universal tool-specific tag parser: [BOARD:zone-key: text]
        // Uses TOOL_TAG_MAPS to route to the correct custom board zone
        if (state.exercise && TOOL_TAG_MAPS[state.exercise]) {
            const toolMap = TOOL_TAG_MAPS[state.exercise];
            const toolTagRegex = /\[BOARD:([a-z0-9_-]+):\s*([^\]]+)\]/g;
            for (const tm of fullText.matchAll(toolTagRegex)) {
                const tagKey = tm[1].trim().toLowerCase();
                const tagText = tm[2].trim();
                const zone = toolMap[tagKey] || tagKey;
                // Tally zone: replace content instead of accumulating
                if (zone === 'to-tally') {
                    state.board.cards = state.board.cards.filter(c => c.zone !== 'to-tally');
                    const zoneEl = document.querySelector(`.zone-cards[data-zone="to-tally"]`);
                    if (zoneEl) zoneEl.innerHTML = '';
                }
                addBoardCard(tagText, zone, state.mode, EXERCISE_LABELS[state.exercise] || state.exercise);
            }
            fullText = fullText.replace(/\n?\[BOARD:[a-z0-9_-]+:\s*[^\]]+\]/g, '').trim();
            if (agentDiv) agentDiv.innerHTML = renderMarkdown(fullText);
        }

        // Parse [BUNDLE:...] tags for Trade-Off visual comparison cards
        const bundleRegex = /\[BUNDLE:([^\]]+)\]/g;
        for (const bm of fullText.matchAll(bundleRegex)) {
            renderBundleCards(bm[1].trim(), messagesEl);
            state.tradeOffRound++;
            updateProgressIndicator();
        }
        fullText = fullText.replace(/\n?\[BUNDLE:[^\]]+\]/g, '').trim();

        if (agentDiv) agentDiv.innerHTML = renderMarkdown(fullText);

        // Parse [PHASE: diverge|converge] tags — workshop phase indicator
        const phaseMatch = fullText.match(/\[PHASE:\s*(diverge|converge)\]/);
        if (phaseMatch) {
            state.currentPhase = phaseMatch[1];
            fullText = fullText.replace(/\n?\[PHASE:\s*(?:diverge|converge)\]/g, '').trim();
            if (agentDiv) agentDiv.innerHTML = renderMarkdown(fullText);
            updatePhaseIndicator(state.currentPhase);
            // Insert board nudge on diverge, narrowing divider on converge
            if (state.currentPhase === 'diverge' && !boardNudgeShown) {
                showBoardNudge();
            } else if (state.currentPhase === 'converge') {
                const transDiv = document.createElement('div');
                transDiv.className = 'phase-transition phase-converge';
                transDiv.innerHTML = '<span class="phase-transition-text">— Time to narrow down —</span>';
                messagesEl.appendChild(transDiv);
            }
        }

        // Parse [CELEBRATE] tag — breakthrough moment effect
        const celebrateMatch = fullText.match(/\[CELEBRATE\]/);
        if (celebrateMatch) {
            fullText = fullText.replace(/\n?\[CELEBRATE\]/g, '').trim();
            if (agentDiv) {
                agentDiv.innerHTML = renderMarkdown(fullText);
                agentDiv.classList.add('celebrate');
            }
        }

        // Store full text (with GAP tags intact for report generation)
        const messageText = fullText;
        // Strip [GAP_*] tags from visible display only
        fullText = fullText.replace(/\n?\[GAP_(?:ESPOUSED|ACTUAL|CONSEQUENCE):\s*[^\]]+\]/g, '').trim();
        fullText = fullText.replace(/\n?\[GAP_NONE\]/g, '').trim();
        if (agentDiv && messageText !== fullText) agentDiv.innerHTML = renderMarkdown(fullText);

        state.messages.push({ role: 'assistant', content: messageText });

        if (state.routing) {
            state.exchangeCount++;
            // Render inline tool suggestion buttons if WAiDE recommended any
            if (suggestedKeys.length > 0) {
                const suggestDiv = document.createElement('div');
                suggestDiv.className = 'routing-suggestions';
                suggestedKeys.forEach(key => {
                    const mode = EXERCISE_MODE[key];
                    const btn = document.createElement('button');
                    btn.className = `routing-suggest-btn mode-${mode}`;
                    btn.textContent = EXERCISE_LABELS[key] || key;
                    btn.addEventListener('click', () => startExercise(mode, key));
                    suggestDiv.appendChild(btn);
                });
                messagesEl.appendChild(suggestDiv);
            }
            // Show report CTA even during conversation (no tool needed)
            if (state.exchangeCount >= 4 && !state.reportGenerated) {
                reportCta.classList.remove('hidden');
                reportCtaBtn.disabled = false;
                reportCtaBtn.textContent = 'Get your session summary →';
            }
            scrollToBottom();
        } else {
            state.exchangeCount++;
            updateProgressIndicator();
            maybeShowReportCta();
            // Show wrap-up card if facilitator signalled the exercise is complete
            if (wrapSignaled && !state.reportGenerated) {
                state.wrapped = true;
                updateProgressIndicator();
                // Step 2: Auto-open board for review
                if (!state.board.visible && state.board.cards.length > 0) {
                    toggleBoard();
                }
                // Auto-consolidate if 5+ cards (1s delay for board to render)
                if (state.board.cards.length >= 5) {
                    setTimeout(() => {
                        const consolidateBtn = document.getElementById('boardConsolidate');
                        if (consolidateBtn && !consolidateBtn.disabled) consolidateBtn.click();
                    }, 1000);
                }
                // Step 3: Show "happy with board" chip + report button
                const boardChip = document.createElement('div');
                boardChip.className = 'option-chips wrap-board-chips';
                boardChip.innerHTML = `
                    <button class="option-chip wrap-chip-report">I'm happy with the board — generate my report</button>
                `;
                messagesEl.appendChild(boardChip);
                boardChip.querySelector('.wrap-chip-report').addEventListener('click', () => {
                    boardChip.remove();
                    startPostSessionFlow();
                });
                scrollToBottom();
                // Also show report CTA in footer
                reportCta.classList.remove('hidden');
                reportCtaBtn.disabled = false;
                reportCtaBtn.textContent = 'Generate my report →';
                // Auto-save session summary
                autoSaveSessionSummary();
            }
        }
    }

    state.streaming = false;
    sendBtn.disabled = false;
    inputField.focus();
    renderSessionActions();
    saveSession();

    // Mid-session auto-save to PostgreSQL every 4 exchanges (so Pete remembers if user leaves)
    if (state.deviceId && state.exchangeCount > 0 && state.exchangeCount % 4 === 0 && !state.wrapped) {
        autoSaveSessionSummary();
    }
}

// === REPORT GENERATION + LEAD CAPTURE ===

function showReportProgress() {
    // Find or create progress bar in the wrap prompt area
    const wrapPrompt = document.querySelector('.wrap-prompt');
    let progressContainer = document.getElementById('reportProgress');

    if (!progressContainer) {
        progressContainer = document.createElement('div');
        progressContainer.id = 'reportProgress';
        progressContainer.className = 'report-progress';
        progressContainer.innerHTML = `
            <div class="report-progress-bar-track">
                <div class="report-progress-bar-fill" id="reportProgressFill"></div>
            </div>
            <div class="report-progress-status" id="reportProgressStatus">Analysing your session...</div>
            <div class="report-progress-time">This usually takes about 2 minutes</div>
            <div class="report-wait-cta">
                <p class="report-wait-heading">While your report is being prepared</p>
                <p class="report-wait-desc">Based on your session, you might find these useful.</p>
                <a class="report-wait-btn" href="https://wadeinstitute.org.au/programs/" target="_blank" rel="noopener">Explore Wade programs →</a>
                <a class="report-wait-link" href="https://wadeinstitute.org.au/entrepreneurship-starts-with-a-problem-you-really-want-to-solve/" target="_blank" rel="noopener">Read: Start with a problem you really want to solve →</a>
                <a class="report-wait-link" href="mailto:enquiries@wadeinstitute.org.au">Talk to the Wade team →</a>
            </div>
        `;
        if (wrapPrompt) {
            // Insert after the wrap-prompt-text
            const wrapText = wrapPrompt.querySelector('.wrap-prompt-text');
            if (wrapText) {
                wrapText.after(progressContainer);
            } else {
                wrapPrompt.prepend(progressContainer);
            }
        } else {
            // Fallback: insert before the report CTA
            const cta = document.getElementById('reportCta');
            if (cta && cta.parentNode) {
                cta.parentNode.insertBefore(progressContainer, cta);
            }
        }
    }

    progressContainer.classList.remove('hidden');
    const fill = document.getElementById('reportProgressFill');
    const status = document.getElementById('reportProgressStatus');

    const stages = [
        { pct: 12, text: 'Analysing your session...' },
        { pct: 25, text: 'Identifying ah ha moments...' },
        { pct: 40, text: 'Building your reframe...' },
        { pct: 55, text: 'Adding insights from the Wade community...' },
        { pct: 68, text: 'Writing your action plan...' },
        { pct: 80, text: 'Assembling your report...' },
        { pct: 90, text: 'Almost there...' },
    ];

    let stageIdx = 0;
    fill.style.width = '5%';
    status.textContent = stages[0].text;

    const interval = setInterval(() => {
        if (stageIdx < stages.length) {
            fill.style.width = stages[stageIdx].pct + '%';
            status.textContent = stages[stageIdx].text;
            stageIdx++;
        }
    }, 3500); // ~3.5s per stage, total ~24s to reach 90%

    return {
        complete() {
            clearInterval(interval);
            fill.style.width = '100%';
            status.textContent = 'Report ready';
            setTimeout(() => {
                progressContainer.classList.add('hidden');
            }, 600);
        },
        error() {
            clearInterval(interval);
            fill.style.width = '0%';
            status.textContent = '';
            progressContainer.classList.add('hidden');
        }
    };
}

// Auto-save session summary to PostgreSQL (called mid-session + on wrap)
let _currentSessionDbId = null;  // tracks the DB row to update (not create duplicates)
function autoSaveSessionSummary() {
    if (!state.deviceId || state.messages.length < 4) return;
    fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            device_id: state.deviceId,
            email: state.userEmail || null,
            mode: state.mode,
            exercise: state.exercise,
            messages: state.messages,
            board_cards: state.board.cards,  // save workshop board to memory
            session_db_id: _currentSessionDbId,  // null = create new, id = update existing
            is_final: state.wrapped,  // true = session complete, update profile patterns
            session_data: {
                messages: state.messages,
                exchangeCount: state.exchangeCount,
                projectContext: state.projectContext,
                parkingLot: state.parkingLot,
                board: state.board,
                boardMode: state.boardMode,
                reportGenerated: state.reportGenerated,
                reportText: state.reportText
            }
        })
    }).then(res => res.json())
      .then(data => {
          if (data.session_id) _currentSessionDbId = data.session_id;
          if (data.summary) console.log('[Memory] Session saved:', data.summary.topic);
      })
      .catch(err => console.warn('[Memory] Auto-save failed:', err));
}

let reportGenerating = false;
async function generateReport() {
    if (reportGenerating || state.reportGenerated) return; // prevent double-generation
    trackEvent('report_generate', { exchanges: state.exchangeCount });
    reportGenerating = true;
    reportCtaBtn.disabled = true;
    reportCtaBtn.textContent = 'Generating report...';

    const progress = showReportProgress();

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 90000); // 90s timeout
        // If user switched tools mid-session, send only current-tool messages + context summary
        let reportMessages = [...state.messages];
        const switchIdx = reportMessages.findLastIndex(m => m._switchPoint);
        if (switchIdx > 0) {
            const preSummary = reportMessages.slice(0, switchIdx)
                .filter(m => m.role === 'user' && !m.content.startsWith('[SYSTEM]'))
                .map(m => m.content).join(' | ');
            reportMessages = [
                { role: 'user', content: `[Context from previous exercise]: ${preSummary}` },
                { role: 'assistant', content: 'Understood — I have the context from your previous exercise. Let me focus on this one.' },
                ...reportMessages.slice(switchIdx).map(m => ({ role: m.role, content: m.content }))
            ];
        }

        const res = await fetch('/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                mode: state.mode,
                exercise: state.exercise,
                messages: reportMessages,
                parking_lot: state.parkingLot,
                board_cards: state.board.cards
            })
        });
        clearTimeout(timeout);

        if (!res.ok) {
            const errText = await res.text().catch(() => 'Unknown error');
            console.error('[Report] Server error:', res.status, errText.slice(0, 200));
            progress.error();
            reportGenerating = false;
            reportCtaBtn.textContent = 'Something went wrong — try again';
            reportCtaBtn.disabled = false;
            return;
        }

        const data = await res.json();

        if (data.error || (!data.report && !data.report_html)) {
            console.error('[Report] Error or empty:', data.error || 'empty report');
            progress.error();
            reportGenerating = false;
            reportCtaBtn.textContent = 'Something went wrong — try again';
            reportCtaBtn.disabled = false;
            return;
        }

        progress.complete();
        state.reportText = data.report || '';
        state.reportHtml = data.report_html || '';
        state.reportJson = data.report_json || null;
        state.reportSynopsis = data.synopsis || {};
        state.reportGenerated = true;
        console.log('[Report] Got report', state.reportHtml ? `HTML: ${state.reportHtml.length} chars` : `text: ${state.reportText.length} chars`);

        // Close board so report has full width
        if (state.board.visible) {
            toggleBoard();
        }

        // Clean up end-of-session clutter
        document.querySelector('.chat-action-btns')?.remove();
        document.querySelector('.option-chips')?.remove();
        document.querySelector('.wrap-btn-report')?.remove();

        // Populate synopsis card
        const synopsisCard = document.getElementById('reportSynopsis');
        const synopsisTitle = document.getElementById('synopsisTitle');
        const synopsisHook = document.getElementById('synopsisHook');
        const synopsisBullets = document.getElementById('synopsisBullets');
        const synopsisMeta = document.getElementById('synopsisMeta');

        const mName = MODE_LABELS[state.mode] || state.mode;
        const exName = EXERCISE_LABELS[state.exercise] || state.exercise;
        const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
        if (synopsisMeta) synopsisMeta.textContent = `${mName} · ${exName} · ${date}`;

        if (state.reportSynopsis.title) synopsisTitle.textContent = state.reportSynopsis.title;
        if (state.reportSynopsis.hook) synopsisHook.textContent = state.reportSynopsis.hook;
        if (state.reportSynopsis.bullets && synopsisBullets) {
            synopsisBullets.innerHTML = state.reportSynopsis.bullets
                .map(b => `<li>${b}</li>`).join('');
        }

        // Show synopsis card (not the full report)
        synopsisCard.classList.remove('hidden');
        reportCta.classList.add('hidden');

        // Prepare full report in background (hidden)
        if (state.reportHtml) {
            // Render branded HTML report in an iframe for style isolation
            reportContent.innerHTML = '';
            const iframe = document.createElement('iframe');
            iframe.className = 'report-iframe';
            iframe.style.cssText = 'width:100%;border:none;background:white;border-radius:8px;';
            reportContent.appendChild(iframe);
            iframe.srcdoc = state.reportHtml;
            // Auto-resize iframe to content height
            iframe.onload = () => {
                try {
                    const h = iframe.contentDocument.documentElement.scrollHeight;
                    iframe.style.height = h + 'px';
                } catch(e) { iframe.style.height = '2000px'; }
            };
        } else {
            reportContent.innerHTML = renderMarkdown(state.reportText);
        }
        populateReportMeta();

        // Scroll synopsis into view
        setTimeout(() => {
            synopsisCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);

        // Post-report save prompt — offer to email session link if no email on file
        if (!state.userEmail) {
            setTimeout(() => {
                const saveOverlay = document.getElementById('saveModalOverlay');
                const saveEmail = document.getElementById('saveModalEmail');
                if (saveOverlay) { saveOverlay.classList.remove('hidden'); saveOverlay.setAttribute('aria-hidden', 'false'); }
                if (saveEmail) saveEmail.focus();
            }, 2500);
        }

        // Final auto-save with report status
        autoSaveSessionSummary();

    } catch (err) {
        progress.error();
        reportGenerating = false;
        reportCtaBtn.textContent = 'Connection error — try again';
        reportCtaBtn.disabled = false;
    }
}

reportCtaBtn.addEventListener('click', async () => {
    // Skip pre-report handoff — go straight to report generation
    // Course recommendation is already in the report itself
    if (false && !state.preReportAsked && state.exchangeCount >= 3) {
        state.preReportAsked = true;
        reportCtaBtn.disabled = true;
        reportCtaBtn.textContent = 'One moment...';

        let fullText = '';
        let agentDiv = null;

        // Show typing indicator
        const typing = document.createElement('div');
        typing.className = 'typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messagesEl.appendChild(typing);
        scrollToBottom();

        try {
            const res = await fetch('/api/pre-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: state.mode,
                    exercise: state.exercise,
                    messages: state.messages
                })
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const raw = line.slice(6);
                    if (raw === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(raw);
                        if (parsed.text) {
                            if (!agentDiv) {
                                typing.remove();
                                agentDiv = document.createElement('div');
                                agentDiv.className = 'msg msg-agent';
                                messagesEl.appendChild(agentDiv);
                            }
                            fullText += parsed.text;
                            agentDiv.innerHTML = renderMarkdown(fullText);
                            scrollToBottom();
                        }
                    } catch (e) { /* skip malformed */ }
                }
            }
        } catch (err) {
            typing.remove();
        }

        // Add to conversation so it's included in the report context
        if (fullText) {
            state.messages.push({ role: 'assistant', content: fullText });
        }

        // Re-enable button — next click generates the report
        reportCtaBtn.disabled = false;
        reportCtaBtn.textContent = 'Generate my report →';
        scrollToBottom();
        return;
    }

    startPostSessionFlow();
});

// === SHARED LEAD CAPTURE LOGIC ===

function revealFullReport() {
    // In the new flow, never show the in-page report — it's download/email only
    // Just clean up UI state
    reportUnlock.classList.add('hidden');
    reportCta.classList.add('hidden');
    document.getElementById('reportSynopsis')?.classList.add('hidden');
    saveSession();
}

function handleLeadSubmit(nameEl, emailEl, companyEl, roleEl, submitEl) {
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    if (!name || !email) return false;

    submitEl.disabled = true;

    fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            email,
            company: companyEl.value.trim(),
            role: roleEl.value.trim(),
            mode: state.mode,
            exercise: state.exercise,
            report: state.reportText,
            rating: state.rating,
            messages: state.messages
        })
    }).catch(() => {}).finally(() => {
        revealFullReport();
    });

    return true;
}

// NOTE: unlockForm submit is handled in the synopsis gating section above

// Legacy modal form (kept for fallback; no longer primary flow)
leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = handleLeadSubmit($('#leadName'), $('#leadEmail'), $('#leadCompany'), $('#leadRole'), leadSubmit);
    if (ok) leadModal.classList.add('hidden');
});

// === REPORT PDF DOWNLOAD ===

async function downloadReport() {
    const exName = EXERCISE_LABELS[state.exercise] || state.exercise;
    const mName = MODE_LABELS[state.mode] || state.mode;
    const stageColor = { untangle: '#27BDBE', spark: '#F15A22', test: '#ED3694', build: '#E4E517' }[state.mode] || '#F15A22';
    const stageTextColor = state.mode === 'build' ? '#1a1a2e' : '#fff';
    const date = new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });

    // Embed logo as base64 so it shows in the printed PDF
    let logoSrc = '';
    try {
        const res = await fetch('/logo.png');
        const blob = await res.blob();
        logoSrc = await new Promise(r => { const fr = new FileReader(); fr.onload = e => r(e.target.result); fr.readAsDataURL(blob); });
    } catch(e) {}

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Studio Workshop Summary — ${exName} · Wade Institute</title>
<style>
@page { margin: 22mm 20mm 20mm; }
*, *::before, *::after { box-sizing: border-box; }
body { font-family: Georgia, 'Times New Roman', serif; max-width: 680px; margin: 0 auto; color: #1e1b4b; line-height: 1.7; font-size: 13.5px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
a { color: ${stageColor}; text-decoration: none; }
/* Header */
.rpt-header { display: flex; align-items: center; gap: 14px; padding-bottom: 14px; border-bottom: 3px solid ${stageColor}; margin-bottom: 28px; }
.rpt-header img { height: 44px; width: auto; flex-shrink: 0; }
.rpt-header-text { flex: 1; }
.rpt-header-title { font-family: Arial, sans-serif; font-size: 19px; font-weight: 700; color: #12103a; line-height: 1.2; margin-bottom: 5px; }
.rpt-header-meta { font-family: Arial, sans-serif; font-size: 10.5px; color: #888; letter-spacing: 0.07em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
.stage-pill { display: inline-block; background: ${stageColor}; color: ${stageTextColor}; font-size: 8.5px; font-family: Arial, sans-serif; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 2px 8px; border-radius: 3px; }
/* Content typography */
h1 { display: none; }
h2 { font-family: Arial, sans-serif; font-size: 13.5px; font-weight: 700; color: #12103a; border-left: 3px solid ${stageColor}; padding: 2px 0 2px 10px; margin: 24px 0 8px; page-break-after: avoid; }
h3 { font-family: Arial, sans-serif; font-size: 12.5px; font-weight: 700; color: #333; margin: 14px 0 5px; page-break-after: avoid; }
p { margin: 0 0 10px; }
ul, ol { padding-left: 20px; margin: 0 0 10px; }
li { margin-bottom: 5px; }
strong { font-weight: 700; color: #12103a; }
em { font-style: normal; }
hr { border: none; border-top: 1px solid #eee; margin: 14px 0; }
/* Links show URL hint */
a::after { content: " ↗"; font-size: 9px; opacity: 0.6; }
/* Wade CTA block */
.wade-cta-block { margin-top: 36px; padding: 18px 20px 16px; border: 1.5px solid ${stageColor}; border-radius: 5px; background: #fdf9f7; page-break-inside: avoid; }
.wade-cta-label { font-family: Arial, sans-serif; font-size: 8.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${stageColor}; margin-bottom: 7px; }
.wade-cta-block h3 { font-family: Arial, sans-serif; font-size: 14px; font-weight: 700; color: #12103a; margin: 0 0 7px; padding: 0; border: none; }
.wade-cta-block p { font-size: 12px; color: #444; margin-bottom: 10px; }
.wade-cta-contact { font-family: Arial, sans-serif; font-size: 11px; color: #666; margin-bottom: 10px; }
.wade-cta-link { display: inline-block; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; color: ${stageColor}; }
.wade-cta-link::after { content: " →"; }
/* Footer */
.rpt-footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #e0e0e0; font-family: Arial, sans-serif; font-size: 10px; color: #aaa; display: flex; justify-content: space-between; gap: 12px; }
</style>
</head><body>
<div class="rpt-header">
  ${logoSrc ? `<img src="${logoSrc}" alt="Wade Institute of Entrepreneurship">` : ''}
  <div class="rpt-header-text">
    <div class="rpt-header-title">Studio Workshop Summary</div>
    <div class="rpt-header-meta"><span class="stage-pill">${mName}</span>${exName} &nbsp;·&nbsp; ${date}</div>
  </div>
</div>
${state.reportSynopsis?.title ? `<h2 style="font-family:Arial,sans-serif;font-size:18px;font-weight:700;color:#12103a;border-left:none;padding:0;margin:0 0 8px;text-align:center;">${state.reportSynopsis.title}</h2>` : ''}
${state.reportSynopsis?.hook ? `<p style="color:#666;text-align:center;margin:0 0 24px;font-size:13px;">${state.reportSynopsis.hook}</p>` : ''}
${reportContent.innerHTML}
<div class="wade-cta-block">
  <div class="wade-cta-label">Ready to go deeper?</div>
  <h3>Talk to the Wade Team</h3>
  <p>Interested in working with Wade Institute to build your innovation capability — or take this challenge further with a structured programme, expert facilitation, or a custom engagement?</p>
  <div class="wade-cta-contact">enquiries@wadeinstitute.org.au &nbsp;·&nbsp; +61 3 9344 1100</div>
  <a class="wade-cta-link" href="https://wadeinstitute.org.au/programs/">Explore Wade Programs</a>
</div>
<div class="rpt-footer">
  <span>Wade Institute of Entrepreneurship &nbsp;·&nbsp; wadeinstitute.org.au</span>
  <span>Generated by Wade Studio &nbsp;·&nbsp; For educational purposes only &nbsp;·&nbsp; Decisions remain yours.</span>
</div>
</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const win = window.open(url, '_blank');
    if (win) win.addEventListener('load', () => { setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 500); });
}

// === REPORT ACTION BUTTONS (unified for top + bottom bars) ===

// === SYNOPSIS DOWNLOAD GATING ===

let pendingDownloadFormat = null; // 'word' or 'pdf'

// Synopsis "Download my report" button → show lead form
document.getElementById('synopsisDownloadBtn')?.addEventListener('click', () => {
    reportUnlock.classList.remove('hidden');
    reportUnlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Synopsis close button
document.getElementById('synopsisCloseBtn')?.addEventListener('click', () => {
    document.getElementById('reportSynopsis')?.classList.add('hidden');
});

// Lead capture form submit → email report, then show format choice
document.getElementById('unlockForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    trackEvent('lead_capture');
    const submitBtn = document.getElementById('unlockSubmit');
    const email = document.getElementById('unlockEmail')?.value?.trim();
    const name = document.getElementById('unlockName')?.value?.trim();
    const company = document.getElementById('unlockCompany')?.value?.trim();
    const role = document.getElementById('unlockRole')?.value?.trim();

    if (!email) return;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending your report...';

    // Store email for memory system
    state.userEmail = email;
    localStorage.setItem('wade_user_email', email);

    // Generate and store session summary (async, non-blocking)
    fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            device_id: state.deviceId,
            mode: state.mode,
            exercise: state.exercise,
            messages: state.messages
        })
    }).catch(err => console.warn('[Summary] Failed:', err));

    // Send lead + email the report
    try {
        await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email, name, company, role,
                mode: state.mode,
                exercise: state.exercise,
                report: state.reportText,
                rating: state.rating,
                messages: state.messages
            })
        });
    } catch (err) {
        console.error('[Lead] Failed to send:', err);
    }

    // Hide form, keep synopsis visible, show progress bar
    reportUnlock.classList.add('hidden');
    reportCta.classList.add('hidden');

    // Show staged progress bar (Steps 7-8 from wrap sequence)
    const downloadProgress = document.createElement('div');
    downloadProgress.className = 'download-progress';
    downloadProgress.innerHTML = `
        <div class="download-progress-stages">
            <div class="download-stage active" id="dlStage1">
                <span class="download-stage-check">⟳</span>
                <span>Analysing your session...</span>
            </div>
            <div class="download-stage" id="dlStage2">
                <span class="download-stage-check"></span>
                <span>Building your report...</span>
            </div>
            <div class="download-stage" id="dlStage3">
                <span class="download-stage-check"></span>
                <span>Formatting for download...</span>
            </div>
        </div>
        <div class="download-recommendations hidden" id="dlRecommendations">
            <p class="download-reco-label">Based on your session...</p>
            <div id="dlRecoContent"></div>
        </div>
        <div class="download-ready hidden" id="dlReady">
            <p class="download-ready-text">Your report is ready</p>
            <button class="download-ready-btn" id="dlDownloadBtn">Download Report (.pdf)</button>
            <p class="download-ready-note">It was good thinking with you today.</p>
        </div>
    `;
    const synopsisCard = document.getElementById('reportSynopsis');
    if (synopsisCard) synopsisCard.after(downloadProgress);
    downloadProgress.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Animate stages sequentially
    setTimeout(() => {
        document.getElementById('dlStage1').querySelector('.download-stage-check').textContent = '✓';
        document.getElementById('dlStage1').classList.add('done');
        document.getElementById('dlStage2').classList.add('active');
        document.getElementById('dlRecommendations').classList.remove('hidden');
        // Populate contextual Go Deeper card from tool-to-program mapping
        const toolMap = TOOL_PROGRAM_MAP[state.exercise] || TOOL_PROGRAM_FALLBACK;
        const recoEl = document.getElementById('dlRecoContent');
        if (recoEl && toolMap) {
            const isCorporate = toolMap.segment === 'corporate';
            const heading = isCorporate ? 'Bring This to Your Team' : 'Go Deeper with Wade';
            const toolName = EXERCISE_LABELS[state.exercise] || state.exercise || 'this tool';
            recoEl.innerHTML = `
                <div class="go-deeper-card">
                    <p class="go-deeper-heading">${heading}</p>
                    <p class="go-deeper-bridge">${toolMap.bridge}</p>
                    <a class="go-deeper-program" href="${toolMap.programUrl}" target="_blank" rel="noopener">
                        <strong>${toolMap.program}</strong>
                        <span>Learn more \u2192</span>
                    </a>
                </div>
            `;
        }
    }, 2000);

    setTimeout(() => {
        document.getElementById('dlStage2').querySelector('.download-stage-check').textContent = '✓';
        document.getElementById('dlStage2').classList.add('done');
        document.getElementById('dlStage3').classList.add('active');
    }, 4000);

    setTimeout(() => {
        document.getElementById('dlStage3').querySelector('.download-stage-check').textContent = '✓';
        document.getElementById('dlStage3').classList.add('done');
        document.getElementById('dlReady').classList.remove('hidden');
        document.getElementById('dlReady').scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Wire download button
        document.getElementById('dlDownloadBtn')?.addEventListener('click', () => {
            downloadReportPdf();
            renderNextExercisePanel();
        });
    }, 6000);

    saveSession();

    submitBtn.disabled = false;
    submitBtn.textContent = 'Get My Report';
});

// Format choice buttons → trigger download, then show next exercise
document.getElementById('formatWordBtn')?.addEventListener('click', () => {
    downloadReportPdf();
    document.getElementById('reportFormatChoice')?.classList.add('hidden');
    renderNextExercisePanel();
});

// Auto-trigger PDF download when format choice is shown
const _formatObserver = new MutationObserver(() => {
    const formatChoice = document.getElementById('reportFormatChoice');
    if (formatChoice && !formatChoice.classList.contains('hidden')) {
        setTimeout(() => {
            downloadReportPdf();
            formatChoice.classList.add('hidden');
            renderNextExercisePanel();
        }, 1500); // Brief delay so user sees "Your report is on its way"
        _formatObserver.disconnect();
    }
});
_formatObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });

function handleReportAction(btn, action) {
    switch (action) {
        case 'download-toggle':
            const dropdown = btn.closest('.report-action-dropdown');
            const menu = dropdown?.querySelector('.report-dropdown-menu');
            if (menu) {
                document.querySelectorAll('.report-dropdown-menu').forEach(m => {
                    if (m !== menu) m.classList.add('hidden');
                });
                menu.classList.toggle('hidden');
            }
            break;

        case 'download-pdf':
            downloadReport();
            closeAllDropdowns();
            break;

        case 'download-word':
            downloadReportWord();
            closeAllDropdowns();
            break;

        case 'email':
            emailReportCopy();
            closeAllDropdowns();
            break;
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.report-dropdown-menu').forEach(m => m.classList.add('hidden'));
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.report-action-dropdown') && !e.target.closest('#synopsisDownloadBtn')) closeAllDropdowns();
});

document.querySelectorAll('.report-actions').forEach(bar => {
    bar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) handleReportAction(btn, btn.dataset.action);
    });
});

// === DOWNLOAD AS PDF (primary) ===

async function downloadReportPdf() {
    // If we have branded HTML, use the new .doc export
    if (state.reportHtml) {
        return downloadReportDoc();
    }

    // Legacy fallback: use old PDF endpoint
    if (!state.reportText) return;
    const synopsis = state.reportSynopsis || {};

    try {
        const resp = await fetch('/api/report/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                report: state.reportText,
                synopsis: synopsis,
                exercise: state.exercise || '',
                mode: state.mode || '',
                board_cards: state.board?.cards || []
            })
        });

        if (!resp.ok) throw new Error('PDF generation failed');
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const title = synopsis.title || 'Studio Report';
        const safeName = title.replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 60);
        a.href = url;
        a.download = safeName + ' - The Studio.pdf';
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('[Report] PDF download failed, using fallback:', err);
        downloadReportWordFallback();
    }
}

async function downloadReportDoc() {
    if (!state.reportHtml) return downloadReportWordFallback();
    const headline = state.reportJson?.headline || state.reportSynopsis?.title || 'Session Report';

    try {
        const resp = await fetch('/api/report/doc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                report_html: state.reportHtml,
                headline: headline
            })
        });

        if (!resp.ok) throw new Error('Doc generation failed');
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeName = headline.replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 60) || 'Session Report';
        a.href = url;
        a.download = safeName + ' - The Studio.doc';
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('[Report] Doc download failed, using fallback:', err);
        downloadReportWordFallback();
    }
}

// === DOWNLOAD AS WORD (.doc) — legacy fallback ===

async function downloadReportWord() {
    // Redirect to PDF
    return downloadReportPdf();
}

function downloadReportWordFallback() {
    const content = $('#reportContent');
    if (!content) return;
    const mName = MODE_LABELS[state.mode] || state.mode;
    const exName = EXERCISE_LABELS[state.exercise] || state.exercise;
    const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${mName} \u00B7 ${exName} \u00B7 ${date}</title>
<style>body{font-family:Arial,sans-serif;font-size:11pt;color:#333;line-height:1.5;max-width:700px;margin:0 auto;padding:2rem}h1{font-size:18pt;color:#1E194F}h2{font-size:14pt;color:#1E194F}h3{font-size:12pt;color:#1E194F}blockquote{border-left:3px solid #ED3694;padding-left:1em;color:#555}</style></head><body>
<h1>Studio Workshop Summary</h1>
<p style="color:#888;font-size:9pt">${mName} \u00B7 ${exName} \u00B7 ${date}</p>
${content.innerHTML}
<p style="margin-top:2em;padding-top:1em;border-top:1px solid #ddd;font-size:9pt;color:#888">Wade Institute of Entrepreneurship \u00B7 wadeinstitute.org.au</p>
</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Wade-Studio-${exName.replace(/\s+/g, '-')}-${date.replace(/\s+/g, '-')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function downloadReportPptx() {
    if (!state.reportText) return;

    try {
        const resp = await fetch('/api/report/pptx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                report: state.reportText,
                synopsis: state.reportSynopsis || {},
                exercise: state.exercise || '',
                mode: state.mode || '',
                board_cards: state.board?.cards || [],
                headline: state._revealData?.headline || ''
            })
        });

        if (!resp.ok) throw new Error('PPTX generation failed');
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const exName = EXERCISE_LABELS[state.exercise] || state.exercise;
        a.href = url;
        a.download = `${exName} - The Studio.pptx`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('[Report] PPTX download failed:', err);
    }
}

// downloadSessionExport (SVG/PNG) removed — HTML boards only

// === EMAIL REPORT COPY ===

async function emailReportCopy() {
    const overlay = document.getElementById('saveModalOverlay');
    const emailInput = document.getElementById('saveModalEmail');
    const submitBtn = document.getElementById('saveModalSubmit');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    if (emailInput) emailInput.focus();

    const originalHandler = submitBtn.onclick;
    submitBtn.onclick = async () => {
        const email = emailInput?.value?.trim();
        if (!email) return;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        try {
            await fetch('/api/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name: '',
                    company: '',
                    role: '',
                    mode: state.mode,
                    exercise: state.exercise,
                    report: state.reportText,
                    rating: state.rating,
                    messages: state.messages
                })
            });
            const statusEl = document.getElementById('saveModalStatus');
            if (statusEl) {
                statusEl.textContent = 'Report sent! Check your inbox.';
                statusEl.classList.remove('hidden');
            }
            setTimeout(() => { overlay.classList.add('hidden'); }, 2000);
        } catch(e) {
            const statusEl = document.getElementById('saveModalStatus');
            if (statusEl) {
                statusEl.textContent = 'Failed to send. Try again.';
                statusEl.classList.remove('hidden');
            }
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send link';
        submitBtn.onclick = originalHandler;
    };
}

// === REPORT META + NEW SESSION ===

function populateReportMeta() {
    const reportMetaEl = $('#reportMeta');
    if (!reportMetaEl) return;
    const exName = EXERCISE_LABELS[state.exercise] || state.exercise;
    const mName = MODE_LABELS[state.mode] || state.mode;
    const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
    reportMetaEl.textContent = `${mName} · ${exName} · ${date}`;
}

$('#reportNewSessionBtn')?.addEventListener('click', () => {
    forceCloseSession();
});

// === NEXT EXERCISE PANEL (shown after full report revealed) ===

function renderPostSessionScreen() {
    if (document.getElementById('postSessionScreen')) return;
    const toolMap = TOOL_PROGRAM_MAP[state.exercise] || TOOL_PROGRAM_FALLBACK;
    const toolName = EXERCISE_LABELS[state.exercise] || state.exercise || 'this tool';
    const isCorporate = toolMap.segment === 'corporate';

    const screen = document.createElement('div');
    screen.id = 'postSessionScreen';
    screen.className = 'post-session-screen';

    const heading = isCorporate ? 'Bring This to Your Team' : 'Go Deeper with Wade';
    const corpNote = isCorporate
        ? '<p class="post-session-corp">Wade Executive Education — Structured innovation programs for corporate teams.</p>'
        : '';

    screen.innerHTML = `
        <div class="post-session-complete">You just completed ${toolName}</div>
        <div class="post-session-deeper">
            <h3 class="post-session-heading">${heading}</h3>
            <p class="post-session-bridge">${toolMap.bridge}</p>
            ${corpNote}
            <a class="post-session-program-btn" href="${toolMap.programUrl}" target="_blank" rel="noopener">${toolMap.program} — Learn more \u2192</a>
        </div>
        <div class="post-session-alt">
            <span>Or:</span>
            <a class="post-session-alt-link" href="toolbox.html">Explore another tool in The Studio \u2192</a>
        </div>
    `;

    // Insert after the download progress or synopsis
    const anchor = document.querySelector('.download-progress') || document.getElementById('reportSynopsis');
    if (anchor) anchor.after(screen);
    screen.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderNextExercisePanel() {
    // Post-session screen replaces the old next-exercise panel
    renderPostSessionScreen();
    return;

    const next = NEXT_STAGE[state.mode];
    if (!next) return; // Develop is the last stage
    if ($('#nextExercisePanel')) return; // already shown

    const panel = document.createElement('div');
    panel.id = 'nextExercisePanel';
    panel.className = 'next-exercise-panel';
    const nextModeName = MODE_LABELS[next.mode] || next.mode;
    const nextExName = EXERCISE_LABELS[next.exercise] || next.exercise;
    const modeColor = next.mode; // untangle/spark/test/build

    panel.innerHTML = `
        <div class="next-exercise-label">Ready to keep going?</div>
        <div class="next-exercise-stage mode-${modeColor}">${nextModeName}</div>
        <div class="next-exercise-name">${nextExName}</div>
        <p class="next-exercise-desc">${EXERCISE_DESCS[next.exercise] || ''}</p>
        <button class="next-exercise-btn next-exercise-btn-${modeColor}" id="nextExerciseBtn">Start ${nextExName} →</button>
    `;

    reportCard.insertAdjacentElement('afterend', panel);

    panel.querySelector('#nextExerciseBtn').addEventListener('click', () => {
        panel.remove();
        navigateToStage(next.mode, next.exercise);
    });
}

// === POST-SESSION FLOW (3-screen experience) ===

// Category display labels for post-download cards
const CATEGORY_LABELS = { untangle: 'UNTANGLE', spark: 'SPARK', test: 'TEST', build: 'BUILD' };
const CATEGORY_ICONS = { untangle: '◆', spark: '△', test: '◉', build: '⚙' };

async function startPostSessionFlow() {
    if (reportGenerating || state.reportGenerated) return;
    trackEvent('post_session_start', { exchanges: state.exchangeCount });
    reportGenerating = true;

    const exName = EXERCISE_LABELS[state.exercise] || state.exercise;
    const modeName = MODE_LABELS[state.mode] || state.mode;
    const toolMap = TOOL_PROGRAM_MAP[state.exercise] || TOOL_PROGRAM_FALLBACK;

    // Calculate session duration
    const sessionDuration = state.sessionStartTime
        ? Math.round((Date.now() - state.sessionStartTime) / 60000)
        : Math.round(state.exchangeCount * 2);

    // Hide chat pane elements, board, report CTA
    const chatPane = document.getElementById('chatPane');
    const boardPane = document.getElementById('boardPane');
    const workshopLayout = document.getElementById('workshopLayout');
    if (chatPane) chatPane.style.display = 'none';
    if (boardPane) boardPane.classList.add('hidden');
    if (workshopLayout) workshopLayout.classList.remove('board-active');
    reportCta.classList.add('hidden');
    if (inputArea) inputArea.style.display = 'none';
    sessionBar.classList.add('hidden');

    // ---- Screen 1: Loading ----
    const loadingScreen = document.getElementById('postSessionLoading');
    loadingScreen.classList.remove('hidden');
    loadingScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Populate subtitle
    const subtitle = document.getElementById('psLoadingSubtitle');
    if (subtitle) subtitle.textContent = `Pete is assembling your ${exName} report and visual`;

    // Populate program recommendation card
    const programName = document.getElementById('psProgramName');
    const programBridge = document.getElementById('psProgramBridge');
    const programLink = document.getElementById('psProgramLink');
    const programDesc = document.getElementById('psProgramDesc');
    if (programName) programName.textContent = toolMap.program;
    if (programBridge) programBridge.textContent = toolMap.bridge;
    if (programLink) programLink.href = toolMap.programUrl;
    if (programDesc) programDesc.textContent = toolMap.programUrl ? '' : '';

    // Dismiss link
    document.getElementById('psDismissProgram')?.addEventListener('click', () => {
        document.getElementById('psProgramCard')?.classList.add('hidden');
        document.getElementById('psDismissProgram')?.classList.add('hidden');
    });

    // Animate progress bar and steps
    const progressFill = document.getElementById('psProgressFill');
    const steps = [
        { el: document.getElementById('psStep1'), pct: 20 },
        { el: document.getElementById('psStep2'), pct: 45 },
        { el: document.getElementById('psStep3'), pct: 70 },
        { el: document.getElementById('psStep4'), pct: 90 }
    ];

    let stepIdx = 0;
    const stepInterval = setInterval(() => {
        if (stepIdx > 0 && steps[stepIdx - 1].el) {
            steps[stepIdx - 1].el.classList.remove('active');
            steps[stepIdx - 1].el.classList.add('done');
            const icon = steps[stepIdx - 1].el.querySelector('.ps-step-icon');
            if (icon) icon.textContent = '\u2713';
        }
        if (stepIdx < steps.length) {
            steps[stepIdx].el.classList.add('active');
            const icon = steps[stepIdx].el.querySelector('.ps-step-icon');
            if (icon) icon.textContent = '\u25CF';
            if (progressFill) progressFill.style.width = steps[stepIdx].pct + '%';
            stepIdx++;
        }
    }, 4000);

    // Prepare messages for both calls
    let reportMessages = [...state.messages];
    const switchIdx = reportMessages.findLastIndex(m => m._switchPoint);
    if (switchIdx > 0) {
        const preSummary = reportMessages.slice(0, switchIdx)
            .filter(m => m.role === 'user' && !m.content.startsWith('[SYSTEM]'))
            .map(m => m.content).join(' | ');
        reportMessages = [
            { role: 'user', content: `[Context from previous exercise]: ${preSummary}` },
            { role: 'assistant', content: 'Understood \u2014 I have the context from your previous exercise.' },
            ...reportMessages.slice(switchIdx).map(m => ({ role: m.role, content: m.content }))
        ];
    }

    // Fire both API calls in parallel
    const reportPromise = fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: state.mode,
            exercise: state.exercise,
            messages: reportMessages,
            parking_lot: state.parkingLot,
            board_cards: state.board.cards
        })
    }).then(r => r.ok ? r.json() : Promise.reject('Report failed'));

    const revealFallback = {
        headline: `Your ${exName} session uncovered something worth exploring.`,
        synopsis: 'Your session produced actionable insights. Review the full report for the complete breakdown.',
        recommendations: [
            { exercise: 'pre-mortem', reason: 'Stress-test what you built before committing.' },
            { exercise: 'lean-canvas', reason: 'Map the business model behind your idea.' },
            { exercise: 'five-whys', reason: 'Dig deeper into any assumptions that surfaced.' }
        ]
    };

    const revealPromise = fetch('/api/session/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: state.mode,
            exercise: state.exercise,
            messages: reportMessages,
            board_cards: state.board.cards
        })
    }).then(r => r.ok ? r.json() : revealFallback).catch(() => revealFallback);

    // HTML board snapshot (replaces SVG generation)
    const boardHtml = buildPostSessionBoard(state.exercise, state.board.cards);

    try {
        console.log('[PostSession] Waiting for report + reveal...');
        const [reportData, revealData] = await Promise.all([reportPromise, revealPromise]);
        console.log('[PostSession] Report received:', !!(reportData?.report_html || reportData?.report));
        console.log('[PostSession] Reveal received:', !!revealData?.headline);
        clearInterval(stepInterval);

        // Mark all steps done
        steps.forEach(s => {
            if (s.el) {
                s.el.classList.remove('active');
                s.el.classList.add('done');
                const icon = s.el.querySelector('.ps-step-icon');
                if (icon) icon.textContent = '\u2713';
            }
        });
        if (progressFill) progressFill.style.width = '100%';

        // Store report data
        state.reportText = reportData.report || '';
        state.reportHtml = reportData.report_html || '';
        state.reportJson = reportData.report_json || null;
        state.reportSynopsis = reportData.synopsis || {};
        state.reportGenerated = true;
        state._revealData = revealData;
        state._sessionDuration = sessionDuration;

        // Prepare full report in background (hidden card)
        if (reportContent && state.reportHtml) {
            reportContent.innerHTML = '';
            const iframe = document.createElement('iframe');
            iframe.className = 'report-iframe';
            iframe.style.cssText = 'width:100%;border:none;background:white;border-radius:8px;';
            reportContent.appendChild(iframe);
            iframe.srcdoc = state.reportHtml;
            iframe.onload = () => {
                try {
                    const h = iframe.contentDocument.documentElement.scrollHeight;
                    iframe.style.height = h + 'px';
                } catch(e) { iframe.style.height = '2000px'; }
            };
        } else if (reportContent) {
            reportContent.innerHTML = renderMarkdown(state.reportText);
        }
        populateReportMeta();

        // Brief pause then transition to Screen 2
        await new Promise(resolve => setTimeout(resolve, 800));
        loadingScreen.classList.add('hidden');

        // ---- Screen 2: Reveal ----
        document.body.classList.add('session-complete');
        const revealScreen = document.getElementById('postSessionReveal');
        revealScreen.classList.remove('hidden');
        revealScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Inject HTML board visual (replaces SVG canvas)
        const svgPlaceholder = document.getElementById('psSvgPlaceholder');
        const canvasExpand = document.getElementById('psCanvasExpand');
        const canvasWrapper = document.getElementById('psCanvasWrapper');
        if (boardHtml && svgPlaceholder) {
            svgPlaceholder.innerHTML = boardHtml;
            if (canvasExpand) canvasExpand.style.display = 'inline-block';
        } else if (state.board.cards.length === 0) {
            if (canvasWrapper) canvasWrapper.style.display = 'none';
        }
        // Canvas expand/collapse
        if (canvasExpand) {
            canvasExpand.addEventListener('click', () => {
                const isExpanded = canvasWrapper.classList.toggle('ps-canvas-expanded');
                canvasExpand.textContent = isExpanded ? 'Collapse board' : 'See your full board';
            });
        }

        // Populate headline with yellow emphasis
        const headline = document.getElementById('psHeadline');
        if (headline) {
            const headlineText = revealData.headline || '';
            // Find a key phrase to highlight — put last clause in <em>
            const dashIdx = headlineText.lastIndexOf('\u2014');
            const commaIdx = headlineText.lastIndexOf(',');
            const splitIdx = dashIdx > 0 ? dashIdx : (commaIdx > headlineText.length / 2 ? commaIdx : -1);
            if (splitIdx > 0) {
                headline.innerHTML = headlineText.slice(0, splitIdx + 1) + ' <em>' + headlineText.slice(splitIdx + 1).trim() + '</em>';
            } else {
                // Highlight last ~4 words
                const words = headlineText.split(' ');
                if (words.length > 4) {
                    const splitAt = Math.max(1, words.length - 4);
                    headline.innerHTML = words.slice(0, splitAt).join(' ') + ' <em>' + words.slice(splitAt).join(' ') + '</em>';
                } else {
                    headline.textContent = headlineText;
                }
            }
        }

        // Context line: tool name only (no "Pete's take", no session duration)
        const contextLine = document.getElementById('psContextLine');
        if (contextLine) contextLine.textContent = exName;

        // Synopsis text
        const synopsisText = document.getElementById('psSynopsisText');
        if (synopsisText) synopsisText.innerHTML = (revealData.synopsis || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Store recommendations for Screen 3 (not shown on wrap screen)
        state._revealRecommendations = revealData.recommendations || [];

        // Wire email form
        const emailForm = document.getElementById('psEmailForm');
        const emailCapture = document.getElementById('psEmailCapture');
        const formatButtons = document.getElementById('psFormatButtons');

        emailForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('psDownloadBtn');
            const name = document.getElementById('psNameInput')?.value?.trim();
            const email = document.getElementById('psEmailInput')?.value?.trim();
            if (!email || !name) return;

            btn.disabled = true;
            btn.textContent = 'Sending...';

            state.userEmail = email;
            state.userName = name;
            localStorage.setItem('wade_user_email', email);
            localStorage.setItem('wade_user_name', name);

            // Send lead
            try {
                await fetch('/api/lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email, name, company: '', role: '',
                        mode: state.mode,
                        exercise: state.exercise,
                        report: state.reportText,
                        rating: state.rating,
                        messages: state.messages
                    })
                });
            } catch (err) {
                console.error('[PostSession] Lead capture failed:', err);
            }

            // Save session summary
            fetch('/api/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    device_id: state.deviceId,
                    mode: state.mode,
                    exercise: state.exercise,
                    messages: state.messages
                })
            }).catch(() => {});

            // Hide email form, show format buttons
            emailCapture.classList.add('hidden');
            formatButtons.classList.remove('hidden');

            // Auto-download PDF
            downloadReportPdf();

            // After brief delay, transition to Screen 3
            setTimeout(() => transitionToPostDownload(), 2500);
        });

        // Wire format buttons
        document.getElementById('psFormatPdf')?.addEventListener('click', () => downloadReportPdf());
        document.getElementById('psFormatPptx')?.addEventListener('click', () => downloadReportPptx());
        // SVG/PNG/Word format buttons removed — PDF and PPTX only

        // Share buttons
        document.getElementById('psShareCopyLink')?.addEventListener('click', async () => {
            try {
                const resp = await fetch('/api/share', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ report: state.reportText, synopsis: state.reportSynopsis, exercise: state.exercise, mode: state.mode })
                });
                if (resp.ok) {
                    const data = await resp.json();
                    const url = window.location.origin + data.url;
                    await navigator.clipboard.writeText(url);
                    const btn = document.getElementById('psShareCopyLink');
                    if (btn) { btn.textContent = '\u2713 Copied!'; setTimeout(() => { btn.textContent = '\u{1F4C4} Copy link'; }, 2000); }
                }
            } catch (err) { console.error('[Share] Copy link failed:', err); }
        });
        document.getElementById('psShareLinkedIn')?.addEventListener('click', () => {
            const headline = state._revealData?.headline || '';
            const exName = EXERCISE_LABELS[state.exercise] || state.exercise;
            const text = encodeURIComponent(`Just completed a ${exName} session with The Studio (Wade Institute). ${headline}\n\nTry it at wadeinstitute.org.au/studio`);
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://wadeinstitute.org.au/studio')}&text=${text}`, '_blank');
        });
        document.getElementById('psShareEmail')?.addEventListener('click', () => {
            const headline = state._revealData?.headline || '';
            const exName = EXERCISE_LABELS[state.exercise] || state.exercise;
            const subject = encodeURIComponent(`${exName} — The Studio (Wade Institute)`);
            const body = encodeURIComponent(`I just completed a ${exName} session with The Studio.\n\n${headline}\n\nCheck it out: https://wadeinstitute.org.au/studio`);
            window.open(`mailto:?subject=${subject}&body=${body}`);
        });

    } catch (err) {
        clearInterval(stepInterval);
        console.error('[PostSession] Flow failed:', err, err?.stack || '');
        // Fallback: restore chat pane and use old flow
        loadingScreen.classList.add('hidden');
        if (chatPane) chatPane.style.display = '';
        if (inputArea) inputArea.style.display = '';
        sessionBar.classList.remove('hidden');
        reportCta.classList.remove('hidden');
        reportGenerating = false;
        reportCtaBtn.disabled = false;
        reportCtaBtn.textContent = 'Generate my report \u2192';
        // Try old flow as fallback
        generateReport();
    }
}

function transitionToPostDownload() {
    const revealScreen = document.getElementById('postSessionReveal');
    const nextScreen = document.getElementById('postSessionNext');
    if (!nextScreen) return;

    revealScreen?.classList.add('hidden');
    nextScreen.classList.remove('hidden');
    nextScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const exName = EXERCISE_LABELS[state.exercise] || state.exercise;
    const modeName = MODE_LABELS[state.mode] || state.mode;
    const revealData = state._revealData || {};
    const duration = state._sessionDuration || 0;
    const email = state.userEmail || '';

    // Confirmation subtitle
    const confirmSub = document.getElementById('psConfirmSubtitle');
    if (confirmSub && email) confirmSub.textContent = `PDF report sent to ${email}`;

    // Pete Recommends Next — 3 tool cards
    const nextTools = document.getElementById('psNextTools');
    const recommendations = state._revealRecommendations || [];

    if (nextTools && recommendations.length > 0) {
        nextTools.innerHTML = recommendations.map(r => {
            const mode = EXERCISE_MODE[r.exercise] || 'untangle';
            const name = EXERCISE_LABELS[r.exercise] || r.exercise;
            const category = CATEGORY_LABELS[mode] || mode.toUpperCase();
            const icon = CATEGORY_ICONS[mode] || '◆';
            const time = EXERCISE_TIMES[r.exercise] || '~20 min';
            return `
                <div class="ps-next-card" data-mode="${mode}" data-exercise="${r.exercise}" data-category="${mode}">
                    <div class="ps-next-card-accent"></div>
                    <div class="ps-next-card-icon">${icon}</div>
                    <div class="ps-next-card-body">
                        <div class="ps-next-card-name">${name}</div>
                        <div class="ps-next-card-desc">${r.reason}</div>
                        <div class="ps-next-card-meta">
                            <span class="ps-next-card-tag">${category}</span>
                            <span class="ps-next-card-time">~${time}</span>
                        </div>
                    </div>
                    <span class="ps-next-card-arrow">›</span>
                </div>
            `;
        }).join('');

        nextTools.querySelectorAll('.ps-next-card').forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.dataset.mode;
                const exercise = card.dataset.exercise;
                cleanupPostSessionScreens();
                startExercise(mode, exercise);
            });
        });
    }

    // Session card
    const sessionTitle = document.getElementById('psSessionTitle');
    const sessionHeadline = document.getElementById('psSessionHeadline');
    const sessionMeta = document.getElementById('psSessionMeta');
    if (sessionTitle) sessionTitle.textContent = `${exName} \u2014 The Studio`;
    if (sessionHeadline && revealData.headline) sessionHeadline.textContent = `"${revealData.headline}"`;
    if (sessionMeta) {
        const today = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
        sessionMeta.textContent = `${today} \u00B7 ${duration} min \u00B7 ${modeName}`;
    }

    // Wade Programs Nudge
    const nudgeHeading = document.getElementById('psNudgeHeading');
    const nudgeText = document.getElementById('psNudgeText');
    const nudgeStatNum = document.getElementById('psNudgeStatNumber');
    const nudgeStatLabel = document.getElementById('psNudgeStatLabel');

    // Count "thin" cells — board zones with 0-1 cards
    const boardCards = state.board?.cards || [];
    const zoneCounts = {};
    boardCards.forEach(c => { zoneCounts[c.zone] = (zoneCounts[c.zone] || 0) + 1; });
    const thinCells = Object.values(zoneCounts).filter(c => c <= 1).length;

    if (nudgeHeading) nudgeHeading.textContent = `Your ${exName.toLowerCase()} is strong \u2014 but ${exName.toLowerCase()}s don't build companies. People do.`;
    if (nudgeText) nudgeText.textContent = `The Studio helped you think through ${exName}. Imagine what happens when you work through it with a cohort of peers who'll challenge your assumptions, share their networks, and hold you accountable. That\u2019s what Wade\u2019s programs are built for.`;
    // Nudge stat removed per design spec

    // Session action buttons
    document.getElementById('psEditBoard')?.addEventListener('click', () => {
        cleanupPostSessionScreens();
        // Restore chat and board
        const chatPane = document.getElementById('chatPane');
        if (chatPane) chatPane.style.display = '';
        if (inputArea) inputArea.style.display = '';
        toggleBoard();
    });
    document.getElementById('psRedownload')?.addEventListener('click', () => downloadReportPdf());

    // Explore More Tools grid — 4 tools not current
    const exploreGrid = document.getElementById('psExploreGrid');
    if (exploreGrid) {
        const allTools = Object.entries(EXERCISE_MODE)
            .filter(([ex]) => ex !== state.exercise)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);

        exploreGrid.innerHTML = allTools.map(([ex, mode]) => {
            const name = EXERCISE_LABELS[ex] || ex;
            const desc = EXERCISE_DESCS[ex] || '';
            const time = EXERCISE_TIMES[ex] || '~20 min';
            return `
                <div class="ps-explore-tile" data-mode="${mode}" data-exercise="${ex}" data-category="${mode}">
                    <div class="ps-explore-tile-name">${name}</div>
                    <div class="ps-explore-tile-desc">${desc}</div>
                    <div class="ps-explore-tile-time">~${time}</div>
                </div>
            `;
        }).join('');

        exploreGrid.querySelectorAll('.ps-explore-tile').forEach(tile => {
            tile.addEventListener('click', () => {
                const mode = tile.dataset.mode;
                const exercise = tile.dataset.exercise;
                cleanupPostSessionScreens();
                startExercise(mode, exercise);
            });
        });
    }

    // Wire new session button
    document.getElementById('psNewSessionBtn')?.addEventListener('click', () => {
        cleanupPostSessionScreens();
        forceCloseSession();
    });
}

function cleanupPostSessionScreens() {
    document.getElementById('postSessionLoading')?.classList.add('hidden');
    document.getElementById('postSessionReveal')?.classList.add('hidden');
    document.getElementById('postSessionNext')?.classList.add('hidden');

    // Restore chat pane visibility
    const chatPane = document.getElementById('chatPane');
    if (chatPane) chatPane.style.display = '';
    if (inputArea) inputArea.style.display = '';
    sessionBar.classList.remove('hidden');
    reportGenerating = false;
}

// === WORKSHOP PHASE & PROGRESS ===

function updatePhaseIndicator(phase) {
    const el = document.getElementById('phaseIndicator');
    if (!el) return;
    el.className = 'phase-indicator';
    if (phase === 'diverge') {
        el.textContent = 'Opening up ↗';
        el.classList.add('phase-diverge');
    } else if (phase === 'converge') {
        el.textContent = 'Narrowing down ↘';
        el.classList.add('phase-converge');
    } else {
        el.textContent = '';
    }
}

function updateProgressIndicator() {
    const el = document.getElementById('progressIndicator');
    if (!el || !state.exercise) return;

    // Trade-Off: show round-based progress instead of exchange count
    if (state.exercise === 'trade-off') {
        const round = state.tradeOffRound;
        if (round === 0) {
            el.innerHTML = `<span class="progress-count">Setup</span><div class="progress-bar-track"><div class="progress-bar-fill" style="width:0%"></div></div>`;
        } else {
            const pct = Math.min(100, Math.round((round / 10) * 100));
            el.innerHTML = `<span class="progress-count">Round ${round} of 10</span><div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>`;
        }
        el.classList.remove('hidden');
        return;
    }

    const expected = EXERCISE_EXCHANGES[state.exercise] || 8;
    const current = state.exchangeCount;
    const pct = Math.min(100, Math.round((current / expected) * 100));
    el.innerHTML = `<span class="progress-count">${current} of ~${expected}</span><div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>`;
    el.classList.remove('hidden');
}

// === WORKSHOP BOARD ===

const BOARD_LAYOUTS = {
    'five-whys': {
        zones: [
            { id: 'fw-problem', name: 'Presenting Problem', empty: 'The surface problem', hint: 'What happened?', colour: 'teal' },
            { id: 'fw-why1', name: 'Why #1', empty: 'First answer', hint: 'Why is that a problem?', colour: 'teal' },
            { id: 'fw-why2', name: 'Why #2', empty: 'Deeper', hint: 'Why does that happen?', colour: 'teal' },
            { id: 'fw-why3', name: 'Why #3', empty: 'Deeper still', hint: 'Why?', colour: 'teal' },
            { id: 'fw-why4', name: 'Why #4', empty: 'Approaching root', hint: 'Why?', colour: 'teal' },
            { id: 'fw-why5', name: 'Root Cause', empty: 'The real insight', hint: 'The deepest why', colour: 'teal' },
            { id: 'fw-reach', name: 'Reach', empty: 'How many people?', hint: 'Tens, thousands, millions?', colour: 'orange' },
            { id: 'fw-frequency', name: 'Frequency', empty: 'How often?', hint: 'Daily, weekly, annually?', colour: 'orange' },
            { id: 'fw-alternatives', name: 'Alternatives', empty: 'What do they do today?', hint: 'Workarounds or nothing?', colour: 'orange' },
            { id: 'fw-verdict', name: 'Verdict', empty: 'Worth pursuing?', hint: 'The opportunity call', colour: 'orange' },
            { id: 'actions', name: 'Actions', empty: 'What to do about it', hint: 'Next steps', colour: 'teal' }
        ],
        gridClass: 'board-grid-five-whys'
    },
    'empathy-map': {
        zones: [
            { id: 'em-user', name: 'User', empty: 'Who are we mapping?', hint: 'Specific person or persona', colour: 'teal' },
            { id: 'em-says', name: 'Says', empty: 'What they say out loud', hint: 'Direct quotes, public statements', colour: 'teal' },
            { id: 'em-thinks', name: 'Thinks', empty: 'What they think privately', hint: 'Inner thoughts, worries, hopes', colour: 'teal' },
            { id: 'em-does', name: 'Does', empty: 'Observable behaviour', hint: 'Actions, habits, routines', colour: 'teal' },
            { id: 'em-feels', name: 'Feels', empty: 'Emotions', hint: 'Anxious, excited, frustrated, hopeful', colour: 'teal' },
            { id: 'em-contradictions', name: 'Contradictions', empty: 'Where says and does don\'t match', hint: 'The gaps are the insights', colour: 'teal' },
            { id: 'insights', name: 'Key Insight', empty: 'The most important discovery', hint: 'What changes because of this?', colour: 'teal' }
        ],
        gridClass: 'board-grid-empathy-map'
    },
    'jtbd': {
        zones: [
            { id: 'jtbd-situation', name: 'Situation', empty: 'When I\'m...', hint: 'The context that triggers the need', colour: 'teal' },
            { id: 'jtbd-functional', name: 'Functional Job', empty: 'What task am I trying to accomplish?', hint: 'The practical thing they need done', colour: 'teal' },
            { id: 'jtbd-emotional', name: 'Emotional Job', empty: 'How do I want to feel?', hint: 'Confidence, relief, excitement', colour: 'teal' },
            { id: 'jtbd-social', name: 'Social Job', empty: 'How do I want to be perceived?', hint: 'Competent, innovative, caring', colour: 'teal' },
            { id: 'jtbd-hiring', name: 'Hiring Criteria', empty: 'What makes them choose?', hint: 'Speed, cost, trust, outcome', colour: 'teal' },
            { id: 'insights', name: 'Underserved Job', empty: 'The job no one does well', hint: 'This is the opportunity', colour: 'teal' }
        ],
        gridClass: 'board-grid-jtbd'
    },
    'crazy-8s': {
        zones: [
            { id: 'c8-1', name: 'Idea 1', empty: 'First idea', hint: '~1 minute', colour: 'orange' },
            { id: 'c8-2', name: 'Idea 2', empty: 'Second idea', hint: '~1 minute', colour: 'orange' },
            { id: 'c8-3', name: 'Idea 3', empty: 'Third idea', hint: '~1 minute', colour: 'orange' },
            { id: 'c8-4', name: 'Idea 4', empty: 'Fourth idea', hint: '~1 minute', colour: 'orange' },
            { id: 'c8-5', name: 'Idea 5', empty: 'Fifth idea', hint: '~1 minute', colour: 'orange' },
            { id: 'c8-6', name: 'Idea 6', empty: 'Sixth idea', hint: '~1 minute', colour: 'orange' },
            { id: 'c8-7', name: 'Idea 7', empty: 'Seventh idea', hint: '~1 minute', colour: 'orange' },
            { id: 'c8-8', name: 'Idea 8', empty: 'Eighth idea', hint: '~1 minute', colour: 'orange' },
            { id: 'c8-shortlist', name: 'Shortlist', empty: 'Best ideas selected', hint: 'Star your favourites', colour: 'orange' }
        ],
        gridClass: 'board-grid-crazy8s'
    },
    'hmw': {
        zones: [
            { id: 'hmw-problem', name: 'Problem Statement', empty: 'The challenge to reframe', hint: 'What\'s the problem?', colour: 'orange' },
            { id: 'hmw-q1', name: 'HMW #1', empty: 'First reframe', hint: 'How might we...?', colour: 'orange' },
            { id: 'hmw-q2', name: 'HMW #2', empty: 'Second reframe', hint: 'How might we...?', colour: 'orange' },
            { id: 'hmw-q3', name: 'HMW #3', empty: 'Third reframe', hint: 'How might we...?', colour: 'orange' },
            { id: 'hmw-q4', name: 'HMW #4', empty: 'Fourth reframe', hint: 'How might we...?', colour: 'orange' },
            { id: 'hmw-q5', name: 'HMW #5', empty: 'Fifth reframe', hint: 'How might we...?', colour: 'orange' },
            { id: 'hmw-best', name: 'Most Promising', empty: 'The reframe with the most potential', hint: 'Which one opens the most interesting direction?', colour: 'orange' },
            { id: 'actions', name: 'Actions', empty: 'Next steps', hint: 'What to explore from here', colour: 'orange' }
        ],
        gridClass: 'board-grid-hmw'
    },
    'scamper': {
        zones: [
            { id: 'sc-s', name: 'S — Substitute', empty: 'What could you replace?', hint: 'Materials, people, processes', colour: 'orange' },
            { id: 'sc-c', name: 'C — Combine', empty: 'What could you merge?', hint: 'Features, ideas, audiences', colour: 'orange' },
            { id: 'sc-a', name: 'A — Adapt', empty: 'What could you borrow?', hint: 'From other industries, contexts', colour: 'orange' },
            { id: 'sc-m', name: 'M — Modify', empty: 'What could you change?', hint: 'Size, shape, timing, frequency', colour: 'orange' },
            { id: 'sc-p', name: 'P — Put to Other Uses', empty: 'What else could this do?', hint: 'New markets, new contexts', colour: 'orange' },
            { id: 'sc-e', name: 'E — Eliminate', empty: 'What could you remove?', hint: 'The hardest question', colour: 'orange' },
            { id: 'sc-r', name: 'R — Reverse', empty: 'What if you did the opposite?', hint: 'Flip the assumption', colour: 'orange' },
            { id: 'sc-shortlist', name: 'Shortlist', empty: 'Best ideas across all lenses', hint: 'Star your favourites', colour: 'orange' }
        ],
        gridClass: 'board-grid-scamper'
    },
    'devils-advocate': {
        zones: [
            { id: 'da-idea', name: 'The Idea', empty: 'What are you defending?', hint: 'State your case', colour: 'pink' },
            { id: 'da-objections', name: 'Objections', empty: 'Adversary attacks', hint: 'Each challenge from the adversary', colour: 'pink' },
            { id: 'da-defended', name: 'Defended', empty: 'Had evidence', hint: 'Objections you handled well', colour: 'pink' },
            { id: 'da-deflected', name: 'Deflected', empty: 'Argued without evidence', hint: 'Plausible but unproven responses', colour: 'pink' },
            { id: 'da-exposed', name: 'Exposed', empty: 'No answer', hint: 'Objections you couldn\'t address', colour: 'pink' },
            { id: 'da-danger', name: 'Danger Zone', empty: 'Biggest vulnerability', hint: 'The one thing that could kill this', colour: 'pink' },
            { id: 'actions', name: 'Actions', empty: 'Address top vulnerability', hint: 'What to fix first', colour: 'pink' }
        ],
        gridClass: 'board-grid-devils-advocate'
    },
    'rapid-experiment': {
        zones: [
            { id: 're-assumptions', name: 'Assumptions', empty: 'What must be true?', hint: '5-8 assumptions embedded in your idea', colour: 'yellow' },
            { id: 're-matrix', name: 'Risk Matrix', empty: 'Confidence x Consequence', hint: 'TEST NOW / MONITOR / WATCH / PARK', colour: 'yellow' },
            { id: 're-top-risk', name: 'Top Risk', empty: 'Riskiest assumption', hint: 'Low confidence, high consequence', colour: 'yellow' },
            { id: 're-hypothesis', name: 'Hypothesis', empty: 'What do you believe?', hint: 'We believe [X]. We\'ll know if [Y]', colour: 'yellow' },
            { id: 're-method', name: 'Test Method', empty: 'The cheapest test', hint: 'Interview, landing page, concierge...', colour: 'yellow' },
            { id: 're-sample', name: 'Sample', empty: 'Who to test with', hint: 'Who, how many, how to recruit', colour: 'yellow' },
            { id: 're-metric', name: 'Success Metric', empty: 'Pass/fail threshold', hint: 'Set before seeing data', colour: 'yellow' },
            { id: 're-timeline', name: 'Timeline', empty: 'How long?', hint: 'Target: under 1 week', colour: 'yellow' },
            { id: 'actions', name: 'First Step', empty: 'Tomorrow morning', hint: 'What to do first', colour: 'yellow' }
        ],
        gridClass: 'board-grid-rapid-experiment'
    },
    'default': {
        zones: [
            { id: 'insights', name: 'Key Insights', empty: 'No insights yet — keep digging' },
            { id: 'ideas', name: 'Ideas', empty: 'Ideas will land here' },
            { id: 'parking', name: 'Parking Lot', empty: 'Park tangential ideas here' },
            { id: 'actions', name: 'Actions', empty: 'Concrete next steps go here' }
        ],
        gridClass: 'board-grid-default'
    },
    'lean-canvas': {
        zones: [
            { id: 'problem', name: 'Problem', empty: 'Top 1-3 problems', hint: 'What are the top 3 problems?', colour: 'yellow' },
            { id: 'solution', name: 'Solution', empty: 'Top features', hint: 'How you solve each problem', colour: 'yellow' },
            { id: 'uvp', name: 'Unique Value Prop', empty: 'Single clear message', hint: 'Why are you different?', colour: 'yellow' },
            { id: 'unfair', name: 'Unfair Advantage', empty: 'Can\'t be copied', hint: 'What can\'t be easily copied?', colour: 'yellow' },
            { id: 'segments', name: 'Customer Segments', empty: 'Target customers', hint: 'Who are your target customers?', colour: 'yellow' },
            { id: 'channels', name: 'Channels', empty: 'Path to customers', hint: 'How you reach customers', colour: 'yellow' },
            { id: 'revenue', name: 'Revenue Streams', empty: 'How you make money', hint: 'Revenue model', colour: 'yellow' },
            { id: 'costs', name: 'Cost Structure', empty: 'Key costs', hint: 'Key cost drivers', colour: 'yellow' },
            { id: 'metrics', name: 'Key Metrics', empty: 'Numbers that matter', hint: 'Key numbers to track', colour: 'yellow' }
        ],
        gridClass: 'board-grid-canvas'
    },
    'pre-mortem': {
        zones: [
            { id: 'risk-market', name: 'Market Risk', empty: 'Market failures', hint: 'Wrong market, bad timing, no demand', colour: 'pink' },
            { id: 'risk-product', name: 'Product Risk', empty: 'Product failures', hint: 'Wrong solution, bad UX, doesn\'t work', colour: 'pink' },
            { id: 'risk-team', name: 'Team Risk', empty: 'Team failures', hint: 'Wrong skills, conflict, burnout', colour: 'pink' },
            { id: 'risk-financial', name: 'Financial Risk', empty: 'Money failures', hint: 'Ran out of cash, wrong pricing', colour: 'pink' },
            { id: 'risk-competition', name: 'Competition Risk', empty: 'Competitive failures', hint: 'Beaten by incumbents or new entrants', colour: 'pink' },
            { id: 'risk-timing', name: 'Timing Risk', empty: 'Timing failures', hint: 'Too early, too late, external shock', colour: 'pink' },
            { id: 'risk-mitigations', name: 'Mitigations', empty: 'Actions to reduce risk', hint: 'What you can do this week', colour: 'pink' }
        ],
        gridClass: 'board-grid-premortem'
    },
    'effectuation': {
        zones: [
            { id: 'eff-means', name: 'Bird in Hand', empty: 'What you already have', hint: 'Skills, knowledge, network', colour: 'yellow' },
            { id: 'eff-loss', name: 'Affordable Loss', empty: 'What you can risk', hint: 'Time, money, reputation', colour: 'yellow' },
            { id: 'eff-quilt', name: 'Crazy Quilt', empty: 'Who could join', hint: 'Partners, allies, co-creators', colour: 'yellow' },
            { id: 'eff-lemonade', name: 'Lemonade', empty: 'Surprises to leverage', hint: 'Turn setbacks into advantages', colour: 'yellow' },
            { id: 'eff-pilot', name: 'Pilot in the Plane', empty: 'What you control', hint: 'Shape the future, don\'t predict it', colour: 'yellow' },
            { id: 'eff-action', name: 'First Move', empty: 'This week\'s action', hint: 'One concrete step in 48 hours', colour: 'yellow' }
        ],
        gridClass: 'board-grid-effectuation'
    },
    'elevator-pitch': {
        zones: [
            { id: 'pitch-customer', name: 'Target Customer', empty: 'Who is this for?', hint: 'The specific person who needs this most', colour: 'yellow' },
            { id: 'pitch-problem', name: 'Problem / Need', empty: 'What pain do they have?', hint: 'The urgent problem they face', colour: 'yellow' },
            { id: 'pitch-solution', name: 'Product / Service', empty: 'What are you building?', hint: 'Name and category', colour: 'yellow' },
            { id: 'pitch-benefit', name: 'Key Benefit', empty: 'What changes for them?', hint: 'The specific outcome they get', colour: 'yellow' },
            { id: 'pitch-differentiator', name: 'Differentiator', empty: 'Why you, not them?', hint: 'What makes you different from alternatives', colour: 'yellow' }
        ],
        gridClass: 'board-grid-pitch'
    },
    'iceberg': {
        zones: [
            { id: 'ice-event', name: 'The Event', empty: 'What happened?', hint: 'The visible surface problem', colour: 'teal' },
            { id: 'ice-patterns', name: 'Patterns', empty: 'What keeps happening?', hint: 'Recurring themes beneath the event', colour: 'teal' },
            { id: 'ice-structures', name: 'Structures', empty: 'What causes the pattern?', hint: 'Incentives, processes, power dynamics', colour: 'teal' },
            { id: 'ice-mental', name: 'Mental Models', empty: 'What belief holds this in place?', hint: 'The deepest assumption', colour: 'teal' },
            { id: 'ice-leverage', name: 'Leverage Point', empty: 'Where to intervene', hint: 'The change with the greatest impact', colour: 'teal' },
            { id: 'actions', name: 'Actions', empty: 'Next steps', hint: 'Test or shift the mental model', colour: 'teal' }
        ],
        gridClass: 'board-grid-iceberg'
    },
    'constraint-flip': {
        zones: [
            { id: 'cf-constraint', name: 'The Constraint', empty: 'Your biggest limitation', hint: 'Be specific — not just "no money"', colour: 'orange' },
            { id: 'cf-flip', name: 'The Flip', empty: 'The same fact, seen as an advantage', hint: 'What can you do because of this?', colour: 'orange' },
            { id: 'cf-ideas', name: 'Constraint-Driven Ideas', empty: 'Ideas that depend on the constraint', hint: 'If the constraint disappeared, would the idea still work?', colour: 'orange' },
            { id: 'cf-moat', name: 'The Moat Idea', empty: 'The idea competitors can\'t copy', hint: 'Only works because of your specific limitation', colour: 'orange' },
            { id: 'actions', name: 'Actions', empty: 'First test', hint: 'How to validate the moat idea', colour: 'orange' }
        ],
        gridClass: 'board-grid-constraint-flip'
    },
    'mash-up': {
        zones: [
            { id: 'mu-problem', name: 'Your Challenge', empty: 'The problem in your own words', hint: 'What are you trying to solve?', colour: 'orange' },
            { id: 'mu-abstract', name: 'Abstract Version', empty: 'The problem stripped to its essence', hint: 'Remove the industry — what\'s the underlying pattern?', colour: 'orange' },
            { id: 'mu-collision-1', name: 'Collision 1', empty: 'First outside-world analogy', hint: 'How does a different field solve this?', colour: 'orange' },
            { id: 'mu-collision-2', name: 'Collision 2', empty: 'Second outside-world analogy', hint: 'A wilder, more distant domain', colour: 'orange' },
            { id: 'mu-collision-3', name: 'Collision 3', empty: 'Third outside-world analogy', hint: 'From nature, art, or history', colour: 'orange' },
            { id: 'mu-collision-4', name: 'Collision 4', empty: 'Fourth outside-world analogy', hint: 'The most unexpected one', colour: 'orange' },
            { id: 'mu-remix', name: 'The Remix', empty: 'Your new approach — mashed up from the best collisions', hint: 'Combine elements that don\'t usually meet', colour: 'orange' },
            { id: 'mu-actions', name: 'Actions', empty: 'First step to test the remix', hint: 'What can you try this week?', colour: 'orange' }
        ],
        gridClass: 'board-grid-mash-up'
    },
    'analogical': {
        zones: [
            { id: 'mu-problem', name: 'Your Challenge', empty: 'The problem in your own words', hint: 'What are you trying to solve?', colour: 'orange' },
            { id: 'mu-abstract', name: 'Abstract Version', empty: 'The problem stripped to its essence', hint: 'Remove the industry — what\'s the underlying pattern?', colour: 'orange' },
            { id: 'mu-collision-1', name: 'Collision 1', empty: 'First outside-world analogy', hint: 'How does a different field solve this?', colour: 'orange' },
            { id: 'mu-collision-2', name: 'Collision 2', empty: 'Second outside-world analogy', hint: 'A wilder, more distant domain', colour: 'orange' },
            { id: 'mu-collision-3', name: 'Collision 3', empty: 'Third outside-world analogy', hint: 'From nature, art, or history', colour: 'orange' },
            { id: 'mu-collision-4', name: 'Collision 4', empty: 'Fourth outside-world analogy', hint: 'The most unexpected one', colour: 'orange' },
            { id: 'mu-remix', name: 'The Remix', empty: 'Your new approach — mashed up from the best collisions', hint: 'Combine elements that don\'t usually meet', colour: 'orange' },
            { id: 'mu-actions', name: 'Actions', empty: 'First step to test the remix', hint: 'What can you try this week?', colour: 'orange' }
        ],
        gridClass: 'board-grid-mash-up'
    },
    'socratic': {
        zones: [
            { id: 'sq-verified', name: 'Verified', empty: 'Tested — evidence exists', hint: 'Claims with real data behind them', colour: 'teal' },
            { id: 'sq-assumed', name: 'Assumed', empty: 'Believed but untested', hint: 'Feels true but no evidence', colour: 'teal' },
            { id: 'sq-inherited', name: 'Inherited', empty: 'Someone told you — you accepted it', hint: 'Absorbed from others without testing', colour: 'teal' },
            { id: 'sq-critical', name: 'Critical Assumption', empty: 'The one that changes everything', hint: 'If this is wrong, the whole plan shifts', colour: 'teal' },
            { id: 'actions', name: 'The Test', empty: 'How to validate the critical assumption', hint: 'Simplest test in the next two weeks', colour: 'teal' }
        ],
        gridClass: 'board-grid-socratic'
    },
    'reality-check': {
        zones: [
            { id: 'rc-context', name: 'The Idea', empty: 'What you\'re building', hint: 'The 30-second version', colour: 'pink' },
            { id: 'rc-value', name: 'Value Risk', empty: 'Will customers want this?', hint: 'Switching cost, evidence of demand', colour: 'pink' },
            { id: 'rc-value-rating', name: 'Value Rating', empty: '🟢 🟡 🔴', hint: 'GREEN / AMBER / RED', colour: 'pink' },
            { id: 'rc-usability', name: 'Usability Risk', empty: 'Can they figure it out?', hint: 'First-use experience, complexity', colour: 'pink' },
            { id: 'rc-usability-rating', name: 'Usability Rating', empty: '🟢 🟡 🔴', hint: 'GREEN / AMBER / RED', colour: 'pink' },
            { id: 'rc-feasibility', name: 'Feasibility Risk', empty: 'Can the team build it?', hint: 'Technical long pole, team capability', colour: 'pink' },
            { id: 'rc-feasibility-rating', name: 'Feasibility Rating', empty: '🟢 🟡 🔴', hint: 'GREEN / AMBER / RED', colour: 'pink' },
            { id: 'rc-viability', name: 'Viability Risk', empty: 'Does the business work?', hint: 'Unit economics, strategy, legal', colour: 'pink' },
            { id: 'rc-viability-rating', name: 'Viability Rating', empty: '🟢 🟡 🔴', hint: 'GREEN / AMBER / RED', colour: 'pink' },
            { id: 'rc-overall', name: 'Overall Verdict', empty: 'Biggest risk identified', hint: 'Weakest link = overall rating', colour: 'pink' },
            { id: 'actions', name: 'Actions', empty: 'Test your biggest risk', hint: 'One cheap test', colour: 'pink' }
        ],
        gridClass: 'board-grid-reality-check'
    },
    'theory-of-change': {
        zones: [
            { id: 'toc-outcome', name: 'The Outcome', empty: 'Long-term change you want to create', hint: 'Not what you do — what\'s different in the world', colour: 'yellow' },
            { id: 'toc-control', name: 'Within Control', empty: 'Preconditions you can create', hint: 'Actions and conditions you directly influence', colour: 'yellow' },
            { id: 'toc-influence', name: 'Within Influence', empty: 'Preconditions you can nudge', hint: 'Can\'t guarantee but can increase likelihood', colour: 'yellow' },
            { id: 'toc-outside', name: 'Outside Control', empty: 'Must happen independently', hint: 'The assumptions your whole plan rests on', colour: 'yellow' },
            { id: 'toc-activities', name: 'Activities', empty: 'What you\'ll actually do', hint: 'Specific actions to create controllable conditions', colour: 'yellow' },
            { id: 'toc-weakest', name: 'Weakest Link', empty: 'The connection you\'re least confident about', hint: 'Where the chain is most likely to break', colour: 'yellow' },
            { id: 'actions', name: 'The Test', empty: 'Validate the weakest link', hint: 'Simplest test in the next month', colour: 'yellow' }
        ],
        gridClass: 'board-grid-toc'
    },
    'trade-off': {
        zones: [
            { id: 'to-features', name: 'All Features', empty: 'The full offer, deconstructed', hint: '5 dimensions with 3 levels each', colour: 'pink' },
            { id: 'to-tally', name: 'Running Tally', empty: 'Win counts update after each round', hint: 'Which features are winning?', colour: 'pink' },
            { id: 'to-rounds', name: 'Trade-Off Rounds', empty: 'Package A vs Package B', hint: 'Each round forces a sacrifice', colour: 'pink' },
            { id: 'to-musthave', name: 'Must-Have', empty: 'Won 7-10 rounds', hint: 'Core value — customers always choose this', colour: 'pink' },
            { id: 'to-nicetohave', name: 'Nice-to-Have', empty: 'Won 4-6 rounds', hint: 'Valuable but tradeable', colour: 'pink' },
            { id: 'to-expendable', name: 'Expendable', empty: 'Won 0-3 rounds', hint: 'You care more than your customer does', colour: 'pink' },
            { id: 'to-surprise', name: 'The Surprise', empty: 'The feature you were most wrong about', hint: 'Overvalued or undervalued going in', colour: 'pink' },
            { id: 'to-mvo', name: 'Minimum Viable Offer', empty: 'Survivors only — the simplest version someone would pay for', hint: 'Strip everything else away', colour: 'pink' },
            { id: 'actions', name: 'Actions', empty: 'What changes because of this', hint: 'Roadmap, pricing, or positioning shift', colour: 'pink' }
        ],
        gridClass: 'board-grid-trade-off'
    },
    'customer-discovery': {
        zones: [
            { id: 'co-persona', name: 'Customer Persona', empty: 'Who Pete is playing', hint: 'Name, role, context, frustrations', colour: 'pink' },
            { id: 'co-exchanges', name: 'Interview Log', empty: 'Key Q&A moments', hint: 'What you asked, how they responded', colour: 'pink' },
            { id: 'co-open', name: 'Open vs Leading', empty: 'Question quality', hint: 'Did you explore or pitch?', colour: 'pink' },
            { id: 'co-followup', name: 'Follow-up Quality', empty: 'Thread chasing', hint: 'Did you pursue the interesting threads?', colour: 'pink' },
            { id: 'co-silence', name: 'Silence Tolerance', empty: 'Space for thinking', hint: 'Did you let them think?', colour: 'pink' },
            { id: 'co-signals', name: 'Signal Detection', empty: 'Planted vs caught', hint: 'Hints dropped and whether you followed up', colour: 'pink' },
            { id: 'co-pitch', name: 'Pitch Avoidance', empty: 'How long before selling?', hint: 'Lower is better', colour: 'pink' },
            { id: 'co-insight', name: 'Key Insight', empty: 'The big reveal', hint: 'What the customer revealed and whether you noticed', colour: 'pink' },
            { id: 'actions', name: 'Actions', empty: 'One thing to change', hint: 'The behaviour to fix next time', colour: 'pink' }
        ],
        gridClass: 'board-grid-customer-discovery'
    },
    'flywheel': {
        zones: [
            { id: 'fw-component-1', name: 'Component 1', empty: 'The engine — what makes everything easier?', hint: 'The core activity', colour: 'yellow' },
            { id: 'fw-component-2', name: 'Component 2', empty: 'What does Component 1 lead to?', hint: 'The next link in the chain', colour: 'yellow' },
            { id: 'fw-component-3', name: 'Component 3', empty: 'What does Component 2 lead to?', hint: 'The next link', colour: 'yellow' },
            { id: 'fw-component-4', name: 'Component 4', empty: 'What completes the loop?', hint: 'How it feeds back to the start', colour: 'yellow' },
            { id: 'fw-bottleneck', name: 'Bottleneck', empty: 'The weakest link', hint: 'Which connection loses the most energy?', colour: 'yellow' },
            { id: 'insights', name: 'Key Insights', empty: 'What emerged', hint: 'Patterns and observations', colour: 'yellow' },
            { id: 'actions', name: 'Actions', empty: 'Next steps', hint: '90-day plan + 48-hour first step', colour: 'yellow' }
        ],
        gridClass: 'board-grid-flywheel'
    },
    'mash-up': {
        zones: [
            { id: 'mu-problem', name: 'Problem', empty: 'Your core challenge', hint: 'What specific problem needs solving?', colour: 'orange' },
            { id: 'mu-abstract', name: 'Abstract Structure', empty: 'The structural pattern', hint: 'What type of problem is this, stripped of context?', colour: 'orange' },
            { id: 'mu-collision-1', name: 'Collision 1', empty: 'First domain collision', hint: 'Source domain + story + mechanism', colour: 'orange' },
            { id: 'mu-collision-2', name: 'Collision 2', empty: 'Second domain collision', hint: 'Source domain + story + mechanism', colour: 'orange' },
            { id: 'mu-collision-3', name: 'Collision 3', empty: 'Third domain collision', hint: 'Source domain + story + mechanism', colour: 'orange' },
            { id: 'mu-collision-4', name: 'Collision 4', empty: 'Fourth domain collision', hint: 'Source domain + story + mechanism', colour: 'orange' },
            { id: 'mu-remix', name: 'Remixed Ideas', empty: 'Adapted solutions', hint: 'Ideas remixed from hot collisions + source tags', colour: 'orange' },
            { id: 'mu-actions', name: 'Actions', empty: 'First experiment', hint: 'Which remixed idea to prototype first, and how', colour: 'orange' }
        ],
        gridClass: 'board-grid-mash-up'
    },
    'analogical': {
        zones: [
            { id: 'mu-problem', name: 'Problem', empty: 'Your core challenge', hint: 'What specific problem needs solving?', colour: 'orange' },
            { id: 'mu-abstract', name: 'Abstract Structure', empty: 'The structural pattern', hint: 'What type of problem is this, stripped of context?', colour: 'orange' },
            { id: 'mu-collision-1', name: 'Collision 1', empty: 'First domain collision', hint: 'Source domain + story + mechanism', colour: 'orange' },
            { id: 'mu-collision-2', name: 'Collision 2', empty: 'Second domain collision', hint: 'Source domain + story + mechanism', colour: 'orange' },
            { id: 'mu-collision-3', name: 'Collision 3', empty: 'Third domain collision', hint: 'Source domain + story + mechanism', colour: 'orange' },
            { id: 'mu-collision-4', name: 'Collision 4', empty: 'Fourth domain collision', hint: 'Source domain + story + mechanism', colour: 'orange' },
            { id: 'mu-remix', name: 'Remixed Ideas', empty: 'Adapted solutions', hint: 'Ideas remixed from hot collisions + source tags', colour: 'orange' },
            { id: 'mu-actions', name: 'Actions', empty: 'First experiment', hint: 'Which remixed idea to prototype first, and how', colour: 'orange' }
        ],
        gridClass: 'board-grid-mash-up'
    }
};

// Canvas block ID mapping from signal tags
const CANVAS_TAG_MAP = {
    'problem': 'problem', 'problems': 'problem',
    'solution': 'solution', 'solutions': 'solution',
    'uvp': 'uvp', 'value-prop': 'uvp', 'value_prop': 'uvp',
    'unfair': 'unfair', 'unfair-advantage': 'unfair', 'advantage': 'unfair',
    'segments': 'segments', 'customers': 'segments', 'customer-segments': 'segments',
    'channels': 'channels', 'channel': 'channels',
    'revenue': 'revenue', 'revenue-streams': 'revenue',
    'costs': 'costs', 'cost': 'costs', 'cost-structure': 'costs',
    'metrics': 'metrics', 'key-metrics': 'metrics'
};

// Pre-Mortem risk tag mapping
const RISK_TAG_MAP = {
    'market': 'risk-market',
    'product': 'risk-product',
    'team': 'risk-team',
    'financial': 'risk-financial',
    'competition': 'risk-competition',
    'timing': 'risk-timing',
    'mitigation': 'risk-mitigations', 'mitigations': 'risk-mitigations'
};


// === TOOL-SPECIFIC BOARD TAG MAPS ===

const FIVE_WHYS_TAG_MAP = {
    'problem': 'fw-problem', 'presenting-problem': 'fw-problem',
    'why1': 'fw-why1', 'why-1': 'fw-why1',
    'why2': 'fw-why2', 'why-2': 'fw-why2',
    'why3': 'fw-why3', 'why-3': 'fw-why3',
    'why4': 'fw-why4', 'why-4': 'fw-why4',
    'why5': 'fw-why5', 'why-5': 'fw-why5', 'root-cause': 'fw-why5', 'root': 'fw-why5',
    'reach': 'fw-reach', 'frequency': 'fw-frequency',
    'alternatives': 'fw-alternatives', 'verdict': 'fw-verdict'
};
const EMPATHY_TAG_MAP = {
    'user': 'em-user', 'persona': 'em-user', 'says': 'em-says', 'thinks': 'em-thinks',
    'does': 'em-does', 'feels': 'em-feels',
    'contradiction': 'em-contradictions', 'gap': 'em-contradictions',
    'insight': 'insights', 'key-insight': 'insights'
};
const JTBD_TAG_MAP_TOOL = {
    'situation': 'jtbd-situation', 'context': 'jtbd-situation',
    'functional': 'jtbd-functional', 'emotional': 'jtbd-emotional', 'social': 'jtbd-social',
    'hiring': 'jtbd-hiring', 'criteria': 'jtbd-hiring',
    'underserved': 'insights', 'opportunity': 'insights'
};
const CRAZY8S_TAG_MAP = {
    'idea-1': 'c8-1', '1': 'c8-1', 'idea-2': 'c8-2', '2': 'c8-2',
    'idea-3': 'c8-3', '3': 'c8-3', 'idea-4': 'c8-4', '4': 'c8-4',
    'idea-5': 'c8-5', '5': 'c8-5', 'idea-6': 'c8-6', '6': 'c8-6',
    'idea-7': 'c8-7', '7': 'c8-7', 'idea-8': 'c8-8', '8': 'c8-8',
    'shortlist': 'c8-shortlist', 'selected': 'c8-shortlist'
};
const HMW_TAG_MAP = {
    'problem': 'hmw-problem', 'challenge': 'hmw-problem',
    'hmw-1': 'hmw-q1', 'q1': 'hmw-q1', 'hmw-2': 'hmw-q2', 'q2': 'hmw-q2',
    'hmw-3': 'hmw-q3', 'q3': 'hmw-q3', 'hmw-4': 'hmw-q4', 'q4': 'hmw-q4',
    'hmw-5': 'hmw-q5', 'q5': 'hmw-q5',
    'best': 'hmw-best', 'most-promising': 'hmw-best'
};
const SCAMPER_TAG_MAP = {
    'substitute': 'sc-s', 's': 'sc-s', 'combine': 'sc-c', 'c': 'sc-c',
    'adapt': 'sc-a', 'a': 'sc-a', 'modify': 'sc-m', 'm': 'sc-m',
    'put': 'sc-p', 'p': 'sc-p', 'eliminate': 'sc-e', 'e': 'sc-e',
    'reverse': 'sc-r', 'r': 'sc-r', 'shortlist': 'sc-shortlist'
};
const DEVILS_TAG_MAP = {
    'idea': 'da-idea', 'objection': 'da-objections', 'attack': 'da-objections',
    'defended': 'da-defended', 'deflected': 'da-deflected',
    'exposed': 'da-exposed', 'danger': 'da-danger'
};
const RAPID_TAG_MAP = {
    'assumption': 're-assumptions', 'assumptions': 're-assumptions',
    'matrix': 're-matrix', 'risk-matrix': 're-matrix',
    'top-risk': 're-top-risk', 'riskiest': 're-top-risk',
    'hypothesis': 're-hypothesis',
    'method': 're-method', 'sample': 're-sample',
    'metric': 're-metric', 'timeline': 're-timeline'
};
const SOCRATIC_TAG_MAP = {
    'verified': 'sq-verified', 'tested': 'sq-verified',
    'assumed': 'sq-assumed', 'untested': 'sq-assumed',
    'inherited': 'sq-inherited',
    'critical': 'sq-critical', 'critical-assumption': 'sq-critical'
};
const REALITY_TAG_MAP = {
    'context': 'rc-context', 'idea': 'rc-context',
    'value': 'rc-value', 'value-rating': 'rc-value-rating',
    'usability': 'rc-usability', 'usability-rating': 'rc-usability-rating',
    'feasibility': 'rc-feasibility', 'feasibility-rating': 'rc-feasibility-rating',
    'viability': 'rc-viability', 'viability-rating': 'rc-viability-rating',
    'overall': 'rc-overall'
};
const TOC_TAG_MAP = {
    'outcome': 'toc-outcome', 'control': 'toc-control', 'influence': 'toc-influence',
    'outside': 'toc-outside', 'external': 'toc-outside',
    'activity': 'toc-activities', 'weakest': 'toc-weakest'
};
const TRADEOFF_TAG_MAP = {
    'feature': 'to-features', 'round': 'to-rounds', 'tally': 'to-tally',
    'must-have': 'to-musthave', 'nice-to-have': 'to-nicetohave',
    'expendable': 'to-expendable', 'surprise': 'to-surprise',
    'mvo': 'to-mvo', 'minimum-viable': 'to-mvo'
};
const ICEBERG_TAG_MAP = {
    'event': 'ice-event', 'pattern': 'ice-patterns', 'patterns': 'ice-patterns',
    'structure': 'ice-structures', 'structures': 'ice-structures',
    'mental-model': 'ice-mental', 'belief': 'ice-mental',
    'leverage': 'ice-leverage'
};
const CONSTRAINT_TAG_MAP = {
    'constraint': 'cf-constraint', 'limitation': 'cf-constraint',
    'flip': 'cf-flip', 'advantage': 'cf-flip',
    'idea': 'cf-ideas', 'moat': 'cf-moat'
};
const CUSTOMER_DISCOVERY_TAG_MAP = {
    'persona': 'co-persona', 'customer': 'co-persona',
    'exchange': 'co-exchanges', 'interview': 'co-exchanges',
    'score-open': 'co-open', 'open': 'co-open',
    'score-followup': 'co-followup', 'followup': 'co-followup', 'follow-up': 'co-followup',
    'score-silence': 'co-silence', 'silence': 'co-silence',
    'score-signals': 'co-signals', 'signals': 'co-signals',
    'score-pitch': 'co-pitch', 'pitch': 'co-pitch',
    'insight': 'co-insight'
};
// Mash Up / Analogical Thinking tag mapping
const MASHUP_TAG_MAP = {
    'problem': 'mu-problem', 'abstract': 'mu-abstract',
    'collision-1': 'mu-collision-1', 'collision-2': 'mu-collision-2',
    'collision-3': 'mu-collision-3', 'collision-4': 'mu-collision-4',
    'remix': 'mu-remix', 'remixed': 'mu-remix',
    'actions': 'mu-actions', 'action': 'mu-actions'
};

var TOOL_TAG_MAPS = {
    'five-whys': FIVE_WHYS_TAG_MAP, 'empathy-map': EMPATHY_TAG_MAP,
    'jtbd': JTBD_TAG_MAP_TOOL, 'crazy-8s': CRAZY8S_TAG_MAP,
    'hmw': HMW_TAG_MAP, 'scamper': SCAMPER_TAG_MAP,
    'devils-advocate': DEVILS_TAG_MAP, 'rapid-experiment': RAPID_TAG_MAP,
    'socratic': SOCRATIC_TAG_MAP, 'reality-check': REALITY_TAG_MAP,
    'theory-of-change': TOC_TAG_MAP, 'trade-off': TRADEOFF_TAG_MAP,
    'iceberg': ICEBERG_TAG_MAP, 'constraint-flip': CONSTRAINT_TAG_MAP,
    'customer-discovery': CUSTOMER_DISCOVERY_TAG_MAP,
    'mash-up': MASHUP_TAG_MAP, 'analogical': MASHUP_TAG_MAP
};

// Effectuation principle tag mapping
const EFF_TAG_MAP = {
    'means': 'eff-means', 'bird-in-hand': 'eff-means',
    'loss': 'eff-loss', 'affordable-loss': 'eff-loss',
    'quilt': 'eff-quilt', 'crazy-quilt': 'eff-quilt',
    'lemonade': 'eff-lemonade',
    'pilot': 'eff-pilot', 'pilot-in-the-plane': 'eff-pilot',
    'action': 'eff-action', 'first-move': 'eff-action'
};

// Flywheel component tag mapping
const FLYWHEEL_TAG_MAP = {
    'component-1': 'fw-component-1', 'component-2': 'fw-component-2',
    'component-3': 'fw-component-3', 'component-4': 'fw-component-4',
    'bottleneck': 'fw-bottleneck'
};

function switchBoardLayout(mode) {
    const layout = BOARD_LAYOUTS[mode] || BOARD_LAYOUTS['default'];
    state.boardMode = mode;
    // Toggle lean-canvas layout class for wider board
    const workshopLayout = document.getElementById('workshopLayout');
    if (workshopLayout) workshopLayout.classList.toggle('board-lean-canvas', mode === 'lean-canvas');
    const zonesContainer = document.getElementById('boardZones');
    if (!zonesContainer) return;

    // Rebuild zone HTML
    zonesContainer.className = 'board-zones ' + layout.gridClass;
    zonesContainer.innerHTML = layout.zones.map(z => `
        <div class="board-zone" data-zone="${z.id}"${z.colour ? ` data-colour="${z.colour}"` : ''}>
            <div class="zone-header"><span class="zone-name">${z.name}</span><span class="zone-count" data-zone="${z.id}" style="display:none">0</span></div>
            ${z.hint ? `<div class="zone-hint">${z.hint}</div>` : ''}
            <div class="zone-cards" data-zone="${z.id}"></div>
            <div class="zone-empty">${z.empty}</div>
        </div>
    `).join('');

    // Re-attach drag handlers
    initBoardDragDrop();

    // Re-render any existing cards that match new zones
    state.board.cards.forEach(card => {
        const zoneEl = document.querySelector(`.zone-cards[data-zone="${card.zone}"]`);
        if (zoneEl) renderBoardCard(card);
    });
    updateBoardCounts();
    // SVG canvas toggle removed — HTML boards only
}

// === TRADE-OFF BUNDLE CARDS ===
// Renders side-by-side comparison cards for Trade-Off rounds
// Format: Round title|Name A|feat1=val1,feat2=val2,Price=$X|Name B|feat1=val1,feat2=val2,Price=$X
function renderBundleCards(bundleStr, container) {
    const parts = bundleStr.split('|').map(s => s.trim());
    if (parts.length < 5) return; // Need: title, nameA, featuresA, nameB, featuresB
    const [roundTitle, nameA, featStrA, nameB, featStrB] = parts;

    const parseFeatures = (str) => str.split(',').map(f => {
        const [key, val] = f.split('=').map(s => s.trim());
        return { key, val: val || key };
    });

    const featuresA = parseFeatures(featStrA);
    const featuresB = parseFeatures(featStrB);

    // Build a map of which features differ between the two cards
    const diffSet = new Set();
    const mapB = {};
    featuresB.forEach(f => { mapB[f.key.toLowerCase()] = f.val; });
    featuresA.forEach(f => {
        const bVal = mapB[f.key.toLowerCase()];
        if (bVal && bVal !== f.val) diffSet.add(f.key.toLowerCase());
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'bundle-round';

    const title = document.createElement('div');
    title.className = 'bundle-round-title';
    title.textContent = roundTitle;
    wrapper.appendChild(title);

    const cardRow = document.createElement('div');
    cardRow.className = 'bundle-card-row';

    function buildCard(name, features, side) {
        const card = document.createElement('div');
        card.className = 'bundle-card';
        card.dataset.side = side;

        const header = document.createElement('div');
        header.className = 'bundle-card-header';
        header.textContent = name;
        card.appendChild(header);

        const body = document.createElement('div');
        body.className = 'bundle-card-body';
        features.forEach((f, i) => {
            const isPrice = f.key.toLowerCase().startsWith('price');
            const isDiff = diffSet.has(f.key.toLowerCase());
            const row = document.createElement('div');
            row.className = 'bundle-feature-row'
                + (isPrice ? ' bundle-price-row' : '')
                + (i % 2 === 1 && !isPrice ? ' bundle-row-alt' : '')
                + (isDiff && !isPrice ? ' bundle-row-diff' : '');
            row.innerHTML = `<span class="bundle-feature-name">${f.key}</span><span class="bundle-feature-val">${f.val}</span>`;
            body.appendChild(row);
        });
        card.appendChild(body);

        // Click to choose
        card.addEventListener('click', () => {
            if (card.classList.contains('bundle-chosen') || card.classList.contains('bundle-rejected')) return;
            card.classList.add('bundle-chosen');
            const other = cardRow.querySelector(`.bundle-card:not([data-side="${side}"])`);
            if (other) other.classList.add('bundle-rejected');
            // Send the choice as a message
            sendMessage(`I'd choose ${name}.`);
        });

        return card;
    }

    const cardA = buildCard(nameA, featuresA, 'a');
    const vs = document.createElement('div');
    vs.className = 'bundle-vs';
    vs.textContent = 'vs';
    const cardB = buildCard(nameB, featuresB, 'b');

    cardRow.appendChild(cardA);
    cardRow.appendChild(vs);
    cardRow.appendChild(cardB);
    wrapper.appendChild(cardRow);

    container.appendChild(wrapper);
    scrollToBottom();

    // Hesitation nudge: if user hasn't chosen after 15s, show a gentle prompt
    const nudgeTimer = setTimeout(() => {
        if (wrapper.querySelector('.bundle-chosen')) return; // already chose
        const nudge = document.createElement('div');
        nudge.className = 'bundle-nudge';
        nudge.textContent = 'Gut reaction. Don\u2019t overthink it.';
        wrapper.appendChild(nudge);
    }, 15000);
    // Clear timer if user clicks a card
    wrapper.addEventListener('click', () => clearTimeout(nudgeTimer), { once: true });
}

function addBoardCard(text, zone, stage, source) {
    // Deduplicate: skip if a very similar card already exists (any zone)
    const normalise = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const newNorm = normalise(text);
    const newWords = new Set(text.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const isDupe = state.board.cards.some(c => {
        const existNorm = normalise(c.text);
        // Exact match after normalisation
        if (existNorm === newNorm) return true;
        // One contains the other (catches "LinkedIn outbound" vs "LinkedIn outbound campaign")
        if (existNorm.includes(newNorm) || newNorm.includes(existNorm)) return true;
        // Word overlap similarity — 60% threshold catches most near-duplicates
        const existWords = new Set(c.text.toLowerCase().split(/\s+/).filter(w => w.length > 2));
        if (newWords.size === 0 || existWords.size === 0) return false;
        const overlap = [...newWords].filter(w => existWords.has(w)).length;
        const similarity = overlap / Math.min(newWords.size, existWords.size);
        return similarity >= 0.6;
    });
    if (isDupe) return null;

    const card = {
        id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        text: text,
        zone: zone,        // 'insights' | 'ideas' | 'parking' | 'actions'
        stage: stage || state.mode || 'untangle',
        source: source || EXERCISE_LABELS[state.exercise] || state.exercise || 'session',
        timestamp: Date.now()
    };
    const isFirst = state.board.cards.length === 0;
    state.board.cards.push(card);
    renderBoardCard(card);
    updateBoardCounts();
    saveSession();

    // Auto-open board on first card addition
    if (isFirst && !state.board.visible) {
        toggleBoard();
    }

    // Board nudge — one-time inline message on first card
    if (isFirst && typeof showBoardNudge === 'function') {
        showBoardNudge();
    }

    return card;
}

function removeBoardCard(cardId) {
    const card = state.board.cards.find(c => c.id === cardId);
    state.board.cards = state.board.cards.filter(c => c.id !== cardId);
    const el = document.querySelector(`.board-card[data-card-id="${cardId}"]`);
    if (el) el.remove();
    // Show hint again if zone is now empty
    if (card) {
        const zoneCards = document.querySelector(`.zone-cards[data-zone="${card.zone}"]`);
        if (zoneCards && !zoneCards.children.length) {
            const hint = zoneCards.closest('.board-zone')?.querySelector('.zone-hint');
            if (hint) hint.style.display = '';
        }
        // Notify Pete that the user removed a card — inject as a system-like user message
        if (card.zone && card.text) {
            const zoneName = card.zone.replace(/-/g, ' ');
            const msg = `[I just removed "${card.text}" from the ${zoneName} block on the canvas. I'm not sure about that one.]`;
            state.messages.push({ role: 'user', content: msg });
            appendMessage(msg, 'user');
            streamResponse();
        }
    }
    updateBoardCounts();
    saveSession();
}

function moveBoardCard(cardId, toZone) {
    const card = state.board.cards.find(c => c.id === cardId);
    if (!card || card.zone === toZone) return;
    // Remove from old zone DOM
    const el = document.querySelector(`.board-card[data-card-id="${cardId}"]`);
    if (el) el.remove();
    card.zone = toZone;
    // Add to new zone DOM
    renderBoardCard(card);
    updateBoardCounts();
    saveSession();
}

function renderBoardCard(card) {
    const zoneEl = document.querySelector(`.zone-cards[data-zone="${card.zone}"]`);
    if (!zoneEl) return;
    const div = document.createElement('div');
    div.className = 'board-card';
    div.draggable = true;
    div.dataset.cardId = card.id;
    div.dataset.stage = card.stage;
    div.innerHTML = `
        <div class="board-card-text">${card.text}</div>
        <div class="board-card-meta">
            <span class="board-card-source">${card.source}</span>
            <button class="board-card-edit-btn" title="Edit">✎</button>
            <button class="board-card-delete" title="Remove">✕</button>
        </div>
    `;
    // Delete handler
    div.querySelector('.board-card-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        removeBoardCard(card.id);
    });

    // Inline edit helper
    function startEdit() {
        const textEl = div.querySelector('.board-card-text');
        if (!textEl || textEl.querySelector('textarea')) return;
        const current = card.text;
        const ta = document.createElement('textarea');
        ta.className = 'board-card-edit';
        ta.value = current;
        ta.rows = 2;
        textEl.innerHTML = '';
        textEl.appendChild(ta);
        ta.focus();
        ta.select();
        div.draggable = false;
        const save = () => {
            const newText = ta.value.trim();
            if (newText && newText !== current) {
                card.text = newText;
                saveSession();
            }
            textEl.textContent = card.text;
            div.draggable = true;
        };
        ta.addEventListener('blur', save);
        ta.addEventListener('keydown', (ke) => {
            if (ke.key === 'Enter' && !ke.shiftKey) { ke.preventDefault(); ta.blur(); }
            if (ke.key === 'Escape') { ta.value = current; ta.blur(); }
        });
    }
    // Edit button click
    div.querySelector('.board-card-edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        startEdit();
    });
    // Click on card text to edit
    div.querySelector('.board-card-text').addEventListener('click', (e) => {
        e.stopPropagation();
        startEdit();
    });
    // Drag handlers
    div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.id);
        e.dataTransfer.effectAllowed = 'move';
        div.classList.add('dragging');
    });
    div.addEventListener('dragend', () => {
        div.classList.remove('dragging');
    });
    zoneEl.appendChild(div);
    // Hide hint when zone has cards
    const hint = zoneEl.closest('.board-zone')?.querySelector('.zone-hint');
    if (hint) hint.style.display = 'none';
}

function renderBoard() {
    // Clear all zone card containers
    document.querySelectorAll('.zone-cards').forEach(z => z.innerHTML = '');
    // Re-render all cards
    state.board.cards.forEach(card => renderBoardCard(card));
    updateBoardCounts();
}

function updateBoardCounts() {
    const layout = BOARD_LAYOUTS[state.boardMode] || BOARD_LAYOUTS['default'];
    const zones = layout.zones.map(z => z.id);
    let total = 0;
    zones.forEach(zone => {
        const count = state.board.cards.filter(c => c.zone === zone).length;
        total += count;
        const countEl = document.querySelector(`.zone-count[data-zone="${zone}"]`);
        if (countEl) { countEl.textContent = count; countEl.style.display = count > 0 ? '' : 'none'; }
    });
    const boardCountEl = document.getElementById('boardCount');
    if (boardCountEl) {
        boardCountEl.textContent = total;
        boardCountEl.classList.toggle('hidden', total === 0);
    }
}

// Build a standalone HTML board for the post-session reveal screen
function buildPostSessionBoard(exercise, cards) {
    if (!cards || cards.length === 0) return '';
    const layout = BOARD_LAYOUTS[exercise] || BOARD_LAYOUTS['default'];
    if (!layout) return '';

    // Group cards by zone
    const grouped = {};
    cards.forEach(c => {
        if (!grouped[c.zone]) grouped[c.zone] = [];
        grouped[c.zone].push(c);
    });

    // Build HTML grid matching the board layout
    let zonesHtml = '';
    layout.zones.forEach(zone => {
        const zoneCards = grouped[zone.id] || [];
        const cardsHtml = zoneCards.map(c =>
            `<div class="ps-board-card">${c.text || ''}</div>`
        ).join('');
        const emptyHtml = zoneCards.length === 0
            ? `<div class="ps-board-empty">${zone.empty || ''}</div>` : '';

        zonesHtml += `<div class="ps-board-zone" data-zone="${zone.id}">
            <div class="ps-board-zone-label">${zone.name}</div>
            ${cardsHtml}${emptyHtml}
        </div>`;
    });

    const exerciseName = EXERCISE_LABELS[exercise] || exercise;
    const modeName = Object.keys(MODE_LABELS).find(k =>
        (TOOLS_BY_MODE[k] || []).includes(exercise)
    );
    const stageLabel = modeName ? MODE_LABELS[modeName] : '';

    return `<div class="ps-board" data-mode="${modeName || ''}">
        <div class="ps-board-header">
            <span class="ps-board-title">WORKSHOP BOARD</span>
            <span class="ps-board-meta">${stageLabel} · ${exerciseName}</span>
        </div>
        <div class="ps-board-grid ${layout.gridClass || ''}">${zonesHtml}</div>
    </div>`;
}

function toggleBoard() {
    const layout = document.getElementById('workshopLayout');
    const boardPane = document.getElementById('boardPane');
    const toggleBtn = document.getElementById('boardToggle');
    if (!layout || !boardPane) return;
    state.board.visible = !state.board.visible;
    if (state.board.visible) {
        layout.classList.add('board-active');
        boardPane.classList.remove('hidden');
        toggleBtn?.classList.add('active');
        document.body.classList.add('board-open');
        renderBoard();
    } else {
        layout.classList.remove('board-active');
        layout.style.gridTemplateColumns = '';
        boardPane.classList.add('hidden');
        toggleBtn?.classList.remove('active');
        document.body.classList.remove('board-open');
    }
}

// Board drag-and-drop zone handlers — extracted so switchBoardLayout can re-attach
function initBoardDragDrop() {
    document.querySelectorAll('.zone-cards').forEach(zoneEl => {
        const zone = zoneEl.dataset.zone;
        zoneEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            zoneEl.closest('.board-zone')?.classList.add('drag-over');
        });
        zoneEl.addEventListener('dragleave', (e) => {
            if (!zoneEl.contains(e.relatedTarget)) {
                zoneEl.closest('.board-zone')?.classList.remove('drag-over');
            }
        });
        zoneEl.addEventListener('drop', (e) => {
            e.preventDefault();
            zoneEl.closest('.board-zone')?.classList.remove('drag-over');
            const cardId = e.dataTransfer.getData('text/plain');
            if (cardId) moveBoardCard(cardId, zone);
        });
    });
    // Allow drag to parking lot panel
    const parkingPanel = document.getElementById('parkingLotItems');
    if (parkingPanel) {
        parkingPanel.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            parkingPanel.closest('.parking-lot-panel')?.classList.add('drag-over');
        });
        parkingPanel.addEventListener('dragleave', (e) => {
            if (!parkingPanel.contains(e.relatedTarget)) {
                parkingPanel.closest('.parking-lot-panel')?.classList.remove('drag-over');
            }
        });
        parkingPanel.addEventListener('drop', (e) => {
            e.preventDefault();
            parkingPanel.closest('.parking-lot-panel')?.classList.remove('drag-over');
            const cardId = e.dataTransfer.getData('text/plain');
            if (cardId) {
                const card = state.board.cards.find(c => c.id === cardId);
                if (card) {
                    // Move to parking lot
                    state.parkingLot.push({ text: card.text, fromExercise: card.source || 'session', timestamp: Date.now() });
                    removeBoardCard(cardId);
                    renderParkingLot();
                    saveSession();
                }
            }
        });
    }

    document.querySelectorAll('.board-zone').forEach(zoneDiv => {
        const zone = zoneDiv.dataset.zone;
        zoneDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            zoneDiv.classList.add('drag-over');
        });
        zoneDiv.addEventListener('dragleave', (e) => {
            if (!zoneDiv.contains(e.relatedTarget)) {
                zoneDiv.classList.remove('drag-over');
            }
        });
        zoneDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            zoneDiv.classList.remove('drag-over');
            const cardId = e.dataTransfer.getData('text/plain');
            if (cardId) moveBoardCard(cardId, zone);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Board toggle
    const boardToggleBtn = document.getElementById('boardToggle');
    if (boardToggleBtn) boardToggleBtn.addEventListener('click', toggleBoard);

    // Board close button
    const boardCloseBtn = document.getElementById('boardCloseBtn');
    if (boardCloseBtn) boardCloseBtn.addEventListener('click', () => {
        if (state.board.visible) toggleBoard();
    });

    // Board maximise button
    const boardMaxBtn = document.getElementById('boardMaxBtn');
    if (boardMaxBtn) boardMaxBtn.addEventListener('click', () => {
        const layout = document.getElementById('workshopLayout');
        if (!layout) return;
        const isMax = layout.classList.toggle('board-maximised');
        document.body.classList.toggle('board-maximised', isMax);
        boardMaxBtn.textContent = isMax ? '⛶' : '⛶';
        boardMaxBtn.title = isMax ? 'Restore board' : 'Maximise board';
    });

    // Board resize handle
    const resizeHandle = document.getElementById('boardResizeHandle');
    if (resizeHandle) {
        let startX = 0, startChatWidth = 0, layoutWidth = 0;
        const onMouseMove = (e) => {
            const dx = e.clientX - startX;
            const chatFr = Math.max(0.2, Math.min(0.8, (startChatWidth + dx) / layoutWidth));
            const boardFr = 1 - chatFr;
            const layout = document.getElementById('workshopLayout');
            if (layout) layout.style.gridTemplateColumns = `${chatFr}fr 6px ${boardFr}fr`;
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.classList.remove('board-resizing');
            resizeHandle.classList.remove('dragging');
        };
        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const layout = document.getElementById('workshopLayout');
            if (!layout) return;
            const chatPane = document.getElementById('chatPane');
            if (!chatPane) return;
            startX = e.clientX;
            startChatWidth = chatPane.getBoundingClientRect().width;
            layoutWidth = layout.getBoundingClientRect().width;
            document.body.classList.add('board-resizing');
            resizeHandle.classList.add('dragging');
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    // Init drag-drop on default zones
    initBoardDragDrop();

    // Add card button
    const addCardBtn = document.getElementById('boardAddCard');
    if (addCardBtn) {
        addCardBtn.addEventListener('click', () => {
            const existing = document.querySelector('.board-add-inline');
            if (existing) { existing.querySelector('input')?.focus(); return; }
            const layout = BOARD_LAYOUTS[state.boardMode] || BOARD_LAYOUTS['default'];
            const options = layout.zones.map(z => `<option value="${z.id}">${z.name}</option>`).join('');
            const row = document.createElement('div');
            row.className = 'board-add-inline';
            row.innerHTML = `
                <input type="text" placeholder="Type your card...">
                <select>${options}</select>
                <button>Add</button>
            `;
            addCardBtn.parentElement.after(row);
            const input = row.querySelector('input');
            const select = row.querySelector('select');
            const saveBtn = row.querySelector('button');
            input.focus();
            const doAdd = () => {
                const text = input.value.trim();
                if (text) {
                    addBoardCard(text, select.value, state.mode, 'Manual');
                }
                row.remove();
            };
            saveBtn.addEventListener('click', doAdd);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); doAdd(); }
                if (e.key === 'Escape') row.remove();
            });
        });
    }

    // Consolidate button — AI merge duplicates
    const consolidateBtn = document.getElementById('boardConsolidate');
    if (consolidateBtn) {
        consolidateBtn.addEventListener('click', async () => {
            const cards = state.board.cards;
            if (cards.length < 3) {
                consolidateBtn.textContent = 'Not enough cards';
                setTimeout(() => { consolidateBtn.textContent = '✦ Consolidate'; }, 2000);
                return;
            }

            consolidateBtn.disabled = true;
            consolidateBtn.textContent = '✦ Consolidating...';
            consolidateBtn.classList.add('consolidating');

            try {
                const res = await fetch('/api/consolidate-board', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cards })
                });
                const data = await res.json();

                if (data.error) {
                    consolidateBtn.textContent = 'Error — try again';
                    consolidateBtn.disabled = false;
                    consolidateBtn.classList.remove('consolidating');
                    setTimeout(() => { consolidateBtn.textContent = '✦ Consolidate'; }, 3000);
                    return;
                }

                // Replace board cards with consolidated versions
                // Keep the same stage/source metadata, generate new IDs
                const newCards = data.cards.map(c => ({
                    id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                    text: c.text,
                    zone: c.zone,
                    stage: state.mode || 'untangle',
                    source: EXERCISE_LABELS[state.exercise] || state.exercise || 'session',
                    timestamp: Date.now()
                }));

                state.board.cards = newCards;
                renderBoard();
                saveSession();

                const reduced = data.original_count - data.new_count;
                consolidateBtn.textContent = `✦ ${data.new_count} cards (was ${data.original_count})`;
                consolidateBtn.classList.remove('consolidating');
                setTimeout(() => {
                    consolidateBtn.textContent = '✦ Consolidate';
                    consolidateBtn.disabled = false;
                }, 4000);

            } catch (err) {
                consolidateBtn.textContent = '✦ Consolidate';
                consolidateBtn.disabled = false;
                consolidateBtn.classList.remove('consolidating');
            }
        });
    }
});

// === PARKING LOT ===

function updateParkingLot() {
    const countEl = $('#parkingLotCount');
    const itemsEl = $('#parkingLotItems');
    if (!countEl || !itemsEl) return;

    const count = state.parkingLot.length;
    countEl.textContent = count;
    countEl.classList.toggle('hidden', count === 0);

    itemsEl.innerHTML = '';
    state.parkingLot.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'parking-lot-item';
        div.innerHTML = `
            <div class="parking-lot-item-text">${item.text}</div>
            <div class="parking-lot-item-from">${item.fromExercise}</div>
            <button class="parking-lot-item-delete" data-index="${i}" title="Remove">✕</button>
        `;
        div.querySelector('.parking-lot-item-delete').addEventListener('click', () => {
            state.parkingLot.splice(i, 1);
            updateParkingLot();
            saveSession();
        });
        itemsEl.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const toggle = $('#parkingLotToggle');
    const panel = $('#parkingLotPanel');
    const closeBtn = $('#parkingLotClose');
    const addBtn = $('#parkingLotAdd');

    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
        panel.classList.toggle('hidden');
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.classList.add('hidden');
        });
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const existing = panel.querySelector('.parking-lot-add-input');
            if (existing) { existing.querySelector('input').focus(); return; }

            const row = document.createElement('div');
            row.className = 'parking-lot-add-input';
            row.innerHTML = `
                <input type="text" placeholder="Park an idea..." class="parking-lot-input">
                <button class="parking-lot-input-save">Add</button>
            `;
            addBtn.before(row);
            const input = row.querySelector('input');
            const saveBtn = row.querySelector('.parking-lot-input-save');
            input.focus();

            const doAdd = () => {
                const text = input.value.trim();
                if (text) {
                    state.parkingLot.push({
                        text,
                        fromExercise: EXERCISE_LABELS[state.exercise] || state.exercise || 'manual',
                        timestamp: Date.now()
                    });
                    updateParkingLot();
                    saveSession();
                }
                row.remove();
            };

            saveBtn.addEventListener('click', doAdd);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); doAdd(); }
                if (e.key === 'Escape') row.remove();
            });
        });
    }

    updateParkingLot();
});

// === PAGE LOAD INIT ===
// Place input box inside welcome (between tagline and cards) on initial load
moveInputToWelcome();

// === URL QUICK-START (?exercise=empathy-map) ===

(function checkUrlParams() {
    try {
        const params = new URLSearchParams(window.location.search);
        const exerciseKey = params.get('exercise');
        if (exerciseKey && EXERCISE_MODE[exerciseKey]) {
            const mode = EXERCISE_MODE[exerciseKey];
            setTimeout(() => startExercise(mode, exerciseKey), 150);
        }
    } catch(e) {}
})();

// === ENSURE REPORT UI IS HIDDEN ON PAGE LOAD ===
// Prevents stale synopsis from previous session showing on welcome page
(function() {
    document.getElementById('reportSynopsis')?.classList.add('hidden');
    document.getElementById('reportFormatChoice')?.classList.add('hidden');
    document.getElementById('reportCard')?.classList.add('hidden');
    document.getElementById('reportUnlock')?.classList.add('hidden');
})();

// === RESUME SAVED SESSION ===

(function checkSavedSession() {
    try {
        const session = JSON.parse(localStorage.getItem('studio_session'));
        if (!session?.mode || !session.messages?.length) return;
        const banner = $('#resumeBanner');
        $('#resumeLabel').textContent = EXERCISE_LABELS[session.exercise] || session.exercise;
        banner.classList.remove('hidden');
        $('#resumeBtn').addEventListener('click', () => {
            banner.classList.add('hidden');
            restoreSession(session);
        });
        $('#resumeDismiss').addEventListener('click', () => {
            banner.classList.add('hidden');
            clearSession();
        });
    } catch(e) {
        clearSession();
    }
})();

// === MARKDOWN RENDERER (lightweight) ===

function renderMarkdown(text) {
    let html = text
        // Fix broken Unicode escapes from AI output
        .replace(/\\u([\da-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\x([\da-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links (both absolute and relative URLs)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Unordered lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Paragraphs (double newline)
    html = html.replace(/\n\n/g, '</p><p>');

    // Single newlines inside paragraphs
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph if not starting with a block element
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol')) {
        html = '<p>' + html + '</p>';
    }

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p><(h[23]|ul|ol)/g, '<$1');
    html = html.replace(/<\/(h[23]|ul|ol)><\/p>/g, '</$1>');

    return html;
}

// === PITCH PREVIEW ===

function updatePitchPreview() {
    const preview = document.getElementById('pitchPreview');
    if (!preview) return;
    // Show preview when any pitch component is set
    const hasAny = Object.values(state.pitch).some(v => v);
    if (hasAny) preview.classList.remove('hidden');

    // Update slots
    ['customer', 'problem', 'solution', 'benefit', 'differentiator'].forEach(key => {
        const slot = preview.querySelector(`.pitch-slot[data-slot="${key}"]`);
        if (slot) {
            if (state.pitch[key]) {
                slot.textContent = state.pitch[key];
                slot.classList.add('filled');
            } else {
                slot.textContent = '___';
                slot.classList.remove('filled');
            }
        }
    });

    // Update progress dots
    const dots = document.querySelectorAll('.pitch-progress-dot');
    const components = ['customer', 'problem', 'solution', 'benefit', 'differentiator'];
    dots.forEach((dot, i) => {
        dot.classList.toggle('filled', !!state.pitch[components[i]]);
    });
}

// Canvas handoff — carry pitch components into Lean Canvas
function pitchToCanvas() {
    const mapping = {
        customer: 'segments',
        problem: 'problem',
        solution: 'solution',
        benefit: 'uvp',
        differentiator: 'unfair'
    };
    Object.entries(mapping).forEach(([pitchKey, canvasZone]) => {
        if (state.pitch[pitchKey]) {
            addBoardCard(state.pitch[pitchKey], canvasZone, 'build', 'Elevator Pitch');
        }
    });
}

// Pitch preview toggle
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('pitchPreviewToggle');
    const preview = document.getElementById('pitchPreview');
    if (toggleBtn && preview) {
        toggleBtn.addEventListener('click', () => {
            preview.classList.toggle('collapsed');
            toggleBtn.textContent = preview.classList.contains('collapsed') ? '+' : '-';
        });
    }
});

// === TEXT SIZE CONTROL ===
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('textSizeToggle');
    const picker = document.getElementById('textSizePicker');
    if (!toggle || !picker) return;

    // Restore saved size
    const saved = localStorage.getItem('studio_text_size') || 'medium';
    applyTextSize(saved);

    toggle.addEventListener('click', () => {
        picker.classList.toggle('hidden');
    });

    picker.querySelectorAll('.text-size-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.dataset.size;
            applyTextSize(size);
            localStorage.setItem('studio_text_size', size);
            picker.classList.add('hidden');
        });
    });

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.text-size-control')) {
            picker.classList.add('hidden');
        }
    });

    function applyTextSize(size) {
        document.body.classList.remove('text-small', 'text-large');
        if (size === 'small') document.body.classList.add('text-small');
        if (size === 'large') document.body.classList.add('text-large');
        picker.querySelectorAll('.text-size-option').forEach(b => {
            b.classList.toggle('active', b.dataset.size === size);
        });
    }
});

// === SESSION ACTIONS: Save, Canvas, Report ===
document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveSessionBtn');
    const canvasBtn = document.getElementById('downloadCanvasBtn');
    const reportBtn = document.getElementById('getReportBtn');
    const overlay = document.getElementById('saveModalOverlay');
    const closeModal = document.getElementById('saveModalClose');
    const emailInput = document.getElementById('saveModalEmail');
    const submitBtn = document.getElementById('saveModalSubmit');
    const statusEl = document.getElementById('saveModalStatus');

    // Save session — open email modal
    if (saveBtn) saveBtn.addEventListener('click', () => {
        if (overlay) { overlay.classList.remove('hidden'); overlay.setAttribute('aria-hidden', 'false'); }
        if (emailInput) emailInput.focus();
    });

    // Save icon in session bar — also opens save modal
    const saveIcon = document.getElementById('sessionSaveIcon');
    if (saveIcon) saveIcon.addEventListener('click', () => {
        if (overlay) { overlay.classList.remove('hidden'); overlay.setAttribute('aria-hidden', 'false'); }
        if (emailInput) emailInput.focus();
    });

    // Close modal
    function closeSaveModal() {
        if (overlay) { overlay.classList.add('hidden'); overlay.setAttribute('aria-hidden', 'true'); }
    }
    if (closeModal) closeModal.addEventListener('click', closeSaveModal);
    if (overlay) overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeSaveModal();
    });

    // Submit save
    if (submitBtn) submitBtn.addEventListener('click', async () => {
        const email = emailInput?.value?.trim();
        if (!email) return;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        try {
            const res = await fetch('/api/session/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    device_id: state.deviceId,
                    session_db_id: _currentSessionDbId,
                    mode: state.mode,
                    exercise: state.exercise,
                    messages: state.messages,
                    exchangeCount: state.exchangeCount,
                    projectContext: state.projectContext,
                    parkingLot: state.parkingLot,
                    board: state.board,
                    boardMode: state.boardMode,
                    reportGenerated: state.reportGenerated,
                    reportText: state.reportText
                })
            });
            const data = await res.json();
            if (data.id) {
                if (statusEl) {
                    statusEl.textContent = 'Link sent! Check your inbox.';
                    statusEl.classList.remove('hidden');
                }
                setTimeout(() => { if (overlay) overlay.classList.add('hidden'); }, 2000);
            } else {
                if (statusEl) {
                    statusEl.textContent = data.error || 'Something went wrong';
                    statusEl.classList.remove('hidden');
                }
            }
        } catch (e) {
            if (statusEl) {
                statusEl.textContent = 'Failed to save. Try again.';
                statusEl.classList.remove('hidden');
            }
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send link';
    });

    // Download canvas
    if (canvasBtn) canvasBtn.addEventListener('click', async () => {
        if (!state.messages.length) return;
        canvasBtn.disabled = true;
        try {
            const res = await fetch('/api/canvas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: state.messages })
            });
            const data = await res.json();
            if (data.canvas_id) {
                window.open('/canvas/' + data.canvas_id, '_blank');
            }
        } catch (e) {
            console.error('Canvas export failed', e);
        }
        canvasBtn.disabled = false;
    });

    // Get report — trigger existing report flow without exchange gate
    if (reportBtn) reportBtn.addEventListener('click', () => {
        if (!state.messages.length) return;
        // Trigger the report card directly
        const reportCard = document.getElementById('reportCard');
        if (reportCard && typeof generateReport === 'function') {
            generateReport();
        }
    });

    // Resume session from magic link
    const params = new URLSearchParams(window.location.search);
    const resumeId = params.get('resume');
    if (resumeId) {
        fetch('/api/session/' + resumeId)
            .then(r => r.json())
            .then(session => {
                if (session.error) {
                    console.error('Session restore failed:', session.error);
                    return;
                }
                // Restore the session
                if (typeof restoreSession === 'function') {
                    restoreSession(session);
                }
                // Clean URL
                history.replaceState({}, '', '/');
            })
            .catch(e => console.error('Session restore failed', e));
    }

    // Direct tool launch from toolbox page (?tool=lean-canvas)
    const toolRaw = params.get('tool');
    const toolParam = TOOL_SLUG_MAP[toolRaw] || toolRaw;
    if (toolParam && EXERCISE_MODE[toolParam]) {
        const mode = EXERCISE_MODE[toolParam];
        history.replaceState({}, '', '/');
        startExercise(mode, toolParam);
        if (inputArea) inputArea.style.display = '';
        setTimeout(() => { if (inputArea) inputArea.style.display = ''; }, 500);
    }

    // Category launch from toolbox/homepage (?category=untangle)
    const categoryParam = params.get('category');
    if (categoryParam && CATEGORY_PROMPTS[categoryParam]) {
        history.replaceState({}, '', '/');
        startRouting(CATEGORY_PROMPTS[categoryParam]);
        document.body.classList.add('in-session');
        document.body.dataset.mode = 'routing';
        updateStageLogo('routing');
    }
});

// === GUIDED TOUR (10-step homepage tour) ===
const HOMEPAGE_TOUR_STEPS = [
    { el: '.lp-hero-lead', title: 'What The Studio Is', text: 'The Studio is an AI-powered innovation workshop. It\'s not a chatbot \u2014 it\'s a structured thinking partner that guides you through real frameworks used by founders, researchers, and teams.', pos: 'below' },
    { el: '#enterStudioBtn', title: 'How to Start', text: 'This is the quickest way in. No sign-up, no account, no cost. Just bring a challenge you\'re working on and Pete \u2014 your AI facilitator \u2014 will guide you through it.', pos: 'right' },
    { el: '.lp-cta-caption', title: 'What to Expect', text: 'A typical session takes 15\u201330 minutes. You\'ll work through a structured framework and leave with a downloadable report of everything you explored.', pos: 'below' },
    { el: '.lp-process-grid', title: 'Choose Your Challenge', text: 'Not sure where to start? Pick the challenge that sounds like yours. Each pathway leads to specific tools designed for that stage of your thinking.', pos: 'above' },
    { el: 'a.header-nav-link[href="toolbox.html"]', title: '20 Structured Tools', text: 'Behind each pathway are real innovation frameworks \u2014 Five Whys, Lean Canvas, Pre-Mortem, and 17 more. Browse them all in the Toolbox, or let Pete recommend one.', pos: 'below' },
    { el: '.lp-board-showcase', title: 'Your Ideas, Organised', text: 'As you talk with Pete, your insights get captured on a visual workshop board \u2014 structured cards for the framework you\'re using. It\'s not just a chat log. It\'s a working canvas.', pos: 'above' },
    { el: '.lp-report-preview', title: 'What You Walk Away With', text: 'At the end of every session, you get a structured report: what you explored, what emerged, recommended next steps, and further reading. It\'s yours to keep and share.', pos: 'above' },
    { el: '.lp-audience', title: 'Built for You', text: 'Whether you\'re a student exploring ideas, a founder stress-testing a plan, a researcher thinking about commercialisation, or a team running innovation sprints \u2014 Pete adapts to where you are.', pos: 'above' },
    { el: 'a.header-nav-link[href="sessions.html"]', title: 'Pick Up Where You Left Off', text: 'Your work saves automatically. Come back anytime and your sessions will be waiting. You can also get a link to access them from any device.', pos: 'below' },
    { el: '.text-size-control', title: 'Make It Yours', text: 'Adjust text size or switch between light and dark mode anytime. These controls are always available in the top bar.', pos: 'below' }
];

// In-session tour (shown when Help > Take the tour during a session)
const SESSION_TOUR_STEPS = [
    { el: '#sessionBreadcrumb', title: 'Your Current Tool', text: 'This shows which stage and tool you\'re using. Click the tool name to switch to a different one mid-session.', pos: 'below' },
    { el: '#boardToggle', title: 'Workshop Board', text: 'Open the Workshop Board to see your ideas, insights, and actions building up as you work.', pos: 'below' },
    { el: '#inputField', title: 'Talk to Pete', text: 'Type your responses here. Pete will guide you through the exercise one question at a time.', pos: 'above' },
    { el: '#saveSessionBtn', title: 'Save Your Work', text: 'Save your session any time. We\'ll email you a link to pick up exactly where you left off.', pos: 'below' },
    { el: '#helpMenuBtn', title: 'Get Help', text: 'Open the Help menu for shortcuts, tool info, or to replay this tour. Now let\'s get to work.', pos: 'below' }
];

let tourStep = 0;
let activeTourSteps = HOMEPAGE_TOUR_STEPS;
const tourOverlay = document.getElementById('tourOverlay');
const tourSpotlight = document.getElementById('tourSpotlight');
const tourTooltip = document.getElementById('tourTooltip');
const tourTitle = document.getElementById('tourTitle');
const tourText = document.getElementById('tourText');
const tourStepCount = document.getElementById('tourStepCount');
const tourDots = document.getElementById('tourDots');
const tourNext = document.getElementById('tourNext');
const tourPrev = document.getElementById('tourPrev');
const tourSkip = document.getElementById('tourSkip');

function startTour(steps) {
    if (!tourOverlay) return;
    // Close any open menus
    document.getElementById('helpMenuDropdown')?.classList.add('hidden');
    document.getElementById('helpMenuBtn')?.setAttribute('aria-expanded', 'false');
    activeTourSteps = steps || HOMEPAGE_TOUR_STEPS;

    // Determine which steps have visible targets
    const visibleSteps = activeTourSteps.filter(s => {
        const el = document.querySelector(s.el);
        return el && el.offsetParent !== null;
    });
    if (visibleSteps.length === 0) {
        // If on homepage with no visible steps (shouldn't happen), fall back to session tour
        if (steps !== SESSION_TOUR_STEPS) {
            startTour(SESSION_TOUR_STEPS);
        }
        return;
    }
    tourStep = 0;
    tourOverlay.classList.remove('hidden');
    tourOverlay.setAttribute('aria-hidden', 'false');
    showTourStep();
}

function getVisibleSteps() {
    return activeTourSteps.filter(s => {
        const el = document.querySelector(s.el);
        return el && el.offsetParent !== null;
    });
}

function showTourStep() {
    const visibleSteps = getVisibleSteps();
    if (tourStep >= visibleSteps.length) { endTour(); return; }
    if (tourStep < 0) tourStep = 0;
    const step = visibleSteps[tourStep];
    const target = document.querySelector(step.el);
    if (!target) { endTour(); return; }

    // Scroll target into view if needed
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
        const rect = target.getBoundingClientRect();
        const pad = 8;
        tourSpotlight.style.top = (rect.top - pad) + 'px';
        tourSpotlight.style.left = (rect.left - pad) + 'px';
        tourSpotlight.style.width = (rect.width + pad * 2) + 'px';
        tourSpotlight.style.height = (rect.height + pad * 2) + 'px';

        // Update content
        tourStepCount.textContent = (tourStep + 1) + ' of ' + visibleSteps.length;
        tourTitle.textContent = step.title;
        tourText.textContent = step.text;
        tourTooltip.setAttribute('aria-label', 'Tour step ' + (tourStep + 1) + ' of ' + visibleSteps.length + ': ' + step.title);

        // Progress dots
        tourDots.innerHTML = '';
        for (let i = 0; i < visibleSteps.length; i++) {
            const dot = document.createElement('span');
            dot.className = 'tour-dot' + (i <= tourStep ? ' filled' : '');
            tourDots.appendChild(dot);
        }

        // Button states
        const isLast = tourStep === visibleSteps.length - 1;
        tourNext.textContent = isLast ? 'Start exploring \u2192' : 'Next \u2192';
        if (tourPrev) {
            tourPrev.classList.toggle('hidden', tourStep === 0);
        }

        // Position tooltip
        const ttWidth = 340;
        let ttLeft, ttTop;

        if (step.pos === 'right') {
            ttLeft = Math.min(rect.right + 16, window.innerWidth - ttWidth - 16);
            ttTop = rect.top + rect.height / 2 - 60;
            tourTooltip.style.top = Math.max(16, ttTop) + 'px';
            tourTooltip.style.bottom = 'auto';
        } else if (step.pos === 'above') {
            ttLeft = rect.left + rect.width / 2 - ttWidth / 2;
            tourTooltip.style.top = 'auto';
            tourTooltip.style.bottom = (window.innerHeight - rect.top + 16) + 'px';
        } else {
            // below (default)
            ttLeft = rect.left + rect.width / 2 - ttWidth / 2;
            tourTooltip.style.top = (rect.bottom + 16) + 'px';
            tourTooltip.style.bottom = 'auto';
        }
        ttLeft = Math.max(16, Math.min(ttLeft, window.innerWidth - ttWidth - 16));
        tourTooltip.style.width = ttWidth + 'px';
        tourTooltip.style.left = ttLeft + 'px';

        // Focus the next button for keyboard users
        tourNext.focus();
    }, 350); // Wait for scroll
}

function endTour(showToast = true) {
    tourOverlay.classList.add('hidden');
    tourOverlay.setAttribute('aria-hidden', 'true');
    localStorage.setItem('studio_tour_completed', '1');
    // Also set legacy key for compat
    localStorage.setItem('wade_tour_seen', '1');
    if (showToast) {
        const toast = document.createElement('div');
        toast.className = 'tour-toast';
        toast.textContent = 'You can retake the tour anytime from the Help menu.';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
}

if (tourNext) tourNext.addEventListener('click', () => { tourStep++; showTourStep(); });
if (tourPrev) tourPrev.addEventListener('click', () => { tourStep--; showTourStep(); });
if (tourSkip) tourSkip.addEventListener('click', () => endTour());

// Keyboard: Escape dismisses tour/modals, arrow keys navigate tour
document.addEventListener('keydown', (e) => {
    if (tourOverlay && !tourOverlay.classList.contains('hidden')) {
        if (e.key === 'Escape') { endTour(); }
        else if (e.key === 'ArrowRight') { tourStep++; showTourStep(); }
        else if (e.key === 'ArrowLeft' && tourStep > 0) { tourStep--; showTourStep(); }
    }
});

// Clicking overlay (not tooltip) does nothing — intentional per spec

// Auto-trigger tour on first homepage visit
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('studio_tour_completed') && !localStorage.getItem('wade_tour_seen')) {
        const welcome = document.getElementById('welcome');
        if (welcome && !welcome.classList.contains('hidden')) {
            // First visit to homepage — start tour after a brief delay
            setTimeout(() => {
                const welcome2 = document.getElementById('welcome');
                if (welcome2 && !welcome2.classList.contains('hidden')) {
                    startTour(HOMEPAGE_TOUR_STEPS);
                }
            }, 1500);
        }
    }
});

// Legacy compat
let inSession = false;
function maybeStartTour() {
    inSession = true;
}

// === HELP MENU ===
(function() {
    const btn = document.getElementById('helpMenuBtn');
    const dropdown = document.getElementById('helpMenuDropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', () => {
        const isOpen = !dropdown.classList.contains('hidden');
        dropdown.classList.toggle('hidden');
        btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#helpMenuWrap')) {
            dropdown.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
        }
    });

    // Take the tour
    document.getElementById('helpTakeTour')?.addEventListener('click', () => {
        dropdown.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        // If in session, use session tour; otherwise homepage tour
        if (document.body.classList.contains('in-session')) {
            startTour(SESSION_TOUR_STEPS);
        } else {
            startTour(HOMEPAGE_TOUR_STEPS);
        }
    });

    // How it works — scroll to features section
    document.getElementById('helpHowItWorks')?.addEventListener('click', () => {
        dropdown.classList.add('hidden');
        const features = document.querySelector('.lp-features');
        if (features) features.scrollIntoView({ behavior: 'smooth' });
        else window.open('https://wadeinstitute.org.au', '_blank');
    });

})();

// === WHAT TO EXPECT CARD ===
const TOOL_DESCRIPTIONS = {
    'five-whys': { desc: 'Pete will guide you through a root cause analysis. You\'ll dig beneath the surface of a problem to find what\'s really driving it.', output: 'A structured board showing your problem breakdown, plus a report with insights and recommended next steps.' },
    'empathy-map': { desc: 'Pete will help you map what your customer or stakeholder thinks, feels, says, and does \u2014 to uncover hidden needs.', output: 'A completed empathy map and a report with key customer insights.' },
    'jtbd': { desc: 'Pete will help you discover the real job your customer is hiring your product to do.', output: 'A jobs-to-be-done analysis board and report with reframed value propositions.' },
    'socratic': { desc: 'Pete will challenge your assumptions with systematic questioning to uncover deeper truths.', output: 'A structured questioning board and report with key reframes.' },
    'iceberg': { desc: 'Pete will help you see the structures and mental models driving surface-level events.', output: 'An iceberg model board and report with systemic insights.' },
    'crazy-8s': { desc: 'Pete will push you to generate eight distinct ideas in rapid succession \u2014 quantity over quality.', output: 'A board of ranked ideas and a report with the most promising concepts.' },
    'hmw': { desc: 'Pete will help you reframe problems as opportunities using "How Might We" questions.', output: 'A set of reframed opportunity questions and a report with recommended next steps.' },
    'scamper': { desc: 'Pete will walk you through seven creative lenses to transform an existing idea or product.', output: 'A SCAMPER board and report with innovation directions.' },
    'mash-up': { desc: 'Pete will help you combine ideas from unrelated domains to spark novel solutions.', output: 'A collision board and report with remixed concepts.' },
    'constraint-flip': { desc: 'Pete will help you turn your biggest limitations into competitive advantages.', output: 'A constraints board and report with flipped strategies.' },
    'pre-mortem': { desc: 'Pete will help you imagine your plan has already failed and work backwards to find the risks.', output: 'A risk board and report with prioritised failure modes and mitigations.' },
    'devils-advocate': { desc: 'Pete becomes one of five adversaries — churned customer, confused user, tired engineer, sceptical investor, or fast follower — and attacks your idea from their risk angle.', output: 'An objection log with defence ratings, risk heatmap, and your biggest vulnerability identified.' },
    'customer-discovery': { desc: 'Pete becomes your target customer and you practise a discovery interview. He\'ll be evasive, polite, and drop hidden signals. Then he\'ll score your technique.', output: 'A persona card, interview technique scorecard, and signals-caught analysis.' },
    'reality-check': { desc: 'Pete will pressure-test your idea against all four product risks — value, usability, feasibility, and viability — and deliver a scorecard.', output: 'A four-risk scorecard and report identifying your biggest exposure.' },
    'trade-off': { desc: 'Pete will force you to choose between your own features. Each round requires a sacrifice. The features that survive every trade-off are your core value.', output: 'A feature value stack, side-by-side bundle comparison cards, and a Minimum Viable Offer.' },
    'lean-canvas': { desc: 'Pete will guide you through mapping your business model on a single page.', output: 'A completed Lean Canvas board and report with model analysis.' },
    'effectuation': { desc: 'Pete will help you start from what you have \u2014 your skills, connections, and resources \u2014 and build from there.', output: 'An effectuation board and report with your first moves.' },
    'rapid-experiment': { desc: 'Pete will surface your hidden assumptions, score them on confidence and consequence, then design the cheapest test for the riskiest one.', output: 'An assumption risk matrix, prioritised assumptions, and an experiment card for your top risk.' },
    'flywheel': { desc: 'Pete will help you find the reinforcing loops that make your growth compound.', output: 'A flywheel board and report with growth loop analysis.' },
    'theory-of-change': { desc: 'Pete will help you draw the causal chain from your activities to the impact you hope to create.', output: 'A theory of change board and report with your impact pathway.' }
};

// showExpectCard removed — activity-brief card is the single intro card

// Routing prompt pills removed — users type directly

// === BOARD NUDGE ===
let boardNudgeShown = false;
function showBoardNudge() {
    if (boardNudgeShown) return;
    boardNudgeShown = true;
    const messagesEl = document.getElementById('messages');
    if (!messagesEl) return;
    const nudge = document.createElement('div');
    nudge.className = 'board-nudge-msg';
    nudge.innerHTML = '\u2728 I\'ve started building your workshop board. You can open and close it anytime to see your thinking take shape using the toggle button in the menu.';
    messagesEl.appendChild(nudge);
    scrollToBottom();
}

// === QUICK-FIRE BUTTON INJECTION (backup for missed OPTIONS) ===
// Conversation-first: MutationObserver for quickfire removed.
// Pete uses [OPTIONS] tags inline when he wants to offer choices.
// The OPTIONS parser in streamResponse handles rendering.

// === FEATURE HINTS (one-time tooltips for new UI elements) ===
function showFeatureHint(targetSelector, text, hintKey) {
    const storageKey = 'wade_hint_' + hintKey;
    if (localStorage.getItem(storageKey)) return;
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const hint = document.createElement('div');
    hint.className = 'feature-hint';
    hint.innerHTML = '<span class="feature-hint-text">' + text + '</span><button class="feature-hint-dismiss">Got it</button>';

    const rect = target.getBoundingClientRect();
    hint.style.position = 'fixed';
    hint.style.top = (rect.bottom + 8) + 'px';
    hint.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 260)) + 'px';
    hint.style.zIndex = '9999';

    document.body.appendChild(hint);
    localStorage.setItem(storageKey, '1');

    const dismiss = () => { hint.remove(); };
    hint.querySelector('.feature-hint-dismiss').addEventListener('click', dismiss);
    setTimeout(dismiss, 8000);
}

// Register hints for features as they appear
const featureHints = {
    board: { selector: '#boardToggle', text: 'Your workshop board — ideas and insights build here as you work.', key: 'board' },
    save: { selector: '#saveSessionBtn', text: 'Save your session and come back later via a magic link.', key: 'save' },
    pitchPreview: { selector: '#pitchPreview', text: 'Your pitch builds here as you define each component.', key: 'pitch' },
    feedback: { selector: '#feedbackTab', text: 'We\'re in beta — your feedback shapes what we build next.', key: 'feedback' },
    toolMenu: { selector: '#toolDropdownToggle', text: 'Switch tools anytime from this menu.', key: 'toolmenu' }
};

// Observe DOM for new elements appearing and show hints
const hintObserver = new MutationObserver(() => {
    Object.values(featureHints).forEach(h => {
        const el = document.querySelector(h.selector);
        if (el && el.offsetParent !== null && !localStorage.getItem('wade_hint_' + h.key)) {
            setTimeout(() => showFeatureHint(h.selector, h.text, h.key), 500);
        }
    });
});
hintObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

// === MOBILE RESPONSIVE — hide desktop controls, show hamburger ===
document.addEventListener('DOMContentLoaded', function() {
    const mq = window.matchMedia('(max-width: 640px)');
    function handleMobile(e) {
        const controls = document.querySelector('.header-controls');
        const nav = document.querySelector('.header-nav');
        const hamburger = document.getElementById('hamburgerBtn');
        if (e.matches) {
            if (controls) controls.style.display = 'none';
            if (nav) nav.style.display = 'none';
            if (hamburger) hamburger.style.display = 'flex';
        } else {
            if (controls) controls.style.display = '';
            if (nav) nav.style.display = '';
            if (hamburger) hamburger.style.display = '';
        }
    }
    mq.addEventListener('change', handleMobile);
    handleMobile(mq);
});

// === HAMBURGER MENU (mobile) ===
(function() {
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        const isOpen = !mobileMenu.classList.contains('hidden');
        if (isOpen) {
            mobileMenu.classList.add('hidden');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        } else {
            mobileMenu.classList.remove('hidden');
            hamburger.classList.add('open');
            hamburger.setAttribute('aria-expanded', 'true');
        }
    });

    // Mobile feedback button
    const mobileFeedback = document.getElementById('mobileNavFeedbackBtn');
    if (mobileFeedback) {
        mobileFeedback.addEventListener('click', (e) => {
            e.preventDefault();
            mobileMenu.classList.add('hidden');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            const panel = document.getElementById('feedbackPanel');
            if (panel) panel.classList.toggle('hidden');
        });
    }

    // Mobile theme toggle
    const mobileTheme = document.getElementById('mobileThemeToggle');
    if (mobileTheme) {
        mobileTheme.addEventListener('click', () => {
            const themeBtn = document.getElementById('themeToggle');
            if (themeBtn) themeBtn.click();
        });
    }

    // Mobile tour button
    const mobileTour = document.getElementById('mobileTourBtn');
    if (mobileTour) {
        mobileTour.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            if (document.body.classList.contains('in-session')) {
                startTour(SESSION_TOUR_STEPS);
            } else {
                startTour(HOMEPAGE_TOUR_STEPS);
            }
        });
    }

    // Mobile help button — open help menu dropdown
    const mobileHelp = document.getElementById('mobileHelpBtn');
    if (mobileHelp) {
        mobileHelp.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            const helpDropdown = document.getElementById('helpMenuDropdown');
            const helpBtn = document.getElementById('helpMenuBtn');
            if (helpDropdown) {
                helpDropdown.classList.toggle('hidden');
                if (helpBtn) helpBtn.setAttribute('aria-expanded', helpDropdown.classList.contains('hidden') ? 'false' : 'true');
            }
        });
    }

    // Mobile text size — cycle through sizes
    const mobileText = document.getElementById('mobileTextSize');
    if (mobileText) {
        mobileText.addEventListener('click', () => {
            const sizes = ['small', 'medium', 'large'];
            const current = localStorage.getItem('studio_text_size') || 'medium';
            const next = sizes[(sizes.indexOf(current) + 1) % sizes.length];
            document.body.classList.remove('text-small', 'text-large');
            if (next === 'small') document.body.classList.add('text-small');
            if (next === 'large') document.body.classList.add('text-large');
            localStorage.setItem('studio_text_size', next);
            mobileText.textContent = 'Aa ' + next.charAt(0).toUpperCase() + next.slice(1);
        });
    }

    // Close menu on link click
    mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
        if (link.getAttribute('href') !== '#') return;
        // The Studio link — close menu
        if (link.classList.contains('active')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                mobileMenu.classList.add('hidden');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        }
    });
})();

// === FEEDBACK WIDGET ===
(function() {
    const tab = $('#feedbackTab');
    const panel = $('#feedbackPanel');
    const closeBtn = $('#feedbackClose');
    const submitBtn = $('#feedbackSubmit');
    const input = $('#feedbackInput');
    const stars = document.querySelectorAll('.feedback-star');
    let selectedRating = 0;

    if (!panel) return;

    if (tab) tab.addEventListener('click', () => { panel.classList.remove('hidden'); tab.style.display = 'none'; });
    if (closeBtn) closeBtn.addEventListener('click', () => { panel.classList.add('hidden'); if (tab) tab.style.display = ''; });

    // Nav bar feedback button
    const navFeedback = $('#navFeedbackBtn');
    if (navFeedback) {
        navFeedback.addEventListener('click', (e) => {
            e.preventDefault();
            panel.classList.toggle('hidden');
        });
    }

    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.rating) <= selectedRating));
        });
    });

    submitBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!selectedRating && !text) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating: selectedRating,
                    text: text,
                    page: window.location.pathname,
                    tool: state.exercise || null,
                    stage: state.mode || null,
                    exchanges: state.messages ? state.messages.filter(m => m.role === 'user').length : 0,
                    timestamp: new Date().toISOString()
                })
            });
            submitBtn.textContent = 'Thanks!';
            input.value = '';
            selectedRating = 0;
            stars.forEach(s => s.classList.remove('active'));
            setTimeout(() => {
                panel.classList.add('hidden');
                tab.style.display = '';
                submitBtn.textContent = 'Send feedback';
                submitBtn.disabled = false;
            }, 1500);
        } catch(e) {
            submitBtn.textContent = 'Failed — try again';
            submitBtn.disabled = false;
        }
    });
})();

// === iOS KEYBOARD VIEWPORT FIX ===
// On iOS, the virtual keyboard shrinks the visual viewport but position:fixed
// elements don't reposition. Use visualViewport API to compensate.
(function() {
    if (!window.visualViewport) return;

    const vv = window.visualViewport;
    let keyboardOpen = false;

    function onViewportResize() {
        const inputArea = document.querySelector('.input-area');
        if (!inputArea) return;

        // Keyboard is open when visual viewport is significantly smaller than layout viewport
        const heightDiff = window.innerHeight - vv.height;
        const isKeyboard = heightDiff > 100;

        if (isKeyboard && !keyboardOpen) {
            keyboardOpen = true;
            document.body.classList.add('keyboard-open');
            // Offset the input bar above the keyboard
            inputArea.style.bottom = heightDiff + 'px';
            // Scroll chat to bottom so latest message is visible
            requestAnimationFrame(() => {
                const chatPane = document.getElementById('chatPane');
                if (chatPane && state.board && state.board.visible) {
                    chatPane.scrollTop = chatPane.scrollHeight;
                }
                const chatArea = document.getElementById('chatArea');
                if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
            });
        } else if (!isKeyboard && keyboardOpen) {
            keyboardOpen = false;
            document.body.classList.remove('keyboard-open');
            inputArea.style.bottom = '';
        }
    }

    vv.addEventListener('resize', onViewportResize);
    vv.addEventListener('scroll', onViewportResize);

// Exit protection — warn before closing tab during active session
window.addEventListener('beforeunload', (e) => {
    if (state.mode && state.mode !== 'routing' && state.messages.length > 2) {
        autoSaveSessionSummary(); // fire-and-forget save before leaving
        if (!state.reportGenerated) {
            e.preventDefault();
            e.returnValue = '';
        }
    }
});

})();
