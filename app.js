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
    reframe: 'Clarify',
    ideate: 'Ideate',
    debate: 'Validate',
    framework: 'Develop'
};

// Reverse map: exercise key → mode (used for routing suggestions)
const EXERCISE_MODE = {
    'five-whys':        'reframe',
    'jtbd':             'reframe',
    'empathy-map':      'reframe',
    'hmw':              'ideate',
    'scamper':          'ideate',
    'crazy-8s':         'ideate',
    'pre-mortem':       'debate',
    'devils-advocate':  'debate',
    'rapid-experiment': 'debate',
    'lean-canvas':      'framework',
    'effectuation':     'framework',
    'analogical':       'framework'
};

// Exercise descriptions (mirror of HTML card text)
const EXERCISE_DESCS = {
    'five-whys':        'Ask "why?" five times to move past symptoms and find what\'s really causing the problem. From Toyota\'s production system, taught at Harvard Business School.',
    'jtbd':             'Understand what your customer or user is actually trying to accomplish. People don\'t adopt solutions — they hire them to make progress. Clayton Christensen\'s framework, used across industries from healthcare to education.',
    'empathy-map':      'Deeply understand your user before defining the problem — what they say, think, do, and feel. The gap between those is where the real opportunity lives. Stanford d.school\'s Empathise stage.',
    'hmw':              'Reframe your problem as an opportunity and open up new directions before committing to one. Stanford d.school\'s bridge between defining a problem and generating solutions.',
    'scamper':          'A structured checklist for generating ideas: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse. Alex Osborn\'s creativity method, widely used in product design.',
    'crazy-8s':         'Generate 8 distinct ideas fast. Forces quantity over quality and breaks your fixation on the first "good" idea. The cornerstone of Google Ventures\' Design Sprint methodology.',
    'pre-mortem':       'Imagine your initiative didn\'t land. Work backwards to surface the risks you\'d miss from an optimistic mindset. Research shows it increases risk identification by 30%.',
    'devils-advocate':  'Stress-test your idea against its sharpest critic. Best used when your team is too aligned — or you need to find the holes before a major decision or investment of resources.',
    'rapid-experiment': 'Design the cheapest, fastest test that would kill your riskiest assumption. Validate before you build — the core principle behind Lean Startup.',
    'lean-canvas':      'Map the key elements of your initiative on one page. Start with the problem, not the solution — then surface the assumptions you\'re least certain about.',
    'effectuation':     'Don\'t start with a goal — start with what you already have. Expert entrepreneurs build from their own skills, network, and resources. By Saras Sarasvathy.',
    'analogical':       'Borrow solutions from other domains. How did nature solve this? How did another industry handle it? The technique behind many of history\'s most disruptive innovations — used by IDEO and DARPA.'
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

// Next recommended stage after each mode
const NEXT_STAGE = {
    reframe:   { mode: 'ideate',     exercise: 'hmw' },
    ideate:    { mode: 'debate',     exercise: 'pre-mortem' },
    debate:    { mode: 'framework',  exercise: 'lean-canvas' },
    framework: null
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
    routing: false       // true when in tool-suggestion mode (no exercise selected)
};

// === DOM ===
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const chatArea = $('#chatArea');
const messagesEl = $('#messages');
const welcome = $('#welcome');
const inputForm = $('#inputForm');
const inputField = $('#inputField');
const sendBtn = $('#sendBtn');
const modeLabel = $('#modeLabel');
const sessionBar = $('#sessionBar');
const sessionMode = $('#sessionMode');
const sessionExercise = $('#sessionExercise');
const sessionSwap = $('#sessionSwap');
const sessionClose = $('#sessionClose');
const reportCta = $('#reportCta');
const reportCtaBtn = $('#reportCtaBtn');
const reportCard = $('#reportCard');
const reportContent = $('#reportContent');
const leadModal = $('#leadModal');
const leadForm = $('#leadForm');
const leadSubmit = $('#leadSubmit');
const continueStage = $('#continueStage');
const continueBtn = $('#continueBtn');
const wadeCta = $('#wadeCta');
const reportUnlock = $('#reportUnlock');
const unlockForm = $('#unlockForm');
const routingBack = $('#routingBack');
const routingBackBtn = $('#routingBackBtn');

// === CARD NAVIGATION ===

$$('.card-exercise-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        const exercise = btn.dataset.exercise;
        startExercise(mode, exercise);
    });
});

