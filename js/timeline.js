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

  document.getElementById('tab-timeline').className = tabId === 'timeline' ? 'pill-tab pill-tab--active' : 'pill-tab';
  document.getElementById('tab-whatif').className = tabId === 'whatif' ? 'pill-tab pill-tab--active' : 'pill-tab';
  document.getElementById('tab-quiz').className = tabId === 'quiz' ? 'pill-tab pill-tab--active' : 'pill-tab';
}

async function renderTimeline() {
  const container = document.getElementById('timeline-container');
  const session = getSession();
  const lang = session.language || 'en';
  const offlineData = await getOfflinePhases(lang);

  container.innerHTML = offlineData.map((p, i) => {
    const isLeft = (i % 2 === 0);
    const alignClass = isLeft ? 'timeline__step--left' : 'timeline__step--right';
    return `
    <article class="timeline__step ${alignClass}" 
             data-phase-id="${p.id}"
             aria-expanded="false"
             aria-label="Phase ${i+1}: ${p.title}">
      
      <div class="timeline__marker" aria-hidden="true">
        <div class="timeline__marker-inner">${i+1}</div>
      </div>

      <div class="timeline__content-wrapper">
        <div class="timeline__card" role="button" tabindex="0" onclick="togglePhase('${p.id}', ${i+1})">
          <div class="timeline__card-content">
            <div class="timeline__icon" aria-hidden="true">${p.icon}</div>
            <div class="timeline__text">
              <span class="timeline__category">${t('phase_' + (i+1)) || `PHASE ${i+1}`}</span>
              <h3 class="timeline__title">${p.title}</h3>
              <p class="timeline__subtitle">${p.authority}</p>
              <span class="timeline__cta" aria-hidden="true" data-i18n="tap_explore">${t('tap_explore') || 'Tap to explore'}</span>
            </div>
          </div>
        </div>

        <div id="detail-${p.id}" class="timeline__detail-container"></div>
      </div>
    </article>
  `}).join('');
}

