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
    untangle: ['five-whys', 'empathy-map', 'jtbd'],
    spark: ['crazy-8s', 'hmw', 'scamper'],
    test: ['pre-mortem', 'devils-advocate', 'analogical'],
    build: ['lean-canvas', 'effectuation', 'rapid-experiment']
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
    'analogical': 'Analogical Thinking',
    'pre-mortem': 'Pre-Mortem',
    'devils-advocate': "Devil's Advocate",
    'rapid-experiment': 'Rapid Experiment',
    'empathy-map': 'Empathy Map',
    'lean-canvas': 'Lean Canvas',
    'effectuation': 'Effectuation'
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
    'analogical':       'test',
    'lean-canvas':      'build',
    'effectuation':     'build',
    'rapid-experiment': 'build'
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
    'devils-advocate':  'Challenge your assumptions to strengthen your thinking.',
    'rapid-experiment': 'Design a quick test to learn before you build.',
    'lean-canvas':      'Outline your venture model on a single page.',
    'effectuation':     'Build using the resources and relationships you already have.',
    'analogical':       'Borrow solutions from unexpected places.'
};

// Suggested prompt framings shown as input placeholder
const EXERCISE_HINTS = {
    'five-whys':        'e.g. "Our team keeps missing deadlines and no one really knows why"',
    'jtbd':             'e.g. "I\'m redesigning our internal onboarding process for new staff"',
    'empathy-map':      'e.g. "My stakeholder is a department head who keeps resisting the change we\'re proposing"',
    'hmw':              'e.g. "People in our organisation aren\'t adopting the new process we rolled out"',
    'scamper':          'e.g. "I want to reinvent how we run our quarterly planning meetings"',
    'crazy-8s':         'e.g. "I need fresh ideas for improving collaboration between two teams that don\'t talk"',
    'pre-mortem':       'e.g. "We\'re about to roll out a new programme across the whole organisation"',
    'devils-advocate':  'e.g. "We\'re proposing a major shift in how we deliver services to clients"',
    'rapid-experiment': 'e.g. "I think our clients would value a monthly insight briefing — but I\'m not sure"',
    'lean-canvas':      'e.g. "I\'m developing a new service offering within our division"',
    'effectuation':     'e.g. "I have deep expertise in policy and a strong network in government — where do I start?"',
    'analogical':       'e.g. "How might we reduce handoff delays between teams the way Formula 1 does pit stops?"'
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
    'devils-advocate':  'We\'ll stress-test your thinking from every angle, then identify what holds up and what needs work.',
    'rapid-experiment': 'We\'ll design a quick, cheap test to validate your riskiest assumption before you build.',
    'lean-canvas':      'We\'ll map your venture model on one page, then pressure-test the weakest blocks.',
    'effectuation':     'We\'ll start with what you have — skills, network, resources — then find where they point.',
    'analogical':       'We\'ll borrow solutions from unexpected places and adapt them to your challenge.'
};

