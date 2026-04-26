# MatDaan Mitra — Agent Rules
## Code Quality, Review & Maintainability Standards

These rules apply to every file generated or modified in this project. They are evaluated by hackathon judges and must be consistently followed.

---

## Code Review Checklist (run before every file is finalised)

Before marking any file complete, the agent must verify:

- [ ] No hardcoded API keys or secrets
- [ ] All user inputs are sanitised before use
- [ ] Every async function has try/catch
- [ ] All interactive elements have aria-label
- [ ] No `var` declarations — only `const` and `let`
- [ ] No console.log left in production code (use `debugLog()` from config.js which is a no-op in prod)
- [ ] All magic numbers replaced with named constants
- [ ] CSS uses variables from global.css — no hardcoded hex colors
- [ ] Each JS file has a top-of-file JSDoc block describing its purpose

---

## File Header Template

Every `.js` file must begin with:
```javascript
/**
 * @file <filename>.js
 * @description <one-line description of what this file does>
 * @module MatDaanMitra
 *
 * @security All user inputs sanitised before API calls.
 *           No data persisted beyond sessionStorage.
 */
```

Every `.css` file must begin with:
```css
/*
 * MatDaan Mitra — <filename>.css
 * <one-line description>
 *
 * Design tokens defined in global.css.
 * Do not hardcode colors or spacing values here.
 */
```

---

## Function Documentation Standard

```javascript
/**
 * Builds a personalised voter checklist based on the user's onboarding profile.
 *
 * @param {Object} userProfile - The user profile from sessionStorage
 * @param {string} userProfile.state - Indian state name
 * @param {string} userProfile.constituency - Constituency name
 * @param {boolean} userProfile.isFirstTimeVoter - Whether this is their first election
 * @param {boolean} userProfile.hasEpicCard - Whether they have their Voter ID card
 * @returns {Promise<Array<ChecklistItem>>} Ordered array of checklist items
 * @throws {GeminiError} If the Gemini API call fails
 */
async function buildVoterChecklist(userProfile) { ... }
```

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Variables | camelCase | `userProfile`, `isFirstTimeVoter` |
| Constants | SCREAMING_SNAKE | `MAX_INPUT_LENGTH`, `GEMINI_MODEL` |
| Functions | camelCase verb+noun | `buildVoterChecklist()`, `sanitiseInput()` |
| CSS classes | BEM | `.checklist__item--completed` |
| HTML IDs | kebab-case | `#myth-input-field` |
| Files | kebab-case | `floating-assistant.js` |

---

## HTML Structure Standards

Every HTML page must have:
```html
<!DOCTYPE html>
<html lang="en" dir="ltr"> <!-- lang updated dynamically via JS -->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="..."> <!-- from firebase.json -->
  <title>MatDaan Mitra — मतदान मित्र</title>
  <meta name="description" content="Your personal election guide for Indian voters">
  <link rel="stylesheet" href="../css/global.css">
  <link rel="stylesheet" href="../css/components.css">
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header role="banner">...</header>
  <main id="main-content" role="main">...</main>
  <footer role="contentinfo">...</footer>
  <!-- Scripts at bottom, deferred -->
  <script src="../js/config.js" defer></script>
  <script src="../js/session.js" defer></script>
</body>
</html>
```

The `skip-link` is mandatory — it allows keyboard users to skip navigation. It must be the first focusable element on every page.

---

## sessionStorage Schema

All data is stored under a single key to avoid scattered keys:

```javascript
// Key: 'matdaan_session'
// Value: JSON stringified object

const SESSION_SCHEMA = {
  language: 'hi',                    // ISO 639-1 code
  languageLabel: 'हिन्दी',
  isFirstTimeVoter: true,
  state: 'Maharashtra',
  constituency: 'Mumbai North',
  hasEpicCard: false,
  onboardingComplete: false,
  mythLog: [],                        // Array of {claim, verdict, timestamp}
  rejectedQueries: [],               // Queries blocked by responsible AI guardrail
  checklistStatus: {}                // {itemId: boolean} map of completed items
};
```

Use `session.js` getter/setter functions exclusively. Never call `sessionStorage.setItem()` directly in other files.

---

## CSS Design Token Structure

`global.css` must define these tokens at minimum:

```css
:root {
  /* Colors — India-inspired palette */
  --color-primary: #FF6B35;        /* Saffron — action, CTAs */
  --color-primary-dark: #E55A25;
  --color-secondary: #1A6B3C;      /* India green — success, facts */
  --color-secondary-dark: #145530;
  --color-accent: #003580;         /* Ashoka blue — headings, links */
  --color-myth: #D32F2F;           /* Red — myths */
  --color-partial: #F57C00;        /* Amber — partial truths */
  --color-fact: #388E3C;           /* Green — verified facts */
  --color-surface: #FFFFFF;
  --color-surface-alt: #F8F6F1;
  --color-border: #E0DDD6;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #5C5C5C;
  --color-text-muted: #8C8C8C;

  /* Spacing scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --space-2xl: 64px;

  /* Typography */
  --font-primary: 'Noto Sans', 'Segoe UI', system-ui, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 22px;
  --font-size-2xl: 28px;
  --font-size-3xl: 36px;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-elevated: 0 4px 16px rgba(0,0,0,0.10);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}
```

Use `Noto Sans` — it supports all Indian scripts with a single font family.

---

## Anti-Patterns (never do these)

1. **Never** use `innerHTML` with user-supplied content — use `textContent` or sanitise first
2. **Never** call Gemini API on every keystroke — always debounce
3. **Never** store user data in `localStorage` — `sessionStorage` only, clears on tab close
4. **Never** make an API call without showing a loading state
5. **Never** use `alert()`, `confirm()`, or `prompt()` — use custom UI modals
6. **Never** assume the user's language — always read from `sessionStorage` first
7. **Never** display raw API error messages — always show a friendly fallback

---

## Testing Standards

Each module must have a `// TEST:` comment block at the top of its JS file listing the scenarios that must work:

```javascript
// TEST: Onboarding flow
// 1. First-time voter from Maharashtra → checklist includes "Register if not registered"
// 2. Returning voter with EPIC card → checklist skips registration step
// 3. User selects Tamil → all Gemini responses must be in Tamil
// 4. User with no internet → offline error state shown gracefully
// 5. Myth buster with politically biased input → guardrail blocks and logs
```

---

## Accessibility Testing Checklist

Before submission, verify:
- [ ] Tab through entire app without mouse — every feature reachable
- [ ] All form inputs have visible labels (not just placeholders)
- [ ] Error messages are announced to screen readers via `aria-live="polite"`
- [ ] Loading states use `aria-busy="true"` on the relevant container
- [ ] Language change updates `<html lang="">` attribute
- [ ] Right-to-left scripts (none currently, but structure supports it via `dir` attribute)
- [ ] Touch targets are minimum 44×44px on mobile

---

## Commit Message Format

When creating or modifying files, describe changes using this format in comments:
```
feat(module): what was added
fix(security): what was fixed
style(css): what was changed in styling
docs(readme): what was documented
```
