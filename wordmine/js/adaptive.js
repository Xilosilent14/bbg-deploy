/* ============================================
   ADAPTIVE — Shared difficulty controller
   Targets ~78% success across recent answers.
   Public API:
     Adaptive.recordResult(correct: boolean)
     Adaptive.currentLevel(): number  (0..7, default 2)
     Adaptive.windowAccuracy(): number  (0..1, NaN if no data)
     Adaptive.reset()
   Used across modes to nudge difficulty up if recent
   accuracy > 0.85, down if < 0.65. No-op until window has
   at least MIN_SAMPLES results.
   ============================================ */
(function () {
    'use strict';

    var STORAGE_KEY = 'wm_adaptive_v1';
    var WINDOW_SIZE = 20;
    var MIN_SAMPLES = 8;
    var TARGET = 0.78;
    var UP_THRESHOLD = 0.85;
    var DOWN_THRESHOLD = 0.65;
    var LEVEL_MIN = 0;
    var LEVEL_MAX = 7;
    var COOLDOWN = 8; // answers between level changes

    var state = null;

    function _load() {
        if (state) return state;
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                state = JSON.parse(raw);
                if (!Array.isArray(state.window)) state.window = [];
                if (typeof state.level !== 'number') state.level = 2;
                if (typeof state.sinceChange !== 'number') state.sinceChange = 0;
                return state;
            }
        } catch (e) { /* fall through */ }
        state = { window: [], level: 2, sinceChange: COOLDOWN };
        return state;
    }

    function _save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
        catch (e) { /* quota / private mode — ignore */ }
    }

    function recordResult(correct) {
        var s = _load();
        s.window.push(correct ? 1 : 0);
        if (s.window.length > WINDOW_SIZE) s.window.shift();
        s.sinceChange++;

        if (s.window.length >= MIN_SAMPLES && s.sinceChange >= COOLDOWN) {
            var acc = s.window.reduce(function (a, b) { return a + b; }, 0) / s.window.length;
            if (acc > UP_THRESHOLD && s.level < LEVEL_MAX) {
                s.level++;
                s.sinceChange = 0;
            } else if (acc < DOWN_THRESHOLD && s.level > LEVEL_MIN) {
                s.level--;
                s.sinceChange = 0;
            }
        }
        _save();
    }

    function currentLevel() {
        return _load().level;
    }

    function windowAccuracy() {
        var s = _load();
        if (!s.window.length) return NaN;
        return s.window.reduce(function (a, b) { return a + b; }, 0) / s.window.length;
    }

    function reset() {
        state = { window: [], level: 2, sinceChange: COOLDOWN };
        _save();
    }

    window.Adaptive = {
        recordResult: recordResult,
        currentLevel: currentLevel,
        windowAccuracy: windowAccuracy,
        reset: reset,
        TARGET: TARGET
    };
})();