// Expected exchange counts per exercise (for progress indicator)
const EXERCISE_EXCHANGES = {
    'five-whys': 7, 'jtbd': 10, 'empathy-map': 10,
    'hmw': 8, 'scamper': 10, 'crazy-8s': 8,
    'pre-mortem': 10, 'devils-advocate': 10, 'rapid-experiment': 8,
    'lean-canvas': 12, 'effectuation': 8, 'analogical': 8
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
    'analogical':     '15 min'
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
    untangle: ['five-whys', 'empathy-map', 'jtbd'],
    spark:    ['crazy-8s', 'hmw', 'scamper'],
    test:     ['pre-mortem', 'devils-advocate', 'analogical'],
    build:    ['lean-canvas', 'effectuation', 'rapid-experiment']
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

// Map exercise keys to tool detail page filenames (handles mismatches)
const TOOL_DETAIL_SLUG = {
    'analogical': 'analogical-thinking',
    'hmw': 'how-might-we',
    'jtbd': 'jobs-to-be-done'
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

// Navigate to a stage — carries report context if available, picks a specific exercise if provided
function navigateToStage(targetMode, specificExercise = null) {
    if (state.streaming) return;
    const targetExercise = specificExercise || STAGE_DEFAULT[targetMode];
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

// === TOOL CONFIRMATION CARD ===
function showToolConfirmation(mode, exercise) {
    // Remove any existing confirmation card
    document.querySelector('.tool-confirm-card')?.remove();

    const name = EXERCISE_LABELS[exercise] || exercise;
    const desc = EXERCISE_DESCS[exercise] || '';
    const time = EXERCISE_TIMES[exercise] || '15 min';
    const arc = EXERCISE_ARCS[exercise] || '';
    const category = MODE_LABELS[mode] || mode;

    const card = document.createElement('div');
    card.className = `tool-confirm-card mode-${mode}`;
    card.innerHTML = `
        <div class="tool-confirm-header">
            <span class="tool-confirm-category">${category}</span>
            <span class="tool-confirm-time">${time}</span>
        </div>
        <h3 class="tool-confirm-name">${name}</h3>
        <p class="tool-confirm-desc">${desc}</p>
        <p class="tool-confirm-arc">${arc}</p>
        <div class="tool-confirm-actions">
            <button class="tool-confirm-start">Start ${name} →</button>
            <a class="tool-confirm-learn" href="${toolDetailUrl(exercise)}" target="_blank" rel="noopener">Learn more about this tool</a>
        </div>
    `;

    messagesEl.appendChild(card);
    scrollToBottom();

    card.querySelector('.tool-confirm-start').addEventListener('click', () => {
        card.remove();
        startExercise(mode, exercise);
    });
}

// === CARD NAVIGATION ===

$$('.card-exercise-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        const exercise = btn.dataset.exercise;
        startExercise(mode, exercise);
    });
});

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
    state.exchangeCount = 0;
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
    const customLayouts = ['lean-canvas', 'elevator-pitch', 'pre-mortem', 'effectuation'];
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
        introDiv.innerHTML = `<div class="activity-brief-header"><span class="activity-brief-stage">${MODE_LABELS[mode] || mode}</span><span class="activity-brief-time">${briefTime}</span></div><h3 class="activity-brief-name"><a class="intro-label-link" href="${toolDetailUrl(exercise)}" target="_blank" rel="noopener">${EXERCISE_LABELS[exercise] || exercise}</a></h3><p class="activity-brief-desc">${desc}</p>${arc ? `<p class="activity-brief-arc">${arc}</p>` : ''}<a class="activity-brief-learn" href="tool-detail-${exercise}.html" target="_blank" rel="noopener">Learn more about this tool →</a>`;
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
    state.exchangeCount = 0;
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
    inputField.placeholder = 'Describe your challenge or idea...';
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
    // Hide input bar on welcome
    if (inputArea) inputArea.style.display = 'none';
    document.body.classList.remove('in-session', 'board-open');
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
    state.exchangeCount = 0;
    state.reportGenerated = false;
    state.reportText = '';
    delete document.body.dataset.mode;

    // Show welcome, move input back, hide session bar
    welcome.classList.remove('hidden');
    moveInputToWelcome();
    sessionBar.classList.add('hidden');

    // Clear messages, input, report elements, and project context
    messagesEl.innerHTML = '';
    inputField.value = ''; sendBtn.disabled = true;
    inputField.placeholder = 'Describe your challenge or idea...';
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
    document.body.classList.remove('in-session', 'board-open');
    clearSession();
}

// === SWAP TOOLS ===

