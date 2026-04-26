# Skill: Myth vs Fact — Election Misinformation Buster

## Trigger phrases
Build myth buster, create mythbuster.html, myth vs fact module, fact checker, misinformation, election myths, classify claim, fact check API, myth log, session log

## Description
This skill governs the "Myth vs Fact" module. It classifies user-submitted election claims using Gemini, cross-references them with the Google Fact Check Tools API, maintains a session myth log, and generates shareable fact-check cards. Activate whenever the agent is asked to work on `mythbuster.html` or `mythbuster.js`.

---

## Module Goal

Let users submit any election claim they've heard — from WhatsApp, family conversations, or social media — and get an instant, neutral, evidence-based verdict. Build trust in the electoral process by debunking myths and reinforcing facts.

---

## Classification System

Every claim gets one of three verdicts:

| Verdict | Code | Color Token | Icon |
|---|---|---|---|
| Verified Fact | `FACT` | `--color-fact` (#388E3C green) | ✅ |
| Myth / False | `MYTH` | `--color-myth` (#D32F2F red) | ❌ |
| Partially True | `PARTIAL` | `--color-partial` (#F57C00 amber) | ⚠️ |

Plus a special state:
| Out of Scope | `OOS` | `--color-text-muted` | 🚫 |

---

## Gemini Classification Prompt

```
You are MatDaan Mitra, a neutral election fact-checker for India. A user has submitted this claim:

"{userClaim}"

Evaluate this claim in the context of Indian elections and civic processes.
Respond in {language} as JSON:

{
  "verdict": "FACT" | "MYTH" | "PARTIAL" | "OOS",
  "confidence": "high" | "medium" | "low",
  "title": "short verdict headline (max 8 words)",
  "explanation": "clear 2-4 sentence explanation in plain language",
  "nuance": "additional context or caveat (optional, can be empty string)",
  "source": "name of the authority or document that settles this (e.g. ECI guidelines, Representation of the People Act 1951)",
  "sourceUrl": "official URL if available, else empty string",
  "isOutOfScope": false
}

STRICT RULES:
1. If the claim is about a specific political party, candidate, or their policies — set verdict to "OOS" and isOutOfScope to true. Respond: "I can only fact-check claims about election processes and voter rights, not political opinions."
2. If the claim could harm voter confidence without basis, flag it clearly as MYTH with strong explanation.
3. Never take a political side. Stick to procedural and legal facts.
4. Confidence must reflect genuine uncertainty — use "low" if the claim depends on state-specific rules you're not certain about.
5. Respond ONLY with the JSON object.
```

---

## Google Fact Check Tools API Integration

After Gemini responds, cross-reference with the Fact Check Tools API:

```javascript
/**
 * Cross-references a claim with Google's Fact Check Tools API.
 * Results are shown as "See also" links, not overriding Gemini's verdict.
 *
 * @param {string} claim - The sanitised user claim
 * @returns {Promise<Array<FactCheckResult>>} Array of fact-check results (may be empty)
 */
async function crossReferenceFactCheck(claim) {
  const endpoint = `https://factchecktools.googleapis.com/v1alpha1/claims:search`;
  const params = new URLSearchParams({
    key: CONFIG.FACT_CHECK_API_KEY,
    query: claim,
    languageCode: session.get('language') || 'en',
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
    return []; // Graceful failure — Gemini verdict is still shown
  }
}
```

Show Fact Check results as a "Also reviewed by" section below the main verdict — only if results exist. Never substitute them for the Gemini verdict.

---

## Input UI

```html
<section class="mythbuster__input-section" aria-labelledby="myth-input-heading">
  <h2 id="myth-input-heading">Type a claim you've heard</h2>
  <p class="mythbuster__hint">Example: "Only educated people can vote" or "You need to re-register before every election"</p>

  <div class="mythbuster__input-wrapper">
    <label for="myth-input" class="sr-only">Enter an election claim to fact-check</label>
    <textarea 
      id="myth-input"
      class="mythbuster__textarea"
      placeholder="Type any claim about elections in India..."
      maxlength="500"
      rows="3"
      aria-describedby="myth-input-counter myth-input-hint"
      aria-required="true"></textarea>
    <span id="myth-input-counter" class="mythbuster__char-count" aria-live="polite">0 / 500</span>
  </div>

  <div class="mythbuster__quick-claims" id="myth-quick-claims" aria-label="Quick example claims">
    <!-- Rendered by JS from EXAMPLE_MYTHS array -->
  </div>

  <button class="btn btn--primary btn--myth-check" 
          id="myth-submit"
          aria-label="Check this claim"
          disabled>
    Check this claim
  </button>
</section>
```

### Pre-populated Example Myths

Always show these as quick-tap buttons on first load:

```javascript
const EXAMPLE_MYTHS = [
  "You cannot vote if you don't have an Aadhaar card",
  "Only educated people can vote in India",
  "You need to re-register before every election",
  "EVMs (voting machines) can be hacked easily",
  "Women are not allowed to vote in some states",
  "If your name isn't on the list, you can still vote on the day",
  "NOTA means your vote is wasted"
];
```

---

## Verdict Card UI

```html
<article class="verdict-card verdict-card--{verdict}" 
         role="article"
         aria-label="{verdict}: {title}">

  <div class="verdict-card__header">
    <span class="verdict-card__icon" role="img" aria-label="{verdict}">{icon}</span>
    <div>
      <span class="verdict-card__badge badge--{verdict}">{verdictLabel}</span>
      <span class="verdict-card__confidence">Confidence: {confidence}</span>
    </div>
  </div>

  <h3 class="verdict-card__title">{title}</h3>
  <p class="verdict-card__explanation">{explanation}</p>

  <div class="verdict-card__nuance" hidden="{nuance === ''}">
    <strong>Important nuance:</strong> {nuance}
  </div>

  <div class="verdict-card__source">
    <strong>Based on:</strong> 
    <a href="{sourceUrl}" target="_blank" rel="noopener noreferrer">{source}</a>
  </div>

  <div class="verdict-card__fact-checks" aria-label="Third-party fact checks" hidden>
    <h4>Also reviewed by</h4>
    <!-- Fact Check API results rendered here -->
  </div>

  <div class="verdict-card__actions">
    <button class="btn btn--ghost btn--share" 
            aria-label="Share this fact-check result"
            onclick="shareFactCheck()">
      Share this fact-check
    </button>
    <span class="verdict-card__ai-badge" title="Generated by Gemini AI — politically neutral">
      🛡 Responsible AI
    </span>
  </div>

</article>
```

---

## Session Myth Log

Every completed fact-check is saved to the session log and shown in a collapsible "Your fact-check history" panel at the bottom of the page.

```javascript
/**
 * Saves a fact-check result to the session myth log.
 *
 * @param {string} claim - Original user claim
 * @param {string} verdict - 'FACT' | 'MYTH' | 'PARTIAL' | 'OOS'
 * @param {string} title - Verdict headline
 */
function saveMythToLog(claim, verdict, title) {
  const session = getSession();
  session.mythLog.unshift({
    id: Date.now(),
    claim: claim.substring(0, 100),  // truncate for storage
    verdict,
    title,
    timestamp: new Date().toISOString()
  });
  setSession(session);
  renderMythLog();
}
```

Myth log summary row:
- Small icon (✅/❌/⚠️)
- Truncated claim text (max 60 chars)
- Verdict badge
- Time (e.g. "5 minutes ago")
- Click to expand full result

---

## Share Functionality

When user clicks "Share this fact-check":

```javascript
/**
 * Generates shareable text for a fact-check result.
 * Uses Web Share API if available, falls back to clipboard copy.
 */
async function shareFactCheck(verdict, claim, explanation) {
  const shareText = `✅ Fact-checked by MatDaan Mitra\n\nClaim: "${claim}"\nVerdict: ${verdict}\n\n${explanation}\n\nCheck more election facts at [app URL]`;

  if (navigator.share) {
    await navigator.share({ text: shareText });
  } else {
    await navigator.clipboard.writeText(shareText);
    showToast('Copied to clipboard!');
  }
}
```

---

## Blocked Query Logging

When the responsible AI guardrail rejects a query (OOS verdict or guardrail triggered):

```javascript
function logRejectedQuery(claim, reason) {
  const session = getSession();
  session.rejectedQueries.push({
    claim: claim.substring(0, 100),
    reason,
    timestamp: new Date().toISOString()
  });
  setSession(session);
  // Never expose this log to the user — it's for internal session tracking only
}
```
