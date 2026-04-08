/* ============================================
   CRAFTING TABLE — Topic Practice Mode
   Uses full math + reading question banks
   Recipe assembly visuals, crafted item collection
   ============================================ */
const CraftMode = (() => {
    let active = false;
    let topic = null;
    let subject = null;
    let questionCount = 0;
    let correct = 0, total = 0;
    let streak = 0, bestStreak = 0;
    let xpEarned = 0, gemsEarned = 0;
    let missedWords = [];
    let craftedItems = [];
    let floatingTexts = [];
    let craftAnim = 0;
    let craftFlash = 0;
    let recipeSlots = [null, null, null]; // 3 slots for crafting recipe
    let recipeProgress = 0; // 0-3 items in recipe
    let combo = 0, comboTimer = 0;
    let currentCraftItem = null;
    const MAX_QUESTIONS = 15;

    // Craftable items based on streak/progress
    const CRAFT_RECIPES = [
        { name: 'Wooden Sword', type: 'wood', minStreak: 0, gems: 1 },
        { name: 'Stone Pick', type: 'stone', minStreak: 2, gems: 2 },
        { name: 'Iron Helmet', type: 'iron', minStreak: 3, gems: 3 },
        { name: 'Gold Apple', type: 'gold', minStreak: 4, gems: 4 },
        { name: 'Diamond Armor', type: 'diamond', minStreak: 5, gems: 6 }
    ];

    function start(selectedSubject, selectedTopic) {
        subject = selectedSubject;
        topic = selectedTopic;
        active = true;
        questionCount = 0;
        correct = 0; total = 0;
        streak = 0; bestStreak = 0;
        xpEarned = 0; gemsEarned = 0;
        missedWords = [];
        craftedItems = [];
        floatingTexts = [];
        craftAnim = 0;
        craftFlash = 0;
        recipeSlots = [null, null, null];
        recipeProgress = 0;
        combo = 0; comboTimer = 0;
        currentCraftItem = null;

        const canvas = document.getElementById('game-canvas');
        World.init(canvas);
        World.resize(320, 180);

        showHUD();
        World.startLoop(render);

        setTimeout(() => nextQuestion(), 600);
    }

    function render(ctx, W, H, frame) {
        // Background
        if (!World.drawBackground('craft')) {
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(0, 0, W, H);
            // Wooden floor
            for (let x = 0; x < W; x += 16) {
                for (let y = 120; y < H; y += 8) {
                    ctx.fillStyle = (x + y) % 32 < 16 ? '#5d4037' : '#6d4c41';
                    ctx.fillRect(x, y, 16, 8);
                    ctx.strokeStyle = '#4e342e';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(x, y, 16, 8);
                }
            }
            // Crafting table
            const tableX = W / 2 - 24;
            const tableY = 70;
            ctx.fillStyle = '#4e342e';
            ctx.fillRect(tableX + 4, tableY + 32, 4, 16);
            ctx.fillRect(tableX + 40, tableY + 32, 4, 16);
            ctx.fillStyle = '#795548';
            ctx.fillRect(tableX, tableY + 24, 48, 10);
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(tableX + 4, tableY, 40, 24);
            for (let gx = 0; gx < 3; gx++) {
                for (let gy = 0; gy < 2; gy++) {
                    ctx.fillStyle = '#a1887f';
                    ctx.fillRect(tableX + 6 + gx * 13, tableY + 2 + gy * 11, 11, 9);
                }
            }
        }

        // Crafting recipe grid (3x1 on the table)
        const gridX = W / 2 - 24;
        const gridY = 72;
        for (let i = 0; i < 3; i++) {
            const slotX = gridX + 4 + i * 14;
            const slotY = gridY;

            // Slot background
            ctx.fillStyle = recipeSlots[i] ? '#5d4037' : '#3e2723';
            ctx.fillRect(slotX, slotY, 12, 12);
            ctx.strokeStyle = recipeSlots[i] ? '#8d6e63' : '#555';
            ctx.lineWidth = 1;
            ctx.strokeRect(slotX, slotY, 12, 12);

            // Filled slot
            if (recipeSlots[i]) {
                World.drawBlock(slotX + 1, slotY + 1, 10, recipeSlots[i], false);
            } else if (i === recipeProgress) {
                // Blinking empty slot indicator
                const blinkAlpha = 0.3 + Math.sin(frame * 0.06) * 0.3;
                ctx.globalAlpha = blinkAlpha;
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(slotX + 1, slotY + 1, 10, 10);
                ctx.globalAlpha = 1;
            }
        }

        // Arrow from recipe to result
        ctx.fillStyle = '#aaa';
        ctx.fillRect(gridX + 48, gridY + 4, 8, 2);
        ctx.beginPath();
        ctx.moveTo(gridX + 56, gridY + 1);
        ctx.lineTo(gridX + 60, gridY + 5);
        ctx.lineTo(gridX + 56, gridY + 9);
        ctx.closePath();
        ctx.fill();

        // Result slot
        const resultX = gridX + 62;
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(resultX, gridY - 1, 14, 14);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.strokeRect(resultX, gridY - 1, 14, 14);

        if (currentCraftItem && recipeProgress >= 3) {
            // Show crafted item with glow
            const glowAlpha = 0.3 + Math.sin(frame * 0.06) * 0.2;
            ctx.globalAlpha = glowAlpha;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(resultX - 2, gridY - 3, 18, 18);
            ctx.globalAlpha = 1;
            World.drawBlock(resultX + 1, gridY, 12, currentCraftItem.type, false);
        }

        // Craft flash
        if (craftFlash > 0) {
            ctx.globalAlpha = craftFlash * 0.3;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(0, 0, W, H);
            ctx.globalAlpha = 1;
            craftFlash = Math.max(0, craftFlash - 0.04);
        }

        // Crafted items collection (scrolling display)
        if (craftedItems.length > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(0, H - 16, W, 16);
            craftedItems.forEach((item, i) => {
                const ix = 4 + i * 18;
                if (ix < W - 16) {
                    World.drawBlock(ix, H - 14, 12, item.type, false);
                    // Item name (tiny)
                    World.drawText(item.name.split(' ')[0], ix + 6, H - 2, 2, '#aaa', 'center');
                }
            });
        }

        // Character
        const bobY = Math.sin(frame * 0.1) * 1;
        World.drawCharacter(30, 105 + bobY, 16, Progress.get().skin || 'steve', true, true);

        // Draw companion pet
        const petType = Progress.get().pet;
        if (petType) {
            World.drawPet(16, 115 + bobY, 8, petType, frame);
        }

        // Craft animation (arms moving)
        if (craftAnim > 0) {
            craftAnim--;
            const armX = 46 + Math.sin(craftAnim * 0.5) * 4;
            ctx.fillStyle = Progress.get().skin === 'creeper' ? '#5daa3a' :
                Progress.get().skin === 'enderman' ? '#1a1a1a' : '#c8956c';
            ctx.fillRect(armX, 110 + bobY, 3, 6);
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
            comboEl.classList.add('active');
        } else {
            comboEl.classList.remove('active');
        }
        if (comboTimer > 0) { comboTimer--; if (comboTimer <= 0) combo = 0; }

        // Topic label (HTML HUD)
        document.getElementById('hud-mode-label').textContent = getTopicName();
    }

    function getTopicName() {
        if (subject === 'math') {
            const t = MathData.topics.find(t => t.id === topic);
            return t ? t.name : topic;
        }
        const t = ReadingData.topics.find(t => t.id === topic);
        return t ? t.name : topic;
    }

    function nextQuestion() {
        if (!active || questionCount >= MAX_QUESTIONS) {
            endGame();
            return;
        }

        const level = Progress.getTopicLevel(`${subject}-${topic}`);
        let q;

        if (subject === 'math') {
            const raw = MathData.generate(topic, level);
            q = {
                word: raw.question,
                prompt: raw.prompt || raw.question,
                showWord: true,
                speak: false,
                choices: raw.choices,
                correct: raw.correct,
                topic: raw.topic || `math-${topic}`
            };
        } else {
            const raw = ReadingData.generate(topic, level);
            q = {
                word: raw.question,
                prompt: raw.prompt || raw.question,
                showWord: true,
                speak: !!raw.speak,
                choices: raw.choices,
                correct: raw.correct,
                topic: raw.topic || `reading-${topic}`
            };
        }

        showQuestion(q);
        questionCount++;

        if (q.speak) {
            setTimeout(() => Audio.speakWord(q.word), 300);
        }
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
    }

    function handleAnswer(choice, question, clickedBtn, container) {
        if (!active) return;
        container.querySelectorAll('.answer-btn').forEach(b => b.style.pointerEvents = 'none');

        const isCorrect = choice === question.correct;
        const feedbackEl = document.getElementById('question-feedback');

        total++;
        Progress.recordTopic(question.topic, isCorrect);

        if (isCorrect) {
            correct++;
            streak++;
            combo++;
            comboTimer = 180;
            if (streak > bestStreak) bestStreak = streak;
            if (streak === 5 || streak === 10 || streak === 15) Main.celebrateStreak(streak);
            Main.triggerEffects(streak);
            const earned = 10 + Math.min(streak, 5) * 2 + Math.min(combo, 5) * 2;
            xpEarned += earned;

            clickedBtn.classList.add('correct');
            let text = streak >= 3 ? `+${earned} XP! ${streak} streak!` : `+${earned} XP!`;
            feedbackEl.textContent = text;
            feedbackEl.className = 'question-feedback feedback-correct';
            Audio.correct();

            // Add material to recipe slot
            const types = ['wood', 'stone', 'iron', 'gold', 'diamond'];
            const slotType = types[Math.min(4, Math.floor(streak / 2))];
            if (recipeProgress < 3) {
                recipeSlots[recipeProgress] = slotType;
                recipeProgress++;
                craftAnim = 15;
                Audio.blockBreak();
            }

            // Recipe complete — craft an item!
            if (recipeProgress >= 3) {
                const recipe = CRAFT_RECIPES[Math.min(CRAFT_RECIPES.length - 1, Math.floor(streak / 2))];
                currentCraftItem = recipe;
                craftFlash = 1;
                gemsEarned += recipe.gems;
                Audio.levelUp();

                floatingTexts.push({
                    x: 240, y: 70,
                    text: `Crafted: ${recipe.name}!`,
                    color: '#FFD700',
                    life: 2, size: 4
                });
                floatingTexts.push({
                    x: 240, y: 85,
                    text: `+${recipe.gems} gems!`,
                    color: '#2ecc71',
                    life: 1.5, size: 3
                });

                craftedItems.push(recipe);

                // Reset recipe after delay
                setTimeout(() => {
                    recipeSlots = [null, null, null];
                    recipeProgress = 0;
                    currentCraftItem = null;
                }, 1000);
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

            // Reset recipe on wrong
            recipeSlots = [null, null, null];
            recipeProgress = 0;
            currentCraftItem = null;
        }

        updateHUD();

        setTimeout(() => {
            document.getElementById('question-overlay').classList.remove('active');
            setTimeout(() => nextQuestion(), 400);
        }, isCorrect ? 800 : 1500);
    }

    function showHUD() {
        const hud = document.getElementById('game-hud');
        hud.style.display = 'flex';
        updateHUD();
    }

    function updateHUD() {
        document.getElementById('hud-score').textContent = correct;
        document.getElementById('streak-count').textContent = streak;
        document.getElementById('hud-xp').textContent = `XP: +${xpEarned}`;
    }

    function endGame() {
        active = false;
        World.stopLoop();
        document.getElementById('question-overlay').classList.remove('active');
        document.getElementById('game-hud').style.display = 'none';

        Progress.addXP(xpEarned);
        Progress.addGems(gemsEarned);
        Progress.recordGameComplete(correct, total, bestStreak);

        showResults();
    }

    function showResults() {
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        let stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
        if (stars < 2 && Progress.consumePowerup('lucky-star')) { stars = 2; Main.showToast('⭐ Lucky Star! 2 stars!'); }

        document.getElementById('results-title').textContent =
            stars >= 3 ? 'Master Crafter!' : stars >= 2 ? 'Great Crafting!' : stars >= 1 ? 'Good Try!' : 'Keep Practicing!';
        document.getElementById('stat-correct').textContent = correct;
        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-accuracy').textContent = accuracy + '%';
        document.getElementById('stat-xp').textContent = '+' + xpEarned;
        document.getElementById('stat-streak').textContent = bestStreak;
        document.getElementById('stat-wpm-row').style.display = 'none';

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
        if (missedWords.length > 0) {
            missedEl.style.display = 'block';
            missedList.innerHTML = '';
            [...new Set(missedWords)].forEach(w => {
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

        // Populate extras (XP bar)
        Main.populateResultsExtras({ mode: 'craft', score: accuracy });

        // Check achievements
        const earned = Achievements.checkAfterGame({
            mode: 'craft', correct, total, bestStreak, stars,
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
        World.stopLoop();
    }

    return { start, stop };
})();
