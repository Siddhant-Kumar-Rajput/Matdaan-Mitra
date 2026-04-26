# Skill: Multilingual Onboarding Flow

## Trigger phrases
Build language selector, create onboarding, build index.html, onboarding flow, adaptive questions, language screen, multilingual setup, translate UI, i18n, language picker, build onboarding.html

## Description
This skill governs the language selection screen (`index.html`) and the smart onboarding flow (`onboarding.html`). It covers the i18n architecture, adaptive question logic, sessionStorage profile building, and transition to the dashboard. Activate whenever the agent is asked to build the landing page, onboarding flow, or translation system.

---

## Screen 1: Language Selector (`index.html`)

### Purpose
The very first thing a user sees. Must be simple, instant, and not require reading any English to use.

### UI Requirements
- Full viewport height, centred content
- App name shown in all 8 supported scripts simultaneously (visual: script grid)
- 8 language tiles arranged in a 2×4 grid on mobile, 4×2 on desktop
- Each tile shows: script character (large) + language name in that script + language name in English (small, below)
- Selecting a language immediately: saves to sessionStorage, updates `<html lang="">`, animates out and navigates to `onboarding.html`

### No default language assumption
Do not pre-select any language. The UI must be understandable regardless of which language the user reads.

### Language Tile HTML
```html
<button class="lang-tile"
        data-lang-code="{code}"
        data-lang-label="{label}"
        aria-label="Select {label} — {englishName}"
        onclick="selectLanguage('{code}', '{label}')">
  <span class="lang-tile__script" aria-hidden="true">{scriptChar}</span>
  <span class="lang-tile__native">{label}</span>
  <span class="lang-tile__english">{englishName}</span>
</button>
```

### Language Data
```javascript
const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English',    englishName: 'English',   scriptChar: 'Aa' },
  { code: 'hi', label: 'हिन्दी',    englishName: 'Hindi',     scriptChar: 'अ'  },
  { code: 'bn', label: 'বাংলা',      englishName: 'Bengali',   scriptChar: 'ক'  },
  { code: 'ta', label: 'தமிழ்',      englishName: 'Tamil',     scriptChar: 'த'  },
  { code: 'te', label: 'తెలుగు',     englishName: 'Telugu',    scriptChar: 'అ'  },
  { code: 'pa', label: 'ਪੰਜਾਬੀ',    englishName: 'Punjabi',   scriptChar: 'ਅ'  },
  { code: 'kn', label: 'ಕನ್ನಡ',     englishName: 'Kannada',   scriptChar: 'ಕ'  },
  { code: 'ml', label: 'മലയാളം',    englishName: 'Malayalam', scriptChar: 'മ'  },
];
```

---

## Screen 2: Smart Onboarding (`onboarding.html`)

### Philosophy
This is NOT a static form. It's a conversation-style step-by-step flow. One question at a time. Large tap targets. Progress indicator at top. Back button to change previous answers.

### Question Sequence (always in this order, always 4 questions)

**Q1: First-time voter?**
```
Question: "Is this your first time voting?"
Options: [Yes, first time ✨] [No, I've voted before]
Storage: session.isFirstTimeVoter = true/false
Effect: If true → add "first-time voter guide" context to all subsequent Gemini prompts
```

**Q2: State**
```
Question: "Which state are you registered to vote in?"
Input type: Searchable dropdown (all 28 states + 8 UTs, sorted alphabetically)
Storage: session.state = "Maharashtra"
Effect: Determines election rules, dry day, booth locator map centre
```

**Q3: Constituency / City**
```
Question: "Which constituency or city are you voting in?"
Input type: Text input with autocomplete (free text — don't restrict, India has 543 Lok Sabha + 4120 Vidhan Sabha constituencies)
Placeholder: "e.g. Mumbai North, Connaught Place, Bengaluru South"
Storage: session.constituency = "Mumbai North"
Effect: Used in Maps embed and personalised checklist
```

**Q4: EPIC Card Status**
```
Question: "Do you have your Voter ID card (EPIC card)?"
Options: [Yes, I have it ✅] [No, I need to get one] [I'm not sure 🤔]
Storage: session.hasEpicCard = true / false / null
Effect: Drives priority of checklist items
```

### Onboarding UI Structure
```html
<div class="onboarding" role="main">

  <!-- Progress indicator -->
  <div class="onboarding__progress" role="progressbar" 
       aria-valuenow="{step}" aria-valuemin="1" aria-valuemax="4"
       aria-label="Step {step} of 4">
    <div class="onboarding__progress-track">
      <div class="onboarding__progress-fill" style="width: {(step/4)*100}%"></div>
    </div>
    <p class="onboarding__step-label">Step {step} of 4</p>
  </div>

  <!-- Question card (one shown at a time, animated in/out) -->
  <div class="onboarding__card" id="onboarding-card" aria-live="polite">
    <h1 class="onboarding__question">{questionText}</h1>
    <div class="onboarding__options" role="group" aria-label="Choose an answer">
      {options}
    </div>
  </div>

  <!-- Back button (hidden on step 1) -->
  <button class="btn btn--ghost onboarding__back" 
          id="onboarding-back"
          aria-label="Go back to previous question"
          hidden>
    ← Back
  </button>

</div>
```

### Transition Animation (step change)
```javascript
async function advanceToStep(nextStep) {
  const card = document.getElementById('onboarding-card');

  // Slide out current
  card.style.transform = 'translateX(-100%)';
  card.style.opacity = '0';

  await sleep(200);

  renderStep(nextStep);

  // Slide in next
  card.style.transform = 'translateX(100%)';
  await sleep(10); // Allow DOM paint
  card.style.transition = 'transform 250ms ease, opacity 250ms ease';
  card.style.transform = 'translateX(0)';
  card.style.opacity = '1';

  // Focus first interactive element in new step
  card.querySelector('button, input, select')?.focus();
}
```

