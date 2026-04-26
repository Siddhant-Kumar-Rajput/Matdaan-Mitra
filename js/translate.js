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