async function togglePhase(phaseId, n) {
  const article = document.querySelector(`.timeline__step[data-phase-id="${phaseId}"]`);
  const isExpanded = article.getAttribute('aria-expanded') === 'true';
  const detailContainer = document.getElementById(`detail-${phaseId}`);
  
  // Accordion logic: close all other phases
  document.querySelectorAll('.timeline__step').forEach(step => {
    if (step !== article) {
      step.setAttribute('aria-expanded', 'false');
    }
  });
  
  if (isExpanded) {
    article.setAttribute('aria-expanded', 'false');
    return;
  }
  
  article.setAttribute('aria-expanded', 'true');

  const tapHint = article.querySelector('.timeline__cta');
  if (tapHint) tapHint.classList.add('hidden');

  if (phaseCache[phaseId]) {
    return;
  }

  const session = getSession();
  const lang = session.language || 'en';
  const offlineData = await getOfflinePhases(lang);
  const data = offlineData.find(p => p.id === phaseId);

  if (!data) {
    detailContainer.innerHTML = `<div class="timeline__detail"><p>${t('error_generic')}</p></div>`;
    return;
  }

  phaseCache[phaseId] = data;
  exploredPhases++;
  
  detailContainer.innerHTML = `
    <div class="timeline__detail" aria-live="polite" role="region" aria-label="${data.title} details">
      <p class="timeline__summary">${data.summary}</p>
      
      <h4 style="margin-top:var(--space-md);" data-i18n="what_happens">${t('what_happens') || 'What happens'}</h4>
      <ul style="list-style:disc; padding-left:1.5rem; margin-bottom:var(--space-md);">
        ${data.whatHappens.map(b => `<li>${b}</li>`).join('')}
      </ul>

      <div class="timeline__meta-grid">
        <div><strong data-i18n="conducted_by">${t('conducted_by') || 'Conducted by'}</strong><br><span>${data.authority}</span></div>
        <div><strong data-i18n="duration">${t('duration') || 'Duration'}</strong><br><span>${data.duration}</span></div>
      </div>

      <div class="timeline__voter-role" style="margin-top:var(--space-md);">
        <h4 data-i18n="your_role">${t('your_role')}</h4>
        <p>${data.yourRole}</p>
      </div>

      <div class="timeline__fact-box" style="margin-top:var(--space-md); padding:var(--space-md); background:var(--color-surface); border-radius:var(--radius-sm);">
        💡 <strong data-i18n="did_you_know">${t('did_you_know')}</strong> ${data.fact}
      </div>
    </div>
  `;
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
  const { sanitised, isRejected } = sanitiseInput(question);
  if (isRejected) return;

  document.getElementById('whatif-input').value = sanitised;
  const resultContainer = document.getElementById('whatif-result');
  resultContainer.innerHTML = `<div class="verdict-card" aria-busy="true"><p>${t('loading') || 'Looking up your scenario...'}</p></div>`;
  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const session = getSession();

  // Keep the prompt simple — jsonMode enforces JSON via responseMimeType
  const prompt = `A voter asks about Indian elections: "${sanitised}"

Respond in ${session.languageLabel || 'English'}.

Return ONLY this JSON object (no markdown, no extra text):
{
  "answer": "A clear 2-3 sentence factual answer",
  "steps": ["Action step 1", "Action step 2"],
  "officialContact": "eci.gov.in or 1950",
  "isUrgent": false,
  "outOfScope": false
}

If the question is not about elections or voter rights, set outOfScope to true and include a "message" field.`;

  try {
    // jsonMode: true forces responseMimeType: application/json — Gemini returns valid JSON
    const data = await callGemini(prompt, { jsonMode: true, maxTokens: 600 });

    if (!data || typeof data !== 'object') throw new Error('Invalid response shape');

    if (data.outOfScope) {
      resultContainer.innerHTML = `
        <div class="verdict-card" role="alert">
          <p>${data.message || 'I can only help with election process questions.'}</p>
          <span class="responsible-ai-badge">🛡️ Responsible AI</span>
        </div>`;
      return;
    }

    renderWhatIfAnswer(resultContainer, data);

  } catch (error) {
    debugLog('What-if jsonMode failed, retrying as plain text', error);

    // Fallback: plain text call — show the raw answer without structured formatting
    try {
      const fallbackPrompt = `You are an Indian election assistant. Answer this voter question factually in ${session.languageLabel || 'English'} in 2-3 sentences: "${sanitised}"`;
      const rawText = await callGemini(fallbackPrompt, { jsonMode: false, maxTokens: 400 });
      const text = typeof rawText === 'string' ? rawText : (rawText.text || '');
      
      if (text) {
        resultContainer.innerHTML = `
          <div class="verdict-card verdict-card--FACT" role="article">
            <h3 class="verdict-card__title">📋 Scenario Answer</h3>
            <p class="verdict-card__explanation">${text}</p>
            <div class="verdict-card__source">
              <strong>Official Contact:</strong> <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">eci.gov.in</a> · Helpline: 1950
            </div>
            <span class="responsible-ai-badge" style="margin-top:var(--space-md);">🛡 Powered by Gemini</span>
          </div>`;
      } else {
        throw new Error('Empty fallback response');
      }
    } catch (fallbackError) {
      debugLog('What-if fallback also failed', fallbackError);
      resultContainer.innerHTML = `<div class="verdict-card"><p>${t('error_generic') || 'Could not get an answer right now. Please try again in a moment.'}</p></div>`;
    }
  }
}

/**
 * Renders a structured what-if answer card.
 * @param {HTMLElement} container - The result container element
 * @param {Object} data - Parsed Gemini response with answer/steps/officialContact/isUrgent
 */
