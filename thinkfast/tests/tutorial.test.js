// ===== TUTORIAL.JS UNIT TESTS =====
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

// Track getElementById calls and return element-like stubs
let elementStubs = {};
global.document = {
    addEventListener: () => {},
    getElementById: (id) => elementStubs[id] || null,
    createElement: (tag) => {
        let _text = '';
        return {
            set textContent(v) { _text = v; },
            get innerHTML() { return _text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        };
    }
};

// Stub setTimeout / clearTimeout for _dismissTimer usage
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

// ---- Stub CorvetteRenderer (needed by progress.js validation) ----
global.CorvetteRenderer = {
    generations: { c1: { name: 'C1', icon: '1', unlockLevel: 1, desc: '' } },
    bonusColors: {
        c1_polo_white: { gen: 'c1', name: 'Polo White', hex: '#f5f0e8', winsNeeded: 1 }
    }
};

// ---- Load source files using Function() to put const in global scope ----
const root = path.join(__dirname, '..');

function loadScript(relPath) {
    let src = fs.readFileSync(path.join(root, relPath), 'utf8');
    src = src.replace(/^const (\w+)\s*=/m, 'var $1 = global.$1 =');
    return src;
}

eval(loadScript('js/settings.js'));

// Load Progress — remove the auto-load at the bottom
let progressSrc = loadScript('js/progress.js');
progressSrc = progressSrc.replace(/^Progress\.load\(\);?\s*$/m, '// auto-load disabled for tests');
eval(progressSrc);

// Load Tutorial
eval(loadScript('js/tutorial.js'));

// ---- Helper: create a tutorial-overlay element stub ----
function makeOverlayStub() {
    return {
        innerHTML: '',
        style: { display: '' },
        querySelector: () => null
    };
}

// ---- Helper: fresh progress with optional overrides ----
function freshProgress(overrides) {
    store = {};
    const data = { ...Progress.defaults(), ...overrides };
    localStorage.setItem(Progress.STORAGE_KEY, JSON.stringify(data));
    Progress.load();
    return Progress.data;
}

// ---- Reset Tutorial state before each test ----
function resetTutorial() {
    Tutorial.active = false;
    Tutorial.shownSteps = new Set();
    Tutorial.overlay = null;
    Tutorial._dismissTimer = null;
    timeoutCallbacks = [];
}

// ===== TESTS =====

describe('Tutorial: isNeeded', () => {
    beforeEach(() => {
        resetTutorial();
    });

    it('should return true when tutorialCompleted is false', () => {
        freshProgress({ tutorialCompleted: false });
        assert.equal(Tutorial.isNeeded(), true);
    });

    it('should return false when tutorialCompleted is true', () => {
        freshProgress({ tutorialCompleted: true });
        assert.equal(Tutorial.isNeeded(), false);
    });
});

describe('Tutorial: start', () => {
    beforeEach(() => {
        resetTutorial();
        elementStubs['tutorial-overlay'] = makeOverlayStub();
    });

    it('should set active to true and reset shownSteps', () => {
        freshProgress({ tutorialCompleted: false });
        // Pre-populate shownSteps to verify reset
        Tutorial.shownSteps.add('lanes');
        Tutorial.start();
        assert.equal(Tutorial.active, true);
        assert.equal(Tutorial.shownSteps.size, 0);
    });

    it('should get the tutorial-overlay element', () => {
        freshProgress({ tutorialCompleted: false });
        Tutorial.start();
        assert.notEqual(Tutorial.overlay, null);
    });

    it('should not activate if tutorial is not needed', () => {
        freshProgress({ tutorialCompleted: true });
        Tutorial.start();
        assert.equal(Tutorial.active, false);
    });
});

describe('Tutorial: show', () => {
    beforeEach(() => {
        resetTutorial();
        elementStubs['tutorial-overlay'] = makeOverlayStub();
        freshProgress({ tutorialCompleted: false });
        Tutorial.start();
    });

    it('should track steps in shownSteps Set', () => {
        Tutorial.show('lanes');
        assert.equal(Tutorial.shownSteps.has('lanes'), true);
        assert.equal(Tutorial.shownSteps.size, 1);
    });

    it('should skip already-shown steps', () => {
        Tutorial.show('lanes');
        const overlayBefore = Tutorial.overlay.innerHTML;
        Tutorial.show('lanes');
        // shownSteps should still only have 1 entry
        assert.equal(Tutorial.shownSteps.size, 1);
    });

    it('should do nothing when not active', () => {
        Tutorial.active = false;
        Tutorial.show('lanes');
        assert.equal(Tutorial.shownSteps.size, 0);
    });

    it('should set overlay display to flex', () => {
        Tutorial.show('lanes');
        assert.equal(Tutorial.overlay.style.display, 'flex');
    });

    it('should populate overlay innerHTML with step content', () => {
        Tutorial.show('questions');
        assert.ok(Tutorial.overlay.innerHTML.includes('SPEED BOOST'));
    });

    it('should show multiple different steps', () => {
        Tutorial.show('lanes');
        Tutorial.show('questions');
        assert.equal(Tutorial.shownSteps.size, 2);
        assert.equal(Tutorial.shownSteps.has('lanes'), true);
        assert.equal(Tutorial.shownSteps.has('questions'), true);
    });
});

describe('Tutorial: complete', () => {
    beforeEach(() => {
        resetTutorial();
        elementStubs['tutorial-overlay'] = makeOverlayStub();
        freshProgress({ tutorialCompleted: false });
        Tutorial.start();
    });

    it('should mark progress as tutorialCompleted', () => {
        Tutorial.complete();
        assert.equal(Progress.data.tutorialCompleted, true);
    });

    it('should call Progress.save()', () => {
        // Verify save by checking localStorage contains updated tutorialCompleted
        Tutorial.complete();
        const saved = JSON.parse(localStorage.getItem(Progress.STORAGE_KEY));
        assert.equal(saved.tutorialCompleted, true);
    });

    it('should set active to false', () => {
        Tutorial.complete();
        assert.equal(Tutorial.active, false);
    });

    it('should hide the overlay', () => {
        Tutorial.complete();
        assert.equal(Tutorial.overlay.style.display, 'none');
    });
});

describe('Tutorial: stop', () => {
    beforeEach(() => {
        resetTutorial();
        elementStubs['tutorial-overlay'] = makeOverlayStub();
        freshProgress({ tutorialCompleted: false });
        Tutorial.start();
    });

    it('should set active to false', () => {
        Tutorial.stop();
        assert.equal(Tutorial.active, false);
    });

    it('should hide the overlay', () => {
        Tutorial.stop();
        assert.equal(Tutorial.overlay.style.display, 'none');
    });

    it('should not mark tutorialCompleted', () => {
        Tutorial.stop();
        assert.equal(Progress.data.tutorialCompleted, false);
    });
});

describe('Tutorial: steps data structure', () => {
    it('should have text and icon for each step', () => {
        const stepKeys = Object.keys(Tutorial.steps);
        assert.ok(stepKeys.length > 0, 'steps should not be empty');
        for (const key of stepKeys) {
            const step = Tutorial.steps[key];
            assert.ok(typeof step.text === 'string' && step.text.length > 0,
                `Step "${key}" should have a non-empty text`);
            assert.ok(typeof step.icon === 'string' && step.icon.length > 0,
                `Step "${key}" should have a non-empty icon`);
        }
    });

    it('should have the expected step keys', () => {
        const keys = Object.keys(Tutorial.steps);
        assert.ok(keys.includes('lanes'), 'Should have lanes step');
        assert.ok(keys.includes('questions'), 'Should have questions step');
        assert.ok(keys.includes('obstacles'), 'Should have obstacles step');
        assert.ok(keys.includes('powerups'), 'Should have powerups step');
    });
});
