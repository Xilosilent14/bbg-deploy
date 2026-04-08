/* ============================================
   BRIDGE BUILDER — 50-Word FastBridge Test Sim
   Timed sight word reading with WPM scoring
   Visual bridge growth, character walking, milestones
   ============================================ */
const BridgeMode = (() => {
    let active = false;
    let words = [];
    let currentIndex = 0;
    let correct = 0, total = 0;
    let startTime = 0, elapsed = 0;
    let timerInterval = null;
    let pausedTime = 0; // accumulated pause duration
    let xpEarned = 0;
    let gemsEarned = 0;
    let missedWords = [];
    let streak = 0, bestStreak = 0;
    let bridgeSegments = [];
    let scrollX = 0, targetScrollX = 0;
    let playerBridgeX = 30, targetPlayerBridgeX = 30;
    let milestoneShown = false;
    let milestoneText = '';
    let milestoneTimer = 0;
    let floatingTexts = [];
    let waterParticles = [];
    let landingParticles = [];
    let bridgeFlash = 0;

    const BLOCK_SIZE = 16;
    const BRIDGE_Y = 120;
    const WATER_Y = 140;

    // Milestones for celebration
    const MILESTONES = {
        10: { text: '10 Words!', gem: 3 },
        25: { text: 'Halfway There!', gem: 5 },
        40: { text: 'Almost Done!', gem: 5 },
        50: { text: 'BRIDGE COMPLETE!', gem: 10 }
    };

    function start() {
        active = true;
        words = SightWords.getTestSet();
        currentIndex = 0;
        correct = 0; total = 0;
        xpEarned = 0; gemsEarned = 0;
        streak = 0; bestStreak = 0;
        missedWords = [];
        bridgeSegments = [];
        scrollX = 0; targetScrollX = 0;
        playerBridgeX = 30; targetPlayerBridgeX = 30;
        elapsed = 0; pausedTime = 0;
        milestoneShown = false;
        milestoneText = '';
        milestoneTimer = 0;
        floatingTexts = [];
        waterParticles = [];
        landingParticles = [];
        bridgeFlash = 0;

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
        setTimeout(() => nextWord(), 500);
    }

    function render(ctx, W, H, frame) {
        // Background
        if (!World.drawBackground('bridge')) {
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, '#1a1a2e');
            grad.addColorStop(0.5, '#16213e');
            grad.addColorStop(1, '#0f3460');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
            // Stars
            for (let i = 0; i < 20; i++) {
                const sx = (i * 47 + frame * 0.02) % W;
                const sy = (i * 23) % 60;
                ctx.fillStyle = '#fff';
                ctx.fillRect(sx, sy, 1, 1);
            }
            // Moon
            ctx.fillStyle = '#e8e8c8';
            ctx.beginPath();
            ctx.arc(W - 35, 25, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        // Water
        ctx.fillStyle = 'rgba(26, 82, 118, 0.7)';
        ctx.fillRect(0, WATER_Y, W, H - WATER_Y);
        for (let x = 0; x < W; x += 8) {
            const wy = WATER_Y + Math.sin((x + frame * 2) * 0.05) * 2;
            ctx.fillStyle = '#2471a3';
            ctx.fillRect(x - scrollX % 8, wy, 6, 1);
        }

        // Water splash particles
        waterParticles = waterParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life--;
            if (p.life <= 0) return false;
            ctx.globalAlpha = p.life / 30;
            ctx.fillStyle = '#5dade2';
            ctx.fillRect(p.x, p.y, 2, 2);
            ctx.globalAlpha = 1;
            return true;
        });

        // Smooth scroll
        scrollX += (targetScrollX - scrollX) * 0.12;

        // Starting platform
        ctx.fillStyle = '#5d6d7e';
        ctx.fillRect(10 - scrollX, BRIDGE_Y, 30, BLOCK_SIZE);
        ctx.fillRect(15 - scrollX, BRIDGE_Y + BLOCK_SIZE, 8, WATER_Y - BRIDGE_Y);

        // End platform (visible goal)
        const endX = 40 + 50 * BLOCK_SIZE;
        if (endX - scrollX < W + 50) {
            ctx.fillStyle = '#5d6d7e';
            ctx.fillRect(endX - scrollX, BRIDGE_Y, 30, BLOCK_SIZE);
            ctx.fillRect(endX + 10 - scrollX, BRIDGE_Y + BLOCK_SIZE, 8, WATER_Y - BRIDGE_Y);
            // Flag on end platform
            ctx.fillStyle = '#8B5E3C';
            ctx.fillRect(endX + 12 - scrollX, BRIDGE_Y - 20, 2, 22);
            ctx.fillStyle = '#e94560';
            ctx.fillRect(endX + 14 - scrollX, BRIDGE_Y - 20, 10, 7);
        }

        // Bridge supports
        for (let i = 0; i < bridgeSegments.length; i += 5) {
            const bx = 40 + i * BLOCK_SIZE - scrollX;
            if (bx > -BLOCK_SIZE && bx < W + BLOCK_SIZE) {
                ctx.fillStyle = '#5d6d7e';
                ctx.fillRect(bx + 4, BRIDGE_Y + BLOCK_SIZE, 8, WATER_Y - BRIDGE_Y);
            }
        }

        // Bridge segments with drop animation
        bridgeSegments.forEach((seg, i) => {
            const bx = 40 + i * BLOCK_SIZE - scrollX;
            if (bx < -BLOCK_SIZE || bx > W + BLOCK_SIZE) return;

            // Block drop animation: starts high, falls to BRIDGE_Y
            let drawY = BRIDGE_Y;
            if (seg.placeAnim > 0) {
                drawY = BRIDGE_Y - seg.placeAnim * 3;
                const prevAnim = seg.placeAnim;
                seg.placeAnim = Math.max(0, seg.placeAnim - 0.5);
                // Spawn landing poof when block reaches final position
                if (prevAnim > 0 && seg.placeAnim === 0 && !seg.landed) {
                    seg.landed = true;
                    const blockColor = World.BLOCK_COLORS[seg.type] || '#888';
                    for (let p = 0; p < 6; p++) {
                        landingParticles.push({
                            x: bx + Math.random() * BLOCK_SIZE,
                            y: BRIDGE_Y + BLOCK_SIZE * 0.5,
                            vx: (Math.random() - 0.5) * 2,
                            vy: -Math.random() * 1.5 - 0.5,
                            life: 18 + Math.random() * 10,
                            color: blockColor,
                            size: 1 + Math.floor(Math.random() * 2)
                        });
                    }
                }
            }

            World.drawBlock(bx, drawY, BLOCK_SIZE, seg.type, false);

            // Word on block (readable)
            if (seg.word) {
                const fontSize = seg.word.length > 5 ? 5 : 7;
                const textX = bx + BLOCK_SIZE / 2;
                const textY = drawY - fontSize - 2;
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                const tw = seg.word.length * (fontSize * 0.8);
                ctx.fillRect(textX - tw / 2 - 3, textY - 2, tw + 6, fontSize + 4);
                World.drawText(seg.word, textX, textY, fontSize, '#fff', 'center');
            }
        });

        // Landing particles
        landingParticles = landingParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life--;
            if (p.life <= 0) return false;
            ctx.globalAlpha = Math.min(1, p.life / 10);
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
            ctx.globalAlpha = 1;
            return true;
        });

        // Gap indicator
        const nextX = 40 + bridgeSegments.length * BLOCK_SIZE - scrollX;
        if (nextX > 0 && nextX < W) {
            const flashAlpha = 0.3 + Math.sin(frame * 0.06) * 0.3;
            ctx.strokeStyle = `rgba(255, 215, 0, ${flashAlpha})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(nextX, BRIDGE_Y, BLOCK_SIZE, BLOCK_SIZE);
            // Arrow pointing down
            ctx.fillStyle = `rgba(255, 215, 0, ${flashAlpha})`;
            ctx.beginPath();
            ctx.moveTo(nextX + BLOCK_SIZE / 2 - 3, BRIDGE_Y - 8);
            ctx.lineTo(nextX + BLOCK_SIZE / 2 + 3, BRIDGE_Y - 8);
            ctx.lineTo(nextX + BLOCK_SIZE / 2, BRIDGE_Y - 3);
            ctx.closePath();
            ctx.fill();
        }

        // Bridge flash overlay
        if (bridgeFlash > 0) {
            ctx.globalAlpha = bridgeFlash * 0.3;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(0, 0, W, H);
            ctx.globalAlpha = 1;
            bridgeFlash = Math.max(0, bridgeFlash - 0.03);
        }

        // Character walking on bridge
        playerBridgeX += (targetPlayerBridgeX - playerBridgeX) * 0.1;
        const bobY = Math.sin(frame * 0.12) * 1;
        const charScreenX = Math.min(playerBridgeX - scrollX, 140);
        World.drawCharacter(Math.max(10, charScreenX), BRIDGE_Y - 16 + bobY, 16, Progress.get().skin || 'steve', true, true);

        // Draw companion pet
        const petType = Progress.get().pet;
        if (petType) {
            World.drawPet(Math.max(2, charScreenX - 12), BRIDGE_Y - 10 + bobY, 8, petType, frame);
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

        // Milestone banner
        if (milestoneTimer > 0) {
            milestoneTimer--;
            const bannerAlpha = milestoneTimer > 40 ? 1 : milestoneTimer / 40;
            ctx.globalAlpha = bannerAlpha;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(W / 2 - 80, 30, 160, 28);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 1;
            ctx.strokeRect(W / 2 - 80, 30, 160, 28);
            World.drawText(milestoneText, W / 2, 48, 5, '#FFD700', 'center');
            ctx.globalAlpha = 1;
        }

        // Progress (HTML HUD)
        document.getElementById('hud-progress').textContent = `${total}/50`;
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
        const q = {
            word,
            prompt: 'Read this word!',
            showWord: true,
            speak: false,
            choices: SightWords.getChoices(word),
            correct: word
        };
        showQuestion(q);

        // Scroll to show bridge gap
        targetScrollX = Math.max(0, bridgeSegments.length * BLOCK_SIZE - 80);
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
        currentIndex++;
        Progress.recordSightWord(question.word, isCorrect);

        if (isCorrect) {
            correct++;
            streak++;
            if (streak > bestStreak) bestStreak = streak;
            if (streak === 5 || streak === 10 || streak === 15) Main.celebrateStreak(streak);
            Main.triggerEffects(streak);
            const earned = 8 + Math.min(streak, 5) * 2;
            xpEarned += earned;

            clickedBtn.classList.add('correct');
            feedbackEl.textContent = streak >= 3 ? `+${earned} XP! ${streak} streak!` : `+${earned} XP!`;
            feedbackEl.className = 'question-feedback feedback-correct';
            Audio.correct();
            Audio.bridgePlace();

            // Add bridge segment with placement animation
            const types = ['wood', 'stone', 'iron', 'gold', 'diamond'];
            const type = types[Math.min(4, Math.floor(streak / 3))];
            bridgeSegments.push({ word: question.word, type, placeAnim: 10, landed: false });

            // Water splash
            const splashX = 40 + (bridgeSegments.length - 1) * BLOCK_SIZE - scrollX;
            for (let i = 0; i < 5; i++) {
                waterParticles.push({
                    x: splashX + Math.random() * BLOCK_SIZE,
                    y: WATER_Y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -Math.random() * 3 - 1,
                    life: 30
                });
            }

            // Move player forward
            targetPlayerBridgeX = 30 + bridgeSegments.length * BLOCK_SIZE;
        } else {
            streak = 0;
            missedWords.push(question.word);
            clickedBtn.classList.add('wrong');
            container.querySelectorAll('.answer-btn').forEach(b => {
                if (b.textContent === question.correct) b.classList.add('correct');
            });
            feedbackEl.textContent = Main.getEncourageMsg(question.correct);
            feedbackEl.className = 'question-feedback feedback-wrong';
            Audio.wrong();

            // Add cracked/dirt segment
            bridgeSegments.push({ word: question.word, type: 'dirt', placeAnim: 5, landed: false });
            targetPlayerBridgeX = 30 + bridgeSegments.length * BLOCK_SIZE;
        }

        // Check milestones
        if (MILESTONES[total]) {
            const m = MILESTONES[total];
            milestoneText = m.text;
            milestoneTimer = 90;
            gemsEarned += m.gem;
            bridgeFlash = 1;
            Audio.levelUp();

            floatingTexts.push({
                x: 160, y: 70,
                text: `+${m.gem} gems!`,
                color: '#2ecc71',
                life: 1.5, size: 5
            });
        }

        updateHUD();

        setTimeout(() => {
            document.getElementById('question-overlay').classList.remove('active');
            setTimeout(() => nextWord(), 200);
        }, isCorrect ? 500 : 1000);
    }

    function showHUD() {
        const hud = document.getElementById('game-hud');
        hud.style.display = 'flex';
        updateHUD();
    }

    function updateHUD() {
        document.getElementById('hud-score').textContent = correct + '/' + total;
        document.getElementById('streak-count').textContent = streak;
        // Show live WPM with goal
        const minutes = elapsed / 60;
        const liveWPM = minutes > 0.1 ? Math.round(correct / minutes) : 0;
        const goal = SightWords.BENCHMARK_WPM;
        const wpmColor = liveWPM >= goal ? '#2ecc71' : '#fff';
        document.getElementById('hud-xp').innerHTML = `<span style="color:${wpmColor}">${liveWPM} WPM</span> <span style="font-size:0.7em;color:#888">Goal: ${goal}+</span>`;
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
        Progress.recordWPM(wpm, 'sight');
        Progress.addXP(xpEarned);
        Progress.addGems(gemsEarned);
        Progress.recordGameComplete(correct, total, bestStreak);

        showResults(wpm);
    }

    function showResults(wpm) {
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        const meetsGoal = wpm >= SightWords.BENCHMARK_WPM;
        // Require BOTH speed AND accuracy for top stars (FastBridge-aligned)
        // 3 stars: WPM meets benchmark AND 80%+ accuracy
        // 2 stars: WPM meets benchmark OR 70%+ accuracy
        // 1 star: 50%+ accuracy
        let stars = (meetsGoal && accuracy >= 80) ? 3
                  : (meetsGoal || accuracy >= 70) ? 2
                  : accuracy >= 50 ? 1 : 0;
        if (stars < 2 && Progress.consumePowerup('lucky-star')) { stars = 2; Main.showToast('⭐ Lucky Star! 2 stars!'); }

        document.getElementById('results-title').textContent =
            meetsGoal ? 'FastBridge Ready!' : stars >= 2 ? 'Great Bridge!' : stars >= 1 ? 'Good Try!' : 'Keep Practicing!';
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

        if (stars >= 2) {
            Celebration.start(document.getElementById('celebration-canvas'));
        }

        // Populate extras (XP bar, WPM trend)
        Main.populateResultsExtras({
            wordsAttempted: words.slice(0, total),
            wpmType: 'sight',
            wpmGoal: SightWords.BENCHMARK_WPM,
            mode: 'bridge', score: accuracy
        });

        // Check achievements
        const earned = Achievements.checkAfterGame({
            mode: 'bridge', correct, total, bestStreak, stars, wpm,
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