function swapToTool(mode, exercise, swapEl) {
    // Preserve conversation history
    const previousMessages = [...state.messages];

    // Update state (keep projectContext and routing as-is)
    state.mode = mode;
    state.exercise = exercise;
    state.exchangeCount = 0;
    state.reportGenerated = false;
    state.reportText = '';

    // Update session bar labels and colour
    sessionBar.dataset.mode = mode;
    sessionMode.textContent = MODE_LABELS[mode] || mode;
    sessionExercise.textContent = EXERCISE_LABELS[exercise] || exercise;
    modeLabel.innerHTML = `<a class="mode-label-link" href="${toolDetailUrl(exercise)}" target="_blank" rel="noopener">${EXERCISE_LABELS[exercise] || exercise}</a> ·`;
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
    const introHTML = `<div class="msg-intro-label"><a class="intro-label-link" href="${toolDetailUrl(exercise)}" target="_blank" rel="noopener">${exerciseName}</a></div>${exerciseDesc}`;
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
    state.exchangeCount = 0;
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
    inputField.placeholder = 'Type your response...';

    // Send a silent kickoff — never shown to user
    state.messages.push({ role: 'user', content: '[SYSTEM] User has just entered The Studio. Welcome them as Pete and run an icebreaker. Do not reference this message.' });

    inputField.value = ''; sendBtn.disabled = true;
    inputField.style.height = 'auto';

    streamResponse().then(() => {
        // Show input after Pete's first message arrives
        if (inputArea) inputArea.style.display = '';
        // Auto-start tour for first-time users
        // Tour disabled on auto-start — users can click ? to start it
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

    // Category card clicks — enter routing with context
    document.querySelectorAll('.lp-process-card[data-category]').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't intercept clicks on tool pill links
            if (e.target.closest('.lp-tool-pill')) return;
            const context = card.dataset.context;
            enterStudio();
            // After Pete's welcome, inject the user's category context as their first message
            if (context) {
                setTimeout(() => sendMessage(context), 2000);
            }
        });
    });

    // Scroll-triggered fade-in animations for landing page sections
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('lp-visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.lp-process, .lp-stats, .lp-features, .lp-board-section, .lp-report-section, .lp-personas, .lp-quote, .lp-bottom-cta').forEach(el => {
        el.classList.add('lp-fade-in');
        fadeObserver.observe(el);
    });
});

function startRouting(text) {
    state.mode = 'routing';
    state.exercise = 'suggest';
    state.routing = true;
    state.messages = [];
    state.exchangeCount = 0;
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
    state.exchangeCount = 0;
    state.reportGenerated = false;
    state.reportText = '';
    state.routing = false;

    welcome.classList.remove('hidden');
    moveInputToWelcome();
    messagesEl.innerHTML = '';
    inputField.value = ''; sendBtn.disabled = true;
    inputField.placeholder = 'Describe your challenge or idea...';
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
        // When board is open, the chat-pane is the scrollable container
        const chatPane = document.getElementById('chatPane');
        if (chatPane && state.board.visible) {
            chatPane.scrollTop = chatPane.scrollHeight;
        }
        chatArea.scrollTop = chatArea.scrollHeight;
    });
}

// === SHOW REPORT CTA ===

