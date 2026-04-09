/* ============================================
   CREATURE CARDS — Parent Dashboard
   Parent gate + progress overview
   ============================================ */
const ParentDashboard = (() => {
    let _unlocked = false;

    function showGate() {
        const a = Math.floor(Math.random() * 8) + 3;
        const b = Math.floor(Math.random() * 8) + 3;
        const answer = a * b;

        const gateEl = document.getElementById('parent-gate');
        const dashEl = document.getElementById('parent-dashboard-content');
        gateEl.style.display = 'flex';
        dashEl.style.display = 'none';

        document.getElementById('parent-gate-question').textContent = `What is ${a} x ${b}?`;
        const input = document.getElementById('parent-gate-input');
        input.value = '';
        input.focus();

        const errEl = document.getElementById('parent-gate-error');
        errEl.style.display = 'none';

        // Remove old listeners by replacing element
        const submitBtn = document.getElementById('parent-gate-submit');
        const newBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newBtn, submitBtn);

        const handleSubmit = () => {
            const val = parseInt(input.value, 10);
            if (val === answer) {
                _unlocked = true;
                gateEl.style.display = 'none';
                dashEl.style.display = 'block';
                render();
            } else {
                errEl.style.display = 'block';
                errEl.textContent = 'Incorrect. Try again!';
                input.value = '';
                input.focus();
            }
        };

        newBtn.addEventListener('click', handleSubmit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSubmit();
        });
    }

    function render() {
        const container = document.getElementById('parent-dashboard-body');
        const d = Progress.get();
        const coll = Collection.get();

        const totalBattles = d.totalBattles || 0;
        const totalWins = d.totalWins || 0;
        const winRate = totalBattles > 0 ? Math.round((totalWins / totalBattles) * 100) : 0;
        const totalQ = d.totalQuestionsAnswered || 0;
        const totalCorrect = d.totalQuestionsCorrect || 0;
        const overallAccuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
        const creaturesOwned = Object.keys(coll.owned || {}).length;
        const totalCreatures = typeof CreatureData !== 'undefined' ? CreatureData.getAllCreatures().length : 30;
        const timePlayed = _formatTime(d.totalTimePlayed || 0);

        let html = '';

        // Overview stats
        html += `
            <div class="pd-section">
                <h3 class="pd-section-title">Overview</h3>
                <div class="pd-stat-grid">
                    <div class="pd-stat-card">
                        <div class="pd-stat-value">${totalBattles}</div>
                        <div class="pd-stat-label">Total Battles</div>
                    </div>
                    <div class="pd-stat-card">
                        <div class="pd-stat-value">${winRate}%</div>
                        <div class="pd-stat-label">Win Rate (${totalWins}W / ${totalBattles - totalWins}L)</div>
                    </div>
                    <div class="pd-stat-card">
                        <div class="pd-stat-value">${overallAccuracy}%</div>
                        <div class="pd-stat-label">Question Accuracy (${totalCorrect}/${totalQ})</div>
                    </div>
                    <div class="pd-stat-card">
                        <div class="pd-stat-value">${creaturesOwned}/${totalCreatures}</div>
                        <div class="pd-stat-label">Creatures Collected</div>
                    </div>
                    <div class="pd-stat-card">
                        <div class="pd-stat-value">${timePlayed}</div>
                        <div class="pd-stat-label">Time Played</div>
                    </div>
                    <div class="pd-stat-card">
                        <div class="pd-stat-value">${d.totalXP || 0}</div>
                        <div class="pd-stat-label">Total XP</div>
                    </div>
                </div>
            </div>
        `;

        // Subject accuracy from ecosystem data
        if (typeof OTBEcosystem !== 'undefined') {
            const summary = OTBEcosystem.getSummary();
            const mathPct = Math.round(summary.mathAccuracy * 100);
            const readingPct = Math.round(summary.readingAccuracy * 100);

            html += `
                <div class="pd-section">
                    <h3 class="pd-section-title">Accuracy by Subject</h3>
                    <div class="pd-bar-row">
                        <span class="pd-bar-label">Math</span>
                        <div class="pd-bar-track">
                            <div class="pd-bar-fill ${_barClass(mathPct)}" style="width:${mathPct}%"></div>
                        </div>
                        <span class="pd-bar-pct">${mathPct}%</span>
                    </div>
                    <div class="pd-bar-row">
                        <span class="pd-bar-label">Reading</span>
                        <div class="pd-bar-track">
                            <div class="pd-bar-fill ${_barClass(readingPct)}" style="width:${readingPct}%"></div>
                        </div>
                        <span class="pd-bar-pct">${readingPct}%</span>
                    </div>
                </div>
            `;

            // Topic-level breakdown from ecosystem mastery
            html += _renderTopicBreakdown();
        }

        // Zone progress
        const ZONE_NAMES = {
            ember: 'Ember Fields', tidal: 'Tidal Shores', terra: 'Wild Grove',
            spark: 'Bolt Canyon', shadow: 'Gloom Hollow'
        };
        const ZONE_ICONS = { ember: '🔥', tidal: '💧', terra: '🌿', spark: '⚡', shadow: '🌙' };
        const zoneKeys = Object.keys(d.zoneProgress || {});
        if (zoneKeys.length > 0) {
            html += `<div class="pd-section"><h3 class="pd-section-title">Zone Progress</h3>`;
            for (const zId of ['ember', 'tidal', 'terra', 'spark', 'shadow']) {
                const zp = d.zoneProgress[zId];
                if (!zp) continue;
                html += `
                    <div class="pd-stat-row">
                        <span class="pd-stat-row-label">${ZONE_ICONS[zId] || ''} ${ZONE_NAMES[zId] || zId}</span>
                        <span class="pd-stat-row-value">Tier ${zp.tier}/5 (${zp.wins} wins)</span>
                    </div>
                `;
            }
            html += `</div>`;
        }

        // Recent battle history
        const history = d.battleHistory || [];
        if (history.length > 0) {
            html += `<div class="pd-section"><h3 class="pd-section-title">Recent Battles</h3><div class="pd-history">`;
            const recent = [...history].reverse().slice(0, 10);
            recent.forEach(b => {
                const date = new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const zoneName = ZONE_NAMES[b.zone] || b.zone;
                const icon = ZONE_ICONS[b.zone] || '?';
                const resultClass = b.won ? 'pd-win' : 'pd-loss';
                const resultText = b.won ? 'WIN' : 'LOSS';
                const qAcc = b.questionsTotal > 0 ? Math.round((b.questionsCorrect / b.questionsTotal) * 100) + '%' : '--';
                html += `
                    <div class="pd-history-row">
                        <span class="pd-history-date">${date}</span>
                        <span class="pd-history-zone">${icon} ${zoneName}</span>
                        <span class="pd-history-result ${resultClass}">${resultText}</span>
                        <span class="pd-history-acc">${qAcc}</span>
                        <span class="pd-history-turns">${b.turns}T</span>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        // Reset button
        html += `
            <div style="text-align:center;margin:20px 0;">
                <button class="pd-reset-btn" id="pd-reset-btn">Reset All Progress</button>
            </div>
        `;

        container.innerHTML = html;

        // Bind reset
        const resetBtn = document.getElementById('pd-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
                    localStorage.removeItem('creature_cards_save');
                    localStorage.removeItem('creature_cards_collection');
                    render();
                }
            });
        }
    }

    function _renderTopicBreakdown() {
        if (typeof OTBEcosystem === 'undefined') return '';
        const profile = JSON.parse(localStorage.getItem('bbg_shared_profile') || localStorage.getItem('otb_shared_profile') || '{}');
        const mathMastery = profile.mathMastery || {};
        const readingMastery = profile.readingMastery || {};

        const topics = [];
        for (const [key, val] of Object.entries(mathMastery)) {
            if (val.total > 0) {
                topics.push({ name: key, subject: 'Math', ...val, accuracy: Math.round((val.correct / val.total) * 100) });
            }
        }
        for (const [key, val] of Object.entries(readingMastery)) {
            if (val.total > 0) {
                topics.push({ name: key, subject: 'Reading', ...val, accuracy: Math.round((val.correct / val.total) * 100) });
            }
        }

        if (topics.length === 0) return '';

        topics.sort((a, b) => a.accuracy - b.accuracy);

        let html = `<div class="pd-section"><h3 class="pd-section-title">Topic Breakdown</h3>`;
        topics.forEach(t => {
            const displayName = t.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            html += `
                <div class="pd-bar-row">
                    <span class="pd-bar-label pd-bar-label-wide">${displayName} <small style="color:var(--otb-text-muted);">(${t.subject})</small></span>
                    <div class="pd-bar-track">
                        <div class="pd-bar-fill ${_barClass(t.accuracy)}" style="width:${t.accuracy}%"></div>
                    </div>
                    <span class="pd-bar-pct">${t.accuracy}%</span>
                </div>
            `;
        });
        html += `</div>`;
        return html;
    }

    function _barClass(pct) {
        if (pct >= 70) return 'pd-bar-high';
        if (pct >= 40) return 'pd-bar-mid';
        return 'pd-bar-low';
    }

    function _formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    }

    function open() {
        if (_unlocked) {
            document.getElementById('parent-gate').style.display = 'none';
            document.getElementById('parent-dashboard-content').style.display = 'block';
            render();
        } else {
            showGate();
        }
    }

    return { open, render, showGate };
})();
