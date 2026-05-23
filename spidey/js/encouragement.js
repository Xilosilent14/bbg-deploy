/**
 * Encouragement — Gentle audio feedback on wrong taps.
 *
 * Rotates through a small set of kid-friendly phrases so wrong answers
 * never feel punishing. Also exposes a fast positive chime via
 * AudioContext for sub-100ms tap confirmation on correct answers.
 */
const Encouragement = (() => {
    const PHRASES = [
        'Oops, try again!',
        'Not quite! You got this!',
        'Almost! Try another one!',
        'Good try! Pick again!',
        'So close! One more try!',
        "It's okay! Try a different one!"
    ];

    let _idx = 0;
    let _ctx = null;
    let _lastChime = 0;

    function _getCtx() {
        if (!_ctx) {
            try {
                _ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return null; // SES lockdown or restricted browser
            }
        }
        if (_ctx && _ctx.state === 'suspended') {
            try { _ctx.resume(); } catch (e) { /* ignore */ }
        }
        return _ctx;
    }

    /**
     * Sub-100ms positive chime — fires synchronously via AudioContext
     * so the kid hears confirmation BEFORE any animation/transition.
     * Two-note ascending blip (C5 -> E5).
     */
    function chime() {
        const ctx = _getCtx();
        if (!ctx) return;
        // Debounce — don't double-fire within 80ms
        const now = ctx.currentTime;
        if (now - _lastChime < 0.08) return;
        _lastChime = now;
        try {
            const o1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            o1.type = 'sine';
            o1.frequency.setValueAtTime(523.25, now); // C5
            o1.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
            g1.gain.setValueAtTime(0.0001, now);
            g1.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
            g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            o1.connect(g1);
            g1.connect(ctx.destination);
            o1.start(now);
            o1.stop(now + 0.2);
        } catch (e) { /* ignore */ }
    }

    function speakWrong() {
        try {
            const phrase = PHRASES[_idx % PHRASES.length];
            _idx++;
            if (typeof Voice !== 'undefined' && Voice.speak) {
                Voice.speak(phrase);
            }
        } catch (e) { /* ignore */ }
    }

    /** Flash the correct-tap element green immediately via class. */
    function pulseCorrect(el) {
        if (!el) return;
        el.classList.add('tap-correct-pulse');
        setTimeout(() => {
            try { el.classList.remove('tap-correct-pulse'); } catch (e) { /* ignore */ }
        }, 350);
    }

    /** Called once on first user gesture to unlock AudioContext. */
    function unlock() { _getCtx(); }

    return { chime, speakWrong, pulseCorrect, unlock, PHRASES };
})();