function startExercise(mode, exercise, startMsg = null) {
    // If transitioning from routing, use the user's own description as the exercise kickoff
    // so Wayde can respond in context without asking them to repeat themselves
    let autoStartMsg = startMsg;
    if (!autoStartMsg && state.routing && state.messages.length > 0) {
        autoStartMsg = state.messages
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join('\n\n');
    }

    state.mode = mode;
    state.exercise = exercise;
    state.messages = [];
    state.exchangeCount = 0;
    state.reportGenerated = false;
    state.reportText = '';
    state.routing = false;

    // Hide welcome, show session bar
    welcome.classList.add('hidden');
    sessionBar.classList.remove('hidden');
    sessionBar.dataset.mode = mode;

    // Update session bar text
    sessionMode.textContent = MODE_LABELS[mode] || mode;
    sessionExercise.textContent = EXERCISE_LABELS[exercise] || exercise;

    // Update footer label
    modeLabel.textContent = (EXERCISE_LABELS[exercise] || exercise) + ' · ';

    // Clear messages and hide/reset report elements
    messagesEl.innerHTML = '';
    reportCard.classList.add('hidden');
    reportCard.classList.remove('report-preview');
    reportUnlock.classList.add('hidden');
    leadModal.classList.add('hidden');
    continueStage.classList.add('hidden');
    wadeCta.classList.add('hidden');
    routingBack.classList.add('hidden');

    // Show report CTA immediately but disabled — enables after first exchange
    reportCta.classList.remove('hidden');
    reportCtaBtn.disabled = true;
    reportCtaBtn.textContent = 'Talk to Wayde to build your report';

    // Swap button disabled until user has had a real exchange (exchangeCount >= 2)
    sessionSwap.disabled = true;

    if (autoStartMsg) {
        // Use the user's actual description as the first message so Wayde skips
        // "what are you working on?" and responds directly in context
        appendMessage('user', autoStartMsg);
        state.messages = [{ role: 'user', content: autoStartMsg }];
        streamResponse();
    } else {
        // Show exercise description intro card
        const desc = EXERCISE_DESCS[exercise];
        if (desc) {
            const introDiv = document.createElement('div');
            introDiv.className = 'msg-intro';
            introDiv.dataset.mode = mode;
            introDiv.innerHTML = `<div class="msg-intro-label">${EXERCISE_LABELS[exercise] || exercise}</div>${desc}`;
            messagesEl.appendChild(introDiv);
        }
        // Set a tool-specific placeholder hint
        inputField.placeholder = EXERCISE_HINTS[exercise] || 'Describe your challenge or idea...';

        // Auto-kickoff: send a synthetic first message so Wayde opens the conversation
        state.messages = [{ role: 'user', content: 'Please start the session.' }];
        streamResponse();
    }
}

// === BACK TO MENU ===

sessionClose.addEventListener('click', () => {
    if (!window.confirm("End this session? Your conversation won't be saved.")) return;

    state.mode = null;
    state.exercise = null;
    state.messages = [];
    state.exchangeCount = 0;
    state.reportGenerated = false;
    state.reportText = '';

    // Show welcome, hide session bar
    welcome.classList.remove('hidden');
    sessionBar.classList.add('hidden');

    // Clear messages, input, report elements, and project context
    messagesEl.innerHTML = '';
    inputField.value = ''; sendBtn.disabled = true;
    inputField.placeholder = 'Describe your challenge or idea...';
    modeLabel.textContent = '';
    sessionSwap.disabled = true;
    reportCta.classList.add('hidden');
    reportCard.classList.add('hidden');
    reportCard.classList.remove('report-preview');
    reportUnlock.classList.add('hidden');
    leadModal.classList.add('hidden');
    continueStage.classList.add('hidden');
    wadeCta.classList.add('hidden');
    routingBack.classList.add('hidden');
    state.projectContext = [];
    state.routing = false;
});

// === SWAP TOOLS ===

sessionSwap.addEventListener('click', () => {
    if (state.streaming || sessionSwap.disabled) return;
    requestSwap();
});