function renderWhatIfAnswer(container, data) {
  const stepsHtml = data.steps && data.steps.length > 0
    ? `<ol style="padding-left:1.5rem; margin:var(--space-md) 0;">
        ${data.steps.map(s => `<li style="margin-bottom:4px;">${s}</li>`).join('')}
       </ol>`
    : '';

  const contactHref = data.officialContact && data.officialContact.startsWith('http')
    ? data.officialContact
    : `https://${data.officialContact}`;

  container.innerHTML = `
    <div class="verdict-card verdict-card--FACT" role="article" aria-label="Scenario answer">
      <h3 class="verdict-card__title">📋 Scenario Answer</h3>
      <p class="verdict-card__explanation">${data.answer}</p>
      ${stepsHtml}
      <div class="verdict-card__source">
        <strong>Official Contact:</strong>
        <a href="${contactHref}" target="_blank" rel="noopener noreferrer">${data.officialContact}</a>
      </div>
      ${data.isUrgent ? `<div class="badge badge--MYTH" style="margin-top:var(--space-md);">⚠️ Urgent — Act Quickly</div>` : ''}
      <span class="responsible-ai-badge" style="margin-top:var(--space-md);">🛡 Powered by Gemini</span>
    </div>
  `;
}

// ===== QUIZ MODULE =====
// 30 generic, non-partisan Indian election process questions
const QUIZ_BANK = [
  { q: "What is the minimum voting age in India?", opts: ["16 years", "18 years", "21 years", "25 years"], ans: 1, exp: "The Constitution (61st Amendment) Act, 1988 lowered the voting age from 21 to 18 years." },
  { q: "What does ECI stand for?", opts: ["Election Council of India", "Electoral Commission of India", "Election Commission of India", "Electoral Control Institute"], ans: 2, exp: "ECI stands for the Election Commission of India, the constitutional body that oversees elections." },
  { q: "What is EPIC?", opts: ["Electronic Polling Identity Card", "Elector's Photo Identity Card", "Electronic Process Identity Certificate", "Electoral Party Identity Code"], ans: 1, exp: "EPIC stands for Elector's Photo Identity Card — your Voter ID card issued by ECI." },
  { q: "What is an EVM?", opts: ["Electronic Vote Machine", "Electoral Voting Method", "Electronic Voting Machine", "Enabled Voter Module"], ans: 2, exp: "EVM stands for Electronic Voting Machine, used in Indian elections since the 1980s." },
  { q: "What is NOTA in Indian elections?", opts: ["No Option To Accept", "None Of The Above", "Not One Time Applicable", "National Optional Ticket Arrangement"], ans: 1, exp: "NOTA (None Of The Above) was introduced by the Supreme Court in 2013, allowing voters to reject all candidates." },
  { q: "Which article of the Indian Constitution establishes the Election Commission?", opts: ["Article 324", "Article 312", "Article 226", "Article 370"], ans: 0, exp: "Article 324 of the Indian Constitution vests the superintendence, direction, and control of elections in the Election Commission of India." },
  { q: "What is the Model Code of Conduct (MCC)?", opts: ["A law passed by Parliament", "Guidelines for voter behaviour", "A set of guidelines for political parties and candidates during elections", "A code for election officials"], ans: 2, exp: "The MCC is a set of guidelines issued by ECI to regulate political parties and candidates during the election period." },
  { q: "What is a 'Returning Officer'?", opts: ["An official who returns rejected ballot papers", "An officer responsible for conducting elections in a constituency", "A candidate who returns after losing an election", "An officer who manages voter returns"], ans: 1, exp: "A Returning Officer is a government official responsible for conducting the election in a constituency and declaring results." },
  { q: "What is VVPAT?", opts: ["Verified Voter Paper Audit Trail", "Virtual Voter Processing and Tallying", "Voter Verified Provisional Acknowledgment Trail", "Validated Voting Process Audit Tool"], ans: 0, exp: "VVPAT (Voter Verifiable Paper Audit Trail) is a printer attached to EVMs that lets voters verify their vote was cast correctly." },
  { q: "How many phases did the 2024 Lok Sabha election have?", opts: ["5", "6", "7", "9"], ans: 2, exp: "The 2024 General Elections were conducted in 7 phases across different dates." },
  { q: "What is the National Voter Service Portal (NVSP) used for?", opts: ["Watching election results live", "Paying election taxes", "Online voter registration, name search, and ID card requests", "Downloading voter manifesto"], ans: 2, exp: "NVSP (voters.eci.gov.in) allows citizens to register as voters, search their name, and apply for corrections online." },
  { q: "What is the purpose of a 'Booth Level Officer' (BLO)?", opts: ["To count votes at a booth", "To maintain and update the electoral roll for a polling area", "To operate the EVM", "To manage candidate nominations"], ans: 1, exp: "A BLO is a government official assigned to maintain and update the electoral roll for a specific polling booth area." },
  { q: "The Representation of the People Act was passed in which year?", opts: ["1947", "1950", "1951", "1961"], ans: 2, exp: "The Representation of the People Act 1951 governs the conduct of elections to the Parliament and State Legislatures." },
  { q: "What does 'Summary Revision' of electoral rolls mean?", opts: ["A final count of all votes", "A periodic review to add, delete, or correct voter entries", "A summary of election results", "A revision of the constitution"], ans: 1, exp: "Summary Revision is a periodic process where the electoral roll is updated by adding new eligible voters and removing those who have died or moved." },
  { q: "What is the silent period before an election?", opts: ["The day results are announced", "48 hours before voting begins, when campaigning is banned", "The time when EVMs are sealed", "The period after results when no one can protest"], ans: 1, exp: "The Election Commission prohibits campaigning 48 hours before the close of polling to give voters time for undisturbed decision-making." },
  { q: "Which document is NOT accepted as alternative ID at a polling booth?", opts: ["Aadhaar Card", "Passport", "PAN Card", "Ration Card"], ans: 2, exp: "PAN Card is generally not in ECI's list of 12 alternative photo ID documents. Aadhaar, Passport, and Driving Licence are accepted alternatives." },
  { q: "What is a 'By-Election'?", opts: ["An election held to fill a seat vacated between general elections", "An election where voters choose between two parties", "An election for local bodies only", "A practice election held before the main vote"], ans: 0, exp: "A By-Election (or bye-election) is held to fill a vacancy in a constituency that arises between general elections due to death, resignation, or disqualification." },
  { q: "What is the 'Swing Voter' concept in elections?", opts: ["A voter who casts multiple votes", "A voter who switches party support between elections", "A voter on a swing in a polling booth", "A voter who is undecided and doesn't vote"], ans: 1, exp: "A swing voter is someone who is not firmly committed to any party and may switch their vote from one election to the next." },
  { q: "What does the Delimitation Commission do?", opts: ["Determines the budget for elections", "Redraws the boundaries of parliamentary and assembly constituencies", "Verifies candidate eligibility", "Manages the EVM deployment"], ans: 1, exp: "The Delimitation Commission is responsible for redrawing the boundaries of constituencies based on the latest Census data." },
  { q: "How is the Chief Election Commissioner appointed?", opts: ["Elected by Parliament", "Appointed by the President of India on the advice of a Committee", "Appointed by the Prime Minister alone", "Elected by State Governors"], ans: 1, exp: "As per the Chief Election Commissioner and Other Election Commissioners Act 2023, the CEC is appointed by the President on the recommendation of a selection committee." },
  { q: "What is a 'Postal Ballot'?", opts: ["A ballot sent to voters by post", "A voting method for those unable to physically visit their polling booth (e.g., military, senior citizens)", "A ballot for NRI voters", "A digital ballot sent via email"], ans: 1, exp: "Postal Ballot allows certain voters (Armed Forces, senior citizens, persons with disability, essential service workers) to vote without physically attending the polling booth." },
  { q: "What is the Conduct of Elections Rules, 1961?", opts: ["Rules for candidate conduct", "Detailed rules for the procedure of elections in India", "Rules for voter conduct in a polling booth", "Rules for media coverage during elections"], ans: 1, exp: "The Conduct of Elections Rules, 1961 specify the detailed procedures for conducting elections, including nomination, voting, and counting." },
  { q: "What is the 'Anti-Defection Law' in India?", opts: ["A law against voter defection", "A law that disqualifies elected members who switch parties", "A law against defecting from a polling booth", "A law for preventing election fraud"], ans: 1, exp: "The Anti-Defection Law (10th Schedule) disqualifies an elected member if they voluntarily give up party membership or vote against party direction." },
  { q: "How many seats are in the Lok Sabha?", opts: ["543", "250", "545", "552"], ans: 0, exp: "The Lok Sabha has 543 directly elected seats. Two seats for Anglo-Indians were abolished by the 104th Constitutional Amendment." },
  { q: "What is the minimum age to contest a Lok Sabha election?", opts: ["18 years", "21 years", "25 years", "30 years"], ans: 2, exp: "A candidate must be at least 25 years of age to contest elections for the Lok Sabha or State Legislative Assemblies." },
  { q: "What is the tenure of a Lok Sabha?", opts: ["4 years", "5 years", "6 years", "7 years"], ans: 1, exp: "The Lok Sabha has a tenure of 5 years from the date of its first sitting, unless dissolved earlier." },
  { q: "What happens if NOTA gets the highest votes in an election?", opts: ["The election is cancelled", "The second-highest candidate wins", "A fresh election is held", "The candidate with the most real votes wins"], ans: 3, exp: "Currently in India, if NOTA gets the most votes, the candidate with the next highest votes still wins. NOTA cannot win an election under current law." },
  { q: "What is Section 126 of the Representation of the People Act?", opts: ["Allows proxy voting", "Prohibits election campaign and advertising 48 hours before polling", "Allows postal voting", "Defines the role of the Returning Officer"], ans: 1, exp: "Section 126 prohibits holding public meetings, processions, or displaying election matter 48 hours before the close of polling in a constituency." },
  { q: "What is the Voters' Helpline number in India?", opts: ["112", "1800", "1950", "100"], ans: 2, exp: "The ECI Voter Helpline number is 1950. You can call this number to find your name on the voter list, your polling booth, and to report violations." },
  { q: "Which symbol is printed next to a candidate's name if they are an independent candidate?", opts: ["A blank box", "Their own chosen symbol allotted by ECI", "A star mark", "The national flag"], ans: 1, exp: "Independent candidates are allotted a symbol from ECI's list of free symbols. They can also request a specific symbol subject to availability." }
];

