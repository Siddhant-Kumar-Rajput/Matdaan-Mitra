/**
 * @file dashboard.js
 * @description Logic for dashboard features like Election Schedule Widget
 * @module MatDaanMitra
 */

document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  if (!session.onboardingComplete) {
    window.location.href = './index.html';
    return;
  }

  // Set welcome message
  document.getElementById('current-lang-display').textContent = session.languageLabel || 'English';
  const welcomeMsg = document.getElementById('welcome-message');
  welcomeMsg.textContent = session.isFirstTimeVoter ? t('dashboard_welcome_first') : t('dashboard_welcome_returning');

  renderElectionScheduleWidget();
});

async function fetchElectionSchedule(userState, language) {
  const prompt = `
Search for current and upcoming elections in India in 2026.
The user is from ${userState}.

Find:
1. Any election currently underway (voting phase) in India
2. Any election announced with a schedule in the next 90 days
3. Whether there is any election specifically in ${userState}

Respond in ${language}. Structure your response exactly like this (plain text, not JSON):

ACTIVE_ELECTIONS: [list any election currently in voting phase, or "None currently"]
UPCOMING_ELECTIONS: [list upcoming elections with approximate dates]
USER_STATE_ELECTION: [specific info for ${userState}, or "No election currently scheduled in ${userState}"]
SOURCES_NOTE: [brief note that data is from official ECI announcements]

Keep each section to 1-3 sentences. Be factual. If uncertain about specific dates, say so.
`;

  return await callGeminiGrounded(prompt, 'election-schedule');
}

function parseElectionScheduleResponse(text) {
  const extract = (key) => {
    const regex = new RegExp(`${key}:\\s*([\\s\\S]*?)(?=(?:ACTIVE_ELECTIONS:|UPCOMING_ELECTIONS:|USER_STATE_ELECTION:|SOURCES_NOTE:|$))`);
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };

  const activeElections = extract('ACTIVE_ELECTIONS');
  const upcomingElections = extract('UPCOMING_ELECTIONS');
  let userStateElection = extract('USER_STATE_ELECTION');

  if (userStateElection.toLowerCase().includes('no election currently scheduled')) {
    userStateElection = 'none';
  }

  return { activeElections, upcomingElections, userStateElection };
}

function showWidgetSkeleton(widget) {
  widget.innerHTML = `<div class="schedule-widget" aria-busy="true"><p>${t('loading')}</p></div>`;
}

async function renderElectionScheduleWidget() {
  const widget = document.getElementById('election-schedule-widget');
  const session = getSession();

  showWidgetSkeleton(widget);

  try {
    const { text, sources, searchSuggestions } = await fetchElectionSchedule(
      session.state || 'India',
      session.languageLabel || 'English'
    );

    const parsed = parseElectionScheduleResponse(text);

    widget.innerHTML = `
      <div class="schedule-widget" role="region" aria-label="Current election schedule">
        
        ${parsed.userStateElection !== 'none' ? `
        <div class="schedule-widget__highlight" role="alert" aria-live="polite">
          <span aria-hidden="true">🔔</span>
          <div>
            <strong>Election in your state</strong>
            <p>${parsed.userStateElection}</p>
          </div>
        </div>` : ''}

        <div class="schedule-widget__section">
          <h3>Active Elections</h3>
          <p>${parsed.activeElections}</p>
        </div>

        <div class="schedule-widget__section">
          <h3>Upcoming Elections</h3>
          <p>${parsed.upcomingElections}</p>
        </div>

        ${sources.length > 0 ? `
        <div class="schedule-widget__sources" aria-label="Data sources">
          <strong>Sources:</strong>
          ${sources.slice(0, 3).map(s => 
            `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title}</a>`
          ).join(', ')}
        </div>` : ''}

        ${searchSuggestions ? `
        <!-- REQUIRED: Google Search Suggestions must be displayed as-is -->
        <div class="schedule-widget__search-suggestions" aria-label="Related Google searches">
          ${searchSuggestions}
        </div>` : ''}

        <div class="schedule-widget__footer">
          <span class="responsible-ai-badge">
            🛡 Live data via Gemini Search · Verify at 
            <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">eci.gov.in</a>
          </span>
          <button class="btn btn--ghost btn--sm" onclick="renderElectionScheduleWidget()" 
                  aria-label="Refresh election schedule">
            ↻ Refresh
          </button>
        </div>

      </div>
    `;

  } catch (error) {
    debugLog(error);
    // Fallback to dummy data
    widget.innerHTML = `
      <div class="schedule-widget" role="region" aria-label="Current election schedule">
        <div class="schedule-widget__highlight" role="alert" aria-live="polite">
          <span aria-hidden="true">🔔</span>
          <div>
            <strong>Election in your state</strong>
            <p>State Assembly Elections are expected as per the ECI schedule. Please verify specific dates for ${session.state || 'your state'}.</p>
          </div>
        </div>

        <div class="schedule-widget__section">
          <h3>Active Elections</h3>
          <p>By-elections in select constituencies may be active. No major general elections are currently in the voting phase.</p>
        </div>

        <div class="schedule-widget__section">
          <h3>Upcoming Elections</h3>
          <p>Several State Legislative Assembly elections are scheduled for late 2026 and 2027.</p>
        </div>

        <div class="schedule-widget__footer">
          <span class="responsible-ai-badge" style="color: var(--color-partial);">
            ⚠️ Offline/Fallback Data · Verify at 
            <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">eci.gov.in</a>
          </span>
          <button class="btn btn--ghost btn--sm" onclick="renderElectionScheduleWidget()" 
                  aria-label="Refresh election schedule">
            ↻ Retry
          </button>
        </div>
      </div>
    `;
  }
}
