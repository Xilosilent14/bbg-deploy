/**
 * Main — App controller for Spidey Academy V2
 * Screen navigation, XP/level display, streaks, daily bonus, badge checking.
 */
const Main = (() => {
    let currentScreen = 'splash';
    let currentActivity = null;
    let paused = false;
    let sessionStartTime = null;
    let roundCorrect = 0;
    let roundTotal = 0;
    let SESSION_MAX_MS = 12 * 60 * 1000;
    let _sessionWarnTimer = null;
    let _sessionWarnShown = false;
    let _sessionExtendedOnce = false;
    let _currentReplayText = '';

    const ACTIVITIES = [
        { id: 'color-catch', icon: '🎨', label: 'Color Catch', module: () => ColorCatch },
        { id: 'shape-builder', icon: '🔷', label: 'Shape Builder', module: () => ShapeBuilder },
        { id: 'number-bugs', icon: '🔢', label: 'Number Bugs', module: () => NumberBugs },
        { id: 'letter-web', icon: '🔤', label: 'Letter Web', module: () => LetterWeb },
        { id: 'sort-sweep', icon: '🧹', label: 'Sort Sweep', module: () => SortSweep }
    ];

    function init() {
        // Set BBG logo to hub URL
        if(typeof OTBConfig!=='undefined'){const u=OTBConfig.getHubUrl();const l=document.getElementById('bbg-logo-link');if(l)l.href=u;const l2=document.getElementById('title-bbg-logo-link');if(l2)l2.href=u;}

        Progress.load();
        Voice.init();
        Character.init();
        Celebration.init(document.getElementById('celebration-canvas'));
        Backgrounds.init();

        // Init splash character
        const splashChar = document.getElementById('splash-spidey');
        if (splashChar && Character._spideySVG) splashChar.innerHTML = Character._spideySVG;

        document.addEventListener('click', () => { Audio.unlock(); if (typeof Encouragement !== 'undefined') Encouragement.unlock(); }, { once: true });
        document.addEventListener('touchstart', () => { Audio.unlock(); if (typeof Encouragement !== 'undefined') Encouragement.unlock(); }, { once: true });

        _bindButtons();
        _checkDailyReturn();
        _showSplash();

        if (typeof OTBEcosystem !== 'undefined') {
            OTBEcosystem.checkDailyStreak();
        }
    }

    function _checkDailyReturn() {
        try {
            const data = Progress.data;
            if (!data || !data.lastPlayDate) return;
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const yStr = yesterday.toISOString().slice(0, 10);
            const todayStr = today.toISOString().slice(0, 10);
            if (data.lastPlayDate === yStr && data.lastPlayDate !== todayStr) {
                try { if (typeof Analytics !== 'undefined') Analytics.event('streak_day', { day: Progress.getStreak() }); } catch (_) {}
                _showReturnCelebration();
            }
        } catch (e) { /* ignore */ }
    }

    function _showReturnCelebration() {
        const overlay = document.createElement('div');
        overlay.className = 'return-celebration-overlay';
        overlay.innerHTML = `
            <div class="return-celebration-card">
                <div class="return-celebration-icon">🔥</div>
                <div class="return-celebration-text">Welcome back!</div>
                <div class="return-celebration-sub">You're keeping your streak alive!</div>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => {
            try { Voice.speak("Welcome back! You're keeping your streak alive!"); } catch (e) {}
        }, 200);
        setTimeout(() => { try { overlay.remove(); } catch (e) {} }, 2000);
    }

    function _showSplash() {
        _showScreen('splash');
        const name = Progress.getPlayerName();
        const greeting = Progress.getTimeGreeting();

        setTimeout(() => {
            Voice.speak(`${greeting}, ${name}! Welcome to Spidey Academy!`);
        }, 800);

        setTimeout(() => {
            _showScreen('title');
        }, 3000);
    }

    function _showDailyBonus() {
        Progress.claimDailyBonus();
        Character.excited();
        Audio.playCelebration();
        const streak = Progress.getStreak();
        if (streak >= 3) {
            // Bonus sticker for 3+ day streak
            const sticker = StickerBook.getNextUnearned();
            if (sticker) {
                Progress.awardSticker(sticker.id);
                _showStickerEarned(sticker);
                Voice.speak(`${streak} days in a row! Here's a bonus sticker!`);
            }
        }
    }

    function _showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById('screen-' + screenId);
        if (screen) {
            screen.classList.add('active');
            currentScreen = screenId;
        }
        try { if (typeof Analytics !== 'undefined') Analytics.event('screen_view', { screen: screenId }); } catch (_) {}

        if (screenId === 'home') _updateHome();
        else if (screenId === 'stickers') {
            StickerBook.render(document.getElementById('sticker-container'));
            const totalEl = document.getElementById('stickers-total');
            if (totalEl) totalEl.textContent = `${StickerBook.getTotalEarned()} / ${StickerBook.getTotalAvailable()}`;
        }
        else if (screenId === 'activities') _renderActivities();
        else if (screenId === 'title') {
            // Refresh streak chip + add idle-bob to the play button
            try {
                if (typeof StreakUI !== 'undefined') {
                    const titleContent = document.querySelector('#screen-title .title-content');
                    StreakUI.render(titleContent);
                }
                const playBtn = document.getElementById('btn-title-play');
                if (playBtn) playBtn.classList.add('idle-bob');
            } catch (_) {}
        }
    }

    function _updateHome() {
        const name = Progress.getPlayerName();
        const greeting = Progress.getTimeGreeting();

        const greetEl = document.getElementById('home-greeting');
        if (greetEl) greetEl.textContent = `${greeting}, ${name}!`;

        const levelBadge = document.getElementById('home-level-badge');
        if (levelBadge) levelBadge.textContent = `Lv.${Progress.getLevel()}`;

        const levelName = document.getElementById('home-level-name');
        if (levelName) levelName.textContent = Progress.getLevelName();

        const xpFill = document.getElementById('home-xp-fill');
        if (xpFill) {
            const pct = (Progress.getXPProgress() / Progress.getXPForNextLevel()) * 100;
            xpFill.style.width = pct + '%';
        }

        const stickerStat = document.getElementById('home-sticker-stat');
        if (stickerStat) stickerStat.textContent = `⭐ ${StickerBook.getTotalEarned()}/${StickerBook.getTotalAvailable()}`;

        const streakStat = document.getElementById('home-streak-stat');
        if (streakStat) {
            const s = Progress.getStreak();
            streakStat.textContent = s > 0 ? `🔥 ${s} day${s > 1 ? 's' : ''}` : '🔥 Play today!';
        }

        const badgeStat = document.getElementById('home-badge-stat');
        if (badgeStat) badgeStat.textContent = `🏅 ${Badges.getEarnedCount()}/${Badges.BADGE_DEFS.length}`;

        const gradeStat = document.getElementById('home-grade-stat');
        if (gradeStat) gradeStat.textContent = `📚 ${Progress.getGradeName()}`;

        // Render badges
        _renderBadges();
    }

    function _renderBadges() {
        const container = document.getElementById('home-badges');
        if (!container) return;
        const all = Badges.getAll();
        container.innerHTML = all.map(b => `
            <div class="home-badge ${b.earned ? 'earned' : 'locked'}" title="${b.name}: ${b.desc}">
                <div class="home-badge-icon">${b.icon}</div>
            </div>
        `).join('');
    }

    function _renderActivities() {
        const grid = document.getElementById('activity-grid');
        if (!grid) return;

        grid.innerHTML = ACTIVITIES.map(act => {
            const stats = Progress.getStats(act.id);
            const stars = stats.lastStars || 0;
            const starDisplay = stars > 0
                ? `<div class="activity-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>`
                : `<div class="activity-stars dim">☆☆☆</div>`;

            return `
                <button class="activity-card" data-activity="${act.id}">
                    <span class="activity-icon">${act.icon}</span>
                    <span class="activity-label">${act.label}</span>
                    ${starDisplay}
                </button>
            `;
        }).join('');

        grid.querySelectorAll('.activity-card').forEach(card => {
            card.addEventListener('click', () => {
                Audio.playTap();
                _startActivity(card.dataset.activity);
            });
            card.addEventListener('mouseenter', () => {
                const act = ACTIVITIES.find(a => a.id === card.dataset.activity);
                if (act) Voice.speak(act.label);
            });
        });

        setTimeout(() => Voice.speak('Pick a game!'), 300);
    }

    function _startActivity(activityId) {
        const act = ACTIVITIES.find(a => a.id === activityId);
        if (!act) return;

        currentActivity = act;
        paused = false;
        document.getElementById('activity-pause-overlay').classList.remove('active');
        if (!sessionStartTime) {
            sessionStartTime = Date.now();
            _sessionWarnShown = false;
            _sessionExtendedOnce = false;
        }
        _scheduleSessionWarning();
        roundCorrect = 0;
        roundTotal = 0;

        Audio.playWhoosh();
        try { if (typeof Analytics !== 'undefined') Analytics.event('activity_start', { activity: activityId, grade: Progress.getGradeLevel() }); } catch (_) {}
        Backgrounds.setActivity(activityId);
        _showScreen('activity');

        const container = document.getElementById('activity-container');
        container.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'activity-header';
        header.innerHTML = `
            <button class="back-btn" id="activity-back">◀</button>
            <span class="activity-title">${act.icon} ${act.label}</span>
        `;
        container.appendChild(header);

        document.getElementById('activity-back').addEventListener('click', () => {
            _stopActivity();
            Audio.playTap();
            _showScreen('activities');
        });

        const gameArea = document.createElement('div');
        gameArea.className = 'game-area';
        gameArea.id = 'game-area';
        container.appendChild(gameArea);

        const mod = act.module();
        mod.start(gameArea, (correct, total) => _onActivityComplete(correct, total));
    }

    function _onActivityComplete(correct, total) {
        if (correct !== undefined) {
            roundCorrect = correct;
            roundTotal = total;
        }

        // Record with star rating
        if (currentActivity) {
            Progress.recordActivityPlayed(currentActivity.id, roundCorrect, roundTotal);
            try {
                if (typeof Analytics !== 'undefined') {
                    Analytics.event('activity_complete', {
                        activity: currentActivity.id,
                        correct: roundCorrect,
                        total: roundTotal,
                        acc: roundTotal > 0 ? Math.round((roundCorrect / roundTotal) * 100) / 100 : 0
                    });
                }
            } catch (_) {}
        }

        // Variable-reward mystery egg: roll once per session after activity completes.
        try {
            if (typeof MysteryEgg !== 'undefined') {
                setTimeout(() => MysteryEgg.maybeOffer(roundCorrect), 800);
            }
        } catch (_) {}

        // Ecosystem integration: XP, coins, and answer tracking
        if (typeof OTBEcosystem !== 'undefined') {
            const accuracy = total > 0 ? correct / total : 0;
            const xpReward = Math.floor(10 + (accuracy * 40));
            const coinReward = Math.floor(accuracy * 10);
            OTBEcosystem.addXP(xpReward, currentActivity ? currentActivity.id : 'unknown');
            OTBEcosystem.addCoins(coinReward, currentActivity ? currentActivity.id : 'unknown');
        }

        // Check for level up
        const newLevel = Progress.consumeLevelUp();
        if (newLevel) {
            _showLevelUp(newLevel);
        }

        // Check for grade advance
        const newGrade = Progress.checkGradeAdvance();
        if (newGrade) {
            setTimeout(() => _showGradeUp(newGrade), newLevel ? 3500 : 500);
        }

        // Check for new badges
        const newBadges = Badges.checkAll();
        const badgeDelay = newLevel ? 3000 : (newGrade ? 4000 : 500);
        if (newBadges.length > 0) {
            setTimeout(() => _showBadgeEarned(newBadges[0]), badgeDelay);
        }

        // Session time check
        if (sessionStartTime && Date.now() - sessionStartTime > SESSION_MAX_MS) {
            setTimeout(() => _showSessionEnd(), newLevel ? 3500 : 1000);
            return;
        }

        const delay = newLevel ? 3500 : (newBadges.length > 0 ? 4000 : 500);
        setTimeout(() => _showScreen('activities'), delay);
    }

    function _showLevelUp(level) {
        const overlay = document.getElementById('level-up-overlay');
        const levelEl = document.getElementById('level-up-level');
        const nameEl = document.getElementById('level-up-name');
        if (!overlay) return;

        levelEl.textContent = `Level ${level}`;
        nameEl.textContent = Progress.getLevelName();
        overlay.style.display = 'flex';

        Audio.playCelebration();
        Celebration.confetti(3000);
        Character.celebrate();
        Voice.speak(`Level ${level}! You are now a ${Progress.getLevelName()}!`);

        setTimeout(() => { overlay.style.display = 'none'; }, 3500);
    }

    function _showGradeUp(gradeLevel) {
        const overlay = document.createElement('div');
        overlay.className = 'grade-up-overlay';
        overlay.innerHTML = `
            <div class="grade-up-card">
                <div class="grade-up-icon">📚</div>
                <div class="grade-up-text">Grade Up!</div>
                <div class="grade-up-name">${Progress.getGradeName()}</div>
            </div>
        `;
        document.body.appendChild(overlay);
        Audio.playCelebration();
        Celebration.confetti(3000);
        Character.celebrate();
        Voice.speak(`Amazing! You moved up to ${Progress.getGradeName()}!`);
        setTimeout(() => overlay.remove(), 3500);
    }

    function _showBadgeEarned(badge) {
        const overlay = document.getElementById('badge-overlay');
        const iconEl = document.getElementById('badge-earned-icon');
        const nameEl = document.getElementById('badge-earned-name');
        if (!overlay) return;

        iconEl.innerHTML = badge.icon;
        nameEl.textContent = badge.name;
        overlay.style.display = 'flex';

        Audio.playSticker();
        Celebration.starBurst(window.innerWidth / 2, window.innerHeight / 2);
        Voice.speak(`New badge! ${badge.name}!`);

        setTimeout(() => { overlay.style.display = 'none'; }, 3000);
    }

    function _showStickerEarned(sticker) {
        try { if (typeof Analytics !== 'undefined') Analytics.event('sticker_earned', { id: sticker && sticker.id }); } catch (_) {}
        Audio.playSticker();
        const overlay = document.createElement('div');
        overlay.className = 'sticker-earned-overlay';
        overlay.innerHTML = `
            <div class="sticker-earned-card">
                <div class="sticker-earned-svg">${sticker.svg}</div>
                <div class="sticker-earned-text">New Sticker!</div>
                <div class="sticker-earned-name">${sticker.name}</div>
            </div>
        `;
        document.body.appendChild(overlay);
        Celebration.starBurst(window.innerWidth / 2, window.innerHeight / 2);
        setTimeout(() => overlay.remove(), 2500);
    }

    // Exposed for activities to call
    function showStickerEarned(sticker) { _showStickerEarned(sticker); }

    function _showSessionEnd() {
        const container = document.getElementById('activity-container');
        container.innerHTML = `
            <div class="session-end">
                <div class="session-end-text">Great job today!</div>
                <div class="session-end-stickers">
                    You earned ${StickerBook.getTotalEarned()} stickers!
                </div>
                <div class="session-end-level">Level ${Progress.getLevel()} - ${Progress.getLevelName()}</div>
                <button class="big-btn btn-play" id="session-end-btn">Done!</button>
            </div>
        `;
        Voice.speak('Great job today! Time for a break!');
        Audio.playCelebration();
        Celebration.confetti();

        document.getElementById('session-end-btn').addEventListener('click', () => {
            sessionStartTime = null;
            if (_sessionWarnTimer) { clearTimeout(_sessionWarnTimer); _sessionWarnTimer = null; }
            _sessionWarnShown = false;
            _sessionExtendedOnce = false;
            SESSION_MAX_MS = 12 * 60 * 1000; // reset
            Audio.playTap();
            _showScreen('home');
        });
    }

    function _stopActivity() {
        try { if (typeof HintCascade !== 'undefined') HintCascade.stop(); } catch (e) {}
        if (currentActivity) {
            const mod = currentActivity.module();
            if (mod.stop) mod.stop();
            currentActivity = null;
        }
    }

    function _scheduleSessionWarning() {
        if (_sessionWarnTimer) { clearTimeout(_sessionWarnTimer); _sessionWarnTimer = null; }
        if (_sessionWarnShown || !sessionStartTime) return;
        const elapsed = Date.now() - sessionStartTime;
        const remainingToWarn = (SESSION_MAX_MS - 60000) - elapsed;
        if (remainingToWarn <= 0) return; // already past warn window
        _sessionWarnTimer = setTimeout(_showSessionWarning, remainingToWarn);
    }

    function _showSessionWarning() {
        if (_sessionWarnShown) return;
        _sessionWarnShown = true;
        const overlay = document.createElement('div');
        overlay.className = 'session-warn-overlay';
        overlay.innerHTML = `
            <div class="session-warn-card">
                <div class="session-warn-icon">⏰</div>
                <div class="session-warn-text">Almost time for a break!</div>
                <div class="session-warn-sub">One minute left.</div>
                <div class="session-warn-btns">
                    <button class="big-btn btn-play session-warn-keep" id="session-warn-keep">▶ Keep playing!</button>
                    <button class="big-btn session-warn-break" id="session-warn-break">🛋 Take a break</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        try { Voice.speak('Almost time for a break! Do you want to keep playing or take a break?'); } catch (e) {}

        const keepBtn = overlay.querySelector('#session-warn-keep');
        const breakBtn = overlay.querySelector('#session-warn-break');
        if (keepBtn) keepBtn.addEventListener('click', () => {
            try { Audio.playTap(); } catch (e) {}
            if (!_sessionExtendedOnce) {
                _sessionExtendedOnce = true;
                SESSION_MAX_MS += 5 * 60 * 1000;
                _sessionWarnShown = false; // allow one more warning at the new boundary
                _scheduleSessionWarning();
            }
            overlay.remove();
        });
        if (breakBtn) breakBtn.addEventListener('click', () => {
            try { Audio.playTap(); } catch (e) {}
            overlay.remove();
            // Force session end on next activity complete by leaving sessionStartTime,
            // and immediately ending: stop activity, show session end.
            try { if (typeof HintCascade !== 'undefined') HintCascade.stop(); } catch (e) {}
            _stopActivity();
            _showSessionEnd();
        });
    }

    // Voice replay helper — activities call this when rendering a prompt.
    // Stashes the current narration so the on-screen replay button can re-speak it.
    function setPromptForReplay(text) {
        _currentReplayText = text || '';
    }
    function replayPrompt() {
        if (_currentReplayText) {
            try { Voice.speak(_currentReplayText); } catch (e) {}
        }
    }
    /**
     * attachVoiceReplay(container, text)
     *   Adds a big "Hear again" button to the .activity-prompt block of
     *   `container`, registers the text for replay, and wires the click.
     *   Safe to call repeatedly when rebuilding HTML — it removes any prior
     *   replay button first.
     */
    function attachVoiceReplay(container, text) {
        if (!container) return;
        setPromptForReplay(text);
        const prompt = container.querySelector('.activity-prompt');
        if (!prompt) return;
        // Remove existing replay button if present
        const existing = prompt.querySelector('.voice-replay-btn');
        if (existing) existing.remove();
        const btn = document.createElement('button');
        btn.className = 'voice-replay-btn';
        btn.setAttribute('aria-label', 'Hear again');
        btn.textContent = '🔊 Hear again';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            try { Audio.playTap(); } catch (_) {}
            replayPrompt();
            try { if (typeof HintCascade !== 'undefined') HintCascade.tap(); } catch (_) {}
        });
        prompt.appendChild(btn);
    }

    function _pauseActivity() {
        paused = true;
        document.getElementById('activity-pause-overlay').classList.add('active');
    }

    function _resumeActivity() {
        paused = false;
        document.getElementById('activity-pause-overlay').classList.remove('active');
    }

    function _bindButtons() {
        document.getElementById('btn-title-play')?.addEventListener('click', () => {
            Audio.playTap();
            _showScreen('home');
            if (Progress.isDailyBonus()) {
                _showDailyBonus();
            }
        });
        document.getElementById('btn-play')?.addEventListener('click', () => {
            Audio.playTap();
            Audio.playWhoosh();
            _showScreen('activities');
        });
        document.getElementById('btn-stickers')?.addEventListener('click', () => {
            Audio.playTap();
            _showScreen('stickers');
        });
        document.getElementById('btn-stickers-back')?.addEventListener('click', () => {
            Audio.playTap();
            _showScreen('home');
        });
        document.getElementById('btn-activities-back')?.addEventListener('click', () => {
            Audio.playTap();
            _showScreen('home');
        });
        document.getElementById('btn-activity-home')?.addEventListener('click', () => {
            Audio.playTap();
            _showScreen('home');
        });
        document.getElementById('btn-activity-pause')?.addEventListener('click', () => {
            Audio.playTap();
            _pauseActivity();
        });
        document.getElementById('btn-activity-resume')?.addEventListener('click', () => {
            Audio.playTap();
            _resumeActivity();
        });
        document.getElementById('btn-activity-quit')?.addEventListener('click', () => {
            Audio.playTap();
            _resumeActivity();
            _stopActivity();
            _showScreen('activities');
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && currentScreen === 'activity' && !paused) {
                _pauseActivity();
            }
        });
        document.getElementById('btn-hub')?.addEventListener('click', () => {
            window.location.href = OTBConfig.getHubUrl();
        });
        document.getElementById('btn-parents')?.addEventListener('click', () => {
            Audio.playTap();
            _showScreen('parent-gate');
            ParentDashboard.showGate();
        });
        document.getElementById('btn-parent-back')?.addEventListener('click', () => {
            Audio.playTap();
            _showScreen('home');
        });
    }

    return { init, showStickerEarned, setPromptForReplay, replayPrompt, attachVoiceReplay };
})();

document.addEventListener('DOMContentLoaded', Main.init);


// Global error handling lives in js/error-boundary.js (structured [bbg.err] logs).

// ===========================================================
// PWA: Service Worker + Install Prompt
// Moved from index.html inline script to satisfy CSP script-src 'self'
// ===========================================================
(function _pwaInit() {
    if ('serviceWorker' in navigator) {
        try {
            var swPath = (typeof OTBConfig !== 'undefined' && !OTBConfig.isLocal) ? '/sw.js' : 'sw.js';
            navigator.serviceWorker.register(swPath).catch(function() {});
        } catch (e) {}
    }
    setTimeout(function() {
        try {
            if (typeof OTBConfig !== 'undefined') {
                var u = OTBConfig.getHubUrl();
                ['bbg-logo-link', 'title-bbg-logo-link'].forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) el.href = u;
                });
            }
        } catch (e) {}
    }, 0);
    var _deferredInstall = null;
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        _deferredInstall = e;
        try {
            var banner = document.getElementById('pwa-install-banner');
            if (banner) banner.style.display = 'flex';
        } catch (e) {}
    });
    try {
        var banner = document.getElementById('pwa-install-banner');
        if (banner) {
            var btns = banner.querySelectorAll('button');
            if (btns[0]) btns[0].addEventListener('click', function() {
                if (_deferredInstall) {
                    _deferredInstall.prompt();
                    _deferredInstall.userChoice.then(function() {
                        _deferredInstall = null;
                        banner.style.display = 'none';
                    });
                }
            });
            if (btns[1]) btns[1].addEventListener('click', function() {
                banner.style.display = 'none';
            });
        }
    } catch (e) {}
})();
