/* ============================================
   ENCHANTING TABLE — Nonsense Word Decoding Mode
   Sound out CVC words, Minecraft enchanting theme
   Spell effects, enchantment rewards, visual power meter
   ============================================ */
const EnchantMode = (() => {
    let active = false;
    let words = [];
    let currentIndex = 0;
    let correct = 0, total = 0;
    let startTime = 0, elapsed = 0;
    let timerInterval = null;
    let pausedTime = 0; // accumulated pause duration
    let xpEarned = 0, gemsEarned = 0;
    let streak = 0, bestStreak = 0;
    let missedWords = [];
    let enchantLevel = 0;
    let particles = [];
    let spellParticles = [];
    let floatingTexts = [];
    let bookOpen = false;
    let bookFlip = 0;
    let enchantFlash = 0;
    let runeChars = [];
    let combo = 0, comboTimer = 0;
    const MAX_WORDS = 20;

    // Enchantment rewards at power levels
    const ENCHANT_REWARDS = {
        5: { text: 'Protection I', gems: 2 },
        10: { text: 'Sharpness II', gems: 3 },
        15: { text: 'Fortune III', gems: 5 },
        20: { text: 'Infinity!', gems: 8 }
    };

    function start() {
        active = true;
        words = NonsenseWords.getPracticeSet(MAX_WORDS);
        currentIndex = 0;
        correct = 0; total = 0;
        xpEarned = 0; gemsEarned = 0;
        streak = 0; bestStreak = 0;
        missedWords = [];
        enchantLevel = 0;
        particles = [];
        spellParticles = [];
        floatingTexts = [];
        bookOpen = false;
        bookFlip = 0;
        enchantFlash = 0;
        combo = 0; comboTimer = 0;
        elapsed = 0; pausedTime = 0;

        // Generate floating rune characters
        runeChars = [];
        const glyphs = 'ᔑᒷ∷ᒲᓭ╎ᓵ⚍∷ᔑ∷ᓭ';
        for (let i = 0; i < 20; i++) {
            runeChars.push({
                char: glyphs[i % glyphs.length],
                x: Math.random() * 320,
                y: Math.random() * 100 + 20,
                speed: 0.3 + Math.random() * 0.5,
                amplitude: 20 + Math.random() * 30,
                phase: Math.random() * Math.PI * 2,
                size: 4 + Math.floor(Math.random() * 3)
            });
        }

        const canvas = document.getElementById('game-canvas');
        World.init(canvas);
        World.resize(320, 180);

        showHUD();
        document.getElementById('hud-timer').style.display = 'block';
        World.startLoop(render);

        startTime = Date.now();
        // Time Freeze powerup: subtract 10 seconds from elapsed
        if (Progress.consumePowerup('time-freeze')) {
            pausedTime = 10000;
            Main.showToast('⏱️ Time Freeze! +10 sec');
        }
        timerInterval = setInterval(updateTimer, 100);
        setTimeout(() => nextWord(), 800);
    }

    function render(ctx, W, H, frame) {
        // Background
        if (!World.drawBackground('enchant')) {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);
            // Bookshelves
            for (let x = 0; x < W; x += 16) {
                for (let y = 0; y < 3; y++) {
                    const by = 20 + y * 16;
                    ctx.fillStyle = '#4a2810';
                    ctx.fillRect(x, by, 15, 15);
                    const bookColors = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#f39c12'];
                    for (let b = 0; b < 3; b++) {
                        ctx.fillStyle = bookColors[(x + b + y) % bookColors.length];
                        ctx.fillRect(x + 2 + b * 4, by + 2, 3, 11);
                    }
                }
            }
            // Enchanting table
            const tableX = W / 2 - 16;
            const tableY = 100;
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(tableX, tableY + 8, 32, 16);
            ctx.fillStyle = '#2d2d5e';
            ctx.fillRect(tableX + 2, tableY + 10, 28, 12);
            ctx.fillStyle = '#4aedd9';
            ctx.fillRect(tableX + 4, tableY, 24, 10);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(tableX + 8, tableY - 4, 16, 6);
            ctx.fillStyle = '#DAA520';
            ctx.fillRect(tableX + 14, tableY - 3, 4, 4);
        }

        // Floating enchantment runes (intensify with enchant level)
        const runeSpeedMult = 1 + enchantLevel * 0.08;
        const runeAlphaBoost = Math.min(enchantLevel * 0.02, 0.3);
        runeChars.forEach(r => {
            const px = r.x + Math.sin(frame * 0.02 * runeSpeedMult + r.phase) * r.amplitude;
            const py = r.y + Math.cos(frame * 0.015 * runeSpeedMult + r.phase) * 15;
            const alpha = 0.2 + runeAlphaBoost + Math.sin(frame * 0.04 * runeSpeedMult + r.phase) * 0.15;
            ctx.globalAlpha = Math.min(alpha, 0.8);
            ctx.fillStyle = enchantLevel > 15 ? '#FFD700' : enchantLevel > 10 ? '#9b59b6' : '#4aedd9';
            ctx.font = `${r.size}px monospace`;
            ctx.fillText(r.char, px, py);
        });
        ctx.globalAlpha = 1;

        // Purple glow aura around enchanting table when powered
        if (enchantLevel > 0) {
            const glowIntensity = Math.min(enchantLevel / 20, 1);
            const glowPulse = 0.15 + Math.sin(frame * 0.03) * 0.1;
            const tableGlowX = W / 2 - 16;
            const tableGlowY = 100;
            ctx.globalAlpha = glowIntensity * glowPulse;
            ctx.fillStyle = enchantLevel > 15 ? '#FFD700' : '#9b59b6';
            // Outer glow
            ctx.fillRect(tableGlowX - 6, tableGlowY - 6, 44, 36);
            ctx.globalAlpha = 1;
        }

        // Book animation on enchanting table
        const tableX2 = W / 2 - 16;
        const tableY2 = 100;
        if (bookFlip > 0) {
            bookFlip--;
            ctx.fillStyle = '#f5e6ca';
            const flipOffset = Math.sin(bookFlip * 0.3) * 5;
            ctx.fillRect(tableX2 + 8 + flipOffset, tableY2 - 8, 8, 6);
            ctx.fillRect(tableX2 + 16, tableY2 - 8, 8, 6);
        }

        // Enchant flash effect
        if (enchantFlash > 0) {
            ctx.globalAlpha = enchantFlash * 0.4;
            ctx.fillStyle = '#9b59b6';
            ctx.fillRect(0, 0, W, H);
            ctx.globalAlpha = 1;
            enchantFlash = Math.max(0, enchantFlash - 0.04);
        }

        // Spell particles (spiral around table on correct answers)
        spellParticles = spellParticles.filter(p => {
            p.angle += p.speed;
            p.radius -= 0.2;
            p.y -= 0.3;
            p.life -= 0.02;
            if (p.life <= 0 || p.radius <= 0) return false;

            const px = tableX2 + 16 + Math.cos(p.angle) * p.radius;
            const py = p.y + Math.sin(p.angle) * p.radius * 0.3;
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(px, py, 2, 2);
            ctx.globalAlpha = 1;
            return true;
        });

        // Enchant power meter (vertical bar on left side)
        const meterX = 8;
        const meterH = 80;
        const meterY = 80;
        ctx.fillStyle = '#222';
        ctx.fillRect(meterX, meterY, 8, meterH);
        const pct = Math.min(enchantLevel / MAX_WORDS, 1);
        const meterFillH = meterH * pct;
        // Gradient from cyan to purple
        const meterGrad = ctx.createLinearGradient(0, meterY + meterH - meterFillH, 0, meterY + meterH);
        meterGrad.addColorStop(0, '#9b59b6');
        meterGrad.addColorStop(1, '#4aedd9');
        ctx.fillStyle = meterGrad;
        ctx.fillRect(meterX, meterY + meterH - meterFillH, 8, meterFillH);
        // Meter border
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(meterX, meterY, 8, meterH);
        // Level markers
        [5, 10, 15, 20].forEach(lv => {
            const ly = meterY + meterH - (meterH * lv / MAX_WORDS);
            ctx.fillStyle = enchantLevel >= lv ? '#FFD700' : '#444';
            ctx.fillRect(meterX - 2, ly - 1, 12, 2);
        });
        World.drawText('PWR', meterX + 4, meterY - 4, 3, '#aaa', 'center');

        // Draw companion pet near the enchanting table
        const petType = Progress.get().pet;
        if (petType) {
            const petBob = Math.sin(frame * 0.04) * 1;
            World.drawPet(W / 2 + 28, 112 + petBob, 10, petType, frame);
        }

        // Floating texts
        floatingTexts = floatingTexts.filter(t => {
            t.y -= 0.4;
            t.life -= 0.015;
            if (t.life <= 0) return false;
            ctx.globalAlpha = t.life;
            World.drawText(t.text, t.x, t.y, t.size || 4, t.color, 'center');
            ctx.globalAlpha = 1;
            return true;
        });

        // Combo (HTML overlay)
        const comboEl = document.getElementById('combo-overlay');
        if (combo >= 2) {
            comboEl.textContent = `${combo}x COMBO!`;
            comboEl.style.color = '#9b59b6';
            comboEl.classList.add('active');
        } else {
            comboEl.classList.remove('active');
            comboEl.style.color = '';
        }
        if (comboTimer > 0) { comboTimer--; if (comboTimer <= 0) combo = 0; }

        // XP particles
        particles = particles.filter(p => {
            p.y -= 0.5;
            p.life -= 0.02;
            if (p.life <= 0) return false;
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.font = '5px monospace';
            ctx.fillText(p.text, p.x, p.y);
            ctx.globalAlpha = 1;
            return true;
        });
    }

    function updateTimer() {
        if (!active) return;
        // Don't count time while paused
        if (document.getElementById('pause-overlay').classList.contains('active')) {
            pausedTime += 100;
            return;
        }
        elapsed = (Date.now() - startTime - pausedTime) / 1000;
        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60);
        document.getElementById('hud-timer').textContent =
            `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function nextWord() {
        if (!active || currentIndex >= words.length) {
            endGame();
            return;
        }

        const word = words[currentIndex];
        const q = NonsenseWords.generateQuestion(word);
        showQuestion(q);
        bookFlip = 20;
        setTimeout(() => Audio.speakWord(word), 300);
    }

    function showQuestion(q) {
        const overlay = document.getElementById('question-overlay');
        const wordEl = document.getElementById('question-word');
        const promptEl = document.getElementById('question-prompt');
        const btnContainer = document.getElementById('answer-buttons');
        const feedbackEl = document.getElementById('question-feedback');

        wordEl.textContent = '?';
        wordEl.dataset.word = q.word;
        promptEl.textContent = q.prompt;
        feedbackEl.textContent = '';
        feedbackEl.className = 'question-feedback';

        btnContainer.innerHTML = '';
        q.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = choice;
            btn.addEventListener('click', () => handleAnswer(choice, q, btn, btnContainer));
            btnContainer.appendChild(btn);
        });

        Main.setQuestionHint(q.correct);
        overlay.classList.add('active');
    }

    function handleAnswer(choice, question, clickedBtn, container) {
        if (!active) return;
        container.querySelectorAll('.answer-btn').forEach(b => b.style.pointerEvents = 'none');

        const isCorrect = choice === question.correct;
        const feedbackEl = document.getElementById('question-feedback');

        total++;
        currentIndex++;
        Progress.recordNonsenseWord(isCorrect, question.word);

        if (isCorrect) {
            correct++;
            streak++;
            combo++;
            comboTimer = 180;
            if (streak > bestStreak) bestStreak = streak;
            if (streak === 5 || streak === 10 || streak === 15) Main.celebrateStreak(streak);
            Main.triggerEffects(streak);
            enchantLevel++;

            const earned = 12 + Math.min(streak, 5) * 2 + Math.min(combo, 5) * 2;
            xpEarned += earned;

            clickedBtn.classList.add('correct');
            feedbackEl.textContent = `+${earned} XP! Enchanted!`;
            feedbackEl.className = 'question-feedback feedback-correct';
            Audio.correct();
            Audio.enchant();

            // Spell spiral particles
            for (let i = 0; i < 8; i++) {
                spellParticles.push({
                    angle: (Math.PI * 2 / 8) * i,
                    radius: 30 + Math.random() * 10,
                    y: 95,
                    speed: 0.1 + Math.random() * 0.05,
                    color: Math.random() < 0.5 ? '#9b59b6' : '#4aedd9',
                    life: 1
                });
            }

            // XP float particle
            particles.push({
                x: 140 + Math.random() * 40,
                y: 100,
                text: '+' + earned,
                color: '#9b59b6',
                life: 1
            });

            // Check enchantment rewards
            if (ENCHANT_REWARDS[enchantLevel]) {
                const reward = ENCHANT_REWARDS[enchantLevel];
                enchantFlash = 1;
                gemsEarned += reward.gems;
                Audio.levelUp();

                floatingTexts.push({
                    x: 160, y: 60,
                    text: reward.text,
                    color: '#FFD700',
                    life: 2, size: 6
                });
                floatingTexts.push({
                    x: 160, y: 75,
                    text: `+${reward.gems} gems!`,
                    color: '#2ecc71',
                    life: 1.5, size: 4
                });
            }
        } else {
            streak = 0;
            combo = 0;
            comboTimer = 0;
            missedWords.push(question.word);
            clickedBtn.classList.add('wrong');
            container.querySelectorAll('.answer-btn').forEach(b => {
                if (b.textContent === question.correct) b.classList.add('correct');
            });
            feedbackEl.textContent = Main.getEncourageMsg(question.correct);
            feedbackEl.className = 'question-feedback feedback-wrong';
            Audio.wrong();
        }

        updateHUD();

        setTimeout(() => {
            document.getElementById('question-overlay').classList.remove('active');
            setTimeout(() => nextWord(), 400);
        }, isCorrect ? 800 : 1500);
    }

    function showHUD() {
        const hud = document.getElementById('game-hud');
        hud.style.display = 'flex';
        updateHUD();
    }

    function updateHUD() {
        document.getElementById('hud-score').textContent = correct + '/' + total;
        document.getElementById('streak-count').textContent = streak;
        document.getElementById('hud-xp').textContent = `XP: +${xpEarned}`;
    }

    function endGame() {
        active = false;
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        World.stopLoop();
        document.getElementById('question-overlay').classList.remove('active');
        document.getElementById('game-hud').style.display = 'none';
        document.getElementById('hud-timer').style.display = 'none';

        const minutes = elapsed / 60;
        const wpm = minutes > 0 ? Math.round(correct / minutes) : 0;
        Progress.recordWPM(wpm, 'nonsense');
        Progress.addXP(xpEarned);
        Progress.addGems(gemsEarned);
        Progress.recordGameComplete(correct, total, bestStreak);

        showResults(wpm);
    }

    function showResults(wpm) {
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        const meetsGoal = wpm >= NonsenseWords.BENCHMARK_WPM;
        // Require BOTH speed AND accuracy for top stars (FastBridge-aligned)
        // 3 stars: WPM meets benchmark AND 80%+ accuracy
        // 2 stars: WPM meets benchmark OR 70%+ accuracy
        // 1 star: 50%+ accuracy
        let stars = (meetsGoal && accuracy >= 80) ? 3
                  : (meetsGoal || accuracy >= 70) ? 2
                  : accuracy >= 50 ? 1 : 0;
        if (stars < 2 && Progress.consumePowerup('lucky-star')) { stars = 2; Main.showToast('⭐ Lucky Star! 2 stars!'); }

        document.getElementById('results-title').textContent =
            meetsGoal ? 'Master Enchanter!' : stars >= 2 ? 'Great Enchanting!' : 'Keep Practicing!';
        document.getElementById('stat-correct').textContent = correct;
        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-accuracy').textContent = accuracy + '%';
        document.getElementById('stat-xp').textContent = '+' + xpEarned;
        document.getElementById('stat-streak').textContent = bestStreak;

        const wpmRow = document.getElementById('stat-wpm-row');
        wpmRow.style.display = 'flex';
        const wpmEl = document.getElementById('stat-wpm');
        wpmEl.textContent = wpm;
        wpmEl.style.color = meetsGoal ? '#2ecc71' : '#e94560';

        const starsEl = document.getElementById('results-stars');
        starsEl.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const s = document.createElement('span');
            s.className = i < stars ? 'star earned' : 'star empty';
            s.textContent = i < stars ? '\u2B50' : '\u2606';
            starsEl.appendChild(s);
        }

        const missedEl = document.getElementById('results-missed');
        const missedList = document.getElementById('missed-words-list');
        const uniqueMissed = [...new Set(missedWords)];
        if (uniqueMissed.length > 0) {
            missedEl.style.display = 'block';
            missedList.innerHTML = '';
            uniqueMissed.forEach(w => {
                const span = document.createElement('span');
                span.className = 'missed-word';
                span.textContent = w;
                missedList.appendChild(span);
            });
        } else {
            missedEl.style.display = 'none';
        }

        // Show gems if any were earned
        const gemsRow = document.getElementById('stat-gems-row');
        if (gemsEarned > 0) {
            gemsRow.style.display = 'flex';
            document.getElementById('stat-gems').textContent = '+' + gemsEarned;
        } else {
            gemsRow.style.display = 'none';
        }

        if (stars >= 2) Celebration.start(document.getElementById('celebration-canvas'));

        // Populate extras (XP bar, WPM trend)
        Main.populateResultsExtras({
            wpmType: 'nonsense',
            wpmGoal: NonsenseWords.BENCHMARK_WPM,
            mode: 'enchant', score: accuracy
        });

        // Check achievements
        const earned = Achievements.checkAfterGame({
            mode: 'enchant', correct, total, bestStreak, stars,
            hadComeback: false
        });
        earned.forEach((a, i) => {
            setTimeout(() => Main.showToast(`🏆 ${a.name}: ${a.desc}`), 1500 + i * 2000);
        });

        Main.showScreen('results');
        Main.maybeTreasureBonus();
    }

    function stop() {
        active = false;
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        World.stopLoop();
    }

    return { start, stop };
})();
