/**
 * Sort Sweep — Sort items into the correct web!
 * V3: Grade-based content (Pre-K through 2nd grade)
 *   Pre-K: Colors, shapes, size, letters vs numbers
 *   K: 2-attribute sorting, AB/ABB patterns, more/less/equal
 *   1st: Number patterns (+2, +5, +10), data sorting (tally charts), measurement comparison
 *   2nd: Multiplication patterns, bar graphs, input-output tables
 */
const SortSweep = (() => {
    // Pre-K sort modes (original)
    const PREK_MODES = [
        {
            name: 'colors',
            generate() {
                const colors = [
                    { name: 'red', hex: '#e23636', emoji: '🔴' },
                    { name: 'blue', hex: '#2196F3', emoji: '🔵' },
                    { name: 'yellow', hex: '#FFD600', emoji: '🟡' },
                    { name: 'green', hex: '#4CAF50', emoji: '🟢' },
                    { name: 'orange', hex: '#FF9800', emoji: '🟠' },
                    { name: 'purple', hex: '#9C27B0', emoji: '🟣' }
                ];
                const pair = colors.sort(() => Math.random() - 0.5).slice(0, 2);
                const items = [];
                for (let i = 0; i < 8; i++) {
                    const cat = i < 4 ? 0 : 1;
                    items.push({ display: `<div class="sort-bug" style="background:${pair[cat].hex}">🐛</div>`, correct: cat === 0 ? 'left' : 'right', label: pair[cat].name });
                }
                return { left: { label: pair[0].name, color: pair[0].hex, display: pair[0].emoji }, right: { label: pair[1].name, color: pair[1].hex, display: pair[1].emoji }, items: items.sort(() => Math.random() - 0.5) };
            }
        },
        {
            name: 'shapes',
            generate() {
                const shapes = [{ name: 'circle', emoji: '⚪' }, { name: 'square', emoji: '⬜' }, { name: 'triangle', emoji: '🔺' }, { name: 'star', emoji: '⭐' }];
                const pair = shapes.sort(() => Math.random() - 0.5).slice(0, 2);
                const items = [];
                for (let i = 0; i < 8; i++) {
                    const cat = i < 4 ? 0 : 1;
                    items.push({ display: pair[cat].emoji, correct: cat === 0 ? 'left' : 'right', label: pair[cat].name });
                }
                return { left: { label: pair[0].name, color: '#e23636', display: pair[0].emoji }, right: { label: pair[1].name, color: '#2196F3', display: pair[1].emoji }, items: items.sort(() => Math.random() - 0.5) };
            }
        },
        {
            name: 'size',
            generate() {
                const emojis = ['🐛', '🦋', '🐞', '🐝', '🕷️'];
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                const items = [];
                for (let i = 0; i < 8; i++) {
                    const isBig = i < 4;
                    items.push({ display: emoji, correct: isBig ? 'left' : 'right', size: isBig ? 'big' : 'small' });
                }
                return { left: { label: 'big', color: '#4CAF50', display: '🔍' }, right: { label: 'small', color: '#FF9800', display: '🔎' }, items: items.sort(() => Math.random() - 0.5) };
            }
        },
        {
            name: 'letters-numbers',
            generate() {
                const letters = 'ABCDEFGH'.split('');
                const numbers = '12345678'.split('');
                const items = [];
                const pickedLetters = letters.sort(() => Math.random() - 0.5).slice(0, 4);
                const pickedNumbers = numbers.sort(() => Math.random() - 0.5).slice(0, 4);
                pickedLetters.forEach(l => items.push({ display: l, correct: 'left', label: 'letter' }));
                pickedNumbers.forEach(n => items.push({ display: n, correct: 'right', label: 'number' }));
                return { left: { label: 'letters', color: '#2196F3', display: '🔤' }, right: { label: 'numbers', color: '#FF9800', display: '🔢' }, items: items.sort(() => Math.random() - 0.5) };
            }
        }
    ];

    let container = null, onComplete = null;
    let currentItem = 0, roundData = null;
    let roundCorrect = 0, roundTotal = 0;
    let currentRound = 0, totalRounds = 5;
    let questionType = 'sort';
    let currentAnswer = null;

    function start(containerEl, callback) {
        container = containerEl;
        onComplete = callback;
        currentRound = 0;
        roundCorrect = 0;
        roundTotal = 0;
        _startNewRound();
    }

    function _startNewRound() {
        if (currentRound >= totalRounds) { _completeActivity(); return; }
        const grade = Progress.getGradeLevel();

        if (grade === 0) {
            questionType = 'sort';
            _startPreKRound();
        } else if (grade === 1) {
            // K: sorting, patterns, more/less
            const types = ['sort', 'pattern', 'moreless', 'sort', 'pattern'];
            questionType = types[currentRound % types.length];
            if (questionType === 'sort') _startKSortRound();
            else if (questionType === 'pattern') _patternQuestion();
            else _moreLessQuestion();
        } else if (grade === 2) {
            // 1st: number patterns, tally, measurement
            const types = ['numpattern', 'tally', 'measure', 'numpattern', 'tally'];
            questionType = types[currentRound % types.length];
            if (questionType === 'numpattern') _numberPatternQuestion();
            else if (questionType === 'tally') _tallyQuestion();
            else _measureQuestion();
        } else {
            // 2nd: multiplication patterns, bar graphs, input-output
            const types = ['multpattern', 'bargraph', 'inputoutput', 'multpattern', 'bargraph'];
            questionType = types[currentRound % types.length];
            if (questionType === 'multpattern') _multPatternQuestion();
            else if (questionType === 'bargraph') _barGraphQuestion();
            else _inputOutputQuestion();
        }
    }

    // ---------- Pre-K: Classic sorting ----------
    function _startPreKRound() {
        currentItem = 0;
        roundData = PREK_MODES[Math.floor(Math.random() * PREK_MODES.length)].generate();
        _renderSortItem();
        const modeLabel = roundData.left.label + ' vs ' + roundData.right.label;
        setTimeout(() => Voice.speak(`Sort them! ${modeLabel}!`), 300);
    }

    // ---------- K: 2-attribute sorting ----------
    function _startKSortRound() {
        currentItem = 0;
        // Sort by 2 attributes: e.g., big red vs small blue
        const colors = [
            { name: 'red', hex: '#e23636' },
            { name: 'blue', hex: '#2196F3' },
            { name: 'green', hex: '#4CAF50' }
        ];
        const sizes = ['big', 'small'];
        const c1 = colors[Math.floor(Math.random() * colors.length)];
        let c2 = colors[Math.floor(Math.random() * colors.length)];
        while (c2.name === c1.name) c2 = colors[Math.floor(Math.random() * colors.length)];

        const items = [];
        for (let i = 0; i < 8; i++) {
            const isLeft = i < 4;
            const color = isLeft ? c1 : c2;
            const size = isLeft ? 'big' : 'small';
            items.push({
                display: `<div class="sort-bug sort-item-${size}" style="background:${color.hex}">🐛</div>`,
                correct: isLeft ? 'left' : 'right',
                label: `${size} ${color.name}`
            });
        }
        roundData = {
            left: { label: `big ${c1.name}`, color: c1.hex, display: '🐛' },
            right: { label: `small ${c2.name}`, color: c2.hex, display: '🐛' },
            items: items.sort(() => Math.random() - 0.5)
        };
        _renderSortItem();
        setTimeout(() => Voice.speak(`Sort! Big ${c1.name} bugs go left, small ${c2.name} bugs go right!`), 300);
    }

    // ---------- K: AB/ABB Patterns ----------
    function _patternQuestion() {
        const patterns = [
            { seq: ['🔴', '🔵', '🔴', '🔵', '🔴'], answer: '🔵', wrong: ['🔴', '🟢'] },
            { seq: ['🟡', '🟡', '🟢', '🟡', '🟡'], answer: '🟢', wrong: ['🟡', '🔴'] },
            { seq: ['⭐', '🔵', '🔵', '⭐', '🔵'], answer: '🔵', wrong: ['⭐', '🟡'] },
            { seq: ['🔺', '⬜', '🔺', '⬜', '🔺'], answer: '⬜', wrong: ['🔺', '⭐'] },
            { seq: ['🐛', '🐛', '🦋', '🐛', '🐛'], answer: '🦋', wrong: ['🐛', '🐞'] },
            { seq: ['🔴', '🔴', '🔵', '🔴', '🔴'], answer: '🔵', wrong: ['🔴', '🟡'] }
        ];
        const pat = patterns[Math.floor(Math.random() * patterns.length)];
        currentAnswer = pat.answer;

        const choices = [pat.answer, ...pat.wrong].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">Round ${currentRound + 1}/${totalRounds}</span></div>
            <div class="pattern-display">
                <div class="pattern-label">What comes next?</div>
                <div class="pattern-sequence">${pat.seq.join(' ')} <span class="pattern-blank">?</span></div>
            </div>
            <div class="pattern-choices">
                ${choices.map(c => `<button class="pattern-choice-btn" data-answer="${c}"><span class="pattern-emoji">${c}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.pattern-choice-btn').forEach(btn => btn.addEventListener('click', () => _onPatternChoice(btn)));
        setTimeout(() => Voice.speak('What comes next in the pattern?'), 400);
    }

    function _onPatternChoice(btn) {
        const chosen = btn.dataset.answer;
        roundTotal++;
        if (chosen === currentAnswer) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('sort-sweep', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            Voice.speak('You got the pattern!');
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRound++;
            setTimeout(_startNewRound, 1500);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('sort-sweep', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            const correctBtn = container.querySelector(`[data-answer="${currentAnswer}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            Voice.speak(`Look at the pattern again. The answer is ${currentAnswer === '🔴' ? 'red' : currentAnswer === '🔵' ? 'blue' : 'this one'}!`);
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 2500);
        }
    }

    // ---------- K: More/Less/Equal ----------
    function _moreLessQuestion() {
        const a = 1 + Math.floor(Math.random() * 8);
        let b = 1 + Math.floor(Math.random() * 8);
        // Force variety
        const rand = Math.random();
        if (rand < 0.33) b = a; // equal
        else if (rand < 0.66) b = a + 1 + Math.floor(Math.random() * 3); // b > a

        currentAnswer = a > b ? 'more' : (a < b ? 'less' : 'equal');
        const bugEmoji = '🐛';

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">Round ${currentRound + 1}/${totalRounds}</span></div>
            <div class="moreless-display">
                <div class="moreless-group">
                    <div class="moreless-bugs">${bugEmoji.repeat(a)}</div>
                    <div class="moreless-count">${a}</div>
                </div>
                <div class="moreless-vs">vs</div>
                <div class="moreless-group">
                    <div class="moreless-bugs">${bugEmoji.repeat(b)}</div>
                    <div class="moreless-count">${b}</div>
                </div>
                <div class="moreless-ask">The left group has...</div>
            </div>
            <div class="moreless-choices">
                <button class="warmcool-btn" data-answer="more" style="background:#4CAF50">More</button>
                <button class="warmcool-btn" data-answer="equal" style="background:#2196F3">Equal</button>
                <button class="warmcool-btn" data-answer="less" style="background:#FF9800">Less</button>
            </div>
        `;
        container.querySelectorAll('.warmcool-btn').forEach(btn => btn.addEventListener('click', () => _onPatternChoice(btn)));
        setTimeout(() => Voice.speak(`${a} bugs versus ${b} bugs. Does the left group have more, less, or equal?`), 400);
    }

    // ---------- 1st Grade: Number Patterns ----------
    function _numberPatternQuestion() {
        const skipBy = [2, 5, 10][Math.floor(Math.random() * 3)];
        const start = skipBy * Math.floor(Math.random() * 3);
        const seq = [start, start + skipBy, start + skipBy * 2, start + skipBy * 3];
        const answer = start + skipBy * 4;
        currentAnswer = String(answer);

        const choices = new Set([answer]);
        while (choices.size < 3) {
            choices.add(Math.max(0, answer + (Math.random() > 0.5 ? 1 : -1) * skipBy * (1 + Math.floor(Math.random() * 2))));
        }
        const sorted = [...choices].sort((a, b) => a - b);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">Round ${currentRound + 1}/${totalRounds}</span></div>
            <div class="pattern-display">
                <div class="pattern-label">Number Pattern (+${skipBy})</div>
                <div class="pattern-sequence num-pattern">${seq.join(', ')}, <span class="pattern-blank">?</span></div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-answer="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onNumberAnswer(btn)));
        setTimeout(() => Voice.speak(`What number comes next? ${seq.join(', ')}...`), 400);
    }

    // ---------- 1st Grade: Tally Chart ----------
    function _tallyQuestion() {
        const items = ['🍎', '🍌', '🍊'];
        const counts = items.map(() => 1 + Math.floor(Math.random() * 7));
        // Ask: which has the most/least?
        const askMost = Math.random() < 0.5;
        const target = askMost
            ? counts.indexOf(Math.max(...counts))
            : counts.indexOf(Math.min(...counts));
        currentAnswer = items[target];

        const tallyStr = (n) => {
            const groups = Math.floor(n / 5);
            const rem = n % 5;
            return '卌'.repeat(groups) + '|'.repeat(rem);
        };

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">Round ${currentRound + 1}/${totalRounds}</span></div>
            <div class="tally-display">
                <div class="tally-title">Tally Chart</div>
                <div class="tally-chart">
                    ${items.map((item, i) => `
                        <div class="tally-row">
                            <span class="tally-item">${item}</span>
                            <span class="tally-marks">${tallyStr(counts[i])}</span>
                            <span class="tally-num">(${counts[i]})</span>
                        </div>
                    `).join('')}
                </div>
                <div class="tally-ask">Which has the <strong>${askMost ? 'most' : 'fewest'}</strong>?</div>
            </div>
            <div class="pattern-choices">
                ${items.map(item => `<button class="pattern-choice-btn" data-answer="${item}"><span class="pattern-emoji">${item}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.pattern-choice-btn').forEach(btn => btn.addEventListener('click', () => _onPatternChoice(btn)));
        setTimeout(() => Voice.speak(`Look at the tally chart. Which fruit has the ${askMost ? 'most' : 'fewest'}?`), 400);
    }

    // ---------- 1st Grade: Measurement Comparison ----------
    function _measureQuestion() {
        const objects = [
            { name: 'pencil', emoji: '✏️', length: 7 },
            { name: 'crayon', emoji: '🖍️', length: 4 },
            { name: 'ruler', emoji: '📏', length: 12 },
            { name: 'eraser', emoji: '🧽', length: 2 },
            { name: 'book', emoji: '📕', length: 9 },
            { name: 'marker', emoji: '🖊️', length: 5 }
        ];
        const pair = objects.sort(() => Math.random() - 0.5).slice(0, 2);
        const askLonger = Math.random() < 0.5;
        currentAnswer = askLonger
            ? (pair[0].length > pair[1].length ? pair[0].emoji : pair[1].emoji)
            : (pair[0].length < pair[1].length ? pair[0].emoji : pair[1].emoji);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">Round ${currentRound + 1}/${totalRounds}</span></div>
            <div class="measure-display">
                ${pair.map(obj => `
                    <div class="measure-item">
                        <div class="measure-emoji">${obj.emoji}</div>
                        <div class="measure-bar" style="width:${obj.length * 20}px"></div>
                        <div class="measure-label">${obj.name} (${obj.length} units)</div>
                    </div>
                `).join('')}
                <div class="measure-ask">Which is <strong>${askLonger ? 'longer' : 'shorter'}</strong>?</div>
            </div>
            <div class="pattern-choices">
                ${pair.map(obj => `<button class="pattern-choice-btn" data-answer="${obj.emoji}"><span class="pattern-emoji">${obj.emoji}</span> ${obj.name}</button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.pattern-choice-btn').forEach(btn => btn.addEventListener('click', () => _onPatternChoice(btn)));
        setTimeout(() => Voice.speak(`Which is ${askLonger ? 'longer' : 'shorter'}: the ${pair[0].name} or the ${pair[1].name}?`), 400);
    }

    // ---------- 2nd Grade: Multiplication Patterns ----------
    function _multPatternQuestion() {
        const mult = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        const seq = [mult, mult * 2, mult * 3, mult * 4];
        const answer = mult * 5;
        currentAnswer = String(answer);

        const choices = new Set([answer]);
        while (choices.size < 3) {
            choices.add(Math.max(1, answer + (Math.random() > 0.5 ? 1 : -1) * mult * (1 + Math.floor(Math.random() * 2))));
        }
        const sorted = [...choices].sort((a, b) => a - b);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">Round ${currentRound + 1}/${totalRounds}</span></div>
            <div class="pattern-display">
                <div class="pattern-label">Multiply by ${mult}</div>
                <div class="pattern-sequence num-pattern">${seq.join(', ')}, <span class="pattern-blank">?</span></div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-answer="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onNumberAnswer(btn)));
        setTimeout(() => Voice.speak(`Count by ${mult}s. ${seq.join(', ')}... what comes next?`), 400);
    }

    // ---------- 2nd Grade: Bar Graph ----------
    function _barGraphQuestion() {
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const values = labels.map(() => 1 + Math.floor(Math.random() * 8));
        const maxVal = Math.max(...values);

        // Ask which day had the most/total
        const askType = Math.random() < 0.6 ? 'most' : 'total';
        if (askType === 'most') {
            const maxIdx = values.indexOf(maxVal);
            currentAnswer = labels[maxIdx];
            const choices = labels.sort(() => Math.random() - 0.5).slice(0, 3);
            if (!choices.includes(currentAnswer)) { choices[0] = currentAnswer; choices.sort(() => Math.random() - 0.5); }

            container.innerHTML = `
                <div class="activity-prompt"><span class="round-counter">Round ${currentRound + 1}/${totalRounds}</span></div>
                <div class="bargraph-display">
                    <div class="bargraph-title">Books Read This Week</div>
                    <div class="bargraph-chart">
                        ${labels.map((l, i) => `
                            <div class="bar-col">
                                <div class="bar-fill" style="height:${(values[i] / maxVal) * 100}%">
                                    <span class="bar-value">${values[i]}</span>
                                </div>
                                <div class="bar-label">${l}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="bargraph-ask">Which day had the <strong>most</strong> books?</div>
                </div>
                <div class="pattern-choices">
                    ${choices.map(c => `<button class="pattern-choice-btn" data-answer="${c}"><span>${c}</span></button>`).join('')}
                </div>
            `;
            container.querySelectorAll('.pattern-choice-btn').forEach(btn => btn.addEventListener('click', () => _onPatternChoice(btn)));
            setTimeout(() => Voice.speak('Look at the bar graph. Which day had the most books read?'), 400);
        } else {
            const total = values.reduce((a, b) => a + b, 0);
            currentAnswer = String(total);
            const choices = new Set([total]);
            while (choices.size < 3) {
                choices.add(Math.max(5, total + (Math.random() > 0.5 ? 1 : -1) * (2 + Math.floor(Math.random() * 5))));
            }
            const sorted = [...choices].sort((a, b) => a - b);

            container.innerHTML = `
                <div class="activity-prompt"><span class="round-counter">Round ${currentRound + 1}/${totalRounds}</span></div>
                <div class="bargraph-display">
                    <div class="bargraph-title">Books Read This Week</div>
                    <div class="bargraph-chart">
                        ${labels.map((l, i) => `
                            <div class="bar-col">
                                <div class="bar-fill" style="height:${(values[i] / maxVal) * 100}%">
                                    <span class="bar-value">${values[i]}</span>
                                </div>
                                <div class="bar-label">${l}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="bargraph-ask">How many books <strong>total</strong> this week?</div>
                </div>
                <div class="number-choices">
                    ${sorted.map(n => `<button class="number-choice-btn" data-answer="${n}"><span class="number-text">${n}</span></button>`).join('')}
                </div>
            `;
            container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onNumberAnswer(btn)));
            setTimeout(() => Voice.speak('How many total books were read this week? Add them all up!'), 400);
        }
    }

    // ---------- 2nd Grade: Input-Output Tables ----------
    function _inputOutputQuestion() {
        const rules = [
            { label: '+3', fn: x => x + 3 },
            { label: '+5', fn: x => x + 5 },
            { label: 'x2', fn: x => x * 2 },
            { label: 'x3', fn: x => x * 3 },
            { label: '-2', fn: x => x - 2 }
        ];
        const rule = rules[Math.floor(Math.random() * rules.length)];
        const inputs = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, 4);
        inputs.sort((a, b) => a - b);
        const mysteryIdx = 2 + Math.floor(Math.random() * 2); // Hide one of the later outputs
        const answer = rule.fn(inputs[mysteryIdx]);
        currentAnswer = String(answer);

        const choices = new Set([answer]);
        while (choices.size < 3) {
            choices.add(Math.max(0, answer + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3))));
        }
        const sorted = [...choices].sort((a, b) => a - b);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">Round ${currentRound + 1}/${totalRounds}</span></div>
            <div class="io-display">
                <div class="io-title">Input → Output (Rule: ${rule.label})</div>
                <div class="io-table">
                    <div class="io-header"><span>In</span><span>Out</span></div>
                    ${inputs.map((inp, i) => `
                        <div class="io-row">
                            <span>${inp}</span>
                            <span>${i === mysteryIdx ? '?' : rule.fn(inp)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="io-ask">What is the missing output?</div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-answer="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onNumberAnswer(btn)));
        setTimeout(() => Voice.speak(`The rule is ${rule.label}. What is the missing output for input ${inputs[mysteryIdx]}?`), 400);
    }

    // ---------- Number answer handler ----------
    function _onNumberAnswer(btn) {
        const chosen = btn.dataset.answer;
        roundTotal++;
        if (chosen === currentAnswer) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('sort-sweep', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            Voice.speak(`Yes! ${currentAnswer}!`);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRound++;
            setTimeout(_startNewRound, 1500);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('sort-sweep', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            const correctBtn = container.querySelector(`[data-answer="${currentAnswer}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            Voice.speak(`Not quite. The answer is ${currentAnswer}.`);
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 2500);
        }
    }

    // ---------- Sort item rendering (Pre-K and K sorting rounds) ----------
    function _renderSortItem() {
        if (currentItem >= roundData.items.length) {
            currentRound++;
            if (currentRound >= totalRounds) { _completeActivity(); return; }
            Audio.playCorrect();
            Character.happy();
            Voice.speak('Nice sorting! Next round!');
            setTimeout(_startNewRound, 1500);
            return;
        }
        const item = roundData.items[currentItem];
        const isSize = item.size !== undefined;
        const isLetterNum = item.label === 'letter' || item.label === 'number';

        container.innerHTML = `
            <div class="activity-prompt">
                <span class="round-counter">Round ${currentRound + 1}/${totalRounds} - Item ${currentItem + 1}/${roundData.items.length}</span>
            </div>
            <div class="sort-arena">
                <button class="sort-web sort-web-left" data-side="left">
                    <div class="sort-web-label">${roundData.left.display}</div>
                    <div class="sort-web-name">${roundData.left.label}</div>
                </button>
                <div class="sort-item ${isSize ? 'sort-item-' + item.size : ''} ${isLetterNum ? 'sort-item-letternum' : ''}">
                    ${typeof item.display === 'string' && item.display.startsWith('<') ? item.display : `<span class="sort-item-emoji">${item.display}</span>`}
                </div>
                <button class="sort-web sort-web-right" data-side="right">
                    <div class="sort-web-label">${roundData.right.display}</div>
                    <div class="sort-web-name">${roundData.right.label}</div>
                </button>
            </div>
        `;
        container.querySelectorAll('.sort-web').forEach(btn => btn.addEventListener('click', () => _onSortChoice(btn)));

        setTimeout(() => {
            if (isSize) Voice.speak('Is this one big or small?');
            else if (isLetterNum) Voice.speak(`Is "${item.display}" a letter or a number?`);
            else if (item.label) Voice.speak(`Where does the ${item.label} one go?`);
        }, 500);
    }

    function _onSortChoice(btn) {
        const side = btn.dataset.side;
        const item = roundData.items[currentItem];
        roundTotal++;

        if (side === item.correct) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('sort-sweep', true);
            Character.happy();
            btn.classList.add('sort-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentItem++;
            setTimeout(_renderSortItem, 1000);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('sort-sweep', false);
            Character.encourage();
            btn.classList.add('sort-wrong');
            const correctBtn = container.querySelector(`[data-side="${item.correct}"]`);
            if (correctBtn) correctBtn.classList.add('sort-hint');
            const correctLabel = item.correct === 'left' ? roundData.left.label : roundData.right.label;
            Voice.speak(`Try the ${correctLabel} web!`);
            setTimeout(() => { btn.classList.remove('sort-wrong'); if (correctBtn) correctBtn.classList.remove('sort-hint'); }, 2000);
        }
    }

    function _completeActivity() {
        Audio.playCelebration(); Character.celebrate(); Celebration.confetti();
        Voice.speak('All sorted! You did it!');
        setTimeout(() => { if (onComplete) onComplete(roundCorrect, roundTotal); }, 3000);
    }

    function _awardSticker() {
        const sticker = StickerBook.getNextUnearned();
        if (!sticker) return;
        Progress.awardSticker(sticker.id);
        Main.showStickerEarned(sticker);
    }

    function stop() { currentItem = 999; currentRound = totalRounds; }
    return { start, stop };
})();
