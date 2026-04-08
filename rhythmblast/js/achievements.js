/* ============================================
   RHYTHM BLAST — Achievements System
   15 achievements tracking songs, combos, accuracy
   ============================================ */
const Achievements = (() => {
    const SAVE_KEY = 'rhythmblast_achievements';

    const definitions = [
        // Getting started
        { id: 'first-song', name: 'First Beat', icon: '🎵', desc: 'Complete your first song' },
        { id: 'first-star', name: 'Star Power', icon: '⭐', desc: 'Earn your first star' },
        { id: 'three-stars', name: 'Perfect Rhythm', icon: '🌟', desc: 'Get 3 stars on any song' },

        // Play milestones
        { id: 'ten-plays', name: 'Rhythm Regular', icon: '🎶', desc: 'Play 10 songs' },
        { id: 'fifty-plays', name: 'Beat Master', icon: '🎸', desc: 'Play 50 songs' },
        { id: 'all-songs', name: 'DJ', icon: '🎧', desc: 'Play every song at least once' },

        // Score/accuracy
        { id: 'grade-s', name: 'S Rank!', icon: '💯', desc: 'Get an S grade on any song' },
        { id: 'accuracy-90', name: 'Sharp Ears', icon: '👂', desc: 'Finish a song with 90%+ accuracy' },
        { id: 'accuracy-100', name: 'Flawless', icon: '💎', desc: 'Get 100% accuracy on any song' },

        // Combos
        { id: 'combo-10', name: 'Combo Kid', icon: '🔗', desc: 'Get a 10x combo' },
        { id: 'combo-25', name: 'Combo King', icon: '👑', desc: 'Get a 25x combo' },
        { id: 'combo-50', name: 'Combo Legend', icon: '🔥', desc: 'Get a 50x combo' },

        // Streaks
        { id: 'streak-3', name: 'Getting Groovy', icon: '🔥', desc: 'Play 3 days in a row' },
        { id: 'streak-7', name: 'Weekly Jam', icon: '🔥', desc: 'Play 7 days in a row' },

        // Stars
        { id: 'total-stars-9', name: 'Star Collector', icon: '✨', desc: 'Earn 9 total stars (3 on all songs)' }
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

    function checkAfterSong(result) {
        const newlyEarned = [];
        const prog = Progress.get();

        // First song
        if (prog.totalPlays >= 1) {
            if (_award('first-song')) newlyEarned.push(get('first-song'));
        }

        // First star
        if (result.stars >= 1) {
            if (_award('first-star')) newlyEarned.push(get('first-star'));
        }

        // 3 stars
        if (result.stars >= 3) {
            if (_award('three-stars')) newlyEarned.push(get('three-stars'));
        }

        // Play milestones
        if (prog.totalPlays >= 10) {
            if (_award('ten-plays')) newlyEarned.push(get('ten-plays'));
        }
        if (prog.totalPlays >= 50) {
            if (_award('fifty-plays')) newlyEarned.push(get('fifty-plays'));
        }

        // All songs played
        if (typeof SongData !== 'undefined') {
            const allSongs = SongData.getAllSongs();
            const allPlayed = allSongs.every(s => {
                const stats = prog.songStars[s.id];
                return stats && stats.plays > 0;
            });
            if (allPlayed) {
                if (_award('all-songs')) newlyEarned.push(get('all-songs'));
            }
        }

        // Grade S
        if (result.grade === 'S') {
            if (_award('grade-s')) newlyEarned.push(get('grade-s'));
        }

        // Accuracy milestones
        if (result.accuracy >= 0.9) {
            if (_award('accuracy-90')) newlyEarned.push(get('accuracy-90'));
        }
        if (result.accuracy >= 1.0) {
            if (_award('accuracy-100')) newlyEarned.push(get('accuracy-100'));
        }

        // Combo milestones
        if (result.maxCombo >= 10) {
            if (_award('combo-10')) newlyEarned.push(get('combo-10'));
        }
        if (result.maxCombo >= 25) {
            if (_award('combo-25')) newlyEarned.push(get('combo-25'));
        }
        if (result.maxCombo >= 50) {
            if (_award('combo-50')) newlyEarned.push(get('combo-50'));
        }

        // Total stars across all songs
        if (prog.totalStars >= 9) {
            if (_award('total-stars-9')) newlyEarned.push(get('total-stars-9'));
        }

        // Streak (from ecosystem)
        if (typeof OTBEcosystem !== 'undefined') {
            const profile = OTBEcosystem.getProfile();
            if (profile.dailyStreak >= 3) {
                if (_award('streak-3')) newlyEarned.push(get('streak-3'));
            }
            if (profile.dailyStreak >= 7) {
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
        checkAfterSong,
        hasAchievement,
        get,
        getAll,
        getEarnedCount
    };
})();
