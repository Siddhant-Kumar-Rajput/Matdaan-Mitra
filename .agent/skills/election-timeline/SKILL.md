# Skill: Election Timeline & Process Explainer

## Trigger phrases
Build the timeline module, how elections work page, create timeline.html, election phases, EVM explainer, what-if scenarios, mini quiz, election process steps, generate timeline

## Description
This skill governs the "How Elections Work" module. It builds an interactive, clickable 7-phase election timeline powered by Gemini, includes a "What if?" scenario tab, and generates a closing mini quiz. Activate whenever the agent is asked to work on `timeline.html` or `timeline.js`.

---

## Module Goal

Make the abstract process of an Indian election tangible and easy to follow. The user should finish this module understanding the full journey from announcement to oath, with the ability to explore any phase deeply and test their knowledge.

---

## The 7 Election Phases

These are fixed — always render all 7, in this order:

| Phase | ID | Icon (text) | Key Authority |
|---|---|---|---|
| Election Announcement | `announcement` | 📣 | Election Commission of India |
| Nominations & Scrutiny | `nominations` | 📋 | Returning Officer |
| Election Campaign | `campaign` | 🗣 | Candidates + MCC enforcement |
| Voting Day | `voting` | 🗳 | Presiding Officer, BLO |
| Vote Counting | `counting` | 🔢 | Returning Officer |
| Results & Declaration | `results` | 📊 | Election Commission |
| Oath Taking | `oath` | ✊ | Speaker / Governor |

---

## Gemini Prompt for Phase Detail

When a user clicks a phase card, call Gemini with:

```
You are MatDaan Mitra, an election education assistant. Explain the "{phaseName}" phase of an Indian general election (Lok Sabha) to a first-time voter. Use simple language — imagine explaining to a curious 20-year-old.

Respond ONLY in {language}.

Structure your response as JSON:
{
  "summary": "2-3 sentence plain language summary",
  "whatHappens": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "whoConducts": "Name of the authority/body responsible",
  "howLong": "Typical duration in days/weeks",
  "yourRole": "What the common voter needs to know or do in this phase",
  "interestingFact": "One surprising or little-known fact about this phase"
}

IMPORTANT: Be factually accurate about Indian elections. Refer to ECI guidelines. Do NOT mention any political party or candidate. Respond ONLY with the JSON — no markdown, no preamble.
```

---

## Timeline UI Rendering

### Layout
Vertical timeline, centred connector line, alternating left/right cards on desktop, single column on mobile.

### Phase Card (collapsed state)
```html
<article class="timeline__phase" 
         data-phase-id="{id}"
         aria-expanded="false"
         role="button"
         tabindex="0"
         aria-label="Click to learn about {phaseName}">
  
  <div class="timeline__connector" aria-hidden="true">
    <div class="timeline__dot timeline__dot--{id}"></div>
  </div>

  <div class="timeline__card">
    <div class="timeline__icon" aria-hidden="true">{icon}</div>
    <div class="timeline__meta">
      <span class="timeline__phase-number">Phase {n}</span>
      <h3 class="timeline__phase-name">{phaseName}</h3>
      <p class="timeline__authority">{keyAuthority}</p>
    </div>
    <span class="timeline__expand-hint" aria-hidden="true">Tap to explore →</span>
  </div>

</article>
```

### Phase Detail Panel (expanded state — injected by JS)
```html
<div class="timeline__detail" 
     aria-live="polite"
     role="region"
     aria-label="{phaseName} details">

  <div class="timeline__detail-skeleton" aria-hidden="true">
    <!-- shown while Gemini loads -->
  </div>

  <div class="timeline__detail-content" hidden>
    <p class="timeline__summary">{summary}</p>
    
    <h4>What happens</h4>
    <ul class="timeline__bullets">
      <!-- rendered from whatHappens array -->
    </ul>

    <div class="timeline__meta-grid">
      <div><strong>Conducted by</strong><span>{whoConducts}</span></div>
      <div><strong>Duration</strong><span>{howLong}</span></div>
    </div>

    <div class="timeline__voter-role">
      <h4>Your role as a voter</h4>
      <p>{yourRole}</p>
    </div>

    <div class="timeline__fact-box">
      💡 <strong>Did you know?</strong> {interestingFact}
    </div>
  </div>

</div>
```

---

## "What If?" Scenario Tab

A separate tab on the timeline page where users type edge-case questions.

### Pre-populated scenario buttons (shown before user types):
- "What if my name is missing from the voter list?"
- "What if the EVM malfunctions at my booth?"  
- "What if I can't reach my polling booth on election day?"
- "What if I have moved to a new city?"
- "What if I want to complain about election misconduct?"

### Gemini prompt for What-If:
```
You are MatDaan Mitra. A voter is asking: "{userQuestion}"

Answer this question factually and helpfully in the context of Indian elections.
Respond in {language}.

Structure as JSON:
{
  "answer": "clear 2-3 sentence answer",
  "steps": ["step 1", "step 2", "step 3"],
  "officialContact": "relevant helpline or website",
  "isUrgent": true/false
}

STRICT RULES:
- Only answer questions about election processes, voter rights, and civic procedures
- Never give political opinions or mention parties/candidates
- If the question is not election-related, respond with: {"outOfScope": true, "message": "I can only help with election process questions."}
- Respond ONLY with JSON
```

---

## Mini Quiz (end of module)

Shown after the user has expanded at least 3 phases. Gemini generates 3 questions:

```
Generate exactly 3 multiple choice quiz questions about the Indian election process. These should test knowledge a voter would gain from reading about the 7 phases of a Lok Sabha election.

Respond in {language} as JSON:
[
  {
    "question": "question text",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctIndex": 1,
    "explanation": "why this answer is correct"
  }
]

Rules:
- Questions must be factual, not opinion-based
- No trick questions
- Difficulty: easy to moderate (first-time voter audience)
- Do not repeat information from a previous question
- Respond ONLY with the JSON array
```

Quiz UI:
- One question shown at a time
- After the user selects an answer: show correct/incorrect immediately with explanation
- Show progress: "Question 2 of 3"
- At the end: score card with "🎉 You're ready to vote!" message

---

## Performance Note

Only call Gemini for a phase when the user clicks it — do not pre-load all 7 phases on mount. Cache the response in a module-level JS object so reopening the same phase doesn't make a second API call:

```javascript
const phaseCache = {}; // { phaseId: geminiResponseObject }

async function loadPhaseDetail(phaseId) {
  if (phaseCache[phaseId]) {
    renderPhaseDetail(phaseCache[phaseId]);
    return;
  }
  const data = await callGemini(buildPhasePrompt(phaseId));
  phaseCache[phaseId] = data;
  renderPhaseDetail(data);
}
```
