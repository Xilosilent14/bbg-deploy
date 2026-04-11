// ===== AUDIO & TEXT-TO-SPEECH V4 =====
const Audio = {
    synth: window.speechSynthesis || null,
    _speaking: false,
    _preferredVoice: null,
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

    // V38: MP3 sound effect cache (loaded on first user gesture)
    _mp3Cache: {},
    _mp3Loaded: false,
    _loadMP3Assets() {
        if (this._mp3Loaded) return;
        this._mp3Loaded = true;
        const ctx = this._getCtx();
        const manifest = [
            { key: 'click', src: 'assets/sounds/sfx/click.mp3' },
            { key: 'correct', src: 'assets/sounds/sfx/correct.mp3' },
            { key: 'wrong', src: 'assets/sounds/sfx/wrong.mp3' },
            { key: 'nitro', src: 'assets/sounds/sfx/nitro.mp3' },
            { key: 'star', src: 'assets/sounds/sfx/star.mp3' },
            { key: 'victory', src: 'assets/sounds/sfx/victory.mp3' },
            { key: 'levelup', src: 'assets/sounds/sfx/levelup.mp3' },
            { key: 'achievement', src: 'assets/sounds/sfx/achievement.mp3' },
            { key: 'countdown', src: 'assets/sounds/sfx/countdown.mp3' },
            { key: 'countdown-go', src: 'assets/sounds/sfx/countdown-go.mp3' },
            { key: 'streak', src: 'assets/sounds/sfx/streak.mp3' },
            { key: 'purchase', src: 'assets/sounds/sfx/purchase.mp3' },
            { key: 'coin', src: 'assets/sounds/sfx/coin.mp3' },
            { key: 'lane-change', src: 'assets/sounds/sfx/lane-change.mp3' },
            { key: 'transition', src: 'assets/sounds/sfx/transition.mp3' }
        ];
        manifest.forEach(({ key, src }) => {
            fetch(src)
                .then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
                .then(buf => ctx.decodeAudioData(buf))
                .then(decoded => { this._mp3Cache[key] = decoded; })
                .catch(() => { /* silent fail — synth fallback remains */ });
        });
    },
    // Play an MP3 buffer through the existing gain graph. Returns true if played, false if not loaded.
    _playMP3(key, volume = 0.5) {
        const buf = this._mp3Cache[key];
        if (!buf) return false;
        if (!Settings.get('sound')) return true; // muted but "handled"
        const ctx = this._getCtx();
        const source = ctx.createBufferSource();
        source.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
        return true;
    },

    // V39: Pre-generated TTS cache (Google Cloud Neural voices)
    // Loaded on-demand per word/phrase, much higher quality than browser TTS
    _ttsCache: {},
    _ttsPending: new Set(),
    _playTTS(key, subdir = 'words', volume = 0.8) {
        const cacheKey = subdir + '/' + key;
        const buf = this._ttsCache[cacheKey];
        if (buf) {
            if (!Settings.get('voice')) return true;
            const ctx = this._getCtx();
            const source = ctx.createBufferSource();
            source.buffer = buf;
            const gain = ctx.createGain();
            gain.gain.value = volume;
            source.connect(gain);
            gain.connect(ctx.destination);
            source.start(0);
            return true;
        }
        // Try to load on-demand (for next time)
        if (!this._ttsPending.has(cacheKey)) {
            this._ttsPending.add(cacheKey);
            const src = `assets/sounds/tts/${subdir}/${key}.mp3`;
            const ctx = this._getCtx();
            fetch(src)
                .then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
                .then(b => ctx.decodeAudioData(b))
                .then(decoded => { this._ttsCache[cacheKey] = decoded; })
                .catch(() => {});
        }
        return false;
    },

    // V4: Music state
    _musicPlaying: null, // 'menu' | 'race' | 'boss' | 'results' | 'garage' | null
    _musicNodes: [],
    _musicGain: null,

    // V29/V37: Pick a warm female English voice (midwestern mom feel)
    // V37: Added Fire tablet / Android Silk voice support
    _pickVoice() {
        if (this._preferredVoice) return this._preferredVoice;
        if (!this.synth || !this.synth.getVoices) return null;
        const voices = this.synth.getVoices();
        if (!voices.length) return null;

        // English voices only
        const en = voices.filter(v => /^en[-_]/i.test(v.lang));

        // Preferred female voices ranked by warmth/naturalness
        // V37: Added Android/Fire tablet voices (en-us-x-sfg = female, tpd = female)
        const preferred = [
            'samantha',                 // macOS/iOS — warm, natural female
            'microsoft zira',           // Windows — friendly female US English
            'google us english',        // Chrome — clear female
            'microsoft aria',           // Windows 11 — natural female
            'microsoft jenny',          // Windows 11 neural — warm female
            'en-us-x-sfg-local',        // Android/Fire — female US English (high quality)
            'en-us-x-tpd-local',        // Android/Fire — female US English (alt)
            'en-us-x-sfg-network',      // Android/Fire — female US English (network)
            'en-us-x-tpd-network',      // Android/Fire — female US English (network alt)
            'english united states',    // Android/Silk generic — often the default female
            'karen',                    // macOS — Australian but warm female
            'fiona',                    // macOS — British female
            'tessa',                    // macOS — South African female
        ];

        for (const pref of preferred) {
            const match = en.find(v => v.name.toLowerCase().includes(pref));
            if (match) { this._preferredVoice = match; return match; }
        }

        // Fallback: any female-sounding English voice (heuristic — higher default pitch)
        // Voices with "female" in the name
        const female = en.find(v => /female/i.test(v.name));
        if (female) { this._preferredVoice = female; return female; }

        // V37: On Android/Fire, prefer local voices over network (lower latency)
        const localEn = en.find(v => v.localService);
        if (localEn) { this._preferredVoice = localEn; return localEn; }

        // Last resort: first English voice available
        if (en.length) { this._preferredVoice = en[0]; return en[0]; }
        return null;
    },

    // ===== V35: PROSODY ENGINE — Humanize TTS narrator =====

    // Named voice personality profiles
    // V37: Reduced pitch by ~0.05 across profiles for more natural sound on Fire/Silk
    VOICE_PROFILES: {
        question: { rate: 0.88, pitch: 1.05 },   // clear, patient, teacher-like
        excited:  { rate: 1.05, pitch: 1.2 },    // celebratory, not shrill
        gentle:   { rate: 0.92, pitch: 1.0 },    // comforting for wrong answers
        explain:  { rate: 0.82, pitch: 0.95 },   // slower, clearer for explanations
        neutral:  { rate: 0.9,  pitch: 1.05 }    // default
    },

    // Warm lead-in phrases (~30% chance, question context only)
    _LEAD_INS: [
        'Okay, ', 'Let\'s see, ', 'Here\'s one, ', 'Alright, ',
        'How about this, ', 'Try this one, ', 'Ready? ',
        'Here we go, ', 'Next up, '
    ],

    // Master humanization pipeline: adjusts text, rate, pitch based on content + context
    _humanize(text, options) {
        const context = options.context || null;

        // 1) Start with profile or explicit values or defaults
        const profile = context && this.VOICE_PROFILES[context]
            ? this.VOICE_PROFILES[context]
            : this.VOICE_PROFILES.neutral;
        let rate = options.rate || profile.rate;
        let pitch = options.pitch || profile.pitch;

        // 2) Content-based adjustments (only if no explicit rate/pitch passed)
        if (!options.rate && !options.pitch) {
            const trimmed = text.trim();
            const wordCount = trimmed.split(/\s+/).length;

            if (trimmed.endsWith('?')) {
                // Questions: slight uptick in pitch, slow down for clarity
                pitch += 0.12;
                rate -= 0.04;
            } else if (trimmed.endsWith('!')) {
                // Exclamations: energetic
                pitch += 0.08;
                rate += 0.08;
            }

            if (wordCount <= 4) {
                // Short phrases: punchier
                rate += 0.1;
                pitch += 0.08;
            } else if (wordCount > 12) {
                // Long sentences: slow for clarity
                rate -= 0.06;
            }

            // Numbers/math: slow for processing
            if (/\d/.test(trimmed) && context !== 'excited') {
                rate -= 0.05;
            }
        }

        // 3) Add micro-variation (random jitter)
        const result = this._addMicroVariation(rate, pitch);

        // 4) Preprocess text for natural pauses
        let processedText = this._preprocessText(text);

        // 5) Maybe add warm lead-in (question context, 30% chance)
        processedText = this._maybeAddLeadIn(processedText, context);

        // Clamp to safe ranges
        result.rate = Math.max(0.6, Math.min(1.3, result.rate));
        result.pitch = Math.max(0.8, Math.min(1.5, result.pitch));

        return { text: processedText, rate: result.rate, pitch: result.pitch };
    },

    // Small random jitter so no two utterances sound identical
    _addMicroVariation(rate, pitch) {
        const rateJitter = (Math.random() - 0.5) * 0.08;   // ±0.04
        const pitchJitter = (Math.random() - 0.5) * 0.10;   // ±0.05
        return {
            rate: rate + rateJitter,
            pitch: pitch + pitchJitter
        };
    },

    // Insert natural pause markers via ellipses
    _preprocessText(text) {
        let t = text;
        // Longer pause between sentences (period followed by space)
        t = t.replace(/\.\s+/g, '... ');
        // Light comma pauses
        t = t.replace(/,\s+/g, ', ... ');
        // Line breaks become pauses
        t = t.replace(/\n/g, ' ... ');
        return t;
    },

    // Occasionally prepend a warm phrase before question reads
    _maybeAddLeadIn(text, context) {
        if (context !== 'question') return text;
        if (Math.random() > 0.3) return text; // 70% of the time, no lead-in
        const leadIn = this._LEAD_INS[Math.floor(Math.random() * this._LEAD_INS.length)];
        return leadIn + text;
    },

    // Text-to-speech with music ducking
    speak(text, options = {}) {
        if (!Settings.get('voice')) return Promise.resolve();

        // V36 fix: Guard against empty text (can hang some browsers)
        if (!text || !text.trim()) return Promise.resolve();

        // V42: Use Google Cloud TTS (works on Silk tablets)
        if (typeof CloudTTS !== 'undefined') {
            this._duckMusic(true);
            return CloudTTS.speakFemale(text, {
                onEnd: () => this._duckMusic(false)
            });
        }

        // Legacy: Try pre-generated TTS then speechSynthesis
        const trimmed = text.trim();

        // Single word: sight word or nonsense word
        const singleWord = trimmed.split(/\s+/).length === 1 && /^[a-zA-Z]+$/.test(trimmed);
        if (singleWord) {
            const key = trimmed.toLowerCase();
            if (this._playTTS(key, 'words', 0.8) || this._playTTS(key, 'nonsense', 0.8)) {
                return Promise.resolve();
            }
        }

        // Full question sentence: convert to filename and check questions/reading, questions/math
        const qKey = trimmed.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, '-').substring(0, 60);
        if (qKey.length > 5) {
            if (this._playTTS(qKey, 'questions/reading', 0.8) ||
                this._playTTS(qKey, 'questions/math', 0.8) ||
                this._playTTS(qKey, 'feedback', 0.8)) {
                return Promise.resolve();
            }
        }

        if (!this.synth) return Promise.resolve();

        // V36 fix: Increment speak generation so stale retries are invalidated
        this._speakGen = (this._speakGen || 0) + 1;
        const gen = this._speakGen;

        return new Promise((resolve) => {
            this.synth.cancel();

            // V21: Resume AudioContext if suspended (mobile browsers suspend in background)
            this.resume();

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

            // V35: Run text through prosody humanization pipeline
            const prosody = this._humanize(text, options);

            const utterance = new SpeechSynthesisUtterance(prosody.text);
            const voice = this._pickVoice();
            if (voice) utterance.voice = voice;
            utterance.rate = prosody.rate;
            utterance.pitch = prosody.pitch;
            utterance.volume = options.volume || 1;
            utterance.onend = done;
            utterance.onerror = done;

            this.synth.speak(utterance);

            // V21/V37: Chrome/Android bug — speechSynthesis.speaking can be false right after speak()
            // V37: Escalating retry: 200ms (re-speak), 600ms (cancel+re-speak), 1200ms (rebuild utterance)
            const retryDelays = [200, 600, 1200];
            const retryTimers = retryDelays.map((delay, i) => setTimeout(() => {
                if (resolved || gen !== this._speakGen) return;
                if (this.synth && !this.synth.speaking && !this.synth.pending) {
                    try {
                        if (i >= 1) {
                            // More aggressive: cancel first, then re-speak
                            this.synth.cancel();
                        }
                        if (i >= 2) {
                            // Last resort: rebuild utterance with fresh voice selection
                            this._preferredVoice = null;
                            const freshVoice = this._pickVoice();
                            const retry = new SpeechSynthesisUtterance(prosody.text);
                            if (freshVoice) retry.voice = freshVoice;
                            retry.rate = prosody.rate;
                            retry.pitch = prosody.pitch;
                            retry.volume = options.volume || 1;
                            retry.onend = done;
                            retry.onerror = done;
                            this.synth.speak(retry);
                        } else {
                            this.synth.speak(utterance);
                        }
                    } catch (e) { /* ignore */ }
                }
            }, delay));

            // V17: Timeout fallback if speech synthesis hangs (common on Android/Silk)
            const timeout = setTimeout(() => {
                retryTimers.forEach(t => clearTimeout(t));
                done();
            }, 10000);
        });
    },

    // Lower music volume during speech, restore after
    _duckMusic(duck) {
        if (!this._musicGain || !this._ctx) return;
        try {
            const vols = { race: 0.05, boss: 0.06, menu: 0.06, results: 0.05, garage: 0.06 };
            const target = duck ? 0.01 : (vols[this._musicPlaying] || 0.06);
            const now = this._ctx.currentTime;
            // V36 fix: Anchor current value before ramping (linearRamp needs a start point)
            this._musicGain.gain.cancelScheduledValues(now);
            this._musicGain.gain.setValueAtTime(this._musicGain.gain.value, now);
            this._musicGain.gain.linearRampToValueAtTime(target, now + 0.3);
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
        // V35: Use 'excited' voice profile for celebratory feel
        this.speak(phrase, { context: 'excited' });
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
        // V35: Use 'gentle' voice profile for comforting tone
        this.speak(phrase, { context: 'gentle' });
        return phrase;
    },

    // V41: MP3 background music (replaces synth for menu)
    _bgmAudio: null,
    _startBGM(src, volume) {
        this._stopBGM();
        this._bgmAudio = document.createElement('audio');
        this._bgmAudio.src = src;
        this._bgmAudio.loop = true;
        this._bgmAudio.volume = volume || 0.15;
        this._bgmAudio.play().catch(() => {});
    },
    _stopBGM() {
        if (this._bgmAudio) { this._bgmAudio.pause(); this._bgmAudio.currentTime = 0; this._bgmAudio = null; }
    },

    // ---- BACKGROUND MUSIC ----
    startMenuMusic() {
        if (!Settings.get('music') || this._musicPlaying === 'menu') return;
        this.stopMusic();
        this._musicPlaying = 'menu';
        this._startBGM('assets/sounds/music/bgm-race.mp3', 0.15);
    },

    startRaceMusic() {
        if (!Settings.get('music') || this._musicPlaying === 'race') return;
        this.stopMusic();
        this._musicPlaying = 'race';
        this._playRaceLoop();
    },

    startBossMusic() {
        if (!Settings.get('music') || this._musicPlaying === 'boss') return;
        this.stopMusic();
        this._musicPlaying = 'boss';
        this._playBossLoop();
    },

    startResultsMusic() {
        if (!Settings.get('music') || this._musicPlaying === 'results') return;
        this.stopMusic();
        this._musicPlaying = 'results';
        this._playResultsLoop();
    },

    startGarageMusic() {
        if (!Settings.get('music') || this._musicPlaying === 'garage') return;
        this.stopMusic();
        this._musicPlaying = 'garage';
        this._playGarageLoop();
    },

    stopMusic() {
        this._musicPlaying = null;
        this._stopBGM();
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

    // V33: Melody variant arrays for variety across loops
    _menuMelodies: [
        // Variant A (original) — D major heroic adventure
        [294, 370, 440, 587, 494, 392, 440, 370, 330, 392, 494, 587, 440, 370, 330, 294,
         587, 440, 740, 587, 659, 587, 494, 440, 392, 494, 587, 740, 659, 587, 440, 294],
        // Variant B — starts on E, more stepwise, gentle
        [330, 370, 440, 494, 440, 392, 370, 330, 294, 370, 440, 587, 494, 440, 370, 294,
         494, 440, 587, 494, 440, 370, 330, 294, 370, 440, 494, 587, 494, 440, 370, 294],
        // Variant C — wider leaps, more dramatic
        [294, 440, 587, 740, 587, 440, 370, 294, 370, 494, 587, 740, 587, 494, 370, 294,
         587, 370, 740, 587, 494, 440, 370, 330, 440, 587, 740, 880, 740, 587, 440, 294]
    ],
    _raceMelodies: [
        // Variant A (original)
        [523, 0, 587, 0, 659, 0, 587, 523, 494, 0, 523, 0, 587, 0, 659, 784,
         659, 0, 587, 0, 523, 0, 494, 440, 494, 0, 523, 0, 587, 0, 523, 0],
        // Variant B — starts lower, builds up
        [440, 0, 494, 0, 523, 0, 587, 523, 440, 0, 494, 0, 523, 0, 587, 659,
         587, 0, 523, 0, 494, 0, 440, 392, 440, 0, 494, 0, 523, 0, 440, 0],
        // Variant C — wider intervals, more energy
        [659, 0, 523, 0, 784, 0, 659, 587, 523, 0, 659, 0, 784, 0, 880, 784,
         659, 0, 523, 0, 587, 0, 494, 440, 523, 0, 587, 0, 659, 0, 587, 0]
    ],
    // V33: Dynamic race tempo
    _raceTempoFactor: 1.0,

    setRaceIntensity(factor) {
        this._raceTempoFactor = Math.max(0.9, Math.min(1.1, factor));
    },

    // Zelda-inspired adventure menu theme — D major, heroic, wide leaps
    _playMenuLoop() {
        if (this._musicPlaying !== 'menu') return;
        try {
            this._musicNodes = this._musicNodes.filter(n => {
                if (n._ended) { try { n.disconnect(); } catch (e) {} return false; }
                return true;
            });
            const ctx = this._getCtx();
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.connect(ctx.destination);
            this._musicGain = gain;

            const melodyFilter = ctx.createBiquadFilter();
            melodyFilter.type = 'lowpass'; melodyFilter.frequency.value = 2800; melodyFilter.Q.value = 0.5;
            melodyFilter.connect(gain);
            const bassFilter = ctx.createBiquadFilter();
            bassFilter.type = 'lowpass'; bassFilter.frequency.value = 500; bassFilter.Q.value = 0.8;
            bassFilter.connect(gain);

            const self = this;
            const makeNote = (dest, freq, start, dur, vol, type) => {
                const osc = ctx.createOscillator();
                const ng = ctx.createGain();
                osc.connect(ng); ng.connect(dest);
                osc.type = type || 'sine';
                osc.frequency.setValueAtTime(freq, start);
                ng.gain.setValueAtTime(vol, start);
                ng.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.9);
                osc.onended = () => { osc._ended = true; };
                osc.start(start); osc.stop(start + dur);
                self._musicNodes.push(osc);
                const osc2 = ctx.createOscillator();
                const g2 = ctx.createGain();
                osc2.connect(g2); g2.connect(dest);
                osc2.type = type || 'sine';
                osc2.frequency.setValueAtTime(freq, start);
                osc2.detune.setValueAtTime(6, start);
                g2.gain.setValueAtTime(vol * 0.3, start);
                g2.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.9);
                osc2.onended = () => { osc2._ended = true; };
                osc2.start(start); osc2.stop(start + dur);
                self._musicNodes.push(osc2);
            };

            const beatLen = 0.43; // ~140 BPM
            const loopStart = ctx.currentTime; // V36: Capture for drift-free scheduling
            // V33: Randomly select melody variant for variety
            const melody = this._menuMelodies[Math.floor(Math.random() * this._menuMelodies.length)];
            const loopLen = melody.length * beatLen;
            melody.forEach((freq, i) => {
                const dur = (i % 2 === 0) ? beatLen * 1.1 : beatLen * 0.85;
                makeNote(melodyFilter, freq, loopStart + i * beatLen, dur, 0.45, 'sine');
            });
            // Bass: root movement in half-time
            const bass = [147, 147, 196, 196, 165, 165, 220, 220, 147, 147, 196, 196, 247, 247, 220, 147];
            bass.forEach((freq, i) => makeNote(bassFilter, freq, loopStart + i * beatLen * 2, beatLen * 2, 0.3, 'triangle'));

            // V36 fix: Schedule relative to audio clock to prevent drift
            const msUntilLoop = Math.max(0, (loopStart + loopLen - ctx.currentTime) * 1000 - 30);
            setTimeout(() => {
                if (this._musicPlaying === 'menu') this._playMenuLoop();
            }, msUntilLoop);
        } catch (e) { /* ignore */ }
    },

    _playRaceLoop() {
        if (this._musicPlaying !== 'race') return;
        try {
            this._musicNodes = this._musicNodes.filter(n => {
                try { if (n._ended) { n.disconnect(); return false; } } catch (e) { return false; }
                return true;
            });
            const ctx = this._getCtx();
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.connect(ctx.destination);
            this._musicGain = gain;

            // V22: Filtered music — warm bass, soft melody
            const bassFilter = ctx.createBiquadFilter();
            bassFilter.type = 'lowpass'; bassFilter.frequency.value = 800; bassFilter.Q.value = 1;
            bassFilter.connect(gain);

            const melodyFilter = ctx.createBiquadFilter();
            melodyFilter.type = 'lowpass'; melodyFilter.frequency.value = 3000; melodyFilter.Q.value = 0.5;
            melodyFilter.connect(gain);

            const self = this;
            const makeNote = (dest, freq, start, dur, vol, type) => {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();
                osc.connect(noteGain); noteGain.connect(dest);
                osc.type = type;
                osc.frequency.setValueAtTime(freq, start);
                noteGain.gain.setValueAtTime(vol, start);
                noteGain.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.85);
                osc.onended = () => { osc._ended = true; };
                osc.start(start); osc.stop(start + dur);
                self._musicNodes.push(osc);
                // Detuned warmth
                const osc2 = ctx.createOscillator();
                const g2 = ctx.createGain();
                osc2.connect(g2); g2.connect(dest);
                osc2.type = type; osc2.frequency.setValueAtTime(freq, start);
                osc2.detune.setValueAtTime(8, start);
                g2.gain.setValueAtTime(vol * 0.25, start);
                g2.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.85);
                osc2.onended = () => { osc2._ended = true; };
                osc2.start(start); osc2.stop(start + dur);
                self._musicNodes.push(osc2);
            };

            // V33: Dynamic tempo based on race position
            const beatLen = 0.2 / (this._raceTempoFactor || 1.0);
            const loopStart = ctx.currentTime; // V36: Capture for drift-free scheduling
            const bassPattern = [165, 0, 165, 196, 220, 0, 220, 196, 247, 0, 247, 220, 196, 0, 196, 165,
                                 165, 0, 165, 196, 220, 0, 220, 247, 262, 0, 247, 220, 196, 0, 165, 165];
            const loopLen = bassPattern.length * beatLen;
            bassPattern.forEach((freq, i) => { if (freq !== 0) makeNote(bassFilter, freq, loopStart + i * beatLen, beatLen, 0.25, 'sawtooth'); });

            // V33: Randomly select melody variant for variety
            const melody = this._raceMelodies[Math.floor(Math.random() * this._raceMelodies.length)];
            melody.forEach((freq, i) => { if (freq !== 0) makeNote(melodyFilter, freq, loopStart + i * beatLen, beatLen, 0.08, 'sine'); });

            // V36 fix: Schedule relative to audio clock to prevent drift
            const msUntilLoop = Math.max(0, (loopStart + loopLen - ctx.currentTime) * 1000 - 30);
            setTimeout(() => {
                if (this._musicPlaying === 'race') this._playRaceLoop();
            }, msUntilLoop);
        } catch (e) { /* ignore */ }
    },

    // Zelda boss battle music — E minor, intense, driving
    _playBossLoop() {
        if (this._musicPlaying !== 'boss') return;
        try {
            this._musicNodes = this._musicNodes.filter(n => {
                if (n._ended) { try { n.disconnect(); } catch (e) {} return false; }
                return true;
            });
            const ctx = this._getCtx();
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.connect(ctx.destination);
            this._musicGain = gain;

            const bassFilter = ctx.createBiquadFilter();
            bassFilter.type = 'lowpass'; bassFilter.frequency.value = 900; bassFilter.Q.value = 1.2;
            bassFilter.connect(gain);
            const melodyFilter = ctx.createBiquadFilter();
            melodyFilter.type = 'lowpass'; melodyFilter.frequency.value = 3500; melodyFilter.Q.value = 0.6;
            melodyFilter.connect(gain);

            const self = this;
            const makeNote = (dest, freq, start, dur, vol, type) => {
                const osc = ctx.createOscillator();
                const ng = ctx.createGain();
                osc.connect(ng); ng.connect(dest);
                osc.type = type;
                osc.frequency.setValueAtTime(freq, start);
                ng.gain.setValueAtTime(vol, start);
                ng.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.75);
                osc.onended = () => { osc._ended = true; };
                osc.start(start); osc.stop(start + dur);
                self._musicNodes.push(osc);
                const osc2 = ctx.createOscillator();
                const g2 = ctx.createGain();
                osc2.connect(g2); g2.connect(dest);
                osc2.type = type;
                osc2.frequency.setValueAtTime(freq, start);
                osc2.detune.setValueAtTime(10, start);
                g2.gain.setValueAtTime(vol * 0.3, start);
                g2.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.75);
                osc2.onended = () => { osc2._ended = true; };
                osc2.start(start); osc2.stop(start + dur);
                self._musicNodes.push(osc2);
            };

            const beatLen = 0.30; // ~200 BPM
            const loopStart = ctx.currentTime; // V36: Capture for drift-free scheduling
            const bass = [
                165, 0, 165, 165, 196, 0, 196, 220, 247, 0, 247, 220, 196, 0, 165, 165,
                165, 0, 165, 196, 220, 0, 262, 247, 220, 0, 196, 196, 185, 0, 165, 165
            ];
            const loopLen = bass.length * beatLen;
            bass.forEach((freq, i) => {
                if (freq !== 0) makeNote(bassFilter, freq, loopStart + i * beatLen, beatLen, 0.25, 'sawtooth');
            });
            const melody = [
                330, 0, 392, 0, 330, 294, 262, 0, 294, 0, 330, 0, 370, 330, 294, 262,
                392, 0, 440, 0, 494, 440, 392, 0, 370, 0, 330, 0, 294, 262, 247, 0
            ];
            melody.forEach((freq, i) => {
                if (freq !== 0) makeNote(melodyFilter, freq, loopStart + i * beatLen, beatLen * 0.7, 0.10, 'square');
            });

            // V36 fix: Schedule relative to audio clock to prevent drift
            const msUntilLoop = Math.max(0, (loopStart + loopLen - ctx.currentTime) * 1000 - 30);
            setTimeout(() => {
                if (this._musicPlaying === 'boss') this._playBossLoop();
            }, msUntilLoop);
        } catch (e) { /* ignore */ }
    },

    // Zelda victory/results music — C major, warm, triumphant celebration
    _playResultsLoop() {
        if (this._musicPlaying !== 'results') return;
        try {
            this._musicNodes = this._musicNodes.filter(n => {
                if (n._ended) { try { n.disconnect(); } catch (e) {} return false; }
                return true;
            });
            const ctx = this._getCtx();
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.connect(ctx.destination);
            this._musicGain = gain;

            const melodyFilter = ctx.createBiquadFilter();
            melodyFilter.type = 'lowpass'; melodyFilter.frequency.value = 2200; melodyFilter.Q.value = 0.4;
            melodyFilter.connect(gain);
            const bassFilter = ctx.createBiquadFilter();
            bassFilter.type = 'lowpass'; bassFilter.frequency.value = 450; bassFilter.Q.value = 0.6;
            bassFilter.connect(gain);

            const self = this;
            const makeNote = (dest, freq, start, dur, vol, type) => {
                const osc = ctx.createOscillator();
                const ng = ctx.createGain();
                osc.connect(ng); ng.connect(dest);
                osc.type = type || 'sine';
                osc.frequency.setValueAtTime(freq, start);
                ng.gain.setValueAtTime(vol, start);
                ng.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.92);
                osc.onended = () => { osc._ended = true; };
                osc.start(start); osc.stop(start + dur);
                self._musicNodes.push(osc);
                const osc2 = ctx.createOscillator();
                const g2 = ctx.createGain();
                osc2.connect(g2); g2.connect(dest);
                osc2.type = type || 'sine';
                osc2.frequency.setValueAtTime(freq, start);
                osc2.detune.setValueAtTime(5, start);
                g2.gain.setValueAtTime(vol * 0.35, start);
                g2.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.92);
                osc2.onended = () => { osc2._ended = true; };
                osc2.start(start); osc2.stop(start + dur);
                self._musicNodes.push(osc2);
            };

            const beatLen = 0.50; // ~120 BPM
            const loopStart = ctx.currentTime; // V36: Capture for drift-free scheduling
            const melody = [
                523, 659, 784, 659, 523, 392, 440, 523, 659, 523, 440, 392,
                349, 440, 523, 659, 784, 659, 523, 440, 392, 330, 294, 262
            ];
            const loopLen = melody.length * beatLen;
            melody.forEach((freq, i) => makeNote(melodyFilter, freq, loopStart + i * beatLen, beatLen * 1.1, 0.4, 'sine'));
            const bass = [131, 131, 196, 196, 175, 175, 196, 196, 175, 175, 196, 131];
            bass.forEach((freq, i) => makeNote(bassFilter, freq, loopStart + i * beatLen * 2, beatLen * 2, 0.25, 'triangle'));

            // V36 fix: Schedule relative to audio clock to prevent drift
            const msUntilLoop = Math.max(0, (loopStart + loopLen - ctx.currentTime) * 1000 - 30);
            setTimeout(() => {
                if (this._musicPlaying === 'results') this._playResultsLoop();
            }, msUntilLoop);
        } catch (e) { /* ignore */ }
    },

    // Zelda shop/garage music — F major, bouncy staccato, playful
    _playGarageLoop() {
        if (this._musicPlaying !== 'garage') return;
        try {
            this._musicNodes = this._musicNodes.filter(n => {
                if (n._ended) { try { n.disconnect(); } catch (e) {} return false; }
                return true;
            });
            const ctx = this._getCtx();
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.connect(ctx.destination);
            this._musicGain = gain;

            const melodyFilter = ctx.createBiquadFilter();
            melodyFilter.type = 'lowpass'; melodyFilter.frequency.value = 3000; melodyFilter.Q.value = 0.5;
            melodyFilter.connect(gain);
            const bassFilter = ctx.createBiquadFilter();
            bassFilter.type = 'lowpass'; bassFilter.frequency.value = 500; bassFilter.Q.value = 0.7;
            bassFilter.connect(gain);

            const self = this;
            const makeNote = (dest, freq, start, dur, vol, type) => {
                const osc = ctx.createOscillator();
                const ng = ctx.createGain();
                osc.connect(ng); ng.connect(dest);
                osc.type = type || 'sine';
                osc.frequency.setValueAtTime(freq, start);
                ng.gain.setValueAtTime(vol, start);
                ng.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.6); // short decay = staccato bounce
                osc.onended = () => { osc._ended = true; };
                osc.start(start); osc.stop(start + dur);
                self._musicNodes.push(osc);
                const osc2 = ctx.createOscillator();
                const g2 = ctx.createGain();
                osc2.connect(g2); g2.connect(dest);
                osc2.type = type || 'sine';
                osc2.frequency.setValueAtTime(freq, start);
                osc2.detune.setValueAtTime(7, start);
                g2.gain.setValueAtTime(vol * 0.25, start);
                g2.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.6);
                osc2.onended = () => { osc2._ended = true; };
                osc2.start(start); osc2.stop(start + dur);
                self._musicNodes.push(osc2);
            };

            const beatLen = 0.375; // ~160 BPM
            const loopStart = ctx.currentTime; // V36: Capture for drift-free scheduling
            const melody = [
                349, 0, 440, 0, 523, 0, 440, 349, 392, 0, 466, 0, 523, 587, 523, 0,
                698, 0, 587, 0, 523, 0, 440, 392
            ];
            const loopLen = melody.length * beatLen;
            melody.forEach((freq, i) => {
                if (freq !== 0) makeNote(melodyFilter, freq, loopStart + i * beatLen, beatLen, 0.4, 'triangle');
            });
            const bass = [175, 0, 175, 220, 175, 0, 196, 0, 196, 233, 262, 0];
            bass.forEach((freq, i) => {
                if (freq !== 0) makeNote(bassFilter, freq, loopStart + i * beatLen * 2, beatLen * 1.8, 0.25, 'triangle');
            });

            // V36 fix: Schedule relative to audio clock to prevent drift
            const msUntilLoop = Math.max(0, (loopStart + loopLen - ctx.currentTime) * 1000 - 30);
            setTimeout(() => {
                if (this._musicPlaying === 'garage') this._playGarageLoop();
            }, msUntilLoop);
        } catch (e) { /* ignore */ }
    },

    // V22: Warm note helper — multi-oscillator with detuning + lowpass for richer tones
    _warmNote(ctx, dest, freq, start, dur, vol, opts = {}) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(opts.cutoff || freq * 4, start);
        if (opts.cutoffDecay) filter.frequency.exponentialRampToValueAtTime(freq * 1.5, start + dur * 0.8);
        filter.Q.value = opts.resonance || 0.7;
        filter.connect(dest);

        // Fundamental
        const osc1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        osc1.connect(g1); g1.connect(filter);
        osc1.type = opts.type || 'sine';
        osc1.frequency.setValueAtTime(freq, start);
        if (opts.freqEnd) osc1.frequency.exponentialRampToValueAtTime(opts.freqEnd, start + dur);
        g1.gain.setValueAtTime(vol, start);
        if (opts.attack) g1.gain.linearRampToValueAtTime(vol, start + opts.attack);
        g1.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc1.start(start); osc1.stop(start + dur + 0.05);

        // Detuned layer for warmth
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.connect(g2); g2.connect(filter);
        osc2.type = opts.type || 'sine';
        osc2.frequency.setValueAtTime(freq * 1.003, start);
        if (opts.freqEnd) osc2.frequency.exponentialRampToValueAtTime(opts.freqEnd * 1.003, start + dur);
        osc2.detune.setValueAtTime(opts.detune || 8, start);
        g2.gain.setValueAtTime(vol * 0.5, start);
        g2.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc2.start(start); osc2.stop(start + dur + 0.05);

        // Octave harmonic (subtle)
        if (opts.harmonic !== false) {
            const osc3 = ctx.createOscillator();
            const g3 = ctx.createGain();
            osc3.connect(g3); g3.connect(filter);
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(freq * 2, start);
            g3.gain.setValueAtTime(vol * (opts.harmonicVol || 0.15), start);
            g3.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.7);
            osc3.start(start); osc3.stop(start + dur + 0.05);
        }
    },

    // ---- V22: UPGRADED UI SOUND EFFECTS ----
    playClick() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('click', 0.4)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            this._warmNote(ctx, ctx.destination, 900, t, 0.1, 0.12, {
                freqEnd: 600, cutoff: 4000, harmonic: false, detune: 5
            });
        } catch (e) { /* ignore */ }
    },

    playPowerUp() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                this._warmNote(ctx, ctx.destination, freq, t + i * 0.07, 0.25, 0.15, {
                    cutoff: 6000, harmonicVol: 0.25, detune: 6
                });
            });
            // Shimmer sweep on top
            const shimmer = ctx.createOscillator();
            const sGain = ctx.createGain();
            const sFilter = ctx.createBiquadFilter();
            shimmer.connect(sFilter); sFilter.connect(sGain); sGain.connect(ctx.destination);
            shimmer.type = 'sine';
            sFilter.type = 'bandpass'; sFilter.frequency.value = 3000; sFilter.Q.value = 2;
            shimmer.frequency.setValueAtTime(1047, t + 0.2);
            shimmer.frequency.linearRampToValueAtTime(2093, t + 0.5);
            sGain.gain.setValueAtTime(0.06, t + 0.2);
            sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            shimmer.start(t + 0.2); shimmer.stop(t + 0.65);
        } catch (e) { /* ignore */ }
    },

    playStarEarn() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('star', 0.5)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Bright ascending chime with reverb-like tail
            this._warmNote(ctx, ctx.destination, 880, t, 0.2, 0.15, { cutoff: 8000, harmonicVol: 0.3 });
            this._warmNote(ctx, ctx.destination, 1175, t + 0.1, 0.25, 0.15, { cutoff: 8000, harmonicVol: 0.3 });
            this._warmNote(ctx, ctx.destination, 1568, t + 0.2, 0.4, 0.12, { cutoff: 8000, harmonicVol: 0.2 });
        } catch (e) { /* ignore */ }
    },

    playLaneChange() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('lane-change', 0.3)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Soft swoosh with filtered noise + pitched component
            this._warmNote(ctx, ctx.destination, 450, t, 0.1, 0.06, {
                freqEnd: 550, cutoff: 2000, harmonic: false, detune: 15
            });
            // Tiny noise swoosh
            const bufSize = ctx.sampleRate * 0.06;
            const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
            const src = ctx.createBufferSource(); src.buffer = buf;
            const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2000; f.Q.value = 0.5;
            const g = ctx.createGain(); g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
            src.connect(f); f.connect(g); g.connect(ctx.destination);
            src.start(t);
        } catch (e) { /* ignore */ }
    },

    // ---- V22: UPGRADED GAME SOUND EFFECTS ----
    // V33: Accept optional streakCount for pitch escalation
    playCorrect(streakCount) {
        if (!Settings.get('sound')) return;
        if (this._playMP3('correct', 0.5)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Rich warm chord: C5 → E5 → G5 with harmonics + filtered sparkle
            // V32: Reduced volume from 0.14 to 0.08 (was too loud vs music)
            // V33: Pitch escalates with streak (+2% per streak, max +10%)
            const pitchMul = 1 + Math.min((streakCount || 0), 5) * 0.02;
            const notes = [523 * pitchMul, 659 * pitchMul, 784 * pitchMul];
            notes.forEach((freq, i) => {
                this._warmNote(ctx, ctx.destination, freq, t + i * 0.09, 0.45, 0.08, {
                    cutoff: 5000, cutoffDecay: true, harmonicVol: 0.2, detune: 6
                });
            });
            // Sparkle — filtered high sine with gentle sweep
            const sparkle = ctx.createOscillator();
            const sGain = ctx.createGain();
            const sFilter = ctx.createBiquadFilter();
            sparkle.connect(sFilter); sFilter.connect(sGain); sGain.connect(ctx.destination);
            sFilter.type = 'lowpass'; sFilter.frequency.value = 6000; sFilter.Q.value = 1;
            sparkle.type = 'sine';
            sparkle.frequency.setValueAtTime(1568, t + 0.22);
            sparkle.frequency.linearRampToValueAtTime(2093, t + 0.4);
            sGain.gain.setValueAtTime(0.05, t + 0.22); // V32: reduced sparkle
            sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            sparkle.start(t + 0.22); sparkle.stop(t + 0.65);
        } catch (e) { /* ignore */ }
    },

    playWrong() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('wrong', 0.4)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Warm gentle "bwom bwom" — filtered descending tones with chorus
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass'; filter.frequency.value = 1200; filter.Q.value = 0.5;
            filter.connect(ctx.destination);
            // V32: Reduced wrong-answer volume (was 0.14/0.12)
            this._warmNote(ctx, filter, 330, t, 0.2, 0.08, {
                freqEnd: 277, harmonic: false, detune: 12
            });
            this._warmNote(ctx, filter, 277, t + 0.18, 0.25, 0.07, {
                freqEnd: 220, harmonic: false, detune: 12
            });
        } catch (e) { /* ignore */ }
    },

    playNitro() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('nitro', 0.5)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Filtered engine sweep (not raw sawtooth)
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
            filter.type = 'lowpass'; filter.frequency.setValueAtTime(300, t);
            filter.frequency.exponentialRampToValueAtTime(2000, t + 0.3);
            filter.Q.value = 2;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, t);
            osc.frequency.exponentialRampToValueAtTime(400, t + 0.3);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            osc.start(t); osc.stop(t + 0.65);
            // Warm whoosh — filtered noise
            const bufferSize = ctx.sampleRate * 0.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.2);
            }
            const src = ctx.createBufferSource(); src.buffer = buffer;
            const nFilter = ctx.createBiquadFilter();
            nFilter.type = 'bandpass';
            nFilter.frequency.setValueAtTime(600, t);
            nFilter.frequency.exponentialRampToValueAtTime(3000, t + 0.25);
            nFilter.Q.value = 0.8;
            const nGain = ctx.createGain();
            src.connect(nFilter); nFilter.connect(nGain); nGain.connect(ctx.destination);
            nGain.gain.setValueAtTime(0.12, t);
            nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
            src.start(t);
        } catch (e) { /* ignore */ }
    },

    // V14: Streak chime — warm ascending arpeggio
    playStreakChime(streakCount) {
        if (!Settings.get('sound')) return;
        if (this._playMP3('streak', 0.5)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            const baseFreq = 600 + Math.min(streakCount, 10) * 40;
            for (let i = 0; i < 3; i++) {
                this._warmNote(ctx, ctx.destination, baseFreq + i * 200, t + i * 0.07, 0.3, 0.12, {
                    cutoff: 6000, harmonicVol: 0.2, detune: 5
                });
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
            const t = ctx.currentTime;
            // Filtered engine rumble (not raw sawtooth)
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
            filter.type = 'lowpass'; filter.frequency.value = 200; filter.Q.value = 1;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, t);
            gain.gain.setValueAtTime(0.04, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.start(t); osc.stop(t + 0.3);
        } catch (e) { /* ignore */ }
    },

    playVictory() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('victory', 0.6)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                this._warmNote(ctx, ctx.destination, freq, t + i * 0.15, 0.5, 0.18, {
                    cutoff: 5000, harmonicVol: 0.25, detune: 8
                });
            });
            // Sustain chord at end
            [1047, 1319, 1568].forEach(freq => {
                this._warmNote(ctx, ctx.destination, freq, t + 0.6, 0.8, 0.08, {
                    cutoff: 4000, harmonicVol: 0.1, detune: 4
                });
            });
        } catch (e) { /* ignore */ }
    },

    playLevelUp() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('levelup', 0.6)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Warm ascending fanfare
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                this._warmNote(ctx, ctx.destination, freq, t + i * 0.12, 0.55, 0.18, {
                    cutoff: 5000, cutoffDecay: true, harmonicVol: 0.2, detune: 6
                });
            });
            // Final sustained warm chord
            [1047, 1319, 1568].forEach(freq => {
                this._warmNote(ctx, ctx.destination, freq, t + 0.48, 0.9, 0.1, {
                    cutoff: 4000, harmonicVol: 0.15, detune: 5
                });
            });
        } catch (e) { /* ignore */ }
    },

    playBoom() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Filtered noise burst (warmer)
            const bufferSize = ctx.sampleRate * 0.35;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.8);
            }
            const source = ctx.createBufferSource(); source.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass'; filter.frequency.setValueAtTime(3000, t);
            filter.frequency.exponentialRampToValueAtTime(200, t + 0.3);
            const gain = ctx.createGain();
            source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            source.start(t);
            // Warm low rumble
            this._warmNote(ctx, ctx.destination, 60, t, 0.45, 0.15, {
                freqEnd: 25, cutoff: 200, harmonic: false
            });
        } catch (e) { /* ignore */ }
    },

    playCountdown() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('countdown', 0.4)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Rich tone instead of thin beep
            this._warmNote(ctx, ctx.destination, 440, t, 0.25, 0.18, {
                cutoff: 3000, cutoffDecay: true, harmonicVol: 0.2, detune: 4
            });
        } catch (e) { /* ignore */ }
    },

    // V5.5: Obstacle hit — warm crunchy impact
    playHit() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Filtered noise crunch
            const bufferSize = ctx.sampleRate * 0.15;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.5);
            }
            const source = ctx.createBufferSource(); source.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass'; filter.frequency.setValueAtTime(2000, t);
            filter.frequency.exponentialRampToValueAtTime(300, t + 0.1);
            const gain = ctx.createGain();
            source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            source.start(t);
            // Warm thud
            this._warmNote(ctx, ctx.destination, 100, t, 0.18, 0.15, {
                freqEnd: 40, cutoff: 250, harmonic: false
            });
        } catch (e) { /* ignore */ }
    },

    playRevving(count) {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            const baseFreq = 60 + (4 - count) * 30;
            // Filtered engine rev (not raw sawtooth)
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(baseFreq * 2, t);
            filter.frequency.exponentialRampToValueAtTime(baseFreq * 5, t + 0.35);
            filter.Q.value = 1.5;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, t + 0.4);
            gain.gain.setValueAtTime(0.06, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.start(t); osc.stop(t + 0.55);
        } catch (e) { /* ignore */ }
    },

    playFanfare() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            const notes = [392, 523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                this._warmNote(ctx, ctx.destination, freq, t + i * 0.12, 0.55, 0.2, {
                    cutoff: 5000, harmonicVol: 0.25, detune: 6
                });
            });
        } catch (e) { /* ignore */ }
    },

    // Zelda item discovery fanfare — "da da da DAAAA!"
    playAchievement() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('achievement', 0.6)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Three quick ascending "da da da" (quiet, building anticipation)
            this._warmNote(ctx, ctx.destination, 392, t, 0.15, 0.10, {
                cutoff: 3000, harmonic: false, detune: 4
            });
            this._warmNote(ctx, ctx.destination, 523, t + 0.15, 0.15, 0.12, {
                cutoff: 3500, harmonic: false, detune: 4
            });
            this._warmNote(ctx, ctx.destination, 659, t + 0.30, 0.15, 0.14, {
                cutoff: 4000, harmonic: false, detune: 4
            });
            // "DAAAA!" — sustained triumphant note with chord
            this._warmNote(ctx, ctx.destination, 784, t + 0.50, 0.9, 0.22, {
                cutoff: 5000, harmonicVol: 0.3, detune: 6
            });
            // Supporting C5 + E5 chord
            this._warmNote(ctx, ctx.destination, 523, t + 0.50, 0.8, 0.10, {
                cutoff: 3500, harmonicVol: 0.15, detune: 5
            });
            this._warmNote(ctx, ctx.destination, 659, t + 0.50, 0.8, 0.10, {
                cutoff: 4000, harmonicVol: 0.15, detune: 5
            });
            // Sparkle shimmer on top
            this._warmNote(ctx, ctx.destination, 1568, t + 0.55, 0.7, 0.05, {
                type: 'triangle', cutoff: 8000, harmonic: false, detune: 12
            });
        } catch (e) { /* ignore */ }
    },

    // Zelda puzzle-solved "GO!" tone — ascending resolution
    playCountdownGo() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('countdown-go', 0.5)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            this._warmNote(ctx, ctx.destination, 587, t, 0.15, 0.20, {
                cutoff: 4000, harmonicVol: 0.25, detune: 5
            });
            this._warmNote(ctx, ctx.destination, 880, t + 0.12, 0.4, 0.22, {
                cutoff: 5000, harmonicVol: 0.3, detune: 6
            });
            // Bright shimmer
            this._warmNote(ctx, ctx.destination, 1760, t + 0.20, 0.35, 0.06, {
                type: 'triangle', cutoff: 6000, harmonic: false, detune: 10
            });
        } catch (e) { /* ignore */ }
    },

    // Screen transition swoosh — filtered noise + pitched sweep
    playTransition() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('transition', 0.4)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            // Noise whoosh
            const bufSize = ctx.sampleRate * 0.15;
            const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) {
                d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.5);
            }
            const src = ctx.createBufferSource(); src.buffer = buf;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, t);
            filter.frequency.exponentialRampToValueAtTime(3000, t + 0.08);
            filter.Q.value = 0.8;
            const gain = ctx.createGain();
            src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.06, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
            src.start(t);
            // Subtle pitched magic sweep
            this._warmNote(ctx, ctx.destination, 600, t, 0.08, 0.04, {
                freqEnd: 900, cutoff: 2500, harmonic: false, detune: 15
            });
        } catch (e) { /* ignore */ }
    },

    // V5.8: Timeout warning — warm ticking
    playTimeWarning() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            for (let i = 0; i < 3; i++) {
                this._warmNote(ctx, ctx.destination, 880, t + i * 0.25, 0.12, 0.12, {
                    cutoff: 4000, harmonic: false, detune: 3
                });
            }
        } catch (e) { /* ignore */ }
    },

    // V5.8: Checkpoint — warm two-note chime
    playCheckpoint() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            this._warmNote(ctx, ctx.destination, 600, t, 0.12, 0.1, {
                cutoff: 3000, harmonic: false, detune: 5
            });
            this._warmNote(ctx, ctx.destination, 800, t + 0.08, 0.15, 0.1, {
                cutoff: 4000, harmonic: false, detune: 5
            });
        } catch (e) { /* ignore */ }
    },

    // V5.8: Purchase — warm coin ding
    playPurchase() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('purchase', 0.5)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            this._warmNote(ctx, ctx.destination, 1200, t, 0.3, 0.15, {
                freqEnd: 1600, cutoff: 6000, harmonicVol: 0.25, detune: 4
            });
            // Gentle resonant tail
            this._warmNote(ctx, ctx.destination, 2400, t + 0.05, 0.35, 0.05, {
                type: 'triangle', cutoff: 5000, harmonic: false, detune: 8
            });
        } catch (e) { /* ignore */ }
    },

    // V5.8: Break chime — warm descending
    playBreakChime() {
        if (!Settings.get('sound')) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            const notes = [523, 440, 392, 330];
            notes.forEach((freq, i) => {
                this._warmNote(ctx, ctx.destination, freq, t + i * 0.2, 0.45, 0.1, {
                    cutoff: 3000, cutoffDecay: true, harmonicVol: 0.15, detune: 6
                });
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
    },

    // V21/V37: Unlock speechSynthesis on mobile (must be called from user gesture)
    _speechUnlocked: false,
    unlockSpeech() {
        if (this._speechUnlocked) return;
        this._speechUnlocked = true;

        // Resume AudioContext and start loading MP3 assets
        this.resume();
        this._loadMP3Assets();

        if (!this.synth) return;

        // Cancel any stale speech state
        this.synth.cancel();

        // V37: Improved warm-up sequence for Fire/Android/Silk
        // Step 1: Silent utterance to prime the speech engine
        try {
            const warmup = new SpeechSynthesisUtterance(' ');
            warmup.volume = 0.01; // near-silent but not zero (zero can be ignored on some engines)
            warmup.rate = 5;
            warmup.onend = () => {
                // Step 2: After warm-up completes, do a second prime with actual text
                // This ensures the engine is fully initialized on Fire OS
                try {
                    const prime = new SpeechSynthesisUtterance('.');
                    prime.volume = 0.01;
                    prime.rate = 10;
                    this.synth.speak(prime);
                } catch (e) { /* ignore */ }
            };
            this.synth.speak(warmup);
        } catch (e) { /* ignore */ }

        // Pre-load voices (Android often needs voiceschanged to fire first)
        // V37: Also reset cached voice so it re-evaluates with new Android voice list
        this._preferredVoice = null;
        if (this.synth.getVoices && this.synth.getVoices().length === 0) {
            this.synth.addEventListener('voiceschanged', () => {
                this.synth.getVoices(); // cache them
                this._pickVoice(); // V29: select preferred female voice
            }, { once: true });
            // V37: Fallback if voiceschanged never fires (some Android/Silk builds)
            setTimeout(() => {
                if (!this._preferredVoice) {
                    this._pickVoice();
                }
            }, 1000);
        } else {
            this._pickVoice(); // V29: select preferred female voice immediately
        }
    },

    // V31: Car horn with per-car personality
    _hornCooldown: false,
    playHorn(carType) {
        if (!Settings.get('sound') || this._hornCooldown) return;
        this._hornCooldown = true;
        setTimeout(() => { this._hornCooldown = false; }, 800); // V32: was 2000ms

        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;

            if (carType === 'wienermobile') {
                // Silly "ahooga" horn
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.linearRampToValueAtTime(400, t + 0.15);
                osc.frequency.setValueAtTime(200, t + 0.2);
                osc.frequency.linearRampToValueAtTime(500, t + 0.4);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
                osc.start(t); osc.stop(t + 0.6);
            } else if (['monstertruck', 'tank'].includes(carType)) {
                // Deep air horn
                const osc = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sawtooth'; osc2.type = 'sawtooth';
                osc.frequency.value = 110; osc2.frequency.value = 147;
                gain.gain.setValueAtTime(0.12, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
                osc.start(t); osc2.start(t);
                osc.stop(t + 0.8); osc2.stop(t + 0.8);
            } else if (['firetruck', 'policecar', 'ambulance'].includes(carType)) {
                // Siren blast (wee-woo)
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.linearRampToValueAtTime(900, t + 0.25);
                osc.frequency.linearRampToValueAtTime(600, t + 0.5);
                gain.gain.setValueAtTime(0.12, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
                osc.start(t); osc.stop(t + 0.6);
            } else if (carType === 'schoolbus') {
                // Beep beep
                for (let i = 0; i < 2; i++) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.type = 'square';
                    osc.frequency.value = 800;
                    gain.gain.setValueAtTime(0.08, t + i * 0.2);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.12);
                    osc.start(t + i * 0.2); osc.stop(t + i * 0.2 + 0.15);
                }
            } else if (carType === 'icecreamtruck') {
                // Musical chime
                const notes = [523, 659, 784, 1047];
                notes.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.1, t + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.25);
                    osc.start(t + i * 0.1); osc.stop(t + i * 0.1 + 0.3);
                });
            } else {
                // Default sporty dual-tone horn
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
                osc1.type = 'sawtooth'; osc2.type = 'sawtooth';
                osc1.frequency.value = 440; osc2.frequency.value = 554;
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
                osc1.start(t); osc2.start(t);
                osc1.stop(t + 0.5); osc2.stop(t + 0.5);
            }
        } catch (e) { /* ignore */ }
    },

    // V31: Coin collect sound — bright ascending chime
    playCoinCollect() {
        if (!Settings.get('sound')) return;
        if (this._playMP3('coin', 0.5)) return;
        try {
            const ctx = this._getCtx();
            const t = ctx.currentTime;
            const notes = [880, 1108, 1318];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.1, t + i * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.2);
                osc.start(t + i * 0.06); osc.stop(t + i * 0.06 + 0.25);
            });
        } catch (e) { /* ignore */ }
    }
};