function maybeShowReportCta() {
    // Only show report CTA after Pete's wrap-up (state.wrapped) or during conversation mode (4+ exchanges)
    if (state.wrapped && !state.reportGenerated) {
        reportCta.classList.remove('hidden');
        reportCtaBtn.disabled = false;
        reportCtaBtn.textContent = 'Generate my report →';
    }
    // Enable within-stage tool picker after first real exchange
    if (state.exchangeCount >= 1) setPickerEnabled(true);
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
        rating: null
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
    modeLabel.innerHTML = `<a class="mode-label-link" href="${toolDetailUrl(state.exercise)}" target="_blank" rel="noopener">${EXERCISE_LABELS[state.exercise] || state.exercise}</a> ·`;
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
    restoreIntro.innerHTML = `<div class="msg-intro-label"><a class="intro-label-link" href="${toolDetailUrl(state.exercise)}" target="_blank" rel="noopener">${EXERCISE_LABELS[state.exercise] || state.exercise}</a></div>${restoreDesc}`;
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
            breakEl.innerHTML = `<div class="msg-intro-label"><a class="intro-label-link" href="${toolDetailUrl(exerciseKey)}" target="_blank" rel="noopener">${swappedName}</a></div>${desc}`;
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
    actionsHtml += '<button class="wrap-btn wrap-btn-report">Generate my report →</button>';

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
                device_id: state.deviceId
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
        Object.entries(boardTagMap).forEach(([tag, zone]) => {
            const regex = new RegExp(`\\[${tag}:\\s*([^\\]]+)\\]`, 'g');
            const matches = fullText.match(regex);
            if (matches) {
                matches.forEach(m => {
                    const desc = m.match(new RegExp(`\\[${tag}:\\s*([^\\]]+)\\]`))[1].trim();
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

        if (agentDiv) agentDiv.innerHTML = renderMarkdown(fullText);

        // Parse [PHASE: diverge|converge] tags — workshop phase indicator
        const phaseMatch = fullText.match(/\[PHASE:\s*(diverge|converge)\]/);
        if (phaseMatch) {
            state.currentPhase = phaseMatch[1];
            fullText = fullText.replace(/\n?\[PHASE:\s*(?:diverge|converge)\]/g, '').trim();
            if (agentDiv) agentDiv.innerHTML = renderMarkdown(fullText);
            updatePhaseIndicator(state.currentPhase);
            // Phase transition is internal — not shown to users
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

        state.messages.push({ role: 'assistant', content: fullText });

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
                    btn.addEventListener('click', () => showToolConfirmation(mode, key));
                    suggestDiv.appendChild(btn);
                });
                messagesEl.appendChild(suggestDiv);
            }
            // Show report CTA even during conversation (no tool needed)
            if (state.exchangeCount >= 4 && !state.reportGenerated) {
                reportCta.classList.remove('hidden');
                reportCtaBtn.disabled = false;
                reportCtaBtn.textContent = 'Generate my report →';
            }
            scrollToBottom();
        } else {
            state.exchangeCount++;
            updateProgressIndicator();
            maybeShowReportCta();
            // Show wrap-up card if facilitator signalled the exercise is complete
            if (wrapSignaled && !state.reportGenerated) {
                state.wrapped = true;
                // Keep input bar open — user can still ask Pete questions
                // Auto-open the Workshop Board for review
                if (!state.board.visible && state.board.cards.length > 0) {
                    toggleBoard();
                }
                // Show the wrap prompt with report CTA
                renderWrapPrompt();
                // Show report CTA prominently
                reportCta.classList.remove('hidden');
                reportCtaBtn.disabled = false;
                reportCtaBtn.textContent = 'Generate my report →';
                // Auto-save session summary to memory
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
                <p class="report-wait-heading">While you wait — explore Wade programs</p>
                <p class="report-wait-desc">Wade Institute runs intensive programs for founders, innovators, and intrapreneurs. See which one fits your stage.</p>
                <a class="report-wait-btn" href="https://wadeinstitute.org.au/programs/" target="_blank" rel="noopener">Explore programs →</a>
                <a class="report-wait-link" href="mailto:enquiries@wadeinstitute.org.au">Want to go deeper? Talk to the Wade team →</a>
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
            is_final: state.wrapped  // true = session complete, update profile patterns
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
    if (reportGenerating || state.reportGenerated) return;
    trackEvent('report_generate', { exchanges: state.exchangeCount });
    reportGenerating = true;
    reportCtaBtn.disabled = true;
    reportCtaBtn.textContent = 'Generating report...';

    const progress = showReportProgress();

    // Build message payload once
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

    const retryMessages = ['Generating report...', 'Still working on your report...', 'Almost there, one more try...'];
    const retryDelays = [0, 2000, 4000];
    let data = null;

    for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
            reportCtaBtn.textContent = retryMessages[attempt];
            await new Promise(r => setTimeout(r, retryDelays[attempt]));
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 90000);

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
                console.error(`[Report] Attempt ${attempt + 1} server error:`, res.status);
                continue; // retry
            }

            data = await res.json();
            if (data.error || !data.report) {
                console.error(`[Report] Attempt ${attempt + 1} empty/error:`, data.error);
                data = null;
                continue; // retry
            }

            break; // success
        } catch (err) {
            console.error(`[Report] Attempt ${attempt + 1} failed:`, err.message);
            continue; // retry
        }
    }

    if (!data || !data.report) {
        progress.error();
        reportGenerating = false;
        reportCtaBtn.textContent = 'Taking longer than expected — try again';
        reportCtaBtn.disabled = false;
        return;
    }

    progress.complete();
    state.reportText = data.report;
    state.reportSynopsis = data.synopsis || {};
    state.reportGenerated = true;
    console.log('[Report] Got report text, length:', data.report.length);

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
    reportContent.innerHTML = renderMarkdown(state.reportText);
    populateReportMeta();

    // Auto-scroll synopsis into view
    setTimeout(() => {
        synopsisCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
}

reportCtaBtn.addEventListener('click', async () => {
    // Show lead capture form first, then generate report on submit
    const unlockEl = document.getElementById('reportUnlock');
    if (unlockEl && !state.leadCaptured) {
        reportCta.classList.add('hidden');
        unlockEl.classList.remove('hidden');
        unlockEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }
    generateReport();
});

// Pre-report handoff removed — conversation-first mode handles this naturally

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
    // Server-side PDF generation via WeasyPrint
    try {
        const res = await fetch('/api/report/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                report: state.reportText,
                synopsis: state.reportSynopsis || {},
                exercise: state.exercise || '',
                mode: state.mode || ''
            })
        });
        if (!res.ok) {
            console.error('[PDF] Server error:', res.status);
            // Fallback: open report as printable HTML
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Report</title><style>body{font-family:Arial,sans-serif;max-width:700px;margin:2cm auto;line-height:1.6;color:#333}h2{color:#1E194F;border-bottom:2px solid #F15A22;padding-bottom:4px}</style></head><body>${reportContent.innerHTML}</body></html>`;
            const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
            const win = window.open(url, '_blank');
            if (win) win.addEventListener('load', () => { setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 500); });
            return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const title = (state.reportSynopsis?.title || 'Studio Report').replace(/[^a-zA-Z0-9 \-_]/g, '').trim().slice(0, 60);
        a.href = url;
        a.download = `${title} - The Studio.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        trackEvent('report_download', { format: 'pdf' });
    } catch (err) {
        console.error('[PDF] Download error:', err);
    }
}

// === REPORT ACTION BUTTONS (unified for top + bottom bars) ===

// === SYNOPSIS DOWNLOAD GATING ===

let pendingDownloadFormat = null; // 'word' or 'pdf'

// Synopsis "Download my report" button → go straight to format choice (lead already captured)
document.getElementById('synopsisDownloadBtn')?.addEventListener('click', () => {
    document.getElementById('reportSynopsis')?.classList.add('hidden');
    const formatChoice = document.getElementById('reportFormatChoice');
    if (formatChoice) {
        formatChoice.classList.remove('hidden');
        formatChoice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    renderNextExercisePanel();
});

// Synopsis close button
document.getElementById('synopsisCloseBtn')?.addEventListener('click', () => {
    document.getElementById('reportSynopsis')?.classList.add('hidden');
});

// Lead capture form submit → capture lead, then generate report
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
    submitBtn.textContent = 'Building your report...';

    // Store lead data
    state.userEmail = email;
    state.leadCaptured = true;
    state.leadData = { email, name, company, role };
    localStorage.setItem('wade_user_email', email);

    // Generate session summary (async, non-blocking)
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

    // Hide form, show progress
    reportUnlock.classList.add('hidden');

    // Now generate the report
    await generateReport();

    // After report generates, send the lead + email the report
    if (state.reportGenerated && state.reportText) {
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
    }

    saveSession();

    submitBtn.disabled = false;
    submitBtn.textContent = 'Send me my report →';
});

// Format choice buttons → trigger download, then show next exercise
document.getElementById('formatWordBtn')?.addEventListener('click', () => {
    downloadReportWord();
    document.getElementById('reportFormatChoice')?.classList.add('hidden');
    renderNextExercisePanel();
});
document.getElementById('formatPdfBtn')?.addEventListener('click', () => {
    downloadReport();
    document.getElementById('reportFormatChoice')?.classList.add('hidden');
    renderNextExercisePanel();
});

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

// === DOWNLOAD AS WORD (.doc) ===

async function downloadReportWord() {
    // Server-side .docx generation via python-docx
    try {
        const res = await fetch('/api/report/docx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                report: state.reportText,
                synopsis: state.reportSynopsis || {},
                exercise: state.exercise || '',
                mode: state.mode || ''
            })
        });
        if (!res.ok) {
            console.error('[DOCX] Server error:', res.status);
            return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const title = (state.reportSynopsis?.title || 'Studio Report').replace(/[^a-zA-Z0-9 \-_]/g, '').trim().slice(0, 60);
        a.href = url;
        a.download = `${title} - The Studio.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        trackEvent('report_download', { format: 'docx' });
    } catch (err) {
        console.error('[DOCX] Download error:', err);
    }
}

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

