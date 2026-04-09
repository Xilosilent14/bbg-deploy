// ===== MATH QUESTION DATA V38 =====
const MathData = {
    topics: [
        { id: 'counting', name: 'Counting', icon: '🔢' },
        { id: 'numbers', name: 'Numbers', icon: '🔟' },
        { id: 'addition', name: 'Addition', icon: '➕' },
        { id: 'subtraction', name: 'Subtraction', icon: '➖' },
        { id: 'comparing', name: 'Comparing', icon: '⚖️' },
        { id: 'shapes', name: 'Shapes', icon: '🔷' },
        { id: 'patterns', name: 'Patterns', icon: '🔁' },
        { id: 'word-problems', name: 'Word Problems', icon: '📖' },
        { id: 'decomposing', name: 'Composing', icon: '🧩' },
        { id: 'subitizing', name: 'Quick Count', icon: '⚡' },
        { id: 'place-value', name: 'Place Value', icon: '🏠' },
        { id: 'colors', name: 'Colors', icon: '🎨' },
        { id: 'sorting', name: 'Sorting', icon: '🗂️' },
        { id: 'size', name: 'Big & Small', icon: '📏' },
        // V20: 2nd grade topics
        { id: 'money', name: 'Money', icon: '💰' },
        { id: 'time', name: 'Time', icon: '🕐' },
        { id: 'multiplication', name: 'Multiplication', icon: '✖️' },
        { id: 'fractions', name: 'Fractions', icon: '🍕' },
        { id: 'even-odd', name: 'Even & Odd', icon: '🔢' },
        { id: 'skip-counting', name: 'Skip Counting', icon: '🔄' },
        { id: 'measurement', name: 'Measurement', icon: '📏' },
        { id: 'three-digit', name: 'Big Numbers', icon: '💯' },
        // V38: 3rd grade topics
        { id: 'division', name: 'Division', icon: '➗' },
        { id: 'area-perimeter', name: 'Area & Perimeter', icon: '📐' },
        { id: 'rounding', name: 'Rounding', icon: '🎯' },
        { id: 'function-tables', name: 'Patterns & Rules', icon: '📊' }
    ],

    generate(topic, level) {
        const generators = {
            counting: this._counting,
            numbers: this._numbers,
            addition: this._addition,
            subtraction: this._subtraction,
            comparing: this._comparing,
            shapes: this._shapes,
            patterns: this._patterns,
            'word-problems': this._wordProblems,
            decomposing: this._decomposing,
            subitizing: this._subitizing,
            'place-value': this._placeValue,
            colors: this._colors,
            sorting: this._sorting,
            size: this._size,
            // V20: 2nd grade
            money: this._money,
            time: this._time,
            multiplication: this._multiplication,
            fractions: this._fractions,
            'even-odd': this._evenOdd,
            'skip-counting': this._skipCounting2,
            measurement: this._measurement,
            'three-digit': this._threeDigit,
            // V38: 3rd grade
            division: this._division,
            'area-perimeter': this._areaPerimeter,
            rounding: this._rounding,
            'function-tables': this._functionTables
        };

        const gen = generators[topic];
        if (!gen) return this._addition(level);
        return gen.call(this, level);
    },

    _rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    _shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    _makeWrongAnswers(correct, count, min, max) {
        const wrongs = new Set();
        let attempts = 0;
        while (wrongs.size < count && attempts < 50) {
            const w = this._rand(min, max);
            if (w !== correct) wrongs.add(w);
            attempts++;
        }
        let fill = 1;
        while (wrongs.size < count) {
            // Generate fillers within a reasonable range around correct
            const candidate = correct + fill;
            const candidateNeg = correct - fill;
            if (candidate !== correct && candidate >= min && candidate <= max + 5) wrongs.add(candidate);
            if (wrongs.size < count && candidateNeg !== correct && candidateNeg >= Math.max(0, min)) wrongs.add(candidateNeg);
            fill++;
            if (fill > 50) break; // safety
        }
        return [...wrongs];
    },

    // ---- COUNTING ----
    _counting(level) {
        // V38: 3rd grade counting redirects to skip-counting/patterns
        if (level >= 8) {
            return this._skipCounting3rd(level);
        }
        // V20: 2nd grade counting — count by 2s/5s/10s to 100, backwards, to 1000
        if (level >= 6) {
            return this._counting2nd(level);
        }
        // V5.8: Number before/after/between (FastBridge Number Sequence)
        // Pre-K still gets number sequence (with maxNum=5 inside)
        if (level >= 2 && Math.random() < 0.3) {
            return this._numberSequence(level);
        }
        // V3: Skip counting — K and above only (level >= 2)
        if (level >= 4 && Math.random() < 0.35) {
            return this._skipCounting(level);
        } else if (level >= 2 && Math.random() < 0.25) {
            return this._skipCounting(level);
        }

        // Pre-K (level 0-1): count 1-5 objects only
        if (level < 2) {
            const count = this._rand(1, 5);
            const emoji = ['🍎', '⭐', '🚗', '🐶', '🎈'][this._rand(0, 4)];
            const objects = Array(count).fill(emoji).join('  ');

            const correct = count;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, count - 2), count + 2);
            const answers = this._shuffle([correct, ...wrongs]);

            return {
                question: `How many ${emoji} do you see?\n${objects}`,
                questionSpeak: `How many do you see? Count them!`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'counting',
                subtype: 'count-objects',
                explanation: `Let's count together! ${Array.from({length: count}, (_, i) => i + 1).join(', ')}. There are ${count} ${emoji}!`,
                explanationSpeak: `Let's count together! ${Array.from({length: count}, (_, i) => i + 1).join(', ')}. There are ${count}!`
            };
        }

        const maxNum = level < 4 ? 10 : 20;
        const count = this._rand(1, maxNum);
        const emoji = ['🍎', '⭐', '🚗', '🏈', '🐶', '🎈'][this._rand(0, 5)];
        const objects = Array(count).fill(emoji).join(' ');

        const correct = count;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, count - 3), count + 3);
        const answers = this._shuffle([correct, ...wrongs]);

        return {
            question: `How many ${emoji} do you see?\n${objects}`,
            questionSpeak: `How many do you see? Count them!`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'counting',
            subtype: 'count-objects',
            explanation: `Let's count together! ${Array.from({length: count}, (_, i) => i + 1).join(', ')}. There are ${count} ${emoji}!`,
            explanationSpeak: `Let's count together! ${Array.from({length: count}, (_, i) => i + 1).join(', ')}. There are ${count}!`
        };
    },

    // Skip counting (V3: by 2s, V5.2: by 5s and 10s) — K (level 2-3) and above only
    _skipCounting(level) {
        // Level 2-3 (K): count by 2s, Level 4 (1st): add by 5s, Level 5 (1st): add by 10s
        let step, stepWord;
        if (level >= 5 && Math.random() < 0.4) {
            step = 10; stepWord = 'tens';
        } else if (level >= 4 && Math.random() < 0.5) {
            step = 5; stepWord = 'fives';
        } else {
            step = 2; stepWord = 'twos';
        }

        let start;
        if (step === 2) {
            start = level <= 4 ? 2 : this._rand(1, 3) * 2;
        } else if (step === 5) {
            start = this._rand(1, 3) * 5;
        } else {
            start = this._rand(1, 3) * 10;
        }

        const count = level <= 4 ? 3 : 4;
        const sequence = [];
        for (let i = 0; i < count; i++) sequence.push(start + i * step);
        const correct = start + count * step;

        const display = sequence.map(String).join(', ') + ', ___';
        const wrongs = this._makeWrongAnswers(correct, 3, correct - step * 2, correct + step * 2);
        const answers = this._shuffle([correct, ...wrongs]);

        return {
            question: `Count by ${step}s:\n${display}`,
            questionSpeak: `Count by ${stepWord}. What comes next? ${sequence.join(', ')}`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'counting',
            subtype: 'skip-count',
            explanation: `Counting by ${step}s: ${sequence.join(', ')}, ${correct}! Each number is ${step} more!`,
            explanationSpeak: `Counting by ${stepWord}: ${sequence.join(', ')}, ${correct}! Each number is ${step} more!`
        };
    },

    // V5.8: Number before/after/between (FastBridge Number Sequence)
    _numberSequence(level) {
        const maxNum = level < 2 ? 5 : level < 4 ? 10 : 20;
        const format = Math.random();

        if (format < 0.35) {
            // "What comes AFTER N?"
            const n = this._rand(0, maxNum - 1);
            const correct = n + 1;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, n - 2), n + 4);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `What number comes\nright AFTER ${n}?`,
                questionSpeak: `What number comes right after ${n}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'counting',
                subtype: 'count-after',
                explanation: `${n}, then ${correct} comes next! ${correct} is 1 more than ${n}!`,
                explanationSpeak: `${correct} comes right after ${n}!`
            };
        } else if (format < 0.7) {
            // "What comes BEFORE N?"
            const n = this._rand(1, maxNum);
            const correct = n - 1;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, n - 4), n + 2);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `What number comes\nright BEFORE ${n}?`,
                questionSpeak: `What number comes right before ${n}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'counting',
                subtype: 'count-before',
                explanation: `${correct} comes right before ${n}! ${correct}, ${n}!`,
                explanationSpeak: `${correct} comes right before ${n}!`
            };
        } else {
            // "What number is BETWEEN A and C?"
            const a = this._rand(0, maxNum - 2);
            const correct = a + 1;
            const c = a + 2;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, a - 2), c + 2);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `What number is between\n${a} and ${c}?`,
                questionSpeak: `What number is between ${a} and ${c}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'counting',
                subtype: 'count-between',
                explanation: `${a}, ${correct}, ${c}! ${correct} is between ${a} and ${c}!`,
                explanationSpeak: `${correct} is between ${a} and ${c}!`
            };
        }
    },

    // ---- NUMBER RECOGNITION ----
    _numbers(level) {
        // V20: 2nd grade — 3-digit number reading
        if (level >= 6) {
            return this._threeDigit(level);
        }
        const maxNum = level < 2 ? 5 : level < 4 ? 10 : 20;
        const target = this._rand(0, maxNum);
        const words = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
            'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];

        const templateType = this._rand(0, level < 2 ? 3 : 3);

        if (templateType === 0) {
            // "Which number is [word]?"
            const wrongs = this._makeWrongAnswers(target, 3, Math.max(0, target - 4), Math.min(maxNum, target + 4));
            const answers = this._shuffle([target, ...wrongs]);
            return {
                question: `Which number is "${words[target]}"?`,
                questionSpeak: `Which number is ${words[target]}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(target),
                topic: 'numbers',
                subtype: 'word-to-number',
                explanation: `The word "${words[target]}" means the number ${target}!`,
                explanationSpeak: `The word ${words[target]} means the number ${target}!`
            };
        } else if (templateType === 1) {
            // "What is the name for N?"
            const wrongs = this._makeWrongAnswers(target, 3, Math.max(0, target - 4), Math.min(maxNum, target + 4));
            const answers = this._shuffle([target, ...wrongs]);
            return {
                question: `What is the name for ${target}?`,
                questionSpeak: `What is the name for ${target}?`,
                answers: answers.map(n => words[n]),
                correctIndex: answers.indexOf(target),
                topic: 'numbers',
                subtype: 'number-to-word',
                explanation: `The number ${target} is called "${words[target]}"!`,
                explanationSpeak: `The number ${target} is called ${words[target]}!`
            };
        } else if (templateType === 2) {
            // "What comes after N?" / "What comes before N?"
            const isBefore = Math.random() < 0.5 && target > 0;
            if (isBefore) {
                const correct = target - 1;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 3), Math.min(maxNum, correct + 3));
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `What number comes just BEFORE ${target}?`,
                    questionSpeak: `What number comes just before ${target}?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'numbers',
                    subtype: 'before-after',
                    explanation: `${correct} comes right before ${target}! ${correct}, ${target}!`,
                    explanationSpeak: `${correct} comes right before ${target}!`
                };
            } else {
                const correct = target + 1;
                if (correct > 20) return this._numbers(level); // retry
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 3), Math.min(maxNum + 1, correct + 3));
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `What number comes just AFTER ${target}?`,
                    questionSpeak: `What number comes just after ${target}?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'numbers',
                    subtype: 'before-after',
                    explanation: `${correct} comes right after ${target}! ${target}, ${correct}!`,
                    explanationSpeak: `${correct} comes right after ${target}!`
                };
            }
        } else {
            // "Show me N" with emoji groups (visual counting)
            const emoji = ['🍎', '⭐', '🐶', '🎈', '🍪'][this._rand(0, 4)];
            const correct = target;
            // Generate 4 different counts to show as answer choices
            const options = [target];
            while (options.length < 4) {
                const n = this._rand(Math.max(0, target - 3), Math.min(maxNum, target + 3));
                if (!options.includes(n)) options.push(n);
            }
            const answers = this._shuffle(options);
            return {
                question: `Which group shows ${target}?`,
                questionSpeak: `Which group shows ${target}?`,
                answers: answers.map(n => n === 0 ? '(none)' : Array(n).fill(emoji).join(' ')),
                correctIndex: answers.indexOf(correct),
                topic: 'numbers',
                subtype: 'visual-match',
                explanation: `${target === 0 ? 'Zero means none!' : Array(target).fill(emoji).join(' ') + ' — that is ' + target + '!'}`,
                explanationSpeak: `That group has ${target}!`
            };
        }
    },

    // ---- ADDITION ----
    _addition(level) {
        // V38: 3rd grade addition — 3-digit with regrouping
        if (level >= 8) {
            return this._addition3rd(level);
        }
        // V20: 2nd grade addition — 2-digit + 2-digit with regrouping
        if (level >= 6) {
            return this._addition2nd(level);
        }
        // V3: Missing addend format at 1st grade levels
        if (level >= 4 && Math.random() < 0.3) {
            return this._missingAddend(level);
        }

        // V37: "Doubles" format (20% at K+)
        if (level >= 2 && Math.random() < 0.2) {
            const maxDouble = level < 4 ? 5 : 10;
            const n = this._rand(1, maxDouble);
            const correct = n + n;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 3), correct + 3);
            const answers = this._shuffle([correct, ...wrongs]);
            const emoji = ['🍎', '⭐', '🧁', '🎈', '🍪', '🐶', '🦋', '🚗'][this._rand(0, 7)];
            const group = Array(n).fill(emoji).join('');
            return {
                question: `Double it!\n${group} + ${group} = ?`,
                questionSpeak: `Double it! What is ${n} plus ${n}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'addition',
                subtype: 'doubles',
                explanation: `${n} + ${n} = ${correct}! Doubles are easy to remember!`,
                explanationSpeak: `${n} plus ${n} equals ${correct}! Doubles are a great trick to remember!`
            };
        }

        // V37: "How many altogether?" story format (15% at K+)
        if (level >= 2 && Math.random() < 0.18) {
            const maxNum = level < 4 ? 5 : 10;
            const a = this._rand(1, Math.floor(maxNum * 0.6));
            const b = this._rand(1, maxNum - a);
            const correct = a + b;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 2), correct + 3);
            const answers = this._shuffle([correct, ...wrongs]);
            const scenarios = [
                { emoji: '🍎', place: 'basket', line: `${a} ${Array(a).fill('🍎').join('')} in one basket\n${b} ${Array(b).fill('🍎').join('')} in another basket` },
                { emoji: '🐶', place: 'yard', line: `${a} ${Array(a).fill('🐶').join('')} in the front yard\n${b} ${Array(b).fill('🐶').join('')} in the back yard` },
                { emoji: '⭐', place: 'sky', line: `${a} ${Array(a).fill('⭐').join('')} on the left\n${b} ${Array(b).fill('⭐').join('')} on the right` },
                { emoji: '🧁', place: 'plate', line: `${a} ${Array(a).fill('🧁').join('')} on one plate\n${b} ${Array(b).fill('🧁').join('')} on another plate` }
            ];
            const s = scenarios[this._rand(0, scenarios.length - 1)];
            return {
                question: `${s.line}\nHow many altogether?`,
                questionSpeak: `${a} in one group and ${b} in another group. How many altogether?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'addition',
                subtype: 'altogether',
                explanation: `${a} + ${b} = ${correct} altogether!`,
                explanationSpeak: `${a} plus ${b} equals ${correct} altogether!`
            };
        }

        // Pre-K (level 0-1): visual emoji addition, sums ≤ 5
        if (level < 2) {
            const a = this._rand(1, 4);
            const b = this._rand(1, 5 - a);
            const correct = a + b;
            const emoji = ['🍎', '🍪', '⭐', '🐶', '🦋', '🧁', '🎈', '🚗', '🦕', '🌮', '🍌', '🐱', '🐸', '🌻', '🍓'][this._rand(0, 14)];
            const groupA = Array(a).fill(emoji).join('');
            const groupB = Array(b).fill(emoji).join('');
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 2), correct + 2);
            const answers = this._shuffle([correct, ...wrongs]);

            return {
                question: `${groupA} + ${groupB} = ?`,
                questionSpeak: `How many altogether? ${a} plus ${b}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'addition',
                subtype: 'visual',
                explanation: `${groupA} plus ${groupB} equals ${correct}! ${a} + ${b} = ${correct}!`,
                explanationSpeak: `${a} plus ${b} equals ${correct}!`
            };
        }

        let a, b;
        if (level <= 3) {
            a = this._rand(0, 5);
            b = this._rand(0, 5 - a);
        } else {
            a = this._rand(0, 10);
            b = this._rand(0, 10 - a);
        }
        // Prevent trivial 0+0=0
        if (a === 0 && b === 0) a = this._rand(1, level <= 3 ? 5 : 10);
        const correct = a + b;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 3), correct + 3);
        const answers = this._shuffle([correct, ...wrongs]);

        const emoji = '🍎';
        const groupA = Array(a).fill(emoji).join('');
        const groupB = Array(b).fill(emoji).join('');

        return {
            question: `${a} + ${b} = ?`,
            questionSpeak: `What is ${a} plus ${b}?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'addition',
            subtype: 'basic',
            explanation: `${a} + ${b} = ${correct}. ${a > 0 ? groupA : ''} plus ${b > 0 ? groupB : ''} equals ${correct}!`,
            explanationSpeak: `${a} plus ${b} equals ${correct}. If you have ${a} apples and get ${b} more, you have ${correct}!`
        };
    },

    // Missing addend: "3 + ___ = 5" (V3)
    _missingAddend(level) {
        const maxSum = level <= 4 ? 10 : 15;
        const total = this._rand(3, maxSum);
        const a = this._rand(1, total - 1);
        const correct = total - a;

        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 3), correct + 4);
        const answers = this._shuffle([correct, ...wrongs]);

        return {
            question: `${a} + ___ = ${total}`,
            questionSpeak: `${a} plus what equals ${total}?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'addition',
            subtype: 'missing-addend',
            explanation: `${a} + ${correct} = ${total}. We need ${correct} more to get from ${a} to ${total}!`,
            explanationSpeak: `${a} plus ${correct} equals ${total}. We need ${correct} more to get from ${a} to ${total}!`
        };
    },

    // ---- SUBTRACTION ----
    _subtraction(level) {
        // V38: 3rd grade subtraction — 3-digit with regrouping
        if (level >= 8) {
            return this._subtraction3rd(level);
        }
        // V20: 2nd grade subtraction — 2-digit with regrouping
        if (level >= 6) {
            return this._subtraction2nd(level);
        }
        // V5.7: Missing subtrahend — 1st grade only
        if (level >= 4 && Math.random() < 0.3) {
            return this._missingSubtrahend(level);
        }

        // V37: "Count back" number line format (15% at K+)
        if (level >= 2 && Math.random() < 0.15) {
            const maxNum = level < 4 ? 10 : 15;
            const start = this._rand(4, maxNum);
            const countBack = this._rand(1, 3);
            const correct = start - countBack;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 2), correct + 3);
            const answers = this._shuffle([correct, ...wrongs]);
            const numLine = [];
            for (let i = Math.max(0, correct - 2); i <= start + 1 && i <= maxNum; i++) numLine.push(i);
            return {
                question: `Count BACK ${countBack} from ${start}:\n${numLine.join(' - ')}\nWhere do you land?`,
                questionSpeak: `Start at ${start} and count back ${countBack}. Where do you land?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'subtraction',
                subtype: 'count-back',
                explanation: `${start} count back ${countBack} = ${correct}! ${start}${countBack >= 1 ? ', ' + (start - 1) : ''}${countBack >= 2 ? ', ' + (start - 2) : ''}${countBack >= 3 ? ', ' + (start - 3) : ''}!`,
                explanationSpeak: `Starting at ${start} and counting back ${countBack} gives us ${correct}!`
            };
        }

        // V37: "How many MORE?" comparison subtraction (15% at K+)
        if (level >= 2 && Math.random() < 0.18) {
            const maxNum = level < 4 ? 8 : 12;
            const big = this._rand(3, maxNum);
            const small = this._rand(1, big - 1);
            const correct = big - small;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 2), correct + 3);
            const answers = this._shuffle([correct, ...wrongs]);
            const emojis = ['🍎', '⭐', '🍪', '🎈', '🧁', '🐶'];
            const emoji = emojis[this._rand(0, emojis.length - 1)];
            const groupBig = Array(big).fill(emoji).join('');
            const groupSmall = Array(small).fill(emoji).join('');
            const names = ['Tom', 'Sara', 'Mia', 'Jake', 'Ben', 'Lily'];
            const n1 = names[this._rand(0, names.length - 1)];
            let n2;
            do { n2 = names[this._rand(0, names.length - 1)]; } while (n2 === n1);
            return {
                question: `${n1}: ${groupBig}\n${n2}: ${groupSmall}\nHow many MORE does ${n1} have?`,
                questionSpeak: `${n1} has ${big} and ${n2} has ${small}. How many more does ${n1} have?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'subtraction',
                subtype: 'how-many-more',
                explanation: `${big} - ${small} = ${correct}. ${n1} has ${correct} more!`,
                explanationSpeak: `${big} minus ${small} equals ${correct}. ${n1} has ${correct} more!`
            };
        }

        // Pre-K (level 0-1): visual subtraction, a from 2-5, two template types
        if (level < 2) {
            const emojis = ['🍪', '🍎', '⭐', '🎈', '🐶', '🍌', '🧁', '🍓', '🦋', '🚗', '🦕', '🌮', '🐱', '🐸', '🌻', '🐟'];
            const emoji = emojis[this._rand(0, emojis.length - 1)];
            const a = this._rand(2, 5);
            let b = this._rand(1, a - (a > 2 ? 0 : 0));
            if (b >= a) b = a - 1; // safety
            const correct = a - b;
            const remaining = Array(correct).fill(emoji).join('');
            const crossed = Array(b).fill('❌').join('');
            const wrongs = this._makeWrongAnswers(correct, 3, 0, 5);
            const answers = this._shuffle([correct, ...wrongs]);

            if (Math.random() < 0.5) {
                // Template 1: "Take away N, how many left?"
                return {
                    question: `${Array(a).fill(emoji).join('')}\nTake away ${b}. How many left?`,
                    questionSpeak: `You have ${a}. Take away ${b}. How many are left?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'subtraction',
                    subtype: 'visual',
                    explanation: `${remaining}${crossed} — ${a} take away ${b} leaves ${correct}!`,
                    explanationSpeak: `${a} take away ${b} leaves ${correct}!`
                };
            } else {
                // Template 2: "How many went away?"
                const wrongs2 = this._makeWrongAnswers(b, 3, Math.max(0, b - 2), b + 2);
                const answers2 = this._shuffle([b, ...wrongs2]);
                return {
                    question: `${Array(a).fill(emoji).join('')}  →  ${remaining}\nHow many went away?`,
                    questionSpeak: `You had ${a}. Now you have ${correct}. How many went away?`,
                    answers: answers2.map(String),
                    correctIndex: answers2.indexOf(b),
                    topic: 'subtraction',
                    subtype: 'visual',
                    explanation: `${b} went away! ${a} minus ${b} leaves ${correct}!`,
                    explanationSpeak: `${b} went away! ${a} minus ${b} is ${correct}!`
                };
            }
        }

        if (Math.random() < 0.3) {
            return this._subtractionVisual(level);
        }

        let a, b;
        if (level <= 3) {
            a = this._rand(1, 5);
            b = this._rand(0, a);
        } else {
            a = this._rand(1, 10);
            b = this._rand(0, a);
        }
        const correct = a - b;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 3), correct + 4);
        const answers = this._shuffle([correct, ...wrongs]);

        return {
            question: `${a} - ${b} = ?`,
            questionSpeak: `What is ${a} minus ${b}?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'subtraction',
            subtype: 'basic',
            explanation: `${a} - ${b} = ${correct}. If you have ${a} ${a === 1 ? 'thing' : 'things'} and take away ${b}, you have ${correct} left!`,
            explanationSpeak: `${a} minus ${b} equals ${correct}. If you have ${a} ${a === 1 ? 'thing' : 'things'} and take away ${b}, you have ${correct} left!`
        };
    },

    // Missing subtrahend: "5 - ___ = 3"
    _missingSubtrahend(level) {
        const maxNum = level <= 4 ? 8 : 12;
        const a = this._rand(3, maxNum);
        const result = this._rand(0, a - 1);
        const correct = a - result;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 3), correct + 4);
        const answers = this._shuffle([correct, ...wrongs]);

        return {
            question: `${a} - ___ = ${result}`,
            questionSpeak: `${a} minus what equals ${result}?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'subtraction',
            subtype: 'missing-subtrahend',
            explanation: `${a} - ${correct} = ${result}. We take away ${correct} to get from ${a} to ${result}!`,
            explanationSpeak: `${a} minus ${correct} equals ${result}!`
        };
    },

    // Visual subtraction with emoji
    _subtractionVisual(level) {
        const emoji = ['🍎', '⭐', '🎈', '🍪'][this._rand(0, 3)];
        const maxNum = level <= 3 ? 5 : 8;
        const a = this._rand(2, maxNum);
        const b = this._rand(1, a);
        const correct = a - b;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 2), correct + 3);
        const answers = this._shuffle([correct, ...wrongs]);
        const remaining = Array(a - b).fill(emoji).join('');
        const crossed = Array(b).fill('❌').join('');

        return {
            question: `${Array(a).fill(emoji).join('')}\nTake away ${b}. How many left?`,
            questionSpeak: `You have ${a} ${emoji}. Take away ${b}. How many are left?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'subtraction',
            subtype: 'visual',
            explanation: `${remaining}${crossed} — ${a} take away ${b} leaves ${correct}!`,
            explanationSpeak: `${a} take away ${b} leaves ${correct}!`
        };
    },

    // ---- COMPARING ----
    _comparing(level) {
        // V20: 2nd grade comparing — 3-digit numbers
        if (level >= 6) {
            return this._threeDigit(level); // reuse three-digit compare
        }
        // Pre-K (level 0-1): only "Which group has MORE?" with emoji visual
        if (level < 2) {
            const emoji = ['🍎', '⭐', '🐶', '🎈', '🍪'][this._rand(0, 4)];
            let a = this._rand(1, 5);
            let b = this._rand(1, 5);
            while (a === b) b = this._rand(1, 5);
            const correct = Math.max(a, b);
            const groupA = Array(a).fill(emoji).join(' ');
            const groupB = Array(b).fill(emoji).join(' ');
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, Math.min(a, b) - 1), Math.max(a, b) + 2);
            const answers = this._shuffle([correct, ...wrongs]);

            return {
                question: `Which group has MORE?\n${groupA}\n- - - - -\n${groupB}`,
                questionSpeak: `Which group has more? ${a} or ${b}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'comparing',
                subtype: 'greater-less',
                explanation: `${correct} is more! ${Math.max(a, b)} is bigger than ${Math.min(a, b)}!`,
                explanationSpeak: `${correct} is more! ${Math.max(a, b)} is bigger than ${Math.min(a, b)}!`
            };
        }

        // V37: "Order these 3 numbers" (20% at K+)
        if (Math.random() < 0.2) {
            const maxNum = level < 4 ? 10 : 20;
            const nums = [];
            while (nums.length < 3) {
                const n = this._rand(0, maxNum);
                if (!nums.includes(n)) nums.push(n);
            }
            const sorted = [...nums].sort((a, b) => a - b);
            const askSmallest = Math.random() < 0.5;
            const correct = askSmallest ? sorted.join(', ') : sorted.reverse().join(', ');
            const word = askSmallest ? 'SMALLEST to BIGGEST' : 'BIGGEST to SMALLEST';
            // Generate wrong orderings
            const wrongs = [];
            const reversed = askSmallest ? [...sorted].reverse().join(', ') : [...sorted].sort((a, b) => a - b).join(', ');
            wrongs.push(reversed);
            wrongs.push(this._shuffle(nums).join(', '));
            while (wrongs.length < 3) wrongs.push(this._shuffle(nums).join(', '));
            const uniqueWrongs = [...new Set(wrongs)].filter(w => w !== correct).slice(0, 3);
            while (uniqueWrongs.length < 3) uniqueWrongs.push(this._shuffle(nums).join(', '));
            const answers = this._shuffle([correct, ...uniqueWrongs.slice(0, 3)]);
            return {
                question: `Put in order from ${word}:\n${nums.join('   ')}`,
                questionSpeak: `Put these numbers in order from ${word.toLowerCase().replace(' to ', ' to ')}: ${nums.join(', ')}`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'comparing',
                subtype: 'ordering',
                explanation: `In order: ${correct}! ${askSmallest ? 'Smallest first!' : 'Biggest first!'}`,
                explanationSpeak: `The correct order is ${correct}!`
            };
        }

        // V37: "Which number is closest to X?" (15% at K+)
        if (Math.random() < 0.18) {
            const maxNum = level < 4 ? 10 : 20;
            const target = this._rand(2, maxNum - 2);
            const closest = target + (Math.random() < 0.5 ? 1 : -1);
            const farther = [];
            let att = 0;
            while (farther.length < 3 && att++ < 50) {
                const n = this._rand(0, maxNum);
                if (n !== target && n !== closest && Math.abs(n - target) > 1 && !farther.includes(n)) farther.push(n);
            }
            const answers = this._shuffle([closest, ...farther.slice(0, 3)]);
            return {
                question: `Which number is CLOSEST to ${target}?`,
                questionSpeak: `Which number is closest to ${target}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(closest),
                topic: 'comparing',
                subtype: 'closest-to',
                explanation: `${closest} is closest to ${target}! They are only ${Math.abs(closest - target)} apart!`,
                explanationSpeak: `${closest} is closest to ${target}!`
            };
        }

        // V5.7: Multiple formats
        if (Math.random() < 0.35) {
            return this._comparingWhich(level);
        }

        const maxNum = level < 4 ? 10 : 20;
        let a = this._rand(0, maxNum);
        let b = this._rand(0, maxNum);

        // K level: don't allow equality (not taught yet)
        if (level < 4) {
            while (a === b) b = this._rand(0, maxNum);
        } else if (Math.random() < 0.2) {
            b = a; // Intentional equality for 1st grade
        }

        let correctSymbol;
        if (a > b) correctSymbol = '>';
        else if (a < b) correctSymbol = '<';
        else correctSymbol = '=';

        // K level: only > and < (= not taught yet); 1st grade: all 3
        const answerSet = level < 4 ? ['>', '<'] : ['>', '<', '='];
        const answers = this._shuffle(answerSet);

        let explainText;
        if (a > b) explainText = `${a} is bigger than ${b}, so we use the > sign!`;
        else if (a < b) explainText = `${a} is smaller than ${b}, so we use the < sign!`;
        else explainText = `${a} and ${b} are the same, so we use the = sign!`;

        return {
            question: `${a} ___ ${b}\nWhich sign goes in the blank?`,
            questionSpeak: `Compare ${a} and ${b}. Which sign goes in the blank?`,
            answers,
            correctIndex: answers.indexOf(correctSymbol),
            topic: 'comparing',
            subtype: 'greater-less',
            explanation: explainText,
            explanationSpeak: explainText
        };
    },

    // "Which number is bigger/smaller?"
    _comparingWhich(level) {
        const maxNum = level < 4 ? 10 : 20;
        let a = this._rand(1, maxNum);
        let b = this._rand(1, maxNum);
        while (a === b) b = this._rand(1, maxNum);

        const askBigger = Math.random() < 0.5;
        const word = askBigger ? 'BIGGER' : 'SMALLER';
        const correct = askBigger ? Math.max(a, b) : Math.min(a, b);
        const other = askBigger ? Math.min(a, b) : Math.max(a, b);
        const wrongs = this._makeWrongAnswers(correct, 2, Math.max(0, Math.min(a, b) - 3), Math.max(a, b) + 3);
        const allWrongs = [other, ...wrongs].filter(w => w !== correct);
        const answers = this._shuffle([correct, ...allWrongs.slice(0, 3)]);

        return {
            question: `Which number is ${word}?\n${a}   or   ${b}`,
            questionSpeak: `Which number is ${word.toLowerCase()}? ${a} or ${b}?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'comparing',
            subtype: 'which-bigger',
            explanation: `${correct} is ${word.toLowerCase()} than ${other}!`,
            explanationSpeak: `${correct} is ${word.toLowerCase()} than ${other}!`
        };
    },

    // ---- SHAPES ----
    _shapes(level) {
        // V20: 2nd grade shapes — 3D shapes, faces/edges, partitioning
        if (level >= 6) {
            return this._shapes2nd(level);
        }
        // Pre-K (level 0-1): 4 question types, basic shapes
        if (level < 2) {
            const preKShapes = [
                { name: 'circle', desc: 'is round with no corners', corners: 0, sides: 0, looksLike: 'a wheel' },
                { name: 'square', desc: 'has four equal sides and four corners', corners: 4, sides: 4, looksLike: 'a window' },
                { name: 'triangle', desc: 'has three sides and three corners', corners: 3, sides: 3, looksLike: 'a roof' },
                { name: 'star', desc: 'has points sticking out', corners: 5, sides: 0, looksLike: 'a star in the sky' }
            ];
            const target = preKShapes[this._rand(0, preKShapes.length - 1)];
            const extras = ['rectangle', 'diamond', 'oval', 'heart'];
            const wrongNames = preKShapes.filter(s => s.name !== target.name).map(s => s.name);
            const allWrongs = [...wrongNames, extras[this._rand(0, extras.length - 1)]];
            const wrongs = this._shuffle(allWrongs).slice(0, 3);

            const templateType = this._rand(0, 3);
            if (templateType === 0) {
                // "Which shape is [description]?"
                const answers = this._shuffle([target.name, ...wrongs]);
                return {
                    question: `Which shape ${target.desc}?`,
                    questionSpeak: `Which shape ${target.desc}?`,
                    answers,
                    correctIndex: answers.indexOf(target.name),
                    topic: 'shapes',
                    subtype: 'identify',
                    explanation: `A ${target.name} ${target.desc}!`,
                    explanationSpeak: `A ${target.name} ${target.desc}!`
                };
            } else if (templateType === 1) {
                // "How many corners does a [shape] have?"
                const correct = target.corners;
                const wrongNums = this._shuffle([0, 1, 2, 3, 4, 5].filter(n => n !== correct)).slice(0, 3);
                const answers = this._shuffle([correct, ...wrongNums]);
                return {
                    question: `How many corners does a ${target.name} have?`,
                    questionSpeak: `How many corners does a ${target.name} have?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'shapes',
                    subtype: 'properties',
                    explanation: `A ${target.name} has ${correct} corner${correct !== 1 ? 's' : ''}!`,
                    explanationSpeak: `A ${target.name} has ${correct} corners!`
                };
            } else if (templateType === 2) {
                // "Which shape looks like [real object]?"
                const answers = this._shuffle([target.name, ...wrongs]);
                return {
                    question: `Which shape looks like ${target.looksLike}?`,
                    questionSpeak: `Which shape looks like ${target.looksLike}?`,
                    answers,
                    correctIndex: answers.indexOf(target.name),
                    topic: 'shapes',
                    subtype: 'identify',
                    explanation: `A ${target.name} looks like ${target.looksLike}!`,
                    explanationSpeak: `A ${target.name} looks like ${target.looksLike}!`
                };
            } else {
                // "Is a [shape] round or pointy?"
                const isRound = target.corners === 0 && target.name === 'circle';
                const correct = isRound ? 'Round' : 'Pointy';
                const answers = this._shuffle(['Round', 'Pointy']);
                // Pad to 4 choices
                answers.push(isRound ? 'Straight' : 'Curved');
                answers.push('Flat');
                const finalAnswers = answers.slice(0, 4);
                return {
                    question: `Is a ${target.name} round or pointy?`,
                    questionSpeak: `Is a ${target.name} round or pointy?`,
                    answers: finalAnswers,
                    correctIndex: finalAnswers.indexOf(correct),
                    topic: 'shapes',
                    subtype: 'properties',
                    explanation: `A ${target.name} is ${correct.toLowerCase()}! It ${target.desc}!`,
                    explanationSpeak: `A ${target.name} is ${correct.toLowerCase()}!`
                };
            }
        }

        const kShapes = [
            { name: 'circle', sides: 0, desc: 'round with no corners' },
            { name: 'square', sides: 4, desc: 'four equal sides and four corners' },
            { name: 'triangle', sides: 3, desc: 'three sides and three corners' },
            { name: 'rectangle', sides: 4, desc: 'four sides, two long and two short' }
        ];
        const extraShapes = [
            { name: 'hexagon', sides: 6, desc: 'six sides' },
            { name: 'pentagon', sides: 5, desc: 'five sides' },
            { name: 'oval', sides: 0, desc: 'stretched circle' }
        ];

        const pool = level < 4 ? kShapes : [...kShapes, ...extraShapes];
        const target = pool[this._rand(0, pool.length - 1)];
        const explanation = `A ${target.name} is ${target.desc}!`;

        // V5.7: Also add "how many sides" question (answer is a number)
        if (Math.random() < 0.25) {
            const correct = target.sides;
            const possibleSides = [...new Set(pool.map(s => s.sides))].filter(s => s !== correct);
            const wrongs = this._shuffle(possibleSides).slice(0, 3);
            // Fill with realistic side counts if not enough unique ones
            const realSideCounts = [0, 3, 4, 5, 6, 8];
            let _sa = 0;
            while (wrongs.length < 3 && _sa++ < 50) {
                const pick = realSideCounts[this._rand(0, realSideCounts.length - 1)];
                if (pick !== correct && !wrongs.includes(pick)) wrongs.push(pick);
            }
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `How many sides does a ${target.name} have?`,
                questionSpeak: `How many sides does a ${target.name} have?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'shapes',
                subtype: 'sides-vertices',
                explanation,
                explanationSpeak: explanation
            };
        }

        if (Math.random() < 0.5) {
            // "Which shape has N sides?" — exclude wrongs with same side count
            const sideWrongs = pool.filter(s => s.name !== target.name && s.sides !== target.sides).map(s => s.name);
            const wrongs = this._shuffle(sideWrongs).slice(0, 3);
            const answers = this._shuffle([target.name, ...wrongs]);
            return {
                question: `Which shape has ${target.sides === 0 ? 'no corners' : target.sides + ' sides'}?`,
                questionSpeak: `Which shape has ${target.sides === 0 ? 'no corners' : target.sides + ' sides'}?`,
                answers,
                correctIndex: answers.indexOf(target.name),
                topic: 'shapes',
                subtype: 'identify',
                explanation,
                explanationSpeak: explanation
            };
        } else {
            // "Which shape is <desc>?" — description is unique, any wrongs OK
            const wrongNames = pool.filter(s => s.name !== target.name).map(s => s.name);
            const wrongs = this._shuffle(wrongNames).slice(0, 3);
            const answers = this._shuffle([target.name, ...wrongs]);
            return {
                question: `Which shape is ${target.desc}?`,
                questionSpeak: `Which shape is ${target.desc}?`,
                answers,
                correctIndex: answers.indexOf(target.name),
                topic: 'shapes',
                subtype: 'identify',
                explanation,
                explanationSpeak: explanation
            };
        }
    },

    // ---- PATTERNS ----
    _patterns(level) {
        // V20: 2nd grade patterns — find the rule, growing patterns
        if (level >= 6) {
            return this._patterns2nd(level);
        }
        // V5.7: Multiple pattern types — number patterns 1st grade only
        const roll = Math.random();
        if (level >= 4 && roll < 0.25) {
            return this._numberPattern(level);
        }
        if (level >= 2 && roll < 0.4) {
            return this._growingPattern(level);
        }

        const items = ['🔴', '🔵', '🟢', '🟡', '⭐', '🔷'];

        let answer, question, patternName;
        // Pre-K (level 0-1): simple AB patterns only
        if (level < 2) {
            const a = items[this._rand(0, items.length - 1)];
            let b = items[this._rand(0, items.length - 1)];
            while (b === a) b = items[this._rand(0, items.length - 1)];

            question = `${a} ${b} ${a} ${b} ${a} ___`;
            answer = b;
            patternName = `${a} ${b}`;
        } else if (level <= 3) {
            // K (level 2-3): AB, ABB, AAB patterns
            const a = items[this._rand(0, items.length - 1)];
            let b = items[this._rand(0, items.length - 1)];
            while (b === a) b = items[this._rand(0, items.length - 1)];

            const r = Math.random();
            if (r < 0.33) {
                question = `${a} ${b} ${a} ${b} ${a} ___`;
                answer = b;
                patternName = `${a} ${b}`;
            } else if (r < 0.67) {
                question = `${a} ${b} ${b} ${a} ${b} ${b} ${a} ___`;
                answer = b;
                patternName = `${a} ${b} ${b}`;
            } else {
                question = `${a} ${a} ${b} ${a} ${a} ___`;
                answer = b;
                patternName = `${a} ${a} ${b}`;
            }
        } else {
            const a = items[this._rand(0, items.length - 1)];
            let b = items[this._rand(0, items.length - 1)];
            while (b === a) b = items[this._rand(0, items.length - 1)];
            let c = items[this._rand(0, items.length - 1)];
            while (c === a || c === b) c = items[this._rand(0, items.length - 1)];

            const r = Math.random();
            if (r < 0.33) {
                question = `${a} ${b} ${c} ${a} ${b} ___`;
                answer = c;
                patternName = `${a} ${b} ${c}`;
            } else if (r < 0.67) {
                question = `${a} ${a} ${b} ${b} ${a} ${a} ___`;
                answer = b;
                patternName = `${a} ${a} ${b} ${b}`;
            } else {
                question = `${a} ${b} ${a} ${c} ${a} ___`;
                answer = b;
                patternName = `${a} then alternating`;
            }
        }

        const wrongPool = items.filter(x => x !== answer);
        const wrongs = this._shuffle(wrongPool).slice(0, 3);
        const answers = this._shuffle([answer, ...wrongs]);

        return {
            question: `What comes next?\n${question}`,
            questionSpeak: 'What comes next in the pattern?',
            answers,
            correctIndex: answers.indexOf(answer),
            topic: 'patterns',
            subtype: level < 2 ? 'ab-pattern' : level <= 3 ? 'repeat-pattern' : 'complex-pattern',
            explanation: `The pattern repeats: ${patternName}. So ${answer} comes next!`,
            explanationSpeak: `The pattern repeats. So the next one in the pattern comes next!`
        };
    },

    // Growing pattern: 1, 2, 3, ___
    _growingPattern(level) {
        const start = this._rand(1, level < 4 ? 3 : 5);
        const step = level < 4 ? 1 : this._rand(1, 2);
        const len = level < 4 ? 3 : 4;
        const seq = [];
        for (let i = 0; i < len; i++) seq.push(start + i * step);
        const correct = start + len * step;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 3), correct + 3);
        const answers = this._shuffle([correct, ...wrongs]);

        return {
            question: `What comes next?\n${seq.join(', ')}, ___`,
            questionSpeak: `What comes next? ${seq.join(', ')}`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'patterns',
            subtype: 'growing-pattern',
            explanation: `The pattern adds ${step} each time: ${seq.join(', ')}, ${correct}!`,
            explanationSpeak: `The pattern adds ${step} each time! ${correct} comes next!`
        };
    },

    // Number pattern: 10, 8, 6, ___
    _numberPattern(level) {
        const patterns = [
            { seq: [2, 4, 6, 8], next: 10, rule: 'adds 2' },
            { seq: [5, 10, 15, 20], next: 25, rule: 'adds 5' },
            { seq: [10, 20, 30, 40], next: 50, rule: 'adds 10' },
            { seq: [1, 3, 5, 7], next: 9, rule: 'adds 2' },
            { seq: [10, 8, 6, 4], next: 2, rule: 'subtracts 2' },
            { seq: [20, 15, 10, 5], next: 0, rule: 'subtracts 5' },
            { seq: [3, 6, 9, 12], next: 15, rule: 'adds 3' },
            { seq: [100, 90, 80, 70], next: 60, rule: 'subtracts 10' }
        ];
        const p = patterns[this._rand(0, patterns.length - 1)];
        const wrongs = this._makeWrongAnswers(p.next, 3, Math.max(0, p.next - 5), p.next + 5);
        const answers = this._shuffle([p.next, ...wrongs]);

        return {
            question: `What comes next?\n${p.seq.join(', ')}, ___`,
            questionSpeak: `What comes next? ${p.seq.join(', ')}`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(p.next),
            topic: 'patterns',
            subtype: 'number-pattern',
            explanation: `The pattern ${p.rule} each time: ${p.seq.join(', ')}, ${p.next}!`,
            explanationSpeak: `The pattern ${p.rule} each time! ${p.next} comes next!`
        };
    },

    // ---- WORD PROBLEMS (V3) ----
    _wordProblems(level) {
        const names = ['Tom', 'Sara', 'Jake', 'Mia', 'Ben', 'Lily', 'Max', 'Emma'];
        const name = names[this._rand(0, names.length - 1)];

        // V38: 3rd grade word problems
        if (level >= 8) {
            return this._wordProblems3rd(name, level);
        }

        // V37: Comparison word problems (20% at K+)
        if (level >= 2 && Math.random() < 0.2) {
            return this._wpCompare(name, level);
        }

        // V37: "How many in all?" combining groups (15% at K+)
        if (level >= 2 && Math.random() < 0.18) {
            return this._wpCombineGroups(name, level);
        }

        // Pre-K (level 0-1): ultra simple, max 3
        if (level < 2) {
            return this._wpAddSimple(name, 3);
        } else if (level <= 2) {
            return this._wpAddSimple(name, 5);
        } else if (level === 3) {
            return Math.random() < 0.5 ? this._wpAddSimple(name, 8) : this._wpSubSimple(name, 10);
        } else if (level === 4) {
            return Math.random() < 0.5 ? this._wpAddContext(name, 10) : this._wpSubContext(name, 10);
        } else if (level === 5) {
            return Math.random() < 0.5 ? this._wpTwoStep(name, 15) : this._wpAddContext(name, 15);
        } else {
            // V20: 2nd grade word problems
            return this._wordProblems2nd(name, level);
        }
    },

    _wpAddSimple(name, max) {
        const objects = ['apples', 'toys', 'stickers', 'cookies', 'stars', 'books', 'grapes', 'pencils',
            'goldfish', 'buttons', 'shells', 'rocks', 'bananas', 'balloons', 'dinosaurs', 'puppies',
            'cupcakes', 'flowers', 'coins', 'race cars', 'robots', 'kittens', 'acorns', 'pebbles',
            'feathers', 'donuts', 'candies', 'cherries', 'tacos', 'butterflies', 'rubber ducks',
            'gummy bears', 'building blocks', 'bouncy balls', 'hot wheels', 'train cars',
            'stuffed animals', 'seashells', 'pinecones', 'fireflies', 'ladybugs', 'snowballs'];
        const obj = objects[this._rand(0, objects.length - 1)];
        const a = this._rand(1, Math.floor(max / 2));
        const b = this._rand(1, max - a);
        const correct = a + b;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 3), correct + 3);
        const answers = this._shuffle([correct, ...wrongs]);

        return {
            question: `${name} has ${a} ${obj}.\nGets ${b} more.\nHow many now?`,
            questionSpeak: `${name} has ${a} ${obj}. Gets ${b} more. How many does ${name} have now?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'word-problems',
            subtype: 'add-simple',
            explanation: `${a} ${obj} + ${b} more = ${correct} ${obj}! We add ${a} + ${b} = ${correct}!`,
            explanationSpeak: `${a} plus ${b} equals ${correct}. ${name} has ${correct} ${obj} now!`
        };
    },

    _wpSubSimple(name, max) {
        const scenarios = [
            { obj: 'birds', action: 'fly away' }, { obj: 'fish', action: 'swim away' },
            { obj: 'balloons', action: 'pop' }, { obj: 'flowers', action: 'get picked' },
            { obj: 'crayons', action: 'break' }, { obj: 'leaves', action: 'blow away' },
            { obj: 'snowmen', action: 'melt' }, { obj: 'candles', action: 'go out' },
            { obj: 'ants', action: 'march away' }, { obj: 'bubbles', action: 'pop' },
            { obj: 'ducks', action: 'waddle away' }, { obj: 'bees', action: 'buzz off' },
            { obj: 'kites', action: 'fly away' }, { obj: 'cookies', action: 'get eaten' },
            { obj: 'stars', action: 'fade away' }, { obj: 'butterflies', action: 'flutter away' },
            { obj: 'rabbits', action: 'hop away' }, { obj: 'fireflies', action: 'fly off' }
        ];
        const s = scenarios[this._rand(0, scenarios.length - 1)];
        const obj = s.obj;
        const a = this._rand(3, max);
        const b = this._rand(1, a - 1);
        const correct = a - b;
        const action = s.action;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 3), correct + 3);
        const answers = this._shuffle([correct, ...wrongs]);

        return {
            question: `There are ${a} ${obj}.\n${b} ${action}.\nHow many left?`,
            questionSpeak: `There are ${a} ${obj}. ${b} ${action}. How many are left?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'word-problems',
            subtype: 'sub-simple',
            explanation: `${a} - ${b} = ${correct}. ${a} ${obj} minus ${b} leaves ${correct}!`,
            explanationSpeak: `${a} minus ${b} equals ${correct}. There are ${correct} ${obj} left!`
        };
    },

    _wpAddContext(name, max) {
        const templates = [
            { obj: 'stickers' }, { obj: 'blocks' }, { obj: 'marbles' }, { obj: 'crayons' },
            { obj: 'erasers' }, { obj: 'stamps' }, { obj: 'trading cards' }, { obj: 'gummy bears' },
            { obj: 'beads' }, { obj: 'legos' }, { obj: 'hot wheels' }, { obj: 'puzzle pieces' },
            { obj: 'rubber ducks' }, { obj: 'bouncy balls' }, { obj: 'action figures' }, { obj: 'seashells' }
        ];
        const t = templates[this._rand(0, templates.length - 1)];
        const friends = ['Zoe', 'Leo', 'Ana', 'Dev', 'Mia', 'Jake', 'Lily', 'Sam'];
        const friend = friends[this._rand(0, friends.length - 1)];
        const a = this._rand(2, Math.floor(max * 0.6));
        const b = this._rand(1, max - a);
        const correct = a + b;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 3), correct + 4);
        const answers = this._shuffle([correct, ...wrongs]);

        return {
            question: `${name} has ${a} ${t.obj}.\n${friend} gives ${b} more.\nHow many total?`,
            questionSpeak: `${name} has ${a} ${t.obj}. ${friend} gives ${b} more. How many total?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'word-problems',
            subtype: 'add-context',
            explanation: `${a} + ${b} = ${correct}. ${name} now has ${correct} ${t.obj}!`,
            explanationSpeak: `${a} plus ${b} equals ${correct}. ${name} now has ${correct} ${t.obj}!`
        };
    },

    _wpSubContext(name, max) {
        const templates = [
            { obj: 'stickers', action: 'gives away' }, { obj: 'cookies', action: 'eats' },
            { obj: 'toy cars', action: 'loses' }, { obj: 'pencils', action: 'gives away' },
            { obj: 'grapes', action: 'eats' }, { obj: 'gummy bears', action: 'shares' },
            { obj: 'legos', action: 'puts back' }, { obj: 'cards', action: 'trades' },
            { obj: 'rocks', action: 'throws' }, { obj: 'coins', action: 'spends' }
        ];
        const t = templates[this._rand(0, templates.length - 1)];
        const a = this._rand(4, max);
        const b = this._rand(1, a - 1);
        const correct = a - b;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 3), correct + 3);
        const answers = this._shuffle([correct, ...wrongs]);

        return {
            question: `${name} has ${a} ${t.obj}.\n${t.action} ${b}.\nHow many left?`,
            questionSpeak: `${name} has ${a} ${t.obj} and ${t.action} ${b}. How many are left?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'word-problems',
            subtype: 'sub-context',
            explanation: `${a} - ${b} = ${correct}. ${name} has ${correct} ${t.obj} left!`,
            explanationSpeak: `${a} minus ${b} equals ${correct}. ${name} has ${correct} ${t.obj} left!`
        };
    },

    _wpTwoStep(name, max) {
        const obj = ['kids', 'balls', 'blocks', 'coins'][this._rand(0, 3)];
        const a = this._rand(3, Math.floor(max * 0.5));
        const b = this._rand(1, Math.floor(max * 0.4));
        const c = this._rand(1, Math.min(a + b - 1, Math.floor(max * 0.3)));
        const correct = a + b - c;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 3), correct + 4);
        const answers = this._shuffle([correct, ...wrongs]);
        const places = ['bus', 'park', 'class', 'table'];
        const place = places[this._rand(0, places.length - 1)];

        return {
            question: `A ${place} has ${a} ${obj}.\n${b} more come. Then ${c} leave.\nHow many now?`,
            questionSpeak: `A ${place} has ${a} ${obj}. ${b} more come. Then ${c} leave. How many now?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'word-problems',
            subtype: 'two-step',
            explanation: `${a} + ${b} = ${a + b}, then ${a + b} - ${c} = ${correct}. There are ${correct} ${obj}!`,
            explanationSpeak: `First, ${a} plus ${b} equals ${a + b}. Then ${a + b} minus ${c} equals ${correct}!`
        };
    },

    // V37: Comparison word problems — "How many more/fewer?"
    _wpCompare(name, level) {
        const maxNum = level < 4 ? 8 : 15;
        const objects = ['stickers', 'marbles', 'cookies', 'toy cars', 'crayons', 'cards',
            'grapes', 'gummy bears', 'coins', 'blocks', 'shells', 'rocks', 'feathers', 'stamps'];
        const obj = objects[this._rand(0, objects.length - 1)];
        const friends = ['Zoe', 'Leo', 'Ana', 'Dev', 'Mia', 'Jake', 'Lily', 'Sam'];
        const friend = friends[this._rand(0, friends.length - 1)];
        const big = this._rand(3, maxNum);
        const small = this._rand(1, big - 1);
        const correct = big - small;
        const askMore = Math.random() < 0.5;
        const word = askMore ? 'more' : 'fewer';
        const personMore = askMore ? name : friend;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 3), correct + 3);
        const answers = this._shuffle([correct, ...wrongs]);

        return {
            question: `${name} has ${big} ${obj}.\n${friend} has ${small} ${obj}.\nHow many ${word} does ${personMore} have?`,
            questionSpeak: `${name} has ${big} ${obj}. ${friend} has ${small} ${obj}. How many ${word} does ${personMore} have?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'word-problems',
            subtype: 'compare',
            explanation: `${big} - ${small} = ${correct}. ${personMore} has ${correct} ${word}!`,
            explanationSpeak: `${big} minus ${small} equals ${correct}. ${personMore} has ${correct} ${word}!`
        };
    },

    // V37: "How many in all?" — combining 3 groups
    _wpCombineGroups(name, level) {
        const maxPer = level < 4 ? 4 : 6;
        const a = this._rand(1, maxPer);
        const b = this._rand(1, maxPer);
        const c = this._rand(1, maxPer);
        const correct = a + b + c;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 3), correct + 4);
        const answers = this._shuffle([correct, ...wrongs]);
        const scenarios = [
            { places: ['his bag', 'his desk', 'his pocket'], obj: 'pencils' },
            { places: ['the table', 'the counter', 'the floor'], obj: 'books' },
            { places: ['the garden', 'the pot', 'the vase'], obj: 'flowers' },
            { places: ['the big box', 'the small box', 'the bag'], obj: 'toys' },
            { places: ['Monday', 'Tuesday', 'Wednesday'], obj: 'stars' },
            { places: ['the left pocket', 'the right pocket', 'his hand'], obj: 'coins' }
        ];
        const s = scenarios[this._rand(0, scenarios.length - 1)];

        return {
            question: `${name} has ${a} ${s.obj} in ${s.places[0]},\n${b} in ${s.places[1]}, and ${c} in ${s.places[2]}.\nHow many in ALL?`,
            questionSpeak: `${name} has ${a} ${s.obj} in ${s.places[0]}, ${b} in ${s.places[1]}, and ${c} in ${s.places[2]}. How many in all?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'word-problems',
            subtype: 'combine-groups',
            explanation: `${a} + ${b} + ${c} = ${correct} ${s.obj} in all!`,
            explanationSpeak: `${a} plus ${b} plus ${c} equals ${correct}! ${name} has ${correct} ${s.obj} in all!`
        };
    },

    // ---- DECOMPOSING / COMPOSING (V5.8: FastBridge ten-frames + number bonds + five-frames) ----
    _decomposing(level) {
        // V20: 2nd grade decomposing — 3-digit decomposition
        if (level >= 6) {
            return this._threeDigit(level); // reuse three-digit expanded form
        }
        // Pre-K (level 0-1): 3 template types, numbers ≤ 5
        if (level < 2) {
            const templateType = this._rand(0, 2);

            if (templateType === 0) {
                // "N is [part] and ___" with visual
                const whole = this._rand(2, 5);
                const part1 = this._rand(1, whole - 1);
                const correct = whole - part1;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 2), correct + 2);
                const answers = this._shuffle([correct, ...wrongs]);
                const emoji = '🔴';
                const groupA = Array(part1).fill(emoji).join('');
                const groupB = Array(correct).fill('⬜').join('');
                return {
                    question: `${groupA}${groupB}\n${whole} is ${part1} and ___`,
                    questionSpeak: `${whole} is ${part1} and what?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'decomposing',
                    subtype: 'part-part-whole',
                    explanation: `${part1} and ${correct} make ${whole}! ${part1} + ${correct} = ${whole}!`,
                    explanationSpeak: `${part1} and ${correct} make ${whole}!`
                };
            } else if (templateType === 1) {
                // "How many more to make 5?" (visual five-frame)
                const have = this._rand(1, 4);
                const correct = 5 - have;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 2), correct + 2);
                const answers = this._shuffle([correct, ...wrongs]);
                const filled = '🔴'.repeat(have);
                const empty = '⬜'.repeat(5 - have);
                return {
                    question: `[ ${filled}${empty} ]\nHow many more to make 5?`,
                    questionSpeak: `You have ${have}. How many more to make 5?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'decomposing',
                    subtype: 'five-frame',
                    explanation: `${have} + ${correct} = 5! You need ${correct} more!`,
                    explanationSpeak: `You need ${correct} more to make 5!`
                };
            } else {
                // "Put together: [group] and [group] = ?"
                const a = this._rand(1, 3);
                const b = this._rand(1, 5 - a);
                const correct = a + b;
                const emoji = ['🔵', '🟢', '🟡'][this._rand(0, 2)];
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 2), correct + 2);
                const answers = this._shuffle([correct, ...wrongs]);
                const groupA = Array(a).fill(emoji).join('');
                const groupB = Array(b).fill(emoji).join('');
                return {
                    question: `Put together:\n${groupA}  and  ${groupB}\nHow many altogether?`,
                    questionSpeak: `Put ${a} and ${b} together. How many altogether?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'decomposing',
                    subtype: 'composing',
                    explanation: `${a} and ${b} together make ${correct}!`,
                    explanationSpeak: `${a} and ${b} make ${correct} altogether!`
                };
            }
        }

        const roll = Math.random();
        if (roll < 0.35) return this._numberBond(level);
        if (roll < 0.65) return this._frameComposing(level);
        return this._howManyMore(level);
    },

    // Number bond (part-part-whole): FastBridge decomposing format
    _numberBond(level) {
        const whole = level < 4 ? this._rand(3, 10) : this._rand(5, 15);
        const part1 = this._rand(1, whole - 1);
        const correct = whole - part1;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 3), correct + 3);
        const answers = this._shuffle([correct, ...wrongs]);

        return {
            question: `    [ ${whole} ]\n   /     \\\n[ ${part1} ]  [ ___ ]`,
            questionSpeak: `${whole} breaks into ${part1} and what?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'decomposing',
            subtype: 'number-bond',
            explanation: `${part1} + ${correct} = ${whole}! The missing part is ${correct}!`,
            explanationSpeak: `${part1} plus ${correct} equals ${whole}! The missing part is ${correct}!`
        };
    },

    // Five-frame (K) and ten-frame composing
    _frameComposing(level) {
        const target = level < 4 ? 5 : 10;
        const part = this._rand(1, target - 1);
        const correct = target - part;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 2), correct + 3);
        const answers = this._shuffle([correct, ...wrongs]);

        // Build frame visual
        const filled = '🔴'.repeat(part);
        const empty = '⬜'.repeat(target - part);
        let visual;
        if (target === 5) {
            visual = `[ ${filled}${empty} ]`;
        } else {
            // Ten-frame: two rows of 5
            const row1 = (filled + empty).slice(0, 5);
            const row2 = (filled + empty).slice(5);
            visual = `[ ${row1} ]\n[ ${row2} ]`;
        }

        return {
            question: `${visual}\n${part} and ___ make ${target}`,
            questionSpeak: `${part} and what make ${target}?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'decomposing',
            subtype: target === 5 ? 'five-frame' : 'ten-frame',
            explanation: `${part} + ${correct} = ${target}! ${part} and ${correct} make ${target}!`,
            explanationSpeak: `${part} plus ${correct} equals ${target}!`
        };
    },

    // "How many more to make N?"
    _howManyMore(level) {
        const target = level < 4 ? 5 : 10;
        const have = this._rand(1, target - 1);
        const correct = target - have;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 2), correct + 3);
        const answers = this._shuffle([correct, ...wrongs]);
        const filled = '🔴'.repeat(have);
        const empty = '⬜'.repeat(target - have);

        return {
            question: `${filled}${empty}\nHow many more to make ${target}?`,
            questionSpeak: `You have ${have}. How many more to make ${target}?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'decomposing',
            subtype: 'how-many-more',
            explanation: `${have} + ${correct} = ${target}! You need ${correct} more!`,
            explanationSpeak: `${have} plus ${correct} equals ${target}! You need ${correct} more!`
        };
    },

    // ---- SUBITIZING (V5.8: FastBridge flash-then-hide) ----
    _subitizing(level) {
        const maxDots = level < 2 ? 3 : level < 4 ? 6 : 10;
        const count = this._rand(1, maxDots);

        // V37: "Two-color groups" subitizing — see 2 colors, how many total? (25% at K+)
        if (level >= 2 && Math.random() < 0.25) {
            const total = this._rand(3, Math.min(maxDots, 8));
            const groupA = this._rand(1, total - 1);
            const groupB = total - groupA;
            const emojisA = Array(groupA).fill('🔴').join(' ');
            const emojisB = Array(groupB).fill('🔵').join(' ');
            const visual = `${emojisA}  ${emojisB}`;
            const wrongs = this._makeWrongAnswers(total, 3, Math.max(1, total - 2), total + 2);
            const answers = this._shuffle([total, ...wrongs]);
            return {
                question: `How many dots did you see?`,
                questionSpeak: `Quick! How many dots altogether?`,
                flash: `Count ALL the dots!\n${visual}`,
                flashDuration: level < 4 ? 1500 : 1000,
                answers: answers.map(String),
                correctIndex: answers.indexOf(total),
                topic: 'subitizing',
                subtype: 'two-color',
                explanation: `${groupA} red + ${groupB} blue = ${total} dots total!`,
                explanationSpeak: `${groupA} red plus ${groupB} blue equals ${total} dots!`
            };
        }

        // V37: "Dice face" pattern recognition (20% at K+)
        if (level >= 2 && Math.random() < 0.25) {
            const diceMax = Math.min(6, maxDots);
            const diceVal = this._rand(1, diceMax);
            const diceFaces = {
                1: '  ⚫  ', 2: '⚫   ⚫', 3: '⚫ ⚫ ⚫',
                4: '⚫ ⚫\n⚫ ⚫', 5: '⚫ ⚫\n  ⚫\n⚫ ⚫', 6: '⚫ ⚫\n⚫ ⚫\n⚫ ⚫'
            };
            const wrongs = this._makeWrongAnswers(diceVal, 3, Math.max(1, diceVal - 2), Math.min(6, diceVal + 2));
            const answers = this._shuffle([diceVal, ...wrongs]);
            return {
                question: `What number was on the dice?`,
                questionSpeak: `Quick! What number was on the dice?`,
                flash: `🎲 What number?\n${diceFaces[diceVal]}`,
                flashDuration: level < 4 ? 1200 : 800,
                answers: answers.map(String),
                correctIndex: answers.indexOf(diceVal),
                topic: 'subitizing',
                subtype: 'dice-face',
                explanation: `The dice showed ${diceVal}! 🎲`,
                explanationSpeak: `The dice showed ${diceVal}!`
            };
        }

        // Multiple visual arrangements for variety
        const templateType = this._rand(0, level < 2 ? 2 : level < 4 ? 3 : 3);

        let visual, visualLabel;
        if (templateType === 0) {
            // Dice-like dot patterns
            const dotRows = {
                1: ['⚫'], 2: ['⚫ ⚫'], 3: ['⚫ ⚫ ⚫'],
                4: ['⚫ ⚫', '⚫ ⚫'], 5: ['⚫ ⚫', ' ⚫', '⚫ ⚫'],
                6: ['⚫ ⚫ ⚫', '⚫ ⚫ ⚫'], 7: ['⚫ ⚫ ⚫', '  ⚫', '⚫ ⚫ ⚫'],
                8: ['⚫ ⚫ ⚫ ⚫', '⚫ ⚫ ⚫ ⚫'], 9: ['⚫ ⚫ ⚫', '⚫ ⚫ ⚫', '⚫ ⚫ ⚫'],
                10: ['⚫ ⚫ ⚫ ⚫ ⚫', '⚫ ⚫ ⚫ ⚫ ⚫']
            };
            visual = dotRows[count].join('\n');
            visualLabel = 'dots';
        } else if (templateType === 1) {
            // Star arrangement
            const starRows = {
                1: ['⭐'], 2: ['⭐ ⭐'], 3: ['⭐', '⭐ ⭐'],
                4: ['⭐ ⭐', '⭐ ⭐'], 5: ['⭐ ⭐ ⭐', '⭐ ⭐'],
                6: ['⭐ ⭐ ⭐', '⭐ ⭐ ⭐'], 7: ['⭐ ⭐ ⭐ ⭐', '⭐ ⭐ ⭐'],
                8: ['⭐ ⭐ ⭐ ⭐', '⭐ ⭐ ⭐ ⭐'], 9: ['⭐ ⭐ ⭐', '⭐ ⭐ ⭐', '⭐ ⭐ ⭐'],
                10: ['⭐ ⭐ ⭐ ⭐ ⭐', '⭐ ⭐ ⭐ ⭐ ⭐']
            };
            visual = starRows[count].join('\n');
            visualLabel = 'stars';
        } else if (templateType === 2) {
            // Heart arrangement (different layout than dots)
            const heartRows = {
                1: ['❤️'], 2: ['❤️', '❤️'], 3: ['❤️ ❤️', '❤️'],
                4: ['❤️ ❤️', '❤️ ❤️'], 5: ['❤️ ❤️ ❤️', '❤️ ❤️'],
                6: ['❤️ ❤️', '❤️ ❤️', '❤️ ❤️'], 7: ['❤️ ❤️ ❤️', '❤️', '❤️ ❤️ ❤️'],
                8: ['❤️ ❤️ ❤️ ❤️', '❤️ ❤️ ❤️ ❤️'], 9: ['❤️ ❤️ ❤️', '❤️ ❤️ ❤️', '❤️ ❤️ ❤️'],
                10: ['❤️ ❤️ ❤️ ❤️ ❤️', '❤️ ❤️ ❤️ ❤️ ❤️']
            };
            visual = heartRows[count].join('\n');
            visualLabel = 'hearts';
        } else {
            // Finger counting (K and above)
            const fingerEmoji = ['', '☝️', '✌️', '🤟', '🖖', '🖐️', '🖐️☝️', '🖐️✌️', '🖐️🤟', '🖐️🖖', '🖐️🖐️'];
            visual = fingerEmoji[count] || '🖐️🖐️';
            visualLabel = 'fingers';
        }

        const correct = count;
        const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 2), correct + 2);
        const answers = this._shuffle([correct, ...wrongs]);

        const prompts = [
            `How many ${visualLabel} did you see?`,
            `Quick! How many ${visualLabel}?`,
            `Count fast! How many?`
        ];
        const questionText = prompts[this._rand(0, prompts.length - 1)];

        return {
            question: questionText,
            questionSpeak: `Quick! How many ${visualLabel} did you see?`,
            flash: `Quick! Count the ${visualLabel}!\n${visual}`,
            flashDuration: level < 2 ? 1500 : level < 4 ? 1200 : 800,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'subitizing',
            subtype: level < 2 ? 'basic' : level < 4 ? 'intermediate' : 'advanced',
            explanation: `There are ${count} ${visualLabel}! ${visual.replace(/\n/g, ' ')}`,
            explanationSpeak: `There are ${count} ${visualLabel}!`
        };
    },

    // ---- PLACE VALUE (V5.7: FastBridge 1st grade) ----
    _placeValue(level) {
        // V20: 2nd grade place value — hundreds/tens/ones, expanded form
        if (level >= 6) {
            return this._threeDigit(level);
        }
        // Pre-K: place value isn't appropriate, redirect to counting
        if (level < 2) {
            return this._counting(level);
        }
        if (level < 4) {
            const ones = this._rand(1, 9);
            const num = 10 + ones;
            const tenFrame = '🔴🔴🔴🔴🔴\n🔴🔴🔴🔴🔴';
            const extras = '🔵'.repeat(ones);
            const templateType = this._rand(0, 2);

            if (templateType === 0) {
                // "N = 10 + ___" (original)
                const correct = ones;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 2), correct + 3);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `${tenFrame}\n${extras}\n${num} = 10 + ___`,
                    questionSpeak: `${num} equals 10 plus what?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'place-value',
                    subtype: 'tens-and-ones',
                    explanation: `${num} = 10 + ${ones}! A full ten-frame plus ${ones} more!`,
                    explanationSpeak: `${num} is 10 and ${ones} more!`
                };
            } else if (templateType === 1) {
                // "Is N bigger or smaller than 10?"
                const compareNum = this._rand(1, 19);
                const correct = compareNum > 10 ? 'Bigger' : compareNum < 10 ? 'Smaller' : 'Same';
                const answers = this._shuffle(['Bigger', 'Smaller', 'Same']);
                answers.push(compareNum > 10 ? 'Way smaller' : 'Way bigger');
                return {
                    question: `Is ${compareNum} bigger or smaller than 10?`,
                    questionSpeak: `Is ${compareNum} bigger or smaller than 10?`,
                    answers: answers.slice(0, 4),
                    correctIndex: answers.indexOf(correct),
                    topic: 'place-value',
                    subtype: 'compare-to-ten',
                    explanation: `${compareNum} is ${correct.toLowerCase()} than 10!`,
                    explanationSpeak: `${compareNum} is ${correct.toLowerCase()} than 10!`
                };
            } else {
                // "How many extra past 10?" with visual
                const correct = ones;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 3), correct + 3);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `${tenFrame}\n${extras}\nHow many extra past 10?`,
                    questionSpeak: `You see ${num}. How many extra past 10?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'place-value',
                    subtype: 'tens-and-ones',
                    explanation: `${num} is 10 plus ${ones} extra! The extra count is ${ones}!`,
                    explanationSpeak: `${num} has ${ones} extra past 10!`
                };
            }
        }

        const format = Math.random();
        if (format < 0.33) {
            // "How many tens in N?"
            const tens = this._rand(1, 5);
            const ones = this._rand(0, 9);
            const num = tens * 10 + ones;
            const correct = tens;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 2), correct + 3);
            const answers = this._shuffle([correct, ...wrongs]);

            return {
                question: `How many tens in ${num}?`,
                questionSpeak: `How many tens in ${num}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'place-value',
                subtype: 'identify-tens',
                explanation: `${num} has ${tens} ten${tens > 1 ? 's' : ''} and ${ones} one${ones !== 1 ? 's' : ''}!`,
                explanationSpeak: `${num} has ${tens} tens and ${ones} ones!`
            };
        } else if (format < 0.67) {
            // "How many ones in N?"
            const tens = this._rand(1, 5);
            const ones = this._rand(0, 9);
            const num = tens * 10 + ones;
            const correct = ones;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 2), correct + 3);
            const answers = this._shuffle([correct, ...wrongs]);

            return {
                question: `How many ones in ${num}?`,
                questionSpeak: `How many ones in ${num}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'place-value',
                subtype: 'identify-ones',
                explanation: `${num} has ${tens} ten${tens > 1 ? 's' : ''} and ${ones} one${ones !== 1 ? 's' : ''}!`,
                explanationSpeak: `${num} has ${tens} tens and ${ones} ones!`
            };
        } else {
            // "What number has N tens and M ones?"
            const tens = this._rand(1, 5);
            const ones = this._rand(0, 9);
            const correct = tens * 10 + ones;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(10, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);

            return {
                question: `What number has\n${tens} ten${tens > 1 ? 's' : ''} and ${ones} one${ones !== 1 ? 's' : ''}?`,
                questionSpeak: `What number has ${tens} tens and ${ones} ones?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'place-value',
                subtype: 'compose-number',
                explanation: `${tens} ten${tens > 1 ? 's' : ''} + ${ones} one${ones !== 1 ? 's' : ''} = ${correct}!`,
                explanationSpeak: `${tens} tens plus ${ones} ones equals ${correct}!`
            };
        }
    },

    // ---- COLORS ----
    _colors(level) {
        const basicColors = [
            { name: 'red', emoji: '🔴', objects: ['🍎', '🍓', '🚒', '❤️', '🌹'] },
            { name: 'blue', emoji: '🔵', objects: ['🫐', '🐳', '💧', '🦋', '💎'] },
            { name: 'yellow', emoji: '🟡', objects: ['🍌', '🌻', '⭐', '🌞', '🐤'] },
            { name: 'green', emoji: '🟢', objects: ['🐸', '🍀', '🌿', '🐢', '🥒'] }
        ];
        const moreColors = [
            { name: 'orange', emoji: '🟠', objects: ['🍊', '🥕', '🎃', '🦊', '🏀'] },
            { name: 'purple', emoji: '🟣', objects: ['🍇', '🔮', '🍆', '👾', '☂️'] },
            { name: 'pink', emoji: '🩷', objects: ['🌸', '🦩', '🎀', '💗', '🐷'] },
            { name: 'brown', emoji: '🟤', objects: ['🐻', '🏈', '🌰', '🍫', '🪵'] },
            { name: 'white', emoji: '⚪', objects: ['☁️', '❄️', '🐑', '🦢', '🥛'] },
            { name: 'black', emoji: '⚫', objects: ['🐈‍⬛', '🕷️', '🎱', '🦇', '🌑'] }
        ];

        const mixRecipes = [
            { a: 'red', b: 'yellow', result: 'orange' },
            { a: 'blue', b: 'yellow', result: 'green' },
            { a: 'red', b: 'blue', result: 'purple' }
        ];

        // Pre-K Easy (level 0): basic 4 colors, simple identification
        if (level < 1) {
            const pool = basicColors;
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // "Which one is [color]?" with color dot choices
                const target = pool[this._rand(0, pool.length - 1)];
                const wrongs = pool.filter(c => c.name !== target.name).map(c => c.emoji);
                const answers = this._shuffle([target.emoji, ...wrongs]);
                return {
                    question: `Which one is ${target.name}?`,
                    questionSpeak: `Which one is ${target.name}?`,
                    answers,
                    correctIndex: answers.indexOf(target.emoji),
                    topic: 'colors',
                    subtype: 'identify',
                    explanation: `${target.emoji} is ${target.name}!`,
                    explanationSpeak: `This one is ${target.name}!`
                };
            } else if (templateType === 1) {
                // "What color is [emoji object]?" with word choices
                const target = pool[this._rand(0, pool.length - 1)];
                const obj = target.objects[this._rand(0, target.objects.length - 1)];
                const wrongs = this._shuffle(pool.filter(c => c.name !== target.name).map(c => c.name)).slice(0, 3);
                const answers = this._shuffle([target.name, ...wrongs]);
                return {
                    question: `What color is this?\n${obj}`,
                    questionSpeak: `What color is this?`,
                    answers,
                    correctIndex: answers.indexOf(target.name),
                    topic: 'colors',
                    subtype: 'identify',
                    explanation: `${obj} is ${target.name}!`,
                    explanationSpeak: `It is ${target.name}!`
                };
            } else if (templateType === 2) {
                // "What color is a [object name]?" — real-world knowledge
                const colorObjects = [
                    { name: 'banana', article: 'a', emoji: '🍌', color: 'yellow' },
                    { name: 'apple', article: 'an', emoji: '🍎', color: 'red' },
                    { name: 'frog', article: 'a', emoji: '🐸', color: 'green' },
                    { name: 'sun', article: 'the', emoji: '☀️', color: 'yellow' },
                    { name: 'fire truck', article: 'a', emoji: '🚒', color: 'red' },
                    { name: 'leaf', article: 'a', emoji: '🌿', color: 'green' }
                ];
                const target = colorObjects[this._rand(0, colorObjects.length - 1)];
                const wrongs = this._shuffle(pool.map(c => c.name).filter(n => n !== target.color)).slice(0, 3);
                const answers = this._shuffle([target.color, ...wrongs]);
                return {
                    question: `What color is ${target.article} ${target.name}? ${target.emoji}`,
                    questionSpeak: `What color is ${target.article} ${target.name}?`,
                    answers,
                    correctIndex: answers.indexOf(target.color),
                    topic: 'colors',
                    subtype: 'real-world',
                    explanation: `${target.emoji} ${target.name} is ${target.color}!`,
                    explanationSpeak: `${target.article} ${target.name} is ${target.color}!`
                };
            } else {
                // "Which [emoji] is [color]?" — pick the right colored object
                const target = pool[this._rand(0, pool.length - 1)];
                const correctObj = target.objects[this._rand(0, target.objects.length - 1)];
                const wrongObjs = pool.filter(c => c.name !== target.name)
                    .map(c => c.objects[this._rand(0, c.objects.length - 1)]);
                const answers = this._shuffle([correctObj, ...wrongObjs]);
                return {
                    question: `Which one is ${target.name}?`,
                    questionSpeak: `Which one is ${target.name}?`,
                    answers,
                    correctIndex: answers.indexOf(correctObj),
                    topic: 'colors',
                    subtype: 'identify',
                    explanation: `${correctObj} is ${target.name}!`,
                    explanationSpeak: `This one is ${target.name}!`
                };
            }
        }

        // Pre-K Hard (level 1): all 10 colors + object matching + color of real things
        if (level < 2) {
            const pool = [...basicColors, ...moreColors];
            const templateType = this._rand(0, 4);

            if (templateType === 0) {
                // Identify color dot from 10 colors
                const target = pool[this._rand(0, pool.length - 1)];
                const wrongs = this._shuffle(pool.filter(c => c.name !== target.name)).slice(0, 3).map(c => c.emoji);
                const answers = this._shuffle([target.emoji, ...wrongs]);
                return {
                    question: `Find ${target.name}!`,
                    questionSpeak: `Can you find ${target.name}?`,
                    answers,
                    correctIndex: answers.indexOf(target.emoji),
                    topic: 'colors',
                    subtype: 'identify',
                    explanation: `${target.emoji} is ${target.name}!`,
                    explanationSpeak: `This one is ${target.name}!`
                };
            } else if (templateType === 1) {
                // "What color is [object]?" with expanded objects
                const colorObjects = [
                    { name: 'banana', article: 'a', emoji: '🍌', color: 'yellow' },
                    { name: 'strawberry', article: 'a', emoji: '🍓', color: 'red' },
                    { name: 'frog', article: 'a', emoji: '🐸', color: 'green' },
                    { name: 'ocean', article: 'the', emoji: '🌊', color: 'blue' },
                    { name: 'orange', article: 'an', emoji: '🍊', color: 'orange' },
                    { name: 'grape', article: 'a', emoji: '🍇', color: 'purple' },
                    { name: 'pig', article: 'a', emoji: '🐷', color: 'pink' },
                    { name: 'bear', article: 'a', emoji: '🐻', color: 'brown' },
                    { name: 'cloud', article: 'a', emoji: '☁️', color: 'white' },
                    { name: 'bat', article: 'a', emoji: '🦇', color: 'black' }
                ];
                const target = colorObjects[this._rand(0, colorObjects.length - 1)];
                const allNames = pool.map(c => c.name);
                const wrongs = this._shuffle(allNames.filter(n => n !== target.color)).slice(0, 3);
                const answers = this._shuffle([target.color, ...wrongs]);
                return {
                    question: `What color is ${target.article} ${target.name}? ${target.emoji}`,
                    questionSpeak: `What color is ${target.article} ${target.name}?`,
                    answers,
                    correctIndex: answers.indexOf(target.color),
                    topic: 'colors',
                    subtype: 'real-world',
                    explanation: `${target.emoji} ${target.name} is ${target.color}!`,
                    explanationSpeak: `${target.article} ${target.name} is ${target.color}!`
                };
            } else if (templateType === 2) {
                // "Which group has all [color] things?"
                const target = pool[this._rand(0, pool.length - 1)];
                const correctGroup = this._shuffle(target.objects).slice(0, 3).join('');
                const wrongGroups = this._shuffle(pool.filter(c => c.name !== target.name)).slice(0, 3)
                    .map(c => this._shuffle(c.objects).slice(0, 3).join(''));
                const answers = this._shuffle([correctGroup, ...wrongGroups]);
                return {
                    question: `Which group is all ${target.name}?`,
                    questionSpeak: `Which group has all ${target.name} things?`,
                    answers,
                    correctIndex: answers.indexOf(correctGroup),
                    topic: 'colors',
                    subtype: 'group-match',
                    explanation: `${correctGroup} — all ${target.name}!`,
                    explanationSpeak: `These are all ${target.name}!`
                };
            } else if (templateType === 3) {
                // "Which does NOT belong?" — one different color in a group
                const target = pool[this._rand(0, pool.length - 1)];
                const oddOne = pool.filter(c => c.name !== target.name)[this._rand(0, pool.length - 2)];
                const correctObj = oddOne.objects[this._rand(0, oddOne.objects.length - 1)];
                const sameObjs = this._shuffle(target.objects).slice(0, 3);
                const answers = this._shuffle([correctObj, ...sameObjs]);
                return {
                    question: `Which one is NOT ${target.name}?`,
                    questionSpeak: `Which one is NOT ${target.name}?`,
                    answers,
                    correctIndex: answers.indexOf(correctObj),
                    topic: 'colors',
                    subtype: 'odd-one-out',
                    explanation: `${correctObj} is ${oddOne.name}, not ${target.name}!`,
                    explanationSpeak: `That one is ${oddOne.name}, not ${target.name}!`
                };
            } else {
                // Color mixing
                const mix = mixRecipes[this._rand(0, mixRecipes.length - 1)];
                const wrongs = this._shuffle(['orange', 'green', 'purple', 'brown', 'pink']
                    .filter(c => c !== mix.result)).slice(0, 3);
                const answers = this._shuffle([mix.result, ...wrongs]);
                return {
                    question: `${mix.a} + ${mix.b} = ?\nMix the colors!`,
                    questionSpeak: `What color do you get when you mix ${mix.a} and ${mix.b}?`,
                    answers,
                    correctIndex: answers.indexOf(mix.result),
                    topic: 'colors',
                    subtype: 'mixing',
                    explanation: `${mix.a} + ${mix.b} = ${mix.result}!`,
                    explanationSpeak: `${mix.a} and ${mix.b} make ${mix.result}!`
                };
            }
        }

        // K levels (level 2-3): color mixing, color words, harder matching
        if (level < 4) {
            const pool = [...basicColors, ...moreColors];
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // Color mixing
                const mix = mixRecipes[this._rand(0, mixRecipes.length - 1)];
                const wrongs = this._shuffle(['orange', 'green', 'purple', 'brown', 'pink', 'black']
                    .filter(c => c !== mix.result)).slice(0, 3);
                const answers = this._shuffle([mix.result, ...wrongs]);
                return {
                    question: `${mix.a} + ${mix.b} = ?\nWhat color do you get?`,
                    questionSpeak: `What color do you get when you mix ${mix.a} and ${mix.b}?`,
                    answers,
                    correctIndex: answers.indexOf(mix.result),
                    topic: 'colors',
                    subtype: 'mixing',
                    explanation: `${mix.a} mixed with ${mix.b} makes ${mix.result}!`,
                    explanationSpeak: `${mix.a} and ${mix.b} make ${mix.result}!`
                };
            } else if (templateType === 1) {
                // "Which color do you NOT see?" — show 3 objects, ask what color is missing
                const shown = this._shuffle(pool).slice(0, 3);
                const missing = pool.filter(c => !shown.includes(c))[this._rand(0, pool.length - 4)];
                const objs = shown.map(c => c.objects[this._rand(0, c.objects.length - 1)]).join(' ');
                const wrongs = shown.map(c => c.name);
                const answers = this._shuffle([missing.name, ...wrongs]).slice(0, 4);
                return {
                    question: `Which color is NOT here?\n${objs}`,
                    questionSpeak: `Which color is not shown here?`,
                    answers,
                    correctIndex: answers.indexOf(missing.name),
                    topic: 'colors',
                    subtype: 'missing-color',
                    explanation: `There is no ${missing.name} ${missing.emoji} in the group!`,
                    explanationSpeak: `${missing.name} is not in the group!`
                };
            } else if (templateType === 2) {
                // "How many [color] things?" — counting + colors combined
                const target = pool[this._rand(0, pool.length - 1)];
                const other = pool.filter(c => c.name !== target.name)[this._rand(0, pool.length - 2)];
                const targetCount = this._rand(1, 3);
                const otherCount = this._rand(1, 3);
                const items = this._shuffle([
                    ...target.objects.slice(0, targetCount),
                    ...other.objects.slice(0, otherCount)
                ]);
                const wrongs = this._shuffle([1, 2, 3, 4, 5].filter(n => n !== targetCount)).slice(0, 3);
                const answers = this._shuffle([targetCount, ...wrongs]);
                return {
                    question: `How many ${target.name} things?\n${items.join(' ')}`,
                    questionSpeak: `How many ${target.name} things do you see?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(targetCount),
                    topic: 'colors',
                    subtype: 'count-by-color',
                    explanation: `There ${targetCount === 1 ? 'is' : 'are'} ${targetCount} ${target.name} ${targetCount === 1 ? 'thing' : 'things'}!`,
                    explanationSpeak: `There are ${targetCount} ${target.name} things!`
                };
            } else {
                // "Which does NOT belong?" (color sorting)
                const target = pool[this._rand(0, pool.length - 1)];
                const oddOne = pool.filter(c => c.name !== target.name)[this._rand(0, pool.length - 2)];
                const correctObj = oddOne.objects[this._rand(0, oddOne.objects.length - 1)];
                const sameObjs = this._shuffle(target.objects).slice(0, 3);
                const answers = this._shuffle([correctObj, ...sameObjs]);
                return {
                    question: `One of these is not ${target.name}.\nWhich does NOT belong?`,
                    questionSpeak: `Which one does not belong?`,
                    answers,
                    correctIndex: answers.indexOf(correctObj),
                    topic: 'colors',
                    subtype: 'odd-one-out',
                    explanation: `${correctObj} is ${oddOne.name}, not ${target.name}!`,
                    explanationSpeak: `That one is ${oddOne.name}!`
                };
            }
        }

        // 1st grade levels: redirect to patterns (colors mastered by now)
        return this._patterns(level);
    },

    // ---- SORTING / CLASSIFYING ----
    _sorting(level) {
        // V20: 2nd grade sorting — Venn diagram, classify by attributes
        if (level >= 6) {
            return this._sorting2nd(level);
        }
        const categories = {
            animals: { name: 'animals', singular: 'an animal', items: ['🐶', '🐱', '🐰', '🐻', '🐸', '🐦', '🐟', '🦋', '🐢', '🐷'] },
            fruits: { name: 'fruits', singular: 'a fruit', items: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍑', '🫐', '🥝', '🍒'] },
            vehicles: { name: 'vehicles', singular: 'a vehicle', items: ['🚗', '🚌', '🚂', '✈️', '🚁', '🚲', '🛴', '🚒', '🚑', '⛵'] },
            food: { name: 'food', singular: 'food', items: ['🍕', '🌮', '🍔', '🧁', '🍩', '🍪', '🥪', '🍿', '🌽', '🥕'] },
            nature: { name: 'nature', singular: 'nature', items: ['🌸', '🌻', '🌳', '🍀', '🌵', '🌺', '🍄', '🌿', '🌹', '🌴'] },
            clothes: { name: 'clothes', singular: 'clothing', items: ['👕', '👖', '🧢', '👟', '🧤', '🧣', '👗', '🧦', '👒', '🎒'] },
            weather: { name: 'weather', singular: 'weather', items: ['☀️', '🌧️', '⛈️', '🌈', '❄️', '🌤️', '💨', '🌪️'] },
            sports: { name: 'sports', singular: 'a sport', items: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🥊'] }
        };

        const catKeys = Object.keys(categories);

        if (level < 2) {
            // Pre-K Easy: "Which one does NOT belong?" with 3 same + 1 different, easy contrast
            const easyPairs = [
                ['animals', 'fruits'], ['fruits', 'vehicles'], ['animals', 'vehicles'],
                ['food', 'animals'], ['nature', 'vehicles'], ['clothes', 'fruits']
            ];
            const pair = easyPairs[this._rand(0, easyPairs.length - 1)];
            const mainCat = categories[pair[0]];
            const oddCat = categories[pair[1]];

            const mainItems = this._shuffle(mainCat.items).slice(0, 3);
            const oddItem = oddCat.items[this._rand(0, oddCat.items.length - 1)];
            const display = this._shuffle([...mainItems, oddItem]);

            const templateType = this._rand(0, 2);

            if (templateType === 0) {
                // "Which one is NOT an animal?"
                const answers = this._shuffle([oddItem, mainItems[0], mainItems[1], mainItems[2]]);
                return {
                    question: `Which one is NOT ${mainCat.singular}?\n${display.join('  ')}`,
                    questionSpeak: `Which one is not ${mainCat.singular}?`,
                    answers,
                    correctIndex: answers.indexOf(oddItem),
                    topic: 'sorting',
                    subtype: 'odd-one-out',
                    explanation: `${oddItem} is not ${mainCat.singular}! It's ${oddCat.singular}!`,
                    explanationSpeak: `That one does not belong with the ${mainCat.name}!`
                };
            } else if (templateType === 1) {
                // "Which ones are the same kind?"
                const correct = mainItems.join(' ');
                const w1 = [mainItems[0], mainItems[1], oddItem].join(' ');
                const w2 = [oddItem, mainItems[1], mainItems[2]].join(' ');
                const answers = this._shuffle([correct, w1, w2]);
                return {
                    question: `Which group has all the same kind?\n${display.join('  ')}`,
                    questionSpeak: `Which group has all the same kind?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'sorting',
                    subtype: 'group-match',
                    explanation: `${correct} are all ${mainCat.name}!`,
                    explanationSpeak: `Those are all ${mainCat.name}!`
                };
            } else {
                // "Find the one that is different"
                const answers = display;
                return {
                    question: `One of these is different.\nFind it!\n${display.join('  ')}`,
                    questionSpeak: `One of these is different. Can you find it?`,
                    answers,
                    correctIndex: answers.indexOf(oddItem),
                    topic: 'sorting',
                    subtype: 'odd-one-out',
                    explanation: `${oddItem} is different! The others are all ${mainCat.name}!`,
                    explanationSpeak: `${oddItem} is different! The others are all ${mainCat.name}!`
                };
            }
        }

        if (level < 4) {
            // K levels: more categories, "sort into groups", attribute-based
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // "Where does X belong?"
                const cat1key = catKeys[this._rand(0, catKeys.length - 1)];
                let cat2key;
                do { cat2key = catKeys[this._rand(0, catKeys.length - 1)]; } while (cat2key === cat1key);
                const cat1 = categories[cat1key];
                const cat2 = categories[cat2key];
                const target = cat1.items[this._rand(0, cat1.items.length - 1)];
                const answers = this._shuffle([cat1.name, cat2.name, 'toys', 'shapes']);
                return {
                    question: `Where does ${target} belong?`,
                    questionSpeak: `Where does this belong?`,
                    answers,
                    correctIndex: answers.indexOf(cat1.name),
                    topic: 'sorting',
                    subtype: 'classify',
                    explanation: `${target} belongs with ${cat1.name}!`,
                    explanationSpeak: `That belongs with the ${cat1.name}!`
                };
            } else if (templateType === 1) {
                // "Which one does NOT belong?" with harder categories
                const cat1key = catKeys[this._rand(0, catKeys.length - 1)];
                let cat2key;
                do { cat2key = catKeys[this._rand(0, catKeys.length - 1)]; } while (cat2key === cat1key);
                const cat1 = categories[cat1key];
                const cat2 = categories[cat2key];
                const mainItems = this._shuffle(cat1.items).slice(0, 3);
                const oddItem = cat2.items[this._rand(0, cat2.items.length - 1)];
                const answers = this._shuffle([oddItem, ...mainItems]);
                return {
                    question: `Which one does NOT belong?\n${answers.join('  ')}`,
                    questionSpeak: `Which one does not belong?`,
                    answers,
                    correctIndex: answers.indexOf(oddItem),
                    topic: 'sorting',
                    subtype: 'odd-one-out',
                    explanation: `${oddItem} is not one of the ${cat1.name}!`,
                    explanationSpeak: `That one is not one of the ${cat1.name}!`
                };
            } else if (templateType === 2) {
                // "How many animals?" — counting within a mixed group
                const cat1key = catKeys[this._rand(0, catKeys.length - 1)];
                let cat2key;
                do { cat2key = catKeys[this._rand(0, catKeys.length - 1)]; } while (cat2key === cat1key);
                const cat1 = categories[cat1key];
                const cat2 = categories[cat2key];
                const count1 = this._rand(2, 4);
                const count2 = this._rand(1, 3);
                const items = this._shuffle([
                    ...this._shuffle(cat1.items).slice(0, count1),
                    ...this._shuffle(cat2.items).slice(0, count2)
                ]);
                const wrongs = this._shuffle([1, 2, 3, 4, 5].filter(n => n !== count1)).slice(0, 3);
                const answers = this._shuffle([count1, ...wrongs]).map(String);
                return {
                    question: `How many ${cat1.name}?\n${items.join(' ')}`,
                    questionSpeak: `How many ${cat1.name} do you see?`,
                    answers,
                    correctIndex: answers.indexOf(String(count1)),
                    topic: 'sorting',
                    subtype: 'count-category',
                    explanation: `There are ${count1} ${cat1.name}!`,
                    explanationSpeak: `There are ${count1} ${cat1.name}!`
                };
            } else {
                // "What kind of things are these?"
                const catkey = catKeys[this._rand(0, catKeys.length - 1)];
                const cat = categories[catkey];
                const items = this._shuffle(cat.items).slice(0, 3);
                const wrongCats = catKeys.filter(k => k !== catkey);
                const wrongs = this._shuffle(wrongCats).slice(0, 3).map(k => categories[k].name);
                const answers = this._shuffle([cat.name, ...wrongs]);
                return {
                    question: `What kind of things are these?\n${items.join('  ')}`,
                    questionSpeak: `What kind of things are these?`,
                    answers,
                    correctIndex: answers.indexOf(cat.name),
                    topic: 'sorting',
                    subtype: 'classify',
                    explanation: `${items.join(' ')} are all ${cat.name}!`,
                    explanationSpeak: `Those are all ${cat.name}!`
                };
            }
        }

        // 1st grade: attribute-based sorting (by size, by use, by habitat)
        const attributeSorts = [
            {
                question: 'Which animal lives in water?',
                items: ['🐟', '🐙', '🐳', '🦈', '🐬'],
                wrongs: ['🐶', '🐱', '🐻', '🦁'],
                explain: 'lives in water'
            },
            {
                question: 'Which one can fly?',
                items: ['🐦', '🦋', '✈️', '🚁', '🦅'],
                wrongs: ['🐶', '🚗', '🐟', '🚂'],
                explain: 'can fly'
            },
            {
                question: 'Which one has wheels?',
                items: ['🚗', '🚌', '🚲', '🛴', '🚂'],
                wrongs: ['🐶', '🍎', '🌳', '⚽'],
                explain: 'has wheels'
            },
            {
                question: 'Which one is something you eat?',
                items: ['🍎', '🍕', '🍌', '🌮', '🥕'],
                wrongs: ['🚗', '⚽', '🌳', '👕'],
                explain: 'is something you eat'
            },
            {
                question: 'Which one is something you wear?',
                items: ['👕', '👖', '🧢', '👟', '🧤'],
                wrongs: ['🍎', '🚗', '⚽', '🐶'],
                explain: 'is something you wear'
            }
        ];

        const attr = attributeSorts[this._rand(0, attributeSorts.length - 1)];
        const correct = attr.items[this._rand(0, attr.items.length - 1)];
        const wrongs = this._shuffle(attr.wrongs).slice(0, 3);
        const answers = this._shuffle([correct, ...wrongs]);
        return {
            question: attr.question,
            questionSpeak: attr.question,
            answers,
            correctIndex: answers.indexOf(correct),
            topic: 'sorting',
            subtype: 'attribute',
            explanation: `${correct} ${attr.explain}!`,
            explanationSpeak: `That one ${attr.explain}!`
        };
    },

    // ---- BIG & SMALL / SIZE CONCEPTS ----
    _size(level) {
        const sizePairs = [
            { big: '🐘', small: '🐭', bigName: 'elephant', smallName: 'mouse' },
            { big: '🦁', small: '🐱', bigName: 'lion', smallName: 'cat' },
            { big: '🐋', small: '🐟', bigName: 'whale', smallName: 'fish' },
            { big: '🦒', small: '🐿️', bigName: 'giraffe', smallName: 'squirrel' },
            { big: '🐻', small: '🐰', bigName: 'bear', smallName: 'bunny' },
            { big: '🏠', small: '🏕️', bigName: 'house', smallName: 'tent' },
            { big: '🚌', small: '🚗', bigName: 'bus', smallName: 'car' },
            { big: '🌳', small: '🌱', bigName: 'tree', smallName: 'sprout' },
            { big: '🏔️', small: '⛰️', bigName: 'mountain', smallName: 'hill' },
            { big: '🌍', small: '🌕', bigName: 'Earth', smallName: 'Moon' },
            { big: '✈️', small: '🚁', bigName: 'airplane', smallName: 'helicopter' },
            { big: '🐎', small: '🐕', bigName: 'horse', smallName: 'dog' }
        ];

        const sizeOrder = [
            { items: ['🐭', '🐱', '🐶', '🐻', '🐘'], names: ['mouse', 'cat', 'dog', 'bear', 'elephant'] },
            { items: ['🐜', '🐸', '🐰', '🦁', '🐋'], names: ['ant', 'frog', 'bunny', 'lion', 'whale'] },
            { items: ['🌱', '🌻', '🌳', '🏔️', '🌍'], names: ['sprout', 'flower', 'tree', 'mountain', 'Earth'] }
        ];

        if (level < 2) {
            // Pre-K Easy: simple "which is bigger/smaller" with 2-3 choices
            const pair = sizePairs[this._rand(0, sizePairs.length - 1)];
            const askBig = Math.random() < 0.5;
            const templateType = this._rand(0, 2);

            if (templateType === 0) {
                // "Which is bigger?"
                const answers = this._shuffle([pair.big, pair.small]);
                const correct = askBig ? pair.big : pair.small;
                return {
                    question: `Which is ${askBig ? 'BIGGER' : 'SMALLER'}?\n${pair.big}  ${pair.small}`,
                    questionSpeak: `Which is ${askBig ? 'bigger' : 'smaller'}?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'size',
                    subtype: 'compare',
                    explanation: `${askBig ? pair.big + ' ' + pair.bigName : pair.small + ' ' + pair.smallName} is ${askBig ? 'bigger' : 'smaller'}!`,
                    explanationSpeak: `The ${askBig ? pair.bigName : pair.smallName} is ${askBig ? 'bigger' : 'smaller'}!`
                };
            } else if (templateType === 1) {
                // "Which animal is the biggest?" with 3 emoji choices
                const others = sizePairs.filter(p => p !== pair);
                const third = others[this._rand(0, others.length - 1)];
                const items = this._shuffle([pair.big, pair.small, third.small]);
                return {
                    question: `Which one is the BIGGEST?\n${items.join('  ')}`,
                    questionSpeak: `Which one is the biggest?`,
                    answers: items,
                    correctIndex: items.indexOf(pair.big),
                    topic: 'size',
                    subtype: 'compare',
                    explanation: `${pair.big} ${pair.bigName} is the biggest!`,
                    explanationSpeak: `The ${pair.bigName} is the biggest!`
                };
            } else {
                // "Is [X] big or small?"
                const target = Math.random() < 0.5 ?
                    { emoji: pair.big, name: pair.bigName, answer: 'BIG' } :
                    { emoji: pair.small, name: pair.smallName, answer: 'SMALL' };
                const answers = this._shuffle(['BIG', 'SMALL']);
                return {
                    question: `Is ${target.emoji} ${target.name} big or small?`,
                    questionSpeak: `Is a ${target.name} big or small?`,
                    answers,
                    correctIndex: answers.indexOf(target.answer),
                    topic: 'size',
                    subtype: 'identify',
                    explanation: `A ${target.name} is ${target.answer.toLowerCase()}!`,
                    explanationSpeak: `A ${target.name} is ${target.answer.toLowerCase()}!`
                };
            }
        }

        if (level < 4) {
            // K levels: ordering by size, tall/short, long/short, heavy/light
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // "Put in order: smallest to biggest"
                const set = sizeOrder[this._rand(0, sizeOrder.length - 1)];
                const subset = set.items.slice(0, 3);
                const correct = subset.join(' → ');
                const w1 = [...subset].reverse().join(' → ');
                const w2 = [subset[1], subset[0], subset[2]].join(' → ');
                const answers = this._shuffle([correct, w1, w2]);
                return {
                    question: `Put in order:\nSmallest → Biggest\n${this._shuffle(subset).join('  ')}`,
                    questionSpeak: `Put these in order from smallest to biggest`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'size',
                    subtype: 'ordering',
                    explanation: `${correct} — smallest to biggest!`,
                    explanationSpeak: `That's the right order from smallest to biggest!`
                };
            } else if (templateType === 1) {
                // "Which is TALLER?" (height concept)
                const tallPairs = [
                    { tall: '🦒', short: '🐕', tallName: 'giraffe', shortName: 'dog' },
                    { tall: '🌳', short: '🌱', tallName: 'tree', shortName: 'sprout' },
                    { tall: '🏢', short: '🏠', tallName: 'building', shortName: 'house' },
                    { tall: '🏔️', short: '⛰️', tallName: 'mountain', shortName: 'hill' }
                ];
                const tp = tallPairs[this._rand(0, tallPairs.length - 1)];
                const askTall = Math.random() < 0.5;
                const answers = this._shuffle([tp.tall, tp.short]);
                const correct = askTall ? tp.tall : tp.short;
                return {
                    question: `Which is ${askTall ? 'TALLER' : 'SHORTER'}?\n${tp.tall}  ${tp.short}`,
                    questionSpeak: `Which one is ${askTall ? 'taller' : 'shorter'}?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'size',
                    subtype: 'tall-short',
                    explanation: `${correct} is ${askTall ? 'taller' : 'shorter'}!`,
                    explanationSpeak: `The ${askTall ? tp.tallName : tp.shortName} is ${askTall ? 'taller' : 'shorter'}!`
                };
            } else if (templateType === 2) {
                // "Which is HEAVIER?"
                const heavyPairs = [
                    { heavy: '🐘', light: '🐦', heavyName: 'elephant', lightName: 'bird' },
                    { heavy: '🚗', light: '🚲', heavyName: 'car', lightName: 'bicycle' },
                    { heavy: '🪨', light: '🪶', heavyName: 'rock', lightName: 'feather' },
                    { heavy: '🐋', light: '🐟', heavyName: 'whale', lightName: 'fish' }
                ];
                const hp = heavyPairs[this._rand(0, heavyPairs.length - 1)];
                const askHeavy = Math.random() < 0.5;
                const answers = this._shuffle([hp.heavy, hp.light]);
                const correct = askHeavy ? hp.heavy : hp.light;
                return {
                    question: `Which is ${askHeavy ? 'HEAVIER' : 'LIGHTER'}?\n${hp.heavy}  ${hp.light}`,
                    questionSpeak: `Which one is ${askHeavy ? 'heavier' : 'lighter'}?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'size',
                    subtype: 'heavy-light',
                    explanation: `${correct} is ${askHeavy ? 'heavier' : 'lighter'}!`,
                    explanationSpeak: `The ${askHeavy ? hp.heavyName : hp.lightName} is ${askHeavy ? 'heavier' : 'lighter'}!`
                };
            } else {
                // "Which one is the smallest?"
                const pair = sizePairs[this._rand(0, sizePairs.length - 1)];
                const others = sizePairs.filter(p => p !== pair);
                const mid = others[this._rand(0, others.length - 1)];
                const items = this._shuffle([pair.big, pair.small, mid.big]);
                return {
                    question: `Which is the SMALLEST?\n${items.join('  ')}`,
                    questionSpeak: `Which one is the smallest?`,
                    answers: items,
                    correctIndex: items.indexOf(pair.small),
                    topic: 'size',
                    subtype: 'compare',
                    explanation: `${pair.small} ${pair.smallName} is the smallest!`,
                    explanationSpeak: `The ${pair.smallName} is the smallest!`
                };
            }
        }

        // V20: 2nd grade size — order items by measurement, which unit makes sense?
        if (level >= 6) {
            return this._size2nd(level);
        }

        // 1st grade: measurement vocabulary, comparisons with numbers
        const templateType = this._rand(0, 2);

        if (templateType === 0) {
            // "Which unit do we use to measure...?"
            const measures = [
                { thing: 'how tall you are', unit: 'inches', wrongs: ['pounds', 'minutes', 'cups'] },
                { thing: 'how heavy a bag is', unit: 'pounds', wrongs: ['inches', 'minutes', 'cups'] },
                { thing: 'how long a movie is', unit: 'minutes', wrongs: ['inches', 'pounds', 'cups'] },
                { thing: 'how much water in a glass', unit: 'cups', wrongs: ['inches', 'pounds', 'minutes'] }
            ];
            const m = measures[this._rand(0, measures.length - 1)];
            const answers = this._shuffle([m.unit, ...m.wrongs]);
            return {
                question: `What do we use to measure\n${m.thing}?`,
                questionSpeak: `What do we use to measure ${m.thing}?`,
                answers,
                correctIndex: answers.indexOf(m.unit),
                topic: 'size',
                subtype: 'units',
                explanation: `We measure ${m.thing} in ${m.unit}!`,
                explanationSpeak: `We measure ${m.thing} in ${m.unit}!`
            };
        } else if (templateType === 1) {
            // "Which is longer: 5 inches or 2 inches?"
            const a = this._rand(2, 8);
            let b;
            do { b = this._rand(1, 9); } while (b === a);
            const unit = ['inches', 'feet', 'pounds', 'cups'][this._rand(0, 3)];
            const bigger = Math.max(a, b);
            const answers = this._shuffle([`${a} ${unit}`, `${b} ${unit}`]);
            return {
                question: `Which is more?\n${a} ${unit}  or  ${b} ${unit}`,
                questionSpeak: `Which is more? ${a} ${unit} or ${b} ${unit}?`,
                answers,
                correctIndex: answers.indexOf(`${bigger} ${unit}`),
                topic: 'size',
                subtype: 'compare-measure',
                explanation: `${bigger} ${unit} is more than ${Math.min(a, b)} ${unit}!`,
                explanationSpeak: `${bigger} ${unit} is more!`
            };
        } else {
            // "Put in order: smallest to biggest" with 4 items
            const set = sizeOrder[this._rand(0, sizeOrder.length - 1)];
            const subset = set.items.slice(0, 4);
            const correct = subset.join(' → ');
            const w1 = [...subset].reverse().join(' → ');
            const w2 = [subset[2], subset[0], subset[1], subset[3]].join(' → ');
            const w3 = [subset[0], subset[2], subset[1], subset[3]].join(' → ');
            const answers = this._shuffle([correct, w1, w2, w3]);
            return {
                question: `Order: Smallest → Biggest\n${this._shuffle(subset).join('  ')}`,
                questionSpeak: `Put these in order from smallest to biggest`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'size',
                subtype: 'ordering',
                explanation: `${correct} — perfect order!`,
                explanationSpeak: `That's the right order from smallest to biggest!`
            };
        }
    },

    // ===== V20: 2ND GRADE EXTENSIONS FOR EXISTING TOPICS =====

    // V20: 2nd grade addition
    _addition2nd(level) {
        const templateType = this._rand(0, 2);
        if (templateType === 0 || (level === 6 && templateType === 1)) {
            // 2-digit + 1-digit (level 6) or 2-digit + 2-digit (level 7)
            let a, b;
            if (level <= 6) {
                a = this._rand(11, 89);
                b = this._rand(2, 9);
            } else {
                a = this._rand(11, 59);
                b = this._rand(11, 49);
            }
            const correct = a + b;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(10, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            const regroup = (a % 10 + b % 10) >= 10;
            return {
                question: `${a} + ${b} = ?`,
                questionSpeak: `What is ${a} plus ${b}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'addition',
                subtype: 'regrouping',
                explanation: `${a} + ${b} = ${correct}!${regroup ? ' You need to regroup the ones!' : ''}`,
                explanationSpeak: `${a} plus ${b} equals ${correct}!`
            };
        } else {
            // Missing addend with bigger numbers
            const total = this._rand(20, level >= 7 ? 100 : 50);
            const a = this._rand(5, total - 5);
            const correct = total - a;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${a} + ___ = ${total}`,
                questionSpeak: `${a} plus what equals ${total}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'addition',
                subtype: 'missing-addend',
                explanation: `${a} + ${correct} = ${total}!`,
                explanationSpeak: `${a} plus ${correct} equals ${total}!`
            };
        }
    },

    // V20: 2nd grade subtraction
    _subtraction2nd(level) {
        const templateType = this._rand(0, 2);
        if (templateType === 0 || templateType === 1) {
            let a, b;
            if (level <= 6) {
                a = this._rand(20, 89);
                b = this._rand(2, 9);
            } else {
                a = this._rand(30, 99);
                b = this._rand(11, a - 5);
            }
            const correct = a - b;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            const regroup = (a % 10) < (b % 10);
            return {
                question: `${a} - ${b} = ?`,
                questionSpeak: `What is ${a} minus ${b}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'subtraction',
                subtype: 'regrouping',
                explanation: `${a} - ${b} = ${correct}!${regroup ? ' You need to borrow from the tens!' : ''}`,
                explanationSpeak: `${a} minus ${b} equals ${correct}!`
            };
        } else {
            // "How many more?" comparison subtraction
            const a = this._rand(20, 60);
            const b = this._rand(5, a - 5);
            const correct = a - b;
            const names = ['Jake', 'Mia', 'Ben', 'Sara'];
            const n1 = names[this._rand(0, 3)];
            let n2;
            do { n2 = names[this._rand(0, 3)]; } while (n2 === n1);
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${n1} has ${a} stickers.\n${n2} has ${b}.\nHow many MORE does\n${n1} have?`,
                questionSpeak: `${n1} has ${a} stickers. ${n2} has ${b}. How many more does ${n1} have?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'subtraction',
                subtype: 'comparison',
                explanation: `${a} - ${b} = ${correct}. ${n1} has ${correct} more!`,
                explanationSpeak: `${a} minus ${b} equals ${correct}. ${n1} has ${correct} more!`
            };
        }
    },

    // V20: 2nd grade shapes
    _shapes2nd(level) {
        const templateType = this._rand(0, 3);
        if (templateType === 0) {
            // 3D shapes
            const shapes3d = [
                { name: 'cube', faces: 6, desc: 'like a box — 6 flat faces, all squares' },
                { name: 'sphere', faces: 0, desc: 'like a ball — round with no flat faces' },
                { name: 'cone', faces: 1, desc: 'like an ice cream cone — 1 flat circle and a point' },
                { name: 'cylinder', faces: 2, desc: 'like a can — 2 flat circles and a curved side' },
                { name: 'rectangular prism', faces: 6, desc: 'like a cereal box — 6 flat faces, rectangles' }
            ];
            const target = shapes3d[this._rand(0, shapes3d.length - 1)];
            const wrongs = shapes3d.filter(s => s.name !== target.name).map(s => s.name);
            const answers = this._shuffle([target.name, ...this._shuffle(wrongs).slice(0, 3)]);
            return {
                question: `Which 3D shape is ${target.desc.split('—')[0].trim()}?`,
                questionSpeak: `Which 3D shape is ${target.desc.split('—')[0].trim()}?`,
                answers,
                correctIndex: answers.indexOf(target.name),
                topic: 'shapes',
                subtype: '3d-identify',
                explanation: `A ${target.name} is ${target.desc}!`,
                explanationSpeak: `A ${target.name} is ${target.desc}!`
            };
        } else if (templateType === 1) {
            // Count faces
            const shapes3d = [
                { name: 'cube', faces: 6 },
                { name: 'cone', faces: 1 },
                { name: 'cylinder', faces: 2 },
                { name: 'rectangular prism', faces: 6 },
                { name: 'sphere', faces: 0 }
            ];
            const target = shapes3d[this._rand(0, shapes3d.length - 1)];
            const correct = target.faces;
            const wrongs = shapes3d.filter(s => s.faces !== correct).map(s => s.faces);
            const uniqueWrongs = [...new Set(wrongs)];
            const answers = this._shuffle([correct, ...this._shuffle(uniqueWrongs).slice(0, 3)]);
            return {
                question: `How many flat faces\ndoes a ${target.name} have?`,
                questionSpeak: `How many flat faces does a ${target.name} have?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'shapes',
                subtype: '3d-faces',
                explanation: `A ${target.name} has ${correct} flat face${correct !== 1 ? 's' : ''}!`,
                explanationSpeak: `A ${target.name} has ${correct} flat faces!`
            };
        } else if (templateType === 2) {
            // Partition a rectangle into rows × columns
            const rows = this._rand(2, 4);
            const cols = this._rand(2, 4);
            const correct = rows * cols;
            const wrongs = this._makeWrongAnswers(correct, 3, 2, correct + 4);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `Split a rectangle into\n${rows} rows and ${cols} columns.\nHow many small squares?`,
                questionSpeak: `If you split a rectangle into ${rows} rows and ${cols} columns, how many small squares do you get?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'shapes',
                subtype: 'partitioning',
                explanation: `${rows} rows × ${cols} columns = ${correct} squares!`,
                explanationSpeak: `${rows} times ${cols} equals ${correct} squares!`
            };
        } else {
            // Real-world 3D shape identification
            const realWorld = [
                { obj: 'basketball', shape: 'sphere', wrongs: ['cube', 'cylinder', 'cone'] },
                { obj: 'dice', shape: 'cube', wrongs: ['sphere', 'cylinder', 'cone'] },
                { obj: 'soup can', shape: 'cylinder', wrongs: ['cube', 'sphere', 'cone'] },
                { obj: 'ice cream cone', shape: 'cone', wrongs: ['cube', 'sphere', 'cylinder'] },
                { obj: 'cereal box', shape: 'rectangular prism', wrongs: ['cube', 'sphere', 'cylinder'] }
            ];
            const item = realWorld[this._rand(0, realWorld.length - 1)];
            const answers = this._shuffle([item.shape, ...item.wrongs]);
            return {
                question: `A ${item.obj} is shaped\nlike a ___`,
                questionSpeak: `What shape is a ${item.obj}?`,
                answers,
                correctIndex: answers.indexOf(item.shape),
                topic: 'shapes',
                subtype: '3d-real-world',
                explanation: `A ${item.obj} is shaped like a ${item.shape}!`,
                explanationSpeak: `A ${item.obj} is a ${item.shape}!`
            };
        }
    },

    // V20: 2nd grade patterns
    _patterns2nd(level) {
        const templateType = this._rand(0, 3);
        if (templateType === 0) {
            // Number patterns: +2, +5, +10, +3
            const step = [2, 3, 5, 10][this._rand(0, 3)];
            const start = this._rand(1, 20);
            const seq = [];
            for (let i = 0; i < 4; i++) seq.push(start + i * step);
            const correct = start + 4 * step;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - step * 2), correct + step * 2);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `What comes next?\n${seq.join(', ')}, ___`,
                questionSpeak: `What comes next? ${seq.join(', ')}`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'patterns',
                subtype: 'number-pattern',
                explanation: `The rule is +${step}! ${seq.join(', ')}, ${correct}!`,
                explanationSpeak: `The pattern adds ${step} each time. ${correct} comes next!`
            };
        } else if (templateType === 1) {
            // Find the rule
            const step = [2, 3, 5, 10][this._rand(0, 3)];
            const start = this._rand(1, 15);
            const seq = [];
            for (let i = 0; i < 5; i++) seq.push(start + i * step);
            const correct = `Add ${step}`;
            const wrongs = [`Add ${step + 1}`, `Add ${step - 1}`, `Subtract ${step}`].filter(w => w !== correct && !w.includes('Add 0'));
            if (wrongs.length < 3) wrongs.push(`Add ${step + 2}`);
            const answers = this._shuffle([correct, ...wrongs.slice(0, 3)]);
            return {
                question: `What's the rule?\n${seq.join(', ')}`,
                questionSpeak: `What's the rule for this pattern? ${seq.join(', ')}`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'patterns',
                subtype: 'find-rule',
                explanation: `The rule is "${correct}"! Each number is ${step} more!`,
                explanationSpeak: `The rule is add ${step}!`
            };
        } else if (templateType === 2) {
            // Decreasing pattern
            const step = [2, 5, 10][this._rand(0, 2)];
            const start = this._rand(5, 10) * step;
            const seq = [];
            for (let i = 0; i < 4; i++) seq.push(start - i * step);
            const correct = start - 4 * step;
            if (correct < 0) return this._patterns2nd(level);
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - step * 2), correct + step * 2);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `What comes next?\n${seq.join(', ')}, ___`,
                questionSpeak: `What comes next? ${seq.join(', ')}`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'patterns',
                subtype: 'decreasing-pattern',
                explanation: `The rule is -${step}! ${seq.join(', ')}, ${correct}!`,
                explanationSpeak: `The pattern subtracts ${step} each time!`
            };
        } else {
            // Growing shape pattern (triangle numbers / square numbers visual)
            const patterns = [
                { seq: [1, 3, 5, 7], next: 9, rule: 'adds 2 each time (odd numbers)' },
                { seq: [1, 4, 9, 16], next: 25, rule: 'square numbers: 1×1, 2×2, 3×3, 4×4, 5×5' },
                { seq: [2, 4, 8, 16], next: 32, rule: 'doubles each time' },
                { seq: [1, 2, 4, 7], next: 11, rule: 'adds 1 more each time: +1, +2, +3, +4' }
            ];
            const p = patterns[this._rand(0, level >= 7 ? 3 : 1)];
            const wrongs = this._makeWrongAnswers(p.next, 3, Math.max(1, p.next - 5), p.next + 5);
            const answers = this._shuffle([p.next, ...wrongs]);
            return {
                question: `What comes next?\n${p.seq.join(', ')}, ___`,
                questionSpeak: `What comes next? ${p.seq.join(', ')}`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(p.next),
                topic: 'patterns',
                subtype: 'growing-pattern',
                explanation: `The pattern ${p.rule}! Next is ${p.next}!`,
                explanationSpeak: `${p.next} comes next! The pattern ${p.rule}!`
            };
        }
    },

    // V20: 2nd grade word problems
    _wordProblems2nd(name, level) {
        const templateType = this._rand(0, 3);
        if (templateType === 0) {
            // 2-step problems
            const obj = ['apples', 'stickers', 'books', 'cards'][this._rand(0, 3)];
            const a = this._rand(15, 40);
            const b = this._rand(5, 20);
            const c = this._rand(3, Math.min(15, a + b - 1));
            const correct = a + b - c;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${name} has ${a} ${obj}.\nGets ${b} more, then gives\naway ${c}. How many now?`,
                questionSpeak: `${name} has ${a} ${obj}. Gets ${b} more, then gives away ${c}. How many now?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'word-problems',
                subtype: 'two-step',
                explanation: `${a} + ${b} = ${a + b}, then ${a + b} - ${c} = ${correct}!`,
                explanationSpeak: `${a} plus ${b} is ${a + b}, minus ${c} is ${correct}!`
            };
        } else if (templateType === 1) {
            // "How many more/fewer?"
            const obj = ['points', 'stickers', 'pages', 'coins'][this._rand(0, 3)];
            const a = this._rand(20, 60);
            const b = this._rand(10, a - 5);
            const correct = a - b;
            const names = ['Jake', 'Mia', 'Ben', 'Sara'];
            const n2 = names[this._rand(0, 3)];
            const askMore = Math.random() < 0.5;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${name} has ${a} ${obj}.\n${n2} has ${b} ${obj}.\nHow many ${askMore ? 'more' : 'fewer'}\ndoes ${askMore ? name : n2} have?`,
                questionSpeak: `${name} has ${a} ${obj}. ${n2} has ${b} ${obj}. How many ${askMore ? 'more' : 'fewer'} does ${askMore ? name : n2} have?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'word-problems',
                subtype: 'comparison',
                explanation: `${a} - ${b} = ${correct}. The difference is ${correct}!`,
                explanationSpeak: `${a} minus ${b} is ${correct}!`
            };
        } else if (templateType === 2) {
            // Addition with larger numbers
            const obj = ['students', 'chairs', 'books', 'crayons'][this._rand(0, 3)];
            const a = this._rand(20, 50);
            const b = this._rand(15, 50);
            const correct = a + b;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(20, correct - 15), correct + 15);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${a} ${obj} in one room.\n${b} ${obj} in another.\nHow many total?`,
                questionSpeak: `${a} ${obj} in one room and ${b} in another. How many total?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'word-problems',
                subtype: 'add-context',
                explanation: `${a} + ${b} = ${correct} ${obj} total!`,
                explanationSpeak: `${a} plus ${b} equals ${correct}!`
            };
        } else {
            // Multiplication word problem
            const obj = ['packs', 'boxes', 'bags', 'plates'][this._rand(0, 3)];
            const items = ['cookies', 'crayons', 'stickers', 'grapes'][this._rand(0, 3)];
            const groups = this._rand(2, 5);
            const per = this._rand(3, 8);
            const correct = groups * per;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(2, correct - 8), correct + 8);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${name} has ${groups} ${obj}.\nEach has ${per} ${items}.\nHow many ${items} in all?`,
                questionSpeak: `${name} has ${groups} ${obj} with ${per} ${items} each. How many ${items} in all?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'word-problems',
                subtype: 'multiplication',
                explanation: `${groups} × ${per} = ${correct} ${items}!`,
                explanationSpeak: `${groups} times ${per} equals ${correct} ${items}!`
            };
        }
    },

    // V20: 2nd grade sorting
    _sorting2nd(level) {
        const templateType = this._rand(0, 2);
        if (templateType === 0) {
            // Venn diagram concept: belongs in both groups?
            const scenarios = [
                { groupA: 'Has wings', groupB: 'Is an animal', both: ['🦋', '🐦', '🦅'], onlyA: ['✈️', '🚁'], onlyB: ['🐶', '🐱', '🐟'] },
                { groupA: 'Is round', groupB: 'Is food', both: ['🍊', '🍎', '🍪'], onlyA: ['⚽', '🏀'], onlyB: ['🌮', '🍕', '🥪'] },
                { groupA: 'Has 4 legs', groupB: 'Is a pet', both: ['🐶', '🐱'], onlyA: ['🦁', '🐘', '🦒'], onlyB: ['🐟', '🐦'] }
            ];
            const s = scenarios[this._rand(0, scenarios.length - 1)];
            const target = s.both[this._rand(0, s.both.length - 1)];
            const correct = 'Both groups!';
            const answers = this._shuffle([correct, `Only "${s.groupA}"`, `Only "${s.groupB}"`, 'Neither']);
            return {
                question: `Where does ${target} go?\nGroup A: ${s.groupA}\nGroup B: ${s.groupB}`,
                questionSpeak: `Where does this go? Group A is ${s.groupA}. Group B is ${s.groupB}.`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'sorting',
                subtype: 'venn-diagram',
                explanation: `${target} belongs in BOTH groups!`,
                explanationSpeak: `It belongs in both groups!`
            };
        } else if (templateType === 1) {
            // Classify shapes by attributes
            const attributes = [
                { attr: '4 sides', yes: ['square', 'rectangle', 'rhombus'], no: ['triangle', 'circle', 'pentagon'] },
                { attr: 'no corners', yes: ['circle', 'oval'], no: ['square', 'triangle', 'rectangle', 'hexagon'] },
                { attr: 'all sides equal', yes: ['square', 'equilateral triangle'], no: ['rectangle', 'oval', 'right triangle'] }
            ];
            const a = attributes[this._rand(0, attributes.length - 1)];
            const target = [...a.yes, ...a.no][this._rand(0, a.yes.length + a.no.length - 1)];
            const isYes = a.yes.includes(target);
            const correct = isYes ? 'Yes' : 'No';
            const answers = ['Yes', 'No'];
            return {
                question: `Does a ${target} have\n${a.attr}?`,
                questionSpeak: `Does a ${target} have ${a.attr}?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'sorting',
                subtype: 'classify-attribute',
                explanation: `A ${target} ${isYes ? 'does' : 'does NOT'} have ${a.attr}!`,
                explanationSpeak: `A ${target} ${isYes ? 'does' : 'does not'} have ${a.attr}!`
            };
        } else {
            // Sort by 2 attributes
            const items = [
                { name: '🐘', attrs: ['big', 'gray', 'animal'] },
                { name: '🐭', attrs: ['small', 'gray', 'animal'] },
                { name: '🚗', attrs: ['small', 'red', 'vehicle'] },
                { name: '🚌', attrs: ['big', 'yellow', 'vehicle'] },
                { name: '🌻', attrs: ['yellow', 'small', 'plant'] },
                { name: '🌳', attrs: ['big', 'green', 'plant'] }
            ];
            const target = items[this._rand(0, items.length - 1)];
            const attr = target.attrs[this._rand(0, target.attrs.length - 1)];
            const matching = items.filter(i => i.attrs.includes(attr) && i.name !== target.name);
            if (matching.length === 0) return this._sorting2nd(level);
            const match = matching[this._rand(0, matching.length - 1)];
            const nonMatching = items.filter(i => !i.attrs.includes(attr) && i.name !== target.name);
            if (nonMatching.length < 2) return this._sorting2nd(level);
            const wrongs = this._shuffle(nonMatching).slice(0, 3).map(i => i.name);
            const answers = this._shuffle([match.name, ...wrongs]);
            return {
                question: `${target.name} is ${attr}.\nWhich one is also ${attr}?`,
                questionSpeak: `This is ${attr}. Which one is also ${attr}?`,
                answers,
                correctIndex: answers.indexOf(match.name),
                topic: 'sorting',
                subtype: 'match-attribute',
                explanation: `${match.name} is also ${attr}!`,
                explanationSpeak: `That one is also ${attr}!`
            };
        }
    },

    // V20: 2nd grade counting
    _counting2nd(level) {
        const roll = Math.random();
        if (roll < 0.3) {
            // Count by 2s/5s/10s to 100
            const steps = [2, 5, 10];
            const step = steps[this._rand(0, 2)];
            const maxStart = step === 2 ? 80 : step === 5 ? 75 : 50;
            const start = this._rand(1, Math.floor(maxStart / step)) * step;
            const count = 4;
            const seq = [];
            for (let i = 0; i < count; i++) seq.push(start + i * step);
            const correct = start + count * step;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - step * 2), correct + step * 2);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `Count by ${step}s:\n${seq.join(', ')}, ___`,
                questionSpeak: `Count by ${step}s. What comes next? ${seq.join(', ')}`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'counting',
                subtype: 'skip-count',
                explanation: `Counting by ${step}s: ${seq.join(', ')}, ${correct}!`,
                explanationSpeak: `Counting by ${step}s. ${correct} comes next!`
            };
        } else if (roll < 0.5) {
            // Count backwards from 100
            const start = this._rand(50, 100);
            const count = 4;
            const seq = [];
            for (let i = 0; i < count; i++) seq.push(start - i);
            const correct = start - count;
            const wrongs = this._makeWrongAnswers(correct, 3, correct - 3, correct + 3);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `Count backwards:\n${seq.join(', ')}, ___`,
                questionSpeak: `Count backwards. What comes next? ${seq.join(', ')}`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'counting',
                subtype: 'count-backwards',
                explanation: `Counting backwards: ${seq.join(', ')}, ${correct}!`,
                explanationSpeak: `${correct} comes next when counting backwards!`
            };
        } else if (level >= 7 && roll < 0.75) {
            // Count to 1000 — what comes after?
            const hundreds = this._rand(1, 9) * 100;
            const n = hundreds + this._rand(0, 99);
            const correct = n + 1;
            const wrongs = this._makeWrongAnswers(correct, 3, n - 3, n + 5);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `What number comes\nright after ${n}?`,
                questionSpeak: `What number comes right after ${n}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'counting',
                subtype: 'count-after',
                explanation: `${correct} comes right after ${n}!`,
                explanationSpeak: `${correct} comes right after ${n}!`
            };
        } else {
            // Count by 100s
            const start = this._rand(1, 5) * 100;
            const seq = [start, start + 100, start + 200];
            const correct = start + 300;
            const wrongs = this._makeWrongAnswers(correct, 3, correct - 200, correct + 200);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `Count by 100s:\n${seq.join(', ')}, ___`,
                questionSpeak: `Count by hundreds. What comes next? ${seq.join(', ')}`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'counting',
                subtype: 'skip-count-hundreds',
                explanation: `Counting by 100s: ${seq.join(', ')}, ${correct}!`,
                explanationSpeak: `${correct} comes next when counting by hundreds!`
            };
        }
    },

    // V20: 2nd grade size/measurement
    _size2nd(level) {
        const templateType = this._rand(0, 3);
        if (templateType === 0) {
            // Order 3 items by measurement value
            const unit = ['inches', 'feet', 'pounds', 'cups'][this._rand(0, 3)];
            const vals = this._shuffle([this._rand(2, 5), this._rand(6, 10), this._rand(11, 20)]);
            const sorted = [...vals].sort((a, b) => a - b);
            const correct = sorted.map(v => `${v} ${unit}`).join(', ');
            const w1 = [...sorted].reverse().map(v => `${v} ${unit}`).join(', ');
            const w2 = [sorted[1], sorted[0], sorted[2]].map(v => `${v} ${unit}`).join(', ');
            const answers = this._shuffle([correct, w1, w2]);
            return {
                question: `Order least to greatest:\n${vals.map(v => `${v} ${unit}`).join(',  ')}`,
                questionSpeak: `Put these in order from least to greatest`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'size',
                subtype: 'ordering',
                explanation: `${correct} — from smallest to largest!`,
                explanationSpeak: `The right order is ${correct}!`
            };
        } else if (templateType === 1) {
            // "Which unit makes sense?"
            const scenarios = [
                { thing: 'the length of a pencil', unit: 'inches', wrongs: ['miles', 'pounds', 'gallons'] },
                { thing: 'the weight of a dog', unit: 'pounds', wrongs: ['inches', 'seconds', 'gallons'] },
                { thing: 'how far to school', unit: 'miles', wrongs: ['inches', 'ounces', 'cups'] },
                { thing: 'water in a bathtub', unit: 'gallons', wrongs: ['inches', 'pounds', 'miles'] },
                { thing: 'a basketball game', unit: 'minutes', wrongs: ['inches', 'pounds', 'gallons'] },
                { thing: 'the height of a door', unit: 'feet', wrongs: ['ounces', 'miles', 'gallons'] }
            ];
            const s = scenarios[this._rand(0, scenarios.length - 1)];
            const answers = this._shuffle([s.unit, ...s.wrongs]);
            return {
                question: `Which unit makes sense\nfor ${s.thing}?`,
                questionSpeak: `Which unit makes sense for measuring ${s.thing}?`,
                answers,
                correctIndex: answers.indexOf(s.unit),
                topic: 'size',
                subtype: 'units',
                explanation: `We measure ${s.thing} in ${s.unit}!`,
                explanationSpeak: `We measure ${s.thing} in ${s.unit}!`
            };
        } else if (templateType === 2) {
            // Estimate — "About how long is a [object]?"
            const estimates = [
                { obj: 'crayon', val: 4, unit: 'inches', wrongs: ['40 inches', '4 feet', '4 miles'] },
                { obj: 'school bus', val: 35, unit: 'feet', wrongs: ['35 inches', '35 miles', '3 feet'] },
                { obj: 'book', val: 10, unit: 'inches', wrongs: ['10 feet', '10 miles', '100 inches'] },
                { obj: 'classroom', val: 30, unit: 'feet', wrongs: ['30 inches', '30 miles', '3 inches'] }
            ];
            const e = estimates[this._rand(0, estimates.length - 1)];
            const correct = `${e.val} ${e.unit}`;
            const answers = this._shuffle([correct, ...e.wrongs]);
            return {
                question: `About how long is a ${e.obj}?`,
                questionSpeak: `About how long is a ${e.obj}?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'size',
                subtype: 'estimate',
                explanation: `A ${e.obj} is about ${e.val} ${e.unit} long!`,
                explanationSpeak: `A ${e.obj} is about ${e.val} ${e.unit}!`
            };
        } else {
            // Compare two measurements with different values
            const a = this._rand(3, 12);
            const b = this._rand(3, 12);
            const unit = ['inches', 'feet', 'centimeters'][this._rand(0, 2)];
            const diff = Math.abs(a - b);
            const correct = a > b ? `${a} ${unit}` : `${b} ${unit}`;
            const word = 'longer';
            const answers = this._shuffle([`${a} ${unit}`, `${b} ${unit}`, `Same length`]);
            if (a === b) {
                return {
                    question: `Compare: ${a} ${unit} and ${b} ${unit}`,
                    questionSpeak: `Compare ${a} ${unit} and ${b} ${unit}`,
                    answers: this._shuffle(['Same length', `${a + 1} ${unit}`, `${a - 1} ${unit}`]),
                    correctIndex: 0, topic: 'size',
                    subtype: 'compare-measure',
                    explanation: `They are the same length!`,
                    explanationSpeak: `They are the same!`
                };
            }
            return {
                question: `Which is ${word}?\n${a} ${unit}  or  ${b} ${unit}`,
                questionSpeak: `Which is ${word}? ${a} ${unit} or ${b} ${unit}?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'size',
                subtype: 'compare-measure',
                explanation: `${correct} is ${word}! It's ${diff} ${unit} more!`,
                explanationSpeak: `${correct} is ${word}!`
            };
        }
    },

    // ===== V20: 8 NEW 2ND GRADE TOPIC GENERATORS =====

    // ---- MONEY ----
    _money(level) {
        // V38: 3rd grade money — dollars and cents, making change
        if (level >= 8) {
            return this._money3rd(level);
        }
        const coins = [
            { name: 'penny', plural: 'pennies', value: 1, emoji: '🪙' },
            { name: 'nickel', plural: 'nickels', value: 5, emoji: '🪙' },
            { name: 'dime', plural: 'dimes', value: 10, emoji: '🪙' },
            { name: 'quarter', plural: 'quarters', value: 25, emoji: '🪙' }
        ];

        if (level <= 6) {
            // Level 6: Identify coins, count groups of same coins
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // Identify coin value
                const coin = coins[this._rand(0, 3)];
                const correct = `${coin.value}¢`;
                const wrongs = coins.filter(c => c.value !== coin.value).map(c => `${c.value}¢`);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `How much is a ${coin.name} worth?`,
                    questionSpeak: `How much is a ${coin.name} worth?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'money',
                    subtype: 'coin-value',
                    explanation: `A ${coin.name} is worth ${coin.value} cent${coin.value > 1 ? 's' : ''}!`,
                    explanationSpeak: `A ${coin.name} is worth ${coin.value} cents!`
                };
            } else if (templateType === 1) {
                // "Which coin is worth N cents?"
                const coin = coins[this._rand(0, 3)];
                const wrongs = coins.filter(c => c.name !== coin.name).map(c => c.name);
                const answers = this._shuffle([coin.name, ...wrongs]);
                return {
                    question: `Which coin is worth\n${coin.value}¢?`,
                    questionSpeak: `Which coin is worth ${coin.value} cents?`,
                    answers,
                    correctIndex: answers.indexOf(coin.name),
                    topic: 'money',
                    subtype: 'coin-identify',
                    explanation: `A ${coin.name} is worth ${coin.value}¢!`,
                    explanationSpeak: `A ${coin.name} is worth ${coin.value} cents!`
                };
            } else if (templateType === 2) {
                // Count same coins
                const coin = coins[this._rand(0, 3)];
                const count = coin.value === 25 ? this._rand(2, 4) :
                              coin.value === 10 ? this._rand(2, 6) :
                              coin.value === 5 ? this._rand(2, 6) : this._rand(2, 10);
                const correct = coin.value * count;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - coin.value * 2), correct + coin.value * 2);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `${count} ${coin.plural}\n= how many cents?`,
                    questionSpeak: `If you have ${count} ${coin.plural}, how many cents is that?`,
                    answers: answers.map(v => `${v}¢`),
                    correctIndex: answers.indexOf(correct),
                    topic: 'money',
                    subtype: 'count-coins',
                    explanation: `${count} ${coin.plural} = ${correct}¢! Each ${coin.name} is ${coin.value}¢!`,
                    explanationSpeak: `${count} ${coin.plural} equals ${correct} cents!`
                };
            } else {
                // Which is worth more?
                const c1 = coins[this._rand(0, 3)];
                let c2;
                do { c2 = coins[this._rand(0, 3)]; } while (c2.name === c1.name);
                const correct = c1.value > c2.value ? c1.name : c2.name;
                const answers = this._shuffle([c1.name, c2.name, 'Same']);
                return {
                    question: `Which is worth MORE?\n${c1.name} or ${c2.name}`,
                    questionSpeak: `Which is worth more? A ${c1.name} or a ${c2.name}?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'money',
                    subtype: 'coin-compare',
                    explanation: `A ${correct} is worth more! ${c1.name}=${c1.value}¢, ${c2.name}=${c2.value}¢`,
                    explanationSpeak: `A ${correct} is worth more!`
                };
            }
        } else {
            // Level 7: Mixed coin addition, make change, compare amounts
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // Add mixed coins
                const c1 = coins[this._rand(1, 3)]; // not penny alone
                const c2 = coins[this._rand(0, 2)];
                const n1 = this._rand(1, 3);
                const n2 = this._rand(1, 4);
                const correct = c1.value * n1 + c2.value * n2;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 15), correct + 15);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `${n1} ${n1 === 1 ? c1.name : c1.plural} + ${n2} ${n2 === 1 ? c2.name : c2.plural}\n= how many cents?`,
                    questionSpeak: `${n1} ${n1 === 1 ? c1.name : c1.plural} plus ${n2} ${n2 === 1 ? c2.name : c2.plural}. How many cents?`,
                    answers: answers.map(v => `${v}¢`),
                    correctIndex: answers.indexOf(correct),
                    topic: 'money',
                    subtype: 'mixed-coins',
                    explanation: `${n1}×${c1.value}¢ + ${n2}×${c2.value}¢ = ${correct}¢!`,
                    explanationSpeak: `That adds up to ${correct} cents!`
                };
            } else if (templateType === 1) {
                // Make change from $1
                const price = this._rand(2, 19) * 5; // 10¢ to 95¢ in 5¢ increments
                const correct = 100 - price;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 20), correct + 20);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `You have $1.00.\nYou buy something for ${price}¢.\nHow much change?`,
                    questionSpeak: `You have one dollar. You spend ${price} cents. How much change do you get?`,
                    answers: answers.map(v => `${v}¢`),
                    correctIndex: answers.indexOf(correct),
                    topic: 'money',
                    subtype: 'make-change',
                    explanation: `$1.00 - ${price}¢ = ${correct}¢ change!`,
                    explanationSpeak: `You get ${correct} cents in change!`
                };
            } else if (templateType === 2) {
                // Compare amounts
                const a = this._rand(3, 18) * 5;
                let b;
                do { b = this._rand(3, 18) * 5; } while (b === a);
                const correctSymbol = a > b ? '>' : '<';
                const answers = this._shuffle(['>', '<', '=']);
                return {
                    question: `${a}¢ ___ ${b}¢\nWhich sign?`,
                    questionSpeak: `Compare ${a} cents and ${b} cents. Which sign?`,
                    answers,
                    correctIndex: answers.indexOf(correctSymbol),
                    topic: 'money',
                    subtype: 'compare-amounts',
                    explanation: `${a}¢ ${correctSymbol} ${b}¢ because ${Math.max(a, b)}¢ is more!`,
                    explanationSpeak: `${Math.max(a, b)} cents is more than ${Math.min(a, b)} cents!`
                };
            } else {
                // Word problem with money
                const items = [
                    { name: 'eraser', price: 25 }, { name: 'pencil', price: 15 },
                    { name: 'sticker', price: 10 }, { name: 'candy', price: 20 },
                    { name: 'bookmark', price: 30 }, { name: 'crayon', price: 5 }
                ];
                const item = items[this._rand(0, items.length - 1)];
                const qty = this._rand(2, 4);
                const correct = item.price * qty;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(5, correct - 20), correct + 20);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Each ${item.name} costs ${item.price}¢.\nYou buy ${qty}. How much total?`,
                    questionSpeak: `Each ${item.name} costs ${item.price} cents. You buy ${qty}. How much total?`,
                    answers: answers.map(v => `${v}¢`),
                    correctIndex: answers.indexOf(correct),
                    topic: 'money',
                    subtype: 'word-problem',
                    explanation: `${qty} × ${item.price}¢ = ${correct}¢!`,
                    explanationSpeak: `${qty} times ${item.price} cents equals ${correct} cents!`
                };
            }
        }
    },

    // ---- TIME ----
    _time(level) {
        // V38: 3rd grade time — elapsed time with minutes
        if (level >= 8) {
            return this._time3rd(level);
        }
        const hourWords = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

        if (level <= 6) {
            // Level 6: Read clock to hour/half-hour, match digital to analog
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // "What time does the clock show?" — hour
                const hour = this._rand(1, 12);
                const correct = `${hour}:00`;
                const wrongs = [];
                while (wrongs.length < 3) {
                    const w = `${this._rand(1, 12)}:00`;
                    if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
                }
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `🕐 The hour hand points to ${hour}.\nThe minute hand points to 12.\nWhat time is it?`,
                    questionSpeak: `The hour hand points to ${hour} and the minute hand points to 12. What time is it?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'time',
                    subtype: 'read-hour',
                    explanation: `When the minute hand is on 12, it's ${hour} o'clock — ${correct}!`,
                    explanationSpeak: `It's ${hour} o'clock!`
                };
            } else if (templateType === 1) {
                // Half hour
                const hour = this._rand(1, 12);
                const correct = `${hour}:30`;
                const wrongs = [`${hour}:00`, `${hour === 12 ? 1 : hour + 1}:00`, `${hour === 12 ? 1 : hour + 1}:30`];
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `🕐 The hour hand is between\n${hour} and ${hour === 12 ? 1 : hour + 1}.\nThe minute hand is on 6.\nWhat time is it?`,
                    questionSpeak: `The hour hand is between ${hour} and ${hour === 12 ? 1 : hour + 1}. The minute hand is on 6. What time is it?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'time',
                    subtype: 'read-half-hour',
                    explanation: `When the minute hand is on 6, it's half past — ${correct}!`,
                    explanationSpeak: `It's ${hour} thirty!`
                };
            } else if (templateType === 2) {
                // "What will you be doing at [time]?"
                const activities = [
                    { time: '7:00', timeSpeak: '7 AM', activity: 'waking up', wrongs: ['sleeping', 'having dinner', 'playing outside'] },
                    { time: '12:00', timeSpeak: '12 noon', activity: 'eating lunch', wrongs: ['sleeping', 'brushing teeth', 'stargazing'] },
                    { time: '8:00', timeSpeak: '8 PM', activity: 'getting ready for bed', wrongs: ['going to school', 'eating lunch', 'playing sports'] },
                    { time: '3:00', timeSpeak: '3 PM', activity: 'coming home from school', wrongs: ['sleeping', 'eating breakfast', 'stargazing'] }
                ];
                const a = activities[this._rand(0, activities.length - 1)];
                const answers = this._shuffle([a.activity, ...a.wrongs]);
                return {
                    question: `At ${a.time}, most kids are...`,
                    questionSpeak: `At ${a.timeSpeak}, most kids are doing what?`,
                    answers,
                    correctIndex: answers.indexOf(a.activity),
                    topic: 'time',
                    subtype: 'activities',
                    explanation: `At ${a.time}, most kids are ${a.activity}!`,
                    explanationSpeak: `At ${a.timeSpeak}, most kids are ${a.activity}!`
                };
            } else {
                // Match digital to description
                const hour = this._rand(1, 12);
                const isHalf = Math.random() < 0.5;
                const correct = isHalf ? `${hour}:30` : `${hour}:00`;
                const desc = isHalf ? `half past ${hourWords[hour]}` : `${hourWords[hour]} o'clock`;
                const wrongs = [];
                while (wrongs.length < 3) {
                    const wh = this._rand(1, 12);
                    const wm = Math.random() < 0.5 ? ':00' : ':30';
                    const w = `${wh}${wm}`;
                    if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
                }
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Which clock shows\n"${desc}"?`,
                    questionSpeak: `Which clock shows ${desc}?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'time',
                    subtype: 'match-digital',
                    explanation: `"${desc}" is ${correct}!`,
                    explanationSpeak: `${desc} is ${correct}!`
                };
            }
        } else {
            // Level 7: 5-minute intervals, AM/PM, elapsed time
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // Read to 5-minute intervals
                const hour = this._rand(1, 12);
                const min = this._rand(1, 11) * 5;
                const minStr = min < 10 ? `0${min}` : `${min}`;
                const correct = `${hour}:${minStr}`;
                const wrongs = [];
                while (wrongs.length < 3) {
                    const wh = this._rand(1, 12);
                    const wm = this._rand(0, 11) * 5;
                    const wmStr = wm < 10 ? `0${wm}` : `${wm}`;
                    const w = `${wh}:${wmStr}`;
                    if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
                }
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `🕐 The hour hand is on ${hour}.\nThe minute hand points to ${min / 5}.\nWhat time is it?`,
                    questionSpeak: `The hour hand is on ${hour} and the minute hand points to ${min / 5}. What time is it?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'time',
                    subtype: '5-minute',
                    explanation: `The minute hand on ${min / 5} means ${min} minutes. It's ${correct}!`,
                    explanationSpeak: `It's ${hour} ${min}!`
                };
            } else if (templateType === 1) {
                // AM/PM
                const scenarios = [
                    { time: '7:00 AM', desc: 'eating breakfast', wrong: '7:00 PM' },
                    { time: '8:30 AM', desc: 'at school', wrong: '8:30 PM' },
                    { time: '12:00 PM', desc: 'eating lunch', wrong: '12:00 AM' },
                    { time: '3:00 PM', desc: 'after school', wrong: '3:00 AM' },
                    { time: '7:00 PM', desc: 'eating dinner', wrong: '7:00 AM' },
                    { time: '9:00 PM', desc: 'going to bed', wrong: '9:00 AM' }
                ];
                const s = scenarios[this._rand(0, scenarios.length - 1)];
                const answers = this._shuffle([s.time, s.wrong, s.time.replace(/ [AP]M/, '') + ' noon']);
                return {
                    question: `You are ${s.desc}.\nIs it AM or PM?`,
                    questionSpeak: `You are ${s.desc}. Is it AM or PM?`,
                    answers,
                    correctIndex: answers.indexOf(s.time),
                    topic: 'time',
                    subtype: 'am-pm',
                    explanation: `${s.desc} happens at ${s.time}! AM is morning, PM is afternoon/evening.`,
                    explanationSpeak: `${s.desc} happens at ${s.time}!`
                };
            } else if (templateType === 2) {
                // Elapsed time (1-2 hours)
                const startHour = this._rand(1, 10);
                const elapsed = this._rand(1, 3);
                const endHour = startHour + elapsed;
                const correct = `${endHour}:00`;
                const wrongs = [`${startHour}:00`, `${endHour + 1}:00`, `${endHour - 1 < 1 ? 12 : endHour - 1}:30`];
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `It is ${startHour}:00.\n${elapsed} hour${elapsed > 1 ? 's' : ''} later = ?`,
                    questionSpeak: `It is ${startHour} o'clock. What time will it be ${elapsed} hours later?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'time',
                    subtype: 'elapsed-time',
                    explanation: `${startHour}:00 + ${elapsed} hour${elapsed > 1 ? 's' : ''} = ${correct}!`,
                    explanationSpeak: `${elapsed} hours after ${startHour} o'clock is ${endHour} o'clock!`
                };
            } else {
                // How many minutes in an hour / half hour
                const questions = [
                    { q: 'How many minutes\nin 1 hour?', correct: 60, wrongs: [30, 100, 45] },
                    { q: 'How many minutes\nin half an hour?', correct: 30, wrongs: [15, 60, 45] },
                    { q: 'How many hours\nin one day?', correct: 24, wrongs: [12, 30, 20] }
                ];
                const qd = questions[this._rand(0, questions.length - 1)];
                const answers = this._shuffle([qd.correct, ...qd.wrongs]).map(String);
                return {
                    question: qd.q,
                    questionSpeak: qd.q.replace(/\n/g, ' '),
                    answers,
                    correctIndex: answers.indexOf(String(qd.correct)),
                    topic: 'time',
                    subtype: 'time-facts',
                    explanation: `The answer is ${qd.correct}!`,
                    explanationSpeak: `The answer is ${qd.correct}!`
                };
            }
        }
    },

    // ---- MULTIPLICATION ----
    _multiplication(level) {
        // V38: 3rd grade multiplication — facts to 10x10, properties
        if (level >= 8) {
            return this._multiplication3rd(level);
        }
        if (level <= 6) {
            // Level 6: Equal groups with pictures, repeated addition, arrays
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // "N groups of M" with emoji
                const groups = this._rand(2, 5);
                const perGroup = this._rand(2, 5);
                const correct = groups * perGroup;
                const emoji = ['🍎', '⭐', '🍪', '🐟'][this._rand(0, 3)];
                const visual = Array(groups).fill(Array(perGroup).fill(emoji).join('')).join('  ');
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(2, correct - 5), correct + 5);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `${groups} groups of ${perGroup}\n${visual}\nHow many altogether?`,
                    questionSpeak: `${groups} groups of ${perGroup}. How many altogether?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'multiplication',
                    subtype: 'equal-groups',
                    explanation: `${groups} groups of ${perGroup} = ${correct}! Count: ${Array(groups).fill(perGroup).join(' + ')} = ${correct}!`,
                    explanationSpeak: `${groups} groups of ${perGroup} equals ${correct}!`
                };
            } else if (templateType === 1) {
                // Repeated addition → multiplication
                const groups = this._rand(2, 5);
                const value = this._rand(2, 5);
                const correct = groups * value;
                const addition = Array(groups).fill(value).join(' + ');
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(2, correct - 5), correct + 5);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `${addition} = ?`,
                    questionSpeak: `What is ${addition}?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'multiplication',
                    subtype: 'repeated-addition',
                    explanation: `${addition} = ${correct}! That's ${groups} × ${value} = ${correct}!`,
                    explanationSpeak: `${addition} equals ${correct}! That's ${groups} times ${value}!`
                };
            } else if (templateType === 2) {
                // Array — "How many in all?" rows × columns
                const rows = this._rand(2, 4);
                const cols = this._rand(2, 5);
                const correct = rows * cols;
                const emoji = ['⭐', '🔵', '🟢'][this._rand(0, 2)];
                const visual = Array(rows).fill(Array(cols).fill(emoji).join(' ')).join('\n');
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(2, correct - 5), correct + 5);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `${visual}\n${rows} rows, ${cols} in each row.\nHow many in all?`,
                    questionSpeak: `${rows} rows of ${cols}. How many in all?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'multiplication',
                    subtype: 'array',
                    explanation: `${rows} rows × ${cols} columns = ${correct}!`,
                    explanationSpeak: `${rows} times ${cols} equals ${correct}!`
                };
            } else {
                // Word problem with equal groups
                const scenarios = [
                    { item: 'legs', container: 'dog', per: 4 },
                    { item: 'wheels', container: 'car', per: 4 },
                    { item: 'fingers', container: 'hand', per: 5 },
                    { item: 'eyes', container: 'person', per: 2 },
                    { item: 'sides', container: 'triangle', per: 3 }
                ];
                const s = scenarios[this._rand(0, scenarios.length - 1)];
                const count = this._rand(2, 5);
                const correct = s.per * count;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(2, correct - 5), correct + 5);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Each ${s.container} has ${s.per} ${s.item}.\n${count} ${s.container}s = how many ${s.item}?`,
                    questionSpeak: `Each ${s.container} has ${s.per} ${s.item}. How many ${s.item} on ${count} ${s.container}s?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'multiplication',
                    subtype: 'word-problem',
                    explanation: `${count} × ${s.per} = ${correct} ${s.item}!`,
                    explanationSpeak: `${count} times ${s.per} equals ${correct} ${s.item}!`
                };
            }
        } else {
            // Level 7: Basic × facts (1-5), word problems, array dimensions
            const templateType = this._rand(0, 3);

            if (templateType === 0 || templateType === 1) {
                // Basic multiplication facts
                const a = this._rand(1, 5);
                const b = this._rand(2, 5);
                const correct = a * b;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 5), correct + 5);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `${a} × ${b} = ?`,
                    questionSpeak: `What is ${a} times ${b}?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'multiplication',
                    subtype: 'basic-facts',
                    explanation: `${a} × ${b} = ${correct}! That's ${a} groups of ${b}!`,
                    explanationSpeak: `${a} times ${b} equals ${correct}!`
                };
            } else if (templateType === 2) {
                // Missing factor: ___ × 3 = 12
                const a = this._rand(2, 5);
                const b = this._rand(2, 5);
                const product = a * b;
                const wrongs = this._makeWrongAnswers(a, 3, 1, 10);
                const answers = this._shuffle([a, ...wrongs]);
                return {
                    question: `___ × ${b} = ${product}`,
                    questionSpeak: `What times ${b} equals ${product}?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(a),
                    topic: 'multiplication',
                    subtype: 'missing-factor',
                    explanation: `${a} × ${b} = ${product}! The missing number is ${a}!`,
                    explanationSpeak: `${a} times ${b} equals ${product}!`
                };
            } else {
                // Word problem
                const names = ['Max', 'Lily', 'Jake', 'Emma'];
                const name = names[this._rand(0, 3)];
                const items = ['cookies', 'stickers', 'cards', 'marbles', 'crayons'];
                const item = items[this._rand(0, items.length - 1)];
                const bags = this._rand(2, 5);
                const per = this._rand(2, 5);
                const correct = bags * per;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(2, correct - 5), correct + 5);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `${name} has ${bags} bags.\nEach bag has ${per} ${item}.\nHow many ${item} in all?`,
                    questionSpeak: `${name} has ${bags} bags with ${per} ${item} in each bag. How many ${item} in all?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'multiplication',
                    subtype: 'word-problem',
                    explanation: `${bags} × ${per} = ${correct} ${item}!`,
                    explanationSpeak: `${bags} times ${per} equals ${correct} ${item}!`
                };
            }
        }
    },

    // ---- FRACTIONS ----
    _fractions(level) {
        // V38: 3rd grade fractions — number lines, comparing, equivalent
        if (level >= 8) {
            return this._fractions3rd(level);
        }
        if (level <= 6) {
            // Level 6: Identify halves/thirds/fourths, shade fractions
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // Identify the fraction shown
                const fracs = [
                    { num: 1, den: 2, name: 'one half', visual: '🟦⬜' },
                    { num: 1, den: 3, name: 'one third', visual: '🟦⬜⬜' },
                    { num: 2, den: 3, name: 'two thirds', visual: '🟦🟦⬜' },
                    { num: 1, den: 4, name: 'one fourth', visual: '🟦⬜⬜⬜' },
                    { num: 2, den: 4, name: 'two fourths', visual: '🟦🟦⬜⬜' },
                    { num: 3, den: 4, name: 'three fourths', visual: '🟦🟦🟦⬜' }
                ];
                const f = fracs[this._rand(0, fracs.length - 1)];
                const correct = `${f.num}/${f.den}`;
                const wrongs = fracs.filter(x => `${x.num}/${x.den}` !== correct)
                    .map(x => `${x.num}/${x.den}`);
                const answers = this._shuffle([correct, ...this._shuffle(wrongs).slice(0, 3)]);
                return {
                    question: `What fraction is shaded?\n${f.visual}`,
                    questionSpeak: `What fraction is shaded? ${f.num} out of ${f.den} parts are blue.`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'fractions',
                    subtype: 'identify',
                    explanation: `${f.num} out of ${f.den} parts = ${correct} (${f.name})!`,
                    explanationSpeak: `That's ${f.name}!`
                };
            } else if (templateType === 1) {
                // "Show me half/third/fourth"
                const questions = [
                    { frac: 'half', visual: '🍕', correct: '1/2', explain: 'Half means 1 out of 2 equal parts!' },
                    { frac: 'one third', visual: '🍕', correct: '1/3', explain: 'One third means 1 out of 3 equal parts!' },
                    { frac: 'one fourth', visual: '🍕', correct: '1/4', explain: 'One fourth means 1 out of 4 equal parts!' }
                ];
                const q = questions[this._rand(0, questions.length - 1)];
                const wrongs = ['1/2', '1/3', '1/4', '2/3', '3/4'].filter(w => w !== q.correct);
                const answers = this._shuffle([q.correct, ...this._shuffle(wrongs).slice(0, 3)]);
                return {
                    question: `What fraction means\n"${q.frac}" of the ${q.visual}?`,
                    questionSpeak: `What fraction means ${q.frac}?`,
                    answers,
                    correctIndex: answers.indexOf(q.correct),
                    topic: 'fractions',
                    subtype: 'name',
                    explanation: q.explain,
                    explanationSpeak: q.explain
                };
            } else if (templateType === 2) {
                // "How many equal parts?"
                const parts = this._rand(2, 4);
                const visual = parts === 2 ? '⬜|⬜' : parts === 3 ? '⬜|⬜|⬜' : '⬜|⬜|⬜|⬜';
                const correct = parts;
                const wrongs = [2, 3, 4, 5].filter(n => n !== parts);
                const answers = this._shuffle([correct, ...wrongs.slice(0, 3)]);
                return {
                    question: `How many equal parts?\n${visual}`,
                    questionSpeak: `This shape is divided into how many equal parts?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'fractions',
                    subtype: 'equal-parts',
                    explanation: `The shape has ${parts} equal parts!`,
                    explanationSpeak: `There are ${parts} equal parts!`
                };
            } else {
                // "If you share equally..."
                const total = [4, 6, 8, 10][this._rand(0, 3)];
                const people = [2, 3, 4][this._rand(0, total <= 4 ? 0 : total <= 6 ? 1 : 2)];
                const correct = Math.floor(total / people);
                if (total % people !== 0) return this._fractions(level); // retry for clean division
                const wrongs = this._makeWrongAnswers(correct, 3, 1, correct + 3);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Share ${total} 🍪 equally\namong ${people} friends.\nHow many each?`,
                    questionSpeak: `Share ${total} cookies equally among ${people} friends. How many does each person get?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'fractions',
                    subtype: 'share-equally',
                    explanation: `${total} ÷ ${people} = ${correct} cookies each!`,
                    explanationSpeak: `Each friend gets ${correct} cookies!`
                };
            }
        } else {
            // Level 7: Name fractions, equal shares, compare unit fractions
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // Name the fraction from shaded shape
                const num = this._rand(1, 3);
                const den = this._rand(num + 1, 6);
                const correct = `${num}/${den}`;
                const shaded = '🟦'.repeat(num) + '⬜'.repeat(den - num);
                const wrongs = [];
                while (wrongs.length < 3) {
                    const wn = this._rand(1, 5);
                    const wd = this._rand(wn + 1, 8);
                    const w = `${wn}/${wd}`;
                    if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
                }
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Name this fraction:\n${shaded}`,
                    questionSpeak: `${num} out of ${den} parts are shaded. What fraction is that?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'fractions',
                    subtype: 'name-fraction',
                    explanation: `${num} out of ${den} shaded = ${correct}!`,
                    explanationSpeak: `That's ${num} out of ${den}, or ${correct}!`
                };
            } else if (templateType === 1) {
                // Compare unit fractions
                const dens = this._shuffle([2, 3, 4, 6, 8]).slice(0, 2);
                const correct = dens[0] < dens[1] ? `1/${dens[0]}` : `1/${dens[1]}`;
                const bigger = `1/${Math.min(...dens)}`;
                const answers = this._shuffle([`1/${dens[0]}`, `1/${dens[1]}`, 'Same']);
                return {
                    question: `Which is BIGGER?\n1/${dens[0]}  or  1/${dens[1]}`,
                    questionSpeak: `Which is bigger? One ${dens[0]}th or one ${dens[1]}th?`,
                    answers,
                    correctIndex: answers.indexOf(bigger),
                    topic: 'fractions',
                    subtype: 'compare-unit',
                    explanation: `${bigger} is bigger! Fewer parts = bigger pieces!`,
                    explanationSpeak: `${bigger} is bigger because fewer parts means bigger pieces!`
                };
            } else if (templateType === 2) {
                // Equal shares word problem
                const total = this._rand(2, 5) * this._rand(2, 4);
                const groups = [2, 3, 4, 5].filter(g => total % g === 0);
                if (groups.length === 0) return this._fractions(level);
                const group = groups[this._rand(0, groups.length - 1)];
                const correct = total / group;
                const wrongs = this._makeWrongAnswers(correct, 3, 1, correct + 4);
                const answers = this._shuffle([correct, ...wrongs]);
                const items = ['cupcakes', 'grapes', 'stickers', 'blocks'][this._rand(0, 3)];
                return {
                    question: `${total} ${items} shared equally\nby ${group} kids. How many each?`,
                    questionSpeak: `${total} ${items} shared equally by ${group} kids. How many does each kid get?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'fractions',
                    subtype: 'equal-shares',
                    explanation: `${total} ÷ ${group} = ${correct} each!`,
                    explanationSpeak: `Each kid gets ${correct} ${items}!`
                };
            } else {
                // Fraction of a set: "1/2 of 8 = ?"
                const den = [2, 3, 4][this._rand(0, 2)];
                const whole = den * this._rand(2, 5);
                const correct = whole / den;
                const wrongs = this._makeWrongAnswers(correct, 3, 1, correct + 4);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `What is 1/${den} of ${whole}?`,
                    questionSpeak: `What is one ${den === 2 ? 'half' : den === 3 ? 'third' : 'fourth'} of ${whole}?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'fractions',
                    subtype: 'fraction-of-set',
                    explanation: `1/${den} of ${whole} = ${correct}! Divide ${whole} into ${den} equal groups!`,
                    explanationSpeak: `One ${den === 2 ? 'half' : den === 3 ? 'third' : 'fourth'} of ${whole} is ${correct}!`
                };
            }
        }
    },

    // ---- EVEN & ODD ----
    _evenOdd(level) {
        if (level <= 6) {
            // Level 6: Is this number even or odd? (1-20), pair counting
            const templateType = this._rand(0, 2);

            if (templateType === 0) {
                // "Is N even or odd?"
                const n = this._rand(1, 20);
                const correct = n % 2 === 0 ? 'Even' : 'Odd';
                const answers = this._shuffle(['Even', 'Odd']);
                return {
                    question: `Is ${n} even or odd?`,
                    questionSpeak: `Is ${n} even or odd?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'even-odd',
                    subtype: 'is-even-odd',
                    explanation: `${n} is ${correct.toLowerCase()}! ${n % 2 === 0 ? 'You can split it into 2 equal groups!' : 'There is 1 left over if you try to make 2 equal groups!'}`,
                    explanationSpeak: `${n} is ${correct.toLowerCase()}!`
                };
            } else if (templateType === 1) {
                // "Which number is even/odd?"
                const wantEven = Math.random() < 0.5;
                const word = wantEven ? 'EVEN' : 'ODD';
                const correct = wantEven ? this._rand(1, 10) * 2 : this._rand(0, 9) * 2 + 1;
                const wrongs = [];
                while (wrongs.length < 3) {
                    const w = wantEven ? this._rand(0, 9) * 2 + 1 : this._rand(1, 10) * 2;
                    if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
                }
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Which number is ${word}?`,
                    questionSpeak: `Which number is ${word.toLowerCase()}?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'even-odd',
                    subtype: 'which-even-odd',
                    explanation: `${correct} is ${word.toLowerCase()}! Even numbers end in 0, 2, 4, 6, or 8.`,
                    explanationSpeak: `${correct} is ${word.toLowerCase()}!`
                };
            } else {
                // Visual pairs: can you make pairs?
                const n = this._rand(2, 10);
                const emoji = '🔵';
                const dots = Array(n).fill(emoji).join(' ');
                const isEven = n % 2 === 0;
                const correct = isEven ? 'Yes, even!' : 'No, odd!';
                const answers = this._shuffle(['Yes, even!', 'No, odd!']);
                return {
                    question: `Can you make equal pairs?\n${dots}`,
                    questionSpeak: `There are ${n} dots. Can you make equal pairs?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'even-odd',
                    subtype: 'visual-pairs',
                    explanation: `${n} is ${isEven ? 'even' : 'odd'}! ${isEven ? 'All dots have a partner!' : 'One dot is left without a partner!'}`,
                    explanationSpeak: `${n} is ${isEven ? 'even' : 'odd'}!`
                };
            }
        } else {
            // Level 7: 2-digit even/odd, rules for adding even+even, etc.
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // 2-digit even/odd
                const n = this._rand(11, 99);
                const correct = n % 2 === 0 ? 'Even' : 'Odd';
                const answers = this._shuffle(['Even', 'Odd']);
                return {
                    question: `Is ${n} even or odd?`,
                    questionSpeak: `Is ${n} even or odd?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'even-odd',
                    subtype: '2-digit',
                    explanation: `${n} is ${correct.toLowerCase()}! Look at the ones digit: ${n % 10} is ${n % 2 === 0 ? 'even' : 'odd'}!`,
                    explanationSpeak: `${n} is ${correct.toLowerCase()}! The ones digit is ${n % 10}!`
                };
            } else if (templateType === 1) {
                // even + even = ?
                const rules = [
                    { q: 'even + even = ?', correct: 'Even', explain: 'Even plus even always equals even! Example: 2 + 4 = 6' },
                    { q: 'odd + odd = ?', correct: 'Even', explain: 'Odd plus odd always equals even! Example: 3 + 5 = 8' },
                    { q: 'even + odd = ?', correct: 'Odd', explain: 'Even plus odd always equals odd! Example: 4 + 3 = 7' }
                ];
                const r = rules[this._rand(0, rules.length - 1)];
                const answers = this._shuffle(['Even', 'Odd']);
                return {
                    question: r.q,
                    questionSpeak: r.q.replace('= ?', 'equals what?'),
                    answers,
                    correctIndex: answers.indexOf(r.correct),
                    topic: 'even-odd',
                    subtype: 'rules',
                    explanation: r.explain,
                    explanationSpeak: r.explain
                };
            } else if (templateType === 2) {
                // "How many even numbers between 1 and N?"
                const n = [10, 12, 14, 16, 20][this._rand(0, 4)];
                const correct = Math.floor(n / 2);
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 3), correct + 3);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `How many even numbers\nfrom 1 to ${n}?`,
                    questionSpeak: `How many even numbers are there from 1 to ${n}?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'even-odd',
                    subtype: 'count-even',
                    explanation: `There are ${correct} even numbers from 1 to ${n}: 2, 4, 6, ...${n % 2 === 0 ? ', ' + n : ''}!`,
                    explanationSpeak: `There are ${correct} even numbers from 1 to ${n}!`
                };
            } else {
                // "The ones digit tells you"
                const n = this._rand(10, 99);
                const onesDigit = n % 10;
                const correct = onesDigit % 2 === 0 ? 'Even' : 'Odd';
                const answers = this._shuffle(['Even', 'Odd']);
                return {
                    question: `${n} ends in ${onesDigit}.\nSo ${n} is...`,
                    questionSpeak: `${n} ends in ${onesDigit}. Is ${n} even or odd?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'even-odd',
                    subtype: 'ones-digit',
                    explanation: `${n} ends in ${onesDigit}, which is ${correct.toLowerCase()}, so ${n} is ${correct.toLowerCase()}!`,
                    explanationSpeak: `${n} is ${correct.toLowerCase()} because it ends in ${onesDigit}!`
                };
            }
        }
    },

    // ---- SKIP COUNTING (2nd grade dedicated topic) ----
    _skipCounting2(level) {
        if (level <= 6) {
            // Level 6: Count by 2s/5s/10s, fill in missing number
            const steps = [2, 5, 10];
            const step = steps[this._rand(0, 2)];
            const start = step * this._rand(1, 3);
            const len = 5;
            const seq = [];
            for (let i = 0; i < len; i++) seq.push(start + i * step);

            const blankIdx = this._rand(1, len - 2);
            const correct = seq[blankIdx];
            const display = seq.map((n, i) => i === blankIdx ? '___' : n).join(', ');
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - step * 2), correct + step * 2);
            const answers = this._shuffle([correct, ...wrongs]);

            return {
                question: `Fill in the blank:\n${display}`,
                questionSpeak: `What number is missing in the pattern?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'skip-counting',
                subtype: 'fill-blank',
                explanation: `Counting by ${step}s: ${seq.join(', ')}! The missing number is ${correct}!`,
                explanationSpeak: `The missing number is ${correct}! We're counting by ${step}s!`
            };
        } else {
            // Level 7: Count by 100s, backwards by 10s, find missing in pattern
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // Count by 100s
                const start = this._rand(1, 5) * 100;
                const seq = [start, start + 100, start + 200, start + 300];
                const correct = start + 400;
                const wrongs = this._makeWrongAnswers(correct, 3, correct - 200, correct + 200);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Count by 100s:\n${seq.join(', ')}, ___`,
                    questionSpeak: `Count by hundreds. What comes next?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'skip-counting',
                    subtype: 'count-100s',
                    explanation: `Counting by 100s: ${seq.join(', ')}, ${correct}!`,
                    explanationSpeak: `${correct} comes next!`
                };
            } else if (templateType === 1) {
                // Count backwards by 10s
                const start = this._rand(5, 10) * 10;
                const seq = [start, start - 10, start - 20, start - 30];
                const correct = start - 40;
                if (correct < 0) return this._skipCounting2(level);
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 20), correct + 20);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Count backwards by 10s:\n${seq.join(', ')}, ___`,
                    questionSpeak: `Count backwards by tens. What comes next?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'skip-counting',
                    subtype: 'backwards-10s',
                    explanation: `Counting backwards by 10s: ${seq.join(', ')}, ${correct}!`,
                    explanationSpeak: `${correct} comes next when counting backwards by tens!`
                };
            } else if (templateType === 2) {
                // Fill in missing - count by 3s or 4s
                const step = [3, 4][this._rand(0, 1)];
                const start = step * this._rand(1, 3);
                const len = 5;
                const seq = [];
                for (let i = 0; i < len; i++) seq.push(start + i * step);
                const blankIdx = this._rand(1, len - 2);
                const correct = seq[blankIdx];
                const display = seq.map((n, i) => i === blankIdx ? '___' : n).join(', ');
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - step * 2), correct + step * 2);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Count by ${step}s — fill in:\n${display}`,
                    questionSpeak: `Count by ${step}s. What's the missing number?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'skip-counting',
                    subtype: 'fill-3s-4s',
                    explanation: `Counting by ${step}s: ${seq.join(', ')}!`,
                    explanationSpeak: `The missing number is ${correct}!`
                };
            } else {
                // "What are we counting by?"
                const step = [2, 3, 5, 10][this._rand(0, 3)];
                const start = step * this._rand(1, 4);
                const seq = [start, start + step, start + step * 2, start + step * 3];
                const correct = step;
                const wrongs = [2, 3, 4, 5, 10].filter(n => n !== step);
                const answers = this._shuffle([correct, ...this._shuffle(wrongs).slice(0, 3)]);
                return {
                    question: `${seq.join(', ')}, ...\nWhat are we counting by?`,
                    questionSpeak: `${seq.join(', ')}. What are we counting by?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'skip-counting',
                    subtype: 'what-counting-by',
                    explanation: `We're counting by ${step}s! Each number is ${step} more!`,
                    explanationSpeak: `We're counting by ${step}s!`
                };
            }
        }
    },

    // ---- MEASUREMENT ----
    _measurement(level) {
        // V38: 3rd grade measurement — area/perimeter handled by own topic
        if (level >= 8) {
            return this._measurement3rd(level);
        }
        if (level <= 6) {
            // Level 6: Compare lengths, measure with unit blocks
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // Compare lengths (longer/shorter)
                const items = [
                    { name: 'pencil', len: 7 }, { name: 'crayon', len: 4 },
                    { name: 'book', len: 10 }, { name: 'eraser', len: 2 },
                    { name: 'ruler', len: 12 }, { name: 'paper clip', len: 1 }
                ];
                const a = items[this._rand(0, items.length - 1)];
                let b;
                do { b = items[this._rand(0, items.length - 1)]; } while (b.name === a.name);
                const askLonger = Math.random() < 0.5;
                const correct = askLonger ? (a.len > b.len ? a.name : b.name) : (a.len < b.len ? a.name : b.name);
                const answers = this._shuffle([a.name, b.name, 'Same length']);
                return {
                    question: `Which is ${askLonger ? 'LONGER' : 'SHORTER'}?\nA ${a.name} or a ${b.name}?`,
                    questionSpeak: `Which is ${askLonger ? 'longer' : 'shorter'}? A ${a.name} or a ${b.name}?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'measurement',
                    subtype: 'compare-length',
                    explanation: `A ${correct} is ${askLonger ? 'longer' : 'shorter'}!`,
                    explanationSpeak: `A ${correct} is ${askLonger ? 'longer' : 'shorter'}!`
                };
            } else if (templateType === 1) {
                // Measure with blocks
                const blocks = this._rand(3, 8);
                const correct = blocks;
                const wrongs = this._makeWrongAnswers(correct, 3, 1, blocks + 3);
                const answers = this._shuffle([correct, ...wrongs]);
                const visual = '📦'.repeat(blocks);
                return {
                    question: `How many blocks long?\n${visual}`,
                    questionSpeak: `How many blocks long is this?`,
                    answers: answers.map(v => `${v} blocks`),
                    correctIndex: answers.indexOf(correct),
                    topic: 'measurement',
                    subtype: 'blocks',
                    explanation: `It is ${blocks} blocks long! Count each block!`,
                    explanationSpeak: `It is ${blocks} blocks long!`
                };
            } else if (templateType === 2) {
                // "Would you use inches or feet?"
                const items = [
                    { obj: 'a crayon', unit: 'inches', wrong: 'feet' },
                    { obj: 'a room', unit: 'feet', wrong: 'inches' },
                    { obj: 'your hand', unit: 'inches', wrong: 'feet' },
                    { obj: 'a hallway', unit: 'feet', wrong: 'inches' },
                    { obj: 'a paper clip', unit: 'inches', wrong: 'feet' }
                ];
                const item = items[this._rand(0, items.length - 1)];
                const answers = this._shuffle([item.unit, item.wrong, 'miles']);
                return {
                    question: `Would you measure ${item.obj}\nin inches or feet?`,
                    questionSpeak: `Would you measure ${item.obj} in inches or feet?`,
                    answers,
                    correctIndex: answers.indexOf(item.unit),
                    topic: 'measurement',
                    subtype: 'unit-choice',
                    explanation: `We measure ${item.obj} in ${item.unit}!`,
                    explanationSpeak: `We measure ${item.obj} in ${item.unit}!`
                };
            } else {
                // Order by length
                const items = this._shuffle([
                    { name: 'ant 🐜', len: 1 }, { name: 'pencil ✏️', len: 7 },
                    { name: 'desk 🪑', len: 36 }
                ]);
                const sorted = [...items].sort((a, b) => a.len - b.len);
                const correct = sorted.map(i => i.name).join(', ');
                const w1 = [...sorted].reverse().map(i => i.name).join(', ');
                const w2 = [sorted[1], sorted[0], sorted[2]].map(i => i.name).join(', ');
                const answers = this._shuffle([correct, w1, w2]);
                return {
                    question: `Order shortest to longest:`,
                    questionSpeak: `Put these in order from shortest to longest`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'measurement',
                    subtype: 'order',
                    explanation: `${correct} — shortest to longest!`,
                    explanationSpeak: `That's the right order from shortest to longest!`
                };
            }
        } else {
            // Level 7: Inches & centimeters, estimate lengths
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // "About how many inches?"
                const items = [
                    { name: 'your thumb', inches: 2 },
                    { name: 'a crayon', inches: 4 },
                    { name: 'a book', inches: 10 },
                    { name: 'your foot', inches: 10 },
                    { name: 'a pencil', inches: 7 },
                    { name: 'a dollar bill', inches: 6 }
                ];
                const item = items[this._rand(0, items.length - 1)];
                const correct = item.inches;
                const wrongs = this._makeWrongAnswers(correct, 3, 1, correct + 5);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `About how many inches\nis ${item.name}?`,
                    questionSpeak: `About how many inches long is ${item.name}?`,
                    answers: answers.map(v => `${v} inches`),
                    correctIndex: answers.indexOf(correct),
                    topic: 'measurement',
                    subtype: 'estimate-inches',
                    explanation: `${item.name} is about ${correct} inches!`,
                    explanationSpeak: `${item.name} is about ${correct} inches long!`
                };
            } else if (templateType === 1) {
                // Inches to centimeters concept
                const questions = [
                    { q: 'Which is longer?\n1 inch or 1 centimeter', correct: '1 inch', wrongs: ['1 centimeter', 'Same'], explain: '1 inch is longer — about 2.5 centimeters!' },
                    { q: 'About how many centimeters\nin 1 inch?', correct: '2-3 cm', wrongs: ['10 cm', '1 cm', '5 cm'], explain: 'One inch is about 2.5 centimeters!' },
                    { q: '12 inches = ?', correct: '1 foot', wrongs: ['1 yard', '10 inches', '2 feet'], explain: '12 inches make 1 foot!' }
                ];
                const qd = questions[this._rand(0, questions.length - 1)];
                const answers = this._shuffle([qd.correct, ...qd.wrongs]);
                return {
                    question: qd.q,
                    questionSpeak: qd.q.replace(/\n/g, ' '),
                    answers,
                    correctIndex: answers.indexOf(qd.correct),
                    topic: 'measurement',
                    subtype: 'inch-cm',
                    explanation: qd.explain,
                    explanationSpeak: qd.explain
                };
            } else if (templateType === 2) {
                // Add/compare measurements
                const a = this._rand(2, 8);
                const b = this._rand(2, 8);
                const unit = 'inches';
                const correct = a + b;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 4), correct + 4);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `A ribbon is ${a} ${unit}.\nYou add ${b} more ${unit}.\nHow long now?`,
                    questionSpeak: `A ribbon is ${a} ${unit} long. You add ${b} more ${unit}. How long is it now?`,
                    answers: answers.map(v => `${v} ${unit}`),
                    correctIndex: answers.indexOf(correct),
                    topic: 'measurement',
                    subtype: 'add-measure',
                    explanation: `${a} + ${b} = ${correct} ${unit}!`,
                    explanationSpeak: `${a} plus ${b} equals ${correct} ${unit}!`
                };
            } else {
                // Measure and compare
                const a = this._rand(3, 12);
                let b;
                do { b = this._rand(3, 12); } while (b === a);
                const diff = Math.abs(a - b);
                const unit = ['inches', 'centimeters'][this._rand(0, 1)];
                const correct = diff;
                const wrongs = this._makeWrongAnswers(correct, 3, 1, diff + 4);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `One string is ${a} ${unit}.\nAnother is ${b} ${unit}.\nHow much longer is the\n${a > b ? 'first' : 'second'}?`,
                    questionSpeak: `One string is ${a} ${unit} and another is ${b} ${unit}. How much longer is the ${a > b ? 'first' : 'second'}?`,
                    answers: answers.map(v => `${v} ${unit}`),
                    correctIndex: answers.indexOf(correct),
                    topic: 'measurement',
                    subtype: 'diff-measure',
                    explanation: `${Math.max(a, b)} - ${Math.min(a, b)} = ${diff} ${unit} longer!`,
                    explanationSpeak: `The difference is ${diff} ${unit}!`
                };
            }
        }
    },

    // ---- THREE-DIGIT NUMBERS ----
    _threeDigit(level) {
        // V38: 3rd grade big numbers — rounding, 4-digit, place value to thousands
        if (level >= 8) {
            return this._threeDigit3rd(level);
        }
        if (level <= 6) {
            // Level 6: Read & write numbers to 999, identify hundreds/tens/ones
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // "What number has H hundreds, T tens, O ones?"
                const h = this._rand(1, 9);
                const t = this._rand(0, 9);
                const o = this._rand(0, 9);
                const correct = h * 100 + t * 10 + o;
                const wrongs = this._makeWrongAnswers(correct, 3, Math.max(100, correct - 100), Math.min(999, correct + 100));
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `${h} hundred${h > 1 ? 's' : ''}, ${t} ten${t !== 1 ? 's' : ''}, ${o} one${o !== 1 ? 's' : ''}`,
                    questionSpeak: `What number has ${h} hundreds, ${t} tens, and ${o} ones?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'three-digit',
                    subtype: 'compose-hto',
                    explanation: `${h} hundreds + ${t} tens + ${o} ones = ${correct}!`,
                    explanationSpeak: `${h} hundreds, ${t} tens, ${o} ones equals ${correct}!`
                };
            } else if (templateType === 1) {
                // "How many hundreds in N?"
                const n = this._rand(100, 999);
                const h = Math.floor(n / 100);
                const correct = h;
                const wrongs = this._makeWrongAnswers(correct, 3, 1, 9);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `How many HUNDREDS\nin ${n}?`,
                    questionSpeak: `How many hundreds are in ${n}?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'three-digit',
                    subtype: 'hundreds-digit',
                    explanation: `${n} has ${h} hundred${h > 1 ? 's' : ''}! The first digit tells you!`,
                    explanationSpeak: `${n} has ${h} hundreds!`
                };
            } else if (templateType === 2) {
                // "How many tens in N?"
                const n = this._rand(100, 999);
                const t = Math.floor((n % 100) / 10);
                const correct = t;
                const wrongs = this._makeWrongAnswers(correct, 3, 0, 9);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `How many TENS in ${n}?`,
                    questionSpeak: `How many tens are in ${n}?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'three-digit',
                    subtype: 'tens-digit',
                    explanation: `${n} has ${t} ten${t !== 1 ? 's' : ''}! The middle digit is the tens!`,
                    explanationSpeak: `${n} has ${t} tens!`
                };
            } else {
                // Read number words
                const h = this._rand(1, 5);
                const n = h * 100;
                const words = ['', 'one', 'two', 'three', 'four', 'five'];
                const correct = `${words[h]} hundred`;
                const wrongs = [1, 2, 3, 4, 5].filter(x => x !== h).slice(0, 3).map(x => `${words[x]} hundred`);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `What is the name for ${n}?`,
                    questionSpeak: `What is the word for the number ${n}?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'three-digit',
                    subtype: 'number-words',
                    explanation: `${n} is "${correct}"!`,
                    explanationSpeak: `${n} is ${correct}!`
                };
            }
        } else {
            // Level 7: Compare 3-digit, expanded form, number lines
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // Compare with >, <, =
                let a = this._rand(100, 999);
                let b = this._rand(100, 999);
                if (Math.random() < 0.15) b = a; // occasional equality
                const correctSymbol = a > b ? '>' : a < b ? '<' : '=';
                const answers = this._shuffle(['>', '<', '=']);
                return {
                    question: `${a} ___ ${b}\nWhich sign?`,
                    questionSpeak: `Compare ${a} and ${b}. Which sign goes in the blank?`,
                    answers,
                    correctIndex: answers.indexOf(correctSymbol),
                    topic: 'three-digit',
                    subtype: 'compare-sign',
                    explanation: `${a} ${correctSymbol} ${b}! ${a > b ? `${a} is greater!` : a < b ? `${b} is greater!` : 'They are equal!'}`,
                    explanationSpeak: `${a} is ${a > b ? 'greater than' : a < b ? 'less than' : 'equal to'} ${b}!`
                };
            } else if (templateType === 1) {
                // Expanded form
                const h = this._rand(1, 9);
                const t = this._rand(0, 9);
                const o = this._rand(0, 9);
                const n = h * 100 + t * 10 + o;
                const correct = `${h * 100} + ${t * 10} + ${o}`;
                const wrongs = [
                    `${h * 10} + ${t * 10} + ${o}`,
                    `${h * 100} + ${t} + ${o}`,
                    `${h} + ${t} + ${o}`
                ];
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Write ${n} in expanded form:`,
                    questionSpeak: `What is the expanded form of ${n}?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'three-digit',
                    subtype: 'expanded-form',
                    explanation: `${n} = ${h * 100} + ${t * 10} + ${o}. That's ${h} hundreds + ${t} tens + ${o} ones!`,
                    explanationSpeak: `${n} in expanded form is ${h * 100} plus ${t * 10} plus ${o}!`
                };
            } else if (templateType === 2) {
                // Order from least to greatest
                const nums = [];
                while (nums.length < 3) {
                    const n = this._rand(100, 999);
                    if (!nums.includes(n)) nums.push(n);
                }
                const sorted = [...nums].sort((a, b) => a - b);
                const correct = sorted.join(', ');
                const w1 = [...sorted].reverse().join(', ');
                const w2 = [sorted[1], sorted[0], sorted[2]].join(', ');
                const answers = this._shuffle([correct, w1, w2]);
                return {
                    question: `Order least to greatest:\n${nums.join(',  ')}`,
                    questionSpeak: `Put these numbers in order from least to greatest`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'three-digit',
                    subtype: 'order-3',
                    explanation: `${correct} — from smallest to largest!`,
                    explanationSpeak: `The correct order is ${correct}!`
                };
            } else {
                // Which digit is in the ___ place?
                const n = this._rand(100, 999);
                const places = [
                    { name: 'hundreds', digit: Math.floor(n / 100) },
                    { name: 'tens', digit: Math.floor((n % 100) / 10) },
                    { name: 'ones', digit: n % 10 }
                ];
                const place = places[this._rand(0, 2)];
                const correct = place.digit;
                const wrongs = this._makeWrongAnswers(correct, 3, 0, 9);
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `In ${n}, what digit is in\nthe ${place.name} place?`,
                    questionSpeak: `In the number ${n}, what digit is in the ${place.name} place?`,
                    answers: answers.map(String),
                    correctIndex: answers.indexOf(correct),
                    topic: 'three-digit',
                    subtype: 'digit-place',
                    explanation: `In ${n}, the ${place.name} digit is ${correct}!`,
                    explanationSpeak: `The ${place.name} digit in ${n} is ${correct}!`
                };
            }
        }
    },

    // =====================================================
    // V38: 3RD GRADE GENERATORS (levels 8-9)
    // =====================================================

    // ---- 3RD GRADE ADDITION — 3-digit + 3-digit with regrouping ----
    _addition3rd(level) {
        const templateType = this._rand(0, 3);
        if (templateType <= 1) {
            // 3-digit + 3-digit
            const a = this._rand(level >= 9 ? 200 : 100, level >= 9 ? 799 : 499);
            const b = this._rand(level >= 9 ? 100 : 100, level >= 9 ? 799 : 499);
            const correct = a + b;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(100, correct - 50), correct + 50);
            const answers = this._shuffle([correct, ...wrongs]);
            const regroup = (a % 10 + b % 10) >= 10 || (Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10) >= 10;
            return {
                question: `${a} + ${b} = ?`,
                questionSpeak: `What is ${a} plus ${b}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'addition',
                subtype: '3-digit-add',
                explanation: `${a} + ${b} = ${correct}!${regroup ? ' Remember to regroup!' : ''}`,
                explanationSpeak: `${a} plus ${b} equals ${correct}!`
            };
        } else if (templateType === 2) {
            // 3-digit + 2-digit
            const a = this._rand(100, 899);
            const b = this._rand(10, 99);
            const correct = a + b;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(100, correct - 30), correct + 30);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${a} + ${b} = ?`,
                questionSpeak: `What is ${a} plus ${b}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'addition',
                subtype: '3-digit-add',
                explanation: `${a} + ${b} = ${correct}!`,
                explanationSpeak: `${a} plus ${b} equals ${correct}!`
            };
        } else {
            // Missing addend with 3-digit numbers
            const total = this._rand(200, 999);
            const a = this._rand(100, total - 50);
            const correct = total - a;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(10, correct - 30), correct + 30);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${a} + ___ = ${total}`,
                questionSpeak: `${a} plus what equals ${total}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'addition',
                subtype: '3-digit-missing',
                explanation: `${a} + ${correct} = ${total}!`,
                explanationSpeak: `${a} plus ${correct} equals ${total}!`
            };
        }
    },

    // ---- 3RD GRADE SUBTRACTION — 3-digit with regrouping ----
    _subtraction3rd(level) {
        const templateType = this._rand(0, 3);
        if (templateType <= 1) {
            // 3-digit - 3-digit
            const a = this._rand(level >= 9 ? 400 : 200, 999);
            const b = this._rand(level >= 9 ? 100 : 100, a - 50);
            const correct = a - b;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 50), correct + 50);
            const answers = this._shuffle([correct, ...wrongs]);
            const regroup = (a % 10) < (b % 10);
            return {
                question: `${a} - ${b} = ?`,
                questionSpeak: `What is ${a} minus ${b}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'subtraction',
                subtype: '3-digit-sub',
                explanation: `${a} - ${b} = ${correct}!${regroup ? ' You need to borrow!' : ''}`,
                explanationSpeak: `${a} minus ${b} equals ${correct}!`
            };
        } else if (templateType === 2) {
            // 3-digit - 2-digit
            const a = this._rand(200, 999);
            const b = this._rand(10, 99);
            const correct = a - b;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(10, correct - 30), correct + 30);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${a} - ${b} = ?`,
                questionSpeak: `What is ${a} minus ${b}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'subtraction',
                subtype: '3-digit-sub',
                explanation: `${a} - ${b} = ${correct}!`,
                explanationSpeak: `${a} minus ${b} equals ${correct}!`
            };
        } else {
            // "How much more?" comparison
            const a = this._rand(200, 800);
            const b = this._rand(100, a - 30);
            const correct = a - b;
            const names = ['Jake', 'Mia', 'Ben', 'Sara'];
            const n1 = names[this._rand(0, 3)];
            let n2;
            do { n2 = names[this._rand(0, 3)]; } while (n2 === n1);
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(10, correct - 50), correct + 50);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${n1} scored ${a} points.\n${n2} scored ${b}.\nHow many more did\n${n1} score?`,
                questionSpeak: `${n1} scored ${a} points. ${n2} scored ${b}. How many more did ${n1} score?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'subtraction',
                subtype: '3-digit-compare',
                explanation: `${a} - ${b} = ${correct}. ${n1} scored ${correct} more!`,
                explanationSpeak: `${a} minus ${b} equals ${correct}!`
            };
        }
    },

    // ---- 3RD GRADE MULTIPLICATION — facts to 10x10 ----
    _multiplication3rd(level) {
        const templateType = this._rand(0, 4);

        if (templateType === 0) {
            // Basic multiplication facts up to 10x10
            const a = this._rand(2, 10);
            const b = this._rand(2, level >= 9 ? 10 : 9);
            const correct = a * b;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(2, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${a} x ${b} = ?`,
                questionSpeak: `What is ${a} times ${b}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'multiplication',
                subtype: 'facts-10',
                explanation: `${a} x ${b} = ${correct}!`,
                explanationSpeak: `${a} times ${b} equals ${correct}!`
            };
        } else if (templateType === 1) {
            // Missing factor: ___ x 7 = 42
            const a = this._rand(2, 10);
            const b = this._rand(2, 10);
            const product = a * b;
            const wrongs = this._makeWrongAnswers(a, 3, 1, 12);
            const answers = this._shuffle([a, ...wrongs]);
            return {
                question: `___ x ${b} = ${product}`,
                questionSpeak: `What times ${b} equals ${product}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(a),
                topic: 'multiplication',
                subtype: 'missing-factor-10',
                explanation: `${a} x ${b} = ${product}! The missing number is ${a}!`,
                explanationSpeak: `${a} times ${b} equals ${product}!`
            };
        } else if (templateType === 2) {
            // Commutative property: "Which equals the same as 3 x 7?"
            const a = this._rand(2, 9);
            const b = this._rand(2, 9);
            if (a === b) return this._multiplication3rd(level);
            const product = a * b;
            const correct = `${b} x ${a}`;
            const wrongs = [
                `${a} x ${a}`,
                `${b} x ${b}`,
                `${a + 1} x ${b}`
            ];
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `Which equals the same\nas ${a} x ${b}?`,
                questionSpeak: `Which gives the same answer as ${a} times ${b}?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'multiplication',
                subtype: 'commutative',
                explanation: `${a} x ${b} = ${b} x ${a} = ${product}! Order doesn't matter in multiplication!`,
                explanationSpeak: `${a} times ${b} and ${b} times ${a} both equal ${product}!`
            };
        } else if (templateType === 3) {
            // Distributive property visual: 6 x 7 = 6 x 5 + 6 x 2
            const a = this._rand(3, 8);
            const b = this._rand(6, 9);
            const split1 = this._rand(2, b - 2);
            const split2 = b - split1;
            const product = a * b;
            const correct = product;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(10, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${a} x ${b} = ?\nHint: ${a} x ${split1} = ${a * split1}\n${a} x ${split2} = ${a * split2}`,
                questionSpeak: `What is ${a} times ${b}? Use the hint: ${a} times ${split1} is ${a * split1}, and ${a} times ${split2} is ${a * split2}.`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'multiplication',
                subtype: 'distributive',
                explanation: `${a} x ${split1} + ${a} x ${split2} = ${a * split1} + ${a * split2} = ${product}!`,
                explanationSpeak: `${a * split1} plus ${a * split2} equals ${product}!`
            };
        } else {
            // Word problem with larger facts
            const names = ['Max', 'Lily', 'Jake', 'Emma'];
            const name = names[this._rand(0, 3)];
            const items = ['rows of desks', 'shelves', 'pages', 'packs', 'teams'];
            const contents = ['seats', 'books', 'stickers', 'cards', 'players'];
            const idx = this._rand(0, items.length - 1);
            const groups = this._rand(3, 9);
            const per = this._rand(3, 9);
            const correct = groups * per;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(5, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `There are ${groups} ${items[idx]}\nwith ${per} ${contents[idx]} each.\nHow many ${contents[idx]} total?`,
                questionSpeak: `There are ${groups} ${items[idx]} with ${per} ${contents[idx]} each. How many total?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'multiplication',
                subtype: 'word-problem-3rd',
                explanation: `${groups} x ${per} = ${correct} ${contents[idx]}!`,
                explanationSpeak: `${groups} times ${per} equals ${correct}!`
            };
        }
    },

    // ---- 3RD GRADE DIVISION ----
    _division(level) {
        const templateType = this._rand(0, 4);

        if (templateType === 0) {
            // Basic division facts
            const divisor = this._rand(2, level >= 9 ? 10 : 7);
            const quotient = this._rand(1, level >= 9 ? 10 : 8);
            const dividend = divisor * quotient;
            const correct = quotient;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 3), correct + 3);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${dividend} ÷ ${divisor} = ?`,
                questionSpeak: `What is ${dividend} divided by ${divisor}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'division',
                subtype: 'basic-facts',
                explanation: `${dividend} ÷ ${divisor} = ${correct}! Because ${correct} x ${divisor} = ${dividend}!`,
                explanationSpeak: `${dividend} divided by ${divisor} equals ${correct}!`
            };
        } else if (templateType === 1) {
            // Relate to multiplication: "If 6 x 4 = 24, then 24 ÷ 6 = ?"
            const a = this._rand(2, 9);
            const b = this._rand(2, 9);
            const product = a * b;
            const correct = b;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 3), correct + 4);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `If ${a} x ${b} = ${product},\nthen ${product} ÷ ${a} = ?`,
                questionSpeak: `If ${a} times ${b} equals ${product}, then what is ${product} divided by ${a}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'division',
                subtype: 'relate-multiply',
                explanation: `${product} ÷ ${a} = ${correct}! Multiplication and division are related!`,
                explanationSpeak: `${product} divided by ${a} equals ${correct}!`
            };
        } else if (templateType === 2) {
            // Equal sharing word problem
            const total = this._rand(2, 8) * this._rand(2, 8);
            const groups = [2, 3, 4, 5, 6, 7, 8].filter(g => total % g === 0 && total / g >= 2);
            if (groups.length === 0) return this._division(level);
            const group = groups[this._rand(0, groups.length - 1)];
            const correct = total / group;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 3), correct + 3);
            const answers = this._shuffle([correct, ...wrongs]);
            const names = ['Emma', 'Jake', 'Mia', 'Ben'];
            const name = names[this._rand(0, 3)];
            return {
                question: `${name} has ${total} stickers to share\nequally among ${group} friends.\nHow many each?`,
                questionSpeak: `${name} has ${total} stickers to share equally among ${group} friends. How many does each friend get?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'division',
                subtype: 'equal-sharing',
                explanation: `${total} ÷ ${group} = ${correct} each!`,
                explanationSpeak: `${total} divided by ${group} equals ${correct} each!`
            };
        } else if (templateType === 3) {
            // "How many groups?" word problem
            const perGroup = this._rand(2, 8);
            const groups = this._rand(2, 8);
            const total = perGroup * groups;
            const correct = groups;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 3), correct + 3);
            const answers = this._shuffle([correct, ...wrongs]);
            const items = ['muffins', 'cookies', 'flowers', 'books', 'balls'];
            const containers = ['boxes', 'bags', 'vases', 'shelves', 'bins'];
            const idx = this._rand(0, items.length - 1);
            return {
                question: `${total} ${items[idx]} are put into groups\nof ${perGroup}. How many ${containers[idx]}?`,
                questionSpeak: `${total} ${items[idx]} are put into groups of ${perGroup}. How many ${containers[idx]} do you need?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'division',
                subtype: 'how-many-groups',
                explanation: `${total} ÷ ${perGroup} = ${correct} ${containers[idx]}!`,
                explanationSpeak: `You need ${correct} ${containers[idx]}!`
            };
        } else {
            // Missing dividend: ___ ÷ 5 = 3
            const divisor = this._rand(2, 9);
            const quotient = this._rand(2, 9);
            const correct = divisor * quotient;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(2, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `___ ÷ ${divisor} = ${quotient}`,
                questionSpeak: `What number divided by ${divisor} equals ${quotient}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'division',
                subtype: 'missing-dividend',
                explanation: `${correct} ÷ ${divisor} = ${quotient}! Because ${quotient} x ${divisor} = ${correct}!`,
                explanationSpeak: `${correct} divided by ${divisor} equals ${quotient}!`
            };
        }
    },

    // ---- 3RD GRADE FRACTIONS — number lines, comparing, equivalent ----
    _fractions3rd(level) {
        const templateType = this._rand(0, 4);

        if (templateType === 0) {
            // Fraction on a number line (0 to 1)
            const den = [3, 4, 6, 8][this._rand(0, level >= 9 ? 3 : 2)];
            const num = this._rand(1, den - 1);
            const correct = `${num}/${den}`;
            const wrongs = [];
            let attempts = 0;
            while (wrongs.length < 3 && attempts < 30) {
                const wn = this._rand(1, den);
                const w = `${wn}/${den}`;
                if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
                attempts++;
            }
            // Fill remaining with different-denominator fractions if needed
            const fallbacks = ['1/3', '2/5', '3/8', '1/6', '5/8', '3/4'];
            for (const fb of fallbacks) {
                if (wrongs.length >= 3) break;
                if (fb !== correct && !wrongs.includes(fb)) wrongs.push(fb);
            }
            const answers = this._shuffle([correct, ...wrongs]);
            const marks = den;
            const arrow = num;
            const line = '0' + '---|'.repeat(marks).slice(0, -1) + '---1';
            return {
                question: `What fraction does the\narrow point to?\n${line}\n↑ mark ${arrow} of ${marks}`,
                questionSpeak: `On a number line from 0 to 1 divided into ${marks} parts, the arrow points to mark ${arrow}. What fraction is that?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'fractions',
                subtype: 'number-line',
                explanation: `Mark ${arrow} out of ${marks} = ${correct}!`,
                explanationSpeak: `That's ${num} out of ${den}, or ${correct}!`
            };
        } else if (templateType === 1) {
            // Compare fractions with same denominator
            const den = [3, 4, 6, 8][this._rand(0, 3)];
            let a, b;
            do {
                a = this._rand(1, den - 1);
                b = this._rand(1, den - 1);
            } while (a === b);
            const correctSymbol = a > b ? '>' : '<';
            const answers = this._shuffle(['>', '<', '=']);
            return {
                question: `${a}/${den} ___ ${b}/${den}\nWhich sign?`,
                questionSpeak: `Compare ${a} over ${den} and ${b} over ${den}. Which is bigger?`,
                answers,
                correctIndex: answers.indexOf(correctSymbol),
                topic: 'fractions',
                subtype: 'compare-same-den',
                explanation: `${a}/${den} ${correctSymbol} ${b}/${den}! Same denominator, so compare numerators: ${Math.max(a, b)} > ${Math.min(a, b)}!`,
                explanationSpeak: `${Math.max(a, b)} over ${den} is bigger because ${Math.max(a, b)} is more than ${Math.min(a, b)}!`
            };
        } else if (templateType === 2) {
            // Compare fractions with same numerator
            const num = this._rand(1, 3);
            let d1, d2;
            do {
                d1 = this._rand(2, 8);
                d2 = this._rand(2, 8);
            } while (d1 === d2 || num >= d1 || num >= d2);
            const correctSymbol = d1 < d2 ? '>' : '<';
            const answers = this._shuffle(['>', '<', '=']);
            return {
                question: `${num}/${d1} ___ ${num}/${d2}\nWhich sign?`,
                questionSpeak: `Compare ${num} over ${d1} and ${num} over ${d2}.`,
                answers,
                correctIndex: answers.indexOf(correctSymbol),
                topic: 'fractions',
                subtype: 'compare-same-num',
                explanation: `${num}/${d1} ${correctSymbol} ${num}/${d2}! Same numerator means smaller denominator = bigger pieces!`,
                explanationSpeak: `Smaller denominator means bigger pieces!`
            };
        } else if (templateType === 3) {
            // Equivalent fractions
            const pairs = [
                { a: '1/2', b: '2/4', explain: '1/2 and 2/4 are the same amount!' },
                { a: '1/2', b: '3/6', explain: '1/2 and 3/6 are the same amount!' },
                { a: '1/2', b: '4/8', explain: '1/2 and 4/8 are the same amount!' },
                { a: '1/3', b: '2/6', explain: '1/3 and 2/6 are the same amount!' },
                { a: '2/3', b: '4/6', explain: '2/3 and 4/6 are the same amount!' },
                { a: '1/4', b: '2/8', explain: '1/4 and 2/8 are the same amount!' },
                { a: '3/4', b: '6/8', explain: '3/4 and 6/8 are the same amount!' }
            ];
            const pair = pairs[this._rand(0, pairs.length - 1)];
            const correct = pair.b;
            const allFracs = ['1/2', '2/4', '3/6', '4/8', '1/3', '2/6', '2/3', '4/6', '1/4', '2/8', '3/4', '6/8', '1/5', '3/5', '5/6', '7/8'];
            const wrongs = allFracs.filter(f => f !== pair.a && f !== pair.b);
            const answers = this._shuffle([correct, ...this._shuffle(wrongs).slice(0, 3)]);
            return {
                question: `Which fraction equals ${pair.a}?`,
                questionSpeak: `Which fraction is equal to ${pair.a}?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'fractions',
                subtype: 'equivalent',
                explanation: pair.explain,
                explanationSpeak: pair.explain
            };
        } else {
            // Whole numbers as fractions: 3 = ?/1, or 1 = 4/4
            const roll = Math.random();
            if (roll < 0.5) {
                const whole = this._rand(1, 6);
                const correct = `${whole}/1`;
                const wrongs = [`1/${whole}`, `${whole}/${whole}`, `${whole + 1}/1`];
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Write ${whole} as a fraction:`,
                    questionSpeak: `How do you write ${whole} as a fraction?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'fractions',
                    subtype: 'whole-as-fraction',
                    explanation: `${whole} = ${whole}/1! Any whole number over 1 is itself!`,
                    explanationSpeak: `${whole} equals ${whole} over 1!`
                };
            } else {
                const den = [2, 3, 4, 6, 8][this._rand(0, 4)];
                const correct = `${den}/${den}`;
                const wrongs = [`1/${den}`, `${den}/1`, `${den - 1}/${den}`];
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Which fraction equals 1 whole?`,
                    questionSpeak: `Which fraction is equal to 1 whole?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'fractions',
                    subtype: 'whole-fraction',
                    explanation: `${den}/${den} = 1 whole! When numerator equals denominator, it's 1!`,
                    explanationSpeak: `${den} over ${den} equals 1 whole!`
                };
            }
        }
    },

    // ---- 3RD GRADE TIME — elapsed time with hours and minutes ----
    _time3rd(level) {
        const templateType = this._rand(0, 4);

        if (templateType === 0) {
            // Elapsed time in minutes (15/30/45 min intervals)
            const startHour = this._rand(1, 11);
            const startMin = [0, 15, 30][this._rand(0, 2)];
            const elapsed = [15, 30, 45][this._rand(0, 2)];
            let endMin = startMin + elapsed;
            let endHour = startHour;
            if (endMin >= 60) {
                endMin -= 60;
                endHour = endHour + 1;
                if (endHour > 12) endHour = 1;
            }
            const startStr = `${startHour}:${startMin < 10 ? '0' : ''}${startMin}`;
            const correctStr = `${endHour}:${endMin < 10 ? '0' : ''}${endMin}`;
            const wrongs = [];
            while (wrongs.length < 3) {
                const wh = this._rand(1, 12);
                const wm = [0, 15, 30, 45][this._rand(0, 3)];
                const w = `${wh}:${wm < 10 ? '0' : ''}${wm}`;
                if (w !== correctStr && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([correctStr, ...wrongs]);
            return {
                question: `It is ${startStr}.\n${elapsed} minutes later = ?`,
                questionSpeak: `It is ${startStr}. What time will it be ${elapsed} minutes later?`,
                answers,
                correctIndex: answers.indexOf(correctStr),
                topic: 'time',
                subtype: 'elapsed-minutes',
                explanation: `${startStr} + ${elapsed} minutes = ${correctStr}!`,
                explanationSpeak: `${elapsed} minutes after ${startStr} is ${correctStr}!`
            };
        } else if (templateType === 1) {
            // Elapsed time in hours and minutes
            const startHour = this._rand(1, 10);
            const elapsedHours = this._rand(1, 3);
            const elapsedMin = [0, 15, 30][this._rand(0, 2)];
            let endHour = startHour + elapsedHours;
            if (endHour > 12) endHour -= 12;
            const startStr = `${startHour}:00`;
            const correctStr = `${endHour}:${elapsedMin < 10 ? '0' : ''}${elapsedMin}`;
            const wrongs = [];
            while (wrongs.length < 3) {
                const wh = this._rand(1, 12);
                const wm = [0, 15, 30, 45][this._rand(0, 3)];
                const w = `${wh}:${wm < 10 ? '0' : ''}${wm}`;
                if (w !== correctStr && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([correctStr, ...wrongs]);
            const elapsedDesc = elapsedMin > 0 ? `${elapsedHours} hour${elapsedHours > 1 ? 's' : ''} and ${elapsedMin} minutes` : `${elapsedHours} hour${elapsedHours > 1 ? 's' : ''}`;
            return {
                question: `Start: ${startStr}\n${elapsedDesc} later = ?`,
                questionSpeak: `It starts at ${startStr}. What time is it ${elapsedDesc} later?`,
                answers,
                correctIndex: answers.indexOf(correctStr),
                topic: 'time',
                subtype: 'elapsed-hr-min',
                explanation: `${startStr} + ${elapsedDesc} = ${correctStr}!`,
                explanationSpeak: `${elapsedDesc} after ${startStr} is ${correctStr}!`
            };
        } else if (templateType === 2) {
            // "How much time passed?"
            const startHour = this._rand(1, 10);
            const elapsed = this._rand(1, 4);
            const endHour = startHour + elapsed;
            const correct = elapsed;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 2), correct + 3);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `School starts at ${startHour}:00.\nSchool ends at ${endHour}:00.\nHow many hours long?`,
                questionSpeak: `School starts at ${startHour} and ends at ${endHour}. How many hours is that?`,
                answers: answers.map(v => `${v} hr${v > 1 ? 's' : ''}`),
                correctIndex: answers.indexOf(correct),
                topic: 'time',
                subtype: 'duration',
                explanation: `${endHour} - ${startHour} = ${correct} hours!`,
                explanationSpeak: `That's ${correct} hours!`
            };
        } else if (templateType === 3) {
            // Read to 1-minute intervals
            const hour = this._rand(1, 12);
            const min = this._rand(1, 59);
            const minStr = min < 10 ? `0${min}` : `${min}`;
            const correct = `${hour}:${minStr}`;
            const wrongs = [];
            while (wrongs.length < 3) {
                const wh = this._rand(1, 12);
                const wm = this._rand(0, 59);
                const wmStr = wm < 10 ? `0${wm}` : `${wm}`;
                const w = `${wh}:${wmStr}`;
                if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `🕐 Hour hand near ${hour}.\nMinute hand on ${min}.\nWhat time is it?`,
                questionSpeak: `The hour hand is near ${hour} and ${min} minutes have passed. What time is it?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'time',
                subtype: 'exact-minute',
                explanation: `It's ${correct}!`,
                explanationSpeak: `The time is ${hour} ${min}!`
            };
        } else {
            // Time word problem
            const activities = [
                { name: 'a movie', startH: 2, startM: 0, durH: 1, durM: 45 },
                { name: 'soccer practice', startH: 3, startM: 30, durH: 1, durM: 30 },
                { name: 'a school day', startH: 8, startM: 0, durH: 7, durM: 0 },
                { name: 'art class', startH: 10, startM: 15, durH: 0, durM: 45 },
                { name: 'a bike ride', startH: 4, startM: 0, durH: 1, durM: 15 }
            ];
            const a = activities[this._rand(0, activities.length - 1)];
            let endH = a.startH + a.durH;
            let endM = a.startM + a.durM;
            if (endM >= 60) { endM -= 60; endH++; }
            const startStr = `${a.startH}:${a.startM < 10 ? '0' : ''}${a.startM}`;
            const endStr = `${endH}:${endM < 10 ? '0' : ''}${endM}`;
            const correctStr = endStr;
            const wrongs = [];
            while (wrongs.length < 3) {
                const wh = this._rand(1, 12);
                const wm = [0, 15, 30, 45][this._rand(0, 3)];
                const w = `${wh}:${wm < 10 ? '0' : ''}${wm}`;
                if (w !== correctStr && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([correctStr, ...wrongs]);
            const durStr = a.durH > 0 && a.durM > 0 ? `${a.durH} hr ${a.durM} min` : a.durH > 0 ? `${a.durH} hours` : `${a.durM} minutes`;
            return {
                question: `${a.name} starts at ${startStr}\nand lasts ${durStr}.\nWhen does it end?`,
                questionSpeak: `${a.name} starts at ${startStr} and lasts ${durStr}. When does it end?`,
                answers,
                correctIndex: answers.indexOf(correctStr),
                topic: 'time',
                subtype: 'word-problem-time',
                explanation: `${startStr} + ${durStr} = ${correctStr}!`,
                explanationSpeak: `It ends at ${correctStr}!`
            };
        }
    },

    // ---- 3RD GRADE MONEY — dollars and cents ----
    _money3rd(level) {
        const templateType = this._rand(0, 3);

        if (templateType === 0) {
            // Add dollars and cents
            const d1 = this._rand(1, 9);
            const c1 = this._rand(0, 19) * 5;
            const d2 = this._rand(1, 5);
            const c2 = this._rand(0, 19) * 5;
            let totalC = c1 + c2;
            let totalD = d1 + d2;
            if (totalC >= 100) { totalC -= 100; totalD++; }
            const correct = `$${totalD}.${totalC < 10 ? '0' : ''}${totalC}`;
            const wrongs = [];
            while (wrongs.length < 3) {
                const wd = this._rand(Math.max(1, totalD - 2), totalD + 3);
                const wc = this._rand(0, 19) * 5;
                const w = `$${wd}.${wc < 10 ? '0' : ''}${wc}`;
                if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `$${d1}.${c1 < 10 ? '0' : ''}${c1} + $${d2}.${c2 < 10 ? '0' : ''}${c2} = ?`,
                questionSpeak: `What is ${d1} dollars ${c1} cents plus ${d2} dollars ${c2} cents?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'money',
                subtype: 'add-dollars',
                explanation: `The total is ${correct}!`,
                explanationSpeak: `The total is ${totalD} dollars and ${totalC} cents!`
            };
        } else if (templateType === 1) {
            // Make change from $5 or $10
            const startAmount = Math.random() < 0.5 ? 5 : 10;
            const price = this._rand(1, startAmount - 1) * 100 + this._rand(0, 19) * 5;
            const changeCents = startAmount * 100 - price;
            const changeD = Math.floor(changeCents / 100);
            const changeC = changeCents % 100;
            const correct = `$${changeD}.${changeC < 10 ? '0' : ''}${changeC}`;
            const priceD = Math.floor(price / 100);
            const priceC = price % 100;
            const wrongs = [];
            while (wrongs.length < 3) {
                const wd = this._rand(0, startAmount);
                const wc = this._rand(0, 19) * 5;
                const w = `$${wd}.${wc < 10 ? '0' : ''}${wc}`;
                if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `You pay with $${startAmount}.00.\nItem costs $${priceD}.${priceC < 10 ? '0' : ''}${priceC}.\nChange back?`,
                questionSpeak: `You pay with ${startAmount} dollars. The item costs ${priceD} dollars and ${priceC} cents. How much change?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'money',
                subtype: 'change-dollars',
                explanation: `$${startAmount}.00 - $${priceD}.${priceC < 10 ? '0' : ''}${priceC} = ${correct}!`,
                explanationSpeak: `Your change is ${correct}!`
            };
        } else if (templateType === 2) {
            // Multiply money (cost of multiple items)
            const price = this._rand(1, 8) * 25; // 25 cent increments
            const qty = this._rand(2, 6);
            const totalCents = price * qty;
            const totalD = Math.floor(totalCents / 100);
            const totalC = totalCents % 100;
            const correct = `$${totalD}.${totalC < 10 ? '0' : ''}${totalC}`;
            const priceD = Math.floor(price / 100);
            const priceC = price % 100;
            const wrongs = [];
            while (wrongs.length < 3) {
                const wd = this._rand(Math.max(0, totalD - 2), totalD + 3);
                const wc = this._rand(0, 19) * 5;
                const w = `$${wd}.${wc < 10 ? '0' : ''}${wc}`;
                if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `Each snack costs $${priceD}.${priceC < 10 ? '0' : ''}${priceC}.\nBuy ${qty} snacks. Total?`,
                questionSpeak: `Each snack costs ${priceD} dollars and ${priceC} cents. You buy ${qty}. What's the total?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'money',
                subtype: 'multiply-money',
                explanation: `${qty} x $${priceD}.${priceC < 10 ? '0' : ''}${priceC} = ${correct}!`,
                explanationSpeak: `${qty} snacks cost ${correct}!`
            };
        } else {
            // Compare prices
            const p1 = this._rand(1, 15) * 50;
            let p2;
            do { p2 = this._rand(1, 15) * 50; } while (p2 === p1);
            const d1 = Math.floor(p1 / 100);
            const c1 = p1 % 100;
            const d2 = Math.floor(p2 / 100);
            const c2 = p2 % 100;
            const correctSymbol = p1 > p2 ? '>' : '<';
            const s1 = `$${d1}.${c1 < 10 ? '0' : ''}${c1}`;
            const s2 = `$${d2}.${c2 < 10 ? '0' : ''}${c2}`;
            const answers = this._shuffle(['>', '<', '=']);
            return {
                question: `${s1} ___ ${s2}\nWhich sign?`,
                questionSpeak: `Compare ${s1} and ${s2}. Which is more?`,
                answers,
                correctIndex: answers.indexOf(correctSymbol),
                topic: 'money',
                subtype: 'compare-dollars',
                explanation: `${s1} ${correctSymbol} ${s2}!`,
                explanationSpeak: `${p1 > p2 ? s1 : s2} is more!`
            };
        }
    },

    // ---- 3RD GRADE MEASUREMENT — liquid volume, mass ----
    _measurement3rd(level) {
        const templateType = this._rand(0, 3);

        if (templateType === 0) {
            // Liquid volume: liters
            const questions = [
                { q: 'A bathtub holds about...', correct: '150 liters', wrongs: ['5 liters', '15 liters', '1500 liters'] },
                { q: 'A water bottle holds about...', correct: '1 liter', wrongs: ['10 liters', '100 liters', '50 liters'] },
                { q: 'A fish tank holds about...', correct: '40 liters', wrongs: ['4 liters', '400 liters', '1 liter'] },
                { q: 'A teaspoon holds about...', correct: '5 mL', wrongs: ['5 liters', '50 mL', '500 mL'] }
            ];
            const qd = questions[this._rand(0, questions.length - 1)];
            const answers = this._shuffle([qd.correct, ...qd.wrongs]);
            return {
                question: qd.q,
                questionSpeak: qd.q,
                answers,
                correctIndex: answers.indexOf(qd.correct),
                topic: 'measurement',
                subtype: 'liquid-volume',
                explanation: `The answer is ${qd.correct}!`,
                explanationSpeak: `It holds about ${qd.correct}!`
            };
        } else if (templateType === 1) {
            // Mass: grams and kilograms
            const questions = [
                { q: 'A paperclip weighs about...', correct: '1 gram', wrongs: ['1 kilogram', '10 grams', '100 grams'] },
                { q: 'A textbook weighs about...', correct: '1 kilogram', wrongs: ['1 gram', '10 grams', '100 kilograms'] },
                { q: 'A watermelon weighs about...', correct: '5 kilograms', wrongs: ['5 grams', '50 grams', '50 kilograms'] },
                { q: 'A pencil weighs about...', correct: '5 grams', wrongs: ['5 kilograms', '50 grams', '500 grams'] }
            ];
            const qd = questions[this._rand(0, questions.length - 1)];
            const answers = this._shuffle([qd.correct, ...qd.wrongs]);
            return {
                question: qd.q,
                questionSpeak: qd.q,
                answers,
                correctIndex: answers.indexOf(qd.correct),
                topic: 'measurement',
                subtype: 'mass',
                explanation: `The answer is ${qd.correct}!`,
                explanationSpeak: `It weighs about ${qd.correct}!`
            };
        } else if (templateType === 2) {
            // Add/subtract measurements
            const a = this._rand(100, 500);
            const b = this._rand(100, 500);
            const isAdd = Math.random() < 0.5;
            const unit = ['grams', 'mL'][this._rand(0, 1)];
            const correct = isAdd ? a + b : Math.max(a, b) - Math.min(a, b);
            const big = Math.max(a, b);
            const small = Math.min(a, b);
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(10, correct - 100), correct + 100);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: isAdd ? `${a} ${unit} + ${b} ${unit} = ?` : `${big} ${unit} - ${small} ${unit} = ?`,
                questionSpeak: isAdd ? `What is ${a} ${unit} plus ${b} ${unit}?` : `What is ${big} ${unit} minus ${small} ${unit}?`,
                answers: answers.map(v => `${v} ${unit}`),
                correctIndex: answers.indexOf(correct),
                topic: 'measurement',
                subtype: 'calc-measurement',
                explanation: `${isAdd ? `${a} + ${b}` : `${big} - ${small}`} = ${correct} ${unit}!`,
                explanationSpeak: `The answer is ${correct} ${unit}!`
            };
        } else {
            // Unit conversion concepts
            const questions = [
                { q: 'How many grams in\n1 kilogram?', correct: '1,000', wrongs: ['100', '10', '10,000'] },
                { q: 'How many mL in\n1 liter?', correct: '1,000', wrongs: ['100', '10', '10,000'] },
                { q: '2 kilograms = ? grams', correct: '2,000', wrongs: ['200', '20', '20,000'] },
                { q: '3 liters = ? mL', correct: '3,000', wrongs: ['300', '30', '30,000'] }
            ];
            const qd = questions[this._rand(0, questions.length - 1)];
            const answers = this._shuffle([qd.correct, ...qd.wrongs]);
            return {
                question: qd.q,
                questionSpeak: qd.q.replace(/\n/g, ' '),
                answers,
                correctIndex: answers.indexOf(qd.correct),
                topic: 'measurement',
                subtype: 'unit-convert',
                explanation: `The answer is ${qd.correct}!`,
                explanationSpeak: `The answer is ${qd.correct}!`
            };
        }
    },

    // ---- 3RD GRADE BIG NUMBERS — rounding, place value to thousands ----
    _threeDigit3rd(level) {
        const templateType = this._rand(0, 3);

        if (templateType === 0) {
            // Round to nearest 10
            const n = this._rand(11, 99);
            const correct = Math.round(n / 10) * 10;
            const wrongs = [correct - 10, correct + 10, correct + 5].filter(w => w >= 0 && w !== correct);
            while (wrongs.length < 3) wrongs.push(correct + (wrongs.length + 2) * 10);
            const answers = this._shuffle([correct, ...wrongs.slice(0, 3)]);
            return {
                question: `Round ${n} to the\nnearest 10:`,
                questionSpeak: `Round ${n} to the nearest ten.`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'three-digit',
                subtype: 'round-10',
                explanation: `${n} rounds to ${correct}! Look at the ones digit: ${n % 10 >= 5 ? 'round up' : 'round down'}!`,
                explanationSpeak: `${n} rounds to ${correct}!`
            };
        } else if (templateType === 1) {
            // Round to nearest 100
            const n = this._rand(101, 999);
            const correct = Math.round(n / 100) * 100;
            const wrongs = [correct - 100, correct + 100, correct - 50].filter(w => w >= 0 && w !== correct);
            while (wrongs.length < 3) wrongs.push(correct + (wrongs.length + 2) * 100);
            const answers = this._shuffle([correct, ...wrongs.slice(0, 3)]);
            const tensDigit = Math.floor((n % 100) / 10);
            return {
                question: `Round ${n} to the\nnearest 100:`,
                questionSpeak: `Round ${n} to the nearest hundred.`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'three-digit',
                subtype: 'round-100',
                explanation: `${n} rounds to ${correct}! Look at the tens digit (${tensDigit}): ${tensDigit >= 5 ? 'round up' : 'round down'}!`,
                explanationSpeak: `${n} rounds to ${correct}!`
            };
        } else if (templateType === 2) {
            // Place value to thousands
            const th = this._rand(1, 9);
            const h = this._rand(0, 9);
            const t = this._rand(0, 9);
            const o = this._rand(0, 9);
            const n = th * 1000 + h * 100 + t * 10 + o;
            const places = [
                { name: 'thousands', digit: th },
                { name: 'hundreds', digit: h },
                { name: 'tens', digit: t },
                { name: 'ones', digit: o }
            ];
            const place = places[this._rand(0, 3)];
            const correct = place.digit;
            const wrongs = this._makeWrongAnswers(correct, 3, 0, 9);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `In ${n.toLocaleString()}, what digit\nis in the ${place.name} place?`,
                questionSpeak: `In the number ${n}, what digit is in the ${place.name} place?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'three-digit',
                subtype: 'place-value-4',
                explanation: `The ${place.name} digit in ${n.toLocaleString()} is ${correct}!`,
                explanationSpeak: `The ${place.name} digit is ${correct}!`
            };
        } else {
            // Compare 4-digit numbers
            let a = this._rand(1000, 9999);
            let b = this._rand(1000, 9999);
            if (Math.random() < 0.1) b = a;
            const correctSymbol = a > b ? '>' : a < b ? '<' : '=';
            const answers = this._shuffle(['>', '<', '=']);
            return {
                question: `${a.toLocaleString()} ___ ${b.toLocaleString()}\nWhich sign?`,
                questionSpeak: `Compare ${a} and ${b}. Which sign goes in the blank?`,
                answers,
                correctIndex: answers.indexOf(correctSymbol),
                topic: 'three-digit',
                subtype: 'compare-4digit',
                explanation: `${a.toLocaleString()} ${correctSymbol} ${b.toLocaleString()}!`,
                explanationSpeak: `${a} is ${a > b ? 'greater than' : a < b ? 'less than' : 'equal to'} ${b}!`
            };
        }
    },

    // ---- 3RD GRADE WORD PROBLEMS — multi-step, multiplication/division ----
    _wordProblems3rd(name, level) {
        const templateType = this._rand(0, 4);

        if (templateType === 0) {
            // Two-step with multiplication and addition
            const obj = ['stickers', 'cards', 'books', 'apples'][this._rand(0, 3)];
            const packs = this._rand(3, 7);
            const per = this._rand(4, 8);
            const extra = this._rand(3, 15);
            const correct = packs * per + extra;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(10, correct - 15), correct + 15);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${name} has ${packs} packs of ${obj}\nwith ${per} each, plus ${extra} loose.\nHow many total?`,
                questionSpeak: `${name} has ${packs} packs of ${obj} with ${per} each, plus ${extra} loose ones. How many total?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'word-problems',
                subtype: 'multi-step-mult',
                explanation: `${packs} x ${per} = ${packs * per}, plus ${extra} = ${correct}!`,
                explanationSpeak: `${packs} times ${per} is ${packs * per}, plus ${extra} equals ${correct}!`
            };
        } else if (templateType === 1) {
            // Division word problem
            const total = this._rand(3, 9) * this._rand(3, 9);
            const groups = [3, 4, 5, 6, 7, 8, 9].filter(g => total % g === 0);
            if (groups.length === 0) return this._wordProblems3rd(name, level);
            const group = groups[this._rand(0, groups.length - 1)];
            const correct = total / group;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 4), correct + 4);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${name} has ${total} photos to put\nin ${group} albums equally.\nHow many per album?`,
                questionSpeak: `${name} has ${total} photos to put in ${group} albums equally. How many per album?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'word-problems',
                subtype: 'division-wp',
                explanation: `${total} / ${group} = ${correct} photos per album!`,
                explanationSpeak: `${correct} photos per album!`
            };
        } else if (templateType === 2) {
            // Two-step with subtraction then division
            const total = this._rand(30, 80);
            const used = this._rand(5, 15);
            const remaining = total - used;
            const groups = [2, 3, 4, 5].filter(g => remaining % g === 0);
            if (groups.length === 0) return this._wordProblems3rd(name, level);
            const group = groups[this._rand(0, groups.length - 1)];
            const correct = remaining / group;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 5), correct + 5);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${name} baked ${total} cookies.\nAte ${used}, then split the rest\namong ${group} friends. How many each?`,
                questionSpeak: `${name} baked ${total} cookies. Ate ${used}, then split the rest among ${group} friends. How many does each friend get?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'word-problems',
                subtype: 'two-step-div',
                explanation: `${total} - ${used} = ${remaining}, then ${remaining} / ${group} = ${correct} each!`,
                explanationSpeak: `${total} minus ${used} is ${remaining}, divided by ${group} is ${correct}!`
            };
        } else if (templateType === 3) {
            // Area word problem
            const l = this._rand(3, 12);
            const w = this._rand(3, 10);
            const correct = l * w;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(5, correct - 15), correct + 15);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${name}'s garden is ${l} ft long\nand ${w} ft wide.\nWhat is the area?`,
                questionSpeak: `${name}'s garden is ${l} feet long and ${w} feet wide. What is the area?`,
                answers: answers.map(v => `${v} sq ft`),
                correctIndex: answers.indexOf(correct),
                topic: 'word-problems',
                subtype: 'area-wp',
                explanation: `Area = ${l} x ${w} = ${correct} square feet!`,
                explanationSpeak: `${l} times ${w} equals ${correct} square feet!`
            };
        } else {
            // Comparison with multiplication
            const names2 = ['Jake', 'Mia', 'Ben', 'Sara', 'Lily'];
            const n2 = names2.filter(n => n !== name)[this._rand(0, 3)];
            const aCount = this._rand(3, 8);
            const multiplier = this._rand(2, 5);
            const bCount = aCount * multiplier;
            const correct = bCount;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(3, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            const obj = ['stickers', 'marbles', 'cards', 'coins'][this._rand(0, 3)];
            return {
                question: `${name} has ${aCount} ${obj}.\n${n2} has ${multiplier} times as many.\nHow many does ${n2} have?`,
                questionSpeak: `${name} has ${aCount} ${obj}. ${n2} has ${multiplier} times as many. How many does ${n2} have?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'word-problems',
                subtype: 'times-as-many',
                explanation: `${aCount} x ${multiplier} = ${correct}! ${n2} has ${correct} ${obj}!`,
                explanationSpeak: `${aCount} times ${multiplier} equals ${correct}!`
            };
        }
    },

    // ---- 3RD GRADE SKIP COUNTING (for counting topic at level 8+) ----
    _skipCounting3rd(level) {
        const templateType = this._rand(0, 2);

        if (templateType === 0) {
            // Count by 3s, 4s, 6s, 7s, 8s, 9s
            const step = [3, 4, 6, 7, 8, 9][this._rand(0, 5)];
            const startMult = this._rand(1, 4);
            const start = step * startMult;
            const count = 4;
            const sequence = [];
            for (let i = 0; i < count; i++) sequence.push(start + i * step);
            const correct = start + count * step;
            const display = sequence.join(', ') + ', ___';
            const wrongs = this._makeWrongAnswers(correct, 3, correct - step * 2, correct + step * 2);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `Count by ${step}s:\n${display}`,
                questionSpeak: `Count by ${step}s. What comes next? ${sequence.join(', ')}`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'counting',
                subtype: 'skip-count-3rd',
                explanation: `Counting by ${step}s: ${sequence.join(', ')}, ${correct}!`,
                explanationSpeak: `${correct} comes next!`
            };
        } else if (templateType === 1) {
            // Count backwards by multiples
            const step = [5, 10, 25, 50][this._rand(0, 3)];
            const start = step * this._rand(6, 12);
            const count = 4;
            const sequence = [];
            for (let i = 0; i < count; i++) sequence.push(start - i * step);
            const correct = start - count * step;
            if (correct < 0) return this._skipCounting3rd(level);
            const display = sequence.join(', ') + ', ___';
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - step * 2), correct + step * 2);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `Count backwards by ${step}s:\n${display}`,
                questionSpeak: `Count backwards by ${step}s. What comes next?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'counting',
                subtype: 'count-back-3rd',
                explanation: `Subtract ${step} each time: ${correct}!`,
                explanationSpeak: `${correct} comes next!`
            };
        } else {
            // Number patterns with multiplication
            const base = this._rand(2, 9);
            const sequence = [base * 1, base * 2, base * 3, base * 4];
            const correct = base * 5;
            const display = sequence.join(', ') + ', ___';
            const wrongs = this._makeWrongAnswers(correct, 3, correct - base * 2, correct + base * 2);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `What comes next?\n${display}`,
                questionSpeak: `What comes next? ${sequence.join(', ')}`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'counting',
                subtype: 'mult-pattern',
                explanation: `These are multiples of ${base}: ${sequence.join(', ')}, ${correct}!`,
                explanationSpeak: `These are the ${base} times table! ${correct} comes next!`
            };
        }
    },

    // ---- AREA & PERIMETER (new 3rd grade topic) ----
    _areaPerimeter(level) {
        const templateType = this._rand(0, 4);

        if (templateType === 0) {
            // Area of rectangle
            const l = this._rand(2, level >= 9 ? 12 : 9);
            const w = this._rand(2, level >= 9 ? 10 : 8);
            const correct = l * w;
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(2, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `Rectangle: ${l} units long,\n${w} units wide.\nArea = ?`,
                questionSpeak: `A rectangle is ${l} units long and ${w} units wide. What is the area?`,
                answers: answers.map(v => `${v} sq units`),
                correctIndex: answers.indexOf(correct),
                topic: 'area-perimeter',
                subtype: 'area-rect',
                explanation: `Area = length x width = ${l} x ${w} = ${correct} square units!`,
                explanationSpeak: `${l} times ${w} equals ${correct} square units!`
            };
        } else if (templateType === 1) {
            // Perimeter of rectangle
            const l = this._rand(2, level >= 9 ? 15 : 10);
            const w = this._rand(2, level >= 9 ? 12 : 8);
            const correct = 2 * (l + w);
            const wrongs = [l * w, l + w, 2 * l + w].filter(v => v !== correct);
            while (wrongs.length < 3) wrongs.push(correct + this._rand(1, 5));
            const answers = this._shuffle([correct, ...wrongs.slice(0, 3)]);
            return {
                question: `Rectangle: ${l} units long,\n${w} units wide.\nPerimeter = ?`,
                questionSpeak: `A rectangle is ${l} units long and ${w} units wide. What is the perimeter?`,
                answers: answers.map(v => `${v} units`),
                correctIndex: answers.indexOf(correct),
                topic: 'area-perimeter',
                subtype: 'perimeter-rect',
                explanation: `Perimeter = 2 x (${l} + ${w}) = 2 x ${l + w} = ${correct} units!`,
                explanationSpeak: `Add all four sides: ${l} plus ${w} plus ${l} plus ${w} equals ${correct}!`
            };
        } else if (templateType === 2) {
            // Area of square
            const side = this._rand(2, 10);
            const correct = side * side;
            const wrongs = [side * 4, side * 2, side + side].filter(v => v !== correct);
            while (wrongs.length < 3) wrongs.push(correct + this._rand(1, 5));
            const answers = this._shuffle([correct, ...wrongs.slice(0, 3)]);
            return {
                question: `Square: each side = ${side} units.\nArea = ?`,
                questionSpeak: `A square has sides of ${side} units. What is the area?`,
                answers: answers.map(v => `${v} sq units`),
                correctIndex: answers.indexOf(correct),
                topic: 'area-perimeter',
                subtype: 'area-square',
                explanation: `Area of a square = side x side = ${side} x ${side} = ${correct} sq units!`,
                explanationSpeak: `${side} times ${side} equals ${correct} square units!`
            };
        } else if (templateType === 3) {
            // Perimeter of square
            const side = this._rand(2, 12);
            const correct = side * 4;
            const wrongs = [side * side, side * 2, side * 3].filter(v => v !== correct);
            while (wrongs.length < 3) wrongs.push(correct + this._rand(1, 5));
            const answers = this._shuffle([correct, ...wrongs.slice(0, 3)]);
            return {
                question: `Square: each side = ${side} units.\nPerimeter = ?`,
                questionSpeak: `A square has sides of ${side} units. What is the perimeter?`,
                answers: answers.map(v => `${v} units`),
                correctIndex: answers.indexOf(correct),
                topic: 'area-perimeter',
                subtype: 'perimeter-square',
                explanation: `Perimeter = 4 x ${side} = ${correct} units! A square has 4 equal sides!`,
                explanationSpeak: `4 times ${side} equals ${correct} units!`
            };
        } else {
            // "Is this area or perimeter?"
            const scenarios = [
                { desc: 'carpet to cover a floor', correct: 'Area', explain: 'Covering a surface is area!' },
                { desc: 'fence around a yard', correct: 'Perimeter', explain: 'Going around the outside is perimeter!' },
                { desc: 'paint for a wall', correct: 'Area', explain: 'Painting a surface is area!' },
                { desc: 'border for a picture', correct: 'Perimeter', explain: 'A border goes around the edge, that is perimeter!' },
                { desc: 'tiles for a bathroom floor', correct: 'Area', explain: 'Covering a floor is area!' },
                { desc: 'ribbon around a gift box lid', correct: 'Perimeter', explain: 'Ribbon goes around the edge, that is perimeter!' }
            ];
            const s = scenarios[this._rand(0, scenarios.length - 1)];
            const answers = this._shuffle(['Area', 'Perimeter']);
            return {
                question: `To find how much ${s.desc},\ndo you need AREA\nor PERIMETER?`,
                questionSpeak: `To find how much ${s.desc}, do you need area or perimeter?`,
                answers,
                correctIndex: answers.indexOf(s.correct),
                topic: 'area-perimeter',
                subtype: 'area-vs-perimeter',
                explanation: s.explain,
                explanationSpeak: s.explain
            };
        }
    },

    // ---- ROUNDING (new 3rd grade topic) ----
    _rounding(level) {
        const templateType = this._rand(0, 3);

        if (templateType === 0) {
            // Round to nearest 10
            const n = this._rand(11, level >= 9 ? 999 : 99);
            const correct = Math.round(n / 10) * 10;
            const wrongs = [correct - 10, correct + 10, n].filter(w => w >= 0 && w !== correct);
            while (wrongs.length < 3) wrongs.push(correct + (wrongs.length + 2) * 10);
            const answers = this._shuffle([correct, ...wrongs.slice(0, 3)]);
            return {
                question: `Round ${n} to the\nnearest 10:`,
                questionSpeak: `Round ${n} to the nearest ten.`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'rounding',
                subtype: 'round-10',
                explanation: `${n} rounds to ${correct}! The ones digit ${n % 10} is ${n % 10 >= 5 ? '5 or more, so round up' : 'less than 5, so round down'}!`,
                explanationSpeak: `${n} rounds to ${correct}!`
            };
        } else if (templateType === 1) {
            // Round to nearest 100
            const n = this._rand(101, level >= 9 ? 9999 : 999);
            const correct = Math.round(n / 100) * 100;
            const wrongs = [correct - 100, correct + 100, n].filter(w => w >= 0 && w !== correct);
            while (wrongs.length < 3) wrongs.push(correct + (wrongs.length + 2) * 100);
            const answers = this._shuffle([correct, ...wrongs.slice(0, 3)]);
            const tensDigit = Math.floor((n % 100) / 10);
            return {
                question: `Round ${n} to the\nnearest 100:`,
                questionSpeak: `Round ${n} to the nearest hundred.`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'rounding',
                subtype: 'round-100',
                explanation: `${n} rounds to ${correct}! The tens digit ${tensDigit} is ${tensDigit >= 5 ? '5 or more, so round up' : 'less than 5, so round down'}!`,
                explanationSpeak: `${n} rounds to ${correct}!`
            };
        } else if (templateType === 2) {
            // Estimation with rounding
            const a = this._rand(20, 80);
            const b = this._rand(20, 80);
            const aRound = Math.round(a / 10) * 10;
            const bRound = Math.round(b / 10) * 10;
            const isAdd = Math.random() < 0.5;
            const correct = isAdd ? aRound + bRound : Math.max(aRound, bRound) - Math.min(aRound, bRound);
            const big = Math.max(a, b);
            const small = Math.min(a, b);
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(0, correct - 30), correct + 30);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: isAdd ? `Estimate: ${a} + ${b}\n(Round to nearest 10 first)` : `Estimate: ${big} - ${small}\n(Round to nearest 10 first)`,
                questionSpeak: isAdd ? `Estimate ${a} plus ${b} by rounding to the nearest ten first.` : `Estimate ${big} minus ${small} by rounding to the nearest ten first.`,
                answers: answers.map(v => `about ${v}`),
                correctIndex: answers.indexOf(correct),
                topic: 'rounding',
                subtype: 'estimate',
                explanation: isAdd ? `${a} rounds to ${aRound}, ${b} rounds to ${bRound}. ${aRound} + ${bRound} = about ${correct}!` : `${big} rounds to ${Math.round(big / 10) * 10}, ${small} rounds to ${Math.round(small / 10) * 10}. About ${correct}!`,
                explanationSpeak: `The estimate is about ${correct}!`
            };
        } else {
            // "Between which two tens/hundreds?"
            const useHundreds = level >= 9 && Math.random() < 0.5;
            if (useHundreds) {
                const n = this._rand(101, 899);
                const lower = Math.floor(n / 100) * 100;
                const upper = lower + 100;
                const correct = `${lower} and ${upper}`;
                const wrongs = [
                    `${lower - 100} and ${lower}`,
                    `${upper} and ${upper + 100}`,
                    `${lower + 50} and ${upper + 50}`
                ];
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `${n} is between which\ntwo hundreds?`,
                    questionSpeak: `${n} is between which two hundreds?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'rounding',
                    subtype: 'between-hundreds',
                    explanation: `${n} is between ${lower} and ${upper}!`,
                    explanationSpeak: `${n} is between ${lower} and ${upper}!`
                };
            } else {
                const n = this._rand(11, 89);
                const lower = Math.floor(n / 10) * 10;
                const upper = lower + 10;
                const correct = `${lower} and ${upper}`;
                const wrongs = [
                    `${lower - 10} and ${lower}`,
                    `${upper} and ${upper + 10}`,
                    `${lower + 5} and ${upper + 5}`
                ];
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `${n} is between which\ntwo tens?`,
                    questionSpeak: `${n} is between which two tens?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'rounding',
                    subtype: 'between-tens',
                    explanation: `${n} is between ${lower} and ${upper}!`,
                    explanationSpeak: `${n} is between ${lower} and ${upper}!`
                };
            }
        }
    },

    // ---- FUNCTION TABLES / ARITHMETIC PATTERNS (new 3rd grade topic) ----
    _functionTables(level) {
        const templateType = this._rand(0, 3);

        if (templateType === 0) {
            // "What's the rule?" — input/output table
            const operations = [
                { rule: 'Add 3', fn: n => n + 3, ruleSpeak: 'add 3' },
                { rule: 'Add 5', fn: n => n + 5, ruleSpeak: 'add 5' },
                { rule: 'Add 10', fn: n => n + 10, ruleSpeak: 'add 10' },
                { rule: 'Subtract 2', fn: n => n - 2, ruleSpeak: 'subtract 2' },
                { rule: 'Subtract 5', fn: n => n - 5, ruleSpeak: 'subtract 5' },
                { rule: 'Multiply by 2', fn: n => n * 2, ruleSpeak: 'multiply by 2' },
                { rule: 'Multiply by 3', fn: n => n * 3, ruleSpeak: 'multiply by 3' },
                { rule: 'Multiply by 4', fn: n => n * 4, ruleSpeak: 'multiply by 4' }
            ];
            const op = operations[this._rand(0, level >= 9 ? operations.length - 1 : 5)];
            const inputs = [this._rand(1, 5), this._rand(6, 10), this._rand(11, 15)];
            const outputs = inputs.map(op.fn);
            const correct = op.rule;
            const wrongOps = operations.filter(o => o.rule !== correct).map(o => o.rule);
            const wrongs = this._shuffle(wrongOps).slice(0, 3);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `In → Out\n${inputs[0]} → ${outputs[0]}\n${inputs[1]} → ${outputs[1]}\n${inputs[2]} → ${outputs[2]}\nRule = ?`,
                questionSpeak: `${inputs[0]} becomes ${outputs[0]}, ${inputs[1]} becomes ${outputs[1]}, ${inputs[2]} becomes ${outputs[2]}. What's the rule?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'function-tables',
                subtype: 'find-rule',
                explanation: `The rule is "${correct}"! Each input gets ${op.ruleSpeak}!`,
                explanationSpeak: `The rule is ${op.ruleSpeak}!`
            };
        } else if (templateType === 1) {
            // Find the missing output
            const mult = this._rand(2, level >= 9 ? 9 : 6);
            const add = this._rand(0, level >= 9 ? 5 : 3);
            const inputs = [1, 2, 3, 4, 5];
            const outputs = inputs.map(n => n * mult + add);
            const missingIdx = this._rand(2, 4);
            const correct = outputs[missingIdx];
            const wrongs = this._makeWrongAnswers(correct, 3, Math.max(1, correct - 10), correct + 10);
            const answers = this._shuffle([correct, ...wrongs]);
            const table = inputs.map((inp, i) => `${inp} → ${i === missingIdx ? '?' : outputs[i]}`).join('\n');
            return {
                question: `In → Out\n${table}\nWhat is ?`,
                questionSpeak: `Find the missing number in the pattern. ${inputs.filter((_, i) => i !== missingIdx).map((inp, i) => `${inp} goes to ${outputs[inputs.indexOf(inp)]}`).join(', ')}. What does ${inputs[missingIdx]} go to?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'function-tables',
                subtype: 'missing-output',
                explanation: `The pattern is x${mult}${add > 0 ? ` + ${add}` : ''}. ${inputs[missingIdx]} x ${mult}${add > 0 ? ` + ${add}` : ''} = ${correct}!`,
                explanationSpeak: `The answer is ${correct}!`
            };
        } else if (templateType === 2) {
            // Arithmetic pattern — what comes next?
            const step = this._rand(3, level >= 9 ? 12 : 8);
            const start = this._rand(2, 10);
            const seq = [start, start + step, start + step * 2, start + step * 3];
            const correct = start + step * 4;
            const wrongs = this._makeWrongAnswers(correct, 3, correct - step * 2, correct + step * 2);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `What comes next?\n${seq.join(', ')}, ___`,
                questionSpeak: `What comes next in this pattern? ${seq.join(', ')}`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'function-tables',
                subtype: 'pattern-next',
                explanation: `Add ${step} each time: ${seq.join(', ')}, ${correct}!`,
                explanationSpeak: `Add ${step} each time! ${correct} comes next!`
            };
        } else {
            // Find the missing input
            const mult = this._rand(2, 7);
            const inputs = [2, 4, 6, 8, 10];
            const outputs = inputs.map(n => n * mult);
            const missingIdx = this._rand(1, 3);
            const correct = inputs[missingIdx];
            const wrongs = this._makeWrongAnswers(correct, 3, 1, 12);
            const answers = this._shuffle([correct, ...wrongs]);
            const table = inputs.map((inp, i) => `${i === missingIdx ? '?' : inp} → ${outputs[i]}`).join('\n');
            return {
                question: `In → Out\n${table}\nWhat is the missing input?`,
                questionSpeak: `Find the missing input number in the pattern.`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(correct),
                topic: 'function-tables',
                subtype: 'missing-input',
                explanation: `The rule is x${mult}. ? x ${mult} = ${outputs[missingIdx]}, so ? = ${correct}!`,
                explanationSpeak: `The missing input is ${correct}!`
            };
        }
    }
};
