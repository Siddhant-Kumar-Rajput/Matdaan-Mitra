# MatDaan Mitra — मतदान मित्र
### Your Personal Election Guide for Indian Voters

> **Hackathon:** Google Prompt Wars · Hack to Skill Platform  
> **Challenge:** Election Process Education  
> **Tech:** Vanilla JS + Google Gemini API + Google Services

---

## What is MatDaan Mitra?

MatDaan Mitra (meaning "Your Voting Companion" in Hindi) is a multilingual, interactive election education assistant designed to help Indian voters — especially first-time voters — understand the election process in their own language.

The app is built entirely client-side with no backend, no database, and no persistent user data. Everything runs in the browser using Google's AI and mapping services.

---

## Features

### 🌐 Multilingual First
Choose from 8 Indian languages on the landing screen. All content adapts — UI strings, Gemini responses, and error messages are in the chosen language.

Supported: English, हिन्दी, বাংলা, தமிழ், తెలుగు, ਪੰਜਾਬੀ, ಕನ್ನಡ, മലയാളം

### 📋 Module 1: Am I Election-Ready?
A personalised voter checklist built from your answers. Includes:
- Gemini-generated checklist tailored to your state and constituency
- Google Maps booth locator embedded in-page
- One-click "Add voting day to Google Calendar" reminder
- Document requirements for your specific state

### ⏳ Module 2: How Elections Work
An interactive 7-phase election timeline. Click any phase to get a Gemini-powered plain-language explanation. Includes:
- "What if?" scenario tab for edge cases
- Mini quiz at the end to test your knowledge

### 🔍 Module 3: Myth vs Fact
Type any election claim you've heard. Get an instant verdict:
- ✅ Verified Fact / ❌ Myth / ⚠️ Partially True
- Cross-referenced with Google Fact Check Tools API
- Session log of all claims checked
- Share fact-check results

### 🤖 Floating Gemini Assistant
A persistent chat button on every module page. Ask anything — the assistant knows your language, state, and current module context.

---

## Google Services Used

| Service | Purpose |
|---|---|
| Gemini API (`gemini-2.0-flash`) | Core AI: checklists, timeline explanations, myth classification, chat |
| Google Translate API | UI fallback translation for dynamic content |
| Google Maps Embed API | Polling booth locator in Module 1 |
| Google Calendar API | Voting day reminder in Module 1 |
| Google Fact Check Tools API | Cross-reference claims in Module 3 |
| Firebase Hosting | Static site hosting |

---

## Responsible AI

MatDaan Mitra is built with voter trust as a first principle:

- **Non-partisan by design:** The Gemini system prompt strictly blocks any political content, party comparisons, or candidate opinions. Attempts are logged and rejected gracefully.
- **Prompt injection defence:** All inputs are sanitised and checked against known injection patterns before reaching the API.
- **Safety settings:** `HARM_CATEGORY_CIVIC_INTEGRITY` is set to `BLOCK_LOW_AND_ABOVE` — the highest sensitivity level.
- **Zero data persistence:** All user data lives in `sessionStorage` only. It clears when the browser tab closes. Nothing goes to any server.
- **Transparent AI:** Every Gemini response carries a visible "🛡 Powered by Gemini · Politically neutral" badge with a link to eci.gov.in for verification.

---

## Setup

### Prerequisites
- A Google Cloud project with the following APIs enabled(Project ID: 'matdaan-mitra'):
  - Generative Language API (Gemini)
  - Cloud Translation API
  - Maps Embed API
  - Google Calendar API
  - Fact Check Tools API
- Firebase CLI installed globally

### Configuration

```bash
# 1. Clone the project
git clone <repo-url>
cd matdaan-mitra

# 2. Create your config file (never commit this)
cp js/config.example.js js/config.js

# 3. Fill in your API keys in js/config.js
# (See config.example.js for the required keys)

# 4. Deploy to Firebase
firebase login
firebase init hosting
firebase deploy
```

### `js/config.example.js`
```javascript
// Copy this file to config.js and fill in your API keys
// NEVER commit config.js to version control

const CONFIG = {
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
  TRANSLATE_API_KEY: 'YOUR_TRANSLATE_API_KEY_HERE',
  MAPS_API_KEY: 'YOUR_MAPS_API_KEY_HERE',
  CALENDAR_API_KEY: 'Public API',
  FACT_CHECK_API_KEY: 'YOUR_FACT_CHECK_API_KEY_HERE',
};

const GEMINI_MODEL = 'gemini-2.0-flash';
const MAX_INPUT_LENGTH = 500;
const IS_PRODUCTION = true;
```

---

## Project Structure

```
matdaan-mitra/
├── index.html              ← Language selector (entry point)
├── onboarding.html         ← 4-step adaptive onboarding
├── dashboard.html          ← Module selection dashboard
├── modules/
│   ├── checklist.html      ← Module 1: Voter readiness
│   ├── timeline.html       ← Module 2: Election process
│   └── mythbuster.html     ← Module 3: Fact-checking
├── css/
│   ├── global.css          ← Design tokens, reset
│   ├── components.css      ← Shared UI components
│   └── modules.css         ← Module-specific styles
├── js/
│   ├── config.js           ← API keys (gitignored)
│   ├── config.example.js   ← Template for config.js
│   ├── gemini.js           ← Gemini API wrapper + guardrail
│   ├── translate.js        ← Google Translate wrapper
│   ├── session.js          ← sessionStorage helpers
│   ├── i18n.js             ← Static UI string translations
│   ├── onboarding.js       ← Adaptive question flow
│   ├── checklist.js        ← Voter checklist builder
│   ├── timeline.js         ← Election phase timeline
│   ├── mythbuster.js       ← Myth classifier + session log
│   ├── calendar.js         ← Google Calendar export
│   ├── maps.js             ← Maps embed helper
│   └── floating-assistant.js ← Persistent Gemini chat overlay
├── assets/
├── .agent/
│   └── skills/             ← Antigravity skills (read these first)
├── GEMINI.md               ← Agent blueprint (read this first)
├── AGENTS.md               ← Code quality rules
├── firebase.json
└── .gitignore              ← Includes config.js
```

---

## Accessibility

MatDaan Mitra targets WCAG 2.1 AA:
- All interactive elements have `aria-label` attributes
- Screen reader tested with landmark regions
- Keyboard navigable — full functionality without a mouse
- `aria-live` regions for dynamic content updates
- Loading states use `aria-busy`
- Skip-to-main-content link on every page
- Touch targets minimum 44×44px
- Colour contrast ratio ≥ 4.5:1

---

## What Makes This Different

Most election education tools are either government PDFs or generic chatbots. MatDaan Mitra is different because:

1. **It knows you** — your state, constituency, and voter status shape every answer
2. **It speaks your language** — 8 regional languages from day one
3. **It's responsible** — the AI cannot be used to promote any political agenda
4. **It connects to action** — the checklist exports to your calendar and shows your actual booth on a map
5. **It works offline-friendly** — no backend, deploys as a static site, loads fast on 3G

---

## License

Built for the Google Prompt Wars hackathon. All rights reserved.

---

*MatDaan karo. Apna haq pehchano.* 🗳  
*Vote. Know your right.*