function renderNextExercisePanel() {
    if ($('#postDownloadPanel')) return; // already shown

    const panel = document.createElement('div');
    panel.id = 'postDownloadPanel';
    panel.className = 'post-download-panel';

    // Thank-you message
    let html = `<div class="post-download-thanks">Your report is on its way. Nice work today.</div>`;

    // Next tool suggestion (if not the last category)
    const next = NEXT_STAGE[state.mode];
    if (next) {
        const nextModeName = MODE_LABELS[next.mode] || next.mode;
        const nextExName = EXERCISE_LABELS[next.exercise] || next.exercise;
        const modeColor = next.mode;
        html += `
            <div class="post-download-section">
                <div class="post-download-label">Keep going?</div>
                <div class="post-download-next">
                    <span class="post-download-stage mode-${modeColor}">${nextModeName}</span>
                    <span class="post-download-tool">${nextExName}</span>
                    <span class="post-download-desc">${EXERCISE_DESCS[next.exercise] || ''}</span>
                </div>
                <button class="post-download-btn post-download-btn-${modeColor}" id="nextExerciseBtn">Start ${nextExName} →</button>
            </div>
        `;
    }

    // Browse toolbox + Wade team
    html += `
        <div class="post-download-links">
            <a class="post-download-link" href="toolbox.html">Browse all 12 tools in the Toolbox →</a>
            <a class="post-download-link" href="mailto:enquiries@wadeinstitute.org.au">Talk to the Wade team about your challenge →</a>
            <a class="post-download-link" href="https://wadeinstitute.org.au/programs/" target="_blank" rel="noopener">Explore Wade programs →</a>
        </div>
    `;

    panel.innerHTML = html;

    // Insert after the format choice or synopsis card
    const anchor = document.getElementById('reportFormatChoice') || document.getElementById('reportSynopsis');
    if (anchor) {
        anchor.insertAdjacentElement('afterend', panel);
    }

    // Wire up next exercise button
    const nextBtn = panel.querySelector('#nextExerciseBtn');
    if (nextBtn && next) {
        nextBtn.addEventListener('click', () => {
            panel.remove();
            navigateToStage(next.mode, next.exercise);
        });
    }

    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    const expected = EXERCISE_EXCHANGES[state.exercise] || 8;
    const current = state.exchangeCount;
    const pct = Math.min(100, Math.round((current / expected) * 100));
    el.innerHTML = `<span class="progress-count">${current} of ~${expected}</span><div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>`;
    el.classList.remove('hidden');
}

