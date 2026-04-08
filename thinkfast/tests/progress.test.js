// ===== PROGRESS.JS UNIT TESTS (V18) =====
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
    createElement: (tag) => {
        let _text = '';
        return {
            set textContent(v) { _text = v; },
            get innerHTML() { return _text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        };
    }
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
    // Replace leading 'const X =' with 'global.X = X =' so it becomes a global
    src = src.replace(/^const (\w+)\s*=/m, 'var $1 = global.$1 =');
    return src;
}

eval(loadScript('js/settings.js'));

// Progress — remove the auto-load at the bottom
let progressSrc = loadScript('js/progress.js');
progressSrc = progressSrc.replace(/^Progress\.load\(\);?\s*$/m, '// auto-load disabled for tests');
eval(progressSrc);

// ---- Helper functions ----
function loadWithData(overrides) {
    store = {};
    const data = { ...Progress.defaults(), ...overrides };
    localStorage.setItem(Progress.STORAGE_KEY, JSON.stringify(data));
    Progress.load();
    return Progress.data;
}

function freshLoad() {
    store = {};
    Progress.load();
    return Progress.data;
}

// ===== TESTS =====

describe('Progress: defaults', () => {
    it('should return a valid default structure', () => {
        const d = Progress.defaults();
        assert.equal(d.stars, 0);
        assert.equal(d.playerLevel, 1);
        assert.equal(d.carColor, 'red');
        assert.deepEqual(d.carsUnlocked, ['red']);
        assert.deepEqual(d.carUpgrades, { speed: 1, nitro: 1, handling: 1, durability: 1 });
        assert.equal(d.gradeLevel, 'prek');
        assert.equal(d.carType, 'c1');
    });
});

describe('Progress: _validate — numeric clamping', () => {
    it('should clamp stars from negative to 0', () => {
        const d = loadWithData({ stars: -100 });
        assert.equal(d.stars, 0);
    });

    it('should clamp stars from excessive value to 99999', () => {
        const d = loadWithData({ stars: 999999 });
        assert.equal(d.stars, 99999);
    });

    it('should clamp playerLevel from 999 to 40', () => {
        const d = loadWithData({ playerLevel: 999 });
        assert.equal(d.playerLevel, 40);
    });

    it('should clamp playerLevel from 0 to 1', () => {
        const d = loadWithData({ playerLevel: 0 });
        assert.equal(d.playerLevel, 1);
    });

    it('should handle NaN stars by defaulting to 0', () => {
        const d = loadWithData({ stars: NaN });
        assert.equal(d.stars, 0);
    });

    it('should ensure totalCorrect <= totalQuestionsAnswered', () => {
        const d = loadWithData({ totalCorrect: 100, totalQuestionsAnswered: 50 });
        assert.ok(d.totalCorrect <= d.totalQuestionsAnswered);
    });
});

describe('Progress: _validate — car types and colors', () => {
    it('should reset invalid carType to c1', () => {
        const d = loadWithData({ carType: 'hacked_car' });
        assert.equal(d.carType, 'c1');
    });

    it('should filter invalid car colors from carsUnlocked', () => {
        const d = loadWithData({ carsUnlocked: ['red', 'fake_color', 'blue'] });
        assert.ok(!d.carsUnlocked.includes('fake_color'));
        assert.ok(d.carsUnlocked.includes('red'));
        assert.ok(d.carsUnlocked.includes('blue'));
    });

    it('should ensure red is always in carsUnlocked', () => {
        const d = loadWithData({ carsUnlocked: ['blue'] });
        assert.ok(d.carsUnlocked.includes('red'));
    });

    it('should ensure c1 is always in carTypesUnlocked', () => {
        const d = loadWithData({ carTypesUnlocked: ['c3'] });
        assert.ok(d.carTypesUnlocked.includes('c1'));
    });
});

describe('Progress: _validate — carUpgrades', () => {
    it('should remove invalid upgrade keys', () => {
        const d = loadWithData({ carUpgrades: { speed: 3, nitro: 2, handling: 1, durability: 1, hacked: 99 } });
        assert.equal(d.carUpgrades.hacked, undefined);
        assert.equal(d.carUpgrades.speed, 3);
    });

    it('should clamp upgrade values to 1-5', () => {
        const d = loadWithData({ carUpgrades: { speed: 100, nitro: -5, handling: 3, durability: 0 } });
        assert.equal(d.carUpgrades.speed, 5);
        assert.equal(d.carUpgrades.nitro, 1);
        assert.equal(d.carUpgrades.handling, 3);
        assert.equal(d.carUpgrades.durability, 1);
    });
});