---

## i18n System (`js/i18n.js`)

### Architecture
Store UI strings in a flat JS object. Dynamic content from Gemini is auto-translated via Translate API. Static UI strings are pre-translated to avoid API latency on page load.

```javascript
/**
 * @file i18n.js
 * @description Internationalisation string table for all static UI text.
 *              Dynamic content is translated via Google Translate API.
 *
 * @security No user data stored here — pure static strings.
 */

const I18N = {
  en: {
    // Landing
    landing_title: "Your Personal Election Guide",
    landing_subtitle: "Choose your language to continue",

    // Onboarding
    q1_text: "Is this your first time voting?",
    q1_yes: "Yes, first time",
    q1_no: "No, I've voted before",
    q2_text: "Which state are you registered to vote in?",
    q2_placeholder: "Search for your state...",
    q3_text: "Which constituency or city are you voting in?",
    q3_placeholder: "e.g. Mumbai North, Connaught Place",
    q4_text: "Do you have your Voter ID card (EPIC card)?",
    q4_yes: "Yes, I have it",
    q4_no: "No, I need to get one",
    q4_unsure: "I'm not sure",

    // Dashboard
    dashboard_welcome_first: "Welcome! Let's make sure you're ready to vote.",
    dashboard_welcome_returning: "Welcome back. What would you like to explore?",
    module1_title: "Am I Election-Ready?",
    module1_desc: "Your personal voter checklist",
    module2_title: "How Elections Work",
    module2_desc: "From announcement to results",
    module3_title: "Myth vs Fact",
    module3_desc: "Bust election misinformation",

    // Common
    loading: "Loading...",
    error_generic: "Something went wrong. Please try again.",
    powered_by: "Powered by Gemini · Politically neutral",
    verify_eci: "Verify at eci.gov.in",
    back: "Back",
    next: "Next",
    share: "Share",
  },

  hi: {
    landing_title: "आपका व्यक्तिगत चुनाव मार्गदर्शक",
    landing_subtitle: "जारी रखने के लिए अपनी भाषा चुनें",
    q1_text: "क्या यह आपका पहली बार वोट देना है?",
    q1_yes: "हाँ, पहली बार",
    q1_no: "नहीं, मैं पहले वोट दे चुका/चुकी हूँ",
    q2_text: "आप किस राज्य में वोट देने के लिए पंजीकृत हैं?",
    q2_placeholder: "अपना राज्य खोजें...",
    q3_text: "आप किस निर्वाचन क्षेत्र या शहर में वोट दे रहे/रही हैं?",
    q3_placeholder: "जैसे: मुंबई उत्तर, कनॉट प्लेस",
    q4_text: "क्या आपके पास आपका मतदाता पहचान पत्र (EPIC कार्ड) है?",
    q4_yes: "हाँ, मेरे पास है",
    q4_no: "नहीं, मुझे लेना है",
    q4_unsure: "मुझे पता नहीं",
    dashboard_welcome_first: "स्वागत है! आइए सुनिश्चित करें कि आप वोट देने के लिए तैयार हैं।",
    dashboard_welcome_returning: "वापसी पर स्वागत है। आप क्या जानना चाहते हैं?",
    module1_title: "क्या मैं चुनाव के लिए तैयार हूँ?",
    module1_desc: "आपकी व्यक्तिगत मतदाता चेकलिस्ट",
    module2_title: "चुनाव कैसे होता है",
    module2_desc: "घोषणा से परिणाम तक",
    module3_title: "मिथक बनाम तथ्य",
    module3_desc: "चुनावी भ्रांतियों को दूर करें",
    loading: "लोड हो रहा है...",
    error_generic: "कुछ गलत हुआ। कृपया दोबारा कोशिश करें।",
    powered_by: "Gemini द्वारा संचालित · राजनीतिक रूप से तटस्थ",
    verify_eci: "eci.gov.in पर सत्यापित करें",
    back: "वापस",
    next: "आगे",
    share: "शेयर करें",
  },

  // Other languages: ta, te, bn, pa, kn, ml
  // Add full translations for all keys above.
  // Use the same key names — only values differ.
};

/**
 * Gets a UI string in the current session language.
 * Falls back to English if key not found in chosen language.
 *
 * @param {string} key - The i18n key
 * @returns {string} Translated string
 */
function t(key) {
  const lang = getSession().language || 'en';
  return I18N[lang]?.[key] || I18N['en']?.[key] || key;
}
```

### Dynamic Translation via Google Translate API

For Gemini-generated content where we can't pre-translate, use:

```javascript
/**
 * Translates text via Google Translate API.
 * Use only for dynamic content — static UI strings use i18n.js.
 *
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g. 'ta')
 * @returns {Promise<string>} Translated text
 */
async function translateText(text, targetLang) {
  if (targetLang === 'en') return text; // Skip API call for English

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${CONFIG.TRANSLATE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        format: 'text',
        source: 'en'
      })
    }
  );

  const data = await response.json();
  return data.data?.translations?.[0]?.translatedText || text;
}
```

Note: For this app, we ask Gemini to respond directly in the user's language (via the system prompt). The Translate API is a fallback for UI strings not in `i18n.js` and for any English-only content.

---

## Dashboard (`dashboard.html`)

After onboarding completes, redirect to `dashboard.html`. The dashboard:
- Shows a personalised welcome message (first-time vs returning voter)
- Shows 3 module tiles using the user's name/state from sessionStorage
- Has a "Change language" link in the header
- Has a "Reset my profile" button in the footer (clears sessionStorage, back to landing)

Module tile click → saves `session.currentModule = 'checklist'|'timeline'|'mythbuster'` → navigates to the module page.
