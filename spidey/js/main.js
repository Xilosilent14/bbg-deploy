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
    const SESSION_MAX_MS = 12 * 60 * 1000;

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

        document.addEventListener('click', () => Audio.unlock(), { once: true });
        document.addEventListener('touchstart', () => Audio.unlock(), { once: true });

        _bindButtons();
        _showSplash();

        if (typeof OTBEcosystem !== 'undefined') {
            OTBEcosystem.checkDailyStreak();
        }
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

        if (screenId === 'home') _updateHome();
        else if (screenId === 'stickers') {
            StickerBook.render(document.getElementById('sticker-container'));
            const totalEl = document.getElementById('stickers-total');
            if (totalEl) totalEl.textContent = `${StickerBook.getTotalEarned()} / ${StickerBook.getTotalAvailable()}`;
        }
        else if (screenId === 'activities') _renderActivities();
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
        sessionStartTime = sessionStartTime || Date.now();
        roundCorrect = 0;
        roundTotal = 0;

        Audio.playWhoosh();
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
        }

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
            Audio.playTap();
            _showScreen('home');
        });
    }

    function _stopActivity() {
        if (currentActivity) {
            const mod = currentActivity.module();
            if (mod.stop) mod.stop();
            currentActivity = null;
        }
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

    return { init, showStickerEarned };
})();

document.addEventListener('DOMContentLoaded', Main.init);


// Global error handler - catch runtime errors gracefully
window.onerror = function(msg, source, line, col, error) {
    console.error("Runtime error:", msg, "at", source, line + ":" + col);
    return false;
};
window.addEventListener("unhandledrejection", function(event) {
    console.error("Unhandled promise rejection:", event.reason);
});

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
