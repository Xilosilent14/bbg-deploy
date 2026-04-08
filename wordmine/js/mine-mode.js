/* ============================================
   MINE MODE — Interactive Block Mining Gameplay
   Click blocks to mine, answer questions to break,
   collect gems and ores, walk between blocks
   ============================================ */
const MineMode = (() => {
    let active = false;
    let blocks = [];
    let playerX = 0, playerY = 0, targetPlayerX = 0;
    let score = 0, streak = 0, bestStreak = 0;
    let correct = 0, total = 0;
    let currentQuestion = null;
    let activeBlock = null;
    let xpEarned = 0;
    let gemsEarned = 0;
    let missedWords = [];
    let wordsAttempted = [];
    let blockSize = 20;
    let groundY = 0;
    let scrollX = 0, targetScrollX = 0;
    let biome = 'plains';
    let questionCount = 0;
    let drops = []; // Falling gem/ore drops
    let floatingTexts = []; // +XP, +Gem floating text
    let combo = 0;
    let comboTimer = 0;
    let miningProgress = 0; // 0-3 hits to break
    let pickSwing = 0;
    let screenShake = 0;
    let itemsCollected = { wood: 0, stone: 0, iron: 0, gold: 0, diamond: 0, emerald: 0 };
    let canvas = null;
    let clickHandler = null;
    let touchHandler = null;
    let keyHandler = null;
    let dailyMultiplier = 1;
    let hadComeback = false;
    let comebackTracker = 0; // tracks correct-after-wrong sequence
    const MAX_QUESTIONS = 15;
    const HITS_TO_BREAK = 2;

    function start(selectedBiome) {
        biome = selectedBiome || Progress.get().world || 'plains';
        active = true;
        score = 0; streak = 0; bestStreak = 0;
        correct = 0; total = 0; xpEarned = 0; gemsEarned = 0;
        missedWords = [];
        wordsAttempted = [];
        questionCount = 0;
        scrollX = 0; targetScrollX = 0;
        drops = [];
        floatingTexts = [];
        combo = 0; comboTimer = 0;
        hadComeback = false; comebackTracker = 0;
        miningProgress = 0;
        pickSwing = 0;
        screenShake = 0;
        activeBlock = null;
        currentQuestion = null;
        // dailyMultiplier is set externally via setDailyMultiplier() before start()
        itemsCollected = { wood: 0, stone: 0, iron: 0, gold: 0, diamond: 0, emerald: 0 };

        canvas = document.getElementById('game-canvas');
        World.init(canvas);
        World.resize(320, 180);
        groundY = 140;
        blockSize = 22;
        playerX = 30;
        targetPlayerX = 30;
        playerY = groundY - 18;

        generateBlocks();
        showHUD();
        World.startLoop(render);

        // Add click/tap handler for mining blocks
        clickHandler = (e) => handleCanvasClick(e);
        touchHandler = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleCanvasClick(touch);
        };
        canvas.addEventListener('click', clickHandler);
        canvas.addEventListener('touchstart', touchHandler, { passive: false });

        // Keyboard shortcuts: 1-4 for answers, space for hear
        keyHandler = (e) => handleKeyPress(e);
        document.addEventListener('keydown', keyHandler);

        // Brief intro then highlight first block
        setTimeout(() => highlightNextBlock(), 800);
    }

    function generateBlocks() {
        blocks = [];
        const words = SightWords.getPracticeSet(MAX_QUESTIONS);
        const blockTypes = ['dirt', 'stone', 'iron', 'gold', 'diamond'];

        words.forEach((word, i) => {
            const mastery = Progress.getSightWordMastery(word);
            let type = 'dirt';
            if (mastery === 'mastered') type = blockTypes[Math.min(4, Math.floor(Math.random() * 3) + 2)];
            else if (mastery === 'learning') type = blockTypes[Math.floor(Math.random() * 3) + 1];

            // Stagger blocks at different heights for visual interest
            const row = Math.floor(i / 5);
            const col = i % 5;
            blocks.push({
                x: 60 + col * 60,
                y: groundY - blockSize - 10 - row * 45 - Math.floor(Math.random() * 8),
                type,
                word,
                mined: false,
                cracking: 0, // 0-3
                highlight: false,
                shakeX: 0,
                shakeY: 0,
                scale: 1,
                dropType: getDropForBlockType(type)
            });
        });
    }

    function getDropForBlockType(type) {
        switch (type) {
            case 'diamond': return { item: 'diamond', gem: 3, color: '#4AEDD9' };
            case 'gold': return { item: 'gold', gem: 2, color: '#FFD700' };
            case 'iron': return { item: 'iron', gem: 1, color: '#D8D8D8' };
            case 'stone': return { item: 'stone', gem: 1, color: '#7f7f7f' };
            default: return { item: 'wood', gem: 0, color: '#8B5E3C' };
        }
    }

    function handleKeyPress(e) {
        if (!active) return;

        // Space bar = tap highlighted block (when no question showing)
        if (e.key === ' ' && !currentQuestion) {
            e.preventDefault();
            const highlighted = blocks.find(b => b.highlight && !b.mined);
            if (highlighted) mineBlock(highlighted);
            return;
        }

        // Number keys 1-4 select answer buttons when question is showing
        if (currentQuestion && ['1', '2', '3', '4'].includes(e.key)) {
            e.preventDefault();
            const idx = parseInt(e.key) - 1;
            const btns = document.querySelectorAll('#answer-buttons .answer-btn');
            if (btns[idx] && btns[idx].style.pointerEvents !== 'none') {
                btns[idx].click();
            }
            return;
        }

        // R key = replay audio for current question
        if (e.key === 'r' && currentQuestion) {
            e.preventDefault();
            const wordEl = document.getElementById('question-word');
            const actualWord = wordEl.dataset.word || wordEl.textContent;
            if (actualWord && actualWord !== '?') Audio.speakWord(actualWord);
            return;
        }
    }

    function handleCanvasClick(e) {
        if (!active || currentQuestion) return;

        // Get click position in canvas coordinates
        const rect = canvas.getBoundingClientRect();
        const scaleX = 320 / rect.width;
        const scaleY = 180 / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;

        // Check if clicked on any block (expanded hit area includes label above)
        // Padding makes it more forgiving for young children on touch devices
        const padX = 6;
        const padTop = 18; // Covers word label + TAP indicator above block
        const padBottom = 4;
        for (const b of blocks) {
            if (b.mined || !b.highlight) continue;
            const bx = b.x - scrollX;
            if (cx >= bx - padX && cx <= bx + blockSize + padX &&
                cy >= b.y - padTop && cy <= b.y + blockSize + padBottom) {
                mineBlock(b);
                return;
            }
        }
    }

    function mineBlock(block) {
        // Swing pickaxe
        pickSwing = 15;
        Audio.blockBounce();

        // Block shake effect
        block.shakeX = (Math.random() - 0.5) * 4;
        block.shakeY = (Math.random() - 0.5) * 2;
        setTimeout(() => { block.shakeX = 0; block.shakeY = 0; }, 150);

        // Add crack particles — tiny pops on each tap
        const bx = block.x - scrollX;
        const bcx = bx + blockSize / 2;
        const bcy = block.y + blockSize / 2;
        World.addParticle(bcx, bcy, World.BLOCK_COLORS[block.type] || '#888', 3);
        // Extra small particle pops near the hit point
        for (let i = 0; i < 2; i++) {
            floatingTexts.push({
                x: bcx + (Math.random() - 0.5) * blockSize * 0.6,
                y: bcy + (Math.random() - 0.5) * blockSize * 0.4,
                text: '.',
                color: World.BLOCK_COLORS[block.type] || '#888',
                life: 0.4, size: 3
            });
        }

        block.cracking++;

        if (block.cracking >= HITS_TO_BREAK) {
            // Block is ready to break — show the question
            activeBlock = block;
            currentQuestion = SightWords.generateQuestion(block.word);
            showQuestion(currentQuestion);
            questionCount++;

            if (currentQuestion.speak) {
                setTimeout(() => Audio.speakWord(currentQuestion.word), 300);
            }
        }
    }

    function highlightNextBlock() {
        if (!active) return;
        const remaining = blocks.filter(b => !b.mined);
        if (remaining.length === 0) {
            endGame();
            return;
        }

        // Highlight the next unmined block
        blocks.forEach(b => b.highlight = false);
        remaining[0].highlight = true;

        // Walk player toward the block
        targetPlayerX = Math.max(20, remaining[0].x - scrollX - 30);

        // Scroll to show the block
        targetScrollX = Math.max(0, remaining[0].x - 120);
    }

    function render(ctx, W, H, frame) {
        // Screen shake
        if (screenShake > 0) {
            ctx.save();
            ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
            screenShake *= 0.85;
            if (screenShake < 0.5) screenShake = 0;
        }

        // Background
        if (!World.drawBackground(biome)) {
            World.drawSky(biome);
            World.drawGround(biome, groundY);
            if (biome === 'plains' || biome === 'forest') {
                World.drawTree(20 - scrollX % 200, groundY);
                World.drawTree(180 - scrollX % 200, groundY);
            }
        }

        // Smooth scroll
        scrollX += (targetScrollX - scrollX) * 0.1;

        // Draw blocks
        blocks.forEach(b => {
            if (b.mined) return;
            const bx = b.x - scrollX + (b.shakeX || 0);
            const by = b.y + (b.shakeY || 0);
            if (bx < -blockSize || bx > W + blockSize) return;

            // Draw block with size pulse on highlight
            const drawSize = b.highlight ? blockSize + Math.sin(frame * 0.06) * 1.5 : blockSize;
            const drawX = bx - (drawSize - blockSize) / 2;
            const drawY = by - (drawSize - blockSize) / 2;
            World.drawBlock(drawX, drawY, drawSize, b.type, b.highlight);

            // Word label ABOVE block (readable size)
            if (b.word) {
                const fontSize = b.word.length > 5 ? 6 : 8;
                // Dark background behind text for readability
                const textW = b.word.length * (fontSize * 0.8);
                const textX = bx + blockSize / 2;
                const textY = by - fontSize - 4;
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(textX - textW / 2 - 3, textY - 2, textW + 6, fontSize + 4);
                World.drawText(b.word, textX, textY, fontSize, '#fff', 'center');
            }

            // Cracking overlay — Minecraft-style progressive cracks
            if (b.cracking > 0) {
                ctx.save();
                ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                ctx.lineWidth = 2;
                const cx = bx + blockSize / 2;
                const cy = by + blockSize / 2;
                const hs = blockSize / 2;
                // Use block position as seed for consistent crack pattern
                const seed = (b.x * 7 + b.y * 13) % 100;

                if (b.cracking === 1) {
                    // Stage 1: small diagonal cracks from center
                    ctx.beginPath();
                    ctx.moveTo(cx - 2, cy - 2);
                    ctx.lineTo(cx - hs * 0.5, cy - hs * 0.4);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(cx + 1, cy + 1);
                    ctx.lineTo(cx + hs * 0.4, cy + hs * 0.5);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(cx + 2, cy - 1);
                    ctx.lineTo(cx + hs * 0.3, cy - hs * 0.45);
                    ctx.stroke();
                } else {
                    // Stage 2: large web of cracks covering most of the block
                    // Main cross cracks
                    ctx.beginPath();
                    ctx.moveTo(bx + 2, by + 3);
                    ctx.lineTo(cx - 1, cy + 1);
                    ctx.lineTo(bx + blockSize - 3, by + blockSize - 2);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(bx + blockSize - 2, by + 2);
                    ctx.lineTo(cx + 1, cy - 1);
                    ctx.lineTo(bx + 3, by + blockSize - 3);
                    ctx.stroke();
                    // Branch cracks
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(cx, by + 1);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(cx + hs * 0.6, cy + hs * 0.8);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(cx - hs * 0.3, cy + hs * 0.2);
                    ctx.lineTo(bx + 1, cy + hs * 0.5);
                    ctx.stroke();
                    // Dark overlay to show block is about to break
                    ctx.fillStyle = 'rgba(0,0,0,0.15)';
                    ctx.fillRect(bx, by, blockSize, blockSize);
                }
                ctx.restore();
            }

            // Highlight glow
            if (b.highlight) {
                ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(frame * 0.05) * 0.3})`;
                ctx.lineWidth = 2;
                ctx.strokeRect(drawX - 1, drawY - 1, drawSize + 2, drawSize + 2);

                // "TAP!" indicator for highlighted block with remaining hits
                if (!currentQuestion) {
                    const tapAlpha = 0.6 + Math.sin(frame * 0.06) * 0.4;
                    ctx.globalAlpha = tapAlpha;
                    const hitsLeft = HITS_TO_BREAK - (b.cracking || 0);
                    const tapText = hitsLeft > 1 ? `TAP x${hitsLeft}` : 'TAP!';
                    World.drawText(tapText, bx + blockSize / 2, by - 14, 4, '#FFD700', 'center');
                    ctx.globalAlpha = 1;
                }
            }
        });

        // Smooth player walk
        playerX += (targetPlayerX - playerX) * 0.08;

        // Player character
        const walkCycle = Math.abs(playerX - targetPlayerX) > 1;
        const bobY = walkCycle ? Math.sin(frame * 0.12) * 1.5 : Math.sin(frame * 0.04) * 0.5;
        const legAnim = walkCycle ? Math.sin(frame * 0.12) * 2 : 0;
        World.drawCharacter(playerX, playerY + bobY, 18, Progress.get().skin || 'steve', true, true);

        // Draw companion pet
        const petType = Progress.get().pet;
        if (petType) {
            World.drawPet(playerX - 14, playerY + 6, 10, petType, frame);
        }

        // Pickaxe — use sprite if available, fall back to canvas primitives
        if (pickSwing > 0) pickSwing--;
        const swingOffset = pickSwing > 0 ? Math.sin(pickSwing * 0.5) * 4 : 0;
        const idleFloat = Math.sin(frame * 0.05) * 0.5;
        const pickSpriteName = getToolSpriteName();
        const pickDrawn = typeof Sprites !== 'undefined' && Sprites.has(pickSpriteName) && (() => {
            const pickSize = 14;
            const pickX = playerX + 14;
            const pickY = playerY - 2 + bobY + idleFloat - swingOffset;
            return Sprites.draw(ctx, pickSpriteName, pickX, pickY, pickSize);
        })();
        if (!pickDrawn) {
            // Fallback: canvas primitive pickaxe
            const swingAngle = pickSwing > 0 ? Math.sin((pickSwing + 1) * 0.5) * 0.8 : Math.sin(frame * 0.05) * 0.1;
            const toolX = playerX + 16;
            const toolY = playerY + 4 + bobY;
            ctx.save();
            ctx.translate(toolX, toolY);
            ctx.rotate(swingAngle);
            ctx.fillStyle = getToolColor();
            ctx.fillRect(-1, -6, 4, 4);
            ctx.fillRect(2, -4, 3, 2);
            ctx.fillStyle = '#8B5E3C';
            ctx.fillRect(0, -2, 2, 10);
            ctx.restore();
        }

        // Falling drops
        drops = drops.filter(d => {
            d.y += d.vy;
            d.vy += 0.15;
            d.x += d.vx;
            d.life--;
            if (d.life <= 0) return false;

            // Bounce on ground
            if (d.y > groundY - 4) {
                d.y = groundY - 4;
                d.vy = -d.vy * 0.4;
                if (Math.abs(d.vy) < 0.5) d.vy = 0;
            }

            ctx.globalAlpha = Math.min(1, d.life / 15);
            if (d.isGem) {
                // Draw gem shape
                ctx.fillStyle = d.color;
                ctx.beginPath();
                ctx.moveTo(d.x, d.y - 3);
                ctx.lineTo(d.x + 3, d.y);
                ctx.lineTo(d.x, d.y + 3);
                ctx.lineTo(d.x - 3, d.y);
                ctx.closePath();
                ctx.fill();
                // Sparkle
                ctx.fillStyle = '#fff';
                ctx.fillRect(d.x - 1, d.y - 1, 1, 1);
            } else {
                // Draw ore chunk
                ctx.fillStyle = d.color;
                ctx.fillRect(d.x - 2, d.y - 2, 4, 4);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(d.x - 1, d.y - 1, 1, 1);
            }
            ctx.globalAlpha = 1;
            return true;
        });

        // Floating texts (+XP, +Gem, Combo!)
        floatingTexts = floatingTexts.filter(t => {
            t.y -= 0.5;
            t.life -= 0.02;
            if (t.life <= 0) return false;
            ctx.globalAlpha = t.life;
            World.drawText(t.text, t.x, t.y, t.size || 4, t.color, 'center');
            ctx.globalAlpha = 1;
            return true;
        });

        // Atmospheric floating dust motes
        for (let i = 0; i < 8; i++) {
            const dx = (i * 47 + frame * 0.15) % (W + 10) - 5;
            const dy = (i * 31 + Math.sin(frame * 0.01 + i * 2) * 15) % H;
            const alpha = 0.15 + Math.sin(frame * 0.02 + i) * 0.1;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = biome === 'nether' ? '#FF6B2B' : biome === 'end' ? '#cc44ff' : biome === 'snow' ? '#ffffff' : '#FFE87C';
            ctx.fillRect(Math.floor(dx), Math.floor(dy), 1, 1);
        }
        ctx.globalAlpha = 1;

        // Daily mode indicator
        if (dailyMultiplier > 1 && frame % 120 < 60) {
            ctx.globalAlpha = 0.7 + Math.sin(frame * 0.08) * 0.3;
            World.drawText('2x DAILY BONUS!', 160, 12, 4, '#FFD700', 'center');
            ctx.globalAlpha = 1;
        }

        // Combo timer
        if (comboTimer > 0) {
            comboTimer--;
            if (comboTimer <= 0) combo = 0;
        }

        // Combo display (HTML overlay)
        const comboEl = document.getElementById('combo-overlay');
        if (combo >= 2) {
            comboEl.textContent = `${combo}x COMBO!`;
            comboEl.classList.add('active');
            if (combo >= 8) {
                // Rainbow cycling color
                const hue = (frame * 3) % 360;
                comboEl.style.color = `hsl(${hue}, 100%, 60%)`;
            } else if (combo >= 5) {
                comboEl.style.color = '#FFD700';
            } else {
                comboEl.style.color = '';
            }
        } else {
            comboEl.classList.remove('active');
            comboEl.style.color = '';
        }

        // Inventory bar (HTML overlay)
        updateInventoryBar();

        // Progress indicator (HTML HUD)
        const minedCount = blocks.filter(b => b.mined).length;
        document.getElementById('hud-progress').textContent = `${minedCount}/${blocks.length}`;

        if (screenShake > 0) ctx.restore();
    }

    function updateInventoryBar() {
        const bar = document.getElementById('inventory-bar');
        const items = ['wood', 'stone', 'iron', 'gold', 'diamond', 'emerald'];
        const colors = { wood: '#8B5E3C', stone: '#7f7f7f', iron: '#D8D8D8', gold: '#FFD700', diamond: '#4AEDD9', emerald: '#2ecc71' };
        let html = '';
        items.forEach(item => {
            const count = itemsCollected[item] || 0;
            if (count <= 0) return;
            html += `<div class="inv-item"><div class="inv-icon" style="background:${colors[item]}"></div><span class="inv-count">${count}</span></div>`;
        });
        if (gemsEarned > 0) {
            html += `<div class="inv-gems">${gemsEarned} gems</div>`;
        }
        bar.innerHTML = html;
        bar.classList.toggle('active', html.length > 0);
    }

    function getToolSpriteName() {
        const tool = Progress.get().tool || 'wood';
        const map = { wood: 'wood_pickaxe', stone: 'stone_pickaxe', iron: 'iron_pickaxe', gold: 'gold_pickaxe', diamond: 'diamond_pickaxe', netherite: 'diamond_pickaxe', master_sword: 'master_sword' };
        return map[tool] || 'wood_pickaxe';
    }

    function getToolColor() {
        const tool = Progress.get().tool || 'wood';
        const colors = { wood: '#8B5E3C', stone: '#7f7f7f', iron: '#D8D8D8', gold: '#FFD700', diamond: '#4AEDD9', netherite: '#3a3a3a' };
        return colors[tool] || colors.wood;
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
        wordsAttempted.push(question.word);
        Progress.recordSightWord(question.word, isCorrect);

        if (isCorrect) {
            correct++;
            streak++;
            combo++;
            comboTimer = 180; // 3 seconds at 60fps
            if (streak > bestStreak) bestStreak = streak;
            if (streak === 5 || streak === 10 || streak === 15) Main.celebrateStreak(streak);
            Main.triggerEffects(streak);

            const baseXP = 10;
            const streakBonus = Math.min(streak, 5) * 2;
            const comboBonus = Math.min(combo, 5) * 3;
            const earned = (baseXP + streakBonus + comboBonus) * dailyMultiplier;
            xpEarned += earned;
            score += earned;

            clickedBtn.classList.add('correct');
            let feedbackText = `+${earned} XP!`;
            if (combo >= 3) feedbackText += ` ${combo}x Combo!`;
            else if (streak >= 3) feedbackText += ` ${streak} streak!`;
            feedbackEl.textContent = feedbackText;
            feedbackEl.className = 'question-feedback feedback-correct';
            Audio.correct();

            // XP sparkle particles flying upward from the block
            if (activeBlock) {
                const bx = activeBlock.x - scrollX + blockSize / 2;
                const by = activeBlock.y;
                for (let i = 0; i < Math.min(earned / 5, 8); i++) {
                    setTimeout(() => {
                        floatingTexts.push({
                            x: bx + (Math.random() - 0.5) * 30,
                            y: by + (Math.random() - 0.5) * 10,
                            text: '✦',
                            color: combo >= 5 ? '#FFD700' : '#5daa3a',
                            life: 1.2 + Math.random() * 0.5,
                            size: 3 + Math.floor(Math.random() * 2)
                        });
                    }, i * 50);
                }
            }

            // Brief green flash overlay for correct answers
            if (canvas) {
                const flashDuration = combo >= 5 ? 200 : 120;
                canvas.style.boxShadow = `inset 0 0 40px rgba(93, 170, 58, 0.4)`;
                setTimeout(() => { canvas.style.boxShadow = ''; }, flashDuration);
            }

            // Combo streak visual effects
            if (combo >= 3) {
                const comboX = playerX + 8;
                const comboY = playerY - 16;
                if (combo >= 8) {
                    // Rainbow combo text
                    const rainbowColors = ['#ff0000','#ff8800','#ffdd00','#00cc44','#0088ff','#8800ff'];
                    const rc = rainbowColors[combo % rainbowColors.length];
                    floatingTexts.push({ x: comboX, y: comboY, text: `COMBO x${combo}!`, color: rc, life: 1.5, size: 6 });
                    Audio.superCombo();
                } else if (combo >= 5) {
                    // Gold combo text + golden glow
                    floatingTexts.push({ x: comboX, y: comboY, text: `COMBO x${combo}!`, color: '#FFD700', life: 1.5, size: 6 });
                    Audio.superCombo();
                    screenShake = 2;
                    // Brief golden glow via combo overlay
                    const glowEl = document.getElementById('combo-overlay');
                    glowEl.style.textShadow = '0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,215,0,0.3)';
                    setTimeout(() => { glowEl.style.textShadow = ''; }, 600);
                } else {
                    // Gold floating text for combo 3-4
                    floatingTexts.push({ x: comboX, y: comboY, text: `COMBO x${combo}!`, color: '#FFD700', life: 1.2, size: 5 });
                    Audio.comboSound();
                }
            }

            // BREAK the block with effects
            if (activeBlock) {
                breakBlock(activeBlock);
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

            // Block doesn't break — reset cracking
            if (activeBlock) {
                activeBlock.cracking = 0;
                activeBlock.highlight = false;
            }
        }

        // Comeback tracking: wrong then next 3 correct
        if (isCorrect) {
            if (comebackTracker > 0) comebackTracker++;
            if (comebackTracker >= 4) hadComeback = true;
        } else {
            comebackTracker = 1; // start tracking after a miss
        }

        updateHUD();
        currentQuestion = null;
        activeBlock = null;

        setTimeout(() => {
            document.getElementById('question-overlay').classList.remove('active');
            setTimeout(() => highlightNextBlock(), 300);
        }, isCorrect ? 600 : 1200);
    }

    function breakBlock(block) {
        block.mined = true;
        block.highlight = false;

        // Screen shake
        screenShake = 4;

        // Block break sound
        Audio.blockBreak();

        // Explosion of particles
        const bx = block.x - scrollX + blockSize / 2;
        const by = block.y + blockSize / 2;
        World.addParticle(bx, by, World.BLOCK_COLORS[block.type] || '#888', 12);

        // Spawn item drops
        const drop = block.dropType;
        for (let i = 0; i < 3; i++) {
            drops.push({
                x: bx + (Math.random() - 0.5) * 10,
                y: by,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 4 - 2,
                color: drop.color,
                isGem: false,
                life: 60
            });
        }

        // Gem drops for valuable blocks
        if (drop.gem > 0) {
            for (let i = 0; i < drop.gem; i++) {
                drops.push({
                    x: bx + (Math.random() - 0.5) * 15,
                    y: by - 5,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -Math.random() * 5 - 3,
                    color: '#2ecc71',
                    isGem: true,
                    life: 80
                });
            }
            gemsEarned += drop.gem;
        }

        // Collect inventory
        itemsCollected[drop.item] = (itemsCollected[drop.item] || 0) + 1;

        // Floating text
        floatingTexts.push({
            x: bx, y: by - 10,
            text: `+${drop.item === 'diamond' ? '3' : drop.item === 'gold' ? '2' : '1'}`,
            color: drop.color,
            life: 1, size: 4
        });
        if (drop.gem > 0) {
            setTimeout(() => {
                floatingTexts.push({
                    x: bx + 15, y: by - 15,
                    text: `+${drop.gem} gem${drop.gem > 1 ? 's' : ''}`,
                    color: '#2ecc71',
                    life: 1, size: 3
                });
            }, 200);
        }

        // Random emerald bonus (rare)
        if (Math.random() < 0.15) {
            setTimeout(() => {
                drops.push({
                    x: bx, y: by - 10,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -6,
                    color: '#2ecc71',
                    isGem: true,
                    life: 90
                });
                itemsCollected.emerald = (itemsCollected.emerald || 0) + 1;
                gemsEarned += 5;
                floatingTexts.push({
                    x: bx, y: by - 25,
                    text: 'EMERALD! +5',
                    color: '#2ecc71',
                    life: 1.5, size: 5
                });
            }, 400);
        }
    }

    function showHUD() {
        const hud = document.getElementById('game-hud');
        hud.style.display = 'flex';
        updateHUD();
    }

    function updateHUD() {
        document.getElementById('hud-score').textContent = score;
        document.getElementById('streak-count').textContent = streak;
        document.getElementById('hud-xp').textContent = `XP: +${xpEarned}`;

        const heartsEl = document.getElementById('hud-hearts');
        const heartCount = 5;
        const filled = total === 0 ? heartCount : Math.max(0, Math.round((correct / total) * heartCount));
        heartsEl.innerHTML = '';
        for (let i = 0; i < heartCount; i++) {
            const h = document.createElement('div');
            h.className = i < filled ? 'heart' : 'heart empty';
            heartsEl.appendChild(h);
        }
    }

    function endGame() {
        active = false;
        World.stopLoop();
        document.getElementById('question-overlay').classList.remove('active');
        document.getElementById('game-hud').style.display = 'none';

        // Remove click/touch/keyboard handlers
        if (canvas) {
            if (clickHandler) canvas.removeEventListener('click', clickHandler);
            if (touchHandler) canvas.removeEventListener('touchstart', touchHandler);
        }
        if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }

        // Save progress
        Progress.addXP(xpEarned);
        Progress.addGems(gemsEarned);
        // Save inventory items
        Object.entries(itemsCollected).forEach(([item, count]) => {
            if (count > 0) Progress.addInventoryItem(item, count);
        });
        Progress.recordGameComplete(correct, total, bestStreak);

        showResults();
    }

    function showResults() {
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        let stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
        if (stars < 2 && Progress.consumePowerup('lucky-star')) { stars = 2; Main.showToast('⭐ Lucky Star! 2 stars!'); }

        document.getElementById('results-title').textContent =
            stars >= 3 ? 'Amazing Mining!' : stars >= 2 ? 'Great Work!' : stars >= 1 ? 'Good Try!' : 'Keep Practicing!';
        document.getElementById('stat-correct').textContent = correct;
        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-accuracy').textContent = accuracy + '%';
        document.getElementById('stat-xp').textContent = '+' + xpEarned;
        document.getElementById('stat-streak').textContent = bestStreak;
        document.getElementById('stat-wpm-row').style.display = 'none';
        // Show gems if any were earned
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

        if (stars >= 2) {
            Celebration.start(document.getElementById('celebration-canvas'));
        }

        // Populate extras (XP bar, mastered words)
        Main.populateResultsExtras({ wordsAttempted, mode: 'mine', score: accuracy });

        // Check achievements
        const earned = Achievements.checkAfterGame({
            mode: 'mine', correct, total, bestStreak, stars,
            hadComeback
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
        if (canvas) {
            if (clickHandler) canvas.removeEventListener('click', clickHandler);
            if (touchHandler) canvas.removeEventListener('touchstart', touchHandler);
        }
        if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    }

    function setDailyMultiplier(mult) {
        dailyMultiplier = mult;
    }

    return { start, stop, setDailyMultiplier };
})();
