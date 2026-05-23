/* ============================================
   ACHIEVEMENTS — Minecraft-themed Trophies
   ============================================ */
const Achievements = (() => {
    const defs = [
        // Getting Started
        { id: 'first-mine', name: 'First Block', desc: 'Mine your first word block' },
        { id: 'perfect-mine', name: 'Perfect Mine', desc: 'Get all answers right in Mine Mode' },
        { id: 'streak-5', name: 'Hot Streak', desc: 'Get a 5-answer streak' },
        { id: 'streak-10', name: 'On Fire', desc: 'Get a 10-answer streak' },
        { id: 'streak-15', name: 'Unstoppable', desc: 'Get a 15-answer streak' },

        // Progression
        { id: 'level-5', name: 'Apprentice', desc: 'Reach Level 5' },
        { id: 'level-10', name: 'Journeyman', desc: 'Reach Level 10' },
        { id: 'level-20', name: 'Expert', desc: 'Reach Level 20' },
        { id: 'level-30', name: 'Master', desc: 'Reach Level 30' },
        { id: 'level-50', name: 'Grand Master', desc: 'Reach Level 50' },

        // Volume
        { id: 'games-5', name: 'Getting Started', desc: 'Complete 5 games' },
        { id: 'games-20', name: 'Dedicated', desc: 'Complete 20 games' },
        { id: 'games-50', name: 'Veteran', desc: 'Complete 50 games' },
        { id: 'correct-50', name: 'Sharp Mind', desc: '50 correct answers' },
        { id: 'correct-100', name: 'Century', desc: '100 correct answers' },
        { id: 'correct-500', name: 'Brain Power', desc: '500 correct answers' },
        { id: 'correct-1000', name: 'Genius', desc: '1000 correct answers' },

        // Sight Words
        { id: 'sight-10', name: 'Word Spotter', desc: 'Master 10 sight words' },
        { id: 'sight-25', name: 'Word Expert', desc: 'Master 25 sight words' },
        { id: 'sight-50', name: 'All Words Mastered', desc: 'Master all 50 sight words' },

        // FastBridge
        { id: 'bridge-complete', name: 'Bridge Builder', desc: 'Complete the Bridge Builder test' },
        { id: 'bridge-benchmark', name: 'FastBridge Ready', desc: 'Hit 13+ words/min on Bridge Builder' },

        // Modes
        { id: 'enchant-complete', name: 'Enchanter', desc: 'Complete an Enchanting session' },
        { id: 'craft-complete', name: 'Crafter', desc: 'Complete a Crafting session' },
        { id: 'survival-win', name: 'Mob Slayer', desc: 'Win a Survival round' },

        // Topics
        { id: 'math-all', name: 'Math Master', desc: 'Play every math topic' },
        { id: 'reading-all', name: 'Reading Champ', desc: 'Play every reading topic' },
        { id: 'well-rounded', name: 'Well Rounded', desc: 'Play every topic at least once' },

        // Special
        { id: 'three-stars', name: 'Star Miner', desc: 'Get 3 stars on any game' },
        { id: 'three-stars-5', name: 'Star Collector', desc: 'Get 3 stars on 5 games' },
        { id: 'comeback', name: 'Comeback Kid', desc: 'Get wrong then next 3 correct' },

        // Extended Streaks
        { id: 'streak-25', name: 'Blazing', desc: 'Get a 25-answer streak' },
        { id: 'streak-50', name: 'Legendary', desc: 'Get a 50-answer streak' },

        // Extended Volume
        { id: 'games-100', name: 'Mining Addict', desc: 'Complete 100 games' },
        { id: 'correct-2500', name: 'Encyclopedia', desc: '2500 correct answers' },
        { id: 'correct-5000', name: 'Walking Library', desc: '5000 correct answers' },

        // Extended Sight Words
        { id: 'sight-75', name: 'Word Hoarder', desc: 'Master 75 sight words' },
        { id: 'sight-100', name: 'Sight Word Legend', desc: 'Master 100 sight words' },
        { id: 'sight-150', name: 'Word Mine Complete', desc: 'Master all 150 sight words' },

        // Speed
        { id: 'speed-20wpm', name: 'Speed Reader', desc: 'Hit 20 words/min on Bridge Builder' },
        { id: 'speed-30wpm', name: 'Lightning Reader', desc: 'Hit 30 words/min on Bridge Builder' },

        // Grade Milestones
        { id: 'grade-k-master', name: 'Kindergarten Pro', desc: 'Master all K topics' },
        { id: 'grade-1-master', name: 'First Grade Pro', desc: 'Master all 1st grade topics' },
        { id: 'grade-2-master', name: 'Second Grade Pro', desc: 'Master all 2nd grade topics' },
        { id: 'grade-3-master', name: 'Third Grade Pro', desc: 'Master all 3rd grade topics' },

        // Daily Play
        { id: 'daily-3', name: 'Regular Miner', desc: 'Play 3 days in a row' },
        { id: 'daily-7', name: 'Week Warrior', desc: 'Play 7 days in a row' },
        { id: 'daily-30', name: 'Monthly Master', desc: 'Play 30 days in a row' },

        // Stars Extended
        { id: 'three-stars-10', name: 'Star Hoarder', desc: 'Get 3 stars on 10 games' },
        { id: 'three-stars-25', name: 'Star Legend', desc: 'Get 3 stars on 25 games' }
    ];

    function checkAfterGame(results) {
        const earned = [];
        const d = Progress.get();

        // First mine
        if (d.totalRaces >= 1) tryAward('first-mine', earned);

        // Perfect
        if (results.correct === results.total && results.total > 0)
            tryAward('perfect-mine', earned);

        // Streaks
        if (results.bestStreak >= 5) tryAward('streak-5', earned);
        if (results.bestStreak >= 10) tryAward('streak-10', earned);
        if (results.bestStreak >= 15) tryAward('streak-15', earned);
        if (results.bestStreak >= 25) tryAward('streak-25', earned);
        if (results.bestStreak >= 50) tryAward('streak-50', earned);

        // Levels
        if (d.level >= 5) tryAward('level-5', earned);
        if (d.level >= 10) tryAward('level-10', earned);
        if (d.level >= 20) tryAward('level-20', earned);
        if (d.level >= 30) tryAward('level-30', earned);
        if (d.level >= 50) tryAward('level-50', earned);

        // Games
        if (d.totalRaces >= 5) tryAward('games-5', earned);
        if (d.totalRaces >= 20) tryAward('games-20', earned);
        if (d.totalRaces >= 50) tryAward('games-50', earned);
        if (d.totalRaces >= 100) tryAward('games-100', earned);

        // Correct answers
        if (d.totalCorrect >= 50) tryAward('correct-50', earned);
        if (d.totalCorrect >= 100) tryAward('correct-100', earned);
        if (d.totalCorrect >= 500) tryAward('correct-500', earned);
        if (d.totalCorrect >= 1000) tryAward('correct-1000', earned);
        if (d.totalCorrect >= 2500) tryAward('correct-2500', earned);
        if (d.totalCorrect >= 5000) tryAward('correct-5000', earned);

        // Sight words mastery
        const mastered = SightWords.WORDS.filter(w =>
            Progress.getSightWordMastery(w) === 'mastered'
        ).length;
        if (mastered >= 10) tryAward('sight-10', earned);
        if (mastered >= 25) tryAward('sight-25', earned);
        if (mastered >= 50) tryAward('sight-50', earned);
        if (mastered >= 75) tryAward('sight-75', earned);
        if (mastered >= 100) tryAward('sight-100', earned);
        if (mastered >= 150) tryAward('sight-150', earned);

        // Mode-specific
        if (results.mode === 'bridge') tryAward('bridge-complete', earned);
        if (results.mode === 'bridge' && results.wpm >= 13)
            tryAward('bridge-benchmark', earned);
        if (results.mode === 'bridge' && results.wpm >= 20)
            tryAward('speed-20wpm', earned);
        if (results.mode === 'bridge' && results.wpm >= 30)
            tryAward('speed-30wpm', earned);
        if (results.mode === 'enchant') tryAward('enchant-complete', earned);
        if (results.mode === 'craft') tryAward('craft-complete', earned);
        if (results.mode === 'survival' && results.won)
            tryAward('survival-win', earned);

        // Topics — check if player has tried every math/reading topic
        const topicStats = d.topicStats || {};
        const mathTopics = MathData.topics;
        const readingTopics = ReadingData.topics;
        const mathPlayed = mathTopics.filter(t => topicStats[`math-${t.id}`] && topicStats[`math-${t.id}`].total > 0).length;
        const readingPlayed = readingTopics.filter(t => topicStats[`reading-${t.id}`] && topicStats[`reading-${t.id}`].total > 0).length;
        if (mathPlayed >= mathTopics.length) tryAward('math-all', earned);
        if (readingPlayed >= readingTopics.length) tryAward('reading-all', earned);
        if (mathPlayed >= mathTopics.length && readingPlayed >= readingTopics.length) tryAward('well-rounded', earned);

        // 3 stars
        if (results.stars >= 3) tryAward('three-stars', earned);

        // 3 stars on 5+ games — count total three-star results
        if (results.stars >= 3) {
            const threeStarCount = (d.threeStarCount || 0) + 1;
            d.threeStarCount = threeStarCount;
            Progress.save();
            if (threeStarCount >= 5) tryAward('three-stars-5', earned);
            if (threeStarCount >= 10) tryAward('three-stars-10', earned);
            if (threeStarCount >= 25) tryAward('three-stars-25', earned);
        }

        // Comeback
        if (results.hadComeback) tryAward('comeback', earned);

        // Daily streak (from ecosystem)
        const streak = d.dailyStreak || 0;
        if (streak >= 3) tryAward('daily-3', earned);
        if (streak >= 7) tryAward('daily-7', earned);
        if (streak >= 30) tryAward('daily-30', earned);

        // Grade mastery — check if all topics at a grade are played with 80%+ accuracy
        const ts = d.topicStats || {};
        const gradeCheck = (prefix) => {
            const keys = Object.keys(ts).filter(k => k.startsWith(prefix));
            return keys.length > 0 && keys.every(k => ts[k].total > 0 && (ts[k].correct / ts[k].total) >= 0.8);
        };
        if (gradeCheck('math-k-') || gradeCheck('reading-k-')) tryAward('grade-k-master', earned);
        if (gradeCheck('math-1-') || gradeCheck('reading-1-')) tryAward('grade-1-master', earned);
        if (gradeCheck('math-2-') || gradeCheck('reading-2-')) tryAward('grade-2-master', earned);
        if (gradeCheck('math-3-') || gradeCheck('reading-3-')) tryAward('grade-3-master', earned);

        return earned;
    }

    function tryAward(id, list) {
        if (Progress.unlockAchievement(id)) {
            const def = defs.find(d => d.id === id);
            if (def) list.push(def);
        }
    }

    function getAll() {
        return defs.map(d => ({
            ...d,
            earned: Progress.hasAchievement(d.id)
        }));
    }

    function get(id) {
        return defs.find(d => d.id === id);
    }

    return { defs, checkAfterGame, getAll, get };
})();
