/**
 * Audio — Synthesized sound effects via Web Audio API
 * No external audio files needed. All sounds generated in real-time.
 */
const Audio = (() => {
    let ctx = null;
    let enabled = true;

    function _ensureCtx() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function _play(fn) {
        if (!enabled) return;
        try { fn(_ensureCtx()); } catch (e) { /* silent fail */ }
    }

    // Bright happy chime for correct answers
    function playCorrect() {
        _play(ctx => {
            const now = ctx.currentTime;
            [523, 659, 784].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.25, now + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
                osc.connect(gain).connect(ctx.destination);
                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.4);
            });
        });
    }

    // Soft gentle boop for wrong answers (not harsh)
    function playWrong() {
        _play(ctx => {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(200, now + 0.2);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        });
    }

    // Satisfying pop for catching bugs
    function playPop() {
        _play(ctx => {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        });
    }

    // Triumphant fanfare for sticker earned
    function playSticker() {
        _play(ctx => {
            const now = ctx.currentTime;
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = i < 3 ? 'triangle' : 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, now + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
                osc.connect(gain).connect(ctx.destination);
                osc.start(now + i * 0.15);
                osc.stop(now + i * 0.15 + 0.5);
            });
        });
    }

    // Soft click for button taps
    function playTap() {
        _play(ctx => {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.06);
        });
    }

    // Big celebration sound
    function playCelebration() {
        _play(ctx => {
            const now = ctx.currentTime;
            const melody = [523, 587, 659, 784, 880, 1047];
            melody.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, now + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
                osc.connect(gain).connect(ctx.destination);
                osc.start(now + i * 0.12);
                osc.stop(now + i * 0.12 + 0.4);
            });
        });
    }

    // Whoosh for screen transitions
    function playWhoosh() {
        _play(ctx => {
            const now = ctx.currentTime;
            const bufferSize = ctx.sampleRate * 0.2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }
            const source = ctx.createBufferSource();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            source.buffer = buffer;
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1000, now);
            filter.frequency.exponentialRampToValueAtTime(4000, now + 0.15);
            filter.Q.value = 2;
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            source.connect(filter).connect(gain).connect(ctx.destination);
            source.start(now);
            source.stop(now + 0.2);
        });
    }

    function toggle(on) { enabled = on; }

    // Unlock audio context on first user interaction
    function unlock() {
        _ensureCtx();
    }

    return {
        playCorrect, playWrong, playPop, playTap,
        playSticker, playCelebration, playWhoosh,
        toggle, unlock
    };
})();
