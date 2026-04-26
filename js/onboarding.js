/**
 * @file onboarding.js
 * @description Adaptive question flow logic for onboarding with modern stepper UI.
 * @module MatDaanMitra
 *
 * @security Saves profile to sessionStorage.
 */

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const STEP_CONFIG = [
  { icon: '🗳', hint: 'This helps us personalise your experience' },
  { icon: '📍', hint: 'We will show election info specific to your region' },
  { icon: '🏙', hint: 'Enter your city, town, or constituency name' },
  { icon: '🪪', hint: 'This determines your election-readiness checklist' }
];

let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
  renderStep(1);

  document.getElementById('onboarding-back').addEventListener('click', async () => {
    if (currentStep > 1) {
      await advanceToStep(currentStep - 1, true);
    }
  });
});

/**
 * Updates the visual stepper dots and connecting lines.
 *
 * @param {number} step - The current active step (1-4)
 */
function updateStepper(step) {
  const dots = document.querySelectorAll('.ob-stepper__dot');
  const lines = document.querySelectorAll('.ob-stepper__line');

  dots.forEach((dot, i) => {
    const stepNum = i + 1;
    dot.classList.remove('ob-stepper__dot--active', 'ob-stepper__dot--done');
    if (stepNum === step) {
      dot.classList.add('ob-stepper__dot--active');
      dot.textContent = stepNum;
    } else if (stepNum < step) {
      dot.classList.add('ob-stepper__dot--done');
      dot.textContent = '✓';
    } else {
      dot.textContent = stepNum;
    }
  });

  lines.forEach((line, i) => {
    if (i + 1 < step) {
      line.classList.add('ob-stepper__line--done');
    } else {
      line.classList.remove('ob-stepper__line--done');
    }
  });

  const stepper = document.getElementById('ob-stepper');
  stepper.setAttribute('aria-valuenow', step);
  stepper.setAttribute('aria-label', `Step ${step} of 4`);
}

/**
 * Renders the content for a given onboarding step.
 *
 * @param {number} step - The step number to render (1-4)
 */
async function renderStep(step) {
  currentStep = step;

  const questionEl = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');
  const backBtn = document.getElementById('onboarding-back');
  const iconEl = document.getElementById('ob-icon');
  const hintEl = document.getElementById('ob-hint');

  updateStepper(step);

  const cfg = STEP_CONFIG[step - 1];
  iconEl.textContent = cfg.icon;
  hintEl.textContent = cfg.hint;

  if (step === 1) {
    backBtn.hidden = true;
    questionEl.textContent = t('q1_text');
    optionsContainer.className = 'ob-options';
    optionsContainer.innerHTML = `
      <button class="ob-opt" onclick="saveAnswerAndNext('isFirstTimeVoter', true)">
        <span class="ob-opt__icon">✋</span> ${t('q1_yes')}
      </button>
      <button class="ob-opt" onclick="saveAnswerAndNext('isFirstTimeVoter', false)">
        <span class="ob-opt__icon">👍</span> ${t('q1_no')}
      </button>
    `;
  } else if (step === 2) {
    backBtn.hidden = false;
    questionEl.textContent = t('q2_text');
    optionsContainer.className = 'ob-options';

    optionsContainer.innerHTML = `<p style="color: rgba(255,255,255,0.4); font-size:14px;">${t('loading') || 'Loading states...'}</p>`;

    const session = getSession();
    const translatedStates = await translateTexts(STATES, session.language || 'en');

    const optionsHtml = STATES.map((state, i) => `<option value="${state}">${translatedStates[i]}</option>`).join('');
    optionsContainer.innerHTML = `
      <select id="state-select" class="ob-input" aria-label="Select state">
        <option value="" disabled selected>${t('q2_placeholder')}</option>
        ${optionsHtml}
      </select>
      <button class="ob-continue" onclick="saveStateAndNext()">${t('next') || 'Continue'} →</button>
    `;
  } else if (step === 3) {
    backBtn.hidden = false;
    questionEl.textContent = t('q3_text');
    optionsContainer.className = 'ob-options';
    optionsContainer.innerHTML = `
      <input type="text" id="constituency-input" class="ob-input" placeholder="${t('q3_placeholder')}" aria-label="Constituency or city" autocomplete="off">
      <button class="ob-continue" onclick="saveConstituencyAndNext()">${t('next') || 'Continue'} →</button>
    `;
    setTimeout(() => {
      const input = document.getElementById('constituency-input');
      if (input) input.focus();
    }, 400);
  } else if (step === 4) {
    backBtn.hidden = false;
    questionEl.textContent = t('q4_text');
    optionsContainer.className = 'ob-options';
    optionsContainer.innerHTML = `
      <button class="ob-opt" onclick="saveAnswerAndNext('hasEpicCard', true)">
        <span class="ob-opt__icon">✅</span> ${t('q4_yes')}
      </button>
      <button class="ob-opt" onclick="saveAnswerAndNext('hasEpicCard', false)">
        <span class="ob-opt__icon">❌</span> ${t('q4_no')}
      </button>
      <button class="ob-opt" onclick="saveAnswerAndNext('hasEpicCard', null)">
        <span class="ob-opt__icon">🤔</span> ${t('q4_unsure')}
      </button>
    `;
  }
}

