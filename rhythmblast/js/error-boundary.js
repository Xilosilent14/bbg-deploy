/* ============================================
   RHYTHM BLAST — Error Boundary
   Captures runtime errors + unhandled rejections and emits a
   structured single-line JSON record that Hub dashboards can grep.
   Format: [bbg.err] {"game":"rhythmblast","ts":...,"type":...,"msg":...,...}
   ============================================ */
(function () {
    'use strict';

    function _emit(payload) {
        try {
            // Single-line JSON so Hub log scrapers / dashboards can parse easily.
            console.error('[bbg.err] ' + JSON.stringify(payload));
        } catch (_) {
            // Last resort — never let the error handler itself throw.
            try { console.error('[bbg.err] {"game":"rhythmblast","type":"serialize_fail"}'); } catch (_) {}
        }
    }

    function _truncate(s, max) {
        if (typeof s !== 'string') return String(s);
        return s.length > max ? s.slice(0, max) + '…' : s;
    }

    window.onerror = function (msg, source, line, col, error) {
        _emit({
            game: 'rhythmblast',
            ts: Date.now(),
            type: 'error',
            msg: _truncate(String(msg || ''), 300),
            source: _truncate(String(source || ''), 200),
            line: line | 0,
            col: col | 0,
            stack: error && error.stack ? _truncate(String(error.stack), 800) : null
        });
        // Returning false lets the default handler still log (helpful in dev).
        return false;
    };

    window.addEventListener('unhandledrejection', function (event) {
        var reason = event && event.reason;
        var msg = '';
        var stack = null;
        if (reason instanceof Error) {
            msg = reason.message;
            stack = reason.stack || null;
        } else {
            try { msg = typeof reason === 'string' ? reason : JSON.stringify(reason); }
            catch (_) { msg = String(reason); }
        }
        _emit({
            game: 'rhythmblast',
            ts: Date.now(),
            type: 'unhandled_rejection',
            msg: _truncate(msg, 300),
            stack: stack ? _truncate(stack, 800) : null
        });
    });

    // Expose a manual hook so other modules can log structured events on demand.
    window.BBGErrors = {
        report: function (type, details) {
            _emit(Object.assign({ game: 'rhythmblast', ts: Date.now(), type: type || 'manual' }, details || {}));
        }
    };
})();