const QUIZ_PASS_THRESHOLD = 0.75; // 75%
const QUIZ_QUESTIONS_PER_SESSION = 5;

let quizQuestions = [];
let currentQuizStep = 0;
let quizScore = 0;

/**
 * Shuffles an array in-place using Fisher-Yates algorithm.
 * @param {Array} arr
 * @returns {Array}
 */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  document.getElementById('quiz-intro').hidden = true;
  const activeContainer = document.getElementById('quiz-active');
  activeContainer.hidden = false;

  quizQuestions = shuffleArray(QUIZ_BANK).slice(0, QUIZ_QUESTIONS_PER_SESSION);
  currentQuizStep = 0;
  quizScore = 0;

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const totalQ = QUIZ_QUESTIONS_PER_SESSION;

  if (currentQuizStep >= totalQ) {
    showQuizResult();
    return;
  }

  const q = quizQuestions[currentQuizStep];
  const qNum = currentQuizStep + 1;

  document.getElementById('quiz-progress-fill').style.width = `${(qNum / totalQ) * 100}%`;
  document.getElementById('quiz-progress-label').textContent = `Question ${qNum} of ${totalQ}`;

  document.getElementById('quiz-question-container').innerHTML = `
    <div class="onboarding__card" role="group" aria-labelledby="quiz-q-text">
      <h2 class="onboarding__question" id="quiz-q-text">${q.q}</h2>
      <div style="display:flex; flex-direction:column; gap:var(--space-sm); margin-bottom:var(--space-lg);">
        ${q.opts.map((opt, i) => `
          <button class="btn btn--ghost quiz-option"
                  id="quiz-opt-${i}"
                  aria-label="Option ${i + 1}: ${opt}"
                  onclick="handleQuizAnswer(${i})">
            ${opt}
          </button>
        `).join('')}
      </div>
      <div id="quiz-feedback" aria-live="polite"></div>
    </div>
  `;
}

