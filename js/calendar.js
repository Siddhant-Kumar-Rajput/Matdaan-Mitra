/**
 * @file calendar.js
 * @description Generates Google Calendar export links.
 * @module MatDaanMitra
 */

/**
 * Generates a Google Calendar "Add to Calendar" URL for voting day.
 * Uses the standard Google Calendar URL scheme — no OAuth required.
 *
 * @param {string} electionDate - ISO date string e.g. '2024-04-19'
 * @param {string} constituency - User's constituency name
 * @param {string} language - User's language code
 * @returns {string} Google Calendar URL
 */
function generateCalendarURL(electionDate, constituency, language) {
  const start = electionDate.replace(/-/g, '');
  const title = encodeURIComponent(`Voting Day — ${constituency}`);
  const details = encodeURIComponent(
    `Remember to bring your EPIC card (Voter ID) and any one of the 12 alternative IDs. Polling hours: 7am to 6pm. Verify your booth at voters.eci.gov.in`
  );
  const location = encodeURIComponent(`${constituency}, India`);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}&details=${details}&location=${location}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('calendar-export-container');
  if (container) {
    const session = getSession();
    const constituency = session.constituency || session.state || 'My Constituency';
    
    // In a real app we would get the actual date. Let's use a placeholder date for demonstration.
    const electionDate = '2026-05-15'; // Arbitrary future date
    
    const url = generateCalendarURL(electionDate, constituency, session.language);
    
    container.innerHTML = `
      <a href="${url}" 
         target="_blank" 
         rel="noopener noreferrer"
         class="btn btn--primary btn--calendar"
         onclick="if(typeof trackCalendarExport === 'function') trackCalendarExport();"
         aria-label="Add voting day to your Google Calendar">
        📅 Add Voting Day to Google Calendar
      </a>
    `;
  }
});
