/* ============================================
   MAIN — App Controller, Screen Routing, Welcome Flow
   Shop system, Achievement toasts, Daily streaks
   ============================================ */
const Main = (() => {
    let currentScreen = 'loading';
    let currentMode = null;
    let lastMode = null;
    let lastModeArgs = null;

    // Shop items
    const SHOP_ITEMS = {
        tools: [
            { id: 'wood', name: 'Wooden Pick', cost: 0, desc: 'Starter tool' },
            { id: 'stone', name: 'Stone Pick', cost: 10, desc: 'Mines faster!' },
            { id: 'iron', name: 'Iron Pick', cost: 25, desc: 'Strong and shiny' },
            { id: 'gold', name: 'Gold Pick', cost: 50, desc: 'Sparkly gold!' },
            { id: 'diamond', name: 'Diamond Pick', cost: 100, desc: 'The best tool!' },
            { id: 'netherite', name: 'Netherite Pick', cost: 250, desc: 'LEGENDARY!' },
            { id: 'master_sword', name: 'Master Sword', cost: 300, desc: "Zelda's legendary blade!" }
        ],
        skins: [
            { id: 'steve', name: 'Steve', cost: 0, desc: 'Classic Steve' },
            { id: 'alex', name: 'Alex', cost: 15, desc: 'Adventurer Alex' },
            { id: 'link', name: 'Link', cost: 30, desc: 'Hero of Hyrule' },
            { id: 'zombie', name: 'Zombie', cost: 35, desc: 'Braaains...' },
            { id: 'creeper', name: 'Creeper', cost: 40, desc: 'Ssssss...' },
            { id: 'younglink', name: 'Young Link', cost: 45, desc: 'Adventure awaits!' },
            { id: 'zelda', name: 'Zelda', cost: 60, desc: 'Princess power!' },
            { id: 'sheik', name: 'Sheik', cost: 75, desc: 'Hidden warrior' },
            { id: 'enderman', name: 'Enderman', cost: 75, desc: 'Tall and dark' },
            { id: 'diamond', name: 'Diamond Steve', cost: 150, desc: 'Shining armor!' },
            { id: 'netherite', name: 'Netherite Steve', cost: 300, desc: 'Ultimate armor!' }
        ],
        effects: [
            { id: 'confetti', name: 'Confetti', cost: 20, desc: 'Party on correct!' },
            { id: 'fireworks', name: 'Fireworks', cost: 50, desc: 'Big celebrations!' },
            { id: 'rainbow', name: 'Rainbow Trail', cost: 80, desc: 'Leave a trail!' }
        ],
        pets: [
            { id: 'wolf', name: 'Wolf', cost: 50, desc: 'Your loyal friend!' },
            { id: 'cat', name: 'Cat', cost: 75, desc: 'Purrs when you win!' },
            { id: 'bee', name: 'Bee', cost: 90, desc: 'Buzzy buddy!' },
            { id: 'parrot', name: 'Parrot', cost: 100, desc: 'Polly wants a word!' },
            { id: 'rabbit', name: 'Rabbit', cost: 110, desc: 'Hops along!' },
            { id: 'fox', name: 'Fox', cost: 125, desc: 'Sneaky and cute!' },
            { id: 'turtle', name: 'Turtle', cost: 150, desc: 'Slow and steady!' },
            { id: 'axolotl', name: 'Axolotl', cost: 200, desc: 'Super rare!' }
        ],
        worlds: [
            { id: 'plains', name: 'Plains', cost: 0, desc: 'Classic green world' },
            { id: 'forest', name: 'Forest', cost: 30, desc: 'Deep in the woods!' },
            { id: 'desert', name: 'Desert', cost: 50, desc: 'Sandy adventure!' },
            { id: 'snow', name: 'Snow Biome', cost: 75, desc: 'Brrr! So cold!' },
            { id: 'nether', name: 'The Nether', cost: 100, desc: 'Hot and dangerous!' },
            { id: 'end', name: 'The End', cost: 200, desc: 'The final frontier!' }
        ],
        titles: [
            { id: 'title-rookie', name: 'The Rookie', cost: 10, desc: 'Just starting out!' },
            { id: 'title-bookworm', name: 'Bookworm', cost: 25, desc: 'Loves to read!' },
            { id: 'title-mathwiz', name: 'Math Wizard', cost: 25, desc: 'Number genius!' },
            { id: 'title-speedster', name: 'Speedster', cost: 40, desc: 'Lightning fast!' },
            { id: 'title-champion', name: 'Champion', cost: 60, desc: 'A true winner!' },
            { id: 'title-dragon', name: 'Dragon Slayer', cost: 100, desc: 'Defeated the Ender Dragon!' },
            { id: 'title-legend', name: 'LEGENDARY', cost: 200, desc: 'The greatest of all!' },
            { id: 'title-king', name: 'King of the Mine', cost: 150, desc: 'Rules the world!' }
        ],
        powerups: [
            { id: 'double-xp', name: 'Double XP Boost', cost: 50, desc: 'Earn 2x XP next game!' },
            { id: 'gem-magnet', name: 'Gem Magnet', cost: 40, desc: 'Find +2 bonus gems!' },
            { id: 'extra-heart', name: 'Extra Heart', cost: 30, desc: 'Start with 6 hearts!' },
            { id: 'hint-helper', name: 'Hint Helper', cost: 35, desc: 'Get a letter hint!' },
            { id: 'time-freeze', name: 'Time Freeze', cost: 60, desc: 'Extra 10 seconds!' },
            { id: 'lucky-star', name: 'Lucky Star', cost: 75, desc: 'Guaranteed 2+ stars!' }
        ]
    };

    function init() {
        Progress.load();
        // Sync player name from shared BBG profile
        try {
            const activeId = localStorage.getItem('bbg_active_profile');
            if (activeId) {
                const profileData = JSON.parse(localStorage.getItem('bbg_profile_' + activeId) || '{}');
                if (profileData.playerName) {
                    const d = Progress.get();
                    if (d.name !== profileData.playerName) {
                        Progress.setName(profileData.playerName);
                    }
                }
            }
        } catch (_) {}
        ParentDashboard.init();
        Settings.init();
        wireButtons();
        simulateLoading();
    }

    function simulateLoading() {
        const bar = document.getElementById('loading-bar');
        bar.style.animation = 'none'; // Override pulse for real progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    const d = Progress.get();
                    if (d.name) {
                        showScreen('title');
                        checkDailyStreak();
                    } else {
                        showScreen('welcome');
                    }
                }, 300);
            }
            bar.style.width = progress + '%';
        }, 150);
    }

    function checkDailyStreak() {
        const { streak, isNew } = Progress.checkDailyStreak();
        if (isNew && streak >= 1) {
            const bonusGems = Math.min(streak * 2, 20);
            Progress.addGems(bonusGems);
            showDailyRewards(streak, bonusGems);
        }
    }

    // 7-day daily rewards calendar
    const DAILY_REWARDS = [
        { day: 1, gems: 2, icon: '\u{1F48E}' },
        { day: 2, gems: 4, icon: '\u{1F48E}' },
        { day: 3, gems: 6, icon: '\u{1F4B0}' },
        { day: 4, gems: 8, icon: '\u{1F4B0}' },
        { day: 5, gems: 10, icon: '\u{1F381}' },
        { day: 6, gems: 12, icon: '\u{1F381}' },
        { day: 7, gems: 20, icon: '\u{1F451}' }
    ];

    function showDailyRewards(streak, bonusGems) {
        // Remove existing overlay if any
        let overlay = document.getElementById('daily-rewards-overlay');
        if (overlay) overlay.remove();

        overlay = document.createElement('div');
        overlay.id = 'daily-rewards-overlay';
        overlay.className = 'daily-rewards-overlay';

        const panel = document.createElement('div');
        panel.className = 'daily-rewards-panel panel';

        const title = document.createElement('h2');
        title.className = 'pixel-title';
        title.style.color = '#FFD700';
        title.textContent = `Day ${streak} Streak!`;
        panel.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.className = 'pixel-text';
        subtitle.style.cssText = 'font-size:10px;color:#2ecc71;margin:4px 0 8px';
        subtitle.textContent = `+${bonusGems} bonus gems!`;
        panel.appendChild(subtitle);

        const grid = document.createElement('div');
        grid.className = 'daily-rewards-grid';

        const dayInWeek = ((streak - 1) % 7) + 1;
        DAILY_REWARDS.forEach(reward => {
            const cell = document.createElement('div');
            cell.className = 'daily-reward-day';
            if (reward.day < dayInWeek) cell.classList.add('claimed');
            if (reward.day === dayInWeek) cell.classList.add('today');

            cell.innerHTML = `
                <span class="day-num">Day ${reward.day}</span>
                <span class="day-reward">${reward.day <= dayInWeek ? reward.icon : '\u{1F512}'}</span>
                <span class="day-gems">${reward.gems}g</span>
            `;
            grid.appendChild(cell);
        });

        panel.appendChild(grid);

        const btn = document.createElement('button');
        btn.className = 'mc-btn mc-btn-primary';
        btn.textContent = 'Collect!';
        btn.addEventListener('click', () => {
            Audio.click();
            overlay.remove();
        });
        panel.appendChild(btn);

        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        Audio.achievement();
    }

    // Track current correct answer for hint system
    let currentCorrectAnswer = null;
    let hintUsedThisQuestion = false;

    function wireButtons() {
        // Hear button — replay TTS for current question word/prompt
        document.getElementById('hear-btn').addEventListener('click', () => {
            const wordEl = document.getElementById('question-word');
            // data-word stores the actual word even when display shows "?"
            const actualWord = wordEl.dataset.word || wordEl.textContent;
            if (actualWord && actualWord !== '?') {
                Audio.speakWord(actualWord);
            } else {
                Audio.speak(document.getElementById('question-prompt').textContent, 'question');
            }
            Audio.click();
        });

        // Hint button — show first letter of correct answer (consumes powerup)
        document.getElementById('hint-btn').addEventListener('click', () => {
            if (!currentCorrectAnswer || hintUsedThisQuestion) return;
            hintUsedThisQuestion = true;
            const feedbackEl = document.getElementById('question-feedback');
            const firstLetter = String(currentCorrectAnswer).charAt(0).toUpperCase();
            feedbackEl.textContent = `Hint: starts with "${firstLetter}"`;
            feedbackEl.className = 'question-feedback feedback-hint';
            Progress.consumePowerup('hint-helper');
            // Hide hint button after use
            document.getElementById('hint-btn').style.display = 'none';
            Audio.click();
        });

        // Welcome screen
        document.getElementById('start-adventure-btn').addEventListener('click', () => {
            const name = document.getElementById('player-name').value.trim() || 'Steve';
            Progress.setName(name);
            const gradeBtn = document.querySelector('.welcome-form .grade-btn.selected');
            if (gradeBtn) Progress.setGrade(gradeBtn.dataset.grade);
            Audio.click();
            showScreen('title');
            checkDailyStreak();
        });

        document.querySelectorAll('.welcome-form .grade-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.welcome-form .grade-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                Audio.click();
            });
        });

        // Title screen
        document.getElementById('play-btn').addEventListener('click', () => {
            Audio.click();
            showScreen('mode');
        });
        document.getElementById('garage-btn').addEventListener('click', () => {
            Audio.click();
            showSkins();
            showScreen('skins');
        });
        document.getElementById('shop-btn').addEventListener('click', () => {
            Audio.click();
            showShop('tools');
            showScreen('shop');
        });
        document.getElementById('achievements-btn').addEventListener('click', () => {
            Audio.click();
            showAchievements();
            showScreen('achievements');
        });
        document.getElementById('settings-btn').addEventListener('click', () => {
            Audio.click();
            Settings.show();
            showScreen('settings');
        });
        document.getElementById('parent-btn').addEventListener('click', () => {
            Audio.click();
            ParentDashboard.show();
            showScreen('parent');
        });

        // Mode select
        document.getElementById('mode-mine').addEventListener('click', () => startGame('mine'));
        document.getElementById('mode-bridge').addEventListener('click', () => startGame('bridge'));
        document.getElementById('mode-enchant').addEventListener('click', () => startGame('enchant'));
        document.getElementById('mode-craft').addEventListener('click', () => {
            Audio.click();
            showTopics();
            showScreen('topic');
        });
        document.getElementById('mode-explore').addEventListener('click', () => startGame('mine', Progress.get().world || 'plains'));
        document.getElementById('mode-survival').addEventListener('click', () => startGame('survival'));
        document.getElementById('mode-speed').addEventListener('click', () => startGame('speed'));
        document.getElementById('mode-daily').addEventListener('click', () => startDailyChallenge());
        document.getElementById('mode-back-btn').addEventListener('click', () => {
            Audio.click();
            showScreen('title');
        });

        // Topic select
        document.querySelectorAll('.topic-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const parent = tab.closest('.topic-tabs, .shop-tabs');
                if (parent) parent.querySelectorAll('.topic-tab').forEach(t => t.classList.remove('selected'));
                tab.classList.add('selected');
                Audio.click();

                if (tab.closest('#topic-screen')) {
                    showTopics(tab.dataset.subject);
                } else if (tab.closest('#shop-screen')) {
                    showShop(tab.dataset.tab);
                }
            });
        });
        document.getElementById('topic-back-btn').addEventListener('click', () => {
            Audio.click();
            showScreen('mode');
        });

        // Game screen
        function togglePause() {
            Audio.click();
            const pauseEl = document.getElementById('pause-overlay');
            if (pauseEl.classList.contains('active')) {
                pauseEl.classList.remove('active');
            } else {
                pauseEl.classList.add('active');
            }
        }

        document.getElementById('pause-btn').addEventListener('click', togglePause);
        document.getElementById('question-pause-btn').addEventListener('click', togglePause);

        document.getElementById('resume-btn').addEventListener('click', () => {
            Audio.click();
            document.getElementById('pause-overlay').classList.remove('active');
        });
        document.getElementById('quit-btn').addEventListener('click', () => {
            Audio.click();
            stopCurrentGame();
            document.getElementById('pause-overlay').classList.remove('active');
            document.getElementById('game-hud').style.display = 'none';
            showScreen('title');
        });

        // Escape key toggles pause during gameplay
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && currentScreen === 'game') {
                e.preventDefault();
                togglePause();
            }
            // Global keyboard shortcuts for answer buttons (works in all modes)
            if (currentScreen === 'game' && ['1','2','3','4'].includes(e.key)) {
                const overlay = document.getElementById('question-overlay');
                if (overlay.classList.contains('active')) {
                    e.preventDefault();
                    const btns = document.querySelectorAll('#answer-buttons .answer-btn');
                    const idx = parseInt(e.key) - 1;
                    if (btns[idx] && btns[idx].style.pointerEvents !== 'none') {
                        btns[idx].click();
                    }
                }
            }
            // R key replays audio in any mode
            if (currentScreen === 'game' && e.key === 'r') {
                const overlay = document.getElementById('question-overlay');
                if (overlay.classList.contains('active')) {
                    e.preventDefault();
                    const wordEl = document.getElementById('question-word');
                    const actualWord = wordEl.dataset.word || wordEl.textContent;
                    if (actualWord && actualWord !== '?') Audio.speakWord(actualWord);
                }
            }
        });

        // Results screen
        document.getElementById('play-again-btn').addEventListener('click', () => {
            Audio.click();
            Celebration.stop();
            if (lastMode && lastModeArgs) {
                startGame(lastMode, ...lastModeArgs);
            } else if (lastMode) {
                startGame(lastMode);
            } else {
                showScreen('mode');
            }
        });
        document.getElementById('results-menu-btn').addEventListener('click', () => {
            Audio.click();
            Celebration.stop();
            showScreen('title');
        });

        // Back buttons
        document.getElementById('skins-back-btn').addEventListener('click', () => { Audio.click(); showScreen('title'); });
        document.getElementById('shop-back-btn').addEventListener('click', () => { Audio.click(); showScreen('title'); });
        document.getElementById('achievements-back-btn').addEventListener('click', () => { Audio.click(); showScreen('title'); });
        document.getElementById('settings-back-btn').addEventListener('click', () => { Audio.click(); showScreen('title'); });
        document.getElementById('parent-back-btn').addEventListener('click', () => { Audio.click(); showScreen('title'); });

        // Reset progress
        document.getElementById('reset-progress-btn').addEventListener('click', () => {
            if (confirm('Are you sure? This will erase ALL progress!')) {
                Progress.resetAll();
                ParentDashboard.renderDashboard();
                Audio.click();
            }
        });
    }

    // ========== FIRST-TIME TUTORIAL ==========
    const WMTutorial = (() => {
        const STEPS = [
            { emoji: '\u26CF\uFE0F', text: 'Welcome to Word Mine! Break blocks to find words!' },
            { emoji: '\u{1F3AE}', text: 'Choose a game mode to start mining!' },
            { emoji: '\u2705', text: 'Answer questions to break blocks and earn gems!' },
            { emoji: '\u{1F48E}', text: 'Collect gems to unlock new skins and tools!' }
        ];

        let step = 0;

        function shouldShow() {
            return !localStorage.getItem('wordmine_tutorial_done');
        }

        function start() {
            if (!shouldShow()) return;
            const overlay = document.getElementById('wm-tutorial');
            if (!overlay) return;

            step = 0;
            overlay.style.display = 'block';

            const dotsEl = document.getElementById('wm-tutorial-dots');
            dotsEl.innerHTML = STEPS.map((_, i) => `<span class="wm-tutorial-dot" data-i="${i}"></span>`).join('');

            document.getElementById('wm-tutorial-next').addEventListener('click', next);
            document.getElementById('wm-tutorial-skip').addEventListener('click', finish);

            render();
        }

        function render() {
            const s = STEPS[step];
            document.getElementById('wm-tutorial-emoji').textContent = s.emoji;
            document.getElementById('wm-tutorial-text').textContent = s.text;
            document.getElementById('wm-tutorial-next').textContent = step === STEPS.length - 1 ? "Let's Mine!" : 'Next';

            document.querySelectorAll('.wm-tutorial-dot').forEach((dot, i) => {
                dot.className = 'wm-tutorial-dot';
                if (i < step) dot.classList.add('done');
                if (i === step) dot.classList.add('active');
            });

            // Highlight relevant area on certain steps
            const spotlight = document.getElementById('wm-tutorial-spotlight');
            const backdrop = document.getElementById('wm-tutorial-backdrop');
            const card = document.getElementById('wm-tutorial-card');
            let target = null;

            if (step === 1) target = document.querySelector('.title-buttons');
            else if (step === 3) target = document.getElementById('title-gems');

            if (target) {
                const rect = target.getBoundingClientRect();
                const pad = 8;
                spotlight.style.display = 'block';
                spotlight.style.top = (rect.top - pad) + 'px';
                spotlight.style.left = (rect.left - pad) + 'px';
                spotlight.style.width = (rect.width + pad * 2) + 'px';
                spotlight.style.height = (rect.height + pad * 2) + 'px';
                backdrop.style.background = 'transparent';
                card.style.top = 'auto';
                card.style.bottom = '20px';
                card.style.transform = 'translateX(-50%)';
            } else {
                spotlight.style.display = 'none';
                backdrop.style.background = 'rgba(0,0,0,0.75)';
                card.style.top = '50%';
                card.style.bottom = 'auto';
                card.style.transform = 'translate(-50%, -50%)';
            }

            // Re-trigger animation
            card.style.animation = 'none';
            card.offsetHeight;
            card.style.animation = '';
        }

        function next() {
            Audio.click();
            if (step < STEPS.length - 1) {
                step++;
                render();
            } else {
                finish();
            }
        }

        function finish() {
            Audio.click();
            localStorage.setItem('wordmine_tutorial_done', '1');
            const overlay = document.getElementById('wm-tutorial');
            if (overlay) {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.3s';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    overlay.style.opacity = '';
                    overlay.style.transition = '';
                }, 300);
            }
        }

        return { start, shouldShow };
    })();

    function showScreen(screenId) {
        const prevScreen = currentScreen;

        // Pixelated wipe transition for major screen changes
        const wipeEl = document.getElementById('screen-wipe');
        if (wipeEl && prevScreen && prevScreen !== screenId && screenId !== 'loading') {
            wipeEl.style.display = 'block';
            wipeEl.style.animation = 'none';
            wipeEl.offsetHeight; // force reflow
            wipeEl.style.animation = '';
            wipeEl.classList.remove('wipe-in');
            wipeEl.style.animation = 'pixelWipe 0.4s steps(8) forwards';
            setTimeout(() => { wipeEl.style.display = 'none'; }, 420);
        }

        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
            s.classList.remove('screen-transition-in');
        });
        // Clear game overlays when leaving game screen
        document.getElementById('question-overlay').classList.remove('active');
        document.getElementById('pause-overlay').classList.remove('active');
        document.getElementById('game-hud').style.display = 'none';
        document.getElementById('combo-overlay').classList.remove('active');
        document.getElementById('inventory-bar').classList.remove('active');
        document.getElementById('mob-name-overlay').classList.remove('active');
        document.getElementById('hud-mode-label').textContent = '';
        document.getElementById('hud-progress').textContent = '';
        const target = document.getElementById(screenId + '-screen');
        if (target) {
            target.classList.add('active');
            // Apply fade-in transition for non-loading screens
            if (screenId !== 'loading') {
                target.classList.add('screen-transition-in');
            }
        }
        currentScreen = screenId;

        // Stop background music when leaving game screen
        if (screenId !== 'game' && Audio.musicPlaying) {
            Audio.stopMusic();
        }

        if (screenId === 'title') {
            updateTitleInfo();
            const titleCanvas = document.getElementById('title-canvas');
            if (titleCanvas) {
                World.init(titleCanvas);
                World.resize(320, 180);
                World.startLoop((ctx, W, H, frame) => {
                    World.drawTitleScene(frame);
                });
            }
            // Show first-time tutorial after a short delay
            setTimeout(() => WMTutorial.start(), 800);
        } else if (screenId !== 'game') {
            World.stopLoop();
        }
    }

    function updateTitleInfo() {
        const d = Progress.get();
        document.getElementById('title-player-name').textContent = d.name || 'Steve';
        const titleName = d.title ? SHOP_ITEMS.titles.find(t => t.id === d.title) : null;
        document.getElementById('title-player-level').textContent = titleName ? `Lv.${d.level} "${titleName.name}"` : `Lv.${d.level} ${Progress.getRank()}`;

        const xpInfo = Progress.getXPForNext();
        document.getElementById('title-xp-fill').style.width = xpInfo.pct + '%';

        // Update gem display
        const gemsEl = document.getElementById('title-gems');
        if (gemsEl) gemsEl.textContent = `${d.gems || 0} gems`;

        // Daily streak badge
        const streakBadge = document.getElementById('daily-streak-badge');
        const dailyStreak = d.dailyStreak || 0;
        if (streakBadge && dailyStreak > 0) {
            streakBadge.style.display = 'flex';
            document.getElementById('daily-streak-count').textContent = dailyStreak;
            document.querySelector('.streak-label').textContent = dailyStreak === 1 ? 'day streak' : 'day streak';
        } else if (streakBadge) {
            streakBadge.style.display = 'none';
        }
    }

    function startGame(mode, ...args) {
        Audio.click();
        Audio.unlockAudio();
        stopCurrentGame();
        currentMode = mode;
        lastMode = mode;
        lastModeArgs = args.length > 0 ? args : null;
        showScreen('game');

        // Start background music (boss type for survival, game type otherwise)
        Audio.startMusic(mode === 'survival' ? 'boss' : 'game');

        // Reset hearts to full at start of every game mode
        const heartsEl = document.getElementById('hud-hearts');
        heartsEl.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const h = document.createElement('div');
            h.className = 'heart';
            heartsEl.appendChild(h);
        }

        // Apply powerups
        const activePUs = Progress.get().activePowerups || [];
        if (activePUs.includes('extra-heart')) {
            const h = document.createElement('div');
            h.className = 'heart';
            heartsEl.appendChild(h); // 6th heart
            Progress.consumePowerup('extra-heart');
        }

        switch (mode) {
            case 'mine': MineMode.setDailyMultiplier(1); MineMode.start(args[0]); break;
            case 'bridge': BridgeMode.start(); break;
            case 'enchant': EnchantMode.start(); break;
            case 'craft': CraftMode.start(args[0], args[1]); break;
            case 'survival': SurvivalMode.start(); break;
            case 'speed': SpeedRound.start(); break;
        }
    }

    function stopCurrentGame() {
        switch (currentMode) {
            case 'mine': MineMode.stop(); break;
            case 'bridge': BridgeMode.stop(); break;
            case 'enchant': EnchantMode.stop(); break;
            case 'craft': CraftMode.stop(); break;
            case 'survival': SurvivalMode.stop(); break;
            case 'speed': SpeedRound.stop(); break;
        }
        currentMode = null;
    }

    function showTopics(subject) {
        subject = subject || 'reading';
        const grid = document.getElementById('topic-grid');
        grid.innerHTML = '';

        const topics = subject === 'math' ? MathData.topics : ReadingData.topics;
        topics.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'topic-card';
            const level = Progress.getTopicLevel(`${subject}-${t.id}`);
            const stats = Progress.get().topicStats[`${subject}-${t.id}`];
            const pct = stats ? Math.round((stats.correct / stats.total) * 100) : 0;

            btn.innerHTML = `
                <span class="topic-name pixel-text">${t.name}</span>
                <span class="topic-level pixel-text">Lv.${level}</span>
                ${stats ? `<span class="topic-pct pixel-text">${pct}%</span>` : ''}
            `;
            btn.addEventListener('click', () => {
                startGame('craft', subject, t.id);
            });
            grid.appendChild(btn);
        });
    }

    function showShop(tab) {
        tab = tab || 'tools';
        const grid = document.getElementById('shop-grid');
        const gemsEl = document.getElementById('shop-gems');
        const d = Progress.get();
        gemsEl.textContent = `${d.gems || 0} gems`;
        grid.innerHTML = '';

        const items = SHOP_ITEMS[tab] || [];
        items.forEach(item => {
            const purchases = d.shopPurchases || [];
            const owned = (tab === 'tools' && d.unlockedTools.includes(item.id)) ||
                          (tab === 'skins' && d.unlockedSkins.includes(item.id)) ||
                          (tab === 'effects' && purchases.includes(item.id)) ||
                          (tab === 'pets' && d.unlockedPets && d.unlockedPets.includes(item.id)) ||
                          (tab === 'worlds' && d.unlockedWorlds && d.unlockedWorlds.includes(item.id)) ||
                          (tab === 'titles' && purchases.includes(item.id)) ||
                          (tab === 'powerups' && d.activePowerups && d.activePowerups.includes(item.id));
            const equipped = (tab === 'tools' && d.tool === item.id) ||
                            (tab === 'skins' && d.skin === item.id) ||
                            (tab === 'pets' && d.pet === item.id) ||
                            (tab === 'worlds' && d.world === item.id) ||
                            (tab === 'titles' && d.title === item.id);
            const canAfford = (d.gems || 0) >= item.cost;

            const card = document.createElement('button');
            card.className = `shop-card ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''} ${!owned && !canAfford ? 'locked' : ''}`;

            // Mini preview for skins/tools/pets/worlds
            let previewHTML = '';
            if (tab === 'skins') {
                previewHTML = `<canvas class="skin-canvas" width="64" height="64" data-skin="${item.id}"></canvas>`;
            } else if (tab === 'tools') {
                const toolColors = { wood: '#8B5E3C', stone: '#7f7f7f', iron: '#D8D8D8', gold: '#FFD700', diamond: '#4AEDD9', netherite: '#3a3a3a', master_sword: '#64e764' };
                previewHTML = `<div class="tool-preview" style="background:${toolColors[item.id] || '#888'}"></div>`;
            } else if (tab === 'pets') {
                const petEmojis = { wolf: '\u{1F43A}', cat: '\u{1F431}', parrot: '\u{1F99C}', fox: '\u{1F98A}', axolotl: '\u{1F98E}', bee: '\u{1F41D}', rabbit: '\u{1F430}', turtle: '\u{1F422}' };
                previewHTML = `<div class="tool-preview pet-preview" style="font-size:32px;display:flex;align-items:center;justify-content:center;">${petEmojis[item.id] || ''}</div>`;
            } else if (tab === 'worlds') {
                const worldColors = { plains: '#5daa3a', forest: '#2d6a2d', desert: '#e8c874', snow: '#e8e8f0', nether: '#8b2020', end: '#2a1a4a' };
                previewHTML = `<div class="tool-preview" style="background:${worldColors[item.id] || '#888'}"></div>`;
            } else if (tab === 'titles') {
                const titleEmojis = { 'title-rookie': '\u{1F530}', 'title-bookworm': '\u{1F4DA}', 'title-mathwiz': '\u{1F9D9}', 'title-speedster': '\u26A1', 'title-champion': '\u{1F3C6}', 'title-dragon': '\u{1F409}', 'title-legend': '\u{1F31F}', 'title-king': '\u{1F451}' };
                previewHTML = `<div class="tool-preview" style="font-size:32px;display:flex;align-items:center;justify-content:center;">${titleEmojis[item.id] || '\u{1F3F7}'}</div>`;
            } else if (tab === 'powerups') {
                const puEmojis = { 'double-xp': '\u{1F4AB}', 'gem-magnet': '\u{1F9F2}', 'extra-heart': '\u2764\uFE0F', 'hint-helper': '\u{1F4A1}', 'time-freeze': '\u23F1\uFE0F', 'lucky-star': '\u2B50' };
                previewHTML = `<div class="tool-preview" style="font-size:32px;display:flex;align-items:center;justify-content:center;">${puEmojis[item.id] || '\u26A1'}</div>`;
            }

            card.innerHTML = `
                ${previewHTML}
                <span class="pixel-text shop-item-name">${item.name}</span>
                <span class="pixel-text shop-item-desc">${item.desc}</span>
                <span class="pixel-text shop-item-cost">${owned ? (tab === 'powerups' ? 'ACTIVE' : equipped ? 'EQUIPPED' : 'OWNED') : `${item.cost} gems`}</span>
            `;

            card.addEventListener('click', () => {
                if (tab === 'powerups' && owned) {
                    // Powerups can't be re-equipped, they're single-use active
                    Audio.click();
                    return;
                }
                if (owned) {
                    // Equip
                    if (tab === 'tools') Progress.setTool(item.id);
                    else if (tab === 'skins') Progress.setSkin(item.id);
                    else if (tab === 'pets') Progress.setPet(item.id);
                    else if (tab === 'worlds') {
                        Progress.setWorld(item.id);
                        Audio.switchBiomeMusic(item.id);
                    }
                    else if (tab === 'titles') Progress.setTitle(item.id);
                    Audio.click();
                    showShop(tab);
                } else if (canAfford) {
                    // Purchase
                    if (Progress.spendGems(item.cost)) {
                        if (tab === 'tools') Progress.unlockTool(item.id);
                        else if (tab === 'skins') Progress.unlockSkin(item.id);
                        else if (tab === 'pets') Progress.unlockPet(item.id);
                        else if (tab === 'worlds') Progress.unlockWorld(item.id);
                        else if (tab === 'powerups') {
                            Progress.addPowerup(item.id);
                        } else {
                            const d2 = Progress.get();
                            if (!d2.shopPurchases) d2.shopPurchases = [];
                            d2.shopPurchases.push(item.id);
                            Progress.save();
                        }
                        Audio.levelUp();
                        showToast(`Bought ${item.name}!`);
                        showShop(tab);
                    }
                } else {
                    Audio.wrong();
                }
            });
            grid.appendChild(card);

            // Draw skin preview
            if (tab === 'skins') {
                const miniCanvas = card.querySelector('.skin-canvas');
                if (miniCanvas) {
                    const miniCtx = miniCanvas.getContext('2d');
                    World.drawCharacterDirect(miniCtx, 8, 8, 48, item.id);
                }
            }
        });
    }

    function showSkins() {
        const d = Progress.get();
        const grid = document.getElementById('skins-grid');
        grid.innerHTML = '';

        const skins = [
            { id: 'steve', name: 'Steve', level: 0 },
            { id: 'alex', name: 'Alex', level: 3 },
            { id: 'link', name: 'Link', level: 5 },
            { id: 'younglink', name: 'Young Link', level: 7 },
            { id: 'creeper', name: 'Creeper', level: 8 },
            { id: 'zelda', name: 'Zelda', level: 10 },
            { id: 'sheik', name: 'Sheik', level: 12 },
            { id: 'enderman', name: 'Enderman', level: 15 },
            { id: 'diamond', name: 'Diamond', level: 25 }
        ];

        skins.forEach(skin => {
            const btn = document.createElement('button');
            const unlocked = d.level >= skin.level || d.unlockedSkins.includes(skin.id);
            const selected = d.skin === skin.id;
            btn.className = `skin-card ${unlocked ? 'unlocked' : 'locked'} ${selected ? 'selected' : ''}`;
            btn.innerHTML = `
                <div class="skin-preview-mini">
                    <canvas class="skin-canvas" width="64" height="64" data-skin="${skin.id}"></canvas>
                </div>
                <span class="pixel-text">${skin.name}</span>
                ${!unlocked ? `<span class="pixel-text lock-text">Lv.${skin.level}</span>` : ''}
            `;

            if (unlocked) {
                btn.addEventListener('click', () => {
                    Progress.unlockSkin(skin.id);
                    Progress.setSkin(skin.id);
                    Audio.click();
                    showSkins();
                });
            }
            grid.appendChild(btn);

            const miniCanvas = btn.querySelector('.skin-canvas');
            if (miniCanvas && unlocked) {
                const miniCtx = miniCanvas.getContext('2d');
                World.drawCharacterDirect(miniCtx, 8, 8, 48, skin.id);
            }
        });

        const previewCanvas = document.getElementById('skin-preview-canvas');
        if (previewCanvas) {
            const pCtx = previewCanvas.getContext('2d');
            pCtx.clearRect(0, 0, 128, 128);
            World.drawCharacterDirect(pCtx, 32, 16, 64, d.skin || 'steve');
        }
    }

    function showAchievements() {
        const grid = document.getElementById('achievements-grid');
        grid.innerHTML = '';
        const all = Achievements.getAll();

        all.forEach(a => {
            const div = document.createElement('div');
            div.className = `achievement-card ${a.earned ? 'earned' : 'locked'}`;
            div.innerHTML = `
                <div class="achievement-icon">${a.earned ? '\u2B50' : '\u{1F512}'}</div>
                <div class="achievement-info">
                    <span class="pixel-text achievement-name">${a.name}</span>
                    <span class="pixel-text achievement-desc">${a.desc}</span>
                </div>
            `;
            grid.appendChild(div);
        });
    }

    // Skin unlock celebration reveal
    function showUnlockReveal(skinId, skinDisplayName) {
        // Remove existing overlay if present
        let overlay = document.getElementById('skin-unlock-overlay');
        if (overlay) overlay.remove();

        overlay = document.createElement('div');
        overlay.id = 'skin-unlock-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;';

        const title = document.createElement('div');
        title.textContent = 'NEW SKIN UNLOCKED!';
        title.style.cssText = 'font-family:"Press Start 2P",monospace;font-size:18px;color:#FFD700;text-shadow:2px 2px 0 #8B6914,0 0 10px rgba(255,215,0,0.5);margin-bottom:24px;text-align:center;';
        overlay.appendChild(title);

        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 96;
        previewCanvas.height = 96;
        previewCanvas.style.cssText = 'image-rendering:pixelated;width:192px;height:192px;margin-bottom:16px;';
        overlay.appendChild(previewCanvas);

        const nameLabel = document.createElement('div');
        nameLabel.textContent = skinDisplayName;
        nameLabel.style.cssText = 'font-family:"Press Start 2P",monospace;font-size:14px;color:#fff;margin-bottom:24px;text-align:center;';
        overlay.appendChild(nameLabel);

        const btn = document.createElement('button');
        btn.textContent = 'Cool!';
        btn.className = 'pixel-btn';
        btn.style.cssText = 'font-family:"Press Start 2P",monospace;font-size:14px;padding:10px 32px;cursor:pointer;background:#5daa3a;color:#fff;border:3px solid #3a7232;';
        btn.addEventListener('click', () => {
            Audio.click();
            overlay.remove();
        });
        overlay.appendChild(btn);

        document.body.appendChild(overlay);

        // Draw the character on the preview canvas
        const pCtx = previewCanvas.getContext('2d');
        pCtx.imageSmoothingEnabled = false;
        World.drawCharacterDirect(pCtx, 24, 4, 48, skinId);

        // Fire confetti behind the overlay
        const celebCanvas = document.getElementById('celebration-canvas');
        if (celebCanvas && typeof Celebration !== 'undefined') {
            Celebration.start(celebCanvas);
        }
        Audio.levelUp();
    }

    // Achievement toast notification
    function showToast(text) {
        const toast = document.getElementById('achievement-toast');
        const desc = document.getElementById('toast-desc');
        desc.textContent = text;
        toast.classList.add('active');
        setTimeout(() => toast.classList.remove('active'), 3000);
    }

    // Milestone toast — celebrates learning progress
    function showMilestone(text, icon = '⭐') {
        const toast = document.getElementById('milestone-toast');
        const textEl = document.getElementById('milestone-text');
        const iconEl = toast.querySelector('.milestone-icon');
        textEl.textContent = text;
        iconEl.textContent = icon;
        toast.classList.add('active');
        Audio.milestone();
        setTimeout(() => toast.classList.remove('active'), 3500);
    }

    function getDailyChallengeSeed() {
        const d = new Date();
        return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    }

    function startDailyChallenge() {
        Audio.click();
        Audio.unlockAudio();
        stopCurrentGame();
        currentMode = 'mine';
        lastMode = 'mine';
        lastModeArgs = null;
        showScreen('game');

        // Reset hearts
        const heartsEl = document.getElementById('hud-hearts');
        heartsEl.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const h = document.createElement('div');
            h.className = 'heart';
            heartsEl.appendChild(h);
        }

        // Set daily 2x multiplier before starting mine mode
        MineMode.setDailyMultiplier(2);
        MineMode.start(Progress.get().world || 'plains');

        // Show daily mode label in HUD
        document.getElementById('hud-mode-label').textContent = 'DAILY CHALLENGE';
    }

    // Populate extra results elements (XP bar, mastered words, WPM trend)
    function populateResultsExtras(opts = {}) {
        // XP Progress Bar
        const xpInfo = Progress.getXPForNext();
        const d = Progress.get();
        document.getElementById('xp-bar-label').textContent = `Level ${d.level} ${Progress.getRank()}`;
        document.getElementById('xp-bar-text').textContent = `${xpInfo.current} / ${xpInfo.needed} XP`;
        // Animate the fill bar after a short delay
        const fill = document.getElementById('xp-bar-fill');
        fill.style.width = '0%';
        setTimeout(() => { fill.style.width = xpInfo.pct + '%'; }, 300);

        // Newly Mastered Words
        const masteredEl = document.getElementById('results-mastered');
        const masteredList = document.getElementById('mastered-words-list');
        const wordsAttempted = opts.wordsAttempted || [];
        const masteredWords = [];
        const learningWords = [];
        wordsAttempted.forEach(word => {
            const mastery = Progress.getSightWordMastery(word);
            if (mastery === 'mastered') masteredWords.push(word);
            else if (mastery === 'learning') learningWords.push(word);
        });
        // Show only newly progressed words (limit to 6 to not overflow)
        const showWords = [...masteredWords.slice(0, 4), ...learningWords.slice(0, 3)];
        if (showWords.length > 0) {
            masteredEl.style.display = 'block';
            masteredList.innerHTML = '';
            showWords.forEach((w, i) => {
                const span = document.createElement('span');
                const isMastered = masteredWords.includes(w);
                span.className = isMastered ? 'mastered-word' : 'mastered-word learning';
                span.textContent = (isMastered ? '⭐ ' : '📖 ') + w;
                span.style.animationDelay = (i * 0.15) + 's';
                masteredList.appendChild(span);
            });
        } else {
            masteredEl.style.display = 'none';
        }

        // WPM Trend (for bridge/enchant modes)
        const trendEl = document.getElementById('results-wpm-trend');
        if (opts.wpmType) {
            const recent = Progress.getRecentWPMs(opts.wpmType, 5);
            const goal = opts.wpmGoal || 13;
            if (recent.length >= 2) {
                trendEl.style.display = 'block';
                const barsEl = document.getElementById('wpm-trend-bars');
                barsEl.innerHTML = '';
                const maxWPM = Math.max(...recent, goal, 1);
                recent.forEach((wpm, i) => {
                    const bar = document.createElement('div');
                    bar.className = 'wpm-trend-bar';
                    if (wpm >= goal) bar.classList.add('meets-goal');
                    if (i === recent.length - 1) bar.classList.add('latest');
                    bar.style.height = Math.max(4, (wpm / maxWPM) * 28) + 'px';
                    bar.innerHTML = `<span class="bar-value">${wpm}</span>`;
                    barsEl.appendChild(bar);
                });
                // Trend label
                const labelEl = document.getElementById('wpm-trend-label');
                const last = recent[recent.length - 1];
                const prev = recent[recent.length - 2];
                if (last > prev) labelEl.textContent = '📈 Getting faster!';
                else if (last === prev) labelEl.textContent = '→ Steady pace!';
                else labelEl.textContent = '📉 Keep practicing!';
            } else {
                trendEl.style.display = 'none';
            }
        } else {
            trendEl.style.display = 'none';
        }

        // Best Scores Leaderboard
        const lbEl = document.getElementById('results-leaderboard');
        const lbEntries = document.getElementById('leaderboard-entries');
        if (opts.mode && opts.score !== undefined) {
            const scores = Progress.recordBestScore(opts.mode, opts.score);
            lbEl.style.display = 'block';
            lbEntries.innerHTML = '';
            scores.forEach((entry, i) => {
                const row = document.createElement('div');
                row.className = 'leaderboard-entry pixel-text' + (entry.score === opts.score && i === scores.findIndex(e => e.score === opts.score) ? ' current' : '');
                const dateStr = new Date(entry.date).toLocaleDateString();
                const unit = opts.mode === 'speed' ? '' : '%';
                row.innerHTML = `<span>#${i + 1}</span><span>${entry.score}${unit}</span><span>${dateStr}</span>`;
                lbEntries.appendChild(row);
            });
        } else {
            lbEl.style.display = 'none';
        }
    }

    // Encouraging wrong-answer messages for young learners
    const ENCOURAGE_MSGS = [
        "Almost! It's",
        "So close! It's",
        "Good try! It's",
        "Nice try! It's",
        "Keep going! It's",
        "You'll get it! It's",
        "Almost there! It's"
    ];
    let encourageIdx = 0;

    function getEncourageMsg(correctWord) {
        const msg = ENCOURAGE_MSGS[encourageIdx % ENCOURAGE_MSGS.length];
        encourageIdx++;
        return `${msg} "${correctWord}"`;
    }

    // Streak milestone celebration — call from game modes at streak milestones
    function celebrateStreak(streakCount) {
        if (streakCount === 5) {
            showToast('🔥 5 in a row! On fire!');
        } else if (streakCount === 10) {
            showToast('⚡ 10 streak! UNSTOPPABLE!');
        } else if (streakCount === 15) {
            showToast('🌟 PERFECT 15! LEGENDARY!');
        }
    }

    // Trigger purchased celebration effects on correct answers (at streak milestones)
    function triggerEffects(streak) {
        const d = Progress.get();
        // Pet reaction on every correct answer
        if (d.pet && (d.unlockedPets || []).includes(d.pet)) {
            World.triggerPetReaction();
        }
        const purchased = d.shopPurchases || [];
        if (purchased.length === 0) return;
        // Only trigger effects at streak milestones (every 5) to avoid spam
        if (streak > 0 && streak % 5 === 0) {
            const celebCanvas = document.getElementById('celebration-canvas');
            if (!celebCanvas) return;
            Celebration.stop();
            Celebration.setCanvas(celebCanvas);
            // Pick the best effect the player owns
            if (purchased.includes('rainbow')) {
                Celebration.rainbow(2500);
            } else if (purchased.includes('fireworks')) {
                Celebration.fireworks(2500);
            } else if (purchased.includes('confetti')) {
                Celebration.confetti(2000);
            }
        }
    }

    // Treasure chest bonus mini-game (30% chance after a game)
    function maybeTreasureBonus() {
        if (Math.random() > 0.30) return; // 30% chance
        const overlay = document.getElementById('treasure-overlay');
        const chestsEl = document.getElementById('treasure-chests');
        const resultEl = document.getElementById('treasure-result');
        resultEl.style.display = 'none';
        chestsEl.innerHTML = '';

        const rewards = [2, 3, 5, 8, 10, 15];
        // Pick 3 random rewards
        const picked = [];
        while (picked.length < 3) {
            const r = rewards[Math.floor(Math.random() * rewards.length)];
            picked.push(r);
        }

        picked.forEach((gems, i) => {
            const btn = document.createElement('button');
            btn.className = 'treasure-chest';
            btn.textContent = '\u{1F381}'; // wrapped gift box
            btn.addEventListener('click', () => {
                if (btn.classList.contains('opened')) return;
                // Reveal chosen
                btn.classList.add('opened');
                btn.textContent = '\u{1F4B0}'; // money bag
                chestsEl.querySelectorAll('.treasure-chest').forEach(c => {
                    if (c !== btn) c.classList.add('dim');
                });
                Progress.addGems(gems);
                resultEl.textContent = `+${gems} gems!`;
                resultEl.style.display = 'block';
                Audio.levelUp();
                // Auto-close after 2 seconds
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 2000);
            });
            chestsEl.appendChild(btn);
        });

        overlay.style.display = 'flex';
    }

    // Called by game modes when showing a question — sets up hint system
    function setQuestionHint(correctAnswer) {
        currentCorrectAnswer = correctAnswer;
        hintUsedThisQuestion = false;
        const hintBtn = document.getElementById('hint-btn');
        hintBtn.style.display = Progress.hasPowerup('hint-helper') ? '' : 'none';
    }

    return { init, showScreen, startGame, showToast, showUnlockReveal, showMilestone, populateResultsExtras, getEncourageMsg, celebrateStreak, triggerEffects, setQuestionHint, maybeTreasureBonus };
})();

