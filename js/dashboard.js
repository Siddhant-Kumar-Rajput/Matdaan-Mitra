/**
 * @file dashboard.js
 * @description Dashboard initialisation: language display and module navigation.
 * @module MatDaanMitra
 *
 * @security All user inputs sanitised before API calls.
 *           No data persisted beyond sessionStorage.
 */

// TEST: Dashboard init
// 1. User with complete onboarding → modules displayed correctly
// 2. User without onboarding → redirect to index.html
// 3. Language display matches session language label

document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  if (!session.onboardingComplete) {
    window.location.href = './index.html';
    return;
  }

  // Set language display
  const langDisplay = document.getElementById('current-lang-display');
  if (langDisplay) {
    langDisplay.textContent = session.languageLabel || 'English';
  }
});
