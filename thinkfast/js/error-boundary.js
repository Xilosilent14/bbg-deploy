// ===== ERROR BOUNDARY =====
// Captures uncaught errors + unhandled promise rejections.
// Logs structured events for later parent dashboard / analytics review.
// Loaded FIRST so it can catch errors from any script that follows.
(function () {
    'use strict';

    const GAME_NAME = 'thinkfast';
    const MAX_LOG_ENTRIES = 50;
    const LS_KEY = 'bbg_thinkfast_errors';

    function logError(event, payload) {
        try {
            const entry = Object.assign({
                game: GAME_NAME,
                event: event,
                t: Date.now(),
                ua: (navigator && navigator.userAgent || '').substring(0, 120)
            }, payload || {});
            // Structured console log so build/scrape tools can pick it up
            console.error('[bbg.err]', JSON.stringify(entry));
            // Best-effort persist (small ring buffer, never throws)
            try {
                const raw = localStorage.getItem(LS_KEY);
                const arr = raw ? JSON.parse(raw) : [];
                arr.push(entry);
                while (arr.length > MAX_LOG_ENTRIES) arr.shift();
                localStorage.setItem(LS_KEY, JSON.stringify(arr));
            } catch (_) { /* quota or disabled — ignore */ }
        } catch (_) { /* never throw from error handler */ }
    }

    // Uncaught script error (sync + async via window)
    window.addEventListener('error', function (e) {
        if (!e) return;
        const msg = (e.message || '').substring(0, 200);
        const src = (e.filename || '').substring(0, 120);
        // Resource load failures (img, script) come with no message — distinguish
        if (e.target && e.target !== window && e.target.tagName) {
            logError('resource_error', {
                tag: e.target.tagName,
                src: (e.target.src || e.target.href || '').substring(0, 120)
            });
            return;
        }
        logError('script_error', {
            msg: msg,
            src: src,
            line: e.lineno || 0,
            col: e.colno || 0
        });
    }, true); // capture phase catches resource errors too

    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', function (e) {
        if (!e) return;
        let reason = '';
        try {
            reason = (e.reason && (e.reason.message || e.reason.toString())) || String(e.reason);
        } catch (_) { reason = '[unstringifiable]'; }
        logError('unhandled_rejection', { reason: reason.substring(0, 200) });
    });

    // Public-ish surface so other modules can report handled errors with structure
    window.BBGErrorBoundary = {
        report: function (eventName, payload) { logError(eventName, payload); },
        getRecent: function () {
            try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
            catch (_) { return []; }
        },
        clear: function () { try { localStorage.removeItem(LS_KEY); } catch (_) {} }
    };
})();
