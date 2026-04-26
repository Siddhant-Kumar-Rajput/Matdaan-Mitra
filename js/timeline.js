/**
 * @file timeline.js
 * @description Logic for election phases timeline, what-if scenarios, and quiz.
 * @module MatDaanMitra
 */

const PHASES = [
  { id: 'announcement', name: 'Election Announcement', icon: '📣', authority: 'Election Commission of India' },
  { id: 'nominations', name: 'Nominations & Scrutiny', icon: '📋', authority: 'Returning Officer' },
  { id: 'campaign', name: 'Election Campaign', icon: '🗣', authority: 'Candidates + MCC enforcement' },
  { id: 'voting', name: 'Voting Day', icon: '🗳', authority: 'Presiding Officer, BLO' },
  { id: 'counting', name: 'Vote Counting', icon: '🔢', authority: 'Returning Officer' },
  { id: 'results', name: 'Results & Declaration', icon: '📊', authority: 'Election Commission' },
  { id: 'oath', name: 'Oath Taking', icon: '✊', authority: 'Speaker / Governor' }
];

const phaseCache = {}; 
let exploredPhases = 0;

document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  document.getElementById('current-lang-display').textContent = session.languageLabel || 'English';
  
  renderTimeline();
  renderWhatIfScenarios();

  document.getElementById('whatif-submit').addEventListener('click', () => {
    const input = document.getElementById('whatif-input').value;
    if (input) handleWhatIf(input);
  });
});

function switchTab(tabId) {
  document.getElementById('view-timeline').hidden = tabId !== 'timeline';
  document.getElementById('view-whatif').hidden = tabId !== 'whatif';
  document.getElementById('view-quiz').hidden = tabId !== 'quiz';

  document.getElementById('tab-timeline').className = tabId === 'timeline' ? 'btn btn--primary' : 'btn btn--ghost';
  document.getElementById('tab-whatif').className = tabId === 'whatif' ? 'btn btn--primary' : 'btn btn--ghost';
  document.getElementById('tab-quiz').className = tabId === 'quiz' ? 'btn btn--primary' : 'btn btn--ghost';
}

async function renderTimeline() {
  const container = document.getElementById('timeline-container');
  container.innerHTML = `<div style="text-align:center; padding: 20px;"><p>${t('loading') || 'Loading timeline...'}</p></div>`;
  
  const session = getSession();
  const phaseNames = PHASES.map(p => p.name);
  const translatedNames = await translateTexts(phaseNames, session.language || 'en');

  container.innerHTML = PHASES.map((p, i) => `
    <article class="timeline__phase" 
             data-phase-id="${p.id}"
             aria-expanded="false"
             role="button"
             tabindex="0"
             aria-label="Click to learn about ${translatedNames[i]}"
             onclick="togglePhase('${p.id}', ${i+1})">
      
      <div class="timeline__connector" aria-hidden="true">
        <div class="timeline__dot timeline__dot--${p.id}"></div>
      </div>

      <div class="timeline__card">
        <div class="timeline__icon" aria-hidden="true">${p.icon}</div>
        <div class="timeline__meta">
          <span class="timeline__phase-number">${t('phase') || 'Phase'} ${i+1}</span>
          <h3 class="timeline__phase-name">${translatedNames[i]}</h3>
          <p class="timeline__authority">${p.authority}</p>
        </div>
        <span class="timeline__expand-hint" aria-hidden="true">${t('tap_to_explore') || 'Tap to explore →'}</span>
      </div>

      <div id="detail-${p.id}" hidden></div>
    </article>
  `).join('');
}

