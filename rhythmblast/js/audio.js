/* ============================================
   RHYTHM BLAST — Audio Engine
   Web Audio API synthesized music + SFX + beat scheduling
   Architecture (May 2026 deep audit):
     drum-bus + melody-bus + pad-bus -> music-bus -> reverb send + dry -> master compressor
     sfx-bus -> master compressor
     voice-bus -> master compressor (with sidechain-style ducking of music-bus during TTS)
     master compressor -> limiter (-1 dBFS) -> destination
   ============================================ */
const Audio = (() => {
    let ctx = null;
    let masterGain = null;
    let compressor = null;
    let limiter = null;
    let musicBus = null;      // sums drum/melody/pad/bass
    let drumBus = null;
    let melodyBus = null;
    let bassBus = null;
    let padBus = null;
    let sfxGain = null;
    let voiceGain = null;     // routes TTS-aware SFX (e.g., spoken confirmations)
    let reverbGain = null;
    let reverbDry = null;
    // Legacy aliases (kept so external callers using musicGain/padGain still work).
    let musicGain = null;
    let padGain = null;
    let unlocked = false;
    let settings = { sfx: true, music: true, voice: true };

    // Safe gain levels for children's hearing
    // MUSIC_VOL reduced from 0.3 -> 0.2 to compensate for Fire-tablet speaker boost (Apr/May 2026)
    const MASTER_VOL = 0.7;
    const MUSIC_VOL = 0.2;
    const SFX_VOL = 0.5;
    const VOICE_VOL = 0.85;
    const REVERB_WET = 0.15;
    const PAD_VOL = 0.08;
    // Per-bus mix levels (relative within music bus)
    const DRUM_BUS_VOL = 1.0;
    const MELODY_BUS_VOL = 0.9;
    const BASS_BUS_VOL = 1.0;
    // Ducking target (fraction of MUSIC_VOL) while voice is speaking
    const DUCK_LEVEL = 0.5;
    const DUCK_FADE = 0.25; // seconds

    function _getCtx() {
        if (!ctx) {
            try {
                ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return null; // SES or browser restriction — audio degrades gracefully
            }

            // === MASTER CHAIN: source-buses -> compressor -> limiter -> destination ===

            // Brick-wall limiter at -1 dBFS to protect tablet speakers
            limiter = ctx.createDynamicsCompressor();
            limiter.threshold.value = -1;
            limiter.knee.value = 0;
            limiter.ratio.value = 20;       // near brick-wall
            limiter.attack.value = 0.001;
            limiter.release.value = 0.05;
            limiter.connect(ctx.destination);

            // Glue compressor (program material)
            compressor = ctx.createDynamicsCompressor();
            compressor.threshold.value = -18;
            compressor.knee.value = 12;
            compressor.ratio.value = 3;
            compressor.attack.value = 0.005;
            compressor.release.value = 0.18;
            compressor.connect(limiter);

            masterGain = ctx.createGain();
            masterGain.gain.value = MASTER_VOL;
            masterGain.connect(compressor);

            // Reverb send (feedback delay network) — fed by melodyBus only for warmth
            reverbGain = ctx.createGain();
            reverbGain.gain.value = REVERB_WET;
            reverbDry = ctx.createGain();
            reverbDry.gain.value = 1.0;
            _setupReverb();

            // === MUSIC BUS (sums all musical sources) ===
            musicBus = ctx.createGain();
            musicBus.gain.value = MUSIC_VOL;
            musicBus.connect(reverbDry);

            // Per-track music sub-buses
            drumBus = ctx.createGain();
            drumBus.gain.value = DRUM_BUS_VOL;
            drumBus.connect(musicBus);

            melodyBus = ctx.createGain();
            melodyBus.gain.value = MELODY_BUS_VOL;
            melodyBus.connect(musicBus);
            melodyBus.connect(reverbGain); // reverb send on melody for warmth

            bassBus = ctx.createGain();
            bassBus.gain.value = BASS_BUS_VOL;
            bassBus.connect(musicBus);

            padBus = ctx.createGain();
            padBus.gain.value = PAD_VOL;
            padBus.connect(musicBus);
            padBus.connect(reverbGain);

            // SFX bus — bypasses ducking but still goes through master compressor/limiter
            sfxGain = ctx.createGain();
            sfxGain.gain.value = SFX_VOL;
            sfxGain.connect(masterGain);

            // Voice bus (for Web Audio voice playback like CloudTTS buffers).
            // Web Speech API is OS-level and can't be routed here, but ducking still applies.
            voiceGain = ctx.createGain();
            voiceGain.gain.value = VOICE_VOL;
            voiceGain.connect(masterGain);

            // Legacy aliases for back-compat with callers expecting musicGain / padGain
            musicGain = musicBus;
            padGain = padBus;
        }
        return ctx;
    }

    // Sidechain-style ducking: music bus drops to DUCK_LEVEL * MUSIC_VOL during voice.
    // Use smooth linear ramps (setTargetAtTime causes long tails on Silk).
    let _duckRefCount = 0;
    function _duckStart() {
        const c = _getCtx();
        if (!c || !musicBus) return;
        _duckRefCount++;
        try {
            const now = c.currentTime;
            musicBus.gain.cancelScheduledValues(now);
            musicBus.gain.setValueAtTime(musicBus.gain.value, now);
            musicBus.gain.linearRampToValueAtTime(MUSIC_VOL * DUCK_LEVEL, now + DUCK_FADE);
        } catch (e) {}
    }
    function _duckEnd() {
        const c = _getCtx();
        if (!c || !musicBus) return;
        _duckRefCount = Math.max(0, _duckRefCount - 1);
        if (_duckRefCount > 0) return; // still ducking for another voice line
        try {
            const now = c.currentTime;
            musicBus.gain.cancelScheduledValues(now);
            musicBus.gain.setValueAtTime(musicBus.gain.value, now);
            musicBus.gain.linearRampToValueAtTime(MUSIC_VOL, now + DUCK_FADE);
        } catch (e) {}
    }

    // Delay-based reverb (feedback delay with filtering)
    function _setupReverb() {
        const c = ctx;
        // Two delay taps for a wider sound
        const delay1 = c.createDelay(0.5);
        delay1.delayTime.value = 0.12;
        const delay2 = c.createDelay(0.5);
        delay2.delayTime.value = 0.19;

        const feedback1 = c.createGain();
        feedback1.gain.value = 0.3;
        const feedback2 = c.createGain();
        feedback2.gain.value = 0.25;

        // Low-pass filter on feedback to darken the tail
        const lpf = c.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = 3000;

        // Reverb chain: reverbGain -> delay1 -> lpf -> feedback1 -> delay1 (loop)
        reverbGain.connect(delay1);
        delay1.connect(lpf);
        lpf.connect(feedback1);
        feedback1.connect(delay1);

        reverbGain.connect(delay2);
        delay2.connect(feedback2);
        feedback2.connect(delay2);

        // Mix wet signal to master
        delay1.connect(masterGain);
        delay2.connect(masterGain);

        // Dry signal to master
        reverbDry.connect(masterGain);
    }

    // MP3 sound effect cache
    const _mp3Cache = {};
    let _mp3Loaded = false;
    function _loadMP3Assets() {
        if (_mp3Loaded) return;
        _mp3Loaded = true;
        const c = _getCtx();
        const manifest = [
            { key: 'click', src: 'assets/sounds/sfx/click.mp3' },
            { key: 'correct', src: 'assets/sounds/sfx/correct.mp3' },
            { key: 'wrong', src: 'assets/sounds/sfx/wrong.mp3' },
            { key: 'coin', src: 'assets/sounds/sfx/coin.mp3' },
            { key: 'star', src: 'assets/sounds/sfx/star.mp3' },
            { key: 'victory', src: 'assets/sounds/sfx/victory.mp3' },
            { key: 'streak', src: 'assets/sounds/sfx/streak.mp3' },
            { key: 'hit-perfect', src: 'assets/sounds/sfx/hit-perfect.mp3' },
            { key: 'hit-good', src: 'assets/sounds/sfx/hit-good.mp3' },
            { key: 'hit-miss', src: 'assets/sounds/sfx/hit-miss.mp3' },
            { key: 'combo', src: 'assets/sounds/sfx/combo.mp3' },
            { key: 'transition', src: 'assets/sounds/sfx/transition.mp3' }
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
        if (!settings.sfx) return true;
        const c = _getCtx();
        const source = c.createBufferSource();
        source.buffer = buf;
        const gain = c.createGain();
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(sfxGain);
        source.start(0);
        return true;
    }

    function unlock() {
        const c = _getCtx();
        if (c.state === 'suspended') c.resume();
        _loadMP3Assets();
        unlocked = true;
    }

    // ADSR envelope helper
    function _makeNote(freq, duration, waveform = 'sine', gainNode = sfxGain, vol = 0.3) {
        if (!settings.sfx && gainNode === sfxGain) return;
        const c = _getCtx();
        const osc = c.createOscillator();
        const env = c.createGain();
        osc.type = waveform;
        osc.frequency.value = freq;
        env.gain.setValueAtTime(0, c.currentTime);
        env.gain.linearRampToValueAtTime(vol, c.currentTime + 0.01); // attack
        env.gain.linearRampToValueAtTime(vol * 0.6, c.currentTime + 0.05); // decay
        env.gain.linearRampToValueAtTime(0, c.currentTime + duration); // release
        osc.connect(env);
        env.connect(gainNode);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + duration);
    }

    // Sample-accurate envelope helper — schedules an oscillator at a precise audio-time offset.
    // Use this instead of setTimeout for tight musical timing (avoids JS event-loop jitter on Silk).
    function _makeNoteAt(freq, startOffset, duration, waveform = 'sine', gainNode = sfxGain, vol = 0.3) {
        if (!settings.sfx && gainNode === sfxGain) return;
        const c = _getCtx();
        if (!c) return;
        const start = c.currentTime + Math.max(0, startOffset);
        try {
            const osc = c.createOscillator();
            const env = c.createGain();
            osc.type = waveform;
            osc.frequency.setValueAtTime(freq, start);
            env.gain.setValueAtTime(0, start);
            env.gain.linearRampToValueAtTime(vol, start + 0.01);
            env.gain.linearRampToValueAtTime(vol * 0.6, start + 0.05);
            env.gain.linearRampToValueAtTime(0, start + duration);
            osc.connect(env);
            env.connect(gainNode);
            osc.start(start);
            osc.stop(start + duration + 0.01);
        } catch (e) { /* ignore */ }
    }

    // C major pentatonic scale frequencies
    const SCALE = {
        C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
        C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00
    };
    const NOTES_ARR = Object.values(SCALE);

    // === SFX ===
    // All multi-note sequences are scheduled via AudioContext.currentTime offsets
    // (NOT setTimeout) so timing stays sample-accurate even on Silk under load.
    function perfectHit() {
        if (_playMP3('hit-perfect', 0.5)) return;
        // Bright, sparkly double chime
        _makeNoteAt(SCALE.E5, 0, 0.12, 'sine', sfxGain, 0.35);
        _makeNoteAt(SCALE.E5 * 2, 0, 0.08, 'sine', sfxGain, 0.15); // octave shimmer
        _makeNoteAt(SCALE.G5, 0.04, 0.1, 'sine', sfxGain, 0.3);
        _makeNoteAt(SCALE.G5 * 2, 0.04, 0.06, 'sine', sfxGain, 0.1);
    }

    function greatHit() {
        if (_playMP3('hit-good', 0.4)) return;
        // Clean single chime
        _makeNoteAt(SCALE.C5, 0, 0.1, 'sine', sfxGain, 0.3);
        _makeNoteAt(SCALE.E5, 0, 0.06, 'sine', sfxGain, 0.15);
    }

    function okHit() {
        // Soft muted tone
        _makeNoteAt(SCALE.G4, 0, 0.08, 'triangle', sfxGain, 0.2);
    }

    // Gentle neutral chime for misses — replaces harsh descending sound.
    // Pair with a rotating TTS encouragement (handled by Game.js via missEncouragement()).
    function miss() {
        if (!settings.sfx) return;
        // Soft two-tone neutral chime (no negativity)
        _makeNoteAt(SCALE.G4, 0, 0.12, 'sine', sfxGain, 0.18);
        _makeNoteAt(SCALE.C5, 0.06, 0.14, 'sine', sfxGain, 0.14);
    }

    // Rotating gentle encouragement phrases on miss. Uses CloudTTS so it works on Silk.
    const ENCOURAGE_PHRASES = [
        'Try again!',
        'You got this!',
        'Almost!',
        'Keep going!',
        'Nice try!',
        'You can do it!'
    ];
    let _encourageIdx = 0;
    function missEncouragement() {
        if (!settings.voice) return;
        const phrase = ENCOURAGE_PHRASES[_encourageIdx % ENCOURAGE_PHRASES.length];
        _encourageIdx++;
        try {
            if (typeof CloudTTS !== 'undefined' && CloudTTS.speak) {
                CloudTTS.speak(phrase, { volume: 0.7 });
            } else {
                speak(phrase);
            }
        } catch (e) {}
    }

    function comboBreak() {
        // Descending tone (informative, not harsh)
        _makeNoteAt(300, 0, 0.12, 'triangle', sfxGain, 0.15);
        _makeNoteAt(200, 0.06, 0.15, 'triangle', sfxGain, 0.12);
    }

    function comboMilestone() {
        if (_playMP3('combo', 0.5)) return;
        // Ascending power-up fanfare
        _makeNoteAt(SCALE.C5, 0, 0.06, 'square', sfxGain, 0.2);
        _makeNoteAt(SCALE.E5, 0.05, 0.06, 'square', sfxGain, 0.22);
        _makeNoteAt(SCALE.G5, 0.10, 0.08, 'square', sfxGain, 0.25);
        _makeNoteAt(SCALE.C5 * 2, 0.16, 0.12, 'sine', sfxGain, 0.3);
    }

    // Short ascending streak chime for 3-perfect streak (does NOT block notes).
    function streakChime3() {
        if (!settings.sfx) return;
        _makeNoteAt(SCALE.C5, 0, 0.06, 'sine', sfxGain, 0.22);
        _makeNoteAt(SCALE.E5, 0.05, 0.06, 'sine', sfxGain, 0.24);
        _makeNoteAt(SCALE.G5, 0.10, 0.08, 'sine', sfxGain, 0.26);
    }

    // 10+ streak fanfare — bigger, with harmony, still non-blocking.
    function streakFanfare() {
        if (!settings.sfx) return;
        const notes = [SCALE.C5, SCALE.E5, SCALE.G5, SCALE.C5 * 2];
        notes.forEach((f, i) => {
            _makeNoteAt(f, i * 0.06, 0.14, 'square', sfxGain, 0.22);
            _makeNoteAt(f * 1.5, i * 0.06, 0.10, 'sine', sfxGain, 0.10);
        });
        // Final shimmer
        _makeNoteAt(SCALE.E5 * 2, 0.28, 0.18, 'sine', sfxGain, 0.18);
        _makeNoteAt(SCALE.G5 * 2, 0.28, 0.18, 'sine', sfxGain, 0.14);
    }

    function countdown() {
        _makeNoteAt(SCALE.C4, 0, 0.15, 'square', sfxGain, 0.25);
    }

    function countdownGo() {
        _makeNoteAt(SCALE.C5, 0, 0.1, 'square', sfxGain, 0.3);
        _makeNoteAt(SCALE.E5, 0.08, 0.15, 'square', sfxGain, 0.35);
    }

    function songComplete() {
        // Triumphant ascending fanfare with harmony (sample-accurate)
        const fanfare = [SCALE.C5, SCALE.E5, SCALE.G5, SCALE.C5 * 2];
        fanfare.forEach((f, i) => {
            const t = i * 0.14;
            _makeNoteAt(f, t, 0.25, 'square', sfxGain, 0.25);
            _makeNoteAt(f * 1.5, t, 0.15, 'sine', sfxGain, 0.12); // harmony fifth
        });
        // Final chord
        _makeNoteAt(SCALE.C5, 0.6, 0.5, 'sine', sfxGain, 0.2);
        _makeNoteAt(SCALE.E5, 0.6, 0.5, 'sine', sfxGain, 0.15);
        _makeNoteAt(SCALE.G5, 0.6, 0.5, 'sine', sfxGain, 0.15);
    }

    // === BEAT MUSIC ENGINE ===
    let beatInterval = null;
    let beatIndex = 0;
    let currentSongMelody = [];
    let currentSongBass = [];
    let currentBPM = 120;
    let beatCallback = null;

    // Active pad oscillators (cleaned up on stop)
    let activePadOscs = [];

    function startSong(song, onBeat) {
        const c = _getCtx();
        currentSongMelody = song.melody || [];
        currentSongBass = song.bass || [];
        currentBPM = song.bpm;
        beatIndex = 0;
        beatCallback = onBeat;

        const beatDuration = 60 / song.bpm; // seconds per beat
        const songStartTime = c.currentTime;
        let lastScheduledBeat = -1;

        // Start pad layer (sustained chords underneath melody)
        if (settings.music) {
            _startPadLayer(song);
        }

        // Lookahead scheduler: checks every 25ms, schedules 100ms ahead
        // This prevents timing drift that setInterval causes
        beatInterval = setInterval(() => {
            const now = c.currentTime;
            const currentBeat = Math.floor((now - songStartTime) / beatDuration);

            // Schedule any beats that need to fire
            while (lastScheduledBeat < currentBeat) {
                lastScheduledBeat++;
                const bi = lastScheduledBeat;
                const beatTime = songStartTime + bi * beatDuration;

                if (settings.music) {
                    // Melody note -> melodyBus (with reverb send)
                    if (currentSongMelody.length > 0) {
                        const freq = currentSongMelody[bi % currentSongMelody.length];
                        if (freq > 0) {
                            _scheduleNote(freq, beatTime, beatDuration * 0.8, 'square', melodyBus, 0.15);
                        }
                    }

                    // Bass (every other beat) -> bassBus (dry, punchy)
                    if (bi % 2 === 0 && currentSongBass.length > 0) {
                        const bf = currentSongBass[Math.floor(bi / 2) % currentSongBass.length];
                        if (bf > 0) {
                            _scheduleNote(bf, beatTime, beatDuration * 0.6, 'triangle', bassBus, 0.2);
                        }
                    }

                    // Improved drums (layered samples) -> drumBus
                    _scheduleDrums(bi, beatTime, beatDuration);
                }

                // Fire visual beat callback
                if (beatCallback) beatCallback(bi);
            }

            beatIndex = currentBeat;
        }, 25); // 25ms lookahead interval (tight, drift-free)
    }

    // Layered kick: sub (sine sweep 180->50Hz body) + click (highpass noise transient).
    // Routes through drumBus (separate mix-bus) for clean mixing headroom.
    function _scheduleKick(time) {
        const c = ctx;
        if (!c || !drumBus) return;
        try {
            // SUB BODY — sine sweep
            const sub = c.createOscillator();
            const subEnv = c.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(180, time);
            sub.frequency.exponentialRampToValueAtTime(50, time + 0.08);
            subEnv.gain.setValueAtTime(0.35, time);
            subEnv.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            sub.connect(subEnv);
            subEnv.connect(drumBus);
            sub.start(time);
            sub.stop(time + 0.16);

            // CLICK — very short highpass noise transient (gives kick punch on small speakers)
            const clickSize = Math.floor(c.sampleRate * 0.012);
            const clickBuf = c.createBuffer(1, clickSize, c.sampleRate);
            const cd = clickBuf.getChannelData(0);
            for (let i = 0; i < clickSize; i++) cd[i] = (Math.random() * 2 - 1) * 0.5;
            const click = c.createBufferSource();
            click.buffer = clickBuf;
            const clickHp = c.createBiquadFilter();
            clickHp.type = 'highpass';
            clickHp.frequency.value = 1500;
            const clickEnv = c.createGain();
            clickEnv.gain.setValueAtTime(0.18, time);
            clickEnv.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
            click.connect(clickHp);
            clickHp.connect(clickEnv);
            clickEnv.connect(drumBus);
            click.start(time);
            click.stop(time + 0.02);
        } catch (e) {}
    }

    // Layered snare: body (sine pitch envelope) + crack (highpass noise).
    function _scheduleSnare(time) {
        const c = ctx;
        if (!c || !drumBus) return;
        try {
            // CRACK — noise burst
            const bufferSize = Math.floor(c.sampleRate * 0.08);
            const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.5;
            }
            const noise = c.createBufferSource();
            noise.buffer = buffer;
            const noiseFilter = c.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.value = 2000;
            const noiseEnv = c.createGain();
            noiseEnv.gain.setValueAtTime(0.22, time);
            noiseEnv.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseEnv);
            noiseEnv.connect(drumBus);
            noise.start(time);
            noise.stop(time + 0.1);

            // BODY — sine with quick pitch drop
            const osc = c.createOscillator();
            const env = c.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, time);
            osc.frequency.exponentialRampToValueAtTime(120, time + 0.05);
            env.gain.setValueAtTime(0.18, time);
            env.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
            osc.connect(env);
            env.connect(drumBus);
            osc.start(time);
            osc.stop(time + 0.12);
        } catch (e) {}
    }

    // Hi-hat: filtered noise, short and crispy (routes to drumBus).
    function _scheduleHiHat(time, open) {
        const c = ctx;
        if (!c || !drumBus) return;
        try {
            const dur = open ? 0.08 : 0.03;
            const bufferSize = Math.floor(c.sampleRate * dur);
            const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1);
            }
            const noise = c.createBufferSource();
            noise.buffer = buffer;
            const hpf = c.createBiquadFilter();
            hpf.type = 'highpass';
            hpf.frequency.value = 7000;
            const env = c.createGain();
            env.gain.setValueAtTime(open ? 0.06 : 0.04, time);
            env.gain.exponentialRampToValueAtTime(0.001, time + dur);
            noise.connect(hpf);
            hpf.connect(env);
            env.connect(drumBus);
            noise.start(time);
            noise.stop(time + dur + 0.01);
        } catch (e) {}
    }

    // Drum pattern scheduler
    function _scheduleDrums(beatIndex, beatTime, beatDuration) {
        const bib = beatIndex % 4;
        // Kick on 1 and 3
        if (bib === 0 || bib === 2) {
            _scheduleKick(beatTime);
        }
        // Snare on 2 and 4
        if (bib === 1 || bib === 3) {
            _scheduleSnare(beatTime);
        }
        // Hi-hat every beat, open on upbeats
        _scheduleHiHat(beatTime, bib === 1 || bib === 3);
        // Extra hi-hat on the "and" of each beat for groove
        _scheduleHiHat(beatTime + beatDuration * 0.5, false);
    }

    // Pad/harmony layer: sustained chords from the song's bass notes
    function _startPadLayer(song) {
        _stopPadLayer();
        const c = _getCtx();
        if (!song.bass || song.bass.length === 0) return;

        // Derive chord from first bass note (root, major third, fifth)
        const root = song.bass[0];
        const chordFreqs = [root, root * 1.25, root * 1.5]; // root, M3, P5

        chordFreqs.forEach(freq => {
            try {
                const osc = c.createOscillator();
                const env = c.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq * 2; // one octave up for warmth
                env.gain.setValueAtTime(0, c.currentTime);
                env.gain.linearRampToValueAtTime(1.0, c.currentTime + 2); // slow fade in
                osc.connect(env);
                env.connect(padBus);
                osc.start(c.currentTime);
                activePadOscs.push({ osc, env });
            } catch (e) {}
        });
    }

    function _stopPadLayer() {
        const c = ctx;
        if (!c) return;
        activePadOscs.forEach(({ osc, env }) => {
            try {
                env.gain.linearRampToValueAtTime(0, c.currentTime + 0.3);
                osc.stop(c.currentTime + 0.4);
            } catch (e) {}
        });
        activePadOscs = [];
    }

    // Schedule a note at a precise audio time (drift-free)
    function _scheduleNote(freq, time, duration, waveform, gainNode, vol) {
        const c = _getCtx();
        if (time < c.currentTime) return; // Skip if in the past
        try {
            const osc = c.createOscillator();
            const env = c.createGain();
            osc.type = waveform;
            osc.frequency.setValueAtTime(freq, time);
            env.gain.setValueAtTime(vol, time);
            env.gain.exponentialRampToValueAtTime(0.001, time + duration);
            osc.connect(env);
            env.connect(gainNode);
            osc.start(time);
            osc.stop(time + duration + 0.01);
        } catch (e) { /* ignore scheduling errors */ }
    }

    function stopSong() {
        if (beatInterval) {
            clearInterval(beatInterval);
            beatInterval = null;
        }
        _stopPadLayer();
        beatIndex = 0;
        beatCallback = null;
    }

    function getBeatIndex() { return beatIndex; }
    function getBPM() { return currentBPM; }

    // === TTS ===
    // Uses centralized _duckStart/_duckEnd so multiple voice lines stack via ref-count.
    function speak(text) {
        if (!settings.voice) return;
        try {
            _duckStart();
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 0.85;
            u.pitch = 1.1;
            let _ended = false;
            const _restoreMusic = () => {
                if (_ended) return;
                _ended = true;
                _duckEnd();
            };
            u.onend = _restoreMusic;
            u.onerror = _restoreMusic;
            // Fallback: restore music after 5s even if TTS hangs
            setTimeout(_restoreMusic, 5000);
            speechSynthesis.cancel();
            speechSynthesis.speak(u);
        } catch (e) {
            _duckEnd();
        }
    }

    // Public ducking API so CloudTTS (which uses a separate Web Audio path) can hook in.
    function duckStart() { _duckStart(); }
    function duckEnd() { _duckEnd(); }

    function setSettings(s) { Object.assign(settings, s); }

    return {
        unlock, _getCtx,
        perfectHit, greatHit, okHit, miss, missEncouragement,
        comboBreak, comboMilestone, streakChime3, streakFanfare,
        countdown, countdownGo, songComplete, speak,
        duckStart, duckEnd,
        startSong, stopSong, getBeatIndex, getBPM,
        setSettings, SCALE, NOTES_ARR
    };
})();
