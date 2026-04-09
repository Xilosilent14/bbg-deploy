// ===== CAR-DATA.JS UNIT TESTS =====
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// ---- Minimal browser mocks ----
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
};
global.window = {
    addEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {} })
};
global.document = {
    addEventListener: () => {},
    getElementById: () => null,
    createElement: () => ({ set textContent(v) {} })
};

// ---- Load CarData ----
const root = path.join(__dirname, '..');

function loadScript(relPath) {
    let src = fs.readFileSync(path.join(root, relPath), 'utf8');
    src = src.replace(/^const (\w+)\s*=/m, 'var $1 = global.$1 =');
    return src;
}

eval(loadScript('js/car-data.js'));

// ===== TESTS =====

describe('CarData: categories structure', () => {
    const expectedCategories = [
        'corvettes', 'legends', 'modern', 'emergency',
        'wild', 'construction', 'racers', 'neighborhood', 'roadwarriors'
    ];

    it('should have exactly 9 categories', () => {
        assert.equal(Object.keys(CarData.categories).length, 9);
    });

    expectedCategories.forEach(catId => {
        it(`should have category "${catId}" with name, icon, and cars array`, () => {
            const cat = CarData.categories[catId];
            assert.ok(cat, `Missing category: ${catId}`);
            assert.equal(typeof cat.name, 'string', `${catId}.name should be a string`);
            assert.ok(cat.name.length > 0, `${catId}.name should not be empty`);
            assert.equal(typeof cat.icon, 'string', `${catId}.icon should be a string`);
            assert.ok(cat.icon.length > 0, `${catId}.icon should not be empty`);
            assert.ok(Array.isArray(cat.cars), `${catId}.cars should be an array`);
            assert.ok(cat.cars.length > 0, `${catId}.cars should not be empty`);
        });
    });
});

describe('CarData: every car in every category exists in generations', () => {
    Object.entries(CarData.categories).forEach(([catId, cat]) => {
        cat.cars.forEach(carId => {
            it(`category "${catId}" car "${carId}" should exist in generations`, () => {
                assert.ok(
                    CarData.generations[carId],
                    `Car "${carId}" from category "${catId}" not found in generations`
                );
            });
        });
    });
});

describe('CarData: all 50 generations have required fields', () => {
    it('should have exactly 50 car generations', () => {
        assert.equal(Object.keys(CarData.generations).length, 50);
    });

    Object.entries(CarData.generations).forEach(([id, gen]) => {
        it(`generation "${id}" should have name, body, wheels, headlights, taillights, features`, () => {
            assert.equal(typeof gen.name, 'string', `${id}.name should be a string`);
            assert.ok(gen.name.length > 0, `${id}.name should not be empty`);
            assert.ok(Array.isArray(gen.body), `${id}.body should be an array`);
            assert.ok(gen.body.length > 0, `${id}.body should not be empty`);
            assert.ok(gen.wheels && typeof gen.wheels === 'object', `${id}.wheels should be an object`);
            assert.ok(Array.isArray(gen.headlights), `${id}.headlights should be an array`);
            assert.ok(Array.isArray(gen.taillights), `${id}.taillights should be an array`);
            assert.ok(gen.features && typeof gen.features === 'object', `${id}.features should be an object`);
        });
    });
});

describe('CarData: wheels have front, rear, radius, y (all numbers 0-1)', () => {
    Object.entries(CarData.generations).forEach(([id, gen]) => {
        it(`generation "${id}" wheels should have front, rear, radius, y as numbers 0-1`, () => {
            const w = gen.wheels;
            ['front', 'rear', 'radius', 'y'].forEach(prop => {
                assert.equal(typeof w[prop], 'number', `${id}.wheels.${prop} should be a number`);
                assert.ok(w[prop] >= 0 && w[prop] <= 1, `${id}.wheels.${prop} (${w[prop]}) should be 0-1`);
            });
        });
    });
});

describe('CarData: headlights and taillights are arrays with x,y objects', () => {
    Object.entries(CarData.generations).forEach(([id, gen]) => {
        it(`generation "${id}" headlights should be array of {x,y} objects`, () => {
            gen.headlights.forEach((hl, i) => {
                assert.equal(typeof hl.x, 'number', `${id}.headlights[${i}].x should be a number`);
                assert.equal(typeof hl.y, 'number', `${id}.headlights[${i}].y should be a number`);
            });
        });

        it(`generation "${id}" taillights should be array of {x,y} objects`, () => {
            gen.taillights.forEach((tl, i) => {
                assert.equal(typeof tl.x, 'number', `${id}.taillights[${i}].x should be a number`);
                assert.equal(typeof tl.y, 'number', `${id}.taillights[${i}].y should be a number`);
            });
        });
    });
});

describe('CarData: body is an array of path commands', () => {
    const validCommands = ['M', 'L', 'Q', 'C', 'Z'];

    Object.entries(CarData.generations).forEach(([id, gen]) => {
        it(`generation "${id}" body paths should start with M, L, Q, C, or Z`, () => {
            gen.body.forEach((cmd, i) => {
                assert.ok(Array.isArray(cmd), `${id}.body[${i}] should be an array`);
                const op = cmd[0];
                assert.ok(
                    validCommands.includes(op),
                    `${id}.body[${i}] starts with "${op}", expected one of ${validCommands.join(', ')}`
                );
            });
        });
    });
});

describe('CarData: bonusColors structure', () => {
    it('should have exactly 38 bonus colors', () => {
        assert.equal(Object.keys(CarData.bonusColors).length, 38);
    });

    Object.entries(CarData.bonusColors).forEach(([colorId, bc]) => {
        it(`bonusColor "${colorId}" should have gen, name, hex, winsNeeded`, () => {
            assert.equal(typeof bc.gen, 'string', `${colorId}.gen should be a string`);
            assert.equal(typeof bc.name, 'string', `${colorId}.name should be a string`);
            assert.equal(typeof bc.hex, 'string', `${colorId}.hex should be a string`);
            assert.equal(typeof bc.winsNeeded, 'number', `${colorId}.winsNeeded should be a number`);
        });
    });
});

describe('CarData: every bonusColor.gen matches a real generation key', () => {
    Object.entries(CarData.bonusColors).forEach(([colorId, bc]) => {
        it(`bonusColor "${colorId}" gen "${bc.gen}" should exist in generations`, () => {
            assert.ok(
                CarData.generations[bc.gen],
                `bonusColor "${colorId}" references gen "${bc.gen}" which does not exist in generations`
            );
        });
    });
});

describe('CarData: no duplicate car IDs across all categories', () => {
    it('should have no duplicate car IDs', () => {
        const allIds = [];
        Object.values(CarData.categories).forEach(cat => {
            cat.cars.forEach(carId => allIds.push(carId));
        });
        const uniqueIds = new Set(allIds);
        assert.equal(allIds.length, uniqueIds.size,
            `Found ${allIds.length - uniqueIds.size} duplicate car ID(s) across categories`);
    });
});

describe('CarData: all cars have an icon property', () => {
    Object.entries(CarData.generations).forEach(([id, gen]) => {
        it(`generation "${id}" should have an icon (emoji string)`, () => {
            assert.equal(typeof gen.icon, 'string', `${id}.icon should be a string`);
            assert.ok(gen.icon.length > 0, `${id}.icon should not be empty`);
        });
    });
});
