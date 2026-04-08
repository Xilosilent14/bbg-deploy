/* ============================================
   SURVIVAL MODE — Fight Mobs with Words
   Mobs walk toward player, answer to attack
   Boss mobs at wave 5, health drops, combos
   ============================================ */
const SurvivalMode = (() => {
    let active = false;
    let correct = 0, total = 0;
    let streak = 0, bestStreak = 0;
    let xpEarned = 0, gemsEarned = 0;
    let missedWords = [];
    let health = 5;
    let mobHealth = 3;
    let mobMaxHealth = 3;
    let wave = 0;
    let currentMob = null;
    let mobX = 0, targetMobX = 0;
    let mobShake = 0;
    let playerAttack = 0;
    let playerHurt = 0;
    let floatingTexts = [];
    let drops = [];
    let screenShake = 0;
    let isBoss = false;
    let defeatAnim = 0;
    let spawnAnim = 0;
    let combo = 0;
    let comboTimer = 0;
    let hadComeback = false;
    let comebackTracker = 0;
    let bossIntro = false;
    let bossIntroTimer = 0;
    const MAX_WAVES = 5;
    const MOBS = ['zombie', 'skeleton', 'creeper', 'enderman', 'octorok', 'keese', 'dekuscrub'];
    const BOSS_MOBS = ['enderman', 'ganondorf', 'enderdragon', 'wither'];
    const DISPLAY_NAMES = {
        zombie: 'Zombie',
        skeleton: 'Skeleton',
        creeper: 'Creeper',
        enderman: 'Enderman',
        octorok: 'Octorok',
        keese: 'Keese',
        dekuscrub: 'Deku Scrub',
        ganondorf: 'Ganondorf',
        enderdragon: 'Ender Dragon',
        wither: 'Wither'
    };

    function start() {
        active = true;
        correct = 0; total = 0;
        streak = 0; bestStreak = 0;
        xpEarned = 0; gemsEarned = 0;
        missedWords = [];
        health = 5;
        wave = 0;
        playerAttack = 0;
        playerHurt = 0;
        floatingTexts = [];
        drops = [];
        screenShake = 0;
        combo = 0; comboTimer = 0;
        hadComeback = false; comebackTracker = 0;
        defeatAnim = 0;
        spawnAnim = 0;
        bossIntro = false;
        bossIntroTimer = 0;

        const canvas = document.getElementById('game-canvas');
        World.init(canvas);
        World.resize(320, 180);

        showHUD();
        World.startLoop(render);

        setTimeout(() => spawnMob(), 800);
    }

    function render(ctx, W, H, frame) {
        // Screen shake
        if (screenShake > 0) {
            ctx.save();
            ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
            screenShake *= 0.85;
            if (screenShake < 0.5) screenShake = 0;
        }

        // Background — survival always uses cave theme (dungeon feel)
        const survivalBiome = 'cave';
        if (!World.drawBackground(survivalBiome)) {
            World.drawSky(survivalBiome);
            World.drawGround(survivalBiome, 140);
            for (let i = 0; i < 4; i++) {
                const tx = 30 + i * 80;
                ctx.fillStyle = '#8B5E3C';
                ctx.fillRect(tx, 80, 3, 20);
                const flicker = Math.sin(frame * 0.1 + i) * 2;
                ctx.fillStyle = '#ff6b00';
                ctx.fillRect(tx - 1, 76 + flicker, 5, 5);
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(tx, 77 + flicker, 3, 3);
            }
        }

        // Lava pools at bottom for atmosphere
        for (let x = 0; x < W; x += 40) {
            const lavaY = 158 + Math.sin(frame * 0.05 + x * 0.1) * 2;
            ctx.fillStyle = '#FF4500';
            ctx.fillRect(x + 5, lavaY, 15, 22 - lavaY + 158);
            ctx.fillStyle = '#FF6B2B';
            ctx.fillRect(x + 7, lavaY + 1, 11, 2);
        }

        // Player character
        const bobY = Math.sin(frame * 0.1) * 1;
        const hurtFlash = playerHurt > 0 && frame % 4 < 2;
        if (!hurtFlash) {
            const attackOffset = playerAttack > 0 ? Math.sin(playerAttack * 0.5) * 10 : 0;
            World.drawCharacter(60 + attackOffset, 118 + bobY, 18, Progress.get().skin || 'steve', true, true);

            // Draw companion pet
            const petType = Progress.get().pet;
            if (petType) {
                World.drawPet(42, 130 + bobY, 9, petType, frame);
            }

            // Sword
            if (playerAttack > 0) {
                playerAttack--;
                ctx.save();
                ctx.translate(80 + attackOffset, 116 + bobY);
                ctx.rotate(-0.5 + Math.sin(playerAttack * 0.4) * 1.2);
                // Blade
                ctx.fillStyle = '#D8D8D8';
                ctx.fillRect(-1, -12, 3, 12);
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, -11, 1, 3);
                // Guard
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(-3, -1, 7, 2);
                // Handle
                ctx.fillStyle = '#8B5E3C';
                ctx.fillRect(-1, 1, 3, 5);
                ctx.restore();
            } else {
                // Idle sword
                ctx.fillStyle = '#D8D8D8';
                ctx.fillRect(78, 126 + bobY, 2, 8);
                ctx.fillStyle = '#8B5E3C';
                ctx.fillRect(76, 134 + bobY, 6, 3);
            }
        }
        if (playerHurt > 0) playerHurt--;

        // Mob
        if (currentMob) {
            // Mob walks toward player
            if (mobX > targetMobX) {
                mobX -= 0.3;
            }

            const shake = mobShake > 0 ? (Math.random() - 0.5) * 6 : 0;
            if (mobShake > 0) mobShake--;

            // Spawn animation (grow in)
            let mobScale = 1;
            if (spawnAnim > 0) {
                mobScale = 1 - spawnAnim / 20;
                spawnAnim--;
            }

            // Defeat animation
            if (defeatAnim > 0) {
                ctx.globalAlpha = defeatAnim / 20;
                mobScale = 1 + (20 - defeatAnim) * 0.05;
            }

            const mobSize = Math.floor(20 * mobScale * (isBoss ? 1.5 : 1));
            const mobDrawX = mobX + shake;
            const mobDrawY = (isBoss ? 108 : 116) + bobY * 0.5;
            World.drawMob(mobDrawX, mobDrawY, mobSize, currentMob);

            // Boss crown
            if (isBoss && defeatAnim <= 0) {
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(mobDrawX + mobSize / 2 - 5, mobDrawY - 6, 10, 3);
                ctx.fillRect(mobDrawX + mobSize / 2 - 4, mobDrawY - 9, 2, 3);
                ctx.fillRect(mobDrawX + mobSize / 2 - 1, mobDrawY - 9, 2, 3);
                ctx.fillRect(mobDrawX + mobSize / 2 + 2, mobDrawY - 9, 2, 3);
            }

            if (defeatAnim > 0) {
                defeatAnim--;
                ctx.globalAlpha = 1;
            }

            // Mob health bar
            if (defeatAnim <= 0) {
                const barW = isBoss ? 40 : 24;
                const barX = mobDrawX + mobSize / 2 - barW / 2;
                ctx.fillStyle = '#333';
                ctx.fillRect(barX, mobDrawY - 8, barW, 4);
                const healthPct = mobHealth / mobMaxHealth;
                ctx.fillStyle = healthPct > 0.5 ? '#2ecc71' : healthPct > 0.25 ? '#f39c12' : '#e94560';
                ctx.fillRect(barX, mobDrawY - 8, barW * healthPct, 4);

                // Mob name (HTML overlay for crisp text)
                const mobNameEl = document.getElementById('mob-name-overlay');
                const displayName = DISPLAY_NAMES[currentMob] || currentMob;
                const mobName = isBoss ? `BOSS ${displayName.toUpperCase()}` : displayName;
                mobNameEl.textContent = mobName;
                mobNameEl.className = 'mob-name-overlay pixel-text active' + (isBoss ? ' boss' : '');
                // Convert canvas coords to viewport %
                const canvas = document.getElementById('game-canvas');
                const cRect = canvas.getBoundingClientRect();
                const vpX = cRect.left + ((mobDrawX + mobSize / 2) / W) * cRect.width;
                const vpY = cRect.top + ((mobDrawY - 16) / H) * cRect.height;
                mobNameEl.style.left = vpX + 'px';
                mobNameEl.style.top = vpY + 'px';
            }
        }

        // Health drops
        drops = drops.filter(d => {
            d.y += d.vy;
            d.vy += 0.08;
            d.x += d.vx;
            d.life--;
            if (d.life <= 0) return false;

            if (d.y > 140) { d.y = 140; d.vy = -d.vy * 0.3; }

            ctx.globalAlpha = Math.min(1, d.life / 20);
            if (d.type === 'heart') {
                ctx.fillStyle = '#e94560';
                // Simple heart shape
                ctx.fillRect(d.x - 2, d.y - 1, 2, 3);
                ctx.fillRect(d.x + 1, d.y - 1, 2, 3);
                ctx.fillRect(d.x - 1, d.y + 2, 3, 1);
                ctx.fillRect(d.x, d.y + 3, 1, 1);
                ctx.fillStyle = '#ff8a8a';
                ctx.fillRect(d.x - 1, d.y, 1, 1);
            } else if (d.type === 'gem') {
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath();
                ctx.moveTo(d.x, d.y - 3);
                ctx.lineTo(d.x + 3, d.y);
                ctx.lineTo(d.x, d.y + 3);
                ctx.lineTo(d.x - 3, d.y);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = d.color || '#888';
                ctx.fillRect(d.x - 2, d.y - 2, 4, 4);
            }
            ctx.globalAlpha = 1;
            return true;
        });

        // Floating texts
        floatingTexts = floatingTexts.filter(t => {
            t.y -= 0.5;
            t.life -= 0.02;
            if (t.life <= 0) return false;
            ctx.globalAlpha = t.life;
            World.drawText(t.text, t.x, t.y, t.size || 4, t.color, 'center');
            ctx.globalAlpha = 1;
            return true;
        });

        // Boss intro overlay
        if (bossIntro) {
            bossIntroTimer--;
            // Darken screen
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, W, H);

            const bossName = (DISPLAY_NAMES[currentMob] || currentMob).toUpperCase();

            // "BOSS WAVE!" subtitle
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('BOSS WAVE!', W / 2, H / 2 - 20);

            // Boss name - large, pulsing red/yellow
            const pulse = Math.sin(frame * 0.08) * 0.5 + 0.5;
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.fillStyle = pulse > 0.5 ? '#e94560' : '#FFD700';
            ctx.fillText(bossName, W / 2, H / 2 + 5);

            // Reset text align
            ctx.textAlign = 'left';

            if (bossIntroTimer <= 0) {
                bossIntro = false;
            }
        }

        // Combo display (HTML overlay)
        const comboEl = document.getElementById('combo-overlay');
        if (combo >= 2) {
            comboEl.textContent = `${combo}x COMBO!`;
            comboEl.classList.add('active');
        } else {
            comboEl.classList.remove('active');
        }
        if (comboTimer > 0) {
            comboTimer--;
            if (comboTimer <= 0) combo = 0;
        }

        // Wave indicator (HTML HUD)
        document.getElementById('hud-mode-label').textContent = `Wave ${wave}/${MAX_WAVES}`;

        // Player health on canvas (hearts)
        for (let i = 0; i < 5; i++) {
            if (i < health) {
                ctx.fillStyle = '#e94560';
                ctx.fillRect(10 + i * 12, 158, 8, 8);
                ctx.fillStyle = '#ff8a8a';
                ctx.fillRect(11 + i * 12, 159, 2, 2);
            } else {
                ctx.fillStyle = '#333';
                ctx.fillRect(10 + i * 12, 158, 8, 8);
            }
        }

        if (screenShake > 0) ctx.restore();
    }

    function spawnMob() {
        if (!active || wave >= MAX_WAVES) {
            endGame(health > 0);
            return;
        }

        wave++;
        isBoss = wave === MAX_WAVES;

        if (isBoss) {
            currentMob = BOSS_MOBS[Math.floor(Math.random() * BOSS_MOBS.length)];
            mobMaxHealth = 6;
            mobHealth = 6;
        } else {
            currentMob = MOBS[Math.floor(Math.random() * MOBS.length)];
            mobMaxHealth = 3 + Math.floor(wave / 2);
            mobHealth = mobMaxHealth;
        }

        mobX = 280;
        targetMobX = isBoss ? 160 : 180;
        mobShake = 0;
        spawnAnim = 20;
        defeatAnim = 0;

        // Boss entrance
        if (isBoss) {
            screenShake = 10;
            bossIntro = true;
            bossIntroTimer = 90;
            Audio.bossAppear();
        } else {
            // Wave announcement
            floatingTexts.push({
                x: 160, y: 60,
                text: `Wave ${wave}!`,
                color: wave >= 4 ? '#e94560' : '#FFD700',
                life: 1.8, size: 7
            });
        }

        setTimeout(() => nextQuestion(), isBoss ? 2000 : 600);
    }

    function nextQuestion() {
        if (!active || health <= 0) {
            endGame(false);
            return;
        }
        if (mobHealth <= 0) {
            // Mob defeated
            defeatAnim = 20;
            Audio.mobDefeat();
            Audio.blockBreak();

            // Spawn death particle explosion — colors match the mob type
            const deathX = mobX + 10;
            const deathY = isBoss ? 118 : 126;
            const mobColors = {
                zombie: ['#5a8a5a', '#3b8ed0', '#2b6b2b'],
                skeleton: ['#d8d8d8', '#c8c8c8', '#aaaaaa'],
                creeper: ['#5daa3a', '#3a7232', '#82d962'],
                enderman: ['#1a1a1a', '#cc44ff', '#333333'],
                octorok: ['#cc3333', '#ff5555', '#992222'],
                keese: ['#2a2a3a', '#ff4444', '#444466'],
                dekuscrub: ['#5a8a3a', '#7a5a2a', '#8ab35a'],
                ganondorf: ['#6a4a2a', '#2a2a2a', '#ff2222'],
                enderdragon: ['#1a1a2a', '#cc44ff', '#3a3a5a'],
                wither: ['#2a2a2a', '#1a1a1a', '#555555']
            };
            const burstColors = mobColors[currentMob] || ['#888', '#aaa', '#666'];
            const burstCount = isBoss ? 14 : 10;
            burstColors.forEach(c => World.addParticle(deathX, deathY, c, Math.ceil(burstCount / burstColors.length)));
            World.addParticle(deathX, deathY, '#ffffff', 3);

            // XP and gem rewards
            const waveBonus = isBoss ? 50 : 20 + wave * 5;
            xpEarned += waveBonus;

            floatingTexts.push({
                x: deathX, y: 100,
                text: `+${waveBonus} XP!`,
                color: '#4AEDD9',
                life: 1.5, size: 5
            });

            // Gem drops
            const gemCount = isBoss ? 5 : Math.floor(Math.random() * 2) + 1;
            gemsEarned += gemCount;
            for (let i = 0; i < gemCount; i++) {
                drops.push({
                    x: deathX + (Math.random() - 0.5) * 30,
                    y: 120,
                    vx: (Math.random() - 0.5) * 3,
                    vy: -Math.random() * 4 - 2,
                    type: 'gem',
                    life: 60
                });
            }

            // Health drop chance (30% for normal, 50% for boss)
            if (health < 5 && Math.random() < (isBoss ? 0.5 : 0.3)) {
                drops.push({
                    x: deathX + (Math.random() - 0.5) * 20,
                    y: 115,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -3,
                    type: 'heart',
                    life: 80
                });
                health = Math.min(5, health + 1);
                floatingTexts.push({
                    x: deathX, y: 90,
                    text: '+1 HP!',
                    color: '#e94560',
                    life: 1.2, size: 4
                });
            }

            setTimeout(() => {
                currentMob = null;
                setTimeout(() => spawnMob(), 600);
            }, 800);
            return;
        }

        // Mob approaching — hurry up indicator (faster in later waves for tension)
        const approachSpeed = 3 + wave * 1.5;
        if (targetMobX > 120) targetMobX -= approachSpeed;

        // Generate question
        let q;
        if (Math.random() < 0.5) {
            const word = SightWords.getPracticeSet(1)[0];
            q = SightWords.generateQuestion(word);
        } else {
            const word = NonsenseWords.getPracticeSet(1)[0];
            q = NonsenseWords.generateQuestion(word);
        }

        showQuestion(q);

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
        if (question.topic === 'sight-words') {
            Progress.recordSightWord(question.word, isCorrect);
        } else {
            Progress.recordNonsenseWord(isCorrect, question.word);
        }

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
            let text = `Hit! +${earned} XP!`;
            if (combo >= 3) text = `${combo}x! +${earned} XP!`;
            feedbackEl.textContent = text;
            feedbackEl.className = 'question-feedback feedback-correct';
            Audio.correct();
            Audio.mobHit();

            // Attack mob
            mobHealth--;
            mobShake = 12;
            playerAttack = 20;
            screenShake = 2;

            // Damage number on mob
            floatingTexts.push({
                x: mobX + 10, y: 110,
                text: `-${1 + Math.floor(combo / 3)}`,
                color: '#e94560',
                life: 1, size: 5
            });
        } else {
            streak = 0;
            combo = 0;
            comboTimer = 0;
            health--;
            missedWords.push(question.word);
            clickedBtn.classList.add('wrong');
            container.querySelectorAll('.answer-btn').forEach(b => {
                if (b.textContent === question.correct) b.classList.add('correct');
            });
            feedbackEl.textContent = Main.getEncourageMsg(question.correct);
            feedbackEl.className = 'question-feedback feedback-wrong';
            Audio.wrong();

            playerHurt = 20;
            screenShake = 3;

            // Damage text on player
            floatingTexts.push({
                x: 70, y: 110,
                text: '-1 HP',
                color: '#e94560',
                life: 1, size: 4
            });
        }

        // Comeback tracking
        if (isCorrect) {
            if (comebackTracker > 0) comebackTracker++;
            if (comebackTracker >= 4) hadComeback = true;
        } else {
            comebackTracker = 1;
        }

        updateHUD();

        setTimeout(() => {
            document.getElementById('question-overlay').classList.remove('active');
            setTimeout(() => nextQuestion(), 400);
        }, isCorrect ? 600 : 1200);
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

        const heartsEl = document.getElementById('hud-hearts');
        heartsEl.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const h = document.createElement('div');
            h.className = i < health ? 'heart' : 'heart empty';
            heartsEl.appendChild(h);
        }
    }

    function endGame(won) {
        active = false;
        World.stopLoop();
        document.getElementById('question-overlay').classList.remove('active');
        document.getElementById('game-hud').style.display = 'none';
        const mobOverlay = document.getElementById('mob-name-overlay');
        if (mobOverlay) mobOverlay.style.display = 'none';

        Progress.addXP(xpEarned);
        Progress.addGems(gemsEarned);
        Progress.recordGameComplete(correct, total, bestStreak);

        showResults(won);
    }

    function showResults(won) {
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        let stars = won ? (accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1) : 0;
        if (stars < 2 && Progress.consumePowerup('lucky-star')) { stars = 2; Main.showToast('⭐ Lucky Star! 2 stars!'); }

        document.getElementById('results-title').textContent =
            won ? (stars >= 3 ? 'Legendary Warrior!' : 'You Survived!') : 'Defeated...';
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

        // Populate extras (XP bar)
        Main.populateResultsExtras({ mode: 'survival', score: accuracy });

        // Check achievements
        const earned = Achievements.checkAfterGame({
            mode: 'survival', correct, total, bestStreak, stars,
            won, hadComeback
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
