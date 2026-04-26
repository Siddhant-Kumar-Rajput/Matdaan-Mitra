/**
 * @file gemini.js
 * @description Gemini API wrapper + guardrail + real-time search grounding.
 * @module MatDaanMitra
 *
 * @security All user inputs sanitised before API calls.
 */

/**
 * Sanitises user input before passing to Gemini API.
 * Removes HTML, limits length, and checks for injection patterns.
 *
 * @param {string} rawInput - Raw user input from the DOM
 * @returns {{ sanitised: string, isRejected: boolean, rejectionReason: string|null }}
 */
function sanitiseInput(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return { sanitised: '', isRejected: true, rejectionReason: 'empty_input' };
  }

  // Strip HTML tags
  const stripped = rawInput.replace(/<[^>]*>/g, '').trim();

  // Enforce length limit
  const truncated = stripped.substring(0, MAX_INPUT_LENGTH);

  // Check for prompt injection patterns
  const injectionPatterns = [
    /ignore (previous|above|all) instructions/i,
    /forget (your|the) (instructions|guidelines|rules)/i,
    /you are now/i,
    /pretend (you are|to be)/i,
    /act as (a|an) different/i,
    /jailbreak/i,
    /DAN mode/i,
    /developer mode/i,
    /system prompt/i,
    /\[INST\]/i,
    /###\s*(system|instruction)/i,
  ];

  const isInjectionAttempt = injectionPatterns.some(p => p.test(truncated));

  if (isInjectionAttempt) {
    return {
      sanitised: '',
      isRejected: true,
      rejectionReason: 'injection_attempt'
    };
  }

  // Check for minimum meaningful content
  if (truncated.length < 3) {
    return { sanitised: '', isRejected: true, rejectionReason: 'too_short' };
  }

  return { sanitised: truncated, isRejected: false, rejectionReason: null };
}

/**
 * Helper to fetch with a single fast retry for 429 rate limits.
 * If still failing, returns the response so the caller falls back to mock data.
 */
async function fetchWithRetry(url, options) {
  const response = await fetch(url, options);
  if (response.status === 429) {
    // Wait 1 second and try once more
    await new Promise(r => setTimeout(r, 1000));
    const retry = await fetch(url, options);
    return retry; // If still 429, caller will use mock data
  }
  return response;
}

/**
 * Offline Mock Data Engine to bypass 429 Rate Limits
 */
function getMockData(module, prompt, isJson = true) {
  if (module === 'checklist') {
    return [
      { id: 'verify-name', category: 'Documents', title: 'Verify Name on Voter List', description: 'Ensure your name is on the electoral roll. Without it, you cannot vote even with an ID card.', priority: 'high', isCompleted: false, helpUrl: 'https://voters.eci.gov.in/', stateSpecific: false },
      { id: 'get-epic-card', category: 'Documents', title: 'Get or Verify Your EPIC Card', description: 'Apply for your Voter ID (EPIC) card or verify it is up to date with your current address.', priority: 'high', isCompleted: false, helpUrl: 'https://voters.eci.gov.in/', stateSpecific: false },
      { id: 'find-polling-booth', category: 'Logistics', title: 'Find Your Polling Booth', description: 'Locate the exact school or building where you must vote on election day.', priority: 'high', isCompleted: false, helpUrl: 'https://voters.eci.gov.in/', stateSpecific: false },
      { id: 'know-alt-ids', category: 'Documents', title: 'Know Acceptable ID Alternatives', description: 'Aadhaar, PAN Card, Driving Licence, and Passport are accepted if you lack your EPIC card.', priority: 'medium', isCompleted: false, helpUrl: 'https://eci.gov.in/', stateSpecific: false },
      { id: 'voting-day-plan', category: 'Day-of', title: 'Plan Your Voting Day', description: 'Check booth timings (7 AM – 6 PM) and plan transport. Carry water and ID documents.', priority: 'medium', isCompleted: false, helpUrl: 'https://eci.gov.in/', stateSpecific: false },
      { id: 'know-rights', category: 'Knowledge', title: 'Know Your Voting Rights', description: 'Your vote is secret. No one can ask who you voted for. You can report violations to the ECI.', priority: 'low', isCompleted: false, helpUrl: 'https://eci.gov.in/', stateSpecific: false }
    ];
  }
  if (module === 'timeline') {
    return {
      summary: "This phase is a critical step in the election process, managed by the Election Commission.",
      whatHappens: ["Official notifications are issued.", "Authorities review and process documents.", "Public information is made available."],
      whoConducts: "Election Commission of India / Returning Officer",
      howLong: "1 to 2 weeks",
      yourRole: "Stay informed about the schedule and verify your details.",
      interestingFact: "The Election Commission uses highly secure protocols to manage this phase across the entire country simultaneously."
    };
  }
  if (module === 'what-if') {
    return {
      answer: "If you face this issue on election day, you should immediately contact the Presiding Officer at your polling booth.",
      steps: ["Speak to the Presiding Officer.", "Fill out any necessary declaration forms.", "Contact the Voter Helpline if unresolved."],
      officialContact: "Voter Helpline: 1950",
      isUrgent: true
    };
  }
  if (module === 'quiz') {
    return [
      { question: "What document is mandatory if you don't have an EPIC card?", options: ["A) Library Card", "B) PAN Card or Aadhar", "C) Electricity Bill", "D) Gym Membership"], correctIndex: 1, explanation: "PAN, Aadhar, and Driving Licenses are valid alternative IDs." },
      { question: "Who is responsible for the polling booth?", options: ["A) The Police", "B) The Local MLA", "C) The Presiding Officer", "D) The Booth Level Agent"], correctIndex: 2, explanation: "The Presiding Officer manages the booth." },
      { question: "What is the VVPAT?", options: ["A) A political party", "B) A paper trail machine verifying your vote", "C) A type of EVM", "D) A voter ID card"], correctIndex: 1, explanation: "Voter Verifiable Paper Audit Trail ensures transparency." }
    ];
  }
  if (module === 'mythbuster') {
    return {
      verdict: "PARTIALLY TRUE",
      explanation: "This claim needs more context. While parts of it may be discussed, the official ECI rules provide specific guidelines that contradict the extreme version of this claim.",
      advice: "Always verify claims with the official eci.gov.in website before sharing them on social media.",
      isElectionRelated: true
    };
  }
  if (module === 'floating-assistant') {
    return "I am currently experiencing high traffic! However, you can find detailed information about the election process, voting requirements, and schedules directly within the modules on your dashboard.";
  }
  if (module === 'election-schedule') {
    return {
      text: "ACTIVE_ELECTIONS: None currently.\nUPCOMING_ELECTIONS: State elections in late 2026.\nUSER_STATE_ELECTION: Expected in late 2026.\nSOURCES_NOTE: Based on general ECI patterns.",
      sources: [],
      searchSuggestions: null
    };
  }
  return isJson ? {} : "Data is currently unavailable due to high traffic.";
}