// === WORKSHOP BOARD ===

const BOARD_LAYOUTS = {
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
            { id: 'problem', name: 'Problem', empty: 'Top 1-3 problems', hint: 'What are the top 3 problems?', colour: 'orange' },
            { id: 'solution', name: 'Solution', empty: 'Top features', hint: 'How you solve each problem', colour: 'pink' },
            { id: 'uvp', name: 'Unique Value Prop', empty: 'Single clear message', hint: 'Why are you different?', colour: 'pink' },
            { id: 'unfair', name: 'Unfair Advantage', empty: 'Can\'t be copied', hint: 'What can\'t be easily copied?', colour: 'yellow' },
            { id: 'segments', name: 'Customer Segments', empty: 'Target customers', hint: 'Who are your target customers?', colour: 'orange' },
            { id: 'channels', name: 'Channels', empty: 'Path to customers', hint: 'How you reach customers', colour: 'pink' },
            { id: 'revenue', name: 'Revenue Streams', empty: 'How you make money', hint: 'Revenue model', colour: 'teal' },
            { id: 'costs', name: 'Cost Structure', empty: 'Key costs', hint: 'Key cost drivers', colour: 'teal' },
            { id: 'metrics', name: 'Key Metrics', empty: 'Numbers that matter', hint: 'Key numbers to track', colour: 'teal' }
        ],
        gridClass: 'board-grid-canvas'
    },
    'pre-mortem': {
        zones: [
            { id: 'risk-market', name: 'Market Risk', empty: 'Market failures', hint: 'Wrong market, bad timing, no demand', colour: 'orange' },
            { id: 'risk-product', name: 'Product Risk', empty: 'Product failures', hint: 'Wrong solution, bad UX, doesn\'t work', colour: 'orange' },
            { id: 'risk-team', name: 'Team Risk', empty: 'Team failures', hint: 'Wrong skills, conflict, burnout', colour: 'pink' },
            { id: 'risk-financial', name: 'Financial Risk', empty: 'Money failures', hint: 'Ran out of cash, wrong pricing', colour: 'teal' },
            { id: 'risk-competition', name: 'Competition Risk', empty: 'Competitive failures', hint: 'Beaten by incumbents or new entrants', colour: 'teal' },
            { id: 'risk-timing', name: 'Timing Risk', empty: 'Timing failures', hint: 'Too early, too late, external shock', colour: 'yellow' },
            { id: 'risk-mitigations', name: 'Mitigations', empty: 'Actions to reduce risk', hint: 'What you can do this week', colour: 'orange' }
        ],
        gridClass: 'board-grid-premortem'
    },
    'effectuation': {
        zones: [
            { id: 'eff-means', name: 'Bird in Hand', empty: 'What you already have', hint: 'Skills, knowledge, network', colour: 'orange' },
            { id: 'eff-loss', name: 'Affordable Loss', empty: 'What you can risk', hint: 'Time, money, reputation', colour: 'pink' },
            { id: 'eff-quilt', name: 'Crazy Quilt', empty: 'Who could join', hint: 'Partners, allies, co-creators', colour: 'teal' },
            { id: 'eff-lemonade', name: 'Lemonade', empty: 'Surprises to leverage', hint: 'Turn setbacks into advantages', colour: 'yellow' },
            { id: 'eff-pilot', name: 'Pilot in the Plane', empty: 'What you control', hint: 'Shape the future, don\'t predict it', colour: 'orange' },
            { id: 'eff-action', name: 'First Move', empty: 'This week\'s action', hint: 'One concrete step in 48 hours', colour: 'orange' }
        ],
        gridClass: 'board-grid-effectuation'
    },
    'elevator-pitch': {
        zones: [
            { id: 'pitch-customer', name: 'Target Customer', empty: 'Who is this for?', hint: 'The specific person who needs this most', colour: 'orange' },
            { id: 'pitch-problem', name: 'Problem / Need', empty: 'What pain do they have?', hint: 'The urgent problem they face', colour: 'orange' },
            { id: 'pitch-solution', name: 'Product / Service', empty: 'What are you building?', hint: 'Name and category', colour: 'pink' },
            { id: 'pitch-benefit', name: 'Key Benefit', empty: 'What changes for them?', hint: 'The specific outcome they get', colour: 'teal' },
            { id: 'pitch-differentiator', name: 'Differentiator', empty: 'Why you, not them?', hint: 'What makes you different from alternatives', colour: 'yellow' }
        ],
        gridClass: 'board-grid-pitch'
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

// Effectuation principle tag mapping
const EFF_TAG_MAP = {
    'means': 'eff-means', 'bird-in-hand': 'eff-means',
    'loss': 'eff-loss', 'affordable-loss': 'eff-loss',
    'quilt': 'eff-quilt', 'crazy-quilt': 'eff-quilt',
    'lemonade': 'eff-lemonade',
    'pilot': 'eff-pilot', 'pilot-in-the-plane': 'eff-pilot',
    'action': 'eff-action', 'first-move': 'eff-action'
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
            <div class="zone-header"><span class="zone-name">${z.name}</span><span class="zone-count" data-zone="${z.id}">0</span></div>
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
        if (countEl) countEl.textContent = count;
    });
    const boardCountEl = document.getElementById('boardCount');
    if (boardCountEl) {
        boardCountEl.textContent = total;
        boardCountEl.classList.toggle('hidden', total === 0);
    }
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
        if (overlay) overlay.classList.remove('hidden');
        if (emailInput) emailInput.focus();
    });

    // Close modal
    if (closeModal) closeModal.addEventListener('click', () => {
        if (overlay) overlay.classList.add('hidden');
    });
    if (overlay) overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.add('hidden');
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
    const toolParam = params.get('tool');
    if (toolParam && EXERCISE_MODE[toolParam]) {
        const mode = EXERCISE_MODE[toolParam];
        history.replaceState({}, '', '/');
        startExercise(mode, toolParam);
        // Belt-and-suspenders: ensure input bar is visible after direct tool launch
        if (inputArea) inputArea.style.display = '';
        // Double-ensure after any async reflows
        setTimeout(() => { if (inputArea) inputArea.style.display = ''; }, 500);
    }
});

