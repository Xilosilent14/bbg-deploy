/**
 * Color Catch — Tap bugs of the target color!
 * Voice: "Can you catch the RED bugs?"
 * Bugs crawl across screen, tap matching ones.
 * V3: Grade-based content (Pre-K through 2nd grade)
 *   Pre-K: Primary colors, basic matching
 *   K: Secondary colors (orange, green, purple), color mixing questions
 *   1st: Shades (light blue, dark green), warm vs cool color sorting
 *   2nd: Color wheel concepts, complementary colors
 */
const ColorCatch = (() => {
    // Pre-K colors (primary + basics)
    const PREK_COLORS = [
        { name: 'red', hex: '#e23636', dark: '#b01c1c' },
        { name: 'blue', hex: '#2196F3', dark: '#1565C0' },
        { name: 'yellow', hex: '#FFD600', dark: '#C7A500' },
        { name: 'green', hex: '#4CAF50', dark: '#2E7D32' },
        { name: 'orange', hex: '#FF9800', dark: '#E65100' },
        { name: 'purple', hex: '#9C27B0', dark: '#6A1B9A' },
        { name: 'pink', hex: '#FF69B4', dark: '#D84D97' },
        { name: 'brown', hex: '#8B4513', dark: '#5C2D0E' }
    ];

    // K adds secondary color mixing knowledge
    const K_MIXING = [
        { mix: 'orange', from: ['red', 'yellow'], hex: '#FF9800' },
        { mix: 'green', from: ['blue', 'yellow'], hex: '#4CAF50' },
        { mix: 'purple', from: ['red', 'blue'], hex: '#9C27B0' }
    ];

    // 1st grade: shades and warm/cool groups
    const GRADE1_SHADES = [
        { name: 'light blue', hex: '#87CEEB', dark: '#5BA3C4', base: 'blue' },
        { name: 'dark blue', hex: '#1a237e', dark: '#0d1257', base: 'blue' },
        { name: 'light green', hex: '#90EE90', dark: '#5CB85C', base: 'green' },
        { name: 'dark green', hex: '#1B5E20', dark: '#0D3B10', base: 'green' },
        { name: 'light red', hex: '#FF6B6B', dark: '#CC4444', base: 'red' },
        { name: 'dark red', hex: '#8B0000', dark: '#5C0000', base: 'red' },
        { name: 'light purple', hex: '#CE93D8', dark: '#AB47BC', base: 'purple' },
        { name: 'light yellow', hex: '#FFF9C4', dark: '#F9E547', base: 'yellow' }
    ];
    const WARM_COLORS = ['red', 'orange', 'yellow', 'light red'];
    const COOL_COLORS = ['blue', 'green', 'purple', 'light blue', 'dark blue', 'light green'];

    // 2nd grade: color wheel / complementary pairs
    const COMPLEMENTARY_PAIRS = [
        { a: { name: 'red', hex: '#e23636' }, b: { name: 'green', hex: '#4CAF50' } },
        { a: { name: 'blue', hex: '#2196F3' }, b: { name: 'orange', hex: '#FF9800' } },
        { a: { name: 'yellow', hex: '#FFD600' }, b: { name: 'purple', hex: '#9C27B0' } }
    ];

    let container = null;
    let targetColor = null;
    let bugs = [];
    let caught = 0;
    let needed = 0;
    let roundCorrect = 0;
    let roundTotal = 0;
    let roundActive = false;
    let onComplete = null;
    let moveInterval = null;
    let baseSpeed = 1.2;
    let gradeMode = 'catch'; // 'catch', 'mix', 'shade', 'warmcool', 'complementary'
    let mixAnswer = null;
    let currentRoundNum = 0;
    let totalRoundsForSession = 1;

    function start(containerEl, callback) {
        container = containerEl;
        onComplete = callback;
        caught = 0;
        roundCorrect = 0;
        roundTotal = 0;
        roundActive = true;
        currentRoundNum = 0;

        const grade = Progress.getGradeLevel();

        if (grade === 0) {
            // Pre-K: classic bug catching
            totalRoundsForSession = 1;
            gradeMode = 'catch';
            _startCatchRound();
        } else if (grade === 1) {
            // Kindergarten: alternate between catching and mixing questions
            totalRoundsForSession = 2;
            gradeMode = Math.random() < 0.5 ? 'catch' : 'mix';
            if (gradeMode === 'catch') _startCatchRound();
            else _startMixRound();
        } else if (grade === 2) {
            // 1st grade: shades + warm/cool
            totalRoundsForSession = 2;
            gradeMode = Math.random() < 0.5 ? 'shade' : 'warmcool';
            if (gradeMode === 'shade') _startShadeRound();
            else _startWarmCoolRound();
        } else {
            // 2nd grade: complementary + color wheel
            totalRoundsForSession = 2;
            gradeMode = Math.random() < 0.5 ? 'complementary' : 'shade';
            if (gradeMode === 'complementary') _startComplementaryRound();
            else _startShadeRound();
        }
    }

    // ---------- Pre-K / K: Classic catch ----------
    function _startCatchRound() {
        const stats = Progress.getStats('color-catch');
        const grade = Progress.getGradeLevel();
        const learned = (stats.colorsLearned && stats.colorsLearned.length > 0) ? stats.colorsLearned : ['red', 'blue'];
        const availableColors = PREK_COLORS.filter(c => learned.includes(c.name));
        const learnedCount = learned.length;

        // Difficulty scales with grade
        needed = grade >= 1
            ? (learnedCount >= 5 ? 6 : 5)
            : (learnedCount >= 5 ? 5 : (learnedCount >= 3 ? 4 : 3));

        const playCount = stats.played || 0;
        baseSpeed = 1.2 + Math.min(playCount * 0.05, 0.6) + (grade * 0.15);
        const bugCount = 8 + Math.min(Math.floor(learnedCount / 2), 4) + grade;

        targetColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        bugs = [];

        for (let i = 0; i < bugCount; i++) {
            let color;
            if (i < needed) {
                color = targetColor;
            } else {
                const others = availableColors.filter(c => c.name !== targetColor.name);
                color = others[Math.floor(Math.random() * others.length)] || targetColor;
            }
            bugs.push({
                id: i, color,
                x: 80 + Math.random() * (window.innerWidth - 200),
                y: 80 + Math.random() * (window.innerHeight - 220),
                caught: false,
                vx: (Math.random() - 0.5) * baseSpeed,
                vy: (Math.random() - 0.5) * baseSpeed,
                wobble: Math.random() * Math.PI * 2
            });
        }
        bugs.sort(() => Math.random() - 0.5);
        _render();
        _startMovement();
        setTimeout(() => Voice.speak(`Can you catch the ${targetColor.name} bugs?`), 300);
    }

    // ---------- K: Color Mixing ----------
    function _startMixRound() {
        roundActive = true;
        const mix = K_MIXING[Math.floor(Math.random() * K_MIXING.length)];
        mixAnswer = mix;

        const allMixes = K_MIXING.map(m => m.mix);
        const choices = [mix.mix];
        while (choices.length < 3) {
            const c = allMixes[Math.floor(Math.random() * allMixes.length)];
            if (!choices.includes(c)) choices.push(c);
        }
        choices.sort(() => Math.random() - 0.5);

        const color1 = PREK_COLORS.find(c => c.name === mix.from[0]);
        const color2 = PREK_COLORS.find(c => c.name === mix.from[1]);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">Color Mixing!</span></div>
            <div class="mix-question">
                <div class="mix-formula">
                    <div class="mix-swatch" style="background:${color1.hex}"></div>
                    <span class="mix-plus">+</span>
                    <div class="mix-swatch" style="background:${color2.hex}"></div>
                    <span class="mix-equals">=</span>
                    <span class="mix-mystery">?</span>
                </div>
                <div class="mix-label">${mix.from[0]} + ${mix.from[1]} = ?</div>
            </div>
            <div class="color-choices">
                ${choices.map(c => {
                    const cd = PREK_COLORS.find(pc => pc.name === c);
                    return `<button class="color-choice-btn" data-color="${c}" style="background:${cd.hex}">
                        <span class="color-choice-label">${c}</span>
                    </button>`;
                }).join('')}
            </div>
        `;
        container.querySelectorAll('.color-choice-btn').forEach(btn =>
            btn.addEventListener('click', () => _onMixChoice(btn)));
        setTimeout(() => Voice.speak(`What color do ${mix.from[0]} and ${mix.from[1]} make?`), 400);
    }

    function _onMixChoice(btn) {
        if (!roundActive) return;
        const chosen = btn.dataset.color;
        roundTotal++;
        if (chosen === mixAnswer.mix) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('color-catch', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            Voice.speak(`Yes! ${mixAnswer.from[0]} and ${mixAnswer.from[1]} make ${mixAnswer.mix}!`);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRoundNum++;
            setTimeout(() => _nextGradeRound(), 2000);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('color-catch', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            Voice.speak(`Not quite. ${mixAnswer.from[0]} and ${mixAnswer.from[1]} make ${mixAnswer.mix}!`);
            const correctBtn = container.querySelector(`[data-color="${mixAnswer.mix}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            setTimeout(() => {
                btn.classList.remove('choice-wrong');
                if (correctBtn) correctBtn.classList.remove('choice-hint');
            }, 2500);
        }
    }

    // ---------- 1st Grade: Shades ----------
    function _startShadeRound() {
        roundActive = true;
        const grade = Progress.getGradeLevel();
        // Pick a base color and ask them to find the light or dark shade
        const bases = ['blue', 'green', 'red', 'purple'];
        const base = bases[Math.floor(Math.random() * bases.length)];
        const shades = GRADE1_SHADES.filter(s => s.base === base);
        const target = shades[Math.floor(Math.random() * shades.length)];

        // Build distractors from other shades
        const distractors = GRADE1_SHADES.filter(s => s.name !== target.name)
            .sort(() => Math.random() - 0.5).slice(0, grade >= 3 ? 3 : 2);
        const choices = [target, ...distractors].sort(() => Math.random() - 0.5);

        targetColor = target;

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">Find the Shade!</span></div>
            <div class="shade-question">
                <div class="shade-label">Find: <strong>${target.name}</strong></div>
            </div>
            <div class="shade-choices">
                ${choices.map(s => `
                    <button class="shade-choice-btn" data-shade="${s.name}"
                        style="background:${s.hex}; color: ${_textColor(s.hex)}">
                        <span class="shade-text">${s.name}</span>
                    </button>
                `).join('')}
            </div>
        `;
        container.querySelectorAll('.shade-choice-btn').forEach(btn =>
            btn.addEventListener('click', () => _onShadeChoice(btn)));
        setTimeout(() => Voice.speak(`Can you find ${target.name}?`), 400);
    }

    function _onShadeChoice(btn) {
        if (!roundActive) return;
        const chosen = btn.dataset.shade;
        roundTotal++;
        if (chosen === targetColor.name) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('color-catch', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            Voice.speak(`Great! That's ${targetColor.name}!`);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRoundNum++;
            setTimeout(() => _nextGradeRound(), 1500);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('color-catch', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            Voice.speak(`That's ${chosen}. Look for ${targetColor.name}!`);
            const correctBtn = container.querySelector(`[data-shade="${targetColor.name}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            setTimeout(() => {
                btn.classList.remove('choice-wrong');
                if (correctBtn) correctBtn.classList.remove('choice-hint');
            }, 2500);
        }
    }

    // ---------- 1st Grade: Warm vs Cool ----------
    function _startWarmCoolRound() {
        roundActive = true;
        // Show a color and ask if it's warm or cool
        const allOptions = [
            ...PREK_COLORS.map(c => ({ name: c.name, hex: c.hex })),
            ...GRADE1_SHADES.map(s => ({ name: s.name, hex: s.hex }))
        ];
        const pick = allOptions[Math.floor(Math.random() * allOptions.length)];
        const isWarm = WARM_COLORS.includes(pick.name);
        targetColor = pick;
        mixAnswer = isWarm ? 'warm' : 'cool';

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">Warm or Cool?</span></div>
            <div class="warmcool-question">
                <div class="warmcool-swatch" style="background:${pick.hex}"></div>
                <div class="warmcool-name">${pick.name}</div>
            </div>
            <div class="warmcool-choices">
                <button class="warmcool-btn warm-btn" data-answer="warm">
                    <span class="wc-icon">🔥</span> Warm
                </button>
                <button class="warmcool-btn cool-btn" data-answer="cool">
                    <span class="wc-icon">❄️</span> Cool
                </button>
            </div>
        `;
        container.querySelectorAll('.warmcool-btn').forEach(btn =>
            btn.addEventListener('click', () => _onWarmCoolChoice(btn)));
        setTimeout(() => Voice.speak(`Is ${pick.name} a warm color or a cool color?`), 400);
    }

    function _onWarmCoolChoice(btn) {
        if (!roundActive) return;
        const chosen = btn.dataset.answer;
        roundTotal++;
        if (chosen === mixAnswer) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('color-catch', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            Voice.speak(`Yes! ${targetColor.name} is a ${mixAnswer} color!`);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRoundNum++;
            setTimeout(() => _nextGradeRound(), 1500);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('color-catch', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            Voice.speak(`${targetColor.name} is actually a ${mixAnswer} color!`);
            const correctBtn = container.querySelector(`[data-answer="${mixAnswer}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            setTimeout(() => {
                btn.classList.remove('choice-wrong');
                if (correctBtn) correctBtn.classList.remove('choice-hint');
            }, 2500);
        }
    }

    // ---------- 2nd Grade: Complementary Colors ----------
    function _startComplementaryRound() {
        roundActive = true;
        const pair = COMPLEMENTARY_PAIRS[Math.floor(Math.random() * COMPLEMENTARY_PAIRS.length)];
        // Show one color, ask for its complement
        const showFirst = Math.random() < 0.5;
        const shown = showFirst ? pair.a : pair.b;
        const answer = showFirst ? pair.b : pair.a;
        mixAnswer = answer;
        targetColor = shown;

        // Build choices
        const allColors = PREK_COLORS.filter(c => c.name !== shown.name);
        const distractors = allColors.sort(() => Math.random() - 0.5).slice(0, 2);
        const choices = [
            { name: answer.name, hex: answer.hex },
            ...distractors.map(d => ({ name: d.name, hex: d.hex }))
        ].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">Complementary Colors!</span></div>
            <div class="complement-question">
                <div class="complement-shown" style="background:${shown.hex}"></div>
                <div class="complement-label">${shown.name}</div>
                <div class="complement-ask">What is the <strong>opposite</strong> color on the color wheel?</div>
            </div>
            <div class="color-choices">
                ${choices.map(c => `
                    <button class="color-choice-btn" data-color="${c.name}" style="background:${c.hex}">
                        <span class="color-choice-label">${c.name}</span>
                    </button>
                `).join('')}
            </div>
        `;
        container.querySelectorAll('.color-choice-btn').forEach(btn =>
            btn.addEventListener('click', () => _onComplementaryChoice(btn)));
        setTimeout(() => Voice.speak(`What is the opposite of ${shown.name} on the color wheel?`), 400);
    }

    function _onComplementaryChoice(btn) {
        if (!roundActive) return;
        const chosen = btn.dataset.color;
        roundTotal++;
        if (chosen === mixAnswer.name) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('color-catch', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            Voice.speak(`Yes! ${targetColor.name} and ${mixAnswer.name} are complementary colors!`);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRoundNum++;
            setTimeout(() => _nextGradeRound(), 2000);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('color-catch', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            Voice.speak(`The opposite of ${targetColor.name} is ${mixAnswer.name}!`);
            const correctBtn = container.querySelector(`[data-color="${mixAnswer.name}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            setTimeout(() => {
                btn.classList.remove('choice-wrong');
                if (correctBtn) correctBtn.classList.remove('choice-hint');
            }, 2500);
        }
    }

    // ---------- Multi-round routing ----------
    function _nextGradeRound() {
        if (currentRoundNum >= totalRoundsForSession) {
            _completeRound();
            return;
        }
        const grade = Progress.getGradeLevel();
        if (grade === 0) {
            _startCatchRound();
        } else if (grade === 1) {
            gradeMode = gradeMode === 'catch' ? 'mix' : 'catch';
            if (gradeMode === 'catch') _startCatchRound();
            else _startMixRound();
        } else if (grade === 2) {
            gradeMode = gradeMode === 'shade' ? 'warmcool' : 'shade';
            if (gradeMode === 'shade') _startShadeRound();
            else _startWarmCoolRound();
        } else {
            gradeMode = gradeMode === 'complementary' ? 'shade' : 'complementary';
            if (gradeMode === 'complementary') _startComplementaryRound();
            else _startShadeRound();
        }
    }

    // ---------- Shared rendering/movement for catch mode ----------
    function _render() {
        const targetDisplay = `
            <div class="activity-prompt">
                <div class="color-target-swatch" style="background:${targetColor.hex}"></div>
                <span class="catch-count">${caught} / ${needed}</span>
            </div>
        `;
        const bugsHtml = bugs.filter(b => !b.caught).map(b => `
            <div class="bug" data-bug-id="${b.id}"
                 style="left:${b.x}px; top:${b.y}px; --bug-color:${b.color.hex}; --bug-dark:${b.color.dark}">
                <div class="bug-body">
                    <div class="bug-eye left"></div>
                    <div class="bug-eye right"></div>
                    <div class="bug-leg l1"></div>
                    <div class="bug-leg l2"></div>
                    <div class="bug-leg l3"></div>
                    <div class="bug-leg r1"></div>
                    <div class="bug-leg r2"></div>
                    <div class="bug-leg r3"></div>
                </div>
            </div>
        `).join('');

        container.innerHTML = targetDisplay + `<div class="bug-field">${bugsHtml}</div>`;
        container.querySelectorAll('.bug').forEach(el => {
            el.addEventListener('click', (e) => _onBugTap(e, el));
            el.addEventListener('touchstart', (e) => { e.preventDefault(); _onBugTap(e, el); }, { passive: false });
        });
    }

    function _onBugTap(e, el) {
        if (!roundActive) return;
        const bugId = parseInt(el.dataset.bugId);
        const bug = bugs.find(b => b.id === bugId);
        if (!bug || bug.caught) return;

        if (bug.color.name === targetColor.name) {
            bug.caught = true;
            caught++;
            roundCorrect++;
            roundTotal++;
            Audio.playPop();
            Progress.recordAnswer('color-catch', true);
            Character.happy();
            const rect = el.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
            el.classList.add('bug-caught');
            setTimeout(() => el.remove(), 400);
            const countEl = container.querySelector('.catch-count');
            if (countEl) countEl.textContent = `${caught} / ${needed}`;

            bugs.forEach(b => { if (!b.caught) { b.vx *= 1.05; b.vy *= 1.05; } });

            if (caught >= needed) {
                currentRoundNum++;
                if (moveInterval) clearInterval(moveInterval);
                Audio.playCelebration();
                Character.celebrate();
                Celebration.confetti();
                Voice.speak('Amazing! You caught them all!');
                _maybeUnlockColor();
                setTimeout(() => _nextGradeRound(), 2500);
            } else if (caught === needed - 1) {
                Voice.speak('One more!');
            }
            if (Progress.shouldAwardSticker()) _awardSticker();
        } else {
            roundTotal++;
            Audio.playWrong();
            Progress.recordAnswer('color-catch', false);
            Character.encourage();
            el.classList.add('bug-shake');
            setTimeout(() => el.classList.remove('bug-shake'), 500);
            Voice.speak(`That's ${bug.color.name}. Try the ${targetColor.name} one!`);
        }
    }

    function _startMovement() {
        if (moveInterval) clearInterval(moveInterval);
        moveInterval = setInterval(() => {
            if (!roundActive) return;
            bugs.forEach(b => {
                if (b.caught) return;
                b.wobble += 0.05;
                b.x += b.vx + Math.sin(b.wobble) * 0.3;
                b.y += b.vy + Math.cos(b.wobble) * 0.3;
                if (b.x < 40 || b.x > window.innerWidth - 140) b.vx *= -1;
                if (b.y < 80 || b.y > window.innerHeight - 180) b.vy *= -1;
                b.x = Math.max(40, Math.min(window.innerWidth - 140, b.x));
                b.y = Math.max(80, Math.min(window.innerHeight - 180, b.y));
                const el = container.querySelector(`[data-bug-id="${b.id}"]`);
                if (el) { el.style.left = b.x + 'px'; el.style.top = b.y + 'px'; }
            });
        }, 50);
    }

    function _completeRound() {
        roundActive = false;
        if (moveInterval) clearInterval(moveInterval);
        Audio.playCelebration();
        Character.celebrate();
        Celebration.confetti();
        Voice.speak('Amazing! Great color work!');
        _maybeUnlockColor();
        setTimeout(() => { if (onComplete) onComplete(roundCorrect, roundTotal); }, 3000);
    }

    function _maybeUnlockColor() {
        const stats = Progress.getStats('color-catch');
        if (stats.played >= 2 && stats.colorsLearned && stats.colorsLearned.length < PREK_COLORS.length) {
            const nextColor = PREK_COLORS.find(c => !stats.colorsLearned.includes(c.name));
            if (nextColor) Progress.expandContent('color-catch', nextColor.name);
        }
    }

    function _textColor(hex) {
        // Simple brightness check for text contrast
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r * 0.299 + g * 0.587 + b * 0.114) > 160 ? '#222' : '#fff';
    }

    function _awardSticker() {
        const sticker = StickerBook.getNextUnearned();
        if (!sticker) return;
        Progress.awardSticker(sticker.id);
        Main.showStickerEarned(sticker);
    }

    function stop() {
        roundActive = false;
        if (moveInterval) clearInterval(moveInterval);
        bugs = [];
    }

    return { start, stop };
})();
