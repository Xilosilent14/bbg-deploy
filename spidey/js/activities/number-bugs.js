/**
 * Number Bugs — Count the bugs!
 * V3: Grade-based content (Pre-K through 2nd grade)
 *   Pre-K: Counting to 10, how many more
 *   K: Counting to 30, simple addition to 5, subtraction from 5
 *   1st: Addition/subtraction to 20, place value (tens/ones), skip counting by 2s/5s/10s
 *   2nd: 2-digit addition/subtraction, multiplication intro (groups of), telling time
 */
const NumberBugs = (() => {
    const BUG_EMOJIS = ['🐛', '🐞', '🦗', '🐜', '🐝', '🦋'];
    let container = null, onComplete = null;
    let currentRound = 0, totalRounds = 8, correctAnswer = 0;
    let roundCorrect = 0, roundTotal = 0;
    let isHowManyMore = false, shownCount = 0, targetTotal = 0;
    let questionType = 'count';
    let questionData = null;

    function start(containerEl, callback) {
        container = containerEl;
        onComplete = callback;
        currentRound = 0;
        roundCorrect = 0;
        roundTotal = 0;
        _nextQuestion();
    }

    function _nextQuestion() {
        if (currentRound >= totalRounds) { _completeActivity(); return; }
        const grade = Progress.getGradeLevel();

        if (grade === 0) {
            _preKQuestion();
        } else if (grade === 1) {
            // K: counting to 30, addition to 5, subtraction from 5
            const types = ['count', 'add', 'subtract', 'count', 'add', 'count', 'subtract', 'count'];
            questionType = types[currentRound % types.length];
            if (questionType === 'count') _kCountQuestion();
            else if (questionType === 'add') _kAddQuestion();
            else _kSubtractQuestion();
        } else if (grade === 2) {
            // 1st: addition/subtraction to 20, place value, skip counting
            const types = ['add20', 'subtract20', 'placevalue', 'skipcounting', 'add20', 'subtract20', 'placevalue', 'skipcounting'];
            questionType = types[currentRound % types.length];
            if (questionType === 'add20') _grade1AddQuestion();
            else if (questionType === 'subtract20') _grade1SubtractQuestion();
            else if (questionType === 'placevalue') _placeValueQuestion();
            else _skipCountingQuestion();
        } else {
            // 2nd: 2-digit add/sub, multiplication, telling time
            const types = ['add2digit', 'sub2digit', 'multiply', 'time', 'add2digit', 'sub2digit', 'multiply', 'time'];
            questionType = types[currentRound % types.length];
            if (questionType === 'add2digit') _grade2AddQuestion();
            else if (questionType === 'sub2digit') _grade2SubQuestion();
            else if (questionType === 'multiply') _multiplyQuestion();
            else _timeQuestion();
        }
    }

    // ---------- Pre-K: Count & How Many More ----------
    function _preKQuestion() {
        const stats = Progress.getStats('number-bugs');
        const maxNum = stats.maxNumber || 5;
        isHowManyMore = maxNum >= 5 && (currentRound === 2 || currentRound === 5);

        if (isHowManyMore) {
            targetTotal = 3 + Math.floor(Math.random() * Math.min(maxNum - 2, 6));
            shownCount = 1 + Math.floor(Math.random() * (targetTotal - 1));
            correctAnswer = targetTotal - shownCount;
            _renderHowManyMore();
        } else {
            correctAnswer = 1 + Math.floor(Math.random() * maxNum);
            _renderCounting(maxNum);
        }
    }

    function _renderCounting(maxNum) {
        const bugEmoji = BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)];
        const bugPositions = _placeBugs(correctAnswer);
        const numChoices = maxNum > 7 ? 4 : 3;
        const sorted = _makeChoices(correctAnswer, numChoices, 1, maxNum + 2);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="number-bug-field">
                ${bugPositions.map(p => `<div class="number-bug" style="left:${p.x}%;top:${p.y}%"><span class="number-bug-emoji">${bugEmoji}</span></div>`).join('')}
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak('How many bugs do you see?'), 400);
    }

    function _renderHowManyMore() {
        const bugEmoji = BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)];
        const bugPositions = _placeBugs(shownCount);
        const numChoices = correctAnswer > 5 ? 4 : 3;
        const sorted = _makeChoices(correctAnswer, numChoices, 1, 10);

        container.innerHTML = `
            <div class="activity-prompt">
                <span class="round-counter">${currentRound + 1} / ${totalRounds}</span>
                <div class="how-many-more-label">How many MORE to make ${targetTotal}?</div>
            </div>
            <div class="number-bug-field">
                ${bugPositions.map(p => `<div class="number-bug" style="left:${p.x}%;top:${p.y}%"><span class="number-bug-emoji">${bugEmoji}</span></div>`).join('')}
                <div class="more-bugs-target"><span class="more-target-text">${shownCount} + ? = ${targetTotal}</span></div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak(`You have ${shownCount} bugs. How many more to make ${targetTotal}?`), 400);
    }

    // ---------- K: Counting to 30 ----------
    function _kCountQuestion() {
        const maxNum = Math.min(30, (Progress.getStats('number-bugs').maxNumber || 5) + 10);
        correctAnswer = 1 + Math.floor(Math.random() * maxNum);
        const bugEmoji = BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)];
        const count = Math.min(correctAnswer, 15); // Only show up to 15 bugs visually
        const bugPositions = _placeBugs(count);

        if (correctAnswer <= 15) {
            // Visual counting
            const sorted = _makeChoices(correctAnswer, 4, 1, maxNum);
            container.innerHTML = `
                <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
                <div class="number-bug-field">
                    ${bugPositions.map(p => `<div class="number-bug" style="left:${p.x}%;top:${p.y}%"><span class="number-bug-emoji">${bugEmoji}</span></div>`).join('')}
                </div>
                <div class="number-choices">
                    ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
                </div>
            `;
            container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
            setTimeout(() => Voice.speak('How many bugs?'), 400);
        } else {
            // Number after: "What number comes after X?"
            const num = 10 + Math.floor(Math.random() * 20); // 10-29
            correctAnswer = num + 1;
            const sorted = _makeChoices(correctAnswer, 3, num - 1, num + 3);
            container.innerHTML = `
                <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
                <div class="math-display">
                    <div class="math-question">What number comes after <strong>${num}</strong>?</div>
                </div>
                <div class="number-choices">
                    ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
                </div>
            `;
            container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
            setTimeout(() => Voice.speak(`What number comes after ${num}?`), 400);
        }
    }

    // ---------- K: Addition to 5 ----------
    function _kAddQuestion() {
        const a = 1 + Math.floor(Math.random() * 4); // 1-4
        const b = 1 + Math.floor(Math.random() * (5 - a)); // keep sum <= 5
        correctAnswer = a + b;

        const bugEmoji = BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)];
        const sorted = _makeChoices(correctAnswer, 3, 1, 6);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="math-display">
                <div class="math-bugs-row">
                    <div class="math-bug-group">${bugEmoji.repeat(a)}</div>
                    <span class="math-operator">+</span>
                    <div class="math-bug-group">${bugEmoji.repeat(b)}</div>
                    <span class="math-operator">=</span>
                    <span class="math-mystery">?</span>
                </div>
                <div class="math-equation">${a} + ${b} = ?</div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak(`What is ${a} plus ${b}?`), 400);
    }

    // ---------- K: Subtraction from 5 ----------
    function _kSubtractQuestion() {
        const total = 2 + Math.floor(Math.random() * 4); // 2-5
        const sub = 1 + Math.floor(Math.random() * (total - 1)); // at least 1 left
        correctAnswer = total - sub;

        const bugEmoji = BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)];
        const sorted = _makeChoices(correctAnswer, 3, 0, 5);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="math-display">
                <div class="math-bugs-row">
                    <div class="math-bug-group">${bugEmoji.repeat(total)}</div>
                    <span class="math-operator">-</span>
                    <div class="math-bug-group math-bugs-crossed">${bugEmoji.repeat(sub)}</div>
                    <span class="math-operator">=</span>
                    <span class="math-mystery">?</span>
                </div>
                <div class="math-equation">${total} - ${sub} = ?</div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak(`What is ${total} minus ${sub}?`), 400);
    }

    // ---------- 1st Grade: Addition to 20 ----------
    function _grade1AddQuestion() {
        const a = 3 + Math.floor(Math.random() * 10); // 3-12
        const b = 2 + Math.floor(Math.random() * (20 - a - 1)); // sum <= 20
        correctAnswer = a + b;
        const sorted = _makeChoices(correctAnswer, 4, Math.max(1, correctAnswer - 5), correctAnswer + 5);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="math-display">
                <div class="math-equation-large">${a} + ${b} = ?</div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak(`What is ${a} plus ${b}?`), 400);
    }

    // ---------- 1st Grade: Subtraction from 20 ----------
    function _grade1SubtractQuestion() {
        const total = 8 + Math.floor(Math.random() * 13); // 8-20
        const sub = 2 + Math.floor(Math.random() * (total - 2)); // at least something left
        correctAnswer = total - sub;
        const sorted = _makeChoices(correctAnswer, 4, Math.max(0, correctAnswer - 4), correctAnswer + 4);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="math-display">
                <div class="math-equation-large">${total} - ${sub} = ?</div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak(`What is ${total} minus ${sub}?`), 400);
    }

    // ---------- 1st Grade: Place Value ----------
    function _placeValueQuestion() {
        const tens = 1 + Math.floor(Math.random() * 5); // 1-5
        const ones = Math.floor(Math.random() * 10);     // 0-9
        const number = tens * 10 + ones;

        // Random: ask for tens or ones
        const askTens = Math.random() < 0.5;
        correctAnswer = askTens ? tens : ones;
        const askLabel = askTens ? 'tens' : 'ones';
        const sorted = _makeChoices(correctAnswer, 3, 0, 9);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="math-display">
                <div class="placevalue-number">${number}</div>
                <div class="placevalue-blocks">
                    <div class="pv-tens">${'🟦'.repeat(tens)}</div>
                    <div class="pv-ones">${'🟨'.repeat(ones)}</div>
                </div>
                <div class="math-question">How many <strong>${askLabel}</strong> in ${number}?</div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak(`How many ${askLabel} are in ${number}?`), 400);
    }

    // ---------- 1st Grade: Skip Counting ----------
    function _skipCountingQuestion() {
        const skipBy = [2, 5, 10][Math.floor(Math.random() * 3)];
        const start = skipBy * (1 + Math.floor(Math.random() * 3)); // Start a few steps in
        const sequence = [start, start + skipBy, start + skipBy * 2];
        correctAnswer = start + skipBy * 3;
        const sorted = _makeChoices(correctAnswer, 3, correctAnswer - skipBy * 2, correctAnswer + skipBy * 2);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="math-display">
                <div class="skip-label">Skip count by ${skipBy}s!</div>
                <div class="skip-sequence">${sequence.join(', ')}, <span class="skip-blank">?</span></div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak(`Skip count by ${skipBy}s. ${sequence.join(', ')}... what comes next?`), 400);
    }

    // ---------- 2nd Grade: 2-Digit Addition ----------
    function _grade2AddQuestion() {
        const a = 10 + Math.floor(Math.random() * 50); // 10-59
        const b = 10 + Math.floor(Math.random() * (99 - a)); // sum < 100
        correctAnswer = a + b;
        const sorted = _makeChoices(correctAnswer, 4, Math.max(20, correctAnswer - 10), correctAnswer + 10);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="math-display">
                <div class="math-equation-large">${a} + ${b} = ?</div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak(`What is ${a} plus ${b}?`), 400);
    }

    // ---------- 2nd Grade: 2-Digit Subtraction ----------
    function _grade2SubQuestion() {
        const a = 30 + Math.floor(Math.random() * 60); // 30-89
        const b = 10 + Math.floor(Math.random() * (a - 10)); // result > 0
        correctAnswer = a - b;
        const sorted = _makeChoices(correctAnswer, 4, Math.max(0, correctAnswer - 10), correctAnswer + 10);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="math-display">
                <div class="math-equation-large">${a} - ${b} = ?</div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak(`What is ${a} minus ${b}?`), 400);
    }

    // ---------- 2nd Grade: Multiplication (Groups Of) ----------
    function _multiplyQuestion() {
        const groups = 2 + Math.floor(Math.random() * 4); // 2-5 groups
        const perGroup = 2 + Math.floor(Math.random() * 5); // 2-6 per group
        correctAnswer = groups * perGroup;
        const bugEmoji = BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)];

        const groupsHtml = [];
        for (let i = 0; i < groups; i++) {
            groupsHtml.push(`<div class="multiply-group">${bugEmoji.repeat(perGroup)}</div>`);
        }
        const sorted = _makeChoices(correctAnswer, 4, Math.max(1, correctAnswer - 6), correctAnswer + 6);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="math-display">
                <div class="multiply-visual">${groupsHtml.join('')}</div>
                <div class="math-question">${groups} groups of ${perGroup} = ?</div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak(`${groups} groups of ${perGroup}. How many in all?`), 400);
    }

    // ---------- 2nd Grade: Telling Time ----------
    function _timeQuestion() {
        const hour = 1 + Math.floor(Math.random() * 12); // 1-12
        const minuteOptions = [0, 15, 30, 45];
        const minute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
        const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;

        // Draw a simple clock face
        const hourAngle = ((hour % 12) + minute / 60) * 30 - 90;
        const minAngle = minute * 6 - 90;
        const hourX = 50 + 25 * Math.cos(hourAngle * Math.PI / 180);
        const hourY = 50 + 25 * Math.sin(hourAngle * Math.PI / 180);
        const minX = 50 + 35 * Math.cos(minAngle * Math.PI / 180);
        const minY = 50 + 35 * Math.sin(minAngle * Math.PI / 180);

        // Build wrong choices
        const wrongTimes = [];
        while (wrongTimes.length < 2) {
            const wh = 1 + Math.floor(Math.random() * 12);
            const wm = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
            const ws = `${wh}:${wm.toString().padStart(2, '0')}`;
            if (ws !== timeStr && !wrongTimes.includes(ws)) wrongTimes.push(ws);
        }
        const choices = [timeStr, ...wrongTimes].sort(() => Math.random() - 0.5);
        correctAnswer = timeStr;

        // Clock numbers
        const numbers = [];
        for (let i = 1; i <= 12; i++) {
            const a = i * 30 - 90;
            const nx = 50 + 40 * Math.cos(a * Math.PI / 180);
            const ny = 50 + 40 * Math.sin(a * Math.PI / 180);
            numbers.push(`<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="8" font-weight="bold">${i}</text>`);
        }

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="math-display">
                <div class="clock-display">
                    <svg viewBox="0 0 100 100" class="clock-svg">
                        <circle cx="50" cy="50" r="48" fill="rgba(0,0,0,0.3)" stroke="white" stroke-width="2"/>
                        ${numbers.join('')}
                        <line x1="50" y1="50" x2="${hourX}" y2="${hourY}" stroke="white" stroke-width="3" stroke-linecap="round"/>
                        <line x1="50" y1="50" x2="${minX}" y2="${minY}" stroke="#e23636" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="50" cy="50" r="3" fill="white"/>
                    </svg>
                </div>
                <div class="math-question">What time does the clock show?</div>
            </div>
            <div class="time-choices">
                ${choices.map(t => `<button class="number-choice-btn time-btn" data-time="${t}"><span class="number-text">${t}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onTimeChoice(btn)));

        const spoken = minute === 0 ? `${hour} o'clock` : timeStr;
        setTimeout(() => Voice.speak(`What time does the clock show?`), 400);
    }

    function _onTimeChoice(btn) {
        const chosen = btn.dataset.time;
        roundTotal++;
        if (chosen === correctAnswer) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('number-bugs', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            const parts = correctAnswer.split(':');
            const spokenTime = parts[1] === '00' ? `${parts[0]} o'clock` : correctAnswer;
            Voice.speak(`Yes! It's ${spokenTime}!`);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRound++;
            setTimeout(_nextQuestion, 1500);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('number-bugs', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            const correctBtn = container.querySelector(`[data-time="${correctAnswer}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            const parts = correctAnswer.split(':');
            const spokenTime = parts[1] === '00' ? `${parts[0]} o'clock` : correctAnswer;
            Voice.speak(`Not quite. The clock shows ${spokenTime}.`);
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 3000);
        }
    }

    // ---------- Generic number choice handler ----------
    function _onChoice(btn) {
        const chosen = parseInt(btn.dataset.number);
        roundTotal++;
        if (chosen === correctAnswer) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('number-bugs', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            if (isHowManyMore) {
                Voice.speak(`Yes! ${shownCount} plus ${correctAnswer} makes ${targetTotal}!`);
            } else {
                Voice.speak(`Yes! ${correctAnswer}!`);
            }
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRound++;
            setTimeout(_nextQuestion, 1500);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('number-bugs', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            const correctBtn = container.querySelector(`[data-number="${correctAnswer}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            if (isHowManyMore) {
                Voice.speak(`Not quite. ${shownCount} needs ${correctAnswer} more to make ${targetTotal}.`);
            } else {
                Voice.speak(`The answer is ${correctAnswer}!`);
            }
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 3000);
        }
    }

    // ---------- Helpers ----------
    function _placeBugs(count) {
        const positions = [];
        for (let i = 0; i < count; i++) {
            let x, y, overlap, attempts = 0;
            do {
                x = 15 + Math.random() * 70;
                y = 10 + Math.random() * 50;
                overlap = positions.some(p => Math.abs(p.x - x) < 12 && Math.abs(p.y - y) < 15);
                attempts++;
            } while (overlap && attempts < 20);
            positions.push({ x, y });
        }
        return positions;
    }

    function _makeChoices(correct, count, min, max) {
        const choices = new Set([correct]);
        let attempts = 0;
        while (choices.size < count && attempts < 50) {
            let n = correct + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3));
            n = Math.max(min, Math.min(max, n));
            if (n !== correct) choices.add(n);
            attempts++;
        }
        // Fallback: fill with sequential numbers if we can't get enough
        while (choices.size < count) {
            choices.add(correct + choices.size);
        }
        return [...choices].sort((a, b) => a - b);
    }

    function _completeActivity() {
        Audio.playCelebration(); Character.celebrate(); Celebration.confetti();
        Voice.speak('You counted them all! Amazing!');
        _maybeExpand();
        setTimeout(() => { if (onComplete) onComplete(roundCorrect, roundTotal); }, 3000);
    }

    function _maybeExpand() {
        const stats = Progress.getStats('number-bugs');
        if (stats.played >= 2 && stats.maxNumber < 15) {
            const bump = stats.maxNumber < 7 ? 1 : 2;
            Progress.expandContent('number-bugs', Math.min(15, stats.maxNumber + bump));
        }
    }

    function _awardSticker() {
        const sticker = StickerBook.getNextUnearned();
        if (!sticker) return;
        Progress.awardSticker(sticker.id);
        Main.showStickerEarned(sticker);
    }

    function stop() { currentRound = totalRounds; }
    return { start, stop };
})();
