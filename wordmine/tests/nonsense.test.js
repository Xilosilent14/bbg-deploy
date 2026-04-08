const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadScript } = require('./setup');

loadScript('js/nonsense.js');
const NW = global.NonsenseWords;

const COMMON_REAL_WORDS = new Set([
    'bad', 'bag', 'bat', 'bed', 'bet', 'big', 'bit', 'box', 'bug', 'bus',
    'but', 'cab', 'can', 'cap', 'cat', 'cop', 'cup', 'cut', 'dad', 'did',
    'dig', 'dog', 'dot', 'fan', 'fat', 'fig', 'fin', 'fit', 'fix', 'fog',
    'fox', 'fun', 'gap', 'gas', 'get', 'got', 'gum', 'gun', 'gut', 'had',
    'ham', 'hat', 'hen', 'hid', 'him', 'hip', 'his', 'hit', 'hog', 'hop',
    'hot', 'hub', 'hug', 'hut', 'jab', 'jam', 'jet', 'jig', 'job', 'jog',
    'jug', 'kid', 'kit', 'lab', 'lap', 'led', 'leg', 'let', 'lid', 'lip',
    'lit', 'log', 'lot', 'mad', 'man', 'map', 'mat', 'met', 'mix', 'mob',
    'mom', 'mop', 'mud', 'mug', 'nab', 'nag', 'nap', 'net', 'nip', 'nod',
    'not', 'nut', 'pad', 'pan', 'pat', 'pen', 'pet', 'pig', 'pin', 'pit',
    'pod', 'pop', 'pot', 'pub', 'pug', 'pun', 'pup', 'put', 'rag', 'ram',
    'ran', 'rap', 'rat', 'red', 'rib', 'rid', 'rig', 'rim', 'rip', 'rob',
    'rod', 'rot', 'rub', 'rug', 'run', 'sad', 'sag', 'sap', 'sat', 'set',
    'sin', 'sip', 'sit', 'six', 'sob', 'son', 'sub', 'sum', 'sun', 'tab',
    'tag', 'tan', 'tap', 'ten', 'tin', 'tip', 'ton', 'top', 'tub', 'tug',
    'van', 'vat', 'vet', 'wag', 'was', 'wax', 'web', 'wed', 'wet', 'wig',
    'win', 'wit', 'won', 'yak', 'yam', 'yap', 'yes', 'yet', 'zap', 'zip', 'zoo'
]);

describe('NonsenseWords', () => {
    it('is defined globally', () => {
        assert.ok(NW);
    });

    describe('Curated FORM_WORDS', () => {
        it('has exactly 120 curated words', () => {
            assert.equal(NW.FORM_WORDS.length, 120);
        });

        it('no duplicates', () => {
            const unique = new Set(NW.FORM_WORDS);
            assert.equal(unique.size, NW.FORM_WORDS.length);
        });

        it('all words are 3 characters (CVC)', () => {
            for (const word of NW.FORM_WORDS) {
                assert.equal(word.length, 3, `"${word}" is not 3 chars`);
            }
        });

        it('all words are lowercase', () => {
            for (const word of NW.FORM_WORDS) {
                assert.equal(word, word.toLowerCase());
            }
        });

        it('no words end in l, r, y, or q (FastBridge rule)', () => {
            const forbidden = new Set(['l', 'r', 'y', 'q']);
            for (const word of NW.FORM_WORDS) {
                assert.ok(!forbidden.has(word[2]), `"${word}" ends in forbidden "${word[2]}"`);
            }
        });

        it('no words start with ci- or ce- (FastBridge rule)', () => {
            for (const word of NW.FORM_WORDS) {
                const prefix = word.substring(0, 2);
                assert.ok(prefix !== 'ci' && prefix !== 'ce', `"${word}" has forbidden prefix`);
            }
        });

        it('no common real English words in curated list', () => {
            const found = NW.FORM_WORDS.filter(w => COMMON_REAL_WORDS.has(w));
            assert.equal(found.length, 0, `Real words found: ${found.join(', ')}`);
        });

        it('all words follow CVC pattern', () => {
            const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
            for (const word of NW.FORM_WORDS) {
                assert.ok(!vowels.has(word[0]), `"${word}" starts with vowel`);
                assert.ok(vowels.has(word[1]), `"${word}" middle is not vowel`);
                assert.ok(!vowels.has(word[2]), `"${word}" ends with vowel`);
            }
        });
    });

    describe('Benchmark', () => {
        it('KG Spring benchmark is 12 WPM', () => {
            assert.equal(NW.BENCHMARK_WPM, 12);
        });
    });

    describe('CVC Generator', () => {
        it('generates 3-character strings', () => {
            const word = NW.generateCVC();
            assert.equal(typeof word, 'string');
            assert.equal(word.length, 3);
        });

        it('generated words follow CVC pattern', () => {
            const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
            for (let i = 0; i < 50; i++) {
                const word = NW.generateCVC();
                assert.ok(!vowels.has(word[0]), `"${word}" starts with vowel`);
                assert.ok(vowels.has(word[1]), `"${word}" middle not vowel`);
                assert.ok(!vowels.has(word[2]), `"${word}" ends with vowel`);
            }
        });

        it('no generated words start with ci- or ce-', () => {
            for (let i = 0; i < 100; i++) {
                const w = NW.generateCVC();
                assert.ok(w.substring(0, 2) !== 'ci' && w.substring(0, 2) !== 'ce');
            }
        });
    });

    describe('VC Generator', () => {
        it('generateVC returns 2-character string', () => {
            const word = NW.generateVC();
            assert.equal(word.length, 2);
        });
    });

    describe('Practice Set', () => {
        it('returns requested count', () => {
            assert.equal(NW.getPracticeSet(10).length, 10);
        });

        it('words are unique', () => {
            const set = NW.getPracticeSet(15);
            assert.equal(new Set(set).size, set.length);
        });
    });

    describe('Choices', () => {
        it('includes correct word plus distractors', () => {
            const choices = NW.getChoices('zep', 3);
            assert.equal(choices.length, 4);
            assert.ok(choices.includes('zep'));
        });
    });
});
