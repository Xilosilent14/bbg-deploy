/* ============================================
   RHYTHM BLAST — Audio Engine
   Web Audio API synthesized music + SFX + beat scheduling
   Following OTB audio patterns from ThinkFast
   ============================================ */
const Audio = (() => {
    let ctx = null;
    let masterGain = null;
    let compressor = null;
    let musicGain = null;
    let sfxGain = null;
    let reverbGain = null;
    let reverbDry = null;
    let padGain = null;
    let unlocked = false;
    let settings = { sfx: true, music: true, voice: true };

    // Safe gain levels for children's hearing
    const MASTER_VOL = 0.7;
    const MUSIC_VOL = 0.3;
    const SFX_VOL = 0.5;
    const REVERB_WET = 0.15;
    const PAD_VOL = 0.08;

    function _getCtx() {
        if (!ctx) {
            try {
                ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return null; // SES or browser restriction — audio degrades gracefully
            }

            // Master compressor for even volume
            compressor = ctx.createDynamicsCompressor();
            compressor.threshold.value = -24;
            compressor.knee.value = 12;
            compressor.ratio.value = 4;
            compressor.attack.value = 0.003;
            compressor.release.value = 0.15;
            compressor.connect(ctx.destination);

            masterGain = ctx.createGain();
            masterGain.gain.value = MASTER_VOL;
            masterGain.connect(compressor);

            // Reverb send (feedback delay network)
            reverbGain = ctx.createGain();
            reverbGain.gain.value = REVERB_WET;
            reverbDry = ctx.createGain();
            reverbDry.gain.value = 1.0;
            _setupReverb();

            musicGain = ctx.createGain();
            musicGain.gain.value = MUSIC_VOL;
            musicGain.connect(reverbDry);
            musicGain.connect(reverbGain);

            // Pad layer gain
            padGain = ctx.createGain();
            padGain.gain.value = PAD_VOL;
            padGain.connect(reverbDry);
            padGain.connect(reverbGain);

            sfxGain = ctx.createGain();
            sfxGain.gain.value = SFX_VOL;
            sfxGain.connect(masterGain);
        }
        return ctx;
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

    // C major pentatonic scale frequencies
    const SCALE = {
        C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
        C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00
    };
    const NOTES_ARR = Object.values(SCALE);

    // === SFX ===
    function perfectHit() {
        if (_playMP3('hit-perfect', 0.5)) return;
        // Bright, sparkly double chime
        _makeNote(SCALE.E5, 0.12, 'sine', sfxGain, 0.35);
        _makeNote(SCALE.E5 * 2, 0.08, 'sine', sfxGain, 0.15); // octave shimmer
        setTimeout(() => {
            _makeNote(SCALE.G5, 0.1, 'sine', sfxGain, 0.3);
            _makeNote(SCALE.G5 * 2, 0.06, 'sine', sfxGain, 0.1);
        }, 40);
    }

    function greatHit() {
        if (_playMP3('hit-good', 0.4)) return;
        // Clean single chime
        _makeNote(SCALE.C5, 0.1, 'sine', sfxGain, 0.3);
        _makeNote(SCALE.E5, 0.06, 'sine', sfxGain, 0.15);
    }

    function okHit() {
        // Soft muted tone
        _makeNote(SCALE.G4, 0.08, 'triangle', sfxGain, 0.2);
    }

    function miss() {
        if (_playMP3('hit-miss', 0.4)) return;
        // Gentle low thud (not punishing for a 6yo)
        _makeNote(160, 0.1, 'triangle', sfxGain, 0.12);
    }

    function comboBreak() {
        // Descending tone (informative, not harsh)
        _makeNote(300, 0.12, 'triangle', sfxGain, 0.15);
        setTimeout(() => _makeNote(200, 0.15, 'triangle', sfxGain, 0.12), 60);
    }

    function comboMilestone() {
        if (_playMP3('combo', 0.5)) return;
        // Ascending power-up fanfare
        _makeNote(SCALE.C5, 0.06, 'square', sfxGain, 0.2);
        setTimeout(() => _makeNote(SCALE.E5, 0.06, 'square', sfxGain, 0.22), 50);
        setTimeout(() => _makeNote(SCALE.G5, 0.08, 'square', sfxGain, 0.25), 100);
        setTimeout(() => _makeNote(SCALE.C5 * 2, 0.12, 'sine', sfxGain, 0.3), 160);
    }

    function countdown() {
        _makeNote(SCALE.C4, 0.15, 'square', sfxGain, 0.25);
    }

    function countdownGo() {
        _makeNote(SCALE.C5, 0.1, 'square', sfxGain, 0.3);
        setTimeout(() => _makeNote(SCALE.E5, 0.15, 'square', sfxGain, 0.35), 80);
    }

    function songComplete() {
        // Triumphant ascending fanfare with harmony
        const fanfare = [SCALE.C5, SCALE.E5, SCALE.G5, SCALE.C5 * 2];
        fanfare.forEach((f, i) => {
            setTimeout(() => {
                _makeNote(f, 0.25, 'square', sfxGain, 0.25);
                _makeNote(f * 1.5, 0.15, 'sine', sfxGain, 0.12); // harmony fifth
            }, i * 140);
        });
        // Final chord
        setTimeout(() => {
            _makeNote(SCALE.C5, 0.5, 'sine', sfxGain, 0.2);
            _makeNote(SCALE.E5, 0.5, 'sine', sfxGain, 0.15);
            _makeNote(SCALE.G5, 0.5, 'sine', sfxGain, 0.15);
        }, 600);
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
                    // Melody note
                    if (currentSongMelody.length > 0) {
                        const freq = currentSongMelody[bi % currentSongMelody.length];
                        if (freq > 0) {
                            _scheduleNote(freq, beatTime, beatDuration * 0.8, 'square', musicGain, 0.15);
                        }
                    }

                    // Bass (every other beat)
                    if (bi % 2 === 0 && currentSongBass.length > 0) {
                        const bf = currentSongBass[Math.floor(bi / 2) % currentSongBass.length];
                        if (bf > 0) {
                            _scheduleNote(bf, beatTime, beatDuration * 0.6, 'triangle', musicGain, 0.2);
                        }
                    }

                    // Improved drums
                    _scheduleDrums(bi, beatTime, beatDuration);
                }

                // Fire visual beat callback
                if (beatCallback) beatCallback(bi);
            }

            beatIndex = currentBeat;
        }, 25); // 25ms lookahead interval (tight, drift-free)
    }

    // Punchy kick: sine sweep from 180Hz down to 50Hz
    function _scheduleKick(time) {
        const c = ctx;
        try {
            const osc = c.createOscillator();
            const env = c.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(180, time);
            osc.frequency.exponentialRampToValueAtTime(50, time + 0.08);
            env.gain.setValueAtTime(0.35, time);
            env.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            osc.connect(env);
            env.connect(musicGain);
            osc.start(time);
            osc.stop(time + 0.16);
        } catch (e) {}
    }

    // Snare: noise burst + sine body
    function _scheduleSnare(time) {
        const c = ctx;
        try {
            // Noise burst (using high-freq oscillator trick)
            const bufferSize = c.sampleRate * 0.08;
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
            noiseEnv.gain.setValueAtTime(0.2, time);
            noiseEnv.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseEnv);
            noiseEnv.connect(musicGain);
            noise.start(time);
            noise.stop(time + 0.1);

            // Sine body
            const osc = c.createOscillator();
            const env = c.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, time);
            osc.frequency.exponentialRampToValueAtTime(120, time + 0.05);
            env.gain.setValueAtTime(0.18, time);
            env.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
            osc.connect(env);
            env.connect(musicGain);
            osc.start(time);
            osc.stop(time + 0.12);
        } catch (e) {}
    }

    // Hi-hat: filtered noise, short and crispy
    function _scheduleHiHat(time, open) {
        const c = ctx;
        try {
            const dur = open ? 0.08 : 0.03;
            const bufferSize = c.sampleRate * dur;
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
            env.connect(musicGain);
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
                env.connect(padGain);
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
    function speak(text) {
        if (!settings.voice) return;
        try {
            // Duck music while speaking
            if (musicGain) {
                musicGain.gain.linearRampToValueAtTime(0.1, _getCtx().currentTime + 0.3);
            }
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 0.85;
            u.pitch = 1.1;
            const _restoreMusic = () => {
                if (musicGain) {
                    musicGain.gain.linearRampToValueAtTime(MUSIC_VOL, _getCtx().currentTime + 0.3);
                }
            };
            u.onend = _restoreMusic;
            u.onerror = _restoreMusic;
            // Fallback: restore music after 5s even if TTS hangs
            setTimeout(_restoreMusic, 5000);
            speechSynthesis.cancel();
            speechSynthesis.speak(u);
        } catch (e) {
            // Restore music if TTS fails
            if (musicGain) {
                musicGain.gain.linearRampToValueAtTime(MUSIC_VOL, _getCtx().currentTime + 0.3);
            }
        }
    }

    function setSettings(s) { Object.assign(settings, s); }

    return {
        unlock, _getCtx,
        perfectHit, greatHit, okHit, miss, comboBreak, comboMilestone,
        countdown, countdownGo, songComplete, speak,
        startSong, stopSong, getBeatIndex, getBPM,
        setSettings, SCALE, NOTES_ARR
    };
})();
