// ===== ADAPTIVE.JS UNIT TESTS (V18) =====
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
global.document = {
    addEventListener: () => {},
    getElementById: () => null,
    createElement: () => ({ set textContent(v) {}, get innerHTML() { return ''; } })
};

// ---- Stubs ----
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

let progressSrc = loadScript('js/progress.js');
progressSrc = progressSrc.replace(/^Progress\.load\(\);?\s*$/m, '');
eval(progressSrc);

eval(loadScript('js/math-data.js'));
eval(loadScript('js/reading-data.js'));
eval(loadScript('js/adaptive.js'));

// ---- Helper ----
function freshLoad(overrides = {}) {
    store = {};
    const data = { ...Progress.defaults(), ...overrides };
    localStorage.setItem(Progress.STORAGE_KEY, JSON.stringify(data));
    Progress.load();
    return Progress.data;
}

// Simulate N answers with given accuracy for a topic
function simulateAnswers(subject, topic, count, accuracy) {
    for (let i = 0; i < count; i++) {
        const correct = Math.random() < accuracy;
        Progress.recordAnswer(subject, topic, correct);
    }
}

// Force set recent accuracy for a topic
function setRecentAccuracy(subject, topic, values) {
    const key = `${subject}_${topic}`;
    const acc = subject === 'math' ? Progress.data.mathAccuracy : Progress.data.readingAccuracy;
    if (!acc[key]) acc[key] = { correct: 0, total: 0, recent: [] };
    acc[key].recent = values;
    acc[key].total = values.length;
    acc[key].correct = values.filter(v => v === 1).length;
}

// ===== TESTS =====

describe('Adaptive: default levels by grade', () => {
    it('should default prek to level 0', () => {
        freshLoad({ gradeLevel: 'prek' });
        const level = Adaptive.getLevel('math', 'counting');
        assert.equal(level, 0);
    });

    it('should default k to level 2', () => {
        freshLoad({ gradeLevel: 'k' });
        const level = Adaptive.getLevel('math', 'counting');
        assert.equal(level, 2);
    });

    it('should default 1st to level 4', () => {
        freshLoad({ gradeLevel: '1st' });
        const level = Adaptive.getLevel('math', 'counting');
        assert.equal(level, 4);
    });

    it('should default 2nd to level 6', () => {
        freshLoad({ gradeLevel: '2nd' });
        const level = Adaptive.getLevel('math', 'counting');
        assert.equal(level, 6);
    });
});

describe('Adaptive: level bounds', () => {
    it('should not go below level 0', () => {
        freshLoad({ gradeLevel: 'prek' });
        Adaptive.setLevel('math', 'counting', -5);
        assert.equal(Adaptive.getLevel('math', 'counting'), 0);
    });

    it('should not go above level 7', () => {
        freshLoad({ gradeLevel: '2nd' });
        Adaptive.setLevel('math', 'counting', 10);
        assert.equal(Adaptive.getLevel('math', 'counting'), 7);
    });
});

describe('Adaptive: promotion at high accuracy', () => {
    it('should promote when recent accuracy >= 85% with 8+ answers', () => {
        freshLoad({ gradeLevel: 'prek' });
        // Set recent accuracy to 90% (9/10)
        setRecentAccuracy('math', 'counting', [1,1,1,1,1,1,1,1,1,0]);
        Adaptive.resetRaceAdjustments();
        const before = Adaptive.getLevel('math', 'counting');
        Adaptive.adjust('math', 'counting', 0);
        const after = Adaptive.getLevel('math', 'counting');
        assert.equal(after, before + 1);
    });
});

describe('Adaptive: demotion at low accuracy', () => {
    it('should demote when recent accuracy < 45% with 8+ answers', () => {
        freshLoad({ gradeLevel: 'k' });
        // Set level 2, then get low accuracy
        setRecentAccuracy('math', 'counting', [0,0,0,0,0,0,1,0,0,0]); // 10%
        Adaptive.resetRaceAdjustments();
        const before = Adaptive.getLevel('math', 'counting');
        Adaptive.adjust('math', 'counting', 0);
        const after = Adaptive.getLevel('math', 'counting');
        assert.equal(after, before - 1);
    });
});

describe('Adaptive: insufficient data', () => {
    it('should not adjust with fewer than 8 recent answers', () => {
        freshLoad({ gradeLevel: 'k' });
        // Only 5 recent answers, all wrong
        setRecentAccuracy('math', 'counting', [0,0,0,0,0]);
        Adaptive.resetRaceAdjustments();
        const before = Adaptive.getLevel('math', 'counting');
        Adaptive.adjust('math', 'counting', 0);
        const after = Adaptive.getLevel('math', 'counting');
        assert.equal(after, before); // no change
    });
});

describe('Adaptive: one adjustment per topic per race', () => {
    it('should only adjust once per topic per race', () => {
        freshLoad({ gradeLevel: 'prek' });
        setRecentAccuracy('math', 'counting', [1,1,1,1,1,1,1,1,1,1]); // 100%
        Adaptive.resetRaceAdjustments();

        Adaptive.adjust('math', 'counting', 0);
        const afterFirst = Adaptive.getLevel('math', 'counting');
        assert.equal(afterFirst, 1); // promoted once

        Adaptive.adjust('math', 'counting', 0);
        const afterSecond = Adaptive.getLevel('math', 'counting');
        assert.equal(afterSecond, 1); // NOT promoted again
    });
});

describe('Adaptive: resetRaceAdjustments', () => {
    it('should re-enable adjustments after reset', () => {
        freshLoad({ gradeLevel: 'prek' });
        setRecentAccuracy('math', 'counting', [1,1,1,1,1,1,1,1,1,1]);
        Adaptive.resetRaceAdjustments();

        Adaptive.adjust('math', 'counting', 0);
        assert.equal(Adaptive.getLevel('math', 'counting'), 1);

        // Reset and adjust again
        Adaptive.resetRaceAdjustments();
        Adaptive.adjust('math', 'counting', 0);
        assert.equal(Adaptive.getLevel('math', 'counting'), 2);
    });
});

describe('Adaptive: pickWeightedTopic', () => {
    it('should return a valid topic object', () => {
        freshLoad({ gradeLevel: 'k' });
        const topic = Adaptive.pickWeightedTopic('math');
        assert.ok(topic, 'pickWeightedTopic returned falsy');
        assert.ok(topic.id, 'Topic has no id');
        assert.ok(topic.name, 'Topic has no name');
        // Verify it's a real topic
        const validIds = MathData.topics.map(t => t.id);
        assert.ok(validIds.includes(topic.id), `Topic id "${topic.id}" not in valid list`);
    });

    it('should return a valid reading topic', () => {
        freshLoad({ gradeLevel: 'k' });
        const topic = Adaptive.pickWeightedTopic('reading');
        assert.ok(topic, 'pickWeightedTopic returned falsy');
        const validIds = ReadingData.topics.map(t => t.id);
        assert.ok(validIds.includes(topic.id), `Topic id "${topic.id}" not in valid list`);
    });
});
