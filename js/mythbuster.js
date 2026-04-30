/**
 * @file mythbuster.js
 * @description Myth classification and fact-check log.
 * @module MatDaanMitra
 */

const EXAMPLE_MYTHS = [
  "You cannot vote if you don't have an Aadhaar card",
  "EVMs can be hacked by Bluetooth or remote control",
  "If I don't have my Voter ID card, I cannot vote at all",
  "Only people who pay income tax are allowed to vote",
  "The ink used on the finger contains a tracking chip",
  "You need to re-register for every single election",
  "Selecting NOTA means the election will be cancelled",
  "NRIs can vote online from their home countries",
  "If your name is missing from the roll, you can vote on a challenge ballot"
];

document.addEventListener('DOMContentLoaded', async () => {
  const session = getSession();
  const targetLang = session.language || 'en';
  document.getElementById('current-lang-display').textContent = session.languageLabel || 'English';

  const container = document.getElementById('myth-quick-claims');
  
  const renderMyths = (list) => {
    if (!container) return;
    container.innerHTML = list.map((m, i) => {
      const escapedM = JSON.stringify(m).replace(/"/g, '&quot;');
      const originalText = EXAMPLE_MYTHS[i] || m;
      const escapedOrig = JSON.stringify(originalText).replace(/"/g, '&quot;');
      return `
        <button class="btn btn--ghost" 
                style="width: 100%; text-align: left; padding: 16px; border-radius: 12px; font-size: 15px; border: 1px solid var(--color-border); background: #fff;" 
                onclick="checkClaim(${escapedM}, ${escapedOrig})">
          ${m} <span style="float: right;">→</span>
        </button>
      `;
    }).join('');
  };

  // 1. Initial render with English
  renderMyths(EXAMPLE_MYTHS);

  // 2. Async update with translation if needed
  if (targetLang !== 'en' && typeof translateTexts === 'function') {
    try {
      const translated = await translateTexts(EXAMPLE_MYTHS, targetLang);
      if (translated && translated.length === EXAMPLE_MYTHS.length) {
        renderMyths(translated);
      }
    } catch (e) {
      debugLog('Myth translation failed', e);
    }
  }

  renderMythLog();
});

function setAndCheckClaim(claim) {
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
}async function checkClaim(claimText, originalClaim = '') {
  const container = document.getElementById('verdict-container');
  const loadingMsg = t('loading') || 'AI is verifying this claim...';
  container.innerHTML = `
    <div class="verdict-card" aria-busy="true">
      <div class="typing-dot"></div>
      <p style="margin-top:12px;">${loadingMsg}</p>
    </div>`;

  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const session = getSession();
  const prompt = `
You are MatDaan Mitra, a neutral election fact-checker for India.
Claim to verify: "${originalClaim || claimText}"

Evaluate this claim based on official Election Commission of India (ECI) guidelines.
Respond entirely in ${session.languageLabel || 'English'}.

JSON Schema:
{
  "verdict": "FACT" | "MYTH" | "PARTIAL" | "OOS",
  "confidence": "high" | "medium" | "low",
  "title": "short translated verdict headline",
  "explanation": "clear 2-4 sentence translated explanation",
  "nuance": "translated additional context",
  "source": "name of authority",
  "sourceUrl": "official URL",
  "isOutOfScope": false
}
`;

  try {
    debugLog('Verifying myth:', originalClaim || claimText);
    const response = await callGemini(prompt, { jsonMode: false }); // Using plain text for more reliable extraction
    
    const rawText = typeof response === 'string' ? response : (response.text || '');
    let verdictData;

    // Extract JSON using regex
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        verdictData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        debugLog('Myth JSON parse error, using mock fallback');
        verdictData = getMockVerdict(claimText);
      }
    } else {
      debugLog('No JSON found in myth response, using mock fallback');
      verdictData = getMockVerdict(claimText);
    }
    
    if (verdictData.isOutOfScope || verdictData.verdict === 'OOS') {
      container.innerHTML = `
        <div class="verdict-card verdict-card--OOS">
          <h3 class="verdict-card__title">${t('verdict_oos') || 'Out of Scope'}</h3>
          <p class="verdict-card__explanation">${verdictData.explanation || "I can only fact-check claims about election processes and voter rights."}</p>
          <div class="verdict-card__actions">
             <span class="responsible-ai-badge">🛡️ Responsible AI Guardrail</span>
          </div>
        </div>`;
      return;
    }

    const icons = { 'FACT': '✅', 'MYTH': '❌', 'PARTIAL': '⚠️' };
    const labelKey = (verdictData.verdict || 'PARTIAL').toLowerCase();
    const label = t('verdict_' + labelKey) || verdictData.verdict;

    saveMythToLog(claimText, verdictData.verdict, verdictData.title || label);

    container.innerHTML = `
      <article class="verdict-card verdict-card--${verdictData.verdict}" role="article" aria-label="${verdictData.verdict}">
        <div class="verdict-card__header">
          <span class="verdict-card__icon" aria-hidden="true">${icons[verdictData.verdict] || '❓'}</span>
          <span class="verdict-card__badge badge--${verdictData.verdict}">${label}</span>
        </div>

        <h3 class="verdict-card__title">${verdictData.title || label}</h3>
        <p class="verdict-card__explanation">${verdictData.explanation}</p>

        <div class="verdict-card__nuance" ${!verdictData.nuance ? 'hidden' : ''}>
          <strong>${t('nuance') || 'Important nuance'}:</strong> ${verdictData.nuance}
        </div>

        <div class="verdict-card__source">
          <strong>${t('based_on') || 'Based on'}:</strong> 
          ${verdictData.sourceUrl ? `<a href="${verdictData.sourceUrl}" target="_blank" rel="noopener noreferrer">${verdictData.source}</a>` : (verdictData.source || 'Official ECI Guidelines')}
        </div>

        <div class="verdict-card__actions">
          <button class="btn btn--ghost btn--share" 
                  onclick="shareFactCheck(${JSON.stringify(label).replace(/"/g, '&quot;')}, ${JSON.stringify(claimText).replace(/"/g, '&quot;')}, ${JSON.stringify(verdictData.explanation || "").replace(/"/g, '&quot;')})">
            ${t('share_fact_check') || 'Share this fact-check'}
          </button>
          <span class="responsible-ai-badge">🛡 Powered by Gemini</span>
        </div>
      </article>
    `;

  } catch (error) {
    debugLog('Myth check failed', error);
    const mockVerdict = getMockVerdict(claimText);
    renderMockVerdict(container, mockVerdict, claimText);
  }
}

