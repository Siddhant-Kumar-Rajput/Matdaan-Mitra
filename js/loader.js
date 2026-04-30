/**
 * @file loader.js
 * @description Reusable loading state manager for all async Gemini calls.
 */

function showLoader(containerId, message = '') {
  const el = document.getElementById(containerId);
  if (!el) return;
  const msg = message || t('loading');
  el.innerHTML = `
    <div class="loader" role="status" aria-live="polite" aria-label="${msg}">
      <div class="loader__dots">
        <span></span><span></span><span></span>
      </div>
      <p class="loader__text">${msg}</p>
    </div>`;
  el.setAttribute('aria-busy', 'true');
}

function hideLoader(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.removeAttribute('aria-busy');
}

function showError(containerId, messageKey = 'error_generic') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="error-state" role="alert">
      <p>${t(messageKey)}</p>
      <button onclick="location.reload()" class="btn-retry">${t('retry')}</button>
    </div>`;
}
