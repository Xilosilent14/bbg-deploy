/**
 * Parent Dashboard — Spidey Academy
 * Shows learning progress for parents. Protected by a simple math gate.
 */
const ParentDashboard = (() => {
    const ACTIVITIES = [
        { id: 'color-catch', label: 'Color Catch', icon: '🎨' },
        { id: 'shape-builder', label: 'Shape Builder', icon: '🔷' },
        { id: 'number-bugs', label: 'Number Bugs', icon: '🔢' },
        { id: 'letter-web', label: 'Letter Web', icon: '🔤' },
        { id: 'sort-sweep', label: 'Sort Sweep', icon: '🧹' }
    ];

    let _gateAnswer = 0;

    function showGate() {
        const container = document.getElementById('parent-gate-content');
        if (!container) return;

        // Generate a math problem a toddler can't solve
        const a = Math.floor(Math.random() * 20) + 10;
        const b = Math.floor(Math.random() * 20) + 10;
        _gateAnswer = a + b;

        container.innerHTML = `
            <div class="parent-gate-card">
                <div class="parent-gate-icon">🔒</div>
                <h2 class="parent-gate-title">Parent Area</h2>
                <p class="parent-gate-hint">Solve to enter:</p>
                <p class="parent-gate-problem">${a} + ${b} = ?</p>
                <input type="number" id="parent-gate-input" class="parent-gate-input"
                    inputmode="numeric" autocomplete="off" placeholder="Answer">
                <div class="parent-gate-buttons">
                    <button class="parent-gate-btn" id="parent-gate-submit">Enter</button>
                    <button class="parent-gate-btn parent-gate-cancel" id="parent-gate-cancel">Cancel</button>
                </div>
                <p class="parent-gate-error" id="parent-gate-error" style="display:none">Try again!</p>
            </div>
        `;

        document.getElementById('parent-gate-submit').addEventListener('click', _checkGate);
        document.getElementById('parent-gate-cancel').addEventListener('click', () => {
            document.getElementById('screen-parent-gate').classList.remove('active');
            document.getElementById('screen-home').classList.add('active');
        });

        const input = document.getElementById('parent-gate-input');
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') _checkGate();
        });
        setTimeout(() => input.focus(), 300);
    }

    function _checkGate() {
        const input = document.getElementById('parent-gate-input');
        const val = parseInt(input.value, 10);
        if (val === _gateAnswer) {
            // Passed! Show dashboard
            document.getElementById('screen-parent-gate').classList.remove('active');
            document.getElementById('screen-parent-dashboard').classList.add('active');
            render();
        } else {
            const err = document.getElementById('parent-gate-error');
            if (err) err.style.display = 'block';
            input.value = '';
            input.focus();
        }
    }

    function render() {
        const container = document.getElementById('parent-dashboard-content');
        if (!container) return;

        const d = Progress.data;
        if (!d) { container.innerHTML = '<p>No data yet. Play some activities first!</p>'; return; }

        const playerName = _escapeHTML(d.playerName || 'Player');
        const totalPlayed = Object.values(d.activityStats).reduce((s, a) => s + a.played, 0);
        const stickersEarned = StickerBook.getTotalEarned();
        const stickersTotal = StickerBook.getTotalAvailable();
        const badgesEarned = Badges.getEarnedCount();
        const badgesTotal = Badges.BADGE_DEFS.length;
        const totalCorrect = d.totalCorrect || 0;
        const totalAttempts = d.totalAttempts || 0;
        const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
        const streak = d.streak || 0;
        const level = d.level || 1;
        const levelName = Progress.getLevelName();
        const gradeName = Progress.getGradeName();

        // Session time (estimate from created date)
        const sessionTime = _estimateSessionTime();

        // Per-activity accuracy
        const activityRows = ACTIVITIES.map(act => {
            const stats = d.activityStats[act.id] || {};
            const acc = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : null;
            const played = stats.played || 0;
            const stars = stats.lastStars || 0;
            return { ...act, acc, played, stars, correct: stats.correct || 0, attempts: stats.attempts || 0 };
        });

        // Find strongest and weakest
        const withData = activityRows.filter(a => a.attempts >= 3);
        withData.sort((a, b) => b.acc - a.acc);
        const strongest = withData.length > 0 ? withData[0] : null;
        const weakest = withData.length > 1 ? withData[withData.length - 1] : null;

        // Content progress
        const colorCount = (d.activityStats['color-catch']?.colorsLearned || []).length;
        const shapeCount = (d.activityStats['shape-builder']?.shapesLearned || []).length;
        const letterCount = (d.activityStats['letter-web']?.lettersLearned || []).length;
        const maxNumber = d.activityStats['number-bugs']?.maxNumber || 5;

        let html = '';

        // Alert banner for weak areas
        if (weakest && weakest.acc < 60) {
            html += `
                <div class="pd-alert">
                    <span class="pd-alert-icon">💡</span>
                    <span class="pd-alert-text">
                        <strong>Tip:</strong> ${weakest.icon} ${weakest.label} could use more practice (${weakest.acc}% accuracy). Try playing it together!
                    </span>
                </div>
            `;
        }

        // Overview
        html += `
            <div class="pd-section">
                <h3 class="pd-section-title">${playerName}'s Overview</h3>
                <div class="pd-stat-grid">
                    <div class="pd-stat-card">
                        <div class="pd-stat-value">${level}</div>
                        <div class="pd-stat-label">Level</div>
                        <div class="pd-stat-sub">${levelName}</div>
                    </div>
                    <div class="pd-stat-card">
                        <div class="pd-stat-value">${overallAccuracy}%</div>
                        <div class="pd-stat-label">Accuracy</div>
                        <div class="pd-stat-sub">${totalCorrect}/${totalAttempts}</div>
                    </div>
                    <div class="pd-stat-card">
                        <div class="pd-stat-value">${totalPlayed}</div>
                        <div class="pd-stat-label">Activities</div>
                        <div class="pd-stat-sub">completed</div>
                    </div>
                    <div class="pd-stat-card">
                        <div class="pd-stat-value">🔥 ${streak}</div>
                        <div class="pd-stat-label">Day Streak</div>
                        <div class="pd-stat-sub">${streak > 0 ? 'Keep it up!' : 'Play today!'}</div>
                    </div>
                </div>
            </div>
        `;

        // Rewards
        html += `
            <div class="pd-section">
                <h3 class="pd-section-title">Rewards Earned</h3>
                <div class="pd-row">
                    <span class="pd-row-label">Stickers</span>
                    <span class="pd-row-value">⭐ ${stickersEarned} / ${stickersTotal}</span>
                </div>
                <div class="pd-row">
                    <span class="pd-row-label">Badges</span>
                    <span class="pd-row-value">🏅 ${badgesEarned} / ${badgesTotal}</span>
                </div>
                <div class="pd-row">
                    <span class="pd-row-label">Grade Level</span>
                    <span class="pd-row-value">📚 ${gradeName}</span>
                </div>
                <div class="pd-row">
                    <span class="pd-row-label">Time Played</span>
                    <span class="pd-row-value">🕐 ${sessionTime}</span>
                </div>
            </div>
        `;

        // Activity Accuracy Breakdown
        html += `
            <div class="pd-section">
                <h3 class="pd-section-title">Activity Accuracy</h3>
                ${activityRows.map(a => {
                    const accStr = a.acc !== null ? `${a.acc}%` : 'Not started';
                    const barCls = a.acc === null ? '' : a.acc >= 70 ? 'high' : a.acc >= 40 ? 'medium' : 'low';
                    const bar = a.acc !== null ? `<div class="pd-acc-bar"><div class="pd-acc-fill ${barCls}" style="width:${a.acc}%"></div></div>` : '';
                    const stars = a.stars > 0 ? '★'.repeat(a.stars) + '☆'.repeat(3 - a.stars) : '';
                    return `
                        <div class="pd-activity-row">
                            <span class="pd-activity-icon">${a.icon}</span>
                            <span class="pd-activity-name">${a.label}</span>
                            <span class="pd-activity-plays">${a.played}x</span>
                            <span class="pd-activity-acc">${accStr}</span>
                            <span class="pd-activity-stars">${stars}</span>
                        </div>
                        ${bar}
                    `;
                }).join('')}
            </div>
        `;

        // Strengths and Focus areas
        if (strongest) {
            html += `
                <div class="pd-section">
                    <h3 class="pd-section-title">Strengths & Focus Areas</h3>
                    <div class="pd-highlight pd-strong">
                        <span class="pd-highlight-icon">💪</span>
                        <span><strong>Strongest:</strong> ${strongest.icon} ${strongest.label} (${strongest.acc}%)</span>
                    </div>
                    ${weakest && weakest.acc < strongest.acc ? `
                    <div class="pd-highlight pd-focus">
                        <span class="pd-highlight-icon">📝</span>
                        <span><strong>Needs Practice:</strong> ${weakest.icon} ${weakest.label} (${weakest.acc}%)</span>
                    </div>` : ''}
                </div>
            `;
        }

        // Content Progress
        html += `
            <div class="pd-section">
                <h3 class="pd-section-title">What ${playerName} Has Learned</h3>
                <div class="pd-row">
                    <span class="pd-row-label">🎨 Colors Introduced</span>
                    <span class="pd-row-value">${colorCount} colors</span>
                </div>
                <div class="pd-row">
                    <span class="pd-row-label">🔷 Shapes Introduced</span>
                    <span class="pd-row-value">${shapeCount} shapes</span>
                </div>
                <div class="pd-row">
                    <span class="pd-row-label">🔤 Letters Introduced</span>
                    <span class="pd-row-value">${letterCount} letters</span>
                </div>
                <div class="pd-row">
                    <span class="pd-row-label">🔢 Counting Up To</span>
                    <span class="pd-row-value">${maxNumber}</span>
                </div>
            </div>
        `;

        // Best Streaks per activity
        const streakData = activityRows.filter(a => a.attempts > 0);
        if (streakData.length > 0) {
            html += `
                <div class="pd-section">
                    <h3 class="pd-section-title">Best Answer Streaks</h3>
                    ${streakData.map(a => {
                        const best = d.activityStats[a.id]?.bestStreak || 0;
                        return `
                            <div class="pd-row">
                                <span class="pd-row-label">${a.icon} ${a.label}</span>
                                <span class="pd-row-value">${best} in a row</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // Actions
        html += `
            <div class="pd-actions">
                <button class="pd-btn pd-btn-share" id="pd-btn-share">📋 Copy Report</button>
                <button class="pd-btn pd-btn-reset" id="pd-btn-reset">Reset Progress</button>
            </div>
        `;

        container.innerHTML = html;

        // Bind buttons
        document.getElementById('pd-btn-share')?.addEventListener('click', () => _copyReport(d, playerName, overallAccuracy, activityRows));
        document.getElementById('pd-btn-reset')?.addEventListener('click', _confirmReset);
    }

    function _estimateSessionTime() {
        const d = Progress.data;
        if (!d) return '0m';
        // Rough estimate: each activity round ~2 minutes
        const totalPlayed = Object.values(d.activityStats).reduce((s, a) => s + a.played, 0);
        const mins = totalPlayed * 2;
        if (mins >= 60) {
            const hrs = Math.floor(mins / 60);
            const rem = mins % 60;
            return `${hrs}h ${rem}m`;
        }
        return `${mins}m`;
    }

    function _copyReport(d, playerName, overallAccuracy, activityRows) {
        let text = `🕷️ Spidey Academy - ${playerName}'s Progress Report\n`;
        text += `📅 ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
        text += `Level ${d.level} - ${Progress.getLevelName()} (${Progress.getGradeName()})\n`;
        text += `Overall Accuracy: ${overallAccuracy}% (${d.totalCorrect}/${d.totalAttempts})\n`;
        text += `Day Streak: ${d.streak || 0} days\n`;
        text += `Stickers: ${StickerBook.getTotalEarned()}/${StickerBook.getTotalAvailable()}\n`;
        text += `Badges: ${Badges.getEarnedCount()}/${Badges.BADGE_DEFS.length}\n\n`;

        text += `Activity Breakdown:\n`;
        activityRows.forEach(a => {
            const accStr = a.acc !== null ? `${a.acc}%` : 'not started';
            text += `  ${a.icon} ${a.label}: ${a.played} played, ${accStr}\n`;
        });

        text += `\n- Spidey Academy (Blake Boys Gaming)`;

        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('pd-btn-share');
            if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy Report'; }, 2000); }
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e) { /* */ }
            ta.remove();
            const btn = document.getElementById('pd-btn-share');
            if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy Report'; }, 2000); }
        });
    }

    function _confirmReset() {
        if (confirm('Reset ALL of Asher\'s progress? This cannot be undone.')) {
            if (confirm('Are you really sure? All stickers, badges, and levels will be lost.')) {
                localStorage.removeItem('spidey-academy-save');
                Progress.load();
                render();
            }
        }
    }

    function _escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { showGate, render };
})();
