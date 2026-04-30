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

  showLoader('checklist-loading', t('loading'));
  
  try {
    await new Promise(r => setTimeout(r, 600)); // artificial delay for UX
    
    checklistData = await getOfflineChecklist(session.language || 'en', session);
    
    // Cache it
    session.cachedChecklist = checklistData;
    setSession(session);
    
    hideLoader('checklist-loading');
    document.getElementById('checklist-loading').hidden = true;
    document.getElementById('checklist-container').hidden = false;
    renderChecklist();
  } catch (error) {
    debugLog('Checklist error', error);
    showError('checklist-loading');
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
            <span class="checklist__category badge badge--FACT">${item.category}</span>
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
  
  document.getElementById('checklist-progress').textContent = t('checklist_progress', {done: completedCount, total: checklistData.length});
}

window.toggleChecklistItem = function(id) {
  const session = getSession();
  session.checklistStatus[id] = !session.checklistStatus[id];
  setSession(session);
  renderChecklist();
};
