/* ============================================
   RHYTHM BLAST — Progress System
   LocalStorage save/load, star tracking, song unlocks
   ============================================ */
const Progress = (() => {
    const SAVE_KEY = 'rhythmblast_progress';

    function _default() {
        return {
            version: 1,
            songStars: {},       // songId -> { stars, highScore, plays }
            totalStars: 0,
            totalXP: 0,
            totalPlays: 0,
            settings: { sfx: true, music: true, voice: true, difficulty: 'easy' },
            createdAt: Date.now()
        };
    }

    function get() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return _default();
            return Object.assign(_default(), JSON.parse(raw));
        } catch (e) {
            return _default();
        }
    }

    function save(data) {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (e) { /* ignore */ }
    }

    function recordSongResult(songId, result) {
        const d = get();
        if (!d.songStars[songId]) {
            d.songStars[songId] = { stars: 0, highScore: 0, plays: 0 };
        }
        const s = d.songStars[songId];
        s.plays++;
        if (result.stars > s.stars) s.stars = result.stars;
        if (result.score > s.highScore) s.highScore = result.score;

        // Recalculate total stars
        d.totalStars = Object.values(d.songStars).reduce((sum, ss) => sum + ss.stars, 0);
        d.totalXP += result.xpEarned || 0;
        d.totalPlays++;

        save(d);
        return d;
    }

    function getSongStars(songId) {
        const d = get();
        return d.songStars[songId] || { stars: 0, highScore: 0, plays: 0 };
    }

    function getTotalStars() {
        return get().totalStars;
    }

    function getLevel() {
        const d = get();
        // Simple level based on total plays
        if (d.totalPlays >= 20) return 3;
        if (d.totalPlays >= 10) return 2;
        if (d.totalPlays >= 3) return 1;
        return 0;
    }

    function getSettings() {
        return get().settings;
    }

    function saveSetting(key, value) {
        const d = get();
        d.settings[key] = value;
        save(d);
        Audio.setSettings(d.settings);
    }

    return {
        get, save, recordSongResult, getSongStars, getTotalStars, getLevel,
        getSettings, saveSetting
    };
})();
