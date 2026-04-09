/* ============================================
   SPIDEY ACADEMY — Achievements System
   15 achievements tracking activities, stickers, learning
   ============================================ */
const Achievements = (() => {
    const SAVE_KEY = 'spidey_academy_achievements';

    const definitions = [
        // Getting started
        { id: 'first-play', name: 'First Day!', icon: '🎉', desc: 'Play your first activity' },
        { id: 'all-activities', name: 'Try Everything', icon: '🌈', desc: 'Play all 5 activities' },
        { id: 'ten-correct', name: 'Smart Spider', icon: '🧠', desc: 'Get 10 correct answers' },

        // Activity mastery
        { id: 'color-expert', name: 'Rainbow Vision', icon: '🎨', desc: 'Learn all 6 colors' },
        { id: 'shape-master', name: 'Shape Wizard', icon: '🔷', desc: 'Learn all 6 shapes' },
        { id: 'number-whiz', name: 'Number Hero', icon: '🔢', desc: 'Count up to 10' },
        { id: 'letter-champ', name: 'Letter Explorer', icon: '🔤', desc: 'Learn 10 letters' },
        { id: 'all-letters', name: 'Alphabet Master', icon: '📖', desc: 'Learn all 26 letters' },

        // Stickers & collection
        { id: 'sticker-5', name: 'Sticker Starter', icon: '⭐', desc: 'Earn 5 stickers' },
        { id: 'sticker-15', name: 'Sticker Fan', icon: '🌟', desc: 'Earn 15 stickers' },
        { id: 'sticker-30', name: 'Sticker Champion', icon: '👑', desc: 'Earn all 30 stickers' },

        // Streaks
        { id: 'streak-3', name: 'Web Weaver', icon: '🔥', desc: 'Play 3 days in a row' },
        { id: 'streak-7', name: 'Super Spider', icon: '🔥', desc: 'Play 7 days in a row' },

        // Milestones
        { id: 'fifty-correct', name: 'Brain Power', icon: '💪', desc: 'Get 50 correct answers' },
        { id: 'level-10', name: 'Star Collector', icon: '🏅', desc: 'Reach level 10' }
    ];

    function _load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function _save(earned) {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(earned)); } catch (e) {}
    }

    function _award(id) {
        const earned = _load();
        if (earned.includes(id)) return false;
        earned.push(id);
        _save(earned);
        return true;
    }

    function hasAchievement(id) {
        return _load().includes(id);
    }

    function checkAfterActivity() {
        const newlyEarned = [];
        const d = Progress.data;
        if (!d) return newlyEarned;

        // First play
        if (Object.values(d.activityStats).some(s => s.played > 0)) {
            if (_award('first-play')) newlyEarned.push(get('first-play'));
        }

        // All activities played
        if (Object.values(d.activityStats).every(s => s.played > 0)) {
            if (_award('all-activities')) newlyEarned.push(get('all-activities'));
        }

        // Correct answer milestones
        if (d.totalCorrect >= 10) {
            if (_award('ten-correct')) newlyEarned.push(get('ten-correct'));
        }
        if (d.totalCorrect >= 50) {
            if (_award('fifty-correct')) newlyEarned.push(get('fifty-correct'));
        }

        // Activity-specific mastery
        const colorStats = d.activityStats['color-catch'];
        if (colorStats && colorStats.colorsLearned && colorStats.colorsLearned.length >= 6) {
            if (_award('color-expert')) newlyEarned.push(get('color-expert'));
        }

        const shapeStats = d.activityStats['shape-builder'];
        if (shapeStats && shapeStats.shapesLearned && shapeStats.shapesLearned.length >= 6) {
            if (_award('shape-master')) newlyEarned.push(get('shape-master'));
        }

        const numStats = d.activityStats['number-bugs'];
        if (numStats && numStats.maxNumber >= 10) {
            if (_award('number-whiz')) newlyEarned.push(get('number-whiz'));
        }

        const letterStats = d.activityStats['letter-web'];
        if (letterStats && letterStats.lettersLearned) {
            if (letterStats.lettersLearned.length >= 10) {
                if (_award('letter-champ')) newlyEarned.push(get('letter-champ'));
            }
            if (letterStats.lettersLearned.length >= 26) {
                if (_award('all-letters')) newlyEarned.push(get('all-letters'));
            }
        }

        // Sticker milestones
        const stickerCount = typeof StickerBook !== 'undefined' ? StickerBook.getTotalEarned() : d.stickers.length;
        if (stickerCount >= 5) {
            if (_award('sticker-5')) newlyEarned.push(get('sticker-5'));
        }
        if (stickerCount >= 15) {
            if (_award('sticker-15')) newlyEarned.push(get('sticker-15'));
        }
        if (stickerCount >= 30) {
            if (_award('sticker-30')) newlyEarned.push(get('sticker-30'));
        }

        // Level
        if (d.level >= 10) {
            if (_award('level-10')) newlyEarned.push(get('level-10'));
        }

        // Streak (from ecosystem or local)
        const streak = d.streak || 0;
        if (typeof OTBEcosystem !== 'undefined') {
            const profile = OTBEcosystem.getProfile();
            const ecoStreak = profile.dailyStreak || 0;
            const best = Math.max(streak, ecoStreak);
            if (best >= 3) {
                if (_award('streak-3')) newlyEarned.push(get('streak-3'));
            }
            if (best >= 7) {
                if (_award('streak-7')) newlyEarned.push(get('streak-7'));
            }
        } else {
            if (streak >= 3) {
                if (_award('streak-3')) newlyEarned.push(get('streak-3'));
            }
            if (streak >= 7) {
                if (_award('streak-7')) newlyEarned.push(get('streak-7'));
            }
        }

        return newlyEarned;
    }

    function get(id) {
        return definitions.find(a => a.id === id);
    }

    function getAll() {
        const earned = _load();
        return definitions.map(a => ({
            ...a,
            earned: earned.includes(a.id)
        }));
    }

    function getEarnedCount() {
        return _load().length;
    }

    return {
        definitions,
        checkAfterActivity,
        hasAchievement,
        get,
        getAll,
        getEarnedCount
    };
})();