async function togglePhase(phaseId, n) {
  const article = document.querySelector(`.timeline__phase[data-phase-id="${phaseId}"]`);
  const isExpanded = article.getAttribute('aria-expanded') === 'true';
  const detailContainer = document.getElementById(`detail-${phaseId}`);
  
  if (isExpanded) {
    article.setAttribute('aria-expanded', 'false');
    detailContainer.hidden = true;
    return;
  }
  
  article.setAttribute('aria-expanded', 'true');
  detailContainer.hidden = false;

  if (phaseCache[phaseId]) {
    return;
  }

  detailContainer.innerHTML = `
    <div class="timeline__detail" aria-live="polite">
      <div class="timeline__detail-skeleton">
        <p>${t('loading')}</p>
      </div>
    </div>
  `;

  const session = getSession();
  const phaseName = PHASES.find(p => p.id === phaseId).name;
  
  const prompt = `
You are MatDaan Mitra, an election education assistant. Explain the "${phaseName}" phase of an Indian general election (Lok Sabha) to a first-time voter. Use simple language — imagine explaining to a curious 20-year-old.

Respond ONLY in ${session.languageLabel || 'English'}.

Structure your response as JSON:
{
  "summary": "2-3 sentence plain language summary",
  "whatHappens": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "whoConducts": "Name of the authority/body responsible",
  "howLong": "Typical duration in days/weeks",
  "yourRole": "What the common voter needs to know or do in this phase",
  "interestingFact": "One surprising or little-known fact about this phase"
}

IMPORTANT: Be factually accurate about Indian elections. Refer to ECI guidelines. Do NOT mention any political party or candidate. Respond ONLY with the JSON.
`;

  try {
    const data = await callGemini(prompt, 'timeline');
    phaseCache[phaseId] = data;
    exploredPhases++;
    
    detailContainer.innerHTML = `
      <div class="timeline__detail" aria-live="polite" role="region" aria-label="${phaseName} details">
        <p class="timeline__summary">${data.summary}</p>
        
        <h4 style="margin-top:var(--space-md);">What happens</h4>
        <ul style="list-style:disc; padding-left:1.5rem; margin-bottom:var(--space-md);">
          ${data.whatHappens.map(b => `<li>${b}</li>`).join('')}
        </ul>

        <div class="timeline__meta-grid">
          <div><strong>Conducted by</strong><br><span>${data.whoConducts}</span></div>
          <div><strong>Duration</strong><br><span>${data.howLong}</span></div>
        </div>

        <div class="timeline__voter-role" style="margin-top:var(--space-md);">
          <h4>Your role as a voter</h4>
          <p>${data.yourRole}</p>
        </div>

        <div class="timeline__fact-box" style="margin-top:var(--space-md); padding:var(--space-md); background:var(--color-surface); border-radius:var(--radius-sm);">
          💡 <strong>Did you know?</strong> ${data.interestingFact}
        </div>
      </div>
    `;
  } catch (error) {
    debugLog(error);
    detailContainer.innerHTML = `<div class="timeline__detail"><p>${t('error_generic')}</p></div>`;
  }
}

// What If Scenarios
const QUICK_SCENARIOS = [
  "What if my name is missing from the voter list?",
  "What if the EVM malfunctions at my booth?",
  "What if I can't reach my polling booth on election day?",
  "What if I have moved to a new city?",
  "What if I want to complain about election misconduct?"
];

function renderWhatIfScenarios() {
  const container = document.getElementById('whatif-quick');
  container.innerHTML = QUICK_SCENARIOS.map(s => `
    <button class="btn btn--ghost btn--sm" onclick="handleWhatIf('${s}')" style="background:var(--color-surface); border:1px solid var(--color-border);">${s}</button>
  `).join('');
}

async function handleWhatIf(question) {
  const { sanitised, isRejected, rejectionReason } = sanitiseInput(question);
  if (isRejected) return;

  document.getElementById('whatif-input').value = sanitised;
  const resultContainer = document.getElementById('whatif-result');
  resultContainer.innerHTML = `<div class="verdict-card" aria-busy="true"><p>${t('loading')}</p></div>`;

  const session = getSession();
  const prompt = `
You are MatDaan Mitra. A voter is asking: "${sanitised}"

Answer this question factually and helpfully in the context of Indian elections.
Respond in ${session.languageLabel || 'English'}.

Structure as JSON:
{
  "answer": "clear 2-3 sentence answer",
  "steps": ["step 1", "step 2", "step 3"],
  "officialContact": "relevant helpline or website",
  "isUrgent": true
}

STRICT RULES:
- Only answer questions about election processes, voter rights, and civic procedures
- Never give political opinions or mention parties/candidates
- If the question is not election-related, respond with: {"outOfScope": true, "message": "I can only help with election process questions."}
- Respond ONLY with JSON
`;

  try {
    const data = await callGemini(prompt, 'what-if');
    if (data.outOfScope) {
      resultContainer.innerHTML = `<div class="verdict-card"><p>${data.message}</p></div>`;
      return;
    }
    
    resultContainer.innerHTML = `
      <div class="verdict-card verdict-card--FACT">
        <h3 class="verdict-card__title">Scenario Answer</h3>
        <p class="verdict-card__explanation">${data.answer}</p>
        ${data.steps && data.steps.length > 0 ? `
          <ul style="list-style:decimal; padding-left:1.5rem; margin-bottom:var(--space-md);">
            ${data.steps.map(s => `<li>${s}</li>`).join('')}
          </ul>
        ` : ''}
        <div class="verdict-card__source">
          <strong>Official Contact:</strong> ${data.officialContact}
        </div>
        ${data.isUrgent ? `<div class="badge badge--MYTH" style="margin-top:var(--space-md);">Urgent Issue</div>` : ''}
      </div>
    `;
  } catch (error) {
    resultContainer.innerHTML = `<div class="verdict-card"><p>${t('error_generic')}</p></div>`;
  }
}

