// ===== CELEBRATION.JS UNIT TESTS =====
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
global.window = {
    addEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {} })
};

// ---- Canvas / context mock ----
function makeCtxStub() {
    return {
        clearRect: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        fillRect: () => {},
        translate: () => {},
        rotate: () => {},
        globalAlpha: 1,
        fillStyle: ''
    };
}

function makeCanvasStub() {
    const ctx = makeCtxStub();
    return {
        getContext: (type) => (type === '2d' ? ctx : null),
        width: 800,
        height: 600,
        offsetWidth: 800,
        offsetHeight: 600,
        _ctx: ctx
    };
}

let canvasStub = makeCanvasStub();
let elementStubs = {};

global.document = {
    addEventListener: () => {},
    getElementById: (id) => {
        if (id === 'celebration-canvas') return canvasStub;
        return elementStubs[id] || null;
    },
    createElement: (tag) => ({ textContent: '' })
};

// ---- requestAnimationFrame / cancelAnimationFrame mocks ----
let rafCallbacks = [];
let nextRafId = 1;
global.requestAnimationFrame = (fn) => {
    const id = nextRafId++;
    rafCallbacks.push({ id, fn });
    return id;
};
global.cancelAnimationFrame = (id) => {
    rafCallbacks = rafCallbacks.filter(r => r.id !== id);
};

// ---- setTimeout / clearTimeout mocks (for fireworks setTimeout) ----
let timeoutCallbacks = [];
let nextTimeoutId = 1;
global.setTimeout = (fn, ms) => {
    const id = nextTimeoutId++;
    timeoutCallbacks.push({ id, fn, ms });
    return id;
};
global.clearTimeout = (id) => {
    timeoutCallbacks = timeoutCallbacks.filter(t => t.id !== id);
};

// ---- Date.now mock ----
let mockNow = 1000;
const _origDateNow = Date.now;
Date.now = () => mockNow;

// ---- Audio mock ----
let audioPlayVictoryCalled = false;
let audioPlayBoomCalled = false;
global.Audio = {
    playVictory: () => { audioPlayVictoryCalled = true; },
    playBoom: () => { audioPlayBoomCalled = true; }
};

// ---- Stub CorvetteRenderer (needed by progress.js -> settings.js chain) ----
global.CorvetteRenderer = {
    generations: { c1: { name: 'C1', icon: '1', unlockLevel: 1, desc: '' } },
    bonusColors: {}
};

// ---- Load source files ----
const root = path.join(__dirname, '..');

function loadScript(relPath) {
    let src = fs.readFileSync(path.join(root, relPath), 'utf8');
    src = src.replace(/^const (\w+)\s*=/m, 'var $1 = global.$1 =');
    return src;
}

eval(loadScript('js/settings.js'));
eval(loadScript('js/celebration.js'));

// ---- Helpers ----
function resetCelebration() {
    Celebration.canvas = null;
    Celebration.ctx = null;
    Celebration.particles = [];
    Celebration.animating = false;
    Celebration._animationId = null;
    canvasStub = makeCanvasStub();
    rafCallbacks = [];
    timeoutCallbacks = [];
    mockNow = 1000;
    audioPlayVictoryCalled = false;
    audioPlayBoomCalled = false;
    Settings.prefersReducedMotion = false;
}

// Flush all pending setTimeout callbacks (synchronously)
function flushTimeouts() {
    const pending = [...timeoutCallbacks];
    timeoutCallbacks = [];
    pending.forEach(t => t.fn());
}

// ===== TESTS =====

describe('Celebration: confetti — reduced motion', () => {
    beforeEach(() => { resetCelebration(); });

    it('should return early when prefersReducedMotion is true', () => {
        Settings.prefersReducedMotion = true;
        Celebration.confetti(3000);
        assert.equal(Celebration.particles.length, 0);
        assert.equal(Celebration.animating, false);
    });

    it('should create particles when prefersReducedMotion is false', () => {
        Settings.prefersReducedMotion = false;
        Celebration.confetti(3000);
        assert.ok(Celebration.particles.length > 0, 'Should have particles');
    });
});

