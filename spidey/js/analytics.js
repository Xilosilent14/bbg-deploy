/**
 * Analytics — structured event logging for Spidey Academy.
 *
 * Usage: Analytics.event('activity_start', { activity: 'color-catch', grade: 0 })
 *
 * Emits single-line JSON records under [bbg.ev]. Stays SES / CSP friendly
 * (no inline code, no eval). Counts live in memory + sessionStorage so a
 * later remote-collector hop can pick them up without re-instrumenting.
 */
const Analytics = (() => {
    'use strict';

    const GAME = 'spidey';
    const SESSION_KEY = 'bbg_spidey_session_id';
    let sessionId = null;
    let sessionStart = Date.now();
    const counts = Object.create(null);

    function _ensureSession() {
        if (sessionId) return sessionId;
        try {
            const existing = sessionStorage.getItem(SESSION_KEY);
            if (existing) { sessionId = existing; return sessionId; }
        } catch (_) {}
        sessionId = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
        try { sessionStorage.setItem(SESSION_KEY, sessionId); } catch (_) {}
        return sessionId;
    }

    function event(name, props) {
        try {
            _ensureSession();
            counts[name] = (counts[name] || 0) + 1;
            const payload = {
                game: GAME,
                ev: name,
                sid: sessionId,
                t: Date.now() - sessionStart,
                ...((props && typeof props === 'object') ? props : {})
            };
            console.log('[bbg.ev]', JSON.stringify(payload));
        } catch (_) { /* swallow — analytics must never break gameplay */ }
    }

    function counter(name) {
        return counts[name] || 0;
    }

    function snapshot() {
        return {
            sid: sessionId,
            ageMs: Date.now() - sessionStart,
            counts: { ...counts }
        };
    }

    function init() {
        _ensureSession();
        event('session_start', { ua: (navigator.userAgent || '').slice(0, 80) });
        // Flush a session_end on tab close / hide.
        const flush = () => event('session_end', snapshot());
        window.addEventListener('pagehide', flush);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) event('session_hidden', snapshot());
        });
    }

    return { init, event, counter, snapshot };
})();

// Auto-init so callers can fire events without waiting on main.js
try { Analytics.init(); } catch (_) {}
