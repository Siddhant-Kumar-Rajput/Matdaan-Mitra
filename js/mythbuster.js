/**
 * @file mythbuster.js
 * @description Myth classification and fact-check log.
 * @module MatDaanMitra
 */

const EXAMPLE_MYTHS = [
  "You cannot vote if you don't have an Aadhaar card",
  "Only educated people can vote in India",
  "You need to re-register before every election",
  "EVMs (voting machines) can be hacked easily",
  "Women are not allowed to vote in some states",
  "If your name isn't on the list, you can still vote on the day",
  "NOTA means your vote is wasted"
];

document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  document.getElementById('current-lang-display').textContent = session.languageLabel || 'English';

  const container = document.getElementById('myth-quick-claims');
  container.innerHTML = EXAMPLE_MYTHS.map(m => `
    <button class="btn btn--ghost btn--sm" style="background:var(--color-surface-alt); border:1px solid var(--color-border);" onclick="setAndCheckClaim('${m}')">${m}</button>
  `).join('');

  const input = document.getElementById('myth-input');
  const counter = document.getElementById('myth-input-counter');
  const submitBtn = document.getElementById('myth-submit');

  input.addEventListener('input', () => {
    counter.textContent = `${input.value.length} / 500`;
    submitBtn.disabled = input.value.trim().length < 5;
  });

  submitBtn.addEventListener('click', () => {
    if (input.value.trim().length >= 5) checkClaim(input.value);
  });

  renderMythLog();
});

function setAndCheckClaim(claim) {
  const input = document.getElementById('myth-input');
  input.value = claim;
  document.getElementById('myth-input-counter').textContent = `${claim.length} / 500`;
  document.getElementById('myth-submit').disabled = false;
  checkClaim(claim);
}

async function crossReferenceFactCheck(claim) {
  const session = getSession();
  const endpoint = `https://factchecktools.googleapis.com/v1alpha1/claims:search`;
  const params = new URLSearchParams({
    key: CONFIG.FACT_CHECK_API_KEY,
    query: claim,
    languageCode: session.language || 'en',
    pageSize: 3
  });

  try {
    const response = await fetch(`${endpoint}?${params}`);
    const data = await response.json();
    return (data.claims || []).map(item => ({
      text: item.text,
      claimant: item.claimant,
      rating: item.claimReview?.[0]?.textualRating,
      publisher: item.claimReview?.[0]?.publisher?.name,
      url: item.claimReview?.[0]?.url
    }));
  } catch {
    return [];
  }
}