// Mini Quiz
let quizData = [];
let currentQuizStep = 0;

async function startQuiz() {
  document.getElementById('quiz-intro').hidden = true;
  const activeContainer = document.getElementById('quiz-active');
  activeContainer.hidden = false;
  
  const questionContainer = document.getElementById('quiz-question-container');
  questionContainer.innerHTML = `<p>${t('loading')}</p>`;

  const session = getSession();
  const prompt = `
Generate exactly 3 multiple choice quiz questions about the Indian election process. These should test knowledge a voter would gain from reading about the 7 phases of a Lok Sabha election.

Respond in ${session.languageLabel || 'English'} as JSON:
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
`;

  try {
    quizData = await callGemini(prompt, 'quiz');
    if (!Array.isArray(quizData)) quizData = quizData.items || [];
    currentQuizStep = 0;
    renderQuizQuestion();
  } catch (error) {
    questionContainer.innerHTML = `<p>${t('error_generic')}</p>`;
  }
}

function renderQuizQuestion() {
  if (currentQuizStep >= 3 || !quizData[currentQuizStep]) {
    document.getElementById('quiz-question-container').innerHTML = `
      <div style="text-align:center;">
        <h3>🎉 You're ready to vote!</h3>
        <p>You've completed the election knowledge quiz.</p>
        <button class="btn btn--primary" style="margin-top:var(--space-lg);" onclick="switchTab('timeline')">Back to Timeline</button>
      </div>
    `;
    return;
  }

  const q = quizData[currentQuizStep];
  const qNum = currentQuizStep + 1;
  
  document.getElementById('quiz-progress-fill').style.width = `${(qNum/3)*100}%`;
  document.getElementById('quiz-progress-label').textContent = `Question ${qNum} of 3`;

  document.getElementById('quiz-question-container').innerHTML = `
    <div class="onboarding__card">
      <h2 class="onboarding__question">${q.question}</h2>
      <div class="onboarding__options" style="margin-bottom:var(--space-lg);">
        ${q.options.map((opt, i) => `
          <button class="btn btn--ghost onboarding-option" onclick="handleQuizAnswer(${i}, ${q.correctIndex}, '${q.explanation.replace(/'/g, "\\'")}')">${opt}</button>
        `).join('')}
      </div>
      <div id="quiz-feedback" aria-live="polite"></div>
    </div>
  `;
}

function handleQuizAnswer(selectedIndex, correctIndex, explanation) {
  const isCorrect = selectedIndex === correctIndex;
  const feedback = document.getElementById('quiz-feedback');
  
  feedback.innerHTML = `
    <div class="verdict-card verdict-card--${isCorrect ? 'FACT' : 'MYTH'}" style="margin-top:0; padding:var(--space-md);">
      <h3 style="color:${isCorrect ? 'var(--color-fact)' : 'var(--color-myth)'};">${isCorrect ? 'Correct! ✅' : 'Incorrect ❌'}</h3>
      <p>${explanation}</p>
      <button class="btn btn--primary" style="margin-top:var(--space-md);" onclick="nextQuizQuestion()">${currentQuizStep === 2 ? 'Finish Quiz' : 'Next Question'}</button>
    </div>
  `;
  
  // Disable option buttons
  document.querySelectorAll('#quiz-question-container .onboarding-option').forEach(btn => btn.disabled = true);
}

function nextQuizQuestion() {
  currentQuizStep++;
  renderQuizQuestion();
}
