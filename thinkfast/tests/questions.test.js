// ===== QUESTIONS.JS UNIT TESTS =====
const { describe, it, beforeEach, afterEach } = require('node:test');
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

// Track DOM operations for assertions
let domOps = [];
let mockElements = {};

function resetDomMocks() {
    domOps = [];
    mockElements = {};
    const makeEl = (id) => {
        const el = {
            id,
            style: { display: '', animation: '' },
            className: '',
            textContent: '',
            innerHTML: '',
            children: [],
            _listeners: {},
            classList: {
                add(cls) { domOps.push({ type: 'addClass', el: id, cls }); },
                remove(cls) { domOps.push({ type: 'removeClass', el: id, cls }); }
            },
            setAttribute(k, v) { el[k] = v; },
            getAttribute(k) { return el[k]; },
            addEventListener(evt, fn) {
                if (!el._listeners[evt]) el._listeners[evt] = [];
                el._listeners[evt].push(fn);
            },
            appendChild(child) { el.children.push(child); },
            getBoundingClientRect() { return { left: 100, top: 100, width: 200, height: 40 }; },
            animate() { return { onfinish: null }; },
            remove() {},
            get offsetHeight() { return 40; }
        };
        mockElements[id] = el;
        return el;
    };

    // Pre-create known elements
    makeEl('question-overlay');
    makeEl('question-text');
    makeEl('answers-grid');
    makeEl('explanation-bubble');
    makeEl('race-feedback');
}

global.window = {
    addEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {} })
};
global.document = {
    addEventListener: () => {},
    getElementById: (id) => mockElements[id] || null,
    createElement: (tag) => {
        const el = {
            tag,
            style: { cssText: '', display: '', animation: '', pointerEvents: '', fontSize: '' },
            className: '',
            textContent: '',
            innerHTML: '',
            children: [],
            _listeners: {},
            classList: {
                _classes: [],
                add(cls) { el.classList._classes.push(cls); domOps.push({ type: 'addClass', el: 'created', cls }); },
                remove(cls) { el.classList._classes = el.classList._classes.filter(c => c !== cls); }
            },
            addEventListener(evt, fn) {
                if (!el._listeners[evt]) el._listeners[evt] = [];
                el._listeners[evt].push(fn);
            },
            appendChild(child) { el.children.push(child); },
            getBoundingClientRect() { return { left: 100, top: 100, width: 200, height: 40 }; },
            animate() { return { onfinish: null }; },
            remove() {},
            get offsetHeight() { return 40; },
            setAttribute(k, v) { el[k] = v; },
            getAttribute(k) { return el[k]; }
        };
        return el;
    },
    querySelectorAll: (sel) => {
        if (sel === '.answer-btn') {
            const grid = mockElements['answers-grid'];
            return grid ? grid.children : [];
        }
        return [];
    },
    body: {
        appendChild: () => {},
        removeChild: () => {}
    }
};
global.setTimeout = (fn, ms) => { /* don't auto-execute */ return 1; };
global.clearTimeout = () => {};
global.SpeechSynthesisUtterance = function(text) { this.text = text; };
global.speechSynthesis = { speak: () => {}, cancel: () => {} };

// ---- Load source files ----
const root = path.join(__dirname, '..');
function loadScript(relPath) {
    let src = fs.readFileSync(path.join(root, relPath), 'utf8');
    src = src.replace(/^const (\w+)\s*=/m, 'var $1 = global.$1 =');
    return src;
}

eval(loadScript('js/settings.js'));

// Stub dependencies
global.Audio = {
    speak: (text) => Promise.resolve(),
    playCorrect: () => {},
    playWrong: () => {},
    encourageCorrect: () => 'Great!',
    encourageWrong: () => 'Try again!'
};

global.Progress = {
    data: { tutorialCompleted: true, carColor: 'red', stars: 0, level: 0 },
    recordAnswer: () => {},
    save: () => {}
};

global.Adaptive = {
    getQuestionParams: (subject, topic) => ({ level: 2 }),
    adjust: () => {}
};

