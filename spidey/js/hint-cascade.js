/**
 * HintCascade — Inactivity-driven hint system for 3.5-year-olds.
 *
 * Pre-K kids need scaffolding when they stall. This module provides
 * a 5s / 10s / 15s cascade for any activity question:
 *   - 5s:  visually pulse the correct answer element
 *   - 10s: animate an arrow pointing at the correct answer
 *   - 15s: re-speak the prompt via Voice.speak()
 *
 * Usage from an activity:
 *   HintCascade.start({
 *       containerEl: container,           // root element for the question
 *       getCorrectEl: () => container.querySelector('[data-answer="A"]'),
 *       prompt: 'Find the letter A!',     // string OR () => string
 *   });
 *   // ...whenever the user taps anything, call HintCascade.tap()
 *   // when the question/screen changes:
 *   HintCascade.stop();
 *
 * Safe to call stop()/tap() when not started.
 */
const HintCascade = (() => {
    let _t1 = null, _t2 = null, _t3 = null;
    let _arrowEl = null;
    let _lastTargetEl = null;
    let _active = false;
    let _opts = null;

    function _clearTimers() {
        if (_t1) { clearTimeout(_t1); _t1 = null; }
        if (_t2) { clearTimeout(_t2); _t2 = null; }
        if (_t3) { clearTimeout(_t3); _t3 = null; }
    }

    function _removeArrow() {
        if (_arrowEl && _arrowEl.parentNode) {
            _arrowEl.parentNode.removeChild(_arrowEl);
        }
        _arrowEl = null;
    }

    function _removePulse() {
        if (_lastTargetEl) {
            _lastTargetEl.classList.remove('hint-pulse');
            _lastTargetEl = null;
        }
    }

    function _pulseCorrect() {
        if (!_opts) return;
        try {
            const el = _opts.getCorrectEl && _opts.getCorrectEl();
            if (!el) return;
            _lastTargetEl = el;
            el.classList.add('hint-pulse');
        } catch (e) { /* ignore */ }
    }

    function _showArrow() {
        if (!_opts) return;
        try {
            const el = _opts.getCorrectEl && _opts.getCorrectEl();
            if (!el) return;
            _removeArrow();
            const rect = el.getBoundingClientRect();
            const arrow = document.createElement('div');
            arrow.className = 'hint-arrow';
            arrow.textContent = '👉';
            arrow.setAttribute('aria-hidden', 'true');
            // Place arrow just above target, pointing down.
            const top = Math.max(8, rect.top - 56);
            const left = Math.max(8, rect.left + rect.width / 2 - 28);
            arrow.style.top = top + 'px';
            arrow.style.left = left + 'px';
            document.body.appendChild(arrow);
            _arrowEl = arrow;
        } catch (e) { /* ignore */ }
    }

    function _reNarrate() {
        if (!_opts) return;
        try {
            const p = typeof _opts.prompt === 'function' ? _opts.prompt() : _opts.prompt;
            if (p && typeof Voice !== 'undefined' && Voice.speak) {
                Voice.speak(p);
            }
        } catch (e) { /* ignore */ }
    }

    function _scheduleAll() {
        _clearTimers();
        _t1 = setTimeout(_pulseCorrect, 5000);
        _t2 = setTimeout(_showArrow, 10000);
        _t3 = setTimeout(_reNarrate, 15000);
    }

    function start(opts) {
        stop();
        if (!opts || !opts.getCorrectEl) return;
        _opts = opts;
        _active = true;
        _scheduleAll();
    }

    function tap() {
        if (!_active) return;
        _removePulse();
        _removeArrow();
        _scheduleAll();
    }

    function stop() {
        _active = false;
        _clearTimers();
        _removePulse();
        _removeArrow();
        _opts = null;
    }

    return { start, tap, stop };
})();
