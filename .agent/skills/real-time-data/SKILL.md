# Skill: Real-Time Election Data via Google Search Grounding

## Trigger phrases
Real-time election data, current elections India, upcoming elections, which state elections, election schedule, when is election in my state, live election info, search grounding, google search grounding, election news

## Description
This skill governs how MatDaan Mitra fetches real-time election schedule data using Gemini's built-in Google Search Grounding feature. ECI does not expose a public election schedule API — this is the correct, official Google-approved solution. Activate whenever the agent needs to fetch or display current/upcoming election information.

---

## Why Google Search Grounding (not scraping)

ECI's website is a JavaScript-rendered React app with no public REST API. Scraping it would:
- Break on any ECI website update
- Violate their terms of service
- Be unreliable for a hackathon demo

**Google Search Grounding** solves this cleanly:
- Gemini searches Google in real-time before answering
- Returns cited, sourced answers from ECI press releases, news outlets, and official notifications
- Requires zero additional APIs — it's a parameter on the existing Gemini call
- Judges see it as meaningful Google service integration ✅

---

## How to Enable Search Grounding

Add `tools` to the Gemini API request body. This is a separate function from the standard `callGemini()` — use `callGeminiGrounded()` for any real-time data needs:

```javascript
/**
 * @file gemini.js (addition)
 * @description Gemini API call with Google Search Grounding enabled.
 *              Use ONLY for real-time election schedule data.
 *              Standard callGemini() does NOT have grounding — keep them separate.
 *
 * @param {string} userPrompt - The query requiring real-time data
 * @param {string} module - Module context for system prompt
 * @returns {Promise<{text: string, sources: Array, searchSuggestions: string|null}>}
 */
async function callGeminiGrounded(userPrompt, module = 'election-schedule') {
  const session = getSession();
  const systemPrompt = SYSTEM_PROMPT(
    session.languageLabel || 'English',
    session.state || 'India',
    module
  );

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [{
      parts: [{ text: userPrompt }]
    }],
    tools: [
      { googleSearch: {} }   // ← This is all it takes to enable real-time search
    ],
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 1.0,      // Google recommends 1.0 for grounded responses
      // Note: responseMimeType cannot be 'application/json' with grounding
      // Parse the text response manually
    }
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) throw new GeminiError(`API error: ${response.status}`, response.status);

  const data = await response.json();
  const candidate = data.candidates?.[0];

  return {
    text: candidate?.content?.parts?.[0]?.text || '',
    sources: (candidate?.groundingMetadata?.groundingChunks || []).map(chunk => ({
      title: chunk.web?.title || '',
      url: chunk.web?.uri || ''
    })),
    // REQUIRED by Google: must render this HTML if present
    searchSuggestions: candidate?.groundingMetadata?.searchEntryPoint?.renderedContent || null
  };
}
```

---

## Election Schedule Module (Dashboard Widget)

Add a "Current Elections in India" widget to `dashboard.html` — shown between the welcome message and the three module tiles.

### What it shows
- Any election currently active OR upcoming in the next 90 days in India
- Highlighted if it's in the user's state
- Sourced from real-time Google Search

### Gemini Prompt for Election Schedule

```javascript
/**
 * Fetches current and upcoming Indian election schedule via grounded Gemini.
 *
 * @param {string} userState - User's registered state from sessionStorage
 * @param {string} language - User's chosen language
 * @returns {Promise<Object>} Structured election schedule data
 */
async function fetchElectionSchedule(userState, language) {
  const prompt = `
Search for current and upcoming elections in India in 2025 and 2026.
The user is from ${userState}.

Find:
1. Any election currently underway (voting phase) in India
2. Any election announced with a schedule in the next 90 days
3. Whether there is any election specifically in ${userState}

Respond in ${language}. Structure your response exactly like this (plain text, not JSON):

ACTIVE_ELECTIONS: [list any election currently in voting phase, or "None currently"]
UPCOMING_ELECTIONS: [list upcoming elections with approximate dates]
USER_STATE_ELECTION: [specific info for ${userState}, or "No election currently scheduled in ${userState}"]
SOURCES_NOTE: [brief note that data is from official ECI announcements]

