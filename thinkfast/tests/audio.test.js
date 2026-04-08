// ===== AUDIO.JS UNIT TESTS =====
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// ---- Minimal browser mocks ----
let store = {};
global.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; }
};

// ---- Tracking variables for AudioContext stubs ----
let createdOscillators = [];
let createdGains = [];
let createdBufferSources = [];
let createdBiquadFilters = [];
let createdBuffers = [];
let contextResumeCount = 0;

// AudioParam-like stub that records method calls
function makeAudioParam(defaultValue) {
    return {
        value: defaultValue || 0,
        setValueAtTime(v) { this.value = v; return this; },
        linearRampToValueAtTime() { return this; },
        exponentialRampToValueAtTime() { return this; }
    };
}

// Stub node with connect/disconnect/start/stop
function makeNode(extras) {
    const node = {
        connect() { return this; },
        disconnect() {},
        start() {},
        stop() {},
        ...extras
    };
    return node;
}

function createMockAudioContext(stateOverride) {
    contextResumeCount = 0;
    createdOscillators = [];
    createdGains = [];
    createdBufferSources = [];
    createdBiquadFilters = [];
    createdBuffers = [];

    return function MockAudioContext() {
        this.currentTime = 0;
        this.sampleRate = 44100;
        this.state = stateOverride || 'running';
        this.destination = {};

        this.resume = () => {
            contextResumeCount++;
            this.state = 'running';
            return Promise.resolve();
        };

        this.createOscillator = () => {
            const osc = makeNode({
                type: 'sine',
                frequency: makeAudioParam(440),
                onended: null,
                _ended: false
            });
            createdOscillators.push(osc);
            return osc;
        };

        this.createGain = () => {
            const gain = makeNode({ gain: makeAudioParam(1) });
            createdGains.push(gain);
            return gain;
        };

        this.createBufferSource = () => {
            const src = makeNode({ buffer: null, loop: false });
            createdBufferSources.push(src);
            return src;
        };

        this.createBiquadFilter = () => {
            const filter = makeNode({
                type: 'lowpass',
                frequency: makeAudioParam(350),
                Q: makeAudioParam(1)
            });
            createdBiquadFilters.push(filter);
            return filter;
        };

        this.createBuffer = (channels, length, sampleRate) => {
            const data = new Float32Array(length);
            const buf = { getChannelData: () => data };
            createdBuffers.push(buf);
            return buf;
        };
    };
}

// ---- Speech synthesis mocks ----
let synthCancelCount = 0;
let synthSpeakCalls = [];
let lastUtterance = null;

function resetSynthMocks() {
    synthCancelCount = 0;
    synthSpeakCalls = [];
    lastUtterance = null;
}

const mockSynth = {
    cancel() { synthCancelCount++; },
    speak(utterance) { synthSpeakCalls.push(utterance); }
};

global.SpeechSynthesisUtterance = function(text) {
    this.text = text;
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.onend = null;
    this.onerror = null;
    lastUtterance = this;
};

// ---- Set up window with all required globals BEFORE loading source ----
global.window = {
    speechSynthesis: mockSynth,
    AudioContext: createMockAudioContext('running'),
    webkitAudioContext: undefined,
    addEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {} })
};

global.document = {
    addEventListener: () => {},
    getElementById: () => null,
    createElement: () => ({ set textContent(v) {} })
};

// ---- Load source files using the same pattern as progress.test.js ----
const root = path.join(__dirname, '..');

function loadScript(relPath) {
    let src = fs.readFileSync(path.join(root, relPath), 'utf8');
    src = src.replace(/^const (\w+)\s*=/m, 'var $1 = global.$1 =');
    return src;
}

// Load Settings first (Audio depends on it)
eval(loadScript('js/settings.js'));

// Load Audio
eval(loadScript('js/audio.js'));

// ---- Helpers ----
function enableAll() {
    Settings.set('sound', true);
    Settings.set('music', true);
    Settings.set('voice', true);
}

function disableAll() {
    Settings.set('sound', false);
    Settings.set('music', false);
    Settings.set('voice', false);
}

