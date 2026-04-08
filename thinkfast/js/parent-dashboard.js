// ===== PARENT DASHBOARD V27 =====
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

        // Collect weak topics early for alert banner
        const weakMath = Adaptive.getWeakTopics('math');
        const weakReading = Adaptive.getWeakTopics('reading');
        const allWeak = [...weakMath, ...weakReading];

        let html = '';

        // V27: Weak topic alert banner (top of dashboard)
        if (allWeak.length > 0) {
            const worstTopic = allWeak.sort((a, b) => a.accuracy - b.accuracy)[0];
            html += `
                <div class="dashboard-alert">
                    <span class="dashboard-alert-icon">⚠️</span>
                    <span class="dashboard-alert-text">
                        <strong>Focus area:</strong> ${worstTopic.icon} ${worstTopic.name} (${worstTopic.subject}) needs practice — ${worstTopic.accuracy}% accuracy
                    </span>
                </div>
            `;
        }

        // V27: Today's Progress session summary card
        html += this._renderSessionSummary(d);

        // Overview section
        html += `
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

        // V27: Canvas accuracy trend line chart (replaces V10 bar chart)
        if (history.length >= 3) {
            html += `<div class="dashboard-section">
                <h3>Accuracy Trend</h3>
                <canvas id="dash-trend-canvas" width="600" height="180" style="width:100%;max-width:600px;height:auto;display:block;margin:0 auto;"></canvas>
            </div>`;
        }

        // V27: Canvas topic performance bar chart
        html += `<div class="dashboard-section">
            <h3>Topic Performance</h3>
            <canvas id="dash-topics-canvas" width="600" height="10" style="width:100%;max-width:600px;height:auto;display:block;margin:0 auto;"></canvas>
        </div>`;

        // Best times per track
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
        if (allWeak.length > 0) {
            html += `<div class="dashboard-section focus-section">
                <h3>Areas to Focus</h3>
                <p style="font-size:0.85rem;color:#aaa;margin-bottom:8px;">Topics below 70% accuracy that need more practice:</p>`;
            allWeak.forEach(t => {
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

        // V27: Share Progress button + Reset button
        html += `<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:16px 0;">
            <button class="btn btn-share-progress" id="btn-share-progress">📋 Share Progress</button>
            <button class="btn btn-share-progress" id="btn-email-report" style="background:#3498db;">📧 Email Report</button>
            <button class="btn-reset-data" id="btn-reset-progress">Reset All Progress</button>
        </div>`;

        container.innerHTML = html;

        // Bind reset button
        document.getElementById('btn-reset-progress').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                Progress.resetAll();
                this.render();
            }
        });

        // V27: Bind share button
        document.getElementById('btn-share-progress').addEventListener('click', () => {
            this._shareProgress(d, totalAccuracy, playerName);
        });

        // V31: Bind email report button
        document.getElementById('btn-email-report').addEventListener('click', () => {
            this._emailReport(d, totalAccuracy, playerName);
        });

        // V27: Draw canvas charts after DOM is ready
        requestAnimationFrame(() => {
            this._drawTrendChart(history);
            this._drawTopicChart();
        });
    },

    // V27: Today's Progress session summary card
    _renderSessionSummary(d) {
        const history = d.raceHistory || [];
        const today = new Date().toDateString();

        // Filter races from today
        const todayRaces = history.filter(r => {
            if (!r.date) return false;
            return new Date(r.date).toDateString() === today;
        });

        const racesToday = todayRaces.length;
        const correctToday = todayRaces.reduce((sum, r) => sum + (r.correct || 0), 0);
        const totalToday = todayRaces.reduce((sum, r) => sum + (r.total || 0), 0);
        const accuracyToday = totalToday > 0 ? Math.round((correctToday / totalToday) * 100) : 0;
        const starsToday = todayRaces.reduce((sum, r) => sum + (r.stars || 0), 0);

        // New achievements today (check if any were earned in today's races)
        const newAchToday = d.achievements.length; // Just show total, we don't track date per achievement

        return `
            <div class="dashboard-section session-summary">
                <h3>📅 Today's Progress</h3>
                <div class="session-grid">
                    <div class="session-stat">
                        <div class="session-stat-value">${racesToday}</div>
                        <div class="session-stat-label">Races</div>
                    </div>
                    <div class="session-stat">
                        <div class="session-stat-value">${accuracyToday}%</div>
                        <div class="session-stat-label">Accuracy</div>
                    </div>
                    <div class="session-stat">
                        <div class="session-stat-value">${correctToday}/${totalToday}</div>
                        <div class="session-stat-label">Correct</div>
                    </div>
                    <div class="session-stat">
                        <div class="session-stat-value">⭐ ${starsToday}</div>
                        <div class="session-stat-label">Stars Earned</div>
                    </div>
                </div>
                ${racesToday === 0 ? '<p style="text-align:center;color:#aaa;font-size:0.85rem;margin-top:8px;">No races yet today — time to play!</p>' : ''}
            </div>
        `;
    },

    // V27: Canvas-drawn accuracy trend line chart
    _drawTrendChart(history) {
        const canvas = document.getElementById('dash-trend-canvas');
        if (!canvas || history.length < 3) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        const recent = [...history].slice(-20);
        const padding = { top: 20, right: 20, bottom: 30, left: 40 };
        const chartW = W - padding.left - padding.right;
        const chartH = H - padding.top - padding.bottom;

        // Background grid
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        for (let pct = 0; pct <= 100; pct += 25) {
            const y = padding.top + chartH - (pct / 100) * chartH;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(W - padding.right, y);
            ctx.stroke();
            // Label
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '14px sans-serif'; // V32: larger for tablet readability
            ctx.textAlign = 'right';
            ctx.fillText(pct + '%', padding.left - 6, y + 4);
        }

        // Data points
        const points = recent.map((r, i) => {
            const pct = r.total > 0 ? Math.min(100, Math.round((r.correct / r.total) * 100)) : 0;
            const x = padding.left + (i / Math.max(1, recent.length - 1)) * chartW;
            const y = padding.top + chartH - (pct / 100) * chartH;
            return { x, y, pct, r };
        });

        // Draw filled area under curve
        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, padding.top + chartH);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
            grad.addColorStop(0, 'rgba(46, 204, 113, 0.25)');
            grad.addColorStop(1, 'rgba(46, 204, 113, 0.02)');
            ctx.fillStyle = grad;
            ctx.fill();
        }

        // Draw line
        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            ctx.stroke();
        }

        // Draw dots with color coding
        points.forEach(p => {
            const color = p.pct >= 70 ? '#2ecc71' : p.pct >= 40 ? '#f39c12' : '#e74c3c';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // Race number labels along bottom
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '13px sans-serif'; // V32: larger for tablet
        ctx.textAlign = 'center';
        points.forEach((p, i) => {
            if (recent.length <= 10 || i % 2 === 0 || i === recent.length - 1) {
                ctx.fillText(i + 1, p.x, H - 6);
            }
        });
    },

    // V27: Canvas-drawn horizontal bar chart for topic performance
    _drawTopicChart() {
        const canvas = document.getElementById('dash-topics-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Gather all topics with data
        const topicData = [];
        ['math', 'reading'].forEach(subject => {
            const topics = subject === 'math' ? MathData.topics : ReadingData.topics;
            const acc = subject === 'math' ? Progress.data.mathAccuracy : Progress.data.readingAccuracy;
            topics.forEach(t => {
                const key = `${subject}_${t.id}`;
                const data = acc[key];
                if (data && data.total > 0) {
                    const pct = Math.round((data.correct / data.total) * 100);
                    topicData.push({ name: t.name, icon: t.icon, pct, subject, total: data.total });
                }
            });
        });

        if (topicData.length === 0) {
            canvas.height = 40;
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No topic data yet — complete some races!', canvas.width / 2, 25);
            return;
        }

        // Sort by accuracy descending
        topicData.sort((a, b) => b.pct - a.pct);

        const barH = 22;
        const gap = 6;
        const labelW = 120;
        const pctLabelW = 45;
        const padding = { top: 5, right: 10, bottom: 5, left: 5 };
        const totalH = padding.top + topicData.length * (barH + gap) + padding.bottom;

        // Resize canvas to fit
        canvas.height = totalH;
        const W = canvas.width;
        const barMaxW = W - labelW - pctLabelW - padding.left - padding.right;

        topicData.forEach((t, i) => {
            const y = padding.top + i * (barH + gap);
            const barW = (t.pct / 100) * barMaxW;

            // Topic name label
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '14px sans-serif'; // V32: larger for tablet
            ctx.textAlign = 'right';
            ctx.fillText(t.name, labelW - 8, y + barH / 2 + 4);

            // Bar background
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.beginPath();
            ctx.roundRect(labelW, y, barMaxW, barH, 4);
            ctx.fill();

            // Bar fill with color coding
            const color = t.pct >= 80 ? '#2ecc71' : t.pct >= 50 ? '#f39c12' : '#e74c3c';
            ctx.fillStyle = color;
            if (barW > 0) {
                ctx.beginPath();
                ctx.roundRect(labelW, y, Math.max(4, barW), barH, 4);
                ctx.fill();
            }

            // Percentage label
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = 'bold 14px sans-serif'; // V32: larger for tablet
            ctx.textAlign = 'left';
            ctx.fillText(`${t.pct}%`, labelW + barMaxW + 8, y + barH / 2 + 4);
        });
    },

    // V27: Copy progress summary to clipboard
    _shareProgress(d, totalAccuracy, playerName) {
        const history = d.raceHistory || [];
        const today = new Date().toDateString();
        const todayRaces = history.filter(r => r.date && new Date(r.date).toDateString() === today);

        let text = `🏎️ Think Fast — ${playerName}'s Progress Report\n`;
        text += `📅 ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
        text += `📊 Overall Stats:\n`;
        text += `   Level ${d.playerLevel} — ${Progress.getRank()}\n`;
        text += `   ${d.totalRaces} races completed\n`;
        text += `   ${d.totalQuestionsAnswered} questions answered\n`;
        text += `   ${totalAccuracy}% overall accuracy\n`;
        text += `   🔥 ${d.dailyStreak || 0} day streak (best: ${d.bestStreak || 0})\n`;
        text += `   🏆 ${d.achievements.length}/${Achievements.definitions.length} achievements\n\n`;

        if (todayRaces.length > 0) {
            const correctToday = todayRaces.reduce((sum, r) => sum + (r.correct || 0), 0);
            const totalToday = todayRaces.reduce((sum, r) => sum + (r.total || 0), 0);
            const accToday = totalToday > 0 ? Math.round((correctToday / totalToday) * 100) : 0;
            text += `📅 Today: ${todayRaces.length} race${todayRaces.length !== 1 ? 's' : ''}, ${accToday}% accuracy\n\n`;
        }

        // Strengths
        const strong = this._getStrongTopics().slice(0, 5);
        if (strong.length > 0) {
            text += `💪 Strengths:\n`;
            strong.forEach(t => { text += `   ${t.icon} ${t.name} — ${t.accuracy}%\n`; });
            text += '\n';
        }

        // Focus areas
        const weakMath = Adaptive.getWeakTopics('math');
        const weakReading = Adaptive.getWeakTopics('reading');
        const allWeak = [...weakMath, ...weakReading].slice(0, 5);
        if (allWeak.length > 0) {
            text += `📝 Needs Practice:\n`;
            allWeak.forEach(t => { text += `   ${t.icon} ${t.name} — ${t.accuracy}%\n`; });
        }

        text += `\n— Think Fast: The Michigan Road Race`;

        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('btn-share-progress');
            if (btn) {
                btn.textContent = '✅ Copied!';
                setTimeout(() => { btn.textContent = '📋 Share Progress'; }, 2000);
            }
        }).catch(() => {
            // Fallback: select text in a temporary textarea
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e) { /* ignore */ }
            ta.remove();
            const btn = document.getElementById('btn-share-progress');
            if (btn) {
                btn.textContent = '✅ Copied!';
                setTimeout(() => { btn.textContent = '📋 Share Progress'; }, 2000);
            }
        });
    },

    // V31: Email report via mailto link
    _emailReport(d, totalAccuracy, playerName) {
        const subject = `Think Fast Progress Report — ${playerName}`;
        let body = `Think Fast — ${playerName}'s Progress Report\n`;
        body += `${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
        body += `OVERALL STATS:\n`;
        body += `  Level ${d.playerLevel} — ${Progress.getRank()}\n`;
        body += `  ${d.totalRaces} races completed\n`;
        body += `  ${d.totalQuestionsAnswered} questions answered\n`;
        body += `  ${totalAccuracy}% overall accuracy\n`;
        body += `  ${d.dailyStreak || 0} day streak (best: ${d.bestStreak || 0})\n\n`;

        // Strengths
        const strong = this._getStrongTopics().slice(0, 5);
        if (strong.length > 0) {
            body += `STRENGTHS:\n`;
            strong.forEach(t => { body += `  ${t.name} — ${t.accuracy}%\n`; });
            body += '\n';
        }

        // Focus areas
        const weakMath = Adaptive.getWeakTopics('math');
        const weakReading = Adaptive.getWeakTopics('reading');
        const allWeak = [...weakMath, ...weakReading].slice(0, 5);
        if (allWeak.length > 0) {
            body += `NEEDS PRACTICE:\n`;
            allWeak.forEach(t => { body += `  ${t.name} — ${t.accuracy}%\n`; });
        }

        body += `\n— Think Fast: The Michigan Road Race`;

        const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailto, '_blank');

        const btn = document.getElementById('btn-email-report');
        if (btn) {
            btn.textContent = '✅ Opened!';
            setTimeout(() => { btn.textContent = '📧 Email Report'; }, 2000);
        }
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
