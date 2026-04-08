// ===== PROGRESS & SAVE SYSTEM =====
const Progress = {
    STORAGE_KEY: 'corvette-racer-save',

    // V34: XP thresholds extended to 60 levels
    LEVEL_THRESHOLDS: [
        0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,       // 1-10
        4700, 5700, 6800, 8000, 9300, 10700, 12200, 13800, 15500, 17300, // 11-20
        19200, 21200, 23300, 25500, 27800,                            // 21-25
        30200, 32700, 35300, 38000, 40800,                            // 26-30
        43700, 46700, 49800, 53000, 56300,                            // 31-35
        59700, 63200, 66800, 70500, 74300,                            // 36-40
        78200, 82200, 86300, 90500, 94800,                            // 41-45
        99200, 103700, 108300, 113000, 117800,                        // 46-50
        122700, 127700, 132800, 138000, 143300,                       // 51-55
        148700, 154200, 159800, 165500, 171300                        // 56-60
    ],

    RANK_NAMES: {
        1: 'Rookie', 2: 'Rookie', 3: 'Rookie',
        4: 'Racer', 5: 'Racer', 6: 'Racer',
        7: 'Pro', 8: 'Pro', 9: 'Pro',
        10: 'Expert', 11: 'Expert', 12: 'Expert',
        13: 'Champion', 14: 'Champion', 15: 'Champion',
        16: 'Legend', 17: 'Legend', 18: 'Legend', 19: 'Legend', 20: 'Legend',
        21: 'Master', 22: 'Master', 23: 'Master', 24: 'Master', 25: 'Master',
        26: 'Grand Master', 27: 'Grand Master', 28: 'Grand Master', 29: 'Grand Master', 30: 'Grand Master',
        31: 'All-Star', 32: 'All-Star', 33: 'All-Star', 34: 'All-Star', 35: 'All-Star',
        36: 'Hall of Fame', 37: 'Hall of Fame', 38: 'Hall of Fame', 39: 'Hall of Fame', 40: 'Hall of Fame',
        // V34: New ranks for levels 41-60
        41: 'Superstar', 42: 'Superstar', 43: 'Superstar', 44: 'Superstar', 45: 'Superstar',
        46: 'Mythic', 47: 'Mythic', 48: 'Mythic', 49: 'Mythic', 50: 'Mythic',
        51: 'Titan', 52: 'Titan', 53: 'Titan', 54: 'Titan', 55: 'Titan',
        56: 'GOAT', 57: 'GOAT', 58: 'GOAT', 59: 'GOAT', 60: 'GOAT'
    },

    RANK_BOUNDARIES: [1, 4, 7, 10, 13, 16, 21, 26, 31, 36, 41, 46, 51, 56], // levels where rank changes

    UPGRADE_COSTS: [3, 5, 8, 12, 18], // cost for level 2, 3, 4, 5 (level 1 is free)

    defaults() {
        return {
            stars: 0,
            totalStarsEarned: 0,
            totalXP: 0,
            playerLevel: 1,
            currentTrack: 0,
            tracksUnlocked: [true, false, false, false, false, false, false, false, false, false, false, false, false],
            carColor: 'red',
            carsUnlocked: ['red'],
            carUpgrades: { speed: 1, nitro: 1, handling: 1, durability: 1 },
            achievements: [],
            mathAccuracy: {},
            readingAccuracy: {},
            topicLastPlayed: {},  // for spaced repetition
            totalQuestionsAnswered: 0,
            totalCorrect: 0,
            totalRaces: 0,
            gradeLevel: 'prek', // V11: 'prek', 'k', or '1st'
            playerName: null, // V12: Player name from welcome flow
            totalTimePlayed: 0,
            sessionsPlayed: 0,
            lastPlayedDate: null,
            adaptiveLevels: {},
            // V3 additions
            dailyChallengeDate: null,
            dailyChallengeCompleted: false,
            dailyStreak: 0,
            bestStreak: 0,
            streakMilestones: [],   // claimed milestone day counts [3,7,14,30]
            trackFirstCompleted: [], // track indices completed for first time
            tracksRacedOn: [],       // track indices ever raced on
            dailyChallengesCompleted: 0,
            // V4/V5 additions
            carType: 'c1',
            carTypesUnlocked: ['c1'],
            tutorialCompleted: false,
            // V5 additions
            bonusColors: [],
            generationWins: {},
            _threeStarTracks: [],
            raceHistory: [],   // V5.3: last 20 races for parent dashboard
            // V5.8: Weekly challenges
            weeklyChallenge: null,
            weeklyChallengesCompleted: 0,
            // V16: Mods system
            modsUnlocked: [],    // purchased mod IDs
            activeMods: [],      // currently equipped mod IDs
            // V8: Best times per track
            trackBestTimes: {},  // { trackIndex: { time: seconds, position: 1-4, stars: 0-3 } }
            trackRaceCount: {},  // { trackIndex: number of races on this track }
            // V9: Ghost car data per track (array of {scrollX, playerY} samples every 10 frames)
            ghostData: {},
            // V23: Game mode tracking
            timeTrialBests: {},  // { trackIndex: { time, stars, accuracy } }
            freeRacesCompleted: 0,
            freeDriveHighScore: 0, // V34
            bossRacesWon: [],    // V34: ['math_prek_t1', ...] subject_grade_tier keys
            // V34: Prestige system
            prestigeLevel: 0,
            prestigeStars: [],   // timestamps of each prestige
            // V24: Story mode progress
            storyProgress: null,  // { currentChapter, currentRace, chaptersCompleted[], landmarks[] }
            // V31: Car naming
            carName: ''
        };
    },

    // V18: Valid IDs for save data validation
    VALID_COLORS: ['red','blue','yellow','black','green','orange','purple','white',
                   'neonpink','chrome','gold','galaxy','rainbow'],
    VALID_CAR_TYPES: ['c1','c2','c3','c4','c5','c6','c7','c8',
                      'beetle','mustang','delorean','porsche911','countach','cybertruck','bronco','wrangler',
                      'hotrod','ferrari','bronco2023','grandam','focus',
                      'batmobile','monstertruck','schoolbus','firetruck','wienermobile',
                      'policecar','ambulance','towtruck','icecreamtruck','gokart','limo','tank',
                      'zamboni','tractor',
                      'dumptruck','cementmixer','bulldozer',
                      'f1car','nascar','rocketcar',
                      'tacotruck','pizzacar','garbagetruck','mailtruck','taxi',
                      'hummerh1','vwbus','minicooper','fordf150'],
    VALID_STATS: ['speed','nitro','handling','durability'],
    VALID_MODS: ['big_car','tiny_car','fire_trail','star_trail','rainbow_trail','bouncy','turbo_start','lucky_star'],

    data: null,

    // V18: Validation helpers
    _clampInt(val, min, max) {
        if (typeof val !== 'number' || !isFinite(val)) return min;
        return Math.max(min, Math.min(max, Math.floor(val)));
    },
    _clampNum(val, min, max) {
        if (typeof val !== 'number' || !isFinite(val)) return min;
        return Math.max(min, Math.min(max, val));
    },
    _filterValid(arr, validSet) {
        if (!Array.isArray(arr)) return [];
        return arr.filter(item => validSet.includes(item));
    },
    _sanitizeName(str, maxLen) {
        if (typeof str !== 'string') return null;
        return str.replace(/[<>&"']/g, '').substring(0, maxLen) || null;
    },

    // V18: Validate and clamp all save data after loading
    _validate(data) {
        // Numeric fields
        data.stars = this._clampInt(data.stars, 0, 99999);
        data.totalStarsEarned = this._clampInt(data.totalStarsEarned, 0, 99999);
        data.totalXP = this._clampInt(data.totalXP, 0, 200000); // V34: raised for 60 levels
        data.playerLevel = this._clampInt(data.playerLevel, 1, 60); // V34: extended to 60
        // V34: Prestige fields
        data.prestigeLevel = this._clampInt(data.prestigeLevel || 0, 0, 99);
        if (!Array.isArray(data.prestigeStars)) data.prestigeStars = [];
        data.currentTrack = this._clampInt(data.currentTrack, 0, 7);
        data.totalQuestionsAnswered = this._clampInt(data.totalQuestionsAnswered, 0, 999999);
        data.totalCorrect = this._clampInt(data.totalCorrect, 0, data.totalQuestionsAnswered);
        data.totalRaces = this._clampInt(data.totalRaces, 0, 99999);
        data.sessionsPlayed = this._clampInt(data.sessionsPlayed, 0, 99999);
        data.totalTimePlayed = this._clampNum(data.totalTimePlayed, 0, 10000000);
        data.dailyStreak = this._clampInt(data.dailyStreak, 0, 9999);
        data.bestStreak = this._clampInt(data.bestStreak, 0, 9999);
        data.dailyChallengesCompleted = this._clampInt(data.dailyChallengesCompleted, 0, 9999);
        data.weeklyChallengesCompleted = this._clampInt(data.weeklyChallengesCompleted, 0, 9999);

        // Boolean arrays
        if (!Array.isArray(data.tracksUnlocked)) data.tracksUnlocked = [true, false, false, false, false, false, false, false, false, false, false, false, false];
        while (data.tracksUnlocked.length < 13) data.tracksUnlocked.push(false);
        data.tracksUnlocked.length = 13;
        data.tracksUnlocked = data.tracksUnlocked.map(v => !!v);
        data.tracksUnlocked[0] = true; // first track always unlocked

        // Car colors
        data.carsUnlocked = this._filterValid(data.carsUnlocked, this.VALID_COLORS);
        if (!data.carsUnlocked.includes('red')) data.carsUnlocked.unshift('red');
        if (!this.VALID_COLORS.includes(data.carColor)) {
            // Could be a bonus color — check that too
            const bonusIds = typeof CorvetteRenderer !== 'undefined' && CorvetteRenderer.bonusColors
                ? Object.keys(CorvetteRenderer.bonusColors) : [];
            if (!bonusIds.includes(data.carColor)) data.carColor = 'red';
        }

        // Car types
        data.carTypesUnlocked = this._filterValid(data.carTypesUnlocked, this.VALID_CAR_TYPES);
        if (!data.carTypesUnlocked.includes('c1')) data.carTypesUnlocked.unshift('c1');
        if (!this.VALID_CAR_TYPES.includes(data.carType)) data.carType = 'c1';

        // Car upgrades — only valid stats, each clamped 1-5
        const cleanUpgrades = {};
        this.VALID_STATS.forEach(s => {
            cleanUpgrades[s] = this._clampInt(data.carUpgrades?.[s], 1, 5);
        });
        data.carUpgrades = cleanUpgrades;

        // Mods
        data.modsUnlocked = this._filterValid(data.modsUnlocked, this.VALID_MODS);
        data.activeMods = this._filterValid(data.activeMods, this.VALID_MODS)
            .filter(m => data.modsUnlocked.includes(m));

        // Grade level — V41: added '3rd'
        if (!['prek', 'k', '1st', '2nd', '3rd'].includes(data.gradeLevel)) data.gradeLevel = 'prek';

        // Player name — sanitize
        if (data.playerName !== null) {
            data.playerName = this._sanitizeName(data.playerName, 20);
        }

        // V31: Car name — sanitize
        if (typeof data.carName !== 'string') data.carName = '';
        data.carName = data.carName.replace(/[<>&"']/g, '').substring(0, 20);

        // Arrays must be arrays
        if (!Array.isArray(data.achievements)) data.achievements = [];
        if (!Array.isArray(data.raceHistory)) data.raceHistory = [];
        data.raceHistory = data.raceHistory.slice(-20);
        if (!Array.isArray(data.streakMilestones)) data.streakMilestones = [];
        if (!Array.isArray(data.trackFirstCompleted)) data.trackFirstCompleted = [];
        if (!Array.isArray(data.tracksRacedOn)) data.tracksRacedOn = [];
        if (!Array.isArray(data.bonusColors)) data.bonusColors = [];

        // Objects must be objects
        if (typeof data.mathAccuracy !== 'object' || data.mathAccuracy === null) data.mathAccuracy = {};
        if (typeof data.readingAccuracy !== 'object' || data.readingAccuracy === null) data.readingAccuracy = {};
        if (typeof data.adaptiveLevels !== 'object' || data.adaptiveLevels === null) data.adaptiveLevels = {};
        if (typeof data.topicLastPlayed !== 'object' || data.topicLastPlayed === null) data.topicLastPlayed = {};
        if (typeof data.generationWins !== 'object' || data.generationWins === null) data.generationWins = {};
        if (typeof data.trackBestTimes !== 'object' || data.trackBestTimes === null) data.trackBestTimes = {};
        if (typeof data.trackRaceCount !== 'object' || data.trackRaceCount === null) data.trackRaceCount = {};
        if (typeof data.ghostData !== 'object' || data.ghostData === null) data.ghostData = {};

        // V23: Game mode tracking
        if (typeof data.timeTrialBests !== 'object' || data.timeTrialBests === null) data.timeTrialBests = {};
        data.freeRacesCompleted = this._clampInt(data.freeRacesCompleted, 0, 99999);
        data.freeDriveHighScore = this._clampInt(data.freeDriveHighScore || 0, 0, 99999); // V34
        if (!Array.isArray(data.bossRacesWon)) data.bossRacesWon = [];
        // V34/V36 fix: Migrate old boss keys without tier suffix to _t1
        // Legacy keys like "math_prek" → "math_prek_t1" (also keep legacy for backward compat)
        data.bossRacesWon = data.bossRacesWon.reduce((acc, key) => {
            if (!key.includes('_t')) {
                // Legacy key: add both legacy and migrated version
                if (!acc.includes(key)) acc.push(key);
                const migrated = key + '_t1';
                if (!acc.includes(migrated)) acc.push(migrated);
            } else {
                if (!acc.includes(key)) acc.push(key);
            }
            return acc;
        }, []);

        // V24: Story mode progress
        if (data.storyProgress && typeof data.storyProgress === 'object') {
            data.storyProgress.currentChapter = this._clampInt(data.storyProgress.currentChapter, 0, 3);
            data.storyProgress.currentRace = this._clampInt(data.storyProgress.currentRace, 0, 5);
            if (!Array.isArray(data.storyProgress.chaptersCompleted)) data.storyProgress.chaptersCompleted = [];
            if (!Array.isArray(data.storyProgress.landmarks)) data.storyProgress.landmarks = [];
        }

        // Boolean fields
        data.tutorialCompleted = !!data.tutorialCompleted;
        data.dailyChallengeCompleted = !!data.dailyChallengeCompleted;

        return data;
    },

    // V17: Debounced save for non-critical writes (mid-race answers)
    _saveTimer: null,
    _debouncedSave() {
        if (this._saveTimer) return;
        this._saveTimer = setTimeout(() => {
            this._saveTimer = null;
            this.save();
        }, 2000);
    },
    _flushSave() {
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
            this.save();
        }
    },

    load() {
        try {
            let saved = localStorage.getItem(this.STORAGE_KEY);
            // V17: Fall back to backup if primary is missing/corrupt
            if (!saved) {
                saved = localStorage.getItem(this.STORAGE_KEY + '-backup');
                if (saved) console.warn('Primary save missing, restored from backup');
            }
            if (saved) {
                this.data = { ...this.defaults(), ...JSON.parse(saved) };

                // V5: Migrate old car type IDs to Corvette generations (before validation)
                const oldTypeMap = { corvette: 'c1', truck: 'c1', racecar: 'c1', rocket: 'c1', gold: 'c1' };
                if (oldTypeMap[this.data.carType]) {
                    this.data.carType = 'c1';
                    this.data.carTypesUnlocked = ['c1'];
                }

                // V11: Existing players without gradeLevel default to K (not pre-k)
                if (!this.data.gradeLevel) this.data.gradeLevel = 'k';

                // V18: Validate and clamp all fields (replaces individual migration checks)
                this._validate(this.data);
            } else {
                this.data = this.defaults();
            }
        } catch (e) {
            console.warn('Could not load save data:', e);
            this.data = this.defaults();
        }

        // Update streak tracking
        this._updateStreak();

        this.data.sessionsPlayed++;
        this.data.lastPlayedDate = new Date().toDateString();
        this._sessionStart = Date.now();
        this.save();

        // V17: Flush saves on page close to prevent data loss
        window.addEventListener('beforeunload', () => {
            this._flushSave();
            this.save();
        });

        return this.data;
    },

    _updateStreak() {
        const today = new Date().toDateString();
        const lastPlayed = this.data.lastPlayedDate;

        if (!lastPlayed) {
            // First ever session
            this.data.dailyStreak = 1;
        } else if (lastPlayed === today) {
            // Already played today, keep streak
        } else {
            const lastDate = new Date(lastPlayed);
            const todayDate = new Date(today);
            const diffMs = todayDate - lastDate;
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day — increment streak
                this.data.dailyStreak++;
            } else {
                // Streak broken
                this.data.dailyStreak = 1;
            }
        }

        if (this.data.dailyStreak > this.data.bestStreak) {
            this.data.bestStreak = this.data.dailyStreak;
        }
    },

    // Check and claim streak milestones. Returns array of {days, reward} for newly claimed.
    checkStreakMilestones() {
        const milestones = [
            { days: 3, reward: 2 },
            { days: 7, reward: 5 },
            { days: 14, reward: 8 },
            { days: 30, reward: 15 }
        ];
        const newClaims = [];
        milestones.forEach(m => {
            if (this.data.dailyStreak >= m.days && !this.data.streakMilestones.includes(m.days)) {
                this.data.streakMilestones.push(m.days);
                this.addStars(m.reward);
                newClaims.push(m);
            }
        });
        if (newClaims.length > 0) this.save();
        return newClaims;
    },

    save() {
        try {
            if (this._sessionStart) {
                this.data.totalTimePlayed += (Date.now() - this._sessionStart) / 1000;
                this._sessionStart = Date.now();
            }
            const json = JSON.stringify(this.data);
            localStorage.setItem(this.STORAGE_KEY, json);
            // V17: Best-effort backup copy
            try { localStorage.setItem(this.STORAGE_KEY + '-backup', json); } catch (e2) {}
        } catch (e) {
            // V17: Handle quota exceeded by trimming large fields
            if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
                console.warn('Storage quota exceeded, trimming data...');
                if (this.data.raceHistory && this.data.raceHistory.length > 5) {
                    this.data.raceHistory = this.data.raceHistory.slice(-5);
                }
                if (this.data.ghostData) {
                    const keys = Object.keys(this.data.ghostData);
                    if (keys.length > 3) {
                        keys.slice(0, keys.length - 3).forEach(k => delete this.data.ghostData[k]);
                    }
                }
                try {
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
                } catch (e2) {
                    console.error('Save failed even after trimming:', e2);
                }
            } else {
                console.warn('Could not save data:', e);
            }
        }
    },

    // ---- XP & LEVELING ----
    calculateLevel(xp) {
        for (let i = this.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (xp >= this.LEVEL_THRESHOLDS[i]) return i + 1;
        }
        return 1;
    },

    _getRankForLevel(level) {
        return this.RANK_NAMES[level] || 'GOAT'; // V34: fallback updated
    },

    addXP(amount) {
        // V18: Reject invalid input
        if (typeof amount !== 'number' || !isFinite(amount) || amount < 0) {
            return { leveledUp: false, rankChanged: false };
        }
        amount = Math.floor(amount);
        const oldLevel = this.data.playerLevel;
        const oldRank = this._getRankForLevel(oldLevel);
        this.data.totalXP += amount;
        this.data.playerLevel = this.calculateLevel(this.data.totalXP);
        this.save();

        const newRank = this._getRankForLevel(this.data.playerLevel);
        const rankChanged = oldRank !== newRank;

        if (this.data.playerLevel > oldLevel) {
            return { leveledUp: true, newLevel: this.data.playerLevel, rank: newRank, rankChanged, newRank };
        }
        return { leveledUp: false, rankChanged: false };
    },

    getRank() {
        return this.RANK_NAMES[this.data.playerLevel] || 'GOAT';
    },

    // V34: Prestige system — reset level but keep all unlocks
    prestige() {
        if (this.data.playerLevel < 60) return false;
        this.data.prestigeLevel = (this.data.prestigeLevel || 0) + 1;
        if (!this.data.prestigeStars) this.data.prestigeStars = [];
        this.data.prestigeStars.push(Date.now());
        // Reset XP/level only — keep everything else
        this.data.totalXP = 0;
        this.data.playerLevel = 1;
        this.save();
        return true;
    },

    getPrestigeLevel() {
        return this.data.prestigeLevel || 0;
    },

    getXPForNextLevel() {
        const lvl = this.data.playerLevel;
        if (lvl >= this.LEVEL_THRESHOLDS.length) return null; // max level
        return this.LEVEL_THRESHOLDS[lvl]; // next threshold
    },

    getXPProgress() {
        const lvl = this.data.playerLevel;
        const currentThreshold = this.LEVEL_THRESHOLDS[lvl - 1] || 0;
        const nextThreshold = this.LEVEL_THRESHOLDS[lvl] || currentThreshold;
        if (nextThreshold === currentThreshold) return 1; // max level
        const result = (this.data.totalXP - currentThreshold) / (nextThreshold - currentThreshold);
        // V18: Guard against NaN from corrupted data
        return isNaN(result) ? 0 : Math.max(0, Math.min(1, result));
    },

    // ---- STARS ----
    addStars(count) {
        // V18: Reject invalid input
        if (typeof count !== 'number' || !isFinite(count) || count < 0) return;
        count = Math.floor(count);
        this.data.stars += count;
        this.data.totalStarsEarned += count;
        this.save();
    },

    spendStars(amount) {
        if (this.data.stars >= amount) {
            this.data.stars -= amount;
            this.save();
            return true;
        }
        return false;
    },

    // ---- CAR UPGRADES ----
    getUpgradeLevel(stat) {
        return this.data.carUpgrades[stat] || 1;
    },

    getUpgradeCost(stat) {
        const level = this.getUpgradeLevel(stat);
        if (level >= 5) return null; // maxed
        return this.UPGRADE_COSTS[level - 1];
    },

    upgradeStats(stat) {
        // V18: Validate stat name
        if (!this.VALID_STATS.includes(stat)) return false;
        const cost = this.getUpgradeCost(stat);
        if (cost === null) return false; // maxed
        if (this.spendStars(cost)) {
            this.data.carUpgrades[stat]++;
            this.save();
            return true;
        }
        return false;
    },

    getCarStats() {
        return {
            speed: 1 + (this.data.carUpgrades.speed - 1) * 0.2,       // 1.0 → 1.8
            nitro: 1 + (this.data.carUpgrades.nitro - 1) * 0.25,      // 1.0 → 2.0
            handling: 1 + (this.data.carUpgrades.handling - 1) * 0.2,  // 1.0 → 1.8
            durability: 1 + ((this.data.carUpgrades.durability || 1) - 1) * 0.2  // 1.0 → 1.8
        };
    },

    // ---- V31: CAR NAMING ----
    setCarName(name) {
        this.data.carName = (name || '').replace(/[<>&"']/g, '').substring(0, 20);
        this.save();
    },

    getCarDisplayName() {
        return this.data.carName || '';
    },

    // V31: Check if player has enough total stars for a track
    meetsStarGate(trackIndex) {
        const reqs = Game.trackStarReqs || [0, 5, 15, 30, 50, 75, 100, 150];
        const req = reqs[trackIndex] || 0;
        return (this.data.totalStarsEarned || 0) >= req;
    },

    // ---- V16: MODS ----
    purchaseMod(modId, cost) {
        if (this.data.modsUnlocked.includes(modId)) return false;
        if (this.spendStars(cost)) {
            this.data.modsUnlocked.push(modId);
            this.save();
            return true;
        }
        return false;
    },

    hasMod(modId) {
        return this.data.modsUnlocked.includes(modId);
    },

    isModActive(modId) {
        return (this.data.activeMods || []).includes(modId);
    },

    toggleMod(modId, category, allModsInCategory) {
        if (!this.hasMod(modId)) return false;
        const active = this.data.activeMods || [];
        const idx = active.indexOf(modId);
        if (idx >= 0) {
            // Deactivate
            active.splice(idx, 1);
        } else {
            // Deactivate other mods in same category (mutually exclusive)
            if (category && allModsInCategory) {
                allModsInCategory.forEach(id => {
                    const i = active.indexOf(id);
                    if (i >= 0) active.splice(i, 1);
                });
            }
            active.push(modId);
        }
        this.data.activeMods = active;
        this.save();
        return true;
    },

    // ---- DAILY CHALLENGE ----
    getDailyChallenge() {
        const today = new Date().toDateString();
        // Deterministic hash from date string
        let hash = 0;
        for (let i = 0; i < today.length; i++) {
            hash = ((hash << 5) - hash) + today.charCodeAt(i);
            hash |= 0;
        }
        hash = Math.abs(hash);

        const subjects = ['math', 'reading'];
        const subject = subjects[hash % 2];

        const topics = subject === 'math' ? MathData.topics : ReadingData.topics;
        const topic = topics[hash % topics.length];

        return { subject, topicId: topic.id, topicName: topic.name, topicIcon: topic.icon };
    },

    isDailyChallengeCompleted() {
        const today = new Date().toDateString();
        return this.data.dailyChallengeDate === today && this.data.dailyChallengeCompleted;
    },

    completeDailyChallenge() {
        const today = new Date().toDateString();
        if (this.data.dailyChallengeDate !== today || !this.data.dailyChallengeCompleted) {
            this.data.dailyChallengeDate = today;
            this.data.dailyChallengeCompleted = true;
            this.data.dailyChallengesCompleted++;
            this.save();
            return true;
        }
        return false;
    },

    resetDailyChallengeIfNewDay() {
        const today = new Date().toDateString();
        if (this.data.dailyChallengeDate !== today) {
            this.data.dailyChallengeDate = today;
            this.data.dailyChallengeCompleted = false;
            this.save();
        }
    },

    // ---- V5.8: WEEKLY CHALLENGES ----
    _weeklyChallengeTypes: [
        { type: 'races', goal: 10, desc: 'Complete 10 races', reward: 5, icon: '🏁' },
        { type: 'correct', goal: 30, desc: 'Answer 30 questions correctly', reward: 8, icon: '✅' },
        { type: 'perfects', goal: 3, desc: 'Get 3 perfect scores', reward: 10, icon: '⭐' },
        { type: 'streak', goal: 5, desc: 'Get a 5-answer streak', reward: 6, icon: '🔥' },
        { type: 'math_races', goal: 5, desc: 'Complete 5 Math races', reward: 5, icon: '🔢' },
        { type: 'reading_races', goal: 5, desc: 'Complete 5 Reading races', reward: 5, icon: '📖' },
    ],

    getWeeklyChallenge() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekKey = weekStart.toDateString();

        if (!this.data.weeklyChallenge || this.data.weeklyChallenge.weekKey !== weekKey) {
            // New week — pick a challenge based on week hash
            const hash = weekKey.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0) & 0x7fffffff;
            const challenge = this._weeklyChallengeTypes[hash % this._weeklyChallengeTypes.length];
            this.data.weeklyChallenge = {
                weekKey,
                ...challenge,
                progress: 0,
                completed: false,
                claimed: false
            };
            this.save();
        }
        return this.data.weeklyChallenge;
    },

    updateWeeklyChallenge(results) {
        const ch = this.getWeeklyChallenge();
        if (ch.completed) return;

        switch (ch.type) {
            case 'races': ch.progress++; break;
            case 'correct': ch.progress += results.correct; break;
            case 'perfects': if (results.correct === results.total && results.total > 0) ch.progress++; break;
            case 'streak': ch.progress = Math.max(ch.progress, results.streak || 0); break;
            case 'math_races': if (results.subject === 'math') ch.progress++; break;
            case 'reading_races': if (results.subject === 'reading') ch.progress++; break;
        }

        if (ch.progress >= ch.goal) {
            ch.completed = true;
        }
        this.save();
    },

    claimWeeklyReward() {
        const ch = this.getWeeklyChallenge();
        if (ch.completed && !ch.claimed) {
            ch.claimed = true;
            this.data.stars += ch.reward;
            this.data.totalStarsEarned += ch.reward;
            this.data.weeklyChallengesCompleted++;
            this.save();
            return ch.reward;
        }
        return 0;
    },

    // ---- TRACK TRACKING ----
    recordTrackRaced(trackIndex) {
        if (!this.data.tracksRacedOn.includes(trackIndex)) {
            this.data.tracksRacedOn.push(trackIndex);
            this.save();
        }
    },

    isFirstTimeOnTrack(trackIndex) {
        return !this.data.trackFirstCompleted.includes(trackIndex);
    },

    recordTrackFirstComplete(trackIndex) {
        if (!this.data.trackFirstCompleted.includes(trackIndex)) {
            this.data.trackFirstCompleted.push(trackIndex);
            this.save();
            return true; // was first time
        }
        return false;
    },

    // ---- ANSWERS & ACCURACY ----
    // V33: Added optional subtype parameter for spaced repetition
    recordAnswer(subject, topic, correct, subtype) {
        // V18: Validate inputs
        if (!['math', 'reading'].includes(subject)) return;
        if (typeof topic !== 'string' || topic.length === 0 || topic.length > 30) return;
        const key = `${subject}_${topic}`;
        const acc = subject === 'math' ? this.data.mathAccuracy : this.data.readingAccuracy;

        if (!acc[key]) {
            acc[key] = { correct: 0, total: 0, recent: [] };
        }

        acc[key].total++;
        if (correct) acc[key].correct++;
        acc[key].recent.push(correct ? 1 : 0);
        if (acc[key].recent.length > 10) acc[key].recent.shift();

        // V33: Subtype tracking for spaced repetition
        if (subtype && typeof subtype === 'string' && subtype.length <= 30) {
            if (!acc[key].subtypes) acc[key].subtypes = {};
            if (!acc[key].subtypes[subtype]) {
                acc[key].subtypes[subtype] = { correct: 0, total: 0, lastSeen: 0 };
            }
            const st = acc[key].subtypes[subtype];
            st.total++;
            if (correct) st.correct++;
            st.lastSeen = this.data.sessionsPlayed;
        }

        this.data.totalQuestionsAnswered++;
        if (correct) this.data.totalCorrect++;

        // Track last played for spaced repetition
        this.data.topicLastPlayed[key] = this.data.sessionsPlayed;

        this._debouncedSave(); // V17: debounce non-critical mid-race saves
    },

    getAccuracy(subject, topic) {
        const key = `${subject}_${topic}`;
        const acc = subject === 'math' ? this.data.mathAccuracy : this.data.readingAccuracy;
        if (!acc[key] || acc[key].total === 0) return null;
        return acc[key].correct / acc[key].total;
    },

    getRecentAccuracy(subject, topic) {
        const key = `${subject}_${topic}`;
        const acc = subject === 'math' ? this.data.mathAccuracy : this.data.readingAccuracy;
        if (!acc[key] || acc[key].recent.length === 0) return null;
        const sum = acc[key].recent.reduce((a, b) => a + b, 0);
        return sum / acc[key].recent.length;
    },

    getSessionsSinceLastPlayed(subject, topic) {
        const key = `${subject}_${topic}`;
        const last = this.data.topicLastPlayed[key];
        if (last === undefined) return Infinity;
        return this.data.sessionsPlayed - last;
    },

    // ---- ACHIEVEMENTS ----
    hasAchievement(id) {
        return this.data.achievements.includes(id);
    },

    awardAchievement(id) {
        if (!this.hasAchievement(id)) {
            this.data.achievements.push(id);
            this.save();
            return true;
        }
        return false;
    },

    // ---- TRACKS & CARS ----
    unlockTrack(index) {
        if (index < this.data.tracksUnlocked.length) {
            this.data.tracksUnlocked[index] = true;
            this.save();
        }
    },

    unlockCar(color) {
        if (!this.data.carsUnlocked.includes(color)) {
            this.data.carsUnlocked.push(color);
            this.save();
        }
    },

    selectCar(color) {
        this.data.carColor = color;
        this.save();
    },

    // V4: Car type management
    unlockCarType(type) {
        if (!this.data.carTypesUnlocked.includes(type)) {
            this.data.carTypesUnlocked.push(type);
            this.save();
        }
    },

    selectCarType(type) {
        this.data.carType = type;
        this.save();
    },

    hasCarType(type) {
        return this.data.carTypesUnlocked.includes(type);
    },

    // V5: Bonus color management
    recordGenerationWin(genId) {
        if (!this.data.generationWins) this.data.generationWins = {};
        if (!this.data.generationWins[genId]) this.data.generationWins[genId] = 0;
        this.data.generationWins[genId]++;
        this.save();
        return this.data.generationWins[genId];
    },

    getGenerationWins(genId) {
        return (this.data.generationWins && this.data.generationWins[genId]) || 0;
    },

    unlockBonusColor(colorId) {
        if (!this.data.bonusColors) this.data.bonusColors = [];
        if (!this.data.bonusColors.includes(colorId)) {
            this.data.bonusColors.push(colorId);
            this.save();
            return true;
        }
        return false;
    },

    hasBonusColor(colorId) {
        return this.data.bonusColors && this.data.bonusColors.includes(colorId);
    },

    // V8: Record best time per track
    recordTrackResult(trackIndex, time, position, stars) {
        if (!this.data.trackBestTimes) this.data.trackBestTimes = {};
        if (!this.data.trackRaceCount) this.data.trackRaceCount = {};

        this.data.trackRaceCount[trackIndex] = (this.data.trackRaceCount[trackIndex] || 0) + 1;

        const prev = this.data.trackBestTimes[trackIndex];
        let isNewBest = false;

        if (!prev || time < prev.time) {
            this.data.trackBestTimes[trackIndex] = { time, position, stars };
            isNewBest = !!prev; // only "new best" if there was a previous
            this.save();
        }
        return isNewBest;
    },

    getTrackBest(trackIndex) {
        return this.data.trackBestTimes ? this.data.trackBestTimes[trackIndex] : null;
    },

    getTrackRaceCount(trackIndex) {
        return (this.data.trackRaceCount && this.data.trackRaceCount[trackIndex]) || 0;
    },

    recordRace(raceData) {
        this.data.totalRaces++;
        // V5.3: Store recent race history for parent dashboard
        if (raceData) {
            if (!this.data.raceHistory) this.data.raceHistory = [];
            this.data.raceHistory.push({
                date: new Date().toISOString(),
                subject: raceData.subject,
                topic: raceData.topic,
                correct: raceData.correct,
                total: raceData.total,
                stars: raceData.stars,
                streak: raceData.streak
            });
            // Keep only last 20
            if (this.data.raceHistory.length > 20) {
                this.data.raceHistory = this.data.raceHistory.slice(-20);
            }
        }
        this.save();
    },

    resetAll() {
        this.data = this.defaults();
        this.save();
    },

    // V23: Check if Free Drive is unlocked (after 5 total races)
    isFreeDriveUnlocked() {
        return this.data.totalRaces >= 5;
    },

    // V23: Check if Boss Race is available for a subject at current grade
    isBossUnlocked(subject) {
        // Need 2+ stars on at least 3 different topics in current grade
        const grade = this.data.gradeLevel || 'prek';
        const acc = subject === 'math' ? this.data.mathAccuracy : this.data.readingAccuracy;
        let topicsWithStars = 0;
        Object.entries(acc).forEach(([key, data]) => {
            if (key.startsWith(`${subject}_`) && data.correct >= 5 && (data.correct / Math.max(1, data.total)) >= 0.6) {
                topicsWithStars++;
            }
        });
        return topicsWithStars >= 3;
    },

    // V23/V34: Check if boss already beaten for this subject+grade+tier
    isBossBeaten(subject, tier) {
        const grade = this.data.gradeLevel || 'prek';
        const t = tier || 1;
        const bossKey = `${subject}_${grade}_t${t}`;
        const won = this.data.bossRacesWon || [];
        // V34: Also check legacy keys (no tier suffix = tier 1)
        if (t === 1 && won.includes(`${subject}_${grade}`)) return true;
        return won.includes(bossKey);
    },

    // V34: Check if a specific boss tier is unlocked
    isBossTierUnlocked(subject, tier) {
        if (tier <= 1) return this.isBossUnlocked(subject);
        // Must beat previous tier to unlock next
        return this.isBossBeaten(subject, tier - 1);
    }
};

Progress.load();