/**
 * Returns a fallback verdict based on the claim text.
 */
function getMockVerdict(claimText) {
  const claim = claimText.toLowerCase();
  if (claim.includes('aadhaar') || claim.includes('voter id')) {
    return {
      verdict: "PARTIAL",
      title: "Voter ID Requirements",
      explanation: "While Voter ID (EPIC) is the primary document, the ECI allows 12 alternative photo identity documents like Aadhaar, Passport, or DL.",
      nuance: "Your name must be in the electoral roll to vote, regardless of ID.",
      source: "Election Commission of India",
      sourceUrl: "https://eci.gov.in"
    };
  }
  if (claim.includes('evm') || claim.includes('hack')) {
    return {
      verdict: "MYTH",
      title: "EVM Security",
      explanation: "EVMs are standalone machines not connected to any network, Bluetooth, or WiFi. They are technically secured and physically sealed.",
      nuance: "Multiple layers of administrative and technical safeguards are in place.",
      source: "ECI EVM FAQ",
      sourceUrl: "https://eci.gov.in/evm/"
    };
  }
  return {
    verdict: "FACT",
    title: "Official Procedure",
    explanation: "Most official election procedures are designed to be transparent and accessible. Always verify with eci.gov.in.",
    nuance: "Rules may vary slightly for special categories like NRIs or Service Voters.",
    source: "Election Commission",
    sourceUrl: "https://eci.gov.in"
  };
}

/**
 * Renders a mock verdict in the container.
 */
function renderMockVerdict(container, data, claimText) {
  const icons = { 'FACT': '✅', 'MYTH': '❌', 'PARTIAL': '⚠️' };
  container.innerHTML = `
    <article class="verdict-card verdict-card--${data.verdict}">
      <div class="verdict-card__header">
        <span class="verdict-card__icon">${icons[data.verdict]}</span>
        <span class="verdict-card__badge badge--${data.verdict}">${data.verdict}</span>
      </div>
      <h3 class="verdict-card__title">${data.title}</h3>
      <p class="verdict-card__explanation">${data.explanation}</p>
      <div class="verdict-card__source">Based on: ${data.source}</div>
      <div class="verdict-card__actions"><span class="responsible-ai-badge">🛡️ Fallback Verification</span></div>
    </article>
  `;
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

  if (!session.mythLog || session.mythLog.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  const icons = { 'FACT': '✅', 'MYTH': '❌', 'PARTIAL': '⚠️' };
  
  // Clear and render safely
  container.innerHTML = '';
  session.mythLog.slice(0, 5).forEach(log => {
    const item = document.createElement('div');
    item.className = 'myth-log__item';
    
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = icons[log.verdict] || '❓';
    
    const content = document.createElement('div');
    content.style.flex = '1';
    
    const title = document.createElement('div');
    title.style.fontSize = 'var(--font-size-sm)';
    title.style.fontWeight = 'bold';
    title.textContent = log.title;
    
    const claim = document.createElement('div');
    claim.style.fontSize = 'var(--font-size-xs)';
    claim.style.color = 'var(--color-text-secondary)';
    claim.textContent = log.claim;
    
    content.appendChild(title);
    content.appendChild(claim);
    
    const badge = document.createElement('span');
    badge.className = `badge badge--${log.verdict}`;
    badge.textContent = log.verdict;
    
    item.appendChild(icon);
    item.appendChild(content);
    item.appendChild(badge);
    container.appendChild(item);
  });
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
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    } catch (err) {
      debugLog('Clipboard failed', err);
    }
  }
}