async function checkClaim(claimText) {
  const { sanitised, isRejected, rejectionReason } = sanitiseInput(claimText);
  if (isRejected) {
    if (rejectionReason === 'injection_attempt') logRejectedQuery(claimText, rejectionReason);
    alert(REJECTION_MESSAGES[rejectionReason] || 'Invalid input.');
    return;
  }

  const container = document.getElementById('verdict-container');
  container.innerHTML = `<div class="verdict-card" aria-busy="true"><p>${t('loading')}</p></div>`;

  const session = getSession();
  const prompt = `
You are MatDaan Mitra, a neutral election fact-checker for India. A user has submitted this claim:

"${sanitised}"

Evaluate this claim in the context of Indian elections and civic processes.
Respond in ${session.languageLabel || 'English'} as JSON:

{
  "verdict": "FACT" | "MYTH" | "PARTIAL" | "OOS",
  "confidence": "high" | "medium" | "low",
  "title": "short verdict headline (max 8 words)",
  "explanation": "clear 2-4 sentence explanation in plain language",
  "nuance": "additional context or caveat (optional, can be empty string)",
  "source": "name of the authority or document that settles this",
  "sourceUrl": "official URL if available, else empty string",
  "isOutOfScope": false
}

STRICT RULES:
1. If the claim is about a specific political party, candidate, or their policies — set verdict to "OOS" and isOutOfScope to true. Respond: "I can only fact-check claims about election processes and voter rights, not political opinions."
2. If the claim could harm voter confidence without basis, flag it clearly as MYTH with strong explanation.
3. Never take a political side. Stick to procedural and legal facts.
4. Confidence must reflect genuine uncertainty.
5. Respond ONLY with the JSON object.
`;

  try {
    // DISBLED: Gemini API call as per user request to use offline data
    // const verdictData = await callGemini(prompt, 'mythbuster');
    
    // Use offline mock data engine
    const verdictData = getMockData('mythbuster', sanitised);
    
    if (verdictData.isOutOfScope || verdictData.verdict === 'OOS') {
      logRejectedQuery(sanitised, 'out_of_scope');
      container.innerHTML = `
        <div class="verdict-card verdict-card--OOS">
          <h3 class="verdict-card__title">Out of Scope</h3>
          <p class="verdict-card__explanation">${verdictData.explanation || REJECTION_MESSAGES.political_content}</p>
        </div>`;
      return;
    }

    const icons = { 'FACT': '✅', 'MYTH': '❌', 'PARTIAL': '⚠️' };
    const labels = { 'FACT': 'Verified Fact', 'MYTH': 'Myth / False', 'PARTIAL': 'Partially True' };

    saveMythToLog(sanitised, verdictData.verdict, verdictData.title || labels[verdictData.verdict]);

    // DISABLED: Fact-check API as per user request to use offline data only
    /*
    crossReferenceFactCheck(sanitised).then(checks => {
      // ...
    });
    */

    container.innerHTML = `
      <article class="verdict-card verdict-card--${verdictData.verdict}" role="article" aria-label="${verdictData.verdict}: ${verdictData.title || labels[verdictData.verdict]}">
        <div class="verdict-card__header">
          <span class="verdict-card__icon" role="img" aria-label="${verdictData.verdict}">${icons[verdictData.verdict]}</span>
          <div>
            <span class="verdict-card__badge badge--${verdictData.verdict}">${labels[verdictData.verdict]}</span>
          </div>
        </div>

        <h3 class="verdict-card__title">${verdictData.title || labels[verdictData.verdict]}</h3>
        <p class="verdict-card__explanation">${verdictData.explanation}</p>

        <div class="verdict-card__nuance" ${!verdictData.nuance ? 'hidden' : ''}>
          <strong>Important nuance:</strong> ${verdictData.nuance}
        </div>

        <div class="verdict-card__source">
          <strong>Based on:</strong> 
          ${verdictData.sourceUrl ? `<a href="${verdictData.sourceUrl}" target="_blank" rel="noopener noreferrer">${verdictData.source}</a>` : (verdictData.source || 'Official ECI Guidelines')}
        </div>

        <div class="verdict-card__actions">
          <button class="btn btn--ghost btn--share" aria-label="Share this fact-check result" onclick="shareFactCheck('${labels[verdictData.verdict]}', '${sanitised.replace(/'/g, "\\'")}', '${verdictData.explanation.replace(/'/g, "\\'")}')">
            Share this fact-check
          </button>
          <span class="responsible-ai-badge" title="Offline verification">
             🔒 Offline Data
          </span>
        </div>
      </article>
    `;

  } catch (error) {
    debugLog(error);
    container.innerHTML = `<div class="verdict-card"><p>${t('error_generic')}</p></div>`;
  }
}

function saveMythToLog(claim, verdict, title) {
  const session = getSession();
  session.mythLog.unshift({
    id: Date.now(),
    claim: claim.substring(0, 100),
    verdict,
    title,
    timestamp: new Date().toISOString()
  });
  setSession(session);
  renderMythLog();
}

function logRejectedQuery(claim, reason) {
  const session = getSession();
  session.rejectedQueries.push({
    claim: claim.substring(0, 100),
    reason,
    timestamp: new Date().toISOString()
  });
  setSession(session);
}

function renderMythLog() {
  const session = getSession();
  const section = document.getElementById('myth-log-section');
  const container = document.getElementById('myth-log-items');

  if (session.mythLog.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  const icons = { 'FACT': '✅', 'MYTH': '❌', 'PARTIAL': '⚠️' };
  
  container.innerHTML = session.mythLog.slice(0, 5).map(log => `
    <div class="myth-log__item">
      <span aria-hidden="true">${icons[log.verdict]}</span>
      <div style="flex:1;">
        <div style="font-size:var(--font-size-sm); font-weight:bold;">${log.title}</div>
        <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary);">${log.claim}</div>
      </div>
      <span class="badge badge--${log.verdict}">${log.verdict}</span>
    </div>
  `).join('');
}

async function shareFactCheck(verdict, claim, explanation) {
  const shareText = `✅ Fact-checked by MatDaan Mitra\n\nClaim: "${claim}"\nVerdict: ${verdict}\n\n${explanation}\n\nCheck more election facts at MatDaan Mitra!`;

  if (navigator.share) {
    try {
      await navigator.share({ text: shareText });
    } catch (e) {
      debugLog('Share cancelled', e);
    }
  } else {
    await navigator.clipboard.writeText(shareText);
    alert('Copied to clipboard!');
  }
}
