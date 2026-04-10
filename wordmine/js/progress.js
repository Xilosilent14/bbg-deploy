/* ============================================
   PROGRESS — XP, Leveling, Inventory, Per-Word Tracking
   ============================================ */
const Progress = (() => {
    const STORAGE_KEY = 'wordmine_progress';
    const RANKS = [
        'Rookie', 'Miner', 'Digger', 'Explorer', 'Crafter',
        'Builder', 'Warrior', 'Champion', 'Legend', 'Master',
        'Grand Master', 'All-Star', 'Hall of Fame', 'Superstar',
        'Mythic', 'Titan', 'GOAT'
    ];
    // XP thresholds per level
    const XP_PER_LEVEL = [
        0, 50, 120, 200, 300, 420, 560, 720, 900, 1100,
        1350, 1650, 2000, 2400, 2850, 3350, 3900, 4500, 5200, 6000,
        7000, 8200, 9600, 11200, 13000, 15000, 17500, 20500, 24000, 28000,
        33000, 38500, 44500, 51000, 58000, 66000, 75000, 85000, 96000, 108000,
        122000, 138000, 156000, 176000, 198000, 223000, 251000, 282000, 317000, 356000,
        400000, 450000, 505000, 567000, 636000, 714000, 801000, 899000, 1009000, 1133000
    ];

    let data = null;
    let sessionWordsMastered = 0;
    let sessionWordsLearned = 0;
    let lastMilestone = 0;

    function getDefault() {
        return {
            name: '',
            grade: 'k',
            xp: 0,
            level: 1,
            prestige: 0,
            totalRaces: 0,
            totalCorrect: 0,
            totalAnswered: 0,
            bestStreak: 0,
            // Per-sight-word tracking
            sightWords: {},
            // Per-nonsense-word tracking (aggregated)
            nonsenseStats: { correct: 0, total: 0, recentAccuracy: [] },
            // Per-topic tracking for math and reading
            topicStats: {},
            // Words per minute history (for FastBridge readiness)
            wpmHistory: [],
            nonsenseWpmHistory: [],
            // Unlocks
            skin: 'steve',
            unlockedSkins: ['steve'],
            tool: 'wood',
            unlockedTools: ['wood'],
            // Gems & Economy
            gems: 0,
            totalGemsEarned: 0,
            inventory: { wood: 0, stone: 0, iron: 0, gold: 0, diamond: 0, emerald: 0 },
            shopPurchases: [],
            // Pets & Worlds
            unlockedPets: [],
            unlockedWorlds: ['plains'],
            pet: null,
            world: 'plains',
            title: null,
            activePowerups: [],
            bestScores: {},
            dailyStreak: 0,
            lastPlayDate: null,
            // Achievements
            achievements: [],
            // Settings
            settings: {
                sound: true,
                music: true,
                voice: true,
                highContrast: false
            },
            // Session tracking
            sessionStart: Date.now(),
            racesThisSession: 0
        };
    }

    function load() {
        try {
            let raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                raw = localStorage.getItem(STORAGE_KEY + '-backup');
                if (raw) console.warn('Primary save missing, restored from backup');
            }
            data = raw ? { ...getDefault(), ...JSON.parse(raw) } : getDefault();
        } catch (e) {
            data = getDefault();
        }
        // Migration: add missing fields for existing save data
        if (!data.unlockedPets) data.unlockedPets = [];
        if (!data.unlockedWorlds) data.unlockedWorlds = ['plains'];
        if (!data.pet) data.pet = null;
        if (!data.world) data.world = 'plains';
        if (data.title === undefined) data.title = null;
        if (!data.activePowerups) data.activePowerups = [];
        if (!data.bestScores) data.bestScores = {};
        // Fix: recalculate level from actual XP to prevent desync
        let correctLevel = 1;
        while (correctLevel < XP_PER_LEVEL.length && data.xp >= XP_PER_LEVEL[correctLevel]) {
            correctLevel++;
        }
        if (data.level !== correctLevel) {
            data.level = correctLevel;
            save();
        }
        return data;
    }

    function save() {
        if (!data) return;
        try {
            const json = JSON.stringify(data);
            localStorage.setItem(STORAGE_KEY, json);
            try { localStorage.setItem(STORAGE_KEY + '-backup', json); } catch (e2) {}
        } catch (e) {
            console.warn('Word Mine: save failed, storage may be full', e);
        }
    }

    function get() {
        if (!data) load();
        return data;
    }

    function setName(name) { get().name = name; save(); }
    function setGrade(grade) { get().grade = grade; save(); }

    // Skin unlock levels (must match showSkins in main.js)
    const SKIN_UNLOCKS = [
        { id: 'steve', name: 'Steve', level: 0 },
        { id: 'alex', name: 'Alex', level: 3 },
        { id: 'link', name: 'Link', level: 5 },
        { id: 'younglink', name: 'Young Link', level: 7 },
        { id: 'creeper', name: 'Creeper', level: 8 },
        { id: 'zelda', name: 'Zelda', level: 10 },
        { id: 'sheik', name: 'Sheik', level: 12 },
        { id: 'enderman', name: 'Enderman', level: 15 },
        { id: 'diamond', name: 'Diamond', level: 25 }
    ];

    // XP & Leveling
    function addXP(amount) {
        const d = get();
        // Double XP powerup
        if (d.activePowerups && d.activePowerups.includes('double-xp')) {
            amount *= 2;
            const idx = d.activePowerups.indexOf('double-xp');
            d.activePowerups.splice(idx, 1);
        }
        const oldLevel = d.level;
        d.xp += amount;
        // Check level up
        while (d.level < XP_PER_LEVEL.length && d.xp >= XP_PER_LEVEL[d.level]) {
            d.level++;
        }
        save();
        // Mirror XP to BBG ecosystem
        if (typeof OTBEcosystem !== 'undefined') {
            try { OTBEcosystem.addXP(amount, 'word-mine'); } catch (_) {}
        }
        // Check for skin unlocks at new levels
        if (d.level > oldLevel) {
            SKIN_UNLOCKS.forEach(skin => {
                if (skin.level > oldLevel && skin.level <= d.level && !d.unlockedSkins.includes(skin.id)) {
                    unlockSkin(skin.id);
                    document.dispatchEvent(new CustomEvent('skinUnlocked', {
                        detail: { skinId: skin.id, skinName: skin.name }
                    }));
                }
            });
        }
        return d.level;
    }

    function getXPForNext() {
        const d = get();
        if (d.level >= XP_PER_LEVEL.length) return { current: d.xp, needed: d.xp, pct: 100 };
        const prev = XP_PER_LEVEL[d.level - 1] || 0;
        const next = XP_PER_LEVEL[d.level];
        const current = Math.max(0, d.xp - prev);
        const needed = next - prev;
        return { current, needed, pct: Math.min(100, Math.max(0, (current / needed) * 100)) };
    }

    function getRank() {
        const d = get();
        const idx = Math.min(Math.floor(d.level / 4), RANKS.length - 1);
        return RANKS[idx];
    }

    // Sight word tracking
    function recordSightWord(word, correct) {
        const d = get();
        if (!d.sightWords[word]) {
            d.sightWords[word] = { correct: 0, total: 0, recent: [] };
        }
        const w = d.sightWords[word];
        const wasMastered = w.total >= 5 && (w.correct / w.total) >= 0.85;
        const wasLearning = w.total >= 2;
        w.total++;
        if (correct) w.correct++;
        w.recent.push(correct ? 1 : 0);
        if (w.recent.length > 10) w.recent.shift();
        save();
        // Cross-game ecosystem tracking
        if (typeof OTBEcosystem !== 'undefined') {
            OTBEcosystem.recordAnswer('sight-words', 'reading', correct, 0, 'word-mine');
        }

        // Check if word was just mastered
        const nowMastered = w.total >= 5 && (w.correct / w.total) >= 0.85;
        if (nowMastered && !wasMastered) {
            sessionWordsMastered++;
            // Fire milestone at 5, 10, 15, 25, 50
            const milestones = [5, 10, 15, 25, 50];
            if (milestones.includes(sessionWordsMastered) && sessionWordsMastered > lastMilestone) {
                lastMilestone = sessionWordsMastered;
                if (typeof Main !== 'undefined' && Main.showMilestone) {
                    Main.showMilestone(`${sessionWordsMastered} words mastered today!`, '🏆');
                }
            }
        }
        // Track newly learned words (first time getting it right after being new)
        if (correct && !wasLearning && w.total >= 2) {
            sessionWordsLearned++;
            if (sessionWordsLearned === 3) {
                if (typeof Main !== 'undefined' && Main.showMilestone) {
                    Main.showMilestone('Learning new words! Keep going!', '📖');
                }
            }
        }
    }

    function getSightWordAccuracy(word) {
        const d = get();
        const w = d.sightWords[word];
        if (!w || w.total === 0) return null;
        return { accuracy: w.correct / w.total, total: w.total, recent: w.recent };
    }

    function getSightWordMastery(word) {
        const acc = getSightWordAccuracy(word);
        if (!acc) return 'new';
        if (acc.total >= 5 && acc.accuracy >= 0.85) return 'mastered';
        if (acc.total >= 2) return 'learning';
        return 'new';
    }

    // Nonsense word tracking — now with per-pattern tracking
    // Tracks which CVC patterns (endings like -op, -ig, -uz) the child struggles with
    function recordNonsenseWord(correct, word) {
        const d = get();
        d.nonsenseStats.total++;
        if (correct) d.nonsenseStats.correct++;
        d.nonsenseStats.recentAccuracy.push(correct ? 1 : 0);
        if (d.nonsenseStats.recentAccuracy.length > 20) d.nonsenseStats.recentAccuracy.shift();

        // Per-pattern tracking (by ending sound: vowel + final consonant)
        if (word && word.length >= 2) {
            if (!d.nonsenseStats.patterns) d.nonsenseStats.patterns = {};
            const pattern = word.slice(-2); // e.g., "op", "ig", "uz"
            if (!d.nonsenseStats.patterns[pattern]) {
                d.nonsenseStats.patterns[pattern] = { correct: 0, total: 0 };
            }
            d.nonsenseStats.patterns[pattern].total++;
            if (correct) d.nonsenseStats.patterns[pattern].correct++;
        }
        save();
        // Cross-game ecosystem tracking
        if (typeof OTBEcosystem !== 'undefined') {
            OTBEcosystem.recordAnswer('nonsense-words', 'reading', correct, 0, 'word-mine');
        }
    }

    // Get struggling patterns (accuracy below threshold)
    function getStrugglingPatterns(threshold = 0.6, minAttempts = 3) {
        const d = get();
        if (!d.nonsenseStats.patterns) return [];
        const struggling = [];
        Object.entries(d.nonsenseStats.patterns).forEach(([pattern, stats]) => {
            if (stats.total >= minAttempts && (stats.correct / stats.total) < threshold) {
                struggling.push({ pattern, accuracy: stats.correct / stats.total, total: stats.total });
            }
        });
        return struggling.sort((a, b) => a.accuracy - b.accuracy);
    }

    // Topic tracking
    function recordTopic(topic, correct) {
        const d = get();
        if (!d.topicStats[topic]) {
            d.topicStats[topic] = { correct: 0, total: 0, level: 0, recent: [] };
        }
        const t = d.topicStats[topic];
        t.total++;
        if (correct) t.correct++;
        t.recent.push(correct ? 1 : 0);
        if (t.recent.length > 10) t.recent.shift();
        // Adaptive level
        if (t.recent.length >= 8) {
            const recentAcc = t.recent.reduce((a, b) => a + b, 0) / t.recent.length;
            if (recentAcc >= 0.85 && t.level < 7) t.level++;
            else if (recentAcc < 0.45 && t.level > 0) t.level--;
        }
        save();
        // Cross-game ecosystem tracking
        if (typeof OTBEcosystem !== 'undefined') {
            const domain = ['sight-words', 'nonsense', 'letters', 'rhyming', 'syllables', 'vocabulary',
                'comprehension', 'phonics', 'word-families', 'sentence-reading'].includes(topic) ? 'reading' : 'math';
            OTBEcosystem.recordAnswer(topic, domain, correct, t.level, 'word-mine');
        }
    }

    function getTopicLevel(topic) {
        const d = get();
        const t = d.topicStats[topic];
        if (!t) {
            // Default based on grade
            const gradeMap = { prek: 0, k: 2, '1': 4, '2': 6 };
            return gradeMap[d.grade] || 2;
        }
        return t.level;
    }

    // WPM tracking
    function recordWPM(wpm, type = 'sight') {
        const d = get();
        const entry = { wpm, date: Date.now() };
        if (type === 'sight') {
            d.wpmHistory.push(entry);
            if (d.wpmHistory.length > 50) d.wpmHistory.shift();
        } else {
            d.nonsenseWpmHistory.push(entry);
            if (d.nonsenseWpmHistory.length > 50) d.nonsenseWpmHistory.shift();
        }
        save();
    }

    function getLatestWPM(type = 'sight') {
        const d = get();
        const hist = type === 'sight' ? d.wpmHistory : d.nonsenseWpmHistory;
        if (hist.length === 0) return 0;
        return hist[hist.length - 1].wpm;
    }

    // Session
    function recordGameComplete(correct, total, streak) {
        const d = get();
        d.totalRaces++;
        d.totalCorrect += correct;
        d.totalAnswered += total;
        if (streak > d.bestStreak) d.bestStreak = streak;
        d.racesThisSession++;
        save();
    }

    function needsBreak() {
        const d = get();
        if (d.racesThisSession >= 3) return 'suggest';
        if (Date.now() - d.sessionStart > 60 * 60 * 1000) return 'enforce';
        return false;
    }

    // Skins / Tools
    function unlockSkin(id) {
        const d = get();
        if (!d.unlockedSkins.includes(id)) {
            d.unlockedSkins.push(id);
            save();
        }
    }
    function setSkin(id) { get().skin = id; save(); }

    function unlockTool(id) {
        const d = get();
        if (!d.unlockedTools.includes(id)) {
            d.unlockedTools.push(id);
            save();
        }
    }
    function setTool(id) { get().tool = id; save(); }

    // Pets
    function unlockPet(id) {
        const d = get();
        if (!d.unlockedPets) d.unlockedPets = [];
        if (!d.unlockedPets.includes(id)) {
            d.unlockedPets.push(id);
            save();
        }
    }

    function setPet(id) {
        const d = get();
        // Toggle: if same pet, unequip it
        d.pet = (d.pet === id) ? null : id;
        save();
    }

    // Worlds
    function unlockWorld(id) {
        const d = get();
        if (!d.unlockedWorlds) d.unlockedWorlds = ['plains'];
        if (!d.unlockedWorlds.includes(id)) {
            d.unlockedWorlds.push(id);
            save();
        }
    }

    function setWorld(id) {
        const d = get();
        d.world = id;
        save();
    }

    // Titles
    function setTitle(id) {
        const d = get();
        d.title = (d.title === id) ? null : id;
        save();
    }

    // Powerups (single-use, consumed at game start)
    function addPowerup(id) {
        const d = get();
        if (!d.activePowerups) d.activePowerups = [];
        d.activePowerups.push(id);
        save();
    }

    function consumePowerup(id) {
        const d = get();
        if (!d.activePowerups) return false;
        const idx = d.activePowerups.indexOf(id);
        if (idx >= 0) {
            d.activePowerups.splice(idx, 1);
            save();
            return true;
        }
        return false;
    }

    function hasPowerup(id) {
        const d = get();
        return d.activePowerups && d.activePowerups.includes(id);
    }

    // Best scores per mode (keeps top 5)
    function recordBestScore(mode, score, details = {}) {
        const d = get();
        if (!d.bestScores) d.bestScores = {};
        if (!d.bestScores[mode]) d.bestScores[mode] = [];
        d.bestScores[mode].push({ score, date: Date.now(), ...details });
        d.bestScores[mode].sort((a, b) => b.score - a.score);
        d.bestScores[mode] = d.bestScores[mode].slice(0, 5);
        save();
        return d.bestScores[mode];
    }

    function getBestScores(mode, count = 5) {
        const d = get();
        if (!d.bestScores || !d.bestScores[mode]) return [];
        return d.bestScores[mode].slice(0, count);
    }

    // Achievements
    function unlockAchievement(id) {
        const d = get();
        if (!d.achievements.includes(id)) {
            d.achievements.push(id);
            save();
            return true;
        }
        return false;
    }

    function hasAchievement(id) {
        return get().achievements.includes(id);
    }

    // Gems & Inventory
    function addGems(amount) {
        const d = get();
        // Gem Magnet powerup: +2 bonus gems
        if (d.activePowerups && d.activePowerups.includes('gem-magnet')) {
            amount += 2;
            const idx = d.activePowerups.indexOf('gem-magnet');
            d.activePowerups.splice(idx, 1);
        }
        d.gems += amount;
        d.totalGemsEarned += amount;
        save();
        // Mirror gems as coins to BBG ecosystem
        if (typeof OTBEcosystem !== 'undefined') {
            try { OTBEcosystem.addCoins(amount, 'word-mine'); } catch (_) {}
        }
    }

    function spendGems(amount) {
        const d = get();
        if (d.gems >= amount) { d.gems -= amount; save(); return true; }
        return false;
    }

    function addInventoryItem(type, count = 1) {
        const d = get();
        if (!d.inventory) d.inventory = { wood: 0, stone: 0, iron: 0, gold: 0, diamond: 0, emerald: 0 };
        d.inventory[type] = (d.inventory[type] || 0) + count;
        save();
    }

    // Daily streak — returns { streak, isNew } where isNew=true only on first visit of the day
    function checkDailyStreak() {
        const d = get();
        const today = new Date().toDateString();
        if (d.lastPlayDate === today) return { streak: d.dailyStreak, isNew: false };
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (d.lastPlayDate === yesterday) {
            d.dailyStreak = (d.dailyStreak || 0) + 1;
        } else {
            d.dailyStreak = 1;
        }
        d.lastPlayDate = today;
        save();
        return { streak: d.dailyStreak, isNew: true };
    }

    // Get recent WPM history for trend display
    function getRecentWPMs(type = 'sight', count = 5) {
        const d = get();
        const hist = type === 'sight' ? d.wpmHistory : d.nonsenseWpmHistory;
        return hist.slice(-count).map(e => e.wpm);
    }

    // Reset
    function resetAll() {
        data = getDefault();
        save();
    }

    return {
        load, save, get, setName, setGrade,
        addXP, getXPForNext, getRank,
        recordSightWord, getSightWordAccuracy, getSightWordMastery,
        recordNonsenseWord, getStrugglingPatterns, recordTopic, getTopicLevel,
        recordWPM, getLatestWPM, getRecentWPMs,
        recordGameComplete, needsBreak,
        unlockSkin, setSkin, unlockTool, setTool,
        unlockPet, setPet, unlockWorld, setWorld, setTitle,
        addPowerup, consumePowerup, hasPowerup,
        recordBestScore, getBestScores,
        unlockAchievement, hasAchievement,
        addGems, spendGems, addInventoryItem, checkDailyStreak,
        resetAll, RANKS
    };
})();
