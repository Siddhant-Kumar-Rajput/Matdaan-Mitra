# Skill: Floating Gemini Assistant

## Trigger phrases
Build floating assistant, chat overlay, persistent chat, floating button, slide-up drawer, chat bubble, assistant overlay, implement floating chat, Gemini chat widget

## Description
This skill builds the persistent floating Gemini chat assistant that overlays all three module pages. It is a context-aware chat drawer that knows the user's language, state, and current module. It must not navigate away from the page or disrupt the user's current flow. Activate whenever the agent is asked to implement `floating-assistant.js` or the chat drawer component.

---

## Design Spec

### Trigger Button (always visible, bottom-right)
- Circular button, 56×56px
- Shows a subtle pulse animation when the user first arrives on a module page (hint to click)
- Icon: simple chat bubble (SVG, no emoji)
- Position: `position: fixed; bottom: 24px; right: 24px; z-index: 1000`
- Must not cover the page's primary CTA on mobile — add a `margin-bottom` offset when a sticky button is detected

### Drawer (slide up from bottom on mobile, slide in from right on desktop)
- Mobile: full-width, 80vh max height, `border-radius: var(--radius-lg) var(--radius-lg) 0 0`
- Desktop: 380px wide, full viewport height, right-aligned
- Backdrop overlay: `rgba(0, 0, 0, 0.3)` behind the drawer on mobile
- Opening animation: `transform: translateY(0)` from `translateY(100%)`, 250ms ease
- Close: X button top-right of drawer + tap backdrop on mobile

---

## HTML Structure

Place this at the bottom of every module HTML page (before closing `</body>`):

```html
<!-- Floating Assistant Trigger -->
<button class="floating-assistant__trigger"
        id="assistant-trigger"
        aria-label="Open election assistant chat"
        aria-expanded="false"
        aria-controls="assistant-drawer">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" 
          fill="currentColor" opacity="0.9"/>
  </svg>
</button>

<!-- Drawer -->
<aside class="floating-assistant__drawer"
       id="assistant-drawer"
       role="dialog"
       aria-modal="true"
       aria-labelledby="assistant-drawer-title"
       aria-hidden="true"
       hidden>

  <div class="floating-assistant__header">
    <div class="floating-assistant__identity">
      <div class="floating-assistant__avatar" aria-hidden="true">म</div>
      <div>
        <h2 class="floating-assistant__name" id="assistant-drawer-title">MatDaan Mitra</h2>
        <p class="floating-assistant__status">Online · Ask me anything about elections</p>
      </div>
    </div>
    <button class="floating-assistant__close"
            aria-label="Close assistant"
            onclick="closeAssistant()">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>

  <div class="floating-assistant__messages"
       id="assistant-messages"
       role="log"
       aria-live="polite"
       aria-label="Chat messages"
       aria-relevant="additions">
    <!-- Messages injected by JS -->
  </div>

  <div class="floating-assistant__input-area">
    <label for="assistant-input" class="sr-only">Type your election question</label>
    <textarea id="assistant-input"
              class="floating-assistant__input"
              placeholder="Ask about your voting rights..."
              rows="1"
              maxlength="300"
              aria-describedby="assistant-input-hint"></textarea>
    <p id="assistant-input-hint" class="sr-only">Press Enter to send, Shift+Enter for new line</p>
    <button class="floating-assistant__send"
            id="assistant-send"
            aria-label="Send message"
            disabled>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M16 9L2 2L5 9L2 16L16 9Z" fill="currentColor"/>
      </svg>
    </button>
  </div>

</aside>

<div class="floating-assistant__backdrop" 
     id="assistant-backdrop"
     aria-hidden="true"
     hidden></div>

<script src="../js/floating-assistant.js" defer></script>
```

---

## JavaScript Logic (`floating-assistant.js`)

### Context Injection
When the drawer opens, inject a welcome message that uses the user's actual context:

```javascript
/**
 * Generates the opening welcome message using session context.
 * Called once when the drawer is first opened per page visit.
 *
 * @returns {string} Personalised welcome message
 */
function getWelcomeMessage() {
  const session = getSession();
  const { languageLabel, state, constituency, isFirstTimeVoter, currentModule } = session;

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
```

### Conversation History
Maintain conversation history in module-level memory (not sessionStorage) to pass to Gemini:

```javascript
const conversationHistory = []; // Array of {role: 'user'|'model', parts: [{text: string}]}

async function sendMessage(userMessage) {
  const { sanitised, isRejected, rejectionReason } = sanitiseInput(userMessage);

  if (isRejected) {
    appendMessage('assistant', REJECTION_MESSAGES[rejectionReason]);
    return;
  }

  appendMessage('user', sanitised);
  conversationHistory.push({ role: 'user', parts: [{ text: sanitised }] });

  showTypingIndicator();

  try {
    const response = await callGeminiChat(conversationHistory, 'floating-assistant');
    hideTypingIndicator();
    appendMessage('assistant', response);
    conversationHistory.push({ role: 'model', parts: [{ text: response }] });

    // Trim history to last 10 exchanges to manage context window
    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, 2);
    }
  } catch (error) {
    hideTypingIndicator();
    appendMessage('assistant', REJECTION_MESSAGES.api_error);
  }
}
```

### Auto-resize Textarea
```javascript
document.getElementById('assistant-input').addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  document.getElementById('assistant-send').disabled = this.value.trim().length < 2;
});
```

### Accessibility: Focus Management
```javascript
function openAssistant() {
  const drawer = document.getElementById('assistant-drawer');
  const trigger = document.getElementById('assistant-trigger');

  drawer.hidden = false;
  drawer.setAttribute('aria-hidden', 'false');
  trigger.setAttribute('aria-expanded', 'true');

  // Trap focus inside drawer
  trapFocus(drawer);

  // Move focus to input
  setTimeout(() => {
    document.getElementById('assistant-input').focus();
  }, 300); // After animation
}

function closeAssistant() {
  const drawer = document.getElementById('assistant-drawer');
  const trigger = document.getElementById('assistant-trigger');

  drawer.hidden = true;
  drawer.setAttribute('aria-hidden', 'true');
  trigger.setAttribute('aria-expanded', 'false');

  // Return focus to trigger
  trigger.focus();
  releaseFocusTrap();
}
```

---

## Typing Indicator

Show while waiting for Gemini response:

```html
<div class="assistant-message assistant-message--typing" 
     id="typing-indicator"
     aria-label="MatDaan Mitra is typing"
     hidden>
  <span class="typing-dot"></span>
  <span class="typing-dot"></span>
  <span class="typing-dot"></span>
</div>
```

```css
.typing-dot {
  width: 6px;
  height: 6px;
  background: var(--color-text-muted);
  border-radius: 50%;
  display: inline-block;
  animation: typing-bounce 1.2s ease-in-out infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

@media (prefers-reduced-motion: reduce) {
  .typing-dot { animation: none; opacity: 0.5; }
}
```

---

## Suggested Follow-ups

After each assistant response, show 2-3 contextual suggested follow-up questions as tap chips. Generate them using Gemini or hardcode per module:

```javascript
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
```

Render as tappable chips below the latest assistant message. Tapping one sends it as a user message automatically.
