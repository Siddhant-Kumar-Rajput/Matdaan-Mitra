# Skill: Voter Readiness Checklist Builder

## Trigger phrases
Build the voter checklist, generate the Am I ready module, create checklist.html, personalise the checklist, add booth locator, add calendar export, voter ID checklist

## Description
This skill governs the entire "Am I Election-Ready?" module. It generates a personalised voter checklist from the user's onboarding profile, integrates the Google Maps booth locator, and implements the Google Calendar voting-day export. Activate whenever the agent is asked to work on `checklist.html` or `checklist.js`.

---

## Module Goal

Transform the user's four onboarding answers into a concrete, actionable to-do list that tells them exactly what they need to do before election day. Every item must be specific to their state and constituency — not generic.

---

## Checklist Items Logic

The Gemini prompt must include the user's full profile and ask for a JSON array of checklist items. Use this exact prompt template:

```
You are MatDaan Mitra. The user is a voter in India with the following profile:
- State: {state}
- Constituency: {constituency}
- First-time voter: {isFirstTimeVoter}
- Has EPIC (Voter ID) card: {hasEpicCard}
- Language: {language}

Generate a personalised pre-election checklist as a JSON array. Each item must have:
{
  "id": "unique-kebab-case-id",
  "category": "Documents | Logistics | Day-of | Knowledge",
  "title": "short action title in {language}",
  "description": "one sentence explaining why this matters in {language}",
  "priority": "high | medium | low",
  "isCompleted": false,
  "helpUrl": "relevant official URL (eci.gov.in, nvsp.in, or voters.eci.gov.in)",
  "stateSpecific": true/false
}

Rules:
1. If hasEpicCard is false, include "Get/verify your EPIC card" as HIGH priority
2. If isFirstTimeVoter is true, include "Check your name on the electoral roll" as HIGH priority
3. Always include "Find your polling booth" (use Maps integration, not a link)
4. Always include "Know your voting rights" with a brief description
5. Include state-specific rules for {state} if you know them (e.g. dry day, ID alternatives)
6. Maximum 10 items. Minimum 5. Prioritise items the user actually needs to act on.
7. Respond ONLY with the JSON array. No preamble, no markdown code fences.
```

---

## Checklist UI Rendering

Each checklist item renders as a card:
```html
<article class="checklist__item" 
         data-id="{id}" 
         data-priority="{priority}"
         role="listitem"
         aria-label="{title} — {category}">
  
  <button class="checklist__toggle" 
          aria-pressed="{isCompleted}"
          aria-label="Mark {title} as complete">
    <span class="checklist__checkbox" aria-hidden="true"></span>
  </button>

  <div class="checklist__content">
    <div class="checklist__header">
      <span class="checklist__category badge badge--{category}">{category}</span>
      <span class="checklist__priority priority--{priority}">{priority}</span>
    </div>
    <h3 class="checklist__title">{title}</h3>
    <p class="checklist__desc">{description}</p>
    <a href="{helpUrl}" 
       class="checklist__link" 
       target="_blank" 
       rel="noopener noreferrer"
       aria-label="Learn more about {title} (opens in new tab)">
      Official source ↗
    </a>
  </div>
</article>
```

Progress bar at the top shows `{completedCount} of {totalCount} steps done`.

---

## Polling Booth Locator — Two-Layer Approach

### Layer 1: ECI Deep-Link (Primary)
ECI has no open API for booth lookup, but their voter portal accepts deep-link parameters.
When the user has entered their state and constituency, render this button:

```html
<a href="https://electoralsearch.eci.gov.in/"
   target="_blank"
   rel="noopener noreferrer"
   class="btn btn--primary btn--booth"
   aria-label="Find your polling booth on the official ECI portal (opens in new tab)">
  🗳 Find My Polling Booth — Official ECI Portal
</a>
```

Below it, show the SMS shortcut prominently:
```html
<div class="booth-sms-tip" role="note" aria-label="SMS shortcut to find polling booth">
  <span aria-hidden="true">📱</span>
  <p>
    <strong>Faster way:</strong> Send an SMS to <strong>1950</strong><br>
    Type: <code>EPIC [your voter ID number]</code><br>
    <small>Example: <code>EPIC MH/01/123/456789</code></small><br>
    You'll receive your booth details instantly.
  </p>
</div>
```

