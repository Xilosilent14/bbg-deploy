/* ============================================
   ANALYTICS — Structured event logging
   Local-only (console.log with [bbg.ev] tag). No network calls.
   Hooks: mode_start, mode_end, answer, level_up, achievement,
          session_start, session_end.
   ============================================ */
(function () {
    'use strict';

    var GAME = 'wordmine';
    var SESSION_ID = (function () {
        try { return 'wm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7); }
        catch (_) { return 'wm_unknown'; }
    })();
    var sessionStart = Date.now();
    var events = 0;
    var MAX_EVENTS = 500; // per session cap to avoid console flood

    function event(name, props) {
        if (events >= MAX_EVENTS) return;
        events++;
        try {
            var payload = Object.assign({
                game: GAME,
                t: Date.now(),
                sid: SESSION_ID,
                name: name
            }, props || {});
            console.log('[bbg.ev] ' + JSON.stringify(payload));
        } catch (_) { /* never throw from analytics */ }
    }

    function startSession() {
        sessionStart = Date.now();
        event('session_start', { ua: (navigator.userAgent || '').slice(0, 60) });
    }

    function endSession() {
        event('session_end', { duration_ms: Date.now() - sessionStart });
    }

    // Auto-fire session_start on load and session_end on hide/unload
    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startSession);
        } else {
            startSession();
        }
        window.addEventListener('pagehide', endSession);
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') endSession();
        });
    } catch (_) {}

    window.Analytics = {
        event: event,
        SESSION_ID: SESSION_ID
    };
})();