// === GUIDED TOUR ===
const TOUR_STEPS = [
    { el: '#sessionBreadcrumb', text: 'This shows which stage and tool you\'re using. Click the tool name to switch to a different one.', pos: 'below' },
    { el: '#boardToggle', text: 'Open the Workshop Board to see your ideas, insights, and actions building up as you work.', pos: 'below' },
    { el: '#inputField', text: 'Type your responses here. Pete will guide you through the exercise one question at a time.', pos: 'above' },
    { el: '.help-challenge-row', text: '"Help me" gives you a nudge. "Challenge me" pushes you harder. Use them any time.', pos: 'above' },
    { el: '#privacyLink', text: 'Your data stays yours. Read our privacy policy to see exactly how your session information is handled.', pos: 'above' },
    { el: '#saveSessionBtn', text: 'Save your session any time. We\'ll email you a link to pick up exactly where you left off.', pos: 'below' },
    { el: '#tourHelpBtn', text: 'You can replay this tour any time by clicking here. Now let\'s get to work.', pos: 'below' }
];

let tourStep = 0;
const tourOverlay = document.getElementById('tourOverlay');
const tourSpotlight = document.getElementById('tourSpotlight');
const tourTooltip = document.getElementById('tourTooltip');
const tourText = document.getElementById('tourText');
const tourStepCount = document.getElementById('tourStepCount');
const tourNext = document.getElementById('tourNext');
const tourSkip = document.getElementById('tourSkip');