// Boot the app
document.addEventListener('DOMContentLoaded', () => {
    Main.init();

    // Unlock audio (AudioContext + TTS) on first user interaction — critical for mobile/tablets
    const unlockOnGesture = () => {
        Audio.unlockAudio();
        document.removeEventListener('click', unlockOnGesture, true);
        document.removeEventListener('touchstart', unlockOnGesture, true);
    };
    document.addEventListener('click', unlockOnGesture, true);
    document.addEventListener('touchstart', unlockOnGesture, true);

    // Pause timed game modes when tab is backgrounded (prevents timer skew on tablets)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Auto-pause if in an active game
            const pauseBtn = document.getElementById('question-pause-btn');
            if (pauseBtn && pauseBtn.offsetParent !== null) {
                pauseBtn.click();
            }
        }
    });

    // Listen for skin unlock events from Progress.addXP
    document.addEventListener('skinUnlocked', (e) => {
        const { skinId, skinName } = e.detail;
        // Small delay so results screen / XP bar can update first
        setTimeout(() => Main.showUnlockReveal(skinId, skinName), 600);
    });
});

// Global error handler — catch runtime errors gracefully
window.onerror = function(msg, source, line, col, error) {
    console.error('Runtime error:', msg, 'at', source, line + ':' + col);
    return false;
};
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});
