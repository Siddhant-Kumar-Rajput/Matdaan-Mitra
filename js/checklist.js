/**
 * @file checklist.js
 * @description Generates the personalised voter checklist.
 * @module MatDaanMitra
 */

let checklistData = [];

document.addEventListener('DOMContentLoaded', async () => {
  const session = getSession();
  document.getElementById('current-lang-display').textContent = session.languageLabel || 'English';
  
  await loadChecklist();
});

async function loadChecklist() {
  const session = getSession();
  
  if (session.cachedChecklist && Array.isArray(session.cachedChecklist)) {
    checklistData = session.cachedChecklist;
    renderChecklist();
    return;
  }

  const prompt = `
You are MatDaan Mitra. The user is a voter in India with the following profile:
- State: ${session.state}
- Constituency: ${session.constituency}
- First-time voter: ${session.isFirstTimeVoter}
- Has EPIC (Voter ID) card: ${session.hasEpicCard}
- Language: ${session.languageLabel || 'English'}

Generate a personalised pre-election checklist as a JSON array. Each item must have:
{
  "id": "unique-kebab-case-id",
  "category": "Documents | Logistics | Day-of | Knowledge",
  "title": "short action title in ${session.languageLabel || 'English'}",
  "description": "one sentence explaining why this matters in ${session.languageLabel || 'English'}",
  "priority": "high | medium | low",
  "isCompleted": false,
  "helpUrl": "relevant official URL (eci.gov.in, nvsp.in, or voters.eci.gov.in)",
  "stateSpecific": true
}

Rules:
1. If hasEpicCard is false, include "Get/verify your EPIC card" as HIGH priority
2. If isFirstTimeVoter is true, include "Check your name on the electoral roll" as HIGH priority
3. Always include "Find your polling booth" (use Maps integration, not a link)
4. Always include "Know your voting rights" with a brief description
5. Include state-specific rules for ${session.state} if you know them (e.g. dry day, ID alternatives)
6. Maximum 10 items. Minimum 5. Prioritise items the user actually needs to act on.
7. Respond ONLY with the JSON array. No preamble, no markdown code fences.

Context: Valid alternate voter ID documents (ECI-approved) include Aadhaar, PAN card, Driving Licence, Passport, MNREGA Job Card, Health Insurance Smart Card, Pension document with photo, Service ID cards (government), Passbook with photo, Smart Card (NPRS).
`;

  try {
    const data = await callGemini(prompt, 'checklist');
    checklistData = Array.isArray(data) ? data : (data.items || []);
    
    // Cache it
    session.cachedChecklist = checklistData;
    setSession(session);
    
    document.getElementById('checklist-loading').hidden = true;
    document.getElementById('checklist-container').hidden = false;
    renderChecklist();
  } catch (error) {
    debugLog('Checklist error', error);
    document.getElementById('checklist-loading').innerHTML = `<p>${t('error_generic')}</p>`;
  }
}

function renderChecklist() {
  const container = document.getElementById('checklist-items');
  const session = getSession();
  
  if (checklistData.length > 0) {
    document.getElementById('checklist-loading').hidden = true;
    document.getElementById('checklist-container').hidden = false;
  }
  
  let completedCount = 0;
  
  container.innerHTML = checklistData.map(item => {
    const isCompleted = session.checklistStatus[item.id] || false;
    if (isCompleted) completedCount++;
    
    return `
      <article class="checklist__item ${isCompleted ? 'checklist__item--completed' : ''}" 
               data-id="${item.id}" 
               data-priority="${item.priority}"
               role="listitem"
               aria-label="${item.title} — ${item.category}">
        
        <button class="checklist__toggle" 
                aria-pressed="${isCompleted}"
                aria-label="Mark ${item.title} as complete"
                onclick="toggleChecklistItem('${item.id}')">
          <span class="checklist__checkbox" aria-hidden="true"></span>
        </button>

        <div class="checklist__content">
          <div class="checklist__header">
            <span class="checklist__category badge badge--${item.category === 'Documents' ? 'OOS' : 'FACT'}">${item.category}</span>
            <span class="checklist__priority priority--${item.priority}">${item.priority}</span>
          </div>
          <h3 class="checklist__title">${item.title}</h3>
          <p class="checklist__desc">${item.description}</p>
          <a href="${item.helpUrl}" 
             class="checklist__link" 
             target="_blank" 
             rel="noopener noreferrer"
             aria-label="Learn more about ${item.title} (opens in new tab)">
            Official source ↗
          </a>
        </div>
      </article>
    `;
  }).join('');
  
  document.getElementById('checklist-progress').textContent = `${completedCount} ${t('of')} ${checklistData.length} steps done`;
}

window.toggleChecklistItem = function(id) {
  const session = getSession();
  session.checklistStatus[id] = !session.checklistStatus[id];
  setSession(session);
  renderChecklist();
};
