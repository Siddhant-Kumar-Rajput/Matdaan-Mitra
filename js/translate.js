/**
 * @file translate.js
 * @description Google Translate API wrapper for dynamic content.
 * @module MatDaanMitra
 *
 * @security Only use for dynamic text. Static text uses i18n.js.
 */

/**
 * Translates text via Google Translate API.
 * Use only for dynamic content — static UI strings use i18n.js.
 *
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g. 'ta')
 * @returns {Promise<string>} Translated text
 */
async function translateText(text, targetLang) {
  if (targetLang === 'en' || !text) return text;

  try {
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
  } catch (error) {
    debugLog('Translation failed', error);
    return text; // Fallback to English on error
  }
}

/**
 * Translates an array of texts via Google Translate API.
 * 
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<string[]>} Array of translated texts
 */
async function translateTexts(texts, targetLang) {
  if (targetLang === 'en' || !texts || texts.length === 0) return texts;

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${CONFIG.TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: texts,
          target: targetLang,
          format: 'text',
          source: 'en'
        })
      }
    );

    const data = await response.json();
    if (data.data && data.data.translations) {
      return data.data.translations.map(t => t.translatedText);
    }
    return texts;
  } catch (error) {
    debugLog('Bulk translation failed', error);
    return texts;
  }
}

/**
 * Automatically translates all untranslated text nodes in the body.
 * Skips elements with data-i18n attributes as they are handled by i18n.js.
 */
async function autoTranslatePage() {
  const session = getSession();
  const targetLang = session.language || 'en';
  if (targetLang === 'en') return;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        // Skip scripts, styles, and already translated elements
        const tag = parent.tagName.toLowerCase();
        if (['script', 'style', 'noscript', 'iframe', 'canvas'].includes(tag)) return NodeFilter.FILTER_REJECT;
        if (parent.hasAttribute('data-i18n') || parent.closest('[data-i18n]')) return NodeFilter.FILTER_REJECT;
        if (parent.hasAttribute('data-no-translate')) return NodeFilter.FILTER_REJECT;
        
        // Only translate if it contains actual text (not just whitespace)
        return node.textContent.trim().length > 1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }
  );

  const nodesToTranslate = [];
  let currentNode;
  while (currentNode = walker.nextNode()) {
    nodesToTranslate.push(currentNode);
  }

  if (nodesToTranslate.length === 0) return;

  // Split into chunks of 50 to avoid URL length or body size issues
  const chunkSize = 50;
  for (let i = 0; i < nodesToTranslate.length; i += chunkSize) {
    const chunk = nodesToTranslate.slice(i, i + chunkSize);
    const texts = chunk.map(n => n.textContent.trim());
    
    try {
      const translated = await translateTexts(texts, targetLang);
      chunk.forEach((node, index) => {
        if (translated[index]) {
          node.textContent = translated[index];
        }
      });
    } catch (e) {
      debugLog('Chunk translation error', e);
    }
  }
}
