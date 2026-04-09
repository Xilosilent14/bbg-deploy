// ===== AUDIO & TEXT-TO-SPEECH V4 =====
const Audio = {
    synth: window.speechSynthesis || null,
    _speaking: false,
    soundEnabled: true,

    // Audio context for generated sound effects
    _ctx: null,
    _getCtx() {
        if (!this._ctx) {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // V17: Resume suspended context (mobile browsers suspend after bg/fg)
        if (this._ctx.state === 'suspended') {
            this._ctx.resume().catch(() => {});
        }
        return this._ctx;
    },

    // V4: Music state
    _musicPlaying: null, // 'menu' | 'race' | null
    _musicNodes: [],
    _musicGain: null,

    // Text-to-speech with music ducking
    speak(text, options = {}) {
        if (!this.synth || !Settings.get('voice')) return Promise.resolve();

        return new Promise((resolve) => {
            this.synth.cancel();

            // Duck music volume while speaking
            this._duckMusic(true);

            // V17: Guard against double-resolve + timeout fallback
            let resolved = false;
            const done = () => {
                if (resolved) return;
                resolved = true;
                clearTimeout(timeout);
                this._duckMusic(false);
                resolve();
            };

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = options.rate || 0.9;
            utterance.pitch = options.pitch || 1.1;
            utterance.volume = options.volume || 1;
            utterance.onend = done;
            utterance.onerror = done;

            this.synth.speak(utterance);

            // V17: Timeout fallback if speech synthesis hangs (common on Android/Silk)
            const timeout = setTimeout(done, 10000);
        });
    },

    // Lower music volume during speech, restore after
    _duckMusic(duck) {
        if (!this._musicGain || !this._ctx) return;
        try {
            const target = duck ? 0.01 : (this._musicPlaying === 'race' ? 0.05 : 0.06);
            this._musicGain.gain.linearRampToValueAtTime(target, this._ctx.currentTime + 0.3);
        } catch (e) { /* ignore */ }
    },

    stopSpeaking() {
        if (this.synth) this.synth.cancel();
    },

    // Encouragement phrases
    encourageCorrect() {
        const phrases = [
            'Awesome!', 'Great job!', 'You got it!', 'Amazing!',
            'Super!', 'Wow!', 'Fantastic!', 'Way to go!',
            'Yes!', 'Incredible!', 'Right on!', 'Nailed it!',
            'Perfect!', 'Brilliant!', 'You rock!', 'Champion!',
            'Outstanding!', 'Smart cookie!', 'Superstar!',
            'Zooming ahead!', 'Speed racer!', 'Turbo brain!',
            'Lightning fast!', 'You are on fire!',
            'High five!', 'Woo hoo!', 'You did it!', 'So smart!',
            'Genius!', 'That was easy!', 'Boom!', 'Excellent!',
            'Gold star!', 'Brain power!', 'You are so smart!',
            'What a racer!', 'Unstoppable!', 'Keep it up!',
            'Nice one!', 'Big brain!', 'Crushing it!', 'Winner!'
        ];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.speak(phrase, { rate: 1.1, pitch: 1.3 });
        return phrase;
    },

    encourageWrong() {
        const phrases = [
            'Almost!', 'Good try!', 'Keep going!', 'You can do it!',
            'So close!', 'Try the next one!', 'No worries!',
            'Nice effort!', 'Almost there!', 'Keep racing!',
            'Don\'t give up!', 'You\'ll get it!', 'Next one is yours!',
            'That was tricky!', 'Great effort!', 'Learning is fun!',
            'You\'re getting closer!', 'Practice makes perfect!',
            'Let\'s try again!', 'That was a tough one!',
            'Mistakes help you learn!', 'Still racing!',
            'Keep your engine running!', 'You\'re still awesome!'
        ];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.speak(phrase, { rate: 1.0, pitch: 1.0 });
        return phrase;
    },

    // ---- V4: BACKGROUND MUSIC ----
    startMenuMusic() {
        if (!Settings.get('music') || this._musicPlaying === 'menu') return;
        this.stopMusic();
        this._musicPlaying = 'menu';
        this._playMenuLoop();
    },

    startRaceMusic() {
        if (!Settings.get('music') || this._musicPlaying === 'race') return;
        this.stopMusic();
        this._musicPlaying = 'race';
        this._playRaceLoop();
    },

    stopMusic() {
        this._musicPlaying = null;
        this._musicNodes.forEach(n => {
            try { n.stop(); } catch (e) { /* ignore */ }
            try { n.disconnect(); } catch (e) { /* ignore */ }
        });
        this._musicNodes = [];
        if (this._musicGain) {
            try { this._musicGain.disconnect(); } catch (e) { /* ignore */ }
            this._musicGain = null;
        }
    },

    _playMenuLoop() {
        if (this._musicPlaying !== 'menu') return;
        try {
            // Clean up finished nodes from previous loop iteration
            this._musicNodes = this._musicNodes.filter(n => {
                if (n._ended) { try { n.disconnect(); } catch (e) {} return false; }
                return true;
            });
            const ctx = this._getCtx();
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.connect(ctx.destination);
            this._musicGain = gain;

            const self = this;
            const makeOsc = (type, freq, start, dur, vol) => {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();
                osc.connect(noteGain);
                noteGain.connect(gain);
                osc.type = type;
                osc.frequency.setValueAtTime(freq, start);
                noteGain.gain.setValueAtTime(vol, start);
                noteGain.gain.exponentialRampToValueAtTime(0.01, start + dur * 0.9);
                osc.onended = () => { osc._ended = true; };
                osc.start(start);
                osc.stop(start + dur);
                self._musicNodes.push(osc);
            };

            // Gentle pentatonic melody: C D E G A pattern, 120bpm
            const notes = [262, 294, 330, 392, 440, 392, 330, 294, 262, 330, 392, 440, 523, 440, 392, 330];
            const beatLen = 0.35;
            const loopLen = notes.length * beatLen;

            notes.forEach((freq, i) => makeOsc('sine', freq, ctx.currentTime + i * beatLen, beatLen, 0.5));

            // Bass line
            const bassNotes = [131, 131, 196, 196, 220, 220, 196, 196, 131, 131, 165, 165, 196, 196, 131, 131];
            bassNotes.forEach((freq, i) => makeOsc('triangle', freq, ctx.currentTime + i * beatLen, beatLen, 0.3));

            // Schedule next loop
            setTimeout(() => {
                if (this._musicPlaying === 'menu') this._playMenuLoop();
            }, loopLen * 1000 - 50);
        } catch (e) { /* ignore */ }
    },

    _playRaceLoop() {
        if (this._musicPlaying !== 'race') return;
        try {
            // Clean up finished nodes from previous loop iteration
            this._musicNodes = this._musicNodes.filter(n => {
                try {
                    if (n._ended) { n.disconnect(); return false; }
                } catch (e) { return false; }
                return true;
            });
            const ctx = this._getCtx();
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.connect(ctx.destination);
            this._musicGain = gain;

            const self = this;
            const makeOsc = (type, freq, start, dur, vol) => {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();
                osc.connect(noteGain);
                noteGain.connect(gain);
                osc.type = type;
                osc.frequency.setValueAtTime(freq, start);
                noteGain.gain.setValueAtTime(vol, start);
                noteGain.gain.exponentialRampToValueAtTime(0.01, start + dur * 0.85);
                osc.onended = () => { osc._ended = true; };
                osc.start(start);
                osc.stop(start + dur);
                self._musicNodes.push(osc);
            };

            // Driving bass rhythm: faster, 150bpm
            const beatLen = 0.2;
            const bassPattern = [165, 0, 165, 196, 220, 0, 220, 196, 247, 0, 247, 220, 196, 0, 196, 165,
                                 165, 0, 165, 196, 220, 0, 220, 247, 262, 0, 247, 220, 196, 0, 165, 165];
            const loopLen = bassPattern.length * beatLen;

            bassPattern.forEach((freq, i) => { if (freq !== 0) makeOsc('sawtooth', freq, ctx.currentTime + i * beatLen, beatLen, 0.25); });

            // Melody over top (higher, thinner)
            const melody = [523, 0, 587, 0, 659, 0, 587, 523, 494, 0, 523, 0, 587, 0, 659, 784,
                           659, 0, 587, 0, 523, 0, 494, 440, 494, 0, 523, 0, 587, 0, 523, 0];
            melody.forEach((freq, i) => { if (freq !== 0) makeOsc('square', freq, ctx.currentTime + i * beatLen, beatLen, 0.08); });

            setTimeout(() => {
                if (this._musicPlaying === 'race') this._playRaceLoop();
            }, loopLen * 1000 - 50);
        } catch (e) { /* ignore */ }
    },

    // ---- V4: UI SOUND EFFECTS ----
    playClick() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.setValueAtTime(600, ctx.currentTime + 0.03);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) { /* ignore */ }
    },

    playPowerUp() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
                gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.06 + 0.15);
                osc.start(ctx.currentTime + i * 0.06);
                osc.stop(ctx.currentTime + i * 0.06 + 0.15);
            });
        } catch (e) { /* ignore */ }
    },

    playStarEarn() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1175, ctx.currentTime + 0.1);
            osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) { /* ignore */ }
    },

    playLaneChange() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.setValueAtTime(500, ctx.currentTime + 0.04);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) { /* ignore */ }
    },

    // ---- EXISTING SOUND EFFECTS (V4: Settings-aware, V14: Enhanced) ----
    playCorrect() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Rich chord: C5 → E5 → G5 with harmonics + sparkle
            const notes = [523, 659, 784];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc2.type = 'triangle';
                osc.frequency.setValueAtTime(freq, t + i * 0.08);
                osc2.frequency.setValueAtTime(freq * 2, t + i * 0.08);
                gain.gain.setValueAtTime(0.2, t + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 0.35);
                osc.start(t + i * 0.08);
                osc.stop(t + i * 0.08 + 0.35);
                osc2.start(t + i * 0.08);
                osc2.stop(t + i * 0.08 + 0.35);
            });
            // Sparkle top note
            const sparkle = ctx.createOscillator();
            const sGain = ctx.createGain();
            sparkle.connect(sGain);
            sGain.connect(ctx.destination);
            sparkle.type = 'sine';
            sparkle.frequency.setValueAtTime(1568, t + 0.2);
            sGain.gain.setValueAtTime(0.1, t + 0.2);
            sGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
            sparkle.start(t + 0.2);
            sparkle.stop(t + 0.5);
        } catch (e) { /* ignore */ }
    },

    playWrong() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Gentle "bwom bwom" — two descending tones with slight detuning
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(330, t);
            osc1.frequency.setValueAtTime(277, t + 0.15);
            osc2.frequency.setValueAtTime(335, t); // slight detune for warmth
            osc2.frequency.setValueAtTime(282, t + 0.15);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
            osc1.start(t);
            osc1.stop(t + 0.35);
            osc2.start(t);
            osc2.stop(t + 0.35);
        } catch (e) { /* ignore */ }
    },

    playNitro() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Sawtooth sweep (engine)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, t);
            osc.frequency.exponentialRampToValueAtTime(500, t + 0.3);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
            osc.start(t);
            osc.stop(t + 0.6);
            // Whoosh — filtered noise burst
            const bufferSize = ctx.sampleRate * 0.4;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
            }
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, t);
            filter.frequency.exponentialRampToValueAtTime(3000, t + 0.2);
            filter.Q.value = 1;
            const nGain = ctx.createGain();
            src.connect(filter);
            filter.connect(nGain);
            nGain.connect(ctx.destination);
            nGain.gain.setValueAtTime(0.15, t);
            nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
            src.start(t);
        } catch (e) { /* ignore */ }
    },

    // V14: Streak chime — plays at 3x, 5x, 8x streaks
    playStreakChime(streakCount) {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Quick ascending arpeggio — pitch rises with streak
            const baseFreq = 600 + Math.min(streakCount, 10) * 40;
            for (let i = 0; i < 3; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq + i * 200, t + i * 0.06);
                gain.gain.setValueAtTime(0.15, t + i * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.06 + 0.2);
                osc.start(t + i * 0.06);
                osc.stop(t + i * 0.06 + 0.2);
            }
        } catch (e) { /* ignore */ }
    },

    // V14: Crowd cheer — noise burst with filtered excitement
    playCrowdCheer() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Build excitement with pink-ish noise
            const bufferSize = ctx.sampleRate * 1.2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            // Ramp up then sustain then fade
            for (let i = 0; i < bufferSize; i++) {
                const pos = i / bufferSize;
                const envelope = pos < 0.2 ? pos / 0.2 : pos < 0.6 ? 1 : 1 - (pos - 0.6) / 0.4;
                data[i] = (Math.random() * 2 - 1) * envelope * 0.8;
            }
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 2000;
            filter.Q.value = 0.5;
            const gain = ctx.createGain();
            src.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.linearRampToValueAtTime(0.12, t + 0.3);
            gain.gain.linearRampToValueAtTime(0.01, t + 1.2);
            src.start(t);
            // Add pitched "wooo" on top
            const woo = ctx.createOscillator();
            const wGain = ctx.createGain();
            woo.connect(wGain);
            wGain.connect(ctx.destination);
            woo.type = 'sine';
            woo.frequency.setValueAtTime(500, t);
            woo.frequency.linearRampToValueAtTime(800, t + 0.4);
            woo.frequency.linearRampToValueAtTime(600, t + 1.0);
            wGain.gain.setValueAtTime(0.06, t);
            wGain.gain.linearRampToValueAtTime(0.08, t + 0.3);
            wGain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);
            woo.start(t);
            woo.stop(t + 1.2);
        } catch (e) { /* ignore */ }
    },

    playEngine() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) { /* ignore */ }
    },

    playVictory() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
                gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4);
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + i * 0.15 + 0.4);
            });
        } catch (e) { /* ignore */ }
    },

    playLevelUp() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            // Ascending fanfare: C5 → E5 → G5 → C6 with harmonics
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime + i * 0.12);
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
                gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.5);
                osc.start(ctx.currentTime + i * 0.12);
                osc.stop(ctx.currentTime + i * 0.12 + 0.5);
                osc2.start(ctx.currentTime + i * 0.12);
                osc2.stop(ctx.currentTime + i * 0.12 + 0.5);
            });
            // Final sustained chord
            const chord = [1047, 1319, 1568];
            chord.forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + 0.48);
                gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.48);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
                osc.start(ctx.currentTime + 0.48);
                osc.stop(ctx.currentTime + 1.2);
            });
        } catch (e) { /* ignore */ }
    },

    playBoom() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            // White noise burst for firework explosion
            const bufferSize = ctx.sampleRate * 0.3;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const gain = ctx.createGain();
            source.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            source.start(ctx.currentTime);
            // Low rumble
            const osc = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc.connect(g2);
            g2.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(60, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.4);
            g2.gain.setValueAtTime(0.2, ctx.currentTime);
            g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) { /* ignore */ }
    },

    playCountdown() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) { /* ignore */ }
    },

    // V5.5: Obstacle hit — short crunchy impact
    playHit() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const bufferSize = ctx.sampleRate * 0.12;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const gain = ctx.createGain();
            source.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
            source.start(ctx.currentTime);
            // Low thud
            const osc = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc.connect(g2);
            g2.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
            g2.gain.setValueAtTime(0.2, ctx.currentTime);
            g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) { /* ignore */ }
    },

    playRevving(count) {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            const baseFreq = 60 + (4 - count) * 30;
            osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) { /* ignore */ }
    },

    playFanfare() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const notes = [392, 523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
                gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.5);
                osc.start(ctx.currentTime + i * 0.12);
                osc.stop(ctx.currentTime + i * 0.12 + 0.5);
            });
        } catch (e) { /* ignore */ }
    },

    // V5.8: Achievement unlock — triumphant chime with sparkle
    playAchievement() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            // Rising sparkle arpeggio
            const notes = [659, 784, 1047, 1319, 1568];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
                gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.3);
                osc.start(ctx.currentTime + i * 0.08);
                osc.stop(ctx.currentTime + i * 0.08 + 0.3);
            });
            // Shimmer overtone
            const shimmer = ctx.createOscillator();
            const sGain = ctx.createGain();
            shimmer.connect(sGain);
            sGain.connect(ctx.destination);
            shimmer.type = 'triangle';
            shimmer.frequency.setValueAtTime(2093, ctx.currentTime + 0.3);
            sGain.gain.setValueAtTime(0.1, ctx.currentTime + 0.3);
            sGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
            shimmer.start(ctx.currentTime + 0.3);
            shimmer.stop(ctx.currentTime + 0.8);
        } catch (e) { /* ignore */ }
    },

    // V5.8: Timeout warning — gentle ticking alert
    playTimeWarning() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            for (let i = 0; i < 3; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime + i * 0.25);
                gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.25);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.25 + 0.1);
                osc.start(ctx.currentTime + i * 0.25);
                osc.stop(ctx.currentTime + i * 0.25 + 0.1);
            }
        } catch (e) { /* ignore */ }
    },

    // V5.8: Checkpoint / question gate reached
    playCheckpoint() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.setValueAtTime(800, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) { /* ignore */ }
    },

    // V5.8: Purchase / equip sound
    playPurchase() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            // Coin-like ding
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.setValueAtTime(1600, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.25);
            // Subtle harmonic
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.connect(g2);
            g2.connect(ctx.destination);
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(2400, ctx.currentTime + 0.05);
            g2.gain.setValueAtTime(0.08, ctx.currentTime + 0.05);
            g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc2.start(ctx.currentTime + 0.05);
            osc2.stop(ctx.currentTime + 0.3);
        } catch (e) { /* ignore */ }
    },

    // V5.8: Break suggestion chime — gentle wind-down
    playBreakChime() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const notes = [523, 440, 392, 330];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
                gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.2);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.4);
                osc.start(ctx.currentTime + i * 0.2);
                osc.stop(ctx.currentTime + i * 0.2 + 0.4);
            });
        } catch (e) { /* ignore */ }
    },

    // V9: Weather ambient sounds
    _ambientNodes: [],
    _ambientGain: null,

    startWeatherAmbient(weather) {
        this.stopWeatherAmbient();
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.03, ctx.currentTime);
            gain.connect(ctx.destination);
            this._ambientGain = gain;

            if (weather === 'rain') {
                // Brown noise for rain
                const bufferSize = ctx.sampleRate * 2;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                let last = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    data[i] = (last + 0.02 * white) / 1.02;
                    last = data[i];
                    data[i] *= 3.5;
                }
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.loop = true;
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 800;
                source.connect(filter);
                filter.connect(gain);
                source.start();
                this._ambientNodes.push(source);
            } else if (weather === 'sunset') {
                // Desert wind — filtered white noise
                const bufferSize = ctx.sampleRate * 2;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * 0.5;
                }
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.loop = true;
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 400;
                filter.Q.value = 0.5;
                source.connect(filter);
                filter.connect(gain);
                gain.gain.setValueAtTime(0.02, ctx.currentTime);
                source.start();
                this._ambientNodes.push(source);
            } else if (weather === 'neon') {
                // Electronic hum
                const osc = ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(60, ctx.currentTime);
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 120;
                osc.connect(filter);
                filter.connect(gain);
                gain.gain.setValueAtTime(0.015, ctx.currentTime);
                osc.start();
                this._ambientNodes.push(osc);
            }
        } catch (e) { /* ignore */ }
    },

    stopWeatherAmbient() {
        this._ambientNodes.forEach(n => {
            try { n.stop(); } catch (e) {}
            try { n.disconnect(); } catch (e) {}
        });
        this._ambientNodes = [];
        if (this._ambientGain) {
            try { this._ambientGain.disconnect(); } catch (e) {}
            this._ambientGain = null;
        }
    },

    // Resume audio context (needed after user interaction on mobile)
    resume() {
        if (this._ctx && this._ctx.state === 'suspended') {
            this._ctx.resume();
        }
    }
};