function startTour() {
    if (!tourOverlay) return;
    tourStep = 0;
    tourOverlay.classList.remove('hidden');
    showTourStep();
}

function showTourStep() {
    if (tourStep >= TOUR_STEPS.length) { endTour(); return; }
    const step = TOUR_STEPS[tourStep];
    const target = document.querySelector(step.el);
    if (!target || target.offsetParent === null) {
        // Element not visible — skip
        tourStep++;
        showTourStep();
        return;
    }
    const rect = target.getBoundingClientRect();
    const pad = 6;
    tourSpotlight.style.top = (rect.top - pad) + 'px';
    tourSpotlight.style.left = (rect.left - pad) + 'px';
    tourSpotlight.style.width = (rect.width + pad * 2) + 'px';
    tourSpotlight.style.height = (rect.height + pad * 2) + 'px';

    tourText.textContent = step.text;
    tourStepCount.textContent = (tourStep + 1) + ' of ' + TOUR_STEPS.length;
    tourNext.textContent = tourStep === TOUR_STEPS.length - 1 ? 'Done' : 'Next →';

    // Position tooltip
    const ttWidth = 300;
    let ttLeft = rect.left + rect.width / 2 - ttWidth / 2;
    ttLeft = Math.max(12, Math.min(ttLeft, window.innerWidth - ttWidth - 12));
    tourTooltip.style.width = ttWidth + 'px';
    tourTooltip.style.left = ttLeft + 'px';
    if (step.pos === 'above') {
        tourTooltip.style.top = 'auto';
        tourTooltip.style.bottom = (window.innerHeight - rect.top + 12) + 'px';
    } else {
        tourTooltip.style.top = (rect.bottom + 12) + 'px';
        tourTooltip.style.bottom = 'auto';
    }
}

function endTour() {
    tourOverlay.classList.add('hidden');
    localStorage.setItem('wade_tour_seen', '1');
}

if (tourNext) tourNext.addEventListener('click', () => { tourStep++; showTourStep(); });
if (tourSkip) tourSkip.addEventListener('click', endTour);

// Help button — replay tour
const tourHelpBtn = document.getElementById('tourHelpBtn');
if (tourHelpBtn) tourHelpBtn.addEventListener('click', startTour);

// Auto-start tour on first session entry (called from enterStudio)
let inSession = false;
function maybeStartTour() {
    inSession = true;
    if (!localStorage.getItem('wade_tour_seen')) {
        setTimeout(() => {
            if (inSession) startTour();
        }, 2000);
    }
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

// === FEEDBACK WIDGET ===
(function() {
    const tab = $('#feedbackTab');
    const panel = $('#feedbackPanel');
    const closeBtn = $('#feedbackClose');
    const submitBtn = $('#feedbackSubmit');
    const input = $('#feedbackInput');
    const stars = document.querySelectorAll('.feedback-star');
    let selectedRating = 0;

    if (!tab || !panel) return;

    tab.addEventListener('click', () => { panel.classList.remove('hidden'); tab.style.display = 'none'; });
    closeBtn.addEventListener('click', () => { panel.classList.add('hidden'); tab.style.display = ''; });

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
})();
