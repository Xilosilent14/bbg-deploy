// ===== ACHIEVEMENTS SYSTEM V3 =====
const Achievements = {
    definitions: [
        // Original 10
        { id: 'first-race', name: 'First Race', icon: '🏁', desc: 'Complete your first race' },
        { id: 'perfect-score', name: 'Perfect Score', icon: '💯', desc: 'Get 8/8 on a race' },
        { id: 'speed-demon', name: 'Speed Demon', icon: '⚡', desc: 'Max out speed upgrades' },
        { id: 'math-whiz', name: 'Math Whiz', icon: '🧮', desc: 'Answer 50 math questions correctly' },
        { id: 'bookworm', name: 'Bookworm', icon: '📚', desc: 'Answer 50 reading questions correctly' },
        { id: 'road-warrior', name: 'Road Warrior', icon: '🗺️', desc: 'Unlock all 7 tracks' },
        { id: 'streak-master', name: 'Streak Master', icon: '🔥', desc: 'Get a 5x answer streak' },
        { id: 'night-racer', name: 'Night Racer', icon: '🌃', desc: 'Race on the Night Neon Strip' },
        { id: 'champion', name: 'Champion', icon: '🏆', desc: 'Win the Championship Finale' },
        { id: 'level-10', name: 'Level 10', icon: '⭐', desc: 'Reach Level 10' },
        // V3: 10 new achievements
        { id: 'hat-trick', name: 'Hat Trick', icon: '🎩', desc: '3 stars on 3 different tracks' },
        { id: 'explorer', name: 'Explorer', icon: '🧭', desc: 'Race on every track at least once' },
        { id: 'word-wizard', name: 'Word Wizard', icon: '📖', desc: '50 reading correct at 1st-grade level' },
        { id: 'number-ninja', name: 'Number Ninja', icon: '🥷', desc: '50 math correct at 1st-grade level' },
        { id: 'comeback-kid', name: 'Comeback Kid', icon: '💪', desc: 'Wrong answer then next 3 correct' },
        { id: 'speed-reader', name: 'Speed Reader', icon: '⏱️', desc: 'Complete a reading race under 3 min' },
        { id: 'daily-devotion', name: 'Daily Devotion', icon: '📅', desc: 'Complete 7 daily challenges' },
        { id: 'star-collector', name: 'Star Collector', icon: '🌟', desc: 'Earn 100 total stars' },
        { id: 'all-upgrades', name: 'All Upgrades', icon: '🔧', desc: 'Max out all 3 car upgrades' },
        { id: 'legend', name: 'Legend', icon: '👑', desc: 'Reach Level 20' },
        // V13: 10 more achievements for new topics & milestones
        { id: 'century', name: 'Century Racer', icon: '💯', desc: 'Answer 100 questions correctly' },
        { id: 'five-hundred', name: '500 Club', icon: '🏅', desc: 'Answer 500 questions total' },
        { id: 'twenty-races', name: 'Race Veteran', icon: '🏎️', desc: 'Complete 20 races' },
        { id: 'sorting-star', name: 'Sorting Star', icon: '📊', desc: 'Get 10 sorting questions right' },
        { id: 'size-sense', name: 'Size Sense', icon: '📐', desc: 'Get 10 size questions right' },
        { id: 'syllable-pro', name: 'Syllable Pro', icon: '👏', desc: 'Get 10 syllables questions right' },
        { id: 'color-collector', name: 'Color Collector', icon: '🎨', desc: 'Unlock 5 car colors' },
        { id: 'streak-blaze', name: 'Streak Blaze', icon: '🌟', desc: 'Get a 10x answer streak' },
        { id: 'three-peat', name: 'Three-Peat', icon: '🎯', desc: 'Get 3 perfect scores' },
        { id: 'well-rounded', name: 'Well-Rounded', icon: '🌍', desc: 'Play every math topic at least once' },
        // V26: 15 achievements for game modes, story, milestones
        { id: 'time-trial-gold', name: 'Gold Rush', icon: '🥇', desc: 'Get 3 stars in Time Trial' },
        { id: 'boss-slayer', name: 'Boss Slayer', icon: '🐉', desc: 'Win a Boss Race' },
        { id: 'free-spirit', name: 'Free Spirit', icon: '🕊️', desc: 'Complete a Free Drive' },
        { id: 'story-ch1', name: 'Hometown Hero', icon: '🏎️', desc: 'Complete Road Trip Chapter 1' },
        { id: 'story-ch2', name: 'College Cruiser', icon: '🌷', desc: 'Complete Road Trip Chapter 2' },
        { id: 'story-ch3', name: 'Lakeshore Runner', icon: '🍒', desc: 'Complete Road Trip Chapter 3' },
        { id: 'story-ch4', name: 'Bridge Crosser', icon: '🌉', desc: 'Complete Road Trip Chapter 4' },
        { id: 'story-ch5', name: 'Michigan Master', icon: '🏆', desc: 'Complete all Road Trip chapters' },
        { id: 'fifty-races', name: 'Fifty Races', icon: '🏁', desc: 'Complete 50 total races' },
        { id: 'thousand-correct', name: 'Brain Power', icon: '🧠', desc: '1000 correct answers' },
        { id: 'all-topics-math', name: 'Math Master', icon: '🎓', desc: 'Play every math topic' },
        { id: 'all-topics-reading', name: 'Reading Champ', icon: '📕', desc: 'Play every reading topic' },
        { id: 'level-30', name: 'Elite Racer', icon: '🎖️', desc: 'Reach Level 30' },
        { id: 'level-40', name: 'Hall of Famer', icon: '💎', desc: 'Reach Level 40' },
        // V34: Extended progression achievements
        { id: 'level-50', name: 'Half Century', icon: '🏅', desc: 'Reach Level 50' },
        { id: 'level-60', name: 'GOAT', icon: '🐐', desc: 'Reach Level 60' },
        { id: 'prestige-1', name: 'Born Again', icon: '🌟', desc: 'Prestige for the first time' },
        { id: 'prestige-3', name: 'Triple Star', icon: '✨', desc: 'Reach Prestige 3' },
        // V34: Boss tier achievements
        { id: 'boss-tier2', name: 'Rival Conquered', icon: '🐉', desc: 'Beat Boss II' },
        { id: 'boss-tier3', name: 'Ultimate Champion', icon: '👑', desc: 'Beat Boss III' },
        { id: 'daily-30', name: 'Monthly Devotion', icon: '📆', desc: '30 daily challenges completed' },
        { id: 'streak-15', name: 'On Fire', icon: '💥', desc: 'Get a 15-answer streak' }
    ],

    checkAfterRace(results, trackIndex) {
        const newlyEarned = [];

        // First Race
        if (Progress.data.totalRaces >= 1) {
            if (this._award('first-race')) newlyEarned.push(this.get('first-race'));
        }

        // Perfect Score
        if (results.correct === results.total && results.total > 0) {
            if (this._award('perfect-score')) newlyEarned.push(this.get('perfect-score'));
        }

        // Streak Master
        if (results.streak >= 5) {
            if (this._award('streak-master')) newlyEarned.push(this.get('streak-master'));
        }

        // Night Racer (track 5)
        if (trackIndex === 5) {
            if (this._award('night-racer')) newlyEarned.push(this.get('night-racer'));
        }

        // Champion (track 6, 2+ stars)
        if (trackIndex === 6 && results.stars >= 2) {
            if (this._award('champion')) newlyEarned.push(this.get('champion'));
        }

        // Road Warrior (all tracks unlocked)
        if (Progress.data.tracksUnlocked.every(t => t)) {
            if (this._award('road-warrior')) newlyEarned.push(this.get('road-warrior'));
        }

        // Math Whiz
        const mathCorrect = Object.values(Progress.data.mathAccuracy).reduce((sum, a) => sum + a.correct, 0);
        if (mathCorrect >= 50) {
            if (this._award('math-whiz')) newlyEarned.push(this.get('math-whiz'));
        }

        // Bookworm
        const readCorrect = Object.values(Progress.data.readingAccuracy).reduce((sum, a) => sum + a.correct, 0);
        if (readCorrect >= 50) {
            if (this._award('bookworm')) newlyEarned.push(this.get('bookworm'));
        }

        // Level 10
        if (Progress.data.playerLevel >= 10) {
            if (this._award('level-10')) newlyEarned.push(this.get('level-10'));
        }

        // Speed Demon
        if (Progress.data.carUpgrades.speed >= 5) {
            if (this._award('speed-demon')) newlyEarned.push(this.get('speed-demon'));
        }

        // --- V3 NEW ACHIEVEMENTS ---

        // Hat Trick — 3 stars on 3 different tracks
        if (results.stars === 3) {
            // Count distinct tracks with 3 stars (we track via trackFirstCompleted as proxy,
            // but simpler: just check if this is at least the 3rd 3-star race)
            if (!Progress.data._threeStarTracks) Progress.data._threeStarTracks = [];
            if (!Progress.data._threeStarTracks.includes(trackIndex)) {
                Progress.data._threeStarTracks.push(trackIndex);
                Progress.save();
            }
            if (Progress.data._threeStarTracks.length >= 3) {
                if (this._award('hat-trick')) newlyEarned.push(this.get('hat-trick'));
            }
        }

        // Explorer — race on every track
        if (Progress.data.tracksRacedOn && Progress.data.tracksRacedOn.length >= 7) {
            if (this._award('explorer')) newlyEarned.push(this.get('explorer'));
        }

        // Word Wizard — 50 reading correct at 1st-grade level
        const readHardCorrect = this._countCorrectAtLevel('reading', 2) + this._countCorrectAtLevel('reading', 3);
        if (readHardCorrect >= 50) {
            if (this._award('word-wizard')) newlyEarned.push(this.get('word-wizard'));
        }

        // Number Ninja — 50 math correct at 1st-grade level
        const mathHardCorrect = this._countCorrectAtLevel('math', 2) + this._countCorrectAtLevel('math', 3);
        if (mathHardCorrect >= 50) {
            if (this._award('number-ninja')) newlyEarned.push(this.get('number-ninja'));
        }

        // Comeback Kid — wrong answer then next 3 correct (streak >= 3 after at least 1 wrong)
        if (results.correct < results.total && results.streak >= 3) {
            if (this._award('comeback-kid')) newlyEarned.push(this.get('comeback-kid'));
        }

        // Speed Reader — reading race under 3 minutes
        if (results.raceTime && results.raceTime < 180 && results.subject === 'reading') {
            if (this._award('speed-reader')) newlyEarned.push(this.get('speed-reader'));
        }

        // Daily Devotion — 7 daily challenges completed
        if (Progress.data.dailyChallengesCompleted >= 7) {
            if (this._award('daily-devotion')) newlyEarned.push(this.get('daily-devotion'));
        }

        // Star Collector — 100 total stars
        if (Progress.data.totalStarsEarned >= 100) {
            if (this._award('star-collector')) newlyEarned.push(this.get('star-collector'));
        }

        // All Upgrades — max all 3
        if (Progress.data.carUpgrades.speed >= 5 &&
            Progress.data.carUpgrades.nitro >= 5 &&
            Progress.data.carUpgrades.handling >= 5) {
            if (this._award('all-upgrades')) newlyEarned.push(this.get('all-upgrades'));
        }

        // Legend — Level 20
        if (Progress.data.playerLevel >= 20) {
            if (this._award('legend')) newlyEarned.push(this.get('legend'));
        }

        // --- V13 NEW ACHIEVEMENTS ---

        // Century Racer — 100 correct answers
        if (Progress.data.totalCorrect >= 100) {
            if (this._award('century')) newlyEarned.push(this.get('century'));
        }

        // 500 Club — 500 total questions
        if (Progress.data.totalQuestionsAnswered >= 500) {
            if (this._award('five-hundred')) newlyEarned.push(this.get('five-hundred'));
        }

        // Race Veteran — 20 races
        if (Progress.data.totalRaces >= 20) {
            if (this._award('twenty-races')) newlyEarned.push(this.get('twenty-races'));
        }

        // Sorting Star — 10 sorting correct
        const sortingAcc = Progress.data.mathAccuracy['math_sorting'];
        if (sortingAcc && sortingAcc.correct >= 10) {
            if (this._award('sorting-star')) newlyEarned.push(this.get('sorting-star'));
        }

        // Size Sense — 10 size correct
        const sizeAcc = Progress.data.mathAccuracy['math_size'];
        if (sizeAcc && sizeAcc.correct >= 10) {
            if (this._award('size-sense')) newlyEarned.push(this.get('size-sense'));
        }

        // Syllable Pro — 10 syllables correct
        const syllablesAcc = Progress.data.readingAccuracy['reading_syllables'];
        if (syllablesAcc && syllablesAcc.correct >= 10) {
            if (this._award('syllable-pro')) newlyEarned.push(this.get('syllable-pro'));
        }

        // Color Collector — 5 car colors unlocked
        if (Progress.data.carsUnlocked.length >= 5) {
            if (this._award('color-collector')) newlyEarned.push(this.get('color-collector'));
        }

        // Streak Blaze — 10x answer streak
        if (results.streak >= 10) {
            if (this._award('streak-blaze')) newlyEarned.push(this.get('streak-blaze'));
        }

        // Three-Peat — 3 perfect scores
        if (results.correct === results.total && results.total > 0) {
            if (!Progress.data._perfectScores) Progress.data._perfectScores = 0;
            Progress.data._perfectScores++;
            Progress.save();
            if (Progress.data._perfectScores >= 3) {
                if (this._award('three-peat')) newlyEarned.push(this.get('three-peat'));
            }
        }

        // Well-Rounded — played every math topic at least once
        const allMathIds = MathData.topics.map(t => t.id);
        const playedAll = allMathIds.every(id => Progress.data.topicLastPlayed[`math_${id}`] !== undefined);
        if (playedAll) {
            if (this._award('well-rounded')) newlyEarned.push(this.get('well-rounded'));
        }

        // --- V26 NEW ACHIEVEMENTS ---

        // Gold Rush — 3 stars in Time Trial
        if (results.gameMode === 'time-trial' && results.stars >= 3) {
            if (this._award('time-trial-gold')) newlyEarned.push(this.get('time-trial-gold'));
        }

        // Boss Slayer — win a Boss Race
        if (results.gameMode === 'boss' && results.stars >= 2) {
            if (this._award('boss-slayer')) newlyEarned.push(this.get('boss-slayer'));
        }
        // V34: Boss tier achievements
        if (results.gameMode === 'boss' && results.stars >= 2 && results.bossTier >= 2) {
            if (this._award('boss-tier2')) newlyEarned.push(this.get('boss-tier2'));
        }
        if (results.gameMode === 'boss' && results.stars >= 2 && results.bossTier >= 3) {
            if (this._award('boss-tier3')) newlyEarned.push(this.get('boss-tier3'));
        }

        // Free Spirit — complete a Free Drive
        if (results.gameMode === 'free') {
            if (this._award('free-spirit')) newlyEarned.push(this.get('free-spirit'));
        }

        // Story Chapter achievements (V40: Michigan Road Trip — check by chapter ID)
        const sp = Progress.data.storyProgress;
        if (sp && sp.chaptersCompleted) {
            const completed = sp.chaptersCompleted;
            if (completed.includes('hometown-heroes')) {
                if (this._award('story-ch1')) newlyEarned.push(this.get('story-ch1'));
            }
            if (completed.includes('college-cruise')) {
                if (this._award('story-ch2')) newlyEarned.push(this.get('story-ch2'));
            }
            if (completed.includes('lakeshore-run')) {
                if (this._award('story-ch3')) newlyEarned.push(this.get('story-ch3'));
            }
            if (completed.includes('bridge-up')) {
                if (this._award('story-ch4')) newlyEarned.push(this.get('story-ch4'));
            }
            if (completed.length >= 5) {
                if (this._award('story-ch5')) newlyEarned.push(this.get('story-ch5'));
            }
        }

        // Fifty Races — 50 total
        if (Progress.data.totalRaces >= 50) {
            if (this._award('fifty-races')) newlyEarned.push(this.get('fifty-races'));
        }

        // Brain Power — 1000 correct answers
        if (Progress.data.totalCorrect >= 1000) {
            if (this._award('thousand-correct')) newlyEarned.push(this.get('thousand-correct'));
        }

        // Math Master — played every math topic (same condition as well-rounded, separate achievement)
        if (playedAll) {
            if (this._award('all-topics-math')) newlyEarned.push(this.get('all-topics-math'));
        }

        // Reading Champ — played every reading topic
        const allReadingIds = ReadingData.topics.map(t => t.id);
        const playedAllReading = allReadingIds.every(id => Progress.data.topicLastPlayed[`reading_${id}`] !== undefined);
        if (playedAllReading) {
            if (this._award('all-topics-reading')) newlyEarned.push(this.get('all-topics-reading'));
        }

        // Elite Racer — Level 30
        if (Progress.data.playerLevel >= 30) {
            if (this._award('level-30')) newlyEarned.push(this.get('level-30'));
        }

        // Hall of Famer — Level 40
        if (Progress.data.playerLevel >= 40) {
            if (this._award('level-40')) newlyEarned.push(this.get('level-40'));
        }
        // V34: Half Century — Level 50
        if (Progress.data.playerLevel >= 50) {
            if (this._award('level-50')) newlyEarned.push(this.get('level-50'));
        }
        // V34: GOAT — Level 60
        if (Progress.data.playerLevel >= 60) {
            if (this._award('level-60')) newlyEarned.push(this.get('level-60'));
        }
        // V34: Prestige achievements
        if ((Progress.data.prestigeLevel || 0) >= 1) {
            if (this._award('prestige-1')) newlyEarned.push(this.get('prestige-1'));
        }
        if ((Progress.data.prestigeLevel || 0) >= 3) {
            if (this._award('prestige-3')) newlyEarned.push(this.get('prestige-3'));
        }

        // Monthly Devotion — 30 daily challenges
        if (Progress.data.dailyChallengesCompleted >= 30) {
            if (this._award('daily-30')) newlyEarned.push(this.get('daily-30'));
        }

        // On Fire — 15x answer streak
        if (results.streak >= 15) {
            if (this._award('streak-15')) newlyEarned.push(this.get('streak-15'));
        }

        return newlyEarned;
    },

    // Helper: count correct answers where adaptive level was at or above given level
    _countCorrectAtLevel(subject, minLevel) {
        const acc = subject === 'math' ? Progress.data.mathAccuracy : Progress.data.readingAccuracy;
        let total = 0;
        Object.entries(acc).forEach(([key, data]) => {
            const topicId = key.replace(`${subject}_`, '');
            const level = Adaptive.getLevel(subject, topicId);
            if (level >= minLevel) {
                total += data.correct;
            }
        });
        return total;
    },

    checkAfterUpgrade() {
        // Speed Demon
        if (Progress.data.carUpgrades.speed >= 5) {
            if (this._award('speed-demon')) return this.get('speed-demon');
        }
        // All Upgrades
        if (Progress.data.carUpgrades.speed >= 5 &&
            Progress.data.carUpgrades.nitro >= 5 &&
            Progress.data.carUpgrades.handling >= 5) {
            if (this._award('all-upgrades')) return this.get('all-upgrades');
        }
        return null;
    },

    _award(id) {
        return Progress.awardAchievement(id);
    },

    get(id) {
        return this.definitions.find(a => a.id === id);
    },

    getAll() {
        return this.definitions.map(a => ({
            ...a,
            earned: Progress.hasAchievement(a.id)
        }));
    }
};
