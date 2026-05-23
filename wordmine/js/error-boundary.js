/* ============================================
   ERROR BOUNDARY — Global error capture
   Structured logging for triage. Survives SES lockdown.
   Public API: none (auto-installs).
   ============================================ */
(function () {
    'use strict';

    var GAME = 'wordmine';
    var MAX_ERRORS = 50;
    var seen = 0;

    function _serialize(err) {
        try {
            if (!err) return { name: 'null', message: '(no error)' };
            if (typeof err === 'string') return { name: 'string', message: err };
            return {
                name: err.name || 'Error',
                message: err.message || String(err),
                stack: (err.stack || '').split('\n').slice(0, 6).join(' | ')
            };
        } catch (_) { return { name: 'Unserializable', message: '(opaque)' }; }
    }

    function _log(kind, payload) {
        if (seen >= MAX_ERRORS) return;
        seen++;
        try {
            // Structured tag for downstream parsing
            console.error('[bbg.err] ' + JSON.stringify(Object.assign({
                game: GAME,
                t: Date.now(),
                kind: kind
            }, payload)));
        } catch (_) { /* never throw from error handler */ }
    }

    window.addEventListener('error', function (ev) {
        _log('error', {
            file: ev.filename || '?',
            line: ev.lineno || 0,
            col: ev.colno || 0,
            err: _serialize(ev.error || ev.message)
        });
    });

    window.addEventListener('unhandledrejection', function (ev) {
        _log('unhandledrejection', { err: _serialize(ev.reason) });
    });

    window.BBGErrorBoundary = {
        report: function (where, err) { _log('manual', { where: where, err: _serialize(err) }); },
        count: function () { return seen; }
    };
})();