function resetAudioState() {
    store = {};
    Settings.load();
    enableAll();
    resetSynthMocks();
    // Reset Audio internal state
    Audio._ctx = null;
    Audio._musicPlaying = null;
    Audio._musicNodes = [];
    Audio._musicGain = null;
    Audio._ambientNodes = [];
    Audio._ambientGain = null;
    Audio._speaking = false;
    Audio.synth = mockSynth;
    // Refresh the AudioContext constructor
    global.window.AudioContext = createMockAudioContext('running');
}

// ===== TESTS =====

describe('Audio: encourageCorrect()', () => {
    beforeEach(() => resetAudioState());

    it('should return a string', () => {
        const result = Audio.encourageCorrect();
        assert.equal(typeof result, 'string');
    });

    it('should return one of the known correct-answer phrases', () => {
        const knownPhrases = [
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
        // Run multiple times to account for randomness
        for (let i = 0; i < 20; i++) {
            const phrase = Audio.encourageCorrect();
            assert.ok(knownPhrases.includes(phrase), `"${phrase}" is not a known correct phrase`);
        }
    });

    it('should call speak() with the returned phrase', () => {
        const phrase = Audio.encourageCorrect();
        // speak() triggers synth.speak with an utterance whose text is the phrase
        assert.ok(synthSpeakCalls.length > 0, 'synth.speak should have been called');
        assert.equal(synthSpeakCalls[synthSpeakCalls.length - 1].text, phrase);
    });
});

describe('Audio: encourageWrong()', () => {
    beforeEach(() => resetAudioState());

    it('should return a string', () => {
        const result = Audio.encourageWrong();
        assert.equal(typeof result, 'string');
    });

    it('should return one of the known wrong-answer phrases', () => {
        const knownPhrases = [
            'Almost!', 'Good try!', 'Keep going!', 'You can do it!',
            'So close!', 'Try the next one!', 'No worries!',
            'Nice effort!', 'Almost there!', 'Keep racing!',
            "Don't give up!", "You'll get it!", 'Next one is yours!',
            'That was tricky!', 'Great effort!', 'Learning is fun!',
            "You're getting closer!", 'Practice makes perfect!',
            "Let's try again!", 'That was a tough one!',
            'Mistakes help you learn!', 'Still racing!',
            'Keep your engine running!', "You're still awesome!"
        ];
        for (let i = 0; i < 20; i++) {
            const phrase = Audio.encourageWrong();
            assert.ok(knownPhrases.includes(phrase), `"${phrase}" is not a known wrong phrase`);
        }
    });

    it('should call speak() with the returned phrase', () => {
        const phrase = Audio.encourageWrong();
        assert.ok(synthSpeakCalls.length > 0, 'synth.speak should have been called');
        assert.equal(synthSpeakCalls[synthSpeakCalls.length - 1].text, phrase);
    });
});

describe('Audio: speak()', () => {
    beforeEach(() => resetAudioState());

    it('should resolve immediately when voice setting is disabled', async () => {
        Settings.set('voice', false);
        const result = await Audio.speak('Hello');
        assert.equal(result, undefined);
        assert.equal(synthSpeakCalls.length, 0, 'synth.speak should NOT have been called');
    });

    it('should resolve immediately when synth is null', async () => {
        Audio.synth = null;
        const result = await Audio.speak('Hello');
        assert.equal(result, undefined);
        assert.equal(synthSpeakCalls.length, 0);
    });

    it('should create an utterance and call synth.speak when voice is enabled', async () => {
        Settings.set('voice', true);
        // Do not await — just start the promise so the utterance is created
        const p = Audio.speak('Test message');
        assert.ok(synthSpeakCalls.length > 0, 'synth.speak should have been called');
        const utt = synthSpeakCalls[0];
        assert.equal(utt.text, 'Test message');
        // Resolve by triggering onend
        utt.onend();
        await p;
    });

    it('should cancel any previous speech before speaking', async () => {
        Settings.set('voice', true);
        const p = Audio.speak('Hello');
        assert.ok(synthCancelCount >= 1, 'synth.cancel should have been called');
        synthSpeakCalls[0].onend();
        await p;
    });

    it('should apply custom rate, pitch, and volume from options', async () => {
        Settings.set('voice', true);
        const p = Audio.speak('Custom', { rate: 1.5, pitch: 0.8, volume: 0.5 });
        const utt = synthSpeakCalls[synthSpeakCalls.length - 1];
        assert.equal(utt.rate, 1.5);
        assert.equal(utt.pitch, 0.8);
        assert.equal(utt.volume, 0.5);
        utt.onend();
        await p;
    });

    it('should use defaults when no options are provided', async () => {
        Settings.set('voice', true);
        const p = Audio.speak('Defaults');
        const utt = synthSpeakCalls[synthSpeakCalls.length - 1];
        assert.equal(utt.rate, 0.9);
        assert.equal(utt.pitch, 1.1);
        assert.equal(utt.volume, 1);
        utt.onend();
        await p;
    });

    it('should resolve when onerror fires instead of onend', async () => {
        Settings.set('voice', true);
        const p = Audio.speak('Error case');
        const utt = synthSpeakCalls[synthSpeakCalls.length - 1];
        utt.onerror();
        await p; // Should resolve, not hang
    });
});

describe('Audio: stopSpeaking()', () => {
    beforeEach(() => resetAudioState());

    it('should call synth.cancel()', () => {
        Audio.stopSpeaking();
        assert.ok(synthCancelCount >= 1, 'synth.cancel should have been called');
    });

    it('should not throw when synth is null', () => {
        Audio.synth = null;
        assert.doesNotThrow(() => Audio.stopSpeaking());
    });
});

describe('Audio: playClick()', () => {
    beforeEach(() => resetAudioState());

    it('should do nothing when sound is disabled', () => {
        Settings.set('sound', false);
        Audio.playClick();
        assert.equal(createdOscillators.length, 0, 'no oscillators should be created');
    });

    it('should create oscillator and gain nodes when sound is enabled', () => {
        Settings.set('sound', true);
        Audio.playClick();
        assert.ok(createdOscillators.length >= 1, 'at least one oscillator should be created');
        assert.ok(createdGains.length >= 1, 'at least one gain node should be created');
    });

    it('should call _getCtx to obtain AudioContext', () => {
        Settings.set('sound', true);
        Audio._ctx = null; // Force fresh context creation
        Audio.playClick();
        assert.ok(Audio._ctx !== null, '_ctx should be initialized after playClick');
    });
});

describe('Audio: startMenuMusic()', () => {
    beforeEach(() => resetAudioState());

    it('should not start when music setting is disabled', () => {
        Settings.set('music', false);
        Audio.startMenuMusic();
        assert.equal(Audio._musicPlaying, null);
    });

    it('should set _musicPlaying to menu when music is enabled', () => {
        Settings.set('music', true);
        Audio.startMenuMusic();
        assert.equal(Audio._musicPlaying, 'menu');
    });

    it('should not restart if already playing menu', () => {
        Settings.set('music', true);
        Audio.startMenuMusic();
        const firstNodeCount = createdOscillators.length;
        // Reset counters but keep state
        createdOscillators = [];
        Audio.startMenuMusic(); // Should bail out early
        assert.equal(createdOscillators.length, 0, 'should not create new oscillators');
        assert.equal(Audio._musicPlaying, 'menu');
    });

    it('should stop existing music before starting menu', () => {
        Settings.set('music', true);
        Audio._musicPlaying = 'race';
        const fakeNode = { stop() {}, disconnect() {} };
        Audio._musicNodes = [fakeNode];
        Audio.startMenuMusic();
        assert.equal(Audio._musicPlaying, 'menu');
    });

    it('should create oscillators for the menu melody', () => {
        Settings.set('music', true);
        Audio.startMenuMusic();
        // V22: Menu loop creates detuned pairs per note (2x oscillators per note)
        assert.ok(createdOscillators.length >= 2, `expected >= 2 oscillators, got ${createdOscillators.length}`);
    });
});

describe('Audio: startRaceMusic()', () => {
    beforeEach(() => resetAudioState());

    it('should not start when music setting is disabled', () => {
        Settings.set('music', false);
        Audio.startRaceMusic();
        assert.equal(Audio._musicPlaying, null);
    });

    it('should set _musicPlaying to race when music is enabled', () => {
        Settings.set('music', true);
        Audio.startRaceMusic();
        assert.equal(Audio._musicPlaying, 'race');
    });

    it('should not restart if already playing race', () => {
        Settings.set('music', true);
        Audio.startRaceMusic();
        createdOscillators = [];
        Audio.startRaceMusic(); // Should bail out early
        assert.equal(createdOscillators.length, 0, 'should not create new oscillators');
        assert.equal(Audio._musicPlaying, 'race');
    });

    it('should create oscillators for the race melody', () => {
        Settings.set('music', true);
        Audio.startRaceMusic();
        // V22: Race loop creates detuned pairs per note (2x oscillators per note)
        assert.ok(createdOscillators.length >= 2, `expected >= 2 oscillators, got ${createdOscillators.length}`);
    });
});

describe('Audio: stopMusic()', () => {
    beforeEach(() => resetAudioState());

    it('should set _musicPlaying to null', () => {
        Audio._musicPlaying = 'menu';
        Audio.stopMusic();
        assert.equal(Audio._musicPlaying, null);
    });

    it('should clear _musicNodes array', () => {
        Audio._musicNodes = [makeNode(), makeNode()];
        Audio.stopMusic();
        assert.deepEqual(Audio._musicNodes, []);
    });

    it('should call stop() and disconnect() on all music nodes', () => {
        let stopCount = 0;
        let disconnectCount = 0;
        const node1 = { stop() { stopCount++; }, disconnect() { disconnectCount++; } };
        const node2 = { stop() { stopCount++; }, disconnect() { disconnectCount++; } };
        Audio._musicNodes = [node1, node2];
        Audio.stopMusic();
        assert.equal(stopCount, 2);
        assert.equal(disconnectCount, 2);
    });

    it('should disconnect and null out _musicGain', () => {
        let gainDisconnected = false;
        Audio._musicGain = { disconnect() { gainDisconnected = true; } };
        Audio.stopMusic();
        assert.equal(gainDisconnected, true);
        assert.equal(Audio._musicGain, null);
    });

    it('should handle nodes that throw on stop() gracefully', () => {
        const badNode = { stop() { throw new Error('already stopped'); }, disconnect() {} };
        Audio._musicNodes = [badNode];
        assert.doesNotThrow(() => Audio.stopMusic());
        assert.deepEqual(Audio._musicNodes, []);
    });
});

describe('Audio: startWeatherAmbient()', () => {
    beforeEach(() => resetAudioState());

    it('should stop existing ambient before starting new one', () => {
        let stopped = false;
        Audio._ambientNodes = [{ stop() { stopped = true; }, disconnect() {} }];
        Audio.startWeatherAmbient('rain');
        assert.ok(stopped, 'previous ambient node should have been stopped');
    });

    it('should do nothing further when sound is disabled', () => {
        Settings.set('sound', false);
        Audio.startWeatherAmbient('rain');
        // stopWeatherAmbient still runs, but no new nodes created
        assert.deepEqual(Audio._ambientNodes, []);
    });

    it('should create buffer source for rain weather', () => {
        Settings.set('sound', true);
        Audio.startWeatherAmbient('rain');
        assert.ok(createdBufferSources.length >= 1, 'should create a buffer source for rain');
        assert.ok(Audio._ambientNodes.length >= 1, 'should store ambient node');
        assert.ok(Audio._ambientGain !== null, 'should set ambient gain');
    });

    it('should create buffer source for sunset weather', () => {
        Settings.set('sound', true);
        Audio.startWeatherAmbient('sunset');
        assert.ok(createdBufferSources.length >= 1, 'should create a buffer source for sunset');
        assert.ok(Audio._ambientNodes.length >= 1);
    });

    it('should create oscillator for neon weather', () => {
        Settings.set('sound', true);
        Audio.startWeatherAmbient('neon');
        assert.ok(createdOscillators.length >= 1, 'should create an oscillator for neon hum');
        assert.ok(Audio._ambientNodes.length >= 1);
    });

    it('should create biquad filter for rain', () => {
        Settings.set('sound', true);
        Audio.startWeatherAmbient('rain');
        assert.ok(createdBiquadFilters.length >= 1, 'rain should use a filter');
    });
});

describe('Audio: stopWeatherAmbient()', () => {
    beforeEach(() => resetAudioState());

    it('should stop and disconnect all ambient nodes', () => {
        let stopCount = 0;
        let disconnectCount = 0;
        Audio._ambientNodes = [
            { stop() { stopCount++; }, disconnect() { disconnectCount++; } },
            { stop() { stopCount++; }, disconnect() { disconnectCount++; } }
        ];
        Audio.stopWeatherAmbient();
        assert.equal(stopCount, 2);
        assert.equal(disconnectCount, 2);
    });

    it('should clear _ambientNodes array', () => {
        Audio._ambientNodes = [makeNode()];
        Audio.stopWeatherAmbient();
        assert.deepEqual(Audio._ambientNodes, []);
    });

    it('should disconnect and null _ambientGain', () => {
        let disconnected = false;
        Audio._ambientGain = { disconnect() { disconnected = true; } };
        Audio.stopWeatherAmbient();
        assert.ok(disconnected);
        assert.equal(Audio._ambientGain, null);
    });

    it('should handle nodes that throw on stop() gracefully', () => {
        Audio._ambientNodes = [{ stop() { throw new Error('fail'); }, disconnect() {} }];
        assert.doesNotThrow(() => Audio.stopWeatherAmbient());
        assert.deepEqual(Audio._ambientNodes, []);
    });
});

describe('Audio: resume()', () => {
    beforeEach(() => resetAudioState());

    it('should call ctx.resume() when context is suspended', () => {
        // Create a context in suspended state
        global.window.AudioContext = createMockAudioContext('suspended');
        Audio._ctx = null;
        // Force creation of context
        Audio._getCtx();
        // Manually set state back to suspended since _getCtx auto-resumes
        Audio._ctx.state = 'suspended';
        contextResumeCount = 0;

        Audio.resume();
        assert.ok(contextResumeCount >= 1, 'resume() should have been called on the context');
    });

    it('should do nothing when context is already running', () => {
        global.window.AudioContext = createMockAudioContext('running');
        Audio._ctx = null;
        Audio._getCtx();
        contextResumeCount = 0;

        Audio.resume();
        assert.equal(contextResumeCount, 0, 'resume() should NOT be called when running');
    });

    it('should do nothing when _ctx is null', () => {
        Audio._ctx = null;
        assert.doesNotThrow(() => Audio.resume());
    });
});

describe('Audio: _getCtx()', () => {
    beforeEach(() => resetAudioState());

    it('should create a new AudioContext on first call', () => {
        Audio._ctx = null;
        const ctx = Audio._getCtx();
        assert.ok(ctx !== null);
        assert.equal(Audio._ctx, ctx);
    });

    it('should reuse existing context on subsequent calls', () => {
        Audio._ctx = null;
        const ctx1 = Audio._getCtx();
        const ctx2 = Audio._getCtx();
        assert.equal(ctx1, ctx2);
    });

    it('should call resume() when context is suspended', () => {
        global.window.AudioContext = createMockAudioContext('suspended');
        Audio._ctx = null;
        Audio._getCtx();
        assert.ok(contextResumeCount >= 1, 'should resume suspended context');
    });
});

describe('Audio: sound effect methods respect Settings', () => {
    beforeEach(() => resetAudioState());

    const soundMethods = [
        'playClick', 'playPowerUp', 'playStarEarn', 'playLaneChange',
        'playCorrect', 'playWrong', 'playNitro', 'playEngine',
        'playVictory', 'playLevelUp', 'playBoom', 'playCountdown',
        'playHit', 'playFanfare', 'playAchievement', 'playTimeWarning',
        'playCheckpoint', 'playPurchase', 'playBreakChime'
    ];

    for (const method of soundMethods) {
        it(`${method}() should do nothing when sound is disabled`, () => {
            Settings.set('sound', false);
            Audio._ctx = null;
            Audio[method](3); // pass arg for methods like playRevving/playStreakChime
            // If sound is disabled, no context should have been created
            assert.equal(Audio._ctx, null, `${method} should not create context when sound off`);
        });
    }

    for (const method of soundMethods) {
        it(`${method}() should create audio nodes when sound is enabled`, () => {
            Settings.set('sound', true);
            Audio._ctx = null;
            Audio[method](3);
            assert.ok(Audio._ctx !== null, `${method} should create context when sound on`);
        });
    }
});

describe('Audio: playRevving()', () => {
    beforeEach(() => resetAudioState());

    it('should do nothing when sound is disabled', () => {
        Settings.set('sound', false);
        Audio.playRevving(3);
        assert.equal(createdOscillators.length, 0);
    });

    it('should create sawtooth oscillator when sound is enabled', () => {
        Settings.set('sound', true);
        Audio.playRevving(3);
        assert.ok(createdOscillators.length >= 1);
    });
});

describe('Audio: playStreakChime()', () => {
    beforeEach(() => resetAudioState());

    it('should do nothing when sound is disabled', () => {
        Settings.set('sound', false);
        Audio.playStreakChime(5);
        assert.equal(createdOscillators.length, 0);
    });

    it('should create oscillators when sound is enabled', () => {
        Settings.set('sound', true);
        Audio.playStreakChime(5);
        // V22: Creates warm notes (multiple oscillators per note via _warmNote)
        assert.ok(createdOscillators.length >= 2, `expected >= 2 oscillators, got ${createdOscillators.length}`);
    });
});

describe('Audio: playCrowdCheer()', () => {
    beforeEach(() => resetAudioState());

    it('should do nothing when sound is disabled', () => {
        Settings.set('sound', false);
        Audio.playCrowdCheer();
        assert.equal(createdBufferSources.length, 0);
    });

    it('should create buffer source and oscillator when sound is enabled', () => {
        Settings.set('sound', true);
        Audio.playCrowdCheer();
        assert.ok(createdBufferSources.length >= 1, 'should create noise buffer');
        assert.ok(createdOscillators.length >= 1, 'should create woo oscillator');
    });
});

describe('Audio: _duckMusic()', () => {
    beforeEach(() => resetAudioState());

    it('should not throw when _musicGain is null', () => {
        Audio._musicGain = null;
        assert.doesNotThrow(() => Audio._duckMusic(true));
        assert.doesNotThrow(() => Audio._duckMusic(false));
    });

    it('should not throw when _ctx is null', () => {
        Audio._ctx = null;
        Audio._musicGain = { gain: makeAudioParam(0.06) };
        assert.doesNotThrow(() => Audio._duckMusic(true));
    });
});

describe('Audio: music switching', () => {
    beforeEach(() => resetAudioState());

    it('should switch from menu to race music', () => {
        Settings.set('music', true);
        Audio.startMenuMusic();
        assert.equal(Audio._musicPlaying, 'menu');
        Audio.startRaceMusic();
        assert.equal(Audio._musicPlaying, 'race');
    });

    it('should switch from race to menu music', () => {
        Settings.set('music', true);
        Audio.startRaceMusic();
        assert.equal(Audio._musicPlaying, 'race');
        Audio.startMenuMusic();
        assert.equal(Audio._musicPlaying, 'menu');
    });

    it('stopMusic then startMenuMusic should work cleanly', () => {
        Settings.set('music', true);
        Audio.startRaceMusic();
        Audio.stopMusic();
        assert.equal(Audio._musicPlaying, null);
        Audio.startMenuMusic();
        assert.equal(Audio._musicPlaying, 'menu');
    });
});

describe('Audio: initial state', () => {
    it('should have synth set from window.speechSynthesis', () => {
        assert.ok(Audio.synth !== undefined);
    });

    it('should have _musicPlaying as null initially after reset', () => {
        resetAudioState();
        assert.equal(Audio._musicPlaying, null);
    });

    it('should have empty _musicNodes after reset', () => {
        resetAudioState();
        assert.deepEqual(Audio._musicNodes, []);
    });

    it('should have empty _ambientNodes after reset', () => {
        resetAudioState();
        assert.deepEqual(Audio._ambientNodes, []);
    });
});