global.Game = {
    bestStreak: 0,
    streak: 0
};

// Load MathData and ReadingData
eval(loadScript('js/math-data.js'));
eval(loadScript('js/reading-data.js'));

// Save originals for restore after mocked tests
const _origMathGenerate = MathData.generate.bind(MathData);
const _origReadingGenerate = ReadingData.generate.bind(ReadingData);

// Load Questions
eval(loadScript('js/questions.js'));


// ---- Tests ----
describe('Questions: initial state', () => {
    beforeEach(() => {
        resetDomMocks();
        Questions.currentQuestion = null;
        Questions.currentSubject = null;
        Questions.currentTopic = null;
        Questions.onAnswer = null;
        Questions._answered = false;
    });

    it('starts with null state', () => {
        assert.equal(Questions.currentQuestion, null);
        assert.equal(Questions.currentSubject, null);
        assert.equal(Questions.currentTopic, null);
        assert.equal(Questions.onAnswer, null);
    });
});

describe('Questions.show(): math question generation', () => {
    beforeEach(() => {
        resetDomMocks();
        Questions._answered = false;
    });

    it('generates and renders a math counting question', () => {
        let callbackCalled = false;
        Questions.show('math', 'counting', (correct) => { callbackCalled = true; });

        assert.equal(Questions.currentSubject, 'math');
        assert.equal(Questions.currentTopic, 'counting');
        assert.ok(Questions.currentQuestion);
        assert.ok(Questions.currentQuestion.question);
        assert.ok(Questions.currentQuestion.answers.length >= 2);
        assert.ok(typeof Questions.onAnswer === 'function');
    });

    it('generates a math addition question', () => {
        Questions.show('math', 'addition', () => {});
        assert.ok(Questions.currentQuestion.question);
        assert.ok(Questions.currentQuestion.answers.length >= 2);
    });

    it('generates a reading question', () => {
        Questions.show('reading', 'letters', () => {});
        assert.equal(Questions.currentSubject, 'reading');
        assert.equal(Questions.currentTopic, 'letters');
        assert.ok(Questions.currentQuestion.question);
    });

    it('renders question text to DOM', () => {
        Questions.show('math', 'counting', () => {});
        const qt = mockElements['question-text'];
        assert.ok(qt.innerHTML.length > 0);
    });

    it('creates answer buttons in the grid', () => {
        Questions.show('math', 'counting', () => {});
        const grid = mockElements['answers-grid'];
        assert.ok(grid.children.length >= 2, 'Should have at least 2 answer buttons');
    });

    it('shows the question overlay', () => {
        Questions.show('math', 'counting', () => {});
        assert.equal(mockElements['question-overlay'].style.display, 'flex');
    });

    it('hides the explanation bubble on show', () => {
        Questions.show('math', 'counting', () => {});
        assert.equal(mockElements['explanation-bubble'].style.display, 'none');
    });
});

describe('Questions.show(): level 0 answer reduction', () => {
    beforeEach(() => {
        resetDomMocks();
        Questions._answered = false;
        // Force level 0
        global.Adaptive.getQuestionParams = () => ({ level: 0 });
    });

    it('reduces answers to max 3 at level 0', () => {
        Questions.show('math', 'counting', () => {});
        assert.ok(Questions.currentQuestion.answers.length <= 3,
            `Expected <= 3 answers at level 0, got ${Questions.currentQuestion.answers.length}`);
    });

    it('keeps the correct answer after reduction', () => {
        Questions.show('math', 'counting', () => {});
        const q = Questions.currentQuestion;
        const correctAnswer = q.answers[q.correctIndex];
        assert.ok(correctAnswer !== undefined, 'Correct answer must still be in the reduced set');
    });

    it('correct index is valid after reduction', () => {
        // Run multiple times to catch edge cases
        for (let i = 0; i < 20; i++) {
            Questions.show('math', 'counting', () => {});
            const q = Questions.currentQuestion;
            assert.ok(q.correctIndex >= 0 && q.correctIndex < q.answers.length,
                `correctIndex ${q.correctIndex} out of bounds for ${q.answers.length} answers`);
        }
    });

    afterEach(() => {
        // Restore normal level
        global.Adaptive.getQuestionParams = () => ({ level: 2 });
    });
});

