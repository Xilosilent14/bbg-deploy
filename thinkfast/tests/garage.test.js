// ===== GARAGE.JS UNIT TESTS =====
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

// DOM mock — createElement returns elements with innerHTML, style, className, etc.
const _elements = {};
global.document = {
    addEventListener: () => {},
    getElementById: (id) => _elements[id] || null,
    createElement: (tag) => {
        let _text = '';
        return {
            className: '',
            style: {},
            textContent: '',
            innerHTML: '',
            dataset: {},
            setAttribute: () => {},
            addEventListener: () => {},
            appendChild: () => {},
            querySelectorAll: () => [],
            set textContent(v) { _text = v; },
            get textContent() { return _text; }
        };
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    body: {
        appendChild: () => {}
    }
};

// Provide common DOM elements that Garage.render() expects
['garage-stars', 'garage-options', 'garage-upgrades', 'garage-achievements',
 'garage-cars', 'garage-mods', 'garage-preview', 'garage-car-canvas'].forEach(id => {
    _elements[id] = {
        style: {},
        innerHTML: '',
        textContent: '',
        querySelectorAll: () => [],
        appendChild: () => {},
        getContext: () => ({
            clearRect: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            fill: () => {},
            stroke: () => {},
            save: () => {},
            restore: () => {},
            createLinearGradient: () => ({ addColorStop: () => {} }),
            arc: () => {},
            closePath: () => {},
            fillRect: () => {},
            strokeRect: () => {}
        }),
        width: 300,
        height: 150
    };
});

// ---- Load source files in correct order ----
const root = path.join(__dirname, '..');

function loadScript(relPath) {
    let src = fs.readFileSync(path.join(root, relPath), 'utf8');
    src = src.replace(/^const (\w+)\s*=/m, 'var $1 = global.$1 =');
    return src;
}

// 1. Settings (needed by Progress)
eval(loadScript('js/settings.js'));

// 2. CarData (defines the data)
eval(loadScript('js/car-data.js'));

// 3. CorvetteRenderer stub — uses CarData but stubs rendering methods
global.CorvetteRenderer = {
    generations: CarData.generations,
    categories: CarData.categories,
    bonusColors: CarData.bonusColors,
    drawCar: () => {},
    clearCaches: () => {}
};

// 4. Progress — load with auto-load disabled
let progressSrc = loadScript('js/progress.js');
progressSrc = progressSrc.replace(/^Progress\.load\(\);?\s*$/m, '// auto-load disabled for tests');
eval(progressSrc);

// 5. Audio stub
global.Audio = {
    playClick: () => {},
    playPurchase: () => {},
    playWrong: () => {},
    playCorrect: () => {},
    speak: () => {}
};

// 6. Achievements stub
global.Achievements = {
    getAll: () => [],
    checkAfterUpgrade: () => null
};

// 7. Garage
eval(loadScript('js/garage.js'));

// ---- Helper ----
function freshProgress(overrides) {
    store = {};
    const data = { ...Progress.defaults(), ...overrides };
    localStorage.setItem(Progress.STORAGE_KEY, JSON.stringify(data));
    Progress.load();
    return Progress.data;
}

// ===== TESTS =====

describe('Garage: cars array structure', () => {
    it('should have at least one car', () => {
        assert.ok(Garage.cars.length > 0);
    });

    Garage.cars.forEach(car => {
        it(`car "${car.id}" should have id, name, color, cost`, () => {
            assert.equal(typeof car.id, 'string', `car.id should be a string`);
            assert.ok(car.id.length > 0, `car.id should not be empty`);
            assert.equal(typeof car.name, 'string', `car "${car.id}" name should be a string`);
            assert.ok(car.name.length > 0, `car "${car.id}" name should not be empty`);
            assert.ok(
                typeof car.color === 'string',
                `car "${car.id}" color should be a string`
            );
            assert.equal(typeof car.cost, 'number', `car "${car.id}" cost should be a number`);
            assert.ok(car.cost >= 0, `car "${car.id}" cost should be >= 0`);
        });
    });
});

describe('Garage: car colors are valid hex strings or special values', () => {
    Garage.cars.forEach(car => {
        it(`car "${car.id}" color "${car.color}" should be valid hex or "rainbow"`, () => {
            if (car.color === 'rainbow') {
                assert.equal(car.color, 'rainbow');
            } else {
                assert.ok(
                    /^#[0-9a-fA-F]{3,6}$/.test(car.color),
                    `car "${car.id}" color "${car.color}" is not a valid hex string`
                );
            }
        });
    });
});

describe('Garage: modDefs array structure', () => {
    it('should have at least one mod definition', () => {
        assert.ok(Garage.modDefs.length > 0);
    });

    Garage.modDefs.forEach(mod => {
        it(`mod "${mod.id}" should have id, name, icon, cost, category, desc`, () => {
            assert.equal(typeof mod.id, 'string', `mod.id should be a string`);
            assert.ok(mod.id.length > 0, `mod.id should not be empty`);
            assert.equal(typeof mod.name, 'string', `mod "${mod.id}" name should be a string`);
            assert.ok(mod.name.length > 0, `mod "${mod.id}" name should not be empty`);
            assert.equal(typeof mod.icon, 'string', `mod "${mod.id}" icon should be a string`);
            assert.ok(mod.icon.length > 0, `mod "${mod.id}" icon should not be empty`);
            assert.equal(typeof mod.cost, 'number', `mod "${mod.id}" cost should be a number`);
            assert.ok(mod.cost > 0, `mod "${mod.id}" cost should be > 0`);
            assert.equal(typeof mod.category, 'string', `mod "${mod.id}" category should be a string`);
            assert.ok(['size', 'trail', 'fun'].includes(mod.category),
                `mod "${mod.id}" category "${mod.category}" should be size, trail, or fun`);
            assert.equal(typeof mod.desc, 'string', `mod "${mod.id}" desc should be a string`);
            assert.ok(mod.desc.length > 0, `mod "${mod.id}" desc should not be empty`);
        });
    });
});

describe('Garage: _getColorObj finds base colors by ID', () => {
    it('should find "red" as a base color', () => {
        const obj = Garage._getColorObj('red');
        assert.equal(obj.id, 'red');
        assert.equal(obj.name, 'Classic Red');
        assert.equal(obj.color, '#e94560');
    });

    it('should find "blue" as a base color', () => {
        const obj = Garage._getColorObj('blue');
        assert.equal(obj.id, 'blue');
        assert.equal(obj.name, 'Ocean Blue');
    });

    it('should find "rainbow" as a base color', () => {
        const obj = Garage._getColorObj('rainbow');
        assert.equal(obj.id, 'rainbow');
        assert.equal(obj.color, 'rainbow');
    });
});

describe('Garage: _getColorObj finds bonus colors by ID', () => {
    it('should find bonus color "c1_polo_white"', () => {
        const obj = Garage._getColorObj('c1_polo_white');
        assert.equal(obj.id, 'c1_polo_white');
        assert.equal(obj.name, 'Polo White');
        assert.equal(obj.color, '#f5f0e8');
        assert.equal(obj.cost, 0);
    });

    it('should find bonus color "c8_rapid_blue"', () => {
        const obj = Garage._getColorObj('c8_rapid_blue');
        assert.equal(obj.id, 'c8_rapid_blue');
        assert.equal(obj.name, 'Rapid Blue');
        assert.equal(obj.color, '#1a6fdf');
    });
});

describe('Garage: _getColorObj returns fallback for unknown color', () => {
    it('should return the first car (red) for an unknown color ID', () => {
        const obj = Garage._getColorObj('nonexistent_color_xyz');
        assert.equal(obj.id, 'red');
        assert.equal(obj.name, 'Classic Red');
    });
});

describe('Garage: _checkCarTypeUnlocks unlocks cars at correct level thresholds', () => {
    beforeEach(() => {
        freshProgress();
    });

    it('should not unlock c2 at level 1', () => {
        freshProgress({ playerLevel: 1, carTypesUnlocked: ['c1'] });
        Garage._checkCarTypeUnlocks();
        assert.ok(!Progress.data.carTypesUnlocked.includes('c2'),
            'c2 should not be unlocked at level 1');
    });

    it('should unlock c2 at its unlockLevel (level 3)', () => {
        freshProgress({ playerLevel: 3, carTypesUnlocked: ['c1'] });
        Garage._checkCarTypeUnlocks();
        assert.ok(Progress.data.carTypesUnlocked.includes('c2'),
            'c2 should be unlocked at level 3');
    });

    it('should unlock multiple cars when level is high enough', () => {
        freshProgress({ playerLevel: 10, carTypesUnlocked: ['c1'] });
        Garage._checkCarTypeUnlocks();
        // c1 (1), c2 (3), c3 (5), c4 (7), c5 (9) should all be unlocked
        assert.ok(Progress.data.carTypesUnlocked.includes('c1'));
        assert.ok(Progress.data.carTypesUnlocked.includes('c2'));
        assert.ok(Progress.data.carTypesUnlocked.includes('c3'));
        assert.ok(Progress.data.carTypesUnlocked.includes('c4'));
        assert.ok(Progress.data.carTypesUnlocked.includes('c5'));
    });

    it('should not re-unlock already unlocked car types', () => {
        freshProgress({ playerLevel: 5, carTypesUnlocked: ['c1', 'c2', 'c3'] });
        const before = [...Progress.data.carTypesUnlocked];
        Garage._checkCarTypeUnlocks();
        // No duplicates should be added
        const noDups = new Set(Progress.data.carTypesUnlocked);
        assert.equal(Progress.data.carTypesUnlocked.length, noDups.size,
            'Should not have duplicate car type entries');
    });
});
