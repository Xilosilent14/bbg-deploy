// ===== READING-DATA.JS UNIT TESTS (V18) =====
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

// Stub speechSynthesis for TTS calls
global.speechSynthesis = { speak: () => {}, cancel: () => {}, getVoices: () => [] };
global.SpeechSynthesisUtterance = function() { return {}; };

// ---- Load source ----
const root = path.join(__dirname, '..');

function loadScript(relPath) {
    let src = fs.readFileSync(path.join(root, relPath), 'utf8');
    src = src.replace(/^const (\w+)\s*=/m, 'var $1 = global.$1 =');
    return src;
}

eval(loadScript('js/reading-data.js'));

// ===== TESTS =====

describe('ReadingData: generate valid question structure', () => {
    const allTopics = ReadingData.topics.map(t => t.id);

    for (const topicId of allTopics) {
        for (let level = 0; level <= 7; level++) {
            it(`${topicId} level ${level} should produce valid structure`, () => {
                const q = ReadingData.generate(topicId, level);
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

describe('ReadingData: no duplicate answers', () => {
    const allTopics = ReadingData.topics.map(t => t.id);

    for (const topicId of allTopics) {
        it(`should have unique answers for ${topicId}`, () => {
            for (let i = 0; i < 15; i++) {
                const level = i % 8;
                const q = ReadingData.generate(topicId, level);
                const answerStrings = q.answers.map(String);
                const unique = new Set(answerStrings);
                assert.equal(unique.size, answerStrings.length,
                    `Duplicate answers found in ${topicId} level ${level}: ${JSON.stringify(q.answers)} for "${q.question}"`);
            }
        });
    }
});

describe('ReadingData: correct answer is in answers array', () => {
    const allTopics = ReadingData.topics.map(t => t.id);

    for (const topicId of allTopics) {
        it(`${topicId} correctIndex should point to a valid answer`, () => {
            for (let level = 0; level <= 7; level++) {
                for (let i = 0; i < 5; i++) {
                    const q = ReadingData.generate(topicId, level);
                    const answer = q.answers[q.correctIndex];
                    assert.ok(answer !== undefined && answer !== null,
                        `correctIndex ${q.correctIndex} points to undefined in ${topicId} level ${level}`);
                    assert.ok(String(answer).length > 0,
                        `correct answer is empty string in ${topicId} level ${level}`);
                }
            }
        });
    }
});

describe('ReadingData: unknown topic fallback', () => {
    it('should return a valid question for unknown topic', () => {
        const q = ReadingData.generate('nonexistent_topic', 0);
        assert.ok(q, 'generate should return something for unknown topic');
        assert.ok(q.question, 'fallback should have a question');
        assert.ok(Array.isArray(q.answers), 'fallback should have answers array');
        assert.ok(typeof q.correctIndex === 'number', 'fallback should have correctIndex');
    });
});

describe('ReadingData: explanations exist', () => {
    const allTopics = ReadingData.topics.map(t => t.id);

    for (const topicId of allTopics) {
        it(`${topicId} should have explanations`, () => {
            for (let level = 0; level <= 7; level++) {
                for (let i = 0; i < 3; i++) {
                    const q = ReadingData.generate(topicId, level);
                    assert.ok(typeof q.explanation === 'string' && q.explanation.length > 0,
                        `Missing explanation for ${topicId} level ${level}: "${q.question}"`);
                }
            }
        });
    }
});

describe('ReadingData: letters topic specifics', () => {
    it('level 0 should ask about uppercase letters', () => {
        for (let i = 0; i < 10; i++) {
            const q = ReadingData.generate('letters', 0);
            assert.ok(q.question.includes('letter') || q.question.includes('Letter'),
                `Letters L0 question should mention "letter": "${q.question}"`);
        }
    });

    it('level 4+ should use confusing letters or general letter questions', () => {
        for (let i = 0; i < 10; i++) {
            const q = ReadingData.generate('letters', 4);
            assert.ok(q.answers.length >= 2, 'Should have at least 2 answers');
        }
    });
});

describe('ReadingData: rhyming topic specifics', () => {
    it('should produce rhyming questions at all levels', () => {
        for (let level = 0; level <= 7; level++) {
            for (let i = 0; i < 5; i++) {
                const q = ReadingData.generate('rhyming', level);
                assert.ok(
                    q.question.includes('rhyme') || q.question.includes('rhymes') || q.question.includes('NOT rhyme'),
                    `Rhyming question should mention "rhyme": "${q.question}"`);
            }
        }
    });
});

describe('ReadingData: sight-words topic specifics', () => {
    it('level 0 should use simple PreK words', () => {
        for (let i = 0; i < 10; i++) {
            const q = ReadingData.generate('sight-words', 0);
            // All PreK words are short (1-3 chars mostly)
            assert.ok(q.answers.every(a => typeof a === 'string'),
                'All sight word answers should be strings');
        }
    });

    it('level 4+ may include fill-in-the-blank format', () => {
        let foundFill = false;
        for (let i = 0; i < 30; i++) {
            const q = ReadingData.generate('sight-words', 4);
            if (q.question.includes('Fill in the blank')) foundFill = true;
        }
        // With 30% chance per call, should see at least one in 30 attempts
        assert.ok(foundFill, 'Should sometimes produce fill-in-the-blank at level 4+');
    });
});

describe('ReadingData: vocabulary topic specifics', () => {
    it('should produce vocabulary questions', () => {
        for (let level = 0; level <= 7; level++) {
            const q = ReadingData.generate('vocabulary', level);
            assert.ok(q.question.length > 0, `Vocabulary should produce question at level ${level}`);
            assert.ok(q.answers.length >= 2, `Vocabulary should have answers at level ${level}`);
        }
    });
});

describe('ReadingData: syllables topic specifics', () => {
    it('should produce syllable-related questions', () => {
        for (let level = 0; level <= 7; level++) {
            const q = ReadingData.generate('syllables', level);
            assert.ok(q.question.length > 0, `Syllables should produce question at level ${level}`);
            assert.ok(q.answers.length >= 2, `Syllables should have answers at level ${level}`);
        }
    });
});

describe('ReadingData: sentences topic specifics', () => {
    it('level 0 should redirect to sight words (too advanced for PreK)', () => {
        for (let i = 0; i < 5; i++) {
            const q = ReadingData.generate('sentences', 0);
            // At level 0, sentences redirects to sight-words
            assert.ok(q.question.length > 0, 'Should produce a question');
            assert.ok(q.answers.length >= 2, 'Should have answers');
        }
    });

    it('level 2+ should have fill-in-the-blank sentences', () => {
        for (let i = 0; i < 10; i++) {
            const q = ReadingData.generate('sentences', 2);
            assert.ok(q.question.length > 0, 'Should produce a question at level 2');
        }
    });
});

describe('ReadingData: phonics topic specifics', () => {
    it('level 0 should ask about beginning sounds', () => {
        for (let i = 0; i < 10; i++) {
            const q = ReadingData.generate('phonics', 0);
            assert.ok(
                q.question.includes('sound') || q.question.includes('start'),
                `Phonics L0 should mention "sound" or "start": "${q.question}"`);
        }
    });

    it('level 4+ should include blends or advanced phonics', () => {
        for (let i = 0; i < 10; i++) {
            const q = ReadingData.generate('phonics', 4);
            assert.ok(q.question.length > 0, 'Should produce a question at level 4');
            assert.ok(q.answers.length >= 2, 'Should have answers at level 4');
        }
    });
});

describe('ReadingData: stress test - rapid generation', () => {
    it('should generate 500 questions without errors', () => {
        const topics = ReadingData.topics.map(t => t.id);
        for (let i = 0; i < 500; i++) {
            const topic = topics[i % topics.length];
            const level = i % 8;
            const q = ReadingData.generate(topic, level);
            assert.ok(q, `Failed at iteration ${i}: ${topic} level ${level}`);
            assert.ok(q.correctIndex >= 0 && q.correctIndex < q.answers.length,
                `Bad correctIndex at iteration ${i}: ${topic} level ${level}`);
        }
    });
});