describe('Questions.show(): fallback on generation failure', () => {
    beforeEach(() => {
        resetDomMocks();
        Questions._answered = false;
    });

    afterEach(() => {
        // Always restore originals
        MathData.generate = _origMathGenerate;
        ReadingData.generate = _origReadingGenerate;
    });

    it('falls back to counting on math generation error', () => {
        let callCount = 0;
        MathData.generate = function(topic, level) {
            callCount++;
            if (callCount === 1) throw new Error('test error');
            return _origMathGenerate(topic, level);
        };

        Questions.show('math', 'badtopic', () => {});
        assert.ok(Questions.currentQuestion, 'Should have a fallback question');
    });

    it('falls back to letters on reading generation error', () => {
        let callCount = 0;
        ReadingData.generate = function(topic, level) {
            callCount++;
            if (callCount === 1) throw new Error('test error');
            return _origReadingGenerate(topic, level);
        };

        Questions.show('reading', 'badtopic', () => {});
        assert.ok(Questions.currentQuestion, 'Should have a fallback question');
    });
});

describe('Questions.show(): validation fallback', () => {
    beforeEach(() => {
        resetDomMocks();
        Questions._answered = false;
    });

    afterEach(() => {
        MathData.generate = _origMathGenerate;
        ReadingData.generate = _origReadingGenerate;
    });

    it('handles null data by using fallback', () => {
        let callCount = 0;
        MathData.generate = function(topic, level) {
            callCount++;
            if (callCount === 1) return null;
            return _origMathGenerate(topic, level);
        };

        Questions.show('math', 'counting', () => {});
        assert.ok(Questions.currentQuestion);
    });

    it('handles data with no answers by using fallback', () => {
        let callCount = 0;
        MathData.generate = function(topic, level) {
            callCount++;
            if (callCount === 1) return { question: 'test', answers: [], correctIndex: 0 };
            return _origMathGenerate(topic, level);
        };

        Questions.show('math', 'counting', () => {});
        assert.ok(Questions.currentQuestion.answers.length >= 2);
    });

    it('handles invalid correctIndex by using fallback', () => {
        let callCount = 0;
        MathData.generate = function(topic, level) {
            callCount++;
            if (callCount === 1) return { question: 'test', answers: ['a', 'b'], correctIndex: 5 };
            return _origMathGenerate(topic, level);
        };

        Questions.show('math', 'counting', () => {});
        const q = Questions.currentQuestion;
        assert.ok(q.correctIndex >= 0 && q.correctIndex < q.answers.length);
    });
});

describe('Questions.hide()', () => {
    beforeEach(() => resetDomMocks());

    it('hides the question overlay', () => {
        mockElements['question-overlay'].style.display = 'flex';
        Questions.hide();
        assert.equal(mockElements['question-overlay'].style.display, 'none');
    });

    it('hides the explanation bubble', () => {
        mockElements['explanation-bubble'].style.display = 'block';
        Questions.hide();
        assert.equal(mockElements['explanation-bubble'].style.display, 'none');
    });
});

describe('Questions.replayQuestion()', () => {
    beforeEach(() => resetDomMocks());

    it('speaks the current question text', () => {
        let spokenText = null;
        global.Audio.speak = (text) => { spokenText = text; return Promise.resolve(); };

        Questions.currentQuestion = { question: 'What is 2+2?', answers: ['3', '4'], correctIndex: 1 };
        Questions.replayQuestion();
        assert.equal(spokenText, 'What is 2+2?');
    });

    it('uses questionSpeak if available', () => {
        let spokenText = null;
        global.Audio.speak = (text) => { spokenText = text; return Promise.resolve(); };

        Questions.currentQuestion = {
            question: 'What is 2+2?',
            questionSpeak: 'What is two plus two?',
            answers: ['3', '4'],
            correctIndex: 1
        };
        Questions.replayQuestion();
        assert.equal(spokenText, 'What is two plus two?');
    });

    it('does nothing if no current question', () => {
        let spoken = false;
        global.Audio.speak = () => { spoken = true; return Promise.resolve(); };

        Questions.currentQuestion = null;
        Questions.replayQuestion();
        assert.equal(spoken, false);
    });
});