describe('Celebration: fireworks — reduced motion', () => {
    beforeEach(() => { resetCelebration(); });

    it('should return early when prefersReducedMotion is true', () => {
        Settings.prefersReducedMotion = true;
        Celebration.fireworks(4000);
        assert.equal(Celebration.particles.length, 0);
        assert.equal(Celebration.animating, false);
    });

    it('should start animation when prefersReducedMotion is false', () => {
        Settings.prefersReducedMotion = false;
        Celebration.fireworks(4000);
        assert.equal(Celebration.animating, true);
    });
});

describe('Celebration: confetti — particle creation', () => {
    beforeEach(() => { resetCelebration(); });

    it('should create a particles array', () => {
        Celebration.confetti(3000);
        assert.ok(Array.isArray(Celebration.particles));
        assert.ok(Celebration.particles.length > 0);
    });

    it('should cap particles at MAX_PARTICLES (400)', () => {
        Celebration.confetti(3000);
        assert.ok(Celebration.particles.length <= Celebration.MAX_PARTICLES,
            `Particle count ${Celebration.particles.length} should not exceed ${Celebration.MAX_PARTICLES}`);
    });

    it('should create exactly 250 confetti particles', () => {
        Celebration.confetti(3000);
        assert.equal(Celebration.particles.length, 250);
    });

    it('should create particles with expected properties', () => {
        Celebration.confetti(3000);
        const p = Celebration.particles[0];
        assert.ok('x' in p, 'Particle should have x');
        assert.ok('y' in p, 'Particle should have y');
        assert.ok('vx' in p, 'Particle should have vx');
        assert.ok('vy' in p, 'Particle should have vy');
        assert.ok('color' in p, 'Particle should have color');
        assert.ok('size' in p, 'Particle should have size');
        assert.ok('type' in p, 'Particle should have type');
    });
});

describe('Celebration: stop', () => {
    beforeEach(() => { resetCelebration(); });

    it('should set animating to false', () => {
        Celebration.confetti(3000);
        assert.equal(Celebration.animating, true);
        Celebration.stop();
        assert.equal(Celebration.animating, false);
    });

    it('should clear particles array', () => {
        Celebration.confetti(3000);
        assert.ok(Celebration.particles.length > 0);
        Celebration.stop();
        assert.equal(Celebration.particles.length, 0);
    });

    it('should clear canvas via ctx.clearRect', () => {
        let clearRectCalled = false;
        Celebration.confetti(3000);
        // Inject spy on clearRect
        Celebration.ctx.clearRect = () => { clearRectCalled = true; };
        Celebration.stop();
        assert.equal(clearRectCalled, true);
    });

    it('should cancel animation frame', () => {
        Celebration.confetti(3000);
        const animId = Celebration._animationId;
        assert.ok(animId !== null, 'Should have an animation ID');
        Celebration.stop();
        assert.equal(Celebration._animationId, null);
    });
});

describe('Celebration: trophy', () => {
    beforeEach(() => { resetCelebration(); });

    it('should call confetti (particles created)', () => {
        Celebration.trophy();
        assert.ok(Celebration.particles.length > 0, 'trophy should trigger confetti particles');
    });

    it('should call Audio.playVictory', () => {
        Celebration.trophy();
        assert.equal(audioPlayVictoryCalled, true);
    });
});

describe('Celebration: init', () => {
    beforeEach(() => { resetCelebration(); });

    it('should get the celebration-canvas element', () => {
        Celebration.init();
        assert.notEqual(Celebration.canvas, null);
        assert.equal(Celebration.canvas, canvasStub);
    });

    it('should get a 2d context from the canvas', () => {
        Celebration.init();
        assert.notEqual(Celebration.ctx, null);
    });
});

describe('Celebration: fireworks — particle cap enforcement', () => {
    beforeEach(() => { resetCelebration(); });

    it('should not exceed MAX_PARTICLES even with multiple bursts', () => {
        Celebration.fireworks(4000);
        // Flush all setTimeout callbacks to simulate all bursts firing
        flushTimeouts();
        assert.ok(Celebration.particles.length <= Celebration.MAX_PARTICLES,
            `Particle count ${Celebration.particles.length} should not exceed ${Celebration.MAX_PARTICLES}`);
    });
});