/**
 * Animates the transition between onboarding steps.
 *
 * @param {number} nextStep - The step to advance to
 * @param {boolean} isBack - Whether we are going backwards
 */
async function advanceToStep(nextStep, isBack = false) {
  const card = document.getElementById('onboarding-card');

  card.style.transform = isBack ? 'translateX(60px)' : 'translateX(-60px)';
  card.style.opacity = '0';

  await sleep(250);

  const session = getSession();

  // Validation: Skip Step 4 (EPIC card) if not a first-time voter
  if (nextStep === 4 && session.isFirstTimeVoter === false) {
    session.hasEpicCard = true;
    setSession(session);
    nextStep = 5;
  }

  if (nextStep > 4) {
    session.onboardingComplete = true;
    setSession(session);
    
    // Show finishing state
    const questionEl = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const iconEl = document.getElementById('ob-icon');
    const hintEl = document.getElementById('ob-hint');
    
    iconEl.textContent = '🎊';
    questionEl.textContent = t('onboarding_finishing') || 'Setting up your dashboard...';
    hintEl.textContent = t('onboarding_finishing_hint') || 'Personalising your election guide';
    optionsContainer.innerHTML = '<div class="typing-dot" style="margin: 0 auto;"></div>';
    
    // Pre-fetch checklist data if personalisation is enabled
    try {
      const prompt = `
        Generate a personalised pre-election checklist for a voter in India:
        - State: ${session.state}
        - Constituency: ${session.constituency}
        - First-time voter: ${session.isFirstTimeVoter}
        - Has EPIC: ${session.hasEpicCard}
        Respond ONLY with a JSON array of 5-8 checklist items.
      `;
      const checklist = await callGemini(prompt, 'checklist');
      if (checklist) {
        session.cachedChecklist = Array.isArray(checklist) ? checklist : (checklist.items || []);
        setSession(session);
      }
    } catch (e) {
      debugLog('Pre-fetch failed', e);
    }

    card.style.transform = 'scale(0.9)';
    card.style.opacity = '0';
    await sleep(300);
    window.location.href = './dashboard.html';
    return;
  }

  if (nextStep < 1) {
    nextStep = 1;
  }

  await renderStep(nextStep);

  card.style.transition = 'none';
  card.style.transform = isBack ? 'translateX(-40px)' : 'translateX(40px)';
  card.style.opacity = '0';

  void card.offsetWidth;

  card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease';
  card.style.transform = 'translateX(0)';
  card.style.opacity = '1';

  const focusable = card.querySelector('button, select, input');
  if (focusable) focusable.focus();
}

/**
 * Saves a key-value pair to session and advances to the next step.
 *
 * @param {string} key - The session key
 * @param {*} value - The value to save
 */
function saveAnswerAndNext(key, value) {
  const session = getSession();
  session[key] = value;
  setSession(session);
  advanceToStep(currentStep + 1);
}

/**
 * Saves the selected state and advances.
 */
function saveStateAndNext() {
  const select = document.getElementById('state-select');
  if (select.value) {
    saveAnswerAndNext('state', select.value);
  }
}

/**
 * Saves the constituency input and advances.
 */
function saveConstituencyAndNext() {
  const input = document.getElementById('constituency-input');
  if (input.value.trim().length > 0) {
    const { sanitised, isRejected } = sanitiseInput(input.value);
    if (!isRejected) {
      saveAnswerAndNext('constituency', sanitised);
      return;
    }
  }
  input.classList.add('ob-input--error');
  input.focus();
  setTimeout(() => input.classList.remove('ob-input--error'), 600);
}
