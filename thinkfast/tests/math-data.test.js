// ===== MATH-DATA.JS UNIT TESTS (V18) =====
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// ---- Minimal browser mocks ----
global.localStorage = {
    getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {}
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

// ---- Load source ----
const root = path.join(__dirname, '..');

function loadScript(relPath) {
    let src = fs.readFileSync(path.join(root, relPath), 'utf8');
    src = src.replace(/^const (\w+)\s*=/m, 'var $1 = global.$1 =');
    return src;
}

eval(loadScript('js/math-data.js'));

// ===== TESTS =====

describe('MathData: generate valid question structure', () => {
    const allTopics = MathData.topics.map(t => t.id);

    for (const topicId of allTopics) {
        for (let level = 0; level <= 7; level++) {
            it(`${topicId} level ${level} should produce valid structure`, () => {
                const q = MathData.generate(topicId, level);
                assert.ok(q, `generate returned falsy for ${topicId} level ${level}`);
                assert.ok(typeof q.question === 'string', 'question must be a string');
                assert.ok(q.question.length > 0, 'question must not be empty');
                assert.ok(Array.isArray(q.answers), 'answers must be an array');
                assert.ok(q.answers.length >= 2 && q.answers.length <= 6,
                    `answers count ${q.answers.length} out of range for ${topicId} level ${level}`);
                assert.ok(typeof q.correctIndex === 'number', 'correctIndex must be a number');
                assert.ok(q.correctIndex >= 0 && q.correctIndex < q.answers.length,
                    `correctIndex ${q.correctIndex} out of bounds for ${q.answers.length} answers`);
            });
        }
    }
});

describe('MathData: no duplicate answers', () => {
    it('should have unique answers for addition', () => {
        // Run multiple times to catch random duplicates
        for (let i = 0; i < 20; i++) {
            const q = MathData.generate('addition', 2);
            const answerStrings = q.answers.map(String);
            const unique = new Set(answerStrings);
            assert.equal(unique.size, answerStrings.length,
                `Duplicate answers found: ${JSON.stringify(q.answers)} for "${q.question}"`);
        }
    });

    it('should have unique answers for subtraction', () => {
        for (let i = 0; i < 20; i++) {
            const q = MathData.generate('subtraction', 2);
            const answerStrings = q.answers.map(String);
            const unique = new Set(answerStrings);
            assert.equal(unique.size, answerStrings.length,
                `Duplicate answers found: ${JSON.stringify(q.answers)} for "${q.question}"`);
        }
    });
});

describe('MathData: addition answers are correct', () => {
    it('should have mathematically correct answer at correctIndex', () => {
        for (let level = 0; level <= 7; level++) {
            for (let i = 0; i < 10; i++) {
                const q = MathData.generate('addition', level);
                // Parse the question to find the operands
                const match = q.question.match(/(\d+)\s*\+\s*(\d+)/);
                if (match) {
                    const expected = parseInt(match[1]) + parseInt(match[2]);
                    const correctAnswer = q.answers[q.correctIndex];
                    assert.equal(Number(correctAnswer), expected,
                        `${match[1]} + ${match[2]} should be ${expected}, got ${correctAnswer}`);
                }
            }
        }
    });
});

describe('MathData: unknown topic fallback', () => {
    it('should return a valid question for unknown topic', () => {
        const q = MathData.generate('nonexistent_topic', 0);
        assert.ok(q, 'generate should return something for unknown topic');
        assert.ok(q.question, 'fallback should have a question');
        assert.ok(Array.isArray(q.answers), 'fallback should have answers array');
        assert.ok(typeof q.correctIndex === 'number', 'fallback should have correctIndex');
    });
});

describe('MathData: counting level 0 range', () => {
    it('should produce simple counting questions at level 0', () => {
        for (let i = 0; i < 10; i++) {
            const q = MathData.generate('counting', 0);
            assert.ok(q.question, 'counting should produce a question');
            assert.ok(q.answers.length >= 2, 'counting should have at least 2 answers');
        }
    });
});