function handleQuizAnswer(selectedIndex) {
  const q = quizQuestions[currentQuizStep];
  const isCorrect = selectedIndex === q.ans;
  if (isCorrect) quizScore++;

  // Visually mark correct/wrong
  document.querySelectorAll('.quiz-option').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.ans) {
      btn.style.borderColor = 'var(--color-fact)';
      btn.style.background = 'rgba(56,142,60,0.1)';
      btn.style.color = 'var(--color-fact)';
    } else if (i === selectedIndex && !isCorrect) {
      btn.style.borderColor = 'var(--color-myth)';
      btn.style.background = 'rgba(211,47,47,0.08)';
      btn.style.color = 'var(--color-myth)';
    }
  });

  const feedback = document.getElementById('quiz-feedback');
  const isLast = currentQuizStep === QUIZ_QUESTIONS_PER_SESSION - 1;
  feedback.innerHTML = `
    <div style="padding:var(--space-md); border-radius:var(--radius-md); margin-top:var(--space-sm);
                background:${isCorrect ? 'rgba(56,142,60,0.08)' : 'rgba(211,47,47,0.08)'};
                border: 1px solid ${isCorrect ? 'var(--color-fact)' : 'var(--color-myth)'};">
      <p style="font-weight:700; color:${isCorrect ? 'var(--color-fact)' : 'var(--color-myth)'}; margin-bottom:6px;">
        ${isCorrect ? '✅ Correct!' : '❌ Incorrect'}
      </p>
      <p style="font-size:var(--font-size-sm); color:var(--color-text-secondary);">${q.exp}</p>
      <button class="btn btn--primary" style="margin-top:var(--space-md); width:100%;"
              onclick="nextQuizQuestion()">
        ${isLast ? 'See Results' : 'Next Question →'}
      </button>
    </div>
  `;
}

