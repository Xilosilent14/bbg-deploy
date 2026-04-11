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

    // MP3 sound effect cache
    const _mp3Cache = {};
    let _mp3Loaded = false;
    function _loadMP3Assets() {
        if (_mp3Loaded) return;
        _mp3Loaded = true;
        const c = _ensureCtx();
        const manifest = [
            { key: 'click', src: 'assets/sounds/sfx/click.mp3' },
            { key: 'correct', src: 'assets/sounds/sfx/correct.mp3' },
            { key: 'wrong', src: 'assets/sounds/sfx/wrong.mp3' },
            { key: 'pop', src: 'assets/sounds/sfx/pop.mp3' },
            { key: 'sticker', src: 'assets/sounds/sfx/sticker.mp3' },
            { key: 'whoosh', src: 'assets/sounds/sfx/whoosh.mp3' },
            { key: 'celebration', src: 'assets/sounds/sfx/celebration.mp3' },
            { key: 'tap', src: 'assets/sounds/sfx/tap.mp3' },
            { key: 'star', src: 'assets/sounds/sfx/star.mp3' },
            { key: 'coin', src: 'assets/sounds/sfx/coin.mp3' }
        ];
        manifest.forEach(({ key, src }) => {
            fetch(src)
                .then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
                .then(buf => c.decodeAudioData(buf))
                .then(decoded => { _mp3Cache[key] = decoded; })
                .catch(() => {});
        });
    }
    function _playMP3(key, volume = 0.5) {
        const buf = _mp3Cache[key];
        if (!buf) return false;
        if (!enabled) return true;
        const c = _ensureCtx();
        const source = c.createBufferSource();
        source.buffer = buf;
        const gain = c.createGain();
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(c.destination);
        source.start(0);
        return true;
    }

    // Bright happy chime for correct answers
    function playCorrect() {
        if (_playMP3('correct', 0.5)) return;
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
        if (_playMP3('wrong', 0.4)) return;
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
        if (_playMP3('pop', 0.5)) return;
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
        if (_playMP3('sticker', 0.5)) return;
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
        if (_playMP3('tap', 0.4)) return;
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
        if (_playMP3('celebration', 0.5)) return;
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
        if (_playMP3('whoosh', 0.5)) return;
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

    // Background music (MP3 loop)
    let _bgm = null;
    let _musicOn = true;
    function startMusic() {
        if (!_musicOn || _bgm) return;
        _bgm = document.createElement('audio'); _bgm.src = 'assets/sounds/music/bgm-play.mp3';
        _bgm.loop = true;
        _bgm.volume = 0.15;
        _bgm.play().catch(() => {});
    }
    function stopMusic() {
        if (_bgm) { _bgm.pause(); _bgm.currentTime = 0; _bgm = null; }
    }
    function toggleMusic(on) {
        _musicOn = on;
        if (on) startMusic(); else stopMusic();
    }

    // Unlock audio context on first user interaction
    function unlock() {
        _ensureCtx();
        _loadMP3Assets();
        startMusic();
    }

    return {
        playCorrect, playWrong, playPop, playTap,
        playSticker, playCelebration, playWhoosh,
        toggle, unlock, startMusic, stopMusic, toggleMusic
    };
})();