async function requestSwap() {
    sessionSwap.disabled = true;

    // Show typing indicator while fetching
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'typing';
    loadingDiv.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(loadingDiv);
    scrollToBottom();

    try {
        const res = await fetch('/api/swap-tools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: state.mode,
                exercise: state.exercise,
                messages: state.messages
            })
        });

        const data = await res.json();
        loadingDiv.remove();

        if (data.error || !data.tools) {
            appendMessage('agent', "I wasn't able to suggest tools right now — try again.");
            sessionSwap.disabled = false;
            return;
        }

        // Render swap suggestion card
        const swapDiv = document.createElement('div');
        swapDiv.className = 'swap-suggestions';

        const transitionP = document.createElement('p');
        transitionP.className = 'swap-transition';
        transitionP.textContent = data.transition || 'Here are two tools that could serve you well from here:';
        swapDiv.appendChild(transitionP);

        const toolsDiv = document.createElement('div');
        toolsDiv.className = 'swap-tools';

        data.tools.forEach(tool => {
            const btn = document.createElement('button');
            btn.className = `swap-suggest-btn mode-${tool.mode}`;
            btn.innerHTML = `
                <span class="swap-suggest-stage">${MODE_LABELS[tool.mode] || tool.mode}</span>
                <span class="swap-suggest-name">${tool.name}</span>
                <span class="swap-suggest-reason">${tool.reason}</span>
            `;
            btn.addEventListener('click', () => swapToTool(tool.mode, tool.exercise, swapDiv));
            toolsDiv.appendChild(btn);
        });

        swapDiv.appendChild(toolsDiv);
        messagesEl.appendChild(swapDiv);
        scrollToBottom();

    } catch (err) {
        loadingDiv.remove();
        appendMessage('agent', 'Connection error — please try again.');
    }

    sessionSwap.disabled = false;
}

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
    modeLabel.textContent = (EXERCISE_LABELS[exercise] || exercise) + ' · ';

    // Reset report elements
    reportCard.classList.add('hidden');
    reportCard.classList.remove('report-preview');
    reportUnlock.classList.add('hidden');
    continueStage.classList.add('hidden');
    wadeCta.classList.add('hidden');
    reportCta.classList.remove('hidden');
    reportCtaBtn.disabled = true;
    reportCtaBtn.textContent = 'Talk to Wayde to build your report';

    // Prior conversation carries across — swap is available immediately
    sessionSwap.disabled = false;

    // Remove swap suggestion card from chat
    if (swapEl) swapEl.remove();

    // Carry all prior messages across, add a bridging message
    const exerciseName = EXERCISE_LABELS[exercise] || exercise;
    state.messages = [
        ...previousMessages,
        { role: 'user', content: `Let's switch to ${exerciseName}. Pick up from what we've covered and start this exercise.` }
    ];

    // Stream Wayde's response with the new tool's system prompt
    streamResponse();
}

// === ROUTING (no tool selected) ===

function startRouting(text) {
    state.mode = 'routing';
    state.exercise = 'suggest';
    state.routing = true;
    state.messages = [];
    state.exchangeCount = 0;
    state.reportGenerated = false;
    state.reportText = '';

    welcome.classList.add('hidden');
    routingBack.classList.remove('hidden'); // show subtle back link immediately
    modeLabel.textContent = 'Finding your tool · ';

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
    messagesEl.innerHTML = '';
    inputField.value = ''; sendBtn.disabled = true;
    inputField.placeholder = 'Describe your challenge or idea...';
    modeLabel.textContent = '';
    routingBack.classList.add('hidden');
    chatArea.scrollTop = 0;
});

// === SEND MESSAGE ===

inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputField.value.trim();
    if (!text || state.streaming) return;
    if (!state.exercise) {
        if (state.routing) {
            // Continue the routing conversation
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
    inputField.style.height = Math.min(inputField.scrollHeight, 120) + 'px';
    sendBtn.disabled = !inputField.value.trim();
});

// Initial state — button disabled until user types
sendBtn.disabled = true;

// Enter to send, Shift+Enter for newline
inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        inputForm.dispatchEvent(new Event('submit'));
    }
});

async function sendMessage(text) {
    // Add user message
    state.messages.push({ role: 'user', content: text });
    appendMessage('user', text);

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
    chatArea.scrollTop = chatArea.scrollHeight;
}

// === SHOW REPORT CTA ===

function maybeShowReportCta() {
    if (state.exchangeCount >= 1 && !state.reportGenerated) {
        reportCtaBtn.disabled = false;
        reportCtaBtn.textContent = 'See your session report →';
    }
    // Enable swap once user has shared their challenge (2 exchanges = kickoff + first real reply)
    if (state.exchangeCount >= 2) {
        sessionSwap.disabled = false;
    }
}