describe('Progress: _validate — mods', () => {
    it('should filter invalid mods from modsUnlocked', () => {
        const d = loadWithData({ modsUnlocked: ['big_car', 'fake_mod', 'fire_trail'] });
        assert.ok(!d.modsUnlocked.includes('fake_mod'));
        assert.ok(d.modsUnlocked.includes('big_car'));
        assert.ok(d.modsUnlocked.includes('fire_trail'));
    });

    it('should filter activeMods to only owned mods', () => {
        const d = loadWithData({
            modsUnlocked: ['big_car'],
            activeMods: ['big_car', 'fire_trail'] // fire_trail not owned
        });
        assert.ok(d.activeMods.includes('big_car'));
        assert.ok(!d.activeMods.includes('fire_trail'));
    });
});

describe('Progress: _validate — playerName', () => {
    it('should strip HTML characters from playerName', () => {
        const d = loadWithData({ playerName: '<script>alert(1)</script>' });
        assert.ok(!d.playerName.includes('<'));
        assert.ok(!d.playerName.includes('>'));
    });

    it('should truncate playerName to 20 characters', () => {
        const d = loadWithData({ playerName: 'A'.repeat(50) });
        assert.ok(d.playerName.length <= 20);
    });

    it('should keep valid playerName intact', () => {
        const d = loadWithData({ playerName: 'Buddy' });
        assert.equal(d.playerName, 'Buddy');
    });
});

describe('Progress: _validate — grade level', () => {
    it('should reset invalid gradeLevel', () => {
        const d = loadWithData({ gradeLevel: 'hacked' });
        assert.ok(['prek', 'k', '1st', '2nd'].includes(d.gradeLevel));
    });

    it('should accept 2nd as valid grade level', () => {
        const d = loadWithData({ gradeLevel: '2nd' });
        assert.equal(d.gradeLevel, '2nd');
    });
});

describe('Progress: addStars input validation', () => {
    beforeEach(() => { freshLoad(); });

    it('should reject negative stars', () => {
        const before = Progress.data.stars;
        Progress.addStars(-99);
        assert.equal(Progress.data.stars, before);
    });

    it('should reject NaN stars', () => {
        const before = Progress.data.stars;
        Progress.addStars(NaN);
        assert.equal(Progress.data.stars, before);
    });

    it('should reject Infinity stars', () => {
        const before = Progress.data.stars;
        Progress.addStars(Infinity);
        assert.equal(Progress.data.stars, before);
    });

    it('should accept valid positive stars', () => {
        Progress.addStars(5);
        assert.equal(Progress.data.stars, 5);
    });
});

describe('Progress: addXP input validation', () => {
    beforeEach(() => { freshLoad(); });

    it('should reject negative XP', () => {
        const result = Progress.addXP(-100);
        assert.equal(result.leveledUp, false);
        assert.equal(Progress.data.totalXP, 0);
    });

    it('should reject NaN XP', () => {
        const result = Progress.addXP(NaN);
        assert.equal(result.leveledUp, false);
    });

    it('should accept valid positive XP', () => {
        Progress.addXP(50);
        assert.equal(Progress.data.totalXP, 50);
    });
});

describe('Progress: upgradeStats input validation', () => {
    beforeEach(() => {
        loadWithData({ stars: 100 });
    });

    it('should reject invalid stat names', () => {
        const result = Progress.upgradeStats('hacked');
        assert.equal(result, false);
        assert.equal(Progress.data.carUpgrades.hacked, undefined);
    });

    it('should accept valid stat name', () => {
        const result = Progress.upgradeStats('speed');
        assert.equal(result, true);
        assert.equal(Progress.data.carUpgrades.speed, 2);
    });
});

describe('Progress: recordAnswer input validation', () => {
    beforeEach(() => { freshLoad(); });

    it('should reject invalid subject', () => {
        const before = Progress.data.totalQuestionsAnswered;
        Progress.recordAnswer('hacking', 'counting', true);
        assert.equal(Progress.data.totalQuestionsAnswered, before);
    });

    it('should accept valid math answer', () => {
        Progress.recordAnswer('math', 'counting', true);
        assert.equal(Progress.data.totalQuestionsAnswered, 1);
        assert.equal(Progress.data.totalCorrect, 1);
    });

    it('should accept valid reading answer', () => {
        Progress.recordAnswer('reading', 'letters', false);
        assert.equal(Progress.data.totalQuestionsAnswered, 1);
        assert.equal(Progress.data.totalCorrect, 0);
    });
});

describe('Progress: getXPProgress safety', () => {
    it('should return a value between 0 and 1', () => {
        freshLoad();
        const result = Progress.getXPProgress();
        assert.ok(result >= 0 && result <= 1, `Expected 0-1, got ${result}`);
    });

    it('should return 1 at max level', () => {
        loadWithData({ playerLevel: 40, totalXP: 100000 });
        const result = Progress.getXPProgress();
        assert.equal(result, 1);
    });

    it('should not return NaN', () => {
        loadWithData({ playerLevel: 1, totalXP: 0 });
        const result = Progress.getXPProgress();
        assert.ok(!isNaN(result), 'getXPProgress returned NaN');
    });
});
