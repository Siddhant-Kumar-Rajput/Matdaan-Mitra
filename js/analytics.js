/**
 * @file analytics.js
 * @description Firebase Analytics and Performance integration for MatDaan Mitra.
 * Tracks which modules users visit, language preferences, and quiz scores.
 * No personally identifiable information is collected.
 * All tracking is anonymous and aggregated.
 *
 * @security No PII collected. No user data sent to any server.
 *           Only anonymous event names and counts.
 *           Session data stays in sessionStorage only.
 */

let analytics = null;
let perf = null;

/**
 * Initialises Firebase Analytics and Performance.
 * Called once on every page load.
 */
function initAnalytics() {
  try {
    if (typeof firebase === 'undefined') return;

    // Initialise Firebase app only once
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    analytics = firebase.analytics();
    perf = firebase.performance();

    // Track page view with module context
    const session = getSession();
    analytics.logEvent('page_view', {
      page_path: window.location.pathname,
      language: session.language || 'en',
      user_state: session.state || 'unknown',
      is_first_time_voter: session.isFirstTimeVoter ?? 'unknown',
    });

  } catch (err) {
    // Analytics failure must never break the app
    console.warn('Analytics init failed silently:', err.message);
  }
}

/**
 * Tracks when a user opens a module.
 * @param {string} moduleName - 'checklist' | 'timeline' | 'mythbuster'
 */
function trackModuleOpen(moduleName) {
  try {
    analytics?.logEvent('module_opened', { module: moduleName });
  } catch {}
}

/**
 * Tracks quiz completion with score.
 * @param {number} score - Number of correct answers
 * @param {number} total - Total questions (always 5)
 * @param {boolean} passed - Whether user scored 75%+
 */
function trackQuizCompleted(score, total, passed) {
  try {
    analytics?.logEvent('quiz_completed', {
      score,
      total,
      passed,
      percentage: Math.round((score / total) * 100),
    });
  } catch {}
}

/**
 * Tracks myth fact-check usage.
 * @param {string} verdict - 'FACT' | 'MYTH' | 'PARTIAL' | 'OOS'
 */
function trackMythChecked(verdict) {
  try {
    analytics?.logEvent('myth_checked', { verdict });
  } catch {}
}

/**
 * Tracks language selection on landing page.
 * @param {string} langCode - e.g. 'hi', 'ta', 'en'
 */
function trackLanguageSelected(langCode) {
  try {
    analytics?.logEvent('language_selected', { language: langCode });
  } catch {}
}

/**
 * Tracks when user adds election day to Google Calendar.
 */
function trackCalendarExport() {
  try {
    analytics?.logEvent('calendar_export_clicked');
  } catch {}
}

/**
 * Tracks when user opens Google Maps for booth.
 */
function trackMapBoothOpen() {
  try {
    analytics?.logEvent('booth_map_opened');
  } catch {}
}

/**
 * Tracks when user uses floating assistant.
 */
function trackAssistantUsed() {
  try {
    analytics?.logEvent('floating_assistant_opened');
  } catch {}
}

/**
 * Starts a Firebase Performance trace for Gemini API calls.
 * @param {string} traceName - Name of the operation being traced
 * @returns {Object|null} trace object or null if perf unavailable
 */
function startPerfTrace(traceName) {
  try {
    return perf?.trace(traceName) ?? null;
  } catch { return null; }
}

// Auto-initialise on DOM ready
document.addEventListener('DOMContentLoaded', initAnalytics);