Keep each section to 1-3 sentences. Be factual. If uncertain about specific dates, say so.
`;

  return await callGeminiGrounded(prompt, 'election-schedule');
}
```

### Rendering the Schedule Widget

```javascript
/**
 * Renders the election schedule widget on the dashboard.
 * Called on dashboard page load.
 */
async function renderElectionScheduleWidget() {
  const widget = document.getElementById('election-schedule-widget');
  const session = getSession();

  showWidgetSkeleton(widget);

  try {
    const { text, sources, searchSuggestions } = await fetchElectionSchedule(
      session.state || 'India',
      session.languageLabel || 'English'
    );

    const parsed = parseElectionScheduleResponse(text);

    widget.innerHTML = `
      <div class="schedule-widget" role="region" aria-label="Current election schedule">
        
        ${parsed.userStateElection !== 'none' ? `
        <div class="schedule-widget__highlight" role="alert" aria-live="polite">
          <span aria-hidden="true">🔔</span>
          <div>
            <strong>Election in your state</strong>
            <p>${parsed.userStateElection}</p>
          </div>
        </div>` : ''}

        <div class="schedule-widget__section">
          <h3>Active Elections</h3>
          <p>${parsed.activeElections}</p>
        </div>

        <div class="schedule-widget__section">
          <h3>Upcoming Elections</h3>
          <p>${parsed.upcomingElections}</p>
        </div>

        ${sources.length > 0 ? `
        <div class="schedule-widget__sources" aria-label="Data sources">
          <strong>Sources:</strong>
          ${sources.slice(0, 3).map(s => 
            `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title}</a>`
          ).join(', ')}
        </div>` : ''}

        ${searchSuggestions ? `
        <!-- REQUIRED: Google Search Suggestions must be displayed as-is -->
        <div class="schedule-widget__search-suggestions" aria-label="Related Google searches">
          ${searchSuggestions}
        </div>` : ''}

        <div class="schedule-widget__footer">
          <span class="responsible-ai-badge">
            🛡 Live data via Gemini Search · Verify at 
            <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">eci.gov.in</a>
          </span>
          <button class="btn btn--ghost btn--sm" onclick="renderElectionScheduleWidget()" 
                  aria-label="Refresh election schedule">
            ↻ Refresh
          </button>
        </div>

      </div>
    `;

  } catch {
    widget.innerHTML = `
      <div class="schedule-widget schedule-widget--error" role="alert">
        <p>Could not load election schedule. 
           <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">
             Check eci.gov.in directly
           </a>
        </p>
      </div>
    `;
  }
}
```

---

## Important: Google's Display Requirement

When grounding returns `searchSuggestions` (the `searchEntryPoint.renderedContent` field), **you must render it in your UI**. Google requires this as part of their grounding usage terms. The HTML is already styled and safe to inject as-is into the DOM via `innerHTML` in a dedicated container.

This is actually a benefit in the hackathon — it shows the judges you properly integrated a Google service according to its official terms, not just hacked it in.

---

## Floating Assistant — Enable Grounding for Schedule Questions

In `floating-assistant.js`, detect when the user is asking about election timing/schedule and route those questions through `callGeminiGrounded()` instead of `callGemini()`:

```javascript
const SCHEDULE_KEYWORDS = [
  'when', 'date', 'schedule', 'upcoming', 'current', 'happening',
  'कब', 'तारीख', 'आगामी',  // Hindi
  'எப்போது', 'அட்டவணை',    // Tamil
];

function isScheduleQuestion(input) {
  const lower = input.toLowerCase();
  return SCHEDULE_KEYWORDS.some(kw => lower.includes(kw));
}

async function sendMessage(userMessage) {
  // ... sanitise input ...

  const useGrounding = isScheduleQuestion(sanitised);
  
  const response = useGrounding
    ? await callGeminiGrounded(sanitised, 'floating-assistant')
    : await callGemini(sanitised, 'floating-assistant');

  // render response + sources if grounded
}
```