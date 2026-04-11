/**
 * Progress — Save system for Spidey Academy V2
 * Tracks XP, levels, streaks, stickers, badges, activity stars, and adaptive content.
 */
const Progress = (() => {
    const STORAGE_KEY = 'spidey-academy-save';
    const VERSION = 2;
    const XP_PER_LEVEL = 20; // correct answers per level

    const LEVEL_NAMES = [
        'Little Spider',     // 1
        'Web Spinner',       // 2
        'Bug Catcher',       // 3
        'Shape Finder',      // 4
        'Color Spotter',     // 5
        'Number Counter',    // 6
        'Letter Hunter',     // 7
        'Sort Master',       // 8
        'Super Learner',     // 9
        'Star Collector',    // 10
        'Web Builder',       // 11
        'Puzzle Pro',        // 12
        'Brain Hero',        // 13
        'Knowledge Keeper',  // 14
        'Wisdom Seeker',     // 15
        'Power Learner',     // 16
        'Champion Mind',     // 17
        'Master Explorer',   // 18
        'Legend Builder',    // 19
        'Spidey Champion'    // 20
    ];

    // Grade levels: 0=Pre-K, 1=Kindergarten, 2=1st Grade, 3=2nd Grade
    const GRADE_NAMES = ['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade'];

    const DEFAULTS = {
        version: VERSION,
        playerName: '',
        gradeLevel: 0,
        totalCorrect: 0,
        totalAttempts: 0,
        correctSinceLastSticker: 0,
        xp: 0,
        level: 1,
        stickers: [],
        badges: [],
        streak: 0,
        lastPlayDate: null,
        todayFirstPlay: false,
        todayBonusAwarded: false,
        activityStats: {
            'color-catch': { played: 0, correct: 0, attempts: 0, bestStreak: 0, currentStreak: 0, lastStars: 0, colorsLearned: ['red', 'blue'] },
            'shape-builder': { played: 0, correct: 0, attempts: 0, bestStreak: 0, currentStreak: 0, lastStars: 0, shapesLearned: ['circle', 'square', 'triangle'] },
            'number-bugs': { played: 0, correct: 0, attempts: 0, bestStreak: 0, currentStreak: 0, lastStars: 0, maxNumber: 5 },
            'letter-web': { played: 0, correct: 0, attempts: 0, bestStreak: 0, currentStreak: 0, lastStars: 0, lettersLearned: ['A', 'B', 'C', 'O'] },
            'sort-sweep': { played: 0, correct: 0, attempts: 0, bestStreak: 0, currentStreak: 0, lastStars: 0 }
        },
        sessionCount: 0,
        createdAt: Date.now()
    };

    let data = null;
    let _pendingLevelUp = false;

    function _today() {
        return new Date().toISOString().slice(0, 10);
    }

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                data = JSON.parse(JSON.stringify(DEFAULTS));
                save();
                return data;
            }
            const saved = JSON.parse(raw);
            data = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), saved);
            for (const key of Object.keys(DEFAULTS.activityStats)) {
                if (!data.activityStats[key]) {
                    data.activityStats[key] = JSON.parse(JSON.stringify(DEFAULTS.activityStats[key]));
                } else {
                    // Ensure new fields exist (forward compat from V1)
                    const def = DEFAULTS.activityStats[key];
                    for (const f of Object.keys(def)) {
                        if (data.activityStats[key][f] === undefined) {
                            data.activityStats[key][f] = def[f];
                        }
                    }
                }
            }
            // Migrate V1: recalculate level from totalCorrect
            if (!data.xp && data.totalCorrect > 0) {
                data.xp = data.totalCorrect;
                data.level = Math.max(1, Math.min(20, Math.floor(data.xp / XP_PER_LEVEL) + 1));
            }
            // Check daily reset
            _checkDailyReset();
            return data;
        } catch (e) {
            console.warn('[Progress] Failed to load, using defaults:', e);
            data = JSON.parse(JSON.stringify(DEFAULTS));
            return data;
        }
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[Progress] Failed to save:', e);
        }
    }

    function _checkDailyReset() {
        const today = _today();
        if (data.lastPlayDate !== today) {
            // New day
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().slice(0, 10);

            if (data.lastPlayDate === yesterdayStr) {
                data.streak++;
            } else if (data.lastPlayDate) {
                data.streak = 1; // Streak broken
            } else {
                data.streak = 1; // First ever play
            }

            data.todayFirstPlay = true;
            data.todayBonusAwarded = false;
        }
    }

    function recordAnswer(activityId, correct) {
        if (!data) load();
        data.totalAttempts++;
        const stats = data.activityStats[activityId];
        if (stats) stats.attempts++;

        if (correct) {
            data.totalCorrect++;
            data.correctSinceLastSticker++;
            data.xp++;

            // Check level up
            const newLevel = Math.min(20, Math.floor(data.xp / XP_PER_LEVEL) + 1);
            if (newLevel > data.level) {
                data.level = newLevel;
                _pendingLevelUp = true;
            }

            if (stats) {
                stats.correct++;
                stats.currentStreak++;
                if (stats.currentStreak > stats.bestStreak) {
                    stats.bestStreak = stats.currentStreak;
                }
            }
        } else {
            if (stats) stats.currentStreak = 0;
        }
        save();
        return correct;
    }

    function recordActivityPlayed(activityId, roundCorrect, roundTotal) {
        if (!data) load();
        const stats = data.activityStats[activityId];
        if (stats) {
            stats.played++;
            stats.currentStreak = 0;
            // Calculate stars
            if (roundTotal > 0) {
                const pct = roundCorrect / roundTotal;
                stats.lastStars = pct >= 0.8 ? 3 : pct >= 0.6 ? 2 : 1;
            }
        }
        data.lastPlayDate = _today();
        data.todayFirstPlay = false;
        save();
    }

    function consumeLevelUp() {
        if (_pendingLevelUp) {
            _pendingLevelUp = false;
            return data.level;
        }
        return null;
    }

    function isDailyBonus() {
        if (!data) load();
        return data.todayFirstPlay && !data.todayBonusAwarded;
    }

    function claimDailyBonus() {
        if (!data) load();
        data.todayBonusAwarded = true;
        save();
    }

    function shouldAwardSticker() {
        if (!data) load();
        return data.correctSinceLastSticker >= 4;
    }

    function awardSticker(stickerId) {
        if (!data) load();
        if (!data.stickers.includes(stickerId)) {
            data.stickers.push(stickerId);
        }
        data.correctSinceLastSticker = 0;
        save();
        if (typeof OTBEcosystem !== 'undefined') {
            try {
                OTBEcosystem.addXP(15, 'spidey-academy');
                OTBEcosystem.addCoins(5, 'spidey-academy');
            } catch (e) { /* silent */ }
        }
        return stickerId;
    }

    function awardBadge(badgeId) {
        if (!data) load();
        if (!data.badges.includes(badgeId)) {
            data.badges.push(badgeId);
            save();
            return true;
        }
        return false;
    }

    function hasBadge(badgeId) {
        if (!data) load();
        return data.badges.includes(badgeId);
    }

    function getStats(activityId) {
        if (!data) load();
        return data.activityStats[activityId] || {};
    }

    function getStickers() { if (!data) load(); return data.stickers; }
    function getStickerCount() { if (!data) load(); return data.stickers.length; }
    function getPlayerName() {
        if (!data) load();
        // Check shared BBG profile first
        try {
            const activeId = localStorage.getItem('bbg_active_profile');
            if (activeId) {
                const profileData = JSON.parse(localStorage.getItem('bbg_profile_' + activeId) || '{}');
                if (profileData.playerName) return profileData.playerName;
            }
            const shared = JSON.parse(localStorage.getItem('bbg_shared_profile') || '{}');
            if (shared.playerName) return shared.playerName;
        } catch (_) {}
        // Try ecosystem profile as last resort before local data
        try {
            if (typeof OTBEcosystem !== 'undefined') {
                const ep = OTBEcosystem.getProfile();
                if (ep && ep.playerName) return ep.playerName;
            }
        } catch (_) {}
        return data.playerName || 'Player';
    }
    function setPlayerName(name) { if (!data) load(); data.playerName = name; save(); }
    function getLevel() { if (!data) load(); return data.level; }
    function getLevelName() { if (!data) load(); return LEVEL_NAMES[Math.min(data.level - 1, LEVEL_NAMES.length - 1)]; }
    function getXP() { if (!data) load(); return data.xp; }
    function getXPForNextLevel() { return XP_PER_LEVEL; }
    function getXPProgress() { if (!data) load(); return data.xp % XP_PER_LEVEL; }
    function getStreak() { if (!data) load(); return data.streak; }
    function getBadges() { if (!data) load(); return data.badges; }

    function expandContent(activityId, item) {
        if (!data) load();
        const stats = data.activityStats[activityId];
        if (!stats) return;
        if (activityId === 'color-catch' && !stats.colorsLearned.includes(item)) {
            stats.colorsLearned.push(item);
        } else if (activityId === 'shape-builder' && !stats.shapesLearned.includes(item)) {
            stats.shapesLearned.push(item);
        } else if (activityId === 'letter-web' && !stats.lettersLearned.includes(item)) {
            stats.lettersLearned.push(item);
        } else if (activityId === 'number-bugs') {
            stats.maxNumber = Math.min(15, Math.max(stats.maxNumber, item));
        }
        save();
    }

    function getGradeLevel() { if (!data) load(); return data.gradeLevel || 0; }
    function getGradeName() { if (!data) load(); return GRADE_NAMES[data.gradeLevel || 0]; }

    function setGradeLevel(level) {
        if (!data) load();
        data.gradeLevel = Math.max(0, Math.min(3, level));
        save();
    }

    /** Auto-advance grade if player has enough mastery at current grade.
     *  Called after activity completion. Requires 80%+ accuracy over 15+ attempts. */
    function checkGradeAdvance() {
        if (!data) load();
        if (data.gradeLevel >= 3) return false; // Already at max
        if (data.totalAttempts < 15) return false;
        const accuracy = data.totalCorrect / data.totalAttempts;
        // Need 80%+ accuracy and at least level 5 per grade to advance
        const minLevel = (data.gradeLevel + 1) * 5;
        if (accuracy >= 0.8 && data.level >= minLevel) {
            data.gradeLevel++;
            save();
            return data.gradeLevel;
        }
        return false;
    }

    function getTimeGreeting() {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    }

    return {
        load, save, recordAnswer, recordActivityPlayed,
        shouldAwardSticker, awardSticker, awardBadge, hasBadge,
        consumeLevelUp, isDailyBonus, claimDailyBonus,
        getStats, getStickers, getStickerCount,
        getPlayerName, setPlayerName, expandContent,
        getLevel, getLevelName, getXP, getXPForNextLevel, getXPProgress,
        getStreak, getBadges, getTimeGreeting,
        getGradeLevel, getGradeName, setGradeLevel, checkGradeAdvance,
        get data() { return data; }
    };
})();
