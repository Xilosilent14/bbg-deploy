// ===== PARENT DASHBOARD =====
const ParentDashboard = {
    render() {
        const container = document.getElementById('parent-content');
        const d = Progress.data;

        const totalAccuracy = d.totalQuestionsAnswered > 0
            ? Math.round((d.totalCorrect / d.totalQuestionsAnswered) * 100)
            : 0;

        const timePlayed = this._formatTime(d.totalTimePlayed);
        const rank = Progress.getRank();
        const xpNext = Progress.getXPForNextLevel();
        const xpProgress = Math.round(Progress.getXPProgress() * 100);

        const playerName = this._escapeHTML(d.playerName || 'Racer');

        let html = `
            <div class="dashboard-section">
                <h3>${playerName}'s Overview</h3>
                <div class="stat-row">
                    <span class="stat-label">Grade Level</span>
                    <span class="stat-value">${Adaptive.getGradeLabel()}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Daily Streak</span>
                    <span class="stat-value">🔥 ${d.dailyStreak || 0} day${(d.dailyStreak || 0) !== 1 ? 's' : ''} (best: ${d.bestStreak || 0})</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Player Level</span>
                    <span class="stat-value">Level ${d.playerLevel} — ${rank}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">XP Progress</span>
                    <span class="stat-value">${d.totalXP} XP ${xpNext ? `(${xpProgress}% to Level ${d.playerLevel + 1})` : '(MAX)'}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total Races</span>
                    <span class="stat-value">${d.totalRaces}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Questions Answered</span>
                    <span class="stat-value">${d.totalQuestionsAnswered}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Overall Accuracy</span>
                    <span class="stat-value">${totalAccuracy}% ${this._accuracyBar(totalAccuracy)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Stars (available / total earned)</span>
                    <span class="stat-value">⭐ ${d.stars} / ${d.totalStarsEarned}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Achievements</span>
                    <span class="stat-value">${d.achievements.length} / ${Achievements.definitions.length}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Time Played</span>
                    <span class="stat-value">${timePlayed}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Sessions</span>
                    <span class="stat-value">${d.sessionsPlayed}</span>
                </div>
            </div>
        `;

        // Car Upgrades
        html += `
            <div class="dashboard-section">
                <h3>Car Upgrades</h3>
                <div class="stat-row">
                    <span class="stat-label">🏎️ Speed</span>
                    <span class="stat-value">Level ${d.carUpgrades.speed}/5</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">🔥 Nitro Power</span>
                    <span class="stat-value">Level ${d.carUpgrades.nitro}/5</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">🎯 Handling</span>
                    <span class="stat-value">Level ${d.carUpgrades.handling}/5</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">🛡️ Durability</span>
                    <span class="stat-value">Level ${d.carUpgrades.durability || 1}/5</span>
                </div>
            </div>
        `;

        // Recent Race History
        const history = d.raceHistory || [];
        if (history.length > 0) {
            html += `<div class="dashboard-section"><h3>Recent Races</h3><div class="race-history-list">`;
            // Show most recent first
            const recent = [...history].reverse().slice(0, 10);
            recent.forEach(r => {
                const pct = r.total > 0 ? Math.min(100, Math.round((r.correct / r.total) * 100)) : 0;
                const correctCapped = Math.min(r.correct, r.total);
                const cls = pct >= 70 ? 'high' : pct >= 40 ? 'medium' : 'low';
                const stars = '⭐'.repeat(r.stars || 0);
                const date = r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                html += `
                    <div class="race-history-item">
                        <span>${date} — ${r.subject || '?'} / ${r.topic || '?'}</span>
                        <span class="rh-stars">${stars || '—'}</span>
                        <span class="rh-acc ${cls}">${correctCapped}/${r.total} (${pct}%)</span>
                        <span class="rh-streak">${r.streak > 1 ? '🔥' + r.streak + 'x' : ''}</span>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        // V10: Accuracy trend chart (last 10 races)
        if (history.length >= 3) {
            html += `<div class="dashboard-section"><h3>Accuracy Trend</h3><div class="trend-chart">`;
            const recent10 = [...history].slice(-10);
            const maxH = 60;
            recent10.forEach((r, i) => {
                const pct = r.total > 0 ? Math.min(100, Math.round((r.correct / r.total) * 100)) : 0;
                const h = Math.max(4, Math.round(pct / 100 * maxH));
                const cls = pct >= 70 ? 'high' : pct >= 40 ? 'medium' : 'low';
                html += `<div class="trend-bar ${cls}" style="height:${h}px;" title="${pct}%"><span class="trend-label">${pct}%</span></div>`;
            });
            html += `</div></div>`;
        }

        // V10: Best times per track
        const bestTimes = Progress.data.trackBestTimes || {};
        if (Object.keys(bestTimes).length > 0) {
            html += `<div class="dashboard-section"><h3>Best Times</h3>`;
            Game.tracks.forEach((track, i) => {
                const best = bestTimes[i];
                if (best) {
                    const mins = Math.floor(best.time / 60);
                    const secs = Math.round(best.time % 60);
                    const medal = Game.getMedal(i, best.time);
                    const medalIcon = medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : medal === 'bronze' ? '🥉' : '';
                    const raceCount = (Progress.data.trackRaceCount || {})[i] || 0;
                    html += `<div class="stat-row">
                        <span class="stat-label">${track.name}</span>
                        <span class="stat-value">${medalIcon} ${mins}:${secs.toString().padStart(2, '0')} (${raceCount} races)</span>
                    </div>`;
                }
            });
            html += `</div>`;
        }

        // Strengths (topics above 80%)
        const strongTopics = this._getStrongTopics();
        if (strongTopics.length > 0) {
            html += `<div class="dashboard-section">
                <h3>Strengths</h3>
                <p style="font-size:0.85rem;color:#aaa;margin-bottom:8px;">Topics above 80% accuracy — great job!</p>`;
            strongTopics.forEach(t => {
                html += `
                    <div class="stat-row">
                        <span class="stat-label">${t.icon} ${t.name} (${t.subject})</span>
                        <span class="stat-value" style="color:#2ecc71;">${t.accuracy}% ${this._accuracyBar(t.accuracy)}</span>
                    </div>
                `;
            });
            html += `</div>`;
        }

        // Areas to Focus
        const weakMath = Adaptive.getWeakTopics('math');
        const weakReading = Adaptive.getWeakTopics('reading');
        const allWeak = [...weakMath, ...weakReading];

        if (allWeak.length > 0) {
            html += `<div class="dashboard-section focus-section">
                <h3>Areas to Focus</h3>
                <p style="font-size:0.85rem;color:#aaa;margin-bottom:8px;">Topics below 70% accuracy that need more practice:</p>`;
            allWeak.forEach(t => {
                const cls = t.accuracy < 40 ? 'low' : 'medium';
                html += `
                    <div class="stat-row">
                        <span class="stat-label">${t.icon} ${t.name} (${t.subject})</span>
                        <span class="stat-value">${t.accuracy}% ${this._accuracyBar(t.accuracy)}</span>
                    </div>
                `;
            });
            html += `</div>`;
        }

        // Suggested topics (spaced repetition)
        const sugMath = Adaptive.getSuggestedTopics('math');
        const sugReading = Adaptive.getSuggestedTopics('reading');
        const allSuggested = [...sugMath, ...sugReading];

        if (allSuggested.length > 0) {
            html += `<div class="dashboard-section">
                <h3>Suggested Review</h3>
                <p style="font-size:0.85rem;color:#aaa;margin-bottom:8px;">Topics not practiced recently:</p>`;
            allSuggested.forEach(t => {
                html += `
                    <div class="stat-row">
                        <span class="stat-label">${t.icon} ${t.name} (${t.subject})</span>
                        <span class="stat-value">${t.sessionsSince === Infinity ? 'Not yet practiced' : t.sessionsSince + ' sessions ago'}</span>
                    </div>
                `;
            });
            html += `</div>`;
        }

        // Math topics breakdown
        html += this._renderTopicSection('Math Topics', 'math', MathData.topics);

        // Reading topics breakdown
        html += this._renderTopicSection('Reading Topics', 'reading', ReadingData.topics);

        // Adaptive levels
        html += `<div class="dashboard-section"><h3>Current Difficulty Levels</h3>`;
        const allTopics = [
            ...MathData.topics.map(t => ({ ...t, subject: 'math' })),
            ...ReadingData.topics.map(t => ({ ...t, subject: 'reading' }))
        ];
        allTopics.forEach(t => {
            const level = Adaptive.getLevel(t.subject, t.id);
            html += `
                <div class="stat-row">
                    <span class="stat-label">${t.icon} ${t.name}</span>
                    <span class="stat-value">${Adaptive.getLevelLabel(level)}</span>
                </div>
            `;
        });
        html += `</div>`;

        // Reset button
        html += `<button class="btn-reset-data" id="btn-reset-progress">Reset All Progress</button>`;

        container.innerHTML = html;

        document.getElementById('btn-reset-progress').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                Progress.resetAll();
                this.render();
            }
        });
    },

    _renderTopicSection(title, subject, topics) {
        let html = `<div class="dashboard-section"><h3>${title}</h3>`;
        topics.forEach(t => {
            const acc = Progress.getAccuracy(subject, t.id);
            const pct = acc !== null ? Math.round(acc * 100) : 0;
            const key = `${subject}_${t.id}`;
            const accData = subject === 'math' ? Progress.data.mathAccuracy : Progress.data.readingAccuracy;
            const total = accData[key] ? accData[key].total : 0;

            // V5.8: Trend indicator from recent vs overall
            let trend = '';
            if (total >= 10) {
                const recent = Progress.getRecentAccuracy(subject, t.id);
                if (recent !== null) {
                    const recentPct = Math.round(recent * 100);
                    const diff = recentPct - pct;
                    if (diff > 8) trend = ' <span style="color:#2ecc71;">↑</span>';
                    else if (diff < -8) trend = ' <span style="color:#e94560;">↓</span>';
                    else trend = ' <span style="color:#aaa;">→</span>';
                }
            }

            html += `
                <div class="stat-row">
                    <span class="stat-label">${t.icon} ${t.name} (${total} Qs)</span>
                    <span class="stat-value">${total > 0 ? pct + '%' : '—'}${trend} ${total > 0 ? this._accuracyBar(pct) : ''}</span>
                </div>
            `;
        });
        html += `</div>`;
        return html;
    },

    _getStrongTopics() {
        const strong = [];
        ['math', 'reading'].forEach(subject => {
            const topics = subject === 'math' ? MathData.topics : ReadingData.topics;
            topics.forEach(t => {
                const acc = Progress.getAccuracy(subject, t.id);
                if (acc !== null && acc >= 0.8) {
                    strong.push({ ...t, accuracy: Math.round(acc * 100), subject });
                }
            });
        });
        return strong.sort((a, b) => b.accuracy - a.accuracy);
    },

    _accuracyBar(pct) {
        const cls = pct >= 70 ? 'high' : pct >= 40 ? 'medium' : 'low';
        return `<span class="accuracy-bar"><span class="accuracy-fill ${cls}" style="width:${pct}%"></span></span>`;
    },

    _formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    },

    // V18: XSS prevention — escape HTML entities in dynamic text
    _escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