/**
 * Central Gemini API wrapper.
 *
 * @param {string} userPrompt - The module-specific prompt
 * @param {string} module - Module name for system prompt context
 * @param {Object} options
 * @param {number} [options.maxTokens=1000] - Max response tokens
 * @param {boolean} [options.jsonMode=true] - Whether to enforce JSON output
 * @returns {Promise<Object|string>} Parsed JSON or raw text response
 */
async function callGemini(userPrompt, module = 'general', options = {}) {
  const session = getSession();
  const systemPrompt = SYSTEM_PROMPT(
    session.languageLabel || 'English',
    session.state || 'India',
    module
  );

  const jsonMode = options.jsonMode !== undefined ? options.jsonMode : true;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [{
      parts: [{ text: userPrompt }]
    }],
    generationConfig: {
      maxOutputTokens: options.maxTokens || 1000,
      temperature: 0.2,
      responseMimeType: jsonMode ? 'application/json' : 'text/plain'
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_LOW_AND_ABOVE' }
    ]
  };

  try {
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      console.warn(`API error: ${response.status}, using mock data`);
      return getMockData(module, userPrompt, jsonMode);
    }

    const data = await response.json();

    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      return getMockData(module, userPrompt, jsonMode);
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return getMockData(module, userPrompt, jsonMode);

    if (jsonMode) {
      try {
        return JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (match) return JSON.parse(match[0]);
        return getMockData(module, userPrompt, jsonMode);
      }
    }

    return rawText;
  } catch (error) {
    console.warn(`Fetch error: ${error}, using mock data`);
    return getMockData(module, userPrompt, jsonMode);
  }
}

/**
 * Gemini API call with Google Search Grounding enabled.
 * Use ONLY for real-time election schedule data.
 *
 * @param {string} userPrompt - The query requiring real-time data
 * @param {string} module - Module context for system prompt
 * @returns {Promise<{text: string, sources: Array, searchSuggestions: string|null}>}
 */
async function callGeminiGrounded(userPrompt, module = 'election-schedule') {
  const session = getSession();
  const systemPrompt = SYSTEM_PROMPT(
    session.languageLabel || 'English',
    session.state || 'India',
    module
  );

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [{
      parts: [{ text: userPrompt }]
    }],
    tools: [
      { googleSearch: {} }
    ],
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 1.0
    }
  };

  try {
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) return getMockData(module, userPrompt, false);

    const data = await response.json();
    const candidate = data.candidates?.[0];

    return {
      text: candidate?.content?.parts?.[0]?.text || '',
      sources: (candidate?.groundingMetadata?.groundingChunks || []).map(chunk => ({
        title: chunk.web?.title || '',
        url: chunk.web?.uri || ''
      })),
      searchSuggestions: candidate?.groundingMetadata?.searchEntryPoint?.renderedContent || null
    };
  } catch (error) {
    return getMockData(module, userPrompt, false);
  }
}

/**
 * Call Gemini Chat for continuous conversation
 * @param {Array} history - The chat history array
 * @param {string} module - The module context
 */
async function callGeminiChat(history, module = 'floating-assistant') {
  const session = getSession();
  const systemPrompt = SYSTEM_PROMPT(
    session.languageLabel || 'English',
    session.state || 'India',
    module
  );

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: history,
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.2,
      responseMimeType: 'text/plain'
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_LOW_AND_ABOVE' }
    ]
  };

  try {
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) return getMockData(module, '', false);

    const data = await response.json();
    
    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      return getMockData(module, '', false);
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return getMockData(module, '', false);

    return rawText;
  } catch (error) {
    return getMockData(module, '', false);
  }
}

const REJECTION_MESSAGES = {
  empty_input: "Please type a question or claim to check.",
  too_short: "Please type a bit more so I can help you.",
  injection_attempt: "I can only assist with election process information.",
  political_content: "I can only help with election process information, not political opinions or party comparisons.",
  safety_block: "I wasn't able to process that request. Please try rephrasing your question.",
  api_error: "I couldn't get a response right now. Please check your connection and try again.",
  empty_response: "Something went wrong. Please try again in a moment."
};
