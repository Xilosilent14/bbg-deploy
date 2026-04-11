/* ============================================
   CREATURE CARDS — Web Audio SFX System
   All sounds synthesized, no audio files needed
   ============================================ */
const AudioSystem = (() => {
    let ctx = null;
    let masterGain = null, sfxGain = null, musicGain = null;
    let sfxEnabled = true, musicEnabled = true;
    let musicOsc = null, musicInterval = null;
    let unlocked = false;

    function init() {
        const settings = typeof Progress !== 'undefined' ? Progress.getSettings() : {};
        sfxEnabled = settings.sfx !== false;
        musicEnabled = settings.music !== false;
    }

    function _ensureCtx() {
        if (ctx) return true;
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = ctx.createGain();
            masterGain.gain.value = 0.7;
            masterGain.connect(ctx.destination);

            sfxGain = ctx.createGain();
            sfxGain.gain.value = 0.6;
            sfxGain.connect(masterGain);

            musicGain = ctx.createGain();
            musicGain.gain.value = 0.3;
            musicGain.connect(masterGain);
            return true;
        } catch (e) {
            return false;
        }
    }

    // MP3 sound effect cache
    const _mp3Cache = {};
    let _mp3Loaded = false;
    function _loadMP3Assets() {
        if (_mp3Loaded) return;
        _mp3Loaded = true;
        if (!_ensureCtx()) return;
        const manifest = [
            { key: 'click', src: 'assets/sounds/sfx/click.mp3' },
            { key: 'correct', src: 'assets/sounds/sfx/correct.mp3' },
            { key: 'wrong', src: 'assets/sounds/sfx/wrong.mp3' },
            { key: 'coin', src: 'assets/sounds/sfx/coin.mp3' },
            { key: 'purchase', src: 'assets/sounds/sfx/purchase.mp3' },
            { key: 'levelup', src: 'assets/sounds/sfx/levelup.mp3' },
            { key: 'achievement', src: 'assets/sounds/sfx/achievement.mp3' },
            { key: 'victory', src: 'assets/sounds/sfx/victory.mp3' },
            { key: 'star', src: 'assets/sounds/sfx/star.mp3' },
            { key: 'streak', src: 'assets/sounds/sfx/streak.mp3' },
            { key: 'transition', src: 'assets/sounds/sfx/transition.mp3' },
            { key: 'attack', src: 'assets/sounds/sfx/attack.mp3' },
            { key: 'damage', src: 'assets/sounds/sfx/damage.mp3' },
            { key: 'heal', src: 'assets/sounds/sfx/heal.mp3' },
            { key: 'card-reveal', src: 'assets/sounds/sfx/card-reveal.mp3' },
            { key: 'pack-open', src: 'assets/sounds/sfx/pack-open.mp3' },
            { key: 'faint', src: 'assets/sounds/sfx/faint.mp3' }
        ];
        manifest.forEach(({ key, src }) => {
            fetch(src)
                .then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
                .then(buf => ctx.decodeAudioData(buf))
                .then(decoded => { _mp3Cache[key] = decoded; })
                .catch(() => {});
        });
    }
    function _playMP3(key, volume = 0.5) {
        const buf = _mp3Cache[key];
        if (!buf) return false;
        if (!sfxEnabled) return true;
        const source = ctx.createBufferSource();
        source.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(sfxGain);
        source.start(0);
        return true;
    }

    function unlock() {
        if (unlocked) return;
        if (!_ensureCtx()) return;
        if (ctx.state === 'suspended') ctx.resume();
        _loadMP3Assets();
        // Play silent buffer to unlock on iOS/Android
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        unlocked = true;
    }

    // --- Utility helpers ---

    function _osc(type, freq, gainNode, startTime, duration, endFreq) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, startTime);
        if (endFreq !== undefined) {
            o.frequency.linearRampToValueAtTime(endFreq, startTime + duration);
        }
        g.gain.setValueAtTime(0.3, startTime);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        o.connect(g);
        g.connect(gainNode);
        o.start(startTime);
        o.stop(startTime + duration);
    }

    function _noise(gainNode, startTime, duration, volume) {
        const bufSize = ctx.sampleRate * duration;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (volume || 0.3);
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g = ctx.createGain();
        g.gain.setValueAtTime(volume || 0.3, startTime);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        src.connect(g);
        g.connect(gainNode);
        src.start(startTime);
        src.stop(startTime + duration);
    }

    function _note(freq, startTime, duration, type) {
        _osc(type || 'sine', freq, sfxGain, startTime, duration);
    }

    // --- SFX Methods ---

    function playCorrect() {
        if (_playMP3('correct', 0.5)) return;
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        _note(523.25, t, 0.15);
        _note(659.25, t + 0.1, 0.15);
        _note(783.99, t + 0.2, 0.2);
    }

    function playWrong() {
        if (_playMP3('wrong', 0.5)) return;
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        _osc('triangle', 300, sfxGain, t, 0.3, 200);
    }

    function playAttack() {
        if (_playMP3('attack', 0.5)) return;
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        _noise(sfxGain, t, 0.15, 0.25);
        _osc('sine', 150, sfxGain, t + 0.1, 0.2, 60);
    }

    function playWeakAttack() {
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Softer, shorter version
        _noise(sfxGain, t, 0.1, 0.15);
        _osc('sine', 120, sfxGain, t + 0.05, 0.15, 80);
    }

    function playDamage() {
        if (_playMP3('damage', 0.5)) return;
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        _osc('sine', 120, sfxGain, t, 0.15, 60);
        _noise(sfxGain, t, 0.08, 0.15);
    }

    function playFainted() {
        if (_playMP3('faint', 0.5)) return;
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        _osc('sine', 400, sfxGain, t, 0.25, 200);
        _osc('sine', 300, sfxGain, t + 0.2, 0.3, 100);
    }

    function playVictory() {
        if (_playMP3('victory', 0.5)) return;
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Triumphant fanfare: 4 ascending notes + chord
        _note(523.25, t, 0.15);          // C5
        _note(587.33, t + 0.15, 0.15);   // D5
        _note(659.25, t + 0.3, 0.15);    // E5
        _note(783.99, t + 0.45, 0.25);   // G5
        // Final chord
        _note(523.25, t + 0.7, 0.4);     // C5
        _note(659.25, t + 0.7, 0.4);     // E5
        _note(783.99, t + 0.7, 0.4);     // G5
    }

    function playDefeat() {
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Minor key descending
        _osc('triangle', 440, sfxGain, t, 0.25, 392);         // A4 -> G4
        _osc('triangle', 349.23, sfxGain, t + 0.25, 0.25, 293.66); // F4 -> D4
        _osc('triangle', 261.63, sfxGain, t + 0.5, 0.35, 220);     // C4 -> A3
    }

    function playCardReveal() {
        if (_playMP3('card-reveal', 0.5)) return;
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Quick sparkle arpeggio
        _note(880, t, 0.08);        // A5
        _note(1108.73, t + 0.06, 0.08); // C#6
        _note(1318.51, t + 0.12, 0.12); // E6
        _note(1760, t + 0.18, 0.15);    // A6
    }

    function playPackOpen() {
        if (_playMP3('pack-open', 0.5)) return;
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Magical whoosh + shimmer
        _noise(sfxGain, t, 0.25, 0.2);
        _osc('sine', 400, sfxGain, t + 0.1, 0.15, 1200);
        _note(1318.51, t + 0.25, 0.15);  // E6
        _note(1567.98, t + 0.3, 0.2);    // G6
    }

    function playClick() {
        if (_playMP3('click', 0.4)) return;
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Soft pop
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(800, t);
        o.frequency.exponentialRampToValueAtTime(400, t + 0.05);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        o.connect(g);
        g.connect(sfxGain);
        o.start(t);
        o.stop(t + 0.05);
    }

    function playAbility() {
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Power-up sweep
        _osc('sawtooth', 200, sfxGain, t, 0.2, 600);
        _osc('sine', 300, sfxGain, t + 0.1, 0.3, 900);
    }

    function playCombo(count) {
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Escalating ping based on combo count
        const baseFreq = 600 + Math.min((count || 1), 10) * 80;
        _note(baseFreq, t, 0.08);
        _note(baseFreq * 1.25, t + 0.06, 0.08);
        _note(baseFreq * 1.5, t + 0.12, 0.12);
    }

    function playDailyPack() {
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Special celebratory jingle
        _note(523.25, t, 0.1);          // C5
        _note(659.25, t + 0.1, 0.1);    // E5
        _note(783.99, t + 0.2, 0.1);    // G5
        _note(1046.5, t + 0.3, 0.15);   // C6
        // Shimmer
        _note(1318.51, t + 0.45, 0.15); // E6
        _note(1567.98, t + 0.55, 0.25); // G6
    }

    function playHeal() {
        if (_playMP3('heal', 0.5)) return;
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Gentle ascending shimmer
        _osc('sine', 400, sfxGain, t, 0.15, 600);
        _osc('sine', 600, sfxGain, t + 0.1, 0.15, 900);
        _osc('sine', 900, sfxGain, t + 0.2, 0.2, 1200);
    }

    function playTypeAdvantage() {
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Powerful impact + reverb-like echo
        _noise(sfxGain, t, 0.12, 0.3);
        _osc('sine', 200, sfxGain, t, 0.2, 80);
        // Echo
        _osc('sine', 180, sfxGain, t + 0.15, 0.2, 70);
        _osc('sine', 160, sfxGain, t + 0.3, 0.2, 60);
    }

    // Per-type attack sounds
    function playFireAttack() {
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        _noise(sfxGain, t, 0.15, 0.3);
        _osc('sawtooth', 400, sfxGain, t, 0.12, 100);
        _osc('sawtooth', 600, sfxGain, t + 0.05, 0.1, 200);
        _osc('sawtooth', 800, sfxGain, t + 0.1, 0.08, 300);
    }

    function playWaterAttack() {
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        _osc('sine', 300, sfxGain, t, 0.25, 600);
        _osc('sine', 500, sfxGain, t + 0.1, 0.2, 300);
        _noise(sfxGain, t + 0.05, 0.2, 0.15);
    }

    function playGrassAttack() {
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        _osc('triangle', 800, sfxGain, t, 0.08, 400);
        _osc('triangle', 1000, sfxGain, t + 0.08, 0.08, 500);
        _osc('triangle', 1200, sfxGain, t + 0.16, 0.1, 600);
    }

    function playLightAttack() {
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        _note(1200, t, 0.1);
        _note(1600, t + 0.06, 0.1);
        _note(2000, t + 0.12, 0.15);
    }

    function playDarkAttack() {
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        _osc('sawtooth', 150, sfxGain, t, 0.2, 50);
        _noise(sfxGain, t, 0.2, 0.25);
        _osc('sine', 100, sfxGain, t + 0.1, 0.15, 50);
    }

    function playTypedAttack(type) {
        const map = { ember: playFireAttack, tidal: playWaterAttack, terra: playGrassAttack, spark: playLightAttack, shadow: playDarkAttack };
        (map[type] || playAttack)();
    }

    function playPurchase() {
        if (_playMP3('purchase', 0.5)) return;
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Coin-drop chime: descending sparkle
        _note(1200, t, 0.08);
        _note(1000, t + 0.07, 0.08);
        _note(800, t + 0.14, 0.1);
        _note(1400, t + 0.25, 0.15);
    }

    function playSwap() {
        if (!sfxEnabled || !_ensureCtx()) return;
        const t = ctx.currentTime;
        // Quick whoosh swap sound
        _osc('sine', 600, sfxGain, t, 0.12, 300);
        _osc('sine', 300, sfxGain, t + 0.08, 0.12, 600);
    }

    // --- Background Music ---

    function startBattleMusic() {
        if (!musicEnabled || !_ensureCtx()) return;
        stopMusic();

        // Battle theme: C minor, ~125 BPM (480ms per beat)
        // Melody (square wave), Bass (triangle), Drums (noise kicks + hi-hats)
        const BPM = 125;
        const beatSec = 60 / BPM;
        const barSec = beatSec * 4;

        // C minor melody: C4 Eb4 G4 F4 | Eb4 D4 C4 Bb3 (8th notes)
        const melody = [
            261.63, 311.13, 392.00, 349.23,
            311.13, 293.66, 261.63, 233.08,
            261.63, 349.23, 311.13, 392.00,
            440.00, 392.00, 349.23, 311.13
        ];
        // Bass notes: one per beat, root movement
        const bass = [
            130.81, 130.81, 155.56, 155.56,  // C3, C3, Eb3, Eb3
            116.54, 116.54, 130.81, 130.81,   // Bb2, Bb2, C3, C3
            130.81, 130.81, 174.61, 174.61,    // C3, C3, F3, F3
            155.56, 146.83, 130.81, 130.81     // Eb3, D3, C3, C3
        ];

        let step = 0;
        const totalSteps = 16;
        const eighthSec = beatSec / 2;

        function playStep() {
            if (!ctx || !musicEnabled) return;
            const t = ctx.currentTime;
            const idx = step % totalSteps;

            // --- Melody (square wave) ---
            const mo = ctx.createOscillator();
            const mg = ctx.createGain();
            mo.type = 'square';
            mo.frequency.setValueAtTime(melody[idx], t);
            mg.gain.setValueAtTime(0.08, t);
            mg.gain.setValueAtTime(0.08, t + eighthSec * 0.7);
            mg.gain.exponentialRampToValueAtTime(0.001, t + eighthSec * 0.95);
            mo.connect(mg);
            mg.connect(musicGain);
            mo.start(t);
            mo.stop(t + eighthSec);

            // --- Bass (triangle, one per beat = every 2 steps) ---
            if (idx % 2 === 0) {
                const bo = ctx.createOscillator();
                const bg = ctx.createGain();
                bo.type = 'triangle';
                bo.frequency.setValueAtTime(bass[idx], t);
                bg.gain.setValueAtTime(0.14, t);
                bg.gain.exponentialRampToValueAtTime(0.001, t + beatSec * 0.9);
                bo.connect(bg);
                bg.connect(musicGain);
                bo.start(t);
                bo.stop(t + beatSec);
            }

            // --- Drums ---
            // Kick on beats 0 and 2 (steps 0, 4, 8, 12)
            if (idx % 4 === 0) {
                const ko = ctx.createOscillator();
                const kg = ctx.createGain();
                ko.type = 'sine';
                ko.frequency.setValueAtTime(150, t);
                ko.frequency.exponentialRampToValueAtTime(40, t + 0.12);
                kg.gain.setValueAtTime(0.2, t);
                kg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                ko.connect(kg);
                kg.connect(musicGain);
                ko.start(t);
                ko.stop(t + 0.15);
            }

            // Hi-hat every beat (steps 0, 2, 4, 6, 8, 10, 12, 14)
            if (idx % 2 === 0) {
                const bufSize = Math.floor(ctx.sampleRate * 0.04);
                const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                const data = buf.getChannelData(0);
                for (let j = 0; j < bufSize; j++) {
                    data[j] = (Math.random() * 2 - 1) * 0.15;
                }
                const hh = ctx.createBufferSource();
                hh.buffer = buf;
                const hg = ctx.createGain();
                // Accent on off-beats for groove
                const vol = (idx % 4 === 2) ? 0.12 : 0.08;
                hg.gain.setValueAtTime(vol, t);
                hg.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
                // High-pass filter for crispness
                const hf = ctx.createBiquadFilter();
                hf.type = 'highpass';
                hf.frequency.value = 8000;
                hh.connect(hf);
                hf.connect(hg);
                hg.connect(musicGain);
                hh.start(t);
                hh.stop(t + 0.05);
            }

            step++;
        }

        playStep();
        musicInterval = setInterval(playStep, eighthSec * 1000);
    }

    // MP3 background music for menu/title
    let _bgmAudio = null;
    function startTitleMusic() {
        if (!musicEnabled) return;
        stopMusic();
        _bgmAudio = document.createElement('audio'); _bgmAudio.src = 'assets/sounds/music/bgm-menu.mp3';
        _bgmAudio.loop = true;
        _bgmAudio.volume = 0.18;
        _bgmAudio.play().catch(() => {});
    }

    // Keep original synth title as unused reference
    function _startTitleMusicSynth() {
        if (!musicEnabled || !_ensureCtx()) return;
        stopMusic();
        const BPM = 72;
        const beatSec = 60 / BPM;
        const notes = [
            261.63, 329.63, 392.00, 493.88,
            293.66, 349.23, 440.00, 523.25,
            261.63, 311.13, 392.00, 523.25,
            246.94, 311.13, 370.00, 466.16
        ];
        let step = 0;
        const total = notes.length;
        const stepSec = beatSec;

        function playStep() {
            if (!ctx || !musicEnabled) return;
            const t = ctx.currentTime;
            const idx = step % total;

            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(notes[idx], t);
            g.gain.setValueAtTime(0.06, t);
            g.gain.setValueAtTime(0.06, t + stepSec * 0.5);
            g.gain.exponentialRampToValueAtTime(0.001, t + stepSec * 0.95);
            o.connect(g);
            g.connect(musicGain);
            o.start(t);
            o.stop(t + stepSec);

            // Pad drone on every 4 steps
            if (idx % 4 === 0) {
                const po = ctx.createOscillator();
                const pg = ctx.createGain();
                po.type = 'sine';
                po.frequency.setValueAtTime(notes[idx] / 2, t);
                pg.gain.setValueAtTime(0.04, t);
                pg.gain.exponentialRampToValueAtTime(0.001, t + stepSec * 3.8);
                po.connect(pg);
                pg.connect(musicGain);
                po.start(t);
                po.stop(t + stepSec * 4);
            }

            step++;
        }

        playStep();
        musicInterval = setInterval(playStep, stepSec * 1000);
    }

    function stopMusic() {
        // Stop MP3 music
        if (_bgmAudio) { _bgmAudio.pause(); _bgmAudio.currentTime = 0; _bgmAudio = null; }
        // Stop synth music
        if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        }
        if (musicGain && ctx) {
            try {
                musicGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                setTimeout(() => {
                    if (musicGain) musicGain.gain.setValueAtTime(0.3, ctx.currentTime);
                }, 600);
            } catch (e) {}
        }
    }

    // --- Settings ---

    function setSFX(on) {
        sfxEnabled = on;
    }

    function setMusic(on) {
        musicEnabled = on;
        if (!on) stopMusic();
    }

    return {
        init, unlock,
        playCorrect, playWrong,
        playAttack, playWeakAttack,
        playDamage, playFainted,
        playVictory, playDefeat,
        playCardReveal, playPackOpen,
        playClick, playAbility,
        playCombo, playDailyPack,
        playHeal, playTypeAdvantage,
        playFireAttack, playWaterAttack, playGrassAttack, playLightAttack, playDarkAttack, playTypedAttack,
        playPurchase, playSwap,
        startBattleMusic, startTitleMusic, stopMusic,
        setSFX, setMusic
    };
})();
