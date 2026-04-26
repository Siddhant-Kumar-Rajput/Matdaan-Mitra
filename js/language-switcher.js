/**
 * @file language-switcher.js
 * @description In-page language dropdown component for all pages.
 * @module MatDaanMitra
 *
 * @security No external data used. Reads/writes sessionStorage only.
 */

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'हिन्दी', native: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা', native: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்', native: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు', native: 'తెలుగు' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', native: 'ਪੰਜਾਬੀ' },
  { code: 'kn', label: 'ಕನ್ನಡ', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം', native: 'മലയാളം' }
];

/**
 * Initialises the inline language switcher dropdown.
 * Replaces the old <a> tag that redirected to index.html.
 */
function initLanguageSwitcher() {
  const toggle = document.getElementById('current-lang-display');
  if (!toggle) return;

  const wrapper = toggle.closest('.app-header__lang-toggle') || toggle.parentElement;

  // Prevent default link navigation
  if (wrapper.tagName === 'A') {
    wrapper.removeAttribute('href');
    wrapper.style.cursor = 'pointer';
  }

  // Build dropdown HTML
  const dropdownId = 'lang-dropdown';
  const dropdown = document.createElement('div');
  dropdown.id = dropdownId;
  dropdown.className = 'lang-dropdown';
  dropdown.setAttribute('role', 'listbox');
  dropdown.setAttribute('aria-label', 'Select language');
  dropdown.hidden = true;

  const session = getSession();
  const currentLang = session.language || 'en';

  dropdown.innerHTML = LANGUAGES.map(lang => `
    <button class="lang-dropdown__item ${lang.code === currentLang ? 'lang-dropdown__item--active' : ''}"
            role="option"
            aria-selected="${lang.code === currentLang}"
            data-lang-code="${lang.code}"
            data-lang-label="${lang.label}">
      <span class="lang-dropdown__native">${lang.native}</span>
    </button>
  `).join('');

  wrapper.style.position = 'relative';
  wrapper.appendChild(dropdown);

  // Toggle dropdown on click
  wrapper.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = !dropdown.hidden;
    dropdown.hidden = isOpen;
    wrapper.setAttribute('aria-expanded', !isOpen);
  });

  // Handle language selection
  dropdown.addEventListener('click', (e) => {
    const item = e.target.closest('.lang-dropdown__item');
    if (!item) return;
    e.stopPropagation();

    const code = item.dataset.langCode;
    const label = item.dataset.langLabel;

    const sess = getSession();
    sess.language = code;
    sess.languageLabel = label;
    setSession(sess);

    // Update the display text and close dropdown
    toggle.textContent = label;
    dropdown.hidden = true;

    // Reload the page to apply new language
    window.location.reload();
  });

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    dropdown.hidden = true;
  });
}

// Inject CSS for the dropdown
const langSwitcherStyle = document.createElement('style');
langSwitcherStyle.textContent = `
  .lang-dropdown {
    position: absolute; top: 100%; right: 0; margin-top: 8px;
    width: 180px; max-height: 200px; overflow-y: auto;
    background: #fff; border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    border: 1px solid var(--color-border);
    z-index: 1000; padding: 6px;
    scrollbar-width: thin;
  }
  .lang-dropdown__item {
    display: flex; align-items: center; width: 100%;
    padding: 10px 14px; border: none; background: none;
    border-radius: 8px; cursor: pointer;
    font-family: var(--font-primary); font-size: 15px;
    color: var(--color-text-primary);
    transition: background 0.15s ease;
    text-align: left;
  }
  .lang-dropdown__item:hover { background: rgba(255, 107, 53, 0.08); }
  .lang-dropdown__item--active {
    background: rgba(255, 107, 53, 0.1);
    font-weight: 700; color: var(--color-primary);
  }
  .lang-dropdown__native { flex: 1; }
`;
document.head.appendChild(langSwitcherStyle);

document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
