/**
 * @file floating-assistant.js
 * @description Persistent context-aware floating chat overlay.
 * @module MatDaanMitra
 */

const SCHEDULE_KEYWORDS = [
  'when', 'date', 'schedule', 'upcoming', 'current', 'happening',
  'कब', 'तारीख', 'आगामी',
  'எப்போது', 'அட்டவணை',
];

const MODULE_SUGGESTIONS = {
  checklist: [
    "What documents do I need to bring?",
    "How do I find my polling booth?",
    "What if my name isn't on the list?"
  ],
  timeline: [
    "How long does vote counting take?",
    "What is NOTA?",
    "Can I vote from any booth in India?"
  ],
  mythbuster: [
    "Can proxy voting happen in India?",
    "Are EVMs really secure?",
    "What is the MCC?"
  ]
};

const conversationHistory = [];

document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('assistant-trigger');
  if (trigger) {
    trigger.addEventListener('click', openAssistant);
  }

  const input = document.getElementById('assistant-input');
  const sendBtn = document.getElementById('assistant-send');
  if (input) {
    input.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      sendBtn.disabled = this.value.trim().length < 2;
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) handleSend();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSend);
  }

  const backdrop = document.getElementById('assistant-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeAssistant);
  }
});

let assistantOpenedOnce = false;

function getWelcomeMessage() {
  const session = getSession();
  const { constituency, state, isFirstTimeVoter, currentModule } = session;

  const moduleGreetings = {
    checklist: `I can help you with your voter checklist for ${constituency || state}. What would you like to know?`,
    timeline: `I can answer questions about any phase of the election process. What would you like to understand better?`,
    mythbuster: `Have a claim to check, or want to know more about any fact-check result? Ask me.`
  };

  const base = isFirstTimeVoter
    ? `Hello! I'm MatDaan Mitra, your election guide. Since this is your first election, feel free to ask me anything — no question is too basic.`
    : `Hello! I'm MatDaan Mitra. What election question can I help you with?`;

  return `${base}\n\n${moduleGreetings[currentModule] || ''}`;
}

function openAssistant() {
  const drawer = document.getElementById('assistant-drawer');
  const trigger = document.getElementById('assistant-trigger');
  const backdrop = document.getElementById('assistant-backdrop');

  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  trigger.setAttribute('aria-expanded', 'true');
  backdrop.classList.add('is-open');

  if (!assistantOpenedOnce) {
    assistantOpenedOnce = true;
    appendMessage('assistant', getWelcomeMessage());
    renderSuggestions();
  }

  setTimeout(() => {
    document.getElementById('assistant-input').focus();
  }, 300);
}

window.closeAssistant = function() {
  const drawer = document.getElementById('assistant-drawer');
  const trigger = document.getElementById('assistant-trigger');
  const backdrop = document.getElementById('assistant-backdrop');

  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  backdrop.classList.remove('is-open');

  trigger.focus();
};

function isScheduleQuestion(input) {
  const lower = input.toLowerCase();
  return SCHEDULE_KEYWORDS.some(kw => lower.includes(kw));
}

async function handleSend() {
  const inputEl = document.getElementById('assistant-input');
  const userMessage = inputEl.value;
  inputEl.value = '';
  inputEl.style.height = 'auto';
  document.getElementById('assistant-send').disabled = true;

  const { sanitised, isRejected, rejectionReason } = sanitiseInput(userMessage);

  if (isRejected) {
    appendMessage('assistant', REJECTION_MESSAGES[rejectionReason]);
    return;
  }

  appendMessage('user', sanitised);
  conversationHistory.push({ role: 'user', parts: [{ text: sanitised }] });

  // Clear suggestions
  const suggContainer = document.getElementById('assistant-suggestions');
  if (suggContainer) suggContainer.remove();

  showTypingIndicator();

  try {
    const useGrounding = isScheduleQuestion(sanitised);
    
    let responseText = '';
    
    if (useGrounding) {
      const data = await callGeminiGrounded(sanitised, 'floating-assistant');
      responseText = data.text;
      if (data.sources && data.sources.length > 0) {
        responseText += `\n\n**Sources:**\n${data.sources.slice(0, 2).map(s => `- [${s.title}](${s.url})`).join('\n')}`;
      }
      // Note: we don't push grounded results to history to save tokens and avoid format errors
    } else {
      responseText = await callGeminiChat(conversationHistory, 'floating-assistant');
      conversationHistory.push({ role: 'model', parts: [{ text: responseText }] });
    }

    hideTypingIndicator();
    appendMessage('assistant', responseText);

    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, 2);
    }
  } catch (error) {
    debugLog(error);
    hideTypingIndicator();
    appendMessage('assistant', REJECTION_MESSAGES.api_error);
  }
}

function appendMessage(role, text) {
  const container = document.getElementById('assistant-messages');
  const div = document.createElement('div');
  div.className = `assistant-message assistant-message--${role}`;
  
  // Basic markdown parsing for links and bold
  let htmlText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, '<br>');

  div.innerHTML = htmlText;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('assistant-messages');
  const div = document.createElement('div');
  div.className = `assistant-message assistant-message--typing`;
  div.id = 'typing-indicator';
  div.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

function renderSuggestions() {
  const session = getSession();
  const suggestions = MODULE_SUGGESTIONS[session.currentModule] || MODULE_SUGGESTIONS.timeline;
  
  const container = document.getElementById('assistant-messages');
  const suggDiv = document.createElement('div');
  suggDiv.id = 'assistant-suggestions';
  suggDiv.style.display = 'flex';
  suggDiv.style.flexWrap = 'wrap';
  suggDiv.style.gap = 'var(--space-sm)';
  suggDiv.style.marginTop = 'var(--space-md)';
  
  suggDiv.innerHTML = suggestions.map(s => `
    <button class="btn btn--ghost btn--sm" style="background:var(--color-surface); border:1px solid var(--color-border);" onclick="triggerSuggestion('${s}')">${s}</button>
  `).join('');
  
  container.appendChild(suggDiv);
}

window.triggerSuggestion = function(text) {
  const input = document.getElementById('assistant-input');
  input.value = text;
  document.getElementById('assistant-send').disabled = false;
  handleSend();
};
