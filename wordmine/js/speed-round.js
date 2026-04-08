/* ============================================
   SPEED ROUND — Timed sight word blitz
   60 seconds, no hearts, answer as many as possible
   ============================================ */
const SpeedRound = (() => {
    let active = false;
    let correct = 0, total = 0, streak = 0, bestStreak = 0;
    let xpEarned = 0, gemsEarned = 0;
    let wordsAttempted = [];
    let timeLeft = 60;
    let initialTime = 60;
    let timerInterval = null;
    let words = [];
    let currentIndex = 0;

    function start() {
        active = true;
        correct = 0; total = 0; streak = 0; bestStreak = 0;
        xpEarned = 0; gemsEarned = 0;
        wordsAttempted = [];
        timeLeft = 60;
        currentIndex = 0;

        // Time Freeze powerup
        if (Progress.consumePowerup('time-freeze')) {
            timeLeft += 10;
            Main.showToast('\u23F1\uFE0F Time Freeze! +10 sec');
        }

        initialTime = timeLeft;
        words = SightWords.getPracticeSet(50);

        const canvas = document.getElementById('game-canvas');
        World.init(canvas);
        World.resize(320, 180);

        // Show HUD
        document.getElementById('game-hud').style.display = 'flex';
        document.getElementById('hud-mode-label').textContent = 'SPEED ROUND';
        document.getElementById('hud-hearts').innerHTML = '';
        document.getElementById('hud-timer').style.display = 'block';
        document.getElementById('hud-timer').textContent = formatTime(timeLeft);
        document.getElementById('hud-progress').textContent = `${correct} correct`;

        // Add speed timer bar
        let timerBar = document.getElementById('speed-timer-bar');
        if (!timerBar) {
            timerBar = document.createElement('div');
            timerBar.id = 'speed-timer-bar';
            timerBar.className = 'speed-timer-bar';
            timerBar.innerHTML = '<div class="speed-timer-fill" id="speed-timer-fill"></div>';
            canvas.parentElement.appendChild(timerBar);
        }
        timerBar.style.display = 'block';
        document.getElementById('speed-timer-fill').style.width = '100%';
        document.getElementById('speed-timer-fill').className = 'speed-timer-fill';

        World.startLoop(render);
        timerInterval = setInterval(tick, 1000);
        setTimeout(() => nextWord(), 300);
    }

    function formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    function tick() {
        if (!active) return;
        if (document.getElementById('pause-overlay').classList.contains('active')) return;

        timeLeft--;
        document.getElementById('hud-timer').textContent = formatTime(timeLeft);

        // Update timer bar
        const pct = (timeLeft / initialTime) * 100;
        const fill = document.getElementById('speed-timer-fill');
        if (fill) {
            fill.style.width = pct + '%';
            fill.className = 'speed-timer-fill' + (pct < 20 ? ' danger' : pct < 40 ? ' warning' : '');
        }

        if (timeLeft <= 0) {
            endGame();
        }
    }

    function render(ctx, W, H, frame) {
        // Draw background
        if (!World.drawBackground(Progress.get().world || 'plains')) {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, W, H);
        }

        // Draw player in center
        const groundLevel = Math.floor(H * 0.75);
        World.drawGround(Progress.get().world || 'plains', groundLevel);
        World.drawCharacter(W / 2 - 8, groundLevel - 20, 16, Progress.get().skin || 'steve', true, false);

        // Draw pet if equipped
        const petType = Progress.get().pet;
        if (petType) {
            World.drawPet(W / 2 - 24, groundLevel - 16, 10, petType, frame);
        }

        // Score display on canvas
        World.drawText(`${correct}`, W / 2, 20, 3, '#FFD700', 'center');
    }

    function nextWord() {
        if (!active || timeLeft <= 0) return;
        if (currentIndex >= words.length) {
            // Recycle words
            words = SightWords.getPracticeSet(50);
            currentIndex = 0;
        }

        const word = words[currentIndex++];
        const q = SightWords.generateQuestion(word);
        showQuestion(q);
    }

    function showQuestion(q) {
        const overlay = document.getElementById('question-overlay');
        const wordEl = document.getElementById('question-word');
        const promptEl = document.getElementById('question-prompt');
        const btnContainer = document.getElementById('answer-buttons');
        const feedbackEl = document.getElementById('question-feedback');

        wordEl.textContent = q.showWord ? q.word : '?';
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

        if (q.speak) {
            setTimeout(() => Audio.speakWord(q.word), 200);
        }
    }

    function handleAnswer(choice, question, clickedBtn, container) {
        if (!active) return;
        container.querySelectorAll('.answer-btn').forEach(b => b.style.pointerEvents = 'none');

        const isCorrect = choice === question.correct;
        const feedbackEl = document.getElementById('question-feedback');

        total++;
        wordsAttempted.push(question.word);
        Progress.recordSightWord(question.word, isCorrect);

        if (isCorrect) {
            correct++;
            streak++;
            if (streak > bestStreak) bestStreak = streak;
            if (streak === 5 || streak === 10 || streak === 15) Main.celebrateStreak(streak);
            Main.triggerEffects(streak);

            const earned = 8 + Math.min(streak, 10) * 2;
            xpEarned += earned;

            clickedBtn.classList.add('correct');
            feedbackEl.textContent = `+${earned} XP! ${streak} streak!`;
            feedbackEl.className = 'question-feedback feedback-correct';
            Audio.correct();

            document.getElementById('hud-progress').textContent = `${correct} correct`;

            // Quick gem bonus every 5 correct
            if (correct % 5 === 0) {
                const gems = Math.floor(correct / 5);
                gemsEarned += gems;
                Main.showToast(`\u{1F48E} +${gems} gems!`);
            }
        } else {
            streak = 0;
            clickedBtn.classList.add('wrong');
            container.querySelectorAll('.answer-btn').forEach(b => {
                if (b.textContent === question.correct) b.classList.add('correct');
            });
            feedbackEl.textContent = Main.getEncourageMsg(question.correct);
            feedbackEl.className = 'question-feedback feedback-wrong';
            Audio.wrong();
        }

        // Fast transition — only 600ms delay in speed mode
        setTimeout(() => {
            document.getElementById('question-overlay').classList.remove('active');
            setTimeout(() => nextWord(), 150);
        }, 600);
    }

    function endGame() {
        active = false;
        clearInterval(timerInterval);
        document.getElementById('question-overlay').classList.remove('active');
        document.getElementById('game-hud').style.display = 'none';

        const timerBar = document.getElementById('speed-timer-bar');
        if (timerBar) timerBar.style.display = 'none';

        // Award XP and gems
        Progress.addXP(xpEarned);
        Progress.addGems(gemsEarned);
        Progress.recordGameComplete(correct, total, bestStreak);

        // Record best score
        const d = Progress.get();
        if (!d.bestScores) d.bestScores = {};
        if (!d.bestScores.speed || correct > d.bestScores.speed.score) {
            d.bestScores.speed = { score: correct, date: Date.now() };
            Progress.save();
        }

        showResults();
    }

    function showResults() {
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        let stars = correct >= 20 ? 3 : correct >= 12 ? 2 : correct >= 5 ? 1 : 0;
        if (stars < 2 && Progress.consumePowerup('lucky-star')) { stars = 2; Main.showToast('\u2B50 Lucky Star! 2 stars!'); }

        document.getElementById('results-title').textContent =
            stars >= 3 ? 'SPEED DEMON!' : stars >= 2 ? 'Lightning Fast!' : stars >= 1 ? 'Good Speed!' : 'Keep Practicing!';
        document.getElementById('stat-correct').textContent = correct;
        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-accuracy').textContent = accuracy + '%';
        document.getElementById('stat-xp').textContent = '+' + xpEarned;
        document.getElementById('stat-streak').textContent = bestStreak;
        document.getElementById('stat-wpm-row').style.display = 'none';

        const gemsRow = document.getElementById('stat-gems-row');
        if (gemsEarned > 0) {
            gemsRow.style.display = 'flex';
            document.getElementById('stat-gems').textContent = '+' + gemsEarned;
        } else {
            gemsRow.style.display = 'none';
        }

        const starsEl = document.getElementById('results-stars');
        starsEl.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const s = document.createElement('span');
            s.className = i < stars ? 'star earned' : 'star empty';
            s.textContent = i < stars ? '\u2B50' : '\u2606';
            starsEl.appendChild(s);
        }

        document.getElementById('results-missed').style.display = 'none';

        if (stars >= 2) {
            Celebration.start(document.getElementById('celebration-canvas'));
        }

        Main.populateResultsExtras({ wordsAttempted, mode: 'speed', score: correct });

        const earned = Achievements.checkAfterGame({
            mode: 'speed', correct, total, bestStreak, stars
        });
        earned.forEach((a, i) => {
            setTimeout(() => Main.showToast(`\u{1F3C6} ${a.name}: ${a.desc}`), 1500 + i * 2000);
        });

        Main.showScreen('results');
        Main.maybeTreasureBonus();
    }

    function stop() {
        active = false;
        clearInterval(timerInterval);
        const timerBar = document.getElementById('speed-timer-bar');
        if (timerBar) timerBar.style.display = 'none';
    }

    return { start, stop };
})();
