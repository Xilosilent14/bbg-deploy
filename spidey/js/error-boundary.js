/**
 * Error Boundary — structured runtime error logging for Spidey Academy.
 *
 * Captures uncaught errors and unhandled promise rejections, formats them
 * as a single-line JSON record under the [bbg.err] tag so they can be
 * grep'd in DevTools or piped to a remote collector later.
 *
 * Keep this file external — inline scripts are blocked by SES / CSP.
 */
(function () {
    'use strict';

    function _emit(payload) {
        try {
            console.error('[bbg.err]', JSON.stringify(payload));
        } catch (_) {
            // JSON.stringify can fail on circular structures; fall back.
            try { console.error('[bbg.err]', payload); } catch (__) {}
        }
    }

    function _stringStack(err) {
        if (!err) return '';
        if (typeof err === 'string') return err;
        if (err.stack) return String(err.stack).split('\n').slice(0, 6).join(' | ');
        return String(err.message || err);
    }

    window.addEventListener('error', function (event) {
        _emit({
            game: 'spidey',
            type: 'error',
            msg: event && event.message ? String(event.message).slice(0, 240) : 'unknown',
            src: event && event.filename ? String(event.filename).slice(-120) : '',
            line: event && typeof event.lineno === 'number' ? event.lineno : -1,
            col: event && typeof event.colno === 'number' ? event.colno : -1,
            stack: _stringStack(event && event.error).slice(0, 600),
            ts: Date.now()
        });
    });

    window.addEventListener('unhandledrejection', function (event) {
        var reason = event && event.reason;
        _emit({
            game: 'spidey',
            type: 'rejection',
            msg: reason && reason.message ? String(reason.message).slice(0, 240) : String(reason).slice(0, 240),
            stack: _stringStack(reason).slice(0, 600),
            ts: Date.now()
        });
    });
})();
