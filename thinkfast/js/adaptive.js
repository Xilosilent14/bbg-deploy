// ===== ADAPTIVE DIFFICULTY SYSTEM V41 =====
const Adaptive = {
    // V41: Expanded from 8 to 10 levels — added 3rd grade
    LEVELS: ['prek-easy', 'prek-hard', 'k-easy', 'k-hard', '1st-easy', '1st-hard', '2nd-easy', '2nd-hard', '3rd-easy', '3rd-hard'],

    getLevel(subject, topic) {
        const key = `${subject}_${topic}`;
        if (Progress.data.adaptiveLevels[key] !== undefined) {
            return Progress.data.adaptiveLevels[key];
        }
        // Default based on grade setting
        const grade = Progress.data.gradeLevel || 'prek';
        if (grade === '3rd') return 8;
        if (grade === '2nd') return 6;
        if (grade === '1st') return 4;
        if (grade === 'k') return 2;
        return 0;
    },

    setLevel(subject, topic, level) {
        const key = `${subject}_${topic}`;
        Progress.data.adaptiveLevels[key] = Math.max(0, Math.min(9, level));
        Progress.save();
    },

    // V20: Reset all topics to a grade's starting level
    resetToGrade(grade) {
        const startLevel = grade === '3rd' ? 8 : grade === '2nd' ? 6 : grade === '1st' ? 4 : grade === 'k' ? 2 : 0;
        const allTopics = [
            ...MathData.topics.map(t => ({ subject: 'math', id: t.id })),
            ...ReadingData.topics.map(t => ({ subject: 'reading', id: t.id }))
        ];
        allTopics.forEach(t => {
            const key = `${t.subject}_${t.id}`;
            Progress.data.adaptiveLevels[key] = startLevel;
        });
        Progress.data.gradeLevel = grade;
        Progress.save();
    },

    // Track which topics already leveled this race (prevents multi-level jumps)
    _adjustedThisRace: new Set(),

    // Call at the start of each race to allow fresh adjustments
    resetRaceAdjustments() {
        this._adjustedThisRace.clear();
    },

    adjust(subject, topic, raceStreak) {
        const key = `${subject}_${topic}`;

        // Only allow ONE level change per topic per race
        if (this._adjustedThisRace.has(key)) return;

        const recentAcc = Progress.getRecentAccuracy(subject, topic);
        if (recentAcc === null) return;

        // Require minimum answers before adjusting
        const acc = subject === 'math' ? Progress.data.mathAccuracy : Progress.data.readingAccuracy;
        const recentCount = acc[key] ? acc[key].recent.length : 0;
        if (recentCount < 8) return; // need at least 8 recent answers (was 5)

        const currentLevel = this.getLevel(subject, topic);

        // No streak bonus at Pre-K levels — keep young learners stable longer
        const streakBonus = currentLevel >= 2
            ? ((raceStreak || 0) >= 5 ? 0.05 : (raceStreak || 0) >= 3 ? 0.03 : 0)
            : 0;
        const promoteThreshold = 0.85 - streakBonus;

        if (recentAcc >= promoteThreshold && currentLevel < 9) {
            this.setLevel(subject, topic, currentLevel + 1);
            this._adjustedThisRace.add(key);
        } else if (recentAcc < 0.45 && currentLevel > 0) {
            this.setLevel(subject, topic, currentLevel - 1);
            this._adjustedThisRace.add(key);
        }
    },

    getQuestionParams(subject, topic) {
        const level = this.getLevel(subject, topic);
        const levelName = this.LEVELS[level];
        return {
            level,
            levelName,
            grade: level < 2 ? 'Pre-K' : level < 4 ? 'K' : level < 6 ? '1st' : level < 8 ? '2nd' : '3rd',
            difficulty: level % 2 === 0 ? 'easy' : 'hard'
        };
    },

    getLevelLabel(level) {
        const labels = ['Pre-School (Easy)', 'Pre-School (Hard)', 'Kindergarten (Easy)', 'Kindergarten (Hard)', '1st Grade (Easy)', '1st Grade (Hard)', '2nd Grade (Easy)', '2nd Grade (Hard)', '3rd Grade (Easy)', '3rd Grade (Hard)'];
        return labels[level] || 'Unknown';
    },

    // V20: Get current grade label
    getGradeLabel() {
        const grade = Progress.data.gradeLevel || 'prek';
        return grade === '3rd' ? '3rd Grade' : grade === '2nd' ? '2nd Grade' : grade === '1st' ? '1st Grade' : grade === 'k' ? 'Kindergarten' : 'Pre-K';
    },

    // ---- SMART TOPIC SELECTION ----
    pickWeightedTopic(subject) {
        const topics = subject === 'math' ? MathData.topics : ReadingData.topics;
        const grade = Progress.data.gradeLevel || 'prek';
        const hidden = this.getHiddenTopics(subject, grade);
        const weights = [];

        topics.forEach(t => {
            if (hidden.includes(t.id)) return; // skip hidden topics for this grade
            let weight = 1;
            const acc = Progress.getAccuracy(subject, t.id);
            const sessionsSince = Progress.getSessionsSinceLastPlayed(subject, t.id);

            if (acc !== null && acc < 0.6) weight = 2;
            if (acc !== null && acc < 0.4) weight = 3;
            if (sessionsSince >= 3) weight += 1;

            // V33: Subtype-aware weighting — boost topics with weak/stale subtypes
            const accData = subject === 'math' ? Progress.data.mathAccuracy : Progress.data.readingAccuracy;
            const topicKey = `${subject}_${t.id}`;
            const subtypes = accData[topicKey] && accData[topicKey].subtypes;
            if (subtypes) {
                for (const stKey of Object.keys(subtypes)) {
                    const st = subtypes[stKey];
                    if (st.total >= 3) {
                        const stAcc = st.correct / st.total;
                        if (stAcc < 0.6) weight += 1; // weak subtype boost
                    }
                    // Staleness: not seen in 3+ sessions
                    const staleCount = (Progress.data.sessionsPlayed || 0) - (st.lastSeen || 0);
                    if (staleCount >= 3) weight += 0.5;
                }
            }

            weights.push({ topic: t, weight });
        });

        if (weights.length === 0) return topics[0]; // fallback
        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
        let r = Math.random() * totalWeight;
        for (const w of weights) {
            r -= w.weight;
            if (r <= 0) return w.topic;
        }
        return weights[0].topic;
    },

    // V20: Topics to hide per grade
    getHiddenTopics(subject, grade) {
        if (grade === 'prek') {
            if (subject === 'math') return ['place-value', 'word-problems', 'decomposing', 'money', 'time', 'multiplication', 'fractions', 'even-odd', 'skip-counting', 'measurement', 'three-digit', 'division', 'area-perimeter', 'rounding', 'function-tables'];
            // V34: Hide all advanced reading topics for pre-K
            // V41: Hide all advanced + 3rd grade topics for pre-K
            if (subject === 'reading') return ['sentences', 'compound-words', 'prefix-suffix', 'grammar', 'contractions', 'comprehension', 'spelling', 'synonyms', 'alphabetical', 'word-families', 'sequencing', 'homophones', 'capitalization', 'multi-syllable', 'context-clues', 'main-idea-detail', 'cause-effect', 'compare-contrast', 'text-features'];
        }
        if (grade === 'k') {
            if (subject === 'math') return ['money', 'time', 'multiplication', 'fractions', 'even-odd', 'skip-counting', 'measurement', 'three-digit', 'division', 'area-perimeter', 'rounding', 'function-tables'];
            // V41: K hides harder topics + all 3rd grade topics
            if (subject === 'reading') return ['compound-words', 'prefix-suffix', 'grammar', 'contractions', 'comprehension', 'synonyms', 'sequencing', 'homophones', 'capitalization', 'multi-syllable', 'context-clues', 'main-idea-detail', 'cause-effect', 'compare-contrast', 'text-features'];
        }
        if (grade === '1st') {
            if (subject === 'math') return ['colors', 'money', 'time', 'multiplication', 'fractions', 'even-odd', 'measurement', 'three-digit', 'division', 'area-perimeter', 'rounding', 'function-tables'];
            // V41: 1st grade hides some 2nd grade topics + all 3rd grade topics
            if (subject === 'reading') return ['compound-words', 'prefix-suffix', 'grammar', 'contractions', 'comprehension', 'homophones', 'multi-syllable', 'context-clues', 'main-idea-detail', 'cause-effect', 'compare-contrast', 'text-features'];
        }
        if (grade === '2nd') {
            if (subject === 'math') return ['colors', 'division', 'area-perimeter', 'rounding', 'function-tables'];
            // V41: 2nd grade hides 3rd grade topics
            if (subject === 'reading') return ['multi-syllable', 'context-clues', 'main-idea-detail', 'cause-effect', 'compare-contrast', 'text-features'];
        }
        if (grade === '3rd') {
            if (subject === 'math') return ['colors'];
            // V41: 3rd grade shows everything
        }
        return [];
    },

    getWeakTopics(subject) {
        const topics = subject === 'math' ? MathData.topics : ReadingData.topics;
        const weak = [];

        topics.forEach(t => {
            const acc = Progress.getAccuracy(subject, t.id);
            if (acc !== null && acc < 0.7) {
                weak.push({ ...t, accuracy: Math.round(acc * 100), subject });
            }
        });

        return weak.sort((a, b) => a.accuracy - b.accuracy);
    },

    getSuggestedTopics(subject) {
        const topics = subject === 'math' ? MathData.topics : ReadingData.topics;
        const suggested = [];

        topics.forEach(t => {
            const sessions = Progress.getSessionsSinceLastPlayed(subject, t.id);
            if (sessions >= 3) {
                suggested.push({ ...t, sessionsSince: sessions, subject });
            }
        });

        return suggested.sort((a, b) => b.sessionsSince - a.sessionsSince);
    }
};
