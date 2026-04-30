/**
 * @file session.js
 * @description Helpers for managing sessionStorage (single key schema).
 * @module MatDaanMitra
 *
 * @security No data persisted beyond sessionStorage.
 */

const SESSION_KEY = 'matdaan_session';

const DEFAULT_SESSION = {
  language: 'en',
  languageLabel: 'English',
  isFirstTimeVoter: true,
  state: '',
  constituency: '',
  hasEpicCard: null,
  onboardingComplete: false,
  mythLog: [],
  rejectedQueries: [],
  checklistStatus: {},
  currentModule: 'dashboard'
};

/**
 * Gets the current session data.
 * @returns {Object} The session object
 */
function getSession() {
  try {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? { ...DEFAULT_SESSION, ...JSON.parse(data) } : { ...DEFAULT_SESSION };
  } catch (e) {
    debugLog('Failed to read session', e);
    return { ...DEFAULT_SESSION };
  }
}

/**
 * Updates the session data.
 * @param {Object} newSession - The updated session object
 */
function setSession(newSession) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  } catch (e) {
    debugLog('Failed to write session', e);
  }
}

/**
 * Updates specific keys in the session, merging with latest storage state.
 * Use this instead of setSession(localObj) to prevent overwriting background updates.
 * @param {Object} updates - The keys to update
 * @returns {Object} The new complete session
 */
function updateSession(updates) {
  const current = getSession();
  const updated = { ...current, ...updates };
  setSession(updated);
  return updated;
}

/**
 * Sleep utility for animations/delays.
 * @param {number} ms 
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