### Layer 2: Google Maps Embed (Visual Context)
Show a map of the user's constituency area so they have visual orientation.
This is NOT a precise booth pin — make that clear to the user.

```html
<div class="booth-map-wrapper">
  <p class="booth-map-note" role="note">
    ⚠ This map shows your constituency area. 
    Use the button above for your exact polling booth address.
  </p>
  <iframe
    title="Constituency area map — {constituency}, {state}"
    width="100%"
    height="280"
    style="border:0; border-radius: var(--radius-md);"
    loading="lazy"
    allowfullscreen
    referrerpolicy="no-referrer-when-downgrade"
    src="https://www.google.com/maps/embed/v1/place
         ?key={MAPS_API_KEY}
         &q={constituency}+{state}+India"
    aria-label="Map showing {constituency} constituency area">
  </iframe>
</div>
```

### Layer 3: Voter Helpline App Prompt
```html
<div class="booth-app-tip" role="complementary" aria-label="Voter Helpline app suggestion">
  <span aria-hidden="true">📲</span>
  <div>
    <strong>Voter Helpline App</strong>
    <p>Download the official ECI Voter Helpline app for real-time booth info, 
       electoral roll search, and election day support.</p>
    <div style="display:flex; gap: var(--space-sm); flex-wrap: wrap; margin-top: var(--space-sm);">
      <a href="https://play.google.com/store/search?q=voter+helpline&c=apps" 
         target="_blank" rel="noopener noreferrer"
         class="btn btn--ghost btn--sm"
         aria-label="Download Voter Helpline app from Google Play Store">
        Google Play ↗
      </a>
      <a href="https://apps.apple.com/in/search?term=voter+helpline" 
         target="_blank" rel="noopener noreferrer"
         class="btn btn--ghost btn--sm"
         aria-label="Download Voter Helpline app from Apple App Store">
        App Store ↗
      </a>
    </div>
  </div>
</div>
```
---

## Google Calendar Export

Generate a Google Calendar event link (no OAuth needed for basic add-to-calendar):

```javascript
/**
 * Generates a Google Calendar "Add to Calendar" URL for voting day.
 * Uses the standard Google Calendar URL scheme — no OAuth required.
 *
 * @param {string} electionDate - ISO date string e.g. '2024-04-19'
 * @param {string} constituency - User's constituency name
 * @param {string} language - User's language code
 * @returns {string} Google Calendar URL
 */
function generateCalendarURL(electionDate, constituency, language) {
  const start = electionDate.replace(/-/g, '');
  const title = encodeURIComponent(`Voting Day — ${constituency}`);
  const details = encodeURIComponent(
    `Remember to bring your EPIC card (Voter ID) and any one of the 12 alternative IDs. Polling hours: 7am to 6pm. Verify your booth at voters.eci.gov.in`
  );
  const location = encodeURIComponent(`${constituency}, India`);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}&details=${details}&location=${location}`;
}
```

Render as:
```html
<a href="{calendarURL}" 
   target="_blank" 
   rel="noopener noreferrer"
   class="btn btn--primary btn--calendar"
   aria-label="Add voting day to your Google Calendar">
  📅 Add Voting Day to Google Calendar
</a>
```

---

## State-Specific Knowledge Reference

The Gemini prompt may not know all state-specific rules. Include this context in every prompt:

- **Valid alternate voter ID documents (ECI-approved):** Aadhaar, PAN card, Driving Licence, Passport, MNREGA Job Card, Health Insurance Smart Card, Pension document with photo, Service ID cards (government), Passbook with photo (bank/post office), Smart Card (NPRS), Official identity documents (for NRI)
- **Polling hours:** Generally 7:00 AM to 6:00 PM (may vary by constituency — user should verify)
- **Dry day:** Typically 48 hours before polling — state laws vary
- **What to bring:** EPIC card OR any one alternate ID, no phones in the booth
- **For first-time voters:** Enroll at nvsp.in or use the Voter Helpline app

---

## Responsible AI Note

Include a small "🛡 Gemini-powered, politically neutral" badge near the checklist. The checklist never mentions political parties, candidates, or electoral strategy.