// === STREAMING ===

async function streamResponse() {
    state.streaming = true;
    sendBtn.disabled = true;

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
                project_context: state.projectContext
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

    // Save assistant response
    if (fullText) {
        // In routing mode: parse and strip [SUGGEST: key1, key2] tag
        let suggestedKeys = [];
        if (state.routing) {
            const suggestMatch = fullText.match(/\[SUGGEST:\s*([^\]]+)\]/);
            if (suggestMatch) {
                suggestedKeys = suggestMatch[1].split(',').map(s => s.trim()).filter(k => EXERCISE_MODE[k]);
                fullText = fullText.replace(/\n?\[SUGGEST:\s*[^\]]+\]/, '').trim();
                if (agentDiv) agentDiv.innerHTML = renderMarkdown(fullText);
            }
        }

        state.messages.push({ role: 'assistant', content: fullText });

        if (state.routing) {
            // Render inline tool suggestion buttons if Wayde recommended any
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
            scrollToBottom();
        } else {
            state.exchangeCount++;
            maybeShowReportCta();
        }
    }

    state.streaming = false;
    sendBtn.disabled = false;
    inputField.focus();
}

// === REPORT GENERATION + LEAD CAPTURE ===

reportCtaBtn.addEventListener('click', async () => {
    reportCtaBtn.disabled = true;
    reportCtaBtn.textContent = 'Generating report...';

    try {
        const res = await fetch('/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: state.mode,
                exercise: state.exercise,
                messages: state.messages
            })
        });

        const data = await res.json();

        if (data.error) {
            reportCtaBtn.textContent = 'Something went wrong — try again';
            reportCtaBtn.disabled = false;
            return;
        }

        state.reportText = data.report;
        state.reportGenerated = true;

        // Show partial preview + inline unlock form (no modal gate)
        reportContent.innerHTML = renderMarkdown(state.reportText);
        reportCard.classList.remove('hidden');
        reportCard.classList.add('report-preview');
        reportUnlock.classList.remove('hidden');
        reportCta.classList.add('hidden');
        scrollToBottom();

    } catch (err) {
        reportCtaBtn.textContent = 'Connection error — try again';
        reportCtaBtn.disabled = false;
    }
});

// === SHARED LEAD CAPTURE LOGIC ===

function revealFullReport() {
    reportCard.classList.remove('report-preview');
    reportUnlock.classList.add('hidden');
    wadeCta.classList.remove('hidden');

    // Show continue button if there's a next stage
    const next = NEXT_STAGE[state.mode];
    if (next) {
        const nextModeName = MODE_LABELS[next.mode] || next.mode;
        const nextExName = EXERCISE_LABELS[next.exercise] || next.exercise;
        continueBtn.textContent = `Continue to ${nextModeName} — ${nextExName} →`;
        continueStage.classList.remove('hidden');
    }

    scrollToBottom();
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
            messages: state.messages
        })
    }).catch(() => {}).finally(() => {
        revealFullReport();
    });

    return true;
}

// Inline unlock form (below report preview)
unlockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleLeadSubmit($('#unlockName'), $('#unlockEmail'), $('#unlockCompany'), $('#unlockRole'), $('#unlockSubmit'));
});

// Legacy modal form (kept for fallback; no longer primary flow)
leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = handleLeadSubmit($('#leadName'), $('#leadEmail'), $('#leadCompany'), $('#leadRole'), leadSubmit);
    if (ok) leadModal.classList.add('hidden');
});

// === CONTINUE TO NEXT STAGE ===

continueBtn.addEventListener('click', () => {
    const next = NEXT_STAGE[state.mode];
    if (!next) return;

    const prevStage = MODE_LABELS[state.mode] || state.mode;
    const prevExercise = EXERCISE_LABELS[state.exercise] || state.exercise;
    const nextExercise = EXERCISE_LABELS[next.exercise] || next.exercise;

    // Save current stage to project context
    state.projectContext.push({
        stage: prevStage,
        exercise: prevExercise,
        report: state.reportText
    });

    // Bridging message so Wayde connects previous findings to the new exercise
    const bridgeMsg = `I've just finished ${prevExercise} (${prevStage} stage). Please start ${nextExercise}, building directly on what I discovered.`;
    startExercise(next.mode, next.exercise, bridgeMsg);
});

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
