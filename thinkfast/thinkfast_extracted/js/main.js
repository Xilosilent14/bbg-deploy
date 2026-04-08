// ===== MAIN APP CONTROLLER V4 =====
const Main = {
    currentScreen: 'title',
    selectedSubject: null,
    selectedTopic: null,
    lastRaceResults: null,
    _sessionRaceCount: 0, // V5.7: Track races in this session for break suggestion
    _sessionStartTime: Date.now(), // V5.8: Session timer for enforced breaks
    _breakEnforced: false, // V5.8: Whether a break has been enforced this session

    // V4: Title car animation
    _titleCarCanvas: null,
    _titleCarCtx: null,
    _titleCarX: 0,
    _titleCarAnimating: false,

    init() {
        this._bindButtons();
        this._updateTitleScreen();
        this._showScreen('title');

        // First-time welcome flow
        if (!Progress.data.playerName && Progress.data.totalRaces === 0) {
            this._showWelcome();
        }

        document.addEventListener('click', () => Audio.resume(), { once: true });
        document.addEventListener('touchstart', () => Audio.resume(), { once: true });

        // Reset daily challenge if new day
        Progress.resetDailyChallengeIfNewDay();

        // Check streak milestones on load
        const milestones = Progress.checkStreakMilestones();
        if (milestones.length > 0) {
            setTimeout(() => {
                milestones.forEach(m => {
                    Audio.speak(`Streak bonus! ${m.days} day streak! You earned ${m.reward} bonus stars!`);
                });
            }, 1000);
        }

        // V4: Start menu music after first interaction
        document.addEventListener('click', () => {
            Audio.startMenuMusic();
        }, { once: true });
        document.addEventListener('touchstart', () => {
            Audio.startMenuMusic();
        }, { once: true });

        // V6: Preload car sprites (non-blocking)
        CorvetteRenderer.loadAllSprites();

        // V17: Remove splash loading screen
        const splash = document.getElementById('splash-loading');
        if (splash) splash.remove();

        // V4: Start animated title car
        this._initTitleCar();

        // V4: Initialize settings UI
        this._updateSettingsUI();
        // V5.8: Apply saved contrast setting
        if (Settings.get('contrast')) document.body.classList.add('high-contrast');
    },

    // ---- SCREEN MANAGEMENT ----
    _showScreen(id) {
        const oldScreen = document.querySelector('.screen.active');
        const newScreen = document.getElementById(`screen-${id}`);
        if (!newScreen) return;

        // Fade transition
        if (oldScreen && oldScreen !== newScreen) {
            oldScreen.classList.add('screen-exit');
            newScreen.classList.add('screen-enter');
            newScreen.classList.add('active');

            setTimeout(() => {
                oldScreen.classList.remove('active', 'screen-exit');
                newScreen.classList.remove('screen-enter');
            }, 200);
        } else {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            newScreen.classList.add('active');
        }

        this.currentScreen = id;

        // V17: Stop title car animation when leaving title (prevents RAF memory leak)
        if (id !== 'title') {
            this._titleCarAnimating = false;
        }

        if (id === 'title') {
            this._updateTitleScreen();
            Audio.startMenuMusic();
            // V17: Restart title car animation if it was stopped
            if (!this._titleCarAnimating) {
                this._titleCarAnimating = true;
                this._animateTitleCar();
            }
        }

        // V4: Stop menu music for race
        if (id === 'race') {
            Audio.stopMusic();
        }
    },

    _updateTitleScreen() {
        this._updateTitleBadge();
        this._updateStreakDisplay();
        this._updateDailyChallenge();
    },

    _updateTitleBadge() {
        const badge = document.getElementById('title-level-badge');
        if (!badge) return;
        const lvl = Progress.data.playerLevel;
        const rank = Progress.getRank();
        const xpProgress = Progress.getXPProgress();
        badge.innerHTML = `
            <div class="level-badge-icon">Lv ${lvl}</div>
            <div class="level-badge-rank">${rank}</div>
            <div class="level-badge-bar"><div class="level-badge-fill" style="width:${Math.round(xpProgress * 100)}%"></div></div>
        `;
    },

    // V5.5: Enhanced streak display with day dots
    _updateStreakDisplay() {
        const el = document.getElementById('title-streak');
        if (!el) return;
        const streak = Progress.data.dailyStreak || 0;
        if (streak >= 1) {
            // Show up to 7 dots for visual streak progress
            const maxDots = 7;
            const filledDots = Math.min(streak, maxDots);
            let dots = '';
            for (let i = 0; i < maxDots; i++) {
                dots += `<div class="streak-dot ${i < filledDots ? 'filled' : ''}"></div>`;
            }
            const label = streak === 1 ? '1 day' : `${streak} day streak!`;
            el.innerHTML = `
                <div class="streak-badge">
                    <span class="streak-flame">🔥</span>
                    <span>${label}</span>
                    <span class="streak-days">${dots}</span>
                </div>
            `;
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    },

    // Daily challenge badge on title
    _updateDailyChallenge() {
        const el = document.getElementById('title-daily');
        if (!el) return;
        if (Progress.isDailyChallengeCompleted()) {
            el.innerHTML = '<span class="daily-done">✅ Daily Challenge Complete!</span>';
        } else {
            const daily = Progress.getDailyChallenge();
            el.innerHTML = `<span class="daily-badge" id="daily-badge-btn">${daily.topicIcon} Daily Challenge: ${daily.topicName} <span class="daily-bonus">+2⭐</span></span>`;
            // V17: Daily click handled by one-time delegation in _bindButtons()
        }

        // V5.8: Weekly challenge on title
        const wc = Progress.getWeeklyChallenge();
        if (wc && !wc.claimed) {
            const pct = Math.min(100, Math.round((wc.progress / wc.goal) * 100));
            el.innerHTML += `<div style="font-size:0.7rem;color:#aaa;margin-top:4px;">${wc.icon} Weekly: ${wc.desc} (${Math.min(wc.progress, wc.goal)}/${wc.goal})${wc.completed ? ' ✅' : ''}</div>`;
        }
    },

    // V4: Animated title screen car
    _initTitleCar() {
        const container = document.getElementById('title-car');
        if (!container) return;

        container.innerHTML = '<canvas id="title-car-canvas" width="280" height="80"></canvas>';
        this._titleCarCanvas = document.getElementById('title-car-canvas');
        if (!this._titleCarCanvas) return;
        this._titleCarCtx = this._titleCarCanvas.getContext('2d');
        this._titleCarX = -80;
        this._titleCarAnimating = true;
        this._animateTitleCar();
    },

    _animateTitleCar() {
        if (!this._titleCarAnimating || !this._titleCarCtx) return;
        const ctx = this._titleCarCtx;
        const w = 280, h = 80;

        ctx.clearRect(0, 0, w, h);

        // Move car across
        this._titleCarX += 1.2;
        if (this._titleCarX > w + 80) this._titleCarX = -80;

        const cx = this._titleCarX;
        const cy = 40;

        // Exhaust particles
        const t = Date.now() * 0.005;
        for (let i = 0; i < 3; i++) {
            const px = cx - 35 - i * 12 - Math.sin(t + i) * 5;
            const py = cy + 3 + Math.sin(t * 2 + i) * 4;
            const alpha = Math.max(0, 0.3 - i * 0.1);
            ctx.fillStyle = `rgba(150,150,150,${alpha})`;
            ctx.beginPath();
            ctx.arc(px, py, 3 + i * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // V5: Draw car using CorvetteRenderer with current generation
        const color = Game.getPlayerColor();
        const carType = Progress.data.carType || 'c1';
        CorvetteRenderer.drawCar(ctx, carType, cx, cy, 65, 28, color, {
            lod: 'title', isPlayer: true, wheelAngle: Date.now() * 0.01
        });

        requestAnimationFrame(() => this._animateTitleCar());
    },

    // ---- BUTTON BINDINGS ----
    _bindButtons() {
        document.getElementById('btn-math-race').addEventListener('click', () => {
            Audio.playClick();
            this.selectedSubject = 'math';
            this._showTopics('math');
        });
        document.getElementById('btn-reading-race').addEventListener('click', () => {
            Audio.playClick();
            this.selectedSubject = 'reading';
            this._showTopics('reading');
        });
        // Quick Race: auto-pick subject + topic based on weak areas
        document.getElementById('btn-quick-race').addEventListener('click', () => {
            Audio.playClick();
            this._startQuickRace();
        });
        document.getElementById('btn-garage').addEventListener('click', () => {
            Audio.playClick();
            Garage.render();
            this._showScreen('garage');
        });
        document.getElementById('btn-map').addEventListener('click', () => {
            Audio.playClick();
            this._renderMap();
            this._showScreen('map');
        });
        document.getElementById('btn-parent').addEventListener('click', () => {
            Audio.playClick();
            // V5.8: Parent PIN gate
            this._parentPINGate(() => {
                ParentDashboard.render();
                this._showScreen('parent');
            });
        });

        // V4: Settings button
        document.getElementById('btn-settings').addEventListener('click', () => {
            Audio.playClick();
            this._updateSettingsUI();
            this._showScreen('settings');
        });

        // Back buttons
        document.getElementById('btn-map-back').addEventListener('click', () => { Audio.playClick(); this._showScreen('title'); });
        document.getElementById('btn-topics-back').addEventListener('click', () => { Audio.playClick(); this._showScreen('title'); });
        document.getElementById('btn-garage-back').addEventListener('click', () => { Audio.playClick(); this._showScreen('title'); });
        document.getElementById('btn-parent-back').addEventListener('click', () => { Audio.playClick(); this._showScreen('title'); });
        document.getElementById('btn-settings-back').addEventListener('click', () => { Audio.playClick(); this._showScreen('title'); });

        // V17: Daily challenge click via one-time event delegation
        const titleDaily = document.getElementById('title-daily');
        if (titleDaily) {
            titleDaily.addEventListener('click', (e) => {
                const badge = e.target.closest('#daily-badge-btn');
                if (!badge) return;
                if (Progress.isDailyChallengeCompleted()) return;
                const daily = Progress.getDailyChallenge();
                Audio.playClick();
                this.selectedSubject = daily.subject;
                this.selectedTopic = daily.topicId;
                this._startRace(daily.subject, daily.topicId);
            });
        }

        // Results buttons
        document.getElementById('btn-race-again').addEventListener('click', () => {
            Audio.playClick();
            this._showTopics(this.selectedSubject);
        });
        document.getElementById('btn-same-race').addEventListener('click', () => {
            Audio.playClick();
            if (this.selectedSubject && this.selectedTopic) {
                this._startRace(this.selectedSubject, this.selectedTopic);
            } else {
                this._showTopics(this.selectedSubject || 'math');
            }
        });

        document.getElementById('btn-results-menu').addEventListener('click', () => {
            Audio.playClick();
            this._showScreen('title');
        });

        document.getElementById('btn-replay-question').addEventListener('click', () => {
            Questions.replayQuestion();
        });

        // V5.8: Pause button
        document.getElementById('btn-pause').addEventListener('click', () => {
            this._togglePause();
        });
        document.getElementById('btn-resume').addEventListener('click', () => {
            this._togglePause();
        });
        document.getElementById('btn-quit-race').addEventListener('click', () => {
            Game.running = false;
            Game.paused = false;
            document.getElementById('pause-overlay').style.display = 'none';
            this._showScreen('title');
        });

        // V4: Settings toggles
        document.getElementById('toggle-sound').addEventListener('click', () => {
            const on = Settings.toggle('sound');
            this._updateSettingsUI();
            if (on) Audio.playClick();
        });
        document.getElementById('toggle-music').addEventListener('click', () => {
            const on = Settings.toggle('music');
            this._updateSettingsUI();
            if (on) {
                Audio.startMenuMusic();
            } else {
                Audio.stopMusic();
            }
        });
        document.getElementById('toggle-voice').addEventListener('click', () => {
            Settings.toggle('voice');
            this._updateSettingsUI();
        });

        // V5.8: High contrast toggle
        document.getElementById('toggle-contrast').addEventListener('click', () => {
            Settings.toggle('contrast');
            document.body.classList.toggle('high-contrast', Settings.get('contrast'));
            this._updateSettingsUI();
        });

        // V18: Keyboard support for settings toggles (Enter/Space triggers click)
        ['toggle-sound', 'toggle-music', 'toggle-voice', 'toggle-contrast'].forEach(id => {
            document.getElementById(id).addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    document.getElementById(id).click();
                }
            });
        });

        // V11: Grade level selector
        document.querySelectorAll('.grade-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const grade = btn.dataset.grade;
                Adaptive.resetToGrade(grade);
                Audio.playClick();
                this._updateSettingsUI();
            });
        });
    },

    // V4: Update settings toggle visuals
    _updateSettingsUI() {
        const items = [
            { id: 'toggle-sound', key: 'sound' },
            { id: 'toggle-music', key: 'music' },
            { id: 'toggle-voice', key: 'voice' },
            { id: 'toggle-contrast', key: 'contrast' }
        ];
        items.forEach(item => {
            const el = document.getElementById(item.id);
            if (!el) return;
            const on = Settings.get(item.key);
            el.classList.toggle('on', on);
            el.classList.toggle('off', !on);
            el.setAttribute('aria-checked', on ? 'true' : 'false'); // V18: ARIA sync
            const statusEl = el.querySelector('.toggle-status');
            if (statusEl) statusEl.textContent = on ? 'ON' : 'OFF';
        });

        // V11: Grade selector highlight
        const currentGrade = Progress.data.gradeLevel || 'prek';
        document.querySelectorAll('.grade-btn').forEach(btn => {
            btn.classList.toggle('grade-active', btn.dataset.grade === currentGrade);
        });

        // V5.8: Difficulty display (V11: updated for 6 levels)
        const diffEl = document.getElementById('difficulty-display');
        if (diffEl) {
            let html = '';
            const allTopics = [
                { subject: 'math', topics: MathData.topics },
                { subject: 'reading', topics: ReadingData.topics }
            ];
            const colors = ['#9b59b6', '#8e44ad', '#3498db', '#2ecc71', '#f39c12', '#e74c3c'];
            allTopics.forEach(({ subject, topics }) => {
                html += `<div style="font-size:0.75rem;color:#aaa;margin-top:6px;text-transform:uppercase;">${subject}</div>`;
                topics.forEach(t => {
                    const lvl = Adaptive.getLevel(subject, t.id);
                    const label = Adaptive.getLevelLabel(lvl);
                    html += `<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:0.75rem;">`;
                    html += `<span style="color:#ccc;">${t.name}</span>`;
                    html += `<span style="color:${colors[lvl]};font-weight:700;">${label}</span></div>`;
                });
            });
            diffEl.innerHTML = html;
        }
    },

    // V5.8: Parent PIN gate — simple math problem to keep kids out
    _parentPINGate(callback) {
        const a = Math.floor(Math.random() * 20) + 10;
        const b = Math.floor(Math.random() * 20) + 10;
        const answer = prompt(`Parent check: What is ${a} + ${b}?`);
        if (answer !== null && parseInt(answer) === a + b) {
            callback();
        }
    },

    // V5.8: Pause/resume race
    _togglePause() {
        if (!Game.running) return;
        Game.paused = !Game.paused;
        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            pauseBtn.textContent = Game.paused ? '▶ Play' : '⏸';
        }
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.style.display = Game.paused ? 'flex' : 'none';
        }
        if (Game.paused) {
            Audio.stopMusic();
        } else {
            if (Settings.get('music')) Audio.startRaceMusic();
        }
    },

    // ---- TOPIC SELECT ----
    _showTopics(subject) {
        const title = document.getElementById('topics-title');
        const gradeLabel = Adaptive.getGradeLabel();
        title.textContent = subject === 'math' ? `🔢 Math Challenge (${gradeLabel})` : `📖 Reading Challenge (${gradeLabel})`;

        const grid = document.getElementById('topics-grid');
        grid.innerHTML = '';

        const allTopics = subject === 'math' ? MathData.topics : ReadingData.topics;
        const grade = Progress.data.gradeLevel || 'prek';
        const hiddenIds = Adaptive.getHiddenTopics(subject, grade);
        const topics = allTopics.filter(t => !hiddenIds.includes(t.id));
        const suggestedTopics = Adaptive.getSuggestedTopics(subject);
        const suggestedIds = suggestedTopics.map(t => t.id);

        topics.forEach(topic => {
            const card = document.createElement('div');
            card.className = 'topic-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `${topic.name} ${topic.icon}`);

            const isSuggested = suggestedIds.includes(topic.id);

            card.innerHTML = `
                <div class="topic-icon">${topic.icon}</div>
                <div class="topic-name">${topic.name}</div>
                ${isSuggested ? '<div class="topic-suggested">Suggested!</div>' : ''}
            `;
            const startTopic = () => {
                Audio.playClick();
                this.selectedTopic = topic.id;
                this._startRace(subject, topic.id);
            };
            card.addEventListener('click', startTopic);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startTopic(); }
            });
            grid.appendChild(card);
        });

        // Random Mix
        const mixCard = document.createElement('div');
        mixCard.className = 'topic-card';
        mixCard.setAttribute('role', 'button');
        mixCard.setAttribute('tabindex', '0');
        mixCard.setAttribute('aria-label', 'Random Mix');
        mixCard.innerHTML = `
            <div class="topic-icon">🎲</div>
            <div class="topic-name">Random Mix</div>
        `;
        const startMix = () => {
            Audio.playClick();
            const picked = Adaptive.pickWeightedTopic(subject);
            this.selectedTopic = picked.id;
            this._startRace(subject, picked.id);
        };
        mixCard.addEventListener('click', startMix);
        mixCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startMix(); }
        });
        grid.appendChild(mixCard);

        this._showScreen('topics');
    },

    // ---- START RACE ----
    // Smart Quick Race: pick subject + topic based on weak areas and recency
    _startQuickRace() {
        // Alternate between math and reading, weighted by weakness
        const mathWeak = Adaptive.getWeakTopics('math');
        const readWeak = Adaptive.getWeakTopics('reading');
        const mathSuggested = Adaptive.getSuggestedTopics('math');
        const readSuggested = Adaptive.getSuggestedTopics('reading');

        // Prefer the subject with more weak or neglected topics
        const mathScore = mathWeak.length * 2 + mathSuggested.length;
        const readScore = readWeak.length * 2 + readSuggested.length;

        let subject;
        if (mathScore > readScore + 2) {
            subject = 'math';
        } else if (readScore > mathScore + 2) {
            subject = 'reading';
        } else {
            subject = Math.random() < 0.5 ? 'math' : 'reading';
        }

        const topic = Adaptive.pickWeightedTopic(subject);
        this.selectedSubject = subject;
        this.selectedTopic = topic.id;
        this._startRace(subject, topic.id);
    },

    _startRace(subject, topic) {
        // V5.8: Enforce 30-minute play session limit
        const sessionMinutes = (Date.now() - this._sessionStartTime) / 60000;
        if (sessionMinutes >= 30 && !this._breakEnforced) {
            this._breakEnforced = true;
            Audio.playBreakChime();
            Audio.speak('Great job today! Time for a break. Come back soon!');
            this._showBreakScreen();
            return;
        }

        this._showScreen('race');
        Adaptive.resetRaceAdjustments();

        // V17: Show GET READY overlay to mask loading freeze
        const readyOverlay = document.createElement('div');
        readyOverlay.id = 'ready-overlay';
        readyOverlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:50;';
        readyOverlay.innerHTML = '<div style="text-align:center;color:#fff;"><div style="font-size:3rem;">🏁</div><div style="font-size:2rem;font-weight:700;margin-top:8px;">GET READY!</div></div>';
        document.getElementById('screen-race').appendChild(readyOverlay);

        // Double-rAF ensures browser paints overlay before heavy startRace()
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                Game.startRace(subject, topic, Progress.data.currentTrack);
                setTimeout(() => {
                    if (readyOverlay.parentNode) readyOverlay.remove();
                }, 400);
            });
        });
    },

    // V5.8: Show enforced break screen
    _showBreakScreen() {
        const overlay = document.createElement('div');
        overlay.id = 'break-screen';
        overlay.style.cssText = 'position:fixed;inset:0;background:linear-gradient(135deg,#1a1a2e,#16213e);z-index:999;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = `
            <div style="text-align:center;color:#fff;padding:32px;">
                <div style="font-size:3rem;margin-bottom:16px;">🌟</div>
                <h2 style="font-size:1.5rem;margin-bottom:12px;">Break Time!</h2>
                <p style="font-size:1rem;margin-bottom:8px;color:#aaa;">You've been racing for 30 minutes.<br>Your brain needs a rest to learn best!</p>
                <p style="font-size:0.9rem;color:#ffd700;margin-bottom:24px;">Go play, stretch, or have a snack!</p>
                <button class="btn btn-primary" id="btn-break-continue" style="font-size:1rem;padding:12px 32px;">
                    ✅ I Took a Break!
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('btn-break-continue').addEventListener('click', () => {
            this._sessionStartTime = Date.now();
            overlay.remove();
        });
    },

    // ---- FIRST-TIME WELCOME FLOW ----
    _showWelcome() {
        const overlay = document.getElementById('welcome-overlay');
        overlay.style.display = 'flex';
        let selectedGrade = null;

        // Grade buttons
        document.querySelectorAll('.btn-welcome-grade').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-welcome-grade').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedGrade = btn.dataset.grade;
                document.getElementById('btn-welcome-go').style.display = '';
                Audio.playClick();
            });
        });

        // Go button
        document.getElementById('btn-welcome-go').addEventListener('click', () => {
            // V18: Sanitize player name — strip HTML-like chars, cap length
            const raw = document.getElementById('welcome-name').value.trim();
            const name = raw.replace(/[<>&"']/g, '').substring(0, 20) || 'Racer';
            Progress.data.playerName = name;
            if (selectedGrade) {
                Adaptive.resetToGrade(selectedGrade);
            }
            Progress.save();
            Audio.playClick();

            // Fade out welcome
            overlay.style.animation = 'welcome-fade-out 0.4s forwards';
            setTimeout(() => {
                overlay.style.display = 'none';
                this._updateTitleScreen();
                // Auto-start their first Quick Race
                Audio.speak(`Let's go, ${name}!`);
                setTimeout(() => this._startQuickRace(), 800);
            }, 400);
        });
    },

    // ---- SHOW RESULTS ----
    showResults(results) {
        this.lastRaceResults = results;
        this._showScreen('results');

        // Podium celebration
        this._renderPodium(results.standings);

        // Animated stars (staggered reveal)
        const starsEl = document.getElementById('results-stars');
        starsEl.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            span.className = 'result-star';
            span.textContent = i < results.stars ? '⭐' : '☆';
            if (i < results.stars) {
                span.classList.add('star-earned');
                span.style.animationDelay = `${i * 0.4}s`;
            }
            starsEl.appendChild(span);
        }

        // V4: Star earn sound per star + V14: sparkle burst on each star
        for (let i = 0; i < results.stars; i++) {
            setTimeout(() => {
                Audio.playStarEarn();
                // Sparkle burst on the star element
                const starEl = starsEl.children[i];
                if (starEl) this._spawnStarBurst(starEl);
            }, 400 + i * 400);
        }

        // Title
        const title = document.getElementById('results-title');
        if (results.stars === 3) {
            title.textContent = '🏆 AMAZING! 🏆';
        } else if (results.stars === 2) {
            title.textContent = '🎉 Great Race!';
        } else {
            title.textContent = '🏁 Race Complete!';
        }

        // Stats — kid-friendly visual display
        const statsEl = document.getElementById('results-stats');
        let statsHTML = '<div class="results-answers">';
        for (let i = 0; i < results.total; i++) {
            if (i < results.correct) {
                statsHTML += '<span class="answer-dot correct-dot" style="animation-delay:' + (i * 0.1) + 's">✓</span>';
            } else {
                statsHTML += '<span class="answer-dot wrong-dot" style="animation-delay:' + (i * 0.1) + 's">✗</span>';
            }
        }
        statsHTML += '</div>';
        statsHTML += `<div class="results-streak">🔥 Best Streak: ${results.streak}x</div>`;
        // V8: Race time and best time
        if (results.raceTime) {
            const mins = Math.floor(results.raceTime / 60);
            const secs = Math.round(results.raceTime % 60);
            statsHTML += `<div class="results-time">⏱️ ${mins}:${secs.toString().padStart(2, '0')}`;
            if (results.isNewBest) {
                statsHTML += ' <span class="new-best-badge">NEW BEST!</span>';
            }
            statsHTML += '</div>';
        }
        // V9: Medal earned
        if (results.medal) {
            const medalIcons = { gold: '🥇', silver: '🥈', bronze: '🥉' };
            const medalLabels = { gold: 'Gold Medal!', silver: 'Silver Medal!', bronze: 'Bronze Medal!' };
            statsHTML += `<div class="results-medal ${results.medal}">${medalIcons[results.medal]} ${medalLabels[results.medal]}</div>`;
        }
        // V14: XP count-up animation + progress bar
        const xpProgress = Math.round(Progress.getXPProgress() * 100);
        const xpForNext = Progress.getXPForNextLevel();
        statsHTML += `<div class="results-xp-section">`;
        statsHTML += `<div class="results-xp" id="results-xp-counter">+0 XP</div>`;
        if (xpForNext) {
            statsHTML += `<div class="results-xp-bar"><div class="results-xp-fill" id="results-xp-fill" style="width:0%"></div></div>`;
            statsHTML += `<div class="results-xp-label">Level ${Progress.data.playerLevel} — ${xpProgress}%</div>`;
        }
        statsHTML += `</div>`;
        if (results.bonusStars > 0) {
            statsHTML += `<div class="results-bonus">+${results.bonusStars} ⭐ Bonus!</div>`;
        }
        if (results.bonusCorrect) {
            statsHTML += `<div class="results-bonus">🌟 Bonus Challenge Correct!</div>`;
        }
        // V8: Track challenge result
        if (results.challengeDesc) {
            if (results.challengeCompleted) {
                statsHTML += `<div class="results-bonus">${results.challengeIcon} Challenge Complete: ${results.challengeDesc} +1⭐</div>`;
            } else {
                statsHTML += `<div style="font-size:0.8rem;color:#888;">${results.challengeIcon} Challenge: ${results.challengeDesc} — not yet!</div>`;
            }
        }
        statsEl.innerHTML = statsHTML;

        // V14: Animate XP count-up and progress bar
        this._animateXPCounter(results.xp, xpProgress);

        // Level-up display
        const levelUpEl = document.getElementById('results-level-up');
        if (results.levelUp && results.levelUp.leveledUp) {
            const rank = Progress.getRank();
            const rankChanged = results.levelUp.rankChanged;

            if (rankChanged) {
                levelUpEl.innerHTML = `
                    <div class="level-up-banner rank-up">
                        <div class="level-up-text">NEW RANK!</div>
                        <div class="level-up-level">${results.levelUp.newRank} — Level ${Progress.data.playerLevel}</div>
                    </div>
                `;
            } else {
                levelUpEl.innerHTML = `
                    <div class="level-up-banner">
                        <div class="level-up-text">LEVEL UP!</div>
                        <div class="level-up-level">Level ${Progress.data.playerLevel} — ${rank}</div>
                    </div>
                `;
            }
            levelUpEl.style.display = 'block';

            // V4: Check if new car type unlocked
            this._checkCarTypeUnlockNotification();
        } else {
            levelUpEl.style.display = 'none';
        }

        // Achievements display — V8: animated toast popups
        const achEl = document.getElementById('results-achievements');
        if (results.newAchievements && results.newAchievements.length > 0) {
            let achHTML = '';
            results.newAchievements.forEach((a, i) => {
                achHTML += `<div class="achievement-toast" style="animation-delay:${i * 0.5 + 0.3}s">
                    <div class="achievement-toast-icon">${a.icon}</div>
                    <div class="achievement-toast-info">
                        <div class="achievement-toast-label">Achievement Unlocked!</div>
                        <div class="achievement-toast-name">${a.name}</div>
                        <div class="achievement-toast-desc">${a.desc}</div>
                    </div>
                </div>`;
            });
            achEl.innerHTML = achHTML;
            achEl.style.display = 'block';
            Audio.playAchievement();
        } else {
            achEl.style.display = 'none';
        }

        // V5.8: Weekly challenge progress
        Progress.updateWeeklyChallenge(results);
        const wc = Progress.getWeeklyChallenge();
        if (wc && !wc.claimed) {
            let wcHTML = `<div style="margin-top:8px;padding:8px 14px;background:rgba(100,100,255,0.12);border:1px solid rgba(100,100,255,0.3);border-radius:8px;font-size:0.85rem;">`;
            wcHTML += `<span style="color:#aaa;">Weekly:</span> ${wc.icon} ${wc.desc}`;
            wcHTML += ` — <span style="color:#ffd700;font-weight:700;">${Math.min(wc.progress, wc.goal)}/${wc.goal}</span>`;
            if (wc.completed && !wc.claimed) {
                wcHTML += ` <button class="btn btn-small" id="btn-claim-weekly" style="margin-left:8px;background:#ffd700;color:#000;">Claim ⭐${wc.reward}</button>`;
            }
            wcHTML += `</div>`;
            achEl.innerHTML = (achEl.innerHTML || '') + wcHTML;
            achEl.style.display = 'block';
            // Bind claim button
            setTimeout(() => {
                const claimBtn = document.getElementById('btn-claim-weekly');
                if (claimBtn) {
                    claimBtn.addEventListener('click', () => {
                        const reward = Progress.claimWeeklyReward();
                        if (reward > 0) {
                            Audio.playPurchase();
                            claimBtn.textContent = `Claimed! +${reward}⭐`;
                            claimBtn.disabled = true;
                        }
                    });
                }
            }, 100);
        }

        // V5.7: Session break suggestion after 3+ races
        this._sessionRaceCount++;
        const breakEl = document.getElementById('results-break-suggestion');
        if (breakEl) {
            if (this._sessionRaceCount >= 4 && this._sessionRaceCount % 2 === 0) {
                breakEl.innerHTML = '<div class="break-suggestion">🌟 Great job! Maybe take a short break? Your brain needs rest to learn best!</div>';
                breakEl.style.display = 'block';
                Audio.playBreakChime();
            } else if (this._sessionRaceCount === 3) {
                breakEl.innerHTML = '<div class="break-suggestion">⭐ 3 races done! You\'re doing awesome!</div>';
                breakEl.style.display = 'block';
            } else {
                breakEl.style.display = 'none';
            }
        }

        // Celebration
        setTimeout(() => {
            const rankChanged = results.levelUp && results.levelUp.rankChanged;
            if (rankChanged) {
                Celebration.fireworks(4000);
                Audio.playFanfare();
                setTimeout(() => Audio.playCrowdCheer(), 500);
            } else if (results.stars === 3) {
                Celebration.trophy();
                setTimeout(() => Audio.playCrowdCheer(), 400);
            } else if (results.stars >= 2) {
                Celebration.confetti(3000);
                Audio.playVictory();
                setTimeout(() => Audio.playCrowdCheer(), 300);
            } else {
                Celebration.confetti(1500);
                Audio.playVictory();
            }
        }, 300);

        // Speak results
        setTimeout(() => {
            let speech = '';
            if (results.stars === 3) {
                speech = 'Amazing! You got three stars! You are a racing champion!';
            } else if (results.stars === 2) {
                speech = 'Great race! You earned two stars!';
            } else {
                speech = 'Good job! Keep practicing to earn more stars!';
            }

            if (results.levelUp && results.levelUp.leveledUp) {
                if (results.levelUp.rankChanged) {
                    speech += ` New rank! You are now a ${results.levelUp.newRank}!`;
                } else {
                    speech += ` Level up! You are now Level ${Progress.data.playerLevel}, ${Progress.getRank()}!`;
                }
            }

            if (results.newAchievements && results.newAchievements.length > 0) {
                speech += ` Achievement unlocked: ${results.newAchievements.map(a => a.name).join(' and ')}!`;
            }

            Audio.speak(speech);
        }, 500);
    },

    // V4: Notify when car type unlocked by leveling
    // V14: Sparkle burst around a star element on results screen
    _spawnStarBurst(el) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const colors = ['#ffd700', '#fff', '#ffaa00', '#ffe066', '#ff6b35'];

        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            const angle = (Math.PI * 2 / 12) * i;
            const dist = 30 + Math.random() * 40;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            const size = 3 + Math.random() * 5;
            const color = colors[Math.floor(Math.random() * colors.length)];

            p.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;border-radius:50%;background:${color};pointer-events:none;z-index:9999;box-shadow:0 0 ${size + 2}px ${color};`;
            document.body.appendChild(p);

            p.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${dx}px,${dy}px) scale(0)`, opacity: 0 }
            ], { duration: 400 + Math.random() * 200, easing: 'cubic-bezier(0,0.8,0.3,1)', fill: 'forwards' }).onfinish = () => p.remove();
        }
    },

    // V14: Animated XP count-up with progress bar fill
    _animateXPCounter(targetXP, targetPct) {
        const counter = document.getElementById('results-xp-counter');
        const fill = document.getElementById('results-xp-fill');
        if (!counter) return;

        const duration = 1200;
        const startTime = Date.now();
        const startPct = Math.max(0, targetPct - (targetXP / (Progress.getXPForNextLevel() || 100)) * 100);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);

            const currentXP = Math.round(eased * targetXP);
            counter.textContent = `+${currentXP} XP`;

            if (fill) {
                const currentPct = startPct + (targetPct - startPct) * eased;
                fill.style.width = `${Math.min(100, currentPct)}%`;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        // Delay start so it's visible after screen transition
        setTimeout(() => requestAnimationFrame(animate), 600);
    },

    _checkCarTypeUnlockNotification() {
        const level = Progress.data.playerLevel;
        const carTypes = Garage.carTypes || [];
        carTypes.forEach(ct => {
            if (level >= ct.unlockLevel && !Progress.hasCarType(ct.id)) {
                Progress.unlockCarType(ct.id);
                setTimeout(() => {
                    Audio.playPowerUp();
                    Audio.speak(`New car unlocked! The ${ct.name}! Check the garage to equip it.`);
                }, 2000);
            }
        });
    },

    // V6: Podium celebration
    _renderPodium(standings) {
        // Remove old podium if any
        const old = document.getElementById('podium-container');
        if (old) old.remove();

        if (!standings || standings.length < 3) return;

        const top3 = standings.slice(0, 3);
        const container = document.createElement('div');
        container.id = 'podium-container';
        container.className = 'podium-container';

        // Order: 2nd, 1st, 3rd for visual layout
        const order = [top3[1], top3[0], top3[2]];
        const places = ['2nd', '1st', '3rd'];
        const heights = [60, 80, 45];
        const delays = [0.3, 0.1, 0.5];

        order.forEach((entry, i) => {
            const col = document.createElement('div');
            col.className = 'podium-col';
            col.style.animationDelay = delays[i] + 's';

            // Car image
            const carImg = document.createElement('img');
            carImg.src = 'img/cars/' + entry.gen + '.png';
            carImg.className = 'podium-car' + (entry.isPlayer ? ' podium-player' : '');
            carImg.style.animationDelay = (delays[i] + 0.2) + 's';
            col.appendChild(carImg);

            // V8: Name label
            const nameLabel = document.createElement('div');
            nameLabel.className = 'podium-label podium-name';
            nameLabel.textContent = entry.name || places[i];
            if (entry.isPlayer) nameLabel.classList.add('podium-player-label');
            col.appendChild(nameLabel);

            // Place label
            const label = document.createElement('div');
            label.className = 'podium-label';
            label.textContent = places[i];
            if (entry.isPlayer) label.classList.add('podium-player-label');
            col.appendChild(label);

            // Podium block
            const block = document.createElement('div');
            block.className = 'podium-block podium-block-' + places[i].replace('nd','').replace('st','').replace('rd','');
            block.style.height = heights[i] + 'px';
            block.style.animationDelay = delays[i] + 's';
            col.appendChild(block);

            container.appendChild(col);
        });

        // Insert before results-stars
        const resultsContent = document.querySelector('.results-content');
        const starsEl = document.getElementById('results-stars');
        if (resultsContent && starsEl) {
            resultsContent.insertBefore(container, starsEl);
        }
    },

    // ---- ROAD TRIP MAP ----
    _renderMap() {
        const container = document.getElementById('map-container');
        const tracks = Game.tracks;
        const currentTrack = Progress.data.currentTrack;

        let html = '<div class="map-road">';
        html += '<div class="map-line"><div class="map-line-filled" style="width:' +
            Math.round((currentTrack / (tracks.length - 1)) * 100) + '%"></div></div>';

        tracks.forEach((track, i) => {
            const unlocked = Progress.data.tracksUnlocked[i];
            const isCurrent = i === currentTrack;
            const icons = ['🏠', '🏖️', '⛰️', '🏜️', '🏙️', '🌃', '🏆', '🌌'];

            let cls = 'map-stop';
            if (isCurrent) cls += ' current';
            else if (unlocked) cls += ' unlocked';
            else cls += ' locked';
            if (track.secret) cls += ' secret';

            // V5.3: Show stars earned on this track
            const threeStars = (Progress.data._threeStarTracks || []).includes(i);
            const raced = (Progress.data.tracksRacedOn || []).includes(i);
            let starsDisplay = '';
            if (unlocked && raced) {
                starsDisplay = threeStars ? '⭐⭐⭐' : '⭐';
            }

            // V5.3: Unlock hint for locked tracks
            let unlockHint = '';
            if (!unlocked) {
                unlockHint = track.secret
                    ? '<div class="stop-hint">??? Get 3 stars on all tracks!</div>'
                    : `<div class="stop-hint">Get ${i + 1} stars to unlock!</div>`;
            }

            // V8: Best time display + V9: Medal
            const best = Progress.getTrackBest(i);
            let bestTimeHTML = '';
            if (best && unlocked) {
                const mins = Math.floor(best.time / 60);
                const secs = Math.round(best.time % 60);
                const medal = Game.getMedal(i, best.time);
                const medalIcon = medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : medal === 'bronze' ? '🥉' : '';
                bestTimeHTML = `<div class="stop-best">${medalIcon} ${mins}:${secs.toString().padStart(2, '0')}</div>`;
            }

            html += `
                <div class="${cls}" data-track-index="${i}">
                    <div class="stop-icon">${icons[i]}</div>
                    <div class="stop-name">${(!unlocked && track.secret) ? '???' : track.name}</div>
                    <div class="stop-stars">${starsDisplay}</div>
                    ${bestTimeHTML}
                    ${unlockHint}
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Tappable unlocked tracks
        container.querySelectorAll('.map-stop.unlocked, .map-stop.current').forEach(stop => {
            stop.style.cursor = 'pointer';
            stop.setAttribute('role', 'button');
            stop.setAttribute('tabindex', '0');
            const selectTrack = () => {
                Audio.playClick();
                const idx = parseInt(stop.dataset.trackIndex);
                if (!isNaN(idx) && Progress.data.tracksUnlocked[idx]) {
                    Progress.data.currentTrack = idx;
                    Progress.save();
                    this._renderMap();
                }
            };
            stop.addEventListener('click', selectTrack);
            stop.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTrack(); }
            });
        });
    }
};

// V18: Global error handler — catch runtime errors gracefully instead of silent freeze
window.onerror = function(msg, source, line, col, error) {
    console.error('Runtime error:', msg, 'at', source, line + ':' + col);
    // If the game freezes during a race, show a recovery option
    if (Game && Game.running) {
        Game.running = false;
        try { Main._showScreen('title'); } catch (e) { /* best-effort recovery */ }
    }
    return false; // Let the browser still log the error
};
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    Main.init();
});
