/* ============================================
   AUDIO — Synthesized Minecraft Sounds + TTS
   ============================================ */
const Audio = (() => {
    let ctx = null;
    let soundOn = true;
    let musicOn = true;
    let voiceOn = true;

    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        return ctx;
    }

    // --- TTS Voice Preloading ---
    let cachedVoice = null;
    let voicesReady = false;
    let ttsUnlocked = false;

    function loadVoices() {
        if (!window.speechSynthesis) return;
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            voicesReady = true;
            // Prefer child-friendly voices, ranked by naturalness
            // Includes Android/Fire tablet voices for Silk browser
            const en = voices.filter(v => /^en[-_]/i.test(v.lang));
            const preferred = [
                'samantha',                 // macOS/iOS
                'google us english',        // Chrome desktop
                'microsoft zira',           // Windows
                'microsoft aria',           // Windows 11 neural
                'microsoft jenny',          // Windows 11 neural
                'en-us-x-sfg-local',        // Android/Fire female (high quality)
                'en-us-x-tpd-local',        // Android/Fire female (alt)
                'en-us-x-sfg-network',      // Android/Fire female (network)
                'english united states',    // Android/Silk generic
            ];
            cachedVoice = null;
            for (const pref of preferred) {
                const match = en.find(v => v.name.toLowerCase().includes(pref));
                if (match) { cachedVoice = match; return; }
            }
            // Fallback: local English voice (lower latency on Fire tablets)
            cachedVoice = en.find(v => v.localService) ||
                en.find(v => v.lang.startsWith('en')) ||
                null;
        }
    }

    // Voices load asynchronously in most browsers
    if (window.speechSynthesis) {
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    function resumeCtx() {
        if (ctx && ctx.state === 'suspended') ctx.resume();
    }

    // MP3 sound effect cache
    const _mp3Cache = {};
    let _mp3Loaded = false;
    function _loadMP3Assets() {
        if (_mp3Loaded) return;
        _mp3Loaded = true;
        const c = getCtx();
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
            { key: 'block-break', src: 'assets/sounds/sfx/block-break.mp3' },
            { key: 'swing', src: 'assets/sounds/sfx/swing.mp3' },
            { key: 'gem', src: 'assets/sounds/sfx/gem.mp3' }
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
        if (!soundOn) return true;
        const c = getCtx();
        const source = c.createBufferSource();
        source.buffer = buf;
        const gain = c.createGain();
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(c.destination);
        source.start(0);
        return true;
    }

    // Must be called from a user gesture (click/tap) to unlock TTS on mobile
    function unlockAudio() {
        // Resume AudioContext
        resumeCtx();
        // Load MP3 assets on first user interaction
        _loadMP3Assets();
        // Unlock TTS with a silent utterance on first user gesture
        if (!ttsUnlocked && window.speechSynthesis) {
            const u = new SpeechSynthesisUtterance('');
            u.volume = 0;
            u.rate = 10;
            window.speechSynthesis.speak(u);
            ttsUnlocked = true;
        }
    }

    // --- Synthesized Minecraft-style sounds ---
    function playTone(freq, duration, type = 'square', vol = 0.15) {
        if (!soundOn) return;
        try {
            const c = getCtx();
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(c.currentTime);
            osc.stop(c.currentTime + duration);
        } catch (e) {}
    }

    function blockBreak() {
        if (_playMP3('block-break', 0.5)) return;
        playTone(200, 0.08, 'square', 0.12);
        setTimeout(() => playTone(300, 0.06, 'square', 0.1), 40);
        setTimeout(() => playTone(150, 0.1, 'square', 0.08), 80);
    }

    function blockBounce() {
        playTone(100, 0.15, 'square', 0.1);
        setTimeout(() => playTone(80, 0.1, 'square', 0.08), 60);
    }

    function correct() {
        if (_playMP3('correct', 0.5)) return;
        playTone(523, 0.1, 'square', 0.12);
        setTimeout(() => playTone(659, 0.1, 'square', 0.12), 100);
        setTimeout(() => playTone(784, 0.15, 'square', 0.12), 200);
    }

    function wrong() {
        if (_playMP3('wrong', 0.5)) return;
        playTone(200, 0.15, 'sawtooth', 0.1);
        setTimeout(() => playTone(160, 0.2, 'sawtooth', 0.08), 100);
    }

    function click() {
        if (_playMP3('click', 0.4)) return;
        playTone(800, 0.04, 'square', 0.08);
    }

    function levelUp() {
        if (_playMP3('levelup', 0.5)) return;
        const notes = [523, 659, 784, 1047];
        notes.forEach((n, i) => {
            setTimeout(() => playTone(n, 0.15, 'square', 0.12), i * 120);
        });
    }

    function achievement() {
        if (_playMP3('achievement', 0.5)) return;
        const notes = [784, 988, 1175, 1318, 1568];
        notes.forEach((n, i) => {
            setTimeout(() => playTone(n, 0.12, 'triangle', 0.1), i * 80);
        });
    }

    function mobHit() {
        playTone(120, 0.1, 'sawtooth', 0.12);
        setTimeout(() => playTone(180, 0.08, 'square', 0.1), 50);
    }

    function bossAppear() {
        if (!soundOn) return;
        try {
            const c = getCtx();
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, c.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.5);
            gain.gain.setValueAtTime(0.18, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(c.currentTime);
            osc.stop(c.currentTime + 0.6);
        } catch (e) {}
    }

    function mobDefeat() {
        playTone(400, 0.06, 'square', 0.12);
        setTimeout(() => playTone(300, 0.04, 'square', 0.08), 40);
    }

    function unlock() {
        if (!soundOn) return;
        try {
            const c = getCtx();
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'sine';
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.1, c.currentTime);
            gain.gain.setValueAtTime(0.04, c.currentTime + 0.05);
            gain.gain.setValueAtTime(0.1, c.currentTime + 0.1);
            gain.gain.setValueAtTime(0.04, c.currentTime + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(c.currentTime);
            osc.stop(c.currentTime + 0.4);
        } catch (e) {}
    }

    function bridgePlace() {
        playTone(440, 0.06, 'square', 0.1);
        setTimeout(() => playTone(554, 0.08, 'square', 0.08), 50);
    }

    function enchant() {
        playTone(880, 0.2, 'sine', 0.08);
        setTimeout(() => playTone(1100, 0.2, 'sine', 0.06), 100);
        setTimeout(() => playTone(1320, 0.3, 'sine', 0.05), 200);
    }

    function gemPickup() {
        if (_playMP3('gem', 0.5)) return;
        playTone(1200, 0.06, 'sine', 0.1);
        setTimeout(() => playTone(1600, 0.08, 'sine', 0.08), 50);
    }

    function comboSound() {
        const notes = [660, 880, 1100];
        notes.forEach((n, i) => {
            setTimeout(() => playTone(n, 0.08, 'square', 0.08), i * 50);
        });
    }

    function superCombo() {
        // Ascending 5-note sequence, brighter and faster than regular combo
        const notes = [784, 988, 1175, 1397, 1568];
        notes.forEach((n, i) => {
            setTimeout(() => playTone(n, 0.1, 'triangle', 0.1), i * 40);
        });
    }

    function victory() {
        if (_playMP3('victory', 0.5)) return;
        const notes = [523, 659, 784, 1047, 784, 1047];
        notes.forEach((n, i) => {
            setTimeout(() => playTone(n, 0.2, 'square', 0.1), i * 150);
        });
    }

    function defeat() {
        const notes = [294, 262, 233, 196];
        notes.forEach((n, i) => {
            setTimeout(() => playTone(n, 0.3, 'sawtooth', 0.08), i * 200);
        });
    }

    function milestone() {
        if (_playMP3('streak', 0.5)) return;
        playTone(784, 0.1, 'triangle', 0.1);
        setTimeout(() => playTone(988, 0.1, 'triangle', 0.1), 80);
        setTimeout(() => playTone(1175, 0.15, 'triangle', 0.1), 160);
        setTimeout(() => playTone(1568, 0.2, 'triangle', 0.08), 260);
    }

    // --- Background Music (biome-specific synthesized loops) ---
    let musicNodes = null;       // { masterGain, scheduler, delayNode }
    let musicPlaying = false;
    let currentBiome = 'plains';
    const MUSIC_VOLUME = 0.18;
    const MUSIC_DUCK_VOLUME = 0.06;

    // Biome music definitions: melody, bass, tempo, wave types, effects
    const BIOME_MUSIC = {
        // Plains: Light, cheerful C major pentatonic, 90 BPM
        plains: {
            bpm: 90,
            melodyWave: 'sine',
            bassWave: 'triangle',
            melodyVol: 0.07,
            bassVol: 0.09,
            melodyDecay: 0.8,
            bassDecay: 1.5,
            useDelay: false,
            melody: [
                262, 0, 330, 0,  392, 0, 440, 330,
                392, 0, 330, 0,  262, 0, 294, 0,
                330, 0, 392, 0,  440, 392, 330, 0,
                294, 0, 262, 0,  330, 294, 262, 0
            ],
            bass: [
                131, 0, 0, 0,  196, 0, 0, 0,
                131, 0, 0, 0,  196, 0, 0, 0,
                175, 0, 0, 0,  196, 0, 0, 0,
                131, 0, 0, 0,  196, 0, 131, 0
            ]
        },
        // Forest: Mysterious E minor, 80 BPM, soft triangle
        forest: {
            bpm: 80,
            melodyWave: 'triangle',
            bassWave: 'triangle',
            melodyVol: 0.06,
            bassVol: 0.08,
            melodyDecay: 1.0,
            bassDecay: 1.8,
            useDelay: false,
            melody: [
                330, 0, 392, 0,  370, 0, 330, 0,
                294, 0, 330, 0,  370, 330, 294, 0,
                262, 0, 294, 0,  330, 0, 370, 330,
                294, 0, 262, 0,  294, 262, 247, 0
            ],
            bass: [
                165, 0, 0, 0,  196, 0, 0, 0,
                147, 0, 0, 0,  165, 0, 0, 0,
                131, 0, 0, 0,  147, 0, 0, 0,
                165, 0, 0, 0,  131, 0, 165, 0
            ]
        },
        // Desert: Sandy rhythmic A minor, 85 BPM, square wave
        desert: {
            bpm: 85,
            melodyWave: 'square',
            bassWave: 'triangle',
            melodyVol: 0.05,
            bassVol: 0.08,
            melodyDecay: 0.6,
            bassDecay: 1.2,
            useDelay: false,
            melody: [
                440, 0, 392, 440,  0, 330, 0, 392,
                440, 0, 523, 0,  440, 392, 330, 0,
                349, 0, 330, 0,  294, 0, 330, 349,
                392, 0, 440, 0,  392, 330, 294, 0
            ],
            bass: [
                110, 0, 0, 110,  0, 0, 131, 0,
                110, 0, 0, 0,  131, 0, 0, 110,
                87, 0, 0, 87,  0, 0, 110, 0,
                98, 0, 0, 0,  110, 0, 98, 0
            ]
        },
        // Snow: Gentle twinkling F major, 70 BPM, sine with delay
        snow: {
            bpm: 70,
            melodyWave: 'sine',
            bassWave: 'sine',
            melodyVol: 0.06,
            bassVol: 0.07,
            melodyDecay: 1.2,
            bassDecay: 2.0,
            useDelay: true,
            melody: [
                349, 0, 0, 440,  0, 0, 523, 0,
                0, 440, 0, 0,  349, 0, 0, 330,
                0, 0, 294, 0,  349, 0, 0, 440,
                0, 523, 0, 0,  440, 0, 349, 0
            ],
            bass: [
                175, 0, 0, 0,  0, 0, 0, 0,
                131, 0, 0, 0,  0, 0, 0, 0,
                147, 0, 0, 0,  0, 0, 0, 0,
                175, 0, 0, 0,  0, 0, 131, 0
            ]
        },
        // Nether: Dark tense D minor, 100 BPM, sawtooth bass
        nether: {
            bpm: 100,
            melodyWave: 'square',
            bassWave: 'sawtooth',
            melodyVol: 0.05,
            bassVol: 0.1,
            melodyDecay: 0.5,
            bassDecay: 1.0,
            useDelay: false,
            melody: [
                294, 0, 349, 0,  330, 0, 294, 262,
                0, 294, 0, 262,  233, 0, 262, 0,
                294, 349, 0, 392,  349, 0, 294, 0,
                262, 0, 233, 0,  262, 233, 196, 0
            ],
            bass: [
                73, 0, 73, 0,  87, 0, 0, 73,
                0, 73, 0, 0,  98, 0, 87, 0,
                73, 0, 0, 73,  87, 0, 98, 0,
                73, 0, 73, 87,  73, 0, 65, 0
            ]
        },
        // End: Ambient, echoing, sparse (cave-like)
        end: {
            bpm: 65,
            melodyWave: 'sine',
            bassWave: 'sine',
            melodyVol: 0.05,
            bassVol: 0.06,
            melodyDecay: 2.0,
            bassDecay: 2.5,
            useDelay: true,
            melody: [
                330, 0, 0, 0,  0, 0, 0, 0,
                0, 0, 247, 0,  0, 0, 0, 0,
                0, 0, 0, 0,  294, 0, 0, 0,
                0, 262, 0, 0,  0, 0, 0, 0
            ],
            bass: [
                82, 0, 0, 0,  0, 0, 0, 0,
                0, 0, 0, 0,  110, 0, 0, 0,
                0, 0, 0, 0,  0, 0, 0, 0,
                98, 0, 0, 0,  0, 0, 82, 0
            ]
        },
        // Boss: kept as legacy alias for survival mode
        boss: {
            bpm: 100,
            melodyWave: 'square',
            bassWave: 'sawtooth',
            melodyVol: 0.06,
            bassVol: 0.1,
            melodyDecay: 0.5,
            bassDecay: 1.0,
            useDelay: false,
            melody: [
                196, 0, 233, 0,  262, 0, 233, 196,
                220, 0, 262, 0,  233, 0, 196, 0,
                196, 233, 262, 0, 294, 0, 262, 233,
                196, 0, 220, 196, 175, 0, 196, 0
            ],
            bass: [
                98, 0, 0, 0,   131, 0, 0, 0,
                110, 0, 0, 0,   131, 0, 0, 0,
                98, 0, 0, 0,    131, 0, 0, 0,
                98, 0, 110, 0,  87, 0, 98, 0
            ]
        }
    };

    function startMusic(type = 'game') {
        // Map legacy type names to biomes
        let biome = type;
        if (type === 'game') {
            // Use the player's current world biome
            try { biome = Progress.get().world || 'plains'; } catch (e) { biome = 'plains'; }
        }
        // If same biome music is already playing, do nothing
        if (musicPlaying && currentBiome === biome) return;

        stopMusic();
        if (!musicOn) return;
        try {
            const c = getCtx();
            resumeCtx();

            const theme = BIOME_MUSIC[biome] || BIOME_MUSIC.plains;
            const beatMs = 60000 / theme.bpm;
            currentBiome = biome;

            const masterGain = c.createGain();
            // Fade in over 0.5s
            masterGain.gain.setValueAtTime(0.001, c.currentTime);
            masterGain.gain.linearRampToValueAtTime(MUSIC_VOLUME, c.currentTime + 0.5);

            let outputNode = masterGain;

            // Optional delay effect for snow/end biomes
            let delayNode = null;
            if (theme.useDelay) {
                delayNode = c.createDelay(1.0);
                delayNode.delayTime.value = 0.35;
                const feedback = c.createGain();
                feedback.gain.value = 0.3;
                const wetGain = c.createGain();
                wetGain.gain.value = 0.4;
                // Delay feedback loop
                delayNode.connect(feedback);
                feedback.connect(delayNode);
                // Mix: dry goes to master, wet goes through delay to master
                delayNode.connect(wetGain);
                wetGain.connect(c.destination);
                masterGain.connect(c.destination);
                // outputNode stays as masterGain; delay taps off it
                masterGain.connect(delayNode);
            } else {
                masterGain.connect(c.destination);
            }

            const melody = theme.melody;
            const bass = theme.bass;
            let beat = 0;

            const scheduler = setInterval(() => {
                if (!musicOn) return;
                try {
                    const now = c.currentTime;

                    // Melody note
                    if (melody[beat] > 0) {
                        const osc = c.createOscillator();
                        const g = c.createGain();
                        osc.type = theme.melodyWave;
                        osc.frequency.value = melody[beat];
                        g.gain.setValueAtTime(theme.melodyVol, now);
                        g.gain.exponentialRampToValueAtTime(0.001, now + (beatMs / 1000) * theme.melodyDecay);
                        osc.connect(g);
                        g.connect(masterGain);
                        osc.start(now);
                        osc.stop(now + (beatMs / 1000) * (theme.melodyDecay + 0.1));
                    }

                    // Bass note
                    if (bass[beat] > 0) {
                        const osc = c.createOscillator();
                        const g = c.createGain();
                        osc.type = theme.bassWave;
                        osc.frequency.value = bass[beat];
                        g.gain.setValueAtTime(theme.bassVol, now);
                        g.gain.exponentialRampToValueAtTime(0.001, now + (beatMs / 1000) * theme.bassDecay);
                        osc.connect(g);
                        g.connect(masterGain);
                        osc.start(now);
                        osc.stop(now + (beatMs / 1000) * (theme.bassDecay + 0.1));
                    }

                    beat = (beat + 1) % melody.length;
                } catch (e) {}
            }, beatMs);

            musicNodes = { masterGain, scheduler, delayNode };
            musicPlaying = true;
        } catch (e) {}
    }

    // Switch music to match a biome (called when world changes)
    function switchBiomeMusic(biome) {
        if (!musicPlaying) return;
        if (currentBiome === biome) return;
        startMusic(biome);
    }

    function stopMusic() {
        if (!musicNodes) return;
        try {
            const c = getCtx();
            // Fade out over 0.4s
            musicNodes.masterGain.gain.linearRampToValueAtTime(0.001, c.currentTime + 0.4);
        } catch (e) {}
        clearInterval(musicNodes.scheduler);
        // Clean up delay node if present
        if (musicNodes.delayNode) {
            try { musicNodes.delayNode.disconnect(); } catch (e) {}
        }
        musicNodes = null;
        musicPlaying = false;
        currentBiome = 'plains';
    }

    function setMusicVolume(level) {
        if (!musicNodes) return;
        try {
            const c = getCtx();
            musicNodes.masterGain.gain.linearRampToValueAtTime(level, c.currentTime + 0.15);
        } catch (e) {}
    }

    function duckMusic() {
        setMusicVolume(MUSIC_DUCK_VOLUME);
    }

    function unduckMusic() {
        setMusicVolume(MUSIC_VOLUME);
    }

    // --- TTS (Text-to-Speech) ---
    // iOS Safari workaround: speechSynthesis silently pauses after ~15s.
    // We keep it alive by periodically calling resume() while speaking.
    let ttsKeepAlive = null;

    function startTTSKeepAlive() {
        stopTTSKeepAlive();
        ttsKeepAlive = setInterval(() => {
            if (window.speechSynthesis && window.speechSynthesis.speaking) {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
            }
        }, 5000);
    }

    function stopTTSKeepAlive() {
        if (ttsKeepAlive) { clearInterval(ttsKeepAlive); ttsKeepAlive = null; }
    }

    // V2: Pre-generated TTS cache (Google Cloud Neural voices)
    const _ttsCache = {};
    const _ttsPending = new Set();
    function _tryTTS(key, subdir = 'words', volume = 0.8) {
        const cacheKey = subdir + '/' + key;
        const buf = _ttsCache[cacheKey];
        if (buf) {
            if (!voiceOn) return true;
            const c = getCtx();
            const source = c.createBufferSource();
            source.buffer = buf;
            const gain = c.createGain();
            gain.gain.value = volume;
            source.connect(gain);
            gain.connect(c.destination);
            source.start(0);
            return true;
        }
        if (!_ttsPending.has(cacheKey)) {
            _ttsPending.add(cacheKey);
            const src = `assets/sounds/tts/${subdir}/${key}.mp3`;
            const c = getCtx();
            fetch(src)
                .then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
                .then(b => c.decodeAudioData(b))
                .then(decoded => { _ttsCache[cacheKey] = decoded; })
                .catch(() => {});
        }
        return false;
    }

    function speak(text, mode = 'question') {
        if (!voiceOn) return;

        // V2: Try pre-generated TTS for single words
        const trimmed = (text || '').trim();
        const singleWord = trimmed.split(/\s+/).length === 1 && /^[a-zA-Z]+$/.test(trimmed);
        if (singleWord) {
            const key = trimmed.toLowerCase();
            if (_tryTTS(key, 'words', 0.8) || _tryTTS(key, 'nonsense', 0.8)) return;
        }

        // Full question: try pre-generated MP3
        const qKey = trimmed.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, '-').substring(0, 60);
        if (qKey.length > 5) {
            if (_tryTTS(qKey, 'questions/reading', 0.8) ||
                _tryTTS(qKey, 'questions/math', 0.8) ||
                _tryTTS(qKey, 'feedback', 0.8)) return;
        }

        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        stopTTSKeepAlive();

        // Ensure voices are loaded (retry if first load missed them)
        if (!voicesReady) loadVoices();

        const u = new SpeechSynthesisUtterance(text);
        // Pitch reduced ~0.05 for more natural sound on Fire/Silk
        const profiles = {
            question: { rate: 0.85, pitch: 1.05 },
            excited: { rate: 1.0, pitch: 1.25 },
            gentle: { rate: 0.75, pitch: 0.95 },
            explain: { rate: 0.8, pitch: 0.9 },
            word: { rate: 0.7, pitch: 1.0 }
        };
        const p = profiles[mode] || profiles.question;
        u.rate = p.rate;
        u.pitch = p.pitch;
        u.volume = 0.9;
        if (cachedVoice) u.voice = cachedVoice;

        u.onstart = () => { startTTSKeepAlive(); duckMusic(); };
        u.onend = () => { stopTTSKeepAlive(); unduckMusic(); };
        u.onerror = () => { stopTTSKeepAlive(); unduckMusic(); };

        window.speechSynthesis.speak(u);

        // Retry if speech engine fails to start (common on Fire/Android)
        setTimeout(() => {
            if (window.speechSynthesis && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                try { window.speechSynthesis.speak(u); } catch (e) { /* ignore */ }
            }
        }, 250);
    }

    function speakWord(word) {
        speak(word, 'word');
    }

    // Settings
    function setSoundOn(v) { soundOn = v; }
    function setMusicOn(v) { musicOn = v; if (!v) stopMusic(); }
    function setVoiceOn(v) { voiceOn = v; }

    return {
        resumeCtx, unlockAudio, blockBreak, blockBounce, correct, wrong, click,
        levelUp, achievement, mobHit, bossAppear, mobDefeat, unlock,
        bridgePlace, enchant,
        gemPickup, comboSound, superCombo, victory, defeat, milestone,
        startMusic, stopMusic, switchBiomeMusic, setMusicVolume, duckMusic, unduckMusic,
        speak, speakWord,
        setSoundOn, setMusicOn, setVoiceOn,
        get soundOn() { return soundOn; },
        get musicOn() { return musicOn; },
        get voiceOn() { return voiceOn; },
        get musicPlaying() { return musicPlaying; }
    };
})();
