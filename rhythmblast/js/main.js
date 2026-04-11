/* ============================================
   RHYTHM BLAST — Main Controller
   Screen navigation, UI wiring, splash/title/songs/results
   ============================================ */
const Main = (() => {
    let currentScreen = null;
    let currentSongId = null;
    let titleAnimId = null;

    // Title screen background animation
    function _startTitleAnim() {
        const canvas = document.getElementById('title-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.offsetWidth || 1024;
        canvas.height = canvas.parentElement.offsetHeight || 600;
        const W = canvas.width, H = canvas.height;
        const particles = [];
        const colors = ['#22d3ee', '#a855f7', '#ec4899', '#facc15', '#4ade80'];

        function animate() {
            ctx.clearRect(0, 0, W, H);
            // Spawn new particles
            if (particles.length < 40 && Math.random() < 0.15) {
                particles.push({
                    x: Math.random() * W,
                    y: -20,
                    vy: 0.5 + Math.random() * 1.5,
                    size: 3 + Math.random() * 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 0.3 + Math.random() * 0.4,
                    shape: Math.random() < 0.5 ? 'circle' : 'note'
                });
            }
            // Update and draw
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.y += p.vy;
                p.alpha -= 0.002;
                if (p.y > H || p.alpha <= 0) { particles.splice(i, 1); continue; }
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Music note shape
                    ctx.font = `${p.size * 3}px serif`;
                    ctx.fillText('\u266A', p.x, p.y);
                }
            }
            ctx.globalAlpha = 1;
            titleAnimId = requestAnimationFrame(animate);
        }
        animate();
    }

    function _stopTitleAnim() {
        if (titleAnimId) { cancelAnimationFrame(titleAnimId); titleAnimId = null; }
    }

    function init() {
        // Set BBG logo to hub URL
        if(typeof OTBConfig!=='undefined'){const u=OTBConfig.getHubUrl();const l=document.getElementById('bbg-logo-link');if(l)l.href=u;}

        // Apply saved settings
        const settings = Progress.getSettings();
        Audio.setSettings(settings);

        // Wire buttons
        document.getElementById('btn-play').addEventListener('click', () => {
            Audio.unlock();
            showScreen('songs');
        });
        document.getElementById('btn-achievements').addEventListener('click', () => showScreen('achievements'));
        document.getElementById('btn-achievements-back').addEventListener('click', () => showScreen('title'));
        document.getElementById('btn-settings').addEventListener('click', () => showScreen('settings'));
        document.getElementById('btn-parent').addEventListener('click', () => showScreen('parent'));
        document.getElementById('btn-songs-back').addEventListener('click', () => showScreen('title'));
        document.getElementById('btn-settings-back').addEventListener('click', () => showScreen('title'));
        document.getElementById('btn-parent-back').addEventListener('click', () => showScreen('title'));

        // Game controls
        document.getElementById('btn-pause').addEventListener('click', _pauseGame);
        document.getElementById('btn-resume').addEventListener('click', _resumeGame);
        document.getElementById('btn-quit').addEventListener('click', _quitSong);
        document.getElementById('btn-hud-back').addEventListener('click', () => {
            Game.stop();
            if (_countdownInterval) { clearInterval(_countdownInterval); _countdownInterval = null; }
            document.getElementById('countdown').style.display = 'none';
            document.getElementById('pause-overlay').style.display = 'none';
            showScreen('title');
        });

        // Results buttons
        document.getElementById('btn-replay').addEventListener('click', () => {
            if (currentSongId) _startSong(currentSongId);
        });
        document.getElementById('btn-songs-menu').addEventListener('click', () => showScreen('songs'));
        document.getElementById('btn-results-home').addEventListener('click', () => showScreen('title'));

        // Settings toggles
        document.querySelectorAll('.otb-settings-item').forEach(item => {
            item.addEventListener('click', () => {
                const key = item.dataset.setting;
                const track = item.querySelector('.otb-toggle-track');
                const isOn = track.classList.contains('on');
                track.classList.toggle('on');
                item.classList.toggle('on');
                Progress.saveSetting(key, !isOn);
            });
        });

        // Difficulty selector
        _setupDifficulty();

        // Parent lock
        _setupParentLock();

        // Game canvas touch input
        const gameCanvas = document.getElementById('game-canvas');
        gameCanvas.addEventListener('click', (e) => {
            const rect = gameCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            Game.handleTap(x, y);
        });
        // Touch events for mobile
        gameCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = gameCanvas.getBoundingClientRect();
            for (const touch of e.changedTouches) {
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                Game.handleTap(x, y);
            }
        }, { passive: false });

        // Splash -> Title
        setTimeout(() => {
            const splash = document.getElementById('splash');
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                showScreen('title');
                _updatePlayerInfo();
            }, 500);
        }, 2000);

        // Init ecosystem daily streak
        if (typeof OTBEcosystem !== 'undefined') {
            OTBEcosystem.checkDailyStreak();
        }
    }

    function showScreen(name) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        // Show target
        const screen = document.getElementById('screen-' + name);
        if (screen) {
            screen.classList.add('active');
            currentScreen = name;
        }

        // Screen-specific setup
        if (name === 'songs') _buildSongGrid();
        if (name === 'achievements') _buildAchievementsScreen();
        if (name === 'title') {
            _updatePlayerInfo(); _startTitleAnim();
            // Play menu music
            if (!window._rbBgm) {
                window._rbBgm = document.createElement('audio'); window._rbBgm.src = 'assets/sounds/music/bgm-menu.mp3';
                window._rbBgm.loop = true;
                window._rbBgm.volume = 0.15;
            }
            window._rbBgm.play().catch(() => {});
        } else {
            _stopTitleAnim();
            if (window._rbBgm && name === 'game') { window._rbBgm.pause(); window._rbBgm.currentTime = 0; }
        }
    }

    function _updatePlayerInfo() {
        const nameEl = document.getElementById('player-name');
        const levelEl = document.getElementById('player-level');
        if (typeof OTBEcosystem !== 'undefined') {
            const profile = OTBEcosystem.getProfile();
            const level = OTBEcosystem.getLevelInfo();
            if (profile.playerName) nameEl.textContent = profile.playerName;
            levelEl.textContent = `Lv. ${level.level}`;

            // Streak badge
            const streakEl = document.getElementById('title-streak-badge');
            if (streakEl && profile.dailyStreak > 0) {
                streakEl.textContent = '\uD83D\uDD25 ' + profile.dailyStreak + ' day streak!';
                streakEl.style.display = '';
            }
        }

        // Stars badge
        const starsEl = document.getElementById('title-stars-badge');
        if (starsEl) {
            const totalStars = Progress.getTotalStars();
            starsEl.textContent = '\u2B50 ' + totalStars + ' Stars';
        }

        // Achievement count
        const achEl = document.getElementById('title-achievement-count');
        if (achEl && typeof Achievements !== 'undefined') {
            const count = Achievements.getEarnedCount();
            const total = Achievements.definitions.length;
            if (count > 0) {
                achEl.textContent = '\uD83C\uDFC6 ' + count + '/' + total;
                achEl.style.display = '';
            }
        }
    }

    function _buildSongGrid() {
        const grid = document.getElementById('songs-grid');
        const totalStars = Progress.getTotalStars();
        const songs = SongData.getAllSongs();

        grid.innerHTML = songs.map(song => {
            const stars = Progress.getSongStars(song.id);
            const locked = totalStars < song.starsRequired;
            const starDisplay = locked ? '🔒' :
                '⭐'.repeat(stars.stars) + '☆'.repeat(3 - stars.stars);
            const diffDots = Array.from({ length: 3 }, (_, i) =>
                `<div class="diff-dot ${i < song.difficulty ? 'filled' : ''}"></div>`
            ).join('');

            return `
                <div class="song-card ${locked ? 'locked' : ''}" data-song="${song.id}" tabindex="0">
                    <div class="song-banner ${song.bannerClass}">
                        <span style="font-size:2rem;z-index:1;">${song.emoji}</span>
                        ${locked ? '<span class="lock-icon">🔒</span>' : ''}
                    </div>
                    <div class="song-info">
                        <div class="song-name">${song.name}</div>
                        <div class="song-meta">${song.bpm} BPM</div>
                        <div class="song-stars">${starDisplay}</div>
                        <div class="song-difficulty">${diffDots}</div>
                        ${stars.highScore > 0 ? `<div class="song-meta">Best: ${stars.highScore}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Wire click handlers
        grid.querySelectorAll('.song-card:not(.locked)').forEach(card => {
            card.addEventListener('click', () => {
                const songId = card.dataset.song;
                _startSong(songId);
            });
        });
    }

    function _startSong(songId) {
        const song = SongData.getSong(songId);
        if (!song) return;

        currentSongId = songId;
        showScreen('game');

        // Update HUD
        document.getElementById('hud-song-name').textContent = song.name;
        document.getElementById('hud-score').textContent = '0';
        document.getElementById('hud-combo').textContent = '';

        // Init game canvas
        Game.init(document.getElementById('game-canvas'));

        // Countdown
        _doCountdown(() => {
            Game.startSong(song, _onSongEnd);
        });
    }

    let _countdownInterval = null;
    function _doCountdown(callback) {
        // Clear any existing countdown (prevents stacking)
        if (_countdownInterval) { clearInterval(_countdownInterval); _countdownInterval = null; }

        const overlay = document.getElementById('countdown');
        const numEl = document.getElementById('countdown-num');
        overlay.style.display = 'flex';

        let count = 3;
        numEl.textContent = count;
        Audio.countdown();

        _countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                numEl.textContent = count;
                numEl.style.animation = 'none';
                void numEl.offsetWidth;
                numEl.style.animation = 'count-pulse 0.5s ease-out';
                Audio.countdown();
            } else {
                numEl.textContent = 'GO!';
                numEl.style.color = '#4ade80';
                numEl.style.animation = 'none';
                void numEl.offsetWidth;
                numEl.style.animation = 'count-pulse 0.5s ease-out';
                Audio.countdownGo();
                clearInterval(_countdownInterval);
                _countdownInterval = null;
                setTimeout(() => {
                    overlay.style.display = 'none';
                    numEl.style.color = '';
                    callback();
                }, 600);
            }
        }, 800);
    }

    function _onSongEnd(result) {
        showScreen('results');

        // Confetti celebration
        if (result.stars >= 1) {
            Game.startConfetti();
        }

        // Title
        const gradeColors = { S: '#ffd700', A: '#4ade80', B: '#22d3ee', C: '#f59e0b', D: '#e74c3c' };
        document.getElementById('results-grade').textContent = result.grade;
        document.getElementById('results-grade').style.color = gradeColors[result.grade] || '#fff';

        // Stars
        const starsEl = document.getElementById('results-stars');
        starsEl.innerHTML = Array.from({ length: 3 }, (_, i) =>
            `<span class="otb-star ${i < result.stars ? 'earned' : 'empty'}">${i < result.stars ? '⭐' : '☆'}</span>`
        ).join('');

        // Stats
        document.getElementById('results-stats').innerHTML = `
            <div>Score: <strong>${result.score}</strong></div>
            <div>Accuracy: <strong>${Math.round(result.accuracy * 100)}%</strong></div>
            <div>Best Combo: <strong>${result.maxCombo}x</strong></div>
            <div>Perfect: ${result.perfects} | Great: ${result.greats} | OK: ${result.oks} | Miss: ${result.misses}</div>
        `;

        // XP
        document.getElementById('results-xp').textContent = `+${result.xpEarned} XP`;

        // Save progress
        Progress.recordSongResult(result.songId, result);

        // Check achievements
        if (typeof Achievements !== 'undefined') {
            const newAch = Achievements.checkAfterSong(result);
            if (newAch.length > 0) {
                // Show achievement toast
                newAch.forEach(ach => {
                    const toast = document.createElement('div');
                    toast.className = 'achievement-toast';
                    toast.textContent = `${ach.icon} ${ach.name}`;
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                });
            }
        }
    }

    function _pauseGame() {
        Game.pause();
        document.getElementById('pause-overlay').style.display = 'flex';
    }

    function _resumeGame() {
        document.getElementById('pause-overlay').style.display = 'none';
        Game.resume();
    }

    function _quitSong() {
        Game.stop();
        document.getElementById('pause-overlay').style.display = 'none';
        showScreen('songs');
    }

    function _setupDifficulty() {
        const selector = document.getElementById('difficulty-selector');
        if (!selector) return;
        const current = Progress.getSettings().difficulty || 'normal';
        // Set initial active state
        selector.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === current);
            btn.addEventListener('click', () => {
                selector.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                Progress.saveSetting('difficulty', btn.dataset.diff);
            });
        });
    }

    function _setupParentLock() {
        const a = Math.floor(Math.random() * 10) + 5;
        const b = Math.floor(Math.random() * 10) + 3;
        document.getElementById('parent-math').textContent = `${a} + ${b} = ?`;

        document.getElementById('btn-parent-unlock').addEventListener('click', () => {
            const answer = parseInt(document.getElementById('parent-answer').value);
            if (answer === a + b) {
                document.getElementById('parent-lock').style.display = 'none';
                document.getElementById('parent-dashboard').style.display = 'block';
                _buildParentDashboard();
            }
        });
    }

    function _buildParentDashboard() {
        const stats = document.getElementById('parent-stats');
        const d = Progress.get();
        const summary = typeof OTBEcosystem !== 'undefined' ? OTBEcosystem.getSummary() : null;

        stats.innerHTML = `
            <div class="otb-stat-row"><span class="otb-stat-label">Total Plays</span><span class="otb-stat-value gold">${d.totalPlays}</span></div>
            <div class="otb-stat-row"><span class="otb-stat-label">Total Stars</span><span class="otb-stat-value gold">${d.totalStars}</span></div>
            <div class="otb-stat-row"><span class="otb-stat-label">Total XP</span><span class="otb-stat-value gold">${d.totalXP}</span></div>
            ${summary ? `
                <div class="otb-stat-row"><span class="otb-stat-label">Global Level</span><span class="otb-stat-value gold">${summary.globalLevel}</span></div>
                <div class="otb-stat-row"><span class="otb-stat-label">Daily Streak</span><span class="otb-stat-value gold">${summary.dailyStreak} days</span></div>
                <div class="otb-stat-row"><span class="otb-stat-label">Cross-Game Answers</span><span class="otb-stat-value gold">${summary.totalAnswers}</span></div>
            ` : ''}
        `;
    }

    function _buildAchievementsScreen() {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;
        const all = Achievements.getAll();
        const earned = all.filter(a => a.earned).length;
        grid.innerHTML = `
            <div class="achievements-header">
                <span class="achievements-count">${earned} / ${all.length} Earned</span>
            </div>
            <div class="achievements-cards">
                ${all.map(a => `
                    <div class="achievement-card ${a.earned ? 'earned' : 'locked'}">
                        <div class="achievement-icon">${a.earned ? a.icon : '🔒'}</div>
                        <div class="achievement-name">${a.earned ? a.name : '???'}</div>
                        <div class="achievement-desc">${a.desc}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    document.addEventListener('DOMContentLoaded', init);

    return { showScreen };
})();


// Global error handler - catch runtime errors gracefully
window.onerror = function(msg, source, line, col, error) {
    console.error("Runtime error:", msg, "at", source, line + ":" + col);
    return false;
};
window.addEventListener("unhandledrejection", function(event) {
    console.error("Unhandled promise rejection:", event.reason);
});
