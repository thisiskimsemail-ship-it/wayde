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

function startExercise(mode, exercise) {
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

    // Clear messages and hide report elements
    messagesEl.innerHTML = '';
    reportCta.classList.add('hidden');
    reportCard.classList.add('hidden');
    leadModal.classList.add('hidden');
    continueStage.classList.add('hidden');
    routingBack.classList.add('hidden');
    inputField.focus();
}

// === BACK TO MENU ===

sessionClose.addEventListener('click', () => {
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
    inputField.value = '';
    modeLabel.textContent = '';
    reportCta.classList.add('hidden');
    reportCard.classList.add('hidden');
    leadModal.classList.add('hidden');
    continueStage.classList.add('hidden');
    routingBack.classList.add('hidden');
    state.projectContext = [];
    state.routing = false;
});

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
    routingBack.classList.add('hidden');

    state.messages.push({ role: 'user', content: text });
    appendMessage('user', text);

    inputField.value = '';
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
    inputField.value = '';
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
});

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

    inputField.value = '';
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
    if (state.exchangeCount >= 3 && !state.reportGenerated) {
        reportCta.classList.remove('hidden');
        scrollToBottom();
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
        state.messages.push({ role: 'assistant', content: fullText });
        if (state.routing) {
            routingBack.classList.remove('hidden');
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

        // Hide the CTA button
        reportCta.classList.add('hidden');

        // Show the lead capture modal
        leadModal.classList.remove('hidden');

    } catch (err) {
        reportCtaBtn.textContent = 'Connection error — try again';
        reportCtaBtn.disabled = false;
    }
});

leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = $('#leadName').value.trim();
    const email = $('#leadEmail').value.trim();
    const company = $('#leadCompany').value.trim();
    const role = $('#leadRole').value.trim();

    if (!name || !email) return;

    leadSubmit.disabled = true;
    leadSubmit.textContent = 'Saving...';

    try {
        await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                company,
                role,
                mode: state.mode,
                exercise: state.exercise,
                report: state.reportText,
                messages: state.messages
            })
        });
    } catch (err) {
        // Still show the report even if lead save fails
    }

    // Hide modal, show report
    leadModal.classList.add('hidden');
    reportContent.innerHTML = renderMarkdown(state.reportText);
    reportCard.classList.remove('hidden');

    // Show continue button if there's a next stage
    const next = NEXT_STAGE[state.mode];
    if (next) {
        const nextModeName = MODE_LABELS[next.mode] || next.mode;
        const nextExName = EXERCISE_LABELS[next.exercise] || next.exercise;
        continueBtn.textContent = `Continue to ${nextModeName} — ${nextExName} →`;
        continueStage.classList.remove('hidden');
    }

    scrollToBottom();

    // Reset form
    leadForm.reset();
    leadSubmit.disabled = false;
    leadSubmit.textContent = 'Send me the report';
});

// === CONTINUE TO NEXT STAGE ===

continueBtn.addEventListener('click', () => {
    const next = NEXT_STAGE[state.mode];
    if (!next) return;

    // Save current stage to project context
    state.projectContext.push({
        stage: MODE_LABELS[state.mode] || state.mode,
        exercise: EXERCISE_LABELS[state.exercise] || state.exercise,
        report: state.reportText
    });

    startExercise(next.mode, next.exercise);
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
