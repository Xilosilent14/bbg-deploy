/* ============================================
   PARENT DASHBOARD — Progress Tracking & FastBridge Readiness
   ============================================ */
const ParentDashboard = (() => {
    let mathProblem = null;

    function init() {
        // Generate math gate problem
        const a = Math.floor(Math.random() * 10) + 5;
        const b = Math.floor(Math.random() * 10) + 5;
        mathProblem = { a, b, answer: a * b };
        document.getElementById('parent-math').textContent = `${a} × ${b} = ?`;

        document.getElementById('parent-unlock-btn').addEventListener('click', tryUnlock);
        document.getElementById('parent-answer').addEventListener('keydown', e => {
            if (e.key === 'Enter') tryUnlock();
        });
    }

    function tryUnlock() {
        const input = document.getElementById('parent-answer');
        const val = parseInt(input.value);
        if (val === mathProblem.answer) {
            document.getElementById('parent-lock').style.display = 'none';
            document.getElementById('parent-dashboard').style.display = 'block';
            renderDashboard();
        } else {
            input.value = '';
            input.placeholder = 'Try again';
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        }
    }

    function renderDashboard() {
        renderOverview();
        renderFastBridgeMeters();
        renderSightWords();
        renderTopics();
    }

    function renderOverview() {
        const d = Progress.get();
        const xpInfo = Progress.getXPForNext();
        const el = document.getElementById('parent-overview');

        el.innerHTML = `
            <div class="parent-stat">
                <span class="stat-label">Level</span>
                <span class="stat-value">${d.level}</span>
            </div>
            <div class="parent-stat">
                <span class="stat-label">Rank</span>
                <span class="stat-value">${Progress.getRank()}</span>
            </div>
            <div class="parent-stat">
                <span class="stat-label">Total XP</span>
                <span class="stat-value">${d.xp.toLocaleString()}</span>
            </div>
            <div class="parent-stat">
                <span class="stat-label">Games Played</span>
                <span class="stat-value">${d.totalRaces}</span>
            </div>
            <div class="parent-stat">
                <span class="stat-label">Accuracy</span>
                <span class="stat-value">${d.totalAnswered > 0 ? Math.round((d.totalCorrect / d.totalAnswered) * 100) : 0}%</span>
            </div>
            <div class="parent-stat">
                <span class="stat-label">Best Streak</span>
                <span class="stat-value">${d.bestStreak}</span>
            </div>
        `;
    }

    function renderFastBridgeMeters() {
        const el = document.getElementById('fastbridge-meters');
        const sightWPM = Progress.getLatestWPM('sight');
        const nonsenseWPM = Progress.getLatestWPM('nonsense');
        const sightGoal = SightWords.BENCHMARK_WPM;
        const nonsenseGoal = NonsenseWords.BENCHMARK_WPM;

        el.innerHTML = `
            <div class="fb-meter">
                <div class="fb-meter-label">
                    <span>Sight Words</span>
                    <span class="fb-score ${sightWPM >= sightGoal ? 'meets' : ''}">${sightWPM} / ${sightGoal} wpm</span>
                </div>
                <div class="fb-meter-bar">
                    <div class="fb-meter-fill ${sightWPM >= sightGoal ? 'meets' : ''}"
                         style="width: ${Math.min(100, (sightWPM / sightGoal) * 100)}%"></div>
                    <div class="fb-meter-goal" style="left: ${Math.min(98, (sightGoal / Math.max(sightGoal, sightWPM, 20)) * 100)}%"></div>
                </div>
                <p class="fb-status">${sightWPM >= sightGoal ? 'Meeting KG Spring benchmark!' : sightWPM > 0 ? `${sightGoal - sightWPM} more wpm to reach benchmark` : 'No attempts yet — try Bridge Builder!'}</p>
            </div>
            <div class="fb-meter">
                <div class="fb-meter-label">
                    <span>Nonsense Words</span>
                    <span class="fb-score ${nonsenseWPM >= nonsenseGoal ? 'meets' : ''}">${nonsenseWPM} / ${nonsenseGoal} wpm</span>
                </div>
                <div class="fb-meter-bar">
                    <div class="fb-meter-fill ${nonsenseWPM >= nonsenseGoal ? 'meets' : ''}"
                         style="width: ${Math.min(100, (nonsenseWPM / nonsenseGoal) * 100)}%"></div>
                    <div class="fb-meter-goal" style="left: ${Math.min(98, (nonsenseGoal / Math.max(nonsenseGoal, nonsenseWPM, 20)) * 100)}%"></div>
                </div>
                <p class="fb-status">${nonsenseWPM >= nonsenseGoal ? 'Meeting KG Spring benchmark!' : nonsenseWPM > 0 ? `${nonsenseGoal - nonsenseWPM} more wpm to reach benchmark` : 'No attempts yet — try Enchanting!'}</p>
            </div>
            ${renderWPMHistory()}
        `;
    }

    function renderWPMHistory() {
        const d = Progress.get();
        if (d.wpmHistory.length === 0 && d.nonsenseWpmHistory.length === 0) return '';

        let html = '<div class="wpm-history"><h4>WPM History</h4>';

        if (d.wpmHistory.length > 0) {
            html += '<div class="wpm-trend"><span>Sight Words:</span> ';
            const recent = d.wpmHistory.slice(-10);
            html += recent.map(e => `<span class="wpm-dot ${e.wpm >= SightWords.BENCHMARK_WPM ? 'meets' : ''}">${e.wpm}</span>`).join(' ');
            html += '</div>';
        }

        if (d.nonsenseWpmHistory.length > 0) {
            html += '<div class="wpm-trend"><span>Nonsense:</span> ';
            const recent = d.nonsenseWpmHistory.slice(-10);
            html += recent.map(e => `<span class="wpm-dot ${e.wpm >= NonsenseWords.BENCHMARK_WPM ? 'meets' : ''}">${e.wpm}</span>`).join(' ');
            html += '</div>';
        }

        html += '</div>';

        // Show struggling CVC patterns if any
        const struggling = Progress.getStrugglingPatterns(0.6, 3);
        if (struggling.length > 0) {
            html += '<div class="struggling-patterns"><h4>Needs Practice (Patterns)</h4>';
            html += '<div class="pattern-list">';
            struggling.slice(0, 6).forEach(p => {
                const pct = Math.round(p.accuracy * 100);
                html += `<span class="pattern-chip struggling">-${p.pattern} <small>${pct}%</small></span> `;
            });
            html += '</div></div>';
        }

        return html;
    }

    function renderSightWords() {
        const el = document.getElementById('parent-sight-words');
        el.innerHTML = '';

        // Show all words — KG test words + prerequisite words
        const allWords = SightWords.ALL_WORDS || SightWords.WORDS;
        allWords.forEach(word => {
            const mastery = Progress.getSightWordMastery(word);
            const acc = Progress.getSightWordAccuracy(word);
            const span = document.createElement('span');
            span.className = `word-chip mastery-${mastery}`;
            span.textContent = word;
            if (acc) {
                span.title = `${Math.round(acc.accuracy * 100)}% (${acc.total} attempts)`;
            }
            el.appendChild(span);
        });

        // Legend
        const legend = document.createElement('div');
        legend.className = 'word-legend';
        legend.innerHTML = `
            <span class="word-chip mastery-new">New</span>
            <span class="word-chip mastery-learning">Learning</span>
            <span class="word-chip mastery-mastered">Mastered</span>
        `;
        el.appendChild(legend);
    }

    function renderTopics() {
        const el = document.getElementById('parent-topics');
        const d = Progress.get();
        let html = '';

        // Math topics
        html += '<h4>Math</h4>';
        MathData.topics.forEach(t => {
            const stats = d.topicStats[`math-${t.id}`];
            if (stats && stats.total > 0) {
                const pct = Math.round((stats.correct / stats.total) * 100);
                html += `
                    <div class="topic-bar-row">
                        <span class="topic-bar-name">${t.name}</span>
                        <div class="topic-bar-track">
                            <div class="topic-bar-fill" style="width:${pct}%;background:${pct >= 80 ? '#2ecc71' : pct >= 50 ? '#f39c12' : '#e94560'}"></div>
                        </div>
                        <span class="topic-bar-pct">${pct}%</span>
                    </div>`;
            }
        });

        // Reading topics
        html += '<h4>Reading</h4>';
        ReadingData.topics.forEach(t => {
            const stats = d.topicStats[`reading-${t.id}`];
            if (stats && stats.total > 0) {
                const pct = Math.round((stats.correct / stats.total) * 100);
                html += `
                    <div class="topic-bar-row">
                        <span class="topic-bar-name">${t.name}</span>
                        <div class="topic-bar-track">
                            <div class="topic-bar-fill" style="width:${pct}%;background:${pct >= 80 ? '#2ecc71' : pct >= 50 ? '#f39c12' : '#e94560'}"></div>
                        </div>
                        <span class="topic-bar-pct">${pct}%</span>
                    </div>`;
            }
        });

        if (!html.includes('topic-bar-row')) {
            html += '<p class="pixel-text" style="color:#888">No topic data yet — play Crafting mode!</p>';
        }

        el.innerHTML = html;
    }

    function show() {
        // Reset lock each time
        document.getElementById('parent-lock').style.display = 'block';
        document.getElementById('parent-dashboard').style.display = 'none';
        document.getElementById('parent-answer').value = '';

        // New math problem
        const a = Math.floor(Math.random() * 10) + 5;
        const b = Math.floor(Math.random() * 10) + 5;
        mathProblem = { a, b, answer: a * b };
        document.getElementById('parent-math').textContent = `${a} × ${b} = ?`;
    }

    return { init, show, renderDashboard };
})();
