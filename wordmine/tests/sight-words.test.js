const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadScript } = require('./setup');

// Progress must load first (getPracticeSet uses it for grade filtering)
loadScript('js/progress.js');
global.Progress.load();
loadScript('js/sight-words.js');
const SW = global.SightWords;

describe('SightWords', () => {
    it('is defined globally', () => {
        assert.ok(SW);
    });

    describe('Word Banks', () => {
        it('has exactly 50 KG sight words', () => {
            assert.equal(SW.WORDS.length, 50);
        });

        it('has exactly 25 prerequisite words', () => {
            assert.equal(SW.PREREQ_WORDS.length, 25);
        });

        it('has 75 total words', () => {
            assert.equal(SW.ALL_WORDS.length, 75);
        });

        it('ALL_WORDS = WORDS + PREREQ_WORDS', () => {
            assert.equal(SW.ALL_WORDS.length, SW.WORDS.length + SW.PREREQ_WORDS.length);
        });

        it('no duplicate sight words', () => {
            const unique = new Set(SW.WORDS.map(w => w.toLowerCase()));
            assert.equal(unique.size, SW.WORDS.length, 'Duplicates in WORDS');
        });

        it('no duplicate prerequisite words', () => {
            const unique = new Set(SW.PREREQ_WORDS.map(w => w.toLowerCase()));
            assert.equal(unique.size, SW.PREREQ_WORDS.length, 'Duplicates in PREREQ_WORDS');
        });

        it('no overlap between WORDS and PREREQ_WORDS', () => {
            const sight = new Set(SW.WORDS.map(w => w.toLowerCase()));
            const overlap = SW.PREREQ_WORDS.filter(w => sight.has(w.toLowerCase()));
            assert.equal(overlap.length, 0, `Overlap: ${overlap.join(', ')}`);
        });

        it('all words are non-empty strings', () => {
            for (const word of SW.ALL_WORDS) {
                assert.equal(typeof word, 'string');
                assert.ok(word.trim().length > 0);
            }
        });
    });

    describe('Benchmark', () => {
        it('KG Spring benchmark is 13 WPM', () => {
            assert.equal(SW.BENCHMARK_WPM, 13);
        });
    });

    describe('Practice Set', () => {
        it('getPracticeSet returns requested count', () => {
            const set = SW.getPracticeSet(10);
            assert.equal(set.length, 10);
        });

        it('getPracticeSet words are unique', () => {
            const set = SW.getPracticeSet(15);
            const unique = new Set(set);
            assert.equal(unique.size, set.length);
        });

        it('getPracticeSet words come from ALL_WORDS', () => {
            const allSet = new Set(SW.ALL_WORDS.map(w => w.toLowerCase()));
            const set = SW.getPracticeSet(10);
            for (const word of set) {
                assert.ok(allSet.has(word.toLowerCase()), `"${word}" not in ALL_WORDS`);
            }
        });
    });

    describe('Test Set', () => {
        it('getTestSet returns words', () => {
            const set = SW.getTestSet();
            assert.ok(set.length > 0, 'Test set should not be empty');
            assert.ok(set.length <= 50, 'Test set should not exceed WORDS count');
        });
    });

    describe('Shuffle', () => {
        it('shuffle returns same length array', () => {
            const original = [1, 2, 3, 4, 5];
            const shuffled = SW.shuffle(original);
            assert.equal(shuffled.length, original.length);
        });

        it('shuffle does not modify original', () => {
            const original = [1, 2, 3, 4, 5];
            SW.shuffle(original);
            assert.deepEqual(original, [1, 2, 3, 4, 5]);
        });
    });
});