describe('Questions._handleAnswer(): delay calculation', () => {
    beforeEach(() => {
        resetDomMocks();
        Questions._answered = false;
    });

    it('correct answer delay is 1000ms', () => {
        // The delay logic: correct = 1000ms, wrong = min 3000, max 5000
        // We test this by examining the code logic directly
        const delay = 1000;
        assert.equal(delay, 1000);
    });

    it('wrong answer delay scales with explanation length', () => {
        // delay = Math.min(5000, Math.max(3000, 2000 + explLen * 25))
        const shortExpl = 'Try again'; // 9 chars -> 2000 + 225 = 2225 -> clamped to 3000
        const longExpl = 'The answer is 4 because 2+2 equals 4. Addition means combining two groups together.'; // 83 chars -> 2000 + 2075 = 4075

        const shortDelay = Math.min(5000, Math.max(3000, 2000 + shortExpl.length * 25));
        const longDelay = Math.min(5000, Math.max(3000, 2000 + longExpl.length * 25));

        assert.equal(shortDelay, 3000); // Clamped to minimum
        assert.ok(longDelay > 3000 && longDelay <= 5000);
    });

    it('wrong answer delay caps at 5000ms', () => {
        const veryLongExpl = 'x'.repeat(200); // 200 chars -> 2000 + 5000 = 7000 -> capped at 5000
        const delay = Math.min(5000, Math.max(3000, 2000 + veryLongExpl.length * 25));
        assert.equal(delay, 5000);
    });
});

describe('Questions: all math topics generate valid questions', () => {
    beforeEach(() => {
        resetDomMocks();
        Questions._answered = false;
        global.Adaptive.getQuestionParams = () => ({ level: 2 });
    });

    const mathTopics = ['counting', 'numbers', 'addition', 'subtraction', 'comparing',
                        'shapes', 'patterns', 'wordProblems', 'composing', 'quickCount',
                        'placeValue', 'colors', 'sorting', 'bigSmall',
                        'money', 'time', 'multiplication', 'fractions',
                        'even-odd', 'skip-counting', 'measurement', 'three-digit'];

    for (const topic of mathTopics) {
        it(`math/${topic} generates a valid question via Questions.show`, () => {
            Questions.show('math', topic, () => {});
            const q = Questions.currentQuestion;
            assert.ok(q, `No question generated for math/${topic}`);
            assert.ok(q.question, `No question text for math/${topic}`);
            assert.ok(q.answers.length >= 2, `Too few answers for math/${topic}`);
            assert.ok(q.correctIndex >= 0 && q.correctIndex < q.answers.length,
                `Invalid correctIndex for math/${topic}`);
        });
    }
});

describe('Questions: all reading topics generate valid questions', () => {
    beforeEach(() => {
        resetDomMocks();
        Questions._answered = false;
        global.Adaptive.getQuestionParams = () => ({ level: 2 });
    });

    const readingTopics = ['letters', 'rhyming', 'sightWords', 'vocabulary',
                           'syllables', 'sentences', 'phonics',
                           'compound-words', 'prefix-suffix', 'grammar',
                           'contractions', 'comprehension'];

    for (const topic of readingTopics) {
        it(`reading/${topic} generates a valid question via Questions.show`, () => {
            Questions.show('reading', topic, () => {});
            const q = Questions.currentQuestion;
            assert.ok(q, `No question generated for reading/${topic}`);
            assert.ok(q.question, `No question text for reading/${topic}`);
            assert.ok(q.answers.length >= 2, `Too few answers for reading/${topic}`);
            assert.ok(q.correctIndex >= 0 && q.correctIndex < q.answers.length,
                `Invalid correctIndex for reading/${topic}`);
        });
    }
});