function nextQuizQuestion() {
  currentQuizStep++;
  renderQuizQuestion();
}

function showQuizResult() {
  const totalQ = QUIZ_QUESTIONS_PER_SESSION;
  const pct = quizScore / totalQ;
  const passed = pct >= QUIZ_PASS_THRESHOLD;

  document.getElementById('quiz-progress-fill').style.width = '100%';
  document.getElementById('quiz-progress-label').textContent = `Completed`;

  document.getElementById('quiz-question-container').innerHTML = `
    <div style="text-align:center; padding:var(--space-xl) 0;" role="region" aria-label="Quiz result">
      <div style="font-size:56px; margin-bottom:var(--space-md);" aria-hidden="true">${passed ? '🎉' : '📚'}</div>
      <h2 style="color:${passed ? 'var(--color-fact)' : 'var(--color-myth)'}; margin-bottom:var(--space-sm);">
        ${passed ? 'You Passed!' : 'Keep Practising!'}
      </h2>
      <p style="font-size:var(--font-size-xl); font-weight:700; color:var(--color-text-primary); margin-bottom:var(--space-sm);">
        ${quizScore} / ${totalQ} correct (${Math.round(pct * 100)}%)
      </p>
      <p style="color:var(--color-text-secondary); margin-bottom:var(--space-xl);">
        ${passed
          ? '🗳️ Congratulations! You are ready for elections / voting. Your civic knowledge is strong!'
          : 'You need 75% to pass. Try again with a new set of questions to improve your score.'
        }
      </p>
      ${passed
        ? `<button class="btn btn--primary" onclick="switchTab('timeline')">Explore Timeline →</button>`
        : `<button class="btn btn--primary" onclick="retryQuiz()">🔄 Retry with New Questions</button>`
      }
      <div style="margin-top:var(--space-lg);">
        <span class="responsible-ai-badge">🛡️ Responsible AI · Politically Neutral</span>
      </div>
    </div>
  `;
}

function retryQuiz() {
  quizQuestions = shuffleArray(QUIZ_BANK).slice(0, QUIZ_QUESTIONS_PER_SESSION);
  currentQuizStep = 0;
  quizScore = 0;
  document.getElementById('quiz-progress-fill').style.width = '0%';
  renderQuizQuestion();
}
