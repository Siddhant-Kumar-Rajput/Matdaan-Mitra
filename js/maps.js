/**
 * @file maps.js
 * @description Google Maps Embed API integration for polling booth locator.
 * @module MatDaanMitra
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('booth-map-container');
  if (container) {
    const session = getSession();
    const query = encodeURIComponent(`${session.constituency} ${session.state} India`);
    
    const iframe = document.createElement('iframe');
    iframe.title = `Constituency area map — ${session.constituency}, ${session.state}`;
    iframe.width = '100%';
    iframe.height = '280';
    iframe.style.border = '0';
    iframe.style.borderRadius = 'var(--radius-md)';
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.src = `https://www.google.com/maps/embed/v1/place?key=${CONFIG.MAPS_API_KEY}&q=${query}`;
    iframe.setAttribute('aria-label', `Map showing ${session.constituency} constituency area`);
    
    container.appendChild(iframe);
    
    if (typeof trackMapBoothOpen === 'function') {
      trackMapBoothOpen();
    }
  }
});
